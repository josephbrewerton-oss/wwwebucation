# AST Vector Player — WASM Migration Architecture & Memory Contract

**St Joseph's Educational Media Suite — High-Performance WASM Compute Core**  
*Document Version: 1.0.0 (October 2026)*  
*Codified Memory Layout & Architectural Hotpath Contract*

---

## 1. Executive Summary

This document locks in the architectural boundaries and exact binary memory layout contract for migrating the compute-intensive hotpaths of the AST Vector Media Player (`static/player/`) to WebAssembly.

### Design Principles:
1. **Zero-DOM Boundary Invariant**: WebAssembly never directly queries or mutates SVG or HTML DOM elements. All DOM mutations (`setAttribute`, `createElementNS`, CSS styling) remain **[DOM_PERMANENT]** in JavaScript.
2. **Zero-Allocation 60 FPS Loop**: WASM linear memory is statically allocated at boot (7 pages = 448 KB). No `memory.grow` or garbage collection overhead during interactive simulation ticks.
3. **Structure of Arrays (SoA)**: Physics particles and 3D nodes are structured in contiguous linear float arrays for optimal cache locality and SIMD execution.

---

## 2. Subsystem Classification Audit

| File & Subsystem | Internal Component / Hotpath | Classification | Rationale & Hotpath Characteristics |
| :--- | :--- | :---: | :--- |
| **`ast-engine.js`**<br>`VectorMicroPhysics` | `_ensureBuffers()` & typed buffer state | **`[INTERFACE_BOUNDARY]`** | Pre-architected SoA buffers (`_bufX`, `_bufY`, `_bufVx`, `_bufVy`, `_bufRadius`, `_bufMass`, `_bufBounce`, `_bufFlags`). |
| | `update(dt)` Euler integration & circle collisions | **`[WASM_CANDIDATE]`** | 60 FPS physics loop: gravity, velocity integration, elastic restitution, inter-body circle-circle collision sweeps. |
| | SVG DOM positioning (`setAttribute('cx', ...)`, `setAttribute('transform', ...)`) | **`[DOM_PERMANENT]`** | Browser SVG DOM nodes must be mutated via DOM API. |
| **`ast-engine.js`**<br>`VectorEmitterCollection` | Obstacle Segment CTM Extraction (`refreshObstacleSegments`) | **`[DOM_PERMANENT]`** | Calls `getScreenCTM()`, `inverse()`, and `root.querySelector()`. |
| | Dynamic obstacle line segment caching | **`[INTERFACE_BOUNDARY]`** | Writes flattened obstacle line segments `[ax, ay, bx, by, nx, ny, vx, vy, bounce, refract]` to memory. |
| | Particle Physics Hot Loop (lines 1214–1340) | **`[WASM_CANDIDATE]`** | Intensive inner loop: continuous ray-segment intersection, Snell’s law optical refraction, TIR (total internal reflection), kinetic momentum transfer. |
| | Solid lattice jitter calculation (`Math.sin`/`cos`) | **`[WASM_CANDIDATE]`** | Deterministic thermal vibration loop across particle index `i`. |
| | Particle SVG node blitting (`setAttribute('cx', ...)`) | **`[DOM_PERMANENT]`** | Translates calculated `(x, y)` from WASM memory to SVG `<circle>` attributes. |
| **`ast-engine.js`**<br>`VectorVerletPhysics` | `step(dt)` Verlet update (lines 1713–1723) | **`[WASM_CANDIDATE]`** | `x(t+dt) = 2x(t) - x(t-dt) + a*dt²` position integration across point particles. |
| | Constraint relaxation loops (lines 1726–1744) | **`[WASM_CANDIDATE]`** | Iterative distance constraint solver (`Math.hypot`, stiffness delta relaxation for springs and pendulums). |
| **`ast-engine.js`**<br>`Camera & 3D Pipeline` | Camera Euler rotation matrix (`yaw`, `pitch`, `roll`) | **`[WASM_CANDIDATE]`** | Trigonometric matrix transform around Y, X, and Z axes. |
| | `project3D(x, y, z, cx, cy, camera)` (lines 3540–3587) | **`[WASM_CANDIDATE]`** | 3D coordinate space transformation, camera distance offset, perspective division (`scale = focalLength / safeZ`), and depth opacity computation. |
| | 3D Painter's Algorithm Depth Sort | **`[WASM_CANDIDATE]`** | Sorting transformed polygon and line vertex depth indices (`z3`) prior to stage rendering. |
| | Container CSS 3D transform (`rotateX`, `rotateY`, `scale`) | **`[DOM_PERMANENT]`** | Applies computed orbit styles to container DOM elements. |
| **`ast-engine.js`**<br>`Interpolation & Splines` | `_pointsToSpline(pts)` Catmull-Rom cubic Bézier | **`[WASM_CANDIDATE]`** | Computes control points `(cp1x, cp1y, cp2x, cp2y)` from point arrays. |
| | `astMorphPath`, `astMorphColor`, easing curves (`astEaseBounce`, `astEaseElastic`) | **`[WASM_CANDIDATE]`** | Mathematical evaluation functions returning scalar floats or interpolated coordinate tuples. |
| **`ast-engine.js`**<br>`Core Timeline & State` | Timeline keyframe interpolation & state evaluation | **`[WASM_CANDIDATE]`** | Computes current active step, normalized step progress `t`, and reactive numeric variables. |
| | `VectorProceduralAudioSynth` | **`[DOM_PERMANENT]`** | Browser `AudioContext`, `OscillatorNode`, `GainNode`, and ADSR envelope scheduling. |
| | `MicroSCORMBridge` | **`[DOM_PERMANENT]`** | `window.API` / `window.API_1484_11` SCORM CMI string calls. |
| | `postMessage` messaging bus & event emitter (`emit`) | **`[DOM_PERMANENT]`** | Browser iframe window communication. |
| **`ast-compiler.js`** | SlideScript Tokenizer & AST Line Parser | **`[WASM_CANDIDATE]`** | Fast zero-allocation byte scanning of markdown directives, shape extraction, and checkpoint parsing. |
| | GBNF Grammar Validator (`ast-sexpr.gbnf`) | **`[WASM_CANDIDATE]`** | Deterministic finite state machine checking Lisp S-expression syntax compliance. |
| | SVG Template XML String Generation | **`[DOM_PERMANENT]`** | String templating for initial SVG document creation. |
| **`ast-gestures.js`** | Pointer Capture (`setPointerCapture`, `pointerdown/move/up`) | **`[DOM_PERMANENT]`** | Browser DOM PointerEvents. |
| | Inverse CTM coordinate projection (`grpCTM.inverse()`) | **`[INTERFACE_BOUNDARY]`** | SVG screen matrix inversion; feeds stage-space `(x, y)` into the WASM gesture state. |
| | Whiteboard Stylus Ink Bézier Smoothing | **`[WASM_CANDIDATE]`** | Quadratic Bézier mid-point calculation and stroke width pressure interpolation. |
| | Ink SVG Path Generation (`<path d="...">`) & HUD DOM | **`[DOM_PERMANENT]`** | Whiteboard layer SVG DOM nodes. |
| **`ast-phet-bridge.js`** | PhET Bundle Regex & Property Extraction | **`[WASM_CANDIDATE]`** | Fast byte scanning of JSON/HTML bundles to extract simulation variables. |
| | AST S-Expression Transpilation | **`[INTERFACE_BOUNDARY]`** | Emits AST S-Expression string representation into player engine. |
| **`player-ui.js`** | Scrubber timeline, Glassmorphism HUD, Modal Dialogs | **`[DOM_PERMANENT]`** | HTML DOM elements, CSS styles, bilingual subtitle text rendering. |
| | BSL In-Vision Overlay & WebRTC Video | **`[DOM_PERMANENT]`** | Canvas/video elements, video tracks, browser layout. |
| **`ast-webrtc-bus.js`** | `RTCPeerConnection`, `RTCDataChannel`, signaling | **`[DOM_PERMANENT]`** | Browser WebRTC network stack. |
| | Peer Telemetry Serialization | **`[INTERFACE_BOUNDARY]`** | Packs player coordinate state into compact binary or JSON arrays. |
| **`micro-vector-player.js`** | Web Component Shadow DOM (`HTMLElement`) | **`[DOM_PERMANENT]`** | Custom element lifecycle (`connectedCallback`, `observedAttributes`). |
| **`obs-controller.js`** | OBS WebSocket v5 Client | **`[DOM_PERMANENT]`** | Browser `WebSocket` API network calls. |
| **`ast-registry.js`** | Scene Manifest Cache & Cartridge Preloading | **`[DOM_PERMANENT]`** | Fetch API, localStorage caching, JSON manifest parsing. |

