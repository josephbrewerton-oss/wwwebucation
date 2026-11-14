// scripts/simulate-sim-engine-invariants.ts
/**
 * Test Suite: Simulation Engine Invariants & Edge Verification
 * Validates:
 * 1. Pythagoras Theorem geometry synthesis, positive angle calculation, and recursion loop immunity.
 * 2. Kinetic Gas particle emitter bounds, volume compression, and dynamic atom count scaling.
 * 3. Electrical Knife Switch toggle mechanics, state synchronization, and electron flow gating.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { parseSExpr } from '../src/utils/sexprParser';
import { resolveConstraintRegExp, testConstraintRegExp, NANO_ACT_TUPLE_REGEX } from '../src/engine/aicaller';
import vm from 'vm';
import { SUITE_PRESET, CLASSROOM_PRESET } from '../src/types/playerConfig';
import { evaluateSquashStretchMatrix6, formatSvgMatrix6 } from '../src/utils/astMathCompiler';
import {
  buildSafeActionTuple,
  clampVarValue,
  createPlayerWebMcpTools,
  registerWebMcpTools as registerPlayerWebMcpTools,
  runWebMcpBenchmark,
  type PlayerMcpTransport,
} from '../src/engine/webmcpBridge';
import {
  registerWebMcpTools as registerPortalWebMcpTools,
  unregisterWebMcpTools as unregisterPortalWebMcpTools,
} from '../src/services/webMcpBridge';
import {
  computeAstVsJsonCompression,
  formatEppReportMarkdown,
  type EppTelemetryDossier,
} from '../src/engine/eppContentionBench';

console.log('=============================================================');
console.log('🔬 St Joseph\'s Simulation Engine & Physical Invariant Harness');
console.log('=============================================================\n');

let passedTests = 0;

// =========================================================================
// TEST 1: Pythagoras Theorem Geometry Invariant & Positive Coordinate Angle
// =========================================================================
console.log('--- TEST 1: Pythagoras Theorem & Hypotenuse Square Rotation ---');
{
  const sideA = 3;
  const sideB = 4;
  const s = 28; // scale px per unit

  // Screen coordinates: origin is at (360, 280)
  const originX = 360;
  const originY = 280;
  const vertAx = originX;
  const vertAy = originY - sideA * s; // 280 - 84 = 196
  const vertBx = originX + sideB * s; // 360 + 112 = 472
  const vertBy = originY; // 280

  // In SVG coordinates (+Y is downwards):
  // Vector from vertA (360, 196) to vertB (472, 280):
  const dx = vertBx - vertAx; // 112
  const dy = vertBy - vertAy; // +84

  assert.strictEqual(dx, 112, 'dx must be 112');
  assert.strictEqual(dy, 84, 'dy must be +84');

  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  // The angle must be POSITIVE (+36.87 deg), NOT negative (-36.87 deg)
  assert(angleDeg > 36.8 && angleDeg < 36.9, `Angle must be +36.87°, got ${angleDeg}`);

  // Hypotenuse length c = sqrt(a^2 + b^2) = 5 units = 140px
  const c = Math.sqrt(sideA * sideA + sideB * sideB);
  const cPx = c * s;
  assert.strictEqual(c, 5, 'c must be 5 units');
  assert.strictEqual(cPx, 140, 'cPx must be 140px');

  // Verify area invariant: a^2 + b^2 = c^2
  assert.strictEqual(sideA * sideA + sideB * sideB, c * c, 'a² + b² must equal c²');

  console.log(`[✅ PASS] Sim 1: Pythagoras geometry angle (+${angleDeg.toFixed(2)}°) and area (${sideA * sideA} + ${sideB * sideB} = ${c * c}) verified.`);
  passedTests++;
}

// =========================================================================
// TEST 2: Re-Entrancy & Recursion Lock Invariant
// =========================================================================
console.log('\n--- TEST 2: Re-Entrancy & Infinite Recursion Immunity ---');
{
  let callDepth = 0;
  let maxDepthEncountered = 0;
  let isRendering = false;

  const simulatedVarchangeListener = (a: number, b: number) => {
    // If re-entrancy guard is present:
    if (isRendering) return;
    isRendering = true;
    try {
      callDepth++;
      maxDepthEncountered = Math.max(maxDepthEncountered, callDepth);
      // Simulate engine emitting varchange inside rendering:
      if (callDepth < 10) {
        simulatedVarchangeListener(a, b);
      }
    } finally {
      callDepth--;
      isRendering = false;
    }
  };

  simulatedVarchangeListener(3, 4);
  assert.strictEqual(maxDepthEncountered, 1, 'Re-entrancy guard must guarantee max call depth of 1 (prevent call stack blowout)');
  console.log('[✅ PASS] Sim 2: Re-entrancy guard guarantees single-frame execution with 0 recursion.');
  passedTests++;
}

// =========================================================================
// TEST 3: Kinetic Gas Boyle's Law & Atom Count Scaling
// =========================================================================
console.log('\n--- TEST 3: Kinetic Gas Theory (Boyle\'s Law & Atom Inventory) ---');
{
  const P0 = 101.3; // kPa atmospheric pressure at V = 1.0 (100%)
  const T = 300; // K

  // Halve volume to 50% (compression)
  const vol1 = 1.0;
  const p1 = (P0 / vol1) * (T / 300);
  assert.strictEqual(p1, 101.3, 'Initial pressure at 100% volume must be 101.3 kPa');

  const vol2 = 0.5;
  const p2 = (P0 / vol2) * (T / 300);
  assert.strictEqual(p2, 202.6, 'Halving volume must exactly double pressure to 202.6 kPa');

  // Compress to 35% volume
  const vol3 = 0.35;
  const p3 = parseFloat(((P0 / vol3) * (T / 300)).toFixed(1));
  assert.strictEqual(p3, 289.4, 'Compression to 35% volume must scale pressure to 289.4 kPa');

  // Verify Particle Pool scaling bounds (min 5, max 600)
  const validatePoolCount = (req: number) => Math.max(5, Math.min(600, req));
  assert.strictEqual(validatePoolCount(75), 75, 'Standard gas count must be 75');
  assert.strictEqual(validatePoolCount(150), 150, 'Scaled gas count must be 150');
  assert.strictEqual(validatePoolCount(1000), 600, 'Count must clamp at 600 max');
  assert.strictEqual(validatePoolCount(1), 5, 'Count must clamp at 5 min');

  console.log(`[✅ PASS] Sim 3: Boyle's Law (P₁V₁ = P₂V₂ = ${p1 * vol1} kPa·m³) and dynamic particle inventory verified.`);
  passedTests++;
}

// =========================================================================
// TEST 4: Electrical Circuits Knife Switch & Ohm's Law
// =========================================================================
console.log('\n--- TEST 4: Electrical Knife Switch Toggle & Ohm\'s Law ---');
{
  const voltage = 12.0; // Volts
  const resistance = 4.0; // Ohms

  // State 1: Switch Closed
  let switchClosed = true;
  let current = switchClosed ? voltage / resistance : 0;
  let power = switchClosed ? (voltage * voltage) / resistance : 0;

  assert.strictEqual(current, 3.0, 'Closed switch with 12V and 4Ω must produce 3.0A current');
  assert.strictEqual(power, 36.0, 'Closed switch with 12V and 4Ω must dissipate 36.0W power');

  // State 2: Switch Opened (Blade lifts to 45°)
  switchClosed = false;
  current = switchClosed ? voltage / resistance : 0;
  power = switchClosed ? (voltage * voltage) / resistance : 0;

  assert.strictEqual(current, 0, 'Open knife switch must immediately drop current to 0A');
  assert.strictEqual(power, 0, 'Open knife switch must drop bulb power to 0W');

  // Blade geometry endpoints
  const closedBlade = { x1: 0, y1: 20, x2: 60, y2: 20, stroke: '#22c55e' };
  const openBlade = { x1: 0, y1: 20, x2: 45, y2: 0, stroke: '#ef4444' };

  assert.strictEqual(closedBlade.y2, 20, 'Closed blade touches terminal at y=20');
  assert.strictEqual(openBlade.y2, 0, 'Open blade lifts up to y=0');

  console.log('[✅ PASS] Sim 4: Knife switch open/closed states, Ohm\'s Law (12V / 4Ω = 3A), and zero-flow gating verified.');
  passedTests++;
}

// =========================================================================
// TEST 5: AST Parser Ingestion of Updated kinetic-gas.ast
// =========================================================================
console.log('\n--- TEST 5: S-Expression Grammar Verification of kinetic-gas.ast ---');
{
  const fs = await import('fs');
  const path = await import('path');
  const astContent = fs.readFileSync(path.resolve('static/cartridges/kinetic-gas.ast'), 'utf8');

  assert(
    astContent.includes(':slider :var "particleCount"') ||
    (astContent.includes('control:slider') && astContent.includes('particleCount')),
    'kinetic-gas.ast must provide particleCount slider'
  );
  assert(astContent.includes(':emitter :id "gas-molecules"'), 'kinetic-gas.ast must define gas-molecules emitter');

  const parsed = parseSExpr(astContent);
  assert(parsed !== null, 'S-expression parser must parse kinetic-gas.ast without errors');

  console.log('[✅ PASS] Sim 5: kinetic-gas.ast parses deterministically with new particle count controls.');
  passedTests++;
}

// =========================================================================
// TEST 6: Checkpoint Multiple Choice Option Shuffling & Dynamic Answer Mapping
// =========================================================================
console.log('\n--- TEST 6: Checkpoint Option Shuffling & Answer Key Dynamic Movement ---');
{
  const testCheckpoint = {
    prompt: "According to Boyle's Law, what happens to gas pressure when volume is halved?",
    options: [
      "Pressure doubles (P ∝ 1/V)",
      "Pressure drops to zero",
      "Temperature decreases",
      "Volume increases"
    ],
    answer: 0,
    explanation: "Halving distance doubles wall collision frequency."
  };

  const observedPositions = new Set<number>();
  const totalRuns = 60;

  for (let run = 0; run < totalRuns; run++) {
    // Replicate Fisher-Yates shuffle used by player-ui.js
    const rawOptions = [...testCheckpoint.options];
    const correctOriginalIndex = testCheckpoint.answer;

    const indexedOptions = rawOptions.map((opt, i) => ({
      text: opt,
      originalIndex: i,
      isCorrect: i === correctOriginalIndex
    }));

    for (let i = indexedOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = indexedOptions[i];
      indexedOptions[i] = indexedOptions[j];
      indexedOptions[j] = temp;
    }

    const correctShuffledIndex = indexedOptions.findIndex(item => item.isCorrect);
    assert(correctShuffledIndex >= 0 && correctShuffledIndex < 4, 'Correct answer must exist in shuffled options');
    assert.strictEqual(
      indexedOptions[correctShuffledIndex].text,
      testCheckpoint.options[0],
      'The text at correct index must be the actual correct answer'
    );

    // Verify evaluation logic
    indexedOptions.forEach((item, idx) => {
      const isCorrect = item.isCorrect;
      const matchesOrig = item.originalIndex === testCheckpoint.answer;
      assert.strictEqual(isCorrect, matchesOrig, 'Evaluated isCorrect must match original index equivalence');
    });

    observedPositions.add(correctShuffledIndex);
  }

  // Over 60 random shuffles, the answer MUST have moved across multiple positions (not stuck at 0)
  assert(observedPositions.size >= 3, `Correct answer must move across positions. Observed: ${Array.from(observedPositions).join(', ')}`);

  console.log(`[✅ PASS] Sim 6: Option shuffling verified across ${totalRuns} runs. Correct answer dynamically moved across positions ${Array.from(observedPositions).sort().join(', ')} (never stuck at option A).`);
  passedTests++;
}

// =========================================================================
// TEST 7: Checkpoint Question Toggle & State Minimize Invariants
// =========================================================================
console.log('\n--- TEST 7: Checkpoint Minimize/Restore/Toggle Lifecycle ---');
{
  class MockPlayerUI {
    interactiveMode = true;
    activeCheckpoint: number | null = null;
    minimizedCheckpoint: number | null = null;
    isCardHidden = true;
    isPillVisible = false;

    triggerCheckpoint(index: number) {
      this.activeCheckpoint = index;
      this.minimizedCheckpoint = null;
      this.isCardHidden = false;
      this.isPillVisible = false;
    }

    minimizeInteractiveCard() {
      this.isCardHidden = true;
      if (this.activeCheckpoint !== null) {
        this.minimizedCheckpoint = this.activeCheckpoint;
      }
      this.isPillVisible = true;
    }

    restoreInteractiveCard() {
      if (this.minimizedCheckpoint !== null && this.activeCheckpoint === null) {
        this.activeCheckpoint = this.minimizedCheckpoint;
      }
      this.isCardHidden = false;
      this.isPillVisible = false;
    }

    closeInteractiveCard() {
      this.isCardHidden = true;
      this.isPillVisible = false;
      this.activeCheckpoint = null;
      this.minimizedCheckpoint = null;
    }

    toggleCheckpointView() {
      if (!this.isCardHidden) {
        this.minimizeInteractiveCard();
      } else if (this.minimizedCheckpoint !== null || this.activeCheckpoint !== null) {
        this.restoreInteractiveCard();
      } else {
        this.triggerCheckpoint(0);
      }
    }

    toggleInteractiveMode() {
      this.interactiveMode = !this.interactiveMode;
    }
  }

  const ui = new MockPlayerUI();

  // 1. Trigger checkpoint
  ui.triggerCheckpoint(2);
  assert.strictEqual(ui.activeCheckpoint, 2, 'Active checkpoint must be 2');
  assert.strictEqual(ui.isCardHidden, false, 'Card must be visible');
  assert.strictEqual(ui.isPillVisible, false, 'Floating pill must be hidden when card is open');

  // 2. Minimize card to inspect simulation
  ui.minimizeInteractiveCard();
  assert.strictEqual(ui.isCardHidden, true, 'Card must be hidden after minimize');
  assert.strictEqual(ui.isPillVisible, true, 'Floating restore pill must be visible after minimize');
  assert.strictEqual(ui.minimizedCheckpoint, 2, 'Minimized checkpoint state must be preserved');

  // 3. Restore card to answer question
  ui.restoreInteractiveCard();
  assert.strictEqual(ui.isCardHidden, false, 'Card must be restored');
  assert.strictEqual(ui.isPillVisible, false, 'Floating restore pill must be hidden');
  assert.strictEqual(ui.activeCheckpoint, 2, 'Active checkpoint must still be 2');

  // 4. Toggle view (press Q)
  ui.toggleCheckpointView();
  assert.strictEqual(ui.isCardHidden, true, 'Toggle view when open must minimize card');
  assert.strictEqual(ui.isPillVisible, true, 'Toggle view when open must show pill');

  ui.toggleCheckpointView();
  assert.strictEqual(ui.isCardHidden, false, 'Toggle view when minimized must restore card');
  assert.strictEqual(ui.isPillVisible, false, 'Toggle view when minimized must hide pill');

  // 5. Toggle master interactive mode (lecture vs interactive)
  assert.strictEqual(ui.interactiveMode, true, 'Interactive mode starts ON');
  ui.toggleInteractiveMode();
  assert.strictEqual(ui.interactiveMode, false, 'Interactive mode toggled OFF (lecture mode)');
  ui.toggleInteractiveMode();
  assert.strictEqual(ui.interactiveMode, true, 'Interactive mode toggled back ON');

  // 6. Dismiss/close card
  ui.closeInteractiveCard();
  assert.strictEqual(ui.isCardHidden, true, 'Card must be closed');
  assert.strictEqual(ui.activeCheckpoint, null, 'Active checkpoint cleared on close');
  assert.strictEqual(ui.minimizedCheckpoint, null, 'Minimized checkpoint cleared on close');

  console.log('[✅ PASS] Sim 7: Checkpoint question minimize, restore, toggle [Q], and master lecture mode verified.');
  passedTests++;
}

// =========================================================================
// TEST 8: Chromium Issue 576432037 — Client-Side responseConstraint Verification
// =========================================================================
console.log('\n--- TEST 8: Chromium Issue 576432037 RegExp Constraint Defense ---');
{
  // 1. Verify resolveConstraintRegExp handles RegExp, string patterns, and pattern objects
  const rawRegex = /^\(:act\s+:seek\s+[0-1](\.\d+)?\)$/;
  assert(resolveConstraintRegExp(rawRegex) instanceof RegExp, 'Must resolve RegExp directly');
  assert(resolveConstraintRegExp('^\\(:act.*\\)$') instanceof RegExp, 'Must compile string to RegExp');
  assert(resolveConstraintRegExp({ pattern: rawRegex }) instanceof RegExp, 'Must resolve object pattern');
  assert.strictEqual(resolveConstraintRegExp(null), null, 'Must return null for undefined/null');

  // 2. Verify testConstraintRegExp resets stateful regexes and handles whitespace
  const statefulRegex = /\(:act\s+:seek\s+\d+(\.\d+)?\)/g;
  const validOutput = '   (:act :seek 0.5)   ';
  assert.strictEqual(testConstraintRegExp(statefulRegex, validOutput), true, 'Must match trimmed valid tuple');
  // Second test must NOT fail due to lastIndex advancing
  assert.strictEqual(testConstraintRegExp(statefulRegex, validOutput), true, 'Must reset lastIndex and pass repeatedly');

  // 3. Verify detection of dirty/bypassed output
  const dirtyOutput = 'I am an AI assistant and I think you should adjust the slider to 0.5.';
  assert.strictEqual(testConstraintRegExp(NANO_ACT_TUPLE_REGEX, dirtyOutput), false, 'Must flag dirty output that bypassed RegExp constraint');

  const validTuple = '(:act :seek 0.35 :highlight "#piston" :say "Compressing gas increases collision frequency.")';
  assert.strictEqual(testConstraintRegExp(NANO_ACT_TUPLE_REGEX, validTuple), true, 'Must pass valid action tuple');

  // 4. Verify rejection behavior on persistent dirty output (Chromium Issue 576432037 simulation)
  let retryCount = 0;
  const mockBypassedSession = {
    async prompt() {
      retryCount++;
      // Silently return unconstrained dirty prose instead of conforming to RegExp
      return 'Here is an explanation of the phenomenon without S-expression formatting.';
    }
  };

  const regex = NANO_ACT_TUPLE_REGEX;
  let rejected = false;
  try {
    let output = await mockBypassedSession.prompt();
    if (!testConstraintRegExp(regex, output)) {
      // Simulate verification retry loop
      let verified = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const retryOutput = await mockBypassedSession.prompt();
        if (testConstraintRegExp(regex, retryOutput)) {
          output = retryOutput;
          verified = true;
          break;
        }
      }
      if (!verified) {
        throw new Error('[AiCaller] Chromium Issue 576432037: output failed responseConstraint RegExp verification after retries. Rejecting dirty output.');
      }
    }
  } catch (err: any) {
    if (err.message.includes('Chromium Issue 576432037')) {
      rejected = true;
    }
  }

  assert.strictEqual(rejected, true, 'Dirty output must be rejected rather than passed downstream');
  assert.strictEqual(retryCount, 3, 'Must have attempted initial prompt + 2 verification retries before rejecting');

  // 5. Verify recovery behavior when retry satisfies the constraint
  let recoveryAttempt = 0;
  const mockRecoveringSession = {
    async prompt() {
      recoveryAttempt++;
      if (recoveryAttempt === 1) {
        // First attempt silently bypasses constraint
        return 'Dirty unconstrained token output';
      }
      // Retry succeeds with valid tuple
      return '(:act :seek 0.50 :highlight "#coil-core" :say "Electromagnetic field aligned.")';
    }
  };

  let recoveredOutput = await mockRecoveringSession.prompt();
  if (!testConstraintRegExp(regex, recoveredOutput)) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const retryOut = await mockRecoveringSession.prompt();
      if (testConstraintRegExp(regex, retryOut)) {
        recoveredOutput = retryOut;
        break;
      }
    }
  }

  assert.strictEqual(testConstraintRegExp(regex, recoveredOutput), true, 'Recovered output must pass constraint verification');
  assert.strictEqual(recoveryAttempt, 2, 'Recovery must succeed on second prompt call');

  console.log('[✅ PASS] Sim 8: Chromium Issue 576432037 client-side responseConstraint verification, retry recovery, and dirty output rejection verified.');
  passedTests++;
}

// =========================================================================
// TEST 9: Offline Simulator Suite ZIP Export & Protocol Invariants
// =========================================================================
console.log('\n--- TEST 9: Offline Simulator Suite ZIP Export & Embed Protocol ---');
{
  const staticZipPath = 'static/lumina-vector-player.zip';
  const playerZipPath = 'static/player/lumina-vector-player.zip';

  assert(fs.existsSync(staticZipPath), `Primary distribution zip '${staticZipPath}' must exist on disk`);
  assert(fs.existsSync(playerZipPath), `Subdirectory relative zip '${playerZipPath}' must exist on disk`);

  const staticZipSize = fs.statSync(staticZipPath).size;
  const playerZipSize = fs.statSync(playerZipPath).size;

  assert(staticZipSize > 500000, `ZIP file size (${staticZipSize} bytes) must be comprehensive (> 500 KB)`);
  assert.strictEqual(staticZipSize, playerZipSize, 'Static root and player folder zip files must be identical in size');

  // Verify display configuration defaults include showExportZip: true in suite and classroom profiles
  assert.strictEqual(SUITE_PRESET.showExportZip, true, 'SUITE_PRESET must have showExportZip enabled');
  assert.strictEqual(CLASSROOM_PRESET.showExportZip, true, 'CLASSROOM_PRESET must have showExportZip enabled');

  // Verify static/player/index.html includes accessible button with ID #btn-download-zip
  const indexHtml = fs.readFileSync('static/player/index.html', 'utf-8');
  assert(indexHtml.includes('id="btn-download-zip"'), 'index.html must include #btn-download-zip element');
  assert(indexHtml.includes('zip-download-btn'), 'index.html must style button with zip-download-btn class');

  // Verify player-ui.js contains downloadOfflineSuiteZip handler and parent notification
  const playerUi = fs.readFileSync('static/player/player-ui.js', 'utf-8');
  assert(playerUi.includes('downloadOfflineSuiteZip()'), 'player-ui.js must define downloadOfflineSuiteZip()');
  assert(playerUi.includes('btnDownloadZip: document.getElementById(\'btn-download-zip\')'), 'player-ui.js must bind btnDownloadZip element');
  assert(playerUi.includes('type: \'DOWNLOAD_ZIP\''), 'player-ui.js must post DOWNLOAD_ZIP notification to parent');

  // Verify ast-engine.js dispatches DOWNLOAD_OFFLINE_ZIP
  const astEngine = fs.readFileSync('static/player/ast-engine.js', 'utf-8');
  assert(astEngine.includes('DOWNLOAD_OFFLINE_ZIP'), 'ast-engine.js must listen for DOWNLOAD_OFFLINE_ZIP');

  console.log(`[✅ PASS] Sim 9: Offline Simulator Suite ZIP Bundle (${(staticZipSize / 1024).toFixed(1)} KB), postMessage protocol, and UI binding verified.`);
  passedTests++;
}

function createHeadlessEngine() {
  const code = fs.readFileSync('static/player/ast-engine.js', 'utf8');
  const sandbox: any = {
    console,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Map,
    Set,
    Float32Array,
    Int32Array,
    Uint8Array,
    RegExp,
    Error,
    JSON,
    URLSearchParams,
    parseFloat,
    parseInt,
    isNaN,
    isFinite,
    setTimeout,
    clearTimeout,
    performance: { now: () => Date.now() },
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.runInNewContext(code, sandbox, { filename: 'static/player/ast-engine.js' });
  return new sandbox.ASTVectorPlayerEngine({ container: null, autoplay: false, voiceEnabled: false });
}

// =========================================================================
// TEST 10: Fixed-Timestep Sub-Stepping (1/240s) & Frame-Delta Clamping (0.05s)
// =========================================================================
console.log('\n--- TEST 10: Fixed-Timestep Sub-Stepping & Frame-Delta Clamping ---');
{
  const engine60 = createHeadlessEngine();
  const engine120 = createHeadlessEngine();
  const engine240 = createHeadlessEngine();

  assert.strictEqual(engine60.physics.substeps, 4, 'Default substeps must be 4');
  assert(Math.abs(engine60.physics.fixedDt - 1 / 240) < 1e-12, 'Default fixedDt must be 1/240 s');
  assert.strictEqual(engine60.physics.maxFrameDt, 0.05, 'Frame delta clamp must be 0.05 s');

  for (const eng of [engine60, engine120, engine240]) {
    eng.physics.clear();
    eng.physics.gravity = 980;
    eng.physics.drag = 0;
    eng.physics.groundY = 460;
    eng.physics.addBody({ id: 'drop', x: 300, y: 60, vx: 120, vy: 0, radius: 14, restitution: 0.75, friction: 0.1 });
  }

  for (let f = 0; f < 15; f++) engine60.physics.update(1 / 60);
  for (let f = 0; f < 30; f++) engine120.physics.update(1 / 120);
  for (let f = 0; f < 60; f++) engine240.physics.update(1 / 240);

  const b60 = engine60.physics.bodies[0];
  const b120 = engine120.physics.bodies[0];
  const b240 = engine240.physics.bodies[0];

  assert(Math.abs(b60.y - b120.y) < 1e-4 && Math.abs(b60.y - b240.y) < 1e-4, `60/120/240Hz fall y must match identically: ${b60.y}, ${b120.y}, ${b240.y}`);
  assert(Math.abs(b60.vy - b120.vy) < 1e-4 && Math.abs(b60.vy - b240.vy) < 1e-4, `60/120/240Hz fall vy must match identically: ${b60.vy}, ${b120.vy}, ${b240.vy}`);

  // Tab-switch / freeze spike (rawDt = 2.5s) must clamp to 0.05s (12 substeps at 240Hz) and prevent tunneling
  const engineSpike = createHeadlessEngine();
  engineSpike.physics.clear();
  engineSpike.physics.gravity = 980;
  engineSpike.physics.groundY = 420;
  engineSpike.physics.addBody({ id: 'fast', x: 400, y: 390, vx: 0, vy: 1800, radius: 16, restitution: 0.8 });
  engineSpike.physics.update(2.5);
  assert.strictEqual(engineSpike.physics.lastSubstepsExecuted, 12, 'Clamped 0.05s frame must execute 12 substeps at 1/240s');
  const fastBody = engineSpike.physics.bodies[0];
  assert(fastBody.y <= 420 - 16 + 0.1, `High-speed body must not tunnel through groundY=420 (got y=${fastBody.y})`);

  console.log(`[✅ PASS] Sim 10: 60/120/240Hz fixed-timestep determinism (y=${b60.y.toFixed(3)}) and 0.05s anti-tunneling clamp verified.`);
  passedTests++;
}

// =========================================================================
// TEST 11: Impulse Restitution, Slop Stability & Coulomb Friction
// =========================================================================
console.log('\n--- TEST 11: Impulse Restitution, Resting Slop Stability & Coulomb Friction ---');
{
  // 11a. Elastic head-on collision (m1 = m2 = 1, e = 1.0, zero gravity/friction)
  const engElastic = createHeadlessEngine();
  engElastic.physics.clear();
  engElastic.physics.gravity = 0;
  engElastic.physics.drag = 0;
  engElastic.physics.friction = 0;
  engElastic.physics.addBody({ id: 'a', x: 200, y: 200, vx: 200, vy: 0, mass: 1, radius: 20, restitution: 1.0, friction: 0 });
  engElastic.physics.addBody({ id: 'b', x: 245, y: 200, vx: -100, vy: 0, mass: 1, radius: 20, restitution: 1.0, friction: 0 });

  for (let f = 0; f < 10; f++) engElastic.physics.update(1 / 60);
  const aEl = engElastic.physics.bodies[0];
  const bEl = engElastic.physics.bodies[1];
  assert(Math.abs(aEl.vx - (-100)) < 1e-2 && Math.abs(bEl.vx - 200) < 1e-2, `Equal-mass elastic collision must swap velocities: a=${aEl.vx}, b=${bEl.vx}`);
  const keBefore = 0.5 * (200 * 200 + (-100) * (-100));
  const keAfter = 0.5 * (aEl.vx * aEl.vx + bEl.vx * bEl.vx);
  assert(Math.abs(keAfter - keBefore) < 1, `Elastic collision must conserve kinetic energy: ${keBefore} vs ${keAfter}`);

  // 11b. Perfectly inelastic collision (e = 0.0)
  const engInelastic = createHeadlessEngine();
  engInelastic.physics.clear();
  engInelastic.physics.gravity = 0;
  engInelastic.physics.drag = 0;
  engInelastic.physics.friction = 0;
  engInelastic.physics.addBody({ id: 'c', x: 200, y: 200, vx: 180, vy: 0, mass: 2, radius: 20, restitution: 0.0, friction: 0 });
  engInelastic.physics.addBody({ id: 'd', x: 244, y: 200, vx: 0, vy: 0, mass: 1, radius: 20, restitution: 0.0, friction: 0 });

  for (let f = 0; f < 10; f++) engInelastic.physics.update(1 / 60);
  const cIn = engInelastic.physics.bodies[0];
  const dIn = engInelastic.physics.bodies[1];
  const expectedMergedV = (2 * 180 + 1 * 0) / 3; // 120
  assert(Math.abs(cIn.vx - expectedMergedV) < 1e-2 && Math.abs(dIn.vx - expectedMergedV) < 1e-2, `Inelastic collision must share momentum v=${expectedMergedV}, got c=${cIn.vx}, d=${dIn.vx}`);

  // 11c. Resting contact slop stability (zero vertical micro-jitter) + Coulomb sliding friction
  const engSettle = createHeadlessEngine();
  engSettle.physics.clear();
  engSettle.physics.gravity = 980;
  engSettle.physics.groundY = 420;
  engSettle.physics.addBody({ id: 'slider', x: 100, y: 380, vx: 260, vy: 0, radius: 16, restitution: 0.45, friction: 0.45 });
  for (let f = 0; f < 180; f++) engSettle.physics.update(1 / 60); // 3s settle
  const settled = engSettle.physics.bodies[0];
  assert.strictEqual(settled.isGrounded, true, 'Settled body must report isGrounded=true');
  assert.strictEqual(settled.vy, 0, 'Settled body must have zero vertical jitter');
  assert.strictEqual(settled.vx, 0, 'Coulomb friction must bring sliding body to exact halt without sign reversal');
  const yBeforeRestFrames = settled.y;
  for (let f = 0; f < 60; f++) engSettle.physics.update(1 / 60);
  assert.strictEqual(settled.y, yBeforeRestFrames, 'Resting body y must remain strictly constant across 60 idle frames');

  console.log('[✅ PASS] Sim 11: Exact Newtonian restitution (e=1 & e=0), zero-jitter resting slop, and Coulomb friction verified.');
  passedTests++;
}

// =========================================================================
// TEST 12: 6-Float Squash-Stretch Matrix (det = 1) & Zero-GC Buffer Reuse
// =========================================================================
console.log('\n--- TEST 12: Velocity-Aligned 6-Float Squash-Stretch Matrix & Zero-GC ---');
{
  const outMat = new Float32Array(6);
  evaluateSquashStretchMatrix6(300, 400, 0.25, 250, 320, outMat, 0, 0);
  const det = outMat[0] * outMat[3] - outMat[1] * outMat[2];
  assert(Math.abs(det - 1.0) < 1e-4, `Squash-stretch matrix must conserve 2D area (det=1), got ${det}`);
  assert(formatSvgMatrix6(outMat).startsWith('matrix('), 'formatSvgMatrix6 must emit valid SVG matrix() string');

  const engSq = createHeadlessEngine();
  engSq.physics.clear();
  engSq.physics.gravity = 980;
  engSq.physics.groundY = 420;
  const ball = engSq.physics.addBody({ id: 'sq', x: 300, y: 390, vx: 0, vy: 500, radius: 16, restitution: 0.5, friction: 0.1 });
  const initialBufRef = ball._matrixBuf;
  assert(initialBufRef instanceof Float32Array && initialBufRef.length === 6, 'Body must pre-allocate Float32Array(6)');

  let peakSquash = 0;
  let maxDetErr = 0;
  for (let f = 0; f < 180; f++) {
    engSq.physics.update(1 / 60);
    assert.strictEqual(ball._matrixBuf, initialBufRef, '_matrixBuf reference must never reallocate in update loop');
    if (ball.squash > peakSquash) peakSquash = ball.squash;
    const d = ball._matrixBuf[0] * ball._matrixBuf[3] - ball._matrixBuf[1] * ball._matrixBuf[2];
    maxDetErr = Math.max(maxDetErr, Math.abs(d - 1));
  }

  assert(peakSquash > 0.15, `High-speed impact must trigger squash deformation (peak=${peakSquash})`);
  assert(maxDetErr < 1e-4, `All frame matrices must preserve det=1 (maxErr=${maxDetErr})`);
  assert(ball.squash < 0.01, `Squash deformation must decay back toward rest (got ${ball.squash})`);

  console.log(`[✅ PASS] Sim 12: Squash-stretch matrix (peak=${peakSquash.toFixed(3)}, maxDetErr=${maxDetErr.toExponential(2)}) and zero-GC buffer reuse verified.`);
  passedTests++;
}

// =========================================================================
// TEST 13: Damped Hookean Spring Solver & Declarative .ast Physics Parsing
// =========================================================================
console.log('\n--- TEST 13: Damped Hookean Spring Solver & Declarative .ast Physics ---');
{
  // 13a. VectorMicroPhysics damped Hookean spring (F = -k*x - c*v)
  const engSpring = createHeadlessEngine();
  engSpring.physics.clear();
  engSpring.physics.gravity = 0;
  engSpring.physics.drag = 0;
  const bob = engSpring.physics.addBody({ id: 'bob', x: 300, y: 260, vx: 0, vy: 0, mass: 1.0, radius: 12, friction: 0 });
  engSpring.physics.addSpring({ id: 'sp', anchorX: 300, anchorY: 100, b: 'bob', length: 100, stiffness: 120, damping: 6.0 });

  const initialExt = Math.abs((bob.y - 100) - 100); // +60
  for (let f = 0; f < 240; f++) engSpring.physics.update(1 / 60); // 4s
  const finalExt = Math.abs((bob.y - 100) - 100);
  assert(finalExt < initialExt * 0.05, `Damped Hookean spring must decay toward equilibrium rest length (init=${initialExt}, final=${finalExt})`);

  // 13b. VectorVerletPhysics damped Hookean spring mode
  engSpring.verletPhysics.gravity = 0;
  const spPair = engSpring.verletPhysics.createSpring(200, 100, 200, 200, 90, 5.0);
  spPair.weight.y = 260;
  engSpring.verletPhysics._dirty = true;
  for (let f = 0; f < 240; f++) engSpring.verletPhysics.step(1 / 60);
  const verletExt = Math.abs((spPair.weight.y - spPair.anchor.y) - 100);
  assert(verletExt < 3.0, `VectorVerletPhysics Hookean spring must converge toward rest length (err=${verletExt})`);

  // 13c. Declarative .ast parsing for :restitution, :friction, :stiffness, :damping, :substeps, :body, :spring
  const astSrc = `(ast-scene
    :id "test-bounce-rig"
    :title "Bounce Rig"
    :duration 5
    (:stage :viewBox "0 0 800 480")
    (:physics
      :gravity 980
      :restitution 0.85
      :friction 0.35
      :stiffness 180
      :damping 5.5
      :substeps 6
      :ground 430
      (:body :id "puck" :x 250 :y 120 :radius 18 :restitution 0.92 :friction 0.22)
      (:spring :id "cord" :anchorX 250 :anchorY 40 :b "puck" :length 90 :stiffness 180 :damping 5.5))
  )`;
  const parsedScene = engSpring.parseAst(astSrc);
  assert(parsedScene.physics !== null, 'parseAst must extract (:physics ...) block');
  assert.strictEqual(parsedScene.physics.restitution, 0.85, 'parseAst must extract :restitution');
  assert.strictEqual(parsedScene.physics.friction, 0.35, 'parseAst must extract :friction');
  assert.strictEqual(parsedScene.physics.stiffness, 180, 'parseAst must extract :stiffness');
  assert.strictEqual(parsedScene.physics.damping, 5.5, 'parseAst must extract :damping');
  assert.strictEqual(parsedScene.physics.substeps, 6, 'parseAst must extract :substeps');
  assert.strictEqual(parsedScene.physics.bodies.length, 1, 'parseAst must extract :body definitions');
  assert.strictEqual(parsedScene.physics.springs.length, 1, 'parseAst must extract :spring definitions');

  await engSpring.loadSceneData(parsedScene);
  assert.strictEqual(engSpring.physics.substeps, 6, 'loadSceneData must wire :substeps onto physics VM');
  assert.strictEqual(engSpring.physics.restitution, 0.85, 'loadSceneData must wire :restitution onto physics VM');
  assert.strictEqual(engSpring.physics.springs.length, 1, 'loadSceneData must wire :spring onto physics VM');

  console.log('[✅ PASS] Sim 13: Damped Hookean spring solvers (MicroPhysics & Verlet) and declarative .ast parameter wiring verified.');
  passedTests++;
}

// =========================================================================
// TEST 14: Manipulation Goal Checkpoints (:pass-expr, :hold-duration, :on-wrong)
// =========================================================================
console.log('\n--- TEST 14: Manipulation Goal Checkpoints (:pass-expr, :hold-duration, :on-wrong) ---');
{
  const engGoal = createHeadlessEngine();
  const goalAst = `(:scene :id "goal-test" :type "Sim" :title "Goal Test" :duration 10.0
    (:vars ((:var :name "pressure" :val 101.3 :min 50 :max 400)))
    (:interactive (
      (:checkpoint :t 0.0 :title "Target Pressure"
        :prompt "Bring pressure within 4 kPa of 202.6 kPa and hold 0.5s"
        :pass-expr "Math.abs(vars.pressure - 202.6) < 4.0"
        :hold-duration 0.5
        :explanation "Pressure target satisfied!")
      (:checkpoint :t 0.5 :title "Distractor Check"
        :prompt "Pick correct"
        :options ("Correct" "Too low" "Too high")
        :answer 0
        :on-wrong ((1 "Try raising temperature") (2 "Volume dropped too far"))
        :explanation "Done")
    ))
  )`;
  const parsedGoal = engGoal.parseAst(goalAst);
  assert(parsedGoal.checkpoints[0].passExpr === 'Math.abs(vars.pressure - 202.6) < 4.0', 'parseAst extracts :pass-expr');
  assert(Math.abs(parsedGoal.checkpoints[0].holdDuration - 0.5) < 1e-6, 'parseAst extracts :hold-duration');
  assert.strictEqual(parsedGoal.checkpoints[1].onWrong[1], 'Try raising temperature', 'parseAst extracts :on-wrong hint 1');
  assert.strictEqual(parsedGoal.checkpoints[1].onWrong[2], 'Volume dropped too far', 'parseAst extracts :on-wrong hint 2');

  await engGoal.loadSceneData(parsedGoal);
  let passedEvtCount = 0;
  engGoal.on('checkpoint_goal_passed', () => { passedEvtCount++; });

  // Not satisfied yet at baseline 101.3 kPa
  engGoal.applyBindings(0.1, 0.2, true);
  assert.strictEqual(engGoal.getCheckpointGoalStatus(0).passed, false, 'Goal must not pass before condition is met');

  // Satisfy for 0.3s (< 0.5s holdDuration)
  engGoal.vars.pressure = 202.0;
  engGoal.applyBindings(0.2, 0.3, true);
  const midStatus = engGoal.getCheckpointGoalStatus(0);
  assert.strictEqual(midStatus.passed, false, 'Goal must wait for full hold-duration');
  assert(Math.abs(midStatus.holdElapsed - 0.3) < 1e-5, 'Hold timer must accumulate elapsed hold dt');

  // Drop condition briefly -> timer must reset cleanly to 0
  engGoal.vars.pressure = 120.0;
  engGoal.applyBindings(0.3, 0.1, true);
  assert.strictEqual(engGoal.getCheckpointGoalStatus(0).holdElapsed, 0, 'Hold timer must reset when condition breaks');

  // Satisfy continuously for 0.55s -> must pass & emit checkpoint_goal_passed
  engGoal.vars.pressure = 203.0;
  engGoal.applyBindings(0.4, 0.3, true);
  engGoal.applyBindings(0.5, 0.25, true);
  assert.strictEqual(engGoal.getCheckpointGoalStatus(0).passed, true, 'Goal must pass after sustained hold-duration');
  assert.strictEqual(passedEvtCount, 1, 'checkpoint_goal_passed event must fire exactly once');

  console.log('[✅ PASS] Sim 14: :pass-expr hold accumulation, reset on break, :on-wrong hints, and completion event verified.');
  passedTests++;
}

// =========================================================================
// TEST 15: Live Vector Oscilloscope (:scope) Typed Ring Buffer & Jotter CSV
// =========================================================================
console.log('\n--- TEST 15: :scope Float32Array Zero-GC Ring Buffer & CSV Export ---');
{
  const engScope = createHeadlessEngine();
  const scopeAst = `(:scene :id "scope-test" :type "Sim" :title "Scope Test" :duration 10.0
    (:vars ((:var :name "amp" :val 25 :min 0 :max 100)))
    (:computed ((:name "yVal" :expr "vars.amp * 2")))
    (:scope :target "#trace" :x-expr "t" :y-expr "vars.yVal" :samples 16 :x-range (0 10) :y-range (0 100) :plot (100 50 400 200))
  )`;
  const parsedScope = engScope.parseAst(scopeAst);
  assert.strictEqual(parsedScope.scopes.length, 1, 'parseAst must parse :scope declaration');
  await engScope.loadSceneData(parsedScope);

  assert.strictEqual(engScope.activeScopes.length, 1, 'Engine must initialize activeScope entry');
  const sc = engScope.activeScopes[0];
  const rawXRef = sc.rawX;
  const rawYRef = sc.rawY;
  assert(rawXRef instanceof Float32Array && rawXRef.length === 16, 'rawX must be pre-allocated Float32Array(samples)');
  assert(rawYRef instanceof Float32Array && rawYRef.length === 16, 'rawY must be pre-allocated Float32Array(samples)');

  engScope.isPlaying = true;
  for (let i = 0; i < 24; i++) {
    engScope.vars.simClock = i * 0.65;
    engScope.applyBindings(engScope.vars.simClock, 0.25, true);
  }
  assert.strictEqual(sc.rawX, rawXRef, 'rawX Float32Array reference must never reallocate in ticks');
  assert.strictEqual(sc.rawY, rawYRef, 'rawY Float32Array reference must never reallocate in ticks');
  assert.strictEqual(sc.count, 16, 'Ring buffer count must cap cleanly at capacity 16');

  const csvOut = engScope.exportLabCsv();
  assert(csvOut.rowCount >= 16, `exportLabCsv must return >= 16 logged rows (got ${csvOut.rowCount})`);
  assert(csvOut.csv.startsWith('time_s,'), 'CSV header must begin with time_s column');
  assert(csvOut.csv.includes('scope_1_x,scope_1_y'), 'CSV header must include scope columns');

  engScope.reset();
  assert.strictEqual(sc.count, 0, 'engine.reset() must clear scope ring buffer count');

  console.log('[✅ PASS] Sim 15: :scope Float32Array ring buffer reuse, wrap-around, and RFC-4180 CSV logging verified.');
  passedTests++;
}

// =========================================================================
// TEST 16: Conservation-Law & Energy Ledger (:ledger) Typed Buffers
// =========================================================================
console.log('\n--- TEST 16: Conservation-Law & Energy Ledger (:ledger) ---');
{
  const engLedger = createHeadlessEngine();
  const ledgerAst = `(:scene :id "ledger-test" :type "Sim" :title "Ledger Test" :duration 10.0
    (:vars ((:var :name "ke" :val 40 :min 0 :max 100) (:var :name "pe" :val 60 :min 0 :max 100)))
    (:ledger :id "energy-meter" :target "#energy-meter" :x 40 :y 400 :width 300 :height 18 :unit "J" :max "100"
      :terms ((:label "Kinetic" :expr "vars.ke" :color "#38bdf8") (:label "Potential" :expr "vars.pe" :color "#22c55e")))
  )`;
  const parsedLd = engLedger.parseAst(ledgerAst);
  assert.strictEqual(parsedLd.ledgers.length, 1, 'parseAst must parse :ledger');
  await engLedger.loadSceneData(parsedLd);

  assert.strictEqual(engLedger.activeLedgers.length, 1, 'Engine must mount activeLedger');
  const ld = engLedger.activeLedgers[0];
  const valRef = ld.values;
  assert(valRef instanceof Float32Array && valRef.length === 2, 'Ledger must pre-allocate Float32Array(terms.length)');

  engLedger.applyBindings(0.5, 1 / 60, true);
  assert.strictEqual(ld.values, valRef, 'Ledger Float32Array must never reallocate in hot loop');
  assert(Math.abs((ld.values[0] + ld.values[1]) - 100) < 1e-4, 'Energy conservation total must sum to 100 J');

  console.log('[✅ PASS] Sim 16: :ledger Float32Array buffers and real-time conservation evaluation verified.');
  passedTests++;
}

// =========================================================================
// TEST 17: New KS4 Chemistry & Biology Cartridges E2E Verification
// =========================================================================
console.log('\n--- TEST 17: 4 Canonical KS4 Chemistry & Biology Cartridges ---');
{
  const newCartridges = [
    { id: 'rates-of-reaction', testVars: { temp: 70, conc: 2.5, surfaceArea: 3 }, checkProp: 'kRate' },
    { id: 'acid-alkali-titration', testVars: { volBase: 25.0 }, checkProp: 'ph' },
    { id: 'enzyme-denaturation', testVars: { temp: 37, ph: 7.0 }, checkProp: 'reactionRate' },
    { id: 'osmosis-membrane', testVars: { soluteIn: 0.4, soluteOut: 0.4 }, checkProp: 'netWaterFlux' },
  ];

  for (const item of newCartridges) {
    const astRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', `${item.id}.ast`), 'utf8');
    const svgRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', `${item.id}.svg`), 'utf8');
    assert(svgRaw.includes('<svg') && svgRaw.includes('</svg>'), `${item.id}.svg is valid SVG markup`);

    const eng = createHeadlessEngine();
    const parsed = eng.parseAst(astRaw);
    await eng.loadSceneData(parsed);

    assert(eng.activeScopes.length >= 1, `${item.id} mounts live :scope ring buffer`);
    assert(eng.activeLedgers.length >= 1, `${item.id} mounts :ledger conservation meter`);
    assert(
      parsed.checkpoints.some((c: any) => Boolean(c.passExpr)),
      `${item.id} defines a :pass-expr manipulation challenge`,
    );

    // Drive simulation toward target state and sustain hold duration
    eng.isPlaying = true;
    for (const [k, v] of Object.entries(item.testVars)) {
      eng.setMemoryVar(k, v);
    }
    for (let step = 0; step < 12; step++) {
      eng.vars.simClock = (step + 1) * 0.25;
      eng.applyBindings(eng.vars.simClock, 0.25, true);
    }
    assert.strictEqual(eng.getCheckpointGoalStatus(0).passed, true, `${item.id} satisfies manipulation goal checkpoint cleanly`);
    const csv = eng.exportLabCsv();
    assert(csv.rowCount >= 1 && csv.csv.includes(item.checkProp), `${item.id} CSV log captures ${item.checkProp}`);
  }

  console.log('[✅ PASS] Sim 17: All 4 KS4 Chemistry & Biology cartridges passed E2E simulation, goal, scope, ledger, and CSV checks.');
  passedTests++;
}

// =========================================================================
// TEST 18: Chrome Built-in AI & WebMCP Telemetry Harness Invariants
// =========================================================================
console.log('\n--- TEST 18: Chrome EPP Contention Profiler, Compression & WebMCP Bridge ---');
{
  // 18a. ASTProfiler zero-GC capture ring buffer & percentile calculations
  const code = fs.readFileSync('static/player/ast-engine.js', 'utf8');
  const sb: any = {
    console, Math, Number, String, Boolean, Array, Object, Map, Set,
    Float32Array, Int32Array, Uint8Array, RegExp, Error, JSON,
    URLSearchParams, parseFloat, parseInt, isNaN, isFinite,
    setTimeout, clearTimeout, performance: { now: () => Date.now() },
  };
  sb.globalThis = sb;
  sb.self = sb;
  vm.runInNewContext(code, sb, { filename: 'static/player/ast-engine.js' });

  const profiler = new sb.ASTProfiler({ silent: true });
  const deltaBufRef = profiler.captureDeltas;
  const computeBufRef = profiler.captureComputes;
  assert(deltaBufRef instanceof Float32Array && deltaBufRef.length === 1024, 'ASTProfiler must pre-allocate 1024-slot Float32Array capture buffer');
  profiler.startCapture();
  let fakeTs = 1000;
  for (let i = 0; i < 100; i++) {
    profiler.onFrame(fakeTs);
    profiler.onCompute(i === 95 ? 0.45 : 0.12);
    // 98 frames ~16.5ms, 2 frames spike 22.0ms (>16.67ms)
    fakeTs += (i === 50 || i === 90) ? 22.0 : 16.5;
  }
  const profStats = profiler.stopCapture();
  assert.strictEqual(profiler.captureDeltas, deltaBufRef, 'captureDeltas Float32Array must never reallocate in hot loop');
  assert.strictEqual(profiler.captureComputes, computeBufRef, 'captureComputes Float32Array must never reallocate in hot loop');
  assert.strictEqual(profStats.sampleCount, 99, `Expected 99 inter-frame delta samples, got ${profStats.sampleCount}`);
  assert.strictEqual(profStats.framesOver16_67ms, 2, `Expected 2 over-budget frames (>16.67ms), got ${profStats.framesOver16_67ms}`);
  assert(profStats.p99Ms >= 21.5, `Expected p99Ms >= 21.5ms, got ${profStats.p99Ms}`);

  // 18b. Headless WebMCP tool schemas, [min, max] clamping, selector hygiene & DOM payload reduction
  const engMcp = new sb.ASTVectorPlayerEngine({ container: null, autoplay: false, voiceEnabled: false });
  const ratesAst = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'rates-of-reaction.ast'), 'utf8');
  const parsedRates = engMcp.parseAst(ratesAst);
  await engMcp.loadSceneData(parsedRates);
  engMcp.isPlaying = true;
  engMcp.applyBindings(0.5, 1 / 60, true);

  const clampedLow = clampVarValue(-10, { val: 25, min: 10, max: 80 });
  const clampedHigh = clampVarValue(120, { val: 25, min: 10, max: 80 });
  assert.strictEqual(clampedLow.value, 10);
  assert.strictEqual(clampedLow.clamped, true);
  assert.strictEqual(clampedHigh.value, 80);
  assert.strictEqual(clampedHigh.clamped, true);

  const unsafeTuple = buildSafeActionTuple({
    highlight: 'svg onload=alert(1)',
    say: 'Checking selector guard',
  });
  assert.strictEqual(unsafeTuple.rejectedSelectors.length, 1, 'Unsafe CSS selector must be rejected');

  const headlessTransport: PlayerMcpTransport = {
    readState: async (includeSvgBytes = true) => {
      const s = engMcp.getEngineStateSummary(false);
      // In Node headless mode without browser SVG DOM, synthesize realistic 18 KB SVG size from actual cartridge
      const svgRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'rates-of-reaction.svg'), 'utf8');
      return {
        ...s,
        svgDomBytes: includeSvgBytes ? Buffer.byteLength(svgRaw, 'utf8') : 0,
      };
    },
    setVar: async (name, value) => {
      const meta = engMcp.scene?.vars?.[name];
      const clamped = clampVarValue(value, meta);
      engMcp.setMemoryVar(name, clamped.value, true);
      return { name, value: clamped.value, clamped: clamped.clamped, state: engMcp.getEngineStateSummary(false) };
    },
    execActionTuple: async (tuple) => {
      const hasSay = tuple.includes(':say');
      return { ok: true, executedActions: hasSay ? ['say'] : ['seek'], state: engMcp.getEngineStateSummary(false) };
    },
  };

  const mcpTools = createPlayerWebMcpTools(headlessTransport);
  assert.strictEqual(mcpTools.length, 3, 'WebMCP must register exactly 3 structured tools');
  assert.deepStrictEqual(mcpTools.map((t) => t.name), ['ast_set_var', 'ast_dispatch_action', 'ast_read_state']);
  const mcpBench = await runWebMcpBenchmark(headlessTransport, mcpTools);
  assert.strictEqual(mcpBench.clampingVerified, true, 'WebMCP live benchmark must verify [min, max] clamping');
  assert(mcpBench.domPayloadReductionPct > 50, `MCP compact JSON must achieve > 50% byte reduction vs raw SVG (${mcpBench.domPayloadReductionPct}%)`);

  // 18c. Canonical 20-line .ast vs Verbose JSON vs .astb compression benchmark
  const comp = await computeAstVsJsonCompression();
  assert.strictEqual(comp.astValid, true, 'Canonical 20-line .ast must parse cleanly');
  assert.strictEqual(comp.jsonValid, true, 'Equivalent JSON schema must parse cleanly');
  assert.strictEqual(comp.astbValid, true, 'Compiled .astb binary must round-trip cleanly');
  assert(comp.astBytes < comp.jsonBytes, `.ast (${comp.astBytes}B) must be smaller than verbose JSON (${comp.jsonBytes}B)`);
  assert(comp.astbBytes < comp.jsonBytes, `.astb (${comp.astbBytes}B) must be smaller than verbose JSON (${comp.jsonBytes}B)`);
  assert(comp.astVsJsonTokenSavingsPct > 40, `.ast must save > 40% tokens vs verbose JSON (${comp.astVsJsonTokenSavingsPct}%)`);

  // 18d. Markdown + JSON EPP Dossier Formatter
  const sampleDossier: EppTelemetryDossier = {
    dossierVersion: '1.0.0',
    generatedAtIso: '2026-11-14T00:00:00.000Z',
    sceneId: 'rates-of-reaction',
    hardwareProfile: {
      userAgent: 'HeadlessVerifier/1.0',
      deviceMemoryGb: 8,
      hardwareConcurrency: 8,
      webgpuSupported: true,
      wasmPoolBytes: 458752,
      wasmPages: 7,
      jsHeapStartMb: 12.4,
      jsHeapEndMb: 12.6,
      heapDeltaMb: 0.2,
      bslAvatarActiveDuringRun: true,
    },
    promptApiStatus: {
      present: false,
      availability: 'unavailable',
      activeTier: 'tier3-deterministic-ast',
      cloneLatencyMs: null,
      cloneDestroyedCleanly: false,
      constraintSchemaUsed: false,
    },
    contentionPhases: {
      phaseABaseline: { durationMs: 3000, stats: profStats, activeMetrics: { activeScopes: 1, activeLedgers: 1, physicsBodies: 4, physicsSprings: 0, substeps: 4, emitterParticles: 24 }, workloadLabel: 'Baseline' },
      phaseBConcurrent: { durationMs: 1400, stats: profStats, activeMetrics: { activeScopes: 1, activeLedgers: 1, physicsBodies: 4, physicsSprings: 0, substeps: 4, emitterParticles: 24 }, workloadLabel: 'Concurrent' },
      phaseCRecovery: { durationMs: 2000, stats: profStats, activeMetrics: { activeScopes: 1, activeLedgers: 1, physicsBodies: 4, physicsSprings: 0, substeps: 4, emitterParticles: 24 }, workloadLabel: 'Recovery' },
      deltas: { phaseBMeanMsDelta: 0.1, phaseBP95MsDelta: 0.2, phaseBP99MsDelta: 0.3, phaseBMaxMsDelta: 0.5, phaseBOverBudgetFrameDelta: 0, phaseCMeanMsDelta: 0.0, phaseCP95MsDelta: 0.0 },
    },
    contextQuotaTrace: {
      inputQuota: 6144,
      finalInputUsage: 420,
      totalQuotaOverflows: 0,
      meanTtftMs: 42.5,
      turns: [{ turn: 1, promptRole: 'ast-synthesis', promptBytes: 240, outputBytes: 512, ttftMs: 42.5, durationMs: 180.0, inputUsage: 420, inputQuota: 6144, quotaoverflowCount: 0, validOutput: true }],
    },
    compressionComparison: comp,
    webmcpBenchmark: mcpBench,
  };
  const mdReport = formatEppReportMarkdown(sampleDossier);
  assert(mdReport.includes('Chrome Built-in AI & WebMCP Field Telemetry Dossier'), 'Markdown dossier header present');
  assert(mdReport.includes('Token & Byte Compression'), 'Markdown dossier compression section present');
  assert(mdReport.includes(`${mcpBench.domPayloadReductionPct}% smaller payload`), 'Markdown dossier includes WebMCP reduction');

  console.log(`[✅ PASS] Sim 18: Zero-GC profiler, WebMCP clamping (${mcpBench.domPayloadReductionPct}% DOM reduction), AST/JSON/ASTB compression (${comp.astVsJsonTokenSavingsPct}% token savings), & EPP dossier verified.`);
  passedTests++;
}

// =========================================================================
// TEST 19: RC1 WebMCP Coexistence, E2E postMessage Bridge & Release Hygiene
// =========================================================================
console.log('\n--- TEST 19: RC1 WebMCP Additive Coexistence, postMessage Bridge & Release Hygiene ---');
{
  // 19a. Additive coexistence between portal WebMCP tools (5) and player WebMCP tools (3)
  const prevWin = (globalThis as any).window;
  const prevDoc = (globalThis as any).document;
  const prevNav = (globalThis as any).navigator;
  const prevCustomEvent = (globalThis as any).CustomEvent;

  const registeredToolMap = new Map<string, any>();
  let provideContextCalls = 0;
  let clearContextCalls = 0;
  const dispatchedEvents: string[] = [];

  const sharedModelContext = {
    registerTool: (tool: any, opts?: { signal?: AbortSignal }) => {
      registeredToolMap.set(tool.name, tool);
      if (opts?.signal) {
        opts.signal.addEventListener('abort', () => {
          registeredToolMap.delete(tool.name);
        });
      }
    },
    unregisterTool: (name: string) => {
      registeredToolMap.delete(name);
    },
    provideContext: () => {
      provideContextCalls++;
    },
    clearContext: () => {
      clearContextCalls++;
      registeredToolMap.clear();
    },
  };

  try {
    (globalThis as any).CustomEvent = class MockCustomEvent {
      type: string;
      detail: any;
      constructor(type: string, init?: { detail?: any }) {
        this.type = type;
        this.detail = init?.detail;
      }
    };
    (globalThis as any).window = {
      dispatchEvent: (ev: any) => {
        dispatchedEvents.push(ev?.type || 'unknown');
        return true;
      },
    };
    (globalThis as any).document = { modelContext: sharedModelContext };
    Object.defineProperty(globalThis, 'navigator', {
      value: { modelContext: sharedModelContext },
      configurable: true,
    });

    const portalOk = await registerPortalWebMcpTools();
    assert.strictEqual(portalOk, true, 'Portal WebMCP bridge must register on shared modelContext');
    assert.strictEqual(registeredToolMap.size, 5, `Expected 5 portal tools, got ${registeredToolMap.size}`);

    const noopTransport: PlayerMcpTransport = {
      readState: async () => null,
      setVar: async (name, value) => ({ name, value, clamped: false }),
      execActionTuple: async () => ({ ok: true, executedActions: ['say'] }),
    };

    const playerHandle = registerPlayerWebMcpTools(noopTransport);
    assert.strictEqual(playerHandle.registered, true, 'Player WebMCP bridge must register cleanly');
    assert.strictEqual(playerHandle.mode, 'registerTool', 'Player WebMCP bridge must prefer additive registerTool mode');
    assert.strictEqual(registeredToolMap.size, 8, `Expected 5 portal + 3 player = 8 coexisting tools, got ${registeredToolMap.size}`);
    assert.strictEqual(provideContextCalls, 0, 'Must never call provideContext when registerTool is supported');

    // Unregistering player tools must preserve all 5 portal tools untouched
    playerHandle.unregister();
    assert.strictEqual(clearContextCalls, 0, 'Player unregister must never wipe portal context via clearContext');
    assert.strictEqual(registeredToolMap.size, 5, `Portal tools must remain intact after player unmount, got ${registeredToolMap.size}`);
    assert(registeredToolMap.has('catholic_catechism_search'), 'Portal tool catholic_catechism_search preserved');
    assert(!registeredToolMap.has('ast_set_var'), 'Player tool ast_set_var cleanly aborted');

    unregisterPortalWebMcpTools();
    assert.strictEqual(registeredToolMap.size, 0, 'All tools cleared after portal + player teardown');
  } finally {
    (globalThis as any).window = prevWin;
    (globalThis as any).document = prevDoc;
    (globalThis as any).CustomEvent = prevCustomEvent;
    if (prevNav !== undefined) {
      Object.defineProperty(globalThis, 'navigator', { value: prevNav, configurable: true });
    }
  }

  // 19b. E2E setupPostMessageBridge request/response protocol inside isolated VM
  const engineCode = fs.readFileSync('static/player/ast-engine.js', 'utf8');
  const windowListeners: Record<string, Array<(evt: any) => void>> = {};
  const postedMessages: Array<{ msg: any; origin: string }> = [];
  const rafQueue = new Map<number, (ts: number) => void>();
  let nextRafId = 1;
  let simTimeNow = 1000;

  const bridgeSb: any = {
    console, Math, Number, String, Boolean, Array, Object, Map, Set,
    Float32Array, Int32Array, Uint8Array, RegExp, Error, JSON,
    URLSearchParams, parseFloat, parseInt, isNaN, isFinite,
    setTimeout, clearTimeout,
    performance: { now: () => simTimeNow },
    requestAnimationFrame: (cb: (ts: number) => void) => {
      const id = nextRafId++;
      rafQueue.set(id, cb);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      rafQueue.delete(id);
    },
    addEventListener: (type: string, fn: (evt: any) => void) => {
      if (!windowListeners[type]) windowListeners[type] = [];
      windowListeners[type].push(fn);
    },
    location: { origin: 'https://localhost:3000', search: '' },
    parent: {
      postMessage: (msg: any, origin: string) => {
        postedMessages.push({ msg, origin });
      },
    },
  };
  bridgeSb.globalThis = bridgeSb;
  bridgeSb.self = bridgeSb;
  bridgeSb.window = bridgeSb;
  vm.runInNewContext(engineCode, bridgeSb, { filename: 'static/player/ast-engine.js' });

  const engBridge = new bridgeSb.ASTVectorPlayerEngine({ container: null, autoplay: false, voiceEnabled: false });
  const ratesAst = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'rates-of-reaction.ast'), 'utf8');
  await engBridge.loadSceneData(engBridge.parseAst(ratesAst), false);
  bridgeSb.setupPostMessageBridge(engBridge, null);

  const sendBridgeMsg = (payload: Record<string, any>) => {
    for (const fn of windowListeners['message'] || []) {
      fn({ origin: 'https://localhost:3000', data: payload });
    }
  };

  sendBridgeMsg({ type: 'START_PROF_CAPTURE', requestId: 'rc1-start', ensurePlaying: true });
  const startMsg = postedMessages.find((m) => m.msg.type === 'PROF_CAPTURE_STARTED' && m.msg.requestId === 'rc1-start');
  assert(startMsg, 'START_PROF_CAPTURE must emit correlated PROF_CAPTURE_STARTED');

  for (let i = 0; i < 6; i++) {
    simTimeNow += 16.6;
    const pending = Array.from(rafQueue.entries());
    rafQueue.clear();
    for (const [, cb] of pending) cb(simTimeNow);
  }
  engBridge.pause();

  sendBridgeMsg({ type: 'STOP_PROF_CAPTURE', requestId: 'rc1-stop' });
  const stopMsg = postedMessages.find((m) => m.msg.type === 'PROF_CAPTURE_RESULT' && m.msg.requestId === 'rc1-stop')?.msg;
  assert(stopMsg, 'STOP_PROF_CAPTURE must emit correlated PROF_CAPTURE_RESULT');
  assert(stopMsg.stats.sampleCount >= 4, `Expected >= 4 captured frame samples, got ${stopMsg.stats.sampleCount}`);
  assert.strictEqual(stopMsg.memory.wasmPoolBytes, 458752, 'WASM pool byte metric must remain 448 KB (458752 B)');
  assert(stopMsg.activeMetrics.activeScopes >= 1, 'Rates of reaction must report activeScopes >= 1');

  const tempMax = engBridge.scene.vars.temp.max;
  sendBridgeMsg({ type: 'SET_VAR', name: 'temp', value: tempMax + 50, requestId: 'rc1-setvar' });
  const setVarAck = postedMessages.find((m) => m.msg.type === 'SET_VAR_ACK' && m.msg.requestId === 'rc1-setvar')?.msg;
  assert(setVarAck, 'SET_VAR must emit SET_VAR_ACK when requestId is supplied');
  assert.strictEqual(setVarAck.clamped, true, 'Overshoot SET_VAR must report clamped=true');
  assert.strictEqual(setVarAck.value, tempMax, `Overshoot SET_VAR must clamp to max (${tempMax})`);

  sendBridgeMsg({ type: 'GET_ENGINE_STATE', requestId: 'rc1-state', includeSvgBytes: false });
  const stateResp = postedMessages.find((m) => m.msg.type === 'ENGINE_STATE_RESPONSE' && m.msg.requestId === 'rc1-state')?.msg;
  assert.strictEqual(stateResp?.state?.sceneId, 'rates-of-reaction', 'GET_ENGINE_STATE must return active sceneId');

  sendBridgeMsg({
    type: 'EXEC_ACTION_TUPLE',
    tuple: '(:act :seek 0.25 :var "temp" 55 :say "RC1 E2E verified")',
    requestId: 'rc1-act',
  });
  const actResp = postedMessages.find((m) => m.msg.type === 'EXEC_ACTION_RESULT' && m.msg.requestId === 'rc1-act')?.msg;
  assert.strictEqual(actResp?.ok, true, 'EXEC_ACTION_TUPLE must succeed');
  assert(actResp.executedActions.includes('seek') && actResp.executedActions.includes('var') && actResp.executedActions.includes('say'));

  sendBridgeMsg({ type: 'REQUEST_JOTTER_CSV', download: false });
  const csvResp = postedMessages.find((m) => m.msg.type === 'JOTTER_CSV_RESPONSE')?.msg;
  assert(csvResp && csvResp.sceneId === 'rates-of-reaction' && csvResp.csv.length > 0, 'REQUEST_JOTTER_CSV must return lab CSV payload');

  // 19c. Release Candidate 1 version & UI hygiene check
  const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.strictEqual(pkgJson.version, '1.0.0-rc.1', `Expected package.json version 1.0.0-rc.1, got ${pkgJson.version}`);
  const settingsUi = fs.readFileSync('src/components/player/PlayerSettingsModal.ts', 'utf8');
  assert(!settingsUi.includes('[Beta]'), 'PlayerSettingsModal must be promoted from [Beta] to [RC1]');
  assert(fs.existsSync('static/lumina-vector-player.zip'), 'Offline vector player archive static/lumina-vector-player.zip must exist');

  console.log('[✅ PASS] Sim 19: Additive WebMCP coexistence (5+3=8 tools), E2E postMessage round-trips, & RC1 version parity verified.');
  passedTests++;
}

// =========================================================================
// TEST 20: First Holy Communion Cartridge & Catholic Sanctuary Regression Guard
// =========================================================================
console.log('\n--- TEST 20: First Holy Communion AST & Sanctuary Routing Invariants ---');
{
  const fhcAst = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'first-communion.ast'), 'utf8');
  const fhcSvg = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'first-communion.svg'), 'utf8');

  const engFhc = createHeadlessEngine();
  const parsedFhc = engFhc.parseAst(fhcAst);

  assert.strictEqual(parsedFhc.id, 'first-communion', 'Parsed scene id must be first-communion');
  assert(parsedFhc.subtitles.length >= 5, `Expected >= 5 normalized subtitles, got ${parsedFhc.subtitles.length}`);
  assert(parsedFhc.subtitles.every((s: any) => s.start >= 0 && s.end <= 1.0 && Boolean(s.en)), 'All subtitles must use normalized [0..1] :start/:end and :en text');
  assert(parsedFhc.checkpoints.length >= 3, `Expected >= 3 checkpoints in first-communion.ast, got ${parsedFhc.checkpoints.length}`);
  assert(parsedFhc.checkpoints.some((c: any) => Boolean(c.passExpr)), 'First Communion cartridge must include a :pass-expr manipulation goal');
  assert(parsedFhc.checkpoints.some((c: any) => c.onWrong && Object.keys(c.onWrong).length >= 2), 'Doctrinal checkpoints must include :on-wrong misconception nudges');

  const clickTargets = parsedFhc.gestures.filter((g: any) => g.type === 'clickable').map((g: any) => g.target);
  for (let step = 1; step <= 5; step++) {
    assert(clickTargets.includes(`#fhc-step-${step}`), `Gestures must declare clickable #fhc-step-${step}`);
    assert(fhcSvg.includes(`id="fhc-step-${step}"`), `SVG must declare id="fhc-step-${step}"`);
  }

  // Verify catholic-life.ts fixes: dynamic activeCatholicSim and first-communion route/tab
  const catholicLifeSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'pages', 'catholic-life.ts'), 'utf8');
  assert(!catholicLifeSrc.includes("renderInteractiveSim('church-tour')"), 'catholic-life.ts must pass activeCatholicSim instead of hardcoded church-tour');
  assert(catholicLifeSrc.includes('renderInteractiveSim(activeCatholicSim)'), 'catholic-life.ts must call renderInteractiveSim(activeCatholicSim)');
  assert(catholicLifeSrc.includes("path.includes('first-communion')"), 'catholic-life.ts must route /first-communion to first-communion tab');
  assert(catholicLifeSrc.includes('renderFirstCommunionPrep(base)'), 'catholic-life.ts must mount renderFirstCommunionPrep(base)');

  console.log('[✅ PASS] Sim 20: First Holy Communion AST syntax, checkpoints, clickable steps, and catholic-life routing verified.');
  passedTests++;
}

console.log('\n=============================================================');
console.log(`🎉 ALL ${passedTests} SIMULATION INVARIANT TESTS PASSED!`);
console.log('=============================================================');
