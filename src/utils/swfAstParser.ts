/**
 * src/utils/swfAstParser.ts
 *
 * St Joseph's Educational Media Suite - Legacy SWF to AST Vector Transcompiler
 * Decodes Adobe Flash / Shockwave Flash (.swf) binary vector files (FWS uncompressed & CWS zlib-compressed)
 * into high-fidelity SVG geometry + declarative AST S-Expressions (:scene :id ... (:keyframes ...)).
 *
 * Designed to preserve legacy educational Flash assets (math manipulatives, science simulations)
 * and modernize them into 0-cloud, zero-battery-drain, accessible 60 FPS vector components.
 */

import {
  parseDefineSoundTag,
  parseStartSoundTag,
  parseSwfBitmapTag,
  type SwfSoundDef,
  type SwfStartSoundEvent,
  type SwfBitmapDef,
} from './swfMediaDecoders';
import { decompressZwsSwf } from './swfLzmaDecoder';
import {
  putSwfHeaderRecord,
  type SwfFileAttributesFlags,
  type SwfHeaderIndexRecord,
  type SwfTagCensusSummary,
} from '../services/dbStore';

/** Increment whenever SWF parser / AVM1 / AVM2 / distiller capabilities advance so indexed SWFs can be flagged for re-upgrade. */
export const SWF_PARSER_SCHEMA_VERSION = 2;

export interface SwfSurfaceFilter {
  /** 'ds'=DropShadow, 'bl'=Blur, 'gl'=Glow, 'cm'=ColorMatrix */
  t: 'ds' | 'bl' | 'gl' | 'cm';
  c?: string;
  bx?: number;
  by?: number;
  ang?: number;
  d?: number;
  s?: number;
  m?: number[];
}

export interface SwfGradientDef {
  id: string;
  /** 'l'=linear, 'r'=radial */
  t: 'l' | 'r';
  m: number[];
  st: Array<[number, string]>;
  fp?: number;
}

export interface SwfBitmapPatternDef {
  id: string;
  b: number;
  m: number[];
}

interface SwfFillDefsCollector {
  gradients: SwfGradientDef[];
  patterns: SwfBitmapPatternDef[];
}

export type SwfCentrifugeVerdict = 'signal' | 'suspect' | 'reject-low-value';

export interface SwfCentrifugeReport {
  verdict: SwfCentrifugeVerdict;
  signalReasons: string[];
  suspectReasons: string[];
  sludgeReasons: string[];
  bucketErrors: {
    config: number;
    assets: number;
    code: number;
    display: number;
  };
  binaryDataTagCount: number;
  binaryDataBytes: number;
  externalDependencyHits: string[];
  sponsorSignalHits: string[];
  scriptLimits?: {
    maxRecursionDepth: number;
    scriptTimeoutSeconds: number;
  };
  hasXmlMetadata?: boolean;
}

export interface SwfMetadata {
  signature: 'FWS' | 'CWS' | 'ZWS' | 'UNKNOWN';
  version: number;
  fileLength: number;
  width: number;
  height: number;
  frameRate: number;
  frameCount: number;
  backgroundColor: string;
  shapeCount: number;
  morphShapeCount?: number;
  fontCount?: number;
  staticTextCount?: number;
  spriteCount?: number;
  buttonCount?: number;
  actionCount?: number;
  ruleCount?: number;
  keyBindingCount?: number;
  poolSlotCount?: number;
  strippedPreloaderFrames?: number;
  entryFrame?: number;
  isActionScript3?: boolean;
  hasAvm1Bytecode?: boolean;
  abcCount?: number;
  documentClass?: string;
  as3Classes?: string[];
  traitCount?: number;
  executionModel?: 'sim-continuous' | 'sim-modal' | 'static-vector';
  labels: { frame: number; name: string }[];
  stateMachines?: { id: string; initial: string; states: string[]; transitionsCount: number }[];
  variables?: { name: string; value: any }[];
  centrifuge?: SwfCentrifugeReport;
  importDebugSummary?: {
    totalTagsParsed: number;
    cachedDefsShapes: number;
    skippedTagIds: number[];
    bucketErrors?: SwfCentrifugeReport['bucketErrors'];
    centrifugeVerdict?: SwfCentrifugeVerdict;
  };
}

export interface SwfColorTransform {
  rMult: number;
  gMult: number;
  bMult: number;
  aMult: number;
  rAdd: number;
  gAdd: number;
  bAdd: number;
  aAdd: number;
  alpha: number;
}

export interface SwfTranspileResult {
  success: boolean;
  error?: string;
  metadata?: SwfMetadata;
  svgMarkup: string;
  astSource: string;
}

class BitReader {
  private buffer: Uint8Array;
  private bytePos: number = 0;
  private bitPos: number = 0;

  constructor(buffer: Uint8Array, startOffset = 0) {
    this.buffer = buffer;
    this.bytePos = startOffset;
    this.bitPos = 0;
  }

  get length(): number {
    return this.buffer.length;
  }

  get bytes(): Uint8Array {
    return this.buffer;
  }

  get offset(): number {
    return this.bytePos;
  }

  set offset(val: number) {
    this.bytePos = val;
    this.bitPos = 0;
  }

  readUI8(): number {
    this.syncBits();
    if (this.bytePos >= this.buffer.length) return 0;
    return this.buffer[this.bytePos++];
  }

  readUI16(): number {
    this.syncBits();
    if (this.bytePos + 1 >= this.buffer.length) return 0;
    const v = this.buffer[this.bytePos] | (this.buffer[this.bytePos + 1] << 8);
    this.bytePos += 2;
    return v;
  }

  readSI16(): number {
    const v = this.readUI16();
    return v & 0x8000 ? v - 0x10000 : v;
  }

  readUI32(): number {
    this.syncBits();
    if (this.bytePos + 3 >= this.buffer.length) return 0;
    const v = (
      this.buffer[this.bytePos] |
      (this.buffer[this.bytePos + 1] << 8) |
      (this.buffer[this.bytePos + 2] << 16) |
      (this.buffer[this.bytePos + 3] << 24)
    ) >>> 0;
    this.bytePos += 4;
    return v;
  }

  readSI32(): number {
    const u = this.readUI32();
    return u > 0x7fffffff ? u - 0x100000000 : u;
  }

  readFloat32(): number {
    this.syncBits();
    if (this.bytePos + 3 >= this.buffer.length) return 0;
    const buf = new ArrayBuffer(4);
    const u8 = new Uint8Array(buf);
    u8[0] = this.buffer[this.bytePos++];
    u8[1] = this.buffer[this.bytePos++];
    u8[2] = this.buffer[this.bytePos++];
    u8[3] = this.buffer[this.bytePos++];
    return new DataView(buf).getFloat32(0, true);
  }

  /**
   * Reads a SWF AVM1 IEEE-754 double (swapped 32-bit words: high word first, low word second).
   */
  readDouble(): number {
    this.syncBits();
    if (this.bytePos + 7 >= this.buffer.length) return 0;
    const buf = new ArrayBuffer(8);
    const u8 = new Uint8Array(buf);
    // SWF stores bytes [4,5,6,7, 0,1,2,3] relative to standard little-endian float64
    u8[4] = this.buffer[this.bytePos++];
    u8[5] = this.buffer[this.bytePos++];
    u8[6] = this.buffer[this.bytePos++];
    u8[7] = this.buffer[this.bytePos++];
    u8[0] = this.buffer[this.bytePos++];
    u8[1] = this.buffer[this.bytePos++];
    u8[2] = this.buffer[this.bytePos++];
    u8[3] = this.buffer[this.bytePos++];
    return new DataView(buf).getFloat64(0, true);
  }

  readString(): string {
    this.syncBits();
    let str = '';
    while (this.bytePos < this.buffer.length) {
      const b = this.buffer[this.bytePos++];
      if (b === 0) break;
      str += String.fromCharCode(b);
    }
    return str;
  }

  readBytes(count: number): Uint8Array {
    this.syncBits();
    const end = Math.min(this.bytePos + count, this.buffer.length);
    const sub = this.buffer.slice(this.bytePos, end);
    this.bytePos = end;
    return sub;
  }

  sliceBytes(start: number, end: number): Uint8Array {
    const s = Math.max(0, Math.min(start, this.buffer.length));
    const e = Math.max(s, Math.min(end, this.buffer.length));
    return this.buffer.subarray(s, e);
  }

  syncBits(): void {
    if (this.bitPos > 0) {
      this.bytePos++;
      this.bitPos = 0;
    }
  }

  readUBits(nbits: number): number {
    if (nbits === 0) return 0;
    let res = 0;
    for (let i = 0; i < nbits; i++) {
      if (this.bytePos >= this.buffer.length) return res;
      const bit = (this.buffer[this.bytePos] >> (7 - this.bitPos)) & 1;
      res = res * 2 + bit;
      this.bitPos++;
      if (this.bitPos === 8) {
        this.bitPos = 0;
        this.bytePos++;
      }
    }
    return res;
  }

  readSBits(nbits: number): number {
    if (nbits === 0) return 0;
    const val = this.readUBits(nbits);
    const signBit = Math.pow(2, nbits - 1);
    if (val >= signBit) {
      return val - Math.pow(2, nbits);
    }
    return val;
  }

  readRect(): { xMin: number; xMax: number; yMin: number; yMax: number; width: number; height: number } {
    this.syncBits();
    const nbits = this.readUBits(5);
    const xMin = this.readSBits(nbits) / 20; // 20 twips = 1 pixel
    const xMax = this.readSBits(nbits) / 20;
    const yMin = this.readSBits(nbits) / 20;
    const yMax = this.readSBits(nbits) / 20;
    this.syncBits();
    return {
      xMin,
      xMax,
      yMin,
      yMax,
      width: Math.abs(xMax - xMin),
      height: Math.abs(yMax - yMin),
    };
  }

  readMatrix(): { scaleX: number; scaleY: number; rotateSkew0: number; rotateSkew1: number; transX: number; transY: number } {
    this.syncBits();
    let scaleX = 1;
    let scaleY = 1;
    const hasScale = this.readUBits(1) === 1;
    if (hasScale) {
      const nScaleBits = this.readUBits(5);
      scaleX = this.readSBits(nScaleBits) / 65536;
      scaleY = this.readSBits(nScaleBits) / 65536;
    }

    let rotateSkew0 = 0;
    let rotateSkew1 = 0;
    const hasRotate = this.readUBits(1) === 1;
    if (hasRotate) {
      const nRotateBits = this.readUBits(5);
      rotateSkew0 = this.readSBits(nRotateBits) / 65536;
      rotateSkew1 = this.readSBits(nRotateBits) / 65536;
    }

    const nTransBits = this.readUBits(5);
    const transX = this.readSBits(nTransBits) / 20;
    const transY = this.readSBits(nTransBits) / 20;
    this.syncBits();

    return { scaleX, scaleY, rotateSkew0, rotateSkew1, transX, transY };
  }

  readCXForm(withAlpha = true): SwfColorTransform {
    this.syncBits();
    const hasAddTerms = this.readUBits(1) === 1;
    const hasMultTerms = this.readUBits(1) === 1;
    const nBits = this.readUBits(4);
    let rMult = 256, gMult = 256, bMult = 256, aMult = 256;
    let rAdd = 0, gAdd = 0, bAdd = 0, aAdd = 0;
    if (hasMultTerms) {
      rMult = this.readSBits(nBits);
      gMult = this.readSBits(nBits);
      bMult = this.readSBits(nBits);
      if (withAlpha) aMult = this.readSBits(nBits);
    }
    if (hasAddTerms) {
      rAdd = this.readSBits(nBits);
      gAdd = this.readSBits(nBits);
      bAdd = this.readSBits(nBits);
      if (withAlpha) aAdd = this.readSBits(nBits);
    }
    this.syncBits();
    const alpha = Math.max(0, Math.min(1, (aMult / 256) + (aAdd / 255)));
    return { rMult, gMult, bMult, aMult, rAdd, gAdd, bAdd, aAdd, alpha };
  }

  readRGBA(withAlpha = true): string {
    this.syncBits();
    const r = this.readUI8();
    const g = this.readUI8();
    const b = this.readUI8();
    const a = withAlpha ? (this.readUI8() / 255) : 1;
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

/**
 * Decompresses CWS (zlib-compressed) SWF payloads using Node zlib or browser's DecompressionStream.
 */
async function decompressSwfPayload(compressed: Uint8Array): Promise<Uint8Array> {
  // 1. Try Node.js native zlib if running in server / test environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const zlibModule = await import('node:zlib');
      const zlib = zlibModule.default || zlibModule;
      const buf = Buffer.from(compressed);
      try {
        const decomp = zlib.inflateSync(buf);
        return new Uint8Array(decomp.buffer, decomp.byteOffset, decomp.byteLength);
      } catch {
        const rawDeflate = buf.subarray(2, buf.length - 4);
        const decomp = zlib.inflateRawSync(rawDeflate);
        return new Uint8Array(decomp.buffer, decomp.byteOffset, decomp.byteLength);
      }
    } catch (_) {}
  }

  // 2. Try native Web DecompressionStream API in browser (with timeout guard against trailing-byte stalls)
  if (typeof DecompressionStream !== 'undefined') {
    const inflateWithStream = async (bytes: Uint8Array, format: 'deflate' | 'deflate-raw'): Promise<Uint8Array> => {
      const ds = new DecompressionStream(format);
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      const chunks: Uint8Array[] = [];
      let totalLen = 0;

      const writePromise = writer.write(bytes as unknown as BufferSource).then(() => writer.close()).catch(() => {});
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        reader.cancel().catch(() => {});
      }, 4000);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value && value.byteLength > 0) {
            chunks.push(value);
            totalLen += value.byteLength;
          }
        }
      } catch (readErr) {
        if (totalLen === 0 || timedOut) {
          clearTimeout(timer);
          throw readErr;
        }
        // Tolerate trailing garbage bytes after a valid zlib stream end (common in real Flash CWS files)
      } finally {
        clearTimeout(timer);
        await writePromise;
      }

      if (timedOut && totalLen === 0) {
        throw new Error(`DecompressionStream(${format}) timed out.`);
      }
      const out = new Uint8Array(totalLen);
      let off = 0;
      for (const c of chunks) {
        out.set(c, off);
        off += c.byteLength;
      }
      return out;
    };

    try {
      return await inflateWithStream(compressed, 'deflate');
    } catch {
      try {
        const rawDeflate = compressed.length > 6 ? compressed.slice(2, compressed.length - 4) : compressed.slice(2);
        return await inflateWithStream(rawDeflate, 'deflate-raw');
      } catch (err) {
        console.warn('[SWF-Parser] DecompressionStream error, trying fallback:', err);
      }
    }
  }

  throw new Error('Could not decompress zlib-encoded SWF binary in this environment.');
}

interface SwfMatrix {
  scaleX: number;
  scaleY: number;
  rotateSkew0: number;
  rotateSkew1: number;
  transX: number;
  transY: number;
}

interface SwfLineStyle {
  width: number;
  color: string;
  startCap?: number;
  joinStyle?: number;
  miterLimit?: number;
}

interface SwfDirectedEdge {
  x0: number; // integer twips
  y0: number; // integer twips
  x1: number; // integer twips
  y1: number; // integer twips
  cx?: number; // integer twips (quadratic control point)
  cy?: number; // integer twips
  isCurve: boolean;
}

function fmtTwipsPx(twips: number): string {
  const px = Math.round((twips / 20) * 100) / 100;
  const clean = Math.abs(px) < 1e-6 ? 0 : px;
  return Number.isInteger(clean * 10) ? clean.toFixed(1) : clean.toFixed(2);
}

function formatEdgeCommand(edge: SwfDirectedEdge): string {
  if (edge.isCurve) {
    return `Q ${fmtTwipsPx(edge.cx!)} ${fmtTwipsPx(edge.cy!)} ${fmtTwipsPx(edge.x1)} ${fmtTwipsPx(edge.y1)}`;
  }
  return `L ${fmtTwipsPx(edge.x1)} ${fmtTwipsPx(edge.y1)}`;
}

/**
 * Chains directed half-edges of a single fill style into closed SVG sub-paths (Z).
 */
function chainFillEdges(rawEdges: SwfDirectedEdge[]): string {
  const edges = rawEdges.filter(e => e.isCurve || e.x0 !== e.x1 || e.y0 !== e.y1);
  if (edges.length === 0) return '';

  const startBuckets = new Map<string, number[]>();
  const bucketCursor = new Map<string, number>();
  for (let i = 0; i < edges.length; i++) {
    const key = `${edges[i].x0},${edges[i].y0}`;
    let list = startBuckets.get(key);
    if (!list) {
      list = [];
      startBuckets.set(key, list);
    }
    list.push(i);
  }

  const used = new Uint8Array(edges.length);
  const popNextEdge = (x: number, y: number): number => {
    const key = `${x},${y}`;
    const list = startBuckets.get(key);
    if (!list) return -1;
    let cursor = bucketCursor.get(key) || 0;
    while (cursor < list.length && used[list[cursor]]) {
      cursor++;
    }
    if (cursor >= list.length) {
      bucketCursor.set(key, cursor);
      return -1;
    }
    const idx = list[cursor];
    bucketCursor.set(key, cursor + 1);
    used[idx] = 1;
    return idx;
  };

  const subPaths: string[] = [];
  for (let i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const first = edges[i];
    const startX = first.x0;
    const startY = first.y0;
    let curX = first.x1;
    let curY = first.y1;

    const cmds: string[] = [`M ${fmtTwipsPx(startX)} ${fmtTwipsPx(startY)}`, formatEdgeCommand(first)];

    while (curX !== startX || curY !== startY) {
      const nextIdx = popNextEdge(curX, curY);
      if (nextIdx === -1) break;
      const nextEdge = edges[nextIdx];
      cmds.push(formatEdgeCommand(nextEdge));
      curX = nextEdge.x1;
      curY = nextEdge.y1;
    }

    cmds.push('Z');
    subPaths.push(cmds.join(' '));
  }

  return subPaths.join(' ');
}

/**
 * Chains stroke edges of a single line style into contiguous SVG sub-paths.
 * Starts open polylines from zero in-degree vertices first, and closes loops with Z.
 */
function chainStrokeEdges(rawEdges: SwfDirectedEdge[]): string {
  const edges = rawEdges.filter(e => e.isCurve || e.x0 !== e.x1 || e.y0 !== e.y1);
  if (edges.length === 0) return '';

  const startBuckets = new Map<string, number[]>();
  const bucketCursor = new Map<string, number>();
  const inDegree = new Map<string, number>();

  for (let i = 0; i < edges.length; i++) {
    const startKey = `${edges[i].x0},${edges[i].y0}`;
    const endKey = `${edges[i].x1},${edges[i].y1}`;
    let list = startBuckets.get(startKey);
    if (!list) {
      list = [];
      startBuckets.set(startKey, list);
    }
    list.push(i);
    inDegree.set(endKey, (inDegree.get(endKey) || 0) + 1);
  }

  const used = new Uint8Array(edges.length);
  const popNextEdge = (x: number, y: number): number => {
    const key = `${x},${y}`;
    const list = startBuckets.get(key);
    if (!list) return -1;
    let cursor = bucketCursor.get(key) || 0;
    while (cursor < list.length && used[list[cursor]]) {
      cursor++;
    }
    if (cursor >= list.length) {
      bucketCursor.set(key, cursor);
      return -1;
    }
    const idx = list[cursor];
    bucketCursor.set(key, cursor + 1);
    used[idx] = 1;
    return idx;
  };

  const subPaths: string[] = [];
  const traceFrom = (startIdx: number) => {
    if (used[startIdx]) return;
    used[startIdx] = 1;
    const first = edges[startIdx];
    const startX = first.x0;
    const startY = first.y0;
    let curX = first.x1;
    let curY = first.y1;

    const cmds: string[] = [`M ${fmtTwipsPx(startX)} ${fmtTwipsPx(startY)}`, formatEdgeCommand(first)];
    while (curX !== startX || curY !== startY) {
      const nextIdx = popNextEdge(curX, curY);
      if (nextIdx === -1) break;
      const nextEdge = edges[nextIdx];
      cmds.push(formatEdgeCommand(nextEdge));
      curX = nextEdge.x1;
      curY = nextEdge.y1;
    }
    if (curX === startX && curY === startY) {
      cmds.push('Z');
    }
    subPaths.push(cmds.join(' '));
  };

  // Pass 1: open polylines starting at vertices with in-degree 0
  for (let i = 0; i < edges.length; i++) {
    const startKey = `${edges[i].x0},${edges[i].y0}`;
    if ((inDegree.get(startKey) || 0) === 0) {
      traceFrom(i);
    }
  }
  // Pass 2: remaining closed loops or branched segments in stream order
  for (let i = 0; i < edges.length; i++) {
    traceFrom(i);
  }

  return subPaths.join(' ');
}

function readFillStyle(
  reader: BitReader,
  tagVersion: number,
  defsCollector?: SwfFillDefsCollector
): string {
  const fillType = reader.readUI8();
  const hasAlpha = tagVersion >= 3;
  if (fillType === 0x00) {
    // Solid fill
    return reader.readRGBA(hasAlpha);
  } else if (fillType === 0x10 || fillType === 0x12 || fillType === 0x13) {
    // Linear (0x10), radial (0x12), or focal radial (0x13) gradient
    const mat = reader.readMatrix();
    const numGradients = reader.readUI8() & 0x0F;
    let firstColor = '#38bdf8';
    const stops: Array<[number, string]> = [];
    for (let g = 0; g < numGradients; g++) {
      const ratio = reader.readUI8();
      const col = reader.readRGBA(hasAlpha);
      if (g === 0) firstColor = col;
      stops.push([Number((ratio / 255).toFixed(3)), col]);
    }
    let focalPoint: number | undefined;
    if (fillType === 0x13) {
      focalPoint = Number((reader.readSI16() / 256).toFixed(3)); // FocalPoint (FIXED8) in SWF 8+ / DefineShape4
    }
    if (defsCollector && stops.length >= 2) {
      const gid = `swf-g-${defsCollector.gradients.length}`;
      const gDef: SwfGradientDef = {
        id: gid,
        t: fillType === 0x10 ? 'l' : 'r',
        m: [
          Number(mat.scaleX.toFixed(4)),
          Number(mat.rotateSkew0.toFixed(4)),
          Number(mat.rotateSkew1.toFixed(4)),
          Number(mat.scaleY.toFixed(4)),
          Number(mat.transX.toFixed(2)),
          Number(mat.transY.toFixed(2)),
        ],
        st: stops,
      };
      if (focalPoint !== undefined && Math.abs(focalPoint) > 0.001) gDef.fp = focalPoint;
      defsCollector.gradients.push(gDef);
      return `url(#${gid})`;
    }
    return firstColor;
  } else {
    // Pattern or bitmap fill (0x40-0x43)
    const bitmapId = reader.readUI16();
    const mat = reader.readMatrix();
    if (defsCollector && bitmapId !== 0xFFFF && bitmapId > 0) {
      const pid = `swf-p-${defsCollector.patterns.length}`;
      defsCollector.patterns.push({
        id: pid,
        b: bitmapId,
        m: [
          Number((mat.scaleX / 20).toFixed(4)),
          Number((mat.rotateSkew0 / 20).toFixed(4)),
          Number((mat.rotateSkew1 / 20).toFixed(4)),
          Number((mat.scaleY / 20).toFixed(4)),
          Number(mat.transX.toFixed(2)),
          Number(mat.transY.toFixed(2)),
        ],
      });
      return `url(#${pid})`;
    }
    return '#6366f1';
  }
}

function readFillStyleArray(
  reader: BitReader,
  tagVersion: number,
  defsCollector?: SwfFillDefsCollector
): string[] {
  reader.syncBits();
  let fillCount = reader.readUI8();
  if (fillCount === 0xFF && tagVersion >= 2) {
    fillCount = reader.readUI16();
  }
  const fillStyles: string[] = ['none'];
  for (let f = 0; f < fillCount && reader.offset < reader.length; f++) {
    fillStyles.push(readFillStyle(reader, tagVersion, defsCollector));
  }
  return fillStyles;
}

function readLineStyleArray(reader: BitReader, tagVersion: number): SwfLineStyle[] {
  reader.syncBits();
  let lineCount = reader.readUI8();
  if (lineCount === 0xFF && tagVersion >= 2) {
    lineCount = reader.readUI16();
  }
  const lineStyles: SwfLineStyle[] = [{ width: 0, color: 'none' }];
  for (let l = 0; l < lineCount && reader.offset < reader.length; l++) {
    const rawWidth = reader.readUI16() / 20; // twips to px
    const width = rawWidth > 0 ? Number(Math.max(0.5, rawWidth).toFixed(2)) : 1;
    if (tagVersion === 4) {
      // DefineShape4 LineStyle2: exact 16-bit flag word alignment
      const startCapStyle = reader.readUBits(2);
      const joinStyle = reader.readUBits(2);
      const hasFillFlag = reader.readUBits(1);
      reader.readUBits(1); // NoHScaleFlag
      reader.readUBits(1); // NoVScaleFlag
      reader.readUBits(1); // PixelHintingFlag
      reader.readUBits(5); // Reserved
      reader.readUBits(1); // NoClose
      reader.readUBits(2); // EndCapStyle
      let miterLimit: number | undefined;
      if (joinStyle === 2) {
        miterLimit = reader.readUI16() / 256; // 8.8 fixed-point MiterLimitFactor
      }
      const color = hasFillFlag === 1
        ? readFillStyle(reader, tagVersion)
        : reader.readRGBA(true);
      lineStyles.push({ width, color, startCap: startCapStyle, joinStyle, miterLimit });
    } else {
      const color = reader.readRGBA(tagVersion >= 3);
      lineStyles.push({ width, color });
    }
  }
  return lineStyles;
}

export type SwfShapePrimitive = [string, string, string, number]; // [d, fill, stroke, strokeWidth]

/**
 * Parses SWF DefineShape (1-4) tags into multi-path W3C SVG primitives grouped under <g id="swf-shape-${shapeId}">.
 */
function parseSwfShape(
  reader: BitReader,
  shapeId: number,
  tagVersion: number,
  tagEndOffset?: number,
  defsCollector?: SwfFillDefsCollector
): { id: string; charId: number; svg: string; primitives?: SwfShapePrimitive[]; bbox: { x: number; y: number; w: number; h: number } } {
  const shapeBounds = reader.readRect();
  if (tagVersion === 4) {
    reader.readRect(); // EdgeBounds in DefineShape4
    reader.readUI8();  // Flags (UsesFillWindingRule, UsesNonScalingStrokes, UsesScalingStrokes)
  }
  reader.syncBits();

  const fillStyles = readFillStyleArray(reader, tagVersion, defsCollector);
  const lineStyles = readLineStyleArray(reader, tagVersion);

  reader.syncBits();
  const numFillBits = reader.readUBits(4);
  const numLineBits = reader.readUBits(4);

  const shapeRecords = parseShapeRecords(reader, numFillBits, numLineBits, {
    fillStyles,
    lineStyles,
    tagVersion,
    endOffset: tagEndOffset,
    defsCollector,
  });
  reader.syncBits();

  const shapeSvg = shapeRecords.svgPaths.length > 0
    ? `<g id="swf-shape-${shapeId}">\n      ${shapeRecords.svgPaths.join('\n      ')}\n    </g>`
    : `<g id="swf-shape-${shapeId}" />`;

  return {
    id: `swf-shape-${shapeId}`,
    charId: shapeId,
    svg: shapeSvg,
    primitives: shapeRecords.primitives,
    bbox: {
      x: shapeBounds.xMin,
      y: shapeBounds.yMin,
      w: shapeBounds.width,
      h: shapeBounds.height
    }
  };
}

interface ParseShapeRecordsOptions {
  fillStyles?: string[];
  lineStyles?: SwfLineStyle[];
  tagVersion?: number;
  initialX?: number;
  initialY?: number;
  endOffset?: number;
  defsCollector?: SwfFillDefsCollector;
}

/**
 * Parses SWF shape records (MoveTo, straight edges, quadratic Bézier curves, and in-place NewStyles 0x10)
 * with per-style half-edge bucketing and closed contour chaining.
 */
function parseShapeRecords(
  reader: BitReader,
  numFillBits: number,
  numLineBits: number,
  options: ParseShapeRecordsOptions = {}
): { pathCommands: string[]; svgPaths: string[]; primitives: SwfShapePrimitive[]; curFill0: number; curFill1: number; curLine: number } {
  let curXTwips = Math.round((options.initialX || 0) * 20);
  let curYTwips = Math.round((options.initialY || 0) * 20);
  const pathCommands: string[] = [];
  const svgPaths: string[] = [];
  const primitives: SwfShapePrimitive[] = [];

  let curNumFillBits = numFillBits;
  let curNumLineBits = numLineBits;
  let curFillStyles: string[] = options.fillStyles || ['none'];
  let curLineStyles: SwfLineStyle[] = options.lineStyles || [{ width: 0, color: 'none' }];
  const tagVersion = options.tagVersion || 1;
  const maxOffset = options.endOffset !== undefined ? Math.min(options.endOffset, reader.length) : reader.length;

  let curFill0 = 0;
  let curFill1 = 0;
  let curLine = 0;

  const fillBuckets = new Map<number, SwfDirectedEdge[]>();
  const lineBuckets = new Map<number, SwfDirectedEdge[]>();

  const flushStyleBuckets = () => {
    const fillKeys = Array.from(fillBuckets.keys()).sort((a, b) => a - b);
    for (const fillIdx of fillKeys) {
      const edges = fillBuckets.get(fillIdx);
      if (!edges || edges.length === 0) continue;
      const fillColor = curFillStyles[fillIdx];
      if (!fillColor || fillColor === 'none') continue;
      const d = chainFillEdges(edges);
      if (d) {
        svgPaths.push(`<path d="${d}" fill="${fillColor}" stroke="none" />`);
        primitives.push([d, fillColor, 'none', 0]);
      }
    }

    const lineKeys = Array.from(lineBuckets.keys()).sort((a, b) => a - b);
    for (const lineIdx of lineKeys) {
      const edges = lineBuckets.get(lineIdx);
      if (!edges || edges.length === 0) continue;
      const lineStyle = curLineStyles[lineIdx];
      if (!lineStyle || lineStyle.color === 'none') continue;
      const d = chainStrokeEdges(edges);
      if (d) {
        svgPaths.push(`<path d="${d}" fill="none" stroke="${lineStyle.color}" stroke-width="${lineStyle.width}" stroke-linecap="round" stroke-linejoin="round" />`);
        primitives.push([d, 'none', lineStyle.color, lineStyle.width]);
      }
    }

    fillBuckets.clear();
    lineBuckets.clear();
  };

  while (reader.offset < maxOffset) {
    const typeFlag = reader.readUBits(1);
    if (typeFlag === 0) {
      // Non-edge record (STYLECHANGERECORD / ENDSHAPERECORD)
      const flags = reader.readUBits(5);
      if (flags === 0) {
        // End of shape record
        break;
      }

      if (flags & 0x01) {
        // MoveTo (absolute coordinates in twips relative to shape origin)
        const moveBits = reader.readUBits(5);
        curXTwips = reader.readSBits(moveBits);
        curYTwips = reader.readSBits(moveBits);
        pathCommands.push(`M ${fmtTwipsPx(curXTwips)} ${fmtTwipsPx(curYTwips)}`);
      }
      if (flags & 0x02) {
        curFill0 = reader.readUBits(curNumFillBits);
      }
      if (flags & 0x04) {
        curFill1 = reader.readUBits(curNumFillBits);
      }
      if (flags & 0x08) {
        curLine = reader.readUBits(curNumLineBits);
      }
      if (flags & 0x10) {
        // In-place StateNewStyles (DefineShape2 / DefineShape3 / DefineShape4)
        flushStyleBuckets();
        reader.syncBits();
        curFillStyles = readFillStyleArray(reader, tagVersion, options.defsCollector);
        curLineStyles = readLineStyleArray(reader, tagVersion);
        reader.syncBits();
        curNumFillBits = reader.readUBits(4);
        curNumLineBits = reader.readUBits(4);
        curFill0 = 0;
        curFill1 = 0;
        curLine = 0;
      }
    } else {
      // Edge record
      const straightFlag = reader.readUBits(1);
      const nbits = reader.readUBits(4) + 2;
      const x0 = curXTwips;
      const y0 = curYTwips;

      if (straightFlag === 1) {
        // Straight edge
        const generalLine = reader.readUBits(1);
        let dx = 0;
        let dy = 0;
        if (generalLine === 1) {
          dx = reader.readSBits(nbits);
          dy = reader.readSBits(nbits);
        } else {
          const vertFlag = reader.readUBits(1);
          if (vertFlag === 1) {
            dy = reader.readSBits(nbits);
          } else {
            dx = reader.readSBits(nbits);
          }
        }
        curXTwips += dx;
        curYTwips += dy;
        pathCommands.push(`L ${fmtTwipsPx(curXTwips)} ${fmtTwipsPx(curYTwips)}`);

        if (curFill1 > 0) {
          let bucket = fillBuckets.get(curFill1);
          if (!bucket) { bucket = []; fillBuckets.set(curFill1, bucket); }
          bucket.push({ x0, y0, x1: curXTwips, y1: curYTwips, isCurve: false });
        }
        if (curFill0 > 0) {
          let bucket = fillBuckets.get(curFill0);
          if (!bucket) { bucket = []; fillBuckets.set(curFill0, bucket); }
          bucket.push({ x0: curXTwips, y0: curYTwips, x1: x0, y1: y0, isCurve: false });
        }
        if (curLine > 0) {
          let bucket = lineBuckets.get(curLine);
          if (!bucket) { bucket = []; lineBuckets.set(curLine, bucket); }
          bucket.push({ x0, y0, x1: curXTwips, y1: curYTwips, isCurve: false });
        }
      } else {
        // Curved edge (Quadratic Bézier)
        const cx = curXTwips + reader.readSBits(nbits);
        const cy = curYTwips + reader.readSBits(nbits);
        const ax = cx + reader.readSBits(nbits);
        const ay = cy + reader.readSBits(nbits);
        curXTwips = ax;
        curYTwips = ay;
        pathCommands.push(`Q ${fmtTwipsPx(cx)} ${fmtTwipsPx(cy)} ${fmtTwipsPx(ax)} ${fmtTwipsPx(ay)}`);

        if (curFill1 > 0) {
          let bucket = fillBuckets.get(curFill1);
          if (!bucket) { bucket = []; fillBuckets.set(curFill1, bucket); }
          bucket.push({ x0, y0, x1: ax, y1: ay, cx, cy, isCurve: true });
        }
        if (curFill0 > 0) {
          let bucket = fillBuckets.get(curFill0);
          if (!bucket) { bucket = []; fillBuckets.set(curFill0, bucket); }
          // Swap endpoints for left-side fill0 while preserving quadratic control point
          bucket.push({ x0: ax, y0: ay, x1: x0, y1: y0, cx, cy, isCurve: true });
        }
        if (curLine > 0) {
          let bucket = lineBuckets.get(curLine);
          if (!bucket) { bucket = []; lineBuckets.set(curLine, bucket); }
          bucket.push({ x0, y0, x1: ax, y1: ay, cx, cy, isCurve: true });
        }
      }
    }
  }

  flushStyleBuckets();

  return { pathCommands, svgPaths, primitives, curFill0, curFill1, curLine };
}

