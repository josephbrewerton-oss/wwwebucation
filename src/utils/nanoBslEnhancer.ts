/**
 * src/utils/nanoBslEnhancer.ts
 *
 * On-Device Gemini Nano Linguistic Enhancer for BSL Level 6 & Makaton
 *
 * Sits strictly in front of the deterministic 60 FPS skeletal kinematics engine:
 * - Maps unknown/complex words & idioms onto VERIFIED signs in `BSL_CURRICULUM_LEXICON`
 *   (dramatically reducing letter-by-letter fingerspelling).
 * - Translates complex English clauses into authentic BSL Topic-Comment / OSV structure
 *   with validated spatial loci, directional agreement verbs, classifiers, aspect, and NMFs.
 * - Distills long classroom sentences into core Makaton Stage 1-8 keywords in Makaton mode.
 *
 * NON-NEGOTIABLE GUARDRAILS:
 * 1. NEVER invents raw hand coordinates or unverified signs — every sign pose is synthesized
 *    strictly through `lookupBslSign`, `lookupMakatonSign`, `generateDirectionalAgreementSign`,
 *    `generateClassifierPredicate`, or `BSL_ALPHABET_POSES` (for true proper nouns only).
 * 2. Strictly honours Eco Mode & UK GDPR consent (`hasUserGrantedAiConsent()`).
 *    Returns `null` in 0 ms when Tier-1 Chrome Built-in Gemini Nano is absent or disabled.
 * 3. Never stalls signing — guarded by strict timeouts, LRU caching, and instant deterministic fallback.
 */

import {
  BSL_ALPHABET_POSES,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_POSE,
  DOMINANT_REST_WRIST,
  type BslAspect,
  type BslClassifierType,
  type BslDirectionalVerbType,
  type BslHandPose,
  type BslNmf,
} from './bslAlphabet';
import {
  BSL_CURRICULUM_LEXICON,
  getMakatonSigns,
  lookupBslSign,
  lookupMakatonSign,
  signKeyframeToHandPose,
  type BslSign,
} from './bslLexicon';
import {
  DEFAULT_BSL_LOCI,
  type BslGrammarAnalysis,
  type BslGrammarMode,
  type BslGrammarRole,
  type BslGrammarToken,
  type BslLocusId,
} from './bslSpatialMaps';
import {
  generateClassifierPredicate,
  generateDirectionalAgreementSign,
  mapWordToClassifier,
  modulateDirectionalKeyframes,
} from './bslKinematicsPredicates';
import { aiCaller, getNanoStateSnapshot, hasUserGrantedAiConsent } from '../engine/aicaller';

export interface NanoBslPlanToken {
  gloss: string;
  role?: string;
  locus?: string;
  fromLocus?: string;
  toLocus?: string;
  directionalVerb?: string;
  classifier?: string;
  aspect?: string;
  mouth?: string;
  eyebrows?: string;
  headTilt?: string;
  roleShiftYaw?: number;
}

export interface NanoBslPlan {
  sentenceType?: string;
  eyebrows?: string;
  headTilt?: string;
  tokens: NanoBslPlanToken[];
}

export interface EnhancedBslGrammarAnalysis extends BslGrammarAnalysis {
  nanoEnhanced: true;
  resolvedFingerspellCount: number;
}

const ALLOWED_SENTENCE_TYPES = new Set<BslGrammarAnalysis['sentenceType']>([
  'statement',
  'wh-question',
  'polar-question',
  'negation',
  'conditional',
]);

const ALLOWED_EYEBROWS = new Set<'neutral' | 'raised' | 'furrowed'>([
  'neutral',
  'raised',
  'furrowed',
]);

const ALLOWED_HEAD_TILTS = new Set<'neutral' | 'nod' | 'shake' | 'tilt-left' | 'tilt-right'>([
  'neutral',
  'nod',
  'shake',
  'tilt-left',
  'tilt-right',
]);

const ALLOWED_ROLES = new Set<BslGrammarRole>([
  'time',
  'topic',
  'subject',
  'object',
  'verb',
  'directional-verb',
  'classifier-predicate',
  'question',
  'negation',
  'modifier',
  'rhq',
  'cause',
  'conditional',
  'buoy',
]);

