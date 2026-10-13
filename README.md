Markdown<!--
Copyright (c) 2026 Joseph Brewerton
Licensed under GNU AGPLv3 / Commercial Dual-License.
-->

wwwebucation

Dedicated to St Joseph, and created in the spirit of the Catholic Church’s preferential option for the poor—providing equitable access to learning for all.

# ⚡ St Joseph's Edge Learning Engine & AST Vector Suite

> **Zero-Marginal-Cost, Privacy-Preserving On-Device AI Tutoring & Vector Media Platform**  
> Powered by the UK National Curriculum (Oak National Academy), Chromium Prompt API (Gemini Nano), and Deterministic S-Expression AST Runtimes.

[![Lighthouse Desktop](https://img.shields.io/badge/Lighthouse_Desktop-99%2F100-brightgreen)](https://pagespeed.web.dev/)
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-96%2F100-brightgreen)](https://pagespeed.web.dev/)
[![Best Practices](https://img.shields.io/badge/Best_Practices-100%2F100-brightgreen)](https://pagespeed.web.dev/)
[![SEO](https://img.shields.io/badge/SEO-100%2F100-brightgreen)](https://pagespeed.web.dev/)
[![Agentic Browsing](https://img.shields.io/badge/Agentic_Browsing-2%2F2-brightgreen)](https://pagespeed.web.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-Zero_Data_Egress-blue)](#-privacy--zero-telemetry-architecture)
[![License: Dual AGPLv3 / Commercial](https://img.shields.io/badge/License-AGPLv3%20%2F%20Commercial-purple.svg)](#-licensing--terms)

---

## 🎯 Vision & Overview

Traditional EdTech and AI tutoring platforms rely on centralized cloud infrastructure, charging £5–£20 per student/month to offset API compute bills. This creates deep digital divides in bandwidth-constrained, emerging, and underfunded educational environments.

The **St Joseph's Engine** flips this paradigm. By running quantized neural inference client-side via **Chromium Built-in AI (Gemini Nano)** paired with a deterministic, substrate-based S-expression AST compiler, it delivers infinite, curriculum-aligned practice drills, Socratic tutoring, and procedural vector animations at **£0.00 marginal compute cost**—with zero network egress, complete offline capability, and a verified 99/100 Lighthouse performance rating on static hosting.

---

## 🏗️ Core Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER TAB                                │
│                                                                         │
│   ┌────────────────────────┐              ┌──────────────────────────┐  │
│   │   React 19 / Vite 8    │ ◄──────────► │    IndexedDB Storage     │  │
│   │ (App Shell / Viewport) │              │ (Curriculum Cache & VFS) │  │
│   └───────────┬────────────┘              └──────────────────────────┘  │
│               │                                                         │
│               │ Substrate Message Dispatch (Hypercall)                  │
│               ▼                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     Hypercall Substrate Bus                     │   │
│   │  - QuestionEngine Node (Stage-Calibrated AST Logic)             │   │
│   │  - LessonSynthesizer Node (IndexedDB Cache + Baseline Influx)   │   │
│   │  - AST Vector Media Hypervisor (60 FPS Sandboxed iFrame)        │   │
│   └───────────────────────────┬─────────────────────────────────────┘   │
│                               │                                         │
│               ┌───────────────┴───────────────┐                         │
│               ▼                               ▼                         │
│   ┌──────────────────────┐        ┌─────────────────────────────────┐   │
│   │  3-Tier Inference    │        │    AST Vector Media Suite       │   │
│   │  • Tier 1: Nano      │        │  • Declarative SVG Bindings     │   │
│   │  • Tier 2: WebLLM    │        │  • Legacy SWF/Flash Importer    │   │
│   │  • Tier 3: AST Rules │        │  • Document Picture-in-Picture  │   │
│   └──────────────────────┘        └─────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                  Pedagogical Governance Layer                   │   │
│   │  - Multi-Tier Calibration (KS1 sensory → KS4 GCSE quantitative) │   │
│   │  - Cognitive Trap & Misconception Extraction Engine             │   │
│   │  - Super Teacher Nano Socratic Voice & Text Engine              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
### Key Architectural Pillars

- **3-Tier On-Device Inference Hierarchy**:
  - **Tier 1 (Chromium Prompt API)**: Native, zero-heap Gemini Nano neural inference.
  - **Tier 2 (WebLLM via WebGPU)**: Local shader inference (`SmolLM2-360M-Instruct-q4f16_1-MLC`) with automatic memory probing to prevent tab crashes on low-RAM devices.
  - **Tier 3 (Deterministic S-Expression Synthesizer)**: Sub-5ms instantaneous procedural rule engine that runs completely offline with zero GPU overhead.
- **Analytic 3D Ray-Math & Symbolic Spatial Telemetry Subsystem**:
  - Replaces multi-megabyte vision frames and video streaming with compact S-expression tokens (`(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])`).
  - Driver-independent CPU analytic geometry (< 15 KB JS, 0 WebGL dependencies) feeding mathematically exact spatial hits directly into Gemini Nano.
  - Closed-loop deterministic actuation opcodes (`:rotate-camera`, `:nudge`, `:var`) re-sorting vector layers via Painter's algorithm with depth fog in 60 FPS real-time.
- **Decoupled AST Vector Media Player**: Procedural, resolution-independent SVG timeline animation running in an isolated browsing context. Delivers interactive physics simulations, 3D spatial orbit controls, and active recall quizzes in 3.5 KB payloads instead of 40 MB video streams.
- **Smartboard & Stylus Whiteboard Layer**: Native in-stage whiteboard ink layer (`#annotation-ink-root`) with quadratic Bézier smoothing for Promethean, SMART, ViewSonic, and iPad stylus pens.
- **Legacy SWF / Flash Transcompiler**: Built-in client-side decompiler that takes legacy Flash binaries (FWS/CWS), parses twips geometry, and emits clean SVG paths and parametric S-expressions.
- **Document Picture-in-Picture (PiP)**: Runs interactive vector labs, 3D scenes, and Socratic quizzes in an always-on-top desktop window without blocking portal navigation.
- **Stage-Calibrated Governance**: Constrains models across UK developmental stages—enforcing sensory, tangible vocabulary for Key Stage 1 and formal quantitative syllabus standards ($F=ma$, vectors, momentum) for Key Stage 4.
- **Zero-Egress IndexedDB Persistence**: Caches curriculum trees, lesson records, and diagnostic progress locally (`EdgeLearningEngineDB`), fulfilling a 0 bps post-install network SLA.

---

## 📊 Performance & Benchmarks

Audited on production builds via Google PageSpeed Insights:

| Metric | Desktop Production Audit | Legacy Cloud EdTech Baseline |
| :--- | :--- | :--- |
| **Performance** | **99 / 100** | ~44 / 100 |
| **Accessibility** | **96 / 100** | ~100 / 100 |
| **Best Practices** | **100 / 100** | ~100 / 100 |
| **SEO** | **100 / 100** | ~85 / 100 |
| **Agentic Browsing** | **2 / 2 (Pass)** | 0 / 2 |
| **Marginal Compute Cost** | **£0.00** | £5–£20 / student / mo |
| **Data Egress** | **0 Bytes** | Continuous API Streaming |

---

## 🔒 Privacy & Statutory Safeguarding

- **Zero Telemetry**: No pupil profiles, student queries, voice recordings, or behavioral data are transmitted to cloud AI providers.
- **Local Processing**: Pedagogical evaluations, Socratic reasoning, and telemetry remain inside the client's browser sandbox and local IndexedDB tables.
- **Safeguarding & Compliance**: Fulfills UK GDPR (Article 25 Data Protection by Design & Default), the Data Protection Act 2018, the ICO Children's Code, and KCSIE guidelines. Multi-Academy Trusts can deploy without Data Protection Officer (DPO) procurement friction.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **Chromium-based browser**: Built-in AI flags enabled (`chrome://flags/#optimization-guide-on-device-model` set to *Enabled BypassPerfRequirement* and `chrome://flags/#prompt-api-for-gemini-nano` set to *Enabled*).

### Installation
```bash
git clone https://github.com/josephbrewerton-oss/schoolsample.git
cd schoolsample
npm install
```

### Local Development
```bash
# Start Vite development server (port 3000)
npm run dev
```

### Verification & Test Suites
```bash
# Run End-to-End AST & Manifest Determinism Test Suite
npm run test:ast

# Run Cross-Subject Question Simulation Harness
npm run test:simulations

# Run Physical Simulation Engine & Invariant Harness
npm run test:invariants

# Run Whiteboard Stylus Ink Serialization Harness
npm run test:ink

# Run Legacy SWF Transcompiler Test Harness
npm run test:swf
```

### Production Build & Clean Distribution
```bash
# Build optimized static production bundle
npm run build

# Export clean-room, zero-source public release (/dist-public-release)
npm run export:dist
```

---

## 🗺️ Roadmap & Field Testing

- [x] On-device Prompt API integration & Hypercall dispatch engine
- [x] Developmental prompt calibration across UK Key Stages (KS1–KS4)
- [x] Super Teacher Nano on-device Socratic tutor with Web Speech API
- [x] Complete Oak National Academy curriculum mapping (402 lesson units)
- [x] Offline IndexedDB caching and fallback synthesis
- [x] AST Vector Media Player with W3C Document PiP and 3D spatial engine
- [x] Analytic 3D Ray-Math & Symbolic Spatial Telemetry Subsystem (Zero-GPU)
- [x] Native Smartboard Stylus Pen Layer with quadratic Bézier smoothing
- [x] Legacy Adobe Flash (.swf) binary transcompiler to SVG + AST
- [x] Peer-to-peer WebRTC classroom sync (TeacherBeaconPage)
- [ ] Field trial deployment across low-connectivity test environments (Nigeria Pilot)
- [ ] Dynamic WASSCE / JAMB curriculum mapping layer

---

## ⚖️ Licensing & Terms

**Contact**: `joseph.brewerton@gmail.com`

### 1. Platform & Engine Source Code (Dual Licensing)
The software engine, AST compilers, vector player, and hypercall dispatch system are available under a dual-licensing charter:
- **Track A: The Humanitarian Commons (GNU AGPLv3)**: Free in perpetuity for state schools, Catholic dioceses, parishes, educational charities, and emerging economies. Includes a strict copyleft reciprocity clause prohibiting proprietary commercial entities from enclosing the code behind paywalls.
- **Track B: Enterprise Commercial License**: For commercial LMS vendors, proprietary EdTech providers, or multi-academy trusts requiring closed-source redistribution, private hosting, and custom SLAs. 100% of Track B revenues fund refurbished Chromebooks and offline solar education kits for disadvantaged learners.

### 2. Upstream Educational Content (OGL v3.0)
Curriculum frameworks, question structures, misconception taxonomies, and lesson sequences incorporate public educational datasets provided by Oak National Academy, used under the Open Government Licence v3.0:
- **Attribution**: Contains public sector information licensed under the Open Government Licence v3.0. Sourced from Oak National Academy.
- **Licence Reference**: Open Government Licence v3.0
- **Non-Endorsement**: This software is an independent platform and is not endorsed, sponsored, or certified by Oak National Academy or the UK Department for Education.

