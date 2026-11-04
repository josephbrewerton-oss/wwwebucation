/**
 * src/utils/bslKinematicsEngine.ts
 * Pure mathematical projection and kinematics engine for BSL avatar.
 * Zero React hooks, zero JSX, zero DOM allocations.
 */

import {
  Point3D,
  BslHandPose,
  BslBaseHandMode,
  BSL_BASE_HAND,
  BSL_BASE_REST_HAND,
  project3DToSvg,
  solveHandKinematics,
  SolvedHand3D,
} from './bslAlphabet';

export interface CameraConfig {
  yaw: number;
  pitch: number;
  distance: number;
  fov: number;
}

export interface SolvedHand2D {
  wrist: { x: number; y: number; scale: number };
  knuckleIndex: { x: number; y: number; scale: number };
  tipIndex: { x: number; y: number; scale: number };
  palm: { x: number; y: number; scale: number };
  kMid: { x: number; y: number; scale: number };
  kRing: { x: number; y: number; scale: number };
  kPinky: { x: number; y: number; scale: number };
  tipMid: { x: number; y: number; scale: number };
  tipRing: { x: number; y: number; scale: number };
  tipPinky: { x: number; y: number; scale: number };
  thumbBase: { x: number; y: number; scale: number };
  thumbKnuckle: { x: number; y: number; scale: number };
  thumbTip: { x: number; y: number; scale: number };
  forearm: { x: number; y: number; scale: number };
  isExtended: boolean;
}

export interface SolvedFacialLandmarks2D {
  leftBrowOut: { x: number; y: number };
  leftBrowIn: { x: number; y: number };
  rightBrowIn: { x: number; y: number };
  rightBrowOut: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  noseBridge: { x: number; y: number };
  noseTip: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthCenter: { x: number; y: number };
  mouthRight: { x: number; y: number };
  mouthH: number;
}

export interface BslSolvedFrame {
  torsoHead: { x: number; y: number; scale: number };
  torsoChin: { x: number; y: number; scale: number };
  torsoChest: { x: number; y: number; scale: number };
  shoulderViewerLeft: { x: number; y: number; scale: number };
  shoulderViewerRight: { x: number; y: number; scale: number };
  torsoLeftShoulder: { x: number; y: number; scale: number };
  torsoRightShoulder: { x: number; y: number; scale: number };
  face: SolvedFacialLandmarks2D;
  domHand: SolvedHand2D;
  baseHand: SolvedHand2D;
  baseHandMode: BslBaseHandMode;
  baseFingertips: Array<{ id: string; name: string; x: number; y: number; scale: number; idx: number }>;
}



export function computeHeadCenter(headTilt: string, progress: number): Point3D {
  let dx = 0;
  let dy = -72;
  let dz = -15;
  if (headTilt === 'nod') {
    dy += 4 * Math.sin(progress * Math.PI);
    dz += 2;
  } else if (headTilt === 'shake') {
    dx += 6 * Math.sin(progress * Math.PI * 2);
  } else if (headTilt === 'tilt-right') {
    dx += 4;
    dy -= 2;
  } else if (headTilt === 'tilt-left') {
    dx -= 4;
    dy -= 2;
  }
  return { x: dx, y: dy, z: dz };
}

export function projectPoint(
  pt: Point3D,
  camera: CameraConfig,
  panX: number,
  panY: number,
  cameraMode: 'split' | 'body' | 'face',
  zone: 'body' | 'hands',
  headY: number,
  headZ: number,
  roleYaw?: number
): { x: number; y: number; scale: number } {
  let ox = 120 + panX;
  let oy = (cameraMode === 'face' ? 88 : 106) + panY;
  let yShift = cameraMode === 'face' ? headY : 0;
  let zShift = cameraMode === 'face' ? headZ : 0;

  if (cameraMode === 'split') {
    ox = (zone === 'body' ? 66 : 175) + panX;
    oy = (zone === 'body' ? 96 : 104) + panY;
    yShift = 0;
    zShift = 0;
  }

  let px = pt.x;
  let py = pt.y;
  let pz = pt.z;

  if (roleYaw && zone === 'body') {
    const rad = (roleYaw * Math.PI) / 180;
    const cosY = Math.cos(rad);
    const sinY = Math.sin(rad);
    const rx = px * cosY + pz * sinY;
    const rz = -px * sinY + pz * cosY;
    px = rx;
    pz = rz;
  }

  const res = project3DToSvg({ x: px, y: py - yShift, z: pz - zShift }, camera, ox, oy);
  return {
    x: Number.isFinite(res.x) ? res.x : ox,
    y: Number.isFinite(res.y) ? res.y : oy,
    scale: Number.isFinite(res.scale) ? Math.max(0.1, Math.min(3.5, res.scale)) : 1.0,
  };
}

