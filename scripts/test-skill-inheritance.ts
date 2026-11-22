/**
 * scripts/test-skill-inheritance.ts
 * End-to-End Verification Suite for Declarative AST Skill Inheritance & Composition:
 * - Single & multi-parent :extends resolution in player-gestures.ast
 * - Diamond deduplication & cyclic :extends safety
 * - Cartridge-local (:skills ...) extending global built-in skills
 * - Parameter override precedence (parent < child < :use-skill < explicit :var)
 * - Live .ast -> .astb -> ASTVectorPlayerEngine + ASTDirectGestureSubsystem execution
 * - Zero-GC / zero post-mount DOM allocations over 120 ticks
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vm from 'node:vm';
import { compileAstTextToBytecode, isAstBytecode } from '../src/utils/astBytecode';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string): void {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

function createHeadlessPlayer(astSource: string, svgMarkup: string) {
  const playerDir = path.resolve(process.cwd(), 'static/player');
  const mockNodes = new Map<string, any>();

  const idRe = /<([a-zA-Z0-9_-]+)((?:\s+[^>]*?)?\s+)id="([^"]+)"([^>]*)>/g;
  let m: RegExpExecArray | null;
  while ((m = idRe.exec(svgMarkup)) !== null) {
    const tag = m[1];
    const attrChunk = `${m[2]} id="${m[3]}" ${m[4]}`;
    const id = m[3];
    const attrs = new Map<string, string>();
    const aRe = /([a-zA-Z0-9_:-]+)="([^"]*)"/g;
    let am: RegExpExecArray | null;
    while ((am = aRe.exec(attrChunk)) !== null) {
      attrs.set(am[1], am[2]);
    }
    const node: any = {
      tagName: tag.toUpperCase(),
      id,
      attrs,
      style: {},
      textContent: '',
      setAttribute(k: string, v: any) { attrs.set(k, String(v)); },
      getAttribute(k: string) { return attrs.has(k) ? attrs.get(k)! : null; },
      removeAttribute(k: string) { attrs.delete(k); },
      hasAttribute(k: string) { return attrs.has(k); },
      matches(sel: string) { return sel === `#${id}`; },
      closest(sel: string) { return sel === `#${id}` ? node : null; },
      getBoundingClientRect() { return { left: 0, top: 0, width: 40, height: 40 }; },
    };
    mockNodes.set(id, node);
  }

  let mounted = false;
  let postMountDomAllocs = 0;
  const makeStubEl = (tag: string) => {
    if (mounted) postMountDomAllocs++;
    return {
      tagName: String(tag || 'DIV').toUpperCase(),
      style: {},
      attrs: new Map<string, string>(),
      setAttribute(k: string, v: any) { this.attrs.set(k, String(v)); },
      getAttribute(k: string) { return this.attrs.get(k) ?? null; },
      removeAttribute(k: string) { this.attrs.delete(k); },
      hasAttribute(k: string) { return this.attrs.has(k); },
      appendChild(c: any) { return c; },
      remove() {},
      pause() {},
      play() { return Promise.resolve(); },
      load() {},
      addEventListener() {},
      removeEventListener() {},
    };
  };

  const container: any = {
    style: {},
    querySelector(sel: string) {
      if (!sel || !sel.startsWith('#')) return null;
      return mockNodes.get(sel.slice(1)) || null;
    },
    querySelectorAll(sel: string) {
      const el = this.querySelector(sel);
      return el ? [el] : [];
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild(c: any) { return c; },
    insertBefore(c: any) { return c; },
    removeChild(c: any) { return c; },
    contains() { return true; },
  };

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
    RegExp,
    JSON,
    Date,
    Float32Array,
    Float64Array,
    Uint8Array,
    Int32Array,
    Uint16Array,
    DataView,
    ArrayBuffer,
    TextDecoder,
    TextEncoder,
    performance,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    document: {
      activeElement: null,
      getElementById(id: string) { return mockNodes.get(id) || null; },
      querySelector(sel: string) { return container.querySelector(sel); },
      querySelectorAll(sel: string) { return container.querySelectorAll(sel); },
      createElement(tag: string) { return makeStubEl(tag); },
      createElementNS(_ns: string, tag: string) { return makeStubEl(tag); },
      addEventListener() {},
      removeEventListener() {},
    },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.addEventListener = () => {};
  sandbox.removeEventListener = () => {};

  const ctx = vm.createContext(sandbox);
  const loadScript = (name: string) => {
    const code = fs.readFileSync(path.join(playerDir, name), 'utf8');
    vm.runInContext(code, ctx, { filename: name });
  };

  loadScript('ast-expr.js');
  loadScript('ast-parser.js');
  loadScript('ast-bytecode-decoder.js');
  loadScript('ast-binding-runtime.js');
  loadScript('ast-scene-mount.js');
  loadScript('ast-engine.js');
  loadScript('site-gestures-profile.js');
  loadScript('site-gestures-actions.js');
  loadScript('site-gestures-input.js');
  loadScript('site-gestures.js');

  // Parse player-gestures.ast from disk so we test the real file!
  const profileAstText = fs.readFileSync(path.join(playerDir, 'player-gestures.ast'), 'utf8');

  // Compile .ast -> .astb -> decode back from binary .astb
  const astbBytes = compileAstTextToBytecode(astSource, { svgMarkup });
  const decodedScene = sandbox.decompileBytecode(astbBytes);

  const engine = new sandbox.ASTVectorPlayerEngine({ container });
  const gestures = new sandbox.ASTDirectGestureSubsystem(engine, container);
  gestures._parsePlayerGesturesAST(profileAstText);
  engine.gestures = gestures;

  const runtimeScene = { ...decodedScene, svgMarkup: undefined, svgText: undefined };
  engine.scene = runtimeScene;
  engine.activePresetId = runtimeScene.id;
  engine.isContinuousSim = true;
  engine.isPlaying = true;
  engine.mountSceneAsset(runtimeScene, container);
  engine._mountedSceneId = runtimeScene.id;
  engine._mountedContainer = container;
  gestures._syncCartridgeControls();
  engine.applyBindings(0, 1 / 60, false);
  mounted = true;

  const tick = (frames = 1, dtSec = 1 / 60) => {
    for (let i = 0; i < frames; i++) {
      engine.applyBindings(0, dtSec, true);
    }
  };
  const keyDown = (code: string, key = code) => {
    gestures.handleKeyDown({
      code,
      key,
      repeat: false,
      preventDefault() {},
      stopImmediatePropagation() {},
    });
  };
  const keyUp = (code: string, key = code) => {
    gestures.handleKeyUp({
      code,
      key,
      preventDefault() {},
      stopImmediatePropagation() {},
    });
  };
  const click = (domId: string) => {
    const el = mockNodes.get(domId);
    const list = gestures._getNormalizedSceneGestures(engine.scene);
    const matches = list.filter((g: any) => g.type === 'clickable' && g.target === `#${domId}`);
    for (const g of matches) {
      gestures._applyGesturePress(g, el || null, engine.scene);
    }
    engine.applyBindings(0, 0, false);
    return matches.length;
  };
  const hover = (domId: string | null) => {
    const el = domId ? mockNodes.get(domId) : { closest: () => null };
    gestures.handlePointerMove({
      target: el || { closest: () => null },
      clientX: 100,
      clientY: 100,
      buttons: 0,
      preventDefault() {},
    });
  };
  const pointerDown = (domId: string) => {
    const el = mockNodes.get(domId);
    gestures.handlePointerDown({
      target: el || { closest: () => null },
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 100,
      clientY: 100,
      preventDefault() {},
    });
  };
  const pointerUp = () => {
    gestures.handlePointerUp({
      pointerId: 1,
      pointerType: 'mouse',
      preventDefault() {},
    });
  };
  const pointerLeave = () => {
    gestures.handlePointerLeave({ pointerId: 1 });
  };

  return {
    sandbox,
    astbBytes,
    decodedScene,
    engine,
    gestures,
    mockNodes,
    getPostMountDomAllocs: () => postMountDomAllocs,
    tick,
    keyDown,
    keyUp,
    click,
    hover,
    pointerDown,
    pointerUp,
    pointerLeave,
  };
}

console.log('\n=============================================================');
console.log('🧬 AST Skill Inheritance & Composition Verification Suite');
console.log('=============================================================\n');

// 1. Multi-inheritance Arcade Shooter in ONE (:use-skill "arcade-shooter" ...) line!
console.log('1. Testing Multi-Inheritance Skill ("arcade-shooter") via .astb:');
{
  const shooterAst = `(:scene
    :id "nano-shooter"
    :type "Sim"
    :title "One-Line Skill Shooter"
    :duration 10
    (:use-skill "arcade-shooter" :actor "ship" :start-x 200 :start-y 220 :speed 10 :proj-speed 25)
    (:vars
      (:var :name "enemy_x" :val 250 :min 0 :max 640)
      (:var :name "enemy_y" :val 120 :min 0 :max 480))
  )`;
  const shooterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <g id="ship"></g>
    <g id="bullet" display="none"></g>
    <g id="enemy"></g>
  </svg>`;

  const rt = createHeadlessPlayer(shooterAst, shooterSvg);
  assert(isAstBytecode(rt.astbBytes), 'arcade-shooter compiled to valid .astb binary');

  const caps = rt.gestures.getCapabilities();
  const shooterNode = caps.astSkillGraph.find((s: any) => s.id === 'arcade-shooter');
  assert(
    Boolean(shooterNode && JSON.stringify(shooterNode.chain) === JSON.stringify(['stage-timeline', 'actor-2d', 'arrow-mover', 'projectile-shooter', 'arcade-shooter'])),
    `arcade-shooter resolved inheritance chain: ${JSON.stringify(shooterNode?.chain)}`
  );
  assert(rt.gestures.activeControls['arrow-step'] === false, 'Inherited :arrow-step :off control applied from arrow-mover');
  assert(rt.engine.vars.ship_x === 200 && rt.engine.vars.ship_y === 220, 'Inherited actor-2d startX/startY overridden by :use-skill params');

  // Move right 5 ticks (speed 10 -> 200 + 50 = 250, aligned with enemy_x=250)
  rt.keyDown('ArrowRight', 'ArrowRight');
  rt.tick(5);
  rt.keyUp('ArrowRight', 'ArrowRight');
  assert(rt.engine.vars.ship_x === 250, `ArrowRight hold moved ship_x to 250 (got ${rt.engine.vars.ship_x})`);
  const shipXf = rt.mockNodes.get('ship')?.getAttribute('transform') || '';
  assert(shipXf.includes('translate(250, 220)'), `Inherited actor-2d binding updated #ship transform (${shipXf})`);

  // Fire Spacebar -> bullet activates at (250, 220) and hits enemy at (250, 120) -> score += 10
  rt.keyDown('Space', ' ');
  rt.tick(1);
  rt.keyUp('Space', ' ');
  assert(rt.engine.vars.bullet_visible === 1, 'Inherited projectile-shooter Spacebar spawned bullet');
  rt.tick(5);
  assert(rt.engine.vars.score === 10, `Inherited projectile-shooter hitTest incremented score to 10 (got ${rt.engine.vars.score})`);
  assert(rt.engine.vars.bullet_visible === 0, 'Bullet hid after hitTest collision');
  assert(rt.engine.vars.swf_tick >= 6, `Inherited stage-timeline ticked swf_tick=${rt.engine.vars.swf_tick}`);

  rt.tick(120);
  assert(rt.getPostMountDomAllocs() === 0, 'Zero post-mount DOM allocations across 120 ticks');
}

// 2. Multi-inheritance Arena Fighter ("arena-fighter") + click & key combat
console.log('\n2. Testing Multi-Inheritance Skill ("arena-fighter") via .astb:');
{
  const fighterAst = `(:scene
    :id "nano-fighter"
    :type "Sim"
    :title "One-Line Arena Fighter"
    :duration 10
    (:use-skill "arena-fighter" :frames 3 :attack-btn "#btn-punch" :damage 40)
  )`;
  const fighterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <g id="fighter1"></g>
    <g id="btn-punch" role="button"></g>
  </svg>`;

  const rt = createHeadlessPlayer(fighterAst, fighterSvg);
  rt.keyDown('KeyD', 'd');
  rt.tick(3);
  rt.keyUp('KeyD', 'd');
  assert(rt.engine.vars.fighter1_x === 210, `Inherited wasd-mover KeyD moved fighter1_x 180 -> 210 (got ${rt.engine.vars.fighter1_x})`);

  assert(rt.engine.vars.p2_hp === 100, 'Inherited health-combat initialized p2_hp=100');
  rt.click('btn-punch');
  assert(rt.engine.vars.p2_hp === 60, `Inherited health-combat click reduced p2_hp to 60 (got ${rt.engine.vars.p2_hp})`);
  rt.keyDown('KeyJ', 'j'); rt.keyUp('KeyJ', 'j');
  rt.keyDown('KeyJ', 'j'); rt.keyUp('KeyJ', 'j');
  assert(rt.engine.vars.p2_hp === -20, `Inherited health-combat KeyJ reduced p2_hp to -20 (got ${rt.engine.vars.p2_hp})`);
  rt.tick(2);
  assert(rt.engine.vars.ko === 1, 'Inherited health-combat rule triggered ko=1');
  assert(rt.engine.vars.swf_frame === 3 && rt.engine.vars.swf_playing === 0, 'KO jumped to frame 3 and paused timeline');
  rt.tick(120);
  assert(rt.getPostMountDomAllocs() === 0, 'Zero post-mount DOM allocations across 120 ticks');
}

// 3. Cartridge-Local (:skills ...) Extending Global Built-In Skills + Explicit :var Precedence
console.log('\n3. Testing Cartridge-Local Skill Extending Global Skill + Override Precedence:');
{
  const customAst = `(:scene
    :id "local-skill-hero"
    :type "Sim"
    :title "Cartridge-Local Inherited Hero"
    :duration 10
    (:skills
      (:skill :id "dash-hero"
        :extends "wasd-mover"
        :speed 12
        :dash-step 45
        (:vars
          (:var :name "stamina" :val 100 :min 0 :max 100))
        (:gestures
          (:on-key :code "ShiftLeft" (:seq (:step-var "{{actor}}_x" :delta "{{dashStep}}") (:set-var "stamina" :val-expr "(- stamina 20)"))))))
    (:use-skill "dash-hero" :actor "hero" :start-x 100 :start-y 150)
    (:vars
      (:var :name "stamina" :val 60 :min 0 :max 100))
  )`;
  const customSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><g id="hero"></g></svg>`;

  const rt = createHeadlessPlayer(customAst, customSvg);
  assert(rt.engine.vars.stamina === 60, `Cartridge-explicit :var stamina=60 won over skill default 100 (got ${rt.engine.vars.stamina})`);
  rt.keyDown('KeyD', 'd');
  rt.tick(2);
  rt.keyUp('KeyD', 'd');
  assert(rt.engine.vars.hero_x === 124, `Child speed=12 overrode wasd-mover default 6 (100 + 24 = ${rt.engine.vars.hero_x})`);

  rt.keyDown('ShiftLeft', 'Shift');
  rt.keyUp('ShiftLeft', 'Shift');
  assert(rt.engine.vars.hero_x === 169, `Local dash-hero :seq :step-var dashed hero_x 124 -> 169 (got ${rt.engine.vars.hero_x})`);
  assert(rt.engine.vars.stamina === 40, `Local dash-hero :seq :val-expr reduced stamina 60 -> 40 (got ${rt.engine.vars.stamina})`);
}

// 4. Diamond Deduplication & Cyclic :extends Safety
console.log('\n4. Testing Diamond Deduplication & Cyclic :extends Safety:');
{
  const diamondAst = `(:scene
    :id "diamond-cycle-test"
    :type "Sim"
    :duration 5
    (:skills
      (:skill :id "base-a"
        :val-a 1
        (:vars (:var :name "counter" :val 0 :min 0 :max 100))
        (:rules (:rule :var "counter" :expr "(+ counter 1)"))
        (:bindings (:target "#box" :attr "opacity" :expr "1")))
      (:skill :id "mid-b" :extends "base-a" :val-b 2)
      (:skill :id "mid-c" :extends "base-a" :val-c 3)
      (:skill :id "leaf-d" :extends ("mid-b" "mid-c"))
      (:skill :id "cycle-x" :extends "cycle-y")
      (:skill :id "cycle-y" :extends "cycle-x"))
    (:use-skill "leaf-d")
    (:use-skill "cycle-x")
  )`;
  const diamondSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><g id="box"></g></svg>`;

  const rt = createHeadlessPlayer(diamondAst, diamondSvg);
  const reg = rt.gestures._buildSceneSkillRegistry(rt.engine.scene, rt.gestures.playerProfile.skills);
  const resolvedD = rt.gestures._resolveSkillDefinition('leaf-d', reg);
  assert(
    JSON.stringify(resolvedD.chain) === JSON.stringify(['base-a', 'mid-b', 'mid-c', 'leaf-d']),
    `Diamond chain deduplicated cleanly: ${JSON.stringify(resolvedD.chain)}`
  );
  assert(resolvedD.rules.length === 1, `Diamond ancestor rule merged exactly once (count=${resolvedD.rules.length})`);
  assert(resolvedD.bindings.length === 1, `Diamond ancestor binding merged exactly once (count=${resolvedD.bindings.length})`);

  rt.tick(5);
  assert(rt.engine.vars.counter === 5, `Diamond rule executed once per tick (5 ticks -> counter=${rt.engine.vars.counter})`);

  const resolvedCycle = rt.gestures._resolveSkillDefinition('cycle-x', reg);
  assert(Boolean(resolvedCycle && resolvedCycle.chain.includes('cycle-x') && resolvedCycle.chain.includes('cycle-y')),
    `Cyclic :extends terminated safely without infinite recursion: ${JSON.stringify(resolvedCycle?.chain)}`);
}

// 5. Native :on-enter Rising-Edge Rules & mode-screens Skill
console.log('\n5. Testing Native :on-enter Rising-Edge Rules & "mode-screens" Skill via .astb:');
{
  const modeAst = `(:scene
    :id "mode-screens-demo"
    :type "Sim"
    :title "Multi-Screen Mode Machine"
    :duration 10
    (:use-skill "mode-screens" :initial-mode 1 :max-mode 3)
    (:vars
      (:var :name "wave_count" :val 0 :min 0 :max 99)
      (:var :name "score" :val 50 :min 0 :max 999))
    (:rules
      (:on-enter :var "mode" :val 2
        (:rule :var "wave_count" :expr "(+ wave_count 1)")
        (:rule :var "score" :expr "0")))
    (:gestures
      (:on-click :target "#btn-play" :set-var "mode" :val 2)
      (:on-click :target "#btn-menu" :set-var "mode" :val 1))
  )`;
  const modeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <g id="screen-1"><g id="btn-play"></g></g>
    <g id="screen-2" display="none"><g id="btn-menu"></g></g>
    <g id="screen-3" display="none"></g>
    <g id="screen-4" display="none"></g>
  </svg>`;

  const rt = createHeadlessPlayer(modeAst, modeSvg);
  assert(rt.mockNodes.get('screen-1')?.getAttribute('display') === 'inline', 'mode-screens shows #screen-1 on initial mode=1');
  assert(rt.mockNodes.get('screen-2')?.getAttribute('display') === 'none', 'mode-screens hides #screen-2 on initial mode=1');

  // Click Play -> enters mode 2 -> :on-enter fires ONCE (wave_count=1, score=0)
  rt.click('btn-play');
  rt.tick(1);
  assert(rt.engine.vars.mode === 2 && rt.mockNodes.get('screen-2')?.getAttribute('display') === 'inline', 'Play click transitioned to mode 2 (#screen-2 inline)');
  assert(rt.engine.vars.wave_count === 1 && rt.engine.vars.score === 0, `Native :on-enter fired once on entering mode 2 (wave_count=${rt.engine.vars.wave_count}, score=${rt.engine.vars.score})`);

  // Mutate score and run 20 ticks on mode 2 -> :on-enter must NOT re-fire!
  rt.engine.vars.score = 75;
  rt.tick(20);
  assert(rt.engine.vars.wave_count === 1 && rt.engine.vars.score === 75, `Native :on-enter did not re-fire across 20 steady ticks (wave=${rt.engine.vars.wave_count}, score=${rt.engine.vars.score})`);

  // Leave mode 2 -> mode 1 -> re-enter mode 2 -> :on-enter must re-arm and fire again!
  rt.click('btn-menu');
  rt.tick(1);
  rt.click('btn-play');
  rt.tick(1);
  assert(rt.engine.vars.wave_count === 2 && rt.engine.vars.score === 0, `Native :on-enter re-armed on exit/re-entry (wave=${rt.engine.vars.wave_count}, score=${rt.engine.vars.score})`);
  assert(rt.getPostMountDomAllocs() === 0, 'Zero post-mount DOM allocations for mode-screens + :on-enter');
}

// 6. Refresh-Rate Parity (sim_scale & stage-timeline :fps 12) Across 60 Hz & 120 Hz
console.log('\n6. Testing Refresh-Rate Independence (60 Hz vs 120 Hz) for arrow-mover & stage-timeline:');
{
  const paceAst = `(:scene
    :id "refresh-rate-parity"
    :type "Sim"
    :duration 10
    (:use-skill "stage-timeline" :frames 4 :fps 12)
    (:use-skill "arrow-mover" :actor "hero" :start-x 100 :start-y 200 :speed 6)
  )`;
  const paceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><g id="hero"></g></svg>`;

  const runHalfSecond = (hz: number) => {
    const rt = createHeadlessPlayer(paceAst, paceSvg);
    let frameSteps = 0;
    let prevFrame = rt.engine.vars.swf_frame;
    rt.keyDown('ArrowRight', 'ArrowRight');
    const ticks = Math.round(hz * 0.5);
    for (let i = 0; i < ticks; i++) {
      rt.tick(1, 1 / hz);
      if (rt.engine.vars.swf_frame !== prevFrame) {
        frameSteps++;
        prevFrame = rt.engine.vars.swf_frame;
      }
    }
    rt.keyUp('ArrowRight', 'ArrowRight');
    return { x: Number(rt.engine.vars.hero_x.toFixed(3)), frameSteps, allocs: rt.getPostMountDomAllocs() };
  };

  const r60 = runHalfSecond(60);
  const r120 = runHalfSecond(120);
  assert(r60.x === 280 && r120.x === 280, `arrow-mover sim_scale moved hero identically in 0.5s: 60Hz=${r60.x}, 120Hz=${r120.x}`);
  assert(r60.frameSteps === 6 && r120.frameSteps === 6, `stage-timeline :fps 12 stepped identically in 0.5s: 60Hz=${r60.frameSteps}, 120Hz=${r120.frameSteps}`);
  assert(r60.allocs === 0 && r120.allocs === 0, 'Zero post-mount DOM allocations on both 60Hz and 120Hz runs');
}

// 7. Zero-GC 4-Slot entity-pool Skill (Multi-Projectile Spawning)
console.log('\n7. Testing Zero-GC 4-Slot "entity-pool" Skill via .astb:');
{
  const poolAst = `(:scene
    :id "pooled-shooter"
    :type "Sim"
    :duration 10
    (:use-skill "arrow-mover" :actor "ship" :start-x 240 :start-y 360 :speed 8)
    (:use-skill "entity-pool" :actor "ship" :pool "shot" :enemy "enemy" :speed 10 :cooldown 0.1)
    (:vars
      (:var :name "enemy_x" :val 240 :min 0 :max 640)
      (:var :name "enemy_y" :val 160 :min 0 :max 480))
  )`;
  const poolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <g id="ship"></g>
    <g id="enemy"></g>
    <g id="shot_0" display="none"></g>
    <g id="shot_1" display="none"></g>
    <g id="shot_2" display="none"></g>
    <g id="shot_3" display="none"></g>
  </svg>`;

  const rt = createHeadlessPlayer(poolAst, poolSvg);
  rt.keyDown('Space', ' ');
  // Hold Space for 20 ticks (~0.33s at 60Hz with 0.1s cooldown -> should spawn multiple concurrent slots!)
  rt.tick(18, 1 / 60);
  rt.keyUp('Space', ' ');
  const activeCount = [0, 1, 2, 3].filter((i) => rt.engine.vars[`shot_${i}_visible`] === 1).length;
  assert(activeCount >= 2, `entity-pool spawned multiple concurrent shots simultaneously (active=${activeCount}, idx=${rt.engine.vars.shot_idx})`);
  // Advance until shots reach enemy at y=160 -> score increments multiple times!
  rt.tick(30, 1 / 60);
  assert(rt.engine.vars.score >= 20, `entity-pool scored multiple AABB collisions against enemy (score=${rt.engine.vars.score})`);
  rt.tick(120, 1 / 60);
  assert(rt.getPostMountDomAllocs() === 0, 'Zero post-mount DOM allocations across 168 pooled simulation ticks');
}

// 8. Native :hoverable & hover-button Skill (Up / Over / Down Visual States)
console.log('\n8. Testing Native ":hoverable" & "hover-button" Skill (Up / Over / Down) via .astb:');
{
  const hoverAst = `(:scene
    :id "tactile-button-demo"
    :type "Sim"
    :duration 10
    (:use-skill "hover-button" :btn "play")
    (:vars (:var :name "clicked" :val 0 :min 0 :max 10))
    (:gestures
      (:on-click :target "#play" :hover-var "play_hover" :press-var "play_press" :step-var "clicked" :delta 1))
  )`;
  const hoverSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <g id="play">
      <g id="play-up"></g>
      <g id="play-over" display="none"></g>
      <g id="play-down" display="none"></g>
    </g>
  </svg>`;

  const rt = createHeadlessPlayer(hoverAst, hoverSvg);
  assert(
    rt.mockNodes.get('play-up')?.getAttribute('display') === 'inline' &&
    rt.mockNodes.get('play-over')?.getAttribute('display') === 'none' &&
    rt.mockNodes.get('play-down')?.getAttribute('display') === 'none',
    'hover-button starts cleanly in Up state'
  );

  // Hover enter -> Over state
  rt.hover('play');
  assert(
    rt.engine.vars.play_hover === 1 &&
    rt.mockNodes.get('play-up')?.getAttribute('display') === 'none' &&
    rt.mockNodes.get('play-over')?.getAttribute('display') === 'inline',
    'Pointer move over #play activates Over state via :hoverable'
  );

  // Pointer down -> Down state + click increments clicked=1
  rt.pointerDown('play');
  assert(
    rt.engine.vars.play_press === 1 &&
    rt.engine.vars.clicked === 1 &&
    rt.mockNodes.get('play-down')?.getAttribute('display') === 'inline' &&
    rt.mockNodes.get('play-over')?.getAttribute('display') === 'none',
    'Pointer down activates Down state (:press-var) and fires click action'
  );

  // Pointer up -> returns to Over state
  rt.pointerUp();
  assert(
    rt.engine.vars.play_press === 0 &&
    rt.mockNodes.get('play-over')?.getAttribute('display') === 'inline' &&
    rt.mockNodes.get('play-down')?.getAttribute('display') === 'none',
    'Pointer up clears Down state and returns to Over'
  );

  // Pointer leave -> returns to Up state
  rt.pointerLeave();
  assert(
    rt.engine.vars.play_hover === 0 &&
    rt.mockNodes.get('play-up')?.getAttribute('display') === 'inline' &&
    rt.mockNodes.get('play-over')?.getAttribute('display') === 'none',
    'Pointer leave clears Over state and returns to Up'
  );
  assert(rt.getPostMountDomAllocs() === 0, 'Zero post-mount DOM allocations during hover/press transitions');
}

console.log('\n=============================================================');
console.log(`Results: ${passed} passed, ${failed} failed.`);
console.log('=============================================================\n');
if (failed > 0) process.exit(1);
