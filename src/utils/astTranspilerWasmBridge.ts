/**
 * src/utils/astTranspilerWasmBridge.ts
 *
 * St Joseph's Educational Media Suite — Flash SWF & PhET Transpiler WASM Bridge for React/Vite
 * Conforms to docs/WASM_ARCHITECTURE_CONTRACT.md & docs/AST_PLAYER_SPECIFICATION.md
 */

import { AST_TRANSPILER_WASM_BASE64 } from '../../static/player/wasm/ast-transpiler-engine.bin.js';

export interface DecodedSwfHeader {
  signature: 'FWS' | 'CWS' | 'ZWS' | 'UNKNOWN';
  version: number;
  fileLength: number;
  width: number;
  height: number;
  frameRate: number;
  frameCount: number;
  headerLength: number;
}

export interface SwfTagScanResult {
  tagCount: number;
  shapeCount: number;
  morphCount: number;
  actionCount: number;
  bgColor: string;
}

export interface PhetScanResult {
  mask: number;
  isCircuit: boolean;
  isWave: boolean;
  propertyCount: number;
}

export class ASTTranspilerWasmBridgeReact {
  private static instance: ASTTranspilerWasmBridgeReact | null = null;
  public isReady = false;
  private exports: any = null;
  private memory: WebAssembly.Memory | null = null;
  private u8View: Uint8Array | null = null;
  private i32View: Int32Array | null = null;
  private f32View: Float32Array | null = null;

  private readonly STREAM_BUFFER_PTR = 0x010000;

  private constructor() {
    this.init().catch((err) => console.warn('[Transpiler WASM React Bridge] Init notice:', err));
  }

  public static getInstance(): ASTTranspilerWasmBridgeReact {
    if (!ASTTranspilerWasmBridgeReact.instance) {
      ASTTranspilerWasmBridgeReact.instance = new ASTTranspilerWasmBridgeReact();
      if (typeof window !== 'undefined') {
        (window as any).ASTTranspilerWasmBridge = ASTTranspilerWasmBridgeReact.instance;
      }
    }
    return ASTTranspilerWasmBridgeReact.instance;
  }