---

## 3. WebAssembly Memory Map Specification

* **Total Linear Memory Allocated**: 7 Pages (458,752 Bytes = 448 KiB)
* **WASM Page Size**: 65,536 Bytes (`0x10000`)
* **Byte Alignment**: 64-bit aligned (8-byte boundary)

```
[Page 0: 0x000000 - 0x00FFFF] Simulation Header & Global State (1024 B used)
[Page 1: 0x010000 - 0x01FFFF] Particle Pool SoA Part 1 (x, y, vx, vy, radius, mass)
[Page 2: 0x020000 - 0x02FFFF] Particle Pool SoA Part 2 (charge, lattice_x, lattice_y, flags)
[Page 3: 0x030000 - 0x03FFFF] Rigid Bodies (0x30000) & Verlet Points/Constraints (0x34000)
[Page 4: 0x040000 - 0x04FFFF] 3D World Vertices In (0x40000) & Projected 2D Out (0x44000)
[Page 5: 0x050000 - 0x05FFFF] Dynamic Collision Obstacles (256 segments × 48 B)
[Page 6: 0x060000 - 0x06FFFF] Stylus Ink In/Out (0x60000) & Command Ring Buffer (0x6C000)
```

### Detailed Offset Manifest

#### Page 0: Global State Header (`0x000000` - `0x0003FF`)
* `0x0000` [`u32`]: Magic Number (`0x41535456` = `"ASTV"`)
* `0x0004` [`u32`]: ABI Version (`1`)
* `0x0008` [`u64`]: Frame Tick Index
* `0x0010` [`f32`]: Delta Time `dt` (seconds)
* `0x0014` [`f32`]: Total Elapsed Time (seconds)
* `0x0018` [`f32`]: Gravity Acceleration (`980.0`)
* `0x001C` [`f32`]: Kinetic Friction Multiplier (`0.985`)
* `0x0020` - `0x002F` [`f32[4]`]: Stage Bounds (`min_x`, `max_x`, `min_y`, `max_y`)
* `0x0030` - `0x0043` [`f32[5]`]: Camera Orientation (`yaw`, `pitch`, `roll`, `distance`, `fov`)
* `0x0044` [`u32`]: Active Particle Count (`<= 1024`)
* `0x0048` [`u32`]: Active Rigid Body Count (`<= 256`)
* `0x004C` [`u32`]: Active Obstacle Segment Count (`<= 128`)
* `0x0050` [`u32`]: Active 3D Node Count (`<= 512`)
* `0x0054` [`u32`]: Active Verlet Points (`<= 256`)
* `0x0058` [`u32`]: Active Verlet Constraints (`<= 256`)
* `0x005C` [`u32`]: Phase State (`0=Gas`, `1=Liquid`, `2=Solid`)
* `0x0060` [`f32`]: Temperature Kelvin (kinetic energy scalar)

