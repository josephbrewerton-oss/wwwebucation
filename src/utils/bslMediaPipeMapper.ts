/**
 * src/utils/bslMediaPipeMapper.ts
 *
 * Bidirectional Standard Pose Mapper: St Joseph's BSL 3D Kinematics <-> MediaPipe Holistic
 *
 * Bridges the zero-bloat St Joseph's 3D BSL avatar format with the standard MediaPipe Holistic
 * landmark schema used across open BSL datasets & recognition models (BOBSL, SignON
 * `slr-poseformer-bsl`, SignAvatars, and browser MediaPipe Holistic webcam captures):
 *   - 33 Pose landmarks (indices 0-32; upper body visible, lower body visibility=0)
 *   - 21 Left Hand landmarks (indices 0-20; non-dominant/base signing hand)
 *   - 21 Right Hand landmarks (indices 0-20; dominant signing hand)
 *   - Optional NMF metadata (eyebrows, mouth, headTilt, roleShift)
 *
 * Strictly additive & zero-dependency: does NOT alter any existing BSL sign or SVG renderer.
 */

import {
  BSL_BASE_REST_HAND,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_POSE,
  DOMINANT_REST_WRIST,
  evaluateBslEase,
  interpolatePoint3D,
  solveHandKinematics,
  type BslBaseHandMode,
  type BslHandPose,
  type BslHandShape,
  type BslNmf,
  type BslPalmOrientation,
  type Point3D,
  type SolvedHand3D,
} from './bslAlphabet';
import {
  computeHeadCenter,
  solveBaseHandKinematics,
} from './bslKinematicsEngine';
import {
  signKeyframeToHandPose,
  type BslCategory,
  type BslSign,
  type BslSignKeyframe,
} from './bslLexicon';

/** Standard MediaPipe normalized 3D landmark (image-normalized [0..1] x, y and relative z). */
export interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/** Standard MediaPipe Holistic frame (33 pose + 21 left hand + 21 right hand). */
export interface MediaPipeHolisticFrame {
  timestampMs: number;
  poseLandmarks: MediaPipeLandmark[];      // Always length 33
  leftHandLandmarks: MediaPipeLandmark[];  // Length 21 (non-dominant / base hand)
  rightHandLandmarks: MediaPipeLandmark[]; // Length 21 (dominant signing hand)
  /** Optional non-manual feature metadata preserved alongside standard pose landmarks. */
  nmf?: BslNmf;
  label?: string;
}

/** Standard MediaPipe Holistic sequence for a sign or utterance (e.g., 25 fps for BOBSL/SignON). */
export interface MediaPipeSignSequence {
  schema: 'mediapipe-holistic/1.0';
  id: string;
  gloss: string;
  word: string;
  fps: number;
  frameCount: number;
  coordinateConvention: 'receiver-front-normalized';
  frames: MediaPipeHolisticFrame[];
}

/** Canonical MediaPipe Pose landmark indices (subset used in upper-body signing). */
export const MP_POSE = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;

/** Canonical MediaPipe Hand landmark indices (21 joints per hand). */
export const MP_HAND = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

/**
 * Strictly invertible affine mapping constants between St Joseph's 3D world space
 * and receiver-facing MediaPipe Holistic [0..1] normalized coordinates.
 *
 * World anchors:
 *   Right Shoulder (+56, -15, -20) -> mp (0.30, 0.396, +0.071)
 *   Left Shoulder  (-56, -15, -20) -> mp (0.70, 0.396, +0.071)
 *   Shoulder Width = 112 world units -> 0.40 normalized frame width.
 */
const WORLD_SHOULDER_WIDTH = 112;
const WORLD_SHOULDER_MID: Point3D = { x: 0, y: -15, z: -20 };
const MP_SCALE_X = 280;
const MP_SCALE_Y = 280;
const MP_SCALE_Z = 280;
const MP_ORIGIN_X = 0.5;
const MP_ORIGIN_Y = 0.45;

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function lerp3(a: Point3D, b: Point3D, t: number): Point3D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

