// scripts/compile-ast-bytecode.ts
/**
 * AST Vector Bytecode Compilation Script
 * 
 * Compiles all canonical .ast S-Expression cartridges from static/cartridges/
 * into zero-bloat .astb binary bytecode in static/player/bytecode/
 */

import * as fs from 'fs';
import * as path from 'path';
import { compileAstTextToBytecode, decompileBytecodeToScene, isAstBytecode } from '../src/utils/astBytecode';

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, 'static', 'player', 'cartridges');
const TARGET_DIR = path.join(ROOT_DIR, 'static', 'player', 'bytecode');
const SCENES_DIR = path.join(ROOT_DIR, 'static', 'player', 'scenes');

function run() {
  console.log('[AST Bytecode Compiler] Compiling canonical cartridges to binary .astb payloads...');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`[AST Bytecode Compiler] Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR);
  const astFiles = files.filter(f => f.endsWith('.ast'));

  console.log(`[AST Bytecode Compiler] Found ${astFiles.length} canonical cartridges in ${SOURCE_DIR}`);

  let totalSrcBytes = 0;
  let totalBytecodeBytes = 0;
  let count = 0;

  for (const astFile of astFiles) {
    const srcPath = path.join(SOURCE_DIR, astFile);
    const id = astFile.replace(/\.ast$/, '');
    const targetAstbPath = path.join(TARGET_DIR, `${id}.astb`);
    const scenesAstbPath = path.join(SCENES_DIR, `${id}.astb`);

    const astText = fs.readFileSync(srcPath, 'utf8');
    const srcSize = Buffer.byteLength(astText, 'utf8');
    totalSrcBytes += srcSize;

    try {
      const bytecode = compileAstTextToBytecode(astText);
      const binBuffer = Buffer.from(bytecode.buffer, bytecode.byteOffset, bytecode.byteLength);

      // Verify round-trip validation
      if (!isAstBytecode(bytecode)) {
        throw new Error(`Magic header validation failed for ${id}`);
      }
      const decompiled = decompileBytecodeToScene(bytecode);
      if (!decompiled.id || !decompiled.title) {
        throw new Error(`Decompilation sanity check failed for ${id}`);
      }

      // Write compiled bytecode to both static/player/bytecode/ and static/player/scenes/
      fs.writeFileSync(targetAstbPath, binBuffer);
      if (fs.existsSync(SCENES_DIR)) {
        fs.writeFileSync(scenesAstbPath, binBuffer);
      }

      // Copy matching SVG to bytecode folder if present
      const svgSrcPath = path.join(SOURCE_DIR, `${id}.svg`);
      const targetSvgPath = path.join(TARGET_DIR, `${id}.svg`);
      if (fs.existsSync(svgSrcPath)) {
        fs.copyFileSync(svgSrcPath, targetSvgPath);
      }

      const binSize = binBuffer.byteLength;
      totalBytecodeBytes += binSize;
      const reduction = ((1 - binSize / srcSize) * 100).toFixed(1);

      console.log(`  ✓ ${id.padEnd(28)} : ${srcSize.toString().padStart(5)} B -> ${binSize.toString().padStart(4)} B (-${reduction}%) [${decompiled.type}]`);
      count++;
    } catch (err: any) {
      console.error(`  ✗ Error compiling ${id}:`, err.message);
    }
  }

  const overallReduction = ((1 - totalBytecodeBytes / totalSrcBytes) * 100).toFixed(1);
  console.log(`\n======================================================`);
  console.log(`[AST Bytecode Compiler] Successfully compiled ${count} cartridges!`);
  console.log(`  Original AST Text:  ${(totalSrcBytes / 1024).toFixed(2)} KB`);
  console.log(`  Compiled Bytecode:  ${(totalBytecodeBytes / 1024).toFixed(2)} KB`);
  console.log(`  Total Savings:      -${overallReduction}% reduction`);
  console.log(`======================================================\n`);
}

run();
