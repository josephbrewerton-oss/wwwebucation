// src/pages/phonics-suite.ts
/**
 * Learn to Read Studio — 6-Stage Non-Reader to Fluent Reader Progression
 *
 * 100% offline, zero-React, audio-guided Systematic Synthetic Phonics (SSP) studio:
 *   Stage 0: Ear & Picture Warm-Up (Phase 1 phonemic awareness, rhyme, oral blending)
 *   Stage 1: Pure Sounds (Cumulative DfE Sets 1-5, Phase 3 digraphs/trigraphs, Phase 5)
 *   Stage 2: Blend Words (Interactive DfE sound buttons • / — / split-digraph + animated blend)
 *   Stage 3: Build Words (Elkonin sound boxes encoding/spelling studio)
 *   Stage 4: Tricky "Heart" Words (Heart-part spotlight + contextual sentences)
 *   Stage 5: Decodable Mini-Books (5 progressive illustrated books with tap-any-word decoder)
 *   Check:   Year 1 Phonics Screening Check (Real & Alien word practice)
 */

import { getBaseUrl } from '../utils/url';
import {
  PHONICS_GRAPHEMES,
  TRICKY_WORDS,
  OFFICIAL_SCREENING_POOL,
  getPhonemeSpokenText,
  type PhonicGrapheme,
  type SoundSegment,
  type DecodableWord,
  type TrickyWord,
} from '../data/phonicsCurriculumData';
import {
  PRE_READER_GAMES,
  CUMULATIVE_SOUND_GROUPS,
  ALL_DECODABLE_WORDS,
  DECODABLE_MINI_BOOKS,
  type PreReaderMode,
} from '../data/earlyReaderLadderData';
import { broadcastBslSpeech } from '../services/bslGlobalStore';
import { getLocalJson, setLocalJson } from '../services/localStateStore';
import {
  playSuccessChime,
  playIncorrectTone,
  playClickTone,
  playCelebrationFanfare,
  triggerHapticSuccess,
  triggerHapticError,
  triggerHapticClick,
  unlockSoundEngine,
} from '../services/soundHaptics';

type StudioStage =
  | 'ear-warmup'
  | 'pure-sounds'
  | 'blend-words'
  | 'build-words'
  | 'tricky-words'
  | 'mini-books'
  | 'screening';

interface ReaderProgress {
  earStars: string[];
  soundsHeard: string[];
  wordsBlended: string[];
  wordsBuilt: string[];
  trickyKnown: string[];
  booksCompleted: string[];
}

const PROGRESS_STORAGE_KEY = 'stj_early_reader_progress';