function dist3(a: Point3D, b: Point3D): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function sub3(a: Point3D, b: Point3D): Point3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function addScaled3(a: Point3D, dir: Point3D, s: number): Point3D {
  return { x: a.x + dir.x * s, y: a.y + dir.y * s, z: a.z + dir.z * s };
}

function cross3(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function norm3(v: Point3D): Point3D {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < 1e-6) return { x: 0, y: 0, z: 1 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** Maps a St Joseph's 3D world point to standard receiver-facing MediaPipe Holistic coordinates. */
export function worldPointToMediaPipe(pt: Point3D, visibility = 1.0): MediaPipeLandmark {
  const x = Number.isFinite(pt.x) ? pt.x : 0;
  const y = Number.isFinite(pt.y) ? pt.y : 0;
  const z = Number.isFinite(pt.z) ? pt.z : 0;
  return {
    x: round4(MP_ORIGIN_X - x / MP_SCALE_X),
    y: round4(MP_ORIGIN_Y + y / MP_SCALE_Y),
    z: round4(-z / MP_SCALE_Z),
    visibility,
  };
}

/** Exact inverse of `worldPointToMediaPipe`. */
export function mediaPipePointToWorld(lm: MediaPipeLandmark): Point3D {
  const x = Number.isFinite(lm?.x) ? lm.x : MP_ORIGIN_X;
  const y = Number.isFinite(lm?.y) ? lm.y : MP_ORIGIN_Y;
  const z = Number.isFinite(lm?.z) ? lm.z : 0;
  return {
    x: (MP_ORIGIN_X - x) * MP_SCALE_X,
    y: (y - MP_ORIGIN_Y) * MP_SCALE_Y,
    z: -z * MP_SCALE_Z,
  };
}

interface ShoulderNormalization {
  centerX: number;
  centerY: number;
  centerZ: number;
  scale: number;
}

/**
 * Computes shoulder-based normalization so external webcam or BOBSL/SignON MediaPipe captures
 * recorded at arbitrary camera distances/offsets align cleanly with St Joseph's avatar torso.
 */
function computeShoulderNormalization(poseLandmarks?: MediaPipeLandmark[]): ShoulderNormalization | null {
  if (!poseLandmarks || poseLandmarks.length <= MP_POSE.RIGHT_SHOULDER) return null;
  const lSh = poseLandmarks[MP_POSE.LEFT_SHOULDER];
  const rSh = poseLandmarks[MP_POSE.RIGHT_SHOULDER];
  if (!lSh || !rSh) return null;
  if ((lSh.visibility ?? 1) < 0.2 || (rSh.visibility ?? 1) < 0.2) return null;

  const dx = lSh.x - rSh.x;
  const dy = lSh.y - rSh.y;
  const mpShoulderWidth = Math.hypot(dx, dy);
  if (!Number.isFinite(mpShoulderWidth) || mpShoulderWidth < 0.05 || mpShoulderWidth > 1.5) {
    return null;
  }

  return {
    centerX: (lSh.x + rSh.x) * 0.5,
    centerY: (lSh.y + rSh.y) * 0.5,
    centerZ: ((lSh.z || 0) + (rSh.z || 0)) * 0.5,
    scale: WORLD_SHOULDER_WIDTH / mpShoulderWidth,
  };
}

function mapNormalizedMpToWorld(lm: MediaPipeLandmark, norm: ShoulderNormalization | null): Point3D {
  if (!norm) return mediaPipePointToWorld(lm);
  // Note: in receiver-facing MediaPipe, signer's left shoulder has larger x than right shoulder,
  // whereas in St Joseph's world space left shoulder is -X and right shoulder is +X.
  return {
    x: WORLD_SHOULDER_MID.x + (norm.centerX - lm.x) * norm.scale,
    y: WORLD_SHOULDER_MID.y + (lm.y - norm.centerY) * norm.scale,
    z: WORLD_SHOULDER_MID.z - ((lm.z || 0) - norm.centerZ) * norm.scale,
  };
}

/**
 * Expands a SolvedHand3D (wrist + 4 knuckles + 4 tips + thumb + palmNormal) into all
 * 21 standard MediaPipe hand landmarks (0..20) with anatomically realistic PIP/DIP curl.
 */
export function solvedHand3DToMediaPipe21(hand: SolvedHand3D): MediaPipeLandmark[] {
  const dorsal = {
    x: -hand.palmNormal.x,
    y: -hand.palmNormal.y,
    z: -hand.palmNormal.z,
  };

  // Curl magnitude along dorsal normal for intermediate phalanges
  const isCurledShape =
    hand.shape === 'fist' || hand.shape === 'claw' || hand.shape === 'c-shape' || hand.shape === 'pinch';
  const curlAmount =
    hand.shape === 'fist' ? 9 : hand.shape === 'claw' ? 8 : hand.shape === 'c-shape' ? 6.5 : hand.shape === 'pinch' ? 5 : 1.2;

  const makeFinger = (mcp: Point3D, tip: Point3D, forceStraight = false): [Point3D, Point3D, Point3D, Point3D] => {
    const len = dist3(mcp, tip);
    const localCurl = !forceStraight && (isCurledShape || len < 16) ? curlAmount : 0.8;
    const pip = addScaled3(lerp3(mcp, tip, 0.44), dorsal, localCurl);
    const dip = addScaled3(lerp3(mcp, tip, 0.74), dorsal, localCurl * 0.65);
    return [mcp, pip, dip, tip];
  };

  const indexStraight = hand.shape === 'point' || hand.shape === 'point-l' || hand.shape === 'v' || hand.shape === 'flat' || hand.shape === 'flat-closed' || hand.shape === 'spread' || hand.shape === 'flat-spread';
  const midStraight = hand.shape === 'v' || hand.shape === 'flat' || hand.shape === 'flat-closed' || hand.shape === 'spread' || hand.shape === 'flat-spread';
  const ringPinkyStraight = hand.shape === 'flat' || hand.shape === 'flat-closed' || hand.shape === 'spread' || hand.shape === 'flat-spread';

  const thumbIp = lerp3(hand.thumbKnuckle, hand.thumbTip, 0.52);
  const [idxMcp, idxPip, idxDip, idxTip] = makeFinger(hand.knuckleIndex, hand.tipIndex, indexStraight);
  const [midMcp, midPip, midDip, midTip] = makeFinger(hand.kMid, hand.tipMid, midStraight);
  const [rngMcp, rngPip, rngDip, rngTip] = makeFinger(hand.kRing, hand.tipRing, ringPinkyStraight);
  const [pnkMcp, pnkPip, pnkDip, pnkTip] = makeFinger(hand.kPinky, hand.tipPinky, ringPinkyStraight);

  const pts: Point3D[] = [
    hand.wrist,        // 0  WRIST
    hand.thumbBase,    // 1  THUMB_CMC
    hand.thumbKnuckle, // 2  THUMB_MCP
    thumbIp,           // 3  THUMB_IP
    hand.thumbTip,     // 4  THUMB_TIP
    idxMcp,            // 5  INDEX_FINGER_MCP
    idxPip,            // 6  INDEX_FINGER_PIP
    idxDip,            // 7  INDEX_FINGER_DIP
    idxTip,            // 8  INDEX_FINGER_TIP
    midMcp,            // 9  MIDDLE_FINGER_MCP
    midPip,            // 10 MIDDLE_FINGER_PIP
    midDip,            // 11 MIDDLE_FINGER_DIP
    midTip,            // 12 MIDDLE_FINGER_TIP
    rngMcp,            // 13 RING_FINGER_MCP
    rngPip,            // 14 RING_FINGER_PIP
    rngDip,            // 15 RING_FINGER_DIP
    rngTip,            // 16 RING_FINGER_TIP
    pnkMcp,            // 17 PINKY_MCP
    pnkPip,            // 18 PINKY_PIP
    pnkDip,            // 19 PINKY_DIP
    pnkTip,            // 20 PINKY_TIP
  ];

  return pts.map((p) => worldPointToMediaPipe(p, 1.0));
}

/**
 * Exports a single St Joseph's BslHandPose into a complete standard MediaPipe Holistic frame
 * (33 pose landmarks + 21 left-hand landmarks + 21 right-hand landmarks).
 */
export function bslPoseToMediaPipeFrame(
  pose: BslHandPose,
  timestampMs: number = 0,
  progress: number = 0.5
): MediaPipeHolisticFrame {
  const domHand3D = solveHandKinematics(
    pose.targetWrist,
    pose.targetKnuckle,
    pose.targetTip,
    pose.shape,
    pose.palm
  );
  const baseHand3D = solveBaseHandKinematics(domHand3D, pose);

  const headTilt = pose.nmf?.headTilt || 'neutral';
  const head3D = computeHeadCenter(headTilt, progress);
  const roleYaw = pose.nmf?.roleShift?.yaw || 0;
  const yawRad = (roleYaw * Math.PI) / 180;
  const rotBody = (pt: Point3D): Point3D => {
    if (!roleYaw) return pt;
    const c = Math.cos(yawRad);
    const s = Math.sin(yawRad);
    return {
      x: pt.x * c + pt.z * s,
      y: pt.y,
      z: -pt.x * s + pt.z * c,
    };
  };

  const lShoulder = rotBody({ x: -56, y: -15, z: -20 });
  const rShoulder = rotBody({ x: 56, y: -15, z: -20 });
  const lElbow = lerp3(lShoulder, baseHand3D.forearm, 0.58);
  const rElbow = lerp3(rShoulder, domHand3D.forearm, 0.58);

  const zFace = head3D.z + 14;
  const poseLandmarks: MediaPipeLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.95,
    z: 0,
    visibility: 0.0,
  }));

  const setPose = (idx: number, pt: Point3D, vis = 1.0) => {
    poseLandmarks[idx] = worldPointToMediaPipe(pt, vis);
  };

  // Head & Face (0..10)
  setPose(MP_POSE.NOSE, { x: head3D.x, y: head3D.y + 4, z: head3D.z + 18 });
  setPose(MP_POSE.LEFT_EYE_INNER, { x: head3D.x - 4, y: head3D.y - 5, z: zFace });
  setPose(MP_POSE.LEFT_EYE, { x: head3D.x - 7, y: head3D.y - 5, z: zFace });
  setPose(MP_POSE.LEFT_EYE_OUTER, { x: head3D.x - 10, y: head3D.y - 5, z: zFace - 1 });
  setPose(MP_POSE.RIGHT_EYE_INNER, { x: head3D.x + 4, y: head3D.y - 5, z: zFace });
  setPose(MP_POSE.RIGHT_EYE, { x: head3D.x + 7, y: head3D.y - 5, z: zFace });
  setPose(MP_POSE.RIGHT_EYE_OUTER, { x: head3D.x + 10, y: head3D.y - 5, z: zFace - 1 });
  setPose(MP_POSE.LEFT_EAR, { x: head3D.x - 15, y: head3D.y - 2, z: head3D.z - 2 });
  setPose(MP_POSE.RIGHT_EAR, { x: head3D.x + 15, y: head3D.y - 2, z: head3D.z - 2 });
  setPose(MP_POSE.MOUTH_LEFT, { x: head3D.x - 6, y: head3D.y + 13, z: zFace });
  setPose(MP_POSE.MOUTH_RIGHT, { x: head3D.x + 6, y: head3D.y + 13, z: zFace });

  // Upper Body & Arms (11..24)
  setPose(MP_POSE.LEFT_SHOULDER, lShoulder);
  setPose(MP_POSE.RIGHT_SHOULDER, rShoulder);
  setPose(MP_POSE.LEFT_ELBOW, lElbow);
  setPose(MP_POSE.RIGHT_ELBOW, rElbow);
  setPose(MP_POSE.LEFT_WRIST, baseHand3D.wrist);
  setPose(MP_POSE.RIGHT_WRIST, domHand3D.wrist);
  setPose(MP_POSE.LEFT_PINKY, baseHand3D.kPinky);
  setPose(MP_POSE.RIGHT_PINKY, domHand3D.kPinky);
  setPose(MP_POSE.LEFT_INDEX, baseHand3D.knuckleIndex);
  setPose(MP_POSE.RIGHT_INDEX, domHand3D.knuckleIndex);
  setPose(MP_POSE.LEFT_THUMB, baseHand3D.thumbTip);
  setPose(MP_POSE.RIGHT_THUMB, domHand3D.thumbTip);
  setPose(MP_POSE.LEFT_HIP, rotBody({ x: -40, y: 92, z: -18 }), 0.3);
  setPose(MP_POSE.RIGHT_HIP, rotBody({ x: 40, y: 92, z: -18 }), 0.3);

  return {
    timestampMs: Math.round(timestampMs),
    poseLandmarks,
    leftHandLandmarks: solvedHand3DToMediaPipe21(baseHand3D),
    rightHandLandmarks: solvedHand3DToMediaPipe21(domHand3D),
    nmf: pose.nmf ? { ...pose.nmf } : undefined,
    label: pose.label,
  };
}

