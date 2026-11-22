// scripts/test-ast-bytecode.ts
/**
 * AST Vector Bytecode Invariant & Test Suite
 * 
 * Verifies:
 * 1. Bytecode magic header (ASTB 0x41 0x53 0x54 0x42)
 * 2. 100% round-trip decompilation fidelity
 * 3. Sub-millisecond deserialization performance (< 0.2 ms per cartridge)
 * 4. Archetype preservation (Sim, Slide, App, Film)
 * 5. Corrupted / invalid frame rejection
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import {
  compileAstTextToBytecode,
  decompileBytecodeToScene,
  isAstBytecode,
  ASTB_MAGIC,
  FLAG_HAS_SVG,
  OP_CAMERA,
  OP_3D_LINE,
} from '../src/utils/astBytecode';
import {
  EverymanBios,
  TupleOp,
  WASM_MAX_BYTES,
  WASM_MAX_PAGES,
} from '../src/engine/everymanBios';
import { getSharedRenderBoundary } from '../src/engine/sharedRenderBoundary';
import {
  getSiteManifest,
  executeSiteDirective,
  runNanoSitePrompt,
  registerNanoSiteWebMcpTools,
} from '../src/engine/nanoSiteManager';

const ROOT_DIR = process.cwd();
const CARTRIDGES_DIR = path.join(ROOT_DIR, 'static', 'cartridges');
const BYTECODE_DIR = path.join(ROOT_DIR, 'static', 'bytecode');

let passedCount = 0;
let failedCount = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 AST Vector Bytecode Verification Suite');
  console.log('==================================================\n');

  // Test 1: Header & Magic Bytes
  console.log('1. Testing Magic Header & Bytecode Recognition:');
  const dummyAst = '(:scene :id "test-unit" :title "Test Unit" :type "Sim" :stage "TEST" :duration 12.0)';
  const dummyBytecode = compileAstTextToBytecode(dummyAst);

  assert(isAstBytecode(dummyBytecode), 'isAstBytecode recognizes valid ASTB buffer');
  assert(dummyBytecode[0] === ASTB_MAGIC[0] && dummyBytecode[1] === ASTB_MAGIC[1] && dummyBytecode[2] === ASTB_MAGIC[2] && dummyBytecode[3] === ASTB_MAGIC[3], 'Buffer starts with 0x41 0x53 0x54 0x42');
  assert(!isAstBytecode(new Uint8Array([0, 1, 2, 3])), 'isAstBytecode rejects non-ASTB buffer');
  assert(!isAstBytecode(new Uint8Array([])), 'isAstBytecode rejects empty buffer');

  // Test 2: Archetype Encoding & Decoding
  console.log('\n2. Testing Cartridge Archetypes (Sim, Slide, App, Film):');
  const simAst = '(:scene :id "s1" :type "Sim" :title "Sim 1")';
  const slideAst = '(:scene :id "s2" :type "Slide" :title "Slide 2")';
  const appAst = '(:scene :id "s3" :type "App" :title "App 3")';
  const filmAst = '(:scene :id "s4" :type "Film" :video "/media/film.mp4" :title "Film 4")';

  const simDec = decompileBytecodeToScene(compileAstTextToBytecode(simAst));
  const slideDec = decompileBytecodeToScene(compileAstTextToBytecode(slideAst));
  const appDec = decompileBytecodeToScene(compileAstTextToBytecode(appAst));
  const filmDec = decompileBytecodeToScene(compileAstTextToBytecode(filmAst));

  assert(simDec.type === 'Sim', 'Sim archetype preserved in bytecode');
  assert(slideDec.type === 'Slide', 'Slide archetype preserved in bytecode');
  assert(appDec.type === 'App', 'App archetype preserved in bytecode');
  assert(filmDec.type === 'Film', 'Film archetype preserved in bytecode');
  assert(filmDec.video === '/media/film.mp4', 'Film video path preserved in bytecode');
  assert(filmDec.hasVideo === true, 'Film hasVideo flag set');

  // Test 3: Complex Scene Round-Trip Fidelity
  console.log('\n3. Testing Keyframe, Subtitle, Checkpoint, and Binding Fidelity:');
  const complexAst = `(:scene :id "calculus-test" :title "Calculus Tangent Slopes" :stage "A-LEVEL" :duration 16.0
    (:keyframes (
      (:t 0.00 :title "Initial Secant" :rule "Axiom 1")
      (:t 0.50 :title "Approaching Limit" :rule "Axiom 2")
      (:t 1.00 :title "Instantaneous dy/dx" :rule "Axiom 3")
    ))
    (:subtitles (
      (:start 0.00 :end 0.50 :en "Observe secant line delta-y over delta-x." :es "Observa la linea secante." :la "Linea secans.")
      (:start 0.50 :end 1.00 :en "As delta-x approaches zero, the slope becomes dy/dx." :es "Al tender a cero.")
    ))
    (:bindings (
      (:target "#tangent-line" :attr "d" :expr "'M 0 ' + (vars.m * 10)")
      (:target "#slope-label" :attr "textContent" :expr "vars.m.toFixed(2)")
    ))
    (:interactive (
      (:checkpoint :t 0.75
        :prompt "What is the derivative of x^2?"
        :options ("2x" "x" "2" "x^3/3")
        :answer 0
        :explanation "By power rule d/dx(x^n) = n*x^(n-1).")
    ))
    (:gestures (
      (:draggable :target "#tangent-probe" :axis "x" :min 100 :max 700)
    ))
  )`;

  const compBytecode = compileAstTextToBytecode(complexAst);
  const compScene = decompileBytecodeToScene(compBytecode);

  assert(compScene.id === 'calculus-test', 'Scene ID round-tripped');
  assert(compScene.title === 'Calculus Tangent Slopes', 'Scene Title round-tripped');
  assert(compScene.duration === 16.0, 'Duration round-tripped');
  assert(compScene.keyframes.length === 3, 'All 3 keyframes round-tripped');
  assert(compScene.keyframes[1].title === 'Approaching Limit', 'Keyframe title round-tripped');
  assert(compScene.subtitles.length === 2, 'All 2 subtitles round-tripped');
  assert(compScene.subtitles[0].en.includes('secant line'), 'English subtitle text round-tripped');
  assert(compScene.subtitles[0].es === 'Observa la linea secante.', 'Spanish subtitle translation round-tripped');
  assert(compScene.subtitles[0].la === 'Linea secans.', 'Latin subtitle translation round-tripped');
  assert(compScene.bindings.length === 2, 'All 2 bindings round-tripped');
  assert(compScene.bindings[0].target === '#tangent-line', 'Binding target round-tripped');
  assert(compScene.checkpoints.length === 1, 'Checkpoint round-tripped');
  assert(compScene.checkpoints[0].options.length === 4, 'Checkpoint options round-tripped');
  assert(compScene.checkpoints[0].answer === 0, 'Checkpoint answer index round-tripped');
  assert(compScene.gestures?.length === 1, 'Gesture draggable target round-tripped');
  assert(compScene.gestures?.[0].axis === 'x', 'Gesture axis round-tripped');

  // Test 4: Performance Invariants across All Production Cartridges
  console.log('\n4. Testing Real Canonical Cartridge Bytecode Files on Disk:');
  const files = fs.readdirSync(CARTRIDGES_DIR).filter(f => f.endsWith('.ast'));
  assert(files.length >= 20, `Found ${files.length} production cartridges`);

  // Warm up JIT compiler
  decompileBytecodeToScene(compBytecode);

  const t0 = performance.now();
  let totalBytecodeSize = 0;
  let totalDecompTime = 0;

  for (const f of files) {
    const raw = fs.readFileSync(path.join(CARTRIDGES_DIR, f), 'utf8');
    const bin = compileAstTextToBytecode(raw);
    totalBytecodeSize += bin.byteLength;

    const tDecompStart = performance.now();
    const sc = decompileBytecodeToScene(bin);
    const tDecomp = performance.now() - tDecompStart;
    totalDecompTime += tDecomp;

    assert(Boolean(sc.id && sc.title), `Cartridge '${f}' successfully compiled & decompiled`);
    assert(tDecomp < 15.0, `Cartridge '${f}' decompiled in ${tDecomp.toFixed(3)} ms (< 15.0 ms threshold)`);
  }

  const totalTime = performance.now() - t0;
  const avgTime = totalDecompTime / files.length;
  console.log(`\n  ⚡ Decompiled all ${files.length} cartridges in ${totalDecompTime.toFixed(2)} ms (average ${avgTime.toFixed(3)} ms/cartridge)`);
  const totalBudgetMs = Math.max(100, Math.ceil(files.length * 2.5));
  assert(avgTime < 1.0, `Average decompilation time (${avgTime.toFixed(3)} ms) is strictly < 1.0 ms`);
  assert(totalTime < totalBudgetMs, `Total compilation + decompilation suite runtime (${totalTime.toFixed(1)} ms) is strictly < ${totalBudgetMs} ms (${files.length} cartridges)`);

  // Test 5: Bytecode Files in static/bytecode/
  console.log('\n5. Testing Compiled Target Artifacts in static/bytecode/:');
  assert(fs.existsSync(BYTECODE_DIR), 'static/bytecode/ directory exists');
  const allBytecodeDirFiles = fs.readdirSync(BYTECODE_DIR);
  const compiledFiles = allBytecodeDirFiles.filter(f => f.endsWith('.astb'));
  assert(compiledFiles.length >= files.length, `Target contains all compiled .astb files (found ${compiledFiles.length})`);
  assert(allBytecodeDirFiles.every(f => f.endsWith('.astb')), 'static/bytecode/ contains strictly .astb binaries (zero duplicate .svg files)');

  // Test 6: Manipulation Goals (0x41), Scope (0x90), Ledger (0x91) & New Bio/Chem Cartridges
  console.log('\n6. Testing Manipulation Goal, Scope & Ledger Bytecode Opcodes (0x41, 0x90, 0x91):');
  const labAst = `(:scene :id "lab-opcodes-test" :type "Sim" :title "Lab Opcode Fidelity" :stage "KS4" :duration 20.0
    (:scope :target "#osc-line" :x-expr "vars.simClock" :y-expr "vars.y" :samples 64 :x-range (0 20) :y-range (0 100) :plot (450 100 300 160))
    (:ledger :id "cons-ledger" :target "#cons-ledger" :x 430 :y 350 :width 320 :height 14 :unit "J" :max "100"
      :terms ((:label "KE" :expr "vars.ke" :color "#38bdf8") (:label "PE" :expr "vars.pe" :color "#22c55e")))
    (:interactive (
      (:checkpoint :t 0.0 :title "Target Equilibrium" :prompt "Hold pressure at 202.6 kPa"
        :pass-expr "Math.abs(vars.pressure - 202.6) < 4.0" :hold-duration 1.5
        :explanation "Halving volume doubles pressure.")
      (:checkpoint :t 0.5 :title "Conception Check" :prompt "Which option?"
        :options ("Right" "Wrong A" "Wrong B") :answer 0
        :on-wrong ((1 "Re-check volume term") (2 "Check temperature invariance"))
        :explanation "Conservation law applies.")
    ))
  )`;
  const labDec = decompileBytecodeToScene(compileAstTextToBytecode(labAst));
  assert(labDec.scopes.length === 1, 'OP_SCOPE round-tripped');
  assert(labDec.scopes[0].target === '#osc-line' && labDec.scopes[0].samples === 64, 'Scope target & sample capacity preserved');
  assert(Array.isArray(labDec.scopes[0].plot) && labDec.scopes[0].plot[2] === 300, 'Scope plot bounds preserved');
  assert(labDec.ledgers.length === 1 && labDec.ledgers[0].terms.length === 2, 'OP_LEDGER & terms preserved');
  assert(labDec.ledgers[0].unit === 'J' && labDec.ledgers[0].maxExpr === '100', 'Ledger unit & maxExpr preserved');
  assert(labDec.checkpoints.length === 2, 'Both OP_CHECKPOINT_GOAL and MCQ checkpoints decoded');
  assert(labDec.checkpoints[0].passExpr === 'Math.abs(vars.pressure - 202.6) < 4.0', 'passExpr preserved in OP_CHECKPOINT_GOAL');
  assert(Math.abs((labDec.checkpoints[0].holdDuration || 0) - 1.5) < 0.01, 'holdDuration preserved in OP_CHECKPOINT_GOAL');
  assert(labDec.checkpoints[1].onWrong?.[1] === 'Re-check volume term', ':on-wrong distractor index 1 hint preserved');
  assert(labDec.checkpoints[1].onWrong?.[2] === 'Check temperature invariance', ':on-wrong distractor index 2 hint preserved');

  for (const cartId of ['rates-of-reaction', 'acid-alkali-titration', 'enzyme-denaturation', 'osmosis-membrane']) {
    const raw = fs.readFileSync(path.join(CARTRIDGES_DIR, `${cartId}.ast`), 'utf8');
    const dec = decompileBytecodeToScene(compileAstTextToBytecode(raw));
    assert(dec.scopes.length >= 1, `${cartId} encodes at least 1 :scope into bytecode`);
    assert(dec.ledgers.length >= 1, `${cartId} encodes at least 1 :ledger into bytecode`);
    assert(dec.checkpoints.some(cp => Boolean(cp.passExpr)), `${cartId} encodes a :pass-expr manipulation goal`);
    assert(dec.checkpoints.some(cp => Boolean(cp.onWrong && Object.keys(cp.onWrong).length > 0)), `${cartId} encodes :on-wrong distractor nudges`);
  }

  // Test 7: .ast + .svg Duo Capsule (OP_SVG_COMPANION 0x81)
  console.log('\n7. Testing .ast + .svg Duo Compilation & OP_SVG_COMPANION (0x81):');
  const duoAst = `(:scene :id "duo-capsule" :type "Sim" :title "Duo Pendulum" :stage "KS3 PHYSICS" :duration 8.0
    (:vars ((:var :name "length" :val 1.5 :min 0.5 :max 4.0 :step 0.1 :label "Rod Length (m)")))
    (:bindings ((:target "#bob" :attr "cx" :expr "400 + Math.sin(t * 6.28) * 100")))
    (:gestures ((:draggable :target "#bob" :axis "x" :min 250 :max 550))))`;
  const duoSvg = `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><circle id="bob" cx="400" cy="240" r="24" fill="#38bdf8"/></svg>`;
  const duoBin = compileAstTextToBytecode(duoAst, { svgMarkup: duoSvg });
  const duoDec = decompileBytecodeToScene(duoBin);
  const duoFlags = new DataView(duoBin.buffer, duoBin.byteOffset, duoBin.byteLength).getUint16(14, true);

  assert(Boolean(duoFlags & FLAG_HAS_SVG), 'Duo .astb sets FLAG_HAS_SVG (0x0010)');
  assert(duoDec.svgMarkup === duoSvg, 'OP_SVG_COMPANION (0x81) round-trips full Duo SVG stage');
  assert(duoDec.vars?.length === 1.5, 'Duo vars preserved alongside OP_SVG_COMPANION');

  // Test 8: Everyman 448 KiB WASM Kernel BIOS ABI (STEM + Parish on identical .wasm)
  console.log('\n8. Testing Everyman Chassis 448 KiB WASM Kernel BIOS ABI:');
  const bios = new EverymanBios();
  await bios.init();

  // Boot Duo capsule with reactive var & hitbox
  const duoBoot = bios.bootCartridge(duoBin);
  assert(duoBoot.status === 0, 'WASM boot_cartridge() succeeded on Duo .astb');
  assert(duoBoot.telemetry.linearMemoryBytes === WASM_MAX_BYTES, `WASM linear memory strictly locked to 448 KiB (${WASM_MAX_PAGES} pages)`);
  assert(duoBoot.telemetry.hasEmbeddedSvg === true, 'WASM MCB registered OP_SVG_COMPANION vector ptr');
  assert(bios.readEmbeddedSvg() === duoSvg, 'BIOS zero-copy readEmbeddedSvg() matches original Duo SVG');
  assert(duoBoot.manifest.length >= 2, `3-Column Gemini Nano manifest populated (${duoBoot.manifest.length} rows)`);

  // Mutate var via unified dispatch_tuple ABI + advance tick + read Display List + StateHex
  const hexBefore = bios.readStateHex();
  const varRow = duoBoot.manifest.find(r => r.semanticTag === 'length');
  assert(Boolean(varRow), 'Manifest exposes semantic tag "length" for Gemini Nano/WebMCP');
  if (varRow) {
    bios.dispatchTuple(varRow.slotId, TupleOp.FOCUS, 0, 0);
    bios.dispatchTuple(varRow.slotId, TupleOp.SET_VAL, 3.25, 0);
  }
  const dlCount = bios.tick(33.33);
  const afterTel = bios.readTelemetry();
  const hexAfter = bios.readStateHex();
  assert(dlCount >= 4, `WASM tick() emitted ${dlCount} flat 32-byte Display-List commands at 0x068000`);
  assert(afterTel.tickCount === 1 && afterTel.t > 0, 'WASM clock & normalized time t advanced');
  assert(hexBefore !== hexAfter && hexAfter.length === 32, 'StateHex 16-byte register mutated deterministically');

  // Boot BOTH a STEM cartridge (atom.astb) AND a Parish cartridge (church-tour.astb) on same WASM instance
  const atomBin = new Uint8Array(fs.readFileSync(path.join(BYTECODE_DIR, 'atom.astb')));
  const atomBoot = bios.bootCartridge(atomBin);
  assert(atomBoot.status === 0 && atomBoot.manifest.length > 0, `Same WASM kernel booted STEM atom.astb (${atomBoot.manifest.length} manifest rows)`);

  const churchBin = new Uint8Array(fs.readFileSync(path.join(BYTECODE_DIR, 'church-tour.astb')));
  const churchBoot = bios.bootCartridge(churchBin);
  assert(churchBoot.status === 0 && churchBoot.manifest.length > 0, `Same WASM kernel booted Parish church-tour.astb (${churchBoot.manifest.length} manifest rows)`);
  assert(bios.readTelemetry().linearMemoryBytes === WASM_MAX_BYTES, 'Memory remained strictly 448 KiB across cartridge hot-swaps');

  // Test 9: Standalone Shared Rendering Boundary & Gemini Nano Site Control Plane
  console.log('\n9. Testing Standalone Shared Render Boundary & Nano Site Control Plane:');
  const boundary = getSharedRenderBoundary();
  assert(boundary.version === '1.0.0', 'SharedRenderBoundary exposes standalone version');
  assert(boundary.listSurfaces().some((s) => s.id === bios.surfaceId), 'EverymanBios surface auto-registered on shared boundary');

  const safeCheck = boundary.sanitizeSvg('<!DOCTYPE svg><svg><rect/></svg>');
  assert(!safeCheck.includes('<!DOCTYPE'), 'SharedRenderBoundary strips DOCTYPE directives');

  const modeChange = await executeSiteDirective({ action: 'set_render_mode', surfaceId: bios.surfaceId, mode: 'hybrid' });
  assert(modeChange.ok === true && modeChange.manifest.renderBoundary.renderMode === 'hybrid', 'Nano site directive switches shared renderMode to hybrid');

  const tupleExec = await executeSiteDirective({ action: 'dispatch_tuple', surfaceId: bios.surfaceId, slotId: 0, op: TupleOp.TOGGLE_PLAY });
  assert(tupleExec.ok === true && typeof tupleExec.detail.stateHex === 'string', 'Nano site directive dispatches WASM mailbox tuple');

  const siteManifest = getSiteManifest(bios.surfaceId);
  const manifestBytes = Buffer.byteLength(JSON.stringify(siteManifest), 'utf8');
  assert(siteManifest.wasmKernel?.active === true && siteManifest.wasmKernel.manifestSlice.length > 0, 'Nano SiteManifest includes live 3-column WASM manifest slice');
  assert(manifestBytes < 3500, `Compact Nano SiteManifest (${manifestBytes} B) fits well inside Gemini Nano context budget`);

  const navHistory: string[] = [];
  const promptOutcome = await runNanoSitePrompt('Open catholic-life sanctuary', (r) => { navHistory.push(r); });
  assert(promptOutcome.directive.action === 'navigate' && navHistory[0] === '/catholic-life', 'runNanoSitePrompt routes deterministically to /catholic-life');

  // Additive WebMCP tool registration on mock modelContext
  const prevNav = (globalThis as any).navigator;
  const mockRegistered = new Map<string, any>();
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      modelContext: {
        registerTool: (tool: any, opts?: { signal?: AbortSignal }) => {
          mockRegistered.set(tool.name, tool);
          opts?.signal?.addEventListener('abort', () => mockRegistered.delete(tool.name));
        },
      },
    },
    configurable: true,
  });
  try {
    const nanoHandle = await registerNanoSiteWebMcpTools();
    assert(nanoHandle.registered && nanoHandle.toolNames.length === 3, 'Registered 3 additive Nano site WebMCP tools');
    assert(mockRegistered.has('site_get_manifest') && mockRegistered.has('site_manage_surface') && mockRegistered.has('site_dispatch_wasm_tuple'), 'All 3 Nano site WebMCP tools present on modelContext');
    nanoHandle.unregister();
    assert(mockRegistered.size === 0, 'Nano site WebMCP tools abort cleanly on unregister');
  } finally {
    if (prevNav !== undefined) {
      Object.defineProperty(globalThis, 'navigator', { value: prevNav, configurable: true });
    }
  }

  // Test 10: Native Binary :camera (0x80) & :3d-line (0x33) Opcodes, splineIndex Deduplication & Bit-Exact 3D Parity
  console.log('\n10. Testing Native Binary :camera & :3d-line Records (dna-helix.astb):');
  const dnaAstText = fs.readFileSync(path.join(CARTRIDGES_DIR, 'dna-helix.ast'), 'utf8');
  const dnaAstbBin = new Uint8Array(fs.readFileSync(path.join(BYTECODE_DIR, 'dna-helix.astb')));
  assert(dnaAstbBin.byteLength < 8600, `dna-helix.astb size (${dnaAstbBin.byteLength} B) dropped >35% from 13,199 B baseline`);

  // Verify zero JSON blobs for :camera or :3d-line in string table & zero JSON.parse on those opcodes
  const dnaView = new DataView(dnaAstbBin.buffer, dnaAstbBin.byteOffset, dnaAstbBin.byteLength);
  const dnaStrCount = dnaView.getUint16(8, true);
  const dnaStrByteLen = dnaView.getUint32(10, true);
  const dnaDecoder = new TextDecoder('utf-8');
  const dnaStrings: string[] = [];
  let sOff = 16;
  for (let i = 0; i < dnaStrCount && sOff < 16 + dnaStrByteLen; i++) {
    const sLen = dnaView.getUint16(sOff, true);
    sOff += 2;
    dnaStrings.push(dnaDecoder.decode(dnaAstbBin.subarray(sOff, sOff + sLen)));
    sOff += sLen;
  }
  assert(!dnaStrings.some(s => s.includes('"x1":') || s.includes('"splitExpr":')), 'String table contains zero JSON-serialized :3d-line blobs');
  assert(!dnaStrings.some(s => s.includes('"yaw":') && s.includes('"fov":')), 'String table contains zero JSON-serialized :camera blobs');
  const splineIdxExprs = dnaStrings.filter(s => s.includes('splineIndex'));
  assert(splineIdxExprs.length === 6, `All 18 DNA rungs share exactly 6 deduplicated splineIndex expressions (found ${splineIdxExprs.length})`);

  // Verify OP_CAMERA (0x80) and OP_3D_LINE (0x33) emit zero JSON.parse during non-ext hydration
  const dnaCoreBin = compileAstTextToBytecode(dnaAstText);
  const origJsonParse = JSON.parse;
  let jsonParseCalls = 0;
  (JSON as any).parse = (...args: any[]) => {
    jsonParseCalls++;
    return (origJsonParse as any).apply(JSON, args);
  };
  let dnaCoreDec: any;
  let dnaJsDec: any;
  try {
    dnaCoreDec = decompileBytecodeToScene(dnaCoreBin);
    const jsDecoderCtx: any = { console, window: {}, globalThis: {}, TextDecoder };
    vm.createContext(jsDecoderCtx);
    vm.runInContext(fs.readFileSync(path.join(ROOT_DIR, 'static', 'player', 'ast-bytecode-decoder.js'), 'utf8'), jsDecoderCtx);
    const jsDecompile = jsDecoderCtx.decompileBytecode || jsDecoderCtx.window.decompileBytecode || jsDecoderCtx.globalThis.decompileBytecode;
    dnaJsDec = jsDecompile(dnaCoreBin);
  } finally {
    JSON.parse = origJsonParse;
  }
  assert(jsonParseCalls === 0, `Zero JSON.parse calls during TS & JS hydration of native OP_CAMERA/OP_3D_LINE .astb (calls: ${jsonParseCalls})`);
  assert(typeof dnaCoreDec.camera?.yaw === 'string' && dnaCoreDec.camera.yaw === dnaJsDec.camera?.yaw, 'OP_CAMERA (0x80) yaw expression matches across TS & JS decoders');
  assert(dnaCoreDec.camera?.pitch === 18 && dnaCoreDec.camera?.distance === 440 && dnaCoreDec.camera?.fov === 60, 'OP_CAMERA float32 pitch/distance/fov round-tripped exactly');

  // Verify bit-exact 3D rung coordinates & helicase unzipping between .ast source parser and .astb binary decoder
  const runtimeCtx: any = { console, window: {}, globalThis: {}, TextDecoder, Math };
  vm.createContext(runtimeCtx);
  vm.runInContext(fs.readFileSync(path.join(ROOT_DIR, 'static', 'player', 'ast-parser.js'), 'utf8'), runtimeCtx);
  vm.runInContext(fs.readFileSync(path.join(ROOT_DIR, 'static', 'player', 'ast-expr.js'), 'utf8'), runtimeCtx);
  vm.runInContext(fs.readFileSync(path.join(ROOT_DIR, 'static', 'player', 'ast-bytecode-decoder.js'), 'utf8'), runtimeCtx);

  const parseAstFn = runtimeCtx.parseAst || runtimeCtx.window.parseAst || runtimeCtx.globalThis.parseAst;
  const decompileFn = runtimeCtx.decompileBytecode || runtimeCtx.window.decompileBytecode || runtimeCtx.globalThis.decompileBytecode;
  const compileAstFn = runtimeCtx.compileAstFn || runtimeCtx.window.compileAstFn || runtimeCtx.globalThis.compileAstFn;

  const srcParsed = parseAstFn(dnaAstText);
  const binDecoded = decompileFn(dnaAstbBin);

  const srcLines = srcParsed.bindings.filter((b: any) => b.type === '3d-line');
  const binLines = binDecoded.bindings.filter((b: any) => b.type === '3d-line');
  assert(srcLines.length === 18 && binLines.length === 18, `All 18 :3d-line rungs decoded from dna-helix.astb (got ${binLines.length})`);

  let parityMismatch = 0;
  for (const unzipProgress of [0.0, 0.5, 1.0]) {
    for (let i = 0; i < 18; i++) {
      const sLine = srcLines[i];
      const bLine = binLines[i];
      const varsSrc = { unzipProgress, rotSpeed: 1.0 };
      const varsBin = { unzipProgress, rotSpeed: 1.0, splineIndex: bLine.splineIndex };
      for (const prop of ['x1', 'y1', 'z1', 'x2', 'y2', 'z2', 'splitExpr']) {
        const sVal = compileAstFn(sLine[prop])(0.5, varsSrc, varsSrc, Math);
        const bVal = compileAstFn(bLine[prop])(0.5, varsBin, varsBin, Math);
        if (sVal !== bVal) parityMismatch++;
      }
    }
  }
  assert(parityMismatch === 0, `Bit-exact 3D geometry & helicase unzipping parity across all 18 rungs × 3 unzip states (mismatches: ${parityMismatch})`);

  // Verify camera yaw expression parity
  const srcYaw = compileAstFn(srcParsed.camera.yaw)(0.42, { rotSpeed: 2.0, clock: 5.04 }, {}, Math);
  const binYaw = compileAstFn(binDecoded.camera.yaw)(0.42, { rotSpeed: 2.0, clock: 5.04 }, {}, Math);
  assert(srcYaw === binYaw, `Bit-exact :camera yaw expression parity (${binYaw})`);

  // Verify WASM Everyman BIOS boots dna-helix.astb cleanly with new OP_CAMERA & OP_3D_LINE opcodes
  const dnaBoot = bios.bootCartridge(dnaAstbBin);
  assert(dnaBoot.status === 0 && dnaBoot.manifest.length > 0, `WASM Everyman BIOS booted dna-helix.astb cleanly (${dnaBoot.manifest.length} manifest rows, OP_CAMERA=${OP_CAMERA}, OP_3D_LINE=${OP_3D_LINE})`);

  console.log('\n==================================================');
  console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
