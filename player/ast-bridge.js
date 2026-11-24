/**
 * static/player/ast-bridge.js
 *
 * St Joseph's AST Vector Media Player — PostMessage Host-Iframe Gateway Orchestrator
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Thin, fault-isolated postMessage router coordinating modular handler peers:
 * - static/player/ast-bridge-playback.js  (Playback, Audio, Physics, Camera, Accessibility & UI)
 * - static/player/ast-bridge-cartridge.js (Presets, Custom Cartridges, Vars, Ink, Stage & Exports)
 * - static/player/ast-bridge-telemetry.js (Profiler Capture, Perf HUD, WebMCP & AI Actuation)
 */

(function (global) {
  'use strict';

  const FORBIDDEN_COMMANDS = new Set(['__proto__', 'constructor', 'prototype']);
  const customHandlers = Object.create(null);

  /**
   * Origin gatekeeper for zero-egress iframe <-> host communication.
   */
  function isAllowedOrigin(event, engine) {
    if (!event) return false;
    const expectedOrigin = engine && engine.targetOrigin;
    if (!expectedOrigin || expectedOrigin === '*') return true;
    if (event.origin === expectedOrigin) return true;
    const winOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
    if (winOrigin && winOrigin !== 'null' && event.origin === winOrigin) return true;
    // Allow sandboxed null-origin frames only when window.location.origin is also null/empty
    if (!winOrigin || winOrigin === 'null') return true;
    return false;
  }

  /**
   * Merges peer handler tables into a prototype-free dispatch dictionary.
   */
  function buildHandlerRegistry() {
    const table = Object.create(null);
    const peerNames = [
      'ASTBridgePlaybackHandlers',
      'ASTBridgeCartridgeHandlers',
      'ASTBridgeTelemetryHandlers',
    ];
    for (let i = 0; i < peerNames.length; i++) {
      const peer = global[peerNames[i]] || (typeof window !== 'undefined' ? window[peerNames[i]] : null);
      if (!peer || typeof peer !== 'object') continue;
      const keys = Object.keys(peer);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (!FORBIDDEN_COMMANDS.has(key) && typeof peer[key] === 'function') {
          table[key] = peer[key];
        }
      }
    }
    const customKeys = Object.keys(customHandlers);
    for (let k = 0; k < customKeys.length; k++) {
      const key = customKeys[k];
      if (!FORBIDDEN_COMMANDS.has(key) && typeof customHandlers[key] === 'function') {
        table[key] = customHandlers[key];
      }
    }
    // Core offline export fallback ensures DOWNLOAD_OFFLINE_ZIP remains wired even in minimal standalone setups
    if (!table.DOWNLOAD_OFFLINE_ZIP) {
      table.DOWNLOAD_OFFLINE_ZIP = ({ engine }) => {
        if (engine && typeof engine.downloadOfflineZipSuite === 'function') {
          engine.downloadOfflineZipSuite();
        }
      };
    }
    return table;
  }

  /**
   * Registers additional command handlers programmatically (safe against prototype keys).
   */
  function registerHandlers(handlerMap) {
    if (!handlerMap || typeof handlerMap !== 'object') return;
    const keys = Object.keys(handlerMap);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!FORBIDDEN_COMMANDS.has(key) && typeof handlerMap[key] === 'function') {
        customHandlers[key] = handlerMap[key];
      }
    }
  }

  /**
   * Mounts the origin-validated, fault-isolated postMessage gateway.
   * Idempotent: re-calling replaces any prior bridge listener on this window so messages are never double-handled.
   * Returns a controller handle `{ destroy, dispatch, handlers }` for clean teardown & direct testing.
   */
  function setupPostMessageBridge(engine, uiController) {
    if (typeof window === 'undefined') return null;

    if (typeof window.__astBridgeDestroy === 'function') {
      try { window.__astBridgeDestroy(); } catch (_) {}
    }

    window.__astBridgeActive = true;
    const handlers = buildHandlerRegistry();

    const dispatch = (data, event) => {
      if (!data || typeof data !== 'object') return false;
      const msgType = typeof data.type === 'string' ? data.type : '';
      if (!msgType || FORBIDDEN_COMMANDS.has(msgType)) return false;
      const fn = handlers[msgType];
      if (typeof fn !== 'function') return false;
      try {
        fn({ engine, uiController, data, event: event || null, global });
        return true;
      } catch (err) {
        console.error(`[AST-Bridge] Handler error for "${msgType}":`, err);
        if (data.requestId && engine && typeof engine.notifyParent === 'function') {
          try {
            engine.notifyParent({
              type: 'BRIDGE_COMMAND_ERROR',
              command: msgType,
              requestId: data.requestId,
              message: err && err.message ? err.message : String(err)
            });
          } catch (_) {}
        }
        return false;
      }
    };

    const onMessage = (event) => {
      if (!isAllowedOrigin(event, engine)) {
        console.warn('[AST-Player] Rejected unauthorized cross-origin message from:', event && event.origin);
        return;
      }
      dispatch(event.data, event);
    };

    window.addEventListener('message', onMessage);

    const destroy = () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('message', onMessage);
      }
      if (typeof window !== 'undefined' && window.__astBridgeDestroy === destroy) {
        window.__astBridgeDestroy = null;
        window.__astBridgeActive = false;
      }
    };

    window.__astBridgeDestroy = destroy;
    return { destroy, dispatch, handlers };
  }

  const ASTPostMessageBridge = {
    isAllowedOrigin,
    buildHandlerRegistry,
    registerHandlers,
    setupPostMessageBridge,
  };

  global.ASTPostMessageBridge = ASTPostMessageBridge;
  global.setupPostMessageBridge = setupPostMessageBridge;
  if (typeof window !== 'undefined') {
    window.ASTPostMessageBridge = ASTPostMessageBridge;
    window.setupPostMessageBridge = setupPostMessageBridge;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
