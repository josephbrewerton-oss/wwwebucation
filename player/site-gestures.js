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

  const DEFAULT_CONTROLS = {
    'arrow-step': true,
    'num-jump': true,
    'scrub': true,
    'space-play': true,
    'quiz-keys': true,
    'whiteboard': true,
    'xray': true,
    'audio': true,
    'param-hud': true
  };

  const DEFAULT_UNIVERSAL_KEYS = [
    { code: 'ArrowRight', switch: 'arrow-step', action: 'step-primary-var', delta: 1, tone: 440 },
    { code: 'PageDown',   switch: 'arrow-step', action: 'step-primary-var', delta: 1, tone: 440 },
    { code: 'ArrowLeft',  switch: 'arrow-step', action: 'step-primary-var', delta: -1, tone: 440 },
    { code: 'PageUp',     switch: 'arrow-step', action: 'step-primary-var', delta: -1, tone: 440 },
    { code: 'Home',       switch: 'arrow-step', action: 'jump-primary-min', tone: 523 },
    { code: 'End',        switch: 'arrow-step', action: 'jump-primary-max', tone: 523 },
    { code: 'Digit1',     switch: 'num-jump',   action: 'set-primary-var', val: 1, tone: 440 },
    { code: 'Digit2',     switch: 'num-jump',   action: 'set-primary-var', val: 2, tone: 440 },
    { code: 'Digit3',     switch: 'num-jump',   action: 'set-primary-var', val: 3, tone: 440 },
    { code: 'Digit4',     switch: 'num-jump',   action: 'set-primary-var', val: 4, tone: 440 },
    { code: 'Digit5',     switch: 'num-jump',   action: 'set-primary-var', val: 5, tone: 440 },
    { code: 'Digit6',     switch: 'num-jump',   action: 'set-primary-var', val: 6, tone: 440 },
    { code: 'Digit7',     switch: 'num-jump',   action: 'set-primary-var', val: 7, tone: 440 },
    { code: 'Digit8',     switch: 'num-jump',   action: 'set-primary-var', val: 8, tone: 440 },
    { code: 'Digit9',     switch: 'num-jump',   action: 'set-primary-var', val: 9, tone: 440 },
    { code: 'Space',      switch: 'space-play', action: 'toggle-play' },
    { key: 'w',           switch: 'whiteboard', action: 'toggle-pen' }
  ];

  const DEFAULT_WHITEBOARD = {
    tools: [
      { id: 'pen',         icon: '✏️', title: 'Precision Pen (Smooth 2px-4px)', width: 3.5 },
      { id: 'marker',      icon: '🖍️', title: 'Whiteboard Marker (Rich 6px)', width: 6.0 },
      { id: 'highlighter', icon: '✨', title: 'Pedagogical Highlighter (Soft Glow 12px)', width: 12.0 },
      { id: 'eraser',      icon: '🧽', title: 'Smart Stroke Eraser', width: 24.0 }
    ],
    widths: [2.5, 5.5, 11.0],
    palette: [
      { hex: '#facc15', name: 'Gold' },
      { hex: '#38bdf8', name: 'Cyan' },
      { hex: '#4ade80', name: 'Green' },
      { hex: '#f43f5e', name: 'Red' },
      { hex: '#c084fc', name: 'Purple' },
      { hex: '#ffffff', name: 'White' },
      { hex: '#0f172a', name: 'Charcoal' }
    ]
  };

  const DEFAULT_TONES = {
    click:   { freq: 520, wave: 'sine',     duration: 0.04, gain: 0.10 },
    key:     { freq: 440, wave: 'triangle', duration: 0.04, gain: 0.12 },
    grab:    { freq: 380, wave: 'triangle', duration: 0.06, gain: 0.15 },
    release: { freq: 440, wave: 'sine',     duration: 0.05, gain: 0.15 },
    erase:   { freq: 220, wave: 'sine',     duration: 0.04, gain: 0.15 },
    undo:    { freq: 330, wave: 'sine',     duration: 0.05, gain: 0.15 },
    redo:    { freq: 523, wave: 'sine',     duration: 0.05, gain: 0.15 }
  };

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
      this.stageSvg = null;
      this.sceneRoot = null;
      this.inkRoot = null;
      this.hudRoot = null;
      this.xrayTooltip = null;

      // Player Gesture Profile & Active Cartridge Controls
      this.playerProfile = {
        defaults: { ...DEFAULT_CONTROLS },
        universalKeys: [...DEFAULT_UNIVERSAL_KEYS],
        whiteboard: {
          tools: [...DEFAULT_WHITEBOARD.tools],
          widths: [...DEFAULT_WHITEBOARD.widths],
          palette: [...DEFAULT_WHITEBOARD.palette]
        },
        tones: { ...DEFAULT_TONES }
      };
      this.activeControls = { ...DEFAULT_CONTROLS };
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
      this._activeHoldVars = new Map();
      this._holdRafId = null;
      this._holdLastTs = 0;
      // Bound listeners & extension registries
      this._boundStageSvg = null;
      this._windowListenersBound = false;
      this._customActions = new Map();
      this._customGestureSkills = new Map();

      // Bind methods
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      this.handlePointerCancel = this.handlePointerCancel.bind(this);
      this.handlePointerLeave = this.handlePointerLeave.bind(this);
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
          this.isDragging = false;
          this.dragTarget = null;
          this.dragMode = null;
          this._wasPlayingBeforeDrag = false;
          this.hideXRayPopup();
          setTimeout(() => {
            this._syncCartridgeControls();
            this.enhanceSceneInteractivity();
          }, 50);
        });
      }
    }

    // =========================================================================
    // player-gestures.ast Loader & Cartridge (:controls ...) Parser
    // =========================================================================

    async loadPlayerGesturesProfile() {
      if (this._profileLoaded) return this.playerProfile;
      const candidates = [
        this.options.gesturesAstUrl,
        SCRIPT_BASE_URL ? `${SCRIPT_BASE_URL}player-gestures.ast` : null,
        'player-gestures.ast',
        '/static/player/player-gestures.ast'
      ].filter(Boolean);

      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (res && res.ok) {
            const text = await res.text();
            if (text && text.includes(':player-gestures')) {
              this._parsePlayerGesturesAST(text);
              this._profileLoaded = true;
              return this.playerProfile;
            }
          }
        } catch {
          // Try next candidate or keep built-in fallbacks (offline / file:// safe)
        }
      }
      this._profileLoaded = true;
      return this.playerProfile;
    }

    _stripSexpComments(source) {
      if (!source || typeof source !== 'string') return '';
      let out = '';
      let inQuote = false;
      let escape = false;
      for (let i = 0; i < source.length; i++) {
        const ch = source[i];
        if (inQuote) {
          out += ch;
          if (escape) {
            escape = false;
          } else if (ch === '\\') {
            escape = true;
          } else if (ch === '"') {
            inQuote = false;
          }
          continue;
        }
        if (ch === '"') {
          inQuote = true;
          out += ch;
          continue;
        }
        if (ch === ';') {
          while (i < source.length && source[i] !== '\n') i++;
          if (i < source.length && source[i] === '\n') out += '\n';
          continue;
        }
        out += ch;
      }
      return out;
    }

    _extractSexpBlock(source, headToken) {
      if (!source || typeof source !== 'string' || !headToken) return null;
      const cleanSrc = this._stripSexpComments(source);
      const tokenBody = headToken.replace(/^\(/, '');
      const escapedBody = tokenBody.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const headRegex = new RegExp(`\\(\\s*${escapedBody}(?=[\\s)]|$)`, 'i');

      // Find first occurrence outside quotes
      let start = -1;
      let inQuote = false;
      let escape = false;
      for (let i = 0; i < cleanSrc.length; i++) {
        const ch = cleanSrc[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (!inQuote && ch === '(') {
          const slice = cleanSrc.slice(i, i + headToken.length + 12);
          if (headRegex.test(slice)) {
            start = i;
            break;
          }
        }
      }
      if (start === -1) return null;

      let depth = 0;
      inQuote = false;
      escape = false;
      for (let i = start; i < cleanSrc.length; i++) {
        const ch = cleanSrc[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (!inQuote) {
          if (ch === '(') depth++;
          else if (ch === ')') {
            depth--;
            if (depth === 0) return cleanSrc.slice(start, i + 1);
          }
        }
      }
      return null;
    }

    _extractChildSexps(block) {
      if (!block) return [];
      const results = [];
      let depth = 0;
      let inQuote = false;
      let escape = false;
      let childStart = -1;
      for (let i = 0; i < block.length; i++) {
        const ch = block[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (!inQuote) {
          if (ch === '(') {
            if (depth === 1) childStart = i;
            depth++;
          } else if (ch === ')') {
            depth--;
            if (depth === 1 && childStart !== -1) {
              results.push(block.slice(childStart, i + 1));
              childStart = -1;
            }
          }
        }
      }
      return results;
    }

    _parseKeywordAttrs(sexp) {
      const attrs = {};
      if (!sexp) return attrs;
      const clean = this._stripSexpComments(sexp)
        .replace(/^\(\s*:[a-zA-Z0-9_-]+/, '')
        .replace(/\)$/, '');
      const tokenRegex = /:([a-zA-Z0-9_-]+)\s+("(?:[^"\\]|\\.)*"|:[a-zA-Z0-9_-]+|true|false|-?\d+(?:\.\d+)?)/gi;
      let m;
      while ((m = tokenRegex.exec(clean)) !== null) {
        const k = m[1];
        const rawVal = m[2];
        const lowerVal = rawVal.toLowerCase();
        if (rawVal.startsWith('"')) attrs[k] = rawVal.slice(1, -1).replace(/\\"/g, '"');
        else if (lowerVal === ':on' || lowerVal === ':true' || lowerVal === 'true') attrs[k] = true;
        else if (lowerVal === ':off' || lowerVal === ':false' || lowerVal === 'false') attrs[k] = false;
        else if (rawVal.startsWith(':')) attrs[k] = rawVal.slice(1);
        else attrs[k] = Number(rawVal);
      }
      return attrs;
    }

    _parseControlsBlock(blockText) {
      const parsed = {};
      if (!blockText) return parsed;
      const clean = this._stripSexpComments(blockText);
      const pairRegex = /\(\s*:([a-zA-Z0-9_-]+)\s+(:on|:off|:true|:false|true|false)\s*\)/gi;
      let m;
      while ((m = pairRegex.exec(clean)) !== null) {
        const flag = m[1].toLowerCase();
        const valToken = m[2].toLowerCase();
        parsed[flag] = (valToken === ':on' || valToken === ':true' || valToken === 'true');
      }
      const plistBody = clean.replace(/^\(\s*:controls\b/i, '').replace(/\([^()]*\)/g, ' ');
      const plistRegex = /:([a-zA-Z0-9_-]+)\s+(:on|:off|:true|:false|true|false)(?=[\s)]|$)/gi;
      let pm;
      while ((pm = plistRegex.exec(plistBody)) !== null) {
        const flag = pm[1].toLowerCase();
        const valToken = pm[2].toLowerCase();
        parsed[flag] = (valToken === ':on' || valToken === ':true' || valToken === 'true');
      }
      return parsed;
    }

    _parsePlayerGesturesAST(astText) {
      const clean = this._stripSexpComments(astText);

      // 1. (:defaults ...)
      const defaultsBlock = this._extractSexpBlock(clean, '(:defaults');
      if (defaultsBlock) {
        this.playerProfile.defaults = {
          ...DEFAULT_CONTROLS,
          ...this._parseControlsBlock(defaultsBlock)
        };
      }

      // 2. (:primitives ...) metadata for runtime capability introspection
      const primBlock = this._extractSexpBlock(clean, '(:primitives');
      if (primBlock) {
        this.playerProfile.primitives = this._extractChildSexps(primBlock)
          .map(item => this._parseKeywordAttrs(item))
          .filter(p => p.type);
      }

      // 3. (:universal-keys ...)
      const keysBlock = this._extractSexpBlock(clean, '(:universal-keys');
      if (keysBlock) {
        const keyItems = this._extractChildSexps(keysBlock)
          .map(item => this._parseKeywordAttrs(item))
          .filter(k => k.code || k.key);
        if (keyItems.length > 0) {
          this.playerProfile.universalKeys = keyItems;
        }
      }

      // 4. (:whiteboard ...)
      const wbBlock = this._extractSexpBlock(clean, '(:whiteboard');
      if (wbBlock) {
        const toolsBlock = this._extractSexpBlock(wbBlock, '(:tools');
        if (toolsBlock) {
          const parsedTools = this._extractChildSexps(toolsBlock).map(t => {
            const a = this._parseKeywordAttrs(t);
            const fallback = DEFAULT_WHITEBOARD.tools.find(dt => dt.id === a.id);
            return {
              id: a.id || 'pen',
              icon: a.icon || (fallback ? fallback.icon : '✏️'),
              title: a.title || (fallback ? fallback.title : a.id),
              width: typeof a.width === 'number' ? a.width : 3.5,
              opacity: a.opacity,
              cap: a.cap,
              blend: a.blend
            };
          });
          if (parsedTools.length > 0) this.playerProfile.whiteboard.tools = parsedTools;
        }

        const widthsMatch = wbBlock.match(/\(:widths\s+\(([^)]+)\)\)/);
        if (widthsMatch) {
          const wList = widthsMatch[1].trim().split(/\s+/).map(Number).filter(n => !Number.isNaN(n));
          if (wList.length > 0) this.playerProfile.whiteboard.widths = wList;
        }

        const paletteBlock = this._extractSexpBlock(wbBlock, '(:palette');
        if (paletteBlock) {
          const parsedPalette = this._extractChildSexps(paletteBlock)
            .map(c => this._parseKeywordAttrs(c))
            .filter(c => c.hex);
          if (parsedPalette.length > 0) this.playerProfile.whiteboard.palette = parsedPalette;
        }
      }

      // 5. (:sonification ...)
      const sonBlock = this._extractSexpBlock(clean, '(:sonification');
      if (sonBlock) {
        const toneItems = this._extractChildSexps(sonBlock).map(t => this._parseKeywordAttrs(t));
        toneItems.forEach(t => {
          if (t.event && typeof t.freq === 'number') {
            this.playerProfile.tones[t.event] = {
              freq: t.freq,
              wave: t.wave || 'sine',
              duration: typeof t.duration === 'number' ? t.duration : 0.05,
              gain: typeof t.gain === 'number' ? t.gain : 0.12
            };
          }
        });
      }
    }

    _getRawCartridgeAst() {
      if (!this.engine) return '';
      const scene = this.engine.scene || {};
      return (
        scene.rawAst ||
        scene.astSource ||
        scene.source ||
        this.engine.rawAst ||
        this.engine.currentAstText ||
        this.engine.astText ||
        ''
      );
    }

    _syncCartridgeControls() {
      const merged = { ...this.playerProfile.defaults };
      const scene = this.engine && this.engine.scene;

      // 1. Check pre-parsed scene.controls if engine provides it
      if (scene && scene.controls && typeof scene.controls === 'object') {
        Object.entries(scene.controls).forEach(([k, v]) => {
          const key = k.replace(/^:/, '').toLowerCase();
          if (typeof v === 'boolean') merged[key] = v;
          else if (v === ':on' || v === 'on' || v === 'true') merged[key] = true;
          else if (v === ':off' || v === 'off' || v === 'false') merged[key] = false;
        });
      }

      // 2. Fallback: parse (:controls ...) directly from raw cartridge AST text
      const rawAst = this._getRawCartridgeAst();
      if (rawAst) {
        const ctrlBlock = this._extractSexpBlock(rawAst, '(:controls');
        if (ctrlBlock) {
          Object.assign(merged, this._parseControlsBlock(ctrlBlock));
        }
      }

      this.activeControls = merged;
      this._applyControlVisibility();
    }

    _isControlEnabled(flagName) {
      return this.activeControls[flagName] !== false;
    }

    _setElementControlVisibility(el, enabled) {
      if (!el) return;
      if (!enabled) {
        if (el.dataset.astCtlHidden !== '1') {
          el.dataset.astPrevDisplay = el.style.display || '';
          el.dataset.astCtlHidden = '1';
        }
        el.style.display = 'none';
      } else if (el.dataset.astCtlHidden === '1') {
        el.style.display = el.dataset.astPrevDisplay || '';
        delete el.dataset.astCtlHidden;
        delete el.dataset.astPrevDisplay;
      }
    }

    _applyControlVisibility() {
      const wbOn = this._isControlEnabled('whiteboard');
      const xrayOn = this._isControlEnabled('xray');
      const audioOn = this._isControlEnabled('audio');
      const paramHudOn = this._isControlEnabled('param-hud');
      const scrubOn = this._isControlEnabled('scrub');
      const spacePlayOn = this._isControlEnabled('space-play');
      const arrowStepOn = this._isControlEnabled('arrow-step');

      if (!wbOn && this.isPenActive) {
        this.togglePen(false);
      }
      if (!xrayOn && this.isXRayActive) {
        this.isXRayActive = false;
        this.hideXRayPopup();
      }
      this.sonificationEnabled = audioOn;

      const penBtn = document.getElementById('stage-hud-pen-btn');
      const xrayBtn = document.getElementById('stage-hud-xray-btn');
      const soundBtn = document.getElementById('stage-hud-sound-btn');
      const glassHud = document.getElementById('stage-glass-hud-ui');

      if (penBtn) penBtn.style.display = wbOn ? 'flex' : 'none';
      if (xrayBtn) {
        xrayBtn.style.display = xrayOn ? 'flex' : 'none';
        xrayBtn.style.background = this.isXRayActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)';
        xrayBtn.style.color = this.isXRayActive ? '#090d16' : '#ffffff';
      }
      if (soundBtn) {
        soundBtn.style.display = audioOn ? 'flex' : 'none';
        soundBtn.textContent = this.sonificationEnabled ? '🔊' : '🔇';
        soundBtn.style.opacity = this.sonificationEnabled ? '1.0' : '0.5';
      }
      if (glassHud) {
        glassHud.style.display = (wbOn || xrayOn || audioOn) ? 'flex' : 'none';
      }

      // Sync outer host player chrome controls with active :controls flags
      this._setElementControlVisibility(document.getElementById('btn-pen'), wbOn);
      this._setElementControlVisibility(document.getElementById('scrubber-box'), scrubOn);
      this._setElementControlVisibility(document.getElementById('btn-play'), spacePlayOn);
      this._setElementControlVisibility(document.getElementById('btn-header-play'), spacePlayOn);
      this._setElementControlVisibility(document.getElementById('btn-prev'), arrowStepOn);
      this._setElementControlVisibility(document.getElementById('btn-next'), arrowStepOn);

      const paramHud = document.getElementById('stage-sim-parameters');
      if (paramHud && !paramHudOn) {
        paramHud.style.display = 'none';
      }
    }

    _playNamedTone(eventName) {
      const t = this.playerProfile.tones[eventName] || DEFAULT_TONES[eventName];
      if (t) {
        this.playAudioTone(t.freq, t.wave, t.duration, t.gain);
      }
    }

    /**
     * Normalizes cartridge gesture dictionaries so both older (:clickable / :setVar)
     * and newer (:interactive / :action "set-var") syntaxes work identically.
     */
    _normalizeGesture(g) {
      if (!g || typeof g !== 'object') return g;
      const norm = { ...g };

      if (norm.type === 'interactive') {
        norm.type = 'clickable';
      }
      if (norm.action === 'set-var') {
        if (!norm.setVar && norm.var) norm.setVar = norm.var;
        if (norm.val === undefined && norm.value !== undefined) norm.val = norm.value;
      } else if (norm.action === 'step-var') {
        if (!norm.stepVar && norm.var) norm.stepVar = norm.var;
        if (norm.delta === undefined && norm.step !== undefined && typeof norm.step === 'number') {
          norm.delta = norm.step;
        }
      } else if (norm.action === 'toggle-var') {
        if (!norm.toggleVar && norm.var) norm.toggleVar = norm.var;
      }

      const ifExpr = norm.ifExpr !== undefined ? norm.ifExpr : norm.if;
      if (ifExpr !== undefined && norm.ifExpr === undefined) {
        norm.ifExpr = ifExpr;
      }
      if (norm.valExpr === undefined && norm['val-expr'] !== undefined) norm.valExpr = norm['val-expr'];
      if (norm.toneExpr === undefined && norm['tone-expr'] !== undefined) norm.toneExpr = norm['tone-expr'];
      if (norm.speakExpr === undefined && norm['speak-expr'] !== undefined) norm.speakExpr = norm['speak-expr'];
      if (norm.speakRateVar === undefined && norm['speak-rate-var'] !== undefined) norm.speakRateVar = norm['speak-rate-var'];
      if (norm.speakPitch === undefined && norm['speak-pitch'] !== undefined) norm.speakPitch = norm['speak-pitch'];

      return norm;
    }

    _getNormalizedSceneGestures(scene) {
      if (!scene || !Array.isArray(scene.gestures)) return [];
      return scene.gestures.map(g => this._normalizeGesture(g));
    }

    /**
     * Finds the primary discrete stepped variable (:step 1) in the active scene
     */
    _findPrimarySteppedVar(scene) {
      if (!scene || !scene.vars || typeof scene.vars !== 'object') return null;
      const entries = Object.entries(scene.vars);

      // 1. Prefer explicit numeric variable with :step 1
      for (const [name, meta] of entries) {
        if (meta && typeof meta === 'object' && meta.step === 1 && typeof meta.min === 'number' && typeof meta.max === 'number') {
          return { name, min: meta.min, max: meta.max, step: 1 };
        }
      }

      // 2. Fallback to any bounded integer variable
      for (const [name, meta] of entries) {
        if (meta && typeof meta === 'object' && typeof meta.min === 'number' && typeof meta.max === 'number') {
          return { name, min: meta.min, max: meta.max, step: typeof meta.step === 'number' ? meta.step : 1 };
        }
      }

      return null;
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
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleWindowBlur);

        window.addEventListener('message', (ev) => {
          if (!ev.data) return;
          const isInkCmd = (
            ev.data.type === 'IMPORT_WHITEBOARD_INK' ||
            ev.data.type === 'LOAD_WHITEBOARD_INK' ||
            ev.data.type === 'CLEAR_WHITEBOARD_INK' ||
            ev.data.type === 'UNDO_WHITEBOARD_INK' ||
            ev.data.type === 'REDO_WHITEBOARD_INK' ||
            ev.data.type === 'EXPORT_WHITEBOARD_INK' ||
            ev.data.type === 'TOGGLE_PEN'
          );
          if (isInkCmd && !this._isControlEnabled('whiteboard')) return;

          if (ev.data.type === 'IMPORT_WHITEBOARD_INK' || ev.data.type === 'LOAD_WHITEBOARD_INK') {
            const raw = ev.data.data || ev.data.ast || ev.data.json;
            if (typeof raw === 'string') {
              if (raw.trim().startsWith('(')) {
                this.importInkFromAST(raw);
              } else {
                try {
                  this.importInkFromJSON(JSON.parse(raw));
                } catch {
                  this.importInkFromAST(raw);
                }
              }
            } else if (typeof raw === 'object') {
              this.importInkFromJSON(raw);
            }
            this.showFloatingNotice('📥 Whiteboard ink loaded!');
          } else if (ev.data.type === 'CLEAR_WHITEBOARD_INK') {
            this.clearWhiteboardInk();
          } else if (ev.data.type === 'UNDO_WHITEBOARD_INK') {
            this.undoLastStroke();
          } else if (ev.data.type === 'REDO_WHITEBOARD_INK') {
            this.redoLastStroke();
          } else if (ev.data.type === 'EXPORT_WHITEBOARD_INK') {
            this.broadcastInkSession();
          } else if (ev.data.type === 'TOGGLE_PEN') {
            this.togglePen(typeof ev.data.enabled === 'boolean' ? ev.data.enabled : undefined);
          }
        });
      }
    }

    _resolveVarBounds(scene, g, varName) {
      const vMeta = scene && scene.vars && scene.vars[varName];
      const min = typeof g.min === 'number' ? g.min : (vMeta && typeof vMeta.min === 'number' ? vMeta.min : -Infinity);
      const max = typeof g.max === 'number' ? g.max : (vMeta && typeof vMeta.max === 'number' ? vMeta.max : Infinity);
      return { min, max };
    }

    _resolveHoldReleaseValue(scene, g, holdVarName) {
      if (g && g.releaseVal !== undefined) return g.releaseVal;
      const vMeta = scene && scene.vars && scene.vars[holdVarName];
      if (vMeta && typeof vMeta === 'object' && vMeta.defaultValue !== undefined) {
        return vMeta.defaultValue;
      }
      const cur = this.engine && this.engine.vars ? this.engine.vars[holdVarName] : undefined;
      return typeof cur === 'boolean' ? false : 0;
    }

    _writeEngineVar(varName, value) {
      if (!this.engine || !varName) return;
      if (typeof this.engine.setVar === 'function') {
        this.engine.setVar(varName, value);
      } else if (this.engine.vars) {
        this.engine.vars[varName] = value;
      }
    }

    _speakGestureText(rawText, opts = {}) {
      if (!this._isControlEnabled('audio')) return;
      if (!rawText || !this.engine) return;
      const text = String(rawText).trim();
      if (!text) return;
      if (typeof this.engine.speak === 'function') {
        this.engine.speak(text, opts);
      } else if (typeof this.engine.speakText === 'function') {
        this.engine.speakText(text, opts);
      }
    }

    _readMatchedElementAttr(g, matchedEl) {
      if (matchedEl && g.attr && matchedEl.hasAttribute(g.attr)) {
        const rawAttr = matchedEl.getAttribute(g.attr);
        return (rawAttr !== '' && !isNaN(Number(rawAttr))) ? Number(rawAttr) : rawAttr;
      }
      return undefined;
    }

    _evalGestureExpr(exprText, matchedEl, attrVal, asReturnValue = true) {
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

    _evalConditionExpr(condExpr, matchedEl, attrVal) {
      if (!condExpr) return true;
      try {
        return Boolean(this._evalGestureExpr(condExpr, matchedEl, attrVal, true));
      } catch (err) {
        console.warn('[SiteGestures] Condition :if error:', condExpr, err);
        return false;
      }
    }

    _applyGesturePress(g, matchedEl, scene) {
      if (!this.engine || !this.engine.vars) return false;
      const attrVal = this._readMatchedElementAttr(g, matchedEl);
      const condExpr = g.ifExpr !== undefined ? g.ifExpr : g.if;
      if (condExpr && !this._evalConditionExpr(condExpr, matchedEl, attrVal)) {
        return false;
      }

      let changed = false;
      let exprConsumedBySetVar = false;

      const toggleKey = g.toggleVar || g.toggle;
      const setKey = g.setVar || g.set || (g.var && (g.val !== undefined || g.valExpr !== undefined || g.expr !== undefined || attrVal !== undefined) ? g.var : null);
      const stepKey = g.stepVar || (typeof g.step === 'string' ? g.step : null) || (!setKey && g.var && g.delta !== undefined ? g.var : null);
      const holdKey = g.holdVar;

      if (toggleKey) {
        this._writeEngineVar(toggleKey, !this.engine.vars[toggleKey]);
        changed = true;
      }
      if (setKey) {
        let val = g.val;
        if (attrVal !== undefined) {
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
      if (toneSpec && typeof this.playAudioTone === 'function') {
        String(toneSpec).split(',').forEach((freq, idx) => {
          const hz = parseFloat(freq.trim());
          if (!Number.isNaN(hz)) {
            setTimeout(() => this.playAudioTone(hz, 'sine', 0.12, 0.2), idx * 70);
          }
        });
      }

      let speakText = g.speak;
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
        this._speakGestureText(speakText, speechOpts);
      }

      return changed;
    }

    _applyContinuousGestureStep(g, scene, dtSec, matchedEl = null) {
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

    _releaseHoldForGesture(g) {
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

    _releasePointerEntry(pointerId) {
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

    _releaseAllHeldInputs(resetHoldVars = true) {
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

    _ensureHoldLoop() {
      if (this._holdRafId !== null) return;
      if (this._heldKeys.size === 0 && this._heldPointerEntries.size === 0) return;
      if (typeof requestAnimationFrame === 'undefined') return;
      this._holdLastTs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this._holdRafId = requestAnimationFrame(this._runHoldLoop);
    }

    _stopHoldLoop() {
      if (this._holdRafId !== null && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this._holdRafId);
      }
      this._holdRafId = null;
      this._holdLastTs = 0;
    }

    _runHoldLoop(ts) {
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

    _gestureMatchesKey(g, e) {
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

    _ensureInteractiveSimPlaying() {
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
        e.preventDefault();
        this._ensureInteractiveSimPlaying();
        let needsHoldLoop = false;
        let hasCustomTone = false;

        for (let i = 0; i < matchedPointerGestures.length; i++) {
          const g = matchedPointerGestures[i];
          if (g.tone || g.toneExpr) hasCustomTone = true;
          this._applyGesturePress(g, matchedEls[i], scene);
          if (g.type === 'holdable' || g.hold === true || g.holdVar || g.stepVar || typeof g.step === 'string') {
            needsHoldLoop = true;
          }
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
          this._playNamedTone('click');
        }
        this.createTouchRipple(svgPt.x, svgPt.y);
        return;
      }

      // B2. Drag / Scrubbing Targets (gated by :scrub switch)
      if (this._isControlEnabled('scrub')) {
        const activeTrackball = gestures.find(g => {
          if (g.type !== 'trackball' || !g.target) return false;
          if (this.isXRayActive && this._isControlEnabled('xray') && e.target.closest('[data-pedagogical]')) return false;
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

          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }
      }

      // C. Pedagogical X-Ray Tap Inspection (gated by :xray switch)
      if (this.isXRayActive && this._isControlEnabled('xray')) {
        const pedNode = e.target.closest('[data-pedagogical]');
        if (pedNode) {
          this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y, pedNode);
        }
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
    // Whiteboard & Stylus Pen Ink Drawing Layer (Driven by player-gestures.ast)
    // =========================================================================

    startInkStroke(pt) {
      if (!this.inkRoot) return;
      const x = Number(pt.x.toFixed(1));
      const y = Number(pt.y.toFixed(1));
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', this.currentInkColor);
      path.setAttribute('stroke-width', this.currentInkWidth.toString());

      const toolCfg = this.playerProfile.whiteboard.tools.find(t => t.id === this.currentTool);
      if (this.currentTool === 'highlighter') {
        path.setAttribute('stroke-opacity', String(toolCfg && toolCfg.opacity !== undefined ? toolCfg.opacity : 0.45));
        path.setAttribute('stroke-linecap', (toolCfg && toolCfg.cap) || 'square');
        path.setAttribute('stroke-linejoin', 'bevel');
        path.style.mixBlendMode = (toolCfg && toolCfg.blend) || 'multiply';
      } else if (this.currentTool === 'marker') {
        path.setAttribute('stroke-linecap', (toolCfg && toolCfg.cap) || 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-opacity', String(toolCfg && toolCfg.opacity !== undefined ? toolCfg.opacity : 0.92));
      } else {
        path.setAttribute('stroke-linecap', (toolCfg && toolCfg.cap) || 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-opacity', String(toolCfg && toolCfg.opacity !== undefined ? toolCfg.opacity : 1.0));
      }

      path.setAttribute('d', `M ${x} ${y} `);

      this.inkRoot.appendChild(path);
      const strokeObj = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        element: path,
        tool: this.currentTool || 'pen',
        color: this.currentInkColor,
        width: this.currentInkWidth,
        d: `M ${x} ${y} `,
        points: [{ x, y }],
        lastX: pt.x,
        lastY: pt.y
      };
      this.currentStroke = strokeObj;
      this.strokes.push(strokeObj);
      this._undoStack = [];
    }

    continueInkStroke(pt) {
      if (!this.currentStroke) return;
      const x = Number(pt.x.toFixed(1));
      const y = Number(pt.y.toFixed(1));
      const midX = (this.currentStroke.lastX + pt.x) / 2;
      const midY = (this.currentStroke.lastY + pt.y) / 2;
      this.currentStroke.d += `Q ${this.currentStroke.lastX.toFixed(1)} ${this.currentStroke.lastY.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)} `;
      this.currentStroke.element.setAttribute('d', this.currentStroke.d);
      this.currentStroke.points.push({ x, y });
      this.currentStroke.lastX = pt.x;
      this.currentStroke.lastY = pt.y;
    }

    endInkStroke() {
      if (!this.currentStroke) return;
      this.currentStroke = null;
      this.persistInkToSession();
    }

    eraseStrokeAt(pt) {
      if (!this.inkRoot || this.strokes.length === 0) return;
      const eraseRadius = Math.max(16, this.currentInkWidth * 2.5);
      const eraseRadiusSq = eraseRadius * eraseRadius;

      let erasedAny = false;
      for (let i = this.strokes.length - 1; i >= 0; i--) {
        const s = this.strokes[i];
        if (!s || !s.points) continue;

        let hit = false;
        for (let j = 0; j < s.points.length; j++) {
          const p = s.points[j];
          const dx = p.x - pt.x;
          const dy = p.y - pt.y;
          if (dx * dx + dy * dy <= eraseRadiusSq) {
            hit = true;
            break;
          }
        }

        if (hit) {
          const removed = this.strokes.splice(i, 1)[0];
          if (removed && removed.element && removed.element.parentNode) {
            removed.element.parentNode.removeChild(removed.element);
          }
          if (!this._undoStack) this._undoStack = [];
          this._undoStack.push(removed);
          erasedAny = true;
        }
      }

      if (erasedAny) {
        this.persistInkToSession();
        this._playNamedTone('erase');
      }
    }

    undoLastStroke() {
      if (!this.inkRoot || this.strokes.length === 0) return;
      const last = this.strokes.pop();
      if (last) {
        const el = last.element || (last instanceof Element ? last : null);
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
        if (!this._undoStack) this._undoStack = [];
        this._undoStack.push(last);
      }
      this.persistInkToSession();
      this._playNamedTone('undo');
    }

    redoLastStroke() {
      if (!this.inkRoot || !this._undoStack || this._undoStack.length === 0) return;
      const restored = this._undoStack.pop();
      if (restored) {
        if (restored.element) {
          this.inkRoot.appendChild(restored.element);
        }
        this.strokes.push(restored);
        this.persistInkToSession();
        this._playNamedTone('redo');
      }
    }

    clearWhiteboardInk() {
      if (!this.inkRoot) return;
      if (this.strokes.length > 0) {
        if (!this._undoStack) this._undoStack = [];
        this._undoStack.push(...this.strokes);
      }
      if (typeof this.inkRoot.replaceChildren === 'function') this.inkRoot.replaceChildren();
      else this.inkRoot.textContent = '';
      this.strokes = [];
      this.persistInkToSession();
      this.playAudioTone(440, 'triangle', 0.1);
    }

    exportInkToAST(options = {}) {
      const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard-session';
      const timestamp = Date.now();
      const strokeLines = [];

      for (let i = 0; i < this.strokes.length; i++) {
        const s = this.strokes[i];
        const color = s.color || (s.element && s.element.getAttribute('stroke')) || this.currentInkColor;
        const width = s.width || (s.element && parseFloat(s.element.getAttribute('stroke-width'))) || this.currentInkWidth;
        const d = (s.d || (s.element && s.element.getAttribute('d')) || '').trim();
        const pts = s.points || [];
        const ptsStr = pts.map(p => `(${p.x.toFixed(1)} ${p.y.toFixed(1)})`).join(' ');

        strokeLines.push(`    (:ink-stroke :color "${color}" :width ${width} :d "${d}" :points (${ptsStr}))`);
      }

      if (options.bareStrokes) {
        return strokeLines.join('\n');
      }

      return `(:ink-session
  :scene-id "${sceneId}"
  :timestamp ${timestamp}
  :stroke-count ${this.strokes.length}
  (:strokes (
${strokeLines.join('\n')}
  ))
)`;
    }

    importInkFromAST(astString, options = {}) {
      if (!astString || typeof astString !== 'string') return 0;
      if (!this.inkRoot) this.setupDomLayers();
      if (!this.inkRoot) return 0;

      if (options.clearExisting !== false) {
        if (typeof this.inkRoot.replaceChildren === 'function') this.inkRoot.replaceChildren();
        else this.inkRoot.textContent = '';
        this.strokes = [];
      }

      let importedCount = 0;
      const strokeBlocks = [];
      let pos = 0;
      while ((pos = astString.indexOf('(:ink-stroke', pos)) !== -1) {
        let depth = 0;
        let inQuote = false;
        let escape = false;
        let end = pos;
        for (let i = pos; i < astString.length; i++) {
          const ch = astString[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\') { escape = true; continue; }
          if (ch === '"') { inQuote = !inQuote; continue; }
          if (!inQuote) {
            if (ch === '(') depth++;
            else if (ch === ')') {
              depth--;
              if (depth === 0) {
                end = i + 1;
                break;
              }
            }
          }
        }
        if (end > pos) {
          strokeBlocks.push(astString.slice(pos, end));
          pos = end;
        } else {
          pos += 12;
        }
      }

      for (let b = 0; b < strokeBlocks.length; b++) {
        const body = strokeBlocks[b];

        const colorMatch = body.match(/:color\s+"([^"]+)"/);
        const color = colorMatch ? colorMatch[1] : '#facc15';

        const widthMatch = body.match(/:width\s+([0-9.]+)/);
        const width = widthMatch ? parseFloat(widthMatch[1]) : 3.5;

        const dMatch = body.match(/:d\s+"([^"]+)"/);
        let d = dMatch ? dMatch[1] : '';

        const pointsIdx = body.indexOf(':points');
        const points = [];
        if (pointsIdx !== -1) {
          const afterPoints = body.slice(pointsIdx + 7).trim();
          if (afterPoints.startsWith('(')) {
            let depth = 0;
            let pointsContent = '';
            for (let i = 0; i < afterPoints.length; i++) {
              if (afterPoints[i] === '(') depth++;
              else if (afterPoints[i] === ')') depth--;
              pointsContent += afterPoints[i];
              if (depth === 0) break;
            }
            const ptRegex = /\(\s*([0-9.-]+)\s+([0-9.-]+)\s*\)/g;
            let ptMatch;
            while ((ptMatch = ptRegex.exec(pointsContent)) !== null) {
              points.push({ x: parseFloat(ptMatch[1]), y: parseFloat(ptMatch[2]) });
            }
          }
        }

        if (!d && points.length > 0) {
          d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} `;
          for (let p = 1; p < points.length; p++) {
            const prev = points[p - 1];
            const cur = points[p];
            const midX = (prev.x + cur.x) / 2;
            const midY = (prev.y + cur.y) / 2;
            d += `Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)} `;
          }
        }

        if (d) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', color);
          path.setAttribute('stroke-width', width.toString());
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('d', d);

          this.inkRoot.appendChild(path);

          const strokeObj = {
            id: `stroke_imported_${Date.now()}_${importedCount}`,
            element: path,
            color,
            width,
            d,
            points: points.length > 0 ? points : [],
            lastX: points.length > 0 ? points[points.length - 1].x : 0,
            lastY: points.length > 0 ? points[points.length - 1].y : 0
          };
          this.strokes.push(strokeObj);
          importedCount++;
        }
      }

      this.persistInkToSession();
      if (importedCount > 0) {
        this.playAudioTone(784, 'sine', 0.08);
      }
      return importedCount;
    }

    exportInkToJSON() {
      const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard-session';
      return {
        type: 'AST_INK_SESSION',
        sceneId,
        timestamp: Date.now(),
        strokeCount: this.strokes.length,
        strokes: this.strokes.map(s => ({
          color: s.color || '#facc15',
          width: s.width || 3.5,
          d: s.d || '',
          points: s.points || []
        }))
      };
    }

    importInkFromJSON(data, options = {}) {
      if (!data || !data.strokes || !Array.isArray(data.strokes)) return 0;
      if (!this.inkRoot) this.setupDomLayers();
      if (!this.inkRoot) return 0;

      if (options.clearExisting !== false) {
        if (typeof this.inkRoot.replaceChildren === 'function') this.inkRoot.replaceChildren();
        else this.inkRoot.textContent = '';
        this.strokes = [];
      }

      let count = 0;
      data.strokes.forEach(s => {
        let d = s.d || '';
        const pts = s.points || [];
        if (!d && pts.length > 0) {
          d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} `;
          for (let p = 1; p < pts.length; p++) {
            const prev = pts[p - 1];
            const cur = pts[p];
            const midX = (prev.x + cur.x) / 2;
            const midY = (prev.y + cur.y) / 2;
            d += `Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)} `;
          }
        }

        if (d) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', s.color || '#facc15');
          path.setAttribute('stroke-width', (s.width || 3.5).toString());
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('d', d);

          this.inkRoot.appendChild(path);
          this.strokes.push({
            id: `stroke_json_${Date.now()}_${count}`,
            element: path,
            color: s.color || '#facc15',
            width: s.width || 3.5,
            d,
            points: pts,
            lastX: pts.length > 0 ? pts[pts.length - 1].x : 0,
            lastY: pts.length > 0 ? pts[pts.length - 1].y : 0
          });
          count++;
        }
      });

      this.persistInkToSession();
      if (count > 0) {
        this.playAudioTone(784, 'sine', 0.08);
      }
      return count;
    }

    broadcastInkSession() {
      const ast = this.exportInkToAST();
      const json = this.exportInkToJSON();
      const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard-session';

      const payload = {
        type: 'AST_WHITEBOARD_INK_BROADCAST',
        sceneId,
        inkAst: ast,
        inkJson: json,
        timestamp: Date.now()
      };

      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(payload, '*');
        }
      } catch {}

      window.dispatchEvent(new CustomEvent('ast-ink-broadcast', { detail: payload }));
      this.showFloatingNotice(`📡 Broadcasted ${this.strokes.length} strokes to Class Mesh!`);
      this.playAudioTone(880, 'sine', 0.1);
    }

    persistInkToSession() {
      const store = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
      if (!store) return;
      try {
        const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard';
        const key = `stj_whiteboard_ink_${sceneId}`;
        if (this.strokes.length === 0) {
          store.removeItem(key);
        } else {
          store.setItem(key, JSON.stringify(this.exportInkToJSON()));
        }
      } catch {}
    }

    restoreInkFromSession() {
      this.strokes = [];
      this._undoStack = [];
      if (this.inkRoot) {
        this.inkRoot.replaceChildren();
      }
      const store = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
      if (!store) return;
      const applyRestore = () => {
        try {
          const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard';
          const key = `stj_whiteboard_ink_${sceneId}`;
          const stored = store.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            this.importInkFromJSON(parsed, { clearExisting: true });
          }
        } catch {}
      };
      if (store.ready && typeof store.isReady === 'function' && !store.isReady()) {
        store.ready.then(applyRestore);
      } else {
        applyRestore();
      }
    }

    showFloatingNotice(message) {
      const container = (this.stageSvg && this.stageSvg.parentNode) || document.body;
      let toast = container.querySelector('#stage-ink-notice');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'stage-ink-notice';
        toast.style.cssText = `
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #f8fafc;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          z-index: 50;
          pointer-events: none;
          transition: opacity 0.25s ease, transform 0.25s ease;
        `;
        container.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';

      clearTimeout(this._inkNoticeTimer);
      this._inkNoticeTimer = setTimeout(() => {
        if (toast) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(-50%) translateY(-8px)';
        }
      }, 2500);
    }

    togglePen(forceState) {
      const wbAllowed = this._isControlEnabled('whiteboard');
      if (forceState !== false && !wbAllowed) return;

      const prevActive = this.isPenActive;
      this.isPenActive = (forceState !== undefined) ? Boolean(forceState) : !this.isPenActive;
      const penBtn = document.getElementById('stage-hud-pen-btn');
      if (penBtn) {
        penBtn.style.background = this.isPenActive ? '#eab308' : 'rgba(255, 255, 255, 0.08)';
        penBtn.style.color = this.isPenActive ? '#090d16' : '#ffffff';
      }
      const headerPen = document.getElementById('btn-pen');
      if (headerPen) {
        headerPen.classList.toggle('active', this.isPenActive);
      }
      if (this.stageSvg) {
        this.stageSvg.style.cursor = this.isPenActive ? (this.currentTool === 'eraser' ? 'cell' : 'crosshair') : 'default';
      }

      const penTools = document.getElementById('stage-hud-pen-tools');
      const penPalette = document.getElementById('stage-hud-pen-palette');
      const penWidths = document.getElementById('stage-hud-pen-widths');
      const inkExtraActions = document.getElementById('stage-hud-ink-actions');
      const clearBtn = document.getElementById('stage-hud-clear-btn');

      const displayVal = this.isPenActive ? 'flex' : 'none';
      if (penTools) penTools.style.display = displayVal;
      if (penPalette) penPalette.style.display = displayVal;
      if (penWidths) penWidths.style.display = displayVal;
      if (inkExtraActions) inkExtraActions.style.display = displayVal;
      if (clearBtn) clearBtn.style.display = displayVal;

      if (wbAllowed && this.isPenActive !== prevActive) {
        this.playAudioTone(this.isPenActive ? 660 : 440, 'sine', 0.06);
        this.showFloatingNotice(this.isPenActive ? '🖊️ Whiteboard Marker Active' : 'Whiteboard Inactive');
      }
    }

    // =========================================================================
    // Stage-Embedded Glass HUD Floating Bar (Built from player-gestures.ast)
    // =========================================================================

    _rebuildGlassHud() {
      const container = this.stageSvg && this.stageSvg.parentNode;
      if (!container) return;
      const existing = container.querySelector('#stage-glass-hud-ui');
      if (existing) existing.remove();
      this.setupGlassHud();
    }

    setupGlassHud() {
      const container = this.stageSvg.parentNode;
      if (!container || container.querySelector('#stage-glass-hud-ui')) return;

      const hud = document.createElement('div');
      hud.id = 'stage-glass-hud-ui';
      hud.style.cssText = `
        position: absolute;
        bottom: 58px;
        right: 14px;
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        padding: 5px 8px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
        z-index: 30;
        user-select: none;
      `;

      // 1. Tool Selection Pills (from player-gestures.ast :whiteboard :tools)
      const penTools = document.createElement('div');
      penTools.id = 'stage-hud-pen-tools';
      penTools.style.cssText = 'display:none; align-items:center; gap:3px; margin-right:3px;';
      const tools = this.playerProfile.whiteboard.tools;
      const toolBtns = [];
      tools.forEach(t => {
        const btn = this.createHudButton(t.icon, t.title || t.id, () => {
          this.currentTool = t.id;
          this.currentInkWidth = t.width;
          this.stageSvg.style.cursor = (t.id === 'eraser') ? 'cell' : 'crosshair';
          toolBtns.forEach(b => {
            b.el.style.background = (b.id === t.id) ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)';
            b.el.style.borderColor = (b.id === t.id) ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
          });
          this.playAudioTone(t.id === 'eraser' ? 330 : 600, 'sine', 0.04);
        });
        if (t.id === this.currentTool) {
          btn.style.background = 'rgba(56, 189, 248, 0.3)';
          btn.style.borderColor = '#38bdf8';
        }
        toolBtns.push({ id: t.id, el: btn });
        penTools.appendChild(btn);
      });

      // 2. Stroke Thickness Pills (from player-gestures.ast :whiteboard :widths)
      const penWidths = document.createElement('div');
      penWidths.id = 'stage-hud-pen-widths';
      penWidths.style.cssText = 'display:none; align-items:center; gap:3px; margin-right:3px;';
      const widthValues = this.playerProfile.whiteboard.widths;
      const widthLabels = ['•', '●', '■'];
      const widthTitles = ['Fine Stroke', 'Medium Stroke', 'Broad Stroke'];
      const widthBtns = [];
      widthValues.forEach((w, idx) => {
        const label = widthLabels[idx] || '●';
        const title = widthTitles[idx] || `Stroke ${w}px`;
        const btn = this.createHudButton(label, title, () => {
          this.currentInkWidth = w;
          widthBtns.forEach(wb => {
            wb.el.style.borderColor = (wb.w === w) ? '#facc15' : 'rgba(255, 255, 255, 0.12)';
            wb.el.style.color = (wb.w === w) ? '#facc15' : '#f8fafc';
          });
          this.playAudioTone(700, 'triangle', 0.03);
        });
        btn.style.fontSize = w > 8 ? '16px' : (w > 4 ? '13px' : '10px');
        widthBtns.push({ w, el: btn });
        penWidths.appendChild(btn);
      });

      // 3. Smartboard Palette Pills (from player-gestures.ast :whiteboard :palette)
      const penPalette = document.createElement('div');
      penPalette.id = 'stage-hud-pen-palette';
      penPalette.style.cssText = 'display:none; align-items:center; gap:4px; margin-right:4px;';
      const colors = this.playerProfile.whiteboard.palette;
      colors.forEach(col => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.title = col.name || col.hex;
        dot.style.cssText = `width:18px; height:18px; border-radius:50%; background:${col.hex}; border:1.5px solid rgba(255,255,255,0.45); cursor:pointer; padding:0; transition: transform 0.12s ease;`;
        dot.onmouseenter = () => dot.style.transform = 'scale(1.25)';
        dot.onmouseleave = () => dot.style.transform = 'scale(1.0)';
        dot.onclick = () => {
          this.currentInkColor = col.hex;
          if (this.currentTool === 'eraser') {
            this.currentTool = 'pen';
            this.stageSvg.style.cursor = 'crosshair';
            toolBtns.forEach(b => {
              b.el.style.background = (b.id === 'pen') ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)';
              b.el.style.borderColor = (b.id === 'pen') ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
            });
          }
          this.playAudioTone(587, 'sine', 0.03);
        };
        penPalette.appendChild(dot);
      });

      // 4. Whiteboard Utility Actions
      const inkExtraActions = document.createElement('div');
      inkExtraActions.id = 'stage-hud-ink-actions';
      inkExtraActions.style.cssText = 'display:none; align-items:center; gap:3px; margin-right:4px;';

      const undoBtn = this.createHudButton('↩️', 'Undo Last Stroke (Ctrl+Z)', () => this.undoLastStroke());
      const redoBtn = this.createHudButton('↪️', 'Redo Stroke (Ctrl+Y)', () => this.redoLastStroke());

      const palmBtn = this.createHudButton('🖐️', 'Stylus-Only Palm Rejection (Ignore Touch Gestures While Writing)', () => {
        this.stylusOnlyMode = !this.stylusOnlyMode;
        palmBtn.style.background = this.stylusOnlyMode ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)';
        palmBtn.style.color = this.stylusOnlyMode ? '#090d16' : '#ffffff';
        this.showFloatingNotice(this.stylusOnlyMode ? '🖐️ Stylus-Only Active (Finger Touch Ignored)' : '🖐️ Finger & Stylus Drawing Active');
        this.playAudioTone(this.stylusOnlyMode ? 784 : 440, 'sine', 0.05);
      });

      const exportBtn = this.createHudButton('📋', 'Export Ink to AST S-Expression', () => {
        const ast = this.exportInkToAST();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(ast);
          this.showFloatingNotice('📋 Copied Ink AST S-Expression to Clipboard!');
          this.playAudioTone(659, 'sine', 0.06);
        }
      });
      const broadcastBtn = this.createHudButton('📡', 'Broadcast Whiteboard Ink to Pupils (WebRTC)', () => {
        this.broadcastInkSession();
      });

      inkExtraActions.appendChild(undoBtn);
      inkExtraActions.appendChild(redoBtn);
      inkExtraActions.appendChild(palmBtn);
      inkExtraActions.appendChild(exportBtn);
      inkExtraActions.appendChild(broadcastBtn);

      // 5. Clear Ink Button
      const clearBtn = this.createHudButton('🗑️', 'Clear All Whiteboard Ink', () => this.clearWhiteboardInk());
      clearBtn.id = 'stage-hud-clear-btn';
      clearBtn.style.display = 'none';

      // 6. Pen Toggle Primary Pill
      const penBtn = this.createHudButton('🖊️', 'Whiteboard Ink Mode (Draw, Annotate & Highlight) • [W]', () => {
        this.togglePen();
      });
      penBtn.id = 'stage-hud-pen-btn';

      // 7. X-Ray Discovery Button
      const xrayBtn = this.createHudButton('🔬', 'Pedagogical X-Ray Inspection', () => {
        if (!this._isControlEnabled('xray')) return;
        this.isXRayActive = !this.isXRayActive;
        xrayBtn.style.background = this.isXRayActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)';
        xrayBtn.style.color = this.isXRayActive ? '#090d16' : '#ffffff';
        if (!this.isXRayActive) this.hideXRayPopup();
        this.playAudioTone(this.isXRayActive ? 784 : 392, 'sine', 0.08);
      });
      xrayBtn.id = 'stage-hud-xray-btn';

      // 8. Audio Sonification Button
      const soundBtn = this.createHudButton('🔊', 'Multi-sensory Procedural Audio', () => {
        this.sonificationEnabled = !this.sonificationEnabled;
        soundBtn.textContent = this.sonificationEnabled ? '🔊' : '🔇';
        soundBtn.style.opacity = this.sonificationEnabled ? '1.0' : '0.5';
        if (this.sonificationEnabled) this.playAudioTone(523, 'sine', 0.05);
      });
      soundBtn.id = 'stage-hud-sound-btn';

      hud.appendChild(penTools);
      hud.appendChild(penWidths);
      hud.appendChild(penPalette);
      hud.appendChild(inkExtraActions);
      hud.appendChild(clearBtn);
      hud.appendChild(penBtn);
      hud.appendChild(xrayBtn);
      hud.appendChild(soundBtn);
      container.appendChild(hud);
    }

    createHudButton(icon, title, onClick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = title;
      btn.textContent = icon;
      btn.style.cssText = `
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #f8fafc;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.15s ease;
      `;
      btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
      btn.onmouseleave = () => btn.style.transform = 'scale(1.0)';
      btn.onclick = onClick;
      return btn;
    }

    // =========================================================================
    // X-Ray Pedagogical Knowledge Tooltip
    // =========================================================================

    setupXRayTooltip() {
      const container = this.stageSvg.parentNode;
      if (!container || container.querySelector('#stage-xray-tooltip')) return;

      const tip = document.createElement('div');
      tip.id = 'stage-xray-tooltip';
      tip.style.cssText = `
        position: absolute;
        display: none;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid #38bdf8;
        border-radius: 8px;
        padding: 8px 12px;
        color: #f8fafc;
        font-size: 11px;
        font-family: system-ui, sans-serif;
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        pointer-events: none;
        z-index: 35;
        max-width: 240px;
        line-height: 1.4;
      `;
      container.appendChild(tip);
      this.xrayTooltip = tip;
    }

    showXRayPopup(pedId, svgX, svgY, pedNode = null) {
      if (!this.xrayTooltip || !this._isControlEnabled('xray')) return;
      let info = null;

      if (pedNode) {
        const attrTitle = pedNode.getAttribute('data-pedagogical-title') || pedNode.getAttribute('data-pedagogical-label');
        const attrEq = pedNode.getAttribute('data-pedagogical-eq') || '';
        const attrDesc = pedNode.getAttribute('data-pedagogical-desc') || '';
        if (attrTitle || attrDesc) {
          info = {
            title: attrTitle || pedId || 'Apparatus Component',
            eq: attrEq || 'Lumina Vector X-Ray',
            desc: attrDesc || attrTitle || ''
          };
        }
      }

      if (!info && typeof pedId === 'string' && pedId.includes(':')) {
        const colonIdx = pedId.indexOf(':');
        info = {
          title: pedId.slice(0, colonIdx).trim(),
          eq: 'Interactive Vector Apparatus',
          desc: pedId.slice(colonIdx + 1).trim()
        };
      }

      if (!info) return;

      this.xrayTooltip.textContent = '';
      const titleEl = document.createElement('div');
      titleEl.style.color = '#38bdf8';
      titleEl.style.fontWeight = '800';
      titleEl.style.fontSize = '11px';
      titleEl.style.marginBottom = '2px';
      titleEl.textContent = info.title;

      const eqEl = document.createElement('div');
      eqEl.style.color = '#fde047';
      eqEl.style.fontFamily = 'monospace';
      eqEl.style.fontWeight = '800';
      eqEl.style.marginBottom = '3px';
      eqEl.textContent = info.eq;

      const descEl = document.createElement('div');
      descEl.style.color = '#cbd5e1';
      descEl.style.fontSize = '10px';
      descEl.textContent = info.desc;

      this.xrayTooltip.appendChild(titleEl);
      this.xrayTooltip.appendChild(eqEl);
      this.xrayTooltip.appendChild(descEl);

      const rect = this.stageSvg.getBoundingClientRect();
      const clientX = rect.left + (svgX / 800) * rect.width;
      const clientY = rect.top + (svgY / 480) * rect.height;

      this.xrayTooltip.style.left = `${Math.min(window.innerWidth - 250, clientX + 15)}px`;
      this.xrayTooltip.style.top = `${Math.max(10, clientY - 40)}px`;
      this.xrayTooltip.style.display = 'block';
    }

    hideXRayPopup() {
      if (this.xrayTooltip) {
        this.xrayTooltip.style.display = 'none';
      }
    }

    createTouchRipple(x, y) {
      if (!this.hudRoot) return;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toFixed(1));
      circle.setAttribute('cy', y.toFixed(1));
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#38bdf8');
      circle.setAttribute('stroke-width', '2');
      circle.style.transition = 'all 0.4s ease-out';
      this.hudRoot.appendChild(circle);

      requestAnimationFrame(() => {
        circle.setAttribute('r', '32');
        circle.setAttribute('opacity', '0');
        setTimeout(() => circle.remove(), 420);
      });
    }

    // =========================================================================
    // Procedural WebAudio Sonification (Gated by :audio switch)
    // =========================================================================

    playAudioTone(frequency = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
      if (
        !this._isControlEnabled('audio') ||
        !this.sonificationEnabled ||
        (this.engine && (this.engine.muted || this.engine.volume === 0))
      ) {
        return;
      }
      try {
        if (!this.audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      } catch {}
    }

    // =========================================================================
    // Live Simulation Parameters & Controls HUD Dock (Gated by :param-hud)
    // =========================================================================

    setupSimParametersHud() {
      const container = this.stageSvg && this.stageSvg.parentNode;
      if (!container || !this.engine) return;

      let hud = container.querySelector('#stage-sim-parameters');
      const scene = this.engine.scene;

      if (
        !this._isControlEnabled('param-hud') ||
        !scene ||
        (scene.uiControls && scene.uiControls.length > 0) ||
        container.querySelector('#cartridge-controls-overlay')
      ) {
        if (hud) hud.style.display = 'none';
        return;
      }

      let inputs = Array.isArray(scene.inputs) && scene.inputs.length > 0 ? [...scene.inputs] : [];
      if (inputs.length === 0 && scene.vars && typeof scene.vars === 'object') {
        Object.entries(scene.vars).forEach(([k, v]) => {
          if (v && typeof v === 'object' && typeof v.min === 'number' && typeof v.max === 'number') {
            inputs.push({
              type: 'slider',
              var: k,
              label: v.label || k,
              min: v.min,
              max: v.max,
              step: v.step || 1,
              unit: v.unit || ''
            });
          }
        });
      }

      if (inputs.length === 0) {
        if (hud) hud.style.display = 'none';
        return;
      }

      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'stage-sim-parameters';
        hud.style.cssText = `
          position: absolute;
          top: 14px;
          right: 14px;
          min-width: 230px;
          max-width: 280px;
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
          padding: 10px 14px;
          color: #f8fafc;
          z-index: 35;
          user-select: none;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 12px;
          transition: opacity 0.2s ease;
        `;
        container.appendChild(hud);
      } else {
        hud.style.display = 'block';
      }

      const currentVars = this.engine.vars || {};

      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;';
      const titleSpan = document.createElement('span');
      titleSpan.style.cssText = 'font-weight:800; font-size:12px; color:#38bdf8; display:flex; align-items:center; gap:5px;';
      const titleIcon = document.createElement('span');
      titleIcon.textContent = '🎛️';
      titleSpan.append(titleIcon, document.createTextNode(' Parameters'));

      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display:flex; gap:6px; align-items:center;';
      const resetVarsBtn = document.createElement('button');
      resetVarsBtn.id = 'sim-btn-reset-vars';
      resetVarsBtn.type = 'button';
      resetVarsBtn.style.cssText = 'background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); border-radius:6px; color:#94a3b8; font-size:10px; font-weight:700; padding:2px 7px; cursor:pointer;';
      resetVarsBtn.title = 'Reset variables to defaults';
      resetVarsBtn.textContent = '↺ Reset';

      const collapseBtn = document.createElement('button');
      collapseBtn.id = 'sim-btn-collapse';
      collapseBtn.type = 'button';
      collapseBtn.style.cssText = 'background:none; border:none; color:#94a3b8; font-size:12px; cursor:pointer; padding:0 3px;';
      collapseBtn.textContent = '▲';

      btnGroup.append(resetVarsBtn, collapseBtn);
      headerRow.append(titleSpan, btnGroup);

      const paramBody = document.createElement('div');
      paramBody.id = 'sim-param-body';
      paramBody.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

      inputs.forEach(inp => {
        const vName = inp.var;
        const curVal = currentVars[vName] !== undefined ? currentVars[vName] : (inp.min + (inp.max - inp.min) / 2);
        const unit = inp.unit || '';

        const rowWrap = document.createElement('div');
        const labelRow = document.createElement('div');
        labelRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;';

        const lblSpan = document.createElement('span');
        lblSpan.style.cssText = 'font-size:11px; font-weight:600; color:#cbd5e1;';
        lblSpan.textContent = inp.label || vName;

        const valBox = document.createElement('div');
        valBox.style.cssText = 'display:flex; align-items:center; gap:4px;';

        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.min = String(inp.min);
        numInput.max = String(inp.max);
        numInput.step = String(inp.step || 1);
        numInput.value = String(curVal);
        numInput.setAttribute('data-var', vName);
        numInput.setAttribute('data-unit', unit);
        numInput.className = 'sim-param-num-input';
        numInput.style.cssText = 'width:48px; background:rgba(0,0,0,0.5); border:1px solid rgba(56,189,248,0.4); border-radius:4px; color:#38bdf8; font-family:ui-monospace, monospace; font-size:11px; font-weight:700; text-align:center; padding:1px 2px;';
        numInput.title = 'Type custom figure';
        valBox.appendChild(numInput);

        if (unit) {
          const unitSpan = document.createElement('span');
          unitSpan.style.cssText = 'font-size:10px; color:#94a3b8;';
          unitSpan.textContent = unit;
          valBox.appendChild(unitSpan);
        }

        labelRow.append(lblSpan, valBox);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = String(inp.min);
        slider.max = String(inp.max);
        if (inp.step !== undefined) slider.step = String(inp.step);
        slider.value = String(curVal);
        slider.setAttribute('data-var', vName);
        slider.setAttribute('data-unit', unit);
        slider.className = 'sim-param-slider';
        slider.style.cssText = 'width:100%; accent-color:#38bdf8; cursor:pointer; height:6px; margin:0; display:block;';

        rowWrap.append(labelRow, slider);
        paramBody.appendChild(rowWrap);
      });

      hud.replaceChildren(headerRow, paramBody);

      const applyVal = (vName, val) => {
        if (this.engine && typeof this.engine.setVar === 'function') {
          this.engine.setVar(vName, val);
        }
        const s = hud.querySelector(`.sim-param-slider[data-var="${vName}"]`);
        const num = hud.querySelector(`.sim-param-num-input[data-var="${vName}"]`);
        if (s && Number(s.value) !== val) s.value = val;
        if (num && Number(num.value) !== val) num.value = val;
      };

      const sliders = hud.querySelectorAll('.sim-param-slider');
      sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
          const vName = e.target.getAttribute('data-var');
          const val = parseFloat(e.target.value);
          applyVal(vName, val);
          this.playAudioTone(400 + val * 10, 'sine', 0.02, 0.05);
        });
      });

      const numInputs = hud.querySelectorAll('.sim-param-num-input');
      numInputs.forEach(input => {
        input.addEventListener('input', (e) => {
          const vName = e.target.getAttribute('data-var');
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) {
            applyVal(vName, val);
            this.playAudioTone(440 + val * 12, 'triangle', 0.03, 0.08);
          }
        });
      });

      const btnReset = hud.querySelector('#sim-btn-reset-vars');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (this.engine) this.engine.resetVars();
          this.setupSimParametersHud();
          this.playAudioTone(523, 'triangle', 0.08, 0.15);
        });
      }

      const btnCollapse = hud.querySelector('#sim-btn-collapse');
      const body = hud.querySelector('#sim-param-body');
      if (btnCollapse && body) {
        btnCollapse.addEventListener('click', () => {
          const isCollapsed = body.style.display === 'none';
          body.style.display = isCollapsed ? 'flex' : 'none';
          btnCollapse.textContent = isCollapsed ? '▲' : '▼';
        });
      }

      if (!this._varChangeBound && this.engine && typeof this.engine.on === 'function') {
        this._varChangeBound = true;
        this.engine.on('varchange', (data) => {
          const curHud = document.getElementById('stage-sim-parameters') || (container && container.querySelector('#stage-sim-parameters'));
          if (curHud && curHud.style.display !== 'none') {
            const sList = curHud.querySelectorAll('.sim-param-slider');
            sList.forEach(s => {
              const vName = s.getAttribute('data-var');
              if (data.name === '*' || data.name === vName) {
                const val = (data.vars && data.vars[vName] !== undefined) ? data.vars[vName] : data.value;
                if (val !== undefined) {
                  if (Number(s.value) !== Number(val)) s.value = val;
                  const numInput = curHud.querySelector(`.sim-param-num-input[data-var="${vName}"]`);
                  if (numInput && Number(numInput.value) !== Number(val)) numInput.value = val;
                }
              }
            });
          }
        });
      }
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
          'toggle-xray',
          'toggle-audio',
          'reset-vars',
          ...Array.from(ASTDirectGestureSubsystem._customActions.keys()),
          ...Array.from(this._customActions.keys())
        ])),
        customGestureSkills: Array.from(new Set([
          ...Array.from(ASTDirectGestureSubsystem._customGestureSkills.keys()),
          ...Array.from(this._customGestureSkills.keys())
        ]))
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
