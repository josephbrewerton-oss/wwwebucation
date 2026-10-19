# Roadmap & Technical Specification: Gemini Nano × AST Vector Player Co-Pilot (Beta)

> **Document Status**: Draft / Proposed Beta Specification  
> **Target Subsystem**: `src/engine/aicaller.ts` ↔ `static/player/ast-engine.js`  
> **Privacy Invariant**: 100% On-Device Local Inference (Zero Cloud Telemetry / Children's Code Compliant)  
> **Author**: St Joseph's Curriculum Engineering Team  

---

## 1. Executive Vision

Current educational AI systems suffer from a severe limitation: **they can tell, but they cannot show**. When a student asks a visual, spatial, or mathematical question (e.g., *"Why does the denominator change when adding $\frac{1}{2}$ and $\frac{1}{4}$?"*), cloud chatbots respond with walls of abstract text.

This project possesses two unique architectural assets:
1. **Gemini Nano On-Device Inference (`aicaller.ts`)**: Fast, token-efficient, zero-cost, zero-cloud local reasoning running in the pupil's browser.
2. **AST Vector Motion Player (`static/player/`)**: A 60 FPS parametric vector rendering engine driven entirely by concise mathematical S-Expressions.

By bridging them through a sandboxed, bidirectional RPC protocol, Gemini Nano gains **"physical hands on the classroom whiteboard"**. It can dynamically scrub simulations, pulse geometric elements, slow down critical physics frames, and demonstrate concepts visually while narrating through Web Speech.

---

## 2. Core Architecture & Interaction Loop

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HOST APPLICATION (React)                        │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                 Gemini Nano (Chrome Prompt API)              │     │
│   │   - System Prompt with AST Action Grammar                    │     │
│   │   - Context Window: Active Topic + 30-token Manipulative State│    │
│   └──────────────────────────────▲───────────────────────────────┘     │
│                                  │                                     │
│                     1. Telemetry │ 2. Sanitized                        │
│                        Snapshot  │    Action Tuples                    │
│                                  │                                     │
│   ┌──────────────────────────────┴───────────────────────────────┐     │
│   │               AiPlayerBridge (`src/engine/`)                 │     │
│   │   - Tokenizer & S-Expression Validator                      │     │
│   │   - Child Safety Filter (`childSafetyFilter.ts`)             │     │
│   │   - PostMessage TargetOrigin Security Guard                  │     │
│   └──────────────────────────────▲───────────────────────────────┘     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ postMessage (Same-Origin / Sandbox)
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    AST VECTOR PLAYER (Sandboxed iFrame)                │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                 ast-engine.js / player-ui.js                 │     │
│   │   - Visual Tweener (smooth scrub to target progress)         │     │
│   │   - SVG Spotlight / Halo Glow Shader                         │     │
│   │   - Web Speech Synthesis Synchronizer                        │     │
│   │   - Pupil Instant-Interrupt Listener (mouse/touch override)  │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Communication Protocol (RPC Specification)

### 3.1 Player Telemetry Egress (Player ➔ Host)
Whenever the student manipulates a slider, advances a step, or makes a quiz mistake, the player emits an immutable snapshot to the host:

```typescript
interface PlayerTelemetryEvent {
  type: 'PLAYER_TELEMETRY';
  sceneId: string;              // e.g. "fractions", "pythagoras", "solar-system"
  progress: number;             // Timeline progress: 0.0 to 1.0
  activeKeyframe: number;       // Current step index
  variables: Record<string, any>; // e.g. { numerator: 2, denominator: 4, whole: 1 }
  lastUserAction: string;       // e.g. "SLIDER_DRAG", "CHECKPOINT_SUBMIT", "IDLE"
  lastErrorKey?: string;        // e.g. "COMMON_DENOMINATOR_MISMATCH"
  timestamp: number;
}
```

### 3.2 AI Action Ingestion (Host ➔ Player)
Gemini Nano generates structured, token-efficient S-Expressions that are parsed by the host and posted into the player iFrame:

```typescript
type AiVisualAction = 
  | { type: 'SEEK'; targetProgress: number; durationMs?: number }
  | { type: 'HIGHLIGHT'; selector: string; pulseColor?: string; durationMs?: number }
  | { type: 'SET_VARIABLE'; variable: string; value: number | string }
  | { type: 'STEP'; stepIndex: number }
  | { type: 'ANNOTATE'; targetSelector: string; labelText: string; arrowDirection?: 'up' | 'down' | 'left' | 'right' }
  | { type: 'NARRATE'; text: string; language?: string }
  | { type: 'RESET_VIEW' };

interface AiVisualCommandPacket {
  type: 'AI_VISUAL_COMMAND';
  transactionId: string;
  actions: AiVisualAction[];
  pedagogicalIntent: 'EXPLAIN_MISCONCEPTION' | 'STEP_BY_STEP_DEMO' | 'ENCOURAGE';
}
```

---

## 4. The S-Expression Grammar for Gemini Nano

To prevent token exhaustion on low-memory NPUs, Gemini Nano is instructed using a concise Lisp-style S-Expression grammar:

```lisp
;; Grammar Definition for Nano System Prompt:
;; (:act :seek <0.0-1.0> [:highlight "<svg-id>"] [:var "<name>" <val>] [:say "<text>"])

;; Example: Correcting a fraction addition error
(:act :seek 0.50 
      :highlight "#pie-slice-split" 
      :say "Notice how one half is physically identical to two quarters.")

;; Example: Illustrating Pythagoras' Theorem
(:act :seek 0.85 
      :highlight "#hypotenuse-square" 
      :var "c_sq" 25 
      :say "The 9 yellow units plus 16 blue units fill the 25 green units completely.")
```

---

## 5. Safeguarding, Security & Performance Invariants

1. **Zero Dynamic Code Execution (No `eval` / No `<script>`)**:
   * Nano can only reference existing, whitelisted SVG IDs defined in `scenes.manifest.json`.
   * Any command containing `<`, `>`, `script`, `javascript:`, or unapproved CSS properties is silently dropped by `childSafetyFilter.ts`.
2. **Pupil Agency & Instant Interrupt**:
   * If a pupil touches the screen, moves the mouse, or presses a key while Nano is demonstrating, Nano's commands are **instantly suspended** (`PUPIL_PREEMPTION`). The pupil remains in full control.
3. **Chromebook CPU/GPU Throttling Guard**:
   * In-browser LLM inference + 60 FPS vector animation can cause thermal throttling on older Celeron/MediaTek Chromebooks.
   * **Rule**: When Nano is actively generating tokens, the vector player locks its internal clock to 30 FPS. Once generation completes, full 60–120 FPS interpolation resumes.
4. **Strict Air-Gap & Zero Cloud Egress**:
   * In accordance with `AGENTS.md` and the ICO Children's Code, all prompt generation, state inspection, and speech synthesis occur purely on `localhost` / `window.LanguageModel`.

---

## 6. Phased Implementation Roadmap

### Phase 1: Feature Flag & Storage Configuration
- [ ] Add `ai_copilot_beta: boolean` to `PlayerDisplayConfig` (`src/types/playerConfig.ts`).
- [ ] Add an experimental toggle in **Settings > Experimental Labs** and the Player toolbar (**✨ Co-Pilot [Beta]**).
- [ ] Default flag state: **OFF** (opt-in only, requires explicit teacher/pupil confirmation).

### Phase 2: Telemetry Bridge (`static/player/ast-engine.js`)
- [ ] In `ast-engine.js`, add `emitTelemetrySnapshot()` on step change and scrubber release.
- [ ] Mount `window.addEventListener('message')` handler inside the player for `AI_VISUAL_COMMAND`.
- [ ] Implement SVG glow/pulse CSS animation (`.ai-spotlight-pulse`).

### Phase 3: Gemini Nano System Prompt & Adapter (`src/engine/aicaller.ts`)
- [ ] Add `promptAiCoPilotDemonstration(telemetry, pupilQuestion)` method.
- [ ] Write the token-compact system prompt instructing Nano to respond with `:act` tuples.
- [ ] Implement regex-based S-Expression extraction with fallback to plain speech.

### Phase 4: UI Experience & Micro-Interactions (`src/pages/media-player.tsx`)
- [ ] Add **"✨ Show Me How"** button next to the interactive scrubber.
- [ ] Add visual badge: *"Nano is demonstrating (click anywhere to take back control)"*.
- [ ] Add audio toggle for Web Speech narration.

### Phase 5: Classroom Beacon Integration (`src/services/classroomBeacon.ts`)
- [ ] Allow teachers to broadcast Nano demonstrations to all connected student desks over local WebRTC.
- [ ] Add teacher kill-switch: Teacher can disable Co-Pilot on all student desks with one click from the Beacon Console.

---

## 7. Go / No-Go Decision Criteria

Before graduating this feature from Beta to Core:
1. **Latency Benchmark**: Time-to-first-visual-tween must be `< 800ms` on an Intel Celeron N4020 Chromebook.
2. **Accuracy Benchmark**: >95% valid AST action parsing across 100 fuzzed curriculum prompts.
3. **Teacher Sentiment**: Zero negative impact on pupil exploratory agency reported during pilot classroom trials.

---

# Technical Specification & Roadmap: Bare-Metal Zero-Bloat Architecture & Developing-World Offline Engine (Beta Plan II)

> **Document Status**: Active Beta Architectural Specification  
> **Target Subsystems**: `src/services/cartridgeStore.ts`, `src/services/dbStore.ts`, `static/player/ast-engine.js`, `src/services/classroomBeacon.ts`  
> **Foundational Axiom**: *"Every kilobyte matters when you are paying for it."* Designed for the physical constraints of the developing world: $30 Android Go handsets, intermittent 2G/3G data, air-gapped classrooms, and fragile eMMC flash storage.  
> **Author**: St Joseph's Curriculum Engineering Team  

---

## 8. Executive Vision & The Developing-World Reality

### 8.1 The Failure of Conventional EdTech in the Global South
Modern educational technology (PhET, Khan Academy, Duolingo, commercial LMS platforms) is designed around Western infrastructural assumptions:
1. **Unlimited 4G/5G or Home Fibre**: Monolithic JavaScript bundles (PhET bundles average 2 MB to 12 MB per simulation; Khan Academy video streaming requires megabytes per minute). In sub-Saharan Africa, South Asia, and rural Latin America, mobile data is sold in prepaid, meter-counted megabytes where downloading a single 10 MB bundle can represent a substantial fraction of a family's daily income.
2. **High-Performance Silicon & Endless RAM**: Bloated frameworks run with 50 MB to 100 MB runtime memory baselines, instantly crashing or inducing severe garbage collection thrashing on $30–$50 Android Go smartphones equipped with 512 MB to 1 GB of total system RAM.
3. **Flash Storage Burn-out**: Unoptimised web applications continuously write telemetry, cache chunks, and state to local storage. On cheap eMMC flash chips found in budget hardware, continuous write thrashing drastically degrades device lifespan and causes severe I/O bus stalls.

### 8.2 The AST Bare-Metal Counter-Philosophy
The AST Engine is not built around what web developers *have* done; it is built around what bare-metal browser runtimes *can* do when engineered with mechanical sympathy:
* **70× Lighter than PhET**: Pure AST runtime is `< 35 KB` gzipped with zero external dependencies.
* **Cold Start & Memory**: `< 15 ms` boot time and `< 8 MB` RAM footprint.
* **Living Single-File S-Expressions**: Full scientific and mathematical simulations compressed into `< 4 KB` declarative AST files.
* **Hardware-Sympathetic Invariant**: Zero disk writes during live play, zero cloud calls, zero battery drain when idle, and instantaneous offline replication across air-gapped classrooms.

---

## 9. Four-Tier Storage & Memory Hierarchy (Zero-Disk Execution)

To guarantee both instantaneous responsiveness and zero flash-memory wear, the platform establishes a strict four-tier data and memory pipeline:

```
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 0: ACTIVE 60 FPS EXECUTION (System RAM / V8 Heap Registers)      │
│  - ASTSceneRegistry In-Memory Graph                                    │
│  - Object-pooled transformation matrices (Float32Array)                │
│  - Zero Disk I/O, Zero IndexedDB transactions, Zero GC Pauses          │
└──────────────────────────────────▲─────────────────────────────────────┘
                                   │ On Scene Load (Sub-1ms Expansion)
                                   ▼ On Milestone (Debounced Async Write)
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 1: WARM EXPANSION VAULT (IndexedDB: cartridges_vault & ast_bank) │
│  - Asynchronous, non-blocking storage replacing synchronous localStorage│
│  - Pre-parsed scene descriptors and student custom cartridges          │
│  - Zero main-thread blocking, bypasses 5MB quota restrictions           │
└──────────────────────────────────▲─────────────────────────────────────┘
                                   │ On Cartridge Import / Pre-compilation
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 2: PRE-COMPILED BYTECODE & COMPRESSED CAPSULES                   │
│  - Pre-tokenized AST S-Expressions (OpCode & Keyframe tables)          │
│  - Single-file .ast.svg and .ast.bin capsules (< 4 KB each)           │
│  - Native streaming gzip / Brotli decompression                        │
└──────────────────────────────────▲─────────────────────────────────────┘
                                   │ Air-Drop / Local Wi-Fi Mesh / Sneakernet
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│  TIER 3: OFFLINE PEER-TO-PEER MESH & AIR-GAPPED TRANSPORT             │
│  - Local WebRTC data channels (0 internet data required)               │
│  - Animated High-Density QR Codes (camera-to-camera optical transfer)  │
│  - Offline SHA-256 cryptographic content validation                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 9.1 Tier 0: 100% In-Memory Live Execution Invariant
* During active interaction (dragging a syringe piston, rotating a geometric angle, firing a projectile), **no disk write or read may occur**.
* All coordinate maths, physics integrations, and visual tweens execute exclusively in memory via `Float32Array` buffers and live SVG DOM node attribute updates.
* Frame budget target: strictly 16.6ms (60 FPS) on single-core ARM Cortex-A53 processors.

### 9.2 Tier 1: IndexedDB Cartridge Vault (`cartridges_vault`)
* **Problem in Current Code**: `src/services/cartridgeStore.ts` (lines 707–749) uses `localStorage.setItem(STORAGE_KEY_CUSTOM_CARTRIDGES, JSON.stringify(updated))`. This causes synchronous JSON serialization on the UI thread, introduces a strict ~5 MB browser quota limit, and can stutter 60 FPS animations.
* **Specification Solution**:
  1. Add `STORE_CARTRIDGES_VAULT = 'cartridges_vault'` to `src/services/dbStore.ts` with index on `id`, `category`, and `updatedAt`.
  2. Implement `saveCustomCartridgeAsync()` and `getCustomCartridgesAsync()` using IndexedDB transactions.
  3. Maintain an in-memory hot cache (`inMemoryCartridgesCache`) synchronized with `ASTSceneRegistry`.
  4. Automatic zero-loss one-time migration: On first boot, read legacy `stj_custom_cartridges_v1` from `localStorage`, insert into `cartridges_vault`, and clear the legacy `localStorage` key to liberate system storage.

### 9.3 Tier 3: Milestone-Gated Persistence (Flash Wear Guard)
* In developing-world devices with budget eMMC chips, repetitive random writes degrade flash blocks and cause system-wide I/O pauses.
* Disk persistence via IndexedDB is restricted **strictly to discrete pedagogical milestones**:
  1. Student answers a formative checkpoint question (`src/services/jotter-db.ts`).
  2. Student earns a concept mastery badge or completes a lab module.
  3. Teacher or student deliberately saves or modifies a simulation cartridge.
* All milestone writes are asynchronously batched with a minimum 500ms trailing debounce.

---

## 10. Pre-Compiled AST Bytecode & Tokenless Ingestion

### 10.1 The Bottleneck of Runtime String Tokenisation
Currently, `static/player/ast-engine.js` parses raw S-Expression strings at runtime using regular expression scanning and string splitting. While fast (< 10 ms on desktop), on a budget MediaTek or Spreadtrum quad-core processor with slow single-thread JavaScript performance, parsing a complex 200-line S-Expression on every scene switch can consume 25–40 ms.

### 10.2 Structural Bytecode Specification
Introduce an optimized AST opcode representation that can be stored directly in IndexedDB or transferred over the wire:

```typescript
// Compact AST OpCode Definitions
export const enum AstOpCode {
  OP_SCENE       = 0x01,
  OP_STAGE       = 0x02,
  OP_DURATION    = 0x03,
  OP_NODE_3D     = 0x10,
  OP_LINE_3D     = 0x11,
  OP_RING_3D     = 0x12,
  OP_POLYGON_3D  = 0x13,
  OP_KEYFRAME    = 0x20,
  OP_BINDING     = 0x21,
  OP_CHECKPOINT  = 0x30,
  OP_GESTURE     = 0x40,
}

export interface CompactAstScene {
  id: string;
  stageWidth: number;
  stageHeight: number;
  durationMs: number;
  // Flat typed arrays for numeric transforms
  keyframeTimes: Float32Array;
  // Node transform lookup tables
  nodes: Array<{
    id: string;
    opCode: AstOpCode;
    props: Record<string, number | string>;
  }>;
  bindings: Array<{
    targetId: string;
    attribute: string;
    expressionOpCodes: Uint8Array;
  }>;
}
```

* **Instantiation Benefit**: Bypasses lexer and regex steps; deserializes directly from IndexedDB structured clones into JavaScript runtime objects in `< 0.8 ms`.

---

## 11. Zero-Data Peer-to-Peer Cartridge Mesh (Air-Gapped Distribution)

### 11.1 The Classroom Reality
In many rural schools:
* One teacher's phone may have intermittent cellular coverage on the road.
* The 40 student tablets inside the brick classroom have **zero cellular SIM cards and no internet access**.
* The school has no broadband router, or only a battery-powered local Wi-Fi travel router with no WAN uplink.

### 11.2 Mesh Distribution Protocol

#### Channel A: Local WebRTC Mesh (Zero-Internet Local Network)
* Teacher's device runs as the **Classroom Beacon Host** (`src/services/classroomBeacon.ts`).
* Student devices connect to the local Wi-Fi SSID (or Wi-Fi Direct hotspot).
* Cartridges are transferred over WebRTC `RTCDataChannel` in binary chunks:
  - Average transfer time for a 4 KB AST cartridge across 40 tablets: `< 1.2 seconds`.
  - Total internet cellular data consumed by the entire classroom: **0.00 KB**.

#### Channel B: Optical Sneakernet (High-Density Animated QR Codes)
* For classrooms without any Wi-Fi router or hotspot:
* An AST simulation compressed via gzip/deflate is typically **1.2 KB to 2.8 KB**.
* Using Base45/Base64 encoding with QR Version 40 (or a sequence of 3–4 animated QR frames at 5 FPS):
  - Teacher displays the animated QR code on screen or whiteboard.
  - Student device camera scans the animated QR code via `BarcodeDetector` API.
  - The entire interactive, animated simulation is transferred through the air in `< 3 seconds` without wires, radio waves, or internet access.

#### Channel C: Cryptographic Verification Invariant
* Every cartridge bundle contains a canonical content hash: `sha256(svgMarkup + astSource)`.
* Upon local P2P ingestion, the receiving client computes the hash before registering the cartridge in IndexedDB.
* Guarantees 100% tamper resistance and curriculum integrity without needing an online certificate authority or cloud server.

---

## 12. Thermal & Battery Preservation Engine (The 1-Watt Classroom)

### 12.1 The Issue with Standard Web Canvas Animation Loops
Conventional HTML5 interactive games and simulations run an unconditional `requestAnimationFrame` loop:
```javascript
function loop() {
  updatePhysics();
  render();
  requestAnimationFrame(loop);
}
```
* Even when the student is simply reading a question or looking at the stage, this loop consumes 100% of a CPU core, generating heat, draining budget lithium batteries in under 2 hours, and causing the device to thermally throttle down to single-digit frame rates.

### 12.2 Dirty-State Idle Freeze Architecture
In `static/player/ast-engine.js`:
1. **Dynamic Frame Budgeting**:
   - **Interactive State**: When a touch or pointer gesture is active, or a timeline transition is running, the engine runs at full 60 FPS with sub-pixel precision.
   - **Static / Idle State**: When all timeline tweens have reached their targets and no pointers are touching the stage, the engine **cancels `requestAnimationFrame` and sleeps at 0 FPS**.
2. **Instant Wake-on-Pointer**:
   - Hardware pointer listeners (`pointerdown`, `pointermove`, `keydown`) instantly restart the render pipeline with zero perceptible input lag (< 2 ms).
3. **Web Audio Power Suspension**:
   - The zero-asset procedural Web Audio synthesizer automatically calls `audioCtx.suspend()` after 300 ms of audio silence.
   - This suspends the browser's real-time OS audio processing thread, saving up to 15% system power on low-end chipsets.

---

## 13. Phased Implementation Roadmap

### Phase 1: IndexedDB Cartridge Vault Integration
- [ ] Add `STORE_CARTRIDGES_VAULT` store to `src/services/dbStore.ts` (database version bump to 5).
- [ ] Create async CRUD functions in `src/services/cartridgeStore.ts`:
  - `saveCustomCartridgeToDb(cartridge: CartridgeDefinition): Promise<void>`
  - `getCustomCartridgesFromDb(): Promise<CartridgeDefinition[]>`
  - `deleteCustomCartridgeFromDb(cartridgeId: string): Promise<void>`
- [ ] Implement one-time automatic migration of existing `localStorage` cartridges to `IndexedDB`.
- [ ] Provide instantaneous fallback to `inMemoryCartridgesCache` for synchronous reads.

### Phase 2: Idle-Sleep & Battery Preservation (`static/player/ast-engine.js`)
- [ ] Add `isDirty` flag and idle timer to `ASTEngine` render loop.
- [ ] Ensure RAF stops when physics settling occurs; verify CPU drops to `< 0.5%` during idle display.
- [ ] Implement `suspendAudioWhenIdle()` in procedural sound synthesizers.

### Phase 3: Compressed Air-Gapped Optical Exporter / Importer
- [ ] Implement `exportCartridgeToCompressedQr(cartridgeId: string)` in `src/utils/cartridgeTransport.ts`.
- [ ] Add optical QR scanner modal to the Cartridge Manager UI (`src/pages/media-player.tsx`).
- [ ] Verify complete simulation transfer from phone screen to tablet camera in `< 3 seconds`.

### Phase 4: WebRTC Local Mesh Cartridge Broadcast
- [ ] Extend `src/services/classroomBeacon.ts` with `broadcastCartridgeToPeers(cartridge: CartridgeDefinition)`.
- [ ] Add pupil receiver handler: auto-cache received cartridge into IndexedDB and notify pupil with a subtle banner (*"New simulation received from teacher"*).

### Phase 5: Low-Spec Hardware Verification Suite
- [ ] Measure cold-start instantiation on CPU-throttled Chrome profile (4× CPU slowdown, offline network).
- [ ] Guarantee zero frame drops (< 16.6 ms frame time) on vector rendering.
- [ ] Guarantee exactly 0 disk writes during 60 seconds of continuous slider dragging.

---

## 14. Hard Acceptance Invariants

| Metric | Target Specification | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Active Play Disk Writes** | **Strictly 0 writes/sec** | Milestone-only persistence gate in `jotter-db.ts` |
| **Engine Runtime Footprint** | **< 35 KB gzipped** | Build-time bundle checker |
| **Cartridge S-Expression Size** | **< 4 KB per simulation** | AST compressor validation |
| **Cold-Start Instantiation** | **< 15 ms from IndexedDB** | Performance mark telemetry |
| **Idle CPU Utilization** | **< 0.5% CPU** | Dirty-state RAF cancellation |
| **Air-Gapped Replication** | **100% offline (0.00 KB cellular)** | WebRTC / Optical QR transport |
| **Flash Memory Wear** | **< 5 writes per student hour** | Debounced milestone batching |
