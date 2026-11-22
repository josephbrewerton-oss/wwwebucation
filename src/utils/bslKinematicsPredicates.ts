// src/utils/bslKinematicsPredicates.ts
/**
 * BSL Level 6 Polycomponential Classifier Predicates & Directional Agreement
 * Verb trajectory generators extracted from bslGrammarEngine.ts.
 */

import type {
  Point3D,
  BslClassifierType,
  BslAspect,
  BslDirectionalVerbType,
} from './bslAlphabet';
import type { BslSign, BslSignKeyframe } from './bslLexicon';
import {
  DEFAULT_BSL_LOCI,
  CLASSIFIER_VERB_MAP,
  type BslLocusId,
} from './bslSpatialMaps';

/**
 * Procedurally generates a BSL Level 6 Classifier Predicate sign with 3D trajectories
 * and aspectual kinematic inflections (durative circular waves, intensive snap holds, etc.).
 */
export function generateClassifierPredicate(
  type: BslClassifierType,
  options: {
    fromLocus?: BslLocusId;
    toLocus?: BslLocusId;
    aspect?: BslAspect;
    manner?: 'slow' | 'fast' | 'stumble' | 'steady' | 'zig-zag';
    entityLabel?: string;
  } = {}
): BslSign {
  const fromLocus = options.fromLocus || 'LOCUS_A';
  const toLocus = options.toLocus || 'LOCUS_B';
  const aspect = options.aspect || 'neutral';
  const p0 = DEFAULT_BSL_LOCI[fromLocus]?.coords || { x: -45, y: 15, z: 25 };
  const p1 = DEFAULT_BSL_LOCI[toLocus]?.coords || { x: 45, y: 15, z: 25 };

  let glossLabel = `CL:${type.toUpperCase()}[${fromLocus}→${toLocus}${aspect !== 'neutral' ? `:${aspect.toUpperCase()}` : ''}]`;
  const kfs: BslSignKeyframe[] = [];

  switch (type) {
    case 'proform-v': {
      glossLabel = `CL:V[${fromLocus}→${toLocus}${aspect !== 'neutral' ? `:${aspect.toUpperCase()}` : ''}]`;
      if (aspect === 'durative') {
        kfs.push({
          label: 'CL:V • Prep & Initial Step',
          rule: 'Inverted V hand lifts at origin locus',
          targetTip: { x: p0.x, y: p0.y - 10, z: p0.z },
          targetKnuckle: { x: p0.x + 20, y: p0.y + 15, z: p0.z - 10 },
          targetWrist: { x: p0.x + 50, y: p0.y + 50, z: p0.z - 25 },
          shape: 'v',
          palm: 'down',
          hold: 80,
          ease: 'ease-out',
          nmf: { eyebrows: 'neutral', mouth: 'mm' },
        });
        const midX1 = p0.x + (p1.x - p0.x) * 0.33;
        const midX2 = p0.x + (p1.x - p0.x) * 0.66;
        kfs.push({
          label: 'CL:V • Mid Stride Step 1',
          rule: 'First leg extends forward along trajectory',
          targetTip: { x: midX1, y: p0.y + 5, z: p0.z + 5 },
          targetKnuckle: { x: midX1 + 20, y: p0.y + 30, z: p0.z - 5 },
          targetWrist: { x: midX1 + 50, y: p0.y + 65, z: p0.z - 20 },
          shape: 'v',
          palm: 'down',
          ease: 'linear',
          nmf: { eyebrows: 'neutral', mouth: 'mm' },
        });
        kfs.push({
          label: 'CL:V • Mid Stride Step 2',
          rule: 'Second leg follows through with steady cadence',
          targetTip: { x: midX2, y: p0.y - 5, z: p0.z + 8 },
          targetKnuckle: { x: midX2 + 20, y: p0.y + 20, z: p0.z - 2 },
          targetWrist: { x: midX2 + 50, y: p0.y + 55, z: p0.z - 18 },
          shape: 'v',
          palm: 'down',
          ease: 'linear',
          nmf: { eyebrows: 'neutral', mouth: 'mm' },
        });
        kfs.push({
          label: 'CL:V • Settle at Destination',
          rule: 'Both legs plant at target destination locus',
          targetTip: { x: p1.x, y: p1.y, z: p1.z },
          targetKnuckle: { x: p1.x + 20, y: p1.y + 25, z: p1.z - 10 },
          targetWrist: { x: p1.x + 50, y: p1.y + 60, z: p1.z - 25 },
          shape: 'v',
          palm: 'down',
          hold: 150,
          ease: 'snap',
          nmf: { eyebrows: 'neutral', mouth: 'mm' },
        });
      } else if (aspect === 'intensive') {
        kfs.push({
          label: 'CL:V • Tense Gather at Origin',
          rule: 'Legs coiled at origin locus with tension',
          targetTip: { x: p0.x, y: p0.y - 15, z: p0.z - 5 },
          targetKnuckle: { x: p0.x + 20, y: p0.y + 10, z: p0.z - 15 },
          targetWrist: { x: p0.x + 50, y: p0.y + 45, z: p0.z - 30 },
          shape: 'v',
          palm: 'down',
          hold: 250,
          ease: 'ease-out',
          nmf: { eyebrows: 'furrowed', mouth: 'tight-lips' },
        });
        kfs.push({
          label: 'CL:V • Explosive Leap / Sprint',
          rule: 'Sudden burst across spatial plane',
          targetTip: { x: p0.x + (p1.x - p0.x) * 0.7, y: p0.y - 25, z: p0.z + 15 },
          targetKnuckle: { x: p0.x + (p1.x - p0.x) * 0.7 + 20, y: p0.y, z: p0.z + 5 },
          targetWrist: { x: p0.x + (p1.x - p0.x) * 0.7 + 50, y: p0.y + 35, z: p0.z - 10 },
          shape: 'v',
          palm: 'down',
          ease: 'snap',
          nmf: { eyebrows: 'furrowed', mouth: 'tight-lips' },
        });
        kfs.push({
          label: 'CL:V • Rigid Sudden Stop',
          rule: 'Instant snap halt at destination',
          targetTip: { x: p1.x, y: p1.y, z: p1.z },
          targetKnuckle: { x: p1.x + 20, y: p1.y + 25, z: p1.z - 10 },
          targetWrist: { x: p1.x + 50, y: p1.y + 60, z: p1.z - 25 },
          shape: 'v',
          palm: 'down',
          hold: 200,
          ease: 'snap',
          nmf: { eyebrows: 'neutral', mouth: 'tight-lips', headTilt: 'nod' },
        });
      } else {
        kfs.push({
          label: 'CL:V • Depart Locus',
          rule: 'Inverted V departs origin locus',
          targetTip: { x: p0.x, y: p0.y, z: p0.z },
          targetKnuckle: { x: p0.x + 20, y: p0.y + 25, z: p0.z - 10 },
          targetWrist: { x: p0.x + 50, y: p0.y + 60, z: p0.z - 25 },
          shape: 'v',
          palm: 'down',
          ease: 'ease-out',
        });
        kfs.push({
          label: 'CL:V • Arrive Locus',
          rule: 'Inverted V lands at destination locus',
          targetTip: { x: p1.x, y: p1.y, z: p1.z },
          targetKnuckle: { x: p1.x + 20, y: p1.y + 25, z: p1.z - 10 },
          targetWrist: { x: p1.x + 50, y: p1.y + 60, z: p1.z - 25 },
          shape: 'v',
          palm: 'down',
          hold: 120,
          ease: 'snap',
        });
      }
      break;
    }

    case 'proform-b': {
      glossLabel = `CL:B[${fromLocus}→${toLocus}${aspect !== 'neutral' ? `:${aspect.toUpperCase()}` : ''}]`;
      if (aspect === 'intensive') {
        kfs.push({
          label: 'CL:B • Vehicle Static Hold',
          rule: 'Flat hand held primed at start locus',
          targetTip: { x: p0.x, y: p0.y, z: p0.z },
          targetKnuckle: { x: p0.x + 25, y: p0.y + 15, z: p0.z - 5 },
          targetWrist: { x: p0.x + 65, y: p0.y + 40, z: p0.z - 15 },
          shape: 'flat',
          palm: 'down',
          hold: 200,
          ease: 'ease-out',
          nmf: { eyebrows: 'furrowed', mouth: 'tight-lips' },
        });
        kfs.push({
          label: 'CL:B • Sudden Acceleration & Halt',
          rule: 'Rapid forward zoom terminating with sharp stop',
          targetTip: { x: p1.x, y: p1.y, z: p1.z },
          targetKnuckle: { x: p1.x + 25, y: p1.y + 15, z: p1.z - 5 },
          targetWrist: { x: p1.x + 65, y: p1.y + 40, z: p1.z - 15 },
          shape: 'flat',
          palm: 'down',
          hold: 250,
          ease: 'snap',
          nmf: { eyebrows: 'neutral', mouth: 'puffed-cheeks', headTilt: 'nod' },
        });
      } else {
        kfs.push({
          label: 'CL:B • Depart Origin',
          rule: 'Flat hand glides forward representing vehicle motion',
          targetTip: { x: p0.x, y: p0.y, z: p0.z },
          targetKnuckle: { x: p0.x + 25, y: p0.y + 15, z: p0.z - 5 },
          targetWrist: { x: p0.x + 65, y: p0.y + 40, z: p0.z - 15 },
          shape: 'flat',
          palm: 'down',
          ease: 'linear',
          nmf: { mouth: aspect === 'durative' ? 'mm' : 'neutral' },
        });
        kfs.push({
          label: 'CL:B • Arrive Destination',
          rule: 'Vehicle comes to rest at target locus',
          targetTip: { x: p1.x, y: p1.y, z: p1.z },
          targetKnuckle: { x: p1.x + 25, y: p1.y + 15, z: p1.z - 5 },
          targetWrist: { x: p1.x + 65, y: p1.y + 40, z: p1.z - 15 },
          shape: 'flat',
          palm: 'down',
          hold: 120,
          ease: 'snap',
          nmf: { mouth: aspect === 'durative' ? 'mm' : 'neutral' },
        });
      }
      break;
    }

    case 'proform-c': {
      glossLabel = `CL:C[${fromLocus || 'LOCUS_HIGH'}]`;
      const highY = DEFAULT_BSL_LOCI.LOCUS_HIGH.coords.y; // -45
      kfs.push({
        label: 'CL:C • Frame Cylindrical Vessel',
        rule: 'C-handshape grasps perimeter of vessel at chest height',
        targetTip: { x: 0, y: -10, z: 35 },
        targetKnuckle: { x: 25, y: 15, z: 25 },
        targetWrist: { x: 60, y: 55, z: 10 },
        shape: 'c-shape',
        palm: 'side',
        ease: 'ease-out',
        nmf: { mouth: 'pursed' },
      });
      kfs.push({
        label: 'CL:C • Elevate to High Register',
        rule: 'Vessel is elevated upward to divine plane',
        targetTip: { x: 0, y: highY, z: 45 },
        targetKnuckle: { x: 25, y: highY + 25, z: 35 },
        targetWrist: { x: 60, y: highY + 65, z: 20 },
        shape: 'c-shape',
        palm: 'side',
        hold: 250,
        ease: 'snap',
        nmf: { eyebrows: 'raised', mouth: 'pursed' },
      });
      break;
    }

    case 'handling-cup': {
      glossLabel = `CL:HANDLING[CHALICE]`;
      const highY = DEFAULT_BSL_LOCI.LOCUS_HIGH.coords.y; // -45
      kfs.push({
        label: 'Handling Chalice • Two-Handed Grip at Altar',
        rule: 'Both hands clasp chalice stem and base reverently',
        targetTip: { x: 0, y: 10, z: 35 },
        targetKnuckle: { x: 25, y: 35, z: 25 },
        targetWrist: { x: 55, y: 70, z: 10 },
        shape: 'c-shape',
        baseHandMode: 'override',
        baseHandOverride: { shiftX: -30, shiftY: 0, shiftZ: 0 },
        ease: 'ease-out',
        nmf: { mouth: 'pursed' },
      });
      kfs.push({
        label: 'Handling Chalice • Reverent Elevation',
        rule: 'Both hands elevate the sacred chalice toward heaven',
        targetTip: { x: 0, y: highY, z: 45 },
        targetKnuckle: { x: 25, y: highY + 25, z: 35 },
        targetWrist: { x: 55, y: highY + 60, z: 20 },
        shape: 'c-shape',
        baseHandMode: 'override',
        baseHandOverride: { shiftX: -30, shiftY: 0, shiftZ: 0 },
        hold: 300,
        ease: 'snap',
        nmf: { eyebrows: 'raised', mouth: 'pursed' },
      });
      break;
    }

    case 'handling-book': {
      glossLabel = `CL:HANDLING[BOOK]`;
      kfs.push({
        label: 'Handling Book • Open Scripture',
        rule: 'Both open flat hands side-by-side simulate open book pages',
        targetTip: { x: 15, y: 0, z: 30 },
        targetKnuckle: { x: 45, y: 20, z: 20 },
        targetWrist: { x: 80, y: 55, z: 5 },
        shape: 'flat',
        palm: 'up',
        baseHandMode: 'mirror',
        hold: 200,
        ease: 'ease-out',
        nmf: { mouth: 'book' },
      });
      break;
    }

    case 'proform-claw': {
      glossLabel = `CL:CLAW[${fromLocus || 'LOCUS_C'}]`;
      kfs.push({
        label: 'CL:Claw • Grasp Spherical Entity',
        rule: 'Curved claw handshape encloses spherical particle/cell',
        targetTip: { x: p0.x, y: p0.y, z: p0.z + 10 },
        targetKnuckle: { x: p0.x + 25, y: p0.y + 20, z: p0.z },
        targetWrist: { x: p0.x + 60, y: p0.y + 50, z: p0.z - 15 },
        shape: 'claw',
        palm: 'down',
        hold: 160,
        ease: 'ease-out',
        nmf: { mouth: 'mm' },
      });
      break;
    }

    case 'proform-1':
    default: {
      glossLabel = `CL:1[${fromLocus}→${toLocus}]`;
      kfs.push({
        label: 'CL:1 • Upright Person Path Departure',
        rule: 'Single index finger represents person standing/departing',
        targetTip: { x: p0.x, y: p0.y - 20, z: p0.z },
        targetKnuckle: { x: p0.x + 15, y: p0.y + 10, z: p0.z - 10 },
        targetWrist: { x: p0.x + 45, y: p0.y + 45, z: p0.z - 20 },
        shape: 'point',
        palm: 'in',
        ease: 'ease-out',
      });
      kfs.push({
        label: 'CL:1 • Upright Person Path Arrival',
        rule: 'Person path arrives at target locus',
        targetTip: { x: p1.x, y: p1.y - 20, z: p1.z },
        targetKnuckle: { x: p1.x + 15, y: p1.y + 10, z: p1.z - 10 },
        targetWrist: { x: p1.x + 45, y: p1.y + 45, z: p1.z - 20 },
        shape: 'point',
        palm: 'in',
        hold: 120,
        ease: 'snap',
      });
      break;
    }
  }

  return {
    id: `cl-${type}-${aspect}`,
    word: `CL:${type.toUpperCase()}`,
    category: 'classifier',
    englishLabel: `Classifier Predicate (${type})`,
    gloss: glossLabel,
    description: `Level 6 Classifier Predicate with ${aspect} temporal aspect modulation`,
    keyframes: kfs,
    classifier: {
      type,
      aspect,
      fromLocus,
      toLocus,
      manner: options.manner,
      entityLabel: options.entityLabel,
    },
    aspect,
  };
}
export function mapWordToClassifier(word: string): { type: BslClassifierType; options?: any } | null {
  const clean = word.toLowerCase().trim();

  // 1. Flat surfaces, sheets, layers, membranes, boundaries, walls, vehicles
  if (/(layer|membrane|wall|surface|barrier|plate|stratum|boundary|sheet|horizon|car|vehicle|glide|flow)/i.test(clean)) {
    return { type: 'proform-b' as BslClassifierType, options: { aspect: 'durative' } };
  }

  // 2. Tubes, beakers, vessels, pistons, cylinders, chambers, conduits
  if (/(cylinder|tube|vessel|beaker|pipe|chamber|piston|conduit|column|container)/i.test(clean)) {
    return { type: 'proform-c' as BslClassifierType };
  }

  // 3. Sacred items, chalice, host, altar vessels
  if (/(chalice|cup|goblet|ciborium|paten)/i.test(clean)) {
    return { type: 'handling-cup' as BslClassifierType };
  }

  // 4. Texts, gospel, scripture, reading, papers
  if (/(book|bible|gospel|scripture|text|scroll|pages)/i.test(clean)) {
    return { type: 'handling-book' as BslClassifierType };
  }

  // 5. People, walking, moving agents, running, stepping
  if (/(walk|step|stride|run|person|child|disciple|travel|approach|depart)/i.test(clean)) {
    return { type: 'proform-v' as BslClassifierType, options: { aspect: 'durative' } };
  }

  // 6. Rays, beams, straight trajectories, vectors, force lines
  if (/(ray|beam|trajectory|vector|line|axis|pointer|path)/i.test(clean)) {
    return { type: 'proform-1' as BslClassifierType };
  }

  // 7. Spherical particles, cells, atoms, molecules, globules, bodies
  if (/(particle|molecule|atom|cell|nucleus|sphere|globule|vesicle|core|body|planet)/i.test(clean)) {
    return { type: 'proform-claw' as BslClassifierType };
  }

  return null;
}
/**
 * Modulates directional verb keyframes based on dynamic 3D spatial loci.
 * If giving from ME to YOU: trajectory starts near chest and pushes forward into 2P space.
 * If from Locus A to Locus B: trajectory starts on the left and sweeps across to the right.
 */
