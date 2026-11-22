# AST Tuple Specification (`tuples.md`)

Authoritative grammar reference for **wwwebucation** declarative S-expression cartridges (`.ast` → `.astb`).  
Designed for **zero-JS authoring**, **zero-GC 60 FPS execution**, **offline air-gapped classrooms**, and **compact Gemini Nano token budgets**.

---

## 1. Architectural Invariants

- **Pure SVG Visual Skin**: Every rendered element lives in W3C SVG DOM (`<svg>`, `<g>`, `<path>`, `<rect>`, `<text>`). Never emit `<canvas>`, WebGL, or inline `<script>`.
- **Zero-JS Cartridges**: Express all interactivity, state transitions, and math via declarative tuples and Pure-Lisp expressions. All execution mechanics live in the generic VM (`static/player/ast-*.js` and `site-gestures*.js`).
- **Zero-GC 60 FPS Hot Loop**:
  - `(:for ...)` / `(:repeat ...)` expand **once at parse/compile time** into flat bindings.
  - Grouped `(:target ...)` and guarded `(:when ...)` flatten at parse time; guard predicates (`whenFn`) compile once at mount time.
  - `(let ...)` allocates a fixed closure-scoped `localSlots` array at compile time (0 per-frame heap allocations).
- **Binary Parity**: Every binding form (including `:for`, grouped `:target`, and `:when` via `OP_BINDING_WHEN = 0x31`) compiles deterministically to `.astb` bytecode.
- **Screen-Reader Safety**: Hide inactive spreads/pages with `display: "none"` (never `opacity: 0` alone). Decorative shapes use `aria-hidden="true"`; interactive SVG `<g>` controls carry `role="button"`, `tabindex="0"`, and `aria-label`.

---

## 2. Top-Level `(:scene ...)` Schema

```lisp
(:scene
  :id "unique-slug"
  :title "Human Readable Title"
  :type "Sim"                 ; "Sim" | "Slide" | "App" | "Film"
  :starter true               ; optional starter flag
  :oak-id "oak-lesson-slug"   ; optional Oak curriculum link
  :oak-unit "unit-name"       ; optional curriculum unit
  :stage "stage-file.svg"     ; companion SVG path (omit in single-file .ast.svg)
  :duration 10.0              ; timeline length in seconds (t in 0.0..1.0)
  :boot-sound "chime"         ; optional Web Audio boot cue
  :video "clip.webm"          ; optional video background
  :video-fit "contain"        ; "contain" | "cover" | "fill"

  (:use-skill "storybook-reader" :pages 5)  ; reusable player skill(s)
  (:controls ...)             ; platform feature switches
  (:vars ...)                 ; reactive state variables
  (:inputs ...)               ; HUD sliders / toggles / buttons
  (:computed ...)             ; derived reactive variables
  (:camera ...)               ; 3D projection camera (optional)
  (:camera-stops ...)         ; 3D camera waypoints (optional)
  (:bindings ...)             ; reactive SVG / 3D / var bindings (flat & nested)
  (:gestures ...)             ; pointer, keyboard & nested action pipelines
  (:physics ...)              ; rigid bodies & springs (optional)
  (:emitters ...)             ; SoA particle pools & obstacles (optional)
  (:state-machines ...)       ; finite state automata (optional)
  (:scope ...)                ; live oscilloscope plotter (optional)
  (:ledger ...)               ; live data table / balance ledger (optional)
  (:keyframes ...)            ; timed narrative keyframes (optional)
  (:subtitles ...)            ; multilingual timed captions (optional)
  (:interactive ...)          ; formative assessment checkpoints (optional)
  (:quests ...)               ; gamified mission / question packs (optional)
  (:static ...)               ; one-time static DOM attributes (optional)
  (:actors ...)               ; named actor registry (optional)
)
```

---

## 3. State, Controls & Derived Variables

### `(:vars ...)`
Declares mutable numeric or string state accessible as bare identifiers inside expressions (`vars.<name>`).
```lisp
(:vars
  (:var :name "page" :initial 0 :min 0 :max 4)
  (:var :name "speed" :initial 1.5 :min 0 :max 5)
  (:var :name "activeWord" :initial "")
)
```

### `(:inputs ...)` (alias `(ui:controls ...)`)
Generates native HUD controls bound directly to `:vars`.
```lisp
(:inputs
  (:slider :var "speed" :label "Velocity" :min 0 :max 10 :step 0.5 :unit "m/s")
  (:toggle :var "showVectors" :label "Force Arrows")
  (:select :var "planet" :label "Gravity" :options ("Earth" "Moon" "Mars"))
  (:button :label "Reset" :action "reset")
)
```

