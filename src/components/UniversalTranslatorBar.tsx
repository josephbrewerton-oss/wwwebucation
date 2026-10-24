// src/components/UniversalTranslatorBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SUPPORTED_LANGUAGES,
  getSavedLanguage,
  setSavedLanguage,
  listenToLanguageChange,
  getLanguagePracticeMode,
  setLanguagePracticeMode,
  listenToLanguagePracticeMode,
  getSpeechSpeed,
  setSpeechSpeed,
  listenToSpeechSpeed,
} from '../engine/operational-language';
import {
  translatePageDOM,
  restorePageDOM,
  enableUniversalObserver,
  speakCurrentPage,
} from '../engine/universalDomTranslator';
import {
  getBslEnabled,
  toggleBsl,
  subscribeBsl,
  getSignLanguage,
  setSignLanguage,
  getLanguageTuple,
  setLanguageTuple,
  subscribeLanguageTuple,
  openBslSignStudio,
  SUPPORTED_SIGN_LANGUAGES,
  SignLanguageCode,
  LanguageTuple,
} from '../services/bslGlobalStore';

export default function UniversalTranslatorBar() {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [signLang, setSignLang] = useState<SignLanguageCode>(() => getSignLanguage());
  const [languageTuple, setLanguageTupleState] = useState<LanguageTuple>(() => getLanguageTuple());
  const [bslEnabled, setBslEnabled] = useState<boolean>(() => getBslEnabled());
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [practiceMode, setPracticeMode] = useState<boolean>(() => getLanguagePracticeMode());
  const [speechSpeed, setLocalSpeechSpeed] = useState<number>(() => getSpeechSpeed());
  const googleScriptLoadedRef = useRef(false);

  // Ensure CSS variable --universal-bar-height is set once or on actual height changes without triggering forced synchronous reflow
  const lastHeightRef = useRef<number>(-1);

  // Synchronize global British Sign Language (BSL) & Language Tuple state
  useEffect(() => {
    const unsubscribeTuple = subscribeLanguageTuple((tuple) => {
      setLanguageTupleState(tuple);
      setSignLang(tuple[1]);
      setBslEnabled(tuple[1] !== 'OFF');
    });
    return unsubscribeTuple;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bar = document.getElementById('universal-translator-bar');
    if (!bar) return;

    let rAFId: number;

    const applyHeight = (height: number) => {
      const rounded = Math.round(height);
      if (rounded <= 0 || rounded === lastHeightRef.current) return;
      lastHeightRef.current = rounded;
      rAFId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--universal-bar-height', `${rounded}px`);
      });
    };

    // Use ResizeObserver's native entry box dimensions — zero forced layout calculations
    const ro = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      let height = 0;
      if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
        height = entry.borderBoxSize[0].blockSize;
      } else if (entry.contentBoxSize && entry.contentBoxSize.length > 0) {
        height = entry.contentBoxSize[0].blockSize;
      } else {
        height = entry.contentRect.height;
      }
      if (height > 0) {
        applyHeight(height);
      }
    });

    ro.observe(bar);
    return () => {
      cancelAnimationFrame(rAFId);
      ro.disconnect();
    };
  }, [isCollapsed]);

  // Google Translate engine auto-loader
  const ensureGoogleTranslateLoaded = () => {
    if (typeof window === 'undefined') return;
    const win = window as any;
    if (!win.googleTranslateElementInit) {
      win.googleTranslateElementInit = () => {
        try {
          if (win.google?.translate?.TranslateElement) {
            new win.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                layout: win.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              'google_translate_element'
            );
          }
        } catch (e) {
          console.warn('[GoogleTranslate Init]:', e);
        }
      };
    }

    if (!googleScriptLoadedRef.current && !document.getElementById('google-translate-script')) {
      googleScriptLoadedRef.current = true;
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const applyGoogleTranslate = (langCode: string) => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    if (langCode === 'en' || !langCode) {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (!isLocal) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
      }
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      if (!isLocal) {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${host};`;
      }
    }

    // Trigger Google combo if element already mounted
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = langCode === 'en' ? '' : langCode;
      combo.dispatchEvent(new Event('change'));
    }
  };

  // Initialize from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = getSavedLanguage();
    setCurrentLang(saved);
    if (saved && saved !== 'en') {
      setIsTranslated(true);
      ensureGoogleTranslateLoaded();
      applyGoogleTranslate(saved);
      translatePageDOM(saved);
      enableUniversalObserver(saved);
    }
  }, []);

  // Sync with global language changes (from Practice Lab, Learning Zone, etc.)
  useEffect(() => {
    const unsub = listenToLanguageChange((newLang) => {
      setCurrentLang(newLang);
      if (newLang && newLang !== 'en') {
        setIsTranslating(true);
        setIsTranslated(true);
        ensureGoogleTranslateLoaded();
        applyGoogleTranslate(newLang);
        translatePageDOM(newLang).then(() => {
          setIsTranslating(false);
          enableUniversalObserver(newLang);
        });
      } else {
        setIsTranslated(false);
        applyGoogleTranslate('en');
        restorePageDOM();
      }
    });
    return unsub;
  }, []);

  // Listen to Language Practice Mode & Speech Speed changes
  useEffect(() => {
    const unsubPractice = listenToLanguagePracticeMode((enabled) => {
      setPracticeMode(enabled);
    });
    const unsubSpeed = listenToSpeechSpeed((speed) => {
      setLocalSpeechSpeed(speed);
    });
    return () => {
      unsubPractice();
      unsubSpeed();
    };
  }, []);

  const location = useLocation();

  // Listen to route transitions across the entire SPA to automatically re-translate new pages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = getSavedLanguage();
    if (saved && saved !== 'en') {
      setIsTranslated(true);
      ensureGoogleTranslateLoaded();
      applyGoogleTranslate(saved);
      const timer = setTimeout(() => {
        translatePageDOM(saved);
        enableUniversalObserver(saved);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.search]);

  const handleLanguageSelect = async (langCode: string) => {
    setCurrentLang(langCode);
    setSavedLanguage(langCode);
    setLanguageTuple([langCode, signLang]);

    if (langCode === 'en') {
      setIsTranslated(false);
      applyGoogleTranslate('en');
      restorePageDOM();
      return;
    }

    setIsTranslating(true);
    setIsTranslated(true);
    ensureGoogleTranslateLoaded();
    applyGoogleTranslate(langCode);
    try {
      await translatePageDOM(langCode);
      enableUniversalObserver(langCode);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSignLanguageChange = (newSign: SignLanguageCode) => {
    setSignLang(newSign);
    setLanguageTuple([currentLang, newSign]);
  };

  const handleToggleOriginal = () => {
    if (isTranslated) {
      applyGoogleTranslate('en');
      restorePageDOM();
      setIsTranslated(false);
    } else {
      if (currentLang && currentLang !== 'en') {
        setIsTranslating(true);
        ensureGoogleTranslateLoaded();
        applyGoogleTranslate(currentLang);
        translatePageDOM(currentLang).then(() => {
          setIsTranslating(false);
          setIsTranslated(true);
          enableUniversalObserver(currentLang);
        });
      }
    }
  };

  const handleSpeak = () => {
    speakCurrentPage(currentLang);
  };

  const langMeta = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.en;

  return (
    <div
      id="universal-translator-bar"
      className="notranslate"
      role="region"
      aria-label="Universal Language Translator"
      style={{
        width: '100%',
        background: '#0b0f19',
        color: '#f8fafc',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'var(--stj-font-sans)',
        fontSize: '0.84rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isCollapsed ? '0.3rem 0.75rem' : '0.4rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.4rem 0.75rem',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Left: Branding & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.05rem' }} role="img" aria-label="Globe">
            🌐
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '0.82rem' }}>
              <span className="hidden sm:inline">Universal </span>Translator
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: isTranslated ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: isTranslated ? '#34d399' : '#cbd5e1',
                border: `1px solid ${isTranslated ? 'rgba(5, 150, 105, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                fontWeight: 600,
                maxWidth: '110px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={isTranslating ? 'Translating...' : isTranslated ? langMeta.nativeLabel : 'English Original'}
            >
              {isTranslating
                ? '...'
                : isTranslated
                ? `${langMeta.nativeLabel}`
                : 'English'}
            </span>
          </div>
        </div>

        {/* Center & Right Controls */}
        {!isCollapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.35rem',
            }}
          >
            {/* Language Picker Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <label
                htmlFor="universal-lang-select"
                className="hidden sm:inline"
                style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}
              >
                To:
              </label>
              <select
                id="universal-lang-select"
                value={currentLang}
                onChange={(e) => handleLanguageSelect(e.target.value)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '0.22rem 0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '125px',
                }}
              >
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label} ({lang.nativeLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Revert / View Original Toggle */}
            {currentLang !== 'en' && (
              <button
                type="button"
                id="universal-toggle-original-btn"
                onClick={handleToggleOriginal}
                style={{
                  background: isTranslated ? 'rgba(51, 65, 85, 0.8)' : '#2563eb',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '0.22rem 0.55rem',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
                title="Toggle between translated page and original English text"
              >
                {isTranslated ? '🇬🇧 Original' : `🌐 ${langMeta.label}`}
              </button>
            )}

            {/* Language Practice Mode (Dual Parallel Text + Ear-Training) */}
            <button
              type="button"
              id="universal-practice-mode-btn"
              onClick={() => {
                const next = !practiceMode;
                setPracticeMode(next);
                setLanguagePracticeMode(next);
              }}
              style={{
                background: practiceMode ? 'rgba(6, 95, 70, 0.6)' : 'rgba(30, 41, 59, 0.8)',
                color: practiceMode ? '#a7f3d0' : '#cbd5e1',
                border: `1px solid ${practiceMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '6px',
                padding: '0.22rem 0.55rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              title="Toggle Language Practice Mode: Parallel bilingual text and ear-training"
            >
              <span>🗣️</span>
              <span className="hidden sm:inline">{practiceMode ? 'Practice: ON' : 'Practice'}</span>
            </button>

            {/* Speech Speed Setting (Normal vs Slow/Clear) - Desktop / Tablet only to save mobile space */}
            <div
              className="hidden md:inline-flex"
              style={{
                alignItems: 'center',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '1px 3px',
                gap: '2px',
              }}
              title="Text-to-speech audio playback speed"
            >
              <button
                type="button"
                onClick={() => {
                  setLocalSpeechSpeed(0.7);
                  setSpeechSpeed(0.7);
                }}
                style={{
                  background: speechSpeed < 0.85 ? '#2563eb' : 'transparent',
                  color: speechSpeed < 0.85 ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Slower, phonetic speech for language acquisition"
              >
                🐢 0.7x
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalSpeechSpeed(0.95);
                  setSpeechSpeed(0.95);
                }}
                style={{
                  background: speechSpeed >= 0.85 ? '#2563eb' : 'transparent',
                  color: speechSpeed >= 0.85 ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Standard speech speed"
              >
                1.0x
              </button>
            </div>

            {/* Read Page Aloud */}
            <button
              type="button"
              id="universal-read-aloud-btn"
              onClick={handleSpeak}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '0.22rem 0.55rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              title="Listen to page text read aloud in selected language"
            >
              <span>🔊</span>
              <span className="hidden sm:inline">Listen</span>
            </button>

            {/* Sign Language / Language Tuple Control Group */}
            <div
              className="inline-flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-md px-1.5 py-0.5"
              title={`Language Tuple: [Spoken: ${currentLang.toUpperCase()} / Sign: ${signLang}]`}
            >
              <label htmlFor="universal-sign-select" className="text-xs text-slate-400 font-semibold flex items-center gap-1 cursor-pointer">
                <span>🖐️</span>
                <span className="hidden lg:inline text-[11px] font-mono text-sky-400">[{currentLang.toUpperCase()}/{signLang}]</span>
              </label>

              <select
                id="universal-sign-select"
                value={signLang}
                onChange={(e) => handleSignLanguageChange(e.target.value as SignLanguageCode)}
                className="bg-transparent text-xs font-bold text-sky-300 focus:outline-none cursor-pointer py-0.5"
                title="Select Sign Language Interpreter system (Language Tuple [spoken, sign])"
              >
                <option value="BSL" className="bg-slate-900 text-white">🇬🇧 BSL (Level 2/3 Natural)</option>
                <option value="ASL" className="bg-slate-900 text-white">🇺🇸 ASL (American)</option>
                <option value="LSE" className="bg-slate-900 text-white">🇪🇸 LSE (Spanish)</option>
                <option value="ISL" className="bg-slate-900 text-white">🇮🇪 ISL (Irish)</option>
                <option value="OFF" className="bg-slate-900 text-slate-400">🚫 Sign: Off</option>
              </select>

              {/* BSL Sign Studio Launcher Button */}
              <button
                type="button"
                id="universal-open-studio-btn"
                onClick={() => openBslSignStudio()}
                style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid #10b981',
                  color: '#6ee7b7',
                  borderRadius: '4px',
                  padding: '0.12rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                title="Open BSL Sign Studio — Author and pose custom curriculum signs"
              >
                <span>✍️</span>
                <span className="hidden sm:inline">Studio</span>
              </button>
            </div>

            {/* Permanent hidden container for automated Google Web Translation Engine */}
            <div
              id="google_translate_element"
              style={{ display: 'none' }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Rightmost: Collapse / Minimize Toggle */}
        <button
          type="button"
          id="universal-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '4px',
            textDecoration: 'underline',
            whiteSpace: 'nowrap',
          }}
          title={isCollapsed ? 'Expand language tools' : 'Minimize translator bar to save screen space'}
        >
          {isCollapsed ? '🌐 Translate ▲' : 'Minimize ▼'}
        </button>
      </div>
    </div>
  );
}
