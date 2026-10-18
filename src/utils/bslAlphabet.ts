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

export interface BslNmf {
  eyebrows?: 'neutral' | 'raised' | 'furrowed';
  mouth?: string;
  headTilt?: 'neutral' | 'nod' | 'tilt-left' | 'tilt-right';
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
}

// Fixed anatomical non-dominant base hand coordinates (The "Paper")
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