### `(:computed ...)`
Evaluated once per frame before `:bindings`, exposing derived variables to bindings and checkpoints.
```lisp
(:computed
  (:var :name "pageIdx" :expr "(clamp (round page) 0 4)")
  (:var :name "kineticEnergy" :expr "(* 0.5 mass (pow speed 2))")
)
```

---

## 4. Pure-Lisp Expression Dialect (`ast-expr.js`)

All `:expr`, `:when`, `:if`, and `:pass-expr` strings should use **Pure-Lisp S-expressions**. Bare identifiers resolve against `vars` (plus `t` for normalized timeline `0..1`, `PI`, `E`).

### Arithmetic, Logic & Comparisons
- **Arithmetic**: `(+ a b ...)`, `(- a b)`, `(* a b ...)`, `(/ a b)`, `(% a b)` / `(mod a b)`, `(pow a b)`
- **Math**: `(sin x)`, `(cos x)`, `(tan x)`, `(asin x)`, `(acos x)`, `(atan x)`, `(atan2 y x)`, `(abs x)`, `(sqrt x)`, `(floor x)`, `(ceil x)`, `(round x)`, `(min a b ...)`, `(max a b ...)`, `(log x)`, `(exp x)`, `(sign x)`
- **Comparisons**: `(= a b)` / `(== a b)`, `(!= a b)`, `(< a b)`, `(<= a b)`, `(> a b)`, `(>= a b)`
- **Boolean Logic**: `(and a b ...)`, `(or a b ...)`, `(not a)`

### Structured Control Flow & Zero-GC Lexical Scope (Nested Forms)
- **`(if cond then else)`** — Ternary branch.
- **`(let ((name expr) ...) body)`** / **`(let* ((name expr) ...) body)`** — Sequential lexical bindings compiled to pre-allocated integer slot reads/writes (**0 per-frame GC allocations**). Eliminates duplicate sub-expressions.
  ```lisp
  (let ((p (clamp (round page) 0 4))
        (pct (* (/ (+ p 1) 5) 100)))
    (concat "Page " (+ p 1) " (" (fixed pct 0) "%)"))
  ```
- **`(cond (test1 val1) (test2 val2) (else fallback))`** — Multi-way conditional chain (`else` or `true` as default branch).
  ```lisp
  (cond ((< ph 6.5) "#ef4444")
        ((> ph 7.5) "#3b82f6")
        (else "#22c55e"))
  ```
- **`(case key (v1 res1) (v2 res2) (else fallback))`** (alias **`match`**) — Strict value switch (`===`). Evaluates `key` once.
  ```lisp
  (case state
    (0 "Ready")
    (1 "Running")
    (else "Complete"))
  ```
- **`(nth index v0 v1 v2 ...)`** (alias **`pick`**) — Clamped 0-based inline lookup table (no string parsing or object allocation).
  ```lisp
  (nth pageIdx "Pat sat." "Pat had a cat." "The cat sat on a mat.")
  ```
- **`(concat a b ...)`** (alias **`str`**) — String concatenation.
- **`(fixed num digits)`** — Fixed-decimal number formatting (`Number(num).toFixed(digits)`).

### Geometry, Transform & Animation Helpers
- **Math Utilities**: `(clamp x lo hi)`, `(lerp a b t)`, `(map x inMin inMax outMin outMax)`, `(rad deg)`, `(deg rad)`, `(dist x1 y1 x2 y2)`, `(sineWave freq phase amp)`, `(smoothstep edge0 edge1 x)`
- **SVG Transforms**: `(translate x y)`, `(rotate deg cx cy)`, `(scale sx sy)`
- **Easing & Morphing**: `(astMorphPath pathA pathB t)`, `(astMorphColor hexA hexB t)`, `(astEaseBack t)`, `(astEaseBounce t)`, `(astEaseElastic t)`, `(astSquashStretch t intensity)`

---

## 5. Bindings & Nested Composition (`:bindings`)

Bindings map reactive expressions to SVG DOM attributes, text nodes, 3D projected primitives, or tick-updated variables.

