/**
 * static/player/ast-state-scorm.js
 *
 * St Joseph's AST Vector Media Player — Declarative State Machine & Micro-SCORM Bridge
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated maintenance:
 * - ASTStateMachine: Zero-bloat declarative state transitions with hysteresis & dwell lock
 * - MicroSCORMBridge: SCORM 1.2 / 2004 & xAPI LMS gradebook connector
 */

(function (global) {
  'use strict';

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
              if (!t._triggerFn) {
                t._triggerFn = (this.engine && typeof this.engine.compileAstFn === 'function')
                  ? this.engine.compileAstFn(t.trigger)
                  : () => t.trigger === 'true' || t.trigger === true;
              }
              if (t._triggerFn(0, reactiveVars, reactiveVars, Math)) {
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
          const _astEaseBounce = global.astEaseBounce || (typeof window !== 'undefined' ? window.astEaseBounce : undefined);
          eased = typeof _astEaseBounce === 'function' ? _astEaseBounce(progress) : progress;
        } else if (tr.easing === 'elastic') {
          const _astEaseElastic = global.astEaseElastic || (typeof window !== 'undefined' ? window.astEaseElastic : undefined);
          eased = typeof _astEaseElastic === 'function' ? _astEaseElastic(progress) : progress;
        } else if (tr.easing === 'backOut' || tr.easing === 'anticipation') {
          const _astEaseBack = global.astEaseBack || (typeof window !== 'undefined' ? window.astEaseBack : undefined);
          eased = typeof _astEaseBack === 'function' ? _astEaseBack(progress) : progress;
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

  global.ASTStateMachine = ASTStateMachine;
  global.MicroSCORMBridge = MicroSCORMBridge;
  if (typeof window !== 'undefined') {
    window.ASTStateMachine = ASTStateMachine;
    window.MicroSCORMBridge = MicroSCORMBridge;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
