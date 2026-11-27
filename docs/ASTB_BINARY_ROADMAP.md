# `.astb` Binary Cartridge Specification & Standardization Roadmap

This document defines the canonical binary wire format, opcode allocation table, compatibility invariants, and phased evolution plan for **`.astb`** (AST Vector Bytecode) cartridges across all three decoders:
1. **TypeScript Codec** (`src/utils/astBytecode.ts`)
2. **Browser Runtime JS Decoder** (`static/player/ast-bytecode-decoder.js`)
3. **448 KiB Everyman WASM Kernel** (`static/player/wasm/ast-wasm-engine.wat`)

---

## 1. Architectural Principles (Non-Negotiable Invariants)

- **Pure W3C SVG DOM on Stage:** `.astb` compresses vector geometry, styles, and display-list stamps into dense binary tuples, then hydrates them into pure W3C SVG `<defs>` and `<use>` DOM nodes at boot (`< 0.2 ms`). Never introduce `<canvas>`, WebGL, or external rendering frameworks.
- **Zero-`JSON.parse` Core Path:** Native binary opcodes (`0x01..0x9F`) must decode directly via `DataView` / linear WASM memory with zero runtime `JSON.parse` allocations. (`0xA0 OP_SCENE_EXT` is strictly reserved as a transitional escape hatch for optional high-level metadata.)
- **448 KiB (7-Page) WASM Ceiling:** Every `.astb` version must boot inside the locked 7-page WASM linear memory pool (`docs/WASM_ARCHITECTURE_CONTRACT.md`) with zero dynamic heap growth during 60 FPS loops.
- **Length-Framed Forward Compatibility (`>= 0x82`):** Every new variable-length opcode starting at `0x82` MUST begin with a `u32` `payload_len` byte count immediately after the 1-byte opcode tag so older runtimes and the WASM kernel can skip unknown or non-critical visual blocks in `O(1)` time without losing stream alignment. Fixed-size opcodes (e.g., 32-byte `OP_STAMP`) must declare an immutable byte width in this registry.
- **Developing-World Byte Budget:** Target **< 6 KB gzipped** per full interactive curriculum cartridge (including logic + binary vector dictionary), zero third-party requests, and deterministic offline playback.

---

## 2. Canonical 16-Byte Header Layout

| Offset | Type | Field | Description |
| :--- | :--- | :--- | :--- |
| `0..3` | `u8[4]` | `magic` | ASCII `'A' 'S' 'T' 'B'` (`0x41 0x53 0x54 0x42`) |
| `4` | `u8` | `version` | Format major version (`0x01` for v1.x; `0x02` reserved for v2.0 RPN/Chunked) |
| `5` | `u8` | `archetype` | `0x01` Sim, `0x02` Slide, `0x03` App, `0x04` Film |
| `6..7` | `u16 LE` | `durationDeci` | Scene duration in deciseconds (`100` = `10.0 s`) |
| `8..9` | `u16 LE` | `stringCount` | Number of UTF-8 entries in Section 1 String Table |
| `10..13` | `u32 LE` | `stringByteLen` | Exact byte length of Section 1 String Table |
| `14..15` | `u16 LE` | `flags` | Capability bitmask (see table below) |

### Header Capability Flags (`offset 14..15`)

| Bit | Mask | Constant | Status | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| 0 | `0x0001` | `FLAG_HAS_3D` | v1.0 | Scene contains `:camera` / 3D projection opcodes |
| 1 | `0x0002` | `FLAG_HAS_VIDEO` | v1.0 | Film cartridge synchronized to local media |
| 2 | `0x0004` | `FLAG_HAS_CHECKPOINTS` | v1.0 | Contains formative MCQ or manipulation goals |
| 3 | `0x0008` | `FLAG_HAS_SUBTITLES` | v1.0 | Contains timed multilingual subtitles |
| 4 | `0x0010` | `FLAG_HAS_SVG` | v1.0 | Embeds raw UTF-8 `OP_SVG_COMPANION` (`0x81`) |
| 5 | `0x0020` | `FLAG_COMPLETE_BINARY` | v1.0 | Self-contained binary without external `.ast` source |
| 6 | `0x0040` | `FLAG_HAS_VECTOR_DICT` | **v1.1** | Uses binary 2D Vector Dictionary (`0x82..0x84`) |
| 7 | `0x0080` | `FLAG_HAS_MORPH_CLIPS` | Planned v1.2 | Contains binary shape morphs or micro-timelines (`0x85..0x87`) |
| 8 | `0x0100` | `FLAG_HAS_RPN_EXPR` | Planned v1.3 | Uses binary RPN expression opcodes (`0xB0..0xBF`) |
| 9..15 | `0xFE00` | *(reserved)* | Future | Must be `0` until standardized in this spec |

---

## 3. Master Opcode Registry (`0x00..0xFF`)