### 5.1 Flat Primitives (Always Supported)
```lisp
(:bindings
  ; Standard target attribute binding
  (:target "#needle" :attr "transform" :expr "(rotate (* angle 1.8) 200 200)")
  ; Text content binding (:attr "textContent" or :text shorthand)
  (:target "#readout" :attr "textContent" :expr "(concat (fixed speed 1) ' m/s')")
  (:text :target "#title" :expr "(nth pageIdx 'Cover' 'Chapter 1')")
  ; Shorthand :attr form
  (:attr :target "#bar" :name "width" :expr "(* progress 240)")
  ; Per-tick state variable update
  (:var :name "angle" :expr "(% (+ angle (* speed 2)) 360)")
)
```

### 5.2 Grouped Multi-Attribute `(:target ...)`
Attach multiple attributes, text nodes, and nested `:when` guards to a single SVG selector without repeating `:target "#id"`.
```lisp
(:target "#piston"
  (:attr "transform" "(translate 0 (* (- 1 pressure) 80))")
  (:attr "fill" :expr "(cond ((> temp 80) '#ef4444') (else '#38bdf8'))")
  (:when "(= showLabels 1)"
    (:attr "stroke-width" "3"))
)
```
Both 2-arg shorthand `(:attr "fill" "<expr>")` and keyword form `(:attr "fill" :expr "<expr>")` are supported, alongside `(:text "<expr>")` / `(:text :expr "<expr>")`.

### 5.3 Guarded Subtrees `(:when "<cond>" ...)` & `(:group ...)`
Skip DOM mutation completely when `<cond>` is falsy (zero DOM writes when inactive). Nested `:when` guards compose automatically via logical `(and outer inner)`.
```lisp
(:when "(= mode 1)"
  (:target "#force-arrow"
    (:attr "display" "'inline'")
    (:attr "transform" "(translate (* fx 10) 0)"))
  (:when "(> fx 5)"
    (:target "#warning-badge" :attr "opacity" :expr "1"))
)

(:group
  (:target "#a" :attr "opacity" :expr "alpha")
  (:target "#b" :attr "opacity" :expr "(- 1 alpha)"))
```
> **Note**: Guarded bindings compile directly to binary opcode `OP_BINDING_WHEN (0x31)` in `.astb` files.

### 5.4 Compile-Time Macro Loops: `(:for ...)` & `(:repeat ...)`
Eliminates repetitive boilerplate for pages, grid cells, LED bars, or timeline dots. Expanded **once at parse/compile time** (0 runtime overhead, max nesting depth 6, max 512 iterations per loop).

**Numeric Range** (inclusive `start..end`, optional `step`):
```lisp
(:for i (0 4)
  (:target "#book-page-{{i}}"
    :attr "display"
    :expr "(if (= pageIdx {{i}}) 'inline' 'none')")
  (:target "#page-dot-{{i}}"
    (:attr "fill" "(if (= pageIdx {{i}}) '#1e293b' '#cbd5e1')")
    (:attr "r" "(if (= pageIdx {{i}}) 6 4)"))
)
```

**List Iteration & Template Arithmetic** (`{{var}}`, `{{var+N}}`, `{{var-N}}`, `{{var*N}}`):
```lisp
; Nested 2D grid (e.g. 3x4 brick matrix)
(:for r (0 2)
  (:for c (0 3)
    (:target "#cell-{{r}}-{{c}}"
      :attr "opacity"
      :expr "(if (>= activeCount (+ (* {{r}} 4) {{c+1}})) 1 0.15)")))

; String list iteration
(:for wire ("live" "neutral" "earth")
  (:target "#wire-{{wire}}"
    :attr "stroke-opacity"
    :expr "(if (= power 1) 1 0.25)"))
```
`:repeat` is an exact alias for `:for`.

### 5.5 3D Projection Bindings
Requires `(:camera :fov 520 :cx 400 :cy 250 :z-offset 320 :yaw 0 :pitch 0)`.
- `(:3d-node :target "#pt-1" :x "..." :y "..." :z "..." :scale-r "6")`
- `(:3d-line :target "#edge-1" :x1 "..." :y1 "..." :z1 "..." :x2 "..." :y2 "..." :z2 "...")`
- `(:3d-ring :target "#orbit-1" :rx "..." :ry "..." :rz "..." :tilt "...")`
- `(:3d-polygon :target "#face-1" :points "x1,y1,z1;x2,y2,z2;...")`

---

## 6. Direct Manipulation, Skills & Nested Gesture Pipelines

