/**
 * src/components/bsl/bslAvatarSvgRenderer.ts
 *
 * Pure procedural W3C SVG skeletal layer renderers for the 60 FPS BSL/Makaton
 * In-Vision Vector Interpreter avatar (spatial loci, torso/sleeves, head/NMF rig,
 * non-dominant base hand, and dominant signing hand).
 */

import {
  Point3D,
  BslHandPose,
  BslNmf,
  BslBaseHandMode,
  BSL_BASE_HAND,
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  project3DToSvg,
  solveHandKinematics,
} from '../../utils/bslAlphabet';
import { DEFAULT_BSL_LOCI, type BslGrammarMode } from '../../utils/bslSpatialMaps';

function lerpRaw3D(a: Point3D, b: Point3D, t: number): Point3D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

export function buildLociLayerSvg(cam: any, ox: number, oy: number, grammarMode: BslGrammarMode): string {
  if (grammarMode === 'makaton') return '';

  // Draw subtle 3D spatial register coordinates
  const loci = [
    DEFAULT_BSL_LOCI.LOCUS_A,
    DEFAULT_BSL_LOCI.LOCUS_B,
    DEFAULT_BSL_LOCI.LOCUS_HIGH,
    DEFAULT_BSL_LOCI.LOCUS_LOW,
    DEFAULT_BSL_LOCI.ME,
    DEFAULT_BSL_LOCI.YOU,
  ];

  let html = '';
  for (const loc of loci) {
    const p = project3DToSvg(loc.coords, cam, ox, oy);
    if (p.scale > 0) {
      html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2" fill="#38bdf8" />`;
    }
  }
  return html;
}

export function buildBodyLayerSvg(
  cam: any,
  ox: number,
  oy: number,
  leftElbow3D: Point3D,
  rightElbow3D: Point3D
): string {
  // Anatomical Shoulder & Trapezius Slope Invariants:
  // Shoulders slope down from chest (-24 to -15), bi-acromial span = 112 (-56 to +56)
  const pNeckBase = project3DToSvg({ x: 0, y: -24, z: 0 }, cam, ox, oy);
  const pLeftShoulder = project3DToSvg({ x: -56, y: -15, z: 0 }, cam, ox, oy);
  const pRightShoulder = project3DToSvg({ x: 56, y: -15, z: 0 }, cam, ox, oy);
  const pWaistLeft = project3DToSvg({ x: -44, y: 75, z: -10 }, cam, ox, oy);
  const pWaistRight = project3DToSvg({ x: 44, y: 75, z: -10 }, cam, ox, oy);

  // Anatomical Elbows shared with Forearms
  const pLeftElbow = project3DToSvg(leftElbow3D, cam, ox, oy);
  const pRightElbow = project3DToSvg(rightElbow3D, cam, ox, oy);

  // Torso silhouette with soft athletic waist taper
  const torsoPath = `M ${pLeftShoulder.x.toFixed(1)} ${pLeftShoulder.y.toFixed(1)}
      Q ${pNeckBase.x.toFixed(1)} ${(pNeckBase.y + 4).toFixed(1)} ${pRightShoulder.x.toFixed(1)} ${pRightShoulder.y.toFixed(1)}
      L ${(pRightShoulder.x - 2).toFixed(1)} ${(pRightShoulder.y + 28).toFixed(1)}
      L ${pWaistRight.x.toFixed(1)} ${pWaistRight.y.toFixed(1)}
      L ${pWaistLeft.x.toFixed(1)} ${pWaistLeft.y.toFixed(1)}
      L ${(pLeftShoulder.x + 2).toFixed(1)} ${(pLeftShoulder.y + 28).toFixed(1)} Z`;

  // Crew neckline & Clavicle (Collarbone) contours
  const collarPath = `M ${(pNeckBase.x - 14).toFixed(1)} ${(pNeckBase.y - 7).toFixed(1)}
      Q ${pNeckBase.x.toFixed(1)} ${(pNeckBase.y + 9).toFixed(1)} ${(pNeckBase.x + 14).toFixed(1)} ${(pNeckBase.y - 7).toFixed(1)}`;

  const clavicleLeft = `M ${(pNeckBase.x - 3).toFixed(1)} ${(pNeckBase.y + 11).toFixed(1)}
      Q ${(pLeftShoulder.x + 26).toFixed(1)} ${(pLeftShoulder.y + 4).toFixed(1)} ${(pLeftShoulder.x + 10).toFixed(1)} ${(pLeftShoulder.y + 6).toFixed(1)}`;
  const clavicleRight = `M ${(pNeckBase.x + 3).toFixed(1)} ${(pNeckBase.y + 11).toFixed(1)}
      Q ${(pRightShoulder.x - 26).toFixed(1)} ${(pRightShoulder.y + 4).toFixed(1)} ${(pRightShoulder.x - 10).toFixed(1)} ${(pRightShoulder.y + 6).toFixed(1)}`;

  // Left and Right Upper Arm Sleeves
  const leftSleeve = `M ${pLeftShoulder.x.toFixed(1)} ${pLeftShoulder.y.toFixed(1)}
      L ${pLeftElbow.x.toFixed(1)} ${pLeftElbow.y.toFixed(1)}
      L ${(pLeftElbow.x + 14).toFixed(1)} ${(pLeftElbow.y - 3).toFixed(1)}
      L ${(pLeftShoulder.x + 12).toFixed(1)} ${(pLeftShoulder.y + 26).toFixed(1)} Z`;

  const rightSleeve = `M ${pRightShoulder.x.toFixed(1)} ${pRightShoulder.y.toFixed(1)}
      L ${(pRightShoulder.x - 12).toFixed(1)} ${(pRightShoulder.y + 26).toFixed(1)}
      L ${(pRightElbow.x - 14).toFixed(1)} ${(pRightElbow.y - 3).toFixed(1)}
      L ${pRightElbow.x.toFixed(1)} ${pRightElbow.y.toFixed(1)} Z`;

  return `
      <!-- Upper Arm Sleeves -->
      <path d="${leftSleeve}" fill="#162032" stroke="#0f172a" stroke-width="1.2" />
      <path d="${rightSleeve}" fill="#162032" stroke="#0f172a" stroke-width="1.2" />
      
      <!-- Torso Interpreter Top -->
      <path d="${torsoPath}" fill="url(#bsl-shirt-grad)" stroke="#334155" stroke-width="1.5" />
      
      <!-- Clavicle / Collarbone Accents -->
      <path d="${clavicleLeft}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.4" stroke-linecap="round" />
      <path d="${clavicleRight}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.4" stroke-linecap="round" />

      <!-- Suprasternal Notch (Neck pit) -->
      <ellipse cx="${pNeckBase.x.toFixed(1)}" cy="${(pNeckBase.y + 11).toFixed(1)}" rx="2.5" ry="1.5" fill="rgba(0,0,0,0.3)" />

      <!-- Neckline Ribbing -->
      <path d="${collarPath}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
    `;
}

export interface HeadLayerParams {
  cam: any;
  ox: number;
  oy: number;
  nmf: BslNmf;
  currentAnimProgress: number;
  eyeBlinkProgress: number;
  isIdle: boolean;
}

