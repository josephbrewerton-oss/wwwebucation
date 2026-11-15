// src/pages/revision-suite.ts
// St Joseph's Curriculum Portal - GCSE Exam Prep, 6-Mark Walkthroughs, Active-Recall Flashcards & Audio Dictation
// Pure Native TypeScript Single-Page Module (Zero React, 100% Offline, Zero Cloud Egress)

import { getBaseUrl } from '../utils/url';
import {
  UK_COMMAND_WORDS,
  GCSE_EXAM_QUESTIONS,
  getAllRevisionFlashcards,
  DICTATION_ITEMS,
  type ExamBoardId,
  type GcseExamQuestion,
  type RevisionFlashcard,
  type DictationItem,
} from '../data/examRevisionData';
import { getLocalState, setLocalState } from '../services/localStateStore';
import { recordAssessmentAttempt } from '../services/studentProfileStore';
import { appendJotter } from '../services/jotter-db';
import { broadcastBslSpeech } from '../services/bslGlobalStore';
import { playSuccessChime, playIncorrectTone, playClickTone } from '../services/soundHaptics';
import { aiCaller, hasUserGrantedAiConsent } from '../engine/aicaller';

const FLASHCARD_MASTERY_KEY = 'stj_flashcard_mastered_ids_v1';
const EXAM_SAVED_PROGRESS_KEY = 'stj_gcse_exam_drafts_v1';

type RevisionTab = 'exam' | 'flashcards' | 'dictation';

