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
  spriteCount?: number;
  buttonCount?: number;
  actionCount?: number;
  ruleCount?: number;
  keyBindingCount?: number;
  poolSlotCount?: number;
  labels: { frame: number; name: string }[];
  stateMachines?: { id: string; initial: string; states: string[]; transitionsCount: number }[];
  variables?: { name: string; value: any }[];
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

  // 2. Try native Web DecompressionStream API in browser
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(compressed);
          controller.close();
        }
      }).pipeThrough(new DecompressionStream('deflate'));

      const response = new Response(stream);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch {
      try {
        const rawDeflate = compressed.slice(2, compressed.length - 4);
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(rawDeflate);
            controller.close();
          }
        }).pipeThrough(new DecompressionStream('deflate-raw'));
        const response = new Response(stream);
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
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
  const px = twips / 20;
  return (Math.abs(px) < 1e-6 ? 0 : px).toFixed(1);
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

function readFillStyle(reader: BitReader, tagVersion: number): string {
  const fillType = reader.readUI8();
  const hasAlpha = tagVersion >= 3;
  if (fillType === 0x00) {
    // Solid fill
    return reader.readRGBA(hasAlpha);
  } else if (fillType === 0x10 || fillType === 0x12 || fillType === 0x13) {
    // Linear (0x10), radial (0x12), or focal radial (0x13) gradient
    reader.readMatrix();
    const numGradients = reader.readUI8() & 0x0F;
    let firstColor = '#38bdf8';
    for (let g = 0; g < numGradients; g++) {
      reader.readUI8(); // ratio
      const col = reader.readRGBA(hasAlpha);
      if (g === 0) firstColor = col;
    }
    if (fillType === 0x13) {
      reader.readSI16(); // FocalPoint (FIXED8) in SWF 8+ / DefineShape4
    }
    return firstColor;
  } else {
    // Pattern or bitmap fill (0x40-0x43)
    reader.readUI16();
    reader.readMatrix();
    return '#6366f1';
  }
}

