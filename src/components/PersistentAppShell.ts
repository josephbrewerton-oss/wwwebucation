import { classroomBeacon } from '../services/classroomBeacon';
import { playSuccessChime, triggerHapticSuccess, isSoundEnabled, setSoundEnabled } from '../services/soundHaptics';
import { toggleBsl, setBslEnabled, subscribeBsl, getBslEnabled, broadcastBslSpeech, setVoiceEnabled, subscribeVoice } from '../services/bslGlobalStore';
import { isDataSaverActive, setDataSaverMode, listenToDataSaverChanges } from '../services/dataSaverStore';
import { isOfflineSyncComplete, syncEntireCurriculumOffline } from '../services/offlineSync';
import { getSavedLanguage, setSavedLanguage, listenToLanguageChange } from '../engine/operational-language';
import { navigate } from '../router';
import { getBaseUrl } from '../utils/url';
import { subscribeToPlayerCalls } from '../services/playerLauncher';
import {
  NAV_GROUPS,
  CATHOLIC_SANCTUARY_ITEMS,
  CURRICULUM_LAB_ITEMS,
  SCHOOL_GOVERNANCE_ITEMS,
} from '../data/navigationManifest';

export class PersistentAppShellElement extends HTMLElement {
  private mobileMenuOpen = false;
  private openDropdown: 'learning' | 'admin' | null = null;
  private colorMode: 'light' | 'dark' = 'light';
  private dataSaver = false;
  private bsl = false;
  private sound = true;
  private isOfflineSynced = false;
  private unsubscribeBsl?: () => void;
  private unsubscribeDataSaver?: () => void;
  private unsubscribeLang?: () => void;
  private unsubscribePlayerCalls?: () => void;
  private unsubscribeVoice?: () => void;

  // Dedicated class handlers for clean event detachment
  private handleDocumentClick = () => {
    const menuCatholic = this.querySelector<HTMLDivElement>('#nav-dropdown-catholic-menu');
    const menuLearning = this.querySelector<HTMLDivElement>('#nav-dropdown-learning-menu');
    const menuAdmin = this.querySelector<HTMLDivElement>('#nav-dropdown-admin-menu');
    if (menuCatholic) menuCatholic.style.display = 'none';
    if (menuLearning) menuLearning.style.display = 'none';
    if (menuAdmin) menuAdmin.style.display = 'none';

    this.querySelector('#nav-dropdown-catholic-btn')?.setAttribute('aria-expanded', 'false');
    this.querySelector('#nav-dropdown-learning-btn')?.setAttribute('aria-expanded', 'false');
    this.querySelector('#nav-dropdown-admin-btn')?.setAttribute('aria-expanded', 'false');
  };

  private updateSoundUi = (enabled: boolean) => {
    this.sound = enabled;
    const btnSound = this.querySelector<HTMLButtonElement>('#top-bar-sound-btn');
    const btnNavSound = this.querySelector<HTMLButtonElement>('#nav-btn-sound');
    if (btnSound) {
      btnSound.textContent = enabled ? '🔊 Sound: ON' : '🔇 Mute';
      btnSound.style.background = enabled ? '#0284c7' : '#1e293b';
      btnSound.style.borderColor = enabled ? '#38bdf8' : '#334155';
      btnSound.setAttribute('aria-pressed', String(enabled));
    }
    if (btnNavSound) {
      btnNavSound.textContent = enabled ? '🔊 Sound: ON' : '🔇 Mute';
      btnNavSound.style.background = enabled ? '#eff6ff' : '#fef2f2';
      btnNavSound.style.color = enabled ? '#1d4ed8' : '#b91c1c';
      btnNavSound.style.borderColor = enabled ? '#93c5fd' : '#fecaca';
      btnNavSound.setAttribute('aria-pressed', String(enabled));
    }
  };

