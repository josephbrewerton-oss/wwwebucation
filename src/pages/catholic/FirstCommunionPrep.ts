// src/pages/catholic/FirstCommunionPrep.ts
// St Joseph's Catholic Life & Faith Sanctuary
// First Holy Communion & First Reconciliation Catechesis Hub (Zero React, 100% Air-Gapped)

import {
  CATHOLIC_PRAYERS,
  SACRAMENTS_QUIZ_QUESTIONS,
  CATHOLIC_KS2_KNOWLEDGE,
} from '../../data/catholic';
import { broadcastBslSpeech } from '../../services/bslGlobalStore';

const READINESS_STORAGE_KEY = 'stj_fhc_readiness_v1';

interface ReadinessMilestone {
  id: string;
  label: string;
  detail: string;
}

const READINESS_MILESTONES: ReadinessMilestone[] = [
  {
    id: 'sign-of-cross',
    label: 'Daily Prayers & Sign of the Cross',
    detail: 'I can pray the Sign of the Cross, Our Father, Hail Mary, and Glory Be reverently.',
  },
  {
    id: 'act-of-contrition',
    label: 'The Act of Contrition',
    detail: 'I know how to say sorry to Jesus with my own words and pray the Act of Contrition.',
  },
  {
    id: 'first-confession',
    label: 'Ready for First Reconciliation',
    detail: 'I understand the 4 gentle steps of Confession and God’s loving mercy.',
  },
  {
    id: 'real-presence',
    label: 'Faith in the Real Presence',
    detail: 'I believe Jesus is truly present in the consecrated Host — Body, Blood, Soul, and Divinity.',
  },
  {
    id: 'eucharistic-fast',
    label: 'The 1-Hour Eucharistic Fast',
    detail: 'I remember not to eat or drink (except water and medicine) for 1 hour before receiving Communion.',
  },
  {
    id: 'reverent-reception',
    label: 'Bow, "Amen!", Throne & Thanksgiving',
    detail: 'I know to bow my head, answer "Amen!", receive reverently, and kneel in quiet thanksgiving.',
  },
];

interface ConfessionStep {
  step: number;
  title: string;
  whoSpeaks: string;
  words: string;
  childTip: string;
}

const CONFESSION_WALKTHROUGH: ConfessionStep[] = [
  {
    step: 1,
    title: 'Welcome & Sign of the Cross',
    whoSpeaks: 'Together with Father',
    words: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen. Bless me, Father, for I have sinned. This is my first Confession (or it has been [time] since my last Confession).',
    childTip: 'Take a calm breath. Jesus is the Good Shepherd who is joyful to welcome and forgive you.',
  },
  {
    step: 2,
    title: 'Honest Confession & Listening',
    whoSpeaks: 'You & Father',
    words: 'Tell Father honestly the unloving choices or sins you thought about during your Examination of Conscience. Father listens kindly and gives you a small prayer or kind deed (a Penance).',
    childTip: 'Father is bound by the sacred Seal of Confession and can never tell anyone what you share.',
  },
  {
    step: 3,
    title: 'The Act of Contrition (Saying Sorry)',
    whoSpeaks: 'You',
    words: 'O my God, I thank you for loving me. I am sorry for all my sins, for not loving others and not loving you. Help me to live like Jesus and not sin again. Amen.',
    childTip: 'Speak slowly from your heart — telling Jesus you are truly sorry and want to try again.',
  },
  {
    step: 4,
    title: 'God’s Forgiveness (Absolution) & Thanksgiving',
    whoSpeaks: 'Father (in Jesus’ Name)',
    words: '"...I absolve you from your sins in the name of the Father, and of the Son, and of the Holy Spirit." You answer: "Amen!" Father says: "Go in peace."',
    childTip: 'Go back to your pew, kneel quietly, pray your penance, and thank Jesus for a bright, clean heart!',
  },
];

interface ExaminationPrompt {
  id: string;
  group: 'Loving God' | 'Loving Family & Friends' | 'Truth & Heart';
  question: string;
}

