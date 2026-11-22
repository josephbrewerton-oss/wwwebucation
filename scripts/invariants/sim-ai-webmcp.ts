// scripts/invariants/sim-ai-webmcp.ts
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import {
  buildSafeActionTuple,
  clampVarValue,
  createPlayerWebMcpTools,
  detectWebMcpSurface,
  registerWebMcpTools as registerPlayerWebMcpTools,
  runWebMcpBenchmark,
  type PlayerMcpTransport,
} from '../../src/engine/webmcpBridge';
import {
  registerWebMcpTools as registerPortalWebMcpTools,
  unregisterWebMcpTools as unregisterPortalWebMcpTools,
} from '../../src/services/webMcpBridge';
import {
  computeAstVsJsonCompression,
  formatEppReportMarkdown,
  type EppTelemetryDossier,
} from '../../src/engine/eppContentionBench';
import { createHeadlessEngine, loadAstPlayerRuntimeIntoSandbox } from './harness';

export async function runAiWebMcpInvariants(): Promise<number> {
  let passedTests = 0;

  // =========================================================================
  // TEST 18: Chrome Built-in AI & WebMCP Telemetry Harness Invariants
  // =========================================================================
  console.log('\n--- TEST 18: Chrome EPP Contention Profiler, Compression & WebMCP Bridge ---');
  {
    // 18a. ASTProfiler zero-GC capture ring buffer & percentile calculations
    const sb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, WeakSet,
      ArrayBuffer, DataView, Float32Array, Float64Array, Int32Array, Uint8Array,
      TextDecoder, TextEncoder, RegExp, Error, JSON,
      URLSearchParams, parseFloat, parseInt, isNaN, isFinite,
      setTimeout, clearTimeout, performance: { now: () => Date.now() },
    };
    sb.globalThis = sb;
    sb.self = sb;
    loadAstPlayerRuntimeIntoSandbox(sb);

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
    const profStats = profiler.stopCapture(16.67);
    assert.strictEqual(profiler.captureDeltas, deltaBufRef, 'captureDeltas Float32Array must never reallocate in hot loop');
    assert.strictEqual(profiler.captureComputes, computeBufRef, 'captureComputes Float32Array must never reallocate in hot loop');
    assert.strictEqual(profStats.sampleCount, 99, `Expected 99 inter-frame delta samples, got ${profStats.sampleCount}`);
    assert.strictEqual(profStats.framesOver16_67ms, 2, `Expected 2 over-budget frames (>16.67ms), got ${profStats.framesOver16_67ms}`);
    assert.strictEqual(profStats.rawVsyncOverruns, 2, `Expected 2 raw vsync overruns at 60Hz, got ${profStats.rawVsyncOverruns}`);
    assert.strictEqual(profStats.severeFrameDrops, 2, `Expected 2 severe drops (>19.17ms) at 60Hz, got ${profStats.severeFrameDrops}`);
    assert(profStats.p99Ms >= 21.5, `Expected p99Ms >= 21.5ms, got ${profStats.p99Ms}`);

    // Verify dynamic high-refresh vsync threshold (e.g., 120Hz -> 8.33ms, severe > 9.58ms)
    profiler.startCapture();
    let fake120Ts = 1000;
    for (let i = 0; i < 20; i++) {
      profiler.onFrame(fake120Ts);
      profiler.onCompute(0.1);
      fake120Ts += i === 10 ? 9.0 : 8.2; // 1 raw overrun >8.33ms, 0 severe drops >9.58ms
    }
    const prof120 = profiler.stopCapture(8.33);
    assert.strictEqual(prof120.rawVsyncOverruns, 1, `Expected 1 raw vsync overrun (>8.33ms), got ${prof120.rawVsyncOverruns}`);
    assert.strictEqual(prof120.severeFrameDrops, 0, `Expected 0 severe drops (>9.58ms), got ${prof120.severeFrameDrops}`);

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
    assert.strictEqual(mcpTools.find((t) => t.name === 'ast_read_state')?.annotations?.readOnlyHint, true, 'ast_read_state must declare readOnlyHint: true');
    assert.strictEqual(mcpTools.find((t) => t.name === 'ast_set_var')?.annotations?.readOnlyHint, false, 'ast_set_var must declare readOnlyHint: false');
    assert.strictEqual(mcpTools.find((t) => t.name === 'ast_dispatch_action')?.annotations?.readOnlyHint, false, 'ast_dispatch_action must declare readOnlyHint: false');
    const mcpBench = await runWebMcpBenchmark(headlessTransport, mcpTools);
    assert.strictEqual(mcpBench.clampingVerified, true, 'WebMCP live benchmark must verify [min, max] clamping');
    assert(mcpBench.clampingTrace && mcpBench.clampingTrace.unclampedInput !== mcpBench.clampingTrace.clampedOutput, 'WebMCP benchmark must record clampingTrace unclamped vs clamped values');
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
      registerTool: async (tool: any, opts?: { signal?: AbortSignal }) => {
        if (registeredToolMap.has(tool.name)) {
          throw new Error(`Duplicate WebMCP tool registration: ${tool.name}`);
        }
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
      // Verify exclusive document.modelContext surface (legacy navigator.modelContext ignored)
      (globalThis as any).document = {};
      Object.defineProperty(globalThis, 'navigator', {
        value: { modelContext: sharedModelContext },
        configurable: true,
      });
      assert.strictEqual(detectWebMcpSurface().surface, 'unavailable', 'Must ignore legacy navigator.modelContext when document.modelContext is absent');

      (globalThis as any).document = { modelContext: sharedModelContext };

      const portalOk = await registerPortalWebMcpTools();
      assert.strictEqual(portalOk, true, 'Portal WebMCP bridge must register on shared document.modelContext');
      assert.strictEqual(registeredToolMap.size, 5, `Expected 5 portal tools, got ${registeredToolMap.size}`);

      const noopTransport: PlayerMcpTransport = {
        readState: async () => null,
        setVar: async (name, value) => ({ name, value, clamped: false }),
        execActionTuple: async () => ({ ok: true, executedActions: ['say'] }),
      };

      const playerHandle = registerPlayerWebMcpTools(noopTransport);
      await playerHandle.ready;
      assert.strictEqual(playerHandle.registered, true, 'Player WebMCP bridge must register cleanly');
      assert.strictEqual(playerHandle.surface, 'document.modelContext', 'Player WebMCP bridge must use document.modelContext');
      assert.strictEqual(playerHandle.mode, 'registerTool', 'Player WebMCP bridge must use registerTool mode');
      assert.strictEqual(registeredToolMap.size, 8, `Expected 5 portal + 3 player = 8 coexisting tools, got ${registeredToolMap.size}`);
      assert.strictEqual(provideContextCalls, 0, 'Must never call provideContext fallback');

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
    const windowListeners: Record<string, Array<(evt: any) => void>> = {};
    const postedMessages: Array<{ msg: any; origin: string }> = [];
    const rafQueue = new Map<number, (ts: number) => void>();
    let nextRafId = 1;
    let simTimeNow = 1000;

    const bridgeSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, WeakSet,
      ArrayBuffer, DataView, Float32Array, Float64Array, Int32Array, Uint8Array,
      TextDecoder, TextEncoder, RegExp, Error, JSON,
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
    loadAstPlayerRuntimeIntoSandbox(bridgeSb);

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
    assert.strictEqual(pkgJson.version, '1.0.0', `Expected package.json version 1.0.0, got ${pkgJson.version}`);
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

  // =========================================================================
  // TEST 21: In-Quiz "Ask Nano" Coaching Bridge & AI_VISUAL_COMMAND Execution
  // =========================================================================
  console.log('\n--- TEST 21: In-Quiz "Ask Nano" Bridge & AI_VISUAL_COMMAND Execution ---');
  {
    const playerUiSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui.js'), 'utf8');
    const playerUiCheckpointsSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-checkpoints.js'), 'utf8');
    const combinedCheckpointUiSrc = `${playerUiSrc}\n${playerUiCheckpointsSrc}`;
    assert(combinedCheckpointUiSrc.includes('interactive-ask-nano-btn'), 'Checkpoint overlay must render interactive-ask-nano-btn');
    assert(combinedCheckpointUiSrc.includes('interactive-mute-popups-btn'), 'Checkpoint overlay must render interactive-mute-popups-btn');
    assert(combinedCheckpointUiSrc.includes("type: 'ASK_NANO_CHECKPOINT'"), 'PlayerUI must emit ASK_NANO_CHECKPOINT payload to parent host');
    assert(playerUiSrc.includes('askNanoAboutCheckpoint('), 'PlayerUI must expose askNanoAboutCheckpoint method');

    const mediaPlayerSrc = fs.readFileSync(path.join(process.cwd(), 'src', 'pages', 'media-player.ts'), 'utf8');
    assert(mediaPlayerSrc.includes("e.data.type === 'ASK_NANO_CHECKPOINT'"), 'media-player.ts must handle ASK_NANO_CHECKPOINT');
    assert(mediaPlayerSrc.includes('mountedAiTutorHandle?.updateTelemetry'), 'media-player.ts must update Nano drawer telemetry without DOM teardown');

    const engAi = createHeadlessEngine();
    const astTxt = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'rates-of-reaction.ast'), 'utf8');
    await engAi.loadSceneData(engAi.parseAst(astTxt), false);

    const aiPosted: Array<{ msg: any }> = [];
    const aiListeners: Record<string, Function[]> = {};
    const sbAi: any = vm.createContext({
      window: {
        location: { origin: 'https://localhost:3000', search: '' },
        addEventListener: (ev: string, fn: Function) => {
          (aiListeners[ev] = aiListeners[ev] || []).push(fn);
        },
        parent: {
          postMessage: (msg: any) => aiPosted.push({ msg }),
        },
        postMessage: () => {},
      },
      self: {},
      document: { getElementById: () => null, querySelector: () => null, createElement: () => ({ style: {} }), head: { appendChild: () => {} } },
      performance,
      requestAnimationFrame: (fn: Function) => setTimeout(() => fn(performance.now()), 1),
      cancelAnimationFrame: (id: any) => clearTimeout(id),
      console,
      Math, Date, Number, String, Boolean, Array, Object, Set, Map, WeakSet,
      ArrayBuffer, DataView, Float32Array, Float64Array, Int32Array, Uint8Array,
      TextDecoder, TextEncoder, RegExp, JSON,
    });
    sbAi.self = sbAi.window;
    loadAstPlayerRuntimeIntoSandbox(sbAi, true);
    sbAi.window.setupPostMessageBridge(engAi, null);

    let aiDemoStartCount = 0;
    const origNotify = engAi.notifyParent.bind(engAi);
    engAi.notifyParent = (m: any) => {
      if (m?.type === 'AI_DEMO_START') aiDemoStartCount++;
      origNotify(m);
    };

    for (const fn of aiListeners['message'] || []) {
      fn({
        origin: 'https://localhost:3000',
        data: {
          type: 'AI_VISUAL_COMMAND',
          packet: {
            type: 'AI_VISUAL_COMMAND',
            transactionId: 'tx_quiz_nano_1',
            actions: [{ type: 'SET_VARIABLE', variable: 'temp', value: 65 }],
            pedagogicalIntent: 'SCAFFOLD_HINT',
          },
        },
      });
    }
    await new Promise((r) => setTimeout(r, 20));
    assert(aiDemoStartCount >= 1, 'AI_VISUAL_COMMAND via postMessageBridge must invoke executeAiVisualCommand');
    assert.strictEqual(engAi.vars.temp, 65, 'AI_VISUAL_COMMAND SET_VARIABLE action must update engine vars cleanly');

    console.log('[✅ PASS] Sim 21: In-Quiz Ask Nano button, host telemetry persistence, and AI_VISUAL_COMMAND execution verified.');
    passedTests++;
  }

  return passedTests;
}
