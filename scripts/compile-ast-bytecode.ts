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

// Canonical single source of truth for authoring (.svg + .ast pairs)
const SOURCE_DIR = path.join(ROOT_DIR, 'static', 'cartridges');

// Canonical single target for compiled .astb bytecode binaries ONLY
const TARGET_DIR = path.join(ROOT_DIR, 'static', 'bytecode');

function run() {
  console.log('[AST Bytecode Compiler] Compiling canonical cartridges to binary .astb payloads...');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`[AST Bytecode Compiler] Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SOURCE_DIR);
  const astFiles = files.filter(f => f.endsWith('.ast'));
  const validAstbNames = new Set(astFiles.map(f => f.replace(/\.ast$/, '.astb')));

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  } else {
    // Ensure bytecode store stays pure (.astb binaries for active cartridges only, zero duplicate .svg or stale .astb files)
    for (const existing of fs.readdirSync(TARGET_DIR)) {
      if (!existing.endsWith('.astb') || !validAstbNames.has(existing)) {
        fs.rmSync(path.join(TARGET_DIR, existing), { force: true });
      }
    }
  }

  console.log(`[AST Bytecode Compiler] Found ${astFiles.length} canonical cartridges in ${SOURCE_DIR}`);

  let totalSrcBytes = 0;
  let totalBytecodeBytes = 0;
  let count = 0;

  for (const astFile of astFiles) {
    const srcPath = path.join(SOURCE_DIR, astFile);
    const id = astFile.replace(/\.ast$/, '');
    const targetAstbPath = path.join(TARGET_DIR, `${id}.astb`);

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

      // Write compiled bytecode to static/bytecode/ (companion .svg stays solely in static/cartridges/)
      fs.writeFileSync(targetAstbPath, binBuffer);

      const binSize = binBuffer.byteLength;
      totalBytecodeBytes += binSize;
      const reduction = ((1 - binSize / srcSize) * 100).toFixed(1);

      console.log(`  ✓ ${id.padEnd(28)} : ${srcSize.toString().padStart(5)} B -> ${binSize.toString().padStart(4)} B (-${reduction}%) [${decompiled.type}]`);
      count++;
    } catch (err: any) {
      console.error(`  ✗ Error compiling ${id}:`, err.message);
    }
  }

  const overallReduction = totalSrcBytes > 0 
    ? ((1 - totalBytecodeBytes / totalSrcBytes) * 100).toFixed(1) 
    : '0';

  console.log(`\n======================================================`);
  console.log(`[AST Bytecode Compiler] Successfully compiled ${count} cartridges!`);
  console.log(`  Original AST Text:  ${(totalSrcBytes / 1024).toFixed(2)} KB`);
  console.log(`  Compiled Bytecode:  ${(totalBytecodeBytes / 1024).toFixed(2)} KB`);
  console.log(`  Total Savings:      -${overallReduction}% reduction`);
  console.log(`======================================================\n`);
}

run();