const EXAMINATION_PROMPTS: ExaminationPrompt[] = [
  { id: 'ex-pray', group: 'Loving God', question: 'Did I forget to pray to God morning or night, or talk during Mass instead of listening to Jesus?' },
  { id: 'ex-name', group: 'Loving God', question: 'Did I use God’s or Jesus’ holy name carelessly or in anger?' },
  { id: 'ex-parents', group: 'Loving Family & Friends', question: 'Was I disobedient, rude, or impatient with my parents, grandparents, or teachers?' },
  { id: 'ex-kind', group: 'Loving Family & Friends', question: 'Did I leave someone out at playtime, say hurtful words, or refuse to forgive?' },
  { id: 'ex-truth', group: 'Truth & Heart', question: 'Did I tell a lie, take something that was not mine, or blame someone else for my mistake?' },
  { id: 'ex-share', group: 'Truth & Heart', question: 'Was I greedy, jealous, or unwilling to share and help at home or school?' },
];

type QuizCategory = 'All' | 'Seven Sacraments' | 'First Confession' | 'Last Supper & Real Presence' | 'Receiving at Mass';

interface UnifiedQuizQuestion {
  id: string;
  category: Exclude<QuizCategory, 'All'>;
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildDeterministicOptions(rawOptions: string[], correctText: string, seedIndex: number): { options: string[]; correctIndex: number } {
  const unique = Array.from(new Set(rawOptions));
  const len = unique.length;
  if (len <= 1) return { options: unique, correctIndex: 0 };
  const shift = ((seedIndex * 3) + 1) % len;
  const rotated = unique.map((_, idx) => unique[(idx + shift) % len]);
  const correctIndex = Math.max(0, rotated.indexOf(correctText));
  return { options: rotated, correctIndex };
}

function buildUnifiedQuizDeck(): UnifiedQuizQuestion[] {
  const deck: UnifiedQuizQuestion[] = [];
  let seq = 0;

  SACRAMENTS_QUIZ_QUESTIONS.forEach((q, idx) => {
    const { options, correctIndex } = buildDeterministicOptions(q.options, q.correct, idx + 1);
    deck.push({
      id: `sac-q-${idx}`,
      category: 'Seven Sacraments',
      prompt: q.question,
      options,
      correctIndex,
      hint: q.hint,
      explanation: `${q.correct}. ${q.hint}`,
    });
    seq++;
  });

  const topicMap: Array<{ key: string; category: Exclude<QuizCategory, 'All'> }> = [
    { key: 'ks2:religious-education-catholic:first-reconciliation', category: 'First Confession' },
    { key: 'ks2:religious-education-catholic:the-last-supper', category: 'Last Supper & Real Presence' },
    { key: 'ks2:religious-education-catholic:first-holy-communion', category: 'Last Supper & Real Presence' },
    { key: 'ks2:religious-education-catholic:order-of-the-mass', category: 'Receiving at Mass' },
  ];

  topicMap.forEach(({ key, category }) => {
    const topic = CATHOLIC_KS2_KNOWLEDGE[key];
    if (!topic) return;
    topic.questions.forEach((q) => {
      const correctText = q.options[q.answerKey] ?? q.options[0];
      const { options, correctIndex } = buildDeterministicOptions(q.options, correctText, seq + 2);
      deck.push({
        id: q.id,
        category,
        prompt: q.prompt,
        options,
        correctIndex,
        hint: q.hint,
        explanation: q.explanation,
      });
      seq++;
    });
  });

  return deck;
}

function loadReadinessState(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(READINESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const out: Record<string, boolean> = {};
      for (const m of READINESS_MILESTONES) {
        if (parsed[m.id] === true) out[m.id] = true;
      }
      return out;
    }
  } catch {
    // Ignore unavailable storage
  }
  return {};
}