export function buildHeadLayerSvg(params: HeadLayerParams): string {
  const { cam, ox, oy, nmf, currentAnimProgress, eyeBlinkProgress, isIdle } = params;

  // Head center at y = -72, chin at y = -46, neck span = 22 units (~ 1/3 head proportion invariant)
  const tiltModX =
    nmf.headTilt === 'shake'
      ? Math.sin(currentAnimProgress * Math.PI * 3.5) * 6.5
      : nmf.headTilt === 'tilt-left'
      ? -6
      : nmf.headTilt === 'tilt-right'
      ? 6
      : 0;
  const tiltModY =
    nmf.headTilt === 'nod' ? Math.sin(currentAnimProgress * Math.PI * 2) * 4.5 : 0;
  const pHead = project3DToSvg({ x: tiltModX, y: -72 + tiltModY, z: 0 }, cam, ox, oy);
  const pNeck = project3DToSvg({ x: tiltModX * 0.5, y: -36 + tiltModY * 0.5, z: 0 }, cam, ox, oy);
  const pChin = project3DToSvg({ x: tiltModX, y: -46 + tiltModY, z: 0 }, cam, ox, oy);

  const s = pHead.scale;
  const headRadius = 21 * s;

  // 1. Ears (Left and Right)
  const earY = pHead.y + 2;
  const earW = 5.5 * s;
  const earH = 11 * s;
  const leftEar = `M ${(pHead.x - headRadius + 1).toFixed(1)} ${(earY - earH * 0.5).toFixed(1)}
      C ${(pHead.x - headRadius - earW).toFixed(1)} ${(earY - earH * 0.4).toFixed(1)} ${(pHead.x - headRadius - earW).toFixed(1)} ${(earY + earH * 0.4).toFixed(1)} ${(pHead.x - headRadius + 2).toFixed(1)} ${(earY + earH * 0.5).toFixed(1)} Z`;
  const rightEar = `M ${(pHead.x + headRadius - 1).toFixed(1)} ${(earY - earH * 0.5).toFixed(1)}
      C ${(pHead.x + headRadius + earW).toFixed(1)} ${(earY - earH * 0.4).toFixed(1)} ${(pHead.x + headRadius + earW).toFixed(1)} ${(earY + earH * 0.4).toFixed(1)} ${(pHead.x + headRadius - 2).toFixed(1)} ${(earY + earH * 0.5).toFixed(1)} Z`;

  // 2. Anatomical Neck & Sternocleidomastoid
  const neckTopW = 11 * s;
  const neckBaseW = 14 * s;
  const neckPath = `M ${(pNeck.x - neckTopW).toFixed(1)} ${(pHead.y + 10).toFixed(1)}
      L ${(pNeck.x - neckBaseW).toFixed(1)} ${(pNeck.y + 13).toFixed(1)}
      L ${(pNeck.x + neckBaseW).toFixed(1)} ${(pNeck.y + 13).toFixed(1)}
      L ${(pNeck.x + neckTopW).toFixed(1)} ${(pHead.y + 10).toFixed(1)} Z`;

  // 3. Realistic Contoured Head & Jawline (Cranium tapering to defined chin)
  const craniumTop = pHead.y - headRadius * 1.05;
  const cheekY = pHead.y + 4;
  const jawY = pHead.y + 17;
  const chinPt = pChin.y;

  const faceContour = `M ${pHead.x.toFixed(1)} ${craniumTop.toFixed(1)}
      C ${(pHead.x + headRadius * 1.05).toFixed(1)} ${craniumTop.toFixed(1)} ${(pHead.x + headRadius * 1.02).toFixed(1)} ${cheekY.toFixed(1)} ${(pHead.x + headRadius * 0.88).toFixed(1)} ${jawY.toFixed(1)}
      C ${(pHead.x + headRadius * 0.65).toFixed(1)} ${(jawY + 7).toFixed(1)} ${(pHead.x + 6).toFixed(1)} ${chinPt.toFixed(1)} ${pHead.x.toFixed(1)} ${chinPt.toFixed(1)}
      C ${(pHead.x - 6).toFixed(1)} ${chinPt.toFixed(1)} ${(pHead.x - headRadius * 0.65).toFixed(1)} ${(jawY + 7).toFixed(1)} ${(pHead.x - headRadius * 0.88).toFixed(1)} ${jawY.toFixed(1)}
      C ${(pHead.x - headRadius * 1.02).toFixed(1)} ${cheekY.toFixed(1)} ${(pHead.x - headRadius * 1.05).toFixed(1)} ${craniumTop.toFixed(1)} ${pHead.x.toFixed(1)} ${craniumTop.toFixed(1)} Z`;

  // 4. Hair (Styled professional interpreter crop)
  const hairCap = `M ${(pHead.x - headRadius * 1.08).toFixed(1)} ${cheekY.toFixed(1)}
      C ${(pHead.x - headRadius * 1.15).toFixed(1)} ${(craniumTop - 5).toFixed(1)} ${(pHead.x + headRadius * 1.15).toFixed(1)} ${(craniumTop - 5).toFixed(1)} ${(pHead.x + headRadius * 1.08).toFixed(1)} ${cheekY.toFixed(1)}
      C ${(pHead.x + headRadius * 0.95).toFixed(1)} ${(pHead.y - 4).toFixed(1)} ${(pHead.x + headRadius * 0.4).toFixed(1)} ${(pHead.y - 12).toFixed(1)} ${(pHead.x - 2).toFixed(1)} ${(pHead.y - 11).toFixed(1)}
      C ${(pHead.x - headRadius * 0.5).toFixed(1)} ${(pHead.y - 10).toFixed(1)} ${(pHead.x - headRadius * 0.9).toFixed(1)} ${(pHead.y - 2).toFixed(1)} ${(pHead.x - headRadius * 1.08).toFixed(1)} ${cheekY.toFixed(1)} Z`;

  // 5. Eyebrows & Forehead Creases
  const eyebrowDelta = nmf.eyebrows === 'raised' ? -6.5 : nmf.eyebrows === 'furrowed' ? 3.5 : 0;
  const browY = pHead.y - 5.5 + eyebrowDelta;
  const browAngle = nmf.eyebrows === 'furrowed' ? 5 : nmf.eyebrows === 'raised' ? -2 : 0;

  let foreheadCrease = '';
  if (nmf.eyebrows === 'raised') {
    foreheadCrease = `
        <path d="M ${(pHead.x - 12).toFixed(1)} ${(browY - 6).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(browY - 8).toFixed(1)} ${(pHead.x + 12).toFixed(1)} ${(browY - 6).toFixed(1)}" stroke="rgba(203,124,73,0.35)" stroke-width="1" fill="none" />
      `;
  } else if (nmf.eyebrows === 'furrowed') {
    foreheadCrease = `
        <line x1="${(pHead.x - 2).toFixed(1)}" y1="${(browY - 3).toFixed(1)}" x2="${(pHead.x - 2).toFixed(1)}" y2="${(browY + 4).toFixed(1)}" stroke="rgba(203,124,73,0.45)" stroke-width="1.2" />
        <line x1="${(pHead.x + 2).toFixed(1)}" y1="${(browY - 3).toFixed(1)}" x2="${(pHead.x + 2).toFixed(1)}" y2="${(browY + 4).toFixed(1)}" stroke="rgba(203,124,73,0.45)" stroke-width="1.2" />
      `;
  }

  // 6. Eyes & Eyelids (Almond contours with Iris, Pupil, and Sclera)
  const eyeH = Math.max(0.4, 3.4 * (1 - eyeBlinkProgress));
  const eyeLX = pHead.x - 8.5 * s;
  const eyeRX = pHead.x + 8.5 * s;
  const eyeY = pHead.y + 2;

  const eyeContourL = `M ${(eyeLX - 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeLX.toFixed(1)} ${(eyeY - eyeH * 1.1).toFixed(1)} ${(eyeLX + 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeLX.toFixed(1)} ${(eyeY + eyeH * 1.1).toFixed(1)} ${(eyeLX - 6).toFixed(1)} ${eyeY.toFixed(1)} Z`;

  const eyeContourR = `M ${(eyeRX - 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeRX.toFixed(1)} ${(eyeY - eyeH * 1.1).toFixed(1)} ${(eyeRX + 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeRX.toFixed(1)} ${(eyeY + eyeH * 1.1).toFixed(1)} ${(eyeRX - 6).toFixed(1)} ${eyeY.toFixed(1)} Z`;

  // 7. Nose (Bridge, tip bulb, and nostrils)
  const noseBridgeY = pHead.y - 1;
  const noseTipY = pHead.y + 9;
  const noseSvg = `
      <!-- Nose Bridge & Shadow -->
      <path d="M ${(pHead.x - 1.5).toFixed(1)} ${noseBridgeY.toFixed(1)} L ${(pHead.x - 1.8).toFixed(1)} ${(noseTipY - 2).toFixed(1)} Q ${(pHead.x - 4).toFixed(1)} ${noseTipY.toFixed(1)} ${pHead.x.toFixed(1)} ${(noseTipY + 1).toFixed(1)} Q ${(pHead.x + 4).toFixed(1)} ${noseTipY.toFixed(1)} ${(pHead.x + 1.8).toFixed(1)} ${(noseTipY - 2).toFixed(1)}" fill="none" stroke="#d99564" stroke-width="1.2" stroke-linecap="round" />
      <!-- Nostril accents -->
      <circle cx="${(pHead.x - 3).toFixed(1)}" cy="${noseTipY.toFixed(1)}" r="1" fill="#cb7c49" />
      <circle cx="${(pHead.x + 3).toFixed(1)}" cy="${noseTipY.toFixed(1)}" r="1" fill="#cb7c49" />
    `;

  // 8. Realistic Mouth Morphemes & Contoured Lips
  let mouthSvg = '';
  const mY = pHead.y + 17;
  const mouthType = nmf.mouth || 'closed';

  if (mouthType === 'open') {
    mouthSvg = `
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="7.5" ry="4.5" fill="#140a08" stroke="#d99564" stroke-width="1" />
        <rect x="${(pHead.x - 4.5).toFixed(1)}" y="${(mY - 3).toFixed(1)}" width="9" height="2.5" fill="#ffffff" rx="1" />
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${(mY + 2.5).toFixed(1)}" rx="4.5" ry="1.8" fill="#e07a70" />
      `;
  } else if (mouthType === 'puffed-cheeks') {
    mouthSvg = `
        <!-- Volumetric Cheek Puffs -->
        <circle cx="${(pHead.x - 14).toFixed(1)}" cy="${(mY - 2).toFixed(1)}" r="6" fill="#f8be93" opacity="0.6" filter="url(#bsl-glow)" />
        <circle cx="${(pHead.x + 14).toFixed(1)}" cy="${(mY - 2).toFixed(1)}" r="6" fill="#f8be93" opacity="0.6" filter="url(#bsl-glow)" />
        <path d="M ${(pHead.x - 7).toFixed(1)} ${mY.toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY - 1).toFixed(1)} ${(pHead.x + 7).toFixed(1)} ${mY.toFixed(1)}" stroke="#c9564c" stroke-width="2.5" stroke-linecap="round" fill="none" />
      `;
  } else if (mouthType === 'pursed' || mouthType === 'round') {
    mouthSvg = `
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="4.5" ry="4" fill="url(#bsl-lip-grad)" stroke="#9f372d" stroke-width="1" />
        <circle cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" r="2" fill="#140a08" />
      `;
  } else if (mouthType === 'tight-lips' || mouthType === 'mm') {
    mouthSvg = `
        <line x1="${(pHead.x - 8).toFixed(1)}" y1="${mY.toFixed(1)}" x2="${(pHead.x + 8).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="#c9564c" stroke-width="2.2" stroke-linecap="round" />
        <!-- Lower lip crease -->
        <path d="M ${(pHead.x - 4).toFixed(1)} ${(mY + 3.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 4.5).toFixed(1)} ${(pHead.x + 4).toFixed(1)} ${(mY + 3.5).toFixed(1)}" stroke="#d99564" stroke-width="1.2" fill="none" />
      `;
  } else if (mouthType === 'th') {
    mouthSvg = `
        <!-- Upper teeth & tongue tip -->
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="6.5" ry="3.5" fill="#140a08" stroke="#d99564" stroke-width="1" />
        <rect x="${(pHead.x - 4).toFixed(1)}" y="${(mY - 2.5).toFixed(1)}" width="8" height="2.2" fill="#ffffff" rx="0.5" />
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${(mY + 1).toFixed(1)}" rx="4.5" ry="2" fill="#f43f5e" />
      `;
  } else if (mouthType === 'f-mouth') {
    mouthSvg = `
        <path d="M ${(pHead.x - 7).toFixed(1)} ${(mY - 1).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 1).toFixed(1)} ${(pHead.x + 7).toFixed(1)} ${(mY - 1).toFixed(1)}" stroke="#c9564c" stroke-width="1.6" fill="none" />
        <rect x="${(pHead.x - 4).toFixed(1)}" y="${(mY - 2).toFixed(1)}" width="8" height="2" fill="#ffffff" rx="0.6" />
        <path d="M ${(pHead.x - 5).toFixed(1)} ${(mY + 1).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 3.2).toFixed(1)} ${(pHead.x + 5).toFixed(1)} ${(mY + 1).toFixed(1)}" stroke="#e27c73" stroke-width="2" stroke-linecap="round" fill="none" />
      `;
  } else if (mouthType === 'smile') {
    mouthSvg = `
        <path d="M ${(pHead.x - 8).toFixed(1)} ${(mY - 1).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 6).toFixed(1)} ${(pHead.x + 8).toFixed(1)} ${(mY - 1).toFixed(1)} Z" fill="url(#bsl-lip-grad)" stroke="#c9564c" stroke-width="1" />
        <path d="M ${(pHead.x - 5).toFixed(1)} ${(mY + 0.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 2.5).toFixed(1)} ${(pHead.x + 5).toFixed(1)} ${(mY + 0.5).toFixed(1)}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
        <!-- Smile dimple creases -->
        <line x1="${(pHead.x - 9).toFixed(1)}" y1="${(mY - 2).toFixed(1)}" x2="${(pHead.x - 8).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="#d99564" stroke-width="1" />
        <line x1="${(pHead.x + 9).toFixed(1)}" y1="${(mY - 2).toFixed(1)}" x2="${(pHead.x + 8).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="#d99564" stroke-width="1" />
      `;
  } else if (!isIdle && mouthType !== 'closed' && mouthType !== 'neutral') {
    // Dynamic lexical lip articulation during active BSL / Makaton word mouthing
    const pulse = Math.abs(Math.sin(currentAnimProgress * Math.PI * 2));
    const openRy = 1.4 + pulse * 2.2;
    mouthSvg = `
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="6.2" ry="${openRy.toFixed(1)}" fill="#26100d" stroke="#c9564c" stroke-width="1.3" />
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${(mY - openRy * 0.4).toFixed(1)}" rx="3.8" ry="0.9" fill="#ffffff" opacity="0.85" />
      `;
  } else {
    // Natural resting lips with Cupid's bow
    mouthSvg = `
        <!-- Cupid's bow upper lip -->
        <path d="M ${(pHead.x - 7).toFixed(1)} ${mY.toFixed(1)} Q ${(pHead.x - 3.5).toFixed(1)} ${(mY - 1.8).toFixed(1)} ${pHead.x.toFixed(1)} ${(mY - 0.5).toFixed(1)} Q ${(pHead.x + 3.5).toFixed(1)} ${(mY - 1.8).toFixed(1)} ${(pHead.x + 7).toFixed(1)} ${mY.toFixed(1)}" stroke="#c9564c" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <!-- Lower lip fullness -->
        <path d="M ${(pHead.x - 5).toFixed(1)} ${(mY + 0.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 3.8).toFixed(1)} ${(pHead.x + 5).toFixed(1)} ${(mY + 0.5).toFixed(1)}" stroke="#e27c73" stroke-width="2" stroke-linecap="round" fill="none" />
        <!-- Under-lip shadow indentation -->
        <path d="M ${(pHead.x - 3.5).toFixed(1)} ${(mY + 5.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 6.2).toFixed(1)} ${(pHead.x + 3.5).toFixed(1)} ${(mY + 5.5).toFixed(1)}" stroke="#d99564" stroke-width="1" fill="none" />
      `;
  }

  return `
      <!-- Ears -->
      <path d="${leftEar}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1" />
      <path d="${rightEar}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1" />

      <!-- Neck -->
      <path d="${neckPath}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1" />
      <!-- Sternocleidomastoid muscle shadow lines -->
      <line x1="${(pNeck.x - 6).toFixed(1)}" y1="${(pHead.y + 11).toFixed(1)}" x2="${(pNeck.x - 2).toFixed(1)}" y2="${(pNeck.y + 12).toFixed(1)}" stroke="#d99564" stroke-width="1" opacity="0.4" />
      <line x1="${(pNeck.x + 6).toFixed(1)}" y1="${(pHead.y + 11).toFixed(1)}" x2="${(pNeck.x + 2).toFixed(1)}" y2="${(pNeck.y + 12).toFixed(1)}" stroke="#d99564" stroke-width="1" opacity="0.4" />

      <!-- Cranium & Face Contour -->
      <path d="${faceContour}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1.4" filter="url(#bsl-shadow)" />

      <!-- Hair Cap -->
      <path d="${hairCap}" fill="url(#bsl-hair-grad)" stroke="#0f172a" stroke-width="1.2" />

      <!-- Forehead Expression Creases -->
      ${foreheadCrease}

      <!-- Eyebrows (Tapered natural arches) -->
      <path d="M ${(pHead.x - 14.5).toFixed(1)} ${(browY + browAngle + 1).toFixed(1)} Q ${(pHead.x - 9).toFixed(1)} ${(browY - 1).toFixed(1)} ${(pHead.x - 3).toFixed(1)} ${browY.toFixed(1)}" stroke="#2a2523" stroke-width="2.6" stroke-linecap="round" fill="none" />
      <path d="M ${(pHead.x + 3).toFixed(1)} ${browY.toFixed(1)} Q ${(pHead.x + 9).toFixed(1)} ${(browY - 1).toFixed(1)} ${(pHead.x + 14.5).toFixed(1)} ${(browY + browAngle + 1).toFixed(1)}" stroke="#2a2523" stroke-width="2.6" stroke-linecap="round" fill="none" />

      <!-- Left Eye -->
      <path d="${eyeContourL}" fill="#f8fafc" stroke="#1c1917" stroke-width="1" />
      <circle cx="${eyeLX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="2.8" fill="url(#bsl-iris-grad)" />
      <circle cx="${eyeLX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="1.4" fill="#090d16" />
      <circle cx="${(eyeLX - 0.9).toFixed(1)}" cy="${(eyeY - 0.9).toFixed(1)}" r="0.7" fill="#ffffff" />

      <!-- Right Eye -->
      <path d="${eyeContourR}" fill="#f8fafc" stroke="#1c1917" stroke-width="1" />
      <circle cx="${eyeRX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="2.8" fill="url(#bsl-iris-grad)" />
      <circle cx="${eyeRX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="1.4" fill="#090d16" />
      <circle cx="${(eyeRX - 0.9).toFixed(1)}" cy="${(eyeY - 0.9).toFixed(1)}" r="0.7" fill="#ffffff" />

      <!-- Upper Eyelid / Lash Liners -->
      <path d="M ${(eyeLX - 6.5).toFixed(1)} ${eyeY.toFixed(1)} Q ${eyeLX.toFixed(1)} ${(eyeY - eyeH * 1.3).toFixed(1)} ${(eyeLX + 6.5).toFixed(1)} ${eyeY.toFixed(1)}" stroke="#1c1917" stroke-width="1.4" fill="none" />
      <path d="M ${(eyeRX - 6.5).toFixed(1)} ${eyeY.toFixed(1)} Q ${eyeRX.toFixed(1)} ${(eyeY - eyeH * 1.3).toFixed(1)} ${(eyeRX + 6.5).toFixed(1)} ${eyeY.toFixed(1)}" stroke="#1c1917" stroke-width="1.4" fill="none" />

      <!-- Nose -->
      ${noseSvg}

      <!-- Mouth -->
      ${mouthSvg}
    `;
}

