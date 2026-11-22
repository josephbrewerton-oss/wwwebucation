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
  BslDirectionalVerbType,
  BslDirectionalAgreement,
  BslLevel6InstructionTuple,
  BslBuoyType,
  BslBuoy,
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
  BslDirectionalVerbType,
  BslDirectionalAgreement,
  BslLevel6InstructionTuple,
  BslBuoyType,
  BslBuoy,
};


import {
  DEFAULT_BSL_LOCI,
  TIME_WORDS,
  WH_QUESTION_WORDS,
  POLAR_QUESTION_LEADERS,
  NEGATION_WORDS,
  DIRECTIONAL_VERB_MAP,
  DIRECTIONAL_VERB_WORDS,
  BSL_OMITTED_PARTICLES,
  PRONOUN_1P,
  PRONOUN_2P,
  PRONOUN_3P,
  HIERARCHICAL_HIGH_ENTITIES,
  HIERARCHICAL_LOW_ENTITIES,
  ADVERB_MOUTH_MAP,
  CLASSIFIER_VERB_MAP,
  ASPECT_MARKER_MAP,
  type BslGrammarMode,
  type BslLocusId,
  type BslElevation,
  type BslLocus,
  type BslGrammarRole,
  type BslGrammarToken,
  type BslGrammarAnalysis,
} from './bslSpatialMaps';
import {
  generateClassifierPredicate,
  mapWordToClassifier,
  modulateDirectionalKeyframes,
  generateDirectionalAgreementSign,
} from './bslKinematicsPredicates';

export type {
  BslGrammarMode,
  BslLocusId,
  BslElevation,
  BslLocus,
  BslGrammarRole,
  BslGrammarToken,
  BslGrammarAnalysis,
};
export {
  DEFAULT_BSL_LOCI,
  DIRECTIONAL_VERB_MAP,
  HIERARCHICAL_HIGH_ENTITIES,
  HIERARCHICAL_LOW_ENTITIES,
  ADVERB_MOUTH_MAP,
  CLASSIFIER_VERB_MAP,
  ASPECT_MARKER_MAP,
  generateClassifierPredicate,
  mapWordToClassifier,
  modulateDirectionalKeyframes,
  generateDirectionalAgreementSign,
};

/**
 * Parses a BSL Level 6 Instruction Tuple into a sequence of authentic BslSign objects
 */
