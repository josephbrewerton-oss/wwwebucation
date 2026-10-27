/**
 * src/utils/bslGrammarEngine.ts
 *
 * St Joseph's Educational Media Suite - British Sign Language (BSL) Level 2/3 Natural Grammar Engine
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Implements Signature BSL Level 2 / Level 3 Linguistic Standards:
 * 1. Timeline & Chronological Primacy: Time markers anchor the timeline at the front of the utterance.
 * 2. Topic-Comment & OSV (Object-Subject-Verb) Structural Reordering over English SVO.
 * 3. Spatial Referencing & 3D Spatial Loci: Assigns 3D coordinates for 1st person, 2nd person, and 3rd person entities (Loci A & B).
 * 4. Directional / Agreement Verbs: Modulates 3D vector trajectories dynamically between sender and recipient loci (GIVE, ASK, TELL, SHOW, HELP, LOOK).
 * 5. Non-Manual Features (NMF) Syntactic Binding:
 *    - WH-Questions: Post-positioned with furrowed eyebrows and forward chin angle.
 *    - Polar (Yes/No) Questions: Raised eyebrows and forward head tilt.
 *    - Negations: Post-verbal placement with synchronized head shake.
 *    - Affirmations: Assertive head nod.
 * 6. Particle & Copula Suppression: Strips English articles ('the', 'a') and copulas ('is', 'are', 'was') that do not exist in natural BSL.
 */

import {
  Point3D,
  BslHandPose,
  BslNmf,
  BslHandShape,
  BslPalmOrientation,
  BslEaseCurve,
  BslBaseHandMode,
  BslMouthMorpheme,
  BslClassifierType,
  BslAspect,
  BslClassifierPredicate,
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  BSL_ALPHABET_POSES,
} from './bslAlphabet';
import { BslSign, BslSignKeyframe, BslCategory, lookupBslSign, signKeyframeToHandPose, lookupMakatonSign } from './bslLexicon';

export type {
  BslClassifierType,
  BslAspect,
  BslClassifierPredicate,
};

export type BslGrammarMode = 'bsl-natural' | 'sse' | 'makaton' | 'fingerspell';

export type BslLocusId =
  | 'ME'
  | 'YOU'
  | 'LOCUS_A'
  | 'LOCUS_B'
  | 'LOCUS_C'
  | 'LOCUS_D'
  | 'LOCUS_E'
  | 'LOCUS_F'
  | 'LOCUS_HIGH'
  | 'LOCUS_LOW';

export type BslElevation = 'high' | 'mid' | 'low';

export interface BslLocus {
  id: BslLocusId;
  label: string;
  coords: Point3D;
  elevation?: BslElevation;
  assignedEntity?: string;
}

export const DEFAULT_BSL_LOCI: Record<BslLocusId, BslLocus> = {
  ME: {
    id: 'ME',
    label: '1st Person (Signer)',
    coords: { x: 20, y: 30, z: 15 },
    elevation: 'mid',
  },
  YOU: {
    id: 'YOU',
    label: '2nd Person (Addressee)',
    coords: { x: 0, y: -20, z: 65 },
    elevation: 'mid',
  },
  LOCUS_A: {
    id: 'LOCUS_A',
    label: '3rd Person (Locus A - Far Left)',
    coords: { x: -60, y: -10, z: 35 },
    elevation: 'mid',
  },
  LOCUS_B: {
    id: 'LOCUS_B',
    label: '3rd Person (Locus B - Far Right)',
    coords: { x: 60, y: -10, z: 35 },
    elevation: 'mid',
  },
  LOCUS_C: {
    id: 'LOCUS_C',
    label: '3rd Person (Locus C - Mid Left)',
    coords: { x: -35, y: -15, z: 45 },
    elevation: 'mid',
  },
  LOCUS_D: {
    id: 'LOCUS_D',
    label: '3rd Person (Locus D - Mid Right)',
    coords: { x: 35, y: -15, z: 45 },
    elevation: 'mid',
  },
  LOCUS_E: {
    id: 'LOCUS_E',
    label: '3rd Person (Locus E - Near Left)',
    coords: { x: -50, y: 15, z: 25 },
    elevation: 'low',
  },
  LOCUS_F: {
    id: 'LOCUS_F',
    label: '3rd Person (Locus F - Near Right)',
    coords: { x: 50, y: 15, z: 25 },
    elevation: 'low',
  },
  LOCUS_HIGH: {
    id: 'LOCUS_HIGH',
    label: 'Hierarchical Superior (Divine / Authority / High)',
    coords: { x: 0, y: -45, z: 50 },
    elevation: 'high',
  },
  LOCUS_LOW: {
    id: 'LOCUS_LOW',
    label: 'Hierarchical Subordinate (Earthly / Low)',
    coords: { x: 0, y: 35, z: 20 },
    elevation: 'low',
  },
};

export type BslGrammarRole =
  | 'time'
  | 'topic'
  | 'subject'
  | 'object'
  | 'verb'
  | 'directional-verb'
  | 'classifier-predicate'
  | 'question'
  | 'negation'
  | 'modifier'
  | 'particle'
  | 'fingerspell';

export interface BslGrammarToken {
  originalWord: string;
  cleanWord: string;
  gloss: string;
  role: BslGrammarRole;
  locus?: BslLocusId;
  directionalFrom?: BslLocusId;
  directionalTo?: BslLocusId;
  classifier?: BslClassifierPredicate;
  aspect?: BslAspect;
  nmf?: BslNmf;
  sign?: BslSign;
  isFingerspelled?: boolean;
  makatonStage?: number;
}

