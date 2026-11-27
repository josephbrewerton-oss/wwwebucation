// src/utils/svgCraftKit.ts
/**
 * Flash-Grade Vector Craft Kit for Native .ast / .astb Cartridges
 *
 * Brings classic Flash visual polish (off-center focal radial gradients, clipped cel-shading
 * crescents, variable-width inked ribbons, <defs>/<use> instancing, and 6-float affine
 * squash-and-stretch matrix bindings) to pure W3C SVG cartridges with ZERO GPU blur filters
 * and minimal byte overhead (< 1 KB gzipped).
 */

export interface FocalGradientSpec {
  id: string;
  stops: Array<{ offset: string; color: string; opacity?: number }>;
  cx?: string;
  cy?: string;
  r?: string;
  fx?: string;
  fy?: string;
}

export interface CelShadedSpec {
  id: string;
  basePath: string;
  baseFill: string;
  shadowPath?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  highlightPath?: string;
  highlightColor?: string;
  highlightOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface SymbolStampSpec {
  href: string;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  rotateDeg?: number;
  opacity?: number;
  id?: string;
}

export const SVG_CRAFT_PALETTE = {
  atmospheric: {
    skyTop: '#0369a1',
    skyMid: '#38bdf8',
    skyHorizon: '#e0f2fe',
    sunCore: '#fef9c3',
    sunMid: '#facc15',
    sunRim: '#ea580c',
    cloudLight: '#ffffff',
    cloudShade: '#cbd5e1',
    cloudStorm: '#64748b',
    oceanSurface: '#0ea5e9',
    oceanDeep: '#1e3a8a',
    oceanAbyss: '#0f172a',
  },
  labGlass: {
    highlight: '#ffffff',
    rim: '#bae6fd',
    body: '#e0f2fe',
    shadow: '#0369a1',
    brassLight: '#fde68a',
    brassMid: '#d97706',
    brassDark: '#78350f',
  },
  botanical: {
    leafSun: '#86efac',
    leafMid: '#22c55e',
    leafShade: '#15803d',
    pineDark: '#0f3d2e',
    earthTop: '#65a30d',
    earthMid: '#3f6212',
    rockSun: '#64748b',
    rockShade: '#1e293b',
  },
} as const;

/** Formats a coordinate cleanly with bounded precision (Flash twip-style compactness). */
export function qNum(value: number, step = 0.5): string {
  if (!Number.isFinite(value)) return '0';
  const snapped = step > 0 ? Math.round(value / step) * step : value;
  const fixed = Number(snapped.toFixed(2));
  return Object.is(fixed, -0) ? '0' : String(fixed);
}

/**
 * Emits a Flash-style FocalRadialGradient (<radialGradient fx fy>) for tactile 3D spheres,
 * glass vessels, water droplets, and solar orbs with zero SVG filter cost.
 */
export function buildFocalGradientDef(spec: FocalGradientSpec): string {
  const cx = spec.cx ?? '50%';
  const cy = spec.cy ?? '50%';
  const r = spec.r ?? '55%';
  const fx = spec.fx ?? '34%';
  const fy = spec.fy ?? '28%';
  const stopsXml = spec.stops
    .map((s) => {
      const op = s.opacity !== undefined && s.opacity < 1 ? ` stop-opacity="${s.opacity}"` : '';
      return `<stop offset="${s.offset}" stop-color="${s.color}"${op}/>`;
    })
    .join('');
  return `<radialGradient id="${spec.id}" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${stopsXml}</radialGradient>`;
}

/**
 * Emits a Flash cel-shaded vector group (base silhouette + clipped shadow crescent + specular rim)
 * using zero Gaussian blur filters for 60 FPS performance on low-end mobile devices.
 */
export function buildCelShadedShape(spec: CelShadedSpec): { defs: string; group: string } {
  const clipId = `${spec.id}-clip`;
  const defs = `<clipPath id="${clipId}"><path d="${spec.basePath}"/></clipPath>`;
  const strokeAttrs =
    spec.strokeColor && (spec.strokeWidth ?? 0) > 0
      ? ` stroke="${spec.strokeColor}" stroke-width="${spec.strokeWidth}" stroke-linejoin="round"`
      : '';
  const parts: string[] = [`<path d="${spec.basePath}" fill="${spec.baseFill}"${strokeAttrs}/>`];
  if (spec.shadowPath) {
    parts.push(
      `<path d="${spec.shadowPath}" fill="${spec.shadowColor || '#0f172a'}" opacity="${spec.shadowOpacity ?? 0.22}" clip-path="url(#${clipId})"/>`
    );
  }
  if (spec.highlightPath) {
    parts.push(
      `<path d="${spec.highlightPath}" fill="${spec.highlightColor || '#ffffff'}" opacity="${spec.highlightOpacity ?? 0.45}" clip-path="url(#${clipId})"/>`
    );
  }
  return {
    defs,
    group: `<g id="${spec.id}">${parts.join('')}</g>`,
  };
}

/**
 * Converts a sequence of [x, y, halfWidth] spine samples into a single closed variable-width
 * Flash-style inked ribbon path (tapered strokes, organic rivers, hand-drawn outlines).
 */
export function buildTaperedRibbonPath(
  points: Array<[number, number, number]>,
  step = 0.5
): string {
  if (points.length < 2) return '';
  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];

  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const nx = -dy;
    const ny = dx;
    const hw = Math.max(0.25, points[i][2]);
    left.push([points[i][0] + nx * hw, points[i][1] + ny * hw]);
    right.push([points[i][0] - nx * hw, points[i][1] - ny * hw]);
  }

  let d = `M${qNum(left[0][0], step)} ${qNum(left[0][1], step)}`;
  for (let i = 1; i < left.length; i++) {
    d += ` L${qNum(left[i][0], step)} ${qNum(left[i][1], step)}`;
  }
  for (let i = right.length - 1; i >= 0; i--) {
    d += ` L${qNum(right[i][0], step)} ${qNum(right[i][1], step)}`;
  }
  return `${d} Z`;
}

