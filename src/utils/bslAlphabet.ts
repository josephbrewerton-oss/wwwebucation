/**
 * src/utils/bslAlphabet.ts
 *
 * St Joseph's Educational Media Suite - British Sign Language (BSL) Kinematic Model
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Complete 3D skeletal target coordinates for the BSL two-handed manual alphabet (A–Z).
 */

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type BslMouthMorpheme =
  | 'open'
  | 'closed'
  | 'smile'
  | 'round'
  | 'f-mouth'
  | 'mm'            // Adverbial: ordinary / effortless / steady
  | 'th'            // Adverbial: careless / accidental / relaxed
  | 'pursed'        // Adverbial: exact / precise / deliberate
  | 'puffed-cheeks' // Adverbial: vast / massive / strenuous
  | 'tight-lips'    // Adverbial: determined / restricted
  | string;

export interface BslRoleShift {
  agent: string;
  yaw: number;             // Torso rotation in degrees (-25 to +25)
  gaze?: Point3D | string; // Gaze orientation target
  elevation?: 'high' | 'mid' | 'low';
}

export interface BslNmf {
  eyebrows?: 'neutral' | 'raised' | 'furrowed';
  mouth?: BslMouthMorpheme;
  headTilt?: 'neutral' | 'nod' | 'shake' | 'tilt-left' | 'tilt-right';
  gaze?: Point3D | string;
  roleShift?: BslRoleShift;
}

export type BslHandShape =
  | 'point'
  | 'point-l'
  | 'flat'
  | 'flat-closed'
  | 'spread'
  | 'flat-spread'
  | 'claw'
  | 'fist'
  | 'v'
  | 'c-shape'
  | 'pinch';

export type BslPalmOrientation = 'in' | 'out' | 'down' | 'up' | 'side' | 'lateral' | Point3D | [number, number, number];

export type BslEaseCurve = 'snap' | 'ease-out' | 'ease-in' | 'smooth' | 'linear' | 'bounce' | string;

export type BslBaseHandMode = 'rest' | 'vowel-board' | 'mirror' | 'override' | 'base-hold' | 'buoy-list' | 'buoy-pointer';

// BSL Level 6 Discourse Buoys (Non-dominant hand sustained spatial anchors)
export type BslBuoyType =
  | 'list-1'     // Index finger extended (item 1)
  | 'list-2'     // Index and middle extended (item 2)
  | 'list-3'     // Thumb, index, middle extended (item 3)
  | 'list-4'     // 4 fingers extended (item 4)
  | 'pointer'    // Index points steadily at locus
  | 'theme';     // Base hand holds topic proform

export interface BslBuoy {
  type: BslBuoyType;
  locus?: string;
  count?: number;
  label?: string;
}

// BSL Level 6 Directional Agreement Verbs
export type BslDirectionalVerbType =
  | 'give'
  | 'teach'
  | 'bless'
  | 'show'
  | 'help'
  | 'send'
  | 'invite';

export interface BslDirectionalAgreement {
  verb: BslDirectionalVerbType;
  fromLocus: string;
  toLocus: string;
  aspect?: BslAspect;
  manner?: string;
}

// BSL Level 6 Instruction Tuple interface for declarative scene choreography
export interface BslLevel6InstructionTuple {
  topic?: string;
  rhQuestion?: string;
  directionalVerb?: BslDirectionalAgreement;
  classifier?: BslClassifierPredicate;
  nmfMouth?: string;
  aspect?: BslAspect;
  buoy?: BslBuoy;
  clauseType?: 'topic' | 'rhq' | 'cause' | 'conditional' | 'consequent';
}

// BSL Level 6 Classifier Types (Polycomponential Predicates)
export type BslClassifierType =
  | 'proform-v'        // CL:V bipedal legs walking/jumping/standing
  | 'proform-1'        // CL:1 upright person/thin long object/trajectory
  | 'proform-b'        // CL:B flat entity (vehicle/boat/plane/surface)
  | 'proform-c'        // CL:C cylindrical entity (chalice/cup/column/trunk)
  | 'proform-claw'     // CL:claw spherical or chunky object
  | 'handling-cup'     // CL:handling reverent two-handed chalice manipulation
  | 'handling-book'    // CL:handling open sacred book / text
  | 'handling-pen'     // CL:handling precision writing / tracing
  | 'trace-line';      // CL:SASS tracing line / contour

// BSL Level 6 Temporal Aspect Modulations
export type BslAspect =
  | 'neutral'          // Standard single execution
  | 'durative'         // Continuous, slow elliptical repetition (studying, pacing)
  | 'habitual'         // Rhythmic frequent iterative pulses (daily prayer, regular duty)
  | 'intensive'        // Sharp hesitation followed by explosive acceleration & rigid snap stop
  | 'inceptive';       // Distinct initial hesitation before clean departure

