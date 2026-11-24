// scripts/invariants/sim-modular-architecture.ts
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import {
  AST_PLAYER_RUNTIME_MODULES,
  SITE_GESTURES_RUNTIME_MODULES,
  loadAstPlayerRuntimeIntoSandbox,
} from './harness';
import {
  compileAstTextToBytecode,
  decompileBytecodeToScene,
} from '../../src/utils/astBytecode';

export async function runModularArchitectureInvariants(): Promise<number> {
  let passedTests = 0;

  // =========================================================================
  // 27. Modular 12-File AST Engine Integrity, Load Order & Standalone Contract
  // =========================================================================
  {
    // 27a. Every peer module must exist, be non-empty, be precached in sw.js & listed in package.json;
    // eager core modules must load before ast-engine.js, while lazy optional modules must be deferred via ast-lazy-loader.js
    const playerHtml = fs.readFileSync(path.join(process.cwd(), 'static', 'player.html'), 'utf8');
    const playerIndexHtml = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'index.html'), 'utf8');
    const swJs = fs.readFileSync(path.join(process.cwd(), 'static', 'sw.js'), 'utf8');
    const playerPkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'package.json'), 'utf8'));
    const lazyLoaderSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-lazy-loader.js'), 'utf8');

    const LAZY_PLAYER_MODULES = new Set([
      'ast-compiler.js',
      'ast-phet-bridge.js',
      'ast-profiler.js',
      'ast-exporter.js',
      'ast-ai-director.js',
      'ast-webrtc-bus.js',
      'obs-controller.js',
      'player-ui-studio-matcher.js',
      'player-ui-studio-remix.js',
      'player-ui-studio.js',
      'player-ui-voice.js',
      'player-ui-broadcast.js',
      'ast-avm1-vm.js',
    ]);

    assert.ok(playerHtml.includes('player/ast-lazy-loader.js'), 'static/player.html must load player/ast-lazy-loader.js');
    assert.ok(playerIndexHtml.includes('./ast-lazy-loader.js'), 'static/player/index.html must load ./ast-lazy-loader.js');
    assert.ok(swJs.includes('player/ast-lazy-loader.js'), 'static/sw.js must precache player/ast-lazy-loader.js');
    assert.ok(Array.isArray(playerPkg.files) && playerPkg.files.includes('ast-lazy-loader.js'), 'static/player/package.json files[] must list ast-lazy-loader.js');

    for (const mod of AST_PLAYER_RUNTIME_MODULES) {
      const modPath = path.join(process.cwd(), 'static', 'player', mod);
      assert.ok(fs.existsSync(modPath), `Modular runtime file static/player/${mod} must exist`);
      assert.ok(swJs.includes(`player/${mod}`), `static/sw.js must precache player/${mod}`);
      assert.ok(Array.isArray(playerPkg.files) && playerPkg.files.includes(mod), `static/player/package.json files[] must list ${mod}`);
      if (LAZY_PLAYER_MODULES.has(mod)) {
        assert.ok(!playerHtml.includes(`player/${mod}`), `static/player.html must lazy-load player/${mod} rather than blocking boot`);
        assert.ok(!playerIndexHtml.includes(`./${mod}`), `static/player/index.html must lazy-load ./${mod} rather than blocking boot`);
        assert.ok(lazyLoaderSrc.includes(mod), `static/player/ast-lazy-loader.js must register lazy module ${mod}`);
      } else {
        assert.ok(playerHtml.includes(`player/${mod}`), `static/player.html must load player/${mod}`);
        assert.ok(playerIndexHtml.includes(`./${mod}`), `static/player/index.html must load ./${mod}`);
      }
    }

    // Verify load order: every eager peer module must appear strictly before ast-engine.js in player.html and player/index.html
    const engineIdxRoot = playerHtml.indexOf('player/ast-engine.js');
    const engineIdxStandalone = playerIndexHtml.indexOf('./ast-engine.js');
    assert.ok(playerHtml.indexOf('player/ast-lazy-loader.js') < engineIdxRoot, 'player.html must load ast-lazy-loader.js before ast-engine.js');
    assert.ok(playerIndexHtml.indexOf('./ast-lazy-loader.js') < engineIdxStandalone, 'player/index.html must load ast-lazy-loader.js before ast-engine.js');
    for (const mod of AST_PLAYER_RUNTIME_MODULES) {
      if (mod === 'ast-engine.js' || LAZY_PLAYER_MODULES.has(mod)) continue;
      assert.ok(playerHtml.indexOf(`player/${mod}`) < engineIdxRoot, `player.html must load ${mod} before ast-engine.js`);
      assert.ok(playerIndexHtml.indexOf(`./${mod}`) < engineIdxStandalone, `player/index.html must load ${mod} before ast-engine.js`);
    }
    const loaderIdxRoot = playerHtml.indexOf('player/ast-loader.js');
    const loaderIdxStandalone = playerIndexHtml.indexOf('./ast-loader.js');
    for (const loaderPeer of ['ast-file-ingest.js', 'ast-svg-integrity.js']) {
      assert.ok(playerHtml.indexOf(`player/${loaderPeer}`) < loaderIdxRoot, `player.html must load ${loaderPeer} strictly before ast-loader.js`);
      assert.ok(playerIndexHtml.indexOf(`./${loaderPeer}`) < loaderIdxStandalone, `player/index.html must load ${loaderPeer} strictly before ast-loader.js`);
    }
    const bridgeIdxRoot = playerHtml.indexOf('player/ast-bridge.js');
    const bridgeIdxStandalone = playerIndexHtml.indexOf('./ast-bridge.js');
    for (const bridgePeer of ['ast-bridge-playback.js', 'ast-bridge-cartridge.js', 'ast-bridge-telemetry.js']) {
      assert.ok(playerHtml.indexOf(`player/${bridgePeer}`) < bridgeIdxRoot, `player.html must load ${bridgePeer} strictly before ast-bridge.js`);
      assert.ok(playerIndexHtml.indexOf(`./${bridgePeer}`) < bridgeIdxStandalone, `player/index.html must load ${bridgePeer} strictly before ast-bridge.js`);
    }

    // Verify all lazy modules exist, are precached, registered in ast-lazy-loader.js, and not blocking initial player HTML
    for (const lazyMod of LAZY_PLAYER_MODULES) {
      const modPath = path.join(process.cwd(), 'static', 'player', lazyMod);
      assert.ok(fs.existsSync(modPath), `Lazy module static/player/${lazyMod} must exist`);
      assert.ok(lazyLoaderSrc.includes(lazyMod), `ast-lazy-loader.js must register ${lazyMod}`);
      assert.ok(swJs.includes(`player/${lazyMod}`), `static/sw.js must precache lazy module player/${lazyMod}`);
      assert.ok(Array.isArray(playerPkg.files) && playerPkg.files.includes(lazyMod), `static/player/package.json files[] must list lazy module ${lazyMod}`);
      assert.ok(!playerHtml.includes(`player/${lazyMod}`), `static/player.html must NOT eagerly load ${lazyMod}`);
      assert.ok(!playerIndexHtml.includes(`./${lazyMod}`), `static/player/index.html must NOT eagerly load ${lazyMod}`);
    }

    // Verify ast-lazy-loader.js sandbox contract
    const llSb: any = { console, Promise, Map, Object, Boolean, Error, window: { location: { pathname: '/player.html' } } };
    llSb.globalThis = llSb;
    vm.runInNewContext(lazyLoaderSrc, llSb, { filename: 'static/player/ast-lazy-loader.js' });
    const ll = llSb.ASTLazyLoader || llSb.window.ASTLazyLoader;
    assert.ok(ll && typeof ll.ensureStudio === 'function' && typeof ll.ensureBroadcast === 'function' && typeof ll.ensureProfiler === 'function' && typeof ll.ensureAvm1Vm === 'function', 'ast-lazy-loader.js must export ASTLazyLoader bundle helpers');
    assert.strictEqual(Object.keys(ll.LAZY_MODULES).length, 13, 'ASTLazyLoader.LAZY_MODULES must declare all 13 deferred modules');

    // 27b. Verify all public module exports exist on the loaded runtime sandbox
    const modSandbox: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, WeakSet,
      ArrayBuffer, DataView, Float32Array, Float64Array, Int32Array, Uint8Array,
      TextDecoder, TextEncoder, RegExp, Error, JSON, URLSearchParams, Date, Function,
      parseInt, parseFloat, isNaN, isFinite,
      setTimeout, clearTimeout,
      performance: { now: () => Date.now() },
      location: { search: '', origin: 'http://localhost', href: 'http://localhost/player.html', pathname: '/player.html' },
      window: { location: { origin: 'http://localhost', search: '' }, addEventListener: () => {} },
      navigator: { userAgent: 'NodeInvariantRunner' },
    };
    modSandbox.globalThis = modSandbox;
    modSandbox.self = modSandbox.window;
    loadAstPlayerRuntimeIntoSandbox(modSandbox);

    const requiredGlobals = [
      'ASTProfiler',
      'ASTAudioSpeech', 'VectorProceduralAudioSynth', 'speakText', 'cancelSpeech', 'narrateText', 'primeMobileAudioAndTts', 'initMobileAudioTtsPriming',
      'VectorVerletPhysics',
      'AstMath', 'astMorphPath', 'parseAst', 'compileAstExpr', 'compileAstFn', 'decompileBytecode', 'isAstBytecode',
      'AST3DEngine',
      'ASTBridgePlaybackHandlers', 'ASTBridgeCartridgeHandlers', 'ASTBridgeTelemetryHandlers',
      'ASTPostMessageBridge', 'setupPostMessageBridge',
      'ASTExporter',
      'ASTHudControls',
      'ASTAiDirector',
      'ASTFileIngest',
      'ASTSvgIntegrity',
      'ASTSceneLoader',
      'MicroSCORMBridge', 'ASTStateMachine',
      'ASTLabTelemetry', 'ASTSceneMount', 'ASTBindingRuntime',
      'ASTVectorPlayerEngine',
    ];
    for (const sym of requiredGlobals) {
      assert.ok(modSandbox[sym] !== undefined || modSandbox.window[sym] !== undefined, `Modular runtime must export global "${sym}"`);
    }

    // 27c. Verify ast-engine.js degrades gracefully in strict mode even if loaded standalone without peers
    const standaloneSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, WeakSet,
      ArrayBuffer, DataView, Float32Array, Float64Array, Int32Array, Uint8Array,
      TextDecoder, TextEncoder, RegExp, Error, JSON, URLSearchParams, Date, Function,
      parseInt, parseFloat, isNaN, isFinite,
      performance: { now: () => Date.now() },
      location: { search: '', origin: 'http://localhost' },
      window: { location: { origin: 'http://localhost', search: '' }, addEventListener: () => {} },
    };
    standaloneSb.globalThis = standaloneSb;
    standaloneSb.self = standaloneSb.window;
    const engineOnlyCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-engine.js'), 'utf8');
    vm.runInNewContext(engineOnlyCode, standaloneSb, { filename: 'static/player/ast-engine.js' });
    const StandaloneEngineCtor = standaloneSb.ASTVectorPlayerEngine || standaloneSb.window.ASTVectorPlayerEngine;
    const standaloneEng = new StandaloneEngineCtor({});
    assert.ok(standaloneEng, 'Standalone ASTVectorPlayerEngine must construct cleanly without peer modules');

    // 27d. Verify modular player-ui peer modules (studio-matcher, studio-remix, studio, checkpoints, voice, broadcast, display, controls, events) plumbing, load order, exports & standalone safety
    const playerUiPeerModules = [
      'player-ui-studio-matcher.js',
      'player-ui-studio-remix.js',
      'player-ui-studio.js',
      'player-ui-checkpoints.js',
      'player-ui-voice.js',
      'player-ui-broadcast.js',
      'player-ui-display.js',
      'player-ui-controls.js',
      'player-ui-events.js',
    ];
    const uiIdxRoot = playerHtml.indexOf('player/player-ui.js');
    const uiIdxStandalone = playerIndexHtml.indexOf('./player-ui.js');
    assert.ok(uiIdxRoot > -1 && uiIdxStandalone > -1, 'player.html and player/index.html must load player-ui.js');

    for (const mod of playerUiPeerModules) {
      const modPath = path.join(process.cwd(), 'static', 'player', mod);
      assert.ok(fs.existsSync(modPath), `Modular UI file static/player/${mod} must exist`);
      assert.ok(swJs.includes(`player/${mod}`), `static/sw.js must precache player/${mod}`);
      assert.ok(Array.isArray(playerPkg.files) && playerPkg.files.includes(mod), `static/player/package.json files[] must list ${mod}`);
      if (LAZY_PLAYER_MODULES.has(mod)) {
        assert.ok(!playerHtml.includes(`player/${mod}`), `static/player.html must lazy-load player/${mod}`);
        assert.ok(!playerIndexHtml.includes(`./${mod}`), `static/player/index.html must lazy-load ./${mod}`);
      } else {
        assert.ok(playerHtml.includes(`player/${mod}`), `static/player.html must load player/${mod}`);
        assert.ok(playerIndexHtml.includes(`./${mod}`), `static/player/index.html must load ./${mod}`);
        assert.ok(playerHtml.indexOf(`player/${mod}`) < uiIdxRoot, `player.html must load ${mod} strictly before player-ui.js`);
        assert.ok(playerIndexHtml.indexOf(`./${mod}`) < uiIdxStandalone, `player/index.html must load ${mod} strictly before player-ui.js`);
      }
    }

    const studioSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite,
      window: {},
    };
    studioSb.globalThis = studioSb;
    studioSb.self = studioSb.window;
    for (const studioFile of ['player-ui-studio-matcher.js', 'player-ui-studio-remix.js', 'player-ui-studio.js']) {
      const code = fs.readFileSync(path.join(process.cwd(), 'static', 'player', studioFile), 'utf8');
      vm.runInNewContext(code, studioSb, { filename: `static/player/${studioFile}` });
    }
    const studioMatcherExports = studioSb.ASTPlayerUIStudioMatcher || studioSb.window.ASTPlayerUIStudioMatcher;
    const studioRemixExports = studioSb.ASTPlayerUIStudioRemix || studioSb.window.ASTPlayerUIStudioRemix;
    const studioExports = studioSb.ASTPlayerUIStudio || studioSb.window.ASTPlayerUIStudio;
    assert.ok(studioMatcherExports, 'player-ui-studio-matcher.js must export ASTPlayerUIStudioMatcher');
    assert.ok(studioRemixExports, 'player-ui-studio-remix.js must export ASTPlayerUIStudioRemix');
    assert.ok(studioExports, 'player-ui-studio.js must export ASTPlayerUIStudio');
    assert.ok(Array.isArray(studioExports.DEFAULT_STARTER_TEMPLATES) && studioExports.DEFAULT_STARTER_TEMPLATES.length >= 3, 'ASTPlayerUIStudio must export DEFAULT_STARTER_TEMPLATES');
    for (const fnName of [
      'bindStudioDOMEvents', 'refreshAstSvgMatcher', 'slugifyCartridgeId', 'findClosestSvgId',
      'extractSvgElementsInfo', 'extractAstTargetsInfo', 'requestNanoRemix', 'syncSceneIdentityInAst',
      'downloadStandaloneSvgApplet', 'renderStarterTemplates',
    ]) {
      assert.strictEqual(typeof studioExports[fnName], 'function', `ASTPlayerUIStudio must export function ${fnName}`);
    }
    assert.strictEqual(studioExports.slugifyCartridgeId('My Cool Sim 101!'), 'my-cool-sim-101', 'slugifyCartridgeId must normalize slug cleanly');
    const parsedSvgItems = studioExports.extractSvgElementsInfo('<svg><g id="wheel-left-1"></g><rect id="chassis"/></svg>');
    assert.strictEqual(parsedSvgItems.length, 2, 'extractSvgElementsInfo must extract SVG IDs');
    assert.strictEqual(studioExports.findClosestSvgId('wheel-left', parsedSvgItems), 'wheel-left-1', 'findClosestSvgId must match closest SVG ID');
    const syncedAst = studioExports.syncSceneIdentityInAst('(:scene :id "old" :title "Old Title" (:bindings ()))', 'my-remix', 'My Remix');
    assert.ok(syncedAst.includes(':id "my-remix"') && syncedAst.includes(':title "My Remix"'), 'syncSceneIdentityInAst must update scene id and title cleanly');

    // Verify player-ui-checkpoints.js exports & deterministic stop sorting
    const checkpointsSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite,
      window: {},
    };
    checkpointsSb.globalThis = checkpointsSb;
    checkpointsSb.self = checkpointsSb.window;
    const checkpointsCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-checkpoints.js'), 'utf8');
    vm.runInNewContext(checkpointsCode, checkpointsSb, { filename: 'static/player/player-ui-checkpoints.js' });
    const cpExports = checkpointsSb.ASTPlayerUICheckpoints || checkpointsSb.window.ASTPlayerUICheckpoints;
    assert.ok(cpExports, 'player-ui-checkpoints.js must export ASTPlayerUICheckpoints');
    for (const fnName of [
      'minimizeInteractiveCard', 'restoreInteractiveCard', 'closeInteractiveCard', 'toggleCheckpointView',
      'toggleInteractiveMode', 'setInteractiveMode', 'askNanoAboutCheckpoint', 'triggerCheckpoint',
      'updateGoalCheckpointProgress', 'handleGoalCheckpointPassed', 'logDataToJotterCsv',
      'triggerFirstCheckpoint', 'checkInteractiveCheckpoints', 'toggleStepMode', 'getLessonStops',
      'stepToNextKeyframe', 'stepToPrevKeyframe', 'startQuestMode', 'renderCurrentMission', 'checkMissionAnswer', 'closeQuestMode',
    ]) {
      assert.strictEqual(typeof cpExports[fnName], 'function', `ASTPlayerUICheckpoints must export function ${fnName}`);
    }
    const mockStopUi = {
      engine: {
        scene: {
          keyframes: [{ t: 0.5 }, { t: 0.25 }],
          interactive: { checkpoints: [{ t: 0.75 }] },
        },
      },
    };
    assert.deepStrictEqual(cpExports.getLessonStops.call(mockStopUi), [0, 0.25, 0.5, 0.75, 1], 'getLessonStops must merge and sort keyframes and checkpoints');

    // Verify player-ui-voice.js exports & dynamic catalog voice matching
    const voiceSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite,
      setTimeout, clearTimeout,
      window: {},
    };
    voiceSb.globalThis = voiceSb;
    voiceSb.self = voiceSb.window;
    const voiceCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-voice.js'), 'utf8');
    vm.runInNewContext(voiceCode, voiceSb, { filename: 'static/player/player-ui-voice.js' });
    const voiceExports = voiceSb.ASTPlayerUIVoice || voiceSb.window.ASTPlayerUIVoice;
    assert.ok(voiceExports, 'player-ui-voice.js must export ASTPlayerUIVoice');
    for (const fnName of [
      'initVoiceRecognition', 'startVoiceCommands', 'stopVoiceCommands', 'toggleVoiceCommands',
      'updateVoiceStatusUI', 'updateVoiceOverlayText', 'findSceneByVoiceQuery', 'handleVoiceCommand',
    ]) {
      assert.strictEqual(typeof voiceExports[fnName], 'function', `ASTPlayerUIVoice must export function ${fnName}`);
    }
    const mockVoiceUi = {
      _catalogScenes: [
        { id: 'solar-system', title: 'Solar System Orbits', subject: 'Physics' },
        { id: 'water-cycle', title: 'The Water Cycle', subject: 'Geography' },
      ],
      elements: {},
    };
    const matchedVoiceScene = voiceExports.findSceneByVoiceQuery.call(mockVoiceUi, 'please open the solar system simulation');
    assert.strictEqual(matchedVoiceScene && matchedVoiceScene.id, 'solar-system', 'findSceneByVoiceQuery must match dynamic catalog entries');

    // Verify player-ui-broadcast.js exports & OBS/WebRTC status UI helpers
    const broadcastSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite,
      window: {},
    };
    broadcastSb.globalThis = broadcastSb;
    broadcastSb.self = broadcastSb.window;
    const broadcastCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-broadcast.js'), 'utf8');
    vm.runInNewContext(broadcastCode, broadcastSb, { filename: 'static/player/player-ui-broadcast.js' });
    const bcExports = broadcastSb.ASTPlayerUIBroadcast || broadcastSb.window.ASTPlayerUIBroadcast;
    assert.ok(bcExports, 'player-ui-broadcast.js must export ASTPlayerUIBroadcast');
    for (const fnName of [
      'bindBroadcastDOMEvents', 'initObsBroadcast', 'updateObsStatusUI',
      'toggleWebRtcDrawer', 'closeWebRtcDrawer', 'updateWebRtcStatusUI', 'toggleObsDrawer', 'closeObsDrawer',
    ]) {
      assert.strictEqual(typeof bcExports[fnName], 'function', `ASTPlayerUIBroadcast must export function ${fnName}`);
    }
    const mockBcUi: any = {
      elements: {
        webrtcStatusDot: { className: '', style: {} },
        webrtcDrawerBadge: { className: '', textContent: '' },
        webrtcRoleReadout: { textContent: '' },
      },
    };
    bcExports.updateWebRtcStatusUI.call(mockBcUi, true, 'host');
    assert.strictEqual(mockBcUi.elements.webrtcDrawerBadge.textContent, 'CONNECTED (HOST)', 'updateWebRtcStatusUI must update badge text');
    assert.strictEqual(mockBcUi.elements.webrtcRoleReadout.textContent, 'HOST', 'updateWebRtcStatusUI must update role readout');

    // Verify player-ui-display.js exports & display preset profile generation
    const displaySb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date, URLSearchParams,
      parseInt, parseFloat, isNaN, isFinite,
      window: { self: null, top: null },
    };
    displaySb.window.self = displaySb.window;
    displaySb.window.top = displaySb.window;
    displaySb.globalThis = displaySb;
    displaySb.self = displaySb.window;
    const displayCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-display.js'), 'utf8');
    vm.runInNewContext(displayCode, displaySb, { filename: 'static/player/player-ui-display.js' });
    const dispExports = displaySb.ASTPlayerUIDisplay || displaySb.window.ASTPlayerUIDisplay;
    assert.ok(dispExports, 'player-ui-display.js must export ASTPlayerUIDisplay');
    for (const fnName of [
      'bindDisplayDOMEvents', 'setTheme', 'toggleTheme', 'toggleBsl', 'updateBslButton',
      'initDisplayConfig', 'getPresetProfile', 'setDisplayMode', 'saveDisplayConfig', 'applyDisplayConfig',
      'toggleShortcutsModal', 'closeShortcutsModal', 'syncSettingsDrawerUI',
      'toggleStudioPanel', 'openStudioPanel', 'closeStudioPanel', 'toggleSettingsDrawer', 'closeSettingsDrawer', 'togglePictureInPicture',
    ]) {
      assert.strictEqual(typeof dispExports[fnName], 'function', `ASTPlayerUIDisplay must export function ${fnName}`);
    }
    const suiteProfile = dispExports.getPresetProfile('suite');
    assert.strictEqual(suiteProfile.mode, 'suite', 'getPresetProfile("suite") must return suite mode');
    assert.strictEqual(suiteProfile.showTimelineScrubber, false, 'suite mode must hide timeline scrubber');
    const minimalProfile = dispExports.getPresetProfile('minimal');
    assert.strictEqual(minimalProfile.showDevStudio, false, 'minimal mode must hide dev studio');

    // Verify player-ui-controls.js exports, 3D camera stop application & simulation reset delegation
    const controlsSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date, URLSearchParams,
      parseInt, parseFloat, isNaN, isFinite,
      setTimeout, clearTimeout,
      window: {},
    };
    controlsSb.globalThis = controlsSb;
    controlsSb.self = controlsSb.window;
    const controlsCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-controls.js'), 'utf8');
    vm.runInNewContext(controlsCode, controlsSb, { filename: 'static/player/player-ui-controls.js' });
    const ctrlExports = controlsSb.ASTPlayerUIControls || controlsSb.window.ASTPlayerUIControls;
    assert.ok(ctrlExports, 'player-ui-controls.js must export ASTPlayerUIControls');
    for (const fnName of [
      'getSceneCameraStops', 'applyCameraStop', 'update3DStatus',
      'populatePresets', 'saveToLocalVault', 'setupKeyframeMarkers',
      'projectControls', 'syncProjectedControls', 'resetSimulation', 'bindControlsDOMEvents',
    ]) {
      assert.strictEqual(typeof ctrlExports[fnName], 'function', `ASTPlayerUIControls must export function ${fnName}`);
    }
    let camSeekVal: number | null = null;
    let camEmitted = false;
    let camResetDispatched = false;
    const mockCtrlUi: any = {
      targetStop: 0.5,
      elements: {},
      engine: {
        progress: 0.25,
        isPlaying: false,
        cameraOrbit: { yawOffset: 0, pitchOffset: 0, distanceScale: 1 },
        scene: { cameraStops: [{ id: 'altar', yaw: 30, pitch: -12, scale: 0.85, t: 0.4 }] },
        seek(v: number) { camSeekVal = v; this.progress = v; },
        applyBindings() {},
        emit(evt: string) { if (evt === 'camerachange') camEmitted = true; },
        dispatchAction(act: string) { if (act === 'sim:reset') camResetDispatched = true; },
      },
      update3DStatus() {},
      updateHeaderPlayUI() {},
      showToast() {},
    };
    const stops = ctrlExports.getSceneCameraStops.call(mockCtrlUi);
    assert.strictEqual(stops.length, 1, 'getSceneCameraStops must read declarative scene.cameraStops');
    ctrlExports.applyCameraStop.call(mockCtrlUi, stops[0]);
    assert.strictEqual(mockCtrlUi.engine.cameraOrbit.yawOffset, 30, 'applyCameraStop must update yawOffset');
    assert.strictEqual(mockCtrlUi.engine.cameraOrbit.pitchOffset, -12, 'applyCameraStop must update pitchOffset');
    assert.strictEqual(mockCtrlUi.engine.cameraOrbit.distanceScale, 0.85, 'applyCameraStop must update distanceScale');
    assert.strictEqual(camSeekVal, 0.4, 'applyCameraStop must seek to stop.t');
    assert.strictEqual(camEmitted, true, 'applyCameraStop must emit camerachange');
    ctrlExports.resetSimulation.call(mockCtrlUi);
    assert.strictEqual(mockCtrlUi.targetStop, null, 'resetSimulation must clear targetStop');
    assert.strictEqual(camResetDispatched, true, 'resetSimulation must dispatch sim:reset');

    // Verify player-ui.js evaluates cleanly in strict mode standalone (without peer UI modules loaded)
    const uiOnlySb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite,
      window: { location: { origin: 'http://localhost', search: '' }, addEventListener: () => {} },
      document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} },
    };
    uiOnlySb.globalThis = uiOnlySb;
    uiOnlySb.self = uiOnlySb.window;
    const uiCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui.js'), 'utf8');
    vm.runInNewContext(uiCode, uiOnlySb, { filename: 'static/player/player-ui.js' });
    assert.strictEqual(typeof (uiOnlySb.ASTPlayerUI || uiOnlySb.window.ASTPlayerUI), 'function', 'player-ui.js must export ASTPlayerUI standalone');

    // 27e. Verify modular site-gestures peer modules plumbing, load order, exports, pure-VM invariant & standalone safety
    const siteGesturesPeerModules = SITE_GESTURES_RUNTIME_MODULES.filter((m) => m !== 'site-gestures.js');
    const sgIdxRoot = playerHtml.indexOf('player/site-gestures.js');
    const sgIdxStandalone = playerIndexHtml.indexOf('./site-gestures.js');
    assert.ok(sgIdxRoot > -1 && sgIdxStandalone > -1, 'player.html and player/index.html must load site-gestures.js');

    for (const mod of siteGesturesPeerModules) {
      const modPath = path.join(process.cwd(), 'static', 'player', mod);
      assert.ok(fs.existsSync(modPath), `Modular gesture file static/player/${mod} must exist`);
      assert.ok(playerHtml.includes(`player/${mod}`), `static/player.html must load player/${mod}`);
      assert.ok(playerIndexHtml.includes(`./${mod}`), `static/player/index.html must load ./${mod}`);
      assert.ok(swJs.includes(`player/${mod}`), `static/sw.js must precache player/${mod}`);
      assert.ok(Array.isArray(playerPkg.files) && playerPkg.files.includes(mod), `static/player/package.json files[] must list ${mod}`);
      assert.ok(playerHtml.indexOf(`player/${mod}`) < sgIdxRoot, `player.html must load ${mod} strictly before site-gestures.js`);
      assert.ok(playerIndexHtml.indexOf(`./${mod}`) < sgIdxStandalone, `player/index.html must load ${mod} strictly before site-gestures.js`);

      // Pure Generic VM check: zero hardcoded cartridge/scene hacks in any gesture module
      const modSrc = fs.readFileSync(modPath, 'utf8');
      assert.ok(!modSrc.includes("activePresetId === 'algebra-balance'"), `${mod} must remain 100% generic (no algebra-balance hack)`);
      assert.ok(!modSrc.includes("varName === 'selectedRite'"), `${mod} must remain 100% generic (no selectedRite hack)`);
      assert.ok(!modSrc.includes('flipUnderside'), `${mod} must remain 100% generic (no flipUnderside hack)`);
    }

    // Verify site-gestures-profile.js exports, AST controls parser, skill compiler & gesture normalization
    const profileSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite,
      window: {},
    };
    profileSb.globalThis = profileSb;
    profileSb.self = profileSb.window;
    const profileCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'site-gestures-profile.js'), 'utf8');
    vm.runInNewContext(profileCode, profileSb, { filename: 'static/player/site-gestures-profile.js' });
    const profExports = profileSb.ASTGesturesProfile || profileSb.window.ASTGesturesProfile;
    assert.ok(profExports, 'site-gestures-profile.js must export ASTGesturesProfile');
    for (const fnName of [
      'createDefaultProfile', 'loadPlayerGesturesProfile', '_stripSexpComments', '_extractSexpBlock',
      '_extractChildSexps', '_extractAllSexpBlocks', '_stripChildSexps', '_parseSkillsBlock',
      '_parseKeywordAttrs', '_parseControlsBlock', '_parsePlayerGesturesAST', '_resolveSceneSkillUsages',
      '_resolveSkillGestures', '_getActiveTimelineSyncSpec', '_bindTimelineVarSync', '_syncCartridgeControls',
      '_isControlEnabled', '_applyControlVisibility', '_normalizeGesture', '_getNormalizedSceneGestures', '_findPrimarySteppedVar',
    ]) {
      assert.strictEqual(typeof profExports[fnName], 'function', `ASTGesturesProfile must export function ${fnName}`);
    }
    const parsedCtrls = profExports._parseControlsBlock.call(profExports, '(:controls (:param-hud :off) (:whiteboard :on))');
    assert.strictEqual(parsedCtrls['param-hud'], false, '_parseControlsBlock must parse :off as false');
    assert.strictEqual(parsedCtrls.whiteboard, true, '_parseControlsBlock must parse :on as true');
    const defaultProf = profExports.createDefaultProfile.call(profExports);
    assert.ok(defaultProf.skills instanceof Map && defaultProf.skills.has('storybook-reader'), 'createDefaultProfile must compile storybook-reader skill from AST');
    const normG = profExports._normalizeGesture({ type: 'interactive', action: 'set-var', var: 'step', value: 3, 'speak-attr': 'data-word' });
    assert.strictEqual(normG.type, 'clickable', '_normalizeGesture must map interactive -> clickable');
    assert.strictEqual(normG.setVar, 'step', '_normalizeGesture must map set-var :var -> setVar');
    assert.strictEqual(normG.val, 3, '_normalizeGesture must map :value -> val');
    assert.strictEqual(normG.speakAttr, 'data-word', '_normalizeGesture must normalize kebab-case speak-attr');

    // Verify site-gestures-whiteboard.js exports, Bézier stroke drawing, undo/redo & AST/JSON round-trip serialization
    const wbCreatedPaths: any[] = [];
    const wbMockInkRoot: any = {
      children: [] as any[],
      appendChild(el: any) { el.parentNode = this; this.children.push(el); return el; },
      removeChild(el: any) { const idx = this.children.indexOf(el); if (idx >= 0) this.children.splice(idx, 1); el.parentNode = null; return el; },
      replaceChildren() { this.children.forEach((c: any) => { c.parentNode = null; }); this.children = []; },
    };
    const wbSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite, setTimeout, clearTimeout,
      window: { dispatchEvent: () => {} },
      document: {
        createElementNS(_ns: string, tag: string) {
          const attrs: Record<string, string> = {};
          const el = {
            tagName: tag,
            style: {} as Record<string, string>,
            parentNode: null as any,
            setAttribute(k: string, v: string) { attrs[k] = String(v); },
            getAttribute(k: string) { return attrs[k] !== undefined ? attrs[k] : null; },
          };
          wbCreatedPaths.push(el);
          return el;
        },
        getElementById: () => null,
        body: null,
      },
    };
    wbSb.globalThis = wbSb;
    wbSb.self = wbSb.window;
    const wbCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'site-gestures-whiteboard.js'), 'utf8');
    vm.runInNewContext(wbCode, wbSb, { filename: 'static/player/site-gestures-whiteboard.js' });
    const wbExports = wbSb.ASTGesturesWhiteboard || wbSb.window.ASTGesturesWhiteboard;
    assert.ok(wbExports, 'site-gestures-whiteboard.js must export ASTGesturesWhiteboard');
    for (const fnName of [
      'handleWhiteboardMessage', 'startInkStroke', 'continueInkStroke', 'endInkStroke', 'eraseStrokeAt',
      'undoLastStroke', 'redoLastStroke', 'clearWhiteboardInk', 'exportInkToAST', 'importInkFromAST',
      'exportInkToJSON', 'importInkFromJSON', 'broadcastInkSession', 'persistInkToSession',
      'restoreInkFromSession', 'showFloatingNotice', 'togglePen',
    ]) {
      assert.strictEqual(typeof wbExports[fnName], 'function', `ASTGesturesWhiteboard must export function ${fnName}`);
    }
    const mockWbHost: any = {
      engine: { activePresetId: 'fractions' },
      inkRoot: wbMockInkRoot,
      stageSvg: { style: {}, parentNode: null },
      playerProfile: { whiteboard: { tools: [{ id: 'pen', opacity: 1.0, cap: 'round' }] } },
      isPenActive: false,
      currentTool: 'pen',
      currentInkColor: '#38bdf8',
      currentInkWidth: 4,
      currentStroke: null,
      strokes: [],
      _undoStack: [],
      _isControlEnabled: () => true,
      _playNamedTone: () => {},
      playAudioTone: () => {},
      persistInkToSession: () => {},
      showFloatingNotice: () => {},
      setupDomLayers: () => {},
    };
    wbExports.startInkStroke.call(mockWbHost, { x: 10, y: 20 });
    wbExports.continueInkStroke.call(mockWbHost, { x: 30, y: 50 });
    wbExports.endInkStroke.call(mockWbHost);
    assert.strictEqual(mockWbHost.strokes.length, 1, 'start/continue/endInkStroke must record 1 Bézier stroke');
    assert.ok(mockWbHost.strokes[0].d.includes('Q 10.0 20.0, 20.0 35.0'), 'continueInkStroke must generate quadratic Bézier path');
    const exportedInkAst = wbExports.exportInkToAST.call(mockWbHost);
    assert.ok(exportedInkAst.includes('(:ink-session') && exportedInkAst.includes('#38bdf8'), 'exportInkToAST must serialize stroke color and session');
    wbExports.undoLastStroke.call(mockWbHost);
    assert.strictEqual(mockWbHost.strokes.length, 0, 'undoLastStroke must pop stroke');
    wbExports.redoLastStroke.call(mockWbHost);
    assert.strictEqual(mockWbHost.strokes.length, 1, 'redoLastStroke must restore stroke');
    const importedAstCount = wbExports.importInkFromAST.call(mockWbHost, exportedInkAst);
    assert.strictEqual(importedAstCount, 1, 'importInkFromAST must round-trip exported ink session');
    assert.strictEqual(mockWbHost.strokes[0].color, '#38bdf8', 'importInkFromAST must preserve stroke color');
    const exportedInkJson = wbExports.exportInkToJSON.call(mockWbHost);
    assert.strictEqual(exportedInkJson.strokeCount, 1, 'exportInkToJSON must report strokeCount 1');
    const importedJsonCount = wbExports.importInkFromJSON.call(mockWbHost, exportedInkJson);
    assert.strictEqual(importedJsonCount, 1, 'importInkFromJSON must round-trip JSON ink session');

    // Verify site-gestures-hud.js exports, glass HUD, X-Ray popup & fallback parameters dock
    const makeMockDomEl = (tag: string) => {
      const attrs: Record<string, string> = {};
      const children: any[] = [];
      const el: any = {
        tagName: tag.toUpperCase(),
        id: '',
        className: '',
        type: '',
        title: '',
        textContent: '',
        value: '',
        style: {} as Record<string, string>,
        children,
        parentNode: null as any,
        setAttribute(k: string, v: string) { attrs[k] = String(v); },
        getAttribute(k: string) { return attrs[k] !== undefined ? attrs[k] : null; },
        appendChild(c: any) { c.parentNode = this; children.push(c); return c; },
        append(...nodes: any[]) { nodes.forEach((n: any) => this.appendChild(n)); },
        replaceChildren(...nodes: any[]) { children.length = 0; nodes.forEach((n: any) => this.appendChild(n)); },
        remove() { if (this.parentNode && this.parentNode.children) { const i = this.parentNode.children.indexOf(this); if (i >= 0) this.parentNode.children.splice(i, 1); } },
        addEventListener() {},
        querySelector(sel: string) {
          const find = (node: any): any => {
            for (const c of node.children || []) {
              if (sel.startsWith('#') && c.id === sel.slice(1)) return c;
              if (sel.startsWith('.') && c.className && c.className.includes(sel.slice(1).split('[')[0])) return c;
              const nested = find(c);
              if (nested) return nested;
            }
            return null;
          };
          return find(this);
        },
        querySelectorAll(sel: string) {
          const out: any[] = [];
          const walk = (node: any) => {
            for (const c of node.children || []) {
              if (sel.startsWith('.') && c.className && c.className.includes(sel.slice(1))) out.push(c);
              walk(c);
            }
          };
          walk(this);
          return out;
        },
      };
      return el;
    };
    const hudSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite, setTimeout, clearTimeout,
      window: { innerWidth: 1024 },
      document: {
        createElement: (tag: string) => makeMockDomEl(tag),
        createElementNS: (_ns: string, tag: string) => makeMockDomEl(tag),
        createTextNode: (txt: string) => ({ textContent: txt }),
        getElementById: () => null,
      },
    };
    hudSb.globalThis = hudSb;
    hudSb.self = hudSb.window;
    const hudCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'site-gestures-hud.js'), 'utf8');
    vm.runInNewContext(hudCode, hudSb, { filename: 'static/player/site-gestures-hud.js' });
    const hudExports = hudSb.ASTGesturesHud || hudSb.window.ASTGesturesHud;
    assert.ok(hudExports, 'site-gestures-hud.js must export ASTGesturesHud');
    for (const fnName of [
      '_rebuildGlassHud', 'setupGlassHud', 'createHudButton', 'setupXRayTooltip',
      'showXRayPopup', 'hideXRayPopup', 'createTouchRipple', 'setupSimParametersHud',
    ]) {
      assert.strictEqual(typeof hudExports[fnName], 'function', `ASTGesturesHud must export function ${fnName}`);
    }
    const hudContainer = makeMockDomEl('div');
    const hudStageSvg = makeMockDomEl('svg');
    hudStageSvg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 480 });
    hudContainer.appendChild(hudStageSvg);
    const mockHudHost: any = {
      stageSvg: hudStageSvg,
      hudRoot: makeMockDomEl('g'),
      xrayTooltip: null,
      isXRayActive: false,
      sonificationEnabled: true,
      currentTool: 'pen',
      currentInkWidth: 3.5,
      currentInkColor: '#facc15',
      playerProfile: {
        whiteboard: {
          tools: [{ id: 'pen', icon: '🖊️', width: 3.5, title: 'Pen' }],
          widths: [2, 4, 8],
          palette: [{ hex: '#facc15', name: 'Yellow' }],
        },
      },
      engine: {
        scene: { vars: { speed: { min: 0, max: 10, step: 1, label: 'Speed', unit: 'm/s' } } },
        vars: { speed: 5 },
        setVar: () => {},
        resetVars: () => {},
        on: () => {},
      },
      _isControlEnabled: () => true,
      playAudioTone: () => {},
      createHudButton(icon: string, title: string, onClick: any) { return hudExports.createHudButton.call(this, icon, title, onClick); },
      setupGlassHud() { return hudExports.setupGlassHud.call(this); },
      hideXRayPopup() { return hudExports.hideXRayPopup.call(this); },
    };
    hudExports.setupGlassHud.call(mockHudHost);
    assert.ok(hudContainer.querySelector('#stage-glass-hud-ui'), 'setupGlassHud must mount #stage-glass-hud-ui');
    hudExports.setupXRayTooltip.call(mockHudHost);
    assert.ok(mockHudHost.xrayTooltip, 'setupXRayTooltip must create tooltip');
    hudExports.showXRayPopup.call(mockHudHost, 'Fulcrum: Pivot point of the lever', 200, 150, null);
    assert.strictEqual(mockHudHost.xrayTooltip.style.display, 'block', 'showXRayPopup must display parsed pedId tooltip');
    assert.strictEqual(mockHudHost.xrayTooltip.children[0].textContent, 'Fulcrum', 'showXRayPopup must render parsed title');
    hudExports.hideXRayPopup.call(mockHudHost);
    assert.strictEqual(mockHudHost.xrayTooltip.style.display, 'none', 'hideXRayPopup must hide tooltip');
    hudExports.setupSimParametersHud.call(mockHudHost);
    const simParamHud = hudContainer.querySelector('#stage-sim-parameters');
    assert.ok(simParamHud, 'setupSimParametersHud must mount #stage-sim-parameters for bounded vars');
    assert.strictEqual(simParamHud.querySelectorAll('.sim-param-slider').length, 1, 'setupSimParametersHud must render slider for bounded var');

    // Verify site-gestures-actions.js exports, declarative step-slide, SITE_DIRECTIVE bridge, hold press/release & audio queue
    const emittedDirectives: any[] = [];
    const actSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite, setTimeout, clearTimeout,
      window: {
        parent: {
          postMessage(msg: any) { emittedDirectives.push(msg); },
        },
      },
    };
    actSb.globalThis = actSb;
    actSb.self = actSb.window;
    const actCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'site-gestures-actions.js'), 'utf8');
    vm.runInNewContext(actCode, actSb, { filename: 'static/player/site-gestures-actions.js' });
    const actExports = actSb.ASTGesturesActions || actSb.window.ASTGesturesActions;
    assert.ok(actExports, 'site-gestures-actions.js must export ASTGesturesActions');
    for (const fnName of [
      '_resolveVarBounds', '_resolveHoldReleaseValue', '_writeEngineVar', '_speakGestureText',
      '_playNamedTone', 'playAudioTone', '_playToneSpec', '_flushPendingTouchAudio', 'handleTouchEnd',
      '_readMatchedElementAttr', '_evalGestureExpr', '_evalConditionExpr', '_emitSiteDirective',
      '_executeDeclarativeAction', '_applyGesturePress', '_applyContinuousGestureStep',
      '_releaseHoldForGesture', '_releasePointerEntry', '_releaseAllHeldInputs', '_ensureHoldLoop',
      '_stopHoldLoop', '_runHoldLoop', '_gestureMatchesKey', '_ensureInteractiveSimPlaying',
    ]) {
      assert.strictEqual(typeof actExports[fnName], 'function', `ASTGesturesActions must export function ${fnName}`);
    }
    let seekTarget = -1;
    const spokenLines: string[] = [];
    const mockActHost: any = {
      engine: {
        vars: { page: 0, boost: false, score: 1 },
        scene: { id: 'reader-demo', vars: { score: { min: 0, max: 5 }, boost: { defaultValue: false } } },
        progress: 0,
        setVar(k: string, v: any) { this.vars[k] = v; },
        seek(t: number) { seekTarget = t; this.progress = t; },
        speak(txt: string) { spokenLines.push(txt); },
      },
      _customActions: new Map(),
      _activeHoldVars: new Map(),
      _heldKeys: new Set(),
      _heldKeyCodeMap: new Map(),
      _heldPointerEntries: new Map(),
      _pendingTouchAudio: new Map(),
      _holdRafId: null,
      _isControlEnabled: () => true,
      sonificationEnabled: true,
      playAudioTone: () => {},
    };
    for (const fnName of Object.keys(actExports)) {
      if (typeof actExports[fnName] === 'function' && fnName !== 'playAudioTone') {
        mockActHost[fnName] = actExports[fnName].bind(mockActHost);
      }
    }
    const slideChanged = actExports._applyGesturePress.call(
      mockActHost,
      { action: 'step-slide', var: 'page', delta: 1, count: 5 },
      null,
      mockActHost.engine.scene
    );
    assert.strictEqual(slideChanged, true, '_applyGesturePress must handle declarative step-slide');
    assert.strictEqual(mockActHost.engine.vars.page, 1, 'step-slide must increment page var');
    assert.strictEqual(seekTarget, 0.25, 'step-slide must seek timeline to 1 / (5 - 1)');

    const navHandled = actExports._executeDeclarativeAction.call(
      mockActHost,
      { action: 'navigate', route: '/library' },
      null,
      undefined,
      mockActHost.engine.scene
    );
    assert.strictEqual(navHandled, true, '_executeDeclarativeAction must emit navigate directive');
    assert.strictEqual(emittedDirectives.length, 1, 'navigate must post SITE_DIRECTIVE to parent');
    assert.strictEqual(emittedDirectives[0].directive.route, '/library', 'SITE_DIRECTIVE must carry route');

    const holdGesture = { holdVar: 'boost', val: true, speak: 'Boost engaged' };
    const touchQueue: any[] = [];
    actExports._applyGesturePress.call(mockActHost, holdGesture, null, mockActHost.engine.scene, touchQueue);
    assert.strictEqual(mockActHost.engine.vars.boost, true, 'holdVar must engage on press');
    assert.strictEqual(touchQueue.length, 1, 'audioQueue must defer speech until pointerup/touchend');
    mockActHost._pendingTouchAudio.set(7, touchQueue);
    actExports._flushPendingTouchAudio.call(mockActHost, 7);
    assert.strictEqual(spokenLines[0], 'Boost engaged', '_flushPendingTouchAudio must flush queued TTS');
    actExports._releaseHoldForGesture.call(mockActHost, holdGesture);
    assert.strictEqual(mockActHost.engine.vars.boost, false, '_releaseHoldForGesture must restore default releaseVal');

    // Verify site-gestures-input.js exports, universal key execution, generic/rotate/trackball drag & stage enhancement
    const inpSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite, setTimeout, clearTimeout,
      performance: { now: () => 1000 },
      window: { focus: () => {} },
      document: { getElementById: () => null, querySelector: () => null },
    };
    inpSb.globalThis = inpSb;
    inpSb.self = inpSb.window;
    const inpCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'site-gestures-input.js'), 'utf8');
    vm.runInNewContext(inpCode, inpSb, { filename: 'static/player/site-gestures-input.js' });
    const inpExports = inpSb.ASTGesturesInput || inpSb.window.ASTGesturesInput;
    assert.ok(inpExports, 'site-gestures-input.js must export ASTGesturesInput');
    for (const fnName of [
      '_handleCheckpointModalKeys', '_executeUniversalKeyRule', 'handleKeyDown', 'handleKeyUp',
      'handleWindowBlur', 'handlePointerLeave', 'screenToSvg', 'enhanceSceneInteractivity',
      'handlePointerDown', 'handlePointerMove', 'handlePointerUp', 'handlePointerCancel',
      'handleTrackballDrag', 'handleGenericDrag', 'handleRotateDrag', 'handleBindInputDrag',
    ]) {
      assert.strictEqual(typeof inpExports[fnName], 'function', `ASTGesturesInput must export function ${fnName}`);
    }
    const inpAttrs: Record<string, string> = {
      'data-gesture-axis': 'x',
      'data-gesture-min-x': '0',
      'data-gesture-max-x': '100',
      'data-gesture-var': 'temp',
      'data-gesture-cx': '100',
      'data-gesture-cy': '100',
    };
    const mockDragTarget: any = {
      style: {},
      getAttribute(k: string) { return inpAttrs[k] !== undefined ? inpAttrs[k] : null; },
      setAttribute(k: string, v: string) { inpAttrs[k] = String(v); },
    };
    const mockInpHost: any = {
      engine: {
        vars: { temp: 0, angle: 0, yaw: 0, pitch: 20 },
        scene: { vars: { temp: { min: 0, max: 100 }, yaw: { min: 0, max: 360 } }, inputs: [] },
        progress: 0,
        setVar(k: string, v: any) { this.vars[k] = v; },
        applyBindings() {},
        togglePlay() { this._toggled = true; },
      },
      _customActions: new Map(),
      _customGestureSkills: new Map(),
      _isControlEnabled: () => true,
      _writeEngineVar(k: string, v: any) { this.engine.setVar(k, v); },
      _resolveVarBounds: () => ({ min: 0, max: 360 }),
      dragStart: { x: 0, y: 0 },
      targetInitial: { initTx: 0, initTy: 0, x: 0, y: 0 },
      trackballYawVar: 'yaw',
      trackballPitchVar: 'pitch',
      trackballPitchMin: -65,
      trackballPitchMax: 65,
      trackballStartYaw: 0,
      trackballStartPitch: 20,
    };
    assert.strictEqual(inpExports._executeUniversalKeyRule.call(mockInpHost, { action: 'toggle-play' }, mockInpHost.engine.scene), true, '_executeUniversalKeyRule must dispatch toggle-play');
    assert.strictEqual(mockInpHost.engine._toggled, true, 'toggle-play must invoke engine.togglePlay');
    inpExports.handleGenericDrag.call(mockInpHost, mockDragTarget, { x: 50, y: 0 });
    assert.strictEqual(mockInpHost.engine.vars.temp, 50, 'handleGenericDrag must map SVG drag coordinate into bounded var');
    inpExports.handleRotateDrag.call(mockInpHost, mockDragTarget, { x: 100, y: 200 });
    assert.strictEqual(mockInpHost.engine.vars.temp, 90, 'handleRotateDrag must compute 90 deg rotation around (100,100)');
    inpExports.handleTrackballDrag.call(mockInpHost, { clientX: 50, clientY: -20 });
    assert.strictEqual(mockInpHost.engine.vars.yaw, 40, 'handleTrackballDrag must update yaw var');
    assert.strictEqual(mockInpHost.engine.vars.pitch, 30, 'handleTrackballDrag must update clamped pitch var');

    // Verify ast-expr.js, ast-bytecode-decoder.js, and ast-parser.js standalone modular exports
    const exprSb: any = { console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, parseInt, parseFloat, isNaN, isFinite };
    exprSb.globalThis = exprSb;
    exprSb.window = exprSb;
    vm.runInNewContext(fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-expr.js'), 'utf8'), exprSb, { filename: 'static/player/ast-expr.js' });
    assert.strictEqual(typeof exprSb.compileAstFn, 'function', 'ast-expr.js must export compileAstFn');
    assert.strictEqual(typeof exprSb.compileAstExpr, 'function', 'ast-expr.js must export compileAstExpr');
    assert.ok(exprSb.AstMath && typeof exprSb.AstMath.lerp === 'function', 'ast-expr.js must export AstMath.lerp');
    const compiledExprFn = exprSb.compileAstFn('vars.a + vars.b * 2');
    assert.strictEqual(compiledExprFn(0, { a: 3, b: 4 }, {}, Math), 11, 'compileAstFn must evaluate reactive arithmetic');

    const bcSb: any = { console, Math, Number, String, Boolean, Array, Object, Uint8Array, ArrayBuffer, DataView, TextDecoder, TextEncoder };
    bcSb.globalThis = bcSb;
    bcSb.window = bcSb;
    vm.runInNewContext(fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-bytecode-decoder.js'), 'utf8'), bcSb, { filename: 'static/player/ast-bytecode-decoder.js' });
    assert.strictEqual(typeof bcSb.isAstBytecode, 'function', 'ast-bytecode-decoder.js must export isAstBytecode');
    assert.strictEqual(typeof bcSb.decompileBytecode, 'function', 'ast-bytecode-decoder.js must export decompileBytecode');
    const pythAstb = fs.readFileSync(path.join(process.cwd(), 'static', 'bytecode', 'pythagoras.astb'));
    assert.strictEqual(bcSb.isAstBytecode(pythAstb), true, 'isAstBytecode must detect compiled pythagoras.astb');
    const decodedPyth = bcSb.decompileBytecode(pythAstb);
    assert.strictEqual(decodedPyth?.id, 'pythagoras', 'decompileBytecode must decode pythagoras.astb standalone');

    const parserSb: any = { console, Math, Number, String, Boolean, Array, Object, RegExp, parseInt, parseFloat, isNaN, isFinite, Uint8Array, ArrayBuffer, TextEncoder };
    parserSb.globalThis = parserSb;
    parserSb.window = parserSb;
    vm.runInNewContext(fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-parser.js'), 'utf8'), parserSb, { filename: 'static/player/ast-parser.js' });
    assert.strictEqual(typeof parserSb.parseAst, 'function', 'ast-parser.js must export parseAst standalone');
    const parsedMini = parserSb.parseAst('(:scene :id "mini-test" :title "Mini Test" :duration 8.0)');
    assert.strictEqual(parsedMini?.id, 'mini-test', 'parseAst must parse S-expression scene standalone');

    // Verify ast-file-ingest.js, ast-svg-integrity.js, and player-ui-events.js standalone modular exports
    const ingestSb: any = { console, Math, Number, String, Boolean, Array, Object, Set, Map, RegExp, Error, JSON, Date, window: {} };
    ingestSb.globalThis = ingestSb;
    ingestSb.self = ingestSb.window;
    vm.runInNewContext(fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-file-ingest.js'), 'utf8'), ingestSb, { filename: 'static/player/ast-file-ingest.js' });
    const ingestExports = ingestSb.ASTFileIngest || ingestSb.window.ASTFileIngest;
    assert.ok(ingestExports, 'ast-file-ingest.js must export ASTFileIngest standalone');
    for (const fnName of ['loadFromFile', 'readFileAsText', 'loadFiles', 'loadFromPayload', 'loadFromUrl', 'renderErrorPlaceholder']) {
      assert.strictEqual(typeof ingestExports[fnName], 'function', `ASTFileIngest must export function ${fnName}`);
    }

    const integritySb: any = { console, Math, Number, String, Boolean, Array, Object, Set, Map, RegExp, Error, JSON, Date, Uint8Array, ArrayBuffer, TextEncoder, window: {} };
    integritySb.globalThis = integritySb;
    integritySb.self = integritySb.window;
    vm.runInNewContext(fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-svg-integrity.js'), 'utf8'), integritySb, { filename: 'static/player/ast-svg-integrity.js' });
    const integrityExports = integritySb.ASTSvgIntegrity || integritySb.window.ASTSvgIntegrity;
    assert.ok(integrityExports, 'ast-svg-integrity.js must export ASTSvgIntegrity standalone');
    for (const fnName of ['sanitizeSvg', 'sanitizeSvgElement', '_buildSafeSvgTree', 'ensureMasterDefs', '_computeSha256Hex', '_resolveChecksumBaseUrl', '_loadChecksumRegistry', 'verifyLoadedCartridge']) {
      assert.strictEqual(typeof integrityExports[fnName], 'function', `ASTSvgIntegrity must export function ${fnName}`);
    }
    assert.ok(integrityExports.sanitizeSvg('<!DOCTYPE svg><svg></svg>').includes('DOCTYPE disabled'), 'ASTSvgIntegrity.sanitizeSvg must neutralize DOCTYPE standalone');

    const uiEventsSb: any = { console, Math, Number, String, Boolean, Array, Object, Set, Map, RegExp, Error, JSON, Date, parseInt, parseFloat, isNaN, isFinite, window: {} };
    uiEventsSb.globalThis = uiEventsSb;
    uiEventsSb.self = uiEventsSb.window;
    vm.runInNewContext(fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-events.js'), 'utf8'), uiEventsSb, { filename: 'static/player/player-ui-events.js' });
    const uiEventsExports = uiEventsSb.ASTPlayerUIEvents || uiEventsSb.window.ASTPlayerUIEvents;
    assert.ok(uiEventsExports, 'player-ui-events.js must export ASTPlayerUIEvents standalone');
    for (const fnName of ['updateView', 'bindDOMEvents', 'bindEngineEvents', 'updateIntegrityBadge']) {
      assert.strictEqual(typeof uiEventsExports[fnName], 'function', `ASTPlayerUIEvents must export function ${fnName}`);
    }

    // Verify site-gestures.js evaluates and constructs cleanly standalone (without peer gesture modules loaded)
    const sgOnlySb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite,
      window: { addEventListener: () => {} },
      document: { getElementById: () => null, querySelector: () => null },
    };
    sgOnlySb.globalThis = sgOnlySb;
    sgOnlySb.self = sgOnlySb.window;
    const sgStandaloneCode = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'site-gestures.js'), 'utf8');
    vm.runInNewContext(sgStandaloneCode, sgOnlySb, { filename: 'static/player/site-gestures.js' });
    const StandaloneGesturesCtor = sgOnlySb.ASTDirectGestureSubsystem || sgOnlySb.window.ASTDirectGestureSubsystem;
    assert.strictEqual(typeof StandaloneGesturesCtor, 'function', 'site-gestures.js must export ASTDirectGestureSubsystem standalone');
    const standaloneSg = new StandaloneGesturesCtor({});
    assert.ok(standaloneSg, 'Standalone ASTDirectGestureSubsystem must construct cleanly without peer gesture modules');

    console.log('[✅ PASS] Sim 27: Modular AST engine, UI & gesture peer module integrity, load order, exports & standalone safety verified.');
    passedTests++;
  }

  // =========================================================================
  // 29. Nested AST Tuples, Pure-Lisp Control Flow, Guarded Bindings & .astb Parity
  // =========================================================================
  {
    // 29a. Pure-Lisp (let ...), (let* ...), (cond ...), (case ...), (nth ...), (fixed ...)
    const exprSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON,
      parseInt, parseFloat, isNaN, isFinite,
    };
    exprSb.globalThis = exprSb;
    exprSb.window = exprSb;
    vm.runInNewContext(
      fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-expr.js'), 'utf8'),
      exprSb,
      { filename: 'static/player/ast-expr.js' }
    );

    const letFn = exprSb.compileAstFn('(let ((p (clamp (round page) 0 4)) (p1 (+ p 1))) (concat "Page " p1 " (" (fixed (* p1 20) 1) "%)"))');
    assert.strictEqual(letFn(0, { page: 2.2 }, {}, Math), 'Page 3 (60.0%)', 'compileAstFn (let ...) must evaluate sequential slots and fixed');
    assert.strictEqual(letFn(0, { page: 9 }, {}, Math), 'Page 5 (100.0%)', 'compileAstFn (let ...) must reuse slots deterministically across frames');

    const condFn = exprSb.compileAstFn('(cond ((< ph 6.5) "acid") ((> ph 7.5) "alkali") (else "neutral"))');
    assert.strictEqual(condFn(0, { ph: 3 }, {}, Math), 'acid', '(cond ...) must match first branch');
    assert.strictEqual(condFn(0, { ph: 7 }, {}, Math), 'neutral', '(cond ...) must match else branch');
    assert.strictEqual(condFn(0, { ph: 11 }, {}, Math), 'alkali', '(cond ...) must match second branch');

    const caseFn = exprSb.compileAstFn('(case state (0 "idle") (1 "active") (else "done"))');
    assert.strictEqual(caseFn(0, { state: 0 }, {}, Math), 'idle', '(case ...) must match 0');
    assert.strictEqual(caseFn(0, { state: 1 }, {}, Math), 'active', '(case ...) must match 1');
    assert.strictEqual(caseFn(0, { state: 9 }, {}, Math), 'done', '(case ...) must match else');

    const nthFn = exprSb.compileAstFn('(nth idx "alpha" "beta" "gamma")');
    assert.strictEqual(nthFn(0, { idx: 0 }, {}, Math), 'alpha', '(nth ...) must index 0');
    assert.strictEqual(nthFn(0, { idx: 2 }, {}, Math), 'gamma', '(nth ...) must index 2');
    assert.strictEqual(nthFn(0, { idx: 99 }, {}, Math), 'gamma', '(nth ...) must clamp upper bound');

    const exprStr = exprSb.compileAstExpr('(let ((a (+ x 1))) (case a (2 "two") (else "other")))');
    assert.ok(typeof exprStr === 'string' && exprStr.length > 0, 'compileAstExpr must emit JS expression for nested Lisp forms');

    // 29b. Nested parser forms: :for, nested 2D :for, list :for, :repeat, grouped :target, nested :when, :group, gesture :seq/:if
    const parserSb: any = {
      console, Math, Number, String, Boolean, Array, Object, RegExp,
      parseInt, parseFloat, isNaN, isFinite, Uint8Array, ArrayBuffer, TextEncoder,
    };
    parserSb.globalThis = parserSb;
    parserSb.window = parserSb;
    vm.runInNewContext(
      fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-parser.js'), 'utf8'),
      parserSb,
      { filename: 'static/player/ast-parser.js' }
    );

    const nestedAst = `
      (:scene :id "nested-demo" :title "Nested Demo" :type "Slide" :duration 5.0
        (:vars
          (:var :name "page" :initial 0 :min 0 :max 2)
          (:var :name "active" :initial 1 :min 0 :max 1)
          (:var :name "score" :initial 0 :min 0 :max 10)
          (:var :name "mode" :initial 1 :min 0 :max 1)
          (:var :name "flag" :initial 0 :min 0 :max 1)
          (:var :name "w" :initial ""))
        (:bindings
          (:for i (0 2)
            (:target "#page-{{i}}"
              (:attr "display" "(if (= page {{i}}) 'inline' 'none')")
              (:attr "data-idx" "{{i+1}}")))
          (:for r (0 1)
            (:for c (0 1)
              (:target "#grid-{{r}}-{{c}}" :attr "x" :expr "{{c*10}}")))
          (:repeat col ("red" "blue")
            (:target "#dot-{{col}}" :attr "opacity" :expr "1"))
          (:when "(= active 1)"
            (:group
              (:target "#card"
                (:attr "opacity" :expr "1")
                (:text :expr "'Hi'")))
            (:when "(> score 0)"
              (:target "#badge" :attr "display" :expr "'inline'"))))
        (:gestures
          (:clickable :target ".word"
            (:seq
              (:set-var "w" :from-attr "data-word")
              (:if "(= mode 1)"
                (:step-var "score" :delta 1 :min 0 :max 10)
                (:toggle-var "flag"))
              (:tone "523.25")))))
    `;

    const parsedNested = parserSb.parseAst(nestedAst);
    assert.ok(parsedNested, 'parseAst must parse nested tuple scene');
    assert.strictEqual(parsedNested.id, 'nested-demo', 'parseAst must preserve scene id after macro expansion');

    const page0Display = parsedNested.bindings.find((b: any) => b.target === '#page-0' && b.attr === 'display');
    const page2Idx = parsedNested.bindings.find((b: any) => b.target === '#page-2' && b.attr === 'data-idx');
    assert.ok(page0Display && page0Display.expr.includes('= page 0'), ':for macro must expand {{i}} inside grouped :target');
    assert.ok(page2Idx && page2Idx.expr === '3', ':for macro must evaluate {{i+1}} arithmetic');

    const grid11 = parsedNested.bindings.find((b: any) => b.target === '#grid-1-1' && b.attr === 'x');
    assert.ok(grid11 && grid11.expr === '10', 'nested 2D :for must expand {{r}}, {{c}}, and {{c*10}}');

    const dotBlue = parsedNested.bindings.find((b: any) => b.target === '#dot-blue' && b.attr === 'opacity');
    assert.ok(dotBlue, ':repeat list macro must expand string list items');

    const cardText = parsedNested.bindings.find((b: any) => b.target === '#card' && b.attr === 'textContent');
    assert.ok(cardText && cardText.when === '(= active 1)', 'grouped :target (:text ...) inside :when/:group must inherit guard');

    const badgeBinding = parsedNested.bindings.find((b: any) => b.target === '#badge' && b.attr === 'display');
    assert.ok(
      badgeBinding && badgeBinding.when && badgeBinding.when.includes('and') && badgeBinding.when.includes('= active 1') && badgeBinding.when.includes('> score 0'),
      'nested :when guards must compose via logical (and outer inner)'
    );

    assert.strictEqual(parsedNested.gestures.length, 1, 'parseAst must parse gesture containing nested :seq/:if steps');
    const clickGesture = parsedNested.gestures[0];
    assert.ok(Array.isArray(clickGesture.steps) && clickGesture.steps.length === 1 && clickGesture.steps[0].type === 'seq', 'gesture must carry parsed :seq step tree');
    assert.strictEqual(clickGesture.steps[0].steps.length, 3, ':seq must preserve all 3 child steps');
    assert.strictEqual(clickGesture.steps[0].steps[1].type, 'if', ':seq must preserve nested :if step');

    // 29c. Runtime guard evaluation in ast-scene-mount.js + ast-binding-runtime.js
    const runtimeSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, WeakSet,
      ArrayBuffer, DataView, Float32Array, Float64Array, Int32Array, Uint8Array,
      TextDecoder, TextEncoder, RegExp, Error, JSON, URLSearchParams, Date, Function,
      parseInt, parseFloat, isNaN, isFinite, setTimeout, clearTimeout,
      performance: { now: () => Date.now() },
      location: { search: '', origin: 'http://localhost', href: 'http://localhost/player.html', pathname: '/player.html' },
      window: { location: { origin: 'http://localhost', search: '' }, addEventListener: () => {} },
      navigator: { userAgent: 'NodeInvariantRunner' },
    };
    runtimeSb.globalThis = runtimeSb;
    runtimeSb.self = runtimeSb.window;
    loadAstPlayerRuntimeIntoSandbox(runtimeSb);

    const badgeAttrs: Record<string, string> = { display: 'none' };
    const badgeEl = {
      tagName: 'g',
      setAttribute(k: string, v: string) { badgeAttrs[k] = String(v); },
      getAttribute(k: string) { return badgeAttrs[k] ?? null; },
    };
    const mockBindingEngine: any = {
      scene: { id: 'guard-test', duration: 1, bindings: [badgeBinding], vars: {} },
      vars: { active: 0, score: 5 },
      progress: 0,
      stageEl: { querySelector: (sel: string) => (sel === '#badge' ? badgeEl : null), querySelectorAll: () => [] },
      activeBindings: [
        {
          node: badgeEl,
          attr: 'display',
          evalFn: runtimeSb.compileAstFn(badgeBinding.expr),
          whenFn: runtimeSb.compileAstFn(badgeBinding.when),
          lastVal: null,
        },
      ],
      active3DItems: [],
      activeVarBindings: [],
      updateComputedVars() {},
      updateEmitters() {},
      updateScopes() {},
      updateLedgers() {},
      emit() {},
    };
    const bindingRuntime = runtimeSb.ASTBindingRuntime || runtimeSb.window.ASTBindingRuntime;
    bindingRuntime.applyBindings.call(mockBindingEngine, 0);
    assert.strictEqual(badgeAttrs.display, 'none', ':when guard must skip DOM mutation when predicate is falsy');
    mockBindingEngine.vars.active = 1;
    bindingRuntime.applyBindings.call(mockBindingEngine, 0);
    assert.strictEqual(badgeAttrs.display, 'inline', ':when guard must apply DOM mutation once predicate becomes truthy');

    // 29d. Nested gesture pipeline (:seq + :if with Pure-Lisp condition) in site-gestures-actions.js
    const actNestedSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, RegExp, Error, JSON, Date,
      parseInt, parseFloat, isNaN, isFinite, setTimeout, clearTimeout,
      compileAstFn: exprSb.compileAstFn,
      window: { parent: { postMessage() {} } },
    };
    actNestedSb.globalThis = actNestedSb;
    actNestedSb.self = actNestedSb.window;
    vm.runInNewContext(
      fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'site-gestures-actions.js'), 'utf8'),
      actNestedSb,
      { filename: 'static/player/site-gestures-actions.js' }
    );
    const actNestedExports = actNestedSb.ASTGesturesActions || actNestedSb.window.ASTGesturesActions;
    const playedTones: any[] = [];
    const nestedActHost: any = {
      engine: {
        vars: { w: '', mode: 1, score: 0, flag: false },
        scene: { id: 'nested-demo', vars: { score: { min: 0, max: 10 } } },
        progress: 0,
        compileAstFn: exprSb.compileAstFn,
        setVar(k: string, v: any) { this.vars[k] = v; },
      },
      _customActions: new Map(),
      _activeHoldVars: new Map(),
      _heldKeys: new Set(),
      _heldKeyCodeMap: new Map(),
      _heldPointerEntries: new Map(),
      _pendingTouchAudio: new Map(),
      _isControlEnabled: () => true,
      sonificationEnabled: true,
      playAudioTone(freq: any) { playedTones.push(freq); },
    };
    for (const fnName of Object.keys(actNestedExports)) {
      if (typeof actNestedExports[fnName] === 'function' && fnName !== 'playAudioTone') {
        nestedActHost[fnName] = actNestedExports[fnName].bind(nestedActHost);
      }
    }
    const mockWordEl = { getAttribute: (k: string) => (k === 'data-word' ? 'cat' : null) };
    actNestedExports._applyGesturePress.call(nestedActHost, clickGesture, mockWordEl, nestedActHost.engine.scene);
    assert.strictEqual(nestedActHost.engine.vars.w, 'cat', 'nested :seq :set-var :from-attr must set active word');
    assert.strictEqual(nestedActHost.engine.vars.score, 1, 'nested :if true branch must increment score');
    assert.strictEqual(nestedActHost.engine.vars.flag, false, 'nested :if false branch must not run when condition is true');
    assert.strictEqual(playedTones.length, 1, 'nested :seq :tone must fire procedural audio cue');

    nestedActHost.engine.vars.mode = 0;
    actNestedExports._applyGesturePress.call(nestedActHost, clickGesture, mockWordEl, nestedActHost.engine.scene);
    assert.strictEqual(nestedActHost.engine.vars.score, 1, 'nested :if true branch must not run when mode=0');
    assert.strictEqual(nestedActHost.engine.vars.flag, true, 'nested :if false branch must toggle flag when mode=0');

    // 29e. .astb Bytecode parity for :for, grouped :target, and OP_BINDING_WHEN (0x31)
    const compiledBytes = compileAstTextToBytecode(nestedAst);
    const tsDecoded = decompileBytecodeToScene(compiledBytes);
    const jsDecoded = runtimeSb.decompileBytecode(compiledBytes);
    const tsBadge = tsDecoded.bindings.find((b) => b.target === '#badge' && b.attr === 'display');
    const jsBadge = jsDecoded.bindings.find((b: any) => b.target === '#badge' && b.attr === 'display');
    assert.ok(tsBadge && tsBadge.when && tsBadge.when.includes('active'), 'TS decompileBytecodeToScene must round-trip OP_BINDING_WHEN guard');
    assert.ok(jsBadge && jsBadge.when === tsBadge.when, 'JS decompileBytecode must match TS decoded OP_BINDING_WHEN guard');
    const jsGrid11 = jsDecoded.bindings.find((b: any) => b.target === '#grid-1-1' && b.attr === 'x');
    assert.ok(jsGrid11 && jsGrid11.expr === '10', 'compileAstTextToBytecode must expand nested :for macros into .astb');

    // 29f. Authoritative tuples.md specification coverage
    const tuplesDoc = fs.readFileSync(path.join(process.cwd(), 'static', 'cartridges', 'tuples.md'), 'utf8');
    for (const token of ['(:for', '(:when', '(:group', '(:seq', '(let', '(cond', '(case', '(nth', 'OP_BINDING_WHEN']) {
      assert.ok(tuplesDoc.includes(token), `static/cartridges/tuples.md must document ${token}`);
    }

    console.log('[✅ PASS] Sim 29: Nested AST tuples (:for, grouped :target, :when, :seq/:if), Pure-Lisp forms & OP_BINDING_WHEN bytecode parity verified.');
    passedTests++;
  }

  // =========================================================================
  // 30. Modular ast-bridge Resilience: Idempotency, Fault Isolation, Origin & SVG Serialization
  // =========================================================================
  {
    const listeners: Array<(e: any) => void> = [];
    const parentMsgs: any[] = [];
    const brSb: any = {
      console: { warn: () => {}, error: () => {}, log: () => {} },
      Math, Number, String, Boolean, Array, Object, Map, Set, WeakSet, RegExp, Error, JSON, Date, Promise,
      parseFloat, parseInt, isNaN, isFinite,
      setTimeout, clearTimeout,
      location: { origin: 'https://portal.local', search: '' },
      addEventListener: (t: string, fn: (e: any) => void) => { if (t === 'message') listeners.push(fn); },
      removeEventListener: (t: string, fn: (e: any) => void) => {
        if (t !== 'message') return;
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      },
    };
    brSb.window = brSb;
    brSb.globalThis = brSb;
    brSb.self = brSb;

    for (const f of ['ast-bridge-playback.js', 'ast-bridge-cartridge.js', 'ast-bridge-telemetry.js', 'ast-bridge.js']) {
      const code = fs.readFileSync(path.join(process.cwd(), 'static', 'player', f), 'utf8');
      vm.runInNewContext(code, brSb, { filename: `static/player/${f}` });
    }

    let playCalls = 0;
    const mockEngine: any = {
      targetOrigin: 'https://portal.local',
      progress: 0,
      isPlaying: false,
      scene: { vars: { speed: { min: 1, max: 10 } } },
      play() { playCalls++; this.isPlaying = true; },
      pause() { this.isPlaying = false; },
      getStageSvg() { return { outerHTML: '<svg id="stage-svg"><rect/></svg>' }; },
      hotReloadSvg(svg: string) { this._reloadedSvg = svg; return true; },
      hotReloadAst(ast: string) { this._reloadedAst = ast; return true; },
      notifyParent(msg: any) { parentMsgs.push(msg); },
      loadSceneData() { return Promise.reject(new Error('Simulated async SWF load error')); },
      setMemoryVar(name: string, val: any) { this._lastVar = { name, val }; },
      normalizeVarName(name: string) { return String(name); },
      getEngineStateSummary() { return { ok: true }; },
    };

    // 30a. Idempotent registration: calling setupPostMessageBridge twice keeps exactly 1 active listener
    const handle1 = brSb.setupPostMessageBridge(mockEngine, null);
    assert.strictEqual(listeners.length, 1, 'setupPostMessageBridge must attach exactly 1 message listener');
    const handle2 = brSb.setupPostMessageBridge(mockEngine, null);
    assert.strictEqual(listeners.length, 1, 'Re-calling setupPostMessageBridge must replace prior listener without leaking duplicates');
    assert.ok(handle1 && handle2 && typeof handle2.destroy === 'function', 'setupPostMessageBridge must return a destroyable handle');

    // 30b. Cross-origin rejection
    listeners[0]({ origin: 'https://evil.example', data: { type: 'PLAY' } });
    assert.strictEqual(playCalls, 0, 'Cross-origin PLAY message must be rejected');

    // 30c. Valid origin dispatches once
    listeners[0]({ origin: 'https://portal.local', data: { type: 'PLAY' } });
    assert.strictEqual(playCalls, 1, 'Authorized PLAY message must execute exactly once');

    // 30d. Prototype-key safety (command lookup + SET_VAR)
    listeners[0]({ origin: 'https://portal.local', data: { type: 'constructor' } });
    listeners[0]({ origin: 'https://portal.local', data: { type: 'toString' } });
    listeners[0]({ origin: 'https://portal.local', data: { type: 'SET_VAR', name: '__proto__', value: 42 } });
    assert.strictEqual(mockEngine._lastVar, undefined, 'SET_VAR must reject __proto__ keys');

    // 30e. GET_STAGE_SVG serializes SVGElement to string (no DataCloneError)
    listeners[0]({ origin: 'https://portal.local', data: { type: 'GET_STAGE_SVG' } });
    const svgResp = parentMsgs.find((m) => m.type === 'STAGE_SVG_RESPONSE');
    assert.ok(svgResp && typeof svgResp.svg === 'string' && svgResp.svg.includes('<svg id="stage-svg">'), 'GET_STAGE_SVG must serialize SVGElement to outerHTML string');

    // 30f. Per-message fault isolation emits BRIDGE_COMMAND_ERROR and keeps bridge alive
    brSb.ASTPostMessageBridge.registerHandlers({
      TEST_THROW: () => { throw new Error('Boom handler'); },
    });
    const handle3 = brSb.setupPostMessageBridge(mockEngine, null);
    listeners[0]({ origin: 'https://portal.local', data: { type: 'TEST_THROW', requestId: 'req-err-1' } });
    const errAck = parentMsgs.find((m) => m.type === 'BRIDGE_COMMAND_ERROR' && m.requestId === 'req-err-1');
    assert.ok(errAck && errAck.message.includes('Boom handler'), 'Fault-isolated handler error must emit BRIDGE_COMMAND_ERROR when requestId is present');
    listeners[0]({ origin: 'https://portal.local', data: { type: 'PLAY' } });
    assert.strictEqual(playCalls, 2, 'Bridge must remain operational after an isolated handler failure');

    // 30g. HOT_RELOAD_SVG & HOT_RELOAD_AST dispatch cleanly (used by Dev Studio Flash/PhET/Template tabs)
    listeners[0]({ origin: 'https://portal.local', data: { type: 'HOT_RELOAD_SVG', svg: '<svg id="swf-hot"/>' } });
    listeners[0]({ origin: 'https://portal.local', data: { type: 'HOT_RELOAD_AST', ast: '(:scene :id "swf-hot" (:swf-vm "e30="))' } });
    assert.strictEqual(mockEngine._reloadedSvg, '<svg id="swf-hot"/>', 'HOT_RELOAD_SVG must call engine.hotReloadSvg');
    assert.strictEqual(mockEngine._reloadedAst, '(:scene :id "swf-hot" (:swf-vm "e30="))', 'HOT_RELOAD_AST must call engine.hotReloadAst');

    // 30h. Async Promise rejection inside LOAD_CUSTOM_CARTRIDGE reports CARTRIDGE_LOAD_ERROR
    listeners[0]({ origin: 'https://portal.local', data: { type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: { id: 'bad-swf' } } });
    await new Promise((r) => setTimeout(r, 20));
    const cartErr = parentMsgs.find((m) => m.type === 'CARTRIDGE_LOAD_ERROR');
    assert.ok(cartErr && cartErr.message.includes('Simulated async SWF load error'), 'LOAD_CUSTOM_CARTRIDGE must catch async loadSceneData rejections and emit CARTRIDGE_LOAD_ERROR');

    // 30i. Clean teardown
    handle3.destroy();
    assert.strictEqual(listeners.length, 0, 'handle.destroy() must remove message listener cleanly');
    assert.strictEqual(brSb.window.__astBridgeActive, false, 'handle.destroy() must clear __astBridgeActive');

    console.log('[✅ PASS] Sim 30: Modular ast-bridge (playback/cartridge/telemetry) idempotency, fault isolation, prototype safety, SVG serialization & async error reporting verified.');
    passedTests++;
  }

  return passedTests;
}