/**
 * Exports a `BslSign` from `BSL_CURRICULUM_LEXICON` into a fixed-FPS standard MediaPipe Holistic
 * sequence (default 25 fps, matching BOBSL and `signon-project/slr-poseformer-bsl`).
 */
export function bslSignToMediaPipeSequence(
  sign: BslSign,
  options: { fps?: number; msPerKeyframe?: number } = {}
): MediaPipeSignSequence {
  const fps = Math.max(1, Math.min(60, options.fps ?? 25));
  const msPerKeyframe = Math.max(80, options.msPerKeyframe ?? 380);
  const poses: BslHandPose[] = sign.keyframes.map((kf, idx) =>
    signKeyframeToHandPose(sign, kf, idx, sign.keyframes.length)
  );

  return bslStreamToMediaPipeSequence(poses, {
    id: sign.id,
    gloss: sign.gloss || sign.word.toUpperCase(),
    word: sign.word,
    fps,
    msPerKeyframe,
  });
}

/**
 * Exports any BslHandPose stream (sign, phrase, or full BSL Level 6 grammar analysis stream)
 * into a standard MediaPipe Holistic frame sequence sampled at `fps`.
 */
export function bslStreamToMediaPipeSequence(
  poses: BslHandPose[],
  meta: { id: string; gloss: string; word: string; fps?: number; msPerKeyframe?: number }
): MediaPipeSignSequence {
  const fps = Math.max(1, Math.min(60, meta.fps ?? 25));
  const msPerKeyframe = Math.max(80, meta.msPerKeyframe ?? 380);
  const frameStepMs = 1000 / fps;
  const frames: MediaPipeHolisticFrame[] = [];

  if (!poses || poses.length === 0) {
    return {
      schema: 'mediapipe-holistic/1.0',
      id: meta.id,
      gloss: meta.gloss,
      word: meta.word,
      fps,
      frameCount: 0,
      coordinateConvention: 'receiver-front-normalized',
      frames: [],
    };
  }

  let clockMs = 0;
  for (let i = 0; i < poses.length; i++) {
    const prev = i === 0 ? poses[0] : poses[i - 1];
    const curr = poses[i];
    const segMs = i === 0 ? Math.max(frameStepMs, msPerKeyframe * 0.4) : msPerKeyframe;
    const steps = Math.max(1, Math.round(segMs / frameStepMs));

    for (let s = 0; s < steps; s++) {
      const rawT = steps === 1 ? 1 : s / (steps - 1);
      const easedT = evaluateBslEase(curr.ease || 'smooth', rawT);
      const interpPose: BslHandPose = {
        ...curr,
        targetWrist: interpolatePoint3D(prev.targetWrist, curr.targetWrist, easedT),
        targetKnuckle: interpolatePoint3D(prev.targetKnuckle, curr.targetKnuckle, easedT),
        targetTip: interpolatePoint3D(prev.targetTip, curr.targetTip, easedT),
      };
      frames.push(bslPoseToMediaPipeFrame(interpPose, clockMs, rawT));
      clockMs += frameStepMs;
    }

    // Include hold frames if the keyframe specifies a hold pause
    const holdMs = curr.hold && curr.hold > 0 ? curr.hold : 0;
    const holdSteps = Math.round(holdMs / frameStepMs);
    for (let h = 0; h < holdSteps; h++) {
      frames.push(bslPoseToMediaPipeFrame(curr, clockMs, 1.0));
      clockMs += frameStepMs;
    }
  }

  return {
    schema: 'mediapipe-holistic/1.0',
    id: meta.id,
    gloss: meta.gloss,
    word: meta.word,
    fps,
    frameCount: frames.length,
    coordinateConvention: 'receiver-front-normalized',
    frames,
  };
}

