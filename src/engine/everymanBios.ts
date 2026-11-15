// src/engine/everymanBios.ts
/**
 * Everyman Chassis JS "BIOS" Shim & Dumb Display-List Blitter
 *
 * Strictly domain-agnostic (~2 KB runtime kernel interface):
 *   1. Instantiates the fixed 7-page (448 KiB) WebAssembly core (ast-wasm-engine).
 *   2. Copies any binary .astb cartridge into the 48 KiB Cartridge Slot (0x04000).
 *   3. Calls wasm.boot_cartridge(), reads the zero-copy 3-column Gemini Nano/WebMCP
 *      Manifest at 0x00C00 and live 16-byte StateHex register at 0x00088.
 *   4. Writes raw pointer / keyboard / AI tuple interrupts into the 16-byte Mailbox
 *      (0x00000) and calls wasm.tick(dtMs).
 *   5. Blits the flat 32-byte VGA/Vector Display List (0x068000) onto <canvas>
 *      via CanvasRenderingContext2D with ZERO domain logic in JS.
 */

import { getWasmBinaryBytes } from '../../static/player/wasm/ast-wasm-engine.bin.js';

export const WASM_MAX_PAGES = 7;
export const WASM_MAX_BYTES = WASM_MAX_PAGES * 65536; // 458,752 B = 448 KiB
export const BIOS_CARTRIDGE_SLOT_PTR = 0x04000;
export const BIOS_CARTRIDGE_SLOT_MAX = 0x0C000; // 49,152 B (0x04000..0x0FFFF)

export type StageStateName = 'offstage' | 'docked' | 'focused';
export type TupleKindName = 'var' | 'input' | 'gesture' | 'checkpoint' | 'keyframe' | 'scene';

export const TupleOp = {
  FOCUS: 1,
  DOCK: 2,
  OFFSTAGE: 3,
  SET_VAL: 4,
  RESET: 5,
  TOGGLE_PLAY: 6,
  SET_T: 7,
} as const;

export const DisplayOp = {
  END_FRAME: 0,
  CLEAR_RECT: 1,
  FILL_RECT: 2,
  STROKE_RECT: 3,
  CIRCLE: 4,
  TEXT: 5,
  LINE: 6,
  PROGRESS_BAR: 7,
} as const;

export interface BiosManifestRow {
  slotId: number;
  stageState: StageStateName;
  kind: TupleKindName;
  semanticTag: string;
  payload: string;
  value: number;
  min: number;
  max: number;
}

export interface BiosKernelTelemetry {
  linearMemoryBytes: number;
  linearMemoryPages: number;
  tickCount: number;
  t: number;
  elapsedSec: number;
  durationSec: number;
  archetype: number;
  isPlaying: boolean;
  tupleCount: number;
  manifestCount: number;
  varCount: number;
  hitboxCount: number;
  displayListCount: number;
  cartridgeBytes: number;
  focusedSlot: number;
  stateHex: string;
  hasEmbeddedSvg: boolean;
}

const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

const KIND_NAMES: Record<number, TupleKindName> = {
  1: 'var',
  2: 'input',
  3: 'gesture',
  4: 'checkpoint',
  5: 'keyframe',
  6: 'scene',
};

const STATE_NAMES: Record<number, StageStateName> = {
  0: 'offstage',
  1: 'docked',
  2: 'focused',
};

export class EverymanBios {
  private memory!: WebAssembly.Memory;
  private exports: any = null;
  private u8!: Uint8Array;
  private dv!: DataView;
  private rafId: number | null = null;
  private lastTickMs = 0;

  public ready = false;

  public async init(): Promise<void> {
    if (this.ready) return;
    const wasmBytes = getWasmBinaryBytes();
    const result: any = await WebAssembly.instantiate(wasmBytes as BufferSource);
    const instance = result.instance || result;
    this.exports = instance.exports;
    this.memory = this.exports.memory as WebAssembly.Memory;

    if (this.memory.buffer.byteLength !== WASM_MAX_BYTES) {
      throw new Error(
        `[EverymanBIOS] Memory invariant violated: expected ${WASM_MAX_BYTES} B (7 pages), got ${this.memory.buffer.byteLength} B`
      );
    }

    this.u8 = new Uint8Array(this.memory.buffer);
    this.dv = new DataView(this.memory.buffer);
    this.ready = true;
  }

