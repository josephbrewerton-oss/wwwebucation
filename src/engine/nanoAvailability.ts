// src/engine/nanoAvailability.ts
/**
 * Lightweight, zero-bloat Gemini Nano (W3C window.LanguageModel) & Eco Mode
 * hardware capability store.
 *
 * Safe to import in the critical PersistentAppShell (< 1.5 KB, 0 heavy imports):
 * - Passively probes `LanguageModel.availability()` without allocating GPU VRAM
 *   or triggering model downloads while in Eco Mode.
 * - Distinguishes `'available'`, `'downloadable'`, `'downloading'`, and `'unavailable'`
 *   independently from Tier-2 WebGPU fallback (`navigator.gpu`).
 * - Preserves Chrome Transient User Activation when triggering `LanguageModel.create()`
 *   to download Gemini Nano weights with live `downloadprogress` telemetry.
 */

import { getLocalState, setLocalState, subscribeLocalState } from '../services/localStateStore';

export const CONSENT_STORAGE_KEY = 'ai_model_download_consent';
export const NANO_STATE_EVENT = 'stj_nano_state_changed';

export type NanoAvailabilityStatus =
  | 'checking'
  | 'available'
  | 'downloadable'
  | 'downloading'
  | 'unavailable';

export interface NanoStateSnapshot {
  /** True when user keeps 0-watt deterministic curriculum rules (consent not granted). */
  ecoMode: boolean;
  /** True when user opted in to private on-device neural execution. */
  consentGranted: boolean;
  /** Exact W3C Chrome Built-in Gemini Nano status. */
  nanoStatus: NanoAvailabilityStatus;
  /** Raw string returned by browser API (e.g. 'available', 'downloadable', 'api-absent'). */
  rawAvailability: string;
  /** True if `window.LanguageModel` or `self.LanguageModel` global exists. */
  hasPromptApi: boolean;
  /** True if `navigator.gpu` exists for Tier-2 WebGPU fallback. */
  hasWebGpu: boolean;
  /** True if WebGPU exists and deviceMemory guard (>= 4 GB or unknown desktop) passes. */
  webGpuEligible: boolean;
  /** Reported navigator.deviceMemory in GB, if exposed by Chromium. */
  deviceMemoryGb: number | null;
  /** Logical CPU cores reported by navigator.hardwareConcurrency. */
  hardwareConcurrency: number | null;
  /** Download percentage (0..100) while Gemini Nano weights are downloading. */
  downloadProgress: number | null;
  /** Optional diagnostic hint (e.g. iframe Permissions-Policy or flag guidance). */
  diagnosticNote: string | null;
  /** Timestamp (ms) of last hardware probe. */
  lastCheckedAt: number | null;
}

export function hasUserGrantedAiConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return getLocalState(CONSENT_STORAGE_KEY) === 'granted';
}

export function isEcoModeActive(): boolean {
  return !hasUserGrantedAiConsent();
}

export function setUserAiConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  setLocalState(CONSENT_STORAGE_KEY, granted ? 'granted' : 'denied');
  window.dispatchEvent(new CustomEvent('ai_consent_changed', { detail: granted }));
  syncSnapshotConsent();
  emitNanoState();
}

export function enableEcoMode(): void {
  setUserAiConsent(false);
}

/**
 * Safe accessor for the standard W3C Prompt API root (`window.LanguageModel` or `self.LanguageModel`).
 * Retired `window.ai` namespace is intentionally never accessed.
 */
export function getLanguageModelRoot(): any {
  if (typeof window !== 'undefined' && typeof (window as any).LanguageModel !== 'undefined') {
    return (window as any).LanguageModel;
  }
  if (typeof self !== 'undefined' && typeof (self as any).LanguageModel !== 'undefined') {
    return (self as any).LanguageModel;
  }
  return null;
}

function readHardwareTelemetry(): {
  hasPromptApi: boolean;
  hasWebGpu: boolean;
  webGpuEligible: boolean;
  deviceMemoryGb: number | null;
  hardwareConcurrency: number | null;
} {
  const hasPromptApi = getLanguageModelRoot() !== null;
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
  const hasWebGpu = Boolean(nav && 'gpu' in nav);
  const deviceMemoryGb = nav && typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null;
  const hardwareConcurrency =
    nav && typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null;
  const isIOS =
    nav &&
    (/iPad|iPhone|iPod/.test(nav.userAgent || '') ||
      (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1));
  const webGpuEligible = hasWebGpu && !isIOS && (deviceMemoryGb === null || deviceMemoryGb >= 4);

  return {
    hasPromptApi,
    hasWebGpu,
    webGpuEligible,
    deviceMemoryGb,
    hardwareConcurrency,
  };
}