type SwfGlyphCmd = ['M' | 'L', number, number] | ['Q', number, number, number, number];

interface SwfVectorFontDef {
  fontId: number;
  name: string;
  isFont3: boolean;
  emScale: number;
  glyphs: SwfGlyphCmd[][];
  codeTable: number[];
  advances: number[];
}

/**
 * Decodes a single SWF glyph SHAPE record (DefineFont / DefineFont2 / DefineFont3)
 * into raw EM-square vector commands (MoveTo, LineTo, QuadTo) with strict bounds guards.
 */
function parseGlyphShapeCommands(reader: BitReader, maxOffset: number): SwfGlyphCmd[] {
  reader.syncBits();
  if (reader.offset >= maxOffset) return [];
  const numFillBits = reader.readUBits(4);
  const numLineBits = reader.readUBits(4);
  const cmds: SwfGlyphCmd[] = [];
  let curX = 0;
  let curY = 0;
  let guard = 0;

  while (reader.offset < maxOffset && guard++ < 4096) {
    const typeFlag = reader.readUBits(1);
    if (typeFlag === 0) {
      const flags = reader.readUBits(5);
      if (flags === 0) break; // EndShapeRecord
      if (flags & 0x01) {
        const moveBits = reader.readUBits(5);
        curX = reader.readSBits(moveBits);
        curY = reader.readSBits(moveBits);
        cmds.push(['M', curX, curY]);
      }
      if (flags & 0x02) reader.readUBits(numFillBits);
      if (flags & 0x04) reader.readUBits(numFillBits);
      if (flags & 0x08) reader.readUBits(numLineBits);
      if (flags & 0x10) break; // StateNewStyles not valid in font glyphs
    } else {
      const straightFlag = reader.readUBits(1);
      const nbits = reader.readUBits(4) + 2;
      if (straightFlag === 1) {
        const generalLine = reader.readUBits(1);
        let dx = 0;
        let dy = 0;
        if (generalLine === 1) {
          dx = reader.readSBits(nbits);
          dy = reader.readSBits(nbits);
        } else {
          const vertFlag = reader.readUBits(1);
          if (vertFlag === 1) dy = reader.readSBits(nbits);
          else dx = reader.readSBits(nbits);
        }
        curX += dx;
        curY += dy;
        cmds.push(['L', curX, curY]);
      } else {
        const cx = curX + reader.readSBits(nbits);
        const cy = curY + reader.readSBits(nbits);
        const ax = cx + reader.readSBits(nbits);
        const ay = cy + reader.readSBits(nbits);
        curX = ax;
        curY = ay;
        cmds.push(['Q', cx, cy, ax, ay]);
      }
    }
  }
  return cmds;
}

/**
 * Parses SWF DefineFont (Tag 10), DefineFont2 (Tag 48), and DefineFont3 (Tag 75)
 * into pure-SVG Bézier glyph outline tables (zero external font files required).
 */
function parseDefineFontTag(
  reader: BitReader,
  tagType: number,
  tagEndOffset: number
): SwfVectorFontDef | null {
  if (reader.offset + 2 > tagEndOffset) return null;
  const fontId = reader.readUI16();
  const isFont3 = tagType === 75;
  const emScale = isFont3 ? 20480 : 1024;

  if (tagType === 10) {
    // DefineFont (Tag 10): OffsetTable[0] / 2 gives glyph count
    const tableStart = reader.offset;
    if (tableStart + 2 > tagEndOffset) {
      return { fontId, name: `Font${fontId}`, isFont3: false, emScale, glyphs: [], codeTable: [], advances: [] };
    }
    const firstOff = reader.readUI16();
    const numGlyphs = Math.min(4096, Math.floor(firstOff / 2));
    const offsets: number[] = [firstOff];
    for (let i = 1; i < numGlyphs && reader.offset + 2 <= tagEndOffset; i++) {
      offsets.push(reader.readUI16());
    }
    const glyphs: SwfGlyphCmd[][] = [];
    for (let i = 0; i < offsets.length; i++) {
      const gStart = tableStart + offsets[i];
      const gEnd = i + 1 < offsets.length ? Math.min(tagEndOffset, tableStart + offsets[i + 1]) : tagEndOffset;
      if (gStart >= tagEndOffset || gStart >= gEnd) {
        glyphs.push([]);
        continue;
      }
      reader.offset = gStart;
      glyphs.push(parseGlyphShapeCommands(reader, gEnd));
    }
    return { fontId, name: `Font${fontId}`, isFont3: false, emScale, glyphs, codeTable: [], advances: [] };
  }

  // DefineFont2 (Tag 48) & DefineFont3 (Tag 75)
  if (reader.offset + 3 > tagEndOffset) return null;
  const flags = reader.readUI8();
  const hasLayout = (flags & 0x80) !== 0;
  const wideOffsets = (flags & 0x08) !== 0;
  const wideCodes = (flags & 0x04) !== 0 || isFont3;
  reader.readUI8(); // LanguageCode
  const nameLen = reader.readUI8();
  let name = '';
  for (let i = 0; i < nameLen && reader.offset < tagEndOffset; i++) {
    const ch = reader.readUI8();
    if (ch !== 0) name += String.fromCharCode(ch);
  }
  if (reader.offset + 2 > tagEndOffset) {
    return { fontId, name: name || `Font${fontId}`, isFont3, emScale, glyphs: [], codeTable: [], advances: [] };
  }
  const numGlyphs = Math.min(4096, reader.readUI16());
  const glyphs: SwfGlyphCmd[][] = [];
  const codeTable: number[] = [];
  const advances: number[] = [];

  if (numGlyphs > 0) {
    const tableStart = reader.offset;
    const offsets: number[] = [];
    for (let i = 0; i < numGlyphs; i++) {
      if (wideOffsets) {
        if (reader.offset + 4 > tagEndOffset) break;
        offsets.push(reader.readUI32());
      } else {
        if (reader.offset + 2 > tagEndOffset) break;
        offsets.push(reader.readUI16());
      }
    }
    let codeTableOffset = tagEndOffset - tableStart;
    if (wideOffsets && reader.offset + 4 <= tagEndOffset) {
      codeTableOffset = reader.readUI32();
    } else if (!wideOffsets && reader.offset + 2 <= tagEndOffset) {
      codeTableOffset = reader.readUI16();
    }

    const codeTableAbs = Math.min(tagEndOffset, tableStart + codeTableOffset);
    for (let i = 0; i < offsets.length; i++) {
      const gStart = tableStart + offsets[i];
      const nextRel = i + 1 < offsets.length ? offsets[i + 1] : codeTableOffset;
      const gEnd = Math.min(tagEndOffset, tableStart + nextRel);
      if (gStart >= tagEndOffset || gStart >= gEnd) {
        glyphs.push([]);
        continue;
      }
      reader.offset = gStart;
      glyphs.push(parseGlyphShapeCommands(reader, gEnd));
    }

    if (codeTableAbs < tagEndOffset) {
      reader.offset = codeTableAbs;
      for (let i = 0; i < numGlyphs; i++) {
        if (wideCodes) {
          if (reader.offset + 2 > tagEndOffset) break;
          codeTable.push(reader.readUI16());
        } else {
          if (reader.offset + 1 > tagEndOffset) break;
          codeTable.push(reader.readUI8());
        }
      }
    }

    if (hasLayout && reader.offset + 6 <= tagEndOffset) {
      reader.readSI16(); // FontAscent
      reader.readSI16(); // FontDescent
      reader.readSI16(); // FontLeading
      for (let i = 0; i < numGlyphs && reader.offset + 2 <= tagEndOffset; i++) {
        advances.push(reader.readSI16());
      }
    }
  }

  return { fontId, name: name || `Font${fontId}`, isFont3, emScale, glyphs, codeTable, advances };
}

/**
 * Parses SWF DefineText (Tag 11) and DefineText2 (Tag 33) static vector text blocks
 * by transforming embedded DefineFont2/3 Bézier glyphs into pure SVG <path> primitives.
 */
function parseDefineTextTag(
  reader: BitReader,
  tagType: number,
  tagEndOffset: number,
  fonts: Map<number, SwfVectorFontDef>
): { id: string; charId: number; svg: string; primitives?: SwfShapePrimitive[]; bbox: { x: number; y: number; w: number; h: number } } | null {
  if (reader.offset + 2 > tagEndOffset) return null;
  const charId = reader.readUI16();
  const bounds = reader.readRect();
  const textMatrix = reader.readMatrix();
  const isText2 = tagType === 33;

  if (reader.offset + 2 > tagEndOffset) return null;
  const glyphBits = reader.readUI8();
  const advanceBits = reader.readUI8();

  let currentFontId = 0;
  let currentColor = '#ffffff';
  let currentTextHeight = 16;
  let cursorX = 0;
  let cursorY = 0;

  const pathsByColor = new Map<string, string[]>();
  const extractedChars: string[] = [];
  let recordGuard = 0;

  const xformPt = (lx: number, ly: number): [number, number] => [
    textMatrix.scaleX * lx + textMatrix.rotateSkew1 * ly + textMatrix.transX,
    textMatrix.rotateSkew0 * lx + textMatrix.scaleY * ly + textMatrix.transY,
  ];
  const fmtPx = (v: number): string => (Math.round(v * 100) / 100).toString();

  while (reader.offset < tagEndOffset && recordGuard++ < 2048) {
    reader.syncBits();
    if (reader.offset >= tagEndOffset) break;
    const header = reader.readUI8();
    if (header === 0) break; // EndOfRecordsFlag

    const hasFont = (header & 0x08) !== 0;
    const hasColor = (header & 0x04) !== 0;
    const hasYOffset = (header & 0x02) !== 0;
    const hasXOffset = (header & 0x01) !== 0;

    if (hasFont && reader.offset + 2 <= tagEndOffset) {
      currentFontId = reader.readUI16();
    }
    if (hasColor && reader.offset + (isText2 ? 4 : 3) <= tagEndOffset) {
      currentColor = reader.readRGBA(isText2);
    }
    if (hasXOffset && reader.offset + 2 <= tagEndOffset) {
      cursorX = reader.readSI16() / 20;
    }
    if (hasYOffset && reader.offset + 2 <= tagEndOffset) {
      cursorY = reader.readSI16() / 20;
    }
    if (hasFont && reader.offset + 2 <= tagEndOffset) {
      const thTwips = reader.readUI16();
      if (thTwips > 0) currentTextHeight = thTwips / 20;
    }
    if (reader.offset >= tagEndOffset) break;
    const glyphCount = reader.readUI8();
    const font = fonts.get(currentFontId);
    const scale = font && font.emScale > 0 ? currentTextHeight / font.emScale : 1 / 1024;

    for (let g = 0; g < glyphCount && reader.offset < tagEndOffset; g++) {
      const glyphIdx = reader.readUBits(glyphBits);
      const advPx = reader.readSBits(advanceBits) / 20;

      if (font) {
        const codePt = font.codeTable[glyphIdx];
        if (codePt && codePt >= 0x20 && codePt !== 0x7f) {
          extractedChars.push(String.fromCharCode(codePt));
        }
        const cmds = font.glyphs[glyphIdx];
        if (cmds && cmds.length > 0) {
          let bucket = pathsByColor.get(currentColor);
          if (!bucket) {
            bucket = [];
            pathsByColor.set(currentColor, bucket);
          }
          let dParts = '';
          for (let ci = 0; ci < cmds.length; ci++) {
            const cmd = cmds[ci];
            if (cmd[0] === 'M' || cmd[0] === 'L') {
              const [wx, wy] = xformPt(cursorX + cmd[1] * scale, cursorY + cmd[2] * scale);
              dParts += (dParts ? ' ' : '') + `${cmd[0]} ${fmtPx(wx)} ${fmtPx(wy)}`;
            } else if (cmd[0] === 'Q') {
              const [wcx, wcy] = xformPt(cursorX + cmd[1] * scale, cursorY + cmd[2] * scale);
              const [wax, way] = xformPt(cursorX + cmd[3] * scale, cursorY + cmd[4] * scale);
              dParts += (dParts ? ' ' : '') + `Q ${fmtPx(wcx)} ${fmtPx(wcy)} ${fmtPx(wax)} ${fmtPx(way)}`;
            }
          }
          if (dParts) {
            bucket.push(`${dParts} Z`);
          }
        }
      }
      cursorX += advPx;
    }
    reader.syncBits();
  }

  const primitives: SwfShapePrimitive[] = [];
  const pathEls: string[] = [];
  pathsByColor.forEach((parts, color) => {
    const d = parts.join(' ');
    if (d) {
      primitives.push([d, color, 'none', 0]);
      pathEls.push(`<path d="${d}" fill="${color}" fill-rule="evenodd" stroke="none" />`);
    }
  });

  const plainText = extractedChars.join('').trim();
  const ariaAttr = plainText
    ? ` role="img" aria-label="${plainText.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}"`
    : '';

  if (primitives.length > 0) {
    return {
      id: `swf-statictext-${charId}`,
      charId,
      svg: `<g id="swf-statictext-${charId}"${ariaAttr}>${pathEls.join('')}</g>`,
      primitives,
      bbox: { x: bounds.xMin, y: bounds.yMin, w: bounds.width, h: bounds.height },
    };
  }

  // Fallback for device-font DefineText blocks without embedded glyph outlines
  if (plainText) {
    const escapedText = plainText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const [tx, ty] = xformPt(bounds.xMin, bounds.yMin + Math.max(currentTextHeight * 0.8, bounds.height * 0.72));
    return {
      id: `swf-statictext-${charId}`,
      charId,
      svg: `<text id="swf-statictext-${charId}" x="${fmtPx(tx)}" y="${fmtPx(ty)}" fill="${currentColor}" font-size="${Math.max(8, Math.round(currentTextHeight))}" font-family="system-ui, sans-serif">${escapedText}</text>`,
      bbox: { x: bounds.xMin, y: bounds.yMin, w: bounds.width, h: bounds.height },
    };
  }

  return null;
}

export interface SwfMorphShape {
  id: string;
  shapeId: number;
  startD: string;
  endD: string;
  startFill: string;
  endFill: string;
  stroke: string;
  strokeWidth: number;
  svg: string;
  bbox: { x: number; y: number; w: number; h: number };
}

/**
 * Parses SWF DefineMorphShape (Tag 46) and DefineMorphShape2 (Tag 84) tags into interpolated SVG paths.
 */
function parseSwfMorphShape(
  reader: BitReader,
  shapeId: number,
  tagVersion: number
): SwfMorphShape {
  const startBounds = reader.readRect();
  const endBounds = reader.readRect();

  if (tagVersion === 2) {
    // DefineMorphShape2 (Tag 84)
    reader.readRect(); // StartEdgeBounds
    reader.readRect(); // EndEdgeBounds
    reader.readUI8();  // Flags
  }

  const offset = reader.readUI32();
  const morphOffsetBase = reader.offset;

  // Read MorphFillStyles
  let fillCount = reader.readUI8();
  if (fillCount === 0xFF) fillCount = reader.readUI16();
  const startFills: string[] = ['none'];
  const endFills: string[] = ['none'];

  for (let f = 0; f < fillCount; f++) {
    const fillType = reader.readUI8();
    if (fillType === 0x00) {
      startFills.push(reader.readRGBA(true));
      endFills.push(reader.readRGBA(true));
    } else if (fillType === 0x10 || fillType === 0x12) {
      reader.readMatrix();
      reader.readMatrix();
      const numGradients = reader.readUI8() & 0x0F;
      let firstColStart = '#38bdf8';
      let firstColEnd = '#818cf8';
      for (let g = 0; g < numGradients; g++) {
        reader.readUI8();
        const cs = reader.readRGBA(true);
        reader.readUI8();
        const ce = reader.readRGBA(true);
        if (g === 0) {
          firstColStart = cs;
          firstColEnd = ce;
        }
      }
      startFills.push(firstColStart);
      endFills.push(firstColEnd);
    } else {
      reader.readUI16();
      reader.readMatrix();
      reader.readMatrix();
      startFills.push('#6366f1');
      endFills.push('#a855f7');
    }
  }

  // Read MorphLineStyles
  let lineCount = reader.readUI8();
  if (lineCount === 0xFF) lineCount = reader.readUI16();
  const startLines: { width: number; color: string }[] = [{ width: 0, color: 'none' }];
  const endLines: { width: number; color: string }[] = [{ width: 0, color: 'none' }];

  for (let l = 0; l < lineCount; l++) {
    const startW = reader.readUI16() / 20;
    const endW = reader.readUI16() / 20;
    if (tagVersion === 2) {
      reader.readUI16(); // LineStyle2 flags
    }
    const startColor = reader.readRGBA(true);
    const endColor = reader.readRGBA(true);
    startLines.push({ width: Math.max(1, startW), color: startColor });
    endLines.push({ width: Math.max(1, endW), color: endColor });
  }

  // Read StartEdges
  reader.syncBits();
  const startNumFillBits = reader.readUBits(4);
  const startNumLineBits = reader.readUBits(4);
  const startEdges = parseShapeRecords(reader, startNumFillBits, startNumLineBits);

  // Jump to EndEdges using offset
  reader.offset = morphOffsetBase + offset;
  reader.syncBits();
  const endNumFillBits = reader.readUBits(4);
  const endNumLineBits = reader.readUBits(4);
  const endEdges = parseShapeRecords(reader, endNumFillBits, endNumLineBits);
  reader.syncBits();

  const startD = startEdges.pathCommands.join(' ') || `M ${startBounds.xMin.toFixed(1)} ${startBounds.yMin.toFixed(1)} h ${startBounds.width.toFixed(1)} v ${startBounds.height.toFixed(1)} h -${startBounds.width.toFixed(1)} Z`;
  const endD = endEdges.pathCommands.join(' ') || `M ${endBounds.xMin.toFixed(1)} ${endBounds.yMin.toFixed(1)} h ${endBounds.width.toFixed(1)} v ${endBounds.height.toFixed(1)} h -${endBounds.width.toFixed(1)} Z`;

  const startFill = startFills[startEdges.curFill0] || (startFills.length > 1 ? startFills[1] : '#38bdf8');
  const endFill = endFills[endEdges.curFill0] || (endFills.length > 1 ? endFills[1] : '#818cf8');
  const stroke = startLines[startEdges.curLine]?.color || 'none';
  const strokeWidth = startLines[startEdges.curLine]?.width || 1;

  const shapeSvg = `<path id="swf-morph-${shapeId}" d="${startD}" fill="${startFill}" stroke="${stroke}" stroke-width="${strokeWidth}" data-morph-end="${endD}" />`;

  return {
    id: `swf-morph-${shapeId}`,
    shapeId,
    startD,
    endD,
    startFill,
    endFill,
    stroke,
    strokeWidth,
    svg: shapeSvg,
    bbox: {
      x: Math.min(startBounds.xMin, endBounds.xMin),
      y: Math.min(startBounds.yMin, endBounds.yMin),
      w: Math.max(startBounds.width, endBounds.width),
      h: Math.max(startBounds.height, endBounds.height)
    }
  };
}

export interface Avm1LiftedStatement {
  kind: 'setVar' | 'play' | 'stop' | 'gotoFrame' | 'gotoLabel' | 'nextFrame' | 'prevFrame' | 'spawnPool' | 'removePool';
  varName?: string;
  expr?: string;
  rawVal?: any;
  targetPrefix?: string;
  frame?: number;
  label?: string;
  play?: boolean;
  poolBase?: string;
  sourceClip?: string;
  when?: string;
}

export interface SwfKeyBindingSpec {
  keyCode: number;
  domCode: string;
  varName: string;
}

export interface SwfActionRecord {
  frame: number;
  stops?: boolean;
  plays?: boolean;
  gotoFrames?: number[];
  gotoLabels?: string[];
  setVariables?: { name: string; value: any }[];
  branches?: { condition: string; target: string | number }[];
  statements?: Avm1LiftedStatement[];
  enterFrameStatements?: Avm1LiftedStatement[];
  eventHandlers?: { target: string; event: string; statements: Avm1LiftedStatement[] }[];
  usedKeys?: SwfKeyBindingSpec[];
  referencedProps?: Set<string>;
  poolRequests?: { sourceClip: string; poolBase: string }[];
  usesPreloaderApi?: boolean;
  rawBytecodeB64?: string;
}

export interface SwfClipAction {
  events: string[];
  eventFlags?: number;
  keyCode?: number;
  actionRecord: SwfActionRecord;
}

export interface SwfEditTextDef {
  charId: number;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  color: string;
  align: number;
  varName: string;
  text: string;
  isHtml: boolean;
  editable?: boolean;
  password?: boolean;
  multiline?: boolean;
  border?: boolean;
  maxLength?: number;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (!bytes || bytes.length === 0) return '';
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    out += alphabet[b0 >> 2];
    out += alphabet[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < len ? alphabet[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < len ? alphabet[b2 & 63] : '=';
  }
  return out;
}

function utf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  if (typeof TextEncoder !== 'undefined') {
    return bytesToBase64(new TextEncoder().encode(str));
  }
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
  return bytesToBase64(bytes);
}

export interface SwfDisplayEntry {
  depth: number;
  characterId: number;
  matrix?: SwfMatrix | null;
  cxform?: SwfColorTransform | null;
  filters?: SwfSurfaceFilter[];
  blendMode?: number;
  visible?: boolean;
  ratio?: number;
  name?: string;
  clipDepth?: number;
  clipActions?: SwfClipAction[];
}

function swfBlendModeToCss(bm?: number): string {
  switch (bm) {
    case 3: return 'multiply';
    case 4: return 'screen';
    case 5: return 'lighten';
    case 6: return 'darken';
    case 7: return 'difference';
    case 8: return 'plus-lighter';
    case 9: return 'difference';
    case 10: return 'exclusion';
    case 13: return 'overlay';
    case 14: return 'hard-light';
    default: return '';
  }
}

export interface SwfFrameSnapshot {
  frame: number;
  entries: Map<number, SwfDisplayEntry>;
}

export interface SwfSpriteDefinition {
  spriteId: number;
  frameCount: number;
  frames: SwfFrameSnapshot[];
  labels: { frame: number; name: string }[];
  actions: SwfActionRecord[];
  sounds?: SwfStartSoundEvent[];
  hasTimelineMotion: boolean;
}

export interface SwfButtonRecord {
  states: number; // bit0=Up, bit1=Over, bit2=Down, bit3=HitTest
  characterId: number;
  depth: number;
  matrix: SwfMatrix;
  cxform?: SwfColorTransform | null;
}

export interface SwfButtonCondAction {
  conditionFlags: number;
  keyCode: number;
  isClick: boolean;
  isOver: boolean;
  actionRecord: SwfActionRecord;
}

export interface SwfButtonDefinition {
  buttonId: number;
  isButton2: boolean;
  records: SwfButtonRecord[];
  actions: SwfButtonCondAction[];
}

const FLASH_PROP_INDEX_MAP: Record<number, string> = {
  0: '_x',
  1: '_y',
  2: '_xscale',
  3: '_yscale',
  4: '_currentframe',
  5: '_totalframes',
  6: '_alpha',
  7: '_visible',
  8: '_width',
  9: '_height',
  10: '_rotation',
  12: '_framesloaded',
};

const FLASH_PROP_SUFFIX_MAP: Record<string, string> = {
  _x: 'x',
  _y: 'y',
  _xscale: 'xscale',
  _yscale: 'yscale',
  _rotation: 'rotation',
  _alpha: 'alpha',
  _visible: 'visible',
  _currentframe: 'frame',
  _totalframes: 'totalframes',
  _framesloaded: 'framesloaded',
  _width: 'width',
  _height: 'height',
};

function sanitizeAstIdent(raw: string): string {
  const cleaned = String(raw || '').trim().replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+/, '');
  return cleaned || 'v';
}

function mapFlashKeyCode(keyCode: number): SwfKeyBindingSpec {
  switch (keyCode) {
    case 37: return { keyCode, domCode: 'ArrowLeft', varName: 'key_left' };
    case 38: return { keyCode, domCode: 'ArrowUp', varName: 'key_up' };
    case 39: return { keyCode, domCode: 'ArrowRight', varName: 'key_right' };
    case 40: return { keyCode, domCode: 'ArrowDown', varName: 'key_down' };
    case 32: return { keyCode, domCode: 'Space', varName: 'key_space' };
    case 8: return { keyCode, domCode: 'Backspace', varName: 'key_backspace' };
    case 9: return { keyCode, domCode: 'Tab', varName: 'key_tab' };
    case 13: return { keyCode, domCode: 'Enter', varName: 'key_enter' };
    case 16: return { keyCode, domCode: 'ShiftLeft', varName: 'key_shift' };
    case 17: return { keyCode, domCode: 'ControlLeft', varName: 'key_ctrl' };
    case 27: return { keyCode, domCode: 'Escape', varName: 'key_escape' };
    case 46: return { keyCode, domCode: 'Delete', varName: 'key_delete' };
    default: {
      if (keyCode >= 65 && keyCode <= 90) {
        const ch = String.fromCharCode(keyCode);
        return { keyCode, domCode: `Key${ch}`, varName: `key_${ch.toLowerCase()}` };
      }
      if (keyCode >= 97 && keyCode <= 122) {
        const ch = String.fromCharCode(keyCode - 32);
        return { keyCode, domCode: `Key${ch}`, varName: `key_${ch.toLowerCase()}` };
      }
      if (keyCode >= 48 && keyCode <= 57) {
        const ch = String.fromCharCode(keyCode);
        return { keyCode, domCode: `Digit${ch}`, varName: `key_${ch}` };
      }
      return { keyCode, domCode: `KeyCode${keyCode}`, varName: `key_${keyCode}` };
    }
  }
}

function domKeyFromDomCode(domCode: string): string {
  if (/^Key([A-Z])$/.test(domCode)) return domCode.slice(3).toLowerCase();
  if (/^Digit([0-9])$/.test(domCode)) return domCode.slice(5);
  if (domCode === 'Space') return ' ';
  return domCode;
}

function mapSwfButtonKeyCode(btnKeyCode: number): SwfKeyBindingSpec {
  // SWF DefineButton2 CondKeyPress uses Flash special codes 1..19 and ASCII 32..126
  switch (btnKeyCode) {
    case 1: return mapFlashKeyCode(37); // Left
    case 2: return mapFlashKeyCode(39); // Right
    case 8: return mapFlashKeyCode(8);  // Backspace
    case 13: return mapFlashKeyCode(13); // Enter
    case 14: return mapFlashKeyCode(38); // Up
    case 15: return mapFlashKeyCode(40); // Down
    case 18: return mapFlashKeyCode(9);  // Tab
    case 19: return mapFlashKeyCode(27); // Escape
    default: return mapFlashKeyCode(btnKeyCode);
  }
}

interface Avm1StackVal {
  kind: 'num' | 'str' | 'bool' | 'var' | 'member' | 'sexpr' | 'null' | 'func';
  numVal?: number;
  strVal?: string;
  boolVal?: boolean;
  varName?: string;
  obj?: Avm1StackVal;
  prop?: string;
  code?: string;
  bodyStartIdx?: number;
  bodyEndIdx?: number;
  funcName?: string;
}

interface Avm1DecodedIns {
  offset: number;
  endOffset: number;
  code: number;
  payload: Uint8Array;
}

function composeAvm1When(outerW?: string, innerW?: string): string | undefined {
  if (!outerW) return innerW;
  if (!innerW) return outerW;
  if (outerW === innerW) return outerW;
  return `(and ${outerW} ${innerW})`;
}

function negateAvm1Cond(expr: string): string {
  const trimmed = expr.trim();
  if (trimmed.startsWith('(not ') && trimmed.endsWith(')')) {
    return trimmed.slice(5, -1).trim();
  }
  return `(not ${trimmed})`;
}

function resolvePropVarName(targetPrefix: string, rawProp: string): string | null {
  const lower = rawProp.toLowerCase();
  const suffix = FLASH_PROP_SUFFIX_MAP[lower];
  if (!suffix) return null;
  if (!targetPrefix || targetPrefix === '__root__' || targetPrefix === '_root' || targetPrefix === 'root' || targetPrefix === '_level0' || targetPrefix === '_parent' || targetPrefix === '/') {
    return `swf_${suffix}`;
  }
  return `${sanitizeAstIdent(targetPrefix)}_${suffix}`;
}

function resolveMemberTargetName(obj: Avm1StackVal, propName: string, defaultClipPrefix: string): string {
  const pLower = propName.toLowerCase();
  const objName = obj.kind === 'var' ? (obj.varName || '') : (obj.kind === 'str' ? (obj.strVal || '') : '');
  const isRoot = objName === '_root' || objName === '_level0' || objName === 'root' || objName === '_parent' || objName === '/' || objName === '../';
  const isThis = objName === 'this' || objName === '';

  if (FLASH_PROP_SUFFIX_MAP[pLower]) {
    const clipPrefix = isThis ? defaultClipPrefix : (isRoot ? '__root__' : objName);
    return resolvePropVarName(clipPrefix, pLower) || sanitizeAstIdent(propName);
  }
  if (isRoot || isThis) {
    return sanitizeAstIdent(propName);
  }
  if (obj.kind === 'member' && obj.obj && obj.prop) {
    const base = resolveMemberTargetName(obj.obj, obj.prop, defaultClipPrefix);
    return `${base}_${sanitizeAstIdent(propName)}`;
  }
  return `${sanitizeAstIdent(objName)}_${sanitizeAstIdent(propName)}`;
}

function avm1ValToSexpr(val: Avm1StackVal | undefined, defaultClipPrefix: string, referencedProps: Set<string>): string {
  if (!val) return '0';
  switch (val.kind) {
    case 'num':
      return Number.isFinite(val.numVal) ? String(Number(val.numVal!.toFixed(4))) : '0';
    case 'bool':
      return val.boolVal ? '1' : '0';
    case 'null':
      return '0';
    case 'str': {
      const s = String(val.strVal ?? '');
      return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    }
    case 'var': {
      const name = val.varName || '';
      if (name === 'this') return defaultClipPrefix || 'swf';
      if (FLASH_PROP_SUFFIX_MAP[name.toLowerCase()]) {
        const mapped = resolvePropVarName(defaultClipPrefix, name.toLowerCase()) || sanitizeAstIdent(name);
        referencedProps.add(mapped);
        return mapped;
      }
      return sanitizeAstIdent(name);
    }
    case 'member': {
      const resolved = resolveMemberTargetName(val.obj!, val.prop || '', defaultClipPrefix);
      referencedProps.add(resolved);
      return resolved;
    }
    case 'sexpr':
      return val.code || '0';
    default:
      return '0';
  }
}

function avm1ValToRawLiteral(val: Avm1StackVal | undefined): any {
  if (!val) return 0;
  if (val.kind === 'num') return val.numVal ?? 0;
  if (val.kind === 'bool') return val.boolVal ? 1 : 0;
  if (val.kind === 'str') return val.strVal ?? '';
  if (val.kind === 'null') return 0;
  return undefined;
}

/**
 * Parses Flash 8+ SurfaceFilterList into pure W3C SVG filter descriptors (DropShadow, Blur, Glow, ColorMatrix)
 * while skipping unsupported filter types cleanly without bitstream drift.
 */
