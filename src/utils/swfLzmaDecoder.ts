/**
 * src/utils/swfLzmaDecoder.ts
 *
 * Zero-dependency, strictly bounds-checked Pure-TypeScript LZMA1 decoder (and ZWS SWF v13+ encoder)
 * for Adobe Flash `ZWS` (SWF v13+) binaries.
 *
 * SWF ZWS Binary Layout (Adobe SWF v13+ Spec):
 *   [0..2]   Signature: 'Z', 'W', 'S'
 *   [3]      Version (>= 13)
 *   [4..7]   Uncompressed SWF FileLength (UI32 LE, includes 8-byte SWF header)
 *   [8..11]  CompressedDataLength (UI32 LE, bytes of LZMA bitstream after 5-byte props)
 *   [12..16] LZMA Properties (1 byte lc/lp/pb + 4 byte UI32 LE dictSize)
 *   [17..]   LZMA1 Range-Coded Bitstream
 */

const MAX_ZWS_UNCOMPRESSED_BYTES = 32 * 1024 * 1024; // 32 MB safety cap
const MAX_ZWS_DICT_SIZE = 16 * 1024 * 1024; // 16 MB safety cap

const kNumBitModelTotalBits = 11;
const kBitModelTotal = 1 << kNumBitModelTotalBits; // 2048
const kNumMoveBits = 5;
const kTopMask = 0xff000000;

const kNumStates = 12;
const kNumPosSlotBits = 6;
const kStartPosModelIndex = 4;
const kEndPosModelIndex = 14;
const kNumFullDistances = 1 << (kEndPosModelIndex >> 1); // 128
const kNumAlignBits = 4;
const kAlignTableSize = 1 << kNumAlignBits; // 16
const kMatchMinLen = 2;
const kNumLenToPosStates = 4;
const kNumLowLenBits = 3;
const kNumMidLenBits = 3;
const kNumHighLenBits = 8;
const kNumLowLenSymbols = 1 << kNumLowLenBits; // 8
const kNumMidLenSymbols = 1 << kNumMidLenBits; // 8

function initProbs(len: number): Uint16Array {
  const arr = new Uint16Array(len);
  arr.fill(kBitModelTotal >>> 1); // 1024
  return arr;
}

class LzmaRangeDecoder {
  private buf: Uint8Array;
  private pos: number;
  private end: number;
  private range = 0xffffffff;
  private code = 0;

  constructor(buf: Uint8Array, startOffset: number, endOffset: number) {
    this.buf = buf;
    this.pos = startOffset;
    this.end = Math.min(buf.length, endOffset);
    if (this.pos + 5 > this.end) {
      throw new Error('ZWS LZMA stream truncated before 5-byte range header.');
    }
    // First byte of LZMA stream must be 0x00 (ignored per spec), next 4 bytes initialize code (big-endian)
    this.pos++;
    let c = 0;
    for (let i = 0; i < 4; i++) {
      c = ((c << 8) | this.readByte()) >>> 0;
    }
    this.code = c;
  }

  private readByte(): number {
    if (this.pos >= this.end) return 0;
    return this.buf[this.pos++];
  }

  private normalize(): void {
    if ((this.range & kTopMask) === 0) {
      this.range = (this.range << 8) >>> 0;
      this.code = ((this.code << 8) | this.readByte()) >>> 0;
    }
  }

  decodeBit(probs: Uint16Array, index: number): number {
    const prob = probs[index];
    const bound = (this.range >>> kNumBitModelTotalBits) * prob;
    if (this.code < bound) {
      this.range = bound >>> 0;
      probs[index] = prob + ((kBitModelTotal - prob) >>> kNumMoveBits);
      this.normalize();
      return 0;
    } else {
      this.range = (this.range - bound) >>> 0;
      this.code = (this.code - bound) >>> 0;
      probs[index] = prob - (prob >>> kNumMoveBits);
      this.normalize();
      return 1;
    }
  }

  decodeDirectBits(numBits: number): number {
    let res = 0;
    for (let i = numBits; i > 0; i--) {
      this.range = this.range >>> 1;
      const t = (this.code - this.range) >>> 31; // 1 if code < range, 0 if code >= range
      const bit = t ^ 1;
      if (bit) {
        this.code = (this.code - this.range) >>> 0;
      }
      res = (res << 1) | bit;
      this.normalize();
    }
    return res >>> 0;
  }

  decodeBitTree(probs: Uint16Array, offset: number, numBits: number): number {
    let m = 1;
    for (let i = 0; i < numBits; i++) {
      m = (m << 1) | this.decodeBit(probs, offset + m);
    }
    return m - (1 << numBits);
  }

