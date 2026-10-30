<!--
Copyright (c) 2026 Joseph Brewerton
Licensed under GNU AGPLv3 / Commercial Dual-License.
-->

# wwwebucation

Dedicated to St Joseph, and created in the spirit of the Catholic Church’s preferential option for the poor—providing equitable access to learning for all.

# ⚡ St Joseph's Edge Learning Engine & AST Vector Suite

> **Zero-Marginal-Cost, Sovereign On-Device AI Tutoring & Deterministic Vector Media Platform**  
> Powered by the UK National Curriculum (Oak National Academy), Chromium Prompt API (Gemini Nano), bespoke `.astb` Bytecode Compilers, and Native SVG Vector Primitives.

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

The **St Joseph's Engine** rejects modern web bloat and cloud dependency. By pairing quantized local neural inference via **Chromium Built-in AI (Gemini Nano)** with a deterministic, compiled binary bytecode VM (`.astb`) driving native SVG primitives, it delivers infinite, curriculum-aligned practice drills, Socratic tutoring, and 60 FPS interactive cartridges at **£0.00 marginal compute cost**—with zero network egress, complete offline capability, and a verified 99/100 Lighthouse performance rating on static hosting.

---

## 🏗️ Core Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                             BROWSER RUNTIME                             │
│                                                                         │
│   ┌────────────────────────────────┐    ┌───────────────────────────┐   │
│   │   Stateless Shell / Host       │◄──►│    IndexedDB Storage      │   │
│   │ (Zero-Dep Harness / Web Comp)  │    │ (Curriculum VFS & Cache)  │   │
│   └───────────────┬────────────────┘    └───────────────────────────┘   │
│                   │                                                     │
│                   │ Hypercall Event Bus & Cartridge Loader              │
│                   ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      S-Expression Compiler                      │   │
│   │   Declarative AST  ──►  Bespoke Binary Bytecode (.astb)         │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                     │
│                   ┌───────────────┴───────────────┐                     │
│                   ▼                               ▼                     │
│   ┌──────────────────────────────┐ ┌────────────────────────────────┐   │
│   │      On-Device Inference     │ │     WASM Substrate VM Core     │   │
│   │  • Tier 1: Gemini Nano API   │ │  • Linear Memory Evaluator     │   │
│   │  • Tier 2: WebLLM Fallback   │ │  • Deterministic 60 FPS Clock  │   │
│   │  • Tier 3: AST Logic Rules   │ │  • Zero-Heap Direct Mutation   │   │
│   └───────────────┬──────────────┘ └────────────────┬───────────────┘   │
│                   │                                 │                   │
│                   └────────────────┬────────────────┘                   │
│                                    │                                    │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                Native SVG Vector Display Target                 │   │
│   │  • :Sim   - Continuous kinematics, LQR balance & ray telemetry  │   │
│   │  • :Slide - Discrete pedagogical decks, CST virtues, rubrics   │   │
│   │  • :Film  - Deterministic time curves & multilingual subtitles │   │
│   │  • Optical filters, scanlines, and phosphor tube geometries     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
Key Architectural Pillars
Compiled Binary Bytecode (.astb) & WASM VM:

Declarative Lisp-style S-expressions compile directly down to a packed binary bytecode format (.astb).

Evaluated inside a compact, zero-dependency WASM virtual machine that bypasses dynamic AST traversal, GC pressure, and framework reconciliation cycles during 60 FPS animation loops.

Multi-Modal Scene Execution Engine:

:Sim (Continuous Dynamic State): Real-time physical kinematics (e.g. Inverted Pendulum LQR balance, CRT beam physics) locked to a continuous 60 FPS 
Δt ticker.

:Slide (Discrete Exploratory Decks): Event-driven pedagogical units (e.g. Catholic Social Teaching, Liturgical Postures) that decouple user reflection from continuous clock drift.

:Film (Linear Narrative Choreography): Monotonically locked timelines (
t∈[0.0,1.0]) synchronized with speech synthesis and multilingual subtitle tracks.

Pure Vector Hardware & CRT Emulation:

Full hardware vector simulation (such as the MOS 6502 BBC Micro Model B) rendered purely via native SVG primitives, Bézier curves, radial gradients, and phosphor-glow filters.

Zero heavy Canvas/WebGL runtime allocations; deterministic visual hydration and instant hot-patching of visual assets directly in the DOM.

3-Tier On-Device Inference Hierarchy:

Tier 1 (Chromium Prompt API): Native, zero-heap Gemini Nano neural inference acting as a real-time state synthesizer and Socratic dialogue tutor.

Tier 2 (WebLLM via WebGPU): Local shader inference (SmolLM2-360M-Instruct-q4f16_1-MLC) with automatic memory probing for unsupported browsers.

Tier 3 (Deterministic S-Expression Synthesizer): Sub-5ms procedural rule engine executing offline without GPU or neural dependencies.

Decentralized Virtual Console & Self-Mounting Cartridges:

Zero Server Data: Operates as a completely air-gapped, stateless execution console with 0 bytes transmitted to remote servers.

28 Production Vector Cartridges: Compact curriculum ROMs (2.5 KB to 25 KB) self-declaring coordinates (:mount "/curriculum/..."), subject tags (:section), and access levels (:tier).

Sub-15ms Cold Starts: Consumes < 8 MB RAM with zero audio downloads (all sounds procedurally synthesized via native Web Audio API oscillators).

Analytic 3D Ray-Math & Symbolic Spatial Telemetry (Zero-GPU):

Replaces heavy vision frames and video streams with compact S-expression tokens ((:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0])).

CPU-bound analytic geometry (< 15 KB JS) providing exact spatial hit-testing for real-time robotic and scientific kinematics.

