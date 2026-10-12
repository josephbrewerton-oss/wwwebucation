# AST Cartridge Creation & Authoring Guide

> **A Step-by-Step Guide to Authoring Flash-Caliber, PhET-Crushing Interactive Vector Simulations in Under 10 Minutes.**

---

## 1. What is an AST Cartridge?

An **AST Cartridge** is a lightweight, zero-dependency interactive simulation capsule. Unlike monolithic EdTech bundles (PhET, Unity, HTML5 canvas packages) that weigh 10–50 MB, an AST cartridge conforms strictly to **W3C SVG and DOM open standards**, combining into a live, 60 FPS interactive experience weighing **under 15 KB**.

### The Two Delivery Formats (Dual Nature)
Cartridges can be authored and distributed in two interchangeable formats:

1. **The Companion Pair (`<scene>.svg` + `<scene>.ast`)**:
   * **The Visual Stage (`<scene>.svg`)**: Standard vector graphics created in Figma, Illustrator, Inkscape, or hand-coded. Every dynamic or interactive element has a semantic ID (e.g., `#piston-head`, `#needle`, `#thermometer-mercury`).
   * **The Logic & Physics Capsule (`<scene>.ast`)**: A declarative Lisp-like S-Expression file defining initial parameters, reactive mathematical bindings, keyframed timelines, multilingual subtitles, formative quiz checkpoints, and touch/drag gestures.
   * **Drag-and-Drop Pairing**: The AST Player accepts both files dropped or selected simultaneously, automatically pairing the artwork with the physics script.

2. **The Living Single-File Capsule (`<scene>.ast.svg`)**:
   * A single, 100% W3C-compliant SVG file containing the visual artwork, with the complete AST S-Expression embedded inside `<metadata type="application/ast-sexpr">`.
   * **Dual Nature in Action**: Opens and previews as an ordinary image in OS file managers, image viewers, and markdown, but springs to life as an interactive 60 FPS simulation when opened in the AST Player.

---

## 2. File Placement & Project Structure

When creating a new cartridge in the portal, place your files here:

```
static/
├── cartridges/
│   ├── pendulum.svg       <-- Visual stage artwork (W3C SVG)
│   └── pendulum.ast       <-- S-Expression physics & animation logic
```

Running `npm run build` or `node scripts/generate-scenes-manifest.js` will automatically:
- Synchronize your files to `static/player/cartridges/` and `static/player/scenes/`.
- Validate the scene grammar against the GGML specification.
- Recompile `src/data/player/generatedScenes.ts` so your new simulation instantly appears in the player picker!

---

## 3. Step 1: Designing the Visual Stage (`.svg`)

### Core Rules for SVG Design
1. **ViewBox Convention**: Use a standard `viewBox="0 0 800 500"` or `viewBox="0 0 700 450"`.
2. **Semantic IDs**: Give every element that moves, rotates, resizes, or reacts an explicit `id`:
   * `#fulcrum`, `#beam`, `#weight-left`, `#weight-right`
   * `#gauge-needle`, `#mercury-column`, `#state-text`
3. **Transform Origins**: If an element rotates (like a gauge needle or pendulum arm), structure its pivot point around `(0, 0)` or note its center coordinate `(cx, cy)`.
4. **Touch Targets**: Add `style="cursor: grab;"` to draggable handles.

### Minimal Example: `simple-pendulum.svg`
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <!-- Background & Mount Ceiling -->
  <rect width="800" height="500" fill="#0f172a"/>
  <rect x="250" y="30" width="300" height="12" rx="4" fill="#334155"/>
  <circle cx="400" cy="36" r="8" fill="#64748b"/>

  <!-- Dynamic Pendulum Arm and Bob -->
  <g id="pendulum-assembly" transform="rotate(0, 400, 36)">
    <!-- Rod -->
    <line x1="400" y1="36" x2="400" y2="300" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
    <!-- Bob -->
    <circle id="pendulum-bob" cx="400" cy="300" r="28" fill="#38bdf8" stroke="#0284c7" stroke-width="3" style="cursor: grab;"/>
    <circle cx="400" cy="300" r="8" fill="#ffffff" opacity="0.4"/>
  </g>

  <!-- Realtime HUD Readout -->
  <rect x="28" y="24" width="220" height="75" rx="8" fill="#1e293b" opacity="0.9" stroke="#334155"/>
  <text x="44" y="52" fill="#94a3b8" font-size="12" font-family="sans-serif">ANGLE (θ)</text>
  <text id="readout-angle" x="44" y="80" fill="#38bdf8" font-size="22" font-weight="bold" font-family="monospace">0.0°</text>
