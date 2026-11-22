// scripts/invariants/harness.ts
/**
 * Shared headless sandbox & runtime loader helpers for St Joseph's
 * Simulation Engine & Physical Invariant test suites.
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';

export const AST_PLAYER_RUNTIME_MODULES = [
  'ast-profiler.js',
  'ast-audio-speech.js',
  'ast-physics.js',
  'ast-expr.js',
  'ast-bytecode-decoder.js',
  'ast-parser.js',
  'ast-3d.js',
  'ast-bridge.js',
  'ast-exporter.js',
  'ast-hud-controls.js',
  'ast-ai-director.js',
  'ast-file-ingest.js',
  'ast-svg-integrity.js',
  'ast-loader.js',
  'ast-state-scorm.js',
  'ast-lab-telemetry.js',
  'ast-scene-mount.js',
  'ast-binding-runtime.js',
  'ast-engine.js',
];

export function loadAstPlayerRuntimeIntoSandbox(sandbox: any, isExistingContext = false) {
  const ctx = isExistingContext ? sandbox : vm.createContext(sandbox);
  for (const mod of AST_PLAYER_RUNTIME_MODULES) {
    const filePath = path.join(process.cwd(), 'static', 'player', mod);
    const modCode = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(modCode, ctx, { filename: `static/player/${mod}` });
  }
  return ctx;
}

export const SITE_GESTURES_RUNTIME_MODULES = [
  'site-gestures-profile.js',
  'site-gestures-whiteboard.js',
  'site-gestures-hud.js',
  'site-gestures-actions.js',
  'site-gestures-input.js',
  'site-gestures.js',
];

export function loadSiteGesturesRuntimeIntoSandbox(sandbox: any, isExistingContext = false) {
  const ctx = isExistingContext ? sandbox : vm.createContext(sandbox);
  for (const mod of SITE_GESTURES_RUNTIME_MODULES) {
    const filePath = path.join(process.cwd(), 'static', 'player', mod);
    const modCode = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(modCode, ctx, { filename: `static/player/${mod}` });
  }
  return ctx;
}

export function createHeadlessEngine() {
  const sandbox: any = {
    console,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Map,
    Set,
    WeakSet,
    ArrayBuffer,
    DataView,
    Float32Array,
    Float64Array,
    Int32Array,
    Uint8Array,
    TextDecoder,
    TextEncoder,
    RegExp,
    Error,
    JSON,
    URLSearchParams,
    parseFloat,
    parseInt,
    isNaN,
    isFinite,
    setTimeout,
    clearTimeout,
    performance: { now: () => Date.now() },
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  loadAstPlayerRuntimeIntoSandbox(sandbox);
  return new sandbox.ASTVectorPlayerEngine({ container: null, autoplay: false, voiceEnabled: false });
}