interface Projected2D {
  x: number;
  y: number;
  scale: number;
  depth: number;
}

function f1(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(1);
}

function clampScale(s: number): number {
  return Math.max(0.68, Math.min(1.38, Number.isFinite(s) ? s : 1));
}

function add3D(a: Point3D, b: Point3D): Point3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function sub3D(a: Point3D, b: Point3D): Point3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function buildCapsuleSvg(
  ax: number,
  ay: number,
  rA: number,
  bx: number,
  by: number,
  rB: number,
  fill: string,
  stroke: string,
  strokeWidth = 0.95
): string {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len <= Math.abs(rA - rB) + 0.65) {
    const cx = len < 0.01 ? bx : (ax + bx) * 0.5;
    const cy = len < 0.01 ? by : (ay + by) * 0.5;
    const r = Math.max(rA, rB);
    return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
  }
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const aLx = ax + nx * rA;
  const aLy = ay + ny * rA;
  const aRx = ax - nx * rA;
  const aRy = ay - ny * rA;
  const bLx = bx + nx * rB;
  const bLy = by + ny * rB;
  const bRx = bx - nx * rB;
  const bRy = by - ny * rB;
  const d = `M ${f1(aLx)} ${f1(aLy)} L ${f1(bLx)} ${f1(bLy)} A ${f1(rB)} ${f1(rB)} 0 0 0 ${f1(bRx)} ${f1(bRy)} L ${f1(aRx)} ${f1(aRy)} A ${f1(rA)} ${f1(rA)} 0 0 0 ${f1(aLx)} ${f1(aLy)} Z`;
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;
}