export function modulateDirectionalKeyframes(
  sign: BslSign,
  fromLocus: Point3D,
  toLocus: Point3D
): BslSignKeyframe[] {
  const kfs = sign.keyframes;
  if (!kfs || kfs.length === 0) return [];

  const dx = toLocus.x - fromLocus.x;
  const dy = toLocus.y - fromLocus.y;
  const dz = toLocus.z - fromLocus.z;

  return kfs.map((kf, idx) => {
    const fraction = idx / Math.max(1, kfs.length - 1);
    const targetCenter = {
      x: fromLocus.x + dx * fraction,
      y: fromLocus.y + dy * fraction,
      z: fromLocus.z + dz * fraction,
    };

    // Calculate anatomical offsets relative to keyframe's original targetTip
    const origTip = kf.targetTip;
    const origKnuckle = kf.targetKnuckle;
    const origWrist = kf.targetWrist;

    const knuckleOffset = {
      x: origKnuckle.x - origTip.x,
      y: origKnuckle.y - origTip.y,
      z: origKnuckle.z - origTip.z,
    };

    const wristOffset = {
      x: origWrist.x - origTip.x,
      y: origWrist.y - origTip.y,
      z: origWrist.z - origTip.z,
    };

    return {
      ...kf,
      targetTip: {
        x: targetCenter.x,
        y: targetCenter.y,
        z: targetCenter.z,
      },
      targetKnuckle: {
        x: targetCenter.x + knuckleOffset.x,
        y: targetCenter.y + knuckleOffset.y,
        z: targetCenter.z + knuckleOffset.z,
      },
      targetWrist: {
        x: targetCenter.x + wristOffset.x,
        y: targetCenter.y + wristOffset.y,
        z: targetCenter.z + wristOffset.z,
      },
    };
  });
}

