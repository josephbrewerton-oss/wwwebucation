// scripts/invariants/sim-gestures-stem-params.ts
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createHeadlessEngine } from './harness';

export async function runGesturesStemParamsInvariants(): Promise<number> {
  let passedTests = 0;

  // =========================================================================
  // TEST 24: Batch 2 STEM Controls Declarative VM Migration (Electric Circuits, Kinetic Gas, DNA Helix)
  // =========================================================================
  {
    console.log('\n[Test 24] Auditing Batch 2 STEM declarative VM migration (electric-circuits, kinetic-gas, dna-helix)...');
    const gesturesSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-gestures.js'), 'utf8');
    for (const legacySym of ['handlePistonDrag', 'toggleSwitch', 'dna-control-ribbon']) {
      assert(
        !gesturesSrc.includes(legacySym),
        `ast-gestures.js must not contain removed Batch 2 symbol "${legacySym}"`
      );
    }

    const makeEl = (id: string, attrs: Record<string, string> = {}) => {
      const attrMap = new Map<string, string>(Object.entries(attrs));
      const el: any = {
        id,
        style: {},
        dataset: {},
        setAttribute: (k: string, v: string) => attrMap.set(k, String(v)),
        getAttribute: (k: string) => (attrMap.has(k) ? attrMap.get(k)! : null),
        hasAttribute: (k: string) => attrMap.has(k),
        appendChild: (c: any) => c,
        append: () => {},
        replaceChildren: () => {},
        insertBefore: (c: any) => c,
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        closest: (sel: string) => (el.matches(sel) ? el : null),
        matches: (sel: string) =>
          sel.split(',').some((s) => {
            const t = s.trim();
            if (t === `#${id}`) return true;
            if (t.startsWith('.')) {
              const cls = t.slice(1);
              const classes = (attrMap.get('class') || '').split(/\s+/).filter(Boolean);
              if (classes.includes(cls)) return true;
            }
            const bare = /^\[([a-zA-Z0-9_-]+)\]$/.exec(t);
            if (bare && attrMap.has(bare[1])) return true;
            const m = /^\[([a-zA-Z0-9_-]+)="([^"]+)"\]$/.exec(t);
            if (m && attrMap.get(m[1]) === m[2]) return true;
            return false;
          }),
        contains: (other: any) => other === el,
        getBBox: () => ({ x: 0, y: 0, width: 20, height: 20 }),
      };
      return el;
    };

    const bootHeadlessStage = async (sceneId: string, elements: any[]) => {
      const astRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', `${sceneId}.ast`), 'utf8');
      const parseEng = createHeadlessEngine();
      const parsedScene = parseEng.parseAst(astRaw);
      await parseEng.loadSceneData(parsedScene, false);

      const containerStub = makeEl('stage-container');
      const stageSvg = makeEl('stage-svg');
      stageSvg.parentElement = containerStub;
      stageSvg.parentNode = containerStub;
      stageSvg.querySelectorAll = (sel: string) => elements.filter((n) => n.matches(sel));
      stageSvg.querySelector = (sel: string) => elements.find((n) => n.matches(sel)) || null;
      stageSvg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform: function () { return { x: this.x, y: this.y }; } });
      stageSvg.getScreenCTM = () => ({ inverse: () => ({}) });

      const tones: number[] = [];
      const vmEngine: any = {
        progress: 0,
        isPlaying: false,
        isContinuousSim: true,
        scene: parsedScene,
        vars: { ...parseEng.vars },
        computed: {},
        setVar(name: string, val: any) { this.vars[name] = val; },
        applyBindings() {},
        updateComputedVars() {},
        seek(t: number) { this.progress = t; },
        pause() { this.isPlaying = false; },
      };

      const gSb: any = {
        window: { addEventListener: () => {}, focus: () => {} },
        document: {
          getElementById: () => null,
          createElementNS: () => makeEl('tmp'),
          createElement: () => makeEl('tmp'),
          createTextNode: (t: string) => ({ textContent: t }),
        },
        performance: { now: () => 1000 },
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => {},
        setTimeout: (fn: Function) => { fn(); return 1; },
        clearTimeout: () => {},
        console,
        Math, Number, String, Boolean, Array, Object, Set, Map, Date, Function, parseFloat, parseInt, isNaN,
      };
      gSb.globalThis = gSb;
      gSb.self = gSb.window;
      vm.runInNewContext(gesturesSrc, gSb, { filename: 'static/player/ast-gestures.js' });

      const gVm = new gSb.window.ASTDirectGestureSubsystem(vmEngine);
      gVm.playAudioTone = (hz: number) => tones.push(hz);
      gVm.createTouchRipple = () => {};
      gVm.init(stageSvg, null);

      return { parsedScene, vmEngine, gVm, tones };
    };

    // 1. Electric Circuits
    {
      const ecSvg = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'electric-circuits.svg'), 'utf8');
      assert(!ecSvg.includes('data-interactive="switch"'), 'electric-circuits.svg must not contain legacy data-interactive="switch"');
      const switchEl = makeEl('circuit-switch', { 'data-state': 'closed' });
      const { vmEngine, gVm, tones } = await bootHeadlessStage('electric-circuits', [switchEl]);
      assert.strictEqual(vmEngine.vars.switchClosed, true, 'electric-circuits must default switchClosed to true');
      gVm.handlePointerDown({ target: switchEl, clientX: 370, clientY: 365, pointerId: 1, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.switchClosed, false, 'clicking #circuit-switch must toggle switchClosed to false');
      assert(tones.includes(360), 'clicking #circuit-switch must play 360Hz snap tone');
      gVm.handlePointerDown({ target: switchEl, clientX: 370, clientY: 365, pointerId: 2, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.switchClosed, true, 'clicking #circuit-switch again must toggle switchClosed back to true');
    }

    // 2. Kinetic Gas
    {
      const kgSvg = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'kinetic-gas.svg'), 'utf8');
      assert(!kgSvg.includes('data-interactive="gas-state"'), 'kinetic-gas.svg must not contain legacy data-interactive="gas-state"');
      const pistonEl = makeEl('piston-assembly', { transform: 'translate(430, 0)' });
      const indSolid = makeEl('ind-solid');
      const indLiquid = makeEl('ind-liquid');
      const indGas = makeEl('ind-gas');
      const { vmEngine, gVm, tones } = await bootHeadlessStage('kinetic-gas', [pistonEl, indSolid, indLiquid, indGas]);

      assert.strictEqual(pistonEl.getAttribute('data-draggable'), 'generic', 'kinetic-gas #piston-assembly must register as generic draggable');
      gVm.handlePointerDown({ target: pistonEl, clientX: 430, clientY: 200, pointerId: 1, preventDefault: () => {} });
      assert.strictEqual(gVm.dragMode, 'generic', 'piston pointerdown must route to generic dragMode');
      gVm.handlePointerMove({ clientX: 250, clientY: 200, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.volume, 0.35, 'dragging piston to x=250 must compress volume to 0.35');
      gVm.handlePointerMove({ clientX: 340, clientY: 200, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.volume, 0.68, 'dragging piston to midpoint x=340 must set volume to 0.68');
      gVm.handlePointerUp({ pointerId: 1 });

      gVm.handlePointerDown({ target: indSolid, clientX: 590, clientY: 330, pointerId: 2, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.state, 'solid', 'clicking #ind-solid must set state="solid"');
      assert.strictEqual(vmEngine.vars.temp, 85, 'clicking #ind-solid must set temp=85');
      assert(tones.includes(220), 'clicking #ind-solid must play 220Hz tone');

      gVm.handlePointerDown({ target: indLiquid, clientX: 650, clientY: 330, pointerId: 3, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.state, 'liquid', 'clicking #ind-liquid must set state="liquid"');
      assert.strictEqual(vmEngine.vars.temp, 220, 'clicking #ind-liquid must set temp=220');
      assert(tones.includes(440), 'clicking #ind-liquid must play 440Hz tone');

      gVm.handlePointerDown({ target: indGas, clientX: 720, clientY: 330, pointerId: 4, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.state, 'gas', 'clicking #ind-gas must set state="gas"');
      assert.strictEqual(vmEngine.vars.temp, 300, 'clicking #ind-gas must set temp=300');
      assert(tones.includes(660), 'clicking #ind-gas must play 660Hz tone');
    }

    // 3. DNA Helix
    {
      const dnaSvg = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'dna-helix.svg'), 'utf8');
      assert(!dnaSvg.includes('data-action="dna-'), 'dna-helix.svg must not contain legacy data-action="dna-*"');
      const btnUnzip50 = makeEl('btn-dna-unzip-50');
      const btnFilterAt = makeEl('btn-dna-filter-at');
      const btnSpeed2 = makeEl('btn-dna-speed-2');
      const rung0 = makeEl('dna-line-0', { class: 'dna-rung-at', 'data-rung': '1' });
      const rung1 = makeEl('dna-ca-1', { class: 'dna-rung-cg', 'data-rung': '2' });

      const { parsedScene, vmEngine, gVm, tones } = await bootHeadlessStage('dna-helix', [
        btnUnzip50, btnFilterAt, btnSpeed2, rung0, rung1,
      ]);

      // First click rung 0 (A=T), verify chord + inspectedRung=1
      gVm.handlePointerDown({ target: rung0, clientX: 400, clientY: 60, pointerId: 1, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.inspectedRung, 1, 'clicking .dna-rung-at must set inspectedRung=1');
      assert(tones.includes(523.25) && tones.includes(659.25), 'clicking A=T rung must play 523.25Hz + 659.25Hz');

      // Click rung 1 (C=G), verify chord + inspectedRung=2
      gVm.handlePointerDown({ target: rung1, clientX: 300, clientY: 80, pointerId: 2, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.inspectedRung, 2, 'clicking .dna-rung-cg must set inspectedRung=2');
      assert(tones.includes(440) && tones.includes(554.37), 'clicking C=G rung must play C=G chord');

      // Click unzip 50 -> resets inspectedRung=0 and sets unzipProgress=0.5
      gVm.handlePointerDown({ target: btnUnzip50, clientX: 250, clientY: 440, pointerId: 3, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.unzipProgress, 0.5, 'clicking #btn-dna-unzip-50 must set unzipProgress=0.5');
      assert.strictEqual(vmEngine.vars.inspectedRung, 0, 'clicking #btn-dna-unzip-50 must clear inspectedRung to 0');
      assert(tones.includes(554.37), 'clicking #btn-dna-unzip-50 must play 554.37Hz');

      // Click speed 2x and filter AT
      gVm.handlePointerDown({ target: btnSpeed2, clientX: 730, clientY: 440, pointerId: 4, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.rotSpeed, 2.0, 'clicking #btn-dna-speed-2 must set rotSpeed=2.0');
      assert(tones.includes(600), 'clicking #btn-dna-speed-2 must play 600Hz');

      gVm.handlePointerDown({ target: btnFilterAt, clientX: 520, clientY: 440, pointerId: 5, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars.baseFilter, 'at', 'clicking #btn-dna-filter-at must set baseFilter="at"');
      assert(tones.includes(659.25), 'clicking #btn-dna-filter-at must play 659.25Hz');

      // Verify binding expressions for DNA status & baseFilter exist
      const cgLineBinding = (parsedScene.bindings || []).find((b: any) => b.target === '#dna-line-1' && b.attr === 'stroke-opacity');
      assert(cgLineBinding, 'dna-helix.ast must declare stroke-opacity binding for #dna-line-1');
      const evalFilter = new Function('vars', 'return ' + cgLineBinding.expr);
      assert.strictEqual(evalFilter({ baseFilter: 'at' }), '0.12', 'dna-line-1 stroke-opacity must dim to 0.12 when baseFilter="at"');
      assert.strictEqual(evalFilter({ baseFilter: 'all' }), '1.0', 'dna-line-1 stroke-opacity must be 1.0 when baseFilter="all"');
    }

    console.log('[✅ PASS] Sim 24: Batch 2 STEM declarative VM migration (electric-circuits, kinetic-gas, dna-helix) verified cleanly.');
    passedTests++;
  }

  // =========================================================================
  // TEST 25: Batch 3 STEM Geometry & Elevation Drag Handles (Mountain Elevation, Calculus Curves, Pythagoras)
  // =========================================================================
  {
    console.log('\n[Test 25] Auditing Batch 3 STEM declarative VM migration (mountain-elevation, calculus-curves, pythagoras)...');
    const gesturesSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-gestures.js'), 'utf8');
    for (const legacySym of [
      'handleClimberDrag',
      'handleTangentProbeDrag',
      'handlePythagorasDragA',
      'handlePythagorasDragB',
      'renderPythagorasGeometry',
      'pyth-triple-chip',
    ]) {
      assert(
        !gesturesSrc.includes(legacySym),
        `ast-gestures.js must not contain removed Batch 3 symbol "${legacySym}"`
      );
    }

    const makeEl = (id: string, attrs: Record<string, string> = {}) => {
      const attrMap = new Map<string, string>(Object.entries(attrs));
      const el: any = {
        id,
        isConnected: true,
        textContent: '',
        style: {},
        dataset: {},
        setAttribute: (k: string, v: string) => attrMap.set(k, String(v)),
        getAttribute: (k: string) => (attrMap.has(k) ? attrMap.get(k)! : null),
        hasAttribute: (k: string) => attrMap.has(k),
        appendChild: (c: any) => c,
        append: () => {},
        replaceChildren: () => {},
        insertBefore: (c: any) => c,
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        closest: (sel: string) => (el.matches(sel) ? el : null),
        matches: (sel: string) =>
          sel.split(',').some((s) => {
            const t = s.trim();
            if (t === `#${id}`) return true;
            if (t.startsWith('.')) {
              const cls = t.slice(1);
              const classes = (attrMap.get('class') || '').split(/\s+/).filter(Boolean);
              if (classes.includes(cls)) return true;
            }
            const bare = /^\[([a-zA-Z0-9_-]+)\]$/.exec(t);
            if (bare && attrMap.has(bare[1])) return true;
            const m = /^\[([a-zA-Z0-9_-]+)="([^"]+)"\]$/.exec(t);
            if (m && attrMap.get(m[1]) === m[2]) return true;
            return false;
          }),
        contains: (other: any) => other === el,
        getBBox: () => ({ x: 0, y: 0, width: 20, height: 20 }),
      };
      return el;
    };

    const bootBatch3Stage = async (sceneId: string, elements: any[]) => {
      const astRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', `${sceneId}.ast`), 'utf8');
      const engine = createHeadlessEngine();
      const parsedScene = engine.parseAst(astRaw);
      parsedScene.svgText = '';

      const containerStub = makeEl('stage-container');
      const stageSvg = makeEl('stage-svg');
      stageSvg.parentElement = containerStub;
      stageSvg.parentNode = containerStub;
      stageSvg.querySelectorAll = (sel: string) => elements.filter((n) => n.matches(sel));
      stageSvg.querySelector = (sel: string) => elements.find((n) => n.matches(sel)) || null;
      stageSvg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform: function () { return { x: this.x, y: this.y }; } });
      stageSvg.getScreenCTM = () => ({ inverse: () => ({}) });

      engine.scene = parsedScene;
      engine.activePresetId = parsedScene.id || sceneId;
      engine.durationSec = parsedScene.duration || 10.0;
      engine.isContinuousSim = parsedScene.type === 'Sim';
      engine._container = stageSvg;
      engine.container = stageSvg;
      engine.mountSceneAsset(parsedScene, stageSvg);
      engine.applyBindings(0);

      const seeks: number[] = [];
      const origSeek = engine.seek.bind(engine);
      engine.seek = (p: number) => {
        seeks.push(p);
        return origSeek(p, true);
      };

      const gSb: any = {
        window: { addEventListener: () => {}, focus: () => {} },
        document: {
          getElementById: () => null,
          createElementNS: () => makeEl('tmp'),
          createElement: () => makeEl('tmp'),
          createTextNode: (t: string) => ({ textContent: t }),
        },
        performance: { now: () => 1000 },
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: () => {},
        setTimeout: (fn: Function) => { fn(); return 1; },
        clearTimeout: () => {},
        console,
        Math, Number, String, Boolean, Array, Object, Set, Map, Date, Function, parseFloat, parseInt, isNaN,
      };
      gSb.globalThis = gSb;
      gSb.self = gSb.window;
      vm.runInNewContext(gesturesSrc, gSb, { filename: 'static/player/ast-gestures.js' });

      const tones: number[] = [];
      const gVm = new gSb.window.ASTDirectGestureSubsystem(engine);
      gVm.playAudioTone = (hz: number) => tones.push(hz);
      gVm.createTouchRipple = () => {};
      gVm.init(stageSvg, null);

      return { parsedScene, engine, gVm, tones, seeks };
    };

    // 1. Mountain Elevation
    {
      const mtnSvg = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'mountain-elevation.svg'), 'utf8');
      assert(!mtnSvg.includes('data-interactive='), 'mountain-elevation.svg must not contain legacy data-interactive attribute');
      const climberBeacon = makeEl('climber-beacon', { transform: 'translate(180, 380)' });
      const verticalLine = makeEl('vertical-line');
      const baseLine = makeEl('base-line');
      const altitudeText = makeEl('altitude-text');
      const tempText = makeEl('temp-text');
      const hypotenuseText = makeEl('hypotenuse-text');

      const { engine, gVm, seeks } = await bootBatch3Stage('mountain-elevation', [
        climberBeacon, verticalLine, baseLine, altitudeText, tempText, hypotenuseText,
      ]);

      assert.strictEqual(climberBeacon.getAttribute('data-draggable'), 'generic', 'mountain-elevation #climber-beacon must register as generic draggable');
      assert.strictEqual(climberBeacon.getAttribute('data-gesture-seek'), 'true', 'mountain-elevation #climber-beacon must carry data-gesture-seek="true"');
      assert.strictEqual(climberBeacon.getAttribute('data-gesture-invert'), 'true', 'mountain-elevation #climber-beacon must carry data-gesture-invert="true"');

      gVm.handlePointerDown({ target: climberBeacon, clientX: 180, clientY: 380, pointerId: 1, preventDefault: () => {} });
      assert.strictEqual(gVm.dragMode, 'generic', 'climber pointerdown must route to generic dragMode');
      gVm.handlePointerMove({ clientX: 290, clientY: 260, preventDefault: () => {} });
      assert(Math.abs(seeks[seeks.length - 1] - 0.5) < 1e-6, 'dragging climber halfway up ridge must seek to 0.5');
      assert.strictEqual(climberBeacon.getAttribute('transform'), 'translate(290.0, 260.0)', 'seek(0.5) must move #climber-beacon to translate(290.0, 260.0)');
      assert.strictEqual(altitudeText.textContent, 'Altitude: 1500 m', 'seek(0.5) must update #altitude-text to 1500 m');

      gVm.handlePointerMove({ clientX: 400, clientY: 140, preventDefault: () => {} });
      assert(Math.abs(seeks[seeks.length - 1] - 1.0) < 1e-6, 'dragging climber to summit must seek to 1.0');
      assert.strictEqual(climberBeacon.getAttribute('transform'), 'translate(400.0, 140.0)', 'seek(1.0) must move #climber-beacon to summit translate(400.0, 140.0)');
      assert.strictEqual(altitudeText.textContent, 'Altitude: 3000 m', 'seek(1.0) must update #altitude-text to 3000 m');
      gVm.handlePointerUp({ pointerId: 1 });
    }

    // 2. Calculus Curves
    {
      const tangentAssembly = makeEl('tangent-assembly', { transform: 'translate(300, 235)' });
      const tangentLine = makeEl('tangent-line');
      const cardSlopeVal = makeEl('card-slope-val');
      const integralArea = makeEl('integral-shaded-area');
      const theoremNote = makeEl('calc-theorem-note');

      const { engine, gVm } = await bootBatch3Stage('calculus-curves', [
        tangentAssembly, tangentLine, cardSlopeVal, integralArea, theoremNote,
      ]);

      assert.strictEqual(engine.vars.probeX, 1.0, 'calculus-curves initial probeX must be 1.0');
      assert.strictEqual(tangentAssembly.getAttribute('transform'), 'translate(300.0, 235.0)', 'initial #tangent-assembly must sit at vertex (300.0, 235.0)');
      assert.strictEqual(tangentLine.getAttribute('transform'), 'rotate(0.0)', 'initial #tangent-line at vertex x=1 must be horizontal (rotate(0.0))');
      assert.strictEqual(cardSlopeVal.textContent, 'm = +0.00', 'initial slope card must display m = +0.00');

      gVm.handlePointerDown({ target: tangentAssembly, clientX: 300, clientY: 235, pointerId: 1, preventDefault: () => {} });
      assert.strictEqual(gVm.dragMode, 'generic', 'calculus-curves pointerdown must route to generic dragMode');
      gVm.handlePointerMove({ clientX: 350, clientY: 210, preventDefault: () => {} });
      assert.strictEqual(engine.vars.probeX, 2, 'dragging #tangent-assembly +50px must set probeX to 2');
      assert.strictEqual(tangentAssembly.getAttribute('transform'), 'translate(350.0, 210.0)', 'x=2 binding must move #tangent-assembly to translate(350.0, 210.0)');
      assert.strictEqual(tangentLine.getAttribute('transform'), 'rotate(-63.4)', 'x=2 derivative (dy/dx=2) must rotate #tangent-line by -63.4 deg');
      assert.strictEqual(cardSlopeVal.textContent, 'm = +2.00', 'x=2 slope card must display m = +2.00');
      gVm.handlePointerUp({ pointerId: 1 });
    }

    // 3. Pythagoras
    {
      const pythSvg = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'pythagoras.svg'), 'utf8');
      assert(!pythSvg.includes('data-draggable="pyth-handle-'), 'pythagoras.svg must not contain legacy data-draggable attributes');

      const pythIds = [
        'pyth-triangle', 'pyth-right-angle', 'pyth-right-angle-dot',
        'pyth-rect-a', 'pyth-pat-a', 'pyth-pat-a-path', 'pyth-grid-a', 'pyth-badge-a', 'pyth-txt-a',
        'pyth-rect-b', 'pyth-pat-b', 'pyth-pat-b-path', 'pyth-grid-b', 'pyth-badge-b', 'pyth-txt-b',
        'pyth-group-c', 'pyth-rect-c', 'pyth-pat-c', 'pyth-pat-c-path', 'pyth-grid-c', 'pyth-badge-c', 'pyth-txt-c',
        'pyth-handle-a', 'pyth-handle-b',
        'pyth-label-a-bg', 'pyth-label-a', 'pyth-label-b-bg', 'pyth-label-b', 'pyth-label-c-bg', 'pyth-label-c',
        'pyth-banner-tspan-a', 'pyth-banner-tspan-b', 'pyth-banner-tspan-c', 'pyth-banner-tail',
        'pyth-chip-345', 'pyth-chip-6810', 'pyth-chip-51213', 'pyth-chip-81517', 'pyth-chip-91215', 'pyth-chip-112',
        'pyth-chip-grid', 'pyth-chip-grid-bg',
      ];
      const pythEls = new Map<string, any>();
      for (const id of pythIds) {
        pythEls.set(id, makeEl(id));
      }
      pythEls.get('pyth-group-c')!.setAttribute('transform', 'translate(360, 196) rotate(36.87)');
      pythEls.get('pyth-handle-a')!.setAttribute('transform', 'translate(360, 196)');
      pythEls.get('pyth-handle-b')!.setAttribute('transform', 'translate(472, 280)');

      const { engine, gVm, tones } = await bootBatch3Stage('pythagoras', Array.from(pythEls.values()));

      // Initial (3, 4, 5) geometry & positive hypotenuse square rotation (+36.87 deg)
      assert.strictEqual(
        pythEls.get('pyth-group-c')!.getAttribute('transform'),
        'translate(360.0, 196.0) rotate(36.87)',
        'initial 3-4-5 #pyth-group-c transform must use positive 36.87 deg rotation'
      );
      assert.strictEqual(pythEls.get('pyth-grid-c')!.getAttribute('opacity'), '0.5', 'initial 3-4-5 must show hypotenuse unit tile grid');

      // Relative + inverted vertical drag on #pyth-handle-a (dy = -40 -> delta +2 units -> sideA = 5)
      const handleA = pythEls.get('pyth-handle-a')!;
      assert.strictEqual(handleA.getAttribute('data-gesture-relative'), 'true', '#pyth-handle-a must carry data-gesture-relative="true"');
      assert.strictEqual(handleA.getAttribute('data-gesture-invert'), 'true', '#pyth-handle-a must carry data-gesture-invert="true"');
      gVm.handlePointerDown({ target: handleA, clientX: 360, clientY: 196, pointerId: 1, preventDefault: () => {} });
      gVm.handlePointerMove({ clientX: 360, clientY: 196, preventDefault: () => {} });
      assert.strictEqual(engine.vars.sideA, 3, '0px drag on relative #pyth-handle-a must produce zero jump');
      gVm.handlePointerMove({ clientX: 360, clientY: 156, preventDefault: () => {} });
      assert.strictEqual(engine.vars.sideA, 5, '-40px upward drag on #pyth-handle-a must set sideA = 5');
      gVm.handlePointerUp({ pointerId: 1 });

      // Click triple chip 5-12-13
      gVm.handlePointerDown({ target: pythEls.get('pyth-chip-51213')!, clientX: 320, clientY: 455, pointerId: 2, preventDefault: () => {} });
      assert.strictEqual(engine.vars.sideA, 5, 'clicking #pyth-chip-51213 must set sideA=5');
      assert.strictEqual(engine.vars.sideB, 12, 'clicking #pyth-chip-51213 must set sideB=12');
      assert.strictEqual(engine.vars.areaC, 169, '5-12-13 must compute areaC=169');
      assert.strictEqual(engine.vars.hypotenuse, 13, '5-12-13 must compute hypotenuse=13');
      assert.strictEqual(pythEls.get('pyth-grid-c')!.getAttribute('opacity'), '0.5', 'integer triple 5-12-13 must keep hypotenuse unit grid visible');
      assert(tones.includes(880), 'clicking #pyth-chip-51213 must play 880Hz tone');

      // Click irrational 1-1-sqrt(2) chip
      gVm.handlePointerDown({ target: pythEls.get('pyth-chip-112')!, clientX: 570, clientY: 455, pointerId: 3, preventDefault: () => {} });
      assert.strictEqual(engine.vars.sideA, 1, 'clicking #pyth-chip-112 must set sideA=1');
      assert.strictEqual(engine.vars.sideB, 1, 'clicking #pyth-chip-112 must set sideB=1');
      assert.strictEqual(engine.vars.areaC, 2, '1-1-sqrt(2) must compute areaC=2');
      assert.strictEqual(pythEls.get('pyth-grid-c')!.getAttribute('opacity'), '0', 'irrational hypotenuse c=sqrt(2) must hide hypotenuse tile grid');

      // Toggle unit grid off
      gVm.handlePointerDown({ target: pythEls.get('pyth-chip-grid')!, clientX: 645, clientY: 455, pointerId: 4, preventDefault: () => {} });
      assert.strictEqual(engine.vars.showGrid, false, 'clicking #pyth-chip-grid must toggle showGrid=false');
      assert.strictEqual(pythEls.get('pyth-grid-a')!.getAttribute('opacity'), '0', 'showGrid=false must hide square A unit tile grid');
    }

    console.log('[✅ PASS] Sim 25: Batch 3 STEM declarative VM migration (mountain-elevation, calculus-curves, pythagoras) verified cleanly.');
    passedTests++;
  }

  // Sim 26: Parameters UI Deduplication (:inputs wins over :vars), WebMCP varMeta bounds & bidirectional sync
  {
    const createTreeMockDoc = () => {
      const matchesSimple = (node: any, sel: string): boolean => {
        return sel.split(',').some((part) => {
          const s = part.trim();
          if (!s) return false;
          if (s.startsWith('#')) {
            const rest = s.slice(1);
            const [idPart, ...pseudos] = rest.split(':');
            if (node.id !== idPart) return false;
            if (pseudos.includes('not(.hidden)') && node._classes?.has('hidden')) return false;
            return true;
          }
          const tagAttr = /^([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]$/.exec(s);
          if (tagAttr) {
            if (node.tagName.toLowerCase() !== tagAttr[1].toLowerCase()) return false;
            const av = node.getAttribute(tagAttr[2]);
            return tagAttr[3] !== undefined ? av === tagAttr[3] : av !== null;
          }
          const bareAttr = /^\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]$/.exec(s);
          if (bareAttr) {
            const av = node.getAttribute(bareAttr[1]);
            return bareAttr[2] !== undefined ? av === bareAttr[2] : av !== null;
          }
          if (s.startsWith('.')) return node._classes?.has(s.slice(1));
          return node.tagName.toLowerCase() === s.toLowerCase();
        });
      };

      const doc: any = {};
      const makeNode = (tagName: string): any => {
        const attrs = new Map<string, string>();
        const listeners = new Map<string, Function[]>();
        const node: any = {
          tagName: tagName.toUpperCase(),
          children: [] as any[],
          get childNodes() { return this.children; },
          parentElement: null,
          parentNode: null,
          ownerDocument: doc,
          style: {},
          _classes: new Set<string>(),
          _textContent: '',
          _value: '',
          get id() { return attrs.get('id') || ''; },
          set id(v: string) { attrs.set('id', String(v)); },
          get type() { return attrs.get('type') || ''; },
          set type(v: string) { attrs.set('type', String(v)); },
          get min() { return attrs.get('min') || ''; },
          set min(v: string) { attrs.set('min', String(v)); },
          get max() { return attrs.get('max') || ''; },
          set max(v: string) { attrs.set('max', String(v)); },
          get step() { return attrs.get('step') || ''; },
          set step(v: string) { attrs.set('step', String(v)); },
          get value() { return this._value; },
          set value(v: string) { this._value = String(v); },
          get textContent() { return this._textContent; },
          set textContent(v: string) { this._textContent = String(v); },
          get className() { return Array.from(this._classes).join(' '); },
          set className(v: string) {
            this._classes = new Set(String(v).split(/\s+/).filter(Boolean));
          },
          setAttribute: (k: string, v: string) => {
            attrs.set(k, String(v));
            if (k === 'class') node.className = v;
          },
          getAttribute: (k: string) => (attrs.has(k) ? attrs.get(k)! : null),
          hasAttribute: (k: string) => attrs.has(k),
          appendChild: (c: any) => {
            c.parentElement = node;
            c.parentNode = node;
            c.ownerDocument = doc;
            node.children.push(c);
            return c;
          },
          append: (...items: any[]) => items.forEach((it) => node.appendChild(it)),
          replaceChildren: (...items: any[]) => {
            node.children = [];
            items.forEach((it) => node.appendChild(it));
          },
          insertBefore: (c: any) => node.appendChild(c),
          remove: () => {
            if (node.parentNode && Array.isArray(node.parentNode.children)) {
              node.parentNode.children = node.parentNode.children.filter((x: any) => x !== node);
            }
            node.parentNode = null;
            node.parentElement = null;
          },
          contains: (target: any): boolean => {
            if (target === node) return true;
            return node.children.some((ch: any) => ch.contains(target));
          },
          querySelectorAll: (sel: string): any[] => {
            const out: any[] = [];
            const walk = (n: any) => {
              for (const ch of n.children) {
                if (matchesSimple(ch, sel)) out.push(ch);
                walk(ch);
              }
            };
            walk(node);
            return out;
          },
          querySelector: (sel: string): any => node.querySelectorAll(sel)[0] || null,
          addEventListener: (evt: string, fn: Function) => {
            if (!listeners.has(evt)) listeners.set(evt, []);
            listeners.get(evt)!.push(fn);
          },
          dispatchEvent: (evt: any) => {
            const fns = listeners.get(evt.type) || [];
            fns.forEach((fn) => fn(evt));
          },
        };
        return node;
      };

      const body = makeNode('body');
      const stage = makeNode('div');
      stage.id = 'player-stage';
      const stageSvg = makeNode('svg');
      stageSvg.id = 'stage-svg';
      stage.appendChild(stageSvg);
      body.appendChild(stage);

      doc.body = body;
      doc.createElement = (t: string) => makeNode(t);
      doc.createElementNS = (_ns: string, t: string) => makeNode(t);
      doc.createTextNode = (txt: string) => {
        const n = makeNode('#text');
        n.textContent = txt;
        return n;
      };
      doc.getElementById = (id: string) => body.querySelector(`#${id}`);
      doc.querySelector = (sel: string) => body.querySelector(sel);
      doc.querySelectorAll = (sel: string) => body.querySelectorAll(sel);
      return { doc, stage, stageSvg };
    };

    // A. solar-system.ast: 1 warpSpeed slider + 1 showOrbits toggle, :inputs label wins, varMeta intact, bidirectional sync
    {
      const solarAst = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'solar-system.ast'), 'utf8');
      const { doc, stageSvg } = createTreeMockDoc();
      const engine = createHeadlessEngine();
      const parsedSolar = engine.parseAst(solarAst);
      const controls = engine.resolveParameterControls(parsedSolar);

      assert.strictEqual(controls.length, 2, `solar-system must resolve exactly 2 deduplicated controls (got ${controls.length})`);
      assert.strictEqual(controls[0].var, 'warpSpeed', 'solar-system first control must preserve :inputs order (warpSpeed)');
      assert.strictEqual(controls[0].type, 'slider', 'warpSpeed control must be a slider');
      assert.strictEqual(controls[0].label, 'Orbital Speed Multiplier', 'explicit :inputs label must win for warpSpeed');
      assert.strictEqual(controls[1].var, 'showOrbits', 'solar-system second control must be showOrbits');
      assert.strictEqual(controls[1].type, 'toggle', 'showOrbits control must be a toggle');
      assert.strictEqual(controls[1].label, 'Orbital Paths', 'explicit :inputs label must win for showOrbits');

      engine.container = stageSvg;
      engine._container = stageSvg;
      engine.initScene(parsedSolar);

      const summary = engine.getEngineStateSummary(false);
      assert.strictEqual(summary.varMeta.warpSpeed.min, 0.2, 'varMeta.warpSpeed.min must remain preserved at 0.2');
      assert.strictEqual(summary.varMeta.warpSpeed.max, 10, 'varMeta.warpSpeed.max must remain preserved at 10');
      assert.strictEqual(summary.varMeta.warpSpeed.step, 0.2, 'varMeta.warpSpeed.step must remain preserved at 0.2');

      const hud = doc.querySelector('#ast-declarative-hud');
      assert.ok(hud, 'mountDeclarativeHud must mount #ast-declarative-hud for solar-system');
      assert.strictEqual(hud.querySelectorAll('input[type="range"]').length, 1, 'solar-system Parameters must render strictly 1 slider');
      assert.strictEqual(hud.querySelectorAll('button[role="switch"]').length, 1, 'solar-system Parameters must render strictly 1 switch');

      // Simulate external state updates (WebMCP ast_set_var / solar-warp-* chip / keyboard step)
      engine.setMemoryVar('warpSpeed', 5.0);
      const sliderEl = hud.querySelector('input[type="range"]');
      const readoutEl = hud.querySelector('[data-param-readout="warpSpeed"]');
      assert.strictEqual(sliderEl.value, '5', 'slider value must sync to 5 on external setMemoryVar');
      assert.strictEqual(readoutEl.textContent, '5', 'slider readout must sync to 5 on external setMemoryVar');

      engine.resetVars();
      assert.strictEqual(sliderEl.value, '1', 'slider value must sync back to default 1 on resetVars');
    }

    // B. Cartridge with ONLY (:vars ...) bounds and no (:inputs ...) still auto-generates sliders cleanly
    {
      const vectorRacingAst = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'vector-racing.ast'), 'utf8');
      const engine = createHeadlessEngine();
      const parsedRacing = engine.parseAst(vectorRacingAst);
      const racingControls = engine.resolveParameterControls(parsedRacing);
      assert.ok(racingControls.length >= 1, 'vector-racing (:vars-only bounds) must auto-generate Parameter controls');
      assert.ok(racingControls.some((c: any) => c.var === 'speed' && c.type === 'slider'), 'vector-racing must auto-generate speed slider');
      assert.ok(racingControls.some((c: any) => c.var === 'autoPilot' && c.type === 'toggle'), 'vector-racing must auto-generate autoPilot toggle');

      const luminaRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'docs', 'lumina-architecture.ast'), 'utf8');
      const luminaVarsOnly = luminaRaw.replace(/\(:inputs[\s\S]*?\)\s*\)\s*(?=\(:computed)/m, '');
      const { doc, stageSvg } = createTreeMockDoc();
      const parsedLumina = engine.parseAst(luminaVarsOnly);
      const luminaControls = engine.resolveParameterControls(parsedLumina);
      assert.strictEqual(luminaControls.length, 3, 'vars-only lumina-architecture must auto-generate 3 bounded sliders');
      engine.container = stageSvg;
      engine._container = stageSvg;
      engine.initScene(parsedLumina);
      const hud = doc.querySelector('#ast-declarative-hud');
      assert.strictEqual(hud.querySelectorAll('input[type="range"]').length, 3, 'vars-only scene must mount all 3 bounded sliders');
    }

    // C. Mixed cartridge: explicit :inputs claim matching vars while remaining bounded :vars still appear
    {
      const mixedAst = `
        (:scene :id "mixed-params" :type "Sim" :title "Mixed Params" :duration 5.0
          (:vars (
            (:var :name "gain" :val 2 :min 1 :max 10 :step 1 :label "Var Gain")
            (:var :name "damping" :val 0.5 :min 0.1 :max 2.0 :step 0.1 :label "Damping Ratio")
            (:var :name "modeLabel" :val "auto")
          ))
          (:inputs (
            (:slider :var "gain" :label "Amplifier Gain" :min 1 :max 10 :step 1)
          ))
        )
      `;
      const engine = createHeadlessEngine();
      const parsedMixed = engine.parseAst(mixedAst);
      const mixedControls = engine.resolveParameterControls(parsedMixed);
      assert.strictEqual(mixedControls.length, 2, 'mixed cartridge must produce 1 explicit gain + 1 auto damping slider');
      assert.strictEqual(mixedControls[0].var, 'gain');
      assert.strictEqual(mixedControls[0].label, 'Amplifier Gain');
      assert.strictEqual(mixedControls[1].var, 'damping');
      assert.strictEqual(mixedControls[1].label, 'Damping Ratio');
    }

    console.log('[✅ PASS] Sim 26: Parameters UI deduplication, :inputs precedence, varMeta clamping integrity & bidirectional sync verified cleanly.');
    passedTests++;
  }

  return passedTests;
}
