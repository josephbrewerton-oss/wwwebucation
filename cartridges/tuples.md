# TUPLES.md — Declarative S-Expression Cartridge Specification

## 1. Core Execution Model
- **Zero-RAM Pure Evaluation:** Every cartridge is an S-expression tuple tree (`(:scene ...)`) paired with a static vector `.svg` asset.
- **Stateless Frame Projection:** On every frame, the engine evaluates `(vars, t)` across `:computed` and `:bindings` tuples and mutates existing SVG DOM attributes in place. Never allocate per-frame heap objects or store frame history snapshots.
- **No Inline SVG Scripts:** `.svg` files must remain pure static vector markup with explicit `#id` targets[cite: 1, 2]. All behavior, math, and state transitions live exclusively in `.ast` tuples.

## 2. Top-Level `:scene` Schema
```lisp
(:scene
  :id "<kebab-case-id>"
  :type "App"
  :starter true               ; Required for Local Vault (IndexedDB) index discovery
  :oak-id "<curriculum-id>"
  :oak-unit "<unit-slug>"
  :title "<Display Title>"
  :stage "<STAGE BADGE>"
  :duration 10.0              ; Timeline duration in seconds (normalized t in [0.0, 1.0])
  (:vars (...))
  (:inputs (...))
  (:computed (...))
  (:gestures (...))
  (:subtitles (...))
  (:keyframes (...))
  (:interactive true)
  (:questions false)
  (:bindings (...))
)
