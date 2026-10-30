/**
 * static/player/ast-gestures.js
 *
 * St Joseph's Educational Media Suite - Zero-Bloat Flash-Caliber Direct Manipulation Subsystem
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Provides true Adobe Flash / PhET / GeoGebra caliber direct interactivity:
 * 1. Direct In-Stage Pointer Drag & Drop (Piston, Tangent Probe, Weights, Wires, Levers)
 * 2. Stage-Embedded Glassmorphism Floating HUD Controls
 * 3. Smartboard & Stylus Pen Vector Annotation Whiteboard Layer
 * 4. Interactive Pedagogical X-Ray Hotspot Inspector
 * 5. Multi-sensory Procedural Acoustic Sonification (Pressure hiss, Switch snap, Slope pitch)
 */

(function (global) {
  'use strict';

  class ASTDirectGestureSubsystem {
    constructor(engine, options = {}) {
      this.engine = engine;
      this.options = options;
      this.stageSvg = null;
      this.sceneRoot = null;
      this.inkRoot = null;
      this.hudRoot = null;
      this.xrayTooltip = null;

      // Pointer Drag State
      this.isDragging = false;
      this.dragTarget = null;
      this.dragMode = null; // 'piston', 'tangent-probe', 'switch', 'generic-x', 'generic-xy'
      this.dragStart = { x: 0, y: 0 };
      this.targetInitial = { x: 0, y: 0 };

      // Pen Annotation Whiteboard State
      this.isPenActive = false;
      this.currentInkColor = '#facc15'; // Neon Gold default
      this.currentInkWidth = 3.5;
      this.isDrawing = false;
      this.currentStroke = null;
      this.strokes = [];

      // X-Ray Pedagogical Tooltip Mode
      this.isXRayActive = false;
      this.sonificationEnabled = true;

      // Audio Synthesizer Context
      this.audioCtx = null;

      // Bind methods
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      this.handlePointerCancel = this.handlePointerCancel.bind(this);
    }

    /**
     * Initializes and mounts gesture subsystem onto the SVG stage
     */
    init(stageSvg, sceneRoot) {
      this.stageSvg = stageSvg || document.getElementById('stage-svg');
      this.sceneRoot = sceneRoot || document.getElementById('scene-root');
      if (!this.stageSvg) return;

      this.setupDomLayers();
      this.setupEventListeners();
      this.setupGlassHud();
      this.setupXRayTooltip();
      this.enhanceSceneInteractivity();

      // Listen for scene load changes
      if (this.engine && typeof this.engine.on === 'function') {
        this.engine.on('presetchange', () => {
          setTimeout(() => this.enhanceSceneInteractivity(), 100);
        });
      }
    }

    /**
     * Creates dedicated SVG layers for annotations, HUD and X-Ray
     */
    setupDomLayers() {
      // 1. Whiteboard Ink Layer
      let inkGroup = this.stageSvg.querySelector('#annotation-ink-root');
      if (!inkGroup) {
        inkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        inkGroup.id = 'annotation-ink-root';
        inkGroup.style.pointerEvents = 'none';
        this.stageSvg.appendChild(inkGroup);
      }
      this.inkRoot = inkGroup;

      // 2. Stage Drag Feedback Layer
      let hudGroup = this.stageSvg.querySelector('#stage-hud-root');
      if (!hudGroup) {
        hudGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        hudGroup.id = 'stage-hud-root';
        this.stageSvg.appendChild(hudGroup);
      }
      hudGroup.style.pointerEvents = 'none';
      this.hudRoot = hudGroup;
    }

    /**
     * Attaches Pointer Events with full capture support for touch, stylus and mouse
     */
    setupEventListeners() {
      if (!this.stageSvg) return;

      this.stageSvg.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
      window.addEventListener('pointermove', this.handlePointerMove, { passive: false });
      window.addEventListener('pointerup', this.handlePointerUp);
      window.addEventListener('pointercancel', this.handlePointerCancel);

      // Prevent default pinch-zoom or scrolling when dragging on interactive elements
      this.stageSvg.style.touchAction = 'none';

      // Whiteboard Ink message listener from parent window / WebRTC classroom mesh
      window.addEventListener('message', (ev) => {
        if (!ev.data) return;
        if (ev.data.type === 'IMPORT_WHITEBOARD_INK' || ev.data.type === 'LOAD_WHITEBOARD_INK') {
          const raw = ev.data.data || ev.data.ast || ev.data.json;
          if (typeof raw === 'string') {
            if (raw.trim().startsWith('(')) {
              this.importInkFromAST(raw);
            } else {
              try {
                this.importInkFromJSON(JSON.parse(raw));
              } catch {
                this.importInkFromAST(raw);
              }
            }
          } else if (typeof raw === 'object') {
            this.importInkFromJSON(raw);
          }
          this.showFloatingNotice('📥 Whiteboard ink loaded!');
        } else if (ev.data.type === 'CLEAR_WHITEBOARD_INK') {
          this.clearWhiteboardInk();
        } else if (ev.data.type === 'UNDO_WHITEBOARD_INK') {
          this.undoLastStroke();
        } else if (ev.data.type === 'EXPORT_WHITEBOARD_INK') {
          this.broadcastInkSession();
        } else if (ev.data.type === 'TOGGLE_PEN') {
          this.isPenActive = Boolean(ev.data.enabled);
          if (this.stageSvg) this.stageSvg.style.cursor = this.isPenActive ? 'crosshair' : 'default';
        }
      });
    }

    /**
     * Converts client screen coordinates into precise SVG coordinate space (0..800, 0..480)
     */
    screenToSvg(clientX, clientY) {
      if (!this.stageSvg) return { x: 0, y: 0 };
      const pt = this.stageSvg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = this.stageSvg.getScreenCTM();
      if (!ctm) return { x: clientX, y: clientY };
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    }

    /**
     * Enhances interactive nodes with grab cursors, data attributes and tactile hover feedback
     */
    enhanceSceneInteractivity() {
      if (!this.stageSvg) return;

      // Restore any persisted annotations for this scene
      this.restoreInkFromSession();

      // 1. Kinetic Gas Piston Handle
      const piston = this.stageSvg.querySelector('#kg-piston') || this.stageSvg.querySelector('#piston-assembly');
      if (piston) {
        piston.style.cursor = 'ew-resize';
        piston.setAttribute('data-draggable', 'piston');
        piston.setAttribute('data-pedagogical', 'kg-piston');
      }

      // 2. Calculus Tangent Probe
      const tangentAssembly = this.stageSvg.querySelector('#cc-tangent-assembly') || this.stageSvg.querySelector('#tangent-assembly') || this.stageSvg.querySelector('#tangent-probe');
      if (tangentAssembly) {
        tangentAssembly.style.cursor = 'grab';
        tangentAssembly.setAttribute('data-draggable', 'tangent-probe');
        tangentAssembly.setAttribute('data-pedagogical', 'cc-probe');
      }

      // 3. Electrical Switch
      const switchEl = this.stageSvg.querySelector('[data-action="toggle-switch"]') || this.stageSvg.querySelector('#circuit-switch') || this.stageSvg.querySelector('#switch-assembly');
      if (switchEl) {
        switchEl.style.cursor = 'pointer';
        switchEl.setAttribute('data-interactive', 'switch');
        switchEl.setAttribute('data-pedagogical', 'ec-switch');
      }

      // 4. Bourdon Gauge & Thermometer
      const gauge = this.stageSvg.querySelector('#kg-gauge-needle')?.parentNode;
      if (gauge) gauge.setAttribute('data-pedagogical', 'kg-gauge');

      const thermo = this.stageSvg.querySelector('#kg-thermo-fluid')?.parentNode;
      if (thermo) thermo.setAttribute('data-pedagogical', 'kg-thermo');

      const brownian = this.stageSvg.querySelector('#kg-brownian');
      if (brownian) brownian.setAttribute('data-pedagogical', 'kg-brownian');

      const integralArea = this.stageSvg.querySelector('#cc-integral-area') || this.stageSvg.querySelector('#integral-shaded-area');
      if (integralArea) integralArea.setAttribute('data-pedagogical', 'cc-integral');

      // 5. Pythagoras Theorem Draggable Handles & Action Buttons
      const pythHandleA = this.stageSvg.querySelector('#pyth-handle-a');
      if (pythHandleA) {
        pythHandleA.style.cursor = 'ns-resize';
        pythHandleA.setAttribute('data-draggable', 'pyth-handle-a');
        pythHandleA.setAttribute('data-pedagogical', 'pyth-handle-a');
      }
      const pythHandleB = this.stageSvg.querySelector('#pyth-handle-b');
      if (pythHandleB) {
        pythHandleB.style.cursor = 'ew-resize';
        pythHandleB.setAttribute('data-draggable', 'pyth-handle-b');
        pythHandleB.setAttribute('data-pedagogical', 'pyth-handle-b');
      }
      const sqA = this.stageSvg.querySelector('#pyth-poly-a');
      if (sqA) sqA.setAttribute('data-pedagogical', 'pyth-sq-a');
      const sqB = this.stageSvg.querySelector('#pyth-poly-b');
      if (sqB) sqB.setAttribute('data-pedagogical', 'pyth-sq-b');
      const sqC = this.stageSvg.querySelector('#pyth-poly-c');
      if (sqC) sqC.setAttribute('data-pedagogical', 'pyth-sq-c');
      const tri = this.stageSvg.querySelector('#pyth-triangle');
      if (tri) tri.setAttribute('data-pedagogical', 'pyth-triangle');
      const ra = this.stageSvg.querySelector('#pyth-right-angle');
      if (ra) ra.setAttribute('data-pedagogical', 'pyth-right-angle');

      // 6. Math Fishing Pond Hook & Bobber Manipulation
      const bobber = this.stageSvg.querySelector('#fishing-bobber');
      const hook = this.stageSvg.querySelector('#fishing-hook');
      if (bobber) {
        bobber.style.cursor = 'grab';
        bobber.setAttribute('data-draggable', 'fishing-hook');
        bobber.setAttribute('data-pedagogical', 'math-bobber');
      }
      if (hook) {
        hook.style.cursor = 'grab';
        hook.setAttribute('data-draggable', 'fishing-hook');
        hook.setAttribute('data-pedagogical', 'math-hook');
      }

      // 7. Mountain Climber Beacon
      const climberMarker = this.stageSvg.querySelector('#climber-marker');
      const climberPulse = this.stageSvg.querySelector('#climber-pulse');
      if (climberMarker) {
        climberMarker.style.cursor = 'grab';
        climberMarker.setAttribute('data-draggable', 'climber');
        climberMarker.setAttribute('data-pedagogical', 'mtn-climber');
      }
      if (climberPulse) {
        climberPulse.style.cursor = 'grab';
        climberPulse.setAttribute('data-draggable', 'climber');
      }

      // 8. Procedural Scene Ingestions (Fish Pond & Aquarium Boids)
      const fishGroup = this.stageSvg.querySelector('#fish-school-group');
      if (fishGroup) {
        if (hook) {
          this.setupMathFishingFish();
        } else if (this.stageSvg.querySelector('#tank-water') || this.stageSvg.querySelector('#benchmark-hud')) {
          this.setupFishTankBoids();
        }
      }

      // 9. Pythagoras Geometry Initialization
      if (pythHandleA && pythHandleB) {
        this.renderPythagorasGeometry(3, 4);
      }

      // 9b. Circuit Electron Flow Loop
      if (this.stageSvg.querySelector('#circuit-switch') || this.stageSvg.querySelector('.e-dot')) {
        this.startCircuitElectronsLoop();
      }

      // 9bb. Solar System Cosmic Top Trumps & Reticle Tracker
      if (this.stageSvg.querySelector('#solar-top-trumps-card') || this.stageSvg.querySelector('#planet-earth') || this.stageSvg.querySelector('#orbit-mercury')) {
        this.setupSolarSystemInteractivity();
      }

      // 9bc. Times Tables (2x to 12x) Dynamic 2D Array & Distributive Splitter
      if (this.stageSvg.querySelector('#tt-table-strip') || this.stageSvg.querySelector('#tt-stage-array') || this.stageSvg.querySelector('#tt-laser-splitter')) {
        this.setupTimesTablesInteractivity();
      }

      // 9bd. Atomic Structure Bohr Shells & 18-Element Periodic Table Ribbon
      if (this.stageSvg.querySelector('#atom-periodic-card') || this.stageSvg.querySelector('#atom-periodic-ribbon') || this.stageSvg.querySelector('#nucleus-cluster')) {
        this.setupAtomInteractivity();
      }

      // 9be. Spelling Bee Interactive KS1-KS3 Orthography & Speech Synthesis Subsystem
      if (this.stageSvg.querySelector('#bee-root') || this.stageSvg.querySelector('#bee-header') || (this.engine.scene && this.engine.scene.id === 'spelling-bee')) {
        this.setupSpellingBeeInteractivity();
      }

      // 9bf. Phonics Laboratory Sound Buttons & Blending Mat Interactive Subsystem
      if (this.stageSvg.querySelector('#ph-card-c') || this.stageSvg.querySelector('#ph-btn-c') || (this.engine.scene && this.engine.scene.id === 'phonics-lab')) {
        this.setupPhonicsLabInteractivity();
      }

      // 9bg. Catholic Rites & 24 Churches Interactive Slider Subsystem
      if (this.stageSvg.querySelector('#rite-selector-knob') || this.stageSvg.querySelector('#rite-selector-container') || (this.engine.scene && this.engine.scene.id === 'catholic-rites')) {
        this.setupCatholicRitesInteractivity();
      }

      // 9bh. Nicene Creed Trinitarian Dial Subsystem
      if (this.stageSvg.querySelector('#creed-trinity-slider') || this.stageSvg.querySelector('#creed-dial-container') || (this.engine.scene && this.engine.scene.id === 'nicene-creed')) {
        this.setupNiceneCreedInteractivity();
      }

      // 9bi. Ten Commandments Decalogue Two-Tablet Slider Subsystem
      if (this.stageSvg.querySelector('#tablet-toggle-knob') || this.stageSvg.querySelector('#tablet-selector-container') || (this.engine.scene && this.engine.scene.id === 'ten-commandments')) {
        this.setupTenCommandmentsInteractivity();
      }

      // 9bj. Sacred Objects Category Slider Subsystem
      if (this.stageSvg.querySelector('#category-slider-knob') || this.stageSvg.querySelector('#sacred-category-track') || (this.engine.scene && this.engine.scene.id === 'sacred-objects')) {
        this.setupSacredObjectsInteractivity();
      }

      // 9bk. BBC Micro Model B Keyboard & 6502 Subsystem
      if (this.stageSvg.querySelector('#row-fn-keys') || this.stageSvg.querySelector('#key-break') || (this.engine.scene && this.engine.scene.id === 'bbc-model-b')) {
        this.setupBbcMicroInteractivity();
      }

      // 9c. Simulation Parameters Live Controls Dock
      this.setupSimParametersHud();

      // 9d. DNA Double Helix Base-Pair Rung Inspection (Zero-Bloat Harmonic Discovery)
      const dnaStrands = this.stageSvg.querySelector('#dna-strands');
      if (dnaStrands) {
        for (let i = 0; i < 18; i++) {
          const line = this.stageSvg.querySelector(`#dna-line-${i}`);
          const ca = this.stageSvg.querySelector(`#dna-ca-${i}`);
          const cb = this.stageSvg.querySelector(`#dna-cb-${i}`);
          const isAT = (i % 2 === 0);
          const baseName = isAT ? 'Adenine = Thymine (2 Hydrogen Bonds)' : 'Cytosine ≡ Guanine (3 Hydrogen Bonds)';
          const targets = [line, ca, cb].filter(Boolean);
          targets.forEach(node => {
            node.style.cursor = 'pointer';
            node.setAttribute('data-pedagogical', `dna-rung-${i}`);
            node.setAttribute('data-pedagogical-label', baseName);
            if (!node._hasDnaClick) {
              node._hasDnaClick = true;
              node.addEventListener('pointerdown', (ev) => {
                ev.stopPropagation();
                if (isAT) {
                  this.playAudioTone(523.25, 'sine', 0.12, 0.18);
                  setTimeout(() => this.playAudioTone(659.25, 'sine', 0.14, 0.2), 60);
                } else {
                  this.playAudioTone(440.0, 'sine', 0.12, 0.18);
                  setTimeout(() => this.playAudioTone(554.37, 'sine', 0.12, 0.2), 60);
                  setTimeout(() => this.playAudioTone(659.25, 'sine', 0.16, 0.22), 120);
                }
                const statusEl = this.stageSvg.querySelector('#dna-status-text');
                if (statusEl) {
                  statusEl.textContent = `Inspected Rung #${i + 1}: ${baseName}`;
                  statusEl.setAttribute('fill', isAT ? '#f87171' : '#60a5fa');
                }
              });
            }
          });
        }
      }

      // 9e. DNA Interactive Control Ribbon (Helicase Unzip, Base Filters, Speed Chips)
      const dnaRibbon = this.stageSvg.querySelector('#dna-control-ribbon');
      if (dnaRibbon) {
        const setUnzipUI = (val) => {
          if (this.engine) this.engine.setVar('unzipProgress', val);
          const b0 = dnaRibbon.querySelector('#btn-dna-unzip-0 rect');
          const b50 = dnaRibbon.querySelector('#btn-dna-unzip-50 rect');
          const b100 = dnaRibbon.querySelector('#btn-dna-unzip-100 rect');
          if (b0) b0.setAttribute('fill', val === 0 ? '#0284c7' : '#1e293b');
          if (b50) b50.setAttribute('fill', Math.abs(val - 0.5) < 0.1 ? '#0284c7' : '#1e293b');
          if (b100) b100.setAttribute('fill', val === 1.0 ? '#0284c7' : '#1e293b');
        };

        const setSpeedUI = (spd) => {
          if (this.engine) this.engine.setVar('rotSpeed', spd);
          const s1 = dnaRibbon.querySelector('#btn-dna-speed-1 rect');
          const s2 = dnaRibbon.querySelector('#btn-dna-speed-2 rect');
          if (s1) s1.setAttribute('fill', spd <= 1.2 ? '#0284c7' : '#1e293b');
          if (s2) s2.setAttribute('fill', spd > 1.2 ? '#0284c7' : '#1e293b');
        };

        const setFilterUI = (mode) => {
          const fAll = dnaRibbon.querySelector('#btn-dna-filter-all rect');
          const fAt = dnaRibbon.querySelector('#btn-dna-filter-at rect');
          const fCg = dnaRibbon.querySelector('#btn-dna-filter-cg rect');
          if (fAll) fAll.setAttribute('fill', mode === 'all' ? '#0284c7' : '#1e293b');
          if (fAt) fAt.setAttribute('fill', mode === 'at' ? '#0284c7' : '#1e293b');
          if (fCg) fCg.setAttribute('fill', mode === 'cg' ? '#0284c7' : '#1e293b');

          for (let i = 0; i < 18; i++) {
            const line = this.stageSvg.querySelector(`#dna-line-${i}`);
            const ca = this.stageSvg.querySelector(`#dna-ca-${i}`);
            const cb = this.stageSvg.querySelector(`#dna-cb-${i}`);
            const isAT = (i % 2 === 0);
            const visible = (mode === 'all') || (mode === 'at' && isAT) || (mode === 'cg' && !isAT);
            const op = visible ? '1.0' : '0.12';
            if (line) line.setAttribute('opacity', op);
            if (ca) ca.setAttribute('opacity', op);
            if (cb) cb.setAttribute('opacity', op);
          }
        };

        dnaRibbon.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('pointerdown', (ev) => {
            ev.stopPropagation();
            const act = btn.getAttribute('data-action');
            if (act === 'dna-unzip-0') {
              setUnzipUI(0.0);
              this.playAudioTone(440, 'sine', 0.1, 0.2);
            } else if (act === 'dna-unzip-50') {
              setUnzipUI(0.5);
              this.playAudioTone(554.37, 'sine', 0.1, 0.2);
            } else if (act === 'dna-unzip-100') {
              setUnzipUI(1.0);
              this.playAudioTone(659.25, 'triangle', 0.12, 0.25);
            } else if (act === 'dna-speed-1') {
              setSpeedUI(1.0);
              this.playAudioTone(480, 'sine', 0.08, 0.15);
            } else if (act === 'dna-speed-2') {
              setSpeedUI(2.0);
              this.playAudioTone(600, 'sine', 0.08, 0.15);
            } else if (act === 'dna-filter-all') {
              setFilterUI('all');
              this.playAudioTone(523.25, 'triangle', 0.08, 0.18);
            } else if (act === 'dna-filter-at') {
              setFilterUI('at');
              this.playAudioTone(659.25, 'triangle', 0.08, 0.18);
            } else if (act === 'dna-filter-cg') {
              setFilterUI('cg');
              this.playAudioTone(783.99, 'triangle', 0.08, 0.18);
            }
          });
        });
      }

      // 10. Dynamic Declarative Scene Gestures
      const scene = this.engine && this.engine.scene;
      if (scene && scene.gestures && Array.isArray(scene.gestures)) {
        scene.gestures.forEach(g => {
          if (!g.target) return;
          const el = this.stageSvg.querySelector(g.target);
          if (el) {
            el.style.pointerEvents = 'auto';
            el.style.touchAction = 'none';
            el.querySelectorAll('*').forEach(child => {
              if (child && child.style) child.style.pointerEvents = 'auto';
            });
            if (g.type === 'interactive') {
              el.style.cursor = 'pointer';
              el.setAttribute('data-interactive', g.action || 'toggle');
              if (g.action) el.setAttribute('data-action', g.action);
            } else {
              el.style.cursor = g.axis === 'y' ? 'ns-resize' : (g.axis === 'x' ? 'ew-resize' : 'grab');
              el.setAttribute('data-draggable', 'generic');
              el.setAttribute('data-gesture-axis', g.axis || 'xy');
              if (g.minX !== undefined) el.setAttribute('data-gesture-min-x', String(g.minX));
              if (g.maxX !== undefined) el.setAttribute('data-gesture-max-x', String(g.maxX));
              if (g.minY !== undefined) el.setAttribute('data-gesture-min-y', String(g.minY));
              if (g.maxY !== undefined) el.setAttribute('data-gesture-max-y', String(g.maxY));
              if (g.var) el.setAttribute('data-gesture-var', g.var);
            }
          }
        });
      }
    }

    /**
     * Primary PointerDown Handler
     */
    handlePointerDown(e) {
      if (this.engine && this.engine.isAiDemonstrating) {
        this.engine.preemptAiDemonstration('USER_CANVAS_TOUCH');
      }

      if (e.target.closest('#stage-glass-hud-ui') || e.target.closest('.interactive-card')) {
        return;
      }

      const svgPt = this.screenToSvg(e.clientX, e.clientY);

      // A. If Whiteboard Pen Mode is active, draw ink stroke
      if (this.isPenActive) {
        e.preventDefault();
        this.isDrawing = true;
        this.startInkStroke(svgPt);
        return;
      }

      // B. Check for interactive direct-grab targets or action buttons
      const target = e.target.closest('[data-draggable], [data-interactive], [data-action], [data-planet], #circuit-switch, #kg-piston, #piston-assembly, #cc-tangent-assembly, #tangent-assembly, #tangent-probe, #pyth-handle-a, #pyth-handle-b, #fishing-hook, #fishing-bobber, #fishing-bobber-rig, #climber-marker, #climber-pulse, #mtn-climber, #ind-solid, #ind-liquid, #ind-gas, #txt-solid, #txt-liquid, #txt-gas, #tt-laser-splitter');

      if (target) {
        // Direct Cosmic Planet Click / Fact Card Trigger (Tap again to toggle closed)
        const planetNode = target.hasAttribute('data-planet') ? target : target.closest('[data-planet]');
        if (planetNode) {
          e.preventDefault();
          const pKey = planetNode.getAttribute('data-planet');
          if (pKey) {
            if (this._activePlanetKey === pKey) {
              this.closePlanetFactCard();
            } else {
              this.showPlanetFactCard(pKey);
            }
          }
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Times Tables Laser Splitter Drag Mode
        if (target.id === 'tt-laser-splitter' || target.closest('#tt-laser-splitter') || target.getAttribute('data-draggable') === 'splitter') {
          e.preventDefault();
          try { this.stageSvg.setPointerCapture(e.pointerId); } catch {}
          this.isDragging = true;
          this.dragTarget = this.stageSvg.querySelector('#tt-laser-splitter') || target;
          this.dragMode = 'tt-splitter';
          this.playAudioTone(480, 'sine', 0.08);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Catholic Rites Slider Knob Drag Mode
        if (target.id === 'rite-selector-knob' || target.closest('#rite-selector-knob') || target.getAttribute('data-draggable') === 'rite-selector') {
          e.preventDefault();
          try { this.stageSvg.setPointerCapture(e.pointerId); } catch {}
          this.isDragging = true;
          this.dragTarget = this.stageSvg.querySelector('#rite-selector-knob') || target;
          this.dragMode = 'rite-selector';
          this.dragTarget.style.cursor = 'grabbing';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(523.25, 'triangle', 0.08);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Nicene Creed Slider Knob Drag Mode
        if (target.id === 'creed-trinity-slider' || target.closest('#creed-trinity-slider')) {
          e.preventDefault();
          try { this.stageSvg.setPointerCapture(e.pointerId); } catch {}
          this.isDragging = true;
          this.dragTarget = this.stageSvg.querySelector('#creed-trinity-slider') || target;
          this.dragMode = 'creed-slider';
          this.dragTarget.style.cursor = 'grabbing';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(523.25, 'triangle', 0.08);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Ten Commandments Tablet Toggle Knob Drag Mode
        if (target.id === 'tablet-toggle-knob' || target.closest('#tablet-toggle-knob')) {
          e.preventDefault();
          try { this.stageSvg.setPointerCapture(e.pointerId); } catch {}
          this.isDragging = true;
          this.dragTarget = this.stageSvg.querySelector('#tablet-toggle-knob') || target;
          this.dragMode = 'tablet-knob';
          this.dragTarget.style.cursor = 'grabbing';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(440, 'triangle', 0.08);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Sacred Objects Category Slider Knob Drag Mode
        if (target.id === 'category-slider-knob' || target.closest('#category-slider-knob')) {
          e.preventDefault();
          try { this.stageSvg.setPointerCapture(e.pointerId); } catch {}
          this.isDragging = true;
          this.dragTarget = this.stageSvg.querySelector('#category-slider-knob') || target;
          this.dragMode = 'category-knob';
          this.dragTarget.style.cursor = 'grabbing';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(493.88, 'triangle', 0.08);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Phase State Indicator Click Check (Solid, Liquid, Gas)
        const stateNode = (target.id && (target.id.includes('ind-') || target.id.includes('txt-'))) ? target : target.closest('#ind-solid, #ind-liquid, #ind-gas, #txt-solid, #txt-liquid, #txt-gas, [data-interactive="gas-state"]');
        if (stateNode) {
          e.preventDefault();
          let st = 'gas';
          const nid = stateNode.id || stateNode.getAttribute('data-gas-state') || '';
          if (nid.includes('solid')) st = 'solid';
          else if (nid.includes('liquid')) st = 'liquid';
          else if (nid.includes('gas')) st = 'gas';

          let temp = 300;
          if (st === 'solid') temp = 85;
          else if (st === 'liquid') temp = 220;
          else if (st === 'gas') temp = 300;

          if (this.engine && typeof this.engine.setVar === 'function') {
            this.engine.setVar('state', st);
            this.engine.setVar('temp', temp);
          }
          this.playAudioTone(st === 'solid' ? 220 : (st === 'liquid' ? 440 : 660), 'sine', 0.08);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Knife Switch Click Toggle Check
        const switchNode = target.id === 'circuit-switch' ? target : target.closest('#circuit-switch');
        if (switchNode || target.getAttribute('data-interactive') === 'switch' || target.getAttribute('data-action') === 'toggle-switch') {
          e.preventDefault();
          this.toggleSwitch(switchNode || target);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        // Direct Action Buttons (e.g. Pythagoras steppers, presets, toggles, pond actions, times-table chips)
        const actionTarget = target.hasAttribute('data-action') ? target : target.closest('[data-action]');
        if (actionTarget) {
          e.preventDefault();
          this.handleActionClick(actionTarget.getAttribute('data-action'), actionTarget);
          this.createTouchRipple(svgPt.x, svgPt.y);
          return;
        }

        e.preventDefault();
        try {
          this.stageSvg.setPointerCapture(e.pointerId);
        } catch {}

        this.isDragging = true;
        this.dragTarget = target;
        this.dragStart = { x: svgPt.x, y: svgPt.y };

        // Determine specific drag mode
        if (target.id === 'mtn-climber' || target.id === 'climber-marker' || target.id === 'climber-pulse' || target.getAttribute('data-draggable') === 'climber' || target.closest('#mtn-climber')) {
          this.dragMode = 'climber';
          target.style.cursor = 'grabbing';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(440, 'triangle', 0.08);
        } else if (target.id === 'pyth-handle-a' || target.getAttribute('data-draggable') === 'pyth-handle-a' || target.closest('#pyth-handle-a') || target.closest('[data-draggable="pyth-handle-a"]')) {
          this.dragMode = 'pyth-handle-a';
          target.style.cursor = 'ns-resize';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(440, 'triangle', 0.08);
        } else if (target.id === 'pyth-handle-b' || target.getAttribute('data-draggable') === 'pyth-handle-b' || target.closest('#pyth-handle-b') || target.closest('[data-draggable="pyth-handle-b"]')) {
          this.dragMode = 'pyth-handle-b';
          target.style.cursor = 'ew-resize';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(554.37, 'triangle', 0.08);
        } else if (target.hasAttribute('data-bind-input') || (this.engine && this.engine.activeBindInputs && this.engine.activeBindInputs.some(b => b.node === target || b.target === '#' + target.id || (target.id && b.target === target.id)))) {
          this.dragMode = 'bind-input';
          target.style.cursor = 'grabbing';
          this.playAudioTone(380, 'sine', 0.05);
        } else if (target.id === 'kg-piston' || target.id === 'piston-assembly' || target.getAttribute('data-draggable') === 'piston') {
          this.dragMode = 'piston';
          target.style.cursor = 'grabbing';
          this.playAudioTone(330, 'triangle', 0.08);
        } else if (target.id === 'cc-tangent-assembly' || target.id === 'tangent-assembly' || target.id === 'tangent-probe' || target.getAttribute('data-draggable') === 'tangent-probe') {
          this.dragMode = 'tangent-probe';
          target.style.cursor = 'grabbing';
          this.playAudioTone(440, 'sine', 0.08);
        } else if (target.id === 'fishing-hook' || target.id === 'fishing-bobber' || target.id === 'fishing-bobber-rig' || target.getAttribute('data-draggable') === 'fishing-hook' || target.closest('#fishing-rod-group')) {
          if (this._hookedFish) {
            this.reelHookToSurface();
            this.createTouchRipple(svgPt.x, svgPt.y);
            return;
          }
          this.dragMode = 'fishing-hook';
          target.style.cursor = 'grabbing';
          if (this.engine && this.engine._cachedElements) this.engine._cachedElements.isUserControlled = true;
          this.playAudioTone(320, 'sine', 0.08, 0.18);
        } else if (target.getAttribute('data-draggable') === 'generic' || target.closest('[data-draggable="generic"]')) {
          const genTarget = target.getAttribute('data-draggable') === 'generic' ? target : target.closest('[data-draggable="generic"]');
          this.dragTarget = genTarget;
          this.dragMode = 'generic';
          genTarget.style.cursor = 'grabbing';
          this._wasPlayingBeforeDrag = Boolean(this.engine && this.engine.isPlaying);
          const isContinuousScene = this.engine && (this.engine.isContinuousSim || (this.engine.scene && (this.engine.scene.continuous || this.engine.scene.isContinuous || this.engine.scene.type === 'Sim' || this.engine.scene.id === 'solar-system' || this.engine.scene.id === 'kinetic-gas')));
          if (this.engine && !isContinuousScene && genTarget.id !== 'sun-body') {
            this.engine.pause();
          }
          let initX = 0;
          let initY = 0;
          const tr = genTarget.getAttribute('transform') || '';
          const trM = /translate\(\s*([\d\.\-]+)(?:[\s,]+([\d\.\-]+))?\s*\)/i.exec(tr);
          const initTx = trM ? parseFloat(trM[1]) : 0;
          const initTy = (trM && trM[2]) ? parseFloat(trM[2]) : 0;
          try {
            const bbox = genTarget.getBBox();
            initX = bbox.x;
            initY = bbox.y;
          } catch (_) {
            initX = parseFloat(genTarget.getAttribute('x') || genTarget.getAttribute('cx') || '0');
            initY = parseFloat(genTarget.getAttribute('y') || genTarget.getAttribute('cy') || '0');
          }
          this.targetInitial = {
            transform: tr,
            initTx,
            initTy,
            x: initX,
            y: initY
          };
          this.playAudioTone(380, 'triangle', 0.06);
        } else if (target.getAttribute('data-interactive') === 'switch' || target.getAttribute('data-interactive') === 'toggle-switch' || target.getAttribute('data-action') === 'toggle-switch') {
          this.toggleSwitch(target);
          return;
        }

        // Show live touch ripples
        this.createTouchRipple(svgPt.x, svgPt.y);
      } else if (this.isXRayActive) {
        const pedNode = e.target.closest('[data-pedagogical]');
        if (pedNode) {
          this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y);
        }
      } else {
        // Solar System: Proximity selection and backdrop dismissal
        if (this.engine && this.engine.scene && this.engine.scene.id === 'solar-system') {
          const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'sun'];
          let closestKey = null;
          let minDist = 38;
          for (const p of planets) {
            const el = this.stageSvg.querySelector(p === 'sun' ? '#sun-body' : `#planet-${p}`);
            if (el) {
              const px = parseFloat(el.getAttribute('cx') || el.getAttribute('x') || 0);
              const py = parseFloat(el.getAttribute('cy') || el.getAttribute('y') || 0);
              const dist = Math.hypot(svgPt.x - px, svgPt.y - py);
              if (dist < minDist) {
                minDist = dist;
                closestKey = p;
              }
            }
          }
          if (closestKey) {
            if (this._activePlanetKey === closestKey) {
              this.closePlanetFactCard();
            } else {
              this.showPlanetFactCard(closestKey);
            }
            this.createTouchRipple(svgPt.x, svgPt.y);
            return;
          } else if (this._activePlanetKey) {
            // Clicked empty background space away from planets: dismiss the fact card
            const card = this.stageSvg.querySelector('#solar-top-trumps-card');
            const isInsideCard = card && (card === e.target || card.contains(e.target));
            if (!isInsideCard) {
              this.closePlanetFactCard();
              return;
            }
          }
        }
      }
    }

    /**
     * Primary PointerMove Handler with Native Browser C++ Hardware Event Coalescing
     * Leverages e.getCoalescedEvents() to extract all 120Hz-240Hz digitizer points
     * from Promethean, SMART, Apple Pencil, and Surface digitizers instead of dropping intermediate coordinates.
     */
    handlePointerMove(e) {
      // 1. Extract coalesced hardware points if provided by browser C++ engine; fallback to single event
      const rawEvents = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : [e];
      const eventsToProcess = (rawEvents && rawEvents.length > 0) ? rawEvents : [e];

      // A. Whiteboard Pen Drawing: Process every hardware coordinate
      if (this.isDrawing && this.currentStroke) {
        e.preventDefault();
        for (let i = 0; i < eventsToProcess.length; i++) {
          const subEv = eventsToProcess[i];
          const svgPt = this.screenToSvg(subEv.clientX, subEv.clientY);
          this.continueInkStroke(svgPt);
        }
        return;
      }

      // For standard gesture dragging, use the latest coalesced position
      const latestEv = eventsToProcess[eventsToProcess.length - 1];
      const svgPt = this.screenToSvg(latestEv.clientX, latestEv.clientY);

      // B. Direct Canvas Dragging
      if (this.isDragging && this.dragTarget) {
        e.preventDefault();

        if (this.dragMode === 'climber') {
          this.handleClimberDrag(svgPt);
        } else if (this.dragMode === 'piston') {
          this.handlePistonDrag(svgPt.x);
        } else if (this.dragMode === 'tangent-probe') {
          this.handleTangentProbeDrag(svgPt.x);
        } else if (this.dragMode === 'bind-input') {
          this.handleBindInputDrag(this.dragTarget, svgPt);
        } else if (this.dragMode === 'pyth-handle-a') {
          this.handlePythagorasDragA(svgPt.y);
        } else if (this.dragMode === 'pyth-handle-b') {
          this.handlePythagorasDragB(svgPt.x);
        } else if (this.dragMode === 'fishing-hook') {
          this.handleFishingHookDrag(svgPt);
        } else if (this.dragMode === 'tt-splitter') {
          this.handleTimesTablesSplitterDrag(svgPt.x);
        } else if (this.dragMode === 'rite-selector') {
          this.handleRiteSelectorDrag(svgPt.x);
        } else if (this.dragMode === 'creed-slider') {
          this.handleCreedSliderDrag(svgPt.x);
        } else if (this.dragMode === 'tablet-knob') {
          this.handleTabletKnobDrag(svgPt.x);
        } else if (this.dragMode === 'category-knob') {
          this.handleCategoryKnobDrag(svgPt.x);
        } else if (this.dragMode === 'generic') {
          this.handleGenericDrag(this.dragTarget, svgPt);
        }
      } else if (this.isXRayActive) {
        const pedNode = e.target.closest('[data-pedagogical]');
        if (pedNode) {
          this.showXRayPopup(pedNode.getAttribute('data-pedagogical'), svgPt.x, svgPt.y);
        } else {
          this.hideXRayPopup();
        }
      }

      // C. Direct Analytic Ray-Math: Update cursor ray hit for spatial proprioception
      if (this.engine && typeof this.engine.updateCursorRay === 'function' && !this.isDrawing && !this.isDragging) {
        const now = performance.now();
        if (!this._lastRayCastTime || (now - this._lastRayCastTime > 120)) {
          this._lastRayCastTime = now;
          this.engine.updateCursorRay(svgPt.x, svgPt.y);
        }
      }
    }

    /**
     * Primary PointerUp Handler
     */
    handlePointerUp(e) {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.endInkStroke();
      }

      if (this.isDragging && this.dragTarget) {
        try {
          this.stageSvg.releasePointerCapture(e.pointerId);
        } catch {}

        if (this.dragMode === 'piston') {
          this.dragTarget.style.cursor = 'ew-resize';
          this.playAudioTone(220, 'sine', 0.05);
        } else if (this.dragMode === 'tangent-probe') {
          this.dragTarget.style.cursor = 'grab';
          this.playAudioTone(523.25, 'sine', 0.06);
        } else if (this.dragMode === 'bind-input') {
          this.dragTarget.style.cursor = 'grab';
          this.playAudioTone(520, 'sine', 0.04);
        } else if (this.dragMode === 'pyth-handle-a') {
          this.dragTarget.style.cursor = 'ns-resize';
          this.playAudioTone(523.25, 'triangle', 0.08);
        } else if (this.dragMode === 'pyth-handle-b') {
          this.dragTarget.style.cursor = 'ew-resize';
          this.playAudioTone(659.25, 'triangle', 0.08);
        } else if (this.dragMode === 'fishing-hook') {
          if (this.dragTarget) this.dragTarget.style.cursor = 'grab';
          this.finishFishingHookDrag();
        } else if (this.dragMode === 'rite-selector') {
          if (this.dragTarget) this.dragTarget.style.cursor = 'ew-resize';
          this.finishRiteSelectorDrag();
        } else if (this.dragMode === 'creed-slider') {
          if (this.dragTarget) this.dragTarget.style.cursor = 'ew-resize';
          this.finishCreedSliderDrag();
        } else if (this.dragMode === 'tablet-knob') {
          if (this.dragTarget) this.dragTarget.style.cursor = 'ew-resize';
          this.finishTabletKnobDrag();
        } else if (this.dragMode === 'category-knob') {
          if (this.dragTarget) this.dragTarget.style.cursor = 'ew-resize';
          this.finishCategoryKnobDrag();
        } else if (this.dragMode === 'generic') {
          const axis = this.dragTarget.getAttribute('data-gesture-axis') || 'xy';
          this.dragTarget.style.cursor = axis === 'y' ? 'ns-resize' : (axis === 'x' ? 'ew-resize' : 'grab');
          this.playAudioTone(440, 'sine', 0.05);
          if (this.engine && !this.engine.isPlaying && this._wasPlayingBeforeDrag) {
            this.engine.play();
          }
        }

        this.isDragging = false;
        this.dragTarget = null;
        this.dragMode = null;
        this._wasPlayingBeforeDrag = false;
      }
    }

    handlePointerCancel(e) {
      this.handlePointerUp(e);
    }

    handleGenericDrag(target, svgPt) {
      if (!target) return;

      // Special physical resolution for Algebraic Balance Scale
      if (this.engine && this.engine.activePresetId === 'algebra-balance') {
        const dy = svgPt.y - this.dragStart.y;
        const curX = (this.engine.vars && this.engine.vars.xVal) || 5;
        const targetX = Math.max(1, Math.min(10, Math.round(5 - dy / 18)));
        if (targetX !== curX) {
          this.engine.setVar('xVal', targetX);
          this.playAudioTone(300 + targetX * 35, 'triangle', 0.04, 0.12);
        }
        return;
      }

      const axis = target.getAttribute('data-gesture-axis') || 'xy';
      const minX = parseFloat(target.getAttribute('data-gesture-min-x') || '0');
      const maxX = parseFloat(target.getAttribute('data-gesture-max-x') || '800');
      const minY = parseFloat(target.getAttribute('data-gesture-min-y') || '0');
      const maxY = parseFloat(target.getAttribute('data-gesture-max-y') || '480');
      const varName = target.getAttribute('data-gesture-var');

      const dx = svgPt.x - this.dragStart.x;
      const dy = svgPt.y - this.dragStart.y;

      let targetTx = (this.targetInitial.initTx || 0) + (axis !== 'y' ? dx : 0);
      let targetTy = (this.targetInitial.initTy || 0) + (axis !== 'x' ? dy : 0);

      if (axis === 'x' || axis === 'xy') {
        if (!isNaN(minX) && !isNaN(maxX) && maxX > minX) {
          if (this.targetInitial.initTx !== 0 || targetTx >= minX - 20) {
            targetTx = Math.max(minX, Math.min(maxX, targetTx));
          } else {
            const absX = (this.targetInitial.x || 0) + (targetTx - (this.targetInitial.initTx || 0));
            if (absX < minX) targetTx = (this.targetInitial.initTx || 0) + (minX - (this.targetInitial.x || 0));
            if (absX > maxX) targetTx = (this.targetInitial.initTx || 0) + (maxX - (this.targetInitial.x || 0));
          }
        }
      }
      if (axis === 'y' || axis === 'xy') {
        if (!isNaN(minY) && !isNaN(maxY) && maxY > minY) {
          if (this.targetInitial.initTy !== 0 || targetTy >= minY - 20) {
            targetTy = Math.max(minY, Math.min(maxY, targetTy));
          } else {
            const absY = (this.targetInitial.y || 0) + (targetTy - (this.targetInitial.initTy || 0));
            if (absY < minY) targetTy = (this.targetInitial.initTy || 0) + (minY - (this.targetInitial.y || 0));
            if (absY > maxY) targetTy = (this.targetInitial.initTy || 0) + (maxY - (this.targetInitial.y || 0));
          }
        }
      }

      target.setAttribute('transform', `translate(${targetTx.toFixed(1)}, ${targetTy.toFixed(1)})`);

      if (varName && this.engine && typeof this.engine.setVar === 'function') {
        const ratio = axis === 'y'
          ? Math.max(0, Math.min(1, (targetTy - minY) / (maxY - minY || 1)))
          : Math.max(0, Math.min(1, (targetTx - minX) / (maxX - minX || 1)));

        let vMin = 0;
        let vMax = 100;
        let stepVal = 1;
        let foundConfig = false;

        const sceneInputs = this.engine.scene && this.engine.scene.inputs;
        if (Array.isArray(sceneInputs)) {
          const inp = sceneInputs.find(i => i && i.var === varName);
          if (inp) {
            if (typeof inp.min === 'number') vMin = inp.min;
            if (typeof inp.max === 'number') vMax = inp.max;
            if (typeof inp.step === 'number') stepVal = inp.step;
            foundConfig = true;
          }
        }

        if (!foundConfig && this.engine.scene && this.engine.scene.vars) {
          const rawVar = this.engine.scene.vars[varName];
          if (rawVar && typeof rawVar === 'object') {
            if (typeof rawVar.min === 'number') vMin = rawVar.min;
            if (typeof rawVar.max === 'number') vMax = rawVar.max;
            if (typeof rawVar.step === 'number') stepVal = rawVar.step;
            foundConfig = true;
          }
        }

        if (!foundConfig && varName === 'selectedRite') {
          vMin = 1.0;
          vMax = 6.0;
          stepVal = 1.0;
        }

        const mapped = vMin + ratio * (vMax - vMin);
        const stepped = Math.round(mapped / stepVal) * stepVal;
        this.engine.setVar(varName, stepped);
      }

      if (this.engine) {
        this.engine.applyBindings(this.engine.progress);
      }
    }

    // =========================================================================
    // Direct Manipulation Action 0: Bidirectional Slider-to-Variable Drag
    // =========================================================================
    handleBindInputDrag(target, svgPt) {
      if (!this.engine || !this.engine.activeBindInputs) return;
      const binding = this.engine.activeBindInputs.find(b => b.node === target || b.target === '#' + target.id || (target.id && b.target === target.id));
      if (!binding) return;

      const axis = binding.axis || 'x';
      const tMin = binding.trackMin !== undefined ? binding.trackMin : (axis === 'y' ? 320 : 60);
      const tMax = binding.trackMax !== undefined ? binding.trackMax : (axis === 'y' ? 80 : 440);
      let ratio = 0;

      if (axis === 'y') {
        const minY = Math.min(tMin, tMax);
        const maxY = Math.max(tMin, tMax);
        const clampedY = Math.max(minY, Math.min(maxY, svgPt.y));
        ratio = (clampedY - tMin) / (tMax - tMin);
        target.setAttribute('transform', `translate(0, ${clampedY.toFixed(1)})`);
      } else if (axis === 'rotary') {
        const center = { x: binding.originX || 0, y: binding.originY || 0 };
        const angleRad = Math.atan2(svgPt.y - center.y, svgPt.x - center.x);
        let angleDeg = (angleRad * 180 / Math.PI) + 90;
        if (angleDeg < -135) angleDeg = -135;
        if (angleDeg > 135) angleDeg = 135;
        ratio = (angleDeg + 135) / 270;
        target.setAttribute('transform', `rotate(${angleDeg.toFixed(1)} ${center.x} ${center.y})`);
      } else {
        const minX = Math.min(tMin, tMax);
        const maxX = Math.max(tMin, tMax);
        const clampedX = Math.max(minX, Math.min(maxX, svgPt.x));
        ratio = (clampedX - tMin) / (tMax - tMin);
        target.setAttribute('transform', `translate(${clampedX.toFixed(1)}, 0)`);
      }

      ratio = Math.max(0, Math.min(1, ratio));
      const val = binding.min + ratio * (binding.max - binding.min);
      this.engine.setVar(binding.var, Number(val.toFixed(2)));
    }

    // =========================================================================
    // Direct Manipulation Action 1: Kinetic Gas Piston Direct Compression
    // =========================================================================
    handlePistonDrag(svgX) {
      // Piston bounds: 200 (compressed) to 450 (decompressed)
      const clampedX = Math.max(200, Math.min(450, svgX));
      
      // Update Piston Transform
      const pistonEl = this.stageSvg.querySelector('#kg-piston') || this.stageSvg.querySelector('#piston-assembly');
      if (pistonEl) {
        pistonEl.setAttribute('transform', `translate(${clampedX.toFixed(1)}, 0)`);
      }

      // Volume ratio: 1.0 at 450, 0.40 at 200
      const volRatio = (clampedX - 150) / 300;
      // Boyle's Law: P = P0 / V
      const pressureKpa = (101.3 / Math.max(0.35, volRatio)).toFixed(1);

      // Gauge needle angle: -45 deg at 101.3 kPa, +85 deg at 289 kPa
      const gaugeAngle = -45 + (1.0 - volRatio) * 130;
      const needle = this.stageSvg.querySelector('#kg-gauge-needle') || this.stageSvg.querySelector('#gauge-needle');
      if (needle) {
        needle.setAttribute('transform', `rotate(${gaugeAngle.toFixed(1)} 0 0)`);
      }

      const gaugeVal = this.stageSvg.querySelector('#kg-gauge-val') || this.stageSvg.querySelector('#gauge-value');
      if (gaugeVal) {
        gaugeVal.textContent = `${pressureKpa} kPa`;
      }

      const eqCard = this.stageSvg.querySelector('#kg-pv-eq') || this.stageSvg.querySelector('#pv-equation');
      if (eqCard) {
        eqCard.textContent = `P × V = ${(parseFloat(pressureKpa) * volRatio).toFixed(0)}  •  [Boyle's Law Direct Grab: V=${(volRatio * 100).toFixed(0)}%]`;
      }

      // Sync with Engine Reactive State Variables and Scene Cache
      if (this.engine && this.engine._cachedElements) {
        this.engine._cachedElements.userPistonX = clampedX;
      }
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('volume', parseFloat(volRatio.toFixed(3)));
        this.engine.setVar('pressure', parseFloat(pressureKpa));
      }

      // Procedural audio: compression pitch rises as pressure spikes
      if (this.sonificationEnabled && Math.random() < 0.15) {
        const freq = 200 + (1.0 - volRatio) * 400;
        this.playAudioTone(freq, 'sawtooth', 0.03, 0.05);
      }
    }

    // =========================================================================
    // Direct Manipulation Action 2: Calculus Curve Tangent Probe Dragging
    // =========================================================================
    handleTangentProbeDrag(svgX) {
      // Grid domain: x from 70 to 470 (center origin at x=250)
      const clampedX = Math.max(80, Math.min(460, svgX));
      const mathX = (clampedX - 250) / 50; // -3.4 to +4.2
      // Parabola equation: y = x^2 - 2x
      const mathY = mathX * mathX - 2 * mathX;
      // SVG Y: origin at 210, 25px per math unit
      const svgY = 210 - mathY * 25;

      const assembly = this.stageSvg.querySelector('#cc-tangent-assembly') || this.stageSvg.querySelector('#tangent-assembly');
      if (assembly) {
        assembly.setAttribute('transform', `translate(${clampedX.toFixed(1)}, ${svgY.toFixed(1)})`);
      }

      // Derivative slope: dy/dx = 2x - 2
      const slope = 2 * mathX - 2;
      const angleDeg = (-Math.atan(slope) * 180) / Math.PI;

      const line = this.stageSvg.querySelector('#cc-tangent-line') || this.stageSvg.querySelector('#tangent-line');
      if (line) {
        line.setAttribute('transform', `rotate(${angleDeg.toFixed(1)})`);
      }

      const slopeVal = this.stageSvg.querySelector('#cc-slope-val') || this.stageSvg.querySelector('#card-slope-val');
      if (slopeVal) {
        slopeVal.textContent = `m = ${slope >= 0 ? '+' : ''}${slope.toFixed(2)}`;
      }

      // Sync with Engine Reactive State Variables and Scene Cache
      if (this.engine && this.engine._cachedElements) {
        this.engine._cachedElements.userProbeX = clampedX;
      }
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('probeX', parseFloat(mathX.toFixed(2)));
        this.engine.setVar('probeY', parseFloat(mathY.toFixed(2)));
        this.engine.setVar('slope', parseFloat(slope.toFixed(2)));
      }

      // Detect Stationary Turning Point (dy/dx ≈ 0)
      if (Math.abs(slope) < 0.12) {
        if (!this._lastStationarySound || Date.now() - this._lastStationarySound > 800) {
          this.playAudioTone(880, 'sine', 0.25, 0.2); // Bright chime
          this._lastStationarySound = Date.now();
        }
      }
    }

    // =========================================================================
    // Direct Manipulation Action 3: Electrical Knife Switch Toggle
    // =========================================================================
    toggleSwitch(switchEl) {
      const isClosed = switchEl.getAttribute('data-state') !== 'open';
      const newState = isClosed ? 'open' : 'closed';
      switchEl.setAttribute('data-state', newState);

      // Sync with Engine Reactive State Variables
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('switchClosed', newState === 'closed');
      }

      // Play authentic mechanical snap click
      this.playAudioTone(isClosed ? 180 : 360, 'square', 0.04, 0.3);

      const bulbGlow = this.stageSvg.querySelector('#bulb-halo');
      const blade = this.stageSvg.querySelector('#switch-blade');
      const swText = this.stageSvg.querySelector('#switch-text');
      const dots = this.stageSvg.querySelectorAll('.e-dot');

      if (blade) {
        if (newState === 'open') {
          blade.setAttribute('x2', '45');
          blade.setAttribute('y2', '0');
          blade.setAttribute('stroke', '#ef4444');
        } else {
          blade.setAttribute('x2', '60');
          blade.setAttribute('y2', '20');
          blade.setAttribute('stroke', '#22c55e');
        }
      }
      if (swText) {
        swText.textContent = newState === 'open' ? 'SWITCH: OPEN (Click to close)' : 'SWITCH: CLOSED (Click to open)';
        swText.setAttribute('fill', newState === 'open' ? '#f87171' : '#4ade80');
      }

      if (newState === 'open') {
        if (bulbGlow) bulbGlow.setAttribute('opacity', '0.05');
        if (dots) dots.forEach(d => d.setAttribute('opacity', '0.2'));
      } else {
        if (bulbGlow) bulbGlow.setAttribute('opacity', '0.9');
        if (dots) dots.forEach(d => d.setAttribute('opacity', '1.0'));
      }
    }

    // =========================================================================
    // Direct Manipulation Action 4: Pythagoras Theorem PhET Geometry & Controls
    // =========================================================================
    handlePythagorasDragA(svgY) {
      const originY = this._pythOriginY !== undefined ? this._pythOriginY : 280;
      const s = this._pythScale || 28;
      const rawA = (originY - svgY) / s;
      const clampedA = Math.max(1, Math.min(15, Math.round(rawA)));
      const curB = (this._pythState && this._pythState.b) || (this.engine && this.engine.vars && this.engine.vars.sideB) || 4;
      this.renderPythagorasGeometry(clampedA, curB);
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('sideA', clampedA);
      }
      this.playAudioTone(300 + clampedA * 30, 'triangle', 0.05, 0.12);
    }

    handlePythagorasDragB(svgX) {
      const originX = this._pythOriginX !== undefined ? this._pythOriginX : 360;
      const s = this._pythScale || 28;
      const rawB = (svgX - originX) / s;
      const clampedB = Math.max(1, Math.min(15, Math.round(rawB)));
      const curA = (this._pythState && this._pythState.a) || (this.engine && this.engine.vars && this.engine.vars.sideA) || 3;
      this.renderPythagorasGeometry(curA, clampedB);
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('sideB', clampedB);
      }
      this.playAudioTone(320 + clampedB * 25, 'triangle', 0.05, 0.12);
    }

    /**
     * Direct Manipulation of Mountain Elevation Climber
     * Projects pointer position onto slope line segment from (180, 380) to (400, 140)
     */
    handleClimberDrag(svgPt) {
      const startX = 180, startY = 380;
      const endX = 400, endY = 140;
      const dx = endX - startX;
      const dy = endY - startY;
      const segLenSq = dx * dx + dy * dy;

      const px = svgPt.x - startX;
      const py = svgPt.y - startY;
      const dot = px * dx + py * dy;
      let t = dot / segLenSq;
      t = Math.max(0, Math.min(1, t));

      if (this.engine) {
        this.engine.seek(t);
      }
      const el = this.engine && this.engine._cachedElements;
      if (el) {
        el.isUserControlled = true;
        if (typeof el.updateGeometry === 'function') el.updateGeometry(t);
      }

      // Footstep & altitude audio feedback
      const freq = 360 + t * 300;
      this.playAudioTone(freq, 'sine', 0.04, 0.08);

      if (t >= 0.98) {
        this.playAudioTone(880, 'triangle', 0.2, 0.2);
      }
    }

    /**
     * Direct Manipulation & Logic for Math Pond Apparatus
     * Dynamic target bounds (5, 10, 20), concrete Ten-Frame visualization,
     * subitising representations, and tactile sonification.
     */
    getMathPondTargetSum() {
      const v = this.engine && this.engine.vars && Number(this.engine.vars.targetSum);
      return (v && v >= 2 && v <= 100) ? v : 10;
    }

    handleFishingHookDrag(svgPt) {
      const el = this.engine && this.engine._cachedElements;
      if (!this.stageSvg) return;

      if (el) el.isUserControlled = true;

      const clampedX = Math.max(80, Math.min(740, svgPt.x));
      const clampedY = Math.max(120, Math.min(440, svgPt.y));

      const hook = this.stageSvg.querySelector('#fishing-hook');
      const bobberRig = this.stageSvg.querySelector('#fishing-bobber-rig');
      const line = this.stageSvg.querySelector('#fishing-line');
      const eqText = this.stageSvg.querySelector('#math-hud-equation');
      const rod = this.stageSvg.querySelector('#fishing-rod');
      const releaseBtn = this.stageSvg.querySelector('#hook-release-btn');

      // 1. Dynamic rod bending towards pointer
      if (rod) {
        const rodTipX = 330 + (clampedX - 330) * 0.28;
        const rodTipY = 126 - Math.max(0, 126 - clampedY) * 0.45;
        rod.setAttribute('d', `M 330,126 Q ${(330 + (rodTipX - 330) * 0.5).toFixed(1)},${(126 - 48).toFixed(1)} ${rodTipX.toFixed(1)},${rodTipY.toFixed(1)}`);

        if (line) {
          line.setAttribute('x1', rodTipX.toFixed(1));
          line.setAttribute('y1', rodTipY.toFixed(1));
        }
      }

      // 2. Position hook & line
      if (hook) {
        hook.setAttribute('transform', `translate(${clampedX.toFixed(1)}, ${clampedY.toFixed(1)})`);
      }
      if (line) {
        line.setAttribute('x2', clampedX.toFixed(1));
        line.setAttribute('y2', clampedY.toFixed(1));
      }

      // 3. Bobber floats at waterline (y ~ 155) unless submerged
      const bobberY = Math.min(160, Math.max(140, clampedY));
      if (bobberRig) {
        bobberRig.setAttribute('transform', `translate(${clampedX.toFixed(1)}, ${bobberY.toFixed(1)})`);
      }

      // 4. Fish collision detection in the pond
      if (el && el.fishEls && el.fishEls.length) {
        if (!this._hookedFish) {
          if (releaseBtn) releaseBtn.style.display = 'none';
          for (let i = 0; i < el.fishEls.length; i++) {
            const fish = el.fishEls[i];
            if (fish.caught || fish.isHooked) continue;
            let fx = fish.curX !== undefined ? fish.curX : fish.x;
            let fy = fish.curY !== undefined ? fish.curY : fish.y;
            const dist = Math.hypot(clampedX - fx, clampedY - fy);
            if (dist < 36) {
              // NIBBLE & HOOK!
              this._hookedFish = fish;
              fish.isHooked = true;
              this.playAudioTone(540, 'sine', 0.08, 0.2);
              setTimeout(() => this.playAudioTone(680, 'sine', 0.08, 0.25), 60);

              if (releaseBtn) releaseBtn.style.display = 'block';

              const targetSum = this.getMathPondTargetSum();
              const lang = (window.AST_ENGINE_ACTIVE_LANG || window.STJ_CURRENT_LANG || 'en').toLowerCase();
              if (eqText) {
                if (lang.startsWith('es')) eqText.textContent = `¡Enganchaste un ${fish.val}! Llévalo hacia la superficie.`;
                else if (lang.startsWith('fr')) eqText.textContent = `Accroché ${fish.val} ! Remontez-le vers la surface.`;
                else if (lang.startsWith('la')) eqText.textContent = `Piscis ${fish.val} captus! Attolle ad superficiem.`;
                else eqText.textContent = `Hooked ${fish.val}! Pull up to surface or tap hook to reel in!`;
              }
              break;
            }
          }
        } else {
          // Move hooked fish with the hook
          if (releaseBtn) releaseBtn.style.display = 'block';
          if (this._hookedFish.el) {
            this._hookedFish.el.setAttribute('transform', `translate(${clampedX.toFixed(1)}, ${(clampedY + 12).toFixed(1)}) rotate(15)`);
          }
        }
      }
    }

    releaseCurrentFish() {
      if (!this._hookedFish) return;
      const fish = this._hookedFish;
      fish.isHooked = false;
      this._hookedFish = null;
      fish.curY = Math.min(380, (fish.curY || 240) + 40);
      const releaseBtn = this.stageSvg && this.stageSvg.querySelector('#hook-release-btn');
      if (releaseBtn) releaseBtn.style.display = 'none';

      this.playAudioTone(380, 'sine', 0.12, 0.15);
      const eqText = this.stageSvg && this.stageSvg.querySelector('#math-hud-equation');
      if (eqText) {
        const lang = (window.AST_ENGINE_ACTIVE_LANG || window.STJ_CURRENT_LANG || 'en').toLowerCase();
        if (lang.startsWith('es')) eqText.textContent = `Pez liberado. ¡Encuentra el vínculo numérico correcto!`;
        else if (lang.startsWith('fr')) eqText.textContent = `Poisson relâché. Cherchez le bon complément !`;
        else if (lang.startsWith('la')) eqText.textContent = `Piscis liberatus. Requiras vinculum congruum!`;
        else eqText.textContent = `Fish released back to pond. Find the complement!`;
      }
    }

    castToFishIndex(idx) {
      const el = this.engine && this.engine._cachedElements;
      if (!el || !el.fishEls || !el.fishEls[idx]) return;
      const fish = el.fishEls[idx];
      if (fish.caught || fish.isHooked) return;

      if (this._hookedFish) {
        this.reelHookToSurface();
        return;
      }

      el.isUserControlled = true;
      const targetX = fish.curX || fish.x;
      const targetY = fish.curY || fish.y;

      this.handleFishingHookDrag({ x: targetX, y: targetY });
      this.createPondSplash(targetX, 155);
      this.playAudioTone(440, 'triangle', 0.08, 0.2);
      setTimeout(() => this.playAudioTone(660, 'sine', 0.08, 0.25), 80);
    }

    reelHookToSurface() {
      if (!this._hookedFish) return;
      const hook = this.stageSvg && this.stageSvg.querySelector('#fishing-hook');
      const ctm = hook ? hook.getAttribute('transform') : null;
      let hookX = 440;
      if (ctm) {
        const match = ctm.match(/translate\(\s*([\d.-]+)/);
        if (match) hookX = parseFloat(match[1]);
      }
      this.handleFishingHookDrag({ x: hookX, y: 155 });
      this.finishFishingHookDrag();
    }

    createPondSplash(x, y) {
      const fxLayer = this.stageSvg && this.stageSvg.querySelector('#pond-fx-layer');
      if (!fxLayer) return;

      // Concentric ripple ring
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ring.setAttribute('cx', x.toFixed(1));
      ring.setAttribute('cy', y.toFixed(1));
      ring.setAttribute('rx', '8');
      ring.setAttribute('ry', '3');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#bae6fd');
      ring.setAttribute('stroke-width', '2');
      ring.setAttribute('opacity', '0.9');
      fxLayer.appendChild(ring);

      let frame = 0;
      const animRing = () => {
        frame++;
        ring.setAttribute('rx', (8 + frame * 3.5).toFixed(1));
        ring.setAttribute('ry', (3 + frame * 1.4).toFixed(1));
        ring.setAttribute('opacity', Math.max(0, 0.9 - frame * 0.07).toFixed(2));
        if (frame < 14) {
          requestAnimationFrame(animRing);
        } else {
          ring.remove();
        }
      };
      requestAnimationFrame(animRing);
    }

    updateTenFrameHud(sum, targetSum, caughtList) {
      const tfGroup = this.stageSvg && this.stageSvg.querySelector('#ten-frame-group');
      if (!tfGroup) return;

      tfGroup.innerHTML = '';
      const totalSlots = Math.min(20, Math.max(5, targetSum));

      // Build color map for catches
      const catchColors = ['#fb923c', '#38bdf8', '#34d399', '#f472b6', '#a855f7'];
      let slotColors = [];
      let currentVal = 0;
      if (Array.isArray(caughtList)) {
        caughtList.forEach((cVal, cIdx) => {
          const col = catchColors[cIdx % catchColors.length];
          for (let k = 0; k < cVal; k++) {
            slotColors.push(col);
          }
        });
      }

      if (totalSlots <= 10) {
        // Single row of slots
        const slotWidth = Math.floor(410 / totalSlots) - 4;
        const slotHeight = 22;
        for (let i = 0; i < totalSlots; i++) {
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          const isFilled = i < sum;
          const col = slotColors[i] || '#38bdf8';
          const x = i * (slotWidth + 4);

          g.innerHTML = `
            <rect x="${x}" y="0" width="${slotWidth}" height="${slotHeight}" rx="4"
                  fill="${isFilled ? col : '#1e293b'}"
                  fill-opacity="${isFilled ? '0.9' : '0.6'}"
                  stroke="${isFilled ? '#ffffff' : '#334155'}"
                  stroke-width="${isFilled ? '1.5' : '1'}"
                  stroke-dasharray="${isFilled ? 'none' : '3 2'}" />
            ${isFilled ? `<circle cx="${x + slotWidth / 2}" cy="11" r="5" fill="#ffffff" />` : `<text x="${x + slotWidth / 2}" y="15" fill="#64748b" font-size="9" font-weight="700" text-anchor="middle">${i + 1}</text>`}
          `;
          tfGroup.appendChild(g);
        }

        // Summary readout
        const info = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        info.setAttribute('x', '435');
        info.setAttribute('y', '15');
        info.setAttribute('fill', sum === targetSum ? '#facc15' : '#38bdf8');
        info.setAttribute('font-size', '10.5');
        info.setAttribute('font-weight', '800');
        info.textContent = `${sum} / ${targetSum}`;
        tfGroup.appendChild(info);

      } else {
        // Double Ten-Frame (2 rows of 10 for target = 20)
        const slotWidth = 36;
        const slotHeight = 11;
        for (let i = 0; i < totalSlots; i++) {
          const row = Math.floor(i / 10);
          const colIdx = i % 10;
          const x = colIdx * 40;
          const y = row * 14;
          const isFilled = i < sum;
          const col = slotColors[i] || '#38bdf8';

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.innerHTML = `
            <rect x="${x}" y="${y}" width="${slotWidth}" height="${slotHeight}" rx="3"
                  fill="${isFilled ? col : '#1e293b'}"
                  stroke="${isFilled ? '#ffffff' : '#334155'}"
                  stroke-width="${isFilled ? '1.2' : '1'}" />
            ${isFilled ? `<circle cx="${x + slotWidth / 2}" cy="${y + 5.5}" r="3.5" fill="#ffffff" />` : ''}
          `;
          tfGroup.appendChild(g);
        }

        const info = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        info.setAttribute('x', '425');
        info.setAttribute('y', '18');
        info.setAttribute('fill', sum === targetSum ? '#facc15' : '#38bdf8');
        info.setAttribute('font-size', '10.5');
        info.setAttribute('font-weight', '800');
        info.textContent = `${sum} / ${targetSum}`;
        tfGroup.appendChild(info);
      }
    }

    updateScorePlaque() {
      if (!this._mathFishingScore) this._mathFishingScore = { bonds: 0, streak: 0 };
      const bondsEl = this.stageSvg && this.stageSvg.querySelector('#score-bonds-count');
      const streakEl = this.stageSvg && this.stageSvg.querySelector('#score-streak-text');
      if (bondsEl) bondsEl.textContent = String(this._mathFishingScore.bonds);
      if (streakEl) streakEl.textContent = `Streak: ${this._mathFishingScore.streak} 🔥`;
    }

    animateFishToTackleBucket(caughtFish) {
      if (!caughtFish || !caughtFish.el) return;
      const fishEl = caughtFish.el;

      // Arc jump towards tackle bucket on left bank (x ~ 50, y ~ 100)
      let tStep = 0;
      const startX = 340;
      const startY = 150;
      const targetX = 54;
      const targetY = 104;

      const jumpTick = () => {
        tStep += 0.05;
        const progress = Math.min(1.0, tStep);
        const curX = startX + (targetX - startX) * progress;
        const curY = startY + (targetY - startY) * progress - Math.sin(progress * Math.PI) * 55;
        const scale = 0.85 - progress * 0.45;

        fishEl.setAttribute('transform', `translate(${curX.toFixed(1)}, ${curY.toFixed(1)}) scale(${scale.toFixed(2)})`);

        if (progress < 1.0) {
          requestAnimationFrame(jumpTick);
        } else {
          fishEl.remove();
          this.createPondSplash(54, 114);
          this.playAudioTone(880, 'sine', 0.1, 0.2);

          // Wiggle tackle bucket
          const bucket = this.stageSvg && this.stageSvg.querySelector('#tackle-bucket');
          if (bucket) {
            bucket.setAttribute('transform', 'rotate(6, 50, 40)');
            setTimeout(() => bucket.setAttribute('transform', 'rotate(-4, 50, 40)'), 100);
            setTimeout(() => bucket.removeAttribute('transform'), 220);
          }
        }
      };
      requestAnimationFrame(jumpTick);
    }

    respawnFishPair(targetSum) {
      const fishGroup = this.stageSvg && this.stageSvg.querySelector('#fish-school-group');
      const el = this.engine && this.engine._cachedElements;
      if (!fishGroup || !el || !el.fishEls) return;

      // Remove inactive caught fish
      el.fishEls = el.fishEls.filter(f => !f.caught);

      // Generate a new pair that makes targetSum
      let a = Math.floor(Math.random() * (targetSum - 1)) + 1;
      let b = targetSum - a;
      const newVals = [a, b];

      const fishColors = ['#f97316', '#38bdf8', '#ec4899', '#10b981', '#a855f7', '#eab308', '#06b6d4', '#f43f5e', '#84cc16'];

      newVals.forEach((val) => {
        const color = fishColors[Math.floor(Math.random() * fishColors.length)];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.cursor = 'pointer';
        g.style.willChange = 'transform';
        g.setAttribute('data-action', 'cast-to-fish');
        const newIdx = el.fishEls.length;
        g.setAttribute('data-fish-idx', String(newIdx));

        const dots = this.getSubitisingDotPoints(val);
        const dotsSvg = dots.length > 0
          ? `<g transform="translate(-1, 0)" opacity="0.85">${dots.map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="1.5" fill="#ffffff" />`).join('')}</g>`
          : '';

        g.innerHTML = `
          <polygon class="fish-tail" points="-22,0 -34,-10 -34,10" fill="${color}" />
          <ellipse cx="0" cy="0" rx="22" ry="13" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="12" cy="-4" r="3" fill="#ffffff" />
          <circle cx="13" cy="-4" r="1.5" fill="#000000" />
          ${dotsSvg}
          <circle cx="0" cy="0" r="10" fill="#0f172a" opacity="0.8" />
          <text x="0" y="4" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">${val}</text>
        `;
        fishGroup.appendChild(g);

        const startX = Math.random() > 0.5 ? 70 : 730;
        const startY = 220 + Math.random() * 180;
        const dir = startX < 400 ? 1 : -1;

        el.fishEls.push({
          el: g,
          tailEl: g.querySelector('.fish-tail'),
          val,
          x: startX,
          y: startY,
          curX: startX,
          curY: startY,
          vx: (30 + Math.random() * 30) * dir,
          vy: (Math.random() - 0.5) * 8,
          caught: false,
          isHooked: false,
          swimPhase: Math.random() * Math.PI * 2,
          tailPhase: Math.random() * Math.PI * 2
        });
      });
    }

    getSubitisingDotPoints(n) {
      if (n === 1) return [{ cx: 0, cy: 0 }];
      if (n === 2) return [{ cx: -4, cy: 0 }, { cx: 4, cy: 0 }];
      if (n === 3) return [{ cx: -5, cy: -3 }, { cx: 0, cy: 0 }, { cx: 5, cy: 3 }];
      if (n === 4) return [{ cx: -4, cy: -4 }, { cx: 4, cy: -4 }, { cx: -4, cy: 4 }, { cx: 4, cy: 4 }];
      if (n === 5) return [{ cx: -4, cy: -4 }, { cx: 4, cy: -4 }, { cx: 0, cy: 0 }, { cx: -4, cy: 4 }, { cx: 4, cy: 4 }];
      if (n === 6) return [{ cx: -5, cy: -4 }, { cx: 0, cy: -4 }, { cx: 5, cy: -4 }, { cx: -5, cy: 4 }, { cx: 0, cy: 4 }, { cx: 5, cy: 4 }];
      if (n === 7) return [{ cx: -5, cy: -4 }, { cx: 0, cy: -4 }, { cx: 5, cy: -4 }, { cx: 0, cy: 0 }, { cx: -5, cy: 4 }, { cx: 0, cy: 4 }, { cx: 5, cy: 4 }];
      if (n === 8) return [{ cx: -6, cy: -4 }, { cx: -2, cy: -4 }, { cx: 2, cy: -4 }, { cx: 6, cy: -4 }, { cx: -6, cy: 4 }, { cx: -2, cy: 4 }, { cx: 2, cy: 4 }, { cx: 6, cy: 4 }];
      if (n === 9) return [{ cx: -5, cy: -5 }, { cx: 0, cy: -5 }, { cx: 5, cy: -5 }, { cx: -5, cy: 0 }, { cx: 0, cy: 0 }, { cx: 5, cy: 0 }, { cx: -5, cy: 5 }, { cx: 0, cy: 5 }, { cx: 5, cy: 5 }];
      if (n === 10) return [{ cx: -8, cy: -4 }, { cx: -4, cy: -4 }, { cx: 0, cy: -4 }, { cx: 4, cy: -4 }, { cx: 8, cy: -4 }, { cx: -8, cy: 4 }, { cx: -4, cy: 4 }, { cx: 0, cy: 4 }, { cx: 4, cy: 4 }, { cx: 8, cy: 4 }];
      return [];
    }

    finishFishingHookDrag() {
      if (!this._hookedFish) return;

      const hook = this.stageSvg.querySelector('#fishing-hook');
      const eqText = this.stageSvg.querySelector('#math-hud-equation');
      const releaseBtn = this.stageSvg.querySelector('#hook-release-btn');
      const el = this.engine && this.engine._cachedElements;
      const lang = (window.AST_ENGINE_ACTIVE_LANG || window.STJ_CURRENT_LANG || 'en').toLowerCase();
      const targetSum = this.getMathPondTargetSum();

      // Check if dragged above surface (y < 185)
      const ctm = hook ? hook.getAttribute('transform') : null;
      let hookY = 240;
      let hookX = 440;
      if (ctm) {
        const match = ctm.match(/translate\(\s*([\d.-]+),\s*([\d.-]+)\)/);
        if (match) {
          hookX = parseFloat(match[1]);
          hookY = parseFloat(match[2]);
        }
      }

      if (hookY < 185) {
        // Reeled In!
        const caughtFish = this._hookedFish;
        this._hookedFish = null;
        if (releaseBtn) releaseBtn.style.display = 'none';

        if (!el.caughtList) el.caughtList = [];
        el.caughtList.push(caughtFish.val);
        caughtFish.caught = true;

        this.createPondSplash(hookX, 155);

        const sum = el.caughtList.reduce((a, b) => a + b, 0);

        if (sum === targetSum) {
          // PERFECT NUMBER BOND!
          this.playAudioTone(523.25, 'triangle', 0.15, 0.25);
          setTimeout(() => this.playAudioTone(659.25, 'triangle', 0.15, 0.25), 120);
          setTimeout(() => this.playAudioTone(783.99, 'triangle', 0.15, 0.25), 240);
          setTimeout(() => this.playAudioTone(1046.50, 'sine', 0.40, 0.35), 380);

          if (!this._mathFishingScore) this._mathFishingScore = { bonds: 0, streak: 0 };
          this._mathFishingScore.bonds += 1;
          this._mathFishingScore.streak += 1;
          this.updateScorePlaque();

          this.updateTenFrameHud(sum, targetSum, el.caughtList);
          this.animateFishToTackleBucket(caughtFish);

          if (eqText) {
            if (lang.startsWith('es')) eqText.textContent = `🌟 ¡Vínculo perfecto! ${el.caughtList.join(' + ')} = ${targetSum} (¡Guardado en la cubeta!)`;
            else if (lang.startsWith('fr')) eqText.textContent = `🌟 Liaison parfaite ! ${el.caughtList.join(' + ')} = ${targetSum} (Dans le seau !)`;
            else if (lang.startsWith('la')) eqText.textContent = `🌟 Vinculum perfectum! ${el.caughtList.join(' + ')} = ${targetSum} (In situla repositum!)`;
            else eqText.textContent = `🌟 Perfect Bond! ${el.caughtList.join(' + ')} = ${targetSum} (Stored in Tackle Bucket!)`;
          }

          // Reset haul and respawn replacement fish
          el.caughtList = [];
          setTimeout(() => {
            this.respawnFishPair(targetSum);
            this.updateTenFrameHud(0, targetSum, []);
          }, 1800);

        } else if (sum < targetSum) {
          // Partial haul - need complement
          const needed = targetSum - sum;
          this.playAudioTone(440, 'triangle', 0.12, 0.2);
          this.updateTenFrameHud(sum, targetSum, el.caughtList);

          if (eqText) {
            const chain = el.caughtList.join(' + ');
            if (lang.startsWith('es')) eqText.textContent = `Llevas: ${chain} = ${sum}. ¡Pesca un ${needed} para hacer ${targetSum}!`;
            else if (lang.startsWith('fr')) eqText.textContent = `Pris : ${chain} = ${sum}. Pêchez ${needed} pour faire ${targetSum} !`;
            else if (lang.startsWith('la')) eqText.textContent = `Captum: ${chain} = ${sum}. Requiris ${needed} ad ${targetSum}!`;
            else eqText.textContent = `Haul: ${chain} = ${sum}! Catch a ${needed} fish to reach ${targetSum}!`;
          }

          if (caughtFish.el) {
            caughtFish.el.setAttribute('transform', `translate(340, 150) scale(0.85)`);
          }

        } else {
          // Exceeded target
          this.playAudioTone(220, 'sawtooth', 0.25, 0.2);
          if (!this._mathFishingScore) this._mathFishingScore = { bonds: 0, streak: 0 };
          this._mathFishingScore.streak = 0;
          this.updateScorePlaque();

          if (eqText) {
            if (lang.startsWith('es')) eqText.textContent = `Total: ${sum} (> ${targetSum}). ¡Supera la meta! Liberando al agua...`;
            else if (lang.startsWith('fr')) eqText.textContent = `Total : ${sum} (> ${targetSum}). Dépasse l'objectif ! Retour à l'eau...`;
            else if (lang.startsWith('la')) eqText.textContent = `Summa: ${sum} > ${targetSum}. Pisces ad stagnum revertuntur.`;
            else eqText.textContent = `Sum ${sum} exceeds ${targetSum}! Releasing fish back into pond...`;
          }

          if (caughtFish) {
            caughtFish.caught = false;
            caughtFish.isHooked = false;
            caughtFish.curY = 320;
          }
          el.caughtList = [];
          setTimeout(() => {
            this.updateTenFrameHud(0, targetSum, []);
          }, 1200);
        }

      } else {
        this.releaseCurrentFish();
      }
    }

    handleActionClick(action, targetNode) {
      if (this.engine) {
        if (!this.engine._cachedElements) {
          this.engine._cachedElements = {};
        }
        this.engine._cachedElements.isUserControlled = true;
      }
      const el = (this.engine && this.engine._cachedElements) || {};

      // -----------------------------------------------------------------------
      // Math Pond Apparatus Actions
      // -----------------------------------------------------------------------
      if (action && (action.startsWith('pond-') || action === 'cast-to-fish')) {
        if (action === 'pond-target-10') {
          if (this.engine) this.engine.setVar('targetSum', 10);
          this.setupMathFishingFish();
          this.playAudioTone(523.25, 'triangle', 0.08);
          return;
        } else if (action === 'pond-target-20') {
          if (this.engine) this.engine.setVar('targetSum', 20);
          this.setupMathFishingFish();
          this.playAudioTone(659.25, 'triangle', 0.08);
          return;
        } else if (action === 'pond-target-5') {
          if (this.engine) this.engine.setVar('targetSum', 5);
          this.setupMathFishingFish();
          this.playAudioTone(440, 'triangle', 0.08);
          return;
        } else if (action === 'pond-restock') {
          this.setupMathFishingFish();
          this.playAudioTone(784, 'sine', 0.12);
          return;
        } else if (action === 'pond-release') {
          this.releaseCurrentFish();
          return;
        } else if (action === 'cast-to-fish') {
          const fishIdx = targetNode ? parseInt(targetNode.getAttribute('data-fish-idx') || targetNode.closest('[data-fish-idx]')?.getAttribute('data-fish-idx'), 10) : NaN;
          if (!isNaN(fishIdx)) {
            this.castToFishIndex(fishIdx);
            return;
          }
        }
      }

      // -----------------------------------------------------------------------
      // Solar System & Cosmic Fact Card Actions
      // -----------------------------------------------------------------------
      if (action && (action === 'inspect-planet' || action === 'tt-next' || action === 'tt-prev' || action === 'tt-close' || action === 'card-close' || action === 'card-next' || action === 'card-prev' || action.startsWith('solar-warp-'))) {
        if (action === 'inspect-planet') {
          const planetKey = targetNode ? (targetNode.getAttribute('data-planet') || targetNode.closest('[data-planet]')?.getAttribute('data-planet')) : 'earth';
          if (this._activePlanetKey === planetKey) {
            this.closePlanetFactCard();
          } else {
            this.showPlanetFactCard(planetKey || 'earth');
          }
          return;
        } else if (action === 'tt-next' || action === 'card-next') {
          this.nextPlanetFactCard();
          return;
        } else if (action === 'tt-prev' || action === 'card-prev') {
          this.prevPlanetFactCard();
          return;
        } else if (action === 'tt-close' || action === 'card-close') {
          this.closePlanetFactCard();
          return;
        } else if (action === 'solar-warp-1') {
          if (this.engine) this.engine.setVar('warpSpeed', 1.0);
          this.updateWarpChips(1.0);
          this.playAudioTone(440, 'sine', 0.08);
          return;
        } else if (action === 'solar-warp-2') {
          if (this.engine) this.engine.setVar('warpSpeed', 2.0);
          this.updateWarpChips(2.0);
          this.playAudioTone(554, 'sine', 0.08);
          return;
        } else if (action === 'solar-warp-5') {
          if (this.engine) this.engine.setVar('warpSpeed', 5.0);
          this.updateWarpChips(5.0);
          this.playAudioTone(659, 'sine', 0.08);
          return;
        } else if (action === 'solar-warp-10') {
          if (this.engine) this.engine.setVar('warpSpeed', 10.0);
          this.updateWarpChips(10.0);
          this.playAudioTone(880, 'sine', 0.08);
          return;
        }
      }

      // -----------------------------------------------------------------------
      // Times Tables Master (1x to 12x) Actions
      // -----------------------------------------------------------------------
      if (action && action.startsWith('tt-')) {
        this.handleTimesTablesAction(action, targetNode);
        return;
      }

      // -----------------------------------------------------------------------
      // Atomic Structure & 18-Element Periodic Table Actions
      // -----------------------------------------------------------------------
      if (action && (action === 'atom-set-z' || action === 'atom-prev-z' || action === 'atom-next-z')) {
        if (action === 'atom-set-z') {
          const zAttr = targetNode ? (targetNode.getAttribute('data-z') || targetNode.closest('[data-z]')?.getAttribute('data-z')) : null;
          const z = parseInt(zAttr, 10);
          if (!isNaN(z)) this.setAtomZ(z);
          return;
        } else if (action === 'atom-prev-z') {
          const curZ = (this.engine.vars && Number(this.engine.vars.atomicNumber)) || 6;
          this.setAtomZ(curZ - 1);
          return;
        } else if (action === 'atom-next-z') {
          const curZ = (this.engine.vars && Number(this.engine.vars.atomicNumber)) || 6;
          this.setAtomZ(curZ + 1);
          return;
        }
      }

      // -----------------------------------------------------------------------
      // Spelling Bee Championship (KS1 to KS3) Actions
      // -----------------------------------------------------------------------
      if (action && action.startsWith('bee-')) {
        this.handleSpellingBeeAction(action, targetNode);
        return;
      }

      // -----------------------------------------------------------------------
      // Mountain Altitude & Trigonometry Apparatus Actions
      // -----------------------------------------------------------------------
      if (typeof el.updateGeometry === 'function') {
        if (action === 'mtn-inc-alt') {
          const newT = Math.min(1.0, (el.curT || 0) + (250 / 3000));
          el.updateGeometry(newT);
          this.playAudioTone(400 + newT * 260, 'sine', 0.06);
          return;
        } else if (action === 'mtn-dec-alt') {
          const newT = Math.max(0.0, (el.curT || 0) - (250 / 3000));
          el.updateGeometry(newT);
          this.playAudioTone(400 + newT * 260, 'sine', 0.06);
          return;
        } else if (action === 'mtn-angle-15') {
          el.slopeAngleDeg = 15;
          if (el.btnAng15) el.btnAng15.setAttribute('fill', '#0284c7');
          if (el.btnAng30) el.btnAng30.setAttribute('fill', '#1e293b');
          if (el.btnAng45) el.btnAng45.setAttribute('fill', '#1e293b');
          el.updateGeometry(el.curT);
          this.playAudioTone(520, 'triangle', 0.08);
          return;
        } else if (action === 'mtn-angle-30') {
          el.slopeAngleDeg = 30;
          if (el.btnAng15) el.btnAng15.setAttribute('fill', '#1e293b');
          if (el.btnAng30) el.btnAng30.setAttribute('fill', '#0284c7');
          if (el.btnAng45) el.btnAng45.setAttribute('fill', '#1e293b');
          el.updateGeometry(el.curT);
          this.playAudioTone(580, 'triangle', 0.08);
          return;
        } else if (action === 'mtn-angle-45') {
          el.slopeAngleDeg = 45;
          if (el.btnAng15) el.btnAng15.setAttribute('fill', '#1e293b');
          if (el.btnAng30) el.btnAng30.setAttribute('fill', '#1e293b');
          if (el.btnAng45) el.btnAng45.setAttribute('fill', '#0284c7');
          el.updateGeometry(el.curT);
          this.playAudioTone(640, 'triangle', 0.08);
          return;
        } else if (action === 'mtn-toggle-trig') {
          el.showTrig = !el.showTrig;
          el.updateGeometry(el.curT);
          this.playAudioTone(el.showTrig ? 600 : 300, 'sine', 0.06);
          return;
        } else if (action === 'mtn-toggle-lapse') {
          el.showAtmosphere = !el.showAtmosphere;
          if (el.hudGroup) el.hudGroup.style.display = el.showAtmosphere ? 'block' : 'none';
          if (el.btnLapseBg && el.btnLapseTxt) {
            el.btnLapseBg.setAttribute('fill', el.showAtmosphere ? '#0284c7' : '#1e293b');
            el.btnLapseTxt.textContent = el.showAtmosphere ? '🌡️ HUD: FULL' : '🌡️ HUD: MINI';
          }
          this.playAudioTone(el.showAtmosphere ? 520 : 320, 'sine', 0.06);
          return;
        } else if (action === 'mtn-jump-summit') {
          el.updateGeometry(1.0);
          this.playAudioTone(880, 'triangle', 0.2);
          return;
        } else if (action === 'mtn-reset') {
          el.isUserControlled = false;
          el.slopeAngleDeg = 30;
          el.showTrig = true;
          el.showAtmosphere = true;
          if (el.btnAng15) el.btnAng15.setAttribute('fill', '#1e293b');
          if (el.btnAng30) el.btnAng30.setAttribute('fill', '#0284c7');
          if (el.btnAng45) el.btnAng45.setAttribute('fill', '#1e293b');
          if (el.hudGroup) el.hudGroup.style.display = 'block';
          el.updateGeometry(0.0);
          this.playAudioTone(440, 'sine', 0.12);
          return;
        }
      }

      // -----------------------------------------------------------------------
      // Electrical Knife Switch Toggle
      // -----------------------------------------------------------------------
      if (action === 'toggle-switch') {
        const sw = this.stageSvg && (this.stageSvg.querySelector('#circuit-switch') || this.stageSvg.querySelector('[data-action="toggle-switch"]'));
        if (sw) this.toggleSwitch(sw);
        return;
      }

      // -----------------------------------------------------------------------
      // Pythagoras Theorem Apparatus Actions
      // -----------------------------------------------------------------------
      if (typeof this.renderPythagorasGeometry === 'function' || (el && typeof el.renderGeometry === 'function')) {
        const renderPyth = (a, b) => {
          if (typeof this.renderPythagorasGeometry === 'function') {
            this.renderPythagorasGeometry(a, b);
          } else if (el && typeof el.renderGeometry === 'function') {
            el.renderGeometry(a, b);
          }
        };
        const curA = (this._pythState && this._pythState.a) || (el && el.curA) || (this.engine && this.engine.vars && this.engine.vars.sideA) || 3;
        const curB = (this._pythState && this._pythState.b) || (el && el.curB) || (this.engine && this.engine.vars && this.engine.vars.sideB) || 4;

        if (action === 'pyth-dec-a') {
          const newA = Math.max(1, curA - 1);
          renderPyth(newA, curB);
          if (this.engine && this.engine.setVar) this.engine.setVar('sideA', newA);
          this.playAudioTone(380, 'sine', 0.06);
          return;
        } else if (action === 'pyth-inc-a') {
          const newA = Math.min(15, curA + 1);
          renderPyth(newA, curB);
          if (this.engine && this.engine.setVar) this.engine.setVar('sideA', newA);
          this.playAudioTone(460, 'sine', 0.06);
          return;
        } else if (action === 'pyth-dec-b') {
          const newB = Math.max(1, curB - 1);
          renderPyth(curA, newB);
          if (this.engine && this.engine.setVar) this.engine.setVar('sideB', newB);
          this.playAudioTone(420, 'sine', 0.06);
          return;
        } else if (action === 'pyth-inc-b') {
          const newB = Math.min(15, curB + 1);
          renderPyth(curA, newB);
          if (this.engine && this.engine.setVar) this.engine.setVar('sideB', newB);
          this.playAudioTone(520, 'sine', 0.06);
          return;
        } else if (action === 'pyth-pre-345') {
          renderPyth(3, 4);
          if (this.engine && this.engine.setVar) { this.engine.setVar('sideA', 3); this.engine.setVar('sideB', 4); }
          this.playAudioTone(660, 'triangle', 0.15);
          return;
        } else if (action === 'pyth-pre-6810') {
          renderPyth(6, 8);
          if (this.engine && this.engine.setVar) { this.engine.setVar('sideA', 6); this.engine.setVar('sideB', 8); }
          this.playAudioTone(880, 'triangle', 0.15);
          return;
        } else if (action === 'pyth-pre-51213') {
          renderPyth(5, 12);
          if (this.engine && this.engine.setVar) { this.engine.setVar('sideA', 5); this.engine.setVar('sideB', 12); }
          this.playAudioTone(1046.5, 'triangle', 0.18);
          return;
        } else if (action === 'pyth-toggle-grid') {
          if (el) el.showGrid = !el.showGrid;
          renderPyth(curA, curB);
          this.playAudioTone(600, 'sine', 0.06);
          return;
        } else if (action === 'pyth-toggle-liquid') {
          if (el) {
            el.liquidMode = !el.liquidMode;
            if (el.liquidMode && typeof el.animateLiquidPour === 'function') el.animateLiquidPour();
          }
          renderPyth(curA, curB);
          this.playAudioTone(587.33, 'sine', 0.12);
          return;
        } else if (action === 'pyth-reset') {
          if (el) { el.isUserControlled = false; el.showGrid = true; el.liquidMode = false; }
          renderPyth(3, 4);
          if (this.engine && this.engine.setVar) { this.engine.setVar('sideA', 3); this.engine.setVar('sideB', 4); }
          this.playAudioTone(440, 'sine', 0.15);
          return;
        }
      }
    }

    // =========================================================================
    // Whiteboard & Stylus Pen Ink Drawing Layer (Promethean / SMART / iPads)
    // =========================================================================
    startInkStroke(pt) {
      if (!this.inkRoot) return;
      const x = Number(pt.x.toFixed(1));
      const y = Number(pt.y.toFixed(1));
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', this.currentInkColor);
      path.setAttribute('stroke-width', this.currentInkWidth.toString());
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('d', `M ${x} ${y} `);

      this.inkRoot.appendChild(path);
      const strokeObj = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        element: path,
        color: this.currentInkColor,
        width: this.currentInkWidth,
        d: `M ${x} ${y} `,
        points: [{ x, y }],
        lastX: pt.x,
        lastY: pt.y
      };
      this.currentStroke = strokeObj;
      this.strokes.push(strokeObj);
    }

    continueInkStroke(pt) {
      if (!this.currentStroke) return;
      const x = Number(pt.x.toFixed(1));
      const y = Number(pt.y.toFixed(1));
      // Midpoint quadratic bézier smoothing for silky pen ink
      const midX = (this.currentStroke.lastX + pt.x) / 2;
      const midY = (this.currentStroke.lastY + pt.y) / 2;
      this.currentStroke.d += `Q ${this.currentStroke.lastX.toFixed(1)} ${this.currentStroke.lastY.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)} `;
      this.currentStroke.element.setAttribute('d', this.currentStroke.d);
      this.currentStroke.points.push({ x, y });
      this.currentStroke.lastX = pt.x;
      this.currentStroke.lastY = pt.y;
    }

    endInkStroke() {
      if (!this.currentStroke) return;
      this.currentStroke = null;
      this.persistInkToSession();
    }

    undoLastStroke() {
      if (!this.inkRoot || this.strokes.length === 0) return;
      const last = this.strokes.pop();
      if (last) {
        const el = last.element || (last instanceof Element ? last : null);
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
      this.persistInkToSession();
      this.playAudioTone(330, 'sine', 0.05);
    }

    clearWhiteboardInk() {
      if (!this.inkRoot) return;
      this.inkRoot.innerHTML = '';
      this.strokes = [];
      this.persistInkToSession();
      this.playAudioTone(440, 'triangle', 0.1);
    }

    /**
     * Serializes active whiteboard ink strokes into formal AST S-Expressions
     * Format:
     * (:ink-session
     *   :scene-id "fractions"
     *   :timestamp 1733849200
     *   :stroke-count 2
     *   (:strokes (
     *     (:ink-stroke :color "#facc15" :width 3.5 :d "M ... Q ..." :points ((120.0 80.0) ...))
     *   ))
     * )
     */
    exportInkToAST(options = {}) {
      const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard-session';
      const timestamp = Date.now();
      const strokeLines = [];

      for (let i = 0; i < this.strokes.length; i++) {
        const s = this.strokes[i];
        const color = s.color || (s.element && s.element.getAttribute('stroke')) || this.currentInkColor;
        const width = s.width || (s.element && parseFloat(s.element.getAttribute('stroke-width'))) || this.currentInkWidth;
        const d = (s.d || (s.element && s.element.getAttribute('d')) || '').trim();
        const pts = s.points || [];
        const ptsStr = pts.map(p => `(${p.x.toFixed(1)} ${p.y.toFixed(1)})`).join(' ');

        strokeLines.push(`    (:ink-stroke :color "${color}" :width ${width} :d "${d}" :points (${ptsStr}))`);
      }

      if (options.bareStrokes) {
        return strokeLines.join('\n');
      }

      return `(:ink-session
  :scene-id "${sceneId}"
  :timestamp ${timestamp}
  :stroke-count ${this.strokes.length}
  (:strokes (
${strokeLines.join('\n')}
  ))
)`;
    }

    /**
     * Imports AST S-Expression or AST vector nodes (:ink-session / :ink-stroke)
     * and renders smoothed SVG paths into the in-stage whiteboard ink layer.
     */
    importInkFromAST(astString, options = {}) {
      if (!astString || typeof astString !== 'string') return 0;
      if (!this.inkRoot) this.setupDomLayers();
      if (!this.inkRoot) return 0;

      if (options.clearExisting !== false) {
        this.inkRoot.innerHTML = '';
        this.strokes = [];
      }

      let importedCount = 0;
      // Extract balanced (:ink-stroke ...) S-Expression blocks
      const strokeBlocks = [];
      let pos = 0;
      while ((pos = astString.indexOf('(:ink-stroke', pos)) !== -1) {
        let depth = 0;
        let inQuote = false;
        let escape = false;
        let end = pos;
        for (let i = pos; i < astString.length; i++) {
          const ch = astString[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\') { escape = true; continue; }
          if (ch === '"') { inQuote = !inQuote; continue; }
          if (!inQuote) {
            if (ch === '(') depth++;
            else if (ch === ')') {
              depth--;
              if (depth === 0) {
                end = i + 1;
                break;
              }
            }
          }
        }
        if (end > pos) {
          strokeBlocks.push(astString.slice(pos, end));
          pos = end;
        } else {
          pos += 12;
        }
      }

      for (let b = 0; b < strokeBlocks.length; b++) {
        const body = strokeBlocks[b];

        // 1. Extract :color
        const colorMatch = body.match(/:color\s+"([^"]+)"/);
        const color = colorMatch ? colorMatch[1] : '#facc15';

        // 2. Extract :width
        const widthMatch = body.match(/:width\s+([0-9.]+)/);
        const width = widthMatch ? parseFloat(widthMatch[1]) : 3.5;

        // 3. Extract :d
        const dMatch = body.match(/:d\s+"([^"]+)"/);
        let d = dMatch ? dMatch[1] : '';

        // 4. Extract :points ((x y) (x y) ...) with balanced nested parens
        const pointsIdx = body.indexOf(':points');
        const points = [];
        if (pointsIdx !== -1) {
          const afterPoints = body.slice(pointsIdx + 7).trim();
          if (afterPoints.startsWith('(')) {
            let depth = 0;
            let pointsContent = '';
            for (let i = 0; i < afterPoints.length; i++) {
              if (afterPoints[i] === '(') depth++;
              else if (afterPoints[i] === ')') depth--;
              pointsContent += afterPoints[i];
              if (depth === 0) break;
            }
            const ptRegex = /\(\s*([0-9.-]+)\s+([0-9.-]+)\s*\)/g;
            let ptMatch;
            while ((ptMatch = ptRegex.exec(pointsContent)) !== null) {
              points.push({ x: parseFloat(ptMatch[1]), y: parseFloat(ptMatch[2]) });
            }
          }
        }

        // Reconstruct d from points if :d attribute was empty
        if (!d && points.length > 0) {
          d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} `;
          for (let p = 1; p < points.length; p++) {
            const prev = points[p - 1];
            const cur = points[p];
            const midX = (prev.x + cur.x) / 2;
            const midY = (prev.y + cur.y) / 2;
            d += `Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)} `;
          }
        }

        if (d) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', color);
          path.setAttribute('stroke-width', width.toString());
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('d', d);

          this.inkRoot.appendChild(path);

          const strokeObj = {
            id: `stroke_imported_${Date.now()}_${importedCount}`,
            element: path,
            color,
            width,
            d,
            points: points.length > 0 ? points : [],
            lastX: points.length > 0 ? points[points.length - 1].x : 0,
            lastY: points.length > 0 ? points[points.length - 1].y : 0
          };
          this.strokes.push(strokeObj);
          importedCount++;
        }
      }

      this.persistInkToSession();
      if (importedCount > 0) {
        this.playAudioTone(784, 'sine', 0.08);
      }
      return importedCount;
    }

    exportInkToJSON() {
      const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard-session';
      return {
        type: 'AST_INK_SESSION',
        sceneId,
        timestamp: Date.now(),
        strokeCount: this.strokes.length,
        strokes: this.strokes.map(s => ({
          color: s.color || '#facc15',
          width: s.width || 3.5,
          d: s.d || '',
          points: s.points || []
        }))
      };
    }

    importInkFromJSON(data, options = {}) {
      if (!data || !data.strokes || !Array.isArray(data.strokes)) return 0;
      if (!this.inkRoot) this.setupDomLayers();
      if (!this.inkRoot) return 0;

      if (options.clearExisting !== false) {
        this.inkRoot.innerHTML = '';
        this.strokes = [];
      }

      let count = 0;
      data.strokes.forEach(s => {
        let d = s.d || '';
        const pts = s.points || [];
        if (!d && pts.length > 0) {
          d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} `;
          for (let p = 1; p < pts.length; p++) {
            const prev = pts[p - 1];
            const cur = pts[p];
            const midX = (prev.x + cur.x) / 2;
            const midY = (prev.y + cur.y) / 2;
            d += `Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)} `;
          }
        }

        if (d) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', s.color || '#facc15');
          path.setAttribute('stroke-width', (s.width || 3.5).toString());
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('d', d);

          this.inkRoot.appendChild(path);
          this.strokes.push({
            id: `stroke_json_${Date.now()}_${count}`,
            element: path,
            color: s.color || '#facc15',
            width: s.width || 3.5,
            d,
            points: pts,
            lastX: pts.length > 0 ? pts[pts.length - 1].x : 0,
            lastY: pts.length > 0 ? pts[pts.length - 1].y : 0
          });
          count++;
        }
      });

      this.persistInkToSession();
      if (count > 0) {
        this.playAudioTone(784, 'sine', 0.08);
      }
      return count;
    }

    /**
     * Broadcasts active whiteboard ink session to parent window / WebRTC classroom mesh
     */
    broadcastInkSession() {
      const ast = this.exportInkToAST();
      const json = this.exportInkToJSON();
      const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard-session';

      const payload = {
        type: 'AST_WHITEBOARD_INK_BROADCAST',
        sceneId,
        inkAst: ast,
        inkJson: json,
        timestamp: Date.now()
      };

      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(payload, '*');
        }
      } catch {}

      window.dispatchEvent(new CustomEvent('ast-ink-broadcast', { detail: payload }));
      this.showFloatingNotice(`📡 Broadcasted ${this.strokes.length} strokes to Class Mesh!`);
      this.playAudioTone(880, 'sine', 0.1);
    }

    persistInkToSession() {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      try {
        const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard';
        const key = `stj_whiteboard_ink_${sceneId}`;
        if (this.strokes.length === 0) {
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, JSON.stringify(this.exportInkToJSON()));
        }
      } catch {}
    }

    restoreInkFromSession() {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      try {
        const sceneId = (this.engine && this.engine.activePresetId) || 'whiteboard';
        const key = `stj_whiteboard_ink_${sceneId}`;
        const stored = sessionStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.importInkFromJSON(parsed, { clearExisting: true });
        }
      } catch {}
    }

    showFloatingNotice(message) {
      const container = (this.stageSvg && this.stageSvg.parentNode) || document.body;
      let toast = container.querySelector('#stage-ink-notice');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'stage-ink-notice';
        toast.style.cssText = `
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #f8fafc;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          z-index: 50;
          pointer-events: none;
          transition: opacity 0.25s ease, transform 0.25s ease;
        `;
        container.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';

      clearTimeout(this._inkNoticeTimer);
      this._inkNoticeTimer = setTimeout(() => {
        if (toast) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(-50%) translateY(-8px)';
        }
      }, 2500);
    }

    // =========================================================================
    // Stage-Embedded Glass HUD Floating Bar
    // =========================================================================
    setupGlassHud() {
      const container = this.stageSvg.parentNode;
      if (!container || container.querySelector('#stage-glass-hud-ui')) return;

      const hud = document.createElement('div');
      hud.id = 'stage-glass-hud-ui';
      hud.style.cssText = `
        position: absolute;
        bottom: 58px;
        right: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(10px);
        padding: 5px 8px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 30;
        user-select: none;
      `;

      // 1. Pen Tool Button
      const penBtn = this.createHudButton('✏️', 'Smartboard Pen Mode (Draw & Annotate)', () => {
        this.isPenActive = !this.isPenActive;
        penBtn.style.background = this.isPenActive ? '#eab308' : 'rgba(255, 255, 255, 0.08)';
        penBtn.style.color = this.isPenActive ? '#090d16' : '#ffffff';
        this.stageSvg.style.cursor = this.isPenActive ? 'crosshair' : 'default';
        penPalette.style.display = this.isPenActive ? 'flex' : 'none';
        inkExtraActions.style.display = this.isPenActive ? 'flex' : 'none';
        this.playAudioTone(this.isPenActive ? 660 : 440, 'sine', 0.06);
      });

      // Pen Palette Mini Bar
      const penPalette = document.createElement('div');
      penPalette.style.cssText = 'display:none; align-items:center; gap:4px; margin-right:4px;';
      const colors = ['#facc15', '#38bdf8', '#4ade80', '#f43f5e', '#ffffff'];
      colors.forEach(col => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.style.cssText = `width:18px; height:18px; border-radius:50%; background:${col}; border:1px solid rgba(255,255,255,0.4); cursor:pointer; padding:0;`;
        dot.onclick = () => {
          this.currentInkColor = col;
          this.playAudioTone(587, 'sine', 0.03);
        };
        penPalette.appendChild(dot);
      });

      // Extra Ink Actions (Undo, Export AST, Broadcast)
      const inkExtraActions = document.createElement('div');
      inkExtraActions.style.cssText = 'display:none; align-items:center; gap:4px; margin-right:4px;';

      const undoBtn = this.createHudButton('↩️', 'Undo Last Stroke', () => this.undoLastStroke());
      const exportBtn = this.createHudButton('📋', 'Export Ink to AST (Copy S-Expression)', () => {
        const ast = this.exportInkToAST();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(ast);
          this.showFloatingNotice('📋 Copied Ink AST S-Expression to Clipboard!');
          this.playAudioTone(659, 'sine', 0.06);
        }
      });
      const broadcastBtn = this.createHudButton('📡', 'Broadcast Whiteboard Ink to Pupils (WebRTC)', () => {
        this.broadcastInkSession();
      });

      inkExtraActions.appendChild(undoBtn);
      inkExtraActions.appendChild(exportBtn);
      inkExtraActions.appendChild(broadcastBtn);

      // Clear Ink Button
      const clearBtn = this.createHudButton('🗑️', 'Clear Whiteboard Ink', () => this.clearWhiteboardInk());

      // 2. X-Ray Discovery Button
      const xrayBtn = this.createHudButton('🔬', 'Pedagogical X-Ray Inspection', () => {
        this.isXRayActive = !this.isXRayActive;
        xrayBtn.style.background = this.isXRayActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)';
        xrayBtn.style.color = this.isXRayActive ? '#090d16' : '#ffffff';
        this.playAudioTone(this.isXRayActive ? 784 : 392, 'sine', 0.08);
      });

      // 3. Audio Sonification Button
      const soundBtn = this.createHudButton('🔊', 'Multi-sensory Procedural Audio', () => {
        this.sonificationEnabled = !this.sonificationEnabled;
        soundBtn.textContent = this.sonificationEnabled ? '🔊' : '🔇';
        soundBtn.style.opacity = this.sonificationEnabled ? '1.0' : '0.5';
        if (this.sonificationEnabled) this.playAudioTone(523, 'sine', 0.05);
      });

      hud.appendChild(penPalette);
      hud.appendChild(inkExtraActions);
      hud.appendChild(penBtn);
      hud.appendChild(clearBtn);
      hud.appendChild(xrayBtn);
      hud.appendChild(soundBtn);
      container.appendChild(hud);
    }

    createHudButton(icon, title, onClick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = title;
      btn.innerHTML = icon;
      btn.style.cssText = `
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #f8fafc;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.15s ease;
      `;
      btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
      btn.onmouseleave = () => btn.style.transform = 'scale(1.0)';
      btn.onclick = onClick;
      return btn;
    }

    // =========================================================================
    // X-Ray Pedagogical Knowledge Tooltip
    // =========================================================================
    setupXRayTooltip() {
      const container = this.stageSvg.parentNode;
      if (!container || container.querySelector('#stage-xray-tooltip')) return;

      const tip = document.createElement('div');
      tip.id = 'stage-xray-tooltip';
      tip.style.cssText = `
        position: absolute;
        display: none;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid #38bdf8;
        border-radius: 8px;
        padding: 8px 12px;
        color: #f8fafc;
        font-size: 11px;
        font-family: system-ui, sans-serif;
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        pointer-events: none;
        z-index: 35;
        max-width: 220px;
        line-height: 1.4;
      `;
      container.appendChild(tip);
      this.xrayTooltip = tip;
    }

    showXRayPopup(pedId, svgX, svgY) {
      if (!this.xrayTooltip) return;
      const KNOWLEDGE_BASE = {
        'kg-piston': {
          title: 'Movable Cylinder Piston',
          eq: 'V ∝ 1 / P',
          desc: 'Direct mechanical compression. Compressing the gas reduces container volume, doubling particle-wall collision frequency.'
        },
        'kg-gauge': {
          title: 'Bourdon Pressure Gauge',
          eq: 'P = Σ Δp / (A Δt)',
          desc: 'Measures continuous wall impulse momentum in kilopascals (kPa). Standard atmospheric pressure is 101.3 kPa.'
        },
        'kg-thermo': {
          title: 'Mercury Thermometer',
          eq: 'T = K (Kelvin)',
          desc: 'Scales root-mean-square kinetic velocity: v_rms = √(3kT/m). Thermal energy directly powers molecular velocity.'
        },
        'kg-brownian': {
          title: 'Brownian Pollen Particle',
          eq: 'Δx² = 2Dt',
          desc: 'Direct proof of atomic theory. Microscopic pollen jiggles from random unequal collisions from gas molecules.'
        },
        'cc-probe': {
          title: 'Instantaneous Tangent Probe',
          eq: 'dy/dx = lim(Δy / Δx)',
          desc: 'Calculates instantaneous rate of change. The slope of the line equals the exact derivative at that point.'
        },
        'cc-integral': {
          title: 'Definite Riemann Area',
          eq: 'Area = ∫[a,b] f(x) dx',
          desc: 'Continuous accumulation. Calculates the exact signed geometric area trapped between the curve and the horizontal x-axis.'
        },
        'ec-switch': {
          title: 'Knife Circuit Switch',
          eq: 'Closed: I = V / R',
          desc: 'Conductive copper bridge. When opened, air gap resistance is infinite, cutting current flow to 0 Amperes.'
        },
        'pyth-handle-a': {
          title: 'Leg a Dynamic Vertex Handle',
          eq: 'Leg a = Δy / scale',
          desc: 'Direct drag vertex. Vertically resizes side a. The square on leg a instantly updates to area a².'
        },
        'pyth-handle-b': {
          title: 'Leg b Dynamic Vertex Handle',
          eq: 'Leg b = Δx / scale',
          desc: 'Direct drag vertex. Horizontally resizes side b. The square on leg b instantly updates to area b².'
        },
        'pyth-sq-a': {
          title: 'Square on Leg a (a²)',
          eq: 'Area_a = a²',
          desc: 'Unit grid array of a × a squares. Green area represents the contribution of leg a.'
        },
        'pyth-sq-b': {
          title: 'Square on Leg b (b²)',
          eq: 'Area_b = b²',
          desc: 'Unit grid array of b × b squares. Blue area represents the contribution of leg b.'
        },
        'pyth-sq-c': {
          title: 'Hypotenuse Square (c²)',
          eq: 'c² = a² + b²',
          desc: 'Conservation of Area. Gold square exactly matches the sum of areas a² and b² in all Euclidean right triangles.'
        },
        'pyth-triangle': {
          title: 'Euclidean Right Triangle',
          eq: 'a² + b² = c²',
          desc: 'Right triangle connecting sides a, b, and hypotenuse c. Demonstrates invariant area conservation.'
        },
        'pyth-right-angle': {
          title: 'Right Angle Vertex (90°)',
          eq: 'a ⊥ b (90° / π/2 rad)',
          desc: 'The fundamental condition of Pythagoras theorem. Legs a and b must meet at an exact 90-degree angle.'
        },
        'mtn-climber': {
          title: 'High-Altitude Alpine Climber',
          eq: 'Elevation = Slope × sin(θ)',
          desc: 'Direct drag climber. Walking along a slope is the hypotenuse; true vertical altitude is the opposite rise above sea level.'
        },
        'mtn-lapse': {
          title: 'Environmental Lapse Rate',
          eq: 'T = T_0 - (h / 1000) × 6.5°C',
          desc: 'Tropospheric cooling with altitude. Atmospheric pressure drops exponentially with elevation, causing temperature and water boiling point to fall.'
        },
        'church-narthex': {
          title: 'Narthex & Holy Water Stoup (Vestibulum)',
          eq: 'Signum Crucis • In Nomine Patris et Filii et Spiritus Sancti',
          desc: 'Sacred entrance threshold. Blessing ourselves with Holy Water recalls our Baptism and cleanses our thoughts as we enter God\'s holy sanctuary.'
        },
        'church-nave': {
          title: 'The Nave & Central Aisle (Navis Ecclesiae)',
          eq: 'Genuflexio • Adoration of the Eucharistic Presence',
          desc: 'Assembly space symbolizing the Pilgrim Church navigating earthly life like a ship. Faithful genuflect on the right knee toward the Tabernacle.'
        },
        'church-ambo': {
          title: 'Ambo / Lectern (Mensa Verbi Dei)',
          eq: 'Verbum Domini • Proclamatio Evangelii',
          desc: 'The Table of the Word from which the Sacred Scriptures and Holy Gospel are proclaimed and the homily is preached.'
        },
        'church-altar': {
          title: 'High Altar of Sacrifice (Altare Christi)',
          eq: 'Sacrificium Eucharisticum • Corpus et Sanguis Christi',
          desc: 'The sacred focal center representing Christ Himself. Here bread and wine become His Body and Blood during the Holy Sacrifice of the Mass.'
        },
        'church-tabernacle': {
          title: 'The Tabernacle (Tabernaculum Domini)',
          eq: 'Praesentia Realis • Sanctissimum Sacramentum',
          desc: 'The sacred golden dwelling housing the consecrated Blessed Sacrament, venerated with prayers of Eucharistic adoration.'
        },
        'church-lamp': {
          title: 'Sanctuary Lamp (Lux Aeterna)',
          eq: 'Canon Law 940 • Semper Ardens',
          desc: 'A special candle or oil lamp burning day and night beside the Tabernacle to honor and signify the Eucharistic Real Presence of Christ.'
        },
        'church-lady-chapel': {
          title: 'Lady Chapel (Sacellum Beatae Mariae Virginis)',
          eq: 'Ave Maria • Devotio Mariana',
          desc: 'Devotional side chapel in the north transept dedicated to Our Lady, Mother of the Church, for quiet intercessory prayer and contemplation.'
        },
        'church-font': {
          title: 'Baptismal Font (Fons Regenerationis)',
          eq: 'Aqua et Spiritu Sancto • Sacramentum Initiationis',
          desc: 'Octagonal stone basin holding the waters of Holy Baptism, where original sin is washed away and new eternal life in Christ begins.'
        },
        'church-pilgrim': {
          title: 'Pilgrim Avatar (Homo Viator)',
          eq: 'Iter ad Deum • Walk of Faith',
          desc: 'Follows the liturgical journey of the faithful through the sacred architecture of the basilica, from entrance to the Table of the Lord.'
        }
      };

      const info = KNOWLEDGE_BASE[pedId];
      if (!info) return;

      this.xrayTooltip.innerHTML = `
        <div style="color:#38bdf8; font-weight:800; font-size:11px; margin-bottom:2px;">${info.title}</div>
        <div style="color:#fde047; font-family:monospace; font-weight:800; margin-bottom:3px;">${info.eq}</div>
        <div style="color:#cbd5e1; font-size:10px;">${info.desc}</div>
      `;

      // Position relative to stage container
      const rect = this.stageSvg.getBoundingClientRect();
      const clientX = rect.left + (svgX / 800) * rect.width;
      const clientY = rect.top + (svgY / 480) * rect.height;

      this.xrayTooltip.style.left = `${Math.min(window.innerWidth - 240, clientX + 15)}px`;
      this.xrayTooltip.style.top = `${Math.max(10, clientY - 40)}px`;
      this.xrayTooltip.style.display = 'block';
    }

    hideXRayPopup() {
      if (this.xrayTooltip) {
        this.xrayTooltip.style.display = 'none';
      }
    }

    // =========================================================================
    // Touch Feedback Ripple
    // =========================================================================
    createTouchRipple(x, y) {
      if (!this.hudRoot) return;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toFixed(1));
      circle.setAttribute('cy', y.toFixed(1));
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#38bdf8');
      circle.setAttribute('stroke-width', '2');
      circle.style.transition = 'all 0.4s ease-out';
      this.hudRoot.appendChild(circle);

      requestAnimationFrame(() => {
        circle.setAttribute('r', '32');
        circle.setAttribute('opacity', '0');
        setTimeout(() => circle.remove(), 420);
      });
    }

    // =========================================================================
    // Procedural Audio Sonification
    // =========================================================================
    playAudioTone(frequency = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
      if (!this.sonificationEnabled) return;
      try {
        if (!this.audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      } catch {}
    }

    // =========================================================================
    // Direct Manipulation Action 5: Pythagoras Theorem Geometry Synthesis
    // =========================================================================
    renderPythagorasGeometry(a, b) {
      if (!this.stageSvg) return;
      if (this._isRenderingPyth) return;
      this._isRenderingPyth = true;

      try {
        const clampedA = Math.max(1, Math.min(20, Math.round(a || 3)));
        const clampedB = Math.max(1, Math.min(20, Math.round(b || 4)));
        this._pythState = { a: clampedA, b: clampedB };

        // Calculate exact algebraic quantities
        const areaA = clampedA * clampedA;
        const areaB = clampedB * clampedB;
        const areaC = areaA + areaB; // Always exact integer: a² + b²
        const c = Math.sqrt(areaC);
        const isIntC = Math.abs(c - Math.round(c)) < 1e-5;
        const cInt = Math.round(c);

        // Adaptive scaling & centering to guarantee full viewport fit
        // Geometry bounding box: Width = (2a + b)*s, Height = (a + 2b)*s
        const maxAvailW = 560;
        const maxAvailH = 340;
        let s = 28;
        if (clampedA === 3 && clampedB === 4) {
          s = 28;
        } else {
          const reqW = 2 * clampedA + clampedB;
          const reqH = clampedA + 2 * clampedB;
          s = Math.min(28, maxAvailW / reqW, maxAvailH / reqH);
        }

        let originX = 360;
        let originY = 280;
        if (clampedA === 3 && clampedB === 4) {
          originX = 360;
          originY = 280;
        } else {
          // Center the bounding box around stage center (400, 260)
          originX = Math.round(400 - (clampedB / 2) * s);
          originY = Math.round(260 + (clampedA / 2) * s);
        }

        this._pythScale = s;
        this._pythOriginX = originX;
        this._pythOriginY = originY;

        const vertAx = originX;
        const vertAy = originY - clampedA * s;
        const vertBx = originX + clampedB * s;
        const vertBy = originY;

        // 1. Triangle polygon
        const tri = this.stageSvg.querySelector('#pyth-triangle') || this.stageSvg.querySelector('polygon[filter*="pyth-glow"]');
        if (tri) {
          tri.setAttribute('points', `${originX},${originY} ${vertBx},${vertBy} ${vertAx},${vertAy}`);
        }

        // Right-angle symbol alignment
        const rightAngle = this.stageSvg.querySelector('#pyth-right-angle');
        if (rightAngle) {
          const raSize = Math.max(10, Math.min(18, Math.round(s * 0.6)));
          rightAngle.setAttribute('x', String(originX));
          rightAngle.setAttribute('y', String(originY - raSize));
          rightAngle.setAttribute('width', String(raSize));
          rightAngle.setAttribute('height', String(raSize));
          const dot = rightAngle.nextElementSibling;
          if (dot && dot.tagName.toLowerCase() === 'circle') {
            dot.setAttribute('cx', String(originX + raSize / 2));
            dot.setAttribute('cy', String(originY - raSize / 2));
          }
        }

        // Remove any group-level rasterizing filters that blur SVG vector text and children
        const groupA = this.stageSvg.querySelector('#pyth-group-a');
        if (groupA) groupA.removeAttribute('filter');
        const groupB = this.stageSvg.querySelector('#pyth-group-b');
        if (groupB) groupB.removeAttribute('filter');
        const bannerGroup = this.stageSvg.querySelector('#pyth-hud-banner');
        if (bannerGroup) bannerGroup.removeAttribute('filter');

        // 2. Square A (extends left from vertical leg a: area = a²)
        const rectA = this.stageSvg.querySelector('#pyth-rect-a');
        const txtA = this.stageSvg.querySelector('#pyth-txt-a');
        const gridA = this.stageSvg.querySelector('#pyth-grid-a');
        const badgeA = this.stageSvg.querySelector('#pyth-badge-a');
        const sideALen = clampedA * s;

        if (rectA) {
          rectA.setAttribute('x', String(originX - sideALen));
          rectA.setAttribute('y', String(vertAy));
          rectA.setAttribute('width', String(sideALen));
          rectA.setAttribute('height', String(sideALen));
          rectA.setAttribute('opacity', '1');
          if (!rectA.getAttribute('filter')) rectA.setAttribute('filter', 'url(#pyth-shadow)');
        }
        if (txtA) {
          txtA.setAttribute('x', String(originX - sideALen / 2));
          txtA.setAttribute('y', String(originY - sideALen / 2 + 5));
          txtA.textContent = `a² = ${areaA}`;
          txtA.setAttribute('opacity', '1');
          txtA.removeAttribute('filter');
          txtA.setAttribute('text-rendering', 'geometricPrecision');
        }
        if (badgeA) {
          const badgeW = areaA >= 100 ? 76 : 64;
          badgeA.setAttribute('width', String(badgeW));
          badgeA.setAttribute('x', String(originX - sideALen / 2 - badgeW / 2));
          badgeA.setAttribute('y', String(originY - sideALen / 2 - 13));
        }
        if (gridA) {
          let linesA = '';
          if (clampedA <= 15) {
            for (let i = 1; i < clampedA; i++) {
              const lx = originX - sideALen + i * s;
              const ly = vertAy + i * s;
              linesA += `<line x1="${lx.toFixed(1)}" y1="${vertAy.toFixed(1)}" x2="${lx.toFixed(1)}" y2="${originY.toFixed(1)}" />`;
              linesA += `<line x1="${(originX - sideALen).toFixed(1)}" y1="${ly.toFixed(1)}" x2="${originX.toFixed(1)}" y2="${ly.toFixed(1)}" />`;
            }
          }
          gridA.innerHTML = linesA;
        }

        // 3. Square B (extends down from horizontal leg b: area = b²)
        const rectB = this.stageSvg.querySelector('#pyth-rect-b');
        const txtB = this.stageSvg.querySelector('#pyth-txt-b');
        const gridB = this.stageSvg.querySelector('#pyth-grid-b');
        const badgeB = this.stageSvg.querySelector('#pyth-badge-b');
        const sideBLen = clampedB * s;

        if (rectB) {
          rectB.setAttribute('x', String(originX));
          rectB.setAttribute('y', String(originY));
          rectB.setAttribute('width', String(sideBLen));
          rectB.setAttribute('height', String(sideBLen));
          rectB.setAttribute('opacity', '1');
          if (!rectB.getAttribute('filter')) rectB.setAttribute('filter', 'url(#pyth-shadow)');
        }
        if (txtB) {
          txtB.setAttribute('x', String(originX + sideBLen / 2));
          txtB.setAttribute('y', String(originY + sideBLen / 2 + 5));
          txtB.textContent = `b² = ${areaB}`;
          txtB.setAttribute('opacity', '1');
          txtB.removeAttribute('filter');
          txtB.setAttribute('text-rendering', 'geometricPrecision');
        }
        if (badgeB) {
          const badgeW = areaB >= 100 ? 76 : 68;
          badgeB.setAttribute('width', String(badgeW));
          badgeB.setAttribute('x', String(originX + sideBLen / 2 - badgeW / 2));
          badgeB.setAttribute('y', String(originY + sideBLen / 2 - 13));
        }
        if (gridB) {
          let linesB = '';
          if (clampedB <= 15) {
            for (let i = 1; i < clampedB; i++) {
              const lx = originX + i * s;
              const ly = originY + i * s;
              linesB += `<line x1="${lx.toFixed(1)}" y1="${originY.toFixed(1)}" x2="${lx.toFixed(1)}" y2="${(originY + sideBLen).toFixed(1)}" />`;
              linesB += `<line x1="${originX.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${(originX + sideBLen).toFixed(1)}" y2="${ly.toFixed(1)}" />`;
            }
          }
          gridB.innerHTML = linesB;
        }

        // 4. Square C on hypotenuse (Exact area = a² + b² = c²)
        const angleRad = Math.atan2(clampedA, clampedB);
        const angleDeg = (angleRad * 180) / Math.PI;
        const groupC = this.stageSvg.querySelector('#pyth-group-c');
        const rotC = this.stageSvg.querySelector('#pyth-rot-c');
        const rectC = this.stageSvg.querySelector('#pyth-rect-c');
        const txtC = this.stageSvg.querySelector('#pyth-txt-c');
        const badgeC = this.stageSvg.querySelector('#pyth-badge-c');
        const gridC = this.stageSvg.querySelector('#pyth-grid-c');
        const cPx = c * s;

        // Clear static nested transform so only authoritative outer transform applies
        if (rotC) {
          rotC.removeAttribute('transform');
        }
        if (groupC) {
          groupC.removeAttribute('filter');
          groupC.setAttribute('transform', `translate(${vertAx.toFixed(1)}, ${vertAy.toFixed(1)}) rotate(${angleDeg.toFixed(2)})`);
        }
        if (rectC) {
          rectC.setAttribute('x', '0');
          rectC.setAttribute('y', String((-cPx).toFixed(1)));
          rectC.setAttribute('width', String(cPx.toFixed(1)));
          rectC.setAttribute('height', String(cPx.toFixed(1)));
          rectC.setAttribute('opacity', '1');
          if (!rectC.getAttribute('filter')) rectC.setAttribute('filter', 'url(#pyth-shadow)');
        }
        if (txtC) {
          txtC.setAttribute('x', String((cPx / 2).toFixed(1)));
          txtC.setAttribute('y', String((-cPx / 2 + 5).toFixed(1)));
          txtC.textContent = isIntC
            ? `c² = ${areaC} (c = ${cInt})`
            : `c² = ${areaC} (c = √${areaC} ≈ ${c.toFixed(2)})`;
          txtC.setAttribute('opacity', '1');
          txtC.removeAttribute('filter');
          txtC.setAttribute('text-rendering', 'geometricPrecision');
        }
        if (badgeC) {
          const badgeW = isIntC ? 120 : 156;
          badgeC.setAttribute('width', String(badgeW));
          badgeC.setAttribute('x', String((cPx / 2 - badgeW / 2).toFixed(1)));
          badgeC.setAttribute('y', String((-cPx / 2 - 14).toFixed(1)));
        }
        if (gridC) {
          let linesC = '';
          // Only render discrete unit tiles when c is an integer triple (e.g. 5, 10, 13, 15, 17)
          // To avoid confusing students with rounded tiles on irrational lengths (e.g. √18)
          if (isIntC && cInt <= 17) {
            const stepSize = s; // Exact same unit scale s as legs a & b!
            for (let i = 1; i < cInt; i++) {
              const pos = i * stepSize;
              linesC += `<line x1="${pos.toFixed(1)}" y1="${(-cPx).toFixed(1)}" x2="${pos.toFixed(1)}" y2="0" />`;
              linesC += `<line x1="0" y1="${(-cPx + pos).toFixed(1)}" x2="${cPx.toFixed(1)}" y2="${(-cPx + pos).toFixed(1)}" />`;
            }
          }
          gridC.innerHTML = linesC;
        }

        // 5. Manipulator Handles A & B
        const handleA = this.stageSvg.querySelector('#pyth-handle-a');
        const handleB = this.stageSvg.querySelector('#pyth-handle-b');
        if (handleA) {
          handleA.setAttribute('transform', `translate(${vertAx.toFixed(1)}, ${vertAy.toFixed(1)})`);
        }
        if (handleB) {
          handleB.setAttribute('transform', `translate(${vertBx.toFixed(1)}, ${vertBy.toFixed(1)})`);
        }

        // 6. Side labels and dimension badge callouts
        const lblA = this.stageSvg.querySelector('#pyth-label-a');
        const lblB = this.stageSvg.querySelector('#pyth-label-b');
        const lblC = this.stageSvg.querySelector('#pyth-label-c');
        const midAy = originY - sideALen / 2;
        const midBx = originX + sideBLen / 2;

        // Hypotenuse midpoint placed neatly inside the right triangle so it never overlaps square C
        const midHypX = (vertAx + vertBx) / 2;
        const midHypY = (vertAy + vertBy) / 2;
        const midCx = midHypX + 0.22 * (originX - midHypX);
        const midCy = midHypY + 0.22 * (originY - midHypY);

        if (lblA) {
          lblA.textContent = `a = ${clampedA}`;
          lblA.setAttribute('x', String(originX + 16));
          lblA.setAttribute('y', String(midAy + 5));
          lblA.removeAttribute('filter');
          lblA.setAttribute('text-rendering', 'geometricPrecision');
          const rectBgA = lblA.previousElementSibling;
          if (rectBgA && rectBgA.tagName.toLowerCase() === 'rect') {
            rectBgA.setAttribute('x', String(originX + 4));
            rectBgA.setAttribute('y', String(midAy - 11));
          }
        }
        if (lblB) {
          lblB.textContent = `b = ${clampedB}`;
          lblB.setAttribute('x', String(midBx));
          lblB.setAttribute('y', String(originY - 12));
          lblB.removeAttribute('filter');
          lblB.setAttribute('text-rendering', 'geometricPrecision');
          const rectBgB = lblB.previousElementSibling;
          if (rectBgB && rectBgB.tagName.toLowerCase() === 'rect') {
            rectBgB.setAttribute('x', String(midBx - 23));
            rectBgB.setAttribute('y', String(originY - 26));
          }
        }
        if (lblC) {
          lblC.textContent = isIntC ? `c = ${cInt}` : `c = √${areaC} ≈ ${c.toFixed(2)}`;
          lblC.setAttribute('x', String(midCx.toFixed(1)));
          lblC.setAttribute('y', String((midCy + 5).toFixed(1)));
          lblC.removeAttribute('filter');
          lblC.setAttribute('text-rendering', 'geometricPrecision');
          const rectBgC = lblC.previousElementSibling;
          if (rectBgC && rectBgC.tagName.toLowerCase() === 'rect') {
            const badgeW = isIntC ? 56 : 94;
            rectBgC.setAttribute('width', String(badgeW));
            rectBgC.setAttribute('x', String((midCx - badgeW / 2).toFixed(1)));
            rectBgC.setAttribute('y', String((midCy - 11).toFixed(1)));
          }
        }

        const sideTexts = this.stageSvg.querySelectorAll('text');
        sideTexts.forEach(tNode => {
          tNode.removeAttribute('filter');
          tNode.setAttribute('text-rendering', 'geometricPrecision');
          const text = (tNode.textContent || '').trim();
          if (text.startsWith('a =') && tNode.id !== 'pyth-label-a') {
            tNode.textContent = `a = ${clampedA}`;
            tNode.setAttribute('y', String(midAy + 5));
          } else if (text.startsWith('b =') && tNode.id !== 'pyth-label-b') {
            tNode.textContent = `b = ${clampedB}`;
            tNode.setAttribute('x', String(midBx));
          } else if (text.startsWith('c =') && tNode.id !== 'pyth-label-c') {
            tNode.textContent = isIntC ? `c = ${cInt}` : `c = √${areaC} ≈ ${c.toFixed(2)}`;
            tNode.setAttribute('x', String(midCx.toFixed(1)));
            tNode.setAttribute('y', String((midCy + 5).toFixed(1)));
          }
        });

        // 7. Banner formula text with exact algebraic consistency
        const banner = this.stageSvg.querySelector('tspan');
        if (banner && banner.parentNode) {
          if (isIntC) {
            banner.parentNode.innerHTML = `<tspan fill="#34d399">a² (${areaA})</tspan> + <tspan fill="#60a5fa">b² (${areaB})</tspan> = <tspan fill="#fbbf24">c² (${areaC})</tspan> ➔ ${clampedA}² + ${clampedB}² = ${cInt}² (c = ${cInt})`;
          } else {
            banner.parentNode.innerHTML = `<tspan fill="#34d399">a² (${areaA})</tspan> + <tspan fill="#60a5fa">b² (${areaB})</tspan> = <tspan fill="#fbbf24">c² (${areaC})</tspan> ➔ ${clampedA}² + ${clampedB}² = (√${areaC})² ➔ c = √${areaC} ≈ ${c.toFixed(2)}`;
          }
        }

        // 8. Sync state & engine variables without re-triggering recursive render loops
        if (this.engine) {
          if (!this.engine.vars) this.engine.vars = {};
          this.engine.vars.sideA = clampedA;
          this.engine.vars.sideB = clampedB;
          this.engine.vars.hypotenuse = isIntC ? cInt : Number(c.toFixed(2));
          this.engine.vars.areaA = areaA;
          this.engine.vars.areaB = areaB;
          this.engine.vars.areaC = areaC;
        }

        // 9. Two-way sync to parameters HUD inputs
        const numA = document.querySelector('.sim-param-num-input[data-var="sideA"]');
        const numB = document.querySelector('.sim-param-num-input[data-var="sideB"]');
        const sliderA = document.querySelector('.sim-param-slider[data-var="sideA"]');
        const sliderB = document.querySelector('.sim-param-slider[data-var="sideB"]');
        if (numA && Number(numA.value) !== clampedA) numA.value = clampedA;
        if (numB && Number(numB.value) !== clampedB) numB.value = clampedB;
        if (sliderA && Number(sliderA.value) !== clampedA) sliderA.value = clampedA;
        if (sliderB && Number(sliderB.value) !== clampedB) sliderB.value = clampedB;
      } finally {
        this._isRenderingPyth = false;
      }
    }

    // =========================================================================
    // Fish Tank Aquarium Boids Simulation (Living Reef & Hydrodynamics)
    // =========================================================================
    setupFishTankBoids() {
      const fishGroup = this.stageSvg && this.stageSvg.querySelector('#fish-school-group');
      if (!fishGroup) return;

      // Species metadata for pedagogical tooltips & CPA discovery
      const speciesList = [
        { id: 'fish-1', name: 'Clownfish', species: 'Amphiprion ocellaris', desc: 'Symbiotic anemone dweller' },
        { id: 'fish-2', name: 'Royal Blue Tang', species: 'Paracanthurus hepatus', desc: 'Herbivorous surgeonfish' },
        { id: 'fish-3', name: 'Yellow Tang', species: 'Zebrasoma flavescens', desc: 'Algae grazer with bright yellow disc' },
        { id: 'fish-4', name: 'Neon Tetra', species: 'Paracheirodon innesi', desc: 'Schooling bioluminescent swimmer' },
        { id: 'fish-5', name: 'Regal Angelfish', species: 'Pygoplites diacanthus', desc: 'Tall triangular coral browser' },
        { id: 'fish-6', name: 'Purple Fairy Basslet', species: 'Gramma loreto', desc: 'Two-tone deep reef cave explorer' },
        { id: 'fish-7', name: 'Baby Clownfish', species: 'Amphiprion ocellaris', desc: 'Juvenile schooling in tandem' },
        { id: 'fish-8', name: 'Azure Damselfish', species: 'Chrysiptera hemicyanea', desc: 'Electric sapphire reef defender' },
        { id: 'fish-9', name: 'Golden Guppy', species: 'Poecilia reticulata', desc: 'Flowing caudal fin surface cruiser' },
        { id: 'fish-10', name: 'Neon Tetra Beta', species: 'Paracheirodon innesi', desc: 'Synchronized schooling companion' },
        { id: 'fish-11', name: 'Turquoise Discus', species: 'Symphysodon aequifasciatus', desc: 'Majestic circular cichlid' },
        { id: 'fish-12', name: 'Sunset Platy', species: 'Xiphophorus maculatus', desc: 'Vibrant coral orange omnivore' },
      ];

      // Food Flakes Layer in Stage
      let foodGroup = this.stageSvg.querySelector('#aquarium-food-group');
      if (!foodGroup) {
        foodGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        foodGroup.id = 'aquarium-food-group';
        fishGroup.parentNode.insertBefore(foodGroup, fishGroup.nextSibling);
      }

      const activeFoodFlakes = [];

      // Drop food flakes function (clickable / interactive)
      const dropFood = (x, y) => {
        const flakeCount = 3;
        for (let k = 0; k < flakeCount; k++) {
          const flakeEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          const fx = x + (Math.random() * 24 - 12);
          const fy = y + (Math.random() * 16 - 8);
          flakeEl.setAttribute('cx', fx.toFixed(1));
          flakeEl.setAttribute('cy', fy.toFixed(1));
          flakeEl.setAttribute('r', '3');
          flakeEl.setAttribute('fill', '#f59e0b');
          flakeEl.setAttribute('stroke', '#b45309');
          flakeEl.setAttribute('stroke-width', '0.75');
          flakeEl.style.opacity = '0.9';
          foodGroup.appendChild(flakeEl);

          activeFoodFlakes.push({
            el: flakeEl,
            x: fx,
            y: fy,
            vy: 0.6 + Math.random() * 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            life: 280
          });
        }
        this.playAudioTone(720, 'sine', 0.04, 0.12);
      };

      // Listen for click on aquarium stage to feed fish
      if (!this._fishTankClickBound) {
        this._fishTankClickBound = true;
        this.stageSvg.addEventListener('pointerdown', (e) => {
          if (e.target && e.target.closest('#benchmark-hud')) return;
          const rect = this.stageSvg.getBoundingClientRect();
          const svgX = ((e.clientX - rect.left) / rect.width) * 800;
          const svgY = ((e.clientY - rect.top) / rect.height) * 480;
          if (svgY >= 60 && svgY <= 440 && svgX >= 40 && svgX <= 760) {
            dropFood(svgX, svgY);
          }
        });
        this.stageSvg.addEventListener('feed_fish', (e) => {
          const detail = e.detail || {};
          dropFood(detail.x || (300 + Math.random() * 200), detail.y || (100 + Math.random() * 80));
        });
        this.stageSvg.addEventListener('tap_glass', () => {
          cursorX = 400;
          cursorY = 240;
          setTimeout(() => { cursorX = -999; cursorY = -999; }, 400);
        });
      }

      // Collect existing 12 base fish elements or initialize them
      const boids = [];
      const extraColors = ['#f59e0b', '#38bdf8', '#34d399', '#ec4899', '#a855f7', '#fb7185', '#06b6d4', '#eab308'];

      // Gather initial 12 fish
      for (let i = 0; i < 12; i++) {
        const id = `fish-${i + 1}`;
        let el = fishGroup.querySelector(`#${id}`);
        if (!el) {
          const color = extraColors[i % extraColors.length];
          el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          el.id = id;
          el.style.cursor = 'pointer';
          const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          ellipse.setAttribute('cx', '0');
          ellipse.setAttribute('cy', '0');
          ellipse.setAttribute('rx', '24');
          ellipse.setAttribute('ry', '14');
          ellipse.setAttribute('fill', color);
          ellipse.setAttribute('stroke', '#ffffff');
          ellipse.setAttribute('stroke-width', '1.5');
          const tail = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          tail.setAttribute('points', '-22,0 -36,-12 -36,12');
          tail.setAttribute('fill', color);
          const eye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          eye.setAttribute('cx', '14');
          eye.setAttribute('cy', '-4');
          eye.setAttribute('r', '3.5');
          eye.setAttribute('fill', '#ffffff');
          const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          pupil.setAttribute('cx', '15.5');
          pupil.setAttribute('cy', '-4');
          pupil.setAttribute('r', '1.8');
          pupil.setAttribute('fill', '#000000');
          el.appendChild(tail);
          el.appendChild(ellipse);
          el.appendChild(eye);
          el.appendChild(pupil);
          fishGroup.appendChild(el);
        }

        el.style.cursor = 'pointer';
        el.setAttribute('data-pedagogical', 'aquarium-fish');
        const meta = speciesList[i] || { name: `Fish ${i + 1}`, species: 'Aquatic Boid', desc: 'Marine organism' };
        el.setAttribute('title', `🐠 ${meta.name} (${meta.species})\n${meta.desc}`);

        // Initial default positions across tank
        const initX = 140 + (i % 4) * 160 + (Math.random() * 40 - 20);
        const initY = 140 + Math.floor(i / 4) * 85 + (Math.random() * 30 - 15);
        const speed = 1.2 + Math.random() * 1.0;
        const dir = i % 2 === 0 ? 1 : -1;

        boids.push({
          id,
          el,
          x: initX,
          y: initY,
          vx: dir * speed,
          vy: (Math.random() - 0.5) * 0.8,
          targetVx: dir * speed,
          targetVy: 0,
          facing: dir,
          scale: i === 6 ? 0.8 : (i === 4 || i === 10 ? 1.15 : 1.0),
          wagPhase: Math.random() * Math.PI * 2,
          isExtra: false
        });
      }

      // Dynamically create extra boids if schoolSize > 12
      const targetSize = Math.max(1, Math.min(30, (this.engine && this.engine.vars && this.engine.vars.schoolSize) || 12));
      for (let j = 12; j < targetSize; j++) {
        const id = `fish-${j + 1}`;
        let el = fishGroup.querySelector(`#${id}`);
        if (!el) {
          const color = extraColors[(j - 12) % extraColors.length];
          el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          el.id = id;
          el.style.cursor = 'pointer';

          const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          ellipse.setAttribute('cx', '0');
          ellipse.setAttribute('cy', '0');
          ellipse.setAttribute('rx', '18');
          ellipse.setAttribute('ry', '9');
          ellipse.setAttribute('fill', color);
          ellipse.setAttribute('stroke', '#ffffff');
          ellipse.setAttribute('stroke-width', '1');

          const tail = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          tail.setAttribute('points', '-18,0 -28,-8 -28,8');
          tail.setAttribute('fill', color);

          const eyeWhite = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          eyeWhite.setAttribute('cx', '11');
          eyeWhite.setAttribute('cy', '-3');
          eyeWhite.setAttribute('r', '2.8');
          eyeWhite.setAttribute('fill', '#ffffff');

          const eyePupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          eyePupil.setAttribute('cx', '12');
          eyePupil.setAttribute('cy', '-3');
          eyePupil.setAttribute('r', '1.4');
          eyePupil.setAttribute('fill', '#000000');

          el.appendChild(tail);
          el.appendChild(ellipse);
          el.appendChild(eyeWhite);
          el.appendChild(eyePupil);
          fishGroup.appendChild(el);
        }

        const initX = 100 + Math.random() * 600;
        const initY = 120 + Math.random() * 260;
        const dir = Math.random() > 0.5 ? 1 : -1;

        boids.push({
          id,
          el,
          x: initX,
          y: initY,
          vx: dir * (1.2 + Math.random() * 0.8),
          vy: (Math.random() - 0.5) * 0.8,
          targetVx: dir * 1.5,
          targetVy: 0,
          facing: dir,
          scale: 0.9,
          wagPhase: Math.random() * Math.PI * 2,
          isExtra: true
        });
      }

      // Track cursor position for acoustic avoidance in stage
      let cursorX = -999;
      let cursorY = -999;
      const onStagePointerMove = (e) => {
        const rect = this.stageSvg.getBoundingClientRect();
        cursorX = ((e.clientX - rect.left) / rect.width) * 800;
        cursorY = ((e.clientY - rect.top) / rect.height) * 480;
      };
      const onStagePointerLeave = () => {
        cursorX = -999;
        cursorY = -999;
      };

      if (!this._fishTankPointerBound) {
        this._fishTankPointerBound = true;
        this.stageSvg.addEventListener('pointermove', onStagePointerMove);
        this.stageSvg.addEventListener('pointerleave', onStagePointerLeave);
      }

      // Cancel previous boid RAF if active
      if (this._boidAnimId) cancelAnimationFrame(this._boidAnimId);

      let lastTickTime = performance.now();
      let frameCount = 0;
      let lastFpsTime = performance.now();
      let currentFps = 60.0;

      const tickBoids = (now) => {
        if (!this.stageSvg || !this.stageSvg.isConnected) return;

        let curFishGroup = this.stageSvg.querySelector('#fish-school-group');
        if (!curFishGroup) {
          this._boidAnimId = requestAnimationFrame(tickBoids);
          return;
        }

        // Reconnect boid element references if SVG was hot-reloaded or replaced
        if (boids.length > 0 && (!boids[0].el || !curFishGroup.contains(boids[0].el))) {
          for (let bIdx = 0; bIdx < boids.length; bIdx++) {
            const reEl = curFishGroup.querySelector('#' + boids[bIdx].id);
            if (reEl) boids[bIdx].el = reEl;
          }
        }

        const dt = Math.min((now - lastTickTime) / 1000, 0.05);
        lastTickTime = now;

        // FPS calculation for HUD
        frameCount++;
        if (now - lastFpsTime >= 500) {
          currentFps = (frameCount * 1000) / (now - lastFpsTime);
          frameCount = 0;
          lastFpsTime = now;

          const hudFps = this.stageSvg.querySelector('#hud-fps-val');
          const hudBadge = this.stageSvg.querySelector('#hud-status-badge');
          if (hudFps) hudFps.textContent = `${currentFps.toFixed(1)} FPS`;
          if (hudBadge) hudBadge.textContent = `${Math.round(currentFps)} FPS`;
        }

        const currentVars = (this.engine && this.engine.vars) || {};
        const flowVelocity = Number(currentVars.kelpTurbulence || 1.0);
        const activeSchoolCount = Math.max(1, Math.min(boids.length, Number(currentVars.schoolSize || 12)));

        // Update food flakes physics
        for (let f = activeFoodFlakes.length - 1; f >= 0; f--) {
          const flake = activeFoodFlakes[f];
          flake.y += flake.vy;
          flake.x += flake.vx + Math.sin(now * 0.003) * 0.2;
          flake.life--;
          flake.el.setAttribute('cy', flake.y.toFixed(1));
          flake.el.setAttribute('cx', flake.x.toFixed(1));

          // Despawn on seafloor
          if (flake.y >= 445 || flake.life <= 0) {
            flake.el.remove();
            activeFoodFlakes.splice(f, 1);
          }
        }

        // Boid steering & simulation loop
        for (let i = 0; i < boids.length; i++) {
          const b = boids[i];

          // Visibility gating according to schoolSize slider
          if (i >= activeSchoolCount) {
            b.el.style.display = 'none';
            continue;
          } else {
            b.el.style.display = '';
          }

          // 1. Food tracking attraction (if flakes exist)
          if (activeFoodFlakes.length > 0) {
            let closestFlake = null;
            let closestDist = 260;
            for (let f = 0; f < activeFoodFlakes.length; f++) {
              const flake = activeFoodFlakes[f];
              const d = Math.hypot(flake.x - b.x, flake.y - b.y);
              if (d < closestDist) {
                closestDist = d;
                closestFlake = flake;
              }
            }

            if (closestFlake) {
              const angleToFood = Math.atan2(closestFlake.y - b.y, closestFlake.x - b.x);
              b.vx += Math.cos(angleToFood) * 0.12 * flowVelocity;
              b.vy += Math.sin(angleToFood) * 0.12 * flowVelocity;

              // Eat flake if reached
              if (closestDist < 16) {
                closestFlake.el.remove();
                const idx = activeFoodFlakes.indexOf(closestFlake);
                if (idx !== -1) activeFoodFlakes.splice(idx, 1);
                this.playAudioTone(920, 'sine', 0.02, 0.08);
              }
            }
          }

          // 2. Cursor Acoustic Wave Avoidance
          if (cursorX > 0 && cursorY > 0) {
            const distToCursor = Math.hypot(cursorX - b.x, cursorY - b.y);
            if (distToCursor < 140) {
              const avoidAngle = Math.atan2(b.y - cursorY, b.x - cursorX);
              const force = ((140 - distToCursor) / 140) * 0.45;
              b.vx += Math.cos(avoidAngle) * force;
              b.vy += Math.sin(avoidAngle) * force;
            }
          }

          // 3. Fluid drag and speed capping
          b.vx *= 0.985;
          b.vy *= 0.985;
          const maxSpeed = 2.4 * flowVelocity;
          const curSpeed = Math.hypot(b.vx, b.vy);
          if (curSpeed > maxSpeed) {
            b.vx = (b.vx / curSpeed) * maxSpeed;
            b.vy = (b.vy / curSpeed) * maxSpeed;
          } else if (curSpeed < 0.6 * flowVelocity) {
            b.vx += (b.facing > 0 ? 0.04 : -0.04) * flowVelocity;
          }

          // Update position
          b.x += b.vx;
          b.y += b.vy;

          // 4. Aquarium Glass Boundary Soft Steer & Reflection
          if (b.x < 110) { b.vx += 0.22; b.facing = 1; }
          else if (b.x > 690) { b.vx -= 0.22; b.facing = -1; }
          if (b.y < 110) { b.vy += 0.18; }
          else if (b.y > 410) { b.vy -= 0.18; }

          // Clamp hard boundaries
          b.x = Math.max(70, Math.min(730, b.x));
          b.y = Math.max(90, Math.min(425, b.y));

          // Facing direction
          if (b.vx > 0.2) b.facing = 1;
          else if (b.vx < -0.2) b.facing = -1;

          // Gentle vertical sinusoidal undulation & tail wag
          b.wagPhase += dt * 6 * flowVelocity;
          const pitchAngle = Math.max(-25, Math.min(25, (b.vy / 2.5) * 20));

          // Apply clean SVG transform matrix
          const scaleX = b.facing * b.scale;
          const scaleY = b.scale;
          b.el.setAttribute(
            'transform',
            `translate(${b.x.toFixed(1)}, ${b.y.toFixed(1)}) scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)}) rotate(${pitchAngle.toFixed(1)})`
          );
        }

        // Live HUD counts sync
        const hudFishCount = this.stageSvg.querySelector('#hud-fish-count');
        const hudPtsCount = this.stageSvg.querySelector('#hud-points-count');
        const hudBudgetFill = this.stageSvg.querySelector('#hud-budget-fill');
        if (hudFishCount) hudFishCount.textContent = `${activeSchoolCount} Fish`;
        if (hudPtsCount) hudPtsCount.textContent = `${activeSchoolCount * 24 + 120} pts`;
        if (hudBudgetFill) hudBudgetFill.setAttribute('width', String(Math.min(280, Math.max(20, (activeSchoolCount / 30) * 280))));

        this._boidAnimId = requestAnimationFrame(tickBoids);
      };

      this._boidAnimId = requestAnimationFrame(tickBoids);
    }

    // =========================================================================
    // Math Fishing Pond Fish School Setup & Dynamic Ten-Frame Apparatus
    // =========================================================================
    setupMathFishingFish() {
      const fishGroup = this.stageSvg && this.stageSvg.querySelector("#fish-school-group");
      if (!fishGroup) return;
      fishGroup.innerHTML = "";

      if (!this.engine._cachedElements) {
        this.engine._cachedElements = {};
      }
      this.engine._cachedElements.fishEls = [];
      this.engine._cachedElements.caughtList = [];

      const targetSum = this.getMathPondTargetSum();

      // Update HUD Title and Equation
      const titleEl = this.stageSvg.querySelector("#math-hud-title");
      const eqText = this.stageSvg.querySelector("#math-hud-equation");
      const lang = (window.AST_ENGINE_ACTIVE_LANG || window.STJ_CURRENT_LANG || 'en').toLowerCase();

      if (titleEl) {
        if (lang.startsWith('es')) titleEl.textContent = `VÍNCULOS NUMÉRICOS: META ${targetSum}`;
        else if (lang.startsWith('fr')) titleEl.textContent = `LIAISONS NUMÉRIQUES : OBJECTIF ${targetSum}`;
        else if (lang.startsWith('la')) titleEl.textContent = `VINCULA NUMERORUM: META ${targetSum}`;
        else titleEl.textContent = `NUMBER BONDS TARGET: ${targetSum}`;
      }

      if (eqText) {
        if (lang.startsWith('es')) eqText.textContent = `Pesca peces para sumar ${targetSum}. (Arrastra o toca un pez)`;
        else if (lang.startsWith('fr')) eqText.textContent = `Pêchez des poissons pour faire ${targetSum}. (Glissez ou touchez)`;
        else if (lang.startsWith('la')) eqText.textContent = `Cape pisces ad summam ${targetSum} conficiendam.`;
        else eqText.textContent = `Catch fish to make ${targetSum}! (Drag hook or tap fish)`;
      }

      // Update Preset Button active highlights
      const presetBtns = this.stageSvg.querySelectorAll('.pond-preset-btn');
      presetBtns.forEach(btn => {
        const action = btn.getAttribute('data-action');
        const rect = btn.querySelector('rect');
        const txt = btn.querySelector('text');
        if (rect && txt) {
          const isTarget10 = action === 'pond-target-10' && targetSum === 10;
          const isTarget20 = action === 'pond-target-20' && targetSum === 20;
          const isTarget5 = action === 'pond-target-5' && targetSum === 5;
          const isActive = isTarget10 || isTarget20 || isTarget5;
          rect.setAttribute('fill', isActive ? '#0284c7' : '#1e293b');
          rect.setAttribute('stroke', isActive ? '#38bdf8' : '#475569');
          txt.setAttribute('fill', isActive ? '#ffffff' : '#94a3b8');
        }
      });

      // Initialize Visual Ten-Frame HUD
      this.updateTenFrameHud(0, targetSum, []);
      this.updateScorePlaque();

      // Spawn Rising Water Bubbles
      const bubblesGroup = this.stageSvg.querySelector('#pond-bubbles-group');
      if (bubblesGroup) {
        bubblesGroup.innerHTML = '';
        for (let b = 0; b < 7; b++) {
          const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          const bx = 90 + b * 100 + Math.random() * 40;
          const by = 260 + Math.random() * 180;
          const br = 2.5 + Math.random() * 3.5;
          bubble.setAttribute('cx', bx.toFixed(1));
          bubble.setAttribute('cy', by.toFixed(1));
          bubble.setAttribute('r', br.toFixed(1));
          bubble.setAttribute('fill', '#ffffff');
          bubble.setAttribute('opacity', '0.25');
          bubblesGroup.appendChild(bubble);
        }
      }

      // Generate fish numbers tailored to targetSum
      let values = [];
      if (targetSum === 5) {
        values = [1, 4, 2, 3, 3, 2, 4, 1, 5, 2];
      } else if (targetSum === 20) {
        values = [12, 8, 15, 5, 14, 6, 11, 9, 7, 13, 16, 4, 10, 10];
      } else {
        // Target 10
        values = [4, 6, 3, 7, 2, 8, 5, 5, 1, 9, 6, 4];
      }

      const fishColors = ["#f97316", "#38bdf8", "#ec4899", "#10b981", "#a855f7", "#eab308", "#06b6d4", "#f43f5e", "#84cc16"];

      values.forEach((val, idx) => {
        const color = fishColors[idx % fishColors.length];
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.cursor = "pointer";
        g.style.willChange = "transform";
        g.setAttribute('data-action', 'cast-to-fish');
        g.setAttribute('data-fish-idx', String(idx));

        const dots = this.getSubitisingDotPoints(val);
        const dotsSvg = dots.length > 0
          ? `<g transform="translate(-1, 0)" opacity="0.85">${dots.map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="1.5" fill="#ffffff" />`).join('')}</g>`
          : '';

        g.innerHTML = `
          <polygon class="fish-tail" points="-22,0 -34,-10 -34,10" fill="${color}" />
          <ellipse cx="0" cy="0" rx="22" ry="13" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="12" cy="-4" r="3" fill="#ffffff" />
          <circle cx="13" cy="-4" r="1.5" fill="#000000" />
          ${dotsSvg}
          <circle cx="0" cy="0" r="10" fill="#0f172a" opacity="0.8" />
          <text x="0" y="4" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">${val}</text>
        `;
        fishGroup.appendChild(g);

        const startX = 110 + (idx % 4) * 160 + (Math.random() * 40 - 20);
        const startY = 220 + Math.floor(idx / 4) * 65 + (Math.random() * 20 - 10);
        const dir = Math.random() > 0.5 ? 1 : -1;
        const fishObj = {
          el: g,
          tailEl: g.querySelector(".fish-tail"),
          val,
          x: startX,
          y: startY,
          curX: startX,
          curY: startY,
          vx: (26 + Math.random() * 30) * dir,
          vy: (Math.random() - 0.5) * 8,
          caught: false,
          isHooked: false,
          swimPhase: Math.random() * Math.PI * 2,
          tailPhase: Math.random() * Math.PI * 2
        };
        this.engine._cachedElements.fishEls.push(fishObj);
      });

      if (this._fishSwimId) cancelAnimationFrame(this._fishSwimId);

      let lastStamp = performance.now();
      const pondMinX = 50;
      const pondMaxX = 750;
      const pondMinY = 190;
      const pondMaxY = 430;

      const swimTick = (now) => {
        if (!this.stageSvg || !this.stageSvg.contains(fishGroup)) return;
        const dt = Math.min((now - lastStamp) / 1000, 0.05) || 0.016;
        lastStamp = now;

        const fishList = this.engine && this.engine._cachedElements && this.engine._cachedElements.fishEls;
        if (fishList) {
          for (let i = 0; i < fishList.length; i++) {
            const fish = fishList[i];
            if (fish.caught || fish.isHooked) continue;

            fish.swimPhase += dt * 3.5;
            fish.tailPhase += dt * 8.0;

            // Continuous organic kinematics
            fish.curX += fish.vx * dt;
            fish.curY += (fish.vy + Math.sin(fish.swimPhase) * 6) * dt;

            // Soft boundary turnaround
            if (fish.curX < pondMinX && fish.vx < 0) {
              fish.curX = pondMinX;
              fish.vx = Math.abs(fish.vx);
            } else if (fish.curX > pondMaxX && fish.vx > 0) {
              fish.curX = pondMaxX;
              fish.vx = -Math.abs(fish.vx);
            }

            if (fish.curY < pondMinY && fish.vy < 0) {
              fish.vy = Math.abs(fish.vy);
            } else if (fish.curY > pondMaxY && fish.vy > 0) {
              fish.vy = -Math.abs(fish.vy);
            }

            const faceDir = fish.vx >= 0 ? 1 : -1;
            const tilt = (fish.vy / 25).toFixed(2);
            fish.el.setAttribute("transform", "translate(" + fish.curX.toFixed(2) + ", " + fish.curY.toFixed(2) + ") scale(" + faceDir + ", 1) rotate(" + tilt + ")");

            if (fish.tailEl) {
              const tailWiggle = Math.sin(fish.tailPhase) * 6;
              fish.tailEl.setAttribute("points", "-22,0 -34," + (-10 + tailWiggle).toFixed(1) + " -34," + (10 - tailWiggle).toFixed(1));
            }
          }
        }
        this._fishSwimId = requestAnimationFrame(swimTick);
      };
      this._fishSwimId = requestAnimationFrame(swimTick);
    }

    // =========================================================================
    // Continuous Electron Flow Drift for Electrical Circuits
    // =========================================================================
    startCircuitElectronsLoop() {
      if (this._circuitAnimId) cancelAnimationFrame(this._circuitAnimId);
      const dots = this.stageSvg && this.stageSvg.querySelectorAll('.e-dot');
      if (!dots || !dots.length) return;

      const L1 = 500;
      const L2 = 260;
      const L3 = 500;
      const L4 = 260;
      const perimeter = L1 + L2 + L3 + L4;

      const getPointOnPerimeter = (d) => {
        d = ((d % perimeter) + perimeter) % perimeter;
        if (d < L1) return { x: 150 + d, y: 105 };
        d -= L1;
        if (d < L2) return { x: 650, y: 105 + d };
        d -= L2;
        if (d < L3) return { x: 650 - d, y: 365 };
        d -= L3;
        return { x: 150, y: 365 - d };
      };

      let driftOffset = 0;
      const tick = () => {
        if (!this.stageSvg || !this.stageSvg.querySelector('#circuit-switch')) return;
        const v = (this.engine && this.engine.vars) || {};
        const isClosed = v.switchClosed !== false;
        const voltage = v.voltage !== undefined ? v.voltage : 12;
        const resistance = v.resistance !== undefined ? v.resistance : 4;
        const current = isClosed ? voltage / Math.max(0.5, resistance) : 0;

        if (isClosed && current > 0) {
          driftOffset = (driftOffset + current * 0.7) % perimeter;
        }

        const count = dots.length;
        dots.forEach((dot, idx) => {
          const pt = getPointOnPerimeter(driftOffset + (idx * perimeter) / count);
          dot.setAttribute('cx', pt.x.toFixed(1));
          dot.setAttribute('cy', pt.y.toFixed(1));
          dot.setAttribute('opacity', isClosed ? '0.95' : '0.15');
        });

        this._circuitAnimId = requestAnimationFrame(tick);
      };
      this._circuitAnimId = requestAnimationFrame(tick);
    }

    // =========================================================================
    // Live Simulation Parameters & Controls HUD Dock
    // =========================================================================
    setupSimParametersHud() {
      const container = this.stageSvg && this.stageSvg.parentNode;
      if (!container || !this.engine) return;

      let hud = container.querySelector('#stage-sim-parameters');
      const scene = this.engine.scene;
      if (!scene) {
        if (hud) hud.style.display = 'none';
        return;
      }

      // Collect parameters: from scene.inputs or numeric scene.vars
      let inputs = Array.isArray(scene.inputs) && scene.inputs.length > 0 ? [...scene.inputs] : [];
      if (inputs.length === 0 && scene.vars && typeof scene.vars === 'object') {
        Object.entries(scene.vars).forEach(([k, v]) => {
          if (v && typeof v === 'object' && typeof v.min === 'number' && typeof v.max === 'number') {
            inputs.push({
              type: 'slider',
              var: k,
              label: v.label || k,
              min: v.min,
              max: v.max,
              step: v.step || 1,
              unit: v.unit || ''
            });
          }
        });
      }

      if (inputs.length === 0) {
        if (hud) hud.style.display = 'none';
        return;
      }

      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'stage-sim-parameters';
        hud.style.cssText = `
          position: absolute;
          top: 14px;
          right: 14px;
          min-width: 230px;
          max-width: 280px;
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
          padding: 10px 14px;
          color: #f8fafc;
          z-index: 28;
          user-select: none;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 12px;
          transition: opacity 0.2s ease;
        `;
        container.appendChild(hud);
      } else {
        hud.style.display = 'block';
      }

      if (this.engine.scene && this.engine.scene.id === 'atom') {
        hud.style.top = '96px';
        hud.style.right = '14px';
      } else {
        hud.style.top = '14px';
        hud.style.right = '14px';
      }

      const currentVars = this.engine.vars || {};

      let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">
          <span style="font-weight:800; font-size:12px; color:#38bdf8; display:flex; align-items:center; gap:5px;">
            <span>🎛️</span> Parameters
          </span>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="sim-btn-reset-vars" type="button" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); border-radius:6px; color:#94a3b8; font-size:10px; font-weight:700; padding:2px 7px; cursor:pointer;" title="Reset variables to defaults">↺ Reset</button>
            <button id="sim-btn-collapse" type="button" style="background:none; border:none; color:#94a3b8; font-size:12px; cursor:pointer; padding:0 3px;">▲</button>
          </div>
        </div>
        <div id="sim-param-body" style="display:flex; flex-direction:column; gap:8px;">
      `;

      inputs.forEach(inp => {
        const vName = inp.var;
        const curVal = currentVars[vName] !== undefined ? currentVars[vName] : (inp.min + (inp.max - inp.min) / 2);
        const unit = inp.unit || '';
        html += `
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:11px; font-weight:600; color:#cbd5e1;">${inp.label || vName}</span>
              <div style="display:flex; align-items:center; gap:4px;">
                <input type="number" min="${inp.min}" max="${inp.max}" step="${inp.step || 1}" value="${curVal}" data-var="${vName}" data-unit="${unit}" class="sim-param-num-input" style="width:48px; background:rgba(0,0,0,0.5); border:1px solid rgba(56,189,248,0.4); border-radius:4px; color:#38bdf8; font-family:ui-monospace, monospace; font-size:11px; font-weight:700; text-align:center; padding:1px 2px;" title="Type custom figure" />
                ${unit ? `<span style="font-size:10px; color:#94a3b8;">${unit}</span>` : ''}
              </div>
            </div>
            <input type="range" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${curVal}" data-var="${vName}" data-unit="${unit}" class="sim-param-slider" style="width:100%; accent-color:#38bdf8; cursor:pointer; height:6px; margin:0; display:block;" />
          </div>
        `;
      });

      // Special pedagogical dock for Pythagoras: Quick Integer Triples
      if (this.engine.scene && this.engine.scene.id === 'pythagoras') {
        html += `
          <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.12);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span style="font-size:10px; font-weight:800; color:#fbbf24; text-transform:uppercase; letter-spacing:0.5px;">📐 Pythagorean Triples</span>
              <span style="font-size:9px; color:#94a3b8;">a² + b² = c²</span>
            </div>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:4px;">
              <button type="button" class="pyth-triple-chip" data-a="3" data-b="4" style="background:rgba(255,255,255,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:5px; color:#f8fafc; font-size:10px; font-weight:700; padding:4px 2px; cursor:pointer; text-align:center;" title="3² + 4² = 5²">3 - 4 - 5</button>
              <button type="button" class="pyth-triple-chip" data-a="6" data-b="8" style="background:rgba(255,255,255,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:5px; color:#f8fafc; font-size:10px; font-weight:700; padding:4px 2px; cursor:pointer; text-align:center;" title="6² + 8² = 10²">6 - 8 - 10</button>
              <button type="button" class="pyth-triple-chip" data-a="5" data-b="12" style="background:rgba(255,255,255,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:5px; color:#f8fafc; font-size:10px; font-weight:700; padding:4px 2px; cursor:pointer; text-align:center;" title="5² + 12² = 13²">5 - 12 - 13</button>
              <button type="button" class="pyth-triple-chip" data-a="8" data-b="15" style="background:rgba(255,255,255,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:5px; color:#f8fafc; font-size:10px; font-weight:700; padding:4px 2px; cursor:pointer; text-align:center;" title="8² + 15² = 17²">8 - 15 - 17</button>
              <button type="button" class="pyth-triple-chip" data-a="9" data-b="12" style="background:rgba(255,255,255,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:5px; color:#f8fafc; font-size:10px; font-weight:700; padding:4px 2px; cursor:pointer; text-align:center;" title="9² + 12² = 15²">9 - 12 - 15</button>
              <button type="button" class="pyth-triple-chip" data-a="1" data-b="1" style="background:rgba(255,255,255,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:5px; color:#f8fafc; font-size:10px; font-weight:700; padding:4px 2px; cursor:pointer; text-align:center;" title="Isosceles: 1² + 1² = (√2)²">1 - 1 - √2</button>
            </div>
          </div>
        `;
      }

      html += `</div>`;
      hud.innerHTML = html;

      // Event listeners for Sliders & Number inputs
      const applyVal = (vName, val) => {
        if (this.engine && typeof this.engine.setVar === 'function') {
          this.engine.setVar(vName, val);
        }
        const s = hud.querySelector(`.sim-param-slider[data-var="${vName}"]`);
        const num = hud.querySelector(`.sim-param-num-input[data-var="${vName}"]`);
        if (s && Number(s.value) !== val) s.value = val;
        if (num && Number(num.value) !== val) num.value = val;

        if (this.engine.scene && this.engine.scene.id === 'pythagoras') {
          const curVars = this.engine.vars || {};
          const newA = vName === 'sideA' ? val : (curVars.sideA || 3);
          const newB = vName === 'sideB' ? val : (curVars.sideB || 4);
          this.renderPythagorasGeometry(newA, newB);
        }

        if (this.engine.scene && this.engine.scene.id === 'atom') {
          if (vName === 'atomicNumber') {
            this.updateAtomElementUI(val, false);
          }
        }
      };

      const sliders = hud.querySelectorAll('.sim-param-slider');
      sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
          const vName = e.target.getAttribute('data-var');
          const val = parseFloat(e.target.value);
          applyVal(vName, val);
          this.playAudioTone(400 + val * 10, 'sine', 0.02, 0.05);
        });
      });

      const numInputs = hud.querySelectorAll('.sim-param-num-input');
      numInputs.forEach(input => {
        input.addEventListener('input', (e) => {
          const vName = e.target.getAttribute('data-var');
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) {
            applyVal(vName, val);
            this.playAudioTone(440 + val * 12, 'triangle', 0.03, 0.08);
          }
        });
      });

      // Quick integer triple chips
      const tripleChips = hud.querySelectorAll('.pyth-triple-chip');
      tripleChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const aVal = parseFloat(chip.getAttribute('data-a'));
          const bVal = parseFloat(chip.getAttribute('data-b'));
          applyVal('sideA', aVal);
          applyVal('sideB', bVal);
          this.playAudioTone(587.33, 'triangle', 0.08, 0.2);
        });
      });

      const btnReset = hud.querySelector('#sim-btn-reset-vars');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (this.engine) this.engine.resetVars();
          this.setupSimParametersHud();
          this.playAudioTone(523, 'triangle', 0.08, 0.15);
        });
      }

      const btnCollapse = hud.querySelector('#sim-btn-collapse');
      const body = hud.querySelector('#sim-param-body');
      if (btnCollapse && body) {
        btnCollapse.addEventListener('click', () => {
          const isCollapsed = body.style.display === 'none';
          body.style.display = isCollapsed ? 'flex' : 'none';
          btnCollapse.textContent = isCollapsed ? '▲' : '▼';
        });
      }

      // Synchronize slider values when variables update externally
      if (!this._varChangeBound && this.engine && typeof this.engine.on === 'function') {
        this._varChangeBound = true;
        this.engine.on('varchange', (data) => {
          const curHud = container.querySelector('#stage-sim-parameters');
          if (curHud && curHud.style.display !== 'none') {
            const sList = curHud.querySelectorAll('.sim-param-slider');
            sList.forEach(s => {
              const vName = s.getAttribute('data-var');
              if (data.name === '*' || data.name === vName) {
                const val = (data.vars && data.vars[vName] !== undefined) ? data.vars[vName] : data.value;
                if (val !== undefined) {
                  if (Number(s.value) !== Number(val)) s.value = val;
                  const numInput = curHud.querySelector(`.sim-param-num-input[data-var="${vName}"]`);
                  if (numInput && Number(numInput.value) !== Number(val)) numInput.value = val;
                }
              }
            });
          }

          if (this.engine.scene && this.engine.scene.id === 'pythagoras') {
            const curA = this.engine.vars && this.engine.vars.sideA;
            const curB = this.engine.vars && this.engine.vars.sideB;
            if (curA && curB && (!this._pythState || curA !== this._pythState.a || curB !== this._pythState.b)) {
              this.renderPythagorasGeometry(curA, curB);
            }
          }

          if (this.engine.scene && this.engine.scene.id === 'solar-system') {
            if (data.name === 'warpSpeed' || data.name === '*') {
              const ws = (data.vars && data.vars.warpSpeed !== undefined) ? data.vars.warpSpeed : data.value;
              if (ws !== undefined) this.updateWarpChips(parseFloat(ws));
            }
          }

          if (this.engine.scene && this.engine.scene.id === 'times-tables') {
            if (data.name === 'table' || data.name === 'multiplier' || data.name === 'splitCol' || data.name === '*') {
              const curTable = (data.vars && data.vars.table !== undefined) ? Number(data.vars.table) : (data.name === 'table' ? Number(data.value) : this._ttTable);
              const curMult = (data.vars && data.vars.multiplier !== undefined) ? Number(data.vars.multiplier) : (data.name === 'multiplier' ? Number(data.value) : this._ttMultiplier);
              const curSplit = (data.vars && data.vars.splitCol !== undefined) ? Number(data.vars.splitCol) : (data.name === 'splitCol' ? Number(data.value) : this._ttSplitCol);
              if (curTable) this._ttTable = curTable;
              if (curMult) this._ttMultiplier = curMult;
              if (curSplit) this._ttSplitCol = curSplit;
              this.renderTimesTablesGrid();
            }
          }
        });
      }
    }

    // =========================================================================
    // Solar System: Cosmic Fact Card & Dynamic Targeting Reticle Subsystem
    // =========================================================================
    getSolarTopTrumpsDeck() {
      return this.getSolarFactCardDeck();
    }

    getSolarFactCardDeck() {
      return {
        sun: {
          title: '☀️ THE SUN',
          type: 'YELLOW DWARF STAR (G2V)',
          diameter: '1,392,700 km (109×)',
          diameterBar: 246,
          mass: '333,000 Earths',
          massBar: 246,
          distance: '0.00 AU (Center)',
          distBar: 10,
          day: '27 Days (Differential)',
          dayBar: 70,
          year: '230 Million Yrs (Orbit)',
          yearBar: 246,
          moons: '8 Planets + 5 Dwarfs',
          moonsBar: 246,
          fact1: 'Contains 99.86% of all mass in the Solar System!',
          fact2: 'Nuclear fusion burns 600M tons of H every second.',
          fact3: 'Surface temp: 5,500°C • Core temp: 15,000,000°C.',
          power: '100 / 100',
          freq: 110,
          color: '#f59e0b'
        },
        mercury: {
          title: '☿ MERCURY',
          type: 'ROCKY TERRESTRIAL WORLD',
          diameter: '4,879 km (0.38×)',
          diameterBar: 35,
          mass: '0.055 Earths',
          massBar: 20,
          distance: '0.39 AU (57.9M km)',
          distBar: 30,
          day: '59 Earth Days',
          dayBar: 130,
          year: '88 Days (Fastest!)',
          yearBar: 35,
          moons: '0 Moons',
          moonsBar: 10,
          fact1: 'Closest world to Sun with extreme temperature swings:',
          fact2: '+430°C by day, plunging to -180°C in nighttime shadow!',
          fact3: 'Giant iron core makes up 85% of its planetary radius.',
          power: '68 / 100',
          freq: 784,
          color: '#cbd5e1'
        },
        venus: {
          title: '♀ VENUS',
          type: 'GREENHOUSE HELLSCAPE',
          diameter: '12,104 km (0.95×)',
          diameterBar: 70,
          mass: '0.815 Earths',
          massBar: 65,
          distance: '0.72 AU (108.2M km)',
          distBar: 55,
          day: '243 Days (Retrograde)',
          dayBar: 240,
          year: '225 Earth Days',
          yearBar: 60,
          moons: '0 Moons',
          moonsBar: 10,
          fact1: 'Hottest planet in the Solar System (+465°C)!',
          fact2: 'Runaway greenhouse atmosphere crushes with 92 atm.',
          fact3: 'Spins backwards: Sun rises in West and sets in East!',
          power: '79 / 100',
          freq: 659.25,
          color: '#fde047'
        },
        earth: {
          title: '🌍 EARTH',
          type: 'OCEANIC LIVING OASIS',
          diameter: '12,742 km (1.0× Baseline)',
          diameterBar: 75,
          mass: '1.00 Earth (5.97×10²⁴ kg)',
          massBar: 75,
          distance: '1.00 AU (149.6M km)',
          distBar: 75,
          day: '23h 56m 04s',
          dayBar: 45,
          year: '365.25 Earth Days',
          yearBar: 80,
          moons: '1 Moon (Luna)',
          moonsBar: 25,
          fact1: 'The only known haven for living biology in the cosmos!',
          fact2: 'Oceans cover 71% of surface; nitrogen-oxygen shield.',
          fact3: 'Geodynamo molten iron core creates magnetosphere.',
          power: '94 / 100',
          freq: 523.25,
          color: '#38bdf8'
        },
        moon: {
          title: '🌕 THE MOON (LUNA)',
          type: 'NATURAL ROCKY SATELLITE',
          diameter: '3,474 km (0.27×)',
          diameterBar: 25,
          mass: '0.012 Earths',
          massBar: 15,
          distance: '384,400 km from Earth',
          distBar: 15,
          day: '27.3 Days (Locked)',
          dayBar: 80,
          year: '27.3 Days around Earth',
          yearBar: 20,
          moons: '0 (Orbits Earth)',
          moonsBar: 10,
          fact1: 'Tidally locked: identical face always points to Earth!',
          fact2: 'Lunar gravitational pull stabilizes Earth axial tilt.',
          fact3: 'Footprints left by astronauts will last millions of years.',
          power: '72 / 100',
          freq: 587.33,
          color: '#f1f5f9'
        },
        mars: {
          title: '♂ MARS',
          type: 'RUST RED DESERT WORLD',
          diameter: '6,779 km (0.53×)',
          diameterBar: 45,
          mass: '0.107 Earths',
          massBar: 30,
          distance: '1.52 AU (227.9M km)',
          distBar: 95,
          day: '24h 37m (Earth-like)',
          dayBar: 48,
          year: '687 Earth Days (1.88 yrs)',
          yearBar: 110,
          moons: '2 Moons (Phobos, Deimos)',
          moonsBar: 35,
          fact1: 'Host to Olympus Mons: 22 km volcano (nearly 3× Everest)!',
          fact2: 'Iron oxide (rust) dust blankets entire planetary crust.',
          fact3: 'Features Valles Marineris canyon spanning 4,000 km.',
          power: '84 / 100',
          freq: 440,
          color: '#ef4444'
        },
        jupiter: {
          title: '♃ JUPITER',
          type: 'KING OF GAS GIANTS',
          diameter: '139,820 km (11.0×)',
          diameterBar: 235,
          mass: '317.8 Earths (Monster)',
          massBar: 246,
          distance: '5.20 AU (778.5M km)',
          distBar: 140,
          day: '9h 55m (Fastest Spin!)',
          dayBar: 30,
          year: '11.86 Earth Years',
          yearBar: 160,
          moons: '95 Moons (Europa, Io)',
          moonsBar: 210,
          fact1: 'Great Red Spot is an anticyclone storm raging >350 yrs!',
          fact2: 'Possesses strongest planetary magnetic field in system.',
          fact3: 'Subsurface ocean on moon Europa has more water than Earth.',
          power: '98 / 100',
          freq: 146.83,
          color: '#fb923c'
        },
        saturn: {
          title: '🪐 SATURN',
          type: 'GOLDEN RINGED GAS GIANT',
          diameter: '120,536 km (9.5×)',
          diameterBar: 200,
          mass: '95.2 Earths',
          massBar: 180,
          distance: '9.54 AU (1.43B km)',
          distBar: 175,
          day: '10h 33m (Super Fast)',
          dayBar: 35,
          year: '29.45 Earth Years',
          yearBar: 195,
          moons: '146 Moons (Record!)',
          moonsBar: 246,
          fact1: 'Density is less than water: Saturn would float in a bathtub!',
          fact2: 'Majestic rings span 282,000 km wide but are only ~10m thin.',
          fact3: 'Moon Titan has thick atmosphere and liquid methane lakes.',
          power: '96 / 100',
          freq: 220,
          color: '#eab308'
        },
        uranus: {
          title: '♅ URANUS',
          type: 'SIDEWAYS ICE GIANT',
          diameter: '50,724 km (4.0×)',
          diameterBar: 130,
          mass: '14.5 Earths',
          massBar: 110,
          distance: '19.2 AU (2.87B km)',
          distBar: 215,
          day: '17h 14m (Retrograde)',
          dayBar: 55,
          year: '84.0 Earth Years',
          yearBar: 220,
          moons: '28 Moons',
          moonsBar: 85,
          fact1: 'Tilted 98° on its side: rolls like a cosmic bowling ball!',
          fact2: 'Coldest planetary atmosphere recorded at -224°C.',
          fact3: 'Methane in upper atmosphere absorbs red light, glowing cyan.',
          power: '88 / 100',
          freq: 329.63,
          color: '#06b6d4'
        },
        neptune: {
          title: '♆ NEPTUNE',
          type: 'SUPERSONIC ICE GIANT',
          diameter: '49,244 km (3.9×)',
          diameterBar: 125,
          mass: '17.1 Earths',
          massBar: 125,
          distance: '30.1 AU (4.50B km)',
          distBar: 246,
          day: '16h 06m',
          dayBar: 50,
          year: '164.8 Earth Years',
          yearBar: 246,
          moons: '16 Moons (Triton)',
          moonsBar: 65,
          fact1: 'Supersonic storm winds roar over 2,100 km/h (Mach 1.7)!',
          fact2: 'Took 165 Earth years to complete its first orbit since discovery.',
          fact3: 'Moon Triton orbits retrograde with nitrogen ice geysers.',
          power: '92 / 100',
          freq: 246.94,
          color: '#3b82f6'
        }
      };
    }

    setupSolarSystemInteractivity() {
      if (!this.stageSvg) return;

      // 1. Direct Planet Click & Ribbon Click Handlers (Supports 1-Tap Toggle Close)
      const clickablePlanets = this.stageSvg.querySelectorAll('[data-planet], [data-action="inspect-planet"]');
      clickablePlanets.forEach(node => {
        node.style.cursor = 'pointer';
        if (!node._hasPlanetClick) {
          node._hasPlanetClick = true;
          const onPlanetClick = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const pKey = node.getAttribute('data-planet') || node.closest('[data-planet]')?.getAttribute('data-planet');
            if (pKey) {
              if (this._activePlanetKey === pKey) {
                this.closePlanetFactCard();
              } else {
                this.showPlanetFactCard(pKey);
              }
              this.createTouchRipple(ev.clientX, ev.clientY);
            }
          };
          node.addEventListener('pointerdown', onPlanetClick);
          node.addEventListener('click', onPlanetClick);
        }
      });

      // 2. Direct Close Buttons (Top-Right [✕] and Bottom [✕ Close Card])
      const closeButtons = this.stageSvg.querySelectorAll('[data-action="tt-close"], [data-action="card-close"], #tt-close-x-btn, #tt-close-bottom-btn');
      closeButtons.forEach(btn => {
        btn.style.cursor = 'pointer';
        if (!btn._hasCloseClick) {
          btn._hasCloseClick = true;
          const onClose = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            this.closePlanetFactCard();
            this.createTouchRipple(ev.clientX, ev.clientY);
          };
          btn.addEventListener('pointerdown', onClose);
          btn.addEventListener('click', onClose);
        }
      });

      // 3. Next / Prev Planet Deck Navigation Buttons
      const nextButtons = this.stageSvg.querySelectorAll('[data-action="tt-next"], [data-action="card-next"]');
      nextButtons.forEach(btn => {
        btn.style.cursor = 'pointer';
        if (!btn._hasNextClick) {
          btn._hasNextClick = true;
          const onNext = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            this.nextPlanetFactCard();
            this.createTouchRipple(ev.clientX, ev.clientY);
          };
          btn.addEventListener('pointerdown', onNext);
          btn.addEventListener('click', onNext);
        }
      });

      const prevButtons = this.stageSvg.querySelectorAll('[data-action="tt-prev"], [data-action="card-prev"]');
      prevButtons.forEach(btn => {
        btn.style.cursor = 'pointer';
        if (!btn._hasPrevClick) {
          btn._hasPrevClick = true;
          const onPrev = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            this.prevPlanetFactCard();
            this.createTouchRipple(ev.clientX, ev.clientY);
          };
          btn.addEventListener('pointerdown', onPrev);
          btn.addEventListener('click', onPrev);
        }
      });

      // 4. Stop Propagation Inside Card (Prevents Accidental 3D Drag While Reading)
      const card = this.stageSvg.querySelector('#solar-top-trumps-card');
      if (card && !card._hasCardStop) {
        card._hasCardStop = true;
        card.addEventListener('pointerdown', (ev) => {
          ev.stopPropagation();
        });
      }

      // 5. Global Escape Key Handler for Instant Dismissal
      if (!this._hasSolarEscapeListener) {
        this._hasSolarEscapeListener = true;
        window.addEventListener('keydown', (ev) => {
          if (ev.key === 'Escape' && this._activePlanetKey) {
            this.closePlanetFactCard();
          }
        });
      }

      // 6. Update warp buttons to match current warpSpeed
      const curWarp = (this.engine && this.engine.vars && Number(this.engine.vars.warpSpeed)) || 1.0;
      this.updateWarpChips(curWarp);

      // 7. Start 60 FPS Reticle tracking loop
      if (this._solarReticleLoopId) cancelAnimationFrame(this._solarReticleLoopId);

      const reticle = this.stageSvg.querySelector('#planet-target-reticle');

      const tickReticle = () => {
        if (!this.stageSvg || !this.stageSvg.contains(reticle)) return;

        if (this._activePlanetNode && reticle && reticle.getAttribute('display') !== 'none') {
          const cxStr = this._activePlanetNode.getAttribute('cx') || this._activePlanetNode.getAttribute('x');
          const cyStr = this._activePlanetNode.getAttribute('cy') || this._activePlanetNode.getAttribute('y');
          if (cxStr && cyStr) {
            const cx = parseFloat(cxStr);
            const cy = parseFloat(cyStr);
            reticle.setAttribute('transform', `translate(${cx.toFixed(1)}, ${cy.toFixed(1)})`);
          }
        }

        this._solarReticleLoopId = requestAnimationFrame(tickReticle);
      };

      this._solarReticleLoopId = requestAnimationFrame(tickReticle);
    }

    showPlanetFactCard(planetKey) {
      if (!this.stageSvg) return;
      const deck = this.getSolarFactCardDeck();
      const data = deck[planetKey] || deck.earth;
      this._activePlanetKey = planetKey;

      const card = this.stageSvg.querySelector('#solar-top-trumps-card');
      const reticle = this.stageSvg.querySelector('#planet-target-reticle');
      if (!card) return;

      // Locate target node for reticle
      let targetNode = null;
      if (planetKey === 'sun') {
        targetNode = this.stageSvg.querySelector('#sun-body');
      } else if (planetKey === 'moon') {
        targetNode = this.stageSvg.querySelector('#moon-earth');
      } else {
        targetNode = this.stageSvg.querySelector(`#planet-${planetKey}`);
      }
      this._activePlanetNode = targetNode;

      // Populate Fact Card Data
      const setTitle = this.stageSvg.querySelector('#tt-planet-title');
      const setClass = this.stageSvg.querySelector('#tt-planet-class');
      const classPill = this.stageSvg.querySelector('#tt-class-pill');
      const setCardHeader = this.stageSvg.querySelector('#tt-card-header');

      if (setCardHeader) setCardHeader.textContent = 'COSMIC FACT CARD';
      if (setTitle) setTitle.textContent = data.title;
      if (setClass) setClass.textContent = data.type;
      if (classPill && data.color) classPill.setAttribute('stroke', data.color);

      // Populate Stats Values & Progress Bars
      const setVal = (id, val) => { const el = this.stageSvg.querySelector(id); if (el) el.textContent = val; };
      const setBar = (id, width, col) => {
        const el = this.stageSvg.querySelector(id);
        if (el) {
          el.setAttribute('width', String(Math.max(4, Math.min(246, width))));
          if (col) el.setAttribute('fill', col);
        }
      };

      setVal('#tt-val-diameter', data.diameter);
      setBar('#tt-bar-diameter', data.diameterBar, data.color);

      setVal('#tt-val-mass', data.mass);
      setBar('#tt-bar-mass', data.massBar, data.color);

      setVal('#tt-val-distance', data.distance);
      setBar('#tt-bar-distance', data.distBar, data.color);

      setVal('#tt-val-day', data.day);
      setBar('#tt-bar-day', data.dayBar, data.color);

      setVal('#tt-val-year', data.year);
      setBar('#tt-bar-year', data.yearBar, data.color);

      setVal('#tt-val-moons', data.moons);
      setBar('#tt-bar-moons', data.moonsBar, data.color);

      // Populate Facts & Power Score
      setVal('#tt-fact-line1', data.fact1);
      setVal('#tt-fact-line2', data.fact2);
      setVal('#tt-fact-line3', data.fact3);
      setVal('#tt-power-score', `⭐ COSMIC POWER: ${data.power}`);

      // Display card & reticle
      card.setAttribute('display', 'block');
      if (reticle && targetNode) {
        reticle.setAttribute('display', 'block');
        const cxStr = targetNode.getAttribute('cx') || targetNode.getAttribute('x');
        const cyStr = targetNode.getAttribute('cy') || targetNode.getAttribute('y');
        if (cxStr && cyStr) {
          reticle.setAttribute('transform', `translate(${parseFloat(cxStr).toFixed(1)}, ${parseFloat(cyStr).toFixed(1)})`);
        }
      }

      // Highlight selected planet in the bottom ribbon
      const ribbonBtns = this.stageSvg.querySelectorAll('#solar-planet-ribbon .ribbon-btn');
      ribbonBtns.forEach(btn => {
        const p = btn.getAttribute('data-planet');
        const rect = btn.querySelector('rect');
        if (rect) {
          if (p === planetKey) {
            rect.setAttribute('fill', '#0284c7');
            rect.setAttribute('stroke', '#38bdf8');
            rect.setAttribute('stroke-width', '1.5');
          } else {
            rect.setAttribute('fill', '#1e293b');
            rect.setAttribute('stroke', '#475569');
            rect.setAttribute('stroke-width', '1');
          }
        }
      });

      // Play procedural frequency tone
      if (data.freq) {
        this.playAudioTone(data.freq, 'triangle', 0.16, 0.22);
      }
    }

    nextPlanetFactCard() {
      const order = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
      const curIdx = order.indexOf(this._activePlanetKey || 'earth');
      const nextIdx = (curIdx + 1) % order.length;
      this.showPlanetFactCard(order[nextIdx]);
    }

    prevPlanetFactCard() {
      const order = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
      const curIdx = order.indexOf(this._activePlanetKey || 'earth');
      const prevIdx = (curIdx - 1 + order.length) % order.length;
      this.showPlanetFactCard(order[prevIdx]);
    }

    closePlanetFactCard() {
      const card = this.stageSvg && this.stageSvg.querySelector('#solar-top-trumps-card');
      const reticle = this.stageSvg && this.stageSvg.querySelector('#planet-target-reticle');
      if (card) card.setAttribute('display', 'none');
      if (reticle) reticle.setAttribute('display', 'none');
      this._activePlanetNode = null;
      this._activePlanetKey = null;
      if (this.stageSvg) {
        const ribbonBtns = this.stageSvg.querySelectorAll('#solar-planet-ribbon .ribbon-btn rect');
        ribbonBtns.forEach(r => {
          r.setAttribute('fill', '#1e293b');
          r.setAttribute('stroke', '#475569');
        });
      }
      this.playAudioTone(330, 'sine', 0.08, 0.15);
    }

    // Backward-compatibility aliases for Top Trumps naming
    showPlanetTopTrump(planetKey) { return this.showPlanetFactCard(planetKey); }
    closePlanetTopTrump() { return this.closePlanetFactCard(); }
    nextPlanetTopTrump() { return this.nextPlanetFactCard(); }
    prevPlanetTopTrump() { return this.prevPlanetFactCard(); }

    updateWarpChips(speed) {
      if (!this.stageSvg) return;
      const chips = [
        { action: 'solar-warp-1', val: 1.0 },
        { action: 'solar-warp-2', val: 2.0 },
        { action: 'solar-warp-5', val: 5.0 },
        { action: 'solar-warp-10', val: 10.0 }
      ];
      chips.forEach(c => {
        const btn = this.stageSvg.querySelector(`[data-action="${c.action}"]`);
        if (btn) {
          const rect = btn.querySelector('rect');
          const txt = btn.querySelector('text');
          const isActive = Math.abs(c.val - speed) < 0.2;
          if (rect) {
            rect.setAttribute('fill', isActive ? '#0284c7' : '#1e293b');
            rect.setAttribute('stroke', isActive ? '#38bdf8' : '#475569');
          }
          if (txt) {
            txt.setAttribute('fill', isActive ? '#ffffff' : '#94a3b8');
          }
        }
      });
    }

    // =========================================================================
    // =========================================================================
    // Standard School Times Tables: 1x to 12x Multiplication & 12x12 Grid
    // =========================================================================
    setupTimesTablesInteractivity() {
      if (!this.stageSvg) return;
      this._ttTable = (this.engine && this.engine.vars && Number(this.engine.vars.table)) || 7;
      this._ttMultiplier = (this.engine && this.engine.vars && Number(this.engine.vars.multiplier)) || 8;
      this._ttMode = 'list';
      this._ttHideAnswers = false;
      this._ttRevealedRows = new Set();
      this._ttQuizStreak = 0;
      this._ttIsReciting = false;

      this.renderTimesTablesGrid();
    }

    renderTimesTablesGrid() {
      if (!this.stageSvg) return;
      const table = Math.max(1, Math.min(12, this._ttTable || 7));
      const mult = Math.max(1, Math.min(12, this._ttMultiplier || 8));
      this._ttTable = table;
      this._ttMultiplier = mult;

      // 1. Update Header & Sub-bar displays
      const listHeader = this.stageSvg.querySelector('#tt-list-header');
      if (listHeader) listHeader.textContent = `${table} TIMES TABLE (1× TO 12×)`;

      const multDisplay = this.stageSvg.querySelector('#tt-multiplier-display');
      if (multDisplay) multDisplay.textContent = `× ${mult} Multiplier`;

      const flipLabel = this.stageSvg.querySelector('#tt-flip-label');
      if (flipLabel) flipLabel.textContent = `🔄 Flip: ${table}×${mult} ⇄ ${mult}×${table}`;

      const hideToggleText = this.stageSvg.querySelector('#tt-hide-toggle-text');
      if (hideToggleText) {
        hideToggleText.textContent = this._ttHideAnswers ? '👁️ Show All Answers' : '👁️ Hide Answers (Test)';
      }

      // 2. Highlight Table Chips (1x to 12x)
      const chips = this.stageSvg.querySelectorAll('.table-chip');
      chips.forEach(chip => {
        const tVal = Number(chip.getAttribute('data-table'));
        const rect = chip.querySelector('rect');
        const text = chip.querySelector('text');
        const isActive = tVal === table;
        if (rect) {
          rect.setAttribute('fill', isActive ? '#059669' : '#1e293b');
          rect.setAttribute('stroke', isActive ? '#10b981' : '#334155');
          rect.setAttribute('stroke-width', isActive ? '1.5' : '1');
        }
        if (text) {
          text.setAttribute('fill', isActive ? '#ffffff' : '#cbd5e1');
          text.setAttribute('font-weight', isActive ? '900' : '800');
        }
      });

      // 3. Render the 12 Standard School Rows (1 x Table to 12 x Table)
      const rowsContainer = this.stageSvg.querySelector('#tt-list-rows');
      if (rowsContainer) {
        rowsContainer.innerHTML = '';
        const rowH = 20;
        const rowGap = 2;
        const width = 352;

        for (let i = 1; i <= 12; i++) {
          const y = (i - 1) * (rowH + rowGap);
          const isActive = (i === mult);
          const isHidden = this._ttHideAnswers && !this._ttRevealedRows.has(i);
          const product = i * table;

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('transform', `translate(0, ${y})`);
          g.setAttribute('data-action', 'tt-set-mult');
          g.setAttribute('data-mult', String(i));
          g.style.cursor = 'pointer';

          // Background Row Rect
          const rowRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rowRect.setAttribute('width', String(width));
          rowRect.setAttribute('height', String(rowH));
          rowRect.setAttribute('rx', '4');
          rowRect.setAttribute('fill', isActive ? 'url(#tt-grad-row-active)' : '#0f172a');
          rowRect.setAttribute('stroke', isActive ? '#38bdf8' : '#1e293b');
          rowRect.setAttribute('stroke-width', isActive ? '1.5' : '1');
          g.appendChild(rowRect);

          // Active Arrow Indicator
          if (isActive) {
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            arrow.setAttribute('x', '10');
            arrow.setAttribute('y', '14.5');
            arrow.setAttribute('fill', '#38bdf8');
            arrow.setAttribute('font-size', '10');
            arrow.setAttribute('font-weight', '900');
            arrow.textContent = '▶';
            g.appendChild(arrow);
          }

          // Equation text: e.g. " 1 × 7 ="
          const eqText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          eqText.setAttribute('x', isActive ? '24' : '14');
          eqText.setAttribute('y', '14.5');
          eqText.setAttribute('fill', isActive ? '#f8fafc' : '#cbd5e1');
          eqText.setAttribute('font-size', '11');
          eqText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
          eqText.setAttribute('font-weight', isActive ? '900' : '700');
          const padI = i < 10 ? ` ${i}` : `${i}`;
          eqText.textContent = `${padI} × ${table} =`;
          g.appendChild(eqText);

          // Answer Pill Box
          const ansBoxW = 54;
          const ansBoxH = 16;
          const ansBoxX = width - ansBoxW - 8;
          const ansBoxY = 2;

          const ansRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          ansRect.setAttribute('x', String(ansBoxX));
          ansRect.setAttribute('y', String(ansBoxY));
          ansRect.setAttribute('width', String(ansBoxW));
          ansRect.setAttribute('height', String(ansBoxH));
          ansRect.setAttribute('rx', '3.5');
          ansRect.setAttribute('fill', isHidden ? '#1e293b' : (isActive ? '#0284c7' : '#1e293b'));
          ansRect.setAttribute('stroke', isHidden ? '#f59e0b' : (isActive ? '#38bdf8' : '#334155'));
          ansRect.setAttribute('stroke-width', '1');
          g.appendChild(ansRect);

          const ansText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          ansText.setAttribute('x', String(ansBoxX + ansBoxW / 2));
          ansText.setAttribute('y', String(ansBoxY + 11.5));
          ansText.setAttribute('fill', isHidden ? '#facc15' : (isActive ? '#ffffff' : '#34d399'));
          ansText.setAttribute('font-size', '11');
          ansText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
          ansText.setAttribute('font-weight', '900');
          ansText.setAttribute('text-anchor', 'middle');
          ansText.textContent = isHidden ? '?' : String(product);
          g.appendChild(ansText);

          if (isHidden) {
            ansRect.setAttribute('data-action', 'tt-reveal-row');
            ansRect.setAttribute('data-row', String(i));
          }

          rowsContainer.appendChild(g);
        }
      }

      // 4. Update Right Side Multiplication Fact & Mastery Card
      const total = table * mult;
      const setTxt = (id, str) => { const el = this.stageSvg.querySelector(id); if (el) el.textContent = str; };

      setTxt('#tt-card-target-eq', `${table} × ${mult} = ${total}`);

      const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
      const tWord = words[table] || String(table);
      const mWord = words[mult] || String(mult);
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
      setTxt('#tt-card-word-form', `${cap(tWord)} multiplied by ${mWord} is ${total}`);

      setTxt('#tt-card-family-comm', `${mult} × ${table} = ${total} (Commutative Property)`);
      setTxt('#tt-card-family-div', `${total} ÷ ${table} = ${mult} • ${total} ÷ ${mult} = ${table} (Division Inverses)`);

      // Repeated Addition string
      if (mult <= 10) {
        setTxt('#tt-card-repeated-add', `${Array(mult).fill(table).join(' + ')} = ${total}`);
      } else {
        setTxt('#tt-card-repeated-add', `${Array(4).fill(table).join(' + ')} ... (${mult} times) = ${total}`);
      }

      // Visual Grouping Representation
      const visSub = this.stageSvg.querySelector('#tt-visual-groups-sub');
      if (visSub) visSub.textContent = `${mult} groups of ${table}`;

      const visContainer = this.stageSvg.querySelector('#tt-visual-groups-container');
      if (visContainer) {
        visContainer.innerHTML = '';
        const maxGroups = mult;
        const barW = Math.max(16, Math.min(26, Math.floor(320 / maxGroups) - 3));
        const barH = 20;

        for (let gIdx = 0; gIdx < maxGroups; gIdx++) {
          const gx = gIdx * (barW + 3);
          const groupG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          groupG.setAttribute('transform', `translate(${gx}, 0)`);

          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('width', String(barW));
          rect.setAttribute('height', String(barH));
          rect.setAttribute('rx', '3');
          rect.setAttribute('fill', '#0284c7');
          rect.setAttribute('stroke', '#38bdf8');
          rect.setAttribute('stroke-width', '1');
          groupG.appendChild(rect);

          const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          txt.setAttribute('x', String(barW / 2));
          txt.setAttribute('y', '14');
          txt.setAttribute('fill', '#ffffff');
          txt.setAttribute('font-size', '9');
          txt.setAttribute('font-weight', '900');
          txt.setAttribute('text-anchor', 'middle');
          txt.textContent = String(table);
          groupG.appendChild(txt);

          visContainer.appendChild(groupG);
        }
      }

      // Mental Partition Strategy
      if (mult > 5) {
        const p1 = 5;
        const p2 = mult - 5;
        setTxt('#tt-card-strategy', `${table} × ${mult} = (${table} × ${p1}) + (${table} × ${p2}) = ${table * p1} + ${table * p2} = ${total}`);
      } else if (mult > 1) {
        const p1 = Math.floor(mult / 2);
        const p2 = mult - p1;
        setTxt('#tt-card-strategy', `${table} × ${mult} = (${table} × ${p1}) + (${table} × ${p2}) = ${table * p1} + ${table * p2} = ${total}`);
      } else {
        setTxt('#tt-card-strategy', `Identity Property: Any number multiplied by 1 is itself (${table} × 1 = ${table}).`);
      }

      // 5. Update Bottom Banner
      setTxt('#tt-banner-txt', `Standard School Times Table: ${table} × ${mult} = ${total} • ${mult} groups of ${table} • Inverses: ${total} ÷ ${table} = ${mult}, ${total} ÷ ${mult} = ${table}`);

      // 6. If in Grid view, render the 12x12 matrix
      if (this._ttMode === 'grid') {
        this.renderTimesTablesMatrix12x12();
      }
    }

    renderTimesTablesMatrix12x12() {
      if (!this.stageSvg) return;
      const matrixContainer = this.stageSvg.querySelector('#tt-12x12-matrix');
      if (!matrixContainer) return;
      matrixContainer.innerHTML = '';

      const table = this._ttTable || 7;
      const mult = this._ttMultiplier || 8;

      const cols = 13;
      const rows = 13;
      const cellW = 34;
      const cellH = 19;
      const gap = 1.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * (cellW + gap);
          const y = r * (cellH + gap);

          const isTopHeader = (r === 0);
          const isLeftHeader = (c === 0);
          const isCorner = (r === 0 && c === 0);

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('transform', `translate(${x}, ${y})`);

          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('width', String(cellW));
          rect.setAttribute('height', String(cellH));
          rect.setAttribute('rx', '2.5');

          const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          txt.setAttribute('x', String(cellW / 2));
          txt.setAttribute('y', String(cellH / 2 + 3.5));
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');

          if (isCorner) {
            rect.setAttribute('fill', '#0284c7');
            rect.setAttribute('stroke', '#38bdf8');
            rect.setAttribute('stroke-width', '1');
            txt.setAttribute('fill', '#ffffff');
            txt.setAttribute('font-size', '10');
            txt.setAttribute('font-weight', '900');
            txt.textContent = '×';
          } else if (isTopHeader) {
            const colVal = c;
            const isColActive = (colVal === mult);
            rect.setAttribute('fill', isColActive ? '#d97706' : '#1e293b');
            rect.setAttribute('stroke', isColActive ? '#f59e0b' : '#334155');
            rect.setAttribute('stroke-width', isColActive ? '1.5' : '0.8');
            txt.setAttribute('fill', isColActive ? '#ffffff' : '#facc15');
            txt.setAttribute('font-size', '8.5');
            txt.setAttribute('font-weight', '900');
            txt.textContent = String(colVal);
          } else if (isLeftHeader) {
            const rowVal = r;
            const isRowActive = (rowVal === table);
            rect.setAttribute('fill', isRowActive ? '#059669' : '#1e293b');
            rect.setAttribute('stroke', isRowActive ? '#10b981' : '#334155');
            rect.setAttribute('stroke-width', isRowActive ? '1.5' : '0.8');
            txt.setAttribute('fill', isRowActive ? '#ffffff' : '#34d399');
            txt.setAttribute('font-size', '8.5');
            txt.setAttribute('font-weight', '900');
            txt.textContent = String(rowVal);
          } else {
            const prod = r * c;
            const isIntersection = (r === table && c === mult);
            const isRowCross = (r === table);
            const isColCross = (c === mult);
            const isSquare = (r === c);

            if (isIntersection) {
              rect.setAttribute('fill', '#0284c7');
              rect.setAttribute('stroke', '#38bdf8');
              rect.setAttribute('stroke-width', '1.5');
              txt.setAttribute('fill', '#ffffff');
              txt.setAttribute('font-weight', '900');
              txt.setAttribute('font-size', '9');
            } else if (isRowCross) {
              rect.setAttribute('fill', '#064e3b');
              rect.setAttribute('stroke', '#059669');
              rect.setAttribute('stroke-width', '0.6');
              txt.setAttribute('fill', '#6ee7b7');
              txt.setAttribute('font-weight', '700');
              txt.setAttribute('font-size', '8');
            } else if (isColCross) {
              rect.setAttribute('fill', '#451a03');
              rect.setAttribute('stroke', '#d97706');
              rect.setAttribute('stroke-width', '0.6');
              txt.setAttribute('fill', '#fde68a');
              txt.setAttribute('font-weight', '700');
              txt.setAttribute('font-size', '8');
            } else if (isSquare) {
              rect.setAttribute('fill', '#172554');
              rect.setAttribute('stroke', '#3b82f6');
              rect.setAttribute('stroke-width', '0.8');
              txt.setAttribute('fill', '#93c5fd');
              txt.setAttribute('font-weight', '800');
              txt.setAttribute('font-size', '8');
            } else {
              rect.setAttribute('fill', '#0f172a');
              rect.setAttribute('stroke', '#1e293b');
              rect.setAttribute('stroke-width', '0.5');
              txt.setAttribute('fill', '#94a3b8');
              txt.setAttribute('font-weight', '600');
              txt.setAttribute('font-size', '8');
            }

            txt.textContent = String(prod);

            g.style.cursor = 'pointer';
            g.setAttribute('data-action', 'tt-grid-cell');
            g.setAttribute('data-r', String(r));
            g.setAttribute('data-c', String(c));
          }

          g.appendChild(rect);
          g.appendChild(txt);
          matrixContainer.appendChild(g);
        }
      }

      // Update Grid Inspector Plaque
      const total = table * mult;
      const setTxt = (id, str) => { const el = this.stageSvg.querySelector(id); if (el) el.textContent = str; };
      setTxt('#tt-grid-cell-eq', `${table} × ${mult} = ${total}`);
      if (table === mult) {
        setTxt('#tt-grid-square-badge', `⭐ SQUARE NUMBER: ${table}² = ${total}`);
      } else {
        setTxt('#tt-grid-square-badge', `Row ${table} × Column ${mult}`);
      }

      const factors = [];
      for (let f = 1; f <= total; f++) {
        if (total % f === 0) factors.push(f);
      }
      setTxt('#tt-grid-factors', `Factors: ${factors.join(', ')}`);
      setTxt('#tt-grid-even', total % 2 === 0 ? `Even Number • Multiple of ${table} and ${mult}` : `Odd Number • Multiple of ${table} and ${mult}`);
    }

    handleTimesTablesAction(action, targetNode) {
      if (!this.stageSvg) return;

      if (action === 'tt-set-table') {
        const tableVal = targetNode ? Number(targetNode.getAttribute('data-table') || targetNode.closest('[data-table]')?.getAttribute('data-table')) : 7;
        if (tableVal) {
          this._ttTable = tableVal;
          if (this.engine) this.engine.setVar('table', tableVal);
          this.playAudioTone(260 + tableVal * 30, 'triangle', 0.12, 0.2);
          this.renderTimesTablesGrid();
        }
      } else if (action === 'tt-set-mult') {
        const multVal = targetNode ? Number(targetNode.getAttribute('data-mult') || targetNode.closest('[data-mult]')?.getAttribute('data-mult')) : 1;
        if (multVal) {
          this._ttMultiplier = multVal;
          if (this.engine) this.engine.setVar('multiplier', multVal);
          this.playAudioTone(300 + multVal * 30, 'sine', 0.1, 0.18);
          this.renderTimesTablesGrid();
        }
      } else if (action === 'tt-grid-cell') {
        const rVal = targetNode ? Number(targetNode.getAttribute('data-r') || targetNode.closest('[data-r]')?.getAttribute('data-r')) : 7;
        const cVal = targetNode ? Number(targetNode.getAttribute('data-c') || targetNode.closest('[data-c]')?.getAttribute('data-c')) : 8;
        if (rVal && cVal) {
          this._ttTable = rVal;
          this._ttMultiplier = cVal;
          if (this.engine) {
            this.engine.setVar('table', rVal);
            this.engine.setVar('multiplier', cVal);
          }
          this.playAudioTone(220 + (rVal + cVal) * 20, 'sine', 0.1, 0.2);
          this.renderTimesTablesGrid();
        }
      } else if (action === 'tt-inc-mult') {
        this._ttMultiplier = Math.min(12, (this._ttMultiplier || 8) + 1);
        if (this.engine) this.engine.setVar('multiplier', this._ttMultiplier);
        this.playAudioTone(320 + this._ttMultiplier * 25, 'sine', 0.08, 0.18);
        this.renderTimesTablesGrid();
      } else if (action === 'tt-dec-mult') {
        this._ttMultiplier = Math.max(1, (this._ttMultiplier || 8) - 1);
        if (this.engine) this.engine.setVar('multiplier', this._ttMultiplier);
        this.playAudioTone(320 + this._ttMultiplier * 25, 'sine', 0.08, 0.18);
        this.renderTimesTablesGrid();
      } else if (action === 'tt-flip') {
        const tmp = this._ttTable;
        this._ttTable = this._ttMultiplier;
        this._ttMultiplier = tmp;
        if (this.engine) {
          this.engine.setVar('table', this._ttTable);
          this.engine.setVar('multiplier', this._ttMultiplier);
        }
        this.playAudioTone(523.25, 'triangle', 0.14, 0.22);
        this.renderTimesTablesGrid();
      } else if (action === 'tt-toggle-hide') {
        this._ttHideAnswers = !this._ttHideAnswers;
        if (!this._ttHideAnswers) this._ttRevealedRows.clear();
        this.playAudioTone(440, 'triangle', 0.1, 0.2);
        this.renderTimesTablesGrid();
      } else if (action === 'tt-reveal-row') {
        const rowVal = targetNode ? Number(targetNode.getAttribute('data-row') || targetNode.closest('[data-row]')?.getAttribute('data-row')) : 1;
        if (rowVal) {
          this._ttRevealedRows.add(rowVal);
          this.playAudioTone(659.25, 'sine', 0.1, 0.2);
          this.renderTimesTablesGrid();
        }
      } else if (action === 'tt-recite') {
        this.reciteTimesTable();
      } else if (action === 'tt-mode-list') {
        this._ttMode = 'list';
        this.updateTimesTablesModeView('list');
      } else if (action === 'tt-mode-grid') {
        this._ttMode = 'grid';
        this.updateTimesTablesModeView('grid');
        this.renderTimesTablesMatrix12x12();
      } else if (action === 'tt-mode-quiz') {
        this._ttMode = 'quiz';
        this.updateTimesTablesModeView('quiz');
        this.setupTimesTablesQuiz();
      } else if (action === 'tt-quiz-answer') {
        const idx = targetNode ? Number(targetNode.getAttribute('data-idx') || targetNode.closest('[data-idx]')?.getAttribute('data-idx')) : 0;
        this.handleQuizAnswer(idx, targetNode);
      }
    }

    updateTimesTablesModeView(mode) {
      if (!this.stageSvg) return;
      const stageList = this.stageSvg.querySelector('#tt-stage-list');
      const stageGrid = this.stageSvg.querySelector('#tt-stage-grid');
      const stageQuiz = this.stageSvg.querySelector('#tt-stage-quiz');

      if (stageList) stageList.setAttribute('display', mode === 'list' ? 'block' : 'none');
      if (stageGrid) stageGrid.setAttribute('display', mode === 'grid' ? 'block' : 'none');
      if (stageQuiz) stageQuiz.setAttribute('display', mode === 'quiz' ? 'block' : 'none');

      const tabs = [
        { id: '#tab-mode-list', mode: 'list' },
        { id: '#tab-mode-grid', mode: 'grid' },
        { id: '#tab-mode-quiz', mode: 'quiz' }
      ];
      tabs.forEach(t => {
        const el = this.stageSvg.querySelector(t.id);
        if (el) {
          const rect = el.querySelector('rect');
          const txt = el.querySelector('text');
          const isActive = t.mode === mode;
          if (rect) {
            rect.setAttribute('fill', isActive ? '#0284c7' : '#1e293b');
            rect.setAttribute('stroke', isActive ? '#38bdf8' : '#334155');
          }
          if (txt) {
            txt.setAttribute('fill', isActive ? '#ffffff' : '#94a3b8');
          }
        }
      });
      this.playAudioTone(440, 'sine', 0.08);
    }

    reciteTimesTable() {
      if (!this.stageSvg || this._ttIsReciting) return;
      this._ttIsReciting = true;
      const table = this._ttTable || 7;
      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50];

      for (let i = 1; i <= 12; i++) {
        setTimeout(() => {
          this._ttMultiplier = i;
          if (this.engine) this.engine.setVar('multiplier', i);
          const freq = pentatonic[(i - 1) % pentatonic.length];
          this.playAudioTone(freq, 'sine', 0.12, 0.22);
          this.renderTimesTablesGrid();

          if (i === 12) {
            setTimeout(() => {
              this._ttIsReciting = false;
            }, 300);
          }
        }, (i - 1) * 280);
      }
    }

    setupTimesTablesQuiz() {
      if (!this.stageSvg) return;
      const table = this._ttTable || 7;
      const mult = Math.floor(Math.random() * 12) + 1; // 1 to 12
      const correctAns = table * mult;

      this._ttQuizQuestion = { table, mult, correctAns };

      const prompt = this.stageSvg.querySelector('#tt-quiz-prompt');
      if (prompt) prompt.textContent = `${table} × ${mult} = ?`;

      const streakEl = this.stageSvg.querySelector('#tt-quiz-streak');
      if (streakEl) streakEl.textContent = `🔥 Streak: ${this._ttQuizStreak || 0}`;

      const set = new Set([correctAns]);
      while (set.size < 4) {
        const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? table : (Math.random() > 0.5 ? 2 : 10));
        const val = Math.max(1, correctAns + offset);
        set.add(val);
      }
      const options = Array.from(set).sort(() => Math.random() - 0.5);
      this._ttQuizOptions = options;

      for (let i = 0; i < 4; i++) {
        const valEl = this.stageSvg.querySelector(`#tt-quiz-val-${i}`);
        if (valEl) valEl.textContent = String(options[i]);
        const btn = this.stageSvg.querySelector(`[data-action="tt-quiz-answer"][data-idx="${i}"]`);
        if (btn) {
          const rect = btn.querySelector('rect');
          if (rect) {
            rect.setAttribute('fill', '#1e293b');
            rect.setAttribute('stroke', '#475569');
          }
        }
      }

      const msg = this.stageSvg.querySelector('#tt-quiz-msg');
      if (msg) {
        msg.textContent = 'Select the correct product to score!';
        msg.setAttribute('fill', '#38bdf8');
      }
    }

    handleQuizAnswer(idx, targetNode) {
      if (!this._ttQuizQuestion || !this._ttQuizOptions) return;
      const chosen = this._ttQuizOptions[idx];
      const isCorrect = (chosen === this._ttQuizQuestion.correctAns);

      const msg = this.stageSvg.querySelector('#tt-quiz-msg');
      const rect = targetNode ? targetNode.querySelector('rect') : null;

      if (isCorrect) {
        this._ttQuizStreak = (this._ttQuizStreak || 0) + 1;
        if (rect) {
          rect.setAttribute('fill', '#059669');
          rect.setAttribute('stroke', '#10b981');
        }
        if (msg) {
          msg.textContent = `⭐ Correct! ${this._ttQuizQuestion.table} × ${this._ttQuizQuestion.mult} = ${this._ttQuizQuestion.correctAns}!`;
          msg.setAttribute('fill', '#34d399');
        }
        this.playAudioTone(523.25, 'sine', 0.1, 0.2);
        setTimeout(() => this.playAudioTone(659.25, 'sine', 0.12, 0.2), 80);
        setTimeout(() => this.playAudioTone(783.99, 'sine', 0.16, 0.22), 160);

        setTimeout(() => {
          this.setupTimesTablesQuiz();
        }, 850);
      } else {
        this._ttQuizStreak = 0;
        if (rect) {
          rect.setAttribute('fill', '#991b1b');
          rect.setAttribute('stroke', '#ef4444');
        }
        if (msg) {
          msg.textContent = `Almost! Remember: ${this._ttQuizQuestion.table} × ${this._ttQuizQuestion.mult} = ${this._ttQuizQuestion.correctAns}`;
          msg.setAttribute('fill', '#f87171');
        }
        this.playAudioTone(220, 'sawtooth', 0.15, 0.2);
      }

      const streakEl = this.stageSvg.querySelector('#tt-quiz-streak');
      if (streakEl) streakEl.textContent = `🔥 Streak: ${this._ttQuizStreak || 0}`;
    }

    playMultiplesScale() {
      this.reciteTimesTable();
    }

    handleTimesTablesSplitterDrag(svgX) {
      // Legacy compatibility stub
    }

    // =========================================================================
    // Atomic Structure Bohr Shells & 18-Element Periodic Table Subsystem
    // =========================================================================
    setupAtomInteractivity() {
      if (!this.stageSvg) return;
      const z = (this.engine && this.engine.vars && Number(this.engine.vars.atomicNumber)) || 6;
      this.updateAtomElementUI(z, false);

      if (this.engine && typeof this.engine.on === 'function') {
        if (this._atomVarChangeHandler) {
          this.engine.off('varchange', this._atomVarChangeHandler);
        }
        this._atomVarChangeHandler = (data) => {
          if (data && (data.name === 'atomicNumber' || data.name === '*')) {
            const curZ = (this.engine.vars && Number(this.engine.vars.atomicNumber)) || 6;
            this.updateAtomElementUI(curZ, false);
          }
        };
        this.engine.on('varchange', this._atomVarChangeHandler);
      }
    }

    setAtomZ(newZ) {
      const z = Math.max(1, Math.min(18, Math.round(Number(newZ) || 1)));
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('atomicNumber', z);
      }
      this.updateAtomElementUI(z, true);
    }

    updateAtomElementUI(zVal, playSound = false) {
      if (!this.stageSvg) return;
      const z = Math.max(1, Math.min(18, Math.round(Number(zVal) || 6)));

      const ELEMENTS = [
        null,
        { sym: 'H', name: 'Hydrogen', mass: '1.008 u', cat: 'Reactive Non-metal (Gr 1)', shells: '1', val: 1, n: 0, color: '#38bdf8' },
        { sym: 'He', name: 'Helium', mass: '4.003 u', cat: 'Noble Gas (Gr 18)', shells: '2', val: 2, n: 2, color: '#c084fc' },
        { sym: 'Li', name: 'Lithium', mass: '6.940 u', cat: 'Alkali Metal (Gr 1)', shells: '2, 1', val: 1, n: 4, color: '#f87171' },
        { sym: 'Be', name: 'Beryllium', mass: '9.012 u', cat: 'Alkaline Earth (Gr 2)', shells: '2, 2', val: 2, n: 5, color: '#fb923c' },
        { sym: 'B', name: 'Boron', mass: '10.81 u', cat: 'Metalloid (Gr 13)', shells: '2, 3', val: 3, n: 6, color: '#34d399' },
        { sym: 'C', name: 'Carbon', mass: '12.011 u', cat: 'Reactive Nonmetal (Gr 14)', shells: '2, 4', val: 4, n: 6, color: '#38bdf8' },
        { sym: 'N', name: 'Nitrogen', mass: '14.007 u', cat: 'Reactive Nonmetal (Gr 15)', shells: '2, 5', val: 5, n: 7, color: '#38bdf8' },
        { sym: 'O', name: 'Oxygen', mass: '15.999 u', cat: 'Reactive Nonmetal (Gr 16)', shells: '2, 6', val: 6, n: 8, color: '#38bdf8' },
        { sym: 'F', name: 'Fluorine', mass: '18.998 u', cat: 'Halogen (Gr 17)', shells: '2, 7', val: 7, n: 10, color: '#facc15' },
        { sym: 'Ne', name: 'Neon', mass: '20.180 u', cat: 'Noble Gas (Gr 18)', shells: '2, 8', val: 8, n: 10, color: '#c084fc' },
        { sym: 'Na', name: 'Sodium', mass: '22.990 u', cat: 'Alkali Metal (Gr 1)', shells: '2, 8, 1', val: 1, n: 12, color: '#f87171' },
        { sym: 'Mg', name: 'Magnesium', mass: '24.305 u', cat: 'Alkaline Earth (Gr 2)', shells: '2, 8, 2', val: 2, n: 12, color: '#fb923c' },
        { sym: 'Al', name: 'Aluminium', mass: '26.982 u', cat: 'Post-Transition Metal (Gr 13)', shells: '2, 8, 3', val: 3, n: 14, color: '#93c5fd' },
        { sym: 'Si', name: 'Silicon', mass: '28.085 u', cat: 'Metalloid (Gr 14)', shells: '2, 8, 4', val: 4, n: 14, color: '#34d399' },
        { sym: 'P', name: 'Phosphorus', mass: '30.974 u', cat: 'Reactive Nonmetal (Gr 15)', shells: '2, 8, 5', val: 5, n: 16, color: '#38bdf8' },
        { sym: 'S', name: 'Sulfur', mass: '32.06 u', cat: 'Reactive Nonmetal (Gr 16)', shells: '2, 8, 6', val: 6, n: 16, color: '#38bdf8' },
        { sym: 'Cl', name: 'Chlorine', mass: '35.45 u', cat: 'Halogen (Gr 17)', shells: '2, 8, 7', val: 7, n: 18, color: '#facc15' },
        { sym: 'Ar', name: 'Argon', mass: '39.948 u', cat: 'Noble Gas (Gr 18)', shells: '2, 8, 8', val: 8, n: 22, color: '#c084fc' }
      ];

      const el = ELEMENTS[z] || ELEMENTS[6];

      // 1. Update Card Texts
      const cardZ = this.stageSvg.querySelector('#atom-card-z');
      if (cardZ) cardZ.textContent = String(z);

      const cardSym = this.stageSvg.querySelector('#atom-card-symbol');
      if (cardSym) {
        cardSym.textContent = el.sym;
        cardSym.setAttribute('fill', el.color);
      }

      const symBg = this.stageSvg.querySelector('#atom-symbol-bg');
      if (symBg) symBg.setAttribute('stroke', el.color);

      const cardName = this.stageSvg.querySelector('#atom-card-name');
      if (cardName) cardName.textContent = el.name;

      const cardMass = this.stageSvg.querySelector('#atom-card-mass');
      if (cardMass) cardMass.textContent = `Atomic Mass: ${el.mass}`;

      const cardShells = this.stageSvg.querySelector('#atom-card-shells');
      if (cardShells) cardShells.textContent = `Shells: ${el.shells} • Valence: ${el.val}`;

      const cardCat = this.stageSvg.querySelector('#atom-card-cat');
      if (cardCat) {
        cardCat.textContent = el.cat;
        cardCat.setAttribute('fill', el.color);
      }

      const catPill = this.stageSvg.querySelector('#atom-card-cat-pill');
      if (catPill) catPill.setAttribute('fill', el.color);

      // 2. Update Top Banner Legend
      const legendText = this.stageSvg.querySelector('#atom-legend-text');
      if (legendText) {
        legendText.textContent = `● ${z} Protons (+) | ● ${el.n} Neutrons (0) | ● ${z} Electrons (-) ➔ ${el.name} (${el.sym}-${Math.round(z + el.n)})`;
      }

      const kElectrons = Math.min(2, z);
      const lElectrons = Math.min(8, Math.max(0, z - 2));
      const mElectrons = Math.min(8, Math.max(0, z - 10));
      const configText = this.stageSvg.querySelector('#atom-config-text');
      if (configText) {
        configText.textContent = `Bohr Shell Distribution: K: ${kElectrons} | L: ${lElectrons} | M: ${mElectrons} (Valence Electrons: ${el.val})`;
      }

      // 3. Highlight Ribbon Chips
      const chips = this.stageSvg.querySelectorAll('.atom-elem-chip');
      chips.forEach(chip => {
        const cZ = Number(chip.getAttribute('data-z'));
        const rect = chip.querySelector('rect');
        const isCurrent = cZ === z;
        if (rect) {
          if (isCurrent) {
            rect.setAttribute('fill', '#0284c7');
            rect.setAttribute('stroke', '#38bdf8');
            rect.setAttribute('stroke-width', '2');
          } else {
            rect.setAttribute('fill', '#1e293b');
            rect.setAttribute('stroke', '#334155');
            rect.setAttribute('stroke-width', '1');
          }
        }
      });

      // 4. Update Particle Displays
      for (let p = 1; p <= 18; p++) {
        const pEl = this.stageSvg.querySelector(`#nucleus-p${p}`);
        if (pEl) pEl.setAttribute('display', p <= z ? 'inline' : 'none');
        const nEl = this.stageSvg.querySelector(`#nucleus-n${p}`);
        if (nEl) nEl.setAttribute('display', p <= el.n ? 'inline' : 'none');
      }

      // 5. Update Electron Displays
      const e1 = this.stageSvg.querySelector('#atom-e1');
      if (e1) e1.setAttribute('display', z >= 1 ? 'inline' : 'none');
      const e2 = this.stageSvg.querySelector('#atom-e2');
      if (e2) e2.setAttribute('display', z >= 2 ? 'inline' : 'none');

      for (let i = 0; i < 8; i++) {
        const oe = this.stageSvg.querySelector(`#atom-oe-${i}`);
        if (oe) oe.setAttribute('display', z >= 3 + i ? 'inline' : 'none');
        const me = this.stageSvg.querySelector(`#atom-me-${i}`);
        if (me) me.setAttribute('display', z >= 11 + i ? 'inline' : 'none');
      }

      // 6. Update M-Shell Rings
      const rm1 = this.stageSvg.querySelector('#atom-ring-m1');
      const rm2 = this.stageSvg.querySelector('#atom-ring-m2');
      if (rm1) rm1.setAttribute('display', z >= 11 ? 'inline' : 'none');
      if (rm2) rm2.setAttribute('display', z >= 11 ? 'inline' : 'none');

      // 7. Audio sonification tone
      if (playSound) {
        const baseFreq = 220 + z * 32;
        this.playAudioTone(baseFreq, 'sine', 0.04, 0.12);
      }
    }

    // =========================================================================
    // Spelling Bee Championship (KS1 to KS3) Interactive Subsystem
    // =========================================================================
    setupSpellingBeeInteractivity() {
      if (!this.stageSvg) return;

      this._beeWordBank = {
        KS1: [
          { word: 'friend', type: 'Noun • Common Exception Word', def: 'A person you know well and regard with affection and trust.', sentence: 'He walked to school with his best friend every morning.', phonics: 'f · r · i · e · n · d', hint: 'Mnemonic: A fri-end is with you to the end!' },
          { word: 'because', type: 'Conjunction • Phonics Rule', def: 'For the reason that; since.', sentence: 'She stayed inside because it was raining heavily.', phonics: 'be · cause', hint: 'Big Elephants Can Always Understand Small Elephants.' },
          { word: 'beautiful', type: 'Adjective • Suffix Rule', def: 'Pleasing the senses or mind aesthetically.', sentence: 'The garden was filled with beautiful blooming roses.', phonics: 'beau · ti · ful', hint: "French root 'beau' with suffix '-ful' (only one 'l')." },
          { word: 'climb', type: 'Verb • Silent Letter', def: 'Go or come up a slope or height.', sentence: 'The children love to climb the tall oak tree in the park.', phonics: 'c · l · i · m · b', hint: "Silent 'b' at the end of the word!" },
          { word: 'could', type: 'Modal Verb • National Curriculum', def: 'Used to express possibility or past ability.', sentence: 'They could hear the cathedral bells ringing across the town.', phonics: 'c · o · u · l · d', hint: 'O-U-L-D group (Oh U Lucky Duck) matches would and should.' },
          { word: 'school', type: 'Noun • Greek Root', def: 'An institution for educating children and pupils.', sentence: "St Joseph's is a welcoming and vibrant primary school.", phonics: 's · ch · oo · l', hint: "Spelled with 'ch' for the hard /k/ sound." },
          { word: 'thought', type: 'Noun/Verb • Trigraph Pattern', def: 'An idea or opinion produced by thinking.', sentence: 'She thought carefully before writing her final answer.', phonics: 'th · ough · t', hint: "Contains the 'ought' trigraph, like brought and bought." },
          { word: 'water', type: 'Noun • Common Exception', def: 'Clear liquid essential for all plant and animal life.', sentence: 'Remember to drink plenty of fresh water during sports day.', phonics: 'wa · ter', hint: "'a' makes an /aw/ sound following the 'w'." }
        ],
        KS2L: [
          { word: 'accident', type: 'Noun • Statutory Year 3/4', def: 'An unfortunate incident that happens unexpectedly and unintentionally.', sentence: 'He spilled his paint entirely by accident.', phonics: 'ac · ci · dent', hint: "Double 'c': hard /k/ followed by soft /s/ before 'i'." },
          { word: 'believe', type: 'Verb • Statutory Year 3/4', def: 'Accept that something is true, especially without proof.', sentence: 'We believe kindness makes our whole classroom community thrive.', phonics: 'be · lieve', hint: "'i' before 'e' except after 'c' rule applies here!" },
          { word: 'calendar', type: 'Noun • Statutory Year 3/4', def: 'A chart or series of pages showing days, weeks, and months.', sentence: 'Mark the upcoming Christmas feast on your school calendar.', phonics: 'cal · en · dar', hint: "Watch out for the ending: it ends in '-ar', not '-er'!" },
          { word: 'decide', type: 'Verb • Statutory Year 3/4', def: 'Come or bring to a resolution in the mind as a result of consideration.', sentence: 'Take a quiet moment to decide which library book to read.', phonics: 'de · cide', hint: "Soft 'c' followed by split vowel digraph 'i-e'." },
          { word: 'famous', type: 'Adjective • Statutory Year 3/4', def: 'Known about by many people across nations.', sentence: 'The famous astronomer studied the moons of Jupiter.', phonics: 'fa · mous', hint: "Root 'fame' drops the 'e' before adding suffix '-ous'." },
          { word: 'grammar', type: 'Noun • Statutory Year 3/4', def: 'The whole system and structure of a language.', sentence: 'Accurate grammar helps you communicate your ideas persuasively.', phonics: 'gram · mar', hint: "Double 'm' and ends in '-ar' (like calendar)!" },
          { word: 'island', type: 'Noun • Statutory Year 3/4', def: 'A piece of land entirely surrounded by water.', sentence: 'The historic Celtic abbey stood proudly on a tidal island.', phonics: 'is · land', hint: "Silent 's'! From Old English 'igland', influenced by Latin 'insula'." },
          { word: 'notice', type: 'Verb/Noun • Statutory Year 3/4', def: 'Become aware of or give attention to.', sentence: 'Did you notice the intricate geometric mosaic on the wall?', phonics: 'no · tice', hint: "Ends with '-ice', like practice and service." }
        ],
        KS2U: [
          { word: 'accommodate', type: 'Verb • Statutory Year 5/6', def: 'Provide lodging or sufficient space for; adapt or fit.', sentence: 'The hotel could accommodate up to two hundred wedding guests.', phonics: 'ac · com · mo · date', hint: "Double 'c' AND double 'm' (two cots, two mattresses)!" },
          { word: 'embarrass', type: 'Verb • Statutory Year 5/6', def: 'Cause someone to feel awkward, self-conscious, or ashamed.', sentence: 'Good leaders never embarrass others when they make a slip.', phonics: 'em · bar · rass', hint: "Double 'r' AND double 's' (two red roses, two sweet smiles)!" },
          { word: 'hierarchy', type: 'Noun • Statutory Year 5/6', def: 'A system in which members of an organization are ranked by status.', sentence: 'The feudal hierarchy placed the monarch at the very summit.', phonics: 'hier · ar · chy', hint: "From Greek 'hieros' (sacred) + 'arche' (rule). Starts with 'hier-'!" },
          { word: 'mischievous', type: 'Adjective • Statutory Year 5/6', def: 'Causing or showing a fondness for causing trouble in a playful way.', sentence: 'The mischievous kitten untangled the ball of knitting wool.', phonics: 'mis · chie · vous', hint: "Strictly 3 syllables: 'mis-chuh-vus' (never say or write 'mischievious')!" },
          { word: 'necessary', type: 'Adjective • Statutory Year 5/6', def: 'Required to be done, achieved, or present; needed; essential.', sentence: 'Consistent practice is necessary to master long division.', phonics: 'nec · es · sary', hint: "One Collar, two Sleeves (one 'c', double 's')!" },
          { word: 'rhythm', type: 'Noun • Statutory Year 5/6', def: 'A strong, regular repeated pattern of movement or sound.', sentence: 'The orchestra kept a triumphant rhythm throughout the movement.', phonics: 'rhy · thm', hint: 'No conventional vowels except y! (Rhythm Helps Your Two Mice).' },
          { word: 'privilege', type: 'Noun • Statutory Year 5/6', def: 'A special right, advantage, or immunity granted to a person or group.', sentence: 'It was a distinct privilege to represent our school in the finals.', phonics: 'priv · i · lege', hint: "Ends in '-lege' (not '-ledge') with two 'i' vowels!" },
          { word: 'conscious', type: 'Adjective • Statutory Year 5/6', def: 'Aware of and responding to one\'s surroundings; deliberate.', sentence: 'She made a conscious effort to include the new student at break.', phonics: 'con · scious', hint: "Latin 'scire' (to know) provides the 'sc' in 'conscious'." }
        ],
        KS3: [
          { word: 'photosynthesis', type: 'Noun • KS3 Science Academic', def: 'The biochemical process by which green plants synthesize glucose using sunlight.', sentence: 'Chloroplasts absorb photons to drive the reactions of photosynthesis.', phonics: 'pho · to · syn · the · sis', hint: "Greek 'photo' (light) + 'syn' (together) + 'thesis' (placing)." },
          { word: 'parliamentary', type: 'Adjective • KS3 Humanities', def: 'Relating to, enacted by, or suitable for a parliament.', sentence: 'The constitutional reform was passed after intense parliamentary debate.', phonics: 'par · lia · men · ta · ry', hint: "From French 'parler' (to speak); remember the 'ia' in parliament!" },
          { word: 'conscientious', type: 'Adjective • KS3 English/Etymology', def: 'Wishing to do one\'s work or duty thoroughly and diligently.', sentence: 'A conscientious student checks every science calculation twice.', phonics: 'con · sci · en · tious', hint: "Contains 'sc' in 'consci' followed by '-entious'!" },
          { word: 'questionnaire', type: 'Noun • KS3 English/French Root', def: 'A set of printed or written questions devised for a survey or study.', sentence: 'Each pupil completed the anonymous pastoral questionnaire.', phonics: 'ques · tion · naire', hint: "Double 'n' before the French suffix '-aire'!" },
          { word: 'metamorphosis', type: 'Noun • KS3 Biology/Literature', def: 'A change of the form or nature of a thing or person into a completely different one.', sentence: 'The tadpole undergoes a remarkable metamorphosis into an adult frog.', phonics: 'met · a · mor · pho · sis', hint: "Greek 'meta' (change) + 'morphe' (form) + '-osis'." },
          { word: 'ubiquitous', type: 'Adjective • KS3 Advanced Vocabulary', def: 'Present, appearing, or found everywhere simultaneously.', sentence: 'In the modern era, digital learning tools have become ubiquitous.', phonics: 'u · biq · ui · tous', hint: "From Latin 'ubique' (everywhere) -> 'ubiquit-' + '-ous'." }
        ]
      };

      this._beeKeyStage = this._beeKeyStage || 'KS2U';
      this._beeScore = this._beeScore || 0;
      this._beeStreak = this._beeStreak || 0;
      this._beeSpeechRate = this._beeSpeechRate || 0.95;
      this._beeTypedLetters = [];

      this.renderSpellingBeeKeyboard();
      this.attachSpellingBeeDirectListeners();
      this.pickNewSpellingBeeWord(false);

      // Attach physical keyboard listener once
      if (!this._beeKeyHandler) {
        this._beeKeyHandler = (e) => {
          if (!this.stageSvg || !this.stageSvg.querySelector('#bee-root')) return;
          if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
          const key = e.key;
          if (/^[a-zA-Z]$/.test(key)) {
            e.preventDefault();
            this.handleSpellingBeeAction('bee-press-key', null, key.toUpperCase());
          } else if (key === 'Backspace') {
            e.preventDefault();
            this.handleSpellingBeeAction('bee-backspace');
          } else if (key === 'Enter') {
            e.preventDefault();
            this.handleSpellingBeeAction('bee-submit');
          } else if (key === 'Escape') {
            this.handleSpellingBeeAction('bee-clear');
          }
        };
        window.addEventListener('keydown', this._beeKeyHandler);
      }

      // Ensure window focus on stage interaction
      const root = this.stageSvg.querySelector('#bee-root');
      if (root && !root._hasFocusHandler) {
        root._hasFocusHandler = true;
        root.addEventListener('pointerdown', () => {
          try { window.focus(); } catch {}
        });
      }
    }

    attachSpellingBeeDirectListeners() {
      if (!this.stageSvg) return;
      const beeActions = this.stageSvg.querySelectorAll('[data-action^="bee-"]');
      beeActions.forEach(btn => {
        if (!btn._hasBeeDirect) {
          btn._hasBeeDirect = true;
          btn.style.cursor = 'pointer';
          const trigger = (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            try { window.focus(); } catch {}
            const action = btn.getAttribute('data-action');
            if (action) {
              this.handleSpellingBeeAction(action, btn);
              const rect = btn.getBoundingClientRect();
              const svgPt = this.screenToSvg(rect.left + rect.width / 2, rect.top + rect.height / 2);
              this.createTouchRipple(svgPt.x, svgPt.y);
            }
          };
          btn.addEventListener('pointerdown', trigger);
          btn.addEventListener('click', trigger);
        }
      });
    }

    pickNewSpellingBeeWord(speak = true) {
      if (!this._beeWordBank) return;
      const list = this._beeWordBank[this._beeKeyStage] || this._beeWordBank.KS2U;
      const prevWord = this._beeCurrentWord ? this._beeCurrentWord.word : '';
      const pool = list.filter(w => w.word !== prevWord);
      this._beeCurrentWord = (pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : list[0]) || list[0];
      this._beeTypedLetters = [];

      this.renderSpellingBeeUI();
      this.attachSpellingBeeDirectListeners();
      if (speak) {
        setTimeout(() => this.speakSpellingWord('word'), 150);
      }
    }

    renderSpellingBeeKeyboard() {
      if (!this.stageSvg) return;

      const r1 = this.stageSvg.querySelector('#kb-row-1');
      if (r1 && !r1.children.length) {
        const letters1 = ['Q','W','E','R','T','Y','U','I','O','P'];
        let html1 = '';
        letters1.forEach((ch, idx) => {
          const x = idx * 72;
          html1 += `
            <g class="bee-key-btn" data-action="bee-press-key" data-key="${ch}" cursor="pointer" transform="translate(${x}, 0)">
              <rect width="64" height="34" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
              <text x="32" y="22" fill="#f8fafc" font-size="14" font-weight="800" text-anchor="middle">${ch}</text>
            </g>
          `;
        });
        r1.innerHTML = html1;
      }

      const r2 = this.stageSvg.querySelector('#kb-row-2');
      if (r2 && !r2.children.length) {
        const letters2 = ['A','S','D','F','G','H','J','K','L'];
        let html2 = '';
        letters2.forEach((ch, idx) => {
          const x = idx * 72;
          html2 += `
            <g class="bee-key-btn" data-action="bee-press-key" data-key="${ch}" cursor="pointer" transform="translate(${x}, 0)">
              <rect width="64" height="34" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
              <text x="32" y="22" fill="#f8fafc" font-size="14" font-weight="800" text-anchor="middle">${ch}</text>
            </g>
          `;
        });
        r2.innerHTML = html2;
      }

      const r3 = this.stageSvg.querySelector('#kb-row-3-letters');
      if (r3 && !r3.children.length) {
        const letters3 = ['Z','X','C','V','B','N','M'];
        let html3 = '';
        letters3.forEach((ch, idx) => {
          const x = idx * 66;
          html3 += `
            <g class="bee-key-btn" data-action="bee-press-key" data-key="${ch}" cursor="pointer" transform="translate(${x}, 0)">
              <rect width="58" height="36" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
              <text x="29" y="23" fill="#f8fafc" font-size="14" font-weight="800" text-anchor="middle">${ch}</text>
            </g>
          `;
        });
        r3.innerHTML = html3;
      }
    }

    renderSpellingBeeUI() {
      if (!this.stageSvg || !this._beeCurrentWord) return;
      const w = this._beeCurrentWord;

      // 1. Key Stage Buttons Highlight
      const ksBtns = this.stageSvg.querySelectorAll('.bee-ks-btn');
      ksBtns.forEach(btn => {
        const ksVal = btn.getAttribute('data-ks');
        const isActive = ksVal === this._beeKeyStage;
        const rect = btn.querySelector('rect');
        const text = btn.querySelector('text');
        if (rect) {
          rect.setAttribute('fill', isActive ? '#eab308' : '#1e293b');
          rect.setAttribute('stroke', isActive ? '#facc15' : '#334155');
          rect.setAttribute('stroke-width', isActive ? '1.5' : '1');
        }
        if (text) {
          text.setAttribute('fill', isActive ? '#0f172a' : '#cbd5e1');
          text.setAttribute('font-weight', isActive ? '900' : '800');
        }
      });

      // 2. Score & Streak Displays
      const scoreTxt = this.stageSvg.querySelector('#bee-score-txt');
      if (scoreTxt) scoreTxt.textContent = `Score: ${this._beeScore || 0}`;

      const streakTxt = this.stageSvg.querySelector('#bee-streak-txt');
      if (streakTxt) streakTxt.textContent = `🍯 Streak: ${this._beeStreak || 0}`;

      // 3. Clue & Definition Deck
      const typeEl = this.stageSvg.querySelector('#bee-clue-type');
      if (typeEl) typeEl.textContent = w.type;

      const defEl = this.stageSvg.querySelector('#bee-clue-definition');
      if (defEl) defEl.textContent = `"${w.def}"`;

      const sentEl = this.stageSvg.querySelector('#bee-clue-sentence-preview');
      if (sentEl) {
        const blanked = w.sentence.replace(new RegExp(w.word, 'gi'), '________');
        sentEl.textContent = `Sentence: "${blanked}"`;
      }

      const lCountEl = this.stageSvg.querySelector('#bee-letter-count');
      if (lCountEl) lCountEl.textContent = `${w.word.length} Letters`;

      const sCountEl = this.stageSvg.querySelector('#bee-syllable-count');
      if (sCountEl) {
        const syls = w.phonics.split('·').length;
        sCountEl.textContent = `${syls} Syllables`;
      }

      // 4. Feedback Banner reset
      const fb = this.stageSvg.querySelector('#bee-feedback-banner');
      if (fb) fb.style.display = 'none';

      // 5. Honeycomb Streak Meter (5 cells)
      for (let c = 1; c <= 5; c++) {
        const cell = this.stageSvg.querySelector(`#bee-cell-${c}`);
        if (cell) {
          const isFilled = (this._beeStreak || 0) >= c;
          cell.setAttribute('fill', isFilled ? '#facc15' : '#1e293b');
          cell.setAttribute('filter', isFilled ? 'url(#bee-amber-glow)' : '');
        }
      }

      // 6. Render Letter Slots
      this.renderSpellingBeeLetterSlots();
    }

    renderSpellingBeeLetterSlots() {
      if (!this.stageSvg || !this._beeCurrentWord) return;
      const slotsRoot = this.stageSvg.querySelector('#bee-letter-slots');
      if (!slotsRoot) return;

      const targetLen = this._beeCurrentWord.word.length;
      const typed = this._beeTypedLetters || [];
      const totalAvailW = 740;
      const slotW = Math.max(28, Math.min(46, Math.floor((totalAvailW - (targetLen - 1) * 6) / targetLen)));
      const gap = 6;
      const totalRowW = targetLen * slotW + (targetLen - 1) * gap;
      const startX = Math.max(0, Math.floor((totalAvailW - totalRowW) / 2));

      let html = '';
      for (let i = 0; i < targetLen; i++) {
        const x = startX + i * (slotW + gap);
        const letter = typed[i] || '';
        const isCurrent = i === typed.length;
        const isFilled = i < typed.length;

        const fill = isFilled ? '#1e293b' : (isCurrent ? '#0f172a' : '#090d16');
        const stroke = isFilled ? '#eab308' : (isCurrent ? '#38bdf8' : '#334155');
        const strokeWidth = isFilled || isCurrent ? '1.8' : '1';
        const dash = isCurrent ? 'stroke-dasharray="3 2"' : '';

        html += `
          <g transform="translate(${x}, 6)">
            <rect width="${slotW}" height="42" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" ${dash} />
            <text x="${slotW / 2}" y="28" fill="${isFilled ? '#ffffff' : '#475569'}" font-size="${slotW > 36 ? '20' : '16'}" font-weight="900" text-anchor="middle" font-family="system-ui, sans-serif">
              ${letter}
            </text>
          </g>
        `;
      }

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (svg && !doc.querySelector('parsererror')) {
          slotsRoot.replaceChildren(...svg.childNodes);
          return;
        }
      } catch {}
      slotsRoot.innerHTML = html;
    }

    handleSpellingBeeAction(action, targetNode, extraData) {
      if (action === 'bee-set-ks') {
        const ks = targetNode ? (targetNode.getAttribute('data-ks') || targetNode.closest('[data-ks]')?.getAttribute('data-ks')) : 'KS2U';
        if (ks) {
          this._beeKeyStage = ks;
          this.pickNewSpellingBeeWord(true);
          this.playAudioTone(440, 'triangle', 0.08);
        }
        return;
      }

      if (action === 'bee-speak-word') {
        this.speakSpellingWord('word');
        return;
      }

      if (action === 'bee-speak-sentence') {
        this.speakSpellingWord('sentence');
        return;
      }

      if (action === 'bee-speak-phonics') {
        this.speakSpellingWord('phonics');
        return;
      }

      if (action === 'bee-hint') {
        this.speakSpellingWord('hint');
        const fb = this.stageSvg.querySelector('#bee-feedback-banner');
        if (fb && this._beeCurrentWord) {
          fb.textContent = `💡 Hint: ${this._beeCurrentWord.hint}`;
          fb.setAttribute('fill', '#c084fc');
          fb.style.display = 'block';
        }
        return;
      }

      if (action === 'bee-skip') {
        this._beeStreak = 0;
        this.pickNewSpellingBeeWord(true);
        this.playAudioTone(330, 'sine', 0.08);
        return;
      }

      if (action === 'bee-toggle-speed') {
        this._beeSpeechRate = this._beeSpeechRate >= 1.0 ? 0.75 : 1.0;
        const lbl = this.stageSvg.querySelector('#bee-speed-lbl');
        if (lbl) lbl.textContent = `Speed: ${this._beeSpeechRate.toFixed(2)}× ${this._beeSpeechRate < 1 ? 'Slow' : 'Normal'}`;
        this.playAudioTone(520, 'sine', 0.05);
        this.speakSpellingWord('word');
        return;
      }

      if (action === 'bee-press-key') {
        const key = extraData || (targetNode ? (targetNode.getAttribute('data-key') || targetNode.closest('[data-key]')?.getAttribute('data-key')) : '');
        if (key && this._beeCurrentWord) {
          if (this._beeTypedLetters.length < this._beeCurrentWord.word.length) {
            this._beeTypedLetters.push(key.toUpperCase());
            this.renderSpellingBeeLetterSlots();
            this.playAudioTone(380 + this._beeTypedLetters.length * 28, 'sine', 0.03, 0.06);
          }
        }
        return;
      }

      if (action === 'bee-backspace') {
        if (this._beeTypedLetters.length > 0) {
          this._beeTypedLetters.pop();
          this.renderSpellingBeeLetterSlots();
          this.playAudioTone(280, 'sine', 0.04, 0.06);
        }
        return;
      }

      if (action === 'bee-clear') {
        this._beeTypedLetters = [];
        this.renderSpellingBeeLetterSlots();
        this.playAudioTone(240, 'triangle', 0.05);
        return;
      }

      if (action === 'bee-submit') {
        this.checkSpellingBeeAnswer();
        return;
      }
    }

    checkSpellingBeeAnswer() {
      if (!this._beeCurrentWord) return;
      const target = this._beeCurrentWord.word.trim().toLowerCase();
      const entered = (this._beeTypedLetters || []).join('').trim().toLowerCase();
      const fb = this.stageSvg.querySelector('#bee-feedback-banner');

      if (entered === target) {
        // Correct Answer!
        const earned = 20 + (this._beeStreak || 0) * 5;
        this._beeScore = (this._beeScore || 0) + earned;
        this._beeStreak = (this._beeStreak || 0) + 1;

        if (fb) {
          fb.textContent = `🌟 Brilliant! "${this._beeCurrentWord.word}" is spelled correctly! +${earned} Points!`;
          fb.setAttribute('fill', '#34d399');
          fb.style.display = 'block';
        }

        // Celebratory Audio Fanfare
        this.playAudioTone(523.25, 'sine', 0.1, 0.2);
        setTimeout(() => this.playAudioTone(659.25, 'sine', 0.12, 0.2), 70);
        setTimeout(() => this.playAudioTone(783.99, 'sine', 0.14, 0.2), 140);
        setTimeout(() => this.playAudioTone(1046.50, 'sine', 0.18, 0.35), 220);

        this.renderSpellingBeeUI();

        // Advance to next word
        setTimeout(() => {
          this.pickNewSpellingBeeWord(true);
        }, 1300);
      } else {
        // Misspelled
        this._beeStreak = 0;
        if (fb) {
          fb.textContent = `Almost! Target spelling: "${this._beeCurrentWord.word}" (${this._beeCurrentWord.phonics}). Try again!`;
          fb.setAttribute('fill', '#f87171');
          fb.style.display = 'block';
        }

        this.playAudioTone(220, 'sawtooth', 0.12, 0.2);
        this.renderSpellingBeeUI();
      }
    }

    speakSpellingWord(type = 'word') {
      if (typeof window === 'undefined') return;
      const wordObj = this._beeCurrentWord;
      if (!wordObj) return;

      let textToSpeak = '';
      if (type === 'word') {
        textToSpeak = wordObj.word;
      } else if (type === 'sentence') {
        textToSpeak = wordObj.sentence;
      } else if (type === 'phonics') {
        textToSpeak = wordObj.phonics.replace(/·/g, ', ');
      } else if (type === 'hint') {
        textToSpeak = wordObj.hint;
      }

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(textToSpeak);
          utter.rate = this._beeSpeechRate || 0.95;
          utter.pitch = 1.05;
          const voices = window.speechSynthesis.getVoices();
          const gbVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'));
          if (gbVoice) utter.voice = gbVoice;
          else utter.lang = 'en-GB';
          window.speechSynthesis.speak(utter);
        } catch {}
      }

      this.playAudioTone(type === 'word' ? 523.25 : 440, 'sine', 0.06, 0.12);
    }

    // =========================================================================
    // Phonics Laboratory (EYFS/KS1) Interactive Sound Buttons & Blending Mat
    // =========================================================================
    setupPhonicsLabInteractivity() {
      if (!this.stageSvg) return;

      const WORDS = [
        {
          word: 'cat',
          emoji: '🐱',
          tokens: [
            { g: 'c', p: '/k/', speech: 'kuh', soundName: 'k', tone: 520, isDigraph: false },
            { g: 'a', p: '/æ/', speech: 'ah', soundName: 'short a', tone: 440, isDigraph: false },
            { g: 't', p: '/t/', speech: 'tuh', soundName: 't', tone: 580, isDigraph: false }
          ],
          explanation: 'Short vowel /a/ with crisp unvoiced stops /k/ and /t/.'
        },
        {
          word: 'dog',
          emoji: '🐶',
          tokens: [
            { g: 'd', p: '/d/', speech: 'duh', soundName: 'd', tone: 480, isDigraph: false },
            { g: 'o', p: '/ɒ/', speech: 'off', soundName: 'short o', tone: 420, isDigraph: false },
            { g: 'g', p: '/g/', speech: 'guh', soundName: 'g', tone: 460, isDigraph: false }
          ],
          explanation: 'Voiced stop /d/, open short /o/, and voiced velar /g/.'
        },
        {
          word: 'sun',
          emoji: '☀️',
          tokens: [
            { g: 's', p: '/s/', speech: 'ssss', soundName: 's', tone: 620, isDigraph: false },
            { g: 'u', p: '/ʌ/', speech: 'uh', soundName: 'short u', tone: 440, isDigraph: false },
            { g: 'n', p: '/n/', speech: 'nnn', soundName: 'n', tone: 500, isDigraph: false }
          ],
          explanation: 'Continuous fricative /s/, short /u/, and nasal /n/.'
        },
        {
          word: 'ship',
          emoji: '🚢',
          tokens: [
            { g: 'sh', p: '/ʃ/', speech: 'shhh', soundName: 'consonant digraph sh', tone: 650, isDigraph: true },
            { g: 'i', p: '/ɪ/', speech: 'ih', soundName: 'short i', tone: 460, isDigraph: false },
            { g: 'p', p: '/p/', speech: 'puh', soundName: 'p', tone: 540, isDigraph: false }
          ],
          explanation: 'Consonant digraph "sh" (two letters, one sound — digraph dash!) with short /i/ and /p/.'
        },
        {
          word: 'rain',
          emoji: '🌧️',
          tokens: [
            { g: 'r', p: '/r/', speech: 'rrr', soundName: 'r', tone: 490, isDigraph: false },
            { g: 'ai', p: '/eɪ/', speech: 'ay', soundName: 'vowel digraph ai', tone: 580, isDigraph: true },
            { g: 'n', p: '/n/', speech: 'nnn', soundName: 'n', tone: 500, isDigraph: false }
          ],
          explanation: 'Vowel digraph "ai" makes the long /ay/ sound — represented with a sound dash.'
        },
        {
          word: 'fish',
          emoji: '🐟',
          tokens: [
            { g: 'f', p: '/f/', speech: 'fff', soundName: 'f', tone: 600, isDigraph: false },
            { g: 'i', p: '/ɪ/', speech: 'ih', soundName: 'short i', tone: 460, isDigraph: false },
            { g: 'sh', p: '/ʃ/', speech: 'shhh', soundName: 'consonant digraph sh', tone: 650, isDigraph: true }
          ],
          explanation: 'Continuous /f/, short /i/, and consonant digraph "sh" at the end of the word.'
        }
      ];

      this._phWords = WORDS;
      this._phWordIdx = 0;

      const PHONETIC_LOOKUP = {
        s: 'ssss', t: 'tuh', p: 'puh', d: 'duh', g: 'guh', c: 'kuh', k: 'kuh', ck: 'kuh',
        b: 'buh', h: 'huh', j: 'juh', w: 'wuh', y: 'yuh', ch: 'tch', sh: 'shhh', th: 'thuh',
        ng: 'ing', qu: 'kwuh', ph: 'fff', wh: 'wuh', m: 'mmm', n: 'nnn', r: 'rrr', l: 'lll',
        f: 'fff', v: 'vvv', z: 'zzz', o: 'off'
      };

      const speakPhoneme = (text, rate = 0.9) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const clean = (text || '').trim().toLowerCase();
            const resolved = PHONETIC_LOOKUP[clean] || text;
            const u = new SpeechSynthesisUtterance(resolved);
            u.rate = rate;
            u.pitch = 1.05;
            const voices = window.speechSynthesis.getVoices();
            const gb = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'));
            if (gb) u.voice = gb;
            else u.lang = 'en-GB';
            window.speechSynthesis.speak(u);
          } catch (_) {}
        }
      };

      const setBanner = (txt, color = '#38bdf8') => {
        const b = this.stageSvg.querySelector('#ph-banner-txt');
        if (b) {
          b.textContent = txt;
          b.setAttribute('fill', color);
        }
      };

      const renderCurrentWord = () => {
        const cur = WORDS[this._phWordIdx];
        if (!cur) return;

        const ids = ['c', 'a', 't'];
        cur.tokens.forEach((tok, idx) => {
          const letterId = ids[idx];
          const card = this.stageSvg.querySelector(`#ph-card-${letterId}`);
          const btn = this.stageSvg.querySelector(`#ph-btn-${letterId}`);

          if (card && card.parentNode) {
            const cardText = card.parentNode.querySelector('text:not([font-size="10"])');
            if (cardText) {
              cardText.textContent = tok.g;
              cardText.setAttribute('font-size', tok.g.length > 1 ? '50' : '64');
            }
          }
          if (btn && btn.parentNode) {
            const btnText = btn.parentNode.querySelector('text[font-size="10"]');
            if (btnText) btnText.textContent = tok.p;
            if (tok.isDigraph) {
              btn.setAttribute('r', '17');
              btn.setAttribute('stroke', '#a855f7');
              btn.setAttribute('fill', '#6b21a8');
            } else {
              btn.setAttribute('r', '14');
              btn.setAttribute('stroke', '#38bdf8');
              btn.setAttribute('fill', '#0284c7');
            }
          }
        });

        const res = this.stageSvg.querySelector('#ph-blended-result text');
        if (res) res.textContent = `"${cur.word}" ${cur.emoji}`;

        setBanner(`Sound Buttons: Press each pure sound button, then sweep across the arrow to blend into "${cur.word}"!`);
      };

      // Sound button click handlers
      const ids = ['c', 'a', 't'];
      ids.forEach((letterId, idx) => {
        const card = this.stageSvg.querySelector(`#ph-card-${letterId}`);
        const btn = this.stageSvg.querySelector(`#ph-btn-${letterId}`);
        const group = (card && card.parentNode) || (btn && btn.parentNode);

        if (group) {
          group.style.cursor = 'pointer';
          const onTrigger = (e) => {
            e.stopPropagation();
            const cur = WORDS[this._phWordIdx] || WORDS[0];
            const tok = cur.tokens[idx];
            if (!tok) return;

            if (btn) {
              btn.setAttribute('fill', '#38bdf8');
              setTimeout(() => {
                btn.setAttribute('fill', tok.isDigraph ? '#6b21a8' : '#0284c7');
              }, 300);
            }
            if (card) {
              card.setAttribute('stroke', '#4ade80');
              setTimeout(() => card.setAttribute('stroke', '#38bdf8'), 300);
            }

            this.playAudioTone(tok.tone, 'sine', 0.08, 0.15);
            speakPhoneme(tok.speech, 0.85);
            setBanner(`Pure sound: ${tok.p} (${tok.soundName}) — no schwa!`, '#4ade80');
          };

          group.addEventListener('pointerdown', onTrigger);
        }
      });

     // Blending Arrow & Finger Cursor click handler
