// src/utils/astMathCompiler.ts
/**
 * AST Vector Math Compiler & Symbolic Optimizer
 * 
 * Takes the weight off the human and on-device LLMs (Gemini Nano) by automatically
 * analyzing, optimizing, and compiling mathematical expressions into high-performance
 * zero-allocation bytecode opcodes (Affine FMA, Viewport Maps, and RPN streams).
 */

export type TransformKind = 'none' | 'translateX' | 'translateY' | 'rotate' | 'scale' | 'opacity' | 'width' | 'height';

export interface AffineDecomposition {
  kind: 'affine';
  m: number; // Slope
  c: number; // Offset
  transform: TransformKind;
  originX?: number;
  originY?: number;
  originalExpr: string;
}

export interface MapDecomposition {
  kind: 'map';
  inMin: number;
  inMax: number;
  outMin: number;
  outMax: number;
  inputVar: string;
  transform: TransformKind;
  originX?: number;
  originY?: number;
  originalExpr: string;
}

export interface FallbackDecomposition {
  kind: 'fallback';
  originalExpr: string;
}

export type MathDecomposition = AffineDecomposition | MapDecomposition | FallbackDecomposition;

/**
 * Analyzes an arbitrary JavaScript/AST string expression at compile time
 * and determines if it can be reduced to a single-cycle Affine FMA (m * t + c)
 * or a dimensionless Viewport Transfer Map.
 */
export function compileExpressionToMathKernel(expr: string, targetAttr?: string): MathDecomposition {
  if (!expr || typeof expr !== 'string') {
    return { kind: 'fallback', originalExpr: expr };
  }

  const trimmed = expr.trim();

  // 1. Detect and strip standard SVG transform wrappers
  let innerMath = trimmed;
  let detectedTransform: TransformKind = 'none';
  let originX: number | undefined;
  let originY: number | undefined;

  // Pattern: translate(EXPR, 0) or translate(EXPR)
  const transXMatch = trimmed.match(/^translate\(\s*([^,]+?)\s*(?:,\s*0\s*)?\)$/);
  if (transXMatch) {
    detectedTransform = 'translateX';
    innerMath = transXMatch[1].trim();
  }

  // Pattern: translate(0, EXPR)
  const transYMatch = trimmed.match(/^translate\(\s*0\s*,\s*([^)]+?)\s*\)$/);
  if (transYMatch) {
    detectedTransform = 'translateY';
    innerMath = transYMatch[1].trim();
  }

  // Pattern: 'rotate(' + EXPR + ')' or rotate(EXPR, cx, cy)
  const rotateMatch = trimmed.match(/^rotate\(\s*([^,)]+?)(?:\s*,\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*)?\)$/);
  if (rotateMatch) {
    detectedTransform = 'rotate';
    innerMath = rotateMatch[1].trim();
    if (rotateMatch[2] && rotateMatch[3]) {
      originX = parseFloat(rotateMatch[2]);
      originY = parseFloat(rotateMatch[3]);
    }
  }

  // Infer transform from attribute if not wrapped
  if (detectedTransform === 'none' && targetAttr) {
    if (targetAttr === 'opacity') detectedTransform = 'opacity';
    else if (targetAttr === 'width') detectedTransform = 'width';
    else if (targetAttr === 'height') detectedTransform = 'height';
  }

  // 2. Symbolic Linear Affine Detection via Multi-Point Evaluation Probe
  // Check if innerMath depends solely on t (or linear affine combinations)
  // We evaluate at t = 0, t = 1, t = 2, and t = 0.5
  try {
    const fn = new Function('t', 'vars', 'Math', `"use strict"; return (${innerMath});`);
    const mockVars = {};
    const y0 = fn(0, mockVars, Math);
    const y1 = fn(1, mockVars, Math);
    const y2 = fn(2, mockVars, Math);
    const yHalf = fn(0.5, mockVars, Math);

    if (
      typeof y0 === 'number' && Number.isFinite(y0) &&
      typeof y1 === 'number' && Number.isFinite(y1) &&
      typeof y2 === 'number' && Number.isFinite(y2) &&
      typeof yHalf === 'number' && Number.isFinite(yHalf)
    ) {
      const slope = y1 - y0;
      const c = y0;
      const expectedY2 = c + 2 * slope;
      const expectedYHalf = c + 0.5 * slope;

      const err2 = Math.abs(y2 - expectedY2);
      const errHalf = Math.abs(yHalf - expectedYHalf);

      if (err2 < 1e-4 && errHalf < 1e-4) {
        return {
          kind: 'affine',
          m: Number(slope.toFixed(6)),
          c: Number(c.toFixed(6)),
          transform: detectedTransform,
          originX,
          originY,
          originalExpr: expr,
        };
      }
    }
  } catch {
    // If dynamic probing fails (e.g. references complex string arrays or state machines), fallback gracefully
  }

  return { kind: 'fallback', originalExpr: expr };
}

