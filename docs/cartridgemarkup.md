Fair point. When you invent an entirely bespoke, homoiconic S-expression specification for a 60 FPS deterministic vector-spatial engine, a reference manual isn't a luxury—it's the only thing standing between clean execution and torn SVG stages.

Here is the authoritative **Cartridge Scene Definition Specification & Authoring Manual** for your AST engine.

---

# CARTRIDGE ENGINE SPECIFICATION (v1.0)

### Deterministic Vector-Spatial S-Expression Grammar

---

## 1. Core Architectural Axioms

1. **Pure Functional Projection:** A scene is an invariant mapping $S(t, \vec{v}) \to \text{DOM/WASM Stage}$, where $t \in [0.0, 1.0]$ is the normalized temporal scalar and $\vec{v}$ is the state vector of user variables.
2. **Deterministic Sovereignty:** Time progresses exclusively via the external tick machine. No asynchronous callbacks, no `requestAnimationFrame` leaks, no DOM timeouts.
3. **Fail-Safe Clamping:** The evaluator does not infer boundaries. Every transform, interpolation, and register calculation must explicitly defend against $t < 0.0$ and $t > 1.0$.

---

## 2. Root Scene Form

```lisp
(:scene 
  :id        "<kebab-case-slug>"
  :type      "Sim" | "Lab" | "Lecture"
  :oak-id    "OAK-<KEYSTAGE>-<SUBJECT>-<INDEX>"
  :oak-unit  "<curriculum-unit-slug>"
  :title     "<Display Title>"
  :stage     "<Curriculum Tier>"
  :duration  <Float: Wall-clock seconds for t 0.0 -> 1.0>
  
  (:vars (...))
  (:inputs (...))
  (:computed (...))
  (:gestures (...))
  (:subtitles (...))
  (:keyframes (...))
  (:interactive (...))
  (:bindings (...))
)

```

---

## 3. Section Grammar & Rules

### `(:vars ...)` — Mutable State Vector

Defines user-alterable simulation parameters. These are exposed to the engine as `vars.<name>`.

```lisp
(:var 
  :name  "<camelCaseName>"
  :val   <Float | Integer: Initial baseline>
  :min   <Float: Lower limit>
  :max   <Float: Upper limit>
  :step  <Float: Resolution delta>
  :unit  "<String: Optional display unit>"
  :label "<Human-readable label>"
)

```

* **Rule:** If a variable is adjusted, the VM preserves its state across timeline scrubs. Never mutate `vars` inside an expression.

---

### `(:inputs ...)` — Hardware & Interface Controls

Declares user-facing control surfaces.

```lisp
(:slider 
  :var   "<matches var name>"
  :label "<Label text>"
  :min   <Float>
  :max   <Float>
  :step  <Float>
)

```

* **Rule:** `min`, `max`, and `step` should match the underlying `(:var)` declaration to prevent quantization error.

---

### `(:computed ...)` — Derived Mathematical Pipeline

Evaluates intermediate expressions once per tick before property binding. Prevents repeated math inside DOM setters.

```lisp
(:name "<identifier>" :expr "<JavaScript Math String>")

```

* **Available Scope:** `t` (normalized time), `vars.<name>`, `Math.*`.
* **Standard Boilerplate:** Every complex scene should declare a clamped time variable:
```lisp
(:name "clampedT" :expr "Math.min(1.0, Math.max(0.0, t))")

```



---

### `(:gestures ...)` — Direct Screen Manipulation

Binds pointer/touch physics directly to an element and reflects it into a variable or coordinate.

```lisp
;; Linear translation
(:draggable :target "<CSS-Selector>" :axis "x" | "y" | "xy" :min <Int> :max <Int>)

;; Rotational Dial (True Polar)
(:rotate    :target "<CSS-Selector>" :cx <Int> :cy <Int> :var "<targetVar>")

```

* **CRITICAL RULE (The Needle Law):** Never assign an `:axis "xy"` draggable gesture to an element driven by a polar `rotate(angle cx cy)` binding. Cartesian displacement conflicts with radial transforms, tearing the SVG anchor point.

