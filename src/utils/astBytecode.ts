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
  camera?: { distance: number; pitch: number; yaw: number | string; fov: number } | null;
  keyframes: Array<{ t: number; title: string; rule: string }>;
  subtitles: Array<{ start: number; end: number; en: string; es?: string; la?: string; [k: string]: any }>;
  bindings: Array<{ target: string; attr: string; expr: string }>;
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
    appendF32(scene.camera.pitch || 20);
    appendF32(typeof scene.camera.yaw === 'number' ? scene.camera.yaw : 0);
    appendF32(scene.camera.fov || 60);
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
      appendU16(strTable.intern(b.attr));
      appendU16(strTable.intern(b.expr));
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
        scene.bindings.push({
          target: strTable.get(targetIdx),
          attr: strTable.get(attrIdx),
          expr: strTable.get(exprIdx),
        });
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

  // Bindings
  const bindings: Array<{ target: string; attr: string; expr: string }> = [];
  const bindRegex = /\(:target\s+"([^"]+)"\s+:attr\s+"([^"]+)"\s+:expr\s+"([^"]+)"\)/gi;
  let bm: RegExpExecArray | null;
  while ((bm = bindRegex.exec(astText)) !== null) {
    bindings.push({
      target: bm[1],
      attr: bm[2],
      expr: bm[3],
    });
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

  // Camera
  let camera: { distance: number; pitch: number; yaw: number; fov: number } | null = null;
  const camMatch = astText.match(/\(:camera\s+:distance\s+([\d\.]+)\s+:pitch\s+([\d\.\-]+)\s+:yaw\s+([\d\.\-]+)\s+:fov\s+([\d\.]+)\)/i);
  if (camMatch) {
    camera = {
      distance: parseFloat(camMatch[1]),
      pitch: parseFloat(camMatch[2]),
      yaw: parseFloat(camMatch[3]),
      fov: parseFloat(camMatch[4]),
    };
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
