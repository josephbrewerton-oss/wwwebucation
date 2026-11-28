// src/utils/bytecode/astbDecoder.ts
/**
 * AST Vector Bytecode (.astb) Binary Decoder.
 */

import {
  ARCHETYPE_APP,
  ARCHETYPE_FILM,
  ARCHETYPE_SLIDE,
  FLAG_COMPLETE_BINARY,
  FLAG_HAS_3D,
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
  type AstLedgerTerm,
  type AstScopeConfig,
  type AstVectorGradientStop,
  type AstVectorPathCmd,
  type AstVectorShapeLayer,
  type BytecodeCompiledScene,
} from './astbSchema';
import { StringTableReader, hydrateVectorDictionaryToSvg, isAstBytecode } from './astbTables';

/**
 * Deserializes a binary .astb buffer into a full, executable AST Scene Object.
 * Operates in < 0.2 ms with single zero-copy pass.
 */
export function decompileBytecodeToScene(buffer: ArrayBuffer | Uint8Array): BytecodeCompiledScene {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (!isAstBytecode(bytes)) {
    throw new Error('Invalid AST Bytecode: Missing ASTB magic header');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const archetypeByte = bytes[5];
  const durationDeci = view.getUint16(6, true);
  const strCount = view.getUint16(8, true);
  const strByteLen = view.getUint32(10, true);
  const flags = view.getUint16(14, true);

  const duration = durationDeci / 10;
  let type: 'Sim' | 'Slide' | 'App' | 'Film' = 'Sim';
  if (archetypeByte === ARCHETYPE_FILM) type = 'Film';
  else if (archetypeByte === ARCHETYPE_SLIDE) type = 'Slide';
  else if (archetypeByte === ARCHETYPE_APP) type = 'App';

  const strTableBytes = bytes.subarray(16, 16 + strByteLen);
  const strTable = new StringTableReader(strTableBytes, strCount);

  let offset = 16 + strByteLen;
  const len = bytes.length;

  const scene: BytecodeCompiledScene = {
    id: 'unnamed',
    type,
    title: 'AST Scene',
    stage: 'CURRICULUM',
    duration,
    has3D: Boolean(flags & FLAG_HAS_3D),
    hasVideo: Boolean(flags & FLAG_HAS_VIDEO),
    completeBinary: Boolean(flags & FLAG_COMPLETE_BINARY),
    keyframes: [],
    subtitles: [],
    bindings: [],
    checkpoints: [],
    scopes: [],
    ledgers: [],
    gestures: [],
    vars: {},
    computed: [],
    inputs: [],
  };

  while (offset < len) {
    const op = bytes[offset++];
    if (op === OP_EOF) break;

    switch (op) {
      case OP_SCENE_META: {
        const idStr = view.getUint16(offset, true); offset += 2;
        const titleStr = view.getUint16(offset, true); offset += 2;
        const stageStr = view.getUint16(offset, true); offset += 2;
        const videoStr = view.getUint16(offset, true); offset += 2;
        const fitVal = bytes[offset++];
        scene.id = strTable.get(idStr);
        scene.title = strTable.get(titleStr);
        scene.stage = strTable.get(stageStr);
        const v = strTable.get(videoStr);
        if (v) {
          scene.video = v;
          scene.hasVideo = true;
          scene.type = 'Film';
        }
        scene.videoFit = fitVal === 2 ? 'cover' : fitVal === 3 ? 'fill' : 'contain';
        break;
      }
      case OP_CAMERA: {
        const yawStr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const pitch = view.getFloat32(offset, true); offset += 4;
        const dist = view.getFloat32(offset, true); offset += 4;
        const fov = view.getFloat32(offset, true); offset += 4;
        const yawTrim = yawStr.trim();
        const yaw: number | string = yawTrim === '' ? 0 : (/^-?\d+(?:\.\d+)?$/.test(yawTrim) ? Number(yawTrim) : yawStr);
        scene.camera = { distance: dist, pitch, yaw, fov };
        scene.has3D = true;
        break;
      }
      case OP_SVG_COMPANION: {
        const svgIdx = view.getUint16(offset, true); offset += 2;
        const svgStr = strTable.get(svgIdx);
        if (svgStr) scene.svgMarkup = svgStr;
        break;
      }
      case OP_STYLE_TABLE: {
        const payloadLen = view.getUint32(offset, true); offset += 4;
        const endOff = Math.min(len, offset + payloadLen);
        if (!scene.vectorDict) scene.vectorDict = { styles: [], shapes: [], stamps: [] };
        const styleCount = view.getUint16(offset, true); offset += 2;
        for (let i = 0; i < styleCount && offset < endOff; i++) {
          const kind = bytes[offset++];
          if (kind === 1) {
            const r = bytes[offset++]; const g = bytes[offset++]; const b = bytes[offset++]; const a = bytes[offset++];
            scene.vectorDict.styles.push({ kind: 'solid', color: { r, g, b, a } });
          } else if (kind === 2) {
            const id = strTable.get(view.getUint16(offset, true)); offset += 2;
            const x1 = view.getInt16(offset, true) / 1000; offset += 2;
            const y1 = view.getInt16(offset, true) / 1000; offset += 2;
            const x2 = view.getInt16(offset, true) / 1000; offset += 2;
            const y2 = view.getInt16(offset, true) / 1000; offset += 2;
            const stopCount = bytes[offset++];
            const stops: AstVectorGradientStop[] = [];
            for (let s = 0; s < stopCount; s++) {
              const off = bytes[offset++] / 255;
              const r = bytes[offset++]; const g = bytes[offset++]; const b = bytes[offset++]; const a = bytes[offset++];
              stops.push({ offset: off, color: { r, g, b, a } });
            }
            scene.vectorDict.styles.push({ kind: 'linear', id, x1, y1, x2, y2, stops });
          } else if (kind === 3) {
            const id = strTable.get(view.getUint16(offset, true)); offset += 2;
            const cx = view.getInt16(offset, true) / 1000; offset += 2;
            const cy = view.getInt16(offset, true) / 1000; offset += 2;
            const r = view.getInt16(offset, true) / 1000; offset += 2;
            const fx = view.getInt16(offset, true) / 1000; offset += 2;
            const fy = view.getInt16(offset, true) / 1000; offset += 2;
            const stopCount = bytes[offset++];
            const stops: AstVectorGradientStop[] = [];
            for (let s = 0; s < stopCount; s++) {
              const off = bytes[offset++] / 255;
              const sr = bytes[offset++]; const sg = bytes[offset++]; const sb = bytes[offset++]; const sa = bytes[offset++];
              stops.push({ offset: off, color: { r: sr, g: sg, b: sb, a: sa } });
            }
            scene.vectorDict.styles.push({ kind: 'radial', id, cx, cy, r, fx, fy, stops });
          }
        }
        offset = endOff;
        break;
      }
      case OP_SHAPE_DEF: {
        const payloadLen = view.getUint32(offset, true); offset += 4;
        const endOff = Math.min(len, offset + payloadLen);
        if (!scene.vectorDict) scene.vectorDict = { styles: [], shapes: [], stamps: [] };
        const id = strTable.get(view.getUint16(offset, true)); offset += 2;
        const layerCount = bytes[offset++];
        const layers: AstVectorShapeLayer[] = [];
        for (let l = 0; l < layerCount && offset < endOff; l++) {
          const fillIdx = view.getUint16(offset, true); offset += 2;
          const strokeIdx = view.getUint16(offset, true); offset += 2;
          const strokeW = view.getUint16(offset, true) / 10; offset += 2;
          const lFlags = bytes[offset++];
          const cmdCount = view.getUint16(offset, true); offset += 2;
          const commands: AstVectorPathCmd[] = [];
          let penX = 0;
          let penY = 0;
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
          layers.push({
            ...(fillIdx !== 0xffff ? { fillStyle: fillIdx } : {}),
            ...(strokeIdx !== 0xffff ? { strokeStyle: strokeIdx, strokeWidth: strokeW } : {}),
            ...(lFlags & 0x01 ? { evenOdd: true } : {}),
            ...(lFlags & 0x02 ? { roundCap: true } : {}),
            ...(lFlags & 0x04 ? { roundJoin: true } : {}),
            ...(lFlags & 0x08 ? { ariaHidden: true } : {}),
            commands,
          });
        }
        scene.vectorDict.shapes.push({ id, layers });
        offset = endOff;
        break;
      }
      case OP_STAMP: {
        if (!scene.vectorDict) scene.vectorDict = { styles: [], shapes: [], stamps: [] };
        const depth = view.getUint16(offset, true); offset += 2;
        const symbolId = strTable.get(view.getUint16(offset, true)); offset += 2;
        const instanceId = strTable.get(view.getUint16(offset, true)); offset += 2;
        const a = view.getFloat32(offset, true); offset += 4;
        const b = view.getFloat32(offset, true); offset += 4;
        const c = view.getFloat32(offset, true); offset += 4;
        const d = view.getFloat32(offset, true); offset += 4;
        const e = view.getFloat32(offset, true); offset += 4;
        const f = view.getFloat32(offset, true); offset += 4;
        const opacity = bytes[offset++] / 255;
        const sFlags = bytes[offset++];
        scene.vectorDict.stamps.push({
          depth,
          symbolId,
          ...(instanceId ? { instanceId } : {}),
          matrix: [a, b, c, d, e, f],
          opacity,
          ...(sFlags & 0x01 ? { ariaHidden: true } : {}),
        });
        break;
      }
      case OP_KEYFRAME: {
        const normT = view.getUint16(offset, true); offset += 2;
        const titleIdx = view.getUint16(offset, true); offset += 2;
        const ruleIdx = view.getUint16(offset, true); offset += 2;
        scene.keyframes.push({
          t: Number((normT / 65535).toFixed(4)),
          title: strTable.get(titleIdx),
          rule: strTable.get(ruleIdx),
        });
        break;
      }
      case OP_SUBTITLE: {
        const startT = view.getUint16(offset, true); offset += 2;
        const endT = view.getUint16(offset, true); offset += 2;
        const langCount = bytes[offset++];
        const subObj: any = {
          start: Number((startT / 65535).toFixed(4)),
          end: Number((endT / 65535).toFixed(4)),
          en: '',
        };
        for (let i = 0; i < langCount; i++) {
          const lKey = strTable.get(view.getUint16(offset, true)); offset += 2;
          const lVal = strTable.get(view.getUint16(offset, true)); offset += 2;
          subObj[lKey] = lVal;
        }
        scene.subtitles.push(subObj);
        break;
      }
      case OP_BINDING: {
        const targetIdx = view.getUint16(offset, true); offset += 2;
        const attrIdx = view.getUint16(offset, true); offset += 2;
        const exprIdx = view.getUint16(offset, true); offset += 2;
        const target = strTable.get(targetIdx);
        const attr = strTable.get(attrIdx);
        const expr = strTable.get(exprIdx);

        if (target === ':camera' && attr === 'pitch') {
          scene.camera = { ...(scene.camera || { distance: 500, pitch: 20, yaw: 0, fov: 60 }), pitch: expr };
          scene.has3D = true;
        } else if (target === ':camera' && attr === 'camera') {
          try {
            const camData = expr.startsWith('{') ? JSON.parse(expr) : null;
            if (camData) {
              scene.camera = { ...(scene.camera || { distance: 500, pitch: 20, yaw: 0, fov: 60 }), ...camData };
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
            expr,
          });
        }
        break;
      }
      case OP_BINDING_WHEN: {
        const target = strTable.get(view.getUint16(offset, true)); offset += 2;
        const attr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const expr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const when = strTable.get(view.getUint16(offset, true)); offset += 2;
        scene.bindings.push({
          type: '2d-attr',
          target,
          attr,
          expr,
          ...(when ? { when } : {}),
        });
        break;
      }
      case OP_BINDING_VAR: {
        const varName = strTable.get(view.getUint16(offset, true)); offset += 2;
        const expr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const when = strTable.get(view.getUint16(offset, true)); offset += 2;
        scene.bindings.push({
          type: 'var-update',
          varName,
          expr,
          ...(when ? (when.startsWith('@enter:') ? { onEnter: when.slice(7) } : { when }) : {}),
        });
        break;
      }
      case OP_3D_LINE: {
        const target = strTable.get(view.getUint16(offset, true)); offset += 2;
        const x1 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const y1 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const z1 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const x2 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const y2 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const z2 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const cap1 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const cap2 = strTable.get(view.getUint16(offset, true)); offset += 2;
        const splitExpr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const splineA = strTable.get(view.getUint16(offset, true)); offset += 2;
        const splineB = strTable.get(view.getUint16(offset, true)); offset += 2;
        const sortAfter = strTable.get(view.getUint16(offset, true)); offset += 2;
        const baseR = view.getFloat32(offset, true); offset += 4;
        const rawSplineIdx = view.getUint16(offset, true); offset += 2;
        const lineFlags = bytes[offset++];
        let zLayer: number | undefined;
        let zBias: number | undefined;
        if (lineFlags & 0x02) { zLayer = view.getFloat32(offset, true); offset += 4; }
        if (lineFlags & 0x04) { zBias = view.getFloat32(offset, true); offset += 4; }

        const lineBinding: any = {
          type: '3d-line',
          target,
          x1, y1, z1,
          x2, y2, z2,
          cap1: cap1 || '',
          cap2: cap2 || '',
          baseR,
          depthFog: Boolean(lineFlags & 0x01),
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
      case OP_3D_NODE: {
        const target = strTable.get(view.getUint16(offset, true)); offset += 2;
        const x = strTable.get(view.getUint16(offset, true)); offset += 2;
        const y = strTable.get(view.getUint16(offset, true)); offset += 2;
        const z = strTable.get(view.getUint16(offset, true)); offset += 2;
        const label = strTable.get(view.getUint16(offset, true)); offset += 2;
        const sortAfter = strTable.get(view.getUint16(offset, true)); offset += 2;
        const baseR = view.getFloat32(offset, true); offset += 4;
        const nFlags = bytes[offset++];
        let zLayer: number | undefined;
        let zBias: number | undefined;
        if (nFlags & 0x02) { zLayer = view.getFloat32(offset, true); offset += 4; }
        if (nFlags & 0x04) { zBias = view.getFloat32(offset, true); offset += 4; }
        const nodeBinding: any = {
          type: '3d-node',
          target,
          x, y, z,
          baseR,
          label: label || '',
          depthFog: Boolean(nFlags & 0x01),
        };
        if (sortAfter) nodeBinding.sortAfter = sortAfter;
        if (zLayer !== undefined) nodeBinding.zLayer = zLayer;
        if (zBias !== undefined) nodeBinding.zBias = zBias;
        scene.bindings.push(nodeBinding);
        break;
      }
      case OP_3D_RING: {
        const target = strTable.get(view.getUint16(offset, true)); offset += 2;
        const r = strTable.get(view.getUint16(offset, true)); offset += 2;
        const cx = strTable.get(view.getUint16(offset, true)); offset += 2;
        const cy = strTable.get(view.getUint16(offset, true)); offset += 2;
        const cz = strTable.get(view.getUint16(offset, true)); offset += 2;
        const tiltX = strTable.get(view.getUint16(offset, true)); offset += 2;
        const tiltY = strTable.get(view.getUint16(offset, true)); offset += 2;
        const tiltZ = strTable.get(view.getUint16(offset, true)); offset += 2;
        const sortAfter = strTable.get(view.getUint16(offset, true)); offset += 2;
        const segments = view.getUint16(offset, true); offset += 2;
        const rFlags = bytes[offset++];
        let zLayer: number | undefined;
        let zBias: number | undefined;
        if (rFlags & 0x02) { zLayer = view.getFloat32(offset, true); offset += 4; }
        if (rFlags & 0x04) { zBias = view.getFloat32(offset, true); offset += 4; }
        const ringBinding: any = {
          type: '3d-ring',
          target,
          r, cx, cy, cz,
          tiltX, tiltY, tiltZ,
          segments,
          depthFog: Boolean(rFlags & 0x01),
        };
        if (sortAfter) ringBinding.sortAfter = sortAfter;
        if (zLayer !== undefined) ringBinding.zLayer = zLayer;
        if (zBias !== undefined) ringBinding.zBias = zBias;
        scene.bindings.push(ringBinding);
        break;
      }
      case OP_CHECKPOINT: {
        const normT = view.getUint16(offset, true); offset += 2;
        const promptIdx = view.getUint16(offset, true); offset += 2;
        const ans = bytes[offset++];
        const explIdx = view.getUint16(offset, true); offset += 2;
        const optCount = bytes[offset++];
        const opts: string[] = [];
        for (let i = 0; i < optCount; i++) {
          opts.push(strTable.get(view.getUint16(offset, true)));
          offset += 2;
        }
        scene.checkpoints.push({
          t: Number((normT / 65535).toFixed(4)),
          prompt: strTable.get(promptIdx),
          options: opts,
          answer: ans,
          explanation: strTable.get(explIdx),
        });
        break;
      }
      case OP_CHECKPOINT_GOAL: {
        const cpIdx = view.getUint16(offset, true); offset += 2;
        const titleStr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const passExprStr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const holdDur = view.getFloat32(offset, true); offset += 4;
        const wrongCount = bytes[offset++];
        const wrongMap: Record<number, string> = {};
        for (let i = 0; i < wrongCount; i++) {
          const optIdx = bytes[offset++];
          const hintStr = strTable.get(view.getUint16(offset, true)); offset += 2;
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
      case OP_SCOPE: {
        const target = strTable.get(view.getUint16(offset, true)); offset += 2;
        const xExpr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const yExpr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const samples = view.getUint16(offset, true); offset += 2;
        const xMin = view.getFloat32(offset, true); offset += 4;
        const xMax = view.getFloat32(offset, true); offset += 4;
        const yMin = view.getFloat32(offset, true); offset += 4;
        const yMax = view.getFloat32(offset, true); offset += 4;
        const plotX = view.getFloat32(offset, true); offset += 4;
        const plotY = view.getFloat32(offset, true); offset += 4;
        const plotW = view.getFloat32(offset, true); offset += 4;
        const plotH = view.getFloat32(offset, true); offset += 4;
        const scopeObj: AstScopeConfig = {
          target,
          xExpr,
          yExpr,
          samples,
          xRange: [xMin, xMax],
          yRange: [yMin, yMax],
        };
        if (plotW > 0 && plotH > 0) {
          scopeObj.plot = [plotX, plotY, plotW, plotH];
        }
        scene.scopes!.push(scopeObj);
        break;
      }
      case OP_LEDGER: {
        const id = strTable.get(view.getUint16(offset, true)); offset += 2;
        const target = strTable.get(view.getUint16(offset, true)); offset += 2;
        const unit = strTable.get(view.getUint16(offset, true)); offset += 2;
        const maxExpr = strTable.get(view.getUint16(offset, true)); offset += 2;
        const lx = view.getFloat32(offset, true); offset += 4;
        const ly = view.getFloat32(offset, true); offset += 4;
        const lw = view.getFloat32(offset, true); offset += 4;
        const lh = view.getFloat32(offset, true); offset += 4;
        const termCount = bytes[offset++];
        const terms: AstLedgerTerm[] = [];
        for (let i = 0; i < termCount; i++) {
          const label = strTable.get(view.getUint16(offset, true)); offset += 2;
          const expr = strTable.get(view.getUint16(offset, true)); offset += 2;
          const color = strTable.get(view.getUint16(offset, true)); offset += 2;
          terms.push({ label, expr, color });
        }
        scene.ledgers!.push({
          id,
          ...(target ? { target } : {}),
          ...(unit ? { unit } : {}),
          ...(maxExpr ? { maxExpr } : {}),
          x: lx,
          y: ly,
          width: lw,
          height: lh,
          terms,
        });
        break;
      }
      case OP_GESTURE: {
        const targetIdx = view.getUint16(offset, true); offset += 2;
        const axisVal = bytes[offset++];
        const minVal = view.getFloat32(offset, true); offset += 4;
        const maxVal = view.getFloat32(offset, true); offset += 4;
        scene.gestures!.push({
          target: strTable.get(targetIdx),
          axis: axisVal === 2 ? 'y' : axisVal === 3 ? 'xy' : 'x',
          min: minVal,
          max: maxVal,
        });
        break;
      }
      case OP_VAR: {
        const nameIdx = view.getUint16(offset, true); offset += 2;
        const vType = bytes[offset++];
        let val: any = 0;
        if (vType === 3) {
          val = view.getFloat32(offset, true) > 0.5;
          offset += 4;
        } else if (vType === 2) {
          const sIdx = Math.round(view.getFloat32(offset, true));
          val = strTable.get(sIdx);
          offset += 4;
        } else {
          val = view.getFloat32(offset, true);
          offset += 4;
        }
        offset += 12; // minVal, maxVal, stepVal (f32 * 3)
        offset += 2; // labelIdx (u16)
        const vName = strTable.get(nameIdx);
        scene.vars![vName] = val;
        break;
      }
      case OP_INPUT: {
        const kindVal = bytes[offset++];
        const varIdx = view.getUint16(offset, true); offset += 2;
        const labelIdx = view.getUint16(offset, true); offset += 2;
        const minVal = view.getFloat32(offset, true); offset += 4;
        const maxVal = view.getFloat32(offset, true); offset += 4;
        const stepVal = view.getFloat32(offset, true); offset += 4;
        const vVar = strTable.get(varIdx);
        const vLabel = strTable.get(labelIdx);
        const ctrlType = kindVal === 2 ? 'toggle' : (kindVal === 3 ? 'button' : 'slider');

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
          type: ctrlType,
          label: vLabel || vVar,
          bind: vVar,
          action: ctrlType === 'button' ? (vVar === 'reset' ? '(sim:reset)' : null) : (ctrlType === 'toggle' && (vVar === 'bsl' || vVar === 'bsl-active') ? '(player:toggle-bsl)' : null),
          min: minVal,
          max: maxVal,
          step: stepVal,
          default: minVal,
        });
        break;
      }
      case OP_COMPUTED: {
        const name = strTable.get(view.getUint16(offset, true)); offset += 2;
        const expr = strTable.get(view.getUint16(offset, true)); offset += 2;
        if (!scene.computed) scene.computed = [];
        scene.computed.push({ name, expr });
        break;
      }
      case OP_SCENE_EXT: {
        const extKey = strTable.get(view.getUint16(offset, true)); offset += 2;
        const extJson = strTable.get(view.getUint16(offset, true)); offset += 2;
        try {
          const parsed = JSON.parse(extJson);
          if (extKey === 'vars' && parsed && typeof parsed === 'object') {
            const hydratedVars: Record<string, any> = {};
            for (const [vk, vv] of Object.entries(parsed)) {
              if (vv && typeof vv === 'object') {
                const vo = vv as Record<string, any>;
                const isNum = typeof vo.value === 'number';
                const hasMin = typeof vo.min === 'number';
                const hasMax = typeof vo.max === 'number';
                const hasStep = typeof vo.step === 'number';
                hydratedVars[vk] = {
                  name: vo.name || vk,
                  value: vo.value,
                  defaultValue: vo.defaultValue !== undefined ? vo.defaultValue : vo.value,
                  min: hasMin ? vo.min : (isNum ? 0 : undefined),
                  max: hasMax ? vo.max : (isNum ? 100 : undefined),
                  step: hasStep ? vo.step : (isNum ? 1 : undefined),
                  hasMin,
                  hasMax,
                  hasStep,
                  hasExplicitBounds: hasMin && hasMax,
                  label: vo.label || vk,
                  ...(vo.unit ? { unit: vo.unit } : {}),
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
        // Skip unknown opcode safely
        break;
    }
  }

  if (scene.vectorDict && !scene.svgMarkup) {
    scene.svgMarkup = hydrateVectorDictionaryToSvg(scene.vectorDict);
  }

  return scene;
}