export function projectSolvedHand(
  hand: SolvedHand3D,
  camera: CameraConfig,
  panX: number,
  panY: number,
  cameraMode: 'split' | 'body' | 'face',
  headY: number,
  headZ: number
): SolvedHand2D {
  const p = (pt: Point3D) => projectPoint(pt, camera, panX, panY, cameraMode, 'hands', headY, headZ);
  const isExtended = hand.shape === 'flat' || hand.shape === 'spread' || hand.shape === 'claw';

  return {
    wrist: p(hand.wrist),
    knuckleIndex: p(hand.knuckleIndex),
    tipIndex: p(hand.tipIndex),
    palm: p(hand.palm),
    kMid: p(hand.kMid),
    kRing: p(hand.kRing),
    kPinky: p(hand.kPinky),
    tipMid: p(hand.tipMid),
    tipRing: p(hand.tipRing),
    tipPinky: p(hand.tipPinky),
    thumbBase: p(hand.thumbBase),
    thumbKnuckle: p(hand.thumbKnuckle),
    thumbTip: p(hand.thumbTip),
    forearm: p(hand.forearm),
    isExtended,
  };
}

export function solveBaseHandKinematics(
  domHand3D: SolvedHand3D,
  currentPose: BslHandPose
): SolvedHand3D {
  const mode: BslBaseHandMode = currentPose.baseHandMode || (currentPose.isWholeWordSign ? 'rest' : 'vowel-board');
  const override = currentPose.baseHandOverride;

  if (mode === 'mirror') {
    // True Sagittal Reflection across X: both hands articulate with identical bone mechanics
    return {
      wrist: { x: -domHand3D.wrist.x, y: domHand3D.wrist.y, z: domHand3D.wrist.z },
      knuckleIndex: { x: -domHand3D.knuckleIndex.x, y: domHand3D.knuckleIndex.y, z: domHand3D.knuckleIndex.z },
      tipIndex: { x: -domHand3D.tipIndex.x, y: domHand3D.tipIndex.y, z: domHand3D.tipIndex.z },
      palm: { x: -domHand3D.palm.x, y: domHand3D.palm.y, z: domHand3D.palm.z },
      kMid: { x: -domHand3D.kMid.x, y: domHand3D.kMid.y, z: domHand3D.kMid.z },
      kRing: { x: -domHand3D.kRing.x, y: domHand3D.kRing.y, z: domHand3D.kRing.z },
      kPinky: { x: -domHand3D.kPinky.x, y: domHand3D.kPinky.y, z: domHand3D.kPinky.z },
      tipMid: { x: -domHand3D.tipMid.x, y: domHand3D.tipMid.y, z: domHand3D.tipMid.z },
      tipRing: { x: -domHand3D.tipRing.x, y: domHand3D.tipRing.y, z: domHand3D.tipRing.z },
      tipPinky: { x: -domHand3D.tipPinky.x, y: domHand3D.tipPinky.y, z: domHand3D.tipPinky.z },
      thumbBase: { x: -domHand3D.thumbBase.x, y: domHand3D.thumbBase.y, z: domHand3D.thumbBase.z },
      thumbKnuckle: { x: -domHand3D.thumbKnuckle.x, y: domHand3D.thumbKnuckle.y, z: domHand3D.thumbKnuckle.z },
      thumbTip: { x: -domHand3D.thumbTip.x, y: domHand3D.thumbTip.y, z: domHand3D.thumbTip.z },
      forearm: { x: -domHand3D.forearm.x, y: domHand3D.forearm.y, z: domHand3D.forearm.z },
      shape: domHand3D.shape,
      palmNormal: {
        x: -domHand3D.palmNormal.x,
        y: domHand3D.palmNormal.y,
        z: domHand3D.palmNormal.z,
      },
    };
  }

  if (mode === 'rest') {
    const rw = BSL_BASE_REST_HAND.wrist;
    const rp = BSL_BASE_REST_HAND.palm;
    return {
      wrist: rw,
      knuckleIndex: { x: rp.x + 8, y: rp.y - 12, z: rp.z + 5 },
      tipIndex: BSL_BASE_REST_HAND.fingertips[1],
      palm: rp,
      kMid: { x: rp.x + 18, y: rp.y - 10, z: rp.z + 5 },
      kRing: { x: rp.x + 28, y: rp.y - 8, z: rp.z + 5 },
      kPinky: { x: rp.x + 36, y: rp.y - 6, z: rp.z + 4 },
      tipMid: BSL_BASE_REST_HAND.fingertips[2],
      tipRing: BSL_BASE_REST_HAND.fingertips[3],
      tipPinky: BSL_BASE_REST_HAND.fingertips[4],
      thumbBase: { x: rw.x * 0.5 + rp.x * 0.5, y: rw.y * 0.5 + rp.y * 0.5, z: rw.z },
      thumbKnuckle: { x: rp.x - 8, y: rp.y - 5, z: rp.z + 8 },
      thumbTip: BSL_BASE_REST_HAND.fingertips[0],
      forearm: { x: rw.x - 25, y: rw.y + 35, z: rw.z - 15 },
      shape: 'flat',
      palmNormal: { x: 0, y: 1, z: 0 },
    };
  }

  const sx = override?.shiftX || 0;
  const sy = override?.shiftY || 0;
  const sz = override?.shiftZ || 0;
  const bw: Point3D = override?.wrist || { x: BSL_BASE_HAND.wrist.x + sx, y: BSL_BASE_HAND.wrist.y + sy, z: BSL_BASE_HAND.wrist.z + sz };
  const bp: Point3D = override?.palm || { x: BSL_BASE_HAND.palm.x + sx, y: BSL_BASE_HAND.palm.y + sy, z: BSL_BASE_HAND.palm.z + sz };

  return {
    wrist: bw,
    knuckleIndex: { x: bp.x + 5, y: bp.y - 15, z: bp.z + 4 },
    tipIndex: { x: BSL_BASE_HAND.fingertips[1].x + sx, y: BSL_BASE_HAND.fingertips[1].y + sy, z: BSL_BASE_HAND.fingertips[1].z + sz },
    palm: bp,
    kMid: { x: bp.x + 15, y: bp.y - 18, z: bp.z + 4 },
    kRing: { x: bp.x + 25, y: bp.y - 15, z: bp.z + 4 },
    kPinky: { x: bp.x + 34, y: bp.y - 10, z: bp.z + 4 },
    tipMid: { x: BSL_BASE_HAND.fingertips[2].x + sx, y: BSL_BASE_HAND.fingertips[2].y + sy, z: BSL_BASE_HAND.fingertips[2].z + sz },
    tipRing: { x: BSL_BASE_HAND.fingertips[3].x + sx, y: BSL_BASE_HAND.fingertips[3].y + sy, z: BSL_BASE_HAND.fingertips[3].z + sz },
    tipPinky: { x: BSL_BASE_HAND.fingertips[4].x + sx, y: BSL_BASE_HAND.fingertips[4].y + sy, z: BSL_BASE_HAND.fingertips[4].z + sz },
    thumbBase: { x: bw.x * 0.6 + bp.x * 0.4, y: bw.y * 0.6 + bp.y * 0.4, z: bw.z },
    thumbKnuckle: { x: bp.x - 15, y: bp.y + 5, z: bp.z + 6 },
    thumbTip: { x: BSL_BASE_HAND.fingertips[0].x + sx, y: BSL_BASE_HAND.fingertips[0].y + sy, z: BSL_BASE_HAND.fingertips[0].z + sz },
    forearm: { x: bw.x - 30, y: bw.y + 35, z: bw.z - 15 },
    shape: 'flat',
    palmNormal: { x: 0, y: -1, z: 0 },
  };
}



