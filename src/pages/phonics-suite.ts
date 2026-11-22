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
 *
 * Modular architecture:
 *   - src/pages/phonics/phonicsSpeech.ts: state types, progress persistence, puzzle builder, Web Speech controller
 *   - src/pages/phonics/phonicsStageViews.ts: pure HTML stage templates & shell markup
 *   - src/pages/phonics-suite.ts: lightweight page orchestrator & DOM event bindings
 */

import { getBaseUrl } from '../utils/url';
import {
  PHONICS_GRAPHEMES,
  TRICKY_WORDS,
  OFFICIAL_SCREENING_POOL,
  getPhonemeSpokenText,
} from '../data/phonicsCurriculumData';
import {
  PRE_READER_GAMES,
  CUMULATIVE_SOUND_GROUPS,
  ALL_DECODABLE_WORDS,
  DECODABLE_MINI_BOOKS,
  type PreReaderMode,
} from '../data/earlyReaderLadderData';
import {
  playSuccessChime,
  playIncorrectTone,
  playClickTone,
  playCelebrationFanfare,
  triggerHapticSuccess,
  triggerHapticError,
  triggerHapticClick,
} from '../services/soundHaptics';
import {
  createPhonicsSpeechController,
  getWordsForFilter,
  initElkoninBuildPuzzle,
  loadReaderProgress,
  saveReaderProgress,
  type PhonicsStudioState,
  type ReaderProgress,
  type StudioStage,
} from './phonics/phonicsSpeech';
import { renderPhonicsShellHtml } from './phonics/phonicsStageViews';

