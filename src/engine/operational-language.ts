// src/engine/operational-language.ts
/**
 * Operational Language Engine
 * 100% Zero-React, pure TypeScript module.
 * Compact registry supporting 45 Global South, European, and Liturgical languages
 * while preserving the <20 KB initial SPA boot bundle budget.
 */
import { getLocalState, setLocalState, subscribeLocalState } from '../services/localStateStore';

export type LanguageRegion =
  | 'core'
  | 'africa'
  | 'south-asia'
  | 'se-asia'
  | 'mena-americas'
  | 'europe';

export interface SupportedLanguage {
  code: string;
  label: string;
  nativeLabel: string;
  ttsVoiceLang: string; // For Web Speech API synthesis
  promptCondition: string;
  flag?: string;
  region?: LanguageRegion;
  rtl?: boolean;
}

export const LANGUAGE_REGION_LABELS: Record<LanguageRegion, string> = {
  core: 'Core',
  africa: 'Africa',
  'south-asia': 'South Asia',
  'se-asia': 'Southeast & East Asia',
  'mena-americas': 'Middle East, Americas & Caribbean',
  europe: 'Europe & Liturgical',
};

const REGION_ORDER: LanguageRegion[] = [
  'core',
  'africa',
  'south-asia',
  'se-asia',
  'mena-americas',
  'europe',
];

function defineLang(
  code: string,
  label: string,
  nativeLabel: string,
  ttsVoiceLang: string,
  flag: string,
  region: LanguageRegion,
  rtl = false
): SupportedLanguage {
  return {
    code,
    label,
    nativeLabel,
    ttsVoiceLang,
    flag,
    region,
    rtl,
    promptCondition:
      code === 'en'
        ? 'Formulate all explanations, question text, and hints in clear English.'
        : `Formulate all explanations, question text, and hints strictly in ${label} (${nativeLabel}).`,
  };
}

