/**
 * src/utils/cartridgeStateHex.ts
 *
 * St Joseph's Educational Media Suite - Lean Hex State Persistence Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Sub-20-byte binary serialization for 60 FPS AST dynamic simulation state.
 * Encodes continuous simulation vectors into a compact 16-byte buffer (32 hex chars)
 * with zero memory allocations during animation loops.
 */

export interface CartridgeStateVector {
  version?: number;
  isPlaying?: boolean;
  balanced?: boolean;
  step?: number;
  t?: number;
  progress?: number;
  cartX?: number;
  x?: number;
  cartVx?: number;
  vx?: number;
  theta?: number;
  poleRad?: number;
  poleAngle?: number;
  omega?: number;
  poleOmega?: number;
  kp?: number;
  kd?: number;
  var1?: number;
  var2?: number;
}

const STATE_BUFFER_BYTES = 16;
const sharedBuffer = new ArrayBuffer(STATE_BUFFER_BYTES);
const sharedView = new DataView(sharedBuffer);
const sharedU8 = new Uint8Array(sharedBuffer);

const BYTE_TO_HEX: string[] = new Array(256);
const HEX_TO_BYTE: Record<string, number> = Object.create(null);
for (let i = 0; i < 256; i++) {
  const hex = i.toString(16).padStart(2, '0');
  BYTE_TO_HEX[i] = hex;
  HEX_TO_BYTE[hex] = i;
  HEX_TO_BYTE[hex.toUpperCase()] = i;
}

export const CartridgeStateHex = {
  SCHEMA_VERSION: 0x01,
  BUFFER_SIZE: STATE_BUFFER_BYTES,

  pack(state: CartridgeStateVector = {}): string {
    const v = sharedView;

    v.setUint8(0, this.SCHEMA_VERSION);
    let flags = (state.isPlaying ? 1 : 0) | ((state.balanced ? 1 : 0) << 1);
    if (typeof state.step === 'number') {
      flags |= ((state.step & 0x3f) << 2);
    }
    v.setUint8(1, flags);

    const t = Math.max(0, Math.min(1, Number(state.t ?? state.progress ?? 0)));
    v.setUint16(2, Math.round(t * 65535), false);

    const cartX = Math.max(-327.68, Math.min(327.67, Number(state.cartX ?? state.x ?? 0)));
    v.setInt16(4, Math.round(cartX * 100), false);

    const cartVx = Math.max(-32.768, Math.min(32.767, Number(state.cartVx ?? state.vx ?? 0)));
    v.setInt16(6, Math.round(cartVx * 1000), false);

    let theta = Number(state.poleRad ?? state.theta ?? 0);
    if (state.poleAngle !== undefined && state.poleRad === undefined) {
      theta = (Number(state.poleAngle) * Math.PI) / 180;
    }
    theta = Math.max(-3.1415, Math.min(3.1415, theta));
    v.setInt16(8, Math.round(theta * 10000), false);

    const omega = Math.max(-32.768, Math.min(32.767, Number(state.poleOmega ?? state.omega ?? 0)));
    v.setInt16(10, Math.round(omega * 1000), false);

    const var1 = Math.max(0, Math.min(65.535, Number(state.var1 ?? state.kp ?? 1.8)));
    v.setUint16(12, Math.round(var1 * 1000), false);

    const var2 = Math.max(0, Math.min(65.535, Number(state.var2 ?? state.kd ?? 0.6)));
    v.setUint16(14, Math.round(var2 * 1000), false);

    let hex = '';
    for (let i = 0; i < STATE_BUFFER_BYTES; i++) {
      hex += BYTE_TO_HEX[sharedU8[i]];
    }
    return hex;
  },

  unpack(hexStr: string): CartridgeStateVector | null {
    if (!hexStr || typeof hexStr !== 'string') return null;
    const clean = hexStr.trim().toLowerCase().replace(/^0x/, '');
    if (clean.length !== STATE_BUFFER_BYTES * 2) return null;

    for (let i = 0; i < STATE_BUFFER_BYTES; i++) {
      const pair = clean.substr(i * 2, 2);
      const b = HEX_TO_BYTE[pair];
      if (b === undefined) return null;
      sharedU8[i] = b;
    }

    const v = sharedView;
    const version = v.getUint8(0);
    if (version !== this.SCHEMA_VERSION) return null;

    const flags = v.getUint8(1);
    const isPlaying = (flags & 1) === 1;
    const balanced = ((flags >> 1) & 1) === 1;
    const step = (flags >> 2) & 0x3f;

    const t = v.getUint16(2, false) / 65535;
    const cartX = v.getInt16(4, false) / 100;
    const cartVx = v.getInt16(6, false) / 1000;
    const theta = v.getInt16(8, false) / 10000;
    const poleAngle = (theta * 180) / Math.PI;
    const omega = v.getInt16(10, false) / 1000;
    const var1 = v.getUint16(12, false) / 1000;
    const var2 = v.getUint16(14, false) / 1000;

    return {
      version,
      isPlaying,
      balanced,
      step,
      t,
      progress: t,
      cartX,
      cartVx,
      theta,
      poleRad: theta,
      poleAngle,
      omega,
      poleOmega: omega,
      kp: var1,
      kd: var2,
      var1,
      var2
    };
  },

  saveToHash(state: CartridgeStateVector): void {
    if (typeof window === 'undefined' || !window.location) return;
    const hex = this.pack(state);
    window.location.hash = `s=${hex}`;
  },

  loadFromHash(): CartridgeStateVector | null {
    if (typeof window === 'undefined' || !window.location || !window.location.hash) return null;
    const match = window.location.hash.match(/s=([a-f0-9]{32})/i);
    return match ? this.unpack(match[1]) : null;
  }
};
