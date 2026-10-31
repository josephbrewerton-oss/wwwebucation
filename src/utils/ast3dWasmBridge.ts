/**
 * src/utils/ast3dWasmBridge.ts
 *
 * St Joseph's Educational Media Suite — WASM 3D Kernel Bridge for React/Browser
 * Conforms to docs/WASM_ARCHITECTURE_CONTRACT.md (Page 4 Memory Layout: 0x040000)
 */

import { AST_3D_WASM_BASE64 } from '../../static/player/wasm/ast-3d-engine.bin.js';

export interface Projected3DPoint {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  safeZ: number;
}

export class AST3DWasmBridgeReact {
  private static instance: AST3DWasmBridgeReact | null = null;
  public isReady = false;
  private memory: WebAssembly.Memory | null = null;
  private exports: any = null;
  private f32View: Float32Array | null = null;
  private i32View: Int32Array | null = null;

  // Page 4 Offsets
  private readonly IN_PTR = 0x040000;
  private readonly OUT_PTR = 0x044000;

  private lastCamera = {
    yaw: -9999,
    pitch: -9999,
    roll: -9999,
    dist: -9999,
    fov: -9999,
    cx: -9999,
    cy: -9999,
  };

  private constructor() {
    this.init().catch((err) => console.warn('[WASM 3D React Bridge] Init warning:', err));
  }

  public static getInstance(): AST3DWasmBridgeReact {
    if (!AST3DWasmBridgeReact.instance) {
      AST3DWasmBridgeReact.instance = new AST3DWasmBridgeReact();
      if (typeof window !== 'undefined') {
        (window as any).AST3DWasmBridge = AST3DWasmBridgeReact.instance;
      }
    }
    return AST3DWasmBridgeReact.instance;
  }

  public async init(): Promise<boolean> {
    if (this.isReady) return true;

    try {
      let binaryBytes: Uint8Array | null = null;

      // 1. Try fetching standalone .wasm binary with base-aware paths
      if (typeof fetch === 'function' && typeof window !== 'undefined' && window.location.protocol !== 'file:') {
        const basePath = (window as any).__AST_BASE_URL__ || (window as any).__AST_ASSET_BASE__ || (import.meta.env?.BASE_URL || '/').replace(/\/?$/, '/');
        const cleanBase = basePath.endsWith('/') ? basePath : basePath + '/';
        const candidates = [
          `${cleanBase}static/player/wasm/ast-3d-engine.wasm`,
          `${cleanBase}player/wasm/ast-3d-engine.wasm`,
          './static/player/wasm/ast-3d-engine.wasm',
          './player/wasm/ast-3d-engine.wasm',
          './wasm/ast-3d-engine.wasm',
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

      // 2. Fallback to inlined base64 binary
      if (!binaryBytes || binaryBytes.length === 0) {
        const binStr = atob(AST_3D_WASM_BASE64);
        const len = binStr.length;
        binaryBytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          binaryBytes[i] = binStr.charCodeAt(i);
        }
      }

      const wasmResult: any = await WebAssembly.instantiate(binaryBytes);
      const instance = wasmResult.instance || wasmResult;
      this.exports = instance.exports;
      this.memory = this.exports.memory;
      this.f32View = new Float32Array(this.memory!.buffer);
      this.i32View = new Int32Array(this.memory!.buffer);
      this.isReady = true;

      if (typeof window !== 'undefined') {
        (window as any).AST3DWasmBridge = this;
      }

      return true;
    } catch (err) {
      console.warn('WASM 3D React initialization failed, falling back to JS math:', err);
      this.isReady = false;
      return false;
    }
  }

  public updateCamera(
    camera: { yaw?: number; pitch?: number; roll?: number; distance?: number; fov?: number },
    cx = 400,
    cy = 240,
    orbitOffset?: { yawOffset?: number; pitchOffset?: number; distanceScale?: number }
  ): void {
    if (!this.isReady || !this.exports) return;

    const yawBase = camera.yaw ?? 0;
    const pitchBase = camera.pitch ?? 0;
    const rollBase = camera.roll ?? 0;
    const distBase = camera.distance ?? 450;
    const fov = camera.fov ?? 60;

    const totalYaw = yawBase + (orbitOffset?.yawOffset ?? 0);
    const totalPitch = Math.max(-85, Math.min(85, pitchBase + (orbitOffset?.pitchOffset ?? 0)));
    const totalDist = Math.max(80, distBase * (orbitOffset?.distanceScale ?? 1.0));

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
    // Focal length matches camera distance so that scale=1.0 at subject plane (z=0)
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

  public projectPoint(
    x: number,
    y: number,
    z: number,
    camera: { yaw?: number; pitch?: number; roll?: number; distance?: number; fov?: number },
    cx = 400,
    cy = 240,
    orbitOffset?: { yawOffset?: number; pitchOffset?: number; distanceScale?: number }
  ): Projected3DPoint | null {
    if (!this.isReady || !this.f32View) return null;

    this.updateCamera(camera, cx, cy, orbitOffset);
    this.exports.project_single(x, y, z, this.OUT_PTR, 0);

    const baseIdx = this.OUT_PTR >> 2;
    return {
      x: this.f32View[baseIdx],
      y: this.f32View[baseIdx + 1],
      z: this.f32View[baseIdx + 2],
      scale: this.f32View[baseIdx + 3],
      opacity: this.f32View[baseIdx + 4],
      safeZ: this.f32View[baseIdx + 2] + (camera.distance ?? 450),
    };
  }
}

// Auto-instantiate singleton
if (typeof window !== 'undefined') {
  AST3DWasmBridgeReact.getInstance();
}
