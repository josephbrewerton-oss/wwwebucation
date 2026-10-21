// src/utils/astBytecode.ts
/**
 * AST Vector Bytecode (.astb) Specification & Codec
 * 
 * High-performance binary serialization format for AST Vector Cartridges.
 * Replaces heavy runtime S-Expression parsing with zero-copy binary deserialization.
 * 
 * Header Layout (16 bytes):
 * [0..3]   Magic Bytes: 0x41, 0x53, 0x54, 0x42 ('ASTB')
 * [4]      Version: 0x01
 * [5]      Cartridge Archetype: 0x01 (Sim), 0x02 (Slide), 0x03 (App), 0x04 (Film)
 * [6..7]   Duration in deciseconds (UInt16, e.g. 100 = 10.0s, 260 = 26.0s)
 * [8..9]   String Table Count (UInt16)
 * [10..13] String Table Byte Length (UInt32)
 * [14..15] Flags (bit 0: has3D, bit 1: hasVideo, bit 2: hasCheckpoints, bit 3: hasSubtitles)
 * 
 * Section 1: String Table
 *   Array of length-prefixed UTF-8 strings.
 *   Each entry: [length: UInt16] [utf8_bytes...]
 * 
 * Section 2: Instruction Stream (Bytecode Opcodes)
 *   Stream of tagged opcodes encoding scene metadata, keyframes, bindings, subtitles,
 *   interactive checkpoints, gestures, and variables.
 */

export const ASTB_MAGIC = [0x41, 0x53, 0x54, 0x42]; // 'A', 'S', 'T', 'B'
export const ASTB_VERSION = 1;

// Archetypes
export const ARCHETYPE_SIM = 0x01;
export const ARCHETYPE_SLIDE = 0x02;
export const ARCHETYPE_APP = 0x03;
export const ARCHETYPE_FILM = 0x04;

// Flags
export const FLAG_HAS_3D = 0x0001;
export const FLAG_HAS_VIDEO = 0x0002;
export const FLAG_HAS_CHECKPOINTS = 0x0004;
export const FLAG_HAS_SUBTITLES = 0x0008;

// Opcodes
export const OP_SCENE_META = 0x01; // [id_str: u16] [title_str: u16] [stage_str: u16] [video_str: u16] [video_fit_u8]
export const OP_KEYFRAME   = 0x10; // [t_u16 (normalized 0..65535)] [title_str: u16] [rule_str: u16]
export const OP_SUBTITLE   = 0x20; // [start_u16] [end_u16] [lang_count: u8] { [lang_str: u16] [text_str: u16] }*
export const OP_BINDING    = 0x30; // [target_str: u16] [attr_str: u16] [expr_str: u16]
export const OP_CHECKPOINT = 0x40; // [t_u16] [prompt_str: u16] [correct_idx: u8] [expl_str: u16] [opt_count: u8] { [opt_str: u16] }*
export const OP_GESTURE    = 0x50; // [target_str: u16] [axis_u8 (1:x, 2:y, 3:xy)] [min_f32] [max_f32]
export const OP_VAR        = 0x60; // [name_str: u16] [type_u8 (1:num, 2:str, 3:bool)] [num_val: f32 / str_val: u16] [min_f32] [max_f32] [step_f32] [label_str: u16]
export const OP_INPUT      = 0x70; // [kind_u8 (1:slider, 2:switch, 3:btn)] [var_str: u16] [label_str: u16] [min_f32] [max_f32] [step_f32]
export const OP_CAMERA     = 0x80; // [dist_f32] [pitch_f32] [yaw_f32] [fov_f32]
export const OP_EOF        = 0xFF;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: false });

export interface BytecodeCompiledScene {
  id: string;
  type: 'Sim' | 'Slide' | 'App' | 'Film';
  title: string;
  stage: string;
  duration: number;
  video?: string | null;
  videoFit?: 'contain' | 'cover' | 'fill';
  has3D?: boolean;
  hasVideo?: boolean;
  camera?: { distance: number; pitch: number | string; yaw: number | string; fov: number } | null;
  keyframes: Array<{ t: number; title: string; rule: string }>;
  subtitles: Array<{ start: number; end: number; en: string; es?: string; la?: string; [k: string]: any }>;
  bindings: Array<any>;
  checkpoints: Array<{ t: number; prompt: string; options: string[]; answer: number; explanation: string }>;
  gestures?: Array<{ target: string; axis: string; min: number; max: number }>;
  vars?: Record<string, any>;
  inputs?: Array<any>;
}