### 6.1 Reusable Skills (`:use-skill`) & Feature Switches (`:controls`)
Skills live declaratively in `static/player/player-gestures.ast` and are activated in one line:
```lisp
(:use-skill "storybook-reader" :pages 5)

(:controls
  :arrow-step true   ; Left/Right arrows step slides
  :num-jump true     ; 1-9 jump to slides
  :scrub true        ; timeline scrubber enabled
  :space-play false  ; Space toggles play/pause
  :quiz-keys true    ; A/B/C/D answer checkpoints
  :whiteboard true   ; smartboard stylus ink layer
  :xray true         ; data-pedagogical X-Ray inspector
  :audio true        ; procedural Web Audio sonification
  :param-hud true)   ; floating parameter readout
```

### 6.2 Gesture Primitives (`:gestures`)
- **`(:clickable :target ".selector" ...)`** — Pointer click/tap & Enter/Space keyboard activation.
- **`(:holdable :target "#btn" :hold-var "throttle" :val 1 :release-val 0 :rate 2.5 ...)`** — Continuous press-and-hold (pointer + keyboard).
- **`(:draggable :target "#slider-knob" :var "x" :axis "x" :min 0 :max 100 ...)`** — Direct SVG pointer drag (`:axis "x" | "y" | "xy"`).
- **`(:rotatable :target "#dial" :var "angle" :cx 200 :cy 200 :min 0 :max 360)`** — Angular dial rotation around pivot.
- **`(:trackball :target "#stage-3d" :yaw-var "yaw" :pitch-var "pitch")` — 3D camera orbit drag.**
- **`(:key :code "ArrowRight" ...)`** — Scoped keyboard shortcut.

### 6.3 Flat Declarative Gesture Attributes
`(:action "step-slide" | "goto-slide" | "<registered>")`, `:delta`, `:count`, `:from-attr`, `:set-var`, `:val`, `:toggle-var`, `:step-var`, `:min`, `:max`, `:clear-var`, `:reset-var`, `:reset-val`, `:tone`, `:speak`, `:speak-var`, `:fallback-var`, `:speak-attr`, `:speak-rate-var`, `:speak-pitch`, `:if`.

### 6.4 Composable Nested Gesture Action Trees (`:seq` & `:if`)
Replace ad-hoc inline JS with arbitrarily nested, zero-JS declarative action pipelines inside any `:clickable`, `:holdable`, or `:key` gesture:
```lisp
(:gestures
  (:clickable :target ".word-tile"
    (:seq
      (:set-var "activeWord" :from-attr "data-word")
      (:if "(= phonicsMode 1)"
        (:seq
          (:speak-attr "data-phonemes" :pitch 1.05)
          (:tone "523.25"))
        (:seq
          (:speak-attr "data-word")
          (:step-var "wordsRead" :delta 1 :min 0 :max 50)
          (:tone "659.25")))))
)
```
Supported nested step forms:
- `(:seq <step1> <step2> ...)` — Execute child steps in order.
- `(:if "<cond>" <then-step> [<else-step>])` — Branch using Pure-Lisp predicate (evaluated against live `vars` and `t`).
- `(:set-var "name" :val 1)` or `(:set-var "name" :from-attr "data-val")`
- `(:toggle-var "name")`
- `(:step-var "name" :delta 1 :min 0 :max 10)`
- `(:clear-var "name")` / `(:reset-var "name" :val 0)`
- `(:action "step-slide" :delta 1 :count 5)` / `(:action "goto-slide" :from-attr "data-page" :count 5)`
- `(:tone "523.25")` — Procedural Web Audio ping (Hz).
- `(:speak "Well done!")` / `(:speak-var "activeWord" :fallback-var "pageText")` / `(:speak-attr "data-word")`

### 6.5 Hypervisor-Gated Site Directives
Cartridges may invoke allowlisted host portal actions via `:action` (validated by `nanoSiteManager.ts`):
- `"navigate"` (`:route "/curriculum"`), `"load-cartridge"` (`:slug "fractions"`), `"toggle-bsl"`, `"toggle-sound"`, `"open-tutor"`, `"set-render-mode"`, `"site-directive"`.

---

## 7. Physics, Particles, State Machines & Instruments

### Physics (`:physics`)
Sub-stepped zero-GC rigid body & Hooke spring solver (`ast-physics.js`):
```lisp
(:physics :gravity 9.81 :substeps 4
  (:body :id "mass1" :target "#bob" :x 200 :y 120 :mass 1.0 :restitution 0.8)
  (:spring :a "anchor" :b "mass1" :k 18.0 :rest-length 90 :damping 0.15))
```