export interface BslGrammarAnalysis {
  originalText: string;
  mode: BslGrammarMode;
  sentenceType: 'statement' | 'wh-question' | 'polar-question' | 'negation' | 'conditional';
  tokens: BslGrammarToken[];
  glossSequence: string;
  activeLoci: Record<BslLocusId, BslLocus>;
  nmfSummary: {
    eyebrows: 'neutral' | 'raised' | 'furrowed';
    headTilt: 'neutral' | 'nod' | 'shake' | 'tilt-left' | 'tilt-right';
    mouthCue: string;
  };
  stream: BslHandPose[];
}

// BSL Time Markers (must be placed at the very start of natural BSL sentences)
const TIME_WORDS = new Set([
  'YESTERDAY', 'TODAY', 'TOMORROW', 'NOW', 'MORNING', 'AFTERNOON', 'NIGHT',
  'PAST', 'FUTURE', 'BEFORE', 'AFTER', 'ALWAYS', 'NEVER', 'LAST-WEEK', 'NEXT-WEEK',
  'SOON', 'LATER', 'DAILY', 'EARLY'
]);

// BSL WH-Question words (placed at the very end of natural BSL questions with furrowed eyebrows)
const WH_QUESTION_WORDS = new Set([
  'WHAT', 'WHERE', 'WHO', 'WHY', 'WHEN', 'HOW', 'WHICH'
]);

// English aux verbs that signal a polar (Yes/No) question when leading
const POLAR_QUESTION_LEADERS = new Set([
  'DO', 'DOES', 'DID', 'ARE', 'IS', 'AM', 'CAN', 'COULD', 'WILL', 'WOULD',
  'HAVE', 'HAS', 'HAD', 'SHOULD', 'MAY', 'MIGHT'
]);

// Negation markers (placed after verb or at clause end with synchronized head shake)
const NEGATION_WORDS = new Set([
  'NOT', 'NO', "DON'T", "DOESN'T", "DIDN'T", 'NEVER', 'CANNOT', "CAN'T",
  "WON'T", 'NONE', 'NOTHING', 'NOWHERE', "ISN'T", "AREN'T", "WASN'T", "WEREN'T"
]);

// Directional agreement verbs that take 3D spatial loci trajectories
const DIRECTIONAL_VERB_WORDS = new Set([
  'GIVE', 'GIVES', 'GIVING', 'GAVE',
  'ASK', 'ASKS', 'ASKING', 'ASKED',
  'TELL', 'TELLS', 'TELLING', 'TOLD',
  'SHOW', 'SHOWS', 'SHOWING', 'SHOWED',
  'HELP', 'HELPS', 'HELPING', 'HELPED',
  'EXPLAIN', 'EXPLAINS', 'EXPLAINING', 'EXPLAINED',
  'LOOK', 'LOOKS', 'LOOKING', 'LOOKED',
  'SEND', 'SENDS', 'SENDING', 'SENT',
  'PAY', 'PAYS', 'PAYING', 'PAID',
  'INVITE', 'INVITES', 'INVITING', 'INVITED'
]);

// English copulas and function words dropped in BSL Level 2/3
const BSL_OMITTED_PARTICLES = new Set([
  'THE', 'A', 'AN', 'IS', 'ARE', 'AM', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING',
  'OF', 'TO', 'IN', 'ON', 'AT', 'IT', 'ITS', 'THAT', 'THIS', 'THESE', 'THOSE',
  'WITH', 'AS', 'FOR', 'BY', 'FROM', 'AND', 'BUT', 'OR', 'NOR', 'SO', 'YET',
  'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'SHALL', 'SHOULD', 'HAVE', 'HAS', 'HAD'
]);

// Pronoun mappings
const PRONOUN_1P = new Set(['I', 'ME', 'MY', 'MINE', 'MYSELF']);
const PRONOUN_2P = new Set(['YOU', 'YOUR', 'YOURS', 'YOURSELF']);
const PRONOUN_3P = new Set(['HE', 'HIM', 'HIS', 'SHE', 'HER', 'HERS', 'THEY', 'THEM', 'THEIR']);

// BSL Level 6 Hierarchical Vertical Spatial Registers
export const HIERARCHICAL_HIGH_ENTITIES = new Set([
  'GOD', 'JESUS', 'CHRIST', 'LORD', 'HEAVEN', 'SPIRIT', 'CREATOR', 'ALMIGHTY'
]);

export const HIERARCHICAL_LOW_ENTITIES = new Set([
  'EARTH', 'GROUND', 'HELL'
]);

// BSL Level 6 Adverbial Non-Manual Mouth Morphemes
export const ADVERB_MOUTH_MAP: Record<string, string> = {
  EASILY: 'mm',
  SMOOTHLY: 'mm',
  NORMALLY: 'mm',
  CALMLY: 'mm',
  STEADILY: 'mm',
  CONTINUOUSLY: 'mm',
  CARELESSLY: 'th',
  CLUMSILY: 'th',
  ACCIDENTALLY: 'th',
  RANDOMLY: 'th',
  CAREFULLY: 'pursed',
  PRECISELY: 'pursed',
  EXACTLY: 'pursed',
  STRICTLY: 'pursed',
  DELIBERATELY: 'pursed',
  MASSIVELY: 'puffed-cheeks',
  ENORMOUSLY: 'puffed-cheeks',
  HEAVILY: 'puffed-cheeks',
  VASTLY: 'puffed-cheeks',
  STRONG: 'tight-lips',
  DETERMINED: 'tight-lips',
  FOCUSED: 'f-mouth',
  INTENSE: 'f-mouth',
};

