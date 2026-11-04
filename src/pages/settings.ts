import { getBaseUrl } from '../utils/url';
import { getSavedLanguage, setSavedLanguage } from '../engine/operational-language';
import { isDataSaverActive, setDataSaverMode } from '../services/dataSaverStore';
import { getBslEnabled, toggleBsl } from '../services/bslGlobalStore';

export function renderSettingsPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'settings-page-stage';
  container.style.cssText = 'max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  let currentLang = getSavedLanguage();
  let theme = localStorage.getItem('theme') || 'light';
  let fontSize = localStorage.getItem('app_font_size') || 'normal';
  let highContrast = localStorage.getItem('app_high_contrast') === 'true';
  let dataSaver = isDataSaverActive();
  let bslActive = getBslEnabled();

  function render() {
    container.innerHTML = `
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">⚙️ System Settings</span>
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">System, Accessibility &amp; Offline Preferences</h1>
        <p style="font-size:0.95rem; color:#64748b; margin:0;">
          All settings are stored directly on your device. We do not use tracking cookies or cloud profiling.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        <!-- 1. Accessibility & Visual Sensory -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; display:flex; align-items:center; gap:8px;">
            <span>👁️</span> Visual &amp; Sensory Access
          </h2>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1.25rem;">
            <!-- Theme Toggle -->
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">Display Theme:</label>
              <button type="button" id="settings-theme-toggle" style="padding:8px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; font-weight:700; font-size:0.88rem; cursor:pointer;">
                ${theme === 'dark' ? '🌙 Dark Mode (Active)' : '☀️ Light Mode (Active)'}
              </button>
            </div>

            <!-- Font Size -->
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">Font Size:</label>
              <div style="display:flex; gap:6px;">
                <button type="button" class="settings-font-btn" data-size="normal" style="padding:6px 14px; border-radius:6px; border:1px solid ${fontSize === 'normal' ? '#0284c7' : '#cbd5e1'}; background:${fontSize === 'normal' ? '#0284c7' : '#f8fafc'}; color:${fontSize === 'normal' ? '#fff' : '#334155'}; font-weight:700; cursor:pointer;">
                  Standard (A)
                </button>
                <button type="button" class="settings-font-btn" data-size="large" style="padding:6px 14px; border-radius:6px; border:1px solid ${fontSize === 'large' ? '#0284c7' : '#cbd5e1'}; background:${fontSize === 'large' ? '#0284c7' : '#f8fafc'}; color:${fontSize === 'large' ? '#fff' : '#334155'}; font-weight:700; cursor:pointer;">
                  Large (A+)
                </button>
              </div>
            </div>

            <!-- Contrast -->
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">High Contrast Mode:</label>
              <button type="button" id="settings-contrast-toggle" style="padding:8px 16px; border-radius:8px; border:1px solid ${highContrast ? '#0284c7' : '#cbd5e1'}; background:${highContrast ? '#eff6ff' : '#f8fafc'}; color:${highContrast ? '#0284c7' : '#334155'}; font-weight:700; font-size:0.88rem; cursor:pointer;">
                ${highContrast ? '🌓 High Contrast: ON' : '🌓 High Contrast: OFF'}
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Language & Polyglot Settings -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; display:flex; align-items:center; gap:8px;">
            <span>🌐</span> Language &amp; Translation
          </h2>

          <div style="display:flex; flex-direction:column; gap:10px; max-width:400px;">
            <label for="settings-lang-select" style="font-size:0.85rem; font-weight:700; color:#475569;">Default Portal Language:</label>
            <select id="settings-lang-select" style="padding:8px 12px; border-radius:8px; border:1.5px solid #0284c7; background:#ffffff; font-size:0.9rem; font-weight:700; cursor:pointer;">
              <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
              <option value="es" ${currentLang === 'es' ? 'selected' : ''}>🇪🇸 Español (Spanish)</option>
              <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>🇫🇷 Français (French)</option>
              <option value="la" ${currentLang === 'la' ? 'selected' : ''}>🇻🇦 Latina (Ecclesiastical Latin)</option>
              <option value="de" ${currentLang === 'de' ? 'selected' : ''}>🇩🇪 Deutsch (German)</option>
              <option value="pl" ${currentLang === 'pl' ? 'selected' : ''}>🇵🇱 Polski (Polish)</option>
              <option value="uk" ${currentLang === 'uk' ? 'selected' : ''}>🇺🇦 Українська (Ukrainian)</option>
              <option value="pt" ${currentLang === 'pt' ? 'selected' : ''}>🇵🇹 Português (Portuguese)</option>
              <option value="ar" ${currentLang === 'ar' ? 'selected' : ''}>🇸🇦 العربية (Arabic)</option>
            </select>
          </div>
        </div>

        <!-- 3. British Sign Language (BSL) -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>🖐️</span> British Sign Language (BSL) In-Vision Interpreter
          </h2>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 1rem 0; line-height:1.5;">
            Our in-vision procedural vector interpreter signs synchronously with speech without loading heavy video streams. Keyboard shortcut: <kbd style="background:#f1f5f9; border:1px solid #cbd5e1; padding:1px 5px; border-radius:4px;">Shift + B</kbd>.
          </p>

          <button type="button" id="settings-bsl-toggle" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${bslActive ? '#0284c7' : '#cbd5e1'}; background:${bslActive ? '#0284c7' : '#f8fafc'}; color:${bslActive ? '#ffffff' : '#334155'}; font-weight:700; font-size:0.88rem; cursor:pointer;">
            ${bslActive ? '🖐️ BSL Signing: ON (Active)' : '🖐️ BSL Signing: OFF'}
          </button>
        </div>

        <!-- 4. Low-Bandwidth Data Saver Mode -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>📶</span> Data Saver Mode (Zero Data / Developing Nations)
          </h2>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 1rem 0; line-height:1.5;">
            Suppresses external font requests, disables background prefetching, and runs exclusively on local vector assets to conserve expensive mobile data.
          </p>

          <button type="button" id="settings-data-saver-toggle" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${dataSaver ? '#10b981' : '#cbd5e1'}; background:${dataSaver ? '#ecfdf5' : '#f8fafc'}; color:${dataSaver ? '#065f46' : '#334155'}; font-weight:700; font-size:0.88rem; cursor:pointer;">
            ${dataSaver ? '📶 Data Saver: ON (Low Bandwidth)' : '📶 Data Saver: OFF'}
          </button>
        </div>
      </div>
    `;

    // Bind Theme Toggle
    container.querySelector('#settings-theme-toggle')?.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      render();
    });

    // Bind Font Size
    container.querySelectorAll('.settings-font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        fontSize = btn.getAttribute('data-size') || 'normal';
        localStorage.setItem('app_font_size', fontSize);
        document.documentElement.setAttribute('data-font-size', fontSize);
        render();
      });
    });

    // Bind Contrast
    container.querySelector('#settings-contrast-toggle')?.addEventListener('click', () => {
      highContrast = !highContrast;
      localStorage.setItem('app_high_contrast', String(highContrast));
      document.documentElement.setAttribute('data-high-contrast', String(highContrast));
      render();
    });

    // Bind Language
    container.querySelector('#settings-lang-select')?.addEventListener('change', (e) => {
      const newLang = (e.target as HTMLSelectElement).value;
      currentLang = newLang;
      setSavedLanguage(newLang);
    });

    // Bind BSL
    container.querySelector('#settings-bsl-toggle')?.addEventListener('click', () => {
      bslActive = !bslActive;
      toggleBsl();
      render();
    });

    // Bind Data Saver
    container.querySelector('#settings-data-saver-toggle')?.addEventListener('click', () => {
      dataSaver = !dataSaver;
      setDataSaverMode(dataSaver);
      render();
    });
  }

  render();
  return container;
}

export default renderSettingsPage;