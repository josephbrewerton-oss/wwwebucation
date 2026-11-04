# St Joseph's Curriculum Portal — Vector Illustration & Pedagogical Art Architecture Plan

**Document Version**: 1.0.0  
**Status**: Approved Architectural Plan  
**Target Subsystem**: Portal UI, Catholic Sanctuary, Curriculum Gateways, and AST Living Capsules  
**Compliance**: Zero-Bloat Invariant (< 35 KB gzipped engine, < 1s build, 0 external image requests, 100% offline)

---

## 1. Executive Summary & Vision

While St Joseph's Curriculum Portal possesses a high-performance vector simulation engine (< 35 KB gzipped runtime, 60 FPS deterministic execution, sub-15 ms cold start), the surrounding web application has operated largely as a functional text-and-box utility. 

This document codifies the plan to elevate the portal into an **illuminated Catholic curriculum sanctuary**. By leveraging native scalable vector graphics (SVG) as an artistic and pedagogical medium rather than just a geometric physics canvas, we introduce rich, high-fidelity sacred and scientific illustration across the entire learning journey—without adding a single byte of raster image bloat or compromising our strict performance invariants.

---

## 2. Core Design Pillars & Aesthetic Heritage

### 2.1 The Catholic Visual & Catechetical Tradition
Catholic education was historically built on visual storytelling and sacred geometry. The plan codifies three visual idioms:
1. **Gothic Stained Glass & Rose Windows**:
   - Radiant geometric vector leadwork and jewel-tone glass fills (ruby, cobalt, amber, emerald).
   - Dynamic liturgical color switching synced to the Catholic calendar:
     - **Gold / White**: Eastertide, Christmastide, Solemnities.
     - **Violet**: Advent and Lent.
     - **Green**: Ordinary Time.
     - **Red**: Pentecost, Palm Sunday, Martyrs' feasts.
     - **Rose**: Gaudete and Laetare Sundays.
2. **Illuminated Manuscripts & Monastic Scriptorium**:
   - Hand-crafted Celtic knotwork borders inspired by the Book of Kells and Lindisfarne Gospels.
   - Gilded drop-caps for reading passages, prayers, and catechism units.
   - Latin scrollwork ribbons carrying school mottos and liturgical versicles (*Ad Majorem Dei Gloriam*, *Sedes Sapientiae*).
3. **Architectural & Altar Rubrics Cutaways**:
   - Precise vector architectural elevations of the High Altar, Tabernacle, Rood Screen, and Sanctuary furnishings.

### 2.2 Natural Philosophy & Scientific Naturalism
In the tradition of Leonardo da Vinci, Ernst Haeckel, and the Royal Society:
1. **Botanical & Anatomical Cutaways**: Cross-sections of plant leaves (stomata, chloroplasts), human cell organelles, and cardiovascular pathways drawn with engraved cross-hatching vector styles.
2. **Classical Apparatus & Astrolabes**: Brass and copper vector styling for optics benches, Galilean telescopes, Faraday coils, and planetary armillary spheres.
3. **Pure Geometric Proofs**: Illuminated Euclidean constructions, Pythagorean tile proofs, and Golden Ratio logarithmic spirals.

### 2.3 Early Years & Primary Storybook Vignettes (EYFS / KS1)
- Whimsical, warm vector storybook illustrations for phonics letter sounds, animal habitats, and numeracy counting mats.
- High-contrast, dyslexia-friendly silhouettes designed to prevent cognitive overload while maintaining warmth and wonder.

---

## 3. Technical Architecture & Performance Contracts

### 3.1 The Zero-Bloat Vector Invariant
To ensure the application remains sub-second in build time, sub-15 ms in boot time, and 100% functional on low-spec school hardware and offline networks:
- **Zero Raster Dependencies**: Strictly 0 external PNG, JPEG, or WebP network requests.
- **Pure Scalable Vector Markup**: All illustrations are pure inline SVG or `.ast.svg` self-contained capsules.
- **Budget Cap**:
  - Micro-vignettes / Subject Crests: **< 6 KB** raw SVG per badge.
  - Hero Rose Windows / Architectural Banners: **< 24 KB** raw SVG per banner.
  - Gzipped over-the-wire footprint: **< 4 KB** per asset.
- **Hardware Scalability**: Crisp and artifact-free at any resolution, from a 5-inch mobile screen to an 85-inch 4K Promethean classroom interactive board.

### 3.2 Dynamic CSS Token & Variable Integration
Illustrations must bind directly to our persistent application theme tokens (`src/index.css`), allowing real-time liturgical and dark-mode adaptation without re-rendering:

