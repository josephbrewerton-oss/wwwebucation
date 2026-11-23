/**
 * static/player/ast-binding-runtime.js
 *
 * St Joseph's AST Vector Media Player — 60 FPS Reactive Binding Evaluator, Emitters, Scopes & Energy Ledgers
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTVectorPlayerEngine.
 * Zero external dependencies; loaded before ast-engine.js.
 * All methods execute with `this` bound to the ASTVectorPlayerEngine instance.
 */

(function (global) {
  'use strict';

  const _EMPTY_AST_MATH = Object.create(null);
  const _getAstMath = () => global.AstMath || (typeof window !== 'undefined' ? window.AstMath : undefined) || _EMPTY_AST_MATH;
  const _getAST3D = () => global.AST3DEngine || (typeof window !== 'undefined' ? window.AST3DEngine : undefined);

  class ASTBindingRuntimeMethods {
  applyBindings(t, dt = 0.016, isTickStep = false) {
    // When the lazy-loaded pure-SVG AVM1 Micro-VM is driving an SWF cartridge, delegate frame stepping cleanly to it
    if (this._avm1Vm && this._avm1Vm._mounted) {
      if (isTickStep && this.isPlaying) {
        this._avm1Vm.step(dt);
      }
      return;
    }

    const isSim = Boolean(this.isContinuousSim || (this.scene && (this.scene.type === 'Sim' || this.scene.cartridgeType === 'Sim')));
    const effectiveT = (isSim && this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : t;
    this.updateComputedVars(effectiveT);

    if (isTickStep && this.isPlaying && this.activeVarBindings && this.activeVarBindings.length > 0 && this.vars) {
      const v = this.vars;
      const clampedDt = (typeof dt === 'number' && dt > 0) ? (dt > 0.1 ? 0.1 : dt) : 0.016666666666666666;
      v.sim_dt = clampedDt;
      v.sim_scale = clampedDt * 60;
      let varChanged = false;
      for (let i = 0; i < this.activeVarBindings.length; i++) {
        const vb = this.activeVarBindings[i];
        try {
          if (vb.whenFn) {
            const cond = Boolean(vb.whenFn(effectiveT, v, v, Math));
            if (vb.edge === 'enter') {
              if (!cond) {
                vb.lastEdge = false;
                continue;
              }
              if (vb.lastEdge) continue;
              vb.lastEdge = true;
            } else if (!cond) {
              continue;
            }
          }
          const nextVal = vb.evalFn(effectiveT, v, v, Math);
          if (nextVal !== undefined && (typeof nextVal !== 'number' || Number.isFinite(nextVal))) {
            if (v[vb.varName] !== nextVal) {
              v[vb.varName] = nextVal;
              varChanged = true;
            }
          }
        } catch (_) {}
      }
      if (varChanged) {
        this.updateComputedVars(effectiveT);
      }
    }

    if (!this._isMounting && this._container && (this._mountedSceneId !== this.activePresetId || this._mountedContainer !== this._container)) {
      if (this.scene) {
        this.mountSceneAsset(this.scene, this._container);
      }
    }

    const sceneCam = this.scene && this.scene.camera;
    const camera = this._cameraFrame || (this._cameraFrame = { distance: 500, pitch: 20, yaw: 0, roll: 0, fov: 60 });
    camera.distance = (sceneCam && sceneCam.distance !== undefined) ? sceneCam.distance : 500;
    camera.pitch = (sceneCam && sceneCam.pitch !== undefined) ? sceneCam.pitch : 20;
    camera.yaw = (sceneCam && sceneCam.yaw !== undefined) ? sceneCam.yaw : 0;
    camera.roll = (sceneCam && sceneCam.roll !== undefined) ? sceneCam.roll : 0;
    camera.fov = (sceneCam && sceneCam.fov !== undefined) ? sceneCam.fov : 60;

    if (typeof camera.yaw === 'string' || typeof camera.pitch === 'string') {
      const v = this.vars || {};
      const prevClock = v.clock;
      v.clock = this.realtimeSec != null ? this.realtimeSec : (effectiveT * (this.durationSec || 12.0));
      if (typeof camera.yaw === 'string') {
        try {
          const yawFn = this.compileAstFn(camera.yaw);
          if (typeof yawFn === 'function') camera.yaw = yawFn(effectiveT, v, this.computed || v, Math);
        } catch {}
      }
      if (typeof camera.pitch === 'string') {
        try {
          const pitchFn = this.compileAstFn(camera.pitch);
          if (typeof pitchFn === 'function') camera.pitch = pitchFn(effectiveT, v, this.computed || v, Math);
        } catch {}
      }
      if (prevClock !== undefined) v.clock = prevClock;
    }
    const totalScale = Math.max(0.2, Math.min(4.0, (this.cameraOrbit ? this.cameraOrbit.distanceScale : 1.0)));

    const hasSoftware3D = Boolean(this.active3DItems && this.active3DItems.length > 0);
    if (this._container && this._container.style) {
      let nextTransform = '';
      let nextTransition = '';
      if (!hasSoftware3D && (this.cameraOrbit && (this.cameraOrbit.yawOffset !== 0 || this.cameraOrbit.pitchOffset !== 0 || this.cameraOrbit.distanceScale !== 1.0))) {
        const orbitYaw = Math.max(-45, Math.min(45, this.cameraOrbit.yawOffset));
        const orbitPitch = Math.max(-45, Math.min(45, this.cameraOrbit.pitchOffset));
        nextTransform = `perspective(800px) rotateX(${orbitPitch.toFixed(1)}deg) rotateY(${orbitYaw.toFixed(1)}deg) scale(${totalScale.toFixed(2)})`;
        nextTransition = this.isOrbitDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      if (this._lastOrbitTransform !== nextTransform) {
        this._lastOrbitTransform = nextTransform;
        if (nextTransform) {
          this._container.style.transformOrigin = '400px 240px';
          this._container.style.transformBox = 'view-box';
        }
        this._container.style.transform = nextTransform;
      }
      if (this._lastOrbitTransition !== nextTransition) {
        this._lastOrbitTransition = nextTransition;
        this._container.style.transition = nextTransition;
      }
    }

    // Evaluate 2D reactive bindings BEFORE 3D node projection so newly revealed 3D nodes/groups
    // have display="inline" and visibility state updated on the exact same frame.
    if (this.activeBindings && this.activeBindings.length) {
      const v = this.vars || {};
      const renderBoundary = global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.commitBindingValue === 'function'
        ? global.ASTSharedRenderBoundary
        : null;
      const whenCache = this._whenEvalCache;
      if (whenCache) whenCache.fill(-1);
      for (let i = 0; i < this.activeBindings.length; i++) {
        const b = this.activeBindings[i];
        if (b.node) {
          try {
            if (b.whenFn) {
              const wgId = b.whenGroupId;
              let allowed;
              if (whenCache && wgId >= 0 && wgId < whenCache.length) {
                const cached = whenCache[wgId];
                if (cached !== -1) {
                  allowed = cached === 1;
                } else {
                  allowed = Boolean(b.whenFn(effectiveT, v, v, Math));
                  whenCache[wgId] = allowed ? 1 : 0;
                }
              } else {
                allowed = Boolean(b.whenFn(effectiveT, v, v, Math));
              }
              if (!allowed) continue;
            }
            let val;
            if (b.affine) {
              const num = b.affine.m * effectiveT + b.affine.c;
              if (b.matrixBuf) {
                const mb = b.matrixBuf;
                if (b.affine.transform === 'translateX') {
                  mb[0] = 1; mb[1] = 0; mb[2] = 0; mb[3] = 1; mb[4] = num; mb[5] = 0;
                } else if (b.affine.transform === 'translateY') {
                  mb[0] = 1; mb[1] = 0; mb[2] = 0; mb[3] = 1; mb[4] = 0; mb[5] = num;
                } else if (b.affine.transform === 'rotate') {
                  const rad = num * (Math.PI / 180);
                  const cos = Math.cos(rad);
                  const sin = Math.sin(rad);
                  mb[0] = cos; mb[1] = sin; mb[2] = -sin; mb[3] = cos;
                  if (b.affine.originX != null && b.affine.originY != null) {
                    const cx = b.affine.originX;
                    const cy = b.affine.originY;
                    mb[4] = cx - cx * cos + cy * sin;
                    mb[5] = cy - cx * sin - cy * cos;
                  } else {
                    mb[4] = 0; mb[5] = 0;
                  }
                }
                val = `matrix(${mb[0]},${mb[1]},${mb[2]},${mb[3]},${mb[4]},${mb[5]})`;
              } else {
                val = num;
              }
            } else {
              val = b.evalFn(effectiveT, v, Math, v);
            }
            if (b.lastVal !== val) {
              b.lastVal = val;
              if (renderBoundary) {
                renderBoundary.commitBindingValue(b.node, b.attr, val);
              } else if (b.attr === 'textContent' || b.attr === 'text') {
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

    if (hasSoftware3D) {
      const _3d = _getAST3D();
      if (_3d && typeof _3d.renderSoftware3D === 'function') {
        _3d.renderSoftware3D.call(this, effectiveT, camera);
      }
    }

    // Generic declarative emitter expressions (:phase-expr, :clamp-x-expr, :count-expr, :speed-expr)
    if (this.emitters && this.emitters.size > 0) {
      const v = this.vars || {};
      const _M = _getAstMath();
      for (const em of this.emitters.values()) {
        if (em._phaseEval) {
          try {
            const nextPhase = String(em._phaseEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map) || 'gas').toLowerCase();
            if (nextPhase && nextPhase !== em.phaseState) {
              em.setPhaseState(nextPhase);
            }
          } catch (_) {}
        }
        if (em._clampXEval) {
          try {
            const nextClampX = Number(em._clampXEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
            if (Number.isFinite(nextClampX)) {
              em.clampToPistonX(nextClampX);
            }
          } catch (_) {}
        }
        if (em._countEval) {
          try {
            const nextCnt = Math.round(Number(em._countEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map)));
            if (Number.isFinite(nextCnt) && nextCnt !== em._lastCountEval) {
              em._lastCountEval = nextCnt;
              em.setCount(nextCnt);
            }
          } catch (_) {}
        }
        if (em._speedEval) {
          try {
            const nextSpd = Number(em._speedEval(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
            if (Number.isFinite(nextSpd) && Math.abs(nextSpd - em._lastSpeedEval) >= 2) {
              em._lastSpeedEval = nextSpd;
              em.setSpeed(nextSpd);
            }
          } catch (_) {}
        }
      }
    }

    // Update Zero-GC Live Vector Oscilloscopes (:scope) with per-slot cached coordinate tokens
    if (!this._isResetting && this.activeScopes && this.activeScopes.length > 0) {
      const v = this.vars || {};
      const _M = _getAstMath();
      for (let s = 0; s < this.activeScopes.length; s++) {
        const sc = this.activeScopes[s];
        try {
          const xv = Number(sc.evalX(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
          const yv = Number(sc.evalY(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
          if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;

          const xSpan = Math.max(1e-6, sc.xMax - sc.xMin);
          const ySpan = Math.max(1e-6, sc.yMax - sc.yMin);
          const minStepX = xSpan / Math.max(8, sc.capacity);
          const minStepY = ySpan * 0.015;
          const dx = Math.abs(xv - sc.lastSampleX);
          const dy = Math.abs(yv - sc.lastSampleY);

          if (!sc.hasLast || dx >= minStepX || dy >= minStepY) {
            const writeIdx = (sc.head + sc.count) % sc.capacity;
            if (sc.count < sc.capacity) {
              sc.count++;
            } else {
              sc.head = (sc.head + 1) % sc.capacity;
            }
            sc.rawX[writeIdx] = xv;
            sc.rawY[writeIdx] = yv;
            sc.lastSampleX = xv;
            sc.lastSampleY = yv;
            sc.hasLast = true;

            let nx = (xv - sc.xMin) / xSpan;
            let ny = (yv - sc.yMin) / ySpan;
            if (nx < 0) nx = 0; else if (nx > 1) nx = 1;
            if (ny < 0) ny = 0; else if (ny > 1) ny = 1;
            const px = sc.plotX + nx * sc.plotW;
            const py = sc.plotY + sc.plotH - ny * sc.plotH;
            if (!sc.slotTokens) sc.slotTokens = new Array(sc.capacity);
            sc.slotTokens[writeIdx] = `${px.toFixed(1)},${py.toFixed(1)}`;

            if (sc.node) {
              const pts = sc.ptStrings;
              pts.length = sc.count;
              const cap = sc.capacity;
              const head = sc.head;
              const slots = sc.slotTokens;
              for (let k = 0; k < sc.count; k++) {
                pts[k] = slots[(head + k) % cap];
              }
              sc.node.setAttribute('points', pts.join(' '));
            }
          }
        } catch (_) {}
      }
    }

    // Update Zero-GC Conservation-Law & Energy-Ledger Meters (:ledger)
    if (this.activeLedgers && this.activeLedgers.length > 0) {
      const v = this.vars || {};
      const _M = _getAstMath();
      for (let l = 0; l < this.activeLedgers.length; l++) {
        const ld = this.activeLedgers[l];
        let total = 0;
        let changed = !ld.hasLast;
        const termCount = ld.evalFns.length;
        for (let ti = 0; ti < termCount; ti++) {
          let val = 0;
          try {
            val = Number(ld.evalFns[ti](effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
          } catch (_) { val = 0; }
          if (!Number.isFinite(val) || val < 0) val = 0;
          ld.values[ti] = val;
          total += val;
          if (!changed && Math.abs(val - ld.lastValues[ti]) > 1e-3) {
            changed = true;
          }
        }
        if (changed) {
          let maxCap = total;
          if (ld.maxEvalFn) {
            try {
              const m = Number(ld.maxEvalFn(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
              if (Number.isFinite(m) && m > 0) maxCap = m;
            } catch (_) {}
          }
          if (maxCap < 1e-6) maxCap = 1;

          let cursorX = ld.x;
          for (let ti = 0; ti < termCount; ti++) {
            const val = ld.values[ti];
            ld.lastValues[ti] = val;
            const frac = Math.min(1, val / maxCap);
            const segW = Math.max(0, Math.min(ld.x + ld.width - cursorX, frac * ld.width));
            if (ld.rectNodes[ti]) {
              ld.rectNodes[ti].setAttribute('x', cursorX.toFixed(1));
              ld.rectNodes[ti].setAttribute('width', segW.toFixed(1));
            }
            if (ld.valueLabelNodes[ti]) {
              const unitSuffix = ld.unit ? ` ${ld.unit}` : '';
              ld.valueLabelNodes[ti].textContent = `${ld.terms[ti].label}: ${val.toFixed(1)}${unitSuffix}`;
            }
            cursorX += segW;
          }
          if (ld.totalNode) {
            const unitSuffix = ld.unit ? ` ${ld.unit}` : '';
            ld.totalNode.textContent = `Total: ${total.toFixed(1)}${unitSuffix}`;
          }
          ld.hasLast = true;
        }
      }
    }

    // Evaluate Manipulation-Based Goal Checkpoints (:pass-expr & :hold-duration)
    if (this.scene && this.scene.interactive && Array.isArray(this.scene.interactive.checkpoints)) {
      const cps = this.scene.interactive.checkpoints;
      const v = this.vars || {};
      const stepDt = isTickStep ? dt : 0;
      for (let ci = 0; ci < cps.length && ci < 32; ci++) {
        const cp = cps[ci];
        if (!cp || !cp.passExpr) continue;
        if (!cp._passEvalFn) {
        try {
          const rawPassFn = this.compileAstFn(cp.passExpr);
          cp._passEvalFn = typeof rawPassFn === 'function'
            ? (t, vars, MathObj, computed, clamp, lerp, map) =>
                Boolean(typeof rawPassFn === 'function' ? rawPassFn(t, vars, computed, MathObj, clamp, lerp, map) : false)
            : () => false;
        } catch (_) {
          cp._passEvalFn = () => false;
        }        }
        let condMet = false;
        try {
          const _M = _getAstMath();
          condMet = Boolean(cp._passEvalFn(effectiveT, v, Math, v, _M.clamp, _M.lerp, _M.map));
        } catch (_) {
          condMet = false;
        }
        const holdDur = Number(cp.holdDuration || 0);
        if (this._cpPassedMask[ci] === 0) {
          if (condMet) {
            if (holdDur <= 0) {
              this._cpHoldTimers[ci] = 0;
              this._cpPassedMask[ci] = 1;
              cp._holdProgress = 1;
              this.emit('checkpoint_goal_passed', { index: ci, checkpoint: cp });
              this.notifyParent({
                type: 'CHECKPOINT_GOAL_PASSED',
                sceneId: (this.scene && this.scene.id) || '',
                index: ci,
                prompt: cp.prompt
              });
            } else {
              this._cpHoldTimers[ci] = Math.min(holdDur, this._cpHoldTimers[ci] + stepDt);
              cp._holdProgress = Math.min(1, this._cpHoldTimers[ci] / holdDur);
              if (this._cpHoldTimers[ci] >= holdDur) {
                this._cpPassedMask[ci] = 1;
                cp._holdProgress = 1;
                this.emit('checkpoint_goal_passed', { index: ci, checkpoint: cp });
                this.notifyParent({
                  type: 'CHECKPOINT_GOAL_PASSED',
                  sceneId: (this.scene && this.scene.id) || '',
                  index: ci,
                  prompt: cp.prompt
                });
              }
            }
          } else {
            this._cpHoldTimers[ci] = 0;
            cp._holdProgress = 0;
          }
        } else {
          cp._holdProgress = 1;
        }
      }
    }

    // Periodic zero-GC sampling into Lab CSV columnar ring buffer during active tick
    if (isTickStep && this.isPlaying) {
      this._labLogClock = (this._labLogClock || 0) + dt;
      if (this._labLogClock >= 0.25) {
        this._labLogClock = 0;
        const sampleT = (this.vars && typeof this.vars.simClock === 'number') ? this.vars.simClock : (this.realtimeSec || 0);
        this._recordLabSample(sampleT);
      }
    }

    if (this.scene && typeof this.scene.update === 'function' && this._cachedElements) {
      this.scene.update(t, this._cachedElements, this, dt);
    }
  }

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
  }

  const ASTBindingRuntime = {};
  const _proto = ASTBindingRuntimeMethods.prototype;
  for (const _name of Object.getOwnPropertyNames(_proto)) {
    if (_name !== 'constructor' && typeof _proto[_name] === 'function') {
      ASTBindingRuntime[_name] = _proto[_name];
    }
  }

  global.ASTBindingRuntime = ASTBindingRuntime;
  if (typeof window !== 'undefined') {
    window.ASTBindingRuntime = ASTBindingRuntime;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTBindingRuntime };
  }
})(typeof window !== 'undefined' ? window : globalThis);