  public async init(): Promise<boolean> {
    if (this.isReady) return true;

    try {
      let binaryBytes: Uint8Array | null = null;

      // 1. Try fetching standalone .wasm binary with base-aware paths
      if (typeof fetch === 'function' && typeof window !== 'undefined' && window.location?.protocol !== 'file:') {
        const basePath = (window as any).__AST_BASE_URL__ || (window as any).__AST_ASSET_BASE__ || (import.meta.env?.BASE_URL || '/').replace(/\/?$/, '/');
        const cleanBase = basePath.endsWith('/') ? basePath : basePath + '/';
        const candidates = [
          `${cleanBase}static/player/wasm/ast-transpiler-engine.wasm`,
          `${cleanBase}player/wasm/ast-transpiler-engine.wasm`,
          './static/player/wasm/ast-transpiler-engine.wasm',
          './player/wasm/ast-transpiler-engine.wasm',
          './wasm/ast-transpiler-engine.wasm',
          '/player/wasm/ast-transpiler-engine.wasm',
        ];
        for (const url of candidates) {
          try {
            const resp = await fetch(url);
            if (resp.ok) {
              const ab = await resp.arrayBuffer();
              binaryBytes = new Uint8Array(ab);
              break;
            }
          } catch (_) {}
        }
      }

      // 2. Fallback to inlined base64 binary
      if (!binaryBytes || binaryBytes.length === 0) {
        if (typeof atob === 'function') {
          const binStr = atob(AST_TRANSPILER_WASM_BASE64);
          const len = binStr.length;
          binaryBytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            binaryBytes[i] = binStr.charCodeAt(i);
          }
        } else if (typeof Buffer !== 'undefined') {
          binaryBytes = Buffer.from(AST_TRANSPILER_WASM_BASE64, 'base64');
        }
      }

      const wasmResult: any = await WebAssembly.instantiate(binaryBytes!);
      const instance = wasmResult.instance || wasmResult;
      this.exports = instance.exports;
      this.memory = this.exports.memory;
      this.u8View = new Uint8Array(this.memory!.buffer);
      this.i32View = new Int32Array(this.memory!.buffer);
      this.f32View = new Float32Array(this.memory!.buffer);
      this.isReady = true;

      if (typeof window !== 'undefined') {
        (window as any).ASTTranspilerWasmBridge = this;
      }

      return true;
    } catch (err) {
      console.warn('WASM Transpiler React initialization notice, falling back to JS:', err);
      this.isReady = false;
      return false;
    }
  }

  public decodeSwfHeader(bytes: Uint8Array | ArrayBuffer): DecodedSwfHeader | null {
    if (!this.isReady || !this.exports || !this.memory) return null;
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (u8.length < 21) return null;

    const needed = this.STREAM_BUFFER_PTR + u8.length;
    if (this.memory.buffer.byteLength < needed) {
      const extraPages = Math.ceil((needed - this.memory.buffer.byteLength) / 65536);
      this.memory.grow(extraPages);
      this.u8View = new Uint8Array(this.memory.buffer);
      this.i32View = new Int32Array(this.memory.buffer);
      this.f32View = new Float32Array(this.memory.buffer);
    }

    this.u8View!.set(u8, this.STREAM_BUFFER_PTR);
    const ok = this.exports.decode_swf_header(this.STREAM_BUFFER_PTR, u8.length);
    if (!ok) return null;

    const sigCode = this.i32View![0];
    const signature = sigCode === 1 ? 'FWS' : sigCode === 2 ? 'CWS' : sigCode === 3 ? 'ZWS' : 'UNKNOWN';
    const version = this.i32View![1];
    const fileLength = this.i32View![2];
    const width = this.f32View![3];
    const height = this.f32View![4];
    const frameRate = this.f32View![5];
    const frameCount = this.i32View![6];
    const rectBytes = this.i32View![11];

    return {
      signature,
      version,
      fileLength,
      width,
      height,
      frameRate,
      frameCount,
      headerLength: 8 + rectBytes + 4,
    };
  }

  public scanSwfTags(bytes: Uint8Array | ArrayBuffer, startOffset = 21): SwfTagScanResult | null {
    if (!this.isReady || !this.exports || !this.memory) return null;
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const needed = this.STREAM_BUFFER_PTR + u8.length;
    if (this.memory.buffer.byteLength < needed) {
      const extraPages = Math.ceil((needed - this.memory.buffer.byteLength) / 65536);
      this.memory.grow(extraPages);
      this.u8View = new Uint8Array(this.memory.buffer);
      this.i32View = new Int32Array(this.memory.buffer);
      this.f32View = new Float32Array(this.memory.buffer);
    }

    this.u8View!.set(u8, this.STREAM_BUFFER_PTR);
    const tagCount = this.exports.scan_swf_tags(this.STREAM_BUFFER_PTR, startOffset, u8.length);

    return {
      tagCount,
      shapeCount: this.i32View![7],
      morphCount: this.i32View![8],
      actionCount: this.i32View![9],
      bgColor: '#' + (this.i32View![10] & 0xFFFFFF).toString(16).padStart(6, '0'),
    };
  }

  public scanPhetStream(content: string | Uint8Array): PhetScanResult | null {
    if (!this.isReady || !this.exports || !this.memory) return null;

    const u8 = typeof content === 'string'
      ? new TextEncoder().encode(content)
      : content instanceof Uint8Array
      ? content
      : new Uint8Array(content);

    const needed = this.STREAM_BUFFER_PTR + u8.length;
    if (this.memory.buffer.byteLength < needed) {
      const extraPages = Math.ceil((needed - this.memory.buffer.byteLength) / 65536);
      this.memory.grow(extraPages);
      this.u8View = new Uint8Array(this.memory.buffer);
      this.i32View = new Int32Array(this.memory.buffer);
      this.f32View = new Float32Array(this.memory.buffer);
    }

    this.u8View!.set(u8, this.STREAM_BUFFER_PTR);
    const mask = this.exports.scan_phet_stream(this.STREAM_BUFFER_PTR, u8.length);
    const propCount = this.i32View![13];

    return {
      mask,
      isCircuit: (mask & 1) !== 0,
      isWave: (mask & 2) !== 0,
      propertyCount: propCount,
    };
  }

  public computeCompressionRatio(origBytes: number, distilledBytes: number): number {
    if (this.isReady && this.exports) {
      return this.exports.compute_compression_ratio(origBytes, distilledBytes);
    }
    if (origBytes <= 0) return 0;
    return ((origBytes - distilledBytes) / origBytes) * 100;
  }
}

export const transpilerWasm = ASTTranspilerWasmBridgeReact.getInstance();