function parseSwfFilterList(reader: BitReader, tagEndOffset: number): SwfSurfaceFilter[] {
  const filters: SwfSurfaceFilter[] = [];
  if (reader.offset >= tagEndOffset) return filters;
  const count = reader.readUI8();
  const readFixed16 = () => {
    const lo = reader.readUI16();
    const hi = reader.readSI16();
    return Number((hi + lo / 65536).toFixed(2));
  };
  const readFixed8 = () => {
    const v = reader.readSI16();
    return Number((v / 256).toFixed(2));
  };
  const readF32 = () => {
    const b = reader.readBytes(4);
    const dv = new DataView(b.buffer, b.byteOffset, 4);
    return Number(dv.getFloat32(0, true).toFixed(4));
  };

  for (let i = 0; i < count && reader.offset < tagEndOffset; i++) {
    const filterId = reader.readUI8();
    if (filterId === 0 && reader.offset + 23 <= tagEndOffset) {
      // DropShadowFilter: RGBA(4)+BlurX(4)+BlurY(4)+Angle(4)+Dist(4)+Strength(2)+Flags(1) = 23
      const c = reader.readRGBA(true);
      const bx = Math.max(0, readFixed16());
      const by = Math.max(0, readFixed16());
      const ang = readFixed16();
      const d = readFixed16();
      const s = readFixed8();
      reader.readUI8(); // flags
      filters.push({ t: 'ds', c, bx, by, ang, d, s });
    } else if (filterId === 1 && reader.offset + 9 <= tagEndOffset) {
      // BlurFilter: BlurX(4)+BlurY(4)+Flags(1) = 9
      const bx = Math.max(0, readFixed16());
      const by = Math.max(0, readFixed16());
      reader.readUI8(); // flags
      filters.push({ t: 'bl', bx, by });
    } else if (filterId === 2 && reader.offset + 15 <= tagEndOffset) {
      // GlowFilter: RGBA(4)+BlurX(4)+BlurY(4)+Strength(2)+Flags(1) = 15
      const c = reader.readRGBA(true);
      const bx = Math.max(0, readFixed16());
      const by = Math.max(0, readFixed16());
      const s = readFixed8();
      reader.readUI8(); // flags
      filters.push({ t: 'gl', c, bx, by, s });
    } else if (filterId === 3) {
      // BevelFilter: 27 bytes
      reader.readBytes(27);
    } else if (filterId === 4 || filterId === 7) {
      // GradientGlowFilter / GradientBevelFilter
      const numColors = reader.readUI8();
      reader.readBytes(numColors * 5 + 19);
    } else if (filterId === 5) {
      // ConvolutionFilter
      const mx = reader.readUI8();
      const my = reader.readUI8();
      reader.readBytes(8 + mx * my * 4 + 5);
    } else if (filterId === 6 && reader.offset + 80 <= tagEndOffset) {
      // ColorMatrixFilter: 20 float32 values
      const m: number[] = [];
      for (let k = 0; k < 20; k++) m.push(readF32());
      filters.push({ t: 'cm', m });
    } else {
      break;
    }
  }
  return filters;
}

function skipSwfFilterList(reader: BitReader, tagEndOffset: number): void {
  parseSwfFilterList(reader, tagEndOffset);
}

let _activeSymbolicLiftRemaining = 25000;

/**
 * Full AVM1 (ActionScript 1.0 / 2.0) bytecode lifter for DoAction (Tag 12), DoInitAction (Tag 59),
 * PlaceObject2 ClipActions, and DefineButton / DefineButton2 actions.
 */
