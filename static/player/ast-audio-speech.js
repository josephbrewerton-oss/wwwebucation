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
      this._pendingSounds = [];
    }

    _volScale() {
      const v = this.engine && typeof this.engine.volume === 'number' && Number.isFinite(this.engine.volume)
        ? this.engine.volume
        : 1.0;
      return Math.max(0, Math.min(1.0, v));
    }

    _scaledGain(baseGain, minGain = 0.001) {
      const scaled = (Number(baseGain) || 0.15) * this._volScale();
      return Math.max(minGain, Math.min(0.6, scaled));
    }

    _flushPendingSounds() {
      if (!this._pendingSounds || !this._pendingSounds.length) return;
      if (!this.ctx || this.ctx.state !== 'running' || this._isEffectivelyMuted()) return;
      const nowMs = Date.now();
      const queue = this._pendingSounds.splice(0, this._pendingSounds.length);
      for (let i = 0; i < queue.length; i++) {
        const entry = queue[i];
        if (!entry || entry.played || nowMs > entry.expiresAt) continue;
        entry.played = true;
        try { entry.fn(this.ctx); } catch (_) {}
      }
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

    _isLocalContext(ctx) {
      if (!ctx || typeof window === 'undefined') return true;
      return ctx === window.__astSharedAudioCtx;
    }

    _createLocalContext() {
      const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AudioContextClass) return null;
      const localCtx = new AudioContextClass();
      if (typeof window !== 'undefined') window.__astSharedAudioCtx = localCtx;
      return localCtx;
    }

    init() {
      if (this.ctx && this.ctx.state !== 'closed') return;
      try {
        // Prefer this frame's own AudioContext so taps inside the cartridge iframe
        // directly own and resume the context on Android Chrome / Android PWAs.
        if (typeof window !== 'undefined' && window.__astSharedAudioCtx && window.__astSharedAudioCtx.state !== 'closed') {
          this.ctx = window.__astSharedAudioCtx;
          return;
        }
        const host = this._getSharedHost();
        if (host && host !== window && host.__astSharedAudioCtx && host.__astSharedAudioCtx.state === 'running') {
          this.ctx = host.__astSharedAudioCtx;
          return;
        }
        const localCtx = this._createLocalContext();
        if (localCtx) {
          this.ctx = localCtx;
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

      // If we previously attached to a window.top context that is now suspended/interrupted
      // while the user is interacting inside this iframe, switch to an iframe-owned context.
      try {
        if (this.ctx.state !== 'running' && !this._isLocalContext(this.ctx)) {
          const localCtx = this._createLocalContext();
          if (localCtx) {
            this.ctx = localCtx;
            this._unlocked = false;
          }
        }
      } catch (_) {}

      try {
        const ctx = this.ctx;
        if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
          const p = ctx.resume();
          if (p && typeof p.then === 'function') {
            p.then(() => {
              if (ctx.state === 'running') {
                this._unlocked = true;
                this._flushPendingSounds();
              }
            }).catch(() => {});
          }
        }
        if (!this._unlocked) {
          // 1-sample silent buffer unlock required by iOS Safari / standalone PWAs.
          // Only mark _unlocked = true once ctx.state === 'running' so an early
          // touchstart/pointerdown (which lacks user activation on Android Chrome)
          // never prevents a valid touchend/pointerup/click from unlocking audio.
          const silentBuf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = silentBuf;
          src.connect(ctx.destination);
          if (typeof src.start === 'function') src.start(0);
          if (ctx.state === 'running') {
            this._unlocked = true;
          }
        }
        if (ctx.state === 'running') {
          this._flushPendingSounds();
        }
      } catch (_) {}
      return Boolean(this.ctx && this.ctx.state === 'running');
    }

    ensureContext() {
      this.init();
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        const ctx = this.ctx;
        const p = ctx.resume();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            if (ctx.state === 'running') {
              this._unlocked = true;
              this._flushPendingSounds();
            }
          }).catch(() => {});
        }
      }
      return Boolean(this.ctx);
    }

    _isEffectivelyMuted() {
      return Boolean(this.muted || (this.engine && (this.engine.muted || this.engine.volume === 0)));
    }

    withRunningContext(fn, opts = null) {
      if (this._isEffectivelyMuted() || !this.ensureContext() || !this.ctx) return;
      const ctx = this.ctx;
      if (ctx.state === 'running') {
        this._unlocked = true;
        try { fn(ctx); } catch (_) {}
        return;
      }
      const ttlMs = opts && typeof opts.ttlMs === 'number' ? opts.ttlMs : 1800;
      const entry = { fn, played: false, expiresAt: Date.now() + Math.max(250, ttlMs) };
      if (!this._pendingSounds) this._pendingSounds = [];
      if (this._pendingSounds.length >= 3) this._pendingSounds.shift();
      this._pendingSounds.push(entry);
      try {
        const res = ctx.resume();
        if (res && typeof res.then === 'function') {
          res.then(() => {
            if (!entry.played && !this._isEffectivelyMuted() && ctx.state === 'running') {
              this._unlocked = true;
              entry.played = true;
              try { fn(ctx); } catch (_) {}
              this._flushPendingSounds();
            }
          }).catch(() => {});
        }
      } catch (_) {}
    }

    playTone(freq = 440, duration = 0.12, type = 'sine', gainVal = 0.18, opts = null) {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        const safeDur = Math.max(0.02, Number(duration) || 0.12);
        const safeGain = this._scaledGain(Math.max(0.002, Math.min(0.5, Number(gainVal) || 0.18)), 0.002);
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(Number(freq) || 440, now);
        gain.gain.setValueAtTime(safeGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + safeDur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + safeDur + 0.01);
      }, opts);
    }

    playClick(freq = 900) {
      this.withRunningContext((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
        gain.gain.setValueAtTime(this._scaledGain(0.15, 0.002), now);
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
        const peak = this._scaledGain(0.18, 0.002);
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + (idx * 0.08);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0.001, noteTime);
          gain.gain.linearRampToValueAtTime(peak, noteTime + 0.02);
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
        gain.gain.setValueAtTime(this._scaledGain(0.12, 0.002), now);
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
        gain.gain.setValueAtTime(this._scaledGain(0.18, 0.002), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      });
    }

    setHum(freq = 60, volume = 0.05) {
      this.withRunningContext((ctx) => {
        const targetVol = this._scaledGain(volume, 0.001);
        if (!this.humOsc) {
          this.humOsc = ctx.createOscillator();
          this.humGain = ctx.createGain();
          this.humOsc.type = 'sine';
          this.humOsc.frequency.setValueAtTime(freq, ctx.currentTime);
          this.humGain.gain.setValueAtTime(0.001, ctx.currentTime);
          this.humGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.1);
          this.humOsc.connect(this.humGain);
          this.humGain.connect(ctx.destination);
          this.humOsc.start();
        } else {
          this.humOsc.frequency.setValueAtTime(freq, ctx.currentTime);
          this.humGain.gain.setValueAtTime(targetVol, ctx.currentTime);
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
        gain.gain.setValueAtTime(this._scaledGain(0.2, 0.002), now);
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
        const peak = this._scaledGain(0.16, 0.002);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(peak, now + 0.03);
        gain.gain.setValueAtTime(peak, now + duration - 0.04);
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
        gain.gain.setValueAtTime(this._scaledGain(0.22, 0.002), now);
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
        gain.gain.linearRampToValueAtTime(this._scaledGain(0.25, 0.002), now + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.24);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);
      });
    }

    playBbcBeep(opts = null) {
      this.withRunningContext((ctx) => {
        const now = ctx.currentTime;
        const peak = this._scaledGain(0.08, 0.002);
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, now);
        gain1.gain.setValueAtTime(peak, now);
        gain1.gain.setValueAtTime(peak, now + 0.08);
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
        gain2.gain.setValueAtTime(peak, t2);
        gain2.gain.setValueAtTime(peak, t2 + 0.12);
        gain2.gain.linearRampToValueAtTime(0.0001, t2 + 0.135);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.14);
      }, opts);
    }
  }

  /**
   * Speech Synthesis Helpers & Mobile TTS Gesture Priming
   */
  let _standaloneSpeakDebounceTimer = null;
  let _standaloneActiveUtterance = null;
  let _standaloneAndroidSpeakTimer = null;
  let _registeredAudioSynth = null;
  const _primedTargets = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

  function _isAndroidBrowser() {
    try {
      return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');
    } catch (_) {
      return false;
    }
  }

  function _needsPostCancelSpeakHandoff() {
    try {
      if (typeof navigator === 'undefined') return false;
      const ua = navigator.userAgent || '';
      if (/Android/i.test(ua)) return true;
      // Chromium Desktop (Chrome/Edge/Opera/Brave) shares the cancel()->speak() same-tick drop bug,
      // while Safari/iOS WebKit requires synchronous speak() inside the user gesture stack.
      const isAppleMobile = /iPad|iPhone|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
      if (isAppleMobile) return false;
      return /Chrome|Chromium|CriOS|Edg|OPR/i.test(ua);
    } catch (_) {
      return false;
    }
  }

  function _getSameOriginTopWindow() {
    if (typeof window === 'undefined') return null;
    try {
      if (
        window.top &&
        window.top !== window &&
        window.top.location &&
        window.top.location.origin === window.location.origin
      ) {
        return window.top;
      }
    } catch (_) {}
    return null;
  }

  function _getSpeechSynth() {
    if (typeof window === 'undefined') return null;
    // Prefer the current frame's own speechSynthesis so user activation inside
    // the cartridge iframe is honoured directly on Android Chrome / Android PWAs.
    if (window.speechSynthesis) {
      return window.speechSynthesis;
    }
    const topWin = _getSameOriginTopWindow();
    if (topWin && topWin.speechSynthesis) {
      return topWin.speechSynthesis;
    }
    return null;
  }

  function _getSpeechUtteranceCtor() {
    if (typeof window === 'undefined') return null;
    if (window.SpeechSynthesisUtterance) {
      return window.SpeechSynthesisUtterance;
    }
    const topWin = _getSameOriginTopWindow();
    if (topWin && topWin.SpeechSynthesisUtterance) {
      return topWin.SpeechSynthesisUtterance;
    }
    return null;
  }

  function _selectBestVoice(activeSynth, targetLang) {
    try {
      const voices = typeof activeSynth.getVoices === 'function' ? activeSynth.getVoices() : [];
      if (!voices || !voices.length) return null;
      const lowerTarget = String(targetLang || 'en-GB').toLowerCase();
      const langPrefix = lowerTarget.slice(0, 2);
      // Always prefer installed localService voices first so Android Chrome / offline PWAs
      // never stall or silently fail trying to fetch a network TTS voice.
      return (
        voices.find(v => v && v.localService === true && v.lang && v.lang.toLowerCase() === lowerTarget) ||
        voices.find(v => v && v.localService === true && v.lang && v.lang.toLowerCase().startsWith(langPrefix)) ||
        voices.find(v => v && v.lang && v.lang.toLowerCase() === lowerTarget) ||
        voices.find(v => v && v.lang && v.lang.toLowerCase().startsWith(langPrefix)) ||
        null
      );
    } catch (_) {
      return null;
    }
  }

  function _clearAndroidSpeakTimer(ctx) {
    if (ctx) {
      if (ctx._androidSpeakTimer) {
        clearTimeout(ctx._androidSpeakTimer);
        ctx._androidSpeakTimer = null;
      }
    } else if (_standaloneAndroidSpeakTimer) {
      clearTimeout(_standaloneAndroidSpeakTimer);
      _standaloneAndroidSpeakTimer = null;
    }
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
      if (ctx._speechStallTimer) {
        clearTimeout(ctx._speechStallTimer);
        ctx._speechStallTimer = null;
      }
    } else if (_standaloneSpeakDebounceTimer) {
      clearTimeout(_standaloneSpeakDebounceTimer);
      _standaloneSpeakDebounceTimer = null;
    }
    _clearAndroidSpeakTimer(ctx);
    const synth = _getSpeechSynth();
    if (synth) {
      try {
        if (synth.speaking || synth.pending) synth.cancel();
      } catch (err) {}
    }
    const topWin = _getSameOriginTopWindow();
    if (topWin && topWin.speechSynthesis && topWin.speechSynthesis !== synth) {
      try {
        if (topWin.speechSynthesis.speaking || topWin.speechSynthesis.pending) {
          topWin.speechSynthesis.cancel();
        }
      } catch (_) {}
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

    const isMuted = ctx ? Boolean(ctx.muted) : false;
    const vol = ctx && typeof ctx.volume === 'number' ? ctx.volume : 1.0;
    if (isMuted || vol <= 0) {
      if (ctx && typeof ctx.notifyParent === 'function') {
        ctx.notifyParent({ type: 'SUBTITLE_UPDATE', text: spokenText });
      }
      return;
    }

    if (ctx) {
      if (ctx._speakDebounceTimer) {
        clearTimeout(ctx._speakDebounceTimer);
        ctx._speakDebounceTimer = null;
      }
      if (ctx._speechStallTimer) {
        clearTimeout(ctx._speechStallTimer);
        ctx._speechStallTimer = null;
      }
    } else if (_standaloneSpeakDebounceTimer) {
      clearTimeout(_standaloneSpeakDebounceTimer);
      _standaloneSpeakDebounceTimer = null;
    }
    _clearAndroidSpeakTimer(ctx);

    const performSpeak = (skipExplicitVoice = false, useTopFallback = false) => {
      if (ctx && (!ctx.voiceEnabled || ctx.muted || ctx.volume === 0)) return;
      const topWin = useTopFallback ? _getSameOriginTopWindow() : null;
      const activeSynth = (useTopFallback && topWin && topWin.speechSynthesis) ? topWin.speechSynthesis : _getSpeechSynth();
      const ActiveUtterance = (useTopFallback && topWin && topWin.SpeechSynthesisUtterance) ? topWin.SpeechSynthesisUtterance : _getSpeechUtteranceCtor();
      if (!activeSynth || !ActiveUtterance) return;

      try {
        let didCancel = false;
        if (activeSynth.speaking || activeSynth.pending) {
          activeSynth.cancel();
          didCancel = true;
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
        utterance.volume = Math.max(0.01, Math.min(1.0, vol));
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

        let boundExplicitVoice = false;
        if (!skipExplicitVoice) {
          const matched = _selectBestVoice(activeSynth, targetLang);
          if (matched) {
            utterance.voice = matched;
            boundExplicitVoice = true;
          }
        }

        // Retain strong reference until completion so mobile WebKit/Chromium cannot GC the utterance mid-flight
        if (ctx) {
          ctx._activeUtterance = utterance;
        } else {
          _standaloneActiveUtterance = utterance;
        }
        let started = false;
        let settled = false;
        const clearStallTimer = () => {
          if (ctx && ctx._speechStallTimer) {
            clearTimeout(ctx._speechStallTimer);
            ctx._speechStallTimer = null;
          }
        };
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            const word = spokenText.slice(e.charIndex).split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
            if (ctx && typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_BOUNDARY', word, fullText: spokenText, charIndex: e.charIndex });
            }
          }
        };
        utterance.onstart = () => {
          started = true;
          clearStallTimer();
          if (ctx) {
            ctx._speechStartedOnDevice = true;
            ctx._pendingAutoSpeech = null;
            if (typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_START', text: spokenText });
            }
          }
        };
        utterance.onend = () => {
          settled = true;
          clearStallTimer();
          if (ctx) {
            if (ctx._activeUtterance === utterance) ctx._activeUtterance = null;
            if (typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_END' });
            }
          } else if (_standaloneActiveUtterance === utterance) {
            _standaloneActiveUtterance = null;
          }
        };
        utterance.onerror = (errEv) => {
          settled = true;
          clearStallTimer();
          const errCode = errEv && errEv.error ? String(errEv.error) : '';
          // If blocked by autoplay/user-activation inside the iframe while the parent host frame
          // owns the active click gesture (e.g. host Play toolbar click), retry once via same-origin top.
          if (!started && errCode === 'not-allowed') {
            const parentTop = !useTopFallback ? _getSameOriginTopWindow() : null;
            const parentHasActivation = Boolean(
              parentTop &&
              parentTop.speechSynthesis &&
              parentTop.speechSynthesis !== activeSynth &&
              ((opts && opts.allowTopFallback) || (parentTop.navigator && parentTop.navigator.userActivation && parentTop.navigator.userActivation.isActive))
            );
            if (parentHasActivation) {
              performSpeak(false, true);
              return;
            }
            if (ctx && opts && opts.isAutoLoad) {
              ctx._pendingAutoSpeech = { text: spokenText, opts: Object.assign({}, opts, { isAutoLoad: false, immediate: true }), queuedAt: Date.now() };
            }
          }
          // If an explicit voice failed before starting (common with Android/Desktop cloud voices offline),
          // retry once letting the OS pick its native default voice.
          if (!started && errCode !== 'not-allowed' && errCode !== 'canceled' && errCode !== 'interrupted' && boundExplicitVoice && !skipExplicitVoice) {
            performSpeak(true, useTopFallback);
            return;
          }
          if (ctx) {
            if (ctx._activeUtterance === utterance) ctx._activeUtterance = null;
            if (typeof ctx.notifyParent === 'function') {
              ctx.notifyParent({ type: 'SPEECH_END' });
            }
          } else if (_standaloneActiveUtterance === utterance) {
            _standaloneActiveUtterance = null;
          }
        };
        if (!skipExplicitVoice && !useTopFallback && ctx && typeof ctx.notifyParent === 'function') {
          ctx.notifyParent({ type: 'SUBTITLE_UPDATE', text: spokenText });
        }

        const startStallWatchdog = () => {
          if (!boundExplicitVoice || skipExplicitVoice || !ctx) return;
          ctx._speechStallTimer = setTimeout(() => {
            ctx._speechStallTimer = null;
            if (!started && !settled && ctx._activeUtterance === utterance && !activeSynth.speaking) {
              performSpeak(true, useTopFallback);
            }
          }, 750);
        };

        // On Android Chrome & Chromium Desktop, calling speak() synchronously in the same tick as cancel()
        // frequently causes System TTS to cancel the newly queued utterance.
        // A tiny 25ms handoff stays well inside Chromium's 5s transient user-activation window.
        if (didCancel && _needsPostCancelSpeakHandoff()) {
          const timerId = setTimeout(() => {
            if (ctx) {
              ctx._androidSpeakTimer = null;
              if (!ctx.voiceEnabled || ctx.muted || ctx._activeUtterance !== utterance) return;
            } else {
              _standaloneAndroidSpeakTimer = null;
              if (_standaloneActiveUtterance !== utterance) return;
            }
            try {
              if (activeSynth.paused && typeof activeSynth.resume === 'function') {
                activeSynth.resume();
              }
              activeSynth.speak(utterance);
              startStallWatchdog();
            } catch (_) {}
          }, 25);
          if (ctx) {
            ctx._androidSpeakTimer = timerId;
          } else {
            _standaloneAndroidSpeakTimer = timerId;
          }
        } else {
          activeSynth.speak(utterance);
          startStallWatchdog();
        }
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
      performSpeak(false, false);
    } else {
      const timerId = setTimeout(() => {
        if (ctx) {
          ctx._speakDebounceTimer = null;
        } else {
          _standaloneSpeakDebounceTimer = null;
        }
        performSpeak(false, false);
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
    speakText.call(ctx, text, { lang: language || (ctx && ctx.currentLang) || 'en', immediate: true, allowTopFallback: true });
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
    const events = ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'keydown'];
    try {
      for (let i = 0; i < events.length; i++) {
        win.addEventListener(events[i], unlockHandler, { passive: true, capture: true });
      }
      // Clean up parent-window listeners when this iframe unloads so detached closures never accumulate
      if (typeof window !== 'undefined' && win !== window && typeof window.addEventListener === 'function') {
        window.addEventListener('pagehide', () => {
          try {
            for (let i = 0; i < events.length; i++) {
              win.removeEventListener(events[i], unlockHandler, true);
            }
            if (_primedTargets) _primedTargets.delete(win);
          } catch (_) {}
        }, { once: true });
      }
    } catch (_) {}
  }

  function initMobileAudioTtsPriming(audioSynth) {
    if (audioSynth) _registeredAudioSynth = audioSynth;
    if (typeof window === 'undefined') return;
    _attachGesturePrimingToWindow(window);
    const topWin = _getSameOriginTopWindow();
    if (topWin) {
      _attachGesturePrimingToWindow(topWin);
    }
    // Pre-warm voices list early so Chrome Desktop / Android getVoices() is populated before first tap
    try {
      const synth = _getSpeechSynth();
      if (synth && typeof synth.getVoices === 'function') {
        synth.getVoices();
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
