/**
 * scripts/test-swf-legacy-gaps.ts
 *
 * End-to-End Regression Suite for High-ROI Legacy & Modern Flash (.swf) Gaps:
 *   1. ZWS (LZMA) SWF v13+ binary round-trip decompression + live AVM2 execution + malformed error guard.
 *   2. DefineFont3 (Tag 75) vector Bézier glyph outlines + DefineText2 (Tag 33) static vector text -> pure SVG <path>.
 *   3. SVG <clipPath> Masks: AVM2 timeline clipDepth + AVM2 dynamic DisplayObject.mask + AVM1 MovieClip.setMask.
 *   4. Everyday AS3 APIs: flash.net.SharedObject (offline persistence), flash.utils.ByteArray (big/little endian + UTF),
 *      __AS3__.vec.Vector.<int> (opcode 0x53 applytype + typed coercion), & multi-frame AS3MovieClip + addFrameScript.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { transpileSwfToAst } from '../src/utils/swfAstParser';
import { encodeFwsToZwsSwf, decompressZwsSwf } from '../src/utils/swfLzmaDecoder';
import {
  AbcBuilder,
  buildDoAbc2Tag,
  buildFileAttributesTag,
  buildFlashAs3LabSampleSwf,
  buildSymbolClassTag,
} from '../src/utils/swfSampleBuilder';

class MockSvgElement {
  tagName: string;
  attributes = new Map<string, string>();
  style: Record<string, string> = {};
  children: MockSvgElement[] = [];
  parentNode: MockSvgElement | null = null;
  textContent = '';
  ownerDocument: MockSvgDoc;
  private listeners = new Map<string, Set<Function>>();
  focus() {}

  constructor(tag: string, doc: MockSvgDoc) {
    this.tagName = tag;
    this.ownerDocument = doc;
  }
  get nodeName() { return this.tagName; }
  get childNodes() { return this.children; }
  get firstChild() { return this.children[0] || null; }
  setAttribute(k: string, v: string) { this.attributes.set(k, String(v)); }
  getAttribute(k: string) { return this.attributes.has(k) ? this.attributes.get(k)! : null; }
  removeAttribute(k: string) { this.attributes.delete(k); }
  hasAttribute(k: string) { return this.attributes.has(k); }
  cloneNode(deep?: boolean): MockSvgElement {
    const c = new MockSvgElement(this.tagName, this.ownerDocument);
    this.attributes.forEach((v, k) => c.attributes.set(k, v));
    c.textContent = this.textContent;
    if (deep) {
      for (const ch of this.children) c.appendChild(ch.cloneNode(true));
    }
    return c;
  }
  replaceChildren(...nodes: MockSvgElement[]) {
    for (const ch of this.children) ch.parentNode = null;
    this.children = [];
    for (const n of nodes) {
      if (n) this.appendChild(n);
    }
  }
  appendChild(child: MockSvgElement) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  insertBefore(child: MockSvgElement, ref: MockSvgElement | null) {
    if (!ref) return this.appendChild(child);
    if (child.parentNode) child.parentNode.removeChild(child);
    const idx = this.children.indexOf(ref);
    child.parentNode = this;
    if (idx < 0) this.children.push(child);
    else this.children.splice(idx, 0, child);
    return child;
  }
  removeChild(child: MockSvgElement) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }
  addEventListener(type: string, fn: Function) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
  }
  removeEventListener(type: string, fn: Function) {
    this.listeners.get(type)?.delete(fn);
  }
  dispatchEvent(ev: any) {
    const set = this.listeners.get(ev.type);
    if (set) set.forEach((fn) => fn(ev));
  }
  querySelector(sel: string): MockSvgElement | null {
    return this.querySelectorAll(sel)[0] || null;
  }
  querySelectorAll(sel: string): MockSvgElement[] {
    const out: MockSvgElement[] = [];
    const attrMatch = sel.match(/^\[([^=\]]+)="([^"]*)"\]$/);
    const walk = (n: MockSvgElement) => {
      for (const ch of n.children) {
        if (attrMatch) {
          if (ch.getAttribute(attrMatch[1]) === attrMatch[2]) out.push(ch);
        } else if (sel.startsWith('#')) {
          if (ch.getAttribute('id') === sel.slice(1)) out.push(ch);
        } else if (ch.tagName.toLowerCase() === sel.toLowerCase()) {
          out.push(ch);
        }
        walk(ch);
      }
    };
    walk(this);
    return out;
  }
  getBoundingClientRect() { return { left: 0, top: 0, width: 640, height: 400 }; }
  closest() { return null; }
  createSVGPoint() { return { x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }; }
  getScreenCTM() { return { inverse: () => ({}) }; }
}

class MockSvgDoc {
  createElementNS(_ns: string, tag: string) { return new MockSvgElement(tag, this); }
  createElement(tag: string) { return new MockSvgElement(tag, this); }
}

// ---------------------------------------------------------------------------
// Minimal SWF Binary BitWriter + Tag Builders for Font3, Text2, Shape, Place
// ---------------------------------------------------------------------------
class SwfBitWriter {
  private bytes: number[] = [];
  private curByte = 0;
  private bitPos = 0;

  writeUBits(val: number, nbits: number) {
    for (let i = nbits - 1; i >= 0; i--) {
      const bit = (val >>> i) & 1;
      this.curByte = (this.curByte << 1) | bit;
      this.bitPos++;
      if (this.bitPos === 8) {
        this.bytes.push(this.curByte);
        this.curByte = 0;
        this.bitPos = 0;
      }
    }
  }
  writeSBits(val: number, nbits: number) {
    const mask = (1 << nbits) - 1;
    this.writeUBits(val & mask, nbits);
  }
  syncBits() {
    if (this.bitPos > 0) {
      this.curByte <<= (8 - this.bitPos);
      this.bytes.push(this.curByte);
      this.curByte = 0;
      this.bitPos = 0;
    }
  }
  writeUI8(v: number) { this.syncBits(); this.bytes.push(v & 0xff); }
  writeUI16(v: number) { this.syncBits(); this.bytes.push(v & 0xff, (v >>> 8) & 0xff); }
  writeSI16(v: number) { this.writeUI16(v < 0 ? v + 0x10000 : v); }
  writeUI32(v: number) {
    this.syncBits();
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }
  writeBytes(arr: Uint8Array | number[]) {
    this.syncBits();
    for (let i = 0; i < arr.length; i++) this.bytes.push(arr[i] & 0xff);
  }
  writeRect(xMinPx: number, xMaxPx: number, yMinPx: number, yMaxPx: number) {
    this.syncBits();
    const vals = [Math.round(xMinPx * 20), Math.round(xMaxPx * 20), Math.round(yMinPx * 20), Math.round(yMaxPx * 20)];
    const maxAbs = Math.max(1, ...vals.map((v) => Math.abs(v)));
    const nbits = Math.min(31, Math.ceil(Math.log2(maxAbs + 1)) + 2);
    this.writeUBits(nbits, 5);
    for (const v of vals) this.writeSBits(v, nbits);
    this.syncBits();
  }
  writeMatrix(txPx = 0, tyPx = 0) {
    this.syncBits();
    this.writeUBits(0, 1); // no scale
    this.writeUBits(0, 1); // no rotate
    const tx = Math.round(txPx * 20);
    const ty = Math.round(tyPx * 20);
    const maxAbs = Math.max(1, Math.abs(tx), Math.abs(ty));
    const nbits = (tx === 0 && ty === 0) ? 0 : Math.ceil(Math.log2(maxAbs + 1)) + 2;
    this.writeUBits(nbits, 5);
    if (nbits > 0) {
      this.writeSBits(tx, nbits);
      this.writeSBits(ty, nbits);
    }
    this.syncBits();
  }
  toUint8Array() { this.syncBits(); return new Uint8Array(this.bytes); }
}

function makeSwfTag(tagType: number, payload: Uint8Array): Uint8Array {
  const out: number[] = [];
  if (payload.length < 63) {
    const hdr = (tagType << 6) | payload.length;
    out.push(hdr & 0xff, (hdr >>> 8) & 0xff);
  } else {
    const hdr = (tagType << 6) | 0x3f;
    out.push(hdr & 0xff, (hdr >>> 8) & 0xff);
    const len = payload.length;
    out.push(len & 0xff, (len >>> 8) & 0xff, (len >>> 16) & 0xff, (len >>> 24) & 0xff);
  }
  for (let i = 0; i < payload.length; i++) out.push(payload[i]);
  return new Uint8Array(out);
}

function assembleFwsSwf(version: number, width: number, height: number, fps: number, frameCount: number, tags: Uint8Array[]): Uint8Array {
  const bw = new SwfBitWriter();
  bw.writeRect(0, width, 0, height);
  bw.writeUI16(Math.round(fps * 256));
  bw.writeUI16(frameCount);
  for (const t of tags) bw.writeBytes(t);
  bw.writeBytes(makeSwfTag(0, new Uint8Array(0))); // End tag
  const body = bw.toUint8Array();
  const totalLen = 8 + body.length;
  const swf = new Uint8Array(totalLen);
  swf[0] = 0x46; swf[1] = 0x57; swf[2] = 0x53; // FWS
  swf[3] = version;
  swf[4] = totalLen & 0xff;
  swf[5] = (totalLen >>> 8) & 0xff;
  swf[6] = (totalLen >>> 16) & 0xff;
  swf[7] = (totalLen >>> 24) & 0xff;
  swf.set(body, 8);
  return swf;
}

function buildRectShapeTag(charId: number, x: number, y: number, w: number, h: number, r: number, g: number, b: number): Uint8Array {
  const bw = new SwfBitWriter();
  bw.writeUI16(charId);
  bw.writeRect(x, x + w, y, y + h);
  // 1 solid fill style
  bw.writeUI8(1);
  bw.writeUI8(0x00); // solid
  bw.writeUI8(r); bw.writeUI8(g); bw.writeUI8(b);
  // 0 line styles
  bw.writeUI8(0);
  // numFillBits=1, numLineBits=0
  bw.writeUBits(1, 4);
  bw.writeUBits(0, 4);
  // StyleChangeRecord: MoveTo (x, y) + FillStyle1 = 1
  bw.writeUBits(0, 1); // non-edge
  bw.writeUBits(0x05, 5); // MoveTo (0x01) + FillStyle1 (0x04)
  const mx = Math.round(x * 20), my = Math.round(y * 20);
  const mb = Math.max(2, Math.ceil(Math.log2(Math.max(1, Math.abs(mx), Math.abs(my)) + 1)) + 2);
  bw.writeUBits(mb, 5);
  bw.writeSBits(mx, mb);
  bw.writeSBits(my, mb);
  bw.writeUBits(1, 1); // fillStyle1 = 1

  const writeStraight = (dxPx: number, dyPx: number) => {
    const dx = Math.round(dxPx * 20), dy = Math.round(dyPx * 20);
    const nb = Math.max(2, Math.ceil(Math.log2(Math.max(1, Math.abs(dx), Math.abs(dy)) + 1)) + 2);
    bw.writeUBits(1, 1); // edge
    bw.writeUBits(1, 1); // straight
    bw.writeUBits(nb - 2, 4);
    bw.writeUBits(1, 1); // general line
    bw.writeSBits(dx, nb);
    bw.writeSBits(dy, nb);
  };
  writeStraight(w, 0);
  writeStraight(0, h);
  writeStraight(-w, 0);
  writeStraight(0, -h);
  // EndShapeRecord
  bw.writeUBits(0, 1);
  bw.writeUBits(0, 5);
  return makeSwfTag(2, bw.toUint8Array());
}

function buildPlaceObject2Tag(depth: number, charId: number, x = 0, y = 0, name?: string, clipDepth?: number): Uint8Array {
  const bw = new SwfBitWriter();
  let flags = 0x02 | 0x04; // hasCharacter | hasMatrix
  if (name) flags |= 0x20;
  if (clipDepth && clipDepth > depth) flags |= 0x40;
  bw.writeUI8(flags);
  bw.writeUI16(depth);
  bw.writeUI16(charId);
  bw.writeMatrix(x, y);
  if (name) {
    for (let i = 0; i < name.length; i++) bw.writeUI8(name.charCodeAt(i));
    bw.writeUI8(0);
  }
  if (clipDepth && clipDepth > depth) bw.writeUI16(clipDepth);
  return makeSwfTag(26, bw.toUint8Array());
}

function buildRemoveObject2Tag(depth: number): Uint8Array {
  const bw = new SwfBitWriter();
  bw.writeUI16(depth);
  return makeSwfTag(28, bw.toUint8Array());
}

function buildGlyphShapeBytes(segments: Array<['M' | 'L', number, number] | ['Q', number, number, number, number]>): Uint8Array {
  const bw = new SwfBitWriter();
  bw.writeUBits(1, 4); // numFillBits = 1
  bw.writeUBits(0, 4); // numLineBits = 0
  let curX = 0, curY = 0;
  let firstMove = true;
  for (const seg of segments) {
    if (seg[0] === 'M') {
      bw.writeUBits(0, 1);
      bw.writeUBits(firstMove ? 0x03 : 0x01, 5); // MoveTo (+ FillStyle0=1 on first move)
      const mb = Math.max(2, Math.ceil(Math.log2(Math.max(1, Math.abs(seg[1]), Math.abs(seg[2])) + 1)) + 2);
      bw.writeUBits(mb, 5);
      bw.writeSBits(seg[1], mb);
      bw.writeSBits(seg[2], mb);
      if (firstMove) {
        bw.writeUBits(1, 1);
        firstMove = false;
      }
      curX = seg[1];
      curY = seg[2];
    } else if (seg[0] === 'L') {
      const dx = seg[1] - curX, dy = seg[2] - curY;
      const nb = Math.max(2, Math.ceil(Math.log2(Math.max(1, Math.abs(dx), Math.abs(dy)) + 1)) + 2);
      bw.writeUBits(1, 1); // edge
      bw.writeUBits(1, 1); // straight
      bw.writeUBits(nb - 2, 4);
      bw.writeUBits(1, 1); // general
      bw.writeSBits(dx, nb);
      bw.writeSBits(dy, nb);
      curX = seg[1];
      curY = seg[2];
    } else {
      const cdx = seg[1] - curX, cdy = seg[2] - curY;
      const adx = seg[3] - seg[1], ady = seg[4] - seg[2];
      const maxD = Math.max(1, Math.abs(cdx), Math.abs(cdy), Math.abs(adx), Math.abs(ady));
      const nb = Math.max(2, Math.ceil(Math.log2(maxD + 1)) + 2);
      bw.writeUBits(1, 1); // edge
      bw.writeUBits(0, 1); // curved
      bw.writeUBits(nb - 2, 4);
      bw.writeSBits(cdx, nb);
      bw.writeSBits(cdy, nb);
      bw.writeSBits(adx, nb);
      bw.writeSBits(ady, nb);
      curX = seg[3];
      curY = seg[4];
    }
  }
  bw.writeUBits(0, 1);
  bw.writeUBits(0, 5); // EndShapeRecord
  return bw.toUint8Array();
}

function buildDefineFont3Tag(fontId: number, fontName: string, glyphs: Uint8Array[], codePoints: number[]): Uint8Array {
  const bw = new SwfBitWriter();
  bw.writeUI16(fontId);
  bw.writeUI8(0x04); // FontFlagsWideCodes = 1 (DefineFont3)
  bw.writeUI8(1);    // LanguageCode = Latin
  bw.writeUI8(fontName.length);
  for (let i = 0; i < fontName.length; i++) bw.writeUI8(fontName.charCodeAt(i));
  bw.writeUI16(glyphs.length);
  // OffsetTable (UI16 * numGlyphs) + CodeTableOffset (UI16)
  let rel = (glyphs.length + 1) * 2;
  for (let i = 0; i < glyphs.length; i++) {
    bw.writeUI16(rel);
    rel += glyphs[i].length;
  }
  bw.writeUI16(rel); // CodeTableOffset
  for (const g of glyphs) bw.writeBytes(g);
  for (const cp of codePoints) bw.writeUI16(cp);
  return makeSwfTag(75, bw.toUint8Array());
}

function buildDefineText2Tag(
  charId: number,
  fontId: number,
  heightPx: number,
  rgba: [number, number, number, number],
  entries: Array<{ glyphIdx: number; advancePx: number }>
): Uint8Array {
  const bw = new SwfBitWriter();
  bw.writeUI16(charId);
  bw.writeRect(0, 200, 0, 60);
  bw.writeMatrix(20, 40);
  const glyphBits = 4;
  const advanceBits = 12;
  bw.writeUI8(glyphBits);
  bw.writeUI8(advanceBits);
  // TEXTRECORD header: type=1 (0x80) | hasFont(0x08) | hasColor(0x04) | hasYOffset(0x02) | hasXOffset(0x01)
  bw.writeUI8(0x80 | 0x08 | 0x04 | 0x02 | 0x01);
  bw.writeUI16(fontId);
  bw.writeUI8(rgba[0]); bw.writeUI8(rgba[1]); bw.writeUI8(rgba[2]); bw.writeUI8(rgba[3]);
  bw.writeSI16(0); // xOffset twips
  bw.writeSI16(0); // yOffset twips
  bw.writeUI16(Math.round(heightPx * 20)); // textHeight twips
  bw.writeUI8(entries.length);
  for (const e of entries) {
    bw.writeUBits(e.glyphIdx, glyphBits);
    bw.writeSBits(Math.round(e.advancePx * 20), advanceBits);
  }
  bw.syncBits();
  bw.writeUI8(0); // EndOfRecords
  return makeSwfTag(33, bw.toUint8Array());
}

function loadVmRuntime() {
  const sandbox: any = {
    console,
    Math,
    Date,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Map,
    Set,
    RegExp,
    Error,
    RangeError,
    Uint8Array,
    Int32Array,
    Float32Array,
    DataView,
    ArrayBuffer,
    TextEncoder,
    TextDecoder,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    escape,
    unescape,
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    performance: { now: () => Date.now() },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);
  for (const rel of ['static/player/ast-event-bus.js', 'static/player/ast-avm2-vm.js', 'static/player/ast-avm1-vm.js']) {
    const code = fs.readFileSync(path.resolve(process.cwd(), rel), 'utf8');
    vm.runInContext(code, ctx, { filename: rel });
  }
  return sandbox;
}

function extractSwfVmB64(astSource: string): string {
  const m = astSource.match(/\(:swf-vm\s+"([^"]+)"\)/);
  assert.ok(m && m[1], 'Expected (:swf-vm "...") payload in transpiled AST');
  return m[1];
}

// ---------------------------------------------------------------------------
// TEST 1: ZWS (LZMA) SWF v13+ Round-Trip Decompression & Live AVM2 Execution
// ---------------------------------------------------------------------------
async function testZwsLzmaRoundTrip(sandbox: any) {
  console.log('1. Testing ZWS (LZMA) SWF v13+ decompression & live AVM2 execution...');
  const originalFws = buildFlashAs3LabSampleSwf();
  const zwsBytes = encodeFwsToZwsSwf(originalFws, 15);
  assert.equal(String.fromCharCode(zwsBytes[0], zwsBytes[1], zwsBytes[2]), 'ZWS', 'Header should be ZWS');
  assert.equal(zwsBytes[3], 15, 'SWF version should be 15');

  // Verify raw byte-for-byte LZMA decompression parity
  const decompressed = decompressZwsSwf(zwsBytes);
  assert.equal(decompressed.length, originalFws.length, 'Decompressed length must equal original FWS length');
  assert.deepEqual(decompressed.subarray(8), originalFws.subarray(8), 'Decompressed body must match original FWS byte-for-byte');

  // Verify full transpileSwfToAst() pipeline on ZWS binary
  const res = await transpileSwfToAst(zwsBytes, 'as3-lab-zws');
  assert.equal(res.success, true, `ZWS transpile failed: ${res.error}`);
  assert.equal(res.metadata?.signature, 'ZWS');
  assert.equal(res.metadata?.version, 15);
  assert.equal(res.metadata?.isActionScript3, true);
  assert.equal(res.metadata?.documentClass, 'As3PhysicsLab');
  assert.ok((res.metadata?.abcCount || 0) >= 1, 'ZWS must preserve DoABC bytecode');

  // Mount & execute live on ASTAVM2Runtime
  const doc = new MockSvgDoc();
  const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg.appendChild(container);
  const rt = new sandbox.ASTAVM2Runtime(extractSwfVmB64(res.astSource), { doc, stageSvg, container });
  rt.mount(container, stageSvg);
  for (let i = 0; i < 6; i++) rt.step(1 / 24);
  assert.ok((rt.rootDoc.ticks || 0) >= 5, `Expected ZWS AVM2 ticks >= 5, got ${rt.rootDoc.ticks}`);
  rt.destroy();

  // Verify malformed / truncated ZWS fails safely without throwing
  const corruptZws = new Uint8Array([0x5a, 0x57, 0x53, 15, 0x00, 0x01, 0x00, 0x00, 2, 0, 0, 0, 0xff, 0xff]);
  const badRes = await transpileSwfToAst(corruptZws, 'corrupt-zws');
  assert.equal(badRes.success, false, 'Truncated ZWS must fail cleanly');
  assert.ok(badRes.error && badRes.error.length > 0, 'Expected descriptive error on malformed ZWS');
  console.log('   ✓ ZWS v15 LZMA round-trip, live AVM2 execution, & malformed guard verified');
}

// ---------------------------------------------------------------------------
// TEST 2: DefineFont3 (Tag 75) Vector Glyphs + DefineText2 (Tag 33) SVG Paths
// ---------------------------------------------------------------------------
async function testVectorFontsAndStaticText(sandbox: any) {
  console.log('2. Testing DefineFont3 (Tag 75) Bézier glyphs + DefineText2 (Tag 33) pure SVG <path>...');
  // Glyph 0 ('A'): sharp triangle contour in 20480 EM-square
  const glyphA = buildGlyphShapeBytes([
    ['M', 0, 0],
    ['L', 5120, -14336],
    ['L', 10240, 0],
    ['L', 0, 0],
  ]);
  // Glyph 1 ('π'): quadratic Bézier arch contour
  const glyphPi = buildGlyphShapeBytes([
    ['M', 0, -10240],
    ['Q', 5120, -15360, 10240, -10240],
    ['L', 10240, 0],
    ['L', 0, 0],
  ]);

  const tags = [
    makeSwfTag(69, buildFileAttributesTag(true)),
    buildDefineFont3Tag(10, 'MathVectorFont', [glyphA, glyphPi], [0x41, 0x03c0]), // 'A', 'π'
    buildDefineText2Tag(11, 10, 32, [0x38, 0xbd, 0xf8, 0xff], [
      { glyphIdx: 0, advancePx: 22 },
      { glyphIdx: 1, advancePx: 24 },
    ]),
    buildPlaceObject2Tag(1, 11, 40, 80, 'formulaVector'),
    makeSwfTag(1, new Uint8Array(0)), // ShowFrame
  ];
  const swf = assembleFwsSwf(10, 480, 240, 24, 1, tags);
  const res = await transpileSwfToAst(swf, 'vector-font-lab');

  assert.equal(res.success, true, `Font3 SWF transpile failed: ${res.error}`);
  assert.equal(res.metadata?.fontCount, 1, 'Expected fontCount === 1');
  assert.equal(res.metadata?.staticTextCount, 1, 'Expected staticTextCount === 1');
  assert.ok(res.svgMarkup.includes('swf-statictext-11'), 'Expected static vector text group in SVG markup');
  assert.ok(res.svgMarkup.includes('aria-label="Aπ"'), 'Expected accessible aria-label extracted from Font3 CodeTable');
  assert.ok(res.svgMarkup.includes('Q ') && res.svgMarkup.includes('fill="#38bdf8"'), 'Expected quadratic Bézier path & cyan fill');

  // Verify crisp SVG <path> rendering inside ASTAVM2Runtime too (zero external fonts!)
  const doc = new MockSvgDoc();
  const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg.appendChild(container);
  const rt = new sandbox.ASTAVM2Runtime(extractSwfVmB64(res.astSource), { doc, stageSvg, container });
  rt.mount(container, stageSvg);
  const paths = container.querySelectorAll('path');
  assert.ok(paths.length >= 1, 'Expected DefineText2 vector glyph <path> mounted in AVM2 SVG DOM');
  const dAttr = paths[0].getAttribute('d') || '';
  assert.ok(dAttr.includes('M ') && dAttr.includes('Q '), `Expected M & Q vector path commands, got: ${dAttr}`);
  assert.equal(paths[0].getAttribute('fill'), '#38bdf8');
  rt.destroy();
  console.log('   ✓ DefineFont3 + DefineText2 pure SVG <path> glyph rendering verified');
}

// ---------------------------------------------------------------------------
// TEST 3: SVG <clipPath> Masks (AVM2 clipDepth + DisplayObject.mask + AVM1 setMask)
// ---------------------------------------------------------------------------
async function testSvgClipPathMasks(sandbox: any) {
  console.log('3. Testing SVG <clipPath> masks (AVM2 clipDepth, AVM2 DisplayObject.mask, AVM1 setMask)...');

  // 3a. AVM2 Timeline clipDepth mask
  const maskSwf = assembleFwsSwf(10, 400, 300, 24, 1, [
    makeSwfTag(69, buildFileAttributesTag(true)),
    buildRectShapeTag(1, 0, 0, 120, 120, 0xff, 0xff, 0xff), // mask aperture
    buildRectShapeTag(2, 0, 0, 300, 200, 0x38, 0xbd, 0xf8), // masked target
    buildPlaceObject2Tag(1, 1, 50, 40, undefined, 4),       // clipDepth = 4
    buildPlaceObject2Tag(2, 2, 10, 10, 'maskedCard'),       // depth 2 <= 4 -> masked!
    makeSwfTag(1, new Uint8Array(0)),
  ]);
  const res = await transpileSwfToAst(maskSwf, 'mask-clipdepth');
  assert.equal(res.success, true);

  const doc = new MockSvgDoc();
  const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg.appendChild(container);
  const rt = new sandbox.ASTAVM2Runtime(extractSwfVmB64(res.astSource), { doc, stageSvg, container });
  rt.mount(container, stageSvg);

  const tlClipPaths = stageSvg.querySelectorAll('clipPath');
  assert.ok(tlClipPaths.length >= 1, 'Expected timeline <clipPath> created in <defs>');
  assert.equal(tlClipPaths[0].getAttribute('data-swf-vm-def'), '1');
  assert.ok(tlClipPaths[0].querySelectorAll('path').length >= 1, 'Timeline <clipPath> must contain mask path geometry');
  const maskedCard = rt.rootDoc.getChildByName('maskedCard');
  assert.ok(maskedCard, 'Expected maskedCard child on rootDoc');
  assert.equal(maskedCard._svgEl.getAttribute('clip-path'), `url(#${tlClipPaths[0].getAttribute('id')})`);

  // 3b. AVM2 Dynamic DisplayObject.mask
  const targetSprite = rt._instantiateClass(rt._resolveClass('flash.display.Sprite'), []);
  targetSprite.graphics.beginFill(0xf59e0b);
  targetSprite.graphics.drawRect(0, 0, 200, 100);
  targetSprite.graphics.endFill();
  const dynMaskShape = rt._instantiateClass(rt._resolveClass('flash.display.Shape'), []);
  dynMaskShape.graphics.beginFill(0xffffff);
  dynMaskShape.graphics.drawCircle(50, 50, 40);
  dynMaskShape.graphics.endFill();
  rt.rootDoc.addChild(targetSprite);
  rt.rootDoc.addChild(dynMaskShape);
  targetSprite.mask = dynMaskShape;
  rt.stage._syncSvg(doc);

  const dynClipAttr = targetSprite._svgEl.getAttribute('clip-path') || '';
  assert.ok(dynClipAttr.startsWith('url(#as3-dyn-mask-'), `Expected dynamic mask url, got ${dynClipAttr}`);
  assert.equal(dynMaskShape._svgEl.getAttribute('display'), 'none', 'Mask display object must be hidden');
  const dynCpId = dynClipAttr.slice(5, -1);
  const dynCpEl = stageSvg.querySelector(`#${dynCpId}`);
  assert.ok(dynCpEl && dynCpEl.querySelectorAll('circle').length === 1, 'Dynamic <clipPath> must contain circle mask geometry');

  // Clear dynamic mask
  targetSprite.mask = null;
  rt.stage._syncSvg(doc);
  assert.equal(targetSprite._svgEl.getAttribute('clip-path'), null, 'Clearing mask must remove clip-path');
  assert.equal(dynMaskShape._svgEl.getAttribute('display'), null, 'Clearing mask must restore mask visibility');
  rt.destroy();

  // 3c. AVM1 MovieClip.setMask(maskClip)
  const doc1 = new MockSvgDoc();
  const stageSvg1 = doc1.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container1 = doc1.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg1.appendChild(container1);
  const avm1Program = {
    v: 2, swfVer: 8, w: 400, h: 300, fps: 24, bg: '#0f172a', fc: 1,
    sh: {}, sp: {}, bt: {}, et: {}, bc: [], fr: [[]], ac: [],
  };
  const avm1 = new sandbox.ASTAVM1Runtime(avm1Program, { doc: doc1, stageSvg: stageSvg1, container: container1 });
  avm1.mount(container1, stageSvg1);
  const contentMc = avm1.rootClip.createEmptyMovieClip('contentMc', 1);
  contentMc.beginFill(0x22c55e, 100);
  contentMc.moveTo(0, 0); contentMc.lineTo(150, 0); contentMc.lineTo(150, 80); contentMc.lineTo(0, 80);
  contentMc.endFill();
  const maskMc = avm1.rootClip.createEmptyMovieClip('maskMc', 2);
  maskMc.beginFill(0xffffff, 100);
  maskMc.moveTo(10, 10); maskMc.lineTo(90, 10); maskMc.lineTo(90, 60); maskMc.lineTo(10, 60);
  maskMc.endFill();

  contentMc.setMask(maskMc);
  const avm1ClipAttr = contentMc.svgEl.getAttribute('clip-path') || '';
  assert.ok(avm1ClipAttr.startsWith('url(#avm1-dyn-mask-'), `Expected AVM1 dynamic mask, got ${avm1ClipAttr}`);
  assert.equal(maskMc.svgEl.getAttribute('display'), 'none', 'AVM1 mask clip must be hidden');
  const avm1Cp = stageSvg1.querySelector(`#${avm1ClipAttr.slice(5, -1)}`);
  assert.ok(avm1Cp && avm1Cp.getAttribute('data-swf-vm-def') === '1', 'AVM1 <clipPath> must be tagged data-swf-vm-def="1"');
  assert.ok(avm1Cp.querySelectorAll('path').length >= 1, 'AVM1 <clipPath> must include Drawing API mask path');

  contentMc.setMask(null);
  assert.equal(contentMc.svgEl.getAttribute('clip-path'), null, 'AVM1 setMask(null) must remove clip-path');
  assert.equal(maskMc.svgEl.getAttribute('display'), 'inline', 'AVM1 setMask(null) must restore mask clip visibility');
  avm1.destroy();

  console.log('   ✓ AVM2 clipDepth, AVM2 DisplayObject.mask, & AVM1 MovieClip.setMask verified');
}

// ---------------------------------------------------------------------------
// TEST 4: AS3 SharedObject + ByteArray + Vector.<int> + Multi-Frame addFrameScript
// ---------------------------------------------------------------------------
async function testEverydayAs3ApisAndMultiFrame(sandbox: any) {
  console.log('4. Testing AS3 SharedObject, ByteArray, Vector.<int> (applytype 0x53), & Multi-Frame MovieClip...');

  const abc = new AbcBuilder();
  const qObj = abc.addQName('', 'Object');
  const qMovieClip = abc.addQName('flash.display', 'MovieClip');
  const qDoc = abc.addQName('', 'EduLabMovie');
  const qSharedObject = abc.addQName('flash.net', 'SharedObject');
  const qByteArray = abc.addQName('flash.utils', 'ByteArray');
  const qEndian = abc.addQName('flash.utils', 'Endian');
  const qVector = abc.addQName('__AS3__.vec', 'Vector');
  const qInt = abc.addQName('', 'int');

  const qGetLocal = abc.addQName('', 'getLocal');
  const qData = abc.addQName('', 'data');
  const qScore = abc.addQName('', 'score');
  const qFlush = abc.addQName('', 'flush');
  const qWriteInt = abc.addQName('', 'writeInt');
  const qWriteUTF = abc.addQName('', 'writeUTF');
  const qWriteShort = abc.addQName('', 'writeShort');
  const qReadInt = abc.addQName('', 'readInt');
  const qReadUTF = abc.addQName('', 'readUTF');
  const qReadUByte = abc.addQName('', 'readUnsignedByte');
  const qPosition = abc.addQName('', 'position');
  const qEndianProp = abc.addQName('', 'endian');
  const qLittleEndian = abc.addQName('', 'LITTLE_ENDIAN');
  const qPush = abc.addQName('', 'push');
  const qLength = abc.addQName('', 'length');
  const qIdx0 = abc.addQName('', '0');
  const qIdx1 = abc.addQName('', '1');
  const qIdx2 = abc.addQName('', '2');
  const qAddFrameScript = abc.addQName('', 'addFrameScript');
  const qGotoAndStop = abc.addQName('', 'gotoAndStop');
  const qOnFrame2 = abc.addQName('', 'onFrame2');
  const qFrame2Ran = abc.addQName('', 'frame2Ran');
  const qBaInt = abc.addQName('', 'baInt');
  const qBaStr = abc.addQName('', 'baStr');
  const qBaLeLo = abc.addQName('', 'baLeLo');
  const qVecSum = abc.addQName('', 'vecSum');
  const qVecLen = abc.addQName('', 'vecLen');
  const qSavedScore = abc.addQName('', 'savedScore');

  const sQuiz = abc.addString('quiz_progress');
  const sStJ = abc.addString('StJoseph');
  const iMagic = abc.addInt(0x12345678);
  const dFrac = abc.addDouble(25.9);

  // Method: onFrame2() { this.frame2Ran = true; }
  const mOnFrame2 = abc.addMethod({
    name: 'onFrame2',
    build: (c) => {
      c.op(0xd0).op(0x30) // getlocal_0; pushscope
        .op(0xd0).op(0x26).op(0x61).u30(qFrame2Ran) // this.frame2Ran = true
        .op(0x47); // returnvoid
    },
  });

  // Constructor: EduLabMovie()
  const mCtor = abc.addMethod({
    name: 'EduLabMovie',
    maxStack: 10,
    localCount: 8,
    build: (c) => {
      c.op(0xd0).op(0x30) // getlocal_0; pushscope
        .op(0xd0).op(0x49).u30(0); // constructsuper(0)

      // 1. SharedObject.getLocal("quiz_progress"): so.data.score = 95; so.flush();
      c.op(0x60).u30(qSharedObject) // getlex SharedObject
        .op(0x2c).u30(sQuiz)        // pushstring "quiz_progress"
        .op(0x46).u30(qGetLocal).u30(1) // callproperty getLocal(1)
        .op(0xd5);                  // setlocal_1 (so)
      c.op(0xd1).op(0x66).u30(qData) // so.data
        .op(0x24).u8(95)             // pushbyte 95
        .op(0x61).u30(qScore);       // .score = 95
      c.op(0xd1).op(0x4f).u30(qFlush).u30(0); // so.flush()
      // this.savedScore = SharedObject.getLocal("quiz_progress").data.score
      c.op(0xd0)
        .op(0x60).u30(qSharedObject)
        .op(0x2c).u30(sQuiz)
        .op(0x46).u30(qGetLocal).u30(1)
        .op(0x66).u30(qData)
        .op(0x66).u30(qScore)
        .op(0x61).u30(qSavedScore);

      // 2. ByteArray big-endian writeInt + writeUTF, read back, then LITTLE_ENDIAN writeShort
      c.op(0x5d).u30(qByteArray).op(0x4a).u30(qByteArray).u30(0) // new ByteArray()
        .op(0xd6); // setlocal_2 (ba)
      c.op(0xd2).op(0x2d).u30(iMagic).op(0x4f).u30(qWriteInt).u30(1); // ba.writeInt(0x12345678)
      c.op(0xd2).op(0x2c).u30(sStJ).op(0x4f).u30(qWriteUTF).u30(1);   // ba.writeUTF("StJoseph")
      c.op(0xd2).op(0x24).u8(0).op(0x61).u30(qPosition);              // ba.position = 0
      c.op(0xd0).op(0xd2).op(0x46).u30(qReadInt).u30(0).op(0x61).u30(qBaInt);
      c.op(0xd0).op(0xd2).op(0x46).u30(qReadUTF).u30(0).op(0x61).u30(qBaStr);
      // Switch to LITTLE_ENDIAN, writeShort(0x1234), read low byte -> 0x34
      c.op(0xd2).op(0x60).u30(qEndian).op(0x66).u30(qLittleEndian).op(0x61).u30(qEndianProp);
      c.op(0xd2).op(0x24).u8(0).op(0x61).u30(qPosition);
      c.op(0xd2).op(0x25).u30(0x1234).op(0x4f).u30(qWriteShort).u30(1);
      c.op(0xd2).op(0x24).u8(0).op(0x61).u30(qPosition);
      c.op(0xd0).op(0xd2).op(0x46).u30(qReadUByte).u30(0).op(0x61).u30(qBaLeLo);

      // 3. Vector.<int> via opcode 0x53 (applytype) + 0x42 (construct)
      c.op(0x60).u30(qVector) // getlex __AS3__.vec.Vector
        .op(0x60).u30(qInt)   // getlex int
        .op(0x53).u30(1)      // applytype(1) -> Vector.<int>
        .op(0x42).u30(0)      // construct(0) -> new Vector.<int>()
        .op(0xd7);            // setlocal_3 (vec)
      c.op(0xd3).op(0x24).u8(10).op(0x24).u8(20).op(0x24).u8(30).op(0x4f).u30(qPush).u30(3);
      c.op(0xd3).op(0x2f).u30(dFrac).op(0x61).u30(qIdx1); // vec[1] = 25.9 -> coerced to 25
      c.op(0xd0).op(0xd3).op(0x66).u30(qLength).op(0x61).u30(qVecLen);
      c.op(0xd0)
        .op(0xd3).op(0x66).u30(qIdx0)
        .op(0xd3).op(0x66).u30(qIdx1).op(0xa0) // add
        .op(0xd3).op(0x66).u30(qIdx2).op(0xa0) // add
        .op(0x61).u30(qVecSum);

      // 4. Multi-frame addFrameScript(1, this.onFrame2) + gotoAndStop(2)
      c.op(0xd0).op(0x24).u8(1).op(0xd0).op(0x66).u30(qOnFrame2).op(0x4f).u30(qAddFrameScript).u30(2);
      c.op(0xd0).op(0x24).u8(2).op(0x4f).u30(qGotoAndStop).u30(1);

      c.op(0x47); // returnvoid
    },
  });

  const clsIdx = abc.addClass({
    ns: '',
    name: 'EduLabMovie',
    superNs: 'flash.display',
    superName: 'MovieClip',
    iinit: mCtor,
    slots: [
      { name: 'frame2Ran' },
      { name: 'baInt' },
      { name: 'baStr' },
      { name: 'baLeLo' },
      { name: 'vecSum' },
      { name: 'vecLen' },
      { name: 'savedScore' },
    ],
    methods: [{ name: 'onFrame2', methodIdx: mOnFrame2 }],
  });

  const mScript = abc.addMethod({
    name: 'script_init',
    build: (c) => {
      c.op(0xd0).op(0x30)
        .op(0x5d).u30(qDoc)
        .op(0x60).u30(qObj).op(0x30)
        .op(0x60).u30(qMovieClip).op(0x30)
        .op(0x60).u30(qMovieClip)
        .op(0x58).u30(clsIdx)
        .op(0x1d).op(0x1d)
        .op(0x67).u30(qDoc)
        .op(0x47);
    },
  });
  abc.addScript(mScript, [clsIdx]);

  // 3-frame SWF where Frame 1 has shape 1 ('frame1Box'), Frame 2 swaps to shape 2 ('frame2Box'), Frame 3 swaps to shape 3
  const swf = assembleFwsSwf(10, 480, 320, 24, 3, [
    makeSwfTag(69, buildFileAttributesTag(true)),
    buildRectShapeTag(1, 0, 0, 80, 80, 0xef, 0x44, 0x44),
    buildRectShapeTag(2, 0, 0, 120, 60, 0x22, 0xc5, 0x5e),
    buildRectShapeTag(3, 0, 0, 90, 90, 0x3b, 0x82, 0xf6),
    makeSwfTag(82, buildDoAbc2Tag('EduLabMovie', abc.toUint8Array(), 1)),
    makeSwfTag(76, buildSymbolClassTag([{ charId: 0, name: 'EduLabMovie' }])),
    // Frame 1
    buildPlaceObject2Tag(1, 1, 20, 20, 'frame1Box'),
    makeSwfTag(1, new Uint8Array(0)),
    // Frame 2
    buildRemoveObject2Tag(1),
    buildPlaceObject2Tag(1, 2, 60, 40, 'frame2Box'),
    makeSwfTag(1, new Uint8Array(0)),
    // Frame 3
    buildRemoveObject2Tag(1),
    buildPlaceObject2Tag(1, 3, 100, 60, 'frame3Box'),
    makeSwfTag(1, new Uint8Array(0)),
  ]);

  const res = await transpileSwfToAst(swf, 'edu-as3-apis');
  assert.equal(res.success, true, `EduLabMovie transpile failed: ${res.error}`);
  assert.equal(res.metadata?.frameCount, 3);

  const doc = new MockSvgDoc();
  const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg.appendChild(container);
  const rt = new sandbox.ASTAVM2Runtime(extractSwfVmB64(res.astSource), { doc, stageSvg, container });
  rt.mount(container, stageSvg);

  // Verify SharedObject offline persistence
  assert.equal(rt.rootDoc.savedScore, 95, 'SharedObject.getLocal must persist and restore score=95 offline');
  // Verify ByteArray big-endian & little-endian + UTF
  assert.equal(rt.rootDoc.baInt, 0x12345678, 'ByteArray big-endian writeInt/readInt mismatch');
  assert.equal(rt.rootDoc.baStr, 'StJoseph', 'ByteArray writeUTF/readUTF mismatch');
  assert.equal(rt.rootDoc.baLeLo, 0x34, 'ByteArray little-endian writeShort(0x1234) low byte must be 0x34');
  // Verify Vector.<int> applytype(0x53) + coercion
  assert.equal(rt.rootDoc.vecLen, 3, 'Vector.<int> length must be 3');
  assert.equal(rt.rootDoc.vecSum, 65, 'Vector.<int> sum must be 10 + int(25.9) + 30 = 65');
  // Verify Multi-frame MovieClip + addFrameScript + SVG display-list swap
  assert.equal(rt.rootDoc.currentFrame, 2, 'gotoAndStop(2) must set currentFrame = 2');
  assert.equal(rt.rootDoc.frame2Ran, true, 'addFrameScript(1, onFrame2) must execute on frame 2');
  assert.equal(rt.rootDoc.getChildByName('frame1Box'), null, 'Frame 1 shape must be removed on Frame 2');
  assert.ok(rt.rootDoc.getChildByName('frame2Box'), 'Frame 2 shape must be mounted on Frame 2');

  // Verify stepping to Frame 3 via nextFrame() swaps SVG stage to frame3Box
  rt.rootDoc.nextFrame();
  rt.stage._syncSvg(doc);
  assert.equal(rt.rootDoc.currentFrame, 3);
  assert.equal(rt.rootDoc.getChildByName('frame2Box'), null, 'Frame 2 shape must be removed on Frame 3');
  assert.ok(rt.rootDoc.getChildByName('frame3Box'), 'Frame 3 shape must be mounted on Frame 3');

  // Verify SharedObject persists across a fresh VM instance (zero cloud egress)
  rt.destroy();
  const rt2 = new sandbox.ASTAVM2Runtime(extractSwfVmB64(res.astSource), { doc, stageSvg, container });
  const soClass = rt2._resolveClass('flash.net.SharedObject');
  const reopened = soClass.staticObj.getLocal('quiz_progress');
  assert.equal(reopened.data.score, 95, 'SharedObject must survive across fresh VM instances');
  reopened.clear();
  rt2.destroy();

  console.log('   ✓ SharedObject, ByteArray, Vector.<int>, & Multi-Frame addFrameScript verified');
}

async function main() {
  const sandbox = loadVmRuntime();
  await testZwsLzmaRoundTrip(sandbox);
  await testVectorFontsAndStaticText(sandbox);
  await testSvgClipPathMasks(sandbox);
  await testEverydayAs3ApisAndMultiFrame(sandbox);
  console.log('\n✅ All 4 Legacy & Modern Flash Gap Tests Passed!');
}

main().catch((err) => {
  console.error('❌ Legacy/Modern Flash gap test failed:', err);
  process.exit(1);
});