const LANGUAGE_LIST: SupportedLanguage[] = [
  // Core
  defineLang('en', 'English', 'English', 'en-GB', '🇬🇧', 'core'),

  // Africa (Developing-world partner & curriculum languages)
  defineLang('sw', 'Swahili', 'Kiswahili', 'sw-KE', '🇰🇪', 'africa'),
  defineLang('yo', 'Yoruba', 'Èdè Yorùbá', 'yo-NG', '🇳🇬', 'africa'),
  defineLang('ig', 'Igbo', 'Asụsụ Igbo', 'ig-NG', '🇳🇬', 'africa'),
  defineLang('ha', 'Hausa', 'Harshen Hausa', 'ha-NG', '🇳🇬', 'africa'),
  defineLang('ak', 'Twi / Akan', 'Akan (Twi)', 'ak-GH', '🇬🇭', 'africa'),
  defineLang('zu', 'Zulu', 'isiZulu', 'zu-ZA', '🇿🇦', 'africa'),
  defineLang('am', 'Amharic', 'አማርኛ', 'am-ET', '🇪🇹', 'africa'),
  defineLang('om', 'Oromo', 'Afaan Oromoo', 'om-ET', '🇪🇹', 'africa'),
  defineLang('ti', 'Tigrinya', 'ትግርኛ', 'ti-ET', '🇪🇷', 'africa'),
  defineLang('so', 'Somali', 'Soomaali', 'so-SO', '🇸🇴', 'africa'),
  defineLang('rw', 'Kinyarwanda', 'Ikinyarwanda', 'rw-RW', '🇷🇼', 'africa'),
  defineLang('lg', 'Luganda', 'Luganda', 'lg-UG', '🇺🇬', 'africa'),
  defineLang('sn', 'Shona', 'chiShona', 'sn-ZW', '🇿🇼', 'africa'),
  defineLang('ny', 'Chichewa', 'Chichewa', 'ny-MW', '🇲🇼', 'africa'),

  // South Asia
  defineLang('hi', 'Hindi', 'हिन्दी', 'hi-IN', '🇮🇳', 'south-asia'),
  defineLang('bn', 'Bengali', 'বাংলা', 'bn-BD', '🇧🇩', 'south-asia'),
  defineLang('ur', 'Urdu', 'اردو', 'ur-PK', '🇵🇰', 'south-asia', true),
  defineLang('ta', 'Tamil', 'தமிழ்', 'ta-IN', '🇮🇳', 'south-asia'),
  defineLang('te', 'Telugu', 'తెలుగు', 'te-IN', '🇮🇳', 'south-asia'),
  defineLang('mr', 'Marathi', 'मराठी', 'mr-IN', '🇮🇳', 'south-asia'),
  defineLang('pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'pa-IN', '🇮🇳', 'south-asia'),
  defineLang('gu', 'Gujarati', 'ગુજરાતી', 'gu-IN', '🇮🇳', 'south-asia'),
  defineLang('ne', 'Nepali', 'नेपाली', 'ne-NP', '🇳🇵', 'south-asia'),
  defineLang('si', 'Sinhala', 'සිංහල', 'si-LK', '🇱🇰', 'south-asia'),

  // Southeast & East Asia
  defineLang('tl', 'Filipino / Tagalog', 'Filipino', 'fil-PH', '🇵🇭', 'se-asia'),
  defineLang('id', 'Indonesian', 'Bahasa Indonesia', 'id-ID', '🇮🇩', 'se-asia'),
  defineLang('ms', 'Malay', 'Bahasa Melayu', 'ms-MY', '🇲🇾', 'se-asia'),
  defineLang('vi', 'Vietnamese', 'Tiếng Việt', 'vi-VN', '🇻🇳', 'se-asia'),
  defineLang('my', 'Burmese', 'မြန်မာဘာသာ', 'my-MM', '🇲🇲', 'se-asia'),
  defineLang('km', 'Khmer', 'ភាសាខ្មែរ', 'km-KH', '🇰🇭', 'se-asia'),
  defineLang('zh', 'Chinese', '中文', 'zh-CN', '🇨🇳', 'se-asia'),

  // Middle East, Americas & Caribbean
  defineLang('ar', 'Arabic', 'العربية', 'ar-SA', '🇸🇦', 'mena-americas', true),
  defineLang('fa', 'Persian / Dari', 'فارسی / دری', 'fa-IR', '🇦🇫', 'mena-americas', true),
  defineLang('ps', 'Pashto', 'پښتو', 'ps-AF', '🇦🇫', 'mena-americas', true),
  defineLang('ht', 'Haitian Creole', 'Kreyòl Ayisyen', 'ht-HT', '🇭🇹', 'mena-americas'),
  defineLang('es', 'Spanish', 'Español', 'es-ES', '🇪🇸', 'mena-americas'),
  defineLang('pt', 'Portuguese', 'Português', 'pt-BR', '🇧🇷', 'mena-americas'),
  defineLang('fr', 'French', 'Français', 'fr-FR', '🇫🇷', 'mena-americas'),

  // Europe & Liturgical
  defineLang('de', 'German', 'Deutsch', 'de-DE', '🇩🇪', 'europe'),
  defineLang('pl', 'Polish', 'Polski', 'pl-PL', '🇵🇱', 'europe'),
  defineLang('uk', 'Ukrainian', 'Українська', 'uk-UA', '🇺🇦', 'europe'),
  defineLang('it', 'Italian', 'Italiano', 'it-IT', '🇮🇹', 'europe'),
  defineLang('tr', 'Turkish', 'Türkçe', 'tr-TR', '🇹🇷', 'europe'),
  defineLang('la', 'Latin', 'Lingua Latina', 'la', '🇻🇦', 'europe'),
];

export const SUPPORTED_LANGUAGES: Record<string, SupportedLanguage> = Object.fromEntries(
  LANGUAGE_LIST.map((l) => [l.code, l])
);

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.en;
export const PORTAL_LANG_STORAGE_KEY = 'portal_language';
export const PORTAL_PRACTICE_MODE_STORAGE_KEY = 'portal_language_practice_mode';
export const PORTAL_SPEECH_SPEED_STORAGE_KEY = 'portal_speech_speed';

export function isRtlLanguage(langCode: string): boolean {
  return Boolean(SUPPORTED_LANGUAGES[langCode]?.rtl);
}

/**
 * Generates grouped <optgroup>/<option> HTML for language dropdowns
 * so both the Universal Access top bar and Settings stay 100% in sync.
 */
export function buildLanguageSelectOptionsHtml(currentLang: string): string {
  return REGION_ORDER.map((region) => {
    const items = LANGUAGE_LIST.filter((l) => l.region === region);
    const opts = items
      .map((l) => {
        const display =
          l.nativeLabel === l.label
            ? `${l.flag || ''} ${l.label}`
            : `${l.flag || ''} ${l.nativeLabel} (${l.label})`;
        return `<option value="${l.code}"${currentLang === l.code ? ' selected' : ''}>${display.trim()}</option>`;
      })
      .join('');
    if (region === 'core') return opts;
    return `<optgroup label="${LANGUAGE_REGION_LABELS[region]}">${opts}</optgroup>`;
  }).join('');
}

export function getSavedLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  const saved = getLocalState(PORTAL_LANG_STORAGE_KEY) || 'en';
  return SUPPORTED_LANGUAGES[saved] ? saved : 'en';
}

export function getLanguagePracticeMode(): boolean {
  if (typeof window === 'undefined') return false;
  return getLocalState(PORTAL_PRACTICE_MODE_STORAGE_KEY) === 'true';
}

