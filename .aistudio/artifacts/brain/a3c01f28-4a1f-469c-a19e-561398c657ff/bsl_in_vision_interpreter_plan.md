# Beta Implementation Plan: Real-Time "In-Vision" BSL Vector Interpreter

**Document Version:** 1.0.0-BETA  
**Target Release:** St Joseph's Curriculum Portal — SEND & Inclusion Suite  
**Zero-Bloat Invariant:** < 15 KB uncompressed (< 4 KB gzipped), 0 external dependencies, 60 FPS, < 2 MB RAM.

---

## 1. Executive Summary & Value Proposition

Currently, adding British Sign Language (BSL) to educational lessons requires expensive studio filming, human interpreter contracts, and heavy 50+ MB MP4 video overlays per lesson. 

This beta build introduces the **world's first procedural, real-time BSL "In-Vision" vector interpreter**:
* **Decoupled Architecture**: Renders inside a lightweight companion viewport docked in the player or popped out into native Picture-in-Picture (PiP).
* **Zero Video Streaming**: 100% computed on-device in real-time via the existing AST 3D perspective projection engine.
* **Instant Universal Coverage**: Automatically signs the spoken narration and subtitles across **all 28+ curriculum cartridges and interactive simulations**.

---

## 2. Technical Architecture & Phased Execution

```
┌────────────────────────────────────────────────────────┐
│ AST Vector Media Player (Main Viewport)                │
│ • Keyframed Vector Simulation (60 FPS)                 │
│ • Speech / Narration Stream (Web Speech API / Nano)   │
│ • Timed Subtitle Bus (:start, :end, :en, :es)          │
└──────────────────────────┬─────────────────────────────┘
                           │ postMessage / Event Bus
                           ▼
┌────────────────────────────────────────────────────────┐
│ BSL Lexicon & Phoneme Buffer (bslAlphabet.ts)          │
│ • Word-to-Fingerspelling Decomposition (A–Z)           │
│ • High-Frequency Curriculum Sign Target Shapes         │
│ • Spring & Hermite Interpolation Smoothing             │
└──────────────────────────┬─────────────────────────────┘
                           │ 3D Joint Vectors (x, y, z)
                           ▼
┌────────────────────────────────────────────────────────┐
│ "In-Vision" BSL Viewport (BslInterpreterOverlay.tsx)   │
│ • 3D Skeletal Perspective Hand Mesh (Pure SVG DOM)     │
│ • Signer POV ↔ Receiver POV 360° Free Orbit           │
│ • Docked Bottom-Right OR Floating Document PiP Window   │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Build Phases

### Phase 1: Kinematic BSL Lexicon & Handshape Modeler (`src/utils/bslAlphabet.ts`)
* **Manual Alphabet (A–Z)**:
  - 5 Vowels: Target thumb, index, middle, ring, pinky fingertip coordinates on base hand.
  - 21 Consonants: Precise 3D target coordinates for dominant & non-dominant hand interactions (e.g. `C` open arc, `D` thumb-index loop, `M` 3-finger palm rest, `T` side index touch).
* **Kinematic Interpolator**:
  - Hermite curve interpolation between rest position (`(60, 25, 0)`) and letter targets to mimic human signing fluidness without robotic snapping.
* **Signing Cadence Buffer**:
  - Regulates fingerspelling rate (configurable 1.0× to 2.5× speed) with subtle rest rests between words.

### Phase 2: Decoupled In-Vision Viewport (`src/components/BslInterpreterOverlay.tsx`)
* **Docked Player Integration**:
  - Semi-transparent, high-contrast overlay card (220×175 px) docked at the bottom-right of the player stage.
  - Can be minimized to a compact pill (`🖐️ BSL`) or expanded.
* **Native Browser Picture-in-Picture (PiP)**:
  - Integration with the W3C `documentPictureInPicture` API allowing deaf pupils to undock the BSL interpreter and place it on a secondary monitor, split-screen, or above smartboard whiteboard software.
* **Camera Angle Switcher**:
  - 1-click toggle between **Signer POV** (first-person learning perspective) and **Receiver POV** (front-facing conversation partner perspective).

### Phase 3: Speech Boundary & Subtitle Synchronization
* **Event Telemetry Listener**:
  - Connects to `SpeechSynthesisUtterance.onboundary` to capture the exact active word as it is spoken.
  - Fallback to keyframed subtitle words when audio is muted.
* **Active Sign Indicator**:
  - Subtle, clean visual beacon displaying the currently active signed letter/word directly above the hands.

### Phase 4: Accessible Player Controls & Keybinds
* **Toggle Button in Player Shell**:
  - `🖐️ BSL Signing: ON / OFF` button in `src/pages/media-player.tsx` and `src/components/AstVectorMediaPlayer.tsx`.
* **Universal Hotkey**:
  - Accessible shortcut `Shift + B` to instantly toggle the BSL interpreter on any curriculum page.
* **State Persistence**:
  - Remembers user's BSL preference in `localStorage` (`stj_bsl_enabled: true`) so hard-of-hearing students do not need to turn it on for each lesson.

### Phase 5: Verification & Automated Invariant Harness
* **Test Suite (`scripts/simulate-bsl-interpreter.ts`)**:
  - Verifies A–Z fingerspelling coordinates produce 100% valid 3D perspective projections.
  - Benchmarks execution time: < 0.2 ms per frame interpolation.
  - Tests seamless fallback when speech synthesis is absent or muted.
* **Compilation & Linting**:
  - Zero TypeScript compiler warnings (`tsc --noEmit`).
  - Strict adherence to < 1s Vite build invariant.

---

## 4. Deliverables Checklist

- [ ] `src/utils/bslAlphabet.ts` (BSL 3D target vectors & interpolation logic)
- [ ] `src/components/BslInterpreterOverlay.tsx` (Decoupled docked/PiP vector viewport)
- [ ] `src/components/AstVectorMediaPlayer.tsx` (Telemetry bus connection & speech boundary hook)
- [ ] `src/pages/media-player.tsx` (Accessible UI toggle in control bar)
- [ ] `scripts/simulate-bsl-interpreter.ts` (Automated verification test harness)
- [ ] `npm test` & `npm run build` verification report

---

## 5. Token O'Clock Execution Readiness

This plan is completely self-contained and ready to execute in a single engineering turn whenever you are ready. Zero external dependencies or structural rewrites are required.
