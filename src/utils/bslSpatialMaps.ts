// src/utils/bslSpatialMaps.ts
/**
 * BSL Level 6 Spatial Register Grid (10-point 3D loci), grammar role types,
 * and linguistic lookup tables extracted from bslGrammarEngine.ts.
 */

import type {
  Point3D,
  BslHandPose,
  BslNmf,
  BslClassifierType,
  BslAspect,
  BslClassifierPredicate,
  BslDirectionalVerbType,
  BslDirectionalAgreement,
  BslBuoy,
} from './bslAlphabet';
import type { BslSign } from './bslLexicon';

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
  | 'fingerspell'
  | 'rhq'
  | 'cause'
  | 'conditional'
  | 'buoy';

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
  buoy?: BslBuoy;
  clauseRole?: 'rhq-question' | 'rhq-answer' | 'conditional-if' | 'conditional-then';
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
export const TIME_WORDS = new Set([
  'YESTERDAY', 'TODAY', 'TOMORROW', 'NOW', 'MORNING', 'AFTERNOON', 'NIGHT',
  'PAST', 'FUTURE', 'BEFORE', 'AFTER', 'ALWAYS', 'NEVER', 'LAST-WEEK', 'NEXT-WEEK',
  'SOON', 'LATER', 'DAILY', 'EARLY'
]);

// BSL WH-Question words (placed at the very end of natural BSL questions with furrowed eyebrows)
export const WH_QUESTION_WORDS = new Set([
  'WHAT', 'WHERE', 'WHO', 'WHY', 'WHEN', 'HOW', 'WHICH'
]);

// English aux verbs that signal a polar (Yes/No) question when leading
export const POLAR_QUESTION_LEADERS = new Set([
  'DO', 'DOES', 'DID', 'ARE', 'IS', 'AM', 'CAN', 'COULD', 'WILL', 'WOULD',
  'HAVE', 'HAS', 'HAD', 'SHOULD', 'MAY', 'MIGHT'
]);

// Negation markers (placed after verb or at clause end with synchronized head shake)
export const NEGATION_WORDS = new Set([
  'NOT', 'NO', "DON'T", "DOESN'T", "DIDN'T", 'NEVER', 'CANNOT', "CAN'T",
  "WON'T", 'NONE', 'NOTHING', 'NOWHERE', "ISN'T", "AREN'T", "WASN'T", "WEREN'T"
]);

// BSL Level 6 Directional Agreement Verb Mappings
export const DIRECTIONAL_VERB_MAP: Record<string, BslDirectionalVerbType> = {
  GIVE: 'give',
  GIVES: 'give',
  GIVING: 'give',
  GAVE: 'give',
  TEACH: 'teach',
  TEACHES: 'teach',
  TEACHING: 'teach',
  TAUGHT: 'teach',
  BLESS: 'bless',
  BLESSES: 'bless',
  BLESSING: 'bless',
  BLESSED: 'bless',
  SHOW: 'show',
  SHOWS: 'show',
  SHOWING: 'show',
  SHOWED: 'show',
  HELP: 'help',
  HELPS: 'help',
  HELPING: 'help',
  HELPED: 'help',
  SEND: 'send',
  SENDS: 'send',
  SENDING: 'send',
  SENT: 'send',
  INVITE: 'invite',
  INVITES: 'invite',
  INVITING: 'invite',
  INVITED: 'invite',
};

// Directional agreement verbs that take 3D spatial loci trajectories
export const DIRECTIONAL_VERB_WORDS = new Set([
  'GIVE', 'GIVES', 'GIVING', 'GAVE',
  'TEACH', 'TEACHES', 'TEACHING', 'TAUGHT',
  'BLESS', 'BLESSES', 'BLESSING', 'BLESSED',
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
export const BSL_OMITTED_PARTICLES = new Set([
  'THE', 'A', 'AN', 'IS', 'ARE', 'AM', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING',
  'OF', 'TO', 'IN', 'ON', 'AT', 'IT', 'ITS', 'THAT', 'THIS', 'THESE', 'THOSE',
  'WITH', 'AS', 'FOR', 'BY', 'FROM', 'AND', 'BUT', 'OR', 'NOR', 'SO', 'YET',
  'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'SHALL', 'SHOULD', 'HAVE', 'HAS', 'HAD'
]);

// Pronoun mappings
export const PRONOUN_1P = new Set(['I', 'ME', 'MY', 'MINE', 'MYSELF']);
export const PRONOUN_2P = new Set(['YOU', 'YOUR', 'YOURS', 'YOURSELF']);
export const PRONOUN_3P = new Set(['HE', 'HIM', 'HIS', 'SHE', 'HER', 'HERS', 'THEY', 'THEM', 'THEIR']);

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

