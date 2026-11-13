/// <reference types="vite/client" />

declare module '*.ast' {
  const content: string;
  export default content;
}

declare module '*promptStrategies' {
  export const KEY_STAGE_CONSTRAINTS: Record<string, any>;
  export const REGIONAL_CONSTRAINTS: Record<string, any>;
  export const SUBJECT_DEFINITIONS: Record<string, any>;
  export function resolveKeyStageRule(...args: any[]): any;
  export function resolveSeedCoordinate(...args: any[]): any;
  const _default: any;
  export default _default;
}

declare module '*promptStrategies.js' {
  export const KEY_STAGE_CONSTRAINTS: Record<string, any>;
  export const REGIONAL_CONSTRAINTS: Record<string, any>;
  export const SUBJECT_DEFINITIONS: Record<string, any>;
  export function resolveKeyStageRule(...args: any[]): any;
  export function resolveSeedCoordinate(...args: any[]): any;
  const _default: any;
  export default _default;
}

declare module '*ast-3d-engine.bin.js' {
  export const AST_3D_WASM_BASE64: string;
  export function loadAst3dWasm(baseUrl?: string): Promise<any>;
  const _default: any;
  export default _default;
}

declare module '*ast-transpiler-engine.bin.js' {
  export const AST_TRANSPILER_WASM_BASE64: string;
  export function loadAstTranspilerWasm(baseUrl?: string): Promise<any>;
  const _default: any;
  export default _default;
}

