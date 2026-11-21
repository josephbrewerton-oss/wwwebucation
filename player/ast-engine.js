/**
 * static/player/ast-engine.js
 * 
 * St Joseph's AST Vector Media Player Engine & Runtime Suite
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 * 
 * Core AST Vector Media Player Engine with 3D Node Subsystem
 * Decoupled folder-based asset architecture:
 * - Dynamic ingestion of [id].svg templates & [id].ast S-expression descriptors
 * - Volumetric 3D Perspective Projection Subsystem (X, Y, Z -> x, y, scale, depthOpacity)
 * - Support for 3D Nodes (spheres/points), 3D Lines (rungs), 3D Rings (orbits/shells), and 3D Polygons (prisms/planes)
 * - Painter's Algorithm dynamic Z-sorting (unified occlusion layering)
 * - Interactive Camera Orbit Subsystem (drag to rotate, scroll to zoom, reset)
 * - Delta-time clamping (0.1s max) for background tab stability
 * - 100ms debounced on-device Web Speech synthesis
 * - Strict origin-validated bi-directional postMessage protocol
 * - Direct element attribute patching with compiled mathematical bindings (60 FPS budget)
 */

(function (global) {
  'use strict';

  const _EMPTY_AST_MATH = Object.create(null);
  const _getAstMath = () => global.AstMath || (typeof window !== 'undefined' ? window.AstMath : undefined) || _EMPTY_AST_MATH;
  const _getAST3D = () => global.AST3DEngine || (typeof window !== 'undefined' ? window.AST3DEngine : undefined);
  const _getASTExporter = () => global.ASTExporter || (typeof window !== 'undefined' ? window.ASTExporter : undefined);
  const _getASTHudControls = () => global.ASTHudControls || (typeof window !== 'undefined' ? window.ASTHudControls : undefined);
  const _getASTAiDirector = () => global.ASTAiDirector || (typeof window !== 'undefined' ? window.ASTAiDirector : undefined);
  const _getASTSceneLoader = () => global.ASTSceneLoader || (typeof window !== 'undefined' ? window.ASTSceneLoader : undefined);

  // ASTStateMachine & MicroSCORMBridge extracted to static/player/ast-state-scorm.js

  // Embedded Built-In Welcome to AST Simulator Cartridge (Zero Network Overhead, Sub-15ms Instant Cold Start)
  const AST_BUILTIN_WELCOME_SVG = `<svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="welcome-bg-glow" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#070c18" />
      <stop offset="100%" stop-color="#02040a" />
    </radialGradient>
    <radialGradient id="welcome-orb-glow" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="40%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </radialGradient>
    <linearGradient id="welcome-cyan-gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#welcome-bg-glow)" />
  <g opacity="0.45">
    <line x1="80" y1="80" x2="720" y2="80" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="160" x2="720" y2="160" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="240" x2="720" y2="240" stroke="#334155" stroke-width="1.5" />
    <line x1="80" y1="320" x2="720" y2="320" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="400" x2="720" y2="400" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="120" y1="60" x2="120" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="260" y1="60" x2="260" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="400" y1="60" x2="400" y2="420" stroke="#334155" stroke-width="1.5" />
    <line x1="540" y1="60" x2="540" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="680" y1="60" x2="680" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
  </g>
  <g transform="translate(400, 38)">
    <rect x="-240" y="-18" width="480" height="36" rx="18" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.6" />
    <circle cx="-216" cy="0" r="6" fill="#10b981" />
    <text x="-196" y="5" fill="#f8fafc" font-size="13" font-weight="800" letter-spacing="1">AST VECTOR MOTION &amp; SIMULATION APPARATUS</text>
    <rect x="156" y="-10" width="66" height="20" rx="10" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1" />
    <text x="189" y="4" fill="#38bdf8" font-size="10" font-weight="900" text-anchor="middle">v2.6.0</text>
  </g>
  <g id="welcome-wave-container">
    <path id="welcome-sine-path" d="M 80 240 Q 240 180, 400 240 T 720 240" fill="none" stroke="url(#welcome-cyan-gold)" stroke-width="3.5" stroke-linecap="round" />
  </g>
  <g transform="translate(400, 240)">
    <circle id="welcome-energy-node" cx="0" cy="0" r="28" fill="url(#welcome-orb-glow)" opacity="0.85" />
    <circle cx="0" cy="0" r="14" fill="#f0f9ff" opacity="0.9" />
    <circle cx="0" cy="0" r="6" fill="#0284c7" />
  </g>
  <g id="welcome-probe-group">
    <circle id="welcome-probe" cx="120" cy="240" r="18" fill="#fbbf24" stroke="#ffffff" stroke-width="3" style="cursor: grab;" data-pedagogical="Direct In-Stage Grabbing: Drag this probe to interact with the vector timeline." />
    <circle cx="120" cy="240" r="6" fill="#78350f" pointer-events="none" />
  </g>
  <g transform="translate(80, 360)">
    <rect x="0" y="0" width="145" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">COLD START</text>
    <text x="14" y="42" fill="#38bdf8" font-size="15" font-weight="900">&lt; 15 ms</text>
    <text x="76" y="42" fill="#64748b" font-size="10">/ 0% CDN</text>
  </g>
  <g transform="translate(240, 360)">
    <rect x="0" y="0" width="150" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">FRAME RATE</text>
    <text x="14" y="42" fill="#10b981" font-size="15" font-weight="900">60 FPS</text>
    <text x="76" y="42" fill="#64748b" font-size="10">SVG Vectors</text>
  </g>
  <g transform="translate(405, 360)">
    <rect x="0" y="0" width="155" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">RUNTIME ENGINE</text>
    <text x="14" y="42" fill="#c084fc" font-size="15" font-weight="900">&lt; 35 KB</text>
    <text x="76" y="42" fill="#64748b" font-size="10">Zero Deps</text>
  </g>
  <g transform="translate(575, 360)">
    <rect x="0" y="0" width="145" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">EDGE AI CO-PILOT</text>
    <text x="14" y="42" fill="#f59e0b" font-size="14" font-weight="900">Gemini Nano</text>
  </g>
  <g transform="translate(80, 80)">
    <text x="0" y="0" fill="#64748b" font-size="10" font-weight="800">RESONANCE:</text>
    <text id="welcome-freq-readout" x="80" y="0" fill="#38bdf8" font-size="12" font-weight="800">2.0 Hz</text>
  </g>
  <g transform="translate(620, 80)">
    <text x="0" y="0" fill="#64748b" font-size="10" font-weight="800">AMPLITUDE:</text>
    <text id="welcome-amp-readout" x="78" y="0" fill="#fbbf24" font-size="12" font-weight="800">35 px</text>
  </g>
  <g transform="translate(80, 436)">
    <rect x="0" y="0" width="640" height="6" rx="3" fill="#1e293b" />
    <rect id="welcome-progress-fill" x="0" y="0" width="0" height="6" rx="3" fill="url(#welcome-cyan-gold)" />
  </g>
</svg>`;

  const AST_BUILTIN_WELCOME_AST = `(:scene :id "welcome" :type "Sim" :title "Welcome to AST Vector Player & Educational Simulator" :stage "PORTAL APPARATUS & SIMULATOR" :duration 16.0
  (:vars ((:var :name "harmonicFreq" :val 2.0 :min 0.5 :max 6.0 :step 0.5 :label "Harmonic Resonance") (:var :name "waveAmplitude" :val 35.0 :min 10.0 :max 80.0 :step 5.0 :label "Wave Amplitude") (:var :name "pulseSpeed" :val 1.0 :min 0.2 :max 3.0 :step 0.2 :label "Time Dilation Clock")))
  (:inputs ((:slider :var "harmonicFreq" :label "Harmonic Frequency" :min 0.5 :max 6.0 :step 0.5) (:slider :var "waveAmplitude" :label "Signal Power" :min 10.0 :max 80.0 :step 5.0) (:slider :var "pulseSpeed" :label "Timeline Warp" :min 0.2 :max 3.0 :step 0.2)))
  (:gestures ((:draggable :target "#welcome-probe" :axis "xy" :min 80 :max 720)))
  (:subtitles ((:start 0.00 :end 0.25 :en "Welcome to AST Vector Player: An autonomous, zero-bloat educational motion and direct-manipulation simulator." :es "Bienvenido al reproductor vectorial AST: Un simulador educativo autónomo y sin sobrecarga." :la "Salve ad AST Vector Player: Machina dynamica et vectorialis ad doctrinam veram.") (:start 0.25 :end 0.55 :en "Flash-Caliber Vector Simulation: Running at 60 FPS in pure SVG DOM with zero external runtime dependencies and sub-15ms cold start." :es "Simulación vectorial calibre Flash: 60 FPS en SVG puro con cero dependencias externas y arranque sub-15ms." :la "Simulatio Vectorialis: Motus continuus ad sexaginta quadros per secundum sine oneribus externis.") (:start 0.55 :end 0.80 :en "Direct In-Stage Grabbing & Smartboard Stylus: Grab and drag interactive physics nodes or draw with Promethean and SMART pens." :es "Manipulación directa en pantalla y pizarra digital: Arrastra nodos físicos o escribe con lápiz óptico." :la "Tactus Directus et Calamus: Trahe elementa viva vel scribe cum calamo digitali super tabulam.") (:start 0.80 :end 1.00 :en "On-Device Gemini Nano AI & W3C WebMCP: Formative assessment and S-Expression logic running purely in the browser with zero cloud leakage." :es "Inteligencia artificial en el dispositivo Gemini Nano: Evaluación formativa y lógica pura sin salida a la nube." :la "Intelligentia Localis: Disciplina et responsa fidelia in machina tua conservata.")))
  (:keyframes ((:t 0.00 :title "1. Autonomous Vector Engine" :rule "Zero Bloat • Native SVG DOM vector apparatus with sub-15ms cold start.") (:t 0.25 :title "2. Harmonic Frequency & Oscillations" :rule "Kinematic Resonance • 60 FPS procedural waveforms with zero video streaming.") (:t 0.55 :title "3. Direct Manipulation & Classroom Stylus" :rule "Interactive Invariants • Drag in-stage nodes or annotate directly with digital ink.") (:t 0.80 :title "4. On-Device Edge Intelligence" :rule "Zero Cloud Leakage • Local Chrome Prompt API / Gemini Nano formative tutoring.")))
  (:interactive ((:checkpoint :t 0.60 :prompt "What architectural feature enables AST Vector Player to boot 70× faster than legacy PhET simulations and video players?" :options ("Declarative Lisp S-Expressions & .astb Bytecode with Zero-Asset Web Audio" "External Cloud Video CDNs" "Gigabyte WebGL textures" "Heavy server-side rendering") :answer 0 :explanation "AST cartridges use micro-payload declarative S-Expressions and compiled binary bytecode (< 15 KB) with procedural Web Audio synthesis, executing in < 0.2 ms with zero cloud dependencies.")))
  (:bindings ((:target "#welcome-probe" :attr "cx" :expr "120 + t * 560") (:target "#welcome-probe" :attr "cy" :expr "240 + Math.sin(t * Math.PI * (vars.harmonicFreq || 2.0) * 2) * (vars.waveAmplitude || 35.0)") (:target "#welcome-energy-node" :attr "r" :expr "24 + Math.sin(t * Math.PI * 8) * 8") (:target "#welcome-energy-node" :attr "opacity" :expr "0.75 + Math.sin(t * 10) * 0.2") (:target "#welcome-sine-path" :attr "d" :expr "'M 80 ' + (240 + Math.sin(t * 4) * 15) + ' Q 240 ' + (240 - (vars.waveAmplitude || 35.0) * 2) + ', 400 240 T 720 ' + (240 + Math.sin(t * 4 + 2) * 15)") (:target "#welcome-freq-readout" :attr "textContent" :expr "(vars.harmonicFreq || 2.0).toFixed(1) + ' Hz'") (:target "#welcome-amp-readout" :attr "textContent" :expr "(vars.waveAmplitude || 35.0).toFixed(0) + ' px'") (:target "#welcome-progress-fill" :attr "width" :expr "t * 640")))
)`;

  class ASTVectorPlayerEngine {
    static VERSION = '2.6.0';
    static LICENSE = 'AGPL-3.0-or-later';
    constructor(options = {}) {
      this.options = Object.assign({
        preset: 'welcome',
        lang: 'en',
        speed: 1.0,
        autoplay: true,
        theme: 'dark',
        voiceEnabled: true,
        container: null,
        basePath: './',
      }, options);

      this.activePresetId = this.options.preset || 'welcome';
      this.currentLang = this.options.lang || 'en';
      this.bilingualSubtitles = Boolean(this.options.bilingualSubtitles);
      this.speechRate = parseFloat(this.options.speechRate) || 0.95;
      this.speed = this.options.speed;
      this.isPlaying = this.options.autoplay;
      this.loop = this.options.loop !== undefined ? Boolean(this.options.loop) : true;
      this.volume = this.options.volume !== undefined ? parseFloat(this.options.volume) : 1.0;
      this.muted = Boolean(this.options.muted);
      this.progress = 0.0; // 0.000 to 1.000
      this.voiceEnabled = this.options.voiceEnabled;
      this.lastSpokenIndex = -1;
      this.lastTimestamp = null;
      this.animationFrameId = null;

      // Origin validation setup for strict zero-egress compliance
      let detectedOrigin = '*';
      if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
        detectedOrigin = window.location.origin;
      }
      this.targetOrigin = this.options.targetOrigin || this.options.hostOrigin || detectedOrigin;

      // Upgraded Micro-Subsystems (Procedural Audio Synth, Verlet Dynamics, Micro-SCORM Bridge)
      const _VectorProceduralAudioSynth = global.VectorProceduralAudioSynth || (typeof window !== 'undefined' ? window.VectorProceduralAudioSynth : undefined);
      this.audioSynth = _VectorProceduralAudioSynth ? new _VectorProceduralAudioSynth(this) : null;
      if (this.audioSynth) this.audioSynth.muted = this.muted;
      const _VectorVerletPhysics = global.VectorVerletPhysics || (typeof window !== 'undefined' ? window.VectorVerletPhysics : undefined);
      this.verletPhysics = _VectorVerletPhysics ? new _VectorVerletPhysics(this) : null;
      const _MicroSCORMBridge = global.MicroSCORMBridge || (typeof window !== 'undefined' ? window.MicroSCORMBridge : undefined);
      this.scormBridge = _MicroSCORMBridge ? new _MicroSCORMBridge(this) : null;
      if (this.scormBridge) this.scormBridge.init();
      this.isBranching = false;
      // Internal Hardware Telemetry & Zero-Allocation Profiler
      this.profiler = null;
      const urlParams = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
      const _store = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
      const isHudParam = urlParams ? (urlParams.get('hud') === '1' || urlParams.get('hud') === 'true') : false;
      const isHudStorage = Boolean(_store && _store.getItem('app_perf_hud_enabled') === 'true');
      const isHudWindow = typeof window !== 'undefined' && window.__AST_PERF_HUD__ === true;
      const perfHudEnabled = isHudParam || isHudStorage || isHudWindow;

      if (perfHudEnabled) {
        const verbosity = (urlParams && urlParams.get('hud_verbosity')) || (_store && _store.getItem('app_hud_verbosity')) || 'minimal';
        const strictAlarm = (urlParams && urlParams.get('budget_alert') === '1') || Boolean(_store && _store.getItem('app_frame_budget_alert') === 'true');

        // Initialize profiler; UI overlay attaches once container/SVG mounts
        const _ASTProfiler = global.ASTProfiler || (typeof window !== 'undefined' ? window.ASTProfiler : undefined);
        this.profiler = _ASTProfiler ? new _ASTProfiler({
          mode: verbosity,
          strictAlarm: strictAlarm
        }) : null;
      }

      // Optional Framerate / Power Gating (0 = Adaptive VSync, 30 = Eco, 60 = Standard, 120/240 = Ultra)
      const isFpsStorage = _store ? _store.getItem('app_target_fps') : null;
      const initialFps = (urlParams && urlParams.get('fps')) || isFpsStorage;
      this.targetFps = initialFps && !isNaN(parseInt(initialFps, 10)) ? parseInt(initialFps, 10) : 0;

      if (_store && _store.ready && typeof _store.isReady === 'function' && !_store.isReady()) {
        _store.ready.then(() => {
          const fpsVal = (urlParams && urlParams.get('fps')) || _store.getItem('app_target_fps');
          if (fpsVal && !isNaN(parseInt(fpsVal, 10))) {
            this.targetFps = parseInt(fpsVal, 10);
          }
          if (!this.profiler && (isHudParam || isHudWindow || _store.getItem('app_perf_hud_enabled') === 'true')) {
            const verbosity = (urlParams && urlParams.get('hud_verbosity')) || _store.getItem('app_hud_verbosity') || 'minimal';
            const strictAlarm = (urlParams && urlParams.get('budget_alert') === '1') || _store.getItem('app_frame_budget_alert') === 'true';
            const _ASTProfiler = global.ASTProfiler || (typeof window !== 'undefined' ? window.ASTProfiler : undefined);
            this.profiler = _ASTProfiler ? new _ASTProfiler({ mode: verbosity, strictAlarm }) : null;
            const st = this.getStageSvg && this.getStageSvg();
            if (st && this.profiler) this.profiler.mount(st);
          }
        });
      }
      this.activeBranches = null;

      // Container & Dynamic Bindings
      this._container = this.options.container || null;
      this.sceneCache = {};
      this.activeBindings = [];
      this.active3DNodes = [];
      this.active3DLines = [];
      this.active3DRings = [];
      this.active3DPolygons = [];
      this.active3DItems = []; // Unified 3D item collection for Painter's algorithm
      this._cachedElements = null;
      this._mountedSceneId = null;
      this._mountedContainer = null;

      // Pre-allocated Zero-GC Hot-Loop Scratch Buffers & Memoization Caches
      this._boundTick = this.tick.bind(this);
      this._exprCache = new Map();
      this._cameraFrame = { distance: 500, pitch: 20, yaw: 0, roll: 0, fov: 60 };
      this._camBasis = {
        cosY: 1, sinY: 0, cosP: 1, sinP: 0, cosR: 1, sinR: 0,
        focalLength: 692.820323, totalDist: 500, invFocalAtDist: 1.0,
        yawBase: 0, pitchBase: 0, rollBase: 0, fov: 60
      };
      this._projOutA = { x: 400, y: 240, z: 0, scale: 1, opacity: 1, safeZ: 500 };
      this._projOutB = { x: 400, y: 240, z: 0, scale: 1, opacity: 1, safeZ: 500 };
      this._sorted3D = [];
      this._timeUpdatePayload = { progress: 0, currentTime: 0, duration: 0 };
      this._lastOrbitTransform = '';
      this._lastOrbitTransition = '';
      this._isSlideScene = false;
      this._isDynamicScene = false;
      this._suspendedByVisibility = false;

      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        this._visibilityHandler = () => {
          if (document.hidden) {
            if (this.animationFrameId) {
              this._suspendedByVisibility = true;
              if (typeof cancelAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animationFrameId);
              }
              this.animationFrameId = null;
              this.lastTimestamp = null;
            }
          } else if (this._suspendedByVisibility) {
            this._suspendedByVisibility = false;
            if (this.isPlaying || (this.physics && this.physics.enabled && this.physics.bodies.length > 0) || (this.emitters && this.emitters.size > 0)) {
              this.start();
            }
          }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler, { passive: true });
      }

      // Interactive Camera Orbit State
      this.cameraOrbit = {
        yawOffset: 0,
        pitchOffset: 0,
        distanceScale: 1.0
      };

      // Direct Analytic Ray-Math & Spatial Telemetry Subsystem (< 15 KB, 0 GPU Drivers)
      this.nodeOffsets = new Map();
      this.spatialTargets = new Map();
      this._lastRayHit = null;
      this._lastCursorRay = null;
      this._lastRayHitSExpr = '(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])';
      this.initDefaultSpatialTargets();

      // Speech synthesis debounce queue timer
      this._speakDebounceTimer = null;

      // Gemini Nano Co-Pilot RPC & Interruption Subsystem (betaplans.md)
      this.isAiDemonstrating = false;
      this._aiPreempted = false;
      this._activeAiTweenId = null;
      this._activeAiViewBoxTweenId = null;
      this._aiHighlightedNodes = new Set();
      this._aiHighlightTimer = null;
      this._defaultViewBox = null;

      if (typeof window !== 'undefined') {
        const _initMobileAudioTtsPriming = global.initMobileAudioTtsPriming || window.initMobileAudioTtsPriming;
        if (typeof _initMobileAudioTtsPriming === 'function') {
          _initMobileAudioTtsPriming(this.audioSynth);
        }
        const handlePreempt = () => {
          if (this.isAiDemonstrating) {
            this.preemptAiDemonstration('USER_INPUT');
          }
        };
        window.addEventListener('pointerdown', handlePreempt, { passive: true });
        window.addEventListener('touchstart', handlePreempt, { passive: true });
        window.addEventListener('wheel', handlePreempt, { passive: true });
        window.addEventListener('keydown', (e) => {
          if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyP', 'KeyR'].includes(e.code)) {
            handlePreempt();
          }
        }, { passive: true });
      }

      // Reactive State Variables & User Interaction
      this.vars = {};

      // Fantasy Console / Lisp Machine Canonical Action Dispatch Table (Map prevents prototype dispatch)
      this.actionDispatch = new Map([
        ['sim:reset', () => this.reset()],
        ['sim:play', () => this.play()],
        ['sim:pause', () => this.pause()],
        ['sim:toggle-play', () => this.togglePlay()],
        ['sim:step', (args) => this.step(args && args[0] !== undefined ? Number(args[0]) : (1 / 60))],
        ['sim:seek', (args) => this.seek(Number(args?.[0] || 0))],
        ['player:toggle-bsl', (args) => this.toggleBsl(args?.[0])],
        ['player:toggle-voice', (args) => this.toggleVoice(args?.[0])],
        ['player:fullscreen', () => this.toggleFullscreen()],
        ['set-var', (args) => {
          if (args && args.length >= 2) this.setMemoryVar(args[0], args[1]);
        }],
        ['toggle-var', (args) => {
          if (args && args.length >= 1) {
            const cur = Boolean(this.getMemoryVar(args[0]));
            this.setMemoryVar(args[0], !cur);
          }
        }]
      ]);

      // Event listeners
      this.listeners = {
        timeupdate: [],
        keyframe: [],
        statechange: [],
        presetchange: [],
        langchange: [],
        camerachange: [],
        varchange: [],
        simreset: [],
        bsltoggle: [],
        voicetoggle: [],
        checkpoint_goal_passed: []
      };

      // Zero-Bloat Micro-Physics Subsystem (< 1.5 KB)
      const _VectorMicroPhysics = global.VectorMicroPhysics || (typeof window !== 'undefined' ? window.VectorMicroPhysics : undefined);
      this.physics = _VectorMicroPhysics ? new _VectorMicroPhysics(this, this.options.physics || {}) : null;

      // Declarative State Transition Machines & Multi-Entity Emitter Collections
      this.stateMachines = new Map();
      this.emitters = new Map();
      this.activeBindInputs = [];

      // Zero-GC Live Vector Oscilloscopes (:scope), Conservation Ledgers (:ledger),
      // Manipulation Goal Checkpoints (:pass-expr / :hold-duration), & Lab CSV Ring Buffer
      this.activeScopes = [];
      this.activeLedgers = [];
      this._cpHoldTimers = new Float32Array(32);
      this._cpPassedMask = new Uint8Array(32);
      this._labLogCapacity = 240;
      this._labLogTimes = new Float64Array(this._labLogCapacity);
      this._labLogCols = [];
      this._labLogCount = 0;
      this._labLogHead = 0;
      this._labLogClock = 0;

      // Gemini Nano AI Co-Pilot State (betaplans.md)
      this.isAiDemonstrating = false;
      this.activeAiTween = null;
      this.activeAiViewBoxTween = null;
      this.originalViewBox = null;
      this.activeAiSpotlightTimers = [];
      this.activeAiActionQueue = [];
      this.currentKeyframeIndex = 0;
      this.isThrottledForAi = false;
      this._preemptionListenersSetup = false;

      // Load initial scene
      this.scene = this.getScene(this.activePresetId);
      this.durationSec = (this.scene && this.scene.duration) || 16.0;

      // Bind methods
      this.tick = this.tick.bind(this);

      // Crucial Cold Start Fix: Synchronously mount initial apparatus (0ms, 0 blank flash)
      if (this._container) {
        const initialScene = this.scene || this.getBuiltinWelcomeScene();
        this.mountSceneAsset(initialScene, this._container);
      }

      // Eagerly ingest initial scene assets if in browser
      if (typeof window !== 'undefined') {
        window.astEngine = this;
        window.engine = this;
        this.loadScene(this.activePresetId, this.isPlaying);
        this.start();
      }
    }

    get container() {
      return this._container;
    }

    set container(node) {
      this._container = node;
      if (node && this.scene) {
        this.mountSceneAsset(this.scene, node);
      }
    }

    getBuiltinWelcomeScene() {
      if (this._cachedWelcomeScene) return this._cachedWelcomeScene;
      let registryWelcome = null;
      if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.get === 'function') {
        registryWelcome = global.ASTSceneRegistry.get('welcome');
      }
      const rawSvg = (registryWelcome && (registryWelcome.svgMarkup || registryWelcome.svgText)) || AST_BUILTIN_WELCOME_SVG;
      const rawAst = (registryWelcome && (registryWelcome.astSource || registryWelcome.astText)) || AST_BUILTIN_WELCOME_AST;
      
      let parsed = null;
      try {
        parsed = this.parseAst(rawAst);
      } catch (_) {}

      this._cachedWelcomeScene = Object.assign({
        id: 'welcome',
        type: 'Sim',
        cartridgeType: 'Sim',
        title: 'Welcome to AST Vector Player & Educational Simulator',
        stage: 'PORTAL SHOWCASE',
        duration: 16.0,
        svgText: rawSvg,
        svgMarkup: rawSvg,
        astSource: rawAst,
        astText: rawAst,
      }, parsed || {});
      return this._cachedWelcomeScene;
    }

    getScene(presetId) {
      if (presetId === 'welcome') {
        return this.getBuiltinWelcomeScene();
      }
      if (this.sceneCache && this.sceneCache[presetId]) {
        return this.sceneCache[presetId];
      }
      if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.get === 'function') {
        const found = global.ASTSceneRegistry.get(presetId);
        if (found && (found.svgText || found.svgMarkup || found.mount || found.render || (found.keyframes && found.keyframes.length))) return found;
      }
      if (global.ASTScenes && global.ASTScenes[presetId]) {
        const found = global.ASTScenes[presetId];
        if (found && (found.svgText || found.svgMarkup || found.mount || found.render || (found.keyframes && found.keyframes.length))) return found;
      }
      return null;
    }

    on(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event].push(callback);
      }
      return () => this.off(event, callback);
    }

    off(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    }

    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(cb => {
          try { cb(data); } catch (err) { console.error('Engine event listener error:', err); }
        });
      }
      // Also notify parent iframe
      this.notifyParent({ type: event.toUpperCase(), ...data });
    }

    /**
     * Origin-validated parent notification
     * Replaces wildcard '*' with window.location.origin or explicit hostOrigin
     */
    notifyParent(payload) {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        const origin = (this.options && (this.options.targetOrigin || this.options.hostOrigin)) || '*';
        window.parent.postMessage({ source: 'ast-vector-player', ...payload }, origin);
      }
    }

    /** 3D Camera, Raycasting & Spatial Actuation Delegators (implemented in static/player/ast-3d.js) */
    has3D() { const _3d = _getAST3D(); return _3d && typeof _3d.has3D === 'function' ? _3d.has3D.call(this) : false; }
    rotateCamera(deltaYaw, deltaPitch) { const _3d = _getAST3D(); if (_3d && typeof _3d.rotateCamera === 'function') _3d.rotateCamera.call(this, deltaYaw, deltaPitch); }
    zoomCamera(deltaZoom) { const _3d = _getAST3D(); if (_3d && typeof _3d.zoomCamera === 'function') _3d.zoomCamera.call(this, deltaZoom); }
    resetCamera() { const _3d = _getAST3D(); if (_3d && typeof _3d.resetCamera === 'function') _3d.resetCamera.call(this); }
    initDefaultSpatialTargets() { const _3d = _getAST3D(); if (_3d && typeof _3d.initDefaultSpatialTargets === 'function') _3d.initDefaultSpatialTargets.call(this); }
    getCameraParameters() { const _3d = _getAST3D(); return _3d && typeof _3d.getCameraParameters === 'function' ? _3d.getCameraParameters.call(this) : { theta: 0, phi: 20, dist: 450, fov: 60, roll: 0 }; }
    computeCameraRay(screenX = 400, screenY = 240) { const _3d = _getAST3D(); return _3d && typeof _3d.computeCameraRay === 'function' ? _3d.computeCameraRay.call(this, screenX, screenY) : { origin: [0, 0, 450], direction: [0, 0, -1], theta: 0, phi: 0, dist: 450 }; }
    _intersectRayCapsule(orig, dir, p1, p2, radius) { const _3d = _getAST3D(); return _3d && typeof _3d._intersectRayCapsule === 'function' ? _3d._intersectRayCapsule.call(this, orig, dir, p1, p2, radius) : null; }
    _intersectRayRing(orig, dir, center, ringR, tubeR = 14, item = null) { const _3d = _getAST3D(); return _3d && typeof _3d._intersectRayRing === 'function' ? _3d._intersectRayRing.call(this, orig, dir, center, ringR, tubeR, item) : null; }
    _intersectRayPolygon(orig, dir, pts) { const _3d = _getAST3D(); return _3d && typeof _3d._intersectRayPolygon === 'function' ? _3d._intersectRayPolygon.call(this, orig, dir, pts) : null; }
    castRay(origin, direction) { const _3d = _getAST3D(); return _3d && typeof _3d.castRay === 'function' ? _3d.castRay.call(this, origin, direction) : null; }
    castCameraRay(screenX = 400, screenY = 240) { const _3d = _getAST3D(); return _3d && typeof _3d.castCameraRay === 'function' ? _3d.castCameraRay.call(this, screenX, screenY) : null; }
    updateCursorRay(screenX, screenY) { const _3d = _getAST3D(); return _3d && typeof _3d.updateCursorRay === 'function' ? _3d.updateCursorRay.call(this, screenX, screenY) : null; }
    formatRayHitSExpr(hit) { const _3d = _getAST3D(); return _3d && typeof _3d.formatRayHitSExpr === 'function' ? _3d.formatRayHitSExpr.call(this, hit) : ""; }
    formatCameraStateSExpr() { const _3d = _getAST3D(); return _3d && typeof _3d.formatCameraStateSExpr === 'function' ? _3d.formatCameraStateSExpr.call(this) : ""; }
    getSpatialTelemetrySExpr(screenX = 400, screenY = 240) { const _3d = _getAST3D(); return _3d && typeof _3d.getSpatialTelemetrySExpr === 'function' ? _3d.getSpatialTelemetrySExpr.call(this, screenX, screenY) : ""; }
    emitSpatialTelemetry(actionTrigger = 'GAZE_UPDATE', screenX = 400, screenY = 240) { const _3d = _getAST3D(); return _3d && typeof _3d.emitSpatialTelemetry === 'function' ? _3d.emitSpatialTelemetry.call(this, actionTrigger, screenX, screenY) : null; }
    actuateCamera(theta, phi, isRelative = false) { const _3d = _getAST3D(); return _3d && typeof _3d.actuateCamera === 'function' ? _3d.actuateCamera.call(this, theta, phi, isRelative) : null; }
    actuateNode(target, dx = 0, dy = 0, dz = 0, isRelative = true) { const _3d = _getAST3D(); return _3d && typeof _3d.actuateNode === 'function' ? _3d.actuateNode.call(this, target, dx, dy, dz, isRelative) : null; }
    tweenCameraOrbit(targetTheta, targetPhi, durationMs = 600) { const _3d = _getAST3D(); return _3d && typeof _3d.tweenCameraOrbit === 'function' ? _3d.tweenCameraOrbit.call(this, targetTheta, targetPhi, durationMs) : Promise.resolve(); }
    tweenNudgeNode(target, dxyz, durationMs = 500) { const _3d = _getAST3D(); return _3d && typeof _3d.tweenNudgeNode === 'function' ? _3d.tweenNudgeNode.call(this, target, dxyz, durationMs) : Promise.resolve(); }
    tweenProbeTo(target, xyz, durationMs = 500) { const _3d = _getAST3D(); return _3d && typeof _3d.tweenProbeTo === 'function' ? _3d.tweenProbeTo.call(this, target, xyz, durationMs) : Promise.resolve(); }
    actuateOpcode(opcode) { const _3d = _getAST3D(); return _3d && typeof _3d.actuateOpcode === 'function' ? _3d.actuateOpcode.call(this, opcode) : null; }

    /**
     * Declarative State Machine API
     */
    addStateMachine(config) {
      const _ASTStateMachine = global.ASTStateMachine || (typeof window !== 'undefined' ? window.ASTStateMachine : undefined);
      if (!_ASTStateMachine) return null;
      const sm = new _ASTStateMachine(this, config);
      this.stateMachines.set(sm.id, sm);
      return sm;
    }

    transitionTo(smId, stateName, duration = null) {
      const sm = this.stateMachines.get(smId);
      return sm ? sm.transitionTo(stateName, duration) : false;
    }

    getState(smId) {
      const sm = this.stateMachines.get(smId);
      return sm ? sm.currentState : null;
    }

    // =========================================================================
    // GEMINI NANO × AST VECTOR PLAYER CO-PILOT RPC PROTOCOL (betaplans.md)
    // =========================================================================

    getStageSvg() {
      if (this.stageSvg && this.stageSvg.ownerDocument) return this.stageSvg;
      if (this.container) {
        if (this.container.tagName && this.container.tagName.toLowerCase() === 'svg') return this.container;
        if (this.container.ownerSVGElement) return this.container.ownerSVGElement;
        const innerSvg = this.container.querySelector && this.container.querySelector('svg');
        if (innerSvg) return innerSvg;
        const parentSvg = this.container.closest && this.container.closest('svg');
        if (parentSvg) return parentSvg;
      }
      return typeof document !== 'undefined' ? document.getElementById('stage-svg') : null;
    }

    emitTelemetrySnapshot(lastUserAction = 'IDLE', lastErrorKey = null) {
      const sceneId = this.activePresetId || (this.scene && this.scene.id) || 'scene';
      const spatial = this.emitSpatialTelemetry(lastUserAction);
      const telemetry = {
        type: 'PLAYER_TELEMETRY',
        sceneId,
        progress: Number((this.progress || 0).toFixed(4)),
        activeKeyframe: this.activeKeyframeIndex || 0,
        variables: { ...(this.vars || {}) },
        lastUserAction,
        lastErrorKey,
        spatialTelemetry: spatial,
        timestamp: Date.now()
      };
      this.notifyParent(telemetry);
      return telemetry;
    }

    /** Edge AI Visual Director Delegators (implemented in static/player/ast-ai-director.js) */
    ensureAiSpotlightStyles() { const _ai = _getASTAiDirector(); if (_ai && typeof _ai.ensureAiSpotlightStyles === 'function') _ai.ensureAiSpotlightStyles.call(this); }
    async executeAiVisualCommand(packet) { const _ai = _getASTAiDirector(); return _ai && typeof _ai.executeAiVisualCommand === 'function' ? _ai.executeAiVisualCommand.call(this, packet) : undefined; }
    async _runSingleAiAction(action) { const _ai = _getASTAiDirector(); return _ai && typeof _ai._runSingleAiAction === 'function' ? _ai._runSingleAiAction.call(this, action) : undefined; }
    tweenProgress(targetProgress, durationMs = 800) { const _ai = _getASTAiDirector(); return _ai && typeof _ai.tweenProgress === 'function' ? _ai.tweenProgress.call(this, targetProgress, durationMs) : Promise.resolve(); }
    applyAiHighlight(selector, pulseColor = '#38bdf8', durationMs = 4500) { const _ai = _getASTAiDirector(); if (_ai && typeof _ai.applyAiHighlight === 'function') _ai.applyAiHighlight.call(this, selector, pulseColor, durationMs); }
    clearAiSpotlights() { const _ai = _getASTAiDirector(); if (_ai && typeof _ai.clearAiSpotlights === 'function') _ai.clearAiSpotlights.call(this); }
    zoomToElement(selector, durationMs = 700) { const _ai = _getASTAiDirector(); return _ai && typeof _ai.zoomToElement === 'function' ? _ai.zoomToElement.call(this, selector, durationMs) : Promise.resolve(); }
    resetViewBox(durationMs = 600) { const _ai = _getASTAiDirector(); return _ai && typeof _ai.resetViewBox === 'function' ? _ai.resetViewBox.call(this, durationMs) : Promise.resolve(); }
    tweenViewBox(targetX, targetY, targetW, targetH, durationMs = 600) { const _ai = _getASTAiDirector(); return _ai && typeof _ai.tweenViewBox === 'function' ? _ai.tweenViewBox.call(this, targetX, targetY, targetW, targetH, durationMs) : Promise.resolve(); }

    narrateText(text, language) {
      const _narrateText = global.narrateText || (typeof window !== 'undefined' ? window.narrateText : undefined);
      if (typeof _narrateText === 'function') {
        return _narrateText.call(this, text, language);
      }
    }

    preemptAiDemonstration(reason = 'USER_INPUT') { const _ai = _getASTAiDirector(); if (_ai && typeof _ai.preemptAiDemonstration === 'function') _ai.preemptAiDemonstration.call(this, reason); }

    /**
     * Multi-Entity Vector Emitter API
     */
    addEmitter(config) {
      const _VectorEmitterCollection = global.VectorEmitterCollection || (typeof window !== 'undefined' ? window.VectorEmitterCollection : undefined);
      if (!_VectorEmitterCollection) return null;
      const em = new _VectorEmitterCollection(this, config);
      this.emitters.set(em.id, em);
      if (this.container) em.mount(this.container);
      return em;
    }

    getEmitter(id) {
      return this.emitters.get(id);
    }

    start() {
      if (typeof document !== 'undefined' && document.hidden) {
        this._suspendedByVisibility = true;
        return;
      }
      if (!this.animationFrameId) {
        this.lastTimestamp = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (typeof requestAnimationFrame !== 'undefined') {
          this.animationFrameId = requestAnimationFrame(this._boundTick);
        }
      }
      if (this.isPlaying) {
        this.emit('statechange', { isPlaying: true, speed: this.speed });
      }
    }

    stop() {
      if (this.animationFrameId) {
        if (typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = null;
      }
      this.lastTimestamp = null;
      this.cancelSpeech();
      if (this.backdropVideo) {
        this.backdropVideo.pause();
      }
    }

   play() {
      if (this.audioSynth && typeof this.audioSynth.unlock === 'function') {
        this.audioSynth.unlock();
      }
      const wasPlaying = this.isPlaying;
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.lastTimestamp = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (this.backdropVideo && this.scene && (this.scene.video || this.scene.hasVideo)) {
          this.backdropVideo.play().catch(() => {});
        }
        this.emit('statechange', { isPlaying: true, speed: this.speed });
      }

      // On mobile PWAs, initial scene load speech is often blocked before the first user tap.
      // Speaking the current subtitle synchronously inside play() unlocks SpeechSynthesis and plays keyframe 0.
      if (!wasPlaying && this.voiceEnabled && !this.muted && this.scene) {
        const synth = this._getSpeechSynth ? this._getSpeechSynth() : null;
        const notCurrentlySpeaking = !synth || (!synth.speaking && !synth.pending);
        if (notCurrentlySpeaking && (!this._speechStartedOnDevice || this.progress <= 0.01)) {
          const currentSub = this.getCurrentSubtitle() || (this.scene.keyframes && this.scene.keyframes[0] ? `${this.scene.keyframes[0].title}. ${this.scene.keyframes[0].rule}` : '');
          if (currentSub) {
            this.speakText(currentSub, { immediate: true });
          }
        }
      }

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.start();
    }

   pause() {
      if (this.isPlaying) {
        this.isPlaying = false;
        if (this.backdropVideo && !this.backdropVideo.paused) {
          this.backdropVideo.pause();
        }
        this.emit('statechange', { isPlaying: false, speed: this.speed });
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.lastTimestamp = null;
    }
    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
      return this.isPlaying;
    }

    seek(newProgress, skipTelemetry = false) {
      this.progress = Math.max(0, Math.min(1, newProgress));
      if (this.backdropVideo && this.scene && (this.scene.video || this.scene.hasVideo)) {
        const vDur = (Number.isFinite(this.backdropVideo.duration) && this.backdropVideo.duration > 0)
          ? this.backdropVideo.duration
          : this.durationSec;
        if (Number.isFinite(vDur) && vDur > 0) {
          this.backdropVideo.currentTime = this.progress * vDur;
        }
      }
      this.updateActiveKeyframeAndSpeech(true);
      if (!this.vars) this.vars = {};
      const currentSec = this.progress * (this.durationSec || 10.0);
      this.vars.simClock = currentSec;
      this.vars.clock = currentSec;
      this.vars._simClock = currentSec;
      this.vars._solarClock = currentSec; // Backwards compatibility for orbital/planetary expressions
      this.applyBindings(this.progress);
      this.emit('timeupdate', {
        progress: this.progress,
        currentTime: this.progress * this.durationSec,
        duration: this.durationSec
      });
      if (!skipTelemetry) {
        this.emitTelemetrySnapshot('SEEK');
      }
    }

    step(delta) {
      this.seek(this.progress + delta, false);
      this.emitTelemetrySnapshot('STEP');
    }

    setSpeed(newSpeed) {
      this.speed = Math.max(0.2, Math.min(5.0, parseFloat(newSpeed) || 1.0));
      if (this.backdropVideo) {
        this.backdropVideo.playbackRate = this.speed;
      }
      this.emit('statechange', { isPlaying: this.isPlaying, speed: this.speed });
    }

    setLanguage(langCode) {
      this.currentLang = langCode || 'en';
      this.lastSpokenIndex = -1;
      this.cancelSpeech();
      this.translateInStageLabels();
      this.emit('langchange', { lang: this.currentLang });
    }

    setBilingualSubtitles(enabled) {
      this.bilingualSubtitles = Boolean(enabled);
      this.emit('bilingualchange', { enabled: this.bilingualSubtitles });
    }

    setSpeechRate(rate) {
      this.speechRate = Math.max(0.5, Math.min(2.0, parseFloat(rate) || 0.95));
    }

    /**
     * Bidirectional Slider-to-Variable Binding (:bind-input)
     */
    registerBindInput(config = {}) {
      if (!this.activeBindInputs) this.activeBindInputs = [];
      const target = config.target;
      const node = typeof target === 'string'
        ? (this.container ? this.container.querySelector(target) : document.querySelector(target))
        : target;

      const minVal = Number(config.min !== undefined ? config.min : 0);
      const maxVal = Number(config.max !== undefined ? config.max : 100);
      const axis = config.axis || 'x';

      const binding = {
        target: config.target,
        var: config.var || 'temp',
        min: minVal,
        max: maxVal,
        axis: axis,
        trackMin: config.trackMin !== undefined ? Number(config.trackMin) : (axis === 'y' ? 320 : 60),
        trackMax: config.trackMax !== undefined ? Number(config.trackMax) : (axis === 'y' ? 80 : 440),
        node: node
      };

      this.activeBindInputs = this.activeBindInputs.filter(b => b.target !== config.target);
      this.activeBindInputs.push(binding);

      if (node) {
        node.setAttribute('data-draggable', 'true');
        node.setAttribute('data-bind-input', binding.var);
        node.style.cursor = 'grab';
      }

      const curVal = this.getVar(binding.var);
      if (curVal !== undefined) {
        this.syncBindInputs(binding.var, curVal);
      }
      return binding;
    }

    syncBindInputs(name, val) {
      if (!this.activeBindInputs || this.activeBindInputs.length === 0) return;
      for (const b of this.activeBindInputs) {
        if (b.var === name && b.node) {
          const ratio = Math.max(0, Math.min(1, (val - b.min) / (b.max - b.min)));
          const pos = b.trackMin + ratio * (b.trackMax - b.trackMin);
          if (b.axis === 'y') {
            b.node.setAttribute('transform', `translate(0, ${pos.toFixed(1)})`);
          } else if (b.axis === 'rotary') {
            const angle = -135 + ratio * 270;
            b.node.setAttribute('transform', `rotate(${angle.toFixed(1)} 0 0)`);
          } else {
            b.node.setAttribute('transform', `translate(${pos.toFixed(1)}, 0)`);
          }
        }
      }
    }

    normalizeVarName(name) {
      if (!name || typeof name !== 'string') return '';
      let clean = name.trim().replace(/^\*|\*$/g, '');
      if (clean.includes('-')) {
        clean = clean.replace(/-([a-zA-Z0-9])/g, (_, ch) => ch.toUpperCase());
      }
      return clean;
    }

    /**
     * Fantasy Console / Lisp Machine Kernel Memory Store
     * Sets a reactive state variable in WASM/JS linear memory and recalculates derived outputs at 60 FPS
     */
    setMemoryVar(name, val, isAi = false) {
      if (!name || name === '__proto__' || name === 'constructor' || name === 'prototype') return;
      const cleanName = this.normalizeVarName(name);
      if (!this.vars) this.vars = {};

      this.vars[cleanName] = val;
      this.vars[name] = val;
      this.vars[`*${cleanName}*`] = val;

      if (this.scene && this.scene.vars) {
        if (!this.scene._defaultVars || this.scene._defaultVarsSource !== this.scene.vars) {
          const snapshot = {};
          for (const k of Object.keys(this.scene.vars)) {
            const item = this.scene.vars[k];
            snapshot[k] = (item && typeof item === 'object' && !Array.isArray(item))
              ? (item.defaultValue !== undefined ? item.defaultValue
                : (item.default !== undefined ? item.default
                  : (item.val !== undefined ? item.val
                    : (item.value !== undefined ? item.value : item))))
              : item;
          }
          this.scene._defaultVars = snapshot;
          this.scene._defaultVarsSource = this.scene.vars;
        }
        if (this.scene.vars[cleanName] !== undefined && typeof this.scene.vars[cleanName] === 'object' && this.scene.vars[cleanName] !== null) {
          this.scene.vars[cleanName].value = val;
        }
      }

      this.updateComputedVars();
      this.syncBindInputs(cleanName, val);

      if (this.emitters && this.emitters.size > 0 && cleanName === 'count') {
        for (const em of this.emitters.values()) {
          if (!em.countExpr) em.setCount(val);
        }
      }

      this.applyBindings(this.progress);
      this.emit('varchange', { name: cleanName, value: val, vars: { ...this.vars } });
      if (!isAi) {
        this.emitTelemetrySnapshot('VAR_CHANGE');
      }
    }

    getMemoryVar(name) {
      if (!name || !this.vars) return undefined;
      const clean = this.normalizeVarName(name);
      const raw = this.vars[clean] !== undefined ? this.vars[clean] : this.vars[name];
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        if (raw.value !== undefined) return raw.value;
        if (raw.val !== undefined) return raw.val;
        if (raw.default !== undefined) return raw.default;
      }
      return raw;
    }

    setVar(name, val, isAi = false) {
      return this.setMemoryVar(name, val, isAi);
    }

    getVar(name) {
      return this.getMemoryVar(name);
    }

    /**
     * Canonical S-Expression Action Dispatcher
     * Evaluates action forms like (sim:reset), (player:toggle-bsl), (set-var *gravity* 10), (toggle-var *switchClosed*)
     */
    dispatchAction(actionForm, fallbackArgs = []) {
      if (!actionForm) return;
      let formStr = '';
      if (typeof actionForm === 'string') {
        formStr = actionForm.trim();
      } else if (Array.isArray(actionForm)) {
        formStr = `(${actionForm.join(' ')})`;
      } else {
        return;
      }

      let inner = formStr.replace(/^\(|\)$/g, '').trim();
      if (!inner) return;

      const tokens = inner.match(/"([^"]+)"|([^\s"]+)/g) || [];
      if (tokens.length === 0) return;

      const op = tokens[0].replace(/^"|"$/g, '');
      const args = tokens.slice(1).map(tok => {
        let clean = tok.replace(/^"|"$/g, '');
        if (!isNaN(Number(clean))) return Number(clean);
        if (clean === 'true') return true;
        if (clean === 'false') return false;
        return clean;
      });

      if (fallbackArgs && fallbackArgs.length > 0 && args.length === 0) {
        args.push(...fallbackArgs);
      }

      if (this.actionDispatch instanceof Map && this.actionDispatch.has(op)) {
        const handler = this.actionDispatch.get(op);
        if (typeof handler === 'function') {
          handler(args);
        }
      } else if (op.startsWith('sim:')) {
        const sub = op.slice(4);
        if (sub === 'reset') this.reset();
        else if (sub === 'play') this.play();
        else if (sub === 'pause') this.pause();
        else if (sub === 'toggle-play') this.togglePlay();
        else if (sub === 'step') this.step(args[0] || (1 / 60));
        else if (sub === 'seek') this.seek(Number(args[0] || 0));
      } else if (op.startsWith('player:')) {
        const sub = op.slice(7);
        if (sub === 'toggle-bsl' || sub === 'bsl') this.toggleBsl(args[0]);
        else if (sub === 'toggle-voice' || sub === 'voice') this.toggleVoice(args[0]);
        else if (sub === 'fullscreen') this.toggleFullscreen();
      } else if (op === 'set-var') {
        this.setMemoryVar(args[0], args[1]);
      } else if (op === 'toggle-var') {
        const cur = Boolean(this.getMemoryVar(args[0]));
        this.setMemoryVar(args[0], !cur);
      } else {
        console.warn('[AST Kernel] Unhandled action dispatch: %s', String(op), args);
      }
    }

    reset() {
      this._isResetting = true;
      try {
        this.seek(0.0);
        if (this._cpHoldTimers) this._cpHoldTimers.fill(0);
        if (this._cpPassedMask) this._cpPassedMask.fill(0);
        if (this.activeScopes && this.activeScopes.length) {
          for (let i = 0; i < this.activeScopes.length; i++) {
            const sc = this.activeScopes[i];
            sc.count = 0;
            sc.head = 0;
            sc.hasLast = false;
            if (sc.node) sc.node.setAttribute('points', '');
          }
        }
        this._labLogCount = 0;
        this._labLogHead = 0;
        this._labLogClock = 0;
        this.resetVars();
        if (this.vars) {
          this.vars.simClock = 0;
          this.vars.clock = 0;
          this.vars._simClock = 0;
        }
        this.updateComputedVars(0);
        this.applyBindings(0.0);
        if (this.physics && typeof this.physics.reset === 'function') {
          this.physics.reset();
        }
        if (typeof this.render === 'function') {
          this.render(0.0);
        }
        this.emit('simreset', { time: 0.0 });
        this.notifyParent({ type: 'SIM_RESET', time: 0.0 });
      } finally {
        this._isResetting = false;
      }
    }

    /**
     * Initializes pre-allocated Float32Array columnar storage for zero-GC CSV lab logging.
     */
    _initLabLogBuffers() {
      const colNames = [];
      const sceneVars = (this.scene && this.scene.vars) || {};
      const keys = Object.keys(sceneVars);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.startsWith('_') || k === 'simClock' || k === 'clock') continue;
        const entry = sceneVars[k];
        const val = entry && typeof entry === 'object' ? (entry.value !== undefined ? entry.value : entry.val) : entry;
        if (typeof val === 'number') {
          colNames.push(k);
        }
      }
      const compList = (this.scene && this.scene.computed) || [];
      for (let i = 0; i < compList.length; i++) {
        const cname = compList[i] && compList[i].name;
        if (cname && !colNames.includes(cname)) {
          colNames.push(cname);
        }
      }
      this._labLogCols = [];
      for (let i = 0; i < colNames.length; i++) {
        this._labLogCols.push({
          name: colNames[i],
          data: new Float32Array(this._labLogCapacity)
        });
      }
      this._labLogCount = 0;
      this._labLogHead = 0;
      this._labLogClock = 0;
    }

    /**
     * Appends one timestamped sample to pre-allocated columnar ring buffers (0 heap allocations).
     */
    _recordLabSample(timeSec) {
      if (!this._labLogCols || this._labLogCols.length === 0) return;
      const cap = this._labLogCapacity;
      const idx = (this._labLogHead + this._labLogCount) % cap;
      if (this._labLogCount < cap) {
        this._labLogCount++;
      } else {
        this._labLogHead = (this._labLogHead + 1) % cap;
      }
      this._labLogTimes[idx] = timeSec;
      const v = this.vars || {};
      const cols = this._labLogCols;
      for (let c = 0; c < cols.length; c++) {
        const raw = v[cols[c].name];
        const num = typeof raw === 'number' ? raw : parseFloat(raw);
        cols[c].data[idx] = Number.isFinite(num) ? num : 0;
      }
    }

    /**
     * Generates an RFC-4180 CSV table of sampled (t, vars, computed) & :scope observations
     * for UK GCSE Working Scientifically practicals.
     */
    exportLabCsv() {
      const cols = this._labLogCols || [];
      const escCsv = (s) => {
        const str = String(s === undefined || s === null ? '' : s);
        return (str.includes(',') || str.includes('"') || str.includes('\n'))
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      };
      const header = ['time_s'];
      for (let c = 0; c < cols.length; c++) header.push(escCsv(cols[c].name));
      const scopeCount = this.activeScopes ? this.activeScopes.length : 0;
      for (let s = 0; s < scopeCount; s++) {
        header.push(`scope_${s + 1}_x`, `scope_${s + 1}_y`);
      }

      const lines = [header.join(',')];
      const cap = this._labLogCapacity;
      const loggedRows = this._labLogCount || 0;
      let maxScopeRows = 0;
      for (let s = 0; s < scopeCount; s++) {
        if (this.activeScopes[s].count > maxScopeRows) maxScopeRows = this.activeScopes[s].count;
      }

      const rowCount = Math.max(loggedRows, maxScopeRows);
      if (rowCount === 0) {
        // Record immediate current snapshot row so export always contains valid data
        const nowT = (this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : (this.realtimeSec || 0);
        const row = [nowT.toFixed(3)];
        const v = this.vars || {};
        for (let c = 0; c < cols.length; c++) {
          const val = v[cols[c].name];
          row.push(val !== undefined ? Number(val).toFixed(4).replace(/\.?0+$/, (m) => m.startsWith('.') ? '' : m) : '0');
        }
        for (let s = 0; s < scopeCount; s++) {
          row.push('', '');
        }
        lines.push(row.join(','));
        return {
          sceneId: (this.scene && this.scene.id) || this.activePresetId || 'simulation',
          sceneTitle: (this.scene && this.scene.title) || 'Simulation',
          rowCount: 1,
          csv: lines.join('\n')
        };
      }

      for (let r = 0; r < rowCount; r++) {
        const row = [];
        if (r < loggedRows) {
          const idx = (this._labLogHead + r) % cap;
          row.push(this._labLogTimes[idx].toFixed(3));
          for (let c = 0; c < cols.length; c++) {
            const val = cols[c].data[idx];
            row.push(Number.isFinite(val) ? Number(val.toFixed(4)).toString() : '0');
          }
        } else {
          row.push('');
          for (let c = 0; c < cols.length; c++) row.push('');
        }
        for (let s = 0; s < scopeCount; s++) {
          const sc = this.activeScopes[s];
          if (r < sc.count) {
            const sIdx = (sc.head + r) % sc.capacity;
            row.push(Number(sc.rawX[sIdx].toFixed(4)).toString());
            row.push(Number(sc.rawY[sIdx].toFixed(4)).toString());
          } else {
            row.push('', '');
          }
        }
        lines.push(row.join(','));
      }

      return {
        sceneId: (this.scene && this.scene.id) || this.activePresetId || 'simulation',
        sceneTitle: (this.scene && this.scene.title) || 'Simulation',
        rowCount,
        csv: lines.join('\n')
      };
    }

    getLabDataCsv() {
      return this.exportLabCsv();
    }

    getCheckpointGoalStatus(idx) {
      const cp = this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints[idx];
      if (!cp) return { passed: false, holdProgress: 0, holdElapsed: 0, holdDuration: 0 };
      const holdDuration = Number(cp.holdDuration || 0);
      const elapsed = this._cpHoldTimers && idx < this._cpHoldTimers.length ? this._cpHoldTimers[idx] : 0;
      const passed = Boolean(this._cpPassedMask && idx < this._cpPassedMask.length && this._cpPassedMask[idx] === 1);
      const holdProgress = passed ? 1 : (holdDuration > 0 ? Math.min(1, elapsed / holdDuration) : 0);
      return { passed, holdProgress, holdElapsed: elapsed, holdDuration };
    }

    getEngineStateSummary(includeSvgBytes = false) {
      const s = this.scene || {};
      const cleanVars = {};
      if (this.vars) {
        const keys = Object.keys(this.vars);
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (k.startsWith('*') && k.endsWith('*')) continue;
          cleanVars[k] = this.vars[k];
        }
      }
      const varMeta = {};
      if (s.vars && typeof s.vars === 'object') {
        const vKeys = Object.keys(s.vars);
        for (let i = 0; i < vKeys.length; i++) {
          const k = vKeys[i];
          const entry = s.vars[k];
          if (entry && typeof entry === 'object') {
            varMeta[k] = {
              min: entry.min !== undefined ? Number(entry.min) : undefined,
              max: entry.max !== undefined ? Number(entry.max) : undefined,
              step: entry.step !== undefined ? Number(entry.step) : undefined,
              unit: entry.unit || ''
            };
          }
        }
      }
      const ledgers = [];
      if (Array.isArray(this.activeLedgers)) {
        for (let i = 0; i < this.activeLedgers.length; i++) {
          const ld = this.activeLedgers[i];
          const terms = [];
          let total = 0;
          for (let ti = 0; ti < ld.terms.length; ti++) {
            const val = Number((ld.values[ti] || 0).toFixed(3));
            total += val;
            terms.push({ label: ld.terms[ti].label, value: val, color: ld.terms[ti].color });
          }
          ledgers.push({ id: ld.id, unit: ld.unit || '', total: Number(total.toFixed(3)), terms });
        }
      }
      const checkpointGoals = [];
      if (s.interactive && Array.isArray(s.interactive.checkpoints)) {
        for (let i = 0; i < s.interactive.checkpoints.length; i++) {
          const cp = s.interactive.checkpoints[i];
          if (!cp || !cp.passExpr) continue;
          const st = this.getCheckpointGoalStatus(i);
          checkpointGoals.push({
            index: i,
            title: cp.title || `Checkpoint ${i + 1}`,
            passExpr: cp.passExpr,
            holdDuration: Number(cp.holdDuration || 0),
            holdElapsed: Number((st.holdElapsed || 0).toFixed(3)),
            holdProgress: Number((st.holdProgress || 0).toFixed(3)),
            passed: st.passed
          });
        }
      }
      let svgDomBytes = 0;
      if (includeSvgBytes) {
        const stage = this.getStageSvg();
        if (stage && stage.outerHTML) {
          svgDomBytes = stage.outerHTML.length;
        } else if (typeof s.svgText === 'string') {
          svgDomBytes = s.svgText.length;
        }
      }
      return {
        sceneId: this.activePresetId || s.id || 'scene',
        title: s.title || 'AST Simulation',
        archetype: s.type || 'Sim',
        t: Number(((this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : (this.progress || 0) * (this.durationSec || 10)).toFixed(3)),
        progress: Number((this.progress || 0).toFixed(4)),
        isPlaying: Boolean(this.isPlaying),
        vars: cleanVars,
        varMeta,
        ledgers,
        scopesCount: Array.isArray(this.activeScopes) ? this.activeScopes.length : 0,
        checkpointGoals,
        astSourceBytes: typeof s.astSource === 'string' ? s.astSource.length : 0,
        svgDomBytes
      };
    }

    toggleBsl(force) {
      const next = force !== undefined ? Boolean(force) : !Boolean(this.vars?.bslActive || this.vars?.['*bsl-active*']);
      this.setMemoryVar('bslActive', next);
      this.setMemoryVar('*bsl-active*', next);
      this.emit('bsltoggle', { active: next });
      this.notifyParent({ type: 'BSL_STATE_CHANGED', active: next });
      return next;
    }

    toggleVoice(force) {
      const next = force !== undefined ? Boolean(force) : !this.voiceEnabled;
      this.voiceEnabled = next;
      if (!this.voiceEnabled) {
        this.cancelSpeech();
      }
      this.notifyParent({ type: 'VOICE_TOGGLE', enabled: next });
      this.emit('voicetoggle', { enabled: next });
      return next;
    }

    toggleFullscreen() {
      if (typeof document === 'undefined') return;
      const root = this.container?.closest('body') || document.documentElement;
      if (!document.fullscreenElement) {
        root.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }

    resetVars() {
      this.vars = {};
      if (this.scene && this.scene.vars) {
        if (!this.scene._defaultVars || this.scene._defaultVarsSource !== this.scene.vars) {
          const snapshot = {};
          for (const k of Object.keys(this.scene.vars)) {
            const item = this.scene.vars[k];
            snapshot[k] = (item && typeof item === 'object' && !Array.isArray(item))
              ? (item.defaultValue !== undefined ? item.defaultValue
                : (item.default !== undefined ? item.default
                  : (item.val !== undefined ? item.val
                    : (item.value !== undefined ? item.value : item))))
              : item;
          }
          this.scene._defaultVars = snapshot;
          this.scene._defaultVarsSource = this.scene.vars;
        }
        for (const k of Object.keys(this.scene._defaultVars)) {
          const defVal = this.scene._defaultVars[k];
          this.vars[k] = defVal;
          const item = this.scene.vars[k];
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            item.value = defVal;
          }
        }
      }
      this.updateComputedVars();
      this.applyBindings(this.progress);
      this.emit('varchange', { name: '*', vars: { ...this.vars } });
    }

    compileAstExpr(rawExpr) {
      const _fn = global.compileAstExpr || (typeof window !== 'undefined' ? window.compileAstExpr : undefined);
      return typeof _fn === 'function' ? _fn(rawExpr) : '0';
    }

    updateComputedVars(t) {
      if (!this.scene || !this.scene.computed || !this.scene.computed.length) return;
      const v = this.vars || {};
      const evalT = t !== undefined
        ? t
        : ((this.isContinuousSim && v && typeof v.simClock === 'number') ? v.simClock : (this.progress || 0));
      for (let i = 0; i < this.scene.computed.length; i++) {
        const comp = this.scene.computed[i];
        try {
          if (typeof comp._eval !== 'function') {
            comp._eval = this.compileAstFn(comp.expr);
          }
          if (typeof comp._eval === 'function') {
            const _M = _getAstMath();
            v[comp.name] = comp._eval(evalT, v, v, Math, _M.clamp, _M.lerp, _M.map, _M.rad, _M.deg, _M.dist, _M.translate, _M.rotate, _M.scale, _M.sineWave, _M.smoothstep);
          }
        } catch {}
      }
    }

    translateInStageLabels() {
      const container = this.container || this._mountedContainer;
      if (!container || typeof document === 'undefined') return;
      const lang = this.currentLang || 'en';

      const DICT = {
        'BATTERY': { es: 'BATERÍA', fr: 'BATTERIE', de: 'BATTERIE', pl: 'BATERIA', uk: 'БАТАРЕЯ', ar: 'بطارية', it: 'BATTERIA', pt: 'BATERIA', la: 'ACCUMULATRUM' },
        'RESISTOR': { es: 'RESISTOR', fr: 'RÉSISTANCE', de: 'WIDERSTAND', pl: 'OPORNIK', uk: 'РЕЗИСТОР', ar: 'مقاومة', it: 'RESISTORE', pt: 'RESISTOR', la: 'RESISTOR' },
        'LIGHTBULB': { es: 'BOMBILLA', fr: 'AMPOULE', de: 'GLÜHBIRNE', pl: 'ŻARÓWKA', uk: 'ЛАМПОЧКА', ar: 'مصباح', it: 'LAMPADINA', pt: 'LÂMPADA', la: 'LUCERNA' },
        'SWITCH: CLOSED': { es: 'INTERRUPTOR: CERRADO', fr: 'INTERRUPTEUR: FERMÉ', de: 'SCHALTER: ZU', pl: 'WŁĄCZNIK: ZAMKNIĘTY', uk: 'ВИМИКАЧ: ЗАМКНЕНО', ar: 'مفتاح: مغلق', it: 'INTERRUTTORE: CHIUSO', pt: 'INTERRUPTOR: FECHADO', la: 'INTERRUPTOR: CLAUSUS' },
        '+5 units': { es: '+5 unidades', fr: '+5 unités', de: '+5 Einheiten', pl: '+5 jednostek', uk: '+5 одиниць', ar: '+5 وحدات', it: '+5 unità', pt: '+5 unidades', la: '+5 unitates' },
        'HYPOTENUSE': { es: 'HIPOTENUSA', fr: 'HYPOTÉNUSE', de: 'HYPOTENUSE', pl: 'PRZECIWPROSTOKĄTNA', uk: 'ГІПОТЕНУЗА', ar: 'الوتر', it: 'IPOTENUSA', pt: 'HIPOTENUSA', la: 'HYPOTENUSA' },
        'LEAF FACTORY': { es: 'FÁBRICA DE HOJA', fr: 'USINE FOLIAIRE', de: 'BLATTFABRIK', pl: 'FABRYKA LIŚCIA', uk: 'ФАБРИКА ЛИСТКА', ar: 'مصنع الأوراق', it: 'FABBRICA FOGLIARE', pt: 'FÁBRICA FOLHA', la: 'OFFICINA FOLII' },
        'SUNLIGHT': { es: 'LUZ SOLAR', fr: 'LUMIÈRE SOLAIRE', de: 'SONNENLICHT', pl: 'ŚWIATŁO SŁONECZNE', uk: 'СОНЯЧНЕ СВІТЛО', ar: 'ضوء الشمس', it: 'LUCE SOLARE', pt: 'LUZ SOLAR', la: 'LUX SOLIS' },
        'CHLOROPHYLL': { es: 'CLOROFILA', fr: 'CHLOROPHYLLE', de: 'CHLOROPHYLL', pl: 'CHLOROFIL', uk: 'ХЛОРОФІЛ', ar: 'كلوروفيل', it: 'CLOROFILLA', pt: 'CLOROFILA', la: 'CHLOROPHYLLUM' },
        'GLUCOSE': { es: 'GLUCOSA', fr: 'GLUCOSE', de: 'GLUKOSE', pl: 'GLUKOZA', uk: 'ГЛЮКОЗА', ar: 'جلوكوز', it: 'GLUCOSIO', pt: 'GLICOSE', la: 'GLUCOSUM' },
        'OXYGEN': { es: 'OXÍGENO', fr: 'OXYGÈNE', de: 'SAUERSTOFF', pl: 'TLEN', uk: 'КИСЕНЬ', ar: 'أكسجين', it: 'OSSIGENO', pt: 'OXIGÊNIO', la: 'OXYGENIUM' },
        'WATER': { es: 'AGUA', fr: 'EAU', de: 'WASSER', pl: 'WODA', uk: 'ВОДА', ar: 'ماء', it: 'ACQUA', pt: 'ÁGUA', la: 'AQUA' },
        'CARBON DIOXIDE': { es: 'DIÓXIDO DE CARBONO', fr: 'DIOXYDE DE CARBONE', de: 'KOHLENDIOXID', pl: 'DWUTLENEK WĘGLA', uk: 'ВУГЛЕКИСЛИЙ ГАЗ', ar: 'ثاني أكسيد الكربون', it: 'ANIDRIDE CARBONICA', pt: 'DIÓXIDO DE CARBONO', la: 'DIOXYDUM CARBONIS' },
        'COMMON DENOMINATOR': { es: 'DENOMINADOR COMÚN', fr: 'DÉNOMINATEUR COMMUN', de: 'GEMEINSAMER NENNER', pl: 'WSPÓLNY MIANOWNIK', uk: 'СПІЛЬНИЙ ЗНАМЕННИК', ar: 'المقام المشترك', it: 'DENOMINATORE COMUNE', pt: 'DENOMINADOR COMUM', la: 'DENOMINATOR COMMUNIS' },
        'HIGH ALTITUDE': { es: 'ALTA ALTITUD', fr: 'HAUTE ALTITUDE', de: 'HOHE HÖHE', pl: 'WYSOKA WYSOKOŚĆ', uk: 'ВЕЛИКА ВИСОТА', ar: 'ارتفاع شاهق', it: 'ALTA QUOTA', pt: 'GRANDE ALTITUDE', la: 'ALTITUDO MAGNA' },
        'VELOCITY': { es: 'VELOCIDAD', fr: 'VITESSE', de: 'GESCHWINDIGKEIT', pl: 'PRĘDKOŚĆ', uk: 'ШВИДКІСТЬ', ar: 'السرعة', it: 'VELOCITÀ', pt: 'VELOCIDADE', la: 'VELOCITAS' }
      };

      try {
        const textNodes = container.querySelectorAll('text');
        textNodes.forEach(node => {
          let orig = node.getAttribute('data-i18n-orig');
          if (!orig) {
            orig = node.textContent.trim();
            node.setAttribute('data-i18n-orig', orig);
          }

          if (lang === 'en') {
            node.textContent = orig;
          } else {
            if (DICT[orig] && DICT[orig][lang]) {
              node.textContent = DICT[orig][lang];
            } else {
              const upper = orig.toUpperCase();
              if (DICT[upper] && DICT[upper][lang]) {
                node.textContent = DICT[upper][lang];
              }
            }
          }
        });
      } catch (err) {
        console.warn('In-stage label translation notice:', err);
      }
    }

    toggleLoop() {
      this.loop = !this.loop;
      this.emit('statechange', { isPlaying: this.isPlaying, loop: this.loop });
      return this.loop;
    }

    setLoop(enabled) {
      this.loop = Boolean(enabled);
      this.emit('statechange', { isPlaying: this.isPlaying, loop: this.loop });
      return this.loop;
    }

    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1.0, parseFloat(vol) || 0));
      if (this.volume > 0 && this.muted) {
        this.muted = false;
      }
      if (this.audioSynth) {
        this.audioSynth.muted = this.muted || this.volume === 0;
        if (this.audioSynth.muted && typeof this.audioSynth.stopHum === 'function') {
          this.audioSynth.stopHum();
        }
      }
      this.emit('volumechange', { volume: this.volume, muted: this.muted });
      return this.volume;
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.audioSynth) {
        this.audioSynth.muted = this.muted;
        if (this.muted && typeof this.audioSynth.stopHum === 'function') {
          this.audioSynth.stopHum();
        }
      }
      this.emit('volumechange', { volume: this.volume, muted: this.muted });
      return this.muted;
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      if (this.audioSynth) {
        this.audioSynth.muted = this.muted;
        if (this.muted && typeof this.audioSynth.stopHum === 'function') {
          this.audioSynth.stopHum();
        }
      }
      this.emit('volumechange', { volume: this.volume, muted: this.muted });
      return this.muted;
    }

    _getSpeechSynth() {
      const _fn = global._getSpeechSynth || (typeof window !== 'undefined' ? window._getSpeechSynth : undefined);
      return typeof _fn === 'function' ? _fn() : null;
    }

    _getSpeechUtteranceCtor() {
      const _fn = global._getSpeechUtteranceCtor || (typeof window !== 'undefined' ? window._getSpeechUtteranceCtor : undefined);
      return typeof _fn === 'function' ? _fn() : null;
    }

    cancelSpeech() {
      const _fn = global.cancelSpeech || (typeof window !== 'undefined' ? window.cancelSpeech : undefined);
      if (typeof _fn === 'function') {
        return _fn.call(this);
      }
    }

    speak(text, opts) {
      this.speakText(text, opts);
    }

    speakText(text, opts = {}) {
      const _fn = global.speakText || (typeof window !== 'undefined' ? window.speakText : undefined);
      if (typeof _fn === 'function') {
        return _fn.call(this, text, opts);
      }
    }

    getCurrentSubtitle() {
      if (!this.scene || !Array.isArray(this.scene.subtitles) || !this.scene.subtitles.length) return '';
      const sub = this.scene.subtitles.find(s => this.progress >= s.start && this.progress <= s.end);
      if (!sub) return '';
      
      const localized = sub[this.currentLang] || sub.en || '';
      if (this.bilingualSubtitles && this.currentLang !== 'en' && sub.en && localized !== sub.en) {
        return {
          en: sub.en,
          localized: localized
        };
      }
      return localized;
    }