// BSL Level 6 Classifier Verb Mappings (Translates motion & handling verbs into Polycomponential Predicates)
export const CLASSIFIER_VERB_MAP: Record<string, BslClassifierType> = {
  WALK: 'proform-v',
  WALKS: 'proform-v',
  WALKING: 'proform-v',
  WALKED: 'proform-v',
  STRIDE: 'proform-v',
  STRIDING: 'proform-v',
  STRIDED: 'proform-v',
  JUMP: 'proform-v',
  JUMPING: 'proform-v',
  JUMPED: 'proform-v',
  LIMP: 'proform-v',
  LIMPING: 'proform-v',
  APPROACH: 'proform-1',
  APPROACHING: 'proform-1',
  APPROACHED: 'proform-1',
  DRIVE: 'proform-b',
  DRIVING: 'proform-b',
  DROVE: 'proform-b',
  FLY: 'proform-b',
  FLYING: 'proform-b',
  FLEW: 'proform-b',
  SAIL: 'proform-b',
  SAILING: 'proform-b',
  SAILED: 'proform-b',
  ACCELERATE: 'proform-b',
  ACCELERATES: 'proform-b',
  ACCELERATED: 'proform-b',
  ACCELERATING: 'proform-b',
  CHALICE: 'handling-cup',
  VESSEL: 'proform-c',
  CUP: 'proform-c',
  ELEVATE: 'proform-c',
  ELEVATING: 'proform-c',
  ELEVATED: 'proform-c',
  READ: 'handling-book',
  READING: 'handling-book',
  WRITE: 'handling-pen',
  WRITING: 'handling-pen',
};

// BSL Level 6 Temporal Aspect Markers (Modulates repetitive cadence & tension)
export const ASPECT_MARKER_MAP: Record<string, BslAspect> = {
  STEADILY: 'durative',
  CONTINUOUSLY: 'durative',
  SLOWLY: 'durative',
  HOURS: 'durative',
  ENDLESSLY: 'durative',
  OFTEN: 'habitual',
  REGULARLY: 'habitual',
  DAILY: 'habitual',
  REPEATEDLY: 'habitual',
  SUDDENLY: 'intensive',
  SHARPLY: 'intensive',
  FAST: 'intensive',
  QUICKLY: 'intensive',
  INTENSELY: 'intensive',
  FORCEFULLY: 'intensive',
  STARTING: 'inceptive',
  BEGINNING: 'inceptive',
};

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
 * Normalizes an English word to its root lemma for BSL sign lookup
 */
function normalizeToBslLemma(cleanWord: string): string {
  if (['PRAYING', 'PRAYS', 'PRAYED'].includes(cleanWord)) return 'PRAY';
  if (['CHURCHES', 'CHAPEL', 'SANCTUARY'].includes(cleanWord)) return 'CHURCH';
  if (['STUDENTS', 'PUPILS', 'CHILDREN'].includes(cleanWord)) return 'PUPIL';
  if (['TEACHERS', 'TEACHING'].includes(cleanWord)) return 'TEACHER';
  if (['BOOKS', 'READING', 'READS'].includes(cleanWord)) return 'BOOK';
  if (['GIVING', 'GIVES', 'GAVE'].includes(cleanWord)) return 'GIVE';
  if (['HELPING', 'HELPS', 'HELPED'].includes(cleanWord)) return 'HELP';
  if (['SHOWING', 'SHOWS', 'SHOWED'].includes(cleanWord)) return 'SHOW';
  if (['TELLING', 'TELLS', 'TOLD'].includes(cleanWord)) return 'TELL';
  if (['ASKING', 'ASKS', 'ASKED'].includes(cleanWord)) return 'ASK';
  if (['EXPLAINING', 'EXPLAINS', 'EXPLAINED'].includes(cleanWord)) return 'EXPLAIN';
  if (['LOOKING', 'LOOKS', 'LOOKED'].includes(cleanWord)) return 'LOOK';
  if (['UNDERSTANDING', 'UNDERSTOOD'].includes(cleanWord)) return 'UNDERSTAND';
  if (['LOVES', 'LOVING', 'LOVED'].includes(cleanWord)) return 'LOVE';
  if (['STARTING', 'STARTS', 'STARTED'].includes(cleanWord)) return 'START';
  if (['STOPPING', 'STOPS', 'STOPPED'].includes(cleanWord)) return 'STOP';
  if (['FINISHING', 'FINISHES', 'FINISHED'].includes(cleanWord)) return 'FINISH';
  if (['QUESTIONS'].includes(cleanWord)) return 'WHAT';
  return cleanWord;
}

/**
 * Core Linguistic Pipeline: Transforms English Text into BSL Level 2/3 Natural Syntax
 */
