# AST-Guided Low-Bloat Vector Motion & Interactive Graphics Player (<35 KB)

An ultra-lightweight, zero-dependency sandboxed vector animation and interactive graphics engine. Originally engineered as an open-standard Flash/PhET replacement for education, AST is architected for cross-industry deployment across **Digital Signage (DOOH)**, **Interactive Programmatic Advertising (IAB Rich-Media)**, **Interactive Retail Kiosks**, and **Curriculum Manipulatives**.

## Key Industry Advantages
1. **0 Bytes Video Bloat (< 35 KB Runtime)**: Replaces 40+ MB video blobs with 3.5 KB – 12 KB mathematical vector scenes.
2. **IAB 150 KB Ad-Tech Compliance**: The entire runtime (< 35 KB gzipped) plus interactive scene (< 10 KB) loads in under 45 KB total, fitting easily inside the strictest IAB display ad size limits.
3. **24/7 Digital Signage & DOOH Reliability**: Consumes < 8 MB RAM with zero garbage-collection thrashing. Runs perpetually on low-power ARM media players (Raspberry Pi, BrightSign, Android sticks, LG webOS, Samsung Tizen) without memory leaks.
4. **Infinite DPI Scaling**: 100% resolution-independent vector rendering scales identically from a 2-inch smart shelf label to a 100-foot 8K Times Square LED billboard.
5. **Real-Time Dynamic Creative Optimization (DCO)**: Reactive variables (`:vars` and `:bindings`) allow real-time localized pricing, countdown timers, and weather-driven ad creatives via simple JSON parameters without re-rendering video.
6. **Zero-Latency In-Stage Touch & Stylus Dragging**: Direct pointer capture and quadratic Bézier smoothing for interactive kiosks, smartboards, and wayfinding displays.
7. **Zero-Asset Procedural Audio**: Mathematical Web Audio synthesis (clicks, chimes, confirmation beeps) with 0 KB audio assets.
8. **Universal LMS & Web Embed**: Directly embeds into Canvas, Google Classroom, Moodle, digital signage CMSs, and ad servers.
9. **Real-Time British Sign Language (BSL) In-Vision Interpreter**: Zero-video procedural 3D two-handed fingerspelling overlay (< 12 KB) synchronized to narrative speech boundaries and subtitles, featuring dual camera POV (Signer vs Receiver) and W3C Document Picture-in-Picture.
10. **Headless & Autonomous**: Completely decoupled from any web portal or UI framework; ships with its own `package.json` (`@stjosephs/ast-vector-player`) for headless Node/browser usage or standalone `<micro-vector-player>` Web Component.

## Directory Structure
```
static/player/
├── index.html              # Clean HTML5 Sandboxed Player Shell
├── micro-vector-player.js  # Standalone <micro-vector-player> Web Component (< 5 KB)
├── demo-webcomponent.html  # Interactive test & demo for Web Component
├── player.css              # Responsive, zero-CLS Dark/Light styling
├── ast-engine.js           # Timeline, keyframe interpolator, speech & postMessage bridge
├── ast-registry.js         # Streaming scene catalog loader & ASTSceneRegistry
├── player-ui.js            # Scrubber, keyboard shortcuts, print/export controller
├── schema/                 # Formal Minimal AST Specifications
│   ├── SPECIFICATION.md    # Detailed human-readable spec
│   └── ast-scene.schema.json # JSON Schema validation draft-07
├── grammar/                # GBNF Grammars for Constrained Local LLMs
│   ├── ast-scene.gbnf      # llama.cpp / Ollama JSON grammar
│   ├── ast-sexpr.gbnf      # Lisp-like compact S-expression grammar
│   └── README.md           # llama.cpp, Ollama & Python usage guide
├── examples/               # Sample .ast and .json scene payloads
│   ├── orbit.ast
│   └── orbit.json
├── package.json            # Standalone npm package manifest for splitting off
└── README.md               # Architecture, Embed Guide & postMessage API
```

## Dropping the `<micro-vector-player>` Web Component into Any Website
```html
<!-- 1. Include the single lightweight script (< 5 KB) -->
<script src="https://your-domain.com/player/micro-vector-player.js"></script>

<!-- 2. Drop the player anywhere -->
<micro-vector-player src="orbit.ast" autoplay voice></micro-vector-player>
<micro-vector-player src="orbit.json" lang="es"></micro-vector-player>
<micro-vector-player preset="fractions"></micro-vector-player>
```

## Embedding in an LMS (Canvas, Moodle, Google Classroom)
```html
<iframe 
  src="https://your-domain.com/player/index.html?preset=fractions&lang=en&autoplay=0" 
  width="100%" 
  height="500" 
  frameborder="0" 
  allow="fullscreen" 
  loading="lazy" 
  style="border-radius:12px; border:1px solid #1e293b;">
</iframe>
```

## Supported URL Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| `preset`  | `fractions` | Preset ID (`fractions`, `solar-system`, `photosynthesis`, `pythagoras`, `water-cycle`, `atom`, `velocity`, `dna-helix`) |
| `lang`    | `en`    | Operational language code (`en`, `es`, `fr`, `de`, `it`, `pl`, `pt`, `uk`, `ar`, `la`) |
| `speed`   | `1.0`   | Playback speed multiplier (`0.5`, `1.0`, `1.5`, `2.0`) |
| `autoplay`| `0`     | Autoplay on load (`1` = yes, `0` = no) |
| `theme`   | `dark`  | Visual theme (`dark` or `light`) |
| `bsl`     | `0`     | Toggle British Sign Language (BSL) In-Vision interpreter overlay (`1` = on, `0` = off) |