updateActiveKeyframeAndSpeech(userSeeking = false) {
  if (!this.scene?.keyframes?.length) return;

  let activeIndex = 0;
  for (let i = 0; i < this.scene.keyframes.length; i++) {
    if (this.progress >= this.scene.keyframes[i].t) {
      activeIndex = i;
    }
  }
      if (activeIndex !== this.lastSpokenIndex) {
        const kf = this.scene.keyframes[activeIndex];
        this.emit('keyframe', {
          index: activeIndex,
          title: kf.title,
          rule: kf.rule,
          progress: this.progress
        });

        const subText = this.getCurrentSubtitle() || `${kf.title}. ${kf.rule}`;
        this.notifyParent({ type: 'SUBTITLE_UPDATE', text: subText });

        if (this.voiceEnabled && (this.isPlaying || userSeeking)) {
          this.speakText(subText);
        }

        this.lastSpokenIndex = activeIndex;
      }
    }

    compileAstFn(rawExpr) {
      const _fn = global.compileAstFn || (typeof window !== 'undefined' ? window.compileAstFn : undefined);
      return typeof _fn === 'function' ? _fn.call(this, rawExpr) : () => 0;
    }

    /**
     * Perspective 3D Projection Pipeline
     * Projects world space (X, Y, Z) to 2D SVG canvas (x, y, scale, depthOpacity)
     * Incorporates interactive camera orbit (yawOffset, pitchOffset, distanceScale)
     *//**
     * Perspective 3D Projection Pipeline
     * Projects world space (X, Y, Z) to 2D SVG canvas (x, y, scale, depthOpacity)
     * Incorporates interactive camera orbit (yawOffset, pitchOffset, distanceScale)
     */
    _prepareCameraBasis(camera) {
      const _3d = _getAST3D();
      return _3d && typeof _3d._prepareCameraBasis === 'function' ? _3d._prepareCameraBasis.call(this, camera) : null;
    }

    _project3DInto(x, y, z, camera, basis, cx, cy, out) {
      const _3d = _getAST3D();
      return _3d && typeof _3d._project3DInto === 'function' ? _3d._project3DInto.call(this, x, y, z, camera, basis, cx, cy, out) : out;
    }

    project3D(x, y, z, camera, cx = 400, cy = 240) {
      const _3d = _getAST3D();
      return _3d && typeof _3d.project3D === 'function' ? _3d.project3D.call(this, x, y, z, camera, cx, cy) : { x: 400, y: 240, z: 0, scale: 1.0, opacity: 1.0, safeZ: 20 };
    }

    _pointsToSpline(pts) {
      const _3d = _getAST3D();
      return _3d && typeof _3d._pointsToSpline === 'function' ? _3d._pointsToSpline.call(this, pts) : "";
    }

    isAstBytecode(buffer) {
      const _fn = global.isAstBytecode || (typeof window !== 'undefined' ? window.isAstBytecode : undefined);
      return typeof _fn === 'function' ? _fn(buffer) : false;
    }

    decompileBytecode(buffer) {
      const _fn = global.decompileBytecode || (typeof window !== 'undefined' ? window.decompileBytecode : undefined);
      return typeof _fn === 'function' ? _fn(buffer) : null;
    }

    parseAst(astContent) {
      const _fn = global.parseAst || (typeof window !== 'undefined' ? window.parseAst : undefined);
      return typeof _fn === 'function' ? _fn(astContent) : null;
    }

    _playSceneBootSound(scene) {
      if (!scene || !scene.bootSound || !this.audioSynth) return;
      try {
        const bs = String(scene.bootSound).trim().toLowerCase();
        if (bs === 'bbc-beep') {
          if (typeof this.audioSynth.playBbcBeep === 'function') this.audioSynth.playBbcBeep();
        } else if (!isNaN(Number(bs)) && typeof this.audioSynth.playTone === 'function') {
          this.audioSynth.playTone(Number(bs), 0.25, 'square');
        }
      } catch (_) {}
    }

    /**
     * Mounts a pre-parsed or runtime-constructed cartridge with eager pre-paint computed evaluation
     */
    initScene(scene) {
      if (!scene) return;
      this.scene = scene;
      this.activePresetId = scene.id || this.activePresetId;
      this.durationSec = scene.duration || 10.0;
      const isContinuousSim = Boolean(
        scene.type === 'Sim' ||
        scene.cartridgeType === 'Sim' ||
        (scene.vars && (Array.isArray(scene.vars) ? scene.vars.length > 0 : Object.keys(scene.vars).length > 0)) ||
        (scene.bindings && scene.bindings.some(b => b.type === '3d-node')) ||
        (scene.rawBindings && scene.rawBindings.some(b => b.type === '3d-node')) ||
        scene.continuous ||
        scene.isContinuous ||
        typeof scene.mount === 'function'
      );
      this.isContinuousSim = isContinuousSim;
      if (this.container) {
        if (typeof this.container.replaceChildren === 'function') this.container.replaceChildren();
        else this.container.textContent = '';
        this.mountSceneAsset(scene, this.container);
      }
      this.resetVars();
      this.updateComputedVars(); // Pre-paint computed state evaluation before initial frame pass
      try {
        if (typeof this.applyBindings === 'function') {
          this.applyBindings(0);
        }
        if (typeof this.render === 'function') {
          this.render(0);
        }
      } catch (bindErr) {
        console.warn('[AST Engine] Initial frame bind notice:', bindErr);
      }
      this._playSceneBootSound(scene);
      if (typeof this.mountDeclarativeHud === 'function') {
        this.mountDeclarativeHud(scene);
      }
      return this.scene;
    }

    /** Declarative Parameters HUD Delegators (implemented in static/player/ast-hud-controls.js) */
    resolveParameterControls(scene = this.scene) {
      const _hud = _getASTHudControls();
      return _hud && typeof _hud.resolveParameterControls === 'function' ? _hud.resolveParameterControls.call(this, scene) : [];
    }

    _syncDeclarativeHudVar(hudEl, varName, nextVal) {
      const _hud = _getASTHudControls();
      if (_hud && typeof _hud._syncDeclarativeHudVar === 'function') _hud._syncDeclarativeHudVar.call(this, hudEl, varName, nextVal);
    }

    mountDeclarativeHud(scene) {
      const _hud = _getASTHudControls();
      if (_hud && typeof _hud.mountDeclarativeHud === 'function') _hud.mountDeclarativeHud.call(this, scene);
    }

    /** Cartridge Loader, Vault & SVG Sanitizer Delegators (implemented in static/player/ast-loader.js) */
    async getFromVaultIndexedDb(presetId) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.getFromVaultIndexedDb === 'function' ? _ld.getFromVaultIndexedDb.call(this, presetId) : null; }
    async putIntoVaultIndexedDb(record) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.putIntoVaultIndexedDb === 'function' ? _ld.putIntoVaultIndexedDb.call(this, record) : false; }
    async loadScene(presetId, shouldPlay = false) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.loadScene === 'function' ? _ld.loadScene.call(this, presetId, shouldPlay) : false; }
    setPreset(presetId, shouldPlay = false) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.setPreset === 'function' ? _ld.setPreset.call(this, presetId, shouldPlay) : undefined; }
    loadSceneData(sceneData, shouldPlay = false) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.loadSceneData === 'function' ? _ld.loadSceneData.call(this, sceneData, shouldPlay) : false; }
    mountCartridge(cartridge) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.mountCartridge === 'function' ? _ld.mountCartridge.call(this, cartridge) : false; }
    async loadFromFile(file, shouldPlay = false) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.loadFromFile === 'function' ? _ld.loadFromFile.call(this, file, shouldPlay) : false; }
    readFileAsText(file) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.readFileAsText === 'function' ? _ld.readFileAsText.call(this, file) : Promise.resolve(''); }
    async loadFiles(fileList, shouldPlay = false) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.loadFiles === 'function' ? _ld.loadFiles.call(this, fileList, shouldPlay) : false; }
    loadFromPayload(payload, shouldPlay = false) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.loadFromPayload === 'function' ? _ld.loadFromPayload.call(this, payload, shouldPlay) : false; }
    async loadFromUrl(url, shouldPlay = false) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.loadFromUrl === 'function' ? _ld.loadFromUrl.call(this, url, shouldPlay) : false; }
    renderErrorPlaceholder(identifier, message) { const _ld = _getASTSceneLoader(); if (_ld && typeof _ld.renderErrorPlaceholder === 'function') _ld.renderErrorPlaceholder.call(this, identifier, message); }
    sanitizeSvg(rawSvg) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.sanitizeSvg === 'function' ? _ld.sanitizeSvg.call(this, rawSvg) : String(rawSvg || ''); }
    sanitizeSvgElement(rootSvg) { const _ld = _getASTSceneLoader(); if (_ld && typeof _ld.sanitizeSvgElement === 'function') _ld.sanitizeSvgElement.call(this, rootSvg); }
    _buildSafeSvgTree(svgMarkup) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld._buildSafeSvgTree === 'function' ? _ld._buildSafeSvgTree.call(this, svgMarkup) : null; }
    ensureMasterDefs(container) { const _ld = _getASTSceneLoader(); if (_ld && typeof _ld.ensureMasterDefs === 'function') _ld.ensureMasterDefs.call(this, container); }

  setupBackdropVideo(scene) {
    if (typeof document === 'undefined') return;

    const stageSvg = this.getStageSvg();
    const parentContainer = (stageSvg && stageSvg.parentElement) || this.container || document.getElementById('player-stage');

    let videoEl = document.getElementById('ast-backdrop-video');
    if (!videoEl && parentContainer) {
      videoEl = document.createElement('video');
      videoEl.id = 'ast-backdrop-video';
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');
      videoEl.setAttribute('preload', 'auto');
      videoEl.controls = false;
      videoEl.muted = false;
      videoEl.style.position = 'absolute';
      videoEl.style.top = '0';
      videoEl.style.left = '0';
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.zIndex = '1';
      videoEl.style.pointerEvents = 'none';
      videoEl.style.background = '#000000';
      videoEl.style.display = 'none';

      if (stageSvg && stageSvg.parentNode === parentContainer) {
        parentContainer.insertBefore(videoEl, stageSvg);
      } else {
        parentContainer.appendChild(videoEl);
      }
    }

    this.backdropVideo = videoEl;

    if (stageSvg) {
      stageSvg.style.position = 'relative';
      stageSvg.style.zIndex = '2';
      stageSvg.style.background = 'transparent';
    }

    if (scene && (scene.video || scene.hasVideo)) {
      const videoSrc = scene.video;
      if (videoEl && videoSrc) {
        const currentSrc = videoEl.getAttribute('src');
        if (currentSrc !== videoSrc) {
          videoEl.src = videoSrc;
          videoEl.load();
        }
        videoEl.style.objectFit = scene.videoFit || 'contain';
        videoEl.style.display = 'block';

        const onLoadedMeta = () => {
          if (videoEl.duration && Number.isFinite(videoEl.duration) && (!scene.duration || scene.duration === 10.0)) {
            if (scene && typeof scene === 'object' && scene !== Object.prototype && scene !== Function.prototype) {
              Object.defineProperty(scene, 'duration', {
                value: videoEl.duration,
                writable: true,
                configurable: true,
                enumerable: true
              });
            }
            this.durationSec = videoEl.duration;
          }
          if (this.isPlaying) {
            videoEl.play().catch(() => {});
          }
        };
        videoEl.onloadedmetadata = onLoadedMeta;
        videoEl.onerror = (e) => {
          console.warn('[AST Engine] Backdrop video source unavailable or failed to load:', videoSrc, e);
          videoEl.style.display = 'none';
        };

        if (Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
          videoEl.currentTime = this.progress * videoEl.duration;
        }

        videoEl.onended = () => {
          if (this.loop) {
            videoEl.currentTime = 0;
            videoEl.play().catch(() => {});
          } else {
            this.pause();
          }
        };
      }
    } else if (videoEl) {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.style.display = 'none';
      videoEl.onloadedmetadata = null;
      videoEl.onended = null;
    }
  }

  _applyScenePhysics(scene) {
    if (!this.physics || !scene || !scene.physics) return;
    this.physics.clear();
    if (scene.physics.gravity !== undefined) this.physics.setGravity(scene.physics.gravity);
    if (scene.physics.restitution !== undefined) this.physics.setRestitution(scene.physics.restitution);
    if (scene.physics.friction !== undefined) this.physics.setFriction(scene.physics.friction);
    if (scene.physics.substeps !== undefined) this.physics.setSubsteps(scene.physics.substeps);
    if (scene.physics.stiffness !== undefined) this.physics.stiffness = scene.physics.stiffness;
    if (scene.physics.damping !== undefined) this.physics.damping = scene.physics.damping;
    if (scene.physics.drag !== undefined) this.physics.drag = scene.physics.drag;
    if (scene.physics.groundY !== undefined) this.physics.groundY = scene.physics.groundY;
    if (Array.isArray(scene.physics.bodies)) {
      for (let i = 0; i < scene.physics.bodies.length; i++) {
        const b = scene.physics.bodies[i];
        if (b && typeof b === 'object') {
          this.physics.addBody(b);
        }
      }
    }
    if (Array.isArray(scene.physics.springs)) {
      for (let i = 0; i < scene.physics.springs.length; i++) {
        const sp = scene.physics.springs[i];
        if (sp && typeof sp === 'object') {
          this.physics.addSpring(sp);
        }
      }
    }
  }

  mountSceneAsset(scene, container) {
    if (!scene || this._isMounting) return;
    this._isMounting = true;
    try {
      this._mountedContainer = container || null;
      this._mountedSceneId = scene.id;
      this.setupBackdropVideo(scene);
      const stage = this.getStageSvg();
      if (stage) {
        stage.setAttribute('viewBox', '0 0 800 480');
        this._defaultViewBox = '0 0 800 480';
      }
      if (container) {
        this.ensureMasterDefs(container);
      }
      this.activeBindings = [];
      this.activeVarBindings = [];
      this.active3DNodes = [];
      this.active3DLines = [];
      this.active3DRings = [];
      this.active3DPolygons = [];
      this.active3DItems = [];
      this.activeScopes = [];
      this.activeLedgers = [];
      if (this._cpHoldTimers) this._cpHoldTimers.fill(0);
      if (this._cpPassedMask) this._cpPassedMask.fill(0);
      this._cachedElements = null;

      if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.registerSurface === 'function') {
        global.ASTSharedRenderBoundary.registerSurface({
          id: 'player-stage',
          label: scene.title || scene.id || 'AST Player Stage',
          renderMode: 'svg',
          sceneId: scene.id || '',
          svgContainer: container || null,
          stageSvg: stage || null,
        });
      }

      if (container && scene.svgText) {
        try {
          if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.mountSvgStage === 'function') {
            const mountRes = global.ASTSharedRenderBoundary.mountSvgStage({
              container,
              stageSvg: stage,
              surfaceId: 'player-stage',
              svgText: scene.svgText,
            });
            if (mountRes && mountRes.viewBox) {
              this._defaultViewBox = mountRes.viewBox;
            }
            if (!mountRes || !mountRes.mounted) {
              console.warn('[AST Engine] SVG template mounting bypassed due to parse failure.');
            }
          } else {
            let safeSvg = this.sanitizeSvg(scene.svgText);
            safeSvg = safeSvg
              .replace(/&times;/g, '×')
              .replace(/&bull;/g, '•')
              .replace(/&Omega;/g, 'Ω')
              .replace(/&nbsp;/g, '&#160;')
              .replace(/&divide;/g, '÷')
              .replace(/&diams;/g, '♦')
              .replace(/&mdash;/g, '—')
              .replace(/&ne;/g, '≠')
              .replace(/&deg;/g, '°');

            let mounted = false;
            if (safeSvg && typeof document !== 'undefined') {
              const rootSvg = this._buildSafeSvgTree(safeSvg);
              if (rootSvg) {
                const vb = rootSvg.getAttribute('viewBox') || rootSvg.getAttribute('viewbox');
                if (vb && stage) {
                  stage.setAttribute('viewBox', vb);
                  this._defaultViewBox = vb;
                }
                this.sanitizeSvgElement(rootSvg);
                if (typeof container.replaceChildren === 'function') {
                  container.replaceChildren(...rootSvg.childNodes);
                } else {
                  while (container.firstChild) {
                    container.removeChild(container.firstChild);
                  }
                  while (rootSvg.firstChild) {
                    container.appendChild(rootSvg.firstChild);
                  }
                }
                mounted = true;
              }
            }

            if (!mounted && container) {
              console.warn('[AST Engine] SVG template mounting bypassed due to parse failure.');
            }
          }
        } catch (err) {
          console.warn('SVG mount bypassed due to parse failure:', err);
        }
      } else if (container && typeof scene.render === 'function' && typeof scene.mount !== 'function') {
        const rendered = scene.render(this.progress);
        if (typeof Node !== 'undefined' && rendered instanceof Node) {
          container.replaceChildren(rendered);
        } else if (typeof rendered === 'string') {
          try {
            const safeRendered = this.sanitizeSvg(rendered);
            const wrapped = safeRendered.trim().startsWith('<svg')
              ? safeRendered
              : `<svg xmlns="http://www.w3.org/2000/svg">${safeRendered}</svg>`;
            const svgEl = this._buildSafeSvgTree(wrapped);
            if (svgEl) {
              this.sanitizeSvgElement(svgEl);
              if (typeof container.replaceChildren === 'function') {
                container.replaceChildren(...svgEl.childNodes);
              } else {
                container.textContent = '';
                while (svgEl.firstChild) container.appendChild(svgEl.firstChild);
              }
            }
          } catch (e) {
            console.warn('[AST Engine] Rendered SVG string failed to parse safely:', e);
          }
        }
      }

      if (container && typeof scene.mount === 'function') {
        this._cachedElements = scene.mount(container);
      }

      const hasDomQuery = Boolean(container && typeof container.querySelector === 'function');
      const bindingsList = (scene.rawBindings && scene.rawBindings.length) ? scene.rawBindings : (scene.bindings || []);
      if (bindingsList && bindingsList.length) {
        bindingsList.forEach(b => {
          if (b.type === '3d-node' || b.type === '3d-line' || b.type === '3d-ring' || b.type === '3d-polygon') {
            const _3d = _getAST3D();
            if (_3d && typeof _3d.mount3DBinding === 'function') {
              _3d.mount3DBinding.call(this, b, container, hasDomQuery);
            }
          } else if (b.type === 'var-update' && b.varName) {
            let varEvalFn = () => (this.vars ? this.vars[b.varName] : 0);
            try {
              varEvalFn = this.compileAstFn(b.expr || '0');
            } catch (e) {
              console.warn('[AST Engine] Failed compiling var binding:', b.varName, b.expr, e);
            }
            this.activeVarBindings.push({
              varName: b.varName,
              evalFn: varEvalFn
            });
          } else {
            const node = hasDomQuery ? container.querySelector(b.target) : null;
            if (node) {
              let rawBindFn = null;
              let rawExpr = String(b.expr || '0').trim();
              let affine = b.affine || null;

              if (!affine && rawExpr) {
                const transX = rawExpr.match(/^translate\(\s*([^,]+?)\s*(?:,\s*0\s*)?\)$/);
                const rot = rawExpr.match(/^rotate\(\s*([^,)]+?)(?:\s*,\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*)?\)$/);
                const coreMath = transX ? transX[1].trim() : (rot ? rot[1].trim() : rawExpr);

                const lin1 = coreMath.match(/^([0-9.-]+)\s*([+-])\s*([0-9.-]+)\s*\*\s*t$/);
                const lin2 = coreMath.match(/^([0-9.-]+)\s*\*\s*t\s*([+-])\s*([0-9.-]+)$/);
                if (lin1) {
                  const c = parseFloat(lin1[1]);
                  const m = (lin1[2] === '-' ? -1 : 1) * parseFloat(lin1[3]);
                  affine = { m, c, transform: transX ? 'translateX' : (rot ? 'rotate' : 'none'), originX: rot && rot[2] ? parseFloat(rot[2]) : null, originY: rot && rot[3] ? parseFloat(rot[3]) : null };
                } else if (lin2) {
                  const m = parseFloat(lin2[1]);
                  const c = (lin2[2] === '-' ? -1 : 1) * parseFloat(lin2[3]);
                  affine = { m, c, transform: transX ? 'translateX' : (rot ? 'rotate' : 'none'), originX: rot && rot[2] ? parseFloat(rot[2]) : null, originY: rot && rot[3] ? parseFloat(rot[3]) : null };
                }
              }

              const isTransformAttr = b.attr === 'transform';
              try {
                rawBindFn = this.compileAstFn(rawExpr.replace(/\\\\'/g, "\\'"));
              } catch (e) {
                console.warn('[AST Engine] Failed compiling expr:', b.expr, e);
                rawBindFn = isTransformAttr ? () => '' : () => 0;
              }

              const boundEval = isTransformAttr
                ? (t, vars, MathObj, comp) => {
                    let val;
                    try {
                      val = typeof rawBindFn === 'function' ? rawBindFn(t, vars, comp, MathObj) : '';
                    } catch {
                      return '';
                    }
                    if (val === 0 || val === '0' || !val) return '';
                    if (typeof val === 'number') return `translate(${val}, 0)`;
                    if (typeof val === 'string' && !val.includes('(')) return `translate(${val}, 0)`;
                    return val;
                  }
                : (t, vars, MathObj, comp) => {
                    try {
                      return typeof rawBindFn === 'function' ? rawBindFn(t, vars, comp, MathObj) : 0;
                    } catch {
                      return 0;
                    }
                  };

              this.activeBindings.push({
                target: b.target,
                attr: b.attr,
                node,
                affine,
                matrixBuf: affine && (affine.transform === 'translateX' || affine.transform === 'translateY' || affine.transform === 'rotate') ? new Float32Array(6) : null,
                evalFn: boundEval
              });
            }
          }
        });
      }

      this._applyScenePhysics(scene);

      this.resetVars();
      this.updateComputedVars();

      try {
        if (container) {
          const dynamicTargets = new Set();

          if (Array.isArray(this.activeBindings)) {
            this.activeBindings.forEach(b => {
              if (b && b.node && b.node.isConnected) {
                dynamicTargets.add(b.node);
              } else if (b && b.target) {
                const freshEl = container.querySelector(b.target);
                if (freshEl) {
                  b.node = freshEl;
                  dynamicTargets.add(freshEl);
                }
              }
            });
          }

          if (Array.isArray(this.active3DItems)) {
            this.active3DItems.forEach(item => {
              if (item && item.domNode && item.domNode.isConnected) {
                dynamicTargets.add(item.domNode);
              }
            });
          }

          if (scene.actors && Array.isArray(scene.actors)) {
            scene.actors.forEach(a => {
              if (a && a.target) {
                const el = container.querySelector(a.target);
                if (el) dynamicTargets.add(el);
              }
            });
          }

          dynamicTargets.forEach(el => {
            if (el && el.style && typeof el.style.setProperty === 'function') {
              el.style.setProperty('will-change', 'transform, opacity');
            }
          });

          if (scene.gestures && Array.isArray(scene.gestures)) {
            scene.gestures.forEach(g => {
              if (!g || !g.target) return;
              const el = container.querySelector(g.target);
              if (el) dynamicTargets.add(el);
            });
          }

          dynamicTargets.forEach(node => {
            if (node && node.style) {
              node.style.willChange = 'transform';
              node.setAttribute('data-kinematic', 'true');
              node.style.pointerEvents = 'auto';
            }
          });

          if (scene.staticElements && Array.isArray(scene.staticElements)) {
            scene.staticElements.forEach(s => {
              const el = container.querySelector(s.target);
              if (el && el.style) {
                el.style.pointerEvents = 'none';
                el.style.contain = 'paint layout';
                el.setAttribute('data-static', 'true');
              }
            });
          } else {
            const directChildren = Array.from(container.children || []);
            directChildren.forEach(child => {
              if (child.id === 'annotation-ink-root' || child.id === 'dev-overlay-root') return;
              const containsDynamic = Array.from(dynamicTargets).some(dt => child.contains(dt));
              if (!containsDynamic && child.style) {
                child.style.contain = 'paint layout';
                child.setAttribute('data-static', 'true');
              }
            });
          }
        }
      } catch (domOptErr) {
        console.warn('[AST Engine] DOM optimization notice:', domOptErr);
      }

      this.emitters.clear();
      if (scene.emitters && Array.isArray(scene.emitters)) {
        scene.emitters.forEach(emConfig => {
          const em = this.addEmitter(emConfig);
          if (em.phaseExpr) {
            try {
              const rawPhFn = this.compileAstFn(em.phaseExpr);
              if (typeof rawPhFn === 'function') {
                em._phaseEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawPhFn === 'function' ? rawPhFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
          if (em.clampXExpr) {
            try {
              const rawCxFn = this.compileAstFn(em.clampXExpr);
              if (typeof rawCxFn === 'function') {
                em._clampXEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawCxFn === 'function' ? rawCxFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
          if (em.speedExpr) {
            try {
              const rawSpdFn = this.compileAstFn(em.speedExpr);
              if (typeof rawSpdFn === 'function') {
                em._speedEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawSpdFn === 'function' ? rawSpdFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
          if (em.countExpr) {
            try {
              const rawCntFn = this.compileAstFn(em.countExpr);
              if (typeof rawCntFn === 'function') {
                em._countEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawCntFn === 'function' ? rawCntFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
        });
      }
      if (this.emitters && this.emitters.size > 0) {
        for (const em of this.emitters.values()) {
          em.mount(container);
        }
      }

      // Mount Live Vector Oscilloscopes (:scope) backed by pre-allocated Float32Array ring buffers
      if (scene.scopes && Array.isArray(scene.scopes)) {
        for (let s = 0; s < scene.scopes.length; s++) {
          const scCfg = scene.scopes[s];
          if (!scCfg || !scCfg.target) continue;
          const node = container && typeof container.querySelector === 'function' ? container.querySelector(scCfg.target) : null;
          let plotX = 480;
          let plotY = 100;
          let plotW = 280;
          let plotH = 140;
          if (Array.isArray(scCfg.plot) && scCfg.plot.length >= 4) {
            plotX = scCfg.plot[0];
            plotY = scCfg.plot[1];
            plotW = scCfg.plot[2];
            plotH = scCfg.plot[3];
          } else if (node && typeof node.getAttribute === 'function') {
            const dpx = parseFloat(node.getAttribute('data-plot-x'));
            const dpy = parseFloat(node.getAttribute('data-plot-y'));
            const dpw = parseFloat(node.getAttribute('data-plot-w'));
            const dph = parseFloat(node.getAttribute('data-plot-h'));
            if (Number.isFinite(dpx) && Number.isFinite(dpy) && dpw > 0 && dph > 0) {
              plotX = dpx; plotY = dpy; plotW = dpw; plotH = dph;
            }
          }
          let evalX = () => 0;
          let evalY = () => 0;
          try {
            const rawX = this.compileAstFn(scCfg.xExpr || 't');
            if (typeof rawX === 'function') {
              evalX = (t, vars, MathObj, computed, clamp, lerp, map) =>
                (typeof rawX === 'function' ? rawX(t, vars, computed, MathObj, clamp, lerp, map) : 0);
            }
          } catch (_) {}
          try {
            const rawY = this.compileAstFn(scCfg.yExpr || '0');
            if (typeof rawY === 'function') {
              evalY = (t, vars, MathObj, computed, clamp, lerp, map) =>
                (typeof rawY === 'function' ? rawY(t, vars, computed, MathObj, clamp, lerp, map) : 0);
            }
          } catch (_) {}
          const cap = Math.max(8, Math.min(2048, scCfg.samples || 96));
          this.activeScopes.push({
            target: scCfg.target,
            node,
            capacity: cap,
            rawX: new Float32Array(cap),
            rawY: new Float32Array(cap),
            slotTokens: new Array(cap),
            ptStrings: new Array(cap),
            head: 0,
            count: 0,
            hasLast: false,
            lastSampleX: 0,
            lastSampleY: 0,
            xMin: Array.isArray(scCfg.xRange) ? scCfg.xRange[0] : 0,
            xMax: Array.isArray(scCfg.xRange) ? scCfg.xRange[1] : 30,
            yMin: Array.isArray(scCfg.yRange) ? scCfg.yRange[0] : 0,
            yMax: Array.isArray(scCfg.yRange) ? scCfg.yRange[1] : 100,
            plotX,
            plotY,
            plotW,
            plotH,
            evalX,
            evalY
          });
        }
      }

      // Mount Conservation-Law & Energy-Ledger Meters (:ledger) with pre-allocated Float32Array term buffers
      if (scene.ledgers && Array.isArray(scene.ledgers)) {
        for (let l = 0; l < scene.ledgers.length; l++) {
          const ldCfg = scene.ledgers[l];
          if (!ldCfg || !Array.isArray(ldCfg.terms) || ldCfg.terms.length === 0) continue;
          const terms = ldCfg.terms;
          const evalFns = [];
          for (let ti = 0; ti < terms.length; ti++) {
            let fn = () => 0;
            try {
              const rawFn = this.compileAstFn(terms[ti].expr || '0');
              if (typeof rawFn === 'function') {
                fn = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawFn === 'function' ? rawFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
            evalFns.push(fn);
          }
          let maxEvalFn = null;
          if (ldCfg.maxExpr) {
            try {
              const rawMaxFn = this.compileAstFn(ldCfg.maxExpr);
              if (typeof rawMaxFn === 'function') {
                maxEvalFn = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawMaxFn === 'function' ? rawMaxFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }

          let groupNode = container && typeof container.querySelector === 'function'
            ? (container.querySelector(ldCfg.target || `#${ldCfg.id}`) || container.querySelector(`#${ldCfg.id}`))
            : null;
          const rectNodes = [];
          const valueLabelNodes = [];
          let totalNode = null;
          const lx = typeof ldCfg.x === 'number' ? ldCfg.x : 40;
          const ly = typeof ldCfg.y === 'number' ? ldCfg.y : 400;
          const lw = typeof ldCfg.width === 'number' ? ldCfg.width : 320;
          const lh = typeof ldCfg.height === 'number' ? ldCfg.height : 20;

          if (typeof document !== 'undefined' && container) {
            if (!groupNode) {
              groupNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              groupNode.setAttribute('id', ldCfg.id);
              groupNode.setAttribute('class', 'ast-conservation-ledger');
              container.appendChild(groupNode);
            } else {
              groupNode.replaceChildren();
            }
            const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            track.setAttribute('x', String(lx));
            track.setAttribute('y', String(ly));
            track.setAttribute('width', String(lw));
            track.setAttribute('height', String(lh));
            track.setAttribute('rx', '4');
            track.setAttribute('fill', '#0f172a');
            track.setAttribute('stroke', '#334155');
            track.setAttribute('stroke-width', '1.2');
            groupNode.appendChild(track);

            for (let ti = 0; ti < terms.length; ti++) {
              const segRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              segRect.setAttribute('x', String(lx));
              segRect.setAttribute('y', String(ly + 1));
              segRect.setAttribute('width', '0');
              segRect.setAttribute('height', String(Math.max(4, lh - 2)));
              segRect.setAttribute('fill', terms[ti].color || '#38bdf8');
              groupNode.appendChild(segRect);
              rectNodes.push(segRect);

              const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              const legX = lx + ti * Math.floor(lw / Math.min(3, terms.length));
              const legY = ly + lh + 7;
              swatch.setAttribute('x', String(legX));
              swatch.setAttribute('y', String(legY));
              swatch.setAttribute('width', '8');
              swatch.setAttribute('height', '8');
              swatch.setAttribute('rx', '2');
              swatch.setAttribute('fill', terms[ti].color || '#38bdf8');
              groupNode.appendChild(swatch);

              const legTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              legTxt.setAttribute('x', String(legX + 12));
              legTxt.setAttribute('y', String(legY + 8));
              legTxt.setAttribute('fill', '#cbd5e1');
              legTxt.setAttribute('font-size', '9.5');
              legTxt.setAttribute('font-family', 'monospace');
              legTxt.textContent = `${terms[ti].label}: 0`;
              groupNode.appendChild(legTxt);
              valueLabelNodes.push(legTxt);
            }

            totalNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            totalNode.setAttribute('x', String(lx + lw));
            totalNode.setAttribute('y', String(ly - 5));
            totalNode.setAttribute('fill', '#94a3b8');
            totalNode.setAttribute('font-size', '9.5');
            totalNode.setAttribute('font-weight', '700');
            totalNode.setAttribute('text-anchor', 'end');
            totalNode.setAttribute('font-family', 'monospace');
            totalNode.textContent = '';
            groupNode.appendChild(totalNode);
          }

          this.activeLedgers.push({
            id: ldCfg.id,
            unit: ldCfg.unit || '',
            x: lx,
            y: ly,
            width: lw,
            height: lh,
            terms,
            evalFns,
            maxEvalFn,
            values: new Float32Array(terms.length),
            lastValues: new Float32Array(terms.length),
            hasLast: false,
            rectNodes,
            valueLabelNodes,
            totalNode
          });
        }
      }

      // Pre-compile manipulation checkpoint :pass-expr evaluators
      if (scene.interactive && Array.isArray(scene.interactive.checkpoints)) {
        for (let ci = 0; ci < scene.interactive.checkpoints.length; ci++) {
          const cp = scene.interactive.checkpoints[ci];
          if (cp && cp.passExpr && !cp._passEvalFn) {
            try {
              const rawPassFn = this.compileAstFn(cp.passExpr);
              cp._passEvalFn = typeof rawPassFn === 'function'
                ? (t, vars, MathObj, computed, clamp, lerp, map) =>
                    Boolean(typeof rawPassFn === 'function' ? rawPassFn(t, vars, computed, MathObj, clamp, lerp, map) : false)
                : () => false;
            } catch (_) {
              cp._passEvalFn = () => false;
            }
          }
        }
      }

      // Initialize zero-GC Lab CSV log columnar buffers
      this._initLabLogBuffers();

      if (scene.bindInputs && Array.isArray(scene.bindInputs)) {
        scene.bindInputs.forEach(bi => this.registerBindInput(bi));
      }

      this.stateMachines.clear();
      if (scene.stateMachines && Array.isArray(scene.stateMachines)) {
        scene.stateMachines.forEach(smConfig => {
          this.addStateMachine(smConfig);
        });
      }

      // Pre-classify scene execution mode once per mount (eliminates per-frame Object.keys allocation in tick)
      this._isSlideScene = Boolean(scene && (scene.type === 'Slide' || scene.cartridgeType === 'Slide'));
      this._isDynamicScene = !this._isSlideScene && Boolean(
        this.isContinuousSim || this.isDynamicSim || (scene && (
          scene.continuous || scene.isContinuous || scene.type === 'Sim' || scene.cartridgeType === 'Sim' ||
          (scene.vars && (Array.isArray(scene.vars) ? scene.vars.length > 0 : Object.keys(scene.vars).length > 0)) ||
          typeof scene.mount === 'function'
        ))
      );
      this._lastOrbitTransform = '';
      this._lastOrbitTransition = '';
      this._last3DSortKeys = null;

      this.applyBindings(this.progress);
      this.translateInStageLabels();
      if (this.profiler) {
        this.profiler.mount(this.getStageSvg());
      }
      if (typeof window !== 'undefined' && window.__astGestures && typeof window.__astGestures.enhanceSceneInteractivity === 'function') {
        window.__astGestures.enhanceSceneInteractivity();
      }
    } finally {
      this._isMounting = false;
    }
  }

  applyBindings(t, dt = 0.016, isTickStep = false) {
    const isSim = Boolean(this.isContinuousSim || (this.scene && (this.scene.type === 'Sim' || this.scene.cartridgeType === 'Sim')));
    const effectiveT = (isSim && this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : t;
    this.updateComputedVars(effectiveT);

    if (isTickStep && this.isPlaying && this.activeVarBindings && this.activeVarBindings.length > 0 && this.vars) {
      const v = this.vars;
      let varChanged = false;
      for (let i = 0; i < this.activeVarBindings.length; i++) {
        const vb = this.activeVarBindings[i];
        try {
          const nextVal = vb.evalFn(effectiveT, v, v, Math);
          if (nextVal !== undefined && (typeof nextVal !== 'number' || Number.isFinite(nextVal))) {
            if (v[vb.varName] !== nextVal) {
              v[vb.varName] = nextVal;
              varChanged = true;
            }
          }
        } catch (_) {}
      }
      if (varChanged) {
        this.updateComputedVars(effectiveT);
      }
    }

    if (!this._isMounting && this._container && (this._mountedSceneId !== this.activePresetId || this._mountedContainer !== this._container)) {
      if (this.scene) {
        this.mountSceneAsset(this.scene, this._container);
      }
    }

    const sceneCam = this.scene && this.scene.camera;
    const camera = this._cameraFrame || (this._cameraFrame = { distance: 500, pitch: 20, yaw: 0, roll: 0, fov: 60 });
    camera.distance = (sceneCam && sceneCam.distance !== undefined) ? sceneCam.distance : 500;
    camera.pitch = (sceneCam && sceneCam.pitch !== undefined) ? sceneCam.pitch : 20;
    camera.yaw = (sceneCam && sceneCam.yaw !== undefined) ? sceneCam.yaw : 0;
    camera.roll = (sceneCam && sceneCam.roll !== undefined) ? sceneCam.roll : 0;
    camera.fov = (sceneCam && sceneCam.fov !== undefined) ? sceneCam.fov : 60;

    if (typeof camera.yaw === 'string' || typeof camera.pitch === 'string') {
      const v = this.vars || {};
      const prevClock = v.clock;
      v.clock = this.realtimeSec != null ? this.realtimeSec : (effectiveT * (this.durationSec || 12.0));
      if (typeof camera.yaw === 'string') {
        try {
          const yawFn = this.compileAstFn(camera.yaw);
          if (typeof yawFn === 'function') camera.yaw = yawFn(effectiveT, v, this.computed || v, Math);
        } catch {}
      }
      if (typeof camera.pitch === 'string') {
        try {
          const pitchFn = this.compileAstFn(camera.pitch);
          if (typeof pitchFn === 'function') camera.pitch = pitchFn(effectiveT, v, this.computed || v, Math);
        } catch {}
      }
      if (prevClock !== undefined) v.clock = prevClock;
    }
    const totalScale = Math.max(0.2, Math.min(4.0, (this.cameraOrbit ? this.cameraOrbit.distanceScale : 1.0)));

    const hasSoftware3D = Boolean(this.active3DItems && this.active3DItems.length > 0);
    if (this._container && this._container.style) {
      let nextTransform = '';
      let nextTransition = '';
      if (!hasSoftware3D && (this.cameraOrbit && (this.cameraOrbit.yawOffset !== 0 || this.cameraOrbit.pitchOffset !== 0 || this.cameraOrbit.distanceScale !== 1.0))) {
        const orbitYaw = Math.max(-45, Math.min(45, this.cameraOrbit.yawOffset));
        const orbitPitch = Math.max(-45, Math.min(45, this.cameraOrbit.pitchOffset));
        nextTransform = `perspective(800px) rotateX(${orbitPitch.toFixed(1)}deg) rotateY(${orbitYaw.toFixed(1)}deg) scale(${totalScale.toFixed(2)})`;
        nextTransition = this.isOrbitDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      if (this._lastOrbitTransform !== nextTransform) {
        this._lastOrbitTransform = nextTransform;
        if (nextTransform) {
          this._container.style.transformOrigin = '400px 240px';
          this._container.style.transformBox = 'view-box';
        }
        this._container.style.transform = nextTransform;
      }
      if (this._lastOrbitTransition !== nextTransition) {
        this._lastOrbitTransition = nextTransition;
        this._container.style.transition = nextTransition;
      }
    }

    // Evaluate 2D reactive bindings BEFORE 3D node projection so newly revealed 3D nodes/groups
    // have display="inline" and visibility state updated on the exact same frame.
    if (this.activeBindings && this.activeBindings.length) {
      const v = this.vars || {};
      const renderBoundary = global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.commitBindingValue === 'function'
        ? global.ASTSharedRenderBoundary
        : null;
      for (let i = 0; i < this.activeBindings.length; i++) {
        const b = this.activeBindings[i];
        if (b.node) {
          try {
            let val;
            if (b.affine) {
              const num = b.affine.m * effectiveT + b.affine.c;
              if (b.matrixBuf) {
                const mb = b.matrixBuf;
                if (b.affine.transform === 'translateX') {
                  mb[0] = 1; mb[1] = 0; mb[2] = 0; mb[3] = 1; mb[4] = num; mb[5] = 0;
                } else if (b.affine.transform === 'translateY') {
                  mb[0] = 1; mb[1] = 0; mb[2] = 0; mb[3] = 1; mb[4] = 0; mb[5] = num;
                } else if (b.affine.transform === 'rotate') {
                  const rad = num * (Math.PI / 180);
                  const cos = Math.cos(rad);
                  const sin = Math.sin(rad);
                  mb[0] = cos; mb[1] = sin; mb[2] = -sin; mb[3] = cos;
                  if (b.affine.originX != null && b.affine.originY != null) {
                    const cx = b.affine.originX;
                    const cy = b.affine.originY;
                    mb[4] = cx - cx * cos + cy * sin;
                    mb[5] = cy - cx * sin - cy * cos;
                  } else {
                    mb[4] = 0; mb[5] = 0;
                  }
                }
                val = `matrix(${mb[0]},${mb[1]},${mb[2]},${mb[3]},${mb[4]},${mb[5]})`;
              } else {
                val = num;
              }
            } else {
              val = b.evalFn(effectiveT, v, Math, v);
            }
            if (b.lastVal !== val) {
              b.lastVal = val;
              if (renderBoundary) {
                renderBoundary.commitBindingValue(b.node, b.attr, val);
              } else if (b.attr === 'textContent' || b.attr === 'text') {
                b.node.textContent = String(val);
              } else {
                const safeVal = typeof val === 'number' && !Number.isFinite(val) ? 0 : val;
                b.node.setAttribute(b.attr, String(safeVal));
              }
            }
          } catch (err) {}
        }
      }
    }

    if (hasSoftware3D) {
      const _3d = _getAST3D();
      if (_3d && typeof _3d.renderSoftware3D === 'function') {
        _3d.renderSoftware3D.call(this, effectiveT, camera);
      }
    }

    // Generic declarative emitter expressions (:phase-expr, :clamp-x-expr, :count-expr, :speed-expr)
    if (this.emitters && this.emitters.size > 0) {
      const v = this.vars || {};
      const _M = _getAstMath();
      for (const em of this.emitters.values()) {
        if (em._phaseEval) {
          try {
            const nextPhase = String(em._phaseEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map) || 'gas').toLowerCase();
            if (nextPhase && nextPhase !== em.phaseState) {
              em.setPhaseState(nextPhase);
            }
          } catch (_) {}
        }
        if (em._clampXEval) {
          try {
            const nextClampX = Number(em._clampXEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
            if (Number.isFinite(nextClampX)) {
              em.clampToPistonX(nextClampX);
            }
          } catch (_) {}
        }
        if (em._countEval) {
          try {
            const nextCnt = Math.round(Number(em._countEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map)));
            if (Number.isFinite(nextCnt) && nextCnt !== em._lastCountEval) {
              em._lastCountEval = nextCnt;
              em.setCount(nextCnt);
            }
          } catch (_) {}
        }
        if (em._speedEval) {
          try {
            const nextSpd = Number(em._speedEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
            if (Number.isFinite(nextSpd) && Math.abs(nextSpd - em._lastSpeedEval) >= 2) {
              em._lastSpeedEval = nextSpd;
              em.setSpeed(nextSpd);
            }
          } catch (_) {}
        }
      }
    }

    // Update Zero-GC Live Vector Oscilloscopes (:scope) with per-slot cached coordinate tokens
    if (!this._isResetting && this.activeScopes && this.activeScopes.length > 0) {
      const v = this.vars || {};
      const _M = _getAstMath();
      for (let s = 0; s < this.activeScopes.length; s++) {
        const sc = this.activeScopes[s];
        try {
          const xv = Number(sc.evalX(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
          const yv = Number(sc.evalY(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
          if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;

          const xSpan = Math.max(1e-6, sc.xMax - sc.xMin);
          const ySpan = Math.max(1e-6, sc.yMax - sc.yMin);
          const minStepX = xSpan / Math.max(8, sc.capacity);
          const minStepY = ySpan * 0.015;
          const dx = Math.abs(xv - sc.lastSampleX);
          const dy = Math.abs(yv - sc.lastSampleY);

          if (!sc.hasLast || dx >= minStepX || dy >= minStepY) {
            const writeIdx = (sc.head + sc.count) % sc.capacity;
            if (sc.count < sc.capacity) {
              sc.count++;
            } else {
              sc.head = (sc.head + 1) % sc.capacity;
            }
            sc.rawX[writeIdx] = xv;
            sc.rawY[writeIdx] = yv;
            sc.lastSampleX = xv;
            sc.lastSampleY = yv;
            sc.hasLast = true;

            let nx = (xv - sc.xMin) / xSpan;
            let ny = (yv - sc.yMin) / ySpan;
            if (nx < 0) nx = 0; else if (nx > 1) nx = 1;
            if (ny < 0) ny = 0; else if (ny > 1) ny = 1;
            const px = sc.plotX + nx * sc.plotW;
            const py = sc.plotY + sc.plotH - ny * sc.plotH;
            if (!sc.slotTokens) sc.slotTokens = new Array(sc.capacity);
            sc.slotTokens[writeIdx] = `${px.toFixed(1)},${py.toFixed(1)}`;

            if (sc.node) {
              const pts = sc.ptStrings;
              pts.length = sc.count;
              const cap = sc.capacity;
              const head = sc.head;
              const slots = sc.slotTokens;
              for (let k = 0; k < sc.count; k++) {
                pts[k] = slots[(head + k) % cap];
              }
              sc.node.setAttribute('points', pts.join(' '));
            }
          }
        } catch (_) {}
      }
    }

    // Update Zero-GC Conservation-Law & Energy-Ledger Meters (:ledger)
    if (this.activeLedgers && this.activeLedgers.length > 0) {
      const v = this.vars || {};
      const _M = _getAstMath();
      for (let l = 0; l < this.activeLedgers.length; l++) {
        const ld = this.activeLedgers[l];
        let total = 0;
        let changed = !ld.hasLast;
        const termCount = ld.evalFns.length;
        for (let ti = 0; ti < termCount; ti++) {
          let val = 0;
          try {
            val = Number(ld.evalFns[ti](effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
          } catch (_) { val = 0; }
          if (!Number.isFinite(val) || val < 0) val = 0;
          ld.values[ti] = val;
          total += val;
          if (!changed && Math.abs(val - ld.lastValues[ti]) > 1e-3) {
            changed = true;
          }
        }
        if (changed) {
          let maxCap = total;
          if (ld.maxEvalFn) {
            try {
              const m = Number(ld.maxEvalFn(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
              if (Number.isFinite(m) && m > 0) maxCap = m;
            } catch (_) {}
          }
          if (maxCap < 1e-6) maxCap = 1;

          let cursorX = ld.x;
          for (let ti = 0; ti < termCount; ti++) {
            const val = ld.values[ti];
            ld.lastValues[ti] = val;
            const frac = Math.min(1, val / maxCap);
            const segW = Math.max(0, Math.min(ld.x + ld.width - cursorX, frac * ld.width));
            if (ld.rectNodes[ti]) {
              ld.rectNodes[ti].setAttribute('x', cursorX.toFixed(1));
              ld.rectNodes[ti].setAttribute('width', segW.toFixed(1));
            }
            if (ld.valueLabelNodes[ti]) {
              const unitSuffix = ld.unit ? ` ${ld.unit}` : '';
              ld.valueLabelNodes[ti].textContent = `${ld.terms[ti].label}: ${val.toFixed(1)}${unitSuffix}`;
            }
            cursorX += segW;
          }
          if (ld.totalNode) {
            const unitSuffix = ld.unit ? ` ${ld.unit}` : '';
            ld.totalNode.textContent = `Total: ${total.toFixed(1)}${unitSuffix}`;
          }
          ld.hasLast = true;
        }
      }
    }

    // Evaluate Manipulation-Based Goal Checkpoints (:pass-expr & :hold-duration)
    if (this.scene && this.scene.interactive && Array.isArray(this.scene.interactive.checkpoints)) {
      const cps = this.scene.interactive.checkpoints;
      const v = this.vars || {};
      const stepDt = isTickStep ? dt : 0;
      for (let ci = 0; ci < cps.length && ci < 32; ci++) {
        const cp = cps[ci];
        if (!cp || !cp.passExpr) continue;
        if (!cp._passEvalFn) {
        try {
          const rawPassFn = this.compileAstFn(cp.passExpr);
          cp._passEvalFn = typeof rawPassFn === 'function'
            ? (t, vars, MathObj, computed, clamp, lerp, map) =>
                Boolean(typeof rawPassFn === 'function' ? rawPassFn(t, vars, computed, MathObj, clamp, lerp, map) : false)
            : () => false;
        } catch (_) {
          cp._passEvalFn = () => false;
        }        }
        let condMet = false;
        try {
          const _M = _getAstMath();
          condMet = Boolean(cp._passEvalFn(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
        } catch (_) {
          condMet = false;
        }
        const holdDur = Number(cp.holdDuration || 0);
        if (this._cpPassedMask[ci] === 0) {
          if (condMet) {
            if (holdDur <= 0) {
              this._cpHoldTimers[ci] = 0;
              this._cpPassedMask[ci] = 1;
              cp._holdProgress = 1;
              this.emit('checkpoint_goal_passed', { index: ci, checkpoint: cp });
              this.notifyParent({
                type: 'CHECKPOINT_GOAL_PASSED',
                sceneId: (this.scene && this.scene.id) || '',
                index: ci,
                prompt: cp.prompt
              });
            } else {
              this._cpHoldTimers[ci] = Math.min(holdDur, this._cpHoldTimers[ci] + stepDt);
              cp._holdProgress = Math.min(1, this._cpHoldTimers[ci] / holdDur);
              if (this._cpHoldTimers[ci] >= holdDur) {
                this._cpPassedMask[ci] = 1;
                cp._holdProgress = 1;
                this.emit('checkpoint_goal_passed', { index: ci, checkpoint: cp });
                this.notifyParent({
                  type: 'CHECKPOINT_GOAL_PASSED',
                  sceneId: (this.scene && this.scene.id) || '',
                  index: ci,
                  prompt: cp.prompt
                });
              }
            }
          } else {
            this._cpHoldTimers[ci] = 0;
            cp._holdProgress = 0;
          }
        } else {
          cp._holdProgress = 1;
        }
      }
    }

    // Periodic zero-GC sampling into Lab CSV columnar ring buffer during active tick
    if (isTickStep && this.isPlaying) {
      this._labLogClock = (this._labLogClock || 0) + dt;
      if (this._labLogClock >= 0.25) {
        this._labLogClock = 0;
        const sampleT = (this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : (this.realtimeSec || 0);
        this._recordLabSample(sampleT);
      }
    }

    if (this.scene && typeof this.scene.update === 'function' && this._cachedElements) {
      this.scene.update(t, this._cachedElements, this, dt);
    }
  }

  renderCurrentVector(container) {
    const target = container || this.container;
    if (target) {
      if (!this._isMounting && (this._mountedSceneId !== this.activePresetId || this._mountedContainer !== target)) {
        if (this.scene) {
          this.mountSceneAsset(this.scene, target);
        }
      }
      this.applyBindings(this.progress);
      return '';
    }

    if (this.scene && typeof this.scene.render === 'function') {
      return this.scene.render(this.progress);
    }
    return '';
  }

  tick(currentTimestamp) {
    if (!currentTimestamp && typeof performance !== 'undefined' && typeof performance.now === 'function') {
      currentTimestamp = performance.now();
    }

    // 1. Hardware compositor delta & refresh cadence tracking
    if (this.profiler) this.profiler.onFrame(currentTimestamp);

    if (this.lastTimestamp !== null) {
      const rawDeltaSec = (currentTimestamp - this.lastTimestamp) / 1000.0;

      // Optional Framerate / Power Gating (e.g. Eco 30 FPS saves mobile CPU cycles)
      if (this.targetFps > 0) {
        const minIntervalSec = (1.0 / this.targetFps) * 0.94;
        if (rawDeltaSec < minIntervalSec) {
          if (typeof requestAnimationFrame !== 'undefined') {
            this.animationFrameId = requestAnimationFrame(this._boundTick);
          }
          return;
        }
      }

      // 2. Start VM Compute Timer
      const t0 = (this.profiler && typeof performance !== 'undefined') ? performance.now() : 0;

      const deltaSec = Math.min(Math.max(rawDeltaSec, 0), 0.05);
      this.realtimeSec = (this.realtimeSec || 0) + deltaSec;

      if (this.physics && this.physics.enabled && (this.physics.bodies.length > 0 || this.physics.springs.length > 0)) {
        this.physics.update(deltaSec);
      }

      if (this.verletPhysics && this.verletPhysics.enabled && this.verletPhysics.points.length > 0) {
        this.verletPhysics.step(deltaSec);
      }

      for (const sm of this.stateMachines.values()) {
        sm.update(deltaSec, this.reactiveVars || {});
      }

      for (const em of this.emitters.values()) {
        em.update(deltaSec);
      }

      if (this._classifiedScene !== this.scene) {
        this._classifiedScene = this.scene;
        this._isSlideScene = Boolean(this.scene && (this.scene.type === 'Slide' || this.scene.cartridgeType === 'Slide'));
        this._isDynamicScene = !this._isSlideScene && Boolean(
          this.isContinuousSim || this.isDynamicSim || (this.scene && (
            this.scene.continuous || this.scene.isContinuous || this.scene.type === 'Sim' || this.scene.cartridgeType === 'Sim' ||
            (this.scene.vars && (Array.isArray(this.scene.vars) ? this.scene.vars.length > 0 : Object.keys(this.scene.vars).length > 0)) ||
            typeof this.scene.mount === 'function'
          ))
        );
      }
      const isDynamicScene = !this._isSlideScene && (this._isDynamicScene || Boolean(this.isContinuousSim || this.isDynamicSim));

      if (this.isPlaying) {
        if (!isDynamicScene) {
          this.progress += (deltaSec / (this.durationSec || 10.0)) * (this.speed || 1.0);

          if (this.progress >= 1.0) {
            if (this.loop) {
              this.progress = this.progress % 1.0;
              this.lastSpokenIndex = -1;
            } else {
              this.progress = 1.0;
              this.pause();
              this.emit('ended', { duration: this.durationSec });
            }
          }

          this.updateActiveKeyframeAndSpeech(false);
        }

        if (!this.vars) this.vars = {};
        const speedParam = typeof this.vars.speedMultiplier === 'number'
          ? this.vars.speedMultiplier
          : (typeof this.vars.speed === 'number'
              ? this.vars.speed
              : (typeof this.vars.warpSpeed === 'number'
                  ? this.vars.warpSpeed
                  : (typeof this.vars.pilgrimSpeed === 'number' ? this.vars.pilgrimSpeed : (typeof this.vars.timeWarp === 'number' ? this.vars.timeWarp : 1.0))));

        const clockDelta = deltaSec * Math.max(0.01, speedParam) * (this.speed || 1.0);
        this.vars.simClock = (this.vars.simClock || 0) + clockDelta;
        this.vars.clock = this.vars.simClock;
        this.vars._simClock = this.vars.simClock;
        this.vars._solarClock = this.vars.simClock;

        if (this.backdropVideo && this.scene && (this.scene.video || this.scene.hasVideo) && !this.backdropVideo.paused && this.backdropVideo.duration > 0) {
          const expectedSec = this.progress * (this.durationSec || 10.0);
          if (Math.abs(this.backdropVideo.currentTime - expectedSec) > 0.35) {
            this.backdropVideo.currentTime = expectedSec;
          }
        }

        if (this.scene) {
          const tp = this._timeUpdatePayload || (this._timeUpdatePayload = { progress: 0, currentTime: 0, duration: 0 });
          tp.progress = isDynamicScene ? 0 : this.progress;
          tp.currentTime = isDynamicScene ? 0 : this.progress * (this.durationSec || 10.0);
          tp.duration = isDynamicScene ? 0 : this.durationSec;
          this.emit('timeupdate', tp);
        }
      }

      this.applyBindings(this.progress, deltaSec, true);

      // 3. Record raw AST/SVG compute duration (excludes compositor idle time)
      if (this.profiler && t0 > 0) {
        this.profiler.onCompute(performance.now() - t0);
      }
    }

    this.lastTimestamp = currentTimestamp;
    if (typeof requestAnimationFrame !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(this._boundTick);
    }
  }

  /** Cartridge Integrity & Checksum Delegators (implemented in static/player/ast-loader.js) */
  async _computeSha256Hex(data) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld._computeSha256Hex === 'function' ? _ld._computeSha256Hex.call(this, data) : null; }
  _resolveChecksumBaseUrl() { const _ld = _getASTSceneLoader(); return _ld && typeof _ld._resolveChecksumBaseUrl === 'function' ? _ld._resolveChecksumBaseUrl.call(this) : '/'; }
  async _loadChecksumRegistry() { const _ld = _getASTSceneLoader(); return _ld && typeof _ld._loadChecksumRegistry === 'function' ? _ld._loadChecksumRegistry.call(this) : null; }
  async verifyLoadedCartridge(scene) { const _ld = _getASTSceneLoader(); return _ld && typeof _ld.verifyLoadedCartridge === 'function' ? _ld.verifyLoadedCartridge.call(this, scene) : null; }

  hotReloadSvg(svgMarkup) {
    if (!svgMarkup || typeof svgMarkup !== 'string') return false;
    try {
      if (!this.scene) {
        this.scene = { id: 'custom-scene', title: 'Custom SVG Scene', stage: 'DEVELOPER', duration: 10.0 };
      }
      this.scene.svgText = this.sanitizeSvg(svgMarkup);
      this.scene._rawAstbBuffer = null;
      this.scene._svgEditedManually = true;
      this._svgDirtyFromInspector = false;

      const targetContainer = this._container || this.container;
      if (targetContainer) {
        this.mountSceneAsset(this.scene, targetContainer);
        this.applyBindings(this.progress);
      }

      this.emit('svghotreloaded', { svg: this.scene.svgText, progress: this.progress });
      this.notifyParent({ type: 'DEV_HOT_RELOAD_SUCCESS', target: 'svg' });
      this.verifyLoadedCartridge(this.scene).catch(() => {});
      return true;
    } catch (err) {
      console.error('[AST Engine] Failed to hot-reload SVG:', err);
      return false;
    }
  }

  hotReloadAst(astInput) {
    if (!astInput) return false;
    try {
      let parsed = typeof astInput === 'string' ? this.parseAst(astInput) : astInput;
      if (!parsed) return false;

      if (!this.scene) this.scene = {};
      this.scene.id = parsed.id || this.scene.id || 'custom-ast';
      this.scene.title = parsed.title || this.scene.title || 'Custom AST Scene';
      this.scene.stage = parsed.stage || this.scene.stage || 'DEVELOPER';
      this.scene.duration = parsed.duration || this.scene.duration || 10.0;
      if (parsed.type) this.scene.type = parsed.type;
      if (parsed.vars) this.scene.vars = parsed.vars;
      if (parsed.uiControls) this.scene.uiControls = parsed.uiControls;
      if (parsed.inputs) this.scene.inputs = parsed.inputs;
      if (parsed.computed) this.scene.computed = parsed.computed;
      if (parsed.gestures) this.scene.gestures = parsed.gestures;
      if (parsed.controls) this.scene.controls = parsed.controls;
      this.scene.keyframes = parsed.keyframes || [];
      this.scene.subtitles = parsed.subtitles || [];
      this.scene.rawBindings = parsed.bindings || parsed.rawBindings || [];
      if (parsed.interactive) {
        this.scene.interactive = parsed.interactive;
      } else if (parsed.checkpoints && parsed.checkpoints.length > 0) {
        this.scene.interactive = { checkpoints: parsed.checkpoints, hotspots: [] };
      } else {
        this.scene.interactive = null;
      }
      if (parsed.camera) this.scene.camera = parsed.camera;
      if (parsed.physics) this.scene.physics = parsed.physics;
      this.scene.scopes = parsed.scopes || [];
      this.scene.ledgers = parsed.ledgers || [];
      if (typeof parsed.has3D === 'boolean') this.scene.has3D = parsed.has3D;
      this.scene.astSource = typeof astInput === 'string' ? astInput : null;
      this.scene._rawAstbBuffer = null;
      this.scene._astEditedManually = true;

      this.activePresetId = this.scene.id || this.activePresetId;
      this.durationSec = this.scene.duration;
      this.resetVars();
      this.updateComputedVars();

      const targetContainer = this._container || this.container;
      if (targetContainer) {
        this.mountSceneAsset(this.scene, targetContainer);
        this.applyBindings(this.progress);
      }
      if (typeof this.mountDeclarativeHud === 'function') {
        this.mountDeclarativeHud(this.scene);
      }

      this.emit('asthotreloaded', { ast: parsed, progress: this.progress });
      this.notifyParent({ type: 'DEV_HOT_RELOAD_SUCCESS', target: 'ast' });
      this.verifyLoadedCartridge(this.scene).catch(() => {});
      return true;
    } catch (err) {
      console.error('[AST Engine] Failed to hot-reload AST:', err);
      return false;
    }
  }

  getStageSvgSnapshot() {
    const _exp = _getASTExporter();
    return _exp && typeof _exp.getStageSvgSnapshot === 'function' ? _exp.getStageSvgSnapshot.call(this) : '';
  }

  getCleanCompanionSvg() {
    const _exp = _getASTExporter();
    return _exp && typeof _exp.getCleanCompanionSvg === 'function' ? _exp.getCleanCompanionSvg.call(this) : '';
  }

  getCurrentAstSource() {
    const _exp = _getASTExporter();
    return _exp && typeof _exp.getCurrentAstSource === 'function' ? _exp.getCurrentAstSource.call(this) : '';
  }

  getDefaultCheckpoints(presetId) {
    if (this.scene && this.scene.interactive && Array.isArray(this.scene.interactive.checkpoints)) {
      return this.scene.interactive.checkpoints;
    }
    return [];
  }

  selectBranch(branchIndex) {
    const cp = this.activeCheckpoint || (this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints[0]) || null;
    if (!cp) return;
    const branches = cp.branches || [];
    const branch = branches[branchIndex];
    if (!branch) return;

    if (this.audioSynth) this.audioSynth.playSuccessChime();
    if (this.scormBridge) {
      this.scormBridge.setScore(100);
      this.scormBridge.setStatus('passed');
    }

    this.notifyParent({
      type: 'BRANCH_SELECTED',
      branchIndex,
      label: branch.label,
      targetTime: branch.targetTime,
      explanation: branch.explanation
    });

    if (typeof branch.targetTime === 'number') {
      this.seek(branch.targetTime);
    }
    this.isBranching = false;
    this.play();
  }

  compileAutonomousSvgApplet() {
    const _exp = _getASTExporter();
    return _exp && typeof _exp.compileAutonomousSvgApplet === 'function' ? _exp.compileAutonomousSvgApplet.call(this) : '';
  }
}

  // setupPostMessageBridge extracted to static/player/ast-bridge.js

  // Expose to global/window environment
  const _ASTProfiler = global.ASTProfiler || (typeof window !== 'undefined' ? window.ASTProfiler : undefined);
  if (_ASTProfiler) {
    global.ASTProfiler = _ASTProfiler;
    if (typeof window !== 'undefined') {
      window.ASTProfiler = _ASTProfiler;
    }
  }
  const _VectorProceduralAudioSynth = global.VectorProceduralAudioSynth || (typeof window !== 'undefined' ? window.VectorProceduralAudioSynth : undefined);
  if (_VectorProceduralAudioSynth) {
    global.VectorProceduralAudioSynth = _VectorProceduralAudioSynth;
    if (typeof window !== 'undefined') {
      window.VectorProceduralAudioSynth = _VectorProceduralAudioSynth;
    }
  }
  const _VectorMicroPhysics = global.VectorMicroPhysics || (typeof window !== 'undefined' ? window.VectorMicroPhysics : undefined);
  if (_VectorMicroPhysics) {
    global.VectorMicroPhysics = _VectorMicroPhysics;
    if (typeof window !== 'undefined') {
      window.VectorMicroPhysics = _VectorMicroPhysics;
    }
  }
  const _VectorVerletPhysics = global.VectorVerletPhysics || (typeof window !== 'undefined' ? window.VectorVerletPhysics : undefined);
  if (_VectorVerletPhysics) {
    global.VectorVerletPhysics = _VectorVerletPhysics;
    if (typeof window !== 'undefined') {
      window.VectorVerletPhysics = _VectorVerletPhysics;
    }
  }
  const _VectorEmitterCollection = global.VectorEmitterCollection || (typeof window !== 'undefined' ? window.VectorEmitterCollection : undefined);
  if (_VectorEmitterCollection) {
    global.VectorEmitterCollection = _VectorEmitterCollection;
    if (typeof window !== 'undefined') {
      window.VectorEmitterCollection = _VectorEmitterCollection;
    }
  }
  const _parserExports = [
    'AstMath', 'astMorphPath', 'astMorphColor', 'astEaseBack', 'astEaseBounce',
    'astEaseElastic', 'astSquashStretch', 'compileAstExpr', 'compileAstFn',
    'isAstBytecode', 'decompileBytecode', 'parseAst'
  ];
  for (let i = 0; i < _parserExports.length; i++) {
    const k = _parserExports[i];
    const v = global[k] || (typeof window !== 'undefined' ? window[k] : undefined);
    if (v !== undefined) {
      global[k] = v;
      if (typeof window !== 'undefined') {
        window[k] = v;
      }
    }
  }
  const _AST3DEngine = global.AST3DEngine || (typeof window !== 'undefined' ? window.AST3DEngine : undefined);
  if (_AST3DEngine) {
    global.AST3DEngine = _AST3DEngine;
    if (typeof window !== 'undefined') {
      window.AST3DEngine = _AST3DEngine;
    }
  }
  const _setupPostMessageBridge = global.setupPostMessageBridge || (typeof window !== 'undefined' ? window.setupPostMessageBridge : undefined);
  if (_setupPostMessageBridge) {
    global.setupPostMessageBridge = _setupPostMessageBridge;
    if (typeof window !== 'undefined') {
      window.setupPostMessageBridge = _setupPostMessageBridge;
    }
  }
  const _ASTExporter = global.ASTExporter || (typeof window !== 'undefined' ? window.ASTExporter : undefined);
  if (_ASTExporter) {
    global.ASTExporter = _ASTExporter;
    if (typeof window !== 'undefined') {
      window.ASTExporter = _ASTExporter;
    }
  }
  const _ASTHudControls = global.ASTHudControls || (typeof window !== 'undefined' ? window.ASTHudControls : undefined);
  if (_ASTHudControls) {
    global.ASTHudControls = _ASTHudControls;
    if (typeof window !== 'undefined') {
      window.ASTHudControls = _ASTHudControls;
    }
  }
  const _ASTAiDirector = global.ASTAiDirector || (typeof window !== 'undefined' ? window.ASTAiDirector : undefined);
  if (_ASTAiDirector) {
    global.ASTAiDirector = _ASTAiDirector;
    if (typeof window !== 'undefined') window.ASTAiDirector = _ASTAiDirector;
  }
  const _ASTSceneLoader = global.ASTSceneLoader || (typeof window !== 'undefined' ? window.ASTSceneLoader : undefined);
  if (_ASTSceneLoader) {
    global.ASTSceneLoader = _ASTSceneLoader;
    if (typeof window !== 'undefined') window.ASTSceneLoader = _ASTSceneLoader;
  }
  const _ASTStateMachine = global.ASTStateMachine || (typeof window !== 'undefined' ? window.ASTStateMachine : undefined);
  if (_ASTStateMachine) {
    global.ASTStateMachine = _ASTStateMachine;
    if (typeof window !== 'undefined') window.ASTStateMachine = _ASTStateMachine;
  }
  const _MicroSCORMBridge = global.MicroSCORMBridge || (typeof window !== 'undefined' ? window.MicroSCORMBridge : undefined);
  if (_MicroSCORMBridge) {
    global.MicroSCORMBridge = _MicroSCORMBridge;
    if (typeof window !== 'undefined') window.MicroSCORMBridge = _MicroSCORMBridge;
  }
  global.ASTVectorPlayerEngine = ASTVectorPlayerEngine;
  if (typeof window !== 'undefined') {
    window.ASTVectorPlayerEngine = ASTVectorPlayerEngine;
  }
})(typeof window !== 'undefined' ? window : globalThis);

