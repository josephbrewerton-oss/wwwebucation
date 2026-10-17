/**
 * static/player/wasm/ast-wasm-bridge.js
 * 
 * St Joseph's Educational Media Suite — Unified WebAssembly Engine Bridge
 * Conforms to docs/WASM_ARCHITECTURE_CONTRACT.md (Pages 0–5 Memory Layout)
 * 
 * Hardware-accelerated 3D Projection, Euler MicroPhysics, Particle Collision,
 * and Verlet Dynamics via compiled WebAssembly (1.7 KB binary, 7 memory pages).
 */
(function (global) {
  'use strict';

  // Inlined base64 fallback for air-gapped / file:// / offline execution (1,732 bytes compiled WASM)
  const FALLBACK_WASM_BASE64 = "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";

  class ASTWasmBridge {
    constructor() {
      this.isReady = false;
      this.instance = null;
      this.memory = null;
      this.exports = null;
      this.f32View = null;
      this.i32View = null;

      // Memory Map Offsets (docs/WASM_ARCHITECTURE_CONTRACT.md)
      this.P_X_PTR = 0x010000;    // Page 1: 65,536 (f32[1024])
      this.P_Y_PTR = 0x011000;    // 69,632 (f32[1024])
      this.P_VX_PTR = 0x012000;   // 73,728 (f32[1024])
      this.P_VY_PTR = 0x013000;   // 77,824 (f32[1024])
      this.P_RAD_PTR = 0x014000;  // 81,920 (f32[1024])

      this.RB_BASE = 0x030000;    // Page 3: 196,608 (256 bodies * 48 bytes)
      this.VP_BASE = 0x034000;    // Page 3: 212,992 (256 verlet points * 32 bytes)
      this.VC_BASE = 0x037000;    // Page 3: 225,280 (256 verlet constraints * 16 bytes)

      this.IN_3D_PTR = 0x040000;  // Page 4: 262,144 (512 vertices * 16 bytes)
      this.OUT_3D_PTR = 0x044000; // Page 4: 278,528 (512 projected * 24 bytes)

      this.lastCameraState = {
        yaw: null, pitch: null, roll: null,
        dist: null, fov: null, cx: null, cy: null
      };
    }

    async init() {
      if (this.isReady) return true;

      try {
        let binaryBytes = null;

        // Try fetch standalone .wasm binary
        if (typeof fetch === 'function' && typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
          const candidateUrls = [
            './wasm/ast-wasm-engine.wasm',
            '/player/wasm/ast-wasm-engine.wasm',
            'wasm/ast-wasm-engine.wasm'
          ];
          for (const url of candidateUrls) {
            try {
              const resp = await fetch(url);
              if (resp.ok) {
                const arrayBuf = await resp.arrayBuffer();
                binaryBytes = new Uint8Array(arrayBuf);
                break;
              }
            } catch (_) {}
          }
        }

        // Fallback to inlined base64
        if (!binaryBytes || binaryBytes.length === 0) {
          if (typeof atob === 'function') {
            const binStr = atob(FALLBACK_WASM_BASE64);
            const len = binStr.length;
            binaryBytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              binaryBytes[i] = binStr.charCodeAt(i);
            }
          } else if (typeof Buffer !== 'undefined') {
            binaryBytes = new Uint8Array(Buffer.from(FALLBACK_WASM_BASE64, 'base64'));
          }
        }

        const wasmModule = await WebAssembly.instantiate(binaryBytes);
        this.instance = wasmModule.instance;
        this.exports = this.instance.exports;
        this.memory = this.exports.memory;
        this.f32View = new Float32Array(this.memory.buffer);
        this.i32View = new Int32Array(this.memory.buffer);
        this.isReady = true;

        if (typeof console !== 'undefined') {
          console.log('⚡ [AST WASM ENGINE] Unified Kernel Active (3D + Euler Physics + Particles + Verlet). Memory: 7 Pages (448 KiB)');
        }
        return true;
      } catch (err) {
        console.warn('WASM Engine could not initialize, falling back to JS:', err);
        this.isReady = false;
        return false;
      }
    }

    // -------------------------------------------------------------------------
    // 1. 3D PROJECTION KERNEL
    // -------------------------------------------------------------------------
    updateCamera(camera, cx = 400, cy = 240, cameraOrbit = null) {
      if (!this.isReady) return;

      const yawBase = (camera && camera.yaw) || 0;
      const pitchBase = (camera && camera.pitch) || 0;
      const rollBase = (camera && camera.roll) || 0;
      const distBase = (camera && camera.distance) || 450;
      const fov = (camera && camera.fov) || 60;

      const totalYaw = yawBase + (cameraOrbit ? cameraOrbit.yawOffset || 0 : 0);
      const totalPitch = Math.max(-85, Math.min(85, pitchBase + (cameraOrbit ? cameraOrbit.pitchOffset || 0 : 0)));
      const totalDist = Math.max(80, distBase * (cameraOrbit ? cameraOrbit.distanceScale || 1.0 : 1.0));

      const c = this.lastCameraState;
      if (
        c.yaw === totalYaw && c.pitch === totalPitch && c.roll === rollBase &&
        c.dist === totalDist && c.fov === fov && c.cx === cx && c.cy === cy
      ) {
        return;
      }

      c.yaw = totalYaw; c.pitch = totalPitch; c.roll = rollBase;
      c.dist = totalDist; c.fov = fov; c.cx = cx; c.cy = cy;

      const yawRad = totalYaw * (Math.PI / 180);
      const pitchRad = totalPitch * (Math.PI / 180);
      const rollRad = rollBase * (Math.PI / 180);
      // Focal length matches camera distance so that scale=1.0 at subject plane (z=0)
      const focalLength = totalDist;

      this.exports.set_camera_uniforms(
        Math.cos(yawRad), Math.sin(yawRad),
        Math.cos(pitchRad), Math.sin(pitchRad),
        Math.cos(rollRad), Math.sin(rollRad),
        focalLength, totalDist,
        cx, cy
      );
    }

    projectPoint(x, y, z, camera, cx = 400, cy = 240, cameraOrbit = null) {
      if (!this.isReady) return null;
      this.updateCamera(camera, cx, cy, cameraOrbit);

      this.exports.project_single(x, y, z, this.OUT_3D_PTR, 0);
      const baseIdx = this.OUT_3D_PTR >> 2;
      return {
        x: this.f32View[baseIdx],
        y: this.f32View[baseIdx + 1],
        z: this.f32View[baseIdx + 2],
        scale: this.f32View[baseIdx + 3],
        opacity: this.f32View[baseIdx + 4],
        safeZ: this.f32View[baseIdx + 2] + ((camera && camera.distance) || 450)
      };
    }

    // -------------------------------------------------------------------------
    // 2. PARTICLE POOL SIMULATION KERNEL (Pages 1 & 2)
    // -------------------------------------------------------------------------
    particleStep(pool, dt, gravity, bounds) {
      if (!this.isReady || !pool || pool.length === 0) return false;

      const count = Math.min(pool.length, 1024);
      const xIdx = this.P_X_PTR >> 2;
      const yIdx = this.P_Y_PTR >> 2;
      const vxIdx = this.P_VX_PTR >> 2;
      const vyIdx = this.P_VY_PTR >> 2;
      const rIdx = this.P_RAD_PTR >> 2;

      // 1. Stage in
      for (let i = 0; i < count; i++) {
        const p = pool[i];
        this.f32View[xIdx + i] = p.x || 0;
        this.f32View[yIdx + i] = p.y || 0;
        this.f32View[vxIdx + i] = p.vx || 0;
        this.f32View[vyIdx + i] = p.vy || 0;
        this.f32View[rIdx + i] = p.radius || 4;
      }

      // 2. Execute WASM step
      const minX = bounds.minX != null ? bounds.minX : 10;
      const maxX = bounds.maxX != null ? bounds.maxX : 790;
      const minY = bounds.minY != null ? bounds.minY : 0;
      const maxY = bounds.maxY != null ? bounds.maxY : 480;

      this.exports.particle_step(count, dt, gravity || 0, minX, maxX, minY, maxY);

      // 3. Stage out back to JS pool objects
      for (let i = 0; i < count; i++) {
        const p = pool[i];
        p.x = this.f32View[xIdx + i];
        p.y = this.f32View[yIdx + i];
        p.vx = this.f32View[vxIdx + i];
        p.vy = this.f32View[vyIdx + i];
      }
      return true;
    }

    // -------------------------------------------------------------------------
    // 3. RIGID BODIES & EULER MICROPHYSICS (Page 3)
    // -------------------------------------------------------------------------
    microPhysicsStep(bodies, dt, gravity, bounds) {
      if (!this.isReady || !bodies || bodies.length === 0) return false;

      const count = Math.min(bodies.length, 256);
      const baseIdx = this.RB_BASE >> 2;

      // 1. Fill rigid body buffer (48 bytes = 12 float32 slots per body)
      for (let i = 0; i < count; i++) {
        const b = bodies[i];
        const offset = baseIdx + i * 12;
        this.f32View[offset] = b.x;
        this.f32View[offset + 1] = b.y;
        this.f32View[offset + 2] = b.vx;
        this.f32View[offset + 3] = b.vy;
        this.f32View[offset + 4] = b.mass || 1.0;
        this.f32View[offset + 5] = b.bounce !== undefined ? b.bounce : 0.45;
        this.f32View[offset + 6] = b.friction !== undefined ? b.friction : 0.985;
        this.f32View[offset + 7] = b.groundY !== undefined ? b.groundY : 420;
        this.f32View[offset + 8] = b.radius || 16;
        this.i32View[offset + 9] = (b.isStatic ? 1 : 0) | (b.isGrounded ? 2 : 0);
      }

      // 2. Execute WASM micro physics step
      const minX = bounds.minX != null ? bounds.minX : 10;
      const maxX = bounds.maxX != null ? bounds.maxX : 790;
      this.exports.micro_physics_step(count, dt, gravity || 980, minX, maxX);

      // 3. Read back positions and grounded flags
      for (let i = 0; i < count; i++) {
        const b = bodies[i];
        const offset = baseIdx + i * 12;
        b.x = this.f32View[offset];
        b.y = this.f32View[offset + 1];
        b.vx = this.f32View[offset + 2];
        b.vy = this.f32View[offset + 3];
        const flags = this.i32View[offset + 9];
        b.isGrounded = Boolean(flags & 2);
      }
      return true;
    }

    // -------------------------------------------------------------------------
    // 4. VERLET DYNAMICS (Page 3)
    // -------------------------------------------------------------------------
    verletStep(points, constraints, iterations, dt, gravity, drag) {
      if (!this.isReady || !points || points.length === 0) return false;

      const pCount = Math.min(points.length, 256);
      const cCount = Math.min((constraints && constraints.length) || 0, 256);
      const pBaseIdx = this.VP_BASE >> 2;
      const cBaseIdx = this.VC_BASE >> 2;

      // 1. Stage in points (32 bytes = 8 float slots)
      for (let i = 0; i < pCount; i++) {
        const p = points[i];
        const offset = pBaseIdx + (i << 3);
        this.f32View[offset] = p.x;
        this.f32View[offset + 1] = p.y;
        this.f32View[offset + 2] = p.px;
        this.f32View[offset + 3] = p.py;
        this.f32View[offset + 4] = p.mass || 1.0;
        this.f32View[offset + 5] = p.radius || 6;
        this.i32View[offset + 6] = p.pinned ? 1 : 0;
      }

      // 2. Stage in constraints (16 bytes = 4 slots: i32, i32, f32, f32)
      for (let i = 0; i < cCount; i++) {
        const c = constraints[i];
        const p1Idx = points.indexOf(c.p1);
        const p2Idx = points.indexOf(c.p2);
        const offset = cBaseIdx + (i << 2);
        this.i32View[offset] = Math.max(0, p1Idx);
        this.i32View[offset + 1] = Math.max(0, p2Idx);
        this.f32View[offset + 2] = c.length || 100;
        this.f32View[offset + 3] = c.stiffness !== undefined ? c.stiffness : 1.0;
      }

      // 3. Run WASM verlet step
      this.exports.verlet_step(pCount, cCount, iterations || 4, dt, gravity || 980, drag !== undefined ? drag : 0.992);

      // 4. Read back points
      for (let i = 0; i < pCount; i++) {
        const p = points[i];
        const offset = pBaseIdx + (i << 3);
        p.x = this.f32View[offset];
        p.y = this.f32View[offset + 1];
        p.px = this.f32View[offset + 2];
        p.py = this.f32View[offset + 3];
      }
      return true;
    }
  }

  // Export singleton instances (both ASTWasmBridge and backward-compatible AST3DWasmBridge)
  const wasmBridge = new ASTWasmBridge();
  global.ASTWasmBridge = wasmBridge;
  global.AST3DWasmBridge = wasmBridge;

  if (typeof WebAssembly !== 'undefined') {
    wasmBridge.init().catch(() => {});
  }
})(typeof window !== 'undefined' ? window : globalThis);
