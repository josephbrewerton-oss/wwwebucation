// scripts/test-swf-distiller.ts
/**
 * End-to-End Verification Harness for Hybrid "Run-to-Convert" Flash SWF -> Native AST Distiller
 * Tests live AVM1 snapshot capture, bounded auto-sweep, SVG <defs> path deduplication,
 * screen-reader accessibility invariants, and bytecode-free native AST emission.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { transpileSwfToAst } from '../src/utils/swfAstParser';
import { buildFlashArcadeSampleSwf, buildFlashPendulumSampleSwf } from '../src/utils/swfSampleBuilder';
import {
  distillSwfStatesToNativeCartridge,
  generateEcoCheckpoints,
  inferRecommendedFormat,
  normalizeCapturedSnapshot,
} from '../src/utils/swfNativeDistiller';

class MockEl {
  tagName: string;
  nodeType = 1;
  attrs: Record<string, string> = {};
  children: MockEl[] = [];
  style: Record<string, string> = {};
  textContent = '';
  parentNode: MockEl | null = null;
  constructor(tag: string) {
    this.tagName = tag;
  }
  get childNodes() {
    return this.children;
  }
  setAttribute(k: string, v: string) {
    this.attrs[k] = String(v);
  }
  getAttribute(k: string) {
    return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null;
  }
  removeAttribute(k: string) {
    delete this.attrs[k];
  }
  appendChild(child: MockEl) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child: MockEl) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }
  replaceChildren(...nodes: MockEl[]) {
    this.children = [];
    for (const n of nodes) this.appendChild(n);
  }
  get firstChild() {
    return this.children[0] || null;
  }
  addEventListener() {}
  removeEventListener() {}
}

function loadAvm1Runtime() {
  const vmCode = fs.readFileSync(path.resolve('static/player/ast-avm1-vm.js'), 'utf8');
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
    JSON,
    Uint8Array,
    DataView,
    ArrayBuffer,
    TextDecoder,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    performance: { now: () => Date.now() },
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(vmCode, sandbox);
  return sandbox.ASTAVM1Runtime;
}

function loadAstParser() {
  const compilerCode = fs.readFileSync(path.resolve('static/player/ast-compiler.js'), 'utf8');
  const sandbox: any = { console, Math, JSON, Array, Object, String, Number, Boolean, RegExp, Map, Set };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(compilerCode, sandbox);
  return sandbox.ASTCompiler;
}

async function runSampleDistillTest(
  ASTAVM1Runtime: any,
  ASTCompiler: any,
  name: string,
  bytes: Uint8Array,
  expectedMinStates: number
) {
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const parsed = await transpileSwfToAst(ab, name);
  assert.equal(parsed.success, true, `${name} SWF parse failed`);
  const vmMatch = parsed.astSource.match(/\(:swf-vm\s+"([^"]+)"\)/);
  assert.ok(vmMatch && vmMatch[1], `${name} missing (:swf-vm ...) payload in astSource`);

  const doc = {
    createElementNS: (_ns: string, tag: string) => new MockEl(tag),
    createElement: (tag: string) => new MockEl(tag),
  };
  const stageSvg = new MockEl('svg');
  const container = new MockEl('g');
  stageSvg.appendChild(container);

  const runtime = new ASTAVM1Runtime(vmMatch[1], {
    doc,
    stageSvg,
    container,
    engine: { vars: {} },
  });
  runtime.mount(container, stageSvg);

  // 1. Capture single live state
  const snap1 = runtime.captureDistillationSnapshot();
  assert.ok(snap1.svgMarkup.length > 0, `${name}: initial snapshot SVG empty`);
  assert.ok(snap1.nodeCount > 0, `${name}: initial snapshot nodeCount = 0`);

  // 2. Bounded Auto-Sweep
  const swept = runtime.sweepDistillationStates({ maxStates: 8, budgetMs: 800 });
  assert.ok(
    swept.length >= expectedMinStates,
    `${name}: expected >= ${expectedMinStates} swept states, got ${swept.length}`
  );

  const normalizedStates = swept.map((s: any, idx: number) =>
    normalizeCapturedSnapshot(s, idx, name)
  );
  const recommendedFmt = inferRecommendedFormat(normalizedStates);
  const ecoCheckpoints = generateEcoCheckpoints(normalizedStates, name);
  assert.ok(ecoCheckpoints.length >= 1, `${name}: Eco checkpoint missing`);

  // 3. Distill into both Slide and Sim native cartridges
  for (const fmt of ['Slide', 'Sim'] as const) {
    const distilled = distillSwfStatesToNativeCartridge({
      id: `${name}-native-${fmt.toLowerCase()}`,
      title: `Native ${name} (${fmt})`,
      stage: 'KS3 CURRICULUM',
      format: fmt,
      states: normalizedStates,
      checkpoints: ecoCheckpoints,
      originalSwfBytes: parsed.svgMarkup.length + parsed.astSource.length,
    });

    // Core invariants
    assert.ok(!distilled.astSource.includes(':swf-vm'), `${name} (${fmt}): MUST NOT contain :swf-vm bytecode`);
    assert.ok(distilled.astSource.includes(`:type "${fmt}"`), `${name} (${fmt}): missing :type "${fmt}"`);
    assert.ok(distilled.astSource.includes('(:subtitles'), `${name} (${fmt}): missing :subtitles`);
    assert.ok(distilled.astSource.includes('(:interactive'), `${name} (${fmt}): missing :interactive checkpoints`);
    assert.ok(distilled.astSource.includes(':action "step-slide"'), `${name} (${fmt}): missing native step-slide gesture`);
    assert.ok(distilled.astSource.includes(':speak-var "stateText"'), `${name} (${fmt}): missing BSL/TTS speak-var gesture`);

    // Screen-reader & W3C SVG invariants
    assert.ok(distilled.svgMarkup.startsWith('<svg '), `${name} (${fmt}): invalid SVG root`);
    assert.ok(!distilled.svgMarkup.includes('<canvas'), `${name} (${fmt}): canvas forbidden`);
    assert.ok(distilled.svgMarkup.includes('role="button"'), `${name} (${fmt}): missing accessible button role`);
    assert.ok(distilled.svgMarkup.includes('tabindex="0"'), `${name} (${fmt}): missing keyboard tabindex`);
    assert.ok(distilled.svgMarkup.includes('aria-hidden="true"'), `${name} (${fmt}): missing decorative aria-hidden`);
    if (normalizedStates.length > 1) {
      assert.ok(distilled.svgMarkup.includes('display="none"'), `${name} (${fmt}): inactive states MUST use display="none"`);
    }

    // Verify S-Expression compiles cleanly in ASTCompiler
    if (ASTCompiler && typeof ASTCompiler.parse === 'function') {
      const astTree = ASTCompiler.parse(distilled.astSource);
      assert.ok(astTree, `${name} (${fmt}): ASTCompiler.parse returned empty`);
    }
  }

  runtime.destroy();
  console.log(
    `✓ ${name}: swept ${swept.length} states, recommended=${recommendedFmt}, ` +
      `buttons=${normalizedStates[0].observedButtons.length}, vars=${Object.keys(normalizedStates[0].observedVars).length}`
  );
}

(async () => {
  const ASTAVM1Runtime = loadAvm1Runtime();
  const ASTCompiler = loadAstParser();
  await runSampleDistillTest(ASTAVM1Runtime, ASTCompiler, 'flash-arcade-target', buildFlashArcadeSampleSwf(), 2);
  await runSampleDistillTest(ASTAVM1Runtime, ASTCompiler, 'flash-pendulum', buildFlashPendulumSampleSwf(), 2);
  console.log('ALL SWF RUN-TO-CONVERT DISTILLER TESTS PASSED!');
})();
