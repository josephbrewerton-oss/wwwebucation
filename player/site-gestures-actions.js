/**
 * static/player/site-gestures-actions.js
 *
 * St Joseph's Educational Media Suite - Declarative Action Engine, Hold Loop & Sonification
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Zero-dependency UMD/IIFE peer module for ASTDirectGestureSubsystem.
 * Provides zero-JS declarative action execution (:action "step-slide", "goto-slide",
 * hypervisor-gated SITE_DIRECTIVE bridge), continuous press/hold RAF kinematics,
 * variable/bound resolution, procedural WebAudio sonification, and Android/PWA
 * touch-activation audio/TTS flushing.
 * Loaded strictly before site-gestures.js.
 */

(function (global) {
  'use strict';

  function _getGesturesProfile() {
    return global.ASTGesturesProfile || (typeof window !== 'undefined' ? window.ASTGesturesProfile : undefined);
  }

  function _resolveGlobalCustomActions(ctx) {
    if (ctx && ctx.constructor && ctx.constructor._customActions) {
      return ctx.constructor._customActions;
    }
    const ctor = global.ASTDirectGestureSubsystem || (typeof window !== 'undefined' ? window.ASTDirectGestureSubsystem : undefined);
    return ctor && ctor._customActions ? ctor._customActions : null;
  }

  function _resolveVarBounds(scene, g, varName) {
    const vMeta = scene && scene.vars && scene.vars[varName];
    const min = typeof g.min === 'number' ? g.min : (vMeta && typeof vMeta.min === 'number' ? vMeta.min : -Infinity);
    const max = typeof g.max === 'number' ? g.max : (vMeta && typeof vMeta.max === 'number' ? vMeta.max : Infinity);
    return { min, max };
  }

  function _resolveHoldReleaseValue(scene, g, holdVarName) {
    if (g && g.releaseVal !== undefined) return g.releaseVal;
    const vMeta = scene && scene.vars && scene.vars[holdVarName];
    if (vMeta && typeof vMeta === 'object' && vMeta.defaultValue !== undefined) {
      return vMeta.defaultValue;
    }
    const cur = this.engine && this.engine.vars ? this.engine.vars[holdVarName] : undefined;
    return typeof cur === 'boolean' ? false : 0;
  }

  function _writeEngineVar(varName, value) {
    if (!this.engine || !varName) return;
    if (typeof this.engine.setVar === 'function') {
      this.engine.setVar(varName, value);
    } else if (this.engine.vars) {
      this.engine.vars[varName] = value;
    }
  }

  function _speakGestureText(rawText, opts = {}) {
    if (!this._isControlEnabled('audio')) return;
    if (!rawText || !this.engine) return;
    const text = String(rawText).trim();
    if (!text) return;
    const speakOpts = Object.assign({ immediate: true }, opts || {});
    if (typeof this.engine.speak === 'function') {
      this.engine.speak(text, speakOpts);
    } else if (typeof this.engine.speakText === 'function') {
      this.engine.speakText(text, speakOpts);
    }
  }

  function _playNamedTone(eventName) {
    const _p = _getGesturesProfile();
    const defaultTones = _p && _p.DEFAULT_TONES ? _p.DEFAULT_TONES : {};
    const t = (this.playerProfile && this.playerProfile.tones && this.playerProfile.tones[eventName]) || defaultTones[eventName];
    if (t) {
      this.playAudioTone(t.freq, t.wave, t.duration, t.gain);
    }
  }

  function playAudioTone(frequency = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (
      !this._isControlEnabled('audio') ||
      !this.sonificationEnabled ||
      (this.engine && (this.engine.muted || this.engine.volume === 0))
    ) {
      return;
    }
    const volScale = this.engine && typeof this.engine.volume === 'number' && Number.isFinite(this.engine.volume)
      ? Math.max(0, Math.min(1.0, this.engine.volume))
      : 1.0;
    const scaledGain = Math.max(0.002, Math.min(0.6, (Number(gainVal) || 0.15) * volScale));
    const scheduleTone = (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(scaledGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    };
    try {
      if (this.engine && this.engine.audioSynth && typeof this.engine.audioSynth.withRunningContext === 'function') {
        this.engine.audioSynth.unlock();
        this.engine.audioSynth.withRunningContext(scheduleTone);
        return;
      }
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const shared = typeof window !== 'undefined' ? window.__astSharedAudioCtx : null;
        if (shared && shared.state !== 'closed') {
          this.audioCtx = shared;
        } else if (typeof window !== 'undefined') {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.audioCtx = new AudioContextClass();
            window.__astSharedAudioCtx = this.audioCtx;
          }
        }
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'running') {
        scheduleTone(this.audioCtx);
      } else if (this.audioCtx.state === 'suspended' || this.audioCtx.state === 'interrupted') {
        const ctx = this.audioCtx;
        ctx.resume().then(() => {
          if (ctx.state === 'running') scheduleTone(ctx);
        }).catch(() => {});
      }
    } catch {}
  }

  function _playToneSpec(toneSpec) {
    if (!toneSpec || typeof this.playAudioTone !== 'function') return;
    const freqs = String(toneSpec).split(',');
    for (let idx = 0; idx < freqs.length; idx++) {
      const hz = parseFloat(freqs[idx].trim());
      if (Number.isNaN(hz)) continue;
      // Play the first note synchronously inside the user-activation stack so
      // suspended mobile AudioContexts resume cleanly on Android Chrome / PWAs.
      if (idx === 0) {
        this.playAudioTone(hz, 'sine', 0.12, 0.2);
      } else {
        setTimeout(() => this.playAudioTone(hz, 'sine', 0.12, 0.2), idx * 70);
      }
    }
  }

  function _flushPendingTouchAudio(pointerId = null) {
    if (!this._pendingTouchAudio || this._pendingTouchAudio.size === 0) return;
    let queued = null;
    if (pointerId !== null && pointerId !== undefined && this._pendingTouchAudio.has(pointerId)) {
      queued = this._pendingTouchAudio.get(pointerId);
      this._pendingTouchAudio.delete(pointerId);
    } else if (pointerId === null || pointerId === undefined) {
      const firstKey = this._pendingTouchAudio.keys().next().value;
      if (firstKey !== undefined) {
        queued = this._pendingTouchAudio.get(firstKey);
        this._pendingTouchAudio.delete(firstKey);
      }
    }
    if (!queued || !queued.length) return;

    try {
      const primeFn = (typeof window !== 'undefined' && typeof window.primeMobileAudioAndTts === 'function')
        ? window.primeMobileAudioAndTts
        : (typeof global !== 'undefined' && typeof global.primeMobileAudioAndTts === 'function' ? global.primeMobileAudioAndTts : null);
      if (primeFn) {
        primeFn(this.engine && this.engine.audioSynth);
      } else if (this.engine && this.engine.audioSynth && typeof this.engine.audioSynth.unlock === 'function') {
        this.engine.audioSynth.unlock();
      }
    } catch (_) {}

    for (let i = 0; i < queued.length; i++) {
      const item = queued[i];
      if (!item) continue;
      if (item.toneSpec) {
        this._playToneSpec(item.toneSpec);
      } else if (item.namedTone) {
        this._playNamedTone(item.namedTone);
      }
      if (item.speakText) {
        this._speakGestureText(item.speakText, item.speechOpts || {});
      }
    }
  }

  function handleTouchEnd() {
    this._flushPendingTouchAudio(null);
  }

  function _readMatchedElementAttr(g, matchedEl) {
    if (matchedEl && g.attr && typeof matchedEl.hasAttribute === 'function' && matchedEl.hasAttribute(g.attr)) {
      const rawAttr = matchedEl.getAttribute(g.attr);
      return (rawAttr !== '' && !isNaN(Number(rawAttr))) ? Number(rawAttr) : rawAttr;
    }
    return undefined;
  }

  function _evalGestureExpr(exprText, matchedEl, attrVal, asReturnValue = true) {
    if (!exprText || !this.engine) return undefined;
    const body = asReturnValue ? `return (${exprText})` : exprText;
    const fn = new Function('vars', 'el', 'engine', 'computed', '_attr', body);
    return fn(
      this.engine.vars || {},
      matchedEl || null,
      this.engine,
      this.engine.computed || {},
      attrVal
    );
  }

  function _evalConditionExpr(condExpr, matchedEl, attrVal) {
    if (!condExpr) return true;
    try {
      return Boolean(this._evalGestureExpr(condExpr, matchedEl, attrVal, true));
    } catch (err) {
      console.warn('[SiteGestures] Condition :if error:', condExpr, err);
      return false;
    }
  }

  /**
   * Emits a typed, hypervisor-gated SITE_DIRECTIVE upward to the host site shell.
   * The host Hypervisor (nanoSiteManager.ts) enforces allowlists and route/preset validation.
   */
  function _emitSiteDirective(directive, scene) {
    if (!directive || typeof directive !== 'object' || !directive.action) return false;
    const payload = {
      type: 'SITE_DIRECTIVE',
      source: 'ast-cartridge',
      sceneId: (scene && scene.id) || (this.engine && this.engine.scene && this.engine.scene.id) || '',
      directive
    };
    try {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window && typeof window.parent.postMessage === 'function') {
        window.parent.postMessage(payload, '*');
      } else if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('stj:site-directive', { detail: payload }));
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Executes pure declarative AST actions natively in JS (zero inline JS in .ast files).
   * Returns true if the action was handled so legacy bare-:var fallbacks don't double-apply.
   */
  function _executeDeclarativeAction(g, matchedEl, attrVal, scene) {
    if (!g || !g.action || !this.engine) return false;
    const action = g.action;

    // 0. Check extensible Action Registry (instance or global)
    const globalCustom = _resolveGlobalCustomActions(this);
    const customHandler = (this._customActions && this._customActions.get(action))
      || (globalCustom && globalCustom.get(action));
    if (typeof customHandler === 'function') {
      return customHandler.call(this, g, scene, this, matchedEl, attrVal) !== false;
    }

    if (action === 'step-slide' || action === 'goto-slide') {
      const keyframeCount = scene && Array.isArray(scene.keyframes) && scene.keyframes.length >= 2
        ? scene.keyframes.length
        : 2;
      const parsedCount = Number(g.count);
      const count = Number.isFinite(parsedCount) && parsedCount >= 2 ? Math.round(parsedCount) : keyframeCount;
      const maxIdx = Math.max(1, count - 1);

      let targetIdx = 0;
      if (action === 'step-slide') {
        const delta = typeof g.delta === 'number' ? g.delta : 1;
        const rawVarCur = g.var && this.engine.vars ? Number(this.engine.vars[g.var]) : NaN;
        const curIdx = Number.isFinite(rawVarCur)
          ? Math.max(0, Math.min(maxIdx, Math.round(rawVarCur)))
          : Math.max(0, Math.min(maxIdx, Math.floor((this.engine.progress || 0) * count)));
        targetIdx = Math.max(0, Math.min(maxIdx, curIdx + delta));
      } else {
        const rawTarget = attrVal !== undefined ? attrVal : g.val;
        const numTarget = Number(rawTarget);
        targetIdx = Math.max(0, Math.min(maxIdx, Number.isFinite(numTarget) ? Math.round(numTarget) : 0));
      }

      this._syncingTimelineVar = true;
      try {
        this._lastSyncedTimelineVal = targetIdx;
        if (g.var) {
          this._writeEngineVar(g.var, targetIdx);
        }
        if (g.clearVar) {
          this._writeEngineVar(g.clearVar, '');
        }
        if (g.resetVar) {
          this._writeEngineVar(g.resetVar, g.resetVal !== undefined ? g.resetVal : '');
        }
        if (typeof this.engine.seek === 'function') {
          this.engine.seek(targetIdx / maxIdx);
        }
      } finally {
        this._syncingTimelineVar = false;
      }
      return true;
    }

    // Hypervisor-gated Site Directive Bridge (Cartridge -> Host Site Control Plane)
    if (action === 'navigate') {
      const route = String(g.route || attrVal || '').trim();
      if (!route) return false;
      return this._emitSiteDirective({ action: 'navigate', route }, scene);
    }

    if (action === 'load-cartridge') {
      const presetId = String(g.preset || g.presetId || attrVal || '').trim();
      if (!presetId) return false;
      return this._emitSiteDirective({
        action: 'load_cartridge',
        presetId,
        autoplay: Boolean(g.autoplay)
      }, scene);
    }

    if (action === 'toggle-bsl') {
      const directive = { action: 'toggle_bsl' };
      if (typeof g.enabled === 'boolean') directive.enabled = g.enabled;
      return this._emitSiteDirective(directive, scene);
    }

    if (action === 'toggle-sound') {
      const directive = { action: 'toggle_sound' };
      if (typeof g.enabled === 'boolean') directive.enabled = g.enabled;
      return this._emitSiteDirective(directive, scene);
    }

    if (action === 'open-tutor') {
      let prompt = typeof g.prompt === 'string' ? g.prompt : '';
      if (!prompt && g.speakVar && this.engine.vars && this.engine.vars[g.speakVar]) {
        prompt = String(this.engine.vars[g.speakVar]);
      }
      if (!prompt && attrVal !== undefined) {
        prompt = String(attrVal);
      }
      return this._emitSiteDirective({ action: 'open_tutor', prompt }, scene);
    }

    if (action === 'set-render-mode') {
      const mode = String(g.mode || g.renderMode || attrVal || '').trim();
      if (!mode) return false;
      return this._emitSiteDirective({ action: 'set_render_mode', mode }, scene);
    }

    if (action === 'site-directive') {
      const subAction = String(g.directive || '').trim().replace(/-/g, '_');
      if (!subAction) return false;
      const directive = { action: subAction };
      if (g.route) directive.route = String(g.route);
      if (g.preset || g.presetId) directive.presetId = String(g.preset || g.presetId);
      if (typeof g.enabled === 'boolean') directive.enabled = g.enabled;
      if (g.mode || g.renderMode) directive.mode = String(g.mode || g.renderMode);
      if (g.prompt) directive.prompt = String(g.prompt);
      if (g.selector) directive.selector = String(g.selector);
      return this._emitSiteDirective(directive, scene);
    }

    return false;
  }

  function _applyGesturePress(g, matchedEl, scene, audioQueue = null) {
    if (!this.engine || !this.engine.vars) return false;
    const attrVal = this._readMatchedElementAttr(g, matchedEl);
    const condExpr = g.ifExpr !== undefined ? g.ifExpr : g.if;
    if (condExpr && !this._evalConditionExpr(condExpr, matchedEl, attrVal)) {
      return false;
    }

    let changed = false;
    let exprConsumedBySetVar = false;

    // 1. Native JS execution of pure declarative AST actions (:action "step-slide", "goto-slide", etc.)
    const actionHandled = this._executeDeclarativeAction(g, matchedEl, attrVal, scene);
    if (actionHandled) {
      changed = true;
    }

    const toggleKey = g.toggleVar || g.toggle;
    const setKey = g.setVar || g.set || (!actionHandled && g.var && (g.val !== undefined || g.fromAttr !== undefined || g.valExpr !== undefined || g.expr !== undefined || attrVal !== undefined) ? g.var : null);
    const stepKey = g.stepVar || (typeof g.step === 'string' ? g.step : null) || (!actionHandled && !setKey && g.var && g.delta !== undefined ? g.var : null);
    const holdKey = g.holdVar;

    if (toggleKey) {
      this._writeEngineVar(toggleKey, !this.engine.vars[toggleKey]);
      changed = true;
    }
    if (setKey) {
      let val = g.val;
      if (g.fromAttr && matchedEl && typeof matchedEl.getAttribute === 'function') {
        const fromVal = matchedEl.getAttribute(g.fromAttr);
        if (fromVal !== null) val = fromVal;
      } else if (attrVal !== undefined) {
        val = attrVal;
      }
      if (g.valExpr) {
        try {
          val = this._evalGestureExpr(g.valExpr, matchedEl, attrVal, true);
        } catch (err) {
          console.warn('[SiteGestures] Gesture :val-expr error:', g.valExpr, err);
        }
      } else if (val === undefined && g.expr) {
        try {
          val = this._evalGestureExpr(g.expr, matchedEl, attrVal, true);
          exprConsumedBySetVar = true;
        } catch (err) {
          // Fall through to statement execution below if expr wasn't a pure expression
        }
      }
      if (val !== undefined) {
        this._writeEngineVar(setKey, val);
        changed = true;
      }
    }
    if (holdKey) {
      let entry = this._activeHoldVars.get(holdKey);
      if (!entry) {
        entry = {
          gestures: new Set(),
          releaseVal: this._resolveHoldReleaseValue(scene, g, holdKey)
        };
        this._activeHoldVars.set(holdKey, entry);
      }
      entry.gestures.add(g);
      this._writeEngineVar(holdKey, g.val !== undefined ? g.val : true);
      changed = true;
    }
    if (stepKey) {
      const cur = typeof this.engine.vars[stepKey] === 'number' ? this.engine.vars[stepKey] : 0;
      const delta = typeof g.delta === 'number' ? g.delta : 1;
      const { min, max } = this._resolveVarBounds(scene, g, stepKey);
      const next = Math.max(min, Math.min(max, cur + delta));
      this._writeEngineVar(stepKey, next);
      changed = true;
    }
    if (changed && typeof this.engine.updateComputedVars === 'function') {
      this.engine.updateComputedVars(this.engine.progress || 0);
    }
    if (g.expr && !exprConsumedBySetVar) {
      try {
        new Function('vars', 'el', 'engine', 'computed', '_attr', g.expr)(
          this.engine.vars,
          matchedEl,
          this.engine,
          this.engine.computed || {},
          attrVal
        );
        if (typeof this.engine.updateComputedVars === 'function') {
          this.engine.updateComputedVars(this.engine.progress || 0);
        }
        changed = true;
      } catch (err) {
        console.warn('[SiteGestures] Gesture expr error:', g.expr, err);
      }
    }

    let toneSpec = g.tone;
    if (g.toneExpr) {
      try {
        const evaluatedTone = this._evalGestureExpr(g.toneExpr, matchedEl, attrVal, true);
        if (evaluatedTone !== undefined && evaluatedTone !== null) {
          toneSpec = String(evaluatedTone);
        }
      } catch (err) {
        console.warn('[SiteGestures] Gesture :tone-expr error:', g.toneExpr, err);
      }
    }
    if (toneSpec) {
      if (Array.isArray(audioQueue)) {
        audioQueue.push({ toneSpec });
      } else {
        this._playToneSpec(toneSpec);
      }
    }

    let speakText = g.speak;
    if (!speakText && g.speakAttr && matchedEl && typeof matchedEl.getAttribute === 'function') {
      const attrSpeech = matchedEl.getAttribute(g.speakAttr);
      if (attrSpeech !== null && String(attrSpeech).trim() !== '') {
        speakText = String(attrSpeech);
      }
    }
    if (!speakText && g.speakVar) {
      const vSpeech = this.engine.vars[g.speakVar];
      if (vSpeech !== undefined && vSpeech !== null && String(vSpeech).trim() !== '') {
        speakText = String(vSpeech);
      }
    }
    if (!speakText && g.fallbackVar) {
      const fSpeech = this.engine.vars[g.fallbackVar];
      if (fSpeech !== undefined && fSpeech !== null && String(fSpeech).trim() !== '') {
        speakText = String(fSpeech);
      }
    }
    if (g.speakExpr) {
      try {
        const evaluatedSpeak = this._evalGestureExpr(g.speakExpr, matchedEl, attrVal, true);
        if (evaluatedSpeak !== undefined && evaluatedSpeak !== null) {
          speakText = String(evaluatedSpeak);
        }
      } catch (err) {
        console.warn('[SiteGestures] Gesture :speak-expr error:', g.speakExpr, err);
      }
    }
    if (speakText) {
      const speechOpts = {};
      if (g.speakRateVar && typeof this.engine.vars[g.speakRateVar] === 'number') {
        speechOpts.rate = this.engine.vars[g.speakRateVar];
      }
      if (typeof g.speakPitch === 'number') {
        speechOpts.pitch = g.speakPitch;
      }
      if (Array.isArray(audioQueue)) {
        audioQueue.push({ speakText, speechOpts });
      } else {
        this._speakGestureText(speakText, speechOpts);
      }
    }

    return changed;
  }

  function _applyContinuousGestureStep(g, scene, dtSec, matchedEl = null) {
    if (!this.engine || !this.engine.vars) return false;
    let changed = false;

    if (g.holdVar) {
      const holdVal = g.val !== undefined ? g.val : true;
      if (this.engine.vars[g.holdVar] !== holdVal) {
        this._writeEngineVar(g.holdVar, holdVal);
        changed = true;
      }
    }

    const stepKey = g.stepVar || (typeof g.step === 'string' ? g.step : null) || (!g.setVar && g.var && g.delta !== undefined ? g.var : null);
    if (stepKey) {
      const cur = typeof this.engine.vars[stepKey] === 'number' ? this.engine.vars[stepKey] : 0;
      const delta = typeof g.delta === 'number' ? g.delta : 1;
      const stepIncrement = typeof g.rate === 'number' ? (g.rate * dtSec) : (delta * dtSec * 3.5);
      const { min, max } = this._resolveVarBounds(scene, g, stepKey);
      const next = Math.max(min, Math.min(max, cur + stepIncrement));
      if (next !== cur) {
        this._writeEngineVar(stepKey, next);
        changed = true;
      }
    }

    if (g.expr && (g.type === 'holdable' || g.hold === true)) {
      try {
        new Function('vars', 'el', 'engine', 'dt', 'computed', g.expr)(
          this.engine.vars,
          matchedEl,
          this.engine,
          dtSec,
          this.engine.computed || {}
        );
        if (typeof this.engine.updateComputedVars === 'function') {
          this.engine.updateComputedVars(this.engine.progress || 0);
        }
        changed = true;
      } catch (err) {
        console.warn('[SiteGestures] Hold expr error:', g.expr, err);
      }
    }

    return changed;
  }

  function _releaseHoldForGesture(g) {
    if (!g || !g.holdVar) return false;
    const entry = this._activeHoldVars.get(g.holdVar);
    if (!entry) return false;
    entry.gestures.delete(g);
    if (entry.gestures.size === 0) {
      this._activeHoldVars.delete(g.holdVar);
      this._writeEngineVar(g.holdVar, entry.releaseVal);
      return true;
    }
    return false;
  }

  function _releasePointerEntry(pointerId) {
    const entry = this._heldPointerEntries.get(pointerId);
    if (!entry) return false;
    this._heldPointerEntries.delete(pointerId);
    let resetOccurred = false;
    for (let i = 0; i < entry.gestures.length; i++) {
      if (this._releaseHoldForGesture(entry.gestures[i])) {
        resetOccurred = true;
      }
    }
    if (this._heldKeys.size === 0 && this._heldPointerEntries.size === 0) {
      this._stopHoldLoop();
    }
    return resetOccurred;
  }

  function _releaseAllHeldInputs(resetHoldVars = true) {
    this._heldKeys.clear();
    this._heldKeyCodeMap.clear();
    this._heldPointerEntries.clear();

    let resetOccurred = false;
    if (resetHoldVars && this._activeHoldVars.size > 0) {
      for (const [varName, entry] of this._activeHoldVars.entries()) {
        this._writeEngineVar(varName, entry.releaseVal);
        resetOccurred = true;
      }
    }
    this._activeHoldVars.clear();
    this._stopHoldLoop();

    if (resetOccurred && this.engine && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0, 0, false);
    }
  }

  function _ensureHoldLoop() {
    if (this._holdRafId !== null) return;
    if (this._heldKeys.size === 0 && this._heldPointerEntries.size === 0) return;
    if (typeof requestAnimationFrame === 'undefined') return;
    this._holdLastTs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this._holdRafId = requestAnimationFrame(this._runHoldLoop);
  }

  function _stopHoldLoop() {
    if (this._holdRafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this._holdRafId);
    }
    this._holdRafId = null;
    this._holdLastTs = 0;
  }

  function _runHoldLoop(ts) {
    this._holdRafId = null;
    const now = ts || (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const dtSec = this._holdLastTs ? Math.min(0.05, Math.max(0.001, (now - this._holdLastTs) / 1000)) : (1 / 60);
    this._holdLastTs = now;

    if (this._heldKeys.size === 0 && this._heldPointerEntries.size === 0) {
      return;
    }

    const scene = this.engine && this.engine.scene;
    if (!scene || !this.engine || !this.engine.vars) {
      this._stopHoldLoop();
      return;
    }

    let changed = false;
    const gestures = this._getNormalizedSceneGestures(scene);

    if (this._heldKeys.size > 0) {
      for (let i = 0; i < gestures.length; i++) {
        const g = gestures[i];
        if (g.type !== 'key') continue;
        const keyMatched = this._heldKeys.has(g.code) ||
          this._heldKeys.has(g.key) ||
          (typeof g.key === 'string' && g.key.length === 1 && this._heldKeys.has(g.key.toLowerCase()));
        if (!keyMatched) continue;
        const isContinuous = Boolean(g.holdVar || ((g.stepVar || typeof g.step === 'string') && g.hold !== false));
        if (isContinuous && this._applyContinuousGestureStep(g, scene, dtSec, null)) {
          changed = true;
        }
      }
    }

    if (this._heldPointerEntries.size > 0) {
      for (const entry of this._heldPointerEntries.values()) {
        const heldDuration = now - entry.pressedAt;
        for (let i = 0; i < entry.gestures.length; i++) {
          const g = entry.gestures[i];
          const hasStep = Boolean(g.stepVar || typeof g.step === 'string');
          const wantsContinuous = Boolean(
            g.holdVar ||
            g.type === 'holdable' ||
            g.hold === true ||
            (hasStep && g.hold !== false && heldDuration >= 160)
          );
          const matchedEl = entry.matchedEls ? entry.matchedEls[i] : null;
          if (wantsContinuous && this._applyContinuousGestureStep(g, scene, dtSec, matchedEl)) {
            changed = true;
          }
        }
      }
    }

    if (changed && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0, 0, false);
    }

    if (this._heldKeys.size > 0 || this._heldPointerEntries.size > 0) {
      this._holdRafId = requestAnimationFrame(this._runHoldLoop);
    } else {
      this._stopHoldLoop();
    }
  }

  function _gestureMatchesKey(g, e) {
    if (!g) return false;
    if (g.code && e.code && g.code === e.code) return true;
    if (g.key && e.key) {
      if (g.key === e.key) return true;
      if (g.key.length === 1 && e.key.length === 1 && g.key.toLowerCase() === e.key.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  function _ensureInteractiveSimPlaying() {
    if (
      this.engine &&
      !this.engine.isPlaying &&
      this.engine.isContinuousSim &&
      Array.isArray(this.engine.activeVarBindings) &&
      this.engine.activeVarBindings.length > 0 &&
      typeof this.engine.play === 'function'
    ) {
      this.engine.play();
    }
  }

  const ASTGesturesActions = {
    _resolveVarBounds,
    _resolveHoldReleaseValue,
    _writeEngineVar,
    _speakGestureText,
    _playNamedTone,
    playAudioTone,
    _playToneSpec,
    _flushPendingTouchAudio,
    handleTouchEnd,
    _readMatchedElementAttr,
    _evalGestureExpr,
    _evalConditionExpr,
    _emitSiteDirective,
    _executeDeclarativeAction,
    _applyGesturePress,
    _applyContinuousGestureStep,
    _releaseHoldForGesture,
    _releasePointerEntry,
    _releaseAllHeldInputs,
    _ensureHoldLoop,
    _stopHoldLoop,
    _runHoldLoop,
    _gestureMatchesKey,
    _ensureInteractiveSimPlaying
  };

  global.ASTGesturesActions = ASTGesturesActions;
  if (typeof window !== 'undefined') window.ASTGesturesActions = ASTGesturesActions;
  if (typeof module !== 'undefined' && module.exports) module.exports = ASTGesturesActions;

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
