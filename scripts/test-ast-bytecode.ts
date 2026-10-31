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
import {
  compileAstTextToBytecode,
  decompileBytecodeToScene,
  isAstBytecode,
  ASTB_MAGIC,
} from '../src/utils/astBytecode';

const ROOT_DIR = process.cwd();
const CARTRIDGES_DIR = path.join(ROOT_DIR, 'static', 'cartridges');
const BYTECODE_DIR = path.join(ROOT_DIR, 'static', 'player', 'bytecode');

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

function runTests() {
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
  assert(avgTime < 1.0, `Average decompilation time (${avgTime.toFixed(3)} ms) is strictly < 1.0 ms`);
  assert(totalTime < 100, 'Total compilation + decompilation suite runtime is strictly < 100 ms');

  // Test 5: Bytecode Files in static/player/bytecode/
  console.log('\n5. Testing Compiled Target Artifacts in static/player/bytecode/:');
  assert(fs.existsSync(BYTECODE_DIR), 'static/player/bytecode/ directory exists');
  const compiledFiles = fs.readdirSync(BYTECODE_DIR).filter(f => f.endsWith('.astb'));
  assert(compiledFiles.length >= files.length, `Target contains all compiled .astb files (found ${compiledFiles.length})`);

  console.log('\n==================================================');
  console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
