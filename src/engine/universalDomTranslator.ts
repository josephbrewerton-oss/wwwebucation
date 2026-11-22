import { UNIVERSAL_UI_LEXICON } from '../data/universalUiLexicon';
export { UNIVERSAL_UI_LEXICON };
// src/engine/universalDomTranslator.ts
import {
  SUPPORTED_LANGUAGES,
  getSavedLanguage,
  listenToLanguageChange,
  setSavedLanguage,
  isRtlLanguage,
} from './operational-language';
import {
  translateText,
  speakInLanguage,
  OFFLINE_LEXICON,
  detectNativeTranslatorCapability,
} from './translationService';
import { hasUserGrantedAiConsent } from './aicaller';
import { getBaseUrl } from '../utils/url';

export interface TranslationModeStatus {
  lang: string;
  mode: 'english' | 'native-translator' | 'offline-pack' | 'nano-ai' | 'offline-ui';
  badge: string;
  tooltip: string;
}

const AVAILABLE_OFFLINE_PACKS = new Set(['sw', 'hi', 'ur', 'bn', 'tl', 'ar', 'fr', 'es', 'pt', 'yo']);
const LOADED_I18N_PACKS = new Map<string, { exact: Record<string, string>; lower: Record<string, string> } | null>();
const I18N_CACHE_NAME = 'stj-offline-i18n-v1';

async function loadOfflineLanguagePack(
  targetLang: string
): Promise<{ exact: Record<string, string>; lower: Record<string, string> } | null> {
  if (!AVAILABLE_OFFLINE_PACKS.has(targetLang)) return null;
  if (LOADED_I18N_PACKS.has(targetLang)) {
    return LOADED_I18N_PACKS.get(targetLang) || null;
  }

  const url = `${getBaseUrl()}i18n/${encodeURIComponent(targetLang)}.json`;
  let raw: Record<string, string> | null = null;

  try {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(I18N_CACHE_NAME);
      const cached = await cache.match(url);
      if (cached && cached.ok) {
        raw = await cached.json();
      }
      if (!raw) {
        const res = await fetch(url);
        if (res.ok) {
          cache.put(url, res.clone()).catch(() => {});
          raw = await res.json();
        }
      }
    } else {
      const res = await fetch(url);
      if (res.ok) raw = await res.json();
    }
  } catch {
    raw = null;
  }

  if (!raw || typeof raw !== 'object') {
    LOADED_I18N_PACKS.set(targetLang, null);
    return null;
  }

  const exact: Record<string, string> = {};
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v !== 'string') continue;
    const normKey = k.trim().replace(/\s+/g, ' ');
    exact[normKey] = v;
    lower[normKey.toLowerCase()] = v;
  }
  const bundle = { exact, lower };
  LOADED_I18N_PACKS.set(targetLang, bundle);
  return bundle;
}

function emitTranslationStatus(status: TranslationModeStatus): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portal_translation_status', { detail: status }));
  }
}

// WeakMap storing original English text of DOM text nodes for 100% fidelity restoration
const ORIGINAL_TEXT_NODES = new WeakMap<Text, string>();
const TRANSLATED_TEXT_NODES = new WeakMap<Text, { lang: string; text: string }>();


// Elements to strictly ignore during DOM tree traversal
const IGNORED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'TEXTAREA',
  'SELECT',
  'OPTION',
  'OPTGROUP',
  'INPUT',
  'SVG',
  'NOSCRIPT',
  'IFRAME',
]);

let isUniversalTranslationRunning = false;
let pendingTargetLang: string | null = null;
let universalObserver: MutationObserver | null = null;
let currentActiveTargetLang = 'en';

/**
 * Checks if an element or its ancestor has opted out of translation
 */
