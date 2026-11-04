import { getBaseUrl } from '../utils/url';
import { LANGUAGE_PHONEMES, VERB_CONJUGATIONS } from '../data/languagesCurriculumData';

export function renderLanguagesPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'languages-suite-stage';
  container.style.cssText = 'max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  let selectedLang: 'all' | 'es' | 'fr' | 'la' = 'all';

  function speakForeignText(text: string, langCode: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'es' ? 'es-ES' : langCode === 'fr' ? 'fr-FR' : 'it-IT';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  function render() {
    const filteredPhonemes = LANGUAGE_PHONEMES.filter(p => {
      return selectedLang === 'all' || p.lang === selectedLang;
    });

    container.innerHTML = `
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🌍 MFL &amp; Polyglot Studio</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Modern Foreign Languages &amp; Polyglot Studio</h1>
            <p style="font-size:0.95rem; color:#64748b; margin:0;">
              Spanish, French &amp; Latin phonics soundboard, verb conjugation wheels, and etymological roots.
            </p>
          </div>
          <a href="${base}player?preset=languages" style="padding:8px 16px; border-radius:8px; background:#0284c7; color:#fff; font-weight:700; font-size:0.84rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
            <span>🎮 Launch Vector MFL Sim</span> &rarr;
          </a>
        </div>
      </div>

      <!-- Language Filter Tabs -->
      <div style="display:flex; gap:8px; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
        <span style="font-size:0.84rem; font-weight:700; color:#64748b;">Select Language:</span>
        <button type="button" class="lang-tab-btn" data-lang="all" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${selectedLang === 'all' ? '#0284c7' : '#cbd5e1'}; background:${selectedLang === 'all' ? '#0284c7' : '#fff'}; color:${selectedLang === 'all' ? '#fff' : '#475569'};">
          All Languages
        </button>
        <button type="button" class="lang-tab-btn" data-lang="es" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${selectedLang === 'es' ? '#0284c7' : '#cbd5e1'}; background:${selectedLang === 'es' ? '#0284c7' : '#fff'}; color:${selectedLang === 'es' ? '#fff' : '#475569'};">
          🇪🇸 Spanish (Castellano)
        </button>
        <button type="button" class="lang-tab-btn" data-lang="fr" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${selectedLang === 'fr' ? '#0284c7' : '#cbd5e1'}; background:${selectedLang === 'fr' ? '#0284c7' : '#fff'}; color:${selectedLang === 'fr' ? '#fff' : '#475569'};">
          🇫🇷 Français (French)
        </button>
        <button type="button" class="lang-tab-btn" data-lang="la" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${selectedLang === 'la' ? '#0284c7' : '#cbd5e1'}; background:${selectedLang === 'la' ? '#0284c7' : '#fff'}; color:${selectedLang === 'la' ? '#fff' : '#475569'};">
          🇻🇦 Latina (Ecclesiastical Latin)
        </button>
      </div>

      <!-- Phonics & Soundboard Grid -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
        <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">Target Soundboard (Click to hear native pronunciation)</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">
          ${filteredPhonemes.map(p => `
            <button
              type="button"
              class="foreign-sound-btn"
              data-text="${p.audioText}"
              data-lang="${p.lang}"
              style="padding:12px 10px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; cursor:pointer; text-align:center; transition:all 0.15s ease;">
              <span style="font-size:1.3rem; font-weight:800; color:#0284c7; display:block;">${p.grapheme}</span>
              <span style="font-size:0.75rem; color:#0f172a; font-weight:700; display:block; margin-top:2px;">${p.soundExample}</span>
              <span style="font-size:0.7rem; color:#64748b; display:block;">"${p.englishContrast}"</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Verb Conjugation Walkthrough -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem;">
        <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">Verb Conjugation Wheels</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
          ${VERB_CONJUGATIONS.map(v => `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="color:#0284c7; font-size:1.05rem;">${v.infinitive} (${v.meaning})</strong>
                <span style="font-size:0.75rem; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:999px; font-weight:700;">
                  ${v.lang.toUpperCase()} &bull; ${v.conjugationGroup}
                </span>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.85rem;">
                ${v.forms.map(f => `
                  <div style="background:#f8fafc; padding:6px 8px; border-radius:6px; border:1px solid #f1f5f9;">
                    <span style="color:#64748b; font-size:0.75rem;">${f.person}:</span>
                    <strong style="color:#0f172a; margin-left:4px;">${f.fullWord}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Filter clicks
    container.querySelectorAll('.lang-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLang = (btn.getAttribute('data-lang') as any) || 'all';
        render();
      });
    });

    // Sound clicks
    container.querySelectorAll('.foreign-sound-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text') || '';
        const lang = btn.getAttribute('data-lang') || 'es';
        speakForeignText(text, lang);
      });
    });
  }

  render();
  return container;
}

export default renderLanguagesPage;