  decodeReverseBitTree(probs: Uint16Array, offset: number, numBits: number): number {
    let m = 1;
    let symbol = 0;
    for (let i = 0; i < numBits; i++) {
      const bit = this.decodeBit(probs, offset + m);
      m = (m << 1) | bit;
      symbol |= bit << i;
    }
    return symbol;
  }
}

class LzmaLenDecoder {
  private choice = initProbs(2);
  private lowCoder: Uint16Array[];
  private midCoder: Uint16Array[];
  private highCoder = initProbs(1 << kNumHighLenBits);

  constructor(numPosStates: number) {
    this.lowCoder = [];
    this.midCoder = [];
    for (let i = 0; i < numPosStates; i++) {
      this.lowCoder.push(initProbs(1 << kNumLowLenBits));
      this.midCoder.push(initProbs(1 << kNumMidLenBits));
    }
  }

  decode(rc: LzmaRangeDecoder, posState: number): number {
    if (rc.decodeBit(this.choice, 0) === 0) {
      return rc.decodeBitTree(this.lowCoder[posState], 0, kNumLowLenBits);
    }
    if (rc.decodeBit(this.choice, 1) === 0) {
      return kNumLowLenSymbols + rc.decodeBitTree(this.midCoder[posState], 0, kNumMidLenBits);
    }
    return (
      kNumLowLenSymbols +
      kNumMidLenSymbols +
      rc.decodeBitTree(this.highCoder, 0, kNumHighLenBits)
    );
  }
}

/**
 * Decodes raw LZMA1 stream given 5-byte properties + expected uncompressed length.
 */
