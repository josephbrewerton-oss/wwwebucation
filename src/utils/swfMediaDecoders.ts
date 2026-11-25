/**
 * src/utils/swfMediaDecoders.ts
 *
 * Zero-dependency binary SWF media decoders (Audio & Bitmaps) for St Joseph's
 * Pure-SVG AST/SWF Transpiler. Works identically in browsers and Node.js with
 * ZERO <canvas>, ZERO WebGL, and ZERO third-party libraries.
 *
 * Supports:
 *  - DefineSound (Tag 14) & StartSound (Tag 15): PCM, SWF IMA ADPCM, MP3
 *  - DefineBitsJPEG2/3 (Tags 21, 35): validated JPEG / PNG / GIF data URIs
 *  - DefineBitsLossless / DefineBitsLossless2 (Tags 20, 36): zlib -> pure-JS PNG data URI
 */

export interface SwfSoundDef {
  id: number;
  /** 0=Uncompressed NE, 1=ADPCM, 2=MP3, 3=Uncompressed LE */
  fmt: number;
  rate: number;
  s16: number;
  st: number;
  sc: number;
  b64: string;
}

export interface SwfStartSoundEvent {
  f: number;
  id: number;
  stop?: number;
  noMult?: number;
  loops?: number;
}

export interface SwfBitmapDef {
  id: number;
  w?: number;
  h?: number;
  uri: string;
}

const MAX_SOUND_BYTES = 1024 * 1024; // 1 MB cap per sound
const MAX_BITMAP_BYTES = 512 * 1024; // 512 KB cap per bitmap
const MAX_LOSSLESS_PIXELS = 1024 * 1024; // 1 MP cap

function bytesToBase64(bytes: Uint8Array): string {
  if (!bytes || bytes.length === 0) return '';
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
  }
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// =========================================================================
// Pure-JS Zero-Dependency PNG Encoder (Uncompressed Zlib Deflate Blocks)
// =========================================================================

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function writeU32BE(out: Uint8Array, pos: number, val: number): void {
  out[pos] = (val >>> 24) & 0xff;
  out[pos + 1] = (val >>> 16) & 0xff;
  out[pos + 2] = (val >>> 8) & 0xff;
  out[pos + 3] = val & 0xff;
}

function makePngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  writeU32BE(chunk, 0, data.length);
  chunk[4] = type.charCodeAt(0);
  chunk[5] = type.charCodeAt(1);
  chunk[6] = type.charCodeAt(2);
  chunk[7] = type.charCodeAt(3);
  chunk.set(data, 8);
  const c = crc32(chunk.subarray(4, 8 + data.length));
  writeU32BE(chunk, 8 + data.length, c);
  return chunk;
}

/**
 * Encodes an RGBA pixel buffer into a standard W3C PNG data URI with zero dependencies.
 */
export function encodeRgbaToPngDataUri(width: number, height: number, rgba: Uint8Array): string {
  const stride = width * 4;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowOff = y * (stride + 1);
    raw[rowOff] = 0; // PNG filter type 0 (None)
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), rowOff + 1);
  }

  // Wrap raw scanlines in valid stored (uncompressed) zlib stream
  const maxBlock = 65535;
  const numBlocks = Math.max(1, Math.ceil(raw.length / maxBlock));
  const zlibBuf = new Uint8Array(2 + raw.length + numBlocks * 5 + 4);
  let zp = 0;
  zlibBuf[zp++] = 0x78; // CMF (deflate, 32K window)
  zlibBuf[zp++] = 0x01; // FLG (no dict, fastest)
  let rp = 0;
  for (let b = 0; b < numBlocks; b++) {
    const len = Math.min(maxBlock, raw.length - rp);
    const isFinal = b === numBlocks - 1 ? 1 : 0;
    zlibBuf[zp++] = isFinal;
    zlibBuf[zp++] = len & 0xff;
    zlibBuf[zp++] = (len >>> 8) & 0xff;
    const nlen = (~len) & 0xffff;
    zlibBuf[zp++] = nlen & 0xff;
    zlibBuf[zp++] = (nlen >>> 8) & 0xff;
    zlibBuf.set(raw.subarray(rp, rp + len), zp);
    zp += len;
    rp += len;
  }
  writeU32BE(zlibBuf, zp, adler32(raw));

  const ihdr = new Uint8Array(13);
  writeU32BE(ihdr, 0, width);
  writeU32BE(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makePngChunk('IHDR', ihdr);
  const idatChunk = makePngChunk('IDAT', zlibBuf);
  const iendChunk = makePngChunk('IEND', new Uint8Array(0));

  const png = new Uint8Array(sig.length + ihdrChunk.length + idatChunk.length + iendChunk.length);
  let p = 0;
  png.set(sig, p); p += sig.length;
  png.set(ihdrChunk, p); p += ihdrChunk.length;
  png.set(idatChunk, p); p += idatChunk.length;
  png.set(iendChunk, p);

  return `data:image/png;base64,${bytesToBase64(png)}`;
}