### Particle Emitters (`:emitters`)
Structure-of-Arrays (SoA) fixed-capacity particle pool:
```lisp
(:emitters
  (:emitter :id "gas" :target "#molecule-layer" :max 40 :rate 12
    :x 200 :y 200 :vx "(- (sin t) 0.5)" :vy "-2" :life 2.0 :radius 4 :color "#38bdf8")
  (:obstacles
    (:rect :x 50 :y 50 :w 300 :h 200 :bounce 0.95)))
```

### State Machines (`:state-machines`)
```lisp
(:state-machines
  (:machine :id "circuit" :var "phase" :initial "idle"
    (:state :name "idle"
      (:transition :to "charging" :when "(> voltage 1.5)"))
    (:state :name "charging"
      (:transition :to "full" :when "(>= charge 100)"))))
```

### Live Instruments (`:scope` & `:ledger`)
- **Oscilloscope**: `(:scope :target "#scope-path" :var "displacement" :samples 120 :min -100 :max 100)`
- **Ledger**: `(:ledger :target "#ledger-rows" :columns ("t" "V" "I"))`

---

## 8. Narrative, Checkpoints & Quests

### Keyframes & Subtitles
```lisp
(:keyframes
  (:keyframe :at 0.0 :label "Introduction")
  (:keyframe :at 0.5 :label "Reaction Peak"))
(:subtitles
  (:cue :start 0.0 :end 0.4 :text "Heat increases particle kinetic energy."))
```

### Formative Checkpoints (`:interactive`)
```lisp
(:interactive
  (:checkpoint :id "q1" :at 0.5
    :prompt "Which pH value is neutral?"
    :options ("pH 2" "pH 7" "pH 12")
    :answer 1
    :explanation "Pure water has an equal concentration of H+ and OH- ions (pH 7).")
  ; Sandbox mastery checkpoint using a Pure-Lisp pass predicate:
  (:checkpoint :id "balance-task" :at 1.0
    :prompt "Balance the beam by setting torque to 0 N·m."
    :pass-expr "(< (abs netTorque) 0.2)"
    :hold-duration 1.2
    :on-wrong "Check the distance of the heavier weight from the fulcrum."))
```

### Quests (`:quests`)
```lisp
(:quests
  (:missions
    (:mission :id "m1" :title "Neutralise the Acid" :goal-expr "(and (>= ph 6.8) (<= ph 7.2))")))
```

---

## 9. Complete Compact Nested Example

A 5-page interactive phonics storybook using `:use-skill`, `:for`, grouped `:target`, `:when`, `:seq`, `:if`, `(let ...)`, and `(nth ...)` — ~35 lines instead of 150+:

```lisp
(:scene
  :id "reader-demo"
  :title "Pat Sat"
  :type "Slide"
  :stage "reader-demo.svg"
  :duration 5.0

  (:use-skill "storybook-reader" :pages 5)

  (:vars
    (:var :name "page" :initial 0 :min 0 :max 4)
    (:var :name "phonicsMode" :initial 1 :min 0 :max 1)
    (:var :name "activeWord" :initial "")
    (:var :name "wordsRead" :initial 0 :min 0 :max 50))

  (:computed
    (:var :name "pageIdx" :expr "(clamp (round page) 0 4)")
    (:var :name "pageText" :expr "(nth pageIdx 'Pat sat.' 'Pat had a cat.' 'The cat sat.' 'Pat taps the cat.' 'The end.')"))

  (:bindings
    ; Compile-time loop generates all 5 page visibility & indicator bindings
    (:for i (0 4)
      (:target "#book-page-{{i}}"
        :attr "display"
        :expr "(if (= pageIdx {{i}}) 'inline' 'none')")
      (:target "#page-dot-{{i}}"
        (:attr "fill" "(if (= pageIdx {{i}}) '#1e293b' '#cbd5e1')")
        (:attr "r" "(if (= pageIdx {{i}}) 6 4)")))

    ; Grouped multi-attr + lexical (let ...) readout
    (:target "#book-page-num"
      (:text "(let ((n (+ pageIdx 1))) (concat 'Page ' n ' of 5'))"))

    ; Guarded binding: skips DOM writes unless a word is selected
    (:when "(!= activeWord '')"
      (:target "#active-word-pill"
        (:attr "display" "'inline'")
        (:text "activeWord"))))

  (:gestures
    (:clickable :target ".word-tile"
      (:seq
        (:set-var "activeWord" :from-attr "data-word")
        (:step-var "wordsRead" :delta 1 :min 0 :max 50)
        (:if "(= phonicsMode 1)"
          (:seq (:speak-attr "data-phonemes") (:tone "523.25"))
          (:seq (:speak-attr "data-word") (:tone "659.25"))))))
)
```