export interface BslClassifierPredicate {
  type: BslClassifierType;
  aspect?: BslAspect;
  fromLocus?: string;
  toLocus?: string;
  manner?: 'slow' | 'fast' | 'stumble' | 'steady' | 'zig-zag';
  entityLabel?: string;
  baseHold?: {
    shape: BslHandShape;
    locus?: string;
  };
}

export interface BslHandPose {
  letter: string;
  label: string;
  rule: string;
  isVowel: boolean;
  targetTip: Point3D;
  targetKnuckle: Point3D;
  targetWrist: Point3D;
  activeVowelIndex?: number; // 0=A (Thumb), 1=E (Index), 2=I (Middle), 3=O (Ring), 4=U (Pinky)
  nmf?: BslNmf;
  shape?: BslHandShape;
  palm?: BslPalmOrientation;
  hold?: number;
  ease?: BslEaseCurve;
  isWholeWordSign?: boolean;
  baseHandMode?: BslBaseHandMode;
  baseHandOverride?: {
    wrist?: Point3D;
    palm?: Point3D;
    shiftX?: number;
    shiftY?: number;
    shiftZ?: number;
  };
  classifier?: BslClassifierPredicate;
  aspect?: BslAspect;
  buoy?: BslBuoy;
}

// Fixed anatomical non-dominant base hand coordinates (The "Paper" for BANZSL fingerspelling)
export const BSL_BASE_HAND = {
  wrist: { x: -60, y: 80, z: 0 },
  palm: { x: -50, y: 30, z: 10 },
  fingertips: [
    { id: 'A', name: 'Thumb', x: -95, y: 10, z: 15 },
    { id: 'E', name: 'Index', x: -75, y: -40, z: 18 },
    { id: 'I', name: 'Middle', x: -50, y: -50, z: 20 },
    { id: 'O', name: 'Ring', x: -28, y: -42, z: 16 },
    { id: 'U', name: 'Pinky', x: -10, y: -25, z: 12 },
  ]
};

// Relaxed resting coordinates for the non-dominant hand when not used as a base
export const BSL_BASE_REST_HAND = {
  wrist: { x: -85, y: 110, z: -10 },
  palm: { x: -70, y: 85, z: -5 },
  fingertips: [
    { id: 'A', name: 'Thumb', x: -80, y: 70, z: 0 },
    { id: 'E', name: 'Index', x: -65, y: 60, z: 0 },
    { id: 'I', name: 'Middle', x: -50, y: 62, z: 0 },
    { id: 'O', name: 'Ring', x: -38, y: 68, z: 0 },
    { id: 'U', name: 'Pinky', x: -28, y: 75, z: 0 },
  ],
};

// Dominant pointer hand neutral rest position (The "Pen")
export const DOMINANT_REST_POSE: Point3D = { x: 70, y: 35, z: 5 };
export const DOMINANT_REST_KNUCKLE: Point3D = { x: 95, y: 50, z: -5 };
export const DOMINANT_REST_WRIST: Point3D = { x: 135, y: 90, z: -20 };

/**
 * Anatomical 3D Target Coordinates for the BSL 2-Handed Manual Alphabet
 */