// =========================================================================
// SWF Audio Tag Parsers: DefineSound (14) & StartSound (15)
// =========================================================================

const SOUND_RATES = [5512, 11025, 22050, 44100];

export function parseDefineSoundTag(
  payload: Uint8Array,
  startOffset: number,
  endOffset: number
): SwfSoundDef | null {
  if (endOffset - startOffset < 8) return null;
  const soundId = payload[startOffset] | (payload[startOffset + 1] << 8);
  const flags = payload[startOffset + 2];
  const fmt = (flags >>> 4) & 0x0f;
  const rateIdx = (flags >>> 2) & 0x03;
  const is16Bit = (flags >>> 1) & 0x01;
  const isStereo = flags & 0x01;
  const sampleCount =
    (payload[startOffset + 3] |
      (payload[startOffset + 4] << 8) |
      (payload[startOffset + 5] << 16) |
      (payload[startOffset + 6] << 24)) >>> 0;

  // Support 0=Uncompressed NE, 1=ADPCM, 2=MP3, 3=Uncompressed LE
  if (fmt > 3) return null;

  const dataStart = startOffset + 7;
  const dataLen = endOffset - dataStart;
  if (dataLen <= 0 || dataLen > MAX_SOUND_BYTES) return null;

  const audioBytes = payload.subarray(dataStart, endOffset);
  return {
    id: soundId,
    fmt,
    rate: SOUND_RATES[rateIdx] || 22050,
    s16: is16Bit,
    st: isStereo,
    sc: sampleCount,
    b64: bytesToBase64(audioBytes),
  };
}

export function parseStartSoundTag(
  payload: Uint8Array,
  startOffset: number,
  endOffset: number,
  currentFrame: number
): SwfStartSoundEvent | null {
  if (endOffset - startOffset < 3) return null;
  let pos = startOffset;
  const soundId = payload[pos] | (payload[pos + 1] << 8);
  pos += 2;
  const flags = payload[pos++];
  const syncStop = (flags & 0x20) !== 0;
  const syncNoMultiple = (flags & 0x10) !== 0;
  const hasEnvelope = (flags & 0x08) !== 0;
  const hasLoops = (flags & 0x04) !== 0;
  const hasOutPoint = (flags & 0x02) !== 0;
  const hasInPoint = (flags & 0x01) !== 0;

  if (hasInPoint) pos += 4;
  if (hasOutPoint) pos += 4;
  let loops = 1;
  if (hasLoops && pos + 2 <= endOffset) {
    loops = Math.max(1, payload[pos] | (payload[pos + 1] << 8));
    pos += 2;
  }
  if (hasEnvelope && pos < endOffset) {
    // Skip envelope records safely
    const envPoints = payload[pos++];
    pos += envPoints * 8;
  }

  const ev: SwfStartSoundEvent = { f: currentFrame, id: soundId };
  if (syncStop) ev.stop = 1;
  if (syncNoMultiple) ev.noMult = 1;
  if (loops > 1) ev.loops = loops;
  return ev;
}

// =========================================================================
// SWF Bitmap Tag Parsers: DefineBitsJPEG2/3 (21, 35) & Lossless/2 (20, 36)
// =========================================================================

