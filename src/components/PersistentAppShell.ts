import { classroomBeacon } from '../services/classroomBeacon';
import { playSuccessChime, triggerHapticSuccess } from '../services/soundHaptics';
import { toggleBsl, setBslEnabled, subscribeBsl, getBslEnabled, broadcastBslSpeech } from '../services/bslGlobalStore';
import { initCustomSignsIntoLexicon } from '../services/customSignStore';
import { isDataSaverActive, setDataSaverMode, listenToDataSaverChanges } from '../services/dataSaverStore';
import { isOfflineSyncComplete, syncEntireCurriculumOffline } from '../services/offlineSync';
import { getSavedLanguage, setSavedLanguage, listenToLanguageChange } from '../engine/operational-language';
import { navigate } from '../router';
import { getBaseUrl } from '../utils/url';
import { subscribeToPlayerCalls } from '../services/playerLauncher';
import './NativeBslInterpreter';
import type { NativeBslInterpreterElement } from './NativeBslInterpreter';

export class PersistentAppShellElement extends HTMLElement {
  private mobileMenuOpen = false;
  private openDropdown: 'learning' | 'admin' | null = null;
  private colorMode: 'light' | 'dark' = 'light';
  private dataSaver = false;
  private bsl = false;
  private isOfflineSynced = false;
  private unsubscribeBsl?: () => void;
  private unsubscribeDataSaver?: () => void;
  private unsubscribeLang?: () => void;
  private unsubscribePlayerCalls?: () => void;

