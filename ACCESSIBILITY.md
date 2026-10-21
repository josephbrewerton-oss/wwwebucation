# Accessibility Statement

This accessibility statement applies to the interactive simulation runtime, digital educational cartridges (`.astb`, `.ast.svg`), and associated web documentation hosted within this repository.

This platform is engineered from first principles with **mechanical sympathy** to guarantee low-latency, zero-cost, accessible educational simulations across diverse hardware—from high-performance desktops down to budget Celeron/ARM Chromebooks and assistive tech setups.

---

## 1. Compliance Status

This platform is **partially compliant** with the **Web Content Accessibility Guidelines (WCAG) 2.2 AA standard**, due to the non-compliances and exemptions listed below.

The architecture inherently fulfills core WCAG principles through its design:
* **Perceivable:** Visual graphics are implemented as semantic, DOM-native Scalable Vector Graphics (SVG) rather than opaque WebGL canvas contexts, allowing native browser scaling and screen reader inspection.
* **Operable:** All simulation states and keyframe timelines can be driven via standard keyboard navigation or programmatically stepped via discrete, sequential inputs without timing traps.
* **Understandable:** Real-time visual scenes are coupled with synchronized textual/speech transcripts (`:say`) and semantic element highlighting (`:highlight`).
* **Robust:** Execution relies on a fixed 448 KB WebAssembly linear memory pool and zero-allocation runtime loops, preventing garbage-collection pauses, memory leaks, and browser crashes on memory-constrained assistive devices.

---

## 2. Accessible Features & Architectural Commitments

### 2.1 DOM-Native Vector Geometry (No Opaque Canvas / WebGL)
* Unlike standard 3D web engines that draw into an inaccessible WebGL frame buffer, this engine projects 3D spatial coordinates into clean, standard **W3C SVG nodes**.
* Every interactive node retains human-readable semantic identifiers (`id`), accessible labels (`aria-label`), and SVG `<title>` or `<desc>` attributes, ensuring screen readers (NVDA, JAWS, VoiceOver) can identify objects in spatial coordinate space.

### 2.2 Procedural Sign Language (BSL / BANZSL)
* Demonstrations and vocabulary modules include a procedural 3D vector-rendered British Sign Language (BSL) interpreter.
* Because the signing avatar is driven by procedural mathematical kinematics rather than high-bandwidth, pre-recorded MP4 video streams, it functions smoothly on low-bandwidth connections and offline environments without visual stutter.

### 2.3 Assistive Token Actuation & Cognitive Load
* The platform implements a formal 4-slot generic action tuple interface:
  ```lisp
  (:seek <keyframe>)
  (:highlight <element_id>)
  (:var <register> <val>)
  (:say "<text_transcript>")