let state: NanoStateSnapshot = {
  ecoMode: true,
  consentGranted: false,
  nanoStatus: 'checking',
  rawAvailability: 'unprobed',
  ...readHardwareTelemetry(),
  downloadProgress: null,
  diagnosticNote: null,
  lastCheckedAt: null,
};

let inflightProbe: Promise<NanoStateSnapshot> | null = null;
let inflightDownload: Promise<NanoStateSnapshot> | null = null;
let stateListenerBound = false;

function syncSnapshotConsent(): void {
  const granted = hasUserGrantedAiConsent();
  state = {
    ...state,
    consentGranted: granted,
    ecoMode: !granted,
  };
}

function bindCrossTabSync(): void {
  if (stateListenerBound || typeof window === 'undefined') return;
  stateListenerBound = true;
  subscribeLocalState(() => {
    syncSnapshotConsent();
    emitNanoState();
  }, CONSENT_STORAGE_KEY);
}

function emitNanoState(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<NanoStateSnapshot>(NANO_STATE_EVENT, {
      detail: getNanoStateSnapshot(),
    })
  );
}

function normalizeAvailabilityString(raw: unknown): NanoAvailabilityStatus {
  const val = typeof raw === 'string' ? raw.toLowerCase().trim() : '';
  if (val === 'available' || val === 'readily') return 'available';
  if (val === 'downloadable' || val === 'after-download') return 'downloadable';
  if (val === 'downloading') return 'downloading';
  return 'unavailable';
}

export function getNanoStateSnapshot(): NanoStateSnapshot {
  bindCrossTabSync();
  const hw = readHardwareTelemetry();
  const granted = hasUserGrantedAiConsent();
  state = {
    ...state,
    ...hw,
    consentGranted: granted,
    ecoMode: !granted,
  };
  return { ...state };
}

export function subscribeNanoState(listener: (snapshot: NanoStateSnapshot) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  bindCrossTabSync();
  const handler = () => listener(getNanoStateSnapshot());
  window.addEventListener(NANO_STATE_EVENT, handler);
  return () => window.removeEventListener(NANO_STATE_EVENT, handler);
}

/**
 * Passively probes Chrome Built-in Gemini Nano (`LanguageModel.availability()`)
 * without downloading weights or allocating GPU sessions.
 * Safe to run even when Eco Mode is active.
 */
export async function probeNanoAvailability(forceRefresh = false): Promise<NanoStateSnapshot> {
  bindCrossTabSync();
  syncSnapshotConsent();

  if (!forceRefresh && state.lastCheckedAt !== null && state.nanoStatus !== 'checking') {
    return getNanoStateSnapshot();
  }
  if (inflightProbe && !forceRefresh) {
    return inflightProbe;
  }

  const lm = getLanguageModelRoot();
  const hw = readHardwareTelemetry();

  if (!lm) {
    state = {
      ...state,
      ...hw,
      nanoStatus: 'unavailable',
      rawAvailability: 'api-absent',
      diagnosticNote:
        'window.LanguageModel API not exposed. Requires Chrome 128+ / Edge on desktop with Built-in AI enabled.',
      lastCheckedAt: Date.now(),
    };
    emitNanoState();
    return getNanoStateSnapshot();
  }

  inflightProbe = (async () => {
    try {
      let raw: any = 'unavailable';
      let note: string | null = null;

      if (typeof lm.availability === 'function') {
        try {
          raw = await lm.availability({
            expectedInputs: [{ type: 'text', languages: ['en'] }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }],
          });
        } catch {
          try {
            raw = await lm.availability({
              outputLanguage: 'en',
              expectedInputLanguages: ['en'],
              expectedOutputLanguages: ['en'],
            });
          } catch {
            raw = await lm.availability();
          }
        }
      } else if (typeof lm.capabilities === 'function') {
        const caps = await lm.capabilities();
        raw = caps?.available ?? 'unavailable';
      } else {
        raw = 'unavailable';
        note = 'LanguageModel global found, but availability() method is missing.';
      }

      const mapped = normalizeAvailabilityString(raw);
      if (mapped === 'downloadable') {
        note = 'Gemini Nano is supported on this device and ready to download locally on demand.';
      } else if (mapped === 'available') {
        note = 'Gemini Nano weights are installed locally and ready for instant 0ms-egress inference.';
      } else if (mapped === 'downloading') {
        note = 'Chrome is actively downloading Gemini Nano weights in the background.';
      } else {
        note =
          'LanguageModel API detected, but on-device model reported unavailable (check disk space / VRAM or chrome://on-device-internals).';
      }

      state = {
        ...state,
        ...readHardwareTelemetry(),
        nanoStatus: mapped,
        rawAvailability: String(raw || 'unavailable'),
        downloadProgress: mapped === 'available' ? 100 : state.downloadProgress,
        diagnosticNote: note,
        lastCheckedAt: Date.now(),
      };
    } catch (err: any) {
      const msg = err?.message || String(err || '');
      const isPolicyErr =
        err?.name === 'SecurityError' ||
        err?.name === 'NotAllowedError' ||
        /policy|permission|iframe/i.test(msg);
      state = {
        ...state,
        ...readHardwareTelemetry(),
        nanoStatus: 'unavailable',
        rawAvailability: isPolicyErr ? 'blocked-by-policy' : 'probe-error',
        diagnosticNote: isPolicyErr
          ? 'Blocked by iframe Permissions-Policy (language-model). Open in a top-level browser tab to use Built-in Gemini Nano.'
          : `Probe failed: ${msg.slice(0, 120)}`,
        lastCheckedAt: Date.now(),
      };
    } finally {
      inflightProbe = null;
      emitNanoState();
    }

    return getNanoStateSnapshot();
  })();

  return inflightProbe;
}

