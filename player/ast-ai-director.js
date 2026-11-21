/**
 * static/player/ast-ai-director.js
 *
 * St Joseph's AST Vector Media Player — Edge AI Visual Director & Spotlight Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated AI choreography maintenance:
 * - AI visual command sequencing (executeAiVisualCommand, _runSingleAiAction)
 * - Spotlight pulse styling & highlighting (ensureAiSpotlightStyles, applyAiHighlight, clearAiSpotlights)
 * - Smooth timeline & SVG viewBox camera tweens (tweenProgress, zoomToElement, resetViewBox, tweenViewBox)
 * - Pupil manual-control preemption (preemptAiDemonstration)
 */

(function (global) {
  'use strict';

  class ASTAiDirectorMethods {
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
      if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.highlightTarget === 'function') {
        global.ASTSharedRenderBoundary.highlightTarget(selector, durationMs, 'player-stage');
      }
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
  }

  const ASTAiDirector = {};
  const _proto = ASTAiDirectorMethods.prototype;
  const _names = Object.getOwnPropertyNames(_proto);
  for (let i = 0; i < _names.length; i++) {
    const _name = _names[i];
    if (_name !== 'constructor') {
      ASTAiDirector[_name] = _proto[_name];
    }
  }

  global.ASTAiDirector = ASTAiDirector;
  if (typeof window !== 'undefined') {
    window.ASTAiDirector = ASTAiDirector;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
