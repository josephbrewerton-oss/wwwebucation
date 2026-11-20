# St Joseph's Curriculum Portal — AI Agent Context & Rules

## Project Architecture
- **Deployment Mission Mandate (Developing World, Low-Connectivity Areas, Schools & Prisons)**:
  - This platform is engineered for **developing-world classrooms, rural/low-connectivity areas, bandwidth-constrained schools, and air-gapped environments such as prisons**.
  - **Zero Unnecessary Web Resources on Initial Download**: NEVER load external CDNs, third-party fonts, analytics, video streams, heavy framework runtimes, or non-essential assets on initial page load. Every byte in the initial download must be strictly necessary to boot (< 20 KB gzipped critical SPA shell).
  - **Self-Contained & Air-Gap Ready**: All audio (procedural Web Audio), BSL/Makaton interpretation (procedural SVG skeletal avatar), interactive simulations/storybooks (`.ast`/`.astb` + inline SVG), and on-device Eco Mode rules must work 100% offline with zero external network calls once cached or delivered via local mesh / QR sneakernet.
  - **Verified Data & Online-Use Savings (Measured vs. Conventional EdTech)**:
    - *Initial Boot Shell*: **~28.1 KB total gzipped** (`19.2 KB` JS + `5.8 KB` CSS + `3.1 KB` HTML; 0 third-party requests) vs. `2.5–8 MB` for a typical React/Next.js portal (**~99% smaller**; boots in < 1s on 2G/50 kbps links).
    - *Complete 77-Module Curriculum*: **~319 KB total gzipped** (`137 KB` `.astb` bytecode + `182 KB` `.svg` stages — **~4.1 KB avg/module**, **~6.1 KB** per 5-page illustrated decodable book) vs. `150–400 MB` for 77 conventional HTML5/PhET/SCORM modules (**> 99.8% smaller**).
    - *Player Engine + Gesture VM + BSL Interpreter*: **~223 KB total gzipped** (`122.4 KB` engine + `31.3 KB` gesture VM + `2.0 KB` `player-gestures.ast` + `~64 KB` vector BSL avatar & lexicon; 0 KB external audio/video) vs. `150–300 MB` per 30-min streamed BSL video lesson (**~99.97% smaller**).
    - *Entire Platform Cached Once (~570 KB gzipped total) -> **0 bytes/session ongoing online use***: Eliminates recurring mobile-data / satellite / WAN bandwidth (saving **50–150 GB/month per 30-student classroom** and enabling 100% air-gapped prison and rural school operation).
- **Framework**: High-performance client-side Single Page Application (SPA) powered by **Vite `^8.3.6`** (Rolldown / esbuild `^0.28.1`), **TypeScript `^5.6.3` (Native Web Standards / Zero React)**, and a lightweight native micro-router (`src/router.ts`).
- **Discrete Subsystems (0-Dependency Developing-World Teaching Aid)**: The Host Portal SPA (`src/`), AST Vector Player Engine & Gesture VM (`static/player/`, v2.6.0), and Procedural BSL/Makaton In-Vision Avatar (`src/components/NativeBslInterpreter.ts` + `static/lexicons/bsl-signs.ast`) are strictly decoupled architectural parts communicating via `postMessage` and reactive stores (`bslGlobalStore`).
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
- **Decoupled Engine Core**: Located in `static/player/` (`ast-engine.js`, `ast-registry.js`, `ast-state-hex.js`, `site-gestures.js`, `player-gestures.ast`, `ast-phet-bridge.js`, `ast-compiler.js`, `ast-webrtc-bus.js`, `obs-controller.js`, `player-ui.js`; legacy `ast-gestures.js` retained on disk only for historical invariant tests).
- **Zero-Bloat Invariant**: Initial SPA boot bundle < 20 KB gzipped (verified ~16.3 kB JS + ~5.9 kB CSS). Core AST Player kernel (`static/player/ast-engine.js`) with embedded sub-stepped physics, `:scope` plotter, `:ledger`, & profiler is ~107 KB gzipped with 0 external runtime dependencies, sub-15 ms cold start, and < 8 MB RAM footprint.
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
  - **20–45× Lighter Footprint**: ~107 KB gzipped all-in VM runtime (16.3 kB SPA shell) vs PhET's 2,000–5,000 KB monolithic Scenery/Kite/Dot bundle.
  - **Cold Start & Memory**: < 15 ms boot time, < 8 MB RAM vs PhET's 1,200–2,500 ms boot time, 45–90 MB RAM.
  - **On-Device Edge AI Generation**: Declarative S-Expressions allow Gemini Nano to generate working simulations in ~500 ms.
  - **Classroom Smartboard / Stylus Whiteboard**: Native in-stage quadratic Bézier ink layer (`#annotation-ink-root`) for Promethean, SMART, ViewSonic & iPad pens.