function buildForearmSvg(pElbow: Projected2D, pWrist: Projected2D, scale: number): string {
  const rElbow = 6.1 * scale;
  const rWrist = 4.4 * scale;
  const dx = pWrist.x - pElbow.x;
  const dy = pWrist.y - pElbow.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cuffX = pElbow.x + (dx / len) * (3.2 * scale);
  const cuffY = pElbow.y + (dy / len) * (3.2 * scale);
  return `
    ${buildCapsuleSvg(pElbow.x, pElbow.y, rElbow, pWrist.x, pWrist.y, rWrist, 'url(#bsl-skin-base)', '#c27a4b', 1.05)}
    <line x1="${f1(cuffX + nx * rElbow * 0.92)}" y1="${f1(cuffY + ny * rElbow * 0.92)}" x2="${f1(cuffX - nx * rElbow * 0.92)}" y2="${f1(cuffY - ny * rElbow * 0.92)}" stroke="#1e293b" stroke-width="${f1(2.2 * scale)}" stroke-linecap="round" opacity="0.65" />
  `;
}

function buildArticulatedFingerSvg(
  pBase: Projected2D,
  pMid: Projected2D,
  pTip: Projected2D,
  rBase: number,
  rMid: number,
  rTip: number,
  fillGrad: string,
  strokeCol: string,
  isPalmFacing: boolean,
  isCurled: boolean
): string {
  const fill = `url(#${fillGrad})`;
  const prox = buildCapsuleSvg(pBase.x, pBase.y, rBase, pMid.x, pMid.y, rMid, fill, strokeCol, 0.85);
  const dist = buildCapsuleSvg(pMid.x, pMid.y, rMid, pTip.x, pTip.y, rTip, fill, strokeCol, 0.85);

  // Seamless joint fill blend + subtle anatomical knuckle/flexion crease
  const dx = pTip.x - pBase.x;
  const dy = pTip.y - pBase.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const creaseHalf = rMid * 0.62;
  const crease = `<line x1="${f1(pMid.x - nx * creaseHalf)}" y1="${f1(pMid.y - ny * creaseHalf)}" x2="${f1(pMid.x + nx * creaseHalf)}" y2="${f1(pMid.y + ny * creaseHalf)}" stroke="${strokeCol}" stroke-width="0.65" stroke-linecap="round" opacity="${isPalmFacing ? '0.45' : '0.32'}" />`;

  // Fingertip pad highlight (palm view) or subtle oval nail highlight (dorsal view)
  let tipDetail = '';
  if (!isCurled) {
    const ux = dx / len;
    const uy = dy / len;
    if (!isPalmFacing && len > 4) {
      const nailX = pTip.x - ux * (rTip * 0.25);
      const nailY = pTip.y - uy * (rTip * 0.25);
      const angle = (Math.atan2(uy, ux) * 180) / Math.PI;
      tipDetail = `<ellipse cx="${f1(nailX)}" cy="${f1(nailY)}" rx="${f1(rTip * 0.68)}" ry="${f1(rTip * 0.48)}" transform="rotate(${f1(angle)} ${f1(nailX)} ${f1(nailY)})" fill="#fff7ed" fill-opacity="0.62" stroke="${strokeCol}" stroke-opacity="0.32" stroke-width="0.45" />`;
    } else if (isPalmFacing) {
      tipDetail = `<circle cx="${f1(pTip.x)}" cy="${f1(pTip.y)}" r="${f1(rTip * 0.52)}" fill="#fff7ed" fill-opacity="0.34" />`;
    }
  }

  return `${prox}${dist}<circle cx="${f1(pMid.x)}" cy="${f1(pMid.y)}" r="${f1(rMid * 0.86)}" fill="${fill}" />${crease}${tipDetail}`;
}