  connectedCallback() {
    this.colorMode = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.dataSaver = isDataSaverActive();
    this.bsl = getBslEnabled();
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
              <div style="display:inline-flex; align-items:center; gap:2px; background:#1e293b; border-radius:4px; padding:1px 4px; border:1px solid #334155;">
                <button type="button" id="btn-font-normal" style="background:transparent; border:none; color:#f8fafc; font-size:0.7rem; cursor:pointer; padding:1px 4px;" title="Standard Font" aria-label="Standard Font Size">A</button>
                <button type="button" id="btn-font-large" style="background:transparent; border:none; color:#f8fafc; font-size:0.8rem; font-weight:700; cursor:pointer; padding:1px 4px;" title="Large Font" aria-label="Large Font Size">A+</button>
              </div>

              <!-- High Contrast Toggle -->
              <button type="button" id="btn-contrast-toggle" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; border-radius:4px; font-size:0.72rem; padding:2px 6px; cursor:pointer;" title="Toggle High Contrast" aria-label="Toggle High Contrast Mode">
                🌓 Contrast
              </button>

              <!-- BSL Quick Toggle -->
              <button type="button" id="top-bar-bsl-btn" style="background:${this.bsl ? '#0284c7' : '#1e293b'}; border:1px solid ${this.bsl ? '#38bdf8' : '#334155'}; color:#f8fafc; border-radius:4px; font-size:0.72rem; padding:2px 8px; font-weight:700; cursor:pointer;" title="British Sign Language (Shift+B)" aria-label="Toggle British Sign Language Interpreter">
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
                  <img src="${base}img/logo.svg" alt="St Joseph's Logo" style="width:28px; height:28px; display:block;" onerror="this.src='${base}img/favicon-32x32.png'" />
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
                  <button type="button" id="nav-dropdown-catholic-btn" aria-haspopup="true" aria-expanded="false" aria-label="Catholic Sanctuary Menu" style="background:rgba(202, 138, 4, 0.12); border:1px solid rgba(202, 138, 4, 0.4); padding:0.35rem 0.65rem; font-size:0.88rem; font-weight:700; color:#b45309; border-radius:6px; cursor:pointer; display:flex; align-items:center; gap:5px;" title="Whole-School Catholic Life, Mass, Sacraments & CST">
                    <span>✝️ Catholic Sanctuary</span>
                    <span style="font-size:0.6rem; opacity:0.8;">▼</span>
                  </button>
                  <div id="nav-dropdown-catholic-menu" style="display:none; position:absolute; top:100%; left:0; width:310px; background:var(--stj-canvas, #ffffff); border:1.5px solid #ca8a04; border-radius:10px; box-shadow:0 12px 28px -4px rgba(202,138,4,0.25); padding:0.5rem; z-index:1000; flex-direction:column; gap:2px;">
                    <a href="${base}catholic-life" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>📖</span> <strong>Sanctuary Overview &amp; AMDG</strong>
                    </a>
                    <a href="${base}catholic-life?tab=altar-anatomy" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🕯️</span> <strong>High Altar &amp; Sanctuary Explorer</strong>
                    </a>
                    <a href="${base}catholic-life?tab=church-tour" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🏛️</span> <strong>Church Architecture 3D Tour</strong>
                    </a>
                    <a href="${base}catholic-life?tab=latin-prayers" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🇻🇦</span> <strong>Latin Mass Prayers Chapel</strong>
                    </a>
                    <a href="${base}catholic-life?tab=mass" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🍞</span> <strong>The Holy Mass Step-by-Step</strong>
                    </a>
                    <a href="${base}catholic-life?tab=sacraments" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🕊️</span> <strong>The Seven Sacraments</strong>
                    </a>
                    <a href="${base}catholic-life?tab=rosary" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>📿</span> <strong>The Holy Rosary Walk</strong>
                    </a>
                    <a href="${base}catholic-life?tab=cst" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🌱</span> <strong>Catholic Social Teaching (CST)</strong>
                    </a>
                  </div>
                </div>

                <!-- Academic Teaching & Curriculum Dropdown -->
                <div class="nav-dropdown-wrapper" style="position:relative; display:inline-block;">
                  <button type="button" id="nav-dropdown-learning-btn" aria-haspopup="true" aria-expanded="false" aria-label="Teaching and Curriculum Menu" style="background:transparent; border:none; padding:0.4rem 0.65rem; font-size:0.88rem; font-weight:600; color:var(--stj-text, #0f172a); border-radius:6px; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    <span>Teaching &amp; Curriculum</span>
                    <span style="font-size:0.6rem; opacity:0.7;">▼</span>
                  </button>
                  <div id="nav-dropdown-learning-menu" style="display:none; position:absolute; top:100%; left:0; width:290px; background:var(--stj-canvas, #ffffff); border:1px solid var(--stj-border, #e2e8f0); border-radius:10px; box-shadow:0 12px 28px -4px rgba(0,0,0,0.18); padding:0.5rem; z-index:1000; flex-direction:column; gap:2px;">
                    <a href="${base}learning-zone" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>📖</span> <strong>Lessons &amp; Curriculum</strong>
                    </a>
                    <a href="${base}learning-zone?tab=constellation" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>✨</span> <strong>Concept Constellation</strong>
                    </a>
                    <a href="${base}practice-lab" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>⚡</span> <strong>Practice Lab Drills</strong>
                    </a>
                    <a href="${base}languages" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🌍</span> <strong>MFL &amp; Polyglot Studio</strong>
                    </a>
                    <a href="${base}phonics" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🔤</span> <strong>EYFS &amp; KS1 Phonics Lab</strong>
                    </a>
                    <a href="${base}shakespeare" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🎭</span> <strong>Shakespeare Globe Theatre</strong>
                    </a>
                    <a href="${base}profile" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>⭐</span> <strong>Student Progress &amp; Badges</strong>
                    </a>
                  </div>
                </div>

                <a href="${base}player" class="nav-link" style="padding:0.4rem 0.65rem; font-size:0.88rem; font-weight:600; text-decoration:none; color:var(--stj-text, #0f172a); border-radius:6px;" title="Interactive STEM & Visual Simulators">
                  🎮 Simulators
                </a>

                <!-- Educator & Admin Dropdown -->
                <div class="nav-dropdown-wrapper" style="position:relative; display:inline-block;">
                  <button type="button" id="nav-dropdown-admin-btn" style="background:transparent; border:none; padding:0.4rem 0.65rem; font-size:0.88rem; font-weight:600; color:var(--stj-text, #0f172a); border-radius:6px; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    <span>Educator</span>
                    <span style="font-size:0.6rem; opacity:0.7;">▼</span>
                  </button>
                  <div id="nav-dropdown-admin-menu" style="display:none; position:absolute; top:100%; left:0; width:280px; background:var(--stj-canvas, #ffffff); border:1px solid var(--stj-border, #e2e8f0); border-radius:10px; box-shadow:0 12px 28px -4px rgba(0,0,0,0.18); padding:0.5rem; z-index:1000; flex-direction:column; gap:2px;">
                    <a href="${base}teacher-beacon" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>📡</span> <strong>Teacher Beacon</strong>
                    </a>
                    <a href="${base}curriculum-studio" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🛠️</span> <strong>Curriculum Studio</strong>
                    </a>
                    <a href="${base}licensing" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>⚖️</span> <strong>MAT SLA &amp; Licensing</strong>
                    </a>
                    <a href="${base}privacy" class="dropdown-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">
                      <span>🛡️</span> <strong>Edge Privacy Guard</strong>
                    </a>
                  </div>
                </div>

                <a href="${base}news" class="nav-link" style="padding:0.4rem 0.65rem; font-size:0.88rem; font-weight:600; text-decoration:none; color:var(--stj-text, #0f172a); border-radius:6px;">
                  📰 News
                </a>
              </div>

              <!-- Right Actions (Data Saver, Settings, Theme, Mobile toggle) -->
              <div style="display:flex; align-items:center; gap:0.5rem; flex-shrink:0;">
                <!-- Save Offline (0 Data) Button -->
                <button type="button" id="nav-btn-offline-sync" class="hidden sm:inline-flex" style="background:${this.isOfflineSynced ? '#ecfdf5' : '#eff6ff'}; color:${this.isOfflineSynced ? '#065f46' : '#1d4ed8'}; border:1px solid ${this.isOfflineSynced ? '#10b981' : '#93c5fd'}; border-radius:6px; padding:0.35rem 0.6rem; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Sync Curriculum for 100% Zero-Data Offline Operation" aria-label="Sync Curriculum for Zero Data Offline Operation">
                  ${this.isOfflineSynced ? '💾 Saved (0 Data)' : '💾 Save Offline'}
                </button>

                <!-- Data Saver Toggle -->
                <button type="button" id="nav-btn-data-saver" class="hidden sm:inline-flex" style="background:${this.dataSaver ? '#ecfdf5' : 'transparent'}; color:${this.dataSaver ? '#065f46' : '#64748b'}; border:1px solid ${this.dataSaver ? '#10b981' : '#cbd5e1'}; border-radius:6px; padding:0.35rem 0.6rem; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Low Bandwidth Data Saver" aria-label="Toggle Low Bandwidth Data Saver Mode">
                  📶 ${this.dataSaver ? 'Data Saver: ON' : 'Data Saver'}
                </button>

                <!-- Settings Link -->
                <a href="${base}settings" id="nav-btn-settings" class="hidden sm:inline-flex" style="padding:0.35rem 0.6rem; font-size:0.8rem; font-weight:700; color:#475569; border:1px solid #cbd5e1; border-radius:6px; text-decoration:none; align-items:center; gap:4px;" title="System Settings" aria-label="System Settings">
                  <span>⚙️</span> <span>Settings</span>
                </a>

                <!-- Theme Toggle -->
                <button type="button" id="nav-btn-theme" style="background:transparent; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; padding:0.35rem 0.55rem; font-size:0.9rem;" title="Toggle Dark/Light Mode" aria-label="Toggle Dark or Light Mode">
                  ${this.colorMode === 'dark' ? '☀️' : '🌙'}
                </button>

                <!-- Mobile Hamburger Button -->
                <button type="button" id="nav-btn-mobile" class="mobile-menu-button" style="background:transparent; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; padding:0.35rem 0.55rem; font-size:1rem;" aria-label="Toggle Navigation Menu">
                  ☰
                </button>
              </div>
            </div>

            <!-- Mobile Drawer -->
            <div id="nav-mobile-drawer" style="display:none; padding:1rem; border-top:1px solid #e2e8f0; background:var(--stj-canvas, #ffffff); flex-direction:column; gap:0.75rem;">
              <div style="font-weight:700; font-size:0.8rem; color:#64748b; text-transform:uppercase;">Navigation Menu</div>
              <button type="button" id="mobile-btn-offline-sync" style="padding:10px; border-radius:6px; background:${this.isOfflineSynced ? '#ecfdf5' : '#eff6ff'}; color:${this.isOfflineSynced ? '#065f46' : '#1d4ed8'}; border:1px solid ${this.isOfflineSynced ? '#10b981' : '#93c5fd'}; font-weight:700; font-size:0.85rem; cursor:pointer; text-align:left;">
                ${this.isOfflineSynced ? '💾 Saved to Device (0 Data)' : '💾 Save to Device (0 Data Offline)'}
              </button>
              <a href="${base}" class="mobile-nav-link" style="padding:8px; border-radius:6px; text-decoration:none; color:inherit; font-weight:700;">🏠 Home</a>
              
              <div style="font-size:0.72rem; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.05em; padding:8px 8px 2px;">✝️ Catholic Sanctuary</div>
              <a href="${base}catholic-life" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">📖 Sanctuary Overview</a>
              <a href="${base}catholic-life?tab=altar-anatomy" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🕯️ High Altar Explorer</a>
              <a href="${base}catholic-life?tab=church-tour" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🏛️ Church 3D Tour</a>
              <a href="${base}catholic-life?tab=latin-prayers" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🇻🇦 Latin Mass Prayers</a>
              <a href="${base}catholic-life?tab=mass" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🍞 The Holy Mass</a>

              <div style="font-size:0.72rem; font-weight:800; color:#0284c7; text-transform:uppercase; letter-spacing:0.05em; padding:8px 8px 2px;">📚 Teaching &amp; Curriculum</div>
              <a href="${base}learning-zone" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">📖 Lessons &amp; Units</a>
              <a href="${base}learning-zone?tab=constellation" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">✨ Concept Constellation</a>
              <a href="${base}practice-lab" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">⚡ Practice Lab Drills</a>
              <a href="${base}languages" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🌍 Languages &amp; MFL</a>
              <a href="${base}phonics" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🔤 EYFS / KS1 Phonics</a>
              <a href="${base}shakespeare" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🎭 Shakespeare Theatre</a>

              <div style="font-size:0.72rem; font-weight:800; color:#10b981; text-transform:uppercase; letter-spacing:0.05em; padding:8px 8px 2px;">🎮 Simulators &amp; Studio</div>
              <a href="${base}player" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🎮 AST Vector Simulators</a>
              <a href="${base}teacher-beacon" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">📡 Teacher Beacon</a>
              <a href="${base}curriculum-studio" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">🛠️ Curriculum Studio</a>
              <a href="${base}settings" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">⚙️ Settings</a>
              <a href="${base}news" class="mobile-nav-link" style="padding:6px 8px 6px 14px; border-radius:6px; text-decoration:none; color:inherit; font-size:0.84rem;">📰 News &amp; Updates</a>
            </div>
          </nav>
        </header>

        <!-- Main Page Outlet -->
        <main id="ast-persistent-viewport" class="ast-viewport-stage" style="flex:1 0 auto; display:flex; flex-direction:column; width:100%;">
          <div id="page-outlet"></div>
        </main>

        <!-- Persistent Footer -->
        <footer id="persistent-footer" style="background:#0f172a; color:#cbd5e1; padding:3rem 1.5rem 2rem; border-top:1px solid #1e293b; font-size:0.88rem;">
          <div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:2rem; margin-bottom:2.5rem;">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <img src="${base}img/logo.svg" alt="Logo" style="width:24px; height:24px;" onerror="this.src='${base}img/favicon-32x32.png'" />
                <strong style="color:#f8fafc; font-size:1.05rem;">St Joseph's Curriculum Portal</strong>
              </div>
              <p style="color:#94a3b8; font-size:0.84rem; line-height:1.6; margin:0 0 12px 0;">
                High-performance offline educational technology engineered for Key Stages 1–4. Zero advertising, zero tracking, and 100% free forever for all pupils, Catholic schools, and families.
              </p>
              <div style="display:flex; gap:8px; font-size:0.78rem; color:#38bdf8;">
                <span>✝️ Catholic Ethos</span> &bull; <span>🌱 Works Offline</span> &bull; <span>⚡ Sub-15ms Launch</span>
              </div>
            </div>

            <div>
              <strong style="display:block; color:#f8fafc; margin-bottom:12px; font-size:0.92rem;">Curriculum &amp; Labs</strong>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:0.84rem;">
                <a href="${base}player" style="color:#94a3b8; text-decoration:none;">🎮 AST Vector Simulators</a>
                <a href="${base}catholic-life" style="color:#94a3b8; text-decoration:none;">⛪ Catholic Life &amp; Faith</a>
                <a href="${base}practice-lab" style="color:#94a3b8; text-decoration:none;">⚡ Practice Lab Question Bank</a>
                <a href="${base}learning-zone" style="color:#94a3b8; text-decoration:none;">📖 Curriculum Lessons</a>
                <a href="${base}phonics" style="color:#94a3b8; text-decoration:none;">🔤 Phonics &amp; Sound Mat</a>
                <a href="${base}languages" style="color:#94a3b8; text-decoration:none;">🌍 Languages &amp; Verb Wheels</a>
                <a href="${base}shakespeare" style="color:#94a3b8; text-decoration:none;">🎭 Shakespeare Theatre</a>
              </div>
            </div>

            <div>
              <strong style="display:block; color:#f8fafc; margin-bottom:12px; font-size:0.92rem;">School &amp; Governance</strong>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:0.84rem;">
                <a href="${base}licensing" style="color:#94a3b8; text-decoration:none;">⚖️ Licensing &amp; MAT SLA</a>
                <a href="${base}privacy" style="color:#94a3b8; text-decoration:none;">🛡️ Privacy &amp; Children's Code</a>
                <a href="${base}child-safety" style="color:#94a3b8; text-decoration:none;">🔒 Child Safety &amp; KCSIE</a>
                <a href="${base}teacher-beacon" style="color:#94a3b8; text-decoration:none;">📡 Teacher Beacon Console</a>
                <a href="${base}curriculum-studio" style="color:#94a3b8; text-decoration:none;">🛠️ Curriculum Node Studio</a>
                <a href="${base}news" style="color:#94a3b8; text-decoration:none;">📰 Technical Release Notes</a>
              </div>
            </div>
          </div>

          <div style="max-width:1200px; margin:0 auto; padding-top:1.5rem; border-top:1px solid #1e293b; text-align:center; font-size:0.8rem; color:#64748b;">
            St Joseph's Learning Portal &bull; Curriculum content licensed under 
            <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noreferrer" style="color:#38bdf8;">OGL v3.0</a>. 
            Engine code dual-licensed under 
            <a href="https://github.com/josephbrewerton-oss/schoolsample" target="_blank" rel="noreferrer" style="color:#38bdf8;">AGPLv3 (Source Repository)</a>. 
            Designed for zero-data offline learning.
          </div>
        </footer>

        <div id="bsl-overlay-slot"></div>
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
    const btnContrast = this.querySelector('#btn-contrast-toggle');
    btnContrast?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-high-contrast') === 'true';
      const next = !current;
      document.documentElement.setAttribute('data-high-contrast', String(next));
      localStorage.setItem('app_high_contrast', String(next));
    });

    // BSL top button
    const btnBsl = this.querySelector<HTMLButtonElement>('#top-bar-bsl-btn');
    btnBsl?.addEventListener('click', () => {
      toggleBsl();
    });

    // Catholic Dropdown toggle
    const btnCatholic = this.querySelector<HTMLButtonElement>('#nav-dropdown-catholic-btn');
    const menuCatholic = this.querySelector<HTMLDivElement>('#nav-dropdown-catholic-menu');
    btnCatholic?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuCatholic?.style.display === 'flex';
      if (menuCatholic) menuCatholic.style.display = isOpen ? 'none' : 'flex';
      if (menuLearning) menuLearning.style.display = 'none';
      const menuAdmin = this.querySelector<HTMLDivElement>('#nav-dropdown-admin-menu');
      if (menuAdmin) menuAdmin.style.display = 'none';
    });

    // Learning Dropdown toggle
    const btnLearning = this.querySelector<HTMLButtonElement>('#nav-dropdown-learning-btn');
    const menuLearning = this.querySelector<HTMLDivElement>('#nav-dropdown-learning-menu');
    btnLearning?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuLearning?.style.display === 'flex';
      if (menuLearning) menuLearning.style.display = isOpen ? 'none' : 'flex';
      if (menuCatholic) menuCatholic.style.display = 'none';
      const menuAdmin = this.querySelector<HTMLDivElement>('#nav-dropdown-admin-menu');
      if (menuAdmin) menuAdmin.style.display = 'none';
    });

    // Admin Dropdown toggle
    const btnAdmin = this.querySelector<HTMLButtonElement>('#nav-dropdown-admin-btn');
    const menuAdmin = this.querySelector<HTMLDivElement>('#nav-dropdown-admin-menu');
    btnAdmin?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuAdmin?.style.display === 'flex';
      if (menuAdmin) menuAdmin.style.display = isOpen ? 'none' : 'flex';
      if (menuCatholic) menuCatholic.style.display = 'none';
      if (menuLearning) menuLearning.style.display = 'none';
    });

    // Close dropdowns on document click
    document.addEventListener('click', () => {
      if (menuCatholic) menuCatholic.style.display = 'none';
      if (menuLearning) menuLearning.style.display = 'none';
      if (menuAdmin) menuAdmin.style.display = 'none';
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
      if (btnMobile) btnMobile.textContent = this.mobileMenuOpen ? '✕' : '☰';
    });

    // Close mobile drawer on any link click
    this.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        this.mobileMenuOpen = false;
        if (drawerMobile) drawerMobile.style.display = 'none';
        if (btnMobile) btnMobile.textContent = '☰';
      });
    });

    // Keyboard shortcut Shift+B for BSL
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        const active = document.activeElement?.tagName;
        if (active !== 'INPUT' && active !== 'TEXTAREA' && active !== 'SELECT') {
          e.preventDefault();
          toggleBsl();
        }
      }
    });

    initCustomSignsIntoLexicon();
    const bslSlot = this.querySelector('#bsl-overlay-slot')!;
    this.unsubscribeBsl = subscribeBsl((enabled) => {
      this.bsl = enabled;
      if (btnBsl) {
        btnBsl.textContent = `🖐️ BSL: ${enabled ? 'ON' : 'OFF'}`;
        btnBsl.style.background = enabled ? '#0284c7' : '#1e293b';
        btnBsl.style.borderColor = enabled ? '#38bdf8' : '#334155';
      }
      bslSlot.innerHTML = enabled ? `<native-bsl-interpreter></native-bsl-interpreter>` : '';
    });

    // Listen to lesson narration & subtitle broadcasts from player iframe
    window.addEventListener('message', (e) => {
      if (e.data && (e.data.type === 'TOGGLE_BSL' || e.data.type === 'BSL_STATE_CHANGED')) {
        const enabled = typeof e.data.enabled === 'boolean' ? e.data.enabled : e.data.active;
        if (typeof enabled === 'boolean' && enabled !== this.bsl) {
          setBslEnabled(enabled);
        }
      } else if (e.data && e.data.type === 'SUBTITLE_UPDATE' && e.data.text) {
        broadcastBslSpeech({ subtitle: e.data.text, isSpeaking: true });
        const interpreter = this.querySelector<NativeBslInterpreterElement>('native-bsl-interpreter');
        if (interpreter) {
          interpreter.processUtterance(e.data.text);
        }
      } else if (e.data && (e.data.type === 'SPEECH_END' || e.data.type === 'SUBTITLE_CLEAR')) {
        broadcastBslSpeech({ isSpeaking: false });
      }
    });
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
    this.unsubscribeBsl?.();
    this.unsubscribeDataSaver?.();
    this.unsubscribeLang?.();
    this.unsubscribePlayerCalls?.();
    classroomBeacon.stopStudentBeacon();
  }
}

if (!customElements.get('app-shell')) {
  customElements.define('app-shell', PersistentAppShellElement);
}

export default PersistentAppShellElement;