- **Tri-Mode Execution Engine**:
  - `:Sim` *(Continuous Dynamic State)*: Real-time kinematics locked to a 60 FPS $\Delta t$ clock with pointer grab/drag via `site-gestures.js`.
  - `:Slide` *(Discrete Exploratory Decks)*: Decoupled clock for self-paced reading, CST virtues, and rubrics.
  - `:Film` *(Linear Narrative Choreography)*: Monotonically locked time curves ($t \in [0.0, 1.0]$) with synchronized audio synthesis and multilingual subtitles.
- **Pedagogical X-Ray, Sonification & Performance Diagnostics**:
  - `data-pedagogical` discovery inspection with real-time procedural Web Audio synthesis (0 KB external audio files), configured via `player-gestures.ast` `:sonification`.
  - Native in-stage `ASTProfiler` HUD (`SET_PERF_HUD`, `TOGGLE_PERF_HUD`, `?hud=1`) with live rolling sparkline, sub-0.2 ms VM compute measurement, and frame budget headroom.
  - Dedicated `⚡ Diagnostics` drawer in `src/pages/media-player.ts` tracking 60 FPS headroom and WASM 7-page memory pool status.
- **AST-Led Zero-JS Driver & Reusable Skill Architecture (`player-gestures.ast` + `site-gestures.js` + `nanoSiteManager.ts`)**:
  - **Inverted AST-Led Principle (Built for Gemini Nano)**: Unlike conventional web apps, **cartridges and AST profiles are the pure, zero-JS declarative drivers**, while **all JavaScript execution mechanics live in the two gesture/action layers** — the Player Gesture VM (`static/player/player-gestures.ast` + `static/player/site-gestures.js`) and the Site Gesture/Control Plane (`static/player/site-gestures.js` + `src/engine/nanoSiteManager.ts`). NEVER embed inline JS snippets (`:expr "var ..."`, `el.getAttribute(...)`, etc.) in new skills or cartridges when a declarative AST action belongs in the JS gesture runtime — keeping AST pure lets Gemini Nano read, reason about, and author interactions cleanly in minimal tokens.
  - **Pure Generic VM**: `static/player/ast-engine.js` and `static/player/site-gestures.js` operate as a 100% generic, schema-driven Virtual Machine. NEVER hardcode scene IDs or cartridge-specific element selectors inside engine/gesture code.
  - **Declarative Reusable Player Skills (`:skills` / `:use-skill`)**: Reusable interaction bundles (such as `storybook-reader`) live declaratively inside `static/player/player-gestures.ast` `(:skills (:skill :id "..." ...))` with parameterized `{{param}}` templates, skill-level `(:controls ...)`, and zero-JS declarative gestures. Cartridges activate them cleanly in one line via `(:use-skill "<id>" :pages N ...)` (parsed by `ast-engine.js` into `scene.skills` and expanded generically by `site-gestures.js`, with cartridge `(:controls ...)` overriding skill defaults).
  - **Zero-JS Declarative Action Vocabulary**: Native JS handlers in `site-gestures.js` execute `:action "step-slide"`, `:action "goto-slide"`, `:from-attr`, `:speak-var`, `:fallback-var`, `:speak-attr`, `:clear-var`, `:reset-var`, `:reset-val`, `:toggle-var`, `:set-var`, `:step-var`, `:hold-var`, `:release-val`, `:delta`, `:rate`, `:attr`, plus extensible `ASTDirectGestureSubsystem.registerAction(name, fn)` and `registerGestureSkill(type, spec)` hooks (introspectable via `getCapabilities()`). Platform switches (`:arrow-step`, `:num-jump`, `:scrub`, `:space-play`, `:quiz-keys`, `:whiteboard`, `:xray`, `:audio`, `:param-hud`), universal keyboard rules, whiteboard tools/palette, and tones live in `player-gestures.ast` and merge with skill + cartridge `(:controls ...)` overrides.
  - **Hypervisor-Gated Site Directive Bridge (Closed Circle)**: The Host Hypervisor (`src/engine/nanoSiteManager.ts` + `src/pages/media-player.ts`) remains strictly in charge — neither Gemini Nano nor AST cartridges hold raw DOM/JS authority. Both Nano (via WebMCP) and any AST cartridge (via declarative `:action "navigate"`, `"load-cartridge"`, `"toggle-bsl"`, `"toggle-sound"`, `"open-tutor"`, `"set-render-mode"`, `"site-directive"` emitting `SITE_DIRECTIVE` from `site-gestures.js`) invoke the exact same allowlisted `dispatchCartridgeSiteDirective()` → `executeSiteDirective()` gatekeeper (with strict route allowlist, slug validation, and `e.source` iframe verification).