function buildContouredPalmSvg(
  pWrist: Projected2D,
  pThumbBase: Projected2D,
  pKIdx: Projected2D,
  pKMid: Projected2D,
  pKRing: Projected2D,
  pKPinky: Projected2D,
  pPalmCenter: Projected2D,
  scale: number,
  isPalmFacing: boolean,
  fillGrad: string,
  strokeCol: string
): string {
  const kCenterX = (pKIdx.x + pKRing.x) * 0.5;
  const kCenterY = (pKIdx.y + pKRing.y) * 0.5;
  const ax = kCenterX - pWrist.x;
  const ay = kCenterY - pWrist.y;
  const aLen = Math.hypot(ax, ay) || 1;
  let px = -ay / aLen;
  let py = ax / aLen;

  // Orient lateral vector consistently from thumb side (-) to pinky side (+)
  const lateralDot = (pKPinky.x - pKIdx.x) * px + (pKPinky.y - pKIdx.y) * py;
  if (lateralDot < 0) {
    px = -px;
    py = -py;
  }

  const wristHalf = 4.3 * scale;
  const wThumbX = pWrist.x - px * wristHalf;
  const wThumbY = pWrist.y - py * wristHalf;
  const wPinkyX = pWrist.x + px * wristHalf;
  const wPinkyY = pWrist.y + py * wristHalf;

  // Fleshy thenar (thumb) and hypothenar (pinky) heel contours
  const thenarX = (wThumbX + pThumbBase.x) * 0.5 - px * (2.3 * scale);
  const thenarY = (wThumbY + pThumbBase.y) * 0.5 - py * (2.3 * scale);
  const heelPinkyX = wPinkyX + (pKPinky.x - wPinkyX) * 0.45 + px * (2.6 * scale);
  const heelPinkyY = wPinkyY + (pKPinky.y - wPinkyY) * 0.45 + py * (2.6 * scale);
  const thumbWebX = pThumbBase.x + (pKIdx.x - pThumbBase.x) * 0.55 - px * (0.9 * scale);
  const thumbWebY = pThumbBase.y + (pKIdx.y - pThumbBase.y) * 0.55 - py * (0.9 * scale);

  const palmPath = `M ${f1(wThumbX)} ${f1(wThumbY)}
    Q ${f1(thenarX)} ${f1(thenarY)} ${f1(pThumbBase.x)} ${f1(pThumbBase.y)}
    Q ${f1(thumbWebX)} ${f1(thumbWebY)} ${f1(pKIdx.x)} ${f1(pKIdx.y)}
    L ${f1(pKMid.x)} ${f1(pKMid.y)}
    L ${f1(pKRing.x)} ${f1(pKRing.y)}
    L ${f1(pKPinky.x)} ${f1(pKPinky.y)}
    Q ${f1(heelPinkyX)} ${f1(heelPinkyY)} ${f1(wPinkyX)} ${f1(wPinkyY)} Z`;

  // Palm-facing anatomical creases vs. dorsal knuckle highlights
  let surfaceDetail = '';
  if (isPalmFacing) {
    const creaseStartX = pKIdx.x + (pPalmCenter.x - pKIdx.x) * 0.48;
    const creaseStartY = pKIdx.y + (pPalmCenter.y - pKIdx.y) * 0.48;
    const creaseEndX = pKPinky.x + (wPinkyX - pKPinky.x) * 0.36;
    const creaseEndY = pKPinky.y + (wPinkyY - pKPinky.y) * 0.36;
    const creaseMidX = (creaseStartX + creaseEndX) * 0.5 + (pPalmCenter.x - kCenterX) * 0.16;
    const creaseMidY = (creaseStartY + creaseEndY) * 0.5 + (pPalmCenter.y - kCenterY) * 0.16;

    const thenarArcEndX = pWrist.x + (pPalmCenter.x - pWrist.x) * 0.35;
    const thenarArcEndY = pWrist.y + (pPalmCenter.y - pWrist.y) * 0.35;
    const thenarArcCtrlX = pPalmCenter.x - px * (1.2 * scale);
    const thenarArcCtrlY = pPalmCenter.y - py * (1.2 * scale);

    surfaceDetail = `
      <path d="M ${f1(creaseStartX)} ${f1(creaseStartY)} Q ${f1(creaseMidX)} ${f1(creaseMidY)} ${f1(creaseEndX)} ${f1(creaseEndY)}" fill="none" stroke="${strokeCol}" stroke-width="0.8" stroke-linecap="round" opacity="0.42" />
      <path d="M ${f1(pThumbBase.x + (pPalmCenter.x - pThumbBase.x) * 0.32)} ${f1(pThumbBase.y + (pPalmCenter.y - pThumbBase.y) * 0.32)} Q ${f1(thenarArcCtrlX)} ${f1(thenarArcCtrlY)} ${f1(thenarArcEndX)} ${f1(thenarArcEndY)}" fill="none" stroke="${strokeCol}" stroke-width="0.8" stroke-linecap="round" opacity="0.38" />
    `;
  } else {
    const knR = 1.65 * scale;
    surfaceDetail = `
      <circle cx="${f1(pKIdx.x)}" cy="${f1(pKIdx.y)}" r="${f1(knR)}" fill="#fff3e6" opacity="0.38" />
      <circle cx="${f1(pKMid.x)}" cy="${f1(pKMid.y)}" r="${f1(knR)}" fill="#fff3e6" opacity="0.35" />
      <circle cx="${f1(pKRing.x)}" cy="${f1(pKRing.y)}" r="${f1(knR * 0.9)}" fill="#fff3e6" opacity="0.32" />
      <circle cx="${f1(pKPinky.x)}" cy="${f1(pKPinky.y)}" r="${f1(knR * 0.8)}" fill="#fff3e6" opacity="0.28" />
    `;
  }

  return `
    <path d="${palmPath}" fill="url(#${fillGrad})" stroke="${strokeCol}" stroke-width="1.05" stroke-linejoin="round" />
    ${surfaceDetail}
  `;
}