export const BSL_ALPHABET_POSES: Record<string, BslHandPose> = {
  'A': {
    letter: 'A',
    label: 'Vowel A (Thumb Tip)',
    rule: 'Dominant index touches non-dominant thumb tip',
    isVowel: true,
    activeVowelIndex: 0,
    targetTip: { x: -95, y: 10, z: 16 },
    targetKnuckle: { x: -35, y: 25, z: 8 },
    targetWrist: { x: 30, y: 70, z: -10 }
  },
  'B': {
    letter: 'B',
    label: 'Consonant B (Two Circles)',
    rule: 'Both hands join index and thumb into joined double loops',
    isVowel: false,
    targetTip: { x: -45, y: -10, z: 15 },
    targetKnuckle: { x: 10, y: 15, z: 5 },
    targetWrist: { x: 75, y: 65, z: -10 }
  },
  'C': {
    letter: 'C',
    label: 'Consonant C (Curved Arc)',
    rule: 'Dominant hand curves into a C shape facing non-dominant thumb/index web',
    isVowel: false,
    targetTip: { x: -65, y: -12, z: 15 },
    targetKnuckle: { x: -10, y: 10, z: 8 },
    targetWrist: { x: 55, y: 65, z: -10 }
  },
  'D': {
    letter: 'D',
    label: 'Consonant D (Index Loop)',
    rule: 'Dominant index and thumb form a circle touching non-dominant index',
    isVowel: false,
    targetTip: { x: -75, y: -30, z: 18 },
    targetKnuckle: { x: -15, y: -5, z: 10 },
    targetWrist: { x: 50, y: 55, z: -10 }
  },
  'E': {
    letter: 'E',
    label: 'Vowel E (Index Tip)',
    rule: 'Dominant index touches non-dominant index fingertip',
    isVowel: true,
    activeVowelIndex: 1,
    targetTip: { x: -75, y: -40, z: 18 },
    targetKnuckle: { x: -15, y: -15, z: 10 },
    targetWrist: { x: 45, y: 45, z: -10 }
  },
  'F': {
    letter: 'F',
    label: 'Consonant F (Crossed Fingers)',
    rule: 'Dominant index and middle fingers cross over non-dominant index and middle',
    isVowel: false,
    targetTip: { x: -62, y: -45, z: 19 },
    targetKnuckle: { x: -5, y: -18, z: 10 },
    targetWrist: { x: 55, y: 45, z: -10 }
  },
  'G': {
    letter: 'G',
    label: 'Consonant G (Fist Stack)',
    rule: 'Dominant fist rests directly on top of non-dominant fist',
    isVowel: false,
    targetTip: { x: -50, y: 15, z: 15 },
    targetKnuckle: { x: 0, y: 25, z: 10 },
    targetWrist: { x: 60, y: 70, z: -10 }
  },
  'H': {
    letter: 'H',
    label: 'Consonant H (Palm Sweep)',
    rule: 'Dominant open palm brushes along non-dominant palm toward fingertips',
    isVowel: false,
    targetTip: { x: -50, y: 5, z: 14 },
    targetKnuckle: { x: 5, y: 20, z: 8 },
    targetWrist: { x: 65, y: 65, z: -10 }
  },
  'I': {
    letter: 'I',
    label: 'Vowel I (Middle Tip)',
    rule: 'Dominant index touches non-dominant middle fingertip',
    isVowel: true,
    activeVowelIndex: 2,
    targetTip: { x: -50, y: -50, z: 20 },
    targetKnuckle: { x: 10, y: -20, z: 12 },
    targetWrist: { x: 65, y: 40, z: -10 }
  },
  'J': {
    letter: 'J',
    label: 'Consonant J (Swoop Stroke)',
    rule: 'Dominant index touches middle fingertip and swoops into center palm',
    isVowel: false,
    targetTip: { x: -50, y: -10, z: 15 },
    targetKnuckle: { x: 15, y: 15, z: 10 },
    targetWrist: { x: 75, y: 65, z: -10 }
  },
  'K': {
    letter: 'K',
    label: 'Consonant K (Hook Knuckle)',
    rule: 'Dominant index hooks against the side knuckle of non-dominant index',
    isVowel: false,
    targetTip: { x: -65, y: -18, z: 16 },
    targetKnuckle: { x: -8, y: 0, z: 10 },
    targetWrist: { x: 55, y: 55, z: -10 }
  },
  'L': {
    letter: 'L',
    label: 'Consonant L (Palm Rest)',
    rule: 'Dominant index rests flat across the non-dominant open palm',
    isVowel: false,
    targetTip: { x: -50, y: 20, z: 13 },
    targetKnuckle: { x: 5, y: 25, z: 8 },
    targetWrist: { x: 65, y: 70, z: -10 }
  },
  'M': {
    letter: 'M',
    label: 'Consonant M (3-Finger Rest)',
    rule: 'Dominant index, middle, and ring fingers rest flat on non-dominant palm',
    isVowel: false,
    targetTip: { x: -50, y: 22, z: 12 },
    targetKnuckle: { x: 10, y: 28, z: 8 },
    targetWrist: { x: 70, y: 72, z: -10 }
  },
  'N': {
    letter: 'N',
    label: 'Consonant N (2-Finger Rest)',
    rule: 'Dominant index and middle fingers rest flat on non-dominant palm',
    isVowel: false,
    targetTip: { x: -50, y: 24, z: 12 },
    targetKnuckle: { x: 10, y: 30, z: 8 },
    targetWrist: { x: 70, y: 74, z: -10 }
  },
  'O': {
    letter: 'O',
    label: 'Vowel O (Ring Tip)',
    rule: 'Dominant index touches non-dominant ring fingertip',
    isVowel: true,
    activeVowelIndex: 3,
    targetTip: { x: -28, y: -42, z: 16 },
    targetKnuckle: { x: 30, y: -15, z: 10 },
    targetWrist: { x: 85, y: 45, z: -10 }
  },
  'P': {
    letter: 'P',
    label: 'Consonant P (Circle Stem)',
    rule: 'Dominant index and thumb form a loop touching vertical non-dominant index',
    isVowel: false,
    targetTip: { x: -75, y: -22, z: 18 },
    targetKnuckle: { x: -18, y: 2, z: 10 },
    targetWrist: { x: 45, y: 60, z: -10 }
  },
  'Q': {
    letter: 'Q',
    label: 'Consonant Q (Thumb Ring)',
    rule: 'Dominant index and thumb form circle around the base of non-dominant thumb',
    isVowel: false,
    targetTip: { x: -80, y: 15, z: 15 },
    targetKnuckle: { x: -20, y: 28, z: 10 },
    targetWrist: { x: 40, y: 75, z: -10 }
  },
  'R': {
    letter: 'R',
    label: 'Consonant R (Hooked Palm)',
    rule: 'Dominant curved index finger rests curved in the center palm',
    isVowel: false,
    targetTip: { x: -50, y: 20, z: 14 },
    targetKnuckle: { x: 8, y: 26, z: 9 },
    targetWrist: { x: 68, y: 70, z: -10 }
  },
  'S': {
    letter: 'S',
    label: 'Consonant S (Pinky Hook)',
    rule: 'Dominant curved pinky hooks around the non-dominant pinky',
    isVowel: false,
    targetTip: { x: -10, y: -15, z: 12 },
    targetKnuckle: { x: 45, y: 0, z: 8 },
    targetWrist: { x: 95, y: 55, z: -10 }
  },
  'T': {
    letter: 'T',
    label: 'Consonant T (Side Touch)',
    rule: 'Dominant index touches the lower outer side of non-dominant hand',
    isVowel: false,
    targetTip: { x: -20, y: 45, z: 10 },
    targetKnuckle: { x: 38, y: 48, z: 6 },
    targetWrist: { x: 92, y: 80, z: -10 }
  },
  'U': {
    letter: 'U',
    label: 'Vowel U (Pinky Tip)',
    rule: 'Dominant index touches non-dominant pinky fingertip',
    isVowel: true,
    activeVowelIndex: 4,
    targetTip: { x: -10, y: -25, z: 12 },
    targetKnuckle: { x: 45, y: -5, z: 8 },
    targetWrist: { x: 95, y: 50, z: -10 }
  },
  'V': {
    letter: 'V',
    label: 'Consonant V (Victory Rest)',
    rule: 'Dominant index and middle spread into a V shape resting on non-dominant palm',
    isVowel: false,
    targetTip: { x: -50, y: 15, z: 14 },
    targetKnuckle: { x: 10, y: 24, z: 8 },
    targetWrist: { x: 70, y: 68, z: -10 }
  },
  'W': {
    letter: 'W',
    label: 'Consonant W (Interlock)',
    rule: 'Dominant fingers interlock with non-dominant fingers',
    isVowel: false,
    targetTip: { x: -50, y: -15, z: 15 },
    targetKnuckle: { x: 8, y: 5, z: 10 },
    targetWrist: { x: 65, y: 55, z: -10 }
  },
  'X': {
    letter: 'X',
    label: 'Consonant X (Crossed Index)',
    rule: 'Dominant index crosses over non-dominant index forming an X',
    isVowel: false,
    targetTip: { x: -75, y: -25, z: 18 },
    targetKnuckle: { x: -15, y: -2, z: 10 },
    targetWrist: { x: 45, y: 55, z: -10 }
  },
  'Y': {
    letter: 'Y',
    label: 'Consonant Y (Thumb-Index Web)',
    rule: 'Dominant index rests in the V web between non-dominant thumb and index',
    isVowel: false,
    targetTip: { x: -80, y: -10, z: 16 },
    targetKnuckle: { x: -20, y: 8, z: 10 },
    targetWrist: { x: 40, y: 65, z: -10 }
  },
  'Z': {
    letter: 'Z',
    label: 'Consonant Z (Palm Heel)',
    rule: 'Dominant bent hand rests along the heel of non-dominant palm',
    isVowel: false,
    targetTip: { x: -45, y: 60, z: 10 },
    targetKnuckle: { x: 12, y: 58, z: 6 },
    targetWrist: { x: 72, y: 85, z: -10 }
  },
};