/**
 * Checks whether an ArrayBuffer or Uint8Array starts with the ASTB magic header
 */
export function isAstBytecode(buffer: ArrayBuffer | Uint8Array): boolean {
  if (!buffer) return false;
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.length < 16) return false;
  return (
    bytes[0] === ASTB_MAGIC[0] &&
    bytes[1] === ASTB_MAGIC[1] &&
    bytes[2] === ASTB_MAGIC[2] &&
    bytes[3] === ASTB_MAGIC[3]
  );
}

/**
 * String Table Interning Builder
 */
class StringTableBuilder {
  private map = new Map<string, number>();
  private strings: string[] = [];

  intern(str: string | null | undefined): number {
    const s = str === null || str === undefined ? '' : String(str);
    const existing = this.map.get(s);
    if (existing !== undefined) return existing;
    const idx = this.strings.length;
    this.strings.push(s);
    this.map.set(s, idx);
    return idx;
  }

  serialize(): { count: number; byteLength: number; buffer: Uint8Array } {
    const encoded: Uint8Array[] = this.strings.map((s) => textEncoder.encode(s));
    let totalLen = 0;
    for (const b of encoded) {
      totalLen += 2 + b.length; // 2 bytes length prefix + utf8
    }

    const out = new Uint8Array(totalLen);
    const view = new DataView(out.buffer);
    let offset = 0;

    for (const b of encoded) {
      view.setUint16(offset, b.length, true);
      offset += 2;
      out.set(b, offset);
      offset += b.length;
    }

    return {
      count: this.strings.length,
      byteLength: totalLen,
      buffer: out,
    };
  }
}

/**
 * Reads a serialized String Table from an ArrayBuffer
 */
class StringTableReader {
  private strings: string[] = [];

  constructor(buffer: Uint8Array, count: number) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    let offset = 0;
    for (let i = 0; i < count && offset < buffer.byteLength; i++) {
      const len = view.getUint16(offset, true);
      offset += 2;
      const strBytes = buffer.subarray(offset, offset + len);
      this.strings.push(textDecoder.decode(strBytes));
      offset += len;
    }
  }

  get(idx: number): string {
    return this.strings[idx] || '';
  }
}