function renderSolvedArticulatedHandSvg(
  solved: ReturnType<typeof solveHandKinematics>,
  elbow3D: Point3D,
  mirrorX: boolean,
  cam: any,
  ox: number,
  oy: number
): string {
  const m = (p: Point3D): Point3D => (mirrorX ? { x: -p.x, y: p.y, z: p.z } : p);

  const w3D = m(solved.wrist);
  const kIdx3D = m(solved.knuckleIndex);
  const tIdx3D = m(solved.tipIndex);
  const rawKMid = m(solved.kMid);
  const rawKRing = m(solved.kRing);
  const rawKPinky = m(solved.kPinky);
  const rawThumbBase = m(solved.thumbBase);
  const rawThumbKnuckle = m(solved.thumbKnuckle);
  const thumbTip3D = m(solved.thumbTip);

  // Refine visual knuckle spread to realistic ~50% head-width human proportion
  // while keeping exact index tip, index knuckle, wrist, and thumb tip positions.
  const SPREAD = 0.58;
  const kMid3D = lerpRaw3D(kIdx3D, rawKMid, SPREAD);
  const kRing3D = lerpRaw3D(kIdx3D, rawKRing, SPREAD);
  const kPinky3D = lerpRaw3D(kIdx3D, rawKPinky, SPREAD);

  const knuckleCenter3D = lerpRaw3D(kIdx3D, kRing3D, 0.52);
  const palmCenter3D = lerpRaw3D(w3D, knuckleCenter3D, 0.52);
  const thumbBase3D = lerpRaw3D(w3D, rawThumbBase, 0.74);
  const thumbKnuckle3D = lerpRaw3D(thumbBase3D, rawThumbKnuckle, 0.86);

  const shape = solved.shape || 'flat-closed';
  const idxCurled = shape === 'fist';
  const midCurled = shape === 'fist' || shape === 'point' || shape === 'point-l' || shape === 'pinch';
  const ringCurled = midCurled || shape === 'v';
  const pinkyCurled = ringCurled;
  const isCurved = shape === 'claw' || shape === 'c-shape';

  const rawTMid = m(solved.tipMid);
  const rawTRing = m(solved.tipRing);
  const rawTPinky = m(solved.tipPinky);

  const tMid3D = midCurled
    ? lerpRaw3D(palmCenter3D, rawTMid, 0.72)
    : add3D(rawTMid, sub3D(kMid3D, rawKMid));
  const tRing3D = ringCurled
    ? lerpRaw3D(palmCenter3D, rawTRing, 0.72)
    : add3D(rawTRing, sub3D(kRing3D, rawKRing));
  const tPinky3D = pinkyCurled
    ? lerpRaw3D(palmCenter3D, rawTPinky, 0.72)
    : add3D(rawTPinky, sub3D(kPinky3D, rawKPinky));

  const nVec = m(solved.palmNormal || { x: 0, y: 0, z: 1 });
  const pPalmCenter = project3DToSvg(palmCenter3D, cam, ox, oy);
  const pNormalTip = project3DToSvg(
    { x: palmCenter3D.x + nVec.x * 10, y: palmCenter3D.y + nVec.y * 10, z: palmCenter3D.z + nVec.z * 10 },
    cam,
    ox,
    oy
  );
  const isPalmFacing = pNormalTip.depth < pPalmCenter.depth;

  // Compute organic 3D intermediate (PIP) joint with realistic dorsal bend
  const computePip3D = (knuckle: Point3D, tip: Point3D, curled: boolean, curved: boolean): Point3D => {
    const baseMid = lerpRaw3D(knuckle, tip, curved ? 0.5 : curled ? 0.48 : 0.54);
    const dorsalLift = curved ? 7.2 : curled ? 4.4 : 1.5;
    return {
      x: baseMid.x - nVec.x * dorsalLift,
      y: baseMid.y - nVec.y * dorsalLift,
      z: baseMid.z - nVec.z * dorsalLift,
    };
  };

  const pipIdx3D = computePip3D(kIdx3D, tIdx3D, idxCurled, isCurved || shape === 'pinch');
  const pipMid3D = computePip3D(kMid3D, tMid3D, midCurled, isCurved);
  const pipRing3D = computePip3D(kRing3D, tRing3D, ringCurled, isCurved);
  const pipPinky3D = computePip3D(kPinky3D, tPinky3D, pinkyCurled, isCurved);

  const pElbow = project3DToSvg(elbow3D, cam, ox, oy);
  const pWrist = project3DToSvg(w3D, cam, ox, oy);
  const pThumbBase = project3DToSvg(thumbBase3D, cam, ox, oy);
  const pThumbKnuckle = project3DToSvg(thumbKnuckle3D, cam, ox, oy);
  const pThumbTip = project3DToSvg(thumbTip3D, cam, ox, oy);

  const pKIdx = project3DToSvg(kIdx3D, cam, ox, oy);
  const pKMid = project3DToSvg(kMid3D, cam, ox, oy);
  const pKRing = project3DToSvg(kRing3D, cam, ox, oy);
  const pKPinky = project3DToSvg(kPinky3D, cam, ox, oy);

  const pPipIdx = project3DToSvg(pipIdx3D, cam, ox, oy);
  const pPipMid = project3DToSvg(pipMid3D, cam, ox, oy);
  const pPipRing = project3DToSvg(pipRing3D, cam, ox, oy);
  const pPipPinky = project3DToSvg(pipPinky3D, cam, ox, oy);

  const pTIdx = project3DToSvg(tIdx3D, cam, ox, oy);
  const pTMid = project3DToSvg(tMid3D, cam, ox, oy);
  const pTRing = project3DToSvg(tRing3D, cam, ox, oy);
  const pTPinky = project3DToSvg(tPinky3D, cam, ox, oy);

  const s = clampScale(pPalmCenter.scale);
  const palmGrad = isPalmFacing ? 'bsl-hand-palm' : 'bsl-hand-back';
  const strokeCol = isPalmFacing ? '#c98050' : '#b86d3f';

  // Assemble render items with clean back-to-front depth layering
  const fingerSpecs = [
    { base: pKIdx, mid: pPipIdx, tip: pTIdx, rB: 2.35 * s, rM: 2.05 * s, rT: 1.75 * s, curled: idxCurled },
    { base: pKMid, mid: pPipMid, tip: pTMid, rB: 2.35 * s, rM: 2.05 * s, rT: 1.75 * s, curled: midCurled },
    { base: pKRing, mid: pPipRing, tip: pTRing, rB: 2.15 * s, rM: 1.9 * s, rT: 1.6 * s, curled: ringCurled },
    { base: pKPinky, mid: pPipPinky, tip: pTPinky, rB: 1.85 * s, rM: 1.65 * s, rT: 1.4 * s, curled: pinkyCurled },
  ];

  const backDigits: { depth: number; svg: string }[] = [];
  const frontDigits: { depth: number; svg: string }[] = [];

  for (const fg of fingerSpecs) {
    const svg = buildArticulatedFingerSvg(
      fg.base,
      fg.mid,
      fg.tip,
      fg.rB,
      fg.rM,
      fg.rT,
      palmGrad,
      strokeCol,
      isPalmFacing,
      fg.curled
    );
    const avgDepth = (fg.mid.depth + fg.tip.depth) * 0.5;
    if (fg.curled) {
      // Curled fingers rest on the front of the palm when palm faces viewer,
      // and tuck naturally behind the back of the hand when dorsal side faces viewer.
      if (isPalmFacing) frontDigits.push({ depth: avgDepth, svg });
      else backDigits.push({ depth: avgDepth, svg });
    } else if (avgDepth > pPalmCenter.depth + 2) {
      backDigits.push({ depth: avgDepth, svg });
    } else {
      frontDigits.push({ depth: avgDepth, svg });
    }
  }

  // Articulated 2-segment thumb
  const thumbSvg = buildArticulatedFingerSvg(
    pThumbBase,
    pThumbKnuckle,
    pThumbTip,
    2.7 * s,
    2.3 * s,
    1.95 * s,
    palmGrad,
    strokeCol,
    isPalmFacing,
    false
  );
  const thumbDepth = (pThumbKnuckle.depth + pThumbTip.depth) * 0.5;
  if (isPalmFacing || thumbDepth <= pPalmCenter.depth + 2) {
    frontDigits.push({ depth: thumbDepth - 1, svg: thumbSvg });
  } else {
    backDigits.push({ depth: thumbDepth, svg: thumbSvg });
  }

  backDigits.sort((a, b) => b.depth - a.depth);
  frontDigits.sort((a, b) => b.depth - a.depth);

  const forearmSvg = buildForearmSvg(pElbow, pWrist, s);
  const palmSvg = buildContouredPalmSvg(
    pWrist,
    pThumbBase,
    pKIdx,
    pKMid,
    pKRing,
    pKPinky,
    pPalmCenter,
    s,
    isPalmFacing,
    palmGrad,
    strokeCol
  );

  return `
    ${forearmSvg}
    ${backDigits.map((d) => d.svg).join('')}
    ${palmSvg}
    ${frontDigits.map((d) => d.svg).join('')}
  `;
}

export interface BaseHandLayerParams {
  cam: any;
  ox: number;
  oy: number;
  mode: BslBaseHandMode;
  activeShape: any;
  activePalm: any;
  easeT: number;
  leftElbow3D: Point3D;
  idleBreathY: number;
  targetPose: BslHandPose;
  prevBaseWrist: Point3D;
  prevBaseKnuckle: Point3D;
  prevBasePalm: Point3D;
  prevBaseTip: Point3D;
}

export interface BaseHandLayerResult {
  html: string;
  liveBaseForearm: Point3D;
  liveBaseWrist: Point3D;
  liveBaseKnuckle: Point3D;
  liveBasePalm: Point3D;
  liveBaseTip: Point3D;
}

