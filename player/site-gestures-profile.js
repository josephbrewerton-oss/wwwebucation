/**
 * static/player/site-gestures-profile.js
 *
 * St Joseph's Educational Media Suite — Gesture Profile AST Loader, Skill Compiler & Control Gates
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTDirectGestureSubsystem (site-gestures.js).
 * Zero external dependencies; loaded strictly before site-gestures.js.
 * Pure generic VM — zero hardcoded cartridge or simulation data.
 * All methods execute with `this` bound to the ASTDirectGestureSubsystem instance.
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

  // Offline / file:// AST fallback for declarative player skills (100% pure AST — zero inline JS;
  // parsed by the exact same generic _parseSkillsBlock AST parser as static/player/player-gestures.ast).
  const DEFAULT_SKILLS_AST = `(:skills
    (:skill :id "storybook-reader"
      :pages 5
      :sync-timeline-var "page"
      :sync-count "{{pages}}"
      :sync-clear-var "activePhonemes"
      :sync-reset-var "activeWord"
      :sync-reset-val "{{hintDefault}}"
      :hint-default "Tap any word above to see & hear its sounds"
      (:controls (:param-hud :off))
      (:gestures
        (:key       :code "ArrowLeft"      :action "step-slide" :delta -1 :count "{{pages}}" :var "page" :clear-var "activePhonemes" :reset-var "activeWord" :reset-val "{{hintDefault}}" :tone "392")
        (:key       :code "ArrowRight"     :action "step-slide" :delta  1 :count "{{pages}}" :var "page" :clear-var "activePhonemes" :reset-var "activeWord" :reset-val "{{hintDefault}}" :tone "523.25")
        (:clickable :target "#btn-prev-page" :action "step-slide" :delta -1 :count "{{pages}}" :var "page" :clear-var "activePhonemes" :reset-var "activeWord" :reset-val "{{hintDefault}}" :tone "392")
        (:clickable :target "#btn-next-page" :action "step-slide" :delta  1 :count "{{pages}}" :var "page" :clear-var "activePhonemes" :reset-var "activeWord" :reset-val "{{hintDefault}}" :tone "523.25")
        (:clickable :target ".page-dot"    :action "goto-slide" :attr "data-page" :count "{{pages}}" :var "page" :clear-var "activePhonemes" :reset-var "activeWord" :reset-val "{{hintDefault}}" :tone "440")
        (:clickable :target "#btn-toggle-sb" :toggle-var "showButtons" :tone "493.88")
        (:clickable :target "#btn-read-page" :speak-var "pageText" :tone "523.25,659.25")
        (:clickable :target ".book-word"   :set-var "activeWord" :from-attr "data-hint" :speak-attr "data-word" :tone "523.25")
        (:clickable :target ".book-word"   :set-var "activePhonemes" :from-attr "data-phonemes")
        (:clickable :target "#btn-sound-out" :speak-var "activePhonemes" :fallback-var "pageText" :tone "440,523.25,659.25"))))`;

  // Resolve script base URL at load time so player-gestures.ast can be fetched reliably
  const PROFILE_SCRIPT_BASE_URL = (() => {
    try {
      if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
        return document.currentScript.src.replace(/[^/]+$/, '');
      }
    } catch {}
    return '';
  })();

  function createDefaultProfile() {
    return {
      defaults: { ...DEFAULT_CONTROLS },
      universalKeys: [...DEFAULT_UNIVERSAL_KEYS],
      whiteboard: {
        tools: [...DEFAULT_WHITEBOARD.tools],
        widths: [...DEFAULT_WHITEBOARD.widths],
        palette: [...DEFAULT_WHITEBOARD.palette]
      },
      tones: { ...DEFAULT_TONES },
      skills: this && typeof this._parseSkillsBlock === 'function'
        ? this._parseSkillsBlock(DEFAULT_SKILLS_AST)
        : _parseSkillsBlock.call(ASTGesturesProfile, DEFAULT_SKILLS_AST)
    };
  }

  async function loadPlayerGesturesProfile() {
    if (this._profileLoaded) return this.playerProfile;
    const baseUrl = this._scriptBaseUrl || PROFILE_SCRIPT_BASE_URL;
    const candidates = [
      this.options && this.options.gesturesAstUrl,
      baseUrl ? `${baseUrl}player-gestures.ast` : null,
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

  function _stripSexpComments(source) {
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

  function _extractSexpBlock(source, headToken) {
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

  function _extractChildSexps(block) {
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

  function _extractAllSexpBlocks(source, headToken) {
    if (!source || typeof source !== 'string' || !headToken) return [];
    const cleanSrc = this._stripSexpComments(source);
    const tokenBody = headToken.replace(/^\(/, '');
    const escapedBody = tokenBody.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const headRegex = new RegExp(`^\\(\\s*${escapedBody}(?=[\\s)]|$)`, 'i');
    const results = [];
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
          let depth = 0;
          let q = false;
          let esc = false;
          for (let j = i; j < cleanSrc.length; j++) {
            const c2 = cleanSrc[j];
            if (esc) { esc = false; continue; }
            if (c2 === '\\') { esc = true; continue; }
            if (c2 === '"') { q = !q; continue; }
            if (!q) {
              if (c2 === '(') depth++;
              else if (c2 === ')') {
                depth--;
                if (depth === 0) {
                  results.push(cleanSrc.slice(i, j + 1));
                  i = j;
                  break;
                }
              }
            }
          }
        }
      }
    }
    return results;
  }

  function _stripChildSexps(block) {
    if (!block || typeof block !== 'string') return '';
    let out = '';
    let depth = 0;
    let inQuote = false;
    let escape = false;
    for (let i = 0; i < block.length; i++) {
      const ch = block[i];
      if (escape) {
        if (depth <= 1) out += ch;
        escape = false;
        continue;
      }
      if (ch === '\\') {
        if (depth <= 1) out += ch;
        escape = true;
        continue;
      }
      if (ch === '"') {
        inQuote = !inQuote;
        if (depth <= 1) out += ch;
        continue;
      }
      if (!inQuote) {
        if (ch === '(') {
          depth++;
          if (depth === 1) out += ch;
          continue;
        }
        if (ch === ')') {
          if (depth === 1) out += ch;
          depth = Math.max(0, depth - 1);
          continue;
        }
      }
      if (depth <= 1) out += ch;
    }
    return out;
  }

  function _kebabToCamel(key) {
    return String(key || '').replace(/-([a-z0-9])/gi, (_, ch) => ch.toUpperCase());
  }

  function _escapeTemplateValue(val) {
    if (typeof val === 'number') return Number.isFinite(val) ? String(val) : '0';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n');
  }

  function _resolveSkillParams(skillDef, usageParams) {
    const merged = {
      ...(skillDef && skillDef.defaults ? skillDef.defaults : {}),
      ...(usageParams && typeof usageParams === 'object' ? usageParams : {})
    };
    const resolved = {};
    Object.entries(merged).forEach(([k, v]) => {
      resolved[k] = v;
      const camel = this._kebabToCamel(k);
      if (camel && resolved[camel] === undefined) {
        resolved[camel] = v;
      }
    });
    if (resolved.pages !== undefined) {
      const pagesNum = Number(resolved.pages);
      if (Number.isFinite(pagesNum) && pagesNum >= 1) {
        const roundedPages = Math.round(pagesNum);
        resolved.pages = roundedPages;
        if (resolved.maxIndex === undefined && resolved['max-index'] === undefined) {
          const maxIdx = Math.max(1, roundedPages - 1);
          resolved.maxIndex = maxIdx;
          resolved['max-index'] = maxIdx;
        }
      }
    }
    return resolved;
  }

  function _expandSkillTemplate(raw, params, isJsExprField = false) {
    if (typeof raw !== 'string' || !raw.includes('{{')) return raw;
    // If the entire token is a single placeholder (e.g. :count "{{pages}}"), preserve its native type
    const exactMatch = raw.match(/^\{\{([a-zA-Z0-9_-]+)\}\}$/);
    if (exactMatch) {
      const key = exactMatch[1];
      let val = params[key];
      if (val === undefined) val = params[this._kebabToCamel(key)];
      if (val !== undefined) {
        return isJsExprField ? this._escapeTemplateValue(val) : val;
      }
      return raw;
    }
    return raw.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, key) => {
      let val = params[key];
      if (val === undefined) {
        val = params[this._kebabToCamel(key)];
      }
      if (val === undefined) return match;
      return isJsExprField ? this._escapeTemplateValue(val) : String(val);
    });
  }

  function _parseSkillsBlock(skillsBlock) {
    const skillsMap = new Map();
    if (!skillsBlock) return skillsMap;
    const clean = this._stripSexpComments(skillsBlock);
    const rootBlock = clean.trim().startsWith('(:skills')
      ? clean.trim()
      : this._extractSexpBlock(clean, '(:skills');
    if (!rootBlock) return skillsMap;

    const skillItems = this._extractChildSexps(rootBlock);
    for (const skillSexp of skillItems) {
      if (!/^\(\s*:skill(?:\s|$)/i.test(skillSexp)) continue;
      const topOnly = this._stripChildSexps(skillSexp);
      const topAttrs = this._parseKeywordAttrs(topOnly);
      const id = topAttrs.id;
      if (!id || typeof id !== 'string') continue;

      const defaults = {};
      Object.entries(topAttrs).forEach(([k, v]) => {
        if (k !== 'id') defaults[k] = v;
      });

      const ctrlBlock = this._extractSexpBlock(skillSexp, '(:controls');
      const controls = ctrlBlock ? this._parseControlsBlock(ctrlBlock) : {};

      const gestures = [];
      const gesturesBlock = this._extractSexpBlock(skillSexp, '(:gestures');
      if (gesturesBlock) {
        let gestureChildren = this._extractChildSexps(gesturesBlock);
        if (gestureChildren.length === 1 && !/^\(\s*:/i.test(gestureChildren[0])) {
          gestureChildren = this._extractChildSexps(gestureChildren[0]);
        }
        for (const gSexp of gestureChildren) {
          const typeMatch = gSexp.match(/^\(\s*:([a-zA-Z0-9_-]+)/);
          if (!typeMatch) continue;
          const gAttrs = this._parseKeywordAttrs(gSexp);
          gAttrs.type = typeMatch[1];
          gestures.push(gAttrs);
        }
      }

      skillsMap.set(id, { id, defaults, controls, gestures });
    }
    return skillsMap;
  }

  function _parseKeywordAttrs(sexp) {
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
      if (rawVal.startsWith('"')) attrs[k] = rawVal.slice(1, -1).replace(/\\([\\"])/g, '$1');
      else if (lowerVal === ':on' || lowerVal === ':true' || lowerVal === 'true') attrs[k] = true;
      else if (lowerVal === ':off' || lowerVal === ':false' || lowerVal === 'false') attrs[k] = false;
      else if (rawVal.startsWith(':')) attrs[k] = rawVal.slice(1);
      else attrs[k] = Number(rawVal);
    }
    return attrs;
  }

  function _parseControlsBlock(blockText) {
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

  function _parsePlayerGesturesAST(astText) {
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

    // 6. (:skills ...) declarative reusable player skills
    const skillsBlock = this._extractSexpBlock(clean, '(:skills');
    if (skillsBlock) {
      const parsedSkills = this._parseSkillsBlock(skillsBlock);
      if (parsedSkills.size > 0) {
        this.playerProfile.skills = parsedSkills;
      }
    }
  }

  function _getRawCartridgeAst() {
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

  function _resolveSceneSkillUsages(scene) {
    if (scene && Array.isArray(scene.skills) && scene.skills.length > 0) {
      return scene.skills;
    }
    const rawAst = (scene && (scene.rawAst || scene.astSource || scene.source)) || this._getRawCartridgeAst();
    if (!rawAst) return [];
    const blocks = this._extractAllSexpBlocks(rawAst, '(:use-skill');
    const usages = [];
    for (const b of blocks) {
      const idMatch = b.match(/^\(\s*:use-skill\s+"([^"]+)"/i) || b.match(/:id\s+"([^"]+)"/i);
      if (!idMatch) continue;
      const attrs = this._parseKeywordAttrs(b);
      delete attrs.id;
      usages.push({ id: idMatch[1], params: attrs });
    }
    return usages;
  }

  function _resolveSkillGestures(scene) {
    if (!scene || !this.playerProfile || !(this.playerProfile.skills instanceof Map)) return [];
    const usages = this._resolveSceneSkillUsages(scene);
    if (usages.length === 0) return [];

    const expanded = [];
    for (const usage of usages) {
      if (!usage || !usage.id) continue;
      const skillDef = this.playerProfile.skills.get(usage.id);
      if (!skillDef || !Array.isArray(skillDef.gestures)) continue;
      const resolvedParams = this._resolveSkillParams(skillDef, usage.params);
      for (const rawGesture of skillDef.gestures) {
        const clone = {};
        Object.entries(rawGesture).forEach(([k, v]) => {
          const isJsExpr = k === 'expr' || k === 'if' || k === 'ifExpr' || k.endsWith('Expr') || k.endsWith('-expr');
          clone[k] = typeof v === 'string' ? this._expandSkillTemplate(v, resolvedParams, isJsExpr) : v;
        });
        expanded.push(this._normalizeGesture(clone));
      }
    }
    return expanded;
  }

  /**
   * Resolves declarative two-way timeline<->var synchronization metadata from any active AST skill
   * (e.g. :sync-timeline-var "page" :sync-count "{{pages}}"). Purely generic; zero hardcoded scene IDs.
   */
  function _getActiveTimelineSyncSpec(scene) {
    if (!scene || !this.playerProfile || !(this.playerProfile.skills instanceof Map)) return null;
    const usages = this._resolveSceneSkillUsages(scene);
    for (const usage of usages) {
      if (!usage || !usage.id) continue;
      const skillDef = this.playerProfile.skills.get(usage.id);
      if (!skillDef) continue;
      const resolvedParams = this._resolveSkillParams(skillDef, usage.params);
      const rawVar = resolvedParams.syncTimelineVar || resolvedParams['sync-timeline-var'];
      if (!rawVar) continue;

      const varName = String(this._expandSkillTemplate(String(rawVar), resolvedParams, false)).trim();
      if (!varName) continue;

      const rawCount = resolvedParams.syncCount !== undefined
        ? this._expandSkillTemplate(resolvedParams.syncCount, resolvedParams, false)
        : (resolvedParams['sync-count'] !== undefined
          ? this._expandSkillTemplate(resolvedParams['sync-count'], resolvedParams, false)
          : resolvedParams.pages);
      const keyframeCount = Array.isArray(scene.keyframes) && scene.keyframes.length >= 2
        ? scene.keyframes.length
        : 2;
      const parsedCount = Number(rawCount);
      const count = Number.isFinite(parsedCount) && parsedCount >= 2 ? Math.round(parsedCount) : keyframeCount;

      const rawClear = resolvedParams.syncClearVar || resolvedParams['sync-clear-var'] || '';
      const clearVar = rawClear ? String(this._expandSkillTemplate(String(rawClear), resolvedParams, false)).trim() : '';

      const rawReset = resolvedParams.syncResetVar || resolvedParams['sync-reset-var'] || '';
      const resetVar = rawReset ? String(this._expandSkillTemplate(String(rawReset), resolvedParams, false)).trim() : '';

      const rawResetVal = resolvedParams.syncResetVal !== undefined
        ? resolvedParams.syncResetVal
        : resolvedParams['sync-reset-val'];
      const resetVal = rawResetVal !== undefined
        ? this._expandSkillTemplate(rawResetVal, resolvedParams, false)
        : '';

      return {
        varName,
        count,
        maxIdx: Math.max(1, count - 1),
        clearVar,
        resetVar,
        resetVal
      };
    }
    return null;
  }

  /**
   * Keeps timeline progress (t) and a discrete page/step variable synchronized in both directions
   * without feedback loops whenever an active AST skill declares :sync-timeline-var.
   */
  function _bindTimelineVarSync() {
    if (this._timelineSyncBound || !this.engine || typeof this.engine.on !== 'function') return;
    this._timelineSyncBound = true;

    // 1. Timeline scrubbing / playback (t -> vars[syncVar])
    this.engine.on('timeupdate', (data) => {
      if (this._syncingTimelineVar) return;
      const spec = this._getActiveTimelineSyncSpec(this.engine.scene);
      if (!spec) return;

      const progress = data && typeof data.progress === 'number'
        ? data.progress
        : (this.engine.progress || 0);
      const nextIdx = Math.max(0, Math.min(spec.maxIdx, Math.floor((progress || 0) * spec.count)));
      const rawCur = this.engine.vars ? this.engine.vars[spec.varName] : undefined;
      const curNum = Number(rawCur);
      const curIdx = Number.isFinite(curNum) ? Math.max(0, Math.min(spec.maxIdx, Math.round(curNum))) : -1;

      if (nextIdx !== curIdx) {
        this._syncingTimelineVar = true;
        try {
          this._lastSyncedTimelineVal = nextIdx;
          this._writeEngineVar(spec.varName, nextIdx);
          if (spec.clearVar) this._writeEngineVar(spec.clearVar, '');
          if (spec.resetVar) this._writeEngineVar(spec.resetVar, spec.resetVal);
        } finally {
          this._syncingTimelineVar = false;
        }
      }
    });

    // 2. Variable updates from Turn Page parameter control / WebMCP / buttons (vars[syncVar] -> t)
    this.engine.on('varchange', (data) => {
      if (this._syncingTimelineVar) return;
      const spec = this._getActiveTimelineSyncSpec(this.engine.scene);
      if (!spec || !data || data.name !== spec.varName) return;

      const rawVal = Number(data.value);
      const targetIdx = Math.max(0, Math.min(spec.maxIdx, Number.isFinite(rawVal) ? Math.round(rawVal) : 0));
      const targetProgress = targetIdx / spec.maxIdx;
      const needsClamp = !Number.isFinite(rawVal) || rawVal !== targetIdx;
      const pageChanged = this._lastSyncedTimelineVal !== targetIdx;
      const needsSeek = typeof this.engine.seek === 'function'
        && Math.abs((this.engine.progress || 0) - targetProgress) > 1e-4;

      if (!needsClamp && !pageChanged && !needsSeek) return;

      this._syncingTimelineVar = true;
      try {
        this._lastSyncedTimelineVal = targetIdx;
        if (needsClamp) {
          this._writeEngineVar(spec.varName, targetIdx);
        }
        if (pageChanged) {
          if (spec.clearVar) this._writeEngineVar(spec.clearVar, '');
          if (spec.resetVar) this._writeEngineVar(spec.resetVar, spec.resetVal);
        }
        if (needsSeek) {
          this.engine.seek(targetProgress);
        }
      } finally {
        this._syncingTimelineVar = false;
      }
    });
  }

  function _syncCartridgeControls() {
    const merged = { ...this.playerProfile.defaults };
    const scene = this.engine && this.engine.scene;

    // 1. Apply active AST skill controls before cartridge-level overrides
    const skillUsages = this._resolveSceneSkillUsages(scene);
    for (const usage of skillUsages) {
      const skillDef = this.playerProfile.skills && this.playerProfile.skills.get(usage.id);
      if (skillDef && skillDef.controls) {
        Object.assign(merged, skillDef.controls);
      }
    }

    // 2. Check pre-parsed scene.controls if engine provides it
    if (scene && scene.controls && typeof scene.controls === 'object') {
      Object.entries(scene.controls).forEach(([k, v]) => {
        const key = k.replace(/^:/, '').toLowerCase();
        if (typeof v === 'boolean') merged[key] = v;
        else if (v === ':on' || v === 'on' || v === 'true') merged[key] = true;
        else if (v === ':off' || v === 'off' || v === 'false') merged[key] = false;
      });
    }

    // 3. Fallback: parse (:controls ...) directly from raw cartridge AST text
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

  function _isControlEnabled(flagName) {
    return this.activeControls[flagName] !== false;
  }

  function _setElementControlVisibility(el, enabled) {
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

  function _applyControlVisibility() {
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

  /**
   * Normalizes cartridge gesture dictionaries so both older (:clickable / :setVar)
   * and newer (:interactive / :action "set-var") syntaxes work identically.
   */
  function _normalizeGesture(g) {
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
    if (norm.setVar === undefined && norm['set-var'] !== undefined) norm.setVar = norm['set-var'];
    if (norm.toggleVar === undefined && norm['toggle-var'] !== undefined) norm.toggleVar = norm['toggle-var'];
    if (norm.stepVar === undefined && norm['step-var'] !== undefined) norm.stepVar = norm['step-var'];
    if (norm.holdVar === undefined && norm['hold-var'] !== undefined) norm.holdVar = norm['hold-var'];
    if (norm.releaseVal === undefined && norm['release-val'] !== undefined) norm.releaseVal = norm['release-val'];
    if (norm.yawVar === undefined && norm['yaw-var'] !== undefined) norm.yawVar = norm['yaw-var'];
    if (norm.pitchVar === undefined && norm['pitch-var'] !== undefined) norm.pitchVar = norm['pitch-var'];
    if (norm.pitchMin === undefined && norm['pitch-min'] !== undefined) norm.pitchMin = norm['pitch-min'];
    if (norm.pitchMax === undefined && norm['pitch-max'] !== undefined) norm.pitchMax = norm['pitch-max'];
    if (norm.minX === undefined && norm['min-x'] !== undefined) norm.minX = norm['min-x'];
    if (norm.maxX === undefined && norm['max-x'] !== undefined) norm.maxX = norm['max-x'];
    if (norm.minY === undefined && norm['min-y'] !== undefined) norm.minY = norm['min-y'];
    if (norm.maxY === undefined && norm['max-y'] !== undefined) norm.maxY = norm['max-y'];
    if (norm.fromAttr === undefined && norm['from-attr'] !== undefined) norm.fromAttr = norm['from-attr'];
    if (norm.speakVar === undefined && norm['speak-var'] !== undefined) norm.speakVar = norm['speak-var'];
    if (norm.fallbackVar === undefined && norm['fallback-var'] !== undefined) norm.fallbackVar = norm['fallback-var'];
    if (norm.speakAttr === undefined && norm['speak-attr'] !== undefined) norm.speakAttr = norm['speak-attr'];
    if (norm.clearVar === undefined && norm['clear-var'] !== undefined) norm.clearVar = norm['clear-var'];
    if (norm.resetVar === undefined && norm['reset-var'] !== undefined) norm.resetVar = norm['reset-var'];
    if (norm.resetVal === undefined && norm['reset-val'] !== undefined) norm.resetVal = norm['reset-val'];
    if (norm.presetId === undefined && norm['preset-id'] !== undefined) norm.presetId = norm['preset-id'];
    if (norm.renderMode === undefined && norm['render-mode'] !== undefined) norm.renderMode = norm['render-mode'];
    if (norm.valExpr === undefined && norm['val-expr'] !== undefined) norm.valExpr = norm['val-expr'];
    if (norm.toneExpr === undefined && norm['tone-expr'] !== undefined) norm.toneExpr = norm['tone-expr'];
    if (norm.speakExpr === undefined && norm['speak-expr'] !== undefined) norm.speakExpr = norm['speak-expr'];
    if (norm.speakRateVar === undefined && norm['speak-rate-var'] !== undefined) norm.speakRateVar = norm['speak-rate-var'];
    if (norm.speakPitch === undefined && norm['speak-pitch'] !== undefined) norm.speakPitch = norm['speak-pitch'];

    return norm;
  }

  function _getNormalizedSceneGestures(scene) {
    if (!scene) return [];
    const skillGestures = this._resolveSkillGestures(scene);
    const cartridgeGestures = Array.isArray(scene.gestures)
      ? scene.gestures.map(g => this._normalizeGesture(g))
      : [];
    return [...skillGestures, ...cartridgeGestures];
  }

  /**
   * Finds the primary discrete stepped variable (:step 1) in the active scene
   */
  function _findPrimarySteppedVar(scene) {
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

  const ASTGesturesProfile = {
    DEFAULT_CONTROLS,
    DEFAULT_UNIVERSAL_KEYS,
    DEFAULT_WHITEBOARD,
    DEFAULT_TONES,
    DEFAULT_SKILLS_AST,
    createDefaultProfile,
    loadPlayerGesturesProfile,
    _stripSexpComments,
    _extractSexpBlock,
    _extractChildSexps,
    _extractAllSexpBlocks,
    _stripChildSexps,
    _kebabToCamel,
    _escapeTemplateValue,
    _resolveSkillParams,
    _expandSkillTemplate,
    _parseSkillsBlock,
    _parseKeywordAttrs,
    _parseControlsBlock,
    _parsePlayerGesturesAST,
    _getRawCartridgeAst,
    _resolveSceneSkillUsages,
    _resolveSkillGestures,
    _getActiveTimelineSyncSpec,
    _bindTimelineVarSync,
    _syncCartridgeControls,
    _isControlEnabled,
    _setElementControlVisibility,
    _applyControlVisibility,
    _normalizeGesture,
    _getNormalizedSceneGestures,
    _findPrimarySteppedVar
  };

  global.ASTGesturesProfile = ASTGesturesProfile;
  if (typeof window !== 'undefined') {
    window.ASTGesturesProfile = ASTGesturesProfile;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTGesturesProfile;
  }
})(typeof window !== 'undefined' ? window : globalThis);