/**
 * Procedurally synthesizes a BSL Level 6 Directional Agreement Verb with 3D trajectories
 * computed dynamically between source and destination spatial loci.
 */
export function generateDirectionalAgreementSign(
  verb: BslDirectionalVerbType,
  options: {
    fromLocus?: BslLocusId;
    toLocus?: BslLocusId;
    aspect?: BslAspect;
    manner?: 'slow' | 'fast' | 'reverent' | 'continuous' | 'steady';
  } = {}
): BslSign {
  const fromLocus: BslLocusId = options.fromLocus || (verb === 'bless' ? 'LOCUS_HIGH' : 'ME');
  const toLocus: BslLocusId = options.toLocus || (verb === 'invite' ? 'ME' : 'YOU');
  const aspect: BslAspect = options.aspect || 'neutral';

  const p0 = DEFAULT_BSL_LOCI[fromLocus]?.coords || { x: 20, y: 30, z: 15 };
  const p1 = DEFAULT_BSL_LOCI[toLocus]?.coords || { x: 0, y: -20, z: 65 };
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const dz = p1.z - p0.z;
  const pMid: Point3D = {
    x: p0.x + dx * 0.5,
    y: p0.y + dy * 0.5 - 10,
    z: p0.z + dz * 0.5,
  };

  const glossLabel = `${verb.toUpperCase()}[${fromLocus}→${toLocus}${aspect !== 'neutral' ? `:${aspect.toUpperCase()}` : ''}]`;
  const kfs: BslSignKeyframe[] = [];

  switch (verb) {
    case 'give': {
      kfs.push({
        label: `GIVE • Origin [${fromLocus}]`,
        rule: `Open cupped/flat hand gathers at origin locus`,
        targetTip: { x: p0.x, y: p0.y, z: p0.z },
        targetKnuckle: { x: p0.x + 20, y: p0.y + 15, z: p0.z - 10 },
        targetWrist: { x: p0.x + 50, y: p0.y + 45, z: p0.z - 25 },
        shape: 'flat',
        palm: 'up',
        hold: aspect === 'intensive' ? 200 : 100,
        ease: 'ease-out',
        nmf: { eyebrows: 'neutral', mouth: 'give' },
      });
      if (aspect === 'durative') {
        kfs.push({
          label: `GIVE • Mid Extension`,
          rule: `Continuous smooth glide across discourse space`,
          targetTip: { x: pMid.x, y: pMid.y, z: pMid.z },
          targetKnuckle: { x: pMid.x + 20, y: pMid.y + 15, z: pMid.z - 10 },
          targetWrist: { x: pMid.x + 50, y: pMid.y + 45, z: pMid.z - 25 },
          shape: 'flat',
          palm: 'up',
          hold: 80,
          ease: 'smooth',
          nmf: { eyebrows: 'neutral', mouth: 'mm' },
        });
      }
      kfs.push({
        label: `GIVE • Deliver to [${toLocus}]`,
        rule: `Hand extends forward offering to destination locus`,
        targetTip: { x: p1.x, y: p1.y, z: p1.z },
        targetKnuckle: { x: p1.x + 20, y: p1.y + 15, z: p1.z - 10 },
        targetWrist: { x: p1.x + 50, y: p1.y + 45, z: p1.z - 25 },
        shape: 'flat',
        palm: 'up',
        hold: 160,
        ease: aspect === 'intensive' ? 'snap' : 'ease-out',
        nmf: { eyebrows: 'neutral', mouth: 'give', headTilt: 'nod' },
      });
      break;
    }
    case 'teach': {
      kfs.push({
        label: `TEACH • Gather Wisdom at [${fromLocus}]`,
        rule: `Clawed / pinched hand gathers wisdom from mind or origin locus`,
        targetTip: { x: p0.x, y: p0.y - 25, z: p0.z },
        targetKnuckle: { x: p0.x + 25, y: p0.y - 5, z: p0.z - 10 },
        targetWrist: { x: p0.x + 55, y: p0.y + 25, z: p0.z - 20 },
        shape: 'claw',
        palm: 'out',
        hold: 120,
        ease: 'ease-out',
        nmf: { eyebrows: 'raised', mouth: 'teach' },
      });
      kfs.push({
        label: `TEACH • Impart Wisdom to [${toLocus}]`,
        rule: `Hand opens and projects knowledge outward toward learner locus`,
        targetTip: { x: p1.x, y: p1.y, z: p1.z },
        targetKnuckle: { x: p1.x + 25, y: p1.y + 20, z: p1.z - 10 },
        targetWrist: { x: p1.x + 55, y: p1.y + 45, z: p1.z - 25 },
        shape: 'spread',
        palm: 'out',
        hold: 180,
        ease: 'snap',
        nmf: { eyebrows: 'raised', mouth: 'teach', headTilt: 'nod' },
      });
      break;
    }
    case 'bless': {
      kfs.push({
        label: `BLESS • Divine Origin [${fromLocus}]`,
        rule: `Open hand hovers at hierarchical high locus in sacred poise`,
        targetTip: { x: p0.x, y: p0.y, z: p0.z },
        targetKnuckle: { x: p0.x + 20, y: p0.y + 20, z: p0.z - 10 },
        targetWrist: { x: p0.x + 45, y: p0.y + 50, z: p0.z - 25 },
        shape: 'flat',
        palm: 'down',
        hold: 180,
        ease: 'ease-out',
        baseHandMode: 'base-hold',
        baseHandOverride: { palm: { x: -20, y: 10, z: 20 } },
        nmf: { eyebrows: 'raised', mouth: 'bless' },
      });
      kfs.push({
        label: `BLESS • Sanctifying Arc`,
        rule: `Hand descends gracefully in sacred arc spreading divine blessing`,
        targetTip: { x: pMid.x, y: pMid.y + 5, z: pMid.z },
        targetKnuckle: { x: pMid.x + 20, y: pMid.y + 25, z: pMid.z - 10 },
        targetWrist: { x: pMid.x + 45, y: pMid.y + 55, z: pMid.z - 25 },
        shape: 'spread',
        palm: 'down',
        hold: 100,
        ease: 'smooth',
        baseHandMode: 'base-hold',
        nmf: { eyebrows: 'raised', mouth: 'bless' },
      });
      kfs.push({
        label: `BLESS • Bestow Grace on [${toLocus}]`,
        rule: `Hand settles over recipient locus with profound peace and reverent nod`,
        targetTip: { x: p1.x, y: p1.y + 10, z: p1.z },
        targetKnuckle: { x: p1.x + 20, y: p1.y + 30, z: p1.z - 10 },
        targetWrist: { x: p1.x + 50, y: p1.y + 60, z: p1.z - 25 },
        shape: 'flat',
        palm: 'down',
        hold: 240,
        ease: 'smooth',
        baseHandMode: 'base-hold',
        nmf: { eyebrows: 'raised', mouth: 'bless', headTilt: 'nod' },
      });
      break;
    }
    case 'show': {
      kfs.push({
        label: `SHOW • Present onto Palette [${fromLocus}]`,
        rule: `Dominant index indicates onto non-dominant base-hold palette`,
        targetTip: { x: p0.x, y: p0.y, z: p0.z },
        targetKnuckle: { x: p0.x + 20, y: p0.y + 15, z: p0.z - 10 },
        targetWrist: { x: p0.x + 50, y: p0.y + 45, z: p0.z - 25 },
        shape: 'point',
        palm: 'out',
        baseHandMode: 'base-hold',
        baseHandOverride: { palm: { x: p0.x - 15, y: p0.y + 10, z: p0.z } },
        hold: 120,
        ease: 'ease-out',
        nmf: { eyebrows: 'raised', mouth: 'show' },
      });
      kfs.push({
        label: `SHOW • Display Forward to [${toLocus}]`,
        rule: `Both hands present display object forward to destination locus`,
        targetTip: { x: p1.x, y: p1.y, z: p1.z },
        targetKnuckle: { x: p1.x + 20, y: p1.y + 15, z: p1.z - 10 },
        targetWrist: { x: p1.x + 50, y: p1.y + 45, z: p1.z - 25 },
        shape: 'point',
        palm: 'out',
        hold: 160,
        ease: 'snap',
        baseHandMode: 'base-hold',
        nmf: { eyebrows: 'raised', mouth: 'show', headTilt: 'nod' },
      });
      break;
    }
    case 'help': {
      kfs.push({
        label: `HELP • Support at Origin [${fromLocus}]`,
        rule: `Non-dominant flat hand supports dominant fist under base`,
        targetTip: { x: p0.x, y: p0.y, z: p0.z },
        targetKnuckle: { x: p0.x + 20, y: p0.y + 15, z: p0.z - 10 },
        targetWrist: { x: p0.x + 50, y: p0.y + 45, z: p0.z - 25 },
        shape: 'fist',
        palm: 'in',
        baseHandMode: 'base-hold',
        baseHandOverride: { palm: { x: p0.x, y: p0.y + 15, z: p0.z } },
        hold: 130,
        ease: 'ease-out',
        nmf: { eyebrows: 'neutral', mouth: 'help' },
      });
      kfs.push({
        label: `HELP • Uplift Forward to [${toLocus}]`,
        rule: `Hands lift together pushing assistance towards recipient locus`,
        targetTip: { x: p1.x, y: p1.y, z: p1.z },
        targetKnuckle: { x: p1.x + 20, y: p1.y + 15, z: p1.z - 10 },
        targetWrist: { x: p1.x + 50, y: p1.y + 45, z: p1.z - 25 },
        shape: 'fist',
        palm: 'in',
        hold: 180,
        ease: 'ease-out',
        baseHandMode: 'base-hold',
        nmf: { eyebrows: 'neutral', mouth: 'help', headTilt: 'nod' },
      });
      break;
    }
    case 'send': {
      kfs.push({
        label: `SEND • Prepared at [${fromLocus}]`,
        rule: `Flat hand held palm inward close to origin locus`,
        targetTip: { x: p0.x, y: p0.y, z: p0.z },
        targetKnuckle: { x: p0.x + 20, y: p0.y + 15, z: p0.z - 10 },
        targetWrist: { x: p0.x + 50, y: p0.y + 45, z: p0.z - 25 },
        shape: 'flat',
        palm: 'in',
        hold: 110,
        ease: 'ease-in',
        nmf: { eyebrows: 'neutral', mouth: 'send' },
      });
      kfs.push({
        label: `SEND • Dispatch to [${toLocus}]`,
        rule: `Hand thrusts decisively toward target locus releasing transmission`,
        targetTip: { x: p1.x, y: p1.y, z: p1.z },
        targetKnuckle: { x: p1.x + 20, y: p1.y + 15, z: p1.z - 10 },
        targetWrist: { x: p1.x + 50, y: p1.y + 45, z: p1.z - 25 },
        shape: 'flat',
        palm: 'out',
        hold: 170,
        ease: 'snap',
        nmf: { eyebrows: 'raised', mouth: 'send', headTilt: 'nod' },
      });
      break;
    }
    case 'invite': {
      kfs.push({
        label: `INVITE • Extended to [${fromLocus}]`,
        rule: `Open hand extends invitingly toward foreign locus`,
        targetTip: { x: p0.x, y: p0.y, z: p0.z },
        targetKnuckle: { x: p0.x + 20, y: p0.y + 15, z: p0.z - 10 },
        targetWrist: { x: p0.x + 50, y: p0.y + 45, z: p0.z - 25 },
        shape: 'flat',
        palm: 'up',
        hold: 130,
        ease: 'ease-out',
        nmf: { eyebrows: 'raised', mouth: 'invite' },
      });
      kfs.push({
        label: `INVITE • Welcome Inward to [${toLocus}]`,
        rule: `Hand draws inward in warm inviting curve toward self/host`,
        targetTip: { x: p1.x, y: p1.y, z: p1.z },
        targetKnuckle: { x: p1.x + 20, y: p1.y + 15, z: p1.z - 10 },
        targetWrist: { x: p1.x + 50, y: p1.y + 45, z: p1.z - 25 },
        shape: 'flat',
        palm: 'up',
        hold: 200,
        ease: 'smooth',
        nmf: { eyebrows: 'raised', mouth: 'invite', headTilt: 'nod' },
      });
      break;
    }
  }

  return {
    id: `dir-${verb}-${fromLocus.toLowerCase()}-${toLocus.toLowerCase()}`,
    word: verb.toUpperCase(),
    category: verb === 'bless' ? 'faith' : 'grammar',
    englishLabel: `${verb.toUpperCase()} (${fromLocus} → ${toLocus})`,
    gloss: glossLabel,
    description: `Level 6 Directional Agreement Verb ${verb.toUpperCase()} computed from ${fromLocus} to ${toLocus}`,
    keyframes: kfs,
    isDirectional: true,
    defaultLoci: { from: fromLocus, to: toLocus },
    aspect,
  };
}