function isExcludedFromTranslation(node: Node): boolean {
  let parent = node.parentElement;
  while (parent) {
    if (
      IGNORED_TAGS.has(parent.tagName) ||
      parent.classList.contains('notranslate') ||
      parent.getAttribute('translate') === 'no' ||
      parent.hasAttribute('data-no-translate') ||
      parent.id === 'universal-translator-bar' ||
      parent.id === 'stj-universal-translator-bar' ||
      parent.id === 'stj-lang-select' ||
      parent.id === 'setting-lang' ||
      parent.id === 'neural-worker-guest-vm' ||
      parent.classList.contains('katex') ||
      parent.classList.contains('math-formula')
    ) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

/**
 * Looks up direct offline pack & lexicon match with whitespace normalization,
 * case-insensitivity, and leading/trailing symbol or emoji preservation.
 */
function getLexiconTranslation(
  text: string,
  targetLang: string,
  offlinePack: { exact: Record<string, string>; lower: Record<string, string> } | null
): string | null {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) return null;
  const lower = normalized.toLowerCase();

  // 0. Full offline language pack (static/i18n/<lang>.json)
  if (offlinePack) {
    if (offlinePack.exact[normalized]) return offlinePack.exact[normalized];
    if (offlinePack.lower[lower]) return offlinePack.lower[lower];
  }

  // 1. Direct exact match in UNIVERSAL_UI_LEXICON
  if (UNIVERSAL_UI_LEXICON[normalized] && UNIVERSAL_UI_LEXICON[normalized][targetLang]) {
    return UNIVERSAL_UI_LEXICON[normalized][targetLang];
  }

  // 2. Direct exact or lower match in OFFLINE_LEXICON
  if (OFFLINE_LEXICON[lower] && OFFLINE_LEXICON[lower][targetLang]) {
    return OFFLINE_LEXICON[lower][targetLang];
  }

  // 3. Direct case-insensitive match in UNIVERSAL_UI_LEXICON
  for (const [key, mapping] of Object.entries(UNIVERSAL_UI_LEXICON)) {
    if (key.toLowerCase() === lower && mapping[targetLang]) {
      return mapping[targetLang];
    }
  }

  // 4. Leading/Trailing Emoji or Symbol extraction (e.g. "🕊️ Education should be free", "↗ Open Full Activity")
  const symbolPrefixMatch = normalized.match(/^([^\p{L}\p{N}]*\s*)([\p{L}\p{N}].*?)(\s*[^\p{L}\p{N}]*)$/u);
  if (symbolPrefixMatch) {
    const [, prefix, core, suffix] = symbolPrefixMatch;
    const coreTrimmed = core.trim();
    if (coreTrimmed) {
      const coreLower = coreTrimmed.toLowerCase();
      if (offlinePack) {
        if (offlinePack.exact[coreTrimmed]) return `${prefix}${offlinePack.exact[coreTrimmed]}${suffix}`;
        if (offlinePack.lower[coreLower]) return `${prefix}${offlinePack.lower[coreLower]}${suffix}`;
      }
      if (UNIVERSAL_UI_LEXICON[coreTrimmed]?.[targetLang]) {
        return `${prefix}${UNIVERSAL_UI_LEXICON[coreTrimmed][targetLang]}${suffix}`;
      }
      if (OFFLINE_LEXICON[coreLower]?.[targetLang]) {
        return `${prefix}${OFFLINE_LEXICON[coreLower][targetLang]}${suffix}`;
      }
      for (const [key, mapping] of Object.entries(UNIVERSAL_UI_LEXICON)) {
        if (key.toLowerCase() === coreLower && mapping[targetLang]) {
          return `${prefix}${mapping[targetLang]}${suffix}`;
        }
      }
    }
  }

  return null;
}

/**
 * Universal DOM Translator: walks through visible text nodes across the entire page DOM
 * (body, header, navigation, and viewport), stores the original English string,
 * and replaces it with the translated version.
 */
export async function translatePageDOM(targetLang: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  currentActiveTargetLang = targetLang;

  // Apply Direction & HTML attributes (covers Arabic, Urdu, Persian/Dari, Pashto)
  const isRTL = isRtlLanguage(targetLang);
  document.documentElement.lang = targetLang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  // If returning to English, restore all nodes from the WeakMap
  if (!targetLang || targetLang === 'en') {
    restorePageDOM();
    emitTranslationStatus({
      lang: 'en',
      mode: 'english',
      badge: '',
      tooltip: 'English (Original)',
    });
    return;
  }

  if (isUniversalTranslationRunning) {
    pendingTargetLang = targetLang;
    return;
  }
  isUniversalTranslationRunning = true;

  try {
    // Load lazy offline language pack (if available for this language) and probe Chrome native translator in parallel
    const [offlinePack, nativeCap] = await Promise.all([
      loadOfflineLanguagePack(targetLang),
      detectNativeTranslatorCapability(targetLang, 'en'),
    ]);

    const langMeta = SUPPORTED_LANGUAGES[targetLang];
    const langName = langMeta ? langMeta.nativeLabel : targetLang;

    if (nativeCap === 'available' || nativeCap === 'downloadable') {
      emitTranslationStatus({
        lang: targetLang,
        mode: 'native-translator',
        badge: '⚡ On-Device Neural',
        tooltip: `Full page & lessons translated locally via Chrome Built-in Translator API (${langName}, zero cloud egress).`,
      });
    } else if (offlinePack) {
      emitTranslationStatus({
        lang: targetLang,
        mode: 'offline-pack',
        badge: '📦 Offline Pack',
        tooltip: `Full portal offline language pack active for ${langName} (0 data). Open in a top-level Chrome 138+ tab or enable Nano AI for arbitrary lesson prose.`,
      });
    } else if (hasUserGrantedAiConsent()) {
      emitTranslationStatus({
        lang: targetLang,
        mode: 'nano-ai',
        badge: '✨ Nano AI',
        tooltip: `Translating ${langName} on-device via Gemini Nano (zero cloud egress).`,
      });
    } else {
      emitTranslationStatus({
        lang: targetLang,
        mode: 'offline-ui',
        badge: '📖 Offline UI',
        tooltip: `Menus & key terms translated offline for ${langName}. Open in a top-level Chrome 138+ tab or enable Nano AI for full paragraph translation.`,
      });
    }

    const rootScope = document.body;
    const walker = document.createTreeWalker(
      rootScope,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (isExcludedFromTranslation(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          const val = node.nodeValue?.trim();
          // Filter out empty spaces, numbers only, or single punctuation
          if (!val || /^[0-9\s.,!?:;()[\]{}<>=+\-*\/%&|^~$#@]+$/.test(val)) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodesToTranslate: Text[] = [];
    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      textNodesToTranslate.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    // Process nodes in fast chunks to avoid UI stutter
    const batchSize = 40;
    for (let i = 0; i < textNodesToTranslate.length; i += batchSize) {
      const batch = textNodesToTranslate.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (textNode) => {
          try {
            if (!textNode.parentElement) return;

            // Save original English text if not already saved
            if (!ORIGINAL_TEXT_NODES.has(textNode)) {
              ORIGINAL_TEXT_NODES.set(textNode, textNode.nodeValue || '');
            }

            const originalText = ORIGINAL_TEXT_NODES.get(textNode) || textNode.nodeValue || '';
            const trimmed = originalText.trim();
            if (!trimmed || trimmed.length < 2) return;

            // Check if already translated to this language
            const existing = TRANSLATED_TEXT_NODES.get(textNode);
            if (existing && existing.lang === targetLang) {
              return;
            }

            // 1. Instant offline pack & dictionary lookup
            const dictMatch = getLexiconTranslation(trimmed, targetLang, offlinePack);
            if (dictMatch) {
              const leadingSpace = originalText.match(/^\s*/)?.[0] || '';
              const trailingSpace = originalText.match(/\s*$/)?.[0] || '';
              textNode.nodeValue = `${leadingSpace}${dictMatch}${trailingSpace}`;
              TRANSLATED_TEXT_NODES.set(textNode, { lang: targetLang, text: dictMatch });
              return;
            }

            // 2. On-device multi-tier translation (Local Cache -> Offline Lexicon -> Chrome Translator API -> Optional Nano)
            const normalized = trimmed.replace(/\s+/g, ' ');
            if (normalized.length < 600) {
              const translated = await translateText(normalized, targetLang, 'en');
              if (translated && translated !== normalized) {
                const leadingSpace = originalText.match(/^\s*/)?.[0] || '';
                const trailingSpace = originalText.match(/\s*$/)?.[0] || '';
                textNode.nodeValue = `${leadingSpace}${translated}${trailingSpace}`;
                TRANSLATED_TEXT_NODES.set(textNode, { lang: targetLang, text: translated });
              }
            }
          } catch {
            // Keep original text
          }
        })
      );
    }
  } catch (err) {
    console.warn('[Universal Translator Error]:', err);
  } finally {
    isUniversalTranslationRunning = false;
    if (pendingTargetLang && pendingTargetLang !== currentActiveTargetLang) {
      const nextLang = pendingTargetLang;
      pendingTargetLang = null;
      translatePageDOM(nextLang);
    }
  }
}

/**
 * Restores all text nodes across the entire page back to their original English text.
 */
export function restorePageDOM(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  currentActiveTargetLang = 'en';
  emitTranslationStatus({
    lang: 'en',
    mode: 'english',
    badge: '',
    tooltip: 'English (Original)',
  });

  const rootScope = document.body;
  const walker = document.createTreeWalker(
    rootScope,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return ORIGINAL_TEXT_NODES.has(node as Text)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    }
  );

  let currentNode: Node | null = walker.nextNode();
  while (currentNode) {
    const textNode = currentNode as Text;
    const original = ORIGINAL_TEXT_NODES.get(textNode);
    if (original !== undefined) {
      textNode.nodeValue = original;
    }
    TRANSLATED_TEXT_NODES.delete(textNode);
    currentNode = walker.nextNode();
  }
}

/**
 * Starts a persistent MutationObserver on document.body so dynamically mounted elements,
 * navigation changes, and modals are automatically translated in real-time.
 */
export function enableUniversalObserver(targetLang: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (universalObserver) {
    universalObserver.disconnect();
    universalObserver = null;
  }

  if (!targetLang || targetLang === 'en') return;

  const targetContainer = document.body;
  let debounceTimer: any = null;
  universalObserver = new MutationObserver((mutations) => {
    // Only trigger if new element child nodes were added to avoid loops on text value replacements
    const hasAddedElements = mutations.some(
      (m) =>
        m.addedNodes &&
        Array.from(m.addedNodes).some((n) => {
          if (n.nodeType !== Node.ELEMENT_NODE) return false;
          const el = n as HTMLElement;
          return (
            el.id !== 'universal-translator-bar' &&
            el.id !== 'stj-universal-translator-bar' &&
            !el.closest('#stj-universal-translator-bar')
          );
        })
    );
    if (!hasAddedElements) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      translatePageDOM(targetLang);
    }, 250);
  });

  universalObserver.observe(targetContainer, {
    childList: true,
    subtree: true,
  });
}

/**
 * Read the main content of the current active page aloud in the selected language.
 */
export function speakCurrentPage(targetLang: string): void {
  if (typeof window === 'undefined') return;

  const main = document.querySelector('main') || document.body;
  const headings = Array.from(main.querySelectorAll('h1, h2, h3, p'))
    .slice(0, 6)
    .map((el) => el.textContent?.trim() || '')
    .filter((txt) => txt.length > 5)
    .join('. ');

  if (headings) {
    speakInLanguage(headings, targetLang);
  }
}
