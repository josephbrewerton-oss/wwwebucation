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
9. **Real-Time British Sign Language (BSL) Integration**: Syncs via `postMessage` (`SUBTITLE_UPDATE`, `SPEECH_BOUNDARY`, `TOGGLE_BSL`) with the discrete Procedural 3D BSL In-Vision Vector Interpreter (`<native-bsl-interpreter>`, zero video streams).
10. **Headless, Pure VM & Autonomous (v2.6.0)**: Completely decoupled from the Vite `^8.3.6` host portal and zero-dependency at runtime (`@stjosephs/ast-vector-player`). `ast-engine.js` and `ast-gestures.js` contain zero hardcoded scene IDs or cartridge selectors—only schema-driven S-expression evaluators and generic keyboard/pointer press-and-hold loops.

## Directory Structure
```
static/player/
├── index.html              # Clean HTML5 Sandboxed Player Shell (supports ?preset=, ?src=, ?file=, ?hud=1)
├── player.css              # Responsive, zero-CLS Dark/Light styling
├── ast-engine.js           # Pure VM runtime, S-expr parser, bytecode reader, speech & postMessage bridge
├── ast-gestures.js         # Generic PointerCapture, trackball, draggable, clickable, holdable & key rAF VM
├── ast-registry.js         # Streaming scene catalog loader & ASTSceneRegistry
├── ast-compiler.js         # SlideScript & compact declarative compiler
├── ast-phet-bridge.js      # PhET HTML5 / JSON distillation adapter
├── ast-state-hex.js        # Hex state serialization for QR/P2P sync
├── ast-webrtc-bus.js       # Air-gapped WebRTC beacon channel
├── obs-controller.js       # Classroom & OBS studio controller
├── player-ui.js            # Scrubber, keyboard shortcuts, mute/volume, print/export controller
├── bytecode/               # Pre-compiled 68 .astb binary bytecode packs
├── cartridges/             # 68 canonical .ast + .svg cartridge pairs (incl. lego-blocks, vector-racing)
├── scenes/                 # Streaming scene mirror
├── wasm/                   # 7-page (448 KB) fixed linear memory WASM kernels (.wat/.wasm)
├── schema/                 # Formal AST Specifications & JSON Schema
│   ├── SPECIFICATION.md    # Detailed human-readable spec
│   └── ast-scene.schema.json # JSON Schema validation draft-07
├── examples/               # Sample .ast and .json scene payloads
│   ├── orbit.ast
│   └── orbit.json
├── package.json            # Standalone package manifest (@stjosephs/ast-vector-player v2.6.0)
└── README.md               # Architecture, Embed Guide & postMessage API
```

## Interactive Architecture Show & Tell Document
Open the self-contained 4-chapter architectural paper (`static/docs/lumina-architecture.ast`) directly inside the standalone player:
```html
<iframe src="./player/index.html?src=/docs/lumina-architecture.ast" width="100%" height="520"></iframe>
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
| `preset`  | `fractions` | Preset ID (`fractions`, `solar-system`, `lego-blocks`, `vector-racing`, `pythagoras`, `lumina-architecture`, etc.) |
| `src` / `file` | `—` | External or relative `.ast`, `.ast.svg`, `.svg`, or `.json` asset URL (e.g., `/docs/lumina-architecture.ast`) |
| `lang`    | `en`    | Operational language code (`en`, `es`, `fr`, `de`, `it`, `pl`, `pt`, `uk`, `ar`, `la`) |
| `speed`   | `1.0`   | Playback speed multiplier (`0.25`, `0.5`, `1.0`, `1.5`, `2.0`) |
| `autoplay`| `0`     | Autoplay on load (`1` = yes, `0` = no) |
| `theme`   | `dark`  | Visual theme (`dark` or `light`) |
| `bsl`     | `0`     | Toggle British Sign Language (BSL) In-Vision interpreter overlay (`1` = on, `0` = off) |
| `hud`     | `0`     | Enable native `ASTProfiler` live FPS & VM latency HUD (`1` = on) |

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
3. **Option B: Load any `.ast` / `.svg` / `.json` document via URL**:
   ```html
   <iframe src="./player/index.html?src=/docs/lumina-architecture.ast" width="100%" height="520" style="border:none; border-radius:12px;"></iframe>
   ```
4. **Option C: Direct Headless or Full-Page**:
   Point your web server (Nginx, Apache, GitHub Pages, Cloudflare Pages, S3 bucket, or Vite `publicDir`) directly at the `player` directory. Opening `index.html` loads the complete player suite with full UI controls, 3D orbit, voice narration, mute/volume controls, and A4 print worksheet generators out-of-the-box.

---

## Versioning & Semantic Releases

This standalone distribution adheres to [Semantic Versioning 2.0.0](https://semver.org/):
- **Current Version**: `2.6.0`
- **Engine Runtime Constant**: `ASTVectorPlayerEngine.VERSION === '2.6.0'`
- **PONG & PLAYER_READY Events**: Returns `{ version: '2.6.0', license: 'AGPL-3.0-or-later' }` to parent iframes.

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

