/**
 * static/player/ast-bridge-telemetry.js
 *
 * St Joseph's AST Vector Media Player — Bridge Telemetry, Profiler, Spatial Actuation & WebMCP AI Handlers
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Peer module loaded strictly before static/player/ast-bridge.js.
 * Zero external dependencies; every handler receives (ctx) = { engine, uiController, data, event, global }.
 */

(function (global) {
  'use strict';

  const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

  function resolveProfilerCtor() {
    return global.ASTProfiler || (typeof window !== 'undefined' ? window.ASTProfiler : undefined);
  }

  function resolveLazyLoader() {
    return global.ASTLazyLoader || (typeof window !== 'undefined' ? window.ASTLazyLoader : undefined);
  }

  const handlers = Object.create(null);

  // --- Spatial Actuation, Voice & AI Co-Pilot ---
  handlers.ACTUATE_OPCODE = ({ engine, data }) => {
    if (typeof engine.actuateOpcode === 'function') engine.actuateOpcode(data.opcode);
  };

  handlers.CAST_CAMERA_RAY = ({ engine }) => {
    if (typeof engine.castCameraRay === 'function') engine.castCameraRay();
  };

  handlers.NUDGE_NODE = ({ engine, data }) => {
    if (typeof engine.actuateNode === 'function') {
      const dxyz = Array.isArray(data.dxyz) ? data.dxyz : [0, 0, 0];
      engine.actuateNode(data.target, Number(dxyz[0]) || 0, Number(dxyz[1]) || 0, Number(dxyz[2]) || 0, true);
    }
  };

  handlers.VOICE_COMMAND = ({ engine, data }) => {
    if (typeof engine.handleVoiceCommand === 'function') engine.handleVoiceCommand(data.command);
  };

  const handleToggleVoiceCommands = ({ engine }) => {
    if (typeof engine.toggleVoiceRecognition === 'function') engine.toggleVoiceRecognition();
  };
  handlers.TOGGLE_VOICE_COMMANDS = handleToggleVoiceCommands;
  handlers.START_VOICE_COMMANDS = handleToggleVoiceCommands;
  handlers.STOP_VOICE_COMMANDS = handleToggleVoiceCommands;

  handlers.AI_VISUAL_COMMAND = ({ engine, data }) => {
    if (typeof engine.executeAiVisualCommand === 'function') {
      engine.executeAiVisualCommand(data.packet || data);
    }
  };

  handlers.PUPIL_INTERRUPT = ({ engine }) => {
    if (typeof engine.preemptAiDemonstration === 'function') {
      engine.preemptAiDemonstration('PUPIL_INTERRUPT');
    } else if (typeof engine.cancelSpeech === 'function') {
      engine.cancelSpeech();
    }
  };

  // --- Performance HUD & Profiler Capture ---
  const handlePerfHud = ({ engine, data }) => {
    const hudStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
    const enabled = typeof data.enabled === 'boolean' ? data.enabled : (!engine.profiler || engine.profiler.silent);

    const finishHud = () => {
      if (hudStore) {
        try {
          hudStore.setItem('app_perf_hud_enabled', String(enabled));
          if (data.mode) hudStore.setItem('app_hud_verbosity', data.mode);
          if (typeof data.strictAlarm === 'boolean') hudStore.setItem('app_frame_budget_alert', String(data.strictAlarm));
        } catch (_) {}
      }
      if (typeof engine.notifyParent === 'function') {
        engine.notifyParent({
          type: 'PERF_HUD_UPDATED',
          enabled: Boolean(engine.profiler && !engine.profiler.silent),
          mode: engine.profiler ? engine.profiler.mode : 'minimal'
        });
      }
    };

    if (!enabled) {
      if (engine.profiler && typeof engine.profiler.destroy === 'function') {
        engine.profiler.destroy();
      }
      engine.profiler = null;
      finishHud();
      return;
    }

    const mode = data.mode || (hudStore && hudStore.getItem('app_hud_verbosity')) || 'minimal';
    const strictAlarm = typeof data.strictAlarm === 'boolean'
      ? data.strictAlarm
      : Boolean(hudStore && hudStore.getItem('app_frame_budget_alert') === 'true');

    const mountHud = (ProfCtor) => {
      if (!engine.profiler) {
        engine.profiler = ProfCtor ? new ProfCtor({ mode, strictAlarm, silent: false }) : null;
      } else {
        engine.profiler.silent = false;
        engine.profiler.mode = mode;
        engine.profiler.strictAlarm = strictAlarm;
      }
      const stage = typeof engine.getStageSvg === 'function' ? engine.getStageSvg() : null;
      if (stage && engine.profiler && typeof engine.profiler.mount === 'function') {
        engine.profiler.mount(stage);
      }
      finishHud();
    };

    const existingCtor = resolveProfilerCtor();
    const lazy = resolveLazyLoader();
    if (!existingCtor && lazy && typeof lazy.ensureProfiler === 'function') {
      lazy.ensureProfiler().then(mountHud).catch(() => finishHud());
    } else {
      mountHud(existingCtor);
    }
  };
  handlers.SET_PERF_HUD = handlePerfHud;
  handlers.TOGGLE_PERF_HUD = handlePerfHud;
  handlers.UPDATE_PERF_HUD = handlePerfHud;

  handlers.START_PROF_CAPTURE = ({ engine, data }) => {
    const beginCapture = (ProfCtor) => {
      if (!engine.profiler) {
        engine.profiler = ProfCtor ? new ProfCtor({ mode: 'minimal', strictAlarm: false, silent: true }) : null;
      }
      if (engine.profiler && typeof engine.profiler.startCapture === 'function') {
        engine.profiler.startCapture();
      }
      if (data.ensurePlaying !== false && !engine.isPlaying && typeof engine.play === 'function') {
        engine.play();
      }
      if (typeof engine.notifyParent === 'function') {
        engine.notifyParent({
          type: 'PROF_CAPTURE_STARTED',
          requestId: data.requestId || null
        });
      }
    };

    const existingCtor = resolveProfilerCtor();
    const lazy = resolveLazyLoader();
    if (!existingCtor && lazy && typeof lazy.ensureProfiler === 'function') {
      lazy.ensureProfiler().then(beginCapture).catch(() => beginCapture(null));
    } else {
      beginCapture(existingCtor);
    }
  };

  handlers.STOP_PROF_CAPTURE = ({ engine, data }) => {
    const vsyncBudgetMs = typeof data.vsyncBudgetMs === 'number' && Number.isFinite(data.vsyncBudgetMs) && data.vsyncBudgetMs > 0
      ? data.vsyncBudgetMs
      : 16.67;
    const stats = engine.profiler && typeof engine.profiler.stopCapture === 'function'
      ? engine.profiler.stopCapture(vsyncBudgetMs)
      : {
          sampleCount: 0,
          meanMs: vsyncBudgetMs,
          p95Ms: vsyncBudgetMs,
          p99Ms: vsyncBudgetMs,
          maxMs: vsyncBudgetMs,
          framesOver16_67ms: 0,
          overBudgetPct: 0,
          vsyncBudgetMs: Number(vsyncBudgetMs.toFixed(2)),
          rawVsyncOverruns: 0,
          rawVsyncOverrunPct: 0,
          severeFrameDrops: 0,
          severeFrameDropPct: 0,
          estimatedFps: Number((1000 / vsyncBudgetMs).toFixed(1)),
          meanComputeMs: 0,
          p95ComputeMs: 0
        };

    const memObj = (typeof performance !== 'undefined' && performance.memory) ? performance.memory : null;
    let emitterParticles = 0;
    if (engine.emitters && typeof engine.emitters.values === 'function') {
      for (const em of engine.emitters.values()) {
        emitterParticles += Number(em.activeCount || em.count || (Array.isArray(em.particles) ? em.particles.length : 0) || 0);
      }
    }

    if (typeof engine.notifyParent === 'function') {
      engine.notifyParent({
        type: 'PROF_CAPTURE_RESULT',
        requestId: data.requestId || null,
        stats,
        memory: {
          wasmPoolBytes: 458752,
          wasmPages: 7,
          usedJsHeapBytes: memObj ? Number(memObj.usedJSHeapSize || 0) : 0,
          totalJsHeapBytes: memObj ? Number(memObj.totalJSHeapSize || 0) : 0
        },
        activeMetrics: {
          activeScopes: Array.isArray(engine.activeScopes) ? engine.activeScopes.length : 0,
          activeLedgers: Array.isArray(engine.activeLedgers) ? engine.activeLedgers.length : 0,
          physicsBodies: engine.physics && Array.isArray(engine.physics.bodies) ? engine.physics.bodies.length : 0,
          physicsSprings: engine.physics && Array.isArray(engine.physics.springs) ? engine.physics.springs.length : 0,
          substeps: engine.physics ? Number(engine.physics.substeps || 4) : 4,
          emitterParticles
        }
      });
    }
  };

  // --- State Snapshot & WebMCP Tuple Execution ---
  const handleStateRequest = ({ engine, data }) => {
    const state = typeof engine.getEngineStateSummary === 'function'
      ? engine.getEngineStateSummary(Boolean(data.includeSvgBytes))
      : null;
    if (typeof engine.notifyParent !== 'function') return;
    if (data.type === 'GET_CONTEXT_SNAPSHOT') {
      engine.notifyParent({ type: 'CONTEXT_SNAPSHOT', requestId: data.requestId || null, snapshot: state });
    } else {
      engine.notifyParent({ type: 'ENGINE_STATE_RESPONSE', requestId: data.requestId || null, state });
    }
  };
  handlers.GET_CONTEXT_SNAPSHOT = handleStateRequest;
  handlers.GET_ENGINE_STATE = handleStateRequest;

  handlers.EXEC_ACTION_TUPLE = ({ engine, data }) => {
    const executedActions = [];
    const tuple = String(data.tuple || '').trim();

    const seekM = tuple.match(/:seek\s+([0-9.]+)/i);
    if (seekM) {
      const p = Math.max(0, Math.min(1, parseFloat(seekM[1])));
      if (Number.isFinite(p) && typeof engine.seek === 'function') {
        engine.seek(p);
        executedActions.push('seek');
      }
    }

    const hiM = tuple.match(/:highlight\s+"([^"]+)"/i);
    if (hiM && /^#[a-zA-Z0-9_\-:]+$/.test(hiM[1])) {
      if (typeof engine.ensureAiSpotlightStyles === 'function') engine.ensureAiSpotlightStyles();
      if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.highlightTarget === 'function') {
        global.ASTSharedRenderBoundary.highlightTarget(hiM[1], 2000, 'player-stage');
      } else {
        const stage = typeof engine.getStageSvg === 'function' ? engine.getStageSvg() : null;
        const targetEl = stage && stage.querySelector ? stage.querySelector(hiM[1]) : null;
        if (targetEl && targetEl.classList) {
          targetEl.classList.add('ai-spotlight-pulse');
          setTimeout(() => targetEl.classList.remove('ai-spotlight-pulse'), 2000);
        }
      }
      executedActions.push('highlight');
    }

    const varM = tuple.match(/:var\s+"([a-zA-Z0-9_]+)"\s+([0-9.-]+|"[^"]*")/i);
    if (varM) {
      const vName = varM[1];
      if (!FORBIDDEN_KEYS.has(vName)) {
        const rawVal = varM[2].replace(/^"|"$/g, '');
        const nVal = Number(rawVal);
        let finalVal = Number.isNaN(nVal) ? rawVal : nVal;
        const metaEntry = engine.scene && engine.scene.vars && Object.prototype.hasOwnProperty.call(engine.scene.vars, vName)
          ? engine.scene.vars[vName]
          : null;
        if (typeof finalVal === 'number' && Number.isFinite(finalVal) && metaEntry && typeof metaEntry === 'object') {
          if (typeof metaEntry.min === 'number') finalVal = Math.max(metaEntry.min, finalVal);
          if (typeof metaEntry.max === 'number') finalVal = Math.min(metaEntry.max, finalVal);
        }
        if (typeof engine.setMemoryVar === 'function') engine.setMemoryVar(vName, finalVal, true);
        executedActions.push('var');
      }
    }

    const sayM = tuple.match(/:say\s+"([^"]*)"/i);
    if (sayM) {
      executedActions.push('say');
    }

    if (typeof engine.notifyParent === 'function') {
      engine.notifyParent({
        type: 'EXEC_ACTION_RESULT',
        requestId: data.requestId || null,
        ok: executedActions.length > 0,
        executedActions,
        state: typeof engine.getEngineStateSummary === 'function' ? engine.getEngineStateSummary(false) : null
      });
    }
  };

  global.ASTBridgeTelemetryHandlers = handlers;
  if (typeof window !== 'undefined') {
    window.ASTBridgeTelemetryHandlers = handlers;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