---

### `(:subtitles ...)` — Linguistic Track (Multilingual & BSL Sync)

Synchronized educational closed copy.

```lisp
(:start <0.00 - 1.00> :end <0.00 - 1.00> 
  :en "<English>" 
  :es "<Spanish>" 
  :la "<Latin / Secondary>")

```

* **CRITICAL RULE:** All `:start` and `:end` timestamps **must be normalized decimals ($0.0 \to 1.0$)**, matching `:duration`. Never write raw wall-clock seconds here unless your engine compiles against duration during parsing.

---

### `(:keyframes ...)` — Pedagogical Stage Markers

Chronological checkpoints for the scrub bar, visual markers, and avatar topic changes.

```lisp
(:t <0.00 - 1.00> 
  :title "<Step Name>" 
  :rule  "<Core Principle / Physics Law>")

```

---

### `(:interactive ...)` — In-Loop Formative Assessment

Pauses execution on a specific tick until the student verifies comprehension.

```lisp
(:checkpoint :t <0.00 - 1.00>
  :prompt      "<Clear question>"
  :options     ("<Option 0>" "<Option 1>" "<Option 2>" "<Option 3>")
  :answer      <Zero-indexed Integer: Correct index>
  :explanation "<Detailed feedback explaining the mechanics>")

```

* **Rule:** Checkpoints halt the tick clock. Resuming playback smoothly unpauses $t$.

---

### `(:bindings ...)` — The Vector Pipeline

Maps mathematical output straight into SVG/DOM attributes at 60 FPS.

```lisp
(:target "<CSS-Selector>" :attr "<SVG/DOM-Attribute>" :expr "<Evaluated String>")

```

#### Valid Target Attributes:

* **Geometry:** `cx`, `cy`, `x1`, `y1`, `x2`, `y2`, `r`, `width`, `height`
* **Transforms:** `transform` (e.g. `'translate(x, y)'`, `'rotate(deg cx cy)'`, `'scale(s)'`)
* **Styling:** `stroke`, `fill`, `stroke-width`, `opacity`
* **Text:** `textContent`

---

## 4. Mandatory Safety Rules for Expression Authors

### Rule 1: The Bounds-Checking Mandate

Always wrap un-clamped timeline progressions:

```javascript
// WRONG: Runaway line at t > 1.0
:expr "180 + t * 220"

// CORRECT: Clamped to summit/terminus
:expr "180 + Math.min(1.0, t) * 220"

```

### Rule 2: Dynamic Slider Fallbacks

Sliders can be untouched (`undefined`) or set to `0`. Always use guards or ternary operators:

```javascript
// WRONG: Fails or assumes static baseline
:expr "vars.peakHeight * t"

// CORRECT: Clean fallback
:expr "(vars.peakHeight || 3000) * Math.min(1.0, t)"

```

### Rule 3: Hex Padding for Low-Level Emulation (MOS 6502)

When converting math to byte readouts, single-digit hex numbers broke 8-bit alignment:

```javascript
// WRONG: Produces '&A' instead of '&0A'
:expr "'&' + val.toString(16).toUpperCase()"

// CORRECT: Full 8-bit and 16-bit registers
:expr "'&' + val.toString(16).toUpperCase().padStart(2, '0')"

```

### Rule 4: Harmonic Motion vs. Fluid Drift

* For **pendulums / periodic mechanical systems**: Use zero-centered sinusoids around a pivot:
`'rotate(' + (Math.sin(t * FREQ) * AMP) + ' CX CY)'`
* For **thermodynamic dispersion (smoke, bubbles, heat)**: Never use pure opacity modulation. Combine:
1. Continual upward translation (`-y % boundary`)
2. Damped lateral wandering (`sin(t) * amplitude`)
3. Continuous scale expansion with inverse alpha (`scale(1 + ...)`, `opacity(1 - ...)`)



---