export function setLanguagePracticeMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  setLocalState(PORTAL_PRACTICE_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('portal_practice_mode_changed', { detail: enabled }));
  try {
    const channel = new BroadcastChannel('neural_hypervisor_bus');
    channel.postMessage({ type: 'SET_PRACTICE_MODE', enabled });
    channel.close();
  } catch {}
}

export function listenToLanguagePracticeMode(callback: (enabled: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleCustom = (e: any) => {
    if (e.detail !== undefined) callback(Boolean(e.detail));
  };
  window.addEventListener('portal_practice_mode_changed', handleCustom);
  return () => window.removeEventListener('portal_practice_mode_changed', handleCustom);
}

export function getSpeechSpeed(): number {
  if (typeof window === 'undefined') return 0.95;
  const val = parseFloat(getLocalState(PORTAL_SPEECH_SPEED_STORAGE_KEY) || '0.95');
  return isNaN(val) ? 0.95 : val;
}

export function setSpeechSpeed(speed: number): void {
  if (typeof window === 'undefined') return;
  setLocalState(PORTAL_SPEECH_SPEED_STORAGE_KEY, speed.toString());
  window.dispatchEvent(new CustomEvent('portal_speech_speed_changed', { detail: speed }));
}

export function listenToSpeechSpeed(callback: (speed: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleCustom = (e: any) => {
    if (e.detail !== undefined) callback(Number(e.detail));
  };
  window.addEventListener('portal_speech_speed_changed', handleCustom);
  return () => window.removeEventListener('portal_speech_speed_changed', handleCustom);
}

export function setSavedLanguage(langCode: string): void {
  if (typeof window === 'undefined') return;
  const validCode = SUPPORTED_LANGUAGES[langCode] ? langCode : 'en';
  setLocalState(PORTAL_LANG_STORAGE_KEY, validCode);

  // 1. Custom event for local in-window subscribers
  window.dispatchEvent(new CustomEvent('portal_language_changed', { detail: validCode }));

  // 2. Broadcast across tabs and workers
  try {
    const channel = new BroadcastChannel('neural_hypervisor_bus');
    channel.postMessage({ type: 'SET_LANGUAGE', lang: validCode });
    channel.close();
  } catch {}
}

export function listenToLanguageChange(callback: (lang: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e: any) => {
    if (e.detail) callback(e.detail);
  };

  const unsubscribeState = subscribeLocalState((detail) => {
    callback(detail.value || getSavedLanguage());
  }, PORTAL_LANG_STORAGE_KEY);

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel('neural_hypervisor_bus');
    channel.onmessage = (event) => {
      if (event.data?.type === 'SET_LANGUAGE' && event.data.lang) {
        callback(event.data.lang);
      }
    };
  } catch {}

  window.addEventListener('portal_language_changed', handleCustom);

  return () => {
    window.removeEventListener('portal_language_changed', handleCustom);
    unsubscribeState();
    if (channel) {
      try { channel.close(); } catch {}
    }
  };
}

/**
 * Native DOM Language Selector renderer
 */
export function renderLanguageSelector(options: {
  currentLang?: string;
  onSelect?: (langCode: string) => void;
  compact?: boolean;
} = {}): HTMLElement {
  const { currentLang, onSelect, compact = false } = options;
  let activeLang = currentLang || getSavedLanguage();

  const container = document.createElement('div');
  container.className = 'notranslate';
  container.setAttribute('translate', 'no');
  container.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
    padding: ${compact ? '2px 8px' : '4px 12px'};
    border-radius: 8px;
    border: 1px solid #cbd5e1;
  `;

  const label = document.createElement('label');
  label.style.cssText = `
    font-size: ${compact ? '0.8rem' : '0.85rem'};
    font-weight: 700;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  `;
  label.innerHTML = `<span>🌐</span> ${!compact ? 'Translate:' : ''}`;
  container.appendChild(label);

  const select = document.createElement('select');
  select.className = 'notranslate';
  select.setAttribute('translate', 'no');
  select.setAttribute('aria-label', 'Select Language');
  select.style.cssText = `
    padding: ${compact ? '0.25rem 0.5rem' : '0.35rem 0.65rem'};
    border-radius: 6px;
    border: 1px solid #94a3b8;
    background: #ffffff;
    color: #0f172a;
    font-size: ${compact ? '0.8rem' : '0.85rem'};
    font-weight: 600;
    cursor: pointer;
    outline: none;
  `;
  select.innerHTML = buildLanguageSelectOptionsHtml(activeLang);

  select.onchange = (e) => {
    const val = (e.target as HTMLSelectElement).value;
    activeLang = val;
    setSavedLanguage(val);
    onSelect?.(val);
  };
  container.appendChild(select);

  listenToLanguageChange((newLang) => {
    select.value = newLang;
  });

  return container;
}

export const LanguageSelector = renderLanguageSelector;