function loadProgress(): ReaderProgress {
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

function saveProgress(progress: ReaderProgress): void {
  setLocalJson(PROGRESS_STORAGE_KEY, progress);
}

function esc(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderPhonicsPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'phonics-suite-stage max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16 text-slate-900 dark:text-slate-100';

  const progress: ReaderProgress = loadProgress();

  // Global studio state
  let activeStage: StudioStage = 'ear-warmup';
  let speechRunId = 0;
  let activeTimers: number[] = [];

  // Stage 0: Ear Warm-Up state
  let earFilter: 'all' | PreReaderMode = 'all';
  let earIndex = 0;
  let earShowLabels = false;
  let earStatus: 'idle' | 'correct' | 'retry' = 'idle';
  let earChosenLabel = '';

  // Stage 1: Pure Sounds state
  let activeSoundGroupId = CUMULATIVE_SOUND_GROUPS[0].id;
  let selectedGraphemeId = PHONICS_GRAPHEMES[0].id;

  // Stage 2: Blend Words state
  let blendPhaseFilter: 'starter' | 2 | 3 | 4 | 5 = 'starter';
  let blendWordIndex = 0;
  let blendHighlightIdx = -1;
  let blendPictureRevealed = false;
  let blendHidePictureFirst = true;

  // Stage 3: Build Words (Elkonin Boxes) state
  let buildPhaseFilter: 'starter' | 2 | 3 | 4 | 5 = 'starter';
  let buildWordIndex = 0;
  let buildSlots: Array<{ tileId: string; letters: string; soundHint: string } | null> = [];
  let buildTray: Array<{ tileId: string; letters: string; soundHint: string }> = [];
  let buildStatus: 'idle' | 'correct' | 'wrong' = 'idle';
  let buildHintText = '';

  // Stage 4: Tricky Words state
  let trickyPhaseFilter: 'all' | 2 | 3 | 4 | 5 = 2;
  let selectedTrickyId = TRICKY_WORDS[0].id;

  // Stage 5: Mini-Books (AST Vector Player Cartridges) state
  let openBookId: string | null = null;
  let bookQuizMode = false;
  let bookQuizAnswers: Record<string, boolean> = {};

  // Bonus: Year 1 Screening Check state
  let screeningIndex = 0;
  let screeningShowButtons = true;
  let screeningHighlightIdx = -1;
  let screeningScores: Record<string, 'pass' | 'retry'> = {};

  let activeUtterance: SpeechSynthesisUtterance | null = null;

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

  function recordProgress(bucket: keyof ReaderProgress, id: string): void {
    if (!progress[bucket].includes(id)) {
      progress[bucket].push(id);
      saveProgress(progress);
    }
  }

  function totalStars(): number {
    return (
      progress.earStars.length +
      progress.wordsBlended.length +
      progress.wordsBuilt.length +
      progress.trickyKnown.length +
      progress.booksCompleted.length * 3
    );
  }

  // Helper: get filtered decodable words for Stages 2 & 3
  function getWordsForFilter(filter: 'starter' | 2 | 3 | 4 | 5): DecodableWord[] {
    if (filter === 'starter') {
      return ALL_DECODABLE_WORDS.filter((w) => w.category === 'SATPIN Starter');
    }
    return ALL_DECODABLE_WORDS.filter((w) => w.phase === filter);
  }

  // Initialize Elkonin Word Builder puzzle for current word
  function initBuildPuzzle(): void {
    const words = getWordsForFilter(buildPhaseFilter);
    const word = words[buildWordIndex % Math.max(1, words.length)];
    if (!word) return;

    buildSlots = word.segments.map(() => null);
    buildStatus = 'idle';
    buildHintText = '';

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

    const combined = [
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
    buildTray = combined;
  }

  initBuildPuzzle();

  // Sound button visual glyph (DfE dot / bar / split-digraph arc)
  function renderSoundButtonGlyph(seg: SoundSegment, active: boolean): string {
    const color = active
      ? 'bg-sky-600 dark:bg-sky-400'
      : 'bg-slate-800 dark:bg-slate-200';
    if (seg.type === 'single') {
      return `<span class="inline-block w-3 h-3 rounded-full ${color} transition-transform ${active ? 'scale-125' : ''}" aria-hidden="true"></span>`;
    }
    if (seg.type === 'split') {
      return `<span class="inline-flex items-center gap-1 text-xs font-bold ${active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'}" aria-hidden="true">⌒ split</span>`;
    }
    const width = seg.type === 'trigraph' ? 'w-12' : 'w-9';
    return `<span class="inline-block ${width} h-2 rounded-full ${color} transition-transform ${active ? 'scale-110' : ''}" aria-hidden="true"></span>`;
  }

  // Highlight tricky part inside a tricky word
  function renderTrickyWordMarkup(tw: TrickyWord): string {
    const lowerWord = tw.word.toLowerCase();
    const lowerPart = tw.trickyPart.toLowerCase();
    const idx = lowerWord.indexOf(lowerPart);
    if (idx === -1) {
      return `<span class="text-rose-600 dark:text-rose-400 underline decoration-2 underline-offset-4">${esc(tw.word)}</span>`;
    }
    const before = tw.word.slice(0, idx);
    const match = tw.word.slice(idx, idx + tw.trickyPart.length);
    const after = tw.word.slice(idx + tw.trickyPart.length);
    return `${esc(before)}<span class="inline-flex flex-col items-center align-baseline mx-0.5"><span class="text-[0.65rem] leading-none text-rose-500 select-none" aria-hidden="true">♥</span><span class="text-rose-600 dark:text-rose-400 underline decoration-rose-400 decoration-2 underline-offset-4">${esc(match)}</span></span>${esc(after)}`;
  }

  // =========================================================================
  // STAGE RENDERERS
  // =========================================================================

  function renderStage0EarWarmUp(): string {
    const filtered =
      earFilter === 'all'
        ? PRE_READER_GAMES
        : PRE_READER_GAMES.filter((g) => g.mode === earFilter);
    const prompt = filtered[earIndex % filtered.length] || PRE_READER_GAMES[0];
    const safeIdx = earIndex % filtered.length;

    return `
      <section aria-label="Stage 0: Ear and Picture Warm-Up" class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Stage 0. Ear &amp; Picture Warm-Up</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Zero reading needed. Tap the big speaker, listen to the sound, and pick the matching picture.
            </p>
          </div>
          <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            ${(
              [
                ['all', 'All Games'],
                ['initial-sound', 'First Sound'],
                ['rhyme', 'Rhyme Time'],
                ['oral-blend', 'Robot Talk'],
              ] as const
            )
              .map(
                ([key, label]) => `
                <button type="button" data-ear-filter="${key}" class="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  earFilter === key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }">${label}</button>
              `
              )
              .join('')}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              <span class="font-semibold text-sky-700 dark:text-sky-400">${esc(prompt.badge)}</span>
              <span aria-hidden="true">·</span>
              <span>Activity ${safeIdx + 1} of ${filtered.length}</span>
              <span aria-hidden="true">·</span>
              <span>${progress.earStars.length} stars earned</span>
            </div>
            <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" id="ear-toggle-labels" ${earShowLabels ? 'checked' : ''} class="w-4 h-4 accent-sky-600 rounded" />
              <span>Show word labels</span>
            </label>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5">
            <div class="text-center sm:text-left">
              <div class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">${esc(prompt.displayCue)}</div>
              <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-1">${esc(prompt.spokenPrompt)}</p>
            </div>
            <button
              type="button"
              id="ear-play-prompt-btn"
              class="px-6 py-3.5 min-h-[52px] rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-bold text-base transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">
              🔊 Listen
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            ${prompt.options
              .map((opt) => {
                const isSelected = earChosenLabel === opt.label;
                let stateClass =
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/30';
                if (earStatus === 'correct' && opt.isCorrect) {
                  stateClass =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30';
                } else if (earStatus === 'retry' && isSelected && !opt.isCorrect) {
                  stateClass = 'border-amber-400 bg-amber-50 dark:bg-amber-950/30';
                }
                return `
                  <button
                    type="button"
                    data-ear-option="${esc(opt.label)}"
                    data-ear-correct="${opt.isCorrect ? 'true' : 'false'}"
                    class="flex flex-col items-center justify-center gap-3 min-h-[164px] p-6 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${stateClass}">
                    <span class="text-6xl leading-none select-none" aria-hidden="true">${opt.icon}</span>
                    <span class="text-base font-bold text-slate-800 dark:text-slate-100 ${earShowLabels || (earStatus === 'correct' && opt.isCorrect) ? '' : 'sr-only'}">${esc(opt.label)}</span>
                    ${
                      earStatus === 'correct' && opt.isCorrect
                        ? `<span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">✓ Correct!</span>`
                        : ''
                    }
                  </button>
                `;
              })
              .join('')}
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div class="text-sm font-semibold ${
              earStatus === 'correct'
                ? 'text-emerald-700 dark:text-emerald-400'
                : earStatus === 'retry'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
            }">
              ${
                earStatus === 'correct'
                  ? `★ ${esc(prompt.successPraise)}`
                  : earStatus === 'retry'
                    ? 'Good try — tap Listen and have another go!'
                    : 'Tap Listen above, then tap the matching picture.'
              }
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="ear-prev-btn" class="px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap">
                Previous
              </button>
              <button type="button" id="ear-next-btn" class="px-5 py-2.5 min-h-[44px] rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 cursor-pointer whitespace-nowrap">
                Next Activity &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderStage1PureSounds(): string {
    const activeGroup =
      CUMULATIVE_SOUND_GROUPS.find((g) => g.id === activeSoundGroupId) ||
      CUMULATIVE_SOUND_GROUPS[0];
    const groupGraphemes: PhonicGrapheme[] = activeGroup.graphemes
      .map((gr) => PHONICS_GRAPHEMES.find((p) => p.grapheme === gr))
      .filter((x): x is PhonicGrapheme => Boolean(x));

    const selected =
      groupGraphemes.find((g) => g.id === selectedGraphemeId) ||
      groupGraphemes[0] ||
      PHONICS_GRAPHEMES[0];
    selectedGraphemeId = selected.id;

    return `
      <section aria-label="Stage 1: Learn Pure Sounds" class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Stage 1. Learn Pure Sounds (Step by Step)</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Start with Set 1 (s, a, t, p). Always use pure phonics sounds ("ssss", "tuh") instead of alphabet letter names.
          </p>
        </div>

        <!-- Cumulative Set Selector -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
          ${CUMULATIVE_SOUND_GROUPS.map(
            (grp) => `
              <button
                type="button"
                data-sound-group="${grp.id}"
                class="px-3.5 py-2 min-h-[42px] rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  grp.id === activeGroup.id
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-400'
                }">
                ${esc(grp.title)}
              </button>
            `
          ).join('')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left: Interactive Sound Tiles -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div class="text-sm font-bold text-slate-900 dark:text-white">${esc(activeGroup.title)}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">${esc(activeGroup.unlocksHint)}</div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${groupGraphemes
                .map((g) => {
                  const isSel = g.id === selected.id;
                  const heard = progress.soundsHeard.includes(g.id);
                  const segType: SoundSegment['type'] =
                    g.type === 'split-digraph'
                      ? 'split'
                      : g.type === 'trigraph'
                        ? 'trigraph'
                        : g.type === 'digraph'
                          ? 'digraph'
                          : 'single';
                  return `
                    <button
                      type="button"
                      data-grapheme-id="${g.id}"
                      class="flex flex-col items-center justify-center gap-2 min-h-[112px] p-4 rounded-xl border-2 transition-all active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                        isSel
                          ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-sky-400'
                      }">
                      <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">${esc(g.grapheme.replace(' (short)', '').replace(' (long)', ''))}</span>
                      ${renderSoundButtonGlyph({ letters: g.grapheme, type: segType, soundHint: g.soundAudioText }, isSel)}
                      <span class="text-xs text-slate-500 dark:text-slate-400">${g.exampleIcon} ${esc(g.exampleWord)}${heard ? ' · ✓' : ''}</span>
                    </button>
                  `;
                })
                .join('')}
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Legend: ● single sound · ━━ digraph / trigraph · ⌒ split digraph</span>
              <button type="button" id="stage1-goto-blend" class="text-sky-700 dark:text-sky-400 font-bold hover:underline cursor-pointer">
                Ready to blend these into words? Go to Stage 2 &rarr;
              </button>
            </div>
          </div>

          <!-- Right: Phoneme Spotlight & Mouth Guide -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Phase ${selected.phase} · ${esc(selected.set)} · ${esc(selected.phonemeIPA)}
                </div>
                <div class="text-5xl font-extrabold text-sky-700 dark:text-sky-400 mt-1 tracking-tight">
                  ${esc(selected.grapheme)}
                </div>
              </div>
              <div class="text-center">
                <div class="text-5xl leading-none select-none" aria-hidden="true">${selected.exampleIcon}</div>
                <div class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">${esc(selected.exampleWord)}</div>
              </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
              <div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mouth Position Tip</div>
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${esc(selected.mouthTip)}</p>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                id="spotlight-play-pure"
                class="flex-1 px-4 py-3 min-h-[48px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer transition-colors whitespace-nowrap">
                🔊 Hear Pure Sound
              </button>
              <button
                type="button"
                id="spotlight-play-word"
                class="flex-1 px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm cursor-pointer transition-colors whitespace-nowrap">
                🔊 Hear in "${esc(selected.exampleWord)}"
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderStage2BlendWords(): string {
    const words = getWordsForFilter(blendPhaseFilter);
    const word = words[blendWordIndex % Math.max(1, words.length)] || ALL_DECODABLE_WORDS[0];
    const safeIdx = blendWordIndex % Math.max(1, words.length);
    const isBlendedBefore = progress.wordsBlended.includes(word.word);
    const showPic = !blendHidePictureFirst || blendPictureRevealed;

    return `
      <section aria-label="Stage 2: Sound-Button Blending Mat" class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Stage 2. Sound-Button Blending Mat</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Tap each sound button left-to-right, then press Blend Word to slide the pure sounds together.
            </p>
          </div>
          <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            ${(
              [
                ['starter', 'SATPIN Starter'],
                [2, 'Phase 2'],
                [3, 'Phase 3'],
                [4, 'Phase 4'],
                [5, 'Phase 5'],
              ] as const
            )
              .map(
                ([key, label]) => `
                <button type="button" data-blend-phase="${key}" class="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  blendPhaseFilter === key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }">${label}</button>
              `
              )
              .join('')}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              <span>${esc(word.category)}</span>
              <span aria-hidden="true">·</span>
              <span>Word ${safeIdx + 1} of ${words.length}</span>
              ${isBlendedBefore ? `<span aria-hidden="true">·</span><span class="text-emerald-700 dark:text-emerald-400 font-semibold">★ Blended</span>` : ''}
            </div>
            <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" id="blend-hide-pic-toggle" ${blendHidePictureFirst ? 'checked' : ''} class="w-4 h-4 accent-sky-600 rounded" />
              <span>Hide picture until blended (prevents guessing)</span>
            </label>
          </div>

          <!-- Blending Stage -->
          <div class="flex flex-col items-center justify-center gap-6 py-4">
            <!-- Sound Button Tiles -->
            <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              ${word.segments
                .map((seg, idx) => {
                  const isActive = blendHighlightIdx === idx;
                  return `
                    <button
                      type="button"
                      data-blend-seg="${idx}"
                      class="flex flex-col items-center justify-center gap-3 min-w-[78px] sm:min-w-[96px] min-h-[112px] px-4 py-4 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                        isActive
                          ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 -translate-y-1 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-sky-400'
                      }">
                      <span class="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">${esc(seg.letters)}</span>
                      ${renderSoundButtonGlyph(seg, isActive)}
                    </button>
                  `;
                })
                .join('')}
            </div>

            <!-- Picture Reveal Box -->
            <div class="min-h-[84px] flex items-center justify-center">
              ${
                showPic
                  ? `<div class="flex items-center gap-4 px-6 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span class="text-5xl leading-none" aria-hidden="true">${word.icon || '📖'}</span>
                      <div>
                        <div class="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">${esc(word.word)}</div>
                        <div class="text-xs font-medium text-emerald-700 dark:text-emerald-400">${word.segments.length} sounds blended</div>
                      </div>
                    </div>`
                  : `<div class="text-sm text-slate-500 dark:text-slate-400">
                      Tap each sound button, then press <strong>Blend Word</strong> to reveal the picture.
                    </div>`
              }
            </div>

            <!-- Controls -->
            <div class="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                id="blend-animate-btn"
                class="px-7 py-3.5 min-h-[52px] rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-bold text-base transition-all cursor-pointer shadow-sm whitespace-nowrap">
                🌊 Blend Word
              </button>
              <button
                type="button"
                id="blend-say-whole-btn"
                class="px-5 py-3.5 min-h-[52px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm cursor-pointer whitespace-nowrap">
                🔊 Say Whole Word
              </button>
              <button
                type="button"
                id="blend-next-btn"
                class="px-5 py-3.5 min-h-[52px] rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 cursor-pointer whitespace-nowrap">
                Next Word &rarr;
              </button>
            </div>
          </div>

          <!-- Quick Word Picker Strip -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Pick a word in this level:</div>
            <div class="flex flex-wrap gap-2">
              ${words
                .map(
                  (w, idx) => `
                  <button
                    type="button"
                    data-blend-pick="${idx}"
                    class="px-3.5 py-2 min-h-[40px] rounded-lg text-sm font-bold border transition-colors cursor-pointer ${
                      idx === safeIdx
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-400'
                    }">
                    ${esc(w.word)}${progress.wordsBlended.includes(w.word) ? ' ★' : ''}
                  </button>
                `
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderStage3BuildWords(): string {
    const words = getWordsForFilter(buildPhaseFilter);
    const word = words[buildWordIndex % Math.max(1, words.length)] || ALL_DECODABLE_WORDS[0];
    const safeIdx = buildWordIndex % Math.max(1, words.length);
    const usedTileIds = new Set(buildSlots.filter(Boolean).map((s) => s!.tileId));

    return `
      <section aria-label="Stage 3: Elkonin Sound Boxes Word Builder" class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Stage 3. Build Words (Sound Boxes)</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Hear the word, listen for each sound in order, and tap tiles to fill the boxes left-to-right.
            </p>
          </div>
          <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            ${(
              [
                ['starter', 'SATPIN Starter'],
                [2, 'Phase 2'],
                [3, 'Phase 3'],
                [4, 'Phase 4'],
                [5, 'Phase 5'],
              ] as const
            )
              .map(
                ([key, label]) => `
                <button type="button" data-build-phase="${key}" class="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  buildPhaseFilter === key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }">${label}</button>
              `
              )
              .join('')}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              <span>${esc(word.category)}</span>
              <span aria-hidden="true">·</span>
              <span>Puzzle ${safeIdx + 1} of ${words.length}</span>
              <span aria-hidden="true">·</span>
              <span>${word.segments.length} sound boxes</span>
            </div>
            <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums">★ ${progress.wordsBuilt.length} words built</span>
          </div>

          <!-- Picture & Audio Prompt -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5">
            <span class="text-6xl leading-none select-none" aria-hidden="true">${word.icon || '🔤'}</span>
            <div class="text-center sm:text-left">
              <div class="text-sm font-semibold text-slate-600 dark:text-slate-300">Tap Hear Word and spell what you hear:</div>
              <div class="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <button
                  type="button"
                  id="build-hear-word-btn"
                  class="px-5 py-2.5 min-h-[46px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                  🔊 Hear Word
                </button>
                <button
                  type="button"
                  id="build-hint-btn"
                  class="px-4 py-2.5 min-h-[46px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap">
                  💡 Sound Hint
                </button>
              </div>
            </div>
          </div>

          <!-- Elkonin Sound Boxes -->
          <div class="flex flex-wrap items-center justify-center gap-3 py-2">
            ${buildSlots
              .map((slot, idx) => {
                const boxState =
                  buildStatus === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : buildStatus === 'wrong'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-white'
                      : slot
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white'
                        : 'border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 text-slate-400';
                return `
                  <button
                    type="button"
                    data-build-slot="${idx}"
                    aria-label="Sound box ${idx + 1}: ${slot ? slot.letters : 'empty'}"
                    class="flex flex-col items-center justify-center min-w-[78px] sm:min-w-[92px] min-h-[96px] px-3 rounded-2xl border-2 transition-all cursor-pointer ${boxState}">
                    <span class="text-3xl sm:text-4xl font-extrabold leading-none">${slot ? esc(slot.letters) : '?'}</span>
                    <span class="text-[0.7rem] font-semibold mt-2 opacity-70">${slot ? 'tap to clear' : `sound ${idx + 1}`}</span>
                  </button>
                `;
              })
              .join('')}
          </div>

          <!-- Feedback Line -->
          <div class="text-center min-h-[28px]">
            ${
              buildStatus === 'correct'
                ? `<div class="text-base font-bold text-emerald-700 dark:text-emerald-400">✓ Brilliant spelling! You built "${esc(word.word)}"!</div>`
                : buildStatus === 'wrong'
                  ? `<div class="text-sm font-semibold text-amber-700 dark:text-amber-400">Almost! Listen to each sound again, or tap a box to change it.</div>`
                  : buildHintText
                    ? `<div class="text-sm font-semibold text-sky-700 dark:text-sky-400">${esc(buildHintText)}</div>`
                    : `<div class="text-xs text-slate-500 dark:text-slate-400">Tap sound tiles below to place them in the boxes.</div>`
            }
          </div>

          <!-- Shuffled Sound Tile Tray -->
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            ${buildTray
              .map((tile) => {
                const used = usedTileIds.has(tile.tileId);
                return `
                  <button
                    type="button"
                    data-build-tile="${esc(tile.tileId)}"
                    ${used ? 'disabled' : ''}
                    class="min-w-[68px] min-h-[60px] px-4 py-2.5 rounded-xl border-2 text-2xl font-extrabold transition-all cursor-pointer ${
                      used
                        ? 'opacity-30 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-sky-500 active:scale-95 shadow-sm'
                    }">
                    ${esc(tile.letters)}
                  </button>
                `;
              })
              .join('')}
          </div>

          <!-- Action Row -->
          <div class="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" id="build-check-btn" class="px-6 py-3 min-h-[48px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
              ✓ Check My Word
            </button>
            <button type="button" id="build-clear-btn" class="px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap">
              Clear Boxes
            </button>
            <button type="button" id="build-next-btn" class="px-5 py-3 min-h-[48px] rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 cursor-pointer whitespace-nowrap">
              Next Word &rarr;
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function renderStage4TrickyWords(): string {
    const filtered =
      trickyPhaseFilter === 'all'
        ? TRICKY_WORDS
        : TRICKY_WORDS.filter((tw) => tw.phase === trickyPhaseFilter);
    const selected =
      filtered.find((tw) => tw.id === selectedTrickyId) || filtered[0] || TRICKY_WORDS[0];
    selectedTrickyId = selected.id;
    const isKnown = progress.trickyKnown.includes(selected.id);

    return `
      <section aria-label="Stage 4: Tricky Heart Words" class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Stage 4. Tricky "Heart" Words</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Common English words with one tricky part (marked with ♥) that we learn by heart.
            </p>
          </div>
          <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            ${(['all', 2, 3, 4, 5] as const)
              .map(
                (ph) => `
                <button type="button" data-tricky-phase="${ph}" class="px-3 py-2 min-h-[40px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  trickyPhaseFilter === ph
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }">${ph === 'all' ? 'All' : `Phase ${ph}`}</button>
              `
              )
              .join('')}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left: Heart Word Tiles -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>Tap any word to hear it and see its tricky heart part</span>
              <span class="tabular-nums font-semibold text-rose-600 dark:text-rose-400">♥ ${progress.trickyKnown.length} / ${TRICKY_WORDS.length} known</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              ${filtered
                .map((tw) => {
                  const sel = tw.id === selected.id;
                  const known = progress.trickyKnown.includes(tw.id);
                  return `
                    <button
                      type="button"
                      data-tricky-id="${tw.id}"
                      class="flex flex-col items-center justify-center min-h-[68px] px-3 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                        sel
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white hover:border-rose-400'
                      }">
                      <span class="text-xl font-extrabold">${esc(tw.word)}</span>
                      <span class="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5">${known ? '✓ Known' : `Phase ${tw.phase}`}</span>
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>

          <!-- Right: Heart Word Spotlight -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div class="text-center py-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Phase ${selected.phase} Tricky Word · Tricky part: "${esc(selected.trickyPart)}"
              </div>
              <div class="text-5xl font-extrabold tracking-wide text-slate-900 dark:text-white">
                ${renderTrickyWordMarkup(selected)}
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <div class="text-xs font-bold text-slate-700 dark:text-slate-300">Why is it tricky?</div>
                <p class="text-sm text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">${esc(selected.trickyExplanation)}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">In a sentence</div>
                <p class="text-base font-semibold text-slate-900 dark:text-white">"${esc(selected.exampleSentence)}"</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2.5">
              <button type="button" id="tricky-hear-word" class="flex-1 px-4 py-3 min-h-[48px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                🔊 Hear Word
              </button>
              <button type="button" id="tricky-hear-sentence" class="flex-1 px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap">
                🔊 Hear Sentence
              </button>
            </div>
            <button
              type="button"
              id="tricky-mark-known"
              class="w-full px-4 py-3 min-h-[46px] rounded-xl border font-bold text-sm transition-colors cursor-pointer ${
                isKnown
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }">
              ${isKnown ? '✓ I Know This Tricky Word' : '♥ Mark as Known (+1 Star)'}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function renderStage5MiniBooks(): string {
    // Book Shelf View — launches native AST Vector Player storybook cartridges
    if (!openBookId) {
      return `
        <section aria-label="Stage 5: Decodable Vector Mini-Books" class="space-y-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Stage 5. Illustrated Decodable Mini-Books (Vector Player)</h2>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Every book is a native AST Vector Player cartridge with custom illustrations, toggleable DfE sound buttons, tap-any-word sound-out, smartboard ink, and BSL signing.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${DECODABLE_MINI_BOOKS.map((book) => {
              const completed = progress.booksCompleted.includes(book.id);
              return `
                <article class="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span class="font-semibold text-sky-700 dark:text-sky-400">${esc(book.levelLabel)}</span>
                      <span>${completed ? '★ Finished' : `${book.pages.length} illustrated spreads`}</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl shrink-0" aria-hidden="true">
                        ${book.coverEmoji}
                      </div>
                      <div>
                        <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">${esc(book.title)}</h3>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">${esc(book.subtitle)}</p>
                      </div>
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span class="font-semibold text-slate-700 dark:text-slate-300">Focus sounds:</span> ${esc(book.targetSounds.join(' · '))}
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <a
                      href="${base}player?preset=${encodeURIComponent(book.cartridgeId)}"
                      class="w-full px-4 py-3 min-h-[46px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <span>📖 Open in Vector Player</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                    <button
                      type="button"
                      data-open-book="${book.id}"
                      class="w-full px-4 py-2.5 min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap">
                      ▶ Read Right Here &amp; Take Story Check
                    </button>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }

    // Active Book View — live embedded AST Vector Player + Picture Comprehension Check
    const book = DECODABLE_MINI_BOOKS.find((b) => b.id === openBookId) || DECODABLE_MINI_BOOKS[0];

    if (bookQuizMode) {
      const allCorrect = book.quiz.every((q) => bookQuizAnswers[q.id] === true);
      return `
        <section aria-label="Story Comprehension Check" class="space-y-6">
          <div class="flex items-center justify-between gap-3">
            <button type="button" id="book-back-to-pages" class="px-4 py-2 min-h-[42px] rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              &larr; Back to Book Player
            </button>
            <div class="text-xs font-medium text-slate-500 dark:text-slate-400">${esc(book.title)} · Story Check</div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Did you understand "${esc(book.title)}"?</h2>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Tap the speaker to hear each question, then tap the right picture.</p>
            </div>

            <div class="space-y-6">
              ${book.quiz
                .map((q, qIdx) => {
                  const answeredCorrect = bookQuizAnswers[q.id] === true;
                  return `
                    <div class="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-4">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="text-base font-bold text-slate-900 dark:text-white">${qIdx + 1}. ${esc(q.question)}</div>
                        <button type="button" data-quiz-speak="${esc(q.question)}" class="px-3 py-1.5 min-h-[38px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-sky-700 dark:text-sky-400 cursor-pointer">
                          🔊 Hear Question
                        </button>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        ${q.options
                          .map((opt) => {
                            const showWin = answeredCorrect && opt.isCorrect;
                            return `
                              <button
                                type="button"
                                data-quiz-qid="${q.id}"
                                data-quiz-correct="${opt.isCorrect ? 'true' : 'false'}"
                                class="flex items-center gap-3 p-4 min-h-[68px] rounded-xl border-2 text-left transition-all cursor-pointer ${
                                  showWin
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-400'
                                }">
                                <span class="text-3xl leading-none shrink-0" aria-hidden="true">${opt.icon}</span>
                                <span class="text-sm font-bold text-slate-900 dark:text-white">${esc(opt.label)}</span>
                              </button>
                            `;
                          })
                          .join('')}
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>

            ${
              allCorrect
                ? `<div class="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div class="text-lg font-extrabold text-emerald-900 dark:text-emerald-200">★ Reader Star Unlocked!</div>
                      <p class="text-sm text-emerald-800 dark:text-emerald-300">You read and understood "${esc(book.title)}" all by yourself!</p>
                    </div>
                    <button type="button" id="book-finish-to-shelf" class="px-5 py-3 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                      Back to Book Shelf &rarr;
                    </button>
                  </div>`
                : ''
            }
          </div>
        </section>
      `;
    }

    return `
      <section aria-label="Vector Player Storybook: ${esc(book.title)}" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button type="button" id="book-back-shelf" class="px-4 py-2 min-h-[42px] rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap">
              &larr; Book Shelf
            </button>
            <div>
              <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">${esc(book.title)}</h2>
              <div class="text-xs text-slate-500 dark:text-slate-400">${esc(book.levelLabel)} · AST Vector Storybook Cartridge</div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" id="book-open-quiz" class="px-4 py-2.5 min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer whitespace-nowrap">
              ★ Story Comprehension Check
            </button>
            <a
              href="${base}player?preset=${encodeURIComponent(book.cartridgeId)}"
              class="px-4 py-2.5 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>Open Fullscreen in Player</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        <div class="bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <iframe
            src="${base}player.html?preset=${encodeURIComponent(book.cartridgeId)}"
            title="${esc(book.title)} — Interactive Vector Storybook"
            class="w-full block border-0"
            style="aspect-ratio: 16 / 10; min-height: 460px;"
            allowfullscreen></iframe>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Tip: Tap any word inside the book to see its phoneme breakdown and press <strong>Sound Out</strong>. Use <strong>Open Fullscreen in Player</strong> for Smartboard stylus ink, BSL signing, and classroom P2P sync.
        </p>
      </section>
    `;
  }

  function renderScreeningCheck(): string {
    const item = OFFICIAL_SCREENING_POOL[screeningIndex % OFFICIAL_SCREENING_POOL.length];
    const safeIdx = screeningIndex % OFFICIAL_SCREENING_POOL.length;
    const passedCount = Object.values(screeningScores).filter((v) => v === 'pass').length;
    const attemptedCount = Object.keys(screeningScores).length;

    return `
      <section aria-label="Year 1 Phonics Screening Check Practice" class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Year 1 Phonics Screening Check</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Practise decoding both real words and alien pseudo-words using pure phonics (40 statutory items).
            </p>
          </div>
          <div class="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
            Section ${item.section} · Card ${safeIdx + 1} of ${OFFICIAL_SCREENING_POOL.length} · Score ${passedCount}/${attemptedCount}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="text-sm font-bold ${item.isAlien ? 'text-indigo-700 dark:text-indigo-300' : 'text-emerald-700 dark:text-emerald-300'}">
              ${item.isAlien ? `${item.alienAvatar || '👾'} Alien Word (${esc(item.alienName || 'Pseudo-word')})` : '📖 Real English Word'}
            </div>
            <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" id="screen-toggle-buttons" ${screeningShowButtons ? 'checked' : ''} class="w-4 h-4 accent-sky-600 rounded" />
              <span>Show sound buttons</span>
            </label>
          </div>

          <div class="flex flex-col items-center justify-center py-6 gap-5">
            ${
              screeningShowButtons
                ? `<div class="flex flex-wrap items-center justify-center gap-3">
                    ${item.segments
                      .map(
                        (seg, idx) => `
                        <button
                          type="button"
                          data-screen-seg="${idx}"
                          class="flex flex-col items-center justify-center gap-2.5 min-w-[72px] min-h-[104px] px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            screeningHighlightIdx === idx
                              ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 -translate-y-1'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-sky-400'
                          }">
                          <span class="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">${esc(seg.letters)}</span>
                          ${renderSoundButtonGlyph(seg, screeningHighlightIdx === idx)}
                        </button>
                      `
                      )
                      .join('')}
                  </div>`
                : `<div class="text-6xl font-extrabold tracking-wide text-slate-900 dark:text-white py-4">${esc(item.word)}</div>`
            }

            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button type="button" id="screen-blend-btn" class="px-5 py-3 min-h-[48px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                🌊 Sound Out &amp; Check
              </button>
              <button type="button" id="screen-mark-pass" class="px-5 py-3 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap">
                ✓ Read Correctly
              </button>
              <button type="button" id="screen-mark-retry" class="px-5 py-3 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap">
                ↻ Practise Again
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" id="screen-prev-btn" class="px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              &larr; Previous Card
            </button>
            <button type="button" id="screen-next-btn" class="px-4 py-2.5 min-h-[44px] rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 cursor-pointer">
              Next Card &rarr;
            </button>
          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // MAIN RENDER & EVENT BINDING
  // =========================================================================

  function render(): void {
    const stageButtons: Array<{ id: StudioStage; label: string }> = [
      { id: 'ear-warmup', label: '0. Ear Warm-Up' },
      { id: 'pure-sounds', label: '1. Pure Sounds' },
      { id: 'blend-words', label: '2. Blend Words' },
      { id: 'build-words', label: '3. Build Words' },
      { id: 'tricky-words', label: '4. Tricky Words' },
      { id: 'mini-books', label: '5. Mini-Books' },
      { id: 'screening', label: 'Year 1 Check' },
    ];

    let stageHtml = '';
    switch (activeStage) {
      case 'ear-warmup':
        stageHtml = renderStage0EarWarmUp();
        break;
      case 'pure-sounds':
        stageHtml = renderStage1PureSounds();
        break;
      case 'blend-words':
        stageHtml = renderStage2BlendWords();
        break;
      case 'build-words':
        stageHtml = renderStage3BuildWords();
        break;
      case 'tricky-words':
        stageHtml = renderStage4TrickyWords();
        break;
      case 'mini-books':
        stageHtml = renderStage5MiniBooks();
        break;
      case 'screening':
        stageHtml = renderScreeningCheck();
        break;
    }

    container.innerHTML = `
      <!-- Header -->
      <header class="space-y-4 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-2">
            <a href="${base}" class="font-semibold hover:text-slate-900 dark:hover:text-white transition-colors">&larr; Home</a>
            <span aria-hidden="true">/</span>
            <span class="font-semibold text-sky-700 dark:text-sky-400">Learn to Read Studio</span>
          </div>
          <div class="flex items-center gap-2 tabular-nums">
            <span class="font-semibold text-amber-600 dark:text-amber-400">★ ${totalStars()} stars</span>
            <span aria-hidden="true">·</span>
            <span>${progress.booksCompleted.length}/${DECODABLE_MINI_BOOKS.length} mini-books read</span>
            <span aria-hidden="true">·</span>
            <span>100% offline</span>
          </div>
        </div>

        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="max-w-2xl">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style="text-wrap: balance;">
              Learn to Read Studio
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              A step-by-step phonics journey from first sounds to reading full illustrated books independently.
            </p>
          </div>
          <a
            href="${base}player?preset=phonics-lab"
            class="px-4 py-2.5 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0">
            <span>Launch Vector Phonics Sim</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <!-- 6-Stage Reading Ladder Navigation -->
        <nav aria-label="Reading progression stages" class="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl overflow-x-auto">
          ${stageButtons
            .map(
              (st) => `
              <button
                type="button"
                data-stage-tab="${st.id}"
                aria-current="${activeStage === st.id ? 'step' : 'false'}"
                class="px-3.5 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  activeStage === st.id
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }">
                ${st.label}
              </button>
            `
            )
            .join('')}
        </nav>
      </header>

      <!-- Active Stage Content -->
      <main>
        ${stageHtml}
      </main>
    `;

    attachHandlers();
  }

  function attachHandlers(): void {
    // Stage tabs
    container.querySelectorAll<HTMLButtonElement>('[data-stage-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-stage-tab') as StudioStage;
        if (!target) return;
        clearSpeechAndTimers();
        playClickTone();
        activeStage = target;
        if (target === 'build-words') initBuildPuzzle();
        render();
      });
    });

    // ---------------- STAGE 0: EAR WARM-UP ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-ear-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        earFilter = (btn.getAttribute('data-ear-filter') as 'all' | PreReaderMode) || 'all';
        earIndex = 0;
        earStatus = 'idle';
        earChosenLabel = '';
        render();
      });
    });

    container.querySelector('#ear-toggle-labels')?.addEventListener('change', (e) => {
      earShowLabels = (e.target as HTMLInputElement).checked;
      render();
    });

    const filteredEar =
      earFilter === 'all'
        ? PRE_READER_GAMES
        : PRE_READER_GAMES.filter((g) => g.mode === earFilter);
    const currentEar = filteredEar[earIndex % filteredEar.length] || PRE_READER_GAMES[0];

    container.querySelector('#ear-play-prompt-btn')?.addEventListener('click', () => {
      if (currentEar.robotPhonemes && currentEar.robotPhonemes.length > 0) {
        speakSequence(
          [
            { spoken: currentEar.spokenPrompt, subtitle: currentEar.spokenPrompt, rate: 0.88 },
            ...currentEar.robotPhonemes.map((ph) => ({
              spoken: ph,
              subtitle: `/${ph}/`,
              rate: 0.72,
            })),
          ],
          260
        );
      } else {
        speak(currentEar.spokenPrompt, { subtitle: currentEar.spokenPrompt, rate: 0.84 });
      }
    });

    container.querySelectorAll<HTMLButtonElement>('[data-ear-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const label = btn.getAttribute('data-ear-option') || '';
        const isCorrect = btn.getAttribute('data-ear-correct') === 'true';
        earChosenLabel = label;
        if (isCorrect) {
          earStatus = 'correct';
          recordProgress('earStars', currentEar.id);
          playSuccessChime();
          triggerHapticSuccess();
          speak(currentEar.successPraise, { bslWord: label, subtitle: currentEar.successPraise });
        } else {
          earStatus = 'retry';
          playIncorrectTone();
          triggerHapticError();
          speak(`That is ${label}. Try listening again!`, { bslWord: label });
        }
        render();
      });
    });

    container.querySelector('#ear-prev-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      earIndex = (earIndex - 1 + filteredEar.length) % filteredEar.length;
      earStatus = 'idle';
      earChosenLabel = '';
      render();
    });

    container.querySelector('#ear-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      earIndex = (earIndex + 1) % filteredEar.length;
      earStatus = 'idle';
      earChosenLabel = '';
      render();
    });

    // ---------------- STAGE 1: PURE SOUNDS ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-sound-group]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        playClickTone();
        activeSoundGroupId = btn.getAttribute('data-sound-group') || CUMULATIVE_SOUND_GROUPS[0].id;
        const grp = CUMULATIVE_SOUND_GROUPS.find((g) => g.id === activeSoundGroupId);
        if (grp && grp.graphemes.length > 0) {
          const first = PHONICS_GRAPHEMES.find((p) => p.grapheme === grp.graphemes[0]);
          if (first) selectedGraphemeId = first.id;
        }
        render();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-grapheme-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-grapheme-id') || '';
        const g = PHONICS_GRAPHEMES.find((p) => p.id === id);
        if (!g) return;
        selectedGraphemeId = g.id;
        recordProgress('soundsHeard', g.id);
        triggerHapticClick();
        speakPurePhoneme(g.grapheme, g.soundAudioText, g.grapheme);
        render();
      });
    });

    const selectedG = PHONICS_GRAPHEMES.find((p) => p.id === selectedGraphemeId) || PHONICS_GRAPHEMES[0];
    container.querySelector('#spotlight-play-pure')?.addEventListener('click', () => {
      recordProgress('soundsHeard', selectedG.id);
      speakPurePhoneme(selectedG.grapheme, selectedG.soundAudioText, selectedG.grapheme);
    });
    container.querySelector('#spotlight-play-word')?.addEventListener('click', () => {
      speakSequence(
        [
          { spoken: getPhonemeSpokenText(selectedG.grapheme, selectedG.soundAudioText), subtitle: `/${selectedG.grapheme}/`, rate: 0.78 },
          { spoken: selectedG.exampleWord, subtitle: selectedG.exampleWord, rate: 0.85 },
        ],
        240
      );
    });
    container.querySelector('#stage1-goto-blend')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      activeStage = 'blend-words';
      render();
    });

    // ---------------- STAGE 2: BLEND WORDS ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-blend-phase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        const raw = btn.getAttribute('data-blend-phase') || 'starter';
        blendPhaseFilter = raw === 'starter' ? 'starter' : (parseInt(raw, 10) as 2 | 3 | 4 | 5);
        blendWordIndex = 0;
        blendHighlightIdx = -1;
        blendPictureRevealed = false;
        render();
      });
    });

    container.querySelector('#blend-hide-pic-toggle')?.addEventListener('change', (e) => {
      blendHidePictureFirst = (e.target as HTMLInputElement).checked;
      render();
    });

    const blendWords = getWordsForFilter(blendPhaseFilter);
    const currentBlendWord =
      blendWords[blendWordIndex % Math.max(1, blendWords.length)] || ALL_DECODABLE_WORDS[0];

    container.querySelectorAll<HTMLButtonElement>('[data-blend-seg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-blend-seg') || '0', 10);
        const seg = currentBlendWord.segments[idx];
        if (!seg) return;
        blendHighlightIdx = idx;
        triggerHapticClick();
        render();
        speakPurePhoneme(seg.letters, seg.soundHint, seg.letters);
      });
    });

    container.querySelector('#blend-animate-btn')?.addEventListener('click', () => {
      const steps = [
        ...currentBlendWord.segments.map((seg, idx) => ({
          spoken: getPhonemeSpokenText(seg.letters, seg.soundHint),
          subtitle: `/${seg.letters}/`,
          rate: 0.76,
          onStart: () => {
            blendHighlightIdx = idx;
            render();
          },
        })),
        {
          spoken: currentBlendWord.word,
          subtitle: currentBlendWord.word,
          rate: 0.86,
          onStart: () => {
            blendHighlightIdx = -1;
            blendPictureRevealed = true;
            recordProgress('wordsBlended', currentBlendWord.word);
            playSuccessChime();
            triggerHapticSuccess();
            render();
          },
        },
      ];
      speakSequence(steps, 180);
    });

    container.querySelector('#blend-say-whole-btn')?.addEventListener('click', () => {
      blendPictureRevealed = true;
      recordProgress('wordsBlended', currentBlendWord.word);
      speak(currentBlendWord.word, { bslWord: currentBlendWord.word, subtitle: currentBlendWord.word });
      render();
    });

    container.querySelector('#blend-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      blendWordIndex = (blendWordIndex + 1) % blendWords.length;
      blendHighlightIdx = -1;
      blendPictureRevealed = false;
      render();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-blend-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        blendWordIndex = parseInt(btn.getAttribute('data-blend-pick') || '0', 10);
        blendHighlightIdx = -1;
        blendPictureRevealed = false;
        render();
      });
    });

    // ---------------- STAGE 3: BUILD WORDS (ELKONIN BOXES) ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-build-phase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        const raw = btn.getAttribute('data-build-phase') || 'starter';
        buildPhaseFilter = raw === 'starter' ? 'starter' : (parseInt(raw, 10) as 2 | 3 | 4 | 5);
        buildWordIndex = 0;
        initBuildPuzzle();
        render();
      });
    });

    const buildWords = getWordsForFilter(buildPhaseFilter);
    const currentBuildWord =
      buildWords[buildWordIndex % Math.max(1, buildWords.length)] || ALL_DECODABLE_WORDS[0];

    container.querySelector('#build-hear-word-btn')?.addEventListener('click', () => {
      speak(`Build the word: ${currentBuildWord.word}`, {
        bslWord: currentBuildWord.word,
        subtitle: currentBuildWord.word,
      });
    });

    container.querySelector('#build-hint-btn')?.addEventListener('click', () => {
      const nextEmpty = buildSlots.findIndex((s) => s === null);
      const targetIdx = nextEmpty === -1 ? 0 : nextEmpty;
      const seg = currentBuildWord.segments[targetIdx];
      if (!seg) return;
      buildHintText = `Listen for sound ${targetIdx + 1}: /${seg.letters}/`;
      speakPurePhoneme(seg.letters, seg.soundHint, seg.letters);
      render();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-build-tile]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tileId = btn.getAttribute('data-build-tile') || '';
        const tile = buildTray.find((t) => t.tileId === tileId);
        if (!tile) return;
        const emptyIdx = buildSlots.findIndex((s) => s === null);
        if (emptyIdx === -1) return;
        buildSlots[emptyIdx] = tile;
        buildStatus = 'idle';
        buildHintText = '';
        triggerHapticClick();
        speakPurePhoneme(tile.letters, tile.soundHint, tile.letters);
        render();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-build-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-build-slot') || '0', 10);
        if (buildSlots[idx]) {
          buildSlots[idx] = null;
          buildStatus = 'idle';
          playClickTone();
          render();
        }
      });
    });

    container.querySelector('#build-clear-btn')?.addEventListener('click', () => {
      buildSlots = buildSlots.map(() => null);
      buildStatus = 'idle';
      buildHintText = '';
      playClickTone();
      render();
    });

    container.querySelector('#build-check-btn')?.addEventListener('click', () => {
      const attempt = buildSlots.map((s) => s?.letters || '').join('');
      const target = currentBuildWord.segments.map((s) => s.letters).join('');
      if (attempt.toLowerCase() === target.toLowerCase()) {
        buildStatus = 'correct';
        recordProgress('wordsBuilt', currentBuildWord.word);
        playSuccessChime();
        triggerHapticSuccess();
        speak(`Well done! You built ${currentBuildWord.word}!`, {
          bslWord: currentBuildWord.word,
          subtitle: currentBuildWord.word,
        });
      } else {
        buildStatus = 'wrong';
        playIncorrectTone();
        triggerHapticError();
        speak(`Listen closely to ${currentBuildWord.word} and check each sound box.`);
      }
      render();
    });

    container.querySelector('#build-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      buildWordIndex = (buildWordIndex + 1) % buildWords.length;
      initBuildPuzzle();
      render();
    });

    // ---------------- STAGE 4: TRICKY WORDS ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-tricky-phase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        const raw = btn.getAttribute('data-tricky-phase') || '2';
        trickyPhaseFilter = raw === 'all' ? 'all' : (parseInt(raw, 10) as 2 | 3 | 4 | 5);
        const list =
          trickyPhaseFilter === 'all'
            ? TRICKY_WORDS
            : TRICKY_WORDS.filter((tw) => tw.phase === trickyPhaseFilter);
        if (list[0]) selectedTrickyId = list[0].id;
        render();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-tricky-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-tricky-id') || '';
        const tw = TRICKY_WORDS.find((x) => x.id === id);
        if (!tw) return;
        selectedTrickyId = tw.id;
        speak(tw.word, { bslWord: tw.word, subtitle: tw.word });
        render();
      });
    });

    const selectedTricky =
      TRICKY_WORDS.find((x) => x.id === selectedTrickyId) || TRICKY_WORDS[0];

    container.querySelector('#tricky-hear-word')?.addEventListener('click', () => {
      speak(selectedTricky.word, { bslWord: selectedTricky.word, subtitle: selectedTricky.word });
    });

    container.querySelector('#tricky-hear-sentence')?.addEventListener('click', () => {
      speak(selectedTricky.exampleSentence, { subtitle: selectedTricky.exampleSentence, rate: 0.85 });
    });

    container.querySelector('#tricky-mark-known')?.addEventListener('click', () => {
      if (!progress.trickyKnown.includes(selectedTricky.id)) {
        recordProgress('trickyKnown', selectedTricky.id);
        playSuccessChime();
        triggerHapticSuccess();
      } else {
        progress.trickyKnown = progress.trickyKnown.filter((id) => id !== selectedTricky.id);
        saveProgress(progress);
      }
      render();
    });

    // ---------------- STAGE 5: DECODABLE MINI-BOOKS (VECTOR PLAYER) ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-open-book]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        openBookId = btn.getAttribute('data-open-book');
        bookQuizMode = false;
        bookQuizAnswers = {};
        playClickTone();
        render();
      });
    });

    container.querySelector('#book-back-shelf')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      openBookId = null;
      bookQuizMode = false;
      render();
    });

    container.querySelector('#book-finish-to-shelf')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      openBookId = null;
      bookQuizMode = false;
      render();
    });

    container.querySelector('#book-back-to-pages')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      bookQuizMode = false;
      render();
    });

    container.querySelector('#book-open-quiz')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      bookQuizMode = true;
      render();
    });

    const activeBook = openBookId
      ? DECODABLE_MINI_BOOKS.find((b) => b.id === openBookId)
      : null;

    if (activeBook && bookQuizMode) {
      container.querySelectorAll<HTMLButtonElement>('[data-quiz-speak]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const q = btn.getAttribute('data-quiz-speak') || '';
          speak(q, { subtitle: q, rate: 0.86 });
        });
      });

      container.querySelectorAll<HTMLButtonElement>('[data-quiz-qid]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qid = btn.getAttribute('data-quiz-qid') || '';
          const ok = btn.getAttribute('data-quiz-correct') === 'true';
          if (ok) {
            bookQuizAnswers[qid] = true;
            const finishedAll = activeBook.quiz.every((q) => bookQuizAnswers[q.id] === true);
            if (finishedAll) {
              recordProgress('booksCompleted', activeBook.id);
              playCelebrationFanfare();
              triggerHapticSuccess();
              speak(`Amazing reading! You finished ${activeBook.title}!`);
            } else {
              playSuccessChime();
              triggerHapticSuccess();
              speak('Correct! Well done!');
            }
          } else {
            playIncorrectTone();
            triggerHapticError();
            speak('Try another picture!');
          }
          render();
        });
      });
    }

    // ---------------- YEAR 1 SCREENING CHECK ----------------
    const screenItem = OFFICIAL_SCREENING_POOL[screeningIndex % OFFICIAL_SCREENING_POOL.length];

    container.querySelector('#screen-toggle-buttons')?.addEventListener('change', (e) => {
      screeningShowButtons = (e.target as HTMLInputElement).checked;
      render();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-screen-seg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-screen-seg') || '0', 10);
        const seg = screenItem.segments[idx];
        if (!seg) return;
        screeningHighlightIdx = idx;
        render();
        speakPurePhoneme(seg.letters, seg.soundHint, seg.letters);
      });
    });

    container.querySelector('#screen-blend-btn')?.addEventListener('click', () => {
      speakSequence(
        [
          ...screenItem.segments.map((seg, idx) => ({
            spoken: getPhonemeSpokenText(seg.letters, seg.soundHint),
            subtitle: `/${seg.letters}/`,
            rate: 0.76,
            onStart: () => {
              screeningHighlightIdx = idx;
              render();
            },
          })),
          {
            spoken: screenItem.word,
            subtitle: screenItem.word,
            rate: 0.84,
            onStart: () => {
              screeningHighlightIdx = -1;
              render();
            },
          },
        ],
        180
      );
    });

    container.querySelector('#screen-mark-pass')?.addEventListener('click', () => {
      screeningScores[screenItem.id] = 'pass';
      playSuccessChime();
      triggerHapticSuccess();
      screeningIndex = (screeningIndex + 1) % OFFICIAL_SCREENING_POOL.length;
      screeningHighlightIdx = -1;
      render();
    });

    container.querySelector('#screen-mark-retry')?.addEventListener('click', () => {
      screeningScores[screenItem.id] = 'retry';
      playClickTone();
      screeningIndex = (screeningIndex + 1) % OFFICIAL_SCREENING_POOL.length;
      screeningHighlightIdx = -1;
      render();
    });

    container.querySelector('#screen-prev-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      screeningIndex =
        (screeningIndex - 1 + OFFICIAL_SCREENING_POOL.length) % OFFICIAL_SCREENING_POOL.length;
      screeningHighlightIdx = -1;
      render();
    });

    container.querySelector('#screen-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      screeningIndex = (screeningIndex + 1) % OFFICIAL_SCREENING_POOL.length;
      screeningHighlightIdx = -1;
      render();
    });
  }

  render();
  return container;
}

export default renderPhonicsPage;