export function computeBslFrame(
  currentPose: BslHandPose,
  prevPose: BslHandPose,
  interpolatedWrist: Point3D,
  interpolatedKnuckle: Point3D,
  interpolatedTip: Point3D,
  progress: number,
  camera: CameraConfig,
  panX: number,
  panY: number,
  cameraMode: 'split' | 'body' | 'face'
): BslSolvedFrame {
const activeNmf = currentPose.nmf as any;

  // 1. Support both TypeScript 'eyebrows' and Lisp codebook ':brows'
  let rawEyebrowState = activeNmf?.eyebrows || activeNmf?.brows || 'neutral';

  // 2. Extract mouth pattern from nmf.mouth, top-level viseme, or pose label
  const mouthPattern = (
    activeNmf?.mouth ||
    (currentPose as any)?.viseme ||
    currentPose.label ||
    ''
  ).toLowerCase();

  // 3. Fallback inference if eyebrow state is still 'neutral'
  let effectiveEyebrows = rawEyebrowState;
  if (effectiveEyebrows === 'neutral') {
    const label = (currentPose.label || '').toLowerCase();
    const rule = (currentPose.rule || '').toLowerCase();

    // Raise eyebrows for topics, concepts, conditional questions, or theory
    if (
      label.includes('topic') ||
      rule.includes('topic') ||
      mouthPattern.includes('theory') ||
      currentPose.isWholeWordSign
    ) {
      effectiveEyebrows = 'raised';
    }
    // Furrow eyebrows for questions / interrogatives
    else if (
      label.includes('what') ||
      label.includes('why') ||
      label.includes('how') ||
      currentPose.letter === '?'
    ) {
      effectiveEyebrows = 'furrowed';
    }
  }

  // 4. Head tilt & role shift
  const headTilt = activeNmf?.headTilt || activeNmf?.tilt || 'neutral';
  const roleYaw = activeNmf?.roleShift?.yaw;

  const head3D = computeHeadCenter(headTilt, progress);
  const pBody = (pt: Point3D) =>
    projectPoint(pt, camera, panX, panY, cameraMode, 'body', head3D.y, head3D.z, roleYaw);

  const torsoHead = pBody(head3D);
  const torsoChin = pBody({ x: head3D.x, y: head3D.y + 26, z: head3D.z + 5 });
  const torsoChest = pBody({ x: 0, y: -24, z: -15 });
  const torsoLeftShoulder = pBody({ x: cameraMode === 'split' ? -38 : -56, y: -15, z: -20 });
  const torsoRightShoulder = pBody({ x: cameraMode === 'split' ? 38 : 56, y: -15, z: -20 });

  const shoulderViewerLeft =
    torsoLeftShoulder.x <= torsoRightShoulder.x ? torsoLeftShoulder : torsoRightShoulder;
  const shoulderViewerRight =
    torsoLeftShoulder.x > torsoRightShoulder.x ? torsoLeftShoulder : torsoRightShoulder;

  // 5. Eyebrow geometry (single declaration using inferred effectiveEyebrows)
  let browInnerDy =
    effectiveEyebrows === 'raised' ? -5 : effectiveEyebrows === 'furrowed' ? 3 : 0;
  let browOuterDy =
    effectiveEyebrows === 'raised' ? -4 : effectiveEyebrows === 'furrowed' ? -1 : 0;

  // 6. BSL Mouth Morphemes & Mouthing
  let mouthW = cameraMode === 'face' ? 6.5 : cameraMode === 'split' ? 5.0 : 5.5;
  let mouthH = cameraMode === 'face' ? 1.8 : 1.4;
  let mouthCurvature = 0.5; // subtle resting curve

  if (mouthPattern === 'mm') {
    // Ordinary, effortless, steady state (pressed horizontal lips)
    mouthW = cameraMode === 'face' ? 7.0 : 5.2;
    mouthH = 0.6;
    mouthCurvature = 0;
  } else if (mouthPattern === 'th' || mouthPattern === 'tongue') {
    // Careless, accidental, lucky (tongue between teeth)
    mouthW = cameraMode === 'face' ? 6.2 : 4.8;
    mouthH = 2.8;
    mouthCurvature = -0.3;
  } else if (
    mouthPattern === 'pursed' ||
    mouthPattern === 'tight' ||
    mouthPattern.includes('compress')
  ) {
    // Concentration, precision, pressure, strict bounds
    mouthW = cameraMode === 'face' ? 3.6 : 2.6;
    mouthH = 2.0;
    mouthCurvature = -0.8;
  } else if (
    mouthPattern === 'puffed-cheeks' ||
    mouthPattern === 'poo' ||
    mouthPattern === 'puff' ||
    mouthPattern.includes('gas') ||
    mouthPattern.includes('expand')
  ) {
    // Explosion, sudden expansion, high pressure volume
    mouthW = cameraMode === 'face' ? 5.2 : 4.0;
    mouthH = cameraMode === 'face' ? 5.5 : 4.2;
    mouthCurvature = 0;
  } else if (mouthPattern === 'ee' || mouthPattern === 'cs') {
    // Extreme proximity, grit, effort, intensity
    mouthW = cameraMode === 'face' ? 8.5 : 6.8;
    mouthH = 1.4;
    mouthCurvature = 1.0;
  } else if (
    mouthPattern === 'cha' ||
    mouthPattern.includes('billions') ||
    mouthPattern.includes('large') ||
    mouthPattern.includes('huge')
  ) {
    // Enormous size, large quantity, massive scale
    mouthW = cameraMode === 'face' ? 8.0 : 6.2;
    mouthH = cameraMode === 'face' ? 6.0 : 4.6;
    mouthCurvature = 0;
  } else if (mouthPattern === 'good' || mouthPattern === 'thank') {
    mouthW = cameraMode === 'face' ? 9.0 : 7.0;
    mouthH = cameraMode === 'face' ? 3.2 : 2.2;
    mouthCurvature = cameraMode === 'face' ? 3.5 : 2.5;
  } else if (mouthPattern.length > 0) {
    // Lexical mouthing (English word articulation)
    const hasOpenVowel = /[ou]/i.test(mouthPattern);
    mouthW = cameraMode === 'face' ? 7.0 : 5.4;
    mouthH = hasOpenVowel
      ? (cameraMode === 'face' ? 4.2 : 3.2)
      : (cameraMode === 'face' ? 2.4 : 1.8);
    mouthCurvature = 1.0;
  }  const zFace = head3D.z + 14;
  const zNose = head3D.z + 18;

  const face: SolvedFacialLandmarks2D = {
    leftBrowOut: pBody({ x: head3D.x - 11, y: head3D.y - 10 + browOuterDy, z: zFace }),
    leftBrowIn: pBody({ x: head3D.x - 3, y: head3D.y - 11 + browInnerDy, z: zFace + 1 }),
    rightBrowIn: pBody({ x: head3D.x + 3, y: head3D.y - 11 + browInnerDy, z: zFace + 1 }),
    rightBrowOut: pBody({ x: head3D.x + 11, y: head3D.y - 10 + browOuterDy, z: zFace }),
    leftEye: pBody({ x: head3D.x - 7, y: head3D.y - 5, z: zFace }),
    rightEye: pBody({ x: head3D.x + 7, y: head3D.y - 5, z: zFace }),
    noseBridge: pBody({ x: head3D.x, y: head3D.y - 3, z: zNose - 2 }),
    noseTip: pBody({ x: head3D.x, y: head3D.y + 4, z: zNose }),
    mouthLeft: pBody({ x: head3D.x - mouthW, y: head3D.y + 13 - mouthCurvature, z: zFace }),
    mouthCenter: pBody({ x: head3D.x, y: head3D.y + 14, z: zFace + 2 }),
    mouthRight: pBody({ x: head3D.x + mouthW, y: head3D.y + 13 - mouthCurvature, z: zFace }),
    mouthH,
  };

  // Dual hand kinematics
  const shape = currentPose.shape || prevPose.shape || 'flat-closed';
  const palm = currentPose.palm || prevPose.palm || 'in';
  const domHand3D = solveHandKinematics(interpolatedWrist, interpolatedKnuckle, interpolatedTip, shape, palm);
  const baseHand3D = solveBaseHandKinematics(domHand3D, currentPose);

  const domHand = projectSolvedHand(domHand3D, camera, panX, panY, cameraMode, head3D.y, head3D.z);
  const baseHand = projectSolvedHand(baseHand3D, camera, panX, panY, cameraMode, head3D.y, head3D.z);

  const baseFingertips = [
    { id: 'A', name: 'Thumb', x: baseHand.thumbTip.x, y: baseHand.thumbTip.y, scale: baseHand.thumbTip.scale, idx: 0 },
    { id: 'E', name: 'Index', x: baseHand.tipIndex.x, y: baseHand.tipIndex.y, scale: baseHand.tipIndex.scale, idx: 1 },
    { id: 'I', name: 'Middle', x: baseHand.tipMid.x, y: baseHand.tipMid.y, scale: baseHand.tipMid.scale, idx: 2 },
    { id: 'O', name: 'Ring', x: baseHand.tipRing.x, y: baseHand.tipRing.y, scale: baseHand.tipRing.scale, idx: 3 },
    { id: 'U', name: 'Pinky', x: baseHand.tipPinky.x, y: baseHand.tipPinky.y, scale: baseHand.tipPinky.scale, idx: 4 },
  ];

  return {
    torsoHead,
    torsoChin,
    torsoChest,
    shoulderViewerLeft,
    shoulderViewerRight,
    torsoLeftShoulder,
    torsoRightShoulder,
    face,
    domHand,
    baseHand,
    baseHandMode: currentPose.baseHandMode || (currentPose.isWholeWordSign ? 'rest' : 'vowel-board'),
    baseFingertips,
  };
}