function parseDoAction(
  reader: BitReader,
  tagEndOffset: number,
  currentFrame: number,
  context: {
    clipPrefix?: string;
    fileLength?: number;
    instanceHalfSizes?: Map<string, { hw: number; hh: number }>;
    skipSymbolicLift?: boolean;
  } = {}
): SwfActionRecord {
  const defaultClipPrefix = context.clipPrefix || '';
  const loadedByteCount = Math.max(1024, context.fileLength || 4096);
  const record: SwfActionRecord = {
    frame: currentFrame,
    gotoFrames: [],
    gotoLabels: [],
    setVariables: [],
    branches: [],
    statements: [],
    enterFrameStatements: [],
    eventHandlers: [],
    usedKeys: [],
    referencedProps: new Set<string>(),
    poolRequests: [],
  };

  // Pass 1: Decode instruction stream with exact byte offsets for ActionIf / ActionJump / ActionDefineFunction resolution
  const rawActionStart = reader.offset;
  if (context.skipSymbolicLift || _activeSymbolicLiftRemaining <= 0) {
    let hasAnyIns = false;
    while (reader.offset < tagEndOffset) {
      const code = reader.readUI8();
      if (code === 0) break; // ActionEnd
      hasAnyIns = true;
      if (code === 0x07) record.stops = true;
      else if (code === 0x06) record.plays = true;
      else if (code === 0x8A || code === 0x8D) record.usesPreloaderApi = true;
      if (code >= 0x80) {
        const length = reader.readUI16();
        const pStart = reader.offset;
        const pEnd = Math.min(tagEndOffset, pStart + length);
        reader.offset = pEnd;
        if ((code === 0x9B || code === 0x8E) && pEnd - pStart >= 2) {
          const codeSize = (reader.bytes[pEnd - 2] | (reader.bytes[pEnd - 1] << 8)) & 0xffff;
          reader.offset = Math.min(tagEndOffset, pEnd + codeSize);
        } else if (code === 0x8F && pEnd - pStart >= 7) {
          const trySize = (reader.bytes[pStart + 1] | (reader.bytes[pStart + 2] << 8)) & 0xffff;
          const catchSize = (reader.bytes[pStart + 3] | (reader.bytes[pStart + 4] << 8)) & 0xffff;
          const finallySize = (reader.bytes[pStart + 5] | (reader.bytes[pStart + 6] << 8)) & 0xffff;
          reader.offset = Math.min(tagEndOffset, pEnd + trySize + catchSize + finallySize);
        }
      }
    }
    if (hasAnyIns) {
      const rawSlice = reader.sliceBytes(rawActionStart, tagEndOffset);
      if (rawSlice.length > 0) {
        record.rawBytecodeB64 = bytesToBase64(rawSlice);
      }
    }
    return record;
  }

  const instrs: Avm1DecodedIns[] = [];
  const offsetToIdx = new Map<number, number>();
  let nestedSkipUntil = 0;
  while (reader.offset < tagEndOffset) {
    const startOff = reader.offset;
    const code = reader.readUI8();
    if (code === 0) {
      // Only treat ActionEnd (0x00) as end-of-block when outside a nested function/try body
      if (startOff >= nestedSkipUntil) break;
      continue;
    }
    let length = 0;
    if (code >= 0x80) {
      length = reader.readUI16();
    }
    const pStart = reader.offset;
    const endOff = Math.min(tagEndOffset, pStart + length);
    const payload = length > 0 ? reader.readBytes(endOff - pStart) : new Uint8Array(0);
    offsetToIdx.set(startOff, instrs.length);
    instrs.push({ offset: startOff, endOffset: endOff, code, payload });
    reader.offset = endOff;
    if ((code === 0x9B || code === 0x8E) && payload.length >= 2) {
      const codeSize = (payload[payload.length - 2] | (payload[payload.length - 1] << 8)) & 0xffff;
      nestedSkipUntil = Math.max(nestedSkipUntil, Math.min(tagEndOffset, endOff + codeSize));
    } else if (code === 0x8F && payload.length >= 7) {
      const trySize = (payload[1] | (payload[2] << 8)) & 0xffff;
      const catchSize = (payload[3] | (payload[4] << 8)) & 0xffff;
      const finallySize = (payload[5] | (payload[6] << 8)) & 0xffff;
      nestedSkipUntil = Math.max(nestedSkipUntil, Math.min(tagEndOffset, endOff + trySize + catchSize + finallySize));
    }
  }
  if (instrs.length > 0) {
    const rawSlice = reader.sliceBytes(rawActionStart, tagEndOffset);
    if (rawSlice.length > 0) {
      record.rawBytecodeB64 = bytesToBase64(rawSlice);
    }
  }

  const constantPool: string[] = [];
  const definedFunctions = new Map<string, { startIdx: number; endIdx: number }>();
  const seenKeys = new Map<number, SwfKeyBindingSpec>();
  const registerKey = (kc: number): SwfKeyBindingSpec => {
    const existing = seenKeys.get(kc);
    if (existing) return existing;
    const spec = mapFlashKeyCode(kc);
    seenKeys.set(kc, spec);
    record.usedKeys!.push(spec);
    return spec;
  };

  const getHalfSize = (clipName: string): { hw: number; hh: number } => {
    const clean = sanitizeAstIdent(clipName);
    const found = context.instanceHalfSizes?.get(clean);
    return found || { hw: 20, hh: 20 };
  };

  const isRootTargetName = (raw: string): boolean => {
    const s = raw.trim();
    return s === '_root' || s === '_level0' || s === 'root' || s === '/' || s === '../' || s === '_parent';
  };

  const resolveClipNameFromVal = (val: Avm1StackVal | undefined, curTarget: string): string => {
    if (!val) return curTarget;
    if (val.kind === 'str') {
      const s = (val.strVal || '').trim();
      if (!s || s === 'this') return curTarget;
      if (isRootTargetName(s)) return '__root__';
      return sanitizeAstIdent(s.replace(/^_root\.|^\/+/, ''));
    }
    if (val.kind === 'var') {
      const v = (val.varName || '').trim();
      if (!v || v === 'this') return curTarget;
      if (isRootTargetName(v)) return '__root__';
      return sanitizeAstIdent(v);
    }
    if (val.kind === 'member' && val.prop) {
      return sanitizeAstIdent(val.prop);
    }
    return curTarget;
  };

  const resolveByteOffsetToIdx = (targetOffset: number, fallbackIdx: number): number => {
    const direct = offsetToIdx.get(targetOffset);
    if (direct !== undefined) return direct;
    const found = instrs.findIndex((x) => x.offset >= targetOffset);
    return found === -1 ? fallbackIdx : found;
  };

  let callInlineDepth = 0;
  let evalStepBudget = Math.min(4000, Math.max(0, _activeSymbolicLiftRemaining));
  const initialEvalStepBudget = evalStepBudget;
  let evalDepth = 0;

  // Pass 2: Structured control-flow + symbolic stack evaluation
  const evalRange = (
    startIdx: number,
    endIdx: number,
    activeGuard: string | undefined,
    stack: Avm1StackVal[],
    outStmts: Avm1LiftedStatement[] = record.statements!,
    initialTargetPrefix: string = defaultClipPrefix,
    registers: Map<number, Avm1StackVal> = new Map()
  ) => {
    if (evalDepth >= 14 || evalStepBudget <= 0 || startIdx >= endIdx) return;
    evalDepth++;
    let i = startIdx;
    let curTarget = initialTargetPrefix;

    const pushStmt = (st: Avm1LiftedStatement) => {
      outStmts.push(st);
    };

    try {
    while (i < endIdx && i < instrs.length && evalStepBudget-- > 0) {
      const ins = instrs[i];
      const code = ins.code;
      const pReader = ins.payload.length > 0 ? new BitReader(ins.payload, 0) : null;

      if (code === 0x07) {
        // ActionStop
        if (!activeGuard && outStmts === record.statements) record.stops = true;
        pushStmt({ kind: 'stop', targetPrefix: curTarget || undefined, when: activeGuard });
      } else if (code === 0x06) {
        // ActionPlay
        if (outStmts === record.statements) record.plays = true;
        pushStmt({ kind: 'play', targetPrefix: curTarget || undefined, when: activeGuard });
      } else if (code === 0x04) {
        // ActionNextFrame
        pushStmt({ kind: 'nextFrame', targetPrefix: curTarget || undefined, when: activeGuard });
      } else if (code === 0x05) {
        // ActionPreviousFrame
        pushStmt({ kind: 'prevFrame', targetPrefix: curTarget || undefined, when: activeGuard });
      } else if (code === 0x8A) {
        // ActionWaitForFrame (ifFrameLoaded): mark preloader API; local SWF is 100% loaded
        record.usesPreloaderApi = true;
      } else if (code === 0x8D) {
        // ActionWaitForFrame2: mark preloader API and pop frame expression
        record.usesPreloaderApi = true;
        stack.pop();
      } else if (code === 0x8B && pReader) {
        // ActionSetTarget (tellTarget)
        const targetStr = pReader.readString().trim();
        if (!targetStr) curTarget = defaultClipPrefix;
        else if (isRootTargetName(targetStr)) curTarget = '__root__';
        else curTarget = sanitizeAstIdent(targetStr.replace(/^\/+|^_root\./, ''));
      } else if (code === 0x20) {
        // ActionSetTarget2
        const targetVal = stack.pop();
        const rawT = targetVal?.kind === 'str' ? (targetVal.strVal || '').trim() : (targetVal?.varName || '').trim();
        if (!rawT) curTarget = defaultClipPrefix;
        else if (isRootTargetName(rawT)) curTarget = '__root__';
        else curTarget = sanitizeAstIdent(rawT.replace(/^\/+|^_root\./, ''));
      } else if (code === 0x81 && pReader) {
        // ActionGotoFrame (0-based in SWF -> 1-based frame).
        // Flash AVM1 compiles gotoAndPlay(N) as ActionGotoFrame(N-1) immediately followed by ActionPlay (0x06) — fuse them!
        const frameNum = pReader.readUI16() + 1;
        const followedByPlay = (i + 1 < endIdx && i + 1 < instrs.length && instrs[i + 1].code === 0x06);
        if (followedByPlay) {
          if (outStmts === record.statements) record.plays = true;
          i++; // consume paired ActionPlay
        }
        record.gotoFrames!.push(frameNum);
        pushStmt({ kind: 'gotoFrame', targetPrefix: curTarget || undefined, frame: frameNum, play: followedByPlay, when: activeGuard });
      } else if (code === 0x8C && pReader) {
        // ActionGoToLabel (spec 0x8C). Fuse immediately following ActionPlay (0x06) for gotoAndPlay("label").
        const lbl = pReader.readString();
        const followedByPlay = (i + 1 < endIdx && i + 1 < instrs.length && instrs[i + 1].code === 0x06);
        if (followedByPlay) {
          if (outStmts === record.statements) record.plays = true;
          i++; // consume paired ActionPlay
        }
        if (lbl) {
          record.gotoLabels!.push(lbl);
          pushStmt({ kind: 'gotoLabel', targetPrefix: curTarget || undefined, label: lbl, play: followedByPlay, when: activeGuard });
        }
      } else if (code === 0x9F && pReader) {
        // ActionGotoFrame2 (spec 0x9F) OR legacy null-terminated label string (Sim 7 compatibility)
        const isLegacyAsciiLabel =
          ins.payload.length >= 2 &&
          ins.payload[ins.payload.length - 1] === 0 &&
          ins.payload.slice(0, -1).every((b) => b >= 32 && b <= 126);
        if (isLegacyAsciiLabel) {
          const lbl = pReader.readString();
          if (lbl) {
            record.gotoLabels!.push(lbl);
            pushStmt({ kind: 'gotoLabel', targetPrefix: curTarget || undefined, label: lbl, play: true, when: activeGuard });
          }
        } else {
          const flags = pReader.readUI8();
          const playFlag = (flags & 0x01) !== 0;
          const sceneBiasFlag = (flags & 0x02) !== 0;
          const sceneBias = sceneBiasFlag ? pReader.readUI16() : 0;
          const targetVal = stack.pop();
          if (targetVal?.kind === 'str' && targetVal.strVal) {
            record.gotoLabels!.push(targetVal.strVal);
            pushStmt({ kind: 'gotoLabel', targetPrefix: curTarget || undefined, label: targetVal.strVal, play: playFlag, when: activeGuard });
          } else if (targetVal?.kind === 'num') {
            const frameNum = Math.max(1, Math.round((targetVal.numVal || 1) + sceneBias));
            record.gotoFrames!.push(frameNum);
            pushStmt({ kind: 'gotoFrame', targetPrefix: curTarget || undefined, frame: frameNum, play: playFlag, when: activeGuard });
          }
        }
      } else if (code === 0x88 && pReader) {
        // ActionConstantPool
        const count = pReader.readUI16();
        constantPool.length = 0;
        for (let c = 0; c < count && pReader.offset < ins.payload.length; c++) {
          constantPool.push(pReader.readString());
        }
      } else if (code === 0x87 && pReader) {
        // ActionStoreRegister: peek top of stack and store into symbolic register (does not pop)
        const regNum = pReader.readUI8();
        if (stack.length > 0) {
          registers.set(regNum, { ...stack[stack.length - 1] });
        }
      } else if (code === 0x96 && pReader) {
        // ActionPush (types 0..9)
        while (pReader.offset < ins.payload.length) {
          const pType = pReader.readUI8();
          if (pType === 0) {
            stack.push({ kind: 'str', strVal: pReader.readString() });
          } else if (pType === 1) {
            stack.push({ kind: 'num', numVal: pReader.readFloat32() });
          } else if (pType === 2 || pType === 3) {
            stack.push({ kind: 'null' });
          } else if (pType === 4) {
            const regNum = pReader.readUI8();
            if (registers.has(regNum)) {
              stack.push({ ...registers.get(regNum)! });
            } else {
              stack.push({ kind: 'var', varName: `reg_${regNum}` });
            }
          } else if (pType === 5) {
            stack.push({ kind: 'bool', boolVal: pReader.readUI8() !== 0 });
          } else if (pType === 6) {
            stack.push({ kind: 'num', numVal: pReader.readDouble() });
          } else if (pType === 7) {
            stack.push({ kind: 'num', numVal: pReader.readSI32() });
          } else if (pType === 8) {
            const idx = pReader.readUI8();
            stack.push({ kind: 'str', strVal: constantPool[idx] ?? `str_${idx}` });
          } else if (pType === 9) {
            const idx = pReader.readUI16();
            stack.push({ kind: 'str', strVal: constantPool[idx] ?? `str_${idx}` });
          } else {
            break;
          }
        }
      } else if ((code === 0x9B && ins.payload.length >= 4 && pReader) || (code === 0x8E && pReader)) {
        // ActionDefineFunction (0x9B) / ActionDefineFunction2 (0x8E)
        const funcName = pReader.readString();
        const numParams = pReader.readUI16();
        if (code === 0x8E) {
          pReader.readUI8(); // RegisterCount
          pReader.readUI16(); // Flags
          for (let p = 0; p < numParams && pReader.offset < ins.payload.length; p++) {
            pReader.readUI8(); // Register
            pReader.readString(); // ParamName
          }
        } else {
          for (let p = 0; p < numParams && pReader.offset < ins.payload.length; p++) {
            pReader.readString(); // ParamName
          }
        }
        const codeSize = pReader.readUI16();
        const bodyEndIdx = Math.min(endIdx, resolveByteOffsetToIdx(ins.endOffset + codeSize, endIdx));
        if (funcName) {
          definedFunctions.set(funcName, { startIdx: i + 1, endIdx: bodyEndIdx });
          const lowerFn = funcName.toLowerCase();
          if (lowerFn === 'onenterframe') {
            evalRange(i + 1, bodyEndIdx, undefined, [], record.enterFrameStatements!, curTarget, new Map());
          } else if (lowerFn === 'onrelease' || lowerFn === 'onpress' || lowerFn === 'onreleaseoutside' || lowerFn === 'onmousedown') {
            const lifted: Avm1LiftedStatement[] = [];
            evalRange(i + 1, bodyEndIdx, undefined, [], lifted, curTarget, new Map());
            if (lifted.length > 0) {
              record.eventHandlers!.push({ target: curTarget || '__stage__', event: lowerFn, statements: lifted });
            }
          }
        } else {
          stack.push({ kind: 'func', bodyStartIdx: i + 1, bodyEndIdx, funcName });
        }
        i = Math.max(i + 1, bodyEndIdx);
        continue;
      } else if (code === 0x17) {
        // ActionPop
        stack.pop();
      } else if (code === 0x4C) {
        // ActionPushDuplicate
        if (stack.length > 0) stack.push({ ...stack[stack.length - 1] });
      } else if (code === 0x1C) {
        // ActionGetVariable
        const nameVal = stack.pop();
        const rawName = nameVal?.kind === 'str' ? (nameVal.strVal || '') : (nameVal?.varName || '');
        stack.push({ kind: 'var', varName: rawName });
      } else if (code === 0x1D || code === 0x3C) {
        // ActionSetVariable (0x1D) / ActionDefineLocal (0x3C): pop value, pop name
        const val = stack.pop();
        const nameVal = stack.pop();
        const rawName = nameVal?.kind === 'str' ? (nameVal.strVal || '') : (nameVal?.varName || '');
        if (rawName && val?.kind === 'func' && val.bodyStartIdx !== undefined && val.bodyEndIdx !== undefined) {
          const lowerFn = rawName.toLowerCase();
          if (lowerFn === 'onenterframe') {
            evalRange(val.bodyStartIdx, val.bodyEndIdx, undefined, [], record.enterFrameStatements!, curTarget, new Map());
          } else if (lowerFn === 'onrelease' || lowerFn === 'onpress' || lowerFn === 'onreleaseoutside' || lowerFn === 'onmousedown') {
            const lifted: Avm1LiftedStatement[] = [];
            evalRange(val.bodyStartIdx, val.bodyEndIdx, undefined, [], lifted, curTarget, new Map());
            if (lifted.length > 0) {
              record.eventHandlers!.push({ target: curTarget || '__stage__', event: lowerFn, statements: lifted });
            }
          } else {
            definedFunctions.set(rawName, { startIdx: val.bodyStartIdx, endIdx: val.bodyEndIdx });
          }
        } else if (rawName) {
          const propVar = FLASH_PROP_SUFFIX_MAP[rawName.toLowerCase()]
            ? resolvePropVarName(curTarget, rawName.toLowerCase())
            : null;
          const astVar = propVar || sanitizeAstIdent(rawName);
          if (propVar) record.referencedProps!.add(propVar);
          const expr = avm1ValToSexpr(val, curTarget, record.referencedProps!);
          const rawLit = avm1ValToRawLiteral(val);
          if (!activeGuard && outStmts === record.statements) {
            record.setVariables!.push({ name: astVar, value: rawLit !== undefined ? rawLit : 0 });
          } else if (!record.setVariables!.some((sv) => sv.name === astVar)) {
            record.setVariables!.push({ name: astVar, value: 0 });
          }
          pushStmt({
            kind: 'setVar',
            varName: astVar,
            expr,
            rawVal: rawLit,
            when: activeGuard,
          });
        }
      } else if (code === 0x41) {
        // ActionDefineLocal2: pop name
        const nameVal = stack.pop();
        const rawName = nameVal?.kind === 'str' ? (nameVal.strVal || '') : (nameVal?.varName || '');
        if (rawName) {
          const astVar = sanitizeAstIdent(rawName);
          if (!record.setVariables!.some((sv) => sv.name === astVar)) {
            record.setVariables!.push({ name: astVar, value: 0 });
          }
        }
      } else if (code === 0x4E) {
        // ActionGetMember: pop memberName, pop object
        const memberVal = stack.pop();
        const objVal = stack.pop() || { kind: 'var', varName: 'this' };
        const propName = memberVal?.kind === 'str' ? (memberVal.strVal || '') : (memberVal?.varName || '');
        if (propName.toLowerCase() === '_framesloaded') {
          record.usesPreloaderApi = true;
        }
        stack.push({ kind: 'member', obj: objVal, prop: propName });
      } else if (code === 0x4F) {
        // ActionSetMember: pop value, pop memberName, pop object
        const val = stack.pop();
        const memberVal = stack.pop();
        const objVal = stack.pop() || { kind: 'var', varName: 'this' };
        const propName = memberVal?.kind === 'str' ? (memberVal.strVal || '') : (memberVal?.varName || '');
        if (propName && val?.kind === 'func' && val.bodyStartIdx !== undefined && val.bodyEndIdx !== undefined) {
          const lowerProp = propName.toLowerCase();
          const targetClip = resolveClipNameFromVal(objVal, curTarget);
          const bodyTarget = targetClip === '__root__' ? '__root__' : (targetClip || curTarget);
          if (lowerProp === 'onenterframe') {
            evalRange(val.bodyStartIdx, val.bodyEndIdx, undefined, [], record.enterFrameStatements!, bodyTarget, new Map());
          } else if (lowerProp === 'onrelease' || lowerProp === 'onpress' || lowerProp === 'onreleaseoutside' || lowerProp === 'onmousedown') {
            const lifted: Avm1LiftedStatement[] = [];
            evalRange(val.bodyStartIdx, val.bodyEndIdx, undefined, [], lifted, curTarget, new Map());
            if (lifted.length > 0) {
              const handlerTarget = (targetClip && targetClip !== '__root__') ? targetClip : '__stage__';
              record.eventHandlers!.push({ target: handlerTarget, event: lowerProp, statements: lifted });
            }
          } else {
            definedFunctions.set(propName, { startIdx: val.bodyStartIdx, endIdx: val.bodyEndIdx });
          }
        } else if (propName) {
          const astVar = resolveMemberTargetName(objVal, propName, curTarget);
          record.referencedProps!.add(astVar);
          const expr = avm1ValToSexpr(val, curTarget, record.referencedProps!);
          const rawLit = avm1ValToRawLiteral(val);
          if (!activeGuard && outStmts === record.statements && !record.setVariables!.some((sv) => sv.name === astVar)) {
            record.setVariables!.push({ name: astVar, value: rawLit !== undefined ? rawLit : 0 });
          }
          pushStmt({
            kind: 'setVar',
            varName: astVar,
            expr,
            rawVal: rawLit,
            when: activeGuard,
          });
        }
      } else if (code === 0x22) {
        // ActionGetProperty: pop propIndex, pop target
        const idxVal = stack.pop();
        const targetVal = stack.pop();
        const idxNum = idxVal?.kind === 'num' ? Math.round(idxVal.numVal || 0) : parseInt(String(idxVal?.strVal || '0'), 10);
        const propName = FLASH_PROP_INDEX_MAP[idxNum] || '_x';
        if (propName === '_framesloaded') record.usesPreloaderApi = true;
        const clipPrefix = resolveClipNameFromVal(targetVal, curTarget);
        const mapped = resolvePropVarName(clipPrefix, propName) || `${sanitizeAstIdent(clipPrefix)}_x`;
        record.referencedProps!.add(mapped);
        stack.push({ kind: 'sexpr', code: mapped });
      } else if (code === 0x23) {
        // ActionSetProperty: pop value, pop propIndex, pop target
        const val = stack.pop();
        const idxVal = stack.pop();
        const targetVal = stack.pop();
        const idxNum = idxVal?.kind === 'num' ? Math.round(idxVal.numVal || 0) : parseInt(String(idxVal?.strVal || '0'), 10);
        const propName = FLASH_PROP_INDEX_MAP[idxNum] || '_x';
        const clipPrefix = resolveClipNameFromVal(targetVal, curTarget);
        const mapped = resolvePropVarName(clipPrefix, propName) || `${sanitizeAstIdent(clipPrefix)}_x`;
        record.referencedProps!.add(mapped);
        const expr = avm1ValToSexpr(val, curTarget, record.referencedProps!);
        const rawLit = avm1ValToRawLiteral(val);
        if (!activeGuard && outStmts === record.statements && !record.setVariables!.some((sv) => sv.name === mapped)) {
          record.setVariables!.push({ name: mapped, value: rawLit !== undefined ? rawLit : 0 });
        }
        pushStmt({
          kind: 'setVar',
          varName: mapped,
          expr,
          rawVal: rawLit,
          when: activeGuard,
        });
      } else if (
        code === 0x0A || code === 0x47 || // Add / Add2
        code === 0x0B || // Subtract
        code === 0x0C || // Multiply
        code === 0x0D || // Divide
        code === 0x3F || // Modulo
        code === 0x0E || code === 0x49 || code === 0x13 || code === 0x66 || // Equals / Equals2 / StringEquals / StrictEquals
        code === 0x0F || code === 0x48 || // Less / Less2
        code === 0x67 || // Greater
        code === 0x10 || // And
        code === 0x11 || // Or
        code === 0x60 || code === 0x61 || code === 0x62 || // BitAnd / BitOr / BitXor
        code === 0x21 // StringAdd
      ) {
        const rhs = stack.pop();
        const lhs = stack.pop();
        const a = avm1ValToSexpr(lhs, curTarget, record.referencedProps!);
        const b = avm1ValToSexpr(rhs, curTarget, record.referencedProps!);
        let op = '+';
        if (code === 0x0B) op = '-';
        else if (code === 0x0C) op = '*';
        else if (code === 0x0D) op = '/';
        else if (code === 0x3F) op = '%';
        else if (code === 0x0E || code === 0x49 || code === 0x13 || code === 0x66) op = '=';
        else if (code === 0x0F || code === 0x48) op = '<';
        else if (code === 0x67) op = '>';
        else if (code === 0x10) op = 'and';
        else if (code === 0x11) op = 'or';
        else if (code === 0x60) op = 'bitand';
        else if (code === 0x61) op = 'bitor';
        else if (code === 0x62) op = 'bitxor';
        else if (code === 0x21) op = 'str';
        stack.push({ kind: 'sexpr', code: `(${op} ${a} ${b})` });
      } else if (code === 0x12) {
        // ActionNot
        const operand = stack.pop();
        const a = avm1ValToSexpr(operand, curTarget, record.referencedProps!);
        stack.push({ kind: 'sexpr', code: negateAvm1Cond(a) });
      } else if (code === 0x18) {
        // ActionToInteger
        const operand = stack.pop();
        const a = avm1ValToSexpr(operand, curTarget, record.referencedProps!);
        stack.push({ kind: 'sexpr', code: `(floor ${a})` });
      } else if (code === 0x4A) {
        // ActionToNumber (pass-through on symbolic stack)
      } else if (code === 0x50 || code === 0x51) {
        // ActionIncrement (0x50) / ActionDecrement (0x51)
        const operand = stack.pop();
        const a = avm1ValToSexpr(operand, curTarget, record.referencedProps!);
        stack.push({ kind: 'sexpr', code: `(${code === 0x50 ? '+' : '-'} ${a} 1)` });
      } else if (code === 0x30) {
        // ActionRandomNumber: pop max, push random(max)
        const maxVal = stack.pop();
        const mExpr = avm1ValToSexpr(maxVal, curTarget, record.referencedProps!);
        stack.push({ kind: 'sexpr', code: `(random ${mExpr})` });
      } else if (code === 0x24) {
        // ActionDuplicateClip (0x24): pop depth, pop target, pop source
        stack.pop(); // depth
        const targetVal = stack.pop();
        const sourceVal = stack.pop();
        const srcClip = resolveClipNameFromVal(sourceVal, curTarget);
        const poolBase = resolveClipNameFromVal(targetVal, curTarget) || `${srcClip || 'clip'}_pool`;
        record.poolRequests!.push({ sourceClip: srcClip, poolBase });
        pushStmt({ kind: 'spawnPool', sourceClip: srcClip, poolBase, when: activeGuard });
      } else if (code === 0x25) {
        // ActionRemoveClip (0x25): pop target
        const targetVal = stack.pop();
        const clipName = resolveClipNameFromVal(targetVal, curTarget);
        pushStmt({ kind: 'removePool', poolBase: clipName, when: activeGuard });
      } else if (code === 0x3D || (code === 0x9B && ins.payload.length === 0)) {
        // ActionCallFunction (spec 0x3D; zero-length 0x9B legacy compat): pop funcName, pop numArgs, pop args[0..N-1]
        const funcVal = stack.pop();
        const numArgsVal = stack.pop();
        const funcName = funcVal?.kind === 'str' ? (funcVal.strVal || '') : (funcVal?.varName || '');
        const numArgs = Math.max(0, Math.min(16, Math.round(numArgsVal?.numVal ?? 0)));
        const args: Avm1StackVal[] = [];
        for (let a = 0; a < numArgs; a++) {
          args.push(stack.pop() || { kind: 'num', numVal: 0 });
        }
        handleAvm1Call(funcName, undefined, args, curTarget, activeGuard, stack, outStmts);
      } else if (code === 0x52) {
        // ActionCallMethod (spec 0x52): pop methodName, pop scriptObj, pop numArgs, pop args[0..N-1]
        const methodVal = stack.pop();
        const objVal = stack.pop();
        const numArgsVal = stack.pop();
        const methodName = methodVal?.kind === 'str' ? (methodVal.strVal || '') : (methodVal?.varName || '');
        const numArgs = Math.max(0, Math.min(16, Math.round(numArgsVal?.numVal ?? 0)));
        const args: Avm1StackVal[] = [];
        for (let a = 0; a < numArgs; a++) {
          args.push(stack.pop() || { kind: 'num', numVal: 0 });
        }
        handleAvm1Call(methodName, objVal, args, curTarget, activeGuard, stack, outStmts);
      } else if (code === 0x99 && pReader) {
        // ActionIf: pop cond, read signed 16-bit relative byte offset
        const branchOffset = pReader.readSI16();
        const condVal = stack.pop();
        const condStr = condVal?.kind === 'str'
          ? (condVal.strVal || 'true')
          : avm1ValToSexpr(condVal, curTarget, record.referencedProps!);
        record.branches!.push({
          condition: condStr,
          target: branchOffset,
        });

        const targetOffset = ins.endOffset + branchOffset;
        if (branchOffset > 0) {
          let targetIdx = Math.min(endIdx, resolveByteOffsetToIdx(targetOffset, endIdx));

          // Check if instruction immediately before targetIdx is a forward ActionJump (if/else pattern)
          let elseEndIdx = targetIdx;
          let thenEndIdx = targetIdx;
          if (targetIdx > i + 1 && instrs[targetIdx - 1].code === 0x9D && instrs[targetIdx - 1].payload.length >= 2) {
            const jmpIns = instrs[targetIdx - 1];
            const jmpOff = new BitReader(jmpIns.payload, 0).readSI16();
            if (jmpOff > 0) {
              const afterElseOffset = jmpIns.endOffset + jmpOff;
              thenEndIdx = targetIdx - 1;
              elseEndIdx = Math.min(endIdx, resolveByteOffsetToIdx(afterElseOffset, endIdx));
            }
          }

          // Only structure into guarded rules if condStr is an S-expression / variable (not Sim 7 raw text string)
          const isExecutableCond = condVal && condVal.kind !== 'str';
          if (isExecutableCond && targetIdx > i && elseEndIdx > i && (!activeGuard || activeGuard.length < 1024)) {
            const thenGuard = composeAvm1When(activeGuard, negateAvm1Cond(condStr));
            evalRange(i + 1, thenEndIdx, thenGuard, [...stack], outStmts, curTarget, new Map(registers));
            if (elseEndIdx > targetIdx) {
              const elseGuard = composeAvm1When(activeGuard, condStr);
              evalRange(targetIdx, elseEndIdx, elseGuard, [...stack], outStmts, curTarget, new Map(registers));
            }
            i = Math.max(i + 1, elseEndIdx);
            continue;
          }
        }
      } else if (code === 0x9D && pReader) {
        // ActionJump: unconditional branch
        const jumpOff = pReader.readSI16();
        if (jumpOff > 0) {
          const targetOffset = ins.endOffset + jumpOff;
          const targetIdx = offsetToIdx.get(targetOffset);
          if (targetIdx !== undefined && targetIdx > i && targetIdx <= endIdx) {
            i = targetIdx;
            continue;
          }
        }
      }

      i++;
    }
    } finally {
      evalDepth--;
    }
  };

  const handleAvm1Call = (
    name: string,
    objVal: Avm1StackVal | undefined,
    args: Avm1StackVal[],
    clipPrefix: string,
    activeGuard: string | undefined,
    stack: Avm1StackVal[],
    outStmts: Avm1LiftedStatement[]
  ) => {
    const objName = objVal?.kind === 'var' ? (objVal.varName || '') : (objVal?.kind === 'str' ? (objVal.strVal || '') : '');
    const fullTarget = objVal ? resolveClipNameFromVal(objVal, clipPrefix) : clipPrefix;

    // 0. Preloader byte-count queries: entire SWF binary is already 100% loaded offline in memory!
    if (name === 'getBytesLoaded' || name === 'getBytesTotal') {
      record.usesPreloaderApi = true;
      stack.push({ kind: 'num', numVal: loadedByteCount });
      return;
    }

    // 1. Key.isDown(keyCode)
    if ((objName === 'Key' && name === 'isDown') || name === 'Key.isDown') {
      const kcVal = args[0];
      const kc = kcVal?.kind === 'num' ? Math.round(kcVal.numVal || 0) : parseInt(String(kcVal?.strVal || '32'), 10);
      const spec = registerKey(kc);
      stack.push({ kind: 'sexpr', code: `(= ${spec.varName} 1)` });
      return;
    }

    // 2. Math.* functions
    const mathFnMap: Record<string, string> = {
      sin: 'sin', cos: 'cos', tan: 'tan', asin: 'asin', acos: 'acos', atan: 'atan', atan2: 'atan2',
      abs: 'abs', floor: 'floor', ceil: 'ceil', round: 'round', sqrt: 'sqrt', min: 'min', max: 'max', pow: 'pow',
      random: 'random',
    };
    if (objName === 'Math' && mathFnMap[name]) {
      const op = mathFnMap[name];
      if (op === 'random') {
        stack.push({ kind: 'sexpr', code: '(random)' });
      } else {
        const argExprs = args.map((a) => avm1ValToSexpr(a, clipPrefix, record.referencedProps!));
        stack.push({ kind: 'sexpr', code: `(${op} ${argExprs.join(' ')})` });
      }
      return;
    }

    // 3. random(n)
    if (name === 'random') {
      const argExpr = args[0] ? avm1ValToSexpr(args[0], clipPrefix, record.referencedProps!) : '100';
      stack.push({ kind: 'sexpr', code: `(random ${argExpr})` });
      return;
    }

    // 4. hitTest(otherClip) -> pure zero-GC AABB overlap check
    if (name === 'hitTest') {
      const clipA = (fullTarget && fullTarget !== '__root__') ? fullTarget : clipPrefix;
      const clipB = resolveClipNameFromVal(args[0], clipPrefix);
      if (clipA && clipB && clipB !== '__root__') {
        const hsA = getHalfSize(clipA);
        const hsB = getHalfSize(clipB);
        const dxThresh = Math.max(12, Math.round(hsA.hw + hsB.hw));
        const dyThresh = Math.max(12, Math.round(hsA.hh + hsB.hh));
        record.referencedProps!.add(`${clipA}_x`);
        record.referencedProps!.add(`${clipA}_y`);
        record.referencedProps!.add(`${clipA}_visible`);
        record.referencedProps!.add(`${clipB}_x`);
        record.referencedProps!.add(`${clipB}_y`);
        record.referencedProps!.add(`${clipB}_visible`);
        stack.push({
          kind: 'sexpr',
          code: `(and (> ${clipA}_visible 0) (> ${clipB}_visible 0) (< (abs (- ${clipA}_x ${clipB}_x)) ${dxThresh}) (< (abs (- ${clipA}_y ${clipB}_y)) ${dyThresh}))`,
        });
      } else {
        stack.push({ kind: 'bool', boolVal: false });
      }
      return;
    }

    // 5. Timeline control calls: gotoAndPlay, gotoAndStop, play, stop, nextFrame, prevFrame
    if (name === 'gotoAndPlay' || name === 'gotoAndStop') {
      const playFlag = name === 'gotoAndPlay';
      const target = args[0];
      if (target?.kind === 'str' && target.strVal) {
        record.gotoLabels!.push(target.strVal);
        outStmts.push({ kind: 'gotoLabel', targetPrefix: fullTarget || undefined, label: target.strVal, play: playFlag, when: activeGuard });
      } else if (target?.kind === 'num') {
        const frameNum = Math.max(1, Math.round(target.numVal || 1));
        record.gotoFrames!.push(frameNum);
        outStmts.push({ kind: 'gotoFrame', targetPrefix: fullTarget || undefined, frame: frameNum, play: playFlag, when: activeGuard });
      }
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'play') {
      if (outStmts === record.statements) record.plays = true;
      outStmts.push({ kind: 'play', targetPrefix: fullTarget || undefined, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'stop') {
      if (!activeGuard && outStmts === record.statements) record.stops = true;
      outStmts.push({ kind: 'stop', targetPrefix: fullTarget || undefined, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'nextFrame') {
      outStmts.push({ kind: 'nextFrame', targetPrefix: fullTarget || undefined, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'prevFrame') {
      outStmts.push({ kind: 'prevFrame', targetPrefix: fullTarget || undefined, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }

    // 6. duplicateMovieClip / attachMovie -> zero-GC compile-time clip pool
    if (name === 'duplicateMovieClip' || name === 'attachMovie') {
      const srcClip = resolveClipNameFromVal(args[0], clipPrefix);
      const poolBase = resolveClipNameFromVal(args[1], clipPrefix) || `${srcClip || 'proj'}_pool`;
      record.poolRequests!.push({ sourceClip: srcClip, poolBase });
      outStmts.push({ kind: 'spawnPool', sourceClip: srcClip, poolBase, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'removeMovieClip') {
      outStmts.push({ kind: 'removePool', poolBase: fullTarget, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }

    // 7. Inline-lift user-defined AVM1 functions (e.g. function checkLoaded() { ... })
    const userFn = definedFunctions.get(name);
    if (userFn && callInlineDepth < 4) {
      callInlineDepth++;
      evalRange(userFn.startIdx, userFn.endIdx, activeGuard, [], outStmts, fullTarget || clipPrefix, new Map());
      callInlineDepth--;
      stack.push({ kind: 'null' });
      return;
    }

    stack.push({ kind: 'num', numVal: 0 });
  };

  evalRange(0, instrs.length, undefined, [], record.statements!, defaultClipPrefix, new Map());
  const usedSteps = Math.max(1, initialEvalStepBudget - Math.max(0, evalStepBudget));
  _activeSymbolicLiftRemaining = Math.max(0, _activeSymbolicLiftRemaining - usedSteps);
  return record;
}

/**
 * Parses SWF PlaceObject2 ClipActions (onClipEvent(load), enterFrame, keyDown, mouseDown, etc.).
 */
function parseClipActions(
  reader: BitReader,
  tagEndOffset: number,
  swfVersion: number,
  currentFrame: number,
  clipPrefix: string,
  fileLength?: number
): SwfClipAction[] {
  const actions: SwfClipAction[] = [];
  if (reader.offset + 4 > tagEndOffset) return actions;

  reader.readUI16(); // Reserved
  if (swfVersion >= 6) reader.readUI32(); // AllEventFlags (32-bit in SWF 6+)
  else reader.readUI16(); // AllEventFlags (16-bit in SWF 5)

  while (reader.offset < tagEndOffset) {
    const prevOffset = reader.offset;
    const eventFlags = swfVersion >= 6 ? reader.readUI32() : reader.readUI16();
    if (eventFlags === 0) break;
    if (reader.offset + 4 > tagEndOffset) break;
    const actionRecordSize = reader.readUI32();
    const recordEnd = Math.min(tagEndOffset, reader.offset + actionRecordSize);

    let keyCode: number | undefined;
    if (swfVersion >= 6 && (eventFlags & 0x20000) !== 0) {
      keyCode = reader.readUI8();
    }

    const events: string[] = [];
    if (eventFlags & 0x0001) events.push('load');
    if (eventFlags & 0x0002) events.push('enterFrame');
    if (eventFlags & 0x0004) events.push('unload');
    if (eventFlags & 0x0008) events.push('mouseMove');
    if (eventFlags & 0x0010) events.push('mouseDown');
    if (eventFlags & 0x0020) events.push('mouseUp');
    if (eventFlags & 0x0040) events.push('keyDown');
    if (eventFlags & 0x0080) events.push('keyUp');
    if (eventFlags & 0x0400) events.push('press');
    if (eventFlags & 0x0800) events.push('release');
    if (eventFlags & 0x1000) events.push('releaseOutside');
    if (eventFlags & 0x2000) events.push('rollOver');
    if (eventFlags & 0x4000) events.push('rollOut');
    if (eventFlags & 0x20000) events.push('keyPress');

    const actionRecord = parseDoAction(reader, recordEnd, currentFrame, { clipPrefix, fileLength });
    actions.push({ events, eventFlags, keyCode, actionRecord });
    if (recordEnd <= prevOffset) break;
    reader.offset = recordEnd;
  }
  return actions;
}

/**
 * Parses SWF DefineButton (Tag 7) and DefineButton2 (Tag 34) state records and action handlers.
 */
function parseDefineButton(
  reader: BitReader,
  tagEndOffset: number,
  isButton2: boolean,
  currentFrame: number,
  fileLength?: number
): SwfButtonDefinition {
  const buttonId = reader.readUI16();
  let actionOffset = 0;
  let actionOffsetBase = 0;

  if (isButton2) {
    reader.readUI8(); // Flags (TrackAsMenu bit 0)
    actionOffsetBase = reader.offset;
    actionOffset = reader.readUI16();
  }

  const records: SwfButtonRecord[] = [];
  while (reader.offset < tagEndOffset) {
    const stateFlags = reader.readUI8();
    if (stateFlags === 0) break; // ButtonEndFlag
    const characterId = reader.readUI16();
    const depth = reader.readUI16();
    const matrix = reader.readMatrix();
    let cxform: SwfColorTransform | null = null;
    if (isButton2) {
      cxform = reader.readCXForm(true);
    }
    if (isButton2 && (stateFlags & 0x10)) {
      skipSwfFilterList(reader, tagEndOffset);
    }
    if (isButton2 && (stateFlags & 0x20)) {
      reader.readUI8(); // BlendMode
    }
    records.push({ states: stateFlags & 0x0F, characterId, depth, matrix, cxform });
  }

  const actions: SwfButtonCondAction[] = [];
  if (!isButton2) {
    // DefineButton (Tag 7): remaining bytes until EndAction are click actions
    if (reader.offset < tagEndOffset) {
      const actionRecord = parseDoAction(reader, tagEndOffset, currentFrame, { fileLength });
      actions.push({
        conditionFlags: 0x0008, // OverDownToOverUp (Release)
        keyCode: 0,
        isClick: true,
        isOver: false,
        actionRecord,
      });
    }
  } else if (actionOffset > 0) {
    reader.offset = Math.min(tagEndOffset, actionOffsetBase + actionOffset);
    while (reader.offset + 4 <= tagEndOffset) {
      const condStart = reader.offset;
      const condActionSize = reader.readUI16();
      const condEnd = condActionSize === 0 ? tagEndOffset : Math.min(tagEndOffset, condStart + condActionSize);
      const condFlags = reader.readUI16();
      // SWF BUTTONCONDACTION bit layout (16-bit LE):
      // bits 0..8 = mouse transitions (bit 2 = OverUpToOverDown Press, bit 3 = OverDownToOverUp Release, bit 0 = IdleToOverUp Over)
      // bits 9..15 = CondKeyPress (7-bit Flash key code)
      const keyCode = (condFlags >> 9) & 0x7F;
      const isClick = (condFlags & 0x000C) !== 0 || (keyCode === 0 && (condFlags & 0x01FF) !== 0);
      const isOver = (condFlags & 0x0001) !== 0;
      const actionRecord = parseDoAction(reader, condEnd, currentFrame, { fileLength });
      actions.push({
        conditionFlags: condFlags,
        keyCode,
        isClick,
        isOver,
        actionRecord,
      });
      if (condActionSize === 0 || condEnd <= condStart) break;
      reader.offset = condEnd;
    }
  }

  return { buttonId, isButton2, records, actions };
}

/**
 * Parses a SWF timeline tag stream (used for DefineSprite Tag 39 child timelines).
 */
function parseDefineSprite(
  reader: BitReader,
  tagEndOffset: number,
  swfVersion: number,
  fileLength?: number
): SwfSpriteDefinition {
  const spriteId = reader.readUI16();
  const declaredFrames = Math.max(1, reader.readUI16());

  const frames: SwfFrameSnapshot[] = [];
  const labels: { frame: number; name: string }[] = [];
  const actions: SwfActionRecord[] = [];
  const sounds: SwfStartSoundEvent[] = [];
  const activeDisplay = new Map<number, SwfDisplayEntry>();
  let currentFrame = 1;
  let hasTimelineMotion = false;
  let sawFrameMutation = false;

  while (reader.offset + 2 <= tagEndOffset) {
    const tagStartOffset = reader.offset;
    const tagCodeAndLength = reader.readUI16();
    const tagType = tagCodeAndLength >> 6;
    let tagLength = tagCodeAndLength & 0x3F;
    if (tagLength === 0x3F) tagLength = reader.readUI32();
    const nextTagOffset = Math.min(tagEndOffset, reader.offset + tagLength);

    if (tagType === 0) {
      break;
    } else if (tagType === 1) {
      // ShowFrame: reuse previous snapshot Map on unchanged hold frames (zero allocations)
      if (!sawFrameMutation && frames.length > 0) {
        frames.push({ frame: currentFrame, entries: frames[frames.length - 1].entries });
      } else {
        const snap = new Map<number, SwfDisplayEntry>();
        activeDisplay.forEach((v, k) => snap.set(k, { ...v }));
        frames.push({ frame: currentFrame, entries: snap });
      }
      if (currentFrame > 1 && sawFrameMutation) hasTimelineMotion = true;
      sawFrameMutation = false;
      currentFrame++;
    } else if (tagType === 43) {
      const lbl = reader.readString();
      if (lbl) labels.push({ frame: currentFrame, name: lbl });
    } else if (tagType === 15) {
      const ev = parseStartSoundTag(reader.bytes, reader.offset, nextTagOffset, currentFrame);
      if (ev) sounds.push(ev);
    } else if (tagType === 12 || tagType === 59) {
      if (tagType === 59) reader.readUI16(); // DoInitAction SpriteID
      actions.push(parseDoAction(reader, nextTagOffset, currentFrame, { fileLength }));
    } else if (tagType === 4 || tagType === 26 || tagType === 70) {
      const placed = parsePlaceObjectTag(reader, tagType, nextTagOffset, swfVersion, currentFrame, fileLength);
      if (placed) {
        applyPlaceToDisplayMap(activeDisplay, placed);
        if (currentFrame > 1) sawFrameMutation = true;
      }
    } else if (tagType === 5) {
      reader.readUI16(); // CharacterId
      const depth = reader.readUI16();
      activeDisplay.delete(depth);
      if (currentFrame > 1) sawFrameMutation = true;
    } else if (tagType === 28) {
      const depth = reader.readUI16();
      activeDisplay.delete(depth);
      if (currentFrame > 1) sawFrameMutation = true;
    }

    if (nextTagOffset <= tagStartOffset) break;
    reader.offset = nextTagOffset;
  }

  if (frames.length === 0 && activeDisplay.size > 0) {
    const snap = new Map<number, SwfDisplayEntry>();
    activeDisplay.forEach((v, k) => snap.set(k, { ...v }));
    frames.push({ frame: 1, entries: snap });
  }

  return {
    spriteId,
    frameCount: Math.max(declaredFrames, frames.length, 1),
    frames,
    labels,
    actions,
    sounds: sounds.length > 0 ? sounds : undefined,
    hasTimelineMotion: hasTimelineMotion || frames.length > 1,
  };
}

interface ParsedPlaceTag {
  depth: number;
  hasMove: boolean;
  characterId?: number;
  matrix?: SwfMatrix;
  cxform?: SwfColorTransform;
  filters?: SwfSurfaceFilter[];
  blendMode?: number;
  visible?: boolean;
  ratio?: number;
  name?: string;
  clipDepth?: number;
  clipActions?: SwfClipAction[];
}

function parsePlaceObjectTag(
  reader: BitReader,
  tagType: number,
  tagEndOffset: number,
  swfVersion: number,
  currentFrame: number,
  fileLength?: number
): ParsedPlaceTag | null {
  if (tagType === 4) {
    const characterId = reader.readUI16();
    const depth = reader.readUI16();
    const matrix = reader.readMatrix();
    let cxform: SwfColorTransform | undefined;
    if (reader.offset < tagEndOffset) {
      cxform = reader.readCXForm(false);
    }
    return { depth, hasMove: false, characterId, matrix, cxform };
  }

  if (tagType === 26) {
    const flags = reader.readUI8();
    const depth = reader.readUI16();
    const hasMove = (flags & 0x01) !== 0;
    const hasChar = (flags & 0x02) !== 0;
    const hasMatrix = (flags & 0x04) !== 0;
    const hasColorTransform = (flags & 0x08) !== 0;
    const hasRatio = (flags & 0x10) !== 0;
    const hasName = (flags & 0x20) !== 0;
    const hasClipDepth = (flags & 0x40) !== 0;
    const hasClipActions = (flags & 0x80) !== 0;

    const characterId = hasChar ? reader.readUI16() : undefined;
    const matrix = hasMatrix ? reader.readMatrix() : undefined;
    const cxform = hasColorTransform ? reader.readCXForm(true) : undefined;
    const ratio = hasRatio ? reader.readUI16() : undefined;
    const name = hasName ? reader.readString() : undefined;
    const clipDepth = hasClipDepth ? reader.readUI16() : undefined;
    const clipPrefix = name ? sanitizeAstIdent(name) : `depth_${depth}`;
    const clipActions = hasClipActions ? parseClipActions(reader, tagEndOffset, swfVersion, currentFrame, clipPrefix, fileLength) : undefined;

    return { depth, hasMove, characterId, matrix, cxform, ratio, name, clipDepth, clipActions };
  }

  if (tagType === 70) {
    const flags1 = reader.readUI8();
    const flags2 = reader.readUI8();
    const depth = reader.readUI16();
    const hasMove = (flags1 & 0x01) !== 0;
    const hasChar = (flags1 & 0x02) !== 0;
    const hasMatrix = (flags1 & 0x04) !== 0;
    const hasColorTransform = (flags1 & 0x08) !== 0;
    const hasRatio = (flags1 & 0x10) !== 0;
    const hasName = (flags1 & 0x20) !== 0;
    const hasClipDepth = (flags1 & 0x40) !== 0;
    const hasClipActions = (flags1 & 0x80) !== 0;
    const hasFilterList = (flags2 & 0x01) !== 0;
    const hasBlendMode = (flags2 & 0x02) !== 0;
    const hasCacheAsBitmap = (flags2 & 0x04) !== 0;
    const hasClassName = (flags2 & 0x08) !== 0;
    const hasImage = (flags2 & 0x10) !== 0;
    const hasVisible = (flags2 & 0x20) !== 0;
    const hasOpaqueBg = (flags2 & 0x40) !== 0;

    if (hasClassName || (hasImage && hasChar)) {
      reader.readString(); // ClassName
    }
    const characterId = hasChar ? reader.readUI16() : undefined;
    const matrix = hasMatrix ? reader.readMatrix() : undefined;
    const cxform = hasColorTransform ? reader.readCXForm(true) : undefined;
    const ratio = hasRatio ? reader.readUI16() : undefined;
    const name = hasName ? reader.readString() : undefined;
    const clipDepth = hasClipDepth ? reader.readUI16() : undefined;
    const filters = hasFilterList ? parseSwfFilterList(reader, tagEndOffset) : undefined;
    const blendMode = hasBlendMode ? reader.readUI8() : undefined;
    if (hasCacheAsBitmap) reader.readUI8();
    const visible = hasVisible ? reader.readUI8() !== 0 : undefined;
    if (hasOpaqueBg) reader.readRGBA(true);
    const clipPrefix = name ? sanitizeAstIdent(name) : `depth_${depth}`;
    const clipActions = hasClipActions ? parseClipActions(reader, tagEndOffset, swfVersion, currentFrame, clipPrefix, fileLength) : undefined;

    return {
      depth,
      hasMove,
      characterId,
      matrix,
      cxform,
      filters: filters && filters.length > 0 ? filters : undefined,
      blendMode,
      visible,
      ratio,
      name,
      clipDepth,
      clipActions,
    };
  }

  return null;
}

function applyPlaceToDisplayMap(activeDisplay: Map<number, SwfDisplayEntry>, placed: ParsedPlaceTag): void {
  const existing = activeDisplay.get(placed.depth);
  if (existing && (placed.hasMove || placed.characterId === undefined)) {
    activeDisplay.set(placed.depth, {
      depth: placed.depth,
      characterId: placed.characterId !== undefined ? placed.characterId : existing.characterId,
      matrix: placed.matrix !== undefined ? placed.matrix : existing.matrix,
      cxform: placed.cxform !== undefined ? placed.cxform : existing.cxform,
      filters: placed.filters !== undefined ? placed.filters : existing.filters,
      blendMode: placed.blendMode !== undefined ? placed.blendMode : existing.blendMode,
      visible: placed.visible !== undefined ? placed.visible : existing.visible,
      ratio: placed.ratio !== undefined ? placed.ratio : existing.ratio,
      name: placed.name !== undefined ? placed.name : existing.name,
      clipDepth: placed.clipDepth !== undefined ? placed.clipDepth : existing.clipDepth,
      clipActions: placed.clipActions !== undefined ? placed.clipActions : existing.clipActions,
    });
  } else if (placed.characterId !== undefined) {
    activeDisplay.set(placed.depth, {
      depth: placed.depth,
      characterId: placed.characterId,
      matrix: placed.matrix || null,
      cxform: placed.cxform || null,
      filters: placed.filters,
      blendMode: placed.blendMode,
      visible: placed.visible,
      ratio: placed.ratio,
      name: placed.name,
      clipDepth: placed.clipDepth,
      clipActions: placed.clipActions,
    });
  }
}

interface SwfAbcBlock {
  n: string;
  f: number;
  b64: string;
}

interface SwfAbcTraitSummary {
  name: string;
  superName: string;
  slots: Array<{ name: string; type: string; kind: string }>;
  methods: Array<{ name: string; returnType: string }>;
}

/**
 * Lightweight, strictly bounds-checked ABC header + class trait summarizer.
 * Extracts class names, superclasses, and instance slot/method blueprints for
 * Run-to-Convert distillation and Importer diagnostics without executing code.
 */
function summarizeAbcTraits(abcBytes: Uint8Array): SwfAbcTraitSummary[] {
  const summaries: SwfAbcTraitSummary[] = [];
  if (!abcBytes || abcBytes.length < 8) return summaries;
  let pos = 0;
  const len = abcBytes.length;

  const readU8 = (): number => (pos < len ? abcBytes[pos++] : 0);
  const readU16 = (): number => {
    if (pos + 2 > len) { pos = len; return 0; }
    const v = abcBytes[pos] | (abcBytes[pos + 1] << 8);
    pos += 2;
    return v;
  };
  const readU30 = (): number => {
    let result = 0;
    let shift = 0;
    for (let i = 0; i < 5; i++) {
      if (pos >= len) return result >>> 0;
      const b = abcBytes[pos++];
      result |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return result >>> 0;
  };
  const skipBytes = (n: number) => {
    pos = Math.min(len, pos + Math.max(0, n));
  };
  const readUtf8 = (n: number): string => {
    const safeN = Math.min(Math.max(0, n), len - pos);
    const slice = abcBytes.subarray(pos, pos + safeN);
    pos += safeN;
    try {
      return new TextDecoder('utf-8', { fatal: false }).decode(slice);
    } catch {
      let s = '';
      for (let i = 0; i < slice.length; i++) s += String.fromCharCode(slice[i]);
      return s;
    }
  };

  try {
    const minor = readU16();
    const major = readU16();
    if (major < 46 || major > 47 || minor > 32) return summaries;

    // 1. Constant pool
    const intCount = readU30();
    for (let i = 1; i < intCount && pos < len; i++) readU30();
    const uintCount = readU30();
    for (let i = 1; i < uintCount && pos < len; i++) readU30();
    const doubleCount = readU30();
    if (doubleCount > 1) skipBytes((doubleCount - 1) * 8);

    const strCount = Math.min(readU30(), 65536);
    const strings: string[] = [''];
    for (let i = 1; i < strCount && pos < len; i++) {
      const sLen = readU30();
      strings.push(readUtf8(sLen));
    }

    const nsCount = Math.min(readU30(), 65536);
    const namespaces: string[] = [''];
    for (let i = 1; i < nsCount && pos < len; i++) {
      readU8(); // kind
      const nameIdx = readU30();
      namespaces.push(strings[nameIdx] || '');
    }

    const nsSetCount = Math.min(readU30(), 65536);
    for (let i = 1; i < nsSetCount && pos < len; i++) {
      const cnt = readU30();
      for (let j = 0; j < cnt && pos < len; j++) readU30();
    }

    const mnCount = Math.min(readU30(), 65536);
    const multinames: string[] = ['*'];
    for (let i = 1; i < mnCount && pos < len; i++) {
      const kind = readU8();
      if (kind === 0x07 || kind === 0x0d) {
        // QName / QNameA
        const nsIdx = readU30();
        const nameIdx = readU30();
        const ns = namespaces[nsIdx] || '';
        const nm = strings[nameIdx] || '';
        multinames.push(ns ? `${ns}.${nm}` : nm);
      } else if (kind === 0x0f || kind === 0x10) {
        // RTQName / RTQNameA
        const nameIdx = readU30();
        multinames.push(strings[nameIdx] || '');
      } else if (kind === 0x11 || kind === 0x12) {
        multinames.push('*');
      } else if (kind === 0x09 || kind === 0x0e) {
        // Multiname / MultinameA
        const nameIdx = readU30();
        readU30(); // ns_set
        multinames.push(strings[nameIdx] || '');
      } else if (kind === 0x1b || kind === 0x1c) {
        // MultinameL / MultinameLA
        readU30(); // ns_set
        multinames.push('*');
      } else if (kind === 0x1d) {
        // TypeName (Vector.<T>)
        const qn = readU30();
        const pCount = readU30();
        for (let p = 0; p < pCount && pos < len; p++) readU30();
        multinames.push(multinames[qn] || 'Vector');
      } else {
        break;
      }
    }

    // 2. method_info
    const methodCount = Math.min(readU30(), 65536);
    const methodReturnTypes: string[] = [];
    for (let i = 0; i < methodCount && pos < len; i++) {
      const paramCount = readU30();
      const returnTypeIdx = readU30();
      methodReturnTypes.push(multinames[returnTypeIdx] || '*');
      for (let p = 0; p < paramCount && pos < len; p++) readU30();
      readU30(); // name
      const flags = readU8();
      if (flags & 0x08) {
        // HAS_OPTIONAL
        const optCount = readU30();
        for (let o = 0; o < optCount && pos < len; o++) {
          readU30();
          readU8();
        }
      }
      if (flags & 0x80) {
        // HAS_PARAM_NAMES
        for (let p = 0; p < paramCount && pos < len; p++) readU30();
      }
    }

    // 3. metadata_info
    const metaCount = Math.min(readU30(), 65536);
    for (let i = 0; i < metaCount && pos < len; i++) {
      readU30(); // name
      const itemCount = readU30();
      for (let k = 0; k < itemCount && pos < len; k++) {
        readU30();
        readU30();
      }
    }

    // 4. instance_info (classes)
    const classCount = Math.min(readU30(), 1024);
    for (let i = 0; i < classCount && pos < len; i++) {
      const nameIdx = readU30();
      const superIdx = readU30();
      const flags = readU8();
      if (flags & 0x08) readU30(); // protectedNs
      const ifaceCount = readU30();
      for (let k = 0; k < ifaceCount && pos < len; k++) readU30();
      readU30(); // iinit
      const traitCount = Math.min(readU30(), 512);
      const slots: Array<{ name: string; type: string; kind: string }> = [];
      const methods: Array<{ name: string; returnType: string }> = [];
      for (let t = 0; t < traitCount && pos < len; t++) {
        const tNameIdx = readU30();
        const tKindByte = readU8();
        const tKind = tKindByte & 0x0f;
        const tAttrs = (tKindByte >> 4) & 0x0f;
        const tName = multinames[tNameIdx] || '';
        if (tKind === 0 || tKind === 6) {
          // Slot / Const
          readU30(); // slot_id
          const typeIdx = readU30();
          const vindex = readU30();
          if (vindex !== 0) readU8(); // vkind
          if (tName && slots.length < 32) {
            slots.push({ name: tName, type: multinames[typeIdx] || '*', kind: tKind === 6 ? 'const' : 'var' });
          }
        } else if (tKind === 1 || tKind === 2 || tKind === 3) {
          // Method / Getter / Setter
          readU30(); // disp_id
          const mIdx = readU30();
          if (tName && methods.length < 32) {
            methods.push({ name: tName, returnType: methodReturnTypes[mIdx] || '*' });
          }
        } else if (tKind === 4 || tKind === 5) {
          // Class / Function
          readU30();
          readU30();
        }
        if (tAttrs & 0x04) {
          // ATTR_Metadata
          const mc = readU30();
          for (let m = 0; m < mc && pos < len; m++) readU30();
        }
      }
      const clsName = multinames[nameIdx] || `Class_${i}`;
      const superName = multinames[superIdx] || '';
      if (summaries.length < 64) {
        summaries.push({ name: clsName, superName, slots, methods });
      }
    }
  } catch {
    // Graceful truncation guard — return any classes parsed so far
  }

  return summaries;
}

/**
 * Extracts ActionScript 3.0 bytecode from DoABCDefine (Tag 72) and DoABC2 (Tag 82) tags.
 */
function parseDoABC(
  reader: BitReader,
  tagType: number,
  tagEndOffset: number,
  currentFrame: number
): { record: SwfActionRecord; block?: SwfAbcBlock; byteLength: number; traits: SwfAbcTraitSummary[] } {
  const record: SwfActionRecord = {
    frame: currentFrame,
    gotoFrames: [],
    gotoLabels: [],
    setVariables: [],
    branches: [],
    statements: [],
    enterFrameStatements: [],
    eventHandlers: [],
    usedKeys: [],
    referencedProps: new Set<string>(),
    poolRequests: [],
  };

  let flags = 0;
  let name = '';
  let block: SwfAbcBlock | undefined;
  let byteLength = 0;
  let traits: SwfAbcTraitSummary[] = [];

  try {
    // Tag 82 (DoABC2) carries UI32 flags + NUL-terminated name before raw ABC bytes;
    // Tag 72 (DoABCDefine) starts directly with the raw ABC header (minor/major u16).
    if (tagType === 82) {
      flags = reader.readUI32();
      name = reader.readString();
    }

    const remainingBytes = reader.readBytes(Math.max(0, tagEndOffset - reader.offset));
    byteLength = remainingBytes.length;
    if (remainingBytes.length >= 4) {
      block = {
        n: name || `abc_${currentFrame}`,
        f: flags,
        b64: bytesToBase64(remainingBytes),
      };
      traits = summarizeAbcTraits(remainingBytes);
    }

    let str = '';
    const strings: string[] = [];
    for (let i = 0; i < remainingBytes.length; i++) {
      const b = remainingBytes[i];
      if (b >= 32 && b <= 126) {
        str += String.fromCharCode(b);
      } else {
        if (str.length >= 2) strings.push(str);
        str = '';
      }
    }
    if (str.length >= 2) strings.push(str);

    const knownLabels = ['start', 'intro', 'step1', 'step2', 'step3', 'quiz', 'result', 'win', 'reset', 'game', 'play'];
    for (const s of strings) {
      if (knownLabels.includes(s.toLowerCase())) {
        record.gotoLabels!.push(s);
      } else if (['score', 'level', 'count', 'energy', 'velocity', 'temp', 'time'].includes(s.toLowerCase())) {
        record.setVariables!.push({ name: s, value: 0 });
      }
    }
  } catch {}

  return { record, block, byteLength, traits };
}

/**
 * Main Entry Point: Transpiles SWF file binary array into modern SVG + executable AST S-Expressions.
 */
export async function transpileSwfToAst(fileData: ArrayBuffer | Uint8Array, sceneId = 'imported-swf'): Promise<SwfTranspileResult> {
  _activeSymbolicLiftRemaining = 25000;
  try {
    const rawBytes = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData);
    if (rawBytes.length < 8) {
      return { success: false, error: 'File is too short to be a valid SWF binary (min 8 bytes required).', svgMarkup: '', astSource: '' };
    }

    const sig = String.fromCharCode(rawBytes[0], rawBytes[1], rawBytes[2]);
    if (sig !== 'FWS' && sig !== 'CWS' && sig !== 'ZWS') {
      return { success: false, error: `Unsupported SWF signature: "${sig}". Only standard FWS, CWS (zlib), or ZWS (LZMA) Flash files are supported.`, svgMarkup: '', astSource: '' };
    }

    const version = rawBytes[3];
    const fileLength = (
      rawBytes[4] |
      (rawBytes[5] << 8) |
      (rawBytes[6] << 16) |
      (rawBytes[7] << 24)
    ) >>> 0;

    let payload: Uint8Array;
    if (sig === 'CWS') {
      const compressedSlice = rawBytes.slice(8);
      const decompressed = await decompressSwfPayload(compressedSlice);
      payload = new Uint8Array(8 + decompressed.length);
      payload.set(rawBytes.subarray(0, 8), 0);
      payload.set(decompressed, 8);
    } else if (sig === 'ZWS') {
      payload = decompressZwsSwf(rawBytes);
    } else {
      payload = rawBytes;
    }

    const reader = new BitReader(payload, 8);
    const frameRect = reader.readRect();
    const frameRate = reader.readUI16() / 256;
    const frameCount = reader.readUI16();

    let backgroundColor = '#0f172a';
    const shapes: { id: string; charId: number; svg: string; primitives?: SwfShapePrimitive[]; bbox: { x: number; y: number; w: number; h: number } }[] = [];
    const morphShapes: SwfMorphShape[] = [];
    const sprites = new Map<number, SwfSpriteDefinition>();
    const buttons = new Map<number, SwfButtonDefinition>();
    const editTexts = new Map<number, SwfEditTextDef>();
    const vectorFonts = new Map<number, SwfVectorFontDef>();
    let staticTextCount = 0;
    const sounds = new Map<number, SwfSoundDef>();
    const startSounds: SwfStartSoundEvent[] = [];
    const bitmaps = new Map<number, SwfBitmapDef>();
    const fillDefsCollector: SwfFillDefsCollector = { gradients: [], patterns: [] };
    let totalSoundBytes = 0;
    let totalBitmapBytes = 0;
    const exportsMap: Record<string, number> = {};
    const initActions: { c: number; b64: string }[] = [];
    const actionBlocks: SwfActionRecord[] = [];
    const labels: { frame: number; name: string }[] = [];

    const activeDisplay = new Map<number, SwfDisplayEntry>();
    const timelineFrames: SwfFrameSnapshot[] = [];
    let hasMainTimelineMutations = false;
    let sawFrameMutation = false;
    let isAs3Flag = false;
    let hasDoAbcTag = false;
    let documentClass = '';
    const symbolClassMap: Record<number, string> = {};
    const abcBlocks: SwfAbcBlock[] = [];
    const abcTraits: SwfAbcTraitSummary[] = [];
    let totalAbcBytes = 0;

    let currentFrame = 1;
    let totalTagsParsed = 0;
    const skippedTagIdSet = new Set<number>();
    const bucketErrors = { config: 0, assets: 0, code: 0, display: 0 };
    let scriptLimits: { maxRecursionDepth: number; scriptTimeoutSeconds: number } | undefined;
    let hasXmlMetadata = false;
    let binaryDataTagCount = 0;
    let binaryDataBytes = 0;

    const effectiveFileLength = Math.max(1024, fileLength || payload.length);

    // Parse SWF tags
    while (reader.offset + 2 <= payload.length) {
      const tagStartOffset = reader.offset;
      const tagCodeAndLength = reader.readUI16();
      const tagType = tagCodeAndLength >> 6;
      let tagLength = tagCodeAndLength & 0x3F;
      if (tagLength === 0x3F) {
        tagLength = reader.readUI32();
      }

      const nextTagOffset = Math.min(payload.length, reader.offset + tagLength);

      if (tagType === 0) {
        break;
      }
      totalTagsParsed++;
      if (tagType === 9) {
        backgroundColor = reader.readRGBA(false);
      } else if (tagType === 14) {
        // DefineSound (Tag 14): PCM / SWF IMA ADPCM / MP3 audio asset
        if (totalSoundBytes < 3 * 1024 * 1024) {
          try {
            const snd = parseDefineSoundTag(payload, reader.offset, nextTagOffset);
            if (snd) {
              sounds.set(snd.id, snd);
              totalSoundBytes += Math.ceil((snd.b64.length * 3) / 4);
            }
          } catch {
            bucketErrors.assets++;
          }
        }
      } else if (tagType === 15) {
        // StartSound (Tag 15): timeline sound trigger
        try {
          const ev = parseStartSoundTag(payload, reader.offset, nextTagOffset, currentFrame);
          if (ev) startSounds.push(ev);
        } catch {
          bucketErrors.display++;
        }
      } else if (tagType === 20 || tagType === 21 || tagType === 35 || tagType === 36) {
        // DefineBitsLossless (20), DefineBitsJPEG2 (21), DefineBitsJPEG3 (35), DefineBitsLossless2 (36)
        if (totalBitmapBytes < 2 * 1024 * 1024) {
          try {
            const bmp = await parseSwfBitmapTag(
              tagType,
              payload,
              reader.offset,
              nextTagOffset,
              decompressSwfPayload
            );
            if (bmp) {
              bitmaps.set(bmp.id, bmp);
              totalBitmapBytes += bmp.uri.length;
            }
          } catch {
            bucketErrors.assets++;
          }
        }
      } else if (tagType === 2 || tagType === 22 || tagType === 32 || tagType === 83) {
        const shapeId = reader.readUI16();
        const tagVer = tagType === 2 ? 1 : (tagType === 22 ? 2 : (tagType === 32 ? 3 : 4));
        try {
          const shape = parseSwfShape(reader, shapeId, tagVer, nextTagOffset, fillDefsCollector);
          shapes.push(shape);
        } catch {
          bucketErrors.assets++;
          shapes.push({
            id: `swf-shape-${shapeId}`,
            charId: shapeId,
            svg: `<g id="swf-shape-${shapeId}" />`,
            bbox: { x: 0, y: 0, w: 0, h: 0 },
          });
        }
      } else if (tagType === 46 || tagType === 84) {
        const shapeId = reader.readUI16();
        const morphVer = tagType === 46 ? 1 : 2;
        try {
          const morph = parseSwfMorphShape(reader, shapeId, morphVer);
          morphShapes.push(morph);
        } catch {
          bucketErrors.assets++;
          morphShapes.push({
            id: `swf-morph-${shapeId}`,
            shapeId,
            startD: 'M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z',
            endD: 'M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z',
            startFill: '#38bdf8',
            endFill: '#818cf8',
            stroke: 'none',
            strokeWidth: 1,
            svg: `<path id="swf-morph-${shapeId}" d="M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z" fill="#38bdf8" stroke="none" data-morph-end="M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z" />`,
            bbox: { x: 40, y: 40, w: 100, h: 60 },
          });
        }
      } else if (tagType === 39) {
        // DefineSprite (Tag 39)
        try {
          const spriteDef = parseDefineSprite(reader, nextTagOffset, version, effectiveFileLength);
          sprites.set(spriteDef.spriteId, spriteDef);
        } catch {
          bucketErrors.assets++;
        }
      } else if (tagType === 7 || tagType === 34) {
        // DefineButton (Tag 7) / DefineButton2 (Tag 34)
        try {
          const btnDef = parseDefineButton(reader, nextTagOffset, tagType === 34, currentFrame, effectiveFileLength);
          buttons.set(btnDef.buttonId, btnDef);
        } catch {
          bucketErrors.assets++;
        }
      } else if (tagType === 69) {
        // FileAttributes (Tag 69): bit 3 (0x08) indicates ActionScript 3.0 (AVM2)
        try {
          const attrFlags = reader.readUI32();
          if ((attrFlags & 0x08) !== 0) isAs3Flag = true;
        } catch {
          bucketErrors.config++;
        }
      } else if (tagType === 65) {
        // ScriptLimits (Tag 65): Bucket A VM recursion & timeout bounds
        try {
          const maxRecursionDepth = reader.readUI16();
          const scriptTimeoutSeconds = reader.readUI16();
          scriptLimits = { maxRecursionDepth, scriptTimeoutSeconds };
        } catch {
          bucketErrors.config++;
        }
      } else if (tagType === 77) {
        // Metadata (Tag 77): Bucket A XML metadata envelope
        hasXmlMetadata = true;
      } else if (tagType === 87) {
        // DefineBinaryData (Tag 87): Bucket B embedded ByteArray payload (flagged in centrifuge)
        binaryDataTagCount++;
        binaryDataBytes += Math.max(0, nextTagOffset - reader.offset - 6);
        skippedTagIdSet.add(tagType);
      } else if (tagType === 12 || tagType === 59) {
        // DoAction (12) / DoInitAction (59)
        try {
          const initSpriteId = tagType === 59 ? reader.readUI16() : 0;
          const act = parseDoAction(reader, nextTagOffset, currentFrame, {
            fileLength: effectiveFileLength,
            skipSymbolicLift: tagType === 59,
          });
          if (tagType === 59) {
            if (act.rawBytecodeB64) {
              initActions.push({ c: initSpriteId, b64: act.rawBytecodeB64 });
            }
          } else {
            actionBlocks.push(act);
          }
        } catch {
          bucketErrors.code++;
        }
      } else if (tagType === 56) {
        // ExportAssets (Tag 56): linkage names for attachMovie()
        try {
          const count = reader.readUI16();
          for (let ei = 0; ei < count && reader.offset < nextTagOffset; ei++) {
            const expCharId = reader.readUI16();
            const expName = reader.readString();
            if (expName) exportsMap[expName] = expCharId;
          }
        } catch {
          bucketErrors.code++;
        }
      } else if (tagType === 76) {
        // SymbolClass (Tag 76): AS3 linkage names + Document Class (charId === 0)
        try {
          const count = reader.readUI16();
          for (let si = 0; si < count && reader.offset < nextTagOffset; si++) {
            const symCharId = reader.readUI16();
            const symName = reader.readString();
            if (symName) {
              symbolClassMap[symCharId] = symName;
              if (symCharId === 0) documentClass = symName;
              else exportsMap[symName] = symCharId;
            }
          }
        } catch {
          bucketErrors.code++;
        }
      } else if (tagType === 72 || tagType === 82) {
        // DoABCDefine (72) / DoABC2 (82): ActionScript 3.0 (AVM2) bytecode
        hasDoAbcTag = true;
        try {
          const parsedAbc = parseDoABC(reader, tagType, nextTagOffset, currentFrame);
          actionBlocks.push(parsedAbc.record);
          if (parsedAbc.block && totalAbcBytes + parsedAbc.byteLength <= 2 * 1024 * 1024) {
            abcBlocks.push(parsedAbc.block);
            totalAbcBytes += parsedAbc.byteLength;
          }
          if (parsedAbc.traits.length > 0 && abcTraits.length < 128) {
            for (const tr of parsedAbc.traits) {
              if (abcTraits.length < 128) abcTraits.push(tr);
            }
          }
        } catch {
          bucketErrors.code++;
        }
      } else if (tagType === 4 || tagType === 26 || tagType === 70) {
        try {
          const placed = parsePlaceObjectTag(reader, tagType, nextTagOffset, version, currentFrame, effectiveFileLength);
          if (placed) {
            applyPlaceToDisplayMap(activeDisplay, placed);
            if (currentFrame > 1) sawFrameMutation = true;
          }
        } catch {
          bucketErrors.display++;
        }
      } else if (tagType === 5) {
        reader.readUI16(); // CharacterId
        const depth = reader.readUI16();
        activeDisplay.delete(depth);
        if (currentFrame > 1) sawFrameMutation = true;
      } else if (tagType === 28) {
        // RemoveObject2 (Tag 28)
        const depth = reader.readUI16();
        activeDisplay.delete(depth);
        if (currentFrame > 1) sawFrameMutation = true;
      } else if (tagType === 1) {
        // ShowFrame (Tag 1): reuse previous snapshot Map on unchanged hold frames (zero allocations)
        if (!sawFrameMutation && timelineFrames.length > 0) {
          timelineFrames.push({ frame: currentFrame, entries: timelineFrames[timelineFrames.length - 1].entries });
        } else {
          const snap = new Map<number, SwfDisplayEntry>();
          activeDisplay.forEach((v, k) => snap.set(k, { ...v }));
          timelineFrames.push({ frame: currentFrame, entries: snap });
        }
        if (currentFrame > 1 && sawFrameMutation) hasMainTimelineMutations = true;
        sawFrameMutation = false;
        currentFrame++;
      } else if (tagType === 43) {
        const labelName = reader.readString();
        labels.push({ frame: currentFrame, name: labelName });
      } else if (tagType === 37) {
        // DefineEditText (Tag 37): dynamic/input text fields with live variableName binding
        try {
          const charId = reader.readUI16();
          const bounds = reader.readRect();
          reader.syncBits();
          const flags1 = reader.readUI8();
          const flags2 = reader.readUI8();
          const hasFont = (flags1 & 0x01) !== 0;
          const hasMaxLength = (flags1 & 0x02) !== 0;
          const hasTextColor = (flags1 & 0x04) !== 0;
          const isReadOnly = (flags1 & 0x08) !== 0;
          const isPassword = (flags1 & 0x10) !== 0;
          const isMultiline = (flags1 & 0x20) !== 0;
          const hasText = (flags1 & 0x80) !== 0;
          const hasFontClass = (flags2 & 0x80) !== 0;
          const hasLayout = (flags2 & 0x20) !== 0;
          const hasBorder = (flags2 & 0x08) !== 0;
          const isHtml = (flags2 & 0x02) !== 0;

          let fontSize = 14;
          if (hasFont) {
            reader.readUI16(); // FontID
          }
          if (hasFontClass) {
            reader.readString(); // FontClass
          }
          if (hasFont) {
            const fontHeightTwips = reader.readUI16();
            if (fontHeightTwips > 0) fontSize = Math.max(8, Math.min(96, Math.round(fontHeightTwips / 20)));
          }
          let textColor = '#ffffff';
          if (hasTextColor) {
            textColor = reader.readRGBA(true);
          }
          let maxLength = 0;
          if (hasMaxLength) {
            maxLength = reader.readUI16();
          }
          let align = 0;
          if (hasLayout) {
            align = reader.readUI8();
            reader.readUI16();
            reader.readUI16();
            reader.readUI16();
            reader.readSI16();
          }
          const variableName = reader.readString();
          const initialText = hasText ? reader.readString() : '';
          let plainText = String(initialText ?? '');
          if (isHtml) {
            let prev: string;
            do {
              prev = plainText;
              plainText = plainText.replace(/<[^>]*>/g, '');
            } while (plainText !== prev);
            plainText = plainText.replace(/[<>]/g, '');
          }
          editTexts.set(charId, {
            charId,
            x: Number(bounds.xMin.toFixed(2)),
            y: Number(bounds.yMin.toFixed(2)),
            w: Number(bounds.width.toFixed(2)),
            h: Number(bounds.height.toFixed(2)),
            fontSize,
            color: textColor,
            align,
            varName: variableName || '',
            text: plainText,
            isHtml,
            editable: !isReadOnly,
            password: isPassword,
            multiline: isMultiline,
            border: hasBorder,
            maxLength: maxLength > 0 ? maxLength : undefined,
          });

          if (plainText.trim() || variableName) {
            const anchor = align === 1 ? 'end' : (align === 2 ? 'middle' : 'start');
            const tx = align === 1 ? bounds.xMax : (align === 2 ? (bounds.xMin + bounds.xMax) / 2 : bounds.xMin);
            const ty = bounds.yMin + Math.min(bounds.height, Math.max(fontSize, bounds.height * 0.72));
            const escapedText = plainText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const varAttr = variableName ? ` data-swf-var="${variableName.replace(/"/g, '&quot;')}"` : '';
            const textSvg = `<text id="swf-text-${charId}" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="${textColor}" font-size="${fontSize}" text-anchor="${anchor}" font-family="system-ui, sans-serif" font-weight="600"${varAttr}>${escapedText}</text>`;
            shapes.push({
              id: `swf-text-${charId}`,
              charId,
              svg: textSvg,
              bbox: { x: bounds.xMin, y: bounds.yMin, w: bounds.width, h: bounds.height },
            });
          }
        } catch {
          bucketErrors.assets++;
        }
      } else if (tagType === 10 || tagType === 48 || tagType === 75) {
        // DefineFont (10), DefineFont2 (48), DefineFont3 (75): embedded vector glyph outlines
        try {
          const fontDef = parseDefineFontTag(reader, tagType, nextTagOffset);
          if (fontDef) vectorFonts.set(fontDef.fontId, fontDef);
        } catch {
          bucketErrors.assets++;
        }
      } else if (tagType === 11 || tagType === 33) {
        // DefineText (11), DefineText2 (33): static vector text rendered via DefineFont2/3 Bézier paths
        try {
          const staticTextShape = parseDefineTextTag(reader, tagType, nextTagOffset, vectorFonts);
          if (staticTextShape) {
            shapes.push(staticTextShape);
            staticTextCount++;
          }
        } catch {
          bucketErrors.assets++;
        }
      } else {
        skippedTagIdSet.add(tagType);
      }

      if (nextTagOffset <= tagStartOffset) break;
      reader.offset = nextTagOffset;
    }

    if (timelineFrames.length === 0 && activeDisplay.size > 0) {
      const snap = new Map<number, SwfDisplayEntry>();
      activeDisplay.forEach((v, k) => snap.set(k, { ...v }));
      timelineFrames.push({ frame: 1, entries: snap });
    }

    const totalFrames = Math.max(1, timelineFrames.length, frameCount || 1);
    const width = Math.max(320, Math.round(frameRect.width || 800));
    const height = Math.max(240, Math.round(frameRect.height || 480));
    const duration = Math.max(3, Math.round(totalFrames / (frameRate || 24)));

    const formatNum = (n: number): string => {
      const cleaned = Math.abs(n) < 1e-6 ? 0 : Number(n.toFixed(4));
      return String(cleaned === 0 ? 0 : cleaned);
    };
    const formatMatrixAttr = (m: SwfMatrix): string =>
      `matrix(${formatNum(m.scaleX)} ${formatNum(m.rotateSkew0)} ${formatNum(m.rotateSkew1)} ${formatNum(m.scaleY)} ${formatNum(m.transX)} ${formatNum(m.transY)})`;

    const shapeByCharId = new Map<number, { id: string; charId: number; svg: string; primitives?: SwfShapePrimitive[]; bbox: { x: number; y: number; w: number; h: number } }>();
    for (const s of shapes) shapeByCharId.set(s.charId, s);
    const morphByCharId = new Map<number, SwfMorphShape>();
    for (const m of morphShapes) morphByCharId.set(m.shapeId, m);

    // Collect all (depth, characterId) visual tracks across all frames so character swaps at the same depth
    // (e.g., Loading screen at Depth 1 on Frame 1 replaced by Menu/Game at Depth 1 on Frame 2+) render cleanly.
    interface MainDisplayTrack {
      key: string;
      depth: number;
      characterId: number;
      firstFrame: number;
      firstEntry: SwfDisplayEntry;
      name?: string;
      frameStates: Map<number, SwfDisplayEntry>;
      clipActions: SwfClipAction[];
    }
    const depthCharSets = new Map<number, Set<number>>();
    const allMainTracks = new Map<string, MainDisplayTrack>();

    for (const snap of timelineFrames) {
      snap.entries.forEach((entry, depth) => {
        if (!depthCharSets.has(depth)) depthCharSets.set(depth, new Set<number>());
        depthCharSets.get(depth)!.add(entry.characterId);

        const trackKey = `${depth}:${entry.characterId}`;
        let track = allMainTracks.get(trackKey);
        if (!track) {
          track = {
            key: trackKey,
            depth,
            characterId: entry.characterId,
            firstFrame: snap.frame,
            firstEntry: entry,
            name: entry.name,
            frameStates: new Map<number, SwfDisplayEntry>(),
            clipActions: [],
          };
          allMainTracks.set(trackKey, track);
        }
        if (entry.name && !track.name) track.name = entry.name;
        track.frameStates.set(snap.frame, entry);
        if (entry.clipActions && entry.clipActions.length > 0 && track.clipActions.length === 0) {
          track.clipActions = entry.clipActions;
        }
      });
    }

    // Determine whether this SWF has dynamic timelines, sprites, buttons, named clips, or executable AVM1
    const mainTrackList = Array.from(allMainTracks.values());
    const hasClipActions = mainTrackList.some((t) => t.clipActions.length > 0);
    const hasNamedInstances = mainTrackList.some((t) => Boolean(t.name));
    const hasExecutableMainActions = actionBlocks.some((ab) =>
      (ab.usedKeys && ab.usedKeys.length > 0) ||
      (ab.poolRequests && ab.poolRequests.length > 0) ||
      (ab.referencedProps && ab.referencedProps.size > 0) ||
      (ab.enterFrameStatements && ab.enterFrameStatements.length > 0) ||
      (ab.eventHandlers && ab.eventHandlers.length > 0) ||
      (ab.statements || []).some((st) => st.when || st.kind === 'nextFrame' || st.kind === 'prevFrame' || st.kind === 'spawnPool' || st.kind === 'gotoFrame' || st.kind === 'gotoLabel')
    );
    const isDynamicSwf =
      sprites.size > 0 ||
      buttons.size > 0 ||
      hasMainTimelineMutations ||
      hasClipActions ||
      hasNamedInstances ||
      hasExecutableMainActions;

    // Helper: label name -> 1-based frame number lookup
    const buildLabelMap = (lbls: { frame: number; name: string }[]): Map<string, number> => {
      const m = new Map<string, number>();
      for (const l of lbls) {
        m.set(l.name, l.frame);
        m.set(l.name.toLowerCase(), l.frame);
      }
      return m;
    };
    const mainLabelMap = buildLabelMap(labels);

    // Native continuous simulation pacing interval (seconds per SWF animation step, decoupled from 60Hz/120Hz monitor refresh)
    const nativeFps = Math.max(1, Math.min(60, Math.round(frameRate) || 24));
    const frameStepSec = Number(Math.max(0.008, (1 / nativeFps) - 0.0001).toFixed(4));

    // Helper: render raw SVG geometry for a character ID (shape, morph, sprite, or button) with unique instance prefix
    const usedCharIds = new Set<number>();
    const charRenderCount = new Map<number, number>();
    const dynamicBindings: string[] = [];
    const dynamicRules: string[] = [];
    const dynamicGestures: string[] = [];
    const reactiveVars = new Map<string, { val: any; min?: number; max?: number; label?: string }>();
    const allUsedKeys = new Map<number, SwfKeyBindingSpec>();
    const poolSlotsCreated: { poolBase: string; sourceClip: string; count: number }[] = [];

    const ensureVar = (name: string, val: any, min?: number, max?: number) => {
      if (!reactiveVars.has(name)) {
        reactiveVars.set(name, { val, min, max });
      }
    };

    const registerUsedKeys = (keys?: SwfKeyBindingSpec[]) => {
      if (!keys) return;
      for (const k of keys) {
        if (!allUsedKeys.has(k.keyCode)) {
          allUsedKeys.set(k.keyCode, k);
          ensureVar(k.varName, 0, 0, 1);
        }
      }
    };

    // Convert an Avm1LiftedStatement into reactive :rules or gesture :steps
    const emitStatementToRules = (
      st: Avm1LiftedStatement,
      labelMap: Map<string, number>,
      extraWhen?: string,
      outRules: string[] = dynamicRules,
      isOnEnter = false
    ) => {
      const when = composeAvm1When(extraWhen, st.when);
      const whenAttr = when ? (isOnEnter ? ` :on-enter "${when}"` : ` :when "${when}"`) : '';
      const targetPfx = (!st.targetPrefix || st.targetPrefix === '__root__') ? 'swf' : sanitizeAstIdent(st.targetPrefix);
      const frameVar = targetPfx === 'swf' ? 'swf_frame' : `${targetPfx}_frame`;
      const playVar = targetPfx === 'swf' ? 'swf_playing' : `${targetPfx}_playing`;

      if (st.kind === 'setVar' && st.varName && st.expr) {
        ensureVar(st.varName, st.rawVal !== undefined ? st.rawVal : 0);
        outRules.push(`    (:rule :var "${st.varName}"${whenAttr} :expr "${st.expr}")`);
      } else if (st.kind === 'stop') {
        ensureVar(playVar, 1, 0, 1);
        outRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "0")`);
      } else if (st.kind === 'play') {
        ensureVar(playVar, 1, 0, 1);
        outRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "1")`);
      } else if (st.kind === 'gotoFrame' && st.frame) {
        ensureVar(frameVar, 1, 1, Math.max(totalFrames, st.frame));
        ensureVar(playVar, 1, 0, 1);
        // Emit playVar BEFORE frameVar so mutating frameVar never invalidates the (= frameVar X) guard on playVar!
        outRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "${st.play ? 1 : 0}")`);
        outRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "${st.frame}")`);
      } else if (st.kind === 'gotoLabel' && st.label) {
        const targetFrame =
          labelMap.get(st.label) ??
          labelMap.get(st.label.toLowerCase()) ??
          mainLabelMap.get(st.label) ??
          mainLabelMap.get(st.label.toLowerCase()) ??
          1;
        ensureVar(frameVar, 1, 1, Math.max(totalFrames, targetFrame));
        ensureVar(playVar, 1, 0, 1);
        // Emit playVar BEFORE frameVar so mutating frameVar never invalidates the (= frameVar X) guard on playVar!
        outRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "${st.play ? 1 : 0}")`);
        outRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "${targetFrame}")`);
      } else if (st.kind === 'nextFrame') {
        ensureVar(frameVar, 1, 1, totalFrames);
        ensureVar(playVar, 1, 0, 1);
        outRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "0")`);
        outRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "(min ${totalFrames} (+ ${frameVar} 1))")`);
      } else if (st.kind === 'prevFrame') {
        ensureVar(frameVar, 1, 1, totalFrames);
        ensureVar(playVar, 1, 0, 1);
        outRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "0")`);
        outRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "(max 1 (- ${frameVar} 1))")`);
      } else if (st.kind === 'spawnPool' && st.poolBase) {
        const base = sanitizeAstIdent(st.poolBase);
        const src = sanitizeAstIdent(st.sourceClip || 'ship');
        const poolCount = 4;
        if (!poolSlotsCreated.some((p) => p.poolBase === base)) {
          poolSlotsCreated.push({ poolBase: base, sourceClip: src, count: poolCount });
        }
        ensureVar(`${base}_pool_idx`, 0, 0, poolCount - 1);
        for (let si = 0; si < poolCount; si++) {
          const slotPfx = `${base}_${si}`;
          const slotGuard = composeAvm1When(when, `(= ${base}_pool_idx ${si})`);
          const sgAttr = slotGuard ? ` :when "${slotGuard}"` : '';
          ensureVar(`${slotPfx}_x`, 0);
          ensureVar(`${slotPfx}_y`, 0);
          ensureVar(`${slotPfx}_visible`, 0, 0, 1);
          outRules.push(`    (:rule :var "${slotPfx}_x"${sgAttr} :expr "${src}_x")`);
          outRules.push(`    (:rule :var "${slotPfx}_y"${sgAttr} :expr "${src}_y")`);
          outRules.push(`    (:rule :var "${slotPfx}_visible"${sgAttr} :expr "1")`);
        }
        outRules.push(`    (:rule :var "${base}_pool_idx"${whenAttr} :expr "(% (+ ${base}_pool_idx 1) ${poolCount})")`);
      } else if (st.kind === 'removePool' && st.poolBase) {
        const base = sanitizeAstIdent(st.poolBase);
        ensureVar(`${base}_visible`, 1, 0, 1);
        outRules.push(`    (:rule :var "${base}_visible"${whenAttr} :expr "0")`);
      }
    };

    const emitStatementToGestureSteps = (
      st: Avm1LiftedStatement,
      labelMap: Map<string, number>
    ): string[] => {
      const wrapIf = (inner: string): string => (st.when ? `(:if "${st.when}" ${inner})` : inner);
      const targetPfx = (!st.targetPrefix || st.targetPrefix === '__root__') ? 'swf' : sanitizeAstIdent(st.targetPrefix);
      const frameVar = targetPfx === 'swf' ? 'swf_frame' : `${targetPfx}_frame`;
      const playVar = targetPfx === 'swf' ? 'swf_playing' : `${targetPfx}_playing`;

      if (st.kind === 'setVar' && st.varName && st.expr) {
        ensureVar(st.varName, st.rawVal !== undefined ? st.rawVal : 0);
        if (st.rawVal !== undefined && typeof st.rawVal === 'number' && !st.expr.startsWith('(')) {
          return [wrapIf(`(:set-var "${st.varName}" :val ${st.rawVal})`)];
        }
        return [wrapIf(`(:set-var "${st.varName}" :val-expr "${st.expr}")`)];
      }
      if (st.kind === 'stop') {
        ensureVar(playVar, 1, 0, 1);
        return [wrapIf(`(:set-var "${playVar}" :val 0)`)];
      }
      if (st.kind === 'play') {
        ensureVar(playVar, 1, 0, 1);
        return [wrapIf(`(:set-var "${playVar}" :val 1)`)];
      }
      if (st.kind === 'gotoFrame' && st.frame) {
        ensureVar(frameVar, 1, 1, Math.max(totalFrames, st.frame));
        ensureVar(playVar, 1, 0, 1);
        return [wrapIf(`(:seq (:set-var "${frameVar}" :val ${st.frame}) (:set-var "${playVar}" :val ${st.play ? 1 : 0}))`)];
      }
      if (st.kind === 'gotoLabel' && st.label) {
        const targetFrame =
          labelMap.get(st.label) ??
          labelMap.get(st.label.toLowerCase()) ??
          mainLabelMap.get(st.label) ??
          mainLabelMap.get(st.label.toLowerCase()) ??
          1;
        ensureVar(frameVar, 1, 1, Math.max(totalFrames, targetFrame));
        ensureVar(playVar, 1, 0, 1);
        return [wrapIf(`(:seq (:set-var "${frameVar}" :val ${targetFrame}) (:set-var "${playVar}" :val ${st.play ? 1 : 0}))`)];
      }
      if (st.kind === 'nextFrame') {
        ensureVar(frameVar, 1, 1, totalFrames);
        return [wrapIf(`(:set-var "${frameVar}" :val-expr "(min ${totalFrames} (+ ${frameVar} 1))")`)];
      }
      if (st.kind === 'prevFrame') {
        ensureVar(frameVar, 1, 1, totalFrames);
        return [wrapIf(`(:set-var "${frameVar}" :val-expr "(max 1 (- ${frameVar} 1))")`)];
      }
      return [];
    };

    const emitEventHandlersToGestures = (
      handlers: { target: string; event: string; statements: Avm1LiftedStatement[] }[] | undefined,
      labelMap: Map<string, number>
    ) => {
      if (!handlers || handlers.length === 0) return;
      for (const h of handlers) {
        const steps: string[] = [];
        for (const st of h.statements || []) {
          steps.push(...emitStatementToGestureSteps(st, labelMap));
        }
        if (steps.length === 0) continue;
        const bodySteps = steps.length === 1 ? steps[0] : `(:seq ${steps.join(' ')})`;
        const targetSel = h.target === '__stage__' ? '#scene-root' : `#swf-inst-${sanitizeAstIdent(h.target)}`;
        dynamicGestures.push(`    (:on-click :target "${targetSel}" ${bodySteps})`);
      }
    };

    const maskClipDefs: string[] = [];

    // Extracts SVG geometry primitives allowed inside <clipPath>, preserving nested <g transform="..."> chains
    const extractSvgClipPrimitives = (innerSvg: string, matrix?: SwfMatrix | null): string => {
      const expandedSvg = innerSvg.replace(
        /<use\b([^>]*?)\bhref="#swf-shape-(\d+)"([^>]*?)\/?>/gi,
        (_m, pre: string, idStr: string, post: string) => {
          const cid = parseInt(idStr, 10);
          const sh = shapeByCharId.get(cid);
          if (!sh || !sh.svg) return '';
          const combined = `${pre} ${post}`;
          const tm = combined.match(/\btransform="([^"]*)"/i);
          return tm && tm[1] ? `<g transform="${tm[1]}">${sh.svg}</g>` : sh.svg;
        }
      );
      const rootMat = matrix ? formatMatrixAttr(matrix) : '';
      const transformStack: string[] = rootMat ? [rootMat] : [];
      const out: string[] = [];
      const ALLOWED_CLIP_ATTRS = new Set([
        'd', 'x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'points', 'fill-rule', 'clip-rule'
      ]);
      const escAttr = (val: string): string =>
        val
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      const parseAttrMap = (rawAttrs: string): Map<string, string> => {
        const map = new Map<string, string>();
        const attrRe = /([a-zA-Z_][\w:-]*)\s*=\s*"([^"]*)"/g;
        let am: RegExpExecArray | null;
        while ((am = attrRe.exec(rawAttrs)) !== null) {
          map.set(am[1].toLowerCase(), am[2]);
        }
        return map;
      };
      const tokenRe = /<(\/?)(g|path|rect|circle|ellipse|polygon|polyline)\b([^>]*?)(\/?)>/gi;
      let match: RegExpExecArray | null;
      while ((match = tokenRe.exec(expandedSvg)) !== null) {
        const isClose = match[1] === '/';
        const tagName = match[2].toLowerCase();
        const attrMap = parseAttrMap(match[3] || '');
        const isSelfClose = match[4] === '/';
        if (tagName === 'g') {
          if (isClose) {
            if (transformStack.length > (rootMat ? 1 : 0)) transformStack.pop();
          } else if (!isSelfClose) {
            transformStack.push(attrMap.get('transform') || '');
          }
          continue;
        }
        if (isClose) continue;
        const safeParts: string[] = [];
        for (const [k, v] of attrMap.entries()) {
          if (ALLOWED_CLIP_ATTRS.has(k)) {
            safeParts.push(` ${k}="${escAttr(v)}"`);
          }
        }
        const chain = transformStack.filter(Boolean);
        const selfTransform = attrMap.get('transform');
        if (selfTransform) chain.push(selfTransform);
        if (chain.length > 0) {
          safeParts.push(` transform="${escAttr(chain.join(' '))}"`);
        }
        out.push(`<${tagName}${safeParts.join('')} />`);
      }
      return out.join('\n      ');
    };

    let legacySvgChars = 0;
    const MAX_LEGACY_SVG_CHARS = 350000;

    const cachedShapeDefIds = new Set<number>();
    const shapeDefsEntries: string[] = [];
    for (const sh of shapes) {
      if (sh.id === `swf-shape-${sh.charId}` && !cachedShapeDefIds.has(sh.charId)) {
        cachedShapeDefIds.add(sh.charId);
        shapeDefsEntries.push(`    ${sh.svg}`);
      }
    }

    const renderCharacterSvg = (
      charId: number,
      instanceDomPrefix: string,
      instanceVarPrefix?: string,
      parentActiveWhen?: string,
      depth = 0,
      ancestors: Set<number> = new Set()
    ): string => {
      if (depth > 12 || legacySvgChars >= MAX_LEGACY_SVG_CHARS) return '';
      const shape = shapeByCharId.get(charId);
      if (shape) {
        usedCharIds.add(charId);
        const c = (charRenderCount.get(charId) || 0) + 1;
        charRenderCount.set(charId, c);
        const out = cachedShapeDefIds.has(charId)
          ? `<use href="#swf-shape-${charId}" />`
          : (c > 1
            ? shape.svg.replace(`id="${shape.id}"`, `id="${instanceDomPrefix}-${shape.id}"`)
            : shape.svg);
        legacySvgChars += out.length;
        return out;
      }
      const morph = morphByCharId.get(charId);
      if (morph) {
        usedCharIds.add(charId);
        const c = (charRenderCount.get(charId) || 0) + 1;
        charRenderCount.set(charId, c);
        const out = c > 1
          ? morph.svg.replace(`id="${morph.id}"`, `id="${instanceDomPrefix}-${morph.id}"`)
          : morph.svg;
        legacySvgChars += out.length;
        return out;
      }

      const sprite = sprites.get(charId);
      if (sprite) {
        if (ancestors.has(charId)) return '';
        const nextAncestors = new Set(ancestors);
        nextAncestors.add(charId);
        usedCharIds.add(charId);
        const spPrefix = instanceVarPrefix || `sprite_${charId}`;
        const spFrameVar = `${spPrefix}_frame`;
        const spPlayVar = `${spPrefix}_playing`;
        const spTotalVar = `${spPrefix}_totalframes`;
        const spLoadedVar = `${spPrefix}_framesloaded`;

        // Collect all (depth, characterId) tracks inside this sprite so swapped depth characters work cleanly
        const spDepthCharSets = new Map<number, Set<number>>();
        const spTracks = new Map<string, { depth: number; characterId: number; firstFrame: number; frameMap: Map<number, SwfDisplayEntry> }>();
        for (const snap of sprite.frames) {
          snap.entries.forEach((e, d) => {
            if (!spDepthCharSets.has(d)) spDepthCharSets.set(d, new Set<number>());
            spDepthCharSets.get(d)!.add(e.characterId);
            const tKey = `${d}:${e.characterId}`;
            let tr = spTracks.get(tKey);
            if (!tr) {
              tr = { depth: d, characterId: e.characterId, firstFrame: snap.frame, frameMap: new Map() };
              spTracks.set(tKey, tr);
            }
            tr.frameMap.set(snap.frame, e);
          });
        }

        const spLabelMap = buildLabelMap(sprite.labels);
        const stopsOnFrame1 = sprite.actions.some((a) => a.frame === 1 && a.stops);
        if (sprite.frameCount > 1 || sprite.actions.length > 0) {
          ensureVar(spFrameVar, 1, 1, sprite.frameCount);
          ensureVar(spPlayVar, stopsOnFrame1 ? 0 : 1, 0, 1);
          ensureVar(spTotalVar, sprite.frameCount, 1, sprite.frameCount);
          ensureVar(spLoadedVar, sprite.frameCount, 1, sprite.frameCount);
          if (sprite.frameCount > 1) {
            const spAccVar = `${spPrefix}_anim_acc`;
            ensureVar(spAccVar, 0, 0, 10);
            const spAdvanceGuard = composeAvm1When(parentActiveWhen, `(= ${spPlayVar} 1)`);
            // Continuous sim_dt pacing so multi-frame sprites run at the SWF's native FPS on 60Hz/120Hz displays
            dynamicRules.push(
              `    (:rule :var "${spAccVar}" :when "${spAdvanceGuard}" :expr "(+ ${spAccVar} sim_dt)")`
            );
            dynamicRules.push(
              `    (:rule :var "${spFrameVar}" :when "(and ${spAdvanceGuard} (>= ${spAccVar} ${frameStepSec}))" :expr "(if (>= ${spFrameVar} ${sprite.frameCount}) 1 (+ ${spFrameVar} 1))")`
            );
            dynamicRules.push(
              `    (:rule :var "${spAccVar}" :when "(>= ${spAccVar} ${frameStepSec})" :expr "(- ${spAccVar} ${frameStepSec})")`
            );
          }
          for (const act of sprite.actions) {
            registerUsedKeys(act.usedKeys);
            const spFrameGuard = composeAvm1When(parentActiveWhen, sprite.frameCount > 1 ? `(= ${spFrameVar} ${act.frame})` : undefined);
            for (const st of act.statements || []) {
              const scopedSt: Avm1LiftedStatement = {
                ...st,
                targetPrefix: st.targetPrefix === '__root__' ? '__root__' : (st.targetPrefix ? st.targetPrefix : spPrefix),
              };
              if (act.frame === 1 && st.kind === 'stop' && !st.when && scopedSt.targetPrefix === spPrefix) continue;
              const targetLabels = scopedSt.targetPrefix === '__root__' ? mainLabelMap : spLabelMap;
              emitStatementToRules(scopedSt, targetLabels, spFrameGuard, dynamicRules, sprite.frameCount > 1);
            }
            for (const st of act.enterFrameStatements || []) {
              const scopedSt: Avm1LiftedStatement = {
                ...st,
                targetPrefix: st.targetPrefix === '__root__' ? '__root__' : (st.targetPrefix ? st.targetPrefix : spPrefix),
              };
              const targetLabels = scopedSt.targetPrefix === '__root__' ? mainLabelMap : spLabelMap;
              emitStatementToRules(scopedSt, targetLabels, parentActiveWhen, dynamicRules, false);
            }
            emitEventHandlersToGestures(act.eventHandlers, mainLabelMap);
          }
        }

        const childParts: string[] = [];
        const sortedSpTracks = Array.from(spTracks.values()).sort((a, b) => a.depth - b.depth || a.firstFrame - b.firstFrame);
        const activeSpMasks: Array<{ clipDepth: number; maskId: string; frames: Set<number> }> = [];
        for (const tr of sortedSpTracks) {
          const { depth: d, characterId: cid, frameMap } = tr;
          const firstSnapEntry = Array.from(frameMap.values())[0];
          const swapsAtDepth = (spDepthCharSets.get(d)?.size || 1) > 1;
          const childDomId = swapsAtDepth ? `${instanceDomPrefix}-d${d}-c${cid}` : `${instanceDomPrefix}-d${d}`;
          const nestedName = firstSnapEntry.name ? sanitizeAstIdent(firstSnapEntry.name) : undefined;
          const childInner = renderCharacterSvg(cid, childDomId, nestedName, parentActiveWhen, depth + 1, nextAncestors);

          // Flash PlaceObject2/3 clipDepth > 0 defines an invisible clipping mask for depths (d+1..clipDepth]
          const spClipDepth = Array.from(frameMap.values()).find((fe) => fe.clipDepth && fe.clipDepth > d)?.clipDepth;
          if (spClipDepth && spClipDepth > d) {
            const maskId = `swf-mask-${sanitizeAstIdent(childDomId)}`;
            const geom = extractSvgClipPrimitives(childInner, firstSnapEntry.matrix);
            if (geom) {
              maskClipDefs.push(`    <clipPath id="${maskId}">\n      ${geom}\n    </clipPath>`);
              activeSpMasks.push({ clipDepth: spClipDepth, maskId, frames: new Set(frameMap.keys()) });
            }
            continue;
          }

          // Only apply a mask if the child track's active frames are covered by that mask;
          // wrap in an UN-TRANSFORMED outer <g clip-path="..."> so the clipPath stays in parent coordinates!
          const matchingSpMask = activeSpMasks.find((m) => {
            if (d > m.clipDepth) return false;
            for (const f of frameMap.keys()) {
              if (!m.frames.has(f)) return false;
            }
            return true;
          });
          const initMat = firstSnapEntry.matrix ? ` transform="${formatMatrixAttr(firstSnapEntry.matrix)}"` : '';
          const initAlpha = firstSnapEntry.cxform ? ` opacity="${formatNum(firstSnapEntry.cxform.alpha)}"` : '';
          const visibleOn1 = frameMap.has(1);
          const initDisp = !visibleOn1 ? ' display="none"' : '';
          const childGroup = `<g id="${childDomId}" data-sprite-depth="${d}"${initMat}${initAlpha}${initDisp}>${childInner}</g>`;
          childParts.push(matchingSpMask ? `<g clip-path="url(#${matchingSpMask.maskId})">${childGroup}</g>` : childGroup);

          if (sprite.frameCount > 1) {
            const matClauses: string[] = [];
            const alphaClauses: string[] = [];
            const dispClauses: string[] = [];
            let matChanges = false;
            let alphaChanges = false;
            let dispChanges = false;
            let prevMat: string | null = null;
            let prevAlpha: string | null = null;

            for (let f = 1; f <= sprite.frameCount; f++) {
              const fe = frameMap.get(f);
              if (fe) {
                dispClauses.push(`(${f} 'inline')`);
                const mStr = fe.matrix ? formatMatrixAttr(fe.matrix) : 'matrix(1 0 0 1 0 0)';
                if (prevMat !== null && prevMat !== mStr) matChanges = true;
                prevMat = mStr;
                matClauses.push(`(${f} '${mStr}')`);

                const aStr = formatNum(fe.cxform ? fe.cxform.alpha : 1);
                if (prevAlpha !== null && prevAlpha !== aStr) alphaChanges = true;
                prevAlpha = aStr;
                alphaClauses.push(`(${f} ${aStr})`);
              } else {
                dispChanges = true;
                dispClauses.push(`(${f} 'none')`);
              }
            }
            if (matChanges) {
              dynamicBindings.push(`    (:target "#${childDomId}" :attr "transform" :expr "(case ${spFrameVar} ${matClauses.join(' ')} (else '${prevMat || 'matrix(1 0 0 1 0 0)'}'))")`);
            }
            if (alphaChanges) {
              dynamicBindings.push(`    (:target "#${childDomId}" :attr "opacity" :expr "(case ${spFrameVar} ${alphaClauses.join(' ')} (else 1))")`);
            }
            if (dispChanges) {
              dynamicBindings.push(`    (:target "#${childDomId}" :attr "display" :expr "(case ${spFrameVar} ${dispClauses.join(' ')} (else 'none'))")`);
            }
          }
        }
        return childParts.join('\n      ');
      }

      const btn = buttons.get(charId);
      if (btn) {
        usedCharIds.add(charId);
        const bc = (charRenderCount.get(charId) || 0) + 1;
        charRenderCount.set(charId, bc);
        const btnDomId = bc === 1 ? `swf-btn-${btn.buttonId}` : `${instanceDomPrefix}-btn-${btn.buttonId}`;
        // Partition Flash button state records: Up (0x01), Over (0x02), Down (0x04), HitTest-only (0x08)
        const upRecords = btn.records.filter((r) => (r.states & 0x01) !== 0);
        const overOnlyRecords = btn.records.filter((r) => (r.states & 0x02) !== 0 && (r.states & 0x01) === 0);
        const downOnlyRecords = btn.records.filter((r) => (r.states & 0x04) !== 0 && (r.states & 0x01) === 0 && (r.states & 0x02) === 0);
        const hitOnlyRecords = btn.records.filter((r) => (r.states & 0x08) !== 0 && (r.states & 0x07) === 0);
        const hasInteractiveVisualStates = upRecords.length > 0 && (overOnlyRecords.length > 0 || downOnlyRecords.length > 0);
        const displayRecords = upRecords.length > 0 ? upRecords : btn.records.filter((r) => (r.states & 0x07) !== 0);

        const btnAncestors = new Set(ancestors);
        btnAncestors.add(charId);
        const renderBtnStateList = (recs: SwfButtonRecord[], tag: string) =>
          recs
            .slice()
            .sort((a, b) => a.depth - b.depth)
            .map((rec) => {
              const inner = renderCharacterSvg(rec.characterId, `${btnDomId}-${tag}-d${rec.depth}`, undefined, undefined, depth + 1, btnAncestors);
              const matAttr = rec.matrix ? ` transform="${formatMatrixAttr(rec.matrix)}"` : '';
              const opAttr = rec.cxform ? ` opacity="${formatNum(rec.cxform.alpha)}"` : '';
              return `<g id="${btnDomId}-${tag}-${rec.depth}"${matAttr}${opAttr}>${inner}</g>`;
            });

        const childGroups: string[] = [];
        const btnStateVarPfx = sanitizeAstIdent(btnDomId);
        if (hasInteractiveVisualStates) {
          const overRecords = btn.records.filter((r) => (r.states & 0x02) !== 0);
          const downRecords = btn.records.filter((r) => (r.states & 0x04) !== 0);
          ensureVar(`${btnStateVarPfx}_hover`, 0, 0, 1);
          ensureVar(`${btnStateVarPfx}_press`, 0, 0, 1);
          childGroups.push(`<g id="${btnDomId}-up">${renderBtnStateList(upRecords, 'up').join('')}</g>`);
          dynamicBindings.push(
            `    (:target "#${btnDomId}-up" :attr "display" :expr "(if (and (= ${btnStateVarPfx}_hover 0) (= ${btnStateVarPfx}_press 0)) 'inline' 'none')")`
          );
          if (overRecords.length > 0) {
            childGroups.push(`<g id="${btnDomId}-over" display="none">${renderBtnStateList(overRecords, 'over').join('')}</g>`);
            dynamicBindings.push(
              `    (:target "#${btnDomId}-over" :attr "display" :expr "(if (and (> ${btnStateVarPfx}_hover 0) (= ${btnStateVarPfx}_press 0)) 'inline' 'none')")`
            );
          }
          if (downRecords.length > 0) {
            childGroups.push(`<g id="${btnDomId}-down" display="none">${renderBtnStateList(downRecords, 'down').join('')}</g>`);
            dynamicBindings.push(
              `    (:target "#${btnDomId}-down" :attr "display" :expr "(if (> ${btnStateVarPfx}_press 0) 'inline' 'none')")`
            );
          }
          dynamicGestures.push(
            `    (:hoverable :target "#${btnDomId}" :hover-var "${btnStateVarPfx}_hover" :press-var "${btnStateVarPfx}_press" :val 1 :leave-val 0)`
          );
        } else {
          for (const rec of displayRecords.sort((a, b) => a.depth - b.depth)) {
            const inner = renderCharacterSvg(rec.characterId, `${btnDomId}-d${rec.depth}`, undefined, undefined, depth + 1, btnAncestors);
            const matAttr = rec.matrix ? ` transform="${formatMatrixAttr(rec.matrix)}"` : '';
            const opAttr = rec.cxform ? ` opacity="${formatNum(rec.cxform.alpha)}"` : '';
            childGroups.push(`<g id="${btnDomId}-s${rec.depth}"${matAttr}${opAttr}>${inner}</g>`);
          }
        }
        // Render invisible HitTest-only regions with pointer-events="all" so transparent Flash buttons remain clickable
        for (const rec of hitOnlyRecords.sort((a, b) => a.depth - b.depth)) {
          const inner = renderCharacterSvg(rec.characterId, `${btnDomId}-hit-d${rec.depth}`, undefined, undefined, depth + 1, btnAncestors);
          const matAttr = rec.matrix ? ` transform="${formatMatrixAttr(rec.matrix)}"` : '';
          childGroups.push(`<g id="${btnDomId}-hit-${rec.depth}" opacity="0" pointer-events="all"${matAttr}>${inner}</g>`);
        }
        if (childGroups.length === 0 && btn.records.length > 0) {
          const rec = btn.records[0];
          const inner = renderCharacterSvg(rec.characterId, `${btnDomId}-d${rec.depth}`, undefined, undefined, depth + 1, btnAncestors);
          const matAttr = rec.matrix ? ` transform="${formatMatrixAttr(rec.matrix)}"` : '';
          childGroups.push(`<g id="${btnDomId}-s${rec.depth}" pointer-events="all"${matAttr}>${inner}</g>`);
        }
        const btnChildren = childGroups.join('\n        ');
        const btnPointerAttrs = hasInteractiveVisualStates
          ? ` :hover-var "${btnStateVarPfx}_hover" :press-var "${btnStateVarPfx}_press"`
          : '';

        // Compile DefineButton / DefineButton2 actions into :on-click and :on-key gestures
        for (const ba of btn.actions) {
          registerUsedKeys(ba.actionRecord.usedKeys);
          const steps: string[] = [];
          for (const st of ba.actionRecord.statements || []) {
            steps.push(...emitStatementToGestureSteps(st, mainLabelMap));
          }
          if (steps.length > 0) {
            const bodySteps = steps.length === 1 ? steps[0] : `(:seq ${steps.join(' ')})`;
            if (ba.keyCode > 0) {
              const keySpec = mapSwfButtonKeyCode(ba.keyCode);
              dynamicGestures.push(`    (:on-key :code "${keySpec.domCode}" ${bodySteps})`);
            }
            if (ba.isClick) {
              dynamicGestures.push(`    (:on-click :target "#${btnDomId}"${btnPointerAttrs} ${bodySteps})`);
            }
          }
        }

        return `<g id="${btnDomId}" role="button" tabindex="0" aria-label="SWF Button ${btn.buttonId}" pointer-events="all" style="cursor:pointer">\n        ${btnChildren}\n      </g>`;
      }

      return '';
    };

    const placedSvgElements: string[] = [];

    let strippedPreloaderFrames = 0;
    let entryFrame = 1;
    let executionModel: 'sim-continuous' | 'sim-modal' | 'static-vector' = 'static-vector';

    if (!isDynamicSwf) {
      // Static single-frame SWF path (100% compatible with Sims 1–11)
      const sortedDisplayList = Array.from(activeDisplay.values()).sort((a, b) => a.depth - b.depth);
      const activeStaticMasks: Array<{ clipDepth: number; maskId: string }> = [];
      for (const entry of sortedDisplayList) {
        const targetItem = shapeByCharId.get(entry.characterId) || morphByCharId.get(entry.characterId);
        if (!targetItem) continue;

        usedCharIds.add(entry.characterId);
        const count = (charRenderCount.get(entry.characterId) || 0) + 1;
        charRenderCount.set(entry.characterId, count);

        if (entry.clipDepth && entry.clipDepth > entry.depth) {
          const maskId = `swf-mask-d${entry.depth}-c${entry.characterId}`;
          const geom = extractSvgClipPrimitives(targetItem.svg, entry.matrix);
          if (geom) {
            maskClipDefs.push(`    <clipPath id="${maskId}">\n      ${geom}\n    </clipPath>`);
            activeStaticMasks.push({ clipDepth: entry.clipDepth, maskId });
          }
          continue;
        }

        let innerSvg = cachedShapeDefIds.has(entry.characterId)
          ? `<use href="#swf-shape-${entry.characterId}" />`
          : targetItem.svg;
        if (!cachedShapeDefIds.has(entry.characterId) && count > 1) {
          innerSvg = innerSvg.replace(`id="${targetItem.id}"`, `id="${targetItem.id}-d${entry.depth}"`);
        }

        const matchingMask = activeStaticMasks.find((m) => entry.depth <= m.clipDepth);
        const cssBlend = swfBlendModeToCss(entry.blendMode);
        const needsWrap = Boolean(entry.matrix || (entry.cxform && entry.cxform.alpha < 1) || cssBlend || entry.visible === false);
        const tAttr = entry.matrix ? ` transform="${formatMatrixAttr(entry.matrix)}"` : '';
        const opAttr = entry.cxform && entry.cxform.alpha < 1 ? ` opacity="${formatNum(entry.cxform.alpha)}"` : '';
        const bmAttr = cssBlend ? ` style="mix-blend-mode:${cssBlend}"` : '';
        const visAttr = entry.visible === false ? ' display="none" visibility="hidden"' : '';
        const innerPlaced = needsWrap
          ? `<g id="swf-place-${entry.depth}" data-character-id="${entry.characterId}"${tAttr}${opAttr}${bmAttr}${visAttr}>\n      ${innerSvg}\n    </g>`
          : innerSvg;
        if (matchingMask) {
          placedSvgElements.push(`<g clip-path="url(#${matchingMask.maskId})">\n      ${innerPlaced}\n    </g>`);
        } else {
          placedSvgElements.push(innerPlaced);
        }
      }
    } else {
      // :Sim-First SWF Compiler:
      // 1. Detect & STRIP leading Flash network preloader frames at compile time so the :Sim boots straight into live content.
      // 2. Pace multi-frame animations continuously via sim_dt at the SWF's native FPS (refresh-rate independent).
      const PRELOADER_LABEL_RE = /^(pre-?load(?:er)?|load(?:ing|er)?|buffer)$/i;
      const spriteUsesPreloader = (charId: number, visited = new Set<number>()): boolean => {
        if (visited.has(charId)) return false;
        visited.add(charId);
        const sp = sprites.get(charId);
        if (!sp) return false;
        if (sp.actions.some((a) => a.usesPreloaderApi)) return true;
        for (const snap of sp.frames) {
          for (const e of snap.entries.values()) {
            if (e.clipActions?.some((ca) => ca.actionRecord.usesPreloaderApi)) return true;
            if (spriteUsesPreloader(e.characterId, visited)) return true;
          }
        }
        return false;
      };

      const spriteHasInteractiveControl = (charId: number, visited = new Set<number>()): boolean => {
        if (visited.has(charId)) return false;
        visited.add(charId);
        if (buttons.has(charId)) return true;
        const sp = sprites.get(charId);
        if (!sp) return false;
        if (sp.actions.some((a) => (a.eventHandlers && a.eventHandlers.length > 0) || (a.usedKeys && a.usedKeys.length > 0))) {
          return true;
        }
        for (const snap of sp.frames) {
          for (const e of snap.entries.values()) {
            if (e.clipActions?.some((ca) => ca.events.includes('mouseDown') || ca.events.includes('press') || ca.events.includes('release') || ca.events.includes('keyDown') || ca.events.includes('keyPress'))) {
              return true;
            }
            if (spriteHasInteractiveControl(e.characterId, visited)) return true;
          }
        }
        return false;
      };

      const frameHasInteractiveControl = (frameNum: number): boolean => {
        // Any DefineButton (direct or nested in a DefineSprite) placed on this frame?
        for (const tr of mainTrackList) {
          if (!tr.frameStates.has(frameNum)) continue;
          if (buttons.has(tr.characterId) || spriteHasInteractiveControl(tr.characterId)) return true;
          if (tr.clipActions.some((ca) => ca.events.includes('mouseDown') || ca.events.includes('press') || ca.events.includes('release') || ca.events.includes('keyDown') || ca.events.includes('keyPress'))) {
            return true;
          }
        }
        // Any frame DoAction registering eventHandlers or Key.isDown?
        for (const ab of actionBlocks) {
          if (ab.frame !== frameNum) continue;
          if ((ab.eventHandlers && ab.eventHandlers.length > 0) || (ab.usedKeys && ab.usedKeys.length > 0)) return true;
        }
        return false;
      };

      const isPreloaderFrame = (frameNum: number): boolean => {
        if (totalFrames <= 1 || frameNum >= totalFrames) return false;
        const lbl = labels.find((l) => l.frame === frameNum);
        if (lbl && PRELOADER_LABEL_RE.test(lbl.name.trim())) return true;
        if (actionBlocks.some((ab) => ab.frame === frameNum && ab.usesPreloaderApi)) return true;
        // Any preloader MovieClip / ClipAction exclusive to frames <= frameNum
        for (const tr of mainTrackList) {
          const framesPresent = Array.from(tr.frameStates.keys());
          if (!framesPresent.includes(frameNum)) continue;
          const exclusiveToEarly = framesPresent.every((f) => f <= frameNum);
          if (!exclusiveToEarly) continue;
          if (tr.clipActions.some((ca) => ca.actionRecord.usesPreloaderApi)) return true;
          if (spriteUsesPreloader(tr.characterId)) return true;
        }
        // Dead-end Frame 1 stop() with zero Frame-1 interactive controls and zero non-stop exit statements
        if (frameNum === 1) {
          const f1Actions = actionBlocks.filter((ab) => ab.frame === 1);
          const f1Stops = f1Actions.some((ab) => ab.stops);
          if (f1Stops && !frameHasInteractiveControl(1)) {
            const hasF1ExitStmt = f1Actions.some((ab) =>
              [...(ab.statements || []), ...(ab.enterFrameStatements || [])].some(
                (st) => st.kind === 'gotoFrame' || st.kind === 'gotoLabel' || st.kind === 'play' || st.kind === 'nextFrame'
              )
            );
            const hasF1SpriteRootExit = mainTrackList.some((tr) => {
              if (!tr.frameStates.has(1)) return false;
              const sp = sprites.get(tr.characterId);
              if (sp && sp.actions.some((a) => [...(a.statements || []), ...(a.enterFrameStatements || [])].some((st) => st.targetPrefix === '__root__' && (st.kind === 'gotoFrame' || st.kind === 'gotoLabel' || st.kind === 'play')))) {
                return true;
              }
              return tr.clipActions.some((ca) => (ca.actionRecord.statements || []).some((st) => st.kind === 'gotoFrame' || st.kind === 'gotoLabel' || st.kind === 'play'));
            });
            if (!hasF1ExitStmt && !hasF1SpriteRootExit) return true;
          }
        }
        return false;
      };

      entryFrame = 1;
      while (entryFrame < totalFrames && isPreloaderFrame(entryFrame)) {
        entryFrame++;
      }
      // Also strip classic 2-frame preloader loop-back frame (Frame 2 solely jumping back to Frame 1)
      if (entryFrame === 2 && totalFrames >= 3 && !frameHasInteractiveControl(2)) {
        const f2Acts = actionBlocks.filter((ab) => ab.frame === 2);
        const onlyLoopsTo1 = f2Acts.length > 0 && f2Acts.every((ab) =>
          (ab.statements || []).length > 0 &&
          (ab.statements || []).every((st) => st.kind === 'gotoFrame' && st.frame === 1)
        );
        if (onlyLoopsTo1) entryFrame = 3;
      }

      strippedPreloaderFrames = entryFrame - 1;
      const playableFrameCount = Math.max(1, totalFrames - strippedPreloaderFrames);

      // Strip all preloader-only tracks & actions completely from the compiled :Sim!
      const activeTracks = strippedPreloaderFrames > 0
        ? mainTrackList.filter((tr) => Array.from(tr.frameStates.keys()).some((f) => f >= entryFrame))
        : mainTrackList;
      const activeActionBlocks = strippedPreloaderFrames > 0
        ? actionBlocks.filter((ab) => ab.frame >= entryFrame)
        : actionBlocks;

      // Recompute per-depth character multiplicity across active playable tracks only
      const activeDepthCharSets = new Map<number, Set<number>>();
      for (const tr of activeTracks) {
        if (!activeDepthCharSets.has(tr.depth)) activeDepthCharSets.set(tr.depth, new Set<number>());
        activeDepthCharSets.get(tr.depth)!.add(tr.characterId);
      }

      const entryStops = activeActionBlocks.some((ab) => ab.frame === entryFrame && ab.stops);
      const hasInteractiveSimControls =
        buttons.size > 0 ||
        hasClipActions ||
        activeActionBlocks.some((ab) => (ab.usedKeys && ab.usedKeys.length > 0) || (ab.eventHandlers && ab.eventHandlers.length > 0));
      executionModel = (playableFrameCount > 1 && (entryStops || hasInteractiveSimControls))
        ? 'sim-modal'
        : 'sim-continuous';

      // Complex real-world SWFs run directly on the pure-SVG AVM1 Micro-VM (:swf-vm);
      // bypass multi-MB throwaway legacy SVG unrolling and per-frame (case swf_frame ...) bindings.
      const isComplexVmSwf =
        totalFrames > 60 ||
        shapes.length > 80 ||
        sprites.size > 20 ||
        activeTracks.length > 40 ||
        activeActionBlocks.length > 25;

      ensureVar('sim_dt', 0.0167, 0, 0.2);
      ensureVar('swf_frame', entryFrame, entryFrame, totalFrames);
      ensureVar('swf_playing', entryStops ? 0 : 1, 0, 1);
      ensureVar('swf_totalframes', totalFrames, 1, totalFrames);
      ensureVar('swf_framesloaded', totalFrames, 1, totalFrames);
      if (playableFrameCount > 1) {
        // Start primed at frameStepSec when paused so clicking Play transitions with 0ms latency
        ensureVar('swf_anim_acc', entryStops ? frameStepSec : 0, 0, 10);
      }
      ensureVar('swf_tick', 0, 0, 1000000);

      if (!isComplexVmSwf) {
      // Process entry-frame DoAction initial variable assignments before clip rules
      // (strictly apply literal values from entryFrame only so later frames never clobber entry visibility/state)
      for (const ab of activeActionBlocks) {
        registerUsedKeys(ab.usedKeys);
        if (ab.frame === entryFrame) {
          for (const sv of ab.setVariables || []) {
            reactiveVars.set(sv.name, { val: sv.value });
          }
        } else {
          for (const sv of ab.setVariables || []) {
            if (!sv.name.endsWith('_visible')) {
              ensureVar(sv.name, 0);
            }
          }
        }
      }

      // Emit main timeline DoAction statements using native player :on-enter rising-edge rules
      // (fires ONCE on entering each mode/screen — zero boilerplate tracking vars, never re-traps play() clicks)
      const mainActionRules: string[] = [];
      for (const ab of activeActionBlocks) {
        const activeFrameGuard = playableFrameCount > 1 ? `(= swf_frame ${ab.frame})` : undefined;
        for (const st of ab.statements || []) {
          if (ab.frame === entryFrame && st.kind === 'stop' && !st.when) continue; // Already folded into swf_playing = 0
          if (ab.frame === entryFrame && st.kind === 'setVar' && !st.when && st.rawVal !== undefined) continue; // Already folded into :vars initial values
          emitStatementToRules(st, mainLabelMap, activeFrameGuard, mainActionRules, playableFrameCount > 1);
        }
        // Continuous onEnterFrame = function() { ... } lifted from frame DoAction
        for (const st of ab.enterFrameStatements || []) {
          emitStatementToRules(st, mainLabelMap, activeFrameGuard, mainActionRules, false);
        }
        // Button/clip event handlers (e.g. playBtn.onRelease = function() { ... })
        emitEventHandlersToGestures(ab.eventHandlers, mainLabelMap);
      }
      dynamicRules.push(...mainActionRules);

      // Build presence guard restricted to active playable frames [entryFrame..totalFrames]
      const buildActivePresenceGuard = (frameStates: Map<number, SwfDisplayEntry>): string | undefined => {
        if (playableFrameCount <= 1) return undefined;
        const activeFrames = Array.from(frameStates.keys()).filter((f) => f >= entryFrame).sort((a, b) => a - b);
        if (activeFrames.length >= playableFrameCount || activeFrames.length === 0) return undefined;
        if (activeFrames.length === 1) return `(= swf_frame ${activeFrames[0]})`;
        return `(or ${activeFrames.map((f) => `(= swf_frame ${f})`).join(' ')})`;
      };

      // Emit pre-allocated <g> wrappers for every active (depth, characterId) track
      const sortedTracks = activeTracks.sort((a, b) => a.depth - b.depth || a.firstFrame - b.firstFrame);
      const instanceSourceCharMap = new Map<string, number>();
      const usedMainDomIds = new Set<string>();
      const activeMainMasks: Array<{ clipDepth: number; maskId: string; frames: Set<number> }> = [];

      for (const track of sortedTracks) {
        const safeName = track.name ? sanitizeAstIdent(track.name) : '';
        const swapsAtDepth = (activeDepthCharSets.get(track.depth)?.size || 1) > 1;
        let domId = safeName
          ? `swf-inst-${safeName}`
          : (swapsAtDepth ? `swf-place-${track.depth}-c${track.characterId}` : `swf-place-${track.depth}`);
        if (usedMainDomIds.has(domId)) {
          domId = `${domId}-d${track.depth}-c${track.characterId}`;
        }
        usedMainDomIds.add(domId);

        const entryState = track.frameStates.get(entryFrame) || track.firstEntry;
        if (safeName) instanceSourceCharMap.set(safeName, entryState.characterId);

        const initMat = entryState.matrix || { scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0, transX: 0, transY: 0 };
        const initAlpha = entryState.cxform ? entryState.cxform.alpha : 1;
        const visibleOnEntry = track.frameStates.has(entryFrame) && entryState.visible !== false;
        const parentActiveWhen = buildActivePresenceGuard(track.frameStates);
        const trackFirstActiveFrame = Math.max(entryFrame, track.firstFrame);

        // Flash PlaceObject2/3 clipDepth > 0 marks an invisible mask layer clipping depths (track.depth+1..clipDepth]
        const trackClipDepth =
          entryState.clipDepth ||
          Array.from(track.frameStates.values()).find((fe) => fe.clipDepth && fe.clipDepth > track.depth)?.clipDepth;
        if (trackClipDepth && trackClipDepth > track.depth) {
          const maskInner = renderCharacterSvg(entryState.characterId, domId, undefined, parentActiveWhen);
          const maskId = `swf-mask-${sanitizeAstIdent(domId)}`;
          const geom = extractSvgClipPrimitives(maskInner, entryState.matrix);
          if (geom) {
            const maskFrames = new Set<number>();
            for (const f of track.frameStates.keys()) {
              if (f >= entryFrame) maskFrames.add(f);
            }
            maskClipDefs.push(`    <clipPath id="${maskId}">\n      ${geom}\n    </clipPath>`);
            activeMainMasks.push({ clipDepth: trackClipDepth, maskId, frames: maskFrames });
          }
          continue;
        }

        // Pre-apply entry-frame onClipEvent(load) _visible overrides so initial SVG attributes match runtime state
        let initVisibleVal = visibleOnEntry ? 1 : 0;
        if (safeName) {
          const visVarKey = `${safeName}_visible`;
          if (reactiveVars.has(visVarKey)) {
            const rawInit = reactiveVars.get(visVarKey)!.val;
            initVisibleVal = rawInit && Number(rawInit) > 0 ? 1 : 0;
          }
          if (trackFirstActiveFrame === entryFrame) {
            for (const ca of track.clipActions) {
              if (!ca.events.includes('load')) continue;
              for (const st of ca.actionRecord.statements || []) {
                if (st.kind === 'setVar' && st.varName === visVarKey && st.rawVal !== undefined && !st.when) {
                  initVisibleVal = st.rawVal && Number(st.rawVal) > 0 ? 1 : 0;
                }
              }
            }
          }
        }
        const startsVisible = visibleOnEntry && initVisibleVal > 0;

        const innerSvg = renderCharacterSvg(entryState.characterId, domId, safeName || undefined, parentActiveWhen);
        // Only apply a mask when every active frame of this track is covered by that mask,
        // and place clip-path on an UN-TRANSFORMED outer <g> so the clipPath evaluates in stage coordinates!
        const matchingMask = activeMainMasks.find((m) => {
          if (track.depth > m.clipDepth) return false;
          let hasActiveFrame = false;
          for (const f of track.frameStates.keys()) {
            if (f < entryFrame) continue;
            hasActiveFrame = true;
            if (!m.frames.has(f)) return false;
          }
          return hasActiveFrame;
        });
        const transformAttr = entryState.matrix ? ` transform="${formatMatrixAttr(initMat)}"` : '';
        const opacityAttr = initAlpha < 1 ? ` opacity="${formatNum(initAlpha)}"` : '';
        const cssBlend = swfBlendModeToCss(entryState.blendMode);
        const blendStyleAttr = cssBlend ? ` style="mix-blend-mode:${cssBlend}"` : '';
        const visibilityAttr = safeName
          ? (startsVisible ? ' visibility="visible" pointer-events="auto"' : ' visibility="hidden" pointer-events="none" display="none"')
          : (!visibleOnEntry ? ' display="none"' : '');
        const nameAttr = track.name ? ` data-swf-name="${track.name}"` : '';

        const trackGroup = `<g id="${domId}" data-character-id="${entryState.characterId}" data-depth="${track.depth}"${nameAttr}${transformAttr}${opacityAttr}${blendStyleAttr}${visibilityAttr}>\n      ${innerSvg}\n    </g>`;
        placedSvgElements.push(
          matchingMask
            ? `<g clip-path="url(#${matchingMask.maskId})">\n      ${trackGroup}\n    </g>`
            : trackGroup
        );

        // If this is a named MovieClip/Button instance, bind Flash properties (_x, _y, _xscale, _yscale, _rotation, _alpha, _visible)
        if (safeName) {
          const rotDeg = Math.atan2(initMat.rotateSkew0, initMat.scaleX) * (180 / Math.PI);
          const scaleXLen = Math.hypot(initMat.scaleX, initMat.rotateSkew0) || 1;
          const scaleYLen = Math.hypot(initMat.rotateSkew1, initMat.scaleY) || 1;

          ensureVar(`${safeName}_x`, Number(formatNum(initMat.transX)), -2000, 4000);
          ensureVar(`${safeName}_y`, Number(formatNum(initMat.transY)), -2000, 4000);
          ensureVar(`${safeName}_xscale`, Number(formatNum(scaleXLen * 100)), -1000, 1000);
          ensureVar(`${safeName}_yscale`, Number(formatNum(scaleYLen * 100)), -1000, 1000);
          ensureVar(`${safeName}_rotation`, Number(formatNum(rotDeg)), -3600, 3600);
          ensureVar(`${safeName}_alpha`, Number(formatNum(initAlpha * 100)), 0, 100);
          reactiveVars.set(`${safeName}_visible`, { val: startsVisible ? 1 : 0, min: 0, max: 1 });

          dynamicBindings.push(
            `    (:target "#${domId}" :attr "transform" :expr "(str 'translate(' ${safeName}_x ', ' ${safeName}_y ') rotate(' ${safeName}_rotation ') scale(' (/ ${safeName}_xscale 100) ', ' (/ ${safeName}_yscale 100) ')')")`
          );
          dynamicBindings.push(
            `    (:target "#${domId}" :attr "opacity" :expr "(/ ${safeName}_alpha 100)")`
          );
          dynamicBindings.push(
            `    (:target "#${domId}" :attr "visibility" :expr "(if (> ${safeName}_visible 0) 'visible' 'hidden')")`
          );
          dynamicBindings.push(
            `    (:target "#${domId}" :attr "pointer-events" :expr "(if (> ${safeName}_visible 0) 'auto' 'none')")`
          );
          dynamicBindings.push(
            `    (:target "#${domId}" :attr "display" :expr "(if (> ${safeName}_visible 0) 'inline' 'none')")`
          );

          // Sync mode-presence visibility via native :on-enter rising-edge rules when a named instance lives on a subset of active modes
          const activePresentFrames: number[] = [];
          const activeAbsentFrames: number[] = [];
          for (let f = entryFrame; f <= totalFrames; f++) {
            if (track.frameStates.has(f)) activePresentFrames.push(f);
            else activeAbsentFrames.push(f);
          }
          if (playableFrameCount > 1 && activePresentFrames.length > 0 && activeAbsentFrames.length > 0) {
            const presentGuard = activePresentFrames.length === 1
              ? `(= swf_frame ${activePresentFrames[0]})`
              : `(or ${activePresentFrames.map((f) => `(= swf_frame ${f})`).join(' ')})`;
            const absentGuard = activeAbsentFrames.length === 1
              ? `(= swf_frame ${activeAbsentFrames[0]})`
              : `(or ${activeAbsentFrames.map((f) => `(= swf_frame ${f})`).join(' ')})`;
            dynamicRules.push(`    (:rule :var "${safeName}_visible" :on-enter "${presentGuard}" :expr "1")`);
            dynamicRules.push(`    (:rule :var "${safeName}_visible" :on-enter "${absentGuard}" :expr "0")`);
          }
        } else if (playableFrameCount > 1) {
          // Pure display-list state/keyframe binding across active playable modes [entryFrame..totalFrames]
          const matClauses: string[] = [];
          const alphaClauses: string[] = [];
          const dispClauses: string[] = [];
          let matChanges = false;
          let alphaChanges = false;
          let dispChanges = false;
          let prevMat: string | null = null;
          let prevAlpha: string | null = null;

          for (let f = entryFrame; f <= totalFrames; f++) {
            const fe = track.frameStates.get(f);
            if (fe) {
              dispClauses.push(`(${f} 'inline')`);
              const mStr = fe.matrix ? formatMatrixAttr(fe.matrix) : 'matrix(1 0 0 1 0 0)';
              if (prevMat !== null && prevMat !== mStr) matChanges = true;
              prevMat = mStr;
              matClauses.push(`(${f} '${mStr}')`);

              const aStr = formatNum(fe.cxform ? fe.cxform.alpha : 1);
              if (prevAlpha !== null && prevAlpha !== aStr) alphaChanges = true;
              prevAlpha = aStr;
              alphaClauses.push(`(${f} ${aStr})`);
            } else {
              dispChanges = true;
              dispClauses.push(`(${f} 'none')`);
            }
          }

          if (matChanges) {
            dynamicBindings.push(
              `    (:target "#${domId}" :attr "transform" :expr "(case swf_frame ${matClauses.join(' ')} (else '${prevMat || 'matrix(1 0 0 1 0 0)'}'))")`
            );
          }
          if (alphaChanges) {
            dynamicBindings.push(
              `    (:target "#${domId}" :attr "opacity" :expr "(case swf_frame ${alphaClauses.join(' ')} (else 1))")`
            );
          }
          if (dispChanges) {
            dynamicBindings.push(
              `    (:target "#${domId}" :attr "display" :expr "(case swf_frame ${dispClauses.join(' ')} (else 'none'))")`
            );
          }
        }

        // Lift PlaceObject2 ClipActions (onClipEvent(load), enterFrame, keyDown, mouseDown)
        for (const ca of track.clipActions) {
          registerUsedKeys(ca.actionRecord.usedKeys);
          const stmts = ca.actionRecord.statements || [];

          if (ca.events.includes('load')) {
            const isEntryLoad = trackFirstActiveFrame === entryFrame;
            const loadGuard = isEntryLoad ? '(= swf_tick 0)' : `(= swf_frame ${trackFirstActiveFrame})`;
            for (const st of stmts) {
              if (isEntryLoad && st.kind === 'setVar' && st.varName && st.rawVal !== undefined && !st.when) {
                reactiveVars.set(st.varName, { val: st.rawVal });
              } else {
                emitStatementToRules(st, mainLabelMap, loadGuard, dynamicRules, !isEntryLoad);
              }
            }
          }
          if (ca.events.includes('enterFrame')) {
            for (const st of stmts) {
              emitStatementToRules(st, mainLabelMap, parentActiveWhen);
            }
          }
          if (ca.events.includes('mouseDown')) {
            const steps: string[] = [];
            for (const st of stmts) steps.push(...emitStatementToGestureSteps(st, mainLabelMap));
            if (steps.length > 0) {
              const body = steps.length === 1 ? steps[0] : `(:seq ${steps.join(' ')})`;
              dynamicGestures.push(`    (:on-click :target "#${domId}" ${body})`);
            }
          }
          if (ca.events.includes('keyDown') || ca.events.includes('keyPress')) {
            const steps: string[] = [];
            for (const st of stmts) steps.push(...emitStatementToGestureSteps(st, mainLabelMap));
            if (steps.length > 0) {
              const body = steps.length === 1 ? steps[0] : `(:seq ${steps.join(' ')})`;
              const keySpec = ca.keyCode ? mapSwfButtonKeyCode(ca.keyCode) : mapFlashKeyCode(32);
              dynamicGestures.push(`    (:on-key :code "${keySpec.domCode}" ${body})`);
            }
          }
        }
      }

      // Continuous sim_dt-paced timeline advancement across playable modes [entryFrame..totalFrames]:
      // - While paused (swf_playing == 0), keep swf_anim_acc primed at frameStepSec so Play clicks respond on the next tick.
      // - While playing, accumulate real sim_dt and step at the SWF's exact native FPS (refresh-rate independent),
      //   wrapping strictly within [entryFrame..totalFrames] so stripped preloader frames are never re-entered.
      if (playableFrameCount > 1) {
        dynamicRules.push(
          `    (:rule :var "swf_anim_acc" :when "(= swf_playing 0)" :expr "${frameStepSec}")`
        );
        dynamicRules.push(
          `    (:rule :var "swf_anim_acc" :when "(= swf_playing 1)" :expr "(+ swf_anim_acc sim_dt)")`
        );
        dynamicRules.push(
          `    (:rule :var "swf_frame" :when "(and (= swf_playing 1) (>= swf_anim_acc ${frameStepSec}))" :expr "(if (>= swf_frame ${totalFrames}) ${entryFrame} (+ swf_frame 1))")`
        );
        dynamicRules.push(
          `    (:rule :var "swf_anim_acc" :when "(and (= swf_playing 1) (>= swf_anim_acc ${frameStepSec}))" :expr "(- swf_anim_acc ${frameStepSec})")`
        );
      }

      // Emit pre-allocated zero-GC projectile / clone pool SVG <g> nodes & bindings
      for (const pool of poolSlotsCreated) {
        const srcCharId = instanceSourceCharMap.get(pool.sourceClip) || shapes[0]?.charId || 0;
        for (let si = 0; si < pool.count; si++) {
          const slotPfx = `${pool.poolBase}_${si}`;
          const poolDomId = `swf-pool-${slotPfx}`;
          const inner = srcCharId ? renderCharacterSvg(srcCharId, poolDomId) : `<circle id="${poolDomId}-dot" r="4" fill="#38bdf8" />`;
          placedSvgElements.push(
            `<g id="${poolDomId}" data-pool-base="${pool.poolBase}" data-pool-slot="${si}" visibility="hidden" pointer-events="none" display="none">\n      ${inner}\n    </g>`
          );
          dynamicBindings.push(
            `    (:target "#${poolDomId}" :attr "transform" :expr "(str 'translate(' ${slotPfx}_x ', ' ${slotPfx}_y ')')")`
          );
          dynamicBindings.push(
            `    (:target "#${poolDomId}" :attr "visibility" :expr "(if (> ${slotPfx}_visible 0) 'visible' 'hidden')")`
          );
          dynamicBindings.push(
            `    (:target "#${poolDomId}" :attr "pointer-events" :expr "(if (> ${slotPfx}_visible 0) 'auto' 'none')")`
          );
          dynamicBindings.push(
            `    (:target "#${poolDomId}" :attr "display" :expr "(if (> ${slotPfx}_visible 0) 'inline' 'none')")`
          );
        }
      }

      // Emit :on-key holdable state flags for all Key.isDown(keyCode) usages
      allUsedKeys.forEach((spec) => {
        dynamicGestures.push(
          `    (:on-key :code "${spec.domCode}" :hold-var "${spec.varName}" :val 1 :release-val 0)`
        );
      });

      // Advance swf_tick at end of each frame tick
      dynamicRules.push(`    (:rule :var "swf_tick" :expr "(+ swf_tick 1)")`);
      } // end !isComplexVmSwf
    }

    // Collect keyboard bindings across ALL SWFs (including complex VM SWFs, sprites, buttons, and clipActions)
    for (const ab of actionBlocks) {
      registerUsedKeys(ab.usedKeys);
    }
    sprites.forEach((sp) => {
      for (const ab of sp.actions) registerUsedKeys(ab.usedKeys);
      for (const snap of sp.frames) {
        snap.entries.forEach((e) => {
          if (e.clipActions) {
            for (const ca of e.clipActions) registerUsedKeys(ca.actionRecord?.usedKeys);
          }
        });
      }
    });
    for (const snap of timelineFrames) {
      snap.entries.forEach((e) => {
        if (e.clipActions) {
          for (const ca of e.clipActions) registerUsedKeys(ca.actionRecord?.usedKeys);
        }
      });
    }
    buttons.forEach((btn) => {
      for (const ba of btn.actions) {
        registerUsedKeys(ba.actionRecord?.usedKeys);
        if (ba.keyCode && ba.keyCode > 0) {
          const btnKeyToFlash: Record<number, number> = {
            1: 37, 2: 39, 3: 36, 4: 35, 5: 45, 6: 46,
            8: 8, 13: 13, 14: 38, 15: 40, 16: 33, 17: 34, 18: 9, 19: 27,
          };
          const fk = btnKeyToFlash[ba.keyCode] || ba.keyCode;
          const spec = mapFlashKeyCode(fk);
          if (spec) registerUsedKeys([spec]);
        }
      }
    });

    // Educational quizzes & math input boxes (editable DefineEditText): auto-register Enter, Backspace & Tab
    // into declarative (:key-bindings ...) so keyboard quiz entry works seamlessly across host player bindings.
    let hasEditableText = false;
    editTexts.forEach((et) => {
      if (et.editable) hasEditableText = true;
    });
    if (hasEditableText) {
      for (const fk of [13, 8, 9]) {
        const spec = mapFlashKeyCode(fk);
        if (spec) registerUsedKeys([spec]);
      }
    }

    // For dynamic multi-frame SWFs, do NOT dump unplaced library shapes onto the stage (they cover active frames);
    // keep unplaced shapes only for static single-frame SWFs (Sims 1–11 compatibility), referencing cached <defs> symbols.
    const unplacedSvgElements = !isDynamicSwf
      ? [
          ...shapes
            .filter((s) => !usedCharIds.has(s.charId))
            .map((s) => (cachedShapeDefIds.has(s.charId) ? `<use href="#swf-shape-${s.charId}" />` : s.svg)),
          ...morphShapes.filter((m) => !usedCharIds.has(m.shapeId)).map((m) => m.svg),
        ]
      : [];

    const allSvgElements = [...placedSvgElements, ...unplacedSvgElements];
    let staticLayerInner = '';
    let dynamicLayerInner = '';
    if (!isDynamicSwf) {
      staticLayerInner = allSvgElements.join('\n      ');
    } else {
      dynamicLayerInner = allSvgElements.join('\n      ');
    }
    if (!staticLayerInner.trim() && !dynamicLayerInner.trim()) {
      staticLayerInner = `<!-- Imported SWF Visual Content -->
      <g id="swf-content" transform="translate(40, 40)">
        <rect id="swf-bg-card" width="${width - 80}" height="${height - 80}" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
        <text id="swf-title" x="${(width - 80) / 2}" y="80" text-anchor="middle" fill="#ffffff" font-size="20" font-family="system-ui" font-weight="bold">Imported Flash Asset: ${sceneId}</text>
        <circle id="swf-orbiter" cx="${(width - 80) / 2}" cy="${(height - 80) / 2 + 30}" r="32" fill="#6366f1" />
        <text id="swf-caption" x="${(width - 80) / 2}" y="${height - 120}" text-anchor="middle" fill="#94a3b8" font-size="13">Converted from legacy ${sig} v${version} &bull; ${frameCount} Frames &bull; ${(frameRate).toFixed(0)} FPS</text>
      </g>`;
    }

    const shapeDefsXml = shapeDefsEntries.length > 0 ? `\n${shapeDefsEntries.join('\n')}` : '';
    const maskDefsXml = maskClipDefs.length > 0 ? `\n${maskClipDefs.join('\n')}` : '';
    const staticLayerXml = staticLayerInner.trim()
      ? `<g id="stage-static-layer" data-static="true">\n      ${staticLayerInner}\n    </g>`
      : `<g id="stage-static-layer" data-static="true" />`;
    const dynamicLayerXml = dynamicLayerInner.trim()
      ? `<g id="stage-dynamic-layer">\n      ${dynamicLayerInner}\n    </g>`
      : `<g id="stage-dynamic-layer" />`;
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <clipPath id="swf-stage-clip">
      <rect x="0" y="0" width="${width}" height="${height}" />
    </clipPath>${shapeDefsXml}${maskDefsXml}
  </defs>
  <rect id="bg" width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="scene-root" clip-path="url(#swf-stage-clip)">
    ${staticLayerXml}
    ${dynamicLayerXml}
  </g>
</svg>`;

    const targetId = morphShapes[0]?.id || shapes[0]?.id || 'swf-orbiter';

    // Actors
    const actorTargets = [
      ...shapes.map((s) => `#${s.id}`),
      ...morphShapes.map((m) => `#${m.id}`),
    ];
    const actorsAst = actorTargets.length > 0
      ? actorTargets.slice(0, 8).map((t) => `    (:actor :target "${t}" :kinematic true :will-change true)`).join('\n')
      : `    (:actor :target "#${targetId}" :kinematic true :will-change true)`;

    // MorphShape & Vector Bindings
    const morphBindings: string[] = [];
    morphShapes.forEach((m) => {
      morphBindings.push(`    (:target "#${m.id}" :attr "d" :expr "astMorphPath('${m.startD}', '${m.endD}', t)")`);
      if (m.startFill !== m.endFill) {
        morphBindings.push(`    (:target "#${m.id}" :attr "fill" :expr "astMorphColor('${m.startFill}', '${m.endFill}', t)")`);
      }
    });

    const combinedBindings = [...morphBindings, ...dynamicBindings];
    let bindingsAst = '';
    if (combinedBindings.length > 0) {
      bindingsAst = `  (:bindings (\n${combinedBindings.join('\n')}\n  ))`;
    } else {
      bindingsAst = `  (:bindings (\n    (:target "#${targetId}" :attr "transform" :expr "'translate(' + (Math.sin(t * Math.PI * 2) * 40) + ', 0)'")\n  ))`;
    }

    const rulesAst = dynamicRules.length > 0
      ? `\n  (:rules (\n${dynamicRules.join('\n')}\n  ))\n`
      : '';

    const keyBindingsAst = allUsedKeys.size > 0
      ? `\n  (:key-bindings (\n${Array.from(allUsedKeys.values())
          .map((spec) => `    (:bind :code "${spec.domCode}" :key "${domKeyFromDomCode(spec.domCode)}" :flash-key ${spec.keyCode} :var "${spec.varName}")`)
          .join('\n')}\n  ))\n`
      : '';

    const gesturesAst = dynamicGestures.length > 0
      ? `\n  (:gestures (\n${dynamicGestures.join('\n')}\n  ))\n`
      : '';

    // Merge variables from legacy actionBlocks + reactiveVars
    const varMap = new Map<string, { val: any; min?: number; max?: number }>();
    reactiveVars.forEach((meta, name) => varMap.set(name, meta));
    actionBlocks.forEach((ab) => {
      (ab.setVariables || []).forEach((v) => {
        if (!varMap.has(v.name)) varMap.set(v.name, { val: v.value, min: 0, max: 100 });
      });
    });

    let varsAst = '';
    if (varMap.size > 0) {
      const varLines: string[] = [];
      varMap.forEach((meta, name) => {
        const val = meta.val;
        const isNum = typeof val === 'number';
        const boundsStr = isNum && meta.min !== undefined && meta.max !== undefined
          ? `:min ${meta.min} :max ${meta.max}`
          : (isNum ? ':min -10000 :max 10000' : '');
        varLines.push(`    (:var :name "${name}" :val ${isNum ? val : `"${val}"`} ${boundsStr})`);
      });
      varsAst = `\n  (:vars (\n${varLines.join('\n')}\n  ))\n`;
    }

    // :Sim-first design: never clutter interactive simulations with a raw Flash frame scrubber slider
    const inputsAst = '';

    // Synthesize Declarative State Machine from ActionScript and Frame Labels
    let stateMachinesAst = '';
    let smMeta: any = undefined;

    const stateList: { name: string; title: string; frame: number }[] = [];
    if (labels.length >= 2) {
      labels.forEach((l) => {
        stateList.push({
          name: l.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
          title: l.name,
          frame: l.frame,
        });
      });
    } else if (actionBlocks.some((a) => a.stops || (a.gotoLabels && a.gotoLabels.length > 0) || (a.gotoFrames && a.gotoFrames.length > 0))) {
      stateList.push({ name: 'intro', title: 'Intro Phase', frame: 1 });
      actionBlocks.forEach((ab) => {
        if (ab.stops || (ab.gotoLabels && ab.gotoLabels.length > 0)) {
          stateList.push({ name: `stage_${ab.frame}`, title: `Stage at Frame ${ab.frame}`, frame: ab.frame });
        }
      });
      stateList.push({ name: 'conclusion', title: 'Conclusion Phase', frame: frameCount || currentFrame });
    }

    if (stateList.length >= 2 && actionBlocks.length > 0) {
      const initialState = stateList[0].name;
      const statesAst = stateList.map((st) => `        (:state :name "${st.name}" (:attr :target "#swf-title" :attr "textContent" :val "${st.title}"))`).join('\n');

      const transitionsAstLines: string[] = [];
      for (let i = 0; i < stateList.length - 1; i++) {
        const fromSt = stateList[i];
        const toSt = stateList[i + 1];
        let trigger = 'true';
        for (const ab of actionBlocks) {
          if (ab.frame === fromSt.frame && ab.branches && ab.branches.length > 0) {
            trigger = ab.branches[0].condition;
            break;
          }
        }
        transitionsAstLines.push(`        (:transition :from "${fromSt.name}" :to "${toSt.name}" :trigger "${trigger}" :duration 0.4 :dwell 0.25)`);
      }
      transitionsAstLines.push(`        (:transition :from "${stateList[stateList.length - 1].name}" :to "${stateList[0].name}" :trigger "true" :duration 0.4 :dwell 0.25)`);

      stateMachinesAst = `\n  (:state-machines (\n    (:state-machine :id "swf-state-machine" :initial "${initialState}" :dwell 0.25\n      (:states (\n${statesAst}\n      ))\n      (:transitions (\n${transitionsAstLines.join('\n')}\n      ))\n    )\n  ))\n`;

      smMeta = [{
        id: 'swf-state-machine',
        initial: initialState,
        states: stateList.map((s) => s.name),
        transitionsCount: transitionsAstLines.length,
      }];
    }

    const keyframesAst = labels.length > 0
      ? labels.map((l) => {
          const t = Math.min(1.0, Number(((l.frame - 1) / Math.max(1, totalFrames)).toFixed(2)));
          return `    (:t ${t} :title "${l.name}" :rule "Keyframe step at frame ${l.frame}")`;
        }).join('\n')
      : `    (:t 0.0 :title "Intro" :rule "SWF Timeline Inception")
    (:t 0.5 :title "Midpoint" :rule "Active Simulation Phase")
    (:t 1.0 :title "Conclusion" :rule "Loop Reset")`;

    const controlsAst = `\n  (:controls (:param-hud :off) (:arrow-step :off) (:num-jump :off) (:space-play :off) (:scrub :off))\n`;

    const hasAvm1Bytecode =
      actionBlocks.some((a) => Boolean(a.rawBytecodeB64)) ||
      initActions.length > 0 ||
      Array.from(sprites.values()).some((sp) => sp.actions.some((a) => Boolean(a.rawBytecodeB64))) ||
      Array.from(buttons.values()).some((b) => b.actions.some((a) => Boolean(a.actionRecord?.rawBytecodeB64))) ||
      timelineFrames.some((tf) =>
        Array.from(tf.entries.values()).some((e) =>
          Boolean(e.clipActions?.some((ca) => Boolean(ca.actionRecord?.rawBytecodeB64)))
        )
      );
    const isActionScript3 = Boolean(isAs3Flag || (hasDoAbcTag && !hasAvm1Bytecode));

    // Compact AVM1 Micro-VM Program Payload (Option 2: lazy-loaded pure-SVG AVM1 runtime)
    let swfVmAst = '';
    const hasAvm1Content =
      isDynamicSwf ||
      hasAvm1Bytecode ||
      isActionScript3 ||
      abcBlocks.length > 0 ||
      sprites.size > 0 ||
      buttons.size > 0 ||
      editTexts.size > 0 ||
      Object.keys(exportsMap).length > 0 ||
      timelineFrames.length > 1;

    if (hasAvm1Content) {
      const compactMat = (m?: SwfMatrix | null): number[] | undefined => {
        if (!m) return undefined;
        const arr = [
          Number(formatNum(m.scaleX)),
          Number(formatNum(m.rotateSkew0)),
          Number(formatNum(m.rotateSkew1)),
          Number(formatNum(m.scaleY)),
          Number(formatNum(m.transX)),
          Number(formatNum(m.transY)),
        ];
        if (arr[0] === 1 && arr[1] === 0 && arr[2] === 0 && arr[3] === 1 && arr[4] === 0 && arr[5] === 0) {
          return undefined;
        }
        return arr;
      };

      // Deduplicated AVM1 bytecode pool (eliminates repeating multi-KB ActionScript blocks across frames/clips)
      const vmBytecodePool: string[] = [];
      const vmBytecodeIndex = new Map<string, number>();
      const internBytecode = (b64: string): number => {
        const hit = vmBytecodeIndex.get(b64);
        if (hit !== undefined) return hit;
        const idx = vmBytecodePool.length;
        vmBytecodePool.push(b64);
        vmBytecodeIndex.set(b64, idx);
        return idx;
      };

      // Deduplicated ClipActions table (prevents duplicating clipActions on every frame a clip remains on stage)
      const vmClipActionTable: any[][] = [];
      const vmClipActionIndex = new Map<string, number>();
      const internClipActions = (clipActions: SwfClipAction[]): number | undefined => {
        const cas: any[] = [];
        for (let i = 0; i < clipActions.length; i++) {
          const ca = clipActions[i];
          if (ca.actionRecord && ca.actionRecord.rawBytecodeB64) {
            const o: any = { f: ca.eventFlags || 0, bi: internBytecode(ca.actionRecord.rawBytecodeB64) };
            if (ca.keyCode !== undefined) o.k = ca.keyCode;
            cas.push(o);
          }
        }
        if (cas.length === 0) return undefined;
        const key = JSON.stringify(cas);
        const hit = vmClipActionIndex.get(key);
        if (hit !== undefined) return hit;
        const idx = vmClipActionTable.length;
        vmClipActionTable.push(cas);
        vmClipActionIndex.set(key, idx);
        return idx;
      };

      const serializeFrameList = (frameSnaps: SwfFrameSnapshot[], count: number) => {
        const snapByFrame = new Map<number, SwfFrameSnapshot>();
        let maxSnapFrame = 1;
        for (let si = 0; si < frameSnaps.length; si++) {
          const s = frameSnaps[si];
          snapByFrame.set(s.frame, s);
          if (s.frame > maxSnapFrame) maxSnapFrame = s.frame;
        }
        const fallbackSnap = frameSnaps[frameSnaps.length - 1];
        const limit = Math.min(Math.max(1, count), Math.max(1, maxSnapFrame), 2400);
        const out: any[] = [];
        let prevJson = '';
        let prevEntriesMap: Map<number, SwfDisplayEntry> | null = null;
        for (let f = 1; f <= limit; f++) {
          const snap = snapByFrame.get(f) || fallbackSnap;
          if (!snap) {
            if (f > 1 && prevJson === '[]') {
              out.push('=');
            } else {
              prevJson = '[]';
              prevEntriesMap = null;
              out.push([]);
            }
            continue;
          }
          if (f > 1 && prevEntriesMap !== null && snap.entries === prevEntriesMap) {
            // Instant O(1) hold-frame dedup (same Map reference -> zero serialization cost!)
            out.push('=');
            continue;
          }
          const entries: any[] = [];
          const sortedDepths = Array.from(snap.entries.keys()).sort((a, b) => a - b);
          for (const d of sortedDepths) {
            const e = snap.entries.get(d)!;
            const item: any = { d, c: e.characterId };
            const cm = compactMat(e.matrix);
            if (cm) item.m = cm;
            if (e.cxform) {
              if (Math.abs(e.cxform.alpha - 1) > 0.001) {
                item.a = Number(formatNum(e.cxform.alpha));
              }
              const hasRgbTransform =
                e.cxform.rMult !== 256 ||
                e.cxform.gMult !== 256 ||
                e.cxform.bMult !== 256 ||
                e.cxform.rAdd !== 0 ||
                e.cxform.gAdd !== 0 ||
                e.cxform.bAdd !== 0;
              if (hasRgbTransform) {
                item.cx = [
                  e.cxform.rMult,
                  e.cxform.gMult,
                  e.cxform.bMult,
                  e.cxform.aMult,
                  e.cxform.rAdd,
                  e.cxform.gAdd,
                  e.cxform.bAdd,
                  e.cxform.aAdd,
                ];
              }
            }
            if (e.filters && e.filters.length > 0) item.fl = e.filters;
            if (e.blendMode && e.blendMode > 1) item.bm = e.blendMode;
            if (e.visible === false) item.vis = 0;
            if (e.name) item.n = e.name;
            if (e.clipDepth && e.clipDepth > d) item.cd = e.clipDepth;
            if (e.ratio !== undefined && e.ratio > 0) item.r = e.ratio;
            if (e.clipActions && e.clipActions.length > 0) {
              const ci = internClipActions(e.clipActions);
              if (ci !== undefined) item.ci = ci;
            }
            entries.push(item);
          }
          prevEntriesMap = snap.entries;
          const frameJson = JSON.stringify(entries);
          if (f > 1 && frameJson === prevJson) {
            // Identical hold frame marker -> decoded to direct shared array reference in AVM1MovieClip
            out.push('=');
          } else {
            prevJson = frameJson;
            out.push(entries);
          }
        }
        return out;
      };

      const vmShapes: Record<number, { p?: SwfShapePrimitive[]; svg?: string; bb: number[] }> = {};
      for (const s of shapes) {
        if (!editTexts.has(s.charId)) {
          const bb = [
            Number(formatNum(s.bbox.x)),
            Number(formatNum(s.bbox.y)),
            Number(formatNum(s.bbox.w)),
            Number(formatNum(s.bbox.h)),
          ];
          if (s.primitives) {
            vmShapes[s.charId] = { p: s.primitives, bb };
          } else {
            vmShapes[s.charId] = { svg: s.svg, bb };
          }
        }
      }
      const vmMorphs: Record<number, any> = {};
      for (const m of morphShapes) {
        vmMorphs[m.shapeId] = {
          s: m.startD,
          e: m.endD,
          sf: m.startFill,
          ef: m.endFill,
          st: m.stroke,
          sw: m.strokeWidth,
          bb: [
            Number(formatNum(m.bbox.x)),
            Number(formatNum(m.bbox.y)),
            Number(formatNum(m.bbox.w)),
            Number(formatNum(m.bbox.h)),
          ],
        };
      }
      const vmEditTexts: Record<number, any> = {};
      editTexts.forEach((et, cid) => {
        const o: any = {
          x: et.x,
          y: et.y,
          w: et.w,
          h: et.h,
          fs: et.fontSize,
          col: et.color,
          al: et.align,
          v: et.varName,
          t: et.text,
          html: et.isHtml ? 1 : 0,
        };
        if (et.editable) o.ed = 1;
        if (et.password) o.pw = 1;
        if (et.multiline) o.ml = 1;
        if (et.border) o.bd = 1;
        if (et.maxLength) o.mx = et.maxLength;
        vmEditTexts[cid] = o;
      });
      const vmButtons: Record<number, any> = {};
      buttons.forEach((btn, bid) => {
        vmButtons[bid] = {
          r: btn.records.map((rec) => {
            const o: any = { s: rec.states, c: rec.characterId, d: rec.depth };
            const cm = compactMat(rec.matrix);
            if (cm) o.m = cm;
            if (rec.cxform && Math.abs(rec.cxform.alpha - 1) > 0.001) o.a = Number(formatNum(rec.cxform.alpha));
            return o;
          }),
          a: btn.actions
            .filter((a) => a.actionRecord && a.actionRecord.rawBytecodeB64)
            .map((a) => ({ f: a.conditionFlags, k: a.keyCode || 0, bi: internBytecode(a.actionRecord.rawBytecodeB64!) })),
        };
      });
      const vmSprites: Record<number, any> = {};
      sprites.forEach((sp, sid) => {
        const spObj: any = {
          fc: sp.frameCount,
          l: sp.labels,
          fr: serializeFrameList(sp.frames, sp.frameCount),
          ac: sp.actions
            .filter((a) => Boolean(a.rawBytecodeB64))
            .map((a) => ({ f: a.frame, bi: internBytecode(a.rawBytecodeB64!) })),
        };
        if (sp.sounds && sp.sounds.length > 0) spObj.sf = sp.sounds;
        vmSprites[sid] = spObj;
      });

      const vmInitActions = initActions.map((ia) => ({
        c: ia.c,
        bi: internBytecode(ia.b64),
      }));

      const vmMainActions = actionBlocks
        .filter((a) => Boolean(a.rawBytecodeB64))
        .map((a) => ({ f: a.frame, bi: internBytecode(a.rawBytecodeB64!) }));

      const vmProgram: Record<string, any> = {
        v: 2,
        swfVer: version,
        w: width,
        h: height,
        fps: nativeFps,
        bg: backgroundColor,
        fl: effectiveFileLength,
        fc: totalFrames,
        ef: entryFrame,
        ps: strippedPreloaderFrames > 0 ? 1 : 0,
        as3: isActionScript3 ? 1 : 0,
        exp: exportsMap,
        l: labels,
        bc: vmBytecodePool,
        cat: vmClipActionTable,
        sh: vmShapes,
        mo: vmMorphs,
        et: vmEditTexts,
        bt: vmButtons,
        sp: vmSprites,
        ia: vmInitActions,
        fr: serializeFrameList(timelineFrames, totalFrames),
        ac: vmMainActions,
      };
      if (sounds.size > 0) {
        const vmSounds: Record<number, SwfSoundDef> = {};
        sounds.forEach((s, id) => { vmSounds[id] = s; });
        vmProgram.sn = vmSounds;
      }
      if (startSounds.length > 0) vmProgram.sf = startSounds;
      if (bitmaps.size > 0) {
        const vmBitmaps: Record<number, { w?: number; h?: number; u: string }> = {};
        bitmaps.forEach((b, id) => { vmBitmaps[id] = { w: b.w, h: b.h, u: b.uri }; });
        vmProgram.bm = vmBitmaps;
      }
      if (fillDefsCollector.gradients.length > 0) vmProgram.gr = fillDefsCollector.gradients;
      if (fillDefsCollector.patterns.length > 0) vmProgram.bp = fillDefsCollector.patterns;
      const skippedTagIdsList = Array.from(skippedTagIdSet).sort((a, b) => a - b);
      vmProgram.dbg = {
        tt: totalTagsParsed,
        ds: cachedShapeDefIds.size,
        sk: skippedTagIdsList,
      };
      if (allUsedKeys.size > 0) {
        vmProgram.kb = Array.from(allUsedKeys.values()).map((spec) => ({
          code: spec.domCode,
          key: domKeyFromDomCode(spec.domCode),
          fk: spec.keyCode,
          v: spec.varName,
        }));
      }
      if (documentClass) vmProgram.dc = documentClass;
      if (Object.keys(symbolClassMap).length > 0) vmProgram.sym = symbolClassMap;
      if (abcBlocks.length > 0) vmProgram.abc = abcBlocks;
      if (abcTraits.length > 0) vmProgram.traits = abcTraits;
      const vmB64 = utf8ToBase64(JSON.stringify(vmProgram));
      swfVmAst = `\n  (:swf-vm "${vmB64}")\n`;
    }

    const astSource = `(:scene
  :id "${sceneId}"
  :type "Sim"
  :title "Imported Flash (${sceneId})"
  :subject "Transpiled Legacy SWF"
  :duration ${duration}
  :fps ${Math.round(frameRate) || 24}
  :stageWidth ${width}
  :stageHeight ${height}
${controlsAst}${swfVmAst}${varsAst}${inputsAst}
  (:static (
    (:element :target "#bg" :cache true)
    (:element :target "#swf-bg-card" :cache true)
    (:element :target "#swf-title" :cache true)
    (:element :target "#swf-caption" :cache true)
  ))

  (:actors (
${actorsAst}
  ))
${stateMachinesAst}
${bindingsAst}
${rulesAst}${keyBindingsAst}${gesturesAst}
  :keyframes (
${keyframesAst}
  )

  :interactive (
    (:checkpoints (
      (:id "chk-swf-1" :t 0.50 :type "multiple-choice" :question "What principle is demonstrated in this legacy Flash animation?"
        :options ("Conservation of Energy" "Kinetic Motion" "Vector Quantities" "Gravitational Force") :correct 1
        :hint "Observe the animated position over normalized time t.")
    ))
  )
)`;

    const skippedTagIds = Array.from(skippedTagIdSet).sort((a, b) => a - b);

    // Deterministic SWF Spectrum Centrifuge: separate Signal, Suspect/Approximable, and Sludge
    const extDepSet = new Set<string>();
    const sponsorSet = new Set<string>();
    const EXT_DEP_PATTERNS: Array<{ re: RegExp; label: string }> = [
      { re: /\bloadMovie(?:Num)?\b/i, label: 'loadMovie' },
      { re: /\bURLLoader\b|\bLoader\b/i, label: 'Loader/URLLoader' },
      { re: /\bExternalInterface\b/i, label: 'ExternalInterface' },
      { re: /\bnavigateToURL\b|\bgetURL\b/i, label: 'getURL/navigateToURL' },
      { re: /\bXMLSocket\b|\bNetConnection\b/i, label: 'NetworkSocket' },
    ];
    const SPONSOR_PATTERNS: Array<{ re: RegExp; label: string }> = [
      { re: /\bmochi(?:ads|bot|services)?\b/i, label: 'mochi' },
      { re: /\barmor\s*games\b/i, label: 'armor-games' },
      { re: /\bkongregate\b/i, label: 'kongregate' },
      { re: /\bnewgrounds\b/i, label: 'newgrounds' },
      { re: /\bminiclip\b/i, label: 'miniclip' },
      { re: /\bmore\s+games\b|\bsponsor(?:ed)?\b/i, label: 'sponsor-chrome' },
    ];
    const inspectCorpus: string[] = [];
    if (documentClass) inspectCorpus.push(documentClass);
    for (const lbl of labels) inspectCorpus.push(lbl.name);
    for (const tr of abcTraits) inspectCorpus.push(tr.name);
    for (const expName of Object.keys(exportsMap)) inspectCorpus.push(expName);
    for (const symName of Object.values(symbolClassMap)) inspectCorpus.push(symName);
    for (const ed of editTexts.values()) {
      if (ed.text) inspectCorpus.push(ed.text);
      if (ed.varName) inspectCorpus.push(ed.varName);
    }
    for (const ab of actionBlocks) {
      if (ab.gotoLabels) {
        for (const gl of ab.gotoLabels) inspectCorpus.push(gl);
      }
      if (ab.setVariables) {
        for (const sv of ab.setVariables.slice(0, 64)) {
          if (sv.name) inspectCorpus.push(sv.name);
          if (typeof sv.value === 'string') inspectCorpus.push(sv.value);
        }
      }
      if (ab.referencedProps) {
        for (const prop of ab.referencedProps) inspectCorpus.push(prop);
      }
    }
    for (const sample of inspectCorpus) {
      for (const pat of EXT_DEP_PATTERNS) {
        if (pat.re.test(sample)) extDepSet.add(pat.label);
      }
      for (const pat of SPONSOR_PATTERNS) {
        if (pat.re.test(sample)) sponsorSet.add(pat.label);
      }
    }

    const externalDependencyHits = Array.from(extDepSet);
    const sponsorSignalHits = Array.from(sponsorSet);
    const signalReasons: string[] = [];
    const suspectReasons: string[] = [];
    const sludgeReasons: string[] = [];

    const drawableAssetCount = shapes.length + sprites.size + buttons.size + editTexts.size + morphShapes.length;
    const totalActionCount =
      actionBlocks.length +
      Array.from(sprites.values()).reduce((a, sp) => a + (sp.actions ? sp.actions.length : 0), 0) +
      Array.from(buttons.values()).reduce((a, b) => a + (b.actions ? b.actions.length : 0), 0);
    const totalBucketErrors = bucketErrors.config + bucketErrors.assets + bucketErrors.code + bucketErrors.display;

    if (drawableAssetCount > 0) signalReasons.push(`${drawableAssetCount} vector/display definitions extracted`);
    if (buttons.size > 0 || allUsedKeys.size > 0) {
      signalReasons.push(`interactive triggers (${buttons.size} buttons, ${allUsedKeys.size} keys)`);
    }
    if (dynamicRules.length > 0 || (Array.isArray(smMeta) && smMeta.length > 0) || totalActionCount > 0) {
      signalReasons.push(`behavioral core (${totalActionCount} action blocks, ${dynamicRules.length} rules)`);
    }
    if (labels.length > 0) signalReasons.push(`${labels.length} frame labels`);

    if (binaryDataTagCount > 0) {
      suspectReasons.push(`Tag 87 DefineBinaryData (${binaryDataTagCount} payload(s), ${binaryDataBytes} B) not expanded`);
    }
    const partialMediaTags = skippedTagIds.filter((id) => id === 6 || id === 88 || id === 90);
    if (partialMediaTags.length > 0) {
      suspectReasons.push(`partially unsupported media/font tag(s): ${partialMediaTags.join(', ')}`);
    }
    if (totalBucketErrors > 0) {
      suspectReasons.push(`${totalBucketErrors} tag decode error(s) recovered safely`);
    }
    if (externalDependencyHits.length > 0) {
      suspectReasons.push(`external dependency hooks detected: ${externalDependencyHits.join(', ')}`);
    }
    if (sponsorSignalHits.length > 0) {
      suspectReasons.push(`sponsor/portal branding markers: ${sponsorSignalHits.join(', ')}`);
    }

    if (drawableAssetCount === 0) {
      sludgeReasons.push('zero surviving displayable assets after Frame 1 commit');
    }
    const isLoaderOnlyStub =
      externalDependencyHits.some((h) => h === 'loadMovie' || h === 'Loader/URLLoader' || h === 'NetworkSocket') &&
      shapes.length <= 2 &&
      sprites.size === 0 &&
      buttons.size === 0 &&
      dynamicRules.length === 0;
    if (isLoaderOnlyStub) {
      sludgeReasons.push('external loader stub without self-contained interactive core');
    }
    const isSponsorShellOnly =
      sponsorSignalHits.length > 0 &&
      totalFrames <= 2 &&
      sprites.size === 0 &&
      dynamicRules.length === 0 &&
      varMap.size === 0;
    if (isSponsorShellOnly) {
      sludgeReasons.push('sponsor/preloader shell without substantive multi-state content');
    }

    const centrifugeVerdict: SwfCentrifugeVerdict =
      sludgeReasons.length > 0
        ? 'reject-low-value'
        : suspectReasons.length > 0
        ? 'suspect'
        : 'signal';

    const centrifuge: SwfCentrifugeReport = {
      verdict: centrifugeVerdict,
      signalReasons,
      suspectReasons,
      sludgeReasons,
      bucketErrors,
      binaryDataTagCount,
      binaryDataBytes,
      externalDependencyHits,
      sponsorSignalHits,
      scriptLimits,
      hasXmlMetadata,
    };

    const importDebugSummary = {
      totalTagsParsed,
      cachedDefsShapes: cachedShapeDefIds.size,
      skippedTagIds,
      bucketErrors,
      centrifugeVerdict,
    };

    // Update opt-in global diagnostic import summary without adding per-frame overhead
    try {
      const g: any = typeof window !== 'undefined' ? window : globalThis;
      if (typeof g.__SWF_DEBUG__ === 'undefined') g.__SWF_DEBUG__ = false;
      if (!g.__SWF_DEBUG_STATE__) {
        g.__SWF_DEBUG_STATE__ = { importSummary: importDebugSummary, activeRuntime: null };
      } else {
        g.__SWF_DEBUG_STATE__.importSummary = importDebugSummary;
      }
      if (typeof g.__getSwfDebugReport !== 'function') {
        g.__getSwfDebugReport = () => {
          const st = g.__SWF_DEBUG_STATE__;
          if (st?.activeRuntime && typeof st.activeRuntime.getDebugReport === 'function') {
            return st.activeRuntime.getDebugReport();
          }
          const imp = st?.importSummary || { totalTagsParsed: 0, cachedDefsShapes: 0, skippedTagIds: [] };
          return {
            enabled: g.__SWF_DEBUG__ === true,
            importSummary: {
              totalTagsParsed: imp.totalTagsParsed || 0,
              cachedDefsShapes: imp.cachedDefsShapes || 0,
              skippedTagIds: Array.isArray(imp.skippedTagIds) ? imp.skippedTagIds.slice() : [],
              bucketErrors: imp.bucketErrors || { config: 0, assets: 0, code: 0, display: 0 },
              centrifugeVerdict: imp.centrifugeVerdict || 'signal',
            },
            avm1Faults: { unhandledOpcodes: [], nanProperties: [] },
            frameTiming: { sampleCount: 0, avgAvm1ExecMs: 0, avgSvgRenderMs: 0, activeDynamicDomNodes: 0 },
          };
        };
      }
    } catch {}

    const totalPoolSlots = poolSlotsCreated.reduce((acc, p) => acc + p.count, 0);
    const metadata: SwfMetadata = {
      signature: sig as any,
      version,
      fileLength,
      width,
      height,
      frameRate,
      frameCount: totalFrames,
      backgroundColor,
      shapeCount: shapes.length,
      morphShapeCount: morphShapes.length,
      fontCount: vectorFonts.size,
      staticTextCount,
      spriteCount: sprites.size,
      buttonCount: buttons.size,
      actionCount: totalActionCount,
      ruleCount: dynamicRules.length,
      keyBindingCount: allUsedKeys.size,
      poolSlotCount: totalPoolSlots,
      strippedPreloaderFrames,
      entryFrame,
      isActionScript3,
      hasAvm1Bytecode,
      abcCount: abcBlocks.length,
      documentClass: documentClass || undefined,
      as3Classes: abcTraits.length > 0 ? abcTraits.map((t) => t.name) : undefined,
      traitCount: abcTraits.reduce((acc, t) => acc + t.slots.length + t.methods.length, 0),
      executionModel,
      labels,
      stateMachines: smMeta,
      variables: Array.from(varMap.entries()).map(([k, v]) => ({ name: k, value: v.val })),
      centrifuge,
      importDebugSummary,
    };

    return {
      success: true,
      metadata,
      svgMarkup,
      astSource,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `SWF parsing exception: ${err?.message || String(err)}`,
      svgMarkup: '',
      astSource: '',
    };
  }
}