/**
 * Infers the closest canonical `BslHandShape` from 21 MediaPipe hand landmarks (in world space).
 */
export function inferHandShapeFromWorld21(pts: Point3D[]): BslHandShape {
  if (!pts || pts.length < 21) return 'flat-closed';

  const wrist = pts[MP_HAND.WRIST];
  const thumbMcp = pts[MP_HAND.THUMB_MCP];
  const thumbTip = pts[MP_HAND.THUMB_TIP];
  const idxMcp = pts[MP_HAND.INDEX_MCP];
  const idxPip = pts[MP_HAND.INDEX_PIP];
  const idxTip = pts[MP_HAND.INDEX_TIP];
  const midMcp = pts[MP_HAND.MIDDLE_MCP];
  const midTip = pts[MP_HAND.MIDDLE_TIP];
  const rngMcp = pts[MP_HAND.RING_MCP];
  const rngTip = pts[MP_HAND.RING_TIP];
  const pnkMcp = pts[MP_HAND.PINKY_MCP];
  const pnkTip = pts[MP_HAND.PINKY_TIP];

  const palmScale = Math.max(8, dist3(wrist, midMcp));

  const isExtended = (mcp: Point3D, tip: Point3D, threshold = 1.32): boolean => {
    const dWristTip = dist3(wrist, tip);
    const dWristMcp = Math.max(4, dist3(wrist, mcp));
    const dMcpTip = dist3(mcp, tip);
    return dWristTip / dWristMcp > threshold && dMcpTip > palmScale * 0.44;
  };

  const idxExt = isExtended(idxMcp, idxTip, 1.32);
  const midExt = isExtended(midMcp, midTip, 1.28);
  const rngExt = isExtended(rngMcp, rngTip, 1.20);
  const pnkExt = isExtended(pnkMcp, pnkTip, 1.08);

  const thumbExt = dist3(thumbMcp, thumbTip) > palmScale * 0.55 && dist3(idxMcp, thumbTip) > palmScale * 0.48;
  const pinchDist = dist3(thumbTip, idxTip);

  // 1. Pinch: thumb and index fingertips nearly touching while other fingers relax
  if (pinchDist < palmScale * 0.32 && !rngExt && !pnkExt) {
    return 'pinch';
  }

  // 2. Point / Point-L: index extended, middle/ring/pinky curled
  if (idxExt && !midExt && !rngExt && !pnkExt) {
    return thumbExt ? 'point-l' : 'point';
  }

  // 3. V-hand: index + middle extended, ring + pinky curled
  if (idxExt && midExt && !rngExt && !pnkExt) {
    return 'v';
  }

  // 4. All 4 fingers extended: distinguish spread vs flat-closed
  if (idxExt && midExt && rngExt && pnkExt) {
    const idxMidTipDist = dist3(idxTip, midTip);
    const idxMidMcpDist = Math.max(4, dist3(idxMcp, midMcp));
    return idxMidTipDist / idxMidMcpDist > 1.32 ? 'spread' : 'flat-closed';
  }

  // 5. Curled/arched fingers: fist tucks fingertips back toward palm/wrist; claw/c-shape arch outward
  const avgWristTipRatio =
    (dist3(wrist, idxTip) / Math.max(4, dist3(wrist, idxMcp)) +
      dist3(wrist, midTip) / Math.max(4, dist3(wrist, midMcp)) +
      dist3(wrist, rngTip) / Math.max(4, dist3(wrist, rngMcp))) /
    3;
  if (avgWristTipRatio < 0.96) {
    return 'fist';
  }

  const idxPipBend = dist3(idxMcp, idxPip) + dist3(idxPip, idxTip) - dist3(idxMcp, idxTip);
  return idxPipBend > palmScale * 0.14 ? 'claw' : 'c-shape';
}

