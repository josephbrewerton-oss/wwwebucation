# St Joseph's Curriculum Portal — AI Agent Context & Rules

## Project Architecture
- **Framework**: High-performance client-side Single Page Application (SPA) powered by **Vite 8+** (Rolldown / esbuild), **Native Web Standards / TypeScript (Zero React)**, and a lightweight native micro-router (`src/router.ts`).
- **Persistent App Shell**: The Universal Translator Bar, Persistent Navbar, and Footer are permanently mounted in `src/components/PersistentAppShell.ts` as `<app-shell>`. Route navigation occurs in-memory inside `#ast-persistent-viewport` via `#page-outlet`.
- **Styling**: Tailwind CSS & scoped CSS without heavy framework overrides. `html { scrollbar-gutter: stable; }` must be preserved to prevent Cumulative Layout Shift (CLS).
- **Static Assets**: Located in `static/` (served at `/` via Vite's `publicDir: 'static'`).
- **Build & Verification**: `npm run build` runs icon generation, Oak manifest compilation, AST bytecode generation, and `vite build` into `dist/`. Build time must remain sub-second (< 1s). Do NOT re-introduce Docusaurus, React, or SSR build tools.
- **Mobile PageSpeed & Zero-Forced-Reflow Invariant**:
  - Never query geometric properties (`offsetWidth`, `getBoundingClientRect`, `scrollIntoView`, `scrollTo`) synchronously in the same callstack after modifying the DOM.
  - On page boot, the browser viewport is already at `(0, 0)`; never call `window.scrollTo` on initial load. All route-change scroll adjustments must be deferred to `requestAnimationFrame` with a `window.scrollY` offset check.
  - Non-critical iframes (e.g., `#neural-worker-guest-vm`) and AI hypervisor scripts must be loaded during idle via `requestIdleCallback`.
  - Heavy on-demand chunks (`bsl-engine`, `cartridge-vault`, `vendor-webllm`, `hypervisor`) are strictly excluded from `<link rel="modulepreload">` in the HTML entry point to keep initial mobile downloads < 20 KB gzipped.
- **Verification Invariants**: Test suites must pass cleanly:
  - `npm run test:ast` (End-to-End AST & Manifest determinism)
  - `npm run test:simulations` (Cross-subject simulation engine)
  - `npm run test:invariants` (Physical engine invariants & frame budget)
  - `npm run test:ink` (Smartboard ink serialization)
  - `npm run test:bsl` (BSL Level 6 avatar kinematics & spatial grammar)

## AST Vector Player & Zero-Bloat Fantasy Engine
- **Decoupled Engine Core**: Located in `static/player/` (`ast-engine.js`, `ast-registry.js`, `ast-state-hex.js`, `ast-gestures.js`, `ast-phet-bridge.js`, `ast-compiler.js`, `ast-webrtc-bus.js`, `obs-controller.js`, `player-ui.js`).
- **Zero-Bloat Invariant**: Engine runtime is strictly < 35 KB gzipped (< 150 KB uncompressed) with 0 external runtime dependencies. Sub-15 ms cold start, < 8 MB RAM footprint.
- **WASM Linear Memory Contract**:
  - Operates within a strictly fixed 7-page (448 KB) WASM linear memory pool (`docs/WASM_ARCHITECTURE_CONTRACT.md`).
  - Zero dynamic heap allocation (`new Object`, closures, array spreads) during hot 60 FPS animation/physics loops.
  - Structure of Arrays (SoA) layout for kinetic particles, rigid bodies, and 3D projected vertices.
- **Negative-Space Compound Vectorization & Single-Matrix Kinematics**:
  - Compound paths with winding rules (`fill-rule: evenodd`) carve mechanical voids, apertures, instrument bezels, and hollow friction tubes into a single DOM element (eliminating overdraw and cutting DOM nodes by 40–80%).
  - Single-Cycle FMA Math Compiler (`astMathCompiler.ts` & `ast-engine.js` lines 7586–7608) compiles linear affine motion directly into pre-allocated 6-float matrix buffers (`matrix(a,b,c,d,e,f)`), moving positive solids and negative-space voids simultaneously with zero dynamic heap allocations.
  - Moving the negative-space aperture/stencil instead of animating thousands of individual particles, reducing frame execution time to strictly < 0.1 ms.
- **Cartridge Formats & Binary Bytecode (`.astb` / `.astbs`)**:
  - Dual delivery: Companion pairs (`.svg` + `.ast`) or living single-file capsules (`.ast.svg`).
  - Pre-compiled binary bytecode (`.astb` and `.astbs` data packs via `scripts/compile-ast-bytecode.ts`) enabling sub-0.2 ms instant deserialization and zero GC pause on low-spec hardware.
  - Verified against `cartridge-checksums.json` and indexed in `scenes.manifest.json`.
- **Architectural Superiority Over PhET**:
  - **70× Lighter Footprint**: < 35 KB gzipped runtime vs PhET's 2,000–5,000 KB monolithic Scenery/Kite/Dot bundle.
  - **Cold Start & Memory**: < 15 ms boot time, < 8 MB RAM vs PhET's 1,200–2,500 ms boot time, 45–90 MB RAM.
  - **On-Device Edge AI Generation**: Declarative S-Expressions allow Gemini Nano to generate working simulations in ~500 ms.
  - **Classroom Smartboard / Stylus Whiteboard**: Native in-stage quadratic Bézier ink layer (`#annotation-ink-root`) for Promethean, SMART, ViewSonic & iPad pens.
- **Tri-Mode Execution Engine**:
  - `:Sim` *(Continuous Dynamic State)*: Real-time kinematics locked to a 60 FPS $\Delta t$ clock with pointer grab/drag via `ast-gestures.js`.
  - `:Slide` *(Discrete Exploratory Decks)*: Decoupled clock for self-paced reading, CST virtues, and rubrics.
  - `:Film` *(Linear Narrative Choreography)*: Monotonically locked time curves ($t \in [0.0, 1.0]$) with synchronized audio synthesis and multilingual subtitles.
- **Pedagogical X-Ray, Sonification & Performance Diagnostics**:
  - `data-pedagogical` discovery inspection with real-time procedural Web Audio synthesis (0 KB external audio files).
  - Native in-stage `ASTProfiler` HUD (`SET_PERF_HUD`, `TOGGLE_PERF_HUD`, `?hud=1`) with live rolling sparkline, sub-0.2 ms VM compute measurement, and frame budget headroom.
  - Dedicated `⚡ Diagnostics` drawer in `src/pages/media-player.ts` tracking 60 FPS headroom and WASM 7-page memory pool status.
- **Canonical Curriculum Cartridges (67 Compiled Modules)**:
  - *STEM, Computing & Design & Technology*: `lego-blocks` (Modular Brick Engineering & 3D Spatial Geometry), `calculus-curves`, `kinetic-gas`, `electric-circuits`, `math-fishing`, `mountain-elevation`, `fish-tank`, `fractions`, `solar-system`, `photosynthesis`, `pythagoras`, `water-cycle`, `atom`, `velocity`, `dna-helix`, `bodmas`, `phonics-lab`, `times-tables`, `bbc-model-b`, `inverted-pendulum-dyno`, `algebra-balance`, `domino-multiplication`, `phonics-screening`, `spelling-bee`.
  - *Humanities, Language & Formation*: `bsl-fingerspelling`, `church-tour`, `altar-anatomy`, `order-of-the-mass`, `seven-sacraments`, `catholic-rites`, `liturgical-calendar`, `liturgical-postures`, `liturgy-of-the-hours`, `first-communion`, `holy-oils`, `holy-water-thurifer`, `nicene-creed`, `cst-virtues`, `rosary-mysteries`, `stations-of-the-cross`, `ten-commandments`, `latin-mass-prayers`, `shakespeare-macbeth`, `shakespeare`, `triduum-easter`, `sacred-objects`, `languages`, `eucharistic-procession-film`.

## Real-Time "In-Vision" BSL / Makaton Vector Interpreter
- **Zero-Video Architectural Invariant**: Pure procedural SVG skeletal vector avatar running client-side at 60 FPS (< 15 KB uncompressed, 0 external video feeds, 0 MB video streaming bills).
- **BSL Level 6 Linguistic Syntax Engine**:
  - **10-Point 3D Spatial Register Grid**: Codified spatial loci (`LOCUS_A` through `LOCUS_F`, `LOCUS_HIGH`, `LOCUS_LOW`) driving directional agreement verbs ($\vec{v}(t) = \vec{L}_{dest} - \vec{L}_{src}$).
  - **Polycomponential Classifiers**: Handshape predicates for bipedal locomotion (`proform-v`), flat surfaces (`proform-b`), cylindrical vessels (`proform-c`), single-entity paths (`proform-1`), and sacred/scholarly handling (`handling-book`, `handling-cup`, `handling-pen`).
  - **Aspectual Modulators**: Durative, intensive, habitual, and inceptive kinematic cadence inflections.
  - **Constructed Action & Role-Shift**: Dynamic $\pm 15^\circ$ to $20^\circ$ torso yaw and head tilt during direct discourse markers (`:role-shift`).
  - **Adverbial Non-Manual Features (NMFs)**: Synchronized facial mouth morphemes (`mm`, `th`, `tight-lips`, `puffed-cheeks`, `pursed`, `f-mouth`).
- **Ergonomics & Deaf Cultural Standards**:
  - Stylized high-contrast vector silhouette with dark charcoal/navy interpreter shirt (`#0f172a`–`#1e293b`) for maximum signing box legibility without uncanny-valley CGI eye strain.
  - Dual-perspective camera toggling: **Signer POV** (first-person acquisition) and **Receiver POV** (conversational front view).
  - Native browser Picture-in-Picture (`documentPictureInPicture`) uncoupling for multi-monitor, whiteboard, and split-screen instruction.

## AST Language Grammar & S-Expression Specification
- **Language Codification**: Defined in `docs/AST_PLAYER_SPECIFICATION.md` and constrained by GGML grammars in `static/player/grammar/ast-sexpr.gbnf` and `ast-scene.gbnf`.
- **Declarative Nodes**:
  - Metadata: `:scene`, `:id`, `:title`, `:stage`, `:duration`, `:easing`, `:type` ("Sim" | "Slide" | "App" | "Film")
  - Video Driving: `:video`, `:video-fit` ("contain" | "cover" | "fill")
  - Camera & 3D: `:camera`, `:3d-node`, `:3d-line`, `:3d-ring`, `:3d-polygon`
  - Reactive Bindings & Inputs: `:vars`, `:inputs`, `:computed`, `:bindings`, `:bind-inputs`
  - State Machines & Emitters: `:state-machine`, `:state`, `:transition`, `:emitter`, `:particle-pool`
  - Formative Assessment: `:interactive`, `:checkpoint`, `:prompt`, `:options`, `:answer`, `:explanation`
  - Direct Manipulation: `:gestures`, `:draggable`, `:axis`, `:min`, `:max`

## On-Device Edge AI & Developing-World Offline Invariants
- **Zero Cloud Leakage**: Student logs, answers, and voice inputs never egress to cloud LLMs (UK GDPR Art. 25 & KCSIE compliant).
- **3-Tier Inference Hierarchy**:
  - **Tier 1**: Native Chromium Prompt API / Gemini Nano via `window.LanguageModel` or `self.LanguageModel` (`src/engine/aicaller.ts`). Legacy `window.ai` namespace is strictly retired.
  - **Tier 2**: WebLLM compute pipeline (`@mlc-ai/web-llm`) with automated device memory guard (`deviceMemory < 4GB`, iOS Jetsam mitigation).
  - **Tier 3**: Local deterministic Socratic rule synthesizer (< 5 ms, 0 GPU allocations, 0 bps bandwidth).
- **Offline Mesh & Flash Memory Wear Guard**:
  - **Milestone-Gated Persistence**: 0 disk writes during active simulation loops; writes are batched and debounced to pedagogical checkpoints to protect cheap eMMC flash chips.
  - **P2P Air-Gapped Sync**: WebRTC classroom beacon data channels (`ast-webrtc-bus.js`) and high-density animated QR codes for optical sneakernet cartridge transfer without internet access.
  - **Storage Architecture**: IndexedDB storage (`cartridges_vault` and `ast_bank`) in `src/services/dbStore.ts` replacing synchronous `localStorage`.
