#!/usr/bin/env npx tsx
/**
 * scripts/benchmark-swf-corpus.ts
 *
 * Headless SWF Compatibility & Performance Corpus Benchmark CLI.
 *
 * Usage:
 *   npm run bench:swf                              # Benchmarks built-in binary SWF samples
 *   npm run bench:swf -- /path/to/swfs             # Recursively benchmarks all .swf files in directory
 *   npm run bench:swf -- a.swf b.swf --frames 120  # Specific files with custom frame count
 *   npm run bench:swf -- /dir --json report.json   # Exports machine-readable JSON scoreboard
 *   npm run bench:swf -- /dir --include-samples    # Includes built-in samples alongside corpus files
 *   npm run bench:swf -- /dir --no-probe           # Disables synthetic click/key input probes
 *
 * Measures per-SWF:
 *   - Static Centrifuge triage (signal / suspect / reject-low-value), SWF header, skipped tags
 *   - Live AVM1 / AVM2 headless execution over N frames + optional pointer/keyboard responsiveness probes
 *   - Runtime health verdict (playable / degraded / cannot-play), avg & p95 frame time (ms), peak SVG nodes
 *   - Pareto frequency rankings of top Missing Flash APIs, Unhandled Opcodes, Skipped SWF Tags,
 *     Blocked External Calls, and Runtime Errors across the corpus.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { transpileSwfToAst } from '../src/utils/swfAstParser';
import {
  buildFlashArcadeSampleSwf,
  buildFlashAs3LabSampleSwf,
  buildFlashPacmanSampleSwf,
  buildFlashPendulumSampleSwf,
} from '../src/utils/swfSampleBuilder';
import type { SwfRuntimeHealthReport } from '../src/services/dbStore';

// ============================================================================
// Lightweight Pure-SVG Mock DOM for Headless AVM1 & AVM2 Execution
// ============================================================================

class HeadlessSvgElement {
  tagName: string;
  attributes = new Map<string, string>();
  style: Record<string, string> = {};
  children: HeadlessSvgElement[] = [];
  parentNode: HeadlessSvgElement | null = null;
  textContent = '';
  ownerDocument: HeadlessSvgDoc;
  private listeners = new Map<string, Set<Function>>();

  constructor(tag: string, doc: HeadlessSvgDoc) {
    this.tagName = tag;
    this.ownerDocument = doc;
  }

  get nodeName() { return this.tagName; }
  get childNodes() { return this.children; }
  get firstChild() { return this.children[0] || null; }
  get nextSibling() {
    if (!this.parentNode) return null;
    const idx = this.parentNode.children.indexOf(this);
    return idx >= 0 && idx + 1 < this.parentNode.children.length ? this.parentNode.children[idx + 1] : null;
  }
  focus() {}

  setAttribute(k: string, v: string) { this.attributes.set(k, String(v)); }
  getAttribute(k: string) { return this.attributes.has(k) ? this.attributes.get(k)! : null; }
  removeAttribute(k: string) { this.attributes.delete(k); }
  hasAttribute(k: string) { return this.attributes.has(k); }

  cloneNode(deep = false): HeadlessSvgElement {
    const copy = new HeadlessSvgElement(this.tagName, this.ownerDocument);
    this.attributes.forEach((v, k) => copy.attributes.set(k, v));
    copy.textContent = this.textContent;
    if (deep) {
      for (const ch of this.children) copy.appendChild(ch.cloneNode(true));
    }
    return copy;
  }

  appendChild(child: HeadlessSvgElement) {
    if (!child) return child;
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertBefore(child: HeadlessSvgElement, ref: HeadlessSvgElement | null) {
    if (!ref) return this.appendChild(child);
    if (child.parentNode) child.parentNode.removeChild(child);
    const idx = this.children.indexOf(ref);
    child.parentNode = this;
    if (idx < 0) this.children.push(child);
    else this.children.splice(idx, 0, child);
    return child;
  }

  removeChild(child: HeadlessSvgElement) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }

  replaceChildren(...nodes: HeadlessSvgElement[]) {
    for (const ch of this.children) ch.parentNode = null;
    this.children = [];
    for (const n of nodes) if (n) this.appendChild(n);
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

  querySelector(sel: string): HeadlessSvgElement | null {
    return this.querySelectorAll(sel)[0] || null;
  }

  querySelectorAll(sel: string): HeadlessSvgElement[] {
    const out: HeadlessSvgElement[] = [];
    const parts = sel.split(',').map((p) => p.trim()).filter(Boolean);
    const matchers = parts.map((p) => {
      const attrMatch = p.match(/^\[([^=\]]+)="([^"]*)"\]$/);
      if (attrMatch) return (el: HeadlessSvgElement) => el.getAttribute(attrMatch[1]) === attrMatch[2];
      if (p.startsWith('#')) {
        const id = p.slice(1);
        return (el: HeadlessSvgElement) => el.getAttribute('id') === id;
      }
      const tag = p.split(/\s+/).pop()!.toLowerCase();
      return (el: HeadlessSvgElement) => el.tagName.toLowerCase() === tag;
    });
    const walk = (n: HeadlessSvgElement) => {
      for (const ch of n.children) {
        if (matchers.some((m) => m(ch))) out.push(ch);
        walk(ch);
      }
    };
    walk(this);
    return out;
  }

  getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; }
  closest() { return null; }
  createSVGPoint() { return { x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }; }
  getScreenCTM() { return { inverse: () => ({}) }; }
}

class HeadlessSvgDoc {
  head = new HeadlessSvgElement('head', this);
  body = new HeadlessSvgElement('body', this);
  documentElement = new HeadlessSvgElement('html', this);
  activeElement: any = null;
  createElementNS(_ns: string, tag: string) { return new HeadlessSvgElement(tag, this); }
  createElement(tag: string) { return new HeadlessSvgElement(tag, this); }
  getElementById(id: string) { return this.body.querySelector(`#${id}`); }
  querySelector(sel: string) { return this.body.querySelector(sel); }
  querySelectorAll(sel: string) { return this.body.querySelectorAll(sel); }
  addEventListener() {}
  removeEventListener() {}
}

// Cache loaded VM source once so benchmarking 100+ SWFs stays fast
const EVENT_BUS_SRC = fs.readFileSync(path.resolve(process.cwd(), 'static/player/ast-event-bus.js'), 'utf8');
const AVM1_SRC = fs.readFileSync(path.resolve(process.cwd(), 'static/player/ast-avm1-vm.js'), 'utf8');
const AVM2_SRC = fs.readFileSync(path.resolve(process.cwd(), 'static/player/ast-avm2-vm.js'), 'utf8');

function createVmSandbox(which: 'avm1' | 'avm2') {
  const doc = new HeadlessSvgDoc();
  const win: any = {
    document: doc,
    location: { pathname: '/player/index.html', search: '' },
    addEventListener() {},
    removeEventListener() {},
    setTimeout: () => 0,
    clearTimeout: () => {},
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    performance: { now: () => performance.now() },
    TextDecoder,
    TextEncoder,
    Uint8Array,
    Int16Array,
    Int32Array,
    Float32Array,
    Float64Array,
    ArrayBuffer,
    DataView,
    Map,
    Set,
    WeakMap,
    Math,
    Date,
    RegExp,
    Error,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    escape,
    unescape,
    console: { log() {}, info() {}, warn() {}, error() {} },
  };
  win.window = win;
  win.self = win;
  win.globalThis = win;

  const ctx = vm.createContext(win);
  if (which === 'avm2') {
    vm.runInContext(EVENT_BUS_SRC, ctx, { filename: 'static/player/ast-event-bus.js' });
    vm.runInContext(AVM2_SRC, ctx, { filename: 'static/player/ast-avm2-vm.js' });
  } else {
    vm.runInContext(AVM1_SRC, ctx, { filename: 'static/player/ast-avm1-vm.js' });
  }
  return { win, doc };
}

// ============================================================================
// Benchmark Types & Execution
// ============================================================================

interface CorpusEntry {
  name: string;
  source: string;
  bytes: Uint8Array;
}

interface SwfBenchResult {
  name: string;
  source: string;
  bytes: number;
  transpileOk: boolean;
  transpileMs: number;
  transpileError?: string;
  signature?: string;
  swfVersion?: number;
  dimensions?: string;
  fps?: number;
  frameCount?: number;
  executionModel?: string;
  centrifugeVerdict?: string;
  centrifugeReasons: string[];
  skippedTagIds: number[];
  vm: 'avm1' | 'avm2' | 'static-vector' | 'none';
  runtimeVerdict: 'playable' | 'degraded' | 'cannot-play' | 'static-only' | 'error';
  framesStepped: number;
  visibleNodes: number;
  svgNodeCount: number;
  peakSvgNodes: number;
  avgFrameMs: number;
  p95FrameMs: number;
  unhandledOpcodes: string[];
  missingApis: string[];
  externalCalls: string[];
  runtimeErrors: string[];
  stalledPreloader: boolean;
  scriptThrottled: boolean;
  reasons: string[];
}

async function benchmarkOneSwf(entry: CorpusEntry, framesToStep: number, probeInput: boolean): Promise<SwfBenchResult> {
  const t0 = performance.now();
  const ab = entry.bytes.buffer.slice(entry.bytes.byteOffset, entry.bytes.byteOffset + entry.bytes.byteLength);
  let parsed: Awaited<ReturnType<typeof transpileSwfToAst>>;
  try {
    parsed = await transpileSwfToAst(ab, entry.name.replace(/\.swf$/i, ''));
  } catch (err: any) {
    return {
      name: entry.name,
      source: entry.source,
      bytes: entry.bytes.byteLength,
      transpileOk: false,
      transpileMs: Math.round((performance.now() - t0) * 100) / 100,
      transpileError: err?.message || String(err),
      centrifugeReasons: [],
      skippedTagIds: [],
      vm: 'none',
      runtimeVerdict: 'error',
      framesStepped: 0,
      visibleNodes: 0,
      svgNodeCount: 0,
      peakSvgNodes: 0,
      avgFrameMs: 0,
      p95FrameMs: 0,
      unhandledOpcodes: [],
      missingApis: [],
      externalCalls: [],
      runtimeErrors: [err?.message || String(err)],
      stalledPreloader: false,
      scriptThrottled: false,
      reasons: [`Transpile exception: ${err?.message || String(err)}`],
    };
  }
  const transpileMs = Math.round((performance.now() - t0) * 100) / 100;

  if (!parsed.success) {
    return {
      name: entry.name,
      source: entry.source,
      bytes: entry.bytes.byteLength,
      transpileOk: false,
      transpileMs,
      transpileError: parsed.error || 'Unknown transpile failure',
      centrifugeReasons: [],
      skippedTagIds: [],
      vm: 'none',
      runtimeVerdict: 'error',
      framesStepped: 0,
      visibleNodes: 0,
      svgNodeCount: 0,
      peakSvgNodes: 0,
      avgFrameMs: 0,
      p95FrameMs: 0,
      unhandledOpcodes: [],
      missingApis: [],
      externalCalls: [],
      runtimeErrors: [parsed.error || 'Unknown transpile failure'],
      stalledPreloader: false,
      scriptThrottled: false,
      reasons: [parsed.error || 'Transpile failed'],
    };
  }

  const meta = parsed.metadata;
  const centrifuge = meta?.centrifuge;
  const centrifugeReasons = [
    ...(centrifuge?.sludgeReasons || []),
    ...(centrifuge?.suspectReasons || []),
  ];
  const skippedTagIds = meta?.importDebugSummary?.skippedTagIds || [];
  const vmMatch = parsed.astSource.match(/\(:swf-vm\s+"([^"]+)"\)/);

  // Static vector-only SWF (no AVM1/AVM2 bytecode payload)
  if (!vmMatch || !vmMatch[1]) {
    const hasSvg = Boolean(parsed.svgMarkup && /<(path|rect|circle|ellipse|polygon|text|image|use)\b/i.test(parsed.svgMarkup));
    return {
      name: entry.name,
      source: entry.source,
      bytes: entry.bytes.byteLength,
      transpileOk: true,
      transpileMs,
      signature: meta?.signature,
      swfVersion: meta?.version,
      dimensions: meta ? `${meta.width}x${meta.height}` : undefined,
      fps: meta?.frameRate,
      frameCount: meta?.frameCount,
      executionModel: meta?.executionModel || 'static-vector',
      centrifugeVerdict: centrifuge?.verdict,
      centrifugeReasons,
      skippedTagIds,
      vm: 'static-vector',
      runtimeVerdict: hasSvg ? 'playable' : 'cannot-play',
      framesStepped: 0,
      visibleNodes: meta?.shapeCount || 0,
      svgNodeCount: meta?.shapeCount || 0,
      peakSvgNodes: meta?.shapeCount || 0,
      avgFrameMs: 0,
      p95FrameMs: 0,
      unhandledOpcodes: [],
      missingApis: [],
      externalCalls: centrifuge?.externalDependencyHits || [],
      runtimeErrors: [],
      stalledPreloader: false,
      scriptThrottled: false,
      reasons: hasSvg ? [] : ['Static SWF produced 0 drawable SVG shapes.'],
    };
  }

  const vmB64 = vmMatch[1];
  const isAs3 = Boolean(meta?.isActionScript3 && (meta?.abcCount || 0) > 0);
  const vmKind: 'avm1' | 'avm2' = isAs3 ? 'avm2' : 'avm1';

  try {
    const { win, doc } = createVmSandbox(vmKind);
    const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    stageSvg.appendChild(container);

    const runtime = vmKind === 'avm2'
      ? new win.ASTAVM2Runtime(vmB64, { doc, stageSvg, container, engine: { vars: {}, isMuted: true } })
      : new win.ASTAVM1Runtime(vmB64, { engine: { vars: {}, isMuted: true } });

    runtime.mount(container, stageSvg);

    const midX = Math.round((meta?.width || 640) / 2);
    const midY = Math.round((meta?.height || 480) / 2);
    const probeFrame = Math.min(15, Math.max(4, Math.floor(framesToStep / 4)));

    for (let f = 0; f < framesToStep; f++) {
      if (probeInput && f === probeFrame && typeof runtime.handleUniversalMediaInput === 'function') {
        runtime.handleUniversalMediaInput({ kind: 'pointer-move', stageX: midX, stageY: midY });
        runtime.handleUniversalMediaInput({ kind: 'pointer-down', stageX: midX, stageY: midY });
        runtime.handleUniversalMediaInput({ kind: 'pointer-up', stageX: midX, stageY: midY });
        runtime.handleUniversalMediaInput({ kind: 'key-down', key: ' ', keyCode: 32 });
        runtime.handleUniversalMediaInput({ kind: 'key-up', key: ' ', keyCode: 32 });
        runtime.handleUniversalMediaInput({ kind: 'key-down', key: 'ArrowRight', keyCode: 39 });
      }
      if (probeInput && f === probeFrame + 6 && typeof runtime.handleUniversalMediaInput === 'function') {
        runtime.handleUniversalMediaInput({ kind: 'key-up', key: 'ArrowRight', keyCode: 39 });
      }
      runtime.stepOneSwfFrame();
    }

    const health: SwfRuntimeHealthReport = runtime.getRuntimeHealthReport();
    if (typeof runtime.destroy === 'function') runtime.destroy();

    return {
      name: entry.name,
      source: entry.source,
      bytes: entry.bytes.byteLength,
      transpileOk: true,
      transpileMs,
      signature: meta?.signature,
      swfVersion: meta?.version,
      dimensions: meta ? `${meta.width}x${meta.height}` : undefined,
      fps: meta?.frameRate,
      frameCount: meta?.frameCount,
      executionModel: meta?.executionModel,
      centrifugeVerdict: centrifuge?.verdict,
      centrifugeReasons,
      skippedTagIds,
      vm: vmKind,
      runtimeVerdict: health.verdict === 'untested' ? 'cannot-play' : health.verdict,
      framesStepped: health.framesElapsed,
      visibleNodes: health.visibleNodes,
      svgNodeCount: health.svgNodeCount ?? health.visibleNodes,
      peakSvgNodes: health.peakSvgNodes ?? health.visibleNodes,
      avgFrameMs: health.avgFrameMs ?? 0,
      p95FrameMs: health.p95FrameMs ?? 0,
      unhandledOpcodes: health.unhandledOpcodes || [],
      missingApis: health.missingApis || [],
      externalCalls: health.externalCalls || [],
      runtimeErrors: health.runtimeErrors || [],
      stalledPreloader: Boolean(health.stalledPreloader),
      scriptThrottled: Boolean(health.scriptThrottled),
      reasons: health.reasons || [],
    };
  } catch (err: any) {
    return {
      name: entry.name,
      source: entry.source,
      bytes: entry.bytes.byteLength,
      transpileOk: true,
      transpileMs,
      signature: meta?.signature,
      swfVersion: meta?.version,
      dimensions: meta ? `${meta.width}x${meta.height}` : undefined,
      fps: meta?.frameRate,
      frameCount: meta?.frameCount,
      executionModel: meta?.executionModel,
      centrifugeVerdict: centrifuge?.verdict,
      centrifugeReasons,
      skippedTagIds,
      vm: vmKind,
      runtimeVerdict: 'error',
      framesStepped: 0,
      visibleNodes: 0,
      svgNodeCount: 0,
      peakSvgNodes: 0,
      avgFrameMs: 0,
      p95FrameMs: 0,
      unhandledOpcodes: [],
      missingApis: [],
      externalCalls: [],
      runtimeErrors: [err?.message || String(err)],
      stalledPreloader: false,
      scriptThrottled: false,
      reasons: [`VM mount/step crash: ${err?.message || String(err)}`],
    };
  }
}

// ============================================================================
// Corpus Discovery & Pareto Scoreboard
// ============================================================================

function collectSwfFiles(targetPath: string, out: CorpusEntry[]) {
  const abs = path.resolve(targetPath);
  if (!fs.existsSync(abs)) {
    console.error(`[bench:swf] Path not found: ${targetPath}`);
    return;
  }
  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    if (/\.swf$/i.test(abs)) {
      out.push({
        name: path.basename(abs),
        source: abs,
        bytes: new Uint8Array(fs.readFileSync(abs)),
      });
    }
    return;
  }
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
      collectSwfFiles(path.join(abs, ent.name), out);
    }
  }
}

function getBuiltinSampleEntries(): CorpusEntry[] {
  return [
    { name: 'sample-pacman.swf', source: 'builtin:pacman', bytes: buildFlashPacmanSampleSwf() },
    { name: 'sample-arcade.swf', source: 'builtin:arcade', bytes: buildFlashArcadeSampleSwf() },
    { name: 'sample-pendulum.swf', source: 'builtin:pendulum', bytes: buildFlashPendulumSampleSwf() },
    { name: 'sample-as3-lab.swf', source: 'builtin:as3-lab', bytes: buildFlashAs3LabSampleSwf() },
  ];
}

function bumpFreq(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function topEntries(map: Map<string, number>, limit = 10): Array<[string, number]> {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function pad(s: string, width: number, right = false): string {
  const str = s.length > width ? `${s.slice(0, Math.max(1, width - 1))}…` : s;
  return right ? str.padStart(width) : str.padEnd(width);
}

async function main() {
  const args = process.argv.slice(2);
  let frames = 90;
  let probeInput = true;
  let includeSamples = false;
  let jsonOutPath: string | null = null;
  const inputPaths: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--frames' && args[i + 1]) {
      frames = Math.max(1, Math.min(1000, Number(args[++i]) || 90));
    } else if (a === '--json' && args[i + 1]) {
      jsonOutPath = args[++i];
    } else if (a === '--no-probe') {
      probeInput = false;
    } else if (a === '--include-samples') {
      includeSamples = true;
    } else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: npm run bench:swf -- [swf-file-or-dir ...] [--frames 90] [--no-probe] [--include-samples] [--json out.json]'
      );
      process.exit(0);
    } else if (!a.startsWith('--')) {
      inputPaths.push(a);
    }
  }

  const corpus: CorpusEntry[] = [];
  for (const p of inputPaths) collectSwfFiles(p, corpus);
  if (corpus.length === 0 || includeSamples) {
    corpus.unshift(...getBuiltinSampleEntries());
  }

  console.log('\n==================================================================================');
  console.log(`SWF Corpus Compatibility & Performance Benchmark (${corpus.length} file(s), ${frames} frames/SWF)`);
  console.log('==================================================================================\n');

  const results: SwfBenchResult[] = [];
  for (const entry of corpus) {
    const res = await benchmarkOneSwf(entry, frames, probeInput);
    results.push(res);
  }

  // Per-file summary table
  const header = [
    pad('SWF File', 26),
    pad('VM', 6),
    pad('Centrifuge', 10),
    pad('Live Verdict', 12),
    pad('Avg ms', 7, true),
    pad('p95 ms', 7, true),
    pad('Peak SVG', 8, true),
    pad('Gaps (Ops/API/Ext/Err)', 24),
  ].join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const r of results) {
    const gapStr = `${r.unhandledOpcodes.length}/${r.missingApis.length}/${r.externalCalls.length}/${r.runtimeErrors.length}`;
    console.log(
      [
        pad(r.name, 26),
        pad(r.vm === 'static-vector' ? 'vec' : r.vm, 6),
        pad(r.centrifugeVerdict || 'n/a', 10),
        pad(r.runtimeVerdict, 12),
        pad(r.avgFrameMs.toFixed(2), 7, true),
        pad(r.p95FrameMs.toFixed(2), 7, true),
        pad(String(r.peakSvgNodes), 8, true),
        pad(gapStr, 24),
      ].join(' | ')
    );
    if (r.runtimeVerdict !== 'playable' && r.reasons.length > 0) {
      console.log(`   ↳ ${r.reasons.join(' | ')}`);
    }
  }

  // Aggregate Pareto Scoreboard
  const counts = { playable: 0, degraded: 0, 'cannot-play': 0, error: 0 };
  const missingApiFreq = new Map<string, number>();
  const opcodeFreq = new Map<string, number>();
  const skippedTagFreq = new Map<string, number>();
  const externalCallFreq = new Map<string, number>();
  const errorFreq = new Map<string, number>();
  let preloaderStalls = 0;
  let throttledCount = 0;

  for (const r of results) {
    if (r.runtimeVerdict === 'playable') counts.playable++;
    else if (r.runtimeVerdict === 'degraded') counts.degraded++;
    else if (r.runtimeVerdict === 'cannot-play') counts['cannot-play']++;
    else counts.error++;

    if (r.stalledPreloader) preloaderStalls++;
    if (r.scriptThrottled) throttledCount++;
    for (const a of r.missingApis) bumpFreq(missingApiFreq, a);
    for (const op of r.unhandledOpcodes) bumpFreq(opcodeFreq, `${r.vm}:${op}`);
    for (const tag of r.skippedTagIds) bumpFreq(skippedTagFreq, `Tag ${tag}`);
    for (const ext of r.externalCalls) bumpFreq(externalCallFreq, ext);
    for (const err of r.runtimeErrors) bumpFreq(errorFreq, err.slice(0, 72));
  }

  const total = results.length || 1;
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

  console.log('\n--- Corpus Compatibility Scoreboard ---');
  console.log(
    `Playable: ${counts.playable}/${total} (${pct(counts.playable)})  |  ` +
    `Degraded: ${counts.degraded}/${total} (${pct(counts.degraded)})  |  ` +
    `Cannot-Play: ${counts['cannot-play']}/${total} (${pct(counts['cannot-play'])})  |  ` +
    `Errors: ${counts.error}/${total} (${pct(counts.error)})`
  );
  console.log(`Preloader Stalls: ${preloaderStalls}  |  Throttled Loops: ${throttledCount}`);

  const printPareto = (label: string, map: Map<string, number>) => {
    const top = topEntries(map, 10);
    if (top.length === 0) {
      console.log(`${label}: none`);
      return;
    }
    console.log(`${label}:`);
    for (const [k, v] of top) {
      console.log(`  - ${k} (${v} SWF${v === 1 ? '' : 's'})`);
    }
  };

  printPareto('Top Missing Flash APIs', missingApiFreq);
  printPareto('Top Unhandled Opcodes', opcodeFreq);
  printPareto('Top Skipped SWF Tags', skippedTagFreq);
  printPareto('Top Blocked External Calls', externalCallFreq);
  printPareto('Top Runtime Errors', errorFreq);

  const slowest = [...results].sort((a, b) => b.p95FrameMs - a.p95FrameMs).slice(0, 3);
  const heaviestSvg = [...results].sort((a, b) => b.peakSvgNodes - a.peakSvgNodes).slice(0, 3);
  console.log(
    `Slowest p95 Frame: ${slowest.map((r) => `${r.name} (${r.p95FrameMs.toFixed(2)}ms)`).join(', ')}`
  );
  console.log(
    `Peak SVG Complexity: ${heaviestSvg.map((r) => `${r.name} (${r.peakSvgNodes} nodes)`).join(', ')}`
  );

  if (jsonOutPath) {
    const payload = {
      generatedAt: new Date().toISOString(),
      framesPerSwf: frames,
      probeInput,
      summary: {
        total: results.length,
        ...counts,
        preloaderStalls,
        throttledCount,
        topMissingApis: topEntries(missingApiFreq, 25),
        topUnhandledOpcodes: topEntries(opcodeFreq, 25),
        topSkippedTags: topEntries(skippedTagFreq, 25),
        topExternalCalls: topEntries(externalCallFreq, 25),
        topRuntimeErrors: topEntries(errorFreq, 25),
      },
      results,
    };
    fs.writeFileSync(path.resolve(jsonOutPath), JSON.stringify(payload, null, 2), 'utf8');
    console.log(`\nJSON benchmark report written to: ${jsonOutPath}`);
  }
}

main().catch((err) => {
  console.error('[bench:swf] Fatal error:', err);
  process.exit(1);
});
