// src/pages/phonics/phonicsSpeech.ts
/**
 * Phonics Studio Speech, Progress & Puzzle Helpers
 *
 * Extracted from src/pages/phonics-suite.ts so the page orchestrator stays lean
 * and speech synthesis / Elkonin puzzle logic can be reasoned about independently.
 */

import {
  PHONICS_GRAPHEMES,
  getPhonemeSpokenText,
  type DecodableWord,
} from '../../data/phonicsCurriculumData';
import {
  ALL_DECODABLE_WORDS,
  type PreReaderMode,
} from '../../data/earlyReaderLadderData';
import { broadcastBslSpeech } from '../../services/bslGlobalStore';
import { getLocalJson, setLocalJson } from '../../services/localStateStore';
import { unlockSoundEngine } from '../../services/soundHaptics';

export type StudioStage =
  | 'ear-warmup'
  | 'pure-sounds'
  | 'blend-words'
  | 'build-words'
  | 'tricky-words'
  | 'mini-books'
  | 'screening';

export interface ReaderProgress {
  earStars: string[];
  soundsHeard: string[];
  wordsBlended: string[];
  wordsBuilt: string[];
  trickyKnown: string[];
  booksCompleted: string[];
}

export interface BuildTile {
  tileId: string;
  letters: string;
  soundHint: string;
}

export interface PhonicsStudioState {
  base: string;
  progress: ReaderProgress;
  activeStage: StudioStage;

  // Stage 0: Ear Warm-Up
  earFilter: 'all' | PreReaderMode;
  earIndex: number;
  earShowLabels: boolean;
  earStatus: 'idle' | 'correct' | 'retry';
  earChosenLabel: string;

  // Stage 1: Pure Sounds
  activeSoundGroupId: string;
  selectedGraphemeId: string;

  // Stage 2: Blend Words
  blendPhaseFilter: 'starter' | 2 | 3 | 4 | 5;
  blendWordIndex: number;
  blendHighlightIdx: number;
  blendPictureRevealed: boolean;
  blendHidePictureFirst: boolean;

  // Stage 3: Build Words (Elkonin Boxes)
  buildPhaseFilter: 'starter' | 2 | 3 | 4 | 5;
  buildWordIndex: number;
  buildSlots: Array<BuildTile | null>;
  buildTray: BuildTile[];
  buildStatus: 'idle' | 'correct' | 'wrong';
  buildHintText: string;

  // Stage 4: Tricky Words
  trickyPhaseFilter: 'all' | 2 | 3 | 4 | 5;
  selectedTrickyId: string;

  // Stage 5: Mini-Books
  openBookId: string | null;
  bookQuizMode: boolean;
  bookQuizAnswers: Record<string, boolean>;

  // Year 1 Screening Check
  screeningIndex: number;
  screeningShowButtons: boolean;
  screeningHighlightIdx: number;
  screeningScores: Record<string, 'pass' | 'retry'>;
}

const PROGRESS_STORAGE_KEY = 'stj_early_reader_progress';

export function loadReaderProgress(): ReaderProgress {
  const saved = getLocalJson<Partial<ReaderProgress>>(PROGRESS_STORAGE_KEY);
  return {
    earStars: Array.isArray(saved?.earStars) ? saved.earStars : [],
    soundsHeard: Array.isArray(saved?.soundsHeard) ? saved.soundsHeard : [],
    wordsBlended: Array.isArray(saved?.wordsBlended) ? saved.wordsBlended : [],
    wordsBuilt: Array.isArray(saved?.wordsBuilt) ? saved.wordsBuilt : [],
    trickyKnown: Array.isArray(saved?.trickyKnown) ? saved.trickyKnown : [],
    booksCompleted: Array.isArray(saved?.booksCompleted) ? saved.booksCompleted : [],
  };
}

export function saveReaderProgress(progress: ReaderProgress): void {
  setLocalJson(PROGRESS_STORAGE_KEY, progress);
}

