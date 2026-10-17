/**
 * src/services/bslGlobalStore.ts
 *
 * St Joseph's Curriculum Portal — Universal British Sign Language (BSL) State & Event Bus
 * Synchronizes BSL interpreter overlay visibility and speech boundaries across the entire app.
 */

const STORAGE_KEY = 'stj_bsl_enabled';
const CHANGE_EVENT = 'stj_bsl_change';
const SPEECH_EVENT = 'stj_bsl_speech';

export interface BslSpeechPayload {
  word?: string;
  subtitle?: string;
  isSpeaking?: boolean;
}

export function getBslEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

export function setBslEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { enabled } }));
  } catch (_) {}
}

export function toggleBsl(): boolean {
  const current = getBslEnabled();
  const next = !current;
  setBslEnabled(next);
  return next;
}

export function subscribeBsl(callback: (enabled: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ enabled: boolean }>;
    if (custom.detail && typeof custom.detail.enabled === 'boolean') {
      callback(custom.detail.enabled);
    } else {
      callback(getBslEnabled());
    }
  };

  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function broadcastBslSpeech(payload: BslSpeechPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(SPEECH_EVENT, { detail: payload }));
  } catch (_) {}
}

export function subscribeBslSpeech(callback: (payload: BslSpeechPayload) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<BslSpeechPayload>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(SPEECH_EVENT, handler);
  return () => {
    window.removeEventListener(SPEECH_EVENT, handler);
  };
}