/**
 * Smooth Hermite S-Curve Interpolation between 3D vectors
 */
export function lerp3D(a: Point3D, b: Point3D, t: number): Point3D {
  const clampedT = Math.max(0, Math.min(1, t));
  // Smooth cubic ease in-out: 3t² - 2t³
  const smooth = clampedT * clampedT * (3 - 2 * clampedT);
  return {
    x: a.x + (b.x - a.x) * smooth,
    y: a.y + (b.y - a.y) * smooth,
    z: a.z + (b.z - a.z) * smooth,
  };
}
export const interpolatePoint3D = lerp3D;

/**
 * Pure 2-handed fingerspelling letter stream generator (BANZSL manual alphabet)
 */
export function decomposeTextToBslStream(text: string): BslHandPose[] {
  if (!text || typeof text !== 'string') return [];
  const clean = text.toUpperCase().replace(/[^A-Z\s]/g, '');
  const poses: BslHandPose[] = [];

  for (const char of clean) {
    if (char === ' ') {
      poses.push({
        letter: ' ',
        label: 'Pause / Space',
        rule: 'Brief neutral hand return',
        isVowel: false,
        targetTip: DOMINANT_REST_POSE,
        targetKnuckle: DOMINANT_REST_KNUCKLE,
        targetWrist: DOMINANT_REST_WRIST,
      });
    } else if (BSL_ALPHABET_POSES[char]) {
      poses.push(BSL_ALPHABET_POSES[char]);
    }
  }

  return poses;
}