const ALLOWED_LOCI = new Set<BslLocusId>([
  'ME',
  'YOU',
  'LOCUS_A',
  'LOCUS_B',
  'LOCUS_C',
  'LOCUS_D',
  'LOCUS_E',
  'LOCUS_F',
  'LOCUS_HIGH',
  'LOCUS_LOW',
]);

const ALLOWED_DIRECTIONAL_VERBS = new Set<BslDirectionalVerbType>([
  'give',
  'teach',
  'bless',
  'show',
  'help',
  'send',
  'invite',
]);

const ALLOWED_CLASSIFIERS = new Set<BslClassifierType>([
  'proform-v',
  'proform-1',
  'proform-b',
  'proform-c',
  'proform-claw',
  'handling-cup',
  'handling-book',
  'handling-pen',
  'trace-line',
]);

const ALLOWED_ASPECTS = new Set<BslAspect>([
  'neutral',
  'durative',
  'habitual',
  'intensive',
  'inceptive',
]);

const NANO_BSL_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    sentenceType: {
      type: 'string',
      enum: ['statement', 'wh-question', 'polar-question', 'negation', 'conditional'],
    },
    eyebrows: { type: 'string', enum: ['neutral', 'raised', 'furrowed'] },
    headTilt: { type: 'string', enum: ['neutral', 'nod', 'shake', 'tilt-left', 'tilt-right'] },
    tokens: {
      type: 'array',
      maxItems: 12,
      items: {
        type: 'object',
        properties: {
          gloss: { type: 'string' },
          role: {
            type: 'string',
            enum: [
              'time',
              'topic',
              'subject',
              'object',
              'verb',
              'directional-verb',
              'classifier-predicate',
              'question',
              'negation',
              'modifier',
            ],
          },
          locus: {
            type: 'string',
            enum: ['ME', 'YOU', 'LOCUS_A', 'LOCUS_B', 'LOCUS_HIGH', 'LOCUS_LOW'],
          },
          fromLocus: {
            type: 'string',
            enum: ['ME', 'YOU', 'LOCUS_A', 'LOCUS_B', 'LOCUS_HIGH', 'LOCUS_LOW'],
          },
          toLocus: {
            type: 'string',
            enum: ['ME', 'YOU', 'LOCUS_A', 'LOCUS_B', 'LOCUS_HIGH', 'LOCUS_LOW'],
          },
          directionalVerb: {
            type: 'string',
            enum: ['give', 'teach', 'bless', 'show', 'help', 'send', 'invite'],
          },
          classifier: {
            type: 'string',
            enum: [
              'proform-v',
              'proform-1',
              'proform-b',
              'proform-c',
              'proform-claw',
              'handling-cup',
              'handling-book',
              'handling-pen',
              'trace-line',
            ],
          },
          aspect: {
            type: 'string',
            enum: ['neutral', 'durative', 'habitual', 'intensive', 'inceptive'],
          },
          mouth: { type: 'string' },
          eyebrows: { type: 'string', enum: ['neutral', 'raised', 'furrowed'] },
        },
        required: ['gloss'],
      },
    },
  },
  required: ['tokens'],
};

const MAX_CACHE_ENTRIES = 64;
const analysisCache = new Map<string, EnhancedBslGrammarAnalysis>();
const inFlightRequests = new Map<string, Promise<EnhancedBslGrammarAnalysis | null>>();

let cachedAllBslGlosses: string[] | null = null;
let cachedMakatonWords: string[] | null = null;

function getCacheKey(text: string, mode: BslGrammarMode): string {
  return `${mode}::${text.trim().toLowerCase().replace(/\s+/g, ' ')}`;
}

function setCacheEntry(key: string, value: EnhancedBslGrammarAnalysis): void {
  if (analysisCache.has(key)) {
    analysisCache.delete(key);
  } else if (analysisCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey !== undefined) analysisCache.delete(oldestKey);
  }
  analysisCache.set(key, value);
}

export function clearNanoBslCache(): void {
  analysisCache.clear();
}

export function getCachedNanoBslAnalysis(
  text: string,
  mode: BslGrammarMode
): EnhancedBslGrammarAnalysis | null {
  const key = getCacheKey(text, mode);
  const hit = analysisCache.get(key) || null;
  if (hit) {
    // Refresh LRU recency
    analysisCache.delete(key);
    analysisCache.set(key, hit);
  }
  return hit;
}