</svg>
```

---

## 4. Step 2: Writing the S-Expression Logic (`.ast`)

An `.ast` file is divided into 7 standard declarative sections:

### Section A: Scene Declaration & Duration
```lisp
(:scene
  :id "simple-pendulum"
  :title "Simple Harmonic Motion: Pendulum Physics"
  :stage "pendulum.svg"
  :duration 14.0
  :easing "easeInOutCubic"
```

### Section B: Variables (`:vars`)
Expose user-adjustable parameters that automatically generate sliders in the Interactive Lab Drawer:
```lisp
  (:vars (
    (:var :name "length" :val 2.0 :min 0.5 :max 4.0 :step 0.1 :unit "m" :label "Rod Length")
    (:var :name "gravity" :val 9.81 :min 1.62 :max 24.79 :step 0.1 :unit "m/s²" :label "Gravity (g)")
    (:var :name "releaseAngle" :val 35 :min 5 :max 75 :step 1 :unit "°" :label "Initial Angle")
  ))
```

### Section C: Keyframes (`:keyframes`)
Define pedagogical milestones for the narrative scrubber bar:
```lisp
  (:keyframes (
    (:t 0.00 :title "Equilibrium" :rule "Resting state where net torque is zero.")
    (:t 0.30 :title "Max Displacement" :rule "Potential energy reaches maximum at extremes.")
    (:t 0.70 :title "Kinetic Peak" :rule "Velocity reaches peak as bob passes vertical centerline.")
    (:t 1.00 :title "Conservation of Energy" :rule "Total mechanical energy remains constant.")
  ))
```

### Section D: Multilingual Subtitles (`:subtitles`)
Provide real-time synchronized closed captions in English, Spanish, and Latin:
```lisp
  (:subtitles (
    (:start 0.00 :end 4.00 
      :en "A simple pendulum executes simple harmonic motion under gravitational restoring torque."
      :es "Un péndulo simple ejecuta un movimiento armónico bajo la acción del torque gravitatorio."
      :la "Pendulum simplex motum harmonicum sub vi gravitatis complet.")
    (:start 4.00 :end 9.00
      :en "Notice how the period T = 2π√(L/g) depends solely on length and gravity, not bob mass."
      :es "El período T = 2π√(L/g) depende únicamente de la longitud y la gravedad, no de la masa.")
  ))
```

### Section E: Formative Checkpoints (`:interactive`)
Insert interactive checkpoints where the timeline pauses and assesses the student:
```lisp
  (:interactive (
    (:checkpoint :at 8.50
      :prompt "If we move this pendulum to the Moon (gravity = 1.62 m/s²), will it swing faster or slower?"
      :options (
        "Faster, because there is less air resistance."
        "Slower, because weaker gravity reduces the restoring force."
        "At the exact same speed, because length did not change."
      )
      :answer 1
      :explanation "Since T = 2π√(L/g), lower gravity increases period T, meaning each swing takes longer!")
  ))
```

### Section F: Reactive Bindings (`:bindings`)
Connect variables and time `t` directly to SVG attributes at 60 FPS:
```lisp
  (:bindings (
    ;; Rotate the pendulum arm around pivot (400, 36)
    (:target "#pendulum-assembly" :attr "transform"
     :expr "'rotate(' + (releaseAngle * Math.cos(t * Math.sqrt(vars.gravity / vars.length) * 2.5)) + ', 400, 36)'")

    ;; Update live angle readout text
    (:target "#readout-angle" :attr "textContent"
     :expr "(releaseAngle * Math.cos(t * Math.sqrt(vars.gravity / vars.length) * 2.5)).toFixed(1) + '°'")
  ))
```
*Note: `:expr` receives `(t, vars, Math)` in its execution context.*

### Section G: Direct Grab & Gestures (`:gestures`)
Allow direct touch/mouse dragging of elements on smartboards and iPads:
```lisp
  (:gestures (
    (:draggable :target "#pendulum-bob" :axis "curve" :min -75 :max 75)
  ))
)
```

---

## 5. Step 3: Verifying & Building

To compile the Oak scene manifest and ensure everything is clean:
```bash
node scripts/generate-scenes-manifest.js
npm run build
```

The script will report:
```
[AST Manifest] Found 18 cartridges
[AST Manifest] Compiled static/player/manifest.oak.json
[AST Manifest] Synced to src/data/player/generatedScenes.ts
Build succeeded in 0.72s
```

Now open the app in your browser, switch to the **AST Vector Player**, and your new simulation is live in the cartridge tray!

---

## 6. Vector 3D Nodes: Adding Spatial Depth

AST has built-in zero-dependency vector 3D projection (`:3d-node`, `:3d-line`, `:3d-ring`). No WebGL or Three.js bundle is required.

To project 3D orbits or lattices:
```lisp
(:camera :distance 850 :pitch 25 :yaw "t * 30" :fov 60)