| Range | Opcode | Name | Framing | Version | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Meta | `0x01` | `OP_SCENE_META` | Fixed `9 B` | v1.0 | Scene ID, title, stage, video URL, video fit |
| Timeline | `0x10` | `OP_KEYFRAME` | Fixed `6 B` | v1.0 | Normalized keyframe `t` (`u16`), title, pedagogical rule |
| Subtitles | `0x20` | `OP_SUBTITLE` | Counted | v1.0 | Multilingual timed captions |
| Bindings | `0x30` | `OP_BINDING` | Fixed `6 B` | v1.0 | Standard 2D attribute reactive binding |
| Bindings | `0x31` | `OP_BINDING_WHEN` | Fixed `8 B` | v1.0 | Guarded conditional binding (`:when`) |
| Bindings | `0x32` | `OP_BINDING_VAR` | Fixed `6 B` | v1.0 | Reactive variable mutation (`:var-update` / `@enter`) |
| 3D | `0x33` | `OP_3D_LINE` | Flagged `33–41 B` | v1.0 | Native binary 3D spline/line descriptor (0 `JSON.parse`) |
| 3D | `0x34..0x36` | `OP_3D_NODE` / `RING` / `POLY` | Length-framed `u32` | Planned v1.2 | Replace remaining JSON-encoded 3D bindings |
| Quiz | `0x40` | `OP_CHECKPOINT` | Counted | v1.0 | Formative multiple-choice checkpoint |
| Quiz | `0x41` | `OP_CHECKPOINT_GOAL` | Counted | v1.0 | Manipulation `:pass-expr`, `:hold-duration`, `:on-wrong` |
| Input | `0x50` | `OP_GESTURE` | Fixed `11 B` | v1.0 | Direct-manipulation draggable axis & bounds |
| Input | `0x51` | `OP_GESTURE_EXT` | Length-framed `u32` | Planned v1.2 | Native binary clickable, holdable, hoverable, rotatable |
| State | `0x60` | `OP_VAR` | Fixed `21 B` | v1.0 | Bounded numeric/string/bool variable register |
| State | `0x61` | `OP_COMPUTED` | Fixed `4 B` | v1.0 | Derived reactive formula |
| UI | `0x70` | `OP_INPUT` | Fixed `17 B` | v1.0 | Slider, switch, or button control binding |
| Stage | `0x80` | `OP_CAMERA` | Fixed `14 B` | v1.0 | 3D camera yaw/pitch/distance/FOV |
| Stage | `0x81` | `OP_SVG_COMPANION` | Fixed `2 B` | v1.0 | Legacy embedded UTF-8 SVG stage string |
| **Vector** | **`0x82`** | **`OP_STYLE_TABLE`** | **Length-framed `u32`** | **v1.1 (Live)** | **Indexed RGBA solids, linear & focal-radial (`fx/fy`) gradients** |
| **Vector** | **`0x83`** | **`OP_SHAPE_DEF`** | **Length-framed `u32`** | **v1.1 (Live)** | **Delta-encoded `i16` decipixel (`0.1 px`) `M/L/Q/C/Z` vector symbol** |
| **Vector** | **`0x84`** | **`OP_STAMP`** | **Fixed `32 B`** | **v1.1 (Live)** | **Depth-keyed `<use>` instance with 6-float `matrix(a..f)` + opacity** |
| Vector | `0x85` | `OP_MORPH_DEF` | Length-framed `u32` | Planned v1.2 | Paired quantized start/end vertex arrays for 60 FPS shape morphing |
| Vector | `0x86` | `OP_CLIP_MASK` | Length-framed `u32` | Planned v1.2 | Clipped cel-shading & SWF-style `clipDepth` aperture masks |
| Vector | `0x87` | `OP_CLIP_TIMELINE` | Length-framed `u32` | Planned v1.2 | Reusable local-phase micro-timelines (`t_local` loops) |
| Vector | `0x88` | `OP_TEXT_DEF` | Length-framed `u32` | Planned v1.2 | Accessible localized `<text>` labels & live telemetry anchors |
| Framing | `0x89` | `OP_COMMIT_FRAME` | Fixed `2 B` | Planned v1.3 | Explicit Frame-0 Dictionary → Frame-1 Paint commit barrier |
| Science | `0x90` | `OP_SCOPE` | Fixed `40 B` | v1.0 | Zero-GC Float32Array live oscilloscope |
| Science | `0x91` | `OP_LEDGER` | Counted | v1.0 | Real-time conservation-law & energy bar ledger |
| Ext | `0xA0` | `OP_SCENE_EXT` | Fixed `4 B` | v1.0 | Transitional JSON extension section (shrink over time) |
| Expr | `0xB0..0xBF` | `OP_EXPR_RPN` | Length-framed `u32` | Planned v1.3 | Stack-based binary math expressions (zero JS `Function` eval) |
| End | `0xFF` | `OP_EOF` | `0 B` | v1.0 | Stream terminator |

---

## 4. Phased Version Plan

### Version 1.0 — Deterministic Tuple Baseline *(Shipped)*
- 16-byte header, interned UTF-8 String Table, core reactive bindings, checkpoints, `:scope`, `:ledger`, native `OP_CAMERA` (`0x80`), native `OP_3D_LINE` (`0x33`), and `OP_SVG_COMPANION` (`0x81`).
- Boots in the 448 KiB Everyman WASM kernel with 3-column Gemini Nano / WebMCP manifest extraction.