/**
 * Returns true strictly when Tier-1 Chrome Built-in Gemini Nano is consented and available.
 * Never activates WebLLM/WebGPU downloads during live signing, and returns false in Eco Mode.
 */
export function isNanoBslEnhancementReady(): boolean {
  if (!hasUserGrantedAiConsent()) return false;
  if (!aiCaller.hasNativePromptApi()) return false;
  const snap = getNanoStateSnapshot();
  if (snap.lastCheckedAt !== null && snap.nanoStatus !== 'available') {
    return false;
  }
  return true;
}

/**
 * Decides whether an utterance meaningfully benefits from Gemini Nano semantic enhancement.
 * Simple 1-3 word phrases that are already 100% covered by the deterministic lexicon skip AI.
 */
export function shouldEnhanceBslWithNano(
  text: string,
  mode: BslGrammarMode,
  baseline: BslGrammarAnalysis
): boolean {
  if (mode === 'fingerspell') return false;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 260) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (mode === 'makaton') {
    // Enhance when deterministic Makaton found 0 signs or the sentence has 4+ words to distil
    return baseline.tokens.length === 0 || words.length >= 4;
  }

  const hasFingerspelled = baseline.tokens.some((t) => t.isFingerspelled);
  return hasFingerspelled || words.length >= 4;
}

function getRelevantLexiconHints(text: string, mode: BslGrammarMode): string[] {
  if (mode === 'makaton') {
    if (!cachedMakatonWords) {
      cachedMakatonWords = Array.from(
        new Set(
          getMakatonSigns()
            .map((s) => (s.word || s.gloss || '').toUpperCase())
            .filter((w) => w.length >= 2 && w.length <= 16)
        )
      );
    }
    return cachedMakatonWords.slice(0, 95);
  }

  if (!cachedAllBslGlosses) {
    cachedAllBslGlosses = Array.from(
      new Set(
        Object.values(BSL_CURRICULUM_LEXICON)
          .map((s) => (s.word || s.gloss || '').toUpperCase())
          .filter((w) => w.length >= 2 && w.length <= 18)
      )
    );
  }

  const inputWords = text
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const prioritized = new Set<string>();

  // 1. Add lexicon words sharing stems/substrings with the utterance
  for (const gw of cachedAllBslGlosses) {
    for (const iw of inputWords) {
      const prefix = iw.slice(0, Math.min(4, iw.length));
      if (gw.startsWith(prefix) || gw.includes(iw) || iw.includes(gw)) {
        prioritized.add(gw);
        if (prioritized.size >= 45) break;
      }
    }
    if (prioritized.size >= 45) break;
  }

  // 2. Include core school, STEM, faith & everyday concepts for synonym resolution
  const coreAnchors = [
    'WATER', 'RAIN', 'SUN', 'HEAT', 'COLD', 'LIGHT', 'ENERGY', 'FORCE', 'MOVE', 'CHANGE',
    'GROW', 'PLANT', 'ANIMAL', 'BOOK', 'READ', 'WRITE', 'THINK', 'LEARN', 'TEACH', 'SCHOOL',
    'FRIEND', 'FAMILY', 'HELP', 'GIVE', 'SHOW', 'ASK', 'LOOK', 'LISTEN', 'SPEAK', 'WORK',
    'GOOD', 'BAD', 'BIG', 'SMALL', 'FAST', 'SLOW', 'SAME', 'DIFFERENT', 'TRUE', 'FALSE',
    'MORE', 'LESS', 'ALL', 'MANY', 'FINISH', 'START', 'STOP', 'NOW', 'TODAY', 'YESTERDAY',
    'TOMORROW', 'HAPPY', 'SAD', 'CONFUSED', 'SURPRISED', 'LOVE', 'PEACE', 'GOD', 'PRAY',
    'NUMBER', 'ADD', 'MINUS', 'EQUAL', 'SHAPE', 'TIME', 'PLACE', 'WHERE', 'WHAT', 'WHY', 'HOW',
    'NOT', 'NEVER', 'YES', 'NO', 'I', 'YOU', 'WE', 'THEY',
  ];
  for (const w of coreAnchors) {
    if (lookupBslSign(w)) prioritized.add(w);
  }

  return Array.from(prioritized).slice(0, 110);
}