function saveReadinessState(state: Record<string, boolean>): void {
  try {
    window.localStorage.setItem(READINESS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota/private mode failures
  }
}

export function renderFirstCommunionPrep(base: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'first-communion-prep-hub';

  let readinessState: Record<string, boolean> = loadReadinessState();
  // Strictly ephemeral state — never saved to localStorage/IndexedDB for child privacy & Seal of Confession
  const ephemeralReflectionIds = new Set<string>();
  let activePrayerId: string = CATHOLIC_PRAYERS[0]?.id || 'act-of-contrition';
  let prayerSelections: Record<string, string> = {};
  let prayerChecked = false;
  let speakingTag: string | null = null;

  const fullDeck = buildUnifiedQuizDeck();
  let quizCategory: QuizCategory = 'All';
  let quizCursor = 0;
  let selectedQuizOption: number | null = null;
  let showQuizHint = false;
  let quizScore = 0;
  let answeredQuizIds = new Set<string>();

  function getFilteredDeck(): UnifiedQuizQuestion[] {
    if (quizCategory === 'All') return fullDeck;
    return fullDeck.filter((q) => q.category === quizCategory);
  }

  function stopSpeech(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    broadcastBslSpeech({ isSpeaking: false });
    speakingTag = null;
  }

  function speakText(tag: string, text: string): void {
    if (speakingTag === tag) {
      stopSpeech();
      updateView();
      return;
    }
    stopSpeech();
    broadcastBslSpeech({ subtitle: text, isSpeaking: true });
    if (!('speechSynthesis' in window)) {
      speakingTag = tag;
      updateView();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-GB';
    utter.rate = 0.9;
    speakingTag = tag;
    updateView();
    utter.onend = () => {
      broadcastBslSpeech({ isSpeaking: false });
      speakingTag = null;
      updateView();
    };
    utter.onerror = () => {
      broadcastBslSpeech({ isSpeaking: false });
      speakingTag = null;
      updateView();
    };
    window.speechSynthesis.speak(utter);
  }

  function buildClozeSegments(prayerText: string, missingWords: string[]): Array<{ type: 'text'; value: string } | { type: 'blank'; index: number; answer: string; choices: string[] }> {
    const allWordPool = Array.from(
      new Set(CATHOLIC_PRAYERS.flatMap((p) => p.missingWords))
    );
    const segments: Array<{ type: 'text'; value: string } | { type: 'blank'; index: number; answer: string; choices: string[] }> = [];
    let remaining = prayerText;

    missingWords.forEach((word, idx) => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedWord})\\b`);
      const match = regex.exec(remaining);
      if (match && match.index !== undefined) {
        if (match.index > 0) {
          segments.push({ type: 'text', value: remaining.slice(0, match.index) });
        }
        const distractors = allWordPool
          .filter((w) => w.toLowerCase() !== word.toLowerCase())
          .slice(idx % 3, (idx % 3) + 2);
        const rawChoices = Array.from(new Set([word, ...missingWords, ...distractors])).slice(0, 5);
        const rotatedChoices = rawChoices.map((_, cIdx) => rawChoices[(cIdx + idx + 1) % rawChoices.length]);
        segments.push({ type: 'blank', index: idx, answer: match[1], choices: rotatedChoices });
        remaining = remaining.slice(match.index + match[1].length);
      }
    });

    if (remaining.length > 0) {
      segments.push({ type: 'text', value: remaining });
    }
    return segments;
  }

  function renderReadinessSection(): string {
    const completedCount = READINESS_MILESTONES.filter((m) => readinessState[m.id]).length;
    const pct = Math.round((completedCount / READINESS_MILESTONES.length) * 100);

    return `
      <section style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:16px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 4px 14px rgba(15,23,42,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:1rem;">
          <div>
            <span style="font-size:0.74rem; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.06em;">KS2 Catechesis Checklist</span>
            <h3 style="font-size:1.3rem; font-weight:800; color:#0f172a; margin:2px 0 4px;">My First Holy Communion Readiness Journey</h3>
            <p style="font-size:0.86rem; color:#64748b; margin:0;">Tick each milestone as you learn it in class, at church, or at home with your family (saved only on this device).</p>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:0.85rem; font-weight:800; background:${pct === 100 ? '#dcfce7' : '#fef9c3'}; color:${pct === 100 ? '#166534' : '#854d0e'}; padding:5px 12px; border-radius:999px;">
              ${completedCount} / ${READINESS_MILESTONES.length} Ready (${pct}%)
            </span>
            <button type="button" id="fhc-reset-readiness" style="padding:5px 10px; font-size:0.76rem; font-weight:700; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; color:#475569; cursor:pointer;">
              Reset
            </button>
          </div>
        </div>

        <div style="height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden; margin-bottom:1.1rem;">
          <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, #ca8a04, #22c55e); transition:width 0.25s ease;"></div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:0.85rem;">
          ${READINESS_MILESTONES.map((m) => {
            const checked = Boolean(readinessState[m.id]);
            return `
              <label style="display:flex; align-items:flex-start; gap:10px; padding:0.9rem 1rem; border-radius:10px; border:1.5px solid ${checked ? '#22c55e' : '#e2e8f0'}; background:${checked ? '#f0fdf4' : '#f8fafc'}; cursor:pointer;">
                <input type="checkbox" class="fhc-readiness-checkbox" data-id="${escapeHtml(m.id)}" ${checked ? 'checked' : ''} style="margin-top:3px; width:16px; height:16px; accent-color:#16a34a; cursor:pointer;" />
                <span>
                  <strong style="display:block; font-size:0.9rem; color:#0f172a; margin-bottom:2px;">${escapeHtml(m.label)}</strong>
                  <span style="display:block; font-size:0.8rem; color:#475569; line-height:1.4;">${escapeHtml(m.detail)}</span>
                </span>
              </label>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderConfessionSection(): string {
    const confessionScript = CONFESSION_WALKTHROUGH.map((c) => `Step ${c.step}: ${c.title}. ${c.words}`).join(' ');
    const isPlayingConfession = speakingTag === 'confession-walkthrough';

    return `
      <section style="background:#ffffff; border:1.5px solid #c7d2fe; border-radius:16px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 4px 14px rgba(30,27,75,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:1rem;">
          <div>
            <span style="font-size:0.74rem; font-weight:800; color:#4f46e5; text-transform:uppercase; letter-spacing:0.06em;">Sacrament of Reconciliation</span>
            <h3 style="font-size:1.3rem; font-weight:800; color:#0f172a; margin:2px 0 4px;">First Confession Walkthrough &amp; Quiet Examination of Conscience</h3>
            <p style="font-size:0.86rem; color:#475569; margin:0; max-width:760px;">
              Before our First Holy Communion, Jesus welcomes us in First Confession to wash our hearts clean and fill us with peace.
            </p>
          </div>
          <button type="button" id="fhc-speak-confession" data-text="${escapeHtml(confessionScript)}" style="padding:8px 14px; border-radius:8px; border:none; background:${isPlayingConfession ? '#dc2626' : '#4f46e5'}; color:#ffffff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            ${isPlayingConfession ? '⏹ Stop Audio & BSL' : '🔊 Read Steps Aloud (BSL)'}
          </button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:0.9rem; margin-bottom:1.4rem;">
          ${CONFESSION_WALKTHROUGH.map((s) => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.74rem; font-weight:800; background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:999px;">Step ${s.step}</span>
                <span style="font-size:0.72rem; color:#64748b; font-weight:700;">${escapeHtml(s.whoSpeaks)}</span>
              </div>
              <strong style="display:block; font-size:0.94rem; color:#0f172a; margin-bottom:6px;">${escapeHtml(s.title)}</strong>
              <p style="font-size:0.82rem; color:#1e293b; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:8px; margin:0 0 8px; line-height:1.45; font-style:italic;">
                "${escapeHtml(s.words)}"
              </p>
              <div style="font-size:0.76rem; color:#4338ca; font-weight:600; line-height:1.4;">
                💡 ${escapeHtml(s.childTip)}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Private Ephemeral Examination of Conscience -->
        <div style="background:#f5f3ff; border:1.5px dashed #8b5cf6; border-radius:12px; padding:1.15rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:0.75rem;">
            <div>
              <strong style="font-size:0.96rem; color:#4c1d95; display:block;">🕊️ Quiet Examination of Conscience (Private &amp; Never Saved)</strong>
              <span style="font-size:0.78rem; color:#5b21b6;">Use these gentle questions to think quietly before Confession. Nothing ticked here is ever stored, logged, or sent anywhere.</span>
            </div>
            <button type="button" id="fhc-clear-examination" style="padding:5px 11px; font-size:0.76rem; font-weight:700; border-radius:6px; border:1px solid #c4b5fd; background:#ffffff; color:#5b21b6; cursor:pointer;">
              Clear Reflection (${ephemeralReflectionIds.size} paused)
            </button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.65rem;">
            ${EXAMINATION_PROMPTS.map((item) => {
              const ticked = ephemeralReflectionIds.has(item.id);
              return `
                <label style="display:flex; align-items:flex-start; gap:8px; background:${ticked ? '#ede9fe' : '#ffffff'}; border:1px solid ${ticked ? '#7c3aed' : '#ddd6fe'}; border-radius:8px; padding:0.7rem 0.85rem; cursor:pointer;">
                  <input type="checkbox" class="fhc-exam-checkbox" data-id="${escapeHtml(item.id)}" ${ticked ? 'checked' : ''} style="margin-top:3px; accent-color:#6d28d9; cursor:pointer;" />
                  <span>
                    <span style="display:block; font-size:0.7rem; font-weight:800; color:#6d28d9; text-transform:uppercase;">${escapeHtml(item.group)}</span>
                    <span style="display:block; font-size:0.81rem; color:#1e293b; line-height:1.4;">${escapeHtml(item.question)}</span>
                  </span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderPrayerClozeSection(): string {
    const prayer = CATHOLIC_PRAYERS.find((p) => p.id === activePrayerId) || CATHOLIC_PRAYERS[0];
    const segments = buildClozeSegments(prayer.text, prayer.missingWords);
    const blankCount = segments.filter((s) => s.type === 'blank').length;
    const correctCount = segments.filter(
      (s) => s.type === 'blank' && (prayerSelections[String(s.index)] || '').toLowerCase() === s.answer.toLowerCase()
    ).length;
    const isPlayingPrayer = speakingTag === `prayer-${prayer.id}`;

    return `
      <section style="background:#ffffff; border:1.5px solid #fde68a; border-radius:16px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 4px 14px rgba(202,138,4,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:1rem;">
          <div>
            <span style="font-size:0.74rem; font-weight:800; color:#b45309; text-transform:uppercase; letter-spacing:0.06em;">Prayer Memory Practice</span>
            <h3 style="font-size:1.3rem; font-weight:800; color:#0f172a; margin:2px 0 4px;">Fill in the Missing Prayer Words</h3>
            <p style="font-size:0.86rem; color:#64748b; margin:0;">Practise your First Reconciliation and First Holy Communion prayers word by word.</p>
          </div>
          <button type="button" id="fhc-speak-prayer" data-id="${escapeHtml(prayer.id)}" data-text="${escapeHtml(`${prayer.title}. ${prayer.text}`)}" style="padding:8px 14px; border-radius:8px; border:none; background:${isPlayingPrayer ? '#dc2626' : '#ca8a04'}; color:#ffffff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            ${isPlayingPrayer ? '⏹ Stop Prayer Audio' : '🔊 Listen & BSL Sign'}
          </button>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1rem;">
          ${CATHOLIC_PRAYERS.map((p) => `
            <button type="button" class="fhc-prayer-tab" data-id="${escapeHtml(p.id)}" style="padding:6px 12px; border-radius:999px; font-weight:700; font-size:0.78rem; cursor:pointer; border:1px solid ${p.id === prayer.id ? '#ca8a04' : '#cbd5e1'}; background:${p.id === prayer.id ? '#ca8a04' : '#f8fafc'}; color:${p.id === prayer.id ? '#ffffff' : '#334155'};">
              ${escapeHtml(p.title)}
            </button>
          `).join('')}
        </div>

        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:1.25rem; margin-bottom:1rem;">
          <div style="font-size:0.76rem; font-weight:800; color:#92400e; margin-bottom:6px;">Occasion: ${escapeHtml(prayer.occasion)}</div>
          <div style="font-size:1.03rem; color:#1e293b; line-height:2.1;">
            ${segments.map((seg) => {
              if (seg.type === 'text') return escapeHtml(seg.value);
              const val = prayerSelections[String(seg.index)] || '';
              const isRight = val.toLowerCase() === seg.answer.toLowerCase();
              let borderCol = '#ca8a04';
              let bgCol = '#ffffff';
              if (prayerChecked) {
                borderCol = isRight ? '#16a34a' : '#dc2626';
                bgCol = isRight ? '#dcfce7' : '#fee2e2';
              }
              return `
                <select class="fhc-cloze-select" data-index="${seg.index}" aria-label="Missing prayer word ${seg.index + 1}" style="display:inline-block; padding:2px 8px; margin:0 3px; border-radius:6px; border:1.5px solid ${borderCol}; background:${bgCol}; font-weight:700; color:#0f172a; font-size:0.95rem; cursor:pointer;">
                  <option value="">[ choose word ]</option>
                  ${seg.choices.map((ch) => `<option value="${escapeHtml(ch)}" ${val === ch ? 'selected' : ''}>${escapeHtml(ch)}</option>`).join('')}
                </select>
              `;
            }).join('')}
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" id="fhc-check-prayer" style="padding:8px 16px; border-radius:8px; border:none; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.84rem; cursor:pointer;">
              Check My Prayer
            </button>
            <button type="button" id="fhc-reveal-prayer" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#334155; font-weight:700; font-size:0.84rem; cursor:pointer;">
              Show Full Prayer
            </button>
            <button type="button" id="fhc-reset-prayer" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#475569; font-weight:700; font-size:0.84rem; cursor:pointer;">
              Clear Blanks
            </button>
          </div>
          ${prayerChecked ? `
            <span style="font-size:0.86rem; font-weight:800; color:${correctCount === blankCount ? '#166534' : '#b45309'};">
              ${correctCount === blankCount
                ? `🌟 Well done! All ${blankCount} words match the prayer!`
                : `You have ${correctCount} of ${blankCount} words right — keep trying!`}
            </span>
          ` : ''}
        </div>
      </section>
    `;
  }

  function renderQuizSection(): string {
    const deck = getFilteredDeck();
    const safeIdx = deck.length > 0 ? Math.min(quizCursor, deck.length - 1) : 0;
    const q = deck[safeIdx];
    const categories: QuizCategory[] = ['All', 'Seven Sacraments', 'First Confession', 'Last Supper & Real Presence', 'Receiving at Mass'];

    return `
      <section style="background:#0f172a; border:1.5px solid #334155; border-radius:16px; padding:1.5rem; color:#f8fafc; box-shadow:0 8px 24px rgba(15,23,42,0.18);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:1rem;">
          <div>
            <span style="font-size:0.74rem; font-weight:800; color:#fde047; text-transform:uppercase; letter-spacing:0.06em;">KS2 Catechesis Check</span>
            <h3 style="font-size:1.35rem; font-weight:800; color:#ffffff; margin:2px 0 4px;">First Holy Communion &amp; Sacraments Quiz (${fullDeck.length} Questions)</h3>
            <p style="font-size:0.85rem; color:#94a3b8; margin:0;">Practise what Jesus teaches about Baptism, First Confession, the Real Presence, and receiving at Mass.</p>
          </div>
          <span style="font-size:0.84rem; font-weight:800; background:rgba(34,197,94,0.18); color:#86efac; border:1px solid rgba(34,197,94,0.4); padding:5px 12px; border-radius:999px;">
            Score: ${quizScore} / ${answeredQuizIds.size} answered
          </span>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.15rem;">
          ${categories.map((cat) => `
            <button type="button" class="fhc-quiz-cat" data-cat="${escapeHtml(cat)}" style="padding:5px 12px; border-radius:999px; font-weight:700; font-size:0.76rem; cursor:pointer; border:1px solid ${cat === quizCategory ? '#facc15' : '#475569'}; background:${cat === quizCategory ? '#facc15' : '#1e293b'}; color:${cat === quizCategory ? '#0f172a' : '#e2e8f0'};">
              ${escapeHtml(cat)}
            </button>
          `).join('')}
        </div>

        ${q ? `
          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.74rem; font-weight:800; color:#38bdf8;">Question ${safeIdx + 1} of ${deck.length} &bull; ${escapeHtml(q.category)}</span>
              <button type="button" id="fhc-quiz-hint-btn" style="padding:4px 10px; font-size:0.74rem; font-weight:700; border-radius:6px; border:1px solid #475569; background:#0f172a; color:#fde047; cursor:pointer;">
                ${showQuizHint ? 'Hide Hint' : '💡 Need a Hint?'}
              </button>
            </div>

            <p style="font-size:1.05rem; font-weight:700; color:#ffffff; margin:0 0 1rem; line-height:1.5;">
              ${escapeHtml(q.prompt)}
            </p>

            ${showQuizHint ? `
              <div style="background:rgba(250,204,21,0.12); border:1px solid rgba(250,204,21,0.35); border-radius:8px; padding:8px 12px; margin-bottom:1rem; font-size:0.83rem; color:#fef08a;">
                💡 <strong>Hint:</strong> ${escapeHtml(q.hint)}
              </div>
            ` : ''}

            <div style="display:grid; gap:0.6rem; margin-bottom:1rem;">
              ${q.options.map((opt, oIdx) => {
                const isSelected = selectedQuizOption === oIdx;
                const isAnswered = selectedQuizOption !== null;
                const isCorrect = oIdx === q.correctIndex;
                let bg = '#0f172a';
                let border = '#334155';
                let textCol = '#f8fafc';
                if (isAnswered) {
                  if (isCorrect) {
                    bg = 'rgba(22, 163, 74, 0.25)';
                    border = '#22c55e';
                    textCol = '#bbf7d0';
                  } else if (isSelected) {
                    bg = 'rgba(220, 38, 38, 0.25)';
                    border = '#ef4444';
                    textCol = '#fecaca';
                  }
                }
                return `
                  <button type="button" class="fhc-quiz-opt" data-idx="${oIdx}" style="text-align:left; padding:0.8rem 1rem; border-radius:9px; border:1.5px solid ${border}; background:${bg}; color:${textCol}; font-size:0.88rem; font-weight:600; cursor:pointer; line-height:1.4;">
                    <strong style="margin-right:8px; color:#fde047;">${String.fromCharCode(65 + oIdx)}.</strong>${escapeHtml(opt)}
                  </button>
                `;
              }).join('')}
            </div>

            ${selectedQuizOption !== null ? `
              <div style="background:${selectedQuizOption === q.correctIndex ? 'rgba(22,163,74,0.16)' : 'rgba(245,158,11,0.14)'}; border:1px solid ${selectedQuizOption === q.correctIndex ? '#22c55e' : '#f59e0b'}; border-radius:9px; padding:0.9rem 1rem; margin-bottom:1rem;">
                <strong style="display:block; font-size:0.86rem; color:${selectedQuizOption === q.correctIndex ? '#86efac' : '#fde047'}; margin-bottom:4px;">
                  ${selectedQuizOption === q.correctIndex ? '✅ Correct!' : '🕊️ Let us learn together:'}
                </strong>
                <span style="font-size:0.84rem; color:#e2e8f0; line-height:1.45;">${escapeHtml(q.explanation)}</span>
              </div>
            ` : ''}

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <button type="button" id="fhc-quiz-prev" ${safeIdx === 0 ? 'disabled' : ''} style="padding:7px 14px; border-radius:8px; border:1px solid #475569; background:#0f172a; color:${safeIdx === 0 ? '#64748b' : '#f8fafc'}; font-weight:700; font-size:0.82rem; cursor:${safeIdx === 0 ? 'not-allowed' : 'pointer'};">
                &larr; Previous
              </button>
              <button type="button" id="fhc-quiz-next" style="padding:7px 16px; border-radius:8px; border:none; background:#ca8a04; color:#0f172a; font-weight:800; font-size:0.82rem; cursor:pointer;">
                ${safeIdx + 1 < deck.length ? 'Next Question &rarr;' : 'Back to Question 1 ↻'}
              </button>
            </div>
          </div>
        ` : ''}
      </section>
    `;
  }

  function updateView(): void {
    const safeBase = escapeHtml(base);

    container.innerHTML = `
      <div class="fhc-prep-wrapper" style="display:flex; flex-direction:column; gap:0.25rem;">
        <!-- Interactive First Holy Communion Vector Simulator -->
        <section style="margin-bottom:2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:1rem;">
            <div>
              <span style="font-size:0.75rem; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.06em;">
                🕊️ KS2 Sacramental Preparation &bull; Interactive 60 FPS Simulator
              </span>
              <h2 style="font-size:1.65rem; font-weight:800; color:#0f172a; margin:4px 0;">
                First Holy Communion &amp; Eucharistic Adoration
              </h2>
              <p style="font-size:0.94rem; color:#64748b; margin:0;">
                Click or drag across the 5 sacred steps inside the sanctuary below to practise preparing your heart, keeping the 1-hour fast, bowing, and answering "Amen!".
              </p>
            </div>
            <a href="${safeBase}player?preset=first-communion" style="padding:8px 16px; background:#ca8a04; color:#ffffff; border-radius:8px; font-weight:800; text-decoration:none; font-size:0.85rem;">
              ↗ Open Fullscreen Studio
            </a>
          </div>

          <div style="background:#090d16; border-radius:16px; border:1.5px solid #ca8a04; overflow:hidden; box-shadow:0 12px 32px rgba(15,23,42,0.28);">
            <iframe
              id="fhc-sim-iframe"
              src="${safeBase}player.html?preset=first-communion"
              style="width:100%; height:540px; border:none; display:block;"
              title="First Holy Communion & Eucharistic Adoration Interactive Simulator">
            </iframe>
          </div>
        </section>

        ${renderReadinessSection()}
        ${renderConfessionSection()}
        ${renderPrayerClozeSection()}
        ${renderQuizSection()}
      </div>
    `;

    // Bind readiness checkboxes
    container.querySelectorAll('.fhc-readiness-checkbox').forEach((el) => {
      el.addEventListener('change', (ev) => {
        const input = ev.currentTarget as HTMLInputElement;
        const id = input.getAttribute('data-id');
        if (id) {
          readinessState[id] = input.checked;
          saveReadinessState(readinessState);
          updateView();
        }
      });
    });

    container.querySelector('#fhc-reset-readiness')?.addEventListener('click', () => {
      readinessState = {};
      saveReadinessState(readinessState);
      updateView();
    });

    // Confession audio & BSL button
    container.querySelector('#fhc-speak-confession')?.addEventListener('click', (ev) => {
      const text = (ev.currentTarget as HTMLElement).getAttribute('data-text') || '';
      speakText('confession-walkthrough', text);
    });

    // Ephemeral examination checkboxes
    container.querySelectorAll('.fhc-exam-checkbox').forEach((el) => {
      el.addEventListener('change', (ev) => {
        const input = ev.currentTarget as HTMLInputElement;
        const id = input.getAttribute('data-id');
        if (id) {
          if (input.checked) ephemeralReflectionIds.add(id);
          else ephemeralReflectionIds.delete(id);
          updateView();
        }
      });
    });

    container.querySelector('#fhc-clear-examination')?.addEventListener('click', () => {
      ephemeralReflectionIds.clear();
      updateView();
    });

    // Prayer cloze tabs & handlers
    container.querySelectorAll('.fhc-prayer-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          activePrayerId = id;
          prayerSelections = {};
          prayerChecked = false;
          updateView();
        }
      });
    });

    container.querySelector('#fhc-speak-prayer')?.addEventListener('click', (ev) => {
      const btn = ev.currentTarget as HTMLElement;
      const id = btn.getAttribute('data-id') || 'prayer';
      const text = btn.getAttribute('data-text') || '';
      speakText(`prayer-${id}`, text);
    });

    container.querySelectorAll('.fhc-cloze-select').forEach((sel) => {
      sel.addEventListener('change', (ev) => {
        const selectEl = ev.currentTarget as HTMLSelectElement;
        const idx = selectEl.getAttribute('data-index');
        if (idx !== null) {
          prayerSelections[idx] = selectEl.value;
          prayerChecked = false;
        }
      });
    });

    container.querySelector('#fhc-check-prayer')?.addEventListener('click', () => {
      prayerChecked = true;
      updateView();
    });

    container.querySelector('#fhc-reveal-prayer')?.addEventListener('click', () => {
      const activePrayer = CATHOLIC_PRAYERS.find((p) => p.id === activePrayerId) || CATHOLIC_PRAYERS[0];
      const segs = buildClozeSegments(activePrayer.text, activePrayer.missingWords);
      segs.forEach((s) => {
        if (s.type === 'blank') {
          prayerSelections[String(s.index)] = s.answer;
        }
      });
      prayerChecked = true;
      updateView();
    });

    container.querySelector('#fhc-reset-prayer')?.addEventListener('click', () => {
      prayerSelections = {};
      prayerChecked = false;
      updateView();
    });

    // Quiz handlers
    container.querySelectorAll('.fhc-quiz-cat').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat') as QuizCategory | null;
        if (cat) {
          quizCategory = cat;
          quizCursor = 0;
          selectedQuizOption = null;
          showQuizHint = false;
          updateView();
        }
      });
    });

    container.querySelector('#fhc-quiz-hint-btn')?.addEventListener('click', () => {
      showQuizHint = !showQuizHint;
      updateView();
    });

    container.querySelectorAll('.fhc-quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const deck = getFilteredDeck();
        const curQ = deck[Math.min(quizCursor, Math.max(0, deck.length - 1))];
        if (!curQ) return;
        const idx = Number(btn.getAttribute('data-idx'));
        if (isNaN(idx)) return;
        selectedQuizOption = idx;
        if (!answeredQuizIds.has(curQ.id)) {
          answeredQuizIds.add(curQ.id);
          if (idx === curQ.correctIndex) {
            quizScore++;
          }
        }
        updateView();
      });
    });

    container.querySelector('#fhc-quiz-prev')?.addEventListener('click', () => {
      if (quizCursor > 0) {
        quizCursor--;
        selectedQuizOption = null;
        showQuizHint = false;
        updateView();
      }
    });

    container.querySelector('#fhc-quiz-next')?.addEventListener('click', () => {
      const deck = getFilteredDeck();
      quizCursor = quizCursor + 1 < deck.length ? quizCursor + 1 : 0;
      selectedQuizOption = null;
      showQuizHint = false;
      updateView();
    });
  }

  updateView();
  return container;
}

export default renderFirstCommunionPrep;