export function totalReaderStars(progress: ReaderProgress): number {
  return (
    progress.earStars.length +
    progress.wordsBlended.length +
    progress.wordsBuilt.length +
    progress.trickyKnown.length +
    progress.booksCompleted.length * 3
  );
}

export function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getWordsForFilter(filter: 'starter' | 2 | 3 | 4 | 5): DecodableWord[] {
  if (filter === 'starter') {
    return ALL_DECODABLE_WORDS.filter((w) => w.category === 'SATPIN Starter');
  }
  return ALL_DECODABLE_WORDS.filter((w) => w.phase === filter);
}

export function initElkoninBuildPuzzle(state: PhonicsStudioState): void {
  const words = getWordsForFilter(state.buildPhaseFilter);
  const word = words[state.buildWordIndex % Math.max(1, words.length)];
  if (!word) return;

  state.buildSlots = word.segments.map(() => null);
  state.buildStatus = 'idle';
  state.buildHintText = '';

  // Pick 3 helpful distractors from same or earlier phase
  const targetLetters = new Set(word.segments.map((s) => s.letters.toLowerCase()));
  const distractorPool = PHONICS_GRAPHEMES.filter(
    (g) =>
      g.phase <= word.phase &&
      !g.grapheme.includes(' ') &&
      !targetLetters.has(g.grapheme.toLowerCase())
  );

  // Deterministic shuffle seeded by word so tray doesn't jump wildly on re-render
  const seed = word.word.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const distractors: Array<{ letters: string; soundHint: string }> = [];
  for (let i = 0; i < distractorPool.length && distractors.length < 3; i++) {
    const candidate = distractorPool[(seed * 7 + i * 11) % distractorPool.length];
    if (!distractors.some((d) => d.letters === candidate.grapheme)) {
      distractors.push({
        letters: candidate.grapheme,
        soundHint: candidate.soundAudioText,
      });
    }
  }

  const combined: BuildTile[] = [
    ...word.segments.map((s, idx) => ({
      tileId: `t-${idx}-${s.letters}`,
      letters: s.letters,
      soundHint: s.soundHint,
    })),
    ...distractors.map((d, idx) => ({
      tileId: `d-${idx}-${d.letters}`,
      letters: d.letters,
      soundHint: d.soundHint,
    })),
  ];

  // Deterministic Fisher-Yates shuffle
  let s = seed + 31;
  for (let i = combined.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  state.buildTray = combined;
}

export interface PhonicsSpeechController {
  clearSpeechAndTimers: () => void;
  speak: (
    text: string,
    opts?: { subtitle?: string; bslWord?: string; rate?: number; onEnd?: () => void }
  ) => void;
  speakPurePhoneme: (grapheme: string, soundHint?: string, displayLabel?: string) => void;
  speakSequence: (
    items: Array<{ spoken: string; subtitle?: string; rate?: number; onStart?: () => void }>,
    gapMs: number,
    onAllDone?: () => void
  ) => void;
}

function selectBritishVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  try {
    const voices = typeof synth.getVoices === 'function' ? synth.getVoices() : [];
    if (!voices.length) return null;
    return (
      voices.find((v) => v.lang && v.lang.toLowerCase() === 'en-gb') ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) ||
      null
    );
  } catch {
    return null;
  }
}

