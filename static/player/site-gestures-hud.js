/**
 * static/player/site-gestures-hud.js
 *
 * St Joseph's Educational Media Suite - Stage Glass HUD, Pedagogical X-Ray & Parameters Dock
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Zero-dependency UMD/IIFE peer module for ASTDirectGestureSubsystem.
 * Provides the stage-embedded floating glass HUD toolbar, Pedagogical X-Ray discovery tooltip,
 * SVG touch ripple feedback, and fallback live simulation parameters dock.
 * Loaded strictly before site-gestures.js.
 */

(function (global) {
  'use strict';

  function _rebuildGlassHud() {
    const container = this.stageSvg && this.stageSvg.parentNode;
    if (!container) return;
    const existing = typeof container.querySelector === 'function' ? container.querySelector('#stage-glass-hud-ui') : null;
    if (existing && typeof existing.remove === 'function') existing.remove();
    this.setupGlassHud();
  }

  function setupGlassHud() {
    const container = this.stageSvg && this.stageSvg.parentNode;
    if (!container || (typeof container.querySelector === 'function' && container.querySelector('#stage-glass-hud-ui'))) return;

    const wbCfg = (this.playerProfile && this.playerProfile.whiteboard) || {};
    const tools = Array.isArray(wbCfg.tools) ? wbCfg.tools : [];
    const widthValues = Array.isArray(wbCfg.widths) ? wbCfg.widths : [];
    const colors = Array.isArray(wbCfg.palette) ? wbCfg.palette : [];

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
    const toolBtns = [];
    tools.forEach(t => {
      const btn = this.createHudButton(t.icon, t.title || t.id, () => {
        this.currentTool = t.id;
        this.currentInkWidth = t.width;
        if (this.stageSvg && this.stageSvg.style) {
          this.stageSvg.style.cursor = (t.id === 'eraser') ? 'cell' : 'crosshair';
        }
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
          if (this.stageSvg && this.stageSvg.style) {
            this.stageSvg.style.cursor = 'crosshair';
          }
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
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
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

  function createHudButton(icon, title, onClick) {
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
  // X-Ray Pedagogical Knowledge Tooltip & Touch Ripples
  // =========================================================================

  function setupXRayTooltip() {
    const container = this.stageSvg && this.stageSvg.parentNode;
    if (!container || (typeof container.querySelector === 'function' && container.querySelector('#stage-xray-tooltip'))) return;

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

  function showXRayPopup(pedId, svgX, svgY, pedNode = null) {
    if (!this.xrayTooltip || !this._isControlEnabled('xray')) return;
    let info = null;

    if (pedNode && typeof pedNode.getAttribute === 'function') {
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

    const rect = (this.stageSvg && typeof this.stageSvg.getBoundingClientRect === 'function')
      ? this.stageSvg.getBoundingClientRect()
      : { left: 0, top: 0, width: 800, height: 480 };
    const clientX = rect.left + (svgX / 800) * rect.width;
    const clientY = rect.top + (svgY / 480) * rect.height;
    const maxW = (typeof window !== 'undefined' && typeof window.innerWidth === 'number') ? window.innerWidth : 1024;

    this.xrayTooltip.style.left = `${Math.min(maxW - 250, clientX + 15)}px`;
    this.xrayTooltip.style.top = `${Math.max(10, clientY - 40)}px`;
    this.xrayTooltip.style.display = 'block';
  }

  function hideXRayPopup() {
    if (this.xrayTooltip) {
      this.xrayTooltip.style.display = 'none';
    }
  }

  function createTouchRipple(x, y) {
    if (!this.hudRoot) return;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toFixed(1));
    circle.setAttribute('cy', y.toFixed(1));
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#38bdf8');
    circle.setAttribute('stroke-width', '2');
    if (circle.style) circle.style.transition = 'all 0.4s ease-out';
    this.hudRoot.appendChild(circle);

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        circle.setAttribute('r', '32');
        circle.setAttribute('opacity', '0');
        setTimeout(() => {
          if (typeof circle.remove === 'function') circle.remove();
          else if (circle.parentNode) circle.parentNode.removeChild(circle);
        }, 420);
      });
    }
  }

  // =========================================================================
  // Live Simulation Parameters & Controls HUD Dock (Gated by :param-hud)
  // =========================================================================

  function setupSimParametersHud() {
    const container = this.stageSvg && this.stageSvg.parentNode;
    if (!container || !this.engine) return;

    let hud = typeof container.querySelector === 'function' ? container.querySelector('#stage-sim-parameters') : null;
    const scene = this.engine.scene;

    if (
      !this._isControlEnabled('param-hud') ||
      !scene ||
      (scene.uiControls && scene.uiControls.length > 0) ||
      (typeof container.querySelector === 'function' && container.querySelector('#cartridge-controls-overlay:not(.hidden)')) ||
      (typeof container.querySelector === 'function' && container.querySelector('#ast-declarative-hud'))
    ) {
      if (hud) hud.style.display = 'none';
      return;
    }

    let inputs = [];
    if (typeof this.engine.resolveParameterControls === 'function') {
      inputs = this.engine.resolveParameterControls(scene).filter(c => c && c.type === 'slider');
    } else {
      inputs = Array.isArray(scene.inputs) && scene.inputs.length > 0 ? [...scene.inputs] : [];
      if (inputs.length === 0 && scene.vars && typeof scene.vars === 'object') {
        Object.entries(scene.vars).forEach(([k, v]) => {
          if (v && typeof v === 'object' && v.hasExplicitBounds !== false && typeof v.min === 'number' && typeof v.max === 'number' && v.min < v.max) {
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
        top: clamp(58px, 11.5%, 76px);
        right: 12px;
        min-width: 230px;
        max-width: min(270px, calc(100% - 24px));
        max-height: calc(100% - 136px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
        padding: 10px 14px;
        color: #f8fafc;
        z-index: 45;
        user-select: none;
        font-family: ui-sans-serif, system-ui, sans-serif;
        font-size: 12px;
        transition: opacity 0.2s ease;
      `;
      container.appendChild(hud);
    } else {
      hud.style.display = 'flex';
    }

    const currentVars = this.engine.vars || {};

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px; flex-shrink:0;';
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
    paramBody.style.cssText = 'display:flex; flex-direction:column; gap:8px; overflow-y:auto; flex:1 1 auto; min-height:0; overscroll-behavior:contain;';

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

    if (typeof hud.replaceChildren === 'function') {
      hud.replaceChildren(headerRow, paramBody);
    } else {
      hud.textContent = '';
      hud.appendChild(headerRow);
      hud.appendChild(paramBody);
    }

    const applyVal = (vName, val) => {
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar(vName, val);
      }
      const s = typeof hud.querySelector === 'function' ? hud.querySelector(`.sim-param-slider[data-var="${vName}"]`) : null;
      const num = typeof hud.querySelector === 'function' ? hud.querySelector(`.sim-param-num-input[data-var="${vName}"]`) : null;
      if (s && Number(s.value) !== val) s.value = val;
      if (num && Number(num.value) !== val) num.value = val;
    };

    const sliders = typeof hud.querySelectorAll === 'function' ? hud.querySelectorAll('.sim-param-slider') : [];
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const vName = e.target.getAttribute('data-var');
        const val = parseFloat(e.target.value);
        applyVal(vName, val);
        this.playAudioTone(400 + val * 10, 'sine', 0.02, 0.05);
      });
    });

    const numInputs = typeof hud.querySelectorAll === 'function' ? hud.querySelectorAll('.sim-param-num-input') : [];
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

    const btnReset = typeof hud.querySelector === 'function' ? hud.querySelector('#sim-btn-reset-vars') : null;
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (this.engine) this.engine.resetVars();
        this.setupSimParametersHud();
        this.playAudioTone(523, 'triangle', 0.08, 0.15);
      });
    }

    const btnCollapse = typeof hud.querySelector === 'function' ? hud.querySelector('#sim-btn-collapse') : null;
    const body = typeof hud.querySelector === 'function' ? hud.querySelector('#sim-param-body') : null;
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
        const curHud = (typeof document !== 'undefined' && document.getElementById('stage-sim-parameters')) ||
          (container && typeof container.querySelector === 'function' && container.querySelector('#stage-sim-parameters'));
        if (curHud && curHud.style.display !== 'none') {
          const sList = typeof curHud.querySelectorAll === 'function' ? curHud.querySelectorAll('.sim-param-slider') : [];
          sList.forEach(s => {
            const vName = s.getAttribute('data-var');
            if (data.name === '*' || data.name === vName) {
              const val = (data.vars && data.vars[vName] !== undefined) ? data.vars[vName] : data.value;
              if (val !== undefined) {
                if (Number(s.value) !== Number(val)) s.value = val;
                const numInput = typeof curHud.querySelector === 'function' ? curHud.querySelector(`.sim-param-num-input[data-var="${vName}"]`) : null;
                if (numInput && Number(numInput.value) !== Number(val)) numInput.value = val;
              }
            }
          });
        }
      });
    }
  }

  const ASTGesturesHud = {
    _rebuildGlassHud,
    setupGlassHud,
    createHudButton,
    setupXRayTooltip,
    showXRayPopup,
    hideXRayPopup,
    createTouchRipple,
    setupSimParametersHud
  };

  global.ASTGesturesHud = ASTGesturesHud;
  if (typeof window !== 'undefined') window.ASTGesturesHud = ASTGesturesHud;
  if (typeof module !== 'undefined' && module.exports) module.exports = ASTGesturesHud;

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