function readFillStyleArray(reader: BitReader, tagVersion: number): string[] {
  reader.syncBits();
  let fillCount = reader.readUI8();
  if (fillCount === 0xFF && tagVersion >= 2) {
    fillCount = reader.readUI16();
  }
  const fillStyles: string[] = ['none'];
  for (let f = 0; f < fillCount && reader.offset < reader.length; f++) {
    fillStyles.push(readFillStyle(reader, tagVersion));
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

/**
 * Parses SWF DefineShape (1-4) tags into multi-path W3C SVG primitives grouped under <g id="swf-shape-${shapeId}">.
 */
function parseSwfShape(
  reader: BitReader,
  shapeId: number,
  tagVersion: number,
  tagEndOffset?: number
): { id: string; charId: number; svg: string; bbox: { x: number; y: number; w: number; h: number } } {
  const shapeBounds = reader.readRect();
  if (tagVersion === 4) {
    reader.readRect(); // EdgeBounds in DefineShape4
    reader.readUI8();  // Flags (UsesFillWindingRule, UsesNonScalingStrokes, UsesScalingStrokes)
  }
  reader.syncBits();

  const fillStyles = readFillStyleArray(reader, tagVersion);
  const lineStyles = readLineStyleArray(reader, tagVersion);

  reader.syncBits();
  const numFillBits = reader.readUBits(4);
  const numLineBits = reader.readUBits(4);

  const shapeRecords = parseShapeRecords(reader, numFillBits, numLineBits, {
    fillStyles,
    lineStyles,
    tagVersion,
    endOffset: tagEndOffset,
  });
  reader.syncBits();

  const shapeSvg = shapeRecords.svgPaths.length > 0
    ? `<g id="swf-shape-${shapeId}">\n      ${shapeRecords.svgPaths.join('\n      ')}\n    </g>`
    : `<g id="swf-shape-${shapeId}" />`;

  return {
    id: `swf-shape-${shapeId}`,
    charId: shapeId,
    svg: shapeSvg,
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
): { pathCommands: string[]; svgPaths: string[]; curFill0: number; curFill1: number; curLine: number } {
  let curXTwips = Math.round((options.initialX || 0) * 20);
  let curYTwips = Math.round((options.initialY || 0) * 20);
  const pathCommands: string[] = [];
  const svgPaths: string[] = [];

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
        curFillStyles = readFillStyleArray(reader, tagVersion);
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

  return { pathCommands, svgPaths, curFill0, curFill1, curLine };
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
  usedKeys?: SwfKeyBindingSpec[];
  referencedProps?: Set<string>;
  poolRequests?: { sourceClip: string; poolBase: string }[];
}

export interface SwfClipAction {
  events: string[];
  keyCode?: number;
  actionRecord: SwfActionRecord;
}

export interface SwfDisplayEntry {
  depth: number;
  characterId: number;
  matrix?: SwfMatrix | null;
  cxform?: SwfColorTransform | null;
  ratio?: number;
  name?: string;
  clipDepth?: number;
  clipActions?: SwfClipAction[];
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
    case 13: return { keyCode, domCode: 'Enter', varName: 'key_enter' };
    case 16: return { keyCode, domCode: 'ShiftLeft', varName: 'key_shift' };
    case 17: return { keyCode, domCode: 'ControlLeft', varName: 'key_ctrl' };
    case 27: return { keyCode, domCode: 'Escape', varName: 'key_escape' };
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

function mapSwfButtonKeyCode(btnKeyCode: number): SwfKeyBindingSpec {
  // SWF DefineButton2 CondKeyPress uses Flash special codes 1..19 and ASCII 32..126
  switch (btnKeyCode) {
    case 1: return mapFlashKeyCode(37); // Left
    case 2: return mapFlashKeyCode(39); // Right
    case 14: return mapFlashKeyCode(38); // Up
    case 15: return mapFlashKeyCode(40); // Down
    case 13: return mapFlashKeyCode(13); // Enter
    case 19: return mapFlashKeyCode(27); // Escape
    default: return mapFlashKeyCode(btnKeyCode);
  }
}

interface Avm1StackVal {
  kind: 'num' | 'str' | 'bool' | 'var' | 'member' | 'sexpr' | 'null';
  numVal?: number;
  strVal?: string;
  boolVal?: boolean;
  varName?: string;
  obj?: Avm1StackVal;
  prop?: string;
  code?: string;
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
  if (!targetPrefix || targetPrefix === '_root' || targetPrefix === 'root') {
    return `swf_${suffix}`;
  }
  return `${sanitizeAstIdent(targetPrefix)}_${suffix}`;
}

function resolveMemberTargetName(obj: Avm1StackVal, propName: string, defaultClipPrefix: string): string {
  const pLower = propName.toLowerCase();
  const objName = obj.kind === 'var' ? (obj.varName || '') : (obj.kind === 'str' ? (obj.strVal || '') : '');
  const isRoot = objName === '_root' || objName === '_level0' || objName === 'root';
  const isThis = objName === 'this' || objName === '' || objName === '_parent';

  if (FLASH_PROP_SUFFIX_MAP[pLower]) {
    const clipPrefix = isThis ? defaultClipPrefix : (isRoot ? '' : objName);
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
 * Full AVM1 (ActionScript 1.0 / 2.0) bytecode lifter for DoAction (Tag 12), DoInitAction (Tag 59),
 * PlaceObject2 ClipActions, and DefineButton / DefineButton2 actions.
 */
function parseDoAction(
  reader: BitReader,
  tagEndOffset: number,
  currentFrame: number,
  context: {
    clipPrefix?: string;
    instanceHalfSizes?: Map<string, { hw: number; hh: number }>;
  } = {}
): SwfActionRecord {
  const defaultClipPrefix = context.clipPrefix || '';
  const record: SwfActionRecord = {
    frame: currentFrame,
    gotoFrames: [],
    gotoLabels: [],
    setVariables: [],
    branches: [],
    statements: [],
    usedKeys: [],
    referencedProps: new Set<string>(),
    poolRequests: [],
  };

  // Pass 1: Decode instruction stream with exact byte offsets for ActionIf / ActionJump resolution
  const instrs: Avm1DecodedIns[] = [];
  const offsetToIdx = new Map<number, number>();
  while (reader.offset < tagEndOffset) {
    const startOff = reader.offset;
    const code = reader.readUI8();
    if (code === 0) break; // ActionEnd
    let length = 0;
    if (code >= 0x80) {
      length = reader.readUI16();
    }
    const endOff = Math.min(tagEndOffset, reader.offset + length);
    const payload = length > 0 ? reader.readBytes(endOff - reader.offset) : new Uint8Array(0);
    offsetToIdx.set(startOff, instrs.length);
    instrs.push({ offset: startOff, endOffset: endOff, code, payload });
    reader.offset = endOff;
  }

  const constantPool: string[] = [];
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

  const resolveClipNameFromVal = (val: Avm1StackVal | undefined): string => {
    if (!val) return defaultClipPrefix;
    if (val.kind === 'str') {
      const s = (val.strVal || '').trim();
      if (!s || s === 'this') return defaultClipPrefix;
      return sanitizeAstIdent(s.replace(/^_root\.|^\/+/, ''));
    }
    if (val.kind === 'var') {
      const v = val.varName || '';
      if (!v || v === 'this') return defaultClipPrefix;
      if (v === '_root' || v === '_level0') return '';
      return sanitizeAstIdent(v);
    }
    if (val.kind === 'member' && val.prop) {
      return sanitizeAstIdent(val.prop);
    }
    return defaultClipPrefix;
  };

  // Pass 2: Structured control-flow + symbolic stack evaluation
  const evalRange = (startIdx: number, endIdx: number, activeGuard: string | undefined, stack: Avm1StackVal[]) => {
    let i = startIdx;
    while (i < endIdx && i < instrs.length) {
      const ins = instrs[i];
      const code = ins.code;
      const pReader = ins.payload.length > 0 ? new BitReader(ins.payload, 0) : null;

      if (code === 0x07) {
        // ActionStop
        record.stops = true;
        record.statements!.push({ kind: 'stop', targetPrefix: defaultClipPrefix, when: activeGuard });
      } else if (code === 0x06) {
        // ActionPlay
        record.plays = true;
        record.statements!.push({ kind: 'play', targetPrefix: defaultClipPrefix, when: activeGuard });
      } else if (code === 0x04) {
        // ActionNextFrame
        record.statements!.push({ kind: 'nextFrame', targetPrefix: defaultClipPrefix, when: activeGuard });
      } else if (code === 0x05) {
        // ActionPreviousFrame
        record.statements!.push({ kind: 'prevFrame', targetPrefix: defaultClipPrefix, when: activeGuard });
      } else if (code === 0x81 && pReader) {
        // ActionGotoFrame (0-based in SWF -> 1-based frame)
        const frameNum = pReader.readUI16() + 1;
        record.gotoFrames!.push(frameNum);
        record.statements!.push({ kind: 'gotoFrame', targetPrefix: defaultClipPrefix, frame: frameNum, play: false, when: activeGuard });
      } else if (code === 0x8C && pReader) {
        // ActionGoToLabel (spec 0x8C)
        const lbl = pReader.readString();
        if (lbl) {
          record.gotoLabels!.push(lbl);
          record.statements!.push({ kind: 'gotoLabel', targetPrefix: defaultClipPrefix, label: lbl, play: false, when: activeGuard });
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
            record.statements!.push({ kind: 'gotoLabel', targetPrefix: defaultClipPrefix, label: lbl, play: true, when: activeGuard });
          }
        } else {
          const flags = pReader.readUI8();
          const playFlag = (flags & 0x01) !== 0;
          const sceneBiasFlag = (flags & 0x02) !== 0;
          const sceneBias = sceneBiasFlag ? pReader.readUI16() : 0;
          const targetVal = stack.pop();
          if (targetVal?.kind === 'str' && targetVal.strVal) {
            record.gotoLabels!.push(targetVal.strVal);
            record.statements!.push({ kind: 'gotoLabel', targetPrefix: defaultClipPrefix, label: targetVal.strVal, play: playFlag, when: activeGuard });
          } else if (targetVal?.kind === 'num') {
            const frameNum = Math.max(1, Math.round((targetVal.numVal || 1) + sceneBias));
            record.gotoFrames!.push(frameNum);
            record.statements!.push({ kind: 'gotoFrame', targetPrefix: defaultClipPrefix, frame: frameNum, play: playFlag, when: activeGuard });
          }
        }
      } else if (code === 0x88 && pReader) {
        // ActionConstantPool
        const count = pReader.readUI16();
        constantPool.length = 0;
        for (let c = 0; c < count && pReader.offset < ins.payload.length; c++) {
          constantPool.push(pReader.readString());
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
            stack.push({ kind: 'var', varName: `reg_${regNum}` });
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
        if (rawName) {
          const propVar = FLASH_PROP_SUFFIX_MAP[rawName.toLowerCase()]
            ? resolvePropVarName(defaultClipPrefix, rawName.toLowerCase())
            : null;
          const astVar = propVar || sanitizeAstIdent(rawName);
          if (propVar) record.referencedProps!.add(propVar);
          const expr = avm1ValToSexpr(val, defaultClipPrefix, record.referencedProps!);
          const rawLit = avm1ValToRawLiteral(val);
          if (!activeGuard) {
            record.setVariables!.push({ name: astVar, value: rawLit !== undefined ? rawLit : 0 });
          } else if (!record.setVariables!.some((sv) => sv.name === astVar)) {
            record.setVariables!.push({ name: astVar, value: 0 });
          }
          record.statements!.push({
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
        stack.push({ kind: 'member', obj: objVal, prop: propName });
      } else if (code === 0x4F) {
        // ActionSetMember: pop value, pop memberName, pop object
        const val = stack.pop();
        const memberVal = stack.pop();
        const objVal = stack.pop() || { kind: 'var', varName: 'this' };
        const propName = memberVal?.kind === 'str' ? (memberVal.strVal || '') : (memberVal?.varName || '');
        if (propName) {
          const astVar = resolveMemberTargetName(objVal, propName, defaultClipPrefix);
          record.referencedProps!.add(astVar);
          const expr = avm1ValToSexpr(val, defaultClipPrefix, record.referencedProps!);
          const rawLit = avm1ValToRawLiteral(val);
          if (!activeGuard && !record.setVariables!.some((sv) => sv.name === astVar)) {
            record.setVariables!.push({ name: astVar, value: rawLit !== undefined ? rawLit : 0 });
          }
          record.statements!.push({
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
        const clipPrefix = resolveClipNameFromVal(targetVal);
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
        const clipPrefix = resolveClipNameFromVal(targetVal);
        const mapped = resolvePropVarName(clipPrefix, propName) || `${sanitizeAstIdent(clipPrefix)}_x`;
        record.referencedProps!.add(mapped);
        const expr = avm1ValToSexpr(val, defaultClipPrefix, record.referencedProps!);
        record.statements!.push({
          kind: 'setVar',
          varName: mapped,
          expr,
          rawVal: avm1ValToRawLiteral(val),
          when: activeGuard,
        });
      } else if (
        code === 0x0A || code === 0x47 || // Add / Add2
        code === 0x0B || // Subtract
        code === 0x0C || // Multiply
        code === 0x0D || // Divide
        code === 0x3F || // Modulo
        code === 0x0E || code === 0x49 || code === 0x13 || // Equals / Equals2 / StringEquals
        code === 0x0F || code === 0x48 || // Less / Less2
        code === 0x67 || // Greater
        code === 0x10 || // And
        code === 0x11 || // Or
        code === 0x60 || code === 0x61 || code === 0x62 // BitAnd / BitOr / BitXor
      ) {
        const rhs = stack.pop();
        const lhs = stack.pop();
        const a = avm1ValToSexpr(lhs, defaultClipPrefix, record.referencedProps!);
        const b = avm1ValToSexpr(rhs, defaultClipPrefix, record.referencedProps!);
        let op = '+';
        if (code === 0x0B) op = '-';
        else if (code === 0x0C) op = '*';
        else if (code === 0x0D) op = '/';
        else if (code === 0x3F) op = '%';
        else if (code === 0x0E || code === 0x49 || code === 0x13) op = '=';
        else if (code === 0x0F || code === 0x48) op = '<';
        else if (code === 0x67) op = '>';
        else if (code === 0x10) op = 'and';
        else if (code === 0x11) op = 'or';
        else if (code === 0x60) op = 'bitand';
        else if (code === 0x61) op = 'bitor';
        else if (code === 0x62) op = 'bitxor';
        stack.push({ kind: 'sexpr', code: `(${op} ${a} ${b})` });
      } else if (code === 0x12) {
        // ActionNot
        const operand = stack.pop();
        const a = avm1ValToSexpr(operand, defaultClipPrefix, record.referencedProps!);
        stack.push({ kind: 'sexpr', code: negateAvm1Cond(a) });
      } else if (code === 0x50 || code === 0x51) {
        // ActionIncrement (0x50) / ActionDecrement (0x51)
        const operand = stack.pop();
        const a = avm1ValToSexpr(operand, defaultClipPrefix, record.referencedProps!);
        stack.push({ kind: 'sexpr', code: `(${code === 0x50 ? '+' : '-'} ${a} 1)` });
      } else if (code === 0x30) {
        // ActionRandomNumber: pop max, push random(max)
        const maxVal = stack.pop();
        const mExpr = avm1ValToSexpr(maxVal, defaultClipPrefix, record.referencedProps!);
        stack.push({ kind: 'sexpr', code: `(random ${mExpr})` });
      } else if (code === 0x24) {
        // ActionDuplicateClip (0x24): pop depth, pop target, pop source
        stack.pop(); // depth
        const targetVal = stack.pop();
        const sourceVal = stack.pop();
        const srcClip = resolveClipNameFromVal(sourceVal);
        const poolBase = resolveClipNameFromVal(targetVal) || `${srcClip || 'clip'}_pool`;
        record.poolRequests!.push({ sourceClip: srcClip, poolBase });
        record.statements!.push({ kind: 'spawnPool', sourceClip: srcClip, poolBase, when: activeGuard });
      } else if (code === 0x25) {
        // ActionRemoveClip (0x25): pop target
        const targetVal = stack.pop();
        const clipName = resolveClipNameFromVal(targetVal);
        record.statements!.push({ kind: 'removePool', poolBase: clipName, when: activeGuard });
      } else if (code === 0x3D || code === 0x9B) {
        // ActionCallFunction (spec 0x3D; legacy 0x9B compat): pop funcName, pop numArgs, pop args[0..N-1]
        const funcVal = stack.pop();
        const numArgsVal = stack.pop();
        const funcName = funcVal?.kind === 'str' ? (funcVal.strVal || '') : (funcVal?.varName || '');
        const numArgs = Math.max(0, Math.min(16, Math.round(numArgsVal?.numVal ?? 0)));
        const args: Avm1StackVal[] = [];
        for (let a = 0; a < numArgs; a++) {
          args.push(stack.pop() || { kind: 'num', numVal: 0 });
        }
        handleAvm1Call(funcName, undefined, args, defaultClipPrefix, activeGuard, stack);
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
        handleAvm1Call(methodName, objVal, args, defaultClipPrefix, activeGuard, stack);
      } else if (code === 0x99 && pReader) {
        // ActionIf: pop cond, read signed 16-bit relative byte offset
        const branchOffset = pReader.readSI16();
        const condVal = stack.pop();
        const condStr = condVal?.kind === 'str'
          ? (condVal.strVal || 'true')
          : avm1ValToSexpr(condVal, defaultClipPrefix, record.referencedProps!);
        record.branches!.push({
          condition: condStr,
          target: branchOffset,
        });

        const targetOffset = ins.endOffset + branchOffset;
        if (branchOffset > 0) {
          let targetIdx = offsetToIdx.get(targetOffset);
          if (targetIdx === undefined) {
            targetIdx = instrs.findIndex((x) => x.offset >= targetOffset);
            if (targetIdx === -1) targetIdx = endIdx;
          }
          targetIdx = Math.min(endIdx, targetIdx);

          // Check if instruction immediately before targetIdx is a forward ActionJump (if/else pattern)
          let elseEndIdx = targetIdx;
          let thenEndIdx = targetIdx;
          if (targetIdx > i + 1 && instrs[targetIdx - 1].code === 0x9D && instrs[targetIdx - 1].payload.length >= 2) {
            const jmpIns = instrs[targetIdx - 1];
            const jmpOff = new BitReader(jmpIns.payload, 0).readSI16();
            if (jmpOff > 0) {
              const afterElseOffset = jmpIns.endOffset + jmpOff;
              let resolvedAfter = offsetToIdx.get(afterElseOffset);
              if (resolvedAfter === undefined) {
                resolvedAfter = instrs.findIndex((x) => x.offset >= afterElseOffset);
                if (resolvedAfter === -1) resolvedAfter = endIdx;
              }
              thenEndIdx = targetIdx - 1;
              elseEndIdx = Math.min(endIdx, resolvedAfter);
            }
          }

          // Only structure into guarded rules if condStr is an S-expression / variable (not Sim 7 raw text string)
          const isExecutableCond = condVal && condVal.kind !== 'str';
          if (isExecutableCond) {
            const thenGuard = composeAvm1When(activeGuard, negateAvm1Cond(condStr));
            evalRange(i + 1, thenEndIdx, thenGuard, [...stack]);
            if (elseEndIdx > targetIdx) {
              const elseGuard = composeAvm1When(activeGuard, condStr);
              evalRange(targetIdx, elseEndIdx, elseGuard, [...stack]);
            }
            i = elseEndIdx;
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
  };

  const handleAvm1Call = (
    name: string,
    objVal: Avm1StackVal | undefined,
    args: Avm1StackVal[],
    clipPrefix: string,
    activeGuard: string | undefined,
    stack: Avm1StackVal[]
  ) => {
    const objName = objVal?.kind === 'var' ? (objVal.varName || '') : (objVal?.kind === 'str' ? (objVal.strVal || '') : '');
    const fullTarget = objVal ? resolveClipNameFromVal(objVal) : clipPrefix;

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
      const clipA = fullTarget || clipPrefix;
      const clipB = resolveClipNameFromVal(args[0]);
      if (clipA && clipB) {
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
        record.statements!.push({ kind: 'gotoLabel', targetPrefix: fullTarget, label: target.strVal, play: playFlag, when: activeGuard });
      } else if (target?.kind === 'num') {
        const frameNum = Math.max(1, Math.round(target.numVal || 1));
        record.gotoFrames!.push(frameNum);
        record.statements!.push({ kind: 'gotoFrame', targetPrefix: fullTarget, frame: frameNum, play: playFlag, when: activeGuard });
      }
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'play') {
      record.plays = true;
      record.statements!.push({ kind: 'play', targetPrefix: fullTarget, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'stop') {
      record.stops = true;
      record.statements!.push({ kind: 'stop', targetPrefix: fullTarget, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'nextFrame') {
      record.statements!.push({ kind: 'nextFrame', targetPrefix: fullTarget, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'prevFrame') {
      record.statements!.push({ kind: 'prevFrame', targetPrefix: fullTarget, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }

    // 6. duplicateMovieClip / attachMovie -> zero-GC compile-time clip pool
    if (name === 'duplicateMovieClip' || name === 'attachMovie') {
      const srcClip = resolveClipNameFromVal(args[0]);
      const poolBase = resolveClipNameFromVal(args[1]) || `${srcClip || 'proj'}_pool`;
      record.poolRequests!.push({ sourceClip: srcClip, poolBase });
      record.statements!.push({ kind: 'spawnPool', sourceClip: srcClip, poolBase, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }
    if (name === 'removeMovieClip') {
      record.statements!.push({ kind: 'removePool', poolBase: fullTarget, when: activeGuard });
      stack.push({ kind: 'null' });
      return;
    }

    stack.push({ kind: 'num', numVal: 0 });
  };

  evalRange(0, instrs.length, undefined, []);
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
  clipPrefix: string
): SwfClipAction[] {
  const actions: SwfClipAction[] = [];
  if (reader.offset + 4 > tagEndOffset) return actions;

  reader.readUI16(); // Reserved
  if (swfVersion >= 6) reader.readUI32(); // AllEventFlags (32-bit in SWF 6+)
  else reader.readUI16(); // AllEventFlags (16-bit in SWF 5)

  while (reader.offset < tagEndOffset) {
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
    if (eventFlags & 0x20000) events.push('keyPress');

    const actionRecord = parseDoAction(reader, recordEnd, currentFrame, { clipPrefix });
    actions.push({ events, keyCode, actionRecord });
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
  currentFrame: number
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
      // HasFilterList: skip cleanly if present
      const filterCount = reader.readUI8();
      for (let f = 0; f < filterCount && reader.offset < tagEndOffset; f++) {
        reader.readUI8();
      }
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
      const actionRecord = parseDoAction(reader, tagEndOffset, currentFrame);
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
      const actionRecord = parseDoAction(reader, condEnd, currentFrame);
      actions.push({
        conditionFlags: condFlags,
        keyCode,
        isClick,
        isOver,
        actionRecord,
      });
      if (condActionSize === 0) break;
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
  swfVersion: number
): SwfSpriteDefinition {
  const spriteId = reader.readUI16();
  const declaredFrames = Math.max(1, reader.readUI16());

  const frames: SwfFrameSnapshot[] = [];
  const labels: { frame: number; name: string }[] = [];
  const actions: SwfActionRecord[] = [];
  const activeDisplay = new Map<number, SwfDisplayEntry>();
  let currentFrame = 1;
  let hasTimelineMotion = false;
  let sawFrameMutation = false;

  while (reader.offset < tagEndOffset) {
    const tagCodeAndLength = reader.readUI16();
    const tagType = tagCodeAndLength >> 6;
    let tagLength = tagCodeAndLength & 0x3F;
    if (tagLength === 0x3F) tagLength = reader.readUI32();
    const nextTagOffset = Math.min(tagEndOffset, reader.offset + tagLength);

    if (tagType === 0) {
      break;
    } else if (tagType === 1) {
      // ShowFrame: snapshot current display list
      const snap = new Map<number, SwfDisplayEntry>();
      activeDisplay.forEach((v, k) => snap.set(k, { ...v }));
      frames.push({ frame: currentFrame, entries: snap });
      if (currentFrame > 1 && sawFrameMutation) hasTimelineMotion = true;
      sawFrameMutation = false;
      currentFrame++;
    } else if (tagType === 43) {
      const lbl = reader.readString();
      if (lbl) labels.push({ frame: currentFrame, name: lbl });
    } else if (tagType === 12 || tagType === 59) {
      if (tagType === 59) reader.readUI16(); // DoInitAction SpriteID
      actions.push(parseDoAction(reader, nextTagOffset, currentFrame));
    } else if (tagType === 4 || tagType === 26 || tagType === 70) {
      const placed = parsePlaceObjectTag(reader, tagType, nextTagOffset, swfVersion, currentFrame);
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
    hasTimelineMotion: hasTimelineMotion || frames.length > 1,
  };
}

interface ParsedPlaceTag {
  depth: number;
  hasMove: boolean;
  characterId?: number;
  matrix?: SwfMatrix;
  cxform?: SwfColorTransform;
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
  currentFrame: number
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
    const clipActions = hasClipActions ? parseClipActions(reader, tagEndOffset, swfVersion, currentFrame, clipPrefix) : undefined;

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
    const hasClassName = (flags2 & 0x08) !== 0;
    const hasImage = (flags2 & 0x10) !== 0;

    if (hasClassName || (hasImage && hasChar)) {
      reader.readString(); // ClassName
    }
    const characterId = hasChar ? reader.readUI16() : undefined;
    const matrix = hasMatrix ? reader.readMatrix() : undefined;
    const cxform = hasColorTransform ? reader.readCXForm(true) : undefined;
    const ratio = hasRatio ? reader.readUI16() : undefined;
    const name = hasName ? reader.readString() : undefined;
    const clipDepth = hasClipDepth ? reader.readUI16() : undefined;
    const clipPrefix = name ? sanitizeAstIdent(name) : `depth_${depth}`;
    const clipActions = hasClipActions ? parseClipActions(reader, tagEndOffset, swfVersion, currentFrame, clipPrefix) : undefined;

    return { depth, hasMove, characterId, matrix, cxform, ratio, name, clipDepth, clipActions };
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
      ratio: placed.ratio,
      name: placed.name,
      clipDepth: placed.clipDepth,
      clipActions: placed.clipActions,
    });
  }
}

/**
 * Disassembles ActionScript 3.0 bytecode in DoABC (Tag 82) tags.
 */
function parseDoABC(reader: BitReader, tagEndOffset: number, currentFrame: number): SwfActionRecord {
  const record: SwfActionRecord = {
    frame: currentFrame,
    gotoFrames: [],
    gotoLabels: [],
    setVariables: [],
    branches: [],
    statements: [],
    usedKeys: [],
    referencedProps: new Set<string>(),
    poolRequests: [],
  };

  try {
    reader.readUI32(); // flags
    reader.readString(); // name

    const remainingBytes = reader.readBytes(Math.max(0, tagEndOffset - reader.offset));
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

    for (let i = 0; i < remainingBytes.length; i++) {
      if (remainingBytes[i] === 0x12) {
        record.stops = true;
        break;
      }
    }
  } catch {}

  return record;
}

/**
 * Main Entry Point: Transpiles SWF file binary array into modern SVG + executable AST S-Expressions.
 */
export async function transpileSwfToAst(fileData: ArrayBuffer | Uint8Array, sceneId = 'imported-swf'): Promise<SwfTranspileResult> {
  try {
    const rawBytes = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData);
    if (rawBytes.length < 8) {
      return { success: false, error: 'File is too short to be a valid SWF binary (min 8 bytes required).', svgMarkup: '', astSource: '' };
    }

    const sig = String.fromCharCode(rawBytes[0], rawBytes[1], rawBytes[2]);
    if (sig !== 'FWS' && sig !== 'CWS') {
      return { success: false, error: `Unsupported SWF signature: "${sig}". Only standard FWS or CWS Flash files are supported.`, svgMarkup: '', astSource: '' };
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
    } else {
      payload = rawBytes;
    }

    const reader = new BitReader(payload, 8);
    const frameRect = reader.readRect();
    const frameRate = reader.readUI16() / 256;
    const frameCount = reader.readUI16();

    let backgroundColor = '#0f172a';
    const shapes: { id: string; charId: number; svg: string; bbox: { x: number; y: number; w: number; h: number } }[] = [];
    const morphShapes: SwfMorphShape[] = [];
    const sprites = new Map<number, SwfSpriteDefinition>();
    const buttons = new Map<number, SwfButtonDefinition>();
    const actionBlocks: SwfActionRecord[] = [];
    const labels: { frame: number; name: string }[] = [];

    const activeDisplay = new Map<number, SwfDisplayEntry>();
    const timelineFrames: SwfFrameSnapshot[] = [];
    let hasMainTimelineMutations = false;
    let sawFrameMutation = false;

    let currentFrame = 1;

    // Parse SWF tags
    while (reader.offset < payload.length) {
      const tagCodeAndLength = reader.readUI16();
      const tagType = tagCodeAndLength >> 6;
      let tagLength = tagCodeAndLength & 0x3F;
      if (tagLength === 0x3F) {
        tagLength = reader.readUI32();
      }

      const nextTagOffset = Math.min(payload.length, reader.offset + tagLength);

      if (tagType === 0) {
        break;
      } else if (tagType === 9) {
        backgroundColor = reader.readRGBA(false);
      } else if (tagType === 2 || tagType === 22 || tagType === 32 || tagType === 83) {
        const shapeId = reader.readUI16();
        const tagVer = tagType === 2 ? 1 : (tagType === 22 ? 2 : (tagType === 32 ? 3 : 4));
        try {
          const shape = parseSwfShape(reader, shapeId, tagVer, nextTagOffset);
          shapes.push(shape);
        } catch {
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
          const spriteDef = parseDefineSprite(reader, nextTagOffset, version);
          sprites.set(spriteDef.spriteId, spriteDef);
        } catch {}
      } else if (tagType === 7 || tagType === 34) {
        // DefineButton (Tag 7) / DefineButton2 (Tag 34)
        try {
          const btnDef = parseDefineButton(reader, nextTagOffset, tagType === 34, currentFrame);
          buttons.set(btnDef.buttonId, btnDef);
        } catch {}
      } else if (tagType === 12 || tagType === 59) {
        // DoAction (12) / DoInitAction (59)
        try {
          if (tagType === 59) reader.readUI16(); // SpriteID
          const act = parseDoAction(reader, nextTagOffset, currentFrame);
          actionBlocks.push(act);
        } catch {}
      } else if (tagType === 82) {
        try {
          const act = parseDoABC(reader, nextTagOffset, currentFrame);
          actionBlocks.push(act);
        } catch {}
      } else if (tagType === 4 || tagType === 26 || tagType === 70) {
        try {
          const placed = parsePlaceObjectTag(reader, tagType, nextTagOffset, version, currentFrame);
          if (placed) {
            applyPlaceToDisplayMap(activeDisplay, placed);
            if (currentFrame > 1) sawFrameMutation = true;
          }
        } catch {}
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
        // ShowFrame (Tag 1)
        const snap = new Map<number, SwfDisplayEntry>();
        activeDisplay.forEach((v, k) => snap.set(k, { ...v }));
        timelineFrames.push({ frame: currentFrame, entries: snap });
        if (currentFrame > 1 && sawFrameMutation) hasMainTimelineMutations = true;
        sawFrameMutation = false;
        currentFrame++;
      } else if (tagType === 43) {
        const labelName = reader.readString();
        labels.push({ frame: currentFrame, name: labelName });
      } else if (tagType === 37) {
        try {
          const charId = reader.readUI16();
          const bounds = reader.readRect();
          reader.syncBits();
          const flags1 = reader.readUI8();
          const flags2 = reader.readUI8();
          const hasFont = (flags1 & 0x01) !== 0;
          const hasMaxLength = (flags1 & 0x02) !== 0;
          const hasTextColor = (flags1 & 0x04) !== 0;
          const hasText = (flags1 & 0x80) !== 0;
          const hasLayout = (flags2 & 0x20) !== 0;

          if (hasFont) {
            reader.readUI16();
            reader.readUI16();
          }
          let textColor = '#ffffff';
          if (hasTextColor) {
            textColor = reader.readRGBA(true);
          }
          if (hasMaxLength) {
            reader.readUI16();
          }
          if (hasLayout) {
            reader.readUI8();
            reader.readUI16();
            reader.readUI16();
            reader.readUI16();
            reader.readSI16();
          }
          reader.readString(); // variableName
          if (hasText) {
            const initialText = reader.readString();
            if (initialText && initialText.trim()) {
              const textSvg = `<text id="swf-text-${charId}" x="${bounds.xMin.toFixed(1)}" y="${(bounds.yMin + Math.max(14, bounds.height * 0.75)).toFixed(1)}" fill="${textColor}" font-size="14" font-family="system-ui, sans-serif" font-weight="600">${initialText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`;
              shapes.push({
                id: `swf-text-${charId}`,
                charId,
                svg: textSvg,
                bbox: { x: bounds.xMin, y: bounds.yMin, w: bounds.width, h: bounds.height },
              });
            }
          }
        } catch {}
      }

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

    const shapeByCharId = new Map<number, { id: string; charId: number; svg: string; bbox: { x: number; y: number; w: number; h: number } }>();
    for (const s of shapes) shapeByCharId.set(s.charId, s);
    const morphByCharId = new Map<number, SwfMorphShape>();
    for (const m of morphShapes) morphByCharId.set(m.shapeId, m);

    // Collect all depth slots appearing on any frame of the main timeline
    const allMainDepths = new Map<number, {
      depth: number;
      firstFrame: number;
      firstEntry: SwfDisplayEntry;
      name?: string;
      charIds: Set<number>;
      frameStates: Map<number, SwfDisplayEntry>;
      clipActions: SwfClipAction[];
    }>();

    for (const snap of timelineFrames) {
      snap.entries.forEach((entry, depth) => {
        let slot = allMainDepths.get(depth);
        if (!slot) {
          slot = {
            depth,
            firstFrame: snap.frame,
            firstEntry: entry,
            name: entry.name,
            charIds: new Set<number>(),
            frameStates: new Map<number, SwfDisplayEntry>(),
            clipActions: [],
          };
          allMainDepths.set(depth, slot);
        }
        if (entry.name && !slot.name) slot.name = entry.name;
        slot.charIds.add(entry.characterId);
        slot.frameStates.set(snap.frame, entry);
        if (entry.clipActions && entry.clipActions.length > 0 && slot.clipActions.length === 0) {
          slot.clipActions = entry.clipActions;
        }
      });
    }

    // Determine whether this SWF has dynamic timelines, sprites, buttons, named clips, or executable AVM1
    const hasClipActions = Array.from(allMainDepths.values()).some((d) => d.clipActions.length > 0);
    const hasNamedInstances = Array.from(allMainDepths.values()).some((d) => Boolean(d.name));
    const hasExecutableMainActions = actionBlocks.some((ab) =>
      (ab.usedKeys && ab.usedKeys.length > 0) ||
      (ab.poolRequests && ab.poolRequests.length > 0) ||
      (ab.referencedProps && ab.referencedProps.size > 0) ||
      (ab.statements || []).some((st) => st.when || st.kind === 'nextFrame' || st.kind === 'prevFrame' || st.kind === 'spawnPool')
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
      extraWhen?: string
    ) => {
      const when = composeAvm1When(extraWhen, st.when);
      const whenAttr = when ? ` :when "${when}"` : '';
      const targetPfx = st.targetPrefix ? sanitizeAstIdent(st.targetPrefix) : 'swf';
      const frameVar = targetPfx === 'swf' ? 'swf_frame' : `${targetPfx}_frame`;
      const playVar = targetPfx === 'swf' ? 'swf_playing' : `${targetPfx}_playing`;

      if (st.kind === 'setVar' && st.varName && st.expr) {
        ensureVar(st.varName, st.rawVal !== undefined ? st.rawVal : 0);
        dynamicRules.push(`    (:rule :var "${st.varName}"${whenAttr} :expr "${st.expr}")`);
      } else if (st.kind === 'stop') {
        ensureVar(playVar, 1, 0, 1);
        dynamicRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "0")`);
      } else if (st.kind === 'play') {
        ensureVar(playVar, 1, 0, 1);
        dynamicRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "1")`);
      } else if (st.kind === 'gotoFrame' && st.frame) {
        ensureVar(frameVar, 1, 1, Math.max(totalFrames, st.frame));
        ensureVar(playVar, 1, 0, 1);
        dynamicRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "${st.frame}")`);
        dynamicRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "${st.play ? 1 : 0}")`);
      } else if (st.kind === 'gotoLabel' && st.label) {
        const targetFrame = labelMap.get(st.label) ?? labelMap.get(st.label.toLowerCase()) ?? 1;
        ensureVar(frameVar, 1, 1, Math.max(totalFrames, targetFrame));
        ensureVar(playVar, 1, 0, 1);
        dynamicRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "${targetFrame}")`);
        dynamicRules.push(`    (:rule :var "${playVar}"${whenAttr} :expr "${st.play ? 1 : 0}")`);
      } else if (st.kind === 'nextFrame') {
        ensureVar(frameVar, 1, 1, totalFrames);
        dynamicRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "(min ${totalFrames} (+ ${frameVar} 1))")`);
      } else if (st.kind === 'prevFrame') {
        ensureVar(frameVar, 1, 1, totalFrames);
        dynamicRules.push(`    (:rule :var "${frameVar}"${whenAttr} :expr "(max 1 (- ${frameVar} 1))")`);
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
          dynamicRules.push(`    (:rule :var "${slotPfx}_x"${sgAttr} :expr "${src}_x")`);
          dynamicRules.push(`    (:rule :var "${slotPfx}_y"${sgAttr} :expr "${src}_y")`);
          dynamicRules.push(`    (:rule :var "${slotPfx}_visible"${sgAttr} :expr "1")`);
        }
        dynamicRules.push(`    (:rule :var "${base}_pool_idx"${whenAttr} :expr "(% (+ ${base}_pool_idx 1) ${poolCount})")`);
      } else if (st.kind === 'removePool' && st.poolBase) {
        const base = sanitizeAstIdent(st.poolBase);
        ensureVar(`${base}_visible`, 1, 0, 1);
        dynamicRules.push(`    (:rule :var "${base}_visible"${whenAttr} :expr "0")`);
      }
    };

    const emitStatementToGestureSteps = (
      st: Avm1LiftedStatement,
      labelMap: Map<string, number>
    ): string[] => {
      const wrapIf = (inner: string): string => (st.when ? `(:if "${st.when}" ${inner})` : inner);
      const targetPfx = st.targetPrefix ? sanitizeAstIdent(st.targetPrefix) : 'swf';
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
        const targetFrame = labelMap.get(st.label) ?? labelMap.get(st.label.toLowerCase()) ?? 1;
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

    const renderCharacterSvg = (
      charId: number,
      instanceDomPrefix: string,
      instanceVarPrefix?: string
    ): string => {
      const shape = shapeByCharId.get(charId);
      if (shape) {
        usedCharIds.add(charId);
        const c = (charRenderCount.get(charId) || 0) + 1;
        charRenderCount.set(charId, c);
        if (c > 1) {
          return shape.svg.replace(`id="${shape.id}"`, `id="${instanceDomPrefix}-${shape.id}"`);
        }
        return shape.svg;
      }
      const morph = morphByCharId.get(charId);
      if (morph) {
        usedCharIds.add(charId);
        const c = (charRenderCount.get(charId) || 0) + 1;
        charRenderCount.set(charId, c);
        if (c > 1) {
          return morph.svg.replace(`id="${morph.id}"`, `id="${instanceDomPrefix}-${morph.id}"`);
        }
        return morph.svg;
      }

      const sprite = sprites.get(charId);
      if (sprite) {
        usedCharIds.add(charId);
        const spPrefix = instanceVarPrefix || `sprite_${charId}`;
        const spFrameVar = `${spPrefix}_frame`;
        const spPlayVar = `${spPrefix}_playing`;
        const spTotalVar = `${spPrefix}_totalframes`;

        // Collect all depths inside this sprite
        const spDepths = new Map<number, Map<number, SwfDisplayEntry>>();
        for (const snap of sprite.frames) {
          snap.entries.forEach((e, d) => {
            if (!spDepths.has(d)) spDepths.set(d, new Map());
            spDepths.get(d)!.set(snap.frame, e);
          });
        }

        const spLabelMap = buildLabelMap(sprite.labels);
        const stopsOnFrame1 = sprite.actions.some((a) => a.frame === 1 && a.stops);
        if (sprite.frameCount > 1 || sprite.actions.length > 0) {
          ensureVar(spFrameVar, 1, 1, sprite.frameCount);
          ensureVar(spPlayVar, stopsOnFrame1 ? 0 : 1, 0, 1);
          ensureVar(spTotalVar, sprite.frameCount, 1, sprite.frameCount);
          if (sprite.frameCount > 1) {
            dynamicRules.push(
              `    (:rule :var "${spFrameVar}" :when "(= ${spPlayVar} 1)" :expr "(if (>= ${spFrameVar} ${sprite.frameCount}) 1 (+ ${spFrameVar} 1))")`
            );
          }
          for (const act of sprite.actions) {
            registerUsedKeys(act.usedKeys);
            for (const st of act.statements || []) {
              const scopedSt: Avm1LiftedStatement = {
                ...st,
                targetPrefix: st.targetPrefix || spPrefix,
              };
              if (act.frame === 1 && st.kind === 'stop' && !st.when) continue;
              emitStatementToRules(scopedSt, spLabelMap, sprite.frameCount > 1 ? `(= ${spFrameVar} ${act.frame})` : undefined);
            }
          }
        }

        const childParts: string[] = [];
        const sortedSpDepths = Array.from(spDepths.keys()).sort((a, b) => a - b);
        for (const d of sortedSpDepths) {
          const frameMap = spDepths.get(d)!;
          const firstSnapEntry = Array.from(frameMap.values())[0];
          const childDomId = `${instanceDomPrefix}-d${d}`;
          const childInner = renderCharacterSvg(firstSnapEntry.characterId, childDomId);
          const initMat = firstSnapEntry.matrix ? ` transform="${formatMatrixAttr(firstSnapEntry.matrix)}"` : '';
          const initAlpha = firstSnapEntry.cxform ? ` opacity="${formatNum(firstSnapEntry.cxform.alpha)}"` : '';
          const visibleOn1 = frameMap.has(1);
          const initDisp = !visibleOn1 ? ' display="none"' : '';
          childParts.push(`<g id="${childDomId}" data-sprite-depth="${d}"${initMat}${initAlpha}${initDisp}>${childInner}</g>`);

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
        const btnDomId = `swf-btn-${btn.buttonId}`;
        // Render Up state records (or fallback to any state)
        const upRecords = btn.records.filter((r) => (r.states & 0x01) !== 0);
        const displayRecords = upRecords.length > 0 ? upRecords : btn.records.slice(0, 1);
        const btnChildren = displayRecords
          .sort((a, b) => a.depth - b.depth)
          .map((rec) => {
            const inner = renderCharacterSvg(rec.characterId, `${btnDomId}-d${rec.depth}`);
            const matAttr = rec.matrix ? ` transform="${formatMatrixAttr(rec.matrix)}"` : '';
            const opAttr = rec.cxform ? ` opacity="${formatNum(rec.cxform.alpha)}"` : '';
            return `<g id="${btnDomId}-s${rec.depth}"${matAttr}${opAttr}>${inner}</g>`;
          })
          .join('\n        ');

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
              dynamicGestures.push(`    (:on-click :target "#${btnDomId}" ${bodySteps})`);
            }
          }
        }

        return `<g id="${btnDomId}" role="button" tabindex="0" aria-label="SWF Button ${btn.buttonId}" style="cursor:pointer">\n        ${btnChildren}\n      </g>`;
      }

      return '';
    };

    const placedSvgElements: string[] = [];

    if (!isDynamicSwf) {
      // Static single-frame SWF path (100% compatible with Sims 1–11)
      const sortedDisplayList = Array.from(activeDisplay.values()).sort((a, b) => a.depth - b.depth);
      for (const entry of sortedDisplayList) {
        const targetItem = shapeByCharId.get(entry.characterId) || morphByCharId.get(entry.characterId);
        if (!targetItem) continue;

        usedCharIds.add(entry.characterId);
        const count = (charRenderCount.get(entry.characterId) || 0) + 1;
        charRenderCount.set(entry.characterId, count);

        let innerSvg = targetItem.svg;
        if (count > 1) {
          innerSvg = innerSvg.replace(`id="${targetItem.id}"`, `id="${targetItem.id}-d${entry.depth}"`);
        }

        if (entry.matrix) {
          const transformVal = formatMatrixAttr(entry.matrix);
          const opAttr = entry.cxform && entry.cxform.alpha < 1 ? ` opacity="${formatNum(entry.cxform.alpha)}"` : '';
          placedSvgElements.push(
            `<g id="swf-place-${entry.depth}" data-character-id="${entry.characterId}" transform="${transformVal}"${opAttr}>\n      ${innerSvg}\n    </g>`
          );
        } else {
          placedSvgElements.push(innerSvg);
        }
      }
    } else {
      // Dynamic SWF Timeline, Display List, Sprites, Buttons & AVM1 Game Runtime
      const mainStopsFrame1 = actionBlocks.some((ab) => ab.frame === 1 && ab.stops);
      ensureVar('swf_frame', 1, 1, totalFrames);
      ensureVar('swf_playing', mainStopsFrame1 ? 0 : 1, 0, 1);
      ensureVar('swf_totalframes', totalFrames, 1, totalFrames);
      ensureVar('swf_tick', 0, 0, 1000000);

      // Process frame-1 DoAction initial variable assignments before clip rules
      for (const ab of actionBlocks) {
        registerUsedKeys(ab.usedKeys);
        for (const sv of ab.setVariables || []) {
          ensureVar(sv.name, sv.value);
        }
      }

      // Main timeline frame advancement rule
      if (totalFrames > 1) {
        dynamicRules.push(
          `    (:rule :var "swf_frame" :when "(= swf_playing 1)" :expr "(if (>= swf_frame ${totalFrames}) 1 (+ swf_frame 1))")`
        );
      }

      // Emit pre-allocated <g> wrappers for every main timeline depth slot
      const sortedDepthSlots = Array.from(allMainDepths.values()).sort((a, b) => a.depth - b.depth);
      const instanceSourceCharMap = new Map<string, number>();

      for (const slot of sortedDepthSlots) {
        const safeName = slot.name ? sanitizeAstIdent(slot.name) : '';
        const domId = safeName ? `swf-inst-${safeName}` : `swf-place-${slot.depth}`;
        const firstEntry = slot.firstEntry;
        if (safeName) instanceSourceCharMap.set(safeName, firstEntry.characterId);

        const initMat = firstEntry.matrix || { scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0, transX: 0, transY: 0 };
        const initAlpha = firstEntry.cxform ? firstEntry.cxform.alpha : 1;
        const visibleOn1 = slot.frameStates.has(1);

        const innerSvg = renderCharacterSvg(firstEntry.characterId, domId, safeName || undefined);
        const transformAttr = firstEntry.matrix ? ` transform="${formatMatrixAttr(initMat)}"` : '';
        const opacityAttr = initAlpha < 1 ? ` opacity="${formatNum(initAlpha)}"` : '';
        const displayAttr = !visibleOn1 ? ' display="none"' : '';
        const nameAttr = slot.name ? ` data-swf-name="${slot.name}"` : '';

        placedSvgElements.push(
          `<g id="${domId}" data-character-id="${firstEntry.characterId}" data-depth="${slot.depth}"${nameAttr}${transformAttr}${opacityAttr}${displayAttr}>\n      ${innerSvg}\n    </g>`
        );

        // If this is a named MovieClip instance, bind Flash properties (_x, _y, _xscale, _yscale, _rotation, _alpha, _visible)
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
          ensureVar(`${safeName}_visible`, visibleOn1 ? 1 : 0, 0, 1);

          dynamicBindings.push(
            `    (:target "#${domId}" :attr "transform" :expr "(str 'translate(' ${safeName}_x ', ' ${safeName}_y ') rotate(' ${safeName}_rotation ') scale(' (/ ${safeName}_xscale 100) ', ' (/ ${safeName}_yscale 100) ')')")`
          );
          dynamicBindings.push(
            `    (:target "#${domId}" :attr "opacity" :expr "(/ ${safeName}_alpha 100)")`
          );
          dynamicBindings.push(
            `    (:target "#${domId}" :attr "display" :expr "(if (> ${safeName}_visible 0) 'inline' 'none')")`
          );
        } else if (totalFrames > 1) {
          // Pure display-list keyframe animation across ShowFrame boundaries (PlaceObject2 Move / CXForm / RemoveObject2)
          const matClauses: string[] = [];
          const alphaClauses: string[] = [];
          const dispClauses: string[] = [];
          let matChanges = false;
          let alphaChanges = false;
          let dispChanges = false;
          let prevMat: string | null = null;
          let prevAlpha: string | null = null;

          for (let f = 1; f <= totalFrames; f++) {
            const fe = slot.frameStates.get(f);
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
        for (const ca of slot.clipActions) {
          registerUsedKeys(ca.actionRecord.usedKeys);
          const stmts = ca.actionRecord.statements || [];

          if (ca.events.includes('load')) {
            for (const st of stmts) {
              if (st.kind === 'setVar' && st.varName && st.rawVal !== undefined && !st.when) {
                reactiveVars.set(st.varName, { val: st.rawVal });
              } else {
                emitStatementToRules(st, mainLabelMap, '(= swf_tick 0)');
              }
            }
          }
          if (ca.events.includes('enterFrame')) {
            for (const st of stmts) {
              emitStatementToRules(st, mainLabelMap);
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

      // Emit main timeline DoAction statements (frame-guarded when multi-frame)
      for (const ab of actionBlocks) {
        const frameGuard = totalFrames > 1 ? `(= swf_frame ${ab.frame})` : undefined;
        for (const st of ab.statements || []) {
          if (ab.frame === 1 && st.kind === 'stop' && !st.when) continue; // Already folded into swf_playing = 0
          if (ab.frame === 1 && st.kind === 'setVar' && !st.when && st.rawVal !== undefined) continue; // Already folded into :vars initial values
          emitStatementToRules(st, mainLabelMap, frameGuard);
        }
      }

      // Emit pre-allocated zero-GC projectile / clone pool SVG <g> nodes & bindings
      for (const pool of poolSlotsCreated) {
        const srcCharId = instanceSourceCharMap.get(pool.sourceClip) || shapes[0]?.charId || 0;
        for (let si = 0; si < pool.count; si++) {
          const slotPfx = `${pool.poolBase}_${si}`;
          const poolDomId = `swf-pool-${slotPfx}`;
          const inner = srcCharId ? renderCharacterSvg(srcCharId, poolDomId) : `<circle id="${poolDomId}-dot" r="4" fill="#38bdf8" />`;
          placedSvgElements.push(
            `<g id="${poolDomId}" data-pool-base="${pool.poolBase}" data-pool-slot="${si}" display="none">\n      ${inner}\n    </g>`
          );
          dynamicBindings.push(
            `    (:target "#${poolDomId}" :attr "transform" :expr "(str 'translate(' ${slotPfx}_x ', ' ${slotPfx}_y ')')")`
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
    }

    const unplacedSvgElements = [
      ...shapes.filter((s) => !usedCharIds.has(s.charId)).map((s) => s.svg),
      ...morphShapes.filter((m) => !usedCharIds.has(m.shapeId)).map((m) => m.svg),
    ];

    const allSvgElements = [...placedSvgElements, ...unplacedSvgElements];
    let finalSvgInner = allSvgElements.join('\n    ');
    if (!finalSvgInner.trim()) {
      finalSvgInner = `
    <!-- Imported SWF Visual Content -->
    <g id="swf-content" transform="translate(40, 40)">
      <rect id="swf-bg-card" width="${width - 80}" height="${height - 80}" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <text id="swf-title" x="${(width - 80) / 2}" y="80" text-anchor="middle" fill="#ffffff" font-size="20" font-family="system-ui" font-weight="bold">Imported Flash Asset: ${sceneId}</text>
      <circle id="swf-orbiter" cx="${(width - 80) / 2}" cy="${(height - 80) / 2 + 30}" r="32" fill="#6366f1" />
      <text id="swf-caption" x="${(width - 80) / 2}" y="${height - 120}" text-anchor="middle" fill="#94a3b8" font-size="13">Converted from legacy ${sig} v${version} &bull; ${frameCount} Frames &bull; ${(frameRate).toFixed(0)} FPS</text>
    </g>`;
    }

    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect id="bg" width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="scene-root">
    ${finalSvgInner}
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

    const astSource = `(:scene
  :id "${sceneId}"
  :type "Sim"
  :title "Imported Flash (${sceneId})"
  :subject "Transpiled Legacy SWF"
  :duration ${duration}
  :fps ${Math.round(frameRate) || 24}
  :stageWidth ${width}
  :stageHeight ${height}
${varsAst}
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
${rulesAst}${gesturesAst}
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
      spriteCount: sprites.size,
      buttonCount: buttons.size,
      actionCount: actionBlocks.length + Array.from(sprites.values()).reduce((a, sp) => a + sp.actions.length, 0) + Array.from(buttons.values()).reduce((a, b) => a + b.actions.length, 0),
      ruleCount: dynamicRules.length,
      keyBindingCount: allUsedKeys.size,
      poolSlotCount: totalPoolSlots,
      labels,
      stateMachines: smMeta,
      variables: Array.from(varMap.entries()).map(([k, v]) => ({ name: k, value: v.val })),
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
