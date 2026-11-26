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
  const AS_DEPTH_OFFSET = 16384;
  const MAX_OPS_PER_EXEC = 350000;
  const TICK_OPS_BUDGET = 150000;
  const BOOT_OPS_BUDGET = 600000;
  const TICK_TIME_BUDGET_MS = 25;
  const BOOT_TIME_BUDGET_MS = 200;
  const MAX_CALL_DEPTH = 64;
  const MAX_LIVE_CLIPS = 3000;
  const MAX_CHILDREN_PER_CLIP = 2048;
  const MAX_DRAW_PATHS = 1024;
  const MAX_TRACES = 200;

  let _sharedDomParser = null;
  function _nowMs() {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  }

  /**
   * Ruffle-compatible AVM1 (SWF < 7) numeric coercion:
   * - undefined / null -> 0 (instead of JS NaN)
   * - boolean -> 1 / 0
   * - numeric strings -> finite number; empty/non-numeric strings -> 0
   */
  function toAvm1Number(val) {
    if (typeof val === 'number') return val;
    if (val === undefined || val === null) return 0;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'string') {
      const s = val.trim();
      if (s === '') return 0;
      const n = Number(s);
      return Number.isNaN(n) ? 0 : n;
    }
    const n = Number(val);
    return Number.isNaN(n) ? 0 : n;
  }

  // Zero-overhead opt-in SWF diagnostic flag & shared state registry (default false)
  if (typeof global.__SWF_DEBUG__ === 'undefined') {
    global.__SWF_DEBUG__ = false;
  }
  function _isSwfDebugEnabled() {
    return global.__SWF_DEBUG__ === true;
  }
  function _getSwfDebugSharedState() {
    if (!global.__SWF_DEBUG_STATE__) {
      global.__SWF_DEBUG_STATE__ = {
        importSummary: { totalTagsParsed: 0, cachedDefsShapes: 0, skippedTagIds: [] },
        activeRuntime: null,
      };
    }
    return global.__SWF_DEBUG_STATE__;
  }
  function _countSubtreeElements(el) {
    if (!el) return 0;
    let count = 0;
    const kids = el.children || el.childNodes || [];
    for (let i = 0; i < kids.length; i++) {
      const child = kids[i];
      if (!child || (child.nodeType !== undefined && child.nodeType !== 1)) continue;
      count += 1 + _countSubtreeElements(child);
    }
    return count;
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
  const CE_DRAG_OVER = 0x8000;
  const CE_DRAG_OUT = 0x10000;
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

  const EMPTY_ARR = Object.freeze([]);
  const IDENTITY_MAT = Object.freeze([1, 0, 0, 1, 0, 0]);
  const _invMatScratch = new Float64Array(6);

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

  function mulMatInto(out, m1, m2) {
    const a0 = m1[0] * m2[0] + m1[2] * m2[1];
    const a1 = m1[1] * m2[0] + m1[3] * m2[1];
    const a2 = m1[0] * m2[2] + m1[2] * m2[3];
    const a3 = m1[1] * m2[2] + m1[3] * m2[3];
    const a4 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    const a5 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
    out[0] = a0; out[1] = a1; out[2] = a2; out[3] = a3; out[4] = a4; out[5] = a5;
    return out;
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

  function invertMatInto(out, m) {
    const m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5];
    const det = m0 * m3 - m1 * m2;
    if (Math.abs(det) < 1e-9) {
      out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 1; out[4] = -m4; out[5] = -m5;
      return out;
    }
    const inv = 1 / det;
    out[0] = m3 * inv;
    out[1] = -m1 * inv;
    out[2] = -m2 * inv;
    out[3] = m0 * inv;
    out[4] = (m2 * m5 - m3 * m4) * inv;
    out[5] = (m1 * m4 - m0 * m5) * inv;
    return out;
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

  function composeMatInto(out, x, y, xscale, yscale, rotation) {
    const rot = rotation || 0;
    const sx = (xscale === undefined ? 100 : xscale) / 100;
    const sy = (yscale === undefined ? 100 : yscale) / 100;
    if (rot === 0) {
      out[0] = sx;
      out[1] = 0;
      out[2] = 0;
      out[3] = sy;
      out[4] = x || 0;
      out[5] = y || 0;
      return out;
    }
    const rad = rot * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    out[0] = cos * sx;
    out[1] = sin * sx;
    out[2] = -sin * sy;
    out[3] = cos * sy;
    out[4] = x || 0;
    out[5] = y || 0;
    return out;
  }

  function composeMat(x, y, xscale, yscale, rotation) {
    const out = [1, 0, 0, 1, 0, 0];
    return composeMatInto(out, x, y, xscale, yscale, rotation);
  }

  function _resolveJump(offsetToIdx, instrs, total, targetByteOff) {
    const direct = offsetToIdx.get(targetByteOff);
    if (direct !== undefined) return direct;
    for (let k = 0; k < total; k++) {
      if (instrs[k].off >= targetByteOff) return k;
    }
    return total;
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

  const CODE_TO_FLASH_KEY = {
    Backspace: 8, Tab: 9, Enter: 13, NumpadEnter: 13,
    ShiftLeft: 16, ShiftRight: 16, ControlLeft: 17, ControlRight: 17,
    AltLeft: 18, AltRight: 18, Pause: 19, CapsLock: 20, Escape: 27,
    Space: 32, PageUp: 33, PageDown: 34, End: 35, Home: 36,
    ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40,
    Insert: 45, Delete: 46,
    Numpad0: 96, Numpad1: 97, Numpad2: 98, Numpad3: 99, Numpad4: 100,
    Numpad5: 101, Numpad6: 102, Numpad7: 103, Numpad8: 104, Numpad9: 105,
    NumpadMultiply: 106, NumpadAdd: 107, NumpadSubtract: 109,
    NumpadDecimal: 110, NumpadDivide: 111,
    F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117,
    F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
    NumLock: 144, ScrollLock: 145,
    Semicolon: 186, Equal: 187, Comma: 188, Minus: 189, Period: 190,
    Slash: 191, Backquote: 192, BracketLeft: 219, Backslash: 220,
    BracketRight: 221, Quote: 222,
  };

  function mapEventKeyToFlashCode(e) {
    if (!e) return 0;
    const code = e.code || '';
    if (code && Object.prototype.hasOwnProperty.call(CODE_TO_FLASH_KEY, code)) {
      return CODE_TO_FLASH_KEY[code];
    }
    if (code.startsWith('Key') && code.length === 4) return code.charCodeAt(3);
    if (code.startsWith('Digit') && code.length === 6) return code.charCodeAt(5);
    if (typeof e.keyCode === 'number' && e.keyCode > 0) return e.keyCode;
    const key = e.key || '';
    if (key.length === 1) {
      const upper = key.toUpperCase().charCodeAt(0);
      if ((upper >= 65 && upper <= 90) || (upper >= 48 && upper <= 57)) return upper;
      return key.charCodeAt(0);
    }
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
      this._editable = Boolean(def.ed);
      this._password = Boolean(def.pw);
      this._multiline = Boolean(def.ml);
      this._maxChars = def.mx || 0;
      this._restrict = null;
      this._textColor = null;
      this._background = Boolean(def.bd);
      this._backgroundColor = null;
      this._border = Boolean(def.bd);
      this._borderColor = null;
      this.tabIndex = undefined;
      this._focused = false;
      this._lastRenderedText = null;
      this._lastTransform = '';
      this._lastOpacity = '';
      this._lastVis = '';

      this.svgEl = createSvgEl(vm.doc, 'g');
      this.svgEl.setAttribute('data-avm1-text', String(charId));
      if (this._name) this.svgEl.setAttribute('data-swf-name', this._name);

      const align = def.al || 0;
      const anchor = align === 1 ? 'end' : (align === 2 ? 'middle' : 'start');
      const tx = align === 1 ? (def.x + def.w) : (align === 2 ? (def.x + def.w / 2) : def.x + (this._editable ? 4 : 0));
      const fs = def.fs || 14;
      const ty = def.y + Math.min(def.h || fs, Math.max(fs, (def.h || fs) * 0.72));
      this._baseTx = tx;
      this._baseTy = ty;
      this._fontSize = fs;

      if (def.bd || this._editable) {
        this.bgRect = createSvgEl(vm.doc, 'rect');
        this.bgRect.setAttribute('x', fmtNum(def.x));
        this.bgRect.setAttribute('y', fmtNum(def.y));
        this.bgRect.setAttribute('width', fmtNum(Math.max(24, def.w || 120)));
        this.bgRect.setAttribute('height', fmtNum(Math.max(fs + 6, def.h || (fs + 8))));
        this.bgRect.setAttribute('rx', '3');
        this.bgRect.setAttribute('fill', def.bd ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.001)');
        this.bgRect.setAttribute('stroke', def.bd ? '#94a3b8' : 'none');
        this.bgRect.setAttribute('stroke-width', def.bd ? '1' : '0');
        if (this._editable) {
          this.bgRect.setAttribute('pointer-events', 'all');
          this.bgRect.style.cursor = 'text';
          this._onFocusClick = (e) => {
            if (!this._visible || !this._editable) return;
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
            if (this._vm._global && this._vm._global.Selection) {
              this._vm._global.Selection.setFocus(this);
            }
          };
          this.bgRect.addEventListener('pointerdown', this._onFocusClick);
        }
        this.svgEl.appendChild(this.bgRect);
      }

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
      this.svgEl.appendChild(this.textEl);

      if (this._editable) {
        this.caretEl = createSvgEl(vm.doc, 'line');
        this.caretEl.setAttribute('stroke', def.col || '#38bdf8');
        this.caretEl.setAttribute('stroke-width', '1.5');
        this.caretEl.setAttribute('display', 'none');
        this.caretEl.setAttribute('pointer-events', 'none');
        this.svgEl.appendChild(this.caretEl);
      }

      this._renderTextDisplay();
    }

    _ensureBgRect() {
      if (this.bgRect) return this.bgRect;
      const fs = this._fontSize || 14;
      const def = this.def || {};
      this.bgRect = createSvgEl(this._vm.doc, 'rect');
      this.bgRect.setAttribute('x', fmtNum(def.x || 0));
      this.bgRect.setAttribute('y', fmtNum(def.y || 0));
      this.bgRect.setAttribute('width', fmtNum(Math.max(24, def.w || 120)));
      this.bgRect.setAttribute('height', fmtNum(Math.max(fs + 6, def.h || (fs + 8))));
      this.bgRect.setAttribute('rx', '3');
      this.bgRect.setAttribute('fill', 'none');
      this.bgRect.setAttribute('stroke', 'none');
      this.bgRect.setAttribute('stroke-width', '0');
      if (this.textEl && this.textEl.parentNode === this.svgEl) {
        this.svgEl.insertBefore(this.bgRect, this.textEl);
      } else {
        this.svgEl.appendChild(this.bgRect);
      }
      return this.bgRect;
    }

    _isCharAllowedByRestrict(ch) {
      const r = this._restrict;
      if (r === null || r === undefined) return true;
      if (r === '') return false;
      const code = ch.charCodeAt(0);
      let allowSpecified = false;
      let allowed = false;
      let excluded = false;
      let modeExclude = false;
      let i = 0;
      const len = r.length;
      const readToken = () => {
        if (i >= len) return null;
        if (r[i] === '\\' && i + 1 < len) {
          i += 2;
          return r.charCodeAt(i - 1);
        }
        return r.charCodeAt(i++);
      };
      while (i < len) {
        if (r[i] === '^') {
          modeExclude = !modeExclude;
          i++;
          continue;
        }
        const startCode = readToken();
        if (startCode === null) break;
        let endCode = startCode;
        if (i < len && r[i] === '-' && i + 1 < len && r[i + 1] !== '^') {
          i++; // consume '-'
          const nextCode = readToken();
          if (nextCode !== null) endCode = nextCode;
        }
        const lo = Math.min(startCode, endCode);
        const hi = Math.max(startCode, endCode);
        if (modeExclude) {
          if (code >= lo && code <= hi) excluded = true;
        } else {
          allowSpecified = true;
          if (code >= lo && code <= hi) allowed = true;
        }
      }
      if (excluded) return false;
      if (allowSpecified) return allowed;
      return true;
    }

    _renderTextDisplay() {
      const shown = this._password ? '•'.repeat(this._text.length) : this._text;
      if (this._lastRenderedText !== shown) {
        this._lastRenderedText = shown;
        this.textEl.textContent = shown;
      }
      if (this.caretEl) {
        if (this._focused) {
          const approxWidth = shown.length * (this._fontSize * 0.58);
          const cx = this._baseTx + approxWidth + 2;
          this.caretEl.setAttribute('x1', fmtNum(cx));
          this.caretEl.setAttribute('x2', fmtNum(cx));
          this.caretEl.setAttribute('y1', fmtNum(this._baseTy - this._fontSize * 0.85));
          this.caretEl.setAttribute('y2', fmtNum(this._baseTy + 2));
          this.caretEl.setAttribute('display', 'inline');
        } else {
          this.caretEl.setAttribute('display', 'none');
        }
      }
      if (this.bgRect) {
        const fillVal = this._background
          ? (this._backgroundColor || (this.def.bd ? 'rgba(15, 23, 42, 0.75)' : '#ffffff'))
          : (this._editable ? 'rgba(255, 255, 255, 0.001)' : 'none');
        this.bgRect.setAttribute('fill', fillVal);
        if (this._focused && this._editable) {
          this.bgRect.setAttribute('stroke', '#38bdf8');
          this.bgRect.setAttribute('stroke-width', '1.5');
        } else if (this._border) {
          this.bgRect.setAttribute('stroke', this._borderColor || '#94a3b8');
          this.bgRect.setAttribute('stroke-width', '1');
        } else {
          this.bgRect.setAttribute('stroke', 'none');
          this.bgRect.setAttribute('stroke-width', '0');
        }
      }
    }

    _setFocused(focused) {
      this._focused = Boolean(focused);
      this._renderTextDisplay();
    }

    handleKeyInput(kc, keyStr, shiftKey) {
      if (!this._editable || !this._visible) return false;
      if (kc === 9) {
        if (this._vm && typeof this._vm._cycleEditableTextFocus === 'function') {
          this._vm._cycleEditableTextFocus(shiftKey ? -1 : 1);
        }
        return true;
      }
      let next = this._text;
      if (kc === 8) {
        next = next.slice(0, -1);
      } else if (kc === 27) {
        if (this._vm._global && this._vm._global.Selection) {
          this._vm._global.Selection.setFocus(null);
        }
        return true;
      } else if (kc === 13) {
        if (this._multiline) next += '\n';
      } else {
        let ch = (typeof keyStr === 'string' && keyStr.length === 1) ? keyStr : '';
        if (!ch) {
          if (kc >= 96 && kc <= 105) ch = String(kc - 96);
          else if (kc === 106) ch = '*';
          else if (kc === 107) ch = '+';
          else if (kc === 109) ch = '-';
          else if (kc === 110) ch = '.';
          else if (kc === 111) ch = '/';
        }
        if (!ch) return false;
        if (!this._isCharAllowedByRestrict(ch)) return true;
        if (this._maxChars > 0 && next.length >= this._maxChars) return true;
        next += ch;
      }
      if (next !== this._text) {
        this.text = next;
        if (this._variable && this._parent) {
          this._vm._setVariable(this._variable, next, this._parent, [], []);
        }
        if (typeof this.onChanged === 'function') {
          this._vm._invokeValue(this.onChanged, this, [this]);
        }
      }
      return true;
    }

    get type() { return this._editable ? 'input' : 'dynamic'; }
    set type(v) { this._editable = String(v || '').toLowerCase() === 'input'; }

    get password() { return this._password; }
    set password(v) { this._password = Boolean(v); this._renderTextDisplay(); }

    get maxChars() { return this._maxChars || null; }
    set maxChars(v) { this._maxChars = Math.max(0, Number(v) | 0); }

    get restrict() { return this._restrict; }
    set restrict(v) { this._restrict = (v === null || v === undefined) ? null : String(v); }

    get textColor() {
      if (this._textColor !== null) return this._textColor;
      const hex = String(this.def.col || '#ffffff').replace('#', '');
      const parsed = parseInt(hex, 16);
      return Number.isNaN(parsed) ? 0xffffff : parsed;
    }
    set textColor(v) {
      const rgb = (toAvm1Number(v) & 0xffffff) >>> 0;
      this._textColor = rgb;
      const hex = '#' + rgb.toString(16).padStart(6, '0');
      this.textEl.setAttribute('fill', hex);
      if (this.caretEl) this.caretEl.setAttribute('stroke', hex);
    }

    get background() { return this._background; }
    set background(v) {
      this._background = Boolean(v);
      if (this._background) this._ensureBgRect();
      this._renderTextDisplay();
    }

    get backgroundColor() {
      if (!this._backgroundColor) return 0xffffff;
      return parseInt(this._backgroundColor.replace('#', ''), 16) || 0xffffff;
    }
    set backgroundColor(v) {
      const rgb = (toAvm1Number(v) & 0xffffff) >>> 0;
      this._backgroundColor = '#' + rgb.toString(16).padStart(6, '0');
      this._ensureBgRect();
      this._renderTextDisplay();
    }

    get border() { return this._border; }
    set border(v) {
      this._border = Boolean(v);
      if (this._border) this._ensureBgRect();
      this._renderTextDisplay();
    }

    get borderColor() {
      if (!this._borderColor) return 0x000000;
      return parseInt(this._borderColor.replace('#', ''), 16) || 0x000000;
    }
    set borderColor(v) {
      const rgb = (toAvm1Number(v) & 0xffffff) >>> 0;
      this._borderColor = '#' + rgb.toString(16).padStart(6, '0');
      this._ensureBgRect();
      this._renderTextDisplay();
    }

    get text() { return this._text; }
    set text(v) {
      let s = v == null ? '' : String(v);
      if (this._maxChars > 0 && s.length > this._maxChars) {
        s = s.slice(0, this._maxChars);
      }
      this._text = s;
      this._renderTextDisplay();
    }

    get htmlText() { return this._text; }
    set htmlText(v) {
      let plain = String(v == null ? '' : v);
      let prev;
      do {
        prev = plain;
        plain = plain.replace(/<[^>]*>/g, '');
      } while (plain !== prev);
      this.text = plain.replace(/[<>]/g, '');
    }

    get variable() { return this._variable; }
    set variable(v) { this._variable = String(v || ''); }

    get _width() { return this.def.w || 80; }
    get _height() { return this.def.h || 20; }

    syncVariableFromScope() {
      if (!this._variable || !this._parent || this._focused) return;
      const exists = this._vm._hasVariablePath(this._variable, this._parent);
      if (!exists) {
        // Preserve static DefineEditText initialText until the bound variable exists,
        // while ensuring undefined/empty dynamic bindings format as "" (never "undefined").
        if (this._hadBoundVarSync || !this._text) {
          if (this._text !== '') {
            this._text = '';
            this._renderTextDisplay();
          }
        }
        return;
      }
      this._hadBoundVarSync = true;
      const val = this._vm._resolveVariablePath(this._variable, this._parent);
      const s = (val === undefined || val === null) ? '' : String(val);
      if (this._text !== s) {
        this._text = s;
        this._renderTextDisplay();
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

    destroy() {
      if (this._vm._focusedTarget === this) {
        this._vm._focusedTarget = null;
      }
      if (this.bgRect && this._onFocusClick) {
        this.bgRect.removeEventListener('pointerdown', this._onFocusClick);
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
      this._hitGroup.setAttribute('data-avm1-hit', '1');

      this._localBBox = { x: 0, y: 0, w: 0, h: 0 };
      this._worldBBoxBuf = { x: 0, y: 0, w: 0, h: 0 };
      this._localMatBuf = new Float64Array(6);
      this._worldMatBuf = new Float64Array(6);

      const recs = (def.r || []).slice().sort((a, b) => a.d - b.d);
      let hasUp = false, hasOver = false, hasDown = false, hasHit = false;
      const buildRecEl = (rec) => {
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
      const accumulateBBox = (recList) => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < recList.length; i++) {
          const rec = recList[i];
          const bb = vm._getStaticCharBBox(rec.c);
          if (!bb || (bb[2] <= 0 && bb[3] <= 0)) continue;
          const m = rec.m || IDENTITY_MAT;
          const rx = bb[0], ry = bb[1], rx2 = rx + bb[2], ry2 = ry + bb[3];
          const m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5];
          const xs = [m0 * rx + m2 * ry + m4, m0 * rx2 + m2 * ry + m4, m0 * rx + m2 * ry2 + m4, m0 * rx2 + m2 * ry2 + m4];
          const ys = [m1 * rx + m3 * ry + m5, m1 * rx2 + m3 * ry + m5, m1 * rx + m3 * ry2 + m5, m1 * rx2 + m3 * ry2 + m5];
          for (let k = 0; k < 4; k++) {
            if (xs[k] < minX) minX = xs[k];
            if (xs[k] > maxX) maxX = xs[k];
            if (ys[k] < minY) minY = ys[k];
            if (ys[k] > maxY) maxY = ys[k];
          }
        }
        if (Number.isFinite(minX)) {
          this._localBBox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        }
      };

      const upRecs = [];
      const hitRecs = [];
      for (let i = 0; i < recs.length; i++) {
        const rec = recs[i];
        if (rec.s & 0x01) { this._upGroup.appendChild(buildRecEl(rec)); hasUp = true; upRecs.push(rec); }
        if (rec.s & 0x02) { this._overGroup.appendChild(buildRecEl(rec)); hasOver = true; }
        if (rec.s & 0x04) { this._downGroup.appendChild(buildRecEl(rec)); hasDown = true; }
        if (rec.s & 0x08) { this._hitGroup.appendChild(buildRecEl(rec)); hasHit = true; hitRecs.push(rec); }
      }
      if (!hasHit) {
        const hitSrc = upRecs.length > 0 ? upRecs : (recs.length > 0 ? [recs[0]] : []);
        for (let i = 0; i < hitSrc.length; i++) {
          this._hitGroup.appendChild(buildRecEl(hitSrc[i]));
          hitRecs.push(hitSrc[i]);
        }
      }
      // Preserve invisible Hit-only Start buttons (!hasUp && hasHit): only fall back visually when neither Up nor Hit exists
      if (!hasUp && !hasHit && recs.length > 0) {
        this._upGroup.appendChild(buildRecEl(recs[0]));
      }
      accumulateBBox(hitRecs.length > 0 ? hitRecs : (upRecs.length > 0 ? upRecs : recs));

      this._hasOver = hasOver;
      this._hasDown = hasDown;
      this._overGroup.setAttribute('display', 'none');
      this._downGroup.setAttribute('display', 'none');

      this.svgEl.appendChild(this._upGroup);
      if (hasOver) this.svgEl.appendChild(this._overGroup);
      if (hasDown) this.svgEl.appendChild(this._downGroup);
      this.svgEl.appendChild(this._hitGroup);

      this._isMouseOver = false;
      this._onEnter = () => {
        if (!this.enabled || this._removed) return;
        this._vm._beginEventBudget();
        this._isMouseOver = true;
        if (this._vm._pressedInteractive === this && this._vm._mouseDown) {
          this._setState('down');
          this._fireCondition(BTN_OUT_DOWN_TO_OVER_DOWN);
          const fn = this._getEventHandler('onDragOver');
          if (typeof fn === 'function') this._vm._invokeValue(fn, this, []);
        } else {
          this._setState('over');
          this._fireCondition(BTN_IDLE_TO_OVER_UP);
          const fn = this._getEventHandler('onRollOver');
          if (typeof fn === 'function') this._vm._invokeValue(fn, this, []);
        }
      };
      this._onLeave = () => {
        if (!this.enabled || this._removed) return;
        this._vm._beginEventBudget();
        this._isMouseOver = false;
        const wasPressed = this._vm._pressedInteractive === this && this._vm._mouseDown;
        this._setState('up');
        if (wasPressed) {
          this._fireCondition(BTN_OVER_DOWN_TO_OUT_DOWN);
          const fn = this._getEventHandler('onDragOut');
          if (typeof fn === 'function') this._vm._invokeValue(fn, this, []);
        } else {
          this._fireCondition(BTN_OVER_UP_TO_IDLE);
          const fn = this._getEventHandler('onRollOut');
          if (typeof fn === 'function') this._vm._invokeValue(fn, this, []);
        }
      };
      this._onDown = (e) => {
        if (!this.enabled || this._removed) return;
        if (e && typeof e.clientX === 'number') {
          const pt = this._vm._clientToStage(e.clientX, e.clientY);
          this._vm._mouseX = pt.x;
          this._vm._mouseY = pt.y;
        }
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        this._vm._beginEventBudget();
        this._isMouseOver = true;
        this._vm._pressedInteractive = this;
        this._setState('down');
        this._fireCondition(BTN_OVER_UP_TO_OVER_DOWN | BTN_IDLE_TO_OVER_DOWN);
        const fn = this._getEventHandler('onPress');
        if (typeof fn === 'function') this._vm._invokeValue(fn, this, []);
        this._vm._postInteractionCommit(prevFrame, prevPlaying);
      };
      this._onUp = (e) => {
        if (!this.enabled || this._removed) return;
        if (e && typeof e.clientX === 'number') {
          const pt = this._vm._clientToStage(e.clientX, e.clientY);
          this._vm._mouseX = pt.x;
          this._vm._mouseY = pt.y;
        }
        const wasPressed = this._vm._pressedInteractive === this || this._state === 'down';
        if (this._vm._pressedInteractive === this) this._vm._pressedInteractive = null;
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        this._vm._beginEventBudget();
        this._setState('over');
        if (wasPressed) {
          this._fireCondition(BTN_OVER_DOWN_TO_OVER_UP);
          const fn = this._getEventHandler('onRelease');
          if (typeof fn === 'function') this._vm._invokeValue(fn, this, []);
          this._vm._postInteractionCommit(prevFrame, prevPlaying);
        }
      };
      this._fireReleaseFromStage = () => {
        if (!this.enabled || this._removed) return;
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        this._setState(this._isMouseOver ? 'over' : 'up');
        this._fireCondition(BTN_OVER_DOWN_TO_OVER_UP);
        const fn = this._getEventHandler('onRelease');
        if (typeof fn === 'function') this._vm._invokeValue(fn, this, []);
        this._vm._postInteractionCommit(prevFrame, prevPlaying);
      };
      this._fireReleaseOutside = () => {
        if (!this.enabled || this._removed) return;
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        this._setState('up');
        this._fireCondition(BTN_OUT_DOWN_TO_IDLE);
        const fn = this._getEventHandler('onReleaseOutside');
        if (typeof fn === 'function') {
          this._vm._invokeValue(fn, this, []);
        }
        this._vm._postInteractionCommit(prevFrame, prevPlaying);
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

    _getEventHandler(name) {
      if (typeof this[name] === 'function') return this[name];
      if (this._vm && this._vm.caseInsensitive) {
        const nl = name.toLowerCase();
        const keys = Object.keys(this);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].toLowerCase() === nl && typeof this[keys[i]] === 'function') {
            return this[keys[i]];
          }
        }
      }
      return undefined;
    }

    getLocalMatrix() {
      if (this._scriptModifiedTransform) {
        composeMatInto(this._localMatBuf, this._x, this._y, this._xscale, this._yscale, this._rotation);
        return this._localMatBuf;
      }
      return this._rawMatrix || IDENTITY_MAT;
    }

    getWorldMatrix() {
      const local = this.getLocalMatrix();
      if (!this._parent) return local;
      return mulMatInto(this._worldMatBuf, this._parent.getWorldMatrix(), local);
    }

    getLocalBBox() {
      return this._localBBox;
    }

    getWorldBBox() {
      const bb = this._localBBox;
      const wm = this.getWorldMatrix();
      const out = this._worldBBoxBuf;
      if (!bb || (bb.w <= 0 && bb.h <= 0)) {
        out.x = wm[4]; out.y = wm[5]; out.w = 0; out.h = 0;
        return out;
      }
      const bx = bb.x, by = bb.y, bx2 = bx + bb.w, by2 = by + bb.h;
      const m0 = wm[0], m1 = wm[1], m2 = wm[2], m3 = wm[3], m4 = wm[4], m5 = wm[5];
      const x1 = m0 * bx + m2 * by + m4, y1 = m1 * bx + m3 * by + m5;
      const x2 = m0 * bx2 + m2 * by + m4, y2 = m1 * bx2 + m3 * by + m5;
      const x3 = m0 * bx + m2 * by2 + m4, y3 = m1 * bx + m3 * by2 + m5;
      const x4 = m0 * bx2 + m2 * by2 + m4, y4 = m1 * bx2 + m3 * by2 + m5;
      let minX = x1, maxX = x1, minY = y1, maxY = y1;
      if (x2 < minX) minX = x2; if (x2 > maxX) maxX = x2;
      if (x3 < minX) minX = x3; if (x3 > maxX) maxX = x3;
      if (x4 < minX) minX = x4; if (x4 > maxX) maxX = x4;
      if (y2 < minY) minY = y2; if (y2 > maxY) maxY = y2;
      if (y3 < minY) minY = y3; if (y3 > maxY) maxY = y3;
      if (y4 < minY) minY = y4; if (y4 > maxY) maxY = y4;
      out.x = minX; out.y = minY; out.w = maxX - minX; out.h = maxY - minY;
      return out;
    }

    _containsStagePoint(sx, sy) {
      const wb = this.getWorldBBox();
      if (wb.w <= 0 && wb.h <= 0) return false;
      return sx >= wb.x && sx <= wb.x + wb.w && sy >= wb.y && sy <= wb.y + wb.h;
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
      const visKey = `${this._visible ? '1' : '0'}:${this.enabled ? '1' : '0'}`;
      if (visKey !== this._lastVis) {
        this._lastVis = visKey;
        this.svgEl.setAttribute('visibility', this._visible ? 'visible' : 'hidden');
        this.svgEl.setAttribute('pointer-events', (this._visible && this.enabled) ? 'auto' : 'none');
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
      this._childrenSnapshot = EMPTY_ARR;
      this._childrenDirty = false;
      this._localMatBuf = new Float64Array(6);
      this._worldMatBuf = new Float64Array(6);
      this._localBBoxBuf = { x: 0, y: 0, w: 0, h: 0 };
      this._worldBBoxBuf = { x: 0, y: 0, w: 0, h: 0 };
      this._lmValid = false;
      this._lmX = NaN;
      this._lmY = NaN;
      this._lmXS = NaN;
      this._lmYS = NaN;
      this._lmR = NaN;
      this._cm0 = NaN; this._cm1 = NaN; this._cm2 = NaN;
      this._cm3 = NaN; this._cm4 = NaN; this._cm5 = NaN;
      this._removed = false;
      this._droptarget = '';
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
      if (this._clipActions.some((ca) => (ca.f & (CE_PRESS | CE_RELEASE | CE_RELEASE_OUTSIDE | CE_ROLL_OVER | CE_ROLL_OUT | CE_DRAG_OUT | CE_DRAG_OVER)) !== 0)) {
        this._ensurePointerListeners();
      }
    }

    _getEventHandler(name) {
      const ci = Boolean(this._vm && this._vm.caseInsensitive);
      const nl = ci ? name.toLowerCase() : null;
      const lookup = (obj) => {
        if (!obj) return undefined;
        if (typeof obj[name] === 'function') return obj[name];
        if (ci) {
          for (const k in obj) {
            if (k.toLowerCase() === nl && typeof obj[k] === 'function') return obj[k];
          }
        }
        return undefined;
      };
      return lookup(this._vars) || lookup(this._proto) || lookup(this._vm && this._vm._mcProto);
    }

    _hasInteractiveHandler() {
      if (this._clipActions && this._clipActions.some((ca) => (ca.f & (CE_PRESS | CE_RELEASE | CE_RELEASE_OUTSIDE | CE_ROLL_OVER | CE_ROLL_OUT | CE_DRAG_OUT | CE_DRAG_OVER)) !== 0)) {
        return true;
      }
      return Boolean(
        this._getEventHandler('onPress') ||
        this._getEventHandler('onRelease') ||
        this._getEventHandler('onReleaseOutside') ||
        this._getEventHandler('onRollOver') ||
        this._getEventHandler('onRollOut') ||
        this._getEventHandler('onDragOver') ||
        this._getEventHandler('onDragOut')
      );
    }

    _syncPointerEvents() {
      const isHiddenMask = Boolean(this._maskTargetClip);
      if (!this._visible || isHiddenMask) {
        this.svgEl.setAttribute('pointer-events', 'none');
        this.svgEl.style.cursor = '';
      } else if (this._pointerBound && this.enabled) {
        this.svgEl.setAttribute('pointer-events', 'all');
        this.svgEl.style.cursor = this.useHandCursor ? 'pointer' : '';
      } else if (!this._parent) {
        // #avm1-root defaults to pointer-events="none" so non-interactive overlays never block Start buttons underneath
        this.svgEl.setAttribute('pointer-events', 'none');
        this.svgEl.style.cursor = '';
      } else {
        this.svgEl.removeAttribute('pointer-events');
        this.svgEl.style.cursor = '';
      }
    }

    _containsStagePoint(sx, sy) {
      const wb = this.getWorldBBox();
      if (wb.w <= 0 && wb.h <= 0) return false;
      return sx >= wb.x && sx <= wb.x + wb.w && sy >= wb.y && sy <= wb.y + wb.h;
    }

    _ensurePointerListeners() {
      if (this._pointerBound) {
        this._syncPointerEvents();
        return;
      }
      this._pointerBound = true;
      this._syncPointerEvents();
      this._onPtrDown = (e) => {
        if (!this.enabled || !this._visible || this._removed) return;
        if (this._vm._pressedInteractive && this._vm._pressedInteractive !== this) return;
        if (e && typeof e.clientX === 'number') {
          const pt = this._vm._clientToStage(e.clientX, e.clientY);
          this._vm._mouseX = pt.x;
          this._vm._mouseY = pt.y;
        }
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        this._vm._beginEventBudget();
        this._isMouseOver = true;
        this._isMouseDown = true;
        this._vm._pressedInteractive = this;
        const fn = this._getEventHandler('onPress');
        if (typeof fn === 'function') {
          this._vm._invokeValue(fn, this, []);
        }
        this._fireClipEvents(CE_PRESS);
        this._vm._postInteractionCommit(prevFrame, prevPlaying);
      };
      this._onPtrUp = (e) => {
        if (!this.enabled || !this._visible || this._removed) return;
        if (this._vm._pressedInteractive && this._vm._pressedInteractive !== this) return;
        if (e && typeof e.clientX === 'number') {
          const pt = this._vm._clientToStage(e.clientX, e.clientY);
          this._vm._mouseX = pt.x;
          this._vm._mouseY = pt.y;
        }
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        this._vm._beginEventBudget();
        const wasDown = this._isMouseDown || this._vm._pressedInteractive === this;
        this._isMouseDown = false;
        if (this._vm._pressedInteractive === this) this._vm._pressedInteractive = null;
        if (wasDown) {
          const fn = this._getEventHandler('onRelease');
          if (typeof fn === 'function') {
            this._vm._invokeValue(fn, this, []);
          }
          this._fireClipEvents(CE_RELEASE);
          this._vm._postInteractionCommit(prevFrame, prevPlaying);
        }
      };
      this._fireReleaseFromStage = () => {
        this._isMouseDown = false;
        if (!this.enabled || !this._visible || this._removed) return;
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        const fn = this._getEventHandler('onRelease');
        if (typeof fn === 'function') {
          this._vm._invokeValue(fn, this, []);
        }
        this._fireClipEvents(CE_RELEASE);
        this._vm._postInteractionCommit(prevFrame, prevPlaying);
      };
      this._onPtrEnter = () => {
        if (!this.enabled || !this._visible || this._removed) return;
        this._vm._beginEventBudget();
        this._isMouseOver = true;
        if (this._vm._pressedInteractive === this && this._vm._mouseDown) {
          const fn = this._getEventHandler('onDragOver');
          if (typeof fn === 'function') {
            this._vm._invokeValue(fn, this, []);
          }
          this._fireClipEvents(CE_DRAG_OVER);
        } else {
          const fn = this._getEventHandler('onRollOver');
          if (typeof fn === 'function') {
            this._vm._invokeValue(fn, this, []);
          }
          this._fireClipEvents(CE_ROLL_OVER);
        }
      };
      this._onPtrLeave = () => {
        if (!this.enabled || this._removed) return;
        this._vm._beginEventBudget();
        this._isMouseOver = false;
        if (this._vm._pressedInteractive === this && this._vm._mouseDown) {
          const fn = this._getEventHandler('onDragOut');
          if (typeof fn === 'function') {
            this._vm._invokeValue(fn, this, []);
          }
          this._fireClipEvents(CE_DRAG_OUT);
        } else {
          const fn = this._getEventHandler('onRollOut');
          if (typeof fn === 'function') {
            this._vm._invokeValue(fn, this, []);
          }
          this._fireClipEvents(CE_ROLL_OUT);
        }
      };
      this._fireReleaseOutside = () => {
        this._isMouseDown = false;
        if (!this.enabled || this._removed) return;
        const prevFrame = this._vm.rootClip ? this._vm.rootClip._currentframe : 1;
        const prevPlaying = this._vm.rootClip ? this._vm.rootClip._playing : false;
        const fn = this._getEventHandler('onReleaseOutside');
        if (typeof fn === 'function') {
          this._vm._invokeValue(fn, this, []);
        }
        this._fireClipEvents(CE_RELEASE_OUTSIDE);
        this._vm._postInteractionCommit(prevFrame, prevPlaying);
      };
      this.svgEl.addEventListener('pointerdown', this._onPtrDown);
      this.svgEl.addEventListener('pointerup', this._onPtrUp);
      this.svgEl.addEventListener('pointerenter', this._onPtrEnter);
      this.svgEl.addEventListener('pointerleave', this._onPtrLeave);
    }

    _getChildrenSnapshot() {
      if (!this._childrenDirty) return this._childrenSnapshot;
      this._childrenDirty = false;
      if (this._childrenByDepth.size === 0) {
        this._childrenSnapshot = EMPTY_ARR;
      } else {
        this._childrenSnapshot = Array.from(this._childrenByDepth.values());
      }
      return this._childrenSnapshot;
    }

    getLocalMatrix() {
      if (this._scriptModifiedTransform) {
        if (
          !this._lmValid ||
          this._lmX !== this._x ||
          this._lmY !== this._y ||
          this._lmXS !== this._xscale ||
          this._lmYS !== this._yscale ||
          this._lmR !== this._rotation
        ) {
          this._lmX = this._x;
          this._lmY = this._y;
          this._lmXS = this._xscale;
          this._lmYS = this._yscale;
          this._lmR = this._rotation;
          this._lmValid = true;
          composeMatInto(this._localMatBuf, this._x, this._y, this._xscale, this._yscale, this._rotation);
        }
        return this._localMatBuf;
      }
      return this._rawMatrix || IDENTITY_MAT;
    }

    getWorldMatrix() {
      const local = this.getLocalMatrix();
      if (!this._parent) return local;
      return mulMatInto(this._worldMatBuf, this._parent.getWorldMatrix(), local);
    }

    getLocalBBox(depth = 0, includeHidden = false) {
      const out = this._localBBoxBuf;
      if (depth > 24) {
        out.x = 0; out.y = 0; out.w = 0; out.h = 0;
        return out;
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const kids = this._getChildrenSnapshot();
      for (let i = 0; i < kids.length; i++) {
        const slot = kids[i];
        if (slot.clipDepth) continue;
        const obj = slot.obj;
        let rx, ry, rw, rh, m;
        if (obj && obj._isMovieClip) {
          if (!includeHidden && !obj._visible) continue;
          const bb = obj.getLocalBBox(depth + 1, includeHidden);
          if (bb.w <= 0 && bb.h <= 0) continue;
          rx = bb.x; ry = bb.y; rw = bb.w; rh = bb.h;
          m = obj.getLocalMatrix();
        } else if (obj && obj._isButton) {
          if (!includeHidden && !obj._visible) continue;
          const bb = obj.getLocalBBox();
          if (!bb || (bb.w <= 0 && bb.h <= 0)) continue;
          rx = bb.x; ry = bb.y; rw = bb.w; rh = bb.h;
          m = obj.getLocalMatrix();
        } else if (obj && obj._isTextField) {
          rx = obj.def.x; ry = obj.def.y; rw = obj.def.w; rh = obj.def.h;
          if (rw <= 0 && rh <= 0) continue;
          m = obj._rawMatrix || IDENTITY_MAT;
        } else if (slot.bbox) {
          rx = slot.bbox[0]; ry = slot.bbox[1]; rw = slot.bbox[2]; rh = slot.bbox[3];
          if (rw <= 0 && rh <= 0) continue;
          m = slot.matrix || IDENTITY_MAT;
        } else {
          continue;
        }
        const m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5];
        const rx2 = rx + rw, ry2 = ry + rh;
        const x1 = m0 * rx + m2 * ry + m4, y1 = m1 * rx + m3 * ry + m5;
        const x2 = m0 * rx2 + m2 * ry + m4, y2 = m1 * rx2 + m3 * ry + m5;
        const x3 = m0 * rx + m2 * ry2 + m4, y3 = m1 * rx + m3 * ry2 + m5;
        const x4 = m0 * rx2 + m2 * ry2 + m4, y4 = m1 * rx2 + m3 * ry2 + m5;
        if (x1 < minX) minX = x1; if (x1 > maxX) maxX = x1;
        if (x2 < minX) minX = x2; if (x2 > maxX) maxX = x2;
        if (x3 < minX) minX = x3; if (x3 > maxX) maxX = x3;
        if (x4 < minX) minX = x4; if (x4 > maxX) maxX = x4;
        if (y1 < minY) minY = y1; if (y1 > maxY) maxY = y1;
        if (y2 < minY) minY = y2; if (y2 > maxY) maxY = y2;
        if (y3 < minY) minY = y3; if (y3 > maxY) maxY = y3;
        if (y4 < minY) minY = y4; if (y4 > maxY) maxY = y4;
      }

      if (this._drawBBox) {
        const db = this._drawBBox;
        if (db.w > 0 || db.h > 0) {
          const x1 = db.x, y1 = db.y, x2 = db.x + db.w, y2 = db.y + db.h;
          if (x1 < minX) minX = x1; if (x2 > maxX) maxX = x2;
          if (y1 < minY) minY = y1; if (y2 > maxY) maxY = y2;
        }
      }

      if (!Number.isFinite(minX)) {
        out.x = 0; out.y = 0; out.w = 0; out.h = 0;
        return out;
      }
      out.x = minX; out.y = minY; out.w = maxX - minX; out.h = maxY - minY;
      return out;
    }

    getWorldBBox(includeHidden = false) {
      const bb = this.getLocalBBox(0, includeHidden);
      const bx = bb.x, by = bb.y, bw = bb.w, bh = bb.h;
      const wm = this.getWorldMatrix();
      const out = this._worldBBoxBuf;
      if (bw <= 0 && bh <= 0) {
        out.x = wm[4]; out.y = wm[5]; out.w = 0; out.h = 0;
        return out;
      }
      const m0 = wm[0], m1 = wm[1], m2 = wm[2], m3 = wm[3], m4 = wm[4], m5 = wm[5];
      const bx2 = bx + bw, by2 = by + bh;
      const x1 = m0 * bx + m2 * by + m4, y1 = m1 * bx + m3 * by + m5;
      const x2 = m0 * bx2 + m2 * by + m4, y2 = m1 * bx2 + m3 * by + m5;
      const x3 = m0 * bx + m2 * by2 + m4, y3 = m1 * bx + m3 * by2 + m5;
      const x4 = m0 * bx2 + m2 * by2 + m4, y4 = m1 * bx2 + m3 * by2 + m5;
      let minX = x1, maxX = x1, minY = y1, maxY = y1;
      if (x2 < minX) minX = x2; if (x2 > maxX) maxX = x2;
      if (x3 < minX) minX = x3; if (x3 > maxX) maxX = x3;
      if (x4 < minX) minX = x4; if (x4 > maxX) maxX = x4;
      if (y2 < minY) minY = y2; if (y2 > maxY) maxY = y2;
      if (y3 < minY) minY = y3; if (y3 > maxY) maxY = y3;
      if (y4 < minY) minY = y4; if (y4 > maxY) maxY = y4;
      out.x = minX; out.y = minY; out.w = maxX - minX; out.h = maxY - minY;
      return out;
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
      const dbgT0 = this._vm && this._vm._dbgActiveThisTick ? _nowMs() : 0;
      const mat = this.getLocalMatrix();
      if (
        mat[0] !== this._cm0 || mat[1] !== this._cm1 || mat[2] !== this._cm2 ||
        mat[3] !== this._cm3 || mat[4] !== this._cm4 || mat[5] !== this._cm5
      ) {
        this._cm0 = mat[0]; this._cm1 = mat[1]; this._cm2 = mat[2];
        this._cm3 = mat[3]; this._cm4 = mat[4]; this._cm5 = mat[5];
        const tStr = `matrix(${fmtNum(mat[0])} ${fmtNum(mat[1])} ${fmtNum(mat[2])} ${fmtNum(mat[3])} ${fmtNum(mat[4])} ${fmtNum(mat[5])})`;
        if (tStr !== this._lastTransform) {
          this._lastTransform = tStr;
          this.svgEl.setAttribute('transform', tStr);
        }
      }
      const alphaClamped = this._alpha <= 0 ? 0 : (this._alpha >= 100 ? 1 : this._alpha / 100);
      if (alphaClamped !== this._lastAlphaNum) {
        this._lastAlphaNum = alphaClamped;
        const op = fmtNum(alphaClamped);
        if (op !== this._lastOpacity) {
          this._lastOpacity = op;
          this.svgEl.setAttribute('opacity', op);
        }
      }
      const isHiddenMask = Boolean(this._maskTargetClip);
      const visKey = `${(this._visible && !isHiddenMask) ? '1' : '0'}:${this._pointerBound ? '1' : '0'}:${this.enabled ? '1' : '0'}`;
      if (visKey !== this._lastVis) {
        this._lastVis = visKey;
        this.svgEl.setAttribute('visibility', (this._visible && !isHiddenMask) ? 'visible' : 'hidden');
        this.svgEl.setAttribute('display', (this._visible && !isHiddenMask) ? 'inline' : 'none');
        this._syncPointerEvents();
      }
      if (this._maskTargetClip && !this._maskTargetClip._removed) {
        this._maskTargetClip._syncDynamicMask();
      }
      if (this._maskClip && !this._maskClip._removed) {
        this._syncDynamicMask();
      }
      if (dbgT0) {
        this._vm._tickSvgRenderMs += _nowMs() - dbgT0;
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
      const dbgT0 = this._vm && this._vm._dbgActiveThisTick ? _nowMs() : 0;
      const frozenDepths = this._staticFrozenDepths;
      const rPool = this._vm._reconcilePool;
      const rf = rPool && rPool.length > 0
        ? rPool.pop()
        : { wantedByDepth: new Map(), toRemove: [], activeMasks: [], newlySpawnedClips: [] };
      const { wantedByDepth, toRemove, activeMasks, newlySpawnedClips } = rf;
      try {
      for (let i = 0; i < entries.length; i++) {
        if (frozenDepths && frozenDepths.has(entries[i].d)) continue;
        wantedByDepth.set(entries[i].d, entries[i]);
      }

      // 1. Remove timeline children no longer present on this frame (or replaced by a different charId)
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

      // 3. Create or update entries in ascending depth order (skipping frozen static layer depths)
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const depth = e.d;
        if (frozenDepths && frozenDepths.has(depth)) continue;

        // ClipDepth mask layer -> register SVG <clipPath> in stage <defs>
        if (e.cd && e.cd > depth) {
          let slot = this._childrenByDepth.get(depth);
          if (!slot) {
            const maskId = `avm1-mask-${++this._vm._maskCounter}`;
            const cp = createSvgEl(this._vm.doc, 'clipPath');
            cp.setAttribute('id', maskId);
            cp.setAttribute('data-swf-vm-def', '1');
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
            this._childrenDirty = true;
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
        if (slot && slot.isDynamic) continue; // Never clobber dynamic script-owned clip
        if (!slot) {
          if (this._clipDepth > 0 && this._vm._isOverBudget()) break;
          const resolvedCa = this._vm._resolveClipActions(e);
          slot = this._createSlot(depth, e.c, e.m || null, e.a !== undefined ? e.a : 1, e.n || '', resolvedCa, false, maskId);
          if (slot) {
            childrenMutated = true;
            if (e.cx || e.fl) {
              this._vm._applyVisualFx(slot.svgEl, e.cx || null, e.fl || null);
            }
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
          // Apply RGB ColorTransform & Flash 8+ SVG filters (unless script Color override is active)
          if (slot.svgEl && !(slot.obj && slot.obj._scriptColorTransform)) {
            this._vm._applyVisualFx(slot.svgEl, e.cx || null, e.fl || null);
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
      if (dbgT0) {
        this._vm._tickSvgRenderMs += _nowMs() - dbgT0;
      }

      // Initialize newly spawned MovieClips (reconcile frame 1, fire DoInitAction, registered AS2 class, onClipEvent(load), onLoad, frame 1 DoAction)
      for (let i = 0; i < newlySpawnedClips.length; i++) {
        if (this._vm._isOverBudget()) break;
        const mc = newlySpawnedClips[i];
        if (mc._removed) continue;
        mc._justSpawned = false;
        this._vm._ensureSpriteInitAction(mc.charId, mc);
        this._vm._applyRegisteredClass(mc);
        mc.reconcileDisplayList(1, true);
        if (!this._vm._isOverBudget()) {
          mc._fireClipEvents(CE_LOAD);
          const loadFn = mc._getEventHandler('onLoad');
          if (!mc._removed && !this._vm._isOverBudget() && typeof loadFn === 'function') {
            this._vm._invokeValue(loadFn, mc, EMPTY_ARR);
          }
        }
        if (!mc._removed && !this._vm._isOverBudget() && mc._currentframe === 1) {
          mc.runFrameActions(1);
        }
      }
      } finally {
        wantedByDepth.clear();
        toRemove.length = 0;
        activeMasks.length = 0;
        newlySpawnedClips.length = 0;
        if (rPool && rPool.length < 32) rPool.push(rf);
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
      this._childrenDirty = true;
      this._vm._treeVersion++;
      const hostEl = this._dynamicLayerEl || this.svgEl;
      hostEl.appendChild(svgOuter);
      return slot;
    }

    _removeSlotAtDepth(depth) {
      const slot = this._childrenByDepth.get(depth);
      if (!slot) return;
      this._childrenByDepth.delete(depth);
      this._childrenDirty = true;
      this._vm._treeVersion++;
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
      const hostEl = this._dynamicLayerEl || this.svgEl;
      const sorted = this._vm._reorderScratch || [];
      sorted.length = 0;
      const kids = this._getChildrenSnapshot();
      for (let i = 0; i < kids.length; i++) {
        const s = kids[i];
        if (!s.clipDepth && s.svgOuter) sorted.push(s);
      }
      if (sorted.length > 1) sorted.sort((a, b) => a.depth - b.depth);
      let prev = null;
      for (let i = sorted.length - 1; i >= 0; i--) {
        const el = sorted[i].svgOuter;
        if (el.parentNode !== hostEl || el.nextSibling !== prev) {
          hostEl.insertBefore(el, prev);
        }
        prev = el;
      }
      sorted.length = 0;
    }

    runFrameActions(frameNum) {
      const sounds = this._def.sf || [];
      for (let i = 0; i < sounds.length; i++) {
        if (sounds[i].f === frameNum) {
          if (sounds[i].stop) {
            this._vm._stopSwfSound(sounds[i].id);
          } else {
            this._vm._playSwfSound(sounds[i].id, {
              loops: sounds[i].loops || 1,
              noMultiple: Boolean(sounds[i].noMult),
            });
          }
        }
      }
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
        const efFn = this._getEventHandler('onEnterFrame');
        if (!this._vm._isOverBudget() && typeof efFn === 'function') {
          this._vm._invokeValue(efFn, this, EMPTY_ARR);
          if (this._removed) return;
        }
      }

      // 3. Step live child MovieClips and sync DefineEditText fields (zero-GC cached snapshot)
      if (this._childrenByDepth.size > 0) {
        const snapshot = this._getChildrenSnapshot();
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
      const d = Math.floor(Number(depth) || 0) + AS_DEPTH_OFFSET;
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
        const loadFn = mc._getEventHandler('onLoad');
        if (!mc._removed && typeof loadFn === 'function') {
          this._vm._invokeValue(loadFn, mc, EMPTY_ARR);
        }
        if (!mc._removed && mc._currentframe === 1) {
          mc.runFrameActions(1);
        }
        mc.commitSvg();
      }
      return mc;
    }

    duplicateMovieClip(newName, depth, initObj) {
      if (!this._parent) return undefined;
      const d = Math.floor(Number(depth) || 0) + AS_DEPTH_OFFSET;
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
        this._vm._ensureSpriteInitAction(dup.charId, dup);
        this._vm._applyRegisteredClass(dup);
        dup.reconcileDisplayList(1);
        dup._fireClipEvents(CE_LOAD);
        const loadFn = dup._getEventHandler('onLoad');
        if (!dup._removed && typeof loadFn === 'function') {
          this._vm._invokeValue(loadFn, dup, EMPTY_ARR);
        }
        if (!dup._removed && dup._currentframe === 1) {
          dup.runFrameActions(1);
        }
        dup.commitSvg();
      }
      return dup;
    }

    createEmptyMovieClip(newName, depth) {
      const d = Math.floor(Number(depth) || 0) + AS_DEPTH_OFFSET;
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
      this._childrenDirty = true;
      this._vm._treeVersion++;
      const hostEl = this._dynamicLayerEl || this.svgEl;
      hostEl.appendChild(mc.svgEl);
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
        targetDepth = Math.floor(Number(targetOrDepth) || 0) + AS_DEPTH_OFFSET;
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
      parent._childrenDirty = true;
      parent._reorderSvgChildren();
    }

    getNextHighestDepth() {
      let maxAs = 0;
      this._childrenByDepth.forEach((_, d) => {
        const asD = d - AS_DEPTH_OFFSET;
        if (asD >= maxAs) maxAs = asD + 1;
      });
      return maxAs;
    }

    getDepth() {
      return this._depth - AS_DEPTH_OFFSET;
    }

    setMask(maskClip) {
      if (this._maskClip) {
        const prev = this._maskClip;
        this._maskClip = null;
        if (prev._maskTargetClip === this) {
          prev._maskTargetClip = null;
          prev._lastVis = '';
          prev.commitSvg();
        }
      }
      if (this._maskClipPathEl) {
        if (this._maskClipPathEl.parentNode) {
          this._maskClipPathEl.parentNode.removeChild(this._maskClipPathEl);
        }
        this._maskClipPathEl = null;
      }
      this._maskClipPathId = null;
      if (this.svgEl && this.svgEl.removeAttribute) {
        this.svgEl.removeAttribute('clip-path');
      }
      if (!maskClip || !maskClip._isMovieClip || maskClip === this || maskClip._removed) {
        return;
      }
      if (maskClip._maskTargetClip && maskClip._maskTargetClip !== this) {
        maskClip._maskTargetClip.setMask(null);
      }
      const maskId = `avm1-dyn-mask-${++this._vm._maskCounter}`;
      const cp = createSvgEl(this._vm.doc, 'clipPath');
      cp.setAttribute('id', maskId);
      cp.setAttribute('data-swf-vm-def', '1');
      if (this._vm.defsEl) this._vm.defsEl.appendChild(cp);
      this._maskClip = maskClip;
      this._maskClipPathId = maskId;
      this._maskClipPathEl = cp;
      maskClip._maskTargetClip = this;
      maskClip._lastVis = '';
      maskClip.commitSvg();
      this._syncDynamicMask();
    }

    _syncDynamicMask() {
      if (!this._maskClip || !this._maskClipPathEl || !this._maskClipPathId || !this.svgEl) return;
      const relMat = mulMat(invertMat(this.getWorldMatrix()), this._maskClip.getWorldMatrix());
      const relStr = `matrix(${fmtNum(relMat[0])} ${fmtNum(relMat[1])} ${fmtNum(relMat[2])} ${fmtNum(relMat[3])} ${fmtNum(relMat[4])} ${fmtNum(relMat[5])})`;
      if (this._maskClipPathEl.replaceChildren) {
        this._maskClipPathEl.replaceChildren();
      } else {
        while (this._maskClipPathEl.firstChild) this._maskClipPathEl.removeChild(this._maskClipPathEl.firstChild);
      }
      this._vm._populateClipPathFromElement(this._maskClipPathEl, this._maskClip.svgEl, relStr, true);
      this.svgEl.setAttribute('clip-path', `url(#${this._maskClipPathId})`);
    }

    hitTest(arg0, arg1, shapeFlag) {
      if (this._removed) return false;
      if (arg0 && arg0._isMovieClip) {
        if (arg0._removed) return false;
        const a = this.getWorldBBox(true);
        const b = arg0.getWorldBBox(true);
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
      const bb = this.getWorldBBox(true);
      if (bb.w === 0 && bb.h === 0) return false;
      const inBBox = px >= bb.x && px <= bb.x + bb.w && py >= bb.y && py <= bb.y + bb.h;
      if (!inBBox) return false;
      // Shape-accurate W3C SVG vector hit-test when shapeFlag is true in browser DOM (including <use> defs & hidden hit layers)
      if (shapeFlag && this._vm.stageSvg && typeof this._vm.stageSvg.createSVGPoint === 'function' && typeof this.svgEl.querySelectorAll === 'function') {
        try {
          const rootCtm = typeof this._vm.stageSvg.getScreenCTM === 'function' ? this._vm.stageSvg.getScreenCTM() : null;
          const screenPt = rootCtm ? (() => {
            const p = this._vm.stageSvg.createSVGPoint();
            p.x = px;
            p.y = py;
            return p.matrixTransform(rootCtm);
          })() : null;
          const invThisWorld = invertMat(this.getWorldMatrix());
          const fallbackLocal = this._vm.stageSvg.createSVGPoint();
          fallbackLocal.x = invThisWorld[0] * px + invThisWorld[2] * py + invThisWorld[4];
          fallbackLocal.y = invThisWorld[1] * px + invThisWorld[3] * py + invThisWorld[5];

          const testGeom = (geomEl, localPt) => {
            if (!geomEl || typeof geomEl.isPointInFill !== 'function') return false;
            const fillAttr = typeof geomEl.getAttribute === 'function' ? geomEl.getAttribute('fill') : null;
            const strokeAttr = typeof geomEl.getAttribute === 'function' ? geomEl.getAttribute('stroke') : null;
            const hasFill = fillAttr !== 'none';
            const hasStroke = Boolean(strokeAttr && strokeAttr !== 'none');
            if (hasFill && geomEl.isPointInFill(localPt)) return true;
            if (hasStroke && typeof geomEl.isPointInStroke === 'function' && geomEl.isPointInStroke(localPt)) return true;
            return false;
          };

          const shapes = this.svgEl.querySelectorAll('path, circle, ellipse, rect, polygon, use');
          if (shapes && shapes.length > 0) {
            let testedAny = false;
            for (let i = 0; i < shapes.length; i++) {
              const s = shapes[i];
              const tag = (s.nodeName || s.tagName || '').toLowerCase();
              let localPt = null;
              if (screenPt && typeof s.getScreenCTM === 'function') {
                const sCtm = s.getScreenCTM();
                if (sCtm) localPt = screenPt.matrixTransform(sCtm.inverse());
              }
              if (!localPt) localPt = fallbackLocal;
              if (tag === 'use') {
                const defG = this._vm._resolveShapeUseTarget(s);
                if (defG) {
                  const subShapes = typeof defG.querySelectorAll === 'function'
                    ? defG.querySelectorAll('path, circle, ellipse, rect, polygon')
                    : (defG.children || []);
                  for (let j = 0; j < subShapes.length; j++) {
                    testedAny = true;
                    if (testGeom(subShapes[j], localPt)) return true;
                  }
                }
              } else {
                testedAny = true;
                if (testGeom(s, localPt)) return true;
              }
            }
            if (testedAny) return false;
          }
        } catch (_) {}
      }
      return true;
    }

    getBounds(targetSpace) {
      const bb = this.getWorldBBox();
      const x1 = bb.x, y1 = bb.y, x2 = bb.x + bb.w, y2 = bb.y + bb.h;
      if (!targetSpace || !targetSpace._isMovieClip || targetSpace === this._vm.rootClip) {
        return { xMin: x1, xMax: x2, yMin: y1, yMax: y2 };
      }
      const inv = invertMatInto(_invMatScratch, targetSpace.getWorldMatrix());
      const px1 = inv[0] * x1 + inv[2] * y1 + inv[4];
      const py1 = inv[1] * x1 + inv[3] * y1 + inv[5];
      const px2 = inv[0] * x2 + inv[2] * y2 + inv[4];
      const py2 = inv[1] * x2 + inv[3] * y2 + inv[5];
      return {
        xMin: px1 < px2 ? px1 : px2,
        xMax: px1 > px2 ? px1 : px2,
        yMin: py1 < py2 ? py1 : py2,
        yMax: py1 > py2 ? py1 : py2,
      };
    }

    localToGlobal(pt) {
      if (!pt || typeof pt !== 'object') return;
      const m = this.getWorldMatrix();
      const x = Number(pt.x) || 0;
      const y = Number(pt.y) || 0;
      pt.x = m[0] * x + m[2] * y + m[4];
      pt.y = m[1] * x + m[3] * y + m[5];
    }

    globalToLocal(pt) {
      if (!pt || typeof pt !== 'object') return;
      const inv = invertMatInto(_invMatScratch, this.getWorldMatrix());
      const x = Number(pt.x) || 0;
      const y = Number(pt.y) || 0;
      pt.x = inv[0] * x + inv[2] * y + inv[4];
      pt.y = inv[1] * x + inv[3] * y + inv[5];
    }

    // --- Flash Drawing API -> Pure W3C SVG <path> ---
    _ensureDrawLayer() {
      if (!this._drawGroup) {
        this._drawGroup = createSvgEl(this._vm.doc, 'g');
        this._drawGroup.setAttribute('data-avm1-draw', '1');
        const hostEl = this._dynamicLayerEl || this.svgEl;
        hostEl.appendChild(this._drawGroup);
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
        try { this._vm._invokeValue(this._vars.onUnload, this, EMPTY_ARR); } catch (_) {}
      }
      if (this._pointerBound) {
        this.svgEl.removeEventListener('pointerdown', this._onPtrDown);
        this.svgEl.removeEventListener('pointerup', this._onPtrUp);
        this.svgEl.removeEventListener('pointerenter', this._onPtrEnter);
        this.svgEl.removeEventListener('pointerleave', this._onPtrLeave);
      }
      if (this._vm._dragClip === this) this._vm._dragClip = null;
      const kids = this._getChildrenSnapshot();
      for (let i = 0; i < kids.length; i++) {
        this._removeSlotAtDepth(kids[i].depth);
      }
      this._childrenSnapshot = EMPTY_ARR;
      this._childrenDirty = false;
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
      this._shapeDefsMap = new Map();
      this._targetPathCache = new Map();
      this._treeVersion = 1;
      this._lastTelemetrySyncMs = 0;
      this._exportLookup = new Map();
      this._initedSprites = new Set();
      this._liveButtons = new Set();
      this._astKeyByCode = new Map();
      this._astKeyByKey = new Map();
      this._staticLayerEl = null;
      this._dynamicLayerEl = null;

      // Zero-GC execution & display-list scratch pools
      this._execFramePool = [];
      this._regsPool = [];
      this._reconcilePool = [];
      this._argsPool = [];
      this._reorderScratch = [];

      // Zero-overhead diagnostic collector state (active ONLY when window.__SWF_DEBUG__ === true)
      this._dbgActiveThisTick = false;
      this._tickSvgRenderMs = 0;
      this._dbgUnhandledOpcodes = new Set();
      this._dbgNanMap = new Map();
      this._dbgAvm1MsBuf = new Float64Array(60);
      this._dbgSvgMsBuf = new Float64Array(60);
      this._dbgBufIdx = 0;
      this._dbgBufCount = 0;
      this._dbgActiveDynamicNodes = 0;
      this._dbgImportSummary = {
        totalTagsParsed: (this.program.dbg && this.program.dbg.tt) || 0,
        cachedDefsShapes: (this.program.dbg && this.program.dbg.ds) || 0,
        skippedTagIds: (this.program.dbg && Array.isArray(this.program.dbg.sk)) ? this.program.dbg.sk.slice() : [],
      };
      this._loadAstKeyBindings();

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
      this._pressedInteractive = null;
      this._focusedTarget = null;
      this._keysDown = new Set();
      this._toggledKeys = new Set();
      this._lastKeyCode = 0;
      this._lastKeyAscii = 0;
      this._keyListeners = [];
      this._mouseListeners = [];
      this._selectionListeners = [];
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

      this._fxFilterCache = new Map();
      this._fxFilterCounter = 0;
      this._soundBufferCache = new Map();
      this._activeSoundNodes = new Set();
      this._soundLog = [];
      this._audioCtx = null;

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
          sf: this.program.sf || [],
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

      // Key object (aligned with Ruffle / Flash AVM1 Key specification)
      const KeyObj = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
        SPACE: 32, ENTER: 13, SHIFT: 16, CONTROL: 17, ALT: 18,
        ESCAPE: 27, BACKSPACE: 8, TAB: 9, CAPSLOCK: 20,
        DELETEKEY: 46, INSERT: 45, HOME: 36, END: 35,
        PGUP: 33, PGDN: 34, NUMLOCK: 144, SCROLLLOCK: 145,
        isDown(code) { return vm._keysDown.has(Number(code) | 0); },
        getCode() { return vm._lastKeyCode; },
        getAscii() { return vm._lastKeyAscii; },
        isToggled(code) { return vm._toggledKeys.has(Number(code) | 0); },
        addListener(obj) {
          if (obj && vm._keyListeners.indexOf(obj) === -1) vm._keyListeners.push(obj);
        },
        removeListener(obj) {
          const i = vm._keyListeners.indexOf(obj);
          if (i !== -1) vm._keyListeners.splice(i, 1);
          return i !== -1;
        },
      };

      // Selection object (Flash keyboard focus API with editable SVG TextField caret sync)
      const SelectionObj = {
        getFocus() { return vm._focusedTarget ? (vm._focusedTarget._name || vm._focusedTarget) : null; },
        setFocus(target) {
          const prev = vm._focusedTarget;
          if (prev && prev !== target && typeof prev._setFocused === 'function') {
            prev._setFocused(false);
          }
          vm._focusedTarget = target || null;
          if (vm._focusedTarget && typeof vm._focusedTarget._setFocused === 'function') {
            vm._focusedTarget._setFocused(true);
          }
          for (let i = 0; i < vm._selectionListeners.length; i++) {
            const l = vm._selectionListeners[i];
            if (l && typeof l.onSetFocus === 'function') vm._invokeValue(l.onSetFocus, l, [prev, vm._focusedTarget]);
          }
          return Boolean(target);
        },
        addListener(obj) {
          if (obj && vm._selectionListeners.indexOf(obj) === -1) vm._selectionListeners.push(obj);
        },
        removeListener(obj) {
          const i = vm._selectionListeners.indexOf(obj);
          if (i !== -1) vm._selectionListeners.splice(i, 1);
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

      // Flash Color class -> drives live SVG <feColorMatrix> ColorTransform on target MovieClip
      function FlashColor(target) {
        this._target = target;
        this._rgb = 0;
        this._transform = { ra: 100, rb: 0, ga: 100, gb: 0, ba: 100, bb: 0, aa: 100, ab: 0 };
      }
      FlashColor.prototype.setRGB = function (rgb) {
        const val = (Number(rgb) || 0) & 0xffffff;
        this._rgb = val;
        const r = (val >>> 16) & 0xff;
        const g = (val >>> 8) & 0xff;
        const b = val & 0xff;
        this.setTransform({ ra: 0, rb: r, ga: 0, gb: g, ba: 0, bb: b, aa: 100, ab: 0 });
      };
      FlashColor.prototype.getRGB = function () { return this._rgb; };
      FlashColor.prototype.setTransform = function (t) {
        if (!t || typeof t !== 'object') return;
        const next = {
          ra: t.ra !== undefined ? Number(t.ra) : this._transform.ra,
          rb: t.rb !== undefined ? Number(t.rb) : this._transform.rb,
          ga: t.ga !== undefined ? Number(t.ga) : this._transform.ga,
          gb: t.gb !== undefined ? Number(t.gb) : this._transform.gb,
          ba: t.ba !== undefined ? Number(t.ba) : this._transform.ba,
          bb: t.bb !== undefined ? Number(t.bb) : this._transform.bb,
          aa: t.aa !== undefined ? Number(t.aa) : this._transform.aa,
          ab: t.ab !== undefined ? Number(t.ab) : this._transform.ab,
        };
        this._transform = next;
        const tgt = this._target;
        if (tgt && tgt.svgEl) {
          const cx = [
            Math.round((next.ra / 100) * 256),
            Math.round((next.ga / 100) * 256),
            Math.round((next.ba / 100) * 256),
            Math.round((next.aa / 100) * 256),
            Math.round(next.rb),
            Math.round(next.gb),
            Math.round(next.bb),
            Math.round(next.ab),
          ];
          tgt._scriptColorTransform = cx;
          vm._applyVisualFx(tgt.svgEl, cx, tgt._activeFilters || null);
        }
      };
      FlashColor.prototype.getTransform = function () { return { ...this._transform }; };

      // Flash Sound class -> zero-dependency Web Audio API (PCM / SWF IMA ADPCM / MP3)
      function FlashSound(target) {
        this._target = target;
        this._id = null;
        this._soundId = null;
        this._volume = 100;
        this._pan = 0;
        this._startMs = 0;
        this._durationMs = 0;
      }
      Object.defineProperty(FlashSound.prototype, 'duration', {
        get() { return this._durationMs || 0; },
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(FlashSound.prototype, 'position', {
        get() {
          if (!this._startMs) return 0;
          const elapsed = Math.max(0, vm._elapsedMs - this._startMs);
          return this._durationMs > 0 ? Math.min(this._durationMs, elapsed) : elapsed;
        },
        enumerable: true,
        configurable: true,
      });
      FlashSound.prototype.attachSound = function (linkageId) {
        this._id = String(linkageId || '');
        const resolved = vm._lookupExport(this._id);
        this._soundId = resolved !== undefined ? resolved : (Number(this._id) || null);
        const def = this._soundId != null && vm.program.sn ? vm.program.sn[this._soundId] : null;
        this._durationMs = (def && def.sc && def.rate) ? Math.round((def.sc / def.rate) * 1000) : 400;
      };
      FlashSound.prototype.start = function (secondOffset, loops) {
        const self = this;
        const loopsN = Math.max(1, Number(loops) || 1);
        this._startMs = vm._elapsedMs;
        const onComplete = () => {
          const cb = vm._getMember(self, 'onSoundComplete');
          if (typeof cb === 'function') {
            vm._invokeValue(cb, self, []);
          }
        };
        if (this._soundId == null) {
          vm._scheduleSoundComplete(Math.min(400, this._durationMs || 250), onComplete);
          return;
        }
        vm._playSwfSound(this._soundId, {
          offsetSec: Math.max(0, Number(secondOffset) || 0),
          loops: loopsN,
          volume: this._volume,
          pan: this._pan,
          onComplete,
        });
      };
      FlashSound.prototype.stop = function (linkageId) {
        if (linkageId) {
          const resolved = vm._lookupExport(String(linkageId));
          if (resolved !== undefined) vm._stopSwfSound(resolved);
        } else if (this._soundId != null) {
          vm._stopSwfSound(this._soundId);
        } else {
          vm.stopAllSounds();
        }
      };
      FlashSound.prototype.setVolume = function (v) {
        this._volume = Math.max(0, Math.min(100, Number(v) || 0));
      };
      FlashSound.prototype.getVolume = function () { return this._volume; };
      FlashSound.prototype.setPan = function (p) {
        this._pan = Math.max(-100, Math.min(100, Number(p) || 0));
      };
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
      g.Selection = SelectionObj;
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
      g.ASSetPropFlags = () => {};
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

    _ensureShapeDef(charId) {
      if (!this.defsEl || !this.doc) return null;
      if (this._shapeDefsMap.has(charId)) {
        return this._shapeDefsMap.get(charId);
      }
      const defId = `swf-shape-${charId}`;
      let g = null;
      const sh = this.program.sh && this.program.sh[charId];
      if (sh && Array.isArray(sh.p)) {
        g = createSvgEl(this.doc, 'g');
        g.setAttribute('id', defId);
        g.setAttribute('data-swf-vm-def', '1');
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
      } else if (sh && sh.svg) {
        const tpl = parseSvgSnippetToNode(this.doc, sh.svg);
        g = createSvgEl(this.doc, 'g');
        g.setAttribute('id', defId);
        g.setAttribute('data-swf-vm-def', '1');
        if (tpl) g.appendChild(tpl);
      } else {
        const mo = this.program.mo && this.program.mo[charId];
        if (mo && mo.s) {
          g = createSvgEl(this.doc, 'g');
          g.setAttribute('id', defId);
          g.setAttribute('data-swf-vm-def', '1');
          const p = createSvgEl(this.doc, 'path');
          p.setAttribute('d', mo.s);
          p.setAttribute('fill', mo.sf || 'none');
          p.setAttribute('stroke', mo.st || 'none');
          if (mo.sw) p.setAttribute('stroke-width', String(mo.sw));
          g.appendChild(p);
        }
      }
      if (g) {
        this.defsEl.appendChild(g);
        this._shapeDefsMap.set(charId, g);
        return g;
      }
      return null;
    }

    _instantiateStaticCharSvg(charId, visited = null, depth = 0) {
      if (depth > 16) return null;
      // Primary path: cache shape once inside <defs> as <g id="swf-shape-{charId}"> and instance via <use>
      if (this.defsEl && ((this.program.sh && this.program.sh[charId]) || (this.program.mo && this.program.mo[charId]))) {
        const defG = this._ensureShapeDef(charId);
        if (defG) {
          const useEl = createSvgEl(this.doc, 'use');
          useEl.setAttribute('href', `#swf-shape-${charId}`);
          return useEl;
        }
      }
      if (this._shapeTemplateCache.has(charId)) {
        return this._shapeTemplateCache.get(charId).cloneNode(true);
      }
      const sh = this.program.sh && this.program.sh[charId];
      if (sh && Array.isArray(sh.p)) {
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
      const et = this.program.et && this.program.et[charId];
      if (et) {
        const g = createSvgEl(this.doc, 'g');
        const fs = et.fs || 14;
        const bw = Math.max(16, et.w || 80);
        const bh = Math.max(fs + 4, et.h || (fs + 6));
        const hitRect = createSvgEl(this.doc, 'rect');
        hitRect.setAttribute('x', fmtNum(et.x || 0));
        hitRect.setAttribute('y', fmtNum(et.y || 0));
        hitRect.setAttribute('width', fmtNum(bw));
        hitRect.setAttribute('height', fmtNum(bh));
        hitRect.setAttribute('fill', 'rgba(0,0,0,0)');
        g.appendChild(hitRect);
        if (et.t) {
          const align = et.al || 0;
          const anchor = align === 1 ? 'end' : (align === 2 ? 'middle' : 'start');
          const tx = align === 1 ? ((et.x || 0) + bw) : (align === 2 ? ((et.x || 0) + bw / 2) : (et.x || 0));
          const ty = (et.y || 0) + Math.min(bh, Math.max(fs, bh * 0.72));
          const tEl = createSvgEl(this.doc, 'text');
          tEl.setAttribute('x', fmtNum(tx));
          tEl.setAttribute('y', fmtNum(ty));
          tEl.setAttribute('fill', et.col || '#ffffff');
          tEl.setAttribute('font-size', String(fs));
          tEl.setAttribute('text-anchor', anchor);
          tEl.setAttribute('font-family', 'system-ui, sans-serif');
          tEl.setAttribute('font-weight', '600');
          tEl.textContent = String(et.t);
          g.appendChild(tEl);
        }
        this._shapeTemplateCache.set(charId, g);
        return g.cloneNode(true);
      }
      return null;
    }

    _getStaticCharBBox(charId, depth = 0) {
      if (depth > 8) return null;
      const sh = this.program.sh && this.program.sh[charId];
      if (sh && Array.isArray(sh.bb) && sh.bb.length === 4) return sh.bb;
      const mo = this.program.mo && this.program.mo[charId];
      if (mo && Array.isArray(mo.bb) && mo.bb.length === 4) return mo.bb;
      const et = this.program.et && this.program.et[charId];
      if (et) {
        const fs = et.fs || 14;
        return [et.x || 0, et.y || 0, Math.max(16, et.w || 80), Math.max(fs + 4, et.h || (fs + 6))];
      }
      const sp = this.program.sp && this.program.sp[charId];
      if (sp && sp.fr && Array.isArray(sp.fr[0])) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const entries = sp.fr[0];
        for (let i = 0; i < entries.length; i++) {
          const e = entries[i];
          if (!e || e.cd) continue;
          const bb = this._getStaticCharBBox(e.c, depth + 1);
          if (!bb) continue;
          const m = e.m || IDENTITY_MAT;
          const rx = bb[0], ry = bb[1], rx2 = rx + bb[2], ry2 = ry + bb[3];
          const xs = [m[0] * rx + m[2] * ry + m[4], m[0] * rx2 + m[2] * ry + m[4], m[0] * rx + m[2] * ry2 + m[4], m[0] * rx2 + m[2] * ry2 + m[4]];
          const ys = [m[1] * rx + m[3] * ry + m[5], m[1] * rx2 + m[3] * ry + m[5], m[1] * rx + m[3] * ry2 + m[5], m[1] * rx2 + m[3] * ry2 + m[5]];
          for (let k = 0; k < 4; k++) {
            if (xs[k] < minX) minX = xs[k]; if (xs[k] > maxX) maxX = xs[k];
            if (ys[k] < minY) minY = ys[k]; if (ys[k] > maxY) maxY = ys[k];
          }
        }
        if (Number.isFinite(minX)) return [minX, minY, maxX - minX, maxY - minY];
      }
      return null;
    }

    _resolveShapeUseTarget(el) {
      if (!el || typeof el.getAttribute !== 'function') return null;
      const href = el.getAttribute('href') || el.getAttribute('xlink:href') || '';
      if (!href.startsWith('#swf-shape-')) return null;
      const idNum = Number(href.slice('#swf-shape-'.length));
      if (Number.isFinite(idNum) && this._shapeDefsMap.has(idNum)) {
        return this._shapeDefsMap.get(idNum);
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
        if (tag === 'use') {
          const targetDef = this._resolveShapeUseTarget(el);
          if (targetDef) collect(targetDef, nextChain);
          return;
        }
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

    _populateClipPathFromElement(clipPathEl, sourceEl, rootMatStr, skipRootTransform) {
      if (!clipPathEl || !sourceEl) return;
      const collect = (el, chain, isRoot) => {
        if (!el) return;
        const tag = (el.nodeName || el.tagName || '').toLowerCase();
        const ownT = (!isRoot || !skipRootTransform) && el.getAttribute ? el.getAttribute('transform') : '';
        const nextChain = ownT ? (chain ? `${chain} ${ownT}` : ownT) : chain;
        if (tag === 'use') {
          const targetDef = this._resolveShapeUseTarget(el);
          if (targetDef) collect(targetDef, nextChain, false);
          return;
        }
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
        for (let i = 0; i < kids.length; i++) collect(kids[i], nextChain, false);
      };
      collect(sourceEl, rootMatStr || '', true);
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
        if (mc._hasInteractiveHandler()) {
          mc._ensurePointerListeners();
        }
      }
    }

    _loadAstKeyBindings() {
      this._astKeyByCode.clear();
      this._astKeyByKey.clear();
      const registerBinding = (entry) => {
        if (!entry) return;
        const rawCode = entry.code ? String(entry.code) : '';
        const rawKey = entry.key ? String(entry.key) : '';
        const explicitFlash = entry.flashKey ?? entry.flashKeyCode ?? entry.keyCode ?? entry.fk;
        const flashKeyCode = explicitFlash !== undefined && explicitFlash !== null
          ? Number(explicitFlash)
          : mapEventKeyToFlashCode({ code: rawCode, key: rawKey });
        const varName = entry.var || entry.holdVar || entry.setVar || entry.v || '';
        const rec = {
          code: rawCode,
          key: rawKey,
          flashKeyCode: Number.isFinite(flashKeyCode) && flashKeyCode > 0 ? flashKeyCode : 0,
          varName: varName ? String(varName) : '',
          label: entry.label || '',
        };
        if (rawCode) this._astKeyByCode.set(rawCode, rec);
        if (rawKey) {
          this._astKeyByKey.set(rawKey, rec);
          if (rawKey.length === 1) this._astKeyByKey.set(rawKey.toLowerCase(), rec);
        }
      };

      // 1. SWF program detected keyboard map (program.kb)
      const progKb = this.program && Array.isArray(this.program.kb) ? this.program.kb : [];
      for (let i = 0; i < progKb.length; i++) registerBinding(progKb[i]);

      // 2. AST cartridge (:key-bindings ...) & (:key ...) gestures override / augment program bindings
      const scene = this.engine && this.engine.scene;
      if (scene) {
        if (Array.isArray(scene.keyBindings)) {
          for (let i = 0; i < scene.keyBindings.length; i++) registerBinding(scene.keyBindings[i]);
        }
        if (Array.isArray(scene.gestures)) {
          for (let i = 0; i < scene.gestures.length; i++) {
            const g = scene.gestures[i];
            if (!g || g.type !== 'key') continue;
            const keys = Array.isArray(g.keys) ? g.keys : (g.key ? [g.key] : []);
            const code = g.code || (keys.length === 1 && keys[0].length > 1 ? keys[0] : '');
            const key = keys.length > 0 ? keys[0] : '';
            registerBinding({
              code,
              key,
              flashKey: g.flashKey ?? g.keyCode,
              var: g.holdVar || g.var || g.setVar || '',
              label: g.label || '',
            });
          }
        }
      }
    }

    _resolveAstKeyBinding(payload) {
      if (!payload) return null;
      if (payload.code && this._astKeyByCode.has(payload.code)) {
        return this._astKeyByCode.get(payload.code);
      }
      if (payload.key) {
        if (this._astKeyByKey.has(payload.key)) return this._astKeyByKey.get(payload.key);
        const low = payload.key.length === 1 ? payload.key.toLowerCase() : '';
        if (low && this._astKeyByKey.has(low)) return this._astKeyByKey.get(low);
      }
      return null;
    }

    _resolveFlashKeyFromEvent(payload) {
      const bound = this._resolveAstKeyBinding(payload);
      if (bound && bound.flashKeyCode) return bound.flashKeyCode;
      return mapEventKeyToFlashCode(payload);
    }

    _syncAstKeyState(payload, isDown) {
      if (!this.engine) return;
      if (typeof this.engine.setKeyBindingState === 'function') {
        this.engine.setKeyBindingState(payload && payload.code, payload && payload.key, isDown);
        return;
      }
      const bound = this._resolveAstKeyBinding(payload);
      if (bound && bound.varName && this.engine.vars) {
        this.engine.vars[bound.varName] = isDown ? 1 : 0;
      }
    }

    _initRootStaticLayer() {
      const root = this.rootClip;
      if (!root || !this._staticLayerEl) return;
      const frames = root._frames || [];
      const f1 = frames[0] || [];
      const frozenDepths = new Set();
      if (f1.length === 0) {
        root._staticFrozenDepths = frozenDepths;
        return;
      }
      const prog = this.program;
      // Compute frame-1 mask ranges so masked depths remain in the dynamic layer
      const maskedRanges = [];
      for (let i = 0; i < f1.length; i++) {
        if (f1[i].cd && f1[i].cd > f1[i].d) {
          maskedRanges.push([f1[i].d, f1[i].cd]);
        }
      }
      const isMasked = (d) => {
        for (let i = 0; i < maskedRanges.length; i++) {
          if (d >= maskedRanges[i][0] && d <= maskedRanges[i][1]) return true;
        }
        return false;
      };
      const isStaticCandidate = (e) => {
        if (!e || e.cd || e.n || e.ca || e.ci !== undefined) return false;
        if (isMasked(e.d)) return false;
        if ((prog.sp && prog.sp[e.c]) || (prog.bt && prog.bt[e.c]) || (prog.et && prog.et[e.c])) return false;
        if (!(prog.sh && prog.sh[e.c]) && !(prog.mo && prog.mo[e.c])) return false;
        return true;
      };

      // Check which frame-1 static candidates stay identical across every root frame
      const staticEligible = new Map();
      for (let i = 0; i < f1.length; i++) {
        const e = f1[i];
        if (!isStaticCandidate(e)) continue;
        let unchanged = true;
        for (let fi = 1; fi < frames.length; fi++) {
          const fr = frames[fi];
          if (fr === f1) continue;
          let found = null;
          for (let j = 0; j < fr.length; j++) {
            if (fr[j].d === e.d) { found = fr[j]; break; }
          }
          if (
            !found ||
            found.c !== e.c ||
            found.cd ||
            found.n ||
            !matEquals(found.m || null, e.m || null) ||
            (found.a !== undefined ? found.a : 1) !== (e.a !== undefined ? e.a : 1) ||
            JSON.stringify(found.cx || null) !== JSON.stringify(e.cx || null) ||
            JSON.stringify(found.fl || null) !== JSON.stringify(e.fl || null)
          ) {
            unchanged = false;
            break;
          }
        }
        if (unchanged) staticEligible.set(e.d, e);
      }

      // Preserve exact painter's z-order: only freeze contiguous bottom background depths
      // strictly below the lowest non-static depth across all frames.
      let lowestDynamicDepth = Infinity;
      for (let fi = 0; fi < frames.length; fi++) {
        const fr = frames[fi];
        if (fi > 0 && fr === frames[fi - 1]) continue;
        for (let j = 0; j < fr.length; j++) {
          const d = fr[j].d;
          if (!staticEligible.has(d) && d < lowestDynamicDepth) {
            lowestDynamicDepth = d;
          }
        }
      }

      const sortedStatic = Array.from(staticEligible.values())
        .filter((e) => e.d < lowestDynamicDepth)
        .sort((a, b) => a.d - b.d);

      for (let i = 0; i < sortedStatic.length; i++) {
        const e = sortedStatic[i];
        frozenDepths.add(e.d);
        const wrap = createSvgEl(this.doc, 'g');
        const mat = e.m || [1, 0, 0, 1, 0, 0];
        wrap.setAttribute('transform', `matrix(${mat.map(fmtNum).join(' ')})`);
        if (e.a !== undefined && e.a < 1) wrap.setAttribute('opacity', fmtNum(e.a));
        const inner = this._instantiateStaticCharSvg(e.c);
        if (inner) wrap.appendChild(inner);
        if (e.cx || e.fl) this._applyVisualFx(wrap, e.cx || null, e.fl || null);
        this._staticLayerEl.appendChild(wrap);
      }
      root._staticFrozenDepths = frozenDepths;
    }

    /**
     * Mounts the AVM1 pure-SVG runtime onto the stage container, replacing static fallback
     * geometry inside #scene-root with the live hierarchical AVM1 MovieClip SVG DOM tree.
     */
    mount(container, stageSvg) {
      this.container = container || this.container;
      this.stageSvg = stageSvg || this.stageSvg;
      if (!this.container) return false;

      this._shapeDefsMap.clear();
      this._targetPathCache.clear();
      this._treeVersion++;
      this._loadAstKeyBindings();

      if (this.stageSvg && typeof this.stageSvg.setAttribute === 'function') {
        this.stageSvg.setAttribute('viewBox', `0 0 ${this.stageWidth} ${this.stageHeight}`);
      }

      // Preserve any gradient/pattern/filter definitions already present in the stage container before replacing children
      const preservedDefs = [];
      if (typeof this.container.querySelectorAll === 'function') {
        try {
          const existingGrads = this.container.querySelectorAll('defs linearGradient, defs radialGradient, defs pattern, defs filter');
          for (let i = 0; i < existingGrads.length; i++) {
            const gEl = existingGrads[i];
            if (typeof gEl.getAttribute === 'function' && gEl.getAttribute('data-swf-vm-def') === '1') continue;
            preservedDefs.push(gEl.cloneNode(true));
          }
        } catch (_) {}
      }

      // Build clean stage structure: <defs><clipPath id="swf-stage-clip">...</defs><rect id="bg"/><g id="avm1-stage-clip-root" clip-path="..."><g id="avm1-root"><g id="stage-static-layer"/><g id="stage-dynamic-layer"/></g></g>
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
      this._installProgramDefs(defs);

      const bg = createSvgEl(this.doc, 'rect');
      bg.setAttribute('id', 'bg');
      bg.setAttribute('width', String(this.stageWidth));
      bg.setAttribute('height', String(this.stageHeight));
      bg.setAttribute('fill', this.program.bg || '#0f172a');

      const sceneClipRoot = createSvgEl(this.doc, 'g');
      sceneClipRoot.setAttribute('id', 'avm1-stage-clip-root');
      sceneClipRoot.setAttribute('clip-path', 'url(#swf-stage-clip)');
      this.rootClip.svgEl.setAttribute('id', 'avm1-root');
      this.rootClip.svgEl.setAttribute('pointer-events', 'none');

      const staticLayer = createSvgEl(this.doc, 'g');
      staticLayer.setAttribute('id', 'stage-static-layer');
      staticLayer.setAttribute('data-static', 'true');
      const dynamicLayer = createSvgEl(this.doc, 'g');
      dynamicLayer.setAttribute('id', 'stage-dynamic-layer');
      this._staticLayerEl = staticLayer;
      this._dynamicLayerEl = dynamicLayer;
      this.rootClip._staticLayerEl = staticLayer;
      this.rootClip._dynamicLayerEl = dynamicLayer;
      this.rootClip.svgEl.appendChild(staticLayer);
      this.rootClip.svgEl.appendChild(dynamicLayer);

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

      // Register active runtime for console diagnostic inspection
      const dbgShared = _getSwfDebugSharedState();
      dbgShared.activeRuntime = this;
      if (this.program.dbg) {
        dbgShared.importSummary = {
          totalTagsParsed: this.program.dbg.tt || 0,
          cachedDefsShapes: Math.max(this.program.dbg.ds || 0, this._shapeDefsMap.size),
          skippedTagIds: Array.isArray(this.program.dbg.sk) ? this.program.dbg.sk.slice() : [],
        };
      }

      // Populate frozen static background layer once before frame-1 dynamic reconciliation
      this._initRootStaticLayer();

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
      this._syncTelemetry(true);
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
      const gestureBus = (this.engine && this.engine.gestures && typeof this.engine.gestures.registerMediaInputSink === 'function')
        ? this.engine.gestures
        : (win && win.__astGestures && typeof win.__astGestures.registerMediaInputSink === 'function' ? win.__astGestures : null);

      this._lastPointerMoveMs = 0;

      // Clean up any previous sink registration before rebinding
      if (this._boundGestureBus && this._inputSinkId && typeof this._boundGestureBus.unregisterMediaInputSink === 'function') {
        this._boundGestureBus.unregisterMediaInputSink(this._inputSinkId);
        this._boundGestureBus = null;
      }

      // Preferred decoupled path: subscribe as an independent sink on the universal gesture route bus.
      // Zero duplicate window/stage listeners — site-gestures.js + player-gestures.ast own DOM & whiteboard gating.
      if (gestureBus) {
        this._inputSinkId = this._inputSinkId || `avm1-media-sink-${++this._instCounter}`;
        this._boundGestureBus = gestureBus;
        this._standaloneListenersBound = false;
        const self = this;
        gestureBus.registerMediaInputSink(this._inputSinkId, {
          exclusiveKeyboard: true,
          exclusivePointer: true,
          'pointer-move'(payload) {
            if (!self._mounted) return;
            const pt = (payload && payload.svgPt)
              ? payload.svgPt
              : (payload && payload.originalEvent ? self._clientToStage(payload.originalEvent.clientX, payload.originalEvent.clientY) : null);
            if (pt) self.setMousePosition(pt.x, pt.y);
          },
          'pointer-down'(payload) {
            if (!self._mounted) return;
            const rawTarget = payload && payload.originalEvent ? payload.originalEvent.target : null;
            if (self._focusedTarget && self._focusedTarget._isTextField && rawTarget !== self._focusedTarget.bgRect) {
              if (self._global && self._global.Selection) {
                self._global.Selection.setFocus(null);
              }
            }
            const pt = (payload && payload.svgPt)
              ? payload.svgPt
              : (payload && payload.originalEvent ? self._clientToStage(payload.originalEvent.clientX, payload.originalEvent.clientY) : null);
            if (pt) self.setMousePosition(pt.x, pt.y);
            self.triggerMouseDown();
            return { exclusive: true };
          },
          'pointer-up'(payload) {
            if (!self._mounted) return;
            const pt = (payload && payload.svgPt)
              ? payload.svgPt
              : (payload && payload.originalEvent && typeof payload.originalEvent.clientX === 'number'
                ? self._clientToStage(payload.originalEvent.clientX, payload.originalEvent.clientY)
                : null);
            if (pt) self.setMousePosition(pt.x, pt.y);
            self.triggerMouseUp();
          },
          'wheel'(payload) {
            if (!self._mounted || self._mouseListeners.length === 0) return;
            const rawDelta = payload && typeof payload.deltaY === 'number' ? payload.deltaY : 0;
            if (rawDelta === 0) return;
            self.triggerMouseWheel(rawDelta < 0 ? 3 : -3);
          },
          'key-down'(payload) {
            if (!self._mounted || !payload) return;
            if (payload.originalEvent) self._syncModifierToggles(payload.originalEvent);
            self._syncAstKeyState(payload, true);
            const kc = self._resolveFlashKeyFromEvent(payload);
            if (!kc) return;
            let consumed = false;
            const shiftHeld = Boolean(payload.shiftKey || (payload.originalEvent && payload.originalEvent.shiftKey));
            if (self._focusedTarget && self._focusedTarget._isTextField && self._focusedTarget._editable) {
              self._focusedTarget.handleKeyInput(kc, payload.key || '', shiftHeld);
              consumed = true;
            } else if (kc === 9 && self._cycleEditableTextFocus(shiftHeld ? -1 : 1)) {
              consumed = true;
            }
            const ascii = (payload.key && payload.key.length === 1) ? payload.key.charCodeAt(0) : kc;
            self.triggerKeyDown(kc, ascii);
            return { consumed, exclusive: true };
          },
          'key-up'(payload) {
            if (!self._mounted || !payload) return;
            if (payload.originalEvent) self._syncModifierToggles(payload.originalEvent);
            self._syncAstKeyState(payload, false);
            const kc = self._resolveFlashKeyFromEvent(payload);
            if (!kc) return;
            self.triggerKeyUp(kc);
          },
          'release-all'() {
            self.releaseAllInputs();
          },
        });
        return;
      }

      // Standalone / headless fallback when ASTAVM1Runtime is mounted without site-gestures.js
      this._standaloneListenersBound = true;
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
      this._onWheel = (e) => {
        if (!e || this._mouseListeners.length === 0) return;
        const rawDelta = typeof e.deltaY === 'number' ? e.deltaY : 0;
        if (rawDelta === 0) return;
        const flashDelta = rawDelta < 0 ? 3 : -3;
        this.triggerMouseWheel(flashDelta);
      };
      this._onKeyDown = (e) => {
        if (e && e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
        this._syncModifierToggles(e);
        this._syncAstKeyState(e, true);
        const kc = this._resolveFlashKeyFromEvent(e);
        if (!kc) return;
        if (this._focusedTarget && this._focusedTarget._isTextField && this._focusedTarget._editable) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          this._focusedTarget.handleKeyInput(kc, e.key || '', Boolean(e.shiftKey));
        } else if (kc === 9 && this._cycleEditableTextFocus(e.shiftKey ? -1 : 1)) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
        } else if (kc === 32 || (kc >= 37 && kc <= 40) || kc === 9) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
        }
        const ascii = (e.key && e.key.length === 1) ? e.key.charCodeAt(0) : kc;
        this.triggerKeyDown(kc, ascii);
      };
      this._onKeyUp = (e) => {
        this._syncModifierToggles(e);
        this._syncAstKeyState(e, false);
        const kc = this._resolveFlashKeyFromEvent(e);
        if (!kc) return;
        this.triggerKeyUp(kc);
      };
      this._onWindowBlur = () => {
        this.releaseAllInputs();
      };

      if (target && typeof target.addEventListener === 'function') {
        target.addEventListener('pointermove', this._onPointerMove);
        target.addEventListener('pointerdown', this._onPointerDown);
        target.addEventListener('wheel', this._onWheel, { passive: true });
      }
      if (win && typeof win.addEventListener === 'function') {
        win.addEventListener('pointerup', this._onPointerUp);
        win.addEventListener('pointercancel', this._onWindowBlur);
        win.addEventListener('keydown', this._onKeyDown);
        win.addEventListener('keyup', this._onKeyUp);
        win.addEventListener('blur', this._onWindowBlur);
      }
    }

    _installProgramDefs(defs) {
      if (!defs) return;
      // 1. SWF Linear & Radial Gradients (Flash canonical gradient square: -819.2..+819.2 px)
      const grads = this.program.gr || [];
      for (let i = 0; i < grads.length; i++) {
        const g = grads[i];
        if (!g || !g.id || !Array.isArray(g.st)) continue;
        const el = createSvgEl(this.doc, g.t === 'r' ? 'radialGradient' : 'linearGradient');
        el.setAttribute('id', g.id);
        el.setAttribute('data-swf-vm-def', '1');
        el.setAttribute('gradientUnits', 'userSpaceOnUse');
        if (g.t === 'r') {
          el.setAttribute('cx', '0');
          el.setAttribute('cy', '0');
          el.setAttribute('r', '819.2');
          if (g.fp) el.setAttribute('fx', fmtNum(g.fp * 819.2));
        } else {
          el.setAttribute('x1', '-819.2');
          el.setAttribute('y1', '0');
          el.setAttribute('x2', '819.2');
          el.setAttribute('y2', '0');
        }
        if (Array.isArray(g.m) && g.m.length === 6) {
          el.setAttribute('gradientTransform', `matrix(${g.m.map(fmtNum).join(' ')})`);
        }
        for (let s = 0; s < g.st.length; s++) {
          const stop = createSvgEl(this.doc, 'stop');
          stop.setAttribute('offset', `${fmtNum((g.st[s][0] || 0) * 100)}%`);
          stop.setAttribute('stop-color', String(g.st[s][1] || '#ffffff'));
          el.appendChild(stop);
        }
        defs.appendChild(el);
      }

      // 2. SWF Bitmap Fill Patterns (DefineBitsJPEG2/3 & DefineBitsLossless/2 -> pure SVG <pattern><image>)
      const patterns = this.program.bp || [];
      const bitmaps = this.program.bm || {};
      const safeDataUriRe = /^data:image\/(?:png|jpeg|gif);base64,[A-Za-z0-9+/=]+$/;
      for (let i = 0; i < patterns.length; i++) {
        const pat = patterns[i];
        const bmp = pat && bitmaps[pat.b];
        if (!bmp || !bmp.u || !safeDataUriRe.test(bmp.u)) continue;
        const w = bmp.w || 64;
        const h = bmp.h || 64;
        const pel = createSvgEl(this.doc, 'pattern');
        pel.setAttribute('id', pat.id);
        pel.setAttribute('data-swf-vm-def', '1');
        pel.setAttribute('patternUnits', 'userSpaceOnUse');
        pel.setAttribute('width', String(w));
        pel.setAttribute('height', String(h));
        if (Array.isArray(pat.m) && pat.m.length === 6) {
          pel.setAttribute('patternTransform', `matrix(${pat.m.map(fmtNum).join(' ')})`);
        }
        const img = createSvgEl(this.doc, 'image');
        img.setAttribute('href', bmp.u);
        img.setAttribute('width', String(w));
        img.setAttribute('height', String(h));
        img.setAttribute('preserveAspectRatio', 'none');
        pel.appendChild(img);
        defs.appendChild(pel);
      }
    }

    _getOrCreateFxFilter(cx, filters) {
      if (!this.defsEl) return null;
      const hasCx = Array.isArray(cx) && cx.length >= 8;
      const hasFl = Array.isArray(filters) && filters.length > 0;
      if (!hasCx && !hasFl) return null;
      const key = `${hasCx ? cx.join(',') : ''}|${hasFl ? JSON.stringify(filters) : ''}`;
      if (this._fxFilterCache.has(key)) return this._fxFilterCache.get(key);
      if (this._fxFilterCache.size >= 128) return null;

      const fid = `avm1-fx-${++this._fxFilterCounter}`;
      const flEl = createSvgEl(this.doc, 'filter');
      flEl.setAttribute('id', fid);
      flEl.setAttribute('data-swf-vm-def', '1');
      flEl.setAttribute('x', '-30%');
      flEl.setAttribute('y', '-30%');
      flEl.setAttribute('width', '160%');
      flEl.setAttribute('height', '160%');

      let prevRes = 'SourceGraphic';
      let stepIdx = 0;

      if (hasCx) {
        const rm = cx[0] / 256;
        const gm = cx[1] / 256;
        const bm = cx[2] / 256;
        const am = cx[3] / 256;
        const ra = cx[4] / 255;
        const ga = cx[5] / 255;
        const ba = cx[6] / 255;
        const aa = cx[7] / 255;
        const cm = createSvgEl(this.doc, 'feColorMatrix');
        cm.setAttribute('in', prevRes);
        cm.setAttribute('type', 'matrix');
        cm.setAttribute(
          'values',
          `${fmtNum(rm)} 0 0 0 ${fmtNum(ra)} 0 ${fmtNum(gm)} 0 0 ${fmtNum(ga)} 0 0 ${fmtNum(bm)} 0 ${fmtNum(ba)} 0 0 0 ${fmtNum(am)} ${fmtNum(aa)}`
        );
        prevRes = `fx_${++stepIdx}`;
        cm.setAttribute('result', prevRes);
        flEl.appendChild(cm);
      }

      if (hasFl) {
        for (let i = 0; i < filters.length; i++) {
          const f = filters[i];
          if (!f) continue;
          if (f.t === 'bl') {
            const blur = createSvgEl(this.doc, 'feGaussianBlur');
            blur.setAttribute('in', prevRes);
            blur.setAttribute('stdDeviation', `${fmtNum((f.bx || 0) / 2.2)} ${fmtNum((f.by || 0) / 2.2)}`);
            prevRes = `fx_${++stepIdx}`;
            blur.setAttribute('result', prevRes);
            flEl.appendChild(blur);
          } else if (f.t === 'ds') {
            const rad = ((f.ang || 45) * Math.PI) / 180;
            const dist = f.d || 4;
            const ds = createSvgEl(this.doc, 'feDropShadow');
            ds.setAttribute('in', prevRes);
            ds.setAttribute('dx', fmtNum(Math.cos(rad) * dist));
            ds.setAttribute('dy', fmtNum(Math.sin(rad) * dist));
            ds.setAttribute('stdDeviation', `${fmtNum((f.bx || 4) / 2.4)} ${fmtNum((f.by || 4) / 2.4)}`);
            ds.setAttribute('flood-color', f.c || 'rgba(0,0,0,0.6)');
            prevRes = `fx_${++stepIdx}`;
            ds.setAttribute('result', prevRes);
            flEl.appendChild(ds);
          } else if (f.t === 'gl') {
            const blur = createSvgEl(this.doc, 'feGaussianBlur');
            blur.setAttribute('in', 'SourceAlpha');
            blur.setAttribute('stdDeviation', `${fmtNum((f.bx || 6) / 2.2)} ${fmtNum((f.by || 6) / 2.2)}`);
            const bRes = `fx_${++stepIdx}`;
            blur.setAttribute('result', bRes);
            flEl.appendChild(blur);

            const flood = createSvgEl(this.doc, 'feFlood');
            flood.setAttribute('flood-color', f.c || '#38bdf8');
            const fRes = `fx_${++stepIdx}`;
            flood.setAttribute('result', fRes);
            flEl.appendChild(flood);

            const comp = createSvgEl(this.doc, 'feComposite');
            comp.setAttribute('in', fRes);
            comp.setAttribute('in2', bRes);
            comp.setAttribute('operator', 'in');
            const gRes = `fx_${++stepIdx}`;
            comp.setAttribute('result', gRes);
            flEl.appendChild(comp);

            const merge = createSvgEl(this.doc, 'feMerge');
            const n1 = createSvgEl(this.doc, 'feMergeNode');
            n1.setAttribute('in', gRes);
            const n2 = createSvgEl(this.doc, 'feMergeNode');
            n2.setAttribute('in', prevRes);
            merge.appendChild(n1);
            merge.appendChild(n2);
            prevRes = `fx_${++stepIdx}`;
            merge.setAttribute('result', prevRes);
            flEl.appendChild(merge);
          } else if (f.t === 'cm' && Array.isArray(f.m) && f.m.length === 20) {
            const vals = f.m.slice();
            vals[4] /= 255; vals[9] /= 255; vals[14] /= 255; vals[19] /= 255;
            const cm = createSvgEl(this.doc, 'feColorMatrix');
            cm.setAttribute('in', prevRes);
            cm.setAttribute('type', 'matrix');
            cm.setAttribute('values', vals.map(fmtNum).join(' '));
            prevRes = `fx_${++stepIdx}`;
            cm.setAttribute('result', prevRes);
            flEl.appendChild(cm);
          }
        }
      }

      this.defsEl.appendChild(flEl);
      this._fxFilterCache.set(key, fid);
      return fid;
    }

    _applyVisualFx(el, cx, filters) {
      if (!el || typeof el.setAttribute !== 'function') return;
      const fid = this._getOrCreateFxFilter(cx, filters);
      const nextVal = fid ? `url(#${fid})` : '';
      if (el._lastFilterVal !== nextVal) {
        el._lastFilterVal = nextVal;
        if (nextVal) el.setAttribute('filter', nextVal);
        else if (typeof el.removeAttribute === 'function') el.removeAttribute('filter');
      }
    }

    // =========================================================================
    // Zero-Dependency Web Audio SWF Sound Engine (PCM / SWF IMA ADPCM / MP3)
    // =========================================================================

    _ensureAudioCtx() {
      if (this._audioCtx) return this._audioCtx;
      if (this.engine && this.engine.audioSynth && this.engine.audioSynth.ctx) {
        this._audioCtx = this.engine.audioSynth.ctx;
        return this._audioCtx;
      }
      const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AC) {
        try {
          this._audioCtx = new AC();
        } catch (_) {}
      }
      return this._audioCtx;
    }

    _decodeSwfAdpcm(bytes, isStereo) {
      // Standard SWF IMA ADPCM decoder (2/3/4/5-bit code sizes per SWF specification)
      const STEP_TABLE = [
        7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31,
        34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143,
        157, 173, 190, 209, 230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658,
        724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024,
        3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899,
        15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767
      ];
      const INDEX_TABLES = {
        2: [-1, 2],
        3: [-1, -1, 2, 4],
        4: [-1, -1, -1, -1, 2, 4, 6, 8],
        5: [-1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 4, 6, 8, 10, 13, 16],
      };
      let bitPos = 0;
      const totalBits = bytes.length * 8;
      const readBits = (n) => {
        let v = 0;
        for (let i = 0; i < n; i++) {
          const bp = bitPos++;
          v = (v << 1) | ((bytes[bp >> 3] >> (7 - (bp & 7))) & 1);
        }
        return v;
      };
      const readSBits = (n) => {
        const u = readBits(n);
        const sign = 1 << (n - 1);
        return (u & sign) ? (u - (sign << 1)) : u;
      };
      if (totalBits < 24) return [new Float32Array(0)];
      const codeSize = readBits(2) + 2;
      const idxTable = INDEX_TABLES[codeSize] || INDEX_TABLES[4];
      const signMask = 1 << (codeSize - 1);
      const magMask = signMask - 1;
      const channels = isStereo ? 2 : 1;
      const out = channels === 2 ? [[], []] : [[]];

      while (bitPos + channels * 22 <= totalBits) {
        const pred = [];
        const stepIdx = [];
        for (let c = 0; c < channels; c++) {
          const s = readSBits(16);
          const idx = Math.max(0, Math.min(88, readBits(6)));
          pred.push(s);
          stepIdx.push(idx);
          out[c].push(s / 32768);
        }
        for (let sample = 0; sample < 4095 && bitPos + channels * codeSize <= totalBits; sample++) {
          for (let c = 0; c < channels; c++) {
            const delta = readBits(codeSize);
            const step = STEP_TABLE[stepIdx[c]];
            let diff = step >> (codeSize - 1);
            for (let b = 0; b < codeSize - 1; b++) {
              if (delta & (1 << b)) diff += step >> (codeSize - 2 - b);
            }
            let nextVal = (delta & signMask) ? (pred[c] - diff) : (pred[c] + diff);
            nextVal = Math.max(-32768, Math.min(32767, nextVal));
            pred[c] = nextVal;
            stepIdx[c] = Math.max(0, Math.min(88, stepIdx[c] + idxTable[delta & magMask]));
            out[c].push(nextVal / 32768);
          }
        }
      }
      return out.map((arr) => Float32Array.from(arr));
    }

    _decodeSwfPcm(bytes, is16Bit, isStereo, isLittleEndian) {
      const channels = isStereo ? 2 : 1;
      const bytesPerSample = is16Bit ? 2 : 1;
      const frameCount = Math.floor(bytes.length / (channels * bytesPerSample));
      const out = [];
      for (let c = 0; c < channels; c++) out.push(new Float32Array(frameCount));
      let pos = 0;
      for (let i = 0; i < frameCount; i++) {
        for (let c = 0; c < channels; c++) {
          if (is16Bit) {
            const raw = isLittleEndian
              ? (bytes[pos] | (bytes[pos + 1] << 8))
              : ((bytes[pos] << 8) | bytes[pos + 1]);
            const signed = raw & 0x8000 ? raw - 0x10000 : raw;
            out[c][i] = signed / 32768;
            pos += 2;
          } else {
            out[c][i] = (bytes[pos++] - 128) / 128;
          }
        }
      }
      return out;
    }

    _scheduleSoundComplete(delayMs, onComplete) {
      if (typeof onComplete !== 'function') return null;
      const id = this._nextIntervalId++;
      this._intervals.set(id, {
        fn: onComplete,
        thisObj: this.rootClip,
        args: EMPTY_ARR,
        ms: Math.max(50, Math.min(5000, Number(delayMs) || 250)),
        acc: 0,
        once: true,
      });
      return id;
    }

    _playSwfSound(soundId, opts = {}) {
      const def = this.program.sn && this.program.sn[soundId];
      const loops = Math.max(1, Number(opts.loops) || 1);
      const estDurationMs = (def && def.sc && def.rate)
        ? Math.max(120, Math.min(4800, Math.round((def.sc / def.rate) * 1000 * Math.min(loops, 4))))
        : 250;
      let completeFired = false;
      let fallbackTimerId = null;
      const fireCompleteOnce = () => {
        if (completeFired) return;
        completeFired = true;
        if (fallbackTimerId !== null) {
          this._intervals.delete(fallbackTimerId);
          fallbackTimerId = null;
        }
        if (typeof opts.onComplete === 'function') opts.onComplete();
      };
      const armFallback = (ms) => {
        if (typeof opts.onComplete !== 'function' || completeFired || fallbackTimerId !== null) return;
        fallbackTimerId = this._scheduleSoundComplete(ms, fireCompleteOnce);
      };

      if (!def || !def.b64) {
        armFallback(estDurationMs);
        return false;
      }
      const volume = opts.volume !== undefined ? Math.max(0, Math.min(100, Number(opts.volume))) : 100;
      const pan = opts.pan !== undefined ? Math.max(-100, Math.min(100, Number(opts.pan))) : 0;

      if (opts.noMultiple) {
        for (const rec of this._activeSoundNodes) {
          if (rec.soundId === soundId) return false;
        }
      }
      this._soundLog.push({ op: 'start', id: soundId, fmt: def.fmt, rate: def.rate, loops, volume, pan });
      if (this._soundLog.length > 100) this._soundLog.shift();

      if (this.engine && this.engine.isMuted) {
        armFallback(Math.min(400, estDurationMs));
        return true;
      }
      const ctx = this._ensureAudioCtx();
      if (!ctx) {
        armFallback(Math.min(400, estDurationMs));
        return true;
      }
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        try { ctx.resume().catch(() => {}); } catch (_) {}
      }

      const startBuffer = (audioBuf) => {
        if (!audioBuf || !this._mounted) {
          armFallback(Math.min(400, estDurationMs));
          return;
        }
        try {
          const src = ctx.createBufferSource();
          src.buffer = audioBuf;
          if (loops > 1) src.loop = true;
          const gain = ctx.createGain();
          gain.gain.value = (volume / 100) * 0.85;
          let dest = ctx.destination;
          if (typeof ctx.createStereoPanner === 'function' && Math.abs(pan) > 1) {
            const panner = ctx.createStereoPanner();
            panner.pan.value = pan / 100;
            panner.connect(ctx.destination);
            dest = panner;
          }
          src.connect(gain);
          gain.connect(dest);
          const rec = { soundId, src };
          this._activeSoundNodes.add(rec);
          src.onended = () => {
            this._activeSoundNodes.delete(rec);
            fireCompleteOnce();
          };
          const offset = Math.max(0, Number(opts.offsetSec) || 0);
          const durSec = loops > 1 && loops < 100
            ? Math.max(0.05, audioBuf.duration * loops - offset)
            : Math.max(0.05, audioBuf.duration - offset);
          if (loops > 1 && loops < 100) {
            src.start(0, offset, durSec);
          } else {
            src.start(0, offset);
          }
          // Safety fallback in case browser autoplay policy keeps AudioContext suspended
          if (loops < 100) {
            armFallback(Math.round(durSec * 1000) + 250);
          }
        } catch (_) {
          armFallback(Math.min(400, estDurationMs));
        }
      };

      const cached = this._soundBufferCache.get(soundId);
      if (cached) {
        startBuffer(cached);
        return true;
      }

      const bytes = decodeBase64ToBytes(def.b64);
      if (def.fmt === 2 && typeof ctx.decodeAudioData === 'function') {
        // MP3: skip 2-byte SWF seekSamples prefix
        const mp3Slice = bytes.length > 2 ? bytes.slice(2) : bytes.slice();
        ctx.decodeAudioData(mp3Slice.buffer)
          .then((buf) => {
            this._soundBufferCache.set(soundId, buf);
            startBuffer(buf);
          })
          .catch(() => {
            armFallback(Math.min(400, estDurationMs));
          });
        return true;
      }

      // PCM (fmt 0 / 3) or SWF IMA ADPCM (fmt 1) -> synchronous Float32 AudioBuffer
      try {
        const chData = def.fmt === 1
          ? this._decodeSwfAdpcm(bytes, Boolean(def.st))
          : this._decodeSwfPcm(bytes, Boolean(def.s16), Boolean(def.st), def.fmt !== 0);
        const len = chData[0] ? chData[0].length : 0;
        if (len > 0 && typeof ctx.createBuffer === 'function') {
          const buf = ctx.createBuffer(chData.length, len, def.rate || 22050);
          for (let c = 0; c < chData.length; c++) {
            buf.copyToChannel(chData[c], c);
          }
          this._soundBufferCache.set(soundId, buf);
          startBuffer(buf);
        } else {
          armFallback(Math.min(400, estDurationMs));
        }
      } catch (_) {
        armFallback(Math.min(400, estDurationMs));
      }
      return true;
    }

    _stopSwfSound(soundId) {
      this._soundLog.push({ op: 'stop', id: soundId });
      for (const rec of Array.from(this._activeSoundNodes)) {
        if (rec.soundId === soundId) {
          this._activeSoundNodes.delete(rec);
          try { rec.src.stop(); } catch (_) {}
        }
      }
    }

    stopAllSounds() {
      this._soundLog.push({ op: 'stopAll' });
      for (const rec of Array.from(this._activeSoundNodes)) {
        this._activeSoundNodes.delete(rec);
        try { rec.src.stop(); } catch (_) {}
      }
    }

    _syncModifierToggles(e) {
      if (!e || typeof e.getModifierState !== 'function') return;
      try {
        if (e.getModifierState('CapsLock')) this._toggledKeys.add(20);
        else this._toggledKeys.delete(20);
        if (e.getModifierState('NumLock')) this._toggledKeys.add(144);
        else this._toggledKeys.delete(144);
        if (e.getModifierState('ScrollLock')) this._toggledKeys.add(145);
        else this._toggledKeys.delete(145);
      } catch (_) {}
    }

    handleForwardedKeyEvent(kind, payload) {
      if (!this._mounted || !payload) return;
      if (kind === 'keydown' || kind === 'key-down') {
        this._syncAstKeyState(payload, true);
        const kc = this._resolveFlashKeyFromEvent(payload);
        if (!kc) return;
        const shiftHeld = Boolean(payload.shiftKey);
        if (this._focusedTarget && this._focusedTarget._isTextField && this._focusedTarget._editable) {
          this._focusedTarget.handleKeyInput(kc, payload.key || '', shiftHeld);
        } else if (kc === 9) {
          this._cycleEditableTextFocus(shiftHeld ? -1 : 1);
        }
        const ascii = (payload.key && payload.key.length === 1) ? payload.key.charCodeAt(0) : kc;
        this.triggerKeyDown(kc, ascii);
      } else if (kind === 'keyup' || kind === 'key-up') {
        this._syncAstKeyState(payload, false);
        const kc = this._resolveFlashKeyFromEvent(payload);
        if (!kc) return;
        this.triggerKeyUp(kc);
      }
    }

    releaseAllInputs() {
      const held = Array.from(this._keysDown);
      for (let i = 0; i < held.length; i++) {
        this.triggerKeyUp(held[i]);
      }
      if (this.engine && typeof this.engine.clearKeyBindingsState === 'function') {
        this.engine.clearKeyBindingsState();
      }
      if (this._mouseDown || this._pressedInteractive) {
        this.triggerMouseUp();
      }
      this.stopDragClip();
    }

    // Programmatic & DOM input helpers (also called directly by headless tests!)
    _invokeListenerMethod(listener, eventName, args, skipMovieClip) {
      if (!listener) return;
      if (skipMovieClip && listener._isMovieClip) return;
      const fn = this._getMember(listener, eventName);
      if (typeof fn === 'function') this._invokeValue(fn, listener, args);
    }

    setMousePosition(x, y) {
      this._mouseX = Number(x) || 0;
      this._mouseY = Number(y) || 0;
      this._updateDrag();
      this._beginTickBudget(TICK_OPS_BUDGET, TICK_TIME_BUDGET_MS);
      this._broadcastClipEvent(this.rootClip, CE_MOUSE_MOVE, 'onMouseMove');
      for (let i = 0; i < this._mouseListeners.length; i++) {
        if (this._isOverBudget()) break;
        this._invokeListenerMethod(this._mouseListeners[i], 'onMouseMove', EMPTY_ARR, true);
      }
    }

    _postInteractionCommit(prevFrame, prevPlaying) {
      if (!this._mounted || !this.rootClip) return;
      const syncTextSubtree = (clip) => {
        if (!clip || clip._removed) return;
        const kids = clip._getChildrenSnapshot ? clip._getChildrenSnapshot() : [];
        for (let i = 0; i < kids.length; i++) {
          const obj = kids[i] && kids[i].obj;
          if (!obj) continue;
          if (obj._isTextField) obj.syncVariableFromScope();
          else if (obj._isMovieClip) syncTextSubtree(obj);
        }
      };
      syncTextSubtree(this.rootClip);
      this.rootClip.commitSvg();
      this._syncTelemetry(true);
      const frameChanged = prevFrame !== undefined && this.rootClip._currentframe !== prevFrame;
      const startedPlaying = !prevPlaying && this.rootClip._playing;
      if ((frameChanged || startedPlaying) && this.engine && !this.engine.isPlaying && typeof this.engine.play === 'function') {
        this.engine.play();
      }
    }

    triggerMouseDown() {
      this._mouseDown = true;
      const prevFrame = this.rootClip ? this.rootClip._currentframe : 1;
      const prevPlaying = this.rootClip ? this.rootClip._playing : false;
      this._beginEventBudget();
      this._broadcastClipEvent(this.rootClip, CE_MOUSE_DOWN, 'onMouseDown');
      for (let i = 0; i < this._mouseListeners.length; i++) {
        if (this._isOverBudget()) break;
        this._invokeListenerMethod(this._mouseListeners[i], 'onMouseDown', EMPTY_ARR, true);
      }
      this._postInteractionCommit(prevFrame, prevPlaying);
    }

    triggerMouseUp() {
      this._mouseDown = false;
      const prevFrame = this.rootClip ? this.rootClip._currentframe : 1;
      const prevPlaying = this.rootClip ? this.rootClip._playing : false;
      this._beginEventBudget();
      if (this._pressedInteractive) {
        const pressed = this._pressedInteractive;
        this._pressedInteractive = null;
        const stillOver = pressed._isMouseOver ||
          (typeof pressed._containsStagePoint === 'function' && pressed._containsStagePoint(this._mouseX, this._mouseY));
        if (stillOver && typeof pressed._fireReleaseFromStage === 'function') {
          pressed._fireReleaseFromStage();
        } else if (!stillOver && typeof pressed._fireReleaseOutside === 'function') {
          pressed._fireReleaseOutside();
        }
      }
      this._broadcastClipEvent(this.rootClip, CE_MOUSE_UP, 'onMouseUp');
      for (let i = 0; i < this._mouseListeners.length; i++) {
        if (this._isOverBudget()) break;
        this._invokeListenerMethod(this._mouseListeners[i], 'onMouseUp', EMPTY_ARR, true);
      }
      this._postInteractionCommit(prevFrame, prevPlaying);
    }

    triggerMouseWheel(delta) {
      const d = Number(delta) || 0;
      if (!d) return;
      this._beginEventBudget();
      for (let i = 0; i < this._mouseListeners.length; i++) {
        if (this._isOverBudget()) break;
        this._invokeListenerMethod(this._mouseListeners[i], 'onMouseWheel', [d, null], false);
      }
    }

    triggerKeyDown(flashKeyCode, ascii) {
      const kc = Number(flashKeyCode) | 0;
      const prevFrame = this.rootClip ? this.rootClip._currentframe : 1;
      const prevPlaying = this.rootClip ? this.rootClip._playing : false;
      this._keysDown.add(kc);
      this._lastKeyCode = kc;
      this._lastKeyAscii = ascii !== undefined ? ascii : kc;
      this._beginEventBudget();
      this._broadcastClipEvent(this.rootClip, CE_KEY_DOWN, 'onKeyDown');
      this._broadcastClipEvent(this.rootClip, CE_KEY_PRESS, null, kc);
      this._liveButtons.forEach((btn) => { if (!this._isOverBudget()) btn._fireKeyPress(kc); });
      for (let i = 0; i < this._keyListeners.length; i++) {
        if (this._isOverBudget()) break;
        this._invokeListenerMethod(this._keyListeners[i], 'onKeyDown', EMPTY_ARR, true);
      }
      this._postInteractionCommit(prevFrame, prevPlaying);
    }

    triggerKeyUp(flashKeyCode) {
      const kc = Number(flashKeyCode) | 0;
      this._keysDown.delete(kc);
      this._lastKeyCode = kc;
      this._beginEventBudget();
      this._broadcastClipEvent(this.rootClip, CE_KEY_UP, 'onKeyUp');
      for (let i = 0; i < this._keyListeners.length; i++) {
        if (this._isOverBudget()) break;
        this._invokeListenerMethod(this._keyListeners[i], 'onKeyUp', EMPTY_ARR, true);
      }
    }

    _broadcastClipEvent(clip, flagMask, handlerProp, keyCode) {
      if (!clip || clip._removed || this._isOverBudget()) return;
      clip._fireClipEvents(flagMask, keyCode);
      if (clip._removed || this._isOverBudget()) return;
      if (handlerProp) {
        const fn = clip._getEventHandler(handlerProp);
        if (typeof fn === 'function') {
          this._invokeValue(fn, clip, EMPTY_ARR);
        }
      }
      if (clip._childrenByDepth.size === 0) return;
      const kids = clip._getChildrenSnapshot();
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
      const parentInv = mc._parent ? invertMatInto(_invMatScratch, mc._parent.getWorldMatrix()) : IDENTITY_MAT;
      let nx = parentInv[0] * this._mouseX + parentInv[2] * this._mouseY + parentInv[4] + (opts.offsetX || 0);
      let ny = parentInv[1] * this._mouseX + parentInv[3] * this._mouseY + parentInv[5] + (opts.offsetY || 0);
      if (opts.constrain) {
        nx = Math.max(opts.left, Math.min(opts.right, nx));
        ny = Math.max(opts.top, Math.min(opts.bottom, ny));
      }
      mc._x = nx;
      mc._y = ny;
      mc._scriptModifiedTransform = true;
      mc.commitSvg();
      mc._droptarget = this._computeDropTarget(mc);
    }

    _collectEditableTextFields(clip, out) {
      if (!clip || clip._removed || !clip._visible) return;
      if (!clip._childrenByDepth || clip._childrenByDepth.size === 0) return;
      const entries = Array.from(clip._childrenByDepth.entries()).sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < entries.length; i++) {
        const obj = entries[i][1] && entries[i][1].obj;
        if (!obj || !obj._visible) continue;
        if (obj._isTextField && obj._editable) {
          const pMat = clip.getWorldMatrix();
          const pt = applyMatPt(pMat, (obj._x || 0) + (obj.def.x || 0), (obj._y || 0) + (obj.def.y || 0));
          out.push({ tf: obj, x: pt.x, y: pt.y });
        } else if (obj._isMovieClip) {
          this._collectEditableTextFields(obj, out);
        }
      }
    }

    _cycleEditableTextFocus(dir) {
      if (!this.rootClip || !this._global || !this._global.Selection) return false;
      const list = [];
      this._collectEditableTextFields(this.rootClip, list);
      if (list.length === 0) return false;
      list.sort((a, b) => {
        const ta = typeof a.tf.tabIndex === 'number' ? a.tf.tabIndex : Infinity;
        const tb = typeof b.tf.tabIndex === 'number' ? b.tf.tabIndex : Infinity;
        if (ta !== tb) return ta - tb;
        if (Math.abs(a.y - b.y) > 8) return a.y - b.y;
        return a.x - b.x;
      });
      const curIdx = list.findIndex((it) => it.tf === this._focusedTarget);
      let nextIdx;
      if (curIdx === -1) {
        nextIdx = dir < 0 ? list.length - 1 : 0;
      } else {
        nextIdx = (curIdx + (dir < 0 ? -1 : 1) + list.length) % list.length;
      }
      this._global.Selection.setFocus(list[nextIdx].tf);
      return true;
    }

    _computeDropTarget(draggedClip) {
      if (!draggedClip || !this.rootClip) return '';
      const mx = this._mouseX;
      const my = this._mouseY;
      const walkTopDown = (clip) => {
        if (!clip || clip._removed || !clip._visible || clip === draggedClip) return null;
        if (clip._childrenByDepth && clip._childrenByDepth.size > 0) {
          const entries = Array.from(clip._childrenByDepth.entries()).sort((a, b) => b[0] - a[0]);
          for (let i = 0; i < entries.length; i++) {
            const slot = entries[i][1];
            if (!slot || !slot.obj) continue;
            if (slot.obj._isMovieClip) {
              const hit = walkTopDown(slot.obj);
              if (hit) return hit;
            }
          }
        }
        if (clip !== this.rootClip && clip.hitTest(mx, my, true)) {
          return clip;
        }
        return null;
      };
      const hitClip = walkTopDown(this.rootClip);
      return hitClip ? hitClip.getTargetPath() : '';
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
      if (this._dragClip && !this._dragClip._removed) {
        this._dragClip._droptarget = this._computeDropTarget(this._dragClip);
      }
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
        const dbgEnabled = _isSwfDebugEnabled();
        while (this._frameAcc >= this.frameStepSec - 1e-5 && steps < 2) {
          if (this._isOverBudget()) {
            this._frameAcc = 0;
            break;
          }
          this._frameAcc -= this.frameStepSec;
          this._tickCount++;
          if (dbgEnabled) {
            this._dbgActiveThisTick = true;
            this._tickSvgRenderMs = 0;
            const t0 = _nowMs();
            this.rootClip.stepFrame();
            const totalMs = _nowMs() - t0;
            this._dbgActiveThisTick = false;
            this._recordDbgFrameTiming(totalMs, this._tickSvgRenderMs);
          } else {
            this.rootClip.stepFrame();
          }
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

        this._syncTelemetry(false);
      } catch (err) {
        this._dbgActiveThisTick = false;
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
      if (_isSwfDebugEnabled()) {
        this._dbgActiveThisTick = true;
        this._tickSvgRenderMs = 0;
        const t0 = _nowMs();
        this.rootClip.stepFrame();
        const totalMs = _nowMs() - t0;
        this._dbgActiveThisTick = false;
        this._recordDbgFrameTiming(totalMs, this._tickSvgRenderMs);
      } else {
        this.rootClip.stepFrame();
      }
      this._syncTelemetry(true);
    }

    _recordDbgFrameTiming(totalMs, svgMs) {
      const safeSvg = Math.max(0, Math.min(totalMs, svgMs));
      const avm1Ms = Math.max(0, totalMs - safeSvg);
      this._dbgAvm1MsBuf[this._dbgBufIdx] = avm1Ms;
      this._dbgSvgMsBuf[this._dbgBufIdx] = safeSvg;
      this._dbgBufIdx = (this._dbgBufIdx + 1) % 60;
      if (this._dbgBufCount < 60) this._dbgBufCount++;
      this._dbgActiveDynamicNodes = _countSubtreeElements(this._dynamicLayerEl || (this.rootClip && this.rootClip.svgEl));
    }

    _recordDbgNanFault(obj, varName) {
      if (!_isSwfDebugEnabled()) return;
      const targetPath = (obj && typeof obj.getTargetPath === 'function')
        ? obj.getTargetPath()
        : (obj && obj._name ? `/${obj._name}` : '/');
      const variable = String(varName || '');
      const key = `${targetPath}::${variable}`;
      if (!this._dbgNanMap.has(key)) {
        this._dbgNanMap.set(key, { targetPath, variable });
      }
    }

    getDebugReport() {
      const n = this._dbgBufCount;
      let sumAvm1 = 0;
      let sumSvg = 0;
      for (let i = 0; i < n; i++) {
        sumAvm1 += this._dbgAvm1MsBuf[i];
        sumSvg += this._dbgSvgMsBuf[i];
      }
      const round3 = (v) => Math.round(v * 1000) / 1000;
      const sharedImport = _getSwfDebugSharedState().importSummary || {};
      const totalTagsParsed = this._dbgImportSummary.totalTagsParsed || sharedImport.totalTagsParsed || 0;
      const cachedDefsShapes = Math.max(
        this._shapeDefsMap.size,
        this._dbgImportSummary.cachedDefsShapes || 0,
        sharedImport.cachedDefsShapes || 0
      );
      const skippedTagIds = this._dbgImportSummary.skippedTagIds.length > 0
        ? this._dbgImportSummary.skippedTagIds.slice()
        : (Array.isArray(sharedImport.skippedTagIds) ? sharedImport.skippedTagIds.slice() : []);
      return {
        enabled: _isSwfDebugEnabled(),
        importSummary: {
          totalTagsParsed,
          cachedDefsShapes,
          skippedTagIds,
        },
        avm1Faults: {
          unhandledOpcodes: Array.from(this._dbgUnhandledOpcodes).sort(),
          nanProperties: Array.from(this._dbgNanMap.values()),
        },
        frameTiming: {
          sampleCount: n,
          avgAvm1ExecMs: n > 0 ? round3(sumAvm1 / n) : 0,
          avgSvgRenderMs: n > 0 ? round3(sumSvg / n) : 0,
          activeDynamicDomNodes: this._dbgActiveDynamicNodes || _countSubtreeElements(this._dynamicLayerEl || (this.rootClip && this.rootClip.svgEl)),
        },
      };
    }

    _syncTelemetry(force = false) {
      if (!this.engine || !this.engine.vars) return;
      if (!force) {
        const now = _nowMs();
        if (now - this._lastTelemetrySyncMs < 100) return;
        this._lastTelemetrySyncMs = now;
      } else {
        this._lastTelemetrySyncMs = _nowMs();
      }
      this.engine.vars.swf_frame = this.rootClip._currentframe;
      this.engine.vars.swf_playing = this.rootClip._playing ? 1 : 0;
      this.engine.vars.swf_totalframes = this.rootClip._totalframes;
      this.engine.vars.swf_framesloaded = this.rootClip._totalframes;
      this.engine.vars.swf_tick = this._tickCount;
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
      this._soundLog.length = 0;
      this.rootClip = new AVM1MovieClip(
        this,
        0,
        {
          fc: this.program.fc || 1,
          l: this.program.l || [],
          fr: this.program.fr || [[]],
          ac: this.program.ac || [],
          sf: this.program.sf || [],
        },
        null,
        0,
        '',
        []
      );
      if (container) this.mount(container, stageSvg);
    }

    /**
     * Captures a sanitized, visible-only pure W3C SVG snapshot + live metadata from the running AVM1 stage
     * for Hybrid "Run-to-Convert" distillation into a bytecode-free native AST cartridge.
     */
    captureDistillationSnapshot(opts = {}) {
      const maxNodes = Math.max(40, Math.min(1200, Number(opts.maxNodes) || 450));
      const maxChars = Math.max(4096, Math.min(120000, Number(opts.maxChars) || 56000));
      const allowedTags = new Set(['g', 'path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'text', 'tspan']);
      const allowedAttrs = new Set([
        'd', 'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap',
        'stroke-linejoin', 'stroke-opacity', 'opacity', 'transform', 'x', 'y', 'dx', 'dy',
        'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2', 'points',
        'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'letter-spacing'
      ]);

      const escXml = (s) => String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const observedTexts = [];
      const textSeen = new Set();
      let nodeCount = 0;
      let pathCount = 0;
      let charCount = 0;
      let truncated = false;

      const serializeNode = (el, depth) => {
        if (!el || depth > 20 || nodeCount >= maxNodes || charCount >= maxChars) {
          if (nodeCount >= maxNodes || charCount >= maxChars) truncated = true;
          return '';
        }
        const rawTag = (el.tagName || el.nodeName || '').toLowerCase();
        if (rawTag === 'use') {
          const targetDef = this._resolveShapeUseTarget(el);
          if (!targetDef) return '';
          return serializeNode(targetDef, depth + 1);
        }
        if (!rawTag || !allowedTags.has(rawTag)) return '';

        const getAttr = (k) => (typeof el.getAttribute === 'function' ? el.getAttribute(k) : (el.attrs ? el.attrs[k] : null));
        if (getAttr('data-avm1-hit') === '1') return '';
        const disp = String(getAttr('display') || '').toLowerCase();
        const vis = String(getAttr('visibility') || '').toLowerCase();
        const opAttr = getAttr('opacity');
        if (disp === 'none' || vis === 'hidden') return '';
        if (opAttr !== null && opAttr !== '' && Number(opAttr) <= 0.001) return '';

        let attrsOut = '';
        if (el.attributes && typeof el.attributes.length === 'number') {
          for (let i = 0; i < el.attributes.length; i++) {
            const a = el.attributes[i];
            if (!a || !a.name) continue;
            const name = a.name.toLowerCase();
            if (!allowedAttrs.has(name)) continue;
            const val = String(a.value || '');
            if (!val) continue;
            if (name === 'opacity' && val === '1') continue;
            if (name === 'transform' && (val === 'matrix(1 0 0 1 0 0)' || val === 'translate(0, 0)')) continue;
            attrsOut += ` ${name}="${escXml(val)}"`;
          }
        } else if (el.attrs && typeof el.attrs === 'object') {
          const keys = Object.keys(el.attrs);
          for (let i = 0; i < keys.length; i++) {
            const name = keys[i].toLowerCase();
            if (!allowedAttrs.has(name)) continue;
            const val = String(el.attrs[keys[i]] || '');
            if (!val) continue;
            if (name === 'opacity' && val === '1') continue;
            if (name === 'transform' && (val === 'matrix(1 0 0 1 0 0)' || val === 'translate(0, 0)')) continue;
            attrsOut += ` ${name}="${escXml(val)}"`;
          }
        }

        if (rawTag === 'text' || rawTag === 'tspan') {
          const txt = String(el.textContent || '').replace(/\s+/g, ' ').trim();
          if (!txt) return '';
          if (rawTag === 'text' && txt.length <= 160 && !textSeen.has(txt) && observedTexts.length < 24) {
            textSeen.add(txt);
            observedTexts.push(txt);
          }
          nodeCount++;
          const chunk = `<${rawTag}${attrsOut}>${escXml(txt)}</${rawTag}>`;
          charCount += chunk.length;
          return chunk;
        }

        if (rawTag === 'g') {
          const kids = el.children || el.childNodes || [];
          let inner = '';
          for (let i = 0; i < kids.length; i++) {
            const child = kids[i];
            if (!child || (child.nodeType !== undefined && child.nodeType !== 1)) continue;
            inner += serializeNode(child, depth + 1);
            if (nodeCount >= maxNodes || charCount >= maxChars) break;
          }
          if (!inner) return '';
          if (!attrsOut) return inner;
          nodeCount++;
          const chunk = `<g${attrsOut}>${inner}</g>`;
          charCount += chunk.length;
          return chunk;
        }

        nodeCount++;
        if (rawTag === 'path') pathCount++;
        const chunk = `<${rawTag}${attrsOut}/>`;
        charCount += chunk.length;
        return chunk;
      };

      const svgMarkup = this.rootClip && this.rootClip.svgEl
        ? serializeNode(this.rootClip.svgEl, 0)
        : '';

      // Extract visible interactive buttons with approximate stage coordinates
      const observedButtons = [];
      let btnIdx = 0;
      this._liveButtons.forEach((btn) => {
        if (!btn || btn._removed || !btn._visible || observedButtons.length >= 12) return;
        let x = Number(btn._x) || 0;
        let y = Number(btn._y) || 0;
        let width = 110;
        let height = 38;
        try {
          if (btn.svgEl && typeof btn.svgEl.getBBox === 'function') {
            const bb = btn.svgEl.getBBox();
            if (bb && Number.isFinite(bb.width) && bb.width > 2 && bb.height > 2) {
              const wm = btn._parent ? btn._parent.getWorldMatrix() : [1, 0, 0, 1, 0, 0];
              const pt = applyMatPt(wm, (Number(btn._x) || 0) + bb.x, (Number(btn._y) || 0) + bb.y);
              x = Math.round(pt.x);
              y = Math.round(pt.y);
              width = Math.round(Math.max(24, Math.min(this.stageWidth, bb.width)));
              height = Math.round(Math.max(20, Math.min(this.stageHeight, bb.height)));
            }
          }
        } catch (_) {}

        let btnText = '';
        try {
          btnText = String((btn._upGroup && btn._upGroup.textContent) || (btn.svgEl && btn.svgEl.textContent) || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 60);
        } catch (_) {}

        btnIdx++;
        const label = btnText || (btn._name ? String(btn._name).replace(/[_-]+/g, ' ') : `Interactive Button ${btnIdx}`);
        observedButtons.push({
          id: `btn_${btnIdx}`,
          name: btn._name || `button_${btnIdx}`,
          label,
          charId: Number(btn.charId) || 0,
          x: Math.max(0, Math.min(this.stageWidth - 20, Math.round(x))),
          y: Math.max(0, Math.min(this.stageHeight - 20, Math.round(y))),
          width,
          height,
        });
      });

      // Extract primitive _root variables (excluding internal keys and functions)
      const observedVars = {};
      const rootVars = (this.rootClip && this.rootClip._vars) ? this.rootClip._vars : {};
      const varKeys = Object.keys(rootVars);
      let varCount = 0;
      for (let i = 0; i < varKeys.length && varCount < 16; i++) {
        const k = varKeys[i];
        if (!k || k.startsWith('_') || k.startsWith('on') || k === 'this' || k === 'super') continue;
        const v = rootVars[k];
        if (typeof v === 'number' && Number.isFinite(v)) {
          observedVars[k] = Math.round(v * 1000) / 1000;
          varCount++;
        } else if (typeof v === 'string' && v.length <= 64) {
          observedVars[k] = v;
          varCount++;
        } else if (typeof v === 'boolean') {
          observedVars[k] = v ? 1 : 0;
          varCount++;
        }
      }

      const frameNumber = this.rootClip ? (this.rootClip._currentframe || 1) : 1;
      const totalFrames = this.rootClip ? (this.rootClip._totalframes || 1) : 1;
      let frameLabel = '';
      if (this.rootClip && this.rootClip._labelMap) {
        this.rootClip._labelMap.forEach((fNum, name) => {
          if (fNum === frameNumber && !frameLabel) frameLabel = name;
        });
      }

      // Lightweight visual fingerprint for deduplication across states
      const sample = svgMarkup.length > 512
        ? (svgMarkup.slice(0, 256) + '|' + svgMarkup.slice(svgMarkup.length - 256))
        : svgMarkup;
      let hash = 2166136261;
      const sigStr = `${frameNumber}|${pathCount}|${nodeCount}|${svgMarkup.length}|${observedTexts.join(';')}|${sample}`;
      for (let i = 0; i < sigStr.length; i++) {
        hash ^= sigStr.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }

      return {
        frameNumber,
        totalFrames,
        frameLabel,
        width: this.stageWidth,
        height: this.stageHeight,
        bg: this.program.bg || '#0f172a',
        svgMarkup,
        nodeCount,
        pathCount,
        truncated,
        observedTexts,
        observedButtons,
        observedVars,
        fingerprint: (hash >>> 0).toString(36),
      };
    }

    /**
     * Bounded automated sweep across labeled frames and distinct timeline keyframes.
     * Strictly time-budgeted so complex SWFs can never hang the browser.
     */
    sweepDistillationStates(opts = {}) {
      const maxStates = Math.max(2, Math.min(16, Number(opts.maxStates) || 10));
      const budgetMs = Math.max(150, Math.min(2000, Number(opts.budgetMs) || 900));
      const startMs = _nowMs();
      const snapshots = [];
      const seenFingerprints = new Set();

      const addSnap = (snap) => {
        if (!snap || !snap.svgMarkup || snap.nodeCount === 0) return false;
        if (seenFingerprints.has(snap.fingerprint)) return false;
        seenFingerprints.add(snap.fingerprint);
        snapshots.push(snap);
        return true;
      };

      // Always capture current settled state first
      addSnap(this.captureDistillationSnapshot(opts));

      if (!this.rootClip || this.rootClip._totalframes <= 1) {
        // For single-frame procedural / Drawing-API simulations (e.g. Pendulum), step a few ticks to capture motion phases
        const phases = Math.min(4, maxStates - snapshots.length);
        for (let p = 0; p < phases; p++) {
          if (_nowMs() - startMs > budgetMs || snapshots.length >= maxStates) break;
          for (let s = 0; s < 6; s++) {
            this.stepOneSwfFrame();
          }
          addSnap(this.captureDistillationSnapshot(opts));
        }
        return snapshots;
      }

      const savedFrame = this.rootClip._currentframe || 1;
      const savedPlaying = Boolean(this.rootClip._playing);
      const total = this.rootClip._totalframes || 1;
      const entryFrame = Math.max(1, Math.min(total, Number(this.program.ef) || 1));

      // Candidate frames: labeled frames first, then evenly spaced samples across [entryFrame..total]
      const candidates = [];
      const seenCand = new Set([savedFrame]);
      if (this.rootClip._labelMap) {
        this.rootClip._labelMap.forEach((fNum) => {
          const n = Math.max(entryFrame, Math.min(total, Number(fNum) || 1));
          if (!seenCand.has(n)) {
            seenCand.add(n);
            candidates.push(n);
          }
        });
      }
      const span = Math.max(1, total - entryFrame);
      const sampleCount = Math.min(total, maxStates * 2);
      for (let i = 0; i < sampleCount; i++) {
        const f = entryFrame + Math.round((i / Math.max(1, sampleCount - 1)) * span);
        if (!seenCand.has(f)) {
          seenCand.add(f);
          candidates.push(f);
        }
      }
      candidates.sort((a, b) => a - b);

      for (let i = 0; i < candidates.length; i++) {
        if (_nowMs() - startMs > budgetMs || snapshots.length >= maxStates) break;
        const targetFrame = candidates[i];
        try {
          this._beginTickBudget(BOOT_OPS_BUDGET, 60);
          this.rootClip.gotoAndStop(targetFrame);
          this.rootClip.commitSvg();
          addSnap(this.captureDistillationSnapshot(opts));
        } catch (_) {}
      }

      // Restore root timeline cleanly
      try {
        this._beginTickBudget(BOOT_OPS_BUDGET, 60);
        if (savedPlaying) this.rootClip.gotoAndPlay(savedFrame);
        else this.rootClip.gotoAndStop(savedFrame);
        this.rootClip.commitSvg();
        this._syncTelemetry();
      } catch (_) {}

      return snapshots;
    }

    destroy(keepCaches = false) {
      this._mounted = false;
      this.stopAllSounds();
      this._intervals.clear();
      this._dragClip = null;
      this._pressedInteractive = null;
      this._focusedTarget = null;
      if (this._fxFilterCache) this._fxFilterCache.clear();
      if (this._boundGestureBus && this._inputSinkId && typeof this._boundGestureBus.unregisterMediaInputSink === 'function') {
        this._boundGestureBus.unregisterMediaInputSink(this._inputSinkId);
        this._boundGestureBus = null;
      }
      const target = this.stageSvg || this.container;
      const win = typeof window !== 'undefined' ? window : null;
      if (this._standaloneListenersBound) {
        if (target && typeof target.removeEventListener === 'function') {
          if (this._onPointerMove) target.removeEventListener('pointermove', this._onPointerMove);
          if (this._onPointerDown) target.removeEventListener('pointerdown', this._onPointerDown);
          if (this._onWheel) target.removeEventListener('wheel', this._onWheel);
        }
        if (win && typeof win.removeEventListener === 'function') {
          if (this._onPointerUp) win.removeEventListener('pointerup', this._onPointerUp);
          if (this._onWindowBlur) {
            win.removeEventListener('pointercancel', this._onWindowBlur);
            win.removeEventListener('blur', this._onWindowBlur);
          }
          if (this._onKeyDown) win.removeEventListener('keydown', this._onKeyDown);
          if (this._onKeyUp) win.removeEventListener('keyup', this._onKeyUp);
        }
        this._standaloneListenersBound = false;
      }
      if (this.rootClip) this.rootClip.destroy();
      this._liveButtons.clear();
      this._shapeDefsMap.clear();
      this._targetPathCache.clear();
      if (_getSwfDebugSharedState().activeRuntime === this) {
        _getSwfDebugSharedState().activeRuntime = null;
      }
      if (!keepCaches) {
        this._shapeTemplateCache.clear();
        this._decodedCache.clear();
        this._traces.length = 0;
        this._execFramePool.length = 0;
        this._regsPool.length = 0;
        this._reconcilePool.length = 0;
        this._argsPool.length = 0;
        this._reorderScratch.length = 0;
      }
    }

    // =========================================================================
    // AVM1 Value Coercion & Object / MovieClip Property Access
    // =========================================================================

    _toNum(v) {
      return toAvm1Number(v);
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

      const base = baseClip || this.rootClip;
      const cacheKey = `${base ? base._uid : 0}|${s}`;
      const cached = this._targetPathCache.get(cacheKey);
      if (cached && cached.v === this._treeVersion) {
        return cached.res;
      }

      // Normalize slash paths (/a/b, ../foo) and dot paths (_root.a.b)
      let cur = base;
      let work = s;
      if (work.startsWith('/')) {
        cur = this.rootClip;
        work = work.slice(1);
      }
      const parts = work.split(/[./]+/).filter(Boolean);
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
      if (cur && (cur._isMovieClip || cur._isTextField || cur._isButton)) {
        if (this._targetPathCache.size >= 512) this._targetPathCache.clear();
        this._targetPathCache.set(cacheKey, { v: this._treeVersion, res: cur });
      }
      return cur;
    }

    _hasVariablePath(varName, baseClip) {
      const s = String(varName || '');
      if (!s) return false;
      const checkOnClip = (obj, prop) => {
        if (!obj || typeof obj !== 'object') return false;
        const bag = obj._isMovieClip ? obj._vars : obj;
        if (!bag) return false;
        if (prop in bag) return true;
        if (this.caseInsensitive) {
          const pl = prop.toLowerCase();
          for (const k in bag) {
            if (k.toLowerCase() === pl) return true;
          }
        }
        return false;
      };
      const colonIdx = s.indexOf(':');
      if (colonIdx !== -1) {
        const target = this._resolveTargetPath(s.slice(0, colonIdx) || '/', baseClip);
        return checkOnClip(target, s.slice(colonIdx + 1));
      }
      if (s.includes('.')) {
        const parts = s.split('.');
        let cur = this._getVariable(parts[0], baseClip, null, null);
        for (let i = 1; i < parts.length - 1; i++) {
          if (cur == null) return false;
          cur = this._getMember(cur, parts[i]);
        }
        return checkOnClip(cur, parts[parts.length - 1]);
      }
      if (checkOnClip(baseClip, s)) return true;
      if (baseClip !== this.rootClip && checkOnClip(this.rootClip, s)) return true;
      return checkOnClip(this._global, s);
    }

    _resolveVariablePath(varName, baseClip, scopes = null, withStack = null, thisObj = null) {
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
        let cur = this._getVariable(parts[0], baseClip, scopes, withStack, thisObj);
        for (let i = 1; i < parts.length; i++) {
          if (cur == null) return undefined;
          cur = this._getMember(cur, parts[i]);
        }
        return cur;
      }
      return this._getVariable(s, baseClip, scopes, withStack, thisObj);
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
          const inv = invertMatInto(_invMatScratch, clip.getWorldMatrix());
          return inv[0] * this._mouseX + inv[2] * this._mouseY + inv[4];
        }
        case '_ymouse': {
          if (!clip._isMovieClip) return this._mouseY;
          const inv = invertMatInto(_invMatScratch, clip.getWorldMatrix());
          return inv[1] * this._mouseX + inv[3] * this._mouseY + inv[5];
        }
        case '_droptarget': return clip._isMovieClip ? (clip._droptarget || '') : '';
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
        case '_x': { const n = toAvm1Number(val); if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_x'); clip._x = n; clip._scriptModifiedTransform = true; clip.commitSvg(); return true; }
        case '_y': { const n = toAvm1Number(val); if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_y'); clip._y = n; clip._scriptModifiedTransform = true; clip.commitSvg(); return true; }
        case '_xscale': { const n = toAvm1Number(val); if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_xscale'); clip._xscale = n; clip._scriptModifiedTransform = true; clip.commitSvg(); return true; }
        case '_yscale': { const n = toAvm1Number(val); if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_yscale'); clip._yscale = n; clip._scriptModifiedTransform = true; clip.commitSvg(); return true; }
        case '_rotation': { const n = toAvm1Number(val); if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_rotation'); clip._rotation = n; clip._scriptModifiedTransform = true; clip.commitSvg(); return true; }
        case '_alpha': { const n = toAvm1Number(val); if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_alpha'); clip._alpha = n; clip._scriptModifiedAlpha = true; clip.commitSvg(); return true; }
        case '_visible': clip._visible = this._toBool(val); clip.commitSvg(); return true;
        case '_name': clip._name = this._toStr(val); this._treeVersion++; return true;
        case '_width': {
          if (clip._isMovieClip) {
            const bb = clip.getLocalBBox();
            if (bb.w > 0) {
              const n = toAvm1Number(val);
              if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_width');
              clip._xscale = (n / bb.w) * 100;
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
              const n = toAvm1Number(val);
              if (Number.isNaN(n)) this._recordDbgNanFault(clip, '_height');
              clip._yscale = (n / bb.h) * 100;
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
        case 'setMask': return (m) => clip.setMask(m);
        default: return undefined;
      }
    }

    _getMember(obj, propName) {
      if (obj === null || obj === undefined) return undefined;
      const key = String(propName);

      if (obj._isMovieClip) {
        if (key === '__proto__' || (this.caseInsensitive && key.toLowerCase() === '__proto__')) {
          return obj._proto || this._mcProto;
        }
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
            'moveTo', 'lineTo', 'curveTo', 'setMask'
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
      if (typeof val === 'number' && Number.isNaN(val)) {
        this._recordDbgNanFault(obj, key);
      }

      if (obj._isMovieClip) {
        const kl = key.toLowerCase();
        if (kl === '__proto__') {
          obj._proto = (val && typeof val === 'object') ? val : null;
          if (obj._hasInteractiveHandler()) obj._ensurePointerListeners();
          return;
        }
        if (key.startsWith('_') && this._setClipProp(obj, key, val)) return;
        if (kl === 'enabled') {
          obj.enabled = this._toBool(val);
          obj._syncPointerEvents();
          return;
        }
        if (kl === 'usehandcursor') {
          obj.useHandCursor = this._toBool(val);
          obj._syncPointerEvents();
          return;
        }
        const isPtrHandler = (
          kl === 'onpress' ||
          kl === 'onrelease' ||
          kl === 'onreleaseoutside' ||
          kl === 'onrollover' ||
          kl === 'onrollout' ||
          kl === 'ondragover' ||
          kl === 'ondragout'
        );
        if (this.caseInsensitive) {
          for (const k in obj._vars) {
            if (k.toLowerCase() === kl) {
              obj._vars[k] = val;
              if (isPtrHandler) obj._ensurePointerListeners();
              return;
            }
          }
        }
        obj._vars[key] = val;
        if (isPtrHandler) {
          obj._ensurePointerListeners();
        }
        return;
      }

      if (obj._isTextField || obj._isButton) {
        if (key.startsWith('_') && this._setClipProp(obj, key, val)) return;
        if (obj._isButton) {
          const kl = key.toLowerCase();
          if (kl === 'enabled') {
            obj.enabled = this._toBool(val);
            obj.commitSvg();
            return;
          }
          const btnCanonical = {
            onpress: 'onPress',
            onrelease: 'onRelease',
            onreleaseoutside: 'onReleaseOutside',
            onrollover: 'onRollOver',
            onrollout: 'onRollOut',
            ondragover: 'onDragOver',
            ondragout: 'onDragOut',
          }[kl];
          if (btnCanonical) {
            obj[btnCanonical] = val;
            return;
          }
        }
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

    _resolveVariableWithReceiver(name, targetClip, scopes, withStack, thisObj) {
      const key = String(name || '');
      const fallbackReceiver = targetClip || this.rootClip;
      if (!key) return { value: undefined, receiver: fallbackReceiver };

      if (key.includes(':')) {
        return { value: this._resolveVariablePath(key, targetClip, scopes, withStack, thisObj), receiver: fallbackReceiver };
      }

      const kl = key.toLowerCase();
      if (kl === '_root' || kl === '_level0') return { value: this.rootClip, receiver: fallbackReceiver };
      if (kl === '_global') return { value: this._global, receiver: fallbackReceiver };
      if (kl === 'this') return { value: (thisObj !== undefined && thisObj !== null) ? thisObj : targetClip, receiver: fallbackReceiver };
      if (kl === '_parent') return { value: targetClip ? targetClip._parent : undefined, receiver: fallbackReceiver };

      // 1. With stack (innermost first)
      if (withStack && withStack.length > 0) {
        for (let i = withStack.length - 1; i >= 0; i--) {
          const wObj = withStack[i];
          const v = this._getMember(wObj, key);
          if (v !== undefined) return { value: v, receiver: wObj };
        }
      }

      // 2. Local lexical scope chain (innermost first)
      if (scopes && scopes.length > 0) {
        for (let i = scopes.length - 1; i >= 0; i--) {
          const sc = scopes[i];
          if (key in sc) return { value: sc[key], receiver: thisObj || fallbackReceiver };
          if (this.caseInsensitive) {
            for (const k in sc) {
              if (k.toLowerCase() === kl) return { value: sc[k], receiver: thisObj || fallbackReceiver };
            }
          }
        }
      }

      // 3. Active non-MovieClip thisObj members (AS2 class/listener methods)
      if (thisObj && thisObj !== targetClip && typeof thisObj === 'object') {
        const tv = this._getMember(thisObj, key);
        if (tv !== undefined) return { value: tv, receiver: thisObj };
      }

      // 4. Target clip vars, children, special props, methods
      if (targetClip) {
        const v = this._getMember(targetClip, key);
        if (v !== undefined) return { value: v, receiver: targetClip };
      }

      // 5. _root (if different from targetClip)
      if (targetClip !== this.rootClip) {
        const rv = this._getMember(this.rootClip, key);
        if (rv !== undefined) return { value: rv, receiver: this.rootClip };
      }

      // 6. _global built-ins
      if (key in this._global) return { value: this._global[key], receiver: thisObj || fallbackReceiver };
      if (this.caseInsensitive) {
        for (const k in this._global) {
          if (k.toLowerCase() === kl) return { value: this._global[k], receiver: thisObj || fallbackReceiver };
        }
      }

      // 7. Fallback for dot-path variable names (e.g. "_root.preloader.pct")
      if (key.includes('.')) {
        return { value: this._resolveVariablePath(key, targetClip, scopes, withStack, thisObj), receiver: fallbackReceiver };
      }

      return { value: undefined, receiver: fallbackReceiver };
    }

    _getVariable(name, targetClip, scopes, withStack, thisObj) {
      return this._resolveVariableWithReceiver(name, targetClip, scopes, withStack, thisObj).value;
    }

    _setVariable(name, val, targetClip, scopes, withStack, thisObj) {
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

      // Handle dot paths ("_root.answer", "_parent.score", "quiz.ans")
      if (key.includes('.')) {
        const parts = key.split('.');
        let cur = this._getVariable(parts[0], targetClip, scopes, withStack, thisObj);
        for (let i = 1; i < parts.length - 1; i++) {
          if (cur == null) return;
          cur = this._getMember(cur, parts[i]);
        }
        if (cur && typeof cur === 'object') {
          this._setMember(cur, parts[parts.length - 1], val);
          return;
        }
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
            if (typeof val === 'number' && isNaN(val) && _isSwfDebugEnabled()) {
              this._recordDebugNaN(targetClip, key);
            }
            sc[key] = val;
            return;
          }
          if (this.caseInsensitive) {
            for (const k in sc) {
              if (k.toLowerCase() === kl) {
                if (typeof val === 'number' && isNaN(val) && _isSwfDebugEnabled()) {
                  this._recordDebugNaN(targetClip, k);
                }
                sc[k] = val;
                return;
              }
            }
          }
        }
      }

      // 3. If variable already exists on active non-MovieClip thisObj (AS2 class instance), update it there
      if (thisObj && thisObj !== targetClip && typeof thisObj === 'object' && this._getMember(thisObj, key) !== undefined) {
        this._setMember(thisObj, key, val);
        return;
      }

      // 4. Otherwise set on active target clip (if valid; null means tellTarget missed so safely no-op)
      if (targetClip === null) return;
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

    _acquireRegs(minLen) {
      const pool = this._regsPool;
      let regs = pool.length > 0 ? pool.pop() : new Array(minLen);
      if (regs.length < minLen) regs.length = minLen;
      return regs;
    }

    _releaseRegs(regs) {
      if (!regs) return;
      for (let i = 0; i < regs.length; i++) regs[i] = undefined;
      if (regs.length <= 32 && this._regsPool.length < 64) {
        this._regsPool.push(regs);
      }
    }

    _callAvm1Function(fn, thisObj, args) {
      const targetClip = (thisObj && thisObj._isMovieClip)
        ? thisObj
        : (thisObj && thisObj._isButton && thisObj._parent)
        ? thisObj._parent
        : (fn._defClip || this.rootClip);
      const localScope = Object.create(null);
      const regLen = Math.max(4, fn._regCount || 4);
      const regs = this._acquireRegs(regLen);

      const needArgsObj = !fn._isFn2 || fn._preloadArguments || !fn._suppressArguments;
      let argsObj = null;
      if (needArgsObj) {
        argsObj = args.length > 0 ? args.slice() : [];
        argsObj.callee = fn;
      }

      if (fn._isFn2) {
        let r = 1;
        if (fn._preloadThis) regs[r++] = thisObj;
        else if (!fn._suppressThis) localScope.this = thisObj;
        if (fn._preloadArguments) regs[r++] = argsObj;
        else if (!fn._suppressArguments) localScope.arguments = argsObj;
        if (fn._preloadSuper) {
          regs[r++] = (thisObj && typeof thisObj === 'object')
            ? (thisObj._isMovieClip ? (thisObj._proto || this._mcProto) : Object.getPrototypeOf(thisObj))
            : undefined;
        }
        if (fn._preloadRoot) regs[r++] = this.rootClip;
        if (fn._preloadParent) regs[r++] = targetClip ? targetClip._parent : undefined;
        if (fn._preloadGlobal) regs[r++] = this._global;

        const params = fn._params;
        for (let i = 0; i < params.length; i++) {
          const p = params[i];
          const val = i < args.length ? args[i] : undefined;
          if (p.reg > 0) regs[p.reg] = val;
          else if (p.name) localScope[p.name] = val;
        }
      } else {
        localScope.arguments = argsObj;
        const params = fn._params;
        for (let i = 0; i < params.length; i++) {
          const pName = params[i];
          if (pName) localScope[pName] = i < args.length ? args[i] : undefined;
        }
      }

      const cScopes = fn._closureScopes;
      let nextScopes;
      if (!cScopes || cScopes.length === 0) {
        nextScopes = [localScope];
      } else {
        nextScopes = new Array(cScopes.length + 1);
        for (let i = 0; i < cScopes.length; i++) nextScopes[i] = cScopes[i];
        nextScopes[cScopes.length] = localScope;
      }
      try {
        return this._runDecoded(
          fn._bodyDecoded,
          targetClip,
          thisObj || targetClip,
          nextScopes,
          regs,
          fn._constPool || EMPTY_ARR
        );
      } finally {
        this._releaseRegs(regs);
      }
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
      const regs = this._acquireRegs(4);
      const tgt = targetClip || this.rootClip;
      try {
        return this._runDecoded(decoded, tgt, tgt, EMPTY_ARR, regs, EMPTY_ARR);
      } finally {
        this._releaseRegs(regs);
      }
    }

    _runDecoded(decoded, initialTarget, thisObj, scopes, regs, initialConstPool) {
      const { bytes, instrs, offsetToIdx } = decoded;
      const fPool = this._execFramePool;
      const frame = fPool.length > 0 ? fPool.pop() : { stack: [], withStack: [], withEndOffsets: [] };
      const stack = frame.stack;
      const withStack = frame.withStack;
      const withEndOffsets = frame.withEndOffsets;
      let constPool = initialConstPool || EMPTY_ARR;
      let curTarget = initialTarget || this.rootClip;
      let pc = 0;
      let ops = 0;
      const total = instrs.length;

      try {
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
            break;
          case 0x09: // ActionStopSounds
            this.stopAllSounds();
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
            if (!tName) {
              curTarget = initialTarget;
            } else {
              const resolved = this._resolveTargetPath(tName, curTarget || initialTarget);
              curTarget = (resolved && resolved._isMovieClip) ? resolved : null;
            }
            break;
          }
          case 0x20: { // ActionSetTarget2
            const tVal = stack.pop();
            const tName = this._toStr(tVal);
            if (!tName) {
              curTarget = initialTarget;
            } else {
              const resolved = this._resolveTargetPath(tName, curTarget || initialTarget);
              curTarget = (resolved && resolved._isMovieClip) ? resolved : null;
            }
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

          // --- Stack & Constants (memoized per instruction to eliminate per-tick re-parsing) ---
          case 0x88: { // ActionConstantPool
            let pool = ins._constPool;
            if (!pool) {
              const count = readUI16(bytes, ins.pStart);
              let p = ins.pStart + 2;
              pool = new Array(count);
              for (let i = 0; i < count && p < ins.pEnd; i++) {
                const r = readCString(bytes, p, ins.pEnd);
                pool[i] = r.value;
                p = r.next;
              }
              ins._constPool = pool;
            }
            constPool = pool;
            break;
          }
          case 0x96: { // ActionPush
            let items = ins._pushItems;
            if (!items) {
              items = [];
              let p = ins.pStart;
              while (p < ins.pEnd) {
                const t = bytes[p++];
                if (t === 0) {
                  const r = readCString(bytes, p, ins.pEnd);
                  items.push({ k: 0, v: r.value });
                  p = r.next;
                } else if (t === 1) {
                  items.push({ k: 0, v: readFloat32(bytes, p) });
                  p += 4;
                } else if (t === 2) {
                  items.push({ k: 0, v: null });
                } else if (t === 3) {
                  items.push({ k: 0, v: undefined });
                } else if (t === 4) {
                  items.push({ k: 1, v: bytes[p++] });
                } else if (t === 5) {
                  items.push({ k: 0, v: bytes[p++] !== 0 });
                } else if (t === 6) {
                  items.push({ k: 0, v: readSwfDouble(bytes, p) });
                  p += 8;
                } else if (t === 7) {
                  items.push({ k: 0, v: readSI32(bytes, p) });
                  p += 4;
                } else if (t === 8) {
                  items.push({ k: 2, v: bytes[p++] });
                } else if (t === 9) {
                  items.push({ k: 2, v: readUI16(bytes, p) });
                  p += 2;
                } else {
                  break;
                }
              }
              ins._pushItems = items;
            }
            for (let i = 0; i < items.length; i++) {
              const it = items[i];
              if (it.k === 0) stack.push(it.v);
              else if (it.k === 1) stack.push(regs[it.v]);
              else stack.push(constPool[it.v] !== undefined ? constPool[it.v] : '');
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

          // --- Arithmetic, Comparison, Logic, Bitwise, String (Ruffle AVM1 toAvm1Number coercion) ---
          case 0x0A: { const a = toAvm1Number(stack.pop()); const b = toAvm1Number(stack.pop()); stack.push(b + a); break; }
          case 0x0B: { const a = toAvm1Number(stack.pop()); const b = toAvm1Number(stack.pop()); stack.push(b - a); break; }
          case 0x0C: { const a = toAvm1Number(stack.pop()); const b = toAvm1Number(stack.pop()); stack.push(b * a); break; }
          case 0x0D: { const a = toAvm1Number(stack.pop()); const b = toAvm1Number(stack.pop()); stack.push(a === 0 ? (b === 0 ? NaN : Infinity) : b / a); break; }
          case 0x3F: { const a = toAvm1Number(stack.pop()); const b = toAvm1Number(stack.pop()); stack.push(b % a); break; }
          case 0x0E: { const a = toAvm1Number(stack.pop()); const b = toAvm1Number(stack.pop()); stack.push(b === a); break; }
          case 0x0F: { const a = toAvm1Number(stack.pop()); const b = toAvm1Number(stack.pop()); stack.push(b < a); break; }
          case 0x10: { const a = this._toBool(stack.pop()); const b = this._toBool(stack.pop()); stack.push(b && a); break; }
          case 0x11: { const a = this._toBool(stack.pop()); const b = this._toBool(stack.pop()); stack.push(b || a); break; }
          case 0x12: { stack.push(!this._toBool(stack.pop())); break; }
          case 0x13: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b === a); break; }
          case 0x14:
          case 0x31: { stack.push(this._toStr(stack.pop()).length); break; }
          case 0x15:
          case 0x35: {
            const count = Math.max(0, Math.floor(toAvm1Number(stack.pop())));
            const idx = Math.max(1, Math.floor(toAvm1Number(stack.pop())));
            const s = this._toStr(stack.pop());
            stack.push(s.substr(idx - 1, count));
            break;
          }
          case 0x18: { stack.push(Math.trunc(toAvm1Number(stack.pop()))); break; }
          case 0x21: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b + a); break; }
          case 0x29: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b < a); break; }
          case 0x68: { const a = this._toStr(stack.pop()); const b = this._toStr(stack.pop()); stack.push(b > a); break; }
          case 0x30: { const max = Math.floor(toAvm1Number(stack.pop())); stack.push(max > 0 ? Math.floor(Math.random() * max) : 0); break; }
          case 0x32:
          case 0x36: { const s = this._toStr(stack.pop()); stack.push(s.length > 0 ? s.charCodeAt(0) : 0); break; }
          case 0x33:
          case 0x37: { stack.push(String.fromCharCode(toAvm1Number(stack.pop()) & 0xffff)); break; }
          case 0x34: { stack.push(Math.round(this._elapsedMs)); break; }
          case 0x47: { // ActionAdd2
            const a = stack.pop();
            const b = stack.pop();
            if (typeof a === 'string' || typeof b === 'string') {
              stack.push(this._toStr(b) + this._toStr(a));
            } else {
              stack.push(toAvm1Number(b) + toAvm1Number(a));
            }
            break;
          }
          case 0x48: { // ActionLess2
            const a = stack.pop();
            const b = stack.pop();
            if (typeof a === 'string' && typeof b === 'string') stack.push(b < a);
            else stack.push(toAvm1Number(b) < toAvm1Number(a));
            break;
          }
          case 0x67: { // ActionGreater
            const a = stack.pop();
            const b = stack.pop();
            if (typeof a === 'string' && typeof b === 'string') stack.push(b > a);
            else stack.push(toAvm1Number(b) > toAvm1Number(a));
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
          case 0x4A: { stack.push(toAvm1Number(stack.pop())); break; }
          case 0x4B: { stack.push(this._toStr(stack.pop())); break; }
          case 0x50: { stack.push(toAvm1Number(stack.pop()) + 1); break; }
          case 0x51: { stack.push(toAvm1Number(stack.pop()) - 1); break; }
          case 0x60: { const a = toAvm1Number(stack.pop()) | 0; const b = toAvm1Number(stack.pop()) | 0; stack.push(b & a); break; }
          case 0x61: { const a = toAvm1Number(stack.pop()) | 0; const b = toAvm1Number(stack.pop()) | 0; stack.push(b | a); break; }
          case 0x62: { const a = toAvm1Number(stack.pop()) | 0; const b = toAvm1Number(stack.pop()) | 0; stack.push(b ^ a); break; }
          case 0x63: { const a = toAvm1Number(stack.pop()) & 31; const b = toAvm1Number(stack.pop()) | 0; stack.push(b << a); break; }
          case 0x64: { const a = toAvm1Number(stack.pop()) & 31; const b = toAvm1Number(stack.pop()) | 0; stack.push(b >> a); break; }
          case 0x65: { const a = toAvm1Number(stack.pop()) & 31; const b = toAvm1Number(stack.pop()) >>> 0; stack.push(b >>> a); break; }

          // --- Variables, Members, Properties, Objects, Arrays ---
          case 0x1C: { // ActionGetVariable
            const name = this._toStr(stack.pop());
            stack.push(this._getVariable(name, curTarget, scopes, withStack, thisObj));
            break;
          }
          case 0x1D: { // ActionSetVariable
            const val = stack.pop();
            const name = this._toStr(stack.pop());
            this._setVariable(name, val, curTarget, scopes, withStack, thisObj);
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
              if (obj._isMovieClip) {
                const seen = new Set();
                const vKeys = Object.keys(obj._vars);
                for (let i = 0; i < vKeys.length; i++) {
                  seen.add(vKeys[i]);
                  stack.push(vKeys[i]);
                }
                const kids = obj._getChildrenSnapshot();
                for (let i = 0; i < kids.length; i++) {
                  const nm = kids[i] && kids[i].obj && kids[i].obj._name;
                  if (nm && !seen.has(nm)) {
                    seen.add(nm);
                    stack.push(nm);
                  }
                }
              } else {
                const keys = Object.keys(obj);
                for (let i = 0; i < keys.length; i++) stack.push(keys[i]);
              }
            }
            break;
          }
          case 0x55: { // ActionEnumerate2
            const obj = stack.pop();
            stack.push(null);
            if (obj && typeof obj === 'object') {
              if (obj._isMovieClip) {
                const seen = new Set();
                const vKeys = Object.keys(obj._vars);
                for (let i = 0; i < vKeys.length; i++) {
                  seen.add(vKeys[i]);
                  stack.push(vKeys[i]);
                }
                const kids = obj._getChildrenSnapshot();
                for (let i = 0; i < kids.length; i++) {
                  const nm = kids[i] && kids[i].obj && kids[i].obj._name;
                  if (nm && !seen.has(nm)) {
                    seen.add(nm);
                    stack.push(nm);
                  }
                }
              } else {
                const keys = Object.keys(obj);
                for (let i = 0; i < keys.length; i++) stack.push(keys[i]);
              }
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
            const rawDepth = Math.floor(this._toNum(stack.pop()));
            const asDepth = rawDepth >= AS_DEPTH_OFFSET ? (rawDepth - AS_DEPTH_OFFSET) : rawDepth;
            const newName = this._toStr(stack.pop());
            const srcVal = stack.pop();
            const src = this._resolveTargetPath(srcVal, curTarget);
            if (src && src._isMovieClip) src.duplicateMovieClip(newName, asDepth);
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
            pc = _resolveJump(offsetToIdx, instrs, total, ins.end + off);
            break;
          }
          case 0x9D: { // ActionIf (conditional SI16 relative offset: jump if truthy!)
            const off = readSI16(bytes, ins.pStart);
            const cond = stack.pop();
            if (this._toBool(cond)) {
              pc = _resolveJump(offsetToIdx, instrs, total, ins.end + off);
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
              pc = _resolveJump(offsetToIdx, instrs, total, ins.end + size);
            }
            break;
          }
          case 0x8F: { // ActionTry (memoized decoded try/catch/finally sub-slices)
            let tm = ins._tryMeta;
            if (!tm) {
              const trySize = readUI16(bytes, ins.pStart + 1);
              const catchSize = readUI16(bytes, ins.pStart + 3);
              const finallySize = readUI16(bytes, ins.pStart + 5);
              const tryEnd = ins.end + trySize;
              const afterAll = tryEnd + catchSize + finallySize;
              tm = {
                tryDecoded: decodeBytecodeSlice(bytes, ins.end, tryEnd),
                catchDecoded: catchSize > 0 ? decodeBytecodeSlice(bytes, tryEnd, tryEnd + catchSize) : null,
                finDecoded: finallySize > 0 ? decodeBytecodeSlice(bytes, tryEnd + catchSize, afterAll) : null,
                afterAll,
              };
              ins._tryMeta = tm;
            }
            try {
              this._runDecoded(tm.tryDecoded, curTarget, thisObj, scopes, regs, constPool);
            } catch (_) {
              if (tm.catchDecoded) {
                this._runDecoded(tm.catchDecoded, curTarget, thisObj, scopes, regs, constPool);
              }
            } finally {
              if (tm.finDecoded) {
                this._runDecoded(tm.finDecoded, curTarget, thisObj, scopes, regs, constPool);
              }
            }
            pc = _resolveJump(offsetToIdx, instrs, total, tm.afterAll);
            break;
          }
          case 0x2A: { // ActionThrow
            const err = stack.pop();
            throw err;
          }

          // --- Functions & Method Calls (memoized decoded bodies) ---
          case 0x9B: { // ActionDefineFunction
            let fm = ins._fnMeta;
            if (!fm) {
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
              fm = {
                fnName,
                params,
                bodyEnd,
                bodyDecoded: decodeBytecodeSlice(bytes, bodyStart, bodyEnd),
              };
              ins._fnMeta = fm;
            }
            const vm = this;
            const fnObj = function (...callArgs) {
              return vm._callAvm1Function(fnObj, this, callArgs);
            };
            fnObj._isAvm1Fn = true;
            fnObj._isFn2 = false;
            fnObj._params = fm.params;
            fnObj._bodyDecoded = fm.bodyDecoded;
            fnObj._constPool = constPool;
            fnObj._closureScopes = scopes.length > 0 ? scopes.slice() : EMPTY_ARR;
            fnObj._defClip = curTarget;

            if (fm.fnName) {
              this._setVariable(fm.fnName, fnObj, curTarget, scopes, withStack, thisObj);
            } else {
              stack.push(fnObj);
            }
            pc = _resolveJump(offsetToIdx, instrs, total, fm.bodyEnd);
            break;
          }
          case 0x8E: { // ActionDefineFunction2
            let fm = ins._fn2Meta;
            if (!fm) {
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
              fm = {
                fnName,
                regCount,
                flags1,
                flags2,
                params,
                bodyEnd,
                bodyDecoded: decodeBytecodeSlice(bytes, bodyStart, bodyEnd),
              };
              ins._fn2Meta = fm;
            }
            const vm = this;
            const fnObj = function (...callArgs) {
              return vm._callAvm1Function(fnObj, this, callArgs);
            };
            fnObj._isAvm1Fn = true;
            fnObj._isFn2 = true;
            fnObj._regCount = fm.regCount;
            fnObj._preloadParent = (fm.flags1 & 0x80) !== 0;
            fnObj._preloadRoot = (fm.flags1 & 0x40) !== 0;
            fnObj._suppressSuper = (fm.flags1 & 0x20) !== 0;
            fnObj._preloadSuper = (fm.flags1 & 0x10) !== 0;
            fnObj._suppressArguments = (fm.flags1 & 0x08) !== 0;
            fnObj._preloadArguments = (fm.flags1 & 0x04) !== 0;
            fnObj._suppressThis = (fm.flags1 & 0x02) !== 0;
            fnObj._preloadThis = (fm.flags1 & 0x01) !== 0;
            fnObj._preloadGlobal = (fm.flags2 & 0x01) !== 0;
            fnObj._params = fm.params;
            fnObj._bodyDecoded = fm.bodyDecoded;
            fnObj._constPool = constPool;
            fnObj._closureScopes = scopes.length > 0 ? scopes.slice() : EMPTY_ARR;
            fnObj._defClip = curTarget;

            if (fm.fnName) {
              this._setVariable(fm.fnName, fnObj, curTarget, scopes, withStack, thisObj);
            } else {
              stack.push(fnObj);
            }
            pc = _resolveJump(offsetToIdx, instrs, total, fm.bodyEnd);
            break;
          }
          case 0x3E: { // ActionReturn
            return stack.pop();
          }
          case 0x3D: { // ActionCallFunction
            const fnName = this._toStr(stack.pop());
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            let args = EMPTY_ARR;
            if (numArgs > 0) {
              args = this._argsPool.length > 0 ? this._argsPool.pop() : [];
              args.length = numArgs;
              for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            }
            let res;
            try {
              if (fnName === 'eval') {
                const rawEval = args[0];
                if (rawEval === undefined || rawEval === null || String(rawEval).trim() === '') {
                  res = undefined;
                } else {
                  res = this._resolveTargetPath(rawEval, curTarget);
                  if (res === undefined) {
                    res = this._resolveVariablePath(String(rawEval), curTarget, scopes, withStack, thisObj);
                  }
                }
              } else {
                const found = this._resolveVariableWithReceiver(fnName, curTarget, scopes, withStack, thisObj);
                res = this._invokeValue(found.value, found.receiver, args);
              }
            } finally {
              if (args !== EMPTY_ARR) {
                args.length = 0;
                if (this._argsPool.length < 64) this._argsPool.push(args);
              }
            }
            stack.push(res);
            break;
          }
          case 0x52: { // ActionCallMethod
            const methodName = stack.pop();
            const obj = stack.pop();
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            let args = EMPTY_ARR;
            if (numArgs > 0) {
              args = this._argsPool.length > 0 ? this._argsPool.pop() : [];
              args.length = numArgs;
              for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            }
            let res;
            try {
              if (methodName === undefined || methodName === null || methodName === '') {
                res = this._invokeValue(obj, curTarget, args);
              } else {
                const fn = this._getMember(obj, String(methodName));
                res = this._invokeValue(fn, obj, args);
              }
            } finally {
              if (args !== EMPTY_ARR) {
                args.length = 0;
                if (this._argsPool.length < 64) this._argsPool.push(args);
              }
            }
            stack.push(res);
            break;
          }
          case 0x40: { // ActionNewObject
            const ctorName = this._toStr(stack.pop());
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            let args = EMPTY_ARR;
            if (numArgs > 0) {
              args = this._argsPool.length > 0 ? this._argsPool.pop() : [];
              args.length = numArgs;
              for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            }
            const ctor = this._getVariable(ctorName, curTarget, scopes, withStack, thisObj);
            let instance;
            try {
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
            } finally {
              if (args !== EMPTY_ARR) {
                args.length = 0;
                if (this._argsPool.length < 64) this._argsPool.push(args);
              }
            }
            stack.push(instance);
            break;
          }
          case 0x53: { // ActionNewMethod
            const methodName = stack.pop();
            const obj = stack.pop();
            const numArgs = Math.max(0, Math.floor(this._toNum(stack.pop())));
            let args = EMPTY_ARR;
            if (numArgs > 0) {
              args = this._argsPool.length > 0 ? this._argsPool.pop() : [];
              args.length = numArgs;
              for (let i = 0; i < numArgs; i++) args[i] = stack.pop();
            }
            const ctor = (methodName === undefined || methodName === null || methodName === '')
              ? obj
              : this._getMember(obj, String(methodName));
            let instance;
            try {
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
            } finally {
              if (args !== EMPTY_ARR) {
                args.length = 0;
                if (this._argsPool.length < 64) this._argsPool.push(args);
              }
            }
            stack.push(instance);
            break;
          }

          default:
            // Safely ignore unrecognized/unimplemented opcodes without halting execution
            if (_isSwfDebugEnabled()) {
              this._dbgUnhandledOpcodes.add(`0x${code.toString(16).toUpperCase().padStart(2, '0')}`);
            }
            break;
        }
      }

      return undefined;
      } finally {
        stack.length = 0;
        withStack.length = 0;
        withEndOffsets.length = 0;
        if (fPool.length < 64) fPool.push(frame);
      }
    }
  }

  ASTAVM1Runtime.toAvm1Number = toAvm1Number;

  function __getSwfDebugReport() {
    const shared = _getSwfDebugSharedState();
    if (shared.activeRuntime && typeof shared.activeRuntime.getDebugReport === 'function') {
      return shared.activeRuntime.getDebugReport();
    }
    const imp = shared.importSummary || { totalTagsParsed: 0, cachedDefsShapes: 0, skippedTagIds: [] };
    return {
      enabled: _isSwfDebugEnabled(),
      importSummary: {
        totalTagsParsed: imp.totalTagsParsed || 0,
        cachedDefsShapes: imp.cachedDefsShapes || 0,
        skippedTagIds: Array.isArray(imp.skippedTagIds) ? imp.skippedTagIds.slice() : [],
      },
      avm1Faults: {
        unhandledOpcodes: [],
        nanProperties: [],
      },
      frameTiming: {
        sampleCount: 0,
        avgAvm1ExecMs: 0,
        avgSvgRenderMs: 0,
        activeDynamicDomNodes: 0,
      },
    };
  }

  global.ASTAVM1Runtime = ASTAVM1Runtime;
  global.toAvm1Number = toAvm1Number;
  global.__getSwfDebugReport = __getSwfDebugReport;
  if (typeof window !== 'undefined') {
    window.ASTAVM1Runtime = ASTAVM1Runtime;
    window.toAvm1Number = toAvm1Number;
    window.__getSwfDebugReport = __getSwfDebugReport;
    if (typeof window.__SWF_DEBUG__ === 'undefined') {
      window.__SWF_DEBUG__ = false;
    }
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTAVM1Runtime, AVM1MovieClip, AVM1Button, AVM1TextField, toAvm1Number, __getSwfDebugReport };
  }
})(typeof window !== 'undefined' ? window : globalThis);
