/**
 * static/player/site-gestures-whiteboard.js
 *
 * St Joseph's Educational Media Suite - Smartboard & Stylus Bézier Ink Whiteboard Subsystem
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Zero-dependency UMD/IIFE peer module for ASTDirectGestureSubsystem.
 * Provides quadratic Bézier SVG ink drawing, eraser hit-testing, undo/redo stacks,
 * deterministic AST S-expression & JSON serialization, session persistence,
 * WebRTC/postMessage classroom ink broadcasting, floating notices, and pen toggles.
 * Loaded strictly before site-gestures.js.
 */

(function (global) {
  'use strict';

  function handleWhiteboardMessage(ev) {
    if (!ev || !ev.data) return;
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
      } else if (typeof raw === 'object' && raw !== null) {
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
  }

  function startInkStroke(pt) {
    if (!this.inkRoot) return;
    const x = Number(pt.x.toFixed(1));
    const y = Number(pt.y.toFixed(1));
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.currentInkColor);
    path.setAttribute('stroke-width', this.currentInkWidth.toString());

    const wbTools = (this.playerProfile && this.playerProfile.whiteboard && Array.isArray(this.playerProfile.whiteboard.tools))
      ? this.playerProfile.whiteboard.tools
      : [];
    const toolCfg = wbTools.find(t => t.id === this.currentTool);
    if (this.currentTool === 'highlighter') {
      path.setAttribute('stroke-opacity', String(toolCfg && toolCfg.opacity !== undefined ? toolCfg.opacity : 0.45));
      path.setAttribute('stroke-linecap', (toolCfg && toolCfg.cap) || 'square');
      path.setAttribute('stroke-linejoin', 'bevel');
      if (path.style) path.style.mixBlendMode = (toolCfg && toolCfg.blend) || 'multiply';
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

  function continueInkStroke(pt) {
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

  function endInkStroke() {
    if (!this.currentStroke) return;
    this.currentStroke = null;
    this.persistInkToSession();
  }

  function eraseStrokeAt(pt) {
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

  function undoLastStroke() {
    if (!this.inkRoot || this.strokes.length === 0) return;
    const last = this.strokes.pop();
    if (last) {
      const el = last.element || (typeof Element !== 'undefined' && last instanceof Element ? last : null);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      if (!this._undoStack) this._undoStack = [];
      this._undoStack.push(last);
    }
    this.persistInkToSession();
    this._playNamedTone('undo');
  }

  function redoLastStroke() {
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

  function clearWhiteboardInk() {
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

  function exportInkToAST(options = {}) {
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

  function importInkFromAST(astString, options = {}) {
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

  function exportInkToJSON() {
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

  function importInkFromJSON(data, options = {}) {
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

  function broadcastInkSession() {
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
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage(payload, '*');
      }
    } catch {}

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('ast-ink-broadcast', { detail: payload }));
    }
    this.showFloatingNotice(`📡 Broadcasted ${this.strokes.length} strokes to Class Mesh!`);
    this.playAudioTone(880, 'sine', 0.1);
  }

  function persistInkToSession() {
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

  function restoreInkFromSession() {
    this.strokes = [];
    this._undoStack = [];
    if (this.inkRoot) {
      if (typeof this.inkRoot.replaceChildren === 'function') this.inkRoot.replaceChildren();
      else this.inkRoot.textContent = '';
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

  function showFloatingNotice(message) {
    const container = (this.stageSvg && this.stageSvg.parentNode) || (typeof document !== 'undefined' ? document.body : null);
    if (!container) return;
    let toast = typeof container.querySelector === 'function' ? container.querySelector('#stage-ink-notice') : null;
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

  function togglePen(forceState) {
    const wbAllowed = this._isControlEnabled('whiteboard');
    if (forceState !== false && !wbAllowed) return;

    const prevActive = this.isPenActive;
    this.isPenActive = (forceState !== undefined) ? Boolean(forceState) : !this.isPenActive;
    const penBtn = typeof document !== 'undefined' ? document.getElementById('stage-hud-pen-btn') : null;
    if (penBtn) {
      penBtn.style.background = this.isPenActive ? '#eab308' : 'rgba(255, 255, 255, 0.08)';
      penBtn.style.color = this.isPenActive ? '#090d16' : '#ffffff';
    }
    const headerPen = typeof document !== 'undefined' ? document.getElementById('btn-pen') : null;
    if (headerPen) {
      headerPen.classList.toggle('active', this.isPenActive);
    }
    if (this.stageSvg && this.stageSvg.style) {
      this.stageSvg.style.cursor = this.isPenActive ? (this.currentTool === 'eraser' ? 'cell' : 'crosshair') : 'default';
    }

    const penTools = typeof document !== 'undefined' ? document.getElementById('stage-hud-pen-tools') : null;
    const penPalette = typeof document !== 'undefined' ? document.getElementById('stage-hud-pen-palette') : null;
    const penWidths = typeof document !== 'undefined' ? document.getElementById('stage-hud-pen-widths') : null;
    const inkExtraActions = typeof document !== 'undefined' ? document.getElementById('stage-hud-ink-actions') : null;
    const clearBtn = typeof document !== 'undefined' ? document.getElementById('stage-hud-clear-btn') : null;

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

  const ASTGesturesWhiteboard = {
    handleWhiteboardMessage,
    startInkStroke,
    continueInkStroke,
    endInkStroke,
    eraseStrokeAt,
    undoLastStroke,
    redoLastStroke,
    clearWhiteboardInk,
    exportInkToAST,
    importInkFromAST,
    exportInkToJSON,
    importInkFromJSON,
    broadcastInkSession,
    persistInkToSession,
    restoreInkFromSession,
    showFloatingNotice,
    togglePen
  };

  global.ASTGesturesWhiteboard = ASTGesturesWhiteboard;
  if (typeof window !== 'undefined') window.ASTGesturesWhiteboard = ASTGesturesWhiteboard;
  if (typeof module !== 'undefined' && module.exports) module.exports = ASTGesturesWhiteboard;

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
