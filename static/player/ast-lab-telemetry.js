/**
 * static/player/ast-lab-telemetry.js
 *
 * St Joseph's AST Vector Media Player — Zero-GC Lab Telemetry, CSV Export & Engine State Summary
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTVectorPlayerEngine.
 * Zero external dependencies; loaded before ast-engine.js.
 * All methods execute with `this` bound to the ASTVectorPlayerEngine instance.
 */

(function (global) {
  'use strict';

  class ASTLabTelemetryMethods {
    /**
     * Initializes pre-allocated Float32Array columnar storage for zero-GC CSV lab logging.
     */
    _initLabLogBuffers() {
      const colNames = [];
      const sceneVars = (this.scene && this.scene.vars) || {};
      const keys = Object.keys(sceneVars);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.startsWith('_') || k === 'simClock' || k === 'clock') continue;
        const entry = sceneVars[k];
        const val = entry && typeof entry === 'object' ? (entry.value !== undefined ? entry.value : entry.val) : entry;
        if (typeof val === 'number') {
          colNames.push(k);
        }
      }
      const compList = (this.scene && this.scene.computed) || [];
      for (let i = 0; i < compList.length; i++) {
        const cname = compList[i] && compList[i].name;
        if (cname && !colNames.includes(cname)) {
          colNames.push(cname);
        }
      }
      this._labLogCols = [];
      for (let i = 0; i < colNames.length; i++) {
        this._labLogCols.push({
          name: colNames[i],
          data: new Float32Array(this._labLogCapacity)
        });
      }
      this._labLogCount = 0;
      this._labLogHead = 0;
      this._labLogClock = 0;
    }

    /**
     * Appends one timestamped sample to pre-allocated columnar ring buffers (0 heap allocations).
     */
    _recordLabSample(timeSec) {
      if (!this._labLogCols || this._labLogCols.length === 0) return;
      const cap = this._labLogCapacity;
      const idx = (this._labLogHead + this._labLogCount) % cap;
      if (this._labLogCount < cap) {
        this._labLogCount++;
      } else {
        this._labLogHead = (this._labLogHead + 1) % cap;
      }
      this._labLogTimes[idx] = timeSec;
      const v = this.vars || {};
      const cols = this._labLogCols;
      for (let c = 0; c < cols.length; c++) {
        const raw = v[cols[c].name];
        const num = typeof raw === 'number' ? raw : parseFloat(raw);
        cols[c].data[idx] = Number.isFinite(num) ? num : 0;
      }
    }

    /**
     * Generates an RFC-4180 CSV table of sampled (t, vars, computed) & :scope observations
     * for UK GCSE Working Scientifically practicals.
     */
    exportLabCsv() {
      const cols = this._labLogCols || [];
      const escCsv = (s) => {
        const str = String(s === undefined || s === null ? '' : s);
        return (str.includes(',') || str.includes('"') || str.includes('\n'))
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      };
      const header = ['time_s'];
      for (let c = 0; c < cols.length; c++) header.push(escCsv(cols[c].name));
      const scopeCount = this.activeScopes ? this.activeScopes.length : 0;
      for (let s = 0; s < scopeCount; s++) {
        header.push(`scope_${s + 1}_x`, `scope_${s + 1}_y`);
      }

      const lines = [header.join(',')];
      const cap = this._labLogCapacity;
      const loggedRows = this._labLogCount || 0;
      let maxScopeRows = 0;
      for (let s = 0; s < scopeCount; s++) {
        if (this.activeScopes[s].count > maxScopeRows) maxScopeRows = this.activeScopes[s].count;
      }

      const rowCount = Math.max(loggedRows, maxScopeRows);
      if (rowCount === 0) {
        // Record immediate current snapshot row so export always contains valid data
        const nowT = (this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : (this.realtimeSec || 0);
        const row = [nowT.toFixed(3)];
        const v = this.vars || {};
        for (let c = 0; c < cols.length; c++) {
          const val = v[cols[c].name];
          row.push(val !== undefined ? Number(val).toFixed(4).replace(/\.?0+$/, (m) => m.startsWith('.') ? '' : m) : '0');
        }
        for (let s = 0; s < scopeCount; s++) {
          row.push('', '');
        }
        lines.push(row.join(','));
        return {
          sceneId: (this.scene && this.scene.id) || this.activePresetId || 'simulation',
          sceneTitle: (this.scene && this.scene.title) || 'Simulation',
          rowCount: 1,
          csv: lines.join('\n')
        };
      }

      for (let r = 0; r < rowCount; r++) {
        const row = [];
        if (r < loggedRows) {
          const idx = (this._labLogHead + r) % cap;
          row.push(this._labLogTimes[idx].toFixed(3));
          for (let c = 0; c < cols.length; c++) {
            const val = cols[c].data[idx];
            row.push(Number.isFinite(val) ? Number(val.toFixed(4)).toString() : '0');
          }
        } else {
          row.push('');
          for (let c = 0; c < cols.length; c++) row.push('');
        }
        for (let s = 0; s < scopeCount; s++) {
          const sc = this.activeScopes[s];
          if (r < sc.count) {
            const sIdx = (sc.head + r) % sc.capacity;
            row.push(Number(sc.rawX[sIdx].toFixed(4)).toString());
            row.push(Number(sc.rawY[sIdx].toFixed(4)).toString());
          } else {
            row.push('', '');
          }
        }
        lines.push(row.join(','));
      }

      return {
        sceneId: (this.scene && this.scene.id) || this.activePresetId || 'simulation',
        sceneTitle: (this.scene && this.scene.title) || 'Simulation',
        rowCount,
        csv: lines.join('\n')
      };
    }

    getLabDataCsv() {
      return this.exportLabCsv();
    }

    getCheckpointGoalStatus(idx) {
      const cp = this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints[idx];
      if (!cp) return { passed: false, holdProgress: 0, holdElapsed: 0, holdDuration: 0 };
      const holdDuration = Number(cp.holdDuration || 0);
      const elapsed = this._cpHoldTimers && idx < this._cpHoldTimers.length ? this._cpHoldTimers[idx] : 0;
      const passed = Boolean(this._cpPassedMask && idx < this._cpPassedMask.length && this._cpPassedMask[idx] === 1);
      const holdProgress = passed ? 1 : (holdDuration > 0 ? Math.min(1, elapsed / holdDuration) : 0);
      return { passed, holdProgress, holdElapsed: elapsed, holdDuration };
    }

    getEngineStateSummary(includeSvgBytes = false) {
      const s = this.scene || {};
      const cleanVars = {};
      if (this.vars) {
        const keys = Object.keys(this.vars);
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (k.startsWith('*') && k.endsWith('*')) continue;
          cleanVars[k] = this.vars[k];
        }
      }
      const varMeta = {};
      if (s.vars && typeof s.vars === 'object') {
        const vKeys = Object.keys(s.vars);
        for (let i = 0; i < vKeys.length; i++) {
          const k = vKeys[i];
          const entry = s.vars[k];
          if (entry && typeof entry === 'object') {
            varMeta[k] = {
              min: entry.min !== undefined ? Number(entry.min) : undefined,
              max: entry.max !== undefined ? Number(entry.max) : undefined,
              step: entry.step !== undefined ? Number(entry.step) : undefined,
              unit: entry.unit || ''
            };
          }
        }
      }
      const ledgers = [];
      if (Array.isArray(this.activeLedgers)) {
        for (let i = 0; i < this.activeLedgers.length; i++) {
          const ld = this.activeLedgers[i];
          const terms = [];
          let total = 0;
          for (let ti = 0; ti < ld.terms.length; ti++) {
            const val = Number((ld.values[ti] || 0).toFixed(3));
            total += val;
            terms.push({ label: ld.terms[ti].label, value: val, color: ld.terms[ti].color });
          }
          ledgers.push({ id: ld.id, unit: ld.unit || '', total: Number(total.toFixed(3)), terms });
        }
      }
      const checkpointGoals = [];
      if (s.interactive && Array.isArray(s.interactive.checkpoints)) {
        for (let i = 0; i < s.interactive.checkpoints.length; i++) {
          const cp = s.interactive.checkpoints[i];
          if (!cp || !cp.passExpr) continue;
          const st = this.getCheckpointGoalStatus(i);
          checkpointGoals.push({
            index: i,
            title: cp.title || `Checkpoint ${i + 1}`,
            passExpr: cp.passExpr,
            holdDuration: Number(cp.holdDuration || 0),
            holdElapsed: Number((st.holdElapsed || 0).toFixed(3)),
            holdProgress: Number((st.holdProgress || 0).toFixed(3)),
            passed: st.passed
          });
        }
      }
      let svgDomBytes = 0;
      if (includeSvgBytes) {
        const stage = this.getStageSvg();
        if (stage && stage.outerHTML) {
          svgDomBytes = stage.outerHTML.length;
        } else if (typeof s.svgText === 'string') {
          svgDomBytes = s.svgText.length;
        }
      }
      return {
        sceneId: this.activePresetId || s.id || 'scene',
        title: s.title || 'AST Simulation',
        archetype: s.type || 'Sim',
        t: Number(((this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : (this.progress || 0) * (this.durationSec || 10)).toFixed(3)),
        progress: Number((this.progress || 0).toFixed(4)),
        isPlaying: Boolean(this.isPlaying),
        vars: cleanVars,
        varMeta,
        ledgers,
        scopesCount: Array.isArray(this.activeScopes) ? this.activeScopes.length : 0,
        checkpointGoals,
        astSourceBytes: typeof s.astSource === 'string' ? s.astSource.length : 0,
        svgDomBytes
      };
    }
  }

  const ASTLabTelemetry = {};
  const _proto = ASTLabTelemetryMethods.prototype;
  for (const _name of Object.getOwnPropertyNames(_proto)) {
    if (_name !== 'constructor' && typeof _proto[_name] === 'function') {
      ASTLabTelemetry[_name] = _proto[_name];
    }
  }

  global.ASTLabTelemetry = ASTLabTelemetry;
  if (typeof window !== 'undefined') {
    window.ASTLabTelemetry = ASTLabTelemetry;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTLabTelemetry };
  }
})(typeof window !== 'undefined' ? window : globalThis);
