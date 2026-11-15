// src/engine/sharedRenderBoundary.ts
/**
 * Typed TypeScript facade over the single standalone shared Rendering Boundary
 * (`static/player/ast-render-boundary.js`).
 *
 * Ensures Host SPA views (/studio, /player, /catholic-life), the `EverymanBios`
 * 448 KiB WASM blitter, the standalone SVG engine (`ast-engine.js`), and Gemini Nano
 * WebMCP tooling all operate on the exact same shared rendering resource.
 */

import '../../static/player/ast-render-boundary.js';

export type RenderMode = 'svg' | 'canvas' | 'hybrid';

export interface SharedSurfaceSummary {
  id: string;
  label: string;
  renderMode: RenderMode;
  sceneId: string;
  viewBox: string;
  hasSvg: boolean;
  hasCanvas: boolean;
  hasBios: boolean;
  svgMounted: boolean;
  frameCount: number;
  lastBlitOps: number;
}

export interface RenderBoundarySnapshot {
  boundaryVersion: string;
  activeSurfaceId: string | null;
  renderMode: RenderMode;
  stageDimensions: { width: number; height: number; viewBox: string };
  globalFrameCount: number;
  lastHighlight: { selector: string; surfaceId: string | null; matchedDom: boolean; at: number } | null;
  surfaces: SharedSurfaceSummary[];
}

export interface SharedRenderBoundaryApi {
  version: string;
  DisplayOp: {
    END_FRAME: 0;
    CLEAR_RECT: 1;
    FILL_RECT: 2;
    STROKE_RECT: 3;
    CIRCLE: 4;
    TEXT: 5;
    LINE: 6;
    PROGRESS_BAR: 7;
  };
  registerSurface: (opts: {
    id: string;
    label?: string;
    renderMode?: RenderMode;
    sceneId?: string;
    viewBox?: string;
    svgContainer?: Element | null;
    stageSvg?: SVGSVGElement | Element | null;
    canvas?: HTMLCanvasElement | null;
    bios?: unknown;
    metadata?: Record<string, unknown>;
    svgMounted?: boolean;
  }) => any;
  unregisterSurface: (id: string) => boolean;
  getSurface: (id?: string) => any;
  listSurfaces: () => SharedSurfaceSummary[];
  setRenderMode: (surfaceId: string | undefined, mode: RenderMode) => { ok: boolean; id?: string; renderMode: RenderMode };
  setSurfaceScene: (surfaceId: string | undefined, sceneId: string, metadata?: Record<string, unknown>) => any;
  sanitizeSvg: (rawSvg: string) => string;
  sanitizeSvgElement: <T extends Element>(rootSvg: T | null) => T | null;
  ensureMasterDefs: (container: Element | null) => Element | null;
  mountSvgStage: (opts: {
    container?: Element | null;
    stageSvg?: SVGSVGElement | Element | null;
    surfaceId?: string;
    svgText?: string;
    svgMarkup?: string;
    skipDefs?: boolean;
  }) => { mounted: boolean; viewBox: string };
  commitBindingValue: (node: Element | null, attr: string, val: unknown) => void;
  commitAffineMatrix: (node: Element | null, matrixBuf: Float32Array | number[]) => void;
  blitDisplayList: (
    ctx: CanvasRenderingContext2D,
    dv: DataView,
    u8: Uint8Array,
    dlPtr: number,
    maxCmds?: number,
    decoder?: TextDecoder,
    surfaceId?: string
  ) => number;
  bindCanvasLoop: (opts: {
    canvas: HTMLCanvasElement;
    surfaceId?: string;
    renderMode?: RenderMode;
    bios?: unknown;
    sceneId?: string;
    stageWidth?: number;
    stageHeight?: number;
    onPointer?: (phase: 0 | 1 | 2, sx: number, sy: number, buttons: number) => void;
    onStep?: (dtMs: number, ctx: CanvasRenderingContext2D, surfaceId: string) => void;
  }) => () => void;
  highlightTarget: (selector: string, durationMs?: number, surfaceId?: string) => {
    ok: boolean;
    selector?: string;
    matchedDom?: boolean;
    reason?: string;
  };
  getSnapshot: (surfaceId?: string) => RenderBoundarySnapshot;
  subscribe: (cb: (event: { type: string; detail: Record<string, any>; timestamp: number }) => void) => () => void;
}

export function getSharedRenderBoundary(): SharedRenderBoundaryApi {
  const api = (globalThis as any).ASTSharedRenderBoundary as SharedRenderBoundaryApi | undefined;
  if (!api) {
    throw new Error('[SharedRenderBoundary] ASTSharedRenderBoundary runtime not initialized.');
  }
  return api;
}

export const DisplayOp = getSharedRenderBoundary().DisplayOp;