// =========================================================================
// STAGE 1: FAST SWF HEADER & TAG CENSUS SCANNER (IndexedDB Pre-Flight Index)
// =========================================================================

export interface SwfHeaderScanResult {
  success: boolean;
  error?: string;
  record?: SwfHeaderIndexRecord;
}

export interface SwfIndexedTranspileResult {
  headerScan: SwfHeaderScanResult;
  headerRecord?: SwfHeaderIndexRecord;
  transpileResult?: SwfTranspileResult;
}

const SWF_TAG_BUCKET_CONFIG = new Set([9, 24, 41, 43, 58, 63, 64, 65, 66, 69, 77, 86]);
const SWF_TAG_BUCKET_ASSETS = new Set([
  2, 6, 7, 8, 10, 11, 13, 14, 17, 18, 19, 20, 21, 22, 23, 32, 33, 34, 35, 36, 37, 39, 45, 46, 48,
  60, 61, 73, 74, 75, 78, 83, 84, 87, 88, 90, 91,
]);
const SWF_TAG_BUCKET_CODE = new Set([12, 56, 57, 59, 71, 72, 76, 82]);
const SWF_TAG_BUCKET_DISPLAY = new Set([1, 4, 5, 15, 26, 28, 70, 89]);
const SWF_TAG_UNSUPPORTED_NATIVE = new Set([6, 17, 57, 60, 61, 71, 78, 87, 88, 89, 90, 91]);