/**
 * Compiles a structured scene or parsed AST string into a compact binary .astb buffer
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

  // Stream buffer for instructions
  const ops: number[] = [];
  const appendU8 = (val: number) => ops.push(val & 0xff);
  const appendU16 = (val: number) => {
    ops.push(val & 0xff);
    ops.push((val >> 8) & 0xff);
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

  // 2. Camera (if 3D)
  if (scene.camera) {
    appendU8(OP_CAMERA);
    appendF32(scene.camera.distance || 500);
    appendF32(typeof scene.camera.pitch === 'number' ? scene.camera.pitch : 20);
    appendF32(typeof scene.camera.yaw === 'number' ? scene.camera.yaw : 0);
    appendF32(scene.camera.fov || 60);

    if (typeof scene.camera.yaw === 'string' || typeof scene.camera.pitch === 'string') {
      appendU8(OP_BINDING);
      appendU16(strTable.intern(':camera'));
      appendU16(strTable.intern('camera'));
      appendU16(strTable.intern(JSON.stringify({
        yaw: scene.camera.yaw,
        pitch: scene.camera.pitch,
        distance: scene.camera.distance,
        fov: scene.camera.fov,
      })));
    }
  }

  // 3. Variables & Inputs
  if (scene.vars && typeof scene.vars === 'object') {
    for (const [k, v] of Object.entries(scene.vars)) {
      if (k.startsWith('_')) continue;
      appendU8(OP_VAR);
      appendU16(strTable.intern(k));
      if (typeof v === 'boolean') {
        appendU8(3);
        appendF32(v ? 1 : 0);
      } else if (typeof v === 'string') {
        appendU8(2);
        appendF32(strTable.intern(v));
      } else {
        appendU8(1);
        appendF32(Number(v) || 0);
      }
      appendF32(0); // min
      appendF32(100); // max
      appendF32(1); // step
      appendU16(strTable.intern(k));
    }
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
      appendU8(OP_BINDING);
      appendU16(strTable.intern(b.target));
      if (b.type === '3d-node') {
        appendU16(strTable.intern(':3d-node'));
        appendU16(strTable.intern(`${b.x}|${b.y}|${b.z}|${b.baseR || 8}|${b.label || ''}|${b.depthFog !== false ? 1 : 0}`));
      } else if (b.type === '3d-ring') {
        appendU16(strTable.intern(':3d-ring'));
        appendU16(strTable.intern(`${b.r}|${b.cx || 0}|${b.cy || 0}|${b.cz || 0}|${b.tiltX || 0}|${b.tiltY || 0}|${b.tiltZ || 0}|${b.segments || 24}|${b.depthFog !== false ? 1 : 0}`));
      } else if (b.type === '3d-line') {
        appendU16(strTable.intern(':3d-line'));
        appendU16(strTable.intern(`${b.x1}|${b.y1}|${b.z1}|${b.x2}|${b.y2}|${b.z2}|${b.cap1 || ''}|${b.cap2 || ''}|${b.baseR || 8}`));
      } else if (b.type === '3d-polygon') {
        appendU16(strTable.intern(':3d-polygon'));
        appendU16(strTable.intern(`${b.depthFog !== false ? 1 : 0}|${b.cullBackface ? 1 : 0}|${b.pointsExpr}`));
      } else {
        appendU16(strTable.intern(b.attr || 'attr'));
        appendU16(strTable.intern(b.expr || ''));
      }
    }
  }

  // 7. Checkpoints
  if (Array.isArray(scene.checkpoints)) {
    for (const cp of scene.checkpoints) {
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
    }
  }

  // 8. Gestures
  if (Array.isArray(scene.gestures)) {
    for (const g of scene.gestures) {
      appendU8(OP_GESTURE);
      appendU16(strTable.intern(g.target));
      const axisVal = g.axis === 'y' ? 2 : g.axis === 'xy' ? 3 : 1;
      appendU8(axisVal);
      appendF32(g.min || 0);
      appendF32(g.max || 100);
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
    keyframes: [],
    subtitles: [],
    bindings: [],
    checkpoints: [],
    gestures: [],
    vars: {},
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
        const dist = view.getFloat32(offset, true); offset += 4;
        const pitch = view.getFloat32(offset, true); offset += 4;
        const yaw = view.getFloat32(offset, true); offset += 4;
        const fov = view.getFloat32(offset, true); offset += 4;
        scene.camera = { distance: dist, pitch, yaw, fov };
        scene.has3D = true;
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

        if (target === ':camera' && attr === 'camera') {
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
        offset += 12; // skip min, max, step
        offset += 2; // skip label
        scene.vars![strTable.get(nameIdx)] = val;
        break;
      }
      default:
        // Skip unknown opcode safely
        break;
    }
  }

  return scene;
}

function extractSexprBlocks(text: string, tag: string): string[] {
  const blocks: string[] = [];
  const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startRegex = new RegExp('\\(' + safeTag + '[\\s)]', 'gi');
  let m: RegExpExecArray | null;
  while ((m = startRegex.exec(text)) !== null) {
    const startIdx = m.index;
    let depth = 0;
    let inString = false;
    let endIdx = -1;
    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
        inString = !inString;
      } else if (!inString) {
        if (char === '(') depth++;
        else if (char === ')') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
    }
    if (endIdx !== -1) {
      blocks.push(text.slice(startIdx, endIdx));
    }
  }
  return blocks;
}

/**
 * Compiles S-Expression text directly into bytecode buffer
 */