/**
 * 3D Perspective Projection for SVG Canvas
 */
export function project3DToSvg(
  point: Point3D,
  camera: { yaw: number; pitch: number; distance: number; fov: number },
  originX = 400,
  originY = 240
): { x: number; y: number; scale: number; depth: number } {
  // ⚡ High-performance WebAssembly 3D Kernel (docs/WASM_ARCHITECTURE_CONTRACT.md Page 4)
  if (typeof window !== 'undefined' && (window as any).AST3DWasmBridge?.isReady) {
    const wasmRes = (window as any).AST3DWasmBridge.projectPoint(point.x, point.y, point.z, camera, originX, originY);
    if (wasmRes) {
      return {
        x: wasmRes.x,
        y: wasmRes.y,
        scale: wasmRes.scale,
        depth: wasmRes.z,
      };
    }
  }

  const radYaw = (camera.yaw * Math.PI) / 180;
  const radPitch = (camera.pitch * Math.PI) / 180;

  // 1. Yaw rotation (Y-axis)
  const cosY = Math.cos(radYaw);
  const sinY = Math.sin(radYaw);
  const x1 = point.x * cosY + point.z * sinY;
  const y1 = point.y;
  const z1 = -point.x * sinY + point.z * cosY;

  // 2. Pitch rotation (X-axis)
  const cosP = Math.cos(radPitch);
  const sinP = Math.sin(radPitch);
  const x2 = x1;
  const y2 = y1 * cosP - z1 * sinP;
  const z2 = y1 * sinP + z1 * cosP;

  // 3. Perspective Projection divide
  const focal = camera.distance || 400;
  const depthZ = z2 + focal;
  const safeDepth = depthZ > 20 ? depthZ : 20;
  const scale = focal / safeDepth;

  return {
    x: originX + x2 * scale,
    y: originY + y2 * scale,
    scale,
    depth: z2,
  };
}

/**
 * Easing profile evaluator for BSL keyframes
 */
export function evaluateBslEase(ease: BslEaseCurve | undefined, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  const curve = (ease || 'ease-out').toLowerCase().replace(/^:/, '');
  switch (curve) {
    case 'linear':
      return clamped;
    case 'snap':
      return clamped < 0.2 ? 0 : 1;
    case 'bounce': {
      const n1 = 7.5625;
      const d1 = 2.75;
      let x = clamped;
      if (x < 1 / d1) {
        return n1 * x * x;
      } else if (x < 2 / d1) {
        x -= 1.5 / d1;
        return n1 * x * x + 0.75;
      } else if (x < 2.5 / d1) {
        x -= 2.25 / d1;
        return n1 * x * x + 0.9375;
      } else {
        x -= 2.625 / d1;
        return n1 * x * x + 0.984375;
      }
    }
    case 'ease-out':
    default:
      // Smooth Hermite cubic ease out
      return clamped * clamped * (3 - 2 * clamped);
  }
}

export interface BslSolvedDominantHand {
  wrist: Point3D;
  knuckleIndex: Point3D;
  tipIndex: Point3D;
  palm: Point3D;
  kMid: Point3D;
  kRing: Point3D;
  kPinky: Point3D;
  tipMid: Point3D;
  tipRing: Point3D;
  tipPinky: Point3D;
  thumbBase: Point3D;
  thumbKnuckle: Point3D;
  thumbTip: Point3D;
  forearm: Point3D;
  shape: BslHandShape;
  palmNormal: Point3D;
}

/**
 * Procedural BSL Hand Posture Matrix & Kinematic Bone Solver
 * Computes complete 3D skeletal landmark positions for dominant signing hand,
 * taking into account handshape archetype and wrist axial roll (pronation/supination).
 */