/**
 * Infers canonical `BslPalmOrientation` from 21 MediaPipe hand landmarks (in world space),
 * using the exact inverse cross-product convention of `solveHandKinematics`:
 *   uNormal = normalize((PINKY_MCP - INDEX_MCP) x (INDEX_MCP - WRIST))
 */
export function inferPalmOrientationFromWorld21(pts: Point3D[]): BslPalmOrientation {
  if (!pts || pts.length < 21) return 'in';
  const wrist = pts[MP_HAND.WRIST];
  const idxMcp = pts[MP_HAND.INDEX_MCP];
  const pnkMcp = pts[MP_HAND.PINKY_MCP];

  const uArm = norm3(sub3(idxMcp, wrist));
  const uLat = norm3(sub3(pnkMcp, idxMcp));
  const n = norm3(cross3(uLat, uArm));

  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);

  if (az >= ax && az >= ay) {
    return n.z >= 0 ? 'out' : 'in';
  }
  if (ay >= ax && ay >= az) {
    return n.y >= 0 ? 'down' : 'up';
  }
  return 'side';
}

/**
 * Imports a single standard MediaPipe Holistic frame into a native St Joseph's `BslSignKeyframe`.
 * Automatically normalizes external camera framing via shoulder landmarks when present.
 */
export function mediaPipeFrameToBslKeyframe(
  frame: MediaPipeHolisticFrame,
  options: { label?: string; rule?: string; useShoulderNormalization?: boolean } = {}
): BslSignKeyframe {
  const norm =
    options.useShoulderNormalization !== false
      ? computeShoulderNormalization(frame.poseLandmarks)
      : null;

  const hasRight = Array.isArray(frame.rightHandLandmarks) && frame.rightHandLandmarks.length >= 21;
  const hasLeft = Array.isArray(frame.leftHandLandmarks) && frame.leftHandLandmarks.length >= 21;

  let targetWrist: Point3D = { ...DOMINANT_REST_WRIST };
  let targetKnuckle: Point3D = { ...DOMINANT_REST_KNUCKLE };
  let targetTip: Point3D = { ...DOMINANT_REST_POSE };
  let shape: BslHandShape = 'flat-closed';
  let palm: BslPalmOrientation = 'in';

  if (hasRight) {
    const rightWorld = frame.rightHandLandmarks.slice(0, 21).map((lm) => mapNormalizedMpToWorld(lm, norm));
    targetWrist = rightWorld[MP_HAND.WRIST];
    targetKnuckle = rightWorld[MP_HAND.INDEX_MCP];
    targetTip = rightWorld[MP_HAND.INDEX_TIP];
    shape = inferHandShapeFromWorld21(rightWorld);
    palm = inferPalmOrientationFromWorld21(rightWorld);
  } else if (frame.poseLandmarks && frame.poseLandmarks.length > MP_POSE.RIGHT_INDEX) {
    const rw = frame.poseLandmarks[MP_POSE.RIGHT_WRIST];
    const ri = frame.poseLandmarks[MP_POSE.RIGHT_INDEX];
    if (rw && (rw.visibility ?? 1) > 0.2) {
      targetWrist = mapNormalizedMpToWorld(rw, norm);
      targetKnuckle = ri ? mapNormalizedMpToWorld(ri, norm) : { x: targetWrist.x, y: targetWrist.y - 22, z: targetWrist.z + 8 };
      targetTip = {
        x: targetKnuckle.x + (targetKnuckle.x - targetWrist.x) * 0.9,
        y: targetKnuckle.y + (targetKnuckle.y - targetWrist.y) * 0.9,
        z: targetKnuckle.z + (targetKnuckle.z - targetWrist.z) * 0.9,
      };
    }
  }

  let baseHandMode: BslBaseHandMode = 'rest';
  let baseHandOverride: BslSignKeyframe['baseHandOverride'] | undefined;

  if (hasLeft) {
    const leftWorld = frame.leftHandLandmarks.slice(0, 21).map((lm) => mapNormalizedMpToWorld(lm, norm));
    const lw = leftWorld[MP_HAND.WRIST];
    const lp = lerp3(leftWorld[MP_HAND.WRIST], leftWorld[MP_HAND.MIDDLE_MCP], 0.55);
    const distFromRest = dist3(lw, BSL_BASE_REST_HAND.wrist);

    if (distFromRest > 14) {
      // Detect near-sagittal symmetry for crisp two-handed mirror signs
      const isMirrored =
        Math.abs(lw.x + targetWrist.x) < 14 &&
        Math.abs(lw.y - targetWrist.y) < 14 &&
        Math.abs(lw.z - targetWrist.z) < 18;
      if (isMirrored) {
        baseHandMode = 'mirror';
      } else {
        baseHandMode = 'override';
        baseHandOverride = { wrist: lw, palm: lp };
      }
    }
  }

  return {
    label: options.label || frame.label || 'MediaPipe Pose',
    rule: options.rule || 'Imported from standard MediaPipe Holistic landmarks',
    targetWrist,
    targetKnuckle,
    targetTip,
    shape,
    palm,
    ease: 'smooth',
    baseHandMode,
    baseHandOverride,
    nmf: frame.nmf ? { ...frame.nmf } : { eyebrows: 'neutral', headTilt: 'neutral' },
  };
}