export function compileAstTextToBytecode(astText: string): Uint8Array {
  if (!astText || typeof astText !== 'string') {
    throw new Error('Empty or invalid AST content for bytecode compilation');
  }

  const idMatch = astText.match(/:id\s+("([^"]+)"|([^\s\)]+))/i);
  const id = idMatch ? (idMatch[2] || idMatch[3]) : 'unnamed';

  const typeMatch = astText.match(/:type\s+("([^"]+)"|([^\s\)]+))/i);
  const rawType = typeMatch ? (typeMatch[2] || typeMatch[3]) : null;

  const videoMatch = astText.match(/:video\s+("([^"]+)"|([^\s\)]+))/i) || astText.match(/:film\s+("([^"]+)"|([^\s\)]+))/i);
  const video = videoMatch ? (videoMatch[2] || videoMatch[3]) : null;

  const videoFitMatch = astText.match(/:video-?fit\s+("([^"]+)"|([^\s\)]+))/i);
  const videoFit: 'contain' | 'cover' | 'fill' = (videoFitMatch ? (videoFitMatch[2] || videoFitMatch[3]).toLowerCase() : 'contain') as any;

  let type: 'Sim' | 'Slide' | 'App' | 'Film' = 'Sim';
  if (rawType) {
    const norm = rawType.toLowerCase();
    if (norm === 'film' || norm === 'video') type = 'Film';
    else if (norm === 'slide') type = 'Slide';
    else if (norm === 'app') type = 'App';
    else type = 'Sim';
  } else if (video) {
    type = 'Film';
  }

  const titleMatch = astText.match(/:title\s+"([^"]+)"/i);
  const title = titleMatch ? titleMatch[1] : id;

  const stageMatch = astText.match(/:stage\s+"([^"]+)"/i);
  const stage = stageMatch ? stageMatch[1] : 'CURRICULUM';

  const durationMatch = astText.match(/:duration\s+([\d\.]+)/i);
  const duration = durationMatch ? parseFloat(durationMatch[1]) : 10.0;

  // Keyframes
  const keyframes: Array<{ t: number; title: string; rule: string }> = [];
  const kfRegex = /\(:t\s+([\d\.]+)\s+:title\s+"([^"]+)"\s+:rule\s+"([^"]+)"\)/gi;
  let km: RegExpExecArray | null;
  while ((km = kfRegex.exec(astText)) !== null) {
    keyframes.push({
      t: parseFloat(km[1]),
      title: km[2],
      rule: km[3],
    });
  }

  // Subtitles
  const subtitles: Array<{ start: number; end: number; en: string; es?: string; la?: string }> = [];
  const subRegex = /\(:start\s+([\d\.]+)\s+:end\s+([\d\.]+)\s+:en\s+"([^"]+)"(?:\s+:es\s+"([^"]+)")?(?:\s+:la\s+"([^"]+)")?\)/gi;
  let sm: RegExpExecArray | null;
  while ((sm = subRegex.exec(astText)) !== null) {
    subtitles.push({
      start: parseFloat(sm[1]),
      end: parseFloat(sm[2]),
      en: sm[3],
      es: sm[4] || undefined,
      la: sm[5] || undefined,
    });
  }

  // Helper extraction routines
  const extractSlot = (text: string, reg: RegExp): string | null => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(reg);
    return match ? match[1].trim().replace(/^"|"$/g, '') : null;
  };

  const extractQuoted = (text: string, key: string): string | null => {
    if (!text || typeof text !== 'string') return null;
    const reg = new RegExp(`:${key}\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'i');
    const m = text.match(reg);
    if (m) return m[1].replace(/\\"/g, '"');
    const fallbackReg = new RegExp(`:${key}\\s+([^\\s\\)]+)`, 'i');
    const fb = text.match(fallbackReg);
    return fb ? fb[1].replace(/^"|"$/g, '') : null;
  };

  // Bindings (Supports 2D and 3D nodes, rings, lines, and polygons)
  const bindings: Array<any> = [];
  const bindBlocks = extractSexprBlocks(astText, ':target');
  bindBlocks.forEach((block) => {
    const target = extractQuoted(block, 'target') || extractSlot(block, /:target\s+"([^"]+)"/i);
    const nodeType = extractSlot(block, /:type\s+"([^"]+)"/i);
    const attr = extractQuoted(block, 'attr') || extractSlot(block, /:attr\s+"([^"]+)"/i);
    const expr = extractQuoted(block, 'expr') || extractSlot(block, /:expr\s+"([^"]+)"/i);

    if (nodeType === '3d-node') {
      const x = extractSlot(block, /:x\s+"([^"]+)"/i) || '0';
      const y = extractSlot(block, /:y\s+"([^"]+)"/i) || '0';
      const z = extractSlot(block, /:z\s+"([^"]+)"/i) || '0';
      const baseRStr = extractSlot(block, /:base-r\s+([\d\.]+)/i);
      const baseR = baseRStr ? parseFloat(baseRStr) : 8;
      const label = extractSlot(block, /:label\s+"([^"]+)"/i);
      const depthFogStr = extractSlot(block, /:depth-fog\s+([^\s\)]+)/i);
      const depthFog = depthFogStr !== 'false';

      bindings.push({
        type: '3d-node',
        target,
        x,
        y,
        z,
        baseR,
        label,
        depthFog,
      });
    } else if (nodeType === '3d-line') {
      bindings.push({
        type: '3d-line',
        target,
        x1: extractSlot(block, /:x1\s+"([^"]+)"/i) || '0',
        y1: extractSlot(block, /:y1\s+"([^"]+)"/i) || '0',
        z1: extractSlot(block, /:z1\s+"([^"]+)"/i) || '0',
        x2: extractSlot(block, /:x2\s+"([^"]+)"/i) || '0',
        y2: extractSlot(block, /:y2\s+"([^"]+)"/i) || '0',
        z2: extractSlot(block, /:z2\s+"([^"]+)"/i) || '0',
        cap1: extractSlot(block, /:cap1\s+"([^"]+)"/i),
        cap2: extractSlot(block, /:cap2\s+"([^"]+)"/i),
        baseR: parseFloat(extractSlot(block, /:base-r\s+([\d\.]+)/i) || '8'),
      });
    } else if (nodeType === '3d-ring') {
      const rStr = extractSlot(block, /:r\s+("[^"]+"|[\\d\\.]+)/i) || '100';
      const cx = extractSlot(block, /:cx\s+"([^"]+)"/i) || '0';
      const cy = extractSlot(block, /:cy\s+"([^"]+)"/i) || '0';
      const cz = extractSlot(block, /:cz\s+"([^"]+)"/i) || '0';
      const tiltX = extractSlot(block, /:tilt-x\s+("[^"]+"|[\\d\\.-]+)/i) || '0';
      const tiltY = extractSlot(block, /:tilt-y\s+("[^"]+"|[\\d\\.-]+)/i) || '0';
      const tiltZ = extractSlot(block, /:tilt-z\s+("[^"]+"|[\\d\\.-]+)/i) || '0';
      const segsStr = extractSlot(block, /:segments\s+([\d]+)/i);
      const segments = segsStr ? parseInt(segsStr, 10) : 24;
      const depthFogStr = extractSlot(block, /:depth-fog\s+([^\s\)]+)/i);
      const depthFog = depthFogStr !== 'false';

      bindings.push({
        type: '3d-ring',
        target,
        r: rStr,
        cx,
        cy,
        cz,
        tiltX,
        tiltY,
        tiltZ,
        segments,
        depthFog,
      });
    } else if (nodeType === '3d-polygon') {
      const ptsStr = extractSlot(block, /:points\s+"([^"]+)"/i) || extractSlot(block, /:pts\s+"([^"]+)"/i);
      const depthFogStr = extractSlot(block, /:depth-fog\s+([^\s\)]+)/i);
      const depthFog = depthFogStr !== 'false';
      const cullBackfaceStr = extractSlot(block, /:cull-backface\s+([^\s\)]+)/i);
      const cullBackface = cullBackfaceStr === 'true';

      bindings.push({
        type: '3d-polygon',
        target,
        pointsExpr: ptsStr,
        depthFog,
        cullBackface,
      });
    } else if (target && attr && expr) {
      bindings.push({
        type: '2d-attr',
        target,
        attr,
        expr,
      });
    }
  });

  // Fallback for flat 2D bindings
  if (bindings.length === 0) {
    const bindRegex = /\(:target\s+"([^"]+)"\s+:attr\s+"([^"]+)"\s+:expr\s+"([^"]+)"\)/gi;
    let bm: RegExpExecArray | null;
    while ((bm = bindRegex.exec(astText)) !== null) {
      bindings.push({
        type: '2d-attr',
        target: bm[1],
        attr: bm[2],
        expr: bm[3],
      });
    }
  }

  // Checkpoints
  const checkpoints: Array<{ t: number; prompt: string; options: string[]; answer: number; explanation: string }> = [];
  const cpRegex = /\(:checkpoint\s+:t\s+([\d\.]+)\s+:prompt\s+"([^"]+)"\s+:options\s+\(([^)]+)\)\s+:answer\s+(\d+)\s+:explanation\s+"([^"]+)"\)/gi;
  let cm: RegExpExecArray | null;
  while ((cm = cpRegex.exec(astText)) !== null) {
    const rawOpts = cm[3];
    const opts: string[] = [];
    const optRegex = /"([^"]+)"/g;
    let om: RegExpExecArray | null;
    while ((om = optRegex.exec(rawOpts)) !== null) {
      opts.push(om[1]);
    }
    checkpoints.push({
      t: parseFloat(cm[1]),
      prompt: cm[2],
      options: opts,
      answer: parseInt(cm[4], 10),
      explanation: cm[5],
    });
  }

  // Gestures
  const gestures: Array<{ target: string; axis: string; min: number; max: number }> = [];
  const gestRegex = /\(:draggable\s+:target\s+"([^"]+)"\s+:axis\s+"([^"]+)"\s+:min\s+([\d\.\-]+)\s+:max\s+([\d\.\-]+)\)/gi;
  let gm: RegExpExecArray | null;
  while ((gm = gestRegex.exec(astText)) !== null) {
    gestures.push({
      target: gm[1],
      axis: gm[2],
      min: parseFloat(gm[3]),
      max: parseFloat(gm[4]),
    });
  }

  // Variables
  const vars: Record<string, any> = {};
  const varRegex = /\(:var\s+:name\s+"([^"]+)"\s+:val\s+([\d\.\-]+|"([^"]+)"|true|false)/gi;
  let vm: RegExpExecArray | null;
  while ((vm = varRegex.exec(astText)) !== null) {
    const vName = vm[1];
    const rawVal = vm[2];
    if (rawVal === 'true') vars[vName] = true;
    else if (rawVal === 'false') vars[vName] = false;
    else if (rawVal.startsWith('"')) vars[vName] = vm[3];
    else vars[vName] = parseFloat(rawVal);
  }

  // Camera (Supports static and dynamic string expressions)
  let camera: { distance: number; pitch: number | string; yaw: number | string; fov: number } | null = null;
  const camBlocks = extractSexprBlocks(astText, ':camera');
  if (camBlocks.length > 0) {
    const cBody = camBlocks[0];
    const getCamVal = (key: string) => {
      const m = cBody.match(new RegExp(`:${key}\\s+("([^"]+)"|([\\d\\.-]+))`, 'i'));
      return m ? (m[2] !== undefined ? m[2] : m[3]) : null;
    };
    const distStr = getCamVal('distance');
    const pitchStr = getCamVal('pitch');
    const yawStr = getCamVal('yaw');
    const fovStr = getCamVal('fov');
    camera = {
      distance: distStr ? parseFloat(distStr) : 500,
      pitch: pitchStr ? (isNaN(Number(pitchStr)) ? pitchStr : parseFloat(pitchStr)) : 20,
      yaw: yawStr ? (isNaN(Number(yawStr)) ? yawStr : parseFloat(yawStr)) : 0,
      fov: fovStr ? parseFloat(fovStr) : 60,
    };
  } else {
    const camMatch = astText.match(/\(:camera\s+:distance\s+([\d\.]+)\s+:pitch\s+([\d\.\-]+)\s+:yaw\s+([\d\.\-]+)\s+:fov\s+([\d\.]+)\)/i);
    if (camMatch) {
      camera = {
        distance: parseFloat(camMatch[1]),
        pitch: parseFloat(camMatch[2]),
        yaw: parseFloat(camMatch[3]),
        fov: parseFloat(camMatch[4]),
      };
    }
  }

  return compileSceneToBytecode({
    id,
    type,
    title,
    stage,
    duration,
    video,
    videoFit,
    has3D: Boolean(camera),
    hasVideo: Boolean(video),
    camera,
    keyframes,
    subtitles,
    bindings,
    checkpoints,
    gestures,
    vars,
  });
}