function computeFastSwfContentHash(bytes: Uint8Array): string {
  // Two-lane 32-bit FNV-1a fingerprint (deterministic, 0 crypto overhead, < 1 ms on 2 MB files)
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b1;
  const step = bytes.length > 65536 ? Math.max(1, Math.floor(bytes.length / 16384)) : 1;
  for (let i = 0; i < bytes.length; i += step) {
    const b = bytes[i];
    h1 ^= b;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= b ^ (i & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return `${bytes.length.toString(16)}-${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

/**
 * Stage 1 Fast Pre-Flight Scanner:
 * Reads the SWF header (FWS/CWS/ZWS), stage bounds, FileAttributes (Tag 69), ScriptLimits (Tag 65),
 * SymbolClass (Tag 76), ExportAssets (Tag 56), and walks all tag headers into a structured Bucket A–D
 * census WITHOUT generating SVG DOM or lifting bytecode.
 *
 * Ideal for triaging newer/complex SWFs (v9–v40+, ZWS, AS3/DoABC2, DefineBinaryData, Stage3D/GPU, Video)
 * and cataloging them in IndexedDB before running full AST transpilation or distillation.
 */
export async function inspectSwfHeaderAndCensus(
  fileData: ArrayBuffer | Uint8Array,
  id = 'imported-swf',
  fileName?: string
): Promise<SwfHeaderScanResult> {
  try {
    const rawBytes = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData);
    if (rawBytes.length < 8) {
      return { success: false, error: 'File is too short to be a valid SWF binary (min 8 bytes required).' };
    }
    const sig = String.fromCharCode(rawBytes[0], rawBytes[1], rawBytes[2]);
    if (sig !== 'FWS' && sig !== 'CWS' && sig !== 'ZWS') {
      return {
        success: false,
        error: `Unsupported SWF signature: "${sig}". Only FWS, CWS (zlib), or ZWS (LZMA) headers are supported.`,
      };
    }

    const swfVersion = rawBytes[3];
    const fileLength =
      (rawBytes[4] | (rawBytes[5] << 8) | (rawBytes[6] << 16) | (rawBytes[7] << 24)) >>> 0;

    let payload: Uint8Array;
    if (sig === 'CWS') {
      const decompressed = await decompressSwfPayload(rawBytes.slice(8));
      payload = new Uint8Array(8 + decompressed.length);
      payload.set(rawBytes.subarray(0, 8), 0);
      payload.set(decompressed, 8);
    } else if (sig === 'ZWS') {
      payload = decompressZwsSwf(rawBytes);
    } else {
      payload = rawBytes;
    }

    const reader = new BitReader(payload, 8);
    const frameRect = reader.readRect();
    const frameRate = reader.readUI16() / 256;
    const frameCount = reader.readUI16();
    const width = Math.max(1, Math.round(frameRect.width || (frameRect.xMax - frameRect.xMin))) || 550;
    const height = Math.max(1, Math.round(frameRect.height || (frameRect.yMax - frameRect.yMin))) || 400;

    let backgroundColor: string | undefined;
    let fileAttributes: SwfFileAttributesFlags | undefined;
    let scriptLimits: { maxRecursionDepth: number; scriptTimeoutSeconds: number } | undefined;
    let documentClass: string | undefined;
    let symbolClassCount = 0;
    let exportCount = 0;

    const tagHistogram: Record<number, number> = {};
    const unsupportedSet = new Set<number>();
    const tagCensus: SwfTagCensusSummary = {
      totalTags: 0,
      configTags: 0,
      assetTags: 0,
      codeTags: 0,
      displayTags: 0,
      unknownTags: 0,
      tagHistogram,
      unsupportedTagIds: [],
      binaryDataTagCount: 0,
      binaryDataBytes: 0,
      abcTagCount: 0,
      abcTotalBytes: 0,
      doActionTagCount: 0,
      shapeTagCount: 0,
      morphShapeTagCount: 0,
      spriteTagCount: 0,
      buttonTagCount: 0,
      textTagCount: 0,
      fontTagCount: 0,
      bitmapTagCount: 0,
      soundTagCount: 0,
      videoTagCount: 0,
    };

    while (reader.offset + 2 <= payload.length) {
      const tagCodeAndLength = reader.readUI16();
      const tagType = tagCodeAndLength >> 6;
      let tagLength = tagCodeAndLength & 0x3f;
      if (tagLength === 0x3f) {
        if (reader.offset + 4 > payload.length) break;
        tagLength = reader.readUI32();
      }
      const tagBodyStart = reader.offset;
      const nextTagOffset = Math.min(payload.length, tagBodyStart + tagLength);

      if (tagType === 0) break;

      tagCensus.totalTags++;
      tagHistogram[tagType] = (tagHistogram[tagType] || 0) + 1;

      if (SWF_TAG_BUCKET_CONFIG.has(tagType)) tagCensus.configTags++;
      else if (SWF_TAG_BUCKET_ASSETS.has(tagType)) tagCensus.assetTags++;
      else if (SWF_TAG_BUCKET_CODE.has(tagType)) tagCensus.codeTags++;
      else if (SWF_TAG_BUCKET_DISPLAY.has(tagType)) tagCensus.displayTags++;
      else {
        tagCensus.unknownTags++;
        unsupportedSet.add(tagType);
      }

      if (SWF_TAG_UNSUPPORTED_NATIVE.has(tagType)) {
        unsupportedSet.add(tagType);
      }

      if (tagType === 9 && tagBodyStart + 3 <= nextTagOffset) {
        backgroundColor = reader.readRGBA(false);
      } else if (tagType === 69 && tagBodyStart + 4 <= nextTagOffset) {
        const flags = reader.readUI32();
        fileAttributes = {
          useDirectBlit: (flags & 0x40) !== 0,
          useGpu: (flags & 0x20) !== 0,
          hasMetadata: (flags & 0x10) !== 0,
          actionScript3: (flags & 0x08) !== 0,
          useNetwork: (flags & 0x01) !== 0,
        };
      } else if (tagType === 65 && tagBodyStart + 4 <= nextTagOffset) {
        scriptLimits = {
          maxRecursionDepth: reader.readUI16(),
          scriptTimeoutSeconds: reader.readUI16(),
        };
      } else if (tagType === 76 && tagBodyStart + 2 <= nextTagOffset) {
        try {
          const count = reader.readUI16();
          symbolClassCount += count;
          for (let i = 0; i < count && reader.offset < nextTagOffset; i++) {
            const symCharId = reader.readUI16();
            const symName = reader.readString();
            if (symCharId === 0 && symName) documentClass = symName;
          }
        } catch {}
      } else if (tagType === 56 && tagBodyStart + 2 <= nextTagOffset) {
        try {
          exportCount += reader.readUI16();
        } catch {}
      } else if (tagType === 87) {
        tagCensus.binaryDataTagCount++;
        tagCensus.binaryDataBytes += Math.max(0, nextTagOffset - tagBodyStart - 6);
      } else if (tagType === 72 || tagType === 82) {
        tagCensus.abcTagCount++;
        tagCensus.abcTotalBytes += Math.max(0, nextTagOffset - tagBodyStart);
      } else if (tagType === 12 || tagType === 59) {
        tagCensus.doActionTagCount++;
      } else if (tagType === 2 || tagType === 22 || tagType === 32 || tagType === 83) {
        tagCensus.shapeTagCount++;
      } else if (tagType === 46 || tagType === 84) {
        tagCensus.morphShapeTagCount++;
      } else if (tagType === 39) {
        tagCensus.spriteTagCount++;
      } else if (tagType === 7 || tagType === 34) {
        tagCensus.buttonTagCount++;
      } else if (tagType === 11 || tagType === 33 || tagType === 37) {
        tagCensus.textTagCount++;
      } else if (tagType === 10 || tagType === 48 || tagType === 75 || tagType === 88 || tagType === 91) {
        tagCensus.fontTagCount++;
      } else if (tagType === 6 || tagType === 20 || tagType === 21 || tagType === 35 || tagType === 36 || tagType === 90) {
        tagCensus.bitmapTagCount++;
      } else if (tagType === 14 || tagType === 18 || tagType === 45) {
        tagCensus.soundTagCount++;
      } else if (tagType === 60 || tagType === 61) {
        tagCensus.videoTagCount++;
      }

      reader.offset = nextTagOffset;
    }

    tagCensus.unsupportedTagIds = Array.from(unsupportedSet).sort((a, b) => a - b);

    const hasAbc = tagCensus.abcTagCount > 0 || Boolean(fileAttributes?.actionScript3);
    const hasAvm1 = tagCensus.doActionTagCount > 0;
    const executionModel: SwfHeaderIndexRecord['executionModel'] =
      hasAbc && hasAvm1
        ? 'hybrid'
        : hasAbc
        ? 'avm2-abc'
        : hasAvm1
        ? 'avm1-bytecode'
        : 'static-vector';

    const drawableAssets =
      tagCensus.shapeTagCount +
      tagCensus.morphShapeTagCount +
      tagCensus.spriteTagCount +
      tagCensus.buttonTagCount +
      tagCensus.textTagCount +
      tagCensus.bitmapTagCount;

    const signalReasons: string[] = [];
    const suspectReasons: string[] = [];
    const sludgeReasons: string[] = [];

    if (drawableAssets > 0) {
      signalReasons.push(
        `${drawableAssets} drawable asset tag(s) (${tagCensus.shapeTagCount} shapes, ${tagCensus.spriteTagCount} sprites, ${tagCensus.buttonTagCount} buttons)`
      );
    }
    if (tagCensus.doActionTagCount > 0) {
      signalReasons.push(`AVM1 logic (${tagCensus.doActionTagCount} DoAction/DoInitAction tags)`);
    }
    if (tagCensus.abcTagCount > 0) {
      signalReasons.push(
        `AS3/AVM2 bytecode (${tagCensus.abcTagCount} DoABC tag(s), ${(tagCensus.abcTotalBytes / 1024).toFixed(1)} KB)`
      );
    }
    if (documentClass) {
      signalReasons.push(`Document Class: ${documentClass}`);
    }

    if (fileAttributes?.useGpu || fileAttributes?.useDirectBlit) {
      suspectReasons.push('FileAttributes requests GPU / DirectBlit (Stage3D/hardware compositing not supported in pure SVG)');
    }
    if (fileAttributes?.useNetwork) {
      suspectReasons.push('FileAttributes sets UseNetwork=1 (may expect live external endpoints)');
    }
    if (tagCensus.binaryDataTagCount > 0) {
      suspectReasons.push(
        `Tag 87 DefineBinaryData (${tagCensus.binaryDataTagCount} payload(s), ${tagCensus.binaryDataBytes} B)`
      );
    }
    if (tagCensus.videoTagCount > 0) {
      suspectReasons.push(`Embedded Flash Video tags (${tagCensus.videoTagCount} DefineVideoStream/VideoFrame)`);
    }
    if (tagCensus.tagHistogram[91]) {
      suspectReasons.push(`Tag 91 DefineFont4 (CFF/FTE text engine: ${tagCensus.tagHistogram[91]} font(s))`);
    }
    if (tagCensus.tagHistogram[57] || tagCensus.tagHistogram[71]) {
      suspectReasons.push('ImportAssets/ImportAssets2 references external SWF asset libraries');
    }
    if (tagCensus.unknownTags > 0) {
      suspectReasons.push(`${tagCensus.unknownTags} unrecognized/custom SWF tag(s)`);
    }

    if (drawableAssets === 0 && tagCensus.abcTagCount === 0 && tagCensus.doActionTagCount === 0) {
      sludgeReasons.push('zero drawable assets and zero executable bytecode in SWF header census');
    } else if (drawableAssets === 0 && tagCensus.videoTagCount === 0) {
      sludgeReasons.push('zero displayable vector/bitmap/text assets (loader stub or code-only SWL)');
    }

    const verdict: SwfHeaderIndexRecord['verdict'] =
      sludgeReasons.length > 0 ? 'reject-low-value' : suspectReasons.length > 0 ? 'suspect' : 'signal';

    const recommendedAction: SwfHeaderIndexRecord['recommendedAction'] =
      verdict === 'reject-low-value'
        ? 'reject-sludge'
        : verdict === 'suspect'
        ? 'inspect-suspect'
        : executionModel === 'static-vector'
        ? 'upgrade-native-ast'
        : 'run-live-vm';

    const now = Date.now();
    const record: SwfHeaderIndexRecord = {
      id,
      fileName: fileName || `${id}.swf`,
      contentHash: computeFastSwfContentHash(rawBytes),
      signature: sig as 'FWS' | 'CWS' | 'ZWS',
      swfVersion,
      compressedBytes: rawBytes.length,
      uncompressedBytes: Math.max(fileLength, payload.length),
      width,
      height,
      frameRate: Number(frameRate.toFixed(2)),
      frameCount,
      backgroundColor,
      fileAttributes,
      scriptLimits,
      documentClass,
      symbolClassCount,
      exportCount,
      executionModel,
      tagCensus,
      verdict,
      signalReasons,
      suspectReasons,
      sludgeReasons,
      externalDependencyHits: [],
      sponsorSignalHits: [],
      recommendedAction,
      parserSchemaVersion: SWF_PARSER_SCHEMA_VERSION,
      upgradeStatus: verdict === 'reject-low-value' ? 'rejected' : 'indexed',
      indexedAt: now,
      updatedAt: now,
    };

    return { success: true, record };
  } catch (err: any) {
    return {
      success: false,
      error: `SWF header scan failed: ${err?.message || String(err)}`,
    };
  }
}

/**
 * Two-Stage SWF Ingestion Pipeline:
 * Stage 1: Scans SWF header + Bucket A–D tag census and persists the compact SwfHeaderIndexRecord into IndexedDB.
 * Stage 2: Runs full SWF -> SVG + AST transpilation and reconciles deep centrifuge findings (external hooks,
 *          sponsor markers, bucket decode errors) back into the IndexedDB header ledger.
 */
export async function indexSwfHeaderAndTranspile(
  fileData: ArrayBuffer | Uint8Array,
  sceneId = 'imported-swf',
  fileName?: string
): Promise<SwfIndexedTranspileResult> {
  const headerScan = await inspectSwfHeaderAndCensus(fileData, sceneId, fileName);
  let headerRecord = headerScan.record;

  if (headerRecord) {
    await putSwfHeaderRecord(headerRecord);
  }

  const transpileResult = await transpileSwfToAst(fileData, sceneId);

  if (headerRecord && transpileResult.success && transpileResult.metadata?.centrifuge) {
    const deep = transpileResult.metadata.centrifuge;
    const mergedSignals = Array.from(new Set([...headerRecord.signalReasons, ...deep.signalReasons]));
    const mergedSuspects = Array.from(new Set([...headerRecord.suspectReasons, ...deep.suspectReasons]));
    const mergedSludge = Array.from(new Set([...headerRecord.sludgeReasons, ...deep.sludgeReasons]));
    const mergedVerdict: SwfHeaderIndexRecord['verdict'] =
      mergedSludge.length > 0 ? 'reject-low-value' : mergedSuspects.length > 0 ? 'suspect' : 'signal';

    headerRecord = {
      ...headerRecord,
      verdict: mergedVerdict,
      signalReasons: mergedSignals,
      suspectReasons: mergedSuspects,
      sludgeReasons: mergedSludge,
      externalDependencyHits: deep.externalDependencyHits,
      sponsorSignalHits: deep.sponsorSignalHits,
      recommendedAction:
        mergedVerdict === 'reject-low-value'
          ? 'reject-sludge'
          : mergedVerdict === 'suspect'
          ? 'inspect-suspect'
          : headerRecord.executionModel === 'static-vector'
          ? 'upgrade-native-ast'
          : 'run-live-vm',
      upgradeStatus: mergedVerdict === 'reject-low-value' ? 'rejected' : 'transpiled',
      vaultCartridgeId: sceneId,
      updatedAt: Date.now(),
    };
    await putSwfHeaderRecord(headerRecord);
  }

  return {
    headerScan,
    headerRecord,
    transpileResult,
  };
}

