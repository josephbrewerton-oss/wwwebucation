# Contributing Guidelines

Thank you for your interest in contributing. This project is built as a **sovereign educational appliance**—engineered with strict mechanical sympathy to deliver 60 FPS simulations on budget hardware (e.g., Celeron/ARM Chromebooks) within a 448 KB WASM memory budget.

Because this platform functions more like an embedded fantasy console than a conventional web app, all contributions must respect our core architectural invariants.

---

## 1. Non-Negotiable Invariants

Before writing or submitting code, ensure your changes adhere to these rules:

1. **Zero Dynamic Allocation in Hot Loops:**
   * No `new Object()`, array spreading, closures, or dynamic string parsing inside animation/physics tick loops (`requestAnimationFrame`).
   * Hot-loop state must read from and write to pre-allocated typed buffers (`Float32Array`).
2. **Fixed Memory Footprint:**
   * Total WASM linear memory is constrained to **448 KB**. Contributions must not expand memory pages without formal architectural approval.
3. **Zero External Runtime Dependencies:**
   * Do not add runtime `npm` packages, external WebGL/canvas libraries (e.g., Three.js), or CDN references. The runtime bundle must remain self-contained (< 35 KB).
4. **Air-Gap & Zero Telemetry Integrity:**
   * Zero network calls, telemetry beacons, or external asset fetching are permitted at runtime. Cartridges must execute cleanly under `file://` or in completely offline environments.
5. **Universal Interface Contract:**
   * All interactive actuation must conform to the 4-slot generic action tuple protocol:
     `(:seek <keyframe>)`, `(:highlight <id>)`, `(:var <reg> <val>)`, `(:say "<text>")`.

---

## 2. The Cartridge Pipeline Workflow

Modifying or adding an interactive simulation involves a synchronized toolchain:

[scene.svg] (Vector Geometry & Semantic IDs)
+
[scene.ast] (Lisp S-expression bindings & easing)
│
▼ (compile-ast-bytecode.ts)
[scene.astb] (Packed Binary Bytecode Cartridge)
│
▼
[ast-engine.js + WASM] (Zero-GC Execution @ 60 FPS)


* **Do not edit compiled output:** Never manually edit generated `.astb` or distribution bundle files.
* **ID Alignment:** Every animated entity in `scene.svg` must possess a semantic `id` directly addressed by bindings in `scene.ast`.
* **Grammar Verification:** Ensure any changes to declarative actions parse cleanly against the repository's GBNF grammar definitions.

---

## 3. How to Submit Contributions

1. **Open an Issue First:**
   * For any substantive changes to kinematics, compiler logic, or memory layout, open an issue describing the mathematical and architectural implications before submitting a PR.
2. **Run Performance & Frame Audits:**
   * Test your branch on low-spec hardware or a throttled CPU profile (4x–6x slowdown in DevTools).
   * Verify that Garbage Collection allocation profiles remain flat during active simulation playback.
3. **Accessibility Verification:**
   * Ensure new visual nodes retain semantic SVG descriptions and that textual transcrip
[scene.svg] (Vector Geometry & Semantic IDs)
+
[scene.ast] (Lisp S-expression bindings & easing)
│
▼ (compile-ast-bytecode.ts)
[scene.astb] (Packed Binary Bytecode Cartridge)
│
▼
[ast-engine.js + WASM] (Zero-GC Execution @ 60 FPS)

* **Do not edit compiled output:** Never manually edit generated `.astb` or distribution bundle files.
* **ID Alignment:** Every animated entity in `scene.svg` must possess a semantic `id` directly addressed by bindings in `scene.ast`.
* **Grammar Verification:** Ensure any changes to declarative actions parse cleanly against the repository's GBNF grammar definitions.

---
## 4. How to Submit Contributions

1. **Open an Issue First:**
   * For any substantive changes to kinematics, compiler logic, or memory layout, open an issue describing the mathematical and architectural implications before submitting a PR.
2. **Run Performance & Frame Audits:**
   * Test your branch on low-spec hardware or a throttled CPU profile (4x–6x slowdown in DevTools).
   * Verify that Garbage Collection allocation profiles remain flat during active simulation playback.
3. **Accessibility Verification:**
   * Ensure new visual nodes retain semantic SVG descriptions and that textual transcripts (`:say`) are properly synchronized for assistive outputs.