interface ExamDraftState {
  text: string;
  checkedMarkIds: string[];
  tutorFeedback: string;
  recordedMarks?: number;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadMasteredCardIds(): Set<string> {
  try {
    const raw = getLocalState(FLASHCARD_MASTERY_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveMasteredCardIds(ids: Set<string>): void {
  try {
    setLocalState(FLASHCARD_MASTERY_KEY, JSON.stringify(Array.from(ids)));
  } catch (_) {}
}

function loadExamDrafts(): Record<string, ExamDraftState> {
  try {
    const raw = getLocalState(EXAM_SAVED_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveExamDrafts(drafts: Record<string, ExamDraftState>): void {
  try {
    setLocalState(EXAM_SAVED_PROGRESS_KEY, JSON.stringify(drafts));
  } catch (_) {}
}

function speakText(text: string, lang = 'en-GB'): void {
  if (typeof window === 'undefined') return;
  broadcastBslSpeech({ subtitle: text, isSpeaking: true });
  if (!('speechSynthesis' in window)) {
    setTimeout(() => broadcastBslSpeech({ isSpeaking: false }), 1500);
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = lang === 'en-GB' ? 0.92 : 0.85;
    utter.onend = () => broadcastBslSpeech({ isSpeaking: false });
    utter.onerror = () => broadcastBslSpeech({ isSpeaking: false });
    window.speechSynthesis.speak(utter);
  } catch {
    broadcastBslSpeech({ isSpeaking: false });
  }
}

function evaluateExamAnswerDeterministically(
  q: GcseExamQuestion,
  studentText: string
): { matchedIds: string[]; missingPoints: string[]; commandAdvice: string; summary: string } {
  const lower = (studentText || '').toLowerCase();
  const matchedIds: string[] = [];
  const missingPoints: string[] = [];

  for (const pt of q.markPoints) {
    const hit = pt.keywords.some((kw) => lower.includes(kw.toLowerCase()));
    if (hit) {
      matchedIds.push(pt.id);
    } else {
      missingPoints.push(`${pt.markLabel}: ${pt.criterion}`);
    }
  }

  let commandAdvice = '';
  const cmdLower = q.commandWord.toLowerCase();
  if (cmdLower.includes('explain') && !/\b(because|so|causes|therefore|since|means|leads to)\b/i.test(studentText)) {
    commandAdvice = 'Command-word tip ("Explain"): add cause-and-effect words like "because", "therefore", or "which causes" to unlock full marks.';
  } else if (cmdLower.includes('evaluate') && !/\b(however|although|on the other hand|overall|conclusion|therefore)\b/i.test(studentText)) {
    commandAdvice = 'Command-word tip ("Evaluate"): make sure you include a contrasting viewpoint ("However...") and end with an "Overall..." conclusion.';
  } else if (cmdLower.includes('compare') && !/\b(whereas|both|while|contrast|unlike|similar)\b/i.test(studentText)) {
    commandAdvice = 'Command-word tip ("Compare"): connect similarities and differences directly using "whereas", "both", or "in contrast".';
  }

  const scoreLine = `Deterministic Mark-Scheme Check: estimated ${matchedIds.length} / ${q.marks} key points matched.`;
  const nextLine =
    missingPoints.length === 0
      ? 'Strong coverage! Review the mark-scheme wording below to double-check accuracy.'
      : `Focus next on: ${missingPoints.slice(0, 2).join(' | ')}`;

  const summary = [scoreLine, commandAdvice, nextLine].filter(Boolean).join('\n');
  return { matchedIds, missingPoints, commandAdvice, summary };
}

async function runTutorMarkSchemeCheck(
  q: GcseExamQuestion,
  studentText: string
): Promise<{ matchedIds: string[]; feedback: string; usedNano: boolean }> {
  const det = evaluateExamAnswerDeterministically(q, studentText);

  if (!aiCaller.isPromptApiAvailableSync() || !hasUserGrantedAiConsent()) {
    return {
      matchedIds: det.matchedIds,
      feedback: det.summary,
      usedNano: false,
    };
  }

  try {
    const rubricLines = q.markPoints.map((p) => `- ${p.markLabel}: ${p.criterion}`).join('\n');
    const prompt = [
      `GCSE Question (${q.marks} marks, Command Word: ${q.commandWord}): ${q.prompt}`,
      `Mark Scheme:\n${rubricLines}`,
      `Pupil Draft:\n"${studentText.slice(0, 1200)}"`,
      `Deterministic estimate: ${det.matchedIds.length}/${q.marks}.`,
      `Give encouraging UK examiner coaching in 3 concise bullet points: (1) what marks are earned, (2) one specific missing mark-scheme point to add, (3) one tip for "${q.commandWord}". Under 75 words.`,
    ].join('\n\n');

    const reply = await aiCaller.promptText({
      prompt,
      systemPrompt: 'You are a supportive UK GCSE Examiner and classroom tutor. Be clear, encouraging, and aligned strictly to the supplied mark scheme.',
      timeoutMs: 12000,
    });

    if (reply && reply.trim().length > 12) {
      return {
        matchedIds: det.matchedIds,
        feedback: `🤖 On-Device Examiner Coaching:\n${reply.trim()}`,
        usedNano: true,
      };
    }
  } catch {
    // Fall back silently to deterministic feedback
  }

  return {
    matchedIds: det.matchedIds,
    feedback: det.summary,
    usedNano: false,
  };
}

export function renderRevisionSuitePage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'revision-suite-stage';
  container.style.cssText = 'max-width: 1160px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  const params = new URLSearchParams(window.location.search);
  const rawTab = params.get('tab') || 'exam';
  let activeTab: RevisionTab =
    rawTab === 'flashcards' ? 'flashcards' : rawTab === 'dictation' ? 'dictation' : 'exam';

  const rawBoard = params.get('board') || 'All';
  let selectedBoard: 'All' | ExamBoardId =
    rawBoard === 'AQA' || rawBoard === 'Edexcel' || rawBoard === 'OCR' ? rawBoard : 'All';
  let selectedSubject = (params.get('subject') || 'All').replace(/[<>"'&]/g, '');
  let showCommandGuide = false;

  // Flashcard state
  const allFlashcards = getAllRevisionFlashcards();
  let flashcardDeckFilter = params.get('deck') || 'gcse-science-equations';
  let flashcardStageFilter = params.get('stage') || 'All';
  let hideMasteredCards = false;
  let cardIndex = 0;
  let isCardFlipped = false;
  let showCardClue = false;
  const masteredIds = loadMasteredCardIds();

  // Exam state
  const examDrafts = loadExamDrafts();
  const revealedModels = new Set<string>();
  const revealedStarters = new Set<string>();
  const checkingQuestionIds = new Set<string>();
  const recordedToastMap = new Map<string, string>();

  // Dictation state
  let dictationDeckId = 'all';
  let dictationIndex = 0;
  let dictationShowClue = false;
  let dictationFeedback: { ok: boolean; msg: string } | null = null;
  let dictationInputValue = '';
  let dictationScore = 0;
  const dictationSolved = new Set<string>();

  const examSubjects = ['All', ...Array.from(new Set(GCSE_EXAM_QUESTIONS.map((q) => q.subject)))];

  function getFilteredExamQuestions(): GcseExamQuestion[] {
    return GCSE_EXAM_QUESTIONS.filter((q) => {
      const matchBoard = selectedBoard === 'All' || q.boards.includes(selectedBoard);
      const matchSubject = selectedSubject === 'All' || q.subject === selectedSubject;
      return matchBoard && matchSubject;
    });
  }

  function getFilteredFlashcards(): RevisionFlashcard[] {
    return allFlashcards.filter((c) => {
      if (flashcardDeckFilter !== 'all' && c.deckId !== flashcardDeckFilter) return false;
      if (flashcardStageFilter !== 'All' && c.stage !== flashcardStageFilter) return false;
      if (hideMasteredCards && masteredIds.has(c.id)) return false;
      return true;
    });
  }

  function getFilteredDictation(): DictationItem[] {
    if (dictationDeckId === 'all') return DICTATION_ITEMS;
    return DICTATION_ITEMS.filter((d) => d.deckId === dictationDeckId);
  }

  function renderHeader(): string {
    return `
      <header style="margin-bottom: 1.75rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
          <a href="${base}" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <a href="${base}learning-zone" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">Curriculum Library</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.82rem; color:#0284c7; font-weight:700;">📝 Exam Prep &amp; Flashcards</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div style="max-width:760px;">
            <span style="display:inline-block; font-size:0.74rem; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px;">
              AQA &bull; Edexcel &bull; OCR &bull; Active Recall &amp; Dictation
            </span>
            <h1 style="font-size:2.15rem; font-weight:800; color:#0f172a; margin:0 0 6px 0; letter-spacing:-0.02em;">
              GCSE Exam Prep, Flashcards &amp; Spelling
            </h1>
            <p style="font-size:0.98rem; color:#475569; margin:0; line-height:1.55;">
              Practise 4–6 mark extended exam questions with real mark schemes and on-device tutor feedback, flip active-recall flashcards, or train with audio dictation—100% offline.
            </p>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; display:flex; gap:18px; align-items:center;">
            <div>
              <div style="font-size:1.3rem; font-weight:800; color:#0284c7; line-height:1;">${GCSE_EXAM_QUESTIONS.length}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Exam Tasks</div>
            </div>
            <div style="width:1px; height:28px; background:#e2e8f0;"></div>
            <div>
              <div style="font-size:1.3rem; font-weight:800; color:#10b981; line-height:1;">${masteredIds.size}/${allFlashcards.length}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Cards Known</div>
            </div>
            <div style="width:1px; height:28px; background:#e2e8f0;"></div>
            <div>
              <div style="font-size:1.3rem; font-weight:800; color:#7c3aed; line-height:1;">${DICTATION_ITEMS.length}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Audio Words</div>
            </div>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div style="display:flex; gap:8px; margin-top:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:12px; flex-wrap:wrap;">
          <button type="button" id="rev-tab-exam" style="padding:9px 18px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:1px solid ${activeTab === 'exam' ? '#0284c7' : '#cbd5e1'}; background:${activeTab === 'exam' ? '#0284c7' : '#ffffff'}; color:${activeTab === 'exam' ? '#ffffff' : '#334155'};">
            📝 GCSE 6-Mark Walkthroughs
          </button>
          <button type="button" id="rev-tab-flashcards" style="padding:9px 18px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:1px solid ${activeTab === 'flashcards' ? '#0284c7' : '#cbd5e1'}; background:${activeTab === 'flashcards' ? '#0284c7' : '#ffffff'}; color:${activeTab === 'flashcards' ? '#ffffff' : '#334155'};">
            🃏 Active-Recall Flashcards
          </button>
          <button type="button" id="rev-tab-dictation" style="padding:9px 18px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:1px solid ${activeTab === 'dictation' ? '#0284c7' : '#cbd5e1'}; background:${activeTab === 'dictation' ? '#0284c7' : '#ffffff'}; color:${activeTab === 'dictation' ? '#ffffff' : '#334155'};">
            🎧 Listen &amp; Spell Dictation
          </button>
        </div>
      </header>
    `;
  }

  function renderExamSection(): string {
    const questions = getFilteredExamQuestions();

    return `
      <!-- Exam Filters + Command Word Guide Toggle -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.15rem 1.35rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:0.8rem; font-weight:800; color:#475569;">Exam Board:</span>
            ${(['All', 'AQA', 'Edexcel', 'OCR'] as const).map((board) => `
              <button type="button" class="exam-board-btn" data-board="${board}" style="padding:5px 12px; border-radius:999px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid ${selectedBoard === board ? '#0284c7' : '#cbd5e1'}; background:${selectedBoard === board ? '#0284c7' : '#f8fafc'}; color:${selectedBoard === board ? '#ffffff' : '#334155'};">
                ${board}
              </button>
            `).join('')}
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <label for="exam-subject-select" style="font-size:0.8rem; font-weight:800; color:#475569;">Subject:</label>
            <select id="exam-subject-select" style="padding:5px 10px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.82rem; font-weight:600;">
              ${examSubjects.map((sub) => `<option value="${escapeHtml(sub)}" ${selectedSubject === sub ? 'selected' : ''}>${escapeHtml(sub)}</option>`).join('')}
            </select>
          </div>
        </div>

        <button type="button" id="btn-toggle-command-guide" style="padding:6px 14px; border-radius:8px; border:1px solid #0284c7; background:${showCommandGuide ? '#0284c7' : '#eff6ff'}; color:${showCommandGuide ? '#ffffff' : '#0369a1'}; font-size:0.8rem; font-weight:700; cursor:pointer;">
          📘 ${showCommandGuide ? 'Hide' : 'Show'} UK Command-Word Guide
        </button>
      </section>

      ${showCommandGuide ? `
        <section style="background:#0f172a; color:#f8fafc; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem; border:1px solid #1e293b;">
          <h2 style="font-size:1.1rem; font-weight:800; margin:0 0 10px 0; color:#38bdf8;">
            UK GCSE Command Words — How Examiners Award Full Marks
          </h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
            ${UK_COMMAND_WORDS.map((cw) => `
              <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:10px 12px;">
                <strong style="color:#fde047; font-size:0.9rem; display:block; margin-bottom:4px;">${escapeHtml(cw.word)}</strong>
                <p style="font-size:0.8rem; color:#e2e8f0; margin:0 0 6px 0; line-height:1.45;">${escapeHtml(cw.meaning)}</p>
                <div style="font-size:0.76rem; color:#94a3b8; line-height:1.4;"><strong>Full-mark tip:</strong> ${escapeHtml(cw.howToScoreFullMarks)}</div>
                <div style="font-size:0.74rem; color:#38bdf8; margin-top:4px;">Starter: <em>${escapeHtml(cw.starterPhrase)}</em></div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${questions.map((q) => {
          const draft = examDrafts[q.id] || { text: '', checkedMarkIds: [], tutorFeedback: '' };
          const isModelOpen = revealedModels.has(q.id);
          const isStarterOpen = revealedStarters.has(q.id);
          const isChecking = checkingQuestionIds.has(q.id);
          const toastMsg = recordedToastMap.get(q.id) || '';

          return `
            <article class="exam-question-card" data-qid="${escapeHtml(q.id)}" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:16px; padding:1.5rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
                <div>
                  <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
                    <span style="font-size:0.72rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:999px;">
                      ${escapeHtml(q.subject)}
                    </span>
                    <span style="font-size:0.72rem; font-weight:800; background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:999px;">
                      ${q.marks} Marks &bull; ${escapeHtml(q.commandWord)}
                    </span>
                    <span style="font-size:0.72rem; font-weight:700; background:#f1f5f9; color:#334155; padding:2px 8px; border-radius:999px;">
                      ${q.boards.join(' / ')}
                    </span>
                    <span style="font-size:0.72rem; color:#64748b; font-weight:600;">
                      ${escapeHtml(q.paperHint)} &bull; ${escapeHtml(q.tier)}
                    </span>
                  </div>
                  <h2 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0;">
                    ${escapeHtml(q.topicTitle)}
                  </h2>
                </div>

                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <button type="button" class="exam-speak-btn" data-qid="${escapeHtml(q.id)}" style="padding:6px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; color:#334155; font-size:0.78rem; font-weight:700; cursor:pointer;">
                    🔊 Read Aloud + BSL
                  </button>
                  ${q.simPresetId ? `
                    <a href="${base}player?preset=${encodeURIComponent(q.simPresetId)}" style="padding:6px 12px; border-radius:6px; background:#0284c7; color:#ffffff; text-decoration:none; font-size:0.78rem; font-weight:700;">
                      🎮 Open Linked Lab &rarr;
                    </a>
                  ` : ''}
                </div>
              </div>

              <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:12px 16px; border-radius:0 10px 10px 0; margin-bottom:12px;">
                <p style="font-size:0.98rem; color:#0f172a; font-weight:600; margin:0; line-height:1.55;">
                  ${escapeHtml(q.prompt)}
                </p>
                ${q.contextNote ? `
                  <p style="font-size:0.78rem; color:#475569; margin:6px 0 0 0;">${escapeHtml(q.contextNote)}</p>
                ` : ''}
              </div>

              <!-- Starter toggle + Textarea -->
              <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
                  <label for="exam-textarea-${escapeHtml(q.id)}" style="font-size:0.8rem; font-weight:700; color:#334155;">
                    Your Extended Response (${draft.text.trim() ? draft.text.trim().split(/\s+/).length : 0} words)
                  </label>
                  <button type="button" class="exam-starter-btn" data-qid="${escapeHtml(q.id)}" style="background:none; border:none; color:#0284c7; font-size:0.78rem; font-weight:700; cursor:pointer; padding:0;">
                    💡 ${isStarterOpen ? 'Hide Sentence Starter' : 'Need a Sentence Starter?'}
                  </button>
                </div>

                ${isStarterOpen ? `
                  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:8px 12px; margin-bottom:8px; font-size:0.82rem; color:#1e3a8a;">
                    <strong>Sentence Starter:</strong> ${escapeHtml(q.sentenceStarter)}
                  </div>
                ` : ''}

                <textarea
                  id="exam-textarea-${escapeHtml(q.id)}"
                  class="exam-draft-textarea"
                  data-qid="${escapeHtml(q.id)}"
                  rows="4"
                  placeholder="Write your full GCSE answer here before checking the mark scheme..."
                  style="width:100%; box-sizing:border-box; padding:10px 12px; border-radius:10px; border:1.5px solid #cbd5e1; font-family:inherit; font-size:0.9rem; line-height:1.5; color:#0f172a; resize:vertical;"
                >${escapeHtml(draft.text)}</textarea>
              </div>

              <!-- Tutor / Mark Actions -->
              <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;">
                <button type="button" class="exam-check-nano-btn" data-qid="${escapeHtml(q.id)}" ${isChecking ? 'disabled' : ''} style="padding:8px 14px; border-radius:8px; border:1px solid #7c3aed; background:#7c3aed; color:#ffffff; font-size:0.82rem; font-weight:700; cursor:pointer;">
                  ${isChecking ? '⏳ Checking against mark scheme...' : '🤖 Check My Answer Against Mark Scheme'}
                </button>
                <button type="button" class="exam-model-btn" data-qid="${escapeHtml(q.id)}" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.82rem; font-weight:700; cursor:pointer;">
                  ${isModelOpen ? '🙈 Hide Model Full-Mark Answer' : '📄 Reveal Model Full-Mark Answer'}
                </button>
                <button type="button" class="exam-save-jotter-btn" data-qid="${escapeHtml(q.id)}" style="padding:8px 14px; border-radius:8px; border:1px solid #059669; background:#ecfdf5; color:#065f46; font-size:0.82rem; font-weight:700; cursor:pointer;">
                  💾 Save Marks (${draft.checkedMarkIds.length}/${q.marks}) &amp; Log to Jotter
                </button>
              </div>

              ${draft.tutorFeedback ? `
                <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:0.84rem; color:#4c1d95; white-space:pre-line; line-height:1.5;">
                  ${escapeHtml(draft.tutorFeedback)}
                </div>
              ` : ''}

              ${toastMsg ? `
                <div style="background:#dcfce7; border:1px solid #86efac; border-radius:8px; padding:8px 12px; margin-bottom:12px; font-size:0.82rem; color:#166534; font-weight:700;">
                  ${escapeHtml(toastMsg)}
                </div>
              ` : ''}

              <!-- Interactive Self-Mark Checklist -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                  <strong style="font-size:0.82rem; color:#0f172a; text-transform:uppercase; letter-spacing:0.04em;">
                    ✓ Official Mark-Scheme Self-Check (${draft.checkedMarkIds.length} / ${q.marks} Marks)
                  </strong>
                  <span style="font-size:0.75rem; color:#64748b;">Tick each point clearly explained in your answer</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${q.markPoints.map((pt) => {
                    const checked = draft.checkedMarkIds.includes(pt.id);
                    return `
                      <label style="display:flex; align-items:flex-start; gap:8px; padding:6px 8px; border-radius:6px; background:${checked ? '#dcfce7' : '#ffffff'}; border:1px solid ${checked ? '#86efac' : '#e2e8f0'}; cursor:pointer; font-size:0.84rem; color:#1e293b;">
                        <input type="checkbox" class="exam-mark-checkbox" data-qid="${escapeHtml(q.id)}" data-mid="${escapeHtml(pt.id)}" ${checked ? 'checked' : ''} style="margin-top:3px; cursor:pointer;" />
                        <span><strong>${escapeHtml(pt.markLabel)}:</strong> ${escapeHtml(pt.criterion)}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>

              ${isModelOpen ? `
                <div style="margin-top:12px; background:#0f172a; color:#f8fafc; border-radius:10px; padding:12px 16px;">
                  <div style="font-size:0.76rem; font-weight:800; color:#4ade80; text-transform:uppercase; margin-bottom:4px;">
                    Full-Mark Model Response (${q.marks}/${q.marks})
                  </div>
                  <p style="font-size:0.88rem; color:#e2e8f0; margin:0 0 8px 0; line-height:1.55; white-space:pre-line;">
                    ${escapeHtml(q.modelAnswer)}
                  </p>
                  <div style="font-size:0.78rem; color:#fde047; border-top:1px solid #334155; padding-top:6px;">
                    <strong>Examiner Tip:</strong> ${escapeHtml(q.examinerTip)}
                  </div>
                </div>
              ` : ''}
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderFlashcardsSection(): string {
    const cards = getFilteredFlashcards();
    if (cardIndex >= cards.length) cardIndex = 0;
    const current = cards[cardIndex];
    const deckStages = ['All', ...Array.from(new Set(allFlashcards.map((c) => c.stage)))];

    return `
      <!-- Flashcard Controls -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.15rem 1.35rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <label for="fc-deck-select" style="font-size:0.8rem; font-weight:800; color:#475569;">Deck:</label>
            <select id="fc-deck-select" style="padding:6px 10px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.84rem; font-weight:600;">
              <option value="gcse-science-equations" ${flashcardDeckFilter === 'gcse-science-equations' ? 'selected' : ''}>🔬 GCSE Science Equations &amp; Facts</option>
              <option value="catholic-theology" ${flashcardDeckFilter === 'catholic-theology' ? 'selected' : ''}>✝️ GCSE Catholic Christianity Terms</option>
              <option value="mfl-core-vocab" ${flashcardDeckFilter === 'mfl-core-vocab' ? 'selected' : ''}>🌍 MFL Spanish &amp; French Phrases</option>
              <option value="curriculum-mesh" ${flashcardDeckFilter === 'curriculum-mesh' ? 'selected' : ''}>📚 All Curriculum Key Ideas (KS1–KS4)</option>
              <option value="all" ${flashcardDeckFilter === 'all' ? 'selected' : ''}>🌟 Every Flashcard</option>
            </select>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <label for="fc-stage-select" style="font-size:0.8rem; font-weight:800; color:#475569;">Key Stage:</label>
            <select id="fc-stage-select" style="padding:6px 10px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.84rem; font-weight:600;">
              ${deckStages.map((s) => `<option value="${escapeHtml(s)}" ${flashcardStageFilter === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
            </select>
          </div>

          <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.8rem; font-weight:700; color:#0369a1; cursor:pointer;">
            <input type="checkbox" id="fc-hide-mastered" ${hideMasteredCards ? 'checked' : ''} />
            <span>Hide "Got It" Cards</span>
          </label>
        </div>

        <button type="button" id="fc-reset-mastery" style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#475569; font-size:0.78rem; font-weight:700; cursor:pointer;">
          ↺ Reset Card Progress
        </button>
      </section>

      ${!current ? `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:3rem 1.5rem; text-align:center;">
          <div style="font-size:2.2rem; margin-bottom:8px;">🎉</div>
          <h2 style="margin:0 0 6px 0; font-size:1.3rem; color:#0f172a;">All cards in this filter marked "Got It"!</h2>
          <p style="margin:0 0 1rem 0; color:#64748b; font-size:0.9rem;">Uncheck "Hide Got It Cards" or switch decks to keep revising.</p>
          <button type="button" id="fc-show-all-btn" style="padding:8px 16px; border-radius:8px; border:none; background:#0284c7; color:#ffffff; font-weight:700; cursor:pointer;">
            Show All Cards Again
          </button>
        </div>
      ` : `
        <div style="max-width:720px; margin:0 auto;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:0.84rem; color:#475569; font-weight:700;">
            <span>Card ${cardIndex + 1} of ${cards.length} &bull; ${escapeHtml(current.subject)} (${escapeHtml(current.stage)})</span>
            <span>${masteredIds.has(current.id) ? '✅ Marked Got It' : '📖 Active Recall'}</span>
          </div>

          <div
            id="flashcard-surface"
            role="button"
            tabindex="0"
            aria-label="Flip flashcard"
            style="background:${isCardFlipped ? '#0f172a' : '#ffffff'}; color:${isCardFlipped ? '#f8fafc' : '#0f172a'}; border:2px solid ${isCardFlipped ? '#0284c7' : '#cbd5e1'}; border-radius:18px; padding:2.5rem 2rem; min-height:240px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer; box-shadow:0 8px 24px rgba(15,23,42,0.08); transition:background 0.15s ease;"
          >
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <span style="font-size:0.74rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:${isCardFlipped ? '#38bdf8' : '#0284c7'};">
                ${isCardFlipped ? 'ANSWER / EXPLANATION' : 'QUESTION / PROMPT'}
              </span>
              ${current.boards ? `
                <span style="font-size:0.72rem; font-weight:700; background:${isCardFlipped ? '#1e293b' : '#f1f5f9'}; color:${isCardFlipped ? '#cbd5e1' : '#475569'}; padding:2px 8px; border-radius:999px;">
                  ${current.boards.join(' / ')}
                </span>
              ` : ''}
            </div>

            <div style="font-size:1.3rem; font-weight:800; line-height:1.5; margin:1.25rem 0; white-space:pre-line;">
              ${escapeHtml(isCardFlipped ? current.back : current.front)}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <span style="font-size:0.78rem; color:${isCardFlipped ? '#94a3b8' : '#64748b'};">
                Click card (or press Space) to flip ${isCardFlipped ? 'back to question' : 'for answer'}
              </span>
              ${(!isCardFlipped && current.clue && showCardClue) ? `
                <span style="font-size:0.8rem; color:#b45309; background:#fef3c7; padding:3px 10px; border-radius:6px; font-weight:600;">
                  💡 Clue: ${escapeHtml(current.clue)}
                </span>
              ` : ''}
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:1rem;">
            <div style="display:flex; gap:8px;">
              <button type="button" id="fc-prev-btn" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; cursor:pointer;">
                &larr; Prev
              </button>
              <button type="button" id="fc-speak-btn" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:700; cursor:pointer;">
                🔊 Read Aloud + BSL
              </button>
              ${(!isCardFlipped && current.clue) ? `
                <button type="button" id="fc-clue-btn" style="padding:8px 12px; border-radius:8px; border:1px solid #fde68a; background:#fffbeb; color:#92400e; font-weight:700; cursor:pointer;">
                  💡 Clue
                </button>
              ` : ''}
            </div>

            <div style="display:flex; gap:8px;">
              <button type="button" id="fc-again-btn" style="padding:8px 14px; border-radius:8px; border:1px solid #fca5a5; background:#fef2f2; color:#991b1b; font-weight:700; cursor:pointer;">
                🔁 Practise Again
              </button>
              <button type="button" id="fc-gotit-btn" style="padding:8px 16px; border-radius:8px; border:none; background:#16a34a; color:#ffffff; font-weight:800; cursor:pointer;">
                ✓ Got It
              </button>
            </div>
          </div>
        </div>
      `}
    `;
  }

  function renderDictationSection(): string {
    const items = getFilteredDictation();
    if (dictationIndex >= items.length) dictationIndex = 0;
    const item = items[dictationIndex];
    const deckOptions = [
      { id: 'all', title: '🌟 All Audio Spelling Decks' },
      { id: 'science-spelling', title: '🔬 Science Key Terms (KS2–GCSE)' },
      { id: 'catholic-spelling', title: '✝️ Catholic RE & Liturgy Vocabulary' },
      { id: 'primary-spelling', title: '📖 KS2 Statutory Spelling' },
      { id: 'mfl-dictation', title: '🌍 MFL Listen & Type (Spanish & French)' },
    ];

    return `
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.15rem 1.35rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <label for="dic-deck-select" style="font-size:0.82rem; font-weight:800; color:#475569;">Spelling Deck:</label>
          <select id="dic-deck-select" style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.84rem; font-weight:600;">
            ${deckOptions.map((d) => `<option value="${d.id}" ${dictationDeckId === d.id ? 'selected' : ''}>${d.title}</option>`).join('')}
          </select>
        </div>
        <div style="font-size:0.86rem; font-weight:800; color:#166534; background:#dcfce7; border:1px solid #86efac; padding:5px 12px; border-radius:999px;">
          🎧 Dictation Score: ${dictationScore} pts
        </div>
      </section>

      ${item ? `
        <div style="max-width:700px; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:18px; padding:2rem; box-shadow:0 4px 16px rgba(15,23,42,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <span style="font-size:0.78rem; font-weight:800; color:#0284c7; text-transform:uppercase;">
              ${escapeHtml(item.deckTitle)} &bull; Word ${dictationIndex + 1} of ${items.length}
            </span>
            <span style="font-size:0.74rem; font-weight:700; color:#475569; background:#f1f5f9; padding:2px 8px; border-radius:999px;">
              ${escapeHtml(item.subject)} (${escapeHtml(item.stage)})
            </span>
          </div>

          <p style="font-size:0.95rem; color:#334155; margin:0 0 1rem 0; line-height:1.5;">
            Press <strong>Play Audio</strong>, listen carefully to the word or sentence, then type the exact spelling below.
          </p>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:1.25rem;">
            <button type="button" id="dic-play-word-btn" style="padding:10px 16px; border-radius:8px; border:none; background:#0284c7; color:#ffffff; font-weight:800; font-size:0.88rem; cursor:pointer;">
              🔊 Play Word
            </button>
            <button type="button" id="dic-play-sentence-btn" style="padding:10px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:700; font-size:0.86rem; cursor:pointer;">
              🗣️ Hear in Sentence
            </button>
            <button type="button" id="dic-clue-btn" style="padding:10px 14px; border-radius:8px; border:1px solid #fde68a; background:#fffbeb; color:#92400e; font-weight:700; font-size:0.84rem; cursor:pointer;">
              💡 ${dictationShowClue ? 'Hide Clue' : 'Show Spelling Clue'}
            </button>
          </div>

          ${dictationShowClue ? `
            <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:8px 12px; margin-bottom:1rem; font-size:0.84rem; color:#78350f;">
              <strong>Clue:</strong> ${escapeHtml(item.clue)}
            </div>
          ` : ''}

          <form id="dic-check-form" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1rem;">
            <input
              type="text"
              id="dic-answer-input"
              value="${escapeHtml(dictationInputValue)}"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="Type what you heard..."
              style="flex:1; min-width:220px; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:1rem; font-weight:700; color:#0f172a;"
            />
            <button type="submit" style="padding:10px 18px; border-radius:8px; border:none; background:#16a34a; color:#ffffff; font-weight:800; font-size:0.9rem; cursor:pointer;">
              Check Spelling
            </button>
          </form>

          ${dictationFeedback ? `
            <div style="background:${dictationFeedback.ok ? '#dcfce7' : '#fee2e2'}; border:1px solid ${dictationFeedback.ok ? '#86efac' : '#fca5a5'}; color:${dictationFeedback.ok ? '#166534' : '#991b1b'}; border-radius:10px; padding:10px 14px; font-size:0.88rem; font-weight:700; margin-bottom:1rem;">
              ${escapeHtml(dictationFeedback.msg)}
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #f1f5f9;">
            <button type="button" id="dic-prev-btn" style="padding:7px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; cursor:pointer;">
              &larr; Previous Word
            </button>
            <button type="button" id="dic-next-btn" style="padding:7px 16px; border-radius:8px; border:1px solid #0284c7; background:#eff6ff; color:#0369a1; font-weight:700; cursor:pointer;">
              Next Word &rarr;
            </button>
          </div>
        </div>
      ` : ''}
    `;
  }

  function render() {
    container.innerHTML = `
      ${renderHeader()}
      ${activeTab === 'exam' ? renderExamSection() : activeTab === 'flashcards' ? renderFlashcardsSection() : renderDictationSection()}
    `;

    // Main tab bindings
    container.querySelector('#rev-tab-exam')?.addEventListener('click', () => {
      activeTab = 'exam';
      render();
    });
    container.querySelector('#rev-tab-flashcards')?.addEventListener('click', () => {
      activeTab = 'flashcards';
      render();
    });
    container.querySelector('#rev-tab-dictation')?.addEventListener('click', () => {
      activeTab = 'dictation';
      render();
    });

    if (activeTab === 'exam') {
      container.querySelectorAll('.exam-board-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const b = btn.getAttribute('data-board') || 'All';
          selectedBoard = b === 'AQA' || b === 'Edexcel' || b === 'OCR' ? b : 'All';
          render();
        });
      });

      const subSel = container.querySelector<HTMLSelectElement>('#exam-subject-select');
      subSel?.addEventListener('change', () => {
        selectedSubject = subSel.value || 'All';
        render();
      });

      container.querySelector('#btn-toggle-command-guide')?.addEventListener('click', () => {
        showCommandGuide = !showCommandGuide;
        render();
      });

      container.querySelectorAll('.exam-speak-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qid = btn.getAttribute('data-qid') || '';
          const q = GCSE_EXAM_QUESTIONS.find((item) => item.id === qid);
          if (q) speakText(`${q.topicTitle}. ${q.prompt}`);
        });
      });

      container.querySelectorAll('.exam-starter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qid = btn.getAttribute('data-qid') || '';
          if (revealedStarters.has(qid)) revealedStarters.delete(qid);
          else revealedStarters.add(qid);
          render();
        });
      });

      container.querySelectorAll('.exam-model-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qid = btn.getAttribute('data-qid') || '';
          if (revealedModels.has(qid)) revealedModels.delete(qid);
          else revealedModels.add(qid);
          render();
        });
      });

      container.querySelectorAll<HTMLTextAreaElement>('.exam-draft-textarea').forEach((ta) => {
        ta.addEventListener('input', () => {
          const qid = ta.getAttribute('data-qid') || '';
          const cur = examDrafts[qid] || { text: '', checkedMarkIds: [], tutorFeedback: '' };
          cur.text = ta.value;
          examDrafts[qid] = cur;
          saveExamDrafts(examDrafts);
        });
      });

      container.querySelectorAll<HTMLInputElement>('.exam-mark-checkbox').forEach((chk) => {
        chk.addEventListener('change', () => {
          const qid = chk.getAttribute('data-qid') || '';
          const mid = chk.getAttribute('data-mid') || '';
          const cur = examDrafts[qid] || { text: '', checkedMarkIds: [], tutorFeedback: '' };
          const set = new Set(cur.checkedMarkIds);
          if (chk.checked) set.add(mid);
          else set.delete(mid);
          cur.checkedMarkIds = Array.from(set);
          examDrafts[qid] = cur;
          saveExamDrafts(examDrafts);
          render();
        });
      });

      container.querySelectorAll('.exam-check-nano-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const qid = btn.getAttribute('data-qid') || '';
          const q = GCSE_EXAM_QUESTIONS.find((item) => item.id === qid);
          if (!q) return;
          const cur = examDrafts[qid] || { text: '', checkedMarkIds: [], tutorFeedback: '' };
          if (!cur.text.trim()) {
            cur.tutorFeedback = 'Write at least a couple of sentences first, then check against the mark scheme!';
            examDrafts[qid] = cur;
            saveExamDrafts(examDrafts);
            render();
            return;
          }
          checkingQuestionIds.add(qid);
          render();

          const res = await runTutorMarkSchemeCheck(q, cur.text);
          checkingQuestionIds.delete(qid);
          const merged = new Set([...cur.checkedMarkIds, ...res.matchedIds]);
          cur.checkedMarkIds = Array.from(merged);
          cur.tutorFeedback = res.feedback;
          examDrafts[qid] = cur;
          saveExamDrafts(examDrafts);
          if (res.matchedIds.length >= Math.ceil(q.marks / 2)) playSuccessChime();
          else playClickTone();
          render();
        });
      });

      container.querySelectorAll('.exam-save-jotter-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const qid = btn.getAttribute('data-qid') || '';
          const q = GCSE_EXAM_QUESTIONS.find((item) => item.id === qid);
          if (!q) return;
          const cur = examDrafts[qid] || { text: '', checkedMarkIds: [], tutorFeedback: '' };
          const scoreMarks = cur.checkedMarkIds.length;
          const passed = scoreMarks >= Math.ceil(q.marks * 0.6);

          await recordAssessmentAttempt({
            challengeId: q.id,
            topicId: `ks4:${q.subject.toLowerCase().replace(/[^a-z0-9]+/g, '')}:${q.topicId}`,
            isCorrect: passed,
            userAnswer: `${scoreMarks}/${q.marks} marks (${cur.text.slice(0, 80)})`,
          });

          await appendJotter({
            sessionId: `exam-${q.id}`,
            nodePath: `ks4/${q.subject.toLowerCase()}/${q.topicId}`,
            actor: 'student',
            payload: `Exam Practice (${q.boards.join('/')}) ${scoreMarks}/${q.marks}: ${cur.text || '(self-marked)'}`,
          }).catch(() => {});

          recordedToastMap.set(qid, `Saved ${scoreMarks}/${q.marks} marks to your Student Passport & Jotter!`);
          playSuccessChime();
          render();
        });
      });
    } else if (activeTab === 'flashcards') {
      const deckSel = container.querySelector<HTMLSelectElement>('#fc-deck-select');
      deckSel?.addEventListener('change', () => {
        flashcardDeckFilter = deckSel.value;
        cardIndex = 0;
        isCardFlipped = false;
        showCardClue = false;
        render();
      });

      const stageSel = container.querySelector<HTMLSelectElement>('#fc-stage-select');
      stageSel?.addEventListener('change', () => {
        flashcardStageFilter = stageSel.value;
        cardIndex = 0;
        isCardFlipped = false;
        showCardClue = false;
        render();
      });

      const hideChk = container.querySelector<HTMLInputElement>('#fc-hide-mastered');
      hideChk?.addEventListener('change', () => {
        hideMasteredCards = hideChk.checked;
        cardIndex = 0;
        isCardFlipped = false;
        render();
      });

      container.querySelector('#fc-show-all-btn')?.addEventListener('click', () => {
        hideMasteredCards = false;
        cardIndex = 0;
        render();
      });

      container.querySelector('#fc-reset-mastery')?.addEventListener('click', () => {
        masteredIds.clear();
        saveMasteredCardIds(masteredIds);
        hideMasteredCards = false;
        cardIndex = 0;
        isCardFlipped = false;
        render();
      });

      const cards = getFilteredFlashcards();
      const current = cards[cardIndex];
      const flipAction = () => {
        isCardFlipped = !isCardFlipped;
        playClickTone();
        render();
      };

      const surface = container.querySelector('#flashcard-surface');
      surface?.addEventListener('click', flipAction);
      surface?.addEventListener('keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === ' ' || ke.key === 'Enter') {
          ke.preventDefault();
          flipAction();
        }
      });

      container.querySelector('#fc-prev-btn')?.addEventListener('click', () => {
        if (!cards.length) return;
        cardIndex = (cardIndex - 1 + cards.length) % cards.length;
        isCardFlipped = false;
        showCardClue = false;
        render();
      });

      container.querySelector('#fc-speak-btn')?.addEventListener('click', () => {
        if (!current) return;
        speakText(isCardFlipped ? current.back : current.front, !isCardFlipped && current.speechLang ? current.speechLang : 'en-GB');
      });

      container.querySelector('#fc-clue-btn')?.addEventListener('click', () => {
        showCardClue = !showCardClue;
        render();
      });

      container.querySelector('#fc-again-btn')?.addEventListener('click', () => {
        if (!cards.length || !current) return;
        masteredIds.delete(current.id);
        saveMasteredCardIds(masteredIds);
        cardIndex = (cardIndex + 1) % cards.length;
        isCardFlipped = false;
        showCardClue = false;
        playClickTone();
        render();
      });

      container.querySelector('#fc-gotit-btn')?.addEventListener('click', () => {
        if (!cards.length || !current) return;
        const firstMaster = !masteredIds.has(current.id);
        masteredIds.add(current.id);
        saveMasteredCardIds(masteredIds);
        if (firstMaster) {
          void recordAssessmentAttempt({
            challengeId: current.id,
            topicId: `flashcards:${current.subject.toLowerCase().replace(/[^a-z0-9]+/g, '')}`,
            isCorrect: true,
            userAnswer: 'Got It',
          });
        }
        playSuccessChime();
        cardIndex = hideMasteredCards ? cardIndex : (cardIndex + 1) % cards.length;
        isCardFlipped = false;
        showCardClue = false;
        render();
      });
    } else {
      const dicSel = container.querySelector<HTMLSelectElement>('#dic-deck-select');
      dicSel?.addEventListener('change', () => {
        dictationDeckId = dicSel.value;
        dictationIndex = 0;
        dictationInputValue = '';
        dictationFeedback = null;
        dictationShowClue = false;
        render();
      });

      const items = getFilteredDictation();
      const item = items[dictationIndex];

      container.querySelector('#dic-play-word-btn')?.addEventListener('click', () => {
        if (item) speakText(item.word, item.speechLang);
      });
      container.querySelector('#dic-play-sentence-btn')?.addEventListener('click', () => {
        if (item) speakText(item.spokenSentence, item.speechLang);
      });
      container.querySelector('#dic-clue-btn')?.addEventListener('click', () => {
        dictationShowClue = !dictationShowClue;
        render();
      });

      const inputEl = container.querySelector<HTMLInputElement>('#dic-answer-input');
      inputEl?.addEventListener('input', () => {
        dictationInputValue = inputEl.value;
      });

      container.querySelector('#dic-check-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!item) return;
        const guess = (inputEl?.value ?? dictationInputValue).trim().toLowerCase();
        const targets = [item.word, ...(item.acceptableVariants || [])].map((t) => t.toLowerCase());
        const isCorrect = targets.includes(guess);

        if (isCorrect) {
          playSuccessChime();
          const isNew = !dictationSolved.has(item.id);
          if (isNew) {
            dictationSolved.add(item.id);
            dictationScore += 10;
            void recordAssessmentAttempt({
              challengeId: item.id,
              topicId: `dictation:${item.subject.toLowerCase().replace(/[^a-z0-9]+/g, '')}`,
              isCorrect: true,
              userAnswer: guess,
            });
          }
          dictationFeedback = { ok: true, msg: `🎉 Correct! "${item.word}" is spelt accurately.` };
        } else {
          playIncorrectTone();
          dictationFeedback = {
            ok: false,
            msg: `Not quite (${guess || 'blank'}). Target spelling: "${item.word}". Look closely at the letters and try the next word or retry!`,
          };
        }
        render();
      });

      container.querySelector('#dic-prev-btn')?.addEventListener('click', () => {
        if (!items.length) return;
        dictationIndex = (dictationIndex - 1 + items.length) % items.length;
        dictationInputValue = '';
        dictationFeedback = null;
        dictationShowClue = false;
        render();
      });

      container.querySelector('#dic-next-btn')?.addEventListener('click', () => {
        if (!items.length) return;
        dictationIndex = (dictationIndex + 1) % items.length;
        dictationInputValue = '';
        dictationFeedback = null;
        dictationShowClue = false;
        render();
      });
    }
  }

  render();
  return container;
}

export default renderRevisionSuitePage;
