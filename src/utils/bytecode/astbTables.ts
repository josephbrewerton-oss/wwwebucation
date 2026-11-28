// src/utils/bytecode/astbTables.ts
/**
 * AST Vector Bytecode (.astb) String Table, Vector Dictionary & Path Helpers.
 */

import {
  ASTB_MAGIC,
  type AstVectorDictionary,
  type AstVectorPathCmd,
  type AstVectorRgba,
} from './astbSchema';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: false });

/**
 * Parses an absolute SVG path string (M, L, Q, C, H, V, Z) into compact AstVectorPathCmd[].
 */
export function encodeSvgPathToVectorCmds(d: string): AstVectorPathCmd[] {
  const cmds: AstVectorPathCmd[] = [];
  if (!d) return cmds;
  const tokens = d.match(/[MLQCHVZmlqchvz]|-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || [];
  let cmd = 'M';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let i = 0;
  const num = () => Number(tokens[i++]) || 0;

  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd === 'Z' || cmd === 'z') {
        cmds.push({ op: 'Z' });
        cx = sx;
        cy = sy;
      }
      continue;
    }
    if (cmd === 'M' || cmd === 'm') {
      const nx = cmd === 'm' ? cx + num() : num();
      const ny = cmd === 'm' ? cy + num() : num();
      cx = nx; cy = ny; sx = nx; sy = ny;
      cmds.push({ op: 'M', x: nx, y: ny });
      cmd = cmd === 'm' ? 'l' : 'L';
    } else if (cmd === 'L' || cmd === 'l') {
      const nx = cmd === 'l' ? cx + num() : num();
      const ny = cmd === 'l' ? cy + num() : num();
      cx = nx; cy = ny;
      cmds.push({ op: 'L', x: nx, y: ny });
    } else if (cmd === 'H' || cmd === 'h') {
      const nx = cmd === 'h' ? cx + num() : num();
      cx = nx;
      cmds.push({ op: 'L', x: cx, y: cy });
    } else if (cmd === 'V' || cmd === 'v') {
      const ny = cmd === 'v' ? cy + num() : num();
      cy = ny;
      cmds.push({ op: 'L', x: cx, y: cy });
    } else if (cmd === 'Q' || cmd === 'q') {
      const qx = cmd === 'q' ? cx + num() : num();
      const qy = cmd === 'q' ? cy + num() : num();
      const nx = cmd === 'q' ? cx + num() : num();
      const ny = cmd === 'q' ? cy + num() : num();
      cx = nx; cy = ny;
      cmds.push({ op: 'Q', cx: qx, cy: qy, x: nx, y: ny });
    } else if (cmd === 'C' || cmd === 'c') {
      const x1 = cmd === 'c' ? cx + num() : num();
      const y1 = cmd === 'c' ? cy + num() : num();
      const x2 = cmd === 'c' ? cx + num() : num();
      const y2 = cmd === 'c' ? cy + num() : num();
      const nx = cmd === 'c' ? cx + num() : num();
      const ny = cmd === 'c' ? cy + num() : num();
      cx = nx; cy = ny;
      cmds.push({ op: 'C', x1, y1, x2, y2, x: nx, y: ny });
    } else {
      i++;
    }
  }
  return cmds;
}