export function renderPhonicsPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'phonics-suite-stage max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16 text-slate-900 dark:text-slate-100';

  const state: PhonicsStudioState = {
    base: getBaseUrl(),
    progress: loadReaderProgress(),
    activeStage: 'ear-warmup',

    // Stage 0: Ear Warm-Up
    earFilter: 'all',
    earIndex: 0,
    earShowLabels: false,
    earStatus: 'idle',
    earChosenLabel: '',

    // Stage 1: Pure Sounds
    activeSoundGroupId: CUMULATIVE_SOUND_GROUPS[0].id,
    selectedGraphemeId: PHONICS_GRAPHEMES[0].id,

    // Stage 2: Blend Words
    blendPhaseFilter: 'starter',
    blendWordIndex: 0,
    blendHighlightIdx: -1,
    blendPictureRevealed: false,
    blendHidePictureFirst: true,

    // Stage 3: Build Words (Elkonin Boxes)
    buildPhaseFilter: 'starter',
    buildWordIndex: 0,
    buildSlots: [],
    buildTray: [],
    buildStatus: 'idle',
    buildHintText: '',

    // Stage 4: Tricky Words
    trickyPhaseFilter: 2,
    selectedTrickyId: TRICKY_WORDS[0].id,

    // Stage 5: Mini-Books (AST Vector Player Cartridges)
    openBookId: null,
    bookQuizMode: false,
    bookQuizAnswers: {},

    // Bonus: Year 1 Screening Check
    screeningIndex: 0,
    screeningShowButtons: true,
    screeningHighlightIdx: -1,
    screeningScores: {},
  };

  const { clearSpeechAndTimers, speak, speakPurePhoneme, speakSequence } =
    createPhonicsSpeechController();

  function recordProgress(bucket: keyof ReaderProgress, id: string): void {
    if (!state.progress[bucket].includes(id)) {
      state.progress[bucket].push(id);
      saveReaderProgress(state.progress);
    }
  }

  initElkoninBuildPuzzle(state);

  function render(): void {
    container.innerHTML = renderPhonicsShellHtml(state);
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
        state.activeStage = target;
        if (target === 'build-words') initElkoninBuildPuzzle(state);
        render();
      });
    });

    // ---------------- STAGE 0: EAR WARM-UP ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-ear-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        state.earFilter = (btn.getAttribute('data-ear-filter') as 'all' | PreReaderMode) || 'all';
        state.earIndex = 0;
        state.earStatus = 'idle';
        state.earChosenLabel = '';
        render();
      });
    });

    container.querySelector('#ear-toggle-labels')?.addEventListener('change', (e) => {
      state.earShowLabels = (e.target as HTMLInputElement).checked;
      render();
    });

    const filteredEar =
      state.earFilter === 'all'
        ? PRE_READER_GAMES
        : PRE_READER_GAMES.filter((g) => g.mode === state.earFilter);
    const currentEar = filteredEar[state.earIndex % filteredEar.length] || PRE_READER_GAMES[0];

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
        state.earChosenLabel = label;
        if (isCorrect) {
          state.earStatus = 'correct';
          recordProgress('earStars', currentEar.id);
          playSuccessChime();
          triggerHapticSuccess();
          speak(currentEar.successPraise, { bslWord: label, subtitle: currentEar.successPraise });
        } else {
          state.earStatus = 'retry';
          playIncorrectTone();
          triggerHapticError();
          speak(`That is ${label}. Try listening again!`, { bslWord: label });
        }
        render();
      });
    });

    container.querySelector('#ear-prev-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.earIndex = (state.earIndex - 1 + filteredEar.length) % filteredEar.length;
      state.earStatus = 'idle';
      state.earChosenLabel = '';
      render();
    });

    container.querySelector('#ear-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.earIndex = (state.earIndex + 1) % filteredEar.length;
      state.earStatus = 'idle';
      state.earChosenLabel = '';
      render();
    });

    // ---------------- STAGE 1: PURE SOUNDS ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-sound-group]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        playClickTone();
        state.activeSoundGroupId =
          btn.getAttribute('data-sound-group') || CUMULATIVE_SOUND_GROUPS[0].id;
        const grp = CUMULATIVE_SOUND_GROUPS.find((g) => g.id === state.activeSoundGroupId);
        if (grp && grp.graphemes.length > 0) {
          const first = PHONICS_GRAPHEMES.find((p) => p.grapheme === grp.graphemes[0]);
          if (first) state.selectedGraphemeId = first.id;
        }
        render();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-grapheme-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-grapheme-id') || '';
        const g = PHONICS_GRAPHEMES.find((p) => p.id === id);
        if (!g) return;
        state.selectedGraphemeId = g.id;
        recordProgress('soundsHeard', g.id);
        triggerHapticClick();
        speakPurePhoneme(g.grapheme, g.soundAudioText, g.grapheme);
        render();
      });
    });

    const selectedG =
      PHONICS_GRAPHEMES.find((p) => p.id === state.selectedGraphemeId) || PHONICS_GRAPHEMES[0];
    container.querySelector('#spotlight-play-pure')?.addEventListener('click', () => {
      recordProgress('soundsHeard', selectedG.id);
      speakPurePhoneme(selectedG.grapheme, selectedG.soundAudioText, selectedG.grapheme);
    });
    container.querySelector('#spotlight-play-word')?.addEventListener('click', () => {
      speakSequence(
        [
          {
            spoken: getPhonemeSpokenText(selectedG.grapheme, selectedG.soundAudioText),
            subtitle: `/${selectedG.grapheme}/`,
            rate: 0.78,
          },
          { spoken: selectedG.exampleWord, subtitle: selectedG.exampleWord, rate: 0.85 },
        ],
        240
      );
    });
    container.querySelector('#stage1-goto-blend')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.activeStage = 'blend-words';
      render();
    });

    // ---------------- STAGE 2: BLEND WORDS ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-blend-phase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        const raw = btn.getAttribute('data-blend-phase') || 'starter';
        state.blendPhaseFilter =
          raw === 'starter' ? 'starter' : (parseInt(raw, 10) as 2 | 3 | 4 | 5);
        state.blendWordIndex = 0;
        state.blendHighlightIdx = -1;
        state.blendPictureRevealed = false;
        render();
      });
    });

    container.querySelector('#blend-hide-pic-toggle')?.addEventListener('change', (e) => {
      state.blendHidePictureFirst = (e.target as HTMLInputElement).checked;
      render();
    });

    const blendWords = getWordsForFilter(state.blendPhaseFilter);
    const currentBlendWord =
      blendWords[state.blendWordIndex % Math.max(1, blendWords.length)] || ALL_DECODABLE_WORDS[0];

    container.querySelectorAll<HTMLButtonElement>('[data-blend-seg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-blend-seg') || '0', 10);
        const seg = currentBlendWord.segments[idx];
        if (!seg) return;
        state.blendHighlightIdx = idx;
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
            state.blendHighlightIdx = idx;
            render();
          },
        })),
        {
          spoken: currentBlendWord.word,
          subtitle: currentBlendWord.word,
          rate: 0.86,
          onStart: () => {
            state.blendHighlightIdx = -1;
            state.blendPictureRevealed = true;
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
      state.blendPictureRevealed = true;
      recordProgress('wordsBlended', currentBlendWord.word);
      speak(currentBlendWord.word, {
        bslWord: currentBlendWord.word,
        subtitle: currentBlendWord.word,
      });
      render();
    });

    container.querySelector('#blend-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.blendWordIndex = (state.blendWordIndex + 1) % blendWords.length;
      state.blendHighlightIdx = -1;
      state.blendPictureRevealed = false;
      render();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-blend-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        state.blendWordIndex = parseInt(btn.getAttribute('data-blend-pick') || '0', 10);
        state.blendHighlightIdx = -1;
        state.blendPictureRevealed = false;
        render();
      });
    });

    // ---------------- STAGE 3: BUILD WORDS (ELKONIN BOXES) ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-build-phase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        const raw = btn.getAttribute('data-build-phase') || 'starter';
        state.buildPhaseFilter =
          raw === 'starter' ? 'starter' : (parseInt(raw, 10) as 2 | 3 | 4 | 5);
        state.buildWordIndex = 0;
        initElkoninBuildPuzzle(state);
        render();
      });
    });

    const buildWords = getWordsForFilter(state.buildPhaseFilter);
    const currentBuildWord =
      buildWords[state.buildWordIndex % Math.max(1, buildWords.length)] || ALL_DECODABLE_WORDS[0];

    container.querySelector('#build-hear-word-btn')?.addEventListener('click', () => {
      speak(`Build the word: ${currentBuildWord.word}`, {
        bslWord: currentBuildWord.word,
        subtitle: currentBuildWord.word,
      });
    });

    container.querySelector('#build-hint-btn')?.addEventListener('click', () => {
      const nextEmpty = state.buildSlots.findIndex((s) => s === null);
      const targetIdx = nextEmpty === -1 ? 0 : nextEmpty;
      const seg = currentBuildWord.segments[targetIdx];
      if (!seg) return;
      state.buildHintText = `Listen for sound ${targetIdx + 1}: /${seg.letters}/`;
      speakPurePhoneme(seg.letters, seg.soundHint, seg.letters);
      render();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-build-tile]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tileId = btn.getAttribute('data-build-tile') || '';
        const tile = state.buildTray.find((t) => t.tileId === tileId);
        if (!tile) return;
        const emptyIdx = state.buildSlots.findIndex((s) => s === null);
        if (emptyIdx === -1) return;
        state.buildSlots[emptyIdx] = tile;
        state.buildStatus = 'idle';
        state.buildHintText = '';
        triggerHapticClick();
        speakPurePhoneme(tile.letters, tile.soundHint, tile.letters);
        render();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-build-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-build-slot') || '0', 10);
        if (state.buildSlots[idx]) {
          state.buildSlots[idx] = null;
          state.buildStatus = 'idle';
          playClickTone();
          render();
        }
      });
    });

    container.querySelector('#build-clear-btn')?.addEventListener('click', () => {
      state.buildSlots = state.buildSlots.map(() => null);
      state.buildStatus = 'idle';
      state.buildHintText = '';
      playClickTone();
      render();
    });

    container.querySelector('#build-check-btn')?.addEventListener('click', () => {
      const attempt = state.buildSlots.map((s) => s?.letters || '').join('');
      const target = currentBuildWord.segments.map((s) => s.letters).join('');
      if (attempt.toLowerCase() === target.toLowerCase()) {
        state.buildStatus = 'correct';
        recordProgress('wordsBuilt', currentBuildWord.word);
        playSuccessChime();
        triggerHapticSuccess();
        speak(`Well done! You built ${currentBuildWord.word}!`, {
          bslWord: currentBuildWord.word,
          subtitle: currentBuildWord.word,
        });
      } else {
        state.buildStatus = 'wrong';
        playIncorrectTone();
        triggerHapticError();
        speak(`Listen closely to ${currentBuildWord.word} and check each sound box.`);
      }
      render();
    });

    container.querySelector('#build-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.buildWordIndex = (state.buildWordIndex + 1) % buildWords.length;
      initElkoninBuildPuzzle(state);
      render();
    });

    // ---------------- STAGE 4: TRICKY WORDS ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-tricky-phase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        const raw = btn.getAttribute('data-tricky-phase') || '2';
        state.trickyPhaseFilter =
          raw === 'all' ? 'all' : (parseInt(raw, 10) as 2 | 3 | 4 | 5);
        const list =
          state.trickyPhaseFilter === 'all'
            ? TRICKY_WORDS
            : TRICKY_WORDS.filter((tw) => tw.phase === state.trickyPhaseFilter);
        if (list[0]) state.selectedTrickyId = list[0].id;
        render();
      });
    });

    container.querySelectorAll<HTMLButtonElement>('[data-tricky-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-tricky-id') || '';
        const tw = TRICKY_WORDS.find((x) => x.id === id);
        if (!tw) return;
        state.selectedTrickyId = tw.id;
        speak(tw.word, { bslWord: tw.word, subtitle: tw.word });
        render();
      });
    });

    const selectedTricky =
      TRICKY_WORDS.find((x) => x.id === state.selectedTrickyId) || TRICKY_WORDS[0];

    container.querySelector('#tricky-hear-word')?.addEventListener('click', () => {
      speak(selectedTricky.word, { bslWord: selectedTricky.word, subtitle: selectedTricky.word });
    });

    container.querySelector('#tricky-hear-sentence')?.addEventListener('click', () => {
      speak(selectedTricky.exampleSentence, {
        subtitle: selectedTricky.exampleSentence,
        rate: 0.85,
      });
    });

    container.querySelector('#tricky-mark-known')?.addEventListener('click', () => {
      if (!state.progress.trickyKnown.includes(selectedTricky.id)) {
        recordProgress('trickyKnown', selectedTricky.id);
        playSuccessChime();
        triggerHapticSuccess();
      } else {
        state.progress.trickyKnown = state.progress.trickyKnown.filter(
          (id) => id !== selectedTricky.id
        );
        saveReaderProgress(state.progress);
      }
      render();
    });

    // ---------------- STAGE 5: DECODABLE MINI-BOOKS (VECTOR PLAYER) ----------------
    container.querySelectorAll<HTMLButtonElement>('[data-open-book]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearSpeechAndTimers();
        state.openBookId = btn.getAttribute('data-open-book');
        state.bookQuizMode = false;
        state.bookQuizAnswers = {};
        playClickTone();
        render();
      });
    });

    container.querySelector('#book-back-shelf')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.openBookId = null;
      state.bookQuizMode = false;
      render();
    });

    container.querySelector('#book-finish-to-shelf')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.openBookId = null;
      state.bookQuizMode = false;
      render();
    });

    container.querySelector('#book-back-to-pages')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.bookQuizMode = false;
      render();
    });

    container.querySelector('#book-open-quiz')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.bookQuizMode = true;
      render();
    });

    const activeBook = state.openBookId
      ? DECODABLE_MINI_BOOKS.find((b) => b.id === state.openBookId)
      : null;

    if (activeBook && state.bookQuizMode) {
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
            state.bookQuizAnswers[qid] = true;
            const finishedAll = activeBook.quiz.every((q) => state.bookQuizAnswers[q.id] === true);
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
    const screenItem =
      OFFICIAL_SCREENING_POOL[state.screeningIndex % OFFICIAL_SCREENING_POOL.length];

    container.querySelector('#screen-toggle-buttons')?.addEventListener('change', (e) => {
      state.screeningShowButtons = (e.target as HTMLInputElement).checked;
      render();
    });

    container.querySelectorAll<HTMLButtonElement>('[data-screen-seg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-screen-seg') || '0', 10);
        const seg = screenItem.segments[idx];
        if (!seg) return;
        state.screeningHighlightIdx = idx;
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
              state.screeningHighlightIdx = idx;
              render();
            },
          })),
          {
            spoken: screenItem.word,
            subtitle: screenItem.word,
            rate: 0.84,
            onStart: () => {
              state.screeningHighlightIdx = -1;
              render();
            },
          },
        ],
        180
      );
    });

    container.querySelector('#screen-mark-pass')?.addEventListener('click', () => {
      state.screeningScores[screenItem.id] = 'pass';
      playSuccessChime();
      triggerHapticSuccess();
      state.screeningIndex = (state.screeningIndex + 1) % OFFICIAL_SCREENING_POOL.length;
      state.screeningHighlightIdx = -1;
      render();
    });

    container.querySelector('#screen-mark-retry')?.addEventListener('click', () => {
      state.screeningScores[screenItem.id] = 'retry';
      playClickTone();
      state.screeningIndex = (state.screeningIndex + 1) % OFFICIAL_SCREENING_POOL.length;
      state.screeningHighlightIdx = -1;
      render();
    });

    container.querySelector('#screen-prev-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.screeningIndex =
        (state.screeningIndex - 1 + OFFICIAL_SCREENING_POOL.length) %
        OFFICIAL_SCREENING_POOL.length;
      state.screeningHighlightIdx = -1;
      render();
    });

    container.querySelector('#screen-next-btn')?.addEventListener('click', () => {
      clearSpeechAndTimers();
      state.screeningIndex = (state.screeningIndex + 1) % OFFICIAL_SCREENING_POOL.length;
      state.screeningHighlightIdx = -1;
      render();
    });
  }

  render();
  return container;
}

export default renderPhonicsPage;