export function solveHandKinematics(
  wrist: Point3D,
  knuckle: Point3D,
  tip: Point3D,
  shapeInput?: BslHandShape,
  palmInput?: BslPalmOrientation
): BslSolvedDominantHand {
  const w = wrist;
  const k = knuckle;
  
  // Guard against coordinate space explosion by clamping tip reach from knuckle
  const MAX_REACH = 45;
  const rawDx = tip.x - k.x;
  const rawDy = tip.y - k.y;
  const rawDz = tip.z - k.z;
  const rawDist = Math.hypot(rawDx, rawDy, rawDz) || 1;
  const clampedDist = Math.min(MAX_REACH, rawDist);
  const t: Point3D = {
    x: k.x + (rawDx / rawDist) * clampedDist,
    y: k.y + (rawDy / rawDist) * clampedDist,
    z: k.z + (rawDz / rawDist) * clampedDist,
  };

  const shape: BslHandShape = shapeInput || 'flat-closed';

  // 1. Arm vector along index pointing axis
  const fx = k.x - w.x;
  const fy = k.y - w.y;
  const fz = k.z - w.z;
  const fLen = Math.hypot(fx, fy, fz) || 1;
  const ufx = fx / fLen;
  const ufy = fy / fLen;
  const ufz = fz / fLen;

  // 2. Default reference lateral vector (perpendicular to arm and vertical)
  const defaultLatX = -ufy * 0.9;
  const defaultLatY = ufx * 0.9;
  const defaultLatZ = 0.4;
  const defaultLatLen = Math.hypot(defaultLatX, defaultLatY, defaultLatZ) || 1;
  let ulx = defaultLatX / defaultLatLen;
  let uly = defaultLatY / defaultLatLen;
  let ulz = defaultLatZ / defaultLatLen;

  // 3. Compute palm normal orientation from :palm attribute (wrist axial roll)
  let targetNormal: Point3D | null = null;
  if (palmInput) {
    if (typeof palmInput === 'string') {
      const p = palmInput.toLowerCase().replace(/^:/, '');
      if (p === 'in') targetNormal = { x: 0, y: 0, z: -1 }; // towards chest
      else if (p === 'out') targetNormal = { x: 0, y: 0, z: 1 }; // towards receiver
      else if (p === 'down') targetNormal = { x: 0, y: 1, z: 0 }; // prone (downwards)
      else if (p === 'up') targetNormal = { x: 0, y: -1, z: 0 }; // supine (upwards)
      else if (p === 'side') targetNormal = { x: -1, y: 0, z: 0 }; // vertical edge
    } else if (Array.isArray(palmInput) && palmInput.length >= 3) {
      targetNormal = { x: Number(palmInput[0]) || 0, y: Number(palmInput[1]) || 0, z: Number(palmInput[2]) || 0 };
    } else if (typeof palmInput === 'object' && 'x' in palmInput) {
      targetNormal = palmInput;
    }
  }

  let unormX = 0;
  let unormY = 0;
  let unormZ = 1;

  if (targetNormal) {
    // Project target normal onto the plane orthogonal to arm vector (uf)
    const dot = targetNormal.x * ufx + targetNormal.y * ufy + targetNormal.z * ufz;
    const projX = targetNormal.x - dot * ufx;
    const projY = targetNormal.y - dot * ufy;
    const projZ = targetNormal.z - dot * ufz;
    const projLen = Math.hypot(projX, projY, projZ);

    if (projLen > 0.001) {
      unormX = projX / projLen;
      unormY = projY / projLen;
      unormZ = projZ / projLen;

      // Recompute lateral vector as cross product: uLateral = uArm x uNormal
      const crossX = ufy * unormZ - ufz * unormY;
      const crossY = ufz * unormX - ufx * unormZ;
      const crossZ = ufx * unormY - ufy * unormX;
      const crossLen = Math.hypot(crossX, crossY, crossZ) || 1;
      ulx = crossX / crossLen;
      uly = crossY / crossLen;
      ulz = crossZ / crossLen;
    }
  } else {
    // Reference normal = uf x ul
    const unx = ufy * ulz - ufz * uly;
    const uny = ufz * ulx - ufx * ulz;
    const unz = ufx * uly - ufy * ulx;
    const unLen = Math.hypot(unx, uny, unz) || 1;
    unormX = unx / unLen;
    unormY = uny / unLen;
    unormZ = unz / unLen;
  }

  // 4. Palm center of dominant hand
  const palm: Point3D = {
    x: w.x * 0.5 + k.x * 0.5 + ulx * 12,
    y: w.y * 0.5 + k.y * 0.5 + uly * 12,
    z: w.z * 0.5 + k.z * 0.5 + ulz * 12,
  };

  // Knuckles for middle, ring, pinky
  const kMid: Point3D = {
    x: k.x + ulx * 14 - ufx * 3,
    y: k.y + uly * 14 - ufy * 3,
    z: k.z + ulz * 14 - ufz * 3,
  };
  const kRing: Point3D = {
    x: k.x + ulx * 25 - ufx * 7,
    y: k.y + uly * 25 - ufy * 7,
    z: k.z + ulz * 25 - ufz * 7,
  };
  const kPinky: Point3D = {
    x: k.x + ulx * 35 - ufx * 12,
    y: k.y + uly * 35 - ufy * 12,
    z: k.z + ulz * 35 - ufz * 12,
  };

  // Passive curled fingertips tucked into palm
  const tipMidCurled: Point3D = {
    x: palm.x + ulx * 6 - ufx * 4,
    y: palm.y + uly * 6 - ufy * 4,
    z: palm.z + 8,
  };
  const tipRingCurled: Point3D = {
    x: palm.x + ulx * 16 - ufx * 6,
    y: palm.y + uly * 16 - ufy * 6,
    z: palm.z + 6,
  };
  const tipPinkyCurled: Point3D = {
    x: palm.x + ulx * 24 - ufx * 8,
    y: palm.y + uly * 24 - ufy * 8,
    z: palm.z + 4,
  };

  // Thumb base & knuckle
  const thumbBase: Point3D = {
    x: w.x * 0.65 + k.x * 0.35 - ulx * 10,
    y: w.y * 0.65 + k.y * 0.35 - uly * 10,
    z: w.z * 0.65 + k.z * 0.35 + 4,
  };
  const thumbKnuckle: Point3D = {
    x: thumbBase.x + ufx * 12 - ulx * 5,
    y: thumbBase.y + ufy * 12 - uly * 5,
    z: thumbBase.z + 6,
  };

  // Forearm entry point
  const forearm: Point3D = {
    x: w.x - ufx * 36 + ulx * 6,
    y: w.y - ufy * 36 + uly * 6 + 28,
    z: w.z - 20,
  };

  // 5. Posture Matrix & Digit Solver for Shape Archetype
  let tipIndex: Point3D = t;
  let tipMid: Point3D = tipMidCurled;
  let tipRing: Point3D = tipRingCurled;
  let tipPinky: Point3D = tipPinkyCurled;
  let thumbTip: Point3D = {
    x: k.x * 0.6 + kMid.x * 0.4 - ufx * 4,
    y: k.y * 0.6 + kMid.y * 0.4 - ufy * 4,
    z: k.z + 8,
  };

  switch (shape) {
    case 'pinch': {
      // Index and thumb meet together at a localized forward pinch point
      const pinchPoint: Point3D = {
        x: k.x + ufx * 18 - unormX * 8,
        y: k.y + ufy * 18 - unormY * 8,
        z: k.z + ufz * 18 - unormZ * 8,
      };
      tipIndex = pinchPoint;
      thumbTip = {
        x: pinchPoint.x - ulx * 2,
        y: pinchPoint.y - uly * 2,
        z: pinchPoint.z + 2,
      };
      // Middle, ring, and pinky relax curled into palm
      tipMid = tipMidCurled;
      tipRing = tipRingCurled;
      tipPinky = tipPinkyCurled;
      break;
    }

    case 'point-l':
      // Index extended + Thumb extended at 90° angle
      tipIndex = t;
      tipMid = tipMidCurled;
      tipRing = tipRingCurled;
      tipPinky = tipPinkyCurled;
      thumbTip = {
        x: thumbKnuckle.x + ufx * 8 - ulx * 20,
        y: thumbKnuckle.y + ufy * 8 - uly * 20,
        z: thumbKnuckle.z + 8,
      };
      break;

    case 'flat':
    case 'flat-closed':
      // All 4 fingers extended closed together (B-hand)
      tipIndex = t;
      tipMid = {
        x: kMid.x + ufx * 27,
        y: kMid.y + ufy * 27,
        z: kMid.z + ufz * 27,
      };
      tipRing = {
        x: kRing.x + ufx * 24,
        y: kRing.y + ufy * 24,
        z: kRing.z + ufz * 24,
      };
      tipPinky = {
        x: kPinky.x + ufx * 19,
        y: kPinky.y + ufy * 19,
        z: kPinky.z + ufz * 19,
      };
      thumbTip = {
        x: k.x - ulx * 7 - ufx * 2,
        y: k.y - uly * 7 - ufy * 2,
        z: k.z + 4,
      };
      break;

    case 'spread':
    case 'flat-spread':
      // All 5 digits fully extended and splayed laterally (5-hand)
      tipIndex = {
        x: k.x + ufx * 25 - ulx * 8,
        y: k.y + ufy * 25 - uly * 8,
        z: k.z + ufz * 25,
      };
      tipMid = {
        x: kMid.x + ufx * 28,
        y: kMid.y + ufy * 28,
        z: kMid.z + ufz * 28,
      };
      tipRing = {
        x: kRing.x + ufx * 25 + ulx * 8,
        y: kRing.y + ufy * 25 + uly * 8,
        z: kRing.z + ufz * 25,
      };
      tipPinky = {
        x: kPinky.x + ufx * 21 + ulx * 16,
        y: kPinky.y + ufy * 21 + uly * 16,
        z: kPinky.z + ufz * 21,
      };
      thumbTip = {
        x: thumbKnuckle.x + ufx * 12 - ulx * 14,
        y: thumbKnuckle.y + ufy * 12 - uly * 14,
        z: thumbKnuckle.z + 8,
      };
      break;

    case 'claw':
      // Curved 5-hand: all fingers bent into curved hooks
      tipIndex = {
        x: k.x + ufx * 14 - unormX * 12,
        y: k.y + ufy * 14 - unormY * 12,
        z: k.z + ufz * 14 - unormZ * 12,
      };
      tipMid = {
        x: kMid.x + ufx * 15 - unormX * 12,
        y: kMid.y + ufy * 15 - unormY * 12,
        z: kMid.z + ufz * 15 - unormZ * 12,
      };
      tipRing = {
        x: kRing.x + ufx * 14 - unormX * 12,
        y: kRing.y + ufy * 14 - unormY * 12,
        z: kRing.z + ufz * 14 - unormZ * 12,
      };
      tipPinky = {
        x: kPinky.x + ufx * 11 - unormX * 12,
        y: kPinky.y + ufy * 11 - unormY * 12,
        z: kPinky.z + ufz * 11 - unormZ * 12,
      };
      thumbTip = {
        x: thumbKnuckle.x + ufx * 10 - unormX * 10,
        y: thumbKnuckle.y + ufy * 10 - unormY * 10,
        z: thumbKnuckle.z + ufz * 10 - unormZ * 10,
      };
      break;

    case 'c-shape':
      // Curved arc on all fingers forming a C-shape
      tipIndex = {
        x: k.x + ufx * 18 - unormX * 16,
        y: k.y + ufy * 18 - unormY * 16,
        z: k.z + ufz * 18 - unormZ * 16,
      };
      tipMid = {
        x: kMid.x + ufx * 19 - unormX * 16,
        y: kMid.y + ufy * 19 - unormY * 16,
        z: kMid.z + ufz * 19 - unormZ * 16,
      };
      tipRing = {
        x: kRing.x + ufx * 17 - unormX * 16,
        y: kRing.y + ufy * 17 - unormY * 16,
        z: kRing.z + ufz * 17 - unormZ * 16,
      };
      tipPinky = {
        x: kPinky.x + ufx * 14 - unormX * 16,
        y: kPinky.y + ufy * 14 - unormY * 16,
        z: kPinky.z + ufz * 14 - unormZ * 16,
      };
      thumbTip = {
        x: thumbKnuckle.x + ufx * 6 + unormX * 14,
        y: thumbKnuckle.y + ufy * 6 + unormY * 14,
        z: thumbKnuckle.z + 8,
      };
      break;

    case 'fist':
      // S-hand / A-hand: all fingers tightly curled
      tipIndex = {
        x: palm.x - ulx * 3 - ufx * 4,
        y: palm.y - uly * 3 - ufy * 4,
        z: palm.z + 8,
      };
      tipMid = tipMidCurled;
      tipRing = tipRingCurled;
      tipPinky = tipPinkyCurled;
      thumbTip = {
        x: k.x + ulx * 6 + ufx * 2,
        y: k.y + uly * 6 + ufy * 2,
        z: k.z + 10,
      };
      break;

    case 'v':
      // V-hand: Index + Middle extended with spread, ring and pinky curled
      tipIndex = {
        x: k.x + ufx * 25 - ulx * 6,
        y: k.y + ufy * 25 - uly * 6,
        z: k.z + ufz * 25,
      };
      tipMid = {
        x: kMid.x + ufx * 26 + ulx * 6,
        y: kMid.y + ufy * 26 + uly * 6,
        z: kMid.z + ufz * 26,
      };
      tipRing = tipRingCurled;
      tipPinky = tipPinkyCurled;
      thumbTip = {
        x: kRing.x - ufx * 2,
        y: kRing.y - ufy * 2,
        z: kRing.z + 8,
      };
      break;

    case 'point':
    default:
      // Only index extended (1-hand / G-hand)
      tipIndex = t;
      tipMid = tipMidCurled;
      tipRing = tipRingCurled;
      tipPinky = tipPinkyCurled;
      break;
  }

  return {
    wrist: w,
    knuckleIndex: k,
    tipIndex,
    palm,
    kMid,
    kRing,
    kPinky,
    tipMid,
    tipRing,
    tipPinky,
    thumbBase,
    thumbKnuckle,
    thumbTip,
    forearm,
    shape,
    palmNormal: { x: unormX, y: unormY, z: unormZ },
  };
}