- **Interactive System Architecture Document**: `static/docs/lumina-architecture.ast` is a hybrid SVG + S-expression `:type "Slide"` Show & Tell Manifesto, playable via `/player?preset=lumina-architecture` or `?src=/docs/lumina-architecture.ast`.
- **Canonical Curriculum Cartridges (77 Compiled Modules)**:
  - *STEM, Computing & Design & Technology*: `lego-blocks` (Modular Brick Engineering & 3D Spatial Geometry), `vector-racing` (Continuous Press-and-Hold Kinematic Driving), `rates-of-reaction`, `acid-alkali-titration`, `enzyme-denaturation`, `osmosis-membrane`, `calculus-curves`, `kinetic-gas`, `electric-circuits`, `math-fishing`, `mountain-elevation`, `fish-tank`, `fractions`, `solar-system`, `photosynthesis`, `pythagoras`, `water-cycle`, `atom`, `velocity`, `dna-helix`, `bodmas`, `phonics-lab`, `times-tables`, `bbc-model-b`, `inverted-pendulum-dyno`, `algebra-balance`, `domino-multiplication`, `phonics-screening`, `spelling-bee`.
  - *Decodable Phonics Storybooks (Powered by `(:use-skill "storybook-reader" :pages 5)`)*: `reader-pat-sat`, `reader-red-dog`, `reader-ship-rain`, `reader-frog-log`, `reader-cake-lake`.
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
- **Language Codification**: Defined in `docs/AST_PLAYER_SPECIFICATION.md` and `static/player/schema/ast-scene.schema.json` (with WebLLM XGrammar structured decoding via `@mlc-ai/web-llm`).
- **Declarative Nodes**:
  - Metadata: `:scene`, `:id`, `:title`, `:stage`, `:duration`, `:easing`, `:type` ("Sim" | "Slide" | "App" | "Film")
  - Video Driving: `:video`, `:video-fit` ("contain" | "cover" | "fill")
  - Camera & 3D: `:camera`, `:3d-node`, `:3d-line`, `:3d-ring`, `:3d-polygon`
  - Reactive Bindings & Inputs: `:vars`, `:inputs`, `:computed`, `:bindings`, `:bind-inputs`
  - State Machines & Emitters: `:state-machine`, `:state`, `:transition`, `:emitter`, `:particle-pool`
  - Formative Assessment: `:interactive`, `:checkpoint`, `:prompt`, `:options`, `:answer`, `:explanation`
  - Direct Manipulation, Feature Switches, Reusable Skills & Gesture VM: `:use-skill`, `:skills`, `:skill`, `:controls` (`:arrow-step`, `:num-jump`, `:scrub`, `:space-play`, `:quiz-keys`, `:whiteboard`, `:xray`, `:audio`, `:param-hud`), `:gestures`, `:draggable`, `:clickable`, `:holdable`, `:key`, `:trackball`, `:rotatable`, `:action` (`"step-slide"` | `"goto-slide"` | registered actions), `:count`, `:from-attr`, `:speak-var`, `:fallback-var`, `:speak-attr`, `:clear-var`, `:reset-var`, `:reset-val`, `:axis`, `:min`, `:max`, `:step-var`, `:hold-var`, `:set-var`, `:toggle-var`, `:release-val`, `:delta`, `:rate`, `:if`, `:speak-rate-var`, `:speak-pitch`, `:attr` (legacy `:val-expr`, `:tone-expr`, `:speak-expr` retained for backward compatibility only — prefer zero-JS declarative actions)

