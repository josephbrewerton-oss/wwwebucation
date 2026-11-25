/**
 * static/player/ast-lazy-loader.js
 *
 * St Joseph's AST Vector Media Player — On-Demand Peer Module Lazy Loader
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Defers non-critical authoring, broadcast, export, voice, PhET, profiler,
 * and AI-director scripts off the initial cartridge boot path while keeping
 * 100% offline/air-gapped compatibility via Service Worker precaching.
 */

(function (global) {
  'use strict';

  const LAZY_MODULES = Object.freeze({
    compiler: { file: 'ast-compiler.js', check: () => Boolean(global.ASTSlideScriptCompiler) },
    phetBridge: { file: 'ast-phet-bridge.js', check: () => Boolean(global.ASTPhetBridge) },
    profiler: { file: 'ast-profiler.js', check: () => Boolean(global.ASTProfiler) },
    exporter: { file: 'ast-exporter.js', check: () => Boolean(global.ASTExporter) },
    aiDirector: { file: 'ast-ai-director.js', check: () => Boolean(global.ASTAiDirector) },
    webrtc: { file: 'ast-webrtc-bus.js', check: () => Boolean(global.ASTWebRTCBus) },
    obs: { file: 'obs-controller.js', check: () => Boolean(global.OBSBroadcastController) },
    studioMatcher: { file: 'player-ui-studio-matcher.js', check: () => Boolean(global.ASTPlayerUIStudioMatcher) },
    studioRemix: { file: 'player-ui-studio-remix.js', check: () => Boolean(global.ASTPlayerUIStudioRemix) },
    studio: { file: 'player-ui-studio.js', check: () => Boolean(global.ASTPlayerUIStudio) },
    voice: { file: 'player-ui-voice.js', check: () => Boolean(global.ASTPlayerUIVoice) },
    broadcast: { file: 'player-ui-broadcast.js', check: () => Boolean(global.ASTPlayerUIBroadcast) },
    eventBus: { file: 'ast-event-bus.js', check: () => Boolean(global.ASTEventBus) },
    avm1Vm: { file: 'ast-avm1-vm.js', check: () => Boolean(global.ASTAVM1Runtime) },
    avm2Vm: { file: 'ast-avm2-vm.js', check: () => Boolean(global.ASTAVM2Runtime) },
  });

  const SCRIPT_BASE_URL = (() => {
    try {
      if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
        return document.currentScript.src.replace(/[^/]+$/, '');
      }
      if (typeof window !== 'undefined' && window.location && window.location.pathname) {
        return window.location.pathname.includes('/player/') ? './' : './player/';
      }
    } catch (_) {}
    return './player/';
  })();

  const inflight = new Map();

  function loadScript(filename, globalCheck) {
    try {
      if (typeof globalCheck === 'function' && globalCheck()) {
        return Promise.resolve(true);
      }
    } catch (_) {}

    if (inflight.has(filename)) {
      return inflight.get(filename);
    }

    if (typeof document === 'undefined' || !document.createElement) {
      return Promise.resolve(false);
    }

    const p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${SCRIPT_BASE_URL}${filename}`;
      s.async = false;
      s.onload = () => resolve(true);
      s.onerror = () => {
        inflight.delete(filename);
        reject(new Error(`[ASTLazyLoader] Failed to load ${filename}`));
      };
      (document.head || document.body || document.documentElement).appendChild(s);
    });

    inflight.set(filename, p);
    return p;
  }

  async function loadKeys(keys) {
    for (const key of keys) {
      const entry = LAZY_MODULES[key];
      if (!entry) continue;
      await loadScript(entry.file, entry.check);
    }
    return true;
  }

  async function ensureStudio(ui) {
    await loadKeys(['compiler', 'exporter', 'studioMatcher', 'studioRemix', 'studio']);
    if (ui) {
      const studioMod = global.ASTPlayerUIStudio || (typeof window !== 'undefined' ? window.ASTPlayerUIStudio : null);
      if (studioMod && Array.isArray(studioMod.DEFAULT_STARTER_TEMPLATES) && (!ui.starterTemplates || ui.starterTemplates.length === 0)) {
        ui.starterTemplates = studioMod.DEFAULT_STARTER_TEMPLATES.map((t) => ({ ...t }));
      }
      if (!ui._studioEventsBound && typeof ui.bindStudioDOMEvents === 'function') {
        ui.bindStudioDOMEvents(ui.elements && ui.elements.stageSvg);
      }
    }
    return global.ASTPlayerUIStudio || null;
  }

  async function ensureBroadcast(ui) {
    await loadKeys(['obs', 'webrtc', 'broadcast']);
    if (ui) {
      if (!ui._broadcastEventsBound && typeof ui.bindBroadcastDOMEvents === 'function') {
        ui.bindBroadcastDOMEvents();
      }
      if (!ui._obsBroadcastInitialized && typeof ui.initObsBroadcast === 'function') {
        ui._obsBroadcastInitialized = true;
        ui.initObsBroadcast();
      }
    }
    return global.ASTPlayerUIBroadcast || null;
  }

  async function ensureVoice() {
    await loadKeys(['voice']);
    return global.ASTPlayerUIVoice || null;
  }

  async function ensureExporter() {
    await loadKeys(['exporter']);
    return global.ASTExporter || null;
  }

  async function ensureAiDirector() {
    await loadKeys(['aiDirector']);
    return global.ASTAiDirector || null;
  }

  async function ensureProfiler() {
    await loadKeys(['profiler']);
    return global.ASTProfiler || null;
  }

  async function ensureCompiler() {
    await loadKeys(['compiler']);
    return global.ASTSlideScriptCompiler || null;
  }

  async function ensurePhetBridge() {
    await loadKeys(['phetBridge']);
    return global.ASTPhetBridge || null;
  }

  async function ensureEventBus() {
    await loadKeys(['eventBus']);
    return global.ASTEventBus || null;
  }

  async function ensureAvm1Vm() {
    await loadKeys(['avm1Vm']);
    return global.ASTAVM1Runtime || null;
  }

  async function ensureAvm2Vm() {
    await loadKeys(['eventBus', 'avm2Vm']);
    return global.ASTAVM2Runtime || null;
  }

  const ASTLazyLoader = {
    LAZY_MODULES,
    SCRIPT_BASE_URL,
    loadScript,
    loadKeys,
    ensureStudio,
    ensureBroadcast,
    ensureVoice,
    ensureExporter,
    ensureAiDirector,
    ensureProfiler,
    ensureCompiler,
    ensurePhetBridge,
    ensureEventBus,
    ensureAvm1Vm,
    ensureAvm2Vm,
  };

  global.ASTLazyLoader = ASTLazyLoader;
  if (typeof window !== 'undefined') {
    window.ASTLazyLoader = ASTLazyLoader;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTLazyLoader };
  }
})(typeof window !== 'undefined' ? window : globalThis);
