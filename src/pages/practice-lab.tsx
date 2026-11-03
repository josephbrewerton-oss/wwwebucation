import { ALL_CURRICULUM_ROUTES } from '../curriculum/curriculumMesh';

interface PracticeQuestion {
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
}

const SAMPLE_DRILLS: PracticeQuestion[] = [
  {
    id: 'mat-frac-1',
    stage: 'Key Stage 2',
    subject: 'Mathematics',
    unit: 'Fractions and Decimals',
    question: 'What is 1/4 + 2/4 in simplest form?',
    options: ['3/8', '3/4', '2/8', '1/2'],
    correctIndex: 1,
    hint: 'When fractions share the same denominator (bottom number), simply add the numerators (top numbers)!',
    explanation: 'Correct! 1/4 + 2/4 = (1 + 2)/4 = 3/4. Denominators stay the same.',
    simPreset: 'fractions'
  },
  {
    id: 'sci-gas-1',
    stage: 'Key Stage 3',
    subject: 'Science',
    unit: 'States of Matter & Gas Laws',
    question: 'If the volume of a sealed gas container is halved at constant temperature, what happens to the gas pressure?',
    options: ['Halved', 'Remains identical', 'Doubled', 'Quadrupled'],
    correctIndex: 2,
    hint: "Recall Boyle's Law: P × V = constant. Fewer spaces mean particles collide with walls twice as often.",
    explanation: "Correct! By Boyle's Law, pressure is inversely proportional to volume. Halving the volume doubles the pressure.",
    simPreset: 'kinetic-gas'
  },
  {
    id: 'mat-pyth-1',
    stage: 'Key Stage 3',
    subject: 'Mathematics',
    unit: 'Pythagoras Theorem',
    question: 'In a right-angled triangle with legs a = 3 and b = 4, what is the length of hypotenuse c?',
    options: ['5', '7', '12', '25'],
    correctIndex: 0,
    hint: "Use Pythagoras' formula: a² + b² = c². 3² + 4² = 9 + 16 = 25.",
    explanation: 'Correct! √25 = 5. A classic 3-4-5 Pythagorean triple.',
    simPreset: 'pythagoras'
  },
  {
    id: 'sci-circ-1',
    stage: 'Key Stage 3',
    subject: 'Science',
    unit: 'Electrical Circuits & Ohm’s Law',
    question: 'If voltage across a resistor is 12V and current is 3A, what is its electrical resistance?',
    options: ['36 Ω', '4 Ω', '9 Ω', '0.25 Ω'],
    correctIndex: 1,
    hint: "Use Ohm's Law: V = I × R, which rearranges to R = V / I.",
    explanation: 'Correct! R = 12V / 3A = 4 Ω.',
    simPreset: 'electric-circuits'
  },
  {
    id: 're-mass-1',
    stage: 'Key Stage 2',
    subject: 'Religious Education (Catholic)',
    unit: 'The Holy Eucharist & Sacraments',
    question: 'Which part of the Mass follows the Liturgy of the Word?',
    options: ['Introductory Rites', 'Liturgy of the Eucharist', 'Concluding Rites', 'Penitential Act'],
    correctIndex: 1,
    hint: 'After listening to God’s Word in Scripture, we approach the Altar for the sacrifice and Thanksgiving.',
    explanation: 'Correct! The two main tables of the Mass are the Table of the Word followed by the Table of the Eucharist.',
    simPreset: 'church-tour'
  },
  {
    id: 'lang-es-1',
    stage: 'Key Stage 2',
    subject: 'Spanish',
    unit: 'Greetings and Introductions',
    question: 'How do you say "Good morning" in Spanish?',
    options: ['Buenas noches', 'Buenos días', 'Hasta luego', 'Por favor'],
    correctIndex: 1,
    hint: '"Día" means day. "Buenos días" literally means good days!',
    explanation: 'Correct! "Buenos días" is used in the morning until lunchtime.',
    simPreset: 'languages'
  }
];

