/**
 * src/services/bslGlobalStore.ts
 *
 * St Joseph's Curriculum Portal — Universal Sign Language State, Language Tuple & Event Bus
 * Synchronizes sign language interpreter overlay visibility, language tuples [spoken, sign],
 * BSL Sign Studio authoring modal, and speech boundaries across the entire app.
 */

export type SignLanguageCode = 'BSL' | 'MAKATON' | 'ASL' | 'LSE' | 'ISL' | 'OFF';
export type SpokenLanguageCode = string; // e.g., 'en', 'es', 'la', 'fr', etc.

export type LanguageTuple = [spoken: SpokenLanguageCode, sign: SignLanguageCode];

export interface SignLanguageInfo {
  code: SignLanguageCode;
  name: string;
  nativeLabel: string;
  flag: string;
  alphabetType: 'two-handed' | 'one-handed' | 'hybrid' | 'none';
  family: 'BANZSL' | 'Francosign' | 'Irish' | 'None';
  description: string;
}

export const SUPPORTED_SIGN_LANGUAGES: Record<SignLanguageCode, SignLanguageInfo> = {
  BSL: {
    code: 'BSL',
    name: 'British Sign Language',
    nativeLabel: 'BSL',
    flag: '🇬🇧',
    alphabetType: 'two-handed',
    family: 'BANZSL',
    description: 'Authentic 2-handed manual alphabet and UK regional signing lexicon',
  },
  MAKATON: {
    code: 'MAKATON',
    name: 'Makaton (Key Word Signing)',
    nativeLabel: 'Makaton',
    flag: '🤝',
    alphabetType: 'hybrid',
    family: 'BANZSL',
    description: 'UK SEN language programme using keyword signing in spoken English order',
  },
  ASL: {
    code: 'ASL',
    name: 'American Sign Language',
    nativeLabel: 'ASL',
    flag: '🇺🇸',
    alphabetType: 'one-handed',
    family: 'Francosign',
    description: '1-handed manual alphabet and North American sign conventions',
  },
  LSE: {
    code: 'LSE',
    name: 'Lengua de Signos Española',
    nativeLabel: 'LSE',
    flag: '🇪🇸',
    alphabetType: 'one-handed',
    family: 'Francosign',
    description: 'Spanish national sign language with 1-handed manual alphabet',
  },
  ISL: {
    code: 'ISL',
    name: 'Irish Sign Language',
    nativeLabel: 'ISL',
    flag: '🇮🇪',
    alphabetType: 'hybrid',
    family: 'Irish',
    description: 'Irish sign system with blended two-handed and one-handed elements',
  },
  OFF: {
    code: 'OFF',
    name: 'Sign Interpreter Off',
    nativeLabel: 'Off',
    flag: '🚫',
    alphabetType: 'none',
    family: 'None',
    description: 'Sign interpreter overlay is hidden',
  },
};

const STORAGE_KEY_BSL_ENABLED = 'stj_bsl_enabled';
const STORAGE_KEY_SIGN_LANG = 'stj_sign_language';
const STORAGE_KEY_LANGUAGE_TUPLE = 'stj_language_tuple';

const CHANGE_EVENT = 'stj_bsl_change';
const SIGN_LANG_EVENT = 'stj_sign_lang_change';
const TUPLE_EVENT = 'stj_language_tuple_change';
const SPEECH_EVENT = 'stj_bsl_speech';
const STUDIO_EVENT = 'stj_bsl_studio_toggle';

export interface BslSpeechPayload {
  word?: string;
  subtitle?: string;
  isSpeaking?: boolean;
}

export interface SignStudioEventPayload {
  open: boolean;
  word?: string;
}

/**
 * Gets the current active Sign Language code ('BSL', 'ASL', 'LSE', 'ISL', or 'OFF').
 */
export function getSignLanguage(): SignLanguageCode {
  if (typeof window === 'undefined') return 'BSL';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SIGN_LANG);
    if (saved && (saved in SUPPORTED_SIGN_LANGUAGES)) {
      return saved as SignLanguageCode;
    }
    // Fallback to legacy bsl_enabled
    const legacyEnabled = localStorage.getItem(STORAGE_KEY_BSL_ENABLED) === 'true';
    return legacyEnabled ? 'BSL' : 'OFF';
  } catch (_) {
    return 'BSL';
  }
}

/**
 * Sets the active sign language and dispatches synchronization events.
 */