Decoupled, Headless AST Vector Player (< 35 KB):

Completely framework-agnostic runtime (@stjosephs/ast-vector-player).

Distributable as a headless engine, drop-in Web Component, LMS iframe (Canvas/Moodle/Google Classroom), or a single self-contained air-gapped .html bundle (< 45 KB) executable from a USB drive.

Real-Time British Sign Language (BSL) & Shakespeare Globe Suites:

Procedural, vector-driven BANZSL 2-handed signing overlays with 60 FPS Hermite spline co-articulation and Document PiP support.

Mathematically accurate 1599 Bankside Globe Theatre 3D stage geometry with spoken iambic pentameter metronomes and multi-branch dramaturgy.

🤖 Machine Dossiers & Agentic Discovery Endpoints
/llms.txt: Concise machine context following the /llms.txt standard for fast agent retrieval.

/llms-full.txt: Exhaustive technical dossier detailing the full 28-cartridge catalog, AST grammar, and dual-track architecture.

/robots.txt: Explicit permissions for search crawlers and AI agents (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.).

/sitemap.xml: Standard XML sitemap indexing all public routes and curriculum cartridges.

/sitemap.ast: Deterministic Lisp S-Expression sitemap and cartridge URI registry.

/player/scenes.manifest.json: Machine-readable index of all 28 production cartridges.

📊 Performance & Benchmarks
Audited on production builds via Google PageSpeed Insights:

Metric	St Joseph's Engine Audit	Legacy Cloud EdTech Baseline
Performance	99 / 100	~44 / 100
Accessibility	96 / 100	~100 / 100
Best Practices	100 / 100	~100 / 100
SEO	100 / 100	~85 / 100
Agentic Browsing	2 / 2 (Pass)	0 / 2
Marginal Compute Cost	£0.00	£5–£20 / student / mo
Data Egress	0 Bytes	Continuous API Streaming
🔒 Privacy & Statutory Safeguarding
Zero Telemetry: No pupil profiles, student queries, voice recordings, or behavioral telemetry leave the client browser.

Local Sandboxed Processing: Socratic dialogues, dynamic grading, and physics mutations stay strictly within browser memory and local IndexedDB tables (EdgeLearningEngineDB).

Statutory Compliance: Inherently compliant with UK GDPR (Article 25 Data Protection by Design & Default), the Data Protection Act 2018, the ICO Children's Code, and KCSIE guidelines. Multi-Academy Trusts can deploy immediately with zero DPO procurement overhead.

🚀 Getting Started
Prerequisites
Node.js: v20.0.0 or higher

Chromium-based browser: Built-in AI flags enabled (chrome://flags/#optimization-guide-on-device-model set to Enabled BypassPerfRequirement and chrome://flags/#prompt-api-for-gemini-nano set to Enabled).

Installation
Bash
git clone [https://github.com/josephbrewerton-oss/wwwebucation.git](https://github.com/josephbrewerton-oss/webucation.git)
cd wwwebucation
npm install
Local Development
Bash
# Start local development server (port 3000)
npm run dev
Verification & Test Suites
Bash
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
Production Build & Clean Distribution
Bash
# Build optimized static production bundle
npm run build

# Export clean-room, zero-source public release (/dist-public-release)
npm run export:dist
🗺️ Roadmap & Field Testing
[x] On-device Prompt API integration & Hypercall dispatch engine

[x] Developmental prompt calibration across UK Key Stages (KS1–KS4)

[x] Super Teacher Nano on-device Socratic tutor with Web Speech API

[x] Complete Oak National Academy curriculum mapping (402 lesson units)

[x] Offline IndexedDB caching and fallback synthesis

[x] AST Vector Media Player with W3C Document PiP and 3D spatial engine

[x] Analytic 3D Ray-Math & Symbolic Spatial Telemetry Subsystem (Zero-GPU)

[x] Native Smartboard Stylus Pen Layer with quadratic Bézier smoothing

[x] Legacy Adobe Flash (.swf) binary transcompiler to SVG + AST

[x] Peer-to-peer WebRTC classroom sync (TeacherBeaconPage)

[x] Discrete execution runtime modes (:Sim, :Slide, :Film)

[ ] Field trial deployment across low-connectivity test environments (Nigeria Pilot)

[ ] Dynamic WASSCE / JAMB curriculum mapping layer

⚖️ Licensing & Terms
Contact: joseph.brewerton@gmail.com

1. Platform & Engine Source Code (Dual Licensing)
The software engine, AST compilers, vector player, and hypercall dispatch system are available under a dual-licensing charter:

Track A: The Humanitarian Commons (GNU AGPLv3): Free in perpetuity for state schools, Catholic dioceses, parishes, educational charities, and emerging economies. Includes a strict copyleft reciprocity clause prohibiting proprietary commercial entities from enclosing the code behind paywalls.

Track B: Enterprise Commercial License: For commercial LMS vendors, proprietary EdTech providers, or multi-academy trusts requiring closed-source redistribution, private hosting, and custom SLAs. 100% of Track B revenues fund refurbished Chromebooks and offline solar education kits for disadvantaged learners.

2. Upstream Educational Content (OGL v3.0)
Curriculum frameworks, question structures, misconception taxonomies, and lesson sequences incorporate public educational datasets provided by Oak National Academy, used under the Open Government Licence v3.0:

Attribution: Contains public sector information licensed under the Open Government Licence v3.0. Sourced from Oak National Academy.

Licence Reference: Open Government Licence v3.0

Non-Endorsement: This software is an independent platform and is not endorsed, sponsored, or certified by Oak National Academy or the UK Department for Education.
