// src/utils/bytecode/astbEncoder.ts
/**
 * AST Vector Bytecode (.astb) Binary Encoder.
 */

import {
  ARCHETYPE_APP,
  ARCHETYPE_FILM,
  ARCHETYPE_SIM,
  ARCHETYPE_SLIDE,
  ASTB_MAGIC,
  ASTB_VERSION,
  FLAG_COMPLETE_BINARY,
  FLAG_HAS_3D,
  FLAG_HAS_CHECKPOINTS,
  FLAG_HAS_SUBTITLES,
  FLAG_HAS_SVG,
  FLAG_HAS_VECTOR_DICT,
  FLAG_HAS_VIDEO,
  OP_3D_LINE,
  OP_3D_NODE,
  OP_3D_RING,
  OP_BINDING,
  OP_BINDING_VAR,
  OP_BINDING_WHEN,
  OP_CAMERA,
  OP_CHECKPOINT,
  OP_CHECKPOINT_GOAL,
  OP_COMPUTED,
  OP_EOF,
  OP_GESTURE,
  OP_INPUT,
  OP_KEYFRAME,
  OP_LEDGER,
  OP_SCENE_EXT,
  OP_SCENE_META,
  OP_SCOPE,
  OP_SHAPE_DEF,
  OP_STAMP,
  OP_STYLE_TABLE,
  OP_SUBTITLE,
  OP_SVG_COMPANION,
  OP_VAR,
  type BytecodeCompiledScene,
} from './astbSchema';
import { StringTableBuilder, normalizeSplineIndexExpr } from './astbTables';

/**
 * Compiles a structured scene into a compact binary .astb buffer.
 */
