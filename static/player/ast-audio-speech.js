/**
 * static/player/ast-audio-speech.js
 * Procedural Web Audio Synthesizer & On-Device Web Speech Helpers for AST Vector Player
 */
(function (global) {
  'use strict';

  /**
   * VectorProceduralAudioSynth (< 1.2 KB Zero-Asset Web Audio Synthesizer)
   * Generates realtime tactile clicks, harmonic pentatonic chimes, AC current hums,
   * spring impacts, and checkpoint alerts entirely via mathematical oscillators.
   */
  class VectorProceduralAudioSynth {
    constructor(engine) {
      this.engine = engine;
      this.ctx = null;
      this.muted = false;
      this.humOsc = null;
      this.humGain = null;
      this._unlocked = false;
    }

    _getSharedHost() {
      if (typeof window === 'undefined') return null;
      try {
        if (window.top && window.top !== window && window.top.location && window.top.location.origin === window.location.origin) {
          return window.top;
        }
      } catch (_) {}
      return window;
    }

    init() {
      if (this.ctx && this.ctx.state !== 'closed') return;
      try {
        const host = this._getSharedHost();
        if (host && host.__astSharedAudioCtx && host.__astSharedAudioCtx.state !== 'closed') {
          this.ctx = host.__astSharedAudioCtx;
          return;
        }
        const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          if (host) host.__astSharedAudioCtx = this.ctx;
          if (typeof window !== 'undefined') window.__astSharedAudioCtx = this.ctx;
        }
      } catch (e) {
        console.warn('[AudioSynth] Web Audio not available:', e);
      }
    }

    unlock() {
      try {
        if (typeof navigator !== 'undefined' && navigator.audioSession && navigator.audioSession.type !== 'playback') {
          navigator.audioSession.type = 'playback';
        }
      } catch (_) {}
      this.init();
      if (!this.ctx) return false;
      try {
        if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
          const p = this.ctx.resume();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
        if (!this._unlocked) {
          // 1-sample silent buffer unlock required by iOS Safari / standalone PWAs
          const silentBuf = this.ctx.createBuffer(1, 1, 22050);
          const src = this.ctx.createBufferSource();
          src.buffer = silentBuf;
          src.connect(this.ctx.destination);
          if (typeof src.start === 'function') src.start(0);
          this._unlocked = true;
        }
      } catch (_) {}
      return true;
    }

    ensureContext() {
      this.init();
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        const p = this.ctx.resume();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      return Boolean(this.ctx);
    }

    withRunningContext(fn) {
      if (this.muted || !this.ensureContext() || !this.ctx) return;
      const ctx = this.ctx;
      if (ctx.state === 'running') {
        try { fn(ctx); } catch (_) {}
        return;
      }
      try {
        const res = ctx.resume();
        if (res && typeof res.then === 'function') {
          res.then(() => {
            if (!this.muted && ctx.state === 'running') {
              try { fn(ctx); } catch (_) {}
            }
          }).catch(() => {});
        }
      } catch (_) {}
    }

    playClick(freq = 900) {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      });
    }

    playSuccessChime() {
      this.withRunningContext((ctx) => {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + (idx * 0.08);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0.001, noteTime);
          gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.36);
        });
      });
    }

    playFailBuzz() {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      });
    }

    playSpring(freq = 440) {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      });
    }

    setHum(freq = 60, volume = 0.05) {
      this.withRunningContext((ctx) => {
        if (!this.humOsc) {
          this.humOsc = ctx.createOscillator();
          this.humGain = ctx.createGain();
          this.humOsc.type = 'sine';
          this.humOsc.frequency.setValueAtTime(freq, ctx.currentTime);
          this.humGain.gain.setValueAtTime(0.001, ctx.currentTime);
          this.humGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
          this.humOsc.connect(this.humGain);
          this.humGain.connect(ctx.destination);
          this.humOsc.start();
        } else {
          this.humOsc.frequency.setValueAtTime(freq, ctx.currentTime);
          this.humGain.gain.setValueAtTime(volume, ctx.currentTime);
        }
      });
    }

    stopHum() {
      if (this.humOsc && this.humGain && this.ctx) {
        try {
          const now = this.ctx.currentTime;
          this.humGain.gain.linearRampToValueAtTime(0.001, now + 0.08);
          setTimeout(() => {
            if (this.humOsc) {
              this.humOsc.stop();
              this.humOsc.disconnect();
              this.humOsc = null;
              this.humGain = null;
            }
          }, 90);
        } catch (e) {
          this.humOsc = null;
          this.humGain = null;
        }
      }
    }

    playBoing(baseFreq = 220) {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.4, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.28);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.31);
      });
    }

    playSlideWhistle(startFreq = 280, endFreq = 840, duration = 0.35) {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.03);
        gain.gain.setValueAtTime(0.16, now + duration - 0.04);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
      });
    }

    playPop(freq = 620) {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.25, now + 0.04);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      });
    }

    playWhoosh() {
      this.withRunningContext((ctx) => {
        const bufferSize = Math.floor(ctx.sampleRate * 0.25);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3.0;
        const now = ctx.currentTime;
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.24);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.24);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);
      });
    }

    playBbcBeep() {
      this.withRunningContext((ctx) => {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, now);
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.setValueAtTime(0.08, now + 0.08);
        gain1.gain.linearRampToValueAtTime(0.0001, now + 0.09);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.095);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        const t2 = now + 0.095;
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(800, t2);
        gain2.gain.setValueAtTime(0.08, t2);
        gain2.gain.setValueAtTime(0.08, t2 + 0.12);
        gain2.gain.linearRampToValueAtTime(0.0001, t2 + 0.135);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.14);
      });
    }
  }

  /**
   * Speech Synthesis Helpers & Mobile TTS Gesture Priming
   */
  let _standaloneSpeakDebounceTimer = null;
  let _standaloneActiveUtterance = null;
  let _registeredAudioSynth = null;
  const _primedTargets = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

  function _getSpeechSynth() {
    if (typeof window === 'undefined') return null;
    try {
      if (
        window.top &&
        window.top !== window &&
        window.top.location &&
        window.top.location.origin === window.location.origin &&
        window.top.speechSynthesis
      ) {
        return window.top.speechSynthesis;
      }
    } catch (_) {}
    return window.speechSynthesis || null;
  }

  function _getSpeechUtteranceCtor() {
    if (typeof window === 'undefined') return null;
    try {
      if (
        window.top &&
        window.top !== window &&
        window.top.location &&
        window.top.location.origin === window.location.origin &&
        window.top.SpeechSynthesisUtterance
      ) {
        return window.top.SpeechSynthesisUtterance;
      }
    } catch (_) {}
    return window.SpeechSynthesisUtterance || null;
  }

  function cancelSpeech(engineArg) {
    const ctx = (engineArg && typeof engineArg === 'object')
      ? engineArg
      : (this && this !== global && typeof this === 'object' ? this : null);
    if (ctx) {
      if (ctx._speakDebounceTimer) {
        clearTimeout(ctx._speakDebounceTimer);
        ctx._speakDebounceTimer = null;
      }
    } else if (_standaloneSpeakDebounceTimer) {
      clearTimeout(_standaloneSpeakDebounceTimer);
      _standaloneSpeakDebounceTimer = null;
    }
    const synth = _getSpeechSynth();
    if (synth) {
      try {
        if (synth.speaking || synth.pending) synth.cancel();
      } catch (err) {}
    }
    if (ctx) {
      ctx._activeUtterance = null;
    } else {
      _standaloneActiveUtterance = null;
    }
  }

  function speakText(text, opts = {}) {
    const ctx = (this && this !== global && typeof this === 'object' && ('voiceEnabled' in this || 'currentLang' in this || 'notifyParent' in this))
      ? this
      : (opts && opts.engine && typeof opts.engine === 'object' ? opts.engine : null);

    const synth = _getSpeechSynth();
    const UtteranceCtor = _getSpeechUtteranceCtor();
    const spokenText = typeof text === 'string'
      ? text
      : (text && typeof text === 'object' ? String(text.localized || text.en || '') : '');
    const voiceEnabled = ctx ? ctx.voiceEnabled : true;
    if (!synth || !UtteranceCtor || !voiceEnabled || !spokenText) return;

    if (ctx) {
      if (ctx._speakDebounceTimer) {
        clearTimeout(ctx._speakDebounceTimer);
        ctx._speakDebounceTimer = null;
      }
    } else if (_standaloneSpeakDebounceTimer) {
      clearTimeout(_standaloneSpeakDebounceTimer);
      _standaloneSpeakDebounceTimer = null;
    }

    const performSpeak = () => {
      if (ctx && !ctx.voiceEnabled) return;
      const activeSynth = _getSpeechSynth();
      const ActiveUtterance = _getSpeechUtteranceCtor();
      if (!activeSynth || !ActiveUtterance) return;

      try {
        if (activeSynth.speaking || activeSynth.pending) {
          activeSynth.cancel();
        }
        if (activeSynth.paused && typeof activeSynth.resume === 'function') {
          activeSynth.resume();
        }

        const utterance = new ActiveUtterance(spokenText);
        const customRate = opts && typeof opts.rate === 'number' && Number.isFinite(opts.rate) ? opts.rate : null;
        const customPitch = opts && typeof opts.pitch === 'number' && Number.isFinite(opts.pitch) ? opts.pitch : null;
        utterance.rate = customRate !== null ? Math.max(0.1, Math.min(4.0, customRate)) : ((ctx && ctx.speechRate) || 0.95);
        if (customPitch !== null) {
          utterance.pitch = Math.max(0.0, Math.min(2.0, customPitch));
        }
        const isMuted = ctx ? Boolean(ctx.muted) : false;
        const vol = ctx && typeof ctx.volume === 'number' ? ctx.volume : 1.0;
        utterance.volume = isMuted ? 0.0 : Math.max(0, Math.min(1.0, vol));
        const langMap = {
          es: 'es-ES',
          fr: 'fr-FR',
          de: 'de-DE',
          pl: 'pl-PL',
          uk: 'uk-UA',
          ar: 'ar-SA',
          it: 'it-IT',
          pt: 'pt-PT',
          la: 'it-IT',
          en: 'en-GB'
        };
        const langCode = (opts && opts.lang) || (ctx && ctx.currentLang) || 'en';
        const targetLang = langMap[langCode] || 'en-GB';
        utterance.lang = targetLang;

        // Explicitly bind a matching installed voice when loaded (improves iOS Safari & Android PWA reliability)
        try {
          const voices = typeof activeSynth.getVoices === 'function' ? activeSynth.getVoices() : [];
          if (voices && voices.length) {
            const langPrefix = targetLang.slice(0, 2).toLowerCase();
            const matched =
              voices.find(v => v.lang && v.lang.toLowerCase() === targetLang.toLowerCase()) ||
              voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
            if (matched) utterance.voice = matched;
          }
        } catch (_) {}

        // Retain strong reference until completion so mobile WebKit/Chromium cannot GC the utterance mid-flight
        if (ctx) {
          ctx._activeUtterance = utterance;
        } else {
          _standaloneActiveUtterance = utterance;
        }
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            const word = spokenText.slice(e.charIndex).split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
            if (ctx && typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_BOUNDARY', word, fullText: spokenText, charIndex: e.charIndex });
            }
          }
        };
        utterance.onstart = () => {
          if (ctx) {
            ctx._speechStartedOnDevice = true;
            if (typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_START', text: spokenText });
            }
          }
        };
        utterance.onend = () => {
          if (ctx) {
            if (ctx._activeUtterance === utterance) ctx._activeUtterance = null;
            if (typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_END' });
            }
          } else if (_standaloneActiveUtterance === utterance) {
            _standaloneActiveUtterance = null;
          }
        };
        utterance.onerror = () => {
          if (ctx) {
            if (ctx._activeUtterance === utterance) ctx._activeUtterance = null;
            if (typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_END' });
            }
          } else if (_standaloneActiveUtterance === utterance) {
            _standaloneActiveUtterance = null;
          }
        };
        if (ctx && typeof ctx.notifyParent === 'function') {
          ctx.notifyParent({ type: 'SUBTITLE_UPDATE', text: spokenText });
        }
        activeSynth.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    };

    // On mobile PWAs (iOS Safari & Android Chrome), speechSynthesis.speak() MUST run synchronously inside
    // user activation (taps on words, Read Page, Sound Out, Play); delaying via setTimeout drops the gesture token.
    const hasUserActivation = Boolean(
      (opts && opts.immediate) ||
      (typeof navigator !== 'undefined' && navigator.userActivation && navigator.userActivation.isActive)
    );
    if (hasUserActivation) {
      performSpeak();
    } else {
      const timerId = setTimeout(() => {
        if (ctx) {
          ctx._speakDebounceTimer = null;
        } else {
          _standaloneSpeakDebounceTimer = null;
        }
        performSpeak();
      }, 80);
      if (ctx) {
        ctx._speakDebounceTimer = timerId;
      } else {
        _standaloneSpeakDebounceTimer = timerId;
      }
    }
  }

  function narrateText(text, language) {
    if (!text) return;
    const ctx = (this && this !== global && typeof this === 'object' && ('currentLang' in this || 'speechRate' in this || 'uiController' in this))
      ? this
      : null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = language || (ctx && ctx.currentLang) || 'en';
        utter.rate = (ctx && ctx.speechRate) || 0.95;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }
    if (ctx && ctx.uiController && typeof ctx.uiController.showToast === 'function') {
      ctx.uiController.showToast(`✨ Nano Co-Pilot: "${text}"`, 4500);
    }
  }

  function primeMobileAudioAndTts(audioSynth) {
    const synthTarget = audioSynth || _registeredAudioSynth;
    if (synthTarget && typeof synthTarget.unlock === 'function') {
      synthTarget.unlock();
    }
    const synth = _getSpeechSynth();
    if (synth) {
      try {
        if (typeof synth.getVoices === 'function') synth.getVoices();
        if (synth.paused && typeof synth.resume === 'function') synth.resume();
      } catch (_) {}
    }
  }

  function _attachGesturePrimingToWindow(win) {
    if (!win || typeof win.addEventListener !== 'function') return;
    if (_primedTargets) {
      if (_primedTargets.has(win)) return;
      _primedTargets.add(win);
    } else {
      if (win.__astMobileTtsPrimed) return;
      try { win.__astMobileTtsPrimed = true; } catch (_) {}
    }
    const unlockHandler = () => primeMobileAudioAndTts();
    try {
      win.addEventListener('pointerdown', unlockHandler, { passive: true, capture: true });
      win.addEventListener('touchstart', unlockHandler, { passive: true, capture: true });
      win.addEventListener('touchend', unlockHandler, { passive: true, capture: true });
      win.addEventListener('click', unlockHandler, { passive: true, capture: true });
      win.addEventListener('keydown', unlockHandler, { passive: true, capture: true });
    } catch (_) {}
  }

  function initMobileAudioTtsPriming(audioSynth) {
    if (audioSynth) _registeredAudioSynth = audioSynth;
    if (typeof window === 'undefined') return;
    _attachGesturePrimingToWindow(window);
    try {
      if (
        window.top &&
        window.top !== window &&
        window.top.location &&
        window.top.location.origin === window.location.origin
      ) {
        _attachGesturePrimingToWindow(window.top);
      }
    } catch (_) {}
  }

  // Prime mobile TTS & shared Web Audio on window and same-origin window.top upon module load
  initMobileAudioTtsPriming();

  const ASTAudioSpeech = {
    VectorProceduralAudioSynth,
    _getSpeechSynth,
    _getSpeechUtteranceCtor,
    speakText,
    cancelSpeech,
    narrateText,
    primeMobileAudioAndTts,
    initMobileAudioTtsPriming
  };

  global.ASTAudioSpeech = ASTAudioSpeech;
  global.VectorProceduralAudioSynth = VectorProceduralAudioSynth;
  global._getSpeechSynth = _getSpeechSynth;
  global._getSpeechUtteranceCtor = _getSpeechUtteranceCtor;
  global.speakText = speakText;
  global.cancelSpeech = cancelSpeech;
  global.narrateText = narrateText;
  global.primeMobileAudioAndTts = primeMobileAudioAndTts;
  global.initMobileAudioTtsPriming = initMobileAudioTtsPriming;

  if (typeof window !== 'undefined') {
    window.ASTAudioSpeech = ASTAudioSpeech;
    window.VectorProceduralAudioSynth = VectorProceduralAudioSynth;
    window._getSpeechSynth = _getSpeechSynth;
    window._getSpeechUtteranceCtor = _getSpeechUtteranceCtor;
    window.speakText = speakText;
    window.cancelSpeech = cancelSpeech;
    window.narrateText = narrateText;
    window.primeMobileAudioAndTts = primeMobileAudioAndTts;
    window.initMobileAudioTtsPriming = initMobileAudioTtsPriming;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