#### Pages 1 & 2: Particle Structure of Arrays (1024 capacity, 4096 bytes per array)
* `0x010000`: `particle_x` [`f32[1024]`]
* `0x011000`: `particle_y` [`f32[1024]`]
* `0x012000`: `particle_vx` [`f32[1024]`]
* `0x013000`: `particle_vy` [`f32[1024]`]
* `0x014000`: `particle_radius` [`f32[1024]`]
* `0x015000`: `particle_mass` [`f32[1024]`]
* `0x016000`: `particle_charge` [`f32[1024]`]
* `0x017000`: `particle_lattice_x` [`f32[1024]`]
* `0x018000`: `particle_lattice_y` [`f32[1024]`]
* `0x019000`: `particle_flags` [`u32[1024]`]

#### Page 3: Rigid Bodies & Verlet Nodes
* `0x030000`: 256 Rigid Bodies × 48 bytes: `[f32 x, y, vx, vy, mass, bounce, friction, groundY, radius, u32 flags, id_hash, pad]`
* `0x034000`: 256 Verlet Points × 32 bytes: `[f32 x, y, prev_x, prev_y, mass, radius, u32 pinned, pad]`
* `0x037000`: 256 Verlet Constraints × 16 bytes: `[u16 p1, p2, f32 target_length, stiffness, u32 pad]`

#### Page 4: 3D Projection & Depth Sorting
* `0x040000`: Input Vertices (512 × 16 bytes): `[f32 world_x, world_y, world_z, u32 id_hash]`
* `0x044000`: Output Projected (512 × 24 bytes): `[f32 screen_x, screen_y, depth_z, scale, opacity, u32 sort_rank]`

#### Page 5: Dynamic Collision Obstacles
* `0x050000`: 256 Segments × 48 bytes: `[f32 ax, ay, bx, by, nx, ny, vx, vy, len, bounce, refract, friction]`

#### Page 6: Whiteboard Ink & Command Mailbox
* `0x060000`: Stylus Raw In (1024 × 12 bytes): `[f32 raw_x, raw_y, pressure]`
* `0x064000`: Bézier Smoothed Out (1024 × 24 bytes): `[f32 mid_x, mid_y, cp_x, cp_y, stroke_width, u32 pad]`
* `0x06C000`: Command Mailbox Ring Buffer (64 × 16 bytes): `[u32 opcode, f32 p1, f32 p2, u32 target_id]`