```css
:root {
  /* Liturgical Color System */
  --liturgical-primary: #b45309;      /* Gold / Amber */
  --liturgical-secondary: #fef08a;    /* Light Gold */
  --liturgical-glass-lead: #0f172a;   /* Gothic Leadwork */
  --liturgical-glow: rgba(202, 138, 4, 0.35);

  /* Scientific Engraving Palette */
  --engraving-ink: #1e293b;
  --engraving-parchment: #fdfbf7;
  --engraving-accent: #0284c7;
}
```

### 3.3 Living Vector Animations (Zero-GC CPU Footprint)
Illustrations are not static decals; they participate in the life of the page:
- **Sanctuary Lamp**: Gentle procedural CSS opacity flicker simulating real flame luminance.
- **Stained Glass Refraction**: Soft specular radial gradient shimmer on mouse hover.
- **Apparatus Rotation**: CSS transform or AST keyframe continuous 60 FPS orbit with zero garbage collector churn.

---

## 4. Implementation Phasing Roadmap

### Phase 1: Catholic Sanctuary & Portal Gateway (Immediate Priority)
1. **Home Page Hero Transformation**:
   - Replace standard text cards with an illuminated Gothic Portal Archway featuring a dynamic vector Stained Glass Rose Medallion.
   - Integrate an illuminated Latin versicle ribbon (*"Sedes Sapientiae, Ora Pro Nobis"*).
2. **Catholic Life & Faith Sanctuary (`/catholic-life`)**:
   - High-fidelity vector cutaways of the High Altar, Tabernacle, Sanctuary Lamp, and Holy Water Stoup.
   - Liturgical season calendar ribbon dynamically tinting the stained-glass vectors according to the liturgical date.

### Phase 2: The Eight Curriculum Pathway Heraldic Crests
Replace generic emoji icons in `src/pages/index.ts` and `src/pages/learning-zone.ts` with handcrafted vector medallions:

| Pathway | Illustrative Motif | Vector Technique |
| :--- | :--- | :--- |
| **Catholic Life & RE** | Gothic Rose Window with Monstrance & Alpha/Omega | Symmetrical radial leadwork + jewel gradients |
| **Mathematics** | Golden Spiral, Compass & Archimedean Solid | Exact parametric Bézier curves + golden proportion guides |
| **Science & Physics** | Atom model, Prism dispersion & Botanical leaf cross-section | Clean linework with refractive optical ray styling |
| **Computing** | BBC Micro Model B motherboard cutaway & 6502 silicon trace | Architectural isometric vector circuitry |
| **English & Phonics** | Illuminated Scriptorium Quill, Celtic initial & Storybook acorn | Organic hand-drawn path styling with woodcut hatching |
| **Geography & History**| Nautical Compass Rose, ancient parchment strata & chronometer | Cartographic contours and nautical cross-hatching |
| **Art & Music** | Classical Lyre, harmonic waveforms & sacred geometry palette | Resonant vector curves with wave interference nodes |
| **Modern Languages** | Polyglot Rosetta ribbon with Latin, French & Spanish crests | Symmetrical heraldic ribbon geometry |

### Phase 3: Scriptorium Simulator Stage Borders
1. **Classroom Smartboard Framing**:
   - Provide an optional "Monastic Scriptorium" or "Victorian Physics Laboratory" ornamental vector frame around `#ast-persistent-viewport`.
   - Subtle corner brass filigree and leather-bound parchment borders that frame the simulation cleanly on whiteboards.
2. **In-Stage Pedagogical Annotations**:
   - Illustrated vector pointers, hand-engraved measuring calipers, and brass weights for interactive physics apparatus.

### Phase 4: Token-Dense Edge AI (Gemini Nano) Illustration Synthesis
1. **On-Device Illustration Templates**:
   - Codify grammar definitions (`static/player/grammar/ast-illustration.gbnf`) allowing local on-device LLMs to emit custom illustrated badges and diagrammatic cutaways in < 80 tokens.
2. **Dynamic In-Vision BSL Vignettes**:
   - Couple BSL sign diagrams with illustrated vector contextual vignettes (e.g., an illuminated sanctuary icon appearing alongside the signed liturgical vocabulary).

---

## 5. Verification & Quality Invariants

Every illustrative asset and component added under this plan must pass strict verification gates:
1. **Build Performance**: `npm run build` must complete in **< 2.0 seconds** (target: < 1.0s).
2. **Bundle Footprint**: 0 increase to core runtime dependencies (`package.json` must remain 100% zero-React).
3. **Rendering Speed**: First Contentful Paint (FCP) must remain **< 50 ms** on local storage and **< 400 ms** on cold HTTP cache.
4. **Accessibility (WCAG 2.2 AAA)**:
   - All decorative SVGs must carry `aria-hidden="true"`.
   - All informative pedagogical illustrations must carry comprehensive `<title>` and `<desc>` tags with minimum 4.5:1 text/glyph contrast ratios.
5. **Smartboard Testing**: Verifiable clarity when scaled to 4K resolution (3840×2160) without blur, pixelation, or clipping.
