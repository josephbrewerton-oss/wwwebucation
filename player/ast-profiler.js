/**
 * static/player/ast-profiler.js
 * Internal Hardware Telemetry & Zero-Allocation Profiler for AST Vector Player
 */
(function (global) {
  'use strict';

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
global.ASTProfiler = ASTProfiler;
  if (typeof window !== 'undefined') {
    window.ASTProfiler = ASTProfiler;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
