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
        case 0x80: { // OP_CAMERA
          const dist = view.getFloat32(offset, true); offset += 4;
          const pitch = view.getFloat32(offset, true); offset += 4;
          const yaw = view.getFloat32(offset, true); offset += 4;
          const fov = view.getFloat32(offset, true); offset += 4;
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

          if (target === ':camera' && attr === 'camera') {
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
        default:
          break;
      }
    }

    if (scene.checkpoints.length > 0) {
      scene.interactive = {
        checkpoints: scene.checkpoints,
        hotspots: []
      };
    }

    return scene;
  }

  global.isAstBytecode = isAstBytecode;
  global.decompileBytecode = decompileBytecode;
  if (typeof window !== 'undefined') {
    window.isAstBytecode = isAstBytecode;
    window.decompileBytecode = decompileBytecode;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isAstBytecode, decompileBytecode };
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