### Version 1.1 — SWF-Inspired Binary 2D Vector Dictionary *(Implemented Now)*
Applies SWF's highest-leverage graphics compression ideas directly to `.astb` tuples without inheriting Flash bytecode:
- **`0x82 OP_STYLE_TABLE` (`[len:u32] [count:u16] ...`)**: Stores solid RGBA colors in 5 bytes and linear / focal-radial (`fx`, `fy`) gradients in ~20–35 bytes, referenced by `u16` style index instead of repeating hex strings on every `<path>`.
- **`0x83 OP_SHAPE_DEF` (`[len:u32] [symId:u16] [layers:u8] ...`)**: Encodes multi-layer compound vector symbols using **delta-encoded `Int16` decipixels (`0.1 px` resolution, ±3276.7 px range)** over `M/L/Q/C/Z` path commands—typically cutting raw SVG path payloads by **40–65% before gzip** while preserving exact quadratic Bézier (`Q`) Flash-style illustration quality.
- **`0x84 OP_STAMP` (Fixed `32 B`)**: Mirrors SWF's `PlaceObject2` display list and aligns 1:1 with the WASM kernel's 32-byte Display-List stride (`depth:u16`, `symId:u16`, `instId:u16`, 6×`f32` affine matrix, `opacity:u8`, `flags:u8`). One shape in `<defs>` can be stamped dozens of times with scale, rotation, skew, and z-order for 32 bytes per instance.
- **3-Way Parity:** Implemented simultaneously across `src/utils/astBytecode.ts`, `static/player/ast-bytecode-decoder.js`, and `static/player/wasm/ast-wasm-engine.wat`.

### Version 1.2 — Living Vector Motion & Zero-JSON Completion *(Next)*
- **`0x85 OP_MORPH_DEF`**: Binary start/end decipixel vertex buffers feeding the zero-GC `astMorphPath` interpolator (liquid levels, membranes, flexing muscles, cloud growth).
- **`0x86 OP_CLIP_MASK`**: Binary cel-shading shadow/highlight clip apertures and negative-space `evenodd` masks (`fill-rule: evenodd`) with zero GPU blur filters.
- **`0x87 OP_CLIP_TIMELINE`**: Declarative reusable micro-timelines (a flapping wing, spinning turbine, or pulsing wave defined once with its own local phase `t_local` and stamped across the stage).
- **`0x88 OP_TEXT_DEF` & `0x34..0x36` + `0x51`**: Native binary records for accessible SVG text labels, `:3d-node`/`:3d-ring`/`:3d-polygon`, and declarative gestures (`:clickable`, `:hoverable`, `:holdable`, `:rotatable`), reducing `0xA0 OP_SCENE_EXT` usage toward zero.
- **Compiler Integration:** Add an automatic SVG-to-VectorDict optimizer pass in `scripts/compile-ast-bytecode.ts` (and `swfSymbolHarvester.ts`) so authored `.svg` stages and harvested SWF symbols automatically emit `0x82..0x84` when smaller than `OP_SVG_COMPANION`.

### Version 1.3 — Frame-0 Streaming Commit & Binary Math RPN *(Future)*
- **`0x89 OP_COMMIT_FRAME`**: Formalizes SWF's `Frame 0 Dictionary → ShowFrame` barrier so the 448 KiB WASM kernel paints Frame 1 immediately on slow 2G/mesh links before parsing later slides/checkpoints.
- **`0xB0..0xBF OP_EXPR_RPN`**: Compiles safe mathematical binding expressions (`sin`, `cos`, `lerp`, `clamp`, arithmetic, `vars[i]`) into postfix RPN bytecode executed directly in WASM—eliminating runtime JavaScript expression evaluation and tightening CSP/air-gap security.

### Version 2.0 — Universal Self-Contained Capsule (`ASTB v2` / `ASTZ`) *(Long-Term)*
- Optional outer raw-deflate compression envelope (`ASTZ` magic) for QR-code sneakernet and WebRTC classroom mesh transfer (< 2–4 KB per complete illustrated lesson).
- Formalized `.astb` Conformance Test Suite enforcing round-trip bit-exact parity across TypeScript, Browser JS, and WASM on every pull request.

---

## 5. Standardization Checklist for Any New `.astb` Opcode

Before adding or promoting any opcode from *Planned* to *Live*:
1. **Reserve the hex code** in Section 3 of this document first (never reuse retired opcodes).
2. **Enforce framing:** Use `[opcode: u8] [payload_len: u32]` for any variable-length record, or document an immutable fixed byte width.
3. **Update all three decoders in the same commit:** `src/utils/astBytecode.ts`, `static/player/ast-bytecode-decoder.js`, and `static/player/wasm/ast-wasm-engine.wat` (rebuild WASM via `node scripts/build-wasm.js`).
4. **Prove zero-`JSON.parse` + bit-exact parity** in `scripts/test-ast-bytecode.ts` and verify 448 KiB WASM boot + cartridge integrity (`npm run test:bytecode && npm run test:integrity`).
