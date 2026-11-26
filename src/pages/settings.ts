import { getBaseUrl } from '../utils/url';
import { getLocalState, setLocalState } from '../services/localStateStore';
import { getSignLanguage, setSignLanguage, SignLanguageCode } from '../services/bslGlobalStore';
import {
  getSavedLanguage,
  setSavedLanguage,
  listenToLanguageChange,
  buildLanguageSelectOptionsHtml,
  SUPPORTED_LANGUAGES,
} from '../engine/operational-language';
import { getComplianceCaveat } from '../data/complianceCaveats';
import {
  getNanoStateSnapshot,
  probeNanoAvailability,
  activateAndDownloadNano,
  enableEcoMode,
  setUserAiConsent,
  subscribeNanoState,
} from '../engine/nanoAvailability';
import settingsAST from './settings.ast.json';

type TupleSetting = [
  type: 'select' | 'toggle' | 'segmented',
  id: string,
  label: string,
  storageKey: string,
  defaultValue: any,
  meta: any,
  description: string | null
];

export function renderSettingsPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'settings-page-stage';
  container.style.cssText = 'max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  let releaseStatusMsg: string | null = null;

  function getValue(key: string, fallback: any): any {
    if (key === 'stj_sign_language') {
      return getSignLanguage();
    }
    if (key === 'app_language') {
      return getSavedLanguage();
    }
    const raw = getLocalState(key);
    if (raw === null) return fallback;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return raw;
  }

  function setValue(key: string, val: any, attr?: string) {
    if (key === 'stj_sign_language') {
      setSignLanguage(val as SignLanguageCode);
      window.dispatchEvent(new CustomEvent('app-setting-changed', { detail: { key, value: val } }));
      return;
    }
    if (key === 'app_language') {
      setSavedLanguage(String(val));
      setLocalState(key, String(val));
      window.dispatchEvent(new CustomEvent('app-setting-changed', { detail: { key, value: val } }));
      return;
    }
    setLocalState(key, String(val));
    if (attr) document.documentElement.setAttribute(attr, String(val));
    window.dispatchEvent(new CustomEvent('app-setting-changed', { detail: { key, value: val } }));
  }

  function buildNanoSectionHtml(): string {
    const snap = getNanoStateSnapshot();
    const caveat = getComplianceCaveat(getSavedLanguage());
    const pct = snap.downloadProgress ?? 0;

    let nanoBadgeLabel = '⚪ Not Detected';
    let nanoBadgeCss = 'background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;';
    if (snap.nanoStatus === 'available') {
      nanoBadgeLabel = '🟢 Installed & Ready';
      nanoBadgeCss = 'background:#ecfdf5; color:#065f46; border:1px solid #10b981;';
    } else if (snap.nanoStatus === 'downloadable') {
      nanoBadgeLabel = '⬇️ Downloadable on Device';
      nanoBadgeCss = 'background:#f0f9ff; color:#0369a1; border:1px solid #38bdf8;';
    } else if (snap.nanoStatus === 'downloading') {
      nanoBadgeLabel = `⏳ Downloading (${pct}%)`;
      nanoBadgeCss = 'background:#f0f9ff; color:#0369a1; border:1px solid #0284c7;';
    } else if (snap.nanoStatus === 'checking') {
      nanoBadgeLabel = '🔍 Checking...';
      nanoBadgeCss = 'background:#f8fafc; color:#334155; border:1px solid #cbd5e1;';
    }

    let webGpuLabel = '⚪ Not Detected';
    let webGpuCss = 'background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;';
    if (snap.webGpuEligible) {
      webGpuLabel = '🟢 Eligible (≥4 GB Guard Passed)';
      webGpuCss = 'background:#faf5ff; color:#6b21a8; border:1px solid #c084fc;';
    } else if (snap.hasWebGpu) {
      webGpuLabel = '🟡 Guarded (<4 GB / Mobile)';
      webGpuCss = 'background:#fffbeb; color:#92400e; border:1px solid #fbbf24;';
    }

    const memText = snap.deviceMemoryGb !== null ? `${snap.deviceMemoryGb} GB RAM` : 'Desktop RAM';
    const coresText = snap.hardwareConcurrency !== null ? `${snap.hardwareConcurrency} Cores` : 'Multi-Core';

    const activeTierSummary = snap.ecoMode
      ? 'Tier 3 Active: Pre-compiled deterministic Socratic rules (0 MB download · 0 W GPU draw)'
      : snap.nanoStatus === 'available'
      ? 'Tier 1 Active: Chrome Built-in Gemini Nano (window.LanguageModel · 0 ms cloud egress)'
      : snap.nanoStatus === 'downloadable'
      ? 'Gemini Nano Supported: Click "Download & Activate Gemini Nano" below to fetch local weights'
      : snap.nanoStatus === 'downloading'
      ? `Downloading Gemini Nano weights locally (${pct}%)...`
      : snap.webGpuEligible
      ? 'Tier 2 Fallback Ready: On-device WebGPU neural engine (Gemini Nano API absent)'
      : 'Tier 3 Active: Curriculum Rules Engine (No compatible local neural API detected)';

    return `
      <section id="ai-engine" style="background:#ffffff; border:1.5px solid #bae6fd; border-radius:14px; padding:1.5rem; box-shadow:0 2px 8px rgba(3,105,161,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:0.5rem;">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0; display:flex; align-items:center; gap:8px;">
            <span>🧠</span> On-Device AI, Gemini Nano &amp; Eco Mode
          </h2>
          <span style="font-size:0.76rem; font-weight:800; padding:4px 10px; border-radius:999px; ${
            snap.ecoMode
              ? 'background:#ecfdf5; color:#065f46; border:1px solid #10b981;'
              : 'background:#f0f9ff; color:#0369a1; border:1px solid #38bdf8;'
          }">
            ${snap.ecoMode ? `🌱 ${caveat.statusEco}` : `✨ ${caveat.statusOn}`}
          </span>
        </div>

        <p style="font-size:0.86rem; color:#475569; margin:0 0 1rem 0; line-height:1.55;">
          ${caveat.badgeSubtitle}
        </p>

        <!-- Operating Mode Selector -->
        <div style="margin-bottom:1.15rem;">
          <div style="font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">
            Operating Mode
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button type="button" id="settings-btn-eco-mode" aria-pressed="${snap.ecoMode ? 'true' : 'false'}" style="padding:8px 14px; border-radius:8px; border:1.5px solid ${
              snap.ecoMode ? '#047857' : '#cbd5e1'
            }; background:${snap.ecoMode ? '#047857' : '#f8fafc'}; color:${
              snap.ecoMode ? '#ffffff' : '#334155'
            }; font-weight:800; font-size:0.84rem; cursor:pointer;">
              🌱 Eco Mode (Deterministic Rules · Save Battery)
            </button>

            <button type="button" id="settings-btn-private-ai" aria-pressed="${!snap.ecoMode ? 'true' : 'false'}" style="padding:8px 14px; border-radius:8px; border:1.5px solid ${
              !snap.ecoMode ? '#0369a1' : '#cbd5e1'
            }; background:${!snap.ecoMode ? '#0369a1' : '#f8fafc'}; color:${
              !snap.ecoMode ? '#ffffff' : '#334155'
            }; font-weight:800; font-size:0.84rem; cursor:pointer;">
              ${
                snap.nanoStatus === 'downloadable'
                  ? '⬇️ Download & Activate Gemini Nano'
                  : '✨ Private On-Device AI (Local Neural)'
              }
            </button>
          </div>
          <p style="font-size:0.78rem; color:#0f172a; font-weight:600; margin:8px 0 0 0;">
            ${activeTierSummary}
          </p>
        </div>

        ${
          snap.nanoStatus === 'downloading'
            ? `<div style="margin-bottom:1.1rem; padding:10px 12px; border-radius:8px; background:#f0f9ff; border:1px solid #7dd3fc;">
                 <div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:800; color:#0369a1; margin-bottom:6px;">
                   <span>⏳ Downloading Chrome Gemini Nano Weights Locally...</span>
                   <span>${pct}%</span>
                 </div>
                 <div style="width:100%; height:8px; background:#e0f2fe; border-radius:999px; overflow:hidden;">
                   <div style="width:${pct}%; height:100%; background:#0284c7; transition:width 0.2s ease;"></div>
                 </div>
               </div>`
            : ''
        }

        <!-- Live Hardware Capability Probe Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:0.85rem; margin-bottom:1rem;">
          <div style="padding:12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
            <div style="font-size:0.74rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:6px;">
              Tier 1 · Chrome Gemini Nano
            </div>
            <div style="display:inline-block; padding:3px 8px; border-radius:6px; font-size:0.78rem; font-weight:800; ${nanoBadgeCss}">
              ${nanoBadgeLabel}
            </div>
            <div style="font-size:0.74rem; color:#475569; margin-top:6px;">
              API: <code>window.LanguageModel</code> (${snap.rawAvailability})
            </div>
          </div>

          <div style="padding:12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
            <div style="font-size:0.74rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:6px;">
              Tier 2 · WebGPU Local Engine
            </div>
            <div style="display:inline-block; padding:3px 8px; border-radius:6px; font-size:0.78rem; font-weight:800; ${webGpuCss}">
              ${webGpuLabel}
            </div>
            <div style="font-size:0.74rem; color:#475569; margin-top:6px;">
              API: <code>navigator.gpu</code> (${snap.hasWebGpu ? 'present' : 'absent'})
            </div>
          </div>

          <div style="padding:12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
            <div style="font-size:0.74rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:6px;">
              Device &amp; Privacy Guard
            </div>
            <div style="font-size:0.82rem; font-weight:800; color:#0f172a;">
              ${memText} &bull; ${coresText}
            </div>
            <div style="font-size:0.74rem; color:#065f46; font-weight:700; margin-top:6px;">
              🔒 0 bps Cloud Egress Guaranteed
            </div>
          </div>
        </div>

        ${
          snap.diagnosticNote
            ? `<p style="font-size:0.78rem; color:#334155; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 10px; margin:0 0 1rem 0;">
                 <strong>Hardware Diagnostic:</strong> ${snap.diagnosticNote}
               </p>`
            : ''
        }

        <!-- Action Toolbar -->
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:0.85rem;">
          ${
            snap.nanoStatus === 'downloadable'
              ? `<button type="button" id="settings-btn-download-nano" style="padding:7px 14px; border-radius:8px; background:#0369a1; color:#ffffff; border:1px solid #0284c7; font-size:0.8rem; font-weight:800; cursor:pointer;">
                   ⬇️ Download Gemini Nano Weights Now
                 </button>`
              : ''
          }
          <button type="button" id="settings-btn-reprobe-nano" style="padding:7px 12px; border-radius:8px; background:#f8fafc; color:#0f172a; border:1px solid #cbd5e1; font-size:0.78rem; font-weight:700; cursor:pointer;">
            🔄 Re-Check Browser AI Hardware
          </button>
          <button type="button" id="settings-btn-release-vram" style="padding:7px 12px; border-radius:8px; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; font-size:0.78rem; font-weight:700; cursor:pointer;">
            🧹 Release Cached AI Session
          </button>
          ${
            releaseStatusMsg
              ? `<span style="font-size:0.76rem; color:#065f46; font-weight:700;">${releaseStatusMsg}</span>`
              : ''
          }
        </div>

        ${
          snap.nanoStatus === 'unavailable'
            ? `<details style="margin-bottom:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; font-size:0.78rem; color:#334155;">
                 <summary style="cursor:pointer; font-weight:700; color:#0369a1;">
                   How to enable Chrome Built-in Gemini Nano on Desktop (Chrome 128+)
                 </summary>
                 <ol style="margin:8px 0 0 1.2rem; padding:0; line-height:1.6;">
                   <li>Open <code>chrome://flags/#optimization-guide-on-device-model</code> and set to <strong>Enabled BypassPerfRequirement</strong>.</li>
                   <li>Open <code>chrome://flags/#prompt-api-for-gemini-nano</code> and set to <strong>Enabled</strong>, then relaunch Chrome.</li>
                   <li>Return here and click <strong>Re-Check Browser AI Hardware</strong> (or inspect model status at <code>chrome://on-device-internals</code>). Note: If viewing inside an embedded preview iframe, open the site in a top-level tab so Permissions-Policy allows <code>LanguageModel</code>.</li>
                 </ol>
               </details>`
            : ''
        }

        <div style="border-top:1px solid #e2e8f0; padding-top:0.75rem; font-size:0.74rem; color:#475569; line-height:1.5; display:flex; flex-direction:column; gap:3px;">
          <div>🛡️ <strong>UK GDPR Art. 25 &amp; KCSIE:</strong> Zero student prompts, telemetry, or audio leave this device.</div>
          <div>🛡️ ${caveat.californiaNotice}</div>
          <div>🛡️ ${caveat.indiaNotice}</div>
        </div>
      </section>
    `;
  }

  function render() {
    let sectionsHtml = buildNanoSectionHtml();

    for (const section of settingsAST.sections) {
      let itemsHtml = '';

      for (const item of (section.items as TupleSetting[])) {
        const [type, id, label, key, fallback, meta, desc] = item;
        const currentVal = getValue(key, fallback);

        let controlHtml = '';

        if (type === 'toggle') {
          const isActive = meta.activeVal ? currentVal === meta.activeVal : Boolean(currentVal);
          const buttonText = isActive ? meta.activeLabel : meta.inactiveLabel;
          controlHtml = `
            <button type="button" id="${id}" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${isActive ? '#0369a1' : '#cbd5e1'}; background:${isActive ? '#f0f9ff' : '#f8fafc'}; color:${isActive ? '#0369a1' : '#334155'}; font-weight:700; font-size:0.88rem; cursor:pointer;">
              ${buttonText}
            </button>
          `;
        } else if (type === 'select') {
          const isLangSelect = id === 'setting-lang';
          const options = isLangSelect
            ? buildLanguageSelectOptionsHtml(String(currentVal))
            : (meta as [string, string][])
                .map(([val, optLabel]) => `<option value="${val}" ${currentVal === val ? 'selected' : ''}>${optLabel}</option>`)
                .join('');
          const langCountBadge = isLangSelect
            ? `<div style="font-size:0.74rem; color:#065f46; font-weight:700; margin-top:5px;">✓ ${Object.keys(SUPPORTED_LANGUAGES).length} languages configured · Africa, South Asia, SE Asia, MENA, Americas &amp; Europe</div>`
            : '';
          controlHtml = `
            <select id="${id}" ${isLangSelect ? 'class="notranslate" translate="no"' : ''} aria-label="${label}" style="width:100%; max-width:360px; padding:8px 12px; border-radius:8px; border:1.5px solid #0369a1; background:#fff; color:#0f172a; font-size:0.9rem; font-weight:700; cursor:pointer;">
              ${options}
            </select>
            ${langCountBadge}
          `;
        } else if (type === 'segmented') {
          const buttons = (meta as [string, string][])
            .map(([val, optLabel]) => {
              const sel = currentVal === val;
              return `<button type="button" class="${id}-btn" data-val="${val}" style="padding:6px 14px; border-radius:6px; border:1px solid ${sel ? '#0369a1' : '#cbd5e1'}; background:${sel ? '#0369a1' : '#f8fafc'}; color:${sel ? '#fff' : '#334155'}; font-weight:700; cursor:pointer;">${optLabel}</button>`;
            })
            .join(' ');
          controlHtml = `<div style="display:flex; gap:6px;">${buttons}</div>`;
        }

        itemsHtml += `
          <div style="margin-bottom: 1rem;">
            <label ${type === 'select' ? `for="${id}"` : ''} style="display:block; font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:6px;">${label}</label>
            ${controlHtml}
            ${desc ? `<p style="font-size:0.76rem; color:#475569; margin:6px 0 0 0;">${desc}</p>` : ''}
          </div>
        `;
      }

      sectionsHtml += `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>${section.icon}</span> ${section.title}
          </h2>
          ${section.description ? `<p style="font-size:0.85rem; color:#475569; margin:0 0 1.25rem 0; line-height:1.5;">${section.description}</p>` : ''}
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    sectionsHtml += `
      <section aria-labelledby="sign-pack-heading" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <h2 id="sign-pack-heading" style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.4rem 0; display:flex; align-items:center; gap:8px;">
          <span>🤟</span> Offline Sign Pack Import &amp; Export
        </h2>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 1rem 0; line-height:1.5;">
          Import local community/regional signs from tiny <strong>.ast</strong> packs (~400 bytes/sign) or standard <strong>MediaPipe Holistic .json</strong> pose files. Incoming MediaPipe clips are compressed locally on-device into compact keyframes with zero cloud upload and zero extra mobile data.
        </p>
        <input type="file" id="settings-sign-file-input" accept=".ast,.json,application/json,text/plain" style="display:none;" />
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <button type="button" id="settings-btn-import-signs" style="padding:8px 14px; border-radius:8px; border:1.5px solid #0369a1; background:#f0f9ff; color:#0369a1; font-weight:700; font-size:0.84rem; cursor:pointer;">
            📥 Import Signs (.ast / MediaPipe .json)
          </button>
          <button type="button" id="settings-btn-export-ast-signs" style="padding:8px 14px; border-radius:8px; border:1.5px solid #0f766e; background:#f0fdfa; color:#0f766e; font-weight:700; font-size:0.84rem; cursor:pointer;">
            💾 Export Tiny .ast Pack
          </button>
          <button type="button" id="settings-btn-export-mp-signs" style="padding:8px 14px; border-radius:8px; border:1.5px solid #475569; background:#f8fafc; color:#334155; font-weight:700; font-size:0.84rem; cursor:pointer;">
            📐 Export MediaPipe JSON
          </button>
          <button type="button" id="settings-btn-clear-signs" style="padding:8px 12px; border-radius:8px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.82rem; cursor:pointer;">
            Clear Imported
          </button>
        </div>
        <p id="settings-sign-pack-status" role="status" aria-live="polite" style="font-size:0.78rem; color:#334155; margin:0.75rem 0 0 0; min-height:1.1em;"></p>
      </section>
    `;

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${base}" style="font-size:0.84rem; color:#475569; text-decoration:underline; text-underline-offset:2px; font-weight:600;">&larr; Home</a>
          <span style="color:#64748b;">/</span>
          <span style="font-size:0.84rem; color:#0369a1; font-weight:700;">⚙️ System Settings</span>
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Preferences &amp; System Configuration</h1>
        <p style="font-size:0.95rem; color:#475569; margin:0;">
          All preferences and neural privacy controls are stored directly on your device via declarative AST bindings.
        </p>
      </div>
      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${sectionsHtml}
      </div>
    `;

    // Bind On-Device AI / Eco Mode Controls
    container.querySelector('#settings-btn-eco-mode')?.addEventListener('click', () => {
      releaseStatusMsg = null;
      enableEcoMode();
    });

    container.querySelector('#settings-btn-private-ai')?.addEventListener('click', () => {
      releaseStatusMsg = null;
      const snap = getNanoStateSnapshot();
      if (snap.hasPromptApi) {
        void activateAndDownloadNano();
      } else {
        setUserAiConsent(true);
        void probeNanoAvailability(true);
      }
    });

    container.querySelector('#settings-btn-download-nano')?.addEventListener('click', () => {
      releaseStatusMsg = null;
      void activateAndDownloadNano();
    });

    container.querySelector('#settings-btn-reprobe-nano')?.addEventListener('click', () => {
      releaseStatusMsg = null;
      void probeNanoAvailability(true);
    });

    container.querySelector('#settings-btn-release-vram')?.addEventListener('click', async () => {
      try {
        const [{ aiCaller }, { edgeCognitiveEngine }] = await Promise.all([
          import('../engine/aicaller'),
          import('../engine/EdgeCognitiveEngine'),
        ]);
        aiCaller.destroy();
        await edgeCognitiveEngine.unload();
        releaseStatusMsg = '✓ Local session & VRAM cache released';
      } catch {
        releaseStatusMsg = '✓ Session cleared';
      }
      render();
    });

    // Bind Offline Sign Pack Import & Export (100% lazy-loaded on click for zero initial bundle cost)
    const signFileInput = container.querySelector<HTMLInputElement>('#settings-sign-file-input');
    const signStatusEl = container.querySelector<HTMLParagraphElement>('#settings-sign-pack-status');
    const setSignStatus = (msg: string, isError = false) => {
      if (!signStatusEl) return;
      signStatusEl.style.color = isError ? '#b91c1c' : '#065f46';
      signStatusEl.textContent = msg;
    };

    const triggerBlobDownload = (content: string, filename: string, mime: string) => {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    container.querySelector('#settings-btn-import-signs')?.addEventListener('click', () => {
      signFileInput?.click();
    });

    signFileInput?.addEventListener('change', async () => {
      const file = signFileInput.files?.[0];
      signFileInput.value = '';
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setSignStatus('File too large (5 MB limit). Please split into smaller sign packs.', true);
        return;
      }
      try {
        setSignStatus('Compressing & importing signs locally...');
        const text = await file.text();
        const store = await import('../services/customSignStore');
        const trimmed = text.trim();
        const isJson = file.name.toLowerCase().endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[');
        if (isJson) {
          const { imported, words } = await store.importCustomSignsFromMediaPipeJson(text);
          if (imported === 0) {
            setSignStatus('No valid MediaPipe Holistic sign frames found in file.', true);
          } else {
            const preview = words.slice(0, 6).join(', ') + (words.length > 6 ? '…' : '');
            setSignStatus(`✓ Imported & compressed ${imported} sign(s) into local offline vault: ${preview}`);
          }
        } else {
          const count = await store.importCustomSignsFromAst(text);
          if (count === 0) {
            setSignStatus('No valid BSL signs found in .ast file.', true);
          } else {
            setSignStatus(`✓ Imported ${count} sign(s) from compact .ast pack into local offline vault.`);
          }
        }
      } catch (err: any) {
        setSignStatus(err?.message || 'Could not import sign file.', true);
      }
    });

    container.querySelector('#settings-btn-export-ast-signs')?.addEventListener('click', async () => {
      try {
        const store = await import('../services/customSignStore');
        const custom = await store.loadCustomBslSigns();
        const count = Object.keys(custom).length;
        if (count === 0) {
          setSignStatus('No custom imported signs saved yet. Import a sign pack first to export it.', true);
          return;
        }
        const ast = await store.exportCustomSignsAst();
        triggerBlobDownload(ast, 'custom-bsl-signs.ast', 'text/plain;charset=utf-8');
        setSignStatus(`✓ Exported ${count} custom sign(s) as compact .ast (${(ast.length / 1024).toFixed(1)} KB).`);
      } catch {
        setSignStatus('Failed to export .ast sign pack.', true);
      }
    });

    container.querySelector('#settings-btn-export-mp-signs')?.addEventListener('click', async () => {
      try {
        setSignStatus('Generating standard 25 fps MediaPipe Holistic JSON...');
        const [store, lexicon, mapper] = await Promise.all([
          import('../services/customSignStore'),
          import('../utils/bslLexicon'),
          import('../utils/bslMediaPipeMapper'),
        ]);
        const custom = Object.values(await store.loadCustomBslSigns());
        const sourceSigns = custom.length > 0 ? custom : Object.values(lexicon.BSL_CURRICULUM_LEXICON).slice(0, 10);
        const sequences = sourceSigns.map((s) => mapper.bslSignToMediaPipeSequence(s, { fps: 25 }));
        const payload = JSON.stringify(
          {
            schema: 'mediapipe-holistic-bundle/1.0',
            fps: 25,
            signCount: sequences.length,
            sequences,
          },
          null,
          2
        );
        const label = custom.length > 0 ? 'custom' : 'sample-10';
        triggerBlobDownload(payload, `bsl-mediapipe-${label}.json`, 'application/json;charset=utf-8');
        setSignStatus(
          `✓ Exported ${sequences.length} ${custom.length > 0 ? 'custom' : 'sample core'} sign(s) in standard MediaPipe Holistic JSON.`
        );
      } catch {
        setSignStatus('Failed to export MediaPipe JSON.', true);
      }
    });

    container.querySelector('#settings-btn-clear-signs')?.addEventListener('click', async () => {
      try {
        const store = await import('../services/customSignStore');
        const removed = await store.clearAllCustomBslSigns();
        setSignStatus(
          removed > 0
            ? `✓ Cleared ${removed} locally imported sign(s) from device storage.`
            : 'No locally imported signs to clear.'
        );
      } catch {
        setSignStatus('Could not clear local sign storage.', true);
      }
    });

    // Bind Event Listeners dynamically from AST definitions
    for (const section of settingsAST.sections) {
      for (const item of (section.items as TupleSetting[])) {
        const [type, id, , key, fallback, meta] = item;

        if (type === 'toggle') {
          container.querySelector(`#${id}`)?.addEventListener('click', () => {
            if (meta.activeVal) {
              const cur = getValue(key, fallback);
              setValue(key, cur === meta.activeVal ? meta.inactiveVal : meta.activeVal, meta.attr);
            } else {
              const cur = getValue(key, fallback);
              setValue(key, !cur, meta.attr);
            }
            render();
          });
        } else if (type === 'select') {
          container.querySelector(`#${id}`)?.addEventListener('change', (e) => {
            setValue(key, (e.target as HTMLSelectElement).value, meta?.attr);
          });
        } else if (type === 'segmented') {
          container.querySelectorAll(`.${id}-btn`).forEach(btn => {
            btn.addEventListener('click', () => {
              setValue(key, btn.getAttribute('data-val'), meta?.attr);
              render();
            });
          });
        }
      }
    }
  }

  render();

  const unsubscribe = subscribeNanoState(() => {
    if (!container.isConnected) {
      unsubscribe();
      return;
    }
    render();
  });

  const unsubscribeLang = listenToLanguageChange((lang) => {
    if (!container.isConnected) {
      unsubscribeLang();
      return;
    }
    const sel = container.querySelector<HTMLSelectElement>('#setting-lang');
    if (sel && sel.value !== lang) {
      sel.value = lang;
    }
  });

  // Trigger a fresh hardware probe when visiting /settings
  void probeNanoAvailability(true);

  return container;
}

export default renderSettingsPage;