/**
 * Executes an optimized affine kernel in a single FMA cycle (m * t + c)
 * with zero dynamic object creation.
 */
export function evaluateAffine(m: number, c: number, t: number): number {
  return m * t + c;
}

/**
 * Executes a normalized viewport transfer map (dimensionless physics -> screen pixels)
 */
export function evaluateMap(
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return outMin;
  const norm = (val - inMin) / (inMax - inMin);
  return outMin + norm * (outMax - outMin);
}

/**
 * Evaluates the 6-element homogeneous affine transform matrix [a, b, c, d, e, f]
 * representing M = [[a, c, e], [b, d, f], [0, 0, 1]]
 * into the provided outMatrix Float32Array(6).
 * 
 * Guarantees ZERO dynamic heap allocations during 60 FPS animation ticks.
 */
export function evaluateAffineMatrix6(
  affine: AffineDecomposition,
  t: number,
  outMatrix: Float32Array
): void {
  const scalar = affine.m * t + affine.c;

  if (affine.transform === 'translateX') {
    outMatrix[0] = 1;
    outMatrix[1] = 0;
    outMatrix[2] = 0;
    outMatrix[3] = 1;
    outMatrix[4] = scalar;
    outMatrix[5] = 0;
  } else if (affine.transform === 'translateY') {
    outMatrix[0] = 1;
    outMatrix[1] = 0;
    outMatrix[2] = 0;
    outMatrix[3] = 1;
    outMatrix[4] = 0;
    outMatrix[5] = scalar;
  } else if (affine.transform === 'rotate') {
    const rad = scalar * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    outMatrix[0] = cos;
    outMatrix[1] = sin;
    outMatrix[2] = -sin;
    outMatrix[3] = cos;

    if (affine.originX != null && affine.originY != null) {
      const cx = affine.originX;
      const cy = affine.originY;
      outMatrix[4] = cx - cx * cos + cy * sin;
      outMatrix[5] = cy - cx * sin - cy * cos;
    } else {
      outMatrix[4] = 0;
      outMatrix[5] = 0;
    }
  } else if (affine.transform === 'scale') {
    outMatrix[0] = scalar;
    outMatrix[1] = 0;
    outMatrix[2] = 0;
    outMatrix[3] = scalar;
    outMatrix[4] = 0;
    outMatrix[5] = 0;
  } else {
    outMatrix[0] = 1;
    outMatrix[1] = 0;
    outMatrix[2] = 0;
    outMatrix[3] = 1;
    outMatrix[4] = scalar;
    outMatrix[5] = 0;
  }
}

/**
 * Formats a 6-element affine matrix into standard SVG matrix notation:
 * 'matrix(a, b, c, d, e, f)'
 */
export function formatSvgMatrix6(m: Float32Array): string {
  return `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
}

/**
 * Evaluates a volume-preserving (det = 1) velocity-aligned squash-and-stretch
 * 2D affine transform R(theta) * S(1 - squash, 1 / (1 - squash)) * R(-theta)
 * translated to (tx, ty) around local pivot (originX, originY), writing directly
 * into a pre-allocated 6-float buffer [a, b, c, d, e, f] with zero heap allocations.
 */
export function evaluateSquashStretchMatrix6(
  vx: number,
  vy: number,
  squash: number,
  tx: number,
  ty: number,
  outMatrix: Float32Array,
  originX = 0,
  originY = 0
): void {
  const sq = Math.max(-0.45, Math.min(0.45, Number(squash) || 0));
  let a = 1;
  let b = 0;
  let c = 0;
  let d = 1;

  if (Math.abs(sq) > 1e-4) {
    const speedSq = vx * vx + vy * vy;
    let ux = 0;
    let uy = 1;
    if (speedSq > 1e-8) {
      const invSpeed = 1 / Math.sqrt(speedSq);
      ux = vx * invSpeed;
      uy = vy * invSpeed;
    }
    const sParallel = 1 - sq;
    const sPerp = 1 / sParallel;
    const diff = sParallel - sPerp;
    const uxx = ux * ux;
    const uyy = uy * uy;
    const uxy = ux * uy;

    a = sParallel * uxx + sPerp * uyy;
    b = diff * uxy;
    c = b;
    d = sParallel * uyy + sPerp * uxx;
  }

  outMatrix[0] = a;
  outMatrix[1] = b;
  outMatrix[2] = c;
  outMatrix[3] = d;
  outMatrix[4] = tx - (a * originX + c * originY);
  outMatrix[5] = ty - (b * originX + d * originY);
}

