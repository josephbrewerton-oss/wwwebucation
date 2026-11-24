/**
 * static/player/site-gestures-input.js
 *
 * St Joseph's Educational Media Suite - Keyboard, Switch, Stage Enhancement & Pointer Drag Input VM
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Zero-dependency UMD/IIFE peer module for ASTDirectGestureSubsystem.
 * Provides Priority 1/2/3 keyboard & switch navigation, declarative SVG stage interactivity
 * enhancement, screen-to-SVG projection, and pointer/trackball/generic/rotate/bind-input handlers.
 * Loaded strictly before site-gestures.js.
 */

(function (global) {
  'use strict';

  function _resolveGlobalCustomActions(ctx) {
    if (ctx && ctx.constructor && ctx.constructor._customActions) {
      return ctx.constructor._customActions;
    }
    const ctor = global.ASTDirectGestureSubsystem || (typeof window !== 'undefined' ? window.ASTDirectGestureSubsystem : undefined);
    return ctor && ctor._customActions ? ctor._customActions : null;
  }

  function _resolveGlobalCustomGestureSkills(ctx) {
    if (ctx && ctx.constructor && ctx.constructor._customGestureSkills) {
      return ctx.constructor._customGestureSkills;
    }
    const ctor = global.ASTDirectGestureSubsystem || (typeof window !== 'undefined' ? window.ASTDirectGestureSubsystem : undefined);
    return ctor && ctor._customGestureSkills ? ctor._customGestureSkills : null;
  }

  // =========================================================================
  // Priority 1, 2 & 3 Keyboard & Switch Navigation Handler
  // =========================================================================

  function _handleCheckpointModalKeys(e) {
    if (!this._isControlEnabled('quiz-keys')) return false;

    const modal = document.querySelector(
      '.interactive-card:not(.hidden), #interactive-modal:not(.hidden), [data-checkpoint-modal="true"]'
    );
    if (!modal || modal.offsetParent === null) return false;

    const keyLower = (e.key || '').toLowerCase();
    const optionMap = { '1': 0, 'a': 0, '2': 1, 'b': 1, '3': 2, 'c': 2, '4': 3, 'd': 3 };

    if (keyLower in optionMap) {
      const options = modal.querySelectorAll('.interactive-opt-btn, button[data-option], .checkpoint-option, .quiz-option');
      const targetBtn = options[optionMap[keyLower]];
      if (targetBtn && !targetBtn.disabled && targetBtn.offsetParent !== null) {
        e.preventDefault();
        targetBtn.click();
        this._playNamedTone('click');
        return true;
      }
    }

    if (e.code === 'Enter' || e.code === 'Space') {
      const confirmBtn = modal.querySelector(
        '#interactive-continue-btn, #btn-checkpoint-continue, #btn-checkpoint-close, [data-checkpoint-confirm], button.primary'
      );
      if (confirmBtn && !confirmBtn.disabled && confirmBtn.offsetParent !== null) {
        e.preventDefault();
        confirmBtn.click();
        this._playNamedTone('click');
        return true;
      }
    }

    return false;
  }

  function _executeUniversalKeyRule(rule, scene) {
    if (!rule || !this.engine) return false;
    const action = rule.action;

    // 0. Check extensible Action Registry (instance or global)
    const globalCustom = _resolveGlobalCustomActions(this);
    const customHandler = (this._customActions && this._customActions.get(action))
      || (globalCustom && globalCustom.get(action));
    if (typeof customHandler === 'function') {
      return customHandler.call(this, rule, scene, this) !== false;
    }

    if (action === 'toggle-play') {
      if (typeof this.engine.togglePlay === 'function') {
        this.engine.togglePlay();
        return true;
      }
      if (this.engine.isPlaying && typeof this.engine.pause === 'function') {
        this.engine.pause();
        return true;
      }
      if (!this.engine.isPlaying && typeof this.engine.play === 'function') {
        this.engine.play();
        return true;
      }
      return false;
    }

    if (action === 'toggle-pen') {
      if (this._isControlEnabled('whiteboard')) {
        this.togglePen();
        return true;
      }
      return false;
    }

    if (action === 'toggle-xray') {
      if (!this._isControlEnabled('xray')) return false;
      this.isXRayActive = !this.isXRayActive;
      const xrayBtn = document.getElementById('stage-hud-xray-btn');
      if (xrayBtn) {
        xrayBtn.style.background = this.isXRayActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)';
        xrayBtn.style.color = this.isXRayActive ? '#090d16' : '#ffffff';
      }
      if (!this.isXRayActive) this.hideXRayPopup();
      this.playAudioTone(this.isXRayActive ? 784 : 392, 'sine', 0.08);
      return true;
    }

    if (action === 'toggle-audio') {
      if (!this._isControlEnabled('audio')) return false;
      this.sonificationEnabled = !this.sonificationEnabled;
      const soundBtn = document.getElementById('stage-hud-sound-btn');
      if (soundBtn) {
        soundBtn.textContent = this.sonificationEnabled ? '🔊' : '🔇';
        soundBtn.style.opacity = this.sonificationEnabled ? '1.0' : '0.5';
      }
      if (this.sonificationEnabled) this.playAudioTone(523, 'sine', 0.05);
      return true;
    }

    if (action === 'reset-vars') {
      if (typeof this.engine.resetVars === 'function') {
        this.engine.resetVars();
        if (typeof this.engine.applyBindings === 'function') {
          this.engine.applyBindings(this.engine.progress || 0, 0, false);
        }
        this._playNamedTone('release');
        return true;
      }
      return false;
    }

    // Check standard DOM prev/next buttons first if present for step-primary-var
    if (action === 'step-primary-var') {
      const delta = typeof rule.delta === 'number' ? rule.delta : 1;
      const btnSelector = delta > 0 ? '#btn-next-page, #btn-next' : '#btn-prev-page, #btn-prev';
      const navBtn = document.querySelector(btnSelector);
      if (navBtn && !navBtn.disabled && navBtn.offsetParent !== null) {
        navBtn.click();
        if (typeof rule.tone === 'number') this.playAudioTone(rule.tone, 'triangle', 0.04, 0.12);
        return true;
      }
    }

    const primary = this._findPrimarySteppedVar(scene);
    if (!primary || !this.engine.vars) return false;

    const cur = typeof this.engine.vars[primary.name] === 'number'
      ? this.engine.vars[primary.name]
      : primary.min;
    let next = cur;

    if (action === 'step-primary-var') {
      const delta = typeof rule.delta === 'number' ? rule.delta : 1;
      next = Math.max(primary.min, Math.min(primary.max, cur + delta));
    } else if (action === 'set-primary-var') {
      const targetVal = typeof rule.val === 'number' ? rule.val : primary.min;
      if (targetVal < primary.min || targetVal > primary.max) return false;
      next = targetVal;
    } else if (action === 'jump-primary-min') {
      next = primary.min;
    } else if (action === 'jump-primary-max') {
      next = primary.max;
    } else {
      return false;
    }

    this._writeEngineVar(primary.name, next);
    if (typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0, 0, false);
    }
    if (typeof rule.tone === 'number') {
      this.playAudioTone(rule.tone, 'triangle', 0.04, 0.12);
    }
    return true;
  }

  function handleKeyDown(e) {
    if (
      e.target &&
      (e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' ||
        e.target.isContentEditable)
    ) {
      return;
    }

    // Priority 1: Checkpoint Modal Hotkeys
    if (this._handleCheckpointModalKeys(e)) {
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      return;
    }

    // Do not intercept browser/studio modifier combos (Ctrl+Z, Cmd+R, Ctrl+I, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    const scene = this.engine && this.engine.scene;
    if (!scene || !this.engine.vars) return;

    // When the pure-SVG AVM1 Micro-VM owns an SWF stage, yield keyboard input directly to ASTAVM1Runtime
    if ((this.engine._avm1Vm && this.engine._avm1Vm._mounted) || this.engine._avm1VmPending) {
      return;
    }

    // Priority 2: Cartridge Explicit (:key ...) Rules
    const gestures = this._getNormalizedSceneGestures(scene);
    const matchingKeys = gestures.filter(g => g.type === 'key' && this._gestureMatchesKey(g, e));

    if (matchingKeys.length > 0) {
      e.preventDefault();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }

      if (e.code) {
        this._heldKeys.add(e.code);
        if (e.key) this._heldKeyCodeMap.set(e.code, e.key);
      }
      if (e.key) {
        this._heldKeys.add(e.key);
        if (e.key.length === 1) this._heldKeys.add(e.key.toLowerCase());
      }

      let needsHoldLoop = false;
      for (let i = 0; i < matchingKeys.length; i++) {
        const g = matchingKeys[i];
        if (g.holdVar || ((g.stepVar || typeof g.step === 'string') && g.hold !== false)) {
          needsHoldLoop = true;
        }
      }

      this._ensureInteractiveSimPlaying();

      if (!e.repeat) {
        let changed = false;
        let hasCustomTone = false;
        for (let i = 0; i < matchingKeys.length; i++) {
          const g = matchingKeys[i];
          if (g.tone || g.toneExpr) hasCustomTone = true;
          if (this._applyGesturePress(g, null, scene)) {
            changed = true;
          }
        }
        if (changed && typeof this.engine.applyBindings === 'function') {
          this.engine.applyBindings(this.engine.progress || 0, 0, false);
        }
        if (!hasCustomTone && changed) {
          this._playNamedTone('key');
        }
      }

      if (needsHoldLoop) {
        this._ensureHoldLoop();
      }
      return;
    }

    // Priority 3: Universal Keys from player-gestures.ast (gated by active :controls switches)
    const universalMatch = this.playerProfile.universalKeys.find(rule => {
      if (rule.switch && !this._isControlEnabled(rule.switch)) return false;
      return this._gestureMatchesKey(rule, e);
    });

    if (universalMatch) {
      if (e.repeat) {
        e.preventDefault();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        return;
      }
      if (this._executeUniversalKeyRule(universalMatch, scene)) {
        e.preventDefault();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
      }
    }
  }

  function handleKeyUp(e) {
    if (e.code) {
      this._heldKeys.delete(e.code);
      const mappedKey = this._heldKeyCodeMap.get(e.code);
      if (mappedKey) {
        this._heldKeys.delete(mappedKey);
        this._heldKeys.delete(mappedKey.toLowerCase());
        this._heldKeys.delete(mappedKey.toUpperCase());
        this._heldKeyCodeMap.delete(e.code);
      }
    }
    if (e.key) {
      this._heldKeys.delete(e.key);
      this._heldKeys.delete(e.key.toLowerCase());
      this._heldKeys.delete(e.key.toUpperCase());
    }

    const scene = this.engine && this.engine.scene;
    if (scene) {
      const gestures = this._getNormalizedSceneGestures(scene);
      const matchingKeys = gestures.filter(g => g.type === 'key' && this._gestureMatchesKey(g, e));
      if (matchingKeys.length > 0 && typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      if (this._activeHoldVars.size > 0) {
        let resetOccurred = false;
        for (let i = 0; i < matchingKeys.length; i++) {
          if (this._releaseHoldForGesture(matchingKeys[i])) {
            resetOccurred = true;
          }
        }
        if (resetOccurred && typeof this.engine.applyBindings === 'function') {
          this.engine.applyBindings(this.engine.progress || 0, 0, false);
        }
      }
    }

    if (this._heldKeys.size === 0 && this._heldPointerEntries.size === 0) {
      this._stopHoldLoop();
    }
  }

  function handleWindowBlur() {
    _clearActiveHoverVars.call(this, false);
    _clearActivePressVars.call(this, false);
    this._releaseAllHeldInputs(true);
  }

  function _clearActivePressVars(apply = true) {
    if (!this._activePressVars || this._activePressVars.size === 0) return false;
    let changed = false;
    this._activePressVars.forEach((resetVal, varName) => {
      if (this.engine && this.engine.vars && this.engine.vars[varName] !== resetVal) {
        this._writeEngineVar(varName, resetVal);
        changed = true;
      }
    });
    this._activePressVars.clear();
    if (changed && apply && this.engine && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0, 0, false);
    }
    return changed;
  }

  function _clearActiveHoverVars(apply = true) {
    if (!this._activeHoverVars || this._activeHoverVars.size === 0) return false;
    let changed = false;
    this._activeHoverVars.forEach((leaveVal, varName) => {
      if (this.engine && this.engine.vars && this.engine.vars[varName] !== leaveVal) {
        this._writeEngineVar(varName, leaveVal);
        changed = true;
      }
    });
    this._activeHoverVars.clear();
    if (changed && apply && this.engine && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0, 0, false);
    }
    return changed;
  }

  function _updateHoverStates(targetEl, scene) {
    if (!this.engine || !this.engine.vars || !scene) return false;
    const gestures = this._getNormalizedSceneGestures(scene);
    if (!gestures || gestures.length === 0) return false;
    if (!this._activeHoverVars) this._activeHoverVars = new Map();

    // Collect currently hovered vars without allocating if no hoverable gestures exist
    let hasAnyHoverGesture = false;
    let matchedHoverMap = null;
    for (let i = 0; i < gestures.length; i++) {
      const g = gestures[i];
      const hv = g.type === 'hoverable' ? (g.hoverVar || g.var || g.setVar) : g.hoverVar;
      if (!hv || !g.target) continue;
      hasAnyHoverGesture = true;
      const hitEl = targetEl && typeof targetEl.closest === 'function' ? targetEl.closest(g.target) : null;
      if (hitEl) {
        if (!matchedHoverMap) matchedHoverMap = new Map();
        const enterVal = g.type === 'hoverable' && g.val !== undefined ? g.val : 1;
        const leaveVal = g.leaveVal !== undefined ? g.leaveVal : 0;
        matchedHoverMap.set(hv, { enterVal, leaveVal, tone: g.hoverTone || (g.type === 'hoverable' ? g.tone : null) });
      }
    }
    if (!hasAnyHoverGesture) return false;

    let changed = false;
    // Leave previously hovered vars that are no longer hovered
    this._activeHoverVars.forEach((leaveVal, varName) => {
      if (!matchedHoverMap || !matchedHoverMap.has(varName)) {
        if (this.engine.vars[varName] !== leaveVal) {
          this._writeEngineVar(varName, leaveVal);
          changed = true;
        }
        this._activeHoverVars.delete(varName);
      }
    });

    // Enter newly hovered vars
    if (matchedHoverMap) {
      matchedHoverMap.forEach((spec, varName) => {
        const wasHovered = this._activeHoverVars.has(varName);
        this._activeHoverVars.set(varName, spec.leaveVal);
        if (this.engine.vars[varName] !== spec.enterVal) {
          this._writeEngineVar(varName, spec.enterVal);
          changed = true;
        }
        if (!wasHovered && spec.tone && typeof this.playAudioTone === 'function') {
          const hz = parseFloat(String(spec.tone));
          if (!Number.isNaN(hz)) this.playAudioTone(hz, 'sine', 0.03, 0.08);
        }
      });
    }

    if (changed && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0, 0, false);
    }
    return changed;
  }

  function handlePointerLeave(e) {
    _clearActiveHoverVars.call(this, true);
    _clearActivePressVars.call(this, true);
    if (this._heldPointerEntries.size === 0) return;
    const pointerId = e && e.pointerId !== undefined ? e.pointerId : 'mouse';
    if (this._heldPointerEntries.has(pointerId)) {
      const didReset = this._releasePointerEntry(pointerId);
      if (didReset && this.engine && typeof this.engine.applyBindings === 'function') {
        this.engine.applyBindings(this.engine.progress || 0, 0, false);
      }
    } else {
      this._releaseAllHeldInputs(true);
    }
  }

  /**
   * Converts client screen coordinates into precise SVG coordinate space (0..800, 0..480)
   */
  function screenToSvg(clientX, clientY) {
    if (!this.stageSvg) return { x: 0, y: 0 };
    const pt = this.stageSvg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = this.stageSvg.getScreenCTM();
    if (!ctm) return { x: clientX, y: clientY };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }

  /**
   * Compiles declarative scene gesture bindings onto SVG stage nodes
   */
  function enhanceSceneInteractivity() {
    if (!this.stageSvg) return;

    this.restoreInkFromSession();
    this.setupSimParametersHud();

    const scene = this.engine && this.engine.scene;
    const gestures = this._getNormalizedSceneGestures(scene);
    const scrubAllowed = this._isControlEnabled('scrub');
    const globalSkills = _resolveGlobalCustomGestureSkills(this);

    gestures.forEach(g => {
      if (!g.target) return;
      const matchedList = [];
      if (this.stageSvg.matches && this.stageSvg.matches(g.target)) {
        matchedList.push(this.stageSvg);
      }
      this.stageSvg.querySelectorAll(g.target).forEach(node => matchedList.push(node));

      matchedList.forEach(el => {
        const isHiddenInit =
          (typeof el.getAttribute === 'function' && (el.getAttribute('visibility') === 'hidden' || el.getAttribute('pointer-events') === 'none' || el.getAttribute('display') === 'none')) ||
          (el.style && (el.style.visibility === 'hidden' || el.style.pointerEvents === 'none' || el.style.display === 'none'));
        if (!isHiddenInit) {
          el.style.pointerEvents = 'auto';
        }
        el.style.touchAction = 'none';
        if (el !== this.stageSvg && g.type !== 'trackball' && g.axis !== 'trackball' && !isHiddenInit) {
          el.querySelectorAll('*').forEach(child => {
            if (!child || !child.style) return;
            const childHidden = typeof child.getAttribute === 'function' && (child.getAttribute('visibility') === 'hidden' || child.getAttribute('pointer-events') === 'none');
            if (!childHidden) child.style.pointerEvents = 'auto';
          });
        }

        const customSkill = (this._customGestureSkills && this._customGestureSkills.get(g.type))
          || (globalSkills && globalSkills.get(g.type));
        if (customSkill && typeof customSkill.enhance === 'function') {
          customSkill.enhance.call(this, el, g, scene, this);
        } else if (g.type === 'clickable' || g.type === 'holdable' || g.type === 'hoverable') {
          el.style.cursor = 'pointer';
          if (g.type === 'hoverable' || g.hoverVar) {
            el.setAttribute('data-declarative-hoverable', 'true');
          }
          if (g.type === 'holdable') {
            el.setAttribute('data-declarative-holdable', 'true');
          } else if (g.type === 'clickable') {
            el.setAttribute('data-declarative-clickable', 'true');
          }
        } else if (g.type === 'trackball' || g.axis === 'trackball') {
          if (el !== this.stageSvg) el.style.cursor = scrubAllowed ? 'grab' : 'default';
          el.setAttribute('data-declarative-trackball', 'true');
          if (g.yawVar) el.setAttribute('data-yaw-var', g.yawVar);
          if (g.pitchVar) el.setAttribute('data-pitch-var', g.pitchVar);
          el.setAttribute('data-pitch-min', String(g.pitchMin !== undefined ? g.pitchMin : -65));
          el.setAttribute('data-pitch-max', String(g.pitchMax !== undefined ? g.pitchMax : 65));
        } else if (g.type === 'rotatable' || g.type === 'rotate' || g.action === 'rotate' || g.axis === 'rotate' || g.axis === 'angular') {
          el.style.cursor = scrubAllowed ? 'grab' : 'default';
          el.setAttribute('data-draggable', 'rotate');
          el.setAttribute('data-gesture-cx', String(g.cx !== undefined ? g.cx : 400));
          el.setAttribute('data-gesture-cy', String(g.cy !== undefined ? g.cy : 240));
          if (g.var) el.setAttribute('data-gesture-var', g.var);
        } else {
          el.style.cursor = !scrubAllowed ? 'default' : (g.axis === 'y' ? 'ns-resize' : (g.axis === 'x' ? 'ew-resize' : 'grab'));
          el.setAttribute('data-draggable', 'generic');
          el.setAttribute('data-gesture-axis', g.axis || 'xy');
          if (g.minX !== undefined) el.setAttribute('data-gesture-min-x', String(g.minX));
          if (g.maxX !== undefined) el.setAttribute('data-gesture-max-x', String(g.maxX));
          if (g.minY !== undefined) el.setAttribute('data-gesture-min-y', String(g.minY));
          if (g.maxY !== undefined) el.setAttribute('data-gesture-max-y', String(g.maxY));
          if (typeof g.step === 'number') el.setAttribute('data-gesture-step', String(g.step));
          if (g.invert === true) el.setAttribute('data-gesture-invert', 'true');
          if (g.relative === true) el.setAttribute('data-gesture-relative', 'true');
          if (g.seek === true) el.setAttribute('data-gesture-seek', 'true');
          if (g.tone) el.setAttribute('data-gesture-tone', String(g.tone));
          if (g.var) el.setAttribute('data-gesture-var', g.var);
          if (g.varX) el.setAttribute('data-gesture-var-x', g.varX);
          if (g.varY) el.setAttribute('data-gesture-var-y', g.varY);
        }
      });
    });
  }

  /**
   * Primary PointerDown Handler
   */
  function handlePointerDown(e) {
    if (this.engine && this.engine.isAiDemonstrating) {
      this.engine.preemptAiDemonstration('USER_CANVAS_TOUCH');
    }

    if (e.target.closest('#stage-glass-hud-ui') || e.target.closest('.interactive-card')) {
      return;
    }

    if (this.stageSvg && typeof this.stageSvg.focus === 'function') {
      try { this.stageSvg.focus({ preventScroll: true }); } catch {
        try { this.stageSvg.focus(); } catch {}
      }
    }
    if (typeof window !== 'undefined' && typeof window.focus === 'function') {
      try { window.focus(); } catch {}
    }

    const svgPt = this.screenToSvg(e.clientX, e.clientY);

    // A. Whiteboard Pen Mode (only if :whiteboard switch is :on)
    if (this.isPenActive && this._isControlEnabled('whiteboard')) {
      if (this.currentTool === 'eraser') {
        e.preventDefault();
        this.eraseStrokeAt(svgPt);
        return;
      }
      if (!(this.stylusOnlyMode && e.pointerType !== 'pen')) {
        e.preventDefault();
        this.isDrawing = true;
        this.startInkStroke(svgPt);
        return;
      }
    }

    // When the pure-SVG AVM1 Micro-VM owns an SWF stage, yield non-whiteboard pointer input directly to AVM1Button / MovieClip listeners
    if (this.engine && ((this.engine._avm1Vm && this.engine._avm1Vm._mounted) || this.engine._avm1VmPending)) {
      return;
    }

    const scene = this.engine && this.engine.scene;
    const gestures = this._getNormalizedSceneGestures(scene);
    const globalSkills = _resolveGlobalCustomGestureSkills(this);

    const isNodeBlocked = (node) => {
      let cur = node;
      while (cur && cur !== this.stageSvg) {
        if (typeof cur.getAttribute === 'function') {
          if (cur.getAttribute('visibility') === 'hidden' || cur.getAttribute('pointer-events') === 'none' || cur.getAttribute('display') === 'none') {
            return true;
          }
        }
        if (cur.style) {
          if (cur.style.visibility === 'hidden' || cur.style.pointerEvents === 'none' || cur.style.display === 'none') {
            return true;
          }
        }
        cur = cur.parentNode;
      }
      return false;
    };

    // B0. Custom Registered Gesture Skills
    for (let i = 0; i < gestures.length; i++) {
      const g = gestures[i];
      const customSkill = (this._customGestureSkills && this._customGestureSkills.get(g.type))
        || (globalSkills && globalSkills.get(g.type));
      if (customSkill && typeof customSkill.onPointerDown === 'function' && g.target) {
        const hitEl = e.target.closest(g.target);
        if (hitEl && !isNodeBlocked(hitEl) && customSkill.onPointerDown.call(this, e, g, hitEl, svgPt, scene, this) === true) {
          return;
        }
      }
    }

    const pedNode = (this.isXRayActive && this._isControlEnabled('xray'))
      ? e.target.closest('[data-pedagogical]')
      : null;

    // B1. Declarative :clickable / :holdable tuples
    const matchedPointerGestures = [];
    const matchedEls = [];
    for (let i = 0; i < gestures.length; i++) {
      const g = gestures[i];
      if ((g.type !== 'clickable' && g.type !== 'holdable') || !g.target) continue;
      const hitEl = e.target.closest(g.target);
      if (!hitEl || isNodeBlocked(hitEl)) continue;
      matchedPointerGestures.push(g);
      matchedEls.push(hitEl);
    }

    if (matchedPointerGestures.length > 0) {
      let needsHoldLoop = false;
      let hasCustomTone = false;
      for (let i = 0; i < matchedPointerGestures.length; i++) {
        const g = matchedPointerGestures[i];
        if (g.tone || g.toneExpr) hasCustomTone = true;
        if (g.type === 'holdable' || g.hold === true || g.holdVar || ((g.stepVar || typeof g.step === 'string') && g.hold !== false)) {
          needsHoldLoop = true;
        }
      }

      const isTouchPointer = e && e.pointerType === 'touch';
      // On Android Chrome / PWAs, touch pointerdown does NOT grant transient user activation
      // (Chromium grants activation on pointerup/touchend/click). Defer audio & TTS for touch
      // taps until pointerup/touchend while applying visual/var updates immediately, and avoid
      // e.preventDefault() on pure non-holdable touch taps (touch-action: none already prevents scroll).
      if (!isTouchPointer || needsHoldLoop) {
        e.preventDefault();
      }
      this._ensureInteractiveSimPlaying();

      const deferTouchAudio = isTouchPointer && !needsHoldLoop;
      const pendingAudio = deferTouchAudio ? [] : null;
      for (let i = 0; i < matchedPointerGestures.length; i++) {
        const g = matchedPointerGestures[i];
        if (g.pressVar && this.engine && this.engine.vars) {
          if (!this._activePressVars) this._activePressVars = new Map();
          this._activePressVars.set(g.pressVar, 0);
          this._writeEngineVar(g.pressVar, 1);
        }
        this._applyGesturePress(g, matchedEls[i], scene, pendingAudio);
      }

      if (needsHoldLoop) {
        const pointerId = e.pointerId !== undefined ? e.pointerId : 'mouse';
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this._heldPointerEntries.set(pointerId, {
          gestures: matchedPointerGestures,
          matchedEls,
          pressedAt: now
        });
        if (e.pointerId !== undefined && this.stageSvg && typeof this.stageSvg.setPointerCapture === 'function') {
          try { this.stageSvg.setPointerCapture(e.pointerId); } catch {}
        }
        this._ensureHoldLoop();
      }

      if (this.engine) {
        if (typeof this.engine.applyBindings === 'function') {
          this.engine.applyBindings(this.engine.progress || 0);
        } else if (typeof this.engine.render === 'function') {
          this.engine.render();
        }
      }
      if (!hasCustomTone) {
        if (pendingAudio) {
          pendingAudio.push({ namedTone: 'click' });
        } else {
          this._playNamedTone('click');
        }
      }
      if (pendingAudio && pendingAudio.length > 0) {
        const pointerId = e.pointerId !== undefined ? e.pointerId : 'touch';
        this._pendingTouchAudio.set(pointerId, pendingAudio);
      }
      if (pedNode) {
        this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y, pedNode);
      }
      this.createTouchRipple(svgPt.x, svgPt.y);
      return;
    }

    // B2. Drag / Scrubbing Targets (gated by :scrub switch)
    if (this._isControlEnabled('scrub')) {
      const activeTrackball = gestures.find(g => {
        if (g.type !== 'trackball' || !g.target) return false;
        if (pedNode) return false;
        const tbEl = e.target.closest(g.target);
        if (!tbEl) return false;
        const childControl = e.target.closest('[data-declarative-clickable], [data-declarative-holdable], [data-draggable], [data-interactive], [data-bind-input], .ast-hotspot');
        if (childControl && childControl !== tbEl && tbEl.contains(childControl)) {
          return false;
        }
        return true;
      });

      if (activeTrackball) {
        e.preventDefault();
        this.isDragging = true;
        this.dragMode = 'trackball';
        this.dragTarget = e.target.closest(activeTrackball.target);
        this.dragStart = { x: e.clientX, y: e.clientY };
        const hasVars = Boolean(this.engine && this.engine.vars);
        this.trackballYawVar = activeTrackball.yawVar || activeTrackball['yaw-var'] || null;
        this.trackballPitchVar = activeTrackball.pitchVar || activeTrackball['pitch-var'] || null;
        this.trackballPitchMin = typeof activeTrackball.pitchMin === 'number' ? activeTrackball.pitchMin : -65;
        this.trackballPitchMax = typeof activeTrackball.pitchMax === 'number' ? activeTrackball.pitchMax : 65;
        this.trackballStartYaw = (this.trackballYawVar && hasVars && typeof this.engine.vars[this.trackballYawVar] === 'number')
          ? this.engine.vars[this.trackballYawVar] : 0;
        this.trackballStartPitch = (this.trackballPitchVar && hasVars && typeof this.engine.vars[this.trackballPitchVar] === 'number')
          ? this.engine.vars[this.trackballPitchVar] : 32;
        this.trackballStartCamYaw = (this.engine && this.engine.cameraOrbit) ? (Number(this.engine.cameraOrbit.yawOffset) || 0) : 0;
        this.trackballStartCamPitch = (this.engine && this.engine.cameraOrbit) ? (Number(this.engine.cameraOrbit.pitchOffset) || 0) : 0;
        if (hasVars && 'autoSpin' in this.engine.vars) {
          if (typeof this.engine.setVar === 'function') this.engine.setVar('autoSpin', false);
          else this.engine.vars.autoSpin = false;
        }
        if (e.pointerId !== undefined && this.stageSvg && typeof this.stageSvg.setPointerCapture === 'function') {
          try { this.stageSvg.setPointerCapture(e.pointerId); } catch {}
        }
        if (this.dragTarget && this.dragTarget !== this.stageSvg) {
          this.dragTarget.style.cursor = 'grabbing';
        }
        this.createTouchRipple(svgPt.x, svgPt.y);
        return;
      }

      const target = e.target.closest('[data-draggable], [data-bind-input]');
      if (target) {
        e.preventDefault();
        try {
          this.stageSvg.setPointerCapture(e.pointerId);
        } catch {}

        this.isDragging = true;
        this.dragTarget = target;
        this.dragStart = { x: svgPt.x, y: svgPt.y };

        if (
          target.hasAttribute('data-bind-input') ||
          (this.engine && this.engine.activeBindInputs && this.engine.activeBindInputs.some(b => b.node === target || b.target === '#' + target.id || (target.id && b.target === target.id)))
        ) {
          this.dragMode = 'bind-input';
          target.style.cursor = 'grabbing';
          this._playNamedTone('grab');
        } else if (target.getAttribute('data-draggable') === 'generic' || target.closest('[data-draggable="generic"]')) {
          const genTarget = target.getAttribute('data-draggable') === 'generic' ? target : target.closest('[data-draggable="generic"]');
          this.dragTarget = genTarget;
          this.dragMode = 'generic';
          genTarget.style.cursor = 'grabbing';
          const isContinuousScene = Boolean(this.engine && (this.engine.isContinuousSim || (this.engine.scene && (this.engine.scene.continuous || this.engine.scene.isContinuous || this.engine.scene.type === 'Sim'))));
          if (this.engine && !isContinuousScene && this.engine.isPlaying) {
            this._wasPlayingBeforeDrag = true;
            this.engine.pause();
          }
          let initX = 0;
          let initY = 0;
          const tr = genTarget.getAttribute('transform') || '';
          const trM = /translate\(\s*([\d.-]+)(?:[\s,]+([\d.-]+))?\s*\)/i.exec(tr);
          const initTx = trM ? parseFloat(trM[1]) : 0;
          const initTy = (trM && trM[2]) ? parseFloat(trM[2]) : 0;
          try {
            const bbox = genTarget.getBBox();
            initX = bbox.x;
            initY = bbox.y;
          } catch {
            initX = parseFloat(genTarget.getAttribute('x') || genTarget.getAttribute('cx') || '0');
            initY = parseFloat(genTarget.getAttribute('y') || genTarget.getAttribute('cy') || '0');
          }
          const gVarName = genTarget.getAttribute('data-gesture-var');
          const initVarVal = (gVarName && this.engine && this.engine.vars && typeof this.engine.vars[gVarName] === 'number')
            ? this.engine.vars[gVarName]
            : undefined;
          this.targetInitial = {
            transform: tr,
            initTx,
            initTy,
            x: initX,
            y: initY,
            initVarVal
          };
          this._playNamedTone('grab');
        } else if (target.getAttribute('data-draggable') === 'rotate' || target.closest('[data-draggable="rotate"]')) {
          const rotTarget = target.getAttribute('data-draggable') === 'rotate' ? target : target.closest('[data-draggable="rotate"]');
          this.dragTarget = rotTarget;
          this.dragMode = 'rotate';
          rotTarget.style.cursor = 'grabbing';
          this._playNamedTone('grab');
        }

        if (pedNode) {
          this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y, pedNode);
        }
        this.createTouchRipple(svgPt.x, svgPt.y);
        return;
      }
    }

    // C. Pedagogical X-Ray Tap Inspection (gated by :xray switch)
    if (pedNode) {
      this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y, pedNode);
    }
  }

  function handlePointerMove(e) {
    const rawEvents = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : [e];
    const eventsToProcess = (rawEvents && rawEvents.length > 0) ? rawEvents : [e];

    if (this.isDrawing && this.currentStroke) {
      e.preventDefault();
      for (let i = 0; i < eventsToProcess.length; i++) {
        const subEv = eventsToProcess[i];
        const svgPt = this.screenToSvg(subEv.clientX, subEv.clientY);
        this.continueInkStroke(svgPt);
      }
      return;
    }

    if (this.isPenActive && this._isControlEnabled('whiteboard') && this.currentTool === 'eraser' && (e.buttons > 0 || (e.pressure && e.pressure > 0))) {
      e.preventDefault();
      for (let i = 0; i < eventsToProcess.length; i++) {
        const subEv = eventsToProcess[i];
        const svgPt = this.screenToSvg(subEv.clientX, subEv.clientY);
        this.eraseStrokeAt(svgPt);
      }
      return;
    }

    const latestEv = eventsToProcess[eventsToProcess.length - 1];
    const svgPt = this.screenToSvg(latestEv.clientX, latestEv.clientY);

    if (this.isDragging && this.dragTarget) {
      e.preventDefault();

      if (this.dragMode === 'bind-input') {
        this.handleBindInputDrag(this.dragTarget, svgPt);
      } else if (this.dragMode === 'generic') {
        this.handleGenericDrag(this.dragTarget, svgPt);
      } else if (this.dragMode === 'rotate') {
        this.handleRotateDrag(this.dragTarget, svgPt);
      } else if (this.dragMode === 'trackball') {
        this.handleTrackballDrag(e);
      }
    } else {
      if (this.engine && this.engine.scene) {
        _updateHoverStates.call(this, e.target, this.engine.scene);
      }
      if (this.isXRayActive && this._isControlEnabled('xray')) {
        const pedNode = e.target && typeof e.target.closest === 'function' ? e.target.closest('[data-pedagogical]') : null;
        if (pedNode) {
          this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y, pedNode);
        } else {
          this.hideXRayPopup();
        }
      }
    }

    if (this.engine && typeof this.engine.updateCursorRay === 'function' && !this.isDrawing && !this.isDragging) {
      const now = performance.now();
      if (!this._lastRayCastTime || (now - this._lastRayCastTime > 120)) {
        this._lastRayCastTime = now;
        this.engine.updateCursorRay(svgPt.x, svgPt.y);
      }
    }
  }

  function handlePointerUp(e) {
    const pointerId = e && e.pointerId !== undefined ? e.pointerId : 'mouse';
    this._flushPendingTouchAudio(pointerId);
    const didResetPress = _clearActivePressVars.call(this, false);
    const didResetHold = this._releasePointerEntry(pointerId);
    if ((didResetHold || didResetPress) && this.engine && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0, 0, false);
    }
    if (e && e.pointerId !== undefined && this.stageSvg && typeof this.stageSvg.releasePointerCapture === 'function') {
      try { this.stageSvg.releasePointerCapture(e.pointerId); } catch {}
    }

    if (this.isDrawing) {
      this.isDrawing = false;
      this.endInkStroke();
    }

    if (this.isDragging && this.dragTarget) {
      if (this.dragMode === 'bind-input') {
        this.dragTarget.style.cursor = 'grab';
        this._playNamedTone('release');
      } else if (this.dragMode === 'generic') {
        const axis = this.dragTarget.getAttribute('data-gesture-axis') || 'xy';
        this.dragTarget.style.cursor = axis === 'y' ? 'ns-resize' : (axis === 'x' ? 'ew-resize' : 'grab');
        this._playNamedTone('release');
        if (this.engine && !this.engine.isPlaying && this._wasPlayingBeforeDrag) {
          this.engine.play();
        }
      } else if (this.dragMode === 'rotate') {
        if (this.dragTarget) this.dragTarget.style.cursor = 'grab';
        this._playNamedTone('release');
      } else if (this.dragMode === 'trackball') {
        if (this.dragTarget && this.dragTarget !== this.stageSvg) this.dragTarget.style.cursor = 'grab';
        this._playNamedTone('release');
      }

      this.isDragging = false;
      this.dragTarget = null;
      this.dragMode = null;
      this._wasPlayingBeforeDrag = false;
    }
  }

  function handlePointerCancel(e) {
    if (this._pendingTouchAudio) {
      const pointerId = e && e.pointerId !== undefined ? e.pointerId : null;
      if (pointerId !== null) this._pendingTouchAudio.delete(pointerId);
      else this._pendingTouchAudio.clear();
    }
    this._releaseAllHeldInputs(true);
    this.handlePointerUp(e);
  }

  function handleTrackballDrag(e) {
    if (!this.engine) return;
    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;
    const yawKey = this.trackballYawVar;
    const pitchKey = this.trackballPitchVar;
    const pMin = typeof this.trackballPitchMin === 'number' ? this.trackballPitchMin : -65;
    const pMax = typeof this.trackballPitchMax === 'number' ? this.trackballPitchMax : 65;
    const scene = this.engine.scene;

    if (yawKey && this.engine.vars) {
      const bounds = this._resolveVarBounds(scene, {}, yawKey);
      const rawYaw = this.trackballStartYaw + dx * 0.8;
      let nextYaw;
      if (Number.isFinite(bounds.min) && Number.isFinite(bounds.max) && bounds.min < 0) {
        const span = bounds.max - bounds.min || 360;
        const wrapped = ((((rawYaw - bounds.min) % span) + span) % span) + bounds.min;
        nextYaw = Math.round(wrapped);
      } else {
        nextYaw = Math.round(((rawYaw % 360) + 360) % 360);
      }
      this._writeEngineVar(yawKey, nextYaw);
    }

    if (pitchKey && this.engine.vars) {
      const newPitch = Math.max(pMin, Math.min(pMax, this.trackballStartPitch - dy * 0.5));
      this._writeEngineVar(pitchKey, Math.round(newPitch));
    }

    if (scene && (scene.camera || scene.has3D)) {
      if (!this.engine.cameraOrbit) {
        this.engine.cameraOrbit = { yawOffset: 0, pitchOffset: 0, distanceScale: 1.0 };
      }
      if (!yawKey) {
        this.engine.cameraOrbit.yawOffset = (this.trackballStartCamYaw || 0) + dx * 0.7;
      }
      if (!pitchKey) {
        this.engine.cameraOrbit.pitchOffset = Math.max(
          pMin,
          Math.min(pMax, (this.trackballStartCamPitch || 0) - dy * 0.5)
        );
      }
    }

    if (typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0);
    }
  }

  function handleGenericDrag(target, svgPt) {
    if (!target) return;

    const axis = target.getAttribute('data-gesture-axis') || 'xy';
    const minX = parseFloat(target.getAttribute('data-gesture-min-x') || '0');
    const maxX = parseFloat(target.getAttribute('data-gesture-max-x') || '800');
    const minY = parseFloat(target.getAttribute('data-gesture-min-y') || '0');
    const maxY = parseFloat(target.getAttribute('data-gesture-max-y') || '480');
    const varName = target.getAttribute('data-gesture-var');
    const varX = target.getAttribute('data-gesture-var-x');
    const varY = target.getAttribute('data-gesture-var-y');
    const attrStepRaw = target.getAttribute('data-gesture-step');
    const attrStep = attrStepRaw !== null ? parseFloat(attrStepRaw) : NaN;
    const isInverted = target.getAttribute('data-gesture-invert') === 'true';
    const isRelative = target.getAttribute('data-gesture-relative') === 'true';
    const isSeek = target.getAttribute('data-gesture-seek') === 'true';
    const dragTone = target.getAttribute('data-gesture-tone');

    const initTx = (this.targetInitial && this.targetInitial.initTx) || 0;
    const initTy = (this.targetInitial && this.targetInitial.initTy) || 0;
    const initX = (this.targetInitial && this.targetInitial.x) || 0;
    const initY = (this.targetInitial && this.targetInitial.y) || 0;

    const dx = svgPt.x - this.dragStart.x;
    const dy = svgPt.y - this.dragStart.y;

    let targetTx = initTx + (axis !== 'y' ? dx : 0);
    let targetTy = initTy + (axis !== 'x' ? dy : 0);
    let effectiveX = targetTx;
    let effectiveY = targetTy;

    const hasBoundsX = !Number.isNaN(minX) && !Number.isNaN(maxX) && maxX > minX;
    const useAbsX = hasBoundsX && initTx === 0 && minX >= 0 && initX >= minX - 20;
    if (axis === 'x' || axis === 'xy') {
      if (hasBoundsX) {
        if (useAbsX) {
          const absX = Math.max(minX, Math.min(maxX, initX + dx));
          targetTx = absX - initX;
          effectiveX = absX;
        } else {
          targetTx = Math.max(minX, Math.min(maxX, targetTx));
          effectiveX = targetTx;
        }
      }
    }

    const hasBoundsY = !Number.isNaN(minY) && !Number.isNaN(maxY) && maxY > minY;
    const useAbsY = hasBoundsY && initTy === 0 && minY >= 0 && initY >= minY - 20;
    if (axis === 'y' || axis === 'xy') {
      if (hasBoundsY) {
        if (useAbsY) {
          const absY = Math.max(minY, Math.min(maxY, initY + dy));
          targetTy = absY - initY;
          effectiveY = absY;
        } else {
          targetTy = Math.max(minY, Math.min(maxY, targetTy));
          effectiveY = targetTy;
        }
      }
    }

    if (!isRelative) {
      target.setAttribute('transform', `translate(${targetTx.toFixed(1)}, ${targetTy.toFixed(1)})`);
    }

    if (varX && axis !== 'y') {
      let coordX;
      if (initTx !== 0 || (hasBoundsX && minX < 0) || useAbsX) {
        coordX = effectiveX;
      } else {
        coordX = hasBoundsX ? Math.max(minX, Math.min(maxX, svgPt.x)) : svgPt.x;
      }
      this._writeEngineVar(varX, Math.round(coordX));
    }

    if (varY && axis !== 'x') {
      let coordY;
      if (initTy !== 0 || (hasBoundsY && minY < 0) || useAbsY) {
        coordY = effectiveY;
      } else {
        coordY = hasBoundsY ? Math.max(minY, Math.min(maxY, svgPt.y)) : svgPt.y;
      }
      this._writeEngineVar(varY, Math.round(coordY));
    }

    let ratio;
    if (axis === 'xy' && isSeek && hasBoundsX && hasBoundsY) {
      const sx = minX;
      const ex = maxX;
      const sy = isInverted ? maxY : minY;
      const ey = isInverted ? minY : maxY;
      const segDx = ex - sx;
      const segDy = ey - sy;
      const segLenSq = (segDx * segDx + segDy * segDy) || 1;
      const px = (initTx !== 0 ? initTx + dx : svgPt.x) - sx;
      const py = (initTy !== 0 ? initTy + dy : svgPt.y) - sy;
      ratio = Math.max(0, Math.min(1, (px * segDx + py * segDy) / segLenSq));
    } else {
      ratio = axis === 'y'
        ? Math.max(0, Math.min(1, (effectiveY - minY) / ((maxY - minY) || 1)))
        : Math.max(0, Math.min(1, (effectiveX - minX) / ((maxX - minX) || 1)));
      if (isInverted) ratio = 1 - ratio;
    }

    if (varName) {
      let vMin = 0;
      let vMax = 100;
      let stepVal = (!Number.isNaN(attrStep) && attrStep > 0) ? attrStep : 1;
      let foundConfig = false;

      const sceneInputs = this.engine && this.engine.scene && this.engine.scene.inputs;
      if (Array.isArray(sceneInputs)) {
        const inp = sceneInputs.find(i => i && i.var === varName);
        if (inp) {
          if (typeof inp.min === 'number') vMin = inp.min;
          if (typeof inp.max === 'number') vMax = inp.max;
          if (typeof inp.step === 'number' && Number.isNaN(attrStep)) stepVal = inp.step;
          foundConfig = true;
        }
      }

      if (!foundConfig && this.engine && this.engine.scene && this.engine.scene.vars) {
        const rawVar = this.engine.scene.vars[varName];
        if (rawVar && typeof rawVar === 'object') {
          if (typeof rawVar.min === 'number') vMin = rawVar.min;
          if (typeof rawVar.max === 'number') vMax = rawVar.max;
          if (typeof rawVar.step === 'number' && Number.isNaN(attrStep)) stepVal = rawVar.step;
        }
      }

      let mapped;
      if (isRelative && this.targetInitial && typeof this.targetInitial.initVarVal === 'number') {
        const spanPx = axis === 'y' ? ((maxY - minY) || 1) : ((maxX - minX) || 1);
        const rawDelta = axis === 'y' ? (isInverted ? -dy : dy) : (isInverted ? -dx : dx);
        mapped = this.targetInitial.initVarVal + (rawDelta / spanPx) * (vMax - vMin);
      } else {
        mapped = vMin + ratio * (vMax - vMin);
      }
      const rawStepped = stepVal > 0
        ? (vMin + Math.round((mapped - vMin) / stepVal) * stepVal)
        : mapped;
      const clampedVal = Math.max(vMin, Math.min(vMax, rawStepped));
      const decimals = (String(stepVal).split('.')[1] || '').length;
      const finalVal = Number(clampedVal.toFixed(Math.min(6, decimals)));
      const prevVal = this.engine && this.engine.vars ? this.engine.vars[varName] : undefined;
      this._writeEngineVar(varName, finalVal);

      if (dragTone && finalVal !== prevVal && typeof this.playAudioTone === 'function') {
        const now = Date.now();
        if (!this._lastDragToneAt || now - this._lastDragToneAt > 45) {
          this._lastDragToneAt = now;
          const hz = parseFloat(dragTone);
          if (!Number.isNaN(hz)) this.playAudioTone(hz, 'triangle', 0.04, 0.1);
        }
      }
    }

    if (this.engine && Array.isArray(this.engine.activeBindings)) {
      for (let i = 0; i < this.engine.activeBindings.length; i++) {
        const b = this.engine.activeBindings[i];
        if (b && b.node === target) b.lastVal = undefined;
      }
    }

    if (isSeek && this.engine && typeof this.engine.seek === 'function') {
      this.engine.seek(ratio);
    } else if (this.engine && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0);
    }
  }

  function handleRotateDrag(target, svgPt) {
    if (!target) return;
    const cx = parseFloat(target.getAttribute('data-gesture-cx') || '400');
    const cy = parseFloat(target.getAttribute('data-gesture-cy') || '240');
    const varName = target.getAttribute('data-gesture-var');
    const angleRad = Math.atan2(svgPt.y - cy, svgPt.x - cx);
    let angleDeg = angleRad * (180 / Math.PI);
    if (angleDeg < 0) angleDeg += 360;
    target.setAttribute('transform', `rotate(${angleDeg.toFixed(1)} ${cx} ${cy})`);
    if (varName) {
      this._writeEngineVar(varName, parseFloat(angleDeg.toFixed(1)));
    }
    if (this.engine && typeof this.engine.applyBindings === 'function') {
      this.engine.applyBindings(this.engine.progress || 0);
    }
  }

  function handleBindInputDrag(target, svgPt) {
    if (!this.engine || !this.engine.activeBindInputs) return;
    const binding = this.engine.activeBindInputs.find(b => b.node === target || b.target === '#' + target.id || (target.id && b.target === target.id));
    if (!binding) return;

    const axis = binding.axis || 'x';
    const tMin = binding.trackMin !== undefined ? binding.trackMin : (axis === 'y' ? 320 : 60);
    const tMax = binding.trackMax !== undefined ? binding.trackMax : (axis === 'y' ? 80 : 440);
    let ratio = 0;

    if (axis === 'y') {
      const minY = Math.min(tMin, tMax);
      const maxY = Math.max(tMin, tMax);
      const clampedY = Math.max(minY, Math.min(maxY, svgPt.y));
      ratio = (clampedY - tMin) / (tMax - tMin);
      target.setAttribute('transform', `translate(0, ${clampedY.toFixed(1)})`);
    } else if (axis === 'rotary') {
      const center = { x: binding.originX || 0, y: binding.originY || 0 };
      const angleRad = Math.atan2(svgPt.y - center.y, svgPt.x - center.x);
      let angleDeg = (angleRad * 180 / Math.PI) + 90;
      if (angleDeg < -135) angleDeg = -135;
      if (angleDeg > 135) angleDeg = 135;
      ratio = (angleDeg + 135) / 270;
      target.setAttribute('transform', `rotate(${angleDeg.toFixed(1)} ${center.x} ${center.y})`);
    } else {
      const minX = Math.min(tMin, tMax);
      const maxX = Math.max(tMin, tMax);
      const clampedX = Math.max(minX, Math.min(maxX, svgPt.x));
      ratio = (clampedX - tMin) / (tMax - tMin);
      target.setAttribute('transform', `translate(${clampedX.toFixed(1)}, 0)`);
    }

    ratio = Math.max(0, Math.min(1, ratio));
    const val = binding.min + ratio * (binding.max - binding.min);
    this.engine.setVar(binding.var, Number(val.toFixed(2)));
  }

  const ASTGesturesInput = {
    _handleCheckpointModalKeys,
    _executeUniversalKeyRule,
    handleKeyDown,
    handleKeyUp,
    handleWindowBlur,
    handlePointerLeave,
    screenToSvg,
    enhanceSceneInteractivity,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleTrackballDrag,
    handleGenericDrag,
    handleRotateDrag,
    handleBindInputDrag
  };

  global.ASTGesturesInput = ASTGesturesInput;
  if (typeof window !== 'undefined') window.ASTGesturesInput = ASTGesturesInput;
  if (typeof module !== 'undefined' && module.exports) module.exports = ASTGesturesInput;

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