(:bindings (
  ;; Orbiting particle in 3D space
  (:target "#orbiting-electron" :type "3d-node"
   :x "Math.cos(t * 3.14) * 200"
   :y "Math.sin(t * 3.14) * 80"
   :z "Math.sin(t * 3.14) * 200"
   :base-r 12
   :depth-fog #t)
))
```
The engine automatically computes perspective scale, depth-fog opacity, and z-index sorting at 60 FPS.

---

## 7. Edge AI Generation with Gemini Nano

You can generate complete AST cartridges directly on-device using Chrome's Prompt API (`window.ai.languageModel`).

### Recommended System Prompt for Nano
```text
You are an expert AST Vector Simulation author.
Write a valid AST S-Expression file adhering strictly to:
(:scene :id "ID" :title "TITLE" :stage "FILE.svg" :duration SECONDS
  (:vars (...))
  (:keyframes (...))
  (:subtitles (...))
  (:interactive (...))
  (:bindings (...))
  (:gestures (...)))
Do not output Markdown fences or explanations. Output only raw S-Expressions.
```

Because the AST grammar is formal and token-dense, Gemini Nano completes valid simulations in **~500 milliseconds**.

---

## 8. Common Pitfalls & Authoring Checklist

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Element doesn't move** | SVG element ID mismatch | Ensure ID in SVG matches `:target "#id"` in AST exactly. |
| **Rotation spins off-screen** | Missing transform center | Use `'rotate(' + angle + ', ' + cx + ', ' + cy + ')'`. |
| **Variables don't update on drag** | Missing `vars.` prefix | Use `vars.myVar` inside `:expr` rather than `myVar`. |
| **Text clips on smartboards** | Fixed pixel width | Use `text-anchor="middle"` or `monospace` font for counters. |
| **Audio click on pause** | Hard audio cut | The built-in audio synthesizer automatically ramps volume; use native Web Audio events. |

---

## 9. Summary: The AST Advantage

| Feature | Legacy Flash | PhET HTML5 | AST Vector Player |
| :--- | :--- | :--- | :--- |
| **Payload Size** | 2–8 MB SWF | 12–25 MB Bundle | **< 15 KB** |
| **Boot Latency** | Plugin Required | 1,500–3,000 ms | **< 15 ms** |
| **Dependencies** | Adobe NPAPI | Scenery / Dot / Kite | **Zero (Native SVG & Web Audio)** |
| **Smartboard Whiteboard Ink** | No | No | **Native Quadratic Bézier Ink** |
| **On-Device AI Generation** | Impossible | Impossible | **Native (Gemini Nano in ~500 ms)** |
| **Editing Workflow** | Flash Pro IDE | Git + Node + Webpack | **Any text editor in < 10 mins** |
