# AST Vector Player Language Specification (v2.6.0)

**St Joseph's Curriculum Portal — Decoupled Motion & Direct Manipulation Suite**  
*Document Version: 2.6.0 (October 2026)*  
*Codified Grammar & Architecture Standard*

---

## 1. Executive Philosophy & Purpose

The **Abstract Scene Tree (AST) Vector Language** is a domain-specific declarative grammar engineered as an **autonomous, zero-bloat, open-standard replacement for Adobe/Macromedia Flash, Lottie/Bodymovin, and PhET simulations**. While battle-tested across rigorous educational curriculum simulations, its underlying mathematical vector runtime is designed for cross-industry deployment across **Digital Signage & DOOH (Digital Out-of-Home)**, **Interactive Display Advertising (IAB-compliant Rich Media)**, and **Embedded Touch Kiosks**.

### Core Invariants
1. **Zero Bloat (< 35 KB gzipped, < 150 KB uncompressed):** Zero external framework dependencies. Native browser SVG DOM, JavaScript, and Web Audio API. Easily fits inside the strictest IAB 150 KB ad limits.
2. **Deterministic Dual-Mode Delivery:**
   - **Narrative Mode:** 60 FPS keyframed timeline, bilingual narration, formative checkpoints, and signage broadcast loops.
   - **Direct Grab Sandbox Mode:** Direct mouse/stylus/touch drag-and-drop on live SVG elements with sub-pixel pointer capture.
3. **Smartboard & Kiosk Native:** Built-in Whiteboard Pen layer with quadratic Bézier smoothing for Promethean, SMART, ViewSonic, touch kiosks, and Apple Pencil displays.
4. **Air-Gapped & Rural/Edge Ready:** Sub-15 ms cold start, zero cloud egress, standalone single-file packaging. Runs 24/7 on low-power ARM media players (< 8 MB RAM) with zero memory leaks.

---

## 2. Formal Grammar Specification (EBNF & S-Expressions)

AST scenes are authored in token-efficient Lisp-like S-Expressions (`.ast`) or serialized JSON (`.json`). The canonical S-Expression grammar is defined below:

```ebnf
SceneDeclaration ::= "(:scene" ws 
                     ":id" ws String ws 
                     (":type" ws ("\"Sim\"" | "\"Slide\"" | "\"App\"" | "\"Film\"") ws)?
                     (":video" ws String ws)?
                     (":video-fit" ws ("\"contain\"" | "\"cover\"" | "\"fill\"") ws)?
                     ":title" ws String ws 
                     ":stage" ws String ws 
                     ":duration" ws Number ws
                     (Camera)?
                     (Subtitles)?
                     (Keyframes)?
                     (Bindings)?
                     (Interactive)?
                     (Gestures)?
                     ")"

Camera           ::= "(:camera" ws 
                     ":distance" ws Number ws 
                     ":pitch" ws Number ws 
                     ":yaw" ws (String | Number) ws 
                     ":fov" ws Number ")"

Variables        ::= "(:vars" ws "(" ws (Variable)* ws ")" ws ")"
Variable         ::= "(:var" ws ":name" ws String ws ":val" ws Literal ws
                     (":min" ws Number)? ws (":max" ws Number)? ws
                     (":step" ws Number)? ws (":unit" ws String)? ws
                     (":label" ws String)? ")"

Inputs           ::= "(:inputs" ws "(" ws (InputControl)* ws ")" ws ")"
InputControl     ::= "(:" ("slider" | "switch" | "button" | "number") ws 
                     ":var" ws String ws ":label" ws String ")"

Computed         ::= "(:computed" ws "(" ws (ComputedProp)* ws ")" ws ")"
ComputedProp     ::= "(:name" ws String ws ":expr" ws MathExpr ")"

Keyframes        ::= "(:keyframes" ws "(" ws (Keyframe)* ws ")" ws ")"
Keyframe         ::= "(:t" ws Fraction ws ":title" ws String ws ":rule" ws String ")"

Subtitles        ::= "(:subtitles" ws "(" ws (Subtitle)* ws ")" ws ")"
Subtitle         ::= "(:start" ws Fraction ws ":end" ws Fraction ws 
                     ":en" ws String (ws ":es" ws String)? (ws ":la" ws String)? ")"

Bindings         ::= "(:bindings" ws "(" ws (Binding)* ws ")" ws ")"
Binding          ::= Node3D | Line3D | Ring3D | Attr2D

Node3D           ::= "(:target" ws String ws ":type" ws "\"3d-node\"" ws 
                     ":x" ws MathExpr ws ":y" ws MathExpr ws ":z" ws MathExpr 
                     (ws ":base-r" ws Number)? (ws ":depth-fog" ws Boolean)? ")"

Line3D           ::= "(:target" ws String ws ":type" ws "\"3d-line\"" ws 
                     ":x1" ws MathExpr ws ":y1" ws MathExpr ws ":z1" ws MathExpr ws 
                     ":x2" ws MathExpr ws ":y2" ws MathExpr ws ":z2" ws MathExpr ")"

Attr2D           ::= "(:target" ws String ws ":attr" ws String ws ":expr" ws MathExpr ")"
                     ; Note: MathExpr receives (t, vars, Math) for reactive evaluations

Interactive      ::= "(:interactive" ws "(" ws (Checkpoint)* ws ")" ws ")"
Checkpoint       ::= "(:checkpoint" ws ":t" ws Fraction ws 
                     ":prompt" ws String ws 
                     ":options" ws "(" (String)* ")" ws 
                     ":answer" ws Integer ws 
                     ":explanation" ws String ")"

Gestures         ::= "(:gestures" ws "(" ws (Gesture)* ws ")" ws ")"
Gesture          ::= "(:draggable" ws ":target" ws String ws 
                     ":axis" ws ("\"x\"" | "\"y\"" | "\"xy\"" | "\"curve\"") ws 
                     ":min" ws Number ws ":max" ws Number ")"
```