export function renderPracticePage(): HTMLElement {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const container = document.createElement('div');
  container.className = 'practice-arena-stage';
  container.style.cssText = 'max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  let selectedStage = 'All';
  let selectedSubject = 'All';
  let score = 0;
  let streak = 0;
  const answeredQuestions = new Set<string>();

  function getFilteredDrills(): PracticeQuestion[] {
    return SAMPLE_DRILLS.filter(d => {
      const matchStage = selectedStage === 'All' || d.stage === selectedStage;
      const matchSubject = selectedSubject === 'All' || d.subject === selectedSubject;
      return matchStage && matchSubject;
    });
  }

  function render() {
    const drills = getFilteredDrills();

    container.innerHTML = `
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:1.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
            <span style="color:#cbd5e1;">/</span>
            <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">⚡ Practice Lab Question Bank</span>
          </div>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 4px 0;">Interactive Practice Arena</h1>
          <p style="font-size:0.95rem; color:#64748b; margin:0;">
            Immediate diagnostic feedback, step-by-step hints, and linked AST vector simulations.
          </p>
        </div>

        <!-- Score & Streak Pills -->
        <div style="display:flex; gap:10px; align-items:center;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:6px 14px; border-radius:999px; font-size:0.85rem; font-weight:700; color:#166534; display:flex; align-items:center; gap:6px;">
            <span>⭐</span> Score: <span id="score-val">${score}</span>
          </div>
          <div style="background:#fffbeb; border:1px solid #fde68a; padding:6px 14px; border-radius:999px; font-size:0.85rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:6px;">
            <span>🔥</span> Streak: <span id="streak-val">${streak}</span>
          </div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <label style="font-size:0.8rem; font-weight:700; color:#475569;">Key Stage:</label>
            ${['All', 'Key Stage 1', 'Key Stage 2', 'Key Stage 3'].map(st => `
              <button type="button" class="stage-filter-btn" data-stage="${st}" style="padding:4px 10px; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid ${st === selectedStage ? '#0284c7' : '#cbd5e1'}; background:${st === selectedStage ? '#0284c7' : '#f8fafc'}; color:${st === selectedStage ? '#fff' : '#475569'};">
                ${st}
              </button>
            `).join('')}
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <label style="font-size:0.8rem; font-weight:700; color:#475569;">Subject:</label>
            ${['All', 'Mathematics', 'Science', 'Spanish', 'Religious Education (Catholic)'].map(sub => `
              <button type="button" class="subject-filter-btn" data-subject="${sub}" style="padding:4px 10px; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid ${sub === selectedSubject ? '#0284c7' : '#cbd5e1'}; background:${sub === selectedSubject ? '#0284c7' : '#f8fafc'}; color:${sub === selectedSubject ? '#fff' : '#475569'};">
                ${sub === 'Religious Education (Catholic)' ? '✝️ Catholic RE' : sub}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Drills List -->
      <div id="drills-container" style="display:flex; flex-direction:column; gap:1.25rem;">
        ${drills.length === 0 ? `
          <div style="text-align:center; padding:3rem; color:#64748b; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
            No questions found for the selected filters.
          </div>
        ` : drills.map((drill, qIdx) => `
          <div class="drill-card" id="drill-${drill.id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:0.75rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:999px;">
                  ${drill.stage}
                </span>
                <span style="font-size:0.75rem; font-weight:700; color:#ca8a04;">
                  ${drill.subject} &bull; ${drill.unit}
                </span>
              </div>
              ${drill.simPreset ? `
                <a href="${base}player?preset=${drill.simPreset}" style="font-size:0.78rem; font-weight:700; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  <span>🎮 Open Simulator</span> &rarr;
                </a>
              ` : ''}
            </div>

            <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; line-height:1.4;">
              ${qIdx + 1}. ${drill.question}
            </h3>

            <!-- Options Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:1rem;">
              ${drill.options.map((opt, optIdx) => `
                <button
                  type="button"
                  class="option-btn"
                  data-drill-id="${drill.id}"
                  data-opt-idx="${optIdx}"
                  style="text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:600; font-size:0.9rem; cursor:pointer; transition:all 0.15s ease;">
                  <span style="display:inline-block; width:22px; height:22px; border-radius:50%; background:#e2e8f0; text-align:center; line-height:22px; font-size:0.78rem; margin-right:8px; font-weight:800;">
                    ${String.fromCharCode(65 + optIdx)}
                  </span>
                  ${opt}
                </button>
              `).join('')}
            </div>

            <!-- Feedback & Hint Box -->
            <div class="feedback-box" id="feedback-${drill.id}" style="display:none; padding:10px 14px; border-radius:8px; font-size:0.86rem; margin-top:8px;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="hint-toggle-btn" data-drill-id="${drill.id}" style="background:transparent; border:none; color:#0284c7; font-size:0.8rem; font-weight:700; cursor:pointer;">
                💡 Need a clue?
              </button>
              <div class="hint-text" id="hint-${drill.id}" style="display:none; font-size:0.82rem; color:#64748b; font-style:italic;">
                ${drill.hint}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Bind Filter Listeners
    container.querySelectorAll('.stage-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedStage = btn.getAttribute('data-stage') || 'All';
        render();
      });
    });

    container.querySelectorAll('.subject-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSubject = btn.getAttribute('data-subject') || 'All';
        render();
      });
    });

    // Bind Option Clicks
    container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const drillId = btn.getAttribute('data-drill-id');
        const optIdx = parseInt(btn.getAttribute('data-opt-idx') || '0', 10);
        const drill = SAMPLE_DRILLS.find(d => d.id === drillId);
        if (!drill) return;

        const card = container.querySelector(`#drill-${drillId}`);
        const feedback = container.querySelector(`#feedback-${drillId}`) as HTMLElement;
        if (!card || !feedback) return;

        // Prevent repeated scoring on same question
        const isFirstAnswer = !answeredQuestions.has(drill.id);
        answeredQuestions.add(drill.id);

        if (optIdx === drill.correctIndex) {
          btn.setAttribute('style', 'text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #16a34a; background:#dcfce7; color:#166534; font-weight:700; font-size:0.9rem;');
          feedback.style.display = 'block';
          feedback.style.background = '#dcfce7';
          feedback.style.color = '#166534';
          feedback.style.border = '1px solid #86efac';
          feedback.innerHTML = `<strong>🎉 Brilliant!</strong> ${drill.explanation}`;

          if (isFirstAnswer) {
            score += 10;
            streak += 1;
            const scoreVal = container.querySelector('#score-val');
            const streakVal = container.querySelector('#streak-val');
            if (scoreVal) scoreVal.textContent = String(score);
            if (streakVal) streakVal.textContent = String(streak);
          }
        } else {
          btn.setAttribute('style', 'text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #dc2626; background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.9rem;');
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
    container.querySelectorAll('.hint-toggle-btn').forEach(btn => {
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