export async function parseSwfBitmapTag(
  tagType: number,
  payload: Uint8Array,
  startOffset: number,
  endOffset: number,
  inflateFn: (compressed: Uint8Array) => Promise<Uint8Array>
): Promise<SwfBitmapDef | null> {
  if (endOffset - startOffset < 6) return null;
  const charId = payload[startOffset] | (payload[startOffset + 1] << 8);

  if (tagType === 21 || tagType === 35) {
    // DefineBitsJPEG2 (21) / DefineBitsJPEG3 (35)
    let imgStart = startOffset + 2;
    let imgEnd = endOffset;
    if (tagType === 35) {
      if (endOffset - startOffset < 6) return null;
      const alphaDataOffset =
        (payload[startOffset + 2] |
          (payload[startOffset + 3] << 8) |
          (payload[startOffset + 4] << 16) |
          (payload[startOffset + 5] << 24)) >>> 0;
      imgStart = startOffset + 6;
      imgEnd = Math.min(endOffset, imgStart + alphaDataOffset);
    }
    // Strip legacy SWF erroneous 4-byte EOI+SOI prefix (FF D9 FF D8)
    if (
      imgEnd - imgStart > 4 &&
      payload[imgStart] === 0xff &&
      payload[imgStart + 1] === 0xd9 &&
      payload[imgStart + 2] === 0xff &&
      payload[imgStart + 3] === 0xd8
    ) {
      imgStart += 4;
    }
    const len = imgEnd - imgStart;
    if (len < 4 || len > MAX_BITMAP_BYTES) return null;
    const slice = payload.subarray(imgStart, imgEnd);

    // Strictly validate real image header magic bytes
    let mime = '';
    if (slice[0] === 0xff && slice[1] === 0xd8) {
      mime = 'image/jpeg';
    } else if (slice[0] === 0x89 && slice[1] === 0x50 && slice[2] === 0x4e && slice[3] === 0x47) {
      mime = 'image/png';
    } else if (slice[0] === 0x47 && slice[1] === 0x49 && slice[2] === 0x46) {
      mime = 'image/gif';
    } else {
      return null;
    }
    return {
      id: charId,
      uri: `data:${mime};base64,${bytesToBase64(slice)}`,
    };
  }

  if (tagType === 20 || tagType === 36) {
    // DefineBitsLossless (20) / DefineBitsLossless2 (36)
    const isAlpha = tagType === 36;
    if (endOffset - startOffset < 8) return null;
    const format = payload[startOffset + 2];
    const width = payload[startOffset + 3] | (payload[startOffset + 4] << 8);
    const height = payload[startOffset + 5] | (payload[startOffset + 6] << 8);
    if (width <= 0 || height <= 0 || width * height > MAX_LOSSLESS_PIXELS) return null;

    let zStart = startOffset + 7;
    let colorTableSize = 0;
    if (format === 3) {
      if (zStart >= endOffset) return null;
      colorTableSize = payload[zStart++] + 1;
    }

    const compressed = payload.subarray(zStart, endOffset);
    if (compressed.length === 0 || compressed.length > MAX_BITMAP_BYTES) return null;

    let raw: Uint8Array;
    try {
      raw = await inflateFn(compressed);
    } catch {
      return null;
    }

    const rgba = new Uint8Array(width * height * 4);
    if (format === 3) {
      // 8-bit colormapped
      const entryBytes = isAlpha ? 4 : 3;
      const paletteLen = colorTableSize * entryBytes;
      const rowStride = (width + 3) & ~3; // 32-bit aligned rows
      let pixOff = paletteLen;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = raw[pixOff + x] || 0;
          const pOff = idx * entryBytes;
          const dOff = (y * width + x) * 4;
          if (isAlpha) {
            const a = raw[pOff + 3] ?? 255;
            if (a > 0 && a < 255) {
              rgba[dOff] = Math.min(255, Math.round((raw[pOff] * 255) / a));
              rgba[dOff + 1] = Math.min(255, Math.round((raw[pOff + 1] * 255) / a));
              rgba[dOff + 2] = Math.min(255, Math.round((raw[pOff + 2] * 255) / a));
            } else {
              rgba[dOff] = raw[pOff] || 0;
              rgba[dOff + 1] = raw[pOff + 1] || 0;
              rgba[dOff + 2] = raw[pOff + 2] || 0;
            }
            rgba[dOff + 3] = a;
          } else {
            rgba[dOff] = raw[pOff] || 0;
            rgba[dOff + 1] = raw[pOff + 1] || 0;
            rgba[dOff + 2] = raw[pOff + 2] || 0;
            rgba[dOff + 3] = 255;
          }
        }
        pixOff += rowStride;
      }
    } else if (format === 4 && !isAlpha) {
      // 15-bit RGB (big-endian PIX15, 32-bit padded rows)
      const rowStride = ((width * 2 + 3) & ~3);
      for (let y = 0; y < height; y++) {
        const rowOff = y * rowStride;
        for (let x = 0; x < width; x++) {
          const v = (raw[rowOff + x * 2] << 8) | raw[rowOff + x * 2 + 1];
          const dOff = (y * width + x) * 4;
          rgba[dOff] = ((v >>> 10) & 0x1f) * 8;
          rgba[dOff + 1] = ((v >>> 5) & 0x1f) * 8;
          rgba[dOff + 2] = (v & 0x1f) * 8;
          rgba[dOff + 3] = 255;
        }
      }
    } else if (format === 5) {
      // 32-bit XRGB (Lossless) or premultiplied ARGB (Lossless2)
      for (let i = 0; i < width * height; i++) {
        const sOff = i * 4;
        const dOff = i * 4;
        const a = isAlpha ? (raw[sOff] ?? 255) : 255;
        const r = raw[sOff + 1] || 0;
        const g = raw[sOff + 2] || 0;
        const b = raw[sOff + 3] || 0;
        if (isAlpha && a > 0 && a < 255) {
          rgba[dOff] = Math.min(255, Math.round((r * 255) / a));
          rgba[dOff + 1] = Math.min(255, Math.round((g * 255) / a));
          rgba[dOff + 2] = Math.min(255, Math.round((b * 255) / a));
        } else {
          rgba[dOff] = r;
          rgba[dOff + 1] = g;
          rgba[dOff + 2] = b;
        }
        rgba[dOff + 3] = a;
      }
    } else {
      return null;
    }

    return {
      id: charId,
      w: width,
      h: height,
      uri: encodeRgbaToPngDataUri(width, height, rgba),
    };
  }

  return null;
}