## On-Device Edge AI & Developing-World Offline Invariants
- **Zero Cloud Leakage**: Student logs, answers, and voice inputs never egress to cloud LLMs (UK GDPR Art. 25, KCSIE, CAADCA/SOPIPA & DPDP Sec 5(3) compliant).
- **Default Eco Mode & Passive Nano Availability Detection (`src/engine/nanoAvailability.ts`)**:
  - Defaults to **Eco Mode** (`0 MB` download, `0 W` GPU draw, pre-compiled deterministic curriculum rules) until explicit local consent (`ai_model_download_consent` in IndexedDB).
  - Passively probes `window.LanguageModel.availability()` / `self.LanguageModel.availability()` during `requestIdleCallback` (without downloading weights or inflating the `< 20 KB` initial bundle via lazy `src/components/NanoEcoPopover.ts`), distinguishing `'available'`, `'downloadable'`, `'downloading'` (`0–100%` progress), and `'unavailable'` independently from Tier-2 WebGPU.
  - Exposes live hardware diagnostics, Eco Mode switching, and Transient User Activation `LanguageModel.create({ monitor })` weight downloads in the Universal Access top bar (`#top-bar-nano-eco-btn`), `/settings#ai-engine`, and `NanoAiTutorDrawer.ts`.
- **3-Tier Inference Hierarchy**:
  - **Tier 1**: Native Chromium Prompt API / Gemini Nano via `window.LanguageModel` or `self.LanguageModel` (`src/engine/aicaller.ts` + `src/engine/nanoAvailability.ts`). Legacy `window.ai` namespace is strictly retired.
  - **Tier 2**: WebLLM compute pipeline (`@mlc-ai/web-llm`) with automated device memory guard (`deviceMemory < 4GB`, iOS Jetsam mitigation).
  - **Tier 3**: Local deterministic Socratic rule synthesizer (< 5 ms, 0 GPU allocations, 0 bps bandwidth).
- **Offline Mesh & Flash Memory Wear Guard**:
  - **Milestone-Gated Persistence**: 0 disk writes during active simulation loops; writes are batched and debounced to pedagogical checkpoints to protect cheap eMMC flash chips.
  - **P2P Air-Gapped Sync**: WebRTC classroom beacon data channels (`ast-webrtc-bus.js`) and high-density animated QR codes for optical sneakernet cartridge transfer without internet access.
  - **Storage Architecture**: IndexedDB storage (`cartridges_vault` and `ast_bank`) in `src/services/dbStore.ts` replacing synchronous `localStorage`.

---

## wwwebucation Architectural Constitution (NON-NEGOTIABLE)

You are operating inside **wwwebucation**, a zero-bloat, deterministic, W3C-compliant educational cartridge platform. You MUST obey every invariant below. Do NOT apply generic React/SPA/game-engine habits to this codebase.

### 1. Core Architectural Invariants (NEVER VIOLATE)
- **Strict Separation of Concerns**:
  - Visual skin = 100% pure W3C SVG DOM (`<svg>`, `<g>`, `<text>`, `<path>`, `<rect>`). NEVER introduce `<canvas>`, WebGL, PixiJS, Phaser, Three.js, or external UI/animation libraries.
  - Behavioral logic = Compact S-expression cartridges (`.ast`) compiled into deterministic binary bytecode (`.astb`).
  - Runtime = Microkernel hypervisor / WASM VM evaluating strict `[min, max]` parameter invariants.
