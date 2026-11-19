// src/components/NanoEcoPopover.ts
/**
 * Lazy-hydrated Top-Bar Eco Mode & Gemini Nano Hardware Detector Popover.
 *
 * Loaded via `requestIdleCallback` (or on first click) from `PersistentAppShell.ts`
 * so the initial critical SPA boot bundle remains strictly < 20 KB gzipped while
 * still passively detecting `window.LanguageModel.availability()` ('available',
 * 'downloadable', 'downloading', 'unavailable') even in Eco Mode.
 */

import { getSavedLanguage, listenToLanguageChange } from '../engine/operational-language';
import { getComplianceCaveat } from '../data/complianceCaveats';
import {
  getNanoStateSnapshot,
  probeNanoAvailability,
  activateAndDownloadNano,
  enableEcoMode,
  subscribeNanoState,
  type NanoStateSnapshot,
} from '../engine/nanoAvailability';

export interface NanoEcoControllerHandle {
  openOrToggle: () => void;
  close: () => void;
  destroy: () => void;
}

export function mountNanoEcoPopoverController(
  btnNanoEco: HTMLButtonElement,
  nanoPopover: HTMLDivElement,
  base: string,
  closeOtherMenus: () => void
): NanoEcoControllerHandle {
  const renderNanoUi = (snap: NanoStateSnapshot) => {
    const caveat = getComplianceCaveat(getSavedLanguage());
    const pct = snap.downloadProgress ?? 0;

    if (snap.nanoStatus === 'downloading') {
      btnNanoEco.textContent = `⏳ Nano ${pct}%`;
      btnNanoEco.style.background = '#0369a1';
      btnNanoEco.style.borderColor = '#7dd3fc';
    } else if (snap.ecoMode) {
      if (snap.nanoStatus === 'available') {
        btnNanoEco.textContent = '🌱 Eco · Nano Ready';
        btnNanoEco.style.background = '#065f46';
        btnNanoEco.style.borderColor = '#34d399';
      } else if (snap.nanoStatus === 'downloadable') {
        btnNanoEco.textContent = '🌱 Eco · Nano Downloadable';
        btnNanoEco.style.background = '#1e293b';
        btnNanoEco.style.borderColor = '#38bdf8';
      } else {
        btnNanoEco.textContent = `🌱 ${caveat.statusEco}`;
        btnNanoEco.style.background = '#1e293b';
        btnNanoEco.style.borderColor = '#34d399';
      }
    } else {
      if (snap.nanoStatus === 'available') {
        btnNanoEco.textContent = `✨ ${caveat.statusOn}`;
        btnNanoEco.style.background = '#047857';
        btnNanoEco.style.borderColor = '#6ee7b7';
      } else if (snap.nanoStatus === 'downloadable') {
        btnNanoEco.textContent = '⬇️ Download Nano';
        btnNanoEco.style.background = '#0369a1';
        btnNanoEco.style.borderColor = '#38bdf8';
      } else if (snap.webGpuEligible) {
        btnNanoEco.textContent = '🟣 Local AI: WebGPU';
        btnNanoEco.style.background = '#581c87';
        btnNanoEco.style.borderColor = '#c084fc';
      } else {
        btnNanoEco.textContent = '🌱 Eco Rules (No Nano)';
        btnNanoEco.style.background = '#1e293b';
        btnNanoEco.style.borderColor = '#94a3b8';
      }
    }
    btnNanoEco.style.color = '#ffffff';

    if (nanoPopover.style.display === 'flex') {
      let hwBadgeText = `⚪ ${caveat.deviceUnsupportedText}`;
      let hwBadgeStyle = 'background:#1e293b; color:#e2e8f0; border:1px solid #475569;';
      if (snap.nanoStatus === 'available') {
        hwBadgeText = `🟢 ${caveat.deviceReadyText}`;
        hwBadgeStyle = 'background:#064e3b; color:#a7f3d0; border:1px solid #10b981;';
      } else if (snap.nanoStatus === 'downloadable') {
        hwBadgeText = `⬇️ ${caveat.deviceDownloadText}`;
        hwBadgeStyle = 'background:#0c4a6e; color:#bae6fd; border:1px solid #38bdf8;';
      } else if (snap.nanoStatus === 'downloading') {
        hwBadgeText = `⏳ Downloading Gemini Nano (${pct}%)...`;
        hwBadgeStyle = 'background:#0c4a6e; color:#bae6fd; border:1px solid #7dd3fc;';
      } else if (snap.nanoStatus === 'checking') {
        hwBadgeText = '🔍 Checking Chrome Built-in AI hardware...';
        hwBadgeStyle = 'background:#1e293b; color:#bae6fd; border:1px solid #38bdf8;';
      } else if (snap.webGpuEligible) {
        hwBadgeText = '🟣 Nano API absent · WebGPU Local Fallback Ready';
        hwBadgeStyle = 'background:#3b0764; color:#e9d5ff; border:1px solid #a855f7;';
      }

      const showDownloadBtn = snap.nanoStatus === 'downloadable';
      const canActivateLocalAi =
        snap.nanoStatus === 'available' || snap.nanoStatus === 'downloadable' || snap.webGpuEligible;

      nanoPopover.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <strong style="font-size:0.86rem; color:#f8fafc;">${caveat.badgeTitle}</strong>
          <span style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:999px; ${
            snap.ecoMode
              ? 'background:#064e3b; color:#6ee7b7; border:1px solid #10b981;'
              : 'background:#0c4a6e; color:#7dd3fc; border:1px solid #38bdf8;'
          }">
            ${snap.ecoMode ? '🌱 Eco Mode' : '✨ AI Active'}
          </span>
        </div>
        <div style="padding:6px 8px; border-radius:6px; font-size:0.74rem; font-weight:700; ${hwBadgeStyle}">
          ${hwBadgeText}
        </div>
        ${
          snap.nanoStatus === 'downloading'
            ? `<div style="width:100%; height:7px; background:#1e293b; border-radius:999px; overflow:hidden; border:1px solid #334155;">
                 <div style="width:${pct}%; height:100%; background:#38bdf8;"></div>
               </div>`
            : ''
        }
        <p style="margin:0; font-size:0.74rem; color:#cbd5e1; line-height:1.45;">
          ${snap.ecoMode ? caveat.ecoSummary : caveat.activeSummary}
        </p>
        ${
          snap.diagnosticNote
            ? `<p style="margin:0; font-size:0.69rem; color:#cbd5e1; line-height:1.35;">${snap.diagnosticNote}</p>`
            : ''
        }
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:2px;">
          ${
            showDownloadBtn
              ? `<button type="button" id="popover-btn-download-nano" style="flex:1 1 100%; padding:7px 10px; border-radius:6px; background:#0369a1; color:#ffffff; border:1px solid #38bdf8; font-size:0.76rem; font-weight:800; cursor:pointer;">
                   ⬇️ Download &amp; Activate Gemini Nano
                 </button>`
              : canActivateLocalAi && snap.ecoMode
              ? `<button type="button" id="popover-btn-activate-nano" style="flex:1; padding:7px 10px; border-radius:6px; background:#047857; color:#ffffff; border:1px solid #34d399; font-size:0.75rem; font-weight:800; cursor:pointer;">
                   ${caveat.activateBtn}
                 </button>`
              : ''
          }
          ${
            !snap.ecoMode
              ? `<button type="button" id="popover-btn-eco-mode" style="flex:1; padding:7px 10px; border-radius:6px; background:#1e293b; color:#6ee7b7; border:1px solid #10b981; font-size:0.75rem; font-weight:800; cursor:pointer;">
                   🌱 Switch to Eco Mode
                 </button>`
              : ''
          }
          <button type="button" id="popover-btn-reprobe-nano" style="padding:6px 9px; border-radius:6px; background:#1e293b; color:#e2e8f0; border:1px solid #475569; font-size:0.72rem; font-weight:700; cursor:pointer;">
            🔄 Re-check
          </button>
          <a href="${base}settings#ai-engine" id="popover-link-ai-settings" style="padding:6px 9px; border-radius:6px; background:#1e293b; color:#7dd3fc; border:1px solid #334155; font-size:0.72rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center;">
            ⚙️ Settings
          </a>
        </div>
      `;

      nanoPopover.querySelector('#popover-btn-download-nano')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        void activateAndDownloadNano();
      });
      nanoPopover.querySelector('#popover-btn-activate-nano')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        void activateAndDownloadNano();
      });
      nanoPopover.querySelector('#popover-btn-eco-mode')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        enableEcoMode();
      });
      nanoPopover.querySelector('#popover-btn-reprobe-nano')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        void probeNanoAvailability(true);
      });
      nanoPopover.querySelector('#popover-link-ai-settings')?.addEventListener('click', () => {
        nanoPopover.style.display = 'none';
        btnNanoEco.setAttribute('aria-expanded', 'false');
      });
    }
  };

  const stopProp = (e: Event) => e.stopPropagation();
  nanoPopover.addEventListener('click', stopProp);

  const unsubNano = subscribeNanoState((snap) => renderNanoUi(snap));
  const unsubLang = listenToLanguageChange(() => renderNanoUi(getNanoStateSnapshot()));

  renderNanoUi(getNanoStateSnapshot());
  void probeNanoAvailability(false);

  return {
    openOrToggle: () => {
      const willOpen = nanoPopover.style.display !== 'flex';
      closeOtherMenus();
      if (willOpen) {
        nanoPopover.style.display = 'flex';
        btnNanoEco.setAttribute('aria-expanded', 'true');
        renderNanoUi(getNanoStateSnapshot());
        void probeNanoAvailability(true);
      }
    },
    close: () => {
      nanoPopover.style.display = 'none';
      btnNanoEco.setAttribute('aria-expanded', 'false');
    },
    destroy: () => {
      unsubNano();
      unsubLang();
      nanoPopover.removeEventListener('click', stopProp);
    },
  };
}