export function decodeLzma1Raw(
  props: Uint8Array,
  stream: Uint8Array,
  uncompressedLen: number
): Uint8Array {
  if (props.length < 5) {
    throw new Error('Invalid LZMA properties header (expected 5 bytes).');
  }
  if (uncompressedLen < 0 || uncompressedLen > MAX_ZWS_UNCOMPRESSED_BYTES) {
    throw new Error(`ZWS uncompressed length (${uncompressedLen} B) exceeds safety limit.`);
  }
  if (uncompressedLen === 0) return new Uint8Array(0);

  let d = props[0];
  if (d >= 9 * 5 * 5) {
    throw new Error(`Invalid LZMA property byte: ${d}`);
  }
  const lc = d % 9;
  d = Math.floor(d / 9);
  const lp = d % 5;
  const pb = Math.floor(d / 5);

  let dictSize =
    (props[1] | (props[2] << 8) | (props[3] << 16) | (props[4] << 24)) >>> 0;
  if (dictSize < 4096) dictSize = 4096;
  if (dictSize > MAX_ZWS_DICT_SIZE) {
    throw new Error(`ZWS LZMA dictionary size (${dictSize} B) exceeds 16 MB safety cap.`);
  }

  const numPosStates = 1 << pb;
  const posStateMask = numPosStates - 1;
  const lpMask = (1 << lp) - 1;

  const rc = new LzmaRangeDecoder(stream, 0, stream.length);
  const isMatch = initProbs(kNumStates << 4);
  const isRep = initProbs(kNumStates);
  const isRepG0 = initProbs(kNumStates);
  const isRepG1 = initProbs(kNumStates);
  const isRepG2 = initProbs(kNumStates);
  const isRep0Long = initProbs(kNumStates << 4);
  const posSlotDecoder: Uint16Array[] = [];
  for (let i = 0; i < kNumLenToPosStates; i++) {
    posSlotDecoder.push(initProbs(1 << kNumPosSlotBits));
  }
  const posDecoders = initProbs(1 + kNumFullDistances - kEndPosModelIndex);
  const posAlignDecoder = initProbs(kAlignTableSize);
  const lenDecoder = new LzmaLenDecoder(numPosStates);
  const repLenDecoder = new LzmaLenDecoder(numPosStates);
  const litProbs = initProbs(0x300 << (lc + lp));

  const out = new Uint8Array(uncompressedLen);
  let outPos = 0;
  let state = 0;
  let rep0 = 0;
  let rep1 = 0;
  let rep2 = 0;
  let rep3 = 0;

  while (outPos < uncompressedLen) {
    const posState = outPos & posStateMask;
    const matchIdx = (state << 4) + posState;

    if (rc.decodeBit(isMatch, matchIdx) === 0) {
      // Literal byte
      const prevByte = outPos > 0 ? out[outPos - 1] : 0;
      const litState = ((outPos & lpMask) << lc) + (prevByte >>> (8 - lc));
      const base = litState * 0x300;
      let symbol = 1;

      if (state >= 7) {
        let matchByte = outPos > rep0 ? out[outPos - rep0 - 1] : 0;
        do {
          const matchBit = (matchByte >>> 7) & 1;
          matchByte = (matchByte << 1) & 0xff;
          const bit = rc.decodeBit(litProbs, base + ((1 + matchBit) << 8) + symbol);
          symbol = (symbol << 1) | bit;
          if (matchBit !== bit) break;
        } while (symbol < 0x100);
      }
      while (symbol < 0x100) {
        symbol = (symbol << 1) | rc.decodeBit(litProbs, base + symbol);
      }
      out[outPos++] = symbol & 0xff;
      state = state < 4 ? 0 : state < 10 ? state - 3 : state - 6;
    } else {
      let len = 0;
      if (rc.decodeBit(isRep, state) === 1) {
        if (rc.decodeBit(isRepG0, state) === 0) {
          if (rc.decodeBit(isRep0Long, matchIdx) === 0) {
            // ShortRep (1 byte)
            state = state < 7 ? 9 : 11;
            const dist = rep0 + 1;
            if (dist > outPos) throw new Error('ZWS LZMA ShortRep distance out of bounds.');
            out[outPos] = out[outPos - dist];
            outPos++;
            continue;
          }
        } else {
          let dist = 0;
          if (rc.decodeBit(isRepG1, state) === 0) {
            dist = rep1;
          } else {
            if (rc.decodeBit(isRepG2, state) === 0) {
              dist = rep2;
            } else {
              dist = rep3;
              rep3 = rep2;
            }
            rep2 = rep1;
          }
          rep1 = rep0;
          rep0 = dist;
        }
        len = repLenDecoder.decode(rc, posState) + kMatchMinLen;
        state = state < 7 ? 8 : 11;
      } else {
        rep3 = rep2;
        rep2 = rep1;
        rep1 = rep0;
        len = lenDecoder.decode(rc, posState) + kMatchMinLen;
        state = state < 7 ? 7 : 10;
        const lenToPos = len - kMatchMinLen < kNumLenToPosStates ? len - kMatchMinLen : kNumLenToPosStates - 1;
        const posSlot = rc.decodeBitTree(posSlotDecoder[lenToPos], 0, kNumPosSlotBits);
        if (posSlot >= kStartPosModelIndex) {
          const numDirectBits = (posSlot >>> 1) - 1;
          rep0 = (2 | (posSlot & 1)) << numDirectBits;
          if (posSlot < kEndPosModelIndex) {
            rep0 += rc.decodeReverseBitTree(posDecoders, rep0 - posSlot, numDirectBits);
          } else {
            rep0 += rc.decodeDirectBits(numDirectBits - kNumAlignBits) << kNumAlignBits;
            rep0 += rc.decodeReverseBitTree(posAlignDecoder, 0, kNumAlignBits);
            if (rep0 === 0xffffffff) {
              // End-of-stream marker
              break;
            }
          }
        } else {
          rep0 = posSlot;
        }
      }

      const dist = rep0 + 1;
      if (dist > outPos || dist > dictSize) {
        throw new Error(`ZWS LZMA match distance (${dist}) exceeds history (${outPos}).`);
      }
      for (let i = 0; i < len && outPos < uncompressedLen; i++) {
        out[outPos] = out[outPos - dist];
        outPos++;
      }
    }
  }

  return out;
}

/**
 * Decompresses a full SWF `ZWS` binary into a standard uncompressed `FWS`-layout buffer
 * (preserving the 8-byte SWF header followed by the decompressed body).
 */
export function decompressZwsSwf(rawSwf: Uint8Array): Uint8Array {
  if (rawSwf.length < 22) {
    throw new Error('ZWS SWF binary is too short (minimum 22 bytes required).');
  }
  const fileLength =
    (rawSwf[4] | (rawSwf[5] << 8) | (rawSwf[6] << 16) | (rawSwf[7] << 24)) >>> 0;
  if (fileLength < 8 || fileLength > MAX_ZWS_UNCOMPRESSED_BYTES + 8) {
    throw new Error(`Invalid ZWS uncompressed fileLength: ${fileLength}`);
  }
  const compressedLen =
    (rawSwf[8] | (rawSwf[9] << 8) | (rawSwf[10] << 16) | (rawSwf[11] << 24)) >>> 0;
  const props = rawSwf.subarray(12, 17);
  const streamEnd = compressedLen > 0 ? Math.min(rawSwf.length, 17 + compressedLen) : rawSwf.length;
  const stream = rawSwf.subarray(17, streamEnd);
  const uncompressedBody = decodeLzma1Raw(props, stream, fileLength - 8);

  const out = new Uint8Array(8 + uncompressedBody.length);
  out.set(rawSwf.subarray(0, 8), 0);
  out.set(uncompressedBody, 8);
  return out;
}

