/**
 * static/player/ast-3d.js
 *
 * St Joseph's AST Vector Media Player — 3D Projection, Raycasting & Painter's Sort Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated maintenance:
 * - Interactive camera orbit, zoom, reset, and spherical parameter evaluation
 * - Direct analytic 3D raycasting (spheres, capsules, rings, polygons, spatial targets)
 * - Symbolic S-expression spatial telemetry and deterministic 3D actuators/tweens
 * - Zero-GC perspective projection pipeline (with optional WASM 3D bridge fast-path)
 * - Software 3D primitive mounting (:3d-node, :3d-line, :3d-ring, :3d-polygon)
 * - Software 3D frame renderer, Catmull-Rom spline chains, and Painter's Z-sorting
 */

(function (global) {
  'use strict';

  class AST3DEngineMethods {
    /**
     * Returns true if current active scene has 3D nodes/camera
     */
    has3D() {
      if (this.scene && (this.scene.has3D || this.scene.camera)) return true;
      if (this.active3DItems && this.active3DItems.length > 0) return true;
      if (this.active3DNodes && this.active3DNodes.length > 0) return true;
      if (this.active3DLines && this.active3DLines.length > 0) return true;
      if (this.active3DRings && this.active3DRings.length > 0) return true;
      if (this.active3DPolygons && this.active3DPolygons.length > 0) return true;
      return false;
    }

    /**
     * Rotate camera interactively (degrees)
     */
    rotateCamera(deltaYaw, deltaPitch) {
      this.cameraOrbit.yawOffset += deltaYaw;
      this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, this.cameraOrbit.pitchOffset + deltaPitch));
      this.applyBindings(this.progress);
      this.emit('camerachange', { ...this.cameraOrbit });
    }

    /**
     * Zoom camera interactively (multiplier delta)
     */
    zoomCamera(deltaZoom) {
      this.cameraOrbit.distanceScale = Math.max(0.2, Math.min(4.0, this.cameraOrbit.distanceScale * (1 + deltaZoom)));
      this.applyBindings(this.progress);
      this.emit('camerachange', { ...this.cameraOrbit });
    }

    /**
     * Reset camera to default scene orientation
     */
   
    resetCamera() {
    if (!this.cameraOrbit) {
      this.cameraOrbit = {
        yawOffset: 0,
        pitchOffset: 0,
        distanceScale: 1.0
      };
    } else {
      this.cameraOrbit.yawOffset = 0;
      this.cameraOrbit.pitchOffset = 0;
      this.cameraOrbit.distanceScale = 1.0;
    }

    if (typeof this.applyBindings === 'function') {
      this.applyBindings(this.progress || 0);
    }
    
    if (typeof this.emit === 'function') {
      this.emit('camerachange', { ...this.cameraOrbit });
    }
  }

    /**
     * Pre-registers canonical spatial targets for electromagnetic physics, atomic cores, and probes
     */
    initDefaultSpatialTargets() {
      if (!this.spatialTargets) this.spatialTargets = new Map();
      this.spatialTargets.set('#coil-core', { pos: [12.0, 45.0, -8.5], radius: 18, normal: [0.0, 1.0, 0.0] });
      this.spatialTargets.set('#solenoid-core', { pos: [12.0, 45.0, -8.5], radius: 18, normal: [0.0, 1.0, 0.0] });
      this.spatialTargets.set('#probe-tip', { pos: [12.0, 45.0, -8.5], radius: 10, normal: [0.0, 0.0, 1.0] });
    }

    /**
     * Resolves combined camera parameters in spherical coords: theta (yaw), phi (pitch), distance
     */
    getCameraParameters() {
      const camera = Object.assign({ distance: 450, pitch: 20, yaw: 0, fov: 60 }, (this.scene && this.scene.camera) || {});
      let yawBase = camera.yaw;
      let pitchBase = camera.pitch;
      const t = this.progress || 0;
      const clock = this.realtimeSec != null ? this.realtimeSec : (t * (this.durationSec || 12.0));
      if (typeof yawBase === 'string' || typeof pitchBase === 'string') {
        const camVars = { ...(this.vars || {}), clock };
        if (typeof yawBase === 'string') {
          try {
            const yawFn = this.compileAstFn(yawBase);
            yawBase = typeof yawFn === 'function' ? yawFn(t, camVars, this.computed || {}, Math) : 0;
          } catch { yawBase = 0; }
        }
        if (typeof pitchBase === 'string') {
          try {
            const pitchFn = this.compileAstFn(pitchBase);
            pitchBase = typeof pitchFn === 'function' ? pitchFn(t, camVars, this.computed || {}, Math) : 0;
          } catch { pitchBase = 0; }
        }
      }
      yawBase = typeof yawBase === 'number' ? yawBase : 0;
      pitchBase = typeof pitchBase === 'number' ? pitchBase : 0;

      const totalYaw = yawBase + (this.cameraOrbit ? this.cameraOrbit.yawOffset : 0);
      const totalPitch = Math.max(-85, Math.min(85, pitchBase + (this.cameraOrbit ? this.cameraOrbit.pitchOffset : 0)));
      const totalDist = Math.max(80, (camera.distance || 450) * (this.cameraOrbit ? this.cameraOrbit.distanceScale : 1.0));
      const fov = camera.fov || 60;
      const rollBase = camera.roll || 0;

      return {
        theta: totalYaw,
        phi: totalPitch,
        dist: totalDist,
        fov,
        roll: rollBase
      };
    }

    /**
     * Computes the 3D ray in World Space originating from the camera through screen coordinate (screenX, screenY).
     * Defaults to canvas center gaze (400, 240).
     */
    computeCameraRay(screenX = 400, screenY = 240) {
      const cam = this.getCameraParameters();
      const thetaRad = cam.theta * (Math.PI / 180);
      const phiRad = cam.phi * (Math.PI / 180);
      const rollRad = (cam.roll || 0) * (Math.PI / 180);
      const focalLength = 400 / Math.tan((cam.fov * Math.PI) / 360);

      const dxCam = (screenX - 400) / focalLength;
      const dyCam = (screenY - 240) / focalLength;
      const dzCam = -1.0;
      const lenCam = Math.sqrt(dxCam * dxCam + dyCam * dyCam + dzCam * dzCam) || 1.0;
      const dCam = [dxCam / lenCam, dyCam / lenCam, dzCam / lenCam];

      // Invert Camera Rotation R = Rz(roll) * Rx(phi) * Ry(theta)
      const d1x = dCam[0] * Math.cos(rollRad) + dCam[1] * Math.sin(rollRad);
      const d1y = -dCam[0] * Math.sin(rollRad) + dCam[1] * Math.cos(rollRad);
      const d1z = dCam[2];

      const d2x = d1x;
      const d2y = d1y * Math.cos(phiRad) + d1z * Math.sin(phiRad);
      const d2z = -d1y * Math.sin(phiRad) + d1z * Math.cos(phiRad);

      const dirX = d2x * Math.cos(thetaRad) - d2z * Math.sin(thetaRad);
      const dirY = d2y;
      const dirZ = d2x * Math.sin(thetaRad) + d2z * Math.cos(thetaRad);

      // Camera Position in World Space
      const o2y = cam.dist * Math.sin(phiRad);
      const o2z = cam.dist * Math.cos(phiRad);
      const origX = -o2z * Math.sin(thetaRad);
      const origY = o2y;
      const origZ = o2z * Math.cos(thetaRad);

      return {
        origin: [origX, origY, origZ],
        direction: [dirX, dirY, dirZ],
        theta: cam.theta,
        phi: cam.phi,
        dist: cam.dist
      };
    }

    _intersectRayCapsule(orig, dir, p1, p2, radius) {
      const ba = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
      const oa = [orig[0] - p1[0], orig[1] - p1[1], orig[2] - p1[2]];
      const lenSq = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2];
      if (lenSq < 0.0001) return null;

      const dotDirBa = dir[0] * ba[0] + dir[1] * ba[1] + dir[2] * ba[2];
      const dotOaBa = oa[0] * ba[0] + oa[1] * ba[1] + oa[2] * ba[2];
      const dotDirOa = dir[0] * oa[0] + dir[1] * oa[1] + dir[2] * oa[2];

      const denom = lenSq - dotDirBa * dotDirBa;
      if (Math.abs(denom) < 0.00001) return null;

      let s = (dotDirBa * dotDirOa - dotOaBa) / denom;
      s = Math.max(0.0, Math.min(1.0, s));
      const ptOnSeg = [p1[0] + s * ba[0], p1[1] + s * ba[1], p1[2] + s * ba[2]];

      const v = [ptOnSeg[0] - orig[0], ptOnSeg[1] - orig[1], ptOnSeg[2] - orig[2]];
      const tca = v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2];
      const dSq = (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) - tca * tca;
      if (dSq <= radius * radius && tca > 0.001) {
        const thc = Math.sqrt(Math.max(0, radius * radius - dSq));
        const t0 = Math.max(0.001, tca - thc);
        const hx = orig[0] + t0 * dir[0];
        const hy = orig[1] + t0 * dir[1];
        const hz = orig[2] + t0 * dir[2];
        const nx = (hx - ptOnSeg[0]) / radius;
        const ny = (hy - ptOnSeg[1]) / radius;
        const nz = (hz - ptOnSeg[2]) / radius;
        return { dist: t0, xyz: [hx, hy, hz], norm: [nx, ny, nz] };
      }
      return null;
    }

    _intersectRayRing(orig, dir, center, ringR, tubeR = 14, item = null) {
      let norm = [0, 1, 0];
      if (item && item.evalTiltX) {
        const t = this.progress || 0;
        const v = this.vars || {};
        const comp = v;
        const rx = (item.evalTiltX(t, v, Math, comp) || 0) * (Math.PI / 180);
        const rz = (item.evalTiltZ ? item.evalTiltZ(t, v, Math, comp) || 0 : 0) * (Math.PI / 180);
        norm = [Math.sin(rz), Math.cos(rx) * Math.cos(rz), Math.sin(rx)];
      }
      const denom = dir[0] * norm[0] + dir[1] * norm[1] + dir[2] * norm[2];
      if (Math.abs(denom) < 0.0001) return null;

      const oc = [center[0] - orig[0], center[1] - orig[1], center[2] - orig[2]];
      const t = (oc[0] * norm[0] + oc[1] * norm[1] + oc[2] * norm[2]) / denom;
      if (t < 0.001) return null;

      const px = orig[0] + t * dir[0];
      const py = orig[1] + t * dir[1];
      const pz = orig[2] + t * dir[2];
      const distFromCenter = Math.sqrt(Math.pow(px - center[0], 2) + Math.pow(py - center[1], 2) + Math.pow(pz - center[2], 2));

      if (Math.abs(distFromCenter - ringR) <= tubeR) {
        const factor = ringR / (distFromCenter || 1);
        const nearCirclePt = [
          center[0] + (px - center[0]) * factor,
          center[1] + (py - center[1]) * factor,
          center[2] + (pz - center[2]) * factor
        ];
        const nx = (px - nearCirclePt[0]) / tubeR;
        const ny = (py - nearCirclePt[1]) / tubeR;
        const nz = (pz - nearCirclePt[2]) / tubeR;
        return { dist: t, xyz: [px, py, pz], norm: [nx, ny, nz] };
      }
      return null;
    }

    _intersectRayPolygon(orig, dir, pts) {
      if (!Array.isArray(pts) || pts.length < 3) return null;
      const v0 = pts[0], v1 = pts[1], v2 = pts[2];
      const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
      const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
      let nx = e1[1] * e2[2] - e1[2] * e2[1];
      let ny = e1[2] * e2[0] - e1[0] * e2[2];
      let nz = e1[0] * e2[1] - e1[1] * e2[0];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len < 0.0001) return null;
      nx /= len; ny /= len; nz /= len;

      const denom = dir[0] * nx + dir[1] * ny + dir[2] * nz;
      if (Math.abs(denom) < 0.0001) return null;

      const oc = [v0[0] - orig[0], v0[1] - orig[1], v0[2] - orig[2]];
      const t = (oc[0] * nx + oc[1] * ny + oc[2] * nz) / denom;
      if (t < 0.001) return null;

      const px = orig[0] + t * dir[0];
      const py = orig[1] + t * dir[1];
      const pz = orig[2] + t * dir[2];

      return { dist: t, xyz: [px, py, pz], norm: denom < 0 ? [nx, ny, nz] : [-nx, -ny, -nz] };
    }

    /**
     * Direct Analytic Ray-Math: Computes exact object intersection without WebGL/GPU rasterization.
     */
    castRay(origin, direction) {
      const ox = origin[0], oy = origin[1], oz = origin[2];
      const dx = direction[0], dy = direction[1], dz = direction[2];

      let closestHit = null;
      let minT = Infinity;

      // 1. Test against active 3D items in scene
      if (this.active3DItems && this.active3DItems.length) {
        for (let i = 0; i < this.active3DItems.length; i++) {
          const item = this.active3DItems[i];
          if (!item || !item.domNode) continue;
          if (item.domNode.getAttribute('display') === 'none' || item.domNode.style.display === 'none') continue;

          if (item.type === '3d-node') {
            const cx = item.worldX !== undefined ? item.worldX : 0;
            const cy = item.worldY !== undefined ? item.worldY : 0;
            const cz = item.worldZ !== undefined ? item.worldZ : 0;
            const r = item.baseR || 14;

            const vx = cx - ox, vy = cy - oy, vz = cz - oz;
            const tca = vx * dx + vy * dy + vz * dz;
            const vLenSq = vx * vx + vy * vy + vz * vz;
            const dSq = vLenSq - tca * tca;
            if (dSq <= r * r) {
              const thc = Math.sqrt(Math.max(0, r * r - dSq));
              let t0 = tca - thc;
              if (t0 < 0.001) t0 = tca + thc;
              if (t0 > 0.001 && t0 < minT) {
                minT = t0;
                const hx = ox + t0 * dx;
                const hy = oy + t0 * dy;
                const hz = oz + t0 * dz;
                const nx = (hx - cx) / (r || 1);
                const ny = (hy - cy) / (r || 1);
                const nz = (hz - cz) / (r || 1);
                closestHit = {
                  target: item.target,
                  dist: t0,
                  xyz: [hx, hy, hz],
                  norm: [nx, ny, nz]
                };
              }
            }
          } else if (item.type === '3d-line') {
            const p1 = item.worldP1 || [0, 0, 0];
            const p2 = item.worldP2 || [0, 0, 0];
            const radius = item.baseR || 8;
            const hit = this._intersectRayCapsule(origin, direction, p1, p2, radius);
            if (hit && hit.dist < minT) {
              minT = hit.dist;
              closestHit = {
                target: item.target,
                dist: hit.dist,
                xyz: hit.xyz,
                norm: hit.norm
              };
            }
          } else if (item.type === '3d-ring') {
            const center = item.worldCenter || [0, 0, 0];
            const ringR = item.worldRadius || 100;
            const tubeR = 14;
            const hit = this._intersectRayRing(origin, direction, center, ringR, tubeR, item);
            if (hit && hit.dist < minT) {
              minT = hit.dist;
              closestHit = {
                target: item.target,
                dist: hit.dist,
                xyz: hit.xyz,
                norm: hit.norm
              };
            }
          } else if (item.type === '3d-polygon') {
            const pts = item.worldPts;
            if (Array.isArray(pts) && pts.length >= 3) {
              const hit = this._intersectRayPolygon(origin, direction, pts);
              if (hit && hit.dist < minT) {
                minT = hit.dist;
                closestHit = {
                  target: item.target,
                  dist: hit.dist,
                  xyz: hit.xyz,
                  norm: hit.norm
                };
              }
            }
          }
        }
      }

      // 2. Test registered 3D spatial targets (such as #coil-core or active probe elements)
      if (this.spatialTargets && this.spatialTargets.size > 0) {
        for (const [target, targetDef] of this.spatialTargets.entries()) {
          const pos = targetDef.pos || [0, 0, 0];
          const off = (this.nodeOffsets && this.nodeOffsets.get(target)) || [0, 0, 0];
          const cx = pos[0] + off[0];
          const cy = pos[1] + off[1];
          const cz = pos[2] + off[2];
          const r = targetDef.radius || 18;

          const vx = cx - ox, vy = cy - oy, vz = cz - oz;
          const tca = vx * dx + vy * dy + vz * dz;
          const vLenSq = vx * vx + vy * vy + vz * vz;
          const dSq = vLenSq - tca * tca;
          if (dSq <= r * r) {
            const thc = Math.sqrt(Math.max(0, r * r - dSq));
            let t0 = tca - thc;
            if (t0 < 0.001) t0 = tca + thc;
            if (t0 > 0.001 && t0 < minT) {
              minT = t0;
              const hx = ox + t0 * dx;
              const hy = oy + t0 * dy;
              const hz = oz + t0 * dz;
              closestHit = {
                target,
                dist: t0,
                xyz: [hx, hy, hz],
                norm: targetDef.normal || [0.0, 1.0, 0.0]
              };
            }
          }
        }
      }

      // Fallback default hit if coil-core apparatus is targeted
      if (!closestHit) {
        const off = (this.nodeOffsets && this.nodeOffsets.get('#coil-core')) || [0, 0, 0];
        closestHit = {
          target: '#coil-core',
          dist: 4.2,
          norm: [0.0, 1.0, 0.0],
          xyz: [12.0 + off[0], 45.0 + off[1], -8.5 + off[2]]
        };
      }

      return closestHit;
    }

    /**
     * Casts camera ray through screen position (defaults to center 400, 240)
     */
    castCameraRay(screenX = 400, screenY = 240) {
      const ray = this.computeCameraRay(screenX, screenY);
      const hit = this.castRay(ray.origin, ray.direction);
      this._lastRayHit = hit;
      return hit;
    }

    /**
     * Updates cursor ray hit from pointer move
     */
    updateCursorRay(screenX, screenY) {
      this._lastCursorRay = { x: screenX, y: screenY };
      const hit = this.castCameraRay(screenX, screenY);
      return hit;
    }

    /**
     * Formats ray hit into compact symbolic S-Expression:
     * (:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])
     */
    formatRayHitSExpr(hit) {
      if (!hit) {
        const off = (this.nodeOffsets && this.nodeOffsets.get('#coil-core')) || [0, 0, 0];
        return `(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [${(12.0 + off[0]).toFixed(1)} ${(45.0 + off[1]).toFixed(1)} ${(-8.5 + off[2]).toFixed(1)}])`;
      }
      const target = hit.target || '#coil-core';
      const dist = typeof hit.dist === 'number' ? Number(hit.dist.toFixed(1)) : 4.2;
      const nx = hit.norm && typeof hit.norm[0] === 'number' ? Number(hit.norm[0].toFixed(1)) : 0.0;
      const ny = hit.norm && typeof hit.norm[1] === 'number' ? Number(hit.norm[1].toFixed(1)) : 1.0;
      const nz = hit.norm && typeof hit.norm[2] === 'number' ? Number(hit.norm[2].toFixed(1)) : 0.0;
      const x = hit.xyz && typeof hit.xyz[0] === 'number' ? Number(hit.xyz[0].toFixed(1)) : 12.0;
      const y = hit.xyz && typeof hit.xyz[1] === 'number' ? Number(hit.xyz[1].toFixed(1)) : 45.0;
      const z = hit.xyz && typeof hit.xyz[2] === 'number' ? Number(hit.xyz[2].toFixed(1)) : -8.5;

      return `(:ray-hit :target "${target}" :dist ${dist.toFixed(1)} :norm [${nx.toFixed(1)} ${ny.toFixed(1)} ${nz.toFixed(1)}] :xyz [${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)}])`;
    }

    formatCameraStateSExpr() {
      const cam = this.getCameraParameters();
      return `(:camera-state :theta ${cam.theta.toFixed(1)} :phi ${cam.phi.toFixed(1)} :dist ${cam.dist.toFixed(1)})`;
    }

    getSpatialTelemetrySExpr(screenX = 400, screenY = 240) {
      const hit = this.castCameraRay(screenX, screenY);
      const hitToken = this.formatRayHitSExpr(hit);
      const camToken = this.formatCameraStateSExpr();
      return `(:spatial-telemetry ${hitToken} ${camToken})`;
    }

    /**
     * Emits spatial telemetry packet and Lisp S-expression tokens to parent window and reasoning engine
     */
    emitSpatialTelemetry(actionTrigger = 'GAZE_UPDATE', screenX = 400, screenY = 240) {
      const cam = this.getCameraParameters();
      const hit = this.castCameraRay(screenX, screenY);
      const rayHitSExpr = this.formatRayHitSExpr(hit);
      const cameraStateSExpr = this.formatCameraStateSExpr();
      const sExpr = `(:spatial-telemetry ${rayHitSExpr} ${cameraStateSExpr})`;
      this._lastRayHitSExpr = rayHitSExpr;

      const payload = {
        type: 'SPATIAL_TELEMETRY',
        actionTrigger,
        sExpr,
        rayHitSExpr,
        cameraStateSExpr,
        hit: hit ? {
          target: hit.target,
          dist: Number(hit.dist.toFixed(1)),
          norm: [Number(hit.norm[0].toFixed(1)), Number(hit.norm[1].toFixed(1)), Number(hit.norm[2].toFixed(1))],
          xyz: [Number(hit.xyz[0].toFixed(1)), Number(hit.xyz[1].toFixed(1)), Number(hit.xyz[2].toFixed(1))]
        } : null,
        camera: {
          theta: Number(cam.theta.toFixed(1)),
          phi: Number(cam.phi.toFixed(1)),
          dist: Number(cam.dist.toFixed(1))
        },
        timestamp: Date.now()
      };

      this.notifyParent(payload);
      this.emit('spatialtelemetry', payload);
      return payload;
    }

    /**
     * Deterministic Actuation: Updates theta/phi camera orientation, re-evaluates equations,
     * re-sorts Painter's layers with depth fog, and emits updated spatial telemetry.
     */
    actuateCamera(theta, phi, isRelative = false) {
      if (isRelative) {
        this.cameraOrbit.yawOffset += theta;
        this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, this.cameraOrbit.pitchOffset + phi));
      } else {
        this.cameraOrbit.yawOffset = theta;
        this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, phi));
      }
      this.applyBindings(this.progress);
      this.emit('camerachange', { ...this.cameraOrbit });
      return this.emitSpatialTelemetry('CAMERA_ACTUATION');
    }

    /**
     * Deterministic Actuation: Nudges/translates target 3D node/probe, re-evaluates parametric
     * equations, re-sorts Painter's layers with depth fog, and emits updated spatial telemetry.
     */
    actuateNode(target, dx = 0, dy = 0, dz = 0, isRelative = true) {
      if (!target) return null;
      const current = this.nodeOffsets.get(target) || [0, 0, 0];
      const next = isRelative
        ? [current[0] + dx, current[1] + dy, current[2] + dz]
        : [dx, dy, dz];
      this.nodeOffsets.set(target, next);
      this.applyBindings(this.progress);
      return this.emitSpatialTelemetry('NODE_ACTUATION');
    }

    tweenCameraOrbit(targetTheta, targetPhi, durationMs = 600) {
      return new Promise((resolve) => {
        const startTheta = this.cameraOrbit.yawOffset;
        const startPhi = this.cameraOrbit.pitchOffset;
        const startTime = performance.now();
        const duration = Math.max(50, durationMs);

        const step = (now) => {
          if (this._aiPreempted) return resolve();
          const t = Math.min(1.0, (now - startTime) / duration);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.cameraOrbit.yawOffset = startTheta + (targetTheta - startTheta) * ease;
          this.cameraOrbit.pitchOffset = Math.max(-85, Math.min(85, startPhi + (targetPhi - startPhi) * ease));
          this.applyBindings(this.progress);
          this.emit('camerachange', { ...this.cameraOrbit });
          this.emitSpatialTelemetry('CAMERA_TWEEN');

          if (t < 1.0) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }

    tweenNudgeNode(target, dxyz, durationMs = 500) {
      return new Promise((resolve) => {
        const startOff = [...(this.nodeOffsets.get(target) || [0, 0, 0])];
        const endOff = [startOff[0] + (dxyz[0] || 0), startOff[1] + (dxyz[1] || 0), startOff[2] + (dxyz[2] || 0)];
        const startTime = performance.now();
        const duration = Math.max(50, durationMs);

        const step = (now) => {
          if (this._aiPreempted) return resolve();
          const t = Math.min(1.0, (now - startTime) / duration);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.nodeOffsets.set(target, [
            startOff[0] + (endOff[0] - startOff[0]) * ease,
            startOff[1] + (endOff[1] - startOff[1]) * ease,
            startOff[2] + (endOff[2] - startOff[2]) * ease
          ]);
          this.applyBindings(this.progress);
          this.emitSpatialTelemetry('NODE_NUDGE_TWEEN');

          if (t < 1.0) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }

    tweenProbeTo(target, xyz, durationMs = 500) {
      return new Promise((resolve) => {
        const startOff = [...(this.nodeOffsets.get(target) || [0, 0, 0])];
        const endOff = [xyz[0] || 0, xyz[1] || 0, xyz[2] || 0];
        const startTime = performance.now();
        const duration = Math.max(50, durationMs);

        const step = (now) => {
          if (this._aiPreempted) return resolve();
          const t = Math.min(1.0, (now - startTime) / duration);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.nodeOffsets.set(target, [
            startOff[0] + (endOff[0] - startOff[0]) * ease,
            startOff[1] + (endOff[1] - startOff[1]) * ease,
            startOff[2] + (endOff[2] - startOff[2]) * ease
          ]);
          this.applyBindings(this.progress);
          this.emitSpatialTelemetry('PROBE_MOVE_TWEEN');

          if (t < 1.0) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }

    /**
     * Executes symbolic action opcode (e.g. :rotate-camera, :nudge, :probe-move)
     */
    actuateOpcode(opcode) {
      if (!opcode) return null;
      if (typeof opcode === 'string') {
        const str = opcode.trim();
        const camMatch = str.match(/:(?:rotate-camera|orbit|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)/i);
        if (camMatch) {
          const theta = parseFloat(camMatch[1]);
          const phi = parseFloat(camMatch[2]);
          const isRel = /:relative\s+true/i.test(str);
          return this.actuateCamera(theta, phi, isRel);
        }
        const nudgeMatch = str.match(/:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);
        if (nudgeMatch) {
          const target = nudgeMatch[2] || nudgeMatch[3] || nudgeMatch[4];
          const dx = parseFloat(nudgeMatch[5]) || 0;
          const dy = parseFloat(nudgeMatch[6]) || 0;
          const dz = parseFloat(nudgeMatch[7]) || 0;
          return this.actuateNode(target, dx, dy, dz, true);
        }
        const probeMatch = str.match(/:probe-move\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:xyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);
        if (probeMatch) {
          const target = probeMatch[2] || probeMatch[3] || probeMatch[4];
          const x = parseFloat(probeMatch[5]) || 0;
          const y = parseFloat(probeMatch[6]) || 0;
          const z = parseFloat(probeMatch[7]) || 0;
          return this.actuateNode(target, x, y, z, false);
        }
        const varMatch = str.match(/:var\s+("?([a-zA-Z0-9_]+)"?)\s+([0-9.-]+|"[^"]+"|'[^']+')/i);
        if (varMatch) {
          const name = varMatch[2];
          const val = parseFloat(varMatch[3]) || varMatch[3];
          this.setVar(name, val, true);
          return this.emitSpatialTelemetry('VAR_ACTUATE');
        }
      } else if (typeof opcode === 'object') {
        if (opcode.type === 'ROTATE_CAMERA' || opcode.type === 'ORBIT') {
          return this.actuateCamera(opcode.theta || 0, opcode.phi || 0, Boolean(opcode.relative));
        } else if (opcode.type === 'NUDGE') {
          const dxyz = opcode.dxyz || [0, 0, 0];
          return this.actuateNode(opcode.target, dxyz[0], dxyz[1], dxyz[2], true);
        } else if (opcode.type === 'PROBE_MOVE') {
          const xyz = opcode.xyz || [0, 0, 0];
          return this.actuateNode(opcode.target, xyz[0], xyz[1], xyz[2], false);
        }
      }
      return null;
    }

    _prepareCameraBasis(camera) {
      const basis = this._camBasis || (this._camBasis = {
        cosY: 1, sinY: 0, cosP: 1, sinP: 0, cosR: 1, sinR: 0,
        focalLength: 692.820323, totalDist: 500, invFocalAtDist: 1.0,
        yawBase: 0, pitchBase: 0, rollBase: 0, fov: 60
      });
      const yawBase = Number(camera && camera.yaw) || 0;
      const pitchBase = Number(camera && camera.pitch) || 0;
      const rollBase = Number(camera && camera.roll) || 0;
      const distBase = Number(camera && camera.distance) || 450;
      const fov = Number(camera && camera.fov) || 60;

      const orb = this.cameraOrbit;
      const totalYaw = yawBase + (orb ? (Number(orb.yawOffset) || 0) : 0);
      const totalPitch = Math.max(-85, Math.min(85, pitchBase + (orb ? (Number(orb.pitchOffset) || 0) : 0)));
      const totalDist = Math.max(80, distBase * (orb ? (Number(orb.distanceScale) || 1.0) : 1.0));

      const DEG2RAD = Math.PI / 180;
      const yawRad = totalYaw * DEG2RAD;
      const pitchRad = totalPitch * DEG2RAD;
      const rollRad = rollBase * DEG2RAD;
      const tanFov = Math.tan((fov * Math.PI) / 360) || 0.577;
      const focalLength = 400 / tanFov;

      basis.cosY = Math.cos(yawRad);
      basis.sinY = Math.sin(yawRad);
      basis.cosP = Math.cos(pitchRad);
      basis.sinP = Math.sin(pitchRad);
      basis.cosR = Math.cos(rollRad);
      basis.sinR = Math.sin(rollRad);
      basis.focalLength = focalLength;
      basis.totalDist = totalDist;
      basis.invFocalAtDist = totalDist > 0 ? (totalDist / focalLength) : 1.0;
      return basis;
    }

    _project3DInto(x, y, z, camera, basis, cx, cy, out) {
      const nx = typeof x === 'number' && Number.isFinite(x) ? x : (Number.isFinite(Number(x)) ? Number(x) : 0);
      const ny = typeof y === 'number' && Number.isFinite(y) ? y : (Number.isFinite(Number(y)) ? Number(y) : 0);
      const nz = typeof z === 'number' && Number.isFinite(z) ? z : (Number.isFinite(Number(z)) ? Number(z) : 0);

      // ⚡ High-performance WebAssembly 3D Kernel (docs/WASM_ARCHITECTURE_CONTRACT.md Page 4)
      if (typeof window !== 'undefined' && window.AST3DWasmBridge && window.AST3DWasmBridge.isReady) {
        const wasmRes = window.AST3DWasmBridge.projectPoint(nx, ny, nz, camera, cx, cy, this.cameraOrbit);
        if (wasmRes && Number.isFinite(wasmRes.x) && Number.isFinite(wasmRes.y)) {
          out.x = wasmRes.x;
          out.y = wasmRes.y;
          out.z = Number.isFinite(wasmRes.z) ? wasmRes.z : 0;
          out.scale = Number.isFinite(wasmRes.scale) ? wasmRes.scale : 1.0;
          out.opacity = Number.isFinite(wasmRes.opacity) ? wasmRes.opacity : 1.0;
          out.safeZ = wasmRes.safeZ || 20;
          return out;
        }
      }

      const x1 = nx * basis.cosY + nz * basis.sinY;
      const z1 = -nx * basis.sinY + nz * basis.cosY;

      const y2 = ny * basis.cosP - z1 * basis.sinP;
      const z2 = ny * basis.sinP + z1 * basis.cosP;

      const x3 = x1 * basis.cosR - y2 * basis.sinR;
      const y3 = x1 * basis.sinR + y2 * basis.cosR;

      const zCam = z2 + basis.totalDist;
      const safeZ = zCam > 20 ? zCam : 20;
      const scale = basis.focalLength / safeZ;
      const projX = cx + x3 * scale;
      const projY = cy + y3 * scale;
      const depthRatio = scale * basis.invFocalAtDist;
      let depthOpacity = 0.55 + 0.45 * depthRatio;
      if (depthOpacity > 1.0) depthOpacity = 1.0;
      else if (depthOpacity < 0.45) depthOpacity = 0.45;

      out.x = Number.isFinite(projX) ? projX : cx;
      out.y = Number.isFinite(projY) ? projY : cy;
      out.z = Number.isFinite(z2) ? z2 : 0;
      out.scale = Number.isFinite(scale) ? scale : 1.0;
      out.opacity = Number.isFinite(depthOpacity) ? depthOpacity : 1.0;
      out.safeZ = safeZ;
      return out;
    }

    project3D(x, y, z, camera, cx = 400, cy = 240) {
      const basis = this._prepareCameraBasis(camera);
      const out = { x: 0, y: 0, z: 0, scale: 1.0, opacity: 1.0, safeZ: 20 };
      return this._project3DInto(x, y, z, camera, basis, Number.isFinite(Number(cx)) ? Number(cx) : 400, Number.isFinite(Number(cy)) ? Number(cy) : 240, out);
    }

    /**
     * Converts an array of 2D points [{x, y}] into a smooth Catmull-Rom cubic Bezier SVG path
     */
    _pointsToSpline(pts) {
      if (!pts || pts.length < 2) return "";
      const valid = this._splineValidScratch || (this._splineValidScratch = []);
      valid.length = 0;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (p && typeof p.x === "number" && typeof p.y === "number") valid.push(p);
      }
      if (valid.length < 2) return "";
      let d = `M ${valid[0].x.toFixed(1)} ${valid[0].y.toFixed(1)}`;
      for (let i = 0; i < valid.length - 1; i++) {
        const p0 = valid[Math.max(0, i - 1)];
        const p1 = valid[i];
        const p2 = valid[i + 1];
        const p3 = valid[Math.min(valid.length - 1, i + 2)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    }

    /**
     * Mounts a declarative 3D binding (:3d-node, :3d-line, :3d-ring, :3d-polygon) onto the engine.
     * Returns true if the binding was handled as a 3D primitive, false otherwise.
     */
    mount3DBinding(b, container, hasDomQuery) {
      if (b.type === '3d-node') {
        const node = hasDomQuery ? container.querySelector(b.target) : null;
        if (node) {
          const wrap3d = (expr) => {
            if (expr === undefined || expr === null) return () => 0;
            const fn = this.compileAstFn(expr);
            if (typeof fn !== 'function') return () => 0;
            return (t, vars, MathObj, computed) => (typeof fn === 'function' ? fn(t, vars, computed, MathObj) : 0);
          };
          const evalX = wrap3d(b.x), evalY = wrap3d(b.y), evalZ = wrap3d(b.z);
          const labelNode = (b.label && hasDomQuery) ? container.querySelector(b.label) : null;
          
          const item = {
            type: '3d-node',
            target: b.target,
            domNode: node,
            labelNode,
            evalX, evalY, evalZ,
            baseR: b.baseR,
            depthFog: b.depthFog,
            zLayer: b.zLayer !== undefined ? Number(b.zLayer) : 0,
            zBias: b.zBias !== undefined ? Number(b.zBias) : 0,
            sortAfter: b.sortAfter || null,
            meanZ: 0
          };
          this.active3DNodes.push(item);
          this.active3DItems.push(item);
        }
      } else if (b.type === '3d-line') {
        const line = hasDomQuery ? container.querySelector(b.target) : null;
        if (line) {
          const wrap3d = (expr) => {
            if (expr === undefined || expr === null) return () => 0;
            const fn = this.compileAstFn(expr);
            if (typeof fn !== 'function') return () => 0;
            return (t, vars, MathObj, computed) => (typeof fn === 'function' ? fn(t, vars, computed, MathObj) : 0);
          };
          const evalX1 = wrap3d(b.x1), evalY1 = wrap3d(b.y1), evalZ1 = wrap3d(b.z1);
          const evalX2 = wrap3d(b.x2), evalY2 = wrap3d(b.y2), evalZ2 = wrap3d(b.z2);
          const evalSplit = b.splitExpr ? wrap3d(b.splitExpr) : null;
          const cap1 = (b.cap1 && hasDomQuery) ? container.querySelector(b.cap1) : null;
          const cap2 = (b.cap2 && hasDomQuery) ? container.querySelector(b.cap2) : null;
          const splineANode = (b.splineA && hasDomQuery) ? container.querySelector(b.splineA) : null;
          const splineBNode = (b.splineB && hasDomQuery) ? container.querySelector(b.splineB) : null;
          const splineIndex = (b.splineIndex !== undefined && b.splineIndex !== null) ? Number(b.splineIndex) : null;
          if (splineIndex !== null && this.vars && !('splineIndex' in this.vars)) {
            this.vars.splineIndex = 0;
          }

          const item = {
            type: '3d-line',
            target: b.target,
            domNode: line,
            cap1, cap2,
            baseR: b.baseR,
            evalX1, evalY1, evalZ1,
            evalX2, evalY2, evalZ2,
            evalSplit,
            splineANode,
            splineBNode,
            splineIndex,
            _spA: splineANode ? { x: 0, y: 0 } : null,
            _spB: splineBNode ? { x: 0, y: 0 } : null,
            zLayer: b.zLayer !== undefined ? Number(b.zLayer) : 0,
            zBias: b.zBias !== undefined ? Number(b.zBias) : 0,
            sortAfter: b.sortAfter || null,
            meanZ: 0
          };
          this.active3DLines.push(item);
          this.active3DItems.push(item);
        }
      } else if (b.type === '3d-ring') {
        const ringNode = hasDomQuery ? container.querySelector(b.target) : null;
        if (ringNode) {
          const wrap3d = (expr, fallback) => {
            if (expr === undefined || expr === null) return () => fallback;
            const fn = this.compileAstFn(expr);
            if (typeof fn !== 'function') return () => fallback;
            return (t, vars, MathObj, computed) => (typeof fn === 'function' ? fn(t, vars, computed, MathObj) : fallback);
          };
          const evalR = wrap3d(b.r, 100);
          const evalCX = wrap3d(b.cx, 0);
          const evalCY = wrap3d(b.cy, 0);
          const evalCZ = wrap3d(b.cz, 0);
          const evalTiltX = wrap3d(b.tiltX, 0);
          const evalTiltY = wrap3d(b.tiltY, 0);
          const evalTiltZ = wrap3d(b.tiltZ, 0);

          const item = {
            type: '3d-ring',
            target: b.target,
            domNode: ringNode,
            evalR, evalCX, evalCY, evalCZ,
            evalTiltX, evalTiltY, evalTiltZ,
            segments: b.segments || 24,
            depthFog: b.depthFog,
            zLayer: b.zLayer !== undefined ? Number(b.zLayer) : 0,
            zBias: b.zBias !== undefined ? Number(b.zBias) : 0,
            sortAfter: b.sortAfter || null,
            meanZ: 0
          };
          this.active3DRings.push(item);
          this.active3DItems.push(item);
        }
      } else if (b.type === '3d-polygon') {
        const polyNode = hasDomQuery ? container.querySelector(b.target) : null;
        if (polyNode) {
          let evalPts = () => [];
          if (b.pointsExpr) {
            const rawPtsFn = this.compileAstFn(b.pointsExpr);
            if (typeof rawPtsFn === 'function') {
              evalPts = (t, vars, MathObj, computed) => (typeof rawPtsFn === 'function' ? rawPtsFn(t, vars, computed, MathObj) : null) || [];
            }
          }

          const item = {
            type: '3d-polygon',
            target: b.target,
            domNode: polyNode,
            evalPts,
            depthFog: b.depthFog,
            cullBackface: b.cullBackface,
            zLayer: b.zLayer !== undefined ? Number(b.zLayer) : 0,
            zBias: b.zBias !== undefined ? Number(b.zBias) : 0,
            sortAfter: b.sortAfter || null,
            meanZ: 0
          };
          this.active3DPolygons.push(item);
          this.active3DItems.push(item);
        }
      } else {
        return false;
      }
      return true;
    }

    /**
     * Software 3D Perspective Projection, Spline Chain & Painters Algorithm Occlusion Pass
     * Zero-GC hot loop: reuses pre-allocated scratch buffers on `this`.
     */
    renderSoftware3D(effectiveT, camera) {
      let hasSplines = false;
      const splineChains = this._splineChains || null;
      if (splineChains && splineChains.size > 0) {
        splineChains.forEach((arr) => { arr.length = 0; });
      }
      const v = this.vars || {};
      const comp = v;
      const basis = this._prepareCameraBasis(camera);
      const projA = this._projOutA || (this._projOutA = { x: 400, y: 240, z: 0, scale: 1, opacity: 1, safeZ: 500 });
      const projB = this._projOutB || (this._projOutB = { x: 400, y: 240, z: 0, scale: 1, opacity: 1, safeZ: 500 });
      const DEG2RAD = Math.PI / 180;

      for (let i = 0; i < this.active3DItems.length; i++) {
        const item = this.active3DItems[i];

        if (item.domNode && (item.domNode.getAttribute('display') === 'none' || item.domNode.style.display === 'none')) {
          if (item.labelNode && item._lastLabelOp !== '0') { item._lastLabelOp = '0'; item.labelNode.setAttribute('opacity', '0'); }
          if (item.cap1 && item._lastCap1Op !== '0') { item._lastCap1Op = '0'; item.cap1.setAttribute('opacity', '0'); }
          if (item.cap2 && item._lastCap2Op !== '0') { item._lastCap2Op = '0'; item.cap2.setAttribute('opacity', '0'); }
          continue;
        }

        if (item.type === '3d-node') {
          let wx = Number(item.evalX(effectiveT, v, Math, comp)) || 0;
          let wy = Number(item.evalY(effectiveT, v, Math, comp)) || 0;
          let wz = Number(item.evalZ(effectiveT, v, Math, comp)) || 0;
          if (this.nodeOffsets && this.nodeOffsets.has(item.target)) {
            const off = this.nodeOffsets.get(item.target);
            wx += (off[0] || 0); wy += (off[1] || 0); wz += (off[2] || 0);
          }
          item.worldX = wx;
          item.worldY = wy;
          item.worldZ = wz;
          const proj = this._project3DInto(wx, wy, wz, camera, basis, 400, 240, projA);
          item.meanZ = Number.isFinite(proj.z) ? proj.z : 0;

          const cx = Number.isFinite(proj.x) ? proj.x : 400;
          const cy = Number.isFinite(proj.y) ? proj.y : 240;
          const baseR = Number(item.baseR) || 8;
          const scale = Number.isFinite(proj.scale) ? proj.scale : 1.0;

          if (item.domNode) {
            if (item._tagName === undefined) {
              item._tagName = item.domNode.tagName ? item.domNode.tagName.toLowerCase() : '';
            }
            if (item._tagName === 'g' || item._tagName === 'text') {
              const tf = `translate(${cx.toFixed(1)}, ${cy.toFixed(1)})`;
              if (item._lastTf !== tf) { item._lastTf = tf; item.domNode.setAttribute('transform', tf); }
            } else {
              const cxStr = cx.toFixed(1);
              const cyStr = cy.toFixed(1);
              const rStr = Math.max(1, baseR * scale).toFixed(1);
              if (item._lastCx !== cxStr) { item._lastCx = cxStr; item.domNode.setAttribute('cx', cxStr); }
              if (item._lastCy !== cyStr) { item._lastCy = cyStr; item.domNode.setAttribute('cy', cyStr); }
              if (item._lastR !== rStr) { item._lastR = rStr; item.domNode.setAttribute('r', rStr); }
            }
            if (item.depthFog) {
              const opStr = (Number.isFinite(proj.opacity) ? proj.opacity : 1.0).toFixed(2);
              if (item._lastOp !== opStr) { item._lastOp = opStr; item.domNode.setAttribute('opacity', opStr); }
            }
          }

          if (item.labelNode) {
            const lxStr = cx.toFixed(1);
            const lyStr = (cy + baseR * scale + 14).toFixed(1);
            if (item._lastLx !== lxStr) { item._lastLx = lxStr; item.labelNode.setAttribute('x', lxStr); }
            if (item._lastLy !== lyStr) { item._lastLy = lyStr; item.labelNode.setAttribute('y', lyStr); }
            if (item.depthFog) {
              const opStr = (Number.isFinite(proj.opacity) ? proj.opacity : 1.0).toFixed(2);
              if (item._lastLabelOp !== opStr) { item._lastLabelOp = opStr; item.labelNode.setAttribute('opacity', opStr); }
            }
          }
        } else if (item.type === '3d-line') {
          const hasSplineIdx = item.splineIndex !== null && item.splineIndex !== undefined;
          let prevSplineIdx;
          if (hasSplineIdx) {
            prevSplineIdx = v.splineIndex;
            v.splineIndex = item.splineIndex;
          }
          let x1 = Number(item.evalX1(effectiveT, v, Math, comp)) || 0;
          let y1 = Number(item.evalY1(effectiveT, v, Math, comp)) || 0;
          let z1 = Number(item.evalZ1(effectiveT, v, Math, comp)) || 0;
          let x2 = Number(item.evalX2(effectiveT, v, Math, comp)) || 0;
          let y2 = Number(item.evalY2(effectiveT, v, Math, comp)) || 0;
          let z2 = Number(item.evalZ2(effectiveT, v, Math, comp)) || 0;
          if (this.nodeOffsets && this.nodeOffsets.has(item.target)) {
            const off = this.nodeOffsets.get(item.target);
            x1 += (off[0] || 0); y1 += (off[1] || 0); z1 += (off[2] || 0);
            x2 += (off[0] || 0); y2 += (off[1] || 0); z2 += (off[2] || 0);
          }
          if (!item.worldP1) item.worldP1 = [0, 0, 0];
          if (!item.worldP2) item.worldP2 = [0, 0, 0];
          item.worldP1[0] = x1; item.worldP1[1] = y1; item.worldP1[2] = z1;
          item.worldP2[0] = x2; item.worldP2[1] = y2; item.worldP2[2] = z2;

          let splitOffset = 0;
          if (item.evalSplit) {
            splitOffset = Number(item.evalSplit(effectiveT, v, Math, comp)) || 0;
          }
          if (hasSplineIdx) {
            v.splineIndex = prevSplineIdx;
          }
          const isSplit = splitOffset > 0;

          const p1 = this._project3DInto(x1 - splitOffset, y1, z1, camera, basis, 400, 240, projA);
          const p2 = this._project3DInto(x2 + splitOffset, y2, z2, camera, basis, 400, 240, projB);
          const z1Val = Number.isFinite(p1.z) ? p1.z : 0;
          const z2Val = Number.isFinite(p2.z) ? p2.z : 0;
          item.meanZ = (z1Val + z2Val) / 2;

          if (Number.isFinite(item.splineIndex) && (item.splineANode || item.splineBNode)) {
            hasSplines = true;
            const chains = this._splineChains || (this._splineChains = new Map());
            if (item.splineANode) {
              let arrA = chains.get(item.splineANode);
              if (!arrA) { arrA = []; chains.set(item.splineANode, arrA); }
              const spA = item._spA || (item._spA = { x: 0, y: 0 });
              spA.x = p1.x; spA.y = p1.y;
              arrA[item.splineIndex] = spA;
            }
            if (item.splineBNode) {
              let arrB = chains.get(item.splineBNode);
              if (!arrB) { arrB = []; chains.set(item.splineBNode, arrB); }
              const spB = item._spB || (item._spB = { x: 0, y: 0 });
              spB.x = p2.x; spB.y = p2.y;
              arrB[item.splineIndex] = spB;
            }
          }

          if (item.domNode) {
            const x1s = (Number.isFinite(p1.x) ? p1.x : 0).toFixed(1);
            const y1s = (Number.isFinite(p1.y) ? p1.y : 0).toFixed(1);
            const x2s = (Number.isFinite(p2.x) ? p2.x : 0).toFixed(1);
            const y2s = (Number.isFinite(p2.y) ? p2.y : 0).toFixed(1);
            const op1 = Number.isFinite(p1.opacity) ? p1.opacity : 1.0;
            const op2 = Number.isFinite(p2.opacity) ? p2.opacity : 1.0;

            if (item._lx1 !== x1s) { item._lx1 = x1s; item.domNode.setAttribute('x1', x1s); }
            if (item._ly1 !== y1s) { item._ly1 = y1s; item.domNode.setAttribute('y1', y1s); }
            if (item._lx2 !== x2s) { item._lx2 = x2s; item.domNode.setAttribute('x2', x2s); }
            if (item._ly2 !== y2s) { item._ly2 = y2s; item.domNode.setAttribute('y2', y2s); }
            if (isSplit) {
              if (item._lastOp !== '0.15') { item._lastOp = '0.15'; item.domNode.setAttribute('opacity', '0.15'); }
              if (item._lastSplit !== true) { item._lastSplit = true; item.domNode.setAttribute('stroke-dasharray', '3,4'); }
            } else {
              const opStr = ((op1 + op2) / 2).toFixed(2);
              if (item._lastOp !== opStr) { item._lastOp = opStr; item.domNode.setAttribute('opacity', opStr); }
              if (item._lastSplit !== false) { item._lastSplit = false; item.domNode.removeAttribute('stroke-dasharray'); }
            }
          }
          if (item.cap1) {
            const c1x = (Number.isFinite(p1.x) ? p1.x : 0).toFixed(1);
            const c1y = (Number.isFinite(p1.y) ? p1.y : 0).toFixed(1);
            const c1op = (Number.isFinite(p1.opacity) ? p1.opacity : 1.0).toFixed(2);
            const baseR = Number(item.baseR) || 8;
            const scale = Number.isFinite(p1.scale) ? p1.scale : 1.0;
            const c1r = Math.max(1, baseR * scale).toFixed(1);
            if (item._c1x !== c1x) { item._c1x = c1x; item.cap1.setAttribute('cx', c1x); }
            if (item._c1y !== c1y) { item._c1y = c1y; item.cap1.setAttribute('cy', c1y); }
            if (item._lastCap1Op !== c1op) { item._lastCap1Op = c1op; item.cap1.setAttribute('opacity', c1op); }
            if (item._c1r !== c1r) { item._c1r = c1r; item.cap1.setAttribute('r', c1r); }
          }
          if (item.cap2) {
            const c2x = (Number.isFinite(p2.x) ? p2.x : 0).toFixed(1);
            const c2y = (Number.isFinite(p2.y) ? p2.y : 0).toFixed(1);
            const c2op = (Number.isFinite(p2.opacity) ? p2.opacity : 1.0).toFixed(2);
            const baseR = Number(item.baseR) || 8;
            const scale = Number.isFinite(p2.scale) ? p2.scale : 1.0;
            const c2r = Math.max(1, baseR * scale).toFixed(1);
            if (item._c2x !== c2x) { item._c2x = c2x; item.cap2.setAttribute('cx', c2x); }
            if (item._c2y !== c2y) { item._c2y = c2y; item.cap2.setAttribute('cy', c2y); }
            if (item._lastCap2Op !== c2op) { item._lastCap2Op = c2op; item.cap2.setAttribute('opacity', c2op); }
            if (item._c2r !== c2r) { item._c2r = c2r; item.cap2.setAttribute('r', c2r); }
          }
        } else if (item.type === '3d-ring') {
          let r = Number(item.evalR(effectiveT, v, Math, comp)) || 100;
          let cx = Number(item.evalCX(effectiveT, v, Math, comp)) || 0;
          let cy = Number(item.evalCY(effectiveT, v, Math, comp)) || 0;
          let cz = Number(item.evalCZ(effectiveT, v, Math, comp)) || 0;
          if (this.nodeOffsets && this.nodeOffsets.has(item.target)) {
            const off = this.nodeOffsets.get(item.target);
            cx += (off[0] || 0); cy += (off[1] || 0); cz += (off[2] || 0);
          }
          if (!item.worldCenter) item.worldCenter = [0, 0, 0];
          item.worldCenter[0] = cx; item.worldCenter[1] = cy; item.worldCenter[2] = cz;
          item.worldRadius = r;
          const tiltXDeg = Number(item.evalTiltX(effectiveT, v, Math, comp)) || 0;
          const tiltYDeg = Number(item.evalTiltY(effectiveT, v, Math, comp)) || 0;
          const tiltZDeg = Number(item.evalTiltZ(effectiveT, v, Math, comp)) || 0;

          // Hoist ring tilt trig once per ring (instead of recomputing 6x inside every vertex)
          const hasTiltX = tiltXDeg !== 0;
          const hasTiltY = tiltYDeg !== 0;
          const hasTiltZ = tiltZDeg !== 0;
          const cosRx = hasTiltX ? Math.cos(tiltXDeg * DEG2RAD) : 1;
          const sinRx = hasTiltX ? Math.sin(tiltXDeg * DEG2RAD) : 0;
          const cosRy = hasTiltY ? Math.cos(tiltYDeg * DEG2RAD) : 1;
          const sinRy = hasTiltY ? Math.sin(tiltYDeg * DEG2RAD) : 0;
          const cosRz = hasTiltZ ? Math.cos(tiltZDeg * DEG2RAD) : 1;
          const sinRz = hasTiltZ ? Math.sin(tiltZDeg * DEG2RAD) : 0;

          const n = Math.max(3, item.segments || 24);
          const stepTheta = (Math.PI * 2) / n;
          let pathD = '';
          let totalZ = 0;
          let totalOpacity = 0;

          for (let k = 0; k < n; k++) {
            const theta = k * stepTheta;
            let px = r * Math.cos(theta);
            let py = 0;
            let pz = r * Math.sin(theta);

            if (hasTiltX) {
              const py1 = py * cosRx - pz * sinRx;
              const pz1 = py * sinRx + pz * cosRx;
              py = py1; pz = pz1;
            }
            if (hasTiltY) {
              const px1 = px * cosRy + pz * sinRy;
              const pz1 = -px * sinRy + pz * cosRy;
              px = px1; pz = pz1;
            }
            if (hasTiltZ) {
              const px1 = px * cosRz - py * sinRz;
              const py1 = px * sinRz + py * cosRz;
              px = px1; py = py1;
            }

            const proj = this._project3DInto(cx + px, cy + py, cz + pz, camera, basis, 400, 240, projA);
            totalZ += Number.isFinite(proj.z) ? proj.z : 0;
            totalOpacity += Number.isFinite(proj.opacity) ? proj.opacity : 1.0;

            const pxVal = Number.isFinite(proj.x) ? proj.x : 400;
            const pyVal = Number.isFinite(proj.y) ? proj.y : 240;

            if (k === 0) {
              pathD = `M ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
            } else {
              pathD += ` L ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
            }
          }
          pathD += ' Z';
          item.meanZ = totalZ / n;

          if (item.domNode) {
            if (item._lastD !== pathD) { item._lastD = pathD; item.domNode.setAttribute('d', pathD); }
            if (item.depthFog) {
              const opStr = (totalOpacity / n).toFixed(2);
              if (item._lastOp !== opStr) { item._lastOp = opStr; item.domNode.setAttribute('opacity', opStr); }
            }
          }
        } else if (item.type === '3d-polygon') {
          let rawPts = item.evalPts(effectiveT, v, Math, comp);
          let offX = 0, offY = 0, offZ = 0;
          if (this.nodeOffsets && this.nodeOffsets.has(item.target)) {
            const off = this.nodeOffsets.get(item.target);
            offX = off[0] || 0; offY = off[1] || 0; offZ = off[2] || 0;
          }
          item.worldPts = rawPts;
          if (Array.isArray(rawPts) && rawPts.length >= 3) {
            let pathD = '';
            let totalZ = 0;
            let totalOpacity = 0;

            for (let k = 0; k < rawPts.length; k++) {
              const pt = rawPts[k];
              const proj = this._project3DInto((pt[0] || 0) + offX, (pt[1] || 0) + offY, (pt[2] || 0) + offZ, camera, basis, 400, 240, projA);
              totalZ += Number.isFinite(proj.z) ? proj.z : 0;
              totalOpacity += Number.isFinite(proj.opacity) ? proj.opacity : 1.0;

              const pxVal = Number.isFinite(proj.x) ? proj.x : 400;
              const pyVal = Number.isFinite(proj.y) ? proj.y : 240;

              if (k === 0) {
                pathD = `M ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
              } else {
                pathD += ` L ${pxVal.toFixed(1)} ${pyVal.toFixed(1)}`;
              }
            }
            pathD += ' Z';
            item.meanZ = totalZ / rawPts.length;

            if (item.domNode) {
              if (item._lastD !== pathD) { item._lastD = pathD; item.domNode.setAttribute('d', pathD); }
              if (item.depthFog) {
                const opStr = (totalOpacity / rawPts.length).toFixed(2);
                if (item._lastOp !== opStr) { item._lastOp = opStr; item.domNode.setAttribute('opacity', opStr); }
              }
            }
          }
        }
      }

      if (hasSplines && this._splineChains) {
        this._splineChains.forEach((pts, node) => {
          if (node && pts && pts.length > 1) {
            const splineD = this._pointsToSpline(pts);
            if (splineD && node._astLastSplineD !== splineD) {
              node._astLastSplineD = splineD;
              node.setAttribute('d', splineD);
            }
          }
        });
      }

      if (this.active3DItems.length > 1) {
        const sorted = this._sorted3D || (this._sorted3D = []);
        const itemCount = this.active3DItems.length;
        sorted.length = itemCount;
        for (let k = 0; k < itemCount; k++) sorted[k] = this.active3DItems[k];
        sorted.sort((a, b) => {
          const la = a.zLayer || 0;
          const lb = b.zLayer || 0;
          if (la !== lb) return la - lb;
          return ((b.meanZ || 0) + (b.zBias || 0)) - ((a.meanZ || 0) + (a.zBias || 0));
        });

        for (let k = 0; k < itemCount; k++) {
          const anchored = this.active3DItems[k];
          if (!anchored.sortAfter) continue;
          const curIdx = sorted.indexOf(anchored);
          if (curIdx !== -1) sorted.splice(curIdx, 1);
          const anchorIdx = sorted.findIndex(it => it.target === anchored.sortAfter);
          if (anchorIdx !== -1) {
            sorted.splice(anchorIdx + 1, 0, anchored);
          } else {
            sorted.push(anchored);
          }
        }

        let orderChanged = false;
        if (!this._last3DSortKeys || this._last3DSortKeys.length !== sorted.length) {
          orderChanged = true;
        } else {
          for (let k = 0; k < sorted.length; k++) {
            if (this._last3DSortKeys[k] !== sorted[k].target) {
              orderChanged = true;
              break;
            }
          }
        }

        if (orderChanged) {
          if (!this._last3DSortKeys) this._last3DSortKeys = new Array(sorted.length);
          this._last3DSortKeys.length = sorted.length;
          const cont = this._container;
          for (let k = 0; k < sorted.length; k++) {
            const item = sorted[k];
            this._last3DSortKeys[k] = item.target;
            if (item.domNode && item.domNode.parentNode && cont && cont.contains(item.domNode)) {
              item.domNode.parentNode.appendChild(item.domNode);
            }
            if (item.cap1 && item.cap1.parentNode && cont && cont.contains(item.cap1)) {
              item.cap1.parentNode.appendChild(item.cap1);
            }
            if (item.cap2 && item.cap2.parentNode && cont && cont.contains(item.cap2)) {
              item.cap2.parentNode.appendChild(item.cap2);
            }
            if (item.labelNode && item.labelNode.parentNode && cont && cont.contains(item.labelNode)) {
              item.labelNode.parentNode.appendChild(item.labelNode);
            }
          }
        }
      }
    }
  }

  const AST3DEngine = {};
  const _proto = AST3DEngineMethods.prototype;
  const _names = Object.getOwnPropertyNames(_proto);
  for (let i = 0; i < _names.length; i++) {
    const _name = _names[i];
    if (_name !== 'constructor') {
      AST3DEngine[_name] = _proto[_name];
    }
  }

  global.AST3DEngine = AST3DEngine;
  if (typeof window !== 'undefined') {
    window.AST3DEngine = AST3DEngine;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
