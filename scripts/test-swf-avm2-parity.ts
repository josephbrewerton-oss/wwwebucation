/**
 * scripts/test-swf-avm2-parity.ts
 *
 * Ruffle-Style ActionScript 3 (AVM2 / DoABC) & Shared Event/Trait Regression Suite.
 * Verifies:
 *   1. Real binary SWF v10 `as3-lab.swf` (FileAttributes + DoABC2 + SymbolClass + PCM Sound + GlowFilter + EditText)
 *      executing live on ASTAVM2Runtime with ENTER_FRAME, Graphics Drawing API, Timer, ColorTransform,
 *      ChimeSound.play(), KeyboardEvent, MouseEvent, Editable TextField, Reset hygiene, and Run-to-Convert.
 *   2. Shared ASTEventDispatcher (`capture -> target -> bubble`, priority, stopPropagation, stopImmediatePropagation).
 *   3. 100% Decoupled Universal Media Input Route (`site-gestures.js` -> `ASTAVM2Runtime`, 0 duplicate window listeners,
 *      Smartboard Whiteboard pen gating, clean destroy(), and static media-agnostic invariant).
 *   4. Strict Per-Tick Instruction Budget Safety against infinite-loop ABC bytecode.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { transpileSwfToAst } from '../src/utils/swfAstParser';
import {
  AbcBuilder,
  buildDoAbc2Tag,
  buildFileAttributesTag,
  buildFlashAs3LabSampleSwf,
  buildSymbolClassTag,
} from '../src/utils/swfSampleBuilder';
import { distillSwfStatesToNativeCartridge, normalizeCapturedSnapshot } from '../src/utils/swfNativeDistiller';

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
  get firstChild() { return this.children[0] || null; }
  setAttribute(k: string, v: string) { this.attributes.set(k, String(v)); }
  getAttribute(k: string) { return this.attributes.has(k) ? this.attributes.get(k)! : null; }
  removeAttribute(k: string) { this.attributes.delete(k); }
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
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 640, height: 400 };
  }
  hasAttribute(k: string) { return this.attributes.has(k); }
  closest() { return null; }
  createSVGPoint() {
    return { x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } };
  }
  getScreenCTM() {
    return { inverse: () => ({}) };
  }
  get outerHTML(): string {
    const attrs = Array.from(this.attributes.entries())
      .map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`)
      .join('');
    const inner = this.children.length > 0
      ? this.children.map((c) => c.outerHTML).join('')
      : this.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<${this.tagName}${attrs}>${inner}</${this.tagName}>`;
  }
}

class MockSvgDoc {
  head = new MockSvgElement('head', this);
  body = new MockSvgElement('body', this);
  documentElement = new MockSvgElement('html', this);
  activeElement: any = null;
  private docListeners = new Map<string, Set<Function>>();
  createElementNS(_ns: string, tag: string) { return new MockSvgElement(tag, this); }
  createElement(tag: string) { return new MockSvgElement(tag, this); }
  getElementById(id: string) { return this.body.querySelector(`#${id}`); }
  querySelector(sel: string) { return this.body.querySelector(sel); }
  querySelectorAll(sel: string) { return this.body.querySelectorAll(sel); }
  addEventListener(type: string, fn: Function) {
    if (!this.docListeners.has(type)) this.docListeners.set(type, new Set());
    this.docListeners.get(type)!.add(fn);
  }
  removeEventListener(type: string, fn: Function) {
    this.docListeners.get(type)?.delete(fn);
  }
}

function loadRuntimeSandbox() {
  const doc = new MockSvgDoc();
  const winListeners = new Map<string, Set<Function>>();
  const win: any = {
    document: doc,
    location: { pathname: '/player/index.html', search: '' },
    addEventListener(type: string, fn: Function) {
      if (!winListeners.has(type)) winListeners.set(type, new Set());
      winListeners.get(type)!.add(fn);
    },
    removeEventListener(type: string, fn: Function) {
      winListeners.get(type)?.delete(fn);
    },
    dispatchWindowEvent(type: string, ev: any) {
      const set = winListeners.get(type);
      if (set) set.forEach((fn) => fn(ev));
    },
    _winListeners: winListeners,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (fn: Function) => setTimeout(fn, 16),
    cancelAnimationFrame: clearTimeout,
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    TextDecoder,
    TextEncoder,
    Uint8Array,
    Int32Array,
    Float32Array,
    DataView,
    Map,
    Set,
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
    console,
  };
  win.window = win;
  win.self = win;
  win.globalThis = win;

  const ctx = vm.createContext(win);
  const loadScript = (relPath: string) => {
    const abs = path.resolve(process.cwd(), relPath);
    const src = fs.readFileSync(abs, 'utf8');
    vm.runInContext(src, ctx, { filename: relPath });
  };
  loadScript('static/player/ast-event-bus.js');
  loadScript('static/player/ast-avm2-vm.js');

  return { win, doc, ctx, loadScript };
}

function extractSwfVmB64(astSource: string): string {
  const m = astSource.match(/\(:swf-vm\s+"([^"]+)"\)/);
  assert.ok(m && m[1], 'Expected (:swf-vm "...") payload in transpiled AS3 AST');
  return m[1];
}

async function test1_As3LabEndToEnd() {
  console.log('--- Test 1: Real Binary SWF v10 as3-lab.swf (DoABC2 + SymbolClass + Pure SVG + Web Audio + Run-to-Convert) ---');
  const swfBytes = buildFlashAs3LabSampleSwf();
  const parsed = await transpileSwfToAst(swfBytes, 'as3-lab');
  assert.equal(parsed.success, true, parsed.error || 'transpileSwfToAst failed');
  assert.equal(parsed.metadata?.version, 10);
  assert.equal(parsed.metadata?.isActionScript3, true);
  assert.equal(parsed.metadata?.abcCount, 1);
  assert.equal(parsed.metadata?.documentClass, 'As3PhysicsLab');
  assert.ok(parsed.metadata?.as3Classes?.includes('As3PhysicsLab'), 'Missing As3PhysicsLab in metadata.as3Classes');
  assert.ok(parsed.metadata?.as3Classes?.includes('ChimeSound'), 'Missing ChimeSound in metadata.as3Classes');
  assert.ok((parsed.metadata?.traitCount || 0) >= 12, `Expected >= 12 extracted traits, got ${parsed.metadata?.traitCount}`);

  const vmB64 = extractSwfVmB64(parsed.astSource);
  const { win, doc } = loadRuntimeSandbox();
  const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg.appendChild(container);

  const runtime = new win.ASTAVM2Runtime(vmB64, { doc, stageSvg, container });
  runtime.mount(container, stageSvg);

  // Boot & Document Class traits
  assert.ok(Array.from(runtime._traces).includes('as3_lab_ready'), 'Document Class constructor did not trace as3_lab_ready');
  const labTrait = runtime.traits.get('As3PhysicsLab');
  assert.ok(labTrait && labTrait.isDocumentClass, 'As3PhysicsLab blueprint missing in shared ASTTraitRegistry');
  assert.ok(labTrait.slots.some((s: any) => s.name === 'pulses'), 'Missing typed slot pulses');
  assert.ok(labTrait.methods.some((m: any) => m.name === 'onFrame'), 'Missing typed method onFrame');

  // Step 12 frames (~400ms at 30 FPS) -> ENTER_FRAME + Graphics API + Timer
  const startOrbX = runtime.rootDoc.orb.x;
  for (let i = 0; i < 12; i++) runtime.step(1 / 30);

  assert.ok(runtime.rootDoc.ticks >= 12, `Expected >= 12 ENTER_FRAME ticks, got ${runtime.rootDoc.ticks}`);
  assert.notEqual(runtime.rootDoc.orb.x, startOrbX, 'Expected orb.x to animate via ENTER_FRAME');
  assert.ok(runtime.rootDoc.timerCount >= 1, `Expected TimerEvent.TIMER to fire (>=1), got ${runtime.rootDoc.timerCount}`);
  assert.ok(Array.from(runtime._traces).includes('as3_timer'), 'Expected as3_timer trace');

  // Verify Graphics Drawing API rendered pure W3C SVG nodes
  const graphicsGroups = stageSvg.querySelectorAll('[data-as3-graphics="1"]');
  const drawnCircles = stageSvg.querySelectorAll('circle');
  const drawnPaths = stageSvg.querySelectorAll('path');
  assert.ok(graphicsGroups.length >= 1, 'Missing data-as3-graphics group');
  assert.ok(drawnCircles.length >= 1, 'Expected Graphics.drawCircle() to emit SVG <circle>');
  assert.ok(drawnPaths.length >= 2, 'Expected vector shapes + Graphics.lineTo() SVG <path> elements');

  // Verify KeyboardEvent steering (ArrowLeft=37, Space=32)
  runtime.handleUniversalMediaInput({ kind: 'key-down', key: 'ArrowLeft', keyCode: 37 });
  assert.equal(runtime.rootDoc.vx, -5, 'ArrowLeft should steer vx to -5');
  runtime.handleUniversalMediaInput({ kind: 'key-down', key: ' ', keyCode: 32 });
  assert.equal(runtime.rootDoc.pulses, 1, 'Space key should trigger onPulseClick');
  assert.equal(runtime._soundEngine._soundLog.length, 1, 'ChimeSound.play() should log sound trigger');
  assert.equal(runtime._soundEngine._soundLog[0].id, 20, 'ChimeSound should play DefineSound charId 20');

  // Verify ColorTransform created cached SVG <feColorMatrix> filter
  const colorMatrices = stageSvg.querySelectorAll('feColorMatrix');
  assert.ok(colorMatrices.length >= 1, 'ColorTransform should generate cached SVG <feColorMatrix>');

  // Verify MouseEvent.CLICK on pulseBtn (placed at x=468..608, y=342..380)
  runtime.handleUniversalMediaInput({ kind: 'pointer-down', stageX: 520, stageY: 360 });
  runtime.handleUniversalMediaInput({ kind: 'pointer-up', stageX: 520, stageY: 360 });
  assert.equal(runtime.rootDoc.pulses, 2, 'Clicking pulseBtn should increment pulses to 2');
  assert.equal(runtime._soundEngine._soundLog.length, 2, 'Second pulse click should trigger ChimeSound again');

  // Step 1 frame so HUD text refreshes
  runtime.step(1 / 30);
  assert.ok(runtime.rootDoc.hud.text.includes('PULSES: 2'), `Expected HUD to show PULSES: 2, got "${runtime.rootDoc.hud.text}"`);

  // Verify Editable Input TextField (`studentTag` at x=24..204, y=344..376)
  let changeEvents = 0;
  runtime.rootDoc.studentTag.addEventListener('change', () => { changeEvents++; });
  runtime.handleUniversalMediaInput({ kind: 'pointer-down', stageX: 60, stageY: 358 });
  runtime.handleUniversalMediaInput({ kind: 'key-down', key: 'X', keyCode: 88 });
  assert.equal(runtime.rootDoc.studentTag.text, 'LAB-01X', 'Editable AS3 TextField should accept keyboard input');
  assert.equal(changeEvents, 1, 'Editable AS3 TextField should dispatch Event.CHANGE');

  // Verify Hybrid Run-to-Convert Snapshot & Native AST Distillation
  const snapRaw = runtime.captureDistillationSnapshot({ label: 'AS3 Active Orbit' });
  assert.ok(snapRaw.svgMarkup.includes('<svg') && !snapRaw.svgMarkup.includes('<canvas'), 'Snapshot must be pure W3C SVG');
  assert.equal(snapRaw.variables.pulses, 2);
  assert.ok(Array.isArray(snapRaw.traits) && snapRaw.traits.length >= 2, 'Snapshot should carry extracted AS3 traits');

  const norm = normalizeCapturedSnapshot(snapRaw, 0, 'AS3 Vector Lab');
  const distilled = distillSwfStatesToNativeCartridge({
    id: 'as3-lab-native',
    title: 'AS3 Vector Lab',
    stage: 'STEM LAB',
    format: 'Slide',
    states: [norm],
    originalSwfBytes: swfBytes.length,
  });
  assert.ok(!distilled.astSource.includes(':swf-vm'), 'Distilled native AST cartridge must contain 0 bytes of Flash bytecode');
  assert.ok(distilled.svgMarkup.includes('<svg'), 'Distilled SVG must be valid W3C SVG');

  // Verify reset() hygiene (no duplicate data-swf-vm-def defs)
  const defsBefore = stageSvg.querySelectorAll('[data-swf-vm-def="1"]').length;
  runtime.reset();
  const defsAfter = stageSvg.querySelectorAll('[data-swf-vm-def="1"]').length;
  assert.equal(runtime.rootDoc.ticks, 0, 'Reset should reset ticks to 0');
  assert.equal(runtime.rootDoc.pulses, 0, 'Reset should reset pulses to 0');
  assert.ok(defsAfter <= defsBefore, `Reset must not leak SVG defs (${defsBefore} -> ${defsAfter})`);

  runtime.destroy();
  console.log(`  PASS: SWF v10 (${swfBytes.length} B), ticks=${snapRaw.variables.ticks}, pulses=2, traits=${snapRaw.traits.length}, native distilled=${distilled.metrics.nativeTotalBytes} B`);
}

async function test2_SharedEventDispatcherBubbling() {
  console.log('--- Test 2: Shared ASTEventDispatcher (capture -> target -> bubble, priority, stopPropagation) ---');
  const { win } = loadRuntimeSandbox();
  const { ASTEvent, ASTEventDispatcher } = win.ASTEventBus;

  const root = new ASTEventDispatcher();
  const panel = new ASTEventDispatcher();
  const button = new ASTEventDispatcher();
  panel._eventParent = root;
  button._eventParent = panel;

  const log: string[] = [];
  root.addEventListener('activate', (e: any) => log.push(`root:cap:${e.eventPhase}`), true, 0);
  panel.addEventListener('activate', (e: any) => log.push(`panel:cap:${e.eventPhase}`), true, 0);
  button.addEventListener('activate', (e: any) => log.push(`btn:low:${e.eventPhase}`), false, 0);
  button.addEventListener('activate', (e: any) => log.push(`btn:high:${e.eventPhase}`), false, 10);
  panel.addEventListener('activate', (e: any) => log.push(`panel:bub:${e.eventPhase}`), false, 0);
  root.addEventListener('activate', (e: any) => log.push(`root:bub:${e.eventPhase}`), false, 0);

  button.dispatchEvent(new ASTEvent('activate', true, true));
  assert.deepEqual(log, [
    'root:cap:1',
    'panel:cap:1',
    'btn:high:2',
    'btn:low:2',
    'panel:bub:3',
    'root:bub:3',
  ]);

  // Verify stopPropagation() halts bubbling after current node completes
  const log2: string[] = [];
  const p2 = new ASTEventDispatcher();
  const c2 = new ASTEventDispatcher();
  c2._eventParent = p2;
  c2.addEventListener('click', (e: any) => { log2.push('c2:first'); e.stopPropagation(); }, false, 5);
  c2.addEventListener('click', () => { log2.push('c2:second'); }, false, 0);
  p2.addEventListener('click', () => { log2.push('p2:bubble'); }, false, 0);
  c2.dispatchEvent(new ASTEvent('click', true, false));
  assert.deepEqual(log2, ['c2:first', 'c2:second']);

  // Verify stopImmediatePropagation() halts even sibling listeners on same node
  const log3: string[] = [];
  const c3 = new ASTEventDispatcher();
  c3.addEventListener('click', (e: any) => { log3.push('c3:first'); e.stopImmediatePropagation(); }, false, 5);
  c3.addEventListener('click', () => { log3.push('c3:second'); }, false, 0);
  c3.dispatchEvent(new ASTEvent('click', true, false));
  assert.deepEqual(log3, ['c3:first']);

  console.log('  PASS: Capture -> Target -> Bubble, priority sort, stopPropagation & stopImmediatePropagation verified');
}

async function test3_UniversalGestureBusIndependence() {
  console.log('--- Test 3: 100% Decoupled Universal Gesture Bus -> AVM2 Sink & Whiteboard Pen Gating ---');
  // Static check: site-gestures files must remain 100% media-agnostic
  const gCore = fs.readFileSync(path.resolve(process.cwd(), 'static/player/site-gestures.js'), 'utf8');
  const gInput = fs.readFileSync(path.resolve(process.cwd(), 'static/player/site-gestures-input.js'), 'utf8');
  assert.equal(/avm1|avm2|\bswf\b/i.test(gCore), false, 'site-gestures.js must have ZERO Flash/AVM1/AVM2 references');
  assert.equal(/avm1|avm2|\bswf\b/i.test(gInput), false, 'site-gestures-input.js must have ZERO Flash/AVM1/AVM2 references');

  const swfBytes = buildFlashAs3LabSampleSwf();
  const parsed = await transpileSwfToAst(swfBytes, 'as3-lab');
  const vmB64 = extractSwfVmB64(parsed.astSource);

  const { win, doc, loadScript } = loadRuntimeSandbox();
  loadScript('static/player/site-gestures-profile.js');
  loadScript('static/player/site-gestures-input.js');
  loadScript('static/player/site-gestures.js');

  const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg.appendChild(container);

  const mockEngine: any = {
    scene: { id: 'as3-lab', controls: { 'media-input': true } },
    vars: {},
    isPlaying: true,
    progress: 0,
    getStageSvg: () => stageSvg,
    getVar: (k: string) => mockEngine.vars[k],
    setVar: (k: string, v: any) => { mockEngine.vars[k] = v; },
    on: () => {},
    emit: () => {},
  };

  const gesturesAstSrc = fs.readFileSync(path.resolve(process.cwd(), 'static/player/player-gestures.ast'), 'utf8');
  const gestures = new win.ASTDirectGestureSubsystem(mockEngine);
  gestures.stageSvg = stageSvg;
  gestures._parsePlayerGesturesAST(gesturesAstSrc);
  gestures.setupEventListeners();
  const keyListenersBefore = (win._winListeners.get('keydown')?.size || 0);

  const runtime = new win.ASTAVM2Runtime(vmB64, { engine: mockEngine, doc, stageSvg, container });
  runtime.mount(container, stageSvg);

  const keyListenersAfter = (win._winListeners.get('keydown')?.size || 0);
  assert.equal(keyListenersAfter, keyListenersBefore, 'ASTAVM2Runtime must attach ZERO duplicate window keydown listeners when hosted');
  assert.equal(gestures.hasActiveMediaInputSink(), true, 'AVM2 sink should be active on site-gestures bus');

  // Route keyboard through site-gestures -> AVM2
  win.dispatchWindowEvent('keydown', {
    key: 'ArrowRight', code: 'ArrowRight', keyCode: 39,
    target: doc.body, preventDefault() {}, stopPropagation() {},
  });
  assert.equal(runtime.rootDoc.vx, 5, 'Universal gesture bus should route ArrowRight to AVM2 vx=5');

  // Smartboard Whiteboard Pen Gating: pen active must block clicks from reaching AVM2 pulseBtn
  gestures.isPenActive = true;
  const pulsesBeforePen = runtime.rootDoc.pulses;
  stageSvg.dispatchEvent({ type: 'pointerdown', clientX: 520, clientY: 360, button: 0, target: stageSvg, preventDefault() {} });
  win.dispatchWindowEvent('pointerup', { type: 'pointerup', clientX: 520, clientY: 360, button: 0, target: stageSvg, preventDefault() {} });
  assert.equal(runtime.rootDoc.pulses, pulsesBeforePen, 'Whiteboard pen mode must gate pointer events away from AVM2');

  // Switch back to pointer mode -> click reaches AVM2 pulseBtn
  gestures.isPenActive = false;
  stageSvg.dispatchEvent({ type: 'pointerdown', clientX: 520, clientY: 360, button: 0, target: stageSvg, preventDefault() {} });
  win.dispatchWindowEvent('pointerup', { type: 'pointerup', clientX: 520, clientY: 360, button: 0, target: stageSvg, preventDefault() {} });
  assert.equal(runtime.rootDoc.pulses, pulsesBeforePen + 1, 'Pointer mode should route click to AVM2 pulseBtn');

  runtime.destroy();
  assert.equal(gestures.hasActiveMediaInputSink(), false, 'destroy() must unregister AVM2 sink cleanly');
  console.log('  PASS: Zero duplicate window listeners, universal keyboard/pointer routing, whiteboard pen gating & clean teardown');
}

async function test4_InstructionBudgetSafety() {
  console.log('--- Test 4: Strict Per-Tick Instruction Budget Guardrail (Infinite Loop ABC) ---');
  const abc = new AbcBuilder();
  const loopInit = abc.addMethod({
    name: 'RogueLoop',
    build: (c) => {
      c.op(0xd0).op(0x30); // getlocal_0; pushscope
      c.op(0xd0).op(0x49).u30(0); // constructsuper 0
      c.label('spin');
      c.op(0x02); // nop
      c.branch(0x10, 'spin'); // jump spin (infinite loop!)
      c.op(0x47);
    },
  });
  const clsIdx = abc.addClass({
    ns: '',
    name: 'RogueLoop',
    superNs: 'flash.display',
    superName: 'Sprite',
    iinit: loopInit,
  });
  const sInit = abc.addMethod({ name: 'script_init', build: (c) => { c.op(0xd0).op(0x30).op(0x47); } });
  abc.addScript(sInit, [clsIdx]);

  // Wrap into minimal valid SWF v10
  const tagBytes: number[] = [];
  const pushTag = (code: number, payload: Uint8Array) => {
    if (payload.length < 63) {
      const hdr = ((code & 0x3ff) << 6) | payload.length;
      tagBytes.push(hdr & 0xff, (hdr >>> 8) & 0xff);
    } else {
      const hdr = ((code & 0x3ff) << 6) | 0x3f;
      tagBytes.push(hdr & 0xff, (hdr >>> 8) & 0xff);
      tagBytes.push(payload.length & 0xff, (payload.length >>> 8) & 0xff, (payload.length >>> 16) & 0xff, (payload.length >>> 24) & 0xff);
    }
    for (let i = 0; i < payload.length; i++) tagBytes.push(payload[i]);
  };
  pushTag(69, buildFileAttributesTag(true));
  pushTag(82, buildDoAbc2Tag('RogueLoop', abc.toUint8Array(), 1));
  pushTag(76, buildSymbolClassTag([{ id: 0, name: 'RogueLoop' }]));
  pushTag(1, new Uint8Array(0));
  pushTag(0, new Uint8Array(0));

  // Minimal FWS v10 header (rect = 1-bit zeros = 1 byte)
  const body = new Uint8Array([0x00, 0x00, 24, 1, 0, ...tagBytes]);
  const total = 8 + body.length;
  const swf = new Uint8Array(total);
  swf[0] = 0x46; swf[1] = 0x57; swf[2] = 0x53; swf[3] = 10;
  swf[4] = total & 0xff; swf[5] = (total >>> 8) & 0xff; swf[6] = (total >>> 16) & 0xff; swf[7] = (total >>> 24) & 0xff;
  swf.set(body, 8);

  const parsed = await transpileSwfToAst(swf, 'rogue-loop');
  assert.equal(parsed.success, true);
  const vmB64 = extractSwfVmB64(parsed.astSource);
  const { win, doc } = loadRuntimeSandbox();
  const stageSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const container = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  stageSvg.appendChild(container);

  const t0 = Date.now();
  const runtime = new win.ASTAVM2Runtime(vmB64, { doc, stageSvg, container });
  let caughtBudget = false;
  try {
    runtime.mount(container, stageSvg);
  } catch (err: any) {
    if (err && err.name === 'AVM2BudgetExceededError') caughtBudget = true;
    else throw err;
  }
  const elapsed = Date.now() - t0;
  assert.equal(caughtBudget, true, 'Infinite-loop ABC must throw AVM2BudgetExceededError');
  assert.ok(runtime._budgetHits >= 1, 'Expected _budgetHits >= 1');
  assert.ok(elapsed < 500, `Infinite-loop abort should finish in <500ms, took ${elapsed}ms`);
  console.log(`  PASS: Infinite-loop ABC aborted safely in ${elapsed} ms (budgetHits=${runtime._budgetHits})`);
}

async function main() {
  await test1_As3LabEndToEnd();
  await test2_SharedEventDispatcherBubbling();
  await test3_UniversalGestureBusIndependence();
  await test4_InstructionBudgetSafety();
  console.log('\nALL 4 AVM2 / AS3 PARITY & SHARED EVENT/TRAIT TESTS PASSED!');
}

main().catch((err) => {
  console.error('AVM2 PARITY TEST FAILED:', err);
  process.exit(1);
});