## Bi-Directional postMessage API Protocol
### Send Commands to iFrame:
```javascript
const playerWindow = document.getElementById('my-player-iframe').contentWindow;

// Play / Pause / Seek
playerWindow.postMessage({ type: 'PLAY' }, '*');
playerWindow.postMessage({ type: 'PAUSE' }, '*');
playerWindow.postMessage({ type: 'SEEK', progress: 0.5 }, '*');

// Change preset or language
playerWindow.postMessage({ type: 'SET_PRESET', preset: 'solar-system' }, '*');
playerWindow.postMessage({ type: 'SET_LANG', lang: 'es' }, '*');
playerWindow.postMessage({ type: 'SET_SPEED', speed: 1.5 }, '*');
playerWindow.postMessage({ type: 'SET_THEME', theme: 'light' }, '*');

// Toggle British Sign Language (BSL) In-Vision Interpreter
playerWindow.postMessage({ type: 'SET_BSL', enabled: true }, '*');
playerWindow.postMessage({ type: 'TOGGLE_BSL' }, '*');

// Inject dynamic AST scene
playerWindow.postMessage({ 
  type: 'LOAD_AST', 
  ast: { id: 'custom-scene', title: 'My Custom Scene', duration: 8.0, ... } 
}, '*');
```

### Receive Telemetry Events from iFrame:
```javascript
window.addEventListener('message', (event) => {
  if (event.data?.source !== 'ast-vector-player') return;

  switch (event.data.type) {
    case 'PLAYER_READY':
      console.log('Player initialized with presets:', event.data.presets);
      break;
    case 'TIME_UPDATE':
      console.log('Current progress:', event.data.progress);
      break;
    case 'KEYFRAME_REACHED':
      console.log('Milestone reached:', event.data.title, event.data.rule);
      break;
    case 'STATE_CHANGE':
      console.log('Playback state:', event.data.isPlaying);
      break;
  }
});
```

## 100% Standalone & Portable ("Drop-in Anywhere")
The `player/` folder is **completely decoupled** and self-contained:
- **Zero parent dependencies**: No imports from the parent application or `src/`.
- **Zero npm dependencies**: Pure vanilla web standards (HTML5, SVG, Web Speech API, CSS variables).
- **100% relative paths**: Works whether deployed at domain root (`/`), subfolder (`/assets/player/`), static CDN, LMS upload, or locally (`file:///`).
- **Offline & Zero-Egress**: Computes animations procedural in real-time with zero cloud calls and no analytics trackers.

### How to use this folder on ANY other website:
1. **Copy the folder**: Simply copy the `player` folder into your other project (e.g. `public/player/` or `assets/player/`).
2. **Option A: Embed as an iframe**:
   ```html
   <iframe src="./player/index.html?preset=solar-system&lang=en" width="100%" height="500" style="border:none; border-radius:12px;"></iframe>
   ```
3. **Option B: Use the `<micro-vector-player>` Web Component**:
   ```html
   <script src="./player/micro-vector-player.js"></script>
   <micro-vector-player src="./player/examples/orbit.json" autoplay voice></micro-vector-player>
   ```
4. **Option C: Direct Headless or Full-Page**:
   Point your web server (Nginx, Apache, GitHub Pages, Cloudflare Pages, S3 bucket) directly at the `player` directory. Opening `index.html` loads the complete player suite with full UI controls, 3D orbit, voice narration, and A4 print worksheet generators out-of-the-box.

---

## Versioning & Semantic Releases

This standalone distribution adheres to [Semantic Versioning 2.0.0](https://semver.org/):
- **Current Version**: `2.5.0`
- **Engine Runtime Constant**: `ASTVectorPlayerEngine.VERSION === '2.5.0'`
- **PONG & PLAYER_READY Events**: Returns `{ version: '2.5.0', license: 'AGPL-3.0-or-later' }` to parent iframes.

---

## Licensing & Legal Distribution Charter

This standalone player suite is distributed under an explicit **Dual-Licensing Charter**:

### Track A: GNU Affero General Public License v3.0 (AGPLv3)
- **SPDX**: `AGPL-3.0-or-later`
- **100% Free**: State schools, Catholic academies, teachers, pupils, and educational non-profits have unrestricted rights to use and embed this player in perpetuity.
- **Copyleft Network Reciprocity (Section 13)**: If you modify this player and host or serve it over a computer network (e.g., in a cloud LMS, hosted digital textbook, or SaaS platform), you **must** make the complete corresponding source code freely available to all remote users under AGPLv3.
- **Anti-Enclosure**: Proprietary entities cannot rebrand or paywall this engine without contributing source code back to the educational commons.

### Track B: Enterprise Commercial License
- For commercial EdTech vendors, private publishers, and LMS providers who require proprietary, closed-source integration without AGPLv3 copyleft or source-disclosure obligations.
- 100% of commercial license fees fund Chromebooks and solar digital educational hardware for disadvantaged pupils worldwide.
- Inquiries: `joseph.brewerton@gmail.com`

See [LICENSE](./LICENSE) and [LICENSING.md](./LICENSING.md) for full terms.