// ---------------------------------------------------------------------------
// Spec-Valid LZMA1 Range Encoder (for generating real ZWS SWF v13+ test fixtures)
// ---------------------------------------------------------------------------
class LzmaRangeEncoder {
  public out: number[] = [];
  private low = 0n;
  private range = 0xffffffffn;
  private cacheSize = 1;
  private cache = 0;

  private shiftLow(): void {
    const lowHi = Number(this.low >> 32n);
    if (lowHi !== 0 || this.low < 0xff000000n) {
      let temp = this.cache;
      do {
        this.out.push((temp + lowHi) & 0xff);
        temp = 0xff;
      } while (--this.cacheSize !== 0);
      this.cache = Number((this.low >> 24n) & 0xffn);
    }
    this.cacheSize++;
    this.low = (this.low & 0xffffffn) << 8n;
  }

  encodeBit(probs: Uint16Array, index: number, bit: number): void {
    const prob = BigInt(probs[index]);
    const bound = (this.range >> BigInt(kNumBitModelTotalBits)) * prob;
    if (bit === 0) {
      this.range = bound;
      probs[index] = Number(prob + ((BigInt(kBitModelTotal) - prob) >> BigInt(kNumMoveBits)));
    } else {
      this.low += bound;
      this.range -= bound;
      probs[index] = Number(prob - (prob >> BigInt(kNumMoveBits)));
    }
    if ((this.range & BigInt(kTopMask)) === 0n) {
      this.range = (this.range << 8n) & 0xffffffffn;
      this.shiftLow();
    }
  }

  flush(): Uint8Array {
    for (let i = 0; i < 5; i++) this.shiftLow();
    return new Uint8Array(this.out);
  }
}

/**
 * Compresses an uncompressed `FWS` SWF binary into a spec-valid SWF v13+ `ZWS` LZMA binary.
 */
export function encodeFwsToZwsSwf(fwsSwf: Uint8Array, minVersion = 13): Uint8Array {
  if (fwsSwf.length < 8) throw new Error('Input FWS SWF is too short.');
  const body = fwsSwf.subarray(8);
  const lc = 3, lp = 0, pb = 2;
  const propsByte = (pb * 5 + lp) * 9 + lc;
  const dictSize = 65536;
  const posStateMask = (1 << pb) - 1;

  const isMatch = initProbs(kNumStates << 4);
  const litProbs = initProbs(0x300 << (lc + lp));
  const enc = new LzmaRangeEncoder();

  for (let i = 0; i < body.length; i++) {
    const posState = i & posStateMask;
    enc.encodeBit(isMatch, posState, 0); // state=0 literal
    const prevByte = i > 0 ? body[i - 1] : 0;
    const base = (prevByte >>> (8 - lc)) * 0x300;
    const b = body[i];
    let symbol = 1;
    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      const bit = (b >>> bitIdx) & 1;
      enc.encodeBit(litProbs, base + symbol, bit);
      symbol = (symbol << 1) | bit;
    }
  }
  const lzmaStream = enc.flush();

  const totalOut = 17 + lzmaStream.length;
  const out = new Uint8Array(totalOut);
  out[0] = 0x5a; // Z
  out[1] = 0x57; // W
  out[2] = 0x53; // S
  out[3] = Math.max(minVersion, fwsSwf[3]);
  // Uncompressed FileLength (UI32 LE)
  const fl = fwsSwf.length >>> 0;
  out[4] = fl & 0xff;
  out[5] = (fl >>> 8) & 0xff;
  out[6] = (fl >>> 16) & 0xff;
  out[7] = (fl >>> 24) & 0xff;
  // CompressedDataLength (UI32 LE)
  const cl = lzmaStream.length >>> 0;
  out[8] = cl & 0xff;
  out[9] = (cl >>> 8) & 0xff;
  out[10] = (cl >>> 16) & 0xff;
  out[11] = (cl >>> 24) & 0xff;
  // 5-byte LZMA properties
  out[12] = propsByte;
  out[13] = dictSize & 0xff;
  out[14] = (dictSize >>> 8) & 0xff;
  out[15] = (dictSize >>> 16) & 0xff;
  out[16] = (dictSize >>> 24) & 0xff;
  // LZMA bitstream
  out.set(lzmaStream, 17);
  return out;
}
