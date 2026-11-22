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

    const pForearm = project3DToSvg(leftElbow3D, cam, ox, oy);
    const pWrist = project3DToSvg(liveBaseWrist, cam, ox, oy);
    const pPalm = project3DToSvg(liveBasePalm, cam, ox, oy);
    const pKnuckleIndex = project3DToSvg(liveBaseKnuckle, cam, ox, oy);
    const pTipIndex = project3DToSvg(liveBaseTip, cam, ox, oy);
    const pTipMid = project3DToSvg({ x: -solvedDom.tipMid.x, y: solvedDom.tipMid.y, z: solvedDom.tipMid.z }, cam, ox, oy);
    const pTipRing = project3DToSvg({ x: -solvedDom.tipRing.x, y: solvedDom.tipRing.y, z: solvedDom.tipRing.z }, cam, ox, oy);
    const pTipPinky = project3DToSvg({ x: -solvedDom.tipPinky.x, y: solvedDom.tipPinky.y, z: solvedDom.tipPinky.z }, cam, ox, oy);
    const pThumbTip = project3DToSvg({ x: -solvedDom.thumbTip.x, y: solvedDom.thumbTip.y, z: solvedDom.thumbTip.z }, cam, ox, oy);
    const pThumbKnuckle = project3DToSvg({ x: -solvedDom.thumbKnuckle.x, y: solvedDom.thumbKnuckle.y, z: solvedDom.thumbKnuckle.z }, cam, ox, oy);

    const html = `
        <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="10" stroke-linecap="round" />
        <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9" stroke-linecap="round" />
        <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="10" ry="8.5" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.4" />
        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pThumbKnuckle.x.toFixed(1)}" y2="${pThumbKnuckle.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
        <line x1="${pThumbKnuckle.x.toFixed(1)}" y1="${pThumbKnuckle.y.toFixed(1)}" x2="${pThumbTip.x.toFixed(1)}" y2="${pThumbTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4" stroke-linecap="round" />
        <circle cx="${pThumbTip.x.toFixed(1)}" cy="${pThumbTip.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />
        <line x1="${pKnuckleIndex.x.toFixed(1)}" y1="${pKnuckleIndex.y.toFixed(1)}" x2="${pTipIndex.x.toFixed(1)}" y2="${pTipIndex.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="5.2" stroke-linecap="round" />
        <circle cx="${pKnuckleIndex.x.toFixed(1)}" cy="${pKnuckleIndex.y.toFixed(1)}" r="2.8" fill="#f8be93" />
        <circle cx="${pTipIndex.x.toFixed(1)}" cy="${pTipIndex.y.toFixed(1)}" r="3.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" filter="url(#bsl-glow)" />
        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipMid.x.toFixed(1)}" y2="${pTipMid.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.2" stroke-linecap="round" />
        <circle cx="${pTipMid.x.toFixed(1)}" cy="${pTipMid.y.toFixed(1)}" r="2.5" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipRing.x.toFixed(1)}" y2="${pTipRing.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.8" stroke-linecap="round" />
        <circle cx="${pTipRing.x.toFixed(1)}" cy="${pTipRing.y.toFixed(1)}" r="2.3" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipPinky.x.toFixed(1)}" y2="${pTipPinky.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.2" stroke-linecap="round" />
        <circle cx="${pTipPinky.x.toFixed(1)}" cy="${pTipPinky.y.toFixed(1)}" r="2" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
      `;
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

    let fingersSvg = '';
    BSL_BASE_HAND.fingertips.forEach((tipPt, idx) => {
      const shiftedTip: Point3D = {
        x: tipPt.x + palmShiftX,
        y: tipPt.y + palmShiftY,
        z: tipPt.z + palmShiftZ,
      };
      const pTip = project3DToSvg(shiftedTip, cam, ox, oy);
      const isTarget = targetPose.isVowel && targetPose.activeVowelIndex === idx;
      const color = isTarget ? '#f59e0b' : '#38bdf8';
      fingersSvg += `
          <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTip.x.toFixed(1)}" y2="${pTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
          <circle cx="${pTip.x.toFixed(1)}" cy="${pTip.y.toFixed(1)}" r="${isTarget ? '5.4' : '4'}" fill="${color}" stroke="#ffffff" stroke-width="1.2" filter="${isTarget ? 'url(#bsl-glow)' : 'none'}" />
          <circle cx="${pTip.x.toFixed(1)}" cy="${pTip.y.toFixed(1)}" r="1.5" fill="#ffffff" />
        `;
    });

    const html = `
        <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="11.5" ry="9.5" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.5" />
        <path d="M ${(pPalm.x - 5).toFixed(1)} ${pPalm.y.toFixed(1)} Q ${pPalm.x.toFixed(1)} ${(pPalm.y + 3).toFixed(1)} ${(pPalm.x + 5).toFixed(1)} ${pPalm.y.toFixed(1)}" stroke="#d99564" stroke-width="1" fill="none" />
        ${fingersSvg}
      `;
    return { html, liveBaseForearm, liveBaseWrist, liveBaseKnuckle, liveBasePalm, liveBaseTip };
  }

  // 3. Base Workbench Anchor ('base-hold')
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

    const pF = project3DToSvg(leftElbow3D, cam, ox, oy);
    const pW = project3DToSvg(baseWrist, cam, ox, oy);
    const pP = project3DToSvg(baseHoldAnchor, cam, ox, oy);
    const pFingers = project3DToSvg(baseTip, cam, ox, oy);

    const html = `
        <line x1="${pF.x.toFixed(1)}" y1="${pF.y.toFixed(1)}" x2="${pW.x.toFixed(1)}" y2="${pW.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pW.x.toFixed(1)}" y1="${pW.y.toFixed(1)}" x2="${pP.x.toFixed(1)}" y2="${pP.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        <ellipse cx="${pP.x.toFixed(1)}" cy="${pP.y.toFixed(1)}" rx="12" ry="7.5" fill="url(#bsl-hand-base)" stroke="#0284c7" stroke-width="1.8" />
        <line x1="${pP.x.toFixed(1)}" y1="${pP.y.toFixed(1)}" x2="${pFingers.x.toFixed(1)}" y2="${pFingers.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="6.5" stroke-linecap="round" />
        <circle cx="${pFingers.x.toFixed(1)}" cy="${pFingers.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />
      `;
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

    const buoyCount = mode === 'buoy-pointer' ? 1 : targetPose.buoy?.count || 3;
    let digitsSvg = '';
    for (let d = 0; d < Math.min(4, buoyCount); d++) {
      const fingerOffset = (d - 1.5) * 9;
      const pD = project3DToSvg(
        { x: anchorPalm.x + fingerOffset, y: anchorPalm.y - 26, z: anchorPalm.z + 6 },
        cam,
        ox,
        oy
      );
      digitsSvg += `
          <line x1="${pP.x.toFixed(1)}" y1="${pP.y.toFixed(1)}" x2="${pD.x.toFixed(1)}" y2="${pD.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.4" stroke-linecap="round" />
          <circle cx="${pD.x.toFixed(1)}" cy="${pD.y.toFixed(1)}" r="2.8" fill="#38bdf8" stroke="#ffffff" stroke-width="1" />
        `;
    }

    const html = `
        <line x1="${pF.x.toFixed(1)}" y1="${pF.y.toFixed(1)}" x2="${pW.x.toFixed(1)}" y2="${pW.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pW.x.toFixed(1)}" y1="${pW.y.toFixed(1)}" x2="${pP.x.toFixed(1)}" y2="${pP.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        <ellipse cx="${pP.x.toFixed(1)}" cy="${pP.y.toFixed(1)}" rx="11" ry="8.5" fill="url(#bsl-hand-base)" stroke="#0284c7" stroke-width="1.5" />
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

  const pForearm = project3DToSvg(leftElbow3D, cam, ox, oy);
  const pWrist = project3DToSvg(baseWrist, cam, ox, oy);
  const pPalm = project3DToSvg(liveBasePalm, cam, ox, oy);
  const pKnuckleIndex = project3DToSvg({ x: -solvedMirror.knuckleIndex.x, y: solvedMirror.knuckleIndex.y, z: solvedMirror.knuckleIndex.z }, cam, ox, oy);
  const pTipIndex = project3DToSvg({ x: -solvedMirror.tipIndex.x, y: solvedMirror.tipIndex.y, z: solvedMirror.tipIndex.z }, cam, ox, oy);
  const pTipMid = project3DToSvg({ x: -solvedMirror.tipMid.x, y: solvedMirror.tipMid.y, z: solvedMirror.tipMid.z }, cam, ox, oy);
  const pTipRing = project3DToSvg({ x: -solvedMirror.tipRing.x, y: solvedMirror.tipRing.y, z: solvedMirror.tipRing.z }, cam, ox, oy);
  const pTipPinky = project3DToSvg({ x: -solvedMirror.tipPinky.x, y: solvedMirror.tipPinky.y, z: solvedMirror.tipPinky.z }, cam, ox, oy);
  const pThumbTip = project3DToSvg({ x: -solvedMirror.thumbTip.x, y: solvedMirror.thumbTip.y, z: solvedMirror.thumbTip.z }, cam, ox, oy);
  const pThumbKnuckle = project3DToSvg({ x: -solvedMirror.thumbKnuckle.x, y: solvedMirror.thumbKnuckle.y, z: solvedMirror.thumbKnuckle.z }, cam, ox, oy);

  const html = `
      <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
      <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
      <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="9.5" ry="8" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.3" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pThumbKnuckle.x.toFixed(1)}" y2="${pThumbKnuckle.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.5" stroke-linecap="round" />
      <line x1="${pThumbKnuckle.x.toFixed(1)}" y1="${pThumbKnuckle.y.toFixed(1)}" x2="${pThumbTip.x.toFixed(1)}" y2="${pThumbTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.8" stroke-linecap="round" />
      <circle cx="${pThumbTip.x.toFixed(1)}" cy="${pThumbTip.y.toFixed(1)}" r="2.8" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.9" />
      <line x1="${pKnuckleIndex.x.toFixed(1)}" y1="${pKnuckleIndex.y.toFixed(1)}" x2="${pTipIndex.x.toFixed(1)}" y2="${pTipIndex.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
      <circle cx="${pKnuckleIndex.x.toFixed(1)}" cy="${pKnuckleIndex.y.toFixed(1)}" r="2.5" fill="#f8be93" />
      <circle cx="${pTipIndex.x.toFixed(1)}" cy="${pTipIndex.y.toFixed(1)}" r="2.8" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.9" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipMid.x.toFixed(1)}" y2="${pTipMid.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4" stroke-linecap="round" />
      <circle cx="${pTipMid.x.toFixed(1)}" cy="${pTipMid.y.toFixed(1)}" r="2.3" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipRing.x.toFixed(1)}" y2="${pTipRing.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.6" stroke-linecap="round" />
      <circle cx="${pTipRing.x.toFixed(1)}" cy="${pTipRing.y.toFixed(1)}" r="2.1" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipPinky.x.toFixed(1)}" y2="${pTipPinky.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.1" stroke-linecap="round" />
      <circle cx="${pTipPinky.x.toFixed(1)}" cy="${pTipPinky.y.toFixed(1)}" r="1.9" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
    `;
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

  const pForearm = project3DToSvg(rightElbow3D, cam, ox, oy);
  const pWrist = project3DToSvg(solved.wrist, cam, ox, oy);
  const pPalm = project3DToSvg(solved.palm, cam, ox, oy);
  const pKnuckleIndex = project3DToSvg(solved.knuckleIndex, cam, ox, oy);
  const pTipIndex = project3DToSvg(solved.tipIndex, cam, ox, oy);
  const pTipMid = project3DToSvg(solved.tipMid, cam, ox, oy);
  const pTipRing = project3DToSvg(solved.tipRing, cam, ox, oy);
  const pTipPinky = project3DToSvg(solved.tipPinky, cam, ox, oy);
  const pThumbTip = project3DToSvg(solved.thumbTip, cam, ox, oy);
  const pThumbKnuckle = project3DToSvg(solved.thumbKnuckle, cam, ox, oy);

  return `
      <!-- Forearm Limb in Natural Skin Tone -->
      <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="10" stroke-linecap="round" />
      
      <!-- Wrist to Palm Pad (Thenar & Hypothenar Cushion) -->
      <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9" stroke-linecap="round" />
      <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="10" ry="8.5" fill="url(#bsl-hand-dominant)" stroke="#cb7c49" stroke-width="1.4" />
      
      <!-- Thumb (Metacarpal + Phalanx) -->
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pThumbKnuckle.x.toFixed(1)}" y2="${pThumbKnuckle.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="4.8" stroke-linecap="round" />
      <line x1="${pThumbKnuckle.x.toFixed(1)}" y1="${pThumbKnuckle.y.toFixed(1)}" x2="${pThumbTip.x.toFixed(1)}" y2="${pThumbTip.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="4" stroke-linecap="round" />
      <circle cx="${pThumbTip.x.toFixed(1)}" cy="${pThumbTip.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />

      <!-- Primary Index Finger (Proximal + Intermediate + Distal Phalanx) -->
      <line x1="${pKnuckleIndex.x.toFixed(1)}" y1="${pKnuckleIndex.y.toFixed(1)}" x2="${pTipIndex.x.toFixed(1)}" y2="${pTipIndex.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="5.2" stroke-linecap="round" />
      <!-- Knuckle accent -->
      <circle cx="${pKnuckleIndex.x.toFixed(1)}" cy="${pKnuckleIndex.y.toFixed(1)}" r="2.8" fill="#f8be93" />
      <!-- Fingertip pad & nail highlight -->
      <circle cx="${pTipIndex.x.toFixed(1)}" cy="${pTipIndex.y.toFixed(1)}" r="3.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" filter="url(#bsl-glow)" />

      <!-- Secondary Fingers (Mid, Ring, Pinky) -->
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipMid.x.toFixed(1)}" y2="${pTipMid.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="4.2" stroke-linecap="round" />
      <circle cx="${pTipMid.x.toFixed(1)}" cy="${pTipMid.y.toFixed(1)}" r="2.5" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />

      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipRing.x.toFixed(1)}" y2="${pTipRing.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="3.8" stroke-linecap="round" />
      <circle cx="${pTipRing.x.toFixed(1)}" cy="${pTipRing.y.toFixed(1)}" r="2.3" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />

      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipPinky.x.toFixed(1)}" y2="${pTipPinky.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="3.2" stroke-linecap="round" />
      <circle cx="${pTipPinky.x.toFixed(1)}" cy="${pTipPinky.y.toFixed(1)}" r="2" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
    `;
}