/**
 * Emits a compact <use> symbol instance with a pre-computed 6-float SVG matrix(a b c d e f),
 * matching Flash PlaceObject2 instancing with zero geometry duplication.
 */
export function buildSymbolInstance(spec: SymbolStampSpec): string {
  const sx = spec.scaleX ?? 1;
  const sy = spec.scaleY ?? sx;
  const rad = ((spec.rotateDeg ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const sk = Math.tan(((spec.skewX ?? 0) * Math.PI) / 180);

  const a = sx * cos;
  const b = sx * sin;
  const c = sy * (-sin + cos * sk);
  const d = sy * (cos + sin * sk);
  const e = spec.x ?? 0;
  const f = spec.y ?? 0;

  const href = spec.href.startsWith('#') ? spec.href : `#${spec.href}`;
  const idAttr = spec.id ? ` id="${spec.id}"` : '';
  const opAttr = spec.opacity !== undefined && spec.opacity < 1 ? ` opacity="${qNum(spec.opacity, 0.05)}"` : '';
  return `<use${idAttr} href="${href}" transform="matrix(${qNum(a, 0.01)} ${qNum(b, 0.01)} ${qNum(c, 0.01)} ${qNum(d, 0.01)} ${qNum(e, 0.5)} ${qNum(f, 0.5)})"${opAttr}/>`;
}

/**
 * Generates an area-preserving Flash squash-and-stretch SVG transform expression for .ast (:bindings ...),
 * executing inside the AST VM with zero per-frame DOM allocations.
 */
export function buildSquashStretchExpr(opts: {
  xExpr: string;
  yExpr: string;
  phaseExpr: string;
  amplitude?: number;
}): string {
  const amp = opts.amplitude ?? 0.08;
  return `'translate(' + (${opts.xExpr}).toFixed(1) + ',' + (${opts.yExpr}).toFixed(1) + ') scale(' + (1 + Math.sin(${opts.phaseExpr}) * ${amp}).toFixed(3) + ',' + (1 - Math.sin(${opts.phaseExpr}) * ${amp}).toFixed(3) + ')'`;
}
