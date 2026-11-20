class ASTProfiler {
    constructor(options = {}) {
      this.mode = options.mode || 'minimal';
      this.strictAlarm = !!options.strictAlarm;
      
      this.lastFrameTs = 0;
      this.frameCount = 0;
      this.historyLen = 60;
      this.frameDeltas = new Float32Array(this.historyLen);
      this.computeTimes = new Float32Array(this.historyLen);
      this.bufIndex = 0;

      // Pre-allocated zero-GC capture buffer for Chrome EPP contention benchmarks
      this.silent = Boolean(options.silent);
      this.captureCap = 1024;
      this.captureDeltas = new Float32Array(this.captureCap);
      this.captureComputes = new Float32Array(this.captureCap);
      this.captureActive = false;
      this.captureCount = 0;

      this.svgRoot = null;
      this.hudGroup = null;
      this.bgNode = null;
      this.sparklineNode = null;
      this.textNode = null;

      if (options.svgRoot && !this.silent) {
        this.mount(options.svgRoot);
      }
    }

    startCapture() {
      this.captureCount = 0;
      this.lastFrameTs = 0;
      this.captureActive = true;
    }

    stopCapture(vsyncBudgetMs = 16.67) {
      this.captureActive = false;
      const budget = typeof vsyncBudgetMs === 'number' && Number.isFinite(vsyncBudgetMs) && vsyncBudgetMs > 0
        ? vsyncBudgetMs
        : 16.67;
      const severeBudget = budget * 1.15;
      const n = Math.min(this.captureCount, this.captureCap);
      const validDeltas = [];
      let sumD = 0;
      let sumC = 0;
      let overBudget = 0;
      let rawVsyncOverruns = 0;
      let severeFrameDrops = 0;
      const validComputes = [];
      for (let i = 0; i < n; i++) {
        const d = this.captureDeltas[i];
        const c = this.captureComputes[i];
        if (d > 0) {
          validDeltas.push(d);
          sumD += d;
          if (d > 16.67) overBudget++;
          if (d > budget) rawVsyncOverruns++;
          if (d > severeBudget) severeFrameDrops++;
        }
        validComputes.push(c);
        sumC += c;
      }
      validDeltas.sort((a, b) => a - b);
      validComputes.sort((a, b) => a - b);
      const dLen = validDeltas.length;
      const cLen = validComputes.length;
      const pct = (arr, p) => {
        if (!arr.length) return 0;
        const idx = Math.min(arr.length - 1, Math.max(0, Math.ceil(arr.length * p) - 1));
        return arr[idx];
      };
      const meanMs = dLen > 0 ? sumD / dLen : budget;
      const p95Ms = pct(validDeltas, 0.95);
      const p99Ms = pct(validDeltas, 0.99);
      const maxMs = dLen > 0 ? validDeltas[dLen - 1] : 0;
      const meanComputeMs = cLen > 0 ? sumC / cLen : 0;
      const p95ComputeMs = pct(validComputes, 0.95);
      return {
        sampleCount: dLen,
        meanMs: Number(meanMs.toFixed(3)),
        p95Ms: Number(p95Ms.toFixed(3)),
        p99Ms: Number(p99Ms.toFixed(3)),
        maxMs: Number(maxMs.toFixed(3)),
        framesOver16_67ms: overBudget,
        overBudgetPct: dLen > 0 ? Number(((overBudget / dLen) * 100).toFixed(2)) : 0,
        vsyncBudgetMs: Number(budget.toFixed(2)),
        rawVsyncOverruns,
        rawVsyncOverrunPct: dLen > 0 ? Number(((rawVsyncOverruns / dLen) * 100).toFixed(2)) : 0,
        severeFrameDrops,
        severeFrameDropPct: dLen > 0 ? Number(((severeFrameDrops / dLen) * 100).toFixed(2)) : 0,
        estimatedFps: meanMs > 0 ? Number((1000 / meanMs).toFixed(1)) : Number((1000 / budget).toFixed(1)),
        meanComputeMs: Number(meanComputeMs.toFixed(3)),
        p95ComputeMs: Number(p95ComputeMs.toFixed(3)),
      };
    }

    mount(svgRoot) {
      if (!svgRoot || this.silent) return;
      if (this.hudGroup && this.hudGroup.parentNode) {
        this.hudGroup.parentNode.removeChild(this.hudGroup);
      }
      this.svgRoot = svgRoot;

      this.hudGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      this.hudGroup.setAttribute("id", "ast-engine-profiler-hud");
      this.hudGroup.setAttribute("pointer-events", "none");
      this.hudGroup.setAttribute("style", "user-select: none;");

      // Semi-transparent glassmorphic background pill
      this.bgNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      this.bgNode.setAttribute("x", "10");
      this.bgNode.setAttribute("y", "8");
      this.bgNode.setAttribute("width", "250");
      this.bgNode.setAttribute("height", this.mode === 'graph' ? "44" : "24");
      this.bgNode.setAttribute("rx", "5");
      this.bgNode.setAttribute("ry", "5");
      this.bgNode.setAttribute("fill", "rgba(15, 23, 42, 0.92)");
      this.bgNode.setAttribute("stroke", "rgba(56, 189, 248, 0.5)");
      this.bgNode.setAttribute("stroke-width", "1");
      this.hudGroup.appendChild(this.bgNode);

      // Sparkline for graph mode
      if (this.mode === 'graph') {
        this.sparklineNode = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.sparklineNode.setAttribute("fill", "none");
        this.sparklineNode.setAttribute("stroke", "#38bdf8");
        this.sparklineNode.setAttribute("stroke-width", "1.5");
        this.sparklineNode.setAttribute("stroke-linecap", "round");
        this.sparklineNode.setAttribute("stroke-linejoin", "round");
        this.hudGroup.appendChild(this.sparklineNode);
      } else {
        this.sparklineNode = null;
      }

      this.textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
      this.textNode.setAttribute("x", "18");
      this.textNode.setAttribute("y", "24");
      this.textNode.setAttribute("fill", "#00FF66");
      this.textNode.setAttribute("font-family", "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace");
      this.textNode.setAttribute("font-size", "11px");
      this.textNode.setAttribute("font-weight", "bold");
      this.textNode.textContent = "FPS: 60 | VM: 0.1ms";

      this.hudGroup.appendChild(this.textNode);
      this.svgRoot.appendChild(this.hudGroup);
      this._updateReadout();
    }

    onFrame(ts) {
      if (this.lastFrameTs > 0) {
        const dt = ts - this.lastFrameTs;
        this.frameDeltas[this.bufIndex] = dt;
        if (this.captureActive && this.captureCount < this.captureCap) {
          this.captureDeltas[this.captureCount] = dt;
        }
      }
      this.lastFrameTs = ts;
    }

    onCompute(ms) {
      this.computeTimes[this.bufIndex] = ms;
      if (this.captureActive && this.captureCount < this.captureCap) {
        this.captureComputes[this.captureCount] = ms;
        this.captureCount++;
      }
      this.bufIndex = (this.bufIndex + 1) % this.historyLen;
      this.frameCount++;

      if (!this.silent && (this.frameCount % 15 === 0 || this.frameCount < 5) && this.textNode) {
        this._updateReadout();
      }
    }

    _updateReadout() {
      if (!this.textNode) return;
      let sumDelta = 0;
      let sumCompute = 0;
      let maxCompute = 0;
      let validFrames = 0;

      for (let i = 0; i < this.historyLen; i++) {
        const d = this.frameDeltas[i];
        const c = this.computeTimes[i];
        if (d > 0) {
          sumDelta += d;
          validFrames++;
        }
        sumCompute += c;
        if (c > maxCompute) maxCompute = c;
      }

      const avgDelta = validFrames > 0 ? (sumDelta / validFrames) : 16.66;
      const avgCompute = validFrames > 0 ? (sumCompute / validFrames) : (this.computeTimes[0] || 0.1);
      const fps = avgDelta > 0 ? Math.min(240, Math.round(1000 / avgDelta)) : 60;

      const overBudget = maxCompute > 16.66;
      if (this.strictAlarm && overBudget) {
        this.textNode.setAttribute("fill", "#FF3344");
        if (this.bgNode) this.bgNode.setAttribute("stroke", "rgba(239, 68, 68, 0.85)");
      } else {
        this.textNode.setAttribute("fill", fps >= 55 ? "#00FF66" : (fps >= 30 ? "#FACC15" : "#FF3344"));
        if (this.bgNode) this.bgNode.setAttribute("stroke", "rgba(56, 189, 248, 0.5)");
      }

      let mem = "";
      if (this.mode === 'full' && typeof performance !== 'undefined' && performance.memory) {
        const heapMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        mem = ` | Heap: ${heapMB}MB`;
      }

      const readoutText = `FPS: ${fps} | VM: ${avgCompute.toFixed(2)}ms (peak ${maxCompute.toFixed(1)}ms)${mem}`;
      this.textNode.textContent = readoutText;

      if (this.bgNode) {
        const targetWidth = Math.max(160, Math.round(readoutText.length * 6.8 + 24));
        this.bgNode.setAttribute("width", String(targetWidth));
        this.bgNode.setAttribute("height", this.mode === 'graph' ? "44" : "24");
      }

      if (this.mode === 'graph' && this.sparklineNode) {
        const points = [];
        const startX = 18;
        const baseY = 40;
        const graphHeight = 12;
        const stepX = 3.6;
        for (let i = 0; i < Math.min(60, this.historyLen); i++) {
          const idx = (this.bufIndex + i) % this.historyLen;
          const c = this.computeTimes[idx] || 0;
          const norm = Math.min(1.0, c / 20);
          const y = baseY - (norm * graphHeight);
          points.push(`${(startX + i * stepX).toFixed(1)},${y.toFixed(1)}`);
        }
        this.sparklineNode.setAttribute("points", points.join(" "));
      }
    }

    destroy() {
      if (this.hudGroup && this.hudGroup.parentNode) {
        this.hudGroup.parentNode.removeChild(this.hudGroup);
      }
      this.hudGroup = null;
      this.bgNode = null;
      this.sparklineNode = null;
      this.textNode = null;
    }
  } // <--- ONLY CLOSE THE CLASS HERE!

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

