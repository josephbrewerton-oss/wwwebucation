// scripts/invariants/sim-gestures-core.ts
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createHeadlessEngine } from './harness';

export async function runGesturesCoreInvariants(): Promise<number> {
  let passedTests = 0;

  // =========================================================================
  // TEST 22: Section 10 Declarative Gesture VM (100% Scene-Agnostic)
  // =========================================================================
  console.log('\n--- TEST 22: Section 10 Declarative Gesture VM Invariants ---');
  {
    const gesturesSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-gestures.js'), 'utf8');
    const engParse = createHeadlessEngine();

    // 22a. Verify ast-engine.js :gestures parser extracts :var-x, :var-y, :cx, :cy, :expr, :tone, :speak, and numeric :step
    const fishingAst = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'math-fishing.ast'), 'utf8');
    const parsedFishing = engParse.parseAst(fishingAst);
    const hookGesture = parsedFishing.gestures.find((g: any) => g.target === '#fishing-hook');
    assert(hookGesture && hookGesture.varX === 'hookX' && hookGesture.varY === 'hookY', 'Parser must extract :var-x and :var-y on draggable gestures');
    const fish1Gesture = parsedFishing.gestures.find((g: any) => g.target === '#fish-1');
    assert(fish1Gesture && fish1Gesture.expr && fish1Gesture.tone === '523.25,659.25', 'Parser must extract :expr and :tone on clickable gestures');

    const syntheticAst = `(:scene :id "vm-generic-test" :type "Sim" :duration 10.0
      (:vars (
        (:var :name "customMetric" :val 2 :min 1 :max 6 :step 1)
        (:var :name "angleDeg" :val 0 :min 0 :max 360 :step 1)
      ))
      (:gestures (
        (:draggable :target "#slider-a" :axis "x" :min 100 :max 600 :var "customMetric" :step 1)
        (:clickable :target "#btn-speak" :set-var "customMetric" :val 4 :expr "vars.customMetric = vars.customMetric + 1;" :tone "440" :speak "Metric updated")
      ))
    )`;
    const parsedSynth = engParse.parseAst(syntheticAst);
    const sliderG = parsedSynth.gestures.find((g: any) => g.target === '#slider-a');
    const speakG = parsedSynth.gestures.find((g: any) => g.target === '#btn-speak');
    assert.strictEqual(sliderG?.step, 1, 'Numeric :step must parse into numeric step field');
    assert.strictEqual(sliderG?.stepVar, null, 'Numeric :step must not pollute stepVar');
    assert.strictEqual(speakG?.speak, 'Metric updated', 'Parser must extract :speak directive');

    // Verify Section 10 does not contain removed scene hacks
    const section10Idx = gesturesSrc.indexOf('10. Dynamic Declarative Scene Gestures');
    const section10EndIdx = gesturesSrc.indexOf('handleBindInputDrag(');
    const section10Block = gesturesSrc.slice(section10Idx, section10EndIdx);
    assert(!section10Block.includes("activePresetId === 'algebra-balance'"), 'handleGenericDrag must not contain algebra-balance hack');
    assert(!section10Block.includes("varName === 'selectedRite'"), 'handleGenericDrag must not contain selectedRite hack');
    assert(!section10Block.includes("flipUnderside"), 'handleTrackballDrag must not contain flipUnderside hack');
    assert(!section10Block.includes("targetTx"), 'handleRotateDrag must not reference undeclared targetTx');

    // 22b. Execute ASTDirectGestureSubsystem inside isolated VM with lightweight DOM stubs
    const makeMockEl = (id: string, attrs: Record<string, string> = {}) => {
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
            const m = /^\[data-draggable="([^"]+)"\]$/.exec(t);
            if (m && attrMap.get('data-draggable') === m[1]) return true;
            return false;
          }),
        contains: (other: any) => other === el,
        getBBox: () => ({ x: 100, y: 20, width: 20, height: 20 }),
      };
      return el;
    };

    const containerStub = makeMockEl('stage-container');
    const stageSvg = makeMockEl('stage-svg');
    stageSvg.parentElement = containerStub;
    stageSvg.parentNode = containerStub;
    const multiClickEl = makeMockEl('multi-btn');
    const holdEl = makeMockEl('hold-btn');
    const sliderEl = makeMockEl('slider-a', { transform: 'translate(100, 18)' });
    const xyDragEl = makeMockEl('fishing-hook', { transform: 'translate(440, 240)' });
    const rotateEl = makeMockEl('dial-needle');
    const allEls = [multiClickEl, holdEl, sliderEl, xyDragEl, rotateEl];
    stageSvg.querySelectorAll = (sel: string) => allEls.filter((n) => n.matches(sel));
    stageSvg.querySelector = (sel: string) => allEls.find((n) => n.matches(sel)) || null;
    stageSvg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform: function () { return { x: this.x, y: this.y }; } });
    stageSvg.getScreenCTM = () => ({ inverse: () => ({}) });

    const setVarCalls: Array<{ name: string; val: any }> = [];
    const spokenTexts: string[] = [];
    const appliedProgress: number[] = [];

    const mockEngine: any = {
      progress: 0.42,
      isPlaying: false,
      isContinuousSim: false,
      computed: {},
      vars: { mode: 'init', charge: 10, holdActive: false, level: 1, hookX: 440, hookY: 240, dialAngle: 0, yaw: 0, pitch: 10, flipUnderside: false },
      scene: {
        id: 'any-generic-scene',
        vars: {
          level: { min: 1, max: 6, step: 1, val: 1 },
          dialAngle: { min: 0, max: 360, step: 1, val: 0 },
        },
        inputs: [{ var: 'level', min: 1, max: 6, step: 1 }],
        gestures: [
          { type: 'clickable', target: '#multi-btn', setVar: 'mode', val: 'active', tone: '523.25', speak: 'Mode active' },
          { type: 'clickable', target: '#multi-btn', expr: 'vars.charge = (vars.charge || 0) + 5;' },
          { type: 'holdable', target: '#hold-btn', holdVar: 'holdActive', val: true, releaseVal: false, expr: 'vars.charge = (vars.charge || 0) + 1;', tone: '660', speak: 'Holding' },
          { type: 'draggable', target: '#slider-a', axis: 'x', minX: 100, maxX: 600, var: 'level', step: 1 },
          { type: 'draggable', target: '#fishing-hook', axis: 'xy', minX: 80, maxX: 740, minY: 165, maxY: 440, varX: 'hookX', varY: 'hookY' },
          { type: 'rotatable', target: '#dial-needle', cx: 400, cy: 240, var: 'dialAngle' },
        ],
      },
      setVar(name: string, val: any) {
        this.vars[name] = val;
        setVarCalls.push({ name, val });
      },
      applyBindings(t: number) {
        appliedProgress.push(t);
      },
      updateComputedVars() {},
      speak(text: string) {
        spokenTexts.push(text);
      },
    };

    let rafPending: Function | null = null;
    const gSb: any = {
      window: {
        addEventListener: () => {},
        focus: () => {},
      },
      document: {
        getElementById: () => null,
        createElementNS: () => makeMockEl('tmp'),
        createElement: () => makeMockEl('tmp'),
        createTextNode: (t: string) => ({ textContent: t }),
      },
      performance: { now: () => 1000 },
      requestAnimationFrame: (cb: Function) => {
        rafPending = cb;
        return 1;
      },
      cancelAnimationFrame: () => {
        rafPending = null;
      },
      setTimeout: (fn: Function) => { fn(); return 1; },
      clearTimeout: () => {},
      console,
      Math, Number, String, Boolean, Array, Object, Set, Map, Date, Function, parseFloat, parseInt, isNaN,
    };
    gSb.globalThis = gSb;
    gSb.self = gSb.window;
    vm.runInNewContext(gesturesSrc, gSb, { filename: 'static/player/ast-gestures.js' });

    const gesturesVm = new gSb.window.ASTDirectGestureSubsystem(mockEngine);
    const tonesPlayed: number[] = [];
    gesturesVm.playAudioTone = (hz: number) => tonesPlayed.push(hz);
    gesturesVm.createTouchRipple = () => {};
    gesturesVm.init(stageSvg, null);

    // Test multi-tuple :clickable (:set-var + :expr + :tone + :speak + applyBindings(progress))
    gesturesVm.handlePointerDown({
      target: multiClickEl,
      clientX: 150,
      clientY: 150,
      pointerId: 1,
      preventDefault: () => {},
    });
    assert.strictEqual(mockEngine.vars.mode, 'active', ':clickable must execute :set-var via engine.setVar');
    assert.strictEqual(mockEngine.vars.charge, 15, ':clickable must execute second matching :expr tuple against engine.vars');
    assert(tonesPlayed.includes(523.25), ':clickable must play :tone');
    assert(spokenTexts.includes('Mode active'), ':clickable must speak :speak');
    assert(appliedProgress.includes(0.42), ':clickable must call engine.applyBindings(engine.progress)');

    // Test :holdable (:hold-var + :expr + :tone + :speak + continuous rAF tick + pointerup release)
    appliedProgress.length = 0;
    gesturesVm.handlePointerDown({
      target: holdEl,
      clientX: 200,
      clientY: 200,
      pointerId: 2,
      preventDefault: () => {},
    });
    assert.strictEqual(mockEngine.vars.holdActive, true, ':holdable must set :hold-var on press');
    assert.strictEqual(mockEngine.vars.charge, 16, ':holdable must execute :expr on press');
    assert(tonesPlayed.includes(660), ':holdable must play :tone');
    assert(spokenTexts.includes('Holding'), ':holdable must speak :speak');
    assert(appliedProgress.includes(0.42), ':holdable must call engine.applyBindings(engine.progress)');
    if (rafPending) {
      rafPending(1016);
      assert.strictEqual(mockEngine.vars.charge, 17, ':holdable rAF loop must step :expr continuously');
    }
    gesturesVm.handlePointerUp({ pointerId: 2 });
    assert.strictEqual(mockEngine.vars.holdActive, false, ':holdable must reset :hold-var to :release-val on release');

    // Test handleGenericDrag :var normalized range (scene-agnostic)
    gesturesVm.dragStart = { x: 100, y: 18 };
    gesturesVm.targetInitial = { transform: 'translate(100, 18)', initTx: 100, initTy: 18, x: 100, y: 18 };
    gesturesVm.handleGenericDrag(sliderEl, { x: 600, y: 18 });
    assert.strictEqual(mockEngine.vars.level, 6, 'handleGenericDrag must map normalized slider end to vMax=6 via engine.setVar');
    gesturesVm.handleGenericDrag(sliderEl, { x: 300, y: 18 });
    assert.strictEqual(mockEngine.vars.level, 3, 'handleGenericDrag must map normalized slider midpoint (40%) cleanly to 3');

    // Test handleGenericDrag :var-x and :var-y raw SVG coordinate mapping via engine.setVar
    setVarCalls.length = 0;
    gesturesVm.dragStart = { x: 440, y: 240 };
    gesturesVm.targetInitial = { transform: 'translate(440, 240)', initTx: 440, initTy: 240, x: 440, y: 240 };
    gesturesVm.handleGenericDrag(xyDragEl, { x: 520, y: 310 });
    assert.strictEqual(mockEngine.vars.hookX, 520, 'handleGenericDrag must set :var-x raw SVG X coordinate via engine.setVar');
    assert.strictEqual(mockEngine.vars.hookY, 310, 'handleGenericDrag must set :var-y raw SVG Y coordinate via engine.setVar');
    assert(setVarCalls.some((c) => c.name === 'hookX' && c.val === 520), 'hookX update must route through engine.setVar');
    assert(setVarCalls.some((c) => c.name === 'hookY' && c.val === 310), 'hookY update must route through engine.setVar');

    // Test handleRotateDrag (no undeclared targetTx/targetTy error, calls setVar & applyBindings)
    gesturesVm.handleRotateDrag(rotateEl, { x: 400, y: 340 }); // 90 deg below (400, 240)
    assert.strictEqual(mockEngine.vars.dialAngle, 90, 'handleRotateDrag must write computed angle via engine.setVar');

    // Test handleTrackballDrag without flipUnderside coupling
    gesturesVm.trackballYawVar = 'yaw';
    gesturesVm.trackballPitchVar = 'pitch';
    gesturesVm.trackballStartYaw = 0;
    gesturesVm.trackballStartPitch = 10;
    gesturesVm.dragStart = { x: 100, y: 100 };
    gesturesVm.handleTrackballDrag({ clientX: 150, clientY: 160 });
    assert(mockEngine.vars.pitch < 0, 'handleTrackballDrag must update negative pitch declaratively');
    assert.strictEqual(mockEngine.vars.flipUnderside, false, 'handleTrackballDrag must not mutate unrelated flipUnderside var');

    console.log('[✅ PASS] Sim 22: Section 10 Declarative Gesture VM (clickable, holdable, generic var/var-x/var-y, rotate, trackball) verified.');
    passedTests++;
  }

  // =========================================================================
  // TEST 23: Batch 1 Pure Cartridge Migration (4 RE Slider Cartridges)
  // =========================================================================
  console.log('\n--- TEST 23: Batch 1 Pure Cartridge Migration (4 RE Slider Cartridges) ---');
  {
    const gesturesSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-gestures.js'), 'utf8');
    const removedSymbols = [
      'setupCatholicRitesInteractivity',
      'handleRiteSelectorDrag',
      'setupNiceneCreedInteractivity',
      'handleCreedSliderDrag',
      'setupTenCommandmentsInteractivity',
      'handleTabletKnobDrag',
      'setupSacredObjectsInteractivity',
      'handleCategoryKnobDrag',
    ];
    for (const sym of removedSymbols) {
      assert(!gesturesSrc.includes(sym), `Legacy Batch 1 handler "${sym}" must be deleted from static/player/ast-gestures.js`);
    }

    const reCases = [
      {
        id: 'catholic-rites',
        knobId: '#rite-selector-knob',
        initTx: 140,
        dragToX: 660,
        expectedDragVarVal: 6,
        clickId: '#station-3-btn',
        expectedClickVarVal: 3,
        expectedSeek: 0.38,
        varName: 'selectedRite',
        expectedTone: 659.25,
      },
      {
        id: 'nicene-creed',
        knobId: '#creed-trinity-slider',
        initTx: 175,
        dragToX: 380,
        expectedDragVarVal: 2,
        clickId: '#creed-tab-3',
        expectedClickVarVal: 3,
        expectedSeek: 0.88,
        varName: 'creedArticle',
        expectedTone: 783.99,
      },
      {
        id: 'ten-commandments',
        knobId: '#tablet-toggle-knob',
        initTx: 260,
        dragToX: 530,
        expectedDragVarVal: 2,
        clickId: '#tablet-tab-1',
        expectedClickVarVal: 1,
        expectedSeek: 0.2,
        varName: 'selectedTablet',
        expectedTone: 440,
      },
      {
        id: 'sacred-objects',
        knobId: '#category-slider-knob',
        initTx: 72,
        dragToX: 617,
        expectedDragVarVal: 5,
        clickId: '#tab-vestments',
        expectedClickVarVal: 4,
        expectedSeek: 0.68,
        varName: 'categoryIndex',
        expectedTone: 635,
      },
    ];

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

    for (const rc of reCases) {
      const astRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', `${rc.id}.ast`), 'utf8');
      const svgRaw = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', `${rc.id}.svg`), 'utf8');
      const parseEng = createHeadlessEngine();
      const parsedScene = parseEng.parseAst(astRaw);
      await parseEng.loadSceneData(parsedScene, false);

      // Ensure SVG exposes the declarative target IDs
      const knobIdClean = rc.knobId.replace(/^#/, '');
      const clickIdClean = rc.clickId.replace(/^#/, '');
      assert(svgRaw.includes(`id="${knobIdClean}"`), `${rc.id}.svg must contain ${knobIdClean}`);
      assert(svgRaw.includes(`id="${clickIdClean}"`), `${rc.id}.svg must contain ${clickIdClean}`);

      const containerStub = makeEl('stage-container');
      const stageSvg = makeEl('stage-svg');
      stageSvg.parentElement = containerStub;
      stageSvg.parentNode = containerStub;
      const knobEl = makeEl(knobIdClean, { transform: `translate(${rc.initTx}, 17)` });
      const clickEl = makeEl(clickIdClean);
      const els = [knobEl, clickEl];
      stageSvg.querySelectorAll = (sel: string) => els.filter((n) => n.matches(sel));
      stageSvg.querySelector = (sel: string) => els.find((n) => n.matches(sel)) || null;
      stageSvg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform: function () { return { x: this.x, y: this.y }; } });
      stageSvg.getScreenCTM = () => ({ inverse: () => ({}) });

      const seeks: number[] = [];
      const tones: number[] = [];
      const vmEngine: any = {
        progress: 0,
        isPlaying: false,
        isContinuousSim: false,
        scene: parsedScene,
        vars: { ...parseEng.vars },
        computed: {},
        setVar(name: string, val: any) { this.vars[name] = val; },
        applyBindings() {},
        updateComputedVars() {},
        seek(t: number) { seeks.push(t); this.progress = t; },
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

      // 1. Declarative slider drag via handleGenericDrag
      assert.strictEqual(knobEl.getAttribute('data-draggable'), 'generic', `${rc.id} knob must register declaratively as generic draggable`);
      gVm.handlePointerDown({ target: knobEl, clientX: rc.initTx, clientY: 17, pointerId: 1, preventDefault: () => {} });
      assert.strictEqual(gVm.dragMode, 'generic', `${rc.id} knob pointerdown must route to generic dragMode`);
      gVm.handlePointerMove({ clientX: rc.dragToX, clientY: 17, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars[rc.varName], rc.expectedDragVarVal, `${rc.id} drag must update ${rc.varName} to ${rc.expectedDragVarVal}`);
      gVm.handlePointerUp({ pointerId: 1 });

      // 2. Declarative tab/station click via :clickable
      gVm.handlePointerDown({ target: clickEl, clientX: 200, clientY: 430, pointerId: 2, preventDefault: () => {} });
      assert.strictEqual(vmEngine.vars[rc.varName], rc.expectedClickVarVal, `${rc.id} click on ${rc.clickId} must update ${rc.varName} to ${rc.expectedClickVarVal}`);
      assert(tones.includes(rc.expectedTone), `${rc.id} click on ${rc.clickId} must play tone ${rc.expectedTone}Hz`);
      assert(seeks.includes(rc.expectedSeek), `${rc.id} click on ${rc.clickId} must pause-safe seek to ${rc.expectedSeek}`);
    }

    console.log('[✅ PASS] Sim 23: All 4 Batch 1 RE slider cartridges verified cleanly on declarative Section 10 VM.');
    passedTests++;
  }

  return passedTests;
}
