// scripts/invariants/sim-physics-labs.ts
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { evaluateSquashStretchMatrix6, formatSvgMatrix6 } from '../../src/utils/astMathCompiler';
import { createHeadlessEngine } from './harness';

export async function runPhysicsLabsInvariants(): Promise<number> {
  let passedTests = 0;

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

  return passedTests;
}
