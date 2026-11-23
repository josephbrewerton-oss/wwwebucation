/**
 * static/player/ast-hud-controls.js
 *
 * St Joseph's AST Vector Media Player — Declarative Parameters HUD & Controls Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated UI/accessibility maintenance:
 * - resolveParameterControls(scene): Deduplicates (:inputs ...) / (ui:controls ...) and (:vars ...) fallback controls
 * - _syncDeclarativeHudVar(hudEl, varName, nextVal): Bidirectional slider/toggle/dropdown sync on reactive var mutation
 * - mountDeclarativeHud(scene): Builds & mounts #ast-declarative-hud without coupling DOM widgets to the core VM
 */

(function (global) {
  'use strict';

  class ASTHudControlsMethods {
    /**
     * Resolves a deduplicated list of Parameters UI controls for a scene:
     * 1. Explicit (:inputs ...) / (ui:controls ...) win and claim their target :var names first.
     * 2. Fallback auto-controls from (:vars ...) (bounded numeric sliders & booleans) are generated
     *    ONLY for variables NOT already targeted by explicit controls.
     */
    resolveParameterControls(scene = this.scene) {
      if (!scene || typeof scene !== 'object') return [];

      const paramHudOff = scene.controls && (
        scene.controls['param-hud'] === false ||
        scene.controls[':param-hud'] === false ||
        scene.controls['param-hud'] === ':off' ||
        scene.controls['param-hud'] === 'off' ||
        scene.controls.paramHud === false
      );
      if (paramHudOff) return [];

      const rawExplicit = (Array.isArray(scene.uiControls) && scene.uiControls.length > 0)
        ? scene.uiControls
        : (Array.isArray(scene.inputs) ? scene.inputs : []);
      const sceneVars = (scene.vars && typeof scene.vars === 'object' && !Array.isArray(scene.vars))
        ? scene.vars
        : {};

      // Transpiled Flash/SWF cartridges run directly via stage clicks, keys, and rules —
      // never dump internal SWF frame/MovieClip state variables into a floating manual slider overlay.
      const isSwfScene = Boolean(
        sceneVars && (
          'swf_frame' in sceneVars ||
          'swf_tick' in sceneVars ||
          'swf_playing' in sceneVars
        )
      );
      if (isSwfScene && rawExplicit.length === 0) return [];

      const INTERNAL_RUNTIME_VARS = new Set([
        'simClock', 'clock', 'sim_dt', 'sim_scale',
        'swf_frame', 'swf_playing', 'swf_totalframes', 'swf_framesloaded', 'swf_anim_acc', 'swf_tick'
      ]);

      const findVarMeta = (varName) => {
        if (!varName) return null;
        if (sceneVars[varName] !== undefined) return { key: varName, entry: sceneVars[varName] };
        const norm = this.normalizeVarName(String(varName));
        if (norm && sceneVars[norm] !== undefined) return { key: norm, entry: sceneVars[norm] };
        const lower = String(varName).trim().replace(/^\*|\*$/g, '').toLowerCase();
        const normLower = norm.toLowerCase();
        for (const [k, v] of Object.entries(sceneVars)) {
          const kNorm = this.normalizeVarName(k).toLowerCase();
          if (k.toLowerCase() === lower || kNorm === normLower) {
            return { key: k, entry: v };
          }
        }
        return null;
      };

      const explicitVarKeys = new Set();
      const recordExplicitVar = (name) => {
        if (!name) return;
        const s = String(name).trim().replace(/^\*|\*$/g, '');
        if (!s) return;
        explicitVarKeys.add(s);
        explicitVarKeys.add(s.toLowerCase());
        const norm = this.normalizeVarName(s);
        if (norm) {
          explicitVarKeys.add(norm);
          explicitVarKeys.add(norm.toLowerCase());
        }
      };

      const hasExplicitVar = (name) => {
        if (!name) return false;
        const s = String(name).trim().replace(/^\*|\*$/g, '');
        if (!s) return false;
        if (explicitVarKeys.has(s) || explicitVarKeys.has(s.toLowerCase())) return true;
        const norm = this.normalizeVarName(s);
        return Boolean(norm && (explicitVarKeys.has(norm) || explicitVarKeys.has(norm.toLowerCase())));
      };

      const resolved = [];
      const seenNonButtonVars = new Set();

      for (let i = 0; i < rawExplicit.length; i++) {
        const ctrl = rawExplicit[i];
        if (!ctrl || typeof ctrl !== 'object') continue;

        const rawType = String(ctrl.type || 'slider').toLowerCase();
        const type = (rawType === 'switch' || rawType === 'toggle')
          ? 'toggle'
          : ((rawType === 'number' || rawType === 'stepper') ? 'slider' : rawType);

        const inferredVar = ctrl.var || ctrl.bind || (type !== 'button' && ctrl.id && findVarMeta(ctrl.id) ? ctrl.id : null);
        const normTargetVar = inferredVar ? this.normalizeVarName(String(inferredVar)) : '';
        const targetKeyLower = normTargetVar.toLowerCase();

        if (type !== 'button' && targetKeyLower) {
          if (seenNonButtonVars.has(targetKeyLower)) continue;
          seenNonButtonVars.add(targetKeyLower);
        }
        if (inferredVar) recordExplicitVar(inferredVar);

        const matchedVar = findVarMeta(inferredVar);
        const vEntry = matchedVar ? matchedVar.entry : null;
        const vObj = (vEntry && typeof vEntry === 'object' && !Array.isArray(vEntry)) ? vEntry : null;
        const vVal = vObj
          ? (vObj.value !== undefined ? vObj.value : (vObj.val !== undefined ? vObj.val : (vObj.default !== undefined ? vObj.default : vObj.defaultValue)))
          : vEntry;

        const id = ctrl.id || inferredVar || `ctrl_${resolved.length + 1}`;
        const label = ctrl.label || (vObj && vObj.label) || id;
        const min = (ctrl.hasMin !== false && typeof ctrl.min === 'number' && Number.isFinite(ctrl.min))
          ? ctrl.min
          : ((vObj && typeof vObj.min === 'number' && Number.isFinite(vObj.min)) ? vObj.min : (typeof ctrl.min === 'number' ? ctrl.min : 0));
        const max = (ctrl.hasMax !== false && typeof ctrl.max === 'number' && Number.isFinite(ctrl.max))
          ? ctrl.max
          : ((vObj && typeof vObj.max === 'number' && Number.isFinite(vObj.max)) ? vObj.max : (typeof ctrl.max === 'number' ? ctrl.max : 100));
        const step = (ctrl.hasStep !== false && typeof ctrl.step === 'number' && ctrl.step > 0)
          ? ctrl.step
          : ((vObj && typeof vObj.step === 'number' && vObj.step > 0) ? vObj.step : (typeof ctrl.step === 'number' && ctrl.step > 0 ? ctrl.step : 1));
        const defaultVal = ctrl.default !== undefined ? ctrl.default : (ctrl.val !== undefined ? ctrl.val : vVal);

        resolved.push({
          ...ctrl,
          id,
          type,
          label,
          bind: ctrl.bind || inferredVar || null,
          var: inferredVar || ctrl.bind || null,
          min,
          max,
          step,
          unit: ctrl.unit || (vObj && vObj.unit) || '',
          default: defaultVal,
          val: defaultVal,
          source: 'input'
        });
      }

      if (isSwfScene) return resolved;

      const varEntries = Object.entries(sceneVars);
      for (let i = 0; i < varEntries.length; i++) {
        const [vName, vDef] = varEntries[i];
        if (!vName || vName.startsWith('_') || INTERNAL_RUNTIME_VARS.has(vName)) continue;
        if (hasExplicitVar(vName)) continue;

        const isObj = vDef && typeof vDef === 'object' && !Array.isArray(vDef);
        const val = isObj
          ? (vDef.value !== undefined ? vDef.value : (vDef.val !== undefined ? vDef.val : (vDef.default !== undefined ? vDef.default : vDef.defaultValue)))
          : vDef;

        if (typeof val === 'boolean') {
          resolved.push({
            id: vName,
            type: 'toggle',
            label: (isObj && vDef.label) ? vDef.label : vName,
            bind: vName,
            var: vName,
            default: val,
            val,
            source: 'var'
          });
        } else if (
          typeof val === 'number' &&
          Number.isFinite(val) &&
          isObj &&
          vDef.hasExplicitBounds !== false &&
          typeof vDef.min === 'number' &&
          typeof vDef.max === 'number' &&
          Number.isFinite(vDef.min) &&
          Number.isFinite(vDef.max) &&
          vDef.min < vDef.max
        ) {
          resolved.push({
            id: vName,
            type: 'slider',
            label: vDef.label || vName,
            bind: vName,
            var: vName,
            min: vDef.min,
            max: vDef.max,
            step: (typeof vDef.step === 'number' && vDef.step > 0) ? vDef.step : 1,
            unit: vDef.unit || '',
            default: val,
            val,
            source: 'var'
          });
        }
      }

      return resolved;
    }

    _syncDeclarativeHudVar(hudEl, varName, nextVal) {
      if (!hudEl || typeof hudEl.querySelectorAll !== 'function') return;
      const isBatchReset = varName === '*';
      const cleanVar = isBatchReset ? '*' : this.normalizeVarName(String(varName || ''));
      const cleanLower = cleanVar.toLowerCase();

      const rows = hudEl.querySelectorAll('[data-param-var]');
      rows.forEach((row) => {
        const rawTarget = row.getAttribute('data-param-var') || '';
        const normTarget = this.normalizeVarName(rawTarget);
        const matches = isBatchReset || rawTarget === varName || normTarget === cleanVar || normTarget.toLowerCase() === cleanLower;
        if (!matches) return;

        const val = isBatchReset ? this.getMemoryVar(rawTarget) : nextVal;
        if (val === undefined) return;

        const slider = row.querySelector('input[type="range"]');
        if (slider) {
          if (String(slider.value) !== String(val)) slider.value = String(val);
          const display = row.querySelector('[data-param-readout]');
          if (display) display.textContent = String(val);
        }
        const sel = row.querySelector('select');
        if (sel && String(sel.value) !== String(val)) {
          sel.value = String(val);
        }
        const btn = row.querySelector('button[role="switch"]');
        if (btn) {
          const boolVal = Boolean(val);
          btn.setAttribute('aria-checked', String(boolVal));
          btn.style.background = boolVal ? '#0284c7' : '#475569';
          btn.textContent = boolVal ? 'ON' : 'OFF';
        }
      });
    }

    mountDeclarativeHud(scene) {
      if (!this.container) return;

      const doc = this.container.ownerDocument || (typeof document !== 'undefined' ? document : null);
      if (!doc) return;

      const existingHud = doc.querySelector('#ast-declarative-hud');
      if (existingHud) existingHud.remove();

      const paramHudOff = scene && scene.controls && (
        scene.controls['param-hud'] === false ||
        scene.controls[':param-hud'] === false ||
        scene.controls['param-hud'] === ':off' ||
        scene.controls['param-hud'] === 'off' ||
        scene.controls.paramHud === false
      );
      if (paramHudOff) return;

      // Defer to ASTPlayerUI overlay when mounted in the full player shell so two panels never overlap
      if (global.AST_UI && typeof global.AST_UI.projectControls === 'function') {
        global.AST_UI.projectControls(scene);
        return;
      }

      const inputs = this.resolveParameterControls(scene);
      if (!Array.isArray(inputs) || inputs.length === 0) return;

      let hostEl = this.container;
      while (
        hostEl &&
        ((typeof SVGElement !== 'undefined' && hostEl instanceof SVGElement) ||
          (hostEl.tagName && hostEl.tagName.toLowerCase() === 'svg'))
      ) {
        hostEl = hostEl.parentElement;
      }
      if (!hostEl) {
        hostEl = (typeof doc.getElementById === 'function' ? doc.getElementById('player-stage') : null) || doc.body;
      }
      if (!hostEl) return;

      if (hostEl.querySelector && hostEl.querySelector('#cartridge-controls-overlay:not(.hidden)')) {
        return;
      }

      if (typeof getComputedStyle === 'function' && hostEl.style) {
        try {
          if (getComputedStyle(hostEl).position === 'static') {
            hostEl.style.position = 'relative';
          }
        } catch (_) {}
      }

      const hud = doc.createElement('div');
      hud.id = 'ast-declarative-hud';
      hud.style.cssText = `
        position: absolute;
        top: clamp(58px, 11.5%, 76px);
        right: 12px;
        width: 264px;
        max-width: min(270px, calc(100% - 24px));
        max-height: calc(100% - 136px);
        background: rgba(15, 23, 42, 0.90);
        border: 1px solid rgba(56, 189, 248, 0.35);
        border-radius: 10px;
        color: #f8fafc;
        font-family: system-ui, sans-serif;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        z-index: 45;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
        user-select: none;
      `;

      const header = doc.createElement('div');
      header.style.cssText = 'font-weight: 700; color: #38bdf8; display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 12px; background:rgba(30, 41, 59, 0.72); border-bottom: 1px solid rgba(56, 189, 248, 0.2); flex-shrink: 0;';
      const titleSpan = doc.createElement('span');
      titleSpan.textContent = '⚡ Parameters';

      const toggleBtn = doc.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.id = 'ast-hud-toggle-btn';
      toggleBtn.setAttribute('aria-label', 'Toggle Parameters');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.style.cssText = 'background:transparent; border:none; color:#94a3b8; font-size:13px; cursor:pointer; padding:2px 6px; border-radius:4px; line-height:1;';
      toggleBtn.textContent = '▾';

      header.append(titleSpan, toggleBtn);
      hud.appendChild(header);

      const bodyEl = doc.createElement('div');
      bodyEl.id = 'ast-hud-body';
      bodyEl.style.cssText = 'padding: 10px 12px; display: flex; flex-direction: column; gap: 9px; overflow-y: auto; flex: 1 1 auto; min-height: 0; overscroll-behavior: contain;';
      hud.appendChild(bodyEl);

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = bodyEl.style.display !== 'none';
        bodyEl.style.display = isOpen ? 'none' : 'flex';
        toggleBtn.textContent = isOpen ? '▸' : '▾';
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      const getInitialVal = (vName, inp) => {
        const memVal = vName && typeof this.getMemoryVar === 'function' ? this.getMemoryVar(vName) : undefined;
        if (memVal !== undefined) return memVal;
        const rawSceneVar = vName && this.scene?.vars?.[vName];
        if (rawSceneVar !== undefined) {
          if (rawSceneVar && typeof rawSceneVar === 'object' && !Array.isArray(rawSceneVar)) {
            if (rawSceneVar.value !== undefined) return rawSceneVar.value;
            if (rawSceneVar.val !== undefined) return rawSceneVar.val;
            if (rawSceneVar.default !== undefined) return rawSceneVar.default;
          }
          return rawSceneVar;
        }
        return inp.val ?? inp.default ?? 0;
      };

      const commitVarChange = (vName, nextVal, action) => {
        if (action && typeof this.dispatchAction === 'function') {
          this.dispatchAction(action, [nextVal]);
        }
        if (vName) {
          if (typeof this.setMemoryVar === 'function') {
            this.setMemoryVar(vName, nextVal);
            if (typeof this.render === 'function') this.render(this.progress || 0);
            return;
          }
          if (this.vars) this.vars[vName] = nextVal;
          if (typeof this.updateComputedVars === 'function') this.updateComputedVars();
          if (typeof this.applyBindings === 'function') this.applyBindings(this.progress || 0);
          if (typeof this.render === 'function') this.render(this.progress || 0);
        }
      };

      for (const inp of inputs) {
        const vName = String(inp.var || inp.bind || '');
        const ctrlKey = String(inp.id || vName || `ctrl_${bodyEl.children.length}`);
        const curVal = getInitialVal(vName, inp);
        const row = doc.createElement('div');
        row.style.cssText = 'display:flex; flex-direction:column; gap:4px;';
        if (vName) row.setAttribute('data-param-var', vName);
        row.setAttribute('data-ctrl-id', ctrlKey);

        if (inp.type === 'button') {
          const actionBtn = doc.createElement('button');
          actionBtn.type = 'button';
          actionBtn.id = `hud-act-${ctrlKey}`;
          actionBtn.textContent = inp.label || ctrlKey;
          actionBtn.style.cssText = 'width:100%; cursor:pointer; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; border-radius:6px; padding:5px 10px; font-weight:700; font-size:11px;';
          actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (inp.action && typeof this.dispatchAction === 'function') {
              this.dispatchAction(inp.action);
            } else if (ctrlKey === 'reset' && typeof this.reset === 'function') {
              this.reset();
            }
          });
          row.appendChild(actionBtn);
        } else if (inp.type === 'select' || (Array.isArray(inp.options) && inp.options.length > 0)) {
          const line = doc.createElement('div');
          line.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:8px;';
          const labelSpan = doc.createElement('span');
          labelSpan.textContent = `${inp.label || vName || ctrlKey}`;
          const sel = doc.createElement('select');
          sel.id = `hud-sel-${ctrlKey}`;
          sel.style.cssText = 'background:#1e293b; color:#f8fafc; border:1px solid rgba(56,189,248,0.4); border-radius:4px; padding:3px 6px; font-size:11px; cursor:pointer;';
          (inp.options || []).forEach(optVal => {
            const opt = doc.createElement('option');
            opt.value = String(optVal);
            opt.textContent = String(optVal);
            if (String(optVal) === String(curVal)) opt.selected = true;
            sel.appendChild(opt);
          });
          sel.addEventListener('change', (e) => {
            commitVarChange(vName, e.target.value, inp.action);
          });
          line.append(labelSpan, sel);
          row.appendChild(line);
        } else if (inp.type === 'switch' || inp.type === 'toggle' || typeof curVal === 'boolean') {
          const line = doc.createElement('div');
          line.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:8px;';
          const labelSpan = doc.createElement('span');
          labelSpan.textContent = `${inp.label || vName || ctrlKey}`;

          const btn = doc.createElement('button');
          btn.id = `hud-btn-${ctrlKey}`;
          btn.type = 'button';
          btn.setAttribute('role', 'switch');
          btn.setAttribute('aria-checked', String(Boolean(curVal)));
          btn.style.cssText = `cursor:pointer; background:${curVal ? '#0284c7' : '#475569'}; color:#fff; border:none; border-radius:999px; padding:2px 10px; font-weight:700; font-size:10px;`;
          btn.textContent = curVal ? 'ON' : 'OFF';
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentVal = btn.getAttribute('aria-checked') === 'true';
            const nextVal = !currentVal;
            btn.setAttribute('aria-checked', String(nextVal));
            btn.style.background = nextVal ? '#0284c7' : '#475569';
            btn.textContent = nextVal ? 'ON' : 'OFF';
            commitVarChange(vName, nextVal, inp.action);
          });

          line.append(labelSpan, btn);
          row.appendChild(line);
        } else {
          const topLine = doc.createElement('div');
          topLine.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:8px;';
          const labelSpan = doc.createElement('span');
          labelSpan.textContent = inp.label || vName || ctrlKey;
          labelSpan.style.cssText = 'color:#cbd5e1; font-size:11px; font-weight:600;';

          const valBold = doc.createElement('b');
          valBold.id = `hud-val-${ctrlKey}`;
          valBold.setAttribute('data-param-readout', vName || ctrlKey);
          valBold.style.cssText = 'color:#fde047; font-size:11px; font-family:ui-monospace, monospace;';
          valBold.textContent = String(curVal);
          topLine.append(labelSpan, valBold);

          const rangeInp = doc.createElement('input');
          rangeInp.type = 'range';
          rangeInp.id = `hud-inp-${ctrlKey}`;
          if (inp.min !== undefined) rangeInp.min = String(inp.min);
          if (inp.max !== undefined) rangeInp.max = String(inp.max);
          rangeInp.step = String(inp.step || 1);
          rangeInp.value = String(curVal);
          rangeInp.style.cssText = 'cursor:pointer; width:100%; accent-color:#38bdf8;';
          rangeInp.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            valBold.textContent = String(val);
            commitVarChange(vName, val, inp.action);
          });

          row.append(topLine, rangeInp);
        }
        bodyEl.appendChild(row);
      }

      hostEl.appendChild(hud);

      if (!this._declarativeHudVarSyncBound && typeof this.on === 'function') {
        this._declarativeHudVarSyncBound = true;
        this.on('varchange', (data) => {
          if (!data || !data.name) return;
          const activeDoc = this.container?.ownerDocument || (typeof document !== 'undefined' ? document : null);
          const activeHud = activeDoc ? activeDoc.querySelector('#ast-declarative-hud') : null;
          if (activeHud) {
            this._syncDeclarativeHudVar(activeHud, data.name, data.value);
          }
        });
      }
    }
  }

  const ASTHudControls = {};
  const _proto = ASTHudControlsMethods.prototype;
  const _names = Object.getOwnPropertyNames(_proto);
  for (let i = 0; i < _names.length; i++) {
    const _name = _names[i];
    if (_name !== 'constructor') {
      ASTHudControls[_name] = _proto[_name];
    }
  }

  global.ASTHudControls = ASTHudControls;
  if (typeof window !== 'undefined') {
    window.ASTHudControls = ASTHudControls;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
