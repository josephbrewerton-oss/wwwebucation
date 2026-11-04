import { getBaseUrl } from '../utils/url';
import { PHONICS_GRAPHEMES, DECODABLE_WORDS } from '../data/phonicsCurriculumData';

export function renderPhonicsPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'phonics-suite-stage';
  container.style.cssText = 'max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  let selectedPhase: number | 'all' = 'all';

  function speakText(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  function render() {
    const filteredGraphemes = PHONICS_GRAPHEMES.filter(g => {
      return selectedPhase === 'all' || g.phase === selectedPhase;
    });

    container.innerHTML = `
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🔤 EYFS &amp; KS1 Phonics Lab</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Phonics Soundboard &amp; Blending Mat</h1>
            <p style="font-size:0.95rem; color:#64748b; margin:0;">
              DfE Letters &amp; Sounds Phases 2–5 interactive sound buttons, decodable words, and screening practice.
            </p>
          </div>
          <a href="${base}player?preset=phonics-lab" style="padding:8px 16px; border-radius:8px; background:#0284c7; color:#fff; font-weight:700; font-size:0.84rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
            <span>🎮 Launch Vector Phonics Sim</span> &rarr;
          </a>
        </div>
      </div>

      <!-- Phase Filter Buttons -->
      <div style="display:flex; gap:8px; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
        <span style="font-size:0.84rem; font-weight:700; color:#64748b;">Filter Phase:</span>
        <button type="button" class="phase-btn" data-phase="all" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${selectedPhase === 'all' ? '#0284c7' : '#cbd5e1'}; background:${selectedPhase === 'all' ? '#0284c7' : '#fff'}; color:${selectedPhase === 'all' ? '#fff' : '#475569'};">
          All Phases (${PHONICS_GRAPHEMES.length})
        </button>
        ${[2, 3, 4, 5].map(ph => `
          <button type="button" class="phase-btn" data-phase="${ph}" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${selectedPhase === ph ? '#0284c7' : '#cbd5e1'}; background:${selectedPhase === ph ? '#0284c7' : '#fff'}; color:${selectedPhase === ph ? '#fff' : '#475569'};">
            Phase ${ph}
          </button>
        `).join('')}
      </div>

      <!-- Interactive Sound Mat Grid -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
        <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">Sound Mat Buttons (Click to hear phoneme)</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:10px;">
          ${filteredGraphemes.map(g => `
            <button
              type="button"
              class="sound-tile-btn"
              data-grapheme="${g.grapheme}"
              data-sound="${g.exampleWord || g.grapheme}"
              style="padding:12px 8px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; cursor:pointer; text-align:center; transition:all 0.15s ease;">
              <span style="font-size:1.4rem; font-weight:800; color:#0284c7; display:block;">${g.grapheme}</span>
              <span style="font-size:0.72rem; color:#64748b; display:block; margin-top:4px;">${g.exampleWord || ''}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Decodable Words Section -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem;">
        <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">Decodable Blending Words</h2>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
          ${DECODABLE_WORDS.slice(0, 20).map(w => `
            <button
              type="button"
              class="blend-word-btn"
              data-word="${w.word}"
              style="padding:8px 16px; border-radius:8px; border:1px solid #0284c7; background:#ffffff; color:#0369a1; font-size:1rem; font-weight:700; cursor:pointer;">
              ${w.word}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Phase filters
    container.querySelectorAll('.phase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ph = btn.getAttribute('data-phase');
        selectedPhase = ph === 'all' ? 'all' : parseInt(ph || '2', 10);
        render();
      });
    });

    // Sound tile click
    container.querySelectorAll('.sound-tile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-grapheme') || '';
        speakText(text);
      });
    });

    // Blending word click
    container.querySelectorAll('.blend-word-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.getAttribute('data-word') || '';
        speakText(word);
      });
    });
  }

  render();
  return container;
}

export default renderPhonicsPage;