export function parseBslInstructionTuple(tuple: BslLevel6InstructionTuple): BslSign[] {
  const result: BslSign[] = [];

  // 1. Topic (Eyebrows Raised)
  if (tuple.topic) {
    const raw = tuple.topic.trim().toUpperCase();
    const sign = lookupBslSign(raw);
    if (sign) {
      result.push({
        ...sign,
        keyframes: sign.keyframes.map((kf) => ({
          ...kf,
          nmf: {
            ...kf.nmf,
            eyebrows: 'raised',
            mouth: tuple.nmfMouth || kf.nmf?.mouth || raw.toLowerCase(),
          },
        })),
      });
    }
  }

  // 2. Rhetorical Question (Level 6 RHQ: Eyebrows Raised with Tilt)
  if (tuple.rhQuestion) {
    const raw = tuple.rhQuestion.trim().toUpperCase();
    const sign = lookupBslSign(raw) || lookupBslSign('WHY-RHQ');
    if (sign) {
      result.push({
        ...sign,
        keyframes: sign.keyframes.map((kf) => ({
          ...kf,
          nmf: {
            ...kf.nmf,
            eyebrows: 'raised',
            headTilt: 'tilt-right',
            mouth: raw.toLowerCase(),
          },
        })),
      });
    }
  }

  // 3. Directional Agreement Verb
  if (tuple.directionalVerb) {
    const dirSign = generateDirectionalAgreementSign(tuple.directionalVerb.verb, {
      fromLocus: tuple.directionalVerb.fromLocus as BslLocusId,
      toLocus: tuple.directionalVerb.toLocus as BslLocusId,
      aspect: tuple.directionalVerb.aspect || tuple.aspect,
      manner: tuple.directionalVerb.manner as any,
    });
    result.push(dirSign);
  }

  // 4. Classifier Predicate (with optional baseHold anchor)
  if (tuple.classifier) {
    const clSign = generateClassifierPredicate(tuple.classifier.type, {
      fromLocus: tuple.classifier.fromLocus as BslLocusId,
      toLocus: tuple.classifier.toLocus as BslLocusId,
      aspect: tuple.classifier.aspect || tuple.aspect,
      manner: tuple.classifier.manner,
      entityLabel: tuple.classifier.entityLabel,
    });
    if (tuple.classifier.baseHold) {
      clSign.keyframes = clSign.keyframes.map((kf) => ({
        ...kf,
        baseHandMode: 'base-hold',
      }));
    }
    result.push(clSign);
  }

  // 5. If Discourse Buoy is defined, anchor the non-dominant base hand across all signs
  if (tuple.buoy) {
    result.forEach((sign) => {
      sign.buoy = tuple.buoy;
      sign.keyframes.forEach((kf) => {
        kf.buoy = tuple.buoy;
        kf.baseHandMode = 'base-hold';
      });
    });
  }

  return result;
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
  const hasConditionalLeader = upperWords.length > 0 && (upperWords[0] === 'IF' || upperWords[0] === 'SUPPOSE');
  const hasWhQuestion = upperWords.some((w) => WH_QUESTION_WORDS.has(w));
  const hasPolarLeader = upperWords.length > 0 && POLAR_QUESTION_LEADERS.has(upperWords[0]);
  const hasNegation = upperWords.some((w) => NEGATION_WORDS.has(w));

  let sentenceType: BslGrammarAnalysis['sentenceType'] = 'statement';
  if (hasConditionalLeader) {
    sentenceType = 'conditional';
  } else if (hasWhQuestion) {
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
          const phraseLabel = `${raw} ${rawWords[wIdx + 1]}`.toLowerCase();
          sign.keyframes.forEach((kf, idx) => {
            const pose = signKeyframeToHandPose(sign, kf, idx, total);
            stream.push({
              ...pose,
              letter: sign.word,
              label: `Makaton S${stage} • ${sign.englishLabel || phraseLabel}`,
              classifier: undefined,
              aspect: undefined,
              buoy: undefined,
              ease: 'smooth',
              nmf: {
                eyebrows: 'raised',
                mouth: phraseLabel,
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
              targetTip: { ...DOMINANT_REST_POSE },
              targetKnuckle: { ...DOMINANT_REST_KNUCKLE },
              targetWrist: { ...DOMINANT_REST_WRIST },
              baseHandMode: 'rest',
              shape: 'flat-closed',
              palm: 'in',
              ease: 'spring',
            });
          }
          continue;
        }
      }

      // 2. Single keyword lookup strictly in Makaton Core Stages 1–8
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
            letter: sign.word,
            label: `Makaton S${stage} • ${sign.englishLabel || raw.toLowerCase()}`,
            classifier: undefined,
            aspect: undefined,
            buoy: undefined,
            ease: 'smooth',
            nmf: {
              eyebrows: 'raised',
              mouth: raw.toLowerCase(),
              headTilt: 'nod',
            },
          });
        });
      } else {
        // In Makaton, untranslated or secondary words are spoken naturally without fingerspelling overload
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
        sign: timeSign ?? undefined,
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
        sign: whSign ?? undefined,
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
        sign: negSign ?? undefined,
        nmf: { eyebrows: 'neutral', mouth: 'no', headTilt: 'shake' },
      });
      continue;
    }

    // Level 6 Causal Conjunctions (BECAUSE, SINCE) -> Transpile into Rhetorical Question WHY[RHQ]
    if (clean === 'BECAUSE' || clean === 'SINCE') {
      const whyRhqSign = lookupBslSign('WHY-RHQ');
      coreTokens.push({
        raw,
        clean: 'WHY-RHQ',
        lemma: 'WHY-RHQ',
        sign: whyRhqSign || undefined,
        role: 'rhq',
        gloss: 'WHY[RHQ]',
      });
      continue;
    }

    // Level 6 Conditional Markers (IF, SUPPOSE) -> Transpile into SUPPOSE with raised brows
    if (clean === 'IF' || clean === 'SUPPOSE') {
      const supposeSign = lookupBslSign('SUPPOSE');
      coreTokens.push({
        raw,
        clean: 'SUPPOSE',
        lemma: 'SUPPOSE',
        sign: supposeSign || undefined,
        role: 'conditional',
        gloss: 'SUPPOSE',
      });
      continue;
    }

    // Level 6 Consequential Markers (THEREFORE, THUS) -> Transpile into RESULT
    if (clean === 'THEREFORE' || clean === 'THUS') {
      const resultSign = lookupBslSign('RESULT');
      coreTokens.push({
        raw,
        clean: 'RESULT',
        lemma: 'RESULT',
        sign: resultSign || undefined,
        role: 'topic',
        gloss: 'RESULT',
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
      sign: sign ?? undefined,
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

  // If directional agreement verb is active, synthesize its 3D procedural agreement sign
  if (directionalVerb) {
    const dirType =
      DIRECTIONAL_VERB_MAP[directionalVerb.clean] ||
      DIRECTIONAL_VERB_MAP[directionalVerb.lemma];
    if (dirType) {
      const dirSign = generateDirectionalAgreementSign(dirType, {
        fromLocus,
        toLocus,
        aspect: detectedAspect || 'neutral',
      });
      directionalVerb.sign = dirSign;
      directionalVerb.gloss = dirSign.gloss;
    }
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
  const reorderedTokens: BslGrammarToken[] = [];
  const rhqIndex = coreTokens.findIndex((t) => t.role === 'rhq');

  if (rhqIndex !== -1) {
    // -------------------------------------------------------------------------
    // Level 6 Rhetorical Questioning Architecture:
    // [EFFECT TOPIC/PREDICATE] -> [RHQ: WHY? (brows up, tilt right)] -> [CAUSE (nod)]
    // -------------------------------------------------------------------------
    timeTokens.forEach((t) => reorderedTokens.push(t));

    const effectTokens = coreTokens.slice(0, rhqIndex);
    effectTokens.forEach((t) => {
      reorderedTokens.push({
        originalWord: t.raw,
        cleanWord: t.clean,
        gloss: t.gloss || t.sign?.gloss || t.clean,
        role: 'topic',
        sign: t.sign,
        nmf: {
          eyebrows: 'neutral',
          mouth: t.clean.toLowerCase(),
        },
      });
    });

    const rhqTok = coreTokens[rhqIndex];
    reorderedTokens.push({
      originalWord: rhqTok.raw,
      cleanWord: 'WHY-RHQ',
      gloss: 'WHY[RHQ]',
      role: 'rhq',
      sign: rhqTok.sign || lookupBslSign('WHY-RHQ') || undefined,
      nmf: {
        eyebrows: 'raised',
        headTilt: 'tilt-right',
        mouth: 'why',
      },
    });

    const causeTokens = coreTokens.slice(rhqIndex + 1);
    causeTokens.forEach((t) => {
      reorderedTokens.push({
        originalWord: t.raw,
        cleanWord: t.clean,
        gloss: t.gloss || t.sign?.gloss || t.clean,
        role: 'cause',
        sign: t.sign,
        nmf: {
          eyebrows: 'neutral',
          headTilt: 'nod',
          mouth: t.clean.toLowerCase(),
        },
      });
    });

    negationTokens.forEach((t) => reorderedTokens.push(t));
    whQuestionTokens.forEach((t) => reorderedTokens.push(t));
  } else if (sentenceType === 'conditional') {
    // -------------------------------------------------------------------------
    // Level 6 Conditional Architecture:
    // [COND] SUPPOSE (brows up) -> Condition Clause (brows up) -> Consequence (nod)
    // -------------------------------------------------------------------------
    timeTokens.forEach((t) => reorderedTokens.push(t));

    const condTok = coreTokens.find((t) => t.role === 'conditional');
    reorderedTokens.push({
      originalWord: condTok?.raw || 'if',
      cleanWord: 'SUPPOSE',
      gloss: 'SUPPOSE',
      role: 'conditional',
      sign: condTok?.sign || lookupBslSign('SUPPOSE') || undefined,
      nmf: {
        eyebrows: 'raised',
        headTilt: 'tilt-left',
        mouth: 'suppose',
      },
    });

    const contentTokens = coreTokens.filter((t) => t.role !== 'conditional');
    const midPoint = Math.max(1, Math.floor(contentTokens.length / 2));
    const ifTokens = contentTokens.slice(0, midPoint);
    const thenTokens = contentTokens.slice(midPoint);

    ifTokens.forEach((t) => {
      reorderedTokens.push({
        originalWord: t.raw,
        cleanWord: t.clean,
        gloss: t.gloss || t.sign?.gloss || t.clean,
        role: 'topic',
        sign: t.sign,
        nmf: {
          eyebrows: 'raised',
          headTilt: 'tilt-left',
          mouth: t.clean.toLowerCase(),
        },
      });
    });

    thenTokens.forEach((t) => {
      reorderedTokens.push({
        originalWord: t.raw,
        cleanWord: t.clean,
        gloss: t.gloss || t.sign?.gloss || t.clean,
        role: 'topic',
        sign: t.sign,
        nmf: {
          eyebrows: 'neutral',
          headTilt: 'nod',
          mouth: t.clean.toLowerCase(),
        },
      });
    });

    negationTokens.forEach((t) => reorderedTokens.push(t));
  } else {
    // Standard Topic-Comment Architecture:
    // Order: [TIME] -> [TOPIC / OBJECT] -> [SUBJECT (Locus)] -> [DIRECTIONAL VERB / CLASSIFIER] -> [NEGATION] -> [WH-QUESTION]
    timeTokens.forEach((t) => {
      reorderedTokens.push(t);
    });

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

    if (classifierPredicateToken) {
      reorderedTokens.push({
        originalWord: classifierPredicateToken.raw,
        cleanWord: classifierPredicateToken.clean,
        gloss: classifierPredicateToken.gloss ?? classifierPredicateToken.clean,
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
        gloss: directionalVerb.gloss || `${directionalVerb.sign?.gloss || directionalVerb.clean}[${fromLocus}→${toLocus}]`,
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

    negationTokens.forEach((t) => {
      reorderedTokens.push(t);
    });
  }

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
      // If directional sign is procedurally synthesized with baked loci/curves, use them directly;
      // otherwise modulate keyframes across loci vectors.
      const fromPt = loci[tok.directionalFrom].coords;
      const toPt = loci[tok.directionalTo].coords;
      const modulatedKfs = tok.sign.id.startsWith('dir-')
        ? tok.sign.keyframes
        : modulateDirectionalKeyframes(tok.sign, fromPt, toPt);
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
        if (tok.buoy) pose.buoy = tok.buoy;
        if (tok.nmf) {
          pose.nmf = { ...pose.nmf, ...tok.nmf };
        }
        stream.push(pose);
      });
    } else {
      // 1. Attempt BSL Level 6 Semantic Classifier Predicate synthesis
      const classifierMatch = mapWordToClassifier(tok.cleanWord);

      if (classifierMatch) {
        const clSign = generateClassifierPredicate(classifierMatch.type, {
          entityLabel: tok.cleanWord,
          ...classifierMatch.options,
        });

        tok.classifier = clSign.classifier || {
          type: classifierMatch.type,
          entityLabel: tok.cleanWord,
        };
        tok.sign = clSign;
        tok.isFingerspelled = false;

        const totalKf = clSign.keyframes.length;
        clSign.keyframes.forEach((kf, kfIdx) => {
          const pose = signKeyframeToHandPose(clSign, kf, kfIdx, totalKf);
          if (tok.classifier) pose.classifier = tok.classifier;
          if (tok.aspect) pose.aspect = tok.aspect;
          if (tok.buoy) pose.buoy = tok.buoy;
          if (tok.nmf) {
            pose.nmf = { ...pose.nmf, ...tok.nmf };
          }
          stream.push(pose);
        });
      } else {
        // 2. Un-lexiconed word without spatial proform: fallback to BANZSL manual fingerspelling
        tok.isFingerspelled = true;
        for (const char of tok.cleanWord) {
          if (BSL_ALPHABET_POSES[char]) {
            const pose = { ...BSL_ALPHABET_POSES[char] };
            if (tok.nmf) pose.nmf = tok.nmf;
            if (tok.buoy) pose.buoy = tok.buoy;
            stream.push(pose);
          }
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
      if (t.role === 'rhq') badge = '[RHQ]';
      if (t.role === 'cause') badge = '[CAUSE]';
      if (t.role === 'conditional') badge = '[COND]';
      if (t.role === 'buoy') badge = '[BUOY]';
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
      eyebrows: sentenceType === 'wh-question' ? 'furrowed' : (sentenceType === 'polar-question' || sentenceType === 'conditional') ? 'raised' : 'neutral',
      headTilt: sentenceType === 'negation' ? 'shake' : (sentenceType === 'polar-question' || sentenceType === 'conditional') ? 'nod' : 'neutral',
      mouthCue: cleanInput.slice(0, 15),
    },
    stream,
  };
}
