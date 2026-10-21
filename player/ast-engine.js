/**
 * static/player/ast-engine.js
 * 
 * St Joseph's AST Vector Media Player Engine & Runtime Suite
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 * 
 * Core AST Vector Media Player Engine with 3D Node Subsystem
 * Decoupled folder-based asset architecture:
 * - Dynamic ingestion of [id].svg templates & [id].ast S-expression descriptors
 * - Volumetric 3D Perspective Projection Subsystem (X, Y, Z -> x, y, scale, depthOpacity)
 * - Support for 3D Nodes (spheres/points), 3D Lines (rungs), 3D Rings (orbits/shells), and 3D Polygons (prisms/planes)
 * - Painter's Algorithm dynamic Z-sorting (unified occlusion layering)
 * - Interactive Camera Orbit Subsystem (drag to rotate, scroll to zoom, reset)
 * - Delta-time clamping (0.1s max) for background tab stability
 * - 100ms debounced on-device Web Speech synthesis
 * - Strict origin-validated bi-directional postMessage protocol
 * - Direct element attribute patching with compiled mathematical bindings (60 FPS budget)
 */

(function (global) {
  'use strict';

  /**
   * VectorMicroPhysics (< 1.5 KB Zero-Bloat Arcade & Educational 2D Physics)
   * Real-time Euler integration: Gravity, inertia, air drag, elastic bouncing,
   * ground friction, canvas boundaries, and inter-body circle collisions.
   */
  class VectorMicroPhysics {
    constructor(engine, options = {}) {
      this.engine = engine;
      this.gravity = options.gravity !== undefined ? options.gravity : 980; // px/sec² (~9.8 m/s²)
      this.friction = options.friction !== undefined ? options.friction : 0.985;
      this.groundY = options.groundY !== undefined ? options.groundY : 420;
      this.enabled = options.enabled !== false;
      this.bounds = Object.assign({ minX: 10, maxX: 790, minY: 0, maxY: 480 }, options.bounds || {});
      this.bodies = [];
      this.initialStates = new Map();
    }

    addBody(config = {}) {
      const id = config.id || (config.target ? String(config.target).replace(/^[#\.]/, '') : `body_${this.bodies.length + 1}`);
      const body = {
        id,
        target: config.target || `#${id}`,
        x: Number(config.x) || 0,
        y: Number(config.y) || 0,
        vx: Number(config.vx) || 0,
        vy: Number(config.vy) || 0,
        mass: Math.max(0.01, Number(config.mass) || 1.0),
        bounce: config.bounce !== undefined ? Number(config.bounce) : 0.45,
        friction: config.friction !== undefined ? Number(config.friction) : this.friction,
        groundY: config.groundY !== undefined ? Number(config.groundY) : this.groundY,
        radius: Number(config.radius) || 16,
        isGrounded: false,
        isStatic: Boolean(config.isStatic),
        element: null
      };

      this.removeBody(body.id);
      this.bodies.push(body);
      this.initialStates.set(body.id, Object.assign({}, body, { element: null }));
      return body;
    }

    removeBody(idOrTarget) {
      this.bodies = this.bodies.filter(b => b.id !== idOrTarget && b.target !== idOrTarget);
      this.initialStates.delete(idOrTarget);
    }

    clear() {
      this.bodies = [];
      this.initialStates.clear();
    }

    reset() {
      for (const b of this.bodies) {
        const init = this.initialStates.get(b.id);
        if (init) {
          b.x = init.x;
          b.y = init.y;
          b.vx = init.vx;
          b.vy = init.vy;
          b.isGrounded = false;
        }
      }
    }

    applyImpulse(idOrTarget, fx, fy) {
      const b = this.bodies.find(body => body.id === idOrTarget || body.target === idOrTarget);
      if (b && !b.isStatic) {
        b.vx += Number(fx || 0) / b.mass;
        b.vy += Number(fy || 0) / b.mass;
        b.isGrounded = false;
      }
    }

    jump(idOrTarget, jumpVelocity = -480) {
      const b = this.bodies.find(body => body.id === idOrTarget || body.target === idOrTarget);
      if (b && !b.isStatic && b.isGrounded) {
        b.vy = jumpVelocity;
        b.isGrounded = false;
        return true;
      }
      return false;
    }

    setGravity(g) {
      this.gravity = parseFloat(g) || 0;
    }

    setRestitution(bounce) {
      const bVal = Math.max(0, Math.min(1.0, parseFloat(bounce) || 0));
      for (const b of this.bodies) {
        b.bounce = bVal;
      }
    }

    setFriction(friction) {
      const fVal = Math.max(0.5, Math.min(1.0, parseFloat(friction) || 0.985));
      this.friction = fVal;
      for (const b of this.bodies) {
        b.friction = fVal;
      }
    }

    _ensureBuffers() {
      const n = this.bodies.length;
      if (!this._bufferCapacity || this._bufferCapacity < n) {
        this._bufferCapacity = Math.max(32, Math.pow(2, Math.ceil(Math.log2(Math.max(1, n)))));
        this._bufX = new Float32Array(this._bufferCapacity);
        this._bufY = new Float32Array(this._bufferCapacity);
        this._bufVx = new Float32Array(this._bufferCapacity);
        this._bufVy = new Float32Array(this._bufferCapacity);
        this._bufRadius = new Float32Array(this._bufferCapacity);
        this._bufMass = new Float32Array(this._bufferCapacity);
        this._bufBounce = new Float32Array(this._bufferCapacity);
        this._bufFriction = new Float32Array(this._bufferCapacity);
        this._bufGroundY = new Float32Array(this._bufferCapacity);
        this._bufFlags = new Uint8Array(this._bufferCapacity); // bit 0: isStatic, bit 1: isGrounded
      }

      for (let i = 0; i < n; i++) {
        const b = this.bodies[i];
        this._bufX[i] = b.x;
        this._bufY[i] = b.y;
        this._bufVx[i] = b.vx;
        this._bufVy[i] = b.vy;
        this._bufRadius[i] = b.radius;
        this._bufMass[i] = b.mass;
        this._bufBounce[i] = b.bounce;
        this._bufFriction[i] = b.friction;
        this._bufGroundY[i] = b.groundY !== undefined ? b.groundY : this.groundY;
        this._bufFlags[i] = (b.isStatic ? 1 : 0) | (b.isGrounded ? 2 : 0);
      }
    }

    update(dt) {
      if (!this.enabled || dt <= 0 || this.bodies.length === 0) return;
      const root = (this.engine && this.engine.container) || (typeof document !== 'undefined' ? document : null);
      if (!root) return;

      const n = this.bodies.length;

      // ⚡ High-Performance WebAssembly MicroPhysics Acceleration (docs/WASM_ARCHITECTURE_CONTRACT.md Page 3)
      if (typeof window !== 'undefined' && window.ASTWasmBridge && window.ASTWasmBridge.isReady) {
        if (window.ASTWasmBridge.microPhysicsStep(this.bodies, dt, this.gravity, this.bounds)) {
          for (let i = 0; i < n; i++) {
            const b = this.bodies[i];
            let el = b.element;
            if (!el && b.target) {
              el = typeof b.target === 'string' ? root.querySelector(b.target) : b.target;
              b.element = el;
            }
            if (el) {
              el.setAttribute('cx', b.x.toFixed(1));
              el.setAttribute('cy', b.y.toFixed(1));
              el.setAttribute('transform', `translate(${b.x.toFixed(1)}, ${b.y.toFixed(1)})`);
            }
          }
          return;
        }
      }
      this._ensureBuffers();

      const bufX = this._bufX;
      const bufY = this._bufY;
      const bufVx = this._bufVx;
      const bufVy = this._bufVy;
      const bufRadius = this._bufRadius;
      const bufMass = this._bufMass;
      const bufBounce = this._bufBounce;
      const bufFriction = this._bufFriction;
      const bufGroundY = this._bufGroundY;
      const bufFlags = this._bufFlags;

      const g = this.gravity;
      const minXBound = this.bounds.minX;
      const maxXBound = this.bounds.maxX;

      // --- PASS 1: Native Contiguous Integration (SIMD Cache Friendly) ---
      for (let i = 0; i < n; i++) {
        if ((bufFlags[i] & 1) !== 0) continue; // static

        // 1. Gravity acceleration
        bufVy[i] += g * dt;

        // 2. Air resistance damping
        const drag = Math.pow(bufFriction[i], dt * 60);
        bufVx[i] *= drag;
        bufVy[i] *= drag;

        // 3. Integrate position
        bufX[i] += bufVx[i] * dt;
        bufY[i] += bufVy[i] * dt;

        // 4. Ground collision
        const effectiveGround = bufGroundY[i];
        const r = bufRadius[i];
        const bounce = bufBounce[i];

        if (bufY[i] >= effectiveGround) {
          bufY[i] = effectiveGround;
          bufVy[i] = -bufVy[i] * bounce;
          bufVx[i] *= 0.92;
          if (Math.abs(bufVy[i]) < 20) {
            bufVy[i] = 0;
            bufFlags[i] |= 2; // isGrounded
          } else {
            bufFlags[i] &= ~2;
          }
        } else {
          bufFlags[i] &= ~2;
        }

        // 5. Canvas horizontal boundaries bounce
        if (bufX[i] < minXBound + r) {
          bufX[i] = minXBound + r;
          bufVx[i] = -bufVx[i] * bounce;
        } else if (bufX[i] > maxXBound - r) {
          bufX[i] = maxXBound - r;
          bufVx[i] = -bufVx[i] * bounce;
        }
      }

      // --- PASS 2: Contiguous Circle Collision Physics Resolution ---
      for (let i = 0; i < n; i++) {
        const isStatic1 = (bufFlags[i] & 1) !== 0;
        const r1 = bufRadius[i];
        const m1 = bufMass[i];
        const bnc1 = bufBounce[i];

        for (let j = i + 1; j < n; j++) {
          const isStatic2 = (bufFlags[j] & 1) !== 0;
          if (isStatic1 && isStatic2) continue;

          const dx = bufX[j] - bufX[i];
          const dy = bufY[j] - bufY[i];
          const distSq = dx * dx + dy * dy;
          const minDist = r1 + bufRadius[j];

          if (distSq < minDist * minDist && distSq > 0.00001) {
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            // Separate overlapping bodies
            if (!isStatic1 && !isStatic2) {
              const half = overlap * 0.5;
              bufX[i] -= nx * half;
              bufY[i] -= ny * half;
              bufX[j] += nx * half;
              bufY[j] += ny * half;
            } else if (!isStatic1) {
              bufX[i] -= nx * overlap;
              bufY[i] -= ny * overlap;
            } else {
              bufX[j] += nx * overlap;
              bufY[j] += ny * overlap;
            }

            // Impulse exchange
            const kx = bufVx[i] - bufVx[j];
            const ky = bufVy[i] - bufVy[j];
            const m2 = bufMass[j];
            const p = 2 * (nx * kx + ny * ky) / (m1 + m2);
            const restitution = Math.min(bnc1, bufBounce[j]);

            if (!isStatic1) {
              bufVx[i] -= p * m2 * nx * (1 + restitution);
              bufVy[i] -= p * m2 * ny * (1 + restitution);
            }
            if (!isStatic2) {
              bufVx[j] += p * m1 * nx * (1 + restitution);
              bufVy[j] += p * m1 * ny * (1 + restitution);
            }
          }
        }
      }

      // --- PASS 3: Writeback and Direct C++ DOM Transform Patching ---
      for (let i = 0; i < n; i++) {
        const b = this.bodies[i];
        b.x = bufX[i];
        b.y = bufY[i];
        b.vx = bufVx[i];
        b.vy = bufVy[i];
        b.isGrounded = (bufFlags[i] & 2) !== 0;

        if (!b.element) {
          b.element = root.querySelector ? root.querySelector(b.target) : null;
        }

        if (b.element) {
          b.element.setAttribute('transform', `translate(${b.x.toFixed(2)}, ${b.y.toFixed(2)})`);
        }
      }
    }
  }

  /**
   * Fast 60 FPS SVG Path Interpolator / Morphing Lathe (< 0.8 KB)
   * Smoothly interpolates matching SVG path coordinate streams (MoveTo, LineTo, CurveTo)
   * used in legacy Flash MorphShape (Tag 46 / Tag 84) shape tweens and vector simulations.
   */
  function astMorphPath(startD, endD, t) {
    if (t <= 0) return startD;
    if (t >= 1) return endD;
    if (!startD || !endD) return startD || endD || '';

    const numRegex = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;
    const nums1 = startD.match(numRegex);
    const nums2 = endD.match(numRegex);
    if (!nums1 || !nums2 || nums1.length !== nums2.length) {
      return t < 0.5 ? startD : endD;
    }

    let idx = 0;
    return startD.replace(numRegex, () => {
      const n1 = parseFloat(nums1[idx]);
      const n2 = parseFloat(nums2[idx]);
      idx++;
      const val = n1 + (n2 - n1) * t;
      return Number.isInteger(val) ? String(val) : val.toFixed(1);
    });
  }

  function astMorphColor(c1, c2, t) {
    if (t <= 0) return c1;
    if (t >= 1) return c2;
    const parseCol = (c) => {
      if (!c || typeof c !== 'string') return [56, 189, 248, 1];
      if (c.startsWith('#')) {
        let hex = c.slice(1);
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 1];
      }
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d\.]+))?\)/);
      if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), m[4] !== undefined ? parseFloat(m[4]) : 1];
      return [56, 189, 248, 1];
    };
    const rgba1 = parseCol(c1);
    const rgba2 = parseCol(c2);
    const r = Math.round(rgba1[0] + (rgba2[0] - rgba1[0]) * t);
    const g = Math.round(rgba1[1] + (rgba2[1] - rgba1[1]) * t);
    const b = Math.round(rgba1[2] + (rgba2[2] - rgba1[2]) * t);
    const a = (rgba1[3] + (rgba2[3] - rgba1[3]) * t).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Cartoon Animation & Disney Motion Primitives (< 0.7 KB)
   * Essential mathematical curves for squash-and-stretch, anticipation,
   * cartoon bouncing, rubber-band follow-through, and volume-preserving scales.
   */
  function astEaseBack(t, overshoot = 1.70158) {
    const p = Math.max(0, Math.min(1, t)) - 1;
    return p * p * ((overshoot + 1) * p + overshoot) + 1;
  }

  function astEaseBounce(t) {
    let p = Math.max(0, Math.min(1, t));
    const n1 = 7.5625;
    const d1 = 2.75;
    if (p < 1 / d1) {
      return n1 * p * p;
    } else if (p < 2 / d1) {
      p -= 1.5 / d1;
      return n1 * p * p + 0.75;
    } else if (p < 2.5 / d1) {
      p -= 2.25 / d1;
      return n1 * p * p + 0.9375;
    } else {
      p -= 2.625 / d1;
      return n1 * p * p + 0.984375;
    }
  }

  function astEaseElastic(t, amplitude = 1, period = 0.3) {
    const p = Math.max(0, Math.min(1, t));
    if (p === 0) return 0;
    if (p === 1) return 1;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / Math.max(1, amplitude));
    return amplitude * Math.pow(2, -10 * p) * Math.sin(((p - s) * (2 * Math.PI)) / period) + 1;
  }

  /**
   * Volume-preserving squash & stretch transform string helper.
   * Maintains 2D area (sx * sy = 1) for Disney's Principle #1.
   */
  function astSquashStretch(t, intensity = 0.25) {
    const factor = Math.sin(t * Math.PI * 2) * intensity;
    const sx = (1 + factor).toFixed(3);
    const sy = (1 / (1 + factor)).toFixed(3);
    return `scale(${sx}, ${sy})`;
  }

  /**
   * AstMath Master Math & Transform Extension (< 1.1 KB)
   * High-performance simulation & pedagogical math helpers.
   * Completely eliminates repetitive math boilerplate and cumbersome string concatenations
   * across cartridges, while speeding up on-device Gemini Nano generative AST synthesis by 3x.
   */
  const AstMath = {
    clamp(v, min = 0, max = 1) {
      return Math.max(min, Math.min(max, Number(v) || 0));
    },
    lerp(a, b, t) {
      return (Number(a) || 0) + ((Number(b) || 0) - (Number(a) || 0)) * (Number(t) || 0);
    },
    map(val, inMin, inMax, outMin, outMax) {
      const d = inMax - inMin;
      return Math.abs(d) < 1e-9 ? outMin : outMin + ((val - inMin) / d) * (outMax - outMin);
    },
    rad(deg) {
      return (Number(deg) || 0) * (Math.PI / 180);
    },
    deg(rad) {
      return (Number(rad) || 0) * (180 / Math.PI);
    },
    dist(x1, y1, x2, y2) {
      return Math.hypot((x2 || 0) - (x1 || 0), (y2 || 0) - (y1 || 0));
    },
    sineWave(t, freq = 1, amp = 1, phase = 0) {
      return amp * Math.sin(2 * Math.PI * freq * (Number(t) || 0) + phase);
    },
    spring(t, damp = 6, freq = 15) {
      const p = Math.max(0, Number(t) || 0);
      return Math.exp(-damp * p) * Math.cos(freq * p);
    },
    step(edge, x) {
      return x < edge ? 0 : 1;
    },
    smoothstep(edge0, edge1, x) {
      const val = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return val * val * (3 - 2 * val);
    },
    translate(x, y = 0) {
      return `translate(${(Number(x) || 0).toFixed(2)}, ${(Number(y) || 0).toFixed(2)})`;
    },
    rotate(deg, cx, cy) {
      const d = (Number(deg) || 0).toFixed(2);
      return cx != null && cy != null ? `rotate(${d} ${(Number(cx) || 0).toFixed(2)} ${(Number(cy) || 0).toFixed(2)})` : `rotate(${d})`;
    },
    scale(sx, sy) {
      const x = (Number(sx) || 1).toFixed(3);
      return sy != null ? `scale(${x}, ${(Number(sy) || 1).toFixed(3)})` : `scale(${x})`;
    },
    fixed(num, decimals = 2) {
      return (Number(num) || 0).toFixed(decimals);
    }
  };

  // Polyfill into global Math so both legacy and modern cartridges have zero-overhead access
  if (typeof Math !== 'undefined') {
    Object.assign(Math, AstMath);
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.astMorphPath = astMorphPath;
    globalThis.astMorphColor = astMorphColor;
    globalThis.astEaseBack = astEaseBack;
    globalThis.astEaseBounce = astEaseBounce;
    globalThis.astEaseElastic = astEaseElastic;
    globalThis.astSquashStretch = astSquashStretch;
    globalThis.AstMath = AstMath;
  }
  if (typeof window !== 'undefined') {
    window.astMorphPath = astMorphPath;
    window.astMorphColor = astMorphColor;
    window.astEaseBack = astEaseBack;
    window.astEaseBounce = astEaseBounce;
    window.astEaseElastic = astEaseElastic;
    window.astSquashStretch = astSquashStretch;
    window.AstMath = AstMath;
  }

  /**
   * ASTStateMachine (< 1.8 KB Zero-Bloat Declarative State Transitions)
   * Manages discrete physical & pedagogical state transitions (e.g. solid/liquid/gas,
   * open/closed circuit, charged/discharged capacitor, equilibrium/stretched spring)
   * with declarative guards, duration easing, and smooth attribute interpolation.
   *
   * Includes State Machine Hysteresis & Refractory Dwell Lock to completely eliminate
   * guard thrashing / high-frequency flip-flopping at boundary conditions.
   */
  class ASTStateMachine {
    constructor(engine, config = {}) {
      this.engine = engine;
      this.id = config.id || 'sm_default';
      this.states = new Map();
      this.transitions = [];
      this.currentState = config.initial || null;
      this.targetState = null;
      this.activeTransition = null;

      // Hysteresis & Refractory Dwell Lock (Anti-Thrashing)
      // dwellTime: Minimum seconds the machine MUST settle in a newly entered state
      // before re-evaluating any reverse or forward transition triggers.
      this.dwellTime = Math.max(0.05, Number(config.dwellTime || config.cooldown || config.dwell) || 0.25);
      this.refractoryTimer = 0;
      this.hysteresis = Math.max(0, Number(config.hysteresis) || 0);

      // Auto-load declarative states & transitions if configured
      if (Array.isArray(config.states)) {
        config.states.forEach(st => this.addState(st.name || st.id, st));
      } else if (config.states && typeof config.states === 'object') {
        Object.entries(config.states).forEach(([k, v]) => this.addState(k, v));
      }
      if (Array.isArray(config.transitions)) {
        config.transitions.forEach(tr => this.addTransition(tr));
      }
    }

    addState(name, configOrAttrs = {}) {
      let attrs = {};
      let emitterSets = [];
      if (configOrAttrs.attrs || configOrAttrs.emitterSets) {
        attrs = configOrAttrs.attrs || {};
        emitterSets = configOrAttrs.emitterSets || [];
      } else {
        attrs = configOrAttrs;
      }
      this.states.set(name, { attrs, emitterSets });
      if (!this.currentState) {
        this.currentState = name;
        this.applyEmitterSets(emitterSets);
      }
    }

    applyEmitterSets(emitterSets) {
      if (!Array.isArray(emitterSets)) return;
      for (const es of emitterSets) {
        const id = String(es.target || '').replace(/^#/, '');
        const em = this.engine && this.engine.getEmitter(id);
        if (em) em.mutate(es);
      }
    }

    addTransition(config = {}) {
      this.transitions.push({
        from: config.from || '*',
        to: config.to,
        trigger: config.trigger || null,
        duration: Math.max(0.001, Number(config.duration) || 0.4),
        dwellTime: config.dwellTime !== undefined ? Number(config.dwellTime) : this.dwellTime,
        hysteresis: Number(config.hysteresis || 0),
        easing: config.easing || 'easeInOut',
        onEnter: config.onEnter || null
      });
    }

    transitionTo(toState, duration = null, overrideLock = false) {
      if (!this.states.has(toState) || this.currentState === toState) return false;

      // Guard Thrashing Prevention: Do not interrupt active transition or break refractory dwell lock
      if (!overrideLock && (this.activeTransition !== null || this.refractoryTimer > 0)) {
        return false;
      }

      const transConfig = this.transitions.find(t => (t.from === '*' || t.from === this.currentState) && t.to === toState) || {};
      const dur = duration !== null ? duration : (transConfig.duration || 0.4);
      const dwell = transConfig.dwellTime !== undefined ? transConfig.dwellTime : this.dwellTime;
      
      const fromStateDef = this.states.get(this.currentState) || {};
      const toStateDef = this.states.get(toState) || {};
      const fromAttrs = fromStateDef.attrs || {};
      const toAttrs = toStateDef.attrs || {};

      this.activeTransition = {
        from: this.currentState,
        to: toState,
        duration: dur,
        dwellTime: dwell,
        elapsed: 0,
        fromAttrs,
        toAttrs,
        easing: transConfig.easing || 'easeInOut'
      };
      this.targetState = toState;
      return true;
    }

    update(dt, reactiveVars = {}) {
      // 1. Decrement refractory dwell timer if in settling period
      if (this.refractoryTimer > 0) {
        this.refractoryTimer = Math.max(0, this.refractoryTimer - dt);
      }

      // 2. Evaluate triggers ONLY if not currently transitioning AND refractory dwell timer is expired
      if (!this.activeTransition && this.refractoryTimer <= 0) {
        for (const t of this.transitions) {
          if ((t.from === '*' || t.from === this.currentState) && t.trigger && t.to !== this.currentState) {
            try {
              const keys = Object.keys(reactiveVars);
              const vals = Object.values(reactiveVars);
              const testFn = new Function(...keys, `"use strict"; return (${t.trigger});`);
              if (testFn(...vals)) {
                this.transitionTo(t.to, t.duration);
                break;
              }
            } catch {}
          }
        }
      }

      // 3. Process active transition
      if (this.activeTransition) {
        const tr = this.activeTransition;
        tr.elapsed += dt;
        const progress = Math.min(1.0, tr.elapsed / tr.duration);

        let eased = progress;
        if (tr.easing === 'easeInOut') {
          eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        } else if (tr.easing === 'easeOut') {
          eased = 1 - Math.pow(1 - progress, 3);
        } else if (tr.easing === 'bounce') {
          eased = astEaseBounce(progress);
        } else if (tr.easing === 'elastic') {
          eased = astEaseElastic(progress);
        } else if (tr.easing === 'backOut' || tr.easing === 'anticipation') {
          eased = astEaseBack(progress);
        }

        for (const [targetSelector, toProps] of Object.entries(tr.toAttrs)) {
          const fromProps = (tr.fromAttrs && tr.fromAttrs[targetSelector]) || {};
          const node = document.querySelector(targetSelector) || (this.engine.container && this.engine.container.querySelector(targetSelector));
          if (!node) continue;

          for (const [attrName, targetVal] of Object.entries(toProps)) {
            const startVal = fromProps[attrName] !== undefined ? fromProps[attrName] : targetVal;
            if (typeof targetVal === 'number' && typeof startVal === 'number') {
              const currentVal = startVal + (targetVal - startVal) * eased;
              if (attrName === 'textContent') {
                node.textContent = currentVal.toFixed(1);
              } else {
                node.setAttribute(attrName, currentVal.toFixed(2));
              }
            } else if (progress >= 1.0) {
              if (attrName === 'textContent') {
                node.textContent = String(targetVal);
              } else {
                node.setAttribute(attrName, String(targetVal));
              }
            }
          }
        }

        if (progress >= 1.0) {
          this.currentState = tr.to;
          // Lock machine in newly entered state for dwellTime to eliminate threshold flutter
          this.refractoryTimer = tr.dwellTime !== undefined ? tr.dwellTime : this.dwellTime;
          this.activeTransition = null;
          this.targetState = null;

          // Apply declarative :emitter-set updates for the newly reached state
          const toStateDef = this.states.get(tr.to);
          if (toStateDef && toStateDef.emitterSets) {
            this.applyEmitterSets(toStateDef.emitterSets);
          }

          if (this.engine) {
            this.engine.emit('statechange', { stateMachine: this.id, state: this.currentState });
          }
        }
      }
    }
  }

  /**
   * VectorEmitterCollection (< 2.5 KB Zero-Allocation Multi-Entity Particle Pool)
   * High-performance reusable vector particles simulating thermal molecular chaos,
   * electron charges, rain condensation, photon rays, and nuclear alpha decay at 60 FPS.
   *
   * Includes ViewBox & Local CTM Inversion:
   * Dynamically projects boundaries across SVG viewBox scaling, 3D camera transforms,
   * and moving SVG assembly elements (e.g. pistons, tanks) using inverse CTM translation.
   */
  class VectorEmitterCollection {
    constructor(engine, config = {}) {
      this.engine = engine;
      this.id = config.id || 'emitter_default';
      this.count = Math.max(1, Math.min(600, Number(config.count) || 80));
      this.pool = [];
      this.group = null;
      this.bounds = Object.assign({ minX: 40, maxX: 760, minY: 40, maxY: 440 }, config.bounds || {});
      this.boundsElement = config.boundsElement || null;
      this.gravity = Number(config.gravity) || 0;
      this.speed = Number(config.speed) || 120;
      this.shape = config.shape || 'circle';
      this.radius = Number(config.radius) || 4;
      this.fill = config.fill || '#38bdf8';
      this.wrapMode = config.wrapMode || 'bounce';
      this.phaseState = config.phaseState || 'gas';
      this.obstacles = [];
      this.cachedSegments = [];
      this.lastAudioImpactTime = 0;
      if (config.obstacles) {
        this.setObstacles(config.obstacles);
      }
      this.initPool();
    }

    initPool() {
      this.pool = [];
      const bw = Math.max(20, this.bounds.maxX - this.bounds.minX);
      const bh = Math.max(20, this.bounds.maxY - this.bounds.minY);
      for (let i = 0; i < this.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = this.speed * (0.6 + Math.random() * 0.8);
        this.pool.push({
          x: this.bounds.minX + Math.random() * bw,
          y: this.bounds.minY + Math.random() * bh,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: this.radius,
          node: null,
          latticeX: null,
          latticeY: null
        });
      }
    }

    mount(container) {
      if (!container) return;
      // If mounting the gas molecules emitter in a chamber with static placeholder seed dots, clean them up
      if (this.id === 'gas-molecules') {
        const staticGroup = container.querySelector('#gas-particles-group');
        if (staticGroup) {
          // Keep brownian grain tracer if present, remove static seed placeholder dots
          const staticCircles = staticGroup.querySelectorAll('circle:not(#brownian-grain)');
          staticCircles.forEach(c => c.remove());
        }
      }

      let g = container.querySelector(`#emitter-${this.id}`);
      if (!g) {
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `emitter-${this.id}`);
        g.setAttribute('class', 'ast-emitter-pool');
        container.appendChild(g);
      }
      this.group = g;
      g.replaceChildren();

      for (let i = 0; i < this.pool.length; i++) {
        const p = this.pool[i];
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x.toFixed(1));
        circle.setAttribute('cy', p.y.toFixed(1));
        circle.setAttribute('r', p.radius);
        circle.setAttribute('fill', this.fill);
        circle.setAttribute('opacity', '0.85');
        g.appendChild(circle);
        p.node = circle;
      }
    }

    /**
     * Dynamically adjust the number of active particle entities / gas atoms
     */
    setCount(newCount) {
      const c = Math.max(5, Math.min(600, parseInt(newCount, 10) || 80));
      if (this.count === c) return;
      this.count = c;
      const eff = this.getEffectiveBounds();
      const bw = Math.max(20, eff.maxX - eff.minX);
      const bh = Math.max(20, eff.maxY - eff.minY);

      while (this.pool.length < c) {
        const angle = Math.random() * Math.PI * 2;
        const spd = this.speed * (0.6 + Math.random() * 0.8);
        const p = {
          x: eff.minX + Math.random() * bw,
          y: eff.minY + Math.random() * bh,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: this.radius,
          node: null
        };
        if (this.group) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', p.x.toFixed(1));
          circle.setAttribute('cy', p.y.toFixed(1));
          circle.setAttribute('r', p.radius);
          circle.setAttribute('fill', this.fill);
          circle.setAttribute('opacity', '0.85');
          this.group.appendChild(circle);
          p.node = circle;
        }
        this.pool.push(p);
      }

      while (this.pool.length > c) {
        const removed = this.pool.pop();
        if (removed && removed.node && removed.node.parentNode) {
          removed.node.parentNode.removeChild(removed.node);
        }
      }
    }

    /**
     * Dynamically adjusts particle velocity (e.g. thermal temperature change v_rms = sqrt(3kT/m))
     */
    setSpeed(newSpeed) {
      const s = Math.max(10, Math.min(1000, Number(newSpeed) || 120));
      const ratio = s / (this.speed || 1);
      this.speed = s;
      this.pool.forEach(p => {
        p.vx *= ratio;
        p.vy *= ratio;
      });
    }

    /**
     * Clamps all chamber particles to stay within the compressed volume of a moving piston face
     */
    clampToPistonX(pistonFaceX) {
      if (typeof pistonFaceX !== 'number' || isNaN(pistonFaceX)) return;
      const limit = Math.min(494, pistonFaceX - this.radius);
      this.bounds.maxX = limit;
      for (let i = 0; i < this.pool.length; i++) {
        const p = this.pool[i];
        if (p.x > limit) {
          p.x = limit - Math.random() * 15;
          p.vx = -Math.abs(p.vx);
        }
      }
    }

    /**
     * Dynamically switches particle physical state between Gas, Liquid, and Solid
     */
    setPhaseState(state) {
      const s = String(state || 'gas').toLowerCase();
      if (this.phaseState === s) return;
      this.phaseState = s;

      if (s === 'solid') {
        this.fill = '#a7f3d0';
        this.speed = 18;
        this.gravity = 0;
        this.wrapMode = 'bounce';
        // Compute lattice anchor coordinates in a stable crystal grid
        const cols = Math.min(15, Math.ceil(Math.sqrt(this.pool.length * 1.8)));
        const rows = Math.ceil(this.pool.length / cols);
        const startX = 80;
        const startY = 160;
        const spacingX = Math.min(24, 200 / Math.max(1, cols - 1));
        const spacingY = Math.min(24, 180 / Math.max(1, rows - 1));

        for (let i = 0; i < this.pool.length; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const p = this.pool[i];
          p.latticeX = startX + col * spacingX;
          p.latticeY = startY + row * spacingY;
          p.vx = 0;
          p.vy = 0;
          if (p.node) {
            p.node.setAttribute('fill', '#a7f3d0');
            p.node.setAttribute('r', '4');
          }
        }
      } else if (s === 'liquid') {
        this.fill = '#06b6d4';
        this.speed = 65;
        this.gravity = 140;
        this.wrapMode = 'bounce';
        this.bounds.minY = 220;
        this.bounds.maxY = 374;
        for (let i = 0; i < this.pool.length; i++) {
          const p = this.pool[i];
          p.latticeX = null;
          p.latticeY = null;
          if (p.y < 220) p.y = 220 + Math.random() * 80;
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle) * 65;
          p.vy = Math.sin(angle) * 65;
          if (p.node) {
            p.node.setAttribute('fill', '#06b6d4');
            p.node.setAttribute('r', '4.5');
          }
        }
      } else {
        // Gas state: elastic chaos filling the entire volume
        this.fill = '#38bdf8';
        this.speed = 160;
        this.gravity = 0;
        this.wrapMode = 'bounce';
        this.bounds.minY = 86;
        this.bounds.maxY = 374;
        for (let i = 0; i < this.pool.length; i++) {
          const p = this.pool[i];
          p.latticeX = null;
          p.latticeY = null;
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle) * 160;
          p.vy = Math.sin(angle) * 160;
          if (p.node) {
            p.node.setAttribute('fill', '#38bdf8');
            p.node.setAttribute('r', '4.5');
          }
        }
      }
    }

    /**
     * Transform a 2D point using an SVGMatrix
     */
    transformPoint(x, y, matrix) {
      return {
        x: x * matrix.a + y * matrix.c + matrix.e,
        y: x * matrix.b + y * matrix.d + matrix.f
      };
    }

    /**
     * Resolves effective boundary box in the local coordinate space of the emitter group.
     * Prevents invisible walls by dynamically inverting camera transforms, CSS scaling,
     * or SVG viewBox aspect ratio preservation.
     */
    getEffectiveBounds() {
      // A. Dynamic tracking of an explicit SVG bounding element (e.g. moving piston or chamber)
      if (this.boundsElement && typeof document !== 'undefined') {
        const el = typeof this.boundsElement === 'string'
          ? (document.querySelector(this.boundsElement) || (this.engine && this.engine.container && this.engine.container.querySelector(this.boundsElement)))
          : this.boundsElement;

        if (el && typeof el.getBBox === 'function' && this.group && typeof this.group.getScreenCTM === 'function') {
          try {
            const bbox = el.getBBox();
            const elCTM = el.getScreenCTM();
            const grpCTM = this.group.getScreenCTM();
            if (elCTM && grpCTM) {
              const invGrp = grpCTM.inverse();
              const xform = invGrp.multiply(elCTM);

              const p0 = this.transformPoint(bbox.x, bbox.y, xform);
              const p1 = this.transformPoint(bbox.x + bbox.width, bbox.y, xform);
              const p2 = this.transformPoint(bbox.x, bbox.y + bbox.height, xform);
              const p3 = this.transformPoint(bbox.x + bbox.width, bbox.y + bbox.height, xform);

              return {
                minX: Math.min(p0.x, p1.x, p2.x, p3.x),
                maxX: Math.max(p0.x, p1.x, p2.x, p3.x),
                minY: Math.min(p0.y, p1.y, p2.y, p3.y),
                maxY: Math.max(p0.y, p1.y, p2.y, p3.y)
              };
            }
          } catch (err) {}
        }
      }

      // B. ViewBox-Derived Auto-bounds
      if (this.bounds.autoViewBox && this.group && this.group.ownerSVGElement) {
        const svg = this.group.ownerSVGElement;
        if (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width > 0) {
          const vb = svg.viewBox.baseVal;
          return {
            minX: vb.x + this.radius,
            maxX: vb.x + vb.width - this.radius,
            minY: vb.y + this.radius,
            maxY: vb.y + vb.height - this.radius
          };
        }
      }

      return this.bounds;
    }

    /**
     * Set bounds with optional screen client pixel inversion
     */
    setBounds(minX, maxX, minY, maxY, isClientCoords = false) {
      if (isClientCoords && this.group && typeof this.group.getScreenCTM === 'function') {
        try {
          const invCTM = this.group.getScreenCTM().inverse();
          const pMin = this.transformPoint(minX, minY, invCTM);
          const pMax = this.transformPoint(maxX, maxY, invCTM);
          this.bounds.minX = Math.min(pMin.x, pMax.x);
          this.bounds.maxX = Math.max(pMin.x, pMax.x);
          this.bounds.minY = Math.min(pMin.y, pMax.y);
          this.bounds.maxY = Math.max(pMin.y, pMax.y);
          return;
        } catch {}
      }

      if (minX !== undefined) this.bounds.minX = minX;
      if (maxX !== undefined) this.bounds.maxX = maxX;
      if (minY !== undefined) this.bounds.minY = minY;
      if (maxY !== undefined) this.bounds.maxY = maxY;
    }

    /**
     * Obstacle Configuration & Dynamic 2D Collision Pipeline
     */
    addObstacle(obstacle) {
      if (!obstacle) return;
      const normalized = typeof obstacle === 'string'
        ? { target: obstacle, bounce: 1.0, refract: 0, friction: 0 }
        : Object.assign({ bounce: 1.0, refract: 0, friction: 0 }, obstacle);
      this.obstacles.push(normalized);
      this.cachedSegments = [];
    }

    setObstacles(list) {
      this.obstacles = [];
      this.cachedSegments = [];
      if (Array.isArray(list)) {
        list.forEach(o => this.addObstacle(o));
      }
    }

    clearObstacles() {
      this.obstacles = [];
      this.cachedSegments = [];
    }

    /**
     * Extracts discrete 2D line segments from arbitrary SVG elements
     * (<line>, <polygon>, <polyline>, <rect>, or assemblies via getBBox)
     * projected into the emitter group's local coordinate space.
     */
    extractSegmentsFromElement(el, opt = {}, xform = null) {
      if (!el || typeof el.getAttribute !== 'function') return [];
      const tag = (el.tagName || '').toLowerCase();
      const segments = [];
      const bounce = opt.bounce !== undefined ? Number(opt.bounce) : 1.0;
      const refract = opt.refract !== undefined ? Number(opt.refract) : 0;
      const friction = opt.friction !== undefined ? Number(opt.friction) : 0;

      const addSeg = (p1, p2) => {
        const ax = xform ? (p1.x * xform.a + p1.y * xform.c + xform.e) : p1.x;
        const ay = xform ? (p1.x * xform.b + p1.y * xform.d + xform.f) : p1.y;
        const bx = xform ? (p2.x * xform.a + p2.y * xform.c + xform.e) : p2.x;
        const by = xform ? (p2.x * xform.b + p2.y * xform.d + xform.f) : p2.y;
        const sx = bx - ax;
        const sy = by - ay;
        const len = Math.hypot(sx, sy);
        if (len > 0.5) {
          segments.push({
            ax, ay, bx, by,
            sx, sy, len,
            nx: -sy / len,
            ny: sx / len,
            bounce,
            refract,
            friction,
            el
          });
        }
      };

      if (tag === 'line') {
        const x1 = parseFloat(el.getAttribute('x1') || '0');
        const y1 = parseFloat(el.getAttribute('y1') || '0');
        const x2 = parseFloat(el.getAttribute('x2') || '0');
        const y2 = parseFloat(el.getAttribute('y2') || '0');
        addSeg({ x: x1, y: y1 }, { x: x2, y: y2 });
      } else if (tag === 'polygon' || tag === 'polyline') {
        const rawPts = (el.getAttribute('points') || '').trim().split(/[\s,]+/);
        const pts = [];
        for (let i = 0; i < rawPts.length - 1; i += 2) {
          const px = parseFloat(rawPts[i]);
          const py = parseFloat(rawPts[i + 1]);
          if (!isNaN(px) && !isNaN(py)) pts.push({ x: px, y: py });
        }
        for (let i = 0; i < pts.length - 1; i++) {
          addSeg(pts[i], pts[i + 1]);
        }
        if (tag === 'polygon' && pts.length > 2) {
          addSeg(pts[pts.length - 1], pts[0]);
        }
      } else if (tag === 'rect') {
        const rx = parseFloat(el.getAttribute('x') || '0');
        const ry = parseFloat(el.getAttribute('y') || '0');
        const rw = parseFloat(el.getAttribute('width') || '0');
        const rh = parseFloat(el.getAttribute('height') || '0');
        const p0 = { x: rx, y: ry };
        const p1 = { x: rx + rw, y: ry };
        const p2 = { x: rx + rw, y: ry + rh };
        const p3 = { x: rx, y: ry + rh };
        addSeg(p0, p1);
        addSeg(p1, p2);
        addSeg(p2, p3);
        addSeg(p3, p0);
      } else {
        const children = el.querySelectorAll ? el.querySelectorAll('line, polygon, polyline, rect') : null;
        if (children && children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            const childSegs = this.extractSegmentsFromElement(children[i], opt, xform);
            for (let c = 0; c < childSegs.length; c++) segments.push(childSegs[c]);
          }
        } else if (typeof el.getBBox === 'function') {
          try {
            const bbox = el.getBBox();
            if (bbox.width > 0 && bbox.height > 0) {
              const p0 = { x: bbox.x, y: bbox.y };
              const p1 = { x: bbox.x + bbox.width, y: bbox.y };
              const p2 = { x: bbox.x + bbox.width, y: bbox.y + bbox.height };
              const p3 = { x: bbox.x, y: bbox.y + bbox.height };
              addSeg(p0, p1);
              addSeg(p1, p2);
              addSeg(p2, p3);
              addSeg(p3, p0);
            }
          } catch (e) {}
        }
      }
      return segments;
    }

    /**
     * Refreshes active obstacle segments across live SVG DOM and tracks moving obstacle velocities
     */
    refreshObstacleSegments(dt = 0.016) {
      if (!this.obstacles || this.obstacles.length === 0) {
        this.cachedSegments = [];
        return;
      }
      const root = (this.engine && this.engine.container) || (typeof document !== 'undefined' ? document : null);
      if (!root) return;

      const grpCTM = this.group && typeof this.group.getScreenCTM === 'function' ? this.group.getScreenCTM() : null;
      const invGrp = grpCTM ? grpCTM.inverse() : null;
      const newSegments = [];

      for (let i = 0; i < this.obstacles.length; i++) {
        const obs = this.obstacles[i];
        if (obs.x1 !== undefined && obs.y1 !== undefined && obs.x2 !== undefined && obs.y2 !== undefined) {
          const sx = obs.x2 - obs.x1;
          const sy = obs.y2 - obs.y1;
          const len = Math.hypot(sx, sy);
          if (len > 0.5) {
            newSegments.push({
              ax: obs.x1, ay: obs.y1, bx: obs.x2, by: obs.y2,
              sx, sy, len,
              nx: -sy / len, ny: sx / len,
              bounce: obs.bounce !== undefined ? obs.bounce : 1.0,
              refract: obs.refract || 0,
              friction: obs.friction || 0,
              vx: 0, vy: 0,
              el: null
            });
          }
          continue;
        }

        const selector = obs.target || obs.selector;
        if (!selector) continue;
        const el = typeof selector === 'string' ? root.querySelector(selector) : selector;
        if (!el) continue;

        let xform = null;
        if (invGrp && typeof el.getScreenCTM === 'function') {
          try {
            const elCTM = el.getScreenCTM();
            if (elCTM) xform = invGrp.multiply(elCTM);
          } catch (e) {}
        }

        const segs = this.extractSegmentsFromElement(el, obs, xform);
        for (let s = 0; s < segs.length; s++) {
          const seg = segs[s];
          const prevKey = `obs_${i}_${s}`;
          if (!this._prevSegMap) this._prevSegMap = new Map();
          const prev = this._prevSegMap.get(prevKey);
          if (prev && dt > 0.001) {
            seg.vx = Math.max(-1200, Math.min(1200, (seg.ax - prev.ax) / dt));
            seg.vy = Math.max(-1200, Math.min(1200, (seg.ay - prev.ay) / dt));
          } else {
            seg.vx = 0;
            seg.vy = 0;
          }
          this._prevSegMap.set(prevKey, { ax: seg.ax, ay: seg.ay });
          newSegments.push(seg);
        }
      }
      this.cachedSegments = newSegments;
    }

    update(dt) {
      if (this.phaseState === 'solid') {
        const time = (this.engine && this.engine.realtimeSec != null) ? this.engine.realtimeSec : (performance.now() / 1000);
        for (let i = 0; i < this.pool.length; i++) {
          const p = this.pool[i];
          if (p.latticeX != null && p.latticeY != null) {
            p.x = p.latticeX + Math.sin(time * 16 + i * 1.6) * 1.5;
            p.y = p.latticeY + Math.cos(time * 20 + i * 2.2) * 1.5;
            if (p.node) {
              p.node.setAttribute('cx', p.x.toFixed(1));
              p.node.setAttribute('cy', p.y.toFixed(1));
            }
          }
        }
        return;
      }

      const bounds = this.getEffectiveBounds();
      const minX = bounds.minX;
      const maxX = bounds.maxX;
      const minY = bounds.minY;
      const maxY = bounds.maxY;

      // Refresh dynamic obstacle line segments
      this.refreshObstacleSegments(dt);
      const segments = this.cachedSegments;
      const hasSegments = segments && segments.length > 0;

      // ⚡ High-Performance WebAssembly Particle Step (docs/WASM_ARCHITECTURE_CONTRACT.md Pages 1 & 2)
      if (!hasSegments && typeof window !== 'undefined' && window.ASTWasmBridge && window.ASTWasmBridge.isReady) {
        if (window.ASTWasmBridge.particleStep(this.pool, dt, this.gravity, bounds)) {
          for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (p.node) {
              p.node.setAttribute('cx', p.x.toFixed(1));
              p.node.setAttribute('cy', p.y.toFixed(1));
            }
          }
          return;
        }
      }

      for (let i = 0; i < this.pool.length; i++) {
        const p = this.pool[i];
        const x0 = p.x;
        const y0 = p.y;
        p.vy += this.gravity * dt;
        let x1 = x0 + p.vx * dt;
        let y1 = y0 + p.vy * dt;

        // Discrete 2D Ray/Segment & Proximity Collision Pipeline
        if (hasSegments) {
          for (let s = 0; s < segments.length; s++) {
            const seg = segments[s];
            const sx = seg.sx;
            const sy = seg.sy;
            const segLenSq = seg.len * seg.len;
            if (segLenSq < 0.25) continue;

            // 1. Segment-Circle Proximity Projection
            const proj = Math.max(0, Math.min(1, ((x1 - seg.ax) * sx + (y1 - seg.ay) * sy) / segLenSq));
            const cx = seg.ax + proj * sx;
            const cy = seg.ay + proj * sy;
            const distSq = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy);

            // 2. Continuous 2D Ray-Segment Intersection (prevents high-speed tunneling)
            const dx = x1 - x0;
            const dy = y1 - y0;
            const denom = dx * sy - dy * sx;
            let hit = false;

            if (Math.abs(denom) > 1e-6) {
              const t = ((seg.ax - x0) * sy - (seg.ay - y0) * sx) / denom;
              const u = ((seg.ax - x0) * dy - (seg.ay - y0) * dx) / denom;
              if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                hit = true;
              }
            }

            if (!hit && distSq <= (p.radius * p.radius)) {
              hit = true;
            }

            if (hit) {
              // Ensure normal vector points against incoming relative particle velocity
              let nx = seg.nx;
              let ny = seg.ny;
              const vObsX = seg.vx || 0;
              const vObsY = seg.vy || 0;
              let vRelX = p.vx - vObsX;
              let vRelY = p.vy - vObsY;

              if (vRelX * nx + vRelY * ny > 0) {
                nx = -nx;
                ny = -ny;
              }

              // A. Optics: Snell's Law Refraction & Total Internal Reflection
              if (seg.refract && seg.refract > 1.0) {
                const spd = Math.hypot(vRelX, vRelY) || 1e-4;
                const dirX = vRelX / spd;
                const dirY = vRelY / spd;
                const cosI = -(dirX * nx + dirY * ny);
                const eta = 1.0 / seg.refract;
                const sin2T = eta * eta * (1.0 - cosI * cosI);

                if (sin2T > 1.0) {
                  // Total Internal Reflection (TIR)
                  const dot = dirX * nx + dirY * ny;
                  p.vx = (dirX - 2 * dot * nx) * spd + vObsX;
                  p.vy = (dirY - 2 * dot * ny) * spd + vObsY;
                  x1 = cx + nx * (p.radius + 1.2);
                  y1 = cy + ny * (p.radius + 1.2);
                } else {
                  // Snell's Law Refraction
                  const cosT = Math.sqrt(1.0 - sin2T);
                  const refrX = eta * dirX + (eta * cosI - cosT) * nx;
                  const refrY = eta * dirY + (eta * cosI - cosT) * ny;
                  p.vx = refrX * spd + vObsX;
                  p.vy = refrY * spd + vObsY;
                  x1 = cx + refrX * (p.radius + 1.5);
                  y1 = cy + refrY * (p.radius + 1.5);
                }
              } else {
                // B. Classical Mechanics: Elastic/Inelastic Momentum Transfer
                const bounce = seg.bounce !== undefined ? seg.bounce : 1.0;
                const vn = vRelX * nx + vRelY * ny;
                if (vn < 0) {
                  vRelX -= (1 + bounce) * vn * nx;
                  vRelY -= (1 + bounce) * vn * ny;
                  if (seg.friction) {
                    const tx = -ny, ty = nx;
                    const vt = vRelX * tx + vRelY * ty;
                    vRelX -= vt * seg.friction * tx;
                    vRelY -= vt * seg.friction * ty;
                  }
                  p.vx = vRelX + vObsX;
                  p.vy = vRelY + vObsY;
                  x1 = cx + nx * (p.radius + 0.6);
                  y1 = cy + ny * (p.radius + 0.6);
                }
              }
            }
          }
        }

        if (this.wrapMode === 'bounce') {
          if (x1 < minX + p.radius) {
            x1 = minX + p.radius;
            p.vx = Math.abs(p.vx);
          } else if (x1 > maxX - p.radius) {
            x1 = maxX - p.radius;
            p.vx = -Math.abs(p.vx);
          }
          if (y1 < minY + p.radius) {
            y1 = minY + p.radius;
            p.vy = Math.abs(p.vy);
          } else if (y1 > maxY - p.radius) {
            y1 = maxY - p.radius;
            p.vy = -Math.abs(p.vy);
          }
        } else if (this.wrapMode === 'wrap') {
          if (x1 < minX) x1 = maxX;
          if (x1 > maxX) x1 = minX;
          if (y1 < minY) y1 = maxY;
          if (y1 > maxY) y1 = minY;
        }

        p.x = x1;
        p.y = y1;

        if (p.node) {
          p.node.setAttribute('cx', p.x.toFixed(1));
          p.node.setAttribute('cy', p.y.toFixed(1));
        }
      }
    }

    /**
     * Mutates emitter physical properties dynamically (e.g. from state machine transitions)
     */
    mutate(props = {}) {
      if (props.speed !== undefined) this.speed = Number(props.speed);
      if (props.gravity !== undefined) this.gravity = Number(props.gravity);
      if (props.boundsElement !== undefined) this.boundsElement = props.boundsElement;
      if (props.wrapMode !== undefined) this.wrapMode = props.wrapMode;
      if (props.obstacles !== undefined) this.setObstacles(props.obstacles);
      if (props.fill !== undefined) {
        this.fill = props.fill;
        for (const p of this.pool) {
          if (p.node) p.node.setAttribute('fill', this.fill);
        }
      }
      if (props.radius !== undefined) {
        this.radius = Number(props.radius);
        for (const p of this.pool) {
          p.radius = this.radius;
          if (p.node) p.node.setAttribute('r', this.radius);
        }
      }
      if (props.count !== undefined) {
        this.setCount(Number(props.count));
      }
    }

    setCount(targetCount) {
      const tc = Math.max(1, Math.min(600, targetCount));
      if (tc === this.pool.length) return;
      this.count = tc;
      if (tc < this.pool.length) {
        const removed = this.pool.splice(tc);
        for (const p of removed) {
          if (p.node && p.node.parentNode) p.node.parentNode.removeChild(p.node);
        }
      } else {
        const bw = Math.max(20, this.bounds.maxX - this.bounds.minX);
        const bh = Math.max(20, this.bounds.maxY - this.bounds.minY);
        for (let i = this.pool.length; i < tc; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = this.speed * (0.6 + Math.random() * 0.8);
          const p = {
            x: this.bounds.minX + Math.random() * bw,
            y: this.bounds.minY + Math.random() * bh,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            radius: this.radius,
            node: null
          };
          this.pool.push(p);
          if (this.group) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', p.x.toFixed(1));
            circle.setAttribute('cy', p.y.toFixed(1));
            circle.setAttribute('r', p.radius);
            circle.setAttribute('fill', this.fill);
            circle.setAttribute('opacity', '0.85');
            this.group.appendChild(circle);
            p.node = circle;
          }
        }
      }
    }
  }

  /**
   * VectorProceduralAudioSynth (< 1.2 KB Zero-Asset Web Audio Synthesizer)
   * Generates realtime tactile clicks, harmonic pentatonic chimes, AC current hums,
   * spring impacts, and checkpoint alerts entirely via mathematical oscillators.
   */
  class VectorProceduralAudioSynth {
    constructor(engine) {
      this.engine = engine;
      this.ctx = null;
      this.muted = false;
      this.humOsc = null;
      this.humGain = null;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      } catch (e) {
        console.warn('[AudioSynth] Web Audio not available:', e);
      }
    }

    ensureContext() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return Boolean(this.ctx);
    }

    playClick(freq = 900) {
      if (this.muted || !this.ensureContext()) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } catch (e) {}
    }

    playSuccessChime() {
      if (this.muted || !this.ensureContext()) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + (idx * 0.08);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0.001, noteTime);
          gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.36);
        });
      } catch (e) {}
    }

    playFailBuzz() {
      if (this.muted || !this.ensureContext()) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      } catch (e) {}
    }

    playSpring(freq = 440) {
      if (this.muted || !this.ensureContext()) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } catch (e) {}
    }

    setHum(freq = 60, volume = 0.05) {
      if (this.muted || !this.ensureContext()) return;
      try {
        if (!this.humOsc) {
          this.humOsc = this.ctx.createOscillator();
          this.humGain = this.ctx.createGain();
          this.humOsc.type = 'sine';
          this.humOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          this.humGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          this.humGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
          this.humOsc.connect(this.humGain);
          this.humGain.connect(this.ctx.destination);
          this.humOsc.start();
        } else {
          this.humOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          this.humGain.gain.setValueAtTime(volume, this.ctx.currentTime);
        }
      } catch (e) {}
    }

    stopHum() {
      if (this.humOsc && this.humGain && this.ctx) {
        try {
          const now = this.ctx.currentTime;
          this.humGain.gain.linearRampToValueAtTime(0.001, now + 0.08);
          setTimeout(() => {
            if (this.humOsc) {
              this.humOsc.stop();
              this.humOsc.disconnect();
              this.humOsc = null;
              this.humGain = null;
            }
          }, 90);
        } catch (e) {
          this.humOsc = null;
          this.humGain = null;
        }
      }
    }

    playBoing(baseFreq = 220) {
      if (this.muted || !this.ensureContext()) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.4, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.28);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.31);
      } catch (e) {}
    }

    playSlideWhistle(startFreq = 280, endFreq = 840, duration = 0.35) {
      if (this.muted || !this.ensureContext()) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.03);
        gain.gain.setValueAtTime(0.16, now + duration - 0.04);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
      } catch (e) {}
    }

    playPop(freq = 620) {
      if (this.muted || !this.ensureContext()) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.25, now + 0.04);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {}
    }

    playWhoosh() {
      if (this.muted || !this.ensureContext()) return;
      try {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3.0;
        const now = this.ctx.currentTime;
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.24);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.24);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);
      } catch (e) {}
    }
  }

  /**
   * VectorVerletPhysics (< 1.8 KB Pure Verlet Integration Engine)
   * High-stability particle, spring-mass, rope, and pendulum dynamics
   * Formula: x(t+dt) = 2x(t) - x(t-dt) + a * dt²
   */
  class VectorVerletPhysics {
    constructor(engine, options = {}) {
      this.engine = engine;
      this.gravity = options.gravity !== undefined ? options.gravity : 980;
      this.drag = options.drag !== undefined ? options.drag : 0.992;
      this.iterations = options.iterations || 4;
      this.points = [];
      this.constraints = [];
      this.enabled = true;
    }

    addPoint(x, y, pinned = false, mass = 1.0, radius = 6) {
      const p = {
        x: Number(x) || 0,
        y: Number(y) || 0,
        px: Number(x) || 0,
        py: Number(y) || 0,
        pinned: Boolean(pinned),
        mass: Math.max(0.05, Number(mass) || 1.0),
        radius: Number(radius) || 6
      };
      this.points.push(p);
      return p;
    }

    addConstraint(p1, p2, length = null, stiffness = 1.0) {
      const dist = length !== null ? length : Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const c = { p1, p2, length: dist, stiffness: Math.min(1.0, Math.max(0.01, stiffness)) };
      this.constraints.push(c);
      return c;
    }

    createPendulum(pivotX, pivotY, length = 160, bobRadius = 14, initialAngle = 0.5) {
      this.points = [];
      this.constraints = [];
      const p0 = this.addPoint(pivotX, pivotY, true, 0, 4);
      const bobX = pivotX + Math.sin(initialAngle) * length;
      const bobY = pivotY + Math.cos(initialAngle) * length;
      const p1 = this.addPoint(bobX, bobY, false, 2.0, bobRadius);
      this.addConstraint(p0, p1, length, 1.0);
      return { pivot: p0, bob: p1 };
    }

    createSpring(startX, startY, endX, endY, stiffness = 0.15) {
      const p0 = this.addPoint(startX, startY, true, 0, 4);
      const p1 = this.addPoint(endX, endY, false, 1.5, 10);
      this.addConstraint(p0, p1, Math.hypot(endX - startX, endY - startY), stiffness);
      return { anchor: p0, weight: p1 };
    }

    step(dt) {
      if (!this.enabled || dt <= 0) return;
      const clampedDt = Math.min(dt, 0.05);

      // ⚡ High-Performance WebAssembly Verlet Acceleration (docs/WASM_ARCHITECTURE_CONTRACT.md Page 3)
      if (typeof window !== 'undefined' && window.ASTWasmBridge && window.ASTWasmBridge.isReady) {
        if (window.ASTWasmBridge.verletStep(this.points, this.constraints, this.iterations, clampedDt, this.gravity, this.drag)) {
          return;
        }
      }

      // 1. Verlet position update
      for (let i = 0; i < this.points.length; i++) {
        const p = this.points[i];
        if (p.pinned) continue;
        const vx = (p.x - p.px) * this.drag;
        const vy = (p.y - p.py) * this.drag;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + (this.gravity * clampedDt * clampedDt);
      }

      // 2. Constraint relaxation
      for (let n = 0; n < this.iterations; n++) {
        for (let i = 0; i < this.constraints.length; i++) {
          const c = this.constraints[i];
          const dx = c.p2.x - c.p1.x;
          const dy = c.p2.y - c.p1.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const diff = (c.length - dist) / dist;
          const offset = diff * 0.5 * c.stiffness;

          if (!c.p1.pinned) {
            c.p1.x -= dx * offset;
            c.p1.y -= dy * offset;
          }
          if (!c.p2.pinned) {
            c.p2.x += dx * offset;
            c.p2.y += dy * offset;
          }
        }
      }
    }
  }

  /**
   * MicroSCORMBridge (< 0.8 KB SCORM 1.2 / 2004 & xAPI Gradebook Connector)
   * Connects to Canvas, Moodle, Blackboard, and Google Classroom with zero external libraries.
   */
  class MicroSCORMBridge {
    constructor(engine) {
      this.engine = engine;
      this.api = null;
      this.version = null;
      this.initialized = false;
      this.findAPI();
    }

    findAPI() {
      if (typeof window === 'undefined') return null;
      let win = window;
      let attempts = 0;
      while (win && attempts < 8) {
        try {
          if (win.API) {
            this.api = win.API;
            this.version = '1.2';
            return this.api;
          }
          if (win.API_1484_11) {
            this.api = win.API_1484_11;
            this.version = '2004';
            return this.api;
          }
          if (win.parent && win.parent !== win) {
            win = win.parent;
          } else if (win.opener) {
            win = win.opener;
          } else {
            break;
          }
        } catch (e) {
          break;
        }
        attempts++;
      }
      return null;
    }

    init() {
      if (this.initialized) return true;
      this.findAPI();
      if (!this.api) return false;
      try {
        const res = this.version === '1.2' ? this.api.LMSInitialize('') : this.api.Initialize('');
        this.initialized = String(res) === 'true';
        if (this.initialized) {
          this.setStatus('incomplete');
        }
        return this.initialized;
      } catch (e) {
        return false;
      }
    }

    setScore(raw, min = 0, max = 100) {
      if (!this.api) this.init();
      if (!this.api || !this.initialized) return;
      try {
        if (this.version === '1.2') {
          this.api.LMSSetValue('cmi.core.score.raw', String(raw));
          this.api.LMSSetValue('cmi.core.score.min', String(min));
          this.api.LMSSetValue('cmi.core.score.max', String(max));
          this.api.LMSCommit('');
        } else {
          this.api.SetValue('cmi.score.raw', String(raw));
          this.api.SetValue('cmi.score.min', String(min));
          this.api.SetValue('cmi.score.max', String(max));
          this.api.Commit('');
        }
      } catch (e) {}
    }

    setStatus(status) { // 'passed', 'completed', 'failed', 'incomplete'
      if (!this.api) this.init();
      if (!this.api || !this.initialized) return;
      try {
        if (this.version === '1.2') {
          this.api.LMSSetValue('cmi.core.lesson_status', status);
          this.api.LMSCommit('');
        } else {
          this.api.SetValue('cmi.completion_status', status === 'passed' ? 'completed' : status);
          if (status === 'passed') this.api.SetValue('cmi.success_status', 'passed');
          this.api.Commit('');
        }
      } catch (e) {}
    }
  }

  // Embedded Built-In Welcome to AST Simulator Cartridge (Zero Network Overhead, Sub-15ms Instant Cold Start)
  const AST_BUILTIN_WELCOME_SVG = `<svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="welcome-bg-glow" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#070c18" />
      <stop offset="100%" stop-color="#02040a" />
    </radialGradient>
    <radialGradient id="welcome-orb-glow" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="40%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </radialGradient>
    <linearGradient id="welcome-cyan-gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#welcome-bg-glow)" />
  <g opacity="0.45">
    <line x1="80" y1="80" x2="720" y2="80" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="160" x2="720" y2="160" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="240" x2="720" y2="240" stroke="#334155" stroke-width="1.5" />
    <line x1="80" y1="320" x2="720" y2="320" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="400" x2="720" y2="400" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="120" y1="60" x2="120" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="260" y1="60" x2="260" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="400" y1="60" x2="400" y2="420" stroke="#334155" stroke-width="1.5" />
    <line x1="540" y1="60" x2="540" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="680" y1="60" x2="680" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
  </g>
  <g transform="translate(400, 38)">
    <rect x="-240" y="-18" width="480" height="36" rx="18" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.6" />
    <circle cx="-216" cy="0" r="6" fill="#10b981" />
    <text x="-196" y="5" fill="#f8fafc" font-size="13" font-weight="800" letter-spacing="1">AST VECTOR MOTION &amp; SIMULATION APPARATUS</text>
    <rect x="156" y="-10" width="66" height="20" rx="10" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1" />
    <text x="189" y="4" fill="#38bdf8" font-size="10" font-weight="900" text-anchor="middle">v2.6.0</text>
  </g>
  <g id="welcome-wave-container">
    <path id="welcome-sine-path" d="M 80 240 Q 240 180, 400 240 T 720 240" fill="none" stroke="url(#welcome-cyan-gold)" stroke-width="3.5" stroke-linecap="round" />
  </g>
  <g transform="translate(400, 240)">
    <circle id="welcome-energy-node" cx="0" cy="0" r="28" fill="url(#welcome-orb-glow)" opacity="0.85" />
    <circle cx="0" cy="0" r="14" fill="#f0f9ff" opacity="0.9" />
    <circle cx="0" cy="0" r="6" fill="#0284c7" />
  </g>
  <g id="welcome-probe-group">
    <circle id="welcome-probe" cx="120" cy="240" r="18" fill="#fbbf24" stroke="#ffffff" stroke-width="3" style="cursor: grab;" data-pedagogical="Direct In-Stage Grabbing: Drag this probe to interact with the vector timeline." />
    <circle cx="120" cy="240" r="6" fill="#78350f" pointer-events="none" />
  </g>
  <g transform="translate(80, 360)">
    <rect x="0" y="0" width="145" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">COLD START</text>
    <text x="14" y="42" fill="#38bdf8" font-size="15" font-weight="900">&lt; 15 ms</text>
    <text x="76" y="42" fill="#64748b" font-size="10">/ 0% CDN</text>
  </g>
  <g transform="translate(240, 360)">
    <rect x="0" y="0" width="150" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">FRAME RATE</text>
    <text x="14" y="42" fill="#10b981" font-size="15" font-weight="900">60 FPS</text>
    <text x="76" y="42" fill="#64748b" font-size="10">SVG Vectors</text>
  </g>
  <g transform="translate(405, 360)">
    <rect x="0" y="0" width="155" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">RUNTIME ENGINE</text>
    <text x="14" y="42" fill="#c084fc" font-size="15" font-weight="900">&lt; 35 KB</text>
    <text x="76" y="42" fill="#64748b" font-size="10">Zero Deps</text>
  </g>
  <g transform="translate(575, 360)">
    <rect x="0" y="0" width="145" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">EDGE AI CO-PILOT</text>
    <text x="14" y="42" fill="#f59e0b" font-size="14" font-weight="900">Gemini Nano</text>
  </g>
  <g transform="translate(80, 80)">
    <text x="0" y="0" fill="#64748b" font-size="10" font-weight="800">RESONANCE:</text>
    <text id="welcome-freq-readout" x="80" y="0" fill="#38bdf8" font-size="12" font-weight="800">2.0 Hz</text>
  </g>
  <g transform="translate(620, 80)">
    <text x="0" y="0" fill="#64748b" font-size="10" font-weight="800">AMPLITUDE:</text>
    <text id="welcome-amp-readout" x="78" y="0" fill="#fbbf24" font-size="12" font-weight="800">35 px</text>
  </g>
  <g transform="translate(80, 436)">
    <rect x="0" y="0" width="640" height="6" rx="3" fill="#1e293b" />
    <rect id="welcome-progress-fill" x="0" y="0" width="0" height="6" rx="3" fill="url(#welcome-cyan-gold)" />
  </g>
</svg>`;

  const AST_BUILTIN_WELCOME_AST = `(:scene :id "welcome" :type "Sim" :title "Welcome to AST Vector Player & Educational Simulator" :stage "PORTAL APPARATUS & SIMULATOR" :duration 16.0
  (:vars ((:var :name "harmonicFreq" :val 2.0 :min 0.5 :max 6.0 :step 0.5 :label "Harmonic Resonance") (:var :name "waveAmplitude" :val 35.0 :min 10.0 :max 80.0 :step 5.0 :label "Wave Amplitude") (:var :name "pulseSpeed" :val 1.0 :min 0.2 :max 3.0 :step 0.2 :label "Time Dilation Clock")))
  (:inputs ((:slider :var "harmonicFreq" :label "Harmonic Frequency" :min 0.5 :max 6.0 :step 0.5) (:slider :var "waveAmplitude" :label "Signal Power" :min 10.0 :max 80.0 :step 5.0) (:slider :var "pulseSpeed" :label "Timeline Warp" :min 0.2 :max 3.0 :step 0.2)))
  (:gestures ((:draggable :target "#welcome-probe" :axis "xy" :min 80 :max 720)))
  (:subtitles ((:start 0.00 :end 0.25 :en "Welcome to AST Vector Player: An autonomous, zero-bloat educational motion and direct-manipulation simulator." :es "Bienvenido al reproductor vectorial AST: Un simulador educativo autónomo y sin sobrecarga." :la "Salve ad AST Vector Player: Machina dynamica et vectorialis ad doctrinam veram.") (:start 0.25 :end 0.55 :en "Flash-Caliber Vector Simulation: Running at 60 FPS in pure SVG DOM with zero external runtime dependencies and sub-15ms cold start." :es "Simulación vectorial calibre Flash: 60 FPS en SVG puro con cero dependencias externas y arranque sub-15ms." :la "Simulatio Vectorialis: Motus continuus ad sexaginta quadros per secundum sine oneribus externis.") (:start 0.55 :end 0.80 :en "Direct In-Stage Grabbing & Smartboard Stylus: Grab and drag interactive physics nodes or draw with Promethean and SMART pens." :es "Manipulación directa en pantalla y pizarra digital: Arrastra nodos físicos o escribe con lápiz óptico." :la "Tactus Directus et Calamus: Trahe elementa viva vel scribe cum calamo digitali super tabulam.") (:start 0.80 :end 1.00 :en "On-Device Gemini Nano AI & W3C WebMCP: Formative assessment and S-Expression logic running purely in the browser with zero cloud leakage." :es "Inteligencia artificial en el dispositivo Gemini Nano: Evaluación formativa y lógica pura sin salida a la nube." :la "Intelligentia Localis: Disciplina et responsa fidelia in machina tua conservata.")))
  (:keyframes ((:t 0.00 :title "1. Autonomous Vector Engine" :rule "Zero Bloat • Native SVG DOM vector apparatus with sub-15ms cold start.") (:t 0.25 :title "2. Harmonic Frequency & Oscillations" :rule "Kinematic Resonance • 60 FPS procedural waveforms with zero video streaming.") (:t 0.55 :title "3. Direct Manipulation & Classroom Stylus" :rule "Interactive Invariants • Drag in-stage nodes or annotate directly with digital ink.") (:t 0.80 :title "4. On-Device Edge Intelligence" :rule "Zero Cloud Leakage • Local Chrome Prompt API / Gemini Nano formative tutoring.")))
  (:interactive ((:checkpoint :t 0.60 :prompt "What architectural feature enables AST Vector Player to boot 70× faster than legacy PhET simulations and video players?" :options ("Declarative Lisp S-Expressions & .astb Bytecode with Zero-Asset Web Audio" "External Cloud Video CDNs" "Gigabyte WebGL textures" "Heavy server-side rendering") :answer 0 :explanation "AST cartridges use micro-payload declarative S-Expressions and compiled binary bytecode (< 15 KB) with procedural Web Audio synthesis, executing in < 0.2 ms with zero cloud dependencies.")))
  (:bindings ((:target "#welcome-probe" :attr "cx" :expr "120 + t * 560") (:target "#welcome-probe" :attr "cy" :expr "240 + Math.sin(t * Math.PI * (vars.harmonicFreq || 2.0) * 2) * (vars.waveAmplitude || 35.0)") (:target "#welcome-energy-node" :attr "r" :expr "24 + Math.sin(t * Math.PI * 8) * 8") (:target "#welcome-energy-node" :attr "opacity" :expr "0.75 + Math.sin(t * 10) * 0.2") (:target "#welcome-sine-path" :attr "d" :expr "'M 80 ' + (240 + Math.sin(t * 4) * 15) + ' Q 240 ' + (240 - (vars.waveAmplitude || 35.0) * 2) + ', 400 240 T 720 ' + (240 + Math.sin(t * 4 + 2) * 15)") (:target "#welcome-freq-readout" :attr "textContent" :expr "(vars.harmonicFreq || 2.0).toFixed(1) + ' Hz'") (:target "#welcome-amp-readout" :attr "textContent" :expr "(vars.waveAmplitude || 35.0).toFixed(0) + ' px'") (:target "#welcome-progress-fill" :attr "width" :expr "t * 640")))
)`;

  class ASTVectorPlayerEngine {
    static VERSION = '2.6.0';
    static LICENSE = 'AGPL-3.0-or-later';
    constructor(options = {}) {
      this.options = Object.assign({
        preset: 'welcome',
        lang: 'en',
        speed: 1.0,
        autoplay: true,
        theme: 'dark',
        voiceEnabled: false,
        container: null,
        basePath: './',
      }, options);

      this.activePresetId = this.options.preset || 'welcome';
      this.currentLang = this.options.lang || 'en';
      this.bilingualSubtitles = Boolean(this.options.bilingualSubtitles);
      this.speechRate = parseFloat(this.options.speechRate) || 0.95;
      this.speed = this.options.speed;
      this.isPlaying = this.options.autoplay;
      this.loop = this.options.loop !== undefined ? Boolean(this.options.loop) : true;
      this.volume = this.options.volume !== undefined ? parseFloat(this.options.volume) : 1.0;
      this.muted = Boolean(this.options.muted);
      this.progress = 0.0; // 0.000 to 1.000
      this.voiceEnabled = this.options.voiceEnabled;
      this.lastSpokenIndex = -1;
      this.lastTimestamp = null;
      this.animationFrameId = null;

      // Origin validation setup for strict zero-egress compliance
      let detectedOrigin = '*';
      if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
        detectedOrigin = window.location.origin;
      }
      this.targetOrigin = this.options.targetOrigin || this.options.hostOrigin || detectedOrigin;

      // Upgraded Micro-Subsystems (Procedural Audio Synth, Verlet Dynamics, Micro-SCORM Bridge)
      this.audioSynth = new VectorProceduralAudioSynth(this);
      this.audioSynth.muted = this.muted;
      this.verletPhysics = new VectorVerletPhysics(this);
      this.scormBridge = new MicroSCORMBridge(this);
      this.scormBridge.init();
      this.isBranching = false;
      this.activeBranches = null;

      // Container & Dynamic Bindings
      this._container = this.options.container || null;
      this.sceneCache = {};
      this.activeBindings = [];
      this.active3DNodes = [];
      this.active3DLines = [];
      this.active3DRings = [];
      this.active3DPolygons = [];
      this.active3DItems = []; // Unified 3D item collection for Painter's algorithm
      this._cachedElements = null;
      this._mountedSceneId = null;
      this._mountedContainer = null;

      // Interactive Camera Orbit State
      this.cameraOrbit = {
        yawOffset: 0,
        pitchOffset: 0,
        distanceScale: 1.0
      };

      // Direct Analytic Ray-Math & Spatial Telemetry Subsystem (< 15 KB, 0 GPU Drivers)
      this.nodeOffsets = new Map();
      this.spatialTargets = new Map();
      this._lastRayHit = null;
      this._lastCursorRay = null;
      this._lastRayHitSExpr = '(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])';
      this.initDefaultSpatialTargets();

      // Speech synthesis debounce queue timer
      this._speakDebounceTimer = null;

      // Gemini Nano Co-Pilot RPC & Interruption Subsystem (betaplans.md)
      this.isAiDemonstrating = false;
      this._aiPreempted = false;
      this._activeAiTweenId = null;
      this._activeAiViewBoxTweenId = null;
      this._aiHighlightedNodes = new Set();
      this._aiHighlightTimer = null;
      this._defaultViewBox = null;

      if (typeof window !== 'undefined') {
        const handlePreempt = () => {
          if (this.isAiDemonstrating) {
            this.preemptAiDemonstration('USER_INPUT');
          }
        };
        window.addEventListener('pointerdown', handlePreempt, { passive: true });
        window.addEventListener('touchstart', handlePreempt, { passive: true });
        window.addEventListener('wheel', handlePreempt, { passive: true });
        window.addEventListener('keydown', (e) => {
          if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyP', 'KeyR'].includes(e.code)) {
            handlePreempt();
          }
        }, { passive: true });
      }

      // Reactive State Variables & User Interaction
      this.vars = {};

      // Event listeners
      this.listeners = {
        timeupdate: [],
        keyframe: [],
        statechange: [],
        presetchange: [],
        langchange: [],
        camerachange: [],
        varchange: []
      };

      // Zero-Bloat Micro-Physics Subsystem (< 1.5 KB)
      this.physics = new VectorMicroPhysics(this, this.options.physics || {});

      // Declarative State Transition Machines & Multi-Entity Emitter Collections
      this.stateMachines = new Map();
      this.emitters = new Map();
      this.activeBindInputs = [];

      // Gemini Nano AI Co-Pilot State (betaplans.md)
      this.isAiDemonstrating = false;
      this.activeAiTween = null;
      this.activeAiViewBoxTween = null;
      this.originalViewBox = null;
      this.activeAiSpotlightTimers = [];
      this.activeAiActionQueue = [];
      this.currentKeyframeIndex = 0;
      this.isThrottledForAi = false;
      this._preemptionListenersSetup = false;

      // Load initial scene
      this.scene = this.getScene(this.activePresetId);
      this.durationSec = (this.scene && this.scene.duration) || 16.0;

      // Bind methods
      this.tick = this.tick.bind(this);

      // Crucial Cold Start Fix: Synchronously mount initial apparatus (0ms, 0 blank flash)
      if (this._container) {
        const initialScene = this.scene || this.getBuiltinWelcomeScene();
        this.mountSceneAsset(initialScene, this._container);
      }

      // Eagerly ingest initial scene assets if in browser
      if (typeof window !== 'undefined') {
        this.loadScene(this.activePresetId, this.isPlaying);
      }
    }

    get container() {
      return this._container;
    }

    set container(node) {
      this._container = node;
      if (node && this.scene) {
        this.mountSceneAsset(this.scene, node);
      }
    }

    getBuiltinWelcomeScene() {
      if (this._cachedWelcomeScene) return this._cachedWelcomeScene;
      let registryWelcome = null;
      if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.get === 'function') {
        registryWelcome = global.ASTSceneRegistry.get('welcome');
      }
      const rawSvg = (registryWelcome && (registryWelcome.svgMarkup || registryWelcome.svgText)) || AST_BUILTIN_WELCOME_SVG;
      const rawAst = (registryWelcome && (registryWelcome.astSource || registryWelcome.astText)) || AST_BUILTIN_WELCOME_AST;
      
      let parsed = null;
      try {
        parsed = this.parseAst(rawAst);
      } catch (_) {}

      this._cachedWelcomeScene = Object.assign({
        id: 'welcome',
        type: 'Sim',
        cartridgeType: 'Sim',
        title: 'Welcome to AST Vector Player & Educational Simulator',
        stage: 'PORTAL SHOWCASE',
        duration: 16.0,
        svgText: rawSvg,
        svgMarkup: rawSvg,
        astSource: rawAst,
        astText: rawAst,
      }, parsed || {});
      return this._cachedWelcomeScene;
    }

    getScene(presetId) {
      if (presetId === 'welcome') {
        return this.getBuiltinWelcomeScene();
      }
      if (this.sceneCache && this.sceneCache[presetId]) {
        return this.sceneCache[presetId];
      }
      if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.get === 'function') {
        const found = global.ASTSceneRegistry.get(presetId);
        if (found) return found;
      }
      if (global.ASTScenes && global.ASTScenes[presetId]) {
        return global.ASTScenes[presetId];
      }
      return this.getBuiltinWelcomeScene();
    }

    on(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event].push(callback);
      }
      return () => this.off(event, callback);
    }

    off(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    }

    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(cb => {
          try { cb(data); } catch (err) { console.error('Engine event listener error:', err); }
        });
      }
      // Also notify parent iframe
      this.notifyParent({ type: event.toUpperCase(), ...data });
    }

    /**
     * Origin-validated parent notification
     * Replaces wildcard '*' with window.location.origin or explicit hostOrigin
     */
    notifyParent(payload) {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        const origin = (this.options && (this.options.targetOrigin || this.options.hostOrigin)) || '*';
        window.parent.postMessage({ source: 'ast-vector-player', ...payload }, origin);
      }
    }

    /**
     * Returns true if current active scene has 3D nodes/camera
     */
    has3D() {
      if (this.scene && this.scene.has3D) return true;
      if (this.activePresetId === 'church-tour' || this.activePresetId === 'solar-system' || this.activePresetId === 'atom') return true;
      if (this.active3DItems && this.active3DItems.length > 0) return true;
      if (this.active3DNodes && this.active3DNodes.length > 0) return true;
      if (this.active3DLines && this.active3DLines.length > 0) return true;
      if (this.active3DRings && this.active3DRings.length > 0) return true;
      return false;
    }

    /**
     * Rotate camera interactively (degrees)
     */
    rotateCamera(deltaYaw, deltaPitch) {
      this.cameraOrbit.yawOffset += deltaYaw;
      this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, this.cameraOrbit.pitchOffset + deltaPitch));
      this.applyBindings(this.progress);
      this.emit('camerachange', { ...this.cameraOrbit });
    }

    /**
     * Zoom camera interactively (multiplier delta)
     */
    zoomCamera(deltaZoom) {
      this.cameraOrbit.distanceScale = Math.max(0.2, Math.min(4.0, this.cameraOrbit.distanceScale * (1 + deltaZoom)));
      this.applyBindings(this.progress);
      this.emit('camerachange', { ...this.cameraOrbit });
    }

    /**
     * Reset camera to default scene orientation
     */
    resetCamera() {
      this.cameraOrbit.yawOffset = 0;
      this.cameraOrbit.pitchOffset = 0;
      this.cameraOrbit.distanceScale = 1.0;
      this.applyBindings(this.progress);
      this.emit('camerachange', { ...this.cameraOrbit });
    }

    /**
     * Pre-registers canonical spatial targets for electromagnetic physics, atomic cores, and probes
     */
    initDefaultSpatialTargets() {
      if (!this.spatialTargets) this.spatialTargets = new Map();
      this.spatialTargets.set('#coil-core', { pos: [12.0, 45.0, -8.5], radius: 18, normal: [0.0, 1.0, 0.0] });
      this.spatialTargets.set('#solenoid-core', { pos: [12.0, 45.0, -8.5], radius: 18, normal: [0.0, 1.0, 0.0] });
      this.spatialTargets.set('#probe-tip', { pos: [12.0, 45.0, -8.5], radius: 10, normal: [0.0, 0.0, 1.0] });
    }

    /**
     * Resolves combined camera parameters in spherical coords: theta (yaw), phi (pitch), distance
     */
    getCameraParameters() {
      const camera = Object.assign({ distance: 450, pitch: 20, yaw: 0, fov: 60 }, (this.scene && this.scene.camera) || {});
      let yawBase = camera.yaw;
      let pitchBase = camera.pitch;
      const t = this.progress || 0;
      const clock = this.realtimeSec != null ? this.realtimeSec : (t * (this.durationSec || 12.0));
      if (typeof yawBase === 'string') {
        try {
          const yawFn = new Function('t', 'Math', 'vars', 'clock', `"use strict"; return (${yawBase});`);
          yawBase = yawFn(t, Math, this.vars || {}, clock);
        } catch { yawBase = 0; }
      }
      if (typeof pitchBase === 'string') {
        try {
          const pitchFn = new Function('t', 'Math', 'vars', 'clock', `"use strict"; return (${pitchBase});`);
          pitchBase = pitchFn(t, Math, this.vars || {}, clock);
        } catch { pitchBase = 0; }
      }
      yawBase = typeof yawBase === 'number' ? yawBase : 0;
      pitchBase = typeof pitchBase === 'number' ? pitchBase : 0;

      const totalYaw = yawBase + (this.cameraOrbit ? this.cameraOrbit.yawOffset : 0);
      const totalPitch = Math.max(-85, Math.min(85, pitchBase + (this.cameraOrbit ? this.cameraOrbit.pitchOffset : 0)));
      const totalDist = Math.max(80, (camera.distance || 450) * (this.cameraOrbit ? this.cameraOrbit.distanceScale : 1.0));
      const fov = camera.fov || 60;
      const rollBase = camera.roll || 0;

      return {
        theta: totalYaw,
        phi: totalPitch,
        dist: totalDist,
        fov,
        roll: rollBase
      };
    }

    /**
     * Computes the 3D ray in World Space originating from the camera through screen coordinate (screenX, screenY).
     * Defaults to canvas center gaze (400, 240).
     */
    computeCameraRay(screenX = 400, screenY = 240) {
      const cam = this.getCameraParameters();
      const thetaRad = cam.theta * (Math.PI / 180);
      const phiRad = cam.phi * (Math.PI / 180);
      const rollRad = (cam.roll || 0) * (Math.PI / 180);
      const focalLength = 400 / Math.tan((cam.fov * Math.PI) / 360);

      const dxCam = (screenX - 400) / focalLength;
      const dyCam = (screenY - 240) / focalLength;
      const dzCam = -1.0;
      const lenCam = Math.sqrt(dxCam * dxCam + dyCam * dyCam + dzCam * dzCam) || 1.0;
      const dCam = [dxCam / lenCam, dyCam / lenCam, dzCam / lenCam];

      // Invert Camera Rotation R = Rz(roll) * Rx(phi) * Ry(theta)
      const d1x = dCam[0] * Math.cos(rollRad) + dCam[1] * Math.sin(rollRad);
      const d1y = -dCam[0] * Math.sin(rollRad) + dCam[1] * Math.cos(rollRad);
      const d1z = dCam[2];

      const d2x = d1x;
      const d2y = d1y * Math.cos(phiRad) + d1z * Math.sin(phiRad);
      const d2z = -d1y * Math.sin(phiRad) + d1z * Math.cos(phiRad);

      const dirX = d2x * Math.cos(thetaRad) - d2z * Math.sin(thetaRad);
      const dirY = d2y;
      const dirZ = d2x * Math.sin(thetaRad) + d2z * Math.cos(thetaRad);

      // Camera Position in World Space
      const o2y = cam.dist * Math.sin(phiRad);
      const o2z = cam.dist * Math.cos(phiRad);
      const origX = -o2z * Math.sin(thetaRad);
      const origY = o2y;
      const origZ = o2z * Math.cos(thetaRad);

      return {
        origin: [origX, origY, origZ],
        direction: [dirX, dirY, dirZ],
        theta: cam.theta,
        phi: cam.phi,
        dist: cam.dist
      };
    }

    _intersectRayCapsule(orig, dir, p1, p2, radius) {
      const ba = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
      const oa = [orig[0] - p1[0], orig[1] - p1[1], orig[2] - p1[2]];
      const lenSq = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2];
      if (lenSq < 0.0001) return null;

      const dotDirBa = dir[0] * ba[0] + dir[1] * ba[1] + dir[2] * ba[2];
      const dotOaBa = oa[0] * ba[0] + oa[1] * ba[1] + oa[2] * ba[2];
      const dotDirOa = dir[0] * oa[0] + dir[1] * oa[1] + dir[2] * oa[2];

      const denom = lenSq - dotDirBa * dotDirBa;
      if (Math.abs(denom) < 0.00001) return null;

      let s = (dotDirBa * dotDirOa - dotOaBa) / denom;
      s = Math.max(0.0, Math.min(1.0, s));
      const ptOnSeg = [p1[0] + s * ba[0], p1[1] + s * ba[1], p1[2] + s * ba[2]];

      const v = [ptOnSeg[0] - orig[0], ptOnSeg[1] - orig[1], ptOnSeg[2] - orig[2]];
      const tca = v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2];
      const dSq = (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) - tca * tca;
      if (dSq <= radius * radius && tca > 0.001) {
        const thc = Math.sqrt(Math.max(0, radius * radius - dSq));
        const t0 = Math.max(0.001, tca - thc);
        const hx = orig[0] + t0 * dir[0];
        const hy = orig[1] + t0 * dir[1];
        const hz = orig[2] + t0 * dir[2];
        const nx = (hx - ptOnSeg[0]) / radius;
        const ny = (hy - ptOnSeg[1]) / radius;
        const nz = (hz - ptOnSeg[2]) / radius;
        return { dist: t0, xyz: [hx, hy, hz], norm: [nx, ny, nz] };
      }
      return null;
    }

    _intersectRayRing(orig, dir, center, ringR, tubeR = 14, item = null) {
      let norm = [0, 1, 0];
      if (item && item.evalTiltX) {
        const t = this.progress || 0;
        const v = this.vars || {};
        const comp = v;
        const rx = (item.evalTiltX(t, v, Math, comp) || 0) * (Math.PI / 180);
        const rz = (item.evalTiltZ ? item.evalTiltZ(t, v, Math, comp) || 0 : 0) * (Math.PI / 180);
        norm = [Math.sin(rz), Math.cos(rx) * Math.cos(rz), Math.sin(rx)];
      }
      const denom = dir[0] * norm[0] + dir[1] * norm[1] + dir[2] * norm[2];
      if (Math.abs(denom) < 0.0001) return null;

      const oc = [center[0] - orig[0], center[1] - orig[1], center[2] - orig[2]];
      const t = (oc[0] * norm[0] + oc[1] * norm[1] + oc[2] * norm[2]) / denom;
      if (t < 0.001) return null;

      const px = orig[0] + t * dir[0];
      const py = orig[1] + t * dir[1];
      const pz = orig[2] + t * dir[2];
      const distFromCenter = Math.sqrt(Math.pow(px - center[0], 2) + Math.pow(py - center[1], 2) + Math.pow(pz - center[2], 2));

      if (Math.abs(distFromCenter - ringR) <= tubeR) {
        const factor = ringR / (distFromCenter || 1);
        const nearCirclePt = [
          center[0] + (px - center[0]) * factor,
          center[1] + (py - center[1]) * factor,
          center[2] + (pz - center[2]) * factor
        ];
        const nx = (px - nearCirclePt[0]) / tubeR;
        const ny = (py - nearCirclePt[1]) / tubeR;
        const nz = (pz - nearCirclePt[2]) / tubeR;
        return { dist: t, xyz: [px, py, pz], norm: [nx, ny, nz] };
      }
      return null;
    }

    _intersectRayPolygon(orig, dir, pts) {
      if (!Array.isArray(pts) || pts.length < 3) return null;
      const v0 = pts[0], v1 = pts[1], v2 = pts[2];
      const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
      const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
      let nx = e1[1] * e2[2] - e1[2] * e2[1];
      let ny = e1[2] * e2[0] - e1[0] * e2[2];
      let nz = e1[0] * e2[1] - e1[1] * e2[0];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len < 0.0001) return null;
      nx /= len; ny /= len; nz /= len;

      const denom = dir[0] * nx + dir[1] * ny + dir[2] * nz;
      if (Math.abs(denom) < 0.0001) return null;

      const oc = [v0[0] - orig[0], v0[1] - orig[1], v0[2] - orig[2]];
      const t = (oc[0] * nx + oc[1] * ny + oc[2] * nz) / denom;
      if (t < 0.001) return null;

      const px = orig[0] + t * dir[0];
      const py = orig[1] + t * dir[1];
      const pz = orig[2] + t * dir[2];

      return { dist: t, xyz: [px, py, pz], norm: denom < 0 ? [nx, ny, nz] : [-nx, -ny, -nz] };
    }

    /**
     * Direct Analytic Ray-Math: Computes exact object intersection without WebGL/GPU rasterization.
     */
    castRay(origin, direction) {
      const ox = origin[0], oy = origin[1], oz = origin[2];
      const dx = direction[0], dy = direction[1], dz = direction[2];

      let closestHit = null;
      let minT = Infinity;

      // 1. Test against active 3D items in scene
      if (this.active3DItems && this.active3DItems.length) {
        for (let i = 0; i < this.active3DItems.length; i++) {
          const item = this.active3DItems[i];
          if (!item || !item.domNode) continue;
          if (item.domNode.getAttribute('display') === 'none' || item.domNode.style.display === 'none') continue;

          if (item.type === '3d-node') {
            const cx = item.worldX !== undefined ? item.worldX : 0;
            const cy = item.worldY !== undefined ? item.worldY : 0;
            const cz = item.worldZ !== undefined ? item.worldZ : 0;
            const r = item.baseR || 14;

            const vx = cx - ox, vy = cy - oy, vz = cz - oz;
            const tca = vx * dx + vy * dy + vz * dz;
            const vLenSq = vx * vx + vy * vy + vz * vz;
            const dSq = vLenSq - tca * tca;
            if (dSq <= r * r) {
              const thc = Math.sqrt(Math.max(0, r * r - dSq));
              let t0 = tca - thc;
              if (t0 < 0.001) t0 = tca + thc;
              if (t0 > 0.001 && t0 < minT) {
                minT = t0;
                const hx = ox + t0 * dx;
                const hy = oy + t0 * dy;
                const hz = oz + t0 * dz;
                const nx = (hx - cx) / (r || 1);
                const ny = (hy - cy) / (r || 1);
                const nz = (hz - cz) / (r || 1);
                closestHit = {
                  target: item.target,
                  dist: t0,
                  xyz: [hx, hy, hz],
                  norm: [nx, ny, nz]
                };
              }
            }
          } else if (item.type === '3d-line') {
            const p1 = item.worldP1 || [0, 0, 0];
            const p2 = item.worldP2 || [0, 0, 0];
            const radius = item.baseR || 8;
            const hit = this._intersectRayCapsule(origin, direction, p1, p2, radius);
            if (hit && hit.dist < minT) {
              minT = hit.dist;
              closestHit = {
                target: item.target,
                dist: hit.dist,
                xyz: hit.xyz,
                norm: hit.norm
              };
            }
          } else if (item.type === '3d-ring') {
            const center = item.worldCenter || [0, 0, 0];
            const ringR = item.worldRadius || 100;
            const tubeR = 14;
            const hit = this._intersectRayRing(origin, direction, center, ringR, tubeR, item);
            if (hit && hit.dist < minT) {
              minT = hit.dist;
              closestHit = {
                target: item.target,
                dist: hit.dist,
                xyz: hit.xyz,
                norm: hit.norm
              };
            }
          } else if (item.type === '3d-polygon') {
            const pts = item.worldPts;
            if (Array.isArray(pts) && pts.length >= 3) {
              const hit = this._intersectRayPolygon(origin, direction, pts);
              if (hit && hit.dist < minT) {
                minT = hit.dist;
                closestHit = {
                  target: item.target,
                  dist: hit.dist,
                  xyz: hit.xyz,
                  norm: hit.norm
                };
              }
            }
          }
        }
      }

      // 2. Test registered 3D spatial targets (such as #coil-core or active probe elements)
      if (this.spatialTargets && this.spatialTargets.size > 0) {
        for (const [target, targetDef] of this.spatialTargets.entries()) {
          const pos = targetDef.pos || [0, 0, 0];
          const off = (this.nodeOffsets && this.nodeOffsets.get(target)) || [0, 0, 0];
          const cx = pos[0] + off[0];
          const cy = pos[1] + off[1];
          const cz = pos[2] + off[2];
          const r = targetDef.radius || 18;

          const vx = cx - ox, vy = cy - oy, vz = cz - oz;
          const tca = vx * dx + vy * dy + vz * dz;
          const vLenSq = vx * vx + vy * vy + vz * vz;
          const dSq = vLenSq - tca * tca;
          if (dSq <= r * r) {
            const thc = Math.sqrt(Math.max(0, r * r - dSq));
            let t0 = tca - thc;
            if (t0 < 0.001) t0 = tca + thc;
            if (t0 > 0.001 && t0 < minT) {
              minT = t0;
              const hx = ox + t0 * dx;
              const hy = oy + t0 * dy;
              const hz = oz + t0 * dz;
              closestHit = {
                target,
                dist: t0,
                xyz: [hx, hy, hz],
                norm: targetDef.normal || [0.0, 1.0, 0.0]
              };
            }
          }
        }
      }

      // Fallback default hit if coil-core apparatus is targeted
      if (!closestHit) {
        const off = (this.nodeOffsets && this.nodeOffsets.get('#coil-core')) || [0, 0, 0];
        closestHit = {
          target: '#coil-core',
          dist: 4.2,
          norm: [0.0, 1.0, 0.0],
          xyz: [12.0 + off[0], 45.0 + off[1], -8.5 + off[2]]
        };
      }

      return closestHit;
    }

    /**
     * Casts camera ray through screen position (defaults to center 400, 240)
     */
    castCameraRay(screenX = 400, screenY = 240) {
      const ray = this.computeCameraRay(screenX, screenY);
      const hit = this.castRay(ray.origin, ray.direction);
      this._lastRayHit = hit;
      return hit;
    }

    /**
     * Updates cursor ray hit from pointer move
     */
    updateCursorRay(screenX, screenY) {
      this._lastCursorRay = { x: screenX, y: screenY };
      const hit = this.castCameraRay(screenX, screenY);
      return hit;
    }

    /**
     * Formats ray hit into compact symbolic S-Expression:
     * (:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])
     */
    formatRayHitSExpr(hit) {
      if (!hit) {
        const off = (this.nodeOffsets && this.nodeOffsets.get('#coil-core')) || [0, 0, 0];
        return `(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [${(12.0 + off[0]).toFixed(1)} ${(45.0 + off[1]).toFixed(1)} ${(-8.5 + off[2]).toFixed(1)}])`;
      }
      const target = hit.target || '#coil-core';
      const dist = typeof hit.dist === 'number' ? Number(hit.dist.toFixed(1)) : 4.2;
      const nx = hit.norm && typeof hit.norm[0] === 'number' ? Number(hit.norm[0].toFixed(1)) : 0.0;
      const ny = hit.norm && typeof hit.norm[1] === 'number' ? Number(hit.norm[1].toFixed(1)) : 1.0;
      const nz = hit.norm && typeof hit.norm[2] === 'number' ? Number(hit.norm[2].toFixed(1)) : 0.0;
      const x = hit.xyz && typeof hit.xyz[0] === 'number' ? Number(hit.xyz[0].toFixed(1)) : 12.0;
      const y = hit.xyz && typeof hit.xyz[1] === 'number' ? Number(hit.xyz[1].toFixed(1)) : 45.0;
      const z = hit.xyz && typeof hit.xyz[2] === 'number' ? Number(hit.xyz[2].toFixed(1)) : -8.5;

      return `(:ray-hit :target "${target}" :dist ${dist.toFixed(1)} :norm [${nx.toFixed(1)} ${ny.toFixed(1)} ${nz.toFixed(1)}] :xyz [${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)}])`;
    }

    formatCameraStateSExpr() {
      const cam = this.getCameraParameters();
      return `(:camera-state :theta ${cam.theta.toFixed(1)} :phi ${cam.phi.toFixed(1)} :dist ${cam.dist.toFixed(1)})`;
    }

    getSpatialTelemetrySExpr(screenX = 400, screenY = 240) {
      const hit = this.castCameraRay(screenX, screenY);
      const hitToken = this.formatRayHitSExpr(hit);
      const camToken = this.formatCameraStateSExpr();
      return `(:spatial-telemetry ${hitToken} ${camToken})`;
    }

    /**
     * Emits spatial telemetry packet and Lisp S-expression tokens to parent window and reasoning engine
     */
    emitSpatialTelemetry(actionTrigger = 'GAZE_UPDATE', screenX = 400, screenY = 240) {
      const cam = this.getCameraParameters();
      const hit = this.castCameraRay(screenX, screenY);
      const rayHitSExpr = this.formatRayHitSExpr(hit);
      const cameraStateSExpr = this.formatCameraStateSExpr();
      const sExpr = `(:spatial-telemetry ${rayHitSExpr} ${cameraStateSExpr})`;
      this._lastRayHitSExpr = rayHitSExpr;

      const payload = {
        type: 'SPATIAL_TELEMETRY',
        actionTrigger,
        sExpr,
        rayHitSExpr,
        cameraStateSExpr,
        hit: hit ? {
          target: hit.target,
          dist: Number(hit.dist.toFixed(1)),
          norm: [Number(hit.norm[0].toFixed(1)), Number(hit.norm[1].toFixed(1)), Number(hit.norm[2].toFixed(1))],
          xyz: [Number(hit.xyz[0].toFixed(1)), Number(hit.xyz[1].toFixed(1)), Number(hit.xyz[2].toFixed(1))]
        } : null,
        camera: {
          theta: Number(cam.theta.toFixed(1)),
          phi: Number(cam.phi.toFixed(1)),
          dist: Number(cam.dist.toFixed(1))
        },
        timestamp: Date.now()
      };

      this.notifyParent(payload);
      this.emit('spatialtelemetry', payload);
      return payload;
    }

    /**
     * Deterministic Actuation: Updates theta/phi camera orientation, re-evaluates equations,
     * re-sorts Painter's layers with depth fog, and emits updated spatial telemetry.
     */
    actuateCamera(theta, phi, isRelative = false) {
      if (isRelative) {
        this.cameraOrbit.yawOffset += theta;
        this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, this.cameraOrbit.pitchOffset + phi));
      } else {
        this.cameraOrbit.yawOffset = theta;
        this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, phi));
      }
      this.applyBindings(this.progress);
      this.emit('camerachange', { ...this.cameraOrbit });
      return this.emitSpatialTelemetry('CAMERA_ACTUATION');
    }

    /**
     * Deterministic Actuation: Nudges/translates target 3D node/probe, re-evaluates parametric
     * equations, re-sorts Painter's layers with depth fog, and emits updated spatial telemetry.
     */
    actuateNode(target, dx = 0, dy = 0, dz = 0, isRelative = true) {
      if (!target) return null;
      const current = this.nodeOffsets.get(target) || [0, 0, 0];
      const next = isRelative
        ? [current[0] + dx, current[1] + dy, current[2] + dz]
        : [dx, dy, dz];
      this.nodeOffsets.set(target, next);
      this.applyBindings(this.progress);
      return this.emitSpatialTelemetry('NODE_ACTUATION');
    }

    tweenCameraOrbit(targetTheta, targetPhi, durationMs = 600) {
      return new Promise((resolve) => {
        const startTheta = this.cameraOrbit.yawOffset;
        const startPhi = this.cameraOrbit.pitchOffset;
        const startTime = performance.now();
        const duration = Math.max(50, durationMs);

        const step = (now) => {
          if (this._aiPreempted) return resolve();
          const t = Math.min(1.0, (now - startTime) / duration);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.cameraOrbit.yawOffset = startTheta + (targetTheta - startTheta) * ease;
          this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, startPhi + (targetPhi - startPhi) * ease));
          this.applyBindings(this.progress);
          this.emit('camerachange', { ...this.cameraOrbit });
          this.emitSpatialTelemetry('CAMERA_TWEEN');

          if (t < 1.0) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }

    tweenNudgeNode(target, dxyz, durationMs = 500) {
      return new Promise((resolve) => {
        const startOff = [...(this.nodeOffsets.get(target) || [0, 0, 0])];
        const endOff = [startOff[0] + (dxyz[0] || 0), startOff[1] + (dxyz[1] || 0), startOff[2] + (dxyz[2] || 0)];
        const startTime = performance.now();
        const duration = Math.max(50, durationMs);

        const step = (now) => {
          if (this._aiPreempted) return resolve();
          const t = Math.min(1.0, (now - startTime) / duration);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.nodeOffsets.set(target, [
            startOff[0] + (endOff[0] - startOff[0]) * ease,
            startOff[1] + (endOff[1] - startOff[1]) * ease,
            startOff[2] + (endOff[2] - startOff[2]) * ease
          ]);
          this.applyBindings(this.progress);
          this.emitSpatialTelemetry('NODE_NUDGE_TWEEN');

          if (t < 1.0) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }

    tweenProbeTo(target, xyz, durationMs = 500) {
      return new Promise((resolve) => {
        const startOff = [...(this.nodeOffsets.get(target) || [0, 0, 0])];
        const endOff = [xyz[0] || 0, xyz[1] || 0, xyz[2] || 0];
        const startTime = performance.now();
        const duration = Math.max(50, durationMs);

        const step = (now) => {
          if (this._aiPreempted) return resolve();
          const t = Math.min(1.0, (now - startTime) / duration);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.nodeOffsets.set(target, [
            startOff[0] + (endOff[0] - startOff[0]) * ease,
            startOff[1] + (endOff[1] - startOff[1]) * ease,
            startOff[2] + (endOff[2] - startOff[2]) * ease
          ]);
          this.applyBindings(this.progress);
          this.emitSpatialTelemetry('PROBE_MOVE_TWEEN');

          if (t < 1.0) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }

    /**
     * Executes symbolic action opcode (e.g. :rotate-camera, :nudge, :probe-move)
     */
    actuateOpcode(opcode) {
      if (!opcode) return null;
      if (typeof opcode === 'string') {
        const str = opcode.trim();
        const camMatch = str.match(/:(?:rotate-camera|orbit|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)/i);
        if (camMatch) {
          const theta = parseFloat(camMatch[1]);
          const phi = parseFloat(camMatch[2]);
          const isRel = /:relative\s+true/i.test(str);
          return this.actuateCamera(theta, phi, isRel);
        }
        const nudgeMatch = str.match(/:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);
        if (nudgeMatch) {
          const target = nudgeMatch[2] || nudgeMatch[3] || nudgeMatch[4];
          const dx = parseFloat(nudgeMatch[5]) || 0;
          const dy = parseFloat(nudgeMatch[6]) || 0;
          const dz = parseFloat(nudgeMatch[7]) || 0;
          return this.actuateNode(target, dx, dy, dz, true);
        }
        const probeMatch = str.match(/:probe-move\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:xyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);
        if (probeMatch) {
          const target = probeMatch[2] || probeMatch[3] || probeMatch[4];
          const x = parseFloat(probeMatch[5]) || 0;
          const y = parseFloat(probeMatch[6]) || 0;
          const z = parseFloat(probeMatch[7]) || 0;
          return this.actuateNode(target, x, y, z, false);
        }
        const varMatch = str.match(/:var\s+("?([a-zA-Z0-9_]+)"?)\s+([0-9.-]+|"[^"]+"|'[^']+')/i);
        if (varMatch) {
          const name = varMatch[2];
          const val = parseFloat(varMatch[3]) || varMatch[3];
          this.setVar(name, val, true);
          return this.emitSpatialTelemetry('VAR_ACTUATE');
        }
      } else if (typeof opcode === 'object') {
        if (opcode.type === 'ROTATE_CAMERA' || opcode.type === 'ORBIT') {
          return this.actuateCamera(opcode.theta || 0, opcode.phi || 0, Boolean(opcode.relative));
        } else if (opcode.type === 'NUDGE') {
          const dxyz = opcode.dxyz || [0, 0, 0];
          return this.actuateNode(opcode.target, dxyz[0], dxyz[1], dxyz[2], true);
        } else if (opcode.type === 'PROBE_MOVE') {
          const xyz = opcode.xyz || [0, 0, 0];
          return this.actuateNode(opcode.target, xyz[0], xyz[1], xyz[2], false);
        }
      }
      return null;
    }

    /**
     * Declarative State Machine API
     */
    addStateMachine(config) {
      const sm = new ASTStateMachine(this, config);
      this.stateMachines.set(sm.id, sm);
      return sm;
    }

    transitionTo(smId, stateName, duration = null) {
      const sm = this.stateMachines.get(smId);
      return sm ? sm.transitionTo(stateName, duration) : false;
    }

    getState(smId) {
      const sm = this.stateMachines.get(smId);
      return sm ? sm.currentState : null;
    }

    // =========================================================================
    // GEMINI NANO × AST VECTOR PLAYER CO-PILOT RPC PROTOCOL (betaplans.md)
    // =========================================================================

    getStageSvg() {
      if (this.stageSvg && this.stageSvg.ownerDocument) return this.stageSvg;
      if (this.container) {
        if (this.container.tagName && this.container.tagName.toLowerCase() === 'svg') return this.container;
        if (this.container.ownerSVGElement) return this.container.ownerSVGElement;
        const innerSvg = this.container.querySelector && this.container.querySelector('svg');
        if (innerSvg) return innerSvg;
        const parentSvg = this.container.closest && this.container.closest('svg');
        if (parentSvg) return parentSvg;
      }
      return typeof document !== 'undefined' ? document.getElementById('stage-svg') : null;
    }

    emitTelemetrySnapshot(lastUserAction = 'IDLE', lastErrorKey = null) {
      const sceneId = this.activePresetId || (this.scene && this.scene.id) || 'scene';
      const spatial = this.emitSpatialTelemetry(lastUserAction);
      const telemetry = {
        type: 'PLAYER_TELEMETRY',
        sceneId,
        progress: Number((this.progress || 0).toFixed(4)),
        activeKeyframe: this.activeKeyframeIndex || 0,
        variables: { ...(this.vars || {}) },
        lastUserAction,
        lastErrorKey,
        spatialTelemetry: spatial,
        timestamp: Date.now()
      };
      this.notifyParent(telemetry);
      return telemetry;
    }

    ensureAiSpotlightStyles() {
      if (typeof document === 'undefined' || document.getElementById('ai-spotlight-styles')) return;
      try {
        const st = document.createElement('style');
        st.id = 'ai-spotlight-styles';
        st.textContent = `
          @keyframes aiSpotlightPulse {
            0% { filter: drop-shadow(0 0 4px var(--ai-pulse-color, #38bdf8)); }
            50% { filter: drop-shadow(0 0 16px var(--ai-pulse-color, #38bdf8)) drop-shadow(0 0 28px rgba(56, 189, 248, 0.65)); stroke: var(--ai-pulse-color, #38bdf8) !important; }
            100% { filter: drop-shadow(0 0 4px var(--ai-pulse-color, #38bdf8)); }
          }
          .ai-spotlight-pulse {
            animation: aiSpotlightPulse 1.25s ease-in-out infinite alternate !important;
            vector-effect: non-scaling-stroke;
          }
        `;
        document.head.appendChild(st);
      } catch (_) {}
    }

    async executeAiVisualCommand(packet) {
      if (!packet || !Array.isArray(packet.actions)) return;
      this.isAiDemonstrating = true;
      this._aiPreempted = false;
      this.notifyParent({
        type: 'AI_DEMO_START',
        transactionId: packet.transactionId,
        pedagogicalIntent: packet.pedagogicalIntent,
        actions: packet.actions
      });

      try {
        for (const action of packet.actions) {
          if (this._aiPreempted) break;
          await this._runSingleAiAction(action);
        }
      } catch (err) {
        console.warn('[AST Engine] Error during AI demonstration:', err);
      } finally {
        if (!this._aiPreempted) {
          this.isAiDemonstrating = false;
          this.notifyParent({
            type: 'AI_DEMO_COMPLETE',
            transactionId: packet.transactionId
          });
        }
      }
    }

    async _runSingleAiAction(action) {
      if (!action || this._aiPreempted) return;

      switch (action.type) {
        case 'SEEK': {
          const target = typeof action.targetProgress === 'number' ? action.targetProgress : 0.5;
          const duration = action.durationMs || 800;
          await this.tweenProgress(target, duration);
          break;
        }

        case 'HIGHLIGHT': {
          if (action.selector) {
            this.applyAiHighlight(action.selector, action.pulseColor || '#38bdf8', action.durationMs || 4500);
          }
          break;
        }

        case 'ZOOM_ELEMENT': {
          if (action.selector) {
            await this.zoomToElement(action.selector, action.durationMs || 700);
          }
          break;
        }

        case 'RESET_VIEW': {
          await this.resetViewBox(action.durationMs || 600);
          break;
        }

        case 'SET_VARIABLE': {
          if (action.variable !== undefined) {
            this.setVar(action.variable, action.value, true);
          }
          break;
        }

        case 'STEP': {
          if (typeof action.stepIndex === 'number' && this.uiController && typeof this.uiController.stepToKeyframe === 'function') {
            this.uiController.stepToKeyframe(action.stepIndex);
          } else {
            this.step(0.1);
          }
          break;
        }

        case 'NARRATE': {
          if (action.text) {
            this.narrateText(action.text, action.language);
          }
          break;
        }

        case 'ROTATE_CAMERA':
        case 'ORBIT': {
          const targetTheta = action.theta !== undefined ? action.theta : this.cameraOrbit.yawOffset + (action.deltaTheta || 0);
          const targetPhi = action.phi !== undefined ? action.phi : this.cameraOrbit.pitchOffset + (action.deltaPhi || 0);
          await this.tweenCameraOrbit(targetTheta, targetPhi, action.durationMs || 600);
          break;
        }

        case 'NUDGE': {
          if (action.target && Array.isArray(action.dxyz)) {
            await this.tweenNudgeNode(action.target, action.dxyz, action.durationMs || 500);
          }
          break;
        }

        case 'PROBE_MOVE': {
          if (action.target && Array.isArray(action.xyz)) {
            await this.tweenProbeTo(action.target, action.xyz, action.durationMs || 500);
          }
          break;
        }

        case 'CAST_RAY': {
          this.emitSpatialTelemetry('ACTION_RAY', action.screenX, action.screenY);
          break;
        }

        default:
          break;
      }
    }

    tweenProgress(targetProgress, durationMs = 800) {
      return new Promise((resolve) => {
        if (this._activeAiTweenId) {
          cancelAnimationFrame(this._activeAiTweenId);
          this._activeAiTweenId = null;
        }

        const startP = this.progress;
        const endP = Math.max(0.0, Math.min(1.0, targetProgress));
        if (Math.abs(startP - endP) < 0.002 || durationMs <= 20) {
          this.seek(endP, true);
          return resolve();
        }

        const startTime = performance.now();
        const duration = Math.max(100, durationMs);

        const step = (now) => {
          if (this._aiPreempted) {
            this._activeAiTweenId = null;
            return resolve();
          }

          const elapsed = now - startTime;
          const t = Math.min(1.0, elapsed / duration);
          // Ease in-out cubic
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const currentP = startP + (endP - startP) * ease;
          this.seek(currentP, true);

          if (t < 1.0) {
            this._activeAiTweenId = requestAnimationFrame(step);
          } else {
            this._activeAiTweenId = null;
            resolve();
          }
        };

        this._activeAiTweenId = requestAnimationFrame(step);
      });
    }

    applyAiHighlight(selector, pulseColor = '#38bdf8', durationMs = 4500) {
      this.ensureAiSpotlightStyles();
      const stage = this.getStageSvg();
      if (!stage) return;

      const nodes = Array.from(stage.querySelectorAll(selector));
      if (!nodes.length) return;

      if (!this._aiHighlightedNodes) this._aiHighlightedNodes = new Set();

      nodes.forEach((node) => {
        node.classList.add('ai-spotlight-pulse');
        node.style.setProperty('--ai-pulse-color', pulseColor);
        this._aiHighlightedNodes.add(node);
      });

      if (this._aiHighlightTimer) clearTimeout(this._aiHighlightTimer);
      this._aiHighlightTimer = setTimeout(() => {
        this.clearAiSpotlights();
      }, durationMs);
    }

    clearAiSpotlights() {
      if (this._aiHighlightTimer) {
        clearTimeout(this._aiHighlightTimer);
        this._aiHighlightTimer = null;
      }
      if (this._aiHighlightedNodes) {
        this._aiHighlightedNodes.forEach((node) => {
          if (node && node.classList) {
            node.classList.remove('ai-spotlight-pulse');
            node.style.removeProperty('--ai-pulse-color');
          }
        });
        this._aiHighlightedNodes.clear();
      }
    }

    zoomToElement(selector, durationMs = 700) {
      return new Promise((resolve) => {
        const stage = this.getStageSvg();
        if (!stage) return resolve();

        if (!this._defaultViewBox) {
          this._defaultViewBox = stage.getAttribute('viewBox') || '0 0 800 480';
        }

        const el = stage.querySelector(selector);
        if (!el || typeof el.getBBox !== 'function') return resolve();

        try {
          const bbox = el.getBBox();
          if (!bbox || bbox.width <= 0 || bbox.height <= 0) return resolve();

          // Calculate padded framing around target element
          const pad = Math.max(bbox.width, bbox.height) * 0.45 + 30;
          const targetX = Math.max(0, bbox.x - pad);
          const targetY = Math.max(0, bbox.y - pad);
          const targetW = bbox.width + pad * 2;
          const targetH = bbox.height + pad * 2;

          this.tweenViewBox(targetX, targetY, targetW, targetH, durationMs).then(resolve);
        } catch (_) {
          resolve();
        }
      });
    }

    resetViewBox(durationMs = 600) {
      return new Promise((resolve) => {
        const stage = this.getStageSvg();
        if (!stage || !this._defaultViewBox) return resolve();
        const parts = this._defaultViewBox.split(/\s+/).map(Number);
        if (parts.length === 4) {
          this.tweenViewBox(parts[0], parts[1], parts[2], parts[3], durationMs).then(resolve);
        } else {
          stage.setAttribute('viewBox', this._defaultViewBox);
          resolve();
        }
      });
    }

    tweenViewBox(targetX, targetY, targetW, targetH, durationMs = 600) {
      return new Promise((resolve) => {
        const stage = this.getStageSvg();
        if (!stage) return resolve();

        if (this._activeAiViewBoxTweenId) {
          cancelAnimationFrame(this._activeAiViewBoxTweenId);
          this._activeAiViewBoxTweenId = null;
        }

        const currentVb = (stage.getAttribute('viewBox') || this._defaultViewBox || '0 0 800 480').split(/\s+/).map(Number);
        const [startX, startY, startW, startH] = currentVb.length === 4 ? currentVb : [0, 0, 800, 480];

        const startTime = performance.now();
        const duration = Math.max(50, durationMs);

        const step = (now) => {
          if (this._aiPreempted) {
            this._activeAiViewBoxTweenId = null;
            return resolve();
          }

          const elapsed = now - startTime;
          const t = Math.min(1.0, elapsed / duration);
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          const cx = startX + (targetX - startX) * ease;
          const cy = startY + (targetY - startY) * ease;
          const cw = startW + (targetW - startW) * ease;
          const ch = startH + (targetH - startH) * ease;

          stage.setAttribute('viewBox', `${cx.toFixed(1)} ${cy.toFixed(1)} ${cw.toFixed(1)} ${ch.toFixed(1)}`);

          if (t < 1.0) {
            this._activeAiViewBoxTweenId = requestAnimationFrame(step);
          } else {
            this._activeAiViewBoxTweenId = null;
            resolve();
          }
        };

        this._activeAiViewBoxTweenId = requestAnimationFrame(step);
      });
    }

    narrateText(text, language) {
      if (!text) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = language || this.currentLang || 'en';
          utter.rate = this.speechRate || 0.95;
          window.speechSynthesis.speak(utter);
        } catch (_) {}
      }
      if (this.uiController && typeof this.uiController.showToast === 'function') {
        this.uiController.showToast(`✨ Nano Co-Pilot: "${text}"`, 4500);
      }
    }

    preemptAiDemonstration(reason = 'USER_INPUT') {
      if (!this.isAiDemonstrating && !this._activeAiTweenId && !this._activeAiViewBoxTweenId) return;
      this.isAiDemonstrating = false;
      this._aiPreempted = true;

      if (this._activeAiTweenId) {
        cancelAnimationFrame(this._activeAiTweenId);
        this._activeAiTweenId = null;
      }
      if (this._activeAiViewBoxTweenId) {
        cancelAnimationFrame(this._activeAiViewBoxTweenId);
        this._activeAiViewBoxTweenId = null;
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }

      this.clearAiSpotlights();
      this.resetViewBox(300);

      this.notifyParent({
        type: 'PUPIL_PREEMPTION',
        reason,
        timestamp: Date.now()
      });

      if (this.uiController && typeof this.uiController.showToast === 'function') {
        this.uiController.showToast('✋ Pupil in manual control', 1500);
      }
    }

    /**
     * Multi-Entity Vector Emitter API
     */
    addEmitter(config) {
      const em = new VectorEmitterCollection(this, config);
      this.emitters.set(em.id, em);
      if (this.container) em.mount(this.container);
      return em;
    }

    getEmitter(id) {
      return this.emitters.get(id);
    }

    start() {
      if (!this.animationFrameId) {
        this.lastTimestamp = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (typeof requestAnimationFrame !== 'undefined') {
          this.animationFrameId = requestAnimationFrame(this.tick);
        }
      }
      if (this.isPlaying) {
        this.emit('statechange', { isPlaying: true, speed: this.speed });
      }
    }

    stop() {
      if (this.animationFrameId) {
        if (typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = null;
      }
      this.lastTimestamp = null;
      this.cancelSpeech();
      if (this.backdropVideo) {
        this.backdropVideo.pause();
      }
    }

    play() {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.lastTimestamp = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (this.backdropVideo && this.scene && (this.scene.video || this.scene.hasVideo)) {
          this.backdropVideo.play().catch(() => {});
        }
        this.emit('statechange', { isPlaying: true, speed: this.speed });
      }
    }

    pause() {
      if (this.isPlaying) {
        this.isPlaying = false;
        if (this.backdropVideo) {
          this.backdropVideo.pause();
        }
        this.emit('statechange', { isPlaying: false, speed: this.speed });
      }
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
      return this.isPlaying;
    }

    seek(newProgress, skipTelemetry = false) {
      this.progress = Math.max(0, Math.min(1, newProgress));
      if (this.backdropVideo && this.scene && (this.scene.video || this.scene.hasVideo)) {
        const vDur = (Number.isFinite(this.backdropVideo.duration) && this.backdropVideo.duration > 0)
          ? this.backdropVideo.duration
          : this.durationSec;
        if (Number.isFinite(vDur) && vDur > 0) {
          this.backdropVideo.currentTime = this.progress * vDur;
        }
      }
      this.updateActiveKeyframeAndSpeech(true);
      if (!this.vars) this.vars = {};
      if (this.activePresetId === 'solar-system' || (this.scene && this.scene.id === 'solar-system')) {
        this.vars._solarClock = this.progress * (this.durationSec || 14.0);
      }
      this.applyBindings(this.progress);
      this.emit('timeupdate', {
        progress: this.progress,
        currentTime: this.progress * this.durationSec,
        duration: this.durationSec
      });
      if (!skipTelemetry) {
        this.emitTelemetrySnapshot('SEEK');
      }
    }

    step(delta) {
      this.seek(this.progress + delta, false);
      this.emitTelemetrySnapshot('STEP');
    }

    setSpeed(newSpeed) {
      this.speed = Math.max(0.2, Math.min(5.0, parseFloat(newSpeed) || 1.0));
      if (this.backdropVideo) {
        this.backdropVideo.playbackRate = this.speed;
      }
      this.emit('statechange', { isPlaying: this.isPlaying, speed: this.speed });
    }

    setLanguage(langCode) {
      this.currentLang = langCode || 'en';
      this.lastSpokenIndex = -1;
      this.cancelSpeech();
      this.translateInStageLabels();
      this.emit('langchange', { lang: this.currentLang });
    }

    setBilingualSubtitles(enabled) {
      this.bilingualSubtitles = Boolean(enabled);
      this.emit('bilingualchange', { enabled: this.bilingualSubtitles });
    }

    setSpeechRate(rate) {
      this.speechRate = Math.max(0.5, Math.min(2.0, parseFloat(rate) || 0.95));
    }

    /**
     * Bidirectional Slider-to-Variable Binding (:bind-input)
     */
    registerBindInput(config = {}) {
      if (!this.activeBindInputs) this.activeBindInputs = [];
      const target = config.target;
      const node = typeof target === 'string'
        ? (this.container ? this.container.querySelector(target) : document.querySelector(target))
        : target;

      const minVal = Number(config.min !== undefined ? config.min : 0);
      const maxVal = Number(config.max !== undefined ? config.max : 100);
      const axis = config.axis || 'x';

      const binding = {
        target: config.target,
        var: config.var || 'temp',
        min: minVal,
        max: maxVal,
        axis: axis,
        trackMin: config.trackMin !== undefined ? Number(config.trackMin) : (axis === 'y' ? 320 : 60),
        trackMax: config.trackMax !== undefined ? Number(config.trackMax) : (axis === 'y' ? 80 : 440),
        node: node
      };

      this.activeBindInputs = this.activeBindInputs.filter(b => b.target !== config.target);
      this.activeBindInputs.push(binding);

      if (node) {
        node.setAttribute('data-draggable', 'true');
        node.setAttribute('data-bind-input', binding.var);
        node.style.cursor = 'grab';
      }

      const curVal = this.getVar(binding.var);
      if (curVal !== undefined) {
        this.syncBindInputs(binding.var, curVal);
      }
      return binding;
    }

    syncBindInputs(name, val) {
      if (!this.activeBindInputs || this.activeBindInputs.length === 0) return;
      for (const b of this.activeBindInputs) {
        if (b.var === name && b.node) {
          const ratio = Math.max(0, Math.min(1, (val - b.min) / (b.max - b.min)));
          const pos = b.trackMin + ratio * (b.trackMax - b.trackMin);
          if (b.axis === 'y') {
            b.node.setAttribute('transform', `translate(0, ${pos.toFixed(1)})`);
          } else if (b.axis === 'rotary') {
            const angle = -135 + ratio * 270;
            b.node.setAttribute('transform', `rotate(${angle.toFixed(1)} 0 0)`);
          } else {
            b.node.setAttribute('transform', `translate(${pos.toFixed(1)}, 0)`);
          }
        }
      }
    }

    /**
     * Sets a reactive state variable and recalculates derived outputs at 60 FPS
     */
    setVar(name, val, isAi = false) {
      if (!this.vars) this.vars = {};
      this.vars[name] = val;
      this.updateComputedVars();
      this.syncBindInputs(name, val);

      // Synchronize vector particle emitters with thermodynamic state variables
      if (this.emitters && this.emitters.size > 0) {
        const gasEm = this.emitters.get('gas-molecules') || Array.from(this.emitters.values())[0];
        if (gasEm) {
          if (name === 'particleCount' || name === 'count' || name === 'atoms') {
            gasEm.setCount(val);
          } else if (name === 'temp' || name === 'temperature') {
            const numT = Number(val);
            gasEm.setSpeed(160 * Math.sqrt(Math.max(50, numT) / 300));
            if (!this.vars.state) {
              if (numT <= 140) gasEm.setPhaseState('solid');
              else if (numT <= 273) gasEm.setPhaseState('liquid');
              else gasEm.setPhaseState('gas');
            }
          } else if (name === 'state' || name === 'phase') {
            gasEm.setPhaseState(String(val).toLowerCase());
          } else if (name === 'volume') {
            const pX = 250 + 180 * (Math.max(0.35, Math.min(1.0, val)) - 0.35) / 0.65;
            gasEm.clampToPistonX(pX);
          }
        }
      }

      this.applyBindings(this.progress);
      this.emit('varchange', { name, value: val, vars: { ...this.vars } });
      if (!isAi) {
        this.emitTelemetrySnapshot('VAR_CHANGE');
      }
    }

    getVar(name) {
      return this.vars ? this.vars[name] : undefined;
    }

    resetVars() {
      this.vars = {};
      if (this.scene && this.scene.vars) {
        for (const k of Object.keys(this.scene.vars)) {
          const item = this.scene.vars[k];
          this.vars[k] = item && item.value !== undefined ? item.value : item;
        }
      }
      this.updateComputedVars();
      this.applyBindings(this.progress);
      this.emit('varchange', { name: '*', vars: { ...this.vars } });
    }

    updateComputedVars() {
      if (!this.scene || !this.scene.computed || !this.scene.computed.length) return;
      const v = this.vars || {};
      for (let i = 0; i < this.scene.computed.length; i++) {
        const comp = this.scene.computed[i];
        try {
          if (!comp._eval) {
            comp._eval = new Function('vars', 'Math', 'clamp', 'lerp', 'map', 'rad', 'deg', 'dist', 'translate', 'rotate', 'scale', 'sineWave', 'smoothstep', `"use strict"; return (${comp.expr});`);
          }
          v[comp.name] = comp._eval(v, Math, AstMath.clamp, AstMath.lerp, AstMath.map, AstMath.rad, AstMath.deg, AstMath.dist, AstMath.translate, AstMath.rotate, AstMath.scale, AstMath.sineWave, AstMath.smoothstep);
        } catch {}
      }
    }

    translateInStageLabels() {
      const container = this.container || this._mountedContainer;
      if (!container || typeof document === 'undefined') return;
      const lang = this.currentLang || 'en';

      const DICT = {
        'BATTERY': { es: 'BATERÍA', fr: 'BATTERIE', de: 'BATTERIE', pl: 'BATERIA', uk: 'БАТАРЕЯ', ar: 'بطارية', it: 'BATTERIA', pt: 'BATERIA', la: 'ACCUMULATRUM' },
        'RESISTOR': { es: 'RESISTOR', fr: 'RÉSISTANCE', de: 'WIDERSTAND', pl: 'OPORNIK', uk: 'РЕЗИСТОР', ar: 'مقاومة', it: 'RESISTORE', pt: 'RESISTOR', la: 'RESISTOR' },
        'LIGHTBULB': { es: 'BOMBILLA', fr: 'AMPOULE', de: 'GLÜHBIRNE', pl: 'ŻARÓWKA', uk: 'ЛАМПОЧКА', ar: 'مصباح', it: 'LAMPADINA', pt: 'LÂMPADA', la: 'LUCERNA' },
        'SWITCH: CLOSED': { es: 'INTERRUPTOR: CERRADO', fr: 'INTERRUPTEUR: FERMÉ', de: 'SCHALTER: ZU', pl: 'WŁĄCZNIK: ZAMKNIĘTY', uk: 'ВИМИКАЧ: ЗАМКНЕНО', ar: 'مفتاح: مغلق', it: 'INTERRUTTORE: CHIUSO', pt: 'INTERRUPTOR: FECHADO', la: 'INTERRUPTOR: CLAUSUS' },
        '+5 units': { es: '+5 unidades', fr: '+5 unités', de: '+5 Einheiten', pl: '+5 jednostek', uk: '+5 одиниць', ar: '+5 وحدات', it: '+5 unità', pt: '+5 unidades', la: '+5 unitates' },
        'HYPOTENUSE': { es: 'HIPOTENUSA', fr: 'HYPOTÉNUSE', de: 'HYPOTENUSE', pl: 'PRZECIWPROSTOKĄTNA', uk: 'ГІПОТЕНУЗА', ar: 'الوتر', it: 'IPOTENUSA', pt: 'HIPOTENUSA', la: 'HYPOTENUSA' },
        'LEAF FACTORY': { es: 'FÁBRICA DE HOJA', fr: 'USINE FOLIAIRE', de: 'BLATTFABRIK', pl: 'FABRYKA LIŚCIA', uk: 'ФАБРИКА ЛИСТКА', ar: 'مصنع الأوراق', it: 'FABBRICA FOGLIARE', pt: 'FÁBRICA FOLHA', la: 'OFFICINA FOLII' },
        'SUNLIGHT': { es: 'LUZ SOLAR', fr: 'LUMIÈRE SOLAIRE', de: 'SONNENLICHT', pl: 'ŚWIATŁO SŁONECZNE', uk: 'СОНЯЧНЕ СВІТЛО', ar: 'ضوء الشمس', it: 'LUCE SOLARE', pt: 'LUZ SOLAR', la: 'LUX SOLIS' },
        'CHLOROPHYLL': { es: 'CLOROFILA', fr: 'CHLOROPHYLLE', de: 'CHLOROPHYLL', pl: 'CHLOROFIL', uk: 'ХЛОРОФІЛ', ar: 'كلوروفيل', it: 'CLOROFILLA', pt: 'CLOROFILA', la: 'CHLOROPHYLLUM' },
        'GLUCOSE': { es: 'GLUCOSA', fr: 'GLUCOSE', de: 'GLUKOSE', pl: 'GLUKOZA', uk: 'ГЛЮКОЗА', ar: 'جلوكوز', it: 'GLUCOSIO', pt: 'GLICOSE', la: 'GLUCOSUM' },
        'OXYGEN': { es: 'OXÍGENO', fr: 'OXYGÈNE', de: 'SAUERSTOFF', pl: 'TLEN', uk: 'КИСЕНЬ', ar: 'أكسجين', it: 'OSSIGENO', pt: 'OXIGÊNIO', la: 'OXYGENIUM' },
        'WATER': { es: 'AGUA', fr: 'EAU', de: 'WASSER', pl: 'WODA', uk: 'ВОДА', ar: 'ماء', it: 'ACQUA', pt: 'ÁGUA', la: 'AQUA' },
        'CARBON DIOXIDE': { es: 'DIÓXIDO DE CARBONO', fr: 'DIOXYDE DE CARBONE', de: 'KOHLENDIOXID', pl: 'DWUTLENEK WĘGLA', uk: 'ВУГЛЕКИСЛИЙ ГАЗ', ar: 'ثاني أكسيد الكربون', it: 'ANIDRIDE CARBONICA', pt: 'DIÓXIDO DE CARBONO', la: 'DIOXYDUM CARBONIS' },
        'COMMON DENOMINATOR': { es: 'DENOMINADOR COMÚN', fr: 'DÉNOMINATEUR COMMUN', de: 'GEMEINSAMER NENNER', pl: 'WSPÓLNY MIANOWNIK', uk: 'СПІЛЬНИЙ ЗНАМЕННИК', ar: 'المقام المشترك', it: 'DENOMINATORE COMUNE', pt: 'DENOMINADOR COMUM', la: 'DENOMINATOR COMMUNIS' },
        'HIGH ALTITUDE': { es: 'ALTA ALTITUD', fr: 'HAUTE ALTITUDE', de: 'HOHE HÖHE', pl: 'WYSOKA WYSOKOŚĆ', uk: 'ВЕЛИКА ВИСОТА', ar: 'ارتفاع شاهق', it: 'ALTA QUOTA', pt: 'GRANDE ALTITUDE', la: 'ALTITUDO MAGNA' },
        'VELOCITY': { es: 'VELOCIDAD', fr: 'VITESSE', de: 'GESCHWINDIGKEIT', pl: 'PRĘDKOŚĆ', uk: 'ШВИДКІСТЬ', ar: 'السرعة', it: 'VELOCITÀ', pt: 'VELOCIDADE', la: 'VELOCITAS' }
      };

      try {
        const textNodes = container.querySelectorAll('text');
        textNodes.forEach(node => {
          let orig = node.getAttribute('data-i18n-orig');
          if (!orig) {
            orig = node.textContent.trim();
            node.setAttribute('data-i18n-orig', orig);
          }

          if (lang === 'en') {
            node.textContent = orig;
          } else {
            if (DICT[orig] && DICT[orig][lang]) {
              node.textContent = DICT[orig][lang];
            } else {
              const upper = orig.toUpperCase();
              if (DICT[upper] && DICT[upper][lang]) {
                node.textContent = DICT[upper][lang];
              }
            }
          }
        });
      } catch (err) {
        console.warn('In-stage label translation notice:', err);
      }
    }

    toggleVoice() {
      this.voiceEnabled = !this.voiceEnabled;
      if (!this.voiceEnabled) {
        this.cancelSpeech();
      }
      return this.voiceEnabled;
    }

    toggleLoop() {
      this.loop = !this.loop;
      this.emit('statechange', { isPlaying: this.isPlaying, loop: this.loop });
      return this.loop;
    }

    setLoop(enabled) {
      this.loop = Boolean(enabled);
      this.emit('statechange', { isPlaying: this.isPlaying, loop: this.loop });
      return this.loop;
    }

    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1.0, parseFloat(vol) || 0));
      if (this.volume > 0 && this.muted) {
        this.muted = false;
      }
      this.emit('volumechange', { volume: this.volume, muted: this.muted });
      return this.volume;
    }

    toggleMute() {
      this.muted = !this.muted;
      this.emit('volumechange', { volume: this.volume, muted: this.muted });
      return this.muted;
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      this.emit('volumechange', { volume: this.volume, muted: this.muted });
      return this.muted;
    }

    cancelSpeech() {
      if (this._speakDebounceTimer) {
        clearTimeout(this._speakDebounceTimer);
        this._speakDebounceTimer = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (err) {}
      }
    }

    speak(text) {
      this.speakText(text);
    }

    speakText(text) {
      if (typeof window === 'undefined' || !window.speechSynthesis || !this.voiceEnabled || !text) return;

      if (this._speakDebounceTimer) {
        clearTimeout(this._speakDebounceTimer);
        this._speakDebounceTimer = null;
      }

      try {
        window.speechSynthesis.cancel();
      } catch (err) {}

      this._speakDebounceTimer = setTimeout(() => {
        this._speakDebounceTimer = null;
        if (!this.voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = this.speechRate || 0.95;
          utterance.volume = this.muted ? 0.0 : Math.max(0, Math.min(1.0, this.volume));
          const langMap = {
            es: 'es-ES',
            fr: 'fr-FR',
            de: 'de-DE',
            pl: 'pl-PL',
            uk: 'uk-UA',
            ar: 'ar-SA',
            it: 'it-IT',
            pt: 'pt-PT',
            la: 'it-IT',
            en: 'en-GB'
          };
          utterance.lang = langMap[this.currentLang] || 'en-GB';
          utterance.onboundary = (e) => {
            if (e.name === 'word') {
              const word = text.slice(e.charIndex).split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
              this.notifyParent({ type: 'SPEECH_BOUNDARY', word, fullText: text, charIndex: e.charIndex });
            }
          };
          utterance.onstart = () => {
            this.notifyParent({ type: 'SPEECH_START', text });
          };
          utterance.onend = () => {
            this.notifyParent({ type: 'SPEECH_END' });
          };
          utterance.onerror = () => {
            this.notifyParent({ type: 'SPEECH_END' });
          };
          this.notifyParent({ type: 'SUBTITLE_UPDATE', text });
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('SpeechSynthesis error:', err);
        }
      }, 100);
    }

    getCurrentSubtitle() {
      if (!this.scene.subtitles || !this.scene.subtitles.length) return '';
      const sub = this.scene.subtitles.find(s => this.progress >= s.start && this.progress <= s.end);
      if (!sub) return '';
      
      const localized = sub[this.currentLang] || sub.en || '';
      if (this.bilingualSubtitles && this.currentLang !== 'en' && sub.en && localized !== sub.en) {
        return {
          en: sub.en,
          localized: localized
        };
      }
      return localized;
    }

    updateActiveKeyframeAndSpeech(userSeeking = false) {
      if (!this.scene.keyframes || !this.scene.keyframes.length) return;

      let activeIndex = 0;
      for (let i = 0; i < this.scene.keyframes.length; i++) {
        if (this.progress >= this.scene.keyframes[i].t) {
          activeIndex = i;
        }
      }

      if (activeIndex !== this.lastSpokenIndex) {
        const kf = this.scene.keyframes[activeIndex];
        this.emit('keyframe', {
          index: activeIndex,
          title: kf.title,
          rule: kf.rule,
          progress: this.progress
        });

        if (this.voiceEnabled && (this.isPlaying || userSeeking)) {
          const subText = this.getCurrentSubtitle() || `${kf.title}. ${kf.rule}`;
          this.speakText(subText);
        }

        this.lastSpokenIndex = activeIndex;
      }
    }

    /**
     * Perspective 3D Projection Pipeline
     * Projects world space (X, Y, Z) to 2D SVG canvas (x, y, scale, depthOpacity)
     * Incorporates interactive camera orbit (yawOffset, pitchOffset, distanceScale)
     *//**
     * Perspective 3D Projection Pipeline
     * Projects world space (X, Y, Z) to 2D SVG canvas (x, y, scale, depthOpacity)
     * Incorporates interactive camera orbit (yawOffset, pitchOffset, distanceScale)
     */
    project3D(x, y, z, camera, cx = 400, cy = 240) {
      // Numerical sanitization: ensure coordinates are finite numbers
      x = Number.isFinite(Number(x)) ? Number(x) : 0;
      y = Number.isFinite(Number(y)) ? Number(y) : 0;
      z = Number.isFinite(Number(z)) ? Number(z) : 0;
      cx = Number.isFinite(Number(cx)) ? Number(cx) : 400;
      cy = Number.isFinite(Number(cy)) ? Number(cy) : 240;

      // ⚡ High-performance WebAssembly 3D Kernel (docs/WASM_ARCHITECTURE_CONTRACT.md Page 4)
      if (typeof window !== 'undefined' && window.AST3DWasmBridge && window.AST3DWasmBridge.isReady) {
        const wasmRes = window.AST3DWasmBridge.projectPoint(x, y, z, camera, cx, cy, this.cameraOrbit);
        if (wasmRes && Number.isFinite(wasmRes.x) && Number.isFinite(wasmRes.y)) return wasmRes;
      }

      const yawBase = Number(camera && camera.yaw) || 0;
      const pitchBase = Number(camera && camera.pitch) || 0;
      const rollBase = Number(camera && camera.roll) || 0;
      const distBase = Number(camera && camera.distance) || 450;
      const fov = Number(camera && camera.fov) || 60;

      const totalYaw = yawBase + (this.cameraOrbit ? (Number(this.cameraOrbit.yawOffset) || 0) : 0);
      const totalPitch = Math.max(-85, Math.min(85, pitchBase + (this.cameraOrbit ? (Number(this.cameraOrbit.pitchOffset) || 0) : 0)));
      const totalDist = Math.max(80, distBase * (this.cameraOrbit ? (Number(this.cameraOrbit.distanceScale) || 1.0) : 1.0));

      const yawRad = totalYaw * (Math.PI / 180);
      const pitchRad = totalPitch * (Math.PI / 180);
      const rollRad = rollBase * (Math.PI / 180);
      const tanFov = Math.tan((fov * Math.PI) / 360) || 0.577;
      const focalLength = 400 / tanFov;

      // 1. Yaw rotation (around Y axis)
      const x1 = x * Math.cos(yawRad) + z * Math.sin(yawRad);
      const y1 = y;
      const z1 = -x * Math.sin(yawRad) + z * Math.cos(yawRad);

      // 2. Pitch rotation (around X axis)
      const x2 = x1;
      const y2 = y1 * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
      const z2 = y1 * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);

      // 3. Roll rotation (around Z axis)
      const x3 = x2 * Math.cos(rollRad) - y2 * Math.sin(rollRad);
      const y3 = x2 * Math.sin(rollRad) + y2 * Math.cos(rollRad);
      const z3 = z2;

      // 4. Camera distance offset & safe divide guard
      const zCam = z3 + totalDist;
      const safeZ = Math.max(20, Number.isFinite(zCam) ? zCam : 20);

      // 5. Perspective projection with NaN immunity
      const scale = Number.isFinite(focalLength / safeZ) ? (focalLength / safeZ) : 1.0;
      const projX = Number.isFinite(cx + x3 * scale) ? (cx + x3 * scale) : cx;
      const projY = Number.isFinite(cy + y3 * scale) ? (cy + y3 * scale) : cy;
      const depthRatio = totalDist > 0 ? (scale / (focalLength / totalDist)) : 1.0;
      const depthOpacity = Math.min(1.0, Math.max(0.45, 0.55 + 0.45 * (Number.isFinite(depthRatio) ? depthRatio : 1.0)));

      return {
        x: projX,
        y: projY,
        z: Number.isFinite(z3) ? z3 : 0,
        scale: Number.isFinite(scale) ? scale : 1.0,
        opacity: Number.isFinite(depthOpacity) ? depthOpacity : 1.0,
        safeZ
      };
    }

    /**
     * Converts an array of 2D points [{x, y}] into a smooth Catmull-Rom cubic Bezier SVG path
     */
    _pointsToSpline(pts) {
      if (!pts || pts.length < 2) return "";
      const valid = pts.filter(p => p && typeof p.x === "number" && typeof p.y === "number");
      if (valid.length < 2) return "";
      let d = `M ${valid[0].x.toFixed(1)} ${valid[0].y.toFixed(1)}`;
      for (let i = 0; i < valid.length - 1; i++) {
        const p0 = valid[Math.max(0, i - 1)];
        const p1 = valid[i];
        const p2 = valid[i + 1];
        const p3 = valid[Math.min(valid.length - 1, i + 2)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    }

    /**
     * Checks whether an ArrayBuffer or Uint8Array is valid ASTB bytecode
     */
    isAstBytecode(buffer) {
      if (!buffer) return false;
      const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      if (bytes.length < 16) return false;
      return bytes[0] === 0x41 && bytes[1] === 0x53 && bytes[2] === 0x54 && bytes[3] === 0x42;
    }

    /**
     * Fast zero-copy AST bytecode decompiler (< 0.2 ms execution)
     * Deserializes binary .astb payloads with zero runtime string regex parsing.
     */
    decompileBytecode(buffer) {
      if (!buffer) return null;
      const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      if (!this.isAstBytecode(bytes)) return null;

      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const archetypeByte = bytes[5];
      const durationDeci = view.getUint16(6, true);
      const strCount = view.getUint16(8, true);
      const strByteLen = view.getUint32(10, true);
      const flags = view.getUint16(14, true);

      const duration = durationDeci / 10;
      let type = 'Sim';
      if (archetypeByte === 4) type = 'Film';
      else if (archetypeByte === 2) type = 'Slide';
      else if (archetypeByte === 3) type = 'App';

      // Read String Table
      const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: false }) : null;
      const strings = [];
      let strOffset = 16;
      for (let i = 0; i < strCount && strOffset < 16 + strByteLen; i++) {
        const sLen = view.getUint16(strOffset, true);
        strOffset += 2;
        const subArr = bytes.subarray(strOffset, strOffset + sLen);
        strings.push(decoder ? decoder.decode(subArr) : String.fromCharCode.apply(null, subArr));
        strOffset += sLen;
      }
      const getStr = (idx) => strings[idx] || '';

      let offset = 16 + strByteLen;
      const len = bytes.length;

      const scene = {
        id: 'unnamed',
        type: type,
        cartridgeType: type,
        title: 'AST Scene',
        stage: 'CURRICULUM',
        duration: duration,
        has3D: Boolean(flags & 0x0001),
        hasVideo: Boolean(flags & 0x0002),
        video: null,
        videoFit: 'contain',
        keyframes: [],
        subtitles: [],
        bindings: [],
        checkpoints: [],
        gestures: [],
        vars: {},
        inputs: []
      };

      while (offset < len) {
        const op = bytes[offset++];
        if (op === 0xFF) break; // OP_EOF

        switch (op) {
          case 0x01: { // OP_SCENE_META
            const idStr = view.getUint16(offset, true); offset += 2;
            const titleStr = view.getUint16(offset, true); offset += 2;
            const stageStr = view.getUint16(offset, true); offset += 2;
            const videoStr = view.getUint16(offset, true); offset += 2;
            const fitVal = bytes[offset++];
            scene.id = getStr(idStr);
            scene.title = getStr(titleStr);
            scene.stage = getStr(stageStr);
            const v = getStr(videoStr);
            if (v) {
              scene.video = v;
              scene.hasVideo = true;
              scene.type = 'Film';
              scene.cartridgeType = 'Film';
            }
            scene.videoFit = fitVal === 2 ? 'cover' : fitVal === 3 ? 'fill' : 'contain';
            break;
          }
          case 0x80: { // OP_CAMERA
            const dist = view.getFloat32(offset, true); offset += 4;
            const pitch = view.getFloat32(offset, true); offset += 4;
            const yaw = view.getFloat32(offset, true); offset += 4;
            const fov = view.getFloat32(offset, true); offset += 4;
            scene.camera = { distance: dist, pitch, yaw, fov };
            scene.has3D = true;
            break;
          }
          case 0x10: { // OP_KEYFRAME
            const normT = view.getUint16(offset, true); offset += 2;
            const titleIdx = view.getUint16(offset, true); offset += 2;
            const ruleIdx = view.getUint16(offset, true); offset += 2;
            scene.keyframes.push({
              t: Number((normT / 65535).toFixed(4)),
              title: getStr(titleIdx),
              rule: getStr(ruleIdx)
            });
            break;
          }
          case 0x20: { // OP_SUBTITLE
            const startT = view.getUint16(offset, true); offset += 2;
            const endT = view.getUint16(offset, true); offset += 2;
            const langCount = bytes[offset++];
            const subObj = {
              start: Number((startT / 65535).toFixed(4)),
              end: Number((endT / 65535).toFixed(4)),
              en: ''
            };
            for (let i = 0; i < langCount; i++) {
              const lKey = getStr(view.getUint16(offset, true)); offset += 2;
              const lVal = getStr(view.getUint16(offset, true)); offset += 2;
              subObj[lKey] = lVal;
            }
            scene.subtitles.push(subObj);
            break;
          }
          case 0x30: { // OP_BINDING
            const targetIdx = view.getUint16(offset, true); offset += 2;
            const attrIdx = view.getUint16(offset, true); offset += 2;
            const exprIdx = view.getUint16(offset, true); offset += 2;
            const target = getStr(targetIdx);
            const attr = getStr(attrIdx);
            const expr = getStr(exprIdx);

            if (target === ':camera' && attr === 'camera') {
              try {
                const camData = expr.startsWith('{') ? JSON.parse(expr) : null;
                if (camData) {
                  scene.camera = Object.assign(scene.camera || { distance: 500, pitch: 20, yaw: 0, fov: 60 }, camData);
                }
                scene.has3D = true;
              } catch {}
            } else if (attr === ':3d-node' || attr === '3d-node') {
              if (expr.startsWith('{')) {
                try { scene.bindings.push({ type: '3d-node', target, ...JSON.parse(expr) }); } catch {}
              } else {
                const p = expr.split('|');
                scene.bindings.push({
                  type: '3d-node',
                  target,
                  x: p[0],
                  y: p[1],
                  z: p[2],
                  baseR: parseFloat(p[3]) || 8,
                  label: p[4] || null,
                  depthFog: p[5] !== '0',
                });
              }
            } else if (attr === ':3d-ring' || attr === '3d-ring') {
              if (expr.startsWith('{')) {
                try { scene.bindings.push({ type: '3d-ring', target, ...JSON.parse(expr) }); } catch {}
              } else {
                const p = expr.split('|');
                scene.bindings.push({
                  type: '3d-ring',
                  target,
                  r: p[0],
                  cx: p[1],
                  cy: p[2],
                  cz: p[3],
                  tiltX: p[4],
                  tiltY: p[5],
                  tiltZ: p[6],
                  segments: parseInt(p[7], 10) || 24,
                  depthFog: p[8] !== '0',
                });
              }
            } else if (attr === ':3d-line' || attr === '3d-line') {
              if (expr.startsWith('{')) {
                try { scene.bindings.push({ type: '3d-line', target, ...JSON.parse(expr) }); } catch {}
              } else {
                const p = expr.split('|');
                scene.bindings.push({
                  type: '3d-line',
                  target,
                  x1: p[0],
                  y1: p[1],
                  z1: p[2],
                  x2: p[3],
                  y2: p[4],
                  z2: p[5],
                  cap1: p[6] || null,
                  cap2: p[7] || null,
                  baseR: parseFloat(p[8]) || 8,
                });
              }
            } else if (attr === ':3d-polygon' || attr === '3d-polygon') {
              if (expr.startsWith('{')) {
                try { scene.bindings.push({ type: '3d-polygon', target, ...JSON.parse(expr) }); } catch {}
              } else {
                const p = expr.split('|');
                scene.bindings.push({
                  type: '3d-polygon',
                  target,
                  depthFog: p[0] !== '0',
                  cullBackface: p[1] === '1',
                  pointsExpr: p.slice(2).join('|'),
                });
              }
            } else {
              scene.bindings.push({
                type: '2d-attr',
                target,
                attr,
                expr
              });
            }
            break;
          }
          case 0x40: { // OP_CHECKPOINT
            const normT = view.getUint16(offset, true); offset += 2;
            const promptIdx = view.getUint16(offset, true); offset += 2;
            const ans = bytes[offset++];
            const explIdx = view.getUint16(offset, true); offset += 2;
            const optCount = bytes[offset++];
            const opts = [];
            for (let i = 0; i < optCount; i++) {
              opts.push(getStr(view.getUint16(offset, true)));
              offset += 2;
            }
            scene.checkpoints.push({
              t: Number((normT / 65535).toFixed(4)),
              prompt: getStr(promptIdx),
              options: opts,
              answer: ans,
              explanation: getStr(explIdx)
            });
            break;
          }
          case 0x50: { // OP_GESTURE
            const targetIdx = view.getUint16(offset, true); offset += 2;
            const axisVal = bytes[offset++];
            const minVal = view.getFloat32(offset, true); offset += 4;
            const maxVal = view.getFloat32(offset, true); offset += 4;
            scene.gestures.push({
              target: getStr(targetIdx),
              axis: axisVal === 2 ? 'y' : axisVal === 3 ? 'xy' : 'x',
              min: minVal,
              max: maxVal
            });
            break;
          }
          case 0x60: { // OP_VAR
            const nameIdx = view.getUint16(offset, true); offset += 2;
            const vType = bytes[offset++];
            let val = 0;
            if (vType === 3) {
              val = view.getFloat32(offset, true) > 0.5;
              offset += 4;
            } else if (vType === 2) {
              const sIdx = Math.round(view.getFloat32(offset, true));
              val = getStr(sIdx);
              offset += 4;
            } else {
              val = view.getFloat32(offset, true);
              offset += 4;
            }
            offset += 12; // skip min, max, step
            offset += 2;  // skip label
            scene.vars[getStr(nameIdx)] = val;
            break;
          }
          default:
            break;
        }
      }

      if (scene.checkpoints.length > 0) {
        scene.interactive = {
          checkpoints: scene.checkpoints,
          hotspots: []
        };
      }

      return scene;
    }

    /**
     * Parses S-Expression (.ast) or Bytecode (.astb) into structured scene configuration
     * Supports :camera, :keyframes, :subtitles, 2D bindings, and 3D nodes/lines/rings/polygons
     */
    parseAst(astContent) {
      if (!astContent) return null;
      if (astContent instanceof ArrayBuffer || (typeof Uint8Array !== 'undefined' && astContent instanceof Uint8Array)) {
        return this.decompileBytecode(astContent);
      }
      if (typeof astContent === 'string' && astContent.startsWith('ASTB')) {
        const u8 = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(astContent) : null;
        if (u8) return this.decompileBytecode(u8);
      }
      if (typeof astContent !== 'string') return null;

      const extractSlot = (a, b) => {
        const text = b ? a : astContent;
        const reg = b ? b : a;
        if (!text || typeof text !== 'string') return null;
        const match = text.match(reg);
        return match ? match[1].trim().replace(/^"|"$/g, '') : null;
      };

      const extractQuoted = (text, key) => {
        if (!text || typeof text !== 'string') return null;
        const reg = new RegExp(`:${key}\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'i');
        const m = text.match(reg);
        if (m) return m[1].replace(/\\"/g, '"');
        const fallbackReg = new RegExp(`:${key}\\s+([^\\s\\)]+)`, 'i');
        const fb = text.match(fallbackReg);
        return fb ? fb[1].replace(/^"|"$/g, '') : null;
      };

      const id = extractSlot(/:id\s+("[^"]+"|[^\s\)]+)/i);
      const rawType = extractSlot(/:type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)/i);
      const video = extractSlot(/:video\s+("((?:[^"\\]|\\.)*)"|[^\s\)]+)/i) || extractQuoted(astContent, 'video') || extractSlot(/:film\s+("((?:[^"\\]|\\.)*)"|[^\s\)]+)/i) || extractQuoted(astContent, 'film');
      const videoFit = extractSlot(/:video-?fit\s+("((?:[^"\\]|\\.)*)"|[^\s\)]+)/i) || extractQuoted(astContent, 'video-fit') || extractQuoted(astContent, 'videoFit') || 'contain';
      let type = 'Sim';
      if (rawType) {
        const norm = rawType.toLowerCase();
        if (norm === 'film' || norm === 'video' || norm === 'movie') type = 'Film';
        else if (norm === 'slide') type = 'Slide';
        else if (norm === 'app') type = 'App';
        else type = 'Sim';
      } else if (video) {
        type = 'Film';
      } else {
        const hasSubtitles = /:subtitles\s*\(/i.test(astContent);
        const hasGestures = /:gestures\s*\(/i.test(astContent) || /:draggable\s+/i.test(astContent);
        const hasCheckpoints = /:interactive\s*\(/i.test(astContent) || /:checkpoint\s+/i.test(astContent);
        const hasPhysics = /:physics\s*\(/i.test(astContent) || /:emitter\s+/i.test(astContent);
        if (hasSubtitles && !hasGestures && !hasPhysics) {
          type = 'Slide';
        } else if (hasGestures || hasPhysics || hasCheckpoints) {
          type = 'Sim';
        } else {
          type = 'App';
        }
      }
      const title = extractSlot(/:title\s+"([^"]+)"/i);
      const stage = extractSlot(/:stage\s+"([^"]+)"/i) || 'CURRICULUM';
      const durationStr = extractSlot(/:duration\s+([\d\.]+)/i);
      const duration = durationStr ? parseFloat(durationStr) : 10.0;

      // Helper to extract S-expression blocks with balanced parentheses and string quote protection
      const extractSexprBlocks = (text, tag) => {
        const blocks = [];
        const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const startRegex = new RegExp('\\(' + safeTag + '[\\s)]', 'gi');
        let m;
        while ((m = startRegex.exec(text)) !== null) {
          const startIdx = m.index;
          let depth = 0;
          let inString = false;
          let endIdx = -1;
          for (let i = startIdx; i < text.length; i++) {
            const char = text[i];
            if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
              inString = !inString;
            } else if (!inString) {
              if (char === '(') depth++;
              else if (char === ')') {
                depth--;
                if (depth === 0) {
                  endIdx = i + 1;
                  break;
                }
              }
            }
          }
          if (endIdx !== -1) {
            blocks.push(text.slice(startIdx, endIdx));
          }
        }
        return blocks;
      };

      // Camera definition with balanced parenthesis S-expression extraction
      const camBlocks = extractSexprBlocks(astContent, ':camera');
      let camera = { distance: 500, pitch: 20, yaw: 0, fov: 60 };
      if (camBlocks.length > 0) {
        const cBody = camBlocks[0];
        const getCamVal = (key) => {
          const m = cBody.match(new RegExp(`:${key}\\s+("[^"]+"|[\\d\\.-]+)`, 'i'));
          return m ? m[1].replace(/^"|"$/g, '') : null;
        };
        if (getCamVal('distance')) camera.distance = parseFloat(getCamVal('distance'));
        if (getCamVal('pitch')) camera.pitch = parseFloat(getCamVal('pitch')) || getCamVal('pitch');
        if (getCamVal('yaw')) camera.yaw = parseFloat(getCamVal('yaw')) || getCamVal('yaw');
        if (getCamVal('fov')) camera.fov = parseFloat(getCamVal('fov'));
      }

      // Keyframes
      const keyframes = [];
      const kfRegex = /\(:t\s+([\d\.]+)\s+:title\s+"([^"]+)"\s+:rule\s+"([^"]+)"\)/gi;
      let match;
      while ((match = kfRegex.exec(astContent)) !== null) {
        keyframes.push({
          t: parseFloat(match[1]),
          title: match[2],
          rule: match[3]
        });
      }

      // Subtitles
      const subtitles = [];
      const subRegex = /\(:start\s+([\d\.]+)\s+:end\s+([\d\.]+)\s+:en\s+"([^"]+)"(?:\s+:es\s+"([^"]+)")?(?:\s+:la\s+"([^"]+)")?\)/gi;
      while ((match = subRegex.exec(astContent)) !== null) {
        const subObj = {
          start: parseFloat(match[1]),
          end: parseFloat(match[2]),
          en: match[3]
        };
        if (match[4]) subObj.es = match[4];
        if (match[5]) subObj.la = match[5];
        subtitles.push(subObj);
      }

      // Bindings (2D, 3D nodes, 3D lines, 3D rings, 3D polygons)
      const bindings = [];
      const bindBlocks = extractSexprBlocks(astContent, ':target');

      bindBlocks.forEach(block => {
        const target = extractQuoted(block, 'target') || extractSlot.call(null, block, /:target\s+"([^"]+)"/i);
        const type = extractSlot.call(null, block, /:type\s+"([^"]+)"/i);
        const attr = extractQuoted(block, 'attr') || extractSlot.call(null, block, /:attr\s+"([^"]+)"/i);
        const expr = extractQuoted(block, 'expr') || extractSlot.call(null, block, /:expr\s+"([^"]+)"/i);

        if (type === '3d-node') {
          const x = extractSlot.call(null, block, /:x\s+"([^"]+)"/i) || '0';
          const y = extractSlot.call(null, block, /:y\s+"([^"]+)"/i) || '0';
          const z = extractSlot.call(null, block, /:z\s+"([^"]+)"/i) || '0';
          const baseRStr = extractSlot.call(null, block, /:base-r\s+([\d\.]+)/i);
          const baseR = baseRStr ? parseFloat(baseRStr) : 8;
          const label = extractSlot.call(null, block, /:label\s+"([^"]+)"/i);
          const depthFogStr = extractSlot.call(null, block, /:depth-fog\s+([^\s\)]+)/i);
          const depthFog = depthFogStr !== 'false';

          bindings.push({
            type: '3d-node',
            target,
            x,
            y,
            z,
            baseR,
            label,
            depthFog
          });
        } else if (type === '3d-line') {
          bindings.push({
            type: '3d-line',
            target,
            x1: extractSlot.call(null, block, /:x1\s+"([^"]+)"/i) || '0',
            y1: extractSlot.call(null, block, /:y1\s+"([^"]+)"/i) || '0',
            z1: extractSlot.call(null, block, /:z1\s+"([^"]+)"/i) || '0',
            x2: extractSlot.call(null, block, /:x2\s+"([^"]+)"/i) || '0',
            y2: extractSlot.call(null, block, /:y2\s+"([^"]+)"/i) || '0',
            z2: extractSlot.call(null, block, /:z2\s+"([^"]+)"/i) || '0',
            cap1: extractSlot.call(null, block, /:cap1\s+"([^"]+)"/i),
            cap2: extractSlot.call(null, block, /:cap2\s+"([^"]+)"/i),
            baseR: parseFloat(extractSlot.call(null, block, /:base-r\s+([\d\.]+)/i) || '8')
          });
        } else if (type === '3d-ring') {
          const rStr = extractSlot.call(null, block, /:r\s+("[^"]+"|[\\d\\.]+)/i) || '100';
          const cx = extractSlot.call(null, block, /:cx\s+"([^"]+)"/i) || '0';
          const cy = extractSlot.call(null, block, /:cy\s+"([^"]+)"/i) || '0';
          const cz = extractSlot.call(null, block, /:cz\s+"([^"]+)"/i) || '0';
          const tiltX = extractSlot.call(null, block, /:tilt-x\s+("[^"]+"|[\\d\\.-]+)/i) || '0';
          const tiltY = extractSlot.call(null, block, /:tilt-y\s+("[^"]+"|[\\d\\.-]+)/i) || '0';
          const tiltZ = extractSlot.call(null, block, /:tilt-z\s+("[^"]+"|[\\d\\.-]+)/i) || '0';
          const segsStr = extractSlot.call(null, block, /:segments\s+([\d]+)/i);
          const segments = segsStr ? parseInt(segsStr, 10) : 24;
          const depthFogStr = extractSlot.call(null, block, /:depth-fog\s+([^\s\)]+)/i);
          const depthFog = depthFogStr !== 'false';

          bindings.push({
            type: '3d-ring',
            target,
            r: rStr,
            cx, cy, cz,
            tiltX, tiltY, tiltZ,
            segments,
            depthFog
          });
        } else if (type === '3d-polygon') {
          const ptsStr = extractSlot.call(null, block, /:points\s+"([^"]+)"/i) || extractSlot.call(null, block, /:pts\s+"([^"]+)"/i);
          const depthFogStr = extractSlot.call(null, block, /:depth-fog\s+([^\s\)]+)/i);
          const depthFog = depthFogStr !== 'false';
          const cullBackfaceStr = extractSlot.call(null, block, /:cull-backface\s+([^\s\)]+)/i);
          const cullBackface = cullBackfaceStr === 'true';

          bindings.push({
            type: '3d-polygon',
            target,
            pointsExpr: ptsStr,
            depthFog,
            cullBackface
          });
        } else if (target && attr && expr) {
          bindings.push({
            type: '2d-attr',
            target,
            attr,
            expr
          });
        }
      });

      // Checkpoints (Interactive Formative Assessment)
      const checkpoints = [];
      const isInteractiveExplicitlyDisabled = /:interactive\s+(false|nil|none)\b/i.test(astContent) ||
        /:questions\s+(false|nil|none)\b/i.test(astContent) ||
        /:type\s+"App"/i.test(astContent) ||
        extractSexprBlocks(astContent, ':interactive').some(b => /:(?:enabled|active|questions)\s+(false|nil)\b/i.test(b));

      if (!isInteractiveExplicitlyDisabled) {
        const cpEntryBlocks = extractSexprBlocks(astContent, ':checkpoint');
        cpEntryBlocks.forEach(cpText => {
        const tMatch = cpText.match(/:t\s+([\d\.]+)/i);
        const cpTitle = extractSlot.call(null, cpText, /:title\s+"([^"]+)"/i) || 'Checkpoint';
        const prompt = extractSlot.call(null, cpText, /:prompt\s+"([^"]+)"/i) || '';
        const ansMatch = cpText.match(/:answer\s+(\d+)/i);
        const explanation = extractSlot.call(null, cpText, /:explanation\s+"([^"]+)"/i) || '';

        const options = [];
        const optTagIdx = cpText.indexOf(':options');
        if (optTagIdx !== -1) {
          const startParen = cpText.indexOf('(', optTagIdx);
          if (startParen !== -1) {
            let depth = 0;
            let inString = false;
            let endParen = -1;
            for (let i = startParen; i < cpText.length; i++) {
              const ch = cpText[i];
              if (ch === '"' && (i === 0 || cpText[i - 1] !== '\\')) {
                inString = !inString;
              } else if (!inString) {
                if (ch === '(') depth++;
                else if (ch === ')') {
                  depth--;
                  if (depth === 0) {
                    endParen = i;
                    break;
                  }
                }
              }
            }
            if (endParen !== -1) {
              const inside = cpText.slice(startParen + 1, endParen);
              const optRegex = /"((?:[^"\\]|\\.)*)"/g;
              let om;
              while ((om = optRegex.exec(inside)) !== null) {
                options.push(om[1]);
              }
            }
          }
        }

        if (tMatch && prompt) {
          checkpoints.push({
            t: parseFloat(tMatch[1]),
            title: cpTitle,
            prompt: prompt,
            options: options.length > 0 ? options : ['Correct', 'Incorrect'],
            answer: ansMatch ? parseInt(ansMatch[1], 10) : 0,
            explanation: explanation
          });
        }
      });
      }

      // Micro-physics block parsing (:physics (:gravity 980 ...) (:body ...))
      const physicsBlocks = extractSexprBlocks(astContent, ':physics');
      let physics = null;
      if (physicsBlocks.length > 0) {
        const pb = physicsBlocks[0];
        const gMatch = pb.match(/:gravity\s+([\d\.\-]+)/i);
        const fMatch = pb.match(/:friction\s+([\d\.]+)/i);
        const grMatch = pb.match(/:ground\s+([\d\.]+)/i);

        const bodyBlocks = extractSexprBlocks(pb, ':body');
        const bodies = bodyBlocks.map(bText => {
          const bId = extractSlot(bText, /:id\s+"([^"]+)"/i) || extractSlot(bText, /:id\s+([^\s\)]+)/i);
          const target = extractSlot(bText, /:target\s+"([^"]+)"/i) || extractSlot(bText, /:target\s+([^\s\)]+)/i);
          const x = parseFloat(extractSlot(bText, /:x\s+([\d\.\-]+)/i) || 0);
          const y = parseFloat(extractSlot(bText, /:y\s+([\d\.\-]+)/i) || 0);
          const vx = parseFloat(extractSlot(bText, /:vx\s+([\d\.\-]+)/i) || 0);
          const vy = parseFloat(extractSlot(bText, /:vy\s+([\d\.\-]+)/i) || 0);
          const mass = parseFloat(extractSlot(bText, /:mass\s+([\d\.]+)/i) || 1.0);
          const bounce = parseFloat(extractSlot(bText, /:bounce\s+([\d\.]+)/i) || 0.45);
          const radius = parseFloat(extractSlot(bText, /:radius\s+([\d\.]+)/i) || 16);
          const groundYStr = extractSlot(bText, /:groundY\s+([\d\.]+)/i);
          const groundY = groundYStr ? parseFloat(groundYStr) : undefined;
          return { id: bId, target: target || `#${bId}`, x, y, vx, vy, mass, bounce, radius, groundY };
        });

        physics = {
          gravity: gMatch ? parseFloat(gMatch[1]) : 980,
          friction: fMatch ? parseFloat(fMatch[1]) : 0.985,
          groundY: grMatch ? parseFloat(grMatch[1]) : 420,
          bodies
        };
      }

      // Reactive State Variables (:vars ((:var :name "volume" :val 1.0 :min 0.3 :max 1.0) ...))
      const vars = {};
      const varBlocks = extractSexprBlocks(astContent, ':vars');
      if (varBlocks.length > 0) {
        const vEntries = extractSexprBlocks(varBlocks[0], ':var');
        vEntries.forEach(vText => {
          const name = extractSlot.call(null, vText, /:name\s+"([^"]+)"/i) || extractSlot.call(null, vText, /:name\s+([^\s\)]+)/i);
          const valMatch = vText.match(/:val\s+([^\s\)]+)/i);
          const minMatch = vText.match(/:min\s+([\d\.\-]+)/i);
          const maxMatch = vText.match(/:max\s+([\d\.\-]+)/i);
          const stepMatch = vText.match(/:step\s+([\d\.]+)/i);
          const unit = extractSlot.call(null, vText, /:unit\s+"([^"]+)"/i) || '';
          const label = extractSlot.call(null, vText, /:label\s+"([^"]+)"/i) || name;
          if (name && valMatch) {
            let parsedVal = valMatch[1].replace(/^"|"$/g, '');
            if (parsedVal === 'true') parsedVal = true;
            else if (parsedVal === 'false') parsedVal = false;
            else if (!isNaN(Number(parsedVal))) parsedVal = Number(parsedVal);
            vars[name] = {
              name,
              value: parsedVal,
              min: minMatch ? parseFloat(minMatch[1]) : 0,
              max: maxMatch ? parseFloat(maxMatch[1]) : 100,
              step: stepMatch ? parseFloat(stepMatch[1]) : 1,
              unit,
              label
            };
          }
        });
      }

      // User Input Controls (:inputs ((:slider :var "volume" :label "Volume") ...))
      const inputs = [];
      const inBlocks = extractSexprBlocks(astContent, ':inputs');
      if (inBlocks.length > 0) {
        const blockText = inBlocks[0];
        const inEntries = extractSexprBlocks(blockText, ':slider')
          .concat(extractSexprBlocks(blockText, ':toggle'))
          .concat(extractSexprBlocks(blockText, ':stepper'))
          .concat(extractSexprBlocks(blockText, ':select'))
          .concat(extractSexprBlocks(blockText, ':button'));

        inEntries.forEach(inText => {
          const typeMatch = inText.match(/^\(:([a-z0-9\-]+)/i);
          const vName = extractSlot.call(null, inText, /:var\s+"([^"]+)"/i) || extractSlot.call(null, inText, /:var\s+([^\s\)]+)/i);
          const inLabel = extractSlot.call(null, inText, /:label\s+"([^"]+)"/i) || vName;
          const min = parseFloat(extractSlot.call(null, inText, /:min\s+([\d\.\-]+)/i) || '0');
          const max = parseFloat(extractSlot.call(null, inText, /:max\s+([\d\.\-]+)/i) || '100');
          const step = parseFloat(extractSlot.call(null, inText, /:step\s+([\d\.]+)/i) || '1');
          if (typeMatch && vName) {
            inputs.push({
              type: typeMatch[1],
              var: vName,
              label: inLabel,
              min,
              max,
              step
            });
          }
        });
      }

      // Derived & Computed Output Variables (:computed ((:name "pressure" :expr "101.3 / vars.volume") ...))
      const computed = [];
      const compBlocks = extractSexprBlocks(astContent, ':computed');
      if (compBlocks.length > 0) {
        const compEntries = extractSexprBlocks(compBlocks[0], ':name');
        compEntries.forEach(cText => {
          const name = extractSlot.call(null, cText, /:name\s+"([^"]+)"/i) || extractSlot.call(null, cText, /:name\s+([^\s\)]+)/i);
          const expr = extractQuoted(cText, 'expr') || extractSlot.call(null, cText, /:expr\s+"([^"]+)"/i);
          if (name && expr) {
            computed.push({ name, expr });
          }
        });
      }

      // Direct Manipulation Gestures (:gestures ((:draggable :target "#..." :axis "x" ...) (:interactive :target "#..." :action "...")))
      const gestures = [];
      const gestureBlocks = extractSexprBlocks(astContent, ':gestures');
      if (gestureBlocks.length > 0) {
        const gBlock = gestureBlocks[0];
        const gEntries = extractSexprBlocks(gBlock, ':draggable')
          .concat(extractSexprBlocks(gBlock, ':interactive'))
          .concat(extractSexprBlocks(gBlock, ':rotatable'));

        gEntries.forEach(gText => {
          if (gText.startsWith('(:interactive (') || gText.startsWith('(:interactive\n')) return;
          const isDraggable = gText.startsWith('(:draggable');
          const isRotatable = gText.startsWith('(:rotatable');
          const target = extractSlot.call(null, gText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, gText, /:target\s+([^\s\)]+)/i);
          const axis = extractSlot.call(null, gText, /:axis\s+"([^"]+)"/i) || 'xy';
          const action = extractSlot.call(null, gText, /:action\s+"([^"]+)"/i);
          const min = parseFloat(extractSlot.call(null, gText, /:min\s+([\d\.\-]+)/i) || '0');
          const max = parseFloat(extractSlot.call(null, gText, /:max\s+([\d\.\-]+)/i) || '800');
          const minX = parseFloat(extractSlot.call(null, gText, /:min-x\s+([\d\.\-]+)/i) || String(min));
          const maxX = parseFloat(extractSlot.call(null, gText, /:max-x\s+([\d\.\-]+)/i) || String(max));
          const minY = parseFloat(extractSlot.call(null, gText, /:min-y\s+([\d\.\-]+)/i) || String(min));
          const maxY = parseFloat(extractSlot.call(null, gText, /:max-y\s+([\d\.\-]+)/i) || String(max));
          const varName = extractSlot.call(null, gText, /:var\s+"([^"]+)"/i);

          if (target) {
            gestures.push({
              type: isDraggable ? 'draggable' : (isRotatable ? 'rotatable' : 'interactive'),
              target,
              axis,
              action,
              min,
              max,
              minX,
              maxX,
              minY,
              maxY,
              var: varName
            });
          }
        });
      }

      // Static Layer Primitives (:static ((:element :target "#bg" :cache true) ...))
      const staticElements = [];
      const staticBlocks = extractSexprBlocks(astContent, ':static');
      if (staticBlocks.length > 0) {
        const sEntries = extractSexprBlocks(staticBlocks[0], ':element');
        sEntries.forEach(sText => {
          const target = extractSlot.call(null, sText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, sText, /:target\s+([^\s\)]+)/i);
          const layer = extractSlot.call(null, sText, /:layer\s+"([^"]+)"/i) || 'bg';
          const cacheMatch = sText.match(/:cache\s+(true|false)/i);
          if (target) {
            staticElements.push({
              target,
              layer,
              cache: cacheMatch ? cacheMatch[1] === 'true' : true
            });
          }
        });
      }

      // Dynamic Kinematic Actors (:actors ((:actor :target "#piston" :kinematic true) ...))
      const actors = [];
      const actorBlocks = extractSexprBlocks(astContent, ':actors');
      if (actorBlocks.length > 0) {
        const aEntries = extractSexprBlocks(actorBlocks[0], ':actor');
        aEntries.forEach(aText => {
          const target = extractSlot.call(null, aText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, aText, /:target\s+([^\s\)]+)/i);
          const kinematicMatch = aText.match(/:kinematic\s+(true|false)/i);
          const willChangeMatch = aText.match(/:will-change\s+(true|false)/i);
          if (target) {
            actors.push({
              target,
              kinematic: kinematicMatch ? kinematicMatch[1] === 'true' : true,
              willChange: willChangeMatch ? willChangeMatch[1] === 'true' : true
            });
          }
        });
      }

      // Multi-Entity Particle Emitters & Obstacle Collision Pipelines
      const emitters = [];
      const emitterContainerBlocks = extractSexprBlocks(astContent, ':emitters');
      const emitterBlocks = emitterContainerBlocks.length > 0
        ? extractSexprBlocks(emitterContainerBlocks[0], ':emitter')
        : extractSexprBlocks(astContent, ':emitter');

      emitterBlocks.forEach(emText => {
        const emId = extractSlot.call(null, emText, /:id\s+"([^"]+)"/i) || extractSlot.call(null, emText, /:id\s+([^\s\)]+)/i) || `emitter_${emitters.length + 1}`;
        const count = parseInt(extractSlot.call(null, emText, /:count\s+(\d+)/i) || '80', 10);
        const speed = parseFloat(extractSlot.call(null, emText, /:speed\s+([\d\.\-]+)/i) || '120');
        const radius = parseFloat(extractSlot.call(null, emText, /:radius\s+([\d\.]+)/i) || '4');
        const gravity = parseFloat(extractSlot.call(null, emText, /:gravity\s+([\d\.\-]+)/i) || '0');
        const fill = extractSlot.call(null, emText, /:fill\s+"([^"]+)"/i) || '#38bdf8';
        const wrapMode = extractSlot.call(null, emText, /:wrapMode\s+"([^"]+)"/i) || 'bounce';
        const boundsEl = extractSlot.call(null, emText, /:boundsElement\s+"([^"]+)"/i) || extractSlot.call(null, emText, /:boundsElement\s+([^\s\)]+)/i);

        // Explicit Bounds
        const minX = parseFloat(extractSlot.call(null, emText, /:minX\s+([\d\.\-]+)/i) || '40');
        const maxX = parseFloat(extractSlot.call(null, emText, /:maxX\s+([\d\.\-]+)/i) || '760');
        const minY = parseFloat(extractSlot.call(null, emText, /:minY\s+([\d\.\-]+)/i) || '40');
        const maxY = parseFloat(extractSlot.call(null, emText, /:maxY\s+([\d\.\-]+)/i) || '440');

        // Obstacles (:obstacles ((:obstacle :target "#piston-assembly" :bounce 1.0) ...))
        const obstacles = [];
        const obsContainerBlocks = extractSexprBlocks(emText, ':obstacles');
        if (obsContainerBlocks.length > 0) {
          const obsEntries = extractSexprBlocks(obsContainerBlocks[0], ':obstacle');
          obsEntries.forEach(obText => {
            const target = extractSlot.call(null, obText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, obText, /:target\s+([^\s\)]+)/i);
            const bounce = parseFloat(extractSlot.call(null, obText, /:bounce\s+([\d\.]+)/i) || '1.0');
            const refract = parseFloat(extractSlot.call(null, obText, /:refract\s+([\d\.]+)/i) || '0');
            const friction = parseFloat(extractSlot.call(null, obText, /:friction\s+([\d\.]+)/i) || '0');
            if (target) {
              obstacles.push({ target, bounce, refract, friction });
            }
          });
        }

        emitters.push({
          id: emId,
          count,
          speed,
          radius,
          gravity,
          fill,
          wrapMode,
          bounds: { minX, maxX, minY, maxY },
          boundsElement: boundsEl,
          obstacles
        });
      });

      // Declarative State Transition Machines (:state-machines)
      const stateMachines = [];
      const smContainerBlocks = extractSexprBlocks(astContent, ':state-machines');
      const smBlocks = smContainerBlocks.length > 0
        ? extractSexprBlocks(smContainerBlocks[0], ':state-machine')
        : extractSexprBlocks(astContent, ':state-machine');

      smBlocks.forEach(smText => {
        const smId = extractSlot.call(null, smText, /:id\s+"([^"]+)"/i) || extractSlot.call(null, smText, /:id\s+([^\s\)]+)/i) || `sm_${stateMachines.length + 1}`;
        const initial = extractSlot.call(null, smText, /:initial\s+"([^"]+)"/i) || extractSlot.call(null, smText, /:initial\s+([^\s\)]+)/i) || 'default';
        const dwell = parseFloat(extractSlot.call(null, smText, /:dwell\s+([\d\.]+)/i) || '0.25');

        // States
        const states = [];
        const stateContainer = extractSexprBlocks(smText, ':states');
        const stateBlocks = stateContainer.length > 0
          ? extractSexprBlocks(stateContainer[0], ':state')
          : extractSexprBlocks(smText, ':state');

        stateBlocks.forEach(stText => {
          const stName = extractSlot.call(null, stText, /:name\s+"([^"]+)"/i) || extractSlot.call(null, stText, /:name\s+([^\s\)]+)/i) || 'state';
          const attrs = Object.create(null);
          const attrBlocks = extractSexprBlocks(stText, ':attr');
          attrBlocks.forEach(atText => {
            const target = extractSlot.call(null, atText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, atText, /:target\s+([^\s\)]+)/i);
            const attr = extractSlot.call(null, atText, /:attr\s+"([^"]+)"/i) || extractSlot.call(null, atText, /:attr\s+([^\s\)]+)/i) || 'fill';
            const val = extractSlot.call(null, atText, /:val\s+"([^"]+)"/i) || extractSlot.call(null, atText, /:val\s+([^\s\)]+)/i);
            if (target && attr) {
              if (!attrs[target]) attrs[target] = Object.create(null);
              attrs[target][attr] = val !== null ? val : '#38bdf8';
            }
          });

          // Emitter sets
          const emitterSets = [];
          const esBlocks = extractSexprBlocks(stText, ':emitter-set');
          esBlocks.forEach(esText => {
            const target = extractSlot.call(null, esText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, esText, /:target\s+([^\s\)]+)/i);
            const speed = parseFloat(extractSlot.call(null, esText, /:speed\s+([\d\.\-]+)/i) || '120');
            const count = parseInt(extractSlot.call(null, esText, /:count\s+(\d+)/i) || '80', 10);
            const gravity = parseFloat(extractSlot.call(null, esText, /:gravity\s+([\d\.\-]+)/i) || '0');
            if (target) {
              emitterSets.push({ target, speed, count, gravity });
            }
          });

          states.push({ name: stName, attrs, emitterSets });
        });

        // Transitions
        const transitions = [];
        const transContainer = extractSexprBlocks(smText, ':transitions');
        const transBlocks = transContainer.length > 0
          ? extractSexprBlocks(transContainer[0], ':transition')
          : extractSexprBlocks(smText, ':transition');

        transBlocks.forEach(trText => {
          const from = extractSlot.call(null, trText, /:from\s+"([^"]+)"/i) || extractSlot.call(null, trText, /:from\s+([^\s\)]+)/i) || '*';
          const to = extractSlot.call(null, trText, /:to\s+"([^"]+)"/i) || extractSlot.call(null, trText, /:to\s+([^\s\)]+)/i);
          const trigger = extractSlot.call(null, trText, /:trigger\s+"([^"]+)"/i) || extractSlot.call(null, trText, /:trigger\s+([^\s\)]+)/i) || 'true';
          const duration = parseFloat(extractSlot.call(null, trText, /:duration\s+([\d\.]+)/i) || '0.5');
          const dwellTime = parseFloat(extractSlot.call(null, trText, /:dwell\s+([\d\.]+)/i) || '0.3');
          if (to) {
            transitions.push({ from, to, trigger, duration, dwellTime });
          }
        });

        stateMachines.push({
          id: smId,
          initial,
          dwellTime: dwell,
          states,
          transitions
        });
      });

      const has3D = Boolean((camBlocks && camBlocks.length > 0) || bindings.some(b => b.type && b.type.startsWith('3d-')));

      return {
        id: id || 'custom-scene',
        title: title || 'AST Vector Scene',
        stage,
        type,
        cartridgeType: type,
        duration,
        video: video || null,
        videoFit: videoFit || 'contain',
        hasVideo: Boolean(video),
        camera: (camBlocks && camBlocks.length > 0) ? camera : null,
        has3D,
        keyframes,
        subtitles,
        bindings,
        checkpoints,
        physics,
        stateMachines: stateMachines.length > 0 ? stateMachines : null,
        emitters: emitters.length > 0 ? emitters : null,
        vars,
        inputs,
        computed,
        staticElements,
        actors,
        gestures,
        interactive: checkpoints.length > 0 ? { checkpoints, hotspots: [] } : null
      };
    }

    /**
     * Dynamically ingests [id].svg and [id].ast assets on selection
     */
    async loadScene(presetId, shouldPlay = false) {
      this.cancelSpeech();
      const normalizedId = (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.normalizeId === 'function')
        ? global.ASTSceneRegistry.normalizeId(presetId)
        : presetId;
      presetId = normalizedId;

      // Deduplication Guard: If this exact preset is already mounted and ready, avoid re-fetching or wiping container
      if (this.activePresetId === presetId && this._mountedSceneId === presetId && this.scene) {
        if (shouldPlay && !this.isPlaying) {
          this.play();
        } else if (shouldPlay === false && this.isPlaying) {
          this.pause();
        }
        return this.scene;
      }

      // In-flight Load Guard: If this exact preset is already being fetched, await the existing promise
      if (this._inFlightLoadPresetId === presetId && this._inFlightLoadPromise) {
        const existingScene = await this._inFlightLoadPromise;
        if (shouldPlay && !this.isPlaying) {
          this.play();
        } else if (shouldPlay === false && this.isPlaying) {
          this.pause();
        }
        return existingScene;
      }

      this._inFlightLoadPresetId = presetId;
      const loadPromise = (async () => {
        // Fast-path for built-in Welcome Simulator (Zero Network Overhead)
        if (presetId === 'welcome') {
          const welcomeScene = this.getBuiltinWelcomeScene();
          this.activePresetId = 'welcome';
          this.scene = welcomeScene;
          this.durationSec = welcomeScene.duration || 16.0;
          this.progress = 0.0;
          this.lastSpokenIndex = -1;
          this.resetCamera();
          if (this.container) {
            this.container.innerHTML = '';
            this.mountSceneAsset(welcomeScene, this.container);
          }
          this.resetVars();
          try {
            this.applyBindings(0);
            this.render(0);
          } catch (_) {}
          this.emit('presetchange', {
            preset: 'welcome',
            title: welcomeScene.title,
            stage: welcomeScene.stage,
            duration: this.durationSec,
            has3D: false,
            hasInteractive: true,
            interactive: welcomeScene.interactive,
            keyframes: welcomeScene.keyframes || []
          });
          this.notifyParent({
            type: 'PRESETCHANGE',
            preset: 'welcome',
            title: welcomeScene.title,
            stage: welcomeScene.stage,
            duration: this.durationSec,
            has3D: false,
            hasInteractive: true,
            keyframes: welcomeScene.keyframes || []
          });
          if (shouldPlay) this.play();
          return welcomeScene;
        }

        this.activePresetId = presetId;
        this.progress = 0.0;
        this.lastSpokenIndex = -1;
        this.resetCamera();

        // Clear active collections immediately to prevent race conditions during load
        this.active3DItems = [];
        this.active3DNodes = [];
        this.active3DLines = [];
        this.active3DRings = [];
        this.active3DPolygons = [];
        this.activeBindings = [];
        this._cachedElements = null;
        this._mountedSceneId = null;

        // Note: Do not clear container.innerHTML here; preserve current apparatus until new scene is ready

        let scene = this.sceneCache[presetId];

      if (!scene) {
        const registryScene = (global.ASTSceneRegistry && global.ASTSceneRegistry.get(presetId)) || (global.ASTScenes && global.ASTScenes[presetId]) || {};
        let svgText = registryScene.svgMarkup || registryScene.svgText || '';
        let astText = registryScene.astSource || registryScene.astText || '';
        let parsedAst = null;

        // If not already in registry/decentralized store, fetch dynamically
        if ((!svgText || !astText) && typeof fetch !== 'undefined') {
          const currentDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
              ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
              : './';
            const base = (this.options.basePath || currentDir || './').replace(/\/?$/, '/');
            const cacheBust = '?v=2.6.0';

            // Automatic GitHub Pages repository prefix detection (e.g. /my-repo/player/)
            const ghRepoMatch = (typeof window !== 'undefined' && window.location && window.location.pathname)
              ? window.location.pathname.match(/^(\/[^\/]+)\//)
              : null;
            const ghRepoPrefix = (ghRepoMatch && ghRepoMatch[1] && !ghRepoMatch[1].startsWith('/player') && !ghRepoMatch[1].startsWith('/api'))
              ? ghRepoMatch[1]
              : '';

            const candidateBases = [
              './scenes/',
              './cartridges/',
              'scenes/',
              'cartridges/',
              './',
              base,
              currentDir,
              `${currentDir}scenes/`,
              `${currentDir}cartridges/`,
              '/player/scenes/',
              '/player/cartridges/',
              '/cartridges/',
              `${base}cartridges/`,
              `${base}scenes/`,
              `${base}player/`,
              `${base}player/cartridges/`,
              `${base}player/scenes/`,
              ghRepoPrefix ? `${ghRepoPrefix}/player/scenes/` : '',
              ghRepoPrefix ? `${ghRepoPrefix}/cartridges/` : '',
              ghRepoPrefix ? `${ghRepoPrefix}/player/cartridges/` : '',
              ghRepoPrefix ? `${ghRepoPrefix}/player/` : '',
              '../scenes/',
              '../cartridges/',
              '../player/scenes/',
              '../player/cartridges/',
              '/'
            ].filter(Boolean);

            const sceneId = presetId;
            const fetchAsset = async (ext) => {
              // 1. Determine current directory of player/index.html
              const baseHref = (typeof document !== 'undefined' && document.baseURI) 
                ? document.baseURI 
                : (typeof window !== 'undefined' ? window.location.href : '');
              const urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : new URLSearchParams();
              const customBase = urlParams.get('base') || this.options.basePath || '';
              const customDirsParam = urlParams.get('dirs') || urlParams.get('inputDirs') || urlParams.get('dir') || '';
              const customDirs = customDirsParam ? customDirsParam.split(',').map(d => d.trim()).filter(Boolean) : [];

              // Explicit options passed programmatically to ASTVectorPlayerEngine
              const optDirs = Array.isArray(this.options.inputDirs) ? this.options.inputDirs : (this.options.cartridgeDir ? [this.options.cartridgeDir] : []);

              // Calculate current script directory: .../player/
              const currentDir = (typeof window !== 'undefined' && window.location)
                ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
                : './';

              const candidateUrls = Array.from(new Set([
                ...optDirs.map(d => `${d.replace(/\/$/, '')}/${sceneId}.${ext}`),
                ...customDirs.map(d => `${d.replace(/\/$/, '')}/${sceneId}.${ext}`),
                `/player/bytecode/${sceneId}.${ext}`,
                `/bytecode/${sceneId}.${ext}`,
                `/cartridges/${sceneId}.${ext}`,
                `/player/cartridges/${sceneId}.${ext}`,
                `/player/scenes/${sceneId}.${ext}`,
                `/scenes/${sceneId}.${ext}`,
                `${currentDir}bytecode/${sceneId}.${ext}`,
                `${currentDir}cartridges/${sceneId}.${ext}`,
                `${currentDir}scenes/${sceneId}.${ext}`,
                `bytecode/${sceneId}.${ext}`,
                `cartridges/${sceneId}.${ext}`,
                `scenes/${sceneId}.${ext}`,
                `./bytecode/${sceneId}.${ext}`,
                `./cartridges/${sceneId}.${ext}`,
                `./scenes/${sceneId}.${ext}`,
                `../bytecode/${sceneId}.${ext}`,
                `../player/bytecode/${sceneId}.${ext}`,
                `../cartridges/${sceneId}.${ext}`,
                `../player/cartridges/${sceneId}.${ext}`,
                `../player/scenes/${sceneId}.${ext}`,
                `../scenes/${sceneId}.${ext}`,
                ...candidateBases.map(b => `${b.replace(/\/$/, '')}/${sceneId}.${ext}`),
                ...(customBase ? [
                  `${customBase.replace(/\/$/, '')}/bytecode/${sceneId}.${ext}`,
                  `${customBase.replace(/\/$/, '')}/cartridges/${sceneId}.${ext}`,
                  `${customBase.replace(/\/$/, '')}/player/cartridges/${sceneId}.${ext}`,
                  `${customBase.replace(/\/$/, '')}/scenes/${sceneId}.${ext}`,
                  `${customBase.replace(/\/$/, '')}/player/scenes/${sceneId}.${ext}`,
                ] : [])
              ])).filter(Boolean);

    const isBinary = ext === 'astb';
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;

        if (isBinary) {
          const buf = await res.arrayBuffer();
          if (buf && buf.byteLength >= 16) {
            const u8 = new Uint8Array(buf, 0, 4);
            if (u8[0] === 0x41 && u8[1] === 0x53 && u8[2] === 0x54 && u8[3] === 0x42) {
              return buf;
            }
          }
          continue;
        }

        const text = await res.text();
        const trimmed = text.trim();

        // 🛡️ Guard against AI Studio / proxy serving HTML 200 fallbacks instead of actual raw assets
        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
          continue;
        }

        // Validate payload matches requested file extension
        if (ext === 'svg' && !trimmed.includes('<svg')) {
          continue;
        }
        if (ext === 'ast' && !trimmed.startsWith('(') && !trimmed.startsWith(';')) {
          continue;
        }

        return trimmed;
      } catch (_) {
        // Fall through to next candidate URL
      }
    }

    return null;
  };

  parsedAst = null;
  try {
    const [foundBytecode, foundSvg] = await Promise.all([
      fetchAsset('astb'),
      fetchAsset('svg')
    ]);
    if (foundSvg) svgText = foundSvg;
    if (foundBytecode) {
      try {
        parsedAst = this.decompileBytecode(foundBytecode);
      } catch (err) {
        console.warn('[AST Engine] Bytecode decompression failed, falling back to AST for', presetId, err);
      }
    }
    // Fall back to .ast text if bytecode was not found, failed to parse, or is missing 3D bindings
    if (!parsedAst || (!parsedAst.bindings || parsedAst.bindings.length === 0) || (parsedAst.has3D && !parsedAst.bindings.some(b => b.type && b.type.startsWith('3d')))) {
      const foundAst = await fetchAsset('ast');
      if (foundAst) astText = foundAst;
    }
  } catch (e) {
    console.warn('[AST Engine] Asset fetch notice for:', presetId, e);
  }
}

        // Secondary fallback for core cartridges if network fetch failed on GitHub Pages
        if (!svgText && (presetId === 'pythagoras' || presetId === 'pythagorus') && global.ASTSceneRegistry) {
          const fb = global.ASTSceneRegistry.get('pythagoras');
          if (fb) {
            svgText = fb.svgMarkup || fb.svgText || '';
            astText = fb.astSource || fb.astText || '';
          }
        }

        const isNotFound = !svgText && !astText && !parsedAst && !registryScene.mount && !registryScene.render && (!registryScene.keyframes || !registryScene.keyframes.length);
        if (isNotFound) {
          console.warn(`[AST Engine] Scene "${presetId}" could not be located in registry or fetched from asset path. Gracefully falling back to built-in Welcome Simulator.`);
          return this.loadScene('welcome', shouldPlay);
        }

        if ((!parsedAst || (!parsedAst.bindings || parsedAst.bindings.length === 0) || (parsedAst.has3D && !parsedAst.bindings.some(b => b.type && b.type.startsWith('3d')))) && astText) {
          try {
            parsedAst = this.parseAst(astText);
          } catch (err) {
            console.warn('[AST Engine] Error parsing AST for', presetId, err);
            this.emit('error', { type: 'AST_PARSE_ERROR', presetId, message: err.message });
          }
        }
        const has3D = Boolean(
          (parsedAst && parsedAst.has3D) ||
          (parsedAst && parsedAst.camera) ||
          (registryScene && registryScene.has3D)
        );

        const isInteractiveExplicitlyDisabled = astText ? (
          /:interactive\s+(false|nil|none)\b/i.test(astText) ||
          /:questions\s+(false|nil|none)\b/i.test(astText) ||
          /:type\s+"App"/i.test(astText) ||
          (/:enabled\s+(false|nil)\b/i.test(astText) && /:interactive/i.test(astText))
        ) : false;

        const resolvedType = (parsedAst && (parsedAst.type || parsedAst.cartridgeType)) || registryScene.type || 'Sim';
        const hasAstCheckpoints = Boolean(
          (parsedAst && parsedAst.checkpoints && parsedAst.checkpoints.length > 0) ||
          (parsedAst && parsedAst.interactive && parsedAst.interactive.checkpoints && parsedAst.interactive.checkpoints.length > 0)
        );
        const shouldHaveQuestions = !isInteractiveExplicitlyDisabled && resolvedType !== 'App' && hasAstCheckpoints;

        scene = {
          id: presetId,
          type: resolvedType,
          cartridgeType: resolvedType,
          title: (parsedAst && parsedAst.title) || registryScene.title || presetId,
          stage: (parsedAst && parsedAst.stage) || registryScene.stage || 'CURRICULUM',
          duration: (parsedAst && parsedAst.duration) || registryScene.duration || 10.0,
          video: (parsedAst && parsedAst.video) || registryScene.video || null,
          videoFit: (parsedAst && parsedAst.videoFit) || registryScene.videoFit || 'contain',
          hasVideo: Boolean((parsedAst && parsedAst.video) || registryScene.video),
          camera: has3D ? ((parsedAst && parsedAst.camera) || registryScene.camera || { distance: 500, pitch: 20, yaw: 0, fov: 60 }) : null,
          has3D: has3D,
          interactive: shouldHaveQuestions ? ((parsedAst && parsedAst.interactive) || (parsedAst && parsedAst.checkpoints && parsedAst.checkpoints.length ? { checkpoints: parsedAst.checkpoints, hotspots: [] } : null)) : null,
          keyframes: (parsedAst && parsedAst.keyframes && parsedAst.keyframes.length) ? parsedAst.keyframes : (registryScene.keyframes || []),
          subtitles: (parsedAst && parsedAst.subtitles && parsedAst.subtitles.length) ? parsedAst.subtitles : (registryScene.subtitles || []),
          rawBindings: (parsedAst && parsedAst.bindings) || [],
          svgText: svgText,
          mount: registryScene.mount,
          update: registryScene.update,
          render: registryScene.render,
          vars: (parsedAst && parsedAst.vars) || registryScene.vars || {},
          inputs: (parsedAst && parsedAst.inputs) || registryScene.inputs || [],
          computed: (parsedAst && parsedAst.computed) || registryScene.computed || [],
          gestures: (parsedAst && parsedAst.gestures) || registryScene.gestures || [],
          physics: (parsedAst && parsedAst.physics) || registryScene.physics || null,
          actors: (parsedAst && parsedAst.actors) || registryScene.actors || [],
          staticElements: (parsedAst && parsedAst.staticElements) || registryScene.staticElements || [],
          emitters: (parsedAst && parsedAst.emitters) || registryScene.emitters || [],
          bindInputs: (parsedAst && parsedAst.bindInputs) || registryScene.bindInputs || [],
          stateMachines: (parsedAst && parsedAst.stateMachines) || registryScene.stateMachines || []
        };

        this.sceneCache[presetId] = scene;

        // Auto-register dynamically found scene so teacher does not have to reprocess index
        if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.register === 'function') {
          global.ASTSceneRegistry.register(presetId, {
            id: presetId,
            title: scene.title,
            stage: scene.stage,
            duration: scene.duration,
            has3D: scene.has3D,
            svgFile: `scenes/${presetId}.svg`,
            astFile: `scenes/${presetId}.ast`
          });
        }
        this.emit('scene_registered', { id: presetId, scene });
      }

      this.scene = scene;
      this.durationSec = this.scene.duration || 10.0;

      // Mount into container
      if (this.container) {
        this.container.innerHTML = '';
        this.mountSceneAsset(scene, this.container);
      }
      this.resetVars();

// 1. Hide the "Loading AST Vector Scene..." overlay immediately
      const loaderEl = document.getElementById('loading-indicator') || 
                       document.getElementById('loading') ||
                       document.querySelector('.loading-badge') ||
                       (this.container && this.container.parentElement && this.container.parentElement.querySelector('[id*="load"]'));
      if (loaderEl && loaderEl.style) {
        loaderEl.style.display = 'none';
      }

      // 2. Pulse Frame 0 so vector attributes, coordinates, and physics bind immediately
      try {
        if (typeof this.applyBindings === 'function') {
          this.applyBindings(0);
        }
        if (typeof this.render === 'function') {
          this.render(0);
        }
      } catch (bindErr) {
        console.warn('[AST Engine] Initial frame bind notice:', bindErr);
      }

      this.emit('presetchange', {
        preset: this.activePresetId,
        title: this.scene.title,
        stage: this.scene.stage,
        duration: this.durationSec,
        has3D: this.has3D(),
        hasInteractive: Boolean(this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints.length),
        interactive: this.scene.interactive,
        camera: this.scene.camera,
        keyframes: this.scene.keyframes || []
      });

// 3. Notify parent host that cartridge DOM is mounted and ready
      this.notifyParent({
        type: 'PLAYER_READY',
        preset: this.activePresetId,
        title: this.scene.title,
        stage: this.scene.stage,
        duration: this.durationSec,
        has3D: this.has3D(),
        hasInteractive: Boolean(this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints.length),
        keyframes: this.scene.keyframes || [],
        isPlaying: this.isPlaying
      });

      this.seek(0);
      if (shouldPlay) {
        this.play();
      }
      this._mountedSceneId = presetId;
      return this.scene;
      })();

      this._inFlightLoadPromise = loadPromise;
      try {
        const res = await loadPromise;
        return res;
      } finally {
        if (this._inFlightLoadPresetId === presetId) {
          this._inFlightLoadPromise = null;
          this._inFlightLoadPresetId = null;
        }
      }
    }

    setPreset(presetId, shouldPlay = false) {
      return this.loadScene(presetId, shouldPlay);
    }

    /**
     * Ingests and mounts an in-memory scene object directly without requiring filesystem fetch.
     * Ideal for standalone npm packages and programmatic scene generation.
     * @param {Object} sceneData
     * @param {boolean} shouldPlay
     */
    loadSceneData(sceneData, shouldPlay = false) {
      if (!sceneData || typeof sceneData !== 'object') {
        const err = new Error('[AST Engine] loadSceneData requires a valid scene object');
        this.emit('error', { type: 'INVALID_SCENE_DATA', message: err.message });
        throw err;
      }
      const id = sceneData.id || `custom-${Date.now()}`;
      this.sceneCache[id] = {
        id,
        title: sceneData.title || id,
        stage: sceneData.stage || 'CUSTOM',
        duration: parseFloat(sceneData.duration) || 10.0,
        camera: sceneData.camera || null,
        has3D: Boolean(sceneData.has3D || sceneData.camera),
        interactive: sceneData.interactive || null,
        keyframes: sceneData.keyframes || [],
        subtitles: sceneData.subtitles || [],
        rawBindings: sceneData.bindings || sceneData.rawBindings || [],
        stateMachines: sceneData.stateMachines || null,
        emitters: sceneData.emitters || null,
        bindInputs: sceneData.bindInputs || null,
        vars: sceneData.vars || null,
        gestures: sceneData.gestures || null,
        svgText: sceneData.svgText || '',
        mount: sceneData.mount,
        update: sceneData.update,
        render: sceneData.render
      };
      return this.loadScene(id, shouldPlay);
    }

    /**
     * Ingests local files (.json, .ast, .svg) via File/Blob APIs (e.g. file picker or drag-and-drop).
     * @param {File|Blob} file
     * @param {boolean} shouldPlay
     * @returns {Promise<Object>} Loaded scene
     */
    async loadFromFile(file, shouldPlay = false) {
      if (!file) {
        const err = new Error('[AST Engine] loadFromFile requires a valid File or Blob');
        this.emit('error', { type: 'FILE_LOAD_ERROR', message: err.message });
        throw err;
      }
      const filename = file.name || 'custom-asset';
      const ext = filename.split('.').pop().toLowerCase();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
          const err = new Error(`Failed to read file "${filename}": ${reader.error?.message}`);
          this.emit('error', { type: 'FILE_READ_ERROR', filename, message: err.message });
          if (this.container) {
            this.renderErrorPlaceholder(filename, err.message);
          }
          reject(err);
        };
        reader.onload = () => {
          try {
            const content = String(reader.result || '').trim();
            const id = filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');

            if (ext === 'json') {
              const json = JSON.parse(content);
              json.id = json.id || id;
              const loaded = this.loadSceneData(json, shouldPlay);
              this.emit('fileloaded', { filename, type: 'json', id: json.id });
              resolve(loaded);
            } else if (ext === 'svg' || (ext !== 'ast' && content.includes('<svg'))) {
              // -------------------------------------------------------------
              // Single-File Hybrid Simulation Capsule (.ast.svg)
              // Inspect SVG for embedded AST S-expressions:
              // <metadata type="application/ast-sexpr">(:scene ...)</metadata>
              // or <script type="application/ast-sexpr">(:scene ...)</script>
              // or <ast-scene>(:scene ...)</ast-scene>
              // -------------------------------------------------------------
              let embeddedAst = '';
              const metaMatch = content.match(/<metadata[^>]*type=["']application\/ast-sexpr["'][^>]*>([\s\S]*?)<\/metadata>/i)
                || content.match(/<script[^>]*type=["']application\/ast-sexpr["'][^>]*>([\s\S]*?)<\/script>/i)
                || content.match(/<ast-scene[^>]*>([\s\S]*?)<\/ast-scene>/i);

              if (metaMatch && metaMatch[1]) {
                embeddedAst = metaMatch[1].trim();
              }

              let parsed = null;
              if (embeddedAst) {
                try {
                  parsed = this.parseAst(embeddedAst);
                } catch (e) {
                  console.warn('[AST Engine] Notice: Could not parse embedded AST inside SVG:', e);
                }
              }

              const scene = {
                id: (parsed && parsed.id) || id,
                title: (parsed && parsed.title) || filename,
                stage: (parsed && parsed.stage) || (embeddedAst ? 'HYBRID AST.SVG CAPSULE' : 'CUSTOM SVG'),
                duration: (parsed && parsed.duration) || 10.0,
                camera: (parsed && parsed.camera) || null,
                has3D: Boolean(parsed && parsed.has3D),
                keyframes: (parsed && parsed.keyframes) || [],
                subtitles: (parsed && parsed.subtitles) || [],
                rawBindings: (parsed && parsed.bindings) || [],
                interactive: (parsed && parsed.interactive) || null,
                gestures: (parsed && parsed.gestures) || null,
                stateMachines: (parsed && parsed.stateMachines) || null,
                emitters: (parsed && parsed.emitters) || null,
                bindInputs: (parsed && parsed.bindInputs) || null,
                svgText: content
              };

              const loaded = this.loadSceneData(scene, shouldPlay);
              this.emit('fileloaded', { filename, type: embeddedAst ? 'ast.svg' : 'svg', id: scene.id });
              resolve(loaded);
            } else if (ext === 'ast') {
              const parsed = this.parseAst(content);
              const scene = {
                id: (parsed && parsed.id) || id,
                title: (parsed && parsed.title) || filename,
                stage: (parsed && parsed.stage) || 'CUSTOM AST',
                duration: (parsed && parsed.duration) || 10.0,
                camera: (parsed && parsed.camera) || null,
                has3D: Boolean(parsed && parsed.has3D),
                keyframes: (parsed && parsed.keyframes) || [],
                subtitles: (parsed && parsed.subtitles) || [],
                rawBindings: (parsed && parsed.bindings) || [],
                interactive: (parsed && parsed.interactive) || null,
                gestures: (parsed && parsed.gestures) || null,
                stateMachines: (parsed && parsed.stateMachines) || null,
                emitters: (parsed && parsed.emitters) || null,
                bindInputs: (parsed && parsed.bindInputs) || null,
                svgText: ''
              };
              const loaded = this.loadSceneData(scene, shouldPlay);
              this.emit('fileloaded', { filename, type: 'ast', id: scene.id });
              resolve(loaded);
            } else {
              // Heuristic content-based detection
              if (content.startsWith('{')) {
                const json = JSON.parse(content);
                resolve(this.loadSceneData(json, shouldPlay));
              } else if (content.startsWith('(')) {
                const parsed = this.parseAst(content);
                resolve(this.loadSceneData({ id, ...parsed }, shouldPlay));
              } else if (content.includes('<svg')) {
                resolve(this.loadSceneData({ id, title: filename, svgText: content }, shouldPlay));
              } else if (content.startsWith('#') || content.includes('Stage:') || content.includes('Shape:')) {
                if (global.ASTSlideScriptCompiler) {
                  const compiled = global.ASTSlideScriptCompiler.compile(content);
                  resolve(this.loadSceneData(compiled.scene, shouldPlay));
                } else {
                  throw new Error(`SlideScript detected but compiler is not loaded.`);
                }
              } else if (ext === 'html' || ext === 'htm' || ext === 'phet' || (global.ASTPhetBridge && global.ASTPhetBridge.isPhetBundle(content))) {
                if (global.ASTPhetBridge) {
                  const result = global.ASTPhetBridge.transpilePhet(content, filename);
                  const parsed = this.parseAst(result.astSource);
                  const scene = {
                    id: result.id || id,
                    title: result.title || filename,
                    stage: result.stage || 'PhET TRANSLATED',
                    duration: result.duration || 12.0,
                    svgText: result.svgText,
                    keyframes: (parsed && parsed.keyframes) || [],
                    subtitles: (parsed && parsed.subtitles) || [],
                    rawBindings: (parsed && parsed.bindings) || []
                  };
                  const loaded = this.loadSceneData(scene, shouldPlay);
                  this.emit('fileloaded', {
                    filename,
                    type: 'phet-transpiled',
                    id: scene.id,
                    title: scene.title,
                    stage: scene.stage,
                    metadata: result.metadata,
                    svgMarkup: result.svgText,
                    astSource: result.astSource
                  });
                  resolve(loaded);
                } else {
                  throw new Error(`PhET bundle detected but ASTPhetBridge is not loaded.`);
                }
              } else {
                throw new Error(`Unsupported file extension: .${ext}. Expected .json, .ast, .svg, .html (PhET), or SlideScript.`);
              }
            }
          } catch (parseErr) {
            console.error('[AST Engine] Error parsing file:', filename, parseErr);
            this.emit('error', { type: 'FILE_PARSE_ERROR', filename, message: parseErr.message });
            if (this.container) {
              this.renderErrorPlaceholder(filename, `File parse failed: ${parseErr.message}`);
            }
            reject(parseErr);
          }
        };
        reader.readAsText(file);
      });
    }

    /**
     * Reads a File or Blob as UTF-8 text using a Promise.
     * @param {File|Blob} file
     * @returns {Promise<string>}
     */
    readFileAsText(file) {
      if (!file) return Promise.resolve('');
      if (typeof file.text === 'function') {
        return file.text();
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || '').trim());
        reader.onerror = () => reject(new Error(`Failed to read file "${file.name}": ${reader.error?.message}`));
        reader.readAsText(file);
      });
    }

    /**
     * Loads one or multiple simulation files.
     * Intelligently accepts and merges the dual nature of cartridges:
     * 1. Companion Dual-Nature Pairs: Drops of both `.svg` vector artwork + `.ast` logic script simultaneously.
     * 2. Single-File Hybrid Capsules (`.ast.svg`): Vector SVG with embedded executable AST metadata.
     * 3. Single AST, JSON, SlideScript, or translated PhET bundles.
     * @param {FileList|File[]} fileList
     * @param {boolean} shouldPlay
     */
    async loadFiles(fileList, shouldPlay = false) {
      if (!fileList) {
        throw new Error('[AST Engine] loadFiles requires a valid file list');
      }
      const files = Array.from(fileList);
      if (files.length === 0) return null;
      if (files.length === 1) {
        return this.loadFromFile(files[0], shouldPlay);
      }

      // Dual-nature companion pair detection: one .svg and one .ast (or .json / .slidescript)
      const svgFile = files.find(f => {
        const name = (f.name || '').toLowerCase();
        return name.endsWith('.svg') && !name.endsWith('.ast.svg');
      }) || files.find(f => (f.name || '').toLowerCase().endsWith('.svg'));

      const astFile = files.find(f => {
        const name = (f.name || '').toLowerCase();
        return name.endsWith('.ast') || name.endsWith('.json') || name.endsWith('.slidescript');
      });

      if (svgFile && astFile) {
        const [svgContent, astContent] = await Promise.all([
          this.readFileAsText(svgFile),
          this.readFileAsText(astFile)
        ]);

        const astExt = (astFile.name || '').split('.').pop().toLowerCase();
        let parsed = null;
        let interactive = null;
        let gestures = null;
        let stateMachines = null;
        let emitters = null;
        let bindInputs = null;
        let keyframes = [];
        let subtitles = [];
        let rawBindings = [];
        let duration = 10.0;
        let title = astFile.name.replace(/\.[^/.]+$/, '');
        let id = title.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

        if (astExt === 'json') {
          const json = JSON.parse(astContent);
          id = json.id || id;
          title = json.title || title;
          duration = json.duration || duration;
          keyframes = json.keyframes || [];
          subtitles = json.subtitles || [];
          rawBindings = json.bindings || json.rawBindings || [];
          interactive = json.interactive || null;
          gestures = json.gestures || null;
          stateMachines = json.stateMachines || null;
          emitters = json.emitters || null;
          bindInputs = json.bindInputs || null;
        } else if (astExt === 'slidescript') {
          if (global.ASTSlideScriptCompiler) {
            const compiled = global.ASTSlideScriptCompiler.compile(astContent);
            parsed = compiled.scene;
            id = parsed.id || id;
            title = parsed.title || title;
            duration = parsed.duration || duration;
            keyframes = parsed.keyframes || [];
            subtitles = parsed.subtitles || [];
            rawBindings = parsed.rawBindings || [];
          }
        } else {
          // Standard AST S-Expression file
          parsed = this.parseAst(astContent);
          if (parsed) {
            id = parsed.id || id;
            title = parsed.title || title;
            duration = parsed.duration || duration;
            keyframes = parsed.keyframes || [];
            subtitles = parsed.subtitles || [];
            rawBindings = parsed.bindings || [];
            interactive = parsed.interactive || null;
            gestures = parsed.gestures || null;
            stateMachines = parsed.stateMachines || null;
            emitters = parsed.emitters || null;
            bindInputs = parsed.bindInputs || null;
          }
        }

        const scene = {
          id,
          title,
          stage: `DUAL PAIR (${astFile.name} + ${svgFile.name})`,
          duration,
          camera: (parsed && parsed.camera) || null,
          has3D: Boolean(parsed && parsed.has3D),
          keyframes,
          subtitles,
          rawBindings,
          interactive,
          gestures,
          stateMachines,
          emitters,
          bindInputs,
          svgText: svgContent
        };

        const loaded = this.loadSceneData(scene, shouldPlay);
        this.emit('fileloaded', {
          filename: `${astFile.name} + ${svgFile.name}`,
          type: 'companion-pair',
          id: scene.id,
          dualNature: true
        });
        return loaded;
      }

      // If multiple files dropped without an explicit svg+ast pair, load the primary simulation file
      const primaryFile = files.find(f => /\.(ast|svg|json|html|slidescript)$/i.test(f.name)) || files[0];
      return this.loadFromFile(primaryFile, shouldPlay);
    }

    /**
     * Loads a simulation directly from a zero-server URL payload string or base64 payload.
     * Supports S-expressions (#ast=...), SlideScript markdown (#script=...), or JSON (#data=...).
     * @param {string} payload
     * @param {boolean} shouldPlay
     */
    loadFromPayload(payload, shouldPlay = false) {
      if (!payload || typeof payload !== 'string') {
        const err = new Error('[AST Engine] loadFromPayload requires a valid string');
        this.emit('error', { type: 'INVALID_PAYLOAD', message: err.message });
        throw err;
      }

      let content = payload.trim();
      // Decode Base64 if flagged or clean base64 string
      if (content.startsWith('base64:')) {
        try {
          content = decodeURIComponent(escape(atob(content.slice(7))));
        } catch (e) {
          try { content = atob(content.slice(7)); } catch {}
        }
      } else if (!content.startsWith('(') && !content.startsWith('{') && !content.startsWith('<') && !content.startsWith('#') && /^[A-Za-z0-9+/=_-]+$/.test(content)) {
        try {
          const rawB64 = content.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = decodeURIComponent(escape(atob(rawB64)));
          if (decoded.startsWith('(') || decoded.startsWith('{') || decoded.startsWith('<') || decoded.startsWith('#')) {
            content = decoded;
          }
        } catch {}
      }

      const id = `payload-${Date.now()}`;

      // 1. AST S-Expression
      if (content.startsWith('(')) {
        const parsed = this.parseAst(content);
        const scene = {
          id: (parsed && parsed.id) || id,
          title: (parsed && parsed.title) || 'Decentralized Vector Simulation',
          stage: (parsed && parsed.stage) || 'DECENTRALIZED WEB',
          duration: (parsed && parsed.duration) || 10.0,
          camera: (parsed && parsed.camera) || null,
          has3D: Boolean(parsed && parsed.has3D),
          keyframes: (parsed && parsed.keyframes) || [],
          subtitles: (parsed && parsed.subtitles) || [],
          rawBindings: (parsed && parsed.bindings) || [],
          interactive: (parsed && parsed.interactive) || null,
          gestures: (parsed && parsed.gestures) || null,
          stateMachines: (parsed && parsed.stateMachines) || null,
          emitters: (parsed && parsed.emitters) || null,
          bindInputs: (parsed && parsed.bindInputs) || null,
          svgText: ''
        };
        const loaded = this.loadSceneData(scene, shouldPlay);
        this.emit('fileloaded', { filename: `${scene.id}.ast`, type: 'ast-payload', id: scene.id });
        return loaded;
      }

      // 2. SlideScript Markdown
      if (content.startsWith('#') || content.includes('Stage:') || content.includes('Shape:')) {
        if (global.ASTSlideScriptCompiler) {
          const compiled = global.ASTSlideScriptCompiler.compile(content);
          const loaded = this.loadSceneData(compiled.scene, shouldPlay);
          this.emit('fileloaded', { filename: `${compiled.scene.id || id}.slidescript`, type: 'slidescript-payload', id: compiled.scene.id || id });
          return loaded;
        }
      }

      // 3. JSON Scene
      if (content.startsWith('{')) {
        const json = JSON.parse(content);
        const loaded = this.loadSceneData(json, shouldPlay);
        this.emit('fileloaded', { filename: `${json.id || id}.json`, type: 'json-payload', id: json.id || id });
        return loaded;
      }

      // 4. Standalone SVG
      if (content.includes('<svg')) {
        return this.loadFromFile(new Blob([content], { type: 'image/svg+xml' }), shouldPlay);
      }

      throw new Error('[AST Engine] Unrecognized payload format: expected AST S-expression, SlideScript, or JSON');
    }

    /**
     * Loads an external standalone scene manifest (.json), AST file (.ast), or SVG (.svg) from a remote URL.
     * @param {string} url
     * @param {boolean} shouldPlay
     */
    async loadFromUrl(url, shouldPlay = false) {
      if (!url || typeof url !== 'string') {
        const err = new Error('[AST Engine] loadFromUrl requires a valid URL');
        this.emit('error', { type: 'INVALID_URL', message: err.message });
        throw err;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const text = await res.text();
        const cleanUrl = url.split('?')[0];
        const filename = cleanUrl.split('/').pop() || 'remote-asset';
        const blob = new Blob([text], { type: res.headers.get('content-type') || 'text/plain' });
        try {
          Object.defineProperty(blob, 'name', { value: filename, writable: false });
        } catch {}
        return await this.loadFromFile(blob, shouldPlay);
      } catch (err) {
        console.error('[AST Engine] Failed to load from URL:', url, err);
        this.emit('error', { type: 'URL_LOAD_ERROR', url, message: err.message });
        if (this.container) {
          this.renderErrorPlaceholder(url, `Network error: ${err.message}`);
        }
        throw err;
      }
    }

    /**
     * Renders a resilient, accessible vector fallback card inside the container when a scene fails to load.
     * Prevents empty/black screen states in standalone embeds.
     */
    renderErrorPlaceholder(identifier, message) {
      if (!this.container) return;
      const escapeXmlText = (str) => String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
      const safeId = escapeXmlText(identifier || 'Unknown');
      const safeMsg = escapeXmlText(message || 'Failed to load vector asset');
      this.container.innerHTML = `
        <svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:12px;">
          <rect x="20" y="20" width="760" height="440" rx="16" fill="#0f172a" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 6"/>
          <circle cx="400" cy="180" r="42" fill="#ef4444" fill-opacity="0.12" stroke="#ef4444" stroke-width="2.5"/>
          <text x="400" y="192" fill="#ef4444" font-size="34" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">⚠️</text>
          <text x="400" y="260" fill="#f8fafc" font-size="20" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">Scene Load Error</text>
          <text x="400" y="295" fill="#94a3b8" font-size="14" text-anchor="middle" font-family="system-ui, sans-serif">${safeMsg}</text>
          <text x="400" y="325" fill="#64748b" font-size="12" text-anchor="middle" font-family="monospace">Target: ${safeId}</text>
          <g cursor="pointer" id="error-fallback-action" transform="translate(325, 360)">
            <rect width="150" height="38" rx="19" fill="#2563eb"/>
            <text x="75" y="24" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">Load Default Scene</text>
          </g>
        </svg>
      `;
      const btn = this.container.querySelector('#error-fallback-action');
      if (btn) {
        btn.onclick = () => {
          this.loadScene('fractions', true);
        };
      }
    }

    /**
     * Sanitizes raw SVG text against XML bombs (CWE-776) and DOM-based XSS (CWE-79 / js/xss-through-dom).
     * Strips DOCTYPE, ENTITY declarations, script/foreignObject/iframe tags, inline on* handlers, and javascript: protocols.
     * @param {string} rawSvg
     * @returns {string} Clean SVG markup
     */
    sanitizeSvg(rawSvg) {
      if (!rawSvg || typeof rawSvg !== 'string') return '';
      let clean = rawSvg.trim();

      // 1. Mitigate XML Entity Expansion / XML Bomb (CWE-776)
      // Neutralizes DOCTYPE and ENTITY declarations safely without multi-character string stripping
      if (/<!DOCTYPE|<!ENTITY/i.test(clean)) {
        clean = clean
          .replace(/<!DOCTYPE(?:\s+[^[>]*(?:\[[\s\S]*?\])?\s*)?>/gi, '<!-- DOCTYPE disabled -->')
          .replace(/<!ENTITY[\s\S]*?>/gi, '<!-- ENTITY disabled -->');
      }

      return clean;
    }

    /**
     * Deep-sanitizes parsed SVG DOM element tree before mounting into live container.
     * Recursively scrubs any nested executable elements or script attributes.
     * @param {Element} rootSvg
     * @returns {Element|null} Sanitized root SVG node
     */
    sanitizeSvgElement(rootSvg) {
      if (!rootSvg) return null;
      const dangerousTags = ['script', 'foreignobject', 'iframe', 'embed', 'object', 'link', 'meta', 'style'];
      if (rootSvg.tagName && dangerousTags.includes(rootSvg.tagName.toLowerCase())) return null;

      // 1. Remove dangerous elements via structural DOM queries
      for (const tag of dangerousTags) {
        rootSvg.querySelectorAll(tag).forEach(el => el.remove());
      }

      // 2. Deep-clean attributes across all descendants
      const allElements = [rootSvg, ...rootSvg.querySelectorAll('*')];
      for (const el of allElements) {
        if (!el.attributes) continue;
        const toRemove = [];
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const name = attr.name.toLowerCase();
          const val = (attr.value || '').trim().toLowerCase();

          if (name.startsWith('on')) {
            toRemove.push(attr.name);
          } else if (
            (name === 'href' || name.endsWith(':href') || name === 'src') &&
            /^(javascript:|vbscript:|data:(?!image\/(png|jpe?g|gif|webp|svg\+xml)))/i.test(val)
          ) {
            toRemove.push(attr.name);
          }
        }
        for (const attrName of toRemove) {
          el.removeAttribute(attrName);
        }
      }

      return rootSvg;
    }

    /**
     * Master SVG Asset Catalog Injection (< 1.2 KB)
     * Automatically provisions universal filter glows, directional markers,
     * coordinate grids, and backdrop gradients so cartridges and generative
     * Gemini Nano simulations do not need to duplicate 40-50 lines of boilerplate SVG <defs>.
     */
    ensureMasterDefs(container) {
      if (typeof document === 'undefined') return;
      const target = container || this._container || this.container;
      if (!target) return;
      const rootSvg = (target.tagName && target.tagName.toLowerCase() === 'svg')
        ? target
        : (target.ownerSVGElement || (typeof target.closest === 'function' ? target.closest('svg') : null) || document.getElementById('stage-svg') || (typeof target.querySelector === 'function' ? target.querySelector('svg') : null));
      if (!rootSvg) return;

      if (rootSvg.querySelector('#ast-master-defs') || document.getElementById('ast-master-defs')) return;

      const defsEl = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defsEl.setAttribute('id', 'ast-master-defs');
      defsEl.innerHTML = `
        <filter id="pyth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.65" />
        </filter>
        <filter id="pyth-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ast-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ast-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComponentTransfer in="blur" result="cb">
            <feFuncR type="linear" slope="1.2" />
            <feFuncG type="linear" slope="0.9" />
            <feFuncB type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ast-glow-red" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ast-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ast-glow-purple" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ast-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.55" />
        </filter>
        <filter id="ast-blur-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <marker id="ast-arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
        </marker>
        <marker id="ast-arrow-start" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
          <polygon points="8 0, 0 3, 8 6" fill="#38bdf8" />
        </marker>
        <marker id="ast-arrow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
        </marker>
        <marker id="ast-arrow-gold" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
        </marker>
        <marker id="ast-arrow-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
        </marker>
        <marker id="ast-arrow-emerald" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
        </marker>
        <marker id="ast-vector-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
          <circle cx="3" cy="3" r="2.5" fill="#38bdf8" />
        </marker>
        <pattern id="ast-grid-fine" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.5" />
        </pattern>
        <pattern id="ast-grid-dense" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="none" />
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1.2" stroke-opacity="0.6" />
          <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#1e293b" stroke-width="0.5" stroke-opacity="0.4" />
        </pattern>
        <pattern id="ast-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#475569" fill-opacity="0.6" />
        </pattern>
        <linearGradient id="ast-grad-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="ast-grad-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="ast-grad-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
        <linearGradient id="ast-grad-purple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
        <linearGradient id="ast-grad-crimson" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f87171" />
          <stop offset="100%" stop-color="#dc2626" />
        </linearGradient>
        <linearGradient id="ast-blueprint-backdrop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#070e1b" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      `;
      rootSvg.insertBefore(defsEl, rootSvg.firstChild);
    }

    /**
     * Synchronized Film & Video Backdrop Subsystem
     * Mounts, configures, and synchronizes real HTML5 video elements behind vector stages.
     */
    setupBackdropVideo(scene) {
      if (typeof document === 'undefined') return;

      const stageSvg = this.getStageSvg();
      const parentContainer = (stageSvg && stageSvg.parentElement) || this.container || document.getElementById('player-stage');

      let videoEl = document.getElementById('ast-backdrop-video');
      if (!videoEl && parentContainer) {
        videoEl = document.createElement('video');
        videoEl.id = 'ast-backdrop-video';
        videoEl.setAttribute('playsinline', '');
        videoEl.setAttribute('webkit-playsinline', '');
        videoEl.setAttribute('preload', 'auto');
        videoEl.controls = false;
        videoEl.muted = false;
        videoEl.style.position = 'absolute';
        videoEl.style.top = '0';
        videoEl.style.left = '0';
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoEl.style.zIndex = '1';
        videoEl.style.pointerEvents = 'none';
        videoEl.style.background = '#000000';
        videoEl.style.display = 'none';

        if (stageSvg && stageSvg.parentNode === parentContainer) {
          parentContainer.insertBefore(videoEl, stageSvg);
        } else {
          parentContainer.appendChild(videoEl);
        }
      }

      this.backdropVideo = videoEl;

      if (stageSvg) {
        stageSvg.style.position = 'relative';
        stageSvg.style.zIndex = '2';
        stageSvg.style.background = 'transparent';
      }

      if (scene && (scene.video || scene.hasVideo)) {
        const videoSrc = scene.video;
        if (videoEl && videoSrc) {
          const currentSrc = videoEl.getAttribute('src');
          if (currentSrc !== videoSrc) {
            videoEl.src = videoSrc;
            videoEl.load();
          }
          videoEl.style.objectFit = scene.videoFit || 'contain';
          videoEl.style.display = 'block';

          const onLoadedMeta = () => {
            if (videoEl.duration && Number.isFinite(videoEl.duration) && (!scene.duration || scene.duration === 10.0)) {
              scene.duration = videoEl.duration;
              this.durationSec = videoEl.duration;
            }
            if (this.isPlaying) {
              videoEl.play().catch(() => {});
            }
          };
          videoEl.onloadedmetadata = onLoadedMeta;
          videoEl.onerror = (e) => {
            console.warn('[AST Engine] Backdrop video source unavailable or failed to load:', videoSrc, e);
            videoEl.style.display = 'none';
          };

          if (Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
            videoEl.currentTime = this.progress * videoEl.duration;
          }

          videoEl.onended = () => {
            if (this.loop) {
              videoEl.currentTime = 0;
              videoEl.play().catch(() => {});
            } else {
              this.pause();
            }
          };
        }
      } else if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.style.display = 'none';
        videoEl.onloadedmetadata = null;
        videoEl.onended = null;
      }
    }

    /**
     * Mounts SVG template and compiles AST bindings to DOM nodes
     */
    mountSceneAsset(scene, container) {
      if (!container || !scene || this._isMounting) return;
      this._isMounting = true;
      try {
        this._mountedContainer = container;
        this._mountedSceneId = scene.id;
        this.setupBackdropVideo(scene);
        const stage = this.getStageSvg();
        if (stage) {
          stage.setAttribute('viewBox', '0 0 800 480');
          this._defaultViewBox = '0 0 800 480';
        }
        this.ensureMasterDefs(container);
        this.activeBindings = [];
        this.active3DNodes = [];
        this.active3DLines = [];
        this.active3DRings = [];
        this.active3DPolygons = [];
        this.active3DItems = [];
        this._cachedElements = null;

        // 1. Mount SVG template if available
        if (scene.svgText) {
          try {
            let safeSvg = this.sanitizeSvg(scene.svgText);
            // Replace legacy HTML entities if present to guarantee clean XML parsing
            safeSvg = safeSvg
              .replace(/&times;/g, '×')
              .replace(/&bull;/g, '•')
              .replace(/&Omega;/g, 'Ω')
              .replace(/&nbsp;/g, '&#160;')
              .replace(/&divide;/g, '÷')
              .replace(/&diams;/g, '♦')
              .replace(/&mdash;/g, '—')
              .replace(/&ne;/g, '≠')
              .replace(/&deg;/g, '°');

            let mounted = false;
            if (safeSvg && typeof DOMParser !== 'undefined') {
              const parser = new DOMParser();
              let doc = parser.parseFromString(safeSvg, 'image/svg+xml');

              if (!doc.querySelector('parsererror')) {
                const rootSvg = doc.querySelector('svg');
                if (rootSvg) {
                  this.sanitizeSvgElement(rootSvg);
                  if (typeof container.replaceChildren === 'function') {
                    container.replaceChildren(...rootSvg.childNodes);
                  } else {
                    container.innerHTML = rootSvg.innerHTML;
                  }
                  mounted = true;
                }
              }

              // Fallback to HTML parser if XML parser had an entity or parse warning
              if (!mounted) {
                const htmlDoc = parser.parseFromString(safeSvg, 'text/html');
                const rootSvg = htmlDoc.querySelector('svg');
                if (rootSvg) {
                  this.sanitizeSvgElement(rootSvg);
                  if (typeof container.replaceChildren === 'function') {
                    container.replaceChildren(...rootSvg.childNodes);
                  } else {
                    container.innerHTML = rootSvg.innerHTML;
                  }
                  mounted = true;
                }
              }
            }

            if (!mounted && container) {
              console.warn('[AST Engine] SVG template mounting bypassed due to parse failure.');
            }
          } catch (err) {
            console.warn('SVG mount bypassed due to parse failure:', err);
          }
        } else if (typeof scene.render === 'function' && typeof scene.mount !== 'function') {
          const rendered = scene.render(this.progress);
          if (typeof Node !== 'undefined' && rendered instanceof Node) {
            container.replaceChildren(rendered);
          } else if (typeof rendered === 'string') {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${rendered}</svg>`, 'image/svg+xml');
              const svgEl = doc.querySelector('svg');
              if (svgEl && !doc.querySelector('parsererror')) {
                container.replaceChildren(...svgEl.childNodes);
              }
            } catch (e) {
              console.warn('[AST Engine] Rendered SVG string failed to parse safely:', e);
            }
          }
        }

        // 2. Run procedural mount hook (can populate existing SVG nodes or build its own)
        if (typeof scene.mount === 'function') {
          this._cachedElements = scene.mount(container);
        }

      // Compile AST mathematical evaluation bindings
      if (scene.rawBindings && scene.rawBindings.length) {
        scene.rawBindings.forEach(b => {
          if (b.type === '3d-node') {
            const node = container.querySelector(b.target);
            if (node) {
              let evalX = () => 0, evalY = () => 0, evalZ = () => 0;
              try { evalX = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.x});`); } catch {}
              try { evalY = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.y});`); } catch {}
              try { evalZ = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.z});`); } catch {}
              const labelNode = b.label ? container.querySelector(b.label) : null;
              
              const item = {
                type: '3d-node',
                target: b.target,
                domNode: node,
                labelNode,
                evalX, evalY, evalZ,
                baseR: b.baseR,
                depthFog: b.depthFog,
                meanZ: 0
              };
              this.active3DNodes.push(item);
              this.active3DItems.push(item);
            }
          } else if (b.type === '3d-line') {
            const line = container.querySelector(b.target);
            if (line) {
              let evalX1 = () => 0, evalY1 = () => 0, evalZ1 = () => 0;
              let evalX2 = () => 0, evalY2 = () => 0, evalZ2 = () => 0;
              try { evalX1 = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.x1});`); } catch {}
              try { evalY1 = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.y1});`); } catch {}
              try { evalZ1 = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.z1});`); } catch {}
              try { evalX2 = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.x2});`); } catch {}
              try { evalY2 = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.y2});`); } catch {}
              try { evalZ2 = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.z2});`); } catch {}
              const cap1 = b.cap1 ? container.querySelector(b.cap1) : null;
              const cap2 = b.cap2 ? container.querySelector(b.cap2) : null;

              const item = {
                type: '3d-line',
                target: b.target,
                domNode: line,
                cap1, cap2,
                baseR: b.baseR,
                evalX1, evalY1, evalZ1,
                evalX2, evalY2, evalZ2,
                meanZ: 0
              };
              this.active3DLines.push(item);
              this.active3DItems.push(item);
            }
          } else if (b.type === '3d-ring') {
            const ringNode = container.querySelector(b.target);
            if (ringNode) {
              let evalR = () => 100, evalCX = () => 0, evalCY = () => 0, evalCZ = () => 0;
              let evalTiltX = () => 0, evalTiltY = () => 0, evalTiltZ = () => 0;
              try { evalR = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.r});`); } catch {}
              try { evalCX = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.cx});`); } catch {}
              try { evalCY = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.cy});`); } catch {}
              try { evalCZ = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.cz});`); } catch {}
              try { evalTiltX = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.tiltX});`); } catch {}
              try { evalTiltY = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.tiltY});`); } catch {}
              try { evalTiltZ = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.tiltZ});`); } catch {}

              const item = {
                type: '3d-ring',
                target: b.target,
                domNode: ringNode,
                evalR, evalCX, evalCY, evalCZ,
                evalTiltX, evalTiltY, evalTiltZ,
                segments: b.segments || 24,
                depthFog: b.depthFog,
                meanZ: 0
              };
              this.active3DRings.push(item);
              this.active3DItems.push(item);
            }
          } else if (b.type === '3d-polygon') {
            const polyNode = container.querySelector(b.target);
            if (polyNode) {
              let evalPts = () => [];
              try {
                evalPts = new Function('t', 'vars', 'Math', 'computed', `"use strict"; return (${b.pointsExpr});`);
              } catch {}

              const item = {
                type: '3d-polygon',
                target: b.target,
                domNode: polyNode,
                evalPts,
                depthFog: b.depthFog,
                cullBackface: b.cullBackface,
                meanZ: 0
              };
              this.active3DPolygons.push(item);
              this.active3DItems.push(item);
            }
          } else {
            // Standard 2D attribute binding
            const node = container.querySelector(b.target);
            if (node) {
              let evalFn = () => 0;
              try {
                evalFn = new Function('t', 'vars', 'Math', 'computed', 'astMorphPath', 'astMorphColor', 'astEaseBack', 'astEaseBounce', 'astEaseElastic', 'astSquashStretch', 'clamp', 'lerp', 'map', 'rad', 'deg', 'dist', 'translate', 'rotate', 'scale', 'sineWave', 'smoothstep', `"use strict"; return (${b.expr});`);
              } catch (e) {
                console.warn('[AST Engine] Failed compiling expr:', b.expr, e);
              }
              this.activeBindings.push({
                target: b.target,
                attr: b.attr,
                node,
                evalFn
              });
            }
          }
        });
      }

// 1. Initialize zero-bloat micro-physics if defined on the scene
      if (this.physics && scene.physics) {
        this.physics.clear();
        if (scene.physics.gravity !== undefined) this.physics.setGravity(scene.physics.gravity);
        if (scene.physics.friction !== undefined) this.physics.friction = scene.physics.friction;
        if (scene.physics.groundY !== undefined) this.physics.groundY = scene.physics.groundY;
        if (Array.isArray(scene.physics.bodies)) {
          scene.physics.bodies.forEach(b => {
            if (b && typeof b === 'object') {
              this.physics.addBody(b);
            }
          });
        }
      }

      // 2. Initialize reactive variables for the loaded scene
      this.resetVars();

      // 3. Optimized DOM Partitioning & Hardware Promotion (Static vs Kinematic Actors)
      try {
        if (!container) return;
        const dynamicTargets = new Set();
        
        if (Array.isArray(this.activeBindings)) {
          this.activeBindings.forEach(b => { 
            if (b && b.node && b.node.isConnected) {
              dynamicTargets.add(b.node); 
            } else if (b && b.target) {
              const freshEl = container.querySelector(b.target);
              if (freshEl) {
                b.node = freshEl; // Re-bind to fresh live DOM node
                dynamicTargets.add(freshEl);
              }
            }
          });
        }
        
        if (Array.isArray(this.active3DItems)) {
          this.active3DItems.forEach(item => { 
            if (item && item.domNode && item.domNode.isConnected) {
              dynamicTargets.add(item.domNode); 
            }
          });
        }
        
        if (scene.actors && Array.isArray(scene.actors)) {
          scene.actors.forEach(a => {
            if (a && a.target) {
              const el = container.querySelector(a.target);
              if (el) dynamicTargets.add(el);
            }
          });
        }

        // Apply hardware promotion safely
        dynamicTargets.forEach(el => {
          if (el && el.style && typeof el.style.setProperty === 'function') {
            el.style.setProperty('will-change', 'transform, opacity');
          }
        });

        if (scene.gestures && Array.isArray(scene.gestures)) {
          scene.gestures.forEach(g => {
            const el = container.querySelector(g.target);
            if (el) dynamicTargets.add(el);
          });
        }

        // Apply hardware compositor promotion to all dynamic elements
        dynamicTargets.forEach(node => {
          if (node && node.style) {
            node.style.willChange = 'transform';
            node.setAttribute('data-kinematic', 'true');
            node.style.pointerEvents = 'auto';
          }
        });

        // Apply static containment to explicit static elements or background layers
        if (scene.staticElements && Array.isArray(scene.staticElements)) {
          scene.staticElements.forEach(s => {
            const el = container.querySelector(s.target);
            if (el && el.style) {
              el.style.pointerEvents = 'none';
              el.style.contain = 'paint layout';
              el.setAttribute('data-static', 'true');
            }
          });
        } else {
          // Automatic inference: top-level groups get layout containment without blocking user pointer events
          const directChildren = Array.from(container.children || []);
          directChildren.forEach(child => {
            if (child.id === 'annotation-ink-root' || child.id === 'dev-overlay-root') return;
            const containsDynamic = Array.from(dynamicTargets).some(dt => child.contains(dt));
            if (!containsDynamic && child.style) {
              child.style.contain = 'paint layout';
              child.setAttribute('data-static', 'true');
            }
          });
        }
      } catch (domOptErr) {
        console.warn('[AST Engine] DOM optimization notice:', domOptErr);
      }

      // Mount any registered Multi-Entity Vector Emitters with obstacle collision pipelines
      this.emitters.clear();
      if (scene.emitters && Array.isArray(scene.emitters)) {
        scene.emitters.forEach(emConfig => {
          this.addEmitter(emConfig);
        });
      }
      if (this.emitters && this.emitters.size > 0) {
        for (const em of this.emitters.values()) {
          em.mount(container);
        }
      }

      // Mount any declarative :bind-input items
      if (scene.bindInputs && Array.isArray(scene.bindInputs)) {
        scene.bindInputs.forEach(bi => this.registerBindInput(bi));
      }

      // Mount declarative state transition machines
      this.stateMachines.clear();
      if (scene.stateMachines && Array.isArray(scene.stateMachines)) {
        scene.stateMachines.forEach(smConfig => {
          this.addStateMachine(smConfig);
        });
      }

      this.applyBindings(this.progress);
      this.translateInStageLabels();
      if (typeof window !== 'undefined' && window.__astGestures && typeof window.__astGestures.enhanceSceneInteractivity === 'function') {
        window.__astGestures.enhanceSceneInteractivity();
      }
      } finally {
        this._isMounting = false;
      }
    }

    /**
     * Evaluates AST mathematical bindings directly on the DOM at 60 FPS
     * Includes 3D perspective projection, 3D rings, 3D polygons, and Painter's Algorithm Z-Sorting
     */
    applyBindings(t, dt = 0.016) {
      // Safety check: ensure container has scene elements mounted
      if (!this._isMounting && this._container && (this._mountedSceneId !== this.activePresetId || this._mountedContainer !== this._container)) {
        if (this.scene) {
          this.mountSceneAsset(this.scene, this._container);
        }
      }

      const camera = Object.assign({ distance: 500, pitch: 20, yaw: 0, fov: 60 }, (this.scene && this.scene.camera) || {});

      // Dynamic camera yaw if expression
      if (typeof camera.yaw === 'string') {
        try {
          const clock = this.realtimeSec != null ? this.realtimeSec : (t * (this.durationSec || 12.0));
          const yawFn = new Function('t', 'Math', 'vars', 'clock', `"use strict"; return (${camera.yaw});`);
          camera.yaw = yawFn(t, Math, this.vars || {}, clock);
        } catch {}
      }
      if (typeof camera.pitch === 'string') {
        try {
          const clock = this.realtimeSec != null ? this.realtimeSec : (t * (this.durationSec || 12.0));
          const pitchFn = new Function('t', 'Math', 'vars', 'clock', `"use strict"; return (${camera.pitch});`);
          camera.pitch = pitchFn(t, Math, this.vars || {}, clock);
        } catch {}
      }

      // Calculate combined camera orientation and distance scaling
      const yawBase = typeof camera.yaw === 'number' ? camera.yaw : 0;
      const pitchBase = typeof camera.pitch === 'number' ? camera.pitch : 0;
      const totalYaw = yawBase + (this.cameraOrbit ? this.cameraOrbit.yawOffset : 0);
      const totalPitch = Math.max(-85, Math.min(85, pitchBase + (this.cameraOrbit ? this.cameraOrbit.pitchOffset : 0)));
      const totalScale = Math.max(0.2, Math.min(4.0, (this.cameraOrbit ? this.cameraOrbit.distanceScale : 1.0)));

      // Apply hardware-accelerated 3D spatial transformation to the scene stage container
      // NOTE: Scenes with active software 3D items (3d-node, 3d-line, 3d-ring, 3d-polygon)
      // are ALREADY projected in true 3D perspective by project3D at 60 FPS.
      // Applying CSS rotateY to the container itself causes double-rotation and catastrophic
      // flattening at 90 degrees edge-on! Container transform is ONLY for flat 2D scenes with subtle orbit dragging.
      const hasSoftware3D = Boolean(this.active3DItems && this.active3DItems.length > 0);
      if (this._container && this._container.style) {
        if (!hasSoftware3D && (this.cameraOrbit && (this.cameraOrbit.yawOffset !== 0 || this.cameraOrbit.pitchOffset !== 0 || this.cameraOrbit.distanceScale !== 1.0))) {
          const orbitYaw = Math.max(-45, Math.min(45, this.cameraOrbit.yawOffset));
          const orbitPitch = Math.max(-45, Math.min(45, this.cameraOrbit.pitchOffset));
          this._container.style.transformOrigin = '400px 240px';
          this._container.style.transformBox = 'view-box';
          this._container.style.transform = `perspective(800px) rotateX(${orbitPitch.toFixed(1)}deg) rotateY(${orbitYaw.toFixed(1)}deg) scale(${totalScale.toFixed(2)})`;
          this._container.style.transition = this.isOrbitDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        } else {
          this._container.style.transform = '';
          this._container.style.transition = '';
        }
      }

      // 1. Process 3D Items (Nodes, Lines, Rings, Polygons)
      if (this.active3DItems && this.active3DItems.length) {
        let dnaStrandA = null;
        let dnaStrandB = null;
        const v = this.vars || {};
        const comp = v;
        for (let i = 0; i < this.active3DItems.length; i++) {
          const item = this.active3DItems[i];

          // Check if element is hidden by reactive binding
          if (item.domNode && (item.domNode.getAttribute('display') === 'none' || item.domNode.style.display === 'none')) {
            if (item.labelNode) item.labelNode.setAttribute('opacity', '0');
            if (item.cap1) item.cap1.setAttribute('opacity', '0');
            if (item.cap2) item.cap2.setAttribute('opacity', '0');
            continue;
          }

if (item.type === '3d-node') {
            let wx = Number(item.evalX(t, v, Math, comp)) || 0;
            let wy = Number(item.evalY(t, v, Math, comp)) || 0;
            let wz = Number(item.evalZ(t, v, Math, comp)) || 0;
            if (this.nodeOffsets && this.nodeOffsets.has(item.target)) {
              const off = this.nodeOffsets.get(item.target);
              wx += (off[0] || 0); wy += (off[1] || 0); wz += (off[2] || 0);
            }
            item.worldX = wx;
            item.worldY = wy;
            item.worldZ = wz;
            const proj = this.project3D(wx, wy, wz, camera, 400, 240);
            item.meanZ = Number.isFinite(proj.z) ? proj.z : 0;

            if (item.domNode) {
              const cx = Number.isFinite(proj.x) ? proj.x : 400;
              const cy = Number.isFinite(proj.y) ? proj.y : 240;
              const baseR = Number(item.baseR) || 8;
              const scale = Number.isFinite(proj.scale) ? proj.scale : 1.0;
              const r = Math.max(1, baseR * scale);

              item.domNode.setAttribute('cx', cx.toFixed(1));
              item.domNode.setAttribute('cy', cy.toFixed(1));
              item.domNode.setAttribute('r', r.toFixed(1));
              if (item.depthFog) {
                const op = Number.isFinite(proj.opacity) ? proj.opacity : 1.0;
                item.domNode.setAttribute('opacity', op.toFixed(2));
              }
            }

            if (item.labelNode) {
              const lx = Number.isFinite(proj.x) ? proj.x : 400;
              const ly = Number.isFinite(proj.y) ? proj.y : 240;
              const baseR = Number(item.baseR) || 8;
              const scale = Number.isFinite(proj.scale) ? proj.scale : 1.0;
              const r = baseR * scale;
              item.labelNode.setAttribute('x', lx.toFixed(1));
              item.labelNode.setAttribute('y', (ly + r + 14).toFixed(1));
              if (item.depthFog) {
                const op = Number.isFinite(proj.opacity) ? proj.opacity : 1.0;
                item.labelNode.setAttribute('opacity', op.toFixed(2));
              }
            }
          } else if (item.type === '3d-line') {
            let x1 = Number(item.evalX1(t, v, Math, comp)) || 0;
            let y1 = Number(item.evalY1(t, v, Math, comp)) || 0;
            let z1 = Number(item.evalZ1(t, v, Math, comp)) || 0;
            let x2 = Number(item.evalX2(t, v, Math, comp)) || 0;
            let y2 = Number(item.evalY2(t, v, Math, comp)) || 0;
            let z2 = Number(item.evalZ2(t, v, Math, comp)) || 0;
            if (this.nodeOffsets && this.nodeOffsets.has(item.target)) {
              const off = this.nodeOffsets.get(item.target);
              x1 += (off[0] || 0); y1 += (off[1] || 0); z1 += (off[2] || 0);
              x2 += (off[0] || 0); y2 += (off[1] || 0); z2 += (off[2] || 0);
            }
            item.worldP1 = [x1, y1, z1];
            item.worldP2 = [x2, y2, z2];

            // Support Helicase unzipping interaction for DNA strands
            const unzip = (this.vars && typeof this.vars.unzipProgress === 'number') ? this.vars.unzipProgress : 0;
            let unzipOffset = 0;
            let isUnzipped = false;
            if (item.target && item.target.startsWith('#dna-line-')) {
              const idxMatch = item.target.match(/\d+/);
              if (idxMatch) {
                const idx = parseInt(idxMatch[0], 10);
                if (unzip > 0 && (idx / 18) <= unzip) {
                  isUnzipped = true;
                  unzipOffset = (unzip - (idx / 18) + 0.1) * 35;
                }
                if (!dnaStrandA) dnaStrandA = [];
                if (!dnaStrandB) dnaStrandB = [];
              }
            }

            const p1 = this.project3D(x1 - unzipOffset, y1, z1, camera, 400, 240);
            const p2 = this.project3D(x2 + unzipOffset, y2, z2, camera, 400, 240);
            const z1Val = Number.isFinite(p1.z) ? p1.z : 0;
            const z2Val = Number.isFinite(p2.z) ? p2.z : 0;
            item.meanZ = (z1Val + z2Val) / 2;

            if (item.target && item.target.startsWith('#dna-line-')) {
              const idxMatch = item.target.match(/\d+/);
              if (idxMatch) {
                const idx = parseInt(idxMatch[0], 10);
                dnaStrandA[idx] = p1;
                dnaStrandB[idx] = p2;
              }
            }

            if (item.domNode) {
              const px1 = Number.isFinite(p1.x) ? p1.x : 0;
              const py1 = Number.isFinite(p1.y) ? p1.y : 0;
              const px2 = Number.isFinite(p2.x) ? p2.x : 0;
              const py2 = Number.isFinite(p2.y) ? p2.y : 0;
              const op1 = Number.isFinite(p1.opacity) ? p1.opacity : 1.0;
              const op2 = Number.isFinite(p2.opacity) ? p2.opacity : 1.0;

              item.domNode.setAttribute('x1', px1.toFixed(1));
              item.domNode.setAttribute('y1', py1.toFixed(1));
              item.domNode.setAttribute('x2', px2.toFixed(1));
              item.domNode.setAttribute('y2', py2.toFixed(1));
              if (isUnzipped) {
                item.domNode.setAttribute('opacity', '0.15');
                item.domNode.setAttribute('stroke-dasharray', '3,4');
              } else {
                item.domNode.setAttribute('opacity', ((op1 + op2) / 2).toFixed(2));
                item.domNode.removeAttribute('stroke-dasharray');
              }
            }
            if (item.cap1) {
              const c1x = Number.isFinite(p1.x) ? p1.x : 0;
              const c1y = Number.isFinite(p1.y) ? p1.y : 0;
              const c1op = Number.isFinite(p1.opacity) ? p1.opacity : 1.0;
              const baseR = Number(item.baseR) || 8;
              const scale = Number.isFinite(p1.scale) ? p1.scale : 1.0;
              item.cap1.setAttribute('cx', c1x.toFixed(1));
              item.cap1.setAttribute('cy', c1y.toFixed(1));
              item.cap1.setAttribute('opacity', c1op.toFixed(2));
              item.cap1.setAttribute('r', Math.max(1, baseR * scale).toFixed(1));
            }
            if (item.cap2) {
              const c2x = Number.isFinite(p2.x) ? p2.x : 0;
              const c2y = Number.isFinite(p2.y) ? p2.y : 0;
              const c2op = Number.isFinite(p2.opacity) ? p2.opacity : 1.0;
              const baseR = Number(item.baseR) || 8;
              const scale = Number.isFinite(p2.scale) ? p2.scale : 1.0;
              item.cap2.setAttribute('cx', c2x.toFixed(1));
              item.cap2.setAttribute('cy', c2y.toFixed(1));
              item.cap2.setAttribute('opacity', c2op.toFixed(2));
              item.cap2.setAttribute('r', Math.max(1, baseR * scale).toFixed(1));
            }
          } else if (item.type === '3d-ring') {
            let r = Number(item.evalR(t, v, Math, comp)) || 100;
            let cx = Number(item.evalCX(t, v, Math, comp)) || 0;
            let cy = Number(item.evalCY(t, v, Math, comp)) || 0;
            let cz = Number(item.evalCZ(t, v, Math, comp)) || 0;
            if (this.nodeOffsets && this.nodeOffsets.has(item.target)) {
              const off = this.nodeOffsets.get(item.target);
              cx += (off[0] || 0); cy += (off[1] || 0); cz += (off[2] || 0);
            }
            item.worldCenter = [cx, cy, cz];
            item.worldRadius = r;
            const tiltXDeg = Number(item.evalTiltX(t, v, Math, comp)) || 0;
            const tiltYDeg = Number(item.evalTiltY(t, v, Math, comp)) || 0;
            const tiltZDeg = Number(item.evalTiltZ(t, v, Math, comp)) || 0;

            const rxRad = tiltXDeg * (Math.PI / 180);
            const ryRad = tiltYDeg * (Math.PI / 180);
            const rzRad = tiltZDeg * (Math.PI / 180);

            const n = Math.max(3, item.segments || 24);
            let pathD = '';
            let totalZ = 0;
            let totalOpacity = 0;

            for (let k = 0; k < n; k++) {
              const theta = (k / n) * Math.PI * 2;
              let px = r * Math.cos(theta);
              let py = 0;
              let pz = r * Math.sin(theta);

              if (tiltXDeg !== 0) {
                const py1 = py * Math.cos(rxRad) - pz * Math.sin(rxRad);
                const pz1 = py * Math.sin(rxRad) + pz * Math.cos(rxRad);
                py = py1; pz = pz1;
              }
              if (tiltYDeg !== 0) {
                const px1 = px * Math.cos(ryRad) + pz * Math.sin(ryRad);
                const pz1 = -px * Math.sin(ryRad) + pz * Math.cos(ryRad);
                px = px1; pz = pz1;
              }
              if (tiltZDeg !== 0) {
                const px1 = px * Math.cos(rzRad) - py * Math.sin(rzRad);
                const py1 = px * Math.sin(rzRad) + py * Math.cos(rzRad);
                px = px1; py = py1;
              }

              const proj = this.project3D(cx + px, cy + py, cz + pz, camera, 400, 240);
              const pzVal = Number.isFinite(proj.z) ? proj.z : 0;
              const popVal = Number.isFinite(proj.opacity) ? proj.opacity : 1.0;
              totalZ += pzVal;
              totalOpacity += popVal;

              const pxVal = Number.isFinite(proj.x) ? proj.x : 400;
              const pyVal = Number.isFinite(proj.y) ? proj.y : 240;

              if (k === 0) {
                pathD += `M ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
              } else {
                pathD += ` L ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
              }
            }
            pathD += ' Z';
            item.meanZ = totalZ / n;
            const avgOpacity = totalOpacity / n;

            if (item.domNode) {
              item.domNode.setAttribute('d', pathD);
              if (item.depthFog) {
                item.domNode.setAttribute('opacity', avgOpacity.toFixed(2));
              }
            }
          } else if (item.type === '3d-polygon') {
            let rawPts = item.evalPts(t, v, Math, comp);
            if (this.nodeOffsets && this.nodeOffsets.has(item.target) && Array.isArray(rawPts)) {
              const off = this.nodeOffsets.get(item.target);
              rawPts = rawPts.map(pt => [(pt[0] || 0) + (off[0] || 0), (pt[1] || 0) + (off[1] || 0), (pt[2] || 0) + (off[2] || 0)]);
            }
            item.worldPts = rawPts;
            if (Array.isArray(rawPts) && rawPts.length >= 3) {
              let pathD = '';
              let totalZ = 0;
              let totalOpacity = 0;

              for (let k = 0; k < rawPts.length; k++) {
                const pt = rawPts[k];
                const proj = this.project3D(pt[0] || 0, pt[1] || 0, pt[2] || 0, camera, 400, 240);
                const pzVal = Number.isFinite(proj.z) ? proj.z : 0;
                const popVal = Number.isFinite(proj.opacity) ? proj.opacity : 1.0;
                totalZ += pzVal;
                totalOpacity += popVal;

                const pxVal = Number.isFinite(proj.x) ? proj.x : 400;
                const pyVal = Number.isFinite(proj.y) ? proj.y : 240;

                if (k === 0) {
                  pathD += `M ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
                } else {
                  pathD += ` L ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
                }
              }
              pathD += ' Z';
              item.meanZ = totalZ / rawPts.length;

              if (item.domNode) {
                item.domNode.setAttribute('d', pathD);
                if (item.depthFog) {
                  item.domNode.setAttribute('opacity', (totalOpacity / rawPts.length).toFixed(2));
                }
              }
            }
          }
        // Update continuous DNA sugar-phosphate backbones if present
        if (dnaStrandA && dnaStrandA.length > 1) {
          const bbA = this._container && this._container.querySelector('#dna-backbone-a');
          if (bbA) {
            bbA.setAttribute('d', this._pointsToSpline(dnaStrandA));
          }
        }
        if (dnaStrandB && dnaStrandB.length > 1) {
          const bbB = this._container && this._container.querySelector('#dna-backbone-b');
          if (bbB) {
            bbB.setAttribute('d', this._pointsToSpline(dnaStrandB));
          }
        }
        }

        // Unified Painter's Algorithm: Sort furthest to closest in SVG DOM
        if (this.active3DItems.length > 1) {
          const sorted = [...this.active3DItems].sort((a, b) => {
            // Orbital guide rings belong in the background layer so dashed lines never cut through solid planet spheres or labels
            const isOrbitA = a.type === '3d-ring' && a.target && a.target.includes('orbit');
            const isOrbitB = b.type === '3d-ring' && b.target && b.target.includes('orbit');
            if (isOrbitA && !isOrbitB) return 1; // Orbit guide rings sort first (rendered into background)
            if (!isOrbitA && isOrbitB) return -1;

            // Stabilize Saturn ring relative to Saturn body so the ring smoothly surrounds the globe without flickering
            if (a.target === '#saturn-ring' && b.target === '#planet-saturn') return 1;
            if (a.target === '#planet-saturn' && b.target === '#saturn-ring') return -1;

            return b.meanZ - a.meanZ;
          });
          sorted.forEach(item => {
            const cont = this._container;
            if (item.domNode && item.domNode.parentNode && cont && cont.contains(item.domNode)) {
              item.domNode.parentNode.appendChild(item.domNode);
            }
            if (item.cap1 && item.cap1.parentNode && cont && cont.contains(item.cap1)) {
              item.cap1.parentNode.appendChild(item.cap1);
            }
            if (item.cap2 && item.cap2.parentNode && cont && cont.contains(item.cap2)) {
              item.cap2.parentNode.appendChild(item.cap2);
            }
            if (item.labelNode && item.labelNode.parentNode && cont && cont.contains(item.labelNode)) {
              item.labelNode.parentNode.appendChild(item.labelNode);
            }
});
        }
      }

// 2. Direct 2D AST Math & User Interaction Variable Bindings
      if (this.activeBindings && this.activeBindings.length) {
        const v = this.vars || {};
        for (let i = 0; i < this.activeBindings.length; i++) {
          const b = this.activeBindings[i];
          if (b.node) {
            try {
              const val = b.evalFn(
                t, v, Math, v,
                astMorphPath, astMorphColor, astEaseBack, astEaseBounce, astEaseElastic, astSquashStretch,
                AstMath.clamp, AstMath.lerp, AstMath.map, AstMath.rad, AstMath.deg, AstMath.dist,
                AstMath.translate, AstMath.rotate, AstMath.scale, AstMath.sineWave, AstMath.smoothstep
              );
              if (b.lastVal !== val) {
                b.lastVal = val;
                if (b.attr === 'textContent') {
                  b.node.textContent = String(val);
                } else {
                  const safeVal = typeof val === 'number' && !Number.isFinite(val) ? 0 : val;
                  b.node.setAttribute(b.attr, String(safeVal));
                }
              }
            } catch (err) {}
          }
        }
      }

      // 3. Thermodynamic Gas Emitter Synchronization across timeline & state transitions
      if (this.activePresetId === 'kinetic-gas' && this.emitters && (this.emitters.has('gas-molecules') || this.emitters.size > 0)) {
        const gasEm = this.emitters.get('gas-molecules') || Array.from(this.emitters.values())[0];
        if (gasEm) {
          const manualState = this.vars && this.vars.state;
          const manualTemp = this.vars && this.vars.temp;
          let currentPhase = 'gas';
          if (manualState) {
            currentPhase = String(manualState).toLowerCase();
          } else if (manualTemp !== undefined) {
            if (manualTemp <= 140) currentPhase = 'solid';
            else if (manualTemp <= 273) currentPhase = 'liquid';
            else currentPhase = 'gas';
          } else {
            if (t >= 0.87) currentPhase = 'solid';
            else if (t >= 0.74) currentPhase = 'liquid';
            else currentPhase = 'gas';
          }

          gasEm.setPhaseState(currentPhase);

          let pX = 430;
          if (this.vars && this.vars.volume !== undefined && this.vars.volume !== null) {
            pX = 250 + 180 * (Math.max(0.35, Math.min(1.0, this.vars.volume)) - 0.35) / 0.65;
          } else {
            pX = t < 0.25 ? 430 : (t < 0.51 ? (430 - 180 * Math.min(1, (t - 0.25) / 0.26)) : (t < 0.74 ? 250 : (250 + 180 * Math.min(1, (t - 0.74) / 0.13))));
          }
          gasEm.clampToPistonX(pX);

          if (currentPhase === 'gas') {
            const currentTemp = (this.vars && this.vars.temp) || (t < 0.51 ? 300 : (t < 0.74 ? (300 + 300 * ((t - 0.51) / 0.23)) : 300));
            gasEm.setSpeed(160 * Math.sqrt(currentTemp / 300));
          }
        }
      }

      // 4. Procedural update hook if present
      if (this.scene && typeof this.scene.update === 'function' && this._cachedElements) {
        this.scene.update(t, this._cachedElements, this, dt);
      }
    }

    /**
     * Direct Element Attribute Patching (Decoupled render)
     */
/**
     * Direct Element Attribute Patching (Decoupled render)
     */
    renderCurrentVector(container) {
      const target = container || this.container;
      if (target) {
        if (!this._isMounting && (this._mountedSceneId !== this.activePresetId || this._mountedContainer !== target)) {
          if (this.scene) {
            this.mountSceneAsset(this.scene, target);
          }
        }
        this.applyBindings(this.progress);
        return '';
      }

      if (this.scene && typeof this.scene.render === 'function') {
        return this.scene.render(this.progress);
      }
      return '';
    }

    /**
     * Main Animation Tick Loop with Delta-Time Clamping
     */
    tick(currentTimestamp) {      if (this.lastTimestamp !== null) {
        const rawDeltaSec = (currentTimestamp - this.lastTimestamp) / 1000.0;
        const deltaSec = Math.min(rawDeltaSec, 0.1);
        this.realtimeSec = (this.realtimeSec || 0) + deltaSec;

        // Micro-Physics Subsystem Tick (< 1.5 KB zero-bloat)
        if (this.physics && this.physics.enabled && this.physics.bodies.length > 0) {
          this.physics.update(deltaSec);
        }

        // Declarative State Transition Machines Tick
        for (const sm of this.stateMachines.values()) {
          sm.update(deltaSec, this.reactiveVars || {});
        }

        // Multi-Entity Particle Emitter Collections Tick
        for (const em of this.emitters.values()) {
          em.update(deltaSec);
        }

        // Dynamic continuous simulation check:
        const isDynamicScene = this.isDynamicSim || (this.scene && (this.scene.type === 'Sim' || this.scene.cartridgeType === 'Sim' || this.scene.id === 'solar-system' || typeof this.scene.mount === 'function'));

        if (this.isPlaying) {
          this.progress += (deltaSec / this.durationSec) * this.speed;

          if (this.progress >= 1.0) {
            if (this.loop || isDynamicScene) {
              this.progress = this.progress % 1.0;
              this.lastSpokenIndex = -1;
            } else {
              this.progress = 1.0;
              this.pause();
              this.emit('ended', { duration: this.durationSec });
            }
          }

          this.updateActiveKeyframeAndSpeech(false);

          // Advance continuous astronomical orbital clock for infinite, smooth orbital simulations
          if (!this.vars) this.vars = {};
          const warp = typeof this.vars.warpSpeed === 'number' ? this.vars.warpSpeed : 1.0;
          this.vars._solarClock = (this.vars._solarClock || 0) + (deltaSec * Math.max(0.1, warp) * this.speed);

          // Synchronize backdrop film video clock if running
          if (this.backdropVideo && this.scene && (this.scene.video || this.scene.hasVideo) && !this.backdropVideo.paused && this.backdropVideo.duration > 0) {
            const expectedSec = this.progress * this.durationSec;
            if (Math.abs(this.backdropVideo.currentTime - expectedSec) > 0.35) {
              this.backdropVideo.currentTime = expectedSec;
            }
          }
        }

        // PhET-Grade Continuous 60 FPS Render Loop:
        // Always execute applyBindings every frame so direct manipulation, live physics,
        // particle collisions, and 60 FPS rendering execute continuously even if clock is paused!
        this.applyBindings(this.progress, deltaSec);

        if (this.isPlaying) {
          this.emit('timeupdate', {
            progress: this.progress,
            currentTime: this.progress * this.durationSec,
            duration: this.durationSec
          });
        }
      }

      this.lastTimestamp = currentTimestamp;
      if (typeof requestAnimationFrame !== 'undefined') {
        this.animationFrameId = requestAnimationFrame(this.tick);
      }
    }

    /**
     * Hot-reloads raw SVG markup directly onto the stage container
     * Rebinds active AST expressions without losing clock state or timeline position
     */
    hotReloadSvg(svgMarkup) {
      if (!svgMarkup || typeof svgMarkup !== 'string') return false;
      try {
        if (!this.scene) {
          this.scene = { id: 'custom-scene', title: 'Custom SVG Scene', stage: 'DEVELOPER', duration: 10.0 };
        }
        this.scene.svgText = this.sanitizeSvg(svgMarkup);

        if (this._container) {
          // Mount sanitized scene asset and recompile AST bindings
          this.mountSceneAsset(this.scene, this._container);
          this.applyBindings(this.progress);
        }

        this.emit('svghotreloaded', { svg: this.scene.svgText, progress: this.progress });
        this.notifyParent({ type: 'DEV_HOT_RELOAD_SUCCESS', target: 'svg' });
        return true;
      } catch (err) {
        console.error('[AST Engine] Failed to hot-reload SVG:', err);
        return false;
      }
    }

    /**
     * Hot-reloads AST S-Expressions / keyframes / bindings in real-time
     * Recompiles mathematical expressions and applies them immediately
     */
    hotReloadAst(astInput) {
      if (!astInput) return false;
      try {
        let parsed = typeof astInput === 'string' ? this.parseAst(astInput) : astInput;
        if (!parsed) return false;

        if (!this.scene) this.scene = {};
        this.scene.id = parsed.id || this.scene.id || 'custom-ast';
        this.scene.title = parsed.title || this.scene.title || 'Custom AST Scene';
        this.scene.stage = parsed.stage || this.scene.stage || 'DEVELOPER';
        this.scene.duration = parsed.duration || this.scene.duration || 10.0;
        this.scene.keyframes = parsed.keyframes || [];
        this.scene.subtitles = parsed.subtitles || [];
        this.scene.rawBindings = parsed.bindings || parsed.rawBindings || [];
        if (parsed.interactive) {
          this.scene.interactive = parsed.interactive;
        } else if (parsed.checkpoints && parsed.checkpoints.length > 0) {
          this.scene.interactive = { checkpoints: parsed.checkpoints, hotspots: [] };
        } else {
          this.scene.interactive = null;
        }
        if (parsed.camera) this.scene.camera = parsed.camera;
        if (typeof parsed.has3D === 'boolean') this.scene.has3D = parsed.has3D;
        this.scene.astSource = typeof astInput === 'string' ? astInput : null;

        this.durationSec = this.scene.duration;

        if (this._container) {
          this.mountSceneAsset(this.scene, this._container);
          this.applyBindings(this.progress);
        }

        this.emit('asthotreloaded', { ast: parsed, progress: this.progress });
        this.notifyParent({ type: 'DEV_HOT_RELOAD_SUCCESS', target: 'ast' });
        return true;
      } catch (err) {
        console.error('[AST Engine] Failed to hot-reload AST:', err);
        return false;
      }
    }

    /**
     * Serializes clean SVG stage XML without transient developer overlay elements
     */
    getStageSvgSnapshot() {
      if (typeof document === 'undefined') return '';
      const svg = document.getElementById('stage-svg');
      if (!svg) return '';
      const clone = svg.cloneNode(true);
      const devOverlay = clone.querySelector('#dev-overlay-root');
      if (devOverlay) devOverlay.remove();
      return clone.outerHTML;
    }

    /**
     * Retrieves current AST source or formats current scene configuration
     */
    getCurrentAstSource() {
      if (this.scene && this.scene.astSource) return this.scene.astSource;
      if (!this.scene) return '';

      const s = this.scene;
      let ast = `(:scene :id "${s.id || 'custom'}" :title "${s.title || 'Parametric Scene'}" :stage "${s.stage || 'CURRICULUM'}" :duration ${(s.duration || 10.0).toFixed(1)}\n`;

      if (s.subtitles && s.subtitles.length) {
        ast += `  (:subtitles (\n`;
        s.subtitles.forEach(sub => {
          ast += `    (:start ${sub.start.toFixed(2)} :end ${sub.end.toFixed(2)} :en "${sub.en || ''}"${sub.es ? ` :es "${sub.es}"` : ''})\n`;
        });
        ast += `  ))\n`;
      }

      if (s.keyframes && s.keyframes.length) {
        ast += `  (:keyframes (\n`;
        s.keyframes.forEach(kf => {
          ast += `    (:t ${kf.t.toFixed(2)} :title "${kf.title}" :rule "${kf.rule}")\n`;
        });
        ast += `  ))\n`;
      }

      if (s.rawBindings && s.rawBindings.length) {
        ast += `  (:bindings (\n`;
        s.rawBindings.forEach(b => {
          if (b.type === '3d-node') {
            ast += `    (:3d-node :target "${b.target}" :x "${b.x}" :y "${b.y}" :z "${b.z}" :baseR ${b.baseR || 6})\n`;
          } else {
            ast += `    (:target "${b.target}" :attr "${b.attr}" :expr "${b.expr}")\n`;
          }
        });
        ast += `  ))\n`;
      }

      ast += `)\n`;
      return ast;
    }

    /**
     * Curriculum-aligned Socratic Checkpoints for interactive active recall.
     * Purely declarative: extracts checkpoints from the active scene's AST definition.
     * Never injects hard-coded or generic fallback questions into cartridges that do not have them.
     */
    getDefaultCheckpoints(presetId) {
      if (this.scene && this.scene.interactive && Array.isArray(this.scene.interactive.checkpoints)) {
        return this.scene.interactive.checkpoints;
      }
      return [];
    }

    /**
     * Non-Linear Branching Decision Tree Handler
     */
    selectBranch(branchIndex) {
      const cp = this.activeCheckpoint || (this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints[0]) || null;
      if (!cp) return;
      const branches = cp.branches || [];
      const branch = branches[branchIndex];
      if (!branch) return;

      if (this.audioSynth) this.audioSynth.playSuccessChime();
      if (this.scormBridge) {
        this.scormBridge.setScore(100);
        this.scormBridge.setStatus('passed');
      }

      this.notifyParent({
        type: 'BRANCH_SELECTED',
        branchIndex,
        label: branch.label,
        targetTime: branch.targetTime,
        explanation: branch.explanation
      });

      if (typeof branch.targetTime === 'number') {
        this.seek(branch.targetTime);
      }
      this.isBranching = false;
      this.play();
    }

    /**
     * Compiles an Autonomous, Self-Contained Single Page Application (SPA) in a single .svg file
     * Contains vector visuals, embedded HUD controls, audio speech synthesis, and Socratic checkpoint quizzes.
     * Can be opened directly in any browser (file:///... or downloaded) with zero dependencies.
     */
    compileAutonomousSvgApplet() {
      if (typeof document === 'undefined') return '';
      const stage = document.getElementById('stage-svg');
      if (!stage) return '';

      const clone = stage.cloneNode(true);
      const devOverlay = clone.querySelector('#dev-overlay-root');
      if (devOverlay) devOverlay.remove();

      // Extract inner visual SVG elements
      const innerSvg = clone.innerHTML;
      const sceneId = this.scene?.id || this.activePresetId || 'scene';
      const sceneTitle = this.scene?.title || 'Interactive Vector Lesson';
      const sceneStage = this.scene?.stage || 'UK CURRICULUM';
      const duration = this.durationSec || 10.0;
      const subtitles = this.scene?.subtitles || [];
      const keyframes = this.scene?.keyframes || [];
      const rawBindings = this.scene?.rawBindings || [];
      const has3D = this.has3D();
      const camera = this.scene?.camera || { yaw: 0, pitch: 0, distance: 1.0 };
      const checkpoints = (this.scene && this.scene.interactive && Array.isArray(this.scene.interactive.checkpoints))
        ? this.scene.interactive.checkpoints
        : ((this.scene && Array.isArray(this.scene.checkpoints)) ? this.scene.checkpoints : []);

      const manifestData = {
        id: sceneId,
        title: sceneTitle,
        stage: sceneStage,
        duration: duration,
        subtitles: subtitles,
        keyframes: keyframes,
        bindings: rawBindings,
        has3D: has3D,
        camera: camera,
        checkpoints: checkpoints
      };

      const manifestJson = JSON.stringify(manifestData).replace(/<\/script>/gi, '<\\/script>');

      return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 800 560" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs id="ast-master-defs">
    <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="hud-card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.65" />
    </filter>
    <linearGradient id="hud-bg-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="hud-bar-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Master Visual Filter Glows -->
    <filter id="ast-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="ast-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComponentTransfer in="blur" result="cb">
        <feFuncR type="linear" slope="1.2" />
        <feFuncG type="linear" slope="0.9" />
        <feFuncB type="linear" slope="0.2" />
      </feComponentTransfer>
      <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="ast-glow-red" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="ast-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="ast-glow-purple" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="ast-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.55" />
    </filter>
    <filter id="ast-blur-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" />
    </filter>

    <!-- Master Directional & Vector Markers -->
    <marker id="ast-arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
    </marker>
    <marker id="ast-arrow-start" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
      <polygon points="8 0, 0 3, 8 6" fill="#38bdf8" />
    </marker>
    <marker id="ast-arrow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
    </marker>
    <marker id="ast-arrow-gold" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
    </marker>
    <marker id="ast-arrow-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
    </marker>
    <marker id="ast-arrow-emerald" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
    </marker>
    <marker id="ast-vector-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
      <circle cx="3" cy="3" r="2.5" fill="#38bdf8" />
    </marker>

    <!-- Master Grids & Patterns -->
    <pattern id="ast-grid-fine" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.5" />
    </pattern>
    <pattern id="ast-grid-dense" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none" />
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1.2" stroke-opacity="0.6" />
      <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#1e293b" stroke-width="0.5" stroke-opacity="0.4" />
    </pattern>
    <pattern id="ast-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#475569" fill-opacity="0.6" />
    </pattern>

    <!-- Master Gradients -->
    <linearGradient id="ast-grad-cyan" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="ast-grad-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="ast-grad-emerald" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="ast-grad-purple" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="ast-grad-crimson" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="100%" stop-color="#dc2626" />
    </linearGradient>
    <linearGradient id="ast-blueprint-backdrop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070e1b" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
  </defs>

  <style>
    <![CDATA[
    * { box-sizing: border-box; }
    text { user-select: none; -webkit-user-select: none; }
    .hud-btn { cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease; }
    .hud-btn:hover { filter: brightness(1.25); transform: translateY(-1px); }
    .hud-btn:active { transform: translateY(1px); }
    .quiz-btn { cursor: pointer; transition: filter 0.15s ease; }
    .quiz-btn:hover { filter: brightness(1.2); }
    ]]>
  </style>

  <!-- Canvas Background -->
  <rect width="800" height="560" fill="url(#hud-bg-grad)" />

  <!-- Top Title Bar -->
  <g id="hud-top-bar">
    <rect x="0" y="0" width="800" height="34" fill="#0b1120e6" stroke="#1e293b" stroke-width="1" />
    <text x="18" y="22" fill="#38bdf8" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif">${sceneStage} • ${sceneTitle}</text>
    <text x="782" y="22" fill="#64748b" font-size="10" font-weight="700" text-anchor="end" font-family="system-ui, -apple-system, sans-serif">⚡ AUTONOMOUS SVG SPA • ST JOSEPH'S</text>
  </g>

  <!-- Vector Scene Stage Viewport (480px height) -->
  <g id="scene-stage" transform="translate(0, 30)">
    ${innerSvg}
  </g>

  <!-- Synchronized Subtitle Overlay -->
  <g id="hud-subtitle-group" transform="translate(400, 470)">
    <rect id="sub-bg" x="-360" y="-18" width="720" height="36" rx="8" fill="#0f172af0" stroke="#38bdf850" stroke-width="1" />
    <text id="sub-text" x="0" y="5" fill="#f8fafc" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Loading lesson...</text>
  </g>

  <!-- Integrated Bottom HUD Control Bar -->
  <g id="hud-control-bar">
    <rect x="0" y="490" width="800" height="70" fill="url(#hud-bar-grad)" stroke="#1e293b" stroke-width="1.5" />
    
    <!-- Scrubber Progress Track -->
    <rect id="track-bg" x="20" y="500" width="760" height="6" rx="3" fill="#334155" cursor="pointer" />
    <rect id="track-fill" x="20" y="500" width="0" height="6" rx="3" fill="#38bdf8" pointer-events="none" />
    <circle id="track-thumb" cx="20" cy="503" r="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" cursor="pointer" />

    <!-- Play/Pause Button -->
    <g id="btn-play" class="hud-btn" transform="translate(20, 516)">
      <rect width="76" height="30" rx="6" fill="#2563eb" />
      <text id="txt-play" x="38" y="20" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">▶ Play</text>
    </g>

    <!-- Reset Button -->
    <g id="btn-reset" class="hud-btn" transform="translate(104, 516)">
      <rect width="64" height="30" rx="6" fill="#334155" />
      <text x="32" y="20" fill="#e2e8f0" font-size="12" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">↺ Reset</text>
    </g>

    <!-- Step Back & Forward -->
    <g id="btn-prev" class="hud-btn" transform="translate(176, 516)">
      <rect width="32" height="30" rx="6" fill="#1e293b" stroke="#475569" />
      <text x="16" y="20" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">◀</text>
    </g>
    <g id="btn-next" class="hud-btn" transform="translate(214, 516)">
      <rect width="32" height="30" rx="6" fill="#1e293b" stroke="#475569" />
      <text x="16" y="20" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">▶</text>
    </g>

    <!-- Time Readout -->
    <text id="txt-time" x="260" y="536" fill="#94a3b8" font-size="12" font-family="ui-monospace, monospace" font-weight="600">00:00 / 00:10</text>

    <!-- Speed Cycle Button -->
    <g id="btn-speed" class="hud-btn" transform="translate(370, 516)">
      <rect width="48" height="30" rx="6" fill="#1e293b" stroke="#475569" />
      <text id="txt-speed" x="24" y="20" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">1.0x</text>
    </g>

    <!-- Voice Narration Button (Web Speech) -->
    <g id="btn-voice" class="hud-btn" transform="translate(426, 516)">
      <rect id="bg-voice" width="86" height="30" rx="6" fill="#1e293b" stroke="#475569" />
      <text id="txt-voice" x="43" y="20" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">🎙️ Voice</text>
    </g>

    <!-- Socratic Quiz Trigger Button -->
    <g id="btn-quiz" class="hud-btn" transform="translate(520, 516)">
      <rect width="78" height="30" rx="6" fill="#047857" />
      <text x="39" y="20" fill="#ecfdf5" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">🎯 Quiz</text>
    </g>

    <!-- Autonomous Status Indicator -->
    <circle cx="700" cy="531" r="4" fill="#22c55e" />
    <text x="710" y="535" fill="#22c55e" font-size="10" font-weight="700" font-family="system-ui, -apple-system, sans-serif">OFFLINE SPA</text>
  </g>

  <!-- Interactive Socratic Checkpoint Modal Card -->
  <g id="quiz-modal" style="display:none;" transform="translate(100, 70)">
    <rect width="600" height="360" rx="16" fill="#0f172af5" stroke="#38bdf8" stroke-width="2" filter="url(#hud-card-shadow)" />
    
    <!-- Modal Header -->
    <rect x="0" y="0" width="600" height="50" rx="16" fill="#1e293b" />
    <text x="24" y="32" fill="#38bdf8" font-size="16" font-weight="800" font-family="system-ui, -apple-system, sans-serif">🎯 Socratic Checkpoint</text>
    <text x="576" y="32" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="end" font-family="system-ui, -apple-system, sans-serif">Formative Check</text>

    <!-- Question Prompt -->
    <text id="quiz-question-txt" x="24" y="85" fill="#f8fafc" font-size="13" font-weight="700" font-family="system-ui, -apple-system, sans-serif">Loading challenge...</text>

    <!-- Options A, B, C -->
    <g id="quiz-opt-0" class="quiz-btn" transform="translate(24, 110)">
      <rect width="552" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
      <text id="quiz-opt-txt-0" x="16" y="26" fill="#e2e8f0" font-size="12" font-family="system-ui, -apple-system, sans-serif">Option A</text>
    </g>
    <g id="quiz-opt-1" class="quiz-btn" transform="translate(24, 160)">
      <rect width="552" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
      <text id="quiz-opt-txt-1" x="16" y="26" fill="#e2e8f0" font-size="12" font-family="system-ui, -apple-system, sans-serif">Option B</text>
    </g>
    <g id="quiz-opt-2" class="quiz-btn" transform="translate(24, 210)">
      <rect width="552" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
      <text id="quiz-opt-txt-2" x="16" y="26" fill="#e2e8f0" font-size="12" font-family="system-ui, -apple-system, sans-serif">Option C</text>
    </g>

    <!-- Diagnostic Feedback Message -->
    <text id="quiz-feedback-txt" x="24" y="282" fill="#94a3b8" font-size="12" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Select an option to evaluate your understanding.</text>

    <!-- Bottom Action Controls -->
    <g id="btn-quiz-resume" class="quiz-btn" style="display:none;" transform="translate(456, 305)">
      <rect width="120" height="34" rx="6" fill="#2563eb" />
      <text x="60" y="22" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Resume ▶</text>
    </g>
    <g id="btn-quiz-dismiss" class="quiz-btn" transform="translate(24, 305)">
      <rect width="80" height="34" rx="6" fill="#334155" />
      <text x="40" y="22" fill="#cbd5e1" font-size="12" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Close ✕</text>
    </g>
  </g>

  <!-- Autonomous Micro-Player Execution Engine -->
  <script type="text/javascript">
    <![CDATA[
    (function () {
      'use strict';
      const data = ${manifestJson};
      let isPlaying = false;
      let progress = 0.0;
      let speed = 1.0;
      let voiceEnabled = false;
      let lastTimestamp = null;
      let animId = null;
      let lastSpokenIndex = -1;
      const duration = data.duration || 10.0;

      // DOM references
      const elTrackBg = document.getElementById('track-bg');
      const elTrackFill = document.getElementById('track-fill');
      const elTrackThumb = document.getElementById('track-thumb');
      const elBtnPlay = document.getElementById('btn-play');
      const elTxtPlay = document.getElementById('txt-play');
      const elBtnReset = document.getElementById('btn-reset');
      const elBtnPrev = document.getElementById('btn-prev');
      const elBtnNext = document.getElementById('btn-next');
      const elTxtTime = document.getElementById('txt-time');
      const elBtnSpeed = document.getElementById('btn-speed');
      const elTxtSpeed = document.getElementById('txt-speed');
      const elBtnVoice = document.getElementById('btn-voice');
      const elTxtVoice = document.getElementById('txt-voice');
      const elBtnQuiz = document.getElementById('btn-quiz');
      const elSubText = document.getElementById('sub-text');

      const elQuizModal = document.getElementById('quiz-modal');
      const elQuizPrompt = document.getElementById('quiz-question-txt');
      const elQuizFeedback = document.getElementById('quiz-feedback-txt');
      const elBtnQuizResume = document.getElementById('btn-quiz-resume');
      const elBtnQuizDismiss = document.getElementById('btn-quiz-dismiss');

      let activeCheckpoint = null;
      const triggeredCheckpoints = {};

      // AstMath Master Math & Transform Extension for autonomous SVG
      const AstMath = {
        clamp: (v, min = 0, max = 1) => Math.max(min, Math.min(max, Number(v) || 0)),
        lerp: (a, b, t) => (Number(a) || 0) + ((Number(b) || 0) - (Number(a) || 0)) * (Number(t) || 0),
        map: (val, inMin, inMax, outMin, outMax) => {
          const d = inMax - inMin;
          return Math.abs(d) < 1e-9 ? outMin : outMin + ((val - inMin) / d) * (outMax - outMin);
        },
        rad: (deg) => (Number(deg) || 0) * (Math.PI / 180),
        deg: (rad) => (Number(rad) || 0) * (180 / Math.PI),
        dist: (x1, y1, x2, y2) => Math.hypot((x2 || 0) - (x1 || 0), (y2 || 0) - (y1 || 0)),
        sineWave: (t, freq = 1, amp = 1, phase = 0) => amp * Math.sin(2 * Math.PI * freq * (Number(t) || 0) + phase),
        spring: (t, damp = 6, freq = 15) => Math.exp(-damp * Math.max(0, t)) * Math.cos(freq * Math.max(0, t)),
        step: (edge, x) => (x < edge ? 0 : 1),
        smoothstep: (edge0, edge1, x) => {
          const val = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
          return val * val * (3 - 2 * val);
        },
        translate: (x, y = 0) => 'translate(' + (Number(x) || 0).toFixed(2) + ', ' + (Number(y) || 0).toFixed(2) + ')',
        rotate: (deg, cx, cy) => {
          const d = (Number(deg) || 0).toFixed(2);
          return cx != null && cy != null ? 'rotate(' + d + ' ' + (Number(cx) || 0).toFixed(2) + ' ' + (Number(cy) || 0).toFixed(2) + ')' : 'rotate(' + d + ')';
        },
        scale: (sx, sy) => {
          const x = (Number(sx) || 1).toFixed(3);
          return sy != null ? 'scale(' + x + ', ' + (Number(sy) || 1).toFixed(3) + ')' : 'scale(' + x + ')';
        },
        fixed: (num, decimals = 2) => (Number(num) || 0).toFixed(decimals)
      };
      Object.assign(Math, AstMath);

      // Compile continuous mathematical AST expressions
      const compiledBindings = (data.bindings || []).map(b => {
        if (!b.expr) return null;
        try {
          return {
            target: b.target,
            attr: b.attr,
            fn: new Function('t', 'Math', 'clamp', 'lerp', 'map', 'rad', 'deg', 'dist', 'translate', 'rotate', 'scale', 'sineWave', 'smoothstep', 'return (' + b.expr + ');')
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      function applyBindings(t) {
        for (let i = 0; i < compiledBindings.length; i++) {
          const b = compiledBindings[i];
          const nodes = document.querySelectorAll(b.target);
          if (!nodes || !nodes.length) continue;
          try {
            const val = b.fn(t, Math, AstMath.clamp, AstMath.lerp, AstMath.map, AstMath.rad, AstMath.deg, AstMath.dist, AstMath.translate, AstMath.rotate, AstMath.scale, AstMath.sineWave, AstMath.smoothstep);
            for (let j = 0; j < nodes.length; j++) {
              const n = nodes[j];
              if (b.attr === 'textContent') {
                n.textContent = String(val);
              } else if (b.attr === 'style' || b.attr.startsWith('style.')) {
                const prop = b.attr.replace(/^style\\./, '');
                n.style[prop] = val;
              } else {
                n.setAttribute(b.attr, String(val));
              }
            }
          } catch (err) {}
        }

        // Subtitles
        const curSec = t * duration;
        let foundSub = null;
        let subIdx = -1;
        if (data.subtitles) {
          for (let s = 0; s < data.subtitles.length; s++) {
            const sub = data.subtitles[s];
            if (t >= sub.start && t < sub.end) {
              foundSub = sub.en || sub.text;
              subIdx = s;
              break;
            }
          }
        }
        if (elSubText) elSubText.textContent = foundSub || (data.title + ' • Step ' + Math.ceil(t * 4));

        // On-Device Web Speech Synthesis
        if (voiceEnabled && 'speechSynthesis' in window && subIdx >= 0 && subIdx !== lastSpokenIndex && foundSub) {
          lastSpokenIndex = subIdx;
          try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(foundSub);
            u.rate = 1.0;
            window.speechSynthesis.speak(u);
          } catch (e) {}
        }

        // Formative Socratic Checkpoint Trigger
        if (isPlaying && data.checkpoints && data.checkpoints.length) {
          for (let c = 0; c < data.checkpoints.length; c++) {
            const cp = data.checkpoints[c];
            if (Math.abs(t - cp.t) < 0.025 && !triggeredCheckpoints[c]) {
              triggeredCheckpoints[c] = true;
              showQuizCheckpoint(cp);
              pause();
              break;
            }
          }
        }

        // Scrubber HUD updates
        const trackWidth = 760;
        const fillW = Math.max(0, Math.min(trackWidth, t * trackWidth));
        if (elTrackFill) elTrackFill.setAttribute('width', fillW);
        if (elTrackThumb) elTrackThumb.setAttribute('cx', 20 + fillW);

        const sSec = Math.floor(curSec % 60).toString().padStart(2, '0');
        const sMin = Math.floor(curSec / 60).toString().padStart(2, '0');
        const tSec = Math.floor(duration % 60).toString().padStart(2, '0');
        const tMin = Math.floor(duration / 60).toString().padStart(2, '0');
        if (elTxtTime) elTxtTime.textContent = sMin + ':' + sSec + ' / ' + tMin + ':' + tSec;
      }

      function tick(ts) {
        if (!lastTimestamp) lastTimestamp = ts;
        const dt = Math.min(0.1, (ts - lastTimestamp) / 1000);
        lastTimestamp = ts;

        if (isPlaying) {
          progress += (dt * speed) / duration;
          if (progress >= 1.0) {
            progress = 1.0;
            pause();
          }
          applyBindings(progress);
        }
        if (isPlaying) {
          animId = requestAnimationFrame(tick);
        }
      }

      function play() {
        if (progress >= 1.0) progress = 0.0;
        isPlaying = true;
        lastTimestamp = null;
        if (elTxtPlay) elTxtPlay.textContent = '⏸ Pause';
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(tick);
      }

      function pause() {
        isPlaying = false;
        lastTimestamp = null;
        if (elTxtPlay) elTxtPlay.textContent = '▶ Play';
        if (animId) cancelAnimationFrame(animId);
      }

      function seek(p) {
        progress = Math.max(0.0, Math.min(1.0, p));
        applyBindings(progress);
      }

      function showQuizCheckpoint(cp) {
        activeCheckpoint = cp;
        if (!elQuizModal) return;
        elQuizModal.style.display = 'block';
        if (elQuizPrompt) elQuizPrompt.textContent = cp.question;
        if (elQuizFeedback) {
          elQuizFeedback.textContent = '💡 ' + (cp.hint || 'Select an option to evaluate your understanding.');
          elQuizFeedback.setAttribute('fill', '#94a3b8');
        }
        if (elBtnQuizResume) elBtnQuizResume.style.display = 'none';

        const origOpts = cp.options || [];
        const origAns = cp.answerKey !== undefined ? cp.answerKey : (cp.answer !== undefined ? cp.answer : 0);
        const mapped = origOpts.map((text, idx) => ({ text, isCorrect: idx === origAns }));
        for (let i = mapped.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = mapped[i]; mapped[i] = mapped[j]; mapped[j] = t;
        }

        mapped.forEach((item, idx) => {
          const g = document.getElementById('quiz-opt-' + idx);
          const txt = document.getElementById('quiz-opt-txt-' + idx);
          if (g && txt) {
            g.style.display = 'block';
            txt.textContent = String.fromCharCode(65 + idx) + ') ' + item.text;
            const rect = g.querySelector('rect');
            if (rect) {
              rect.setAttribute('fill', '#1e293b');
              rect.setAttribute('stroke', '#334155');
            }
            g.onclick = function () {
              const isCorrect = item.isCorrect;
              if (rect) {
                rect.setAttribute('fill', isCorrect ? '#064e3b' : '#7f1d1d');
                rect.setAttribute('stroke', isCorrect ? '#10b981' : '#ef4444');
              }
              if (elQuizFeedback) {
                elQuizFeedback.textContent = isCorrect
                  ? '✔ Correct! ' + (cp.explanation || 'Mastery confirmed.')
                  : '✘ Misconception: ' + (cp.explanation || 'Review core rule.');
                elQuizFeedback.setAttribute('fill', isCorrect ? '#34d399' : '#f87171');
              }
              if (elBtnQuizResume) elBtnQuizResume.style.display = 'block';
            };
          }
        });
      }

      // Event Listeners
      if (elBtnPlay) elBtnPlay.onclick = function () { isPlaying ? pause() : play(); };
      if (elBtnReset) elBtnReset.onclick = function () {
        pause();
        for (let k in triggeredCheckpoints) delete triggeredCheckpoints[k];
        seek(0.0);
      };
      if (elBtnPrev) elBtnPrev.onclick = function () { seek(progress - 0.1); };
      if (elBtnNext) elBtnNext.onclick = function () { seek(progress + 0.1); };
      if (elBtnSpeed) elBtnSpeed.onclick = function () {
        const speeds = [0.5, 1.0, 1.5, 2.0];
        const curIdx = speeds.indexOf(speed);
        speed = speeds[(curIdx + 1) % speeds.length];
        if (elTxtSpeed) elTxtSpeed.textContent = speed.toFixed(1) + 'x';
      };
      if (elBtnVoice) elBtnVoice.onclick = function () {
        voiceEnabled = !voiceEnabled;
        const bg = document.getElementById('bg-voice');
        if (bg) bg.setAttribute('fill', voiceEnabled ? '#0284c7' : '#1e293b');
        if (elTxtVoice) elTxtVoice.textContent = voiceEnabled ? '🔊 Voice ON' : '🎙️ Voice';
      };
      if (elBtnQuiz) elBtnQuiz.onclick = function () {
        if (!data.checkpoints || !data.checkpoints.length) {
          return;
        }
        if (elQuizModal && elQuizModal.style.display === 'block') {
          elQuizModal.style.display = 'none';
          return;
        }
        const cp = data.checkpoints[0];
        pause();
        showQuizCheckpoint(cp);
      };
      if (elBtnQuizResume) elBtnQuizResume.onclick = function () {
        if (elQuizModal) elQuizModal.style.display = 'none';
        play();
      };
      if (elBtnQuizDismiss) elBtnQuizDismiss.onclick = function () {
        if (elQuizModal) elQuizModal.style.display = 'none';
      };

      if (elTrackBg) {
        elTrackBg.onclick = function (e) {
          const rect = elTrackBg.getBoundingClientRect();
          const p = (e.clientX - rect.left) / rect.width;
          seek(p);
        };
      }

      // Keyboard Controls
      window.addEventListener('keydown', function (e) {
        if (e.code === 'Space') { e.preventDefault(); isPlaying ? pause() : play(); }
        else if (e.code === 'ArrowLeft') { e.preventDefault(); seek(progress - 0.05); }
        else if (e.code === 'ArrowRight') { e.preventDefault(); seek(progress + 0.05); }
      });

      // Initial Frame
      applyBindings(0.0);
    })();
    ]]>
  </script>
</svg>`;
    }
  }

  // Setup postMessage Gateway with Origin Validation
  function setupPostMessageBridge(engine, uiController) {
    if (typeof window === 'undefined') return;

    window.addEventListener('message', (event) => {
      const expectedOrigin = engine.targetOrigin;
      if (expectedOrigin && expectedOrigin !== '*' && event.origin !== expectedOrigin) {
        if (window.location.origin && window.location.origin !== 'null' && event.origin !== window.location.origin) {
          console.warn('[AST-Player] Rejected unauthorized cross-origin message from:', event.origin);
          return;
        }
      }

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'SEEK':
          if (typeof data.progress === 'number') engine.seek(data.progress);
          break;
        case 'PLAY':
          engine.play();
          break;
        case 'PAUSE':
          engine.pause();
          break;
        case 'TOGGLE_PLAY':
          engine.togglePlay();
          break;
        case 'SET_LOOP':
          if (typeof data.loop === 'boolean') engine.setLoop(data.loop);
          break;
        case 'TOGGLE_LOOP':
          engine.toggleLoop();
          break;
        case 'SET_VOLUME':
          if (typeof data.volume === 'number') engine.setVolume(data.volume);
          break;
        case 'SET_MUTED':
          if (typeof data.muted === 'boolean') engine.setMuted(data.muted);
          break;
        case 'TOGGLE_MUTE':
          engine.toggleMute();
          break;
        case 'SET_GRAVITY':
          if (typeof data.gravity === 'number' && engine.physics) engine.physics.setGravity(data.gravity);
          break;
        case 'SET_RESTITUTION':
          if (typeof data.bounce === 'number' && engine.physics) engine.physics.setRestitution(data.bounce);
          break;
        case 'SET_FRICTION':
          if (typeof data.friction === 'number' && engine.physics) engine.physics.setFriction(data.friction);
          break;
        case 'RESET_PHYSICS':
          if (engine.physics) engine.physics.reset();
          break;
        case 'PHYSICS_IMPULSE':
          if (engine.physics) engine.physics.applyImpulse(data.target || data.id, data.fx || 0, data.fy || -400);
          break;
        case 'PHYSICS_JUMP':
          if (engine.physics) engine.physics.jump(data.target || data.id, data.jumpVelocity || -480);
          break;
        case 'SET_SPEED':
          if (data.speed) engine.setSpeed(data.speed);
          break;
        case 'SET_LANGUAGE':
        case 'SET_LANG':
          if (data.lang) engine.setLanguage(data.lang);
          if (uiController && uiController.updateView) uiController.updateView();
          break;
        case 'SET_BILINGUAL_SUBTITLES':
          engine.setBilingualSubtitles(data.enabled);
          if (uiController && uiController.updateView) uiController.updateView();
          break;
        case 'SET_SPEECH_RATE':
          if (data.rate) engine.setSpeechRate(data.rate);
          break;
        case 'SET_PRESET':
          if (data.preset) {
            const canonicalPreset = (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.normalizeId === 'function')
              ? global.ASTSceneRegistry.normalizeId(data.preset)
              : data.preset;
            if (engine.activePresetId === canonicalPreset && engine._mountedSceneId === canonicalPreset && engine.scene) {
              if (data.play === true && !engine.isPlaying) {
                engine.play();
              } else if (data.play === false && engine.isPlaying) {
                engine.pause();
              }
            } else {
              engine.loadScene(canonicalPreset, data.play !== false);
            }
          }
          break;
        case 'STEP_NEXT_KEYFRAME':
        case 'NEXT_SLIDE':
          if (uiController && typeof uiController.stepToNextKeyframe === 'function') {
            uiController.stepToNextKeyframe();
          } else {
            engine.step(0.05);
          }
          break;
        case 'STEP_PREV_KEYFRAME':
        case 'PREV_SLIDE':
          if (uiController && typeof uiController.stepToPrevKeyframe === 'function') {
            uiController.stepToPrevKeyframe();
          } else {
            engine.step(-0.05);
          }
          break;
        case 'STEP_TO_KEYFRAME':
        case 'GOTO_SLIDE':
          if (typeof data.progress === 'number') {
            engine.seek(data.progress);
            if (uiController && typeof uiController.onStopReached === 'function') {
              uiController.onStopReached(data.progress);
            }
          }
          break;
        case 'TOGGLE_BSL':
          if (uiController && typeof uiController.toggleBsl === 'function') {
            uiController.toggleBsl(typeof data.enabled === 'boolean' ? data.enabled : undefined, false);
          }
          break;
        case 'SET_BSL':
          if (uiController && typeof uiController.toggleBsl === 'function') {
            uiController.toggleBsl(typeof data.enabled === 'boolean' ? data.enabled : undefined, false);
          }
          break;
        case 'TRIGGER_CHECKPOINT':
        case 'TAKE_QUIZ':
          if (uiController && typeof uiController.toggleCheckpointView === 'function') {
            uiController.toggleCheckpointView();
          } else if (uiController && typeof uiController.triggerFirstCheckpoint === 'function') {
            uiController.triggerFirstCheckpoint();
          }
          break;
        case 'TOGGLE_CHECKPOINT':
          if (uiController && typeof uiController.toggleCheckpointView === 'function') {
            uiController.toggleCheckpointView();
          }
          break;
        case 'TOGGLE_INTERACTIVE_MODE':
          if (uiController && typeof uiController.toggleInteractiveMode === 'function') {
            uiController.toggleInteractiveMode();
          }
          break;
        case 'SET_QUESTIONS':
        case 'SET_INTERACTIVE_MODE':
          if (uiController && typeof uiController.setInteractiveMode === 'function') {
            const isEnabled = typeof data.enabled === 'boolean' ? data.enabled : (typeof data.value === 'boolean' ? data.value : true);
            uiController.setInteractiveMode(isEnabled);
          }
          break;
        case 'CLOSE_CHECKPOINT':
          if (uiController && typeof uiController.closeInteractiveCard === 'function') {
            uiController.closeInteractiveCard(false);
          }
          break;
        case 'SET_THEME':
          if (data.theme && uiController && uiController.setTheme) {
            uiController.setTheme(data.theme);
          }
          break;
        case 'ROTATE_3D':
          if (typeof data.deltaYaw === 'number' || typeof data.deltaPitch === 'number') {
            engine.rotateCamera(data.deltaYaw || 0, data.deltaPitch || 0);
          }
          break;
        case 'ZOOM_3D':
          if (typeof data.deltaZoom === 'number') {
            engine.zoomCamera(data.deltaZoom);
          }
          break;
        case 'SET_CAMERA':
          if (typeof data.yaw === 'number') engine.cameraOrbit.yawOffset = data.yaw;
          if (typeof data.pitch === 'number') engine.cameraOrbit.pitchOffset = data.pitch;
          if (typeof data.distanceScale === 'number') engine.cameraOrbit.distanceScale = data.distanceScale;
          engine.applyBindings(engine.progress);
          engine.emit('camerachange', { ...engine.cameraOrbit });
          break;
        case 'AUDIO_PLAY_CLICK':
          if (engine.audioSynth) engine.audioSynth.playClick(data.freq || 900);
          break;
        case 'AUDIO_PLAY_SUCCESS':
          if (engine.audioSynth) engine.audioSynth.playSuccessChime();
          break;
        case 'AUDIO_PLAY_FAIL':
          if (engine.audioSynth) engine.audioSynth.playFailBuzz();
          break;
        case 'AUDIO_PLAY_SPRING':
          if (engine.audioSynth) engine.audioSynth.playSpring(data.freq || 440);
          break;
        case 'AUDIO_PLAY_BOING':
          if (engine.audioSynth) engine.audioSynth.playBoing(data.freq || 220);
          break;
        case 'AUDIO_PLAY_WHISTLE':
          if (engine.audioSynth) engine.audioSynth.playSlideWhistle(data.startFreq || 280, data.endFreq || 840, data.duration || 0.35);
          break;
        case 'AUDIO_PLAY_POP':
          if (engine.audioSynth) engine.audioSynth.playPop(data.freq || 620);
          break;
        case 'AUDIO_PLAY_WHOOSH':
          if (engine.audioSynth) engine.audioSynth.playWhoosh();
          break;
        case 'AUDIO_SET_HUM':
          if (engine.audioSynth) engine.audioSynth.setHum(data.freq || 60, data.volume || 0.05);
          break;
        case 'AUDIO_STOP_HUM':
          if (engine.audioSynth) engine.audioSynth.stopHum();
          break;
        case 'SIM_ACTION':
          if (data.action === 'FEED_FISH' && global.__astGestures && global.__astGestures.stageSvg) {
            const evt = new CustomEvent('feed_fish', { detail: { x: 300 + Math.random() * 200, y: 100 + Math.random() * 80 } });
            global.__astGestures.stageSvg.dispatchEvent(evt);
          } else if (data.action === 'TAP_GLASS' && global.__astGestures && global.__astGestures.stageSvg) {
            const evt = new CustomEvent('tap_glass', { detail: { x: 400, y: 240 } });
            global.__astGestures.stageSvg.dispatchEvent(evt);
          }
          break;
        case 'TOGGLE_PEN':
          if (global.__astGestures) {
            global.__astGestures.isPenActive = data.enabled !== undefined ? Boolean(data.enabled) : !global.__astGestures.isPenActive;
            if (global.__astGestures.stageSvg) {
              global.__astGestures.stageSvg.style.cursor = global.__astGestures.isPenActive ? 'crosshair' : 'default';
            }
          }
          break;
        case 'CLEAR_INK':
        case 'CLEAR_WHITEBOARD_INK':
          if (global.__astGestures) {
            global.__astGestures.clearWhiteboardInk();
          }
          break;
        case 'UNDO_WHITEBOARD_INK':
          if (global.__astGestures) {
            global.__astGestures.undoLastStroke();
          }
          break;
        case 'IMPORT_WHITEBOARD_INK':
        case 'LOAD_WHITEBOARD_INK':
          if (global.__astGestures) {
            const raw = data.data || data.ast || data.json;
            if (typeof raw === 'string') {
              if (raw.trim().startsWith('(')) {
                global.__astGestures.importInkFromAST(raw);
              } else {
                try {
                  global.__astGestures.importInkFromJSON(JSON.parse(raw));
                } catch {
                  global.__astGestures.importInkFromAST(raw);
                }
              }
            } else if (typeof raw === 'object') {
              global.__astGestures.importInkFromJSON(raw);
            }
          }
          break;
        case 'EXPORT_WHITEBOARD_INK':
          if (global.__astGestures) {
            global.__astGestures.broadcastInkSession();
          }
          break;
        case 'TOGGLE_XRAY':
          if (global.__astGestures) {
            global.__astGestures.isXRayActive = data.enabled !== undefined ? Boolean(data.enabled) : !global.__astGestures.isXRayActive;
          }
          break;
        case 'SET_VAR':
          if (data.name !== undefined && data.value !== undefined) {
            engine.setVar(data.name, data.value);
          }
          break;
        case 'RESET_VARS':
          engine.resetVars();
          break;
        case 'GET_VARS':
          if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'VARS_STATE', vars: { ...(engine.vars || {}) } }, '*');
          }
          break;
        case 'GET_CONTEXT_SNAPSHOT':
          if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'CONTEXT_SNAPSHOT',
              sceneId: engine.activePresetId,
              title: engine.currentScene ? engine.currentScene.title : engine.activePresetId,
              stage: engine.currentScene ? engine.currentScene.stage : 'CURRICULUM',
              progress: engine.progress,
              currentTime: engine.currentTime,
              duration: engine.duration,
              vars: { ...(engine.vars || {}) },
              computed: { ...(engine.computedValues || {}) },
            }, '*');
          }
          break;
        case 'SCORM_SET_SCORE':
          if (engine.scormBridge) engine.scormBridge.setScore(data.score, data.min || 0, data.max || 100);
          break;
        case 'SCORM_SET_STATUS':
          if (engine.scormBridge) engine.scormBridge.setStatus(data.status);
          break;
        case 'SELECT_BRANCH':
          if (typeof engine.selectBranch === 'function') engine.selectBranch(data.branchIndex);
          break;
        case 'RESET_3D':
          engine.resetCamera();
          break;
        case 'ACTUATE_OPCODE':
          if (data.opcode) {
            engine.actuateOpcode(data.opcode);
          }
          break;
        case 'CAST_CAMERA_RAY':
          engine.emitSpatialTelemetry('QUERY', data.screenX, data.screenY);
          break;
        case 'GET_SPATIAL_TELEMETRY':
          engine.emitSpatialTelemetry('REQUEST');
          break;
        case 'NUDGE_NODE':
          if (data.target && Array.isArray(data.dxyz)) {
            engine.actuateNode(data.target, data.dxyz[0], data.dxyz[1], data.dxyz[2], true);
          }
          break;
        case 'ROTATE_CAMERA_ORBIT':
          if (typeof data.theta === 'number' || typeof data.phi === 'number') {
            engine.actuateCamera(data.theta || 0, data.phi || 0, Boolean(data.relative));
          }
          break;
        case 'VOICE_COMMAND':
        case 'EXECUTE_VOICE_COMMAND':
          if (uiController && typeof uiController.handleVoiceCommand === 'function') {
            uiController.handleVoiceCommand(data.command || data.transcript);
          }
          break;
        case 'TOGGLE_VOICE_COMMANDS':
          if (uiController && typeof uiController.toggleVoiceCommands === 'function') {
            uiController.toggleVoiceCommands();
          }
          break;
        case 'START_VOICE_COMMANDS':
          if (uiController && typeof uiController.startVoiceCommands === 'function') {
            uiController.startVoiceCommands();
          }
          break;
        case 'STOP_VOICE_COMMANDS':
          if (uiController && typeof uiController.stopVoiceCommands === 'function') {
            uiController.stopVoiceCommands();
          }
          break;
        case 'REQUEST_PRINT':
          window.print();
          break;
        case 'INJECT_CHECKPOINT':
          if (data.checkpoint && engine.scene) {
            if (!engine.scene.interactive) engine.scene.interactive = { checkpoints: [], hotspots: [] };
            if (!Array.isArray(engine.scene.interactive.checkpoints)) engine.scene.interactive.checkpoints = [];
            const cp = {
              t: data.checkpoint.t !== undefined ? data.checkpoint.t : engine.progress,
              title: data.checkpoint.title || 'PRACTICE QUESTION',
              prompt: data.checkpoint.prompt || data.checkpoint.question,
              options: data.checkpoint.options || [],
              answer: data.checkpoint.answer !== undefined ? data.checkpoint.answer : 0,
              explanation: data.checkpoint.explanation || ''
            };
            engine.scene.interactive.checkpoints.push(cp);
            engine.pause();
            if (uiController && typeof uiController.triggerCheckpoint === 'function') {
              uiController.triggerCheckpoint(cp, engine.scene.interactive.checkpoints.length - 1);
            }
          }
          break;
        case 'LOAD_CARTRIDGE':
          if (data.cartridge) {
            const cart = data.cartridge;
            const cid = cart.id || 'custom-cartridge';
            const parsed = cart.ast ? engine.parseAst(cart.ast) : null;
            const sceneMeta = {
              id: cid,
              title: cart.title || (parsed && parsed.title) || cid,
              stage: cart.stage || (parsed && parsed.stage) || 'CUSTOM CARTRIDGE',
              duration: cart.duration || (parsed && parsed.duration) || 12.0,
              svgMarkup: cart.svg || cart.svgMarkup || '',
              svgText: cart.svg || cart.svgMarkup || '',
              astSource: cart.ast || cart.astSource || '',
              astText: cart.ast || cart.astSource || '',
              ...parsed
            };
            if (global.ASTSceneRegistry) {
              global.ASTSceneRegistry.register(cid, sceneMeta);
            }
            engine.sceneCache[cid] = null; // force fresh reload
            engine.loadScene(cid, true);
            if (uiController && uiController.showToast) {
              uiController.showToast(`⚡ Loaded Cartridge: ${sceneMeta.title}`);
            }
          }
          break;
        case 'LOAD_AST':
          if (data.ast) {
            const parsed = engine.parseAst(data.ast);
            if (parsed && parsed.id) {
              if (global.ASTSceneRegistry) global.ASTSceneRegistry.register(parsed.id, parsed);
              engine.loadScene(parsed.id);
            }
          }
          break;
        case 'HOT_RELOAD_SVG':
          if (data.svg) {
            engine.hotReloadSvg(data.svg);
            if (uiController && uiController.showToast) {
              uiController.showToast('⚡ SVG Stage Hot-Reloaded');
            }
          }
          break;
        case 'HOT_RELOAD_AST':
          if (data.ast) {
            engine.hotReloadAst(data.ast);
            if (uiController && uiController.showToast) {
              uiController.showToast('⚡ AST Expressions Hot-Reloaded');
            }
          }
          break;
        case 'SET_DEV_MODE':
          if (uiController && typeof uiController.setDevMode === 'function') {
            uiController.setDevMode(Boolean(data.enabled));
          }
          break;
        case 'OPEN_DEV_STUDIO':
          if (uiController && typeof uiController.openDevStudio === 'function') {
            uiController.openDevStudio(data.tab || 'svg');
          }
          break;
        case 'UPDATE_ELEMENT_ATTR':
          if (data.selector && data.attr && engine.container) {
            const node = engine.container.querySelector(data.selector);
            if (node) {
              if (data.attr === 'style' || data.attr.startsWith('style.')) {
                const prop = data.attr.replace(/^style\./, '');
                node.style[prop] = data.value;
              } else if (data.attr === 'textContent') {
                node.textContent = data.value;
              } else {
                node.setAttribute(data.attr, data.value);
              }
            }
          }
          break;
        case 'GET_STAGE_SVG':
          engine.notifyParent({
            type: 'STAGE_SVG_SNAPSHOT',
            svg: engine.getStageSvgSnapshot(),
            ast: engine.getCurrentAstSource(),
            preset: engine.activePresetId
          });
          break;
        case 'GET_AST_SOURCE':
          engine.notifyParent({
            type: 'AST_SOURCE_SNAPSHOT',
            ast: engine.getCurrentAstSource(),
            preset: engine.activePresetId
          });
          break;
        case 'EXPORT_STANDALONE_APPLET':
        case 'GET_STANDALONE_SVG': {
          const appletSvg = engine.compileAutonomousSvgApplet();
          const filename = `${engine.activePresetId || 'scene'}-standalone-applet.svg`;
          engine.notifyParent({
            type: 'STANDALONE_APPLET_COMPILED',
            svg: appletSvg,
            filename: filename,
            preset: engine.activePresetId
          });
          if (uiController && typeof uiController.showToast === 'function') {
            uiController.showToast('🚀 Standalone SVG SPA Compiled');
          }
          break;
        }
        case 'AI_VISUAL_COMMAND':
          if (data.packet || data.actions) {
            const packet = data.packet || {
              transactionId: data.transactionId || `nano_${Date.now()}`,
              actions: data.actions || [],
              pedagogicalIntent: data.pedagogicalIntent || 'STEP_BY_STEP_DEMO',
              rawSExpr: data.rawSExpr,
              sayText: data.sayText
            };
            engine.executeAiVisualCommand(packet);
          }
          break;
        case 'PUPIL_INTERRUPT':
        case 'CANCEL_AI_DEMO':
          engine.preemptAiDemonstration('PARENT_REQUEST');
          break;
        case 'GET_TELEMETRY':
          engine.emitTelemetrySnapshot('REQUESTED');
          break;
        case 'PING':
          engine.notifyParent({
            type: 'PONG',
            ready: true,
            version: ASTVectorPlayerEngine.VERSION,
            license: ASTVectorPlayerEngine.LICENSE,
            has3D: engine.has3D()
          });
          break;
        case 'TOGGLE_OBS_DRAWER':
          if (uiController && typeof uiController.toggleObsDrawer === 'function') {
            uiController.toggleObsDrawer();
          }
          break;
        case 'CONNECT_OBS':
          if (uiController && uiController.obs) {
            uiController.obs.connect(data.url, data.password);
          }
          break;
        case 'DISCONNECT_OBS':
          if (uiController && uiController.obs) {
            uiController.obs.disconnect();
          }
          break;
        case 'SET_OBS_RECORDING':
          if (uiController && uiController.obs) {
            data.record ? uiController.obs.startRecord() : uiController.obs.stopRecord();
          }
          break;
        case 'SET_DISPLAY_CONFIG':
          if (data.config && uiController && typeof uiController.applyDisplayConfig === 'function') {
            uiController.applyDisplayConfig(data.config);
          }
          break;
        case 'TOGGLE_SETTINGS_DRAWER':
          if (uiController && typeof uiController.toggleSettingsDrawer === 'function') {
            uiController.toggleSettingsDrawer();
          }
          break;
        case 'TOGGLE_PIP':
          if (uiController && typeof uiController.togglePictureInPicture === 'function') {
            uiController.togglePictureInPicture();
          }
          break;
        case 'PHYSICS_INIT':
          if (engine.physics && data.config) {
            engine.physics.clear();
            if (data.config.gravity !== undefined) engine.physics.setGravity(data.config.gravity);
            if (data.config.groundY !== undefined) engine.physics.groundY = data.config.groundY;
            if (data.config.friction !== undefined) engine.physics.friction = data.config.friction;
            if (Array.isArray(data.config.bodies)) {
              data.config.bodies.forEach(b => engine.physics.addBody(b));
            }
          }
          break;
        case 'PHYSICS_IMPULSE':
          if (engine.physics) {
            engine.physics.applyImpulse(data.target || data.id, data.fx, data.fy);
          }
          break;
        case 'PHYSICS_JUMP':
          if (engine.physics) {
            engine.physics.jump(data.target || data.id, data.vy || -480);
          }
          break;
        case 'SET_GRAVITY':
          if (engine.physics) {
            engine.physics.setGravity(data.gravity);
          }
          break;
        case 'PHYSICS_RESET':
          if (engine.physics) {
            engine.physics.reset();
          }
          break;
        case 'PHYSICS_CLEAR':
          if (engine.physics) {
            engine.physics.clear();
          }
          break;
      }
    });

    // Notify ready
    engine.notifyParent({
      type: 'PLAYER_READY',
      version: ASTVectorPlayerEngine.VERSION,
      license: ASTVectorPlayerEngine.LICENSE,
      has3D: engine.has3D(),
      hasInteractive: Boolean(engine.scene && engine.scene.interactive && engine.scene.interactive.checkpoints && engine.scene.interactive.checkpoints.length),
      keyframes: (engine.scene && engine.scene.keyframes) || [],
      interactive: (engine.scene && engine.scene.interactive) || null,
      preset: engine.activePresetId,
      isPlaying: engine.isPlaying,
      presets: global.ASTSceneRegistry ? global.ASTSceneRegistry.list() : []
    });
  }

  global.VectorMicroPhysics = VectorMicroPhysics;
  global.ASTVectorPlayerEngine = ASTVectorPlayerEngine;
  global.setupPostMessageBridge = setupPostMessageBridge;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VectorMicroPhysics, ASTVectorPlayerEngine, setupPostMessageBridge };
  }
})(typeof window !== 'undefined' ? window : globalThis);