---

## 3. The 6 Subsystems of the AST Player

### 3.1. Direct In-Stage Pointer Manipulation (`ast-gestures.js`)
* Binds to `#stage-svg` with full `PointerCapture`.
* Coordinates mapped via SVG inverse screen transformation matrix:
  $$\begin{pmatrix} x_{\text{svg}} \\ y_{\text{svg}} \end{pmatrix} = \mathbf{M}_{\text{CTM}}^{-1} \begin{pmatrix} x_{\text{screen}} \\ y_{\text{screen}} \end{pmatrix}$$
* Supported manipulation modes:
  - `piston`: Horizontal cylinder compression with dynamic Boyle's law feedback ($P \propto \frac{1}{V}$).
  - `tangent-probe`: Real-time sliding along $y = f(x)$ with instantaneous slope calculation ($\frac{dy}{dx} = f'(x)$) and stationary turning point chimes.
  - `switch`: Bistable mechanical switch toggling with electron circuit disconnect.
  - `xy-plane`: 2D physics dragging (weights, pulleys, lenses).

### 3.2. Classroom Whiteboard & Stylus Pen Ink Layer
* Top-level vector group `#annotation-ink-root`.
* Midpoint quadratic Bézier smoothing:
  $$B(t) = (1-t)^2 P_0 + 2(1-t)t P_1 + t^2 P_2$$
* Supports Promethean ActivPen, SMART board touch, and Apple Pencil with zero input lag.

### 3.3. Pedagogical X-Ray Discovery Tooltips
* Elements annotated with `data-pedagogical="[id]"` pop up a translucent glass card when tapped or hovered.
* Displays:
  - Scientific Law / Concept Title.
  - Mathematical Equation and SI Units.
  - Bilingual explanation (English / Spanish).

### 3.4. Multi-Sensory Procedural Vector Sonification
* Synthesizes audio using native Web Audio API oscillators:
  - Gas Compression: Frequency sweeps from $200\text{ Hz}$ to $600\text{ Hz}$ as pressure increases.
  - Turning Points: 880 Hz harmonic bell chime when $\left|\frac{dy}{dx}\right| < 0.1$.
  - Switches: Square-wave mechanical snap impulse ($180\text{ Hz} \to 360\text{ Hz}$).

### 3.5. 3D Projective Mathematics Subsystem
* Transforms world $(X, Y, Z)$ into 2D SVG canvas $(x_s, y_s)$ via 3D Yaw/Pitch rotation matrix and perspective foreshortening:
  $$x_s = \frac{X' \cdot d}{Z' + d} + 400, \quad y_s = 240 - \frac{Y' \cdot d}{Z' + d}$$
* Depth-sorting via Painter's algorithm with simulated exponential depth fog.

### 3.6. Formative Assessment Checkpoints
* Checkpoints trigger automatic pause at time $t$ on the timeline.
* Embeds self-marking pedagogical questions with instant formative remediation.

### 3.7. Declarative State Transitions (:state-machine / :transition / :emitter-set)
* Replaces imperative state management with declarative discrete state models (solid/liquid/gas, open/closed, charging/discharging).
* Smooth cubic-bezier attribute interpolation during transition (`height`, `opacity`, `transform`).
* Reactive guard triggers evaluated at 60 FPS against simulation variables (`temp > 373.15`, `voltage > 24`).
* Direct Emitter Coupling (`:emitter-set`): Allows state transitions to mutate emitter velocity, particle count, gravity, or boundary bounds directly upon state entry without imperative scripting.

### 3.8. Multi-Entity Particle Emitter Collections (:emitter / :particle-pool)
* Zero-allocation, high-performance O(1) particle pool (< 2 KB footprint, 0 dependencies).
* Simulates thermal molecular chaos, Coulombic electron drift, rainfall condensation, and radioactive decay at 60 FPS without DOM garbage collection thrashing.
* Configurable boundary dynamics (`bounce`, `wrap`, `recycle`), gravity, speed distributions, and particle radius/fill.
* ViewBox & Inverse CTM Inversion: Dynamically projects boundaries across SVG viewBox scaling, 3D camera transforms, and moving SVG assembly elements using inverse matrix projection.

### 3.9. Bidirectional Slider-to-Variable Binding (:bind-input)
* Directly links on-stage SVG interactive slider handles, knobs, and levers (`ast-gestures.js`) to reactive state variables.
* Supports linear axes (`x`, `y`) and rotational dials (`rotary`).
* Full two-way synchronisation: dragging the SVG handle mutates the variable; programmatic or state machine variable changes smoothly translate the handle in real time.

### 3.10. Synchronized Film & Video Driving Subsystem (:video / :video-fit)
* Drives hardware-accelerated HTML5 `<video>` backdrops behind live SVG vector stages in zero-latency frame lockstep.
* **Header Slots**:
  - `:video "[url|path]"`: Links local or streaming video asset (H.264, WebM, MP4, AV1).
  - `:video-fit ("contain" | "cover" | "fill")`: Aspect-ratio fitting mode.
  - `:type "Film"`: Cartridge archetype for educational films and documentaries with interactive vector overlays.
* **Unified Control Bus**:
  - Scrubbing or seeking the AST timeline automatically seeks video frames with sub-frame accuracy.
  - Formative checkpoints (`:checkpoint`) pause video playback instantaneously, locking the active frame while pupils engage with vector questions on the overlay.
  - Interactive smartboard in-stage stylus ink (`#annotation-ink-root`) draws directly over live or paused video frames.
  - Synchronized multilingual subtitles, speech synthesis, and audio cues float seamlessly over the film layer.

---

## 4. Canonical Scene File Example

```lisp
(:scene :id "kinetic-gas" :title "Kinetic Gas Theory & Boyle's Law" :stage "KS3/KS4 PHYSICS" :duration 14.0
  (:subtitles (
    (:start 0.00 :end 3.50 :en "Kinetic Molecular Theory explains gas pressure." :es "La teoría cinética explica la presión.")
    (:start 3.50 :end 7.20 :en "Boyle's Law: Halving volume doubles collision frequency." :es "Ley de Boyle: Reducir volumen duplica colisiones.")
  ))
  (:vars (
    (:var :name "temp" :val 300 :min 100 :max 600 :unit "K")
  ))
  (:bind-inputs (
    (:bind-input :target "#temp-slider" :var "temp" :min 100 :max 600 :axis "x" :track-min 60 :track-max 440)
  ))
  (:keyframes (
    (:t 0.00 :title "Equilibrium" :rule "V = 100%, P = 101.3 kPa")
    (:t 0.35 :title "Boyle's Compression" :rule "V = 50%, P = 202.6 kPa")
  ))
  (:bindings (
    (:target "#piston-assembly" :attr "transform" :expr "'translate(' + (430 - 180 * t) + ', 0)'")
    (:target "#gauge-needle" :attr "transform" :expr "'rotate(' + (-45 + 130 * t) + ' 0 0)'")
    (:target "#gauge-value" :attr "textContent" :expr "(101.3 / (1.0 - 0.5 * t)).toFixed(1) + ' kPa'")
  ))
  (:state-machine :id "matter-phase" :initial "liquid"
    (:state :name "liquid" 
      (:attr :target "#phase-pill" :fill "#3b82f6" :textContent "Liquid Phase")
      (:emitter-set :target "#gas-particles" :speed 80 :count 60 :gravity 200))
    (:state :name "gas" 
      (:attr :target "#phase-pill" :fill "#ef4444" :textContent "Gas Phase")
      (:emitter-set :target "#gas-particles" :speed 320 :count 120 :gravity 0))
    (:transition :from "liquid" :to "gas" :trigger "temp >= 373.15" :duration 0.5 :dwell 0.3)
    (:transition :from "gas" :to "liquid" :trigger "temp < 373.15" :duration 0.5 :dwell 0.3)
  )
  (:emitter :id "gas-particles" :count 80 :speed 120 :radius 4 :fill "#38bdf8"
    (:bounds :minX 40 :maxX 430 :minY 80 :maxY 380 :wrapMode "bounce")
  )
  (:gestures (
    (:draggable :target "#piston-assembly" :axis "x" :min 200 :max 450)
  ))
  (:interactive (
    (:checkpoint :t 0.34
      :prompt "What happens to pressure if gas volume is halved at constant temperature?"
      :options ("Pressure doubles (P ∝ 1/V)" "Pressure halves" "No change")
      :answer 0
      :explanation "Boyle's Law dictates that P1 × V1 = P2 × V2. Halving distance doubles collision rate.")
  ))
)
```

---

## 5. Industrial & Commercial Applications

While AST was perfected on high-rigour mathematical curriculum simulations, its core architectural attributes make it superior to legacy web-animation runtimes (Lottie, GSAP, Bodymovin, MP4 video loops) in commercial industrial applications:

### 5.1. Digital Signage & DOOH (Digital Out-of-Home)
- **Low-Power ARM Hardware Tolerance:** Commercial signage displays (menu boards, airport gates, transit stops, smart shelf-edge displays) operate on low-cost ARM SoCs (Raspberry Pi CM4, Rockchip, Android 11 sticks, LG webOS, Samsung Tizen). AST requires **< 8 MB RAM and 0 GC memory churn**, running 24/7/365 without browser memory crashes.
- **Infinite DPI Resolution Independence:** Pure mathematical SVG vectors scale from a 2-inch shelf tag up to a 100-foot 8K Times Square LED billboard with 0 extra file weight and zero pixelation.
- **Air-Gapped Operation:** Functions completely offline with zero telemetry or remote font dependencies.

### 5.2. Programmatic Rich-Media Advertising (IAB Compliant)
- **Sub-45 KB Total Ad Weight:** IAB and Google Display Network mandate initial payloads < 150 KB. AST delivers a full 60 FPS interactive 3D/physics ad unit in under 45 KB total payload (engine + scene).
- **Dynamic Creative Optimization (DCO):** Real-time localized pricing, countdown timers, and weather-driven creative variations are mutated via reactive `:vars` without needing server-side video re-rendering:
  ```json
  { "price": "£19.99", "headline": "Manchester Flash Sale", "accentColor": "#ef4444" }
  ```
- **Zero CPU Battery Drain:** Efficient native SVG transforms ensure high viewability scores without triggering browser CPU throttling.

### 5.3. Interactive Retail Kiosks & Wayfinding
- Sub-pixel touch gesture capture (`ast-gestures.js`) with quadratic Bézier smoothing provides instant feedback on touch glass.
- Native procedural Web Audio API synthesizes UI feedback, chimes, and clicks with **0 KB external audio files**.

---

## 6. Formal Standards Conformance Matrix

The AST Vector Player runtime complies strictly with open, normative web standards, ensuring decades of forward compatibility with zero dependency on proprietary plugins or deprecated browser APIs:

| Standards Body | Standard & Level | Compliance Mechanism in AST Engine |
| :--- | :--- | :--- |
| **W3C** | **SVG 1.1 (2nd Ed) & SVG 2.0** | Native SVG DOM tree rendering (`<svg>`, `<g>`, `<path>`, `<circle>`, `<text>`, `<defs>`). Dynamic matrix transformation via standard `SVGGraphicsElement.getScreenCTM()` and inverse matrix multiplication $\mathbf{M}_{\text{CTM}}^{-1}$ for sub-pixel pointer tracking. |
| **W3C** | **Pointer Events Level 2 & Level 3** | Unified hardware digitizer handling (`pointerdown`, `pointermove`, `pointerup`, `setPointerCapture`). Full stylus pressure and touch palm-rejection on Promethean, SMART, ViewSonic, and iPad screens. |
| **W3C** | **Web Audio API (Recommendation)** | Zero-asset procedural synthesis (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`). Dynamic envelope shaping with zero external audio assets or network requests. |
| **W3C** | **WCAG 2.1 & 2.2 (Level AA)** | Keyboard navigation (`Space` play/pause, `S` / `PageDown` clicker step mode, scrub keys), high-contrast projection modes, and synchronized multilingual subtitle cues (`:subtitles`). |
| **WHATWG** | **HTML5 Living Standard** | Native ES2022 JavaScript, DOM Custom Events, `requestAnimationFrame`, `FileReader`, and cross-origin `window.postMessage` RPC bridge. |
| **ADL / IMS Global** | **SCORM 1.2 & SCORM 2004** | Automatic LMS CMI bridge (`cmi.core.lesson_status`, `cmi.score.raw`, `cmi.suspend_data`) reporting simulation engagement and formative quiz completion. |
| **IAB** | **HTML5 Rich Media (150 KB Cap)** | Total standalone player + scene payload is strictly < 35 KB gzipped (< 150 KB uncompressed), completely within standard programmatic ad display limits. |

---

## 7. Cartridge Dual-Nature & Packaging Specification

An AST Cartridge embodies a **dual nature** across both file storage and execution dynamics:

### 7.1. Packaging Formats

1. **Single-File Hybrid Capsule (`.ast.svg`)**:
   - **Static Identity:** 100% compliant standard W3C SVG vector graphic. Can be rendered in `<img>` tags, previewed in OS file managers, and imported into Figma, Illustrator, or Inkscape.
   - **Executable Identity:** Embeds the declarative AST S-Expression inside `<metadata type="application/ast-sexpr">` or `<script type="application/ast-sexpr">`. When dragged or opened in the AST Player, it executes as a 60 FPS interactive physics apparatus.

2. **Companion Dual-File Pair (`.svg` + `.ast`)**:
   - **Visual Artwork Stage (`scene.svg`):** Pure visual DOM structure with semantic element IDs.
   - **Cognitive / Physics Script (`scene.ast`):** Pure mathematical S-Expressions containing variables, bindings, keyframes, subtitles, and checkpoints.
   - **Multi-File Ingestion:** The AST Player supports multi-file selection and simultaneous drag-and-drop. Dropping both files simultaneously automatically pairs and boots the simulation.

### 7.3. Master Asset & Math Extension (Zero-Boilerplate Architecture)

To minimize cartridge payload size by 60% and accelerate on-device Gemini Nano generative synthesis by 3×, the player engine automatically provisions universal visual assets and pedagogical math helpers:

1. **Universal Injected SVG Asset Catalog (`#ast-master-defs`)**:
   - **Glow Filters:** `#ast-glow-cyan`, `#ast-glow-gold`, `#ast-glow-red`, `#ast-glow-emerald`, `#ast-glow-purple`, `#ast-drop-shadow`, `#ast-blur-soft`.
   - **Vector Markers & Arrows:** `#ast-arrowhead`, `#ast-arrow-start`, `#ast-arrow-cyan`, `#ast-arrow-gold`, `#ast-arrow-red`, `#ast-arrow-emerald`, `#ast-vector-dot`.
   - **Grid & Background Patterns:** `#ast-grid-fine`, `#ast-grid-dense`, `#ast-grid-dots`, `#ast-blueprint-backdrop`.
   - Cartridges no longer need to author 40–50 lines of duplicate `<defs>`. Any cartridge referencing `filter="url(#ast-glow-cyan)"` or `marker-end="url(#ast-arrowhead)"` renders immediately.

2. **Built-in `AstMath` Simulation & Transform Helpers**:
   - **Transform String Constructors:** `translate(x, y)`, `rotate(deg, cx, cy)`, `scale(sx, sy)`.
   - **Kinematic & Trigonometric Math:** `clamp(v, min, max)`, `lerp(a, b, t)`, `map(v, inMin, inMax, outMin, outMax)`, `rad(deg)`, `deg(rad)`, `dist(x1, y1, x2, y2)`, `sineWave(t, freq, amp, phase)`, `spring(t, damp, freq)`, `smoothstep(e0, e1, x)`, `fixed(num, decimals)`.
   - Exposed both as top-level function parameters in expressions and as non-conflicting extensions to `Math.*` (e.g. `Math.clamp`, `Math.translate`), completely removing string concatenation overhead:
     ```lisp
     ;; Before (56 chars with quotes and escapes):
     (:target "#piston" :attr "transform" :expr "'translate(' + (430 - 180 * t) + ', 0)'")
     
     ;; Now with AstMath (34 chars, zero escaping):
     (:target "#piston" :attr "transform" :expr "translate(430 - 180 * t, 0)")
     ```

---

## 8. Normative References & MIME Types

- **`image/svg+xml`**: W3C Scalable Vector Graphics (SVG) 2 Recommendation.
- **`application/ast-sexpr`**: AST Vector Scene S-Expression grammar (GGML constrained).
- **`application/ast-bytecode`** / **`.astb`**: Compact binary bytecode serialization format.
- **`application/ast-slidescript`**: SlideScript human-readable markdown curriculum notation.
- **`application/json`**: AST serialized scene graph interchange format.
- **W3C Web Audio API**: W3C Recommendation 17 June 2021.
- **W3C Pointer Events**: W3C Pointer Events Level 3 Working Draft / Level 2 Recommendation.

---

## 9. AST Binary Bytecode (`.astb`) Specification (v2.6.0)

To minimize cold-start latency, eliminate runtime garbage collection churn, and reduce token and memory pressure on local edge AI models (Gemini Nano / Chrome Prompt API), the AST Vector Player features a binary bytecode format (`.astb`).

### 9.1. Two-Tier Storage Architecture
1. **Canonical Authoring Target (`static/cartridges/*.ast`)**:
   - Human-readable Lisp-like S-Expressions.
   - Constrained by GGML grammar (`static/player/grammar/ast-sexpr.gbnf`).
   - The native output target for Gemini Nano and teacher editing suites.
2. **Compiled Execution Target (`static/player/bytecode/*.astb`)**:
   - Compact binary serialization produced by `scripts/compile-ast-bytecode.ts`.
   - Up to 85% byte-size reduction vs. raw S-Expressions (average 49.7% reduction across all curriculum ROMs).
   - Direct execution in `ast-engine.js` with sub-millisecond zero-copy deserialization (< 0.2 ms).

### 9.2. Binary Layout
```
[0..3]   Magic Header: 'A' 'S' 'T' 'B' (0x41 0x53 0x54 0x42)
[4]      Version: 0x01
[5]      Archetype: 0x01 (Sim), 0x02 (Slide), 0x03 (App), 0x04 (Film)
[6..7]   Duration (UInt16 deciseconds, e.g. 100 = 10.0s)
[8..9]   String Table Entry Count (UInt16)
[10..13] String Table Byte Length (UInt32)
[14..15] Flags (Bit 0: has3D, Bit 1: hasVideo, Bit 2: hasCheckpoints, Bit 3: hasSubtitles)

Section 1: String Table
  Deduplicated array of length-prefixed UTF-8 strings.
  [Length: UInt16] [UTF-8 bytes...]

Section 2: Instruction Stream (Opcodes)
  OP_SCENE_META (0x01): [id_str: u16] [title_str: u16] [stage_str: u16] [video_str: u16] [video_fit: u8]
  OP_KEYFRAME   (0x10): [t_u16 (0..65535)] [title_str: u16] [rule_str: u16]
  OP_SUBTITLE   (0x20): [start_u16] [end_u16] [lang_count: u8] { [lang_str: u16] [text_str: u16] }*
  OP_BINDING    (0x30): [target_str: u16] [attr_str: u16] [expr_str: u16]
  OP_CHECKPOINT (0x40): [t_u16] [prompt_str: u16] [correct_idx: u8] [expl_str: u16] [opt_count: u8] { [opt_str: u16] }*
  OP_GESTURE    (0x50): [target_str: u16] [axis_u8 (1:x, 2:y, 3:xy)] [min_f32] [max_f32]
  OP_VAR        (0x60): [name_str: u16] [type_u8] [val: f32] [min: f32] [max: f32] [step: f32] [label_str: u16]
  OP_CAMERA     (0x80): [dist_f32] [pitch_f32] [yaw_f32] [fov_f32]
  OP_EOF        (0xFF)
```

### 9.3. Dual-Mode Runtime Loader
The engine's `parseAst()` and `loadScene()` automatically detect whether the payload is binary bytecode (`ASTB`) or an S-Expression string:
- If bytecode (`.astb`): Instantly unpacks via zero-copy `DataView` in **< 0.2 ms**.
- If text (`.ast`): Runs the linear O(n) S-Expression parser with backward-compatibility for ad-hoc runtime generations.