export function createPhonicsSpeechController(): PhonicsSpeechController {
  let speechRunId = 0;
  let activeTimers: number[] = [];
  let activeUtterance: SpeechSynthesisUtterance | null = null;

  function clearSpeechAndTimers(): void {
    speechRunId += 1;
    for (const id of activeTimers) {
      window.clearTimeout(id);
    }
    activeTimers = [];
    activeUtterance = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // ignore synthesis cancel errors
      }
    }
    broadcastBslSpeech({ isSpeaking: false });
  }

  function scheduleTimeout(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      activeTimers = activeTimers.filter((t) => t !== id);
      fn();
    }, ms);
    activeTimers.push(id);
  }

  function speak(
    text: string,
    opts: { subtitle?: string; bslWord?: string; rate?: number; onEnd?: () => void } = {}
  ): void {
    unlockSoundEngine();
    clearSpeechAndTimers();
    const runId = speechRunId;
    const rate = opts.rate ?? 0.84;

    broadcastBslSpeech({
      word: opts.bslWord,
      subtitle: opts.subtitle ?? text,
      isSpeaking: true,
    });

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        const synth = window.speechSynthesis;
        if (synth.paused && typeof synth.resume === 'function') {
          synth.resume();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB';
        utterance.rate = rate;
        const voice = selectBritishVoice(synth);
        if (voice) utterance.voice = voice;

        // Retain strong reference so mobile WebKit/Chromium cannot GC the utterance mid-speech
        activeUtterance = utterance;
        utterance.onend = () => {
          if (activeUtterance === utterance) activeUtterance = null;
          if (speechRunId !== runId) return;
          broadcastBslSpeech({ isSpeaking: false });
          opts.onEnd?.();
        };
        utterance.onerror = () => {
          if (activeUtterance === utterance) activeUtterance = null;
          if (speechRunId !== runId) return;
          broadcastBslSpeech({ isSpeaking: false });
          opts.onEnd?.();
        };
        synth.speak(utterance);
        return;
      } catch {
        // fall through to timer fallback
      }
    }
    scheduleTimeout(() => {
      if (speechRunId !== runId) return;
      broadcastBslSpeech({ isSpeaking: false });
      opts.onEnd?.();
    }, 600);
  }

  function speakPurePhoneme(grapheme: string, soundHint?: string, displayLabel?: string): void {
    const pure = getPhonemeSpokenText(grapheme, soundHint);
    speak(pure, {
      subtitle: `/${displayLabel || grapheme}/`,
      bslWord: grapheme.length === 1 ? grapheme : undefined,
      rate: 0.78,
    });
  }

  function speakSequence(
    items: Array<{ spoken: string; subtitle?: string; rate?: number; onStart?: () => void }>,
    gapMs: number,
    onAllDone?: () => void
  ): void {
    unlockSoundEngine();
    clearSpeechAndTimers();
    const runId = speechRunId;

    const runStep = (idx: number) => {
      if (speechRunId !== runId) return;
      if (idx >= items.length) {
        activeUtterance = null;
        broadcastBslSpeech({ isSpeaking: false });
        onAllDone?.();
        return;
      }
      const item = items[idx];
      item.onStart?.();
      broadcastBslSpeech({
        subtitle: item.subtitle ?? item.spoken,
        isSpeaking: true,
      });

      const next = () => {
        if (speechRunId !== runId) return;
        scheduleTimeout(() => runStep(idx + 1), gapMs);
      };

      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        try {
          const synth = window.speechSynthesis;
          if (synth.paused && typeof synth.resume === 'function') {
            synth.resume();
          }
          const u = new SpeechSynthesisUtterance(item.spoken);
          u.lang = 'en-GB';
          u.rate = item.rate ?? 0.8;
          const voice = selectBritishVoice(synth);
          if (voice) u.voice = voice;

          activeUtterance = u;
          let finished = false;
          const finishOnce = () => {
            if (finished) return;
            finished = true;
            if (activeUtterance === u) activeUtterance = null;
            next();
          };
          u.onend = finishOnce;
          u.onerror = finishOnce;
          synth.speak(u);
          // Safety timer in case headless/mobile browser drops onend
          scheduleTimeout(finishOnce, 2200);
          return;
        } catch {
          // fallback below
        }
      }
      scheduleTimeout(next, 550);
    };

    runStep(0);
  }

  return {
    clearSpeechAndTimers,
    speak,
    speakPurePhoneme,
    speakSequence,
  };
}
