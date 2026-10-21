/**
 * static/player/ast-registry.js
 *
 * St Joseph's Educational Media Suite - Zero-Bloat AST Scene Registry
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Declarative catalog loader for .ast and .svg curriculum scenes.
 * Replaces legacy monolithic ast-scenes.js with on-demand streaming.
 */

(function (global) {
  'use strict';

  const BUILTIN_CATALOG = [
    { id: "welcome", type: "Sim", title: "Welcome to AST Vector Player & Educational Simulator", stage: "PORTAL SHOWCASE", duration: 16, svgFile: "scenes/welcome.svg", astFile: "scenes/welcome.ast" },
    { id: "algebra-balance", type: "Sim", title: "⚖️ Algebraic Balance Scale (2x + 5 = 15)", stage: "KS2/KS3 MATHS", duration: 14, svgFile: "scenes/algebra-balance.svg", astFile: "scenes/algebra-balance.ast" },
    { id: "altar-anatomy", type: "Slide", title: "The Catholic Altar: Sacred Anatomy, Types & Appointments", stage: "CATHOLIC LIFE", duration: 18, svgFile: "scenes/altar-anatomy.svg", astFile: "scenes/altar-anatomy.ast" },
    { id: "atom", type: "Sim", title: "Atomic Structure: Bohr Electron Shells", stage: "KS3 CHEMISTRY", duration: 12, has3D: true, svgFile: "scenes/atom.svg", astFile: "scenes/atom.ast" },
    { id: "bodmas", type: "Slide", title: "BODMAS / BIDMAS: Forcefield Clamping & Area Physics", stage: "KS2/KS3 MATHS", duration: 14, svgFile: "scenes/bodmas.svg", astFile: "scenes/bodmas.ast" },
    { id: "calculus-curves", type: "Sim", title: "Calculus: Tangent Slopes & Definite Integrals", stage: "GCSE & A-LEVEL MATHS", duration: 14, svgFile: "scenes/calculus-curves.svg", astFile: "scenes/calculus-curves.ast" },
    { id: "church-tour", type: "Slide", title: "Tour of a Catholic Church: Sacred Architecture & Sacred Spaces", stage: "CATHOLIC LIFE", duration: 16, svgFile: "scenes/church-tour.svg", astFile: "scenes/church-tour.ast" },
    { id: "holy-oils", type: "Slide", title: "The Three Holy Oils & The Sacred Ambry (Olea Sancta)", stage: "CATHOLIC LIFE", duration: 18, svgFile: "scenes/holy-oils.svg", astFile: "scenes/holy-oils.ast" },
    { id: "dna-helix", type: "Sim", title: "Genetics: DNA Base Pairing & Transcription", stage: "KS3 GENETICS", duration: 12, has3D: true, svgFile: "scenes/dna-helix.svg", astFile: "scenes/dna-helix.ast" },
    { id: "electric-circuits", type: "Sim", title: "💡 Electrical Circuits & Ohm's Law (V = I × R)", stage: "KS2/KS3 PHYSICS", duration: 12, svgFile: "scenes/electric-circuits.svg", astFile: "scenes/electric-circuits.ast" },
    { id: "fish-tank", type: "App", title: "Aquarium Stress Benchmark: Vector Point & FPS Limiter", stage: "BENCHMARK & STRESS LAB", duration: 12, svgFile: "scenes/fish-tank.svg", astFile: "scenes/fish-tank.ast" },
    { id: "fractions", type: "Slide", title: "Fractions: Why Common Denominators Rule", stage: "KS2 MATHS", duration: 12, svgFile: "scenes/fractions.svg", astFile: "scenes/fractions.ast" },
    { id: "kinetic-gas", type: "Sim", title: "Kinetic Gas Theory & Boyle's Law", stage: "KS3/KS4 PHYSICS & CHEMISTRY", duration: 14, svgFile: "scenes/kinetic-gas.svg", astFile: "scenes/kinetic-gas.ast" },
    { id: "languages", type: "App", title: "MFL & Polyglot Studio: Spanish, French & Latin", stage: "KS2/KS3 MFL", duration: 15, svgFile: "scenes/languages.svg", astFile: "scenes/languages.ast" },
    { id: "math-fishing", type: "App", title: "Math Pond: Number Bonds Fishing Game", stage: "KS1/KS2 MATHS", duration: 14, svgFile: "scenes/math-fishing.svg", astFile: "scenes/math-fishing.ast" },
    { id: "mountain-elevation", type: "Sim", title: "Mountain Altitude: Elevation, Hypotenuse & Atmospheric Science", stage: "KS2/KS3 MATHS & GEOGRAPHY", duration: 16, svgFile: "scenes/mountain-elevation.svg", astFile: "scenes/mountain-elevation.ast" },
    { id: "phonics-lab", type: "App", title: "Early Phonics: Sound Buttons & Blending Mat", stage: "EYFS/KS1 ENGLISH", duration: 12, svgFile: "scenes/phonics-lab.svg", astFile: "scenes/phonics-lab.ast" },
    { id: "photosynthesis", type: "Slide", title: "Photosynthesis: The Green Solar Engine", stage: "KS3 BIOLOGY", duration: 10, svgFile: "scenes/photosynthesis.svg", astFile: "scenes/photosynthesis.ast" },
    { id: "pythagoras", type: "Sim", title: "Pythagoras' Theorem (a² + b² = c²)", stage: "KS3 GEOMETRY", duration: 11, svgFile: "scenes/pythagoras.svg", astFile: "scenes/pythagoras.ast" },
    { id: "shakespeare", type: "Slide", title: "The Globe Theatre: Shakespeare & Iambic Pentameter", stage: "KS3/KS4 ENGLISH LITERATURE", duration: 15, svgFile: "scenes/shakespeare.svg", astFile: "scenes/shakespeare.ast" },
    { id: "solar-system", type: "Sim", title: "Solar System: Heliocentric Planetary Motion", stage: "KS3 SCIENCE", duration: 14, has3D: true, svgFile: "scenes/solar-system.svg", astFile: "scenes/solar-system.ast" },
    { id: "spelling-bee", type: "App", title: "Spelling Bee Championship: KS1 to KS3 Orthography", stage: "KS1/KS2/KS3 ENGLISH", duration: 14, svgFile: "scenes/spelling-bee.svg", astFile: "scenes/spelling-bee.ast" },
    { id: "times-tables", type: "Sim", title: "Times Tables: 2× to 12× Array & Distributive Splitter", stage: "KS1/KS2 MATHS", duration: 14, svgFile: "scenes/times-tables.svg", astFile: "scenes/times-tables.ast" },
    { id: "velocity", type: "Sim", title: "Kinematics: Velocity & Distance-Time Vectors", stage: "KS3 PHYSICS", duration: 10, svgFile: "scenes/velocity.svg", astFile: "scenes/velocity.ast" },
    { id: "water-cycle", type: "Slide", title: "Water Cycle: Continuous Earth Cycle", stage: "KS2 GEOGRAPHY", duration: 10, svgFile: "scenes/water-cycle.svg", astFile: "scenes/water-cycle.ast" },
    { id: "bsl-fingerspelling", type: "Sim", title: "BSL: 3D British Sign Language Two-Handed Fingerspelling", stage: "ACCESSIBILITY & LANGUAGES", duration: 14, has3D: true, svgFile: "scenes/bsl-fingerspelling.svg", astFile: "scenes/bsl-fingerspelling.ast" },
    { id: "phonics-screening", type: "Sim", title: "Year 1 Phonics Screening Check & Alien Words", stage: "EYFS/KS1 PHONICS", duration: 12, svgFile: "scenes/phonics-screening.svg", astFile: "scenes/phonics-screening.ast" },
    { id: "shakespeare-macbeth", type: "Slide", title: "Macbeth: 5-Act Dramatic Soliloquy & Moral Fall", stage: "KS3/KS4 ENGLISH LITERATURE", duration: 16, svgFile: "scenes/shakespeare-macbeth.svg", astFile: "scenes/shakespeare-macbeth.ast" },
    { id: "rosary-mysteries", type: "Sim", title: "The Holy Rosary: 3D Beads & 20 Scriptural Mysteries", stage: "CATHOLIC LIFE", duration: 16, has3D: true, svgFile: "scenes/rosary-mysteries.svg", astFile: "scenes/rosary-mysteries.ast" },
    { id: "eucharistic-procession-film", type: "Film", video: "/media/eucharistic-procession.mp4", videoFit: "contain", title: "Solemn Eucharistic Procession: Liturgical Film & Sacred Vectors", stage: "CATHOLIC LIFE", duration: 26, svgFile: "scenes/eucharistic-procession-film.svg", astFile: "scenes/eucharistic-procession-film.ast" }
  ];

  const scenes = Object.create(null);
  BUILTIN_CATALOG.forEach(s => { scenes[s.id] = s; });

  // Embedded Zero-Network Fallback for Core Cartridges (guarantees 100% determinism on GitHub Pages)
  const EMBEDDED_FALLBACKS = {
    welcome: {
      id: 'welcome',
      type: 'Sim',
      title: 'Welcome to AST Vector Player & Educational Simulator',
      stage: 'PORTAL SHOWCASE',
      duration: 16.0,
      svgMarkup: `<svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
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
    <path id="welcome-sine-path" d="M 80 240 Q 240 180, 400 240 T 720 240" fill="none" stroke="url(#welcome-cyan-gold)" stroke-width="3.5" stroke-linecap="round" filter="url(#ast-glow-cyan)" />
  </g>
  <g transform="translate(400, 240)">
    <circle id="welcome-energy-node" cx="0" cy="0" r="28" fill="url(#welcome-orb-glow)" opacity="0.85" filter="url(#ast-glow-cyan)" />
    <circle cx="0" cy="0" r="14" fill="#f0f9ff" opacity="0.9" />
    <circle cx="0" cy="0" r="6" fill="#0284c7" />
  </g>
  <g id="welcome-probe-group">
    <circle id="welcome-probe" cx="120" cy="240" r="18" fill="#fbbf24" stroke="#ffffff" stroke-width="3" filter="url(#ast-glow-gold)" style="cursor: grab;" data-pedagogical="Direct In-Stage Grabbing: Drag this probe to explore coordinates" />
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
</svg>`,
      astSource: `(:scene :id "welcome" :type "Sim" :title "Welcome to AST Vector Player & Educational Simulator" :stage "PORTAL APPARATUS & SIMULATOR" :duration 16.0
  (:vars ((:var :name "harmonicFreq" :val 2.0 :min 0.5 :max 6.0 :step 0.5 :label "Harmonic Resonance") (:var :name "waveAmplitude" :val 35.0 :min 10.0 :max 80.0 :step 5.0 :label "Wave Amplitude") (:var :name "pulseSpeed" :val 1.0 :min 0.2 :max 3.0 :step 0.2 :label "Time Dilation Clock")))
  (:inputs ((:slider :var "harmonicFreq" :label "Harmonic Frequency" :min 0.5 :max 6.0 :step 0.5) (:slider :var "waveAmplitude" :label "Signal Power" :min 10.0 :max 80.0 :step 5.0) (:slider :var "pulseSpeed" :label "Timeline Warp" :min 0.2 :max 3.0 :step 0.2)))
  (:gestures ((:draggable :target "#welcome-probe" :axis "xy" :min 80 :max 720)))
  (:subtitles ((:start 0.00 :end 0.25 :en "Welcome to AST Vector Player: An autonomous, zero-bloat educational motion and direct-manipulation simulator." :es "Bienvenido al reproductor vectorial AST: Un simulador educativo autónomo y sin sobrecarga." :la "Salve ad AST Vector Player: Machina dynamica et vectorialis ad doctrinam veram.") (:start 0.25 :end 0.55 :en "Flash-Caliber Vector Simulation: Running at 60 FPS in pure SVG DOM with zero external runtime dependencies and sub-15ms cold start." :es "Simulación vectorial calibre Flash: 60 FPS en SVG puro con cero dependencias externas y arranque sub-15ms." :la "Simulatio Vectorialis: Motus continuus ad sexaginta quadros per secundum sine oneribus externis.") (:start 0.55 :end 0.80 :en "Direct In-Stage Grabbing & Smartboard Stylus: Grab and drag interactive physics nodes or draw with Promethean and SMART pens." :es "Manipulación directa en pantalla y pizarra digital: Arrastra nodos físicos o escribe con lápiz óptico." :la "Tactus Directus et Calamus: Trahe elementa viva vel scribe cum calamo digitali super tabulam.") (:start 0.80 :end 1.00 :en "On-Device Gemini Nano AI & W3C WebMCP: Formative assessment and S-Expression logic running purely in the browser with zero cloud leakage." :es "Inteligencia artificial en el dispositivo Gemini Nano: Evaluación formativa y lógica pura sin salida a la nube." :la "Intelligentia Localis: Disciplina et responsa fidelia in machina tua conservata.")))
  (:keyframes ((:t 0.00 :title "1. Autonomous Vector Engine" :rule "Zero Bloat • Native SVG DOM vector apparatus with sub-15ms cold start.") (:t 0.25 :title "2. Harmonic Frequency & Oscillations" :rule "Kinematic Resonance • 60 FPS procedural waveforms with zero video streaming.") (:t 0.55 :title "3. Direct Manipulation & Classroom Stylus" :rule "Interactive Invariants • Drag in-stage nodes or annotate directly with digital ink.") (:t 0.80 :title "4. On-Device Edge Intelligence" :rule "Zero Cloud Leakage • Local Chrome Prompt API / Gemini Nano formative tutoring.")))
  (:interactive ((:checkpoint :t 0.60 :prompt "What architectural feature enables AST Vector Player to boot 70× faster than legacy PhET simulations and video players?" :options ("Declarative Lisp S-Expressions & .astb Bytecode with Zero-Asset Web Audio" "External Cloud Video CDNs" "Gigabyte WebGL textures" "Heavy server-side rendering") :answer 0 :explanation "AST cartridges use micro-payload declarative S-Expressions and compiled binary bytecode (< 15 KB) with procedural Web Audio synthesis, executing in < 0.2 ms with zero cloud dependencies.")))
  (:bindings ((:target "#welcome-probe" :attr "cx" :expr "120 + t * 560") (:target "#welcome-probe" :attr "cy" :expr "240 + Math.sin(t * Math.PI * (vars.harmonicFreq || 2.0) * 2) * (vars.waveAmplitude || 35.0)") (:target "#welcome-energy-node" :attr "r" :expr "24 + Math.sin(t * Math.PI * 8) * 8") (:target "#welcome-energy-node" :attr "opacity" :expr "0.75 + Math.sin(t * 10) * 0.2") (:target "#welcome-sine-path" :attr "d" :expr "'M 80 ' + (240 + Math.sin(t * 4) * 15) + ' Q 240 ' + (240 - (vars.waveAmplitude || 35.0) * 2) + ', 400 240 T 720 ' + (240 + Math.sin(t * 4 + 2) * 15)") (:target "#welcome-freq-readout" :attr "textContent" :expr "(vars.harmonicFreq || 2.0).toFixed(1) + ' Hz'") (:target "#welcome-amp-readout" :attr "textContent" :expr "(vars.waveAmplitude || 35.0).toFixed(0) + ' px'") (:target "#welcome-progress-fill" :attr "width" :expr "t * 640")))
)`
    },
    pythagoras: {
      id: 'pythagoras',
      title: "Pythagoras' Theorem (a² + b² = c²)",
      stage: 'KS3 GEOMETRY',
      duration: 11.0,
      svgMarkup: `<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Blueprint Vignette -->
    <radialGradient id="pyth-bg-glow" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="60%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <!-- Blueprint Grid Pattern (28px unit grid matching simulation scale) -->
    <pattern id="pyth-blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.6" />
      <circle cx="28" cy="28" r="1" fill="#334155" fill-opacity="0.8" />
    </pattern>

    <!-- Precision Drop Shadows and Neon Halos -->
    <filter id="pyth-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="pyth-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <!-- Color Gradients -->
    <!-- Leg a: Emerald -->
    <linearGradient id="pyth-grad-a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#059669" stop-opacity="0.75" />
    </linearGradient>

    <!-- Leg b: Sapphire -->
    <linearGradient id="pyth-grad-b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.75" />
    </linearGradient>

    <!-- Hypotenuse c: Amber / Gold -->
    <linearGradient id="pyth-grad-c" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.75" />
    </linearGradient>

    <!-- HUD Glass Gradient -->
    <linearGradient id="pyth-hud-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#1e293b" stop-opacity="0.90" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>
  </defs>

  <!-- Stage Background & Engineering Grid -->
  <rect width="800" height="480" fill="url(#pyth-bg-glow)" />
  <rect width="800" height="480" fill="url(#pyth-blueprint-grid)" />

  <!-- Technical Axis Origin Guides -->
  <g opacity="0.35">
    <line x1="40" y1="280" x2="760" y2="280" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
    <line x1="360" y1="40" x2="360" y2="440" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
  </g>

  <!-- Interactive Precision Formula Header HUD -->
  <g id="pyth-hud-banner" transform="translate(130, 16)">
    <rect width="540" height="52" rx="14" fill="url(#pyth-hud-glass)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.8" filter="url(#pyth-shadow)" />
    <!-- Subtle Top Rim Highlight -->
    <path d="M 14 1 L 526 1" stroke="#ffffff" stroke-width="1" stroke-opacity="0.25" />
    
    <text x="270" y="33" fill="#f8fafc" font-size="16" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision">
      <tspan fill="#34d399">a² (9)</tspan> + <tspan fill="#60a5fa">b² (16)</tspan> = <tspan fill="#fbbf24">c² (25)</tspan> ➔ 3² + 4² = 5²
    </text>
  </g>

  <!-- Square a² (Emerald Leg A) -->
  <g id="pyth-group-a">
    <rect id="pyth-rect-a" x="276" y="196" width="84" height="84" rx="6" fill="url(#pyth-grad-a)" stroke="#10b981" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-a" style="cursor:ns-resize;" />
    <!-- Pre-rendered 3x3 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-a" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="304" y1="196" x2="304" y2="280" />
      <line x1="332" y1="196" x2="332" y2="280" />
      <line x1="276" y1="224" x2="360" y2="224" />
      <line x1="276" y1="252" x2="360" y2="252" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-a" x="286" y="226" width="64" height="26" rx="6" fill="#064e3b" fill-opacity="0.9" stroke="#34d399" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-a" x="318" y="244" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">a² = 9</text>
  </g>

  <!-- Square b² (Sapphire Leg B) -->
  <g id="pyth-group-b">
    <rect id="pyth-rect-b" x="360" y="280" width="112" height="112" rx="6" fill="url(#pyth-grad-b)" stroke="#3b82f6" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-b" style="cursor:ew-resize;" />
    <!-- Pre-rendered 4x4 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-b" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="388" y1="280" x2="388" y2="392" />
      <line x1="416" y1="280" x2="416" y2="392" />
      <line x1="444" y1="280" x2="444" y2="392" />
      <line x1="360" y1="308" x2="472" y2="308" />
      <line x1="360" y1="336" x2="472" y2="336" />
      <line x1="360" y1="364" x2="472" y2="364" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-b" x="382" y="323" width="68" height="26" rx="6" fill="#1e3a8a" fill-opacity="0.9" stroke="#60a5fa" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-b" x="416" y="341" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">b² = 16</text>
  </g>

  <!-- Square c² (Amber Hypotenuse C) -->
  <g id="pyth-group-c" transform="translate(360, 196) rotate(36.87)">
    <g id="pyth-rot-c">
      <rect id="pyth-rect-c" x="0" y="-140" width="140" height="140" rx="6" fill="url(#pyth-grad-c)" stroke="#f59e0b" stroke-width="2.5" filter="url(#pyth-shadow)" />
      <!-- Pre-rendered 5x5 Unit Tiles for immediate cold-start pedagogical proof -->
      <g id="pyth-grid-c" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
        <line x1="28" y1="-140" x2="28" y2="0" />
        <line x1="56" y1="-140" x2="56" y2="0" />
        <line x1="84" y1="-140" x2="84" y2="0" />
        <line x1="112" y1="-140" x2="112" y2="0" />
        <line x1="0" y1="-112" x2="140" y2="-112" />
        <line x1="0" y1="-84" x2="140" y2="-84" />
        <line x1="0" y1="-56" x2="140" y2="-56" />
        <line x1="0" y1="-28" x2="140" y2="-28" />
      </g>
      <!-- Square Area Badge -->
      <rect id="pyth-badge-c" x="15" y="-83" width="110" height="28" rx="6" fill="#78350f" fill-opacity="0.9" stroke="#fbbf24" stroke-width="1.5" pointer-events="none" />
      <text id="pyth-txt-c" x="70" y="-64" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">c² = 25 (c = 5)</text>
    </g>
  </g>

  <!-- Central Euclidean Right Triangle -->
  <polygon id="pyth-triangle" points="360,280 472,280 360,196" fill="#0e7490" fill-opacity="0.25" stroke="#38bdf8" stroke-width="3.5" stroke-linejoin="round" filter="url(#pyth-glow)" />

  <!-- Precision Drafting Right-Angle Symbol -->
  <g id="pyth-right-angle-group">
    <rect id="pyth-right-angle" x="360" y="262" width="18" height="18" fill="none" stroke="#94a3b8" stroke-width="2" />
    <circle cx="369" cy="271" r="2" fill="#38bdf8" />
  </g>

  <!-- Side Dimension Badges -->
  <g id="pyth-labels-group" pointer-events="none" font-family="system-ui, -apple-system, sans-serif">
    <!-- Leg a Label -->
    <rect x="365" y="226" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#10b981" stroke-width="1" />
    <text id="pyth-label-a" x="388" y="242" fill="#34d399" font-size="12" font-weight="900" text-anchor="middle">a = 3</text>

    <!-- Leg b Label -->
    <rect x="400" y="252" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#3b82f6" stroke-width="1" />
    <text id="pyth-label-b" x="423" y="268" fill="#60a5fa" font-size="12" font-weight="900" text-anchor="middle">b = 4</text>

    <!-- Hypotenuse c Label -->
    <rect x="425" y="218" width="56" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#f59e0b" stroke-width="1" />
    <text id="pyth-label-c" x="453" y="234" fill="#fbbf24" font-size="12" font-weight="900" text-anchor="middle">c = 5.00</text>
  </g>

  <!-- Manipulator Handle A (Top Vertex / Leg a Controller) -->
  <g id="pyth-handle-a" transform="translate(360, 196)" data-draggable="pyth-handle-a" style="cursor:ns-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#10b981" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Vertical Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↕</text>
  </g>

  <!-- Manipulator Handle B (Right Vertex / Leg b Controller) -->
  <g id="pyth-handle-b" transform="translate(472, 280)" data-draggable="pyth-handle-b" style="cursor:ew-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Horizontal Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↔</text>
  </g>
</svg>`,
      astSource: `(:scene :id "pythagoras" :type "Sim" :title "Pythagoras' Theorem (a² + b² = c²)" :stage "KS3 GEOMETRY" :duration 11.0
  (:vars (
    (:var :name "sideA" :val 3 :min 1 :max 8 :step 1 :unit "units" :label "Leg a")
    (:var :name "sideB" :val 4 :min 1 :max 8 :step 1 :unit "units" :label "Leg b")
  ))
  (:inputs (
    (:number :var "sideA" :label "Triangle Leg a" :min 1 :max 10 :step 1)
    (:number :var "sideB" :label "Triangle Leg b" :min 1 :max 10 :step 1)
  ))
  (:computed (
    (:name "hypotenuse" :expr "Math.sqrt(vars.sideA * vars.sideA + vars.sideB * vars.sideB).toFixed(2)")
    (:name "areaA" :expr "vars.sideA * vars.sideA")
    (:name "areaB" :expr "vars.sideB * vars.sideB")
    (:name "areaC" :expr "vars.sideA * vars.sideA + vars.sideB * vars.sideB")
  ))
  (:gestures (
    (:draggable :target "#pyth-handle-a" :axis "y" :min 100 :max 250)
    (:draggable :target "#pyth-handle-b" :axis "x" :min 380 :max 640)
    (:draggable :target "#pyth-rect-a" :axis "y" :min 100 :max 250)
    (:draggable :target "#pyth-rect-b" :axis "x" :min 380 :max 640)
  ))
  (:subtitles (
    (:start 0.00 :end 0.35 :en "Drag the handles, pans, or type your own figures for leg a and leg b." :es "Arrastra los controles o introduce tus propios números para los catetos a y b.")
    (:start 0.35 :end 0.70 :en "Observe area conservation: square a² (emerald) plus square b² (sapphire) always equals square c² (amber)." :es "Observa la conservación de área: el cuadrado a² más el cuadrado b² siempre es igual a c².")
    (:start 0.70 :end 1.00 :en "a² + b² = c². The total number of unit tiles is strictly conserved for all right triangles." :es "a² + b² = c². El número total de baldosas unitarias se conserva estrictamente.")
  ))
  (:keyframes (
    (:t 0.00 :title "Interactive Manipulative" :rule "Drag handles or enter custom figures to test Pythagorean triples")
    (:t 0.35 :title "Area Conservation" :rule "Square of side a has area a²; square of side b has area b²")
    (:t 0.70 :title "Vector Area Sum" :rule "Total square units: a² + b² = c²")
    (:t 1.00 :title "Hypotenuse Square c²" :rule "c = √(a² + b²) preserved across continuous geometry")
  ))
  (:interactive false)
  (:questions false)
  (:bindings (
    (:target "#pyth-txt-a" :attr "opacity" :expr "1")
    (:target "#pyth-txt-b" :attr "opacity" :expr "1")
    (:target "#pyth-txt-c" :attr "opacity" :expr "1")
  ))
)`
    }
  };

  const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

  const SceneRegistry = {
    isUnsafeKey(key) {
      return typeof key === 'string' && UNSAFE_KEYS.has(key);
    },

    register(id, scene) {
      if (!id) return;
      const norm = this.normalizeId(id);
      if (!norm || this.isUnsafeKey(norm) || this.isUnsafeKey(id)) return null;
      scenes[norm] = Object.assign({ id: norm }, scene);
      if (norm !== id) scenes[id] = scenes[norm];
      return scenes[norm];
    },

    get(id) {
      if (!id || this.isUnsafeKey(id)) return null;
      const norm = this.normalizeId(id);
      if (!norm || this.isUnsafeKey(norm)) return null;
      
      // If found in catalog but missing embedded markup, check fallback
      if (scenes[norm] && !scenes[norm].svgMarkup && !scenes[norm].svgText && EMBEDDED_FALLBACKS[norm]) {
        Object.assign(scenes[norm], EMBEDDED_FALLBACKS[norm]);
      }
      if (scenes[norm] && (scenes[norm].svgMarkup || scenes[norm].svgText)) return scenes[norm];
      if (!this.isUnsafeKey(id) && scenes[id] && (scenes[id].svgMarkup || scenes[id].svgText)) return scenes[id];

      // Check decentralized localStorage for custom or imported PhET cartridges
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem('stj_custom_cartridges_v1');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const found = list.find(c => c && (c.id === norm || c.id === id));
              if (found) {
                return this.register(found.id, {
                  id: found.id,
                  title: found.title || found.id,
                  stage: found.stage || 'CUSTOM CARTRIDGE',
                  duration: found.duration || 12.0,
                  svgMarkup: found.svgMarkup || found.svgText,
                  svgText: found.svgMarkup || found.svgText,
                  astSource: found.astSource || found.astText,
                  astText: found.astSource || found.astText,
                });
              }
            }
          }
        } catch (_) {}
      }

      // Check embedded fallbacks (e.g. pythagoras on GitHub Pages)
      if (EMBEDDED_FALLBACKS[norm]) {
        return this.register(norm, EMBEDDED_FALLBACKS[norm]);
      }

      return null;
    },

    getScene(id) {
      return this.get(id);
    },

    has(id) {
      if (!id || this.isUnsafeKey(id)) return false;
      const norm = this.normalizeId(id);
      if (!norm || this.isUnsafeKey(norm)) return false;
      return Boolean(scenes[norm] || (!this.isUnsafeKey(id) && scenes[id]) || EMBEDDED_FALLBACKS[norm]);
    },

    list() {
      const seen = new Set();
      const result = [];
      Object.keys(scenes).forEach(k => {
        const s = scenes[k];
        if (s && s.id && !seen.has(s.id)) {
          seen.add(s.id);
          result.push({
            id: s.id,
            title: s.title || s.id,
            stage: s.stage || 'CURRICULUM',
            duration: s.duration || 14.0,
            has3D: Boolean(s.has3D),
            svgFile: s.svgFile || `scenes/${s.id}.svg`,
            astFile: s.astFile || `scenes/${s.id}.ast`,
            keyframeCount: s.keyframeCount || (s.keyframes ? s.keyframes.length : 0),
            subtitleCount: s.subtitleCount || (s.subtitles ? s.subtitles.length : 0)
          });
        }
      });
      return result;
    },

    normalizeId(id) {
      if (!id || typeof id !== 'string') return '';
      const clean = id.toLowerCase().trim()
        .replace(/^(demo-|scene-|preset-)/, '')
        .replace(/\.(ast|svg|json)$/, '');
      if (this.isUnsafeKey(clean)) return '';
      const aliases = {
        'pythagorus': 'pythagoras',
        'pythagoras-theorem': 'pythagoras',
        'pythagoras-proof': 'pythagoras',
        'ohms-law': 'electric-circuits',
        'phet-ohms-law': 'electric-circuits',
        'circuits': 'electric-circuits',
        'circuit': 'electric-circuits',
        'gas': 'kinetic-gas',
        'boyles-law': 'kinetic-gas',
        'curves': 'calculus-curves',
        'calculus': 'calculus-curves',
        'aquarium': 'fish-tank',
        'fish': 'fish-tank',
        'fishing': 'math-fishing',
        'mountain': 'mountain-elevation',
        'climber': 'mountain-elevation',
        'photosynth': 'photosynthesis',
        'leaf': 'photosynthesis',
        'stars': 'solar-system',
        'space': 'solar-system',
        'atom': 'atom',
        'atomic-structure': 'atom',
        'bohr': 'atom',
        'spelling': 'spelling-bee',
        'spelling-bee': 'spelling-bee',
        'bee': 'spelling-bee'
      };
      return aliases[clean] || clean;
    },

    parseAstMetadata(content, id) {
      if (!content || typeof content !== 'string') return null;
      const typeMatch = content.match(/:type\s+("Sim"|"Slide"|"App"|"[^"]+"|[^\s\)]+)/i);
      let type = 'Sim';
      if (typeMatch) {
        const norm = typeMatch[1].replace(/^"|"$/g, '').toLowerCase();
        if (norm === 'slide') type = 'Slide';
        else if (norm === 'app') type = 'App';
        else type = 'Sim';
      } else {
        const hasSubtitles = /:subtitles\s*\(/i.test(content);
        const hasGestures = /:gestures\s*\(/i.test(content) || /:draggable\s+/i.test(content);
        const hasCheckpoints = /:interactive\s*\(/i.test(content) || /:checkpoint\s+/i.test(content);
        const hasPhysics = /:physics\s*\(/i.test(content) || /:emitter\s+/i.test(content);
        if (hasSubtitles && !hasGestures && !hasPhysics) {
          type = 'Slide';
        } else if (hasGestures || hasPhysics || hasCheckpoints) {
          type = 'Sim';
        } else {
          type = 'App';
        }
      }
      const titleMatch = content.match(/:title\s+"([^"]+)"/i);
      const stageMatch = content.match(/:stage\s+"([^"]+)"/i);
      const durationMatch = content.match(/:duration\s+([\d\.]+)/i);
      const keyframeCount = (content.match(/\(:t\s+[\d\.]+/gi) || []).length;
      const subtitleCount = (content.match(/\(:start\s+[\d\.]+/gi) || []).length;
      const has3D = content.includes(':3d-') || content.includes(':camera');

      return {
        id: id || 'custom-scene',
        type,
        title: titleMatch ? titleMatch[1] : (id || 'Custom Scene'),
        stage: stageMatch ? stageMatch[1] : 'CURRICULUM',
        duration: durationMatch ? parseFloat(durationMatch[1]) : 14.0,
        has3D: Boolean(has3D),
        keyframeCount,
        subtitleCount,
        svgFile: `scenes/${id}.svg`,
        astFile: `scenes/${id}.ast`
      };
    },

    registerFromAstText(id, content) {
      const meta = this.parseAstMetadata(content, id);
      if (meta) {
        return this.register(id, meta);
      }
      return null;
    },

    /**
     * Auto-Finds available scenes dynamically without requiring teachers to edit index files:
     * 1. Probes live dynamic API (/api/scenes or /player/api/scenes)
     * 2. Scrapes HTML directory index (e.g. static server directory listing)
     * 3. Falls back to pre-compiled manifest
     */
    async autoDiscover(basePath = './') {
      if (this._hasDiscovered) {
        return { totalScenes: Object.keys(scenes).length, scenes: SceneRegistry.list() };
      }
      this._hasDiscovered = true;
      const currentDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
        ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
        : './';
      const base = (basePath || currentDir || './').replace(/\/?$/, '/');

      // 1. Try Live Dynamic Discovery Endpoints (Vite / Dev / API Server)
      const dynamicUrls = ['/api/scenes', '/player/api/scenes', `${base}api/scenes`];
      for (const endpoint of dynamicUrls) {
        try {
          const res = await fetch(endpoint).catch(() => null);
          if (res && res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.scenes) && data.scenes.length > 0) {
              data.scenes.forEach(sc => {
                if (sc && sc.id) SceneRegistry.register(sc.id, sc);
              });
              return data;
            }
          }
        } catch (_) {}
      }

      // 2. Try HTML directory index probe on scenes/ (Nginx autoindex, Python http.server, Apache)
      try {
        const scenesIndexRes = await fetch(`${base}scenes/`).catch(() => null);
        if (scenesIndexRes && scenesIndexRes.ok) {
          const html = await scenesIndexRes.text();
          const hrefRegex = /href=["']([^"']+\.ast)["']/gi;
          let match;
          let discovered = 0;
          while ((match = hrefRegex.exec(html)) !== null) {
            const rawFile = match[1].split('/').pop();
            const id = rawFile.replace('.ast', '');
            if (id && !SceneRegistry.has(id)) {
              SceneRegistry.register(id, {
                id,
                title: id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                stage: 'CURRICULUM',
                duration: 14.0,
                svgFile: `scenes/${id}.svg`,
                astFile: `scenes/${id}.ast`
              });
              discovered++;
            }
          }
          if (discovered > 0) {
            return { totalScenes: Object.keys(scenes).length, scenes: SceneRegistry.list() };
          }
        }
      } catch (_) {}

      // 3. Fallback: Load static configuration manifest with resilient fallback cascade
      const candidateUrls = [
        './scenes.manifest.json',
        './scenes-config.json',
        `${currentDir}scenes.manifest.json`,
        `${currentDir}scenes-config.json`,
        `${base}player/scenes.manifest.json`,
        `${base}player/scenes-config.json`,
        `${base}scenes.manifest.json`,
        `${base}scenes-config.json`,
        '/player/scenes.manifest.json',
        '/player/scenes-config.json',
        '/scenes.manifest.json',
        '/scenes-config.json'
      ];

      for (const url of candidateUrls) {
        const manifestRes = await this.loadConfig(url);
        if (manifestRes) return manifestRes;
      }

      return { totalScenes: Object.keys(scenes).length, scenes: SceneRegistry.list() };
    },

    async loadConfig(url = './scenes.manifest.json') {
      try {
        const res = await fetch(url).catch(() => null);
        if (!res || !res.ok) return null;

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) return null;

        const text = await res.text();
        const trimmed = (text || '').trim();
        if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
          return null; // Reject SPA HTML fallbacks
        }

        const config = JSON.parse(trimmed);
        if (config && Array.isArray(config.scenes) && config.scenes.length > 0) {
          config.scenes.forEach(sc => {
            if (sc && sc.id) {
              SceneRegistry.register(sc.id, sc);
            }
          });
          return config;
        }
        return null;
      } catch (err) {
        return null;
      }
    }
  };

  global.ASTScenes = scenes;
  global.ASTSceneRegistry = SceneRegistry;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scenes, SceneRegistry };
  }
})(typeof window !== 'undefined' ? window : globalThis);
