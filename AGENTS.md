# St Joseph's Curriculum Portal — AI Agent Context & Rules

## Project Architecture
- **Framework**: High-performance client-side Single Page Application (SPA) powered by **Vite 8+** (Rolldown / esbuild), **React 19**, and **React Router 7**.
- **Persistent App Shell**: The Universal Translator Bar, Persistent Navbar, and Footer are permanently mounted in `src/components/PersistentAppShell.tsx`. Route navigation occurs in-memory inside `#ast-persistent-viewport` via `<Outlet />`.
- **Styling**: Tailwind CSS & scoped CSS without heavy framework overrides. `html { scrollbar-gutter: stable; }` must be preserved to prevent Cumulative Layout Shift (CLS).
- **Static Assets**: Located in `static/` (served at `/` via Vite's `publicDir: 'static'`).
- **Build**: `npm run build` runs icon generation, Oak manifest compilation, AST bytecode generation, and `vite build` into `dist/`. Build time must remain sub-second (< 1s). Do NOT re-introduce Docusaurus or SSR build tools.

## AST Vector Player & Zero-Bloat Fantasy Engine
- **Decoupled Engine Core**: Located in `static/player/` (`ast-engine.js`, `ast-scenes.js`, `ast-gestures.js`, `ast-phet-bridge.js`, `player-ui.js`).
- **Zero-Bloat Invariant**: Engine runtime is strictly < 35 KB gzipped (< 150 KB uncompressed) with 0 external runtime dependencies. Sub-15 ms cold start, < 8 MB RAM footprint.
- **WASM Linear Memory Contract**:
  - Operates within a strictly fixed 7-page (448 KB) WASM linear memory pool (`docs/WASM_ARCHITECTURE_CONTRACT.md`).
  - Zero dynamic heap allocation (`new Object`, closures, array spreads) during hot 60 FPS animation/physics loops.
  - Structure of Arrays (SoA) layout for kinetic particles, rigid bodies, and 3D projected vertices.
- **Cartridge Formats & Binary Bytecode (`.astb`)**:
  - Dual delivery: Companion pairs (`.svg` + `.ast`) or living single-file capsules (`.ast.svg`).
  - Pre-compiled binary bytecode (`.astb` via `scripts/compile-ast-bytecode.ts`) enabling sub-0.2 ms instant deserialization and zero GC pause on low-spec hardware.
- **Architectural Superiority Over PhET**:
  - **70× Lighter Footprint**: < 35 KB gzipped runtime vs PhET's 2,000–5,000 KB monolithic Scenery/Kite/Dot bundle.
  - **Cold Start & Memory**: < 15 ms boot time, < 8 MB RAM vs PhET's 1,200–2,500 ms boot time, 45–90 MB RAM.
  - **On-Device Edge AI Generation**: Declarative S-Expressions allow Gemini Nano to generate working simulations in ~500 ms.
  - **Classroom Smartboard / Stylus Whiteboard**: Native in-stage quadratic Bézier ink layer (`#annotation-ink-root`) for Promethean, SMART, ViewSonic & iPad pens.
- **Dual-Mode Execution**:
  - **Narrative Motion**: 60 FPS keyframed vector timeline, bilingual English/Spanish/Latin subtitles, and formative pause checkpoints.
  - **Direct In-Stage Grab & Drag (`ast-gestures.js`)**: Real-time pointer capture on live SVG elements with sub-pixel inverse CTM coordinate translation.
- **Pedagogical X-Ray & Sonification**: `data-pedagogical` discovery inspection with real-time procedural Web Audio synthesis (0 KB external audio files).
- **17+ Production Curriculum Scenes**: `calculus-curves`, `kinetic-gas`, `church-tour`, `electric-circuits`, `math-fishing`, `mountain-elevation`, `fish-tank`, `fractions`, `solar-system`, `photosynthesis`, `pythagoras`, `water-cycle`, `atom`, `velocity`, `dna-helix`, `bodmas`, `phonics-lab`, `times-tables`.

## Real-Time "In-Vision" BSL / Makaton Vector Interpreter
- **Zero-Video Architectural Invariant**: Pure procedural SVG skeletal vector avatar running client-side at 60 FPS (< 15 KB uncompressed, 0 external video feeds, 0 MB video streaming bills).
- **BSL Level 6 Linguistic Syntax Engine**:
  - **10-Point 3D Spatial Register Grid**: Codified spatial loci (`LOCUS_A` through `LOCUS_F`, `LOCUS_HIGH`, `LOCUS_LOW`) driving directional agreement verbs ($\vec{v}(t) = \vec{L}_{dest} - \vec{L}_{src}$).
  - **Polycomponential Classifiers**: Handshape predicates for bipedal locomotion (`proform-v`), flat surfaces (`proform-b`), cylindrical vessels (`proform-c`), and sacred/scholarly handling (`handling-book`, `handling-cup`).
  - **Constructed Action & Role-Shift**: Dynamic $\pm 15^\circ$ to $20^\circ$ torso yaw and head tilt during direct discourse markers.
  - **Adverbial Non-Manual Features (NMFs)**: Synchronized facial mouth morphemes (`mm`, `th`, `tight-lips`, `puffed-cheeks`).
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
  - **Tier 1**: Native Chromium Prompt API / Gemini Nano via `window.LanguageModel` or `self.LanguageModel` (`src/engine/aicaller.ts`). Legacy `window.ai` namespace is retired.
  - **Tier 2**: WebLLM compute pipeline (`@mlc-ai/web-llm`) with automated device memory guard (`deviceMemory < 4GB`, iOS Jetsam mitigation).
  - **Tier 3**: Local deterministic Socratic rule synthesizer (< 5 ms, 0 GPU allocations, 0 bps bandwidth).
- **Offline Mesh & Flash Memory Wear Guard**:
  - **Milestone-Gated Persistence**: 0 disk writes during active simulation loops; writes are batched and debounced to pedagogical checkpoints to protect cheap eMMC flash chips.
  - **P2P Air-Gapped Sync**: WebRTC classroom beacon data channels and high-density animated QR codes for optical sneakernet cartridge transfer without internet access.
  - **Storage Architecture**: IndexedDB storage (`cartridges_vault` and `ast_bank`) in `src/services/dbStore.ts` replacing synchronous `localStorage`.