export function compileSceneToBytecode(scene: BytecodeCompiledScene): Uint8Array {
  const strTable = new StringTableBuilder();

  // Pre-intern common strings
  const idStr = strTable.intern(scene.id);
  const titleStr = strTable.intern(scene.title);
  const stageStr = strTable.intern(scene.stage);
  const videoStr = strTable.intern(scene.video || '');

  // Calculate flags & archetype
  let archetype = ARCHETYPE_SIM;
  if (scene.type === 'Film' || scene.video) archetype = ARCHETYPE_FILM;
  else if (scene.type === 'Slide') archetype = ARCHETYPE_SLIDE;
  else if (scene.type === 'App') archetype = ARCHETYPE_APP;

  let flags = 0;
  if (scene.has3D || scene.camera) flags |= FLAG_HAS_3D;
  if (scene.video || archetype === ARCHETYPE_FILM) flags |= FLAG_HAS_VIDEO;
  if (scene.checkpoints && scene.checkpoints.length > 0) flags |= FLAG_HAS_CHECKPOINTS;
  if (scene.subtitles && scene.subtitles.length > 0) flags |= FLAG_HAS_SUBTITLES;
  if (scene.svgMarkup && scene.svgMarkup.trim().length > 0) flags |= FLAG_HAS_SVG;
  if (scene.completeBinary) flags |= FLAG_COMPLETE_BINARY;
  if (scene.vectorDict && (scene.vectorDict.styles.length > 0 || scene.vectorDict.shapes.length > 0 || scene.vectorDict.stamps.length > 0)) {
    flags |= FLAG_HAS_VECTOR_DICT;
  }

  // Stream buffer for instructions
  const ops: number[] = [];
  const appendU8 = (val: number) => ops.push(val & 0xff);
  const appendU16 = (val: number) => {
    ops.push(val & 0xff);
    ops.push((val >> 8) & 0xff);
  };
  const appendI16 = (val: number) => {
    const clamped = Math.max(-32768, Math.min(32767, Math.round(val)));
    const u = clamped < 0 ? clamped + 65536 : clamped;
    ops.push(u & 0xff, (u >> 8) & 0xff);
  };
  const appendU32 = (val: number) => {
    const u = val >>> 0;
    ops.push(u & 0xff, (u >> 8) & 0xff, (u >> 16) & 0xff, (u >> 24) & 0xff);
  };
  const appendF32 = (val: number) => {
    const fBuf = new Float32Array([val]);
    const u8 = new Uint8Array(fBuf.buffer);
    ops.push(u8[0], u8[1], u8[2], u8[3]);
  };

  // 1. Scene Meta Opcode
  let fitVal = 1; // contain
  if (scene.videoFit === 'cover') fitVal = 2;
  else if (scene.videoFit === 'fill') fitVal = 3;

  appendU8(OP_SCENE_META);
  appendU16(idStr);
  appendU16(titleStr);
  appendU16(stageStr);
  appendU16(videoStr);
  appendU8(fitVal);

  // 1b. Optional Duo SVG Vector Stage Companion (OP_SVG_COMPANION = 0x81)
  if (scene.svgMarkup && scene.svgMarkup.trim().length > 0) {
    appendU8(OP_SVG_COMPANION);
    appendU16(strTable.intern(scene.svgMarkup));
  }

  // 1c. SWF-Inspired Binary 2D Vector Dictionary (0x82 OP_STYLE_TABLE, 0x83 OP_SHAPE_DEF, 0x84 OP_STAMP)
  if (scene.vectorDict) {
    const vd = scene.vectorDict;
    if (vd.styles.length > 0) {
      const sub: number[] = [];
      const sU8 = (v: number) => sub.push(v & 0xff);
      const sU16 = (v: number) => sub.push(v & 0xff, (v >> 8) & 0xff);
      const sI16 = (v: number) => {
        const cl = Math.max(-32768, Math.min(32767, Math.round(v)));
        const u = cl < 0 ? cl + 65536 : cl;
        sub.push(u & 0xff, (u >> 8) & 0xff);
      };
      sU16(vd.styles.length);
      for (const st of vd.styles) {
        if (st.kind === 'solid') {
          sU8(1);
          sU8(st.color.r); sU8(st.color.g); sU8(st.color.b); sU8(st.color.a);
        } else if (st.kind === 'linear') {
          sU8(2);
          sU16(strTable.intern(st.id));
          sI16(st.x1 * 1000); sI16(st.y1 * 1000); sI16(st.x2 * 1000); sI16(st.y2 * 1000);
          const stops = st.stops.slice(0, 32);
          sU8(stops.length);
          for (const sp of stops) {
            sU8(Math.max(0, Math.min(255, Math.round(sp.offset * 255))));
            sU8(sp.color.r); sU8(sp.color.g); sU8(sp.color.b); sU8(sp.color.a);
          }
        } else {
          sU8(3);
          sU16(strTable.intern(st.id));
          sI16(st.cx * 1000); sI16(st.cy * 1000); sI16(st.r * 1000); sI16(st.fx * 1000); sI16(st.fy * 1000);
          const stops = st.stops.slice(0, 32);
          sU8(stops.length);
          for (const sp of stops) {
            sU8(Math.max(0, Math.min(255, Math.round(sp.offset * 255))));
            sU8(sp.color.r); sU8(sp.color.g); sU8(sp.color.b); sU8(sp.color.a);
          }
        }
      }
      appendU8(OP_STYLE_TABLE);
      appendU32(sub.length);
      for (let i = 0; i < sub.length; i++) ops.push(sub[i]);
    }

    for (const sh of vd.shapes) {
      const sub: number[] = [];
      const sU8 = (v: number) => sub.push(v & 0xff);
      const sU16 = (v: number) => sub.push(v & 0xff, (v >> 8) & 0xff);
      const sI16 = (v: number) => {
        const cl = Math.max(-32768, Math.min(32767, Math.round(v)));
        const u = cl < 0 ? cl + 65536 : cl;
        sub.push(u & 0xff, (u >> 8) & 0xff);
      };
      sU16(strTable.intern(sh.id));
      const layers = sh.layers.slice(0, 255);
      sU8(layers.length);
      for (const layer of layers) {
        sU16(layer.fillStyle !== undefined ? layer.fillStyle : 0xffff);
        sU16(layer.strokeStyle !== undefined ? layer.strokeStyle : 0xffff);
        sU16(Math.max(0, Math.min(65535, Math.round((layer.strokeWidth ?? 0) * 10))));
        const lFlags =
          (layer.evenOdd ? 0x01 : 0) |
          (layer.roundCap ? 0x02 : 0) |
          (layer.roundJoin ? 0x04 : 0) |
          (layer.ariaHidden ? 0x08 : 0);
        sU8(lFlags);
        sU16(layer.commands.length);
        // Delta-encoded fixed-point decipixels (0.1 px = 1 unit, Int16)
        let penX = 0;
        let penY = 0;
        for (const c of layer.commands) {
          if (c.op === 'M') {
            const tx = Math.round(c.x * 10);
            const ty = Math.round(c.y * 10);
            sU8(1); sI16(tx - penX); sI16(ty - penY);
            penX = tx; penY = ty;
          } else if (c.op === 'L') {
            const tx = Math.round(c.x * 10);
            const ty = Math.round(c.y * 10);
            sU8(2); sI16(tx - penX); sI16(ty - penY);
            penX = tx; penY = ty;
          } else if (c.op === 'Q') {
            const qx = Math.round(c.cx * 10);
            const qy = Math.round(c.cy * 10);
            const tx = Math.round(c.x * 10);
            const ty = Math.round(c.y * 10);
            sU8(3); sI16(qx - penX); sI16(qy - penY); sI16(tx - penX); sI16(ty - penY);
            penX = tx; penY = ty;
          } else if (c.op === 'C') {
            const x1 = Math.round(c.x1 * 10);
            const y1 = Math.round(c.y1 * 10);
            const x2 = Math.round(c.x2 * 10);
            const y2 = Math.round(c.y2 * 10);
            const tx = Math.round(c.x * 10);
            const ty = Math.round(c.y * 10);
            sU8(4); sI16(x1 - penX); sI16(y1 - penY); sI16(x2 - penX); sI16(y2 - penY); sI16(tx - penX); sI16(ty - penY);
            penX = tx; penY = ty;
          } else if (c.op === 'Z') {
            sU8(5);
          }
        }
      }
      appendU8(OP_SHAPE_DEF);
      appendU32(sub.length);
      for (let i = 0; i < sub.length; i++) ops.push(sub[i]);
    }

    for (const st of vd.stamps) {
      appendU8(OP_STAMP);
      appendU16(st.depth & 0xffff);
      appendU16(strTable.intern(st.symbolId));
      appendU16(strTable.intern(st.instanceId || ''));
      for (let m = 0; m < 6; m++) appendF32(st.matrix[m]);
      appendU8(Math.max(0, Math.min(255, Math.round((st.opacity ?? 1) * 255))));
      appendU8(st.ariaHidden ? 0x01 : 0x00);
    }
    void appendI16;
  }

  // 2. Camera (if 3D) — native binary record: [yaw_str: u16] [pitch: f32] [distance: f32] [fov: f32]
  if (scene.camera) {
    const rawYaw = scene.camera.yaw !== undefined && scene.camera.yaw !== null ? String(scene.camera.yaw) : '0';
    const pitchIsNumStr = typeof scene.camera.pitch === 'string' && /^-?\d+(?:\.\d+)?$/.test(scene.camera.pitch.trim());
    const pitchNum = typeof scene.camera.pitch === 'number' && Number.isFinite(scene.camera.pitch)
      ? scene.camera.pitch
      : (pitchIsNumStr ? parseFloat(scene.camera.pitch as string) : 20);
    const distNum = typeof scene.camera.distance === 'number' && Number.isFinite(scene.camera.distance) ? scene.camera.distance : 500;
    const fovNum = typeof scene.camera.fov === 'number' && Number.isFinite(scene.camera.fov) ? scene.camera.fov : 60;

    appendU8(OP_CAMERA);
    appendU16(strTable.intern(rawYaw));
    appendF32(pitchNum);
    appendF32(distNum);
    appendF32(fovNum);

    if (typeof scene.camera.pitch === 'string' && !pitchIsNumStr) {
      appendU8(OP_BINDING);
      appendU16(strTable.intern(':camera'));
      appendU16(strTable.intern('pitch'));
      appendU16(strTable.intern(scene.camera.pitch));
    }
  }

  // 3. Variables & Inputs
  if (scene.vars && typeof scene.vars === 'object') {
    for (const [k, v] of Object.entries(scene.vars)) {
      if (k.startsWith('_')) continue;
      appendU8(OP_VAR);
      appendU16(strTable.intern(k));
      const isObj = v && typeof v === 'object';
      const actualVal = isObj ? (v.val !== undefined ? v.val : (v.defaultValue !== undefined ? v.defaultValue : v.value)) : v;
      if (typeof actualVal === 'boolean') {
        appendU8(3);
        appendF32(actualVal ? 1 : 0);
      } else if (typeof actualVal === 'string') {
        appendU8(2);
        appendF32(strTable.intern(actualVal));
      } else {
        appendU8(1);
        appendF32(Number(actualVal) || 0);
      }
      appendF32(isObj && typeof v.min === 'number' ? v.min : 0); // min
      appendF32(isObj && typeof v.max === 'number' ? v.max : 100); // max
      appendF32(isObj && typeof v.step === 'number' ? v.step : 1); // step
      appendU16(strTable.intern((isObj && v.label) ? v.label : k));
    }
  }

  // 3a. Computed Reactive Variables (OP_COMPUTED = 0x61)
  if (Array.isArray(scene.computed)) {
    for (const comp of scene.computed) {
      if (!comp || !comp.name) continue;
      appendU8(OP_COMPUTED);
      appendU16(strTable.intern(comp.name));
      appendU16(strTable.intern(comp.expr || '0'));
    }
  }

  // 3b. Interactive User Controls (:inputs or ui:controls)
  const controlsToSerialize = (Array.isArray(scene.uiControls) && scene.uiControls.length > 0)
    ? scene.uiControls.map((c) => ({
        type: c.type === 'toggle' || c.type === 'switch' ? 'switch' : (c.type === 'button' ? 'button' : 'slider'),
        var: c.bind || c.id,
        label: c.label || c.id,
        min: typeof c.min === 'number' ? c.min : 0,
        max: typeof c.max === 'number' ? c.max : 100,
        step: typeof c.step === 'number' ? c.step : 1,
      }))
    : (Array.isArray(scene.inputs) ? scene.inputs : []);

  for (const inp of controlsToSerialize) {
    if (!inp || !inp.var) continue;
    appendU8(OP_INPUT);
    const kindVal = inp.type === 'switch' || inp.type === 'toggle' ? 2 : (inp.type === 'button' ? 3 : 1);
    appendU8(kindVal);
    appendU16(strTable.intern(inp.var));
    appendU16(strTable.intern(inp.label || inp.var));
    appendF32(typeof inp.min === 'number' ? inp.min : 0);
    appendF32(typeof inp.max === 'number' ? inp.max : 100);
    appendF32(typeof inp.step === 'number' ? inp.step : 1);
  }

  // 4. Keyframes
  if (Array.isArray(scene.keyframes)) {
    for (const kf of scene.keyframes) {
      appendU8(OP_KEYFRAME);
      const normT = Math.max(0, Math.min(65535, Math.round((kf.t || 0) * 65535)));
      appendU16(normT);
      appendU16(strTable.intern(kf.title));
      appendU16(strTable.intern(kf.rule));
    }
  }

  // 5. Subtitles
  if (Array.isArray(scene.subtitles)) {
    for (const sub of scene.subtitles) {
      appendU8(OP_SUBTITLE);
      const startT = Math.max(0, Math.min(65535, Math.round((sub.start || 0) * 65535)));
      const endT = Math.max(0, Math.min(65535, Math.round((sub.end || 0) * 65535)));
      appendU16(startT);
      appendU16(endT);

      const langs: Array<[string, string]> = [];
      if (sub.en) langs.push(['en', sub.en]);
      if (sub.es) langs.push(['es', sub.es]);
      if (sub.la) langs.push(['la', sub.la]);
      for (const [k, v] of Object.entries(sub)) {
        if (k !== 'start' && k !== 'end' && k !== 'en' && k !== 'es' && k !== 'la' && typeof v === 'string') {
          langs.push([k, v]);
        }
      }

      appendU8(langs.length);
      for (const [langKey, langText] of langs) {
        appendU16(strTable.intern(langKey));
        appendU16(strTable.intern(langText));
      }
    }
  }

  // 6. Bindings
  if (Array.isArray(scene.bindings)) {
    for (const b of scene.bindings) {
      if (b.type === 'var-update' && b.varName) {
        appendU8(OP_BINDING_VAR);
        appendU16(strTable.intern(b.varName));
        appendU16(strTable.intern(b.expr || '0'));
        const encodedGuard = b.onEnter
          ? `@enter:${String(b.onEnter).replace(/^@enter:/, '')}`
          : (b.when ? String(b.when) : '');
        appendU16(strTable.intern(encodedGuard));
        continue;
      }
      if (b.type === '3d-line') {
        const hasSplineIndex =
          b.splineIndex !== undefined &&
          b.splineIndex !== null &&
          Number.isFinite(Number(b.splineIndex)) &&
          Number(b.splineIndex) >= 0 &&
          Number(b.splineIndex) < 0xffff;
        const splineIdxNum = hasSplineIndex ? Math.trunc(Number(b.splineIndex)) : 0xffff;
        const normIdx = hasSplineIndex ? splineIdxNum : undefined;
        const hasZLayer = b.zLayer !== undefined && b.zLayer !== null && Number.isFinite(Number(b.zLayer));
        const hasZBias = b.zBias !== undefined && b.zBias !== null && Number.isFinite(Number(b.zBias));
        const lineFlags =
          (b.depthFog !== false ? 0x01 : 0) |
          (hasZLayer ? 0x02 : 0) |
          (hasZBias ? 0x04 : 0);

        appendU8(OP_3D_LINE);
        appendU16(strTable.intern(b.target));
        appendU16(strTable.intern(normalizeSplineIndexExpr(b.x1, normIdx, '0')));
        appendU16(strTable.intern(normalizeSplineIndexExpr(b.y1, normIdx, '0')));
        appendU16(strTable.intern(normalizeSplineIndexExpr(b.z1, normIdx, '0')));
        appendU16(strTable.intern(normalizeSplineIndexExpr(b.x2, normIdx, '0')));
        appendU16(strTable.intern(normalizeSplineIndexExpr(b.y2, normIdx, '0')));
        appendU16(strTable.intern(normalizeSplineIndexExpr(b.z2, normIdx, '0')));
        appendU16(strTable.intern(b.cap1 || ''));
        appendU16(strTable.intern(b.cap2 || ''));
        appendU16(strTable.intern(b.splitExpr ? normalizeSplineIndexExpr(b.splitExpr, normIdx, '') : ''));
        appendU16(strTable.intern(b.splineA || ''));
        appendU16(strTable.intern(b.splineB || ''));
        appendU16(strTable.intern(b.sortAfter || ''));
        appendF32(Number.isFinite(Number(b.baseR)) ? Number(b.baseR) : 8);
        appendU16(splineIdxNum);
        appendU8(lineFlags);
        if (hasZLayer) appendF32(Number(b.zLayer));
        if (hasZBias) appendF32(Number(b.zBias));
        continue;
      }
      if (b.type === '3d-node') {
        const hasZLayer = b.zLayer !== undefined && b.zLayer !== null && Number.isFinite(Number(b.zLayer));
        const hasZBias = b.zBias !== undefined && b.zBias !== null && Number.isFinite(Number(b.zBias));
        const nFlags =
          (b.depthFog !== false ? 0x01 : 0) |
          (hasZLayer ? 0x02 : 0) |
          (hasZBias ? 0x04 : 0);
        appendU8(OP_3D_NODE);
        appendU16(strTable.intern(b.target));
        appendU16(strTable.intern(b.x !== undefined ? String(b.x) : '0'));
        appendU16(strTable.intern(b.y !== undefined ? String(b.y) : '0'));
        appendU16(strTable.intern(b.z !== undefined ? String(b.z) : '0'));
        appendU16(strTable.intern(b.label || ''));
        appendU16(strTable.intern(b.sortAfter || ''));
        appendF32(Number.isFinite(Number(b.baseR)) ? Number(b.baseR) : 8);
        appendU8(nFlags);
        if (hasZLayer) appendF32(Number(b.zLayer));
        if (hasZBias) appendF32(Number(b.zBias));
        continue;
      }
      if (b.type === '3d-ring') {
        const hasZLayer = b.zLayer !== undefined && b.zLayer !== null && Number.isFinite(Number(b.zLayer));
        const hasZBias = b.zBias !== undefined && b.zBias !== null && Number.isFinite(Number(b.zBias));
        const rFlags =
          (b.depthFog !== false ? 0x01 : 0) |
          (hasZLayer ? 0x02 : 0) |
          (hasZBias ? 0x04 : 0);
        appendU8(OP_3D_RING);
        appendU16(strTable.intern(b.target));
        appendU16(strTable.intern(b.r !== undefined ? String(b.r) : '100'));
        appendU16(strTable.intern(b.cx !== undefined ? String(b.cx) : '0'));
        appendU16(strTable.intern(b.cy !== undefined ? String(b.cy) : '0'));
        appendU16(strTable.intern(b.cz !== undefined ? String(b.cz) : '0'));
        appendU16(strTable.intern(b.tiltX !== undefined ? String(b.tiltX) : '0'));
        appendU16(strTable.intern(b.tiltY !== undefined ? String(b.tiltY) : '0'));
        appendU16(strTable.intern(b.tiltZ !== undefined ? String(b.tiltZ) : '0'));
        appendU16(strTable.intern(b.sortAfter || ''));
        appendU16(Math.max(3, Math.min(65535, Math.round(Number(b.segments) || 24))));
        appendU8(rFlags);
        if (hasZLayer) appendF32(Number(b.zLayer));
        if (hasZBias) appendF32(Number(b.zBias));
        continue;
      }
      if (b.type !== '3d-polygon' && b.when) {
        appendU8(OP_BINDING_WHEN);
        appendU16(strTable.intern(b.target));
        appendU16(strTable.intern(b.attr || 'attr'));
        appendU16(strTable.intern(b.expr || ''));
        appendU16(strTable.intern(String(b.when)));
        continue;
      }
      appendU8(OP_BINDING);
      appendU16(strTable.intern(b.target));
      if (b.type === '3d-polygon') {
        appendU16(strTable.intern(':3d-polygon'));
        appendU16(strTable.intern(JSON.stringify({
          depthFog: b.depthFog !== false,
          cullBackface: Boolean(b.cullBackface),
          pointsExpr: b.pointsExpr,
          ...(b.zLayer !== undefined ? { zLayer: b.zLayer } : {}),
          ...(b.sortAfter ? { sortAfter: b.sortAfter } : {}),
          ...(b.zBias !== undefined ? { zBias: b.zBias } : {}),
        })));
      } else {
        appendU16(strTable.intern(b.attr || 'attr'));
        appendU16(strTable.intern(b.expr || ''));
      }
    }
  }

  // 7. Checkpoints (+ OP_CHECKPOINT_GOAL for :pass-expr, :hold-duration, :on-wrong)
  if (Array.isArray(scene.checkpoints)) {
    for (let cpIdx = 0; cpIdx < scene.checkpoints.length; cpIdx++) {
      const cp = scene.checkpoints[cpIdx];
      appendU8(OP_CHECKPOINT);
      const normT = Math.max(0, Math.min(65535, Math.round((cp.t || 0) * 65535)));
      appendU16(normT);
      appendU16(strTable.intern(cp.prompt));
      appendU8(cp.answer || 0);
      appendU16(strTable.intern(cp.explanation || ''));

      const opts = Array.isArray(cp.options) ? cp.options : [];
      appendU8(opts.length);
      for (const opt of opts) {
        appendU16(strTable.intern(opt));
      }

      const wrongEntries = cp.onWrong ? Object.entries(cp.onWrong) : [];
      if (cp.passExpr || (cp.holdDuration && cp.holdDuration > 0) || wrongEntries.length > 0 || (cp.title && cp.title !== 'Checkpoint')) {
        appendU8(OP_CHECKPOINT_GOAL);
        appendU16(cpIdx);
        appendU16(strTable.intern(cp.title || 'Checkpoint'));
        appendU16(strTable.intern(cp.passExpr || ''));
        appendF32(typeof cp.holdDuration === 'number' ? cp.holdDuration : 0);
        appendU8(wrongEntries.length);
        for (const [optKey, hintText] of wrongEntries) {
          appendU8(parseInt(optKey, 10) || 0);
          appendU16(strTable.intern(String(hintText)));
        }
      }
    }
  }

  // 8. Gestures (emit legacy OP_GESTURE for WASM hitboxes on draggables)
  if (Array.isArray(scene.gestures)) {
    for (const g of scene.gestures) {
      if (!g || !g.target) continue;
      if (g.type && g.type !== 'draggable') continue;
      appendU8(OP_GESTURE);
      appendU16(strTable.intern(g.target));
      const axisVal = g.axis === 'y' ? 2 : g.axis === 'xy' ? 3 : 1;
      appendU8(axisVal);
      appendF32(typeof g.min === 'number' ? g.min : 0);
      appendF32(typeof g.max === 'number' ? g.max : 100);
    }
  }

  // 8b. Live Vector Oscilloscopes (:scope)
  if (Array.isArray(scene.scopes)) {
    for (const sc of scene.scopes) {
      if (!sc || !sc.target) continue;
      appendU8(OP_SCOPE);
      appendU16(strTable.intern(sc.target));
      appendU16(strTable.intern(sc.xExpr || 't'));
      appendU16(strTable.intern(sc.yExpr || '0'));
      appendU16(Math.max(8, Math.min(2048, Math.round(sc.samples || 96))));
      appendF32(Array.isArray(sc.xRange) ? sc.xRange[0] : 0);
      appendF32(Array.isArray(sc.xRange) ? sc.xRange[1] : 10);
      appendF32(Array.isArray(sc.yRange) ? sc.yRange[0] : 0);
      appendF32(Array.isArray(sc.yRange) ? sc.yRange[1] : 100);
      const plot = Array.isArray(sc.plot) && sc.plot.length >= 4 ? sc.plot : [-1, -1, -1, -1];
      appendF32(plot[0]);
      appendF32(plot[1]);
      appendF32(plot[2]);
      appendF32(plot[3]);
    }
  }

  // 8c. Conservation-Law & Energy-Ledger Meters (:ledger)
  if (Array.isArray(scene.ledgers)) {
    for (const ld of scene.ledgers) {
      if (!ld || !ld.id || !Array.isArray(ld.terms)) continue;
      appendU8(OP_LEDGER);
      appendU16(strTable.intern(ld.id));
      appendU16(strTable.intern(ld.target || `#${ld.id}`));
      appendU16(strTable.intern(ld.unit || ''));
      appendU16(strTable.intern(ld.maxExpr || ''));
      appendF32(typeof ld.x === 'number' ? ld.x : 40);
      appendF32(typeof ld.y === 'number' ? ld.y : 400);
      appendF32(typeof ld.width === 'number' ? ld.width : 320);
      appendF32(typeof ld.height === 'number' ? ld.height : 20);
      const terms = ld.terms.slice(0, 16);
      appendU8(terms.length);
      for (const term of terms) {
        appendU16(strTable.intern(term.label || 'Term'));
        appendU16(strTable.intern(term.expr || '0'));
        appendU16(strTable.intern(term.color || '#38bdf8'));
      }
    }
  }

  // 8d. Binary-Complete Scene Extensions (OP_SCENE_EXT = 0xA0)
  // Strip null/undefined/default fields before serialization to keep every .astb compact and < 64 KB WASM-bootable.
  const compactGesture = (g: any) => {
    if (!g || typeof g !== 'object') return g;
    const out: Record<string, any> = {};
    const isDraggable = !g.type || g.type === 'draggable';
    for (const [k, v] of Object.entries(g)) {
      if (v === null || v === undefined) continue;
      if ((k === 'invert' || k === 'relative' || k === 'seek') && v === false) continue;
      if (k === 'pitchMin' && v === -65) continue;
      if (k === 'pitchMax' && v === 65) continue;
      if (k === 'axis' && v === 'xy' && !isDraggable) continue;
      if (k === 'delta' && v === 1 && !g.var && !g.stepVar) continue;
      out[k] = v;
    }
    return out;
  };
  const compactVarMap = (vars: Record<string, any>) => {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(vars)) {
      if (k.startsWith('_')) continue;
      if (!v || typeof v !== 'object') {
        out[k] = v;
        continue;
      }
      const val = v.value !== undefined ? v.value : (v.val !== undefined ? v.val : v.defaultValue);
      const entry: Record<string, any> = { value: val };
      if (v.defaultValue !== undefined && v.defaultValue !== val) entry.defaultValue = v.defaultValue;
      if (v.hasMin && typeof v.min === 'number') entry.min = v.min;
      if (v.hasMax && typeof v.max === 'number') entry.max = v.max;
      if (v.hasStep && typeof v.step === 'number') entry.step = v.step;
      if (v.unit) entry.unit = v.unit;
      if (v.label && v.label !== k) entry.label = v.label;
      out[k] = entry;
    }
    return out;
  };
  const compactControl = (c: any) => {
    if (!c || typeof c !== 'object') return c;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(c)) {
      if (v === null || v === undefined) continue;
      if (k === 'rawBind' && v === c.bind) continue;
      out[k] = v;
    }
    return out;
  };
  const appendExt = (key: string, value: any) => {
    appendU8(OP_SCENE_EXT);
    appendU16(strTable.intern(key));
    appendU16(strTable.intern(JSON.stringify(value)));
  };
  if (scene.completeBinary) {
    if (scene.vars && Object.keys(scene.vars).length > 0 && Object.values(scene.vars).some(v => v && typeof v === 'object')) {
      appendExt('vars', compactVarMap(scene.vars));
    }
    const compInputs = Array.isArray(scene.inputs) && scene.inputs.length > 0 ? scene.inputs.map(compactControl) : null;
    const compUi = Array.isArray(scene.uiControls) && scene.uiControls.length > 0 ? scene.uiControls.map(compactControl) : null;
    if (compInputs) {
      appendExt('inputs', compInputs);
    }
    if (compUi && (!compInputs || JSON.stringify(compUi) !== JSON.stringify(compInputs))) {
      appendExt('uiControls', compUi);
    }
    if (Array.isArray(scene.gestures) && scene.gestures.length > 0) {
      appendExt('gestures', scene.gestures.map(compactGesture));
    }
    if (Array.isArray(scene.bindInputs) && scene.bindInputs.length > 0) {
      appendExt('bindInputs', scene.bindInputs);
    }
    if (scene.physics) {
      appendExt('physics', scene.physics);
    }
    if (Array.isArray(scene.emitters) && scene.emitters.length > 0) {
      appendExt('emitters', scene.emitters);
    }
    if (Array.isArray(scene.stateMachines) && scene.stateMachines.length > 0) {
      appendExt('stateMachines', scene.stateMachines);
    }
    if (scene.controls && Object.keys(scene.controls).length > 0) {
      appendExt('controls', scene.controls);
    }
    if (Array.isArray(scene.skills) && scene.skills.length > 0) {
      appendExt('skills', scene.skills);
    }
    if (scene.definedSkills && (typeof scene.definedSkills === 'string' || (Array.isArray(scene.definedSkills) && scene.definedSkills.length > 0))) {
      appendExt('definedSkills', scene.definedSkills);
    }
    if (Array.isArray(scene.cameraStops) && scene.cameraStops.length > 0) {
      appendExt('cameraStops', scene.cameraStops);
    }
    if (scene.quests) {
      appendExt('quests', scene.quests);
    }
    if (scene.bootSound) {
      appendExt('bootSound', scene.bootSound);
    }
    if (scene.interactiveDisabled) {
      appendExt('interactiveDisabled', true);
    }
    if (Array.isArray(scene.actors) && scene.actors.length > 0) {
      appendExt('actors', scene.actors);
    }
    if (Array.isArray(scene.staticElements) && scene.staticElements.length > 0) {
      appendExt('staticElements', scene.staticElements);
    }
  }

  // 9. EOF
  appendU8(OP_EOF);

  // Serialize string table
  const strTableData = strTable.serialize();

  // Build Final Output Binary
  const totalLength = 16 + strTableData.byteLength + ops.length;
  const out = new Uint8Array(totalLength);
  const view = new DataView(out.buffer);

  // Write 16-byte Header
  out[0] = ASTB_MAGIC[0];
  out[1] = ASTB_MAGIC[1];
  out[2] = ASTB_MAGIC[2];
  out[3] = ASTB_MAGIC[3];
  out[4] = ASTB_VERSION;
  out[5] = archetype;
  view.setUint16(6, Math.round((scene.duration || 10.0) * 10), true); // deciseconds
  view.setUint16(8, strTableData.count, true);
  view.setUint32(10, strTableData.byteLength, true);
  view.setUint16(14, flags, true);

  // Write String Table
  out.set(strTableData.buffer, 16);

  // Write Instruction Opcodes
  out.set(new Uint8Array(ops), 16 + strTableData.byteLength);

  return out;
}
