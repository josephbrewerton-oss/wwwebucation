/**
 * static/player/ast-avm2-vm.js
 *
 * St Joseph's Educational Media Suite — Pure-SVG ActionScript 3 (AVM2 / DoABC) Micro-VM
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Zero-dependency, lazy-loaded ActionScript 3 bytecode interpreter and pure W3C SVG
 * Flash DisplayList + Web Audio runtime:
 *   - Binary ABC parser (u30/s24/s32/d64, ConstantPool, Multinames, Traits, Scripts)
 *   - Stack + Register + Scope-Chain AVM2 bytecode executor with strict instruction budget
 *   - Built-in Flash packages: flash.events (backed by shared ASTEventDispatcher),
 *     flash.display (Stage, Sprite, MovieClip, Shape, Graphics, SimpleButton),
 *     flash.text (TextField, TextFormat), flash.geom (Point, Rectangle, ColorTransform),
 *     flash.filters (Blur/Glow/DropShadow/ColorMatrix -> SVG <filter>),
 *     flash.media (Sound, SoundChannel, SoundTransform -> Web Audio PCM/ADPCM/MP3),
 *     flash.utils (Timer, getTimer, Dictionary, getDefinitionByName), flash.ui.Keyboard
 *   - 100% decoupled universal input subscription via engine.gestures.registerMediaInputSink()
 *   - Hybrid Run-to-Convert pure-SVG & typed-trait snapshot support
 */