export function setSignLanguage(code: SignLanguageCode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SIGN_LANG, code);
    localStorage.setItem(STORAGE_KEY_BSL_ENABLED, code !== 'OFF' ? 'true' : 'false');

    // Update tuple
    const tuple = getLanguageTuple();
    tuple[1] = code;
    localStorage.setItem(STORAGE_KEY_LANGUAGE_TUPLE, JSON.stringify(tuple));

    window.dispatchEvent(new CustomEvent(SIGN_LANG_EVENT, { detail: { signLanguage: code } }));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { enabled: code !== 'OFF' } }));
    window.dispatchEvent(new CustomEvent(TUPLE_EVENT, { detail: { tuple } }));
  } catch (_) {}
}

/**
 * Gets the current language tuple: [spokenLanguageCode, signLanguageCode].
 */
export function getLanguageTuple(): LanguageTuple {
  if (typeof window === 'undefined') return ['en', 'BSL'];
  try {
    const savedTuple = localStorage.getItem(STORAGE_KEY_LANGUAGE_TUPLE);
    if (savedTuple) {
      const parsed = JSON.parse(savedTuple);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return [parsed[0] || 'en', (parsed[1] as SignLanguageCode) || 'OFF'];
      }
    }
    const spoken = localStorage.getItem('app_saved_language') || 'en';
    const sign = getSignLanguage();
    return [spoken, sign];
  } catch (_) {
    return ['en', 'BSL'];
  }
}

/**
 * Sets the language tuple: [spokenLanguageCode, signLanguageCode].
 */
export function setLanguageTuple(tuple: LanguageTuple): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE_TUPLE, JSON.stringify(tuple));
    localStorage.setItem('app_saved_language', tuple[0]);
    localStorage.setItem(STORAGE_KEY_SIGN_LANG, tuple[1]);
    localStorage.setItem(STORAGE_KEY_BSL_ENABLED, tuple[1] !== 'OFF' ? 'true' : 'false');

    window.dispatchEvent(new CustomEvent(TUPLE_EVENT, { detail: { tuple } }));
    window.dispatchEvent(new CustomEvent(SIGN_LANG_EVENT, { detail: { signLanguage: tuple[1] } }));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { enabled: tuple[1] !== 'OFF' } }));
  } catch (_) {}
}

export function subscribeLanguageTuple(callback: (tuple: LanguageTuple) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ tuple: LanguageTuple }>;
    if (custom.detail && custom.detail.tuple) {
      callback(custom.detail.tuple);
    } else {
      callback(getLanguageTuple());
    }
  };
  window.addEventListener(TUPLE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(TUPLE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function subscribeSignLanguage(callback: (code: SignLanguageCode) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ signLanguage: SignLanguageCode }>;
    if (custom.detail && custom.detail.signLanguage) {
      callback(custom.detail.signLanguage);
    } else {
      callback(getSignLanguage());
    }
  };
  window.addEventListener(SIGN_LANG_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(SIGN_LANG_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// Backward compatibility methods for existing BSL callers:
export function getBslEnabled(): boolean {
  return getSignLanguage() !== 'OFF';
}

export function setBslEnabled(enabled: boolean): void {
  setSignLanguage(enabled ? 'BSL' : 'OFF');
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

/**
 * Opens or closes the BSL Sign Studio creation modal.
 */
export function openBslSignStudio(wordToEdit?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SignStudioEventPayload>(STUDIO_EVENT, {
      detail: { open: true, word: wordToEdit },
    })
  );
}

export function closeBslSignStudio(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SignStudioEventPayload>(STUDIO_EVENT, {
      detail: { open: false },
    })
  );
}

export function subscribeBslSignStudio(
  callback: (payload: SignStudioEventPayload) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<SignStudioEventPayload>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };
  window.addEventListener(STUDIO_EVENT, handler);
  return () => window.removeEventListener(STUDIO_EVENT, handler);
}

export interface CodebookKeyframe {
  idx: number;
  shape: string;
  pos: [number, number, number];
  ori: string;
  aspect?: string;
  hold?: number;
}

export interface CodebookSign {
  id: string;
  g: number;
  w: number;
  hex: number;
  viseme: string;
  keyframes: CodebookKeyframe[];
}

export function initCodebookIntoLexicon(_codebook?: any): void {
  // Canonical registry hook for Level 6 BSL codebook signs
}
