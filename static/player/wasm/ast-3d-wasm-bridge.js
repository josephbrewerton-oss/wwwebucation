/**
 * static/player/wasm/ast-3d-wasm-bridge.js
 * High-Performance WebAssembly 3D Kernel Bridge
 * Conforms to docs/WASM_ARCHITECTURE_CONTRACT.md (Page 4 Memory Layout: 0x040000)
 */
import { AST_3D_WASM_BASE64 } from './ast-3d-engine.bin.js';

class AST3DWasmBridgeImpl {
  constructor() {
    this.isReady = false;
    this.memory = null;
    this.exports = null;
    this.f32View = null;
    this.i32View = null;
    this.IN_PTR = 0x040000;
    this.OUT_PTR = 0x044000;
    this.lastCamera = {
      yaw: -9999,
      pitch: -9999,
      roll: -9999,
      dist: -9999,
      fov: -9999,
      cx: -9999,
      cy: -9999,
    };
    this.init().catch(function(err) {
      console.warn('[WASM 3D Bridge] Init warning:', err);
    });
  }

  async init() {
    if (this.isReady) return true;
    try {
      let binaryBytes = null;
      if (typeof fetch === 'function' && typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
        const basePath = (typeof window !== 'undefined' && (window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__)) || (typeof document !== 'undefined' && document.querySelector('base')?.getAttribute('href')) || '/wwwebucation/';
        const cleanBase = basePath.endsWith('/') ? basePath : basePath + '/';
        const candidates = [
          `${cleanBase}static/player/wasm/ast-3d-engine.wasm`,
          `${cleanBase}player/wasm/ast-3d-engine.wasm`,
          './ast-3d-engine.wasm',
          './wasm/ast-3d-engine.wasm',
          'wasm/ast-3d-engine.wasm',
          '/player/wasm/ast-3d-engine.wasm',
        ];
        for (const url of candidates) {
          try {
            const resp = await fetch(url);
            if (resp.ok) {
              const ab = await resp.arrayBuffer();
              binaryBytes = new Uint8Array(ab);
              break;
            }
          } catch (_) {}
        }
      }

      if (!binaryBytes || binaryBytes.length === 0) {
        if (typeof atob === 'function') {
          const binStr = atob(AST_3D_WASM_BASE64);
          const len = binStr.length;
          binaryBytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            binaryBytes[i] = binStr.charCodeAt(i);
          }
        }
      }

      const wasmRes = await WebAssembly.instantiate(binaryBytes);
      const instance = wasmRes.instance || wasmRes;
      this.exports = instance.exports;
      this.memory = this.exports.memory;
      this.f32View = new Float32Array(this.memory.buffer);
      this.i32View = new Int32Array(this.memory.buffer);
      this.isReady = true;

      if (typeof window !== 'undefined') {
        window.AST3DWasmBridge = this;
      }
      return true;
    } catch (err) {
      console.warn('WASM 3D initialization fallback to JS math:', err);
      this.isReady = false;
      return false;
    }
  }

  updateCamera(camera, cx, cy, orbitOffset) {
    if (!this.isReady || !this.exports) return;
    cx = cx !== undefined ? cx : 400;
    cy = cy !== undefined ? cy : 240;
    const yawBase = (camera && camera.yaw) || 0;
    const pitchBase = (camera && camera.pitch) || 0;
    const rollBase = (camera && camera.roll) || 0;
    const distBase = (camera && camera.distance) || 450;
    const fov = (camera && camera.fov) || 60;

    const totalYaw = yawBase + (orbitOffset && orbitOffset.yawOffset ? orbitOffset.yawOffset : 0);
    const totalPitch = Math.max(-85, Math.min(85, pitchBase + (orbitOffset && orbitOffset.pitchOffset ? orbitOffset.pitchOffset : 0)));
    const totalDist = Math.max(80, distBase * (orbitOffset && orbitOffset.distanceScale ? orbitOffset.distanceScale : 1.0));

    const c = this.lastCamera;
    if (
      c.yaw === totalYaw &&
      c.pitch === totalPitch &&
      c.roll === rollBase &&
      c.dist === totalDist &&
      c.fov === fov &&
      c.cx === cx &&
      c.cy === cy
    ) {
      return;
    }

    c.yaw = totalYaw;
    c.pitch = totalPitch;
    c.roll = rollBase;
    c.dist = totalDist;
    c.fov = fov;
    c.cx = cx;
    c.cy = cy;

    const yawRad = totalYaw * (Math.PI / 180);
    const pitchRad = totalPitch * (Math.PI / 180);
    const rollRad = rollBase * (Math.PI / 180);
    const focalLength = totalDist;

    this.exports.set_camera_uniforms(
      Math.cos(yawRad),
      Math.sin(yawRad),
      Math.cos(pitchRad),
      Math.sin(pitchRad),
      Math.cos(rollRad),
      Math.sin(rollRad),
      focalLength,
      totalDist,
      cx,
      cy
    );
  }

  projectPoint(x, y, z, camera, cx, cy, orbitOffset) {
    if (!this.isReady || !this.f32View) return null;
    cx = cx !== undefined ? cx : 400;
    cy = cy !== undefined ? cy : 240;

    this.updateCamera(camera, cx, cy, orbitOffset);
    this.exports.project_single(x, y, z, this.OUT_PTR, 0);

    const baseIdx = this.OUT_PTR >> 2;
    return {
      x: this.f32View[baseIdx],
      y: this.f32View[baseIdx + 1],
      z: this.f32View[baseIdx + 2],
      scale: this.f32View[baseIdx + 3],
      opacity: this.f32View[baseIdx + 4],
      safeZ: this.f32View[baseIdx + 2] + ((camera && camera.distance) || 450),
    };
  }
}

export const AST3DWasmBridge = (typeof window !== 'undefined' && window.AST3DWasmBridge) || new AST3DWasmBridgeImpl();