(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const MAX_OPS_PER_CALL = 250000;
  const MAX_OPS_PER_TICK = 450000;
  const MAX_CALL_DEPTH = 96;
  const SAFE_DATA_IMAGE_RE = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=\s]+$/i;

  // Fallback EventDispatcher if loaded standalone without ast-event-bus.js
  function getEventBus() {
    if (global.ASTEventBus) return global.ASTEventBus;
    if (typeof window !== 'undefined' && window.ASTEventBus) return window.ASTEventBus;
    if (typeof require === 'function') {
      try {
        return require('./ast-event-bus.js');
      } catch (_) {}
    }
    return null;
  }

  class FallbackEvent {
    constructor(type, bubbles, cancelable) {
      this.type = String(type || '');
      this.bubbles = Boolean(bubbles);
      this.cancelable = Boolean(cancelable);
      this.target = null;
      this.currentTarget = null;
      this.eventPhase = 2;
      this._defaultPrevented = false;
      this._stopProp = false;
      this._stopImmediate = false;
    }
    stopPropagation() { this._stopProp = true; }
    stopImmediatePropagation() { this._stopProp = true; this._stopImmediate = true; }
    preventDefault() { if (this.cancelable) this._defaultPrevented = true; }
    isDefaultPrevented() { return this._defaultPrevented; }
    clone() { return new FallbackEvent(this.type, this.bubbles, this.cancelable); }
  }

  class FallbackEventDispatcher {
    constructor(targetOverride) {
      this._eventTarget = targetOverride || this;
      this._astListeners = new Map();
    }
    getEventParent() { return this._eventParent || this.parent || null; }
    addEventListener(type, listener, useCapture, priority) {
      if (!type || typeof listener !== 'function') return;
      const k = String(type);
      const list = this._astListeners.get(k) || [];
      list.push({ fn: listener, capture: Boolean(useCapture), priority: Number(priority) || 0 });
      this._astListeners.set(k, list);
    }
    removeEventListener(type, listener, useCapture) {
      const list = this._astListeners.get(String(type || ''));
      if (!list) return;
      const idx = list.findIndex((e) => e.fn === listener && e.capture === Boolean(useCapture));
      if (idx >= 0) list.splice(idx, 1);
    }
    hasEventListener(type) {
      const list = this._astListeners.get(String(type || ''));
      return Boolean(list && list.length > 0);
    }
    willTrigger(type) { return this.hasEventListener(type); }
    dispatchEvent(ev) {
      if (!ev || !ev.type) return false;
      ev.target = this._eventTarget;
      ev.currentTarget = this._eventTarget;
      ev.eventPhase = 2;
      const list = (this._astListeners.get(ev.type) || []).slice();
      for (let i = 0; i < list.length; i++) {
        if (!list[i].capture) list[i].fn.call(this._eventTarget, ev);
        if (ev._stopImmediate) break;
      }
      return !ev.isDefaultPrevented();
    }
    removeAllEventListeners() { this._astListeners.clear(); }
  }

  function resolveBaseEvent() {
    const bus = getEventBus();
    return (bus && bus.ASTEvent) || FallbackEvent;
  }

  function resolveBaseDispatcher() {
    const bus = getEventBus();
    return (bus && bus.ASTEventDispatcher) || FallbackEventDispatcher;
  }

  function createTraitRegistry() {
    const bus = getEventBus();
    if (bus && bus.ASTTraitRegistry) return new bus.ASTTraitRegistry();
    const map = new Map();
    return {
      register(bp) { if (bp && bp.name) map.set(bp.name, bp); return bp; },
      get(n) { return map.get(n) || null; },
      has(n) { return map.has(n); },
      list() { return Array.from(map.values()); },
      clear() { map.clear(); },
      summarizeForDistiller() { return Array.from(map.values()); },
    };
  }

  // ---------------------------------------------------------------------------
  // Binary / Base64 / UTF-8 Utilities
  // ---------------------------------------------------------------------------
  function base64ToBytes(b64) {
    if (!b64 || typeof b64 !== 'string') return new Uint8Array(0);
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
      const buf = Buffer.from(b64, 'base64');
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function base64ToUtf8(b64) {
    const bytes = base64ToBytes(b64);
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    }
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return s;
  }

  function hexFromRgbInt(c) {
    const v = (Number(c) || 0) & 0xffffff;
    return '#' + v.toString(16).padStart(6, '0');
  }

  function clampNum(v, lo, hi) {
    const n = Number(v);
    if (!Number.isFinite(n)) return lo;
    return n < lo ? lo : n > hi ? hi : n;
  }

  function fmtN(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || Math.abs(n) < 1e-6) return '0';
    return String(Number(n.toFixed(3)));
  }

  // ---------------------------------------------------------------------------
  // 1. Strict Bounds-Checked ABC Binary Parser (AVM2 Spec v46.16)
  // ---------------------------------------------------------------------------
  class AbcReader {
    constructor(bytes) {
      this.bytes = bytes;
      this.len = bytes ? bytes.length : 0;
      this.pos = 0;
      this._dv = bytes && bytes.length ? new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength) : null;
    }

    eof() {
      return this.pos >= this.len;
    }

    readU8() {
      if (this.pos >= this.len) return 0;
      return this.bytes[this.pos++];
    }

    readS8() {
      const b = this.readU8();
      return b & 0x80 ? b - 256 : b;
    }

    readU16() {
      if (this.pos + 2 > this.len) {
        this.pos = this.len;
        return 0;
      }
      const v = this.bytes[this.pos] | (this.bytes[this.pos + 1] << 8);
      this.pos += 2;
      return v;
    }

    readS24() {
      if (this.pos + 3 > this.len) {
        this.pos = this.len;
        return 0;
      }
      let v =
        this.bytes[this.pos] |
        (this.bytes[this.pos + 1] << 8) |
        (this.bytes[this.pos + 2] << 16);
      this.pos += 3;
      if (v & 0x800000) v |= ~0xffffff;
      return v;
    }

    readU30() {
      let res = 0;
      let shift = 0;
      for (let i = 0; i < 5; i++) {
        if (this.pos >= this.len) return res >>> 0;
        const b = this.bytes[this.pos++];
        res |= (b & 0x7f) << shift;
        if ((b & 0x80) === 0) break;
        shift += 7;
      }
      return res >>> 0;
    }

    readU32() {
      return this.readU30() >>> 0;
    }

    readS32() {
      let res = 0;
      let shift = 0;
      let b = 0;
      for (let i = 0; i < 5; i++) {
        if (this.pos >= this.len) break;
        b = this.bytes[this.pos++];
        res |= (b & 0x7f) << shift;
        shift += 7;
        if ((b & 0x80) === 0) {
          if (shift < 32 && (b & 0x40)) {
            res |= -(1 << shift);
          }
          break;
        }
      }
      return res | 0;
    }

    readD64() {
      if (!this._dv || this.pos + 8 > this.len) {
        this.pos = this.len;
        return NaN;
      }
      const v = this._dv.getFloat64(this.pos, true);
      this.pos += 8;
      return v;
    }

    readBytes(n) {
      const safe = Math.min(Math.max(0, n), this.len - this.pos);
      const out = this.bytes.subarray(this.pos, this.pos + safe);
      this.pos += safe;
      return out;
    }

    readUtf8(n) {
      const slice = this.readBytes(n);
      if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder('utf-8', { fatal: false }).decode(slice);
      }
      let s = '';
      for (let i = 0; i < slice.length; i++) s += String.fromCharCode(slice[i]);
      return s;
    }
  }

  function parseTraits(r, cpool) {
    const count = Math.min(r.readU30(), 4096);
    const traits = [];
    for (let i = 0; i < count && !r.eof(); i++) {
      const nameIdx = r.readU30();
      const kindByte = r.readU8();
      const kind = kindByte & 0x0f;
      const attrs = (kindByte >> 4) & 0x0f;
      const mn = cpool.multinames[nameIdx] || { name: '', qname: '' };
      const trait = {
        nameIdx,
        name: mn.name || '',
        qname: mn.qname || mn.name || '',
        kind,
        attrs,
        slotId: 0,
        typeIdx: 0,
        typeName: '*',
        vindex: 0,
        vkind: 0,
        dispId: 0,
        methodIdx: 0,
        classIdx: 0,
      };
      if (kind === 0 || kind === 6) {
        // Trait_Slot (0) / Trait_Const (6)
        trait.slotId = r.readU30();
        trait.typeIdx = r.readU30();
        trait.typeName = (cpool.multinames[trait.typeIdx] && cpool.multinames[trait.typeIdx].qname) || '*';
        trait.vindex = r.readU30();
        if (trait.vindex !== 0) trait.vkind = r.readU8();
      } else if (kind === 1 || kind === 2 || kind === 3) {
        // Method (1) / Getter (2) / Setter (3)
        trait.dispId = r.readU30();
        trait.methodIdx = r.readU30();
      } else if (kind === 4) {
        // Class (4)
        trait.slotId = r.readU30();
        trait.classIdx = r.readU30();
      } else if (kind === 5) {
        // Function (5)
        trait.slotId = r.readU30();
        trait.methodIdx = r.readU30();
      }
      if (attrs & 0x04) {
        const metaCount = Math.min(r.readU30(), 128);
        for (let m = 0; m < metaCount && !r.eof(); m++) r.readU30();
      }
      traits.push(trait);
    }
    return traits;
  }

  function resolveConstantValue(cpool, vindex, vkind) {
    if (!vindex) return undefined;
    switch (vkind) {
      case 0x03: return cpool.ints[vindex] | 0;
      case 0x04: return cpool.uints[vindex] >>> 0;
      case 0x06: return cpool.doubles[vindex];
      case 0x01: return cpool.strings[vindex] || '';
      case 0x0b: return true;
      case 0x0a: return false;
      case 0x0c: return null;
      case 0x00: return undefined;
      default: return undefined;
    }
  }

  function parseAbcFile(bytes, blockName) {
    const r = new AbcReader(bytes);
    const minor = r.readU16();
    const major = r.readU16();
    if (major < 46 || major > 47) {
      throw new Error(`Unsupported ABC version ${major}.${minor}`);
    }

    // Constant Pool
    const ints = [0];
    const intCount = Math.min(r.readU30(), 65536);
    for (let i = 1; i < intCount && !r.eof(); i++) ints.push(r.readS32());

    const uints = [0];
    const uintCount = Math.min(r.readU30(), 65536);
    for (let i = 1; i < uintCount && !r.eof(); i++) uints.push(r.readU32());

    const doubles = [NaN];
    const dblCount = Math.min(r.readU30(), 65536);
    for (let i = 1; i < dblCount && !r.eof(); i++) doubles.push(r.readD64());

    const strings = [''];
    const strCount = Math.min(r.readU30(), 131072);
    for (let i = 1; i < strCount && !r.eof(); i++) {
      strings.push(r.readUtf8(r.readU30()));
    }

    const namespaces = [{ kind: 0, name: '' }];
    const nsCount = Math.min(r.readU30(), 65536);
    for (let i = 1; i < nsCount && !r.eof(); i++) {
      const kind = r.readU8();
      const nameIdx = r.readU30();
      namespaces.push({ kind, name: strings[nameIdx] || '' });
    }

    const nsSets = [[]];
    const nsSetCount = Math.min(r.readU30(), 65536);
    for (let i = 1; i < nsSetCount && !r.eof(); i++) {
      const cnt = Math.min(r.readU30(), 256);
      const set = [];
      for (let j = 0; j < cnt && !r.eof(); j++) {
        const nsIdx = r.readU30();
        set.push(namespaces[nsIdx] || { kind: 0, name: '' });
      }
      nsSets.push(set);
    }

    const multinames = [{ kind: 0, ns: '', name: '*', qname: '*', isRuntimeName: false, isRuntimeNs: false }];
    const mnCount = Math.min(r.readU30(), 131072);
    for (let i = 1; i < mnCount && !r.eof(); i++) {
      const kind = r.readU8();
      if (kind === 0x07 || kind === 0x0d) {
        const nsIdx = r.readU30();
        const nameIdx = r.readU30();
        const ns = (namespaces[nsIdx] && namespaces[nsIdx].name) || '';
        const name = strings[nameIdx] || '';
        multinames.push({
          kind,
          ns,
          name,
          qname: ns ? `${ns}.${name}` : name,
          isRuntimeName: false,
          isRuntimeNs: false,
        });
      } else if (kind === 0x0f || kind === 0x10) {
        const nameIdx = r.readU30();
        const name = strings[nameIdx] || '';
        multinames.push({ kind, ns: '', name, qname: name, isRuntimeName: false, isRuntimeNs: true });
      } else if (kind === 0x11 || kind === 0x12) {
        multinames.push({ kind, ns: '', name: '', qname: '*', isRuntimeName: true, isRuntimeNs: true });
      } else if (kind === 0x09 || kind === 0x0e) {
        const nameIdx = r.readU30();
        const nsSetIdx = r.readU30();
        const name = strings[nameIdx] || '';
        const nsSet = nsSets[nsSetIdx] || [];
        const firstNs = nsSet.find((n) => n && n.name) ? nsSet.find((n) => n && n.name).name : '';
        multinames.push({
          kind,
          ns: firstNs,
          nsSet,
          name,
          qname: firstNs ? `${firstNs}.${name}` : name,
          isRuntimeName: false,
          isRuntimeNs: false,
        });
      } else if (kind === 0x1b || kind === 0x1c) {
        const nsSetIdx = r.readU30();
        multinames.push({
          kind,
          ns: '',
          nsSet: nsSets[nsSetIdx] || [],
          name: '',
          qname: '*',
          isRuntimeName: true,
          isRuntimeNs: false,
        });
      } else if (kind === 0x1d) {
        const qnIdx = r.readU30();
        const paramCount = Math.min(r.readU30(), 16);
        const params = [];
        for (let p = 0; p < paramCount && !r.eof(); p++) params.push(r.readU30());
        const base = multinames[qnIdx] || { name: 'Vector', qname: 'Vector' };
        multinames.push({
          kind,
          ns: base.ns || '',
          name: base.name,
          qname: base.qname,
          params,
          isRuntimeName: false,
          isRuntimeNs: false,
        });
      } else {
        multinames.push({ kind, ns: '', name: '', qname: '*', isRuntimeName: false, isRuntimeNs: false });
      }
    }

    const cpool = { ints, uints, doubles, strings, namespaces, nsSets, multinames };

    // method_info
    const methods = [];
    const methodCount = Math.min(r.readU30(), 65536);
    for (let i = 0; i < methodCount && !r.eof(); i++) {
      const paramCount = Math.min(r.readU30(), 256);
      const returnTypeIdx = r.readU30();
      const paramTypes = [];
      for (let p = 0; p < paramCount && !r.eof(); p++) paramTypes.push(r.readU30());
      const nameIdx = r.readU30();
      const flags = r.readU8();
      const optionals = [];
      if (flags & 0x08) {
        const optCount = Math.min(r.readU30(), 256);
        for (let o = 0; o < optCount && !r.eof(); o++) {
          const valIdx = r.readU30();
          const valKind = r.readU8();
          optionals.push(resolveConstantValue(cpool, valIdx, valKind));
        }
      }
      if (flags & 0x80) {
        for (let p = 0; p < paramCount && !r.eof(); p++) r.readU30();
      }
      methods.push({
        index: i,
        paramCount,
        returnTypeIdx,
        returnType: (multinames[returnTypeIdx] && multinames[returnTypeIdx].qname) || '*',
        paramTypes,
        name: strings[nameIdx] || '',
        flags,
        optionals,
        body: null,
      });
    }

    // metadata_info
    const metaCount = Math.min(r.readU30(), 65536);
    for (let i = 0; i < metaCount && !r.eof(); i++) {
      r.readU30();
      const itemCount = Math.min(r.readU30(), 1024);
      for (let k = 0; k < itemCount && !r.eof(); k++) {
        r.readU30();
        r.readU30();
      }
    }

    // instance_info & class_info
    const classCount = Math.min(r.readU30(), 4096);
    const instances = [];
    for (let i = 0; i < classCount && !r.eof(); i++) {
      const nameIdx = r.readU30();
      const superIdx = r.readU30();
      const flags = r.readU8();
      const protectedNs = flags & 0x08 ? r.readU30() : 0;
      const ifaceCount = Math.min(r.readU30(), 128);
      const interfaces = [];
      for (let k = 0; k < ifaceCount && !r.eof(); k++) interfaces.push(r.readU30());
      const iinit = r.readU30();
      const traits = parseTraits(r, cpool);
      const nameMn = multinames[nameIdx] || { name: `Class_${i}`, qname: `Class_${i}` };
      const superMn = multinames[superIdx] || { name: 'Object', qname: 'Object' };
      instances.push({
        index: i,
        nameIdx,
        name: nameMn.name,
        qname: nameMn.qname,
        superName: superMn.qname,
        superSimpleName: superMn.name,
        flags,
        protectedNs,
        interfaces,
        iinit,
        traits,
      });
    }

    const classes = [];
    for (let i = 0; i < classCount && !r.eof(); i++) {
      const cinit = r.readU30();
      const traits = parseTraits(r, cpool);
      classes.push({ index: i, cinit, traits });
    }

    // script_info
    const scriptCount = Math.min(r.readU30(), 4096);
    const scripts = [];
    for (let i = 0; i < scriptCount && !r.eof(); i++) {
      const init = r.readU30();
      const traits = parseTraits(r, cpool);
      scripts.push({ index: i, init, traits });
    }

    // method_body_info
    const bodyCount = Math.min(r.readU30(), 65536);
    const bodies = [];
    for (let i = 0; i < bodyCount && !r.eof(); i++) {
      const methodIdx = r.readU30();
      const maxStack = r.readU30();
      const localCount = r.readU30();
      const initScopeDepth = r.readU30();
      const maxScopeDepth = r.readU30();
      const codeLen = r.readU30();
      const code = r.readBytes(codeLen);
      const excCount = Math.min(r.readU30(), 256);
      const exceptions = [];
      for (let e = 0; e < excCount && !r.eof(); e++) {
        exceptions.push({
          from: r.readU30(),
          to: r.readU30(),
          target: r.readU30(),
          excTypeIdx: r.readU30(),
          varNameIdx: r.readU30(),
        });
      }
      const traits = parseTraits(r, cpool);
      const body = {
        methodIdx,
        maxStack,
        localCount,
        initScopeDepth,
        maxScopeDepth,
        code,
        exceptions,
        traits,
      };
      bodies.push(body);
      if (methods[methodIdx]) {
        methods[methodIdx].body = body;
      }
    }

    return {
      name: blockName || 'abc',
      minor,
      major,
      cpool,
      methods,
      instances,
      classes,
      scripts,
      bodies,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Shared Web Audio Engine (PCM / SWF IMA ADPCM / MP3)
  // ---------------------------------------------------------------------------
  const ADPCM_INDEX_TABLE_2 = [-1, 2];
  const ADPCM_INDEX_TABLE_3 = [-1, -1, 2, 4];
  const ADPCM_INDEX_TABLE_4 = [-1, -1, -1, -1, 2, 4, 6, 8];
  const ADPCM_INDEX_TABLE_5 = [-1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 4, 6, 8, 10, 13, 16];
  const ADPCM_STEP_TABLE = [
    7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45,
    50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230,
    253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963,
    1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327,
    3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487,
    12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767,
  ];

  function decodeSwfAdpcm(bytes, isStereo, sampleCount) {
    let bitPos = 0;
    const totalBits = bytes.length * 8;
    const readBits = (n) => {
      let v = 0;
      for (let i = 0; i < n; i++) {
        if (bitPos >= totalBits) return v << (n - i);
        const byteIdx = bitPos >> 3;
        const bitIdx = 7 - (bitPos & 7);
        v = (v << 1) | ((bytes[byteIdx] >> bitIdx) & 1);
        bitPos++;
      }
      return v;
    };
    const codeSize = readBits(2) + 2;
    const idxTable =
      codeSize === 2 ? ADPCM_INDEX_TABLE_2
      : codeSize === 3 ? ADPCM_INDEX_TABLE_3
      : codeSize === 4 ? ADPCM_INDEX_TABLE_4
      : ADPCM_INDEX_TABLE_5;
    const channels = isStereo ? 2 : 1;
    const maxSamples = Math.min(Math.max(1, sampleCount || 44100), 44100 * 30);
    const out = Array.from({ length: channels }, () => new Float32Array(maxSamples));
    const signMask = 1 << (codeSize - 1);
    const magMask = signMask - 1;
    let outIdx = 0;

    while (outIdx < maxSamples && bitPos + 22 * channels <= totalBits) {
      const pred = new Int32Array(channels);
      const stepIdx = new Int32Array(channels);
      for (let c = 0; c < channels; c++) {
        let p = readBits(16);
        if (p & 0x8000) p -= 0x10000;
        pred[c] = p;
        stepIdx[c] = Math.min(88, readBits(6));
        out[c][outIdx] = pred[c] / 32768;
      }
      outIdx++;
      for (let s = 1; s < 4096 && outIdx < maxSamples && bitPos + codeSize * channels <= totalBits; s++) {
        for (let c = 0; c < channels; c++) {
          const delta = readBits(codeSize);
          const step = ADPCM_STEP_TABLE[stepIdx[c]];
          let diff = step >> (codeSize - 1);
          for (let b = 0; b < codeSize - 1; b++) {
            if (delta & (1 << b)) diff += step >> (codeSize - 2 - b);
          }
          pred[c] = clampNum(delta & signMask ? pred[c] - diff : pred[c] + diff, -32768, 32767);
          stepIdx[c] = clampNum(stepIdx[c] + idxTable[delta & magMask], 0, 88);
          out[c][outIdx] = pred[c] / 32768;
        }
        outIdx++;
      }
    }
    return out.map((ch) => ch.subarray(0, outIdx));
  }

  class AVM2SoundEngine {
    constructor(soundMap) {
      this._defs = soundMap || {};
      this._ctx = null;
      this._decoded = new Map();
      this._activeSources = new Set();
      this._soundLog = [];
      this.muted = false;
    }

    _ensureCtx() {
      if (this._ctx) return this._ctx;
      const AudioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || null;
      if (!AudioCtx) return null;
      try {
        this._ctx = new AudioCtx();
      } catch (_) {
        this._ctx = null;
      }
      return this._ctx;
    }

    _decodeDef(id, ctx) {
      if (this._decoded.has(id)) return this._decoded.get(id);
      const def = this._defs[id];
      if (!def || !def.b64) return null;
      const bytes = base64ToBytes(def.b64);
      const rate = def.rate || 22050;
      const channels = def.st ? 2 : 1;

      if (def.fmt === 2) {
        // MP3: async decodeAudioData
        const p = ctx
          .decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
          .then((buf) => {
            this._decoded.set(id, buf);
            return buf;
          })
          .catch(() => null);
        this._decoded.set(id, p);
        return p;
      }

      if (def.fmt === 1) {
        const chData = decodeSwfAdpcm(bytes, Boolean(def.st), def.sc);
        if (!chData.length || chData[0].length === 0) return null;
        const buf = ctx.createBuffer(channels, chData[0].length, rate);
        for (let c = 0; c < channels; c++) buf.copyToChannel(chData[c], c);
        this._decoded.set(id, buf);
        return buf;
      }

      // Uncompressed PCM (fmt 0 or 3)
      const bps = def.s16 ? 2 : 1;
      const frameBytes = bps * channels;
      const frames = Math.floor(bytes.length / frameBytes);
      if (frames <= 0) return null;
      const buf = ctx.createBuffer(channels, frames, rate);
      const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      for (let c = 0; c < channels; c++) {
        const dst = buf.getChannelData(c);
        for (let i = 0; i < frames; i++) {
          const off = i * frameBytes + c * bps;
          if (def.s16) {
            dst[i] = dv.getInt16(off, true) / 32768;
          } else {
            dst[i] = (bytes[off] - 128) / 128;
          }
        }
      }
      this._decoded.set(id, buf);
      return buf;
    }

    playSound(id, startTimeMs, loops, soundTransform, onComplete) {
      const def = this._defs[id];
      const vol = soundTransform ? clampNum(soundTransform.volume, 0, 2) : 1;
      const pan = soundTransform ? clampNum(soundTransform.pan, -1, 1) : 0;
      const entry = {
        id: Number(id) || 0,
        startTime: Number(startTimeMs) || 0,
        loops: Math.max(0, Number(loops) || 0),
        volume: vol,
        pan,
        t: Date.now(),
      };
      this._soundLog.push(entry);
      if (this._soundLog.length > 128) this._soundLog.shift();

      let stopped = false;
      let activeSrc = null;
      let gainNode = null;
      let panNode = null;

      const handle = {
        stop: () => {
          stopped = true;
          if (activeSrc) {
            try { activeSrc.stop(); } catch (_) {}
            this._activeSources.delete(activeSrc);
            activeSrc = null;
          }
        },
        setTransform: (tr) => {
          if (!tr) return;
          if (gainNode) gainNode.gain.value = this.muted ? 0 : clampNum(tr.volume, 0, 2);
          if (panNode && 'pan' in panNode) panNode.pan.value = clampNum(tr.pan, -1, 1);
        },
      };

      if (!def || this.muted) return handle;
      const ctx = this._ensureCtx();
      if (!ctx) return handle;
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        try { ctx.resume(); } catch (_) {}
      }

      const startBuffer = (audioBuf) => {
        if (!audioBuf || stopped) return;
        try {
          const src = ctx.createBufferSource();
          src.buffer = audioBuf;
          src.loop = (Number(loops) || 0) > 0;
          gainNode = ctx.createGain();
          gainNode.gain.value = this.muted ? 0 : vol;
          if (typeof ctx.createStereoPanner === 'function') {
            panNode = ctx.createStereoPanner();
            panNode.pan.value = pan;
            src.connect(panNode);
            panNode.connect(gainNode);
          } else {
            src.connect(gainNode);
          }
          gainNode.connect(ctx.destination);
          src.onended = () => {
            this._activeSources.delete(src);
            if (!stopped && typeof onComplete === 'function') onComplete();
          };
          this._activeSources.add(src);
          activeSrc = src;
          src.start(0, Math.max(0, (Number(startTimeMs) || 0) / 1000));
        } catch (_) {}
      };

      const decoded = this._decodeDef(id, ctx);
      if (decoded && typeof decoded.then === 'function') {
        decoded.then(startBuffer);
      } else if (decoded) {
        startBuffer(decoded);
      }
      return handle;
    }

    stopAll() {
      this._activeSources.forEach((src) => {
        try { src.stop(); } catch (_) {}
      });
      this._activeSources.clear();
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Pure-SVG Flash Package Shims (flash.events / display / geom / filters / text / media / utils)
  // ---------------------------------------------------------------------------
  const BaseEvent = resolveBaseEvent();
  const BaseDispatcher = resolveBaseDispatcher();

  class AS3Event extends BaseEvent {
    constructor(type, bubbles, cancelable) {
      super(type, Boolean(bubbles), Boolean(cancelable));
    }
    clone() {
      return new AS3Event(this.type, this.bubbles, this.cancelable);
    }
  }
  AS3Event.ENTER_FRAME = 'enterFrame';
  AS3Event.ADDED = 'added';
  AS3Event.ADDED_TO_STAGE = 'addedToStage';
  AS3Event.REMOVED = 'removed';
  AS3Event.REMOVED_FROM_STAGE = 'removedFromStage';
  AS3Event.COMPLETE = 'complete';
  AS3Event.CHANGE = 'change';
  AS3Event.RESIZE = 'resize';
  AS3Event.SOUND_COMPLETE = 'soundComplete';
  AS3Event.ACTIVATE = 'activate';
  AS3Event.DEACTIVATE = 'deactivate';

  class AS3MouseEvent extends AS3Event {
    constructor(type, bubbles, cancelable, localX, localY, stageX, stageY, delta) {
      super(type, bubbles !== undefined ? bubbles : true, Boolean(cancelable));
      this.localX = Number(localX) || 0;
      this.localY = Number(localY) || 0;
      this.stageX = Number(stageX) || 0;
      this.stageY = Number(stageY) || 0;
      this.delta = Number(delta) || 0;
      this.buttonDown = false;
      this.ctrlKey = false;
      this.shiftKey = false;
      this.altKey = false;
    }
    clone() {
      return new AS3MouseEvent(this.type, this.bubbles, this.cancelable, this.localX, this.localY, this.stageX, this.stageY, this.delta);
    }
  }
  AS3MouseEvent.CLICK = 'click';
  AS3MouseEvent.DOUBLE_CLICK = 'doubleClick';
  AS3MouseEvent.MOUSE_DOWN = 'mouseDown';
  AS3MouseEvent.MOUSE_UP = 'mouseUp';
  AS3MouseEvent.MOUSE_MOVE = 'mouseMove';
  AS3MouseEvent.MOUSE_OVER = 'mouseOver';
  AS3MouseEvent.MOUSE_OUT = 'mouseOut';
  AS3MouseEvent.ROLL_OVER = 'rollOver';
  AS3MouseEvent.ROLL_OUT = 'rollOut';
  AS3MouseEvent.MOUSE_WHEEL = 'mouseWheel';

  class AS3KeyboardEvent extends AS3Event {
    constructor(type, bubbles, cancelable, charCodeValue, keyCodeValue) {
      super(type, bubbles !== undefined ? bubbles : true, Boolean(cancelable));
      this.charCode = Number(charCodeValue) || 0;
      this.keyCode = Number(keyCodeValue) || 0;
      this.keyLocation = 0;
      this.ctrlKey = false;
      this.altKey = false;
      this.shiftKey = false;
    }
    clone() {
      return new AS3KeyboardEvent(this.type, this.bubbles, this.cancelable, this.charCode, this.keyCode);
    }
  }
  AS3KeyboardEvent.KEY_DOWN = 'keyDown';
  AS3KeyboardEvent.KEY_UP = 'keyUp';

  class AS3TimerEvent extends AS3Event {
    constructor(type, bubbles, cancelable) {
      super(type, Boolean(bubbles), Boolean(cancelable));
    }
    updateAfterEvent() {}
    clone() {
      return new AS3TimerEvent(this.type, this.bubbles, this.cancelable);
    }
  }
  AS3TimerEvent.TIMER = 'timer';
  AS3TimerEvent.TIMER_COMPLETE = 'timerComplete';

  class AS3Point {
    constructor(x, y) {
      this.x = Number(x) || 0;
      this.y = Number(y) || 0;
    }
    get length() { return Math.hypot(this.x, this.y); }
    clone() { return new AS3Point(this.x, this.y); }
    offset(dx, dy) { this.x += Number(dx) || 0; this.y += Number(dy) || 0; }
    add(v) { return new AS3Point(this.x + (v ? v.x : 0), this.y + (v ? v.y : 0)); }
    subtract(v) { return new AS3Point(this.x - (v ? v.x : 0), this.y - (v ? v.y : 0)); }
    normalize(thickness) {
      const len = this.length;
      if (len > 0) {
        const s = (thickness === undefined ? 1 : Number(thickness)) / len;
        this.x *= s;
        this.y *= s;
      }
    }
    equals(o) { return Boolean(o && o.x === this.x && o.y === this.y); }
    toString() { return `(x=${this.x}, y=${this.y})`; }
  }
  AS3Point.distance = (p1, p2) => Math.hypot((p1.x || 0) - (p2.x || 0), (p1.y || 0) - (p2.y || 0));
  AS3Point.polar = (len, angle) => new AS3Point(len * Math.cos(angle), len * Math.sin(angle));
  AS3Point.interpolate = (p1, p2, f) => new AS3Point(p2.x + (p1.x - p2.x) * f, p2.y + (p1.y - p2.y) * f);

  class AS3Rectangle {
    constructor(x, y, width, height) {
      this.x = Number(x) || 0;
      this.y = Number(y) || 0;
      this.width = Number(width) || 0;
      this.height = Number(height) || 0;
    }
    get left() { return this.x; }
    set left(v) { this.width += this.x - v; this.x = v; }
    get right() { return this.x + this.width; }
    set right(v) { this.width = v - this.x; }
    get top() { return this.y; }
    set top(v) { this.height += this.y - v; this.y = v; }
    get bottom() { return this.y + this.height; }
    set bottom(v) { this.height = v - this.y; }
    contains(px, py) {
      return px >= this.x && px < this.x + this.width && py >= this.y && py < this.y + this.height;
    }
    intersects(r) {
      if (!r) return false;
      return !(r.x >= this.x + this.width || r.x + r.width <= this.x || r.y >= this.y + this.height || r.y + r.height <= this.y);
    }
    clone() { return new AS3Rectangle(this.x, this.y, this.width, this.height); }
    isEmpty() { return this.width <= 0 || this.height <= 0; }
    toString() { return `(x=${this.x}, y=${this.y}, w=${this.width}, h=${this.height})`; }
  }

  class AS3ColorTransform {
    constructor(rm, gm, bm, am, ro, go, bo, ao) {
      this.redMultiplier = rm === undefined ? 1 : Number(rm);
      this.greenMultiplier = gm === undefined ? 1 : Number(gm);
      this.blueMultiplier = bm === undefined ? 1 : Number(bm);
      this.alphaMultiplier = am === undefined ? 1 : Number(am);
      this.redOffset = Number(ro) || 0;
      this.greenOffset = Number(go) || 0;
      this.blueOffset = Number(bo) || 0;
      this.alphaOffset = Number(ao) || 0;
    }
    get color() {
      return ((clampNum(this.redOffset, 0, 255) & 0xff) << 16) |
        ((clampNum(this.greenOffset, 0, 255) & 0xff) << 8) |
        (clampNum(this.blueOffset, 0, 255) & 0xff);
    }
    set color(rgb) {
      const c = Number(rgb) || 0;
      this.redMultiplier = 0;
      this.greenMultiplier = 0;
      this.blueMultiplier = 0;
      this.redOffset = (c >> 16) & 0xff;
      this.greenOffset = (c >> 8) & 0xff;
      this.blueOffset = c & 0xff;
    }
  }

  class AS3Matrix {
    constructor(a, b, c, d, tx, ty) {
      this.a = a === undefined ? 1 : Number(a);
      this.b = Number(b) || 0;
      this.c = Number(c) || 0;
      this.d = d === undefined ? 1 : Number(d);
      this.tx = Number(tx) || 0;
      this.ty = Number(ty) || 0;
    }
    identity() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.tx = 0; this.ty = 0; }
    translate(dx, dy) { this.tx += dx; this.ty += dy; }
    scale(sx, sy) { this.a *= sx; this.b *= sy; this.c *= sx; this.d *= sy; this.tx *= sx; this.ty *= sy; }
    rotate(angle) {
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const a = this.a, b = this.b, c = this.c, d = this.d, tx = this.tx, ty = this.ty;
      this.a = a * cos - b * sin;
      this.b = a * sin + b * cos;
      this.c = c * cos - d * sin;
      this.d = c * sin + d * cos;
      this.tx = tx * cos - ty * sin;
      this.ty = tx * sin + ty * cos;
    }
    clone() { return new AS3Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty); }
  }

  class AS3BlurFilter {
    constructor(blurX, blurY, quality) {
      this.t = 'bl';
      this.blurX = blurX === undefined ? 4 : Number(blurX);
      this.blurY = blurY === undefined ? 4 : Number(blurY);
      this.quality = quality === undefined ? 1 : Number(quality);
    }
  }

  class AS3GlowFilter {
    constructor(color, alpha, blurX, blurY, strength) {
      this.t = 'gl';
      this.color = color === undefined ? 0xff0000 : Number(color);
      this.alpha = alpha === undefined ? 1 : Number(alpha);
      this.blurX = blurX === undefined ? 6 : Number(blurX);
      this.blurY = blurY === undefined ? 6 : Number(blurY);
      this.strength = strength === undefined ? 2 : Number(strength);
    }
  }

  class AS3DropShadowFilter {
    constructor(distance, angle, color, alpha, blurX, blurY, strength) {
      this.t = 'ds';
      this.distance = distance === undefined ? 4 : Number(distance);
      this.angle = angle === undefined ? 45 : Number(angle);
      this.color = color === undefined ? 0x000000 : Number(color);
      this.alpha = alpha === undefined ? 1 : Number(alpha);
      this.blurX = blurX === undefined ? 4 : Number(blurX);
      this.blurY = blurY === undefined ? 4 : Number(blurY);
      this.strength = strength === undefined ? 1 : Number(strength);
    }
  }

  class AS3ColorMatrixFilter {
    constructor(matrix) {
      this.t = 'cm';
      this.matrix = Array.isArray(matrix) && matrix.length >= 20
        ? matrix.slice(0, 20)
        : [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    }
  }

  class AS3SoundTransform {
    constructor(vol, panning) {
      this.volume = vol === undefined ? 1 : Number(vol);
      this.pan = panning === undefined ? 0 : Number(panning);
    }
  }

  class AS3SoundChannel extends BaseDispatcher {
    constructor(handle, soundTransform) {
      super();
      this._handle = handle;
      this._soundTransform = soundTransform || new AS3SoundTransform(1, 0);
      this.position = 0;
    }
    get soundTransform() { return this._soundTransform; }
    set soundTransform(v) {
      this._soundTransform = v || new AS3SoundTransform(1, 0);
      if (this._handle && this._handle.setTransform) this._handle.setTransform(this._soundTransform);
    }
    stop() {
      if (this._handle && this._handle.stop) this._handle.stop();
    }
  }

  class AS3Sound extends BaseDispatcher {
    constructor(vm, soundId) {
      super();
      this._vm = vm;
      this._soundId = Number(soundId) || 0;
    }
    play(startTime, loops, sndTransform) {
      const tr = sndTransform || new AS3SoundTransform(1, 0);
      let channel = null;
      const handle = this._vm && this._vm._soundEngine
        ? this._vm._soundEngine.playSound(this._soundId, startTime || 0, loops || 0, tr, () => {
            if (channel) channel.dispatchEvent(new AS3Event(AS3Event.SOUND_COMPLETE));
          })
        : null;
      channel = new AS3SoundChannel(handle, tr);
      return channel;
    }
  }

  class AS3Timer extends BaseDispatcher {
    constructor(vm, delay, repeatCount) {
      super();
      this._vm = vm;
      this.delay = Math.max(1, Number(delay) || 1000);
      this.repeatCount = Math.max(0, Number(repeatCount) || 0);
      this.currentCount = 0;
      this.running = false;
      this._accMs = 0;
      if (vm && vm._timers) vm._timers.add(this);
    }
    start() { this.running = true; }
    stop() { this.running = false; }
    reset() { this.running = false; this.currentCount = 0; this._accMs = 0; }
    _step(dtMs) {
      if (!this.running) return;
      this._accMs += dtMs;
      let safety = 0;
      while (this.running && this._accMs >= this.delay && safety < 8) {
        this._accMs -= this.delay;
        this.currentCount++;
        safety++;
        this.dispatchEvent(new AS3TimerEvent(AS3TimerEvent.TIMER));
        if (this.repeatCount > 0 && this.currentCount >= this.repeatCount) {
          this.running = false;
          this.dispatchEvent(new AS3TimerEvent(AS3TimerEvent.TIMER_COMPLETE));
          break;
        }
      }
    }
  }

  class AS3TextFormat {
    constructor(font, size, color, bold, italic, underline, url, target, align) {
      this.font = font || 'system-ui, sans-serif';
      this.size = size !== undefined ? Number(size) : 14;
      this.color = color !== undefined ? Number(color) : 0xffffff;
      this.bold = Boolean(bold);
      this.italic = Boolean(italic);
      this.underline = Boolean(underline);
      this.align = align || 'left';
    }
  }

  // Pure W3C SVG Drawing API (`flash.display.Graphics`)
  class AS3Graphics {
    constructor(owner) {
      this._owner = owner;
      this._cmds = [];
      this._fill = null;
      this._fillAlpha = 1;
      this._stroke = null;
      this._strokeWidth = 0;
      this._strokeAlpha = 1;
      this._curPath = '';
      this._curX = 0;
      this._curY = 0;
      this._dirty = false;
      this._bbox = { x: 0, y: 0, w: 0, h: 0 };
    }

    _expandBounds(x, y, r) {
      const pad = Number(r) || 0;
      if (this._cmds.length === 0 && !this._curPath) {
        this._bbox = { x: x - pad, y: y - pad, w: pad * 2, h: pad * 2 };
      } else {
        const minX = Math.min(this._bbox.x, x - pad);
        const minY = Math.min(this._bbox.y, y - pad);
        const maxX = Math.max(this._bbox.x + this._bbox.w, x + pad);
        const maxY = Math.max(this._bbox.y + this._bbox.h, y + pad);
        this._bbox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      }
    }

    _flushPath() {
      if (!this._curPath) return;
      this._cmds.push({
        kind: 'path',
        d: this._curPath,
        fill: this._fill,
        fillAlpha: this._fillAlpha,
        stroke: this._stroke,
        strokeWidth: this._strokeWidth,
        strokeAlpha: this._strokeAlpha,
      });
      this._curPath = '';
      this._dirty = true;
    }

    clear() {
      this._cmds = [];
      this._curPath = '';
      this._fill = null;
      this._stroke = null;
      this._strokeWidth = 0;
      this._bbox = { x: 0, y: 0, w: 0, h: 0 };
      this._dirty = true;
    }

    lineStyle(thickness, color, alpha) {
      this._flushPath();
      if (thickness === undefined || thickness === null || Number.isNaN(Number(thickness))) {
        this._stroke = null;
        this._strokeWidth = 0;
      } else {
        this._strokeWidth = Math.max(0.5, Number(thickness) || 1);
        this._stroke = hexFromRgbInt(color === undefined ? 0 : color);
        this._strokeAlpha = alpha === undefined ? 1 : clampNum(alpha, 0, 1);
      }
    }

    beginFill(color, alpha) {
      this._flushPath();
      this._fill = hexFromRgbInt(color === undefined ? 0 : color);
      this._fillAlpha = alpha === undefined ? 1 : clampNum(alpha, 0, 1);
    }

    endFill() {
      this._flushPath();
      this._fill = null;
      this._fillAlpha = 1;
    }

    moveTo(x, y) {
      const nx = Number(x) || 0;
      const ny = Number(y) || 0;
      this._curX = nx;
      this._curY = ny;
      this._curPath += `M${fmtN(nx)} ${fmtN(ny)} `;
      this._expandBounds(nx, ny, this._strokeWidth);
      this._dirty = true;
    }

    lineTo(x, y) {
      const nx = Number(x) || 0;
      const ny = Number(y) || 0;
      if (!this._curPath) this._curPath = `M${fmtN(this._curX)} ${fmtN(this._curY)} `;
      this._curPath += `L${fmtN(nx)} ${fmtN(ny)} `;
      this._curX = nx;
      this._curY = ny;
      this._expandBounds(nx, ny, this._strokeWidth);
      this._dirty = true;
    }

    curveTo(cx, cy, ax, ay) {
      const ncx = Number(cx) || 0;
      const ncy = Number(cy) || 0;
      const nax = Number(ax) || 0;
      const nay = Number(ay) || 0;
      if (!this._curPath) this._curPath = `M${fmtN(this._curX)} ${fmtN(this._curY)} `;
      this._curPath += `Q${fmtN(ncx)} ${fmtN(ncy)} ${fmtN(nax)} ${fmtN(nay)} `;
      this._curX = nax;
      this._curY = nay;
      this._expandBounds(ncx, ncy, this._strokeWidth);
      this._expandBounds(nax, nay, this._strokeWidth);
      this._dirty = true;
    }

    drawRect(x, y, w, h) {
      this._flushPath();
      const nx = Number(x) || 0, ny = Number(y) || 0, nw = Number(w) || 0, nh = Number(h) || 0;
      this._cmds.push({
        kind: 'rect',
        x: nx, y: ny, w: nw, h: nh, rx: 0,
        fill: this._fill, fillAlpha: this._fillAlpha,
        stroke: this._stroke, strokeWidth: this._strokeWidth, strokeAlpha: this._strokeAlpha,
      });
      this._expandBounds(nx, ny, 0);
      this._expandBounds(nx + nw, ny + nh, 0);
      this._dirty = true;
    }

    drawRoundRect(x, y, w, h, ew) {
      this._flushPath();
      const nx = Number(x) || 0, ny = Number(y) || 0, nw = Number(w) || 0, nh = Number(h) || 0;
      this._cmds.push({
        kind: 'rect',
        x: nx, y: ny, w: nw, h: nh, rx: (Number(ew) || 0) / 2,
        fill: this._fill, fillAlpha: this._fillAlpha,
        stroke: this._stroke, strokeWidth: this._strokeWidth, strokeAlpha: this._strokeAlpha,
      });
      this._expandBounds(nx, ny, 0);
      this._expandBounds(nx + nw, ny + nh, 0);
      this._dirty = true;
    }

    drawCircle(x, y, r) {
      this._flushPath();
      const nx = Number(x) || 0, ny = Number(y) || 0, nr = Math.max(0, Number(r) || 0);
      this._cmds.push({
        kind: 'circle',
        cx: nx, cy: ny, r: nr,
        fill: this._fill, fillAlpha: this._fillAlpha,
        stroke: this._stroke, strokeWidth: this._strokeWidth, strokeAlpha: this._strokeAlpha,
      });
      this._expandBounds(nx, ny, nr);
      this._dirty = true;
    }

    drawEllipse(x, y, w, h) {
      this._flushPath();
      const nx = Number(x) || 0, ny = Number(y) || 0, nw = Math.max(0, Number(w) || 0), nh = Math.max(0, Number(h) || 0);
      this._cmds.push({
        kind: 'ellipse',
        cx: nx + nw / 2, cy: ny + nh / 2, rx: nw / 2, ry: nh / 2,
        fill: this._fill, fillAlpha: this._fillAlpha,
        stroke: this._stroke, strokeWidth: this._strokeWidth, strokeAlpha: this._strokeAlpha,
      });
      this._expandBounds(nx, ny, 0);
      this._expandBounds(nx + nw, ny + nh, 0);
      this._dirty = true;
    }

    syncToSvg(doc, gEl) {
      if (!this._dirty || !doc || !gEl) return;
      this._flushPath();
      this._dirty = false;
      while (gEl.firstChild) gEl.removeChild(gEl.firstChild);
      for (let i = 0; i < this._cmds.length; i++) {
        const c = this._cmds[i];
        let el = null;
        if (c.kind === 'path') {
          el = doc.createElementNS(SVG_NS, 'path');
          el.setAttribute('d', c.d.trim());
          el.setAttribute('stroke-linecap', 'round');
          el.setAttribute('stroke-linejoin', 'round');
        } else if (c.kind === 'rect') {
          el = doc.createElementNS(SVG_NS, 'rect');
          el.setAttribute('x', fmtN(c.x));
          el.setAttribute('y', fmtN(c.y));
          el.setAttribute('width', fmtN(Math.max(0, c.w)));
          el.setAttribute('height', fmtN(Math.max(0, c.h)));
          if (c.rx > 0) el.setAttribute('rx', fmtN(c.rx));
        } else if (c.kind === 'circle') {
          el = doc.createElementNS(SVG_NS, 'circle');
          el.setAttribute('cx', fmtN(c.cx));
          el.setAttribute('cy', fmtN(c.cy));
          el.setAttribute('r', fmtN(c.r));
        } else if (c.kind === 'ellipse') {
          el = doc.createElementNS(SVG_NS, 'ellipse');
          el.setAttribute('cx', fmtN(c.cx));
          el.setAttribute('cy', fmtN(c.cy));
          el.setAttribute('rx', fmtN(c.rx));
          el.setAttribute('ry', fmtN(c.ry));
        }
        if (!el) continue;
        el.setAttribute('fill', c.fill || 'none');
        if (c.fill && c.fillAlpha < 0.999) el.setAttribute('fill-opacity', fmtN(c.fillAlpha));
        if (c.stroke && c.strokeWidth > 0) {
          el.setAttribute('stroke', c.stroke);
          el.setAttribute('stroke-width', fmtN(c.strokeWidth));
          if (c.strokeAlpha < 0.999) el.setAttribute('stroke-opacity', fmtN(c.strokeAlpha));
        } else {
          el.setAttribute('stroke', 'none');
        }
        gEl.appendChild(el);
      }
    }
  }

  class AS3DisplayObject extends BaseDispatcher {
    constructor(vm) {
      super();
      this._vm = vm;
      this.name = `instance${vm ? ++vm._instanceSeq : 1}`;
      this.parent = null;
      this._x = 0;
      this._y = 0;
      this._scaleX = 1;
      this._scaleY = 1;
      this._rotation = 0;
      this._alpha = 1;
      this._visible = true;
      this._filters = [];
      this._colorTransform = new AS3ColorTransform();
      this._matrix = new AS3Matrix();
      this._localBBox = { x: 0, y: 0, w: 0, h: 0 };
      this._svgEl = null;
      this._transformDirty = true;
      this._fxDirty = false;
      this._mask = null;
      this._maskTarget = null;
      this._maskClipPathId = null;
      this._maskClipPathEl = null;
      this._maskDirty = false;
      this._timelineClipPathId = null;
      this.mouseEnabled = true;
      this.buttonMode = false;
      this.useHandCursor = true;
      this.tabEnabled = false;
      this.transform = {
        get colorTransform() { return this._owner._colorTransform; },
        set colorTransform(v) {
          this._owner._colorTransform = v || new AS3ColorTransform();
          this._owner._fxDirty = true;
          this._owner._syncSvgFx();
        },
        get matrix() { return this._owner._matrix; },
        set matrix(v) {
          this._owner._matrix = v || new AS3Matrix();
          this._owner._x = this._owner._matrix.tx;
          this._owner._y = this._owner._matrix.ty;
          this._owner._transformDirty = true;
        },
        _owner: this,
      };
    }

    getEventParent() { return this.parent; }
    get stage() {
      let cur = this;
      while (cur) {
        if (cur._isStage) return cur;
        cur = cur.parent;
      }
      return null;
    }
    get root() { return this._vm ? this._vm.rootDoc : null; }

    get x() { return this._x; }
    set x(v) { this._x = Number(v) || 0; this._transformDirty = true; }
    get y() { return this._y; }
    set y(v) { this._y = Number(v) || 0; this._transformDirty = true; }
    get scaleX() { return this._scaleX; }
    set scaleX(v) { this._scaleX = Number(v); if (!Number.isFinite(this._scaleX)) this._scaleX = 1; this._transformDirty = true; }
    get scaleY() { return this._scaleY; }
    set scaleY(v) { this._scaleY = Number(v); if (!Number.isFinite(this._scaleY)) this._scaleY = 1; this._transformDirty = true; }
    get rotation() { return this._rotation; }
    set rotation(v) { this._rotation = Number(v) || 0; this._transformDirty = true; }
    get alpha() { return this._alpha; }
    set alpha(v) { this._alpha = clampNum(v, 0, 1); this._transformDirty = true; }
    get visible() { return this._visible; }
    set visible(v) { this._visible = Boolean(v); this._transformDirty = true; }
    get filters() { return this._filters; }
    set filters(arr) {
      this._filters = Array.isArray(arr) ? arr.slice() : [];
      this._fxDirty = true;
      this._syncSvgFx();
    }
    get mask() { return this._mask; }
    set mask(maskObj) {
      if (this._mask === maskObj) return;
      if (this._mask) {
        const prev = this._mask;
        this._mask = null;
        if (prev._maskTarget === this) {
          prev._maskTarget = null;
          prev._transformDirty = true;
        }
      }
      if (this._maskClipPathEl) {
        if (this._maskClipPathEl.parentNode) {
          this._maskClipPathEl.parentNode.removeChild(this._maskClipPathEl);
        }
        this._maskClipPathEl = null;
      }
      this._maskClipPathId = null;
      if (this._svgEl) {
        if (this._timelineClipPathId) {
          this._svgEl.setAttribute('clip-path', `url(#${this._timelineClipPathId})`);
        } else {
          this._svgEl.removeAttribute('clip-path');
        }
      }
      if (maskObj && maskObj instanceof AS3DisplayObject && maskObj !== this) {
        if (maskObj._maskTarget && maskObj._maskTarget !== this) {
          maskObj._maskTarget.mask = null;
        }
        this._mask = maskObj;
        maskObj._maskTarget = this;
        maskObj._transformDirty = true;
        this._maskDirty = true;
        if (this._vm && this._vm._doc) {
          this._syncDynamicMask(this._vm._doc);
        }
      }
    }

    get mouseX() {
      if (!this._vm) return 0;
      const g = this._getGlobalPosition();
      return this._vm._mouseX - g.x;
    }
    get mouseY() {
      if (!this._vm) return 0;
      const g = this._getGlobalPosition();
      return this._vm._mouseY - g.y;
    }

    get width() {
      const b = this._computeBounds();
      return b.w * Math.abs(this._scaleX);
    }
    set width(v) {
      const b = this._computeBounds();
      if (b.w > 0) this.scaleX = (Number(v) || 0) / b.w;
    }
    get height() {
      const b = this._computeBounds();
      return b.h * Math.abs(this._scaleY);
    }
    set height(v) {
      const b = this._computeBounds();
      if (b.h > 0) this.scaleY = (Number(v) || 0) / b.h;
    }

    _getGlobalTransform() {
      const chain = [];
      let cur = this;
      while (cur && !cur._isStage) {
        chain.push(cur);
        cur = cur.parent;
      }
      let gx = 0;
      let gy = 0;
      let sx = 1;
      let sy = 1;
      for (let i = chain.length - 1; i >= 0; i--) {
        const node = chain[i];
        gx += (node._x || 0) * sx;
        gy += (node._y || 0) * sy;
        sx *= node._scaleX !== undefined ? node._scaleX : 1;
        sy *= node._scaleY !== undefined ? node._scaleY : 1;
      }
      return { x: gx, y: gy, sx, sy };
    }

    _getGlobalPosition() {
      const gt = this._getGlobalTransform();
      return { x: gt.x, y: gt.y };
    }

    _computeBounds() {
      return this._localBBox || { x: 0, y: 0, w: 0, h: 0 };
    }

    getBounds() {
      const b = this._computeBounds();
      const gt = this._getGlobalTransform();
      const x1 = gt.x + b.x * gt.sx;
      const y1 = gt.y + b.y * gt.sy;
      const x2 = x1 + b.w * gt.sx;
      const y2 = y1 + b.h * gt.sy;
      return new AS3Rectangle(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
      );
    }

    hitTestObject(other) {
      if (!other || typeof other.getBounds !== 'function') return false;
      return this.getBounds().intersects(other.getBounds());
    }

    hitTestPoint(px, py) {
      return this.getBounds().contains(Number(px) || 0, Number(py) || 0);
    }

    _ensureSvg(doc) {
      if (!this._svgEl && doc) {
        this._svgEl = doc.createElementNS(SVG_NS, 'g');
        this._svgEl.setAttribute('data-as3-name', this.name);
      }
      return this._svgEl;
    }

    _syncSvgFx() {
      if (!this._svgEl || !this._vm) return;
      const fxUrl = this._vm._resolveFilterUrl(this._filters, this._colorTransform);
      if (fxUrl) {
        this._svgEl.setAttribute('filter', fxUrl);
      } else {
        this._svgEl.removeAttribute('filter');
      }
      this._fxDirty = false;
    }

    _syncDynamicMask(doc) {
      if (!this._mask || !this._vm || !this._vm._defsEl || !doc) return;
      const el = this._ensureSvg(doc);
      if (!el) return;
      const maskObj = this._mask;
      const maskEl = maskObj._ensureSvg(doc);
      if (maskObj.graphics && maskObj._graphicsEl) {
        maskObj.graphics.syncToSvg(doc, maskObj._graphicsEl);
      }
      if (!this._maskClipPathId) {
        this._maskClipPathId = `as3-dyn-mask-${++this._vm._maskSeq}`;
        const cp = doc.createElementNS(SVG_NS, 'clipPath');
        cp.setAttribute('id', this._maskClipPathId);
        cp.setAttribute('data-swf-vm-def', '1');
        this._vm._defsEl.appendChild(cp);
        this._maskClipPathEl = cp;
      }
      const cp = this._maskClipPathEl;
      while (cp.firstChild) cp.removeChild(cp.firstChild);

      const tg = this._getGlobalPosition();
      const mg = maskObj._getGlobalPosition();
      const relParts = [];
      const dx = mg.x - tg.x;
      const dy = mg.y - tg.y;
      if (dx !== 0 || dy !== 0) relParts.push(`translate(${fmtN(dx)} ${fmtN(dy)})`);
      if (maskObj._rotation !== 0) relParts.push(`rotate(${fmtN(maskObj._rotation)})`);
      if (maskObj._scaleX !== 1 || maskObj._scaleY !== 1) relParts.push(`scale(${fmtN(maskObj._scaleX)} ${fmtN(maskObj._scaleY)})`);
      this._vm._populateClipPathFromSvg(cp, maskEl, relParts.join(' '), true);
      el.setAttribute('clip-path', `url(#${this._maskClipPathId})`);
      this._maskDirty = false;
    }

    _syncSvg(doc) {
      const el = this._ensureSvg(doc);
      if (!el) return;
      const wasDirty = this._transformDirty;
      if (this._transformDirty) {
        const parts = [];
        if (this._x !== 0 || this._y !== 0) parts.push(`translate(${fmtN(this._x)} ${fmtN(this._y)})`);
        if (this._rotation !== 0) parts.push(`rotate(${fmtN(this._rotation)})`);
        if (this._scaleX !== 1 || this._scaleY !== 1) parts.push(`scale(${fmtN(this._scaleX)} ${fmtN(this._scaleY)})`);
        if (parts.length > 0) el.setAttribute('transform', parts.join(' '));
        else el.removeAttribute('transform');

        if (this._alpha < 0.999) el.setAttribute('opacity', fmtN(this._alpha));
        else el.removeAttribute('opacity');

        const hideAsMask = Boolean(this._maskTarget);
        if (!this._visible || hideAsMask) {
          el.setAttribute('display', 'none');
          if (hideAsMask) el.setAttribute('pointer-events', 'none');
        } else {
          el.removeAttribute('display');
          el.removeAttribute('pointer-events');
        }

        if (this.name) el.setAttribute('data-as3-name', this.name);
        if (this.buttonMode) el.setAttribute('cursor', 'pointer');
        this._transformDirty = false;
      }
      if (this._fxDirty) this._syncSvgFx();
      if (this._maskTarget && (wasDirty || (this.graphics && this.graphics._dirty))) {
        this._maskTarget._maskDirty = true;
      }
      if (this._mask && (this._maskDirty || wasDirty || (this._mask.graphics && this._mask.graphics._dirty))) {
        this._syncDynamicMask(doc);
      }
    }
  }

  class AS3DisplayObjectContainer extends AS3DisplayObject {
    constructor(vm) {
      super(vm);
      this._children = [];
      this.mouseChildren = true;
      this.tabChildren = true;
    }

    get numChildren() { return this._children.length; }

    addChild(child) {
      return this.addChildAt(child, this._children.length);
    }

    addChildAt(child, index) {
      if (!child || child === this) return child;
      if (child.parent && child.parent !== this && typeof child.parent.removeChild === 'function') {
        child.parent.removeChild(child);
      } else if (child.parent === this) {
        const oldIdx = this._children.indexOf(child);
        if (oldIdx >= 0) this._children.splice(oldIdx, 1);
      }
      const idx = clampNum(index, 0, this._children.length) | 0;
      const wasOnStage = Boolean(child.stage);
      child.parent = this;
      this._children.splice(idx, 0, child);

      if (this._vm && this._vm._doc) {
        const parentEl = this._ensureSvg(this._vm._doc);
        const childEl = child._ensureSvg(this._vm._doc);
        if (parentEl && childEl) {
          const refEl = this._children[idx + 1] ? this._children[idx + 1]._svgEl : null;
          if (refEl && refEl.parentNode === parentEl) parentEl.insertBefore(childEl, refEl);
          else parentEl.appendChild(childEl);
        }
        child._syncSvg(this._vm._doc);
      }

      child.dispatchEvent(new AS3Event(AS3Event.ADDED, true));
      if (!wasOnStage && this.stage) {
        this._notifyAddedToStageSubtree(child);
      }
      return child;
    }

    _notifyAddedToStageSubtree(node) {
      node.dispatchEvent(new AS3Event(AS3Event.ADDED_TO_STAGE, false));
      if (node._children) {
        for (let i = 0; i < node._children.length; i++) {
          this._notifyAddedToStageSubtree(node._children[i]);
        }
      }
    }

    removeChild(child) {
      const idx = this._children.indexOf(child);
      if (idx < 0) return child;
      return this.removeChildAt(idx);
    }

    removeChildAt(index) {
      const idx = Number(index) | 0;
      if (idx < 0 || idx >= this._children.length) return null;
      const child = this._children[idx];
      const wasOnStage = Boolean(child.stage);
      child.dispatchEvent(new AS3Event(AS3Event.REMOVED, true));
      if (wasOnStage) child.dispatchEvent(new AS3Event(AS3Event.REMOVED_FROM_STAGE, false));
      this._children.splice(idx, 1);
      child.parent = null;
      if (child._svgEl && child._svgEl.parentNode) {
        child._svgEl.parentNode.removeChild(child._svgEl);
      }
      return child;
    }

    getChildAt(index) {
      return this._children[Number(index) | 0] || null;
    }

    getChildByName(name) {
      const target = String(name || '');
      for (let i = 0; i < this._children.length; i++) {
        if (this._children[i].name === target) return this._children[i];
      }
      return null;
    }

    getChildIndex(child) { return this._children.indexOf(child); }
    contains(child) {
      let cur = child;
      while (cur) {
        if (cur === this) return true;
        cur = cur.parent;
      }
      return false;
    }

    _computeBounds() {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const include = (b, ox, oy, sx, sy) => {
        if (!b || (b.w === 0 && b.h === 0)) return;
        const x1 = ox + b.x * sx;
        const y1 = oy + b.y * sy;
        const x2 = x1 + b.w * Math.abs(sx);
        const y2 = y1 + b.h * Math.abs(sy);
        if (x1 < minX) minX = x1;
        if (y1 < minY) minY = y1;
        if (x2 > maxX) maxX = x2;
        if (y2 > maxY) maxY = y2;
      };
      if (this._localBBox && (this._localBBox.w > 0 || this._localBBox.h > 0)) {
        include(this._localBBox, 0, 0, 1, 1);
      }
      if (this.graphics && (this.graphics._bbox.w > 0 || this.graphics._bbox.h > 0)) {
        include(this.graphics._bbox, 0, 0, 1, 1);
      }
      for (let i = 0; i < this._children.length; i++) {
        const ch = this._children[i];
        if (!ch._visible) continue;
        include(ch._computeBounds(), ch._x, ch._y, ch._scaleX, ch._scaleY);
      }
      if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    _syncSvg(doc) {
      super._syncSvg(doc);
      if (this.graphics && this._graphicsEl) {
        this.graphics.syncToSvg(doc, this._graphicsEl);
      }
      for (let i = 0; i < this._children.length; i++) {
        const ch = this._children[i];
        ch._syncSvg(doc);
        if (ch._svgEl && this._svgEl && ch._svgEl.parentNode !== this._svgEl) {
          this._svgEl.appendChild(ch._svgEl);
        }
      }
    }
  }

  class AS3Shape extends AS3DisplayObject {
    constructor(vm) {
      super(vm);
      // In Flash AS3, Shape extends DisplayObject (not InteractiveObject), so static shapes & DefineText overlays never intercept clicks
      this.mouseEnabled = false;
      this.graphics = new AS3Graphics(this);
      this._graphicsEl = null;
    }
    _computeBounds() {
      if (this.graphics && (this.graphics._bbox.w > 0 || this.graphics._bbox.h > 0)) {
        return this.graphics._bbox;
      }
      return super._computeBounds();
    }
    _ensureSvg(doc) {
      const el = super._ensureSvg(doc);
      if (el && !this._graphicsEl && doc) {
        this._graphicsEl = doc.createElementNS(SVG_NS, 'g');
        this._graphicsEl.setAttribute('data-as3-graphics', '1');
        el.appendChild(this._graphicsEl);
      }
      return el;
    }
    _syncSvg(doc) {
      super._syncSvg(doc);
      if (this.graphics && this._graphicsEl) {
        this.graphics.syncToSvg(doc, this._graphicsEl);
      }
    }
  }

  class AS3Sprite extends AS3DisplayObjectContainer {
    constructor(vm) {
      super(vm);
      this.graphics = new AS3Graphics(this);
      this._graphicsEl = null;
      this._dragging = false;
    }
    _ensureSvg(doc) {
      const el = super._ensureSvg(doc);
      if (el && !this._graphicsEl && doc) {
        this._graphicsEl = doc.createElementNS(SVG_NS, 'g');
        this._graphicsEl.setAttribute('data-as3-graphics', '1');
        el.insertBefore(this._graphicsEl, el.firstChild);
      }
      return el;
    }
    startDrag() { this._dragging = true; if (this._vm) this._vm._dragTarget = this; }
    stopDrag() { this._dragging = false; if (this._vm && this._vm._dragTarget === this) this._vm._dragTarget = null; }
  }

  class AS3MovieClip extends AS3Sprite {
    constructor(vm, timelineDef) {
      super(vm);
      this._timelineDef = timelineDef || null;
      const frLen = timelineDef && Array.isArray(timelineDef.fr) ? timelineDef.fr.length : 0;
      this.totalFrames = Math.max(1, (timelineDef && timelineDef.fc) || frLen || 1);
      this.currentFrame = 1;
      this._playing = this.totalFrames > 1;
      this._frameScripts = new Map();
      this._labels = (timelineDef && timelineDef.l) || [];
      this._timelineMountedFrame = 0;
      this._timelineByDepth = new Map();
      this._lastScriptFrame = 0;
    }
    get currentLabel() {
      let lbl = null;
      for (let i = 0; i < this._labels.length; i++) {
        if (this._labels[i].frame <= this.currentFrame) lbl = this._labels[i].name;
      }
      return lbl;
    }
    play() { this._playing = true; }
    stop() { this._playing = false; }
    nextFrame() { this.gotoAndStop(Math.min(this.totalFrames, this.currentFrame + 1)); }
    prevFrame() { this.gotoAndStop(Math.max(1, this.currentFrame - 1)); }
    _resolveFrame(frame) {
      if (typeof frame === 'string') {
        const hit = this._labels.find((l) => l.name === frame || l.name.toLowerCase() === frame.toLowerCase());
        return hit ? hit.frame : 1;
      }
      return clampNum(Number(frame) || 1, 1, this.totalFrames) | 0;
    }
    _syncTimeline() {
      if (!this._vm || !this._timelineDef || !Array.isArray(this._timelineDef.fr) || this._timelineDef.fr.length === 0) {
        return;
      }
      if (this._timelineMountedFrame === this.currentFrame) return;
      this._timelineMountedFrame = this.currentFrame;
      this._vm._syncTimelineFrame(this, this._timelineDef, this.currentFrame);
    }
    gotoAndPlay(frame) {
      this.currentFrame = this._resolveFrame(frame);
      this._playing = true;
      this._syncTimeline();
      this._runFrameScript();
    }
    gotoAndStop(frame) {
      this.currentFrame = this._resolveFrame(frame);
      this._playing = false;
      this._syncTimeline();
      this._runFrameScript();
    }
    addFrameScript() {
      for (let i = 0; i + 1 < arguments.length; i += 2) {
        const frame1Based = (Number(arguments[i]) | 0) + 1;
        const fn = arguments[i + 1];
        if (typeof fn === 'function') this._frameScripts.set(frame1Based, fn);
        else this._frameScripts.delete(frame1Based);
      }
    }
    _runFrameScript() {
      const fn = this._frameScripts.get(this.currentFrame);
      this._lastScriptFrame = this.currentFrame;
      if (typeof fn === 'function') fn.call(this);
    }
    _stepTimeline() {
      if (this._lastScriptFrame === 0 && this._frameScripts.has(this.currentFrame)) {
        this._syncTimeline();
        this._runFrameScript();
      } else if (this._playing && this.totalFrames > 1) {
        this.currentFrame = this.currentFrame >= this.totalFrames ? 1 : this.currentFrame + 1;
        this._syncTimeline();
        this._runFrameScript();
      }
      for (let i = 0; i < this._children.length; i++) {
        if (typeof this._children[i]._stepTimeline === 'function') {
          this._children[i]._stepTimeline();
        }
      }
    }
  }

  class AS3SimpleButton extends AS3DisplayObject {
    constructor(vm, upState, overState, downState, hitTestState) {
      super(vm);
      this.upState = upState || null;
      this.overState = overState || null;
      this.downState = downState || null;
      this.hitTestState = hitTestState || upState || null;
      this.enabled = true;
      this.buttonMode = true;
      this._state = 'up';
    }
    _computeBounds() {
      const target = this.hitTestState || this.upState;
      return target && typeof target._computeBounds === 'function' ? target._computeBounds() : super._computeBounds();
    }
    _syncSvg(doc) {
      super._syncSvg(doc);
      if (!this._svgEl || !doc) return;
      const active =
        this._state === 'down' && this.downState ? this.downState
        : this._state === 'over' && this.overState ? this.overState
        : this.upState;
      while (this._svgEl.firstChild) this._svgEl.removeChild(this._svgEl.firstChild);
      if (active) {
        active._syncSvg(doc);
        if (active._svgEl) this._svgEl.appendChild(active._svgEl);
      }
    }
  }

  class AS3TextField extends AS3DisplayObject {
    constructor(vm, def) {
      super(vm);
      this._text = (def && def.t) || '';
      this._type = def && def.ed ? 'input' : 'dynamic';
      this._width = (def && def.w) || 200;
      this._height = (def && def.h) || 28;
      this._fontSize = (def && def.fs) || 16;
      this._textColor = def && def.col ? parseInt(String(def.col).replace('#', ''), 16) || 0xffffff : 0xffffff;
      this._align = def && def.al === 1 ? 'right' : def && def.al === 2 ? 'center' : 'left';
      this._border = Boolean(def && def.bd);
      this._borderColor = 0x475569;
      this._background = false;
      this._backgroundColor = 0x0f172a;
      this._maxChars = (def && def.mx) || 0;
      this._displayAsPassword = Boolean(def && def.pw);
      this._multiline = Boolean(def && def.ml);
      this._selectable = true;
      this._defaultTextFormat = new AS3TextFormat('system-ui, sans-serif', this._fontSize, this._textColor, false, false, false, '', '', this._align);
      this._localBBox = { x: (def && def.x) || 0, y: (def && def.y) || 0, w: this._width, h: this._height };
      this._bgRectEl = null;
      this._textEl = null;
      this._caretEl = null;
      this._textDirty = true;
      this._focused = false;
    }
    get text() { return this._text; }
    set text(v) {
      let next = v === null || v === undefined ? '' : String(v);
      if (this._maxChars > 0 && next.length > this._maxChars) next = next.slice(0, this._maxChars);
      if (next !== this._text) {
        this._text = next;
        this._textDirty = true;
      }
    }
    get htmlText() { return this._text; }
    set htmlText(v) {
      let clean = String(v ?? '');
      let prev;
      do {
        prev = clean;
        clean = clean.replace(/<[^>]*>/g, '');
      } while (clean !== prev);
      this.text = clean.replace(/[<>]/g, '');
    }
    get type() { return this._type; }
    set type(v) { this._type = v === 'input' ? 'input' : 'dynamic'; this._textDirty = true; }
    get width() { return this._width; }
    set width(v) { this._width = Math.max(0, Number(v) || 0); this._localBBox.w = this._width; this._textDirty = true; }
    get height() { return this._height; }
    set height(v) { this._height = Math.max(0, Number(v) || 0); this._localBBox.h = this._height; this._textDirty = true; }
    get textColor() { return this._textColor; }
    set textColor(v) { this._textColor = Number(v) || 0; this._textDirty = true; }
    get border() { return this._border; }
    set border(v) { this._border = Boolean(v); this._textDirty = true; }
    get borderColor() { return this._borderColor; }
    set borderColor(v) { this._borderColor = Number(v) || 0; this._textDirty = true; }
    get background() { return this._background; }
    set background(v) { this._background = Boolean(v); this._textDirty = true; }
    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(v) { this._backgroundColor = Number(v) || 0; this._textDirty = true; }
    get maxChars() { return this._maxChars; }
    set maxChars(v) { this._maxChars = Math.max(0, Number(v) | 0); }
    get displayAsPassword() { return this._displayAsPassword; }
    set displayAsPassword(v) { this._displayAsPassword = Boolean(v); this._textDirty = true; }
    get defaultTextFormat() { return this._defaultTextFormat; }
    set defaultTextFormat(fmt) { this.setTextFormat(fmt); }
    setTextFormat(fmt) {
      if (!fmt) return;
      this._defaultTextFormat = fmt;
      if (fmt.size) this._fontSize = Number(fmt.size) || this._fontSize;
      if (fmt.color !== undefined) this._textColor = Number(fmt.color) || 0;
      if (fmt.align) this._align = String(fmt.align);
      this._textDirty = true;
    }
    appendText(s) { this.text = this._text + String(s ?? ''); }

    _handleCharInput(key) {
      if (this._type !== 'input') return false;
      let changed = false;
      if (key === 'Backspace') {
        if (this._text.length > 0) {
          this._text = this._text.slice(0, -1);
          changed = true;
        }
      } else if (typeof key === 'string' && key.length === 1 && key >= ' ') {
        if (this._maxChars === 0 || this._text.length < this._maxChars) {
          this._text += key;
          changed = true;
        }
      }
      if (changed) {
        this._textDirty = true;
        this.dispatchEvent(new AS3Event(AS3Event.CHANGE, true));
      }
      return changed;
    }

    _ensureSvg(doc) {
      const el = super._ensureSvg(doc);
      if (el && !this._textEl && doc) {
        this._bgRectEl = doc.createElementNS(SVG_NS, 'rect');
        this._bgRectEl.setAttribute('rx', '3');
        this._textEl = doc.createElementNS(SVG_NS, 'text');
        this._textEl.setAttribute('font-family', 'system-ui, sans-serif');
        this._caretEl = doc.createElementNS(SVG_NS, 'line');
        this._caretEl.setAttribute('stroke', '#38bdf8');
        this._caretEl.setAttribute('stroke-width', '1.5');
        this._caretEl.setAttribute('display', 'none');
        el.appendChild(this._bgRectEl);
        el.appendChild(this._textEl);
        el.appendChild(this._caretEl);
      }
      return el;
    }

    _syncSvg(doc) {
      super._syncSvg(doc);
      if (!this._textEl) return;
      if (this._textDirty) {
        const bx = this._localBBox.x || 0;
        const by = this._localBBox.y || 0;
        const bw = Math.max(20, this._width || 120);
        const bh = Math.max(this._fontSize + 6, this._height || 24);
        const showBox = this._border || this._background || this._type === 'input';
        if (showBox) {
          this._bgRectEl.setAttribute('x', fmtN(bx));
          this._bgRectEl.setAttribute('y', fmtN(by));
          this._bgRectEl.setAttribute('width', fmtN(bw));
          this._bgRectEl.setAttribute('height', fmtN(bh));
          this._bgRectEl.setAttribute('fill', this._background ? hexFromRgbInt(this._backgroundColor) : 'rgba(15,23,42,0.72)');
          this._bgRectEl.setAttribute('stroke', this._focused ? '#38bdf8' : hexFromRgbInt(this._borderColor));
          this._bgRectEl.setAttribute('stroke-width', this._focused ? '1.5' : '1');
          this._bgRectEl.removeAttribute('display');
        } else {
          this._bgRectEl.setAttribute('display', 'none');
        }

        const anchor = this._align === 'right' ? 'end' : this._align === 'center' ? 'middle' : 'start';
        const tx = this._align === 'right' ? bx + bw - 6 : this._align === 'center' ? bx + bw / 2 : bx + 6;
        const ty = by + Math.min(bh - 4, Math.max(this._fontSize, bh * 0.72));
        this._textEl.setAttribute('x', fmtN(tx));
        this._textEl.setAttribute('y', fmtN(ty));
        this._textEl.setAttribute('fill', hexFromRgbInt(this._textColor));
        this._textEl.setAttribute('font-size', String(this._fontSize));
        this._textEl.setAttribute('text-anchor', anchor);
        if (this._defaultTextFormat && this._defaultTextFormat.bold) {
          this._textEl.setAttribute('font-weight', '700');
        }
        const shown = this._displayAsPassword ? '•'.repeat(this._text.length) : this._text;
        this._textEl.textContent = shown;

        if (this._focused && this._type === 'input') {
          const estX = bx + 8 + shown.length * (this._fontSize * 0.56);
          this._caretEl.setAttribute('x1', fmtN(estX));
          this._caretEl.setAttribute('x2', fmtN(estX));
          this._caretEl.setAttribute('y1', fmtN(by + 4));
          this._caretEl.setAttribute('y2', fmtN(by + bh - 4));
          this._caretEl.removeAttribute('display');
        } else {
          this._caretEl.setAttribute('display', 'none');
        }
        this._textDirty = false;
      }
    }
  }

  class AS3Stage extends AS3DisplayObjectContainer {
    constructor(vm, w, h, fps) {
      super(vm);
      this._isStage = true;
      this.name = 'stage';
      this.stageWidth = w || 800;
      this.stageHeight = h || 480;
      this.frameRate = fps || 24;
      this.scaleMode = 'showAll';
      this.align = '';
      this.quality = 'HIGH';
      this._focus = null;
    }
    get focus() { return this._focus; }
    set focus(target) {
      if (this._focus && this._focus._focused) {
        this._focus._focused = false;
        this._focus._textDirty = true;
      }
      this._focus = target || null;
      if (this._focus && this._focus._type === 'input') {
        this._focus._focused = true;
        this._focus._textDirty = true;
      }
    }
  }

  const AS3Keyboard = Object.freeze({
    BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CONTROL: 17, ESCAPE: 27, SPACE: 32,
    PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36,
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, DELETE: 46,
    NUMBER_0: 48, NUMBER_1: 49, NUMBER_2: 50, NUMBER_3: 51, NUMBER_4: 52,
    NUMBER_5: 53, NUMBER_6: 54, NUMBER_7: 55, NUMBER_8: 56, NUMBER_9: 57,
    A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74,
    K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84,
    U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
  });

  // ---------------------------------------------------------------------------
  // 4. AS3 Class Descriptor & AVM2 Bytecode Execution Engine
  // ---------------------------------------------------------------------------
  class AS3ClassDescriptor {
    constructor(opts) {
      this.qname = opts.qname;
      this.simpleName = opts.simpleName || opts.qname.split('.').pop();
      this.superClass = opts.superClass || null;
      this.abc = opts.abc || null;
      this.instInfo = opts.instInfo || null;
      this.classInfo = opts.classInfo || null;
      this.nativeCtor = opts.nativeCtor || null;
      this.staticObj = opts.staticObj || {};
      this.instanceTraits = new Map();
      this.staticTraits = new Map();
      this.instanceSlots = []; // 1-based slotId -> trait
      this.staticSlots = [];
      this.cinitDone = false;
      this.symbolCharId = opts.symbolCharId || 0;
      this.scopeChain = opts.scopeChain || [];
    }
  }

  class AVM2BudgetExceededError extends Error {
    constructor(limit) {
      super(`AVM2 instruction budget exceeded (${limit} ops)`);
      this.name = 'AVM2BudgetExceededError';
    }
  }

  // ---------------------------------------------------------------------------
  // 4b. Everyday AS3 Data & Offline Persistence APIs:
  //     flash.utils.Endian, flash.utils.ByteArray, flash.net.SharedObject,
  //     __AS3__.vec.Vector
  // ---------------------------------------------------------------------------
  const AS3Endian = {
    BIG_ENDIAN: 'bigEndian',
    LITTLE_ENDIAN: 'littleEndian',
  };

  const MAX_BYTEARRAY_BYTES = 8 * 1024 * 1024;

  function encodeUtf8Bytes(str) {
    const s = String(str == null ? '' : str);
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    const out = [];
    for (let i = 0; i < s.length; i++) {
      let c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(out);
  }

  function decodeUtf8Bytes(bytes) {
    if (typeof TextDecoder !== 'undefined') {
      try { return new TextDecoder('utf-8').decode(bytes); } catch (_) {}
    }
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return s;
  }

  class AS3ByteArray {
    constructor() {
      this._buf = new Uint8Array(64);
      this._len = 0;
      this._pos = 0;
      this.endian = AS3Endian.BIG_ENDIAN;
      this.objectEncoding = 3;
    }
    get position() { return this._pos; }
    set position(v) { this._pos = Math.max(0, Math.min(MAX_BYTEARRAY_BYTES, Number(v) >>> 0)); }
    get length() { return this._len; }
    set length(v) {
      const next = Math.max(0, Math.min(MAX_BYTEARRAY_BYTES, Number(v) >>> 0));
      if (next > this._buf.length) this._ensureCap(next);
      if (next < this._len) this._buf.fill(0, next, this._len);
      this._len = next;
      if (this._pos > this._len) this._pos = this._len;
    }
    get bytesAvailable() { return Math.max(0, this._len - this._pos); }
    _isLE() { return this.endian === AS3Endian.LITTLE_ENDIAN; }
    _ensureCap(needed) {
      if (needed > MAX_BYTEARRAY_BYTES) throw new RangeError('ByteArray exceeds 8 MB offline safety cap');
      if (needed <= this._buf.length) return;
      let cap = Math.max(64, this._buf.length);
      while (cap < needed) cap = Math.min(MAX_BYTEARRAY_BYTES, cap * 2);
      const next = new Uint8Array(cap);
      next.set(this._buf.subarray(0, this._len), 0);
      this._buf = next;
    }
    _advanceWrite(n) {
      this._pos += n;
      if (this._pos > this._len) this._len = this._pos;
    }
    clear() { this._len = 0; this._pos = 0; }
    writeByte(v) {
      this._ensureCap(this._pos + 1);
      this._buf[this._pos] = Number(v) & 0xff;
      this._advanceWrite(1);
    }
    writeBoolean(v) { this.writeByte(v ? 1 : 0); }
    writeShort(v) {
      this._ensureCap(this._pos + 2);
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      dv.setInt16(this._pos, Number(v) | 0, this._isLE());
      this._advanceWrite(2);
    }
    writeInt(v) {
      this._ensureCap(this._pos + 4);
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      dv.setInt32(this._pos, Number(v) | 0, this._isLE());
      this._advanceWrite(4);
    }
    writeUnsignedInt(v) {
      this._ensureCap(this._pos + 4);
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      dv.setUint32(this._pos, Number(v) >>> 0, this._isLE());
      this._advanceWrite(4);
    }
    writeFloat(v) {
      this._ensureCap(this._pos + 4);
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      dv.setFloat32(this._pos, Number(v) || 0, this._isLE());
      this._advanceWrite(4);
    }
    writeDouble(v) {
      this._ensureCap(this._pos + 8);
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      dv.setFloat64(this._pos, Number(v) || 0, this._isLE());
      this._advanceWrite(8);
    }
    writeUTFBytes(str) {
      const bytes = encodeUtf8Bytes(str);
      this._ensureCap(this._pos + bytes.length);
      this._buf.set(bytes, this._pos);
      this._advanceWrite(bytes.length);
    }
    writeUTF(str) {
      const bytes = encodeUtf8Bytes(str);
      this.writeShort(bytes.length & 0xffff);
      this._ensureCap(this._pos + bytes.length);
      this._buf.set(bytes, this._pos);
      this._advanceWrite(bytes.length);
    }
    writeBytes(src, offset, len) {
      if (!(src instanceof AS3ByteArray)) return;
      const off = Math.max(0, Number(offset) >>> 0);
      const avail = Math.max(0, src._len - off);
      const count = len && Number(len) > 0 ? Math.min(avail, Number(len) >>> 0) : avail;
      if (count <= 0) return;
      this._ensureCap(this._pos + count);
      this._buf.set(src._buf.subarray(off, off + count), this._pos);
      this._advanceWrite(count);
    }
    readUnsignedByte() {
      if (this._pos + 1 > this._len) return 0;
      return this._buf[this._pos++];
    }
    readByte() {
      const b = this.readUnsignedByte();
      return b & 0x80 ? b - 256 : b;
    }
    readBoolean() { return this.readUnsignedByte() !== 0; }
    readUnsignedShort() {
      if (this._pos + 2 > this._len) { this._pos = this._len; return 0; }
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      const v = dv.getUint16(this._pos, this._isLE());
      this._pos += 2;
      return v;
    }
    readShort() {
      if (this._pos + 2 > this._len) { this._pos = this._len; return 0; }
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      const v = dv.getInt16(this._pos, this._isLE());
      this._pos += 2;
      return v;
    }
    readInt() {
      if (this._pos + 4 > this._len) { this._pos = this._len; return 0; }
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      const v = dv.getInt32(this._pos, this._isLE());
      this._pos += 4;
      return v;
    }
    readUnsignedInt() {
      if (this._pos + 4 > this._len) { this._pos = this._len; return 0; }
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      const v = dv.getUint32(this._pos, this._isLE());
      this._pos += 4;
      return v;
    }
    readFloat() {
      if (this._pos + 4 > this._len) { this._pos = this._len; return 0; }
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      const v = dv.getFloat32(this._pos, this._isLE());
      this._pos += 4;
      return v;
    }
    readDouble() {
      if (this._pos + 8 > this._len) { this._pos = this._len; return 0; }
      const dv = new DataView(this._buf.buffer, this._buf.byteOffset);
      const v = dv.getFloat64(this._pos, this._isLE());
      this._pos += 8;
      return v;
    }
    readUTFBytes(len) {
      const count = Math.min(this.bytesAvailable, Math.max(0, Number(len) >>> 0));
      const slice = this._buf.subarray(this._pos, this._pos + count);
      this._pos += count;
      return decodeUtf8Bytes(slice);
    }
    readUTF() {
      const byteLen = this.readUnsignedShort();
      return this.readUTFBytes(byteLen);
    }
    readBytes(dest, offset, len) {
      if (!(dest instanceof AS3ByteArray)) return;
      const count = len && Number(len) > 0 ? Math.min(this.bytesAvailable, Number(len) >>> 0) : this.bytesAvailable;
      if (count <= 0) return;
      const off = Math.max(0, Number(offset) >>> 0);
      dest._ensureCap(off + count);
      dest._buf.set(this._buf.subarray(this._pos, this._pos + count), off);
      if (off + count > dest._len) dest._len = off + count;
      this._pos += count;
    }
    toString() {
      return decodeUtf8Bytes(this._buf.subarray(0, this._len));
    }
  }

  // Offline-only local SharedObject store (zero cloud egress)
  const _sharedObjectStore = new Map();

  function _sanitizeSoKey(name, localPath) {
    const cleanName = String(name || 'default').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 96);
    const cleanPath = String(localPath || '/').replace(/[^a-zA-Z0-9._/-]/g, '_').slice(0, 64);
    return `ast_swf_so_${cleanPath}_${cleanName}`;
  }

  class AS3SharedObject extends BaseDispatcher {
    constructor(storageKey, initialData) {
      super();
      this._storageKey = storageKey;
      this.data = initialData && typeof initialData === 'object' ? initialData : {};
    }
    get size() {
      try { return JSON.stringify(this.data || {}).length; } catch (_) { return 0; }
    }
    flush() {
      try {
        const serialized = JSON.stringify(this.data || {});
        if (serialized.length > 512 * 1024) return 'pending';
        _sharedObjectStore.set(this._storageKey, serialized);
        if (typeof global !== 'undefined' && global.localStorage) {
          try { global.localStorage.setItem(this._storageKey, serialized); } catch (_) {}
        }
        return 'flushed';
      } catch (_) {
        return 'pending';
      }
    }
    clear() {
      this.data = {};
      _sharedObjectStore.delete(this._storageKey);
      if (typeof global !== 'undefined' && global.localStorage) {
        try { global.localStorage.removeItem(this._storageKey); } catch (_) {}
      }
    }
    close() {}
    static getLocal(name, localPath) {
      const key = _sanitizeSoKey(name, localPath);
      let raw = _sharedObjectStore.get(key);
      if (raw === undefined && typeof global !== 'undefined' && global.localStorage) {
        try { raw = global.localStorage.getItem(key) || undefined; } catch (_) {}
      }
      let parsed = {};
      if (typeof raw === 'string' && raw.length > 0) {
        try {
          const obj = JSON.parse(raw);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) parsed = obj;
        } catch (_) {}
      }
      return new AS3SharedObject(key, parsed);
    }
  }

  function _coerceVectorElem(val, elemType) {
    if (!elemType || elemType === '*' || elemType === 'Object') return val;
    if (elemType === 'int') return Number(val) | 0;
    if (elemType === 'uint') return Number(val) >>> 0;
    if (elemType === 'Number') return Number(val);
    if (elemType === 'Boolean') return Boolean(val);
    if (elemType === 'String') return val === null || val === undefined ? null : String(val);
    return val;
  }

  function _defaultVectorElem(elemType) {
    if (elemType === 'int' || elemType === 'uint' || elemType === 'Number') return 0;
    if (elemType === 'Boolean') return false;
    return null;
  }

  class AS3Vector {
    constructor(length, fixed, elemType) {
      this._elemType = elemType || '*';
      this._fixed = Boolean(fixed);
      const len = Math.max(0, Math.min(100000, Number(length) >>> 0));
      this._items = new Array(len);
      const def = _defaultVectorElem(this._elemType);
      for (let i = 0; i < len; i++) this._items[i] = def;
    }
    get length() { return this._items.length; }
    set length(v) {
      if (this._fixed) return;
      const next = Math.max(0, Math.min(100000, Number(v) >>> 0));
      const prev = this._items.length;
      this._items.length = next;
      if (next > prev) {
        const def = _defaultVectorElem(this._elemType);
        for (let i = prev; i < next; i++) this._items[i] = def;
      }
    }
    get fixed() { return this._fixed; }
    set fixed(v) { this._fixed = Boolean(v); }
    _getAt(idx) { return this._items[idx]; }
    _setAt(idx, val) {
      if (idx < 0 || (this._fixed && idx >= this._items.length)) return;
      this._items[idx] = _coerceVectorElem(val, this._elemType);
    }
    push() {
      if (this._fixed) return this._items.length;
      for (let i = 0; i < arguments.length; i++) {
        this._items.push(_coerceVectorElem(arguments[i], this._elemType));
      }
      return this._items.length;
    }
    pop() { return this._fixed ? undefined : this._items.pop(); }
    shift() { return this._fixed ? undefined : this._items.shift(); }
    unshift() {
      if (this._fixed) return this._items.length;
      const vals = [];
      for (let i = 0; i < arguments.length; i++) vals.push(_coerceVectorElem(arguments[i], this._elemType));
      return this._items.unshift(...vals);
    }
    slice(s, e) {
      const out = new AS3Vector(0, false, this._elemType);
      out._items = this._items.slice(s, e);
      return out;
    }
    splice(start, deleteCount) {
      if (this._fixed) return new AS3Vector(0, false, this._elemType);
      const add = [];
      for (let i = 2; i < arguments.length; i++) add.push(_coerceVectorElem(arguments[i], this._elemType));
      const removed = this._items.splice(start, deleteCount === undefined ? this._items.length : deleteCount, ...add);
      const out = new AS3Vector(0, false, this._elemType);
      out._items = removed;
      return out;
    }
    concat() {
      const out = new AS3Vector(0, false, this._elemType);
      out._items = this._items.slice();
      for (let i = 0; i < arguments.length; i++) {
        const a = arguments[i];
        if (a instanceof AS3Vector) out._items.push(...a._items);
        else if (Array.isArray(a)) out._items.push(...a.map((x) => _coerceVectorElem(x, this._elemType)));
        else out._items.push(_coerceVectorElem(a, this._elemType));
      }
      return out;
    }
    indexOf(val, from) { return this._items.indexOf(val, from); }
    lastIndexOf(val, from) { return from === undefined ? this._items.lastIndexOf(val) : this._items.lastIndexOf(val, from); }
    reverse() { this._items.reverse(); return this; }
    sort(cmp) {
      if (typeof cmp === 'function') this._items.sort(cmp);
      else if (this._elemType === 'int' || this._elemType === 'uint' || this._elemType === 'Number') this._items.sort((a, b) => a - b);
      else this._items.sort();
      return this;
    }
    join(sep) { return this._items.join(sep); }
    forEach(fn, thisArg) { this._items.forEach((v, i) => fn.call(thisArg, v, i, this)); }
    map(fn, thisArg) {
      const out = new AS3Vector(0, false, this._elemType);
      out._items = this._items.map((v, i) => _coerceVectorElem(fn.call(thisArg, v, i, this), this._elemType));
      return out;
    }
    filter(fn, thisArg) {
      const out = new AS3Vector(0, false, this._elemType);
      out._items = this._items.filter((v, i) => fn.call(thisArg, v, i, this));
      return out;
    }
    every(fn, thisArg) { return this._items.every((v, i) => fn.call(thisArg, v, i, this)); }
    some(fn, thisArg) { return this._items.some((v, i) => fn.call(thisArg, v, i, this)); }
    toString() { return this._items.join(','); }
  }

  function decodeKeyCode(key, code) {
    const map = {
      ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40,
      ' ': 32, Space: 32, Enter: 13, Escape: 27, Backspace: 8, Tab: 9, Shift: 16, Control: 17,
    };
    if (map[key]) return map[key];
    if (map[code]) return map[code];
    if (typeof key === 'string' && key.length === 1) return key.toUpperCase().charCodeAt(0);
    return 0;
  }

  // ---------------------------------------------------------------------------
  // 5. ASTAVM2Runtime — Host Pure-SVG ActionScript 3 Micro-VM
  // ---------------------------------------------------------------------------
  class ASTAVM2Runtime {
    constructor(programOrB64, opts) {
      const options = opts || {};
      this.engine = options.engine || null;
      this._doc = options.doc || (typeof document !== 'undefined' ? document : null);
      this._stageSvg = options.stageSvg || null;
      this._container = options.container || null;

      if (typeof programOrB64 === 'string') {
        this.program = JSON.parse(base64ToUtf8(programOrB64));
      } else {
        this.program = programOrB64 || {};
      }

      this.swfVer = this.program.swfVer || 10;
      this.width = this.program.w || 800;
      this.height = this.program.h || 480;
      this.fps = this.program.fps || 24;
      this.bgColor = this.program.bg || '#0f172a';
      this.isAs3 = true;

      this._mounted = false;
      this._tickCount = 0;
      this._elapsedMs = 0;
      this._frameAccSec = 0;
      this._instanceSeq = 0;
      this._mouseX = 0;
      this._mouseY = 0;
      this._dragTarget = null;
      this._keysDown = new Set();
      this._traces = [];
      this._warnings = [];
      this._budgetHits = 0;
      this._budgetRemaining = MAX_OPS_PER_TICK;
      this._callDepth = 0;
      this._timers = new Set();
      this._intervals = new Map();
      this._intervalSeq = 0;
      this._filterCache = new Map();
      this._filterSeq = 0;
      this._maskSeq = 0;
      this._defsEl = null;
      this._rootGroup = null;
      this._gestureUnregister = null;
      this._standaloneCleanup = null;

      this._soundEngine = new AVM2SoundEngine(this.program.sn || {});
      this.traits = (this.engine && this.engine.traits) || createTraitRegistry();
      if (this.engine && !this.engine.traits) this.engine.traits = this.traits;

      this._classes = new Map();       // qname -> AS3ClassDescriptor
      this._simpleClasses = new Map(); // simpleName -> AS3ClassDescriptor
      this._globalScope = {};
      this._parsedAbcs = [];
      this.stage = null;
      this.rootDoc = null;
      this.rootClip = null; // alias for bridge/engine compatibility

      this._initBuiltinClasses();
    }

    _registerBuiltin(qname, nativeCtor, staticObj, superQName) {
      const simpleName = qname.split('.').pop();
      const desc = new AS3ClassDescriptor({
        qname,
        simpleName,
        superClass: superQName ? this._classes.get(superQName) || null : null,
        nativeCtor,
        staticObj: staticObj || nativeCtor || {},
      });
      this._classes.set(qname, desc);
      if (!this._simpleClasses.has(simpleName)) {
        this._simpleClasses.set(simpleName, desc);
      }
      this._globalScope[simpleName] = desc;
      this._globalScope[qname] = desc;
      return desc;
    }

    _initBuiltinClasses() {
      const self = this;

      // Global functions & primitives
      this._globalScope.trace = function () {
        const msg = Array.from(arguments).map((a) => (a === undefined ? 'undefined' : a === null ? 'null' : String(a))).join(' ');
        self._traces.push(msg);
        if (self._traces.length > 512) self._traces.shift();
      };
      this._globalScope.Math = Math;
      this._globalScope.Array = Array;
      this._globalScope.Object = Object;
      this._globalScope.String = String;
      this._globalScope.Number = Number;
      this._globalScope.Boolean = Boolean;
      this._globalScope.int = function int(v) { return Number(v) | 0; };
      this._globalScope.uint = function uint(v) { return Number(v) >>> 0; };
      this._globalScope.Date = Date;
      this._globalScope.RegExp = RegExp;
      this._globalScope.Error = Error;
      this._globalScope.parseInt = parseInt;
      this._globalScope.parseFloat = parseFloat;
      this._globalScope.isNaN = isNaN;
      this._globalScope.isFinite = isFinite;
      this._globalScope.escape = escape;
      this._globalScope.unescape = unescape;
      this._globalScope.undefined = undefined;
      this._globalScope.NaN = NaN;
      this._globalScope.Infinity = Infinity;
      this._globalScope.getTimer = () => Math.round(self._elapsedMs);
      this._globalScope.getDefinitionByName = (name) => self._resolveClass(String(name || '').replace('::', '.'));
      this._globalScope.setTimeout = (fn, ms) => {
        const id = ++self._intervalSeq;
        self._intervals.set(id, { fn, delay: Math.max(1, Number(ms) || 1), acc: 0, once: true });
        return id;
      };
      this._globalScope.clearTimeout = (id) => self._intervals.delete(id);
      this._globalScope.setInterval = (fn, ms) => {
        const id = ++self._intervalSeq;
        self._intervals.set(id, { fn, delay: Math.max(1, Number(ms) || 1), acc: 0, once: false });
        return id;
      };
      this._globalScope.clearInterval = (id) => self._intervals.delete(id);

      // flash.events
      this._registerBuiltin('flash.events.Event', function (t, b, c) { return new AS3Event(t, b, c); }, AS3Event);
      this._registerBuiltin('flash.events.MouseEvent', function (t, b, c, lx, ly) { return new AS3MouseEvent(t, b, c, lx, ly); }, AS3MouseEvent, 'flash.events.Event');
      this._registerBuiltin('flash.events.KeyboardEvent', function (t, b, c, ch, kc) { return new AS3KeyboardEvent(t, b, c, ch, kc); }, AS3KeyboardEvent, 'flash.events.Event');
      this._registerBuiltin('flash.events.TimerEvent', function (t, b, c) { return new AS3TimerEvent(t, b, c); }, AS3TimerEvent, 'flash.events.Event');
      this._registerBuiltin('flash.events.EventDispatcher', function (t) { return new BaseDispatcher(t); }, {});

      // flash.display
      this._registerBuiltin('flash.display.DisplayObject', function () { return new AS3DisplayObject(self); }, {}, 'flash.events.EventDispatcher');
      this._registerBuiltin('flash.display.InteractiveObject', function () { return new AS3DisplayObject(self); }, {}, 'flash.display.DisplayObject');
      this._registerBuiltin('flash.display.DisplayObjectContainer', function () { return new AS3DisplayObjectContainer(self); }, {}, 'flash.display.InteractiveObject');
      this._registerBuiltin('flash.display.Shape', function () { return new AS3Shape(self); }, {}, 'flash.display.DisplayObject');
      this._registerBuiltin('flash.display.Sprite', function () { return new AS3Sprite(self); }, {}, 'flash.display.DisplayObjectContainer');
      this._registerBuiltin('flash.display.MovieClip', function (def) { return new AS3MovieClip(self, def); }, {}, 'flash.display.Sprite');
      this._registerBuiltin('flash.display.SimpleButton', function (u, o, d, h) { return new AS3SimpleButton(self, u, o, d, h); }, {}, 'flash.display.InteractiveObject');
      this._registerBuiltin('flash.display.Stage', function () { return self.stage; }, {}, 'flash.display.DisplayObjectContainer');
      this._registerBuiltin('flash.display.Graphics', function () { return new AS3Graphics(null); }, {});

      // flash.text
      this._registerBuiltin('flash.text.TextField', function () { return new AS3TextField(self); }, { TYPE_INPUT: 'input', TYPE_DYNAMIC: 'dynamic' }, 'flash.display.InteractiveObject');
      this._registerBuiltin('flash.text.TextFieldType', function () { return {}; }, { INPUT: 'input', DYNAMIC: 'dynamic' });
      this._registerBuiltin('flash.text.TextFormat', function () { return new AS3TextFormat(...arguments); }, {});

      // flash.geom
      this._registerBuiltin('flash.geom.Point', function (x, y) { return new AS3Point(x, y); }, AS3Point);
      this._registerBuiltin('flash.geom.Rectangle', function (x, y, w, h) { return new AS3Rectangle(x, y, w, h); }, {});
      this._registerBuiltin('flash.geom.ColorTransform', function () { return new AS3ColorTransform(...arguments); }, {});
      this._registerBuiltin('flash.geom.Matrix', function () { return new AS3Matrix(...arguments); }, {});

      // flash.filters
      this._registerBuiltin('flash.filters.BlurFilter', function () { return new AS3BlurFilter(...arguments); }, {});
      this._registerBuiltin('flash.filters.GlowFilter', function () { return new AS3GlowFilter(...arguments); }, {});
      this._registerBuiltin('flash.filters.DropShadowFilter', function () { return new AS3DropShadowFilter(...arguments); }, {});
      this._registerBuiltin('flash.filters.ColorMatrixFilter', function () { return new AS3ColorMatrixFilter(...arguments); }, {});

      // flash.media
      this._registerBuiltin('flash.media.Sound', function (req) {
        return new AS3Sound(self, req && req._soundId ? req._soundId : 0);
      }, {}, 'flash.events.EventDispatcher');
      this._registerBuiltin('flash.media.SoundChannel', function () { return new AS3SoundChannel(null); }, {}, 'flash.events.EventDispatcher');
      this._registerBuiltin('flash.media.SoundTransform', function (v, p) { return new AS3SoundTransform(v, p); }, {});
      this._registerBuiltin('flash.media.SoundMixer', function () { return {}; }, {
        stopAll: () => self._soundEngine.stopAll(),
      });

      // flash.utils & flash.ui
      this._registerBuiltin('flash.utils.Timer', function (d, r) { return new AS3Timer(self, d, r); }, {}, 'flash.events.EventDispatcher');
      this._registerBuiltin('flash.utils.Dictionary', function () { return new Map(); }, {});
      this._registerBuiltin('flash.utils.Endian', function () { return {}; }, AS3Endian);
      this._registerBuiltin('flash.utils.ByteArray', function () { return new AS3ByteArray(); }, {});
      this._registerBuiltin('flash.ui.Keyboard', function () { return {}; }, AS3Keyboard);

      // __AS3__.vec.Vector
      this._registerBuiltin('__AS3__.vec.Vector', function (len, fixed) { return new AS3Vector(len, fixed, '*'); }, {});

      // Offline-safe flash.net (SharedObject = local offline persistence; zero external network requests)
      this._registerBuiltin('flash.net.SharedObject', function () { return AS3SharedObject.getLocal('default'); }, {
        getLocal: (name, localPath) => AS3SharedObject.getLocal(name, localPath),
      }, 'flash.events.EventDispatcher');
      this._registerBuiltin('flash.net.URLRequest', function (u) { return { url: String(u || '') }; }, {});
      this._registerBuiltin('flash.net.URLLoader', function () {
        const d = new BaseDispatcher();
        d.load = (req) => {
          self._warnings.push(`Blocked offline network request: ${(req && req.url) || 'unknown'}`);
        };
        return d;
      }, {}, 'flash.events.EventDispatcher');
    }

    _resolveClass(name) {
      if (!name) return null;
      const clean = String(name).replace(/::/g, '.');
      return this._classes.get(clean) || this._simpleClasses.get(clean) || this._simpleClasses.get(clean.split('.').pop()) || null;
    }

    _loadAbcBlocks() {
      const blocks = Array.isArray(this.program.abc) ? this.program.abc : [];
      this._parsedAbcs = [];
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (!b || !b.b64) continue;
        try {
          const bytes = base64ToBytes(b.b64);
          const abc = parseAbcFile(bytes, b.n || `abc_${i}`);
          this._parsedAbcs.push(abc);
          this._registerAbcBlueprintTraits(abc);
        } catch (err) {
          this._warnings.push(`ABC parse error (${b.n || i}): ${err.message}`);
        }
      }

      // Run script initializers in order
      for (let i = 0; i < this._parsedAbcs.length; i++) {
        const abc = this._parsedAbcs[i];
        for (let s = 0; s < abc.scripts.length; s++) {
          const script = abc.scripts[s];
          const scriptObj = this._globalScope;
          // Pre-register script traits
          for (let t = 0; t < script.traits.length; t++) {
            const tr = script.traits[t];
            if (tr.kind === 4) {
              // Class trait — pre-build descriptor so forward references resolve cleanly
              this._ensureAbcClass(abc, tr.classIdx, [scriptObj]);
            }
          }
          if (abc.methods[script.init] && abc.methods[script.init].body) {
            this._execMethod(abc, script.init, scriptObj, [], [scriptObj]);
          }
        }
      }
    }

    _registerAbcBlueprintTraits(abc) {
      const sym = this.program.sym || {};
      const charByClass = new Map();
      Object.keys(sym).forEach((cid) => charByClass.set(sym[cid], Number(cid)));

      for (let i = 0; i < abc.instances.length; i++) {
        const inst = abc.instances[i];
        const slots = [];
        const methods = [];
        for (let t = 0; t < inst.traits.length; t++) {
          const tr = inst.traits[t];
          if (tr.kind === 0 || tr.kind === 6) {
            slots.push({ name: tr.name, type: tr.typeName, kind: tr.kind === 6 ? 'const' : 'var' });
          } else if (tr.kind === 1 || tr.kind === 2 || tr.kind === 3) {
            const m = abc.methods[tr.methodIdx];
            methods.push({
              name: tr.name,
              params: m ? m.paramTypes.map((pt) => (abc.cpool.multinames[pt] && abc.cpool.multinames[pt].qname) || '*') : [],
              returnType: m ? m.returnType : '*',
            });
          }
        }
        this.traits.register({
          name: inst.qname,
          superName: inst.superName,
          source: 'as3',
          charId: charByClass.get(inst.qname) ?? charByClass.get(inst.name),
          isDocumentClass: inst.qname === this.program.dc || inst.name === this.program.dc,
          slots,
          methods,
          events: [],
        });
      }
    }

    _ensureAbcClass(abc, classIdx, scopeChain) {
      const inst = abc.instances[classIdx];
      const cls = abc.classes[classIdx];
      if (!inst || !cls) return null;

      let desc = this._classes.get(inst.qname);
      if (desc && desc.abc === abc && desc.instInfo === inst) return desc;

      const superCls = this._resolveClass(inst.superName);
      const sym = this.program.sym || {};
      let symCharId = 0;
      Object.keys(sym).forEach((cid) => {
        if (sym[cid] === inst.qname || sym[cid] === inst.name) symCharId = Number(cid);
      });

      desc = new AS3ClassDescriptor({
        qname: inst.qname,
        simpleName: inst.name,
        superClass: superCls,
        abc,
        instInfo: inst,
        classInfo: cls,
        symbolCharId: symCharId,
        scopeChain: scopeChain ? scopeChain.slice() : [this._globalScope],
      });

      // Populate instance traits & slots
      let nextSlot = 1;
      for (let i = 0; i < inst.traits.length; i++) {
        const tr = inst.traits[i];
        desc.instanceTraits.set(tr.name, tr);
        if (tr.kind === 0 || tr.kind === 6) {
          const sid = tr.slotId || nextSlot++;
          desc.instanceSlots[sid] = tr;
        }
      }

      // Populate static traits & slots
      let nextStaticSlot = 1;
      for (let i = 0; i < cls.traits.length; i++) {
        const tr = cls.traits[i];
        desc.staticTraits.set(tr.name, tr);
        if (tr.kind === 0 || tr.kind === 6) {
          const sid = tr.slotId || nextStaticSlot++;
          desc.staticSlots[sid] = tr;
          desc.staticObj[tr.name] = resolveConstantValue(abc.cpool, tr.vindex, tr.vkind);
        } else if (tr.kind === 1) {
          desc.staticObj[tr.name] = (...args) => this._execMethod(abc, tr.methodIdx, desc.staticObj, args, desc.scopeChain);
        }
      }

      this._classes.set(desc.qname, desc);
      this._simpleClasses.set(desc.simpleName, desc);
      this._globalScope[desc.simpleName] = desc;
      this._globalScope[desc.qname] = desc;

      // Run cinit once
      if (!desc.cinitDone) {
        desc.cinitDone = true;
        if (abc.methods[cls.cinit] && abc.methods[cls.cinit].body) {
          this._execMethod(abc, cls.cinit, desc.staticObj, [], desc.scopeChain);
        }
      }

      return desc;
    }

    _instantiateClass(clsDesc, args) {
      if (!clsDesc) return {};
      if (typeof clsDesc === 'function') {
        return new clsDesc(...(args || []));
      }

      // Built-in native class directly
      if (clsDesc.nativeCtor && !clsDesc.abc) {
        const inst = clsDesc.nativeCtor.apply(null, args || []);
        if (inst && typeof inst === 'object') inst._as3Class = clsDesc;
        return inst;
      }

      // Find nearest native ancestor to allocate host backing object (Sprite / MovieClip / Sound / EventDispatcher / etc.)
      let nativeAncestor = clsDesc.superClass;
      while (nativeAncestor && !nativeAncestor.nativeCtor) {
        nativeAncestor = nativeAncestor.superClass;
      }

      let obj;
      if (nativeAncestor && nativeAncestor.qname === 'flash.media.Sound') {
        obj = new AS3Sound(this, clsDesc.symbolCharId || 0);
      } else if (nativeAncestor && nativeAncestor.qname === 'flash.display.MovieClip') {
        const isRootDocClass = clsDesc.qname === this.program.dc || clsDesc.simpleName === this.program.dc;
        const tlDef = clsDesc.symbolCharId > 0
          ? (this.program.sp && this.program.sp[clsDesc.symbolCharId])
          : (isRootDocClass ? { fc: this.program.fc || 1, l: this.program.l || [], fr: this.program.fr || [] } : null);
        obj = new AS3MovieClip(this, tlDef);
      } else if (nativeAncestor && nativeAncestor.nativeCtor) {
        obj = nativeAncestor.nativeCtor.apply(null, []);
      } else {
        obj = {};
      }
      obj._as3Class = clsDesc;

      // Collect class chain [topAbcSuper, ..., clsDesc] so derived traits override base traits
      const chain = [];
      let cur = clsDesc;
      while (cur && cur.abc) {
        chain.push(cur);
        cur = cur.superClass;
      }
      chain.reverse();

      for (let ci = 0; ci < chain.length; ci++) {
        const c = chain[ci];
        c.instanceTraits.forEach((tr, name) => {
          if (tr.kind === 0 || tr.kind === 6) {
            let defVal = resolveConstantValue(c.abc.cpool, tr.vindex, tr.vkind);
            if (defVal === undefined) {
              if (tr.typeName === 'int' || tr.typeName === 'uint') defVal = 0;
              else if (tr.typeName === 'Number') defVal = 0;
              else if (tr.typeName === 'Boolean') defVal = false;
              else if (tr.typeName === 'String') defVal = null;
              else defVal = null;
            }
            if (!(name in obj)) obj[name] = defVal;
          } else if (tr.kind === 1) {
            // Bound method closure so `addEventListener(Event.ENTER_FRAME, onFrame)` preserves `this`!
            const abcRef = c.abc;
            const mIdx = tr.methodIdx;
            const scRef = c.scopeChain;
            obj[name] = (...mArgs) => this._execMethod(abcRef, mIdx, obj, mArgs, scRef);
          } else if (tr.kind === 2 || tr.kind === 3) {
            const existing = Object.getOwnPropertyDescriptor(obj, name) || {};
            const abcRef = c.abc;
            const mIdx = tr.methodIdx;
            const scRef = c.scopeChain;
            if (tr.kind === 2) {
              existing.get = () => this._execMethod(abcRef, mIdx, obj, [], scRef);
            } else {
              existing.set = (val) => this._execMethod(abcRef, mIdx, obj, [val], scRef);
            }
            existing.configurable = true;
            existing.enumerable = true;
            Object.defineProperty(obj, name, existing);
          }
        });
      }

      // If this class is bound to a SymbolClass Sprite or Document Class (charId === 0), attach timeline children
      if (clsDesc.symbolCharId > 0 && this.program.sp && this.program.sp[clsDesc.symbolCharId]) {
        if (obj instanceof AS3MovieClip) obj._syncTimeline();
        else this._syncTimelineFrame(obj, this.program.sp[clsDesc.symbolCharId], 1);
      } else if (clsDesc.qname === this.program.dc || clsDesc.simpleName === this.program.dc) {
        if (obj instanceof AS3MovieClip) obj._syncTimeline();
        else this._syncTimelineFrame(obj, { fr: this.program.fr || [] }, 1);
      }

      // Run instance constructor (iinit)
      if (clsDesc.abc && clsDesc.instInfo && clsDesc.abc.methods[clsDesc.instInfo.iinit]) {
        const initM = clsDesc.abc.methods[clsDesc.instInfo.iinit];
        if (initM && initM.body) {
          this._execMethod(clsDesc.abc, clsDesc.instInfo.iinit, obj, args || [], clsDesc.scopeChain);
        }
      }

      return obj;
    }

    _resolveMultiname(cpool, idx, stack) {
      const mn = cpool.multinames[idx];
      if (!mn) return { name: '', qname: '' };
      let name = mn.name;
      let ns = mn.ns || '';
      if (mn.isRuntimeName) {
        const raw = stack.pop();
        name = raw === null || raw === undefined ? '' : String(raw);
      }
      if (mn.isRuntimeNs) {
        const rawNs = stack.pop();
        ns = rawNs && typeof rawNs === 'object' ? (rawNs.name || '') : String(rawNs || '');
      }
      return { name, ns, qname: ns ? `${ns}.${name}` : name, mn };
    }

    _findInScopes(scopes, mnInfo, strict) {
      // Search scope chain top-down
      for (let i = scopes.length - 1; i >= 0; i--) {
        const sc = scopes[i];
        if (!sc || (typeof sc !== 'object' && typeof sc !== 'function')) continue;
        if (sc instanceof AS3ClassDescriptor) {
          if (mnInfo.name in sc.staticObj) return sc.staticObj;
        } else if (mnInfo.name in sc) {
          return sc;
        } else if (mnInfo.qname && mnInfo.qname in sc) {
          return sc;
        }
      }
      // Check registered classes (e.g. flash.events.Event / Sprite / DocumentClass)
      const cls = this._resolveClass(mnInfo.qname) || this._resolveClass(mnInfo.name);
      if (cls) return this._globalScope;
      if (mnInfo.name in this._globalScope) return this._globalScope;
      if (strict) return this._globalScope;
      return this._globalScope;
    }

    _getProp(obj, name, qname) {
      if (obj === null || obj === undefined) return undefined;
      if (obj instanceof AS3ClassDescriptor) {
        if (name in obj.staticObj) return obj.staticObj[name];
        return obj[name];
      }
      if (obj === this._globalScope) {
        if (qname && this._classes.has(qname)) return this._classes.get(qname);
        if (name in this._globalScope) return this._globalScope[name];
        const c = this._resolveClass(qname) || this._resolveClass(name);
        if (c) return c;
      }
      if (obj instanceof Map) return obj.get(name);
      if (obj instanceof AS3Vector) {
        const nIdx = Number(name);
        if (Number.isInteger(nIdx) && nIdx >= 0 && String(nIdx) === String(name)) return obj._getAt(nIdx);
      }
      if (obj instanceof AS3ByteArray) {
        const nIdx = Number(name);
        if (Number.isInteger(nIdx) && nIdx >= 0 && String(nIdx) === String(name)) {
          return nIdx < obj._len ? obj._buf[nIdx] : 0;
        }
      }
      if (name in obj) return obj[name];
      if (typeof obj.getChildByName === 'function') {
        const ch = obj.getChildByName(name);
        if (ch) return ch;
      }
      return obj[name];
    }

    _setProp(obj, name, val) {
      if (obj === null || obj === undefined) return;
      if (obj instanceof AS3ClassDescriptor) {
        obj.staticObj[name] = val;
        return;
      }
      if (obj instanceof Map) {
        obj.set(name, val);
        return;
      }
      if (obj instanceof AS3Vector) {
        const nIdx = Number(name);
        if (Number.isInteger(nIdx) && nIdx >= 0 && String(nIdx) === String(name)) {
          obj._setAt(nIdx, val);
          return;
        }
      }
      if (obj instanceof AS3ByteArray) {
        const nIdx = Number(name);
        if (Number.isInteger(nIdx) && nIdx >= 0 && String(nIdx) === String(name)) {
          obj._ensureCap(nIdx + 1);
          obj._buf[nIdx] = Number(val) & 0xff;
          if (nIdx + 1 > obj._len) obj._len = nIdx + 1;
          return;
        }
      }
      obj[name] = val;
    }

    _coerceType(val, typeName) {
      if (!typeName || typeName === '*') return val;
      if (typeName === 'int') return Number(val) | 0;
      if (typeName === 'uint') return Number(val) >>> 0;
      if (typeName === 'Number') return Number(val);
      if (typeName === 'Boolean') return Boolean(val);
      if (typeName === 'String') return val === null || val === undefined ? null : String(val);
      return val;
    }

    _execMethod(abc, methodIdx, thisObj, args, outerScopes) {
      const method = abc.methods[methodIdx];
      if (!method || !method.body) return undefined;
      if (this._callDepth >= MAX_CALL_DEPTH) {
        this._warnings.push('AVM2 max call stack depth reached');
        return undefined;
      }

      const body = method.body;
      const code = body.code;
      const codeLen = code.length;
      const cpool = abc.cpool;

      const locals = new Array(Math.max(body.localCount, method.paramCount + 1));
      locals[0] = thisObj !== undefined ? thisObj : this._globalScope;
      const argArr = args || [];
      const optStart = method.paramCount - (method.optionals ? method.optionals.length : 0);
      for (let i = 0; i < method.paramCount; i++) {
        if (i < argArr.length) {
          locals[i + 1] = argArr[i];
        } else if (i >= optStart && method.optionals) {
          locals[i + 1] = method.optionals[i - optStart];
        } else {
          locals[i + 1] = undefined;
        }
      }
      // NEED_REST (0x04) or NEED_ARGUMENTS (0x01)
      if (method.flags & 0x04) {
        locals[method.paramCount + 1] = argArr.slice(method.paramCount);
      } else if (method.flags & 0x01) {
        locals[method.paramCount + 1] = argArr.slice();
      }

      const stack = [];
      const scopes = outerScopes ? outerScopes.slice() : [this._globalScope];
      let pc = 0;
      let callOps = 0;

      const readU8 = () => (pc < codeLen ? code[pc++] : 0);
      const readS8 = () => { const b = readU8(); return b & 0x80 ? b - 256 : b; };
      const readS24 = () => {
        if (pc + 3 > codeLen) { pc = codeLen; return 0; }
        let v = code[pc] | (code[pc + 1] << 8) | (code[pc + 2] << 16);
        pc += 3;
        if (v & 0x800000) v |= ~0xffffff;
        return v;
      };
      const readU30 = () => {
        let res = 0, shift = 0;
        for (let i = 0; i < 5; i++) {
          if (pc >= codeLen) return res >>> 0;
          const b = code[pc++];
          res |= (b & 0x7f) << shift;
          if ((b & 0x80) === 0) break;
          shift += 7;
        }
        return res >>> 0;
      };

      this._callDepth++;
      try {
        while (pc < codeLen) {
          if (++callOps > MAX_OPS_PER_CALL || --this._budgetRemaining <= 0) {
            this._budgetHits++;
            throw new AVM2BudgetExceededError(MAX_OPS_PER_TICK);
          }

          const opPc = pc;
          const op = code[pc++];

          try {
            switch (op) {
              case 0x01: // bkpt
              case 0x02: // nop
              case 0x09: // label
                break;

              case 0x03: { // throw
                const errVal = stack.pop();
                throw errVal;
              }

              case 0x04: { // getsuper
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const obj = stack.pop();
                stack.push(this._getProp(obj, mn.name, mn.qname));
                break;
              }
              case 0x05: { // setsuper
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const val = stack.pop();
                const obj = stack.pop();
                this._setProp(obj, mn.name, val);
                break;
              }

              case 0x08: { // kill
                locals[readU30()] = undefined;
                break;
              }

              // Branching
              case 0x0c: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (!(v1 < v2)) pc += off; break; }
              case 0x0d: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (!(v1 <= v2)) pc += off; break; }
              case 0x0e: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (!(v1 > v2)) pc += off; break; }
              case 0x0f: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (!(v1 >= v2)) pc += off; break; }
              case 0x10: { pc += readS24(); break; } // jump
              case 0x11: { const off = readS24(); if (Boolean(stack.pop())) pc += off; break; }
              case 0x12: { const off = readS24(); if (!Boolean(stack.pop())) pc += off; break; }
              case 0x13: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 == v2) pc += off; break; }
              case 0x14: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 != v2) pc += off; break; }
              case 0x15: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 < v2) pc += off; break; }
              case 0x16: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 <= v2) pc += off; break; }
              case 0x17: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 > v2) pc += off; break; }
              case 0x18: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 >= v2) pc += off; break; }
              case 0x19: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 === v2) pc += off; break; }
              case 0x1a: { const off = readS24(); const v2 = stack.pop(), v1 = stack.pop(); if (v1 !== v2) pc += off; break; }
              case 0x1b: { // lookupswitch
                const defOff = readS24();
                const maxIdx = readU30();
                const offsets = [];
                for (let k = 0; k <= maxIdx; k++) offsets.push(readS24());
                const idx = stack.pop() | 0;
                pc = opPc + (idx >= 0 && idx <= maxIdx ? offsets[idx] : defOff);
                break;
              }

              case 0x1c: // pushwith
              case 0x30: { // pushscope
                scopes.push(stack.pop());
                break;
              }
              case 0x1d: { // popscope
                scopes.pop();
                break;
              }

              case 0x1e: { // nextname
                const idx = (stack.pop() | 0) - 1;
                const obj = stack.pop();
                const keys = obj && typeof obj === 'object' ? Object.keys(obj) : [];
                stack.push(idx >= 0 && idx < keys.length ? keys[idx] : '');
                break;
              }
              case 0x23: { // nextvalue
                const idx = (stack.pop() | 0) - 1;
                const obj = stack.pop();
                const keys = obj && typeof obj === 'object' ? Object.keys(obj) : [];
                stack.push(idx >= 0 && idx < keys.length ? obj[keys[idx]] : undefined);
                break;
              }
              case 0x32: { // hasnext2
                const objReg = readU30();
                const idxReg = readU30();
                const obj = locals[objReg];
                const curIdx = (locals[idxReg] | 0);
                const keys = obj && typeof obj === 'object' ? Object.keys(obj) : [];
                if (curIdx < keys.length) {
                  locals[idxReg] = curIdx + 1;
                  stack.push(true);
                } else {
                  locals[objReg] = null;
                  locals[idxReg] = 0;
                  stack.push(false);
                }
                break;
              }

              // Constants & stack manipulation
              case 0x20: stack.push(null); break;
              case 0x21: stack.push(undefined); break;
              case 0x24: stack.push(readS8()); break;
              case 0x25: stack.push(readU30() | 0); break;
              case 0x26: stack.push(true); break;
              case 0x27: stack.push(false); break;
              case 0x28: stack.push(NaN); break;
              case 0x29: stack.pop(); break;
              case 0x2a: stack.push(stack[stack.length - 1]); break;
              case 0x2b: { const a = stack.pop(), b = stack.pop(); stack.push(a, b); break; }
              case 0x2c: stack.push(cpool.strings[readU30()] || ''); break;
              case 0x2d: stack.push(cpool.ints[readU30()] | 0); break;
              case 0x2e: stack.push(cpool.uints[readU30()] >>> 0); break;
              case 0x2f: stack.push(cpool.doubles[readU30()]); break;

              // Functions & calls
              case 0x40: { // newfunction
                const mIdx = readU30();
                const capturedScopes = scopes.slice();
                const fn = (...fnArgs) => this._execMethod(abc, mIdx, this._globalScope, fnArgs, capturedScopes);
                stack.push(fn);
                break;
              }
              case 0x41: { // call
                const argc = readU30();
                const callArgs = argc > 0 ? stack.splice(stack.length - argc, argc) : [];
                const receiver = stack.pop();
                const fn = stack.pop();
                if (typeof fn === 'function') stack.push(fn.apply(receiver, callArgs));
                else stack.push(undefined);
                break;
              }
              case 0x42: { // construct
                const argc = readU30();
                const callArgs = argc > 0 ? stack.splice(stack.length - argc, argc) : [];
                const ctor = stack.pop();
                stack.push(this._instantiateClass(ctor, callArgs));
                break;
              }
              case 0x44: { // callstatic
                const mIdx = readU30();
                const argc = readU30();
                const callArgs = argc > 0 ? stack.splice(stack.length - argc, argc) : [];
                const receiver = stack.pop();
                stack.push(this._execMethod(abc, mIdx, receiver, callArgs, scopes));
                break;
              }
              case 0x45: // callsuper
              case 0x4e: { // callsupervoid
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const argc = readU30();
                const callArgs = argc > 0 ? stack.splice(stack.length - argc, argc) : [];
                const receiver = stack.pop();
                const fn = this._getProp(receiver, mn.name, mn.qname);
                const ret = typeof fn === 'function' ? fn.apply(receiver, callArgs) : undefined;
                if (op === 0x45) stack.push(ret);
                break;
              }
              case 0x46: // callproperty
              case 0x4c: // callproplex
              case 0x4f: { // callpropvoid
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const argc = readU30();
                const callArgs = argc > 0 ? stack.splice(stack.length - argc, argc) : [];
                const receiver = stack.pop();
                const fn = this._getProp(receiver, mn.name, mn.qname);
                let ret;
                if (typeof fn === 'function') {
                  ret = fn.apply(op === 0x4c ? null : receiver, callArgs);
                } else if (fn instanceof AS3ClassDescriptor) {
                  // AS3 cast / conversion call e.g. Number(x) / int(x) / String(x)
                  ret = this._coerceType(callArgs[0], fn.simpleName);
                }
                if (op !== 0x4f) stack.push(ret);
                break;
              }
              case 0x47: return undefined; // returnvoid
              case 0x48: return stack.pop(); // returnvalue
              case 0x49: { // constructsuper
                const argc = readU30();
                const callArgs = argc > 0 ? stack.splice(stack.length - argc, argc) : [];
                const obj = stack.pop();
                const superCls = obj && obj._as3Class ? obj._as3Class.superClass : null;
                if (superCls && superCls.abc && superCls.instInfo) {
                  this._execMethod(superCls.abc, superCls.instInfo.iinit, obj, callArgs, superCls.scopeChain);
                }
                break;
              }
              case 0x4a: { // constructprop
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const argc = readU30();
                const callArgs = argc > 0 ? stack.splice(stack.length - argc, argc) : [];
                const obj = stack.pop();
                const ctor = this._getProp(obj, mn.name, mn.qname) || this._resolveClass(mn.qname) || this._resolveClass(mn.name);
                stack.push(this._instantiateClass(ctor, callArgs));
                break;
              }
              case 0x53: { // applytype (e.g. Vector.<int>)
                const argCount = readU30();
                const typeArgs = argCount > 0 ? stack.splice(stack.length - argCount, argCount) : [];
                const baseType = stack.pop();
                const elemTypeObj = typeArgs[0];
                const elemTypeName =
                  elemTypeObj instanceof AS3ClassDescriptor
                    ? elemTypeObj.simpleName
                    : (typeof elemTypeObj === 'function' ? elemTypeObj.name : '*');
                const specialized = new AS3ClassDescriptor({
                  qname: `${(baseType && baseType.qname) || '__AS3__.vec.Vector'}.<${elemTypeName}>`,
                  simpleName: `Vector.<${elemTypeName}>`,
                  nativeCtor: function (len, fixed) {
                    if (Array.isArray(len)) {
                      const v = new AS3Vector(0, false, elemTypeName);
                      for (let i = 0; i < len.length; i++) v.push(len[i]);
                      return v;
                    }
                    return new AS3Vector(len, fixed, elemTypeName);
                  },
                });
                stack.push(specialized);
                break;
              }

              case 0x55: { // newobject
                const argc = readU30();
                const o = {};
                const pairs = stack.splice(stack.length - argc * 2, argc * 2);
                for (let k = 0; k < pairs.length; k += 2) o[String(pairs[k])] = pairs[k + 1];
                stack.push(o);
                break;
              }
              case 0x56: { // newarray
                const argc = readU30();
                stack.push(argc > 0 ? stack.splice(stack.length - argc, argc) : []);
                break;
              }
              case 0x57: { // newactivation
                stack.push({});
                break;
              }
              case 0x58: { // newclass
                const cIdx = readU30();
                stack.pop(); // baseClass on stack
                const desc = this._ensureAbcClass(abc, cIdx, scopes);
                stack.push(desc);
                break;
              }
              case 0x5a: { // newcatch
                readU30();
                stack.push({});
                break;
              }

              // Scope & property lookup
              case 0x5d: // findpropstrict
              case 0x5e: // findproperty
              case 0x5f: { // finddef
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                stack.push(this._findInScopes(scopes, mn, op === 0x5d));
                break;
              }
              case 0x60: { // getlex
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const owner = this._findInScopes(scopes, mn, true);
                stack.push(this._getProp(owner, mn.name, mn.qname));
                break;
              }
              case 0x61: // setproperty
              case 0x67: { // initproperty
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const val = stack.pop();
                const obj = stack.pop();
                this._setProp(obj, mn.name, val);
                break;
              }
              case 0x62: stack.push(locals[readU30()]); break;
              case 0x63: locals[readU30()] = stack.pop(); break;
              case 0x64: stack.push(this._globalScope); break;
              case 0x65: stack.push(scopes[readU8()] || this._globalScope); break;
              case 0x66: { // getproperty
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const obj = stack.pop();
                stack.push(this._getProp(obj, mn.name, mn.qname));
                break;
              }
              case 0x68: { // deleteproperty
                const mn = this._resolveMultiname(cpool, readU30(), stack);
                const obj = stack.pop();
                if (obj && typeof obj === 'object') {
                  if (obj instanceof Map) stack.push(obj.delete(mn.name));
                  else stack.push(delete obj[mn.name]);
                } else {
                  stack.push(false);
                }
                break;
              }
              case 0x6a: { // getslot
                const sid = readU30();
                const obj = stack.pop();
                const cls = obj && obj._as3Class;
                const tr = cls && cls.instanceSlots[sid];
                stack.push(tr ? obj[tr.name] : obj && obj[`__slot_${sid}`]);
                break;
              }
              case 0x6b: { // setslot
                const sid = readU30();
                const val = stack.pop();
                const obj = stack.pop();
                const cls = obj && obj._as3Class;
                const tr = cls && cls.instanceSlots[sid];
                if (obj && typeof obj === 'object') {
                  if (tr) obj[tr.name] = val;
                  else obj[`__slot_${sid}`] = val;
                }
                break;
              }
              case 0x6c: { // getglobalslot
                const sid = readU30();
                stack.push(this._globalScope[`__gslot_${sid}`]);
                break;
              }
              case 0x6d: { // setglobalslot
                const sid = readU30();
                this._globalScope[`__gslot_${sid}`] = stack.pop();
                break;
              }

              // Coercions & conversions
              case 0x70: { const v = stack.pop(); stack.push(v === null ? 'null' : v === undefined ? 'undefined' : String(v)); break; }
              case 0x73: stack.push(Number(stack.pop()) | 0); break;
              case 0x74: stack.push(Number(stack.pop()) >>> 0); break;
              case 0x75: stack.push(Number(stack.pop())); break;
              case 0x76: stack.push(Boolean(stack.pop())); break;
              case 0x80: { // coerce
                const mn = cpool.multinames[readU30()];
                stack.push(this._coerceType(stack.pop(), mn ? mn.name : '*'));
                break;
              }
              case 0x82: break; // coerce_a
              case 0x85: { const v = stack.pop(); stack.push(v === null || v === undefined ? null : String(v)); break; }
              case 0x86: { readU30(); break; } // astype
              case 0x87: { const t = stack.pop(); const v = stack.pop(); stack.push(v); void t; break; }

              // Arithmetic & logic
              case 0x90: stack.push(-Number(stack.pop())); break;
              case 0x91: stack.push(Number(stack.pop()) + 1); break;
              case 0x92: { const r = readU30(); locals[r] = Number(locals[r]) + 1; break; }
              case 0x93: stack.push(Number(stack.pop()) - 1); break;
              case 0x94: { const r = readU30(); locals[r] = Number(locals[r]) - 1; break; }
              case 0x95: { const v = stack.pop(); stack.push(v === null ? 'object' : typeof v); break; }
              case 0x96: stack.push(!Boolean(stack.pop())); break;
              case 0x97: stack.push(~(Number(stack.pop()) | 0)); break;

              case 0xa0: { const b = stack.pop(), a = stack.pop(); stack.push((typeof a === 'string' || typeof b === 'string') ? String(a) + String(b) : Number(a) + Number(b)); break; }
              case 0xa1: { const b = stack.pop(), a = stack.pop(); stack.push(Number(a) - Number(b)); break; }
              case 0xa2: { const b = stack.pop(), a = stack.pop(); stack.push(Number(a) * Number(b)); break; }
              case 0xa3: { const b = stack.pop(), a = stack.pop(); stack.push(Number(a) / Number(b)); break; }
              case 0xa4: { const b = stack.pop(), a = stack.pop(); stack.push(Number(a) % Number(b)); break; }
              case 0xa5: { const b = stack.pop(), a = stack.pop(); stack.push((Number(a) | 0) << (Number(b) & 0x1f)); break; }
              case 0xa6: { const b = stack.pop(), a = stack.pop(); stack.push((Number(a) | 0) >> (Number(b) & 0x1f)); break; }
              case 0xa7: { const b = stack.pop(), a = stack.pop(); stack.push((Number(a) >>> 0) >>> (Number(b) & 0x1f)); break; }
              case 0xa8: { const b = stack.pop(), a = stack.pop(); stack.push((Number(a) | 0) & (Number(b) | 0)); break; }
              case 0xa9: { const b = stack.pop(), a = stack.pop(); stack.push((Number(a) | 0) | (Number(b) | 0)); break; }
              case 0xaa: { const b = stack.pop(), a = stack.pop(); stack.push((Number(a) | 0) ^ (Number(b) | 0)); break; }
              case 0xab: { const b = stack.pop(), a = stack.pop(); stack.push(a == b); break; }
              case 0xac: { const b = stack.pop(), a = stack.pop(); stack.push(a === b); break; }
              case 0xad: { const b = stack.pop(), a = stack.pop(); stack.push(a < b); break; }
              case 0xae: { const b = stack.pop(), a = stack.pop(); stack.push(a <= b); break; }
              case 0xaf: { const b = stack.pop(), a = stack.pop(); stack.push(a > b); break; }
              case 0xb0: { const b = stack.pop(), a = stack.pop(); stack.push(a >= b); break; }
              case 0xb1: // instanceof
              case 0xb3: { // istypelate
                const t = stack.pop();
                const v = stack.pop();
                let match = false;
                if (v && v._as3Class && t instanceof AS3ClassDescriptor) {
                  let c = v._as3Class;
                  while (c) {
                    if (c === t) { match = true; break; }
                    c = c.superClass;
                  }
                } else if (typeof t === 'function') {
                  match = v instanceof t;
                }
                stack.push(match);
                break;
              }
              case 0xb2: { // istype
                const mn = cpool.multinames[readU30()];
                const v = stack.pop();
                const t = mn ? (this._resolveClass(mn.qname) || this._resolveClass(mn.name)) : null;
                let match = false;
                if (v && v._as3Class && t) {
                  let c = v._as3Class;
                  while (c) {
                    if (c === t) { match = true; break; }
                    c = c.superClass;
                  }
                }
                stack.push(match);
                break;
              }
              case 0xb4: { // in
                const obj = stack.pop();
                const k = stack.pop();
                stack.push(Boolean(obj && typeof obj === 'object' && k in obj));
                break;
              }

              // Integer arithmetic
              case 0xc0: stack.push((Number(stack.pop()) | 0) + 1 | 0); break;
              case 0xc1: stack.push((Number(stack.pop()) | 0) - 1 | 0); break;
              case 0xc2: { const r = readU30(); locals[r] = ((Number(locals[r]) | 0) + 1) | 0; break; }
              case 0xc3: { const r = readU30(); locals[r] = ((Number(locals[r]) | 0) - 1) | 0; break; }
              case 0xc4: stack.push(-(Number(stack.pop()) | 0) | 0); break;
              case 0xc5: { const b = stack.pop(), a = stack.pop(); stack.push(((a | 0) + (b | 0)) | 0); break; }
              case 0xc6: { const b = stack.pop(), a = stack.pop(); stack.push(((a | 0) - (b | 0)) | 0); break; }
              case 0xc7: { const b = stack.pop(), a = stack.pop(); stack.push(Math.imul(a | 0, b | 0)); break; }

              // Fast local opcodes
              case 0xd0: stack.push(locals[0]); break;
              case 0xd1: stack.push(locals[1]); break;
              case 0xd2: stack.push(locals[2]); break;
              case 0xd3: stack.push(locals[3]); break;
              case 0xd4: locals[0] = stack.pop(); break;
              case 0xd5: locals[1] = stack.pop(); break;
              case 0xd6: locals[2] = stack.pop(); break;
              case 0xd7: locals[3] = stack.pop(); break;

              // Debug no-ops
              case 0xef: { readU8(); readU30(); readU8(); readU30(); break; }
              case 0xf0: { readU30(); break; }
              case 0xf1: { readU30(); break; }

              default:
                this._warnings.push(`Unsupported AVM2 opcode 0x${op.toString(16)} at pc=${opPc}`);
                break;
            }
          } catch (innerErr) {
            if (innerErr instanceof AVM2BudgetExceededError) throw innerErr;
            // Check ABC exception table for try/catch handler
            let caught = false;
            if (body.exceptions && body.exceptions.length > 0) {
              for (let ei = 0; ei < body.exceptions.length; ei++) {
                const ex = body.exceptions[ei];
                if (opPc >= ex.from && opPc < ex.to) {
                  stack.length = 0;
                  stack.push(innerErr);
                  pc = ex.target;
                  caught = true;
                  break;
                }
              }
            }
            if (!caught) {
              this._warnings.push(`AVM2 runtime exception: ${innerErr && innerErr.message ? innerErr.message : String(innerErr)}`);
              return undefined;
            }
          }
        }
      } finally {
        this._callDepth--;
      }
      return undefined;
    }

    // -------------------------------------------------------------------------
    // 6. Pure-SVG Defs, Shapes, Filters & Timeline Hydration
    // -------------------------------------------------------------------------
    _mountSharedDefs(doc, stageSvg) {
      if (!doc || !stageSvg) return;
      let defs = stageSvg.querySelector('defs');
      if (!defs) {
        defs = doc.createElementNS(SVG_NS, 'defs');
        stageSvg.insertBefore(defs, stageSvg.firstChild);
      }
      // Clean previous VM defs (idempotent on reset!)
      const oldDefs = Array.from(defs.querySelectorAll('[data-swf-vm-def="1"]'));
      for (let i = 0; i < oldDefs.length; i++) oldDefs[i].parentNode.removeChild(oldDefs[i]);
      this._defsEl = defs;
      this._filterCache.clear();

      // Gradients
      const grads = Array.isArray(this.program.gr) ? this.program.gr : [];
      for (let i = 0; i < grads.length; i++) {
        const g = grads[i];
        const el = doc.createElementNS(SVG_NS, g.t === 'r' ? 'radialGradient' : 'linearGradient');
        el.setAttribute('id', g.id);
        el.setAttribute('data-swf-vm-def', '1');
        el.setAttribute('gradientUnits', 'userSpaceOnUse');
        if (g.t === 'r') {
          el.setAttribute('cx', '0'); el.setAttribute('cy', '0'); el.setAttribute('r', '819.2');
        } else {
          el.setAttribute('x1', '-819.2'); el.setAttribute('y1', '0'); el.setAttribute('x2', '819.2'); el.setAttribute('y2', '0');
        }
        if (Array.isArray(g.m) && g.m.length === 6) {
          el.setAttribute('gradientTransform', `matrix(${g.m.join(' ')})`);
        }
        const stops = Array.isArray(g.st) ? g.st : [];
        for (let s = 0; s < stops.length; s++) {
          const st = doc.createElementNS(SVG_NS, 'stop');
          st.setAttribute('offset', `${Number(stops[s][0]) * 100}%`);
          st.setAttribute('stop-color', String(stops[s][1] || '#ffffff'));
          el.appendChild(st);
        }
        defs.appendChild(el);
      }

      // Bitmap Patterns (strict data:image/* allowlist)
      const pats = Array.isArray(this.program.bp) ? this.program.bp : [];
      const bms = this.program.bm || {};
      for (let i = 0; i < pats.length; i++) {
        const p = pats[i];
        const bm = bms[p.b];
        if (!bm || !bm.u || !SAFE_DATA_IMAGE_RE.test(bm.u)) continue;
        const pat = doc.createElementNS(SVG_NS, 'pattern');
        pat.setAttribute('id', p.id);
        pat.setAttribute('data-swf-vm-def', '1');
        pat.setAttribute('patternUnits', 'userSpaceOnUse');
        pat.setAttribute('width', String(bm.w || 64));
        pat.setAttribute('height', String(bm.h || 64));
        if (Array.isArray(p.m) && p.m.length === 6) {
          pat.setAttribute('patternTransform', `matrix(${p.m.join(' ')})`);
        }
        const img = doc.createElementNS(SVG_NS, 'image');
        img.setAttribute('href', bm.u);
        img.setAttribute('width', String(bm.w || 64));
        img.setAttribute('height', String(bm.h || 64));
        pat.appendChild(img);
        defs.appendChild(pat);
      }
    }

    _resolveFilterUrl(filters, colorTransform) {
      const hasFilters = Array.isArray(filters) && filters.length > 0;
      const cx = colorTransform;
      const hasCx = Boolean(
        cx &&
        (cx.redMultiplier !== 1 || cx.greenMultiplier !== 1 || cx.blueMultiplier !== 1 || cx.alphaMultiplier !== 1 ||
         cx.redOffset !== 0 || cx.greenOffset !== 0 || cx.blueOffset !== 0 || cx.alphaOffset !== 0)
      );
      if (!hasFilters && !hasCx) return null;
      if (!this._defsEl || !this._doc) return null;

      const key = JSON.stringify({ f: hasFilters ? filters : null, c: hasCx ? cx : null });
      if (this._filterCache.has(key)) return `url(#${this._filterCache.get(key)})`;

      const fid = `as3-fx-${++this._filterSeq}`;
      const flEl = this._doc.createElementNS(SVG_NS, 'filter');
      flEl.setAttribute('id', fid);
      flEl.setAttribute('data-swf-vm-def', '1');
      flEl.setAttribute('x', '-35%');
      flEl.setAttribute('y', '-35%');
      flEl.setAttribute('width', '170%');
      flEl.setAttribute('height', '170%');

      if (hasFilters) {
        for (let i = 0; i < filters.length; i++) {
          const f = filters[i];
          if (!f) continue;
          if (f.t === 'bl') {
            const fe = this._doc.createElementNS(SVG_NS, 'feGaussianBlur');
            fe.setAttribute('stdDeviation', `${fmtN((f.blurX || 4) / 2)} ${fmtN((f.blurY || 4) / 2)}`);
            flEl.appendChild(fe);
          } else if (f.t === 'gl' || f.t === 'ds') {
            const rad = ((f.angle || 45) * Math.PI) / 180;
            const dist = f.t === 'ds' ? (f.distance || 4) : 0;
            const fe = this._doc.createElementNS(SVG_NS, 'feDropShadow');
            fe.setAttribute('dx', fmtN(Math.cos(rad) * dist));
            fe.setAttribute('dy', fmtN(Math.sin(rad) * dist));
            fe.setAttribute('stdDeviation', fmtN(Math.max(1, ((f.blurX || 6) + (f.blurY || 6)) / 4)));
            fe.setAttribute('flood-color', hexFromRgbInt(f.color || 0));
            fe.setAttribute('flood-opacity', fmtN(f.alpha === undefined ? 1 : f.alpha));
            flEl.appendChild(fe);
          } else if (f.t === 'cm' && Array.isArray(f.matrix) && f.matrix.length >= 20) {
            const m = f.matrix.slice(0, 20);
            m[4] /= 255; m[9] /= 255; m[14] /= 255; m[19] /= 255;
            const fe = this._doc.createElementNS(SVG_NS, 'feColorMatrix');
            fe.setAttribute('type', 'matrix');
            fe.setAttribute('values', m.map(fmtN).join(' '));
            flEl.appendChild(fe);
          }
        }
      }

      if (hasCx) {
        const fe = this._doc.createElementNS(SVG_NS, 'feColorMatrix');
        fe.setAttribute('type', 'matrix');
        const vals = [
          cx.redMultiplier, 0, 0, 0, cx.redOffset / 255,
          0, cx.greenMultiplier, 0, 0, cx.greenOffset / 255,
          0, 0, cx.blueMultiplier, 0, cx.blueOffset / 255,
          0, 0, 0, cx.alphaMultiplier, cx.alphaOffset / 255,
        ];
        fe.setAttribute('values', vals.map(fmtN).join(' '));
        flEl.appendChild(fe);
      }

      this._defsEl.appendChild(flEl);
      this._filterCache.set(key, fid);
      return `url(#${fid})`;
    }

    _populateClipPathFromSvg(clipPathEl, sourceEl, rootTransformStr, skipRootTransform) {
      if (!clipPathEl || !sourceEl) return;
      const collect = (el, chain, isRoot) => {
        if (!el) return;
        const tag = (el.nodeName || el.tagName || '').toLowerCase();
        const ownT = (!isRoot || !skipRootTransform) && el.getAttribute ? el.getAttribute('transform') : '';
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
        for (let i = 0; i < kids.length; i++) collect(kids[i], nextChain, false);
      };
      collect(sourceEl, rootTransformStr || '', true);
    }

    _buildShapeDisplayObject(charId) {
      const shDef = this.program.sh && this.program.sh[charId];
      if (!shDef) return null;
      const shape = new AS3Shape(this);
      if (Array.isArray(shDef.bb) && shDef.bb.length === 4) {
        shape._localBBox = { x: shDef.bb[0], y: shDef.bb[1], w: shDef.bb[2], h: shDef.bb[3] };
      }
      if (this._doc) {
        const el = shape._ensureSvg(this._doc);
        const prims = Array.isArray(shDef.p) ? shDef.p : [];
        for (let i = 0; i < prims.length; i++) {
          const p = prims[i];
          const d = Array.isArray(p) ? (p[0] || '') : (p.d || '');
          const fill = Array.isArray(p) ? (p[1] || 'none') : (p.f || 'none');
          const stroke = Array.isArray(p) ? (p[2] || 'none') : (p.s || 'none');
          const sw = Array.isArray(p) ? (p[3] || 0) : (p.sw || 1);
          const fillRule = Array.isArray(p) ? 'evenodd' : (p.fr || '');
          const path = this._doc.createElementNS(SVG_NS, 'path');
          path.setAttribute('d', d);
          path.setAttribute('fill', fill);
          if (fillRule) path.setAttribute('fill-rule', fillRule);
          if (stroke && stroke !== 'none') {
            path.setAttribute('stroke', stroke);
            path.setAttribute('stroke-width', String(sw || 1));
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
          } else {
            path.setAttribute('stroke', 'none');
          }
          el.appendChild(path);
        }
        if (prims.length === 0 && typeof shDef.svg === 'string' && shDef.svg.trim()) {
          try {
            if (typeof DOMParser !== 'undefined') {
              const parsed = new DOMParser().parseFromString(
                `<svg xmlns="${SVG_NS}">${shDef.svg}</svg>`,
                'image/svg+xml'
              );
              const rootSvg = parsed && parsed.documentElement;
              if (rootSvg && !rootSvg.querySelector('parsererror')) {
                const nodes = Array.from(rootSvg.childNodes);
                for (let k = 0; k < nodes.length; k++) {
                  const imported = this._doc.importNode ? this._doc.importNode(nodes[k], true) : nodes[k].cloneNode(true);
                  el.appendChild(imported);
                }
              }
            }
          } catch (_) {}
        }
      }
      return shape;
    }

    _buildButtonStateContainer(records, stateMask) {
      const matching = [];
      for (let i = 0; i < records.length; i++) {
        if ((records[i].s & stateMask) !== 0) matching.push(records[i]);
      }
      if (matching.length === 0) return null;
      const container = new AS3Sprite(this);
      container.mouseChildren = false;
      for (let i = 0; i < matching.length; i++) {
        const rec = matching[i];
        let part = null;
        if (this.program.et && this.program.et[rec.c]) {
          part = new AS3TextField(this, this.program.et[rec.c]);
        } else if (this.program.sp && this.program.sp[rec.c]) {
          part = new AS3MovieClip(this, this.program.sp[rec.c]);
          part._syncTimeline();
        } else if (this.program.sh && this.program.sh[rec.c]) {
          part = this._buildShapeDisplayObject(rec.c);
        }
        if (!part) continue;
        if (Array.isArray(rec.m) && rec.m.length === 6) {
          part._scaleX = rec.m[0];
          part._scaleY = rec.m[3];
          part._x = rec.m[4];
          part._y = rec.m[5];
          part._transformDirty = true;
        }
        if (rec.a !== undefined && rec.a < 1) {
          part.alpha = rec.a;
        }
        container.addChild(part);
      }
      return container;
    }

    _buildSimpleButtonFromDef(charId) {
      const def = this.program.bt && this.program.bt[charId];
      if (!def) return null;
      const recs = (def.r || []).slice().sort((a, b) => (a.d || 0) - (b.d || 0));
      const upState = this._buildButtonStateContainer(recs, 0x01);
      const overState = this._buildButtonStateContainer(recs, 0x02);
      const downState = this._buildButtonStateContainer(recs, 0x04);
      const hitTestState = this._buildButtonStateContainer(recs, 0x08)
        || upState
        || (recs.length > 0 ? this._buildButtonStateContainer([recs[0]], recs[0].s || 0x0f) : null);

      const symName = this.program.sym && this.program.sym[charId];
      const clsDesc = symName ? this._resolveClass(symName) : null;
      let btn = null;
      if (clsDesc) {
        btn = this._instantiateClass(clsDesc, []);
      }
      if (!btn || !(btn instanceof AS3SimpleButton)) {
        btn = new AS3SimpleButton(this, upState, overState, downState, hitTestState);
      } else {
        if (!btn.upState && upState) btn.upState = upState;
        if (!btn.overState && overState) btn.overState = overState;
        if (!btn.downState && downState) btn.downState = downState;
        if (!btn.hitTestState && hitTestState) btn.hitTestState = hitTestState;
      }
      return btn;
    }

    _resolveTimelineFrameEntries(timelineDef, frame1Based) {
      if (!timelineDef || !Array.isArray(timelineDef.fr) || timelineDef.fr.length === 0) return [];
      const fr = timelineDef.fr;
      let idx = Math.max(0, Math.min(fr.length - 1, (frame1Based | 0) - 1));
      while (idx > 0 && fr[idx] === '=') idx--;
      return Array.isArray(fr[idx]) ? fr[idx] : [];
    }

    _syncTimelineFrame(parentContainer, timelineDef, frame1Based) {
      const frameEntries = this._resolveTimelineFrameEntries(timelineDef, frame1Based);
      if (!parentContainer._timelineByDepth) parentContainer._timelineByDepth = new Map();
      const byDepth = parentContainer._timelineByDepth;

      const nextByDepth = new Map();
      for (let i = 0; i < frameEntries.length; i++) {
        const item = frameEntries[i];
        if (item) nextByDepth.set(item.d !== undefined ? item.d : i, item);
      }

      // 1. Remove stale timeline depth entries (leaving script-added addChild children untouched)
      byDepth.forEach((slot, depth) => {
        const nextItem = nextByDepth.get(depth);
        const nextIsMask = Boolean(nextItem && nextItem.cd && nextItem.cd > depth);
        if (!nextItem || nextItem.c !== slot.charId || Boolean(slot.clipDepth) !== nextIsMask) {
          if (slot.child && slot.child.parent === parentContainer) {
            parentContainer.removeChild(slot.child);
          }
          if (slot.maskEl && slot.maskEl.parentNode) {
            slot.maskEl.parentNode.removeChild(slot.maskEl);
          }
          byDepth.delete(depth);
        }
      });

      // 2. Reconcile active timeline entries in ascending depth order with clipDepth SVG <clipPath> masking
      const activeMasks = [];
      for (let i = 0; i < frameEntries.length; i++) {
        const item = frameEntries[i];
        if (!item) continue;
        const depth = item.d !== undefined ? item.d : i;

        if (item.cd && item.cd > depth) {
          let slot = byDepth.get(depth);
          if (!slot && this._doc && this._defsEl) {
            const maskId = `as3-tl-mask-${++this._maskSeq}`;
            const cp = this._doc.createElementNS(SVG_NS, 'clipPath');
            cp.setAttribute('id', maskId);
            cp.setAttribute('data-swf-vm-def', '1');
            const maskShape = this._buildShapeDisplayObject(item.c);
            const matStr = Array.isArray(item.m) && item.m.length === 6
              ? `matrix(${item.m.map(fmtN).join(' ')})`
              : '';
            if (maskShape && maskShape._svgEl) {
              this._populateClipPathFromSvg(cp, maskShape._svgEl, matStr, true);
            }
            this._defsEl.appendChild(cp);
            slot = { depth, charId: item.c, clipDepth: item.cd, maskId, maskEl: cp };
            byDepth.set(depth, slot);
          }
          if (slot) activeMasks.push({ clipDepth: item.cd, maskId: slot.maskId });
          continue;
        }

        let maskId = null;
        for (let mi = activeMasks.length - 1; mi >= 0; mi--) {
          if (depth <= activeMasks[mi].clipDepth) {
            maskId = activeMasks[mi].maskId;
            break;
          }
        }

        let slot = byDepth.get(depth);
        let child = slot ? slot.child : null;
        if (!child) {
          if (this.program.et && this.program.et[item.c]) {
            child = new AS3TextField(this, this.program.et[item.c]);
          } else if (this.program.bt && this.program.bt[item.c]) {
            child = this._buildSimpleButtonFromDef(item.c);
          } else if (this.program.sp && this.program.sp[item.c]) {
            const symName = this.program.sym && this.program.sym[item.c];
            const clsDesc = symName ? this._resolveClass(symName) : null;
            if (clsDesc) {
              child = this._instantiateClass(clsDesc, []);
            } else {
              child = new AS3MovieClip(this, this.program.sp[item.c]);
              child._syncTimeline();
            }
          } else if (this.program.sh && this.program.sh[item.c]) {
            child = this._buildShapeDisplayObject(item.c);
          }
          if (!child) continue;
          if (item.n) {
            child.name = item.n;
            parentContainer[item.n] = child;
          }
          parentContainer.addChild(child);
          slot = { depth, charId: item.c, child };
          byDepth.set(depth, slot);
        }

        if (Array.isArray(item.m) && item.m.length === 6) {
          child._scaleX = item.m[0];
          child._scaleY = item.m[3];
          child._x = item.m[4];
          child._y = item.m[5];
          child._transformDirty = true;
        }
        if (item.a !== undefined) child.alpha = item.a;
        if (Array.isArray(item.fl) && item.fl.length > 0) child.filters = item.fl;
        if (Array.isArray(item.cx) && item.cx.length >= 8) {
          child.transform.colorTransform = new AS3ColorTransform(
            item.cx[0] / 256, item.cx[1] / 256, item.cx[2] / 256, item.cx[3] / 256,
            item.cx[4], item.cx[5], item.cx[6], item.cx[7]
          );
        }

        child._timelineClipPathId = maskId;
        if (!child._mask && this._doc) {
          const el = child._ensureSvg(this._doc);
          if (el) {
            if (maskId) el.setAttribute('clip-path', `url(#${maskId})`);
            else el.removeAttribute('clip-path');
          }
        }
      }
    }

    _populateTimelineFrame(parentContainer, frameEntries) {
      this._syncTimelineFrame(parentContainer, { fr: [frameEntries || []] }, 1);
    }

    // -------------------------------------------------------------------------
    // 7. Lifecycle: mount / step / reset / destroy
    // -------------------------------------------------------------------------
    mount(container, stageSvg) {
      this._container = container || this._container;
      this._stageSvg = stageSvg || this._stageSvg;
      if (!this._doc && this._stageSvg) this._doc = this._stageSvg.ownerDocument;
      const doc = this._doc;

      if (this._stageSvg) {
        this._stageSvg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this._mountSharedDefs(doc, this._stageSvg);
      }

      if (doc && this._container) {
        while (this._container.firstChild) this._container.removeChild(this._container.firstChild);
        const bgRect = doc.createElementNS(SVG_NS, 'rect');
        bgRect.setAttribute('id', 'avm2-stage-bg');
        bgRect.setAttribute('x', '0');
        bgRect.setAttribute('y', '0');
        bgRect.setAttribute('width', String(this.width));
        bgRect.setAttribute('height', String(this.height));
        bgRect.setAttribute('fill', this.bgColor);
        this._container.appendChild(bgRect);

        this._rootGroup = doc.createElementNS(SVG_NS, 'g');
        this._rootGroup.setAttribute('id', 'avm2-root');
        this._container.appendChild(this._rootGroup);
      }

      this._budgetRemaining = MAX_OPS_PER_TICK;
      this.stage = new AS3Stage(this, this.width, this.height, this.fps);
      if (this._rootGroup) this.stage._svgEl = this._rootGroup;

      // Parse & execute DoABC scripts
      this._loadAbcBlocks();

      // Instantiate Document Class (SymbolClass charId === 0) or fallback root MovieClip
      let docInst = null;
      if (this.program.dc) {
        const dcDesc = this._resolveClass(this.program.dc);
        if (dcDesc) {
          docInst = this._instantiateClass(dcDesc, []);
        }
      }
      if (!docInst) {
        docInst = new AS3MovieClip(this, { fc: this.program.fc || 1, l: this.program.l || [], fr: this.program.fr || [] });
        docInst._syncTimeline();
      }

      this.rootDoc = docInst;
      this.rootClip = docInst;
      this.rootClip._totalframes = docInst.totalFrames || this.program.fc || 1;
      this.stage.addChild(docInst);

      if (doc) this.stage._syncSvg(doc);

      // Register independently on Universal Media Input Bus (zero duplicate window listeners!)
      this._bindUniversalInputSink();
      this._mounted = true;
      return this;
    }

    _bindUniversalInputSink() {
      if (this._gestureUnregister) {
        try { this._gestureUnregister(); } catch (_) {}
        this._gestureUnregister = null;
      }
      if (this._standaloneCleanup) {
        try { this._standaloneCleanup(); } catch (_) {}
        this._standaloneCleanup = null;
      }

      const gestures =
        (this.engine && this.engine.gestures) ||
        (typeof window !== 'undefined' ? window.__astGestures : null);

      if (gestures && typeof gestures.registerMediaInputSink === 'function') {
        const sinkId = `avm2-runtime-${++this._instanceSeq}`;
        gestures.registerMediaInputSink(sinkId, {
          onInput: (payload) => {
            if (!payload || !payload.channel) return false;
            const orig = payload.originalEvent || {};
            const handled = this.handleUniversalMediaInput({
              kind: payload.channel,
              key: payload.key !== undefined ? payload.key : orig.key,
              code: payload.code !== undefined ? payload.code : orig.code,
              keyCode: payload.keyCode !== undefined ? payload.keyCode : orig.keyCode,
              ctrlKey: Boolean(orig.ctrlKey),
              shiftKey: Boolean(orig.shiftKey),
              altKey: Boolean(orig.altKey),
              stageX: payload.svgPt && Number.isFinite(payload.svgPt.x) ? payload.svgPt.x : undefined,
              stageY: payload.svgPt && Number.isFinite(payload.svgPt.y) ? payload.svgPt.y : undefined,
              deltaY: payload.deltaY !== undefined ? payload.deltaY : orig.deltaY,
            });
            return handled ? { consumed: true, exclusive: payload.channel === 'key-down' || payload.channel === 'key-up' } : false;
          },
        });
        this._gestureUnregister = () => {
          if (typeof gestures.unregisterMediaInputSink === 'function') {
            gestures.unregisterMediaInputSink(sinkId);
          }
        };
        return;
      }

      // Standalone / headless fallback when mounted without site-gestures.js
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        const onKeyDown = (e) => {
          this.handleUniversalMediaInput({
            kind: 'key-down',
            key: e.key,
            code: e.code,
            keyCode: e.keyCode || decodeKeyCode(e.key, e.code),
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
          });
        };
        const onKeyUp = (e) => {
          this.handleUniversalMediaInput({
            kind: 'key-up',
            key: e.key,
            code: e.code,
            keyCode: e.keyCode || decodeKeyCode(e.key, e.code),
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
          });
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        this._standaloneCleanup = () => {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
        };
      }
    }

    _hitTestDeepest(node, sx, sy) {
      if (!node || !node._visible) return null;
      if (node instanceof AS3SimpleButton && !node.enabled) return null;
      if (node._children && node.mouseChildren !== false) {
        for (let i = node._children.length - 1; i >= 0; i--) {
          const hit = this._hitTestDeepest(node._children[i], sx, sy);
          if (hit) return hit;
        }
      }
      if (node._isStage) return node;
      if (node.mouseEnabled !== false && typeof node.hitTestPoint === 'function' && node.hitTestPoint(sx, sy)) {
        return node;
      }
      return null;
    }

    handleUniversalMediaInput(ev) {
      if (!this._mounted || !this.stage || !ev) return false;
      this._budgetRemaining = MAX_OPS_PER_TICK;

      if (ev.kind === 'release-all') {
        this.releaseAllInputs();
        return true;
      }

      if (ev.kind === 'key-down' || ev.kind === 'key-up') {
        const prevFrame = this.rootDoc ? this.rootDoc.currentFrame : 1;
        const prevPlaying = this.rootDoc ? Boolean(this.rootDoc._playing) : false;
        const kc = Number(ev.keyCode) || decodeKeyCode(ev.key, ev.code);
        const ch = typeof ev.key === 'string' && ev.key.length === 1 ? ev.key.charCodeAt(0) : 0;
        if (ev.kind === 'key-down') {
          this._keysDown.add(kc);
          if (this.stage.focus && this.stage.focus._type === 'input') {
            this.stage.focus._handleCharInput(ev.key);
          }
        } else {
          this._keysDown.delete(kc);
        }
        const kbEv = new AS3KeyboardEvent(
          ev.kind === 'key-down' ? AS3KeyboardEvent.KEY_DOWN : AS3KeyboardEvent.KEY_UP,
          true,
          false,
          ch,
          kc
        );
        kbEv.ctrlKey = Boolean(ev.ctrlKey);
        kbEv.shiftKey = Boolean(ev.shiftKey);
        kbEv.altKey = Boolean(ev.altKey);
        const target = this.stage.focus || this.stage;
        target.dispatchEvent(kbEv);
        if (this._doc) this.stage._syncSvg(this._doc);
        if (this.rootDoc && ((this.rootDoc.currentFrame !== prevFrame) || (!prevPlaying && this.rootDoc._playing))) {
          if (this.engine && !this.engine.isPlaying && typeof this.engine.play === 'function') {
            this.engine.play();
          }
        }
        return true;
      }

      if (ev.kind === 'pointer-move' || ev.kind === 'pointer-down' || ev.kind === 'pointer-up' || ev.kind === 'wheel') {
        const prevFrame = this.rootDoc ? this.rootDoc.currentFrame : 1;
        const prevPlaying = this.rootDoc ? Boolean(this.rootDoc._playing) : false;
        if (Number.isFinite(ev.stageX)) this._mouseX = ev.stageX;
        if (Number.isFinite(ev.stageY)) this._mouseY = ev.stageY;

        if (this._dragTarget && ev.kind === 'pointer-move') {
          this._dragTarget.x = this._mouseX;
          this._dragTarget.y = this._mouseY;
        }

        const target = this._hitTestDeepest(this.stage, this._mouseX, this._mouseY) || this.stage;
        const g = target._getGlobalPosition ? target._getGlobalPosition() : { x: 0, y: 0 };
        const lx = this._mouseX - g.x;
        const ly = this._mouseY - g.y;

        if (ev.kind === 'pointer-down') {
          this._pressedTarget = target;
          if (target instanceof AS3SimpleButton && target.enabled) {
            target._state = 'down';
          }
          if (target instanceof AS3TextField && target.type === 'input') {
            this.stage.focus = target;
          } else if (this.stage.focus) {
            this.stage.focus = null;
          }
          target.dispatchEvent(new AS3MouseEvent(AS3MouseEvent.MOUSE_DOWN, true, false, lx, ly, this._mouseX, this._mouseY));
        } else if (ev.kind === 'pointer-up') {
          const pressed = this._pressedTarget;
          this._pressedTarget = null;
          if (pressed instanceof AS3SimpleButton) {
            pressed._state = pressed === target ? 'over' : 'up';
          }
          target.dispatchEvent(new AS3MouseEvent(AS3MouseEvent.MOUSE_UP, true, false, lx, ly, this._mouseX, this._mouseY));
          let clickTarget = target;
          if (pressed && pressed !== target && pressed instanceof AS3SimpleButton && pressed.enabled && pressed.hitTestPoint(this._mouseX, this._mouseY)) {
            clickTarget = pressed;
          }
          clickTarget.dispatchEvent(new AS3MouseEvent(AS3MouseEvent.CLICK, true, false, lx, ly, this._mouseX, this._mouseY));
        } else if (ev.kind === 'pointer-move') {
          if (this._hoverTarget && this._hoverTarget !== target && this._hoverTarget instanceof AS3SimpleButton) {
            this._hoverTarget._state = 'up';
          }
          this._hoverTarget = target;
          if (target instanceof AS3SimpleButton && target.enabled) {
            target._state = this._pressedTarget === target ? 'down' : 'over';
          }
          target.dispatchEvent(new AS3MouseEvent(AS3MouseEvent.MOUSE_MOVE, true, false, lx, ly, this._mouseX, this._mouseY));
        } else if (ev.kind === 'wheel') {
          target.dispatchEvent(new AS3MouseEvent(AS3MouseEvent.MOUSE_WHEEL, true, false, lx, ly, this._mouseX, this._mouseY, ev.deltaY || 0));
        }
        if (this._doc) this.stage._syncSvg(this._doc);
        if (this.rootDoc && ((this.rootDoc.currentFrame !== prevFrame) || (!prevPlaying && this.rootDoc._playing))) {
          if (this.engine && !this.engine.isPlaying && typeof this.engine.play === 'function') {
            this.engine.play();
          }
        }
        return true;
      }

      return false;
    }

    handleForwardedKeyEvent(kind, payload) {
      return this.handleUniversalMediaInput({
        kind: kind === 'keyup' ? 'key-up' : 'key-down',
        key: payload && payload.key,
        code: payload && payload.code,
        keyCode: payload && payload.keyCode,
      });
    }

    releaseAllInputs() {
      const held = Array.from(this._keysDown);
      this._keysDown.clear();
      if (!this.stage) return;
      for (let i = 0; i < held.length; i++) {
        this.stage.dispatchEvent(new AS3KeyboardEvent(AS3KeyboardEvent.KEY_UP, true, false, 0, held[i]));
      }
    }

    _dispatchEnterFrameSubtree(node) {
      if (!node) return;
      if (node.hasEventListener(AS3Event.ENTER_FRAME)) {
        node.dispatchEvent(new AS3Event(AS3Event.ENTER_FRAME, false));
      }
      if (node._children) {
        const snapshot = node._children.slice();
        for (let i = 0; i < snapshot.length; i++) {
          this._dispatchEnterFrameSubtree(snapshot[i]);
        }
      }
    }

    step(dtSec) {
      if (!this._mounted || !this.stage) return;
      const safeDt = clampNum(dtSec, 0, 0.1);
      const dtMs = safeDt * 1000;
      this._elapsedMs += dtMs;
      this._budgetRemaining = MAX_OPS_PER_TICK;

      // Update active Timers
      this._timers.forEach((tmr) => {
        if (tmr && tmr.running) tmr._step(dtMs);
      });

      // Update setTimeout / setInterval
      this._intervals.forEach((item, id) => {
        item.acc += dtMs;
        if (item.acc >= item.delay) {
          item.acc -= item.delay;
          if (item.once) this._intervals.delete(id);
          try { item.fn(); } catch (_) {}
        }
      });

      const framePeriod = 1 / Math.max(1, Math.min(60, this.fps || 24));
      this._frameAccSec += safeDt;
      let steps = 0;
      while (this._frameAccSec >= framePeriod - 1e-6 && steps < 4) {
        this._frameAccSec -= framePeriod;
        this._tickCount++;
        steps++;
        if (this.rootDoc && typeof this.rootDoc._stepTimeline === 'function') {
          this.rootDoc._stepTimeline();
        }
        this._dispatchEnterFrameSubtree(this.stage);
      }

      if (this._doc) {
        this.stage._syncSvg(this._doc);
      }
    }

    reset() {
      this._soundEngine.stopAll();
      this._timers.forEach((t) => t.stop());
      this._timers.clear();
      this._intervals.clear();
      this._keysDown.clear();
      this._tickCount = 0;
      this._elapsedMs = 0;
      this._frameAccSec = 0;
      this._traces = [];
      this._warnings = [];
      this._budgetHits = 0;
      this._filterCache.clear();
      this._filterSeq = 0;
      this._maskSeq = 0;
      this.mount(this._container, this._stageSvg);
    }

    destroy() {
      this._mounted = false;
      this._soundEngine.stopAll();
      this._timers.forEach((t) => t.stop());
      this._timers.clear();
      this._intervals.clear();
      this._keysDown.clear();
      if (this._gestureUnregister) {
        try { this._gestureUnregister(); } catch (_) {}
        this._gestureUnregister = null;
      }
      if (this._standaloneCleanup) {
        try { this._standaloneCleanup(); } catch (_) {}
        this._standaloneCleanup = null;
      }
    }

    // -------------------------------------------------------------------------
    // 8. Hybrid Run-to-Convert Pure-SVG & Typed-Trait Distillation Snapshots
    // -------------------------------------------------------------------------
    _serializeSvgNode(node) {
      if (!node) return '';
      if (typeof node.outerHTML === 'string') return node.outerHTML;
      if (typeof XMLSerializer !== 'undefined') {
        try { return new XMLSerializer().serializeToString(node); } catch (_) {}
      }
      return '';
    }

    captureDistillationSnapshot(opts) {
      const options = opts || {};
      if (this._doc && this.stage) this.stage._syncSvg(this._doc);

      const vars = {};
      if (this.rootDoc && typeof this.rootDoc === 'object') {
        Object.keys(this.rootDoc).forEach((k) => {
          if (k.startsWith('_')) return;
          const v = this.rootDoc[k];
          if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
            vars[k] = v;
          }
        });
      }

      const textSamples = [];
      const observedButtons = [];
      const walkStage = (node) => {
        if (!node || !node._visible) return;
        if (node instanceof AS3TextField && node.text) textSamples.push(node.text);
        if (
          !node._isStage &&
          (node instanceof AS3SimpleButton || node.buttonMode || node.hasEventListener(AS3MouseEvent.CLICK))
        ) {
          const b = node.getBounds();
          observedButtons.push({
            id: node.name || `btn_${observedButtons.length + 1}`,
            name: node.name || `button_${observedButtons.length + 1}`,
            label: node.name || 'Action',
            charId: 0,
            x: Math.round(b.x),
            y: Math.round(b.y),
            width: Math.max(24, Math.round(b.width || 100)),
            height: Math.max(20, Math.round(b.height || 36)),
          });
        }
        if (node._children) node._children.forEach(walkStage);
      };
      walkStage(this.stage);

      const svgInner = this._rootGroup ? this._serializeSvgNode(this._rootGroup) : '';
      const svgMarkup = `<svg xmlns="${SVG_NS}" viewBox="0 0 ${this.width} ${this.height}"><rect width="${this.width}" height="${this.height}" fill="${this.bgColor}"/>${svgInner}</svg>`;
      const pathMatches = svgInner.match(/<(path|rect|circle|ellipse|polygon)\b/g);
      const nodeMatches = svgInner.match(/<[a-zA-Z]+/g);

      return {
        label: options.label || `AS3 View F${(this.rootDoc && this.rootDoc.currentFrame) || 1}`,
        frameNumber: (this.rootDoc && this.rootDoc.currentFrame) || 1,
        totalFrames: (this.rootDoc && this.rootDoc.totalFrames) || this.program.fc || 1,
        frameLabel: (this.rootDoc && this.rootDoc.currentLabel) || '',
        width: this.width,
        height: this.height,
        bg: this.bgColor,
        backgroundColor: this.bgColor,
        svgMarkup,
        nodeCount: nodeMatches ? nodeMatches.length : 0,
        pathCount: pathMatches ? pathMatches.length : 0,
        observedVars: vars,
        observedTexts: textSamples,
        observedButtons,
        variables: vars,
        textSamples,
        traits: this.traits.summarizeForDistiller(),
        fingerprint: `as3_${this._tickCount}_${textSamples.join('|').length}_${svgInner.length}`,
        runtime: 'avm2',
      };
    }

    sweepDistillationStates(opts) {
      const options = opts || {};
      const maxStates = Math.min(12, Math.max(1, Number(options.maxStates) || 4));
      const stepSec = 1 / Math.max(1, this.fps || 24);
      const out = [];
      for (let i = 0; i < maxStates; i++) {
        if (i > 0) this.step(stepSec * 3);
        out.push(this.captureDistillationSnapshot({ label: `AS3 State ${i + 1}` }));
      }
      return out;
    }
  }

  global.ASTAVM2Runtime = ASTAVM2Runtime;
  if (typeof window !== 'undefined') {
    window.ASTAVM2Runtime = ASTAVM2Runtime;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ASTAVM2Runtime,
      parseAbcFile,
      AS3Event,
      AS3MouseEvent,
      AS3KeyboardEvent,
      AS3TimerEvent,
      AS3Sprite,
      AS3MovieClip,
      AS3Shape,
      AS3TextField,
      AS3Graphics,
      AS3Point,
      AS3Rectangle,
      AS3ColorTransform,
      AS3Timer,
      AS3Sound,
      AS3Keyboard,
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