export function buildBaseHandLayerSvg(params: BaseHandLayerParams): BaseHandLayerResult {
  const {
    cam,
    ox,
    oy,
    mode,
    activeShape,
    activePalm,
    easeT,
    leftElbow3D,
    idleBreathY,
    targetPose,
    prevBaseWrist,
    prevBaseKnuckle,
    prevBasePalm,
    prevBaseTip,
  } = params;

  // 1. Bilateral Symmetrical Kinematics (PRAY, CHURCH, EQUAL, WHAT, SCIENCE, BIBLE, etc.)
  if (mode === 'mirror') {
    const targetMirrorWrist: Point3D = { x: -targetPose.targetWrist.x, y: targetPose.targetWrist.y + idleBreathY, z: targetPose.targetWrist.z };
    const targetMirrorKnuckle: Point3D = { x: -targetPose.targetKnuckle.x, y: targetPose.targetKnuckle.y + idleBreathY, z: targetPose.targetKnuckle.z };
    const targetMirrorTip: Point3D = { x: -targetPose.targetTip.x, y: targetPose.targetTip.y + idleBreathY, z: targetPose.targetTip.z };

    const mWrist = lerpRaw3D(prevBaseWrist, targetMirrorWrist, easeT);
    const mKnuckle = lerpRaw3D(prevBaseKnuckle, targetMirrorKnuckle, easeT);
    const mTip = lerpRaw3D(prevBaseTip, targetMirrorTip, easeT);

    const solvedDom = solveHandKinematics(
      { x: -mWrist.x, y: mWrist.y, z: mWrist.z },
      { x: -mKnuckle.x, y: mKnuckle.y, z: mKnuckle.z },
      { x: -mTip.x, y: mTip.y, z: mTip.z },
      activeShape,
      activePalm
    );
    const liveBaseForearm: Point3D = { ...leftElbow3D };
    const liveBaseWrist: Point3D = mWrist;
    const liveBaseKnuckle: Point3D = { x: -solvedDom.knuckleIndex.x, y: solvedDom.knuckleIndex.y, z: solvedDom.knuckleIndex.z };
    const liveBasePalm: Point3D = { x: -solvedDom.palm.x, y: solvedDom.palm.y, z: solvedDom.palm.z };
    const liveBaseTip: Point3D = { x: -solvedDom.tipIndex.x, y: solvedDom.tipIndex.y, z: solvedDom.tipIndex.z };

    const html = renderSolvedArticulatedHandSvg(solvedDom, leftElbow3D, true, cam, ox, oy);
    return { html, liveBaseForearm, liveBaseWrist, liveBaseKnuckle, liveBasePalm, liveBaseTip };
  }

  // 2. BANZSL Two-Handed Manual Alphabet / Vowel Board ('vowel-board')
  if (mode === 'vowel-board') {
    const iWrist = lerpRaw3D(prevBaseWrist, BSL_BASE_HAND.wrist, easeT);
    const iPalm = lerpRaw3D(prevBasePalm, BSL_BASE_HAND.palm, easeT);
    const palmShiftX = iPalm.x - BSL_BASE_HAND.palm.x;
    const palmShiftY = iPalm.y - BSL_BASE_HAND.palm.y;
    const palmShiftZ = iPalm.z - BSL_BASE_HAND.palm.z;

    const liveBaseForearm: Point3D = { ...leftElbow3D };
    const liveBaseWrist: Point3D = iWrist;
    const liveBaseKnuckle: Point3D = { x: iPalm.x, y: iPalm.y - 12, z: iPalm.z + 2 };
    const liveBasePalm: Point3D = iPalm;
    const liveBaseTip: Point3D = {
      x: BSL_BASE_HAND.fingertips[2].x + palmShiftX,
      y: BSL_BASE_HAND.fingertips[2].y + palmShiftY,
      z: BSL_BASE_HAND.fingertips[2].z + palmShiftZ,
    };

    const pForearm = project3DToSvg(leftElbow3D, cam, ox, oy);
    const pWrist = project3DToSvg(iWrist, cam, ox, oy);
    const pPalm = project3DToSvg(iPalm, cam, ox, oy);
    const s = clampScale(pPalm.scale);

    // Distinct anatomical knuckle anchors radiating smoothly to the exact 5 vowel tips (A, E, I, O, U)
    const shiftedTips: Point3D[] = BSL_BASE_HAND.fingertips.map((tipPt) => ({
      x: tipPt.x + palmShiftX,
      y: tipPt.y + palmShiftY,
      z: tipPt.z + palmShiftZ,
    }));
    const knuckleAnchors3D: Point3D[] = [
      lerpRaw3D(iWrist, shiftedTips[0], 0.42), // Thumb base (A)
      lerpRaw3D(iPalm, shiftedTips[1], 0.34),  // Index knuckle (E)
      lerpRaw3D(iPalm, shiftedTips[2], 0.32),  // Middle knuckle (I)
      lerpRaw3D(iPalm, shiftedTips[3], 0.34),  // Ring knuckle (O)
      lerpRaw3D(iPalm, shiftedTips[4], 0.38),  // Pinky knuckle (U)
    ];

    const pKnuckles = knuckleAnchors3D.map((pt) => project3DToSvg(pt, cam, ox, oy));
    const pTips = shiftedTips.map((pt) => project3DToSvg(pt, cam, ox, oy));
    const digitRadii: [number, number, number][] = [
      [2.8 * s, 2.35 * s, 2.0 * s], // Thumb (A)
      [2.45 * s, 2.1 * s, 1.8 * s], // Index (E)
      [2.45 * s, 2.1 * s, 1.8 * s], // Middle (I)
      [2.25 * s, 1.95 * s, 1.65 * s], // Ring (O)
      [1.95 * s, 1.7 * s, 1.45 * s], // Pinky (U)
    ];

    let fingersSvg = '';
    for (let idx = 0; idx < 5; idx++) {
      const pBase = pKnuckles[idx];
      const pTip = pTips[idx];
      const pMid: Projected2D = {
        x: (pBase.x + pTip.x) * 0.5,
        y: (pBase.y + pTip.y) * 0.5,
        scale: pTip.scale,
        depth: (pBase.depth + pTip.depth) * 0.5,
      };
      const [rB, rM, rT] = digitRadii[idx];
      fingersSvg += buildArticulatedFingerSvg(pBase, pMid, pTip, rB, rM, rT, 'bsl-hand-palm', '#c98050', true, false);

      // Clean vowel target guide (amber highlight for active vowel, subtle sky marker for others)
      const isTarget = targetPose.isVowel && targetPose.activeVowelIndex === idx;
      const color = isTarget ? '#f59e0b' : '#38bdf8';
      fingersSvg += `
        <circle cx="${f1(pTip.x)}" cy="${f1(pTip.y)}" r="${isTarget ? f1(4.6 * s) : f1(2.9 * s)}" fill="${color}" fill-opacity="${isTarget ? '0.92' : '0.78'}" stroke="#ffffff" stroke-width="1" filter="${isTarget ? 'url(#bsl-glow)' : 'none'}" />
        <circle cx="${f1(pTip.x)}" cy="${f1(pTip.y)}" r="${isTarget ? f1(1.6 * s) : f1(1.0 * s)}" fill="#ffffff" />
      `;
    }

    const palmSvg = buildContouredPalmSvg(
      pWrist,
      pKnuckles[0],
      pKnuckles[1],
      pKnuckles[2],
      pKnuckles[3],
      pKnuckles[4],
      pPalm,
      s,
      true,
      'bsl-hand-palm',
      '#c98050'
    );

    const html = `
      ${buildForearmSvg(pForearm, pWrist, s)}
      ${palmSvg}
      ${fingersSvg}
    `;
    return { html, liveBaseForearm, liveBaseWrist, liveBaseKnuckle, liveBasePalm, liveBaseTip };
  }

  // 3. Base Workbench Anchor ('base-hold') — anatomical flat resting workbench hand
  if (mode === 'base-hold') {
    const targetWrist: Point3D = { x: -58, y: 52, z: 10 };
    const targetPalm: Point3D = { x: -42, y: 36, z: 15 };
    const targetTip: Point3D = { x: -22, y: 33, z: 16 };

    const baseWrist = lerpRaw3D(prevBaseWrist, targetWrist, easeT);
    const baseHoldAnchor = lerpRaw3D(prevBasePalm, targetPalm, easeT);
    const baseTip = lerpRaw3D(prevBaseTip, targetTip, easeT);

    const liveBaseForearm: Point3D = { ...leftElbow3D };
    const liveBaseWrist: Point3D = baseWrist;
    const liveBaseKnuckle: Point3D = baseHoldAnchor;
    const liveBasePalm: Point3D = baseHoldAnchor;
    const liveBaseTip: Point3D = baseTip;

    // Solve cleanly as a left-hand flat-closed palm-up workbench surface
    const solvedHold = solveHandKinematics(
      { x: -baseWrist.x, y: baseWrist.y, z: baseWrist.z },
      { x: -baseHoldAnchor.x, y: baseHoldAnchor.y, z: baseHoldAnchor.z },
      { x: -baseTip.x, y: baseTip.y, z: baseTip.z },
      'flat-closed',
      'up'
    );
    const html = renderSolvedArticulatedHandSvg(solvedHold, leftElbow3D, true, cam, ox, oy);
    return { html, liveBaseForearm, liveBaseWrist, liveBaseKnuckle, liveBasePalm, liveBaseTip };
  }

  // 3b. Override spatial anchor & Level 6 Discourse Buoys ('override', 'buoy-list', 'buoy-pointer')
  if (mode === 'override' || mode === 'buoy-list' || mode === 'buoy-pointer') {
    const ov = targetPose.baseHandOverride;
    const targetPalm: Point3D = ov?.palm || {
      x: BSL_BASE_HAND.palm.x + (ov?.shiftX || 0),
      y: BSL_BASE_HAND.palm.y + (ov?.shiftY || 0),
      z: BSL_BASE_HAND.palm.z + (ov?.shiftZ || 10),
    };
    const targetWrist: Point3D = ov?.wrist || {
      x: targetPalm.x - 16,
      y: targetPalm.y + 28,
      z: targetPalm.z - 8,
    };

    const anchorWrist = lerpRaw3D(prevBaseWrist, targetWrist, easeT);
    const anchorPalm = lerpRaw3D(prevBasePalm, targetPalm, easeT);

    const liveBaseForearm: Point3D = { ...leftElbow3D };
    const liveBaseWrist: Point3D = anchorWrist;
    const liveBaseKnuckle: Point3D = anchorPalm;
    const liveBasePalm: Point3D = anchorPalm;
    const liveBaseTip: Point3D = { x: anchorPalm.x, y: anchorPalm.y - 26, z: anchorPalm.z + 6 };

    const pF = project3DToSvg(leftElbow3D, cam, ox, oy);
    const pW = project3DToSvg(anchorWrist, cam, ox, oy);
    const pP = project3DToSvg(anchorPalm, cam, ox, oy);
    const s = clampScale(pP.scale);

    const kPts3D: Point3D[] = [
      { x: anchorPalm.x - 11, y: anchorPalm.y - 6, z: anchorPalm.z + 3 },
      { x: anchorPalm.x - 4, y: anchorPalm.y - 9, z: anchorPalm.z + 4 },
      { x: anchorPalm.x + 3, y: anchorPalm.y - 8, z: anchorPalm.z + 4 },
      { x: anchorPalm.x + 10, y: anchorPalm.y - 5, z: anchorPalm.z + 3 },
    ];
    const thumbBase3D: Point3D = { x: anchorPalm.x - 13, y: anchorPalm.y + 5, z: anchorPalm.z + 2 };
    const pThumbBase = project3DToSvg(thumbBase3D, cam, ox, oy);
    const pKs = kPts3D.map((pt) => project3DToSvg(pt, cam, ox, oy));

    const buoyCount = mode === 'buoy-pointer' ? 1 : Math.min(4, targetPose.buoy?.count || 3);
    let digitsSvg = '';
    for (let d = 0; d < 4; d++) {
      const extended = d < buoyCount;
      const tip3D: Point3D = extended
        ? { x: kPts3D[d].x + (d - 1.5) * 2.5, y: kPts3D[d].y - 20, z: kPts3D[d].z + 3 }
        : { x: kPts3D[d].x, y: anchorPalm.y + 3, z: anchorPalm.z + 5 };
      const mid3D = lerpRaw3D(kPts3D[d], tip3D, 0.52);
      const pMid = project3DToSvg(mid3D, cam, ox, oy);
      const pTip = project3DToSvg(tip3D, cam, ox, oy);
      digitsSvg += buildArticulatedFingerSvg(
        pKs[d],
        pMid,
        pTip,
        (2.3 - d * 0.12) * s,
        (2.0 - d * 0.1) * s,
        (1.65 - d * 0.08) * s,
        'bsl-hand-palm',
        '#c98050',
        true,
        !extended
      );
      if (extended) {
        digitsSvg += `<circle cx="${f1(pTip.x)}" cy="${f1(pTip.y)}" r="${f1(2.2 * s)}" fill="#38bdf8" stroke="#ffffff" stroke-width="0.9" />`;
      }
    }

    const palmSvg = buildContouredPalmSvg(
      pW,
      pThumbBase,
      pKs[0],
      pKs[1],
      pKs[2],
      pKs[3],
      pP,
      s,
      true,
      'bsl-hand-palm',
      '#c98050'
    );

    const html = `
      ${buildForearmSvg(pF, pW, s)}
      ${palmSvg}
      ${digitsSvg}
    `;
    return { html, liveBaseForearm, liveBaseWrist, liveBaseKnuckle, liveBasePalm, liveBaseTip };
  }

  // 4. Symmetrical 5-Finger Ready Rest Posture ('rest') — springs smoothly from any prior base hand pose
  const targetRestWrist: Point3D = { x: -DOMINANT_REST_WRIST.x, y: DOMINANT_REST_WRIST.y + idleBreathY, z: DOMINANT_REST_WRIST.z };
  const targetRestKnuckle: Point3D = { x: -DOMINANT_REST_KNUCKLE.x, y: DOMINANT_REST_KNUCKLE.y + idleBreathY, z: DOMINANT_REST_KNUCKLE.z };
  const targetRestTip: Point3D = { x: -DOMINANT_REST_POSE.x, y: DOMINANT_REST_POSE.y + idleBreathY, z: DOMINANT_REST_POSE.z };

  const baseWrist = lerpRaw3D(prevBaseWrist, targetRestWrist, easeT);
  const baseKnuckle = lerpRaw3D(prevBaseKnuckle, targetRestKnuckle, easeT);
  const baseTip = lerpRaw3D(prevBaseTip, targetRestTip, easeT);

  // Solve 5-finger left hand kinematics by mirroring across sagittal plane
  const solvedMirror = solveHandKinematics(
    { x: -baseWrist.x, y: baseWrist.y, z: baseWrist.z },
    { x: -baseKnuckle.x, y: baseKnuckle.y, z: baseKnuckle.z },
    { x: -baseTip.x, y: baseTip.y, z: baseTip.z },
    'flat-closed',
    'in'
  );

  const liveBaseForearm: Point3D = { ...leftElbow3D };
  const liveBaseWrist: Point3D = baseWrist;
  const liveBaseKnuckle: Point3D = baseKnuckle;
  const liveBasePalm: Point3D = { x: -solvedMirror.palm.x, y: solvedMirror.palm.y, z: solvedMirror.palm.z };
  const liveBaseTip: Point3D = baseTip;

  const html = renderSolvedArticulatedHandSvg(solvedMirror, leftElbow3D, true, cam, ox, oy);
  return { html, liveBaseForearm, liveBaseWrist, liveBaseKnuckle, liveBasePalm, liveBaseTip };
}

export function buildDominantHandLayerSvg(
  cam: any,
  ox: number,
  oy: number,
  wrist: Point3D,
  knuckle: Point3D,
  tip: Point3D,
  shape: any,
  palm: any,
  rightElbow3D: Point3D = { x: 66, y: 35, z: -5 }
): string {
  // Kinematic Hand Solver with forearm anchored directly to the anatomical right elbow
  const solved = solveHandKinematics(wrist, knuckle, tip, shape, palm);
  return renderSolvedArticulatedHandSvg(solved, rightElbow3D, false, cam, ox, oy);
}