  private toggleMasterSound = () => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    setVoiceEnabled(next);
    this.updateSoundUi(next);
    if (next) {
      playSuccessChime();
    }
  };

  private handleSoundUpdated = () => {
    this.updateSoundUi(isSoundEnabled());
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const active = document.activeElement?.tagName;
    if (active === 'INPUT' || active === 'TEXTAREA' || active === 'SELECT') return;

    if ((e.key === 'M' || e.key === 'm') && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      this.toggleMasterSound();
    }

    if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
      e.preventDefault();
      toggleBsl();
    }
  };

  private handleWindowMessage = (e: MessageEvent) => {
    if (!e.data || typeof e.data !== 'object') return;

    if (e.data.type === 'TOGGLE_BSL' || e.data.type === 'BSL_STATE_CHANGED') {
      const enabled = typeof e.data.enabled === 'boolean' ? e.data.enabled : e.data.active;
      if (typeof enabled === 'boolean' && enabled !== this.bsl) {
        setBslEnabled(enabled);
      }
    } else if (e.data.type === 'VOICE_TOGGLE' || e.data.type === 'SET_VOICE') {
      if (typeof e.data.enabled === 'boolean') {
        this.updateSoundUi(e.data.enabled);
      }
    } else if (e.data.type === 'SUBTITLE_UPDATE' || e.data.type === 'SPEECH_START') {
      const text = e.data.text || e.data.subtitle;
      if (text && typeof text === 'string') {
        broadcastBslSpeech({ subtitle: text, isSpeaking: true });
      }
    } else if (e.data.type === 'SPEECH_BOUNDARY' && e.data.word) {
      broadcastBslSpeech({ word: e.data.word, isSpeaking: true });
    } else if (e.data && (e.data.type === 'SPEECH_END' || e.data.type === 'SUBTITLE_CLEAR')) {
      broadcastBslSpeech({ isSpeaking: false });
    }
  };

  connectedCallback() {
    this.colorMode = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.dataSaver = isDataSaverActive();
    this.bsl = getBslEnabled();
    this.sound = isSoundEnabled();
    this.isOfflineSynced = isOfflineSyncComplete();
    document.documentElement.setAttribute('data-theme', this.colorMode);

    this.render();
    this.bindEvents();
    this.bindBeacon();

    this.unsubscribePlayerCalls = subscribeToPlayerCalls((options) => {
      if (options && options.preset) {
        navigate(`/player?preset=${encodeURIComponent(options.preset)}`);
      }
    });
  }

  private render() {
    const base = getBaseUrl();
    const currentLang = getSavedLanguage();

    this.innerHTML = `
      <div id="app-root-shell" style="display:flex; flex-direction:column; min-height:100vh; width:100%;">
        <div id="broadcast-banner" role="alert" style="display:none; padding:10px 16px; background:#0284c7; color:#fff; font-weight:700; font-size:0.9rem; align-items:center; justify-content:center; gap:8px;"></div>
        
        <header id="persistent-header-group" style="position:sticky; top:0; z-index:990; width:100%; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Universal Translator & Sensory Bar -->
          <div id="stj-universal-translator-bar" style="background:#0f172a; color:#f8fafc; font-size:0.75rem; padding:4px 1rem; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <span style="display:inline-flex; align-items:center; gap:4px; color:#38bdf8; font-weight:700;">
                <span>🌐</span> St Joseph's Universal Access
              </span>
              <span style="color:#475569;">|</span>
              <div style="display:inline-flex; align-items:center; gap:5px;">
                <label for="stj-lang-select" style="color:#94a3b8; font-size:0.72rem;">Language:</label>
                <select id="stj-lang-select" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:4px; font-size:0.72rem; padding:1px 6px; cursor:pointer;">
                  <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                  <option value="es" ${currentLang === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                  <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
                  <option value="la" ${currentLang === 'la' ? 'selected' : ''}>🇻🇦 Latina (Ecclesiastical)</option>
                  <option value="de" ${currentLang === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
                  <option value="pl" ${currentLang === 'pl' ? 'selected' : ''}>🇵🇱 Polski</option>
                  <option value="uk" ${currentLang === 'uk' ? 'selected' : ''}>🇺🇦 Українська</option>
                  <option value="pt" ${currentLang === 'pt' ? 'selected' : ''}>🇵🇹 Português</option>
                  <option value="ar" ${currentLang === 'ar' ? 'selected' : ''}>🇸🇦 العربية</option>
                </select>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <!-- Font Size Controls -->
              <div style="display:inline-flex; align-items:center; gap:2px; background:#1e293b; border-radius:4px; padding:2px; border:1px solid #334155;">
                <button type="button" id="btn-font-normal" style="background:transparent; border:none; color:#f8fafc; font-size:0.75rem; min-width:24px; min-height:24px; cursor:pointer; padding:2px 4px; display:inline-flex; align-items:center; justify-content:center;" title="Standard Font" aria-label="Standard Font Size">A</button>
                <button type="button" id="btn-font-large" style="background:transparent; border:none; color:#f8fafc; font-size:0.85rem; font-weight:700; min-width:24px; min-height:24px; cursor:pointer; padding:2px 4px; display:inline-flex; align-items:center; justify-content:center;" title="Large Font" aria-label="Large Font Size">A+</button>
              </div>

              <!-- High Contrast Toggle -->
              <button type="button" id="btn-contrast-toggle" aria-pressed="false" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; border-radius:4px; font-size:0.75rem; min-height:28px; padding:2px 8px; cursor:pointer; display:inline-flex; align-items:center;" title="Toggle High Contrast" aria-label="Toggle High Contrast Mode">
                🌓 Contrast
              </button>

              <!-- Master Audio / Sound Mute Toggle -->
              <button type="button" id="top-bar-sound-btn" aria-pressed="${this.sound ? 'true' : 'false'}" style="background:${this.sound ? '#0284c7' : '#1e293b'}; border:1px solid ${this.sound ? '#38bdf8' : '#334155'}; color:#f8fafc; border-radius:4px; font-size:0.75rem; min-height:28px; padding:2px 8px; font-weight:700; cursor:pointer; min-width:86px; text-align:center; flex-shrink:0;" title="Toggle Classroom Sound Effects and Narration (M)" aria-label="Toggle Sound Effects and Narration Audio">
                ${this.sound ? '🔊 Sound: ON' : '🔇 Mute'}
              </button>

              <!-- BSL Quick Toggle -->
              <button type="button" id="top-bar-bsl-btn" aria-pressed="${this.bsl ? 'true' : 'false'}" style="background:${this.bsl ? '#0284c7' : '#1e293b'}; border:1px solid ${this.bsl ? '#38bdf8' : '#334155'}; color:#f8fafc; border-radius:4px; font-size:0.75rem; min-height:28px; padding:2px 8px; font-weight:700; cursor:pointer; min-width:86px; text-align:center; flex-shrink:0;" title="British Sign Language (Shift+B)" aria-label="Toggle British Sign Language Interpreter">
                🖐️ BSL: ${this.bsl ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <!-- Main Navigation Bar -->
          <nav id="persistent-site-navbar" role="navigation" aria-label="Main Navigation" style="background:var(--stj-canvas, #ffffff); border-bottom:1px solid var(--stj-border, #e2e8f0); width:100%;">
            <div style="max-width:1360px; margin:0 auto; padding:0 1rem; height:54px; display:flex; align-items:center; justify-content:space-between;">
              
              <!-- Brand -->
              <div style="display:flex; align-items:center; gap:0.75rem; flex-shrink:0;">
                <a href="${base}" aria-label="St Joseph's Curriculum Portal Homepage" style="display:flex; align-items:center; gap:0.6rem; text-decoration:none; color:inherit;">
                  <img src="${base}img/logo.svg" alt="St Joseph's Logo" style="width:28px; height:28px; display:block;" onerror="this.onerror=null; this.src='${base}img/favicon-32x32.png';" />
                  <span style="font-weight:800; font-size:1.05rem; letter-spacing:-0.01em; color:var(--stj-text, #0f172a);">
                    St Joseph's Portal
                  </span>
                </a>
                <span class="hidden lg:inline-flex" style="font-size:0.75rem; color:#64748b; font-weight:500;">
                  Education should be free
                </span>
              </div>

              <!-- Desktop Navigation Links -->
              <div class="desktop-nav-items" style="display:flex; align-items:center; gap:0.35rem;">
                <a href="${base}" class="nav-link" style="padding:0.4rem 0.65rem; font-size:0.88rem; font-weight:600; text-decoration:none; color:var(--stj-text, #0f172a); border-radius:6px;">
                  Home
                </a>

                <!-- Dedicated Catholic Sanctuary Dropdown -->
                <div class="nav-dropdown-wrapper" style="position:relative; display:inline-block;">
                  <button type="button" id="nav-dropdown-catholic-btn" aria-haspopup="true" aria-expanded="false" aria-controls="nav-dropdown-catholic-menu" aria-label="Catholic Sanctuary Menu" style="background:rgba(202, 138, 4, 0.12); border:1px solid rgba(202, 138, 4, 0.4); padding:0.35rem 0.65rem; font-size:0.88rem; font-weight:700; color:#92400e; border-radius:6px; cursor:pointer; display:flex; align-items:center; gap:5px;" title="Whole-School Catholic Life, Mass, Sacraments & CST">
                    <span>✝️ Catholic Sanctuary</span>
                    <span style="font-size:0.6rem; opacity:0.8;">▼</span>
                  </button>
                  <div id="nav-dropdown-catholic-menu" class="shell-dropdown-menu" style="border-color:#ca8a04;">
                    ${CATHOLIC_SANCTUARY_ITEMS.map((item) => `
                      <a href="${base}${item.path}" class="shell-dropdown-item">
                        <span>${item.icon}</span> <strong>${item.label}</strong>
                      </a>
                    `).join('')}
                  </div>
                </div>

                <!-- Academic Teaching & Curriculum Dropdown -->
                <div class="nav-dropdown-wrapper" style="position:relative; display:inline-block;">
                  <button type="button" id="nav-dropdown-learning-btn" aria-haspopup="true" aria-expanded="false" aria-controls="nav-dropdown-learning-menu" aria-label="Teaching and Curriculum Menu" class="shell-nav-link" style="background:transparent; border:none; cursor:pointer;">
                    <span>Teaching &amp; Curriculum</span>
                    <span style="font-size:0.6rem; opacity:0.7;">▼</span>
                  </button>
                  <div id="nav-dropdown-learning-menu" class="shell-dropdown-menu">
                    ${CURRICULUM_LAB_ITEMS.map((item) => `
                      <a href="${base}${item.path}" class="shell-dropdown-item">
                        <span>${item.icon}</span> <strong>${item.label}</strong>
                      </a>
                    `).join('')}
                  </div>
                </div>

                <a href="${base}player" class="shell-nav-link" title="Interactive STEM & Visual Simulators">
                  🎮 Simulators
                </a>

                <!-- Educator & Admin Dropdown -->
                <div class="nav-dropdown-wrapper" style="position:relative; display:inline-block;">
                  <button type="button" id="nav-dropdown-admin-btn" aria-haspopup="true" aria-expanded="false" aria-controls="nav-dropdown-admin-menu" aria-label="Educator and Admin Menu" class="shell-nav-link" style="background:transparent; border:none; cursor:pointer;">
                    <span>Educator</span>
                    <span style="font-size:0.6rem; opacity:0.7;">▼</span>
                  </button>
                  <div id="nav-dropdown-admin-menu" class="shell-dropdown-menu" style="width:280px; max-width:90vw; right:0;">
                    ${SCHOOL_GOVERNANCE_ITEMS.map((item) => `
                      <a href="${base}${item.path}" class="shell-dropdown-item">
                        <span>${item.icon}</span> <strong>${item.label}</strong>
                      </a>
                    `).join('')}
                  </div>
                </div>

                <a href="${base}news" class="shell-nav-link">
                  📰 News
                </a>
              </div>

              <!-- Right Actions -->
              <div style="display:flex; align-items:center; gap:0.5rem; flex-shrink:0;">
                <button type="button" id="nav-btn-sound" class="hidden sm:inline-flex" aria-pressed="${this.sound ? 'true' : 'false'}" style="background:${this.sound ? '#eff6ff' : '#fef2f2'}; color:${this.sound ? '#1d4ed8' : '#b91c1c'}; border:1px solid ${this.sound ? '#93c5fd' : '#fecaca'}; border-radius:6px; padding:0.35rem 0.6rem; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Toggle Classroom Sound Effects and Narration (M)" aria-label="Toggle Sound Effects and Narration Audio">
                  ${this.sound ? '🔊 Sound: ON' : '🔇 Mute'}
                </button>

                <button type="button" id="nav-btn-offline-sync" aria-pressed="${this.isOfflineSynced ? 'true' : 'false'}" class="hidden sm:inline-flex" style="background:${this.isOfflineSynced ? '#ecfdf5' : '#eff6ff'}; color:${this.isOfflineSynced ? '#065f46' : '#1d4ed8'}; border:1px solid ${this.isOfflineSynced ? '#10b981' : '#93c5fd'}; border-radius:6px; padding:0.35rem 0.6rem; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Sync Curriculum for 100% Zero-Data Offline Operation" aria-label="Sync Curriculum for Zero Data Offline Operation">
                  ${this.isOfflineSynced ? '💾 Saved (0 Data)' : '💾 Save Offline'}
                </button>

                <button type="button" id="nav-btn-data-saver" aria-pressed="${this.dataSaver ? 'true' : 'false'}" class="hidden sm:inline-flex" style="background:${this.dataSaver ? '#ecfdf5' : 'transparent'}; color:${this.dataSaver ? '#065f46' : '#64748b'}; border:1px solid ${this.dataSaver ? '#10b981' : '#cbd5e1'}; border-radius:6px; padding:0.35rem 0.6rem; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Low Bandwidth Data Saver" aria-label="Toggle Low Bandwidth Data Saver Mode">
                  📶 ${this.dataSaver ? 'Data Saver: ON' : 'Data Saver'}
                </button>

                <a href="${base}settings" id="nav-btn-settings" class="hidden sm:inline-flex" style="padding:0.35rem 0.6rem; font-size:0.8rem; font-weight:700; color:#475569; border:1px solid #cbd5e1; border-radius:6px; text-decoration:none; align-items:center; gap:4px;" title="System Settings" aria-label="System Settings">
                  <span>⚙️</span> <span>Settings</span>
                </a>

                <button type="button" id="nav-btn-theme" style="background:transparent; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; padding:0.35rem 0.55rem; font-size:0.9rem;" title="Toggle Dark/Light Mode" aria-label="Toggle Dark or Light Mode">
                  ${this.colorMode === 'dark' ? '☀️' : '🌙'}
                </button>

                <button type="button" id="nav-btn-mobile" class="mobile-menu-button" aria-expanded="false" aria-controls="nav-mobile-drawer" style="background:transparent; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; padding:0.35rem 0.55rem; font-size:1rem;" aria-label="Toggle Navigation Menu">
                  ☰
                </button>
              </div>
            </div>

            <!-- Mobile Drawer -->
            <div id="nav-mobile-drawer" class="shell-mobile-drawer">
              <div style="font-weight:700; font-size:0.8rem; color:#64748b; text-transform:uppercase;">Navigation Menu</div>
              <button type="button" id="mobile-btn-offline-sync" style="padding:10px; border-radius:6px; background:${this.isOfflineSynced ? '#ecfdf5' : '#eff6ff'}; color:${this.isOfflineSynced ? '#065f46' : '#1d4ed8'}; border:1px solid ${this.isOfflineSynced ? '#10b981' : '#93c5fd'}; font-weight:700; font-size:0.85rem; cursor:pointer; text-align:left;">
                ${this.isOfflineSynced ? '💾 Saved to Device (0 Data)' : '💾 Save to Device (0 Data Offline)'}
              </button>
              <a href="${base}" class="mobile-nav-link" style="padding:8px; border-radius:6px; text-decoration:none; color:inherit; font-weight:700;">🏠 Home</a>
              
              ${NAV_GROUPS.map((group) => `
                <div style="font-size:0.72rem; font-weight:800; color:${group.color || '#ca8a04'}; text-transform:uppercase; letter-spacing:0.05em; padding:8px 8px 2px;">
                  ${group.icon} ${group.label}
                </div>
                ${group.items.map((item) => `
                  <a href="${base}${item.path}" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                    ${item.icon} ${item.label}
                  </a>
                `).join('')}
              `).join('')}
            </div>
          </nav>
        </header>

        <!-- Main Page Outlet -->
        <main id="ast-persistent-viewport" class="ast-viewport-stage" style="flex:1 0 auto; display:flex; flex-direction:column; width:100%;">
          <div id="page-outlet"></div>
        </main>

        <!-- Persistent Footer -->
        <footer id="persistent-footer" class="shell-footer">
          <div class="shell-footer-grid">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <img src="${base}img/logo.svg" alt="Logo" style="width:24px; height:24px;" onerror="this.onerror=null; this.src='${base}img/favicon-32x32.png';" />
                <strong style="color:#f8fafc; font-size:1.05rem;">St Joseph's Curriculum Portal</strong>
              </div>
              <p style="color:#94a3b8; font-size:0.84rem; line-height:1.6; margin:0 0 12px 0;">
                High-performance offline educational technology engineered for Key Stages 1–4. Zero advertising, zero tracking, and 100% free forever for all pupils, Catholic schools, and families.
              </p>
              <div style="display:flex; gap:8px; font-size:0.78rem; color:#38bdf8;">
                <span>✝️ Catholic Ethos</span> &bull; <span>🌱 Works Offline</span> &bull; <span>⚡ Sub-15ms Launch</span>
              </div>
            </div>

            ${NAV_GROUPS.map((group) => `
              <div class="shell-footer-col">
                <strong style="display:block; color:#f8fafc; margin-bottom:12px; font-size:0.92rem;">${group.icon} ${group.label}</strong>
                <div style="display:flex; flex-direction:column; gap:8px; font-size:0.84rem;">
                  ${group.items.map((item) => `
                    <a href="${base}${item.path}">
                      <span>${item.icon}</span> ${item.label}
                    </a>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="max-width:1200px; margin:0 auto; padding-top:1.5rem; border-top:1px solid #1e293b; text-align:center; font-size:0.8rem; color:#64748b;">
            St Joseph's Learning Portal &bull; Curriculum content licensed under 
            <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noreferrer" style="color:#38bdf8;">OGL v3.0</a>. 
            Engine code dual-licensed under 
            <a href="https://github.com/josephbrewerton-oss/schoolsample" target="_blank" rel="noreferrer" style="color:#38bdf8;">AGPLv3 (Source Repository)</a>. 
            Designed for zero-data offline learning.
          </div>
        </footer>

        <div id="bsl-overlay-slot" style="position:fixed; bottom:0; right:0; pointer-events:none; z-index:9995;"></div>
        <div id="modal-slot"></div>
        <iframe id="neural-worker-guest-vm" src="${base}worker.html?v=1.3.0" style="display:none;" title="neural-worker-guest-vm"></iframe>
      </div>
    `;

    const vmFrame = this.querySelector<HTMLIFrameElement>('#neural-worker-guest-vm');
    if (vmFrame) {
      import('../engine/hypervisor').then(({ hypervisor }) => {
        hypervisor?.registerWorkerIframe?.(vmFrame);
      }).catch((err) => {
        console.warn('[PersistentAppShell] Could not initialize neural hypervisor:', err);
      });
    }
  }

  private bindEvents() {
    const base = getBaseUrl();

    // 1. Hoist all dropdown menu references
    const btnCatholic = this.querySelector<HTMLButtonElement>('#nav-dropdown-catholic-btn');
    const menuCatholic = this.querySelector<HTMLDivElement>('#nav-dropdown-catholic-menu');

    const btnLearning = this.querySelector<HTMLButtonElement>('#nav-dropdown-learning-btn');
    const menuLearning = this.querySelector<HTMLDivElement>('#nav-dropdown-learning-menu');

    const btnAdmin = this.querySelector<HTMLButtonElement>('#nav-dropdown-admin-btn');
    const menuAdmin = this.querySelector<HTMLDivElement>('#nav-dropdown-admin-menu');

    btnCatholic?.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = menuCatholic?.style.display !== 'flex';
      this.handleDocumentClick();
      if (menuCatholic && willOpen) {
        menuCatholic.style.display = 'flex';
        btnCatholic.setAttribute('aria-expanded', 'true');
      }
    });

    btnLearning?.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = menuLearning?.style.display !== 'flex';
      this.handleDocumentClick();
      if (menuLearning && willOpen) {
        menuLearning.style.display = 'flex';
        btnLearning.setAttribute('aria-expanded', 'true');
      }
    });

    btnAdmin?.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = menuAdmin?.style.display !== 'flex';
      this.handleDocumentClick();
      if (menuAdmin && willOpen) {
        menuAdmin.style.display = 'flex';
        btnAdmin.setAttribute('aria-expanded', 'true');
      }
    });

    // Attach global click to bound method
    document.addEventListener('click', this.handleDocumentClick);

    // Language select
    const langSelect = this.querySelector<HTMLSelectElement>('#stj-lang-select');
    langSelect?.addEventListener('change', (e) => {
      const newLang = (e.target as HTMLSelectElement).value;
      setSavedLanguage(newLang);
    });

    this.unsubscribeLang = listenToLanguageChange((lang) => {
      if (langSelect && langSelect.value !== lang) {
        langSelect.value = lang;
      }
    });

    // Font size
    const btnFontNormal = this.querySelector('#btn-font-normal');
    const btnFontLarge = this.querySelector('#btn-font-large');
    btnFontNormal?.addEventListener('click', () => {
      document.documentElement.setAttribute('data-font-size', 'normal');
      localStorage.setItem('app_font_size', 'normal');
    });
    btnFontLarge?.addEventListener('click', () => {
      document.documentElement.setAttribute('data-font-size', 'large');
      localStorage.setItem('app_font_size', 'large');
    });

    // Contrast
    const btnContrast = this.querySelector<HTMLButtonElement>('#btn-contrast-toggle');
    btnContrast?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-high-contrast') === 'true';
      const next = !current;
      document.documentElement.setAttribute('data-high-contrast', String(next));
      btnContrast.setAttribute('aria-pressed', String(next));
      localStorage.setItem('app_high_contrast', String(next));
    });

    // BSL top button
    const btnBsl = this.querySelector<HTMLButtonElement>('#top-bar-bsl-btn');
    btnBsl?.addEventListener('click', () => {
      toggleBsl();
    });

    // Data saver button
    const btnDataSaver = this.querySelector<HTMLButtonElement>('#nav-btn-data-saver');
    btnDataSaver?.addEventListener('click', () => {
      setDataSaverMode(!this.dataSaver);
    });

    this.unsubscribeDataSaver = listenToDataSaverChanges((active) => {
      this.dataSaver = active;
      if (btnDataSaver) {
        btnDataSaver.textContent = active ? '📶 Data Saver: ON' : '📶 Data Saver';
        btnDataSaver.setAttribute('aria-pressed', String(active));
        btnDataSaver.style.background = active ? '#ecfdf5' : 'transparent';
        btnDataSaver.style.color = active ? '#065f46' : '#64748b';
        btnDataSaver.style.borderColor = active ? '#10b981' : '#cbd5e1';
      }
    });

    // Theme toggle
    const btnTheme = this.querySelector<HTMLButtonElement>('#nav-btn-theme');
    btnTheme?.addEventListener('click', () => {
      this.colorMode = this.colorMode === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.colorMode);
      localStorage.setItem('theme', this.colorMode);
      if (btnTheme) btnTheme.textContent = this.colorMode === 'dark' ? '☀️' : '🌙';
    });

    // Offline Sync (Zero Data)
    const btnOfflineSync = this.querySelector<HTMLButtonElement>('#nav-btn-offline-sync');
    const btnMobileOfflineSync = this.querySelector<HTMLButtonElement>('#mobile-btn-offline-sync');
    const handleSync = async () => {
      const updateSyncBtns = (text: string, isDone = false) => {
        if (btnOfflineSync) {
          btnOfflineSync.textContent = text;
          if (isDone) {
            btnOfflineSync.style.background = '#ecfdf5';
            btnOfflineSync.style.color = '#065f46';
            btnOfflineSync.style.borderColor = '#10b981';
          }
        }
        if (btnMobileOfflineSync) {
          btnMobileOfflineSync.textContent = text;
          if (isDone) {
            btnMobileOfflineSync.style.background = '#ecfdf5';
            btnMobileOfflineSync.style.color = '#065f46';
            btnMobileOfflineSync.style.borderColor = '#10b981';
          }
        }
      };

      updateSyncBtns('⏳ Syncing...');
      try {
        const ok = await syncEntireCurriculumOffline((progress) => {
          updateSyncBtns(`⏳ ${progress.percentage}%`);
        });
        if (ok) {
          this.isOfflineSynced = true;
          updateSyncBtns('💾 Saved (0 Data)', true);
          playSuccessChime();
          triggerHapticSuccess();
        } else {
          updateSyncBtns('💾 Save Offline');
        }
      } catch (err) {
        console.warn('Offline sync failed', err);
        updateSyncBtns('💾 Save Offline');
      }
    };
    btnOfflineSync?.addEventListener('click', handleSync);
    btnMobileOfflineSync?.addEventListener('click', handleSync);

    // Mobile menu toggle
    const btnMobile = this.querySelector<HTMLButtonElement>('#nav-btn-mobile');
    const drawerMobile = this.querySelector<HTMLDivElement>('#nav-mobile-drawer');
    btnMobile?.addEventListener('click', () => {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      if (drawerMobile) drawerMobile.style.display = this.mobileMenuOpen ? 'flex' : 'none';
      if (btnMobile) {
        btnMobile.textContent = this.mobileMenuOpen ? '✕' : '☰';
        btnMobile.setAttribute('aria-expanded', String(this.mobileMenuOpen));
      }
    });

    // Close mobile drawer on any link click
    this.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        this.mobileMenuOpen = false;
        if (drawerMobile) drawerMobile.style.display = 'none';
        if (btnMobile) {
          btnMobile.textContent = '☰';
          btnMobile.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Sound toggle buttons
    const btnSound = this.querySelector<HTMLButtonElement>('#top-bar-sound-btn');
    const btnNavSound = this.querySelector<HTMLButtonElement>('#nav-btn-sound');
    btnSound?.addEventListener('click', this.toggleMasterSound);
    btnNavSound?.addEventListener('click', this.toggleMasterSound);

    // Global sound updates
    window.addEventListener('stj_sound_haptics_updated', this.handleSoundUpdated);
    this.unsubscribeVoice = subscribeVoice((enabled) => {
      this.updateSoundUi(enabled && isSoundEnabled());
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', this.handleKeyDown);

    // BSL on-demand lazy subscriber
    const bslSlot = this.querySelector('#bsl-overlay-slot')!;
    this.unsubscribeBsl = subscribeBsl(async (enabled) => {
      this.bsl = enabled;
      if (btnBsl) {
        btnBsl.textContent = `🖐️ BSL: ${enabled ? 'ON' : 'OFF'}`;
        btnBsl.style.background = enabled ? '#0284c7' : '#1e293b';
        btnBsl.style.borderColor = enabled ? '#38bdf8' : '#334155';
        btnBsl.setAttribute('aria-pressed', String(enabled));
      }
      if (enabled) {
        const { initCustomSignsIntoLexicon } = await import('../services/customSignStore');
        initCustomSignsIntoLexicon();
        await import('./NativeBslInterpreter');
        bslSlot.innerHTML = `<native-bsl-interpreter></native-bsl-interpreter>`;
      } else {
        bslSlot.innerHTML = '';
      }
    });

    // Inter-frame IPC listener
    window.addEventListener('message', this.handleWindowMessage);
  }

  private bindBeacon() {
    const banner = this.querySelector<HTMLDivElement>('#broadcast-banner')!;
    
    classroomBeacon.startStudentBeacon(
      () => ({
        studentId: 'desk_pupil',
        activeTopic: window.location.pathname.replace(/^\//, '') || 'Home',
        status: 'active'
      }),
      (command) => {
        banner.style.display = 'flex';
        banner.textContent = `📢 Teacher Broadcast: ${command.message || 'Attention please!'}`;
        
        if (command.type === 'BROADCAST_AST_SCENE' && command.preset) {
          playSuccessChime();
          triggerHapticSuccess();
          navigate(`/player?preset=${encodeURIComponent(command.preset)}`);
        }
        setTimeout(() => { banner.style.display = 'none'; }, 6000);
      }
    );
  }

  disconnectedCallback() {
    // 1. Reactive store unsubscribes
    this.unsubscribeBsl?.();
    this.unsubscribeDataSaver?.();
    this.unsubscribeLang?.();
    this.unsubscribePlayerCalls?.();
    this.unsubscribeVoice?.();

    // 2. Beacon shutdown
    classroomBeacon.stopStudentBeacon();

    // 3. Detach global window and document listeners
    document.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('stj_sound_haptics_updated', this.handleSoundUpdated);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('message', this.handleWindowMessage);
  }
}

if (!customElements.get('app-shell')) {
  customElements.define('app-shell', PersistentAppShellElement);
}

export default PersistentAppShellElement;