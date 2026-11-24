/**
 * static/player/ast-avm1-vm.js
 *
 * St Joseph's AST Vector Media Player — Lazy-Loaded Pure-SVG AVM1 Micro-VM
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Zero-dependency ActionScript 1.0 / 2.0 (AVM1) bytecode interpreter + live
 * hierarchical MovieClip / Button / DefineEditText / Drawing-API runtime
 * driving 100% pure W3C SVG DOM (<g>, <path>, <text>, <clipPath>).
 *
 * Loaded on-demand via ASTLazyLoader ONLY when an SWF cartridge carries (:swf-vm "...").
 * Adds 0 bytes to the initial SPA boot shell and 0 bytes to standard AST cartridges.
 */

(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const MAX_OPS_PER_EXEC = 60000;
  const TICK_OPS_BUDGET = 45000;
  const BOOT_OPS_BUDGET = 150000;
  const TICK_TIME_BUDGET_MS = 10;
  const BOOT_TIME_BUDGET_MS = 35;
  const MAX_CALL_DEPTH = 64;
  const MAX_LIVE_CLIPS = 512;
  const MAX_CHILDREN_PER_CLIP = 256;
  const MAX_DRAW_PATHS = 512;
  const MAX_TRACES = 200;

  let _sharedDomParser = null;
  function _nowMs() {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  }
  function matEquals(a, b) {
    if (a === b) return true;
    if (!a || !b || a.length < 6 || b.length < 6) return false;
    return (
      a[0] === b[0] && a[1] === b[1] && a[2] === b[2] &&
      a[3] === b[3] && a[4] === b[4] && a[5] === b[5]
    );
  }

  // ClipEventFlags bitmasks (SWF 5/6+)
  const CE_LOAD = 0x0001;
  const CE_ENTER_FRAME = 0x0002;
  const CE_UNLOAD = 0x0004;
  const CE_MOUSE_MOVE = 0x0008;
  const CE_MOUSE_DOWN = 0x0010;
  const CE_MOUSE_UP = 0x0020;
  const CE_KEY_DOWN = 0x0040;
  const CE_KEY_UP = 0x0080;
  const CE_PRESS = 0x0400;
  const CE_RELEASE = 0x0800;
  const CE_RELEASE_OUTSIDE = 0x1000;
  const CE_ROLL_OVER = 0x2000;
  const CE_ROLL_OUT = 0x4000;
  const CE_KEY_PRESS = 0x20000;

  // Flash ButtonCondAction flags
  const BTN_IDLE_TO_OVER_UP = 0x0001;
  const BTN_OVER_UP_TO_IDLE = 0x0002;
  const BTN_OVER_UP_TO_OVER_DOWN = 0x0004;
  const BTN_OVER_DOWN_TO_OVER_UP = 0x0008;
  const BTN_OVER_DOWN_TO_OUT_DOWN = 0x0010;
  const BTN_OUT_DOWN_TO_OVER_DOWN = 0x0020;
  const BTN_OUT_DOWN_TO_IDLE = 0x0040;
  const BTN_IDLE_TO_OVER_DOWN = 0x0080;
  const BTN_OVER_DOWN_TO_IDLE = 0x0100;

  // Flash ActionGetProperty / ActionSetProperty index table (0..21)
  const PROP_BY_INDEX = [
    '_x', '_y', '_xscale', '_yscale', '_currentframe', '_totalframes',
    '_alpha', '_visible', '_width', '_height', '_rotation', '_target',
    '_framesloaded', '_name', '_droptarget', '_url', '_highquality',
    '_focusrect', '_soundbuftime', '_quality', '_xmouse', '_ymouse'
  ];

  // Flash Button CondKeyPress codes (1..19 special, 32..126 ASCII) -> DOM keyCode
  const BTN_KEY_TO_FLASH_CODE = {
    1: 37, 2: 39, 3: 36, 4: 35, 5: 45, 6: 46,
    8: 8, 13: 13, 14: 38, 15: 40, 16: 33, 17: 34, 18: 9, 19: 27
  };

  function decodeBase64ToBytes(b64) {
    if (!b64) return new Uint8Array(0);
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
      const buf = Buffer.from(b64, 'base64');
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    if (typeof atob === 'function') {
      const bin = atob(b64);
      const len = bin.length;
      const out = new Uint8Array(len);
      for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    return new Uint8Array(0);
  }

  function decodeBase64Json(b64) {
    const bytes = decodeBase64ToBytes(b64);
    let str = '';
    if (typeof TextDecoder !== 'undefined') {
      str = new TextDecoder('utf-8').decode(bytes);
    } else if (typeof Buffer !== 'undefined') {
      str = Buffer.from(bytes).toString('utf8');
    } else {
      for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    }
    return JSON.parse(str);
  }

  function readCString(bytes, pos, end) {
    let s = '';
    while (pos < end) {
      const b = bytes[pos++];
      if (b === 0) break;
      s += String.fromCharCode(b);
    }
    return { value: s, next: pos };
  }

  function readUI16(bytes, pos) {
    return (bytes[pos] | (bytes[pos + 1] << 8)) & 0xffff;
  }

  function readSI16(bytes, pos) {
    const v = readUI16(bytes, pos);
    return v & 0x8000 ? v - 0x10000 : v;
  }

  function readSI32(bytes, pos) {
    return (
      bytes[pos] |
      (bytes[pos + 1] << 8) |
      (bytes[pos + 2] << 16) |
      (bytes[pos + 3] << 24)
    ) | 0;
  }

  const _f32Buf = new ArrayBuffer(4);
  const _f32U8 = new Uint8Array(_f32Buf);
  const _f32View = new DataView(_f32Buf);
  function readFloat32(bytes, pos) {
    _f32U8[0] = bytes[pos];
    _f32U8[1] = bytes[pos + 1];
    _f32U8[2] = bytes[pos + 2];
    _f32U8[3] = bytes[pos + 3];
    return _f32View.getFloat32(0, true);
  }

  const _f64Buf = new ArrayBuffer(8);
  const _f64U8 = new Uint8Array(_f64Buf);
  const _f64View = new DataView(_f64Buf);
  function readSwfDouble(bytes, pos) {
    // SWF stores high 32-bit word first, then low 32-bit word (little-endian within each word)
    _f64U8[4] = bytes[pos];
    _f64U8[5] = bytes[pos + 1];
    _f64U8[6] = bytes[pos + 2];
    _f64U8[7] = bytes[pos + 3];
    _f64U8[0] = bytes[pos + 4];
    _f64U8[1] = bytes[pos + 5];
    _f64U8[2] = bytes[pos + 6];
    _f64U8[3] = bytes[pos + 7];
    return _f64View.getFloat64(0, true);
  }

  function fmtNum(n) {
    if (!Number.isFinite(n)) return '0';
    const c = Math.abs(n) < 1e-5 ? 0 : Math.round(n * 1000) / 1000;
    return String(c === 0 ? 0 : c);
  }

  // Matrix math: [a, b, c, d, tx, ty]
  function mulMat(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
    ];
  }

  function invertMat(m) {
    const det = m[0] * m[3] - m[1] * m[2];
    if (Math.abs(det) < 1e-9) return [1, 0, 0, 1, -m[4], -m[5]];
    const inv = 1 / det;
    return [
      m[3] * inv,
      -m[1] * inv,
      -m[2] * inv,
      m[0] * inv,
      (m[2] * m[5] - m[3] * m[4]) * inv,
      (m[1] * m[4] - m[0] * m[5]) * inv,
    ];
  }

  function applyMatPt(m, x, y) {
    return {
      x: m[0] * x + m[2] * y + m[4],
      y: m[1] * x + m[3] * y + m[5],
    };
  }

  function decomposeMat(m) {
    if (!m) return { x: 0, y: 0, xscale: 100, yscale: 100, rotation: 0 };
    const a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
    const sx = Math.hypot(a, b);
    const det = a * d - b * c;
    let sy = Math.hypot(c, d);
    if (det < 0) sy = -sy;
    const rot = Math.atan2(b, a) * (180 / Math.PI);
    return {
      x: tx,
      y: ty,
      xscale: sx * 100,
      yscale: sy * 100,
      rotation: rot,
    };
  }

  function composeMat(x, y, xscale, yscale, rotation) {
    const rad = (rotation || 0) * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const sx = (xscale === undefined ? 100 : xscale) / 100;
    const sy = (yscale === undefined ? 100 : yscale) / 100;
    return [cos * sx, sin * sx, -sin * sy, cos * sy, x || 0, y || 0];
  }

  function decodeBytecodeSlice(bytes, start, end) {
    const instrs = [];
    const offsetToIdx = new Map();
    let pos = start;
    while (pos < end) {
      const off = pos;
      const code = bytes[pos++];
      if (code === 0) break;
      let len = 0;
      if (code >= 0x80) {
        if (pos + 1 >= end) break;
        len = readUI16(bytes, pos);
        pos += 2;
      }
      const pStart = pos;
      const pEnd = Math.min(end, pos + len);
      offsetToIdx.set(off, instrs.length);
      instrs.push({ off, end: pEnd, code, pStart, pEnd });
      pos = pEnd;
    }
    offsetToIdx.set(pos, instrs.length);
    return { bytes, start, end, instrs, offsetToIdx };
  }

  function mapEventKeyToFlashCode(e) {
    if (!e) return 0;
    if (typeof e.keyCode === 'number' && e.keyCode > 0) return e.keyCode;
    const code = e.code || '';
    if (code === 'ArrowLeft') return 37;
    if (code === 'ArrowUp') return 38;
    if (code === 'ArrowRight') return 39;
    if (code === 'ArrowDown') return 40;
    if (code === 'Space') return 32;
    if (code === 'Enter') return 13;
    if (code === 'Escape') return 27;
    if (code === 'ShiftLeft' || code === 'ShiftRight') return 16;
    if (code === 'ControlLeft' || code === 'ControlRight') return 17;
    if (code === 'Backspace') return 8;
    if (code === 'Tab') return 9;
    if (code.startsWith('Key') && code.length === 4) return code.charCodeAt(3);
    if (code.startsWith('Digit') && code.length === 6) return code.charCodeAt(5);
    return 0;
  }

  /**
   * Lightweight SVG DOM helper that works identically in real browsers (DOMParser + createElementNS)
   * and headless Node test harnesses (mock SVG document).
   */
  function createSvgEl(doc, tag) {
    if (doc && typeof doc.createElementNS === 'function') {
      return doc.createElementNS(SVG_NS, tag);
    }
    const attrs = new Map();
    const children = [];
    const el = {
      tagName: tag.toUpperCase(),
      nodeName: tag,
      nodeType: 1,
      id: '',
      attrs,
      children,
      childNodes: children,
      parentNode: null,
      style: {},
      _textContent: '',
      get textContent() { return this._textContent; },
      set textContent(v) { this._textContent = String(v == null ? '' : v); },
      setAttribute(k, v) {
        const s = String(v);
        attrs.set(k, s);
        if (k === 'id') this.id = s;
      },
      getAttribute(k) { return attrs.has(k) ? attrs.get(k) : null; },
      removeAttribute(k) { attrs.delete(k); if (k === 'id') this.id = ''; },
      hasAttribute(k) { return attrs.has(k); },
      appendChild(child) {
        if (!child) return child;
        if (child.parentNode && child.parentNode !== this && typeof child.parentNode.removeChild === 'function') {
          child.parentNode.removeChild(child);
        }
        child.parentNode = this;
        children.push(child);
        return child;
      },
      removeChild(child) {
        const idx = children.indexOf(child);
        if (idx !== -1) {
          children.splice(idx, 1);
          child.parentNode = null;
        }
        return child;
      },
      insertBefore(child, ref) {
        if (!ref) return this.appendChild(child);
        if (child.parentNode && typeof child.parentNode.removeChild === 'function') {
          child.parentNode.removeChild(child);
        }
        const idx = children.indexOf(ref);
        child.parentNode = this;
        if (idx === -1) children.push(child);
        else children.splice(idx, 0, child);
        return child;
      },
      replaceChildren(...nodes) {
        for (let i = 0; i < children.length; i++) children[i].parentNode = null;
        children.length = 0;
        for (let i = 0; i < nodes.length; i++) this.appendChild(nodes[i]);
      },
      addEventListener(ev, fn) {
        if (!this._listeners) this._listeners = new Map();
        if (!this._listeners.has(ev)) this._listeners.set(ev, []);
        this._listeners.get(ev).push(fn);
      },
      removeEventListener(ev, fn) {
        if (!this._listeners || !this._listeners.has(ev)) return;
        const arr = this._listeners.get(ev);
        const i = arr.indexOf(fn);
        if (i !== -1) arr.splice(i, 1);
      },
      dispatchEvent(ev) {
        const list = this._listeners && this._listeners.get(ev.type);
        if (list) {
          for (let i = 0; i < list.length; i++) list[i](ev);
        }
        return true;
      },
      cloneNode(deep) {
        const c = createSvgEl(null, tag);
        attrs.forEach((v, k) => c.setAttribute(k, v));
        c._textContent = this._textContent;
        if (deep) {
          for (let i = 0; i < children.length; i++) {
            c.appendChild(children[i].cloneNode(true));
          }
        }
        return c;
      },
      querySelector(sel) {
        if (!sel) return null;
        if (sel.startsWith('#')) {
          const tid = sel.slice(1);
          if (this.id === tid) return this;
          for (let i = 0; i < children.length; i++) {
            const hit = children[i].querySelector(sel);
            if (hit) return hit;
          }
          return null;
        }
        for (let i = 0; i < children.length; i++) {
          if (children[i].nodeName === sel || children[i].tagName === sel.toUpperCase()) return children[i];
          const hit = children[i].querySelector(sel);
          if (hit) return hit;
        }
        return null;
      },
    };
    return el;
  }

  const _FLAT_SVG_SHAPE_RE = /^(?:\s*<(path|rect|circle|ellipse|polygon|polyline|line)\b([^>]*?)\/>\s*)+$/i;
  const _OUTER_G_WRAP_RE = /^\s*<g\b[^>]*>([\s\S]*?)<\/g>\s*$/i;
  const _EMPTY_G_RE = /^\s*<g\b[^>]*\/>\s*$/i;
  const _SINGLE_TAG_RE = /<(path|rect|circle|ellipse|polygon|polyline|line)\b([^>]*?)\/>/gi;
  const _ATTR_RE = /([a-zA-Z0-9_:-]+)="([^"]*)"/g;

  function parseSvgSnippetToNode(doc, svgSnippet) {
    if (!svgSnippet) return createSvgEl(doc, 'g');
    if (_EMPTY_G_RE.test(svgSnippet)) return createSvgEl(doc, 'g');
    let candidate = svgSnippet;
    const gWrap = _OUTER_G_WRAP_RE.exec(candidate);
    if (gWrap) candidate = gWrap[1];
    // Fast zero-DOMParser path for flat self-closing vector primitives emitted by swfAstParser
    if (!candidate.includes('&') && _FLAT_SVG_SHAPE_RE.test(candidate)) {
      const g = createSvgEl(doc, 'g');
      _SINGLE_TAG_RE.lastIndex = 0;
      let m;
      while ((m = _SINGLE_TAG_RE.exec(candidate)) !== null) {
        const node = createSvgEl(doc, m[1].toLowerCase());
        _ATTR_RE.lastIndex = 0;
        let am;
        while ((am = _ATTR_RE.exec(m[2])) !== null) {
          if (!/^on/i.test(am[1])) node.setAttribute(am[1], am[2]);
        }
        g.appendChild(node);
      }
      return g;
    }
    const wrapped = `<svg xmlns="${SVG_NS}">${svgSnippet}</svg>`;
    if (typeof DOMParser !== 'undefined' && doc && typeof doc.importNode === 'function') {
      try {
        if (!_sharedDomParser) _sharedDomParser = new DOMParser();
        const parsed = _sharedDomParser.parseFromString(wrapped, 'image/svg+xml');
        const root = parsed && parsed.documentElement;
        if (root && !root.querySelector('parsererror')) {
          // Strip unsafe elements/attrs defensively
          const bad = root.querySelectorAll('script, foreignObject');
          for (let i = 0; i < bad.length; i++) bad[i].remove();
          const all = root.querySelectorAll('*');
          for (let i = 0; i < all.length; i++) {
            const attrs = all[i].attributes;
            if (!attrs) continue;
            for (let j = attrs.length - 1; j >= 0; j--) {
              if (/^on/i.test(attrs[j].name)) all[i].removeAttribute(attrs[j].name);
            }
          }
          const g = createSvgEl(doc, 'g');
          while (root.firstChild) {
            g.appendChild(doc.importNode(root.firstChild, true));
          }
          return g;
        }
      } catch (_) {}
    }
    // Lightweight fallback parser for headless Node testing
    const g = createSvgEl(doc, 'g');
    const tagRe = /<(path|rect|circle|ellipse|polygon|polyline|line|text|g)\b([^>]*?)(\/?)>/gi;
    let m;
    while ((m = tagRe.exec(svgSnippet)) !== null) {
      const node = createSvgEl(doc, m[1].toLowerCase());
      const aRe = /([a-zA-Z0-9_:-]+)="([^"]*)"/g;
      let am;
      while ((am = aRe.exec(m[2])) !== null) {
        if (!/^on/i.test(am[1])) node.setAttribute(am[1], am[2]);
      }
      g.appendChild(node);
    }
    return g;
  }

  /**
   * Live AVM1 TextField backed by a pure W3C SVG <text> node.
   */
  class AVM1TextField {
    constructor(vm, charId, def, parentClip, depth, instName) {
      this._vm = vm;
      this._isTextField = true;
      this.charId = charId;
      this.def = def;
      this._parent = parentClip;
      this._depth = depth;
      this._name = instName || '';
      this._x = 0;
      this._y = 0;
      this._xscale = 100;
      this._yscale = 100;
      this._rotation = 0;
      this._alpha = 100;
      this._visible = true;
      this._rawMatrix = null;
      this._scriptModifiedTransform = false;
      this._variable = def.v || '';
      this._text = def.t || '';
      this._lastRenderedText = null;
      this._lastTransform = '';
      this._lastOpacity = '';
      this._lastVis = '';

      this.svgEl = createSvgEl(vm.doc, 'g');
      this.svgEl.setAttribute('data-avm1-text', String(charId));
      if (this._name) this.svgEl.setAttribute('data-swf-name', this._name);

      const align = def.al || 0;
      const anchor = align === 1 ? 'end' : (align === 2 ? 'middle' : 'start');
      const tx = align === 1 ? (def.x + def.w) : (align === 2 ? (def.x + def.w / 2) : def.x);
      const fs = def.fs || 14;
      const ty = def.y + Math.min(def.h || fs, Math.max(fs, (def.h || fs) * 0.72));

      this.textEl = createSvgEl(vm.doc, 'text');
      this.textEl.setAttribute('x', fmtNum(tx));
      this.textEl.setAttribute('y', fmtNum(ty));
      this.textEl.setAttribute('fill', def.col || '#ffffff');
      this.textEl.setAttribute('font-size', String(fs));
      this.textEl.setAttribute('text-anchor', anchor);
      this.textEl.setAttribute('font-family', 'system-ui, sans-serif');
      this.textEl.setAttribute('font-weight', '600');
      this.textEl.setAttribute('pointer-events', 'none');
      if (this._variable) this.textEl.setAttribute('data-swf-var', this._variable);
      this.textEl.textContent = this._text;
      this._lastRenderedText = this._text;
      this.svgEl.appendChild(this.textEl);
    }

    get text() { return this._text; }
    set text(v) {
      const s = v == null ? '' : String(v);
      this._text = s;
      if (this._lastRenderedText !== s) {
        this._lastRenderedText = s;
        this.textEl.textContent = s;
      }
    }

    get htmlText() { return this._text; }
    set htmlText(v) {
      const plain = String(v == null ? '' : v).replace(/<[^>]+>/g, '');
      this.text = plain;
    }

    get variable() { return this._variable; }
    set variable(v) { this._variable = String(v || ''); }

    get _width() { return this.def.w || 80; }
    get _height() { return this.def.h || 20; }

    syncVariableFromScope() {
      if (!this._variable || !this._parent) return;
      const val = this._vm._resolveVariablePath(this._variable, this._parent);
      if (val !== undefined) {
        const s = String(val);
        if (this._lastRenderedText !== s) {
          this._text = s;
          this._lastRenderedText = s;
          this.textEl.textContent = s;
        }
      }
    }

    applyMatrix(m, alpha) {
      if (!this._scriptModifiedTransform) {
        this._rawMatrix = m ? m.slice() : null;
        const dec = decomposeMat(m);
        this._x = dec.x;
        this._y = dec.y;
        this._xscale = dec.xscale;
        this._yscale = dec.yscale;
        this._rotation = dec.rotation;
      }
      if (alpha !== undefined && !this._scriptModifiedAlpha) {
        this._alpha = alpha * 100;
      }
      this.commitSvg();
    }

    commitSvg() {
      const mat = this._scriptModifiedTransform
        ? composeMat(this._x, this._y, this._xscale, this._yscale, this._rotation)
        : (this._rawMatrix || [1, 0, 0, 1, 0, 0]);
      const tStr = `matrix(${fmtNum(mat[0])} ${fmtNum(mat[1])} ${fmtNum(mat[2])} ${fmtNum(mat[3])} ${fmtNum(mat[4])} ${fmtNum(mat[5])})`;
      if (tStr !== this._lastTransform) {
        this._lastTransform = tStr;
        this.svgEl.setAttribute('transform', tStr);
      }
      const op = fmtNum(Math.max(0, Math.min(1, this._alpha / 100)));
      if (op !== this._lastOpacity) {
        this._lastOpacity = op;
        this.svgEl.setAttribute('opacity', op);
      }
      const vis = this._visible ? 'visible' : 'hidden';
      if (vis !== this._lastVis) {
        this._lastVis = vis;
        this.svgEl.setAttribute('visibility', vis);
        this.svgEl.setAttribute('display', this._visible ? 'inline' : 'none');
      }
    }
  }

  /**
   * Live AVM1 Button (DefineButton / DefineButton2) backed by pure W3C SVG state layers.
   */
  class AVM1Button {
    constructor(vm, charId, def, parentClip, depth, instName) {
      this._vm = vm;
      this._isButton = true;
      this.charId = charId;
      this.def = def;
      this._parent = parentClip;
      this._depth = depth;
      this._name = instName || '';
      this._x = 0;
      this._y = 0;
      this._xscale = 100;
      this._yscale = 100;
      this._rotation = 0;
      this._alpha = 100;
      this._visible = true;
      this.enabled = true;
      this.useHandCursor = true;
      this._state = 'up'; // 'up' | 'over' | 'down'
      this._rawMatrix = null;
      this._scriptModifiedTransform = false;
      this._lastTransform = '';
      this._lastOpacity = '';
      this._lastVis = '';
      this._removed = false;

      this.svgEl = createSvgEl(vm.doc, 'g');
      this.svgEl.setAttribute('data-avm1-btn', String(charId));
      this.svgEl.setAttribute('role', 'button');
      this.svgEl.setAttribute('tabindex', '0');
      this.svgEl.style.cursor = 'pointer';
      if (this._name) this.svgEl.setAttribute('data-swf-name', this._name);

      this._upGroup = createSvgEl(vm.doc, 'g');
      this._overGroup = createSvgEl(vm.doc, 'g');
      this._downGroup = createSvgEl(vm.doc, 'g');
      this._hitGroup = createSvgEl(vm.doc, 'g');
      this._upGroup.setAttribute('pointer-events', 'all');
      this._overGroup.setAttribute('pointer-events', 'all');
      this._downGroup.setAttribute('pointer-events', 'all');
      this._hitGroup.setAttribute('opacity', '0');
      this._hitGroup.setAttribute('pointer-events', 'all');

      const recs = (def.r || []).slice().sort((a, b) => a.d - b.d);
      let hasUp = false, hasOver = false, hasDown = false;
      for (let i = 0; i < recs.length; i++) {
        const rec = recs[i];
        const buildRecEl = () => {
          const wrap = createSvgEl(vm.doc, 'g');
          if (rec.m) {
            wrap.setAttribute('transform', `matrix(${rec.m.map(fmtNum).join(' ')})`);
          }
          if (rec.a !== undefined && rec.a < 1) {
            wrap.setAttribute('opacity', fmtNum(rec.a));
          }
          const inner = vm._instantiateStaticCharSvg(rec.c);
          if (inner) wrap.appendChild(inner);
          return wrap;
        };
        if (rec.s & 0x01) { this._upGroup.appendChild(buildRecEl()); hasUp = true; }
        if (rec.s & 0x02) { this._overGroup.appendChild(buildRecEl()); hasOver = true; }
        if (rec.s & 0x04) { this._downGroup.appendChild(buildRecEl()); hasDown = true; }
        if (rec.s & 0x08) { this._hitGroup.appendChild(buildRecEl()); }
      }
      if (!hasUp && recs.length > 0) {
        const wrap = createSvgEl(vm.doc, 'g');
        const inner = vm._instantiateStaticCharSvg(recs[0].c);
        if (inner) wrap.appendChild(inner);
        this._upGroup.appendChild(wrap);
      }
      this._hasOver = hasOver;
      this._hasDown = hasDown;
      this._overGroup.setAttribute('display', 'none');
      this._downGroup.setAttribute('display', 'none');

      this.svgEl.appendChild(this._upGroup);
      if (hasOver) this.svgEl.appendChild(this._overGroup);
      if (hasDown) this.svgEl.appendChild(this._downGroup);
      this.svgEl.appendChild(this._hitGroup);

      this._onEnter = () => {
        if (!this.enabled || this._removed) return;
        this._vm._beginEventBudget();
        this._setState('over');
        this._fireCondition(BTN_IDLE_TO_OVER_UP);
        if (typeof this.onRollOver === 'function') this._vm._invokeValue(this.onRollOver, this, []);
      };
      this._onLeave = () => {
        if (!this.enabled || this._removed) return;
        this._vm._beginEventBudget();
        const wasDown = this._state === 'down';
        this._setState('up');
        this._fireCondition(wasDown ? BTN_OVER_DOWN_TO_OUT_DOWN : BTN_OVER_UP_TO_IDLE);
        if (typeof this.onRollOut === 'function') this._vm._invokeValue(this.onRollOut, this, []);
      };
      this._onDown = (e) => {
        if (!this.enabled || this._removed) return;
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        this._vm._beginEventBudget();
        this._setState('down');
        this._fireCondition(BTN_OVER_UP_TO_OVER_DOWN | BTN_IDLE_TO_OVER_DOWN);
        if (typeof this.onPress === 'function') this._vm._invokeValue(this.onPress, this, []);
      };
      this._onUp = (e) => {
        if (!this.enabled || this._removed) return;
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        this._vm._beginEventBudget();
        this._setState('over');
        this._fireCondition(BTN_OVER_DOWN_TO_OVER_UP);
        if (typeof this.onRelease === 'function') this._vm._invokeValue(this.onRelease, this, []);
      };
      this._onKeyActivate = (e) => {
        if (!this.enabled || this._removed) return;
        if (e && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          this.triggerClick();
        }
      };

      this.svgEl.addEventListener('pointerenter', this._onEnter);
      this.svgEl.addEventListener('pointerleave', this._onLeave);
      this.svgEl.addEventListener('pointerdown', this._onDown);
      this.svgEl.addEventListener('pointerup', this._onUp);
      this.svgEl.addEventListener('keydown', this._onKeyActivate);
      vm._liveButtons.add(this);
    }

    _setState(next) {
      this._state = next;
      const showOver = next === 'over' && this._hasOver;
      const showDown = next === 'down' && this._hasDown;
      const showUp = !showOver && !showDown;
      this._upGroup.setAttribute('display', showUp ? 'inline' : 'none');
      if (this._hasOver) this._overGroup.setAttribute('display', showOver ? 'inline' : 'none');
      if (this._hasDown) this._downGroup.setAttribute('display', showDown ? 'inline' : 'none');
    }

    _fireCondition(mask) {
      const acts = this.def.a || [];
      for (let i = 0; i < acts.length; i++) {
        const a = acts[i];
        if ((a.f & mask) !== 0) {
          const b64 = this._vm._resolveB64(a);
          if (b64) this._vm.execBytecode(b64, this._parent || this._vm.rootClip);
        }
      }
    }

    _fireKeyPress(flashKeyCode) {
      if (!this.enabled || this._removed || !this._visible) return;
      const acts = this.def.a || [];
      for (let i = 0; i < acts.length; i++) {
        const a = acts[i];
        if (!a.k) continue;
        const b64 = this._vm._resolveB64(a);
        if (!b64) continue;
        const mapped = BTN_KEY_TO_FLASH_CODE[a.k] || a.k;
        if (mapped === flashKeyCode || (a.k >= 97 && a.k <= 122 && (a.k - 32) === flashKeyCode)) {
          this._vm.execBytecode(b64, this._parent || this._vm.rootClip);
        }
      }
    }

    triggerClick() {
      this._onDown();
      this._onUp();
    }

    applyMatrix(m, alpha) {
      if (!this._scriptModifiedTransform) {
        this._rawMatrix = m ? m.slice() : null;
        const dec = decomposeMat(m);
        this._x = dec.x;
        this._y = dec.y;
        this._xscale = dec.xscale;
        this._yscale = dec.yscale;
        this._rotation = dec.rotation;
      }
      if (alpha !== undefined && !this._scriptModifiedAlpha) {
        this._alpha = alpha * 100;
      }
      this.commitSvg();
    }

    commitSvg() {
      const mat = this._scriptModifiedTransform
        ? composeMat(this._x, this._y, this._xscale, this._yscale, this._rotation)
        : (this._rawMatrix || [1, 0, 0, 1, 0, 0]);
      const tStr = `matrix(${fmtNum(mat[0])} ${fmtNum(mat[1])} ${fmtNum(mat[2])} ${fmtNum(mat[3])} ${fmtNum(mat[4])} ${fmtNum(mat[5])})`;
      if (tStr !== this._lastTransform) {
        this._lastTransform = tStr;
        this.svgEl.setAttribute('transform', tStr);
      }
      const op = fmtNum(Math.max(0, Math.min(1, this._alpha / 100)));
      if (op !== this._lastOpacity) {
        this._lastOpacity = op;
        this.svgEl.setAttribute('opacity', op);
      }
      const vis = this._visible ? 'visible' : 'hidden';
      if (vis !== this._lastVis) {
        this._lastVis = vis;
        this.svgEl.setAttribute('visibility', vis);
        this.svgEl.setAttribute('pointer-events', this._visible ? 'auto' : 'none');
        this.svgEl.setAttribute('display', this._visible ? 'inline' : 'none');
      }
    }

    destroy() {
      this._removed = true;
      this._vm._liveButtons.delete(this);
      this.svgEl.removeEventListener('pointerenter', this._onEnter);
      this.svgEl.removeEventListener('pointerleave', this._onLeave);
      this.svgEl.removeEventListener('pointerdown', this._onDown);
      this.svgEl.removeEventListener('pointerup', this._onUp);
      if (this._onKeyActivate) this.svgEl.removeEventListener('keydown', this._onKeyActivate);
    }
  }

  /**
   * Live AVM1 MovieClip with independent timeline, child display list, clip events,
   * Flash Drawing API, hitTest, attachMovie, duplicateMovieClip, and 1-to-1 SVG <g> binding.
   */
  class AVM1MovieClip {
    constructor(vm, charId, timelineDef, parentClip, depth, instName, clipActions) {
      this._vm = vm;
      this._isMovieClip = true;
      this.charId = charId;
      this._def = timelineDef || { fc: 1, l: [], fr: [[]], ac: [] };
      this._parent = parentClip || null;
      this._clipDepth = parentClip ? (parentClip._clipDepth || 0) + 1 : 0;
      this._depth = depth;
      this._name = instName || (parentClip ? `instance${++vm._instCounter}` : '');
      this._clipActions = clipActions || [];
      this._vars = Object.create(null);
      this._childrenByDepth = new Map(); // depth -> { charId, obj, svgWrap, clipDepth, maskId }
      this._removed = false;
      vm._liveClipCount = (vm._liveClipCount || 0) + 1;

      // Expand deduplicated "=" hold-frame markers once into shared direct array references (O(F), 0 per-frame GC)
      const rawFrames = this._def.fr || [[]];
      if (!this._def._expandedFr) {
        const expanded = new Array(rawFrames.length);
        let prevArr = [];
        for (let fi = 0; fi < rawFrames.length; fi++) {
          const cur = rawFrames[fi];
          if (cur === '=' || cur == null) {
            expanded[fi] = prevArr;
          } else {
            expanded[fi] = cur;
            prevArr = cur;
          }
        }
        this._def._expandedFr = expanded;
      }
      this._frames = this._def._expandedFr;
      this._lastReconciledEntries = null;

      // Timeline state
      this._totalframes = Math.max(1, this._def.fc || (this._frames ? this._frames.length : 1));
      this._currentframe = 1;
      this._playing = this._totalframes > 1;
      this._justSpawned = true;
      this._pendingFrame = null;
      this._frameChangedThisTick = false;

      // Transform & display state
      this._x = 0;
      this._y = 0;
      this._xscale = 100;
      this._yscale = 100;
      this._rotation = 0;
      this._alpha = 100;
      this._visible = true;
      this.enabled = true;
      this.useHandCursor = true;
      this._rawMatrix = null;
      this._scriptModifiedTransform = false;
      this._scriptModifiedAlpha = false;
      this._lastTransform = '';
      this._lastOpacity = '';
      this._lastVis = '';

      // Label map (case-insensitive per Flash spec)
      this._labelMap = new Map();
      const lbls = this._def.l || [];
      for (let i = 0; i < lbls.length; i++) {
        this._labelMap.set(String(lbls[i].name).toLowerCase(), lbls[i].frame);
      }

      // Pure SVG <g> container for this MovieClip
      this.svgEl = createSvgEl(vm.doc, 'g');
      if (this._name) this.svgEl.setAttribute('data-swf-name', this._name);
      this.svgEl.setAttribute('data-avm1-mc', String(charId));

      // Drawing API container (renders below/above timeline children)
      this._drawGroup = null;
      this._drawState = null;

      // Pointer handlers for script-assigned onPress / onRelease / onRollOver / onRollOut and clipActions
      this._pointerBound = false;
      this._isMouseOver = false;
      this._isMouseDown = false;
      this._proto = null;
      if (this._clipActions.some((ca) => (ca.f & (CE_PRESS | CE_RELEASE | CE_RELEASE_OUTSIDE | CE_ROLL_OVER | CE_ROLL_OUT)) !== 0)) {
        this._ensurePointerListeners();
      }
    }

    _ensurePointerListeners() {
      if (this._pointerBound) return;
      this._pointerBound = true;
      this.svgEl.style.cursor = this.useHandCursor ? 'pointer' : '';
      this._onPtrDown = (e) => {
        if (!this.enabled || !this._visible || this._removed) return;
        this._vm._beginEventBudget();
        this._isMouseDown = true;
        if (typeof this._vars.onPress === 'function') {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          this._vm._invokeValue(this._vars.onPress, this, []);
        }
        this._fireClipEvents(CE_PRESS);
      };
      this._onPtrUp = (e) => {
        if (!this.enabled || !this._visible || this._removed) return;
        this._vm._beginEventBudget();
        const wasDown = this._isMouseDown;
        this._isMouseDown = false;
        if (wasDown) {
          if (typeof this._vars.onRelease === 'function') {
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
            this._vm._invokeValue(this._vars.onRelease, this, []);
          }
          this._fireClipEvents(CE_RELEASE);
        }
      };
      this._onPtrEnter = () => {
        if (!this.enabled || !this._visible || this._removed) return;
        this._vm._beginEventBudget();
        this._isMouseOver = true;
        if (typeof this._vars.onRollOver === 'function') {
          this._vm._invokeValue(this._vars.onRollOver, this, []);
        }
        this._fireClipEvents(CE_ROLL_OVER);
      };
      this._onPtrLeave = () => {
        if (!this.enabled || this._removed) return;
        this._vm._beginEventBudget();
        this._isMouseOver = false;
        if (typeof this._vars.onRollOut === 'function') {
          this._vm._invokeValue(this._vars.onRollOut, this, []);
        }
        this._fireClipEvents(CE_ROLL_OUT);
      };
      this.svgEl.addEventListener('pointerdown', this._onPtrDown);
      this.svgEl.addEventListener('pointerup', this._onPtrUp);
      this.svgEl.addEventListener('pointerenter', this._onPtrEnter);
      this.svgEl.addEventListener('pointerleave', this._onPtrLeave);
    }

    getLocalMatrix() {
      if (this._scriptModifiedTransform) {
        return composeMat(this._x, this._y, this._xscale, this._yscale, this._rotation);
      }
      return this._rawMatrix || [1, 0, 0, 1, 0, 0];
    }

    getWorldMatrix() {
      const local = this.getLocalMatrix();
      if (!this._parent) return local;
      return mulMat(this._parent.getWorldMatrix(), local);
    }

    getLocalBBox(depth = 0) {
      if (depth > 24) return { x: 0, y: 0, w: 0, h: 0 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const includeRect = (x, y, w, h, m) => {
        if (w <= 0 && h <= 0) return;
        const pts = [
          applyMatPt(m, x, y),
          applyMatPt(m, x + w, y),
          applyMatPt(m, x, y + h),
          applyMatPt(m, x + w, y + h),
        ];
        for (let i = 0; i < 4; i++) {
          if (pts[i].x < minX) minX = pts[i].x;
          if (pts[i].y < minY) minY = pts[i].y;
          if (pts[i].x > maxX) maxX = pts[i].x;
          if (pts[i].y > maxY) maxY = pts[i].y;
        }
      };

      this._childrenByDepth.forEach((slot) => {
        if (slot.clipDepth) return;
        const obj = slot.obj;
        if (obj && obj._isMovieClip) {
          if (!obj._visible) return;
          const bb = obj.getLocalBBox(depth + 1);
          if (bb.w > 0 || bb.h > 0) {
            includeRect(bb.x, bb.y, bb.w, bb.h, obj.getLocalMatrix());
          }
        } else if (obj && obj._isTextField) {
          includeRect(obj.def.x, obj.def.y, obj.def.w, obj.def.h, obj._rawMatrix || [1, 0, 0, 1, 0, 0]);
        } else if (slot.bbox) {
          includeRect(slot.bbox[0], slot.bbox[1], slot.bbox[2], slot.bbox[3], slot.matrix || [1, 0, 0, 1, 0, 0]);
        }
      });

      if (this._drawBBox) {
        includeRect(this._drawBBox.x, this._drawBBox.y, this._drawBBox.w, this._drawBBox.h, [1, 0, 0, 1, 0, 0]);
      }

      if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    getWorldBBox() {
      const bb = this.getLocalBBox();
      if (bb.w <= 0 && bb.h <= 0) {
        const p = applyMatPt(this.getWorldMatrix(), 0, 0);
        return { x: p.x, y: p.y, w: 0, h: 0 };
      }
      const wm = this.getWorldMatrix();
      const pts = [
        applyMatPt(wm, bb.x, bb.y),
        applyMatPt(wm, bb.x + bb.w, bb.y),
        applyMatPt(wm, bb.x, bb.y + bb.h),
        applyMatPt(wm, bb.x + bb.w, bb.y + bb.h),
      ];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < 4; i++) {
        if (pts[i].x < minX) minX = pts[i].x;
        if (pts[i].y < minY) minY = pts[i].y;
        if (pts[i].x > maxX) maxX = pts[i].x;
        if (pts[i].y > maxY) maxY = pts[i].y;
      }
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    getTargetPath() {
      if (!this._parent) return '/';
      const parts = [];
      let cur = this;
      while (cur && cur._parent) {
        parts.unshift(cur._name || '');
        cur = cur._parent;
      }
      return '/' + parts.join('/');
    }

    getChildByName(name) {
      if (!name) return undefined;
      const ci = this._vm.caseInsensitive;
      const lower = ci ? String(name).toLowerCase() : null;
      let found;
      this._childrenByDepth.forEach((slot) => {
        if (found !== undefined) return;
        const obj = slot.obj;
        if (!obj || !obj._name) return;
        if (obj._name === name || (ci && obj._name.toLowerCase() === lower)) {
          found = obj;
        }
      });
      return found;
    }

    resolveFrameNumber(target) {
      if (typeof target === 'number' && Number.isFinite(target)) {
        return Math.max(1, Math.min(this._totalframes, Math.floor(target)));
      }
      const s = String(target == null ? '' : target).trim();
      const asNum = Number(s);
      if (s !== '' && Number.isFinite(asNum)) {
        return Math.max(1, Math.min(this._totalframes, Math.floor(asNum)));
      }
      const lbl = this._labelMap.get(s.toLowerCase());
      if (lbl !== undefined) return Math.max(1, Math.min(this._totalframes, lbl));
      return this._currentframe;
    }

    play() { this._playing = true; }
    stop() { this._playing = false; }

    gotoAndPlay(target) {
      const next = this.resolveFrameNumber(target);
      this._playing = true;
      this._jumpToFrame(next);
    }

    gotoAndStop(target) {
      const next = this.resolveFrameNumber(target);
      this._playing = false;
      this._jumpToFrame(next);
    }

    nextFrame() {
      this._playing = false;
      if (this._currentframe < this._totalframes) {
        this._jumpToFrame(this._currentframe + 1);
      }
    }

    prevFrame() {
      this._playing = false;
      if (this._currentframe > 1) {
        this._jumpToFrame(this._currentframe - 1);
      }
    }

    _jumpToFrame(nextFrame) {
      if (nextFrame === this._currentframe && !this._justSpawned) return;
      const depth = (this._jumpDepth || 0);
      if (depth >= 12) return;
      this._jumpDepth = depth + 1;
      try {
        this._currentframe = nextFrame;
        this._frameChangedThisTick = true;
        this.reconcileDisplayList(this._currentframe, true);
        this.runFrameActions(this._currentframe);
      } finally {
        this._jumpDepth = depth;
      }
    }

    applyMatrix(m, alpha) {
      if (!this._scriptModifiedTransform) {
        this._rawMatrix = m ? m.slice() : null;
        const dec = decomposeMat(m);
        this._x = dec.x;
        this._y = dec.y;
        this._xscale = dec.xscale;
        this._yscale = dec.yscale;
        this._rotation = dec.rotation;
      }
      if (alpha !== undefined && !this._scriptModifiedAlpha) {
        this._alpha = alpha * 100;
      }
      this.commitSvg();
    }

    commitSvg() {
      const mat = this.getLocalMatrix();
      const tStr = `matrix(${fmtNum(mat[0])} ${fmtNum(mat[1])} ${fmtNum(mat[2])} ${fmtNum(mat[3])} ${fmtNum(mat[4])} ${fmtNum(mat[5])})`;
      if (tStr !== this._lastTransform) {
        this._lastTransform = tStr;
        this.svgEl.setAttribute('transform', tStr);
      }
      const op = fmtNum(Math.max(0, Math.min(1, this._alpha / 100)));
      if (op !== this._lastOpacity) {
        this._lastOpacity = op;
        this.svgEl.setAttribute('opacity', op);
      }
      const vis = this._visible ? 'visible' : 'hidden';
      if (vis !== this._lastVis) {
        this._lastVis = vis;
        this.svgEl.setAttribute('visibility', vis);
        this.svgEl.setAttribute('pointer-events', this._visible ? 'auto' : 'none');
        this.svgEl.setAttribute('display', this._visible ? 'inline' : 'none');
      }
    }

    _fireClipEvents(flagMask, keyCode) {
      if (this._removed || !this._clipActions || this._clipActions.length === 0) return;
      for (let i = 0; i < this._clipActions.length; i++) {
        const ca = this._clipActions[i];
        if ((ca.f & flagMask) === 0) continue;
        if (flagMask === CE_KEY_PRESS && ca.k !== undefined && keyCode !== undefined) {
          const mapped = BTN_KEY_TO_FLASH_CODE[ca.k] || ca.k;
          if (mapped !== keyCode) continue;
        }
        const b64 = this._vm._resolveB64(ca);
        if (b64) {
          this._vm.execBytecode(b64, this);
        }
      }
    }

    /**
     * Reconciles timeline display list for `frameNum` (1-based) against live depth slots.
     * Preserves dynamic script-created depths (>= 16384 or created via attachMovie/duplicateMovieClip)
     * and preserves script-modified transforms on continuing timeline instances.
     */
    reconcileDisplayList(frameNum, force = false) {
      if (this._clipDepth > 24) return;
      const frames = this._frames || [];
      const idx = Math.max(0, Math.min(frames.length - 1, frameNum - 1));
      const entries = frames[idx] || [];
      // True Flash hold frame (identical display list array reference) -> 0-cost skip on sequential playback
      if (!force && this._lastReconciledEntries === entries) return;
      this._lastReconciledEntries = entries;
      const wantedByDepth = new Map();
      for (let i = 0; i < entries.length; i++) {
        wantedByDepth.set(entries[i].d, entries[i]);
      }

      // 1. Remove timeline children no longer present on this frame (or replaced by a different charId)
      const toRemove = [];
      this._childrenByDepth.forEach((slot, depth) => {
        if (slot.isDynamic) return; // Keep attachMovie / duplicateMovieClip / createEmptyMovieClip instances!
        const nextEntry = wantedByDepth.get(depth);
        if (!nextEntry || nextEntry.c !== slot.charId || Boolean(nextEntry.cd) !== Boolean(slot.clipDepth)) {
          toRemove.push(depth);
        }
      });
      for (let i = 0; i < toRemove.length; i++) {
        this._removeSlotAtDepth(toRemove[i]);
      }

      let childrenMutated = toRemove.length > 0;

      // 2. Active masks for this frame (clipDepth)
      const activeMasks = [];
      const newlySpawnedClips = [];

      // 3. Create or update entries in ascending depth order
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const depth = e.d;

        // ClipDepth mask layer -> register SVG <clipPath> in stage <defs>
        if (e.cd && e.cd > depth) {
          let slot = this._childrenByDepth.get(depth);
          if (!slot) {
            const maskId = `avm1-mask-${++this._vm._maskCounter}`;
            const cp = createSvgEl(this._vm.doc, 'clipPath');
            cp.setAttribute('id', maskId);
            this._vm._populateClipPath(cp, e.c, e.m || null);
            if (this._vm.defsEl) this._vm.defsEl.appendChild(cp);
            slot = {
              depth,
              charId: e.c,
              isDynamic: false,
              clipDepth: e.cd,
              maskId,
              maskEl: cp,
              matrix: e.m || null,
            };
            this._childrenByDepth.set(depth, slot);
          } else if (!matEquals(e.m || null, slot.matrix)) {
            slot.matrix = e.m || null;
            if (slot.maskEl) {
              slot.maskEl.replaceChildren();
              this._vm._populateClipPath(slot.maskEl, e.c, e.m || null);
            }
          }
          activeMasks.push({ clipDepth: e.cd, maskId: slot.maskId });
          continue;
        }

        // Check if this depth is covered by an active mask
        let maskId = null;
        for (let mi = activeMasks.length - 1; mi >= 0; mi--) {
          if (depth <= activeMasks[mi].clipDepth) {
            maskId = activeMasks[mi].maskId;
            break;
          }
        }

        let slot = this._childrenByDepth.get(depth);
        if (!slot) {
          if (this._clipDepth > 0 && this._vm._isOverBudget()) break;
          const resolvedCa = this._vm._resolveClipActions(e);
          slot = this._createSlot(depth, e.c, e.m || null, e.a !== undefined ? e.a : 1, e.n || '', resolvedCa, false, maskId);
          if (slot) {
            childrenMutated = true;
            if (slot.obj && slot.obj._isMovieClip) {
              newlySpawnedClips.push(slot.obj);
            }
          }
        } else {
          // Update transform & alpha only when changed
          if (slot.obj && typeof slot.obj.applyMatrix === 'function') {
            slot.obj.applyMatrix(e.m || null, e.a !== undefined ? e.a : 1);
          } else if (slot.svgEl) {
            if (!matEquals(e.m || null, slot.matrix)) {
              slot.matrix = e.m || null;
              const mat = e.m || [1, 0, 0, 1, 0, 0];
              const tStr = `matrix(${fmtNum(mat[0])} ${fmtNum(mat[1])} ${fmtNum(mat[2])} ${fmtNum(mat[3])} ${fmtNum(mat[4])} ${fmtNum(mat[5])})`;
              if (tStr !== slot._lastTransform) {
                slot._lastTransform = tStr;
                slot.svgEl.setAttribute('transform', tStr);
              }
            }
            const nextAlpha = e.a !== undefined ? fmtNum(e.a) : '1';
            if (nextAlpha !== slot._lastOpacity) {
              slot._lastOpacity = nextAlpha;
              slot.svgEl.setAttribute('opacity', nextAlpha);
            }
          }
          // Update mask wrapper if mask assignment changed
          if (slot.maskId !== maskId) {
            slot.maskId = maskId;
            if (maskId) slot.svgOuter.setAttribute('clip-path', `url(#${maskId})`);
            else slot.svgOuter.removeAttribute('clip-path');
          }
        }
      }

      if (childrenMutated) {
        this._reorderSvgChildren();
      }

      // Initialize newly spawned MovieClips (reconcile frame 1, fire DoInitAction, registered AS2 class, onClipEvent(load), frame 1 DoAction)
      for (let i = 0; i < newlySpawnedClips.length; i++) {
        if (this._vm._isOverBudget()) break;
        const mc = newlySpawnedClips[i];
        if (mc._removed) continue;
        mc._justSpawned = false;
        this._vm._ensureSpriteInitAction(mc.charId, mc);
        this._vm._applyRegisteredClass(mc);
        mc.reconcileDisplayList(1, true);
        if (!this._vm._isOverBudget()) mc._fireClipEvents(CE_LOAD);
        if (!mc._removed && !this._vm._isOverBudget() && mc._currentframe === 1) {
          mc.runFrameActions(1);
        }
      }
    }

    _createSlot(depth, charId, matrix, alpha, instName, clipActions, isDynamic, maskId) {
      const prog = this._vm.program;
      let obj = null;
      let svgEl = null;
      let bbox = null;

      if (prog.sp && prog.sp[charId]) {
        if ((this._vm._liveClipCount || 0) >= MAX_LIVE_CLIPS || this._clipDepth >= 24) {
          return null;
        }
        obj = new AVM1MovieClip(this._vm, charId, prog.sp[charId], this, depth, instName, clipActions);
        obj.applyMatrix(matrix, alpha);
        svgEl = obj.svgEl;
      } else if (prog.bt && prog.bt[charId]) {
        obj = new AVM1Button(this._vm, charId, prog.bt[charId], this, depth, instName);
        obj.applyMatrix(matrix, alpha);
        svgEl = obj.svgEl;
      } else if (prog.et && prog.et[charId]) {
        obj = new AVM1TextField(this._vm, charId, prog.et[charId], this, depth, instName);
        obj.applyMatrix(matrix, alpha);
        obj.syncVariableFromScope();
        svgEl = obj.svgEl;
      } else {
        svgEl = createSvgEl(this._vm.doc, 'g');
        const inner = this._vm._instantiateStaticCharSvg(charId);
        if (inner) svgEl.appendChild(inner);
        const mat = matrix || [1, 0, 0, 1, 0, 0];
        svgEl.setAttribute('transform', `matrix(${mat.map(fmtNum).join(' ')})`);
        if (alpha !== undefined && alpha < 1) svgEl.setAttribute('opacity', fmtNum(alpha));
        const sh = prog.sh && prog.sh[charId];
        const mo = prog.mo && prog.mo[charId];
        bbox = (sh && sh.bb) || (mo && mo.bb) || null;
      }

      // Outer un-transformed wrapper allows clip-path in parent coordinate space!
      const svgOuter = maskId ? createSvgEl(this._vm.doc, 'g') : svgEl;
      if (maskId) {
        svgOuter.setAttribute('clip-path', `url(#${maskId})`);
        svgOuter.appendChild(svgEl);
      }

      const initMat = matrix || [1, 0, 0, 1, 0, 0];
      const initTStr = obj ? '' : `matrix(${fmtNum(initMat[0])} ${fmtNum(initMat[1])} ${fmtNum(initMat[2])} ${fmtNum(initMat[3])} ${fmtNum(initMat[4])} ${fmtNum(initMat[5])})`;
      const initOpStr = obj ? '' : (alpha !== undefined ? fmtNum(alpha) : '1');
      const slot = {
        depth,
        charId,
        isDynamic: Boolean(isDynamic),
        obj,
        svgEl,
        svgOuter,
        matrix: matrix || null,
        bbox,
        maskId: maskId || null,
        _lastTransform: initTStr,
        _lastOpacity: initOpStr,
      };
      this._childrenByDepth.set(depth, slot);
      this.svgEl.appendChild(svgOuter);
      return slot;
    }

    _removeSlotAtDepth(depth) {
      const slot = this._childrenByDepth.get(depth);
      if (!slot) return;
      this._childrenByDepth.delete(depth);
      if (slot.maskEl && slot.maskEl.parentNode) {
        slot.maskEl.parentNode.removeChild(slot.maskEl);
      }
      if (slot.obj) {
        if (slot.obj._isMovieClip) slot.obj.destroy();
        else if (typeof slot.obj.destroy === 'function') slot.obj.destroy();
      }
      if (slot.svgOuter && slot.svgOuter.parentNode) {
        slot.svgOuter.parentNode.removeChild(slot.svgOuter);
      }
    }

    _reorderSvgChildren() {
      const sorted = Array.from(this._childrenByDepth.values())
        .filter((s) => !s.clipDepth && s.svgOuter)
        .sort((a, b) => a.depth - b.depth);
      let prev = null;
      for (let i = sorted.length - 1; i >= 0; i--) {
        const el = sorted[i].svgOuter;
        if (el.nextSibling !== prev) {
          this.svgEl.insertBefore(el, prev);
        }
        prev = el;
      }
    }

    runFrameActions(frameNum) {
      const acts = this._def.ac || [];
      for (let i = 0; i < acts.length; i++) {
        if (acts[i].f === frameNum) {
          const b64 = this._vm._resolveB64(acts[i]);
          if (b64) {
            this._vm.execBytecode(b64, this);
            if (this._removed) return;
          }
        }
      }
    }

    stepFrame() {
      if (this._removed || this._vm._isOverBudget()) return;
      this._frameChangedThisTick = false;

      // 1. Advance timeline if playing and multi-frame
      if (this._playing && this._totalframes > 1) {
        const next = this._currentframe >= this._totalframes ? 1 : this._currentframe + 1;
        this._currentframe = next;
        this.reconcileDisplayList(this._currentframe);
        if (!this._vm._isOverBudget()) {
          this.runFrameActions(this._currentframe);
        }
        if (this._removed) return;
      }

      // 2. Fire onClipEvent(enterFrame) and clip.onEnterFrame() (respect runaway-script throttle)
      if (!this._vm._skipBgScriptsThisTick && !this._vm._isOverBudget()) {
        this._fireClipEvents(CE_ENTER_FRAME);
        if (this._removed) return;
        if (!this._vm._isOverBudget() && typeof this._vars.onEnterFrame === 'function') {
          this._vm._invokeValue(this._vars.onEnterFrame, this, []);
          if (this._removed) return;
        }
      }

      // 3. Step live child MovieClips and sync DefineEditText fields
      if (this._childrenByDepth.size > 0) {
        const snapshot = Array.from(this._childrenByDepth.values());
        for (let i = 0; i < snapshot.length; i++) {
          if (this._vm._isOverBudget()) break;
          const obj = snapshot[i].obj;
          if (!obj) continue;
          if (obj._isMovieClip && !obj._removed) {
            obj.stepFrame();
          } else if (obj._isTextField) {
            obj.syncVariableFromScope();
          }
        }
      }
      this.commitSvg();
    }

    // --- MovieClip Dynamic Manipulation APIs ---

    attachMovie(linkageName, newName, depth, initObj) {
      const charId = this._vm._lookupExport(linkageName);
      if (charId === undefined) return undefined;
      const d = Math.floor(Number(depth) || 0);
      if (!this._childrenByDepth.has(d)) {
        if ((this._vm._liveClipCount || 0) >= MAX_LIVE_CLIPS || this._childrenByDepth.size >= MAX_CHILDREN_PER_CLIP) {
          return undefined;
        }
      }
      this._removeSlotAtDepth(d);
      const slot = this._createSlot(d, charId, null, 1, String(newName || ''), [], true, null);
      this._reorderSvgChildren();
      const mc = slot && slot.obj;
      if (mc && mc._isMovieClip) {
        if (initObj && typeof initObj === 'object') {
          for (const k of Object.keys(initObj)) {
            this._vm._setMember(mc, k, initObj[k]);
          }
        }
        mc._justSpawned = false;
        this._vm._ensureSpriteInitAction(mc.charId, mc);
        this._vm._applyRegisteredClass(mc, linkageName);
        mc.reconcileDisplayList(1);
        mc._fireClipEvents(CE_LOAD);
        if (!mc._removed && mc._currentframe === 1) {
          mc.runFrameActions(1);
        }
        mc.commitSvg();
      }
      return mc;
    }

    duplicateMovieClip(newName, depth, initObj) {
      if (!this._parent) return undefined;
      const d = Math.floor(Number(depth) || 0);
      if (!this._parent._childrenByDepth.has(d)) {
        if ((this._vm._liveClipCount || 0) >= MAX_LIVE_CLIPS || this._parent._childrenByDepth.size >= MAX_CHILDREN_PER_CLIP) {
          return undefined;
        }
      }
      this._parent._removeSlotAtDepth(d);
      const slot = this._parent._createSlot(
        d,
        this.charId,
        this.getLocalMatrix(),
        this._alpha / 100,
        String(newName || ''),
        this._clipActions.slice(),
        true,
        null
      );
      this._parent._reorderSvgChildren();
      const dup = slot && slot.obj;
      if (dup && dup._isMovieClip) {
        dup._x = this._x;
        dup._y = this._y;
        dup._xscale = this._xscale;
        dup._yscale = this._yscale;
        dup._rotation = this._rotation;
        dup._alpha = this._alpha;
        dup._visible = this._visible;
        dup._scriptModifiedTransform = true;
        if (initObj && typeof initObj === 'object') {
          for (const k of Object.keys(initObj)) {
            this._vm._setMember(dup, k, initObj[k]);
          }
        }
        dup._justSpawned = false;
        dup.reconcileDisplayList(1);
        dup._fireClipEvents(CE_LOAD);
        dup.runFrameActions(1);
        dup.commitSvg();
      }
      return dup;
    }

    createEmptyMovieClip(newName, depth) {
      const d = Math.floor(Number(depth) || 0);
      if (!this._childrenByDepth.has(d)) {
        if ((this._vm._liveClipCount || 0) >= MAX_LIVE_CLIPS || this._childrenByDepth.size >= MAX_CHILDREN_PER_CLIP) {
          return undefined;
        }
      }
      this._removeSlotAtDepth(d);
      const mc = new AVM1MovieClip(this._vm, 0, { fc: 1, l: [], fr: [[]], ac: [] }, this, d, String(newName || ''), []);
      mc._justSpawned = false;
      const slot = {
        depth: d,
        charId: 0,
        isDynamic: true,
        obj: mc,
        svgEl: mc.svgEl,
        svgOuter: mc.svgEl,
        matrix: null,
        bbox: null,
        maskId: null,
      };
      this._childrenByDepth.set(d, slot);
      this.svgEl.appendChild(mc.svgEl);
      this._reorderSvgChildren();
      return mc;
    }

    removeMovieClip() {
      if (!this._parent) return;
      this._parent._removeSlotAtDepth(this._depth);
    }

    swapDepths(targetOrDepth) {
      if (!this._parent) return;
      const parent = this._parent;
      const mySlot = parent._childrenByDepth.get(this._depth);
      if (!mySlot) return;
      let targetDepth;
      if (targetOrDepth && targetOrDepth._isMovieClip && targetOrDepth._parent === parent) {
        targetDepth = targetOrDepth._depth;
      } else {
        targetDepth = Math.floor(Number(targetOrDepth) || 0);
      }
      if (targetDepth === this._depth) return;
      const otherSlot = parent._childrenByDepth.get(targetDepth);
      parent._childrenByDepth.delete(this._depth);
      if (otherSlot) {
        otherSlot.depth = this._depth;
        if (otherSlot.obj) otherSlot.obj._depth = this._depth;
        parent._childrenByDepth.set(this._depth, otherSlot);
      }
      mySlot.depth = targetDepth;
      this._depth = targetDepth;
      mySlot.isDynamic = true;
      parent._childrenByDepth.set(targetDepth, mySlot);
      parent._reorderSvgChildren();
    }

    getNextHighestDepth() {
      let max = 0;
      this._childrenByDepth.forEach((_, d) => {
        if (d >= max) max = d + 1;
      });
      return max;
    }

    getDepth() {
      return this._depth;
    }

    hitTest(arg0, arg1, _shapeFlag) {
      if (this._removed || !this._visible) return false;
      if (arg0 && arg0._isMovieClip) {
        if (arg0._removed || !arg0._visible) return false;
        const a = this.getWorldBBox();
        const b = arg0.getWorldBBox();
        if ((a.w === 0 && a.h === 0) || (b.w === 0 && b.h === 0)) return false;
        return (
          a.x <= b.x + b.w &&
          a.x + a.w >= b.x &&
          a.y <= b.y + b.h &&
          a.y + a.h >= b.y
        );
      }
      const px = Number(arg0);
      const py = Number(arg1);
      if (!Number.isFinite(px) || !Number.isFinite(py)) return false;
      const bb = this.getWorldBBox();
      if (bb.w === 0 && bb.h === 0) return false;
      return px >= bb.x && px <= bb.x + bb.w && py >= bb.y && py <= bb.y + bb.h;
    }

    getBounds(targetSpace) {
      const bb = this.getWorldBBox();
      if (!targetSpace || !targetSpace._isMovieClip || targetSpace === this._vm.rootClip) {
        return { xMin: bb.x, xMax: bb.x + bb.w, yMin: bb.y, yMax: bb.y + bb.h };
      }
      const inv = invertMat(targetSpace.getWorldMatrix());
      const p1 = applyMatPt(inv, bb.x, bb.y);
      const p2 = applyMatPt(inv, bb.x + bb.w, bb.y + bb.h);
      return {
        xMin: Math.min(p1.x, p2.x),
        xMax: Math.max(p1.x, p2.x),
        yMin: Math.min(p1.y, p2.y),
        yMax: Math.max(p1.y, p2.y),
      };
    }

    localToGlobal(pt) {
      if (!pt || typeof pt !== 'object') return;
      const g = applyMatPt(this.getWorldMatrix(), Number(pt.x) || 0, Number(pt.y) || 0);
      pt.x = g.x;
      pt.y = g.y;
    }

    globalToLocal(pt) {
      if (!pt || typeof pt !== 'object') return;
      const l = applyMatPt(invertMat(this.getWorldMatrix()), Number(pt.x) || 0, Number(pt.y) || 0);
      pt.x = l.x;
      pt.y = l.y;
    }

    // --- Flash Drawing API -> Pure W3C SVG <path> ---
    _ensureDrawLayer() {
      if (!this._drawGroup) {
        this._drawGroup = createSvgEl(this._vm.doc, 'g');
        this._drawGroup.setAttribute('data-avm1-draw', '1');
        this.svgEl.appendChild(this._drawGroup);
      }
      if (!this._drawState) {
        this._drawState = {
          stroke: 'none', strokeWidth: 0, strokeAlpha: 1,
          fill: 'none', fillAlpha: 1,
          curX: 0, curY: 0, pathD: '', pathEl: null
        };
      }
    }

    _expandDrawBBox(x, y) {
      if (!this._drawBBox) {
        this._drawBBox = { x, y, w: 1, h: 1 };
      } else {
        const x2 = Math.max(this._drawBBox.x + this._drawBBox.w, x);
        const y2 = Math.max(this._drawBBox.y + this._drawBBox.h, y);
        const x1 = Math.min(this._drawBBox.x, x);
        const y1 = Math.min(this._drawBBox.y, y);
        this._drawBBox = { x: x1, y: y1, w: Math.max(1, x2 - x1), h: Math.max(1, y2 - y1) };
      }
    }

    _flushDrawPath() {
      if (!this._drawState || !this._drawState.pathD) return;
      const st = this._drawState;
      if (st.pathEl) {
        st.pathEl.setAttribute('d', st.pathD);
        st.pathEl = null;
        st.pathD = '';
        return;
      }
      const existingCount = (this._drawGroup.children && this._drawGroup.children.length) || 0;
      if (existingCount >= MAX_DRAW_PATHS) {
        st.pathD = '';
        return;
      }
      const p = createSvgEl(this._vm.doc, 'path');
      p.setAttribute('d', st.pathD);
      p.setAttribute('fill', st.fill);
      if (st.fill !== 'none' && st.fillAlpha < 1) p.setAttribute('fill-opacity', fmtNum(st.fillAlpha));
      p.setAttribute('stroke', st.stroke);
      if (st.stroke !== 'none') {
        p.setAttribute('stroke-width', fmtNum(st.strokeWidth || 1));
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('stroke-linejoin', 'round');
        if (st.strokeAlpha < 1) p.setAttribute('stroke-opacity', fmtNum(st.strokeAlpha));
      }
      this._drawGroup.appendChild(p);
      st.pathD = '';
    }

    _syncLiveStrokePath() {
      const st = this._drawState;
      if (!st || !st.pathD) return;
      if (!st.pathEl) {
        const existingCount = (this._drawGroup.children && this._drawGroup.children.length) || 0;
        if (existingCount >= MAX_DRAW_PATHS) {
          st.pathD = '';
          return;
        }
        const p = createSvgEl(this._vm.doc, 'path');
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', st.stroke);
        if (st.stroke !== 'none') {
          p.setAttribute('stroke-width', fmtNum(st.strokeWidth || 1));
          p.setAttribute('stroke-linecap', 'round');
          p.setAttribute('stroke-linejoin', 'round');
          if (st.strokeAlpha < 1) p.setAttribute('stroke-opacity', fmtNum(st.strokeAlpha));
        }
        this._drawGroup.appendChild(p);
        st.pathEl = p;
      }
      st.pathEl.setAttribute('d', st.pathD);
      if (st.pathD.length > 16384) {
        st.pathEl = null;
        st.pathD = '';
      }
    }

    clear() {
      if (this._drawGroup) this._drawGroup.replaceChildren();
      this._drawState = null;
      this._drawBBox = null;
    }

    lineStyle(thickness, rgb, alpha) {
      this._ensureDrawLayer();
      this._flushDrawPath();
      if (thickness === undefined || thickness === null) {
        this._drawState.stroke = 'none';
        this._drawState.strokeWidth = 0;
      } else {
        const hex = '#' + ((Number(rgb) || 0) & 0xffffff).toString(16).padStart(6, '0');
        this._drawState.stroke = hex;
        this._drawState.strokeWidth = Math.max(0.5, Number(thickness) || 1);
        this._drawState.strokeAlpha = alpha !== undefined ? Math.max(0, Math.min(1, Number(alpha) / 100)) : 1;
      }
    }

    beginFill(rgb, alpha) {
      this._ensureDrawLayer();
      this._flushDrawPath();
      const hex = '#' + ((Number(rgb) || 0) & 0xffffff).toString(16).padStart(6, '0');
      this._drawState.fill = hex;
      this._drawState.fillAlpha = alpha !== undefined ? Math.max(0, Math.min(1, Number(alpha) / 100)) : 1;
    }

    endFill() {
      if (!this._drawState) return;
      this._flushDrawPath();
      this._drawState.fill = 'none';
    }

    moveTo(x, y) {
      this._ensureDrawLayer();
      const nx = Number(x) || 0, ny = Number(y) || 0;
      this._drawState.curX = nx;
      this._drawState.curY = ny;
      this._drawState.pathD += `M ${fmtNum(nx)} ${fmtNum(ny)} `;
      this._expandDrawBBox(nx, ny);
    }

    lineTo(x, y) {
      this._ensureDrawLayer();
      const nx = Number(x) || 0, ny = Number(y) || 0;
      if (!this._drawState.pathD) {
        this._drawState.pathD = `M ${fmtNum(this._drawState.curX)} ${fmtNum(this._drawState.curY)} `;
      }
      this._drawState.pathD += `L ${fmtNum(nx)} ${fmtNum(ny)} `;
      this._drawState.curX = nx;
      this._drawState.curY = ny;
      this._expandDrawBBox(nx, ny);
      if (this._drawState.fill === 'none') this._syncLiveStrokePath();
    }

    curveTo(cx, cy, ax, ay) {
      this._ensureDrawLayer();
      const ncx = Number(cx) || 0, ncy = Number(cy) || 0;
      const nax = Number(ax) || 0, nay = Number(ay) || 0;
      if (!this._drawState.pathD) {
        this._drawState.pathD = `M ${fmtNum(this._drawState.curX)} ${fmtNum(this._drawState.curY)} `;
      }
      this._drawState.pathD += `Q ${fmtNum(ncx)} ${fmtNum(ncy)} ${fmtNum(nax)} ${fmtNum(nay)} `;
      this._drawState.curX = nax;
      this._drawState.curY = nay;
      this._expandDrawBBox(ncx, ncy);
      this._expandDrawBBox(nax, nay);
      if (this._drawState.fill === 'none') this._syncLiveStrokePath();
    }

    destroy() {
      if (this._removed) return;
      this._removed = true;
      this._vm._liveClipCount = Math.max(0, (this._vm._liveClipCount || 1) - 1);
      this._fireClipEvents(CE_UNLOAD);
      if (typeof this._vars.onUnload === 'function') {
        try { this._vm._invokeValue(this._vars.onUnload, this, []); } catch (_) {}
      }
      if (this._pointerBound) {
        this.svgEl.removeEventListener('pointerdown', this._onPtrDown);
        this.svgEl.removeEventListener('pointerup', this._onPtrUp);
        this.svgEl.removeEventListener('pointerenter', this._onPtrEnter);
        this.svgEl.removeEventListener('pointerleave', this._onPtrLeave);
      }
      if (this._vm._dragClip === this) this._vm._dragClip = null;
      const depths = Array.from(this._childrenByDepth.keys());
      for (let i = 0; i < depths.length; i++) {
        this._removeSlotAtDepth(depths[i]);
      }
    }
  }

  /**
   * Main AVM1 Runtime Host driving an SVG stage container at the SWF's native FPS.
   */
  class ASTAVM1Runtime {
    constructor(payloadOrObj, options = {}) {
      this.program = typeof payloadOrObj === 'string'
        ? decodeBase64Json(payloadOrObj)
        : payloadOrObj;
      this.swfVer = this.program.swfVer || 6;
      this.caseInsensitive = this.swfVer <= 6;
      this.fps = Math.max(1, Math.min(60, this.program.fps || 24));
      this.frameStepSec = 1 / this.fps;
      this.stageWidth = this.program.w || 550;
      this.stageHeight = this.program.h || 400;
      this.engine = options.engine || null;
      this.doc = options.doc || (typeof document !== 'undefined' ? document : null);
      this.stageSvg = options.stageSvg || null;
      this.container = options.container || null;

      this._instCounter = 0;
      this._maskCounter = 0;
      this._decodedCache = new Map();
      this._shapeTemplateCache = new Map();
      this._exportLookup = new Map();
      this._initedSprites = new Set();
      this._liveButtons = new Set();

      // Build export linkage lookup (exact + case-insensitive)
      this._exportByCharId = new Map();
      this._registeredClasses = new Map();
      this._mcProto = Object.create(null);
      const exps = this.program.exp || {};
      for (const k of Object.keys(exps)) {
        this._exportLookup.set(k, exps[k]);
        this._exportLookup.set(k.toLowerCase(), exps[k]);
        if (!this._exportByCharId.has(exps[k])) {
          this._exportByCharId.set(exps[k], k.toLowerCase());
        }
      }

      // Runtime clock, input, drag, timers
      this._startTimeMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this._elapsedMs = 0;
      this._frameAcc = 0;
      this._tickCount = 0;
      this._mouseX = 0;
      this._mouseY = 0;
      this._mouseDown = false;
      this._keysDown = new Set();
      this._lastKeyCode = 0;
      this._lastKeyAscii = 0;
      this._keyListeners = [];
      this._mouseListeners = [];
      this._dragClip = null;
      this._dragOpts = null;
      this._intervals = new Map();
      this._nextIntervalId = 1;
      this._callDepth = 0;
      this._traces = [];
      this._liveClipCount = 0;
      this._tickOpsRemaining = BOOT_OPS_BUDGET;
      this._tickDeadlineMs = Infinity;
      this._budgetExceededThisTick = false;
      this._consecutiveBudgetExceeds = 0;
      this._scriptThrottled = false;
      this._throttleCounter = 0;
      this._skipBgScriptsThisTick = false;
      this._warnedThrottle = false;

      // Built-in Flash globals
      this._global = this._createFlashGlobals();

      // Root MovieClip (_root / _level0)
      this.rootClip = new AVM1MovieClip(
        this,
        0,
        {
          fc: this.program.fc || 1,
          l: this.program.l || [],
          fr: this.program.fr || [[]],
          ac: this.program.ac || [],
        },
        null,
        0,
        '',
        []
      );
      this._mounted = false;
    }

    _lookupExport(name) {
      if (name == null) return undefined;
      const s = String(name);
      if (this._exportLookup.has(s)) return this._exportLookup.get(s);
      return this._exportLookup.get(s.toLowerCase());
    }

    _createFlashGlobals() {
      const vm = this;
      const g = Object.create(null);

      // Key object
      const KeyObj = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
        SPACE: 32, ENTER: 13, SHIFT: 16, CONTROL: 17,
        ESCAPE: 27, BACKSPACE: 8, TAB: 9, CAPSLOCK: 20,
        DELETEKEY: 46, INSERT: 45, HOME: 36, END: 35,
        PGUP: 33, PGDN: 34,
        isDown(code) { return vm._keysDown.has(Number(code) | 0); },
        getCode() { return vm._lastKeyCode; },
        getAscii() { return vm._lastKeyAscii; },
        isToggled() { return false; },
        addListener(obj) {
          if (obj && vm._keyListeners.indexOf(obj) === -1) vm._keyListeners.push(obj);
        },
        removeListener(obj) {
          const i = vm._keyListeners.indexOf(obj);
          if (i !== -1) vm._keyListeners.splice(i, 1);
          return i !== -1;
        },
      };

      // Mouse object
      const MouseObj = {
        show() {
          if (vm.stageSvg && vm.stageSvg.style) vm.stageSvg.style.cursor = '';
          return 1;
        },
        hide() {
          if (vm.stageSvg && vm.stageSvg.style) vm.stageSvg.style.cursor = 'none';
          return 0;
        },
        addListener(obj) {
          if (obj && vm._mouseListeners.indexOf(obj) === -1) vm._mouseListeners.push(obj);
        },
        removeListener(obj) {
          const i = vm._mouseListeners.indexOf(obj);
          if (i !== -1) vm._mouseListeners.splice(i, 1);
          return i !== -1;
        },
      };

      // Stage object
      const StageObj = {
        get width() { return vm.stageWidth; },
        get height() { return vm.stageHeight; },
        scaleMode: 'showAll',
        align: '',
        showMenu: true,
        addListener() {},
        removeListener() {},
      };

      // Flash Color class
      function FlashColor(target) {
        this._target = target;
        this._rgb = 0;
      }
      FlashColor.prototype.setRGB = function (rgb) { this._rgb = Number(rgb) || 0; };
      FlashColor.prototype.getRGB = function () { return this._rgb; };
      FlashColor.prototype.setTransform = function () {};
      FlashColor.prototype.getTransform = function () { return { ra: 100, rb: 0, ga: 100, gb: 0, ba: 100, bb: 0, aa: 100, ab: 0 }; };

      // Flash Sound stub (safe 0-dependency Web Audio / no-op)
      function FlashSound(target) {
        this._target = target;
        this._volume = 100;
        this._pan = 0;
      }
      FlashSound.prototype.attachSound = function (id) { this._id = id; };
      FlashSound.prototype.start = function () {};
      FlashSound.prototype.stop = function () {};
      FlashSound.prototype.setVolume = function (v) { this._volume = Number(v) || 0; };
      FlashSound.prototype.getVolume = function () { return this._volume; };
      FlashSound.prototype.setPan = function (p) { this._pan = Number(p) || 0; };
      FlashSound.prototype.getPan = function () { return this._pan; };

      // Flash SharedObject in-memory stub
      const SharedObjectObj = {
        _stores: Object.create(null),
        getLocal(name) {
          if (!this._stores[name]) {
            this._stores[name] = { data: Object.create(null), flush() { return true; }, clear() { this.data = Object.create(null); } };
          }
          return this._stores[name];
        },
      };

      // VM-isolated Object & MovieClip constructors (supports AS2 Object.registerClass & MovieClip.prototype safely)
      function FlashObject(val) {
        return val !== undefined ? Object(val) : {};
      }
      FlashObject.prototype = Object.prototype;
      FlashObject.registerClass = function (linkageId, ctor) {
        if (!linkageId) return false;
        const key = String(linkageId).toLowerCase();
        if (typeof ctor === 'function') {
          vm._registeredClasses.set(key, ctor);
          return true;
        }
        vm._registeredClasses.delete(key);
        return true;
      };

      function FlashMovieClip() {}
      FlashMovieClip.prototype = vm._mcProto;

      // Flash ASBroadcaster (used widely by Flash MX/8 preloaders and UI components)
      const ASBroadcasterObj = {
        initialize(obj) {
          if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
          obj._listeners = [];
          obj.addListener = function (listener) {
            if (!listener) return false;
            this.removeListener(listener);
            this._listeners.push(listener);
            return true;
          };
          obj.removeListener = function (listener) {
            const idx = this._listeners.indexOf(listener);
            if (idx !== -1) {
              this._listeners.splice(idx, 1);
              return true;
            }
            return false;
          };
          obj.broadcastMessage = function (eventName, ...bArgs) {
            const list = this._listeners ? this._listeners.slice() : [];
            for (let i = 0; i < list.length; i++) {
              const fn = vm._getMember(list[i], eventName);
              if (typeof fn === 'function') vm._invokeValue(fn, list[i], bArgs);
            }
          };
        },
      };

      const SystemObj = {
        capabilities: {
          version: 'LNX 10,0,0,0',
          playerType: 'PlugIn',
          language: 'en',
          os: 'Web',
          screenResolutionX: vm.stageWidth,
          screenResolutionY: vm.stageHeight,
        },
        security: {
          allowDomain() {},
          allowInsecureDomain() {},
        },
        useCodepage: false,
      };

      function FlashMovieClipLoader() {
        this._listeners = [];
      }
      FlashMovieClipLoader.prototype.addListener = function (l) {
        if (l && this._listeners.indexOf(l) === -1) this._listeners.push(l);
        return true;
      };
      FlashMovieClipLoader.prototype.removeListener = function (l) {
        const i = this._listeners.indexOf(l);
        if (i !== -1) this._listeners.splice(i, 1);
        return i !== -1;
      };
      FlashMovieClipLoader.prototype.getProgress = function () {
        const fl = vm.program.fl || 4096;
        return { bytesLoaded: fl, bytesTotal: fl };
      };
      FlashMovieClipLoader.prototype.loadClip = function (_url, target) {
        const tgt = vm._resolveTargetPath(target, vm.rootClip) || target;
        const fl = vm.program.fl || 4096;
        const list = this._listeners.slice();
        for (let i = 0; i < list.length; i++) {
          const l = list[i];
          if (l && typeof l.onLoadStart === 'function') vm._invokeValue(l.onLoadStart, l, [tgt]);
          if (l && typeof l.onLoadProgress === 'function') vm._invokeValue(l.onLoadProgress, l, [tgt, fl, fl]);
          if (l && typeof l.onLoadComplete === 'function') vm._invokeValue(l.onLoadComplete, l, [tgt, 200]);
          if (l && typeof l.onLoadInit === 'function') vm._invokeValue(l.onLoadInit, l, [tgt]);
        }
        return true;
      };
      FlashMovieClipLoader.prototype.unloadClip = function () { return true; };

      g.Math = Math;
      g.Key = KeyObj;
      g.Mouse = MouseObj;
      g.Stage = StageObj;
      g.System = SystemObj;
      g.ASBroadcaster = ASBroadcasterObj;
      g.MovieClipLoader = FlashMovieClipLoader;
      g.Color = FlashColor;
      g.Sound = FlashSound;
      g.SharedObject = SharedObjectObj;
      g.Array = Array;
      g.Object = FlashObject;
      g.String = String;
      g.Number = Number;
      g.Boolean = Boolean;
      g.Date = Date;
      g.MovieClip = FlashMovieClip;
      g.TextField = AVM1TextField;
      g.NaN = NaN;
      g.Infinity = Infinity;
      g.isNaN = isNaN;
      g.isFinite = isFinite;
      g.parseInt = parseInt;
      g.parseFloat = parseFloat;
      g.escape = escape;
      g.unescape = unescape;
      g.int = (v) => Math.trunc(vm._toNum(v));
      g.random = (n) => Math.floor(Math.random() * Math.max(1, Math.floor(vm._toNum(n))));
      g.getTimer = () => Math.round(vm._elapsedMs);
      g.trace = (m) => { vm._pushTrace(String(m)); };
      g.updateAfterEvent = () => {};
      g.fscommand = () => {};
      g.getURL = () => {};
      g.setInterval = function (...args) {
        const id = vm._nextIntervalId++;
        if (typeof args[0] === 'function') {
          const fn = args[0];
          const ms = Math.max(10, Number(args[1]) || 16);
          vm._intervals.set(id, { fn, thisObj: vm.rootClip, args: args.slice(2), ms, acc: 0 });
        } else if (args[0] && typeof args[1] === 'string') {
          const obj = args[0];
          const methodName = args[1];
          const ms = Math.max(10, Number(args[2]) || 16);
          vm._intervals.set(id, { obj, methodName, args: args.slice(3), ms, acc: 0 });
        }
        return id;
      };
      g.clearInterval = function (id) { vm._intervals.delete(Number(id)); };
      g.setTimeout = function (...args) {
        const id = g.setInterval(...args);
        const rec = vm._intervals.get(id);
        if (rec) rec.once = true;
        return id;
      };
      g.clearTimeout = g.clearInterval;
      g._global = g;
      return g;
    }

    _pushTrace(msg) {
      if (this._traces.length >= MAX_TRACES) {
        this._traces.shift();
      }
      this._traces.push(msg);
    }

    _beginTickBudget(opsBudget, timeBudgetMs) {
      this._tickOpsRemaining = opsBudget;
      this._tickDeadlineMs = _nowMs() + timeBudgetMs;
      this._budgetExceededThisTick = false;
    }

    _beginEventBudget() {
      this._scriptThrottled = false;
      this._consecutiveBudgetExceeds = 0;
      this._skipBgScriptsThisTick = false;
      this._beginTickBudget(BOOT_OPS_BUDGET, BOOT_TIME_BUDGET_MS);
    }

    _isOverBudget() {
      if (this._budgetExceededThisTick) return true;
      if (this._tickOpsRemaining <= 0 || _nowMs() > this._tickDeadlineMs) {
        this._budgetExceededThisTick = true;
        return true;
      }
      return false;
    }

    _resolveB64(entry) {
      if (!entry) return null;
      if (entry.b64) return entry.b64;
      if (entry.bi !== undefined && this.program && this.program.bc) {
        return this.program.bc[entry.bi] || null;
      }
      return null;
    }

    _resolveClipActions(entry) {
      if (!entry) return [];
      if (entry.ca) return entry.ca;
      if (entry.ci !== undefined && this.program && this.program.cat) {
        return this.program.cat[entry.ci] || [];
      }
      return [];
    }

    _instantiateStaticCharSvg(charId, visited = null, depth = 0) {
      if (depth > 16) return null;
      if (this._shapeTemplateCache.has(charId)) {
        return this._shapeTemplateCache.get(charId).cloneNode(true);
      }
      const sh = this.program.sh && this.program.sh[charId];
      if (sh && Array.isArray(sh.p)) {
        // Zero-DOMParser, zero-regex direct SVG <path> primitive instantiation (v2 compact format)
        const g = createSvgEl(this.doc, 'g');
        const prims = sh.p;
        for (let i = 0; i < prims.length; i++) {
          const pr = prims[i];
          const pEl = createSvgEl(this.doc, 'path');
          pEl.setAttribute('d', pr[0]);
          pEl.setAttribute('fill', pr[1]);
          pEl.setAttribute('stroke', pr[2]);
          if (pr[2] !== 'none') {
            pEl.setAttribute('stroke-width', String(pr[3] || 1));
            pEl.setAttribute('stroke-linecap', 'round');
            pEl.setAttribute('stroke-linejoin', 'round');
          }
          g.appendChild(pEl);
        }
        this._shapeTemplateCache.set(charId, g);
        return g.cloneNode(true);
      }
      if (sh && sh.svg) {
        const tpl = parseSvgSnippetToNode(this.doc, sh.svg);
        this._shapeTemplateCache.set(charId, tpl);
        return tpl.cloneNode(true);
      }
      const mo = this.program.mo && this.program.mo[charId];
      if (mo && mo.s) {
        const p = createSvgEl(this.doc, 'path');
        p.setAttribute('d', mo.s);
        p.setAttribute('fill', mo.sf || 'none');
        p.setAttribute('stroke', mo.st || 'none');
        if (mo.sw) p.setAttribute('stroke-width', String(mo.sw));
        this._shapeTemplateCache.set(charId, p);
        return p.cloneNode(true);
      }
      const sp = this.program.sp && this.program.sp[charId];
      if (sp && sp.fr && Array.isArray(sp.fr[0])) {
        const seen = visited ? new Set(visited) : new Set();
        if (seen.has(charId)) return null;
        seen.add(charId);
        const g = createSvgEl(this.doc, 'g');
        const entries = sp.fr[0];
        for (let i = 0; i < entries.length; i++) {
          const e = entries[i];
          if (e.cd) continue;
          const childWrap = createSvgEl(this.doc, 'g');
          if (e.m) childWrap.setAttribute('transform', `matrix(${e.m.map(fmtNum).join(' ')})`);
          const sub = this._instantiateStaticCharSvg(e.c, seen, depth + 1);
          if (sub) childWrap.appendChild(sub);
          g.appendChild(childWrap);
        }
        this._shapeTemplateCache.set(charId, g);
        return g.cloneNode(true);
      }
      return null;
    }

    _populateClipPath(clipPathEl, charId, matrix) {
      const node = this._instantiateStaticCharSvg(charId);
      if (!node) return;
      const matStr = matrix ? `matrix(${matrix.map(fmtNum).join(' ')})` : '';
      const collect = (el, chain) => {
        if (!el) return;
        const tag = (el.nodeName || el.tagName || '').toLowerCase();
        const ownT = el.getAttribute && el.getAttribute('transform');
        const nextChain = ownT ? (chain ? `${chain} ${ownT}` : ownT) : chain;
        if (tag === 'path' || tag === 'rect' || tag === 'circle' || tag === 'ellipse' || tag === 'polygon' || tag === 'polyline') {
          const clone = el.cloneNode(false);
          if (clone.removeAttribute) {
            clone.removeAttribute('id');
            clone.removeAttribute('fill');
            clone.removeAttribute('stroke');
          }
          if (nextChain && clone.setAttribute) clone.setAttribute('transform', nextChain);
          clipPathEl.appendChild(clone);
          return;
        }
        const kids = el.childNodes || el.children || [];
        for (let i = 0; i < kids.length; i++) collect(kids[i], nextChain);
      };
      collect(node, matStr);
    }

    _ensureSpriteInitAction(charId, targetClip) {
      if (!charId || this._initedSprites.has(charId)) return;
      this._initedSprites.add(charId);
      const ias = this.program.ia || [];
      for (let i = 0; i < ias.length; i++) {
        if (ias[i].c === charId) {
          const b64 = this._resolveB64(ias[i]);
          if (b64) this.execBytecode(b64, targetClip || this.rootClip);
        }
      }
    }

    _applyRegisteredClass(mc, explicitLinkage) {
      if (!mc || !this._registeredClasses || this._registeredClasses.size === 0) return;
      const key = explicitLinkage
        ? String(explicitLinkage).toLowerCase()
        : (mc.charId ? this._exportByCharId.get(mc.charId) : null);
      if (!key) return;
      const ctor = this._registeredClasses.get(key);
      if (typeof ctor === 'function') {
        mc._proto = ctor.prototype || null;
        this._invokeValue(ctor, mc, []);
      }
    }

    /**
     * Mounts the AVM1 pure-SVG runtime onto the stage container, replacing static fallback
     * geometry inside #scene-root with the live hierarchical AVM1 MovieClip SVG DOM tree.
     */
    mount(container, stageSvg) {
      this.container = container || this.container;
      this.stageSvg = stageSvg || this.stageSvg;
      if (!this.container) return false;

      if (this.stageSvg && typeof this.stageSvg.setAttribute === 'function') {
        this.stageSvg.setAttribute('viewBox', `0 0 ${this.stageWidth} ${this.stageHeight}`);
      }

      // Preserve any gradient/pattern/filter definitions already present in the stage container before replacing children
      const preservedDefs = [];
      if (typeof this.container.querySelectorAll === 'function') {
        try {
          const existingGrads = this.container.querySelectorAll('defs linearGradient, defs radialGradient, defs pattern, defs filter');
          for (let i = 0; i < existingGrads.length; i++) {
            preservedDefs.push(existingGrads[i].cloneNode(true));
          }
        } catch (_) {}
      }

      // Build clean stage structure: <defs><clipPath id="swf-stage-clip">...</defs><rect id="bg"/><g id="avm1-stage-clip-root" clip-path="..."><g id="avm1-root"/></g>
      const defs = createSvgEl(this.doc, 'defs');
      const stageClip = createSvgEl(this.doc, 'clipPath');
      stageClip.setAttribute('id', 'swf-stage-clip');
      const clipRect = createSvgEl(this.doc, 'rect');
      clipRect.setAttribute('x', '0');
      clipRect.setAttribute('y', '0');
      clipRect.setAttribute('width', String(this.stageWidth));
      clipRect.setAttribute('height', String(this.stageHeight));
      stageClip.appendChild(clipRect);
      defs.appendChild(stageClip);
      for (let i = 0; i < preservedDefs.length; i++) {
        defs.appendChild(preservedDefs[i]);
      }
      this.defsEl = defs;

      const bg = createSvgEl(this.doc, 'rect');
      bg.setAttribute('id', 'bg');
      bg.setAttribute('width', String(this.stageWidth));
      bg.setAttribute('height', String(this.stageHeight));
      bg.setAttribute('fill', this.program.bg || '#0f172a');

      const sceneClipRoot = createSvgEl(this.doc, 'g');
      sceneClipRoot.setAttribute('id', 'avm1-stage-clip-root');
      sceneClipRoot.setAttribute('clip-path', 'url(#swf-stage-clip)');
      this.rootClip.svgEl.setAttribute('id', 'avm1-root');
      sceneClipRoot.appendChild(this.rootClip.svgEl);

      if (typeof this.container.replaceChildren === 'function') {
        this.container.replaceChildren(defs, bg, sceneClipRoot);
      } else {
        while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
        this.container.appendChild(defs);
        this.container.appendChild(bg);
        this.container.appendChild(sceneClipRoot);
      }

      this._bindStageInputs();
      this._mounted = true;

      // Boot frame 1 with a bounded wall-clock & op budget so runaway SWF boot scripts cannot freeze the tab
      this._beginTickBudget(BOOT_OPS_BUDGET, BOOT_TIME_BUDGET_MS);
      this.rootClip._justSpawned = false;
      // Run any top-level DoInitAction tags first
      const ias = this.program.ia || [];
      for (let i = 0; i < ias.length; i++) {
        if (this._isOverBudget()) break;
        if (!this._initedSprites.has(ias[i].c)) {
          const b64 = this._resolveB64(ias[i]);
          if (b64) {
            this._initedSprites.add(ias[i].c);
            this.execBytecode(b64, this.rootClip);
          }
        }
      }
      this.rootClip.reconcileDisplayList(1, true);
      if (!this._isOverBudget() && this.rootClip._currentframe === 1) {
        this.rootClip.runFrameActions(1);
      }
      // If the transpiler detected leading network/dead-end preloader frames (program.ef > 1)
      // and Frame 1 scripts left _root stuck before entryFrame, advance cleanly into the main body.
      const entryFrame = Number(this.program.ef) || 1;
      if (entryFrame > 1 && entryFrame <= this.rootClip._totalframes && !this._isOverBudget()) {
        const stuckBeforeEntry = this.rootClip._currentframe < entryFrame && !this.rootClip._playing;
        const preloaderStripped = Boolean(this.program.ps) && this.rootClip._currentframe < entryFrame;
        if (stuckBeforeEntry || preloaderStripped) {
          this.rootClip.gotoAndPlay(entryFrame);
        }
      }
      this.rootClip.commitSvg();
      this._syncTelemetry();
      return true;
    }

    _clientToStage(clientX, clientY) {
      const svg = this.stageSvg || this.container;
      if (svg && typeof svg.getScreenCTM === 'function' && typeof svg.createSVGPoint === 'function') {
        try {
          const ctm = svg.getScreenCTM();
          if (ctm) {
            const pt = svg.createSVGPoint();
            pt.x = clientX;
            pt.y = clientY;
            const local = pt.matrixTransform(ctm.inverse());
            if (Number.isFinite(local.x) && Number.isFinite(local.y)) {
              return { x: local.x, y: local.y };
            }
          }
        } catch (_) {}
      }
      if (svg && typeof svg.getBoundingClientRect === 'function') {
        const rect = svg.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          return {
            x: ((clientX - rect.left) / rect.width) * this.stageWidth,
            y: ((clientY - rect.top) / rect.height) * this.stageHeight,
          };
        }
      }
      return { x: clientX, y: clientY };
    }

    _bindStageInputs() {
      const target = this.stageSvg || this.container;
      const win = typeof window !== 'undefined' ? window : null;

      this._lastPointerMoveMs = 0;
      this._onPointerMove = (e) => {
        const now = _nowMs();
        if (now - this._lastPointerMoveMs < 15) return;
        this._lastPointerMoveMs = now;
        const pt = this._clientToStage(e.clientX, e.clientY);
        this.setMousePosition(pt.x, pt.y);
      };
      this._onPointerDown = (e) => {
        if (win && typeof win.focus === 'function') {
          try { win.focus(); } catch (_) {}
        }
        const pt = this._clientToStage(e.clientX, e.clientY);
        this.setMousePosition(pt.x, pt.y);
        this.triggerMouseDown();
      };
      this._onPointerUp = (e) => {
        if (e && typeof e.clientX === 'number') {
          const pt = this._clientToStage(e.clientX, e.clientY);
          this.setMousePosition(pt.x, pt.y);
        }
        this.triggerMouseUp();
      };
      this._onKeyDown = (e) => {
        if (e && e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
        const kc = mapEventKeyToFlashCode(e);
        if (!kc) return;
        if (kc === 32 || (kc >= 37 && kc <= 40)) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
        }
        const ascii = (e.key && e.key.length === 1) ? e.key.charCodeAt(0) : kc;
        this.triggerKeyDown(kc, ascii);
      };
      this._onKeyUp = (e) => {
        const kc = mapEventKeyToFlashCode(e);
        if (!kc) return;
        this.triggerKeyUp(kc);
      };

      if (target && typeof target.addEventListener === 'function') {
        target.addEventListener('pointermove', this._onPointerMove);
        target.addEventListener('pointerdown', this._onPointerDown);
      }
      if (win && typeof win.addEventListener === 'function') {
        win.addEventListener('pointerup', this._onPointerUp);
        win.addEventListener('keydown', this._onKeyDown);
        win.addEventListener('keyup', this._onKeyUp);
      }
    }

    // Programmatic & DOM input helpers (also called directly by headless tests!)
    setMousePosition(x, y) {
      this._mouseX = Number(x) || 0;
      this._mouseY = Number(y) || 0;
      this._updateDrag();
      this._beginTickBudget(TICK_OPS_BUDGET, TICK_TIME_BUDGET_MS);
      this._broadcastClipEvent(this.rootClip, CE_MOUSE_MOVE, 'onMouseMove');
      for (let i = 0; i < this._mouseListeners.length; i++) {
        if (this._isOverBudget()) break;
        const l = this._mouseListeners[i];
        if (l && typeof l.onMouseMove === 'function') this._invokeValue(l.onMouseMove, l, []);
      }
    }

    triggerMouseDown() {
      this._mouseDown = true;
      this._beginEventBudget();
      this._broadcastClipEvent(this.rootClip, CE_MOUSE_DOWN, 'onMouseDown');
      for (let i = 0; i < this._mouseListeners.length; i++) {
        if (this._isOverBudget()) break;
        const l = this._mouseListeners[i];
        if (l && typeof l.onMouseDown === 'function') this._invokeValue(l.onMouseDown, l, []);
      }
    }

    triggerMouseUp() {
      this._mouseDown = false;
      this._beginEventBudget();
      this._broadcastClipEvent(this.rootClip, CE_MOUSE_UP, 'onMouseUp');
      for (let i = 0; i < this._mouseListeners.length; i++) {
        if (this._isOverBudget()) break;
        const l = this._mouseListeners[i];
        if (l && typeof l.onMouseUp === 'function') this._invokeValue(l.onMouseUp, l, []);
      }
    }

    triggerKeyDown(flashKeyCode, ascii) {
      const kc = Number(flashKeyCode) | 0;
      this._keysDown.add(kc);
      this._lastKeyCode = kc;
      this._lastKeyAscii = ascii !== undefined ? ascii : kc;
      this._beginEventBudget();
      this._broadcastClipEvent(this.rootClip, CE_KEY_DOWN, 'onKeyDown');
      this._broadcastClipEvent(this.rootClip, CE_KEY_PRESS, null, kc);
      this._liveButtons.forEach((btn) => { if (!this._isOverBudget()) btn._fireKeyPress(kc); });
      for (let i = 0; i < this._keyListeners.length; i++) {
        if (this._isOverBudget()) break;
        const l = this._keyListeners[i];
        if (l && typeof l.onKeyDown === 'function') this._invokeValue(l.onKeyDown, l, []);
      }
    }

    triggerKeyUp(flashKeyCode) {
      const kc = Number(flashKeyCode) | 0;
      this._keysDown.delete(kc);
      this._beginEventBudget();
      this._broadcastClipEvent(this.rootClip, CE_KEY_UP, 'onKeyUp');
      for (let i = 0; i < this._keyListeners.length; i++) {
        if (this._isOverBudget()) break;
        const l = this._keyListeners[i];
        if (l && typeof l.onKeyUp === 'function') this._invokeValue(l.onKeyUp, l, []);
      }
    }

    _broadcastClipEvent(clip, flagMask, handlerProp, keyCode) {
      if (!clip || clip._removed || this._isOverBudget()) return;
      clip._fireClipEvents(flagMask, keyCode);
      if (clip._removed || this._isOverBudget()) return;
      if (handlerProp && typeof clip._vars[handlerProp] === 'function') {
        this._invokeValue(clip._vars[handlerProp], clip, []);
      }
      if (clip._childrenByDepth.size === 0) return;
      const kids = Array.from(clip._childrenByDepth.values());
      for (let i = 0; i < kids.length; i++) {
        if (this._isOverBudget()) break;
        if (kids[i].obj && kids[i].obj._isMovieClip) {
          this._broadcastClipEvent(kids[i].obj, flagMask, handlerProp, keyCode);
        }
      }
    }

    _updateDrag() {
      const mc = this._dragClip;
      if (!mc || mc._removed) {
        this._dragClip = null;
        return;
      }
      const opts = this._dragOpts || {};
      const parentInv = mc._parent ? invertMat(mc._parent.getWorldMatrix()) : [1, 0, 0, 1, 0, 0];
      const localPt = applyMatPt(parentInv, this._mouseX, this._mouseY);
      let nx = localPt.x + (opts.offsetX || 0);
      let ny = localPt.y + (opts.offsetY || 0);
      if (opts.constrain) {
        nx = Math.max(opts.left, Math.min(opts.right, nx));
        ny = Math.max(opts.top, Math.min(opts.bottom, ny));
      }
      mc._x = nx;
      mc._y = ny;
      mc._scriptModifiedTransform = true;
      mc.commitSvg();
    }

    startDragClip(mc, lockCenter, left, top, right, bottom) {
      if (!mc || !mc._isMovieClip || mc._removed) return;
      const parentInv = mc._parent ? invertMat(mc._parent.getWorldMatrix()) : [1, 0, 0, 1, 0, 0];
      const localPt = applyMatPt(parentInv, this._mouseX, this._mouseY);
      const hasBounds = left !== undefined && top !== undefined && right !== undefined && bottom !== undefined;
      this._dragClip = mc;
      this._dragOpts = {
        offsetX: lockCenter ? 0 : (mc._x - localPt.x),
        offsetY: lockCenter ? 0 : (mc._y - localPt.y),
        constrain: hasBounds,
        left: hasBounds ? Math.min(Number(left), Number(right)) : 0,
        right: hasBounds ? Math.max(Number(left), Number(right)) : 0,
        top: hasBounds ? Math.min(Number(top), Number(bottom)) : 0,
        bottom: hasBounds ? Math.max(Number(top), Number(bottom)) : 0,
      };
      this._updateDrag();
    }

    stopDragClip() {
      this._dragClip = null;
      this._dragOpts = null;
    }

    /**
     * Advances the SWF runtime by `dtSec` (called from AST engine 60 FPS tick loop).
     * Paces Flash frames at the SWF's exact native FPS independently of monitor refresh rate,
     * with a strict shared op + wall-clock budget so runaway SWF scripts can never hang the browser.
     */
    step(dtSec) {
      if (!this._mounted) return;
      try {
        const dt = Math.max(0, Math.min(0.1, Number(dtSec) || 0.0166667));
        this._elapsedMs += dt * 1000;
        this._beginTickBudget(TICK_OPS_BUDGET, TICK_TIME_BUDGET_MS);

        if (this._scriptThrottled) {
          this._throttleCounter = (this._throttleCounter + 1) % 15;
          this._skipBgScriptsThisTick = this._throttleCounter !== 0;
        } else {
          this._skipBgScriptsThisTick = false;
        }

        // Run setInterval timers (respect runaway-script throttle & per-tick budget)
        if (!this._skipBgScriptsThisTick && this._intervals.size > 0) {
          const dtMs = dt * 1000;
          const entries = Array.from(this._intervals.entries());
          for (let i = 0; i < entries.length; i++) {
            if (this._isOverBudget()) break;
            const [id, rec] = entries[i];
            if (!this._intervals.has(id)) continue;
            rec.acc += dtMs;
            if (rec.acc >= rec.ms) {
              rec.acc %= rec.ms;
              if (rec.once) this._intervals.delete(id);
              if (rec.fn) {
                this._invokeValue(rec.fn, rec.thisObj, rec.args);
              } else if (rec.obj && rec.methodName) {
                const m = this._getMember(rec.obj, rec.methodName);
                if (typeof m === 'function') this._invokeValue(m, rec.obj, rec.args);
              }
            }
          }
        }

        this._updateDrag();

        // Native-FPS frame pacing (cap catchup to 2 SWF frames per render tick; abort immediately on budget overrun)
        this._frameAcc += dt;
        let steps = 0;
        while (this._frameAcc >= this.frameStepSec - 1e-5 && steps < 2) {
          if (this._isOverBudget()) {
            this._frameAcc = 0;
            break;
          }
          this._frameAcc -= this.frameStepSec;
          this._tickCount++;
          this.rootClip.stepFrame();
          steps++;
        }
        if (this._frameAcc > this.frameStepSec * 2) {
          this._frameAcc = 0;
        }

        if (this._budgetExceededThisTick) {
          this._consecutiveBudgetExceeds++;
          if (this._consecutiveBudgetExceeds >= 10 && !this._scriptThrottled) {
            this._scriptThrottled = true;
            if (!this._warnedThrottle) {
              this._warnedThrottle = true;
              console.warn('[AST AVM1] Runaway ActionScript loop detected; throttling background scripts to keep browser responsive.');
            }
          }
        } else if (steps > 0) {
          this._consecutiveBudgetExceeds = 0;
        }

        this._syncTelemetry();
      } catch (err) {
        if (!this._warnedStepErr) {
          this._warnedStepErr = true;
          console.warn('[AST AVM1] Non-fatal frame step exception:', err);
        }
      }
    }

    /**
     * Executes exactly one SWF frame step synchronously (handy for deterministic tests).
     */
    stepOneSwfFrame() {
      if (!this._mounted) return;
      this._elapsedMs += this.frameStepSec * 1000;
      this._tickCount++;
      this._skipBgScriptsThisTick = false;
      this._beginTickBudget(BOOT_OPS_BUDGET, BOOT_TIME_BUDGET_MS);
      this._updateDrag();
      this.rootClip.stepFrame();
      this._syncTelemetry();
    }

    _syncTelemetry() {
      if (this.engine && this.engine.vars) {
        this.engine.vars.swf_frame = this.rootClip._currentframe;
        this.engine.vars.swf_playing = this.rootClip._playing ? 1 : 0;
        this.engine.vars.swf_totalframes = this.rootClip._totalframes;
        this.engine.vars.swf_framesloaded = this.rootClip._totalframes;
        this.engine.vars.swf_tick = this._tickCount;
      }
    }

    reset() {
      const container = this.container;
      const stageSvg = this.stageSvg;
      this.destroy(true);
      this._initedSprites.clear();
      this._liveButtons.clear();
      this._intervals.clear();
      this._keysDown.clear();
      this._elapsedMs = 0;
      this._frameAcc = 0;
      this._tickCount = 0;
      this._instCounter = 0;
      this._maskCounter = 0;
      this._liveClipCount = 0;
      this._consecutiveBudgetExceeds = 0;
      this._scriptThrottled = false;
      this._skipBgScriptsThisTick = false;
      this._warnedThrottle = false;
      this.rootClip = new AVM1MovieClip(
        this,
        0,
        {
          fc: this.program.fc || 1,
          l: this.program.l || [],
          fr: this.program.fr || [[]],
          ac: this.program.ac || [],
        },
        null,
        0,
        '',
        []
      );
      if (container) this.mount(container, stageSvg);
    }

    destroy(keepCaches = false) {
      this._mounted = false;
      this._intervals.clear();
      this._dragClip = null;
      const target = this.stageSvg || this.container;
      const win = typeof window !== 'undefined' ? window : null;
      if (target && typeof target.removeEventListener === 'function') {
        if (this._onPointerMove) target.removeEventListener('pointermove', this._onPointerMove);
        if (this._onPointerDown) target.removeEventListener('pointerdown', this._onPointerDown);
      }
      if (win && typeof win.removeEventListener === 'function') {
        if (this._onPointerUp) win.removeEventListener('pointerup', this._onPointerUp);
        if (this._onKeyDown) win.removeEventListener('keydown', this._onKeyDown);
        if (this._onKeyUp) win.removeEventListener('keyup', this._onKeyUp);
      }
      if (this.rootClip) this.rootClip.destroy();
      this._liveButtons.clear();
      if (!keepCaches) {
        this._shapeTemplateCache.clear();
        this._decodedCache.clear();
        this._traces.length = 0;
      }
    }

    // =========================================================================
    // AVM1 Value Coercion & Object / MovieClip Property Access
    // =========================================================================

    _toNum(v) {
      if (typeof v === 'number') return v;
      if (v === undefined) return this.swfVer <= 6 ? 0 : NaN;
      if (v === null) return 0;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (typeof v === 'string') {
        if (v === '') return this.swfVer <= 6 ? 0 : NaN;
        const n = Number(v);
        return Number.isNaN(n) && this.swfVer <= 4 ? 0 : n;
      }
      return Number(v);
    }

    _toBool(v) {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v !== 0 && !Number.isNaN(v);
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') {
        if (this.swfVer <= 6) {
          const n = Number(v);
          return !Number.isNaN(n) && n !== 0;
        }
        return v.length > 0;
      }
      return true;
    }

    _toStr(v) {
      if (typeof v === 'string') return v;
      if (v === undefined) return this.swfVer <= 6 ? '' : 'undefined';
      if (v === null) return 'null';
      if (v._isMovieClip) return v.getTargetPath();
      return String(v);
    }

    _resolveTargetPath(pathStr, baseClip) {
      if (pathStr && (pathStr._isMovieClip || pathStr._isTextField || pathStr._isButton)) return pathStr;
      let s = String(pathStr == null ? '' : pathStr).trim();
      if (!s || s === '.' || s === 'this') return baseClip || this.rootClip;
      if (s === '/' || s === '_root' || s === '_level0') return this.rootClip;

      // Normalize slash paths (/a/b, ../foo) and dot paths (_root.a.b)
      let cur = baseClip || this.rootClip;
      if (s.startsWith('/')) {
        cur = this.rootClip;
        s = s.slice(1);
      }
      const parts = s.split(/[./]+/).filter(Boolean);
      for (let i = 0; i < parts.length; i++) {
        if (!cur) return undefined;
        const p = parts[i];
        const pl = p.toLowerCase();
        if (pl === '_root' || pl === '_level0') {
          cur = this.rootClip;
        } else if (pl === '_parent' || p === '..') {
          cur = cur._parent || this.rootClip;
        } else if (pl === 'this') {
          continue;
        } else {
          cur = this._getMember(cur, p);
        }
      }
      return cur;
    }

    _resolveVariablePath(varName, baseClip) {
      const s = String(varName || '');
      const colonIdx = s.indexOf(':');
      if (colonIdx !== -1) {
        const targetPart = s.slice(0, colonIdx);
        const propPart = s.slice(colonIdx + 1);
        const target = this._resolveTargetPath(targetPart || '/', baseClip);
        return target ? this._getMember(target, propPart) : undefined;
      }
      if (s.includes('.')) {
        const parts = s.split('.');
        let cur = this._getVariable(parts[0], baseClip, null, null);
        for (let i = 1; i < parts.length; i++) {
          if (cur == null) return undefined;
          cur = this._getMember(cur, parts[i]);
        }
        return cur;
      }
      return this._getVariable(s, baseClip, null, null);
    }

    _getClipProp(clip, prop) {
      const pl = String(prop).toLowerCase();
      switch (pl) {
        case '_x': return clip._x;
        case '_y': return clip._y;
        case '_xscale': return clip._xscale;
        case '_yscale': return clip._yscale;
        case '_rotation': return clip._rotation;
        case '_alpha': return clip._alpha;
        case '_visible': return Boolean(clip._visible);
        case '_width': return clip._isMovieClip ? clip.getWorldBBox().w : (clip._width || 0);
        case '_height': return clip._isMovieClip ? clip.getWorldBBox().h : (clip._height || 0);
        case '_currentframe': return clip._currentframe || 1;
        case '_totalframes': return clip._totalframes || 1;
        case '_framesloaded': return clip._totalframes || 1;
        case '_bytesloaded':
        case '_bytestotal': return this.program.fl || 4096;
        case '_name': return clip._name || '';
        case '_target': return clip._isMovieClip ? clip.getTargetPath() : '';
        case '_parent': return clip._parent || undefined;
        case '_root':
        case '_level0': return this.rootClip;
        case '_xmouse': {
          if (!clip._isMovieClip) return this._mouseX;
          const local = applyMatPt(invertMat(clip.getWorldMatrix()), this._mouseX, this._mouseY);
          return local.x;
        }
        case '_ymouse': {
          if (!clip._isMovieClip) return this._mouseY;
          const local = applyMatPt(invertMat(clip.getWorldMatrix()), this._mouseX, this._mouseY);
          return local.y;
        }
        case '_droptarget': return '';
        case '_url': return 'file:///swf';
        case '_quality': return 'HIGH';
        case '_highquality': return 1;
        case '_focusrect': return true;
        case '_soundbuftime': return 5;
        default: return undefined;
      }
    }

    _setClipProp(clip, prop, val) {
      const pl = String(prop).toLowerCase();
      switch (pl) {
        case '_x': clip._x = this._toNum(val); clip._scriptModifiedTransform = true; clip.commitSvg(); return true;
        case '_y': clip._y = this._toNum(val); clip._scriptModifiedTransform = true; clip.commitSvg(); return true;
        case '_xscale': clip._xscale = this._toNum(val); clip._scriptModifiedTransform = true; clip.commitSvg(); return true;
        case '_yscale': clip._yscale = this._toNum(val); clip._scriptModifiedTransform = true; clip.commitSvg(); return true;
        case '_rotation': clip._rotation = this._toNum(val); clip._scriptModifiedTransform = true; clip.commitSvg(); return true;
        case '_alpha': clip._alpha = this._toNum(val); clip._scriptModifiedAlpha = true; clip.commitSvg(); return true;
        case '_visible': clip._visible = this._toBool(val); clip.commitSvg(); return true;
        case '_name': clip._name = this._toStr(val); return true;
        case '_width': {
          if (clip._isMovieClip) {
            const bb = clip.getLocalBBox();
            if (bb.w > 0) {
              clip._xscale = (this._toNum(val) / bb.w) * 100;
              clip._scriptModifiedTransform = true;
              clip.commitSvg();
            }
          }
          return true;
        }
        case '_height': {
          if (clip._isMovieClip) {
            const bb = clip.getLocalBBox();
            if (bb.h > 0) {
              clip._yscale = (this._toNum(val) / bb.h) * 100;
              clip._scriptModifiedTransform = true;
              clip.commitSvg();
            }
          }
          return true;
        }
        default: return false;
      }
    }

    _getClipMethod(clip, name) {
      const vm = this;
      switch (name) {
        case 'play': return () => clip.play();
        case 'stop': return () => clip.stop();
        case 'gotoAndPlay': return (a, b) => {
          const target = b !== undefined && !clip._labelMap.has(String(a == null ? '' : a).trim().toLowerCase()) ? b : a;
          clip.gotoAndPlay(target);
        };
        case 'gotoAndStop': return (a, b) => {
          const target = b !== undefined && !clip._labelMap.has(String(a == null ? '' : a).trim().toLowerCase()) ? b : a;
          clip.gotoAndStop(target);
        };
        case 'nextFrame': return () => clip.nextFrame();
        case 'prevFrame': return () => clip.prevFrame();
        case 'attachMovie': return (lnk, nm, d, init) => clip.attachMovie(lnk, nm, d, init);
        case 'duplicateMovieClip': return (nm, d, init) => clip.duplicateMovieClip(nm, d, init);
        case 'createEmptyMovieClip': return (nm, d) => clip.createEmptyMovieClip(nm, d);
        case 'removeMovieClip': return () => clip.removeMovieClip();
        case 'unloadMovie': return () => clip.removeMovieClip();
        case 'loadMovie': return () => {};
        case 'loadVariables': return () => {};
        case 'swapDepths': return (t) => clip.swapDepths(t);
        case 'getNextHighestDepth': return () => clip.getNextHighestDepth();
        case 'getDepth': return () => clip.getDepth();
        case 'hitTest': return (a, b, c) => clip.hitTest(a, b, c);
        case 'getBounds': return (s) => clip.getBounds(s);
        case 'localToGlobal': return (p) => clip.localToGlobal(p);
        case 'globalToLocal': return (p) => clip.globalToLocal(p);
        case 'startDrag': return (lc, l, t, r, b) => vm.startDragClip(clip, vm._toBool(lc), l, t, r, b);
        case 'stopDrag': return () => vm.stopDragClip();
        case 'getBytesLoaded': return () => vm.program.fl || 4096;
        case 'getBytesTotal': return () => vm.program.fl || 4096;
        case 'clear': return () => clip.clear();
        case 'lineStyle': return (t, rgb, a) => clip.lineStyle(t, rgb, a);
        case 'beginFill': return (rgb, a) => clip.beginFill(rgb, a);
        case 'endFill': return () => clip.endFill();
        case 'moveTo': return (x, y) => clip.moveTo(x, y);
        case 'lineTo': return (x, y) => clip.lineTo(x, y);
        case 'curveTo': return (cx, cy, ax, ay) => clip.curveTo(cx, cy, ax, ay);
        default: return undefined;
      }
    }

    _getMember(obj, propName) {
      if (obj === null || obj === undefined) return undefined;
      const key = String(propName);

      if (obj._isMovieClip) {
        if (key.startsWith('_')) {
          const special = this._getClipProp(obj, key);
          if (special !== undefined) return special;
        }
        if (key === 'enabled') return obj.enabled;
        if (key === 'useHandCursor') return obj.useHandCursor;
        // Own variables first
        if (key in obj._vars) return obj._vars[key];
        if (this.caseInsensitive) {
          const kl = key.toLowerCase();
          for (const k in obj._vars) {
            if (k.toLowerCase() === kl) return obj._vars[k];
          }
        }
        // Named child MovieClip / Button / TextField
        const child = obj.getChildByName(key);
        if (child !== undefined) return child;
        // Built-in MovieClip methods
        const m = this._getClipMethod(obj, key);
        if (m !== undefined) return m;
        if (this.caseInsensitive) {
          const kl = key.toLowerCase();
          const mcMethods = [
            'play', 'stop', 'gotoAndPlay', 'gotoAndStop', 'nextFrame', 'prevFrame',
            'attachMovie', 'duplicateMovieClip', 'createEmptyMovieClip', 'removeMovieClip',
            'unloadMovie', 'swapDepths', 'getNextHighestDepth', 'getDepth', 'hitTest',
            'getBounds', 'localToGlobal', 'globalToLocal', 'startDrag', 'stopDrag',
            'getBytesLoaded', 'getBytesTotal', 'clear', 'lineStyle', 'beginFill', 'endFill',
            'moveTo', 'lineTo', 'curveTo'
          ];
          for (let i = 0; i < mcMethods.length; i++) {
            if (mcMethods[i].toLowerCase() === kl) return this._getClipMethod(obj, mcMethods[i]);
          }
        }
        // Registered AS2 class prototype (Object.registerClass) and MovieClip.prototype
        if (obj._proto && typeof obj._proto === 'object') {
          if (key in obj._proto) return obj._proto[key];
          if (this.caseInsensitive) {
            const kl = key.toLowerCase();
            for (const k in obj._proto) {
              if (k.toLowerCase() === kl) return obj._proto[k];
            }
          }
        }
        if (this._mcProto) {
          if (key in this._mcProto) return this._mcProto[key];
          if (this.caseInsensitive) {
            const kl = key.toLowerCase();
            for (const k in this._mcProto) {
              if (k.toLowerCase() === kl) return this._mcProto[k];
            }
          }
        }
        return undefined;
      }

      if (obj._isTextField || obj._isButton) {
        if (key.startsWith('_')) {
          const special = this._getClipProp(obj, key);
          if (special !== undefined) return special;
        }
        if (key in obj) return obj[key];
        if (this.caseInsensitive) {
          const kl = key.toLowerCase();
          for (const k in obj) {
            if (k.toLowerCase() === kl) return obj[k];
          }
        }
        return undefined;
      }

      // Standard JS Array / String / Object / Math
      if (key in obj) return obj[key];
      if (this.caseInsensitive && typeof obj === 'object') {
        const kl = key.toLowerCase();
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].toLowerCase() === kl) return obj[keys[i]];
        }
      }
      return obj[key];
    }

    _setMember(obj, propName, val) {
      if (obj === null || obj === undefined) return;
      const key = String(propName);

      if (obj._isMovieClip) {
        if (key.startsWith('_') && this._setClipProp(obj, key, val)) return;
        if (key === 'enabled') { obj.enabled = this._toBool(val); return; }
        if (key === 'useHandCursor') { obj.useHandCursor = this._toBool(val); return; }
        if (key === 'onPress' || key === 'onRelease' || key === 'onReleaseOutside' || key === 'onRollOver' || key === 'onRollOut') {
          obj._ensurePointerListeners();
        }
        if (this.caseInsensitive) {
          const kl = key.toLowerCase();
          for (const k in obj._vars) {
            if (k.toLowerCase() === kl) {
              obj._vars[k] = val;
              return;
            }
          }
        }
        obj._vars[key] = val;
        return;
      }

      if (obj._isTextField || obj._isButton) {
        if (key.startsWith('_') && this._setClipProp(obj, key, val)) return;
        obj[key] = val;
        return;
      }

      if (typeof obj === 'object' || typeof obj === 'function') {
        if (this.caseInsensitive && !Array.isArray(obj)) {
          const kl = key.toLowerCase();
          const keys = Object.keys(obj);
          for (let i = 0; i < keys.length; i++) {
            if (keys[i].toLowerCase() === kl) {
              obj[keys[i]] = val;
              return;
            }
          }
        }
        obj[key] = val;
      }
    }

    _getVariable(name, targetClip, scopes, withStack, thisObj) {
      const key = String(name || '');
      if (!key) return undefined;

      // Handle colon slash paths ("/:score", "../:hp")
      if (key.includes(':')) {
        return this._resolveVariablePath(key, targetClip);
      }

      const kl = key.toLowerCase();
      if (kl === '_root' || kl === '_level0') return this.rootClip;
      if (kl === '_global') return this._global;
      if (kl === 'this') return (thisObj !== undefined && thisObj !== null) ? thisObj : targetClip;
      if (kl === '_parent') return targetClip ? targetClip._parent : undefined;

      // 1. With stack (innermost first)
      if (withStack && withStack.length > 0) {
        for (let i = withStack.length - 1; i >= 0; i--) {
          const wObj = withStack[i];
          const v = this._getMember(wObj, key);
          if (v !== undefined) return v;
        }
      }

      // 2. Local lexical scope chain (innermost first)
      if (scopes && scopes.length > 0) {
        for (let i = scopes.length - 1; i >= 0; i--) {
          const sc = scopes[i];
          if (key in sc) return sc[key];
          if (this.caseInsensitive) {
            for (const k in sc) {
              if (k.toLowerCase() === kl) return sc[k];
            }
          }
        }
      }

      // 3. Active non-MovieClip thisObj members (AS2 class/listener methods)
      if (thisObj && thisObj !== targetClip && typeof thisObj === 'object') {
        const tv = this._getMember(thisObj, key);
        if (tv !== undefined) return tv;
      }

      // 4. Target clip vars, children, special props, methods
      if (targetClip) {
        const v = this._getMember(targetClip, key);
        if (v !== undefined) return v;
      }

      // 5. _root (if different from targetClip)
      if (targetClip !== this.rootClip) {
        const rv = this._getMember(this.rootClip, key);
        if (rv !== undefined) return rv;
      }

      // 6. _global built-ins
      if (key in this._global) return this._global[key];
      if (this.caseInsensitive) {
        for (const k in this._global) {
          if (k.toLowerCase() === kl) return this._global[k];
        }
      }

      // 7. Fallback for dot-path variable names (e.g. "_root.preloader.pct")
      if (key.includes('.')) {
        return this._resolveVariablePath(key, targetClip);
      }

      return undefined;
    }

    _setVariable(name, val, targetClip, scopes, withStack) {
      const key = String(name || '');
      if (!key) return;

      // Handle colon paths ("/:score", "../:hp")
      const colonIdx = key.indexOf(':');
      if (colonIdx !== -1) {
        const targetPart = key.slice(0, colonIdx);
        const propPart = key.slice(colonIdx + 1);
        const tgt = this._resolveTargetPath(targetPart || '/', targetClip);
        if (tgt) this._setMember(tgt, propPart, val);
        return;
      }

      // 1. If variable exists in an active with-object, update it there
      if (withStack && withStack.length > 0) {
        for (let i = withStack.length - 1; i >= 0; i--) {
          const wObj = withStack[i];
          if (this._getMember(wObj, key) !== undefined) {
            this._setMember(wObj, key, val);
            return;
          }
        }
      }

      // 2. If variable exists in a local lexical scope, update it there
      if (scopes && scopes.length > 0) {
        const kl = this.caseInsensitive ? key.toLowerCase() : null;
        for (let i = scopes.length - 1; i >= 0; i--) {
          const sc = scopes[i];
          if (key in sc) {
            sc[key] = val;
            return;
          }
          if (this.caseInsensitive) {
            for (const k in sc) {
              if (k.toLowerCase() === kl) {
                sc[k] = val;
                return;
              }
            }
          }
        }
      }

      // 3. Otherwise set on active target clip (or rootClip)
      this._setMember(targetClip || this.rootClip, key, val);
    }

    _invokeValue(fn, thisObj, args) {
      if (typeof fn !== 'function') return undefined;
      if (this._callDepth >= MAX_CALL_DEPTH) return undefined;
      this._callDepth++;
      try {
        if (fn._isAvm1Fn) {
          return this._callAvm1Function(fn, thisObj, args);
        }
        return fn.apply(thisObj, args);
      } catch (_) {
        return undefined;
      } finally {
        this._callDepth--;
      }
    }

    _callAvm1Function(fn, thisObj, args) {
      const targetClip = (thisObj && thisObj._isMovieClip) ? thisObj : (fn._defClip || this.rootClip);
      const localScope = Object.create(null);
      const regs = new Array(Math.max(4, fn._regCount || 4));

      // Arguments object
      const argsObj = args.slice();
      argsObj.callee = fn;

      if (fn._isFn2) {
        let r = 1;
        if (fn._preloadThis) regs[r++] = thisObj;
        else if (!fn._suppressThis) localScope.this = thisObj;
        if (fn._preloadArguments) regs[r++] = argsObj;
        else if (!fn._suppressArguments) localScope.arguments = argsObj;
        if (fn._preloadSuper) regs[r++] = (thisObj && typeof thisObj === 'object') ? Object.getPrototypeOf(thisObj) : undefined;
        if (fn._preloadRoot) regs[r++] = this.rootClip;
        if (fn._preloadParent) regs[r++] = targetClip ? targetClip._parent : undefined;
        if (fn._preloadGlobal) regs[r++] = this._global;

        for (let i = 0; i < fn._params.length; i++) {
          const p = fn._params[i];
          const val = i < args.length ? args[i] : undefined;
          if (p.reg > 0) regs[p.reg] = val;
          else if (p.name) localScope[p.name] = val;
        }
      } else {
        localScope.arguments = argsObj;
        for (let i = 0; i < fn._params.length; i++) {
          const pName = fn._params[i];
          if (pName) localScope[pName] = i < args.length ? args[i] : undefined;
        }
      }

      const nextScopes = (fn._closureScopes || []).concat([localScope]);
      return this._runDecoded(
        fn._bodyDecoded,
        targetClip,
        thisObj || targetClip,
        nextScopes,
        regs,
        fn._constPool || []
      );
    }

    // =========================================================================
    // AVM1 Bytecode Interpreter Core
    // =========================================================================

    execBytecode(b64, targetClip) {
      if (!b64) return undefined;
      let decoded = this._decodedCache.get(b64);
      if (!decoded) {
        const bytes = decodeBase64ToBytes(b64);
        decoded = decodeBytecodeSlice(bytes, 0, bytes.length);
        this._decodedCache.set(b64, decoded);
      }
      return this._runDecoded(decoded, targetClip || this.rootClip, targetClip || this.rootClip, [], new Array(4), []);
    }

    _runDecoded(decoded, initialTarget, thisObj, scopes, regs, initialConstPool) {
      const { bytes, instrs, offsetToIdx } = decoded;
      const stack = [];
      let constPool = initialConstPool ? initialConstPool.slice() : [];
      let curTarget = initialTarget || this.rootClip;
      const withStack = [];
      const withEndOffsets = [];
      let pc = 0;
      let ops = 0;
      const total = instrs.length;

      const resolveJump = (targetByteOff) => {
        const direct = offsetToIdx.get(targetByteOff);
        if (direct !== undefined) return direct;
        for (let k = 0; k < total; k++) {
          if (instrs[k].off >= targetByteOff) return k;
        }
        return total;
      };

      while (pc < total) {
        if (++ops > MAX_OPS_PER_EXEC || --this._tickOpsRemaining <= 0) {
          this._budgetExceededThisTick = true;
          break;
        }
        if ((ops & 511) === 0 && _nowMs() > this._tickDeadlineMs) {
          this._budgetExceededThisTick = true;
          break;
        }
        const ins = instrs[pc];

        // Pop expired With scopes
        while (withEndOffsets.length > 0 && ins.off >= withEndOffsets[withEndOffsets.length - 1]) {
          withEndOffsets.pop();
          withStack.pop();
        }

        const code = ins.code;
        pc++;

        switch (code) {
          // --- Timeline & Target Control ---
          case 0x04: // ActionNextFrame
            if (curTarget && curTarget._isMovieClip) curTarget.nextFrame();
            break;
          case 0x05: // ActionPreviousFrame
            if (curTarget && curTarget._isMovieClip) curTarget.prevFrame();
            break;
          case 0x06: // ActionPlay
            if (curTarget && curTarget._isMovieClip) curTarget.play();
            break;
          case 0x07: // ActionStop
            if (curTarget && curTarget._isMovieClip) curTarget.stop();
            break;
          case 0x08: // ActionToggleQuality
          case 0x09: // ActionStopSounds
            break;
          case 0x81: { // ActionGotoFrame (0-based UI16); fuse trailing 0x06 ActionPlay into gotoAndPlay
            const frame0 = readUI16(bytes, ins.pStart);
            const fusePlay = pc < total && instrs[pc].code === 0x06;
            if (fusePlay) pc++;
            if (curTarget && curTarget._isMovieClip) {
              if (fusePlay) curTarget.gotoAndPlay(frame0 + 1);
              else curTarget.gotoAndStop(frame0 + 1);
            }
            break;
          }
          case 0x8C: { // ActionGoToLabel; fuse trailing 0x06 ActionPlay into gotoAndPlay
            const lbl = readCString(bytes, ins.pStart, ins.pEnd).value;
            const fusePlay = pc < total && instrs[pc].code === 0x06;
            if (fusePlay) pc++;
            if (curTarget && curTarget._isMovieClip) {
              if (fusePlay) curTarget.gotoAndPlay(lbl);
              else curTarget.gotoAndStop(lbl);
            }
            break;
          }
          case 0x9F: { // ActionGotoFrame2
            const flags = bytes[ins.pStart];
            const playFlag = (flags & 0x01) !== 0;
            const hasBias = (flags & 0x02) !== 0;
            const bias = hasBias ? readUI16(bytes, ins.pStart + 1) : 0;
            const frameArg = stack.pop();
            if (curTarget && curTarget._isMovieClip) {
              const target = (typeof frameArg === 'number' || (typeof frameArg === 'string' && /^\d+$/.test(frameArg.trim())))
                ? (Number(frameArg) + bias)
                : frameArg;
              if (playFlag) curTarget.gotoAndPlay(target);
              else curTarget.gotoAndStop(target);
            }
            break;
          }
          case 0x8B: { // ActionSetTarget
            const tName = readCString(bytes, ins.pStart, ins.pEnd).value;
            curTarget = tName ? (this._resolveTargetPath(tName, initialTarget) || initialTarget) : initialTarget;
            break;
          }
          case 0x20: { // ActionSetTarget2
            const tVal = stack.pop();
            const tName = this._toStr(tVal);
            curTarget = tName ? (this._resolveTargetPath(tName, initialTarget) || initialTarget) : initialTarget;
            break;
          }
          case 0x8A: // ActionWaitForFrame (100% loaded offline -> never skip)
            break;
          case 0x8D: // ActionWaitForFrame2
            stack.pop();
            break;
          case 0x9E: { // ActionCall (execute actions on specified frame without moving playhead)
            const frameVal = stack.pop();
            if (curTarget && curTarget._isMovieClip) {
              const fNum = curTarget.resolveFrameNumber(frameVal);
              curTarget.runFrameActions(fNum);
            }
            break;
          }

          // --- Stack & Constants ---
          case 0x88: { // ActionConstantPool
            const count = readUI16(bytes, ins.pStart);
            let p = ins.pStart + 2;
            constPool = new Array(count);
            for (let i = 0; i < count && p < ins.pEnd; i++) {
              const r = readCString(bytes, p, ins.pEnd);
              constPool[i] = r.value;
              p = r.next;
            }
            break;
          }
          case 0x96: { // ActionPush
            let p = ins.pStart;
            while (p < ins.pEnd) {
              const t = bytes[p++];
              if (t === 0) {
                const r = readCString(bytes, p, ins.pEnd);
                stack.push(r.value);
                p = r.next;
              } else if (t === 1) {
                stack.push(readFloat32(bytes, p));
                p += 4;
              } else if (t === 2) {
                stack.push(null);
              } else if (t === 3) {
                stack.push(undefined);
              } else if (t === 4) {
                stack.push(regs[bytes[p++]]);
              } else if (t === 5) {
                stack.push(bytes[p++] !== 0);
              } else if (t === 6) {
                stack.push(readSwfDouble(bytes, p));
                p += 8;
              } else if (t === 7) {
                stack.push(readSI32(bytes, p));
                p += 4;
              } else if (t === 8) {
                const idx = bytes[p++];
                stack.push(constPool[idx] !== undefined ? constPool[idx] : '');
              } else if (t === 9) {
                const idx = readUI16(bytes, p);
                p += 2;
                stack.push(constPool[idx] !== undefined ? constPool[idx] : '');
              } else {
                break;
              }
            }
            break;
          }
          case 0x17: // ActionPop
            stack.pop();
            break;
          case 0x4C: // ActionPushDuplicate
            stack.push(stack[stack.length - 1]);
            break;
          case 0x4D: { // ActionStackSwap
            const top = stack.pop();
            const second = stack.pop();
            stack.push(top, second);
            break;
          }
          case 0x87: { // ActionStoreRegister (peeks top of stack without popping)
            const regNum = bytes[ins.pStart];
            regs[regNum] = stack[stack.length - 1];
            break;
          }

          // --- Arithmetic, Comparison, Logic, Bitwise, String ---
          case 0x0A: { const a = this._toNum(stack.pop()); const b = this._toNum(stack.pop()); stack.push(b + a); break; }
          case 0x0B: { const a = this._toNum(stack.pop()); const b = this._toNum(stack.pop()); stack.push(b - a); break; }
          case 0x0C: { const a = this._toNum(stack.pop()); const b = this._toNum(stack.pop()); stack.push(b * a); break; }
          case 0x0D: { const a = this._toNum(stack.pop()); const b = this._toNum(stack.pop()); stack.push(a === 0 ? (b === 0 ? NaN : Infinity) : b / a); break; }
          case 0x3F: { const a = this._toNum(stack.pop()); const b = this._toNum(stack.pop()); stack.push(b % a); break; }
          case 0x0E: { const a = this._toNum(stack.pop()); const b = this._toNum(stack.pop()); stack.push(b === a); break; }
          case 0x0F: { const a = this._toNum(stack.pop()); const b = this._toNum(stack.pop()); stack.push(b < a); break; }
          case 0x10: { const a = this._toBool(stack.pop()); const b = this._toBool(stack.pop()); stack.push(b && a); break; }
          case 0x11: { const a = this._toBool(stack.pop()); const b = this._toBool(stack.pop()); stack.push(b || a); break; }
          case 0x12: { stack.push(!this._toBool(stack.pop())); break; }
          case 0x13: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b === a); break; }
          case 0x14:
          case 0x31: { stack.push(this._toStr(stack.pop()).length); break; }
          case 0x15:
          case 0x35: {
            const count = Math.max(0, Math.floor(this._toNum(stack.pop())));
            const idx = Math.max(1, Math.floor(this._toNum(stack.pop())));
            const s = this._toStr(stack.pop());
            stack.push(s.substr(idx - 1, count));
            break;
          }
          case 0x18: { stack.push(Math.trunc(this._toNum(stack.pop()))); break; }
          case 0x21: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b + a); break; }
          case 0x29: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b < a); break; }
          case 0x68: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b > a); break; }
          case 0x30: { const max = Math.floor(this._toNum(stack.pop())); stack.push(max > 0 ? Math.floor(Math.random() * max) : 0); break; }
          case 0x32:
          case 0x36: { const s = this._toStr(stack.pop()); stack.push(s.length > 0 ? s.charCodeAt(0) : 0); break; }
          case 0x33:
          case 0x37: { stack.push(String.fromCharCode(this._toNum(stack.pop()) & 0xffff)); break; }
          case 0x34: { stack.push(Math.round(this._elapsedMs)); break; }
          case 0x47: { // ActionAdd2
            const a = stack.pop();
            const b = stack.pop();
            if (typeof a === 'string' || typeof b === 'string') {
              stack.push(this._toStr(b) + this._toStr(a));
            } else {
              stack.push(this._toNum(b) + this._toNum(a));
            }
            break;
          }
          case 0x48: { // ActionLess2
            const a = stack.pop();
            const b = stack.pop();
            if (typeof a === 'string' && typeof b === 'string') stack.push(b < a);
            else stack.push(this._toNum(b) < this._toNum(a));
            break;
          }
          case 0x67: { // ActionGreater
            const a = stack.pop();
            const b = stack.pop();
            if (typeof a === 'string' && typeof b === 'string') stack.push(b > a);
            else stack.push(this._toNum(b) > this._toNum(a));
            break;
          }
          case 0x49: { // ActionEquals2
            const a = stack.pop();
            const b = stack.pop();
            // eslint-disable-next-line eqeqeq
            stack.push(b == a);
            break;
          }
          case 0x66: { // ActionStrictEquals
            const a = stack.pop();
            const b = stack.pop();
            stack.push(b === a);
            break;
          }
          case 0x4A: { stack.push(this._toNum(stack.pop())); break; }
          case 0x4B: { stack.push(this._toStr(stack.pop())); break; }
          case 0x50: { stack.push(this._toNum(stack.pop()) + 1); break; }
          case 0x51: { stack.push(this._toNum(stack.pop()) - 1); break; }
          case 0x60: { const a = this._toNum(stack.pop()) | 0; const b = this._toNum(stack.pop()) | 0; stack.push(b & a); break; }
          case 0x61: { const a = this._toNum(stack.pop()) | 0; const b = this._toNum(stack.pop()) | 0; stack.push(b | a); break; }
          case 0x62: { const a = this._toNum(stack.pop()) | 0; const b = this._toNum(stack.pop()) | 0; stack.push(b ^ a); break; }
          case 0x63: { const a = this._toNum(stack.pop()) & 31; const b = this._toNum(stack.pop()) | 0; stack.push(b << a); break; }
          case 0x64: { const a = this._toNum(stack.pop()) & 31; const b = this._toNum(stack.pop()) | 0; stack.push(b >> a); break; }
          case 0x65: { const a = this._toNum(stack.pop()) & 31; const b = this._toNum(stack.pop()) >>> 0; stack.push(b >>> a); break; }

          // --- Variables, Members, Properties, Objects, Arrays ---
          case 0x1C: { // ActionGetVariable
            const name = this._toStr(stack.pop());
            stack.push(this._getVariable(name, curTarget, scopes, withStack, thisObj));
            break;
          }
          case 0x1D: { // ActionSetVariable
            const val = stack.pop();
            const name = this._toStr(stack.pop());
            this._setVariable(name, val, curTarget, scopes, withStack);
            break;
          }
          case 0x3C: { // ActionDefineLocal
            const val = stack.pop();
            const name = this._toStr(stack.pop());
            if (scopes.length > 0) scopes[scopes.length - 1][name] = val;
            else this._setMember(curTarget, name, val);
            break;
          }
          case 0x41: { // ActionDefineLocal2
            const name = this._toStr(stack.pop());
            if (scopes.length > 0) scopes[scopes.length - 1][name] = undefined;
            else this._setMember(curTarget, name, undefined);
            break;
          }
          case 0x4E: { // ActionGetMember
            const prop = stack.pop();
            const obj = stack.pop();
            stack.push(this._getMember(obj, prop));
            break;
          }
          case 0x4F: { // ActionSetMember
            const val = stack.pop();
            const prop = stack.pop();
            const obj = stack.pop();
            this._setMember(obj, prop, val);
            break;
          }
          case 0x22: { // ActionGetProperty
            const idx = Math.floor(this._toNum(stack.pop()));
            const tgtVal = stack.pop();
            const tgt = this._resolveTargetPath(tgtVal, curTarget);
            const propName = PROP_BY_INDEX[idx];
            stack.push(tgt && propName ? this._getClipProp(tgt, propName) : undefined);
            break;
          }
          case 0x23: { // ActionSetProperty
            const val = stack.pop();
            const idx = Math.floor(this._toNum(stack.pop()));
            const tgtVal = stack.pop();
            const tgt = this._resolveTargetPath(tgtVal, curTarget);
            const propName = PROP_BY_INDEX[idx];
            if (tgt && propName) this._setClipProp(tgt, propName, val);
            break;
          }
          case 0x42: { // ActionInitArray
            const n = Math.max(0, Math.floor(this._toNum(stack.pop())));
            const arr = new Array(n);
            for (let i = 0; i < n; i++) arr[i] = stack.pop();
            stack.push(arr);
            break;
          }
          case 0x43: { // ActionInitObject
            const n = Math.max(0, Math.floor(this._toNum(stack.pop())));
            const obj = {};
            for (let i = 0; i < n; i++) {
              const v = stack.pop();
              const k = this._toStr(stack.pop());
              obj[k] = v;
            }
            stack.push(obj);
            break;
          }
          case 0x44: { // ActionTypeOf
            const v = stack.pop();
            if (v === null) stack.push('null');
            else if (v === undefined) stack.push('undefined');
            else if (v._isMovieClip) stack.push('movieclip');
            else stack.push(typeof v);
            break;
          }
          case 0x45: { // ActionTargetPath
            const v = stack.pop();
            stack.push(v && v._isMovieClip ? v.getTargetPath() : undefined);
            break;
          }
          case 0x46: { // ActionEnumerate
            const name = this._toStr(stack.pop());
            const obj = this._getVariable(name, curTarget, scopes, withStack, thisObj);
            stack.push(null);
            if (obj && typeof obj === 'object') {
              const keys = obj._isMovieClip ? Object.keys(obj._vars) : Object.keys(obj);
              for (let i = 0; i < keys.length; i++) stack.push(keys[i]);
            }
            break;
          }
          case 0x55: { // ActionEnumerate2
            const obj = stack.pop();
            stack.push(null);
            if (obj && typeof obj === 'object') {
              const keys = obj._isMovieClip ? Object.keys(obj._vars) : Object.keys(obj);
              for (let i = 0; i < keys.length; i++) stack.push(keys[i]);
            }
            break;
          }
          case 0x3A: { // ActionDelete
            const prop = this._toStr(stack.pop());
            const obj = stack.pop();
            let ok = false;
            if (obj && obj._isMovieClip) { ok = delete obj._vars[prop]; }
            else if (obj && typeof obj === 'object') { ok = delete obj[prop]; }
            stack.push(ok);
            break;
          }
          case 0x3B: { // ActionDelete2
            const name = this._toStr(stack.pop());
            let ok = false;
            if (scopes.length > 0 && name in scopes[scopes.length - 1]) {
              ok = delete scopes[scopes.length - 1][name];
            } else if (curTarget && curTarget._isMovieClip) {
              ok = delete curTarget._vars[name];
            }
            stack.push(ok);
            break;
          }
          case 0x54: { // ActionInstanceOf
            const ctor = stack.pop();
            const obj = stack.pop();
            stack.push(typeof ctor === 'function' ? (obj instanceof ctor) : false);
            break;
          }
          case 0x69: { // ActionExtends
            const superCtor = stack.pop();
            const subCtor = stack.pop();
            if (typeof superCtor === 'function' && typeof subCtor === 'function') {
              subCtor.prototype = Object.create(superCtor.prototype);
              subCtor.prototype.constructor = subCtor;
            }
            break;
          }
          case 0x2B: { // ActionCastOp
            const ctor = stack.pop();
            const obj = stack.pop();
            stack.push(typeof ctor === 'function' && (obj instanceof ctor) ? obj : null);
            break;
          }
          case 0x2C: { // ActionImplementsOp
            const ctor = stack.pop();
            const n = Math.max(0, Math.floor(this._toNum(stack.pop())));
            for (let i = 0; i < n; i++) stack.pop();
            void ctor;
            break;
          }

          // --- Legacy Sprite / Drag / Trace / GetURL ---
          case 0x24: { // ActionCloneSprite
            const depth = Math.floor(this._toNum(stack.pop()));
            const newName = this._toStr(stack.pop());
            const srcVal = stack.pop();
            const src = this._resolveTargetPath(srcVal, curTarget);
            if (src && src._isMovieClip) src.duplicateMovieClip(newName, depth);
            break;
          }
          case 0x25: { // ActionRemoveSprite
            const tgtVal = stack.pop();
            const tgt = this._resolveTargetPath(tgtVal, curTarget);
            if (tgt && tgt._isMovieClip) tgt.removeMovieClip();
            break;
          }
          case 0x26: { // ActionTrace
            this._pushTrace(this._toStr(stack.pop()));
            break;
          }
          case 0x27: { // ActionStartDrag
            const tgtVal = stack.pop();
            const lockCenter = this._toBool(stack.pop());
            const constrain = this._toNum(stack.pop());
            let left, top, right, bottom;
            if (constrain !== 0) {
              bottom = this._toNum(stack.pop());
              right = this._toNum(stack.pop());
              top = this._toNum(stack.pop());
              left = this._toNum(stack.pop());
            }
            const tgt = this._resolveTargetPath(tgtVal, curTarget);
            if (tgt && tgt._isMovieClip) {
              this.startDragClip(tgt, lockCenter, left, top, right, bottom);
            }
            break;
          }
          case 0x28: { // ActionEndDrag
            this.stopDragClip();
            break;
          }
          case 0x83: // ActionGetURL (safe offline no-op)
            break;
          case 0x9A: { // ActionGetURL2
            stack.pop(); // target
            stack.pop(); // url
            break;
          }

          // --- Branching & Scoping ---
          case 0x99: { // ActionJump (unconditional SI16 relative offset)
            const off = readSI16(bytes, ins.pStart);
            pc = resolveJump(ins.end + off);
            break;
          }
          case 0x9D: { // ActionIf (conditional SI16 relative offset: jump if truthy!)
            const off = readSI16(bytes, ins.pStart);
            const cond = stack.pop();
            if (this._toBool(cond)) {
              pc = resolveJump(ins.end + off);
            }
            break;
          }
          case 0x94: { // ActionWith
            const size = readUI16(bytes, ins.pStart);
            const obj = stack.pop();
            if (obj != null && (typeof obj === 'object' || typeof obj === 'function')) {
              withStack.push(obj);
              withEndOffsets.push(ins.end + size);
            } else {
              pc = resolveJump(ins.end + size);
            }
            break;
          }
          case 0x8F: { // ActionTry (header only; let try block execute normally and skip catch/finally)
            const flags = bytes[ins.pStart];
            const trySize = readUI16(bytes, ins.pStart + 1);
            const catchSize = readUI16(bytes, ins.pStart + 3);
            const finallySize = readUI16(bytes, ins.pStart + 5);
            void flags;
            // Execute try block inline; if it throws, skip to catch/finally safely
            const tryEnd = ins.end + trySize;
            const afterAll = tryEnd + catchSize + finallySize;
            const tryDecoded = decodeBytecodeSlice(bytes, ins.end, tryEnd);
            try {
              this._runDecoded(tryDecoded, curTarget, thisObj, scopes, regs, constPool);
            } catch (_) {
              if (catchSize > 0) {
                const catchDecoded = decodeBytecodeSlice(bytes, tryEnd, tryEnd + catchSize);
                this._runDecoded(catchDecoded, curTarget, thisObj, scopes, regs, constPool);
              }
            } finally {
              if (finallySize > 0) {
                const finDecoded = decodeBytecodeSlice(bytes, tryEnd + catchSize, afterAll);
                this._runDecoded(finDecoded, curTarget, thisObj, scopes, regs, constPool);
              }
            }
            pc = resolveJump(afterAll);
            break;
          }
          case 0x2A: { // ActionThrow
            const err = stack.pop();
            throw err;
          }

          // --- Functions & Method Calls ---
          case 0x9B: { // ActionDefineFunction
            let p = ins.pStart;
            const nr = readCString(bytes, p, ins.pEnd);
            const fnName = nr.value;
            p = nr.next;
            const numParams = readUI16(bytes, p);
            p += 2;
            const params = [];
            for (let i = 0; i < numParams && p < ins.pEnd; i++) {
              const pr = readCString(bytes, p, ins.pEnd);
              params.push(pr.value);
              p = pr.next;
            }
            const codeSize = readUI16(bytes, p);
            const bodyStart = ins.end;
            const bodyEnd = Math.min(decoded.end, bodyStart + codeSize);
            const bodyDecoded = decodeBytecodeSlice(bytes, bodyStart, bodyEnd);
            const vm = this;
            const fnObj = function (...callArgs) {
              return vm._callAvm1Function(fnObj, this, callArgs);
            };
            fnObj._isAvm1Fn = true;
            fnObj._isFn2 = false;
            fnObj._params = params;
            fnObj._bodyDecoded = bodyDecoded;
            fnObj._constPool = constPool.slice();
            fnObj._closureScopes = scopes.slice();
            fnObj._defClip = curTarget;

            if (fnName) {
              this._setVariable(fnName, fnObj, curTarget, scopes, withStack);
            } else {
              stack.push(fnObj);
            }
            pc = resolveJump(bodyEnd);
            break;
          }
          case 0x8E: { // ActionDefineFunction2
            let p = ins.pStart;
            const nr = readCString(bytes, p, ins.pEnd);
            const fnName = nr.value;
            p = nr.next;
            const numParams = readUI16(bytes, p);
            p += 2;
            const regCount = bytes[p++];
            const flags1 = bytes[p++];
            const flags2 = bytes[p++];
            const params = [];
            for (let i = 0; i < numParams && p < ins.pEnd; i++) {
              const reg = bytes[p++];
              const pr = readCString(bytes, p, ins.pEnd);
              params.push({ reg, name: pr.value });
              p = pr.next;
            }
            const codeSize = readUI16(bytes, p);
            const bodyStart = ins.end;
            const bodyEnd = Math.min(decoded.end, bodyStart + codeSize);
            const bodyDecoded = decodeBytecodeSlice(bytes, bodyStart, bodyEnd);
            const vm = this;
            const fnObj = function (...callArgs) {
              return vm._callAvm1Function(fnObj, this, callArgs);
            };
            fnObj._isAvm1Fn = true;
            fnObj._isFn2 = true;
            fnObj._regCount = regCount;
            fnObj._preloadParent = (flags1 & 0x80) !== 0;
            fnObj._preloadRoot = (flags1 & 0x40) !== 0;
            fnObj._suppressSuper = (flags1 & 0x20) !== 0;
            fnObj._preloadSuper = (flags1 & 0x10) !== 0;
            fnObj._suppressArguments = (flags1 & 0x08) !== 0;
            fnObj._preloadArguments = (flags1 & 0x04) !== 0;
            fnObj._suppressThis = (flags1 & 0x02) !== 0;
            fnObj._preloadThis = (flags1 & 0x01) !== 0;
            fnObj._preloadGlobal = (flags2 & 0x01) !== 0;
            fnObj._params = params;
            fnObj._bodyDecoded = bodyDecoded;
            fnObj._constPool = constPool.slice();
            fnObj._closureScopes = scopes.slice();
            fnObj._defClip = curTarget;

            if (fnName) {
              this._setVariable(fnName, fnObj, curTarget, scopes, withStack);
            } else {
              stack.push(fnObj);
            }
            pc = resolveJump(bodyEnd);
            break;
          }
          case 0x3E: { // ActionReturn
            return stack.pop();
          }
          case 0x3D: { // ActionCallFunction
            const fnName = this._toStr(stack.pop());
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            const args = new Array(numArgs);
            for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            let res;
            if (fnName === 'eval') {
              res = this._resolveTargetPath(args[0], curTarget);
              if (res === undefined && args[0] != null) {
                res = this._resolveVariablePath(String(args[0]), curTarget);
              }
            } else {
              const fn = this._getVariable(fnName, curTarget, scopes, withStack, thisObj);
              res = this._invokeValue(fn, curTarget, args);
            }
            stack.push(res);
            break;
          }
          case 0x52: { // ActionCallMethod
            const methodName = stack.pop();
            const obj = stack.pop();
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            const args = new Array(numArgs);
            for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            let res;
            if (methodName === undefined || methodName === null || methodName === '') {
              res = this._invokeValue(obj, curTarget, args);
            } else {
              const fn = this._getMember(obj, String(methodName));
              res = this._invokeValue(fn, obj, args);
            }
            stack.push(res);
            break;
          }
          case 0x40: { // ActionNewObject
            const ctorName = this._toStr(stack.pop());
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            const args = new Array(numArgs);
            for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            const ctor = this._getVariable(ctorName, curTarget, scopes, withStack, thisObj);
            let instance;
            if (typeof ctor === 'function') {
              if (ctor._isAvm1Fn) {
                instance = Object.create(ctor.prototype || Object.prototype);
                const r = this._invokeValue(ctor, instance, args);
                if (r && typeof r === 'object') instance = r;
              } else {
                try { instance = new ctor(...args); } catch (_) { instance = {}; }
              }
            } else {
              instance = {};
            }
            stack.push(instance);
            break;
          }
          case 0x53: { // ActionNewMethod
            const methodName = stack.pop();
            const obj = stack.pop();
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            const args = new Array(numArgs);
            for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            const ctor = (methodName === undefined || methodName === null || methodName === '')
              ? obj
              : this._getMember(obj, String(methodName));
            let instance;
            if (typeof ctor === 'function') {
              if (ctor._isAvm1Fn) {
                instance = Object.create(ctor.prototype || Object.prototype);
                const r = this._invokeValue(ctor, instance, args);
                if (r && typeof r === 'object') instance = r;
              } else {
                try { instance = new ctor(...args); } catch (_) { instance = {}; }
              }
            } else {
              instance = {};
            }
            stack.push(instance);
            break;
          }

          default:
            // Safely ignore unrecognized/unimplemented opcodes without halting execution
            break;
        }
      }

      return undefined;
    }
  }

  global.ASTAVM1Runtime = ASTAVM1Runtime;
  if (typeof window !== 'undefined') {
    window.ASTAVM1Runtime = ASTAVM1Runtime;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTAVM1Runtime, AVM1MovieClip, AVM1Button, AVM1TextField };
  }
})(typeof window !== 'undefined' ? window : globalThis);