export function analyzeAndTransformBslGrammar(
  text: string,
  options?: BslGrammarMode | { mode?: BslGrammarMode }
): BslGrammarAnalysis {
  const mode = typeof options === 'string' ? options : options?.mode || 'bsl-natural';
  const cleanInput = (text || '').trim();

  const loci: Record<BslLocusId, BslLocus> = {
    ME: { ...DEFAULT_BSL_LOCI.ME },
    YOU: { ...DEFAULT_BSL_LOCI.YOU },
    LOCUS_A: { ...DEFAULT_BSL_LOCI.LOCUS_A },
    LOCUS_B: { ...DEFAULT_BSL_LOCI.LOCUS_B },
    LOCUS_C: { ...DEFAULT_BSL_LOCI.LOCUS_C },
    LOCUS_D: { ...DEFAULT_BSL_LOCI.LOCUS_D },
    LOCUS_E: { ...DEFAULT_BSL_LOCI.LOCUS_E },
    LOCUS_F: { ...DEFAULT_BSL_LOCI.LOCUS_F },
    LOCUS_HIGH: { ...DEFAULT_BSL_LOCI.LOCUS_HIGH },
    LOCUS_LOW: { ...DEFAULT_BSL_LOCI.LOCUS_LOW },
  };

  if (!cleanInput) {
    return {
      originalText: '',
      mode,
      sentenceType: 'statement',
      tokens: [],
      glossSequence: '',
      activeLoci: loci,
      nmfSummary: { eyebrows: 'neutral', headTilt: 'neutral', mouthCue: '' },
      stream: [],
    };
  }

  const rawWords = cleanInput.split(/\s+/).filter(Boolean);
  const isQuestionMark = cleanInput.endsWith('?');

  // Detect sentence types
  const upperWords = rawWords.map((w) => w.toUpperCase().replace(/[^A-Z-]/g, ''));
  const hasWhQuestion = upperWords.some((w) => WH_QUESTION_WORDS.has(w));
  const hasPolarLeader = upperWords.length > 0 && POLAR_QUESTION_LEADERS.has(upperWords[0]);
  const hasNegation = upperWords.some((w) => NEGATION_WORDS.has(w));

  let sentenceType: BslGrammarAnalysis['sentenceType'] = 'statement';
  if (hasWhQuestion) {
    sentenceType = 'wh-question';
  } else if (isQuestionMark || hasPolarLeader) {
    sentenceType = 'polar-question';
  } else if (hasNegation) {
    sentenceType = 'negation';
  }

  // 1. If explicit Fingerspell mode
  if (mode === 'fingerspell') {
    const tokens: BslGrammarToken[] = [];
    const stream: BslHandPose[] = [];

    rawWords.forEach((raw, wIdx) => {
      const clean = raw.toUpperCase().replace(/[^A-Z-]/g, '');
      if (!clean) return;
      tokens.push({
        originalWord: raw,
        cleanWord: clean,
        gloss: clean.split('').join('-'),
        role: 'fingerspell',
        isFingerspelled: true,
      });

      for (const char of clean) {
        if (BSL_ALPHABET_POSES[char]) {
          stream.push(BSL_ALPHABET_POSES[char]);
        }
      }
      if (wIdx < rawWords.length - 1) {
        stream.push({
          letter: ' ',
          label: 'Word Boundary',
          rule: 'Neutral transition between words',
          isVowel: false,
          targetTip: DOMINANT_REST_POSE,
          targetKnuckle: DOMINANT_REST_KNUCKLE,
          targetWrist: DOMINANT_REST_WRIST,
        });
      }
    });

    return {
      originalText: cleanInput,
      mode,
      sentenceType,
      tokens,
      glossSequence: tokens.map((t) => t.gloss).join(' '),
      activeLoci: loci,
      nmfSummary: { eyebrows: 'neutral', headTilt: 'neutral', mouthCue: '' },
      stream,
    };
  }

  // 2. If Sign Supported English (SSE / Level 1)
  if (mode === 'sse') {
    const tokens: BslGrammarToken[] = [];
    const stream: BslHandPose[] = [];

    for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
      const raw = rawWords[wIdx];
      const clean = raw.toUpperCase().replace(/[^A-Z-]/g, '');
      if (!clean) continue;

      if (BSL_OMITTED_PARTICLES.has(clean)) {
        tokens.push({
          originalWord: raw,
          cleanWord: clean,
          gloss: `(${clean})`,
          role: 'particle',
        });
        continue;
      }

      const lemma = normalizeToBslLemma(clean);
      const sign = lookupBslSign(lemma) || lookupBslSign(clean);

      if (sign) {
        tokens.push({
          originalWord: raw,
          cleanWord: clean,
          gloss: sign.gloss || sign.word,
          role: 'verb',
          sign,
        });
        const total = sign.keyframes.length;
        sign.keyframes.forEach((kf, idx) => {
          stream.push(signKeyframeToHandPose(sign, kf, idx, total));
        });
      } else {
        tokens.push({
          originalWord: raw,
          cleanWord: clean,
          gloss: clean.split('').join('-'),
          role: 'fingerspell',
          isFingerspelled: true,
        });
        for (const char of clean) {
          if (BSL_ALPHABET_POSES[char]) {
            stream.push(BSL_ALPHABET_POSES[char]);
          }
        }
      }

      if (wIdx < rawWords.length - 1 && stream.length > 0) {
        stream.push({
          letter: ' ',
          label: 'Word Boundary',
          rule: 'Neutral transition',
          isVowel: false,
          targetTip: DOMINANT_REST_POSE,
          targetKnuckle: DOMINANT_REST_KNUCKLE,
          targetWrist: DOMINANT_REST_WRIST,
        });
      }
    }

    return {
      originalText: cleanInput,
      mode,
      sentenceType,
      tokens,
      glossSequence: tokens.map((t) => t.gloss).join(' '),
      activeLoci: loci,
      nmfSummary: {
        eyebrows: sentenceType === 'wh-question' ? 'furrowed' : sentenceType === 'polar-question' ? 'raised' : 'neutral',
        headTilt: sentenceType === 'negation' ? 'shake' : 'neutral',
        mouthCue: '',
      },
      stream,
    };
  }

  // 3. If Makaton (Keyword Signing / SEN Communication Programme)
  // Essential Key Word Signing in English word order without fingerspelling cognitive clutter
  if (mode === 'makaton') {
    const tokens: BslGrammarToken[] = [];
    const stream: BslHandPose[] = [];

    for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
      const raw = rawWords[wIdx];
      const clean = raw.toUpperCase().replace(/[^A-Z-]/g, '');
      if (!clean) continue;

      // In Makaton, function words/articles are voiced in spoken speech but omitted from hand signing
      if (BSL_OMITTED_PARTICLES.has(clean)) {
        tokens.push({
          originalWord: raw,
          cleanWord: clean,
          gloss: `(${clean.toLowerCase()})`,
          role: 'particle',
        });
        continue;
      }

      // 1. Try 2-word phrase lookup in Makaton (e.g. "THANK YOU", "SOLAR SYSTEM", "HOLY BOOK")
      if (wIdx < rawWords.length - 1) {
        const nextClean = rawWords[wIdx + 1].toUpperCase().replace(/[^A-Z-]/g, '');
        const phrase = `${clean} ${nextClean}`;
        const makatonMatch = lookupMakatonSign(phrase);
        if (makatonMatch && makatonMatch.sign.keyframes.length > 0) {
          const { sign, stage } = makatonMatch;
          tokens.push({
            originalWord: `${raw} ${rawWords[wIdx + 1]}`,
            cleanWord: phrase,
            gloss: `[S${stage}] ${sign.gloss || sign.word}`,
            role: 'topic',
            sign,
            makatonStage: stage,
          });
          const total = sign.keyframes.length;
          sign.keyframes.forEach((kf, idx) => {
            const pose = signKeyframeToHandPose(sign, kf, idx, total);
            stream.push({
              ...pose,
              label: `Makaton Stage ${stage} • ${sign.englishLabel}`,
              nmf: {
                eyebrows: 'raised',
                mouth: raw,
                headTilt: 'nod',
              },
            });
          });
          wIdx++;
          if (wIdx < rawWords.length - 1 && stream.length > 0) {
            stream.push({
              letter: ' ',
              label: 'Makaton Keyword Pause',
              rule: 'Gentle pause between core concepts',
              isVowel: false,
              targetTip: DOMINANT_REST_POSE,
              targetKnuckle: DOMINANT_REST_KNUCKLE,
              targetWrist: DOMINANT_REST_WRIST,
            });
          }
          continue;
        }
      }

      // 2. Single keyword lookup in Makaton & BSL Core Lexicon
      const lemma = normalizeToBslLemma(clean);
      const makatonMatch = lookupMakatonSign(lemma) || lookupMakatonSign(clean);

      if (makatonMatch && makatonMatch.sign.keyframes.length > 0) {
        const { sign, stage } = makatonMatch;
        tokens.push({
          originalWord: raw,
          cleanWord: clean,
          gloss: `[S${stage}] ${sign.gloss || sign.word}`,
          role: 'topic',
          sign,
          makatonStage: stage,
        });
        const total = sign.keyframes.length;
        sign.keyframes.forEach((kf, idx) => {
          const pose = signKeyframeToHandPose(sign, kf, idx, total);
          stream.push({
            ...pose,
            label: `Makaton Stage ${stage} • ${sign.englishLabel}`,
            nmf: {
              eyebrows: 'raised',
              mouth: raw,
              headTilt: 'nod',
            },
          });
        });
      } else {
        // In Makaton, untranslated words are spoken naturally without fingerspelling overload
        tokens.push({
          originalWord: raw,
          cleanWord: clean,
          gloss: `~${clean.toLowerCase()}~`,
          role: 'particle',
        });
      }

      if (wIdx < rawWords.length - 1 && stream.length > 0) {
        const lastPose = stream[stream.length - 1];
        if (lastPose && lastPose.letter !== ' ') {
          stream.push({
            letter: ' ',
            label: 'Makaton Keyword Pause',
            rule: 'Gentle pause between core concepts',
            isVowel: false,
            targetTip: DOMINANT_REST_POSE,
            targetKnuckle: DOMINANT_REST_KNUCKLE,
            targetWrist: DOMINANT_REST_WRIST,
          });
        }
      }
    }

    return {
      originalText: cleanInput,
      mode,
      sentenceType,
      tokens,
      glossSequence: tokens.map((t) => t.gloss).join(' '),
      activeLoci: loci,
      nmfSummary: {
        eyebrows: 'raised',
        headTilt: 'nod',
        mouthCue: cleanInput,
      },
      stream,
    };
  }

  // 4. Natural BSL Level 2 / Level 3 Syntactic Transformation
  // Parse semantic constituents:
  const timeTokens: BslGrammarToken[] = [];
  const whQuestionTokens: BslGrammarToken[] = [];
  const negationTokens: BslGrammarToken[] = [];
  const coreTokens: {
    raw: string;
    clean: string;
    lemma: string;
    sign?: BslSign;
    role: BslGrammarRole;
    isPronoun1P?: boolean;
    isPronoun2P?: boolean;
    isPronoun3P?: boolean;
    gloss?: string;
    classifier?: BslClassifierPredicate;
    aspect?: BslAspect;
  }[] = [];

  for (let i = 0; i < rawWords.length; i++) {
    const raw = rawWords[i];
    const clean = raw.toUpperCase().replace(/[^A-Z-]/g, '');
    if (!clean) continue;

    // Check 2-word phrase lookup first (e.g. "THANK YOU", "SOLAR SYSTEM", "HOLY BOOK")
    if (i < rawWords.length - 1) {
      const nextClean = rawWords[i + 1].toUpperCase().replace(/[^A-Z-]/g, '');
      const twoWord = `${clean} ${nextClean}`;
      const phraseSign = lookupBslSign(twoWord);
      if (phraseSign) {
        coreTokens.push({
          raw: `${raw} ${rawWords[i + 1]}`,
          clean: twoWord,
          lemma: twoWord,
          sign: phraseSign,
          role: 'topic',
        });
        i++;
        continue;
      }
    }

    // Temporal markers -> extracted for timeline fronting
    if (TIME_WORDS.has(clean)) {
      const timeSign = lookupBslSign(clean) || lookupBslSign(normalizeToBslLemma(clean));
      timeTokens.push({
        originalWord: raw,
        cleanWord: clean,
        gloss: timeSign?.gloss || clean,
        role: 'time',
        sign: timeSign,
        nmf: { eyebrows: 'neutral', mouth: clean.toLowerCase() },
      });
      continue;
    }

    // WH-Questions -> extracted for sentence-final positioning with furrowed eyebrows
    if (WH_QUESTION_WORDS.has(clean)) {
      const whSign = lookupBslSign(clean);
      whQuestionTokens.push({
        originalWord: raw,
        cleanWord: clean,
        gloss: whSign?.gloss || clean,
        role: 'question',
        sign: whSign,
        nmf: { eyebrows: 'furrowed', mouth: clean.toLowerCase(), headTilt: 'neutral' },
      });
      continue;
    }

    // Negations -> extracted for post-predicate placement with head shake
    if (NEGATION_WORDS.has(clean)) {
      const negSign = lookupBslSign('NO') || lookupBslSign('NOT');
      negationTokens.push({
        originalWord: raw,
        cleanWord: clean,
        gloss: 'NOT',
        role: 'negation',
        sign: negSign,
        nmf: { eyebrows: 'neutral', mouth: 'no', headTilt: 'shake' },
      });
      continue;
    }

    // Drop English auxiliary particles & copulas
    if (BSL_OMITTED_PARTICLES.has(clean)) {
      continue;
    }

    // Adverbial Non-Manual Markers -> captured as facial mouth morphemes modifying the predicate, not manual signs
    if (ADVERB_MOUTH_MAP[clean]) {
      continue;
    }

    // Temporal Aspect Markers -> modulate predicate trajectory cadence rather than separate manual signs
    if (ASPECT_MARKER_MAP[clean]) {
      continue;
    }

    const lemma = normalizeToBslLemma(clean);
    const sign = lookupBslSign(lemma) || lookupBslSign(clean);

    let role: BslGrammarRole = 'topic';
    const isPronoun1 = PRONOUN_1P.has(clean);
    const isPronoun2 = PRONOUN_2P.has(clean);
    const isPronoun3 = PRONOUN_3P.has(clean);

    const classifierType = CLASSIFIER_VERB_MAP[clean] || CLASSIFIER_VERB_MAP[lemma];

    if (classifierType) {
      role = 'classifier-predicate';
    } else if (DIRECTIONAL_VERB_WORDS.has(clean) || DIRECTIONAL_VERB_WORDS.has(lemma)) {
      role = 'directional-verb';
    } else if (isPronoun1 || isPronoun2 || isPronoun3) {
      role = 'subject';
    } else if (sign?.category === 'faith' || sign?.category === 'stem' || sign?.category === 'school') {
      role = 'topic';
    }

    coreTokens.push({
      raw,
      clean,
      lemma,
      sign,
      role,
      isPronoun1P: isPronoun1,
      isPronoun2P: isPronoun2,
      isPronoun3P: isPronoun3,
    });
  }

  // Level 6 Temporal Aspect Markers
  let detectedAspect: BslAspect | undefined = undefined;
  for (const w of upperWords) {
    if (ASPECT_MARKER_MAP[w]) {
      detectedAspect = ASPECT_MARKER_MAP[w];
      break;
    }
  }

  // Level 6 Adverbial Non-Manual Mouth Morphemes
  let detectedAdverbMouth: string | undefined = undefined;
  for (const w of upperWords) {
    if (ADVERB_MOUTH_MAP[w]) {
      detectedAdverbMouth = ADVERB_MOUTH_MAP[w];
      break;
    }
  }

  // Assign Spatial Loci to entities and actors
  let subjectEntity: typeof coreTokens[0] | undefined;
  let objectEntity: typeof coreTokens[0] | undefined;
  let directionalVerb: typeof coreTokens[0] | undefined;
  let classifierPredicateToken: typeof coreTokens[0] | undefined;

  for (const token of coreTokens) {
    if (token.role === 'classifier-predicate') {
      classifierPredicateToken = token;
    } else if (token.role === 'directional-verb') {
      directionalVerb = token;
    }
  }

  if (directionalVerb || classifierPredicateToken) {
    for (const token of coreTokens) {
      if (token === directionalVerb || token === classifierPredicateToken) continue;
      if (!subjectEntity) {
        subjectEntity = token;
      } else if (!objectEntity) {
        objectEntity = token;
      }
    }
  } else {
    // Non-directional sentence
    if (coreTokens.length === 1) {
      subjectEntity = coreTokens[0];
    } else if (coreTokens.length === 2) {
      subjectEntity = coreTokens[0];
      objectEntity = coreTokens[1];
    } else if (coreTokens.length >= 3) {
      // In English S-V-O sentences like "GOD BLESS EARTH" or "PUPIL READ BOOK",
      // the middle constituent is the predicate verb and the last constituent is the object entity.
      const lastToken = coreTokens[coreTokens.length - 1];
      const middleToken = coreTokens[1];
      if (HIERARCHICAL_LOW_ENTITIES.has(lastToken.clean) || HIERARCHICAL_HIGH_ENTITIES.has(lastToken.clean) || !middleToken.sign) {
        subjectEntity = coreTokens[0];
        middleToken.role = 'verb';
        objectEntity = lastToken;
      } else {
        subjectEntity = coreTokens[0];
        objectEntity = coreTokens[1];
      }
    }
  }

  // Allocate spatial loci (Level 6 Multi-Loci & Vertical Elevation Registers)
  let fromLocus: BslLocusId = 'ME';
  let toLocus: BslLocusId = 'YOU';

  if (subjectEntity) {
    if (subjectEntity.isPronoun1P) {
      fromLocus = 'ME';
    } else if (subjectEntity.isPronoun2P) {
      fromLocus = 'YOU';
    } else if (HIERARCHICAL_HIGH_ENTITIES.has(subjectEntity.clean)) {
      fromLocus = 'LOCUS_HIGH';
      loci.LOCUS_HIGH.assignedEntity = subjectEntity.clean;
    } else if (HIERARCHICAL_LOW_ENTITIES.has(subjectEntity.clean)) {
      fromLocus = 'LOCUS_LOW';
      loci.LOCUS_LOW.assignedEntity = subjectEntity.clean;
    } else {
      fromLocus = 'LOCUS_A';
      loci.LOCUS_A.assignedEntity = subjectEntity.clean;
    }
  }

  if (objectEntity) {
    if (objectEntity.isPronoun1P) {
      toLocus = 'ME';
    } else if (objectEntity.isPronoun2P) {
      toLocus = 'YOU';
    } else if (HIERARCHICAL_HIGH_ENTITIES.has(objectEntity.clean)) {
      toLocus = 'LOCUS_HIGH';
      loci.LOCUS_HIGH.assignedEntity = objectEntity.clean;
    } else if (HIERARCHICAL_LOW_ENTITIES.has(objectEntity.clean)) {
      toLocus = 'LOCUS_LOW';
      loci.LOCUS_LOW.assignedEntity = objectEntity.clean;
    } else {
      const fl = fromLocus as string;
      toLocus = fl === 'LOCUS_A' ? 'LOCUS_B' : (fl === 'LOCUS_B' ? 'LOCUS_C' : 'LOCUS_A');
      loci[toLocus].assignedEntity = objectEntity.clean;
    }
  }

  // If classifier predicate is active, synthesize its 3D procedural keyframes
  if (classifierPredicateToken) {
    const clType =
      CLASSIFIER_VERB_MAP[classifierPredicateToken.clean] ||
      CLASSIFIER_VERB_MAP[classifierPredicateToken.lemma] ||
      'proform-v';
    const classifierSign = generateClassifierPredicate(clType, {
      fromLocus,
      toLocus,
      aspect: detectedAspect || 'neutral',
      entityLabel: subjectEntity?.clean,
    });
    classifierPredicateToken.sign = classifierSign;
    classifierPredicateToken.classifier = classifierSign.classifier;
    classifierPredicateToken.aspect = detectedAspect || 'neutral';
    classifierPredicateToken.gloss = classifierSign.gloss;
  }

  // Level 6 Constructed Action / Role Shift Detection
  const hasDialogueCue = ['SAID', 'ASKED', 'TOLD', 'EXPLAINED', 'REPLIED', 'SPOKE', 'COMMANDED', 'PRAYED'].some((w) =>
    upperWords.includes(w)
  );
  let activeRoleShift: { agent: string; yaw: number; elevation?: BslElevation } | undefined = undefined;
  if (hasDialogueCue && subjectEntity) {
    const fl = fromLocus as string;
    const isLeftLocus = fl === 'LOCUS_A' || fl === 'LOCUS_C' || fl === 'LOCUS_E';
    const isRightLocus = fl === 'LOCUS_B' || fl === 'LOCUS_D' || fl === 'LOCUS_F';
    const yaw = isLeftLocus ? -20 : isRightLocus ? 20 : -15;
    activeRoleShift = {
      agent: subjectEntity.clean,
      yaw,
      elevation: loci[fromLocus]?.elevation || 'mid',
    };
  }

  // Build the reordered Natural BSL Token Sequence:
  // Order: [TIME] -> [TOPIC / OBJECT] -> [SUBJECT (Locus)] -> [DIRECTIONAL VERB / CLASSIFIER] -> [NEGATION] -> [WH-QUESTION]
  const reorderedTokens: BslGrammarToken[] = [];

  // 1. TIME FIRST
  timeTokens.forEach((t) => {
    reorderedTokens.push(t);
  });

  // 2. TOPIC / OBJECT FIRST (Topic-Comment architecture)
  if (objectEntity) {
    reorderedTokens.push({
      originalWord: objectEntity.raw,
      cleanWord: objectEntity.clean,
      gloss: objectEntity.sign?.gloss || objectEntity.clean,
      role: 'topic',
      locus: toLocus,
      sign: objectEntity.sign,
      nmf: {
        eyebrows: 'neutral',
        mouth: (detectedAdverbMouth as any) || objectEntity.clean.toLowerCase(),
      },
    });
  }

  // 3. SUBJECT (with Spatial Locus binding and Role-Shift if dialogue)
  if (subjectEntity) {
    reorderedTokens.push({
      originalWord: subjectEntity.raw,
      cleanWord: subjectEntity.clean,
      gloss: subjectEntity.sign?.gloss || subjectEntity.clean,
      role: 'subject',
      locus: fromLocus,
      sign: subjectEntity.sign,
      nmf: {
        eyebrows: 'neutral',
        mouth: objectEntity ? subjectEntity.clean.toLowerCase() : (detectedAdverbMouth as any) || subjectEntity.clean.toLowerCase(),
        roleShift: activeRoleShift,
      },
    });
  }

  // 4. OTHER CORE TOKENS (excluding already placed subject/object/directional/classifier)
  coreTokens.forEach((token) => {
    if (token === subjectEntity || token === objectEntity || token === directionalVerb || token === classifierPredicateToken) return;
    const tokenLocus = HIERARCHICAL_HIGH_ENTITIES.has(token.clean)
      ? 'LOCUS_HIGH'
      : HIERARCHICAL_LOW_ENTITIES.has(token.clean)
      ? 'LOCUS_LOW'
      : undefined;
    if (tokenLocus) {
      loci[tokenLocus].assignedEntity = token.clean;
    }
    reorderedTokens.push({
      originalWord: token.raw,
      cleanWord: token.clean,
      gloss: token.sign?.gloss || token.clean,
      role: token.role,
      locus: tokenLocus,
      sign: token.sign,
      nmf: {
        eyebrows: 'neutral',
        mouth: (detectedAdverbMouth as any) || token.clean.toLowerCase(),
        roleShift: activeRoleShift,
      },
    });
  });

  // 5. CLASSIFIER PREDICATE OR DIRECTIONAL VERB / MAIN VERB
  if (classifierPredicateToken) {
    reorderedTokens.push({
      originalWord: classifierPredicateToken.raw,
      cleanWord: classifierPredicateToken.clean,
      gloss: classifierPredicateToken.gloss,
      role: 'classifier-predicate',
      directionalFrom: fromLocus,
      directionalTo: toLocus,
      classifier: classifierPredicateToken.classifier,
      aspect: classifierPredicateToken.aspect,
      sign: classifierPredicateToken.sign,
      nmf: {
        eyebrows: 'neutral',
        mouth: (detectedAdverbMouth as any) || classifierPredicateToken.sign?.keyframes[0]?.nmf?.mouth || classifierPredicateToken.clean.toLowerCase(),
        roleShift: activeRoleShift,
      },
    });
  } else if (directionalVerb) {
    reorderedTokens.push({
      originalWord: directionalVerb.raw,
      cleanWord: directionalVerb.clean,
      gloss: `${directionalVerb.sign?.gloss || directionalVerb.clean}[${fromLocus}→${toLocus}]`,
      role: 'directional-verb',
      directionalFrom: fromLocus,
      directionalTo: toLocus,
      sign: directionalVerb.sign,
      nmf: {
        eyebrows: sentenceType === 'wh-question' ? 'furrowed' : 'neutral',
        mouth: detectedAdverbMouth || directionalVerb.clean.toLowerCase(),
        roleShift: activeRoleShift,
      },
    });
  }

  // 6. NEGATION AT THE END (with headshake)
  negationTokens.forEach((t) => {
    reorderedTokens.push(t);
  });

  // 7. WH-QUESTION AT THE END (with furrowed eyebrows)
  whQuestionTokens.forEach((t) => {
    reorderedTokens.push(t);
  });

  // If sentence was a polar question (Yes/No) and no WH word, mark final token with raised eyebrows
  if (sentenceType === 'polar-question' && reorderedTokens.length > 0) {
    const lastTok = reorderedTokens[reorderedTokens.length - 1];
    lastTok.nmf = {
      ...lastTok.nmf,
      eyebrows: 'raised',
      headTilt: 'nod',
    };
  }

  // Synthesize procedural 3D stream with modulated directional vectors
  const stream: BslHandPose[] = [];

  for (let tIdx = 0; tIdx < reorderedTokens.length; tIdx++) {
    const tok = reorderedTokens[tIdx];

    if (tok.role === 'directional-verb' && tok.sign && tok.directionalFrom && tok.directionalTo) {
      // Modulate 3D trajectory between the two loci
      const fromPt = loci[tok.directionalFrom].coords;
      const toPt = loci[tok.directionalTo].coords;
      const modulatedKfs = modulateDirectionalKeyframes(tok.sign, fromPt, toPt);
      const totalKf = modulatedKfs.length;

      modulatedKfs.forEach((kf, kfIdx) => {
        const pose = signKeyframeToHandPose(tok.sign!, kf, kfIdx, totalKf);
        if (tok.nmf) {
          pose.nmf = { ...pose.nmf, ...tok.nmf };
        }
        stream.push(pose);
      });
    } else if (tok.sign) {
      // Whole-Word sign or Classifier Predicate
      const totalKf = tok.sign.keyframes.length;
      tok.sign.keyframes.forEach((kf, kfIdx) => {
        const pose = signKeyframeToHandPose(tok.sign!, kf, kfIdx, totalKf);
        if (tok.classifier) pose.classifier = tok.classifier;
        if (tok.aspect) pose.aspect = tok.aspect;
        if (tok.nmf) {
          pose.nmf = { ...pose.nmf, ...tok.nmf };
        }
        stream.push(pose);
      });
    } else {
      // Un-lexiconed word: fallback to BANZSL manual fingerspelling
      tok.isFingerspelled = true;
      for (const char of tok.cleanWord) {
        if (BSL_ALPHABET_POSES[char]) {
          const pose = { ...BSL_ALPHABET_POSES[char] };
          if (tok.nmf) pose.nmf = tok.nmf;
          stream.push(pose);
        }
      }
    }

    // Add neutral transition boundary between words
    if (tIdx < reorderedTokens.length - 1 && stream.length > 0) {
      stream.push({
        letter: ' ',
        label: 'Boundary',
        rule: 'Neutral transition between signs',
        isVowel: false,
        targetTip: DOMINANT_REST_POSE,
        targetKnuckle: DOMINANT_REST_KNUCKLE,
        targetWrist: DOMINANT_REST_WRIST,
      });
    }
  }

  // Compose human-readable BSL gloss sequence
  const glossSequence = reorderedTokens
    .map((t) => {
      let badge = `[${t.role.toUpperCase()}]`;
      if (t.role === 'time') badge = '[TIME]';
      if (t.role === 'topic') badge = `[TOPIC]`;
      if (t.role === 'subject') badge = `[SUBJ(${t.locus || ''})]`;
      if (t.role === 'directional-verb') badge = `[DIR-VERB(${t.directionalFrom}→${t.directionalTo})]`;
      if (t.role === 'question') badge = '[WH-?]';
      if (t.role === 'negation') badge = '[NEG]';
      return `${badge} ${t.gloss}`;
    })
    .join('  ➔  ');

  return {
    originalText: cleanInput,
    mode,
    sentenceType,
    tokens: reorderedTokens,
    glossSequence,
    activeLoci: loci,
    nmfSummary: {
      eyebrows: sentenceType === 'wh-question' ? 'furrowed' : sentenceType === 'polar-question' ? 'raised' : 'neutral',
      headTilt: sentenceType === 'negation' ? 'shake' : sentenceType === 'polar-question' ? 'nod' : 'neutral',
      mouthCue: cleanInput.slice(0, 15),
    },
    stream,
  };
}
