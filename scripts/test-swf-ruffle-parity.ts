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

(async () => {
  await testSwfSoundEngine();
  await testPureSvgVisualFx();
  await testInteractiveEditText();
  console.log('ALL RUFFLE-PARITY SWF ENGINE TESTS PASSED!');
  process.exit(0);
})();