const finger = this.stageSvg.querySelector('#ph-finger-cursor');
const arrowLine = finger && finger.parentNode;

if (arrowLine) {
  arrowLine.style.cursor = 'pointer';
  arrowLine.addEventListener('pointerdown', (e) => {
    e.stopPropagation();

    // Prevent re-trigger while currently sweeping
    if (this._isBlending) return;
    this._isBlending = true;

    if (this._sweepInterval) clearInterval(this._sweepInterval);

    const cur = WORDS[this._phWordIdx] || WORDS[0];
    let step = 0;

    this._sweepInterval = setInterval(() => {
      if (step < cur.tokens.length) {
        const tok = cur.tokens[step];
        const letterId = ids[step];
        const btn = this.stageSvg.querySelector(`#ph-btn-${letterId}`);

        if (btn) {
          btn.setAttribute('fill', '#38bdf8');
          setTimeout(() => {
            btn.setAttribute('fill', tok.isDigraph ? '#6b21a8' : '#0284c7');
          }, 220);
        }

        if (finger) {
          finger.setAttribute('cx', String(45 + step * 115));
        }

        this.playAudioTone(tok.tone, 'sine', 0.06, 0.12);
        step++;
      } else {
        clearInterval(this._sweepInterval);
        this._sweepInterval = null;
        this._isBlending = false;

        // Park finger neatly at the end of the word line
        if (finger) {
          finger.setAttribute('cx', String(45 + (cur.tokens.length - 1) * 115 + 40));
        }

        const res = this.stageSvg.querySelector('#ph-blended-result');
        if (res) res.setAttribute('opacity', '1');

        speakPhoneme(`${cur.word}! ${cur.word}!`, 0.95);
        setBanner(`🎉 Blended! /${cur.tokens.map(t => t.g).join('/ - /')}/ = "${cur.word}" ${cur.emoji}!`, '#4ade80');

        // Arpeggio chime (C5 - E5 - G5)
        this.playAudioTone(523.25, 'sine', 0.1, 0.2);
        setTimeout(() => this.playAudioTone(659.25, 'sine', 0.12, 0.2), 70);
        setTimeout(() => this.playAudioTone(783.99, 'sine', 0.16, 0.28), 140);
      }
    }, 280);
  });
}      }

      // Blended Result click -> cycles to next decodable word!
      const blendedRes = this.stageSvg.querySelector('#ph-blended-result');
      if (blendedRes) {
        blendedRes.style.cursor = 'pointer';
        blendedRes.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this._phWordIdx = (this._phWordIdx + 1) % WORDS.length;
          renderCurrentWord();
          this.playAudioTone(600, 'triangle', 0.08, 0.15);
        });
      }

      // Tricky Word card click handler
      const trickyCard = this.stageSvg.querySelector('text[fill="#fb7185"]')?.closest('g');
      if (trickyCard) {
        trickyCard.style.cursor = 'pointer';
        trickyCard.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.playAudioTone(380, 'sine', 0.1, 0.2);
          speakPhoneme('said. Tricky word! The letters a-i make a short e sound: said!');
          setBanner("Tricky Word: 'said' contains 'ai' making the short /e/ sound (sounds like 'sed')!", '#fb7185');
        });
      }

      // Sound Button notation rule card
      const rule1Card = this.stageSvg.querySelector('text[fill="#38bdf8"]')?.closest('g');
      if (rule1Card) {
        rule1Card.style.cursor = 'pointer';
        rule1Card.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.playAudioTone(440, 'sine', 0.08, 0.15);
          speakPhoneme('Sound button notation: A dot is for a single sound. A dash is for a digraph where two letters make one sound!');
          setBanner('Notation: Dot = Single phoneme (c, a, t). Dash = Digraph (sh, ch, ai).', '#38bdf8');
        });
      }

      // Pure Sounds rule card
      const rule2Card = this.stageSvg.querySelector('text[fill="#22d3ee"]')?.closest('g');
      if (rule2Card) {
        rule2Card.style.cursor = 'pointer';
        rule2Card.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.playAudioTone(480, 'sine', 0.08, 0.15);
          speakPhoneme('Pure sounds: Never add uh at the end. Say crisp k instead of kuh, and sharp t instead of tuh!');
          setBanner("Pure Sounds Invariant: Eliminate schwa (/uh/) to enable seamless synthetic blending!", '#22d3ee');
        });
      }
    }

    // =========================================================================
    // Catholic Rites & 24 Churches (Omnes Gentes) Interactive Liturgical Dial
    // =========================================================================
    setupCatholicRitesInteractivity() {
      if (!this.stageSvg) return;
      const knob = this.stageSvg.querySelector('#rite-selector-knob');
      const container = this.stageSvg.querySelector('#rite-selector-container');

      if (knob) {
        knob.style.cursor = 'ew-resize';
        knob.setAttribute('data-draggable', 'rite-selector');
        knob.setAttribute('data-pedagogical', 'rite-dial');
      }

      if (container && !container._hasRiteClicks) {
        container._hasRiteClicks = true;
        container.style.cursor = 'pointer';

        // Direct click on track or rite station ticks (1..6)
        container.addEventListener('pointerdown', (ev) => {
          if (ev.target.closest('#rite-selector-knob')) return;
          ev.preventDefault();
          ev.stopPropagation();
          const svgPt = this.screenToSvg(ev.clientX, ev.clientY);
          this.handleRiteSelectorClick(svgPt.x);
        });
      }

      // Add individual click handlers for stations 1..6 if present
      for (let i = 1; i <= 6; i++) {
        const btn = this.stageSvg.querySelector(`#station-${i}-btn`) || this.stageSvg.querySelector(`#tick-${i}-pill`);
        if (btn && !btn._hasStationClick) {
          btn._hasStationClick = true;
          btn.style.cursor = 'pointer';
          btn.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const targetX = 140 + (i - 1) * ((660 - 140) / 5);
            this.handleRiteSelectorClick(targetX);
          });
        }
      }
    }

    handleRiteSelectorDrag(svgX) {
      const minX = 140;
      const maxX = 660;
      const clampedX = Math.max(minX, Math.min(maxX, svgX));
      const knob = this.stageSvg.querySelector('#rite-selector-knob');
      if (knob) {
        knob.setAttribute('transform', `translate(${clampedX.toFixed(1)}, 18)`);
      }

      // Map clampedX (140..660) to stepped rite 1..6
      const ratio = (clampedX - minX) / (maxX - minX);
      const stepped = Math.max(1, Math.min(6, Math.round(1 + ratio * 5)));

      // Continuous 60 FPS real-time panoramic scroll along the 6 pavilions
      const continuousOffset = -ratio * 5 * 800;
      const strip = this.stageSvg.querySelector('#panoramic-rites-strip');
      if (strip) {
        strip.setAttribute('transform', `translate(${continuousOffset.toFixed(1)}, 0)`);
      }

      if (this.engine && typeof this.engine.setVar === 'function') {
        const curRite = this.engine.vars?.selectedRite;
        if (curRite !== stepped) {
          this.engine.setVar('selectedRite', stepped);
          const riteChimes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
          this.playAudioTone(riteChimes[stepped - 1] || 523.25, 'sine', 0.07, 0.16);
        }
      }

      if (this.engine) {
        this.engine.applyBindings(this.engine.progress);
      }
    }

    handleRiteSelectorClick(svgX) {
      const minX = 140;
      const maxX = 660;
      const clampedX = Math.max(minX, Math.min(maxX, svgX));
      const ratio = (clampedX - minX) / (maxX - minX);
      const stepped = Math.max(1, Math.min(6, Math.round(1 + ratio * 5)));
      const targetX = 140 + (stepped - 1) * ((660 - 140) / 5);

      const knob = this.stageSvg.querySelector('#rite-selector-knob');
      if (knob) {
        knob.setAttribute('transform', `translate(${targetX.toFixed(1)}, 18)`);
      }

      const targetOffset = -((stepped - 1) * 800);
      const strip = this.stageSvg.querySelector('#panoramic-rites-strip');
      if (strip) {
        strip.setAttribute('transform', `translate(${targetOffset.toFixed(1)}, 0)`);
      }

      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('selectedRite', stepped);
      }

      const riteTimes = [0.00, 0.20, 0.38, 0.56, 0.74, 0.90];
      const targetT = riteTimes[stepped - 1] || 0.00;
      if (this.engine && typeof this.engine.seek === 'function' && !this.engine.isPlaying) {
        this.engine.seek(targetT);
      } else if (this.engine) {
        this.engine.applyBindings(this.engine.progress);
      }

      const riteChimes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      this.playAudioTone(riteChimes[stepped - 1] || 523.25, 'sine', 0.12, 0.22);
      this.createTouchRipple(targetX, 433);
    }

    finishRiteSelectorDrag() {
      const curRite = (this.engine && this.engine.vars && this.engine.vars.selectedRite) || 1;
      const targetX = 140 + (curRite - 1) * ((660 - 140) / 5);
      const knob = this.stageSvg.querySelector('#rite-selector-knob');
      if (knob) {
        knob.setAttribute('transform', `translate(${targetX.toFixed(1)}, 18)`);
      }
      const targetOffset = -((curRite - 1) * 800);
      const strip = this.stageSvg.querySelector('#panoramic-rites-strip');
      if (strip) {
        strip.setAttribute('transform', `translate(${targetOffset.toFixed(1)}, 0)`);
      }
      const riteTimes = [0.00, 0.20, 0.38, 0.56, 0.74, 0.90];
      const targetT = riteTimes[curRite - 1] || 0.00;
      if (this.engine && typeof this.engine.seek === 'function' && !this.engine.isPlaying) {
        this.engine.seek(targetT);
      }
    }

    // =========================================================================
    // Nicene Creed Trinitarian Articles Dial Subsystem
    // =========================================================================
    setupNiceneCreedInteractivity() {
      if (!this.stageSvg) return;
      const slider = this.stageSvg.querySelector('#creed-trinity-slider');
      const track = this.stageSvg.querySelector('#creed-dial-container');
      if (slider) {
        slider.style.cursor = 'ew-resize';
        slider.setAttribute('data-draggable', 'creed-slider');
      }
      if (track && !track._hasCreedClicks) {
        track._hasCreedClicks = true;
        track.style.cursor = 'pointer';
        track.addEventListener('pointerdown', (ev) => {
          if (ev.target.closest('#creed-trinity-slider')) return;
          ev.preventDefault();
          ev.stopPropagation();
          const svgPt = this.screenToSvg(ev.clientX, ev.clientY);
          this.handleCreedSliderClick(svgPt.x);
        });
      }
    }

    handleCreedSliderDrag(svgX) {
      const minX = 175;
      const maxX = 585;
      const clampedX = Math.max(minX, Math.min(maxX, svgX));
      const slider = this.stageSvg.querySelector('#creed-trinity-slider');
      if (slider) slider.setAttribute('transform', `translate(${clampedX.toFixed(1)}, 17)`);

      const ratio = (clampedX - minX) / (maxX - minX);
      const article = Math.max(1, Math.min(3, Math.round(1 + ratio * 2)));
      if (this.engine && typeof this.engine.setVar === 'function') {
        if (this.engine.vars?.creedArticle !== article) {
          this.engine.setVar('creedArticle', article);
          const chimes = [523.25, 659.25, 783.99];
          this.playAudioTone(chimes[article - 1] || 523.25, 'sine', 0.08, 0.18);
        }
      }
      if (this.engine) this.engine.applyBindings(this.engine.progress);
    }

    handleCreedSliderClick(svgX) {
      const minX = 175;
      const maxX = 585;
      const clampedX = Math.max(minX, Math.min(maxX, svgX));
      const ratio = (clampedX - minX) / (maxX - minX);
      const article = Math.max(1, Math.min(3, Math.round(1 + ratio * 2)));
      const targetX = 175 + (article - 1) * 205;

      const slider = this.stageSvg.querySelector('#creed-trinity-slider');
      if (slider) slider.setAttribute('transform', `translate(${targetX.toFixed(1)}, 17)`);
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('creedArticle', article);
      }
      const times = [0.00, 0.45, 0.88];
      if (this.engine && typeof this.engine.seek === 'function' && !this.engine.isPlaying) {
        this.engine.seek(times[article - 1] || 0.00);
      } else if (this.engine) {
        this.engine.applyBindings(this.engine.progress);
      }
      const chimes = [523.25, 659.25, 783.99];
      this.playAudioTone(chimes[article - 1] || 523.25, 'sine', 0.12, 0.22);
      this.createTouchRipple(targetX, 437);
    }

    finishCreedSliderDrag() {
      const curArt = (this.engine && this.engine.vars && this.engine.vars.creedArticle) || 1;
      const targetX = 175 + (curArt - 1) * 205;
      const slider = this.stageSvg.querySelector('#creed-trinity-slider');
      if (slider) slider.setAttribute('transform', `translate(${targetX.toFixed(1)}, 17)`);
      const times = [0.00, 0.45, 0.88];
      if (this.engine && typeof this.engine.seek === 'function' && !this.engine.isPlaying) {
        this.engine.seek(times[curArt - 1] || 0.00);
      }
    }

    // =========================================================================
    // Ten Commandments Decalogue Two-Tablet Slider Subsystem
    // =========================================================================
    setupTenCommandmentsInteractivity() {
      if (!this.stageSvg) return;
      const knob = this.stageSvg.querySelector('#tablet-toggle-knob');
      const track = this.stageSvg.querySelector('#tablet-selector-container');
      if (knob) {
        knob.style.cursor = 'ew-resize';
        knob.setAttribute('data-draggable', 'tablet-knob');
      }
      if (track && !track._hasTabletClicks) {
        track._hasTabletClicks = true;
        track.style.cursor = 'pointer';
        track.addEventListener('pointerdown', (ev) => {
          if (ev.target.closest('#tablet-toggle-knob')) return;
          ev.preventDefault();
          ev.stopPropagation();
          const svgPt = this.screenToSvg(ev.clientX, ev.clientY);
          this.handleTabletKnobClick(svgPt.x);
        });
      }
    }

    handleTabletKnobDrag(svgX) {
      const minX = 260;
      const maxX = 530;
      const clampedX = Math.max(minX, Math.min(maxX, svgX));
      const knob = this.stageSvg.querySelector('#tablet-toggle-knob');
      if (knob) knob.setAttribute('transform', `translate(${clampedX.toFixed(1)}, 17)`);

      const tablet = clampedX < 395 ? 1 : 2;
      if (this.engine && typeof this.engine.setVar === 'function') {
        if (this.engine.vars?.selectedTablet !== tablet) {
          this.engine.setVar('selectedTablet', tablet);
          this.playAudioTone(tablet === 1 ? 440 : 554.37, 'sine', 0.08, 0.18);
        }
      }
      if (this.engine) this.engine.applyBindings(this.engine.progress);
    }

    handleTabletKnobClick(svgX) {
      const tablet = svgX < 395 ? 1 : 2;
      const targetX = tablet === 1 ? 260 : 530;
      const knob = this.stageSvg.querySelector('#tablet-toggle-knob');
      if (knob) knob.setAttribute('transform', `translate(${targetX.toFixed(1)}, 17)`);
      if (this.engine && typeof this.engine.setVar === 'function') {
        this.engine.setVar('selectedTablet', tablet);
      }
      const times = [0.20, 0.70];
      if (this.engine && typeof this.engine.seek === 'function' && !this.engine.isPlaying) {
        this.engine.seek(times[tablet - 1] || 0.20);
      } else if (this.engine) {
        this.engine.applyBindings(this.engine.progress);
      }
      this.playAudioTone(tablet === 1 ? 440 : 554.37, 'sine', 0.12, 0.22);
      this.createTouchRipple(targetX, 437);
    }

    finishTabletKnobDrag() {
      const curTab = (this.engine && this.engine.vars && this.engine.vars.selectedTablet) || 1;
      const targetX = curTab === 1 ? 260 : 530;
      const knob = this.stageSvg.querySelector('#tablet-toggle-knob');
      if (knob) knob.setAttribute('transform', `translate(${targetX.toFixed(1)}, 17)`);
      const times = [0.20, 0.70];
      if (this.engine && typeof this.engine.seek === 'function' && !this.engine.isPlaying) {
        this.engine.seek(times[curTab - 1] || 0.20);
      }
    }

    // =========================================================================
    // Sacred Objects Category Slider Subsystem
    // =========================================================================
    setupSacredObjectsInteractivity() {
      if (!this.stageSvg) return;
      const knob = this.stageSvg.querySelector('#category-slider-knob');
      const track = this.stageSvg.querySelector('#sacred-category-track') || (knob && knob.parentNode);
      if (knob) {
        knob.style.cursor = 'ew-resize';
        knob.setAttribute('data-draggable', 'category-knob');
      }
      if (track && !track._hasSacredClicks) {
        track._hasSacredClicks = true;
        track.style.cursor = 'pointer';
        track.addEventListener('pointerdown', (ev) => {
          if (ev.target.closest('#category-slider-knob')) return;
          ev.preventDefault();
          ev.stopPropagation();
          const svgPt = this.screenToSvg(ev.clientX, ev.clientY);
          this.handleCategoryKnobClick(svgPt.x);
        });
      }
    }

    handleCategoryKnobDrag(svgX) {
      const minX = 80;
      const maxX = 640;
      const clampedX = Math.max(minX, Math.min(maxX, svgX));
      const knob = this.stageSvg.querySelector('#category-slider-knob');
      if (knob) knob.setAttribute('transform', `translate(${clampedX.toFixed(1)}, 11)`);

      const ratio = (clampedX - minX) / (maxX - minX);
      const catIdx = Math.max(0, Math.min(4, Math.round(ratio * 4)));
      const milestones = [0.00, 0.20, 0.44, 0.68, 0.88];
      if (this.engine && typeof this.engine.seek === 'function' && !this.engine.isPlaying) {
        this.engine.seek(milestones[catIdx]);
      } else if (this.engine) {
        this.engine.applyBindings(this.engine.progress);
      }
    }

    handleCategoryKnobClick(svgX) {
      const minX = 80;
      const maxX = 640;
      const clampedX = Math.max(minX, Math.min(maxX, svgX));
      const ratio = (clampedX - minX) / (maxX - minX);
      const catIdx = Math.max(0, Math.min(4, Math.round(ratio * 4)));
      const targetX = 80 + catIdx * ((640 - 80) / 4);

      const knob = this.stageSvg.querySelector('#category-slider-knob');
      if (knob) knob.setAttribute('transform', `translate(${targetX.toFixed(1)}, 11)`);

      const milestones = [0.00, 0.20, 0.44, 0.68, 0.88];
      if (this.engine && typeof this.engine.seek === 'function') {
        this.engine.seek(milestones[catIdx]);
      }
      this.playAudioTone(440 + catIdx * 65, 'sine', 0.1, 0.2);
      this.createTouchRipple(targetX, 451);
    }

    finishCategoryKnobDrag() {
      const t = (this.engine && this.engine.progress) || 0;
      const milestones = [0.00, 0.20, 0.44, 0.68, 0.88];
      let closestIdx = 0;
      let minDiff = 999;
      milestones.forEach((m, idx) => {
        const diff = Math.abs(t - m);
        if (diff < minDiff) { minDiff = diff; closestIdx = idx; }
      });
      const targetX = 80 + closestIdx * ((640 - 80) / 4);
      const knob = this.stageSvg.querySelector('#category-slider-knob');
      if (knob) knob.setAttribute('transform', `translate(${targetX.toFixed(1)}, 11)`);
    }

    setupBbcMicroInteractivity() {
      // 1. Break Key - Reboots system, flashes cursor/CRT, plays dual-tone beep
      const breakKey = this.stageSvg.querySelector('#key-break');
      if (breakKey) {
        const onBreak = (e) => {
          if (e) e.stopPropagation();
          if (this.engine && this.engine.synth && typeof this.engine.synth.playBbcBeep === 'function') {
            this.engine.synth.playBbcBeep();
          } else {
            this.playAudioTone(1200, 'square', 0.08, 0.1);
            setTimeout(() => this.playAudioTone(800, 'square', 0.12, 0.1), 95);
          }
          // Flash CRT tube surface
          const screen = this.stageSvg.querySelector('#crt-screen');
          if (screen) {
            screen.setAttribute('fill', '#15803d');
            setTimeout(() => screen.setAttribute('fill', 'url(#crt-tube-grad)'), 80);
          }
          if (this.engine) {
            this.engine.seek(0);
            if (this.engine.vars) {
              this.engine.vars.progMode = 1;
            }
            this.engine.applyBindings(0);
          }
        };
        breakKey.addEventListener('pointerdown', onBreak);
        breakKey.addEventListener('click', onBreak);
      }

      // 2. Red Function Keys f0-f9
      for (let i = 0; i <= 9; i++) {
        const fnKey = this.stageSvg.querySelector(`#key-f${i}`);
        if (fnKey) {
          const onFnClick = (e) => {
            if (e) e.stopPropagation();
            this.playAudioTone(1400 + i * 80, 'square', 0.04, 0.1);
            if (this.engine && this.engine.vars) {
              if (i >= 1 && i <= 4) {
                this.engine.vars.progMode = i;
                this.engine.applyBindings(this.engine.progress || 0);
              }
            }
          };
          fnKey.addEventListener('pointerdown', onFnClick);
          fnKey.addEventListener('click', onFnClick);
        }
      }

      // 3. Spacebar mechanical thud & program step toggle
      const spacebar = this.stageSvg.querySelector('#key-spacebar');
      if (spacebar) {
        const onSpace = (e) => {
          if (e) e.stopPropagation();
          this.playAudioTone(180, 'triangle', 0.05, 0.15);
          if (this.engine && this.engine.vars) {
            this.engine.vars.progMode = (this.engine.vars.progMode % 4) + 1;
            this.engine.applyBindings(this.engine.progress || 0);
          }
        };
        spacebar.addEventListener('pointerdown', onSpace);
        spacebar.addEventListener('click', onSpace);
      }
    }
  }

  // Expose globally
  global.ASTDirectGestureSubsystem = ASTDirectGestureSubsystem;

})(typeof window !== 'undefined' ? window : globalThis);
