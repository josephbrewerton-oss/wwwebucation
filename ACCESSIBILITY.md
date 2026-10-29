# Accessibility Statement

This accessibility statement applies to the interactive simulation runtime, digital educational cartridges (`.astb`, `.ast.svg`), and associated web documentation hosted within this repository.

This platform is engineered from first principles with **mechanical sympathy** to guarantee low-latency, zero-cost, accessible educational simulations across diverse hardware—from high-performance desktops down to budget Celeron/ARM Chromebooks and assistive tech setups.

---

## 1. Compliance Status

This platform is **partially compliant** with the **Web Content Accessibility Guidelines (WCAG) 2.2 AA standard**, due to the known technical limitations and progressive enhancement targets listed below.

The architecture inherently fulfills core WCAG principles through its design:
- **Perceivable:** Visual graphics are implemented as semantic, DOM-native Scalable Vector Graphics (SVG) rather than opaque WebGL canvas contexts, allowing native browser scaling and screen reader inspection.
- **Operable:** All simulation states and keyframe timelines can be driven via standard keyboard navigation or programmatically stepped via discrete, sequential inputs without timing traps.
- **Understandable:** Real-time visual scenes are coupled with synchronized textual/speech transcripts (`:say`) and semantic element highlighting (`:highlight`).
- **Robust:** Execution relies on a fixed 448 KB WebAssembly linear memory pool and zero-allocation runtime loops, preventing garbage-collection pauses, memory leaks, and browser crashes on memory-constrained assistive devices.

---

## 2. Accessible Features & Architectural Commitments

### 2.1 DOM-Native Vector Geometry (No Opaque Canvas / WebGL)
- Unlike standard 3D web engines that draw into an inaccessible WebGL frame buffer, this engine projects 3D spatial coordinates into clean, standard **W3C SVG nodes**.
- Every interactive node retains human-readable semantic identifiers (`id`), accessible labels (`aria-label`), and SVG `<title>` or `<desc>` attributes, ensuring screen readers (NVDA, JAWS, VoiceOver) can identify objects in spatial coordinate space.
- Vector graphics scale infinitely up to 500% zoom without pixelation, loss of clarity, or horizontal clipping.

### 2.2 Procedural Sign Language (BSL / BANZSL)
- Demonstrations and vocabulary modules include a procedural vector-rendered British Sign Language (BSL) interpreter running directly on the vector stage.
- Because the signing avatar is driven by procedural mathematical kinematics rather than high-bandwidth, pre-recorded MP4 video streams, it functions smoothly on low-bandwidth connections and offline environments without visual stutter.
- Users can toggle between **Signer POV** (first-person chest perspective) and **Receiver POV** (conversational partner perspective) to support varied spatial cognitive needs.

### 2.3 Assistive Token Actuation & Timing Controls (WCAG 2.2.1)
- The platform implements a formal 4-slot generic action tuple interface:
  ```lisp
  (:seek <keyframe>)
  (:highlight <element_id>)
  (:var <register> <val>)
  (:say "<text_transcript>")
Execution Typology Decoupling:

Educational content requiring deep reflection and reading (such as Catholic Social Teaching or liturgical postures) is strictly partitioned as :type "Slide" rather than continuous :type "Sim".

In :Slide mode, the autonomous timeline clock is completely decoupled. Pupils and educators step through concepts, interactive checkpoints, and rubrics at their own pace without timing pressure.

In :Sim and :Film modes, the global loop provides universal keyboard playback suspension (Spacebar / K for play/pause, Left/Right arrows for frame-stepping).

2.4 Reduced Motion & Optical Safety (WCAG 2.3.1 & 2.3.3)
Respects the user's operating system preferences for prefers-reduced-motion. When active, continuous camera sweeps, oscillator wiggles, and non-essential fluid animations are clamped to static equilibrium states.

The platform contains zero stroboscopic, high-frequency, or flashing visual elements exceeding the 3-flash-per-second threshold. CRT scanlines and phosphor glow filters operate via static SVG masks and gradient feGaussianBlur filters without flicker.

3. Non-Accessible Content & Known Limitations
Despite our commitments, some areas currently exhibit known limitations that we are actively addressing:

Spatial Path Drag-and-Drop on Screen Readers (WCAG 2.1.1 Keyboard):

Issue: Certain continuous 2D planar dragging gestures (e.g. manually balancing the cart-pole or dragging dynamic masses) currently require mouse or touch coordination.

Mitigation: Every draggable node is mapped to a paired numeric step slider in the parameter HUD, which can be operated incrementally using standard keyboard arrows.

Third-Party Legacy Transpiled Assets (WCAG 1.3.1 Info and Relationships):

Issue: Vector paths transpiled from legacy Adobe Flash (.swf) binaries may lack descriptive internal ARIA sub-tags on deeply nested compound paths.

Mitigation: These are progressively mapped through the AST manifest compiler to inject semantic labels during packaging.

Contrast within Realistic Low-Light Cartridges (WCAG 1.4.3 Contrast Minimum):

Issue: Historical hardware emulators (such as the BBC Micro CRT display) reproduce 1980s green phosphor on dark tube glass, which may measure close to standard 4.5:1 ratios depending on user display calibration.

Mitigation: An explicit high-contrast mode toggle (Shift + C) enforces solid monochrome vector fills and high-contrast text overlays.

4. Evaluation & Testing Methodology
This platform is evaluated on production builds using:

Screen Readers: NVDA (latest stable on Windows 11), VoiceOver (macOS / iOS), and ChromeVox on ChromeOS.

Automated Tooling: Google Lighthouse Accessibility Audits (consistently scoring 96–100/100), axe-core, and WAVE Web Accessibility Evaluation Tool.

Hardware Benchmarks: Verified operational compliance on constrained hardware (Chromebooks with Intel Celeron N4020, 4 GB RAM) ensuring smooth assistive tech concurrency.

5. Feedback & Contact Information
We welcome feedback on the accessibility of the St Joseph's Edge Learning Platform. If you encounter accessibility barriers or require alternative formats for pedagogical materials:

Contact: Joseph Brewerton

Email: joseph.brewerton@gmail.com

Response SLA: We endeavor to acknowledge accessibility inquiries and provide remediation timelines within 3 business days.

6. Statutory Enforcement Procedure
In the United Kingdom, the Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018. If you are not satisfied with our response to your complaint, you can contact the Equality Advisory and Support Service (EASS) at equalityadvisoryservice.com.

Statement prepared: 29 October 2026.

Last reviewed and verified: 29 October 2026.