  /**
   * Copies an `.astb` binary into the fixed 48 KiB Cartridge Slot (`0x04000`).
   * Zero JS parsing — delegates 100% of string indexing, tuple allocation, and manifest
   * construction to `wasm.boot_cartridge(ptr, len)`.
   */
  public bootCartridge(astbBytes: Uint8Array): { status: number; manifest: BiosManifestRow[]; telemetry: BiosKernelTelemetry } {
    if (!this.ready) {
      throw new Error('[EverymanBIOS] Call init() before bootCartridge()');
    }

    // If a Duo cartridge contains a large companion SVG (>48 KiB), boot its compacted
    // header+bytecode view into Page 0 while keeping SVG stage intact for host SVG layer.
    let payload = astbBytes;
    if (payload.byteLength > BIOS_CARTRIDGE_SLOT_MAX) {
      payload = stripOversizedSvgFromAstb(payload);
    }
    if (payload.byteLength > BIOS_CARTRIDGE_SLOT_MAX) {
      throw new Error(
        `[EverymanBIOS] Cartridge bytecode (${payload.byteLength} B) exceeds 48 KiB Cartridge Slot (${BIOS_CARTRIDGE_SLOT_MAX} B)`
      );
    }

    this.u8.fill(0, BIOS_CARTRIDGE_SLOT_PTR, BIOS_CARTRIDGE_SLOT_PTR + BIOS_CARTRIDGE_SLOT_MAX);
    this.u8.set(payload, BIOS_CARTRIDGE_SLOT_PTR);

    const status: number = this.exports.boot_cartridge(BIOS_CARTRIDGE_SLOT_PTR, payload.byteLength);
    if (status !== 0) {
      throw new Error(`[EverymanBIOS] boot_cartridge() rejected binary with error code ${status}`);
    }

    return {
      status,
      manifest: this.readManifest(),
      telemetry: this.readTelemetry(),
    };
  }

  public tick(dtMs = 16.6667): number {
    if (!this.ready) return 0;
    return this.exports.tick(dtMs);
  }

  public dispatchTuple(slotId: number, op: number, arg1 = 0, arg2 = 0): number {
    if (!this.ready) return -1;
    return this.exports.dispatch_tuple(slotId, op, arg1, arg2);
  }

  public pointerEvent(phase: 0 | 1 | 2, stageX: number, stageY: number, buttons = 0): number {
    if (!this.ready) return -1;
    return this.exports.pointer_event(phase, stageX, stageY, buttons);
  }

  public keyEvent(phase: 0 | 1 | 2, keyCode: number, mods = 0): number {
    if (!this.ready) return -1;
    return this.exports.key_event(phase, keyCode, mods);
  }

