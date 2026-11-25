/**
 * static/player/ast-bridge-cartridge.js
 *
 * St Joseph's AST Vector Media Player — Bridge Cartridge Lifecycle, State Vars, Whiteboard & Export Handlers
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Peer module loaded strictly before static/player/ast-bridge.js.
 * Zero external dependencies; every handler receives (ctx) = { engine, uiController, data, event, global }.
 */

(function (global) {
  'use strict';

  const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

  function reportCartridgeError(engine, err) {
    console.error('[AST-Bridge] Failed to load cartridge:', err);
    if (engine && typeof engine.notifyParent === 'function') {
      engine.notifyParent({
        type: 'CARTRIDGE_LOAD_ERROR',
        message: err && err.message ? err.message : String(err)
      });
    }
  }

  function serializeStageSvg(stageOrMarkup) {
    if (!stageOrMarkup) return '';
    if (typeof stageOrMarkup === 'string') return stageOrMarkup;
    if (typeof stageOrMarkup.outerHTML === 'string') return stageOrMarkup.outerHTML;
    if (typeof XMLSerializer !== 'undefined') {
      try {
        return new XMLSerializer().serializeToString(stageOrMarkup);
      } catch (_) {}
    }
    return '';
  }

  const handlers = Object.create(null);

  // --- Preset & Custom Cartridge Lifecycle ---
  handlers.SET_PRESET = ({ engine, uiController, data }) => {
    if (!data.preset || typeof data.preset !== 'string') return;
    const canonicalPreset = (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.normalizeId === 'function')
      ? global.ASTSceneRegistry.normalizeId(data.preset)
      : data.preset;
    // Guard against a stale boot preset lookup overwriting a freshly mounted custom SWF / Local Vault cartridge
    if (
      canonicalPreset === 'welcome' &&
      engine._customMountedPresetId &&
      engine._mountedSceneId === engine._customMountedPresetId &&
      (Date.now() - (engine._customMountedAt || 0)) < 5000
    ) {
      return;
    }
    if (engine.activePresetId === canonicalPreset && engine._mountedSceneId === canonicalPreset && engine.scene) {
      if (data.play === true && !engine.isPlaying && typeof engine.play === 'function') {
        engine.play();
      } else if (data.play === false && !engine.isContinuousSim && engine.isPlaying && typeof engine.pause === 'function') {
        engine.pause();
      }
      if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
        uiController.updateHeaderPlayUI(Boolean(engine.isPlaying), true);
      }
      return;
    }
    if (typeof engine.loadScene === 'function') {
      Promise.resolve(engine.loadScene(canonicalPreset, data.play !== false))
        .then(() => {
          if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
            uiController.updateHeaderPlayUI(Boolean(engine.isPlaying), true);
          }
        })
        .catch((err) => reportCartridgeError(engine, err));
    }
  };

  const handleLoadCartridge = ({ engine, uiController, data, event }) => {
    if (!data || typeof data !== 'object' || !data.cartridge || typeof data.cartridge !== 'object') return;
    const handled = global.__astHandledCustomCartridgeEvents || (global.__astHandledCustomCartridgeEvents = new WeakSet());
    if ((event && handled.has(event)) || handled.has(data.cartridge)) return;
    if (event) handled.add(event);
    handled.add(data.cartridge);

    const cartridge = data.cartridge;
    const shouldPlay = data.play !== false;

    // Register in RAM immediately; defer Local Vault persistence until after stage mount so I/O never stalls SWF boot
    try {
      if (cartridge.id && global.ASTSceneRegistry && typeof global.ASTSceneRegistry.register === 'function') {
        global.ASTSceneRegistry.register(cartridge.id, {
          id: cartridge.id,
          title: cartridge.title,
          stage: cartridge.stage || 'CUSTOM',
          svgMarkup: cartridge.svgMarkup || cartridge.svgText || '',
          astSource: cartridge.astSource || cartridge.astText || '',
        });
      }
    } catch (regErr) {
      console.warn('[AST-Bridge] Non-fatal registry sync warning:', regErr);
    }

    Promise.resolve()
      .then(() => {
        if (typeof engine.loadSceneData === 'function') {
          return engine.loadSceneData(cartridge, shouldPlay);
        }
        if (cartridge.id && typeof engine.loadScene === 'function') {
          return engine.loadScene(cartridge.id, shouldPlay);
        }
        return null;
      })
      .then(() => {
        if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
          uiController.updateHeaderPlayUI(Boolean(engine.isPlaying), true);
        }
        if (uiController) {
          setTimeout(() => {
            try {
              if (typeof uiController.saveToLocalVault === 'function') {
                uiController.saveToLocalVault(cartridge);
              } else if (typeof uiController.populatePresets === 'function') {
                uiController.populatePresets();
              }
            } catch (vaultErr) {
              console.warn('[AST-Bridge] Non-fatal deferred Local Vault sync warning:', vaultErr);
            }
          }, 0);
        }
      })
      .catch((err) => reportCartridgeError(engine, err));
  };
  handlers.LOAD_CARTRIDGE = handleLoadCartridge;
  handlers.LOAD_CUSTOM_CARTRIDGE = handleLoadCartridge;

  handlers.HOT_RELOAD_SVG = ({ engine, data }) => {
    const svgMarkup = typeof data.svg === 'string'
      ? data.svg
      : (typeof data.svgMarkup === 'string' ? data.svgMarkup : '');
    if (svgMarkup && typeof engine.hotReloadSvg === 'function') {
      engine.hotReloadSvg(svgMarkup);
    }
  };

  handlers.HOT_RELOAD_AST = ({ engine, uiController, data }) => {
    const astInput = data.ast !== undefined ? data.ast : data.astSource;
    if (astInput && typeof engine.hotReloadAst === 'function') {
      engine.hotReloadAst(astInput);
      if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
        uiController.updateHeaderPlayUI(Boolean(engine.isPlaying), true);
      }
    }
  };

  // --- Reactive Variables, Actions & Simulation Control ---
  handlers.SET_VAR = ({ engine, data }) => {
    if (!data.name || typeof data.name !== 'string' || data.value === undefined) return;
    const cleanName = typeof engine.normalizeVarName === 'function'
      ? engine.normalizeVarName(data.name)
      : data.name;
    if (FORBIDDEN_KEYS.has(cleanName) || FORBIDDEN_KEYS.has(data.name)) return;

    let nextVal = data.value;
    if (typeof nextVal === 'number' && !Number.isFinite(nextVal)) return;

    const metaEntry = engine.scene && engine.scene.vars && Object.prototype.hasOwnProperty.call(engine.scene.vars, cleanName)
      ? engine.scene.vars[cleanName]
      : null;
    let clamped = false;
    if (typeof nextVal === 'number' && metaEntry && typeof metaEntry === 'object') {
      if (typeof metaEntry.min === 'number' && nextVal < metaEntry.min) {
        nextVal = metaEntry.min;
        clamped = true;
      }
      if (typeof metaEntry.max === 'number' && nextVal > metaEntry.max) {
        nextVal = metaEntry.max;
        clamped = true;
      }
    }

    if (typeof engine.setMemoryVar === 'function') {
      engine.setMemoryVar(data.name, nextVal);
    } else if (typeof engine.setVar === 'function') {
      engine.setVar(data.name, nextVal);
    } else if (engine.scene && engine.scene.vars) {
      engine.scene.vars[cleanName] = nextVal;
      if (typeof engine.updateComputedVars === 'function') engine.updateComputedVars();
      if (typeof engine.applyBindings === 'function') engine.applyBindings(engine.progress || 0);
      if (typeof engine.render === 'function') engine.render(engine.progress || 0);
    }

    if (data.requestId && typeof engine.notifyParent === 'function') {
      engine.notifyParent({
        type: 'SET_VAR_ACK',
        requestId: data.requestId,
        name: cleanName,
        value: nextVal,
        clamped,
        state: typeof engine.getEngineStateSummary === 'function' ? engine.getEngineStateSummary(false) : null
      });
    }
  };

  handlers.DISPATCH_ACTION = ({ engine, data }) => {
    if (data.action && typeof engine.dispatchAction === 'function') {
      engine.dispatchAction(data.action, data.args);
    }
  };

  const handleResetSim = ({ engine, uiController }) => {
    if (typeof engine.reset === 'function') {
      engine.reset();
    } else if (uiController && typeof uiController.resetSimulation === 'function') {
      uiController.resetSimulation();
    }
  };
  handlers.RESET_SIM = handleResetSim;
  handlers.SIM_RESET = handleResetSim;

  handlers.SIM_ACTION = ({ data }) => {
    const gestures = global.__astGestures || (typeof window !== 'undefined' ? window.__astGestures : null);
    if (!gestures || !gestures.stageSvg || typeof CustomEvent === 'undefined') return;
    if (data.action === 'FEED_FISH') {
      const evt = new CustomEvent('feed_fish', { detail: { x: 300 + Math.random() * 200, y: 100 + Math.random() * 80 } });
      gestures.stageSvg.dispatchEvent(evt);
    } else if (data.action === 'TAP_GLASS') {
      const evt = new CustomEvent('tap_glass', { detail: { x: 400, y: 240 } });
      gestures.stageSvg.dispatchEvent(evt);
    }
  };

  handlers.TOGGLE_XRAY = ({ engine, data }) => {
    if (typeof engine.togglePedagogicalXRay === 'function') {
      engine.togglePedagogicalXRay(typeof data.enabled === 'boolean' ? data.enabled : undefined);
    }
  };

  handlers.INJECT_CHECKPOINT = ({ engine, uiController, data }) => {
    if (data.checkpoint && engine.scene) {
      if (!engine.scene.interactive) engine.scene.interactive = { checkpoints: [] };
      if (!Array.isArray(engine.scene.interactive.checkpoints)) engine.scene.interactive.checkpoints = [];
      engine.scene.interactive.checkpoints.push(data.checkpoint);
      if (uiController && typeof uiController.updateView === 'function') uiController.updateView();
    }
  };

  handlers.SET_DEV_MODE = ({ engine, data }) => {
    if (typeof engine.setDevMode === 'function') {
      engine.setDevMode(Boolean(data.enabled));
    }
  };

  // --- Whiteboard Ink ---
  handlers.TOGGLE_PEN = ({ data }) => {
    const gestures = global.__astGestures || (typeof window !== 'undefined' ? window.__astGestures : null);
    if (!gestures) return;
    gestures.isPenActive = data.enabled !== undefined ? Boolean(data.enabled) : !gestures.isPenActive;
    if (gestures.stageSvg && gestures.stageSvg.style) {
      gestures.stageSvg.style.cursor = gestures.isPenActive ? 'crosshair' : 'default';
    }
  };

  handlers.CLEAR_WHITEBOARD_INK = () => {
    const gestures = global.__astGestures || (typeof window !== 'undefined' ? window.__astGestures : null);
    if (gestures && typeof gestures.clearWhiteboardInk === 'function') gestures.clearWhiteboardInk();
  };

  handlers.UNDO_WHITEBOARD_INK = () => {
    const gestures = global.__astGestures || (typeof window !== 'undefined' ? window.__astGestures : null);
    if (gestures && typeof gestures.undoLastStroke === 'function') gestures.undoLastStroke();
  };

  handlers.EXPORT_WHITEBOARD_INK = () => {
    const gestures = global.__astGestures || (typeof window !== 'undefined' ? window.__astGestures : null);
    if (gestures && typeof gestures.broadcastInkSession === 'function') gestures.broadcastInkSession();
  };

  // --- Stage Inspection & Offline Exports ---
  handlers.GET_STAGE_SVG = ({ engine }) => {
    if (typeof engine.getStageSvg !== 'function' || typeof engine.notifyParent !== 'function') return;
    const svgMarkup = serializeStageSvg(engine.getStageSvg());
    engine.notifyParent({ type: 'STAGE_SVG_RESPONSE', svg: svgMarkup });
  };

  function buildFallbackStageSnapshot(engine) {
    const stageSvg = typeof engine.getStageSvg === 'function' ? engine.getStageSvg() : null;
    if (!stageSvg) return null;
    const vb = (stageSvg.getAttribute && stageSvg.getAttribute('viewBox')) || '0 0 800 480';
    const vbParts = vb.trim().split(/[\s,]+/).map(Number);
    const width = (vbParts.length >= 4 && vbParts[2] > 0) ? vbParts[2] : 800;
    const height = (vbParts.length >= 4 && vbParts[3] > 0) ? vbParts[3] : 480;
    const observedTexts = [];
    const seen = new Set();
    if (typeof stageSvg.querySelectorAll === 'function') {
      const textEls = stageSvg.querySelectorAll('text');
      for (let i = 0; i < textEls.length && observedTexts.length < 24; i++) {
        const t = String(textEls[i].textContent || '').replace(/\s+/g, ' ').trim();
        if (t && !seen.has(t)) {
          seen.add(t);
          observedTexts.push(t);
        }
      }
    }
    const rawSvg = serializeStageSvg(stageSvg);
    const innerMatch = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    const svgMarkup = (innerMatch ? innerMatch[1] : rawSvg).slice(0, 56000);
    return {
      frameNumber: Math.max(1, Math.round(Number(engine.vars && engine.vars.swf_frame) || 1)),
      totalFrames: Math.max(1, Math.round(Number(engine.vars && engine.vars.swf_totalframes) || 1)),
      frameLabel: '',
      width,
      height,
      bg: '#0f172a',
      svgMarkup,
      nodeCount: (svgMarkup.match(/<(?:path|rect|circle|ellipse|polygon|line|text)\b/gi) || []).length,
      pathCount: (svgMarkup.match(/<path\b/gi) || []).length,
      truncated: rawSvg.length > 56000,
      observedTexts,
      observedButtons: [],
      observedVars: {},
      fingerprint: `fb_${svgMarkup.length}_${observedTexts.length}`,
    };
  }

  handlers.CAPTURE_SWF_STATE = ({ engine, data }) => {
    if (typeof engine.notifyParent !== 'function') return;
    const requestId = data && data.requestId ? data.requestId : undefined;
    try {
      let snapshot = null;
      if (engine._avm1Vm && typeof engine._avm1Vm.captureDistillationSnapshot === 'function') {
        snapshot = engine._avm1Vm.captureDistillationSnapshot({
          maxNodes: data && data.maxNodes,
          maxChars: data && data.maxChars,
        });
      } else {
        snapshot = buildFallbackStageSnapshot(engine);
      }
      engine.notifyParent({
        type: 'SWF_STATE_CAPTURED',
        requestId,
        ok: Boolean(snapshot && snapshot.svgMarkup),
        snapshot,
        error: snapshot && snapshot.svgMarkup ? undefined : 'No visible vector geometry detected on the current stage frame.',
      });
    } catch (err) {
      engine.notifyParent({
        type: 'SWF_STATE_CAPTURED',
        requestId,
        ok: false,
        snapshot: null,
        error: err && err.message ? err.message : String(err),
      });
    }
  };

  handlers.SWEEP_SWF_STATES = ({ engine, data }) => {
    if (typeof engine.notifyParent !== 'function') return;
    const requestId = data && data.requestId ? data.requestId : undefined;
    try {
      let snapshots = [];
      if (engine._avm1Vm && typeof engine._avm1Vm.sweepDistillationStates === 'function') {
        snapshots = engine._avm1Vm.sweepDistillationStates({
          maxStates: data && data.maxStates,
          budgetMs: data && data.budgetMs,
        });
      } else {
        const fb = buildFallbackStageSnapshot(engine);
        if (fb && fb.svgMarkup) snapshots = [fb];
      }
      engine.notifyParent({
        type: 'SWF_STATES_SWEPT',
        requestId,
        ok: snapshots.length > 0,
        snapshots,
        error: snapshots.length > 0 ? undefined : 'Could not detect visible vector keyframes in this SWF.',
      });
    } catch (err) {
      engine.notifyParent({
        type: 'SWF_STATES_SWEPT',
        requestId,
        ok: false,
        snapshots: [],
        error: err && err.message ? err.message : String(err),
      });
    }
  };

  const dispatchForwardedKey = ({ engine, data }) => {
    if (!engine) return;
    const kind = data && data.kind === 'keyup' ? 'keyup' : 'keydown';
    const channel = kind === 'keyup' ? 'key-up' : 'key-down';
    const payload = {
      code: typeof data.code === 'string' ? data.code : '',
      key: typeof data.key === 'string' ? data.key : '',
      keyCode: typeof data.keyCode === 'number' ? data.keyCode : 0,
    };
    if (engine.gestures && typeof engine.gestures.dispatchExternalMediaInput === 'function') {
      if (engine.gestures.dispatchExternalMediaInput(channel, payload)) return;
    }
    if (engine._avm1Vm && typeof engine._avm1Vm.handleForwardedKeyEvent === 'function') {
      engine._avm1Vm.handleForwardedKeyEvent(kind, payload);
    }
  };

  const dispatchReleaseAll = ({ engine }) => {
    if (!engine) return;
    if (engine.gestures && typeof engine.gestures.dispatchExternalMediaInput === 'function') {
      if (engine.gestures.dispatchExternalMediaInput('release-all', {})) return;
    }
    if (engine._avm1Vm && typeof engine._avm1Vm.releaseAllInputs === 'function') {
      engine._avm1Vm.releaseAllInputs();
    }
  };

  handlers.SWF_KEY_EVENT = dispatchForwardedKey;
  handlers.MEDIA_KEY_EVENT = dispatchForwardedKey;
  handlers.SWF_RELEASE_INPUTS = dispatchReleaseAll;
  handlers.MEDIA_RELEASE_INPUTS = dispatchReleaseAll;

  handlers.DOWNLOAD_OFFLINE_ZIP = ({ engine }) => {
    if (typeof engine.downloadOfflineZipSuite === 'function') {
      engine.downloadOfflineZipSuite();
    }
  };

  handlers.REQUEST_JOTTER_CSV = ({ engine, data }) => {
    if (typeof engine.exportLabCsv !== 'function' || typeof engine.notifyParent !== 'function') return;
    const csvRes = engine.exportLabCsv();
    if (!csvRes || typeof csvRes !== 'object') return;
    engine.notifyParent({
      type: 'JOTTER_CSV_RESPONSE',
      sceneId: csvRes.sceneId || '',
      sceneTitle: csvRes.sceneTitle || '',
      rowCount: Number(csvRes.rowCount || 0),
      csv: String(csvRes.csv || ''),
      nodePath: `lab/${csvRes.sceneId || 'session'}`,
      download: Boolean(data.download)
    });
  };

  handlers.EXPORT_STANDALONE_APPLET = ({ engine }) => {
    if (typeof engine.exportStandaloneApplet !== 'function') return;
    const lazy = global.ASTLazyLoader || (typeof window !== 'undefined' ? window.ASTLazyLoader : undefined);
    if (!global.ASTExporter && lazy && typeof lazy.ensureExporter === 'function') {
      lazy.ensureExporter()
        .then(() => engine.exportStandaloneApplet())
        .catch((err) => console.warn('[AST-Bridge] Failed lazy-loading exporter:', err));
    } else {
      engine.exportStandaloneApplet();
    }
  };

  global.ASTBridgeCartridgeHandlers = handlers;
  if (typeof window !== 'undefined') {
    window.ASTBridgeCartridgeHandlers = handlers;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