function rgbaToHex(c: AstVectorRgba): string {
  const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`;
}

function fmtDeci(v: number): string {
  const r = Number(v.toFixed(1));
  return Object.is(r, -0) ? '0' : String(r);
}

/**
 * Hydrates a decoded binary .astb VectorDictionary (OP_STYLE_TABLE + OP_SHAPE_DEF + OP_STAMP)
 * into pure W3C SVG DOM markup (<defs> + instanced <use transform="matrix(...)"/>) with zero JSON.parse.
 */
export function hydrateVectorDictionaryToSvg(dict: AstVectorDictionary, viewBox?: string): string {
  const vb = viewBox || dict.viewBox || '0 0 800 480';
  const defsParts: string[] = [];

  for (const st of dict.styles) {
    if (st.kind === 'linear') {
      const stops = st.stops
        .map((s) => {
          const op = s.color.a < 255 ? ` stop-opacity="${(s.color.a / 255).toFixed(2)}"` : '';
          return `<stop offset="${Math.round(s.offset * 100)}%" stop-color="${rgbaToHex(s.color)}"${op}/>`;
        })
        .join('');
      defsParts.push(
        `<linearGradient id="${st.id}" x1="${st.x1}" y1="${st.y1}" x2="${st.x2}" y2="${st.y2}">${stops}</linearGradient>`
      );
    } else if (st.kind === 'radial') {
      const stops = st.stops
        .map((s) => {
          const op = s.color.a < 255 ? ` stop-opacity="${(s.color.a / 255).toFixed(2)}"` : '';
          return `<stop offset="${Math.round(s.offset * 100)}%" stop-color="${rgbaToHex(s.color)}"${op}/>`;
        })
        .join('');
      defsParts.push(
        `<radialGradient id="${st.id}" cx="${st.cx}" cy="${st.cy}" r="${st.r}" fx="${st.fx}" fy="${st.fy}">${stops}</radialGradient>`
      );
    }
  }

  for (const sh of dict.shapes) {
    const layerXml = sh.layers
      .map((layer) => {
        const dParts: string[] = [];
        for (const c of layer.commands) {
          if (c.op === 'M') dParts.push(`M${fmtDeci(c.x)} ${fmtDeci(c.y)}`);
          else if (c.op === 'L') dParts.push(`L${fmtDeci(c.x)} ${fmtDeci(c.y)}`);
          else if (c.op === 'Q') dParts.push(`Q${fmtDeci(c.cx)} ${fmtDeci(c.cy)} ${fmtDeci(c.x)} ${fmtDeci(c.y)}`);
          else if (c.op === 'C') dParts.push(`C${fmtDeci(c.x1)} ${fmtDeci(c.y1)} ${fmtDeci(c.x2)} ${fmtDeci(c.y2)} ${fmtDeci(c.x)} ${fmtDeci(c.y)}`);
          else if (c.op === 'Z') dParts.push('Z');
        }
        let fillAttr = ' fill="none"';
        if (layer.fillStyle !== undefined && layer.fillStyle >= 0 && layer.fillStyle < dict.styles.length) {
          const fs = dict.styles[layer.fillStyle];
          if (fs.kind === 'solid') {
            fillAttr = ` fill="${rgbaToHex(fs.color)}"${fs.color.a < 255 ? ` fill-opacity="${(fs.color.a / 255).toFixed(2)}"` : ''}`;
          } else {
            fillAttr = ` fill="url(#${fs.id})"`;
          }
        }
        let strokeAttr = '';
        if (layer.strokeStyle !== undefined && layer.strokeStyle >= 0 && layer.strokeStyle < dict.styles.length) {
          const ss = dict.styles[layer.strokeStyle];
          const sw = layer.strokeWidth ?? 1;
          const colorStr = ss.kind === 'solid' ? rgbaToHex(ss.color) : `url(#${ss.id})`;
          const sop = ss.kind === 'solid' && ss.color.a < 255 ? ` stroke-opacity="${(ss.color.a / 255).toFixed(2)}"` : '';
          strokeAttr = ` stroke="${colorStr}"${sop} stroke-width="${fmtDeci(sw)}"`;
          if (layer.roundCap) strokeAttr += ' stroke-linecap="round"';
          if (layer.roundJoin) strokeAttr += ' stroke-linejoin="round"';
        }
        const eo = layer.evenOdd ? ' fill-rule="evenodd"' : '';
        const ah = layer.ariaHidden ? ' aria-hidden="true"' : '';
        return `<path d="${dParts.join('')}"${fillAttr}${strokeAttr}${eo}${ah}/>`;
      })
      .join('');
    defsParts.push(`<g id="${sh.id}">${layerXml}</g>`);
  }

  const sortedStamps = dict.stamps.slice().sort((a, b) => a.depth - b.depth);
  const stampXml = sortedStamps
    .map((st) => {
      const idAttr = st.instanceId ? ` id="${st.instanceId}"` : '';
      const m = st.matrix.map((n) => Number(n.toFixed(3))).join(' ');
      const op = st.opacity !== undefined && st.opacity < 0.999 ? ` opacity="${Number(st.opacity.toFixed(2))}"` : '';
      const ah = st.ariaHidden ? ' aria-hidden="true"' : '';
      return `<use${idAttr} href="#${st.symbolId}" transform="matrix(${m})"${op}${ah}/>`;
    })
    .join('');

  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><defs>${defsParts.join('')}</defs>${stampXml}</svg>`;
}

/**
 * Checks whether an ArrayBuffer or Uint8Array starts with the ASTB magic header.
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
 * String Table Interning Builder.
 */
export class StringTableBuilder {
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
 * Reads a serialized String Table from an ArrayBuffer.
 */
export class StringTableReader {
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
 * Normalizes unrolled loop index division literals inside :3d-line expressions
 * (e.g. `(/ 0 18)`..`(/ 17 18)` -> `(/ splineIndex 18)` or `(0/18)` -> `(splineIndex / 18)`)
 * when `splineIndex` is present so all rungs share a single deduplicated expression
 * string in the .astb string table.
 */
export function normalizeSplineIndexExpr(expr: any, splineIndex: number | undefined, fallback = '0'): string {
  if (expr === null || expr === undefined || expr === '') return fallback;
  const raw = String(expr);
  if (splineIndex === undefined || splineIndex === null || !Number.isFinite(splineIndex)) {
    return raw;
  }
  const idx = Math.trunc(splineIndex);
  if (idx < 0 || idx >= 0xffff) return raw;
  return raw
    .replace(new RegExp(`\\(\\s*\\/\\s*${idx}\\s+(\\d+(?:\\.\\d+)?)\\s*\\)`, 'g'), '(/ splineIndex $1)')
    .replace(new RegExp(`\\(\\s*${idx}\\s*\\/\\s*(\\d+(?:\\.\\d+)?)\\s*\\)`, 'g'), '(splineIndex / $1)');
}
