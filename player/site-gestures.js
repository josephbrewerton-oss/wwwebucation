/**
 * static/player/site-gestures.js
 *
 * St Joseph's Educational Media Suite - Declarative Site Gesture Bridge & Direct Manipulation VM
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Reads platform rules, tools, palette, tones, and default switches from player-gestures.ast,
 * merges per-cartridge (:controls ...) overrides, and drives the SVG stage hardware bridge.
 */

(function (global) {
  'use strict';

  function _getGesturesProfile() {
    return global.ASTGesturesProfile || (typeof window !== 'undefined' ? window.ASTGesturesProfile : undefined);
  }

  function _getGesturesWhiteboard() {
    return global.ASTGesturesWhiteboard || (typeof window !== 'undefined' ? window.ASTGesturesWhiteboard : undefined);
  }

  function _getGesturesHud() {
    return global.ASTGesturesHud || (typeof window !== 'undefined' ? window.ASTGesturesHud : undefined);
  }

  function _getGesturesActions() {
    return global.ASTGesturesActions || (typeof window !== 'undefined' ? window.ASTGesturesActions : undefined);
  }

  // Resolve script base URL at load time so player-gestures.ast can be fetched reliably
  const SCRIPT_BASE_URL = (() => {
    try {
      if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
        return document.currentScript.src.replace(/[^/]+$/, '');
      }
    } catch {}
    return '';
  })();

  class ASTDirectGestureSubsystem {
    constructor(engine, options = {}) {
      this.engine = engine;
      this.options = options;
      this._scriptBaseUrl = SCRIPT_BASE_URL;
      this.stageSvg = null;
      this.sceneRoot = null;
      this.inkRoot = null;
      this.hudRoot = null;
      this.xrayTooltip = null;

      // Player Gesture Profile & Active Cartridge Controls (seeded by site-gestures-profile.js)
      const _profileMod = _getGesturesProfile();
      this.playerProfile = (_profileMod && typeof _profileMod.createDefaultProfile === 'function')
        ? _profileMod.createDefaultProfile.call(this)
        : {
          defaults: {},
          universalKeys: [],
          whiteboard: { tools: [], widths: [], palette: [] },
          tones: {},
          skills: new Map()
        };
      this.activeControls = { ...(this.playerProfile.defaults || {}) };
      this._profileLoaded = false;

      // Pointer Drag State
      this.isDragging = false;
      this.dragTarget = null;
      this.dragMode = null; // 'generic', 'rotate', 'trackball', 'bind-input'
      this.dragStart = { x: 0, y: 0 };
      this.targetInitial = { x: 0, y: 0 };
      this._wasPlayingBeforeDrag = false;

      // Pen Annotation Whiteboard State
      this.isPenActive = false;
      this.currentTool = 'pen';
      this.currentInkColor = '#facc15';
      this.currentInkWidth = 3.5;
      this.isDrawing = false;
      this.currentStroke = null;
      this.strokes = [];
      this._undoStack = [];
      this.stylusOnlyMode = false;

      // X-Ray Pedagogical Tooltip Mode
      this.isXRayActive = false;
      this.sonificationEnabled = true;

      // Audio Synthesizer Context
      this.audioCtx = null;

      // Generic Declarative Held Input VM State (Keyboard + Pointer)
      this._heldKeys = new Set();
      this._heldKeyCodeMap = new Map();
      this._heldPointerEntries = new Map();
      this._pendingTouchAudio = new Map();
      this._activeHoldVars = new Map();
      this._holdRafId = null;
      this._holdLastTs = 0;
      // Bound listeners & extension registries
      this._boundStageSvg = null;
      this._windowListenersBound = false;
      this._customActions = new Map();
      this._customGestureSkills = new Map();
      this._syncingTimelineVar = false;
      this._lastSyncedTimelineVal = null;
      this._timelineSyncBound = false;

      // Bind methods
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      this.handlePointerCancel = this.handlePointerCancel.bind(this);
      this.handlePointerLeave = this.handlePointerLeave.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.handleWindowBlur = this.handleWindowBlur.bind(this);
      this._runHoldLoop = this._runHoldLoop.bind(this);
    }

    /**
     * Initializes and mounts gesture subsystem onto the SVG stage
     */
    init(stageSvg, sceneRoot) {
      this.stageSvg = stageSvg || document.getElementById('stage-svg');
      this.sceneRoot = sceneRoot || document.getElementById('scene-root');
      if (!this.stageSvg) return;

      this.setupDomLayers();
      this.setupEventListeners();
      this.setupGlassHud();
      this.setupXRayTooltip();
      this._syncCartridgeControls();
      this.enhanceSceneInteractivity();

      // Load player-gestures.ast asynchronously and re-apply HUD/controls once loaded
      this.loadPlayerGesturesProfile()
        .then(() => {
          const wasPenActive = this.isPenActive;
          this._rebuildGlassHud();
          this._syncCartridgeControls();
          if (wasPenActive && this._isControlEnabled('whiteboard') && !this.isPenActive) {
            this.togglePen(true);
          }
          this.enhanceSceneInteractivity();
        })
        .catch(() => {});

      // Listen for scene load changes (guard duplicate registration)
      if (!this._presetListenerBound && this.engine && typeof this.engine.on === 'function') {
        this._presetListenerBound = true;
        this.engine.on('presetchange', () => {
          this._releaseAllHeldInputs(false);
          this._lastSyncedTimelineVal = null;
          this.isDragging = false;
          this.dragTarget = null;
          this.dragMode = null;
          this._wasPlayingBeforeDrag = false;
          this.hideXRayPopup();
          this._syncCartridgeControls();
          this.enhanceSceneInteractivity();
          setTimeout(() => {
            this._syncCartridgeControls();
            this.enhanceSceneInteractivity();
          }, 50);
        });
      }

      this._bindTimelineVarSync();
    }

    // =========================================================================
    // player-gestures.ast Loader, Skills Compiler & Controls (delegated to site-gestures-profile.js)
    // =========================================================================

    async loadPlayerGesturesProfile() {
      const _p = _getGesturesProfile();
      return _p && typeof _p.loadPlayerGesturesProfile === 'function' ? _p.loadPlayerGesturesProfile.call(this) : this.playerProfile;
    }

    _stripSexpComments(source) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._stripSexpComments === 'function' ? _p._stripSexpComments.call(this, source) : String(source || '');
    }

    _extractSexpBlock(source, headToken) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._extractSexpBlock === 'function' ? _p._extractSexpBlock.call(this, source, headToken) : null;
    }

    _extractChildSexps(block) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._extractChildSexps === 'function' ? _p._extractChildSexps.call(this, block) : [];
    }

    _extractAllSexpBlocks(source, headToken) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._extractAllSexpBlocks === 'function' ? _p._extractAllSexpBlocks.call(this, source, headToken) : [];
    }

    _stripChildSexps(block) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._stripChildSexps === 'function' ? _p._stripChildSexps.call(this, block) : '';
    }

    _kebabToCamel(key) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._kebabToCamel === 'function' ? _p._kebabToCamel.call(this, key) : String(key || '');
    }

    _escapeTemplateValue(val) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._escapeTemplateValue === 'function' ? _p._escapeTemplateValue.call(this, val) : String(val ?? '');
    }

    _resolveSkillParams(skillDef, usageParams) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._resolveSkillParams === 'function' ? _p._resolveSkillParams.call(this, skillDef, usageParams) : {};
    }

    _expandSkillTemplate(raw, params, isJsExprField = false) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._expandSkillTemplate === 'function' ? _p._expandSkillTemplate.call(this, raw, params, isJsExprField) : raw;
    }

    _parseSkillsBlock(skillsBlock) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._parseSkillsBlock === 'function' ? _p._parseSkillsBlock.call(this, skillsBlock) : new Map();
    }

    _parseKeywordAttrs(sexp) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._parseKeywordAttrs === 'function' ? _p._parseKeywordAttrs.call(this, sexp) : {};
    }

    _parseControlsBlock(blockText) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._parseControlsBlock === 'function' ? _p._parseControlsBlock.call(this, blockText) : {};
    }

    _parsePlayerGesturesAST(astText) {
      const _p = _getGesturesProfile();
      if (_p && typeof _p._parsePlayerGesturesAST === 'function') _p._parsePlayerGesturesAST.call(this, astText);
    }

    _getRawCartridgeAst() {
      const _p = _getGesturesProfile();
      return _p && typeof _p._getRawCartridgeAst === 'function' ? _p._getRawCartridgeAst.call(this) : '';
    }

    _resolveSceneSkillUsages(scene) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._resolveSceneSkillUsages === 'function' ? _p._resolveSceneSkillUsages.call(this, scene) : [];
    }

    _resolveSkillGestures(scene) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._resolveSkillGestures === 'function' ? _p._resolveSkillGestures.call(this, scene) : [];
    }

    _getActiveTimelineSyncSpec(scene) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._getActiveTimelineSyncSpec === 'function' ? _p._getActiveTimelineSyncSpec.call(this, scene) : null;
    }

    _bindTimelineVarSync() {
      const _p = _getGesturesProfile();
      if (_p && typeof _p._bindTimelineVarSync === 'function') _p._bindTimelineVarSync.call(this);
    }

    _syncCartridgeControls() {
      const _p = _getGesturesProfile();
      if (_p && typeof _p._syncCartridgeControls === 'function') _p._syncCartridgeControls.call(this);
    }

    _isControlEnabled(flagName) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._isControlEnabled === 'function'
        ? _p._isControlEnabled.call(this, flagName)
        : this.activeControls[flagName] !== false;
    }

    _setElementControlVisibility(el, enabled) {
      const _p = _getGesturesProfile();
      if (_p && typeof _p._setElementControlVisibility === 'function') _p._setElementControlVisibility.call(this, el, enabled);
    }

    _applyControlVisibility() {
      const _p = _getGesturesProfile();
      if (_p && typeof _p._applyControlVisibility === 'function') _p._applyControlVisibility.call(this);
    }

    _playNamedTone(eventName) {
      const _a = _getGesturesActions();
      if (_a && typeof _a._playNamedTone === 'function') _a._playNamedTone.call(this, eventName);
    }

    _normalizeGesture(g) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._normalizeGesture === 'function' ? _p._normalizeGesture.call(this, g) : g;
    }

    _getNormalizedSceneGestures(scene) {
      const _p = _getGesturesProfile();
      if (_p && typeof _p._getNormalizedSceneGestures === 'function') return _p._getNormalizedSceneGestures.call(this, scene);
      return (scene && Array.isArray(scene.gestures)) ? scene.gestures : [];
    }

    _findPrimarySteppedVar(scene) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._findPrimarySteppedVar === 'function' ? _p._findPrimarySteppedVar.call(this, scene) : null;
    }

    // =========================================================================
    // DOM Layers & Event Listeners
    // =========================================================================

    setupDomLayers() {
      let inkGroup = this.stageSvg.querySelector('#annotation-ink-root');
      if (!inkGroup) {
        inkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        inkGroup.id = 'annotation-ink-root';
        inkGroup.style.pointerEvents = 'none';
        this.stageSvg.appendChild(inkGroup);
      }
      this.inkRoot = inkGroup;

      let hudGroup = this.stageSvg.querySelector('#stage-hud-root');
      if (!hudGroup) {
        hudGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        hudGroup.id = 'stage-hud-root';
        this.stageSvg.appendChild(hudGroup);
      }
      hudGroup.style.pointerEvents = 'none';
      this.hudRoot = hudGroup;
    }

    setupEventListeners() {
      if (!this.stageSvg) return;

      if (!this.stageSvg.hasAttribute('tabindex')) {
        this.stageSvg.setAttribute('tabindex', '0');
      }
      this.stageSvg.style.outline = 'none';
      this.stageSvg.style.touchAction = 'none';

      if (this._boundStageSvg !== this.stageSvg) {
        if (this._boundStageSvg) {
          this._boundStageSvg.removeEventListener('pointerdown', this.handlePointerDown);
          this._boundStageSvg.removeEventListener('pointerleave', this.handlePointerLeave);
        }
        this.stageSvg.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
        this.stageSvg.addEventListener('pointerleave', this.handlePointerLeave);
        this._boundStageSvg = this.stageSvg;
      }

      if (!this._windowListenersBound && typeof window !== 'undefined') {
        this._windowListenersBound = true;
        this._declarativeKeyBound = true;
        window.addEventListener('pointermove', this.handlePointerMove, { passive: false });
        window.addEventListener('pointerup', this.handlePointerUp);
        window.addEventListener('pointercancel', this.handlePointerCancel);
        window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleWindowBlur);

        window.addEventListener('message', (ev) => {
          this._handleWhiteboardMessage(ev);
        });
      }
    }

    _handleWhiteboardMessage(ev) {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.handleWhiteboardMessage === 'function') {
        _w.handleWhiteboardMessage.call(this, ev);
      }
    }

    // =========================================================================
    // Declarative Action Engine, Hold Loop & Touch Audio (Delegated to site-gestures-actions.js)
    // =========================================================================

    _resolveVarBounds(scene, g, varName) {
      const _a = _getGesturesActions();
      return _a && typeof _a._resolveVarBounds === 'function'
        ? _a._resolveVarBounds.call(this, scene, g, varName)
        : { min: -Infinity, max: Infinity };
    }

    _resolveHoldReleaseValue(scene, g, holdVarName) {
      const _a = _getGesturesActions();
      return _a && typeof _a._resolveHoldReleaseValue === 'function'
        ? _a._resolveHoldReleaseValue.call(this, scene, g, holdVarName)
        : 0;
    }

    _writeEngineVar(varName, value) {
      const _a = _getGesturesActions();
      if (_a && typeof _a._writeEngineVar === 'function') _a._writeEngineVar.call(this, varName, value);
    }

    _speakGestureText(rawText, opts = {}) {
      const _a = _getGesturesActions();
      if (_a && typeof _a._speakGestureText === 'function') _a._speakGestureText.call(this, rawText, opts);
    }

    _playToneSpec(toneSpec) {
      const _a = _getGesturesActions();
      if (_a && typeof _a._playToneSpec === 'function') _a._playToneSpec.call(this, toneSpec);
    }

    _flushPendingTouchAudio(pointerId = null) {
      const _a = _getGesturesActions();
      if (_a && typeof _a._flushPendingTouchAudio === 'function') _a._flushPendingTouchAudio.call(this, pointerId);
    }

    handleTouchEnd() {
      const _a = _getGesturesActions();
      if (_a && typeof _a.handleTouchEnd === 'function') _a.handleTouchEnd.call(this);
    }

    _readMatchedElementAttr(g, matchedEl) {
      const _a = _getGesturesActions();
      return _a && typeof _a._readMatchedElementAttr === 'function'
        ? _a._readMatchedElementAttr.call(this, g, matchedEl)
        : undefined;
    }

    _evalGestureExpr(exprText, matchedEl, attrVal, asReturnValue = true) {
      const _a = _getGesturesActions();
      return _a && typeof _a._evalGestureExpr === 'function'
        ? _a._evalGestureExpr.call(this, exprText, matchedEl, attrVal, asReturnValue)
        : undefined;
    }

    _evalConditionExpr(condExpr, matchedEl, attrVal) {
      const _a = _getGesturesActions();
      return _a && typeof _a._evalConditionExpr === 'function'
        ? _a._evalConditionExpr.call(this, condExpr, matchedEl, attrVal)
        : !condExpr;
    }

    _emitSiteDirective(directive, scene) {
      const _a = _getGesturesActions();
      return _a && typeof _a._emitSiteDirective === 'function'
        ? _a._emitSiteDirective.call(this, directive, scene)
        : false;
    }

    _executeDeclarativeAction(g, matchedEl, attrVal, scene) {
      const _a = _getGesturesActions();
      return _a && typeof _a._executeDeclarativeAction === 'function'
        ? _a._executeDeclarativeAction.call(this, g, matchedEl, attrVal, scene)
        : false;
    }

    _applyGesturePress(g, matchedEl, scene, audioQueue = null) {
      const _a = _getGesturesActions();
      return _a && typeof _a._applyGesturePress === 'function'
        ? _a._applyGesturePress.call(this, g, matchedEl, scene, audioQueue)
        : false;
    }

    _applyContinuousGestureStep(g, scene, dtSec, matchedEl = null) {
      const _a = _getGesturesActions();
      return _a && typeof _a._applyContinuousGestureStep === 'function'
        ? _a._applyContinuousGestureStep.call(this, g, scene, dtSec, matchedEl)
        : false;
    }

    _releaseHoldForGesture(g) {
      const _a = _getGesturesActions();
      return _a && typeof _a._releaseHoldForGesture === 'function'
        ? _a._releaseHoldForGesture.call(this, g)
        : false;
    }

    _releasePointerEntry(pointerId) {
      const _a = _getGesturesActions();
      return _a && typeof _a._releasePointerEntry === 'function'
        ? _a._releasePointerEntry.call(this, pointerId)
        : false;
    }

    _releaseAllHeldInputs(resetHoldVars = true) {
      const _a = _getGesturesActions();
      if (_a && typeof _a._releaseAllHeldInputs === 'function') _a._releaseAllHeldInputs.call(this, resetHoldVars);
    }

    _ensureHoldLoop() {
      const _a = _getGesturesActions();
      if (_a && typeof _a._ensureHoldLoop === 'function') _a._ensureHoldLoop.call(this);
    }

    _stopHoldLoop() {
      const _a = _getGesturesActions();
      if (_a && typeof _a._stopHoldLoop === 'function') _a._stopHoldLoop.call(this);
    }

    _runHoldLoop(ts) {
      const _a = _getGesturesActions();
      if (_a && typeof _a._runHoldLoop === 'function') _a._runHoldLoop.call(this, ts);
    }

    _gestureMatchesKey(g, e) {
      const _a = _getGesturesActions();
      return _a && typeof _a._gestureMatchesKey === 'function'
        ? _a._gestureMatchesKey.call(this, g, e)
        : false;
    }

    _ensureInteractiveSimPlaying() {
      const _a = _getGesturesActions();
      if (_a && typeof _a._ensureInteractiveSimPlaying === 'function') _a._ensureInteractiveSimPlaying.call(this);
    }

    // =========================================================================
    // Priority 1, 2 & 3 Keyboard & Switch Navigation Handler
    // =========================================================================

    _handleCheckpointModalKeys(e) {
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

    _executeUniversalKeyRule(rule, scene) {
      if (!rule || !this.engine) return false;
      const action = rule.action;

      // 0. Check extensible Action Registry (instance or global)
      const customHandler = (this._customActions && this._customActions.get(action))
        || (ASTDirectGestureSubsystem._customActions && ASTDirectGestureSubsystem._customActions.get(action));
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

    handleKeyDown(e) {
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

    handleKeyUp(e) {
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

    handleWindowBlur() {
      this._releaseAllHeldInputs(true);
    }

    handlePointerLeave(e) {
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
    screenToSvg(clientX, clientY) {
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
    enhanceSceneInteractivity() {
      if (!this.stageSvg) return;

      this.restoreInkFromSession();
      this.setupSimParametersHud();

      const scene = this.engine && this.engine.scene;
      const gestures = this._getNormalizedSceneGestures(scene);
      const scrubAllowed = this._isControlEnabled('scrub');

      gestures.forEach(g => {
        if (!g.target) return;
        const matchedList = [];
        if (this.stageSvg.matches && this.stageSvg.matches(g.target)) {
          matchedList.push(this.stageSvg);
        }
        this.stageSvg.querySelectorAll(g.target).forEach(node => matchedList.push(node));

        matchedList.forEach(el => {
          el.style.pointerEvents = 'auto';
          el.style.touchAction = 'none';
          if (el !== this.stageSvg && g.type !== 'trackball' && g.axis !== 'trackball') {
            el.querySelectorAll('*').forEach(child => {
              if (child && child.style) child.style.pointerEvents = 'auto';
            });
          }

          const customSkill = (this._customGestureSkills && this._customGestureSkills.get(g.type))
            || (ASTDirectGestureSubsystem._customGestureSkills && ASTDirectGestureSubsystem._customGestureSkills.get(g.type));
          if (customSkill && typeof customSkill.enhance === 'function') {
            customSkill.enhance.call(this, el, g, scene, this);
          } else if (g.type === 'clickable' || g.type === 'holdable') {
            el.style.cursor = 'pointer';
            el.setAttribute(g.type === 'holdable' ? 'data-declarative-holdable' : 'data-declarative-clickable', 'true');
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
    handlePointerDown(e) {
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

      const scene = this.engine && this.engine.scene;
      const gestures = this._getNormalizedSceneGestures(scene);

      // B0. Custom Registered Gesture Skills
      for (let i = 0; i < gestures.length; i++) {
        const g = gestures[i];
        const customSkill = (this._customGestureSkills && this._customGestureSkills.get(g.type))
          || (ASTDirectGestureSubsystem._customGestureSkills && ASTDirectGestureSubsystem._customGestureSkills.get(g.type));
        if (customSkill && typeof customSkill.onPointerDown === 'function' && g.target) {
          const hitEl = e.target.closest(g.target);
          if (hitEl && customSkill.onPointerDown.call(this, e, g, hitEl, svgPt, scene, this) === true) {
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
        if (!hitEl) continue;
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

    handlePointerMove(e) {
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
      } else if (this.isXRayActive && this._isControlEnabled('xray')) {
        const pedNode = e.target.closest('[data-pedagogical]');
        if (pedNode) {
          this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y, pedNode);
        } else {
          this.hideXRayPopup();
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

    handlePointerUp(e) {
      const pointerId = e && e.pointerId !== undefined ? e.pointerId : 'mouse';
      this._flushPendingTouchAudio(pointerId);
      const didResetHold = this._releasePointerEntry(pointerId);
      if (didResetHold && this.engine && typeof this.engine.applyBindings === 'function') {
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

    handlePointerCancel(e) {
      if (this._pendingTouchAudio) {
        const pointerId = e && e.pointerId !== undefined ? e.pointerId : null;
        if (pointerId !== null) this._pendingTouchAudio.delete(pointerId);
        else this._pendingTouchAudio.clear();
      }
      this._releaseAllHeldInputs(true);
      this.handlePointerUp(e);
    }

    handleTrackballDrag(e) {
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

    handleGenericDrag(target, svgPt) {
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

    handleRotateDrag(target, svgPt) {
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

    handleBindInputDrag(target, svgPt) {
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

    // =========================================================================
    // Whiteboard & Stylus Pen Ink Drawing Layer (Delegated to site-gestures-whiteboard.js)
    // =========================================================================

    startInkStroke(pt) {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.startInkStroke === 'function') _w.startInkStroke.call(this, pt);
    }

    continueInkStroke(pt) {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.continueInkStroke === 'function') _w.continueInkStroke.call(this, pt);
    }

    endInkStroke() {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.endInkStroke === 'function') _w.endInkStroke.call(this);
    }

    eraseStrokeAt(pt) {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.eraseStrokeAt === 'function') _w.eraseStrokeAt.call(this, pt);
    }

    undoLastStroke() {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.undoLastStroke === 'function') _w.undoLastStroke.call(this);
    }

    redoLastStroke() {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.redoLastStroke === 'function') _w.redoLastStroke.call(this);
    }

    clearWhiteboardInk() {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.clearWhiteboardInk === 'function') _w.clearWhiteboardInk.call(this);
    }

    exportInkToAST(options = {}) {
      const _w = _getGesturesWhiteboard();
      return _w && typeof _w.exportInkToAST === 'function'
        ? _w.exportInkToAST.call(this, options)
        : '';
    }

    importInkFromAST(astString, options = {}) {
      const _w = _getGesturesWhiteboard();
      return _w && typeof _w.importInkFromAST === 'function'
        ? _w.importInkFromAST.call(this, astString, options)
        : 0;
    }

    exportInkToJSON() {
      const _w = _getGesturesWhiteboard();
      return _w && typeof _w.exportInkToJSON === 'function'
        ? _w.exportInkToJSON.call(this)
        : { type: 'AST_INK_SESSION', sceneId: 'whiteboard-session', timestamp: Date.now(), strokeCount: 0, strokes: [] };
    }

    importInkFromJSON(data, options = {}) {
      const _w = _getGesturesWhiteboard();
      return _w && typeof _w.importInkFromJSON === 'function'
        ? _w.importInkFromJSON.call(this, data, options)
        : 0;
    }

    broadcastInkSession() {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.broadcastInkSession === 'function') _w.broadcastInkSession.call(this);
    }

    persistInkToSession() {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.persistInkToSession === 'function') _w.persistInkToSession.call(this);
    }

    restoreInkFromSession() {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.restoreInkFromSession === 'function') _w.restoreInkFromSession.call(this);
    }

    showFloatingNotice(message) {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.showFloatingNotice === 'function') _w.showFloatingNotice.call(this, message);
    }

    togglePen(forceState) {
      const _w = _getGesturesWhiteboard();
      if (_w && typeof _w.togglePen === 'function') _w.togglePen.call(this, forceState);
    }

    // =========================================================================
    // Stage-Embedded Glass HUD, X-Ray & Touch Ripples (Delegated to site-gestures-hud.js)
    // =========================================================================

    _rebuildGlassHud() {
      const _h = _getGesturesHud();
      if (_h && typeof _h._rebuildGlassHud === 'function') _h._rebuildGlassHud.call(this);
    }

    setupGlassHud() {
      const _h = _getGesturesHud();
      if (_h && typeof _h.setupGlassHud === 'function') _h.setupGlassHud.call(this);
    }

    createHudButton(icon, title, onClick) {
      const _h = _getGesturesHud();
      if (_h && typeof _h.createHudButton === 'function') {
        return _h.createHudButton.call(this, icon, title, onClick);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = title;
      btn.textContent = icon;
      btn.onclick = onClick;
      return btn;
    }

    setupXRayTooltip() {
      const _h = _getGesturesHud();
      if (_h && typeof _h.setupXRayTooltip === 'function') _h.setupXRayTooltip.call(this);
    }

    showXRayPopup(pedId, svgX, svgY, pedNode = null) {
      const _h = _getGesturesHud();
      if (_h && typeof _h.showXRayPopup === 'function') _h.showXRayPopup.call(this, pedId, svgX, svgY, pedNode);
    }

    hideXRayPopup() {
      const _h = _getGesturesHud();
      if (_h && typeof _h.hideXRayPopup === 'function') _h.hideXRayPopup.call(this);
    }

    createTouchRipple(x, y) {
      const _h = _getGesturesHud();
      if (_h && typeof _h.createTouchRipple === 'function') _h.createTouchRipple.call(this, x, y);
    }

    // =========================================================================
    // Procedural WebAudio Sonification (Delegated to site-gestures-actions.js)
    // =========================================================================

    playAudioTone(frequency = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
      const _a = _getGesturesActions();
      if (_a && typeof _a.playAudioTone === 'function') _a.playAudioTone.call(this, frequency, type, duration, gainVal);
    }

    // =========================================================================
    // Live Simulation Parameters & Controls HUD Dock (Delegated to site-gestures-hud.js)
    // =========================================================================

    setupSimParametersHud() {
      const _h = _getGesturesHud();
      if (_h && typeof _h.setupSimParametersHud === 'function') _h.setupSimParametersHud.call(this);
    }

    /**
     * Registers a named universal key/skill action on this instance without editing core dispatch.
     */
    registerAction(name, handler) {
      if (name && typeof handler === 'function') {
        this._customActions.set(String(name), handler);
      }
      return this;
    }

    /**
     * Registers a declarative gesture skill primitive type on this instance.
     * spec: { enhance?(el, g, scene, vm), onPointerDown?(e, g, el, svgPt, scene, vm) }
     */
    registerGestureSkill(type, spec) {
      if (type && spec && typeof spec === 'object') {
        this._customGestureSkills.set(String(type), spec);
      }
      return this;
    }

    /**
     * Returns active switches, parsed player-gestures.ast primitives, and registered skills.
     */
    getCapabilities() {
      return {
        controls: { ...this.activeControls },
        defaults: { ...this.playerProfile.defaults },
        primitives: Array.isArray(this.playerProfile.primitives) ? [...this.playerProfile.primitives] : [],
        universalActions: Array.from(new Set([
          ...this.playerProfile.universalKeys.map(k => k.action).filter(Boolean),
          'step-slide',
          'goto-slide',
          'navigate',
          'load-cartridge',
          'toggle-bsl',
          'toggle-sound',
          'open-tutor',
          'set-render-mode',
          'site-directive',
          'toggle-xray',
          'toggle-audio',
          'reset-vars',
          ...Array.from(ASTDirectGestureSubsystem._customActions.keys()),
          ...Array.from(this._customActions.keys())
        ])),
        customGestureSkills: Array.from(new Set([
          ...Array.from(ASTDirectGestureSubsystem._customGestureSkills.keys()),
          ...Array.from(this._customGestureSkills.keys())
        ])),
        astSkills: this.playerProfile && this.playerProfile.skills instanceof Map
          ? Array.from(this.playerProfile.skills.keys())
          : []
      };
    }
  }

  ASTDirectGestureSubsystem._customActions = new Map();
  ASTDirectGestureSubsystem._customGestureSkills = new Map();

  ASTDirectGestureSubsystem.registerAction = function (name, handler) {
    if (name && typeof handler === 'function') {
      ASTDirectGestureSubsystem._customActions.set(String(name), handler);
    }
    return ASTDirectGestureSubsystem;
  };

  ASTDirectGestureSubsystem.registerGestureSkill = function (type, spec) {
    if (type && spec && typeof spec === 'object') {
      ASTDirectGestureSubsystem._customGestureSkills.set(String(type), spec);
    }
    return ASTDirectGestureSubsystem;
  };

  // Expose globally (maintaining backward compatibility with existing index.html bootstrap)
  global.ASTDirectGestureSubsystem = ASTDirectGestureSubsystem;
  global.ASTSiteGestures = ASTDirectGestureSubsystem;

})(typeof window !== 'undefined' ? window : globalThis);
