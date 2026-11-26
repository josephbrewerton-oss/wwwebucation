// scripts/test-swf-ruffle-parity.ts
/**
 * Ruffle-Style End-to-End Binary SWF & Trace-Diff Regression Harness
 * Verifies:
 *  1. Zero-Dependency Web Audio SWF Sound Engine (DefineSound PCM/ADPCM, StartSound, FlashSound, ActionStopSounds)
 *  2. Pure-SVG Visual FX (RGB ColorTransform, Flash 8+ Blur/DropShadow/Glow Filters, Linear Gradients, DefineBitsLossless2 Bitmap Fills, live new Color(mc).setRGB)
 *  3. Interactive Editable DefineEditText Fields (SVG hit rect + caret line, Selection.setFocus, typing, maxChars, Backspace, var sync, onChanged, password masking)
 *  4. Deterministic Ruffle-style Frame Trace-Diff Assertions & Reset Hygiene
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { transpileSwfToAst } from '../src/utils/swfAstParser';

// ============================================================================
// Minimal Binary SWF Builder Utilities (Real SWF v8 Binary Fixtures)
// ============================================================================

class BitWriter {
  private bytes: number[] = [];
  private cur = 0;
  private bitCount = 0;

  writeBits(val: number, n: number) {
    for (let i = n - 1; i >= 0; i--) {
      this.cur = (this.cur << 1) | ((val >>> i) & 1);
      this.bitCount++;
      if (this.bitCount === 8) {
        this.bytes.push(this.cur);
        this.cur = 0;
        this.bitCount = 0;
      }
    }
  }

  writeSBits(val: number, n: number) {
    const mask = (1 << n) - 1;
    this.writeBits(val & mask, n);
  }

  align() {
    if (this.bitCount > 0) {
      this.bytes.push(this.cur << (8 - this.bitCount));
      this.cur = 0;
      this.bitCount = 0;
    }
  }

  toUint8Array(): Uint8Array {
    this.align();
    return new Uint8Array(this.bytes);
  }
}

function u16le(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff];
}

function u32le(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
}

function fixed16_16(v: number): number[] {
  return u32le(Math.round(v * 65536));
}

function fixed8_8(v: number): number[] {
  return u16le(Math.round(v * 256));
}

function cstr(s: string): number[] {
  return [...Buffer.from(s, 'utf8'), 0];
}

function encodeRect(xmin: number, xmax: number, ymin: number, ymax: number): Uint8Array {
  const vals = [xmin, xmax, ymin, ymax];
  let nbits = 2;
  for (const v of vals) {
    const abs = v < 0 ? -v : v + 1;
    const needed = Math.ceil(Math.log2(Math.max(2, abs))) + 1;
    if (needed > nbits) nbits = needed;
  }
  const bw = new BitWriter();
  bw.writeBits(nbits, 5);
  bw.writeSBits(xmin, nbits);
  bw.writeSBits(xmax, nbits);
  bw.writeSBits(ymin, nbits);
  bw.writeSBits(ymax, nbits);
  return bw.toUint8Array();
}

function encodeIdentityMatrix(txTwips = 0, tyTwips = 0, scaleX?: number, scaleY?: number): Uint8Array {
  const bw = new BitWriter();
  if (scaleX !== undefined && scaleY !== undefined) {
    bw.writeBits(1, 1); // hasScale
    const sx = Math.round(scaleX * 65536);
    const sy = Math.round(scaleY * 65536);
    bw.writeBits(24, 5);
    bw.writeSBits(sx, 24);
    bw.writeSBits(sy, 24);
  } else {
    bw.writeBits(0, 1); // hasScale = 0
  }
  bw.writeBits(0, 1); // hasRotate = 0
  if (txTwips === 0 && tyTwips === 0) {
    bw.writeBits(0, 5);
  } else {
    bw.writeBits(16, 5);
    bw.writeSBits(txTwips, 16);
    bw.writeSBits(tyTwips, 16);
  }
  return bw.toUint8Array();
}

function encodeCxformWithAlpha(
  rm: number, gm: number, bm: number, am: number,
  ra: number, ga: number, ba: number, aa: number
): Uint8Array {
  const bw = new BitWriter();
  bw.writeBits(1, 1); // hasAdd
  bw.writeBits(1, 1); // hasMult
  bw.writeBits(10, 4); // nbits = 10 (-512..511)
  bw.writeSBits(rm, 10);
  bw.writeSBits(gm, 10);
  bw.writeSBits(bm, 10);
  bw.writeSBits(am, 10);
  bw.writeSBits(ra, 10);
  bw.writeSBits(ga, 10);
  bw.writeSBits(ba, 10);
  bw.writeSBits(aa, 10);
  return bw.toUint8Array();
}

function makeTag(code: number, payload: number[] | Uint8Array): Uint8Array {
  const data = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
  if (data.length < 63) {
    const out = new Uint8Array(2 + data.length);
    const hdr = (code << 6) | data.length;
    out[0] = hdr & 0xff;
    out[1] = (hdr >>> 8) & 0xff;
    out.set(data, 2);
    return out;
  }
  const out = new Uint8Array(6 + data.length);
  const hdr = (code << 6) | 0x3f;
  out[0] = hdr & 0xff;
  out[1] = (hdr >>> 8) & 0xff;
  out[2] = data.length & 0xff;
  out[3] = (data.length >>> 8) & 0xff;
  out[4] = (data.length >>> 16) & 0xff;
  out[5] = (data.length >>> 24) & 0xff;
  out.set(data, 6);
  return out;
}

function buildSwf(tags: Uint8Array[], opts: { width?: number; height?: number; fps?: number; version?: number } = {}): Uint8Array {
  const w = (opts.width || 600) * 20;
  const h = (opts.height || 400) * 20;
  const fps = opts.fps || 30;
  const version = opts.version || 8;
  const rect = encodeRect(0, w, 0, h);
  const frameCount = tags.filter((t) => ((t[0] | (t[1] << 8)) >>> 6) === 1).length || 1;
  const endTag = makeTag(0, []);
  const bgTag = makeTag(9, [0x0f, 0x17, 0x2a]);
  const allTags = [bgTag, ...tags, endTag];
  const bodyLen = rect.length + 4 + allTags.reduce((s, t) => s + t.length, 0);
  const totalLen = 8 + bodyLen;
  const out = new Uint8Array(totalLen);
  out[0] = 0x46; out[1] = 0x57; out[2] = 0x53; // FWS
  out[3] = version;
  out.set(u32le(totalLen), 4);
  let pos = 8;
  out.set(rect, pos); pos += rect.length;
  out[pos++] = 0; out[pos++] = fps; // 8.8 fixed FPS
  out[pos++] = frameCount & 0xff; out[pos++] = (frameCount >>> 8) & 0xff;
  for (const t of allTags) {
    out.set(t, pos);
    pos += t.length;
  }
  return out;
}

// ============================================================================
// AVM1 Bytecode Assembler Helpers
// ============================================================================

function actionPush(items: Array<{ t: 'str'; v: string } | { t: 'int'; v: number } | { t: 'bool'; v: boolean }>): number[] {
  const body: number[] = [];
  for (const it of items) {
    if (it.t === 'str') {
      body.push(0, ...cstr(it.v));
    } else if (it.t === 'int') {
      body.push(7, ...u32le(it.v));
    } else if (it.t === 'bool') {
      body.push(5, it.v ? 1 : 0);
    }
  }
  return [0x96, ...u16le(body.length), ...body];
}

function actionTrace(str: string): number[] {
  return [...actionPush([{ t: 'str', v: str }]), 0x26];
}

// ============================================================================
// Rich Mock SVG DOM for Node Runtime Verification
// ============================================================================

class MockSvgNode {
  tagName: string;
  nodeName: string;
  attrs: Record<string, string> = {};
  children: MockSvgNode[] = [];
  parentNode: MockSvgNode | null = null;
  textContent = '';
  style: Record<string, string> = {};
  listeners: Record<string, Function[]> = {};

  constructor(tag: string) {
    this.tagName = tag;
    this.nodeName = tag;
  }
  get firstChild() { return this.children[0] || null; }
  get nextSibling() {
    if (!this.parentNode) return null;
    const i = this.parentNode.children.indexOf(this);
    return i >= 0 && i + 1 < this.parentNode.children.length ? this.parentNode.children[i + 1] : null;
  }
  get attributes() {
    return Object.entries(this.attrs).map(([name, value]) => ({ name, value }));
  }
  setAttribute(k: string, v: string) { this.attrs[k] = String(v); }
  getAttribute(k: string) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
  removeAttribute(k: string) { delete this.attrs[k]; }
  appendChild(c: MockSvgNode) {
    if (c.parentNode) c.parentNode.removeChild(c);
    c.parentNode = this;
    this.children.push(c);
    return c;
  }
  removeChild(c: MockSvgNode) {
    const i = this.children.indexOf(c);
    if (i !== -1) { this.children.splice(i, 1); c.parentNode = null; }
    return c;
  }
  insertBefore(c: MockSvgNode, ref: MockSvgNode | null) {
    if (c.parentNode) c.parentNode.removeChild(c);
    c.parentNode = this;
    if (!ref) { this.children.push(c); return c; }
    const i = this.children.indexOf(ref);
    if (i === -1) this.children.push(c);
    else this.children.splice(i, 0, c);
    return c;
  }
  replaceChildren(...nodes: MockSvgNode[]) {
    for (const c of this.children) c.parentNode = null;
    this.children = [];
    for (const n of nodes) this.appendChild(n);
  }
  cloneNode(deep = false): MockSvgNode {
    const copy = new MockSvgNode(this.tagName);
    copy.attrs = { ...this.attrs };
    copy.textContent = this.textContent;
    if (deep) {
      for (const ch of this.children) copy.appendChild(ch.cloneNode(true));
    }
    return copy;
  }
  addEventListener(ev: string, fn: Function) {
    if (!this.listeners[ev]) this.listeners[ev] = [];
    this.listeners[ev].push(fn);
  }
  removeEventListener(ev: string, fn: Function) {
    if (!this.listeners[ev]) return;
    this.listeners[ev] = this.listeners[ev].filter((f) => f !== fn);
  }
  querySelector(sel: string): MockSvgNode | null {
    return this.querySelectorAll(sel)[0] || null;
  }
  querySelectorAll(sel: string): MockSvgNode[] {
    const out: MockSvgNode[] = [];
    const wantTags = sel.split(',').map((p) => p.trim().split(/\s+/).pop()!.toLowerCase());
    const walk = (n: MockSvgNode) => {
      if (wantTags.includes(n.tagName.toLowerCase())) out.push(n);
      for (const c of n.children) walk(c);
    };
    for (const c of this.children) walk(c);
    return out;
  }
  findAllByTag(tag: string): MockSvgNode[] {
    const out: MockSvgNode[] = [];
    const t = tag.toLowerCase();
    const walk = (n: MockSvgNode) => {
      if (n.tagName.toLowerCase() === t) out.push(n);
      for (const c of n.children) walk(c);
    };
    walk(this);
    return out;
  }
}

function createAvm1Sandbox() {
  const vmCode = fs.readFileSync(path.resolve('static/player/ast-avm1-vm.js'), 'utf8');
  const mockDoc = {
    createElementNS(_ns: string, tag: string) {
      return new MockSvgNode(tag);
    },
    createElement(tag: string) {
      return new MockSvgNode(tag);
    },
  };
  const sandbox: any = {
    console, Math, Date, Number, String, Boolean, Array, Object, Map, Set, RegExp, JSON,
    Uint8Array, Float32Array, Int16Array, DataView, ArrayBuffer, TextDecoder, parseInt, parseFloat, isNaN, isFinite,
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    performance: { now: () => Date.now() },
    document: mockDoc,
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(vmCode, sandbox);
  return { ASTAVM1Runtime: sandbox.ASTAVM1Runtime, mockDoc };
}

function extractSwfVmB64(astSource: string): string {
  const m = astSource.match(/\(:swf-vm\s+"([^"]+)"\)/);
  assert.ok(m && m[1], 'Transpiled AST must contain (:swf-vm "...") payload');
  return m[1];
}

// ============================================================================
// TEST 1: Web Audio SWF Sound Engine (PCM + IMA ADPCM + StartSound + FlashSound + StopSounds)
// ============================================================================

async function testSwfSoundEngine() {
  // Sound ID 1: 16-bit LE PCM (fmt=3), 22050Hz (rateCode=2), 16-bit (1), mono (0)
  // Header flags byte: (3 << 4) | (2 << 2) | (1 << 1) | 0 = 0x3a
  const pcmSamples = 16;
  const pcmData: number[] = [];
  for (let i = 0; i < pcmSamples; i++) {
    const val = Math.round(Math.sin((i / pcmSamples) * Math.PI * 2) * 16000);
    const u = val < 0 ? val + 0x10000 : val;
    pcmData.push(u & 0xff, (u >>> 8) & 0xff);
  }
  const defineSoundPcm = makeTag(14, [
    ...u16le(1), // soundId = 1
    0x3a,        // fmt=3 (LE PCM), rate=22050, 16-bit, mono
    ...u32le(pcmSamples),
    ...pcmData,
  ]);

  // Sound ID 2: SWF 4-bit IMA ADPCM (fmt=1), 11025Hz (rateCode=1), 16-bit (1), mono (0)
  // Header flags byte: (1 << 4) | (1 << 2) | (1 << 1) | 0 = 0x16
  const adpcmBw = new BitWriter();
  adpcmBw.writeBits(2, 2); // codeSize = 2 + 2 = 4 bits
  adpcmBw.writeSBits(1200, 16); // initial sample
  adpcmBw.writeBits(10, 6);     // initial step index
  for (let i = 0; i < 8; i++) {
    adpcmBw.writeBits(i % 2 === 0 ? 3 : 11, 4); // alternating positive/negative deltas
  }
  const defineSoundAdpcm = makeTag(14, [
    ...u16le(2),
    0x16,
    ...u32le(9),
    ...adpcmBw.toUint8Array(),
  ]);

  // ExportAssets (Tag 56): export ID 1 as "beep"
  const exportTag = makeTag(56, [...u16le(1), ...u16le(1), ...cstr('beep')]);

  // StartSound (Tag 15): soundId=1, hasLoops=1 (flag 0x04), loopCount=2
  const startSoundTag = makeTag(15, [...u16le(1), 0x04, ...u16le(2)]);

  // Frame 1 DoAction:
  // trace("frame1");
  // var s = new Sound();
  // s.attachSound("beep");
  // s.setVolume(65);
  // s.setPan(-25);
  // s.start(0, 3);
  // trace("sound_started");
  const f1Actions = [
    ...actionTrace('frame1'),
    // new Sound(): push 0, push "Sound", ActionNewObject (0x40), store in var s
    ...actionPush([{ t: 'str', v: 's' }, { t: 'int', v: 0 }, { t: 'str', v: 'Sound' }]),
    0x40, // ActionNewObject
    0x1d, // ActionSetVariable (s = new Sound())
    // s.attachSound("beep"): push "beep", push 1, getVar "s", push "attachSound", ActionCallMethod (0x52), pop
    ...actionPush([{ t: 'str', v: 'beep' }, { t: 'int', v: 1 }, { t: 'str', v: 's' }]),
    0x1c, // GetVariable -> s
    ...actionPush([{ t: 'str', v: 'attachSound' }]),
    0x52, // CallMethod
    0x17, // Pop
    // s.setVolume(65)
    ...actionPush([{ t: 'int', v: 65 }, { t: 'int', v: 1 }, { t: 'str', v: 's' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: 'setVolume' }]),
    0x52, 0x17,
    // s.setPan(-25)
    ...actionPush([{ t: 'int', v: -25 }, { t: 'int', v: 1 }, { t: 'str', v: 's' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: 'setPan' }]),
    0x52, 0x17,
    // s.start(0, 3) -> stack args in AVM1 CallMethod are pushed right-to-left (loops=3, offset=0)
    ...actionPush([{ t: 'int', v: 3 }, { t: 'int', v: 0 }, { t: 'int', v: 2 }, { t: 'str', v: 's' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: 'start' }]),
    0x52, 0x17,
    ...actionTrace('sound_started'),
    0x00, // End
  ];

  // Frame 2 DoAction: ActionStopSounds (0x09), trace("frame2_stopped"), stop() (0x07)
  const f2Actions = [
    0x09, // ActionStopSounds
    ...actionTrace('frame2_stopped'),
    0x07, // ActionStop
    0x00,
  ];

  const swf = buildSwf([
    defineSoundPcm,
    defineSoundAdpcm,
    exportTag,
    startSoundTag,
    makeTag(12, f1Actions),
    makeTag(1, []), // ShowFrame 1
    makeTag(12, f2Actions),
    makeTag(1, []), // ShowFrame 2
  ]);

  const parsed = await transpileSwfToAst(swf.buffer.slice(swf.byteOffset, swf.byteOffset + swf.byteLength), 'sound_test.swf');
  assert.equal(parsed.success, true, `transpileSwfToAst failed: ${parsed.error}`);
  const vmB64 = extractSwfVmB64(parsed.astSource);
  const vmProg = JSON.parse(Buffer.from(vmB64, 'base64').toString('utf8'));

  assert.ok(vmProg.sn && vmProg.sn['1'] && vmProg.sn['2'], 'DefineSound IDs 1 & 2 must be serialized in vmProgram.sn');
  assert.equal(vmProg.sn['1'].fmt, 3);
  assert.equal(vmProg.sn['1'].rate, 22050);
  assert.equal(vmProg.sn['2'].fmt, 1);
  assert.equal(vmProg.sn['2'].rate, 11025);
  assert.ok(Array.isArray(vmProg.sf) && vmProg.sf[0] && vmProg.sf[0].id === 1 && vmProg.sf[0].loops === 2, 'Frame 1 StartSound must be serialized in vmProgram.sf');

  const { ASTAVM1Runtime } = createAvm1Sandbox();
  const stage = new MockSvgNode('svg');
  const runtime = new ASTAVM1Runtime(vmB64, { engine: { vars: {}, isMuted: false } });
  runtime.mount(stage, stage);

  // Verify PCM & IMA ADPCM decoders directly produce valid non-empty Float32 waveforms
  const pcmBytes = Uint8Array.from(Buffer.from(vmProg.sn['1'].b64, 'base64'));
  const pcmWave = runtime._decodeSwfPcm(pcmBytes, true, false, true);
  assert.equal(pcmWave.length, 1);
  assert.equal(pcmWave[0].length, 16);
  assert.ok(Math.abs(pcmWave[0][4]) > 0.4, 'Decoded 16-bit PCM sine peak should exceed 0.4');

  const adpcmBytes = Uint8Array.from(Buffer.from(vmProg.sn['2'].b64, 'base64'));
  const adpcmWave = runtime._decodeSwfAdpcm(adpcmBytes, false);
  assert.equal(adpcmWave.length, 1);
  assert.equal(adpcmWave[0].length, 9);
  assert.ok(adpcmWave[0][0] > 0.03, 'Decoded SWF IMA ADPCM initial predictor sample must match');

  // Step Frame 2 (fps=30 -> 34ms)
  runtime.step(0.034);

  // Ruffle-style trace-diff check
  assert.deepEqual(Array.from(runtime._traces), ['frame1', 'sound_started', 'frame2_stopped']);

  // Sound execution log check: timeline StartSound(id=1, loops=2), FlashSound.start(id=1, vol=65, pan=-25, loops=3), ActionStopSounds
  assert.ok(
    runtime._soundLog.some((e: any) => e.op === 'start' && e.id === 1 && e.loops === 2 && e.volume === 100),
    `Expected Frame 1 StartSound event in _soundLog: ${JSON.stringify(runtime._soundLog)}`
  );
  assert.ok(
    runtime._soundLog.some((e: any) => e.op === 'start' && e.id === 1 && e.loops === 3 && e.volume === 65 && e.pan === -25),
    `Expected FlashSound.start(vol=65, pan=-25, loops=3) in _soundLog: ${JSON.stringify(runtime._soundLog)}`
  );
  assert.ok(
    runtime._soundLog.some((e: any) => e.op === 'stopAll'),
    `Expected ActionStopSounds stopAll in _soundLog: ${JSON.stringify(runtime._soundLog)}`
  );

  // Reset check: Frame 1 StartSound must replay cleanly on reset()
  runtime.reset();
  assert.ok(
    runtime._soundLog.some((e: any) => e.op === 'start' && e.id === 1 && e.loops === 2),
    'Frame 1 StartSound must replay after runtime.reset()'
  );
  runtime.destroy();
  console.log('✓ Test 1 passed: Web Audio SWF Sound Engine (PCM, IMA ADPCM, StartSound, FlashSound, ActionStopSounds, Reset)');
}

// ============================================================================
// TEST 2: Pure-SVG Visual FX (ColorTransform, Flash 8 Filters, Gradients, Bitmap Fills, Color.setRGB)
// ============================================================================

async function testPureSvgVisualFx() {
  // 1. DefineBitsLossless2 (Tag 36, ID 10): 2x2 ARGB 32-bit format=5 (premultiplied alpha)
  const rawPixels = Buffer.from([
    255, 255, 0, 0,     // opaque red
    128, 0, 128, 0,     // 50% green (premultiplied -> unpremultiplied 0,255,0,128)
    255, 0, 0, 255,     // opaque blue
    255, 255, 255, 0,   // opaque yellow
  ]);
  const zPixels = zlib.deflateSync(rawPixels);
  const defineBitmap = makeTag(36, [
    ...u16le(10), // bitmap ID 10
    5,            // format 5 = 32-bit ARGB
    ...u16le(2),  // width 2
    ...u16le(2),  // height 2
    ...zPixels,
  ]);

  // 2. DefineShape3 (Tag 32, ID 11): Fill 1 = Linear Gradient (0x10), Fill 2 = Clipped Bitmap Fill (0x41 -> ID 10)
  const shapeBounds = encodeRect(0, 2000, 0, 1000); // 100x50 px
  const gradMatrix = encodeIdentityMatrix(1000, 500, 0.06, 0.06);
  const bmpMatrix = encodeIdentityMatrix(0, 0, 20, 20);

  const shapeBody: number[] = [
    ...u16le(11),
    ...shapeBounds,
    2, // FillStyleCount = 2
    // Fill 1: Linear Gradient (0x10)
    0x10,
    ...gradMatrix,
    2, // numGradients = 2 (spreadMode=0, interp=0)
    0, 255, 0, 0, 255,     // ratio 0 -> rgba(255,0,0,1)
    255, 0, 0, 255, 255,   // ratio 255 -> rgba(0,0,255,1)
    // Fill 2: Clipped Bitmap Fill (0x41) referencing bitmap ID 10
    0x41,
    ...u16le(10),
    ...bmpMatrix,
    0, // LineStyleCount = 0
  ];

  // Shape records: 2 bits fillBits, 0 bits lineBits
  const sbw = new BitWriter();
  sbw.writeBits(2, 4); // numFillBits = 2
  sbw.writeBits(0, 4); // numLineBits = 0
  // StyleChange: moveTo(0,0), fillStyle1 = 1 (gradient)
  sbw.writeBits(0, 1); // non-edge
  sbw.writeBits(0, 1); // newStyles
  sbw.writeBits(0, 1); // lineStyle
  sbw.writeBits(1, 1); // fillStyle1
  sbw.writeBits(0, 1); // fillStyle0
  sbw.writeBits(1, 1); // moveTo
  sbw.writeBits(2, 5); // moveBits
  sbw.writeSBits(0, 2);
  sbw.writeSBits(0, 2);
  sbw.writeBits(1, 2); // fillStyle1 = 1
  // Draw 50x50 square (1000 twips) with straight edges
  const writeH = (dx: number) => {
    sbw.writeBits(1, 1); sbw.writeBits(1, 1); sbw.writeBits(10, 4); // straight, nbits=12
    sbw.writeBits(0, 1); sbw.writeBits(0, 1); // horizontal
    sbw.writeSBits(dx, 12);
  };
  const writeV = (dy: number) => {
    sbw.writeBits(1, 1); sbw.writeBits(1, 1); sbw.writeBits(10, 4);
    sbw.writeBits(0, 1); sbw.writeBits(1, 1); // vertical
    sbw.writeSBits(dy, 12);
  };
  writeH(1000); writeV(1000); writeH(-1000); writeV(-1000);
  // StyleChange: moveTo(1000,0), fillStyle1 = 2 (bitmap fill)
  sbw.writeBits(0, 1);
  sbw.writeBits(0, 1); sbw.writeBits(0, 1); sbw.writeBits(1, 1); sbw.writeBits(0, 1); sbw.writeBits(1, 1);
  sbw.writeBits(12, 5);
  sbw.writeSBits(1000, 12); sbw.writeSBits(0, 12);
  sbw.writeBits(2, 2); // fillStyle1 = 2
  writeH(1000); writeV(1000); writeH(-1000); writeV(-1000);
  // EndShapeRecord (6 zero bits)
  sbw.writeBits(0, 6);
  shapeBody.push(...sbw.toUint8Array());
  const defineShape = makeTag(32, shapeBody);

  // DefineSprite (Tag 39, ID 12) wrapping Shape 11 so `new Color(hero)` targets a MovieClip
  const spritePlace = makeTag(26, [
    0x06, // hasCharacter | hasMatrix
    ...u16le(1), // depth 1
    ...u16le(11),
    ...encodeIdentityMatrix(0, 0),
  ]);
  const defineSprite = makeTag(39, [
    ...u16le(12),
    ...u16le(1),
    ...spritePlace,
    ...makeTag(1, []),
    ...makeTag(0, []),
  ]);

  // 3. PlaceObject3 (Tag 70): places Sprite 12 at depth 1 with name "hero", ColorTransform, and 3 Flash 8 Filters (Blur, DropShadow, Glow)
  const cx = encodeCxformWithAlpha(256, 128, 128, 256, 30, 0, 0, 0);
  const filtersBytes: number[] = [
    3, // 3 filters
    // Filter 1: BlurFilter (id=1)
    1,
    ...fixed16_16(6), // blurX
    ...fixed16_16(6), // blurY
    0x08,             // passes=1
    // Filter 2: DropShadowFilter (id=0)
    0,
    0, 0, 0, 180,     // RGBA black 70%
    ...fixed16_16(4), // blurX
    ...fixed16_16(4), // blurY
    ...fixed16_16(Math.PI / 4), // 45 deg
    ...fixed16_16(5), // distance
    ...fixed8_8(1),   // strength
    0x01,             // flags
    // Filter 3: GlowFilter (id=2)
    2,
    0, 255, 255, 255, // cyan glow
    ...fixed16_16(8),
    ...fixed16_16(8),
    ...fixed8_8(1.5),
    0x01,
  ];
  const place3 = makeTag(70, [
    0x2e, // flags1: hasName(0x20) | hasColorTransform(0x08) | hasMatrix(0x04) | hasCharacter(0x02)
    0x01, // flags2: hasFilterList(0x01)
    ...u16le(1),  // depth 1
    ...u16le(12), // charId 12
    ...encodeIdentityMatrix(400, 400),
    ...cx,
    ...cstr('hero'),
    ...filtersBytes,
  ]);

  // Frame 2 DoAction: var c = new Color(hero); c.setRGB(0xff3300); trace("tinted"); stop();
  const f2Tint = [
    ...actionPush([{ t: 'str', v: 'c' }, { t: 'str', v: 'hero' }]),
    0x1c, // GetVariable hero
    ...actionPush([{ t: 'int', v: 1 }, { t: 'str', v: 'Color' }]),
    0x40, // new Color(hero)
    0x1d, // c = ...
    ...actionPush([{ t: 'int', v: 0xff3300 }, { t: 'int', v: 1 }, { t: 'str', v: 'c' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: 'setRGB' }]),
    0x52, 0x17,
    ...actionTrace('tinted'),
    0x07, // stop
    0x00,
  ];

  const swf = buildSwf([
    defineBitmap,
    defineShape,
    defineSprite,
    place3,
    makeTag(1, []), // ShowFrame 1
    makeTag(12, f2Tint),
    makeTag(1, []), // ShowFrame 2
  ]);

  const parsed = await transpileSwfToAst(swf.buffer.slice(swf.byteOffset, swf.byteOffset + swf.byteLength), 'fx_test.swf');
  assert.equal(parsed.success, true, `transpileSwfToAst failed: ${parsed.error}`);
  const vmB64 = extractSwfVmB64(parsed.astSource);
  const vmProg = JSON.parse(Buffer.from(vmB64, 'base64').toString('utf8'));

  // Parser verification
  assert.ok(vmProg.bm && vmProg.bm['10'], 'DefineBitsLossless2 must populate vmProgram.bm["10"]');
  assert.ok(vmProg.bm['10'].u.startsWith('data:image/png;base64,'), 'Lossless2 bitmap must encode as valid pure-JS PNG data URI');
  assert.ok(Array.isArray(vmProg.gr) && vmProg.gr.length === 1 && vmProg.gr[0].t === 'l', 'Linear gradient must be extracted into vmProgram.gr');
  assert.ok(Array.isArray(vmProg.bp) && vmProg.bp.length === 1 && vmProg.bp[0].b === 10, 'Bitmap fill pattern must reference bitmap ID 10');

  const frame1Entry = vmProg.fr[0].find((e: any) => e.n === 'hero');
  assert.ok(frame1Entry, 'PlaceObject3 hero placement must exist in Frame 1');
  assert.ok(Array.isArray(frame1Entry.cx) && frame1Entry.cx[1] === 128 && frame1Entry.cx[4] === 30, 'Full RGB ColorTransform must be preserved');
  assert.ok(Array.isArray(frame1Entry.fl) && frame1Entry.fl.length === 3, 'All 3 Flash 8 surface filters must be parsed');
  assert.deepEqual(frame1Entry.fl.map((f: any) => f.t), ['bl', 'ds', 'gl']);

  // Runtime SVG DOM verification
  const { ASTAVM1Runtime } = createAvm1Sandbox();
  const stage = new MockSvgNode('svg');
  const runtime = new ASTAVM1Runtime(vmB64, { engine: { vars: {} } });
  runtime.mount(stage, stage);

  const defs = stage.findAllByTag('defs')[0];
  assert.ok(defs, 'Mounted stage must contain <defs>');
  const grads = defs.findAllByTag('linearGradient');
  assert.equal(grads.length, 1, 'Linear gradient def must be installed in <defs>');
  assert.equal(grads[0].findAllByTag('stop').length, 2, 'Gradient must contain 2 <stop> elements');

  const patterns = defs.findAllByTag('pattern');
  assert.equal(patterns.length, 1, 'Bitmap fill <pattern> must be installed in <defs>');
  const patImg = patterns[0].findAllByTag('image')[0];
  assert.ok(patImg && patImg.getAttribute('href')?.startsWith('data:image/png;base64,'), '<pattern><image> must carry validated PNG data URI');

  const filters = defs.findAllByTag('filter');
  assert.ok(filters.length >= 1, 'PlaceObject3 ColorTransform + Filters must generate SVG <filter>');
  const fxFilter = filters[0];
  assert.ok(fxFilter.findAllByTag('feColorMatrix').length >= 1, 'RGB ColorTransform must emit <feColorMatrix>');
  assert.ok(fxFilter.findAllByTag('feGaussianBlur').length >= 2, 'BlurFilter + GlowFilter must emit <feGaussianBlur>');
  assert.ok(fxFilter.findAllByTag('feDropShadow').length >= 1, 'DropShadowFilter must emit <feDropShadow>');
  assert.ok(fxFilter.findAllByTag('feMerge').length >= 1, 'GlowFilter must emit <feMerge>');

  const heroClip = runtime.rootClip._childrenByDepth.get(1)?.obj;
  assert.ok(heroClip, 'hero clip must exist at depth 1');
  const initialFilterAttr = heroClip.svgEl.getAttribute('filter');
  assert.ok(initialFilterAttr && initialFilterAttr.startsWith('url(#avm1-fx-'), 'hero clip must apply SVG filter URL');

  // Step to Frame 2 -> new Color(hero).setRGB(0xff3300) updates SVG filter live
  runtime.step(0.034);
  assert.deepEqual(Array.from(runtime._traces), ['tinted']);
  const updatedFilterAttr = heroClip.svgEl.getAttribute('filter');
  assert.ok(updatedFilterAttr && updatedFilterAttr !== initialFilterAttr, 'new Color(hero).setRGB() must generate and apply updated <feColorMatrix> filter');

  // Reset must NOT duplicate <linearGradient> or <pattern> defs
  runtime.reset();
  const defsAfterReset = stage.findAllByTag('defs')[0];
  assert.equal(defsAfterReset.findAllByTag('linearGradient').length, 1, 'Reset must not duplicate <linearGradient> defs');
  assert.equal(defsAfterReset.findAllByTag('pattern').length, 1, 'Reset must not duplicate <pattern> defs');

  runtime.destroy();
  console.log('✓ Test 2 passed: Pure-SVG Visual FX (RGB ColorTransform, Blur/DropShadow/Glow Filters, Gradients, Bitmap Fills, Color.setRGB)');
}

// ============================================================================
// TEST 3: Interactive Editable DefineEditText Fields
// ============================================================================

async function testInteractiveEditText() {
  // DefineEditText (Tag 37, ID 20):
  // flags1: hasText(0x80) | wordWrap(0x40) | multiline(0x20)=0 | password(0x10)=0 | readOnly(0x08)=0 | hasTextColor(0x04) | hasMaxLength(0x02) | hasFont(0x01)=0
  // -> 0x80 | 0x40 | 0x04 | 0x02 = 0xc6
  // flags2: border(0x08) = 0x08
  const bounds = encodeRect(0, 3200, 0, 640); // 160x32 px
  const editTextTag = makeTag(37, [
    ...u16le(20),
    ...bounds,
    0xc6, // hasText, wordWrap, hasTextColor, hasMaxLength (editable: readOnly=0)
    0x08, // border=1
    248, 250, 252, 255, // RGBA text color (comes before MaxLength in SWF spec)
    ...u16le(6),        // maxLength = 6
    ...cstr('answer'),  // variableName
    ...cstr('Hi'),      // initialText
  ]);

  const placeEdit = makeTag(26, [
    0x26, // hasName | hasMatrix | hasCharacter
    ...u16le(1),  // depth 1
    ...u16le(20), // charId 20
    ...encodeIdentityMatrix(200, 200),
    ...cstr('inputBox'),
  ]);

  // Frame 1 DoAction: Selection.setFocus(inputBox); stop();
  const f1Focus = [
    ...actionPush([{ t: 'str', v: 'inputBox' }]),
    0x1c, // GetVariable inputBox
    ...actionPush([{ t: 'int', v: 1 }, { t: 'str', v: 'Selection' }]),
    0x1c, // GetVariable Selection
    ...actionPush([{ t: 'str', v: 'setFocus' }]),
    0x52, 0x17,
    0x07, // stop
    0x00,
  ];

  const swf = buildSwf([
    editTextTag,
    placeEdit,
    makeTag(12, f1Focus),
    makeTag(1, []),
  ]);

  const parsed = await transpileSwfToAst(swf.buffer.slice(swf.byteOffset, swf.byteOffset + swf.byteLength), 'edittext_test.swf');
  assert.equal(parsed.success, true, `transpileSwfToAst failed: ${parsed.error}`);
  const vmB64 = extractSwfVmB64(parsed.astSource);
  const vmProg = JSON.parse(Buffer.from(vmB64, 'base64').toString('utf8'));

  assert.ok(vmProg.et && vmProg.et['20'], 'DefineEditText ID 20 must be in vmProgram.et');
  assert.equal(vmProg.et['20'].ed, 1, 'Editable flag (ed=1) must be preserved');
  assert.equal(vmProg.et['20'].bd, 1, 'Border flag (bd=1) must be preserved');
  assert.equal(vmProg.et['20'].mx, 6, 'maxLength (mx=6) must be preserved');
  assert.equal(vmProg.et['20'].v, 'answer', 'Variable binding must be preserved');

  const { ASTAVM1Runtime } = createAvm1Sandbox();
  const stage = new MockSvgNode('svg');
  const runtime = new ASTAVM1Runtime(vmB64, { engine: { vars: {} } });
  runtime.mount(stage, stage);

  const tf = runtime.rootClip._childrenByDepth.get(1)?.obj;
  assert.ok(tf && tf._isTextField && tf._editable, 'Mounted EditText must be an editable AVM1TextField');
  assert.equal(runtime._global.Selection.getFocus(), 'inputBox', 'Selection.setFocus(inputBox) must focus inputBox');
  assert.ok(tf.bgRect && tf.bgRect.tagName === 'rect', 'Editable field must render SVG hit/border <rect>');
  assert.ok(tf.caretEl && tf.caretEl.getAttribute('display') !== 'none', 'Focused editable field must display SVG <line> caret');

  // Attach onChanged listener
  const changeLog: string[] = [];
  runtime._setMember(tf, 'onChanged', () => changeLog.push(tf.text));

  // Type '!', 'A', 'B', 'C', 'D', 'E' -> clamped at maxChars = 6 ("Hi!ABC")
  for (const ch of ['!', 'A', 'B', 'C', 'D', 'E']) {
    runtime.handleForwardedKeyEvent('keydown', { key: ch, code: `Key${ch.toUpperCase()}`, keyCode: ch.charCodeAt(0) });
  }
  assert.equal(tf.text, 'Hi!ABC', 'maxChars=6 must clamp typed input to 6 characters');
  assert.equal(runtime.rootClip._vars.answer, 'Hi!ABC', 'Editable field must sync to parent variable "answer"');

  // Backspace removes last char -> "Hi!AB"
  runtime.handleForwardedKeyEvent('keydown', { key: 'Backspace', code: 'Backspace', keyCode: 8 });
  assert.equal(tf.text, 'Hi!AB', 'Backspace must delete last character');
  assert.equal(runtime.rootClip._vars.answer, 'Hi!AB');
  assert.deepEqual(changeLog, ['Hi!', 'Hi!A', 'Hi!AB', 'Hi!ABC', 'Hi!AB'], 'onChanged must fire on every real mutation');

  // Password masking must render bullets while preserving real text value
  runtime._setMember(tf, 'password', true);
  assert.equal(tf.textEl.textContent, '•••••', 'Password mode must mask SVG <text> with bullets');
  assert.equal(tf.text, 'Hi!AB', 'Password mode must preserve underlying tf.text value');

  // Escape blurs field and hides caret
  runtime.handleForwardedKeyEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27 });
  assert.equal(runtime._global.Selection.getFocus(), null, 'Escape must blur focused TextField');
  assert.equal(tf.caretEl.getAttribute('display'), 'none', 'Blurred TextField must hide SVG caret');

  runtime.destroy();
  console.log('✓ Test 3 passed: Interactive Editable DefineEditText (Focus, Caret, Typing, maxChars, Backspace, Var Sync, onChanged, Password Masking)');
}

// ============================================================================
// TEST 4: Decoupled Universal Media Input Route (player-gestures.ast -> site-gestures.js -> Independent Media Sink)
// ============================================================================

async function testDecoupledMediaInputRoute() {
  const gesturesSrc = fs.readFileSync(path.resolve('static/player/site-gestures.js'), 'utf8');
  const gesturesInputSrc = fs.readFileSync(path.resolve('static/player/site-gestures-input.js'), 'utf8');
  const gesturesProfileSrc = fs.readFileSync(path.resolve('static/player/site-gestures-profile.js'), 'utf8');
  const gesturesAstSrc = fs.readFileSync(path.resolve('static/player/player-gestures.ast'), 'utf8');
  const avm1Src = fs.readFileSync(path.resolve('static/player/ast-avm1-vm.js'), 'utf8');

  // 1. Static independence invariant: site-gestures.js and site-gestures-input.js must have ZERO hardcoded Flash/AVM1 references
  assert.equal(/avm1|swf/i.test(gesturesSrc), false, 'site-gestures.js must be 100% media-agnostic (no swf/avm1 coupling)');
  assert.equal(/_avm1Vm|ASTAVM1Runtime/i.test(gesturesInputSrc), false, 'site-gestures-input.js must have zero hardcoded _avm1Vm coupling');

  const windowListeners: Record<string, Function[]> = {};
  const mockDoc = {
    createElementNS: (_ns: string, tag: string) => new MockSvgNode(tag),
    createElement: (tag: string) => new MockSvgNode(tag),
    querySelector: () => null,
    getElementById: () => null,
  };
  const sandbox: any = {
    console, Math, Date, Number, String, Boolean, Array, Object, Map, Set, RegExp, JSON,
    Uint8Array, Float32Array, Int16Array, DataView, ArrayBuffer, TextDecoder, parseInt, parseFloat, isNaN, isFinite,
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    performance: { now: () => Date.now() },
    document: mockDoc,
    addEventListener(ev: string, fn: Function) {
      if (!windowListeners[ev]) windowListeners[ev] = [];
      windowListeners[ev].push(fn);
    },
    removeEventListener(ev: string, fn: Function) {
      if (windowListeners[ev]) windowListeners[ev] = windowListeners[ev].filter((f) => f !== fn);
    },
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;

  vm.runInNewContext(gesturesProfileSrc, sandbox);
  vm.runInNewContext(gesturesInputSrc, sandbox);
  vm.runInNewContext(gesturesSrc, sandbox);
  vm.runInNewContext(avm1Src, sandbox);

  const stageSvg = new MockSvgNode('svg');
  (stageSvg as any).hasAttribute = (k: string) => Object.prototype.hasOwnProperty.call(stageSvg.attrs, k);
  (stageSvg as any).getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 400 });
  (stageSvg as any).createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } });
  (stageSvg as any).getScreenCTM = () => ({ inverse: () => ({}) });
  (stageSvg as any).closest = () => null;
  (stageSvg as any).querySelector = () => null;

  const engine: any = { vars: {}, scene: { id: 'swf-route-test', gestures: [] }, progress: 0 };
  const gestures = new sandbox.ASTDirectGestureSubsystem(engine);
  gestures.stageSvg = stageSvg;
  gestures._parsePlayerGesturesAST(gesturesAstSrc);
  gestures.setupEventListeners();

  // Verify (:media-routes ...) parsed from player-gestures.ast
  const caps = gestures.getCapabilities();
  assert.ok(Array.isArray(caps.mediaRoutes) && caps.mediaRoutes.length >= 8, 'player-gestures.ast (:media-routes ...) must parse into capabilities');
  assert.equal(engine.gestures, gestures, 'engine.gestures must expose universal gesture bus');

  // Snapshot window listener count before mounting ASTAVM1Runtime
  const keydownCountBefore = (windowListeners.keydown || []).length;

  const progB64 = Buffer.from(
    JSON.stringify({ v: 1, swfVer: 8, fps: 30, w: 600, h: 400, bg: '#050816', fc: 1, l: [], sh: {}, et: {}, bt: {}, sp: {}, exp: {}, bc: [], fr: [[]], ac: [] })
  ).toString('base64');
  const runtime = new sandbox.ASTAVM1Runtime(progB64, { engine });
  runtime.mount(stageSvg, stageSvg);

  // Verify ZERO duplicate window listeners added by ASTAVM1Runtime
  assert.equal((windowListeners.keydown || []).length, keydownCountBefore, 'ASTAVM1Runtime must attach ZERO duplicate window keydown listeners when hosted on site-gestures.js');
  assert.equal(runtime._standaloneListenersBound, false, 'ASTAVM1Runtime must subscribe to gesture bus instead of standalone listeners');
  assert.equal(gestures.hasActiveMediaInputSink('key-down'), true, 'Universal gesture bus must report active media input sink');

  // 2. Route keydown, pointermove, pointerdown, wheel, and blur exclusively through site-gestures.js!
  let wheelTotal = 0;
  let mouseDownHits = 0;
  runtime._global.Mouse.addListener({
    onMouseDown() { mouseDownHits++; },
    onMouseWheel(d: number) { wheelTotal += d; },
  });

  let prevented = false;
  gestures.handleKeyDown({ code: 'ArrowRight', key: 'ArrowRight', keyCode: 39, target: stageSvg, preventDefault() { prevented = true; } });
  assert.equal(runtime._global.Key.isDown(39), true, 'ArrowRight must route through site-gestures.js to AVM1 sink');
  assert.equal(prevented, true, 'Capture keys from player-gestures.ast must call preventDefault()');

  gestures.handlePointerMove({ clientX: 150, clientY: 220, target: stageSvg });
  gestures.handlePointerDown({ clientX: 150, clientY: 220, target: stageSvg, preventDefault() {} });
  assert.equal(mouseDownHits, 1, 'PointerDown must route through site-gestures.js to AVM1 sink');

  gestures.handleWheel({ deltaY: -120 });
  assert.equal(wheelTotal, 3, 'Wheel must route through site-gestures.js to AVM1 sink');

  // 3. Whiteboard Pen Mode must gate pointer & wheel away from media sink
  gestures.isPenActive = true;
  gestures.handleWheel({ deltaY: -120 });
  assert.equal(wheelTotal, 3, 'Whiteboard pen mode must gate wheel away from media sink');
  gestures.isPenActive = false;

  // 4. Window blur must route release-all and clear held keys
  gestures.handleWindowBlur();
  assert.equal(runtime._global.Key.isDown(39), false, 'Blur must route release-all through site-gestures.js');

  // 5. External bridge dispatch (e.g., parent iframe -> ast-bridge-cartridge -> site-gestures)
  gestures.dispatchExternalMediaInput('key-down', { code: 'Space', key: ' ', keyCode: 32 });
  assert.equal(runtime._global.Key.isDown(32), true, 'dispatchExternalMediaInput must deliver parent-bridged keys to active sink');
  gestures.dispatchExternalMediaInput('release-all', {});
  assert.equal(runtime._global.Key.isDown(32), false);

  // 6. Destroy cleanly unregisters sink from universal bus
  runtime.destroy();
  assert.equal(gestures.hasActiveMediaInputSink(), false, 'destroy() must unregister media sink cleanly');
  console.log('✓ Test 4 passed: Decoupled Universal Media Input Route (player-gestures.ast -> site-gestures.js -> Independent Media Sink)');
}

// ============================================================================
// TEST 5: General-Purpose AVM1 Spec Compliance
//   - ActionWith timeline/target scoping (stop/gotoAndStop inside with(child) never freezes _root)
//   - Relative ".." / "../" / "../:var" / ":local" / "/child" target & variable paths
//   - Function base_clip (fn._defClip) vs `this` scoping on child.onEnterFrame
//   - AS2 ActionExtends + super() constructor + super.method()
//   - Flash Array.sort(flags), numeric attachMovie(lnk, 0, depth), unknown frame label no-op, SWF 5 undefined == 0
// ============================================================================

async function testAvm1CoreSpecCompliance() {
  const { ASTAVM1Runtime } = createAvm1Sandbox();

  const actionWith = (body: number[]): number[] => [0x94, 0x02, 0x00, ...u16le(body.length), ...body];
  const actionDefFn = (name: string, params: string[], body: number[]): number[] => {
    const hdr = [...cstr(name), ...u16le(params.length)];
    for (const p of params) hdr.push(...cstr(p));
    hdr.push(...u16le(body.length));
    return [0x9b, ...u16le(hdr.length), ...hdr, ...body];
  };
  const actionGotoFrame = (frame0: number): number[] => [0x81, 0x02, 0x00, ...u16le(frame0)];
  const actionSetTarget = (name: string): number[] => {
    const payload = cstr(name);
    return [0x8b, ...u16le(payload.length), ...payload];
  };

  // Sprite 10 (childClip): 2 frames; Frame 2 runs tellTarget("..") { play(); }, "../:fromChild" = 42, ":ownLocal" = 7
  const childF2Bytecode = [
    ...actionSetTarget('..'),
    0x06, // ActionPlay on _parent (_root)
    ...actionSetTarget(''),
    ...actionPush([{ t: 'str', v: '../:fromChild' }, { t: 'int', v: 42 }]),
    0x1d, // ActionSetVariable
    ...actionPush([{ t: 'str', v: ':ownLocal' }, { t: 'int', v: 7 }]),
    0x1d, // ActionSetVariable
    0x07, // ActionStop on childClip
    0x00,
  ];

  const onEfBody = [
    // rootCount = rootCount + 1
    ...actionPush([{ t: 'str', v: 'rootCount' }, { t: 'str', v: 'rootCount' }]),
    0x1c,
    ...actionPush([{ t: 'int', v: 1 }]),
    0x47,
    0x1d,
    // this._x = this._x + 5
    ...actionPush([{ t: 'str', v: 'this' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: '_x' }, { t: 'str', v: 'this' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: '_x' }]),
    0x4e,
    ...actionPush([{ t: 'int', v: 5 }]),
    0x47,
    0x4f,
    // if (rootCount == 3) gotoAndStop(2)
    ...actionPush([{ t: 'str', v: 'rootCount' }]),
    0x1c,
    ...actionPush([{ t: 'int', v: 3 }]),
    0x49,
    0x12,
    0x9d, 0x02, 0x00, ...u16le(5),
    ...actionGotoFrame(1), // 0-based 1 => Frame 2 on _root (fn._defClip)
    0x00,
  ];

  const rootF1Bytecode = [
    // with (childClip) { gotoAndStop(2); }
    ...actionPush([{ t: 'str', v: 'childClip' }]),
    0x1c,
    ...actionWith([
      ...actionGotoFrame(1), // 0-based 1 => frame 2 on childClip ONLY
    ]),
    // gotoAndStop("nonexistent_label") -> must be a no-op (must NOT pause _root)
    0x8c, ...u16le('nonexistent_label'.length + 1), ...cstr('nonexistent_label'),
    // rootCount = 0
    ...actionPush([{ t: 'str', v: 'rootCount' }, { t: 'int', v: 0 }]),
    0x1d,
    // childClip.onEnterFrame = function() { ... }
    ...actionPush([{ t: 'str', v: 'childClip' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: 'onEnterFrame' }]),
    ...actionDefFn('', [], onEfBody),
    0x4f,
    // sorted = [10, 2, 30, 5]; sorted.sort(18) (NUMERIC|DESCENDING)
    ...actionPush([{ t: 'str', v: 'sorted' }, { t: 'int', v: 5 }, { t: 'int', v: 30 }, { t: 'int', v: 2 }, { t: 'int', v: 10 }, { t: 'int', v: 4 }]),
    0x42,
    0x1d,
    ...actionPush([{ t: 'int', v: 18 }, { t: 'int', v: 1 }, { t: 'str', v: 'sorted' }]),
    0x1c,
    ...actionPush([{ t: 'str', v: 'sort' }]),
    0x52, 0x17,
    // idxArr = [30, 10, 20].sort(24) (NUMERIC|RETURNINDEXEDARRAY)
    ...actionPush([{ t: 'str', v: 'idxArr' }, { t: 'int', v: 24 }, { t: 'int', v: 1 }, { t: 'int', v: 20 }, { t: 'int', v: 10 }, { t: 'int', v: 30 }, { t: 'int', v: 3 }]),
    0x42,
    ...actionPush([{ t: 'str', v: 'sort' }]),
    0x52,
    0x1d,
    // attachMovie("dotSym", 0, 1)
    ...actionPush([{ t: 'int', v: 1 }, { t: 'int', v: 0 }, { t: 'str', v: 'dotSym' }, { t: 'int', v: 3 }, { t: 'str', v: 'attachMovie' }]),
    0x3d, 0x17,
    0x00,
  ];

  const prog1 = {
    v: 1, swfVer: 6, fps: 30, w: 400, h: 300, bg: '#000000', fc: 2,
    l: [{ frame: 2, name: 'gameplay' }],
    sh: {}, et: {}, bt: {},
    sp: {
      10: { fc: 2, l: [], fr: [[], []], ac: [{ f: 2, b64: Buffer.from(childF2Bytecode).toString('base64') }] },
      11: { fc: 1, l: [], fr: [[]], ac: [] },
    },
    exp: { dotSym: 11 },
    fr: [
      [{ d: 1, c: 10, n: 'childClip', m: [1, 0, 0, 1, 10, 20] }],
      [{ d: 1, c: 10, n: 'childClip', m: [1, 0, 0, 1, 10, 20] }],
    ],
    ac: [{ f: 1, b64: Buffer.from(rootF1Bytecode).toString('base64') }],
  };

  const stage1 = new MockSvgNode('svg');
  const rt1 = new ASTAVM1Runtime(Buffer.from(JSON.stringify(prog1)).toString('base64'), { engine: { vars: {} } });
  rt1.mount(stage1, stage1);

  const child1 = rt1.rootClip.getChildByName('childClip');
  assert.ok(child1, 'childClip must exist');
  assert.equal(child1._currentframe, 2, 'with(childClip) { gotoAndStop(2) } must move childClip to frame 2');
  assert.equal(rt1.rootClip._currentframe, 1, 'with(childClip) { gotoAndStop(2) } and unknown label must NOT jump _root');
  assert.equal(rt1.rootClip._playing, true, 'tellTarget("..") { play() } + unknown label no-op must leave _root playing');
  assert.equal(rt1.rootClip._vars.fromChild, 42, 'Relative "../:fromChild" from childClip must write to _root.fromChild');
  assert.equal(child1._vars.ownLocal, 7, 'Relative ":ownLocal" must write to childClip itself, not _root');
  assert.equal(rt1._resolveTargetPath('/childClip', rt1.rootClip), child1, 'Absolute slash path "/childClip" must resolve');
  assert.equal(rt1._resolveTargetPath('..', child1), rt1.rootClip, 'Relative ".." path must resolve to _parent');
  assert.deepEqual(rt1.rootClip._vars.sorted, [30, 10, 5, 2], 'Array.sort(NUMERIC | DESCENDING) must sort numerically descending');
  assert.deepEqual(rt1.rootClip._vars.idxArr, [1, 2, 0], 'Array.sort(NUMERIC | RETURNINDEXEDARRAY) must return sorted indices');
  const zeroClip = rt1.rootClip.getChildByName('0');
  assert.ok(zeroClip && zeroClip._name === '0', 'attachMovie("dotSym", 0, 1) must preserve numeric name "0"');

  rt1.rootClip.stop();
  rt1.stepOneSwfFrame();
  rt1.stepOneSwfFrame();
  assert.equal(rt1.rootClip._vars.rootCount, 2, 'Root-defined child.onEnterFrame must increment _root.rootCount');
  assert.equal(child1._x, 20, 'this._x inside child.onEnterFrame must still mutate childClip._x (10 + 5 + 5)');
  assert.equal(rt1.rootClip._currentframe, 1);
  rt1.stepOneSwfFrame();
  assert.equal(rt1.rootClip._vars.rootCount, 3);
  assert.equal(rt1.rootClip._currentframe, 2, 'Unqualified gotoAndStop(2) in root-defined child.onEnterFrame must jump _root to frame 2');
  assert.equal(rt1.getDebugReport().avm1Faults.runtimeErrors.length, 0, 'Zero AVM1 runtime errors expected');
  rt1.destroy();

  // 2) AS2 ActionExtends + super() constructor + super.greet() + SWF 5 undefined == 0 loose equality
  const baseCtorBody = [
    ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'baseVal' }, { t: 'str', v: 'v' }]), 0x1c,
    ...actionPush([{ t: 'int', v: 2 }]), 0x0c,
    0x4f,
    0x00,
  ];
  const baseGreetBody = [
    ...actionPush([{ t: 'str', v: 'hello:' }, { t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'baseVal' }]), 0x4e,
    0x47,
    0x3e,
    0x00,
  ];
  const subCtorBody = [
    ...actionPush([{ t: 'str', v: 'v' }]), 0x1c,
    ...actionPush([{ t: 'int', v: 1 }, { t: 'str', v: 'super' }]), 0x1c,
    ...actionPush([{ t: 'str', v: '' }]),
    0x52, 0x17,
    ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'subVal' }, { t: 'int', v: 0 }, { t: 'str', v: 'super' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'greet' }]),
    0x52,
    0x4f,
    0x00,
  ];
  const as2TestBytecode = [
    ...actionDefFn('Base', ['v'], baseCtorBody),
    ...actionPush([{ t: 'str', v: 'Base' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'prototype' }]), 0x4e,
    ...actionPush([{ t: 'str', v: 'greet' }]),
    ...actionDefFn('', [], baseGreetBody),
    0x4f,
    ...actionDefFn('Sub', ['v'], subCtorBody),
    ...actionPush([{ t: 'str', v: 'Sub' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'Base' }]), 0x1c,
    0x69,
    ...actionPush([{ t: 'str', v: 'inst' }, { t: 'int', v: 21 }, { t: 'int', v: 1 }, { t: 'str', v: 'Sub' }]),
    0x40,
    0x1d,
    ...actionPush([{ t: 'str', v: 'eqZero' }, { t: 'str', v: 'undefVar' }]), 0x1c,
    ...actionPush([{ t: 'int', v: 0 }]),
    0x49,
    0x1d,
    0x00,
  ];
  const prog2 = {
    v: 1, swfVer: 5, fps: 30, w: 320, h: 240, bg: '#000000', fc: 1,
    l: [], sh: {}, et: {}, bt: {}, sp: {}, exp: {},
    fr: [[]],
    ac: [{ f: 1, b64: Buffer.from(as2TestBytecode).toString('base64') }],
  };
  const stage2 = new MockSvgNode('svg');
  const rt2 = new ASTAVM1Runtime(Buffer.from(JSON.stringify(prog2)).toString('base64'), { engine: { vars: {} } });
  rt2.mount(stage2, stage2);
  assert.equal(rt2.rootClip._vars.inst.baseVal, 42, 'AS2 super(21) must invoke Base constructor with `this = inst`');
  assert.equal(rt2.rootClip._vars.inst.subVal, 'hello:42', 'AS2 super.greet() must invoke Base.prototype.greet with `this = inst`');
  assert.equal(rt2.rootClip._vars.eqZero, true, 'SWF <= 5 ActionEquals2 must treat undefined == 0 as true');
  assert.equal(rt2.getDebugReport().avm1Faults.runtimeErrors.length, 0);
  rt2.destroy();

  console.log('✓ Test 5 passed: General-Purpose AVM1 Spec Compliance (ActionWith, relative ../ paths, base_clip scoping, AS2 super, Array.sort flags, SWF 5 equality)');
}

// ============================================================================
// TEST 6: Extended AVM1 Compliance (addProperty, ActionCastOp on MC, ActionCallFunction super,
//         ActionTry catch/return, with-closure capture, createTextField, getInstanceAtDepth, runtimeSnapshot)
// ============================================================================

async function testAvm1ExtendedCompliance() {
  const { ASTAVM1Runtime } = createAvm1Sandbox();
  const actionDefFn = (name: string, params: string[], body: number[]): number[] => {
    const header = [
      ...cstr(name),
      ...u16le(params.length),
      ...params.flatMap((p) => cstr(p)),
      ...u16le(body.length),
    ];
    return [0x9b, ...u16le(header.length), ...header, ...body];
  };

  // Build ActionTry helper (flags: 0x01=catch, 0x02=finally, 0x04=catchInReg)
  const actionTry = (flags: number, catchTarget: string | number, tryBody: number[], catchBody: number[], finBody: number[]): number[] => {
    const hdr = [
      flags,
      ...u16le(tryBody.length),
      ...u16le(catchBody.length),
      ...u16le(finBody.length),
      ...(typeof catchTarget === 'number' ? [catchTarget] : cstr(catchTarget)),
    ];
    return [0x8f, ...u16le(hdr.length), ...hdr, ...tryBody, ...catchBody, ...finBody];
  };

  // 1) addProperty getter/setter on registered MovieClip subclass + ActionCastOp(Actor, mc) + createTextField + getInstanceAtDepth
  const actorCtorBody = [
    ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: '_hp' }, { t: 'int', v: 10 }]),
    0x4f,
    0x00,
  ];
  const getHpBody = [
    ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: '_hp' }]), 0x4e,
    ...actionPush([{ t: 'int', v: 10 }]), 0x0c,
    0x3e,
    0x00,
  ];
  const setHpBody = [
    ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: '_hp' }, { t: 'str', v: 'v' }]), 0x1c,
    ...actionPush([{ t: 'int', v: 1 }]), 0x0a,
    0x4f,
    0x00,
  ];

  // ActionCallFunction("super", [7]) inside ChildCtor extending ParentCtor
  const parentCtorBody = [
    ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'pVal' }, { t: 'str', v: 'n' }]), 0x1c,
    ...actionPush([{ t: 'int', v: 3 }]), 0x0c,
    0x4f,
    0x00,
  ];
  const childCtorBody = [
    ...actionPush([{ t: 'str', v: 'n' }]), 0x1c,
    ...actionPush([{ t: 'int', v: 1 }, { t: 'str', v: 'super' }]),
    0x3d, 0x17, // ActionCallFunction("super", [n])
    0x00,
  ];

  // ActionTry inside function: throw "boom", catch(err) { caughtMsg = err; return "caught:" + err; } finally { finRan = true; }
  const tryBody = [
    ...actionPush([{ t: 'str', v: 'boom' }]),
    0x2a, // ActionThrow
  ];
  const catchBody = [
    ...actionPush([{ t: 'str', v: 'caughtMsg' }, { t: 'str', v: 'err' }]), 0x1c,
    0x1d,
    ...actionPush([{ t: 'str', v: 'caught:' }, { t: 'str', v: 'err' }]), 0x1c,
    0x47,
    0x3e, // ActionReturn
  ];
  const finBody = [
    ...actionPush([{ t: 'str', v: 'finRan' }, { t: 'int', v: 1 }]),
    0x1d,
  ];
  const testTryFnBody = [
    ...actionTry(0x03, 'err', tryBody, catchBody, finBody),
    ...actionPush([{ t: 'str', v: 'unreachable' }]),
    0x3e,
  ];

  // with (actorMc) { function readTag() { return secretTag; } }
  const readTagFnBody = [
    ...actionPush([{ t: 'str', v: 'secretTag' }]), 0x1c,
    0x3e,
  ];
  const withClosureBlock = [
    ...actionDefFn('readTag', [], readTagFnBody),
  ];

  const mainBytecode = [
    // Define Actor extends MovieClip + addProperty("hp", getHp, setHp) + Object.registerClass("actorSym", Actor)
    ...actionDefFn('Actor', [], actorCtorBody),
    ...actionPush([{ t: 'str', v: 'Actor' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'MovieClip' }]), 0x1c,
    0x69, // ActionExtends
    ...actionDefFn('OtherClass', [], [0x00]),
    ...actionDefFn('', ['v'], setHpBody),
    ...actionDefFn('', [], getHpBody),
    ...actionPush([{ t: 'str', v: 'hp' }, { t: 'int', v: 3 }, { t: 'str', v: 'Actor' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'prototype' }]), 0x4e,
    ...actionPush([{ t: 'str', v: 'addProperty' }]),
    0x52, 0x17,
    ...actionPush([{ t: 'str', v: 'Actor' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'actorSym' }, { t: 'int', v: 2 }, { t: 'str', v: 'Object' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'registerClass' }]),
    0x52, 0x17,

    // actorMc = attachMovie("actorSym", "a1", 5)
    ...actionPush([{ t: 'str', v: 'actorMc' }, { t: 'int', v: 5 }, { t: 'str', v: 'a1' }, { t: 'str', v: 'actorSym' }, { t: 'int', v: 3 }, { t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'attachMovie' }]),
    0x52,
    0x1d,

    // hpBefore = actorMc.hp; actorMc.hp = 4; hpAfter = actorMc.hp
    ...actionPush([{ t: 'str', v: 'hpBefore' }, { t: 'str', v: 'actorMc' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'hp' }]), 0x4e,
    0x1d,
    ...actionPush([{ t: 'str', v: 'actorMc' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'hp' }, { t: 'int', v: 4 }]),
    0x4f,
    ...actionPush([{ t: 'str', v: 'hpAfter' }, { t: 'str', v: 'actorMc' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'hp' }]), 0x4e,
    0x1d,

    // castOk = Actor(actorMc); castFail = OtherClass(actorMc)
    ...actionPush([{ t: 'str', v: 'castOk' }, { t: 'str', v: 'actorMc' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'Actor' }]), 0x1c,
    0x2b, // ActionCastOp
    0x1d,
    ...actionPush([{ t: 'str', v: 'castFail' }, { t: 'str', v: 'actorMc' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'OtherClass' }]), 0x1c,
    0x2b, // ActionCastOp
    0x1d,

    // atDepth = getInstanceAtDepth(5); ver = getSWFVersion()
    ...actionPush([{ t: 'str', v: 'atDepth' }, { t: 'int', v: 5 }, { t: 'int', v: 1 }, { t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'getInstanceAtDepth' }]),
    0x52, 0x1d,
    ...actionPush([{ t: 'str', v: 'ver' }, { t: 'int', v: 0 }, { t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'getSWFVersion' }]),
    0x52, 0x1d,

    // hud = createTextField("hudTxt", 9, 10, 20, 120, 24); hud.text = "READY"
    ...actionPush([{ t: 'str', v: 'hud' }, { t: 'int', v: 24 }, { t: 'int', v: 120 }, { t: 'int', v: 20 }, { t: 'int', v: 10 }, { t: 'int', v: 9 }, { t: 'str', v: 'hudTxt' }, { t: 'int', v: 6 }, { t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'createTextField' }]),
    0x52, 0x1d,
    ...actionPush([{ t: 'str', v: 'hud' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'text' }, { t: 'str', v: 'READY' }]),
    0x4f,

    // ParentCtor / ChildCtor using ActionCallFunction("super", [7])
    ...actionDefFn('ParentCtor', ['n'], parentCtorBody),
    ...actionDefFn('ChildCtor', ['n'], childCtorBody),
    ...actionPush([{ t: 'str', v: 'ChildCtor' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'ParentCtor' }]), 0x1c,
    0x69,
    ...actionPush([{ t: 'str', v: 'childObj' }, { t: 'int', v: 7 }, { t: 'int', v: 1 }, { t: 'str', v: 'ChildCtor' }]),
    0x40, 0x1d,

    // ActionTry catch + finally + return propagation
    ...actionDefFn('runTry', [], testTryFnBody),
    ...actionPush([{ t: 'str', v: 'tryResult' }, { t: 'int', v: 0 }, { t: 'str', v: 'runTry' }]),
    0x3d, 0x1d,

    // actorMc.secretTag = 'ghost_ok'; with (actorMc) { function readTag() { return secretTag; } }; tagOut = readTag();
    ...actionPush([{ t: 'str', v: 'actorMc' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'secretTag' }, { t: 'str', v: 'ghost_ok' }]),
    0x4f,
    ...actionPush([{ t: 'str', v: 'actorMc' }]), 0x1c,
    0x94, 0x02, 0x00, ...u16le(withClosureBlock.length), ...withClosureBlock,
    ...actionPush([{ t: 'str', v: 'tagOut' }, { t: 'int', v: 0 }, { t: 'str', v: 'readTag' }]),
    0x3d, 0x1d,
    0x00,
  ];

  const prog = {
    v: 1, swfVer: 8, fps: 30, w: 320, h: 240, bg: '#000000', fc: 1,
    l: [], sh: {}, et: {}, bt: {},
    sp: { 20: { fc: 1, l: [], fr: [[]], ac: [] } },
    exp: { actorSym: 20 },
    fr: [[]],
    ac: [{ f: 1, b64: Buffer.from(mainBytecode).toString('base64') }],
  };

  const stage = new MockSvgNode('svg');
  const rt = new ASTAVM1Runtime(Buffer.from(JSON.stringify(prog)).toString('base64'), { engine: { vars: {} } });
  rt.mount(stage, stage);

  assert.equal(rt.rootClip._vars.hpBefore, 100, 'addProperty getter must read MovieClip _hp * 10 = 100');
  assert.equal(rt.rootClip._vars.hpAfter, 50, 'addProperty setter must set _hp = 4 + 1 = 5 -> getter returns 50');
  assert.equal(rt.rootClip._vars.castOk, rt.rootClip._vars.actorMc, 'ActionCastOp Actor(actorMc) must return actorMc');
  assert.equal(rt.rootClip._vars.castFail, null, 'ActionCastOp OtherClass(actorMc) must return null');
  assert.equal(rt.rootClip._vars.atDepth, rt.rootClip._vars.actorMc, 'getInstanceAtDepth(5) must return actorMc');
  assert.equal(rt.rootClip._vars.ver, 8, 'getSWFVersion() must return SWF version 8');
  assert.equal(rt.rootClip._vars.hud.text, 'READY', 'createTextField must create live SVG TextField');
  assert.equal(rt.rootClip.getChildByName('hudTxt'), rt.rootClip._vars.hud, 'createTextField instance must be addressable by name');
  assert.equal(rt.rootClip._vars.childObj.pVal, 21, 'ActionCallFunction("super", [7]) must invoke ParentCtor(7)');
  assert.equal(rt.rootClip._vars.caughtMsg, 'boom', 'ActionTry must bind caught exception variable');
  assert.equal(rt.rootClip._vars.finRan, 1, 'ActionTry finally block must execute even on return from catch');
  assert.equal(rt.rootClip._vars.tryResult, 'caught:boom', 'ActionReturn inside ActionTry catch must return from enclosing function');
  assert.equal(rt.rootClip._vars.tagOut, 'ghost_ok', 'Closure defined inside ActionWith must capture with-object scope');

  const rep = rt.getDebugReport();
  assert.ok(rep.runtimeSnapshot, 'getDebugReport must expose runtimeSnapshot');
  assert.equal(rep.runtimeSnapshot.swfVer, 8);
  assert.equal(rep.runtimeSnapshot.rootFrame, 1);
  assert.equal(rep.runtimeSnapshot.rootVars.hpAfter, 50);
  assert.ok(rep.runtimeSnapshot.childClips.some((c: any) => c.name === 'a1'), 'runtimeSnapshot.childClips must list active MovieClips');
  assert.equal(rep.avm1Faults.runtimeErrors.length, 0);
  rt.destroy();

  console.log('✓ Test 6 passed: Extended AVM1 Compliance (addProperty, ActionCastOp MC, ActionCallFunction super, ActionTry catch/return, with-closure, createTextField, getInstanceAtDepth, runtimeSnapshot)');
}

// ============================================================================
// TEST 7: Frame Lifecycle Order, attachMovie initObj Order, Sound.position Completion,
//         Offline LoadVars/XML Callbacks & AVM2 Document Class Stage Constructor Access
// ============================================================================

async function testAvm1AndAvm2LifecycleCompliance() {
  const { ASTAVM1Runtime } = createAvm1Sandbox();

  const actionDefFn = (name: string, params: string[], body: number[]): number[] => {
    const header = [
      ...cstr(name),
      ...u16le(params.length),
      ...params.flatMap((p) => cstr(p)),
      ...u16le(body.length),
    ];
    return [0x9b, ...u16le(header.length), ...header, ...body];
  };

  // 1) Parent-before-child frame script execution order:
  //    Root Frame 1: gotoAndStop(2)
  //    Root Frame 2: mazeReady = 42; stop();
  //    Child placed on Root Frame 2:
  //      - onClipEvent(load): _root.seenInLoad = _root.mazeReady;
  //      - Child Frame 1 DoAction: _root.seenInChildF1 = _root.mazeReady;
  const childLoadBytecode = [
    ...actionPush([{ t: 'str', v: '_root' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'seenInLoad' }, { t: 'str', v: '_root' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'mazeReady' }]), 0x4e,
    0x4f,
    0x00,
  ];
  const childF1Bytecode = [
    ...actionPush([{ t: 'str', v: '_root' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'seenInChildF1' }, { t: 'str', v: '_root' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'mazeReady' }]), 0x4e,
    0x4f,
    0x00,
  ];
  const rootF1GotoF2 = [
    0x81, 0x02, 0x00, ...u16le(1), // ActionGotoFrame 1 (0-based => Frame 2, stopped)
    0x00,
  ];
  const rootF2Init = [
    // mazeReady = 42
    ...actionPush([{ t: 'str', v: 'mazeReady' }, { t: 'int', v: 42 }]),
    0x1d,
    // Register class ProtoActor with addProperty("startVal", getter, setter) BEFORE attachMovie(..., { startVal: 7 })
    ...actionDefFn('ProtoActor', [], [
      ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
      ...actionPush([{ t: 'str', v: 'ctorSawScaled' }, { t: 'str', v: 'this' }]), 0x1c,
      ...actionPush([{ t: 'str', v: '_scaled' }]), 0x4e,
      0x4f,
      0x00,
    ]),
    ...actionPush([{ t: 'str', v: 'ProtoActor' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'MovieClip' }]), 0x1c,
    0x69,
    // setter(v) { this._scaled = v * 10; }
    ...actionDefFn('', ['v'], [
      ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
      ...actionPush([{ t: 'str', v: '_scaled' }, { t: 'str', v: 'v' }]), 0x1c,
      ...actionPush([{ t: 'int', v: 10 }]), 0x0c,
      0x4f,
      0x00,
    ]),
    // getter() { return this._scaled; }
    ...actionDefFn('', [], [
      ...actionPush([{ t: 'str', v: 'this' }]), 0x1c,
      ...actionPush([{ t: 'str', v: '_scaled' }]), 0x4e,
      0x3e,
      0x00,
    ]),
    ...actionPush([{ t: 'str', v: 'startVal' }, { t: 'int', v: 3 }, { t: 'str', v: 'ProtoActor' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'prototype' }]), 0x4e,
    ...actionPush([{ t: 'str', v: 'addProperty' }]),
    0x52, 0x17,
    ...actionPush([{ t: 'str', v: 'ProtoActor' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'protoSym' }, { t: 'int', v: 2 }, { t: 'str', v: 'Object' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'registerClass' }]),
    0x52, 0x17,
    // initObj = { startVal: 7 }; spawned = attachMovie("protoSym", "sp1", 10, initObj)
    ...actionPush([{ t: 'str', v: 'spawned' }, { t: 'str', v: 'startVal' }, { t: 'int', v: 7 }, { t: 'int', v: 1 }]),
    0x43, // ActionInitObject { startVal: 7 }
    ...actionPush([{ t: 'int', v: 10 }, { t: 'str', v: 'sp1' }, { t: 'str', v: 'protoSym' }, { t: 'int', v: 4 }, { t: 'str', v: 'this' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'attachMovie' }]),
    0x52,
    0x1d,
    // Offline XML parsing & offline LoadVars.load() + XML.load()
    ...actionPush([{ t: 'str', v: 'parsedXml' }, { t: 'str', v: "<a k='1'><b/></a>" }, { t: 'int', v: 1 }, { t: 'str', v: 'XML' }]),
    0x40, 0x1d,
    ...actionPush([{ t: 'str', v: 'lv' }, { t: 'int', v: 0 }, { t: 'str', v: 'LoadVars' }]),
    0x40, 0x1d,
    ...actionPush([{ t: 'str', v: 'lv' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'onLoad' }]),
    ...actionDefFn('', ['ok'], [
      ...actionPush([{ t: 'str', v: '_root' }]), 0x1c,
      ...actionPush([{ t: 'str', v: 'lvOk' }, { t: 'str', v: 'ok' }]), 0x1c,
      0x4f,
      0x00,
    ]),
    0x4f,
    ...actionPush([{ t: 'str', v: 'http://example.invalid/scores.txt' }, { t: 'int', v: 1 }, { t: 'str', v: 'lv' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'load' }]),
    0x52, 0x17,
    ...actionPush([{ t: 'str', v: 'xnet' }, { t: 'int', v: 0 }, { t: 'str', v: 'XML' }]),
    0x40, 0x1d,
    ...actionPush([{ t: 'str', v: 'xnet' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'onLoad' }]),
    ...actionDefFn('', ['ok'], [
      ...actionPush([{ t: 'str', v: '_root' }]), 0x1c,
      ...actionPush([{ t: 'str', v: 'xmlOk' }, { t: 'str', v: 'ok' }]), 0x1c,
      0x4f,
      0x00,
    ]),
    0x4f,
    ...actionPush([{ t: 'str', v: 'http://example.invalid/cfg.xml' }, { t: 'int', v: 1 }, { t: 'str', v: 'xnet' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'load' }]),
    0x52, 0x17,
    // FlashSound completion position check:
    ...actionPush([{ t: 'str', v: 'snd' }, { t: 'int', v: 0 }, { t: 'str', v: 'Sound' }]),
    0x40, 0x1d,
    ...actionPush([{ t: 'str', v: 'jingle' }, { t: 'int', v: 1 }, { t: 'str', v: 'snd' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'attachSound' }]),
    0x52, 0x17,
    ...actionPush([{ t: 'str', v: 'snd' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'onSoundComplete' }]),
    ...actionDefFn('', [], [
      ...actionPush([{ t: 'str', v: '_root' }]), 0x1c,
      ...actionPush([{ t: 'str', v: 'sndDone' }, { t: 'int', v: 1 }]),
      0x4f,
      0x00,
    ]),
    0x4f,
    ...actionPush([{ t: 'int', v: 1 }, { t: 'int', v: 0 }, { t: 'int', v: 2 }, { t: 'str', v: 'snd' }]), 0x1c,
    ...actionPush([{ t: 'str', v: 'start' }]),
    0x52, 0x17,
    0x07, // stop
    0x00,
  ];

  // Minimal 100ms silent PCM sound (fmt=3, 5512Hz rateCode=0, 16-bit=1, mono=0 => 551 samples ~= 100ms)
  const prog = {
    v: 1, swfVer: 8, fps: 30, w: 400, h: 300, bg: '#000000', fc: 2,
    l: [], sh: {}, et: {}, bt: {},
    sp: {
      30: { fc: 1, l: [], fr: [[]], ac: [{ f: 1, b64: Buffer.from(childF1Bytecode).toString('base64') }] },
      31: { fc: 1, l: [], fr: [[]], ac: [] },
    },
    exp: { protoSym: 31, jingle: 99 },
    sn: {
      99: { fmt: 3, rate: 5512, s16: 1, st: 0, sc: 551, b64: Buffer.alloc(551 * 2).toString('base64') },
    },
    fr: [
      [],
      [{ d: 1, c: 30, n: 'actorChild', ca: [{ f: 0x01, b64: Buffer.from(childLoadBytecode).toString('base64') }] }],
    ],
    ac: [
      { f: 1, b64: Buffer.from(rootF1GotoF2).toString('base64') },
      { f: 2, b64: Buffer.from(rootF2Init).toString('base64') },
    ],
  };

  const stage = new MockSvgNode('svg');
  const rt = new ASTAVM1Runtime(Buffer.from(JSON.stringify(prog)).toString('base64'), { engine: { vars: {} } });
  rt.mount(stage, stage);

  // Parent-before-child frame script execution order assertions
  assert.equal(rt.rootClip._vars.seenInLoad, 42, 'Child onClipEvent(load) on Frame 2 must see parent Frame 2 DoAction variable (mazeReady=42)');
  assert.equal(rt.rootClip._vars.seenInChildF1, 42, 'Child Frame 1 DoAction on Frame 2 must see parent Frame 2 DoAction variable (mazeReady=42)');

  // Prototype-before-initObj in attachMovie assertions
  const spawned = rt.rootClip._vars.spawned;
  assert.ok(spawned, 'attachMovie must return spawned MovieClip');
  assert.equal(spawned._vars._scaled, 70, 'attachMovie must attach registered class prototype BEFORE initObj so addProperty setter runs (7*10=70)');
  assert.equal(spawned._vars.ctorSawScaled, 70, 'Registered class constructor must see properties initialized by initObj setter');

  // Offline XML parsing assertions
  const parsedXml = rt.rootClip._vars.parsedXml;
  assert.ok(parsedXml && parsedXml.firstChild, 'new XML(...) must parse root element');
  assert.equal(parsedXml.firstChild.nodeName, 'a', 'XML.firstChild.nodeName must equal "a"');
  assert.equal(parsedXml.firstChild.attributes.k, '1', 'XML.firstChild.attributes.k must equal "1"');
  assert.equal(parsedXml.firstChild.firstChild.nodeName, 'b', 'Nested self-closing <b/> must parse');

  // Advance VM time 200ms so offline LoadVars.load(), XML.load(), and FlashSound fallback completion timers fire
  for (let i = 0; i < 6; i++) rt.step(0.04);

  assert.equal(rt.rootClip._vars.lvOk, false, 'Offline LoadVars.load() must invoke onLoad(false) via VM timer instead of hanging');
  assert.equal(rt.rootClip._vars.xmlOk, false, 'Offline XML.load() must invoke onLoad(false) via VM timer instead of hanging');

  const snd = rt.rootClip._vars.snd;
  assert.equal(rt.rootClip._vars.sndDone, 1, 'FlashSound onSoundComplete must fire cleanly even without Web Audio');
  assert.ok(snd.duration >= 95 && snd.duration <= 105, `FlashSound.duration should be ~100ms, got ${snd.duration}`);
  assert.equal(snd.position, snd.duration, 'FlashSound.position must equal duration after natural completion');
  snd.stop();
  assert.equal(snd.position, 0, 'FlashSound.position must reset to 0 after stop()');

  const rep = rt.getDebugReport();
  assert.equal(rep.runtime, 'avm1');
  assert.equal(rep.avm1Faults.runtimeErrors.length, 0);
  rt.destroy();

  // 2) AVM2 Document Class stage availability during constructor + getDebugReport()
  const avm2Code = fs.readFileSync(path.resolve('static/player/ast-avm2-vm.js'), 'utf8');
  const mockDoc2 = {
    createElementNS: (_ns: string, tag: string) => new MockSvgNode(tag),
    createElement: (tag: string) => new MockSvgNode(tag),
  };
  const avm2Sandbox: any = {
    console, Math, Date, Number, String, Boolean, Array, Object, Map, Set, RegExp, JSON,
    Uint8Array, Float32Array, Int16Array, DataView, ArrayBuffer, TextDecoder, parseInt, parseFloat, isNaN, isFinite,
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    performance: { now: () => Date.now() },
    document: mockDoc2,
  };
  avm2Sandbox.globalThis = avm2Sandbox;
  avm2Sandbox.window = avm2Sandbox;
  vm.runInNewContext(avm2Code, avm2Sandbox);

  const avm2Prog = {
    v: 2, swfVer: 10, fps: 30, w: 500, h: 400, bg: '#000000', fc: 1,
    dc: 'MainDoc', l: [], sh: {}, et: {}, bt: {}, sp: {}, sc: {}, abc: [], fr: [[]],
  };
  const avm2Stage = new MockSvgNode('svg');
  const avm2Rt = new avm2Sandbox.ASTAVM2Runtime(Buffer.from(JSON.stringify(avm2Prog)).toString('base64'), { engine: { vars: {} } });

  let stageSeenInCtor: any = null;
  let keyListenerWorked = false;
  // Register synthetic ABC-backed Document Class extending flash.display.MovieClip whose iinit reads this.stage
  const mcClass = avm2Rt._classes.get('flash.display.MovieClip');
  const docClassDesc: any = {
    qname: 'MainDoc',
    simpleName: 'MainDoc',
    superClass: mcClass,
    abc: { cpool: {}, methods: [{ body: {} }] },
    instInfo: { iinit: 0 },
    instanceTraits: new Map(),
    staticTraits: new Map(),
    staticObj: {},
    scopeChain: [],
    symbolCharId: 0,
  };
  avm2Rt._classes.set('MainDoc', docClassDesc);
  const origExecMethod = avm2Rt._execMethod.bind(avm2Rt);
  avm2Rt._execMethod = (abc: any, methodIdx: number, thisObj: any, args: any[], scopeChain: any[]) => {
    if (abc === docClassDesc.abc && methodIdx === 0) {
      stageSeenInCtor = thisObj.stage;
      if (thisObj.stage && typeof thisObj.stage.addEventListener === 'function') {
        thisObj.stage.addEventListener('keyDown', () => { keyListenerWorked = true; });
      }
      return undefined;
    }
    return origExecMethod(abc, methodIdx, thisObj, args, scopeChain);
  };

  avm2Rt.mount(avm2Stage, avm2Stage);
  assert.ok(stageSeenInCtor && stageSeenInCtor === avm2Rt.stage, 'AVM2 Document Class constructor must have non-null this.stage before iinit runs');
  avm2Rt.handleForwardedKeyEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 });
  assert.equal(keyListenerWorked, true, 'stage.addEventListener(KEY_DOWN) attached in AVM2 Document Class constructor must receive key events');

  const avm2Rep = avm2Sandbox.__getSwfDebugReport();
  assert.ok(avm2Rep && avm2Rep.runtime === 'avm2', '__getSwfDebugReport() must return live AVM2 debug snapshot');
  assert.equal(avm2Rep.runtimeSnapshot.documentClass, 'MainDoc');
  avm2Rt.destroy();

  console.log('✓ Test 7 passed: Frame Lifecycle Order, attachMovie initObj Order, Sound.position Completion, Offline LoadVars/XML & AVM2 Document Class Stage Constructor Access');
}

// ============================================================================
// Test 8: General-Purpose AVM1 Frame-1 Preloader Self-Completion & Stalled Fallback
// ============================================================================
async function testAvm1PreloaderSelfCompletion() {
  const { ASTAVM1Runtime } = createAvm1Sandbox();
  const actionDefineFunction = (name: string, params: string[], body: number[]): number[] => {
    const header: number[] = [];
    for (let i = 0; i < name.length; i++) header.push(name.charCodeAt(i));
    header.push(0);
    header.push(params.length & 0xFF, (params.length >> 8) & 0xFF);
    for (const p of params) {
      for (let i = 0; i < p.length; i++) header.push(p.charCodeAt(i));
      header.push(0);
    }
    header.push(body.length & 0xFF, (body.length >> 8) & 0xFF);
    return [0x9B, header.length & 0xFF, (header.length >> 8) & 0xFF, ...header, ...body];
  };

  // Case A: Standard Flash 6/7/8 Frame-1 onEnterFrame preloader:
  //   stop();
  //   this.onEnterFrame = function() {
  //     if (this.getBytesLoaded() == this.getBytesTotal()) {
  //       delete this.onEnterFrame;
  //       nextFrame();
  //     }
  //   };
  // Frame 2: Title screen (NO stop() of its own — relies on preloader's nextFrame() to stay stopped!)
  //          with a button calling play().
  // Frame 3: Transition frame (no stop).
  // Frame 4: Setup frame (no stop) -> flows into Frame 5 which sets ready = 1 and stops.
  const preloaderBody: number[] = [
    // this.getBytesLoaded() == this.getBytesTotal()
    ...actionPush([{ t: 'int', v: 0 }, { t: 'str', v: 'this' }]),
    0x1C, // GetVariable ('this')
    ...actionPush([{ t: 'str', v: 'getBytesLoaded' }]),
    0x52, // CallMethod
    ...actionPush([{ t: 'int', v: 0 }, { t: 'str', v: 'this' }]),
    0x1C,
    ...actionPush([{ t: 'str', v: 'getBytesTotal' }]),
    0x52,
    0x49, // Equals2
    0x12, // Not
    // ActionIf skip if not equal (delete + nextFrame = 15 bytes: push 'this'(7) + getVar(1) + push 'onEnterFrame'(15) + delete(1) + pop(1) + nextFrame(1))
  ];
  const deleteAndNextFrame: number[] = [
    ...actionPush([{ t: 'str', v: 'this' }]),
    0x1C,
    ...actionPush([{ t: 'str', v: 'onEnterFrame' }]),
    0x3A, // ActionDelete
    0x17, // Pop
    0x04, // ActionNextFrame
  ];
  const f1PreloaderBytes: number[] = [
    0x07, // stop()
    ...actionPush([{ t: 'str', v: 'this' }]),
    0x1C,
    ...actionPush([{ t: 'str', v: 'onEnterFrame' }]),
    ...actionDefineFunction('', [], [
      ...preloaderBody,
      0x9D, 0x02, 0x00, deleteAndNextFrame.length & 0xFF, (deleteAndNextFrame.length >> 8) & 0xFF,
      ...deleteAndNextFrame,
    ]),
    0x4F, // SetMember
    0x00,
  ];

  const playBtnAct: number[] = [0x06, 0x00]; // play()
  const f4SetupBytes: number[] = [
    ...actionPush([{ t: 'str', v: 'setupRan' }, { t: 'int', v: 1 }]),
    0x1D, // SetVariable
    0x00,
  ];
  const f5ReadyBytes: number[] = [
    ...actionPush([{ t: 'str', v: 'gameStarted' }, { t: 'int', v: 1 }]),
    0x1D,
    0x07, // stop()
    0x00,
  ];

  const progA = {
    v: 1, swfVer: 6, fps: 21, w: 360, h: 420, bg: '#000000', fc: 5,
    ef: 2, ps: 1,
    l: [],
    sh: { 1: { p: [['M 0 0 L 100 0 L 100 30 L 0 30 Z', '#ffff00', 'none', 0]], bb: [0, 0, 100, 30] } },
    et: {},
    bt: {
      30: {
        r: [{ s: 0x0F, c: 1, d: 1, m: [1, 0, 0, 1, 0, 0] }],
        a: [{ f: 0x08, k: 0, b64: Buffer.from(playBtnAct).toString('base64') }],
      },
    },
    sp: {},
    fr: [
      [],
      [{ d: 1, c: 30, m: [1, 0, 0, 1, 130, 260] }],
      [],
      [],
      [],
    ],
    ac: [
      { f: 1, b64: Buffer.from(f1PreloaderBytes).toString('base64') },
      { f: 4, b64: Buffer.from(f4SetupBytes).toString('base64') },
      { f: 5, b64: Buffer.from(f5ReadyBytes).toString('base64') },
    ],
  };

  const stageA = new MockSvgNode('svg');
  const rtA = new ASTAVM1Runtime(Buffer.from(JSON.stringify(progA)).toString('base64'), { engine: { vars: {} } });
  rtA.mount(stageA, stageA);

  assert.equal(rtA.rootClip._currentframe, 2, 'Frame-1 onEnterFrame preloader must self-complete onto Frame 2');
  assert.equal(rtA.rootClip._playing, false, 'nextFrame() inside Frame-1 preloader must keep Frame 2 title screen stopped');
  assert.equal(rtA.rootClip._vars.onEnterFrame, undefined, 'Preloader delete this.onEnterFrame must execute cleanly before Frame 2');
  assert.equal(rtA._liveButtons.size, 1, 'Frame 2 title screen button must be live immediately on mount');

  // Remain stably on Frame 2 across idle frames
  for (let i = 0; i < 5; i++) rtA.stepOneSwfFrame();
  assert.equal(rtA.rootClip._currentframe, 2, 'Title screen must stay stopped on Frame 2 until user clicks Play');

  // Clicking Play advances naturally through Frame 3 -> Frame 4 (setup) -> Frame 5 (gameStarted)
  const btn = Array.from(rtA._liveButtons)[0] as any;
  btn.triggerClick();
  for (let i = 0; i < 4; i++) rtA.stepOneSwfFrame();
  assert.equal(rtA.rootClip._currentframe, 5, 'Clicking Play must advance cleanly through Frame 4 setup into Frame 5');
  assert.equal(rtA.rootClip._vars.setupRan, 1, 'Frame 4 setup script must execute');
  assert.equal(rtA.rootClip._vars.gameStarted, 1, 'Frame 5 game start script must execute');

  // Reset must cleanly return to Frame 2 stopped with no stale onEnterFrame
  rtA.reset();
  assert.equal(rtA.rootClip._currentframe, 2, 'reset() must return cleanly to Frame 2 title screen');
  assert.equal(rtA.rootClip._playing, false, 'reset() must preserve stopped Frame 2 title screen');
  assert.equal(rtA.rootClip._vars.onEnterFrame, undefined, 'reset() must leave no stale preloader onEnterFrame');
  rtA.destroy();

  // Case B: Stalled external preloader (never calls nextFrame) must fall back to entryFrame AND clear stalled onEnterFrame
  const stalledPreloaderBytes: number[] = [
    0x07, // stop()
    ...actionPush([{ t: 'str', v: 'this' }]),
    0x1C,
    ...actionPush([{ t: 'str', v: 'onEnterFrame' }]),
    ...actionDefineFunction('', [], [
      ...actionPush([{ t: 'str', v: 'stalledTicks' }, { t: 'str', v: 'stalledTicks' }]),
      0x1C,
      ...actionPush([{ t: 'int', v: 1 }]),
      0x47, // Add2
      0x1D, // SetVariable
    ]),
    0x4F,
    0x00,
  ];
  const f2MenuStop: number[] = [0x07, 0x00];
  const progB = {
    v: 1, swfVer: 7, fps: 24, w: 320, h: 240, bg: '#000000', fc: 3,
    ef: 2, ps: 1,
    l: [], sh: {}, et: {}, bt: {}, sp: {},
    fr: [[], [], []],
    ac: [
      { f: 1, b64: Buffer.from(stalledPreloaderBytes).toString('base64') },
      { f: 2, b64: Buffer.from(f2MenuStop).toString('base64') },
    ],
  };

  const stageB = new MockSvgNode('svg');
  const rtB = new ASTAVM1Runtime(Buffer.from(JSON.stringify(progB)).toString('base64'), { engine: { vars: {} } });
  rtB.mount(stageB, stageB);
  assert.equal(rtB.rootClip._currentframe, 2, 'Stalled Frame-1 preloader must fall back to entryFrame 2');
  assert.equal(rtB.rootClip._vars.onEnterFrame, undefined, 'Fallback jump must clear stalled Frame-1 preloader onEnterFrame');
  const ticksAfterMount = Number(rtB.rootClip._vars.stalledTicks) || 0;
  for (let i = 0; i < 4; i++) rtB.stepOneSwfFrame();
  assert.equal(Number(rtB.rootClip._vars.stalledTicks) || 0, ticksAfterMount, 'Cleared stalled preloader must not run after entering Frame 2');
  rtB.destroy();

  console.log('✓ Test 8 passed: AVM1 Frame-1 Preloader Self-Completion, Exact Play/Stop Semantics & Stalled Preloader Cleanup');
}

(async () => {
  await testSwfSoundEngine();
  await testPureSvgVisualFx();
  await testInteractiveEditText();
  await testDecoupledMediaInputRoute();
  await testAvm1CoreSpecCompliance();
  await testAvm1ExtendedCompliance();
  await testAvm1AndAvm2LifecycleCompliance();
  await testAvm1PreloaderSelfCompletion();
  console.log('ALL RUFFLE-PARITY SWF ENGINE TESTS PASSED!');
  process.exit(0);
})();


