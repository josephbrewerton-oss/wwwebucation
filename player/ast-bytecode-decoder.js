/**
 * static/player/ast-bytecode-decoder.js
 * Zero-Copy .astb Binary Bytecode Detector & Decompiler (isAstBytecode, decompileBytecode)
 * Zero-dependency UMD/IIFE peer module loaded strictly before ast-parser.js.
 */
(function (global) {
  'use strict';

  /**
   * Checks whether an ArrayBuffer or Uint8Array is valid ASTB bytecode
   */
  function isAstBytecode(buffer) {
    if (!buffer) return false;
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    if (bytes.length < 16) return false;
    return bytes[0] === 0x41 && bytes[1] === 0x53 && bytes[2] === 0x54 && bytes[3] === 0x42;
  }

  /**
   * Fast zero-copy AST bytecode decompiler (< 0.2 ms execution)
   * Deserializes binary .astb payloads with zero runtime string regex parsing.
   */
  function decompileBytecode(buffer) {
    if (!buffer) return null;
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    if (!isAstBytecode(bytes)) return null;

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const archetypeByte = bytes[5];
    const durationDeci = view.getUint16(6, true);
    const strCount = view.getUint16(8, true);
    const strByteLen = view.getUint32(10, true);
    const flags = view.getUint16(14, true);

    const duration = durationDeci / 10;
    let type = 'Sim';
    if (archetypeByte === 4) type = 'Film';
    else if (archetypeByte === 2) type = 'Slide';
    else if (archetypeByte === 3) type = 'App';

    // Read String Table
    const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: false }) : null;
    const strings = [];
    let strOffset = 16;
    for (let i = 0; i < strCount && strOffset < 16 + strByteLen; i++) {
      const sLen = view.getUint16(strOffset, true);
      strOffset += 2;
      const subArr = bytes.subarray(strOffset, strOffset + sLen);
      strings.push(decoder ? decoder.decode(subArr) : String.fromCharCode.apply(null, subArr));
      strOffset += sLen;
    }
    const getStr = (idx) => strings[idx] || '';

    let offset = 16 + strByteLen;
    const len = bytes.length;

    const scene = {
      id: 'unnamed',
      type: type,
      cartridgeType: type,
      title: 'AST Scene',
      stage: 'CURRICULUM',
      duration: duration,
      has3D: Boolean(flags & 0x0001),
      hasVideo: Boolean(flags & 0x0002),
      completeBinary: Boolean(flags & 0x0020),
      video: null,
      videoFit: 'contain',
      keyframes: [],
      subtitles: [],
      bindings: [],
      checkpoints: [],
      scopes: [],
      ledgers: [],
      gestures: [],
      vars: {},
      computed: [],
      inputs: []
    };

    while (offset < len) {
      const op = bytes[offset++];
      if (op === 0xFF) break; // OP_EOF

      switch (op) {
        case 0x01: { // OP_SCENE_META
          const idStr = view.getUint16(offset, true); offset += 2;
          const titleStr = view.getUint16(offset, true); offset += 2;
          const stageStr = view.getUint16(offset, true); offset += 2;
          const videoStr = view.getUint16(offset, true); offset += 2;
          const fitVal = bytes[offset++];
          scene.id = getStr(idStr);
          scene.title = getStr(titleStr);
          scene.stage = getStr(stageStr);
          const v = getStr(videoStr);
          if (v) {
            scene.video = v;
            scene.hasVideo = true;
            scene.type = 'Film';
            scene.cartridgeType = 'Film';
          }
          scene.videoFit = fitVal === 2 ? 'cover' : fitVal === 3 ? 'fill' : 'contain';
          break;
        }
        case 0x80: { // OP_CAMERA: [yaw_str: u16] [pitch: f32] [distance: f32] [fov: f32]
          const yawStr = getStr(view.getUint16(offset, true)); offset += 2;
          const pitch = view.getFloat32(offset, true); offset += 4;
          const dist = view.getFloat32(offset, true); offset += 4;
          const fov = view.getFloat32(offset, true); offset += 4;
          const yawTrim = yawStr.trim();
          const yaw = yawTrim === '' ? 0 : (/^-?\d+(?:\.\d+)?$/.test(yawTrim) ? Number(yawTrim) : yawStr);
          scene.camera = { distance: dist, pitch, yaw, fov };
          scene.has3D = true;
          break;
        }
        case 0x81: { // OP_SVG_COMPANION (Duo SVG embedded in .astb capsule)
          const svgIdx = view.getUint16(offset, true); offset += 2;
          const svgStr = getStr(svgIdx);
          if (svgStr) scene.svgMarkup = svgStr;
          break;
        }
        case 0x82: { // OP_STYLE_TABLE (length-framed binary color/gradient dictionary)
          const payloadLen = view.getUint32(offset, true); offset += 4;
          const endOff = Math.min(len, offset + payloadLen);
          if (!scene.vectorDict) scene.vectorDict = { styles: [], shapes: [], stamps: [] };
          const styleCount = view.getUint16(offset, true); offset += 2;
          for (let i = 0; i < styleCount && offset < endOff; i++) {
            const kind = bytes[offset++];
            if (kind === 1) {
              const r = bytes[offset++], g = bytes[offset++], b = bytes[offset++], a = bytes[offset++];
              scene.vectorDict.styles.push({ kind: 'solid', color: { r, g, b, a } });
            } else if (kind === 2) {
              const id = getStr(view.getUint16(offset, true)); offset += 2;
              const x1 = view.getInt16(offset, true) / 1000; offset += 2;
              const y1 = view.getInt16(offset, true) / 1000; offset += 2;
              const x2 = view.getInt16(offset, true) / 1000; offset += 2;
              const y2 = view.getInt16(offset, true) / 1000; offset += 2;
              const stopCount = bytes[offset++];
              const stops = [];
              for (let s = 0; s < stopCount; s++) {
                const off = bytes[offset++] / 255;
                const r = bytes[offset++], g = bytes[offset++], b = bytes[offset++], a = bytes[offset++];
                stops.push({ offset: off, color: { r, g, b, a } });
              }
              scene.vectorDict.styles.push({ kind: 'linear', id, x1, y1, x2, y2, stops });
            } else if (kind === 3) {
              const id = getStr(view.getUint16(offset, true)); offset += 2;
              const cx = view.getInt16(offset, true) / 1000; offset += 2;
              const cy = view.getInt16(offset, true) / 1000; offset += 2;
              const r = view.getInt16(offset, true) / 1000; offset += 2;
              const fx = view.getInt16(offset, true) / 1000; offset += 2;
              const fy = view.getInt16(offset, true) / 1000; offset += 2;
              const stopCount = bytes[offset++];
              const stops = [];
              for (let s = 0; s < stopCount; s++) {
                const off = bytes[offset++] / 255;
                const sr = bytes[offset++], sg = bytes[offset++], sb = bytes[offset++], sa = bytes[offset++];
                stops.push({ offset: off, color: { r: sr, g: sg, b: sb, a: sa } });
              }
              scene.vectorDict.styles.push({ kind: 'radial', id, cx, cy, r, fx, fy, stops });
            }
          }
          offset = endOff;
          break;
        }
        case 0x83: { // OP_SHAPE_DEF (length-framed delta-encoded decipixel M/L/Q/C/Z vector symbol)
          const payloadLen = view.getUint32(offset, true); offset += 4;
          const endOff = Math.min(len, offset + payloadLen);
          if (!scene.vectorDict) scene.vectorDict = { styles: [], shapes: [], stamps: [] };
          const id = getStr(view.getUint16(offset, true)); offset += 2;
          const layerCount = bytes[offset++];
          const layers = [];
          for (let l = 0; l < layerCount && offset < endOff; l++) {
            const fillIdx = view.getUint16(offset, true); offset += 2;
            const strokeIdx = view.getUint16(offset, true); offset += 2;
            const strokeW = view.getUint16(offset, true) / 10; offset += 2;
            const lFlags = bytes[offset++];
            const cmdCount = view.getUint16(offset, true); offset += 2;
            const commands = [];
            let penX = 0, penY = 0;
            for (let c = 0; c < cmdCount && offset < endOff; c++) {
              const cop = bytes[offset++];
              if (cop === 1) {
                penX += view.getInt16(offset, true); offset += 2;
                penY += view.getInt16(offset, true); offset += 2;
                commands.push({ op: 'M', x: penX / 10, y: penY / 10 });
              } else if (cop === 2) {
                penX += view.getInt16(offset, true); offset += 2;
                penY += view.getInt16(offset, true); offset += 2;
                commands.push({ op: 'L', x: penX / 10, y: penY / 10 });
              } else if (cop === 3) {
                const qx = penX + view.getInt16(offset, true); offset += 2;
                const qy = penY + view.getInt16(offset, true); offset += 2;
                penX += view.getInt16(offset, true); offset += 2;
                penY += view.getInt16(offset, true); offset += 2;
                commands.push({ op: 'Q', cx: qx / 10, cy: qy / 10, x: penX / 10, y: penY / 10 });
              } else if (cop === 4) {
                const x1 = penX + view.getInt16(offset, true); offset += 2;
                const y1 = penY + view.getInt16(offset, true); offset += 2;
                const x2 = penX + view.getInt16(offset, true); offset += 2;
                const y2 = penY + view.getInt16(offset, true); offset += 2;
                penX += view.getInt16(offset, true); offset += 2;
                penY += view.getInt16(offset, true); offset += 2;
                commands.push({ op: 'C', x1: x1 / 10, y1: y1 / 10, x2: x2 / 10, y2: y2 / 10, x: penX / 10, y: penY / 10 });
              } else if (cop === 5) {
                commands.push({ op: 'Z' });
              }
            }
            const layerObj = { commands };
            if (fillIdx !== 0xffff) layerObj.fillStyle = fillIdx;
            if (strokeIdx !== 0xffff) { layerObj.strokeStyle = strokeIdx; layerObj.strokeWidth = strokeW; }
            if (lFlags & 0x01) layerObj.evenOdd = true;
            if (lFlags & 0x02) layerObj.roundCap = true;
            if (lFlags & 0x04) layerObj.roundJoin = true;
            if (lFlags & 0x08) layerObj.ariaHidden = true;
            layers.push(layerObj);
          }
          scene.vectorDict.shapes.push({ id, layers });
          offset = endOff;
          break;
        }
        case 0x84: { // OP_STAMP (fixed 32-byte 6-float affine display-list stamp)
          if (!scene.vectorDict) scene.vectorDict = { styles: [], shapes: [], stamps: [] };
          const depth = view.getUint16(offset, true); offset += 2;
          const symbolId = getStr(view.getUint16(offset, true)); offset += 2;
          const instanceId = getStr(view.getUint16(offset, true)); offset += 2;
          const a = view.getFloat32(offset, true); offset += 4;
          const b = view.getFloat32(offset, true); offset += 4;
          const c = view.getFloat32(offset, true); offset += 4;
          const d = view.getFloat32(offset, true); offset += 4;
          const e = view.getFloat32(offset, true); offset += 4;
          const f = view.getFloat32(offset, true); offset += 4;
          const opacity = bytes[offset++] / 255;
          const sFlags = bytes[offset++];
          const stObj = { depth, symbolId, matrix: [a, b, c, d, e, f], opacity };
          if (instanceId) stObj.instanceId = instanceId;
          if (sFlags & 0x01) stObj.ariaHidden = true;
          scene.vectorDict.stamps.push(stObj);
          break;
        }
        case 0x10: { // OP_KEYFRAME
          const normT = view.getUint16(offset, true); offset += 2;
          const titleIdx = view.getUint16(offset, true); offset += 2;
          const ruleIdx = view.getUint16(offset, true); offset += 2;
          scene.keyframes.push({
            t: Number((normT / 65535).toFixed(4)),
            title: getStr(titleIdx),
            rule: getStr(ruleIdx)
          });
          break;
        }
        case 0x20: { // OP_SUBTITLE
          const startT = view.getUint16(offset, true); offset += 2;
          const endT = view.getUint16(offset, true); offset += 2;
          const langCount = bytes[offset++];
          const subObj = {
            start: Number((startT / 65535).toFixed(4)),
            end: Number((endT / 65535).toFixed(4)),
            en: ''
          };
          for (let i = 0; i < langCount; i++) {
            const lKey = getStr(view.getUint16(offset, true)); offset += 2;
            const lVal = getStr(view.getUint16(offset, true)); offset += 2;
            subObj[lKey] = lVal;
          }
          scene.subtitles.push(subObj);
          break;
        }
        case 0x30: { // OP_BINDING
          const targetIdx = view.getUint16(offset, true); offset += 2;
          const attrIdx = view.getUint16(offset, true); offset += 2;
          const exprIdx = view.getUint16(offset, true); offset += 2;
          const target = getStr(targetIdx);
          const attr = getStr(attrIdx);
          const expr = getStr(exprIdx);

          if (target === ':camera' && attr === 'pitch') {
            scene.camera = Object.assign(scene.camera || { distance: 500, pitch: 20, yaw: 0, fov: 60 }, { pitch: expr });
            scene.has3D = true;
          } else if (target === ':camera' && attr === 'camera') {
            try {
              const camData = expr.startsWith('{') ? JSON.parse(expr) : null;
              if (camData) {
                scene.camera = Object.assign(scene.camera || { distance: 500, pitch: 20, yaw: 0, fov: 60 }, camData);
              }
              scene.has3D = true;
            } catch {}
          } else if (attr === ':3d-node' || attr === '3d-node') {
            if (expr.startsWith('{')) {
              try { scene.bindings.push({ type: '3d-node', target, ...JSON.parse(expr) }); } catch {}
            } else {
              const p = expr.split('|');
              scene.bindings.push({
                type: '3d-node',
                target,
                x: p[0],
                y: p[1],
                z: p[2],
                baseR: parseFloat(p[3]) || 8,
                label: p[4] || null,
                depthFog: p[5] !== '0',
              });
            }
          } else if (attr === ':3d-ring' || attr === '3d-ring') {
            if (expr.startsWith('{')) {
              try { scene.bindings.push({ type: '3d-ring', target, ...JSON.parse(expr) }); } catch {}
            } else {
              const p = expr.split('|');
              scene.bindings.push({
                type: '3d-ring',
                target,
                r: p[0],
                cx: p[1],
                cy: p[2],
                cz: p[3],
                tiltX: p[4],
                tiltY: p[5],
                tiltZ: p[6],
                segments: parseInt(p[7], 10) || 24,
                depthFog: p[8] !== '0',
              });
            }
          } else if (attr === ':3d-line' || attr === '3d-line') {
            if (expr.startsWith('{')) {
              try { scene.bindings.push({ type: '3d-line', target, ...JSON.parse(expr) }); } catch {}
            } else {
              const p = expr.split('|');
              scene.bindings.push({
                type: '3d-line',
                target,
                x1: p[0],
                y1: p[1],
                z1: p[2],
                x2: p[3],
                y2: p[4],
                z2: p[5],
                cap1: p[6] || null,
                cap2: p[7] || null,
                baseR: parseFloat(p[8]) || 8,
              });
            }
          } else if (attr === ':3d-polygon' || attr === '3d-polygon') {
            if (expr.startsWith('{')) {
              try { scene.bindings.push({ type: '3d-polygon', target, ...JSON.parse(expr) }); } catch {}
            } else {
              const p = expr.split('|');
              scene.bindings.push({
                type: '3d-polygon',
                target,
                depthFog: p[0] !== '0',
                cullBackface: p[1] === '1',
                pointsExpr: p.slice(2).join('|'),
              });
            }
          } else {
            scene.bindings.push({
              type: '2d-attr',
              target,
              attr,
              expr
            });
          }
          break;
        }
        case 0x31: { // OP_BINDING_WHEN (guarded 2D binding)
          const targetIdx = view.getUint16(offset, true); offset += 2;
          const attrIdx = view.getUint16(offset, true); offset += 2;
          const exprIdx = view.getUint16(offset, true); offset += 2;
          const whenIdx = view.getUint16(offset, true); offset += 2;
          const whenStr = getStr(whenIdx);
          const entry = {
            type: '2d-attr',
            target: getStr(targetIdx),
            attr: getStr(attrIdx),
            expr: getStr(exprIdx)
          };
          if (whenStr) entry.when = whenStr;
          scene.bindings.push(entry);
          break;
        }
        case 0x32: { // OP_BINDING_VAR (reactive var-update binding)
          const varName = getStr(view.getUint16(offset, true)); offset += 2;
          const exprStr = getStr(view.getUint16(offset, true)); offset += 2;
          const whenStr = getStr(view.getUint16(offset, true)); offset += 2;
          const entry = {
            type: 'var-update',
            varName,
            expr: exprStr
          };
          if (whenStr) {
            if (whenStr.startsWith('@enter:')) entry.onEnter = whenStr.slice(7);
            else entry.when = whenStr;
          }
          scene.bindings.push(entry);
          break;
        }
        case 0x33: { // OP_3D_LINE (native binary descriptor, zero JSON.parse)
          const target = getStr(view.getUint16(offset, true)); offset += 2;
          const x1 = getStr(view.getUint16(offset, true)); offset += 2;
          const y1 = getStr(view.getUint16(offset, true)); offset += 2;
          const z1 = getStr(view.getUint16(offset, true)); offset += 2;
          const x2 = getStr(view.getUint16(offset, true)); offset += 2;
          const y2 = getStr(view.getUint16(offset, true)); offset += 2;
          const z2 = getStr(view.getUint16(offset, true)); offset += 2;
          const cap1 = getStr(view.getUint16(offset, true)); offset += 2;
          const cap2 = getStr(view.getUint16(offset, true)); offset += 2;
          const splitExpr = getStr(view.getUint16(offset, true)); offset += 2;
          const splineA = getStr(view.getUint16(offset, true)); offset += 2;
          const splineB = getStr(view.getUint16(offset, true)); offset += 2;
          const sortAfter = getStr(view.getUint16(offset, true)); offset += 2;
          const baseR = view.getFloat32(offset, true); offset += 4;
          const rawSplineIdx = view.getUint16(offset, true); offset += 2;
          const lineFlags = bytes[offset++];
          let zLayer;
          let zBias;
          if (lineFlags & 0x02) { zLayer = view.getFloat32(offset, true); offset += 4; }
          if (lineFlags & 0x04) { zBias = view.getFloat32(offset, true); offset += 4; }

          const lineBinding = {
            type: '3d-line',
            target,
            x1, y1, z1,
            x2, y2, z2,
            cap1: cap1 || '',
            cap2: cap2 || '',
            baseR,
            depthFog: Boolean(lineFlags & 0x01)
          };
          if (splitExpr) lineBinding.splitExpr = splitExpr;
          if (splineA) lineBinding.splineA = splineA;
          if (splineB) lineBinding.splineB = splineB;
          if (rawSplineIdx !== 0xffff) lineBinding.splineIndex = rawSplineIdx;
          if (sortAfter) lineBinding.sortAfter = sortAfter;
          if (zLayer !== undefined) lineBinding.zLayer = zLayer;
          if (zBias !== undefined) lineBinding.zBias = zBias;
          scene.bindings.push(lineBinding);
          break;
        }
        case 0x40: { // OP_CHECKPOINT
          const normT = view.getUint16(offset, true); offset += 2;
          const promptIdx = view.getUint16(offset, true); offset += 2;
          const ans = bytes[offset++];
          const explIdx = view.getUint16(offset, true); offset += 2;
          const optCount = bytes[offset++];
          const opts = [];
          for (let i = 0; i < optCount; i++) {
            opts.push(getStr(view.getUint16(offset, true)));
            offset += 2;
          }
          scene.checkpoints.push({
            t: Number((normT / 65535).toFixed(4)),
            prompt: getStr(promptIdx),
            options: opts,
            answer: ans,
            explanation: getStr(explIdx)
          });
          break;
        }
        case 0x41: { // OP_CHECKPOINT_GOAL
          const cpIdx = view.getUint16(offset, true); offset += 2;
          const titleStr = getStr(view.getUint16(offset, true)); offset += 2;
          const passExprStr = getStr(view.getUint16(offset, true)); offset += 2;
          const holdDur = view.getFloat32(offset, true); offset += 4;
          const wrongCount = bytes[offset++];
          const wrongMap = {};
          for (let i = 0; i < wrongCount; i++) {
            const optIdx = bytes[offset++];
            const hintStr = getStr(view.getUint16(offset, true)); offset += 2;
            wrongMap[optIdx] = hintStr;
          }
          const targetCp = scene.checkpoints[cpIdx];
          if (targetCp) {
            if (titleStr) targetCp.title = titleStr;
            if (passExprStr) targetCp.passExpr = passExprStr;
            if (holdDur > 0) targetCp.holdDuration = Number(holdDur.toFixed(3));
            if (wrongCount > 0) targetCp.onWrong = wrongMap;
          }
          break;
        }
        case 0x90: { // OP_SCOPE
          const target = getStr(view.getUint16(offset, true)); offset += 2;
          const xExpr = getStr(view.getUint16(offset, true)); offset += 2;
          const yExpr = getStr(view.getUint16(offset, true)); offset += 2;
          const samples = view.getUint16(offset, true); offset += 2;
          const xMin = view.getFloat32(offset, true); offset += 4;
          const xMax = view.getFloat32(offset, true); offset += 4;
          const yMin = view.getFloat32(offset, true); offset += 4;
          const yMax = view.getFloat32(offset, true); offset += 4;
          const plotX = view.getFloat32(offset, true); offset += 4;
          const plotY = view.getFloat32(offset, true); offset += 4;
          const plotW = view.getFloat32(offset, true); offset += 4;
          const plotH = view.getFloat32(offset, true); offset += 4;
          const scObj = {
            target,
            xExpr,
            yExpr,
            samples,
            xRange: [xMin, xMax],
            yRange: [yMin, yMax]
          };
          if (plotW > 0 && plotH > 0) {
            scObj.plot = [plotX, plotY, plotW, plotH];
          }
          scene.scopes.push(scObj);
          break;
        }
        case 0x91: { // OP_LEDGER
          const id = getStr(view.getUint16(offset, true)); offset += 2;
          const target = getStr(view.getUint16(offset, true)); offset += 2;
          const unit = getStr(view.getUint16(offset, true)); offset += 2;
          const maxExpr = getStr(view.getUint16(offset, true)); offset += 2;
          const lx = view.getFloat32(offset, true); offset += 4;
          const ly = view.getFloat32(offset, true); offset += 4;
          const lw = view.getFloat32(offset, true); offset += 4;
          const lh = view.getFloat32(offset, true); offset += 4;
          const termCount = bytes[offset++];
          const terms = [];
          for (let i = 0; i < termCount; i++) {
            const label = getStr(view.getUint16(offset, true)); offset += 2;
            const expr = getStr(view.getUint16(offset, true)); offset += 2;
            const color = getStr(view.getUint16(offset, true)); offset += 2;
            terms.push({ label, expr, color });
          }
          scene.ledgers.push({
            id,
            target: target || `#${id}`,
            unit,
            maxExpr,
            x: lx,
            y: ly,
            width: lw,
            height: lh,
            terms
          });
          break;
        }
        case 0x50: { // OP_GESTURE
          const targetIdx = view.getUint16(offset, true); offset += 2;
          const axisVal = bytes[offset++];
          const minVal = view.getFloat32(offset, true); offset += 4;
          const maxVal = view.getFloat32(offset, true); offset += 4;
          scene.gestures.push({
            target: getStr(targetIdx),
            axis: axisVal === 2 ? 'y' : axisVal === 3 ? 'xy' : 'x',
            min: minVal,
            max: maxVal,
            fromBytecode: true
          });
          break;
        }
        case 0x60: { // OP_VAR
          const nameIdx = view.getUint16(offset, true); offset += 2;
          const vType = bytes[offset++];
          let val = 0;
          if (vType === 3) {
            val = view.getFloat32(offset, true) > 0.5;
            offset += 4;
          } else if (vType === 2) {
            const sIdx = Math.round(view.getFloat32(offset, true));
            val = getStr(sIdx);
            offset += 4;
          } else {
            val = view.getFloat32(offset, true);
            offset += 4;
          }
          const minVal = view.getFloat32(offset, true); offset += 4;
          const maxVal = view.getFloat32(offset, true); offset += 4;
          const stepVal = view.getFloat32(offset, true); offset += 4;
          const labelIdx = view.getUint16(offset, true); offset += 2;
          const vName = getStr(nameIdx);
          const vLabel = getStr(labelIdx);
          scene.vars[vName] = val;
          break;
        }
        case 0x70: { // OP_INPUT
          const kindVal = bytes[offset++];
          const varIdx = view.getUint16(offset, true); offset += 2;
          const labelIdx = view.getUint16(offset, true); offset += 2;
          const minVal = view.getFloat32(offset, true); offset += 4;
          const maxVal = view.getFloat32(offset, true); offset += 4;
          const stepVal = view.getFloat32(offset, true); offset += 4;
          const vVar = getStr(varIdx);
          const vLabel = getStr(labelIdx);
          const cType = kindVal === 2 ? 'toggle' : (kindVal === 3 ? 'button' : 'slider');

          if (!scene.inputs) scene.inputs = [];
          scene.inputs.push({
            type: kindVal === 2 ? 'switch' : (kindVal === 3 ? 'button' : 'slider'),
            var: vVar,
            label: vLabel,
            min: minVal,
            max: maxVal,
            step: stepVal,
          });

          if (!scene.uiControls) scene.uiControls = [];
          scene.uiControls.push({
            id: vVar,
            type: cType,
            label: vLabel || vVar,
            bind: vVar,
            action: cType === 'button' ? (vVar === 'reset' ? '(sim:reset)' : null) : (cType === 'toggle' && (vVar === 'bsl' || vVar === 'bsl-active') ? '(player:toggle-bsl)' : null),
            min: minVal,
            max: maxVal,
            step: stepVal,
            default: minVal
          });
          break;
        }
        case 0x61: { // OP_COMPUTED
          const cName = getStr(view.getUint16(offset, true)); offset += 2;
          const cExpr = getStr(view.getUint16(offset, true)); offset += 2;
          if (!scene.computed) scene.computed = [];
          scene.computed.push({ name: cName, expr: cExpr });
          break;
        }
        case 0xA0: { // OP_SCENE_EXT (binary-complete scene extension sections)
          const extKey = getStr(view.getUint16(offset, true)); offset += 2;
          const extJson = getStr(view.getUint16(offset, true)); offset += 2;
          try {
            const parsed = JSON.parse(extJson);
            if (extKey === 'vars' && parsed && typeof parsed === 'object') {
              const hydratedVars = {};
              for (const [vk, vv] of Object.entries(parsed)) {
                if (vv && typeof vv === 'object') {
                  const isNum = typeof vv.value === 'number';
                  const hasMin = typeof vv.min === 'number';
                  const hasMax = typeof vv.max === 'number';
                  const hasStep = typeof vv.step === 'number';
                  hydratedVars[vk] = {
                    name: vv.name || vk,
                    value: vv.value,
                    defaultValue: vv.defaultValue !== undefined ? vv.defaultValue : vv.value,
                    min: hasMin ? vv.min : (isNum ? 0 : undefined),
                    max: hasMax ? vv.max : (isNum ? 100 : undefined),
                    step: hasStep ? vv.step : (isNum ? 1 : undefined),
                    hasMin,
                    hasMax,
                    hasStep,
                    hasExplicitBounds: hasMin && hasMax,
                    label: vv.label || vk,
                    ...(vv.unit ? { unit: vv.unit } : {}),
                  };
                } else {
                  hydratedVars[vk] = vv;
                }
              }
              scene.vars = hydratedVars;
            } else if (extKey === 'uiControls' && Array.isArray(parsed)) {
              scene.uiControls = parsed;
            } else if (extKey === 'inputs' && Array.isArray(parsed)) {
              scene.inputs = parsed;
              scene.uiControls = parsed;
            } else if (extKey === 'gestures' && Array.isArray(parsed)) scene.gestures = parsed;
            else if (extKey === 'bindInputs' && Array.isArray(parsed)) scene.bindInputs = parsed;
            else if (extKey === 'physics') scene.physics = parsed;
            else if (extKey === 'emitters' && Array.isArray(parsed)) scene.emitters = parsed;
            else if (extKey === 'stateMachines' && Array.isArray(parsed)) scene.stateMachines = parsed;
            else if (extKey === 'controls' && parsed && typeof parsed === 'object') scene.controls = parsed;
            else if (extKey === 'skills' && Array.isArray(parsed)) scene.skills = parsed;
            else if (extKey === 'definedSkills' && (typeof parsed === 'string' || Array.isArray(parsed))) scene.definedSkills = parsed;
            else if (extKey === 'cameraStops' && Array.isArray(parsed)) scene.cameraStops = parsed;
            else if (extKey === 'quests') scene.quests = parsed;
            else if (extKey === 'bootSound') scene.bootSound = String(parsed);
            else if (extKey === 'interactiveDisabled') scene.interactiveDisabled = Boolean(parsed);
            else if (extKey === 'actors' && Array.isArray(parsed)) scene.actors = parsed;
            else if (extKey === 'staticElements' && Array.isArray(parsed)) scene.staticElements = parsed;
          } catch {}
          break;
        }
        default:
          break;
      }
    }

    if (scene.vectorDict && !scene.svgMarkup) {
      scene.svgMarkup = hydrateVectorDictionaryToSvg(scene.vectorDict);
    }

    if (scene.checkpoints.length > 0) {
      scene.interactive = {
        checkpoints: scene.checkpoints,
        hotspots: []
      };
    }

    return scene;
  }

  function rgbaToHex(c) {
    const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return '#' + h(c.r) + h(c.g) + h(c.b);
  }

  function fmtDeci(v) {
    const r = Number(v.toFixed(1));
    return Object.is(r, -0) ? '0' : String(r);
  }

  function hydrateVectorDictionaryToSvg(dict, viewBox) {
    const vb = viewBox || dict.viewBox || '0 0 800 480';
    const defsParts = [];
    for (let i = 0; i < dict.styles.length; i++) {
      const st = dict.styles[i];
      if (st.kind === 'linear') {
        const stops = st.stops.map((s) => '<stop offset="' + Math.round(s.offset * 100) + '%" stop-color="' + rgbaToHex(s.color) + '"' + (s.color.a < 255 ? ' stop-opacity="' + (s.color.a / 255).toFixed(2) + '"' : '') + '/>').join('');
        defsParts.push('<linearGradient id="' + st.id + '" x1="' + st.x1 + '" y1="' + st.y1 + '" x2="' + st.x2 + '" y2="' + st.y2 + '">' + stops + '</linearGradient>');
      } else if (st.kind === 'radial') {
        const stops = st.stops.map((s) => '<stop offset="' + Math.round(s.offset * 100) + '%" stop-color="' + rgbaToHex(s.color) + '"' + (s.color.a < 255 ? ' stop-opacity="' + (s.color.a / 255).toFixed(2) + '"' : '') + '/>').join('');
        defsParts.push('<radialGradient id="' + st.id + '" cx="' + st.cx + '" cy="' + st.cy + '" r="' + st.r + '" fx="' + st.fx + '" fy="' + st.fy + '">' + stops + '</radialGradient>');
      }
    }
    for (let i = 0; i < dict.shapes.length; i++) {
      const sh = dict.shapes[i];
      const layerXml = sh.layers.map((layer) => {
        const dParts = [];
        for (let k = 0; k < layer.commands.length; k++) {
          const c = layer.commands[k];
          if (c.op === 'M') dParts.push('M' + fmtDeci(c.x) + ' ' + fmtDeci(c.y));
          else if (c.op === 'L') dParts.push('L' + fmtDeci(c.x) + ' ' + fmtDeci(c.y));
          else if (c.op === 'Q') dParts.push('Q' + fmtDeci(c.cx) + ' ' + fmtDeci(c.cy) + ' ' + fmtDeci(c.x) + ' ' + fmtDeci(c.y));
          else if (c.op === 'C') dParts.push('C' + fmtDeci(c.x1) + ' ' + fmtDeci(c.y1) + ' ' + fmtDeci(c.x2) + ' ' + fmtDeci(c.y2) + ' ' + fmtDeci(c.x) + ' ' + fmtDeci(c.y));
          else if (c.op === 'Z') dParts.push('Z');
        }
        let fillAttr = ' fill="none"';
        if (layer.fillStyle !== undefined && layer.fillStyle >= 0 && layer.fillStyle < dict.styles.length) {
          const fs = dict.styles[layer.fillStyle];
          if (fs.kind === 'solid') {
            fillAttr = ' fill="' + rgbaToHex(fs.color) + '"' + (fs.color.a < 255 ? ' fill-opacity="' + (fs.color.a / 255).toFixed(2) + '"' : '');
          } else {
            fillAttr = ' fill="url(#' + fs.id + ')"';
          }
        }
        let strokeAttr = '';
        if (layer.strokeStyle !== undefined && layer.strokeStyle >= 0 && layer.strokeStyle < dict.styles.length) {
          const ss = dict.styles[layer.strokeStyle];
          const sw = layer.strokeWidth !== undefined ? layer.strokeWidth : 1;
          const colorStr = ss.kind === 'solid' ? rgbaToHex(ss.color) : 'url(#' + ss.id + ')';
          const sop = ss.kind === 'solid' && ss.color.a < 255 ? ' stroke-opacity="' + (ss.color.a / 255).toFixed(2) + '"' : '';
          strokeAttr = ' stroke="' + colorStr + '"' + sop + ' stroke-width="' + fmtDeci(sw) + '"';
          if (layer.roundCap) strokeAttr += ' stroke-linecap="round"';
          if (layer.roundJoin) strokeAttr += ' stroke-linejoin="round"';
        }
        const eo = layer.evenOdd ? ' fill-rule="evenodd"' : '';
        const ah = layer.ariaHidden ? ' aria-hidden="true"' : '';
        return '<path d="' + dParts.join('') + '"' + fillAttr + strokeAttr + eo + ah + '/>';
      }).join('');
      defsParts.push('<g id="' + sh.id + '">' + layerXml + '</g>');
    }
    const sorted = dict.stamps.slice().sort((a, b) => a.depth - b.depth);
    const stampXml = sorted.map((st) => {
      const idAttr = st.instanceId ? ' id="' + st.instanceId + '"' : '';
      const m = st.matrix.map((n) => Number(n.toFixed(3))).join(' ');
      const op = st.opacity !== undefined && st.opacity < 0.999 ? ' opacity="' + Number(st.opacity.toFixed(2)) + '"' : '';
      const ah = st.ariaHidden ? ' aria-hidden="true"' : '';
      return '<use' + idAttr + ' href="#' + st.symbolId + '" transform="matrix(' + m + ')"' + op + ah + '/>';
    }).join('');
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg"><defs>' + defsParts.join('') + '</defs>' + stampXml + '</svg>';
  }

  global.isAstBytecode = isAstBytecode;
  global.decompileBytecode = decompileBytecode;
  global.hydrateVectorDictionaryToSvg = hydrateVectorDictionaryToSvg;
  if (typeof window !== 'undefined') {
    window.isAstBytecode = isAstBytecode;
    window.decompileBytecode = decompileBytecode;
    window.hydrateVectorDictionaryToSvg = hydrateVectorDictionaryToSvg;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isAstBytecode, decompileBytecode, hydrateVectorDictionaryToSvg };
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
