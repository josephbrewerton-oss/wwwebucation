import { getBaseUrl } from '../utils/url';
// src/pages/practice-lab.tsx
// St Joseph's Curriculum Portal - Interactive Practice Lab Arena
// Pure Native TypeScript Single-Page View (Zero React, Zero Bloat)

import { ALL_CURRICULUM_ROUTES, CurriculumRouteNode, CurriculumQuestionItem } from '../curriculum/curriculumMesh';
import { resolveTopicSimulator } from '../curriculum/curriculumSimMapping';
import { BUILTIN_DATA_CARTRIDGES } from '../data/player/dataCartridges';

export interface PracticeQuestion {
  id: string;
  stage: string;
  subject: string;
  unit: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  simPreset?: string;
  tier?: string;
  sourceDeck?: string;
}

function assembleAllPracticeQuestions(): PracticeQuestion[] {
  const list: PracticeQuestion[] = [];
  const seenIds = new Set<string>();

  // 1. Ingest decentralized diagnostic question decks from data cartridges
  for (const cart of BUILTIN_DATA_CARTRIDGES) {
    if (cart.dataPayload && cart.dataPayload.questions) {
      for (const q of cart.dataPayload.questions) {
        if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          list.push({
            id: q.id,
            stage: cart.stage,
            subject: cart.subject,
            unit: cart.oakUnit || cart.title,
            question: q.prompt,
            options: q.options,
            correctIndex: q.answer,
            hint: q.hint || 'Carefully review the fundamental axioms.',
            explanation: q.explanation || 'Verified diagnostic response.',
            sourceDeck: cart.title,
          });
        }
      }
    }
  }

  // 2. Assemble practice items from the national curriculum routes (zero hardcoded static data bloat)
  for (const route of ALL_CURRICULUM_ROUTES) {
    const sim = resolveTopicSimulator(route.topicId, route.topicTitle, route.subjectTitle);
    const simPreset = sim ? sim.presetId : undefined;

    if (route.questions && route.questions.length > 0) {
      for (const q of route.questions) {
        if (seenIds.has(q.id)) continue;
        seenIds.add(q.id);
        list.push({
          id: q.id,
          stage: route.stageTitle,
          subject: route.subjectTitle,
          unit: route.topicTitle,
          question: q.prompt,
          options: q.options,
          correctIndex: q.answerKey,
          hint: q.hint,
          explanation: q.explanation,
          simPreset,
        });
      }
    } else {
      // Fallback: generate a core axiom check question
      list.push({
        id: `q_axiom_${route.stageId}_${route.topicId}`,
        stage: route.stageTitle,
        subject: route.subjectTitle,
        unit: route.topicTitle,
        question: `Which fundamental principle governs ${route.topicTitle}?`,
        options: [
          route.axiom,
          `It operates in reverse without regard for foundational invariants.`,
          `It only applies under hypothetical lab conditions with arbitrary constants.`,
          `It contradicts the standard National Curriculum frameworks.`,
        ],
        correctIndex: 0,
        hint: route.guidedStep || 'Focus on the defining conceptual axiom.',
        explanation: `Correct! ${route.axiom}`,
        simPreset,
      });
    }
  }

  return list;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPracticePage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'practice-arena-stage';
  container.style.cssText = 'max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  const allQuestions = assembleAllPracticeQuestions();

  // Read initial filter from URL params if linked from Learning Zone
  const params = new URLSearchParams(window.location.search);
  const rawStage = params.get('stage') || 'All';
  const rawSubject = params.get('subject') || 'All';
  let selectedStage = ['All', 'Key Stage 1', 'Key Stage 2', 'Key Stage 3', 'Key Stage 4'].includes(rawStage) ? rawStage : 'All';
  let selectedSubject = rawSubject.replace(/[<>"'&]/g, '');
  let searchQuery = (params.get('q') || '').slice(0, 100);
  let score = 0;
  let streak = 0;
  const answeredQuestions = new Set<string>();

  // Extract distinct stages and subjects
  const stages = ['All', 'Key Stage 1', 'Key Stage 2', 'Key Stage 3', 'Key Stage 4'];
  const subjectsSet = new Set<string>();
  allQuestions.forEach((q) => {
    if (q.subject) subjectsSet.add(q.subject);
  });
  const subjects = ['All', ...Array.from(subjectsSet).sort()];

  function getFilteredDrills(): PracticeQuestion[] {
    const q = searchQuery.toLowerCase().trim();
    return allQuestions.filter((d) => {
      const matchStage = selectedStage === 'All' || d.stage === selectedStage;
      const matchSubject = selectedSubject === 'All' || d.subject === selectedSubject;
      if (!matchStage || !matchSubject) return false;
      if (q) {
        const inQ = d.question.toLowerCase().includes(q);
        const inUnit = d.unit.toLowerCase().includes(q);
        const inExp = d.explanation.toLowerCase().includes(q);
        if (!inQ && !inUnit && !inExp) return false;
      }
      return true;
    });
  }

  function playSound(type: 'success' | 'error') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // AudioContext unavailable
    }
  }

  function render() {
    const drills = getFilteredDrills();

    container.innerHTML = `
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:1.75rem;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <a href="${base}" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
            <span style="color:#cbd5e1;">/</span>
            <a href="${base}learning-zone" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">Learning Zone</a>
            <span style="color:#cbd5e1;">/</span>
            <span style="font-size:0.82rem; color:#0284c7; font-weight:700;">⚡ Practice Lab Arena</span>
          </div>
          <h1 style="font-size:2.2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0; letter-spacing:-0.02em;">
            Interactive Practice Arena
          </h1>
          <p style="font-size:0.96rem; color:#475569; margin:0; line-height:1.5;">
            Master National Curriculum topics with diagnostic checkpoints, immediate feedback, hints, and linked 60 FPS simulations.
          </p>
        </div>

        <!-- Score & Streak Status -->
        <div style="display:flex; gap:12px; align-items:center;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:8px 16px; border-radius:10px; font-size:0.88rem; font-weight:700; color:#166534; display:flex; align-items:center; gap:8px;">
            <span>⭐</span> Score: <span id="score-val" style="font-size:1.1rem; font-weight:800;">${score}</span>
          </div>
          <div style="background:#fffbeb; border:1px solid #fde68a; padding:8px 16px; border-radius:10px; font-size:0.88rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:8px;">
            <span>🔥</span> Streak: <span id="streak-val" style="font-size:1.1rem; font-weight:800;">${streak}</span>
          </div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.25rem 1.5rem; margin-bottom:2rem; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
        <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:space-between;">
          <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label for="practice-stage-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Key Stage:</label>
              <select id="practice-stage-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${stages.map(st => `<option value="${st}" ${st === selectedStage ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <label for="practice-subject-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Subject:</label>
              <select id="practice-subject-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${subjects.map(sub => `<option value="${sub}" ${sub === selectedSubject ? 'selected' : ''}>${sub}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="flex:1; min-width:240px; max-width:360px; position:relative;">
            <input 
              type="text" 
              id="practice-search-input" 
              value="${escapeHtml(searchQuery)}" 
              placeholder="Search question prompts or topics..." 
              style="width:100%; box-sizing:border-box; padding:8px 36px 8px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;"
            />
            ${searchQuery ? `
              <button type="button" id="clear-practice-search-btn" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:0.9rem; cursor:pointer;">✕</button>
            ` : ''}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:0.78rem; color:#64748b;">
          <span>Showing <strong>${drills.length}</strong> active practice questions</span>
          ${(selectedStage !== 'All' || selectedSubject !== 'All' || searchQuery) ? `
            <button type="button" id="reset-practice-filters-btn" style="background:none; border:none; color:#0284c7; font-weight:700; cursor:pointer; text-decoration:underline;">
              Reset filters
            </button>
          ` : ''}
        </div>
      </section>

      <!-- Drills List -->
      <div id="drills-container" style="display:flex; flex-direction:column; gap:1.25rem;">
        ${drills.length === 0 ? `
          <div style="text-align:center; padding:3rem; color:#64748b; background:#ffffff; border-radius:14px; border:1px solid #e2e8f0;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
            <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a; margin:0 0 6px 0;">No questions match this selection</h3>
            <p style="font-size:0.86rem; color:#64748b; margin:0 0 1rem 0;">
              Try picking 'All' Key Stages or clearing the search query.
            </p>
          </div>
        ` : drills.map((drill, qIdx) => `
          <article class="drill-card" id="drill-${drill.id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:0.72rem; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.04em;">
                  ${drill.stage}
                </span>
                <span style="color:#cbd5e1;">&bull;</span>
                <span style="font-size:0.74rem; font-weight:700; color:#475569;">
                  ${drill.subject} &bull; ${drill.unit}
                </span>
                ${drill.sourceDeck ? `
                  <span style="font-size:0.7rem; font-weight:700; color:#059669; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 8px; border-radius:6px;">
                    📦 ${escapeHtml(drill.sourceDeck)}
                  </span>
                ` : ''}
              </div>
              ${drill.simPreset ? `
                <a href="${base}player?preset=${drill.simPreset}" style="font-size:0.78rem; font-weight:700; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  <span>🎮 Open Simulator</span> &rarr;
                </a>
              ` : ''}
            </div>

            <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; line-height:1.45;">
              ${qIdx + 1}. ${drill.question}
            </h3>

            <!-- Options Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; margin-bottom:1rem;">
              ${drill.options.map((opt, optIdx) => `
                <button
                  type="button"
                  class="option-btn"
                  data-drill-id="${drill.id}"
                  data-opt-idx="${optIdx}"
                  style="text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:600; font-size:0.88rem; cursor:pointer; transition:all 0.15s ease; line-height:1.4;">
                  <span style="display:inline-block; width:22px; height:22px; border-radius:50%; background:#e2e8f0; text-align:center; line-height:22px; font-size:0.76rem; margin-right:8px; font-weight:800;">
                    ${String.fromCharCode(65 + optIdx)}
                  </span>
                  ${opt}
                </button>
              `).join('')}
            </div>

            <!-- Feedback & Hint Box -->
            <div class="feedback-box" id="feedback-${drill.id}" style="display:none; padding:10px 14px; border-radius:8px; font-size:0.86rem; margin-top:8px; line-height:1.5;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="hint-toggle-btn" data-drill-id="${drill.id}" style="background:transparent; border:none; color:#0284c7; font-size:0.8rem; font-weight:700; cursor:pointer;">
                💡 Need a clue?
              </button>
              <div class="hint-text" id="hint-${drill.id}" style="display:none; font-size:0.82rem; color:#64748b; font-style:italic;">
                ${drill.hint}
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    // Bind Filter Selects
    const stageSelect = container.querySelector('#practice-stage-select') as HTMLSelectElement | null;
    stageSelect?.addEventListener('change', () => {
      selectedStage = stageSelect.value;
      render();
    });

    const subjectSelect = container.querySelector('#practice-subject-select') as HTMLSelectElement | null;
    subjectSelect?.addEventListener('change', () => {
      selectedSubject = subjectSelect.value;
      render();
    });

    const searchInput = container.querySelector('#practice-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      searchQuery = searchInput.value;
      render();
      const newInput = container.querySelector('#practice-search-input') as HTMLInputElement | null;
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });

    container.querySelector('#clear-practice-search-btn')?.addEventListener('click', () => {
      searchQuery = '';
      render();
    });

    const resetPracticeFilters = () => {
      selectedStage = 'All';
      selectedSubject = 'All';
      searchQuery = '';
      render();
    };
    container.querySelector('#reset-practice-filters-btn')?.addEventListener('click', resetPracticeFilters);

    // Bind Option Clicks
    container.querySelectorAll('.option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drillId = btn.getAttribute('data-drill-id');
        const optIdx = parseInt(btn.getAttribute('data-opt-idx') || '0', 10);
        const drill = drills.find((d) => d.id === drillId);
        if (!drill) return;

        const feedback = container.querySelector(`#feedback-${drillId}`) as HTMLElement;
        if (!feedback) return;

        const isFirstAnswer = !answeredQuestions.has(drill.id);
        answeredQuestions.add(drill.id);

        if (optIdx === drill.correctIndex) {
          playSound('success');
          btn.setAttribute('style', 'text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #16a34a; background:#dcfce7; color:#166534; font-weight:700; font-size:0.88rem; line-height:1.4;');
          feedback.style.display = 'block';
          feedback.style.background = '#dcfce7';
          feedback.style.color = '#166534';
          feedback.style.border = '1px solid #86efac';
          feedback.innerHTML = `<strong>🎉 Excellent!</strong> ${drill.explanation}`;

          if (isFirstAnswer) {
            score += 10;
            streak += 1;
            const scoreVal = container.querySelector('#score-val');
            const streakVal = container.querySelector('#streak-val');
            if (scoreVal) scoreVal.textContent = String(score);
            if (streakVal) streakVal.textContent = String(streak);
          }
        } else {
          playSound('error');
          btn.setAttribute('style', 'text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #dc2626; background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.88rem; line-height:1.4;');
          feedback.style.display = 'block';
          feedback.style.background = '#fee2e2';
          feedback.style.color = '#991b1b';
          feedback.style.border = '1px solid #fca5a5';
          feedback.innerHTML = `<strong>Not quite:</strong> Try reviewing the clue below.`;

          if (isFirstAnswer) {
            streak = 0;
            const streakVal = container.querySelector('#streak-val');
            if (streakVal) streakVal.textContent = '0';
          }
        }
      });
    });

    // Bind Hint Toggles
    container.querySelectorAll('.hint-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drillId = btn.getAttribute('data-drill-id');
        const hintEl = container.querySelector(`#hint-${drillId}`) as HTMLElement;
        if (hintEl) {
          hintEl.style.display = hintEl.style.display === 'none' ? 'block' : 'none';
        }
      });
    });
  }

  render();
  return container;
}

export default renderPracticePage;