/**
 * Downsamples a standard MediaPipe Holistic sequence (e.g., 25 fps webcam/BOBSL clip)
 * into a compact native `BslSign` ready for `registerBslSigns()` and 60 FPS SVG playback.
 */
export function mediaPipeSequenceToBslSign(
  seq: MediaPipeSignSequence,
  meta: {
    id?: string;
    word?: string;
    gloss?: string;
    category?: BslCategory;
    description?: string;
    maxKeyframes?: number;
    useShoulderNormalization?: boolean;
  } = {}
): BslSign {
  const maxKf = Math.max(2, Math.min(16, meta.maxKeyframes ?? 6));
  const srcFrames = seq.frames || [];
  let sampled: MediaPipeHolisticFrame[] = [];

  if (srcFrames.length <= maxKf) {
    sampled = srcFrames;
  } else {
    for (let i = 0; i < maxKf; i++) {
      const idx = Math.min(srcFrames.length - 1, Math.round((i / (maxKf - 1)) * (srcFrames.length - 1)));
      sampled.push(srcFrames[idx]);
    }
  }

  const word = (meta.word || seq.word || seq.gloss || 'SIGN').trim();
  const gloss = (meta.gloss || seq.gloss || word).trim().toUpperCase();
  const id = (meta.id || seq.id || `mp-${gloss.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`).trim();

  const keyframes: BslSignKeyframe[] = sampled.map((frame, idx) =>
    mediaPipeFrameToBslKeyframe(frame, {
      label: frame.label || `${word} (${idx + 1}/${sampled.length})`,
      rule: `MediaPipe Holistic standardized keyframe ${idx + 1}`,
      useShoulderNormalization: meta.useShoulderNormalization,
    })
  );

  return {
    id,
    word: word.toUpperCase(),
    category: meta.category || 'conversation',
    englishLabel: word,
    gloss,
    description: meta.description || `Standardized MediaPipe Holistic sign for "${word}"`,
    keyframes:
      keyframes.length > 0
        ? keyframes
        : [
            {
              label: word,
              rule: 'Neutral rest fallback',
              targetWrist: { ...DOMINANT_REST_WRIST },
              targetKnuckle: { ...DOMINANT_REST_KNUCKLE },
              targetTip: { ...DOMINANT_REST_POSE },
              shape: 'flat-closed',
              palm: 'in',
              baseHandMode: 'rest',
            },
          ],
  };
}
