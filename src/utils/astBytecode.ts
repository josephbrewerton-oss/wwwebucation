// src/utils/astBytecode.ts
/**
 * Backward-compatible barrel for the AST Vector Bytecode (.astb) Codec.
 * Implementation modules live in src/utils/bytecode/:
 *  - astbSchema.ts       (format constants & TypeScript interfaces)
 *  - astbTables.ts       (string table, SVG path encoding & vector dictionary hydration)
 *  - astbEncoder.ts      (binary .astb encoder: compileSceneToBytecode)
 *  - astbDecoder.ts      (binary .astb decoder: decompileBytecodeToScene)
 *  - astbTextCompiler.ts (S-expression text & :for macro compiler: compileAstTextToBytecode)
 */

export * from './bytecode/astbSchema';
export {
  encodeSvgPathToVectorCmds,
  hydrateVectorDictionaryToSvg,
  isAstBytecode,
} from './bytecode/astbTables';
export { compileSceneToBytecode } from './bytecode/astbEncoder';
export { decompileBytecodeToScene } from './bytecode/astbDecoder';
export { compileAstTextToBytecode } from './bytecode/astbTextCompiler';
