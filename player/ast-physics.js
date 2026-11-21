/**
 * static/player/ast-physics.js
 * Zero-Bloat 2D Micro-Physics, Verlet Dynamics & Multi-Entity Particle Emitters for AST Vector Player
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
      this.gravity = options.gravity !== undefined ? Number(options.gravity) : 980; // px/sec² (~9.8 m/s²)
      this.restitution = options.restitution !== undefined
        ? Math.max(0, Math.min(1.0, Number(options.restitution)))
        : (options.bounce !== undefined ? Math.max(0, Math.min(1.0, Number(options.bounce))) : 0.45);
      this.friction = options.friction !== undefined ? Math.max(0, Number(options.friction)) : 0.25;
      this.drag = options.drag !== undefined ? Math.max(0, Number(options.drag)) : 0.0;
      this.stiffness = options.stiffness !== undefined ? Math.max(0, Number(options.stiffness)) : 120;
      this.damping = options.damping !== undefined ? Math.max(0, Number(options.damping)) : 4.0;
      this.groundY = options.groundY !== undefined ? Number(options.groundY) : 420;
      this.enabled = options.enabled !== false;
      this.substeps = options.substeps !== undefined ? Math.max(1, Math.min(32, Math.round(Number(options.substeps) || 4))) : 4;
      this.fixedDt = 1 / (60 * this.substeps); // 1/240s at default 4 substeps per 60 FPS frame
      this.maxFrameDt = 0.05;
      this.accumulator = 0;
      this.lastSubstepsExecuted = 0;
      this.slop = options.slop !== undefined ? Math.max(0, Number(options.slop)) : 0.05;
      this.correctionPercent = 0.8;
      this.squashGain = options.squashGain !== undefined ? Math.max(0, Number(options.squashGain)) : 0.35;
      this.squashDecayRate = 18.0;
      this.bounds = Object.assign({ minX: 10, maxX: 790, minY: 0, maxY: 480 }, options.bounds || {});
      this.bodies = [];
      this.springs = [];
      this.initialStates = new Map();
      this._dirty = true;
      this._spDirty = true;
    }

    addBody(config = {}) {
      const id = config.id || (config.target ? String(config.target).replace(/^[#\.]/, '') : `body_${this.bodies.length + 1}`);
      const restRaw = config.restitution !== undefined ? config.restitution : (config.bounce !== undefined ? config.bounce : this.restitution);
      const body = {
        id,
        target: config.target || `#${id}`,
        x: Number(config.x) || 0,
        y: Number(config.y) || 0,
        vx: Number(config.vx) || 0,
        vy: Number(config.vy) || 0,
        mass: Math.max(0.01, Number(config.mass) || 1.0),
        bounce: Math.max(0.0, Math.min(1.0, Number(restRaw))),
        restitution: Math.max(0.0, Math.min(1.0, Number(restRaw))),
        friction: config.friction !== undefined ? Math.max(0, Number(config.friction)) : this.friction,
        groundY: config.groundY !== undefined ? Number(config.groundY) : this.groundY,
        radius: Math.max(0.5, Number(config.radius) || 16),
        originX: Number(config.originX) || 0,
        originY: Number(config.originY) || 0,
        squash: 0,
        isGrounded: false,
        isStatic: Boolean(config.isStatic || config.static),
        element: null,
        _matrixBuf: new Float32Array([1, 0, 0, 1, Number(config.x) || 0, Number(config.y) || 0]),
        _lastTransform: ''
      };

      this.removeBody(body.id);
      this.bodies.push(body);
      this.initialStates.set(body.id, Object.assign({}, body, { element: null, _matrixBuf: null }));
      this._dirty = true;

      if (config.stiffness !== undefined || config.anchorX !== undefined || config.anchorY !== undefined) {
        const ax = config.anchorX !== undefined ? Number(config.anchorX) : body.x;
        const ay = config.anchorY !== undefined ? Number(config.anchorY) : body.y;
        const dx = body.x - ax;
        const dy = body.y - ay;
        const len = config.length !== undefined ? Number(config.length) : Math.hypot(dx, dy);
        this.addSpring({
          b: body.id,
          anchorX: ax,
          anchorY: ay,
          length: len,
          stiffness: config.stiffness !== undefined ? Number(config.stiffness) : this.stiffness,
          damping: config.damping !== undefined ? Number(config.damping) : this.damping
        });
      }
      return body;
    }

    addSpring(config = {}) {
      const spring = {
        id: config.id || `spring_${this.springs.length + 1}`,
        a: config.a || config.bodyA || config.from || null,
        b: config.b || config.bodyB || config.target || config.to || null,
        anchorX: Number(config.anchorX) || 0,
        anchorY: Number(config.anchorY) || 0,
        length: config.length !== undefined ? Math.max(0, Number(config.length)) : null,
        stiffness: config.stiffness !== undefined ? Math.max(0, Number(config.stiffness)) : this.stiffness,
        damping: config.damping !== undefined ? Math.max(0, Number(config.damping)) : this.damping,
        lineTarget: config.line || config.lineTarget || null,
        lineElement: null
      };
      this.springs.push(spring);
      this._spDirty = true;
      return spring;
    }

    removeBody(idOrTarget) {
      this.bodies = this.bodies.filter(b => b.id !== idOrTarget && b.target !== idOrTarget);
      this.initialStates.delete(idOrTarget);
      this._dirty = true;
      this._spDirty = true;
    }

    clear() {
      this.bodies = [];
      this.springs = [];
      this.initialStates.clear();
      this.accumulator = 0;
      this.lastSubstepsExecuted = 0;
      this._dirty = true;
      this._spDirty = true;
    }

    reset() {
      this.accumulator = 0;
      this.lastSubstepsExecuted = 0;
      for (let i = 0; i < this.bodies.length; i++) {
        const b = this.bodies[i];
        const init = this.initialStates.get(b.id);
        if (init) {
          b.x = init.x;
          b.y = init.y;
          b.vx = init.vx;
          b.vy = init.vy;
          b.squash = 0;
          b.isGrounded = false;
          if (b._matrixBuf) {
            b._matrixBuf[0] = 1; b._matrixBuf[1] = 0;
            b._matrixBuf[2] = 0; b._matrixBuf[3] = 1;
            b._matrixBuf[4] = b.x - b.originX; b._matrixBuf[5] = b.y - b.originY;
          }
        }
      }
      this._dirty = true;
    }

    applyImpulse(idOrTarget, fx, fy) {
      const b = this.bodies.find(body => body.id === idOrTarget || body.target === idOrTarget);
      if (b && !b.isStatic) {
        b.vx += Number(fx || 0) / b.mass;
        b.vy += Number(fy || 0) / b.mass;
        b.isGrounded = false;
        this._dirty = true;
      }
    }

    jump(idOrTarget, jumpVelocity = -480) {
      const b = this.bodies.find(body => body.id === idOrTarget || body.target === idOrTarget);
      if (b && !b.isStatic && b.isGrounded) {
        b.vy = jumpVelocity;
        b.isGrounded = false;
        this._dirty = true;
        return true;
      }
      return false;
    }

    setGravity(g) {
      this.gravity = Number.isFinite(parseFloat(g)) ? parseFloat(g) : 0;
    }

    setRestitution(bounce) {
      const bVal = Math.max(0, Math.min(1.0, Number.isFinite(parseFloat(bounce)) ? parseFloat(bounce) : 0));
      this.restitution = bVal;
      for (let i = 0; i < this.bodies.length; i++) {
        this.bodies[i].bounce = bVal;
        this.bodies[i].restitution = bVal;
      }
      this._dirty = true;
    }

    setFriction(friction) {
      const fVal = Math.max(0.0, Math.min(2.0, Number.isFinite(parseFloat(friction)) ? parseFloat(friction) : 0.25));
      this.friction = fVal;
      for (let i = 0; i < this.bodies.length; i++) {
        this.bodies[i].friction = fVal;
      }
      this._dirty = true;
    }

    setSubsteps(substeps) {
      const s = Math.max(1, Math.min(32, Math.round(Number(substeps) || 4)));
      this.substeps = s;
      this.fixedDt = 1 / (60 * s);
    }

    _ensureBuffers() {
      const n = this.bodies.length;
      if (!this._bufferCapacity || this._bufferCapacity < n) {
        this._bufferCapacity = Math.max(32, Math.pow(2, Math.ceil(Math.log2(Math.max(1, n)))));
        const cap = this._bufferCapacity;
        this._bufX = new Float32Array(cap);
        this._bufY = new Float32Array(cap);
        this._bufVx = new Float32Array(cap);
        this._bufVy = new Float32Array(cap);
        this._bufFx = new Float32Array(cap);
        this._bufFy = new Float32Array(cap);
        this._bufRadius = new Float32Array(cap);
        this._bufMass = new Float32Array(cap);
        this._bufInvMass = new Float32Array(cap);
        this._bufBounce = new Float32Array(cap);
        this._bufFriction = new Float32Array(cap);
        this._bufGroundY = new Float32Array(cap);
        this._bufOriginX = new Float32Array(cap);
        this._bufOriginY = new Float32Array(cap);
        this._bufSquash = new Float32Array(cap);
        this._bufSquashNx = new Float32Array(cap);
        this._bufSquashNy = new Float32Array(cap);
        this._bufFlags = new Uint8Array(cap); // bit 0: isStatic, bit 1: isGrounded
      }

      if (this._dirty) {
        for (let i = 0; i < n; i++) {
          const b = this.bodies[i];
          this._bufX[i] = b.x;
          this._bufY[i] = b.y;
          this._bufVx[i] = b.vx;
          this._bufVy[i] = b.vy;
          this._bufRadius[i] = b.radius;
          this._bufMass[i] = b.mass;
          this._bufInvMass[i] = b.isStatic ? 0 : (1 / b.mass);
          this._bufBounce[i] = b.bounce;
          this._bufFriction[i] = b.friction;
          this._bufGroundY[i] = b.groundY !== undefined ? b.groundY : this.groundY;
          this._bufOriginX[i] = b.originX || 0;
          this._bufOriginY[i] = b.originY || 0;
          this._bufSquash[i] = b.squash || 0;
          this._bufSquashNx[i] = 0;
          this._bufSquashNy[i] = 1;
          this._bufFlags[i] = (b.isStatic ? 1 : 0) | (b.isGrounded ? 2 : 0);
        }
        this._dirty = false;
      }

      const sc = this.springs.length;
      if (sc > 0 && (!this._spCapacity || this._spCapacity < sc)) {
        this._spCapacity = Math.max(16, Math.pow(2, Math.ceil(Math.log2(sc))));
        const scap = this._spCapacity;
        this._spIdxA = new Int32Array(scap);
        this._spIdxB = new Int32Array(scap);
        this._spAnchorX = new Float32Array(scap);
        this._spAnchorY = new Float32Array(scap);
        this._spRestLen = new Float32Array(scap);
        this._spStiffness = new Float32Array(scap);
        this._spDamping = new Float32Array(scap);
      }

      if (sc > 0 && this._spDirty) {
        for (let s = 0; s < sc; s++) {
          const sp = this.springs[s];
          let idxA = -1;
          let idxB = -1;
          for (let i = 0; i < n; i++) {
            const b = this.bodies[i];
            if (sp.a !== null && (b.id === sp.a || b.target === sp.a)) idxA = i;
            if (sp.b !== null && (b.id === sp.b || b.target === sp.b)) idxB = i;
          }
          this._spIdxA[s] = idxA;
          this._spIdxB[s] = idxB;
          this._spAnchorX[s] = sp.anchorX;
          this._spAnchorY[s] = sp.anchorY;
          if (sp.length !== null) {
            this._spRestLen[s] = sp.length;
          } else if (idxB >= 0) {
            const ax = idxA >= 0 ? this._bufX[idxA] : sp.anchorX;
            const ay = idxA >= 0 ? this._bufY[idxA] : sp.anchorY;
            this._spRestLen[s] = Math.hypot(this._bufX[idxB] - ax, this._bufY[idxB] - ay);
          } else {
            this._spRestLen[s] = 0;
          }
          this._spStiffness[s] = sp.stiffness;
          this._spDamping[s] = sp.damping;
        }
        this._spDirty = false;
      }
    }

    compileSquashMatrix6(vx, vy, squash, tx, ty, outMatrix, originX = 0, originY = 0) {
      const sq = squash > 0.45 ? 0.45 : (squash < -0.45 ? -0.45 : squash);
      let a = 1;
      let b = 0;
      let c = 0;
      let d = 1;
      if (sq > 0.0001 || sq < -0.0001) {
        const spSq = vx * vx + vy * vy;
        let ux = 0;
        let uy = 1;
        if (spSq > 1e-8) {
          const inv = 1 / Math.sqrt(spSq);
          ux = vx * inv;
          uy = vy * inv;
        }
        const sPar = 1 - sq;
        const sPerp = 1 / sPar;
        const diff = sPar - sPerp;
        a = sPar * ux * ux + sPerp * uy * uy;
        b = diff * ux * uy;
        c = b;
        d = sPar * uy * uy + sPerp * ux * ux;
      }
      outMatrix[0] = a;
      outMatrix[1] = b;
      outMatrix[2] = c;
      outMatrix[3] = d;
      outMatrix[4] = tx - (a * originX + c * originY);
      outMatrix[5] = ty - (b * originX + d * originY);
      return outMatrix;
    }

    _stepSubstep(dt) {
      const n = this.bodies.length;
      const bufX = this._bufX;
      const bufY = this._bufY;
      const bufVx = this._bufVx;
      const bufVy = this._bufVy;
      const bufFx = this._bufFx;
      const bufFy = this._bufFy;
      const bufRadius = this._bufRadius;
      const bufMass = this._bufMass;
      const bufInvMass = this._bufInvMass;
      const bufBounce = this._bufBounce;
      const bufFriction = this._bufFriction;
      const bufGroundY = this._bufGroundY;
      const bufSquash = this._bufSquash;
      const bufSquashNx = this._bufSquashNx;
      const bufSquashNy = this._bufSquashNy;
      const bufFlags = this._bufFlags;

      const g = this.gravity;
      const minXBound = this.bounds.minX;
      const maxXBound = this.bounds.maxX;
      const minYBound = this.bounds.minY;
      const slop = this.slop;
      const pct = this.correctionPercent;
      const dragRate = this.drag;
      const sqDecay = Math.exp(-this.squashDecayRate * dt);

      // --- PASS 1A: Force Accumulation (Gravity + Damped Hookean Springs F = -kx - cv) ---
      for (let i = 0; i < n; i++) {
        bufFx[i] = 0;
        bufFy[i] = (bufFlags[i] & 1) !== 0 ? 0 : bufMass[i] * g;
      }

      const sc = this.springs.length;
      if (sc > 0) {
        const spA = this._spIdxA;
        const spB = this._spIdxB;
        const spAx = this._spAnchorX;
        const spAy = this._spAnchorY;
        const spLen = this._spRestLen;
        const spK = this._spStiffness;
        const spC = this._spDamping;
        for (let s = 0; s < sc; s++) {
          const iB = spB[s];
          if (iB < 0) continue;
          const iA = spA[s];
          const ax = iA >= 0 ? bufX[iA] : spAx[s];
          const ay = iA >= 0 ? bufY[iA] : spAy[s];
          const avx = iA >= 0 ? bufVx[iA] : 0;
          const avy = iA >= 0 ? bufVy[iA] : 0;
          const dx = bufX[iB] - ax;
          const dy = bufY[iB] - ay;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const k = spK[s];
          const c = spC[s];
          let fx = 0;
          let fy = 0;
          if (dist > 1e-6) {
            const invD = 1 / dist;
            const ux = dx * invD;
            const uy = dy * invD;
            const ext = dist - spLen[s];
            const vRel = (bufVx[iB] - avx) * ux + (bufVy[iB] - avy) * uy;
            const fMag = -k * ext - c * vRel;
            fx = fMag * ux;
            fy = fMag * uy;
          } else {
            fx = -k * dx - c * (bufVx[iB] - avx);
            fy = -k * dy - c * (bufVy[iB] - avy);
          }
          if ((bufFlags[iB] & 1) === 0) {
            bufFx[iB] += fx;
            bufFy[iB] += fy;
          }
          if (iA >= 0 && (bufFlags[iA] & 1) === 0) {
            bufFx[iA] -= fx;
            bufFy[iA] -= fy;
          }
        }
      }

      // --- PASS 1B: Semi-Implicit Euler Integration & Boundary Impulse Resolution ---
      const restThresh = Math.abs(g) * dt * 2.5;
      for (let i = 0; i < n; i++) {
        if ((bufFlags[i] & 1) !== 0) continue;

        const invM = bufInvMass[i];
        let vx = bufVx[i] + bufFx[i] * invM * dt;
        let vy = bufVy[i] + bufFy[i] * invM * dt;
        if (dragRate > 0) {
          const dMul = Math.max(0, 1 - dragRate * dt);
          vx *= dMul;
          vy *= dMul;
        }
        bufVx[i] = vx;
        bufVy[i] = vy;

        bufX[i] += vx * dt;
        bufY[i] += vy * dt;

        if (bufSquash[i] > 0) {
          const sqNext = bufSquash[i] * sqDecay;
          bufSquash[i] = sqNext < 0.001 ? 0 : sqNext;
        }
        bufFlags[i] &= ~2;

        const r = bufRadius[i];
        const e = bufBounce[i];
        const mu = bufFriction[i];
        const groundCenterY = bufGroundY[i] - r;

        // Ground contact
        if (bufY[i] >= groundCenterY) {
          const pen = bufY[i] - groundCenterY;
          if (pen > slop) {
            bufY[i] -= (pen - slop) * pct;
          }
          const vn = bufVy[i];
          if (vn > 0) {
            const eEff = (g > 0 && vn < restThresh) ? 0 : e;
            const dvN = (1 + eEff) * vn;
            if (eEff === 0 && g > 0) {
              bufVy[i] = 0;
              bufFlags[i] |= 2;
            } else {
              bufVy[i] = -vn * eEff;
            }
            if (vn > 25 && this.squashGain > 0) {
              const impSq = Math.min(0.42, (vn / 600) * this.squashGain);
              if (impSq > bufSquash[i]) {
                bufSquash[i] = impSq;
                const sp = Math.sqrt(vx * vx + vn * vn);
                bufSquashNx[i] = sp > 1e-4 ? (vx / sp) : 0;
                bufSquashNy[i] = sp > 1e-4 ? (vn / sp) : 1;
              }
            }
            const normalDv = Math.max(dvN, Math.abs(g) * dt);
            const maxFricDv = mu * normalDv;
            const curVx = bufVx[i];
            if (Math.abs(curVx) <= maxFricDv) {
              bufVx[i] = 0;
            } else {
              bufVx[i] = curVx - (curVx > 0 ? maxFricDv : -maxFricDv);
            }
          } else if (g > 0 && Math.abs(vn) <= restThresh) {
            bufVy[i] = 0;
            bufFlags[i] |= 2;
            const maxFricDv = mu * Math.abs(g) * dt;
            const curVx = bufVx[i];
            if (Math.abs(curVx) <= maxFricDv) {
              bufVx[i] = 0;
            } else {
              bufVx[i] = curVx - (curVx > 0 ? maxFricDv : -maxFricDv);
            }
          }
        } else if (bufY[i] <= minYBound + r) {
          const pen = (minYBound + r) - bufY[i];
          if (pen > slop) {
            bufY[i] += (pen - slop) * pct;
          }
          const vn = -bufVy[i];
          if (vn > 0) {
            const dvN = (1 + e) * vn;
            bufVy[i] = vn * e;
            if (vn > 25 && this.squashGain > 0) {
              const impSq = Math.min(0.42, (vn / 600) * this.squashGain);
              if (impSq > bufSquash[i]) {
                bufSquash[i] = impSq;
                const sp = Math.sqrt(vx * vx + vn * vn);
                bufSquashNx[i] = sp > 1e-4 ? (vx / sp) : 0;
                bufSquashNy[i] = sp > 1e-4 ? (-vn / sp) : -1;
              }
            }
            const maxFricDv = mu * dvN;
            const curVx = bufVx[i];
            if (Math.abs(curVx) <= maxFricDv) bufVx[i] = 0;
            else bufVx[i] = curVx - (curVx > 0 ? maxFricDv : -maxFricDv);
          }
        }

        // Left / right wall contacts
        if (bufX[i] <= minXBound + r) {
          const pen = (minXBound + r) - bufX[i];
          if (pen > slop) {
            bufX[i] += (pen - slop) * pct;
          }
          const vn = -bufVx[i];
          if (vn > 0) {
            const dvN = (1 + e) * vn;
            bufVx[i] = vn * e;
            if (vn > 25 && this.squashGain > 0) {
              const impSq = Math.min(0.42, (vn / 600) * this.squashGain);
              if (impSq > bufSquash[i]) {
                bufSquash[i] = impSq;
                const sp = Math.sqrt(vn * vn + vy * vy);
                bufSquashNx[i] = sp > 1e-4 ? (-vn / sp) : -1;
                bufSquashNy[i] = sp > 1e-4 ? (vy / sp) : 0;
              }
            }
            const maxFricDv = mu * dvN;
            const curVy = bufVy[i];
            if (Math.abs(curVy) <= maxFricDv) bufVy[i] = 0;
            else bufVy[i] = curVy - (curVy > 0 ? maxFricDv : -maxFricDv);
          }
        } else if (bufX[i] >= maxXBound - r) {
          const pen = bufX[i] - (maxXBound - r);
          if (pen > slop) {
            bufX[i] -= (pen - slop) * pct;
          }
          const vn = bufVx[i];
          if (vn > 0) {
            const dvN = (1 + e) * vn;
            bufVx[i] = -vn * e;
            if (vn > 25 && this.squashGain > 0) {
              const impSq = Math.min(0.42, (vn / 600) * this.squashGain);
              if (impSq > bufSquash[i]) {
                bufSquash[i] = impSq;
                const sp = Math.sqrt(vn * vn + vy * vy);
                bufSquashNx[i] = sp > 1e-4 ? (vn / sp) : 1;
                bufSquashNy[i] = sp > 1e-4 ? (vy / sp) : 0;
              }
            }
            const maxFricDv = mu * dvN;
            const curVy = bufVy[i];
            if (Math.abs(curVy) <= maxFricDv) bufVy[i] = 0;
            else bufVy[i] = curVy - (curVy > 0 ? maxFricDv : -maxFricDv);
          }
        }
      }

      // --- PASS 2: Contiguous Circle-Circle Impulse Restitution & Coulomb Friction ---
      for (let i = 0; i < n; i++) {
        const isStatic1 = (bufFlags[i] & 1) !== 0;
        const r1 = bufRadius[i];
        const invM1 = bufInvMass[i];
        const bnc1 = bufBounce[i];
        const mu1 = bufFriction[i];

        for (let j = i + 1; j < n; j++) {
          const isStatic2 = (bufFlags[j] & 1) !== 0;
          if (isStatic1 && isStatic2) continue;

          const invM2 = bufInvMass[j];
          const invMassSum = invM1 + invM2;
          if (invMassSum <= 0) continue;

          const dx = bufX[j] - bufX[i];
          const dy = bufY[j] - bufY[i];
          const distSq = dx * dx + dy * dy;
          const minDist = r1 + bufRadius[j];

          if (distSq < minDist * minDist) {
            let nx = 0;
            let ny = -1;
            let dist = 0;
            if (distSq > 1e-8) {
              dist = Math.sqrt(distSq);
              const invD = 1 / dist;
              nx = dx * invD;
              ny = dy * invD;
            }
            const pen = minDist - dist;
            if (pen > slop) {
              const corrMag = ((pen - slop) / invMassSum) * pct;
              if (!isStatic1) {
                bufX[i] -= corrMag * invM1 * nx;
                bufY[i] -= corrMag * invM1 * ny;
              }
              if (!isStatic2) {
                bufX[j] += corrMag * invM2 * nx;
                bufY[j] += corrMag * invM2 * ny;
              }
            }

            const rvx = bufVx[j] - bufVx[i];
            const rvy = bufVy[j] - bufVy[i];
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
              const e = Math.min(bnc1, bufBounce[j]);
              const eEff = (g !== 0 && Math.abs(velAlongNormal) < restThresh) ? 0 : e;
              const jn = -(1 + eEff) * velAlongNormal / invMassSum;
              const jx = jn * nx;
              const jy = jn * ny;

              if (!isStatic1) {
                bufVx[i] -= jx * invM1;
                bufVy[i] -= jy * invM1;
              }
              if (!isStatic2) {
                bufVx[j] += jx * invM2;
                bufVy[j] += jy * invM2;
              }

              const impactSpd = -velAlongNormal;
              if (impactSpd > 25 && this.squashGain > 0) {
                const impSq = Math.min(0.42, (impactSpd / 600) * this.squashGain);
                if (!isStatic1 && impSq > bufSquash[i]) {
                  bufSquash[i] = impSq;
                  bufSquashNx[i] = nx;
                  bufSquashNy[i] = ny;
                }
                if (!isStatic2 && impSq > bufSquash[j]) {
                  bufSquash[j] = impSq;
                  bufSquashNx[j] = -nx;
                  bufSquashNy[j] = -ny;
                }
              }

              // Coulomb tangential friction impulse
              const tx = -ny;
              const ty = nx;
              const rvx2 = bufVx[j] - bufVx[i];
              const rvy2 = bufVy[j] - bufVy[i];
              const vt = rvx2 * tx + rvy2 * ty;
              const jt = -vt / invMassSum;
              const mu = Math.sqrt(Math.max(0, mu1) * Math.max(0, bufFriction[j]));
              const maxJt = mu * Math.abs(jn);
              const jtClamped = Math.abs(jt) <= maxJt ? jt : (jt > 0 ? maxJt : -maxJt);

              if (!isStatic1) {
                bufVx[i] -= jtClamped * invM1 * tx;
                bufVy[i] -= jtClamped * invM1 * ty;
              }
              if (!isStatic2) {
                bufVx[j] += jtClamped * invM2 * tx;
                bufVy[j] += jtClamped * invM2 * ty;
              }
            }
          }
        }
      }
    }

    update(rawDt) {
      if (!this.enabled || rawDt <= 0 || this.bodies.length === 0) return;
      const clampedDt = rawDt > this.maxFrameDt ? this.maxFrameDt : rawDt;
      const root = (this.engine && this.engine.container) || (typeof document !== 'undefined' ? document : null);
      const n = this.bodies.length;

      // ⚡ High-Performance WebAssembly MicroPhysics Acceleration (docs/WASM_ARCHITECTURE_CONTRACT.md Page 3)
      if (typeof window !== 'undefined' && window.ASTWasmBridge && window.ASTWasmBridge.isReady) {
        if (window.ASTWasmBridge.microPhysicsStep(this.bodies, clampedDt, this.gravity, this.bounds)) {
          if (root) {
            for (let i = 0; i < n; i++) {
              const b = this.bodies[i];
              let el = b.element;
              if (!el && b.target) {
                el = typeof b.target === 'string' ? root.querySelector(b.target) : b.target;
                b.element = el;
              }
              if (el) {
                const mb = this.compileSquashMatrix6(b.vx, b.vy, b.squash || 0, b.x, b.y, b._matrixBuf, b.originX || 0, b.originY || 0);
                const xformStr = `matrix(${mb[0].toFixed(4)},${mb[1].toFixed(4)},${mb[2].toFixed(4)},${mb[3].toFixed(4)},${mb[4].toFixed(2)},${mb[5].toFixed(2)})`;
                if (b._lastTransform !== xformStr) {
                  b._lastTransform = xformStr;
                  el.setAttribute('transform', xformStr);
                }
              }
            }
          }
          return;
        }
      }

      this._ensureBuffers();

      const subDt = this.fixedDt;
      const maxSteps = this.substeps * 4;
      let steps = 0;
      this.accumulator += clampedDt;
      while (this.accumulator + 1e-9 >= subDt && steps < maxSteps) {
        this._stepSubstep(subDt);
        this.accumulator -= subDt;
        steps++;
      }
      if (this.accumulator < 0) this.accumulator = 0;
      this.lastSubstepsExecuted = steps;

      const bufX = this._bufX;
      const bufY = this._bufY;
      const bufVx = this._bufVx;
      const bufVy = this._bufVy;
      const bufSquash = this._bufSquash;
      const bufSquashNx = this._bufSquashNx;
      const bufSquashNy = this._bufSquashNy;
      const bufOriginX = this._bufOriginX;
      const bufOriginY = this._bufOriginY;
      const bufFlags = this._bufFlags;

      // --- PASS 3: SoA Writeback, 6-Float Affine Matrix Compilation & DOM Blit ---
      for (let i = 0; i < n; i++) {
        const b = this.bodies[i];
        b.x = bufX[i];
        b.y = bufY[i];
        b.vx = bufVx[i];
        b.vy = bufVy[i];
        b.squash = bufSquash[i];
        b.isGrounded = (bufFlags[i] & 2) !== 0;

        const mb = this.compileSquashMatrix6(
          bufSquashNx[i], bufSquashNy[i], bufSquash[i],
          b.x, b.y, b._matrixBuf, bufOriginX[i], bufOriginY[i]
        );

        if (root) {
          if (!b.element) {
            b.element = root.querySelector ? root.querySelector(b.target) : null;
          }
          if (b.element) {
            const xformStr = `matrix(${mb[0].toFixed(4)},${mb[1].toFixed(4)},${mb[2].toFixed(4)},${mb[3].toFixed(4)},${mb[4].toFixed(2)},${mb[5].toFixed(2)})`;
            if (b._lastTransform !== xformStr) {
              b._lastTransform = xformStr;
              b.element.setAttribute('transform', xformStr);
            }
          }
        }
      }

      if (root && this.springs.length > 0) {
        for (let s = 0; s < this.springs.length; s++) {
          const sp = this.springs[s];
          if (!sp.lineTarget) continue;
          if (!sp.lineElement && root.querySelector) {
            sp.lineElement = root.querySelector(sp.lineTarget);
          }
          if (sp.lineElement) {
            const iA = this._spIdxA[s];
            const iB = this._spIdxB[s];
            if (iB >= 0) {
              const ax = iA >= 0 ? bufX[iA] : this._spAnchorX[s];
              const ay = iA >= 0 ? bufY[iA] : this._spAnchorY[s];
              const x1s = ax.toFixed(1);
              const y1s = ay.toFixed(1);
              const x2s = bufX[iB].toFixed(1);
              const y2s = bufY[iB].toFixed(1);
              if (sp._lx1 !== x1s) { sp._lx1 = x1s; sp.lineElement.setAttribute('x1', x1s); }
              if (sp._ly1 !== y1s) { sp._ly1 = y1s; sp.lineElement.setAttribute('y1', y1s); }
              if (sp._lx2 !== x2s) { sp._lx2 = x2s; sp.lineElement.setAttribute('x2', x2s); }
              if (sp._ly2 !== y2s) { sp._ly2 = y2s; sp.lineElement.setAttribute('y2', y2s); }
            }
          }
        }
      }
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
      this.gravity = options.gravity !== undefined ? Number(options.gravity) : 980;
      this.drag = options.drag !== undefined ? Number(options.drag) : 0.992;
      this.iterations = options.iterations || 4;
      this.substeps = options.substeps !== undefined ? Math.max(1, Math.min(32, Math.round(Number(options.substeps) || 4))) : 4;
      this.fixedDt = 1 / (60 * this.substeps); // 1/240s at default 4 substeps
      this.maxFrameDt = 0.05;
      this.accumulator = 0;
      this.points = [];
      this.constraints = [];
      this.enabled = true;
      this._dirty = true;
    }

    addPoint(x, y, pinned = false, mass = 1.0, radius = 6, vx = 0, vy = 0) {
      const numX = Number(x) || 0;
      const numY = Number(y) || 0;
      const numVx = Number(vx) || 0;
      const numVy = Number(vy) || 0;
      const p = {
        x: numX,
        y: numY,
        px: numX - numVx * this.fixedDt,
        py: numY - numVy * this.fixedDt,
        vx: numVx,
        vy: numVy,
        pinned: Boolean(pinned),
        mass: Math.max(0.05, Number(mass) || 1.0),
        radius: Number(radius) || 6
      };
      this.points.push(p);
      this._dirty = true;
      return p;
    }

    addConstraint(p1, p2, length = null, stiffness = 1.0, damping = 0.0, hookean = false) {
      const dist = length !== null ? Number(length) : Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const isHookean = Boolean(hookean || damping > 0 || stiffness > 1.0);
      const c = {
        p1,
        p2,
        length: dist,
        stiffness: isHookean ? Math.max(0, Number(stiffness)) : Math.min(1.0, Math.max(0.01, Number(stiffness))),
        damping: Math.max(0, Number(damping) || 0),
        hookean: isHookean
      };
      this.constraints.push(c);
      this._dirty = true;
      return c;
    }

    createPendulum(pivotX, pivotY, length = 160, bobRadius = 14, initialAngle = 0.5) {
      this.points = [];
      this.constraints = [];
      this.accumulator = 0;
      const p0 = this.addPoint(pivotX, pivotY, true, 0, 4);
      const bobX = pivotX + Math.sin(initialAngle) * length;
      const bobY = pivotY + Math.cos(initialAngle) * length;
      const p1 = this.addPoint(bobX, bobY, false, 2.0, bobRadius);
      this.addConstraint(p0, p1, length, 1.0, 0, false);
      return { pivot: p0, bob: p1 };
    }

    createSpring(startX, startY, endX, endY, stiffness = 80, damping = 2.0) {
      const p0 = this.addPoint(startX, startY, true, 0, 4);
      const p1 = this.addPoint(endX, endY, false, 1.5, 10);
      const useHookean = stiffness > 1.0 || damping > 0;
      this.addConstraint(p0, p1, Math.hypot(endX - startX, endY - startY), stiffness, damping, useHookean);
      return { anchor: p0, weight: p1 };
    }

    _ensureBuffers() {
      const pn = this.points.length;
      if (!this._pCap || this._pCap < pn) {
        this._pCap = Math.max(32, Math.pow(2, Math.ceil(Math.log2(Math.max(1, pn)))));
        const cap = this._pCap;
        this._vpX = new Float32Array(cap);
        this._vpY = new Float32Array(cap);
        this._vpPx = new Float32Array(cap);
        this._vpPy = new Float32Array(cap);
        this._vpVx = new Float32Array(cap);
        this._vpVy = new Float32Array(cap);
        this._vpFx = new Float32Array(cap);
        this._vpFy = new Float32Array(cap);
        this._vpMass = new Float32Array(cap);
        this._vpInvMass = new Float32Array(cap);
        this._vpPinned = new Uint8Array(cap);
        this._dirty = true;
      }

      const cn = this.constraints.length;
      if (!this._cCap || this._cCap < cn) {
        this._cCap = Math.max(32, Math.pow(2, Math.ceil(Math.log2(Math.max(1, cn)))));
        const ccap = this._cCap;
        this._vcP1 = new Int32Array(ccap);
        this._vcP2 = new Int32Array(ccap);
        this._vcLen = new Float32Array(ccap);
        this._vcStiff = new Float32Array(ccap);
        this._vcDamp = new Float32Array(ccap);
        this._vcMode = new Uint8Array(ccap); // 0 = PBD constraint, 1 = damped Hookean spring
        this._dirty = true;
      }

      if (this._dirty) {
        for (let i = 0; i < pn; i++) {
          const p = this.points[i];
          this._vpX[i] = p.x;
          this._vpY[i] = p.y;
          this._vpPx[i] = p.px;
          this._vpPy[i] = p.py;
          this._vpVx[i] = p.vx || 0;
          this._vpVy[i] = p.vy || 0;
          this._vpMass[i] = p.mass;
          this._vpInvMass[i] = p.pinned ? 0 : (1 / p.mass);
          this._vpPinned[i] = p.pinned ? 1 : 0;
        }
        for (let i = 0; i < cn; i++) {
          const c = this.constraints[i];
          this._vcP1[i] = this.points.indexOf(c.p1);
          this._vcP2[i] = this.points.indexOf(c.p2);
          this._vcLen[i] = c.length;
          this._vcStiff[i] = c.stiffness;
          this._vcDamp[i] = c.damping || 0;
          this._vcMode[i] = c.hookean ? 1 : 0;
        }
        this._dirty = false;
      }
    }

    _stepSubstep(subDt) {
      const pn = this.points.length;
      const cn = this.constraints.length;
      const vpX = this._vpX;
      const vpY = this._vpY;
      const vpPx = this._vpPx;
      const vpPy = this._vpPy;
      const vpVx = this._vpVx;
      const vpVy = this._vpVy;
      const vpFx = this._vpFx;
      const vpFy = this._vpFy;
      const vpMass = this._vpMass;
      const vpInvMass = this._vpInvMass;
      const vpPinned = this._vpPinned;

      const vcP1 = this._vcP1;
      const vcP2 = this._vcP2;
      const vcLen = this._vcLen;
      const vcStiff = this._vcStiff;
      const vcDamp = this._vcDamp;
      const vcMode = this._vcMode;

      let hasHookean = false;
      for (let i = 0; i < pn; i++) {
        vpFx[i] = 0;
        vpFy[i] = vpPinned[i] ? 0 : vpMass[i] * this.gravity;
      }

      // Accumulate damped Hookean spring-damper forces: F = -k * x - c * v
      for (let i = 0; i < cn; i++) {
        if (vcMode[i] !== 1) continue;
        hasHookean = true;
        const i1 = vcP1[i];
        const i2 = vcP2[i];
        if (i1 < 0 || i2 < 0) continue;
        const dx = vpX[i2] - vpX[i1];
        const dy = vpY[i2] - vpY[i1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        const k = vcStiff[i];
        const c = vcDamp[i];
        let fx = 0;
        let fy = 0;
        if (dist > 1e-6) {
          const invD = 1 / dist;
          const ux = dx * invD;
          const uy = dy * invD;
          const ext = dist - vcLen[i];
          const vRel = (vpVx[i2] - vpVx[i1]) * ux + (vpVy[i2] - vpVy[i1]) * uy;
          const fMag = -k * ext - c * vRel;
          fx = fMag * ux;
          fy = fMag * uy;
        } else {
          fx = -k * dx - c * (vpVx[i2] - vpVx[i1]);
          fy = -k * dy - c * (vpVy[i2] - vpVy[i1]);
        }
        if (!vpPinned[i1]) { vpFx[i1] -= fx; vpFy[i1] -= fy; }
        if (!vpPinned[i2]) { vpFx[i2] += fx; vpFy[i2] += fy; }
      }

      if (hasHookean) {
        // Semi-implicit Euler integration for exact spring-damper F = -kx - cv
        for (let i = 0; i < pn; i++) {
          if (vpPinned[i]) continue;
          const invM = vpInvMass[i];
          const vx = vpVx[i] + vpFx[i] * invM * subDt;
          const vy = vpVy[i] + vpFy[i] * invM * subDt;
          vpVx[i] = vx;
          vpVy[i] = vy;
          vpPx[i] = vpX[i];
          vpPy[i] = vpY[i];
          vpX[i] += vx * subDt;
          vpY[i] += vy * subDt;
        }
      } else {
        // Pure Position Verlet integration scaled to substep
        const dragStep = Math.pow(this.drag, subDt * 60);
        const gDtSq = this.gravity * subDt * subDt;
        for (let i = 0; i < pn; i++) {
          if (vpPinned[i]) continue;
          const x = vpX[i];
          const y = vpY[i];
          const vxStep = (x - vpPx[i]) * dragStep;
          const vyStep = (y - vpPy[i]) * dragStep;
          vpPx[i] = x;
          vpPy[i] = y;
          vpX[i] = x + vxStep;
          vpY[i] = y + vyStep + gDtSq;
          vpVx[i] = vxStep / subDt;
          vpVy[i] = (vyStep + gDtSq) / subDt;
        }
      }

      // Distance constraint relaxation for rigid PBD constraints (vcMode === 0)
      for (let iter = 0; iter < this.iterations; iter++) {
        for (let i = 0; i < cn; i++) {
          if (vcMode[i] !== 0) continue;
          const i1 = vcP1[i];
          const i2 = vcP2[i];
          if (i1 < 0 || i2 < 0) continue;
          const dx = vpX[i2] - vpX[i1];
          const dy = vpY[i2] - vpY[i1];
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const diff = (vcLen[i] - dist) / dist;
          const offset = diff * 0.5 * vcStiff[i];
          if (!vpPinned[i1]) {
            vpX[i1] -= dx * offset;
            vpY[i1] -= dy * offset;
          }
          if (!vpPinned[i2]) {
            vpX[i2] += dx * offset;
            vpY[i2] += dy * offset;
          }
        }
      }
    }

    step(dt) {
      if (!this.enabled || dt <= 0 || this.points.length === 0) return;
      const clampedDt = dt > this.maxFrameDt ? this.maxFrameDt : dt;

      // ⚡ High-Performance WebAssembly Verlet Acceleration (docs/WASM_ARCHITECTURE_CONTRACT.md Page 3)
      if (typeof window !== 'undefined' && window.ASTWasmBridge && window.ASTWasmBridge.isReady) {
        if (window.ASTWasmBridge.verletStep(this.points, this.constraints, this.iterations, clampedDt, this.gravity, this.drag)) {
          return;
        }
      }

      this._ensureBuffers();

      const subDt = this.fixedDt;
      const maxSteps = this.substeps * 4;
      let steps = 0;
      this.accumulator += clampedDt;
      while (this.accumulator + 1e-9 >= subDt && steps < maxSteps) {
        this._stepSubstep(subDt);
        this.accumulator -= subDt;
        steps++;
      }
      if (this.accumulator < 0) this.accumulator = 0;

      for (let i = 0; i < this.points.length; i++) {
        const p = this.points[i];
        p.x = this._vpX[i];
        p.y = this._vpY[i];
        p.px = this._vpPx[i];
        p.py = this._vpPy[i];
        p.vx = this._vpVx[i];
        p.vy = this._vpVy[i];
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
      this.defaultBounds = Object.assign({}, this.bounds);
      this.boundsElement = config.boundsElement || null;
      this.gravity = Number(config.gravity) || 0;
      this.speed = Number(config.speed) || 120;
      this.defaultSpeed = this.speed;
      this.shape = config.shape || 'circle';
      this.radius = Number(config.radius) || 4;
      this.defaultRadius = this.radius;
      this.fill = config.fill || '#38bdf8';
      this.defaultFill = this.fill;
      this.liquidMinY = config.liquidMinY !== undefined && config.liquidMinY !== null
        ? Number(config.liquidMinY)
        : Math.round(this.defaultBounds.minY + (this.defaultBounds.maxY - this.defaultBounds.minY) * 0.465);
      this.placeholderSelector = config.placeholderSelector || null;
      this.wrapMode = config.wrapMode || 'bounce';
      this.restitution = config.restitution !== undefined ? Math.max(0, Math.min(1, Number(config.restitution))) : (config.bounce !== undefined ? Math.max(0, Math.min(1, Number(config.bounce))) : 1.0);
      this.friction = config.friction !== undefined ? Math.max(0, Number(config.friction)) : 0.0;
      this.substeps = config.substeps !== undefined ? Math.max(1, Math.min(16, Math.round(Number(config.substeps) || 4))) : 4;
      this.phaseState = config.phaseState || 'gas';
      this.phaseSync = Boolean(config.phaseSync);
      this.phaseExpr = config.phaseExpr || null;
      this.clampXExpr = config.clampXExpr || null;
      this.speedExpr = config.speedExpr || null;
      this.countExpr = config.countExpr || null;
      this._phaseEval = null;
      this._clampXEval = null;
      this._speedEval = null;
      this._countEval = null;
      this._lastPhaseEval = '';
      this._lastCountEval = -1;
      this._lastSpeedEval = -1;
      this.obstacles = [];
      this.cachedSegments = [];
      this._boundsEl = null;
      this._boundsElSelector = null;
      this._effectiveBoundsOut = { minX: this.bounds.minX, maxX: this.bounds.maxX, minY: this.bounds.minY, maxY: this.bounds.maxY };
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
      if (this.placeholderSelector && typeof container.querySelectorAll === 'function') {
        const staticPlaceholders = container.querySelectorAll(this.placeholderSelector);
        staticPlaceholders.forEach(c => c.remove());
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
      if (Math.abs(ratio - 1) < 1e-4) return;
      this.speed = s;
      const pool = this.pool;
      for (let i = 0; i < pool.length; i++) {
        pool[i].vx *= ratio;
        pool[i].vy *= ratio;
      }
    }

    /**
     * Clamps all chamber particles to stay within the compressed volume of a moving piston face
     */
    clampToPistonX(pistonFaceX) {
      if (typeof pistonFaceX !== 'number' || isNaN(pistonFaceX)) return;
      const maxBound = (this.defaultBounds && Number.isFinite(this.defaultBounds.maxX)) ? this.defaultBounds.maxX : 760;
      const limit = Math.min(maxBound, pistonFaceX - this.radius);
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
      this._lastSpeedEval = -1;

      const defMinX = (this.defaultBounds && Number.isFinite(this.defaultBounds.minX)) ? this.defaultBounds.minX : 40;
      const defMinY = (this.defaultBounds && Number.isFinite(this.defaultBounds.minY)) ? this.defaultBounds.minY : 40;
      const defMaxY = (this.defaultBounds && Number.isFinite(this.defaultBounds.maxY)) ? this.defaultBounds.maxY : 440;
      const defR = String(this.defaultRadius || 4);

      if (s === 'solid') {
        this.fill = '#a7f3d0';
        this.speed = 18;
        this.gravity = 0;
        this.wrapMode = 'bounce';
        // Compute lattice anchor coordinates in a stable crystal grid
        const cols = Math.min(15, Math.ceil(Math.sqrt(this.pool.length * 1.8)));
        const rows = Math.ceil(this.pool.length / cols);
        const startX = defMinX + 34;
        const startY = defMinY + 74;
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
        this.bounds.minY = this.liquidMinY;
        this.bounds.maxY = defMaxY;
        const spanY = Math.max(20, (defMaxY - this.liquidMinY) * 0.5);
        for (let i = 0; i < this.pool.length; i++) {
          const p = this.pool[i];
          p.latticeX = null;
          p.latticeY = null;
          if (p.y < this.liquidMinY) p.y = this.liquidMinY + Math.random() * spanY;
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle) * 65;
          p.vy = Math.sin(angle) * 65;
          if (p.node) {
            p.node.setAttribute('fill', '#06b6d4');
            p.node.setAttribute('r', defR);
          }
        }
      } else {
        // Gas state: elastic chaos filling the entire volume
        this.fill = this.defaultFill || '#38bdf8';
        this.speed = this.defaultSpeed || 160;
        this.gravity = 0;
        this.wrapMode = 'bounce';
        this.bounds.minY = defMinY;
        this.bounds.maxY = defMaxY;
        for (let i = 0; i < this.pool.length; i++) {
          const p = this.pool[i];
          p.latticeX = null;
          p.latticeY = null;
          const angle = Math.random() * Math.PI * 2;
          p.vx = Math.cos(angle) * this.speed;
          p.vy = Math.sin(angle) * this.speed;
          if (p.node) {
            p.node.setAttribute('fill', this.fill);
            p.node.setAttribute('r', defR);
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
      const out = this._effectiveBoundsOut || (this._effectiveBoundsOut = { minX: 40, maxX: 760, minY: 40, maxY: 440 });
      // A. Dynamic tracking of an explicit SVG bounding element (e.g. moving piston or chamber)
      if (this.boundsElement && typeof document !== 'undefined') {
        let el = null;
        if (typeof this.boundsElement === 'string') {
          if (this._boundsEl && this._boundsElSelector === this.boundsElement && this._boundsEl.isConnected) {
            el = this._boundsEl;
          } else {
            el = (this.engine && this.engine.container && this.engine.container.querySelector(this.boundsElement))
              || document.querySelector(this.boundsElement);
            this._boundsEl = el || null;
            this._boundsElSelector = this.boundsElement;
          }
        } else {
          el = this.boundsElement;
        }

        // Fast zero-reflow path for axis-aligned untransformed <rect> bounds sharing the same SVG coordinate space
        if (el && el.tagName && el.tagName.toLowerCase() === 'rect' && !el.getAttribute('transform') && (!this.group || !this.group.getAttribute('transform'))) {
          const rx = parseFloat(el.getAttribute('x'));
          const ry = parseFloat(el.getAttribute('y'));
          const rw = parseFloat(el.getAttribute('width'));
          const rh = parseFloat(el.getAttribute('height'));
          if (Number.isFinite(rx) && Number.isFinite(ry) && Number.isFinite(rw) && Number.isFinite(rh) && rw > 0 && rh > 0) {
            out.minX = rx;
            out.maxX = rx + rw;
            out.minY = ry;
            out.maxY = ry + rh;
            return out;
          }
        }

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

              out.minX = Math.min(p0.x, p1.x, p2.x, p3.x);
              out.maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
              out.minY = Math.min(p0.y, p1.y, p2.y, p3.y);
              out.maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
              return out;
            }
          } catch (err) {}
        }
      }

      // B. ViewBox-Derived Auto-bounds
      if (this.bounds.autoViewBox && this.group && this.group.ownerSVGElement) {
        const svg = this.group.ownerSVGElement;
        if (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width > 0) {
          const vb = svg.viewBox.baseVal;
          out.minX = vb.x + this.radius;
          out.maxX = vb.x + vb.width - this.radius;
          out.minY = vb.y + this.radius;
          out.maxY = vb.y + vb.height - this.radius;
          return out;
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
        let el = null;
        if (typeof selector === 'string') {
          if (obs._el && obs._elSelector === selector && obs._el.isConnected) {
            el = obs._el;
          } else {
            el = root.querySelector(selector);
            obs._el = el || null;
            obs._elSelector = selector;
          }
        } else {
          el = selector;
        }
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

    update(rawDt) {
      const dt = rawDt > 0.05 ? 0.05 : (rawDt > 0 ? rawDt : 0);
      if (dt <= 0) return;

      if (this.phaseState === 'solid') {
        const time = (this.engine && this.engine.realtimeSec != null) ? this.engine.realtimeSec : (performance.now() / 1000);
        for (let i = 0; i < this.pool.length; i++) {
          const p = this.pool[i];
          if (p.latticeX != null && p.latticeY != null) {
            p.x = p.latticeX + Math.sin(time * 16 + i * 1.6) * 1.5;
            p.y = p.latticeY + Math.cos(time * 20 + i * 2.2) * 1.5;
            if (p.node) {
              const cxStr = p.x.toFixed(1);
              const cyStr = p.y.toFixed(1);
              if (p._lastCx !== cxStr) { p._lastCx = cxStr; p.node.setAttribute('cx', cxStr); }
              if (p._lastCy !== cyStr) { p._lastCy = cyStr; p.node.setAttribute('cy', cyStr); }
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
              const cxStr = p.x.toFixed(1);
              const cyStr = p.y.toFixed(1);
              if (p._lastCx !== cxStr) { p._lastCx = cxStr; p.node.setAttribute('cx', cxStr); }
              if (p._lastCy !== cyStr) { p._lastCy = cyStr; p.node.setAttribute('cy', cyStr); }
            }
          }
          return;
        }
      }

      const steps = this.substeps || 4;
      const subDt = dt / steps;
      const eWall = this.restitution !== undefined ? this.restitution : 1.0;
      const muWall = this.friction || 0;

      for (let st = 0; st < steps; st++) {
        for (let i = 0; i < this.pool.length; i++) {
          const p = this.pool[i];
          const x0 = p.x;
          const y0 = p.y;
          p.vy += this.gravity * subDt;
          let x1 = x0 + p.vx * subDt;
          let y1 = y0 + p.vy * subDt;

          // Discrete 2D Ray/Segment & Proximity Collision Pipeline
          if (hasSegments) {
            for (let s = 0; s < segments.length; s++) {
              const seg = segments[s];
              const sx = seg.sx;
              const sy = seg.sy;
              const segLenSq = seg.len * seg.len;
              if (segLenSq < 0.25) continue;

              const proj = Math.max(0, Math.min(1, ((x1 - seg.ax) * sx + (y1 - seg.ay) * sy) / segLenSq));
              const cx = seg.ax + proj * sx;
              const cy = seg.ay + proj * sy;
              const distSq = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy);

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

                if (seg.refract && seg.refract > 1.0) {
                  const spd = Math.hypot(vRelX, vRelY) || 1e-4;
                  const dirX = vRelX / spd;
                  const dirY = vRelY / spd;
                  const cosI = -(dirX * nx + dirY * ny);
                  const eta = 1.0 / seg.refract;
                  const sin2T = eta * eta * (1.0 - cosI * cosI);

                  if (sin2T > 1.0) {
                    const dot = dirX * nx + dirY * ny;
                    p.vx = (dirX - 2 * dot * nx) * spd + vObsX;
                    p.vy = (dirY - 2 * dot * ny) * spd + vObsY;
                    x1 = cx + nx * (p.radius + 1.2);
                    y1 = cy + ny * (p.radius + 1.2);
                  } else {
                    const cosT = Math.sqrt(1.0 - sin2T);
                    const refrX = eta * dirX + (eta * cosI - cosT) * nx;
                    const refrY = eta * dirY + (eta * cosI - cosT) * ny;
                    p.vx = refrX * spd + vObsX;
                    p.vy = refrY * spd + vObsY;
                    x1 = cx + refrX * (p.radius + 1.5);
                    y1 = cy + refrY * (p.radius + 1.5);
                  }
                } else {
                  const bounce = seg.bounce !== undefined ? seg.bounce : eWall;
                  const vn = vRelX * nx + vRelY * ny;
                  if (vn < 0) {
                    const dvN = -(1 + bounce) * vn;
                    vRelX += dvN * nx;
                    vRelY += dvN * ny;
                    const mu = seg.friction || muWall;
                    if (mu > 0) {
                      const tx = -ny, ty = nx;
                      const vt = vRelX * tx + vRelY * ty;
                      const maxFric = mu * Math.abs(dvN);
                      const jt = Math.abs(vt) <= maxFric ? -vt : (vt > 0 ? -maxFric : maxFric);
                      vRelX += jt * tx;
                      vRelY += jt * ty;
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
              const dvN = (1 + eWall) * Math.abs(p.vx);
              p.vx = Math.abs(p.vx) * eWall;
              if (muWall > 0) {
                const maxF = muWall * dvN;
                p.vy = Math.abs(p.vy) <= maxF ? 0 : (p.vy - (p.vy > 0 ? maxF : -maxF));
              }
            } else if (x1 > maxX - p.radius) {
              x1 = maxX - p.radius;
              const dvN = (1 + eWall) * Math.abs(p.vx);
              p.vx = -Math.abs(p.vx) * eWall;
              if (muWall > 0) {
                const maxF = muWall * dvN;
                p.vy = Math.abs(p.vy) <= maxF ? 0 : (p.vy - (p.vy > 0 ? maxF : -maxF));
              }
            }
            if (y1 < minY + p.radius) {
              y1 = minY + p.radius;
              const dvN = (1 + eWall) * Math.abs(p.vy);
              p.vy = Math.abs(p.vy) * eWall;
              if (muWall > 0) {
                const maxF = muWall * dvN;
                p.vx = Math.abs(p.vx) <= maxF ? 0 : (p.vx - (p.vx > 0 ? maxF : -maxF));
              }
            } else if (y1 > maxY - p.radius) {
              y1 = maxY - p.radius;
              const dvN = (1 + eWall) * Math.abs(p.vy);
              p.vy = -Math.abs(p.vy) * eWall;
              if (muWall > 0) {
                const maxF = muWall * dvN;
                p.vx = Math.abs(p.vx) <= maxF ? 0 : (p.vx - (p.vx > 0 ? maxF : -maxF));
              }
            }
          } else if (this.wrapMode === 'wrap') {
            if (x1 < minX) x1 = maxX;
            if (x1 > maxX) x1 = minX;
            if (y1 < minY) y1 = maxY;
            if (y1 > maxY) y1 = minY;
          }

          p.x = x1;
          p.y = y1;
        }
      }

      for (let i = 0; i < this.pool.length; i++) {
        const p = this.pool[i];
        if (p.node) {
          const cxStr = p.x.toFixed(1);
          const cyStr = p.y.toFixed(1);
          if (p._lastCx !== cxStr) { p._lastCx = cxStr; p.node.setAttribute('cx', cxStr); }
          if (p._lastCy !== cyStr) { p._lastCy = cyStr; p.node.setAttribute('cy', cyStr); }
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

  global.VectorMicroPhysics = VectorMicroPhysics;
  global.VectorVerletPhysics = VectorVerletPhysics;
  global.VectorEmitterCollection = VectorEmitterCollection;
  if (typeof window !== 'undefined') {
    window.VectorMicroPhysics = VectorMicroPhysics;
    window.VectorVerletPhysics = VectorVerletPhysics;
    window.VectorEmitterCollection = VectorEmitterCollection;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
