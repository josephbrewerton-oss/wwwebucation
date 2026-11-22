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

  function _getGesturesInput() {
    return global.ASTGesturesInput || (typeof window !== 'undefined' ? window.ASTGesturesInput : undefined);
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
      this.handleStageClick = this.handleStageClick.bind(this);
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
      const prof = _p && typeof _p.loadPlayerGesturesProfile === 'function' ? await _p.loadPlayerGesturesProfile.call(this) : this.playerProfile;
      if (this.engine && this.engine.scene && _p && typeof _p.expandSceneSkills === 'function') {
        const expanded = _p.expandSceneSkills.call(this, this.engine.scene, this.playerProfile && this.playerProfile.skills);
        if (expanded && typeof this.engine.mountSceneAsset === 'function' && this.container) {
          this.engine.mountSceneAsset(this.engine.scene, this.container);
          this._syncCartridgeControls();
        }
      }
      return prof;
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

    _parseSkillStepSexp(stepSexp) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._parseSkillStepSexp === 'function' ? _p._parseSkillStepSexp.call(this, stepSexp) : null;
    }

    _expandSkillStep(step, params) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._expandSkillStep === 'function' ? _p._expandSkillStep.call(this, step, params) : step;
    }

    _buildSceneSkillRegistry(scene, baseSkills) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._buildSceneSkillRegistry === 'function' ? _p._buildSceneSkillRegistry.call(this, scene, baseSkills) : new Map();
    }

    _resolveSkillDefinition(skillId, registry) {
      const _p = _getGesturesProfile();
      return _p && typeof _p._resolveSkillDefinition === 'function' ? _p._resolveSkillDefinition.call(this, skillId, registry) : null;
    }

    expandSceneSkills(scene, baseSkills) {
      const _p = _getGesturesProfile();
      return _p && typeof _p.expandSceneSkills === 'function' ? _p.expandSceneSkills.call(this, scene, baseSkills) : false;
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
          this._boundStageSvg.removeEventListener('click', this.handleStageClick);
        }
        this.stageSvg.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
        this.stageSvg.addEventListener('pointerleave', this.handlePointerLeave);
        this.stageSvg.addEventListener('click', this.handleStageClick, { passive: true });
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

    handleStageClick() {
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
      this._flushPendingTouchAudio(null);
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
    // Keyboard, Switch, Stage Enhancement & Pointer Drag Handlers (Delegated to site-gestures-input.js)
    // =========================================================================

    _handleCheckpointModalKeys(e) {
      const _i = _getGesturesInput();
      return _i && typeof _i._handleCheckpointModalKeys === 'function' ? _i._handleCheckpointModalKeys.call(this, e) : false;
    }

    _executeUniversalKeyRule(rule, scene) {
      const _i = _getGesturesInput();
      return _i && typeof _i._executeUniversalKeyRule === 'function' ? _i._executeUniversalKeyRule.call(this, rule, scene) : false;
    }

    handleKeyDown(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handleKeyDown === 'function') _i.handleKeyDown.call(this, e);
    }

    handleKeyUp(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handleKeyUp === 'function') _i.handleKeyUp.call(this, e);
    }

    handleWindowBlur() {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handleWindowBlur === 'function') _i.handleWindowBlur.call(this);
    }

    handlePointerLeave(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handlePointerLeave === 'function') _i.handlePointerLeave.call(this, e);
    }

    screenToSvg(clientX, clientY) {
      const _i = _getGesturesInput();
      return _i && typeof _i.screenToSvg === 'function' ? _i.screenToSvg.call(this, clientX, clientY) : { x: 0, y: 0 };
    }

    enhanceSceneInteractivity() {
      const _i = _getGesturesInput();
      if (_i && typeof _i.enhanceSceneInteractivity === 'function') _i.enhanceSceneInteractivity.call(this);
    }

    handlePointerDown(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handlePointerDown === 'function') _i.handlePointerDown.call(this, e);
    }

    handlePointerMove(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handlePointerMove === 'function') _i.handlePointerMove.call(this, e);
    }

    handlePointerUp(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handlePointerUp === 'function') _i.handlePointerUp.call(this, e);
    }

    handlePointerCancel(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handlePointerCancel === 'function') _i.handlePointerCancel.call(this, e);
    }

    handleTrackballDrag(e) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handleTrackballDrag === 'function') _i.handleTrackballDrag.call(this, e);
    }

    handleGenericDrag(target, svgPt) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handleGenericDrag === 'function') _i.handleGenericDrag.call(this, target, svgPt);
    }

    handleRotateDrag(target, svgPt) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handleRotateDrag === 'function') _i.handleRotateDrag.call(this, target, svgPt);
    }

    handleBindInputDrag(target, svgPt) {
      const _i = _getGesturesInput();
      if (_i && typeof _i.handleBindInputDrag === 'function') _i.handleBindInputDrag.call(this, target, svgPt);
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
          : [],
        astSkillGraph: this.playerProfile && this.playerProfile.skills instanceof Map
          ? Array.from(this.playerProfile.skills.keys()).map((id) => {
              const resolved = this._resolveSkillDefinition(id, this.playerProfile.skills);
              return {
                id,
                extends: resolved ? resolved.extends : [],
                chain: resolved ? resolved.chain : [id]
              };
            })
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