function sanitizeGloss(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 28);
}

function sanitizeMouth(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').slice(0, 20);
  return cleaned || fallback;
}

function isWordFromOriginalText(cleanWord: string, originalText: string): boolean {
  const normOrig = originalText.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');
  const origWords = new Set(normOrig.split(/\s+/).filter(Boolean));
  return origWords.has(cleanWord);
}

/**
 * Pure, deterministic verifier & 3D pose stream synthesizer for a Nano BSL plan.
 * Strictly validates every gloss against `BSL_CURRICULUM_LEXICON` / Makaton Core Stages
 * and every grammar tag against Level 6 allowlists. Returns `null` if no valid signs result.
 */
export function buildVerifiedNanoBslAnalysis(
  originalText: string,
  mode: BslGrammarMode,
  plan: NanoBslPlan,
  baseline: BslGrammarAnalysis
): EnhancedBslGrammarAnalysis | null {
  if (!plan || !Array.isArray(plan.tokens) || plan.tokens.length === 0) {
    return null;
  }

  const cleanInput = originalText.trim();
  const isMakaton = mode === 'makaton';
  const loci = { ...DEFAULT_BSL_LOCI };

  const sentenceType: BslGrammarAnalysis['sentenceType'] =
    plan.sentenceType && ALLOWED_SENTENCE_TYPES.has(plan.sentenceType as any)
      ? (plan.sentenceType as BslGrammarAnalysis['sentenceType'])
      : baseline.sentenceType;

  const globalEyebrows: 'neutral' | 'raised' | 'furrowed' =
    plan.eyebrows && ALLOWED_EYEBROWS.has(plan.eyebrows as any)
      ? (plan.eyebrows as 'neutral' | 'raised' | 'furrowed')
      : baseline.nmfSummary.eyebrows;

  const globalHeadTilt: 'neutral' | 'nod' | 'shake' | 'tilt-left' | 'tilt-right' =
    plan.headTilt && ALLOWED_HEAD_TILTS.has(plan.headTilt as any)
      ? (plan.headTilt as 'neutral' | 'nod' | 'shake' | 'tilt-left' | 'tilt-right')
      : baseline.nmfSummary.headTilt;

  const verifiedTokens: BslGrammarToken[] = [];
  const maxTokens = isMakaton ? 6 : 12;

  for (const rawTok of plan.tokens.slice(0, maxTokens)) {
    if (!rawTok || typeof rawTok !== 'object') continue;
    const gloss = sanitizeGloss(rawTok.gloss);
    if (!gloss) continue;

    // Avoid consecutive duplicate glosses
    const prevTok = verifiedTokens[verifiedTokens.length - 1];
    if (prevTok && prevTok.gloss === gloss) continue;

    const rawRole = typeof rawTok.role === 'string' ? rawTok.role.trim().toLowerCase() : '';
    const role: BslGrammarRole = ALLOWED_ROLES.has(rawRole as BslGrammarRole)
      ? (rawRole as BslGrammarRole)
      : 'modifier';

    const locus: BslLocusId | undefined =
      typeof rawTok.locus === 'string' && ALLOWED_LOCI.has(rawTok.locus.trim().toUpperCase() as BslLocusId)
        ? (rawTok.locus.trim().toUpperCase() as BslLocusId)
        : undefined;

    const fromLocus: BslLocusId | undefined =
      typeof rawTok.fromLocus === 'string' && ALLOWED_LOCI.has(rawTok.fromLocus.trim().toUpperCase() as BslLocusId)
        ? (rawTok.fromLocus.trim().toUpperCase() as BslLocusId)
        : undefined;

    const toLocus: BslLocusId | undefined =
      typeof rawTok.toLocus === 'string' && ALLOWED_LOCI.has(rawTok.toLocus.trim().toUpperCase() as BslLocusId)
        ? (rawTok.toLocus.trim().toUpperCase() as BslLocusId)
        : undefined;

    const aspect: BslAspect | undefined =
      typeof rawTok.aspect === 'string' && ALLOWED_ASPECTS.has(rawTok.aspect.trim().toLowerCase() as BslAspect)
        ? (rawTok.aspect.trim().toLowerCase() as BslAspect)
        : undefined;

    const tokEyebrows =
      typeof rawTok.eyebrows === 'string' && ALLOWED_EYEBROWS.has(rawTok.eyebrows as any)
        ? (rawTok.eyebrows as 'neutral' | 'raised' | 'furrowed')
        : role === 'topic' || role === 'conditional'
          ? 'raised'
          : role === 'question'
            ? 'furrowed'
            : globalEyebrows;

    const tokHeadTilt =
      typeof rawTok.headTilt === 'string' && ALLOWED_HEAD_TILTS.has(rawTok.headTilt as any)
        ? (rawTok.headTilt as 'neutral' | 'nod' | 'shake' | 'tilt-left' | 'tilt-right')
        : role === 'negation'
          ? 'shake'
          : globalHeadTilt;

    const nmf: BslNmf = {
      eyebrows: tokEyebrows,
      headTilt: tokHeadTilt,
      mouth: sanitizeMouth(rawTok.mouth, gloss.toLowerCase()),
    };

    if (typeof rawTok.roleShiftYaw === 'number' && Number.isFinite(rawTok.roleShiftYaw) && Math.abs(rawTok.roleShiftYaw) >= 5) {
      const clampedYaw = Math.max(-25, Math.min(25, Math.round(rawTok.roleShiftYaw)));
      nmf.roleShift = {
        agent: gloss,
        yaw: clampedYaw,
        gaze: clampedYaw > 0 ? 'right' : 'left',
      };
    }

    if (isMakaton) {
      // Makaton mode: strictly verified Stage 1-8 Core Vocabulary signs ONLY
      const mk = lookupMakatonSign(gloss);
      if (!mk) continue;
      verifiedTokens.push({
        originalWord: gloss,
        cleanWord: gloss,
        gloss: mk.sign.gloss || gloss,
        role: 'modifier',
        sign: mk.sign,
        makatonStage: mk.stage,
        isFingerspelled: false,
        nmf: {
          eyebrows: 'neutral',
          mouth: gloss.toLowerCase(),
        },
      });
      continue;
    }

    // BSL Natural & SSE mode:
    // 1. Directional Agreement Verb (validated enum + spatial loci)
    const dirVerbCandidate = (rawTok.directionalVerb || gloss).toLowerCase() as BslDirectionalVerbType;
    if (
      (role === 'directional-verb' || Boolean(rawTok.directionalVerb)) &&
      ALLOWED_DIRECTIONAL_VERBS.has(dirVerbCandidate) &&
      fromLocus &&
      toLocus &&
      fromLocus !== toLocus
    ) {
      const dirSign = generateDirectionalAgreementSign(dirVerbCandidate, {
        fromLocus,
        toLocus,
        aspect,
      });
      verifiedTokens.push({
        originalWord: gloss,
        cleanWord: gloss,
        gloss: `${dirVerbCandidate.toUpperCase()}[${fromLocus}→${toLocus}]`,
        role: 'directional-verb',
        directionalFrom: fromLocus,
        directionalTo: toLocus,
        aspect,
        sign: dirSign,
        isFingerspelled: false,
        nmf,
      });
      continue;
    }

    // 2. Explicit Classifier Predicate (validated enum)
    const rawCl = typeof rawTok.classifier === 'string' ? rawTok.classifier.trim().toLowerCase() : '';
    if (ALLOWED_CLASSIFIERS.has(rawCl as BslClassifierType)) {
      const clType = rawCl as BslClassifierType;
      const clSign = generateClassifierPredicate(clType, {
        fromLocus: fromLocus || 'LOCUS_A',
        toLocus: toLocus || 'LOCUS_B',
        aspect,
        entityLabel: gloss,
      });
      verifiedTokens.push({
        originalWord: gloss,
        cleanWord: gloss,
        gloss: `CL:${clType.toUpperCase()}(${gloss})`,
        role: 'classifier-predicate',
        directionalFrom: fromLocus,
        directionalTo: toLocus,
        classifier: clSign.classifier || { type: clType, entityLabel: gloss, aspect },
        aspect,
        sign: clSign,
        isFingerspelled: false,
        nmf,
      });
      continue;
    }

    // 3. Verified Whole-Word Sign from BSL_CURRICULUM_LEXICON (or alias table)
    const sign: BslSign | null = lookupBslSign(gloss);
    if (sign) {
      verifiedTokens.push({
        originalWord: gloss,
        cleanWord: gloss,
        gloss: sign.gloss || gloss,
        role: sign.isDirectional && fromLocus && toLocus ? 'directional-verb' : role,
        locus,
        directionalFrom: sign.isDirectional ? fromLocus : undefined,
        directionalTo: sign.isDirectional ? toLocus : undefined,
        aspect,
        sign,
        isFingerspelled: false,
        nmf,
      });
      continue;
    }

    // 4. Semantic classifier fallback for un-lexiconed motion/shape words
    const clFallback = mapWordToClassifier(gloss);
    if (clFallback) {
      const clSign = generateClassifierPredicate(clFallback.type, {
        entityLabel: gloss,
        ...clFallback.options,
        aspect,
      });
      verifiedTokens.push({
        originalWord: gloss,
        cleanWord: gloss,
        gloss,
        role: 'classifier-predicate',
        classifier: clSign.classifier || { type: clFallback.type, entityLabel: gloss },
        aspect,
        sign: clSign,
        isFingerspelled: false,
        nmf,
      });
      continue;
    }

    // 5. Proper noun / authentic unmapped word from the original text -> BANZSL fingerspelling
    const singleWord = gloss.replace(/[^A-Z]/g, '');
    if (singleWord.length >= 2 && singleWord.length <= 16 && isWordFromOriginalText(singleWord, cleanInput)) {
      verifiedTokens.push({
        originalWord: singleWord,
        cleanWord: singleWord,
        gloss: singleWord,
        role,
        locus,
        isFingerspelled: true,
        nmf,
      });
    }
  }

  if (verifiedTokens.length === 0) {
    return null;
  }

  // Synthesize procedural 3D pose stream using strictly authentic lexicon/kinematics poses
  const stream: BslHandPose[] = [];
  for (let tIdx = 0; tIdx < verifiedTokens.length; tIdx++) {
    const tok = verifiedTokens[tIdx];

    if (tok.role === 'directional-verb' && tok.sign && tok.directionalFrom && tok.directionalTo) {
      const fromPt = loci[tok.directionalFrom].coords;
      const toPt = loci[tok.directionalTo].coords;
      const kfs = tok.sign.id.startsWith('dir-')
        ? tok.sign.keyframes
        : modulateDirectionalKeyframes(tok.sign, fromPt, toPt);
      const totalKf = kfs.length;
      kfs.forEach((kf, kfIdx) => {
        const pose = signKeyframeToHandPose(tok.sign!, kf, kfIdx, totalKf);
        if (tok.nmf) pose.nmf = { ...pose.nmf, ...tok.nmf };
        if (tok.aspect) pose.aspect = tok.aspect;
        stream.push(pose);
      });
    } else if (tok.sign) {
      const totalKf = tok.sign.keyframes.length;
      tok.sign.keyframes.forEach((kf, kfIdx) => {
        const pose = signKeyframeToHandPose(tok.sign!, kf, kfIdx, totalKf);
        if (tok.classifier) pose.classifier = tok.classifier;
        if (tok.aspect) pose.aspect = tok.aspect;
        if (tok.nmf) pose.nmf = { ...pose.nmf, ...tok.nmf };
        stream.push(pose);
      });
    } else if (tok.isFingerspelled) {
      for (const ch of tok.cleanWord) {
        if (BSL_ALPHABET_POSES[ch]) {
          const pose = { ...BSL_ALPHABET_POSES[ch] };
          if (tok.nmf) pose.nmf = { ...pose.nmf, ...tok.nmf };
          stream.push(pose);
        }
      }
    }

    if (tIdx < verifiedTokens.length - 1 && stream.length > 0) {
      stream.push({
        letter: ' ',
        label: 'Boundary',
        rule: 'Neutral transition between signs',
        isVowel: false,
        targetTip: { ...DOMINANT_REST_POSE },
        targetKnuckle: { ...DOMINANT_REST_KNUCKLE },
        targetWrist: { ...DOMINANT_REST_WRIST },
        baseHandMode: 'rest',
        shape: 'flat-closed',
        palm: 'in',
        ease: 'spring',
      });
    }
  }

  if (stream.length === 0) {
    return null;
  }

  const baselineFingerspelled = baseline.tokens.filter((t) => t.isFingerspelled).length;
  const enhancedFingerspelled = verifiedTokens.filter((t) => t.isFingerspelled).length;
  const resolvedFingerspellCount = Math.max(0, baselineFingerspelled - enhancedFingerspelled);

  const glossSequence = isMakaton
    ? verifiedTokens.map((t) => t.gloss).join('  •  ')
    : verifiedTokens
        .map((t) => {
          let badge = `[${t.role.toUpperCase()}]`;
          if (t.role === 'time') badge = '[TIME]';
          if (t.role === 'topic') badge = '[TOPIC]';
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
    tokens: verifiedTokens,
    glossSequence,
    activeLoci: loci,
    nmfSummary: {
      eyebrows: globalEyebrows,
      headTilt: globalHeadTilt,
      mouthCue: cleanInput.slice(0, 15),
    },
    stream,
    nanoEnhanced: true,
    resolvedFingerspellCount,
  };
}

function extractJsonObject(raw: string): NanoBslPlan | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as NanoBslPlan;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as NanoBslPlan;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Enhances a deterministic BSL/Makaton analysis using on-device Chrome Built-in Gemini Nano.
 * Resolves unknown words to verified lexicon synonyms, improves Topic-Comment/OSV BSL grammar,
 * and picks core Makaton keywords — always falling back cleanly to `null` if unavailable or slow.
 */
export async function enhanceBslWithNano(
  text: string,
  mode: BslGrammarMode,
  baseline: BslGrammarAnalysis,
  timeoutMs: number = 1800
): Promise<EnhancedBslGrammarAnalysis | null> {
  if (!isNanoBslEnhancementReady()) return null;
  if (!shouldEnhanceBslWithNano(text, mode, baseline)) return null;

  const cacheKey = getCacheKey(text, mode);
  const cached = getCachedNanoBslAnalysis(text, mode);
  if (cached) return cached;

  const existing = inFlightRequests.get(cacheKey);
  if (existing) return existing;

  const task = (async (): Promise<EnhancedBslGrammarAnalysis | null> => {
    try {
      const vocabHints = getRelevantLexiconHints(text, mode);
      const unknownWords = baseline.tokens
        .filter((t) => t.isFingerspelled)
        .map((t) => t.cleanWord);

      const isMakaton = mode === 'makaton';
      const systemPrompt = isMakaton
        ? 'You are a UK Makaton Key Word Signing linguistic assistant. Select 1 to 5 core meaning-carrying keywords from the English sentence in natural English SVO order, mapping synonyms strictly to the provided verified Makaton vocabulary list. Return ONLY valid JSON matching the schema.'
        : 'You are a UK Signature BSL Level 6 interpreter. Convert English into natural BSL gloss tokens using TIME -> TOPIC -> COMMENT (OSV) order, post-positioned WH-questions/negations, spatial loci (ME, YOU, LOCUS_A, LOCUS_B, LOCUS_HIGH, LOCUS_LOW), directional verbs (give, teach, bless, show, help, send, invite), and classifiers where appropriate. Replace complex or unknown English words with simpler verified BSL sign glosses from the provided vocabulary list whenever meaning is preserved. Keep proper nouns as-is. Return ONLY valid JSON matching the schema.';

      const userPrompt = isMakaton
        ? `Sentence: "${text.trim()}"\nVerified Makaton vocabulary: ${vocabHints.join(', ')}\nReturn JSON { "tokens": [{ "gloss": "WORD" }] } using ONLY words from the verified list.`
        : `Sentence: "${text.trim()}"\nMode: ${mode}\nUnmapped words to simplify to known signs if possible: ${unknownWords.length > 0 ? unknownWords.join(', ') : 'none'}\nVerified BSL vocabulary sample: ${vocabHints.join(', ')}\nReturn compact JSON with sentenceType, eyebrows, headTilt, and tokens.`;

      const raw = await aiCaller.promptText({
        prompt: userPrompt,
        systemPrompt,
        timeoutMs,
        responseConstraint: NANO_BSL_RESPONSE_SCHEMA,
        omitResponseConstraintInput: true,
      });

      const plan = extractJsonObject(raw);
      if (!plan) return null;

      const verified = buildVerifiedNanoBslAnalysis(text, mode, plan, baseline);
      if (!verified) return null;

      setCacheEntry(cacheKey, verified);
      return verified;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, task);
  return task;
}