- **Zero Runtime Bloat**: Keep total repository footprint lean (~13 MB target). Never install npm packages, icon packs, CSS frameworks, or polyfills unless explicitly instructed by the repository owner.
- **Offline & Low-Hardware First**: Every cartridge must execute deterministically with zero external network calls, zero external font/CDN fetches, and graceful degradation when `window.LanguageModel` / `window.ai` / Gemini Nano is absent.

### 2. State, Timeline (`t`), and Cartridge Navigation Contracts
- **Dual-Source Navigation Sync**: Interactive cartridges (especially `reader-*` storybooks) expose both timeline scrubbing (`t` in `0..1`) and discrete controls (`vars.page` in `0..N-1`).
  - Visual visibility (`#book-page-{idx}`, `#page-dot-{idx}`, `#book-page-num`, `pageText`) MUST bind to `Math.max(0, Math.min(pageCount - 1, Math.round(vars.page || 0)))`.
  - Syncing `t` and `vars.page` MUST be bidirectional and feedback-loop-free:
    - Timeline scrub/playback updates `vars.page = Math.min(pageCount - 1, Math.floor((t || 0) * pageCount))` ONLY when `t` changes from scrubber/playback.
    - User controls (Next/Prev, Page Dots, Arrow keys, `Turn Page` input) update `vars.page` (clamped `0..pageCount-1`) and seek `t = vars.page / (pageCount - 1)`.
- **Build Pipeline Integrity**: Whenever modifying cartridge generators (`scripts/generate-reader-books.ts`) or `.ast` sources, ALWAYS re-run the generator and recompile `.astb` bytecode so committed binaries match source definitions.

### 3. Accessibility & W3C DOM Standards
- **Screen-Reader Safety**:
  - Inactive spreads/pages (`#book-page-{idx}`) MUST use `display="none"` (never `opacity="0"` alone) so assistive technologies do not read hidden spreads aloud.
  - Purely decorative shapes and sound-button dots/dashes MUST carry `aria-hidden="true"`.
  - Interactive SVG `<g>` controls (Next/Prev, word tiles, page dots) MUST include `role="button"`, `tabindex="0"`, and descriptive `aria-label` attributes.

### 4. UK DfE Phonics & Pedagogy Contracts
- **Greedy Grapheme Segmentation (`decodeWordForReader`)**: Always match UK DfE Phase 3/5 digraphs and trigraphs (`ai`, `ee`, `igh`, `oa`, `oo`, `ar`, `or`, `ur`, `ow`, `oi`, `ear`, `air`, `ure`, `er`, `ay`, `ou`, `ie`, `ea`, `oy`, `ir`, `ue`, `aw`, `wh`, `ph`, `ew`, `oe`, `au`) greedily BEFORE single-letter graphemes. Never split vowel digraphs into individual dots.
- **Punctuation Isolation**: Sound-button widths and dot/dash spans (`renderBookPageWordsSvg`) MUST be calculated strictly from `decoded.cleanWord.length` (excluding trailing `.`, `!`, `?`, `,`), never raw token length.

### 5. GitHub Pages Deployment & SEO Rules
- **Subdirectory Base Path**: Production deploys to `https://josephbrewerton-oss.github.io/wwwebucation/`. Never emit root-relative `/...` asset or sitemap paths that drop `/wwwebucation/`.
- **Launcher-First Discovery**: Cartridge entry points use clean query parameters (`?app=<cartridge-id>`), never hash fragments (`#/...`), and `public/sitemap.xml` must list full `https://josephbrewerton-oss.github.io/wwwebucation/?app=...` URLs.

### 6. Execution Protocol for AI Agents
1. **No Speculative Refactoring**: Touch ONLY the files explicitly named in the prompt. Do not rename existing IDs, `.ast` opcodes, or public cartridge slugs.
2. **Verify Before Finishing**: After any edit to `.ts` generators or `.ast` files, run the build/compile step and confirm zero TypeScript errors and updated `.astb` output.