/**
 * Must be invoked directly from a user click handler so Chrome's Transient User Activation
 * requirement is satisfied when `LanguageModel.availability()` is `'downloadable'`.
 *
 * Grants local AI consent, triggers model download (with live `downloadprogress` updates)
 * if Gemini Nano is present, warms up and releases a lightweight session, and refreshes state.
 */
export function activateAndDownloadNano(
  onProgress?: (pct: number) => void
): Promise<NanoStateSnapshot> {
  bindCrossTabSync();
  setUserAiConsent(true);

  if (inflightDownload) {
    return inflightDownload;
  }

  const lm = getLanguageModelRoot();
  if (!lm || typeof lm.create !== 'function') {
    return probeNanoAvailability(true);
  }

  const attachMonitor = (m: any) => {
    if (!m || typeof m.addEventListener !== 'function') return;
    m.addEventListener('downloadprogress', (e: any) => {
      const loaded = typeof e?.loaded === 'number' ? e.loaded : 0;
      const total = typeof e?.total === 'number' && e.total > 0 ? e.total : 1;
      const ratio = total > 1 ? loaded / total : loaded;
      const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
      state = {
        ...state,
        nanoStatus: pct < 100 ? 'downloading' : state.nanoStatus,
        downloadProgress: pct,
        diagnosticNote: `Downloading Gemini Nano weights locally (${pct}%)...`,
      };
      onProgress?.(pct);
      emitNanoState();
    });
  };

  if (state.nanoStatus === 'downloadable' || state.nanoStatus === 'downloading') {
    state = {
      ...state,
      nanoStatus: 'downloading',
      downloadProgress: state.downloadProgress ?? 0,
      diagnosticNote: 'Initializing local Gemini Nano download...',
    };
    emitNanoState();
  }

  // IMPORTANT: Invoke `lm.create(...)` synchronously within the user gesture turn!
  let createCall: Promise<any>;
  try {
    createCall = lm.create({
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
      monitor: attachMonitor,
    });
  } catch {
    try {
      createCall = lm.create({ monitor: attachMonitor });
    } catch (syncErr) {
      createCall = Promise.reject(syncErr);
    }
  }

  inflightDownload = (async () => {
    try {
      const session = await createCall;
      try {
        session?.destroy?.();
      } catch {
        // Ignore session cleanup errors
      }
      state = {
        ...state,
        downloadProgress: 100,
      };
      return await probeNanoAvailability(true);
    } catch (err: any) {
      // Fallback attempt for older Chromium revisions if options shape rejected
      try {
        const fallbackSession = await lm.create({
          outputLanguage: 'en',
          monitor: attachMonitor,
        });
        fallbackSession?.destroy?.();
        state = {
          ...state,
          downloadProgress: 100,
        };
        return await probeNanoAvailability(true);
      } catch (innerErr: any) {
        const msg = innerErr?.message || err?.message || 'Unable to initialize Gemini Nano.';
        const refreshed = await probeNanoAvailability(true);
        state = {
          ...refreshed,
          downloadProgress: null,
          diagnosticNote: `Activation notice: ${String(msg).slice(0, 140)}`,
        };
        emitNanoState();
        return getNanoStateSnapshot();
      }
    } finally {
      inflightDownload = null;
    }
  })();

  return inflightDownload;
}