  public readStateHex(): string {
    if (!this.ready) return '0'.repeat(32);
    const ptr: number = this.exports.get_state_hex_ptr();
    let hex = '';
    for (let i = 0; i < 16; i++) {
      hex += this.u8[ptr + i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  /**
   * Reads the 3-column Gemini Nano / WebMCP Manifest Table straight from WASM linear memory
   * at `get_manifest_ptr()` (`0x00C00`).
   */
  public readManifest(): BiosManifestRow[] {
    if (!this.ready) return [];
    const base: number = this.exports.get_manifest_ptr();
    const count = this.dv.getUint32(base + 0, true);
    const stride = this.dv.getUint32(base + 4, true) || 32;
    const tablePtr = this.dv.getUint32(base + 8, true) || (base + 16);

    const rows: BiosManifestRow[] = [];
    for (let i = 0; i < count; i++) {
      const p = tablePtr + i * stride;
      const slotId = this.dv.getUint16(p + 0, true);
      const st = this.u8[p + 2];
      const kd = this.u8[p + 3];
      const tagPtr = this.dv.getUint32(p + 4, true);
      const tagLen = this.dv.getUint32(p + 8, true);
      const payPtr = this.dv.getUint32(p + 12, true);
      const payLen = this.dv.getUint32(p + 16, true);
      const value = this.dv.getFloat32(p + 20, true);
      const min = this.dv.getFloat32(p + 24, true);
      const max = this.dv.getFloat32(p + 28, true);

      rows.push({
        slotId,
        stageState: STATE_NAMES[st] || 'offstage',
        kind: KIND_NAMES[kd] || 'var',
        semanticTag: this.decodeUtf8(tagPtr, tagLen),
        payload: this.decodeUtf8(payPtr, payLen),
        value,
        min,
        max,
      });
    }
    return rows;
  }

  public readTelemetry(): BiosKernelTelemetry {
    const m = 0x00010; // MCB_BASE
    const flags = this.dv.getUint32(m + 28, true);
    const svgPtr = this.dv.getUint32(m + 140, true);
    const svgLen = this.dv.getUint32(m + 144, true);
    return {
      linearMemoryBytes: this.memory.buffer.byteLength,
      linearMemoryPages: this.memory.buffer.byteLength / 65536,
      tickCount: this.dv.getUint32(m + 8, true),
      t: Number(this.dv.getFloat32(m + 12, true).toFixed(4)),
      elapsedSec: Number(this.dv.getFloat32(m + 16, true).toFixed(3)),
      durationSec: Number(this.dv.getFloat32(m + 20, true).toFixed(2)),
      archetype: this.dv.getUint32(m + 24, true),
      isPlaying: Boolean(flags & 0x20000),
      tupleCount: this.dv.getUint32(m + 40, true),
      manifestCount: this.dv.getUint32(m + 44, true),
      varCount: this.dv.getUint32(m + 48, true),
      hitboxCount: this.dv.getUint32(m + 52, true),
      displayListCount: this.dv.getUint32(m + 56, true),
      cartridgeBytes: this.dv.getUint32(m + 60, true),
      focusedSlot: this.dv.getInt32(m + 76, true),
      stateHex: this.readStateHex(),
      hasEmbeddedSvg: svgPtr > 0 && svgLen > 0,
    };
  }

  /**
   * Reads OP_SVG_COMPANION UTF-8 string directly from WASM linear memory if embedded.
   */
  public readEmbeddedSvg(): string {
    if (!this.ready) return '';
    const m = 0x00010;
    const svgPtr = this.dv.getUint32(m + 140, true);
    const svgLen = this.dv.getUint32(m + 144, true);
    if (!svgPtr || !svgLen) return '';
    return this.decodeUtf8(svgPtr, svgLen);
  }

  /**
   * Dumb VGA/Vector Display-List Blitter (`0x068000`) -> `CanvasRenderingContext2D`.
   * Interprets zero domain semantics; only executes flat 32-byte draw opcodes.
   */
  public blitDisplayList(ctx: CanvasRenderingContext2D): number {
    if (!this.ready) return 0;
    const dlPtr: number = this.exports.get_display_list_ptr();
    const maxCmds = 768;
    let count = 0;

    for (let i = 0; i < maxCmds; i++) {
      const p = dlPtr + i * 32;
      const op = this.dv.getUint32(p + 0, true);
      if (op === DisplayOp.END_FRAME) break;
      count++;

      const slotAndLen = this.dv.getUint32(p + 4, true);
      const x = this.dv.getFloat32(p + 8, true);
      const y = this.dv.getFloat32(p + 12, true);
      const w = this.dv.getFloat32(p + 16, true);
      const h = this.dv.getFloat32(p + 20, true);
      const rgba = this.dv.getUint32(p + 24, true);
      const strPtr = this.dv.getUint32(p + 28, true);

      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      const a = (rgba & 0xff) / 255;
      const fill = `rgba(${r},${g},${b},${a.toFixed(3)})`;

      if (op === DisplayOp.CLEAR_RECT || op === DisplayOp.FILL_RECT) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
      } else if (op === DisplayOp.STROKE_RECT) {
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
      } else if (op === DisplayOp.CIRCLE) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, w), 0, Math.PI * 2);
        ctx.fill();
      } else if (op === DisplayOp.TEXT && strPtr > 0) {
        const strLen = (slotAndLen >>> 16) & 0xffff;
        const txt = this.decodeUtf8(strPtr, strLen);
        ctx.fillStyle = fill;
        ctx.font = `700 ${Math.max(10, Math.round(w || 13))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillText(txt, x, y);
      } else if (op === DisplayOp.LINE) {
        ctx.strokeStyle = fill;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(w, h);
        ctx.stroke();
      }
    }
    return count;
  }

  /**
   * Starts a 60 FPS headless requestAnimationFrame BIOS loop driving a <canvas>.
   */
  public startCanvasLoop(
    canvas: HTMLCanvasElement,
    onFrame?: (telemetry: BiosKernelTelemetry) => void
  ): () => void {
    this.stopCanvasLoop();
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const onPointer = (phase: 0 | 1 | 2) => (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const sx = ((ev.clientX - rect.left) / rect.width) * 800;
      const sy = ((ev.clientY - rect.top) / rect.height) * 480;
      this.pointerEvent(phase, sx, sy, ev.buttons || (phase === 1 ? 1 : 0));
    };

    const handleDown = onPointer(1);
    const handleMove = onPointer(0);
    const handleUp = onPointer(2);
    canvas.addEventListener('pointerdown', handleDown);
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleUp);

    this.lastTickMs = performance.now();
    const step = (now: number) => {
      const dt = Math.min(50, Math.max(1, now - this.lastTickMs));
      this.lastTickMs = now;
      this.tick(dt);
      this.blitDisplayList(ctx);
      if (onFrame) onFrame(this.readTelemetry());
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);

    return () => {
      this.stopCanvasLoop();
      canvas.removeEventListener('pointerdown', handleDown);
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleUp);
    };
  }

  public stopCanvasLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private decodeUtf8(ptr: number, len: number): string {
    if (!ptr || !len || ptr < 0 || ptr + len > this.u8.length) return '';
    return utf8Decoder.decode(this.u8.subarray(ptr, ptr + len));
  }
}

/**
 * Strips OP_SVG_COMPANION bytes when a Duo `.astb` exceeds the 48 KiB WASM Cartridge Slot,
 * preserving the entire instruction stream + strings safely inside `0x04000..0x0FFFF`.
 */
function stripOversizedSvgFromAstb(bytes: Uint8Array): Uint8Array {
  if (bytes.byteLength < 16) return bytes;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const strCount = dv.getUint16(8, true);
  const strByteLen = dv.getUint32(10, true);
  const opsOffset = 16 + strByteLen;
  if (opsOffset >= bytes.byteLength) return bytes;

  // Locate OP_SVG_COMPANION right after OP_SCENE_META (1 + 9 bytes = +10)
  let svgStrIdx = -1;
  let opPos = opsOffset;
  if (bytes[opPos] === 0x01) {
    opPos += 10;
    if (bytes[opPos] === 0x81) {
      svgStrIdx = dv.getUint16(opPos + 1, true);
    }
  }
  if (svgStrIdx < 0) return bytes;

  // Rebuild buffer replacing that single string entry with "" and dropping 3-byte 0x81 op
  const chunks: Uint8Array[] = [];
  let cursor = 16;
  let newStrByteLen = 0;
  for (let i = 0; i < strCount && cursor < opsOffset; i++) {
    const l = dv.getUint16(cursor, true);
    cursor += 2;
    const entry = i === svgStrIdx ? new Uint8Array(0) : bytes.subarray(cursor, cursor + l);
    const wrapped = new Uint8Array(2 + entry.length);
    new DataView(wrapped.buffer).setUint16(0, entry.length, true);
    wrapped.set(entry, 2);
    chunks.push(wrapped);
    newStrByteLen += wrapped.length;
    cursor += l;
  }

  const headOps = bytes.subarray(opsOffset, opPos);
  const tailOps = bytes.subarray(opPos + 3);
  const out = new Uint8Array(16 + newStrByteLen + headOps.length + tailOps.length);
  out.set(bytes.subarray(0, 16), 0);
  const outDv = new DataView(out.buffer);
  outDv.setUint32(10, newStrByteLen, true);
  outDv.setUint16(14, dv.getUint16(14, true) & ~0x0010, true);
  let pos = 16;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  out.set(headOps, pos);
  out.set(tailOps, pos + headOps.length);
  return out;
}
