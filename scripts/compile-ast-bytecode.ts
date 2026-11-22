// scripts/compile-ast-bytecode.ts
/**
 * AST Vector Bytecode Compilation Script
 *
 * Compiles all canonical .ast S-Expression cartridges from static/cartridges/
 * into binary-complete, zero-bloat .astb bytecode in static/bytecode/.
 *
 * Uses the authoritative static/player/ast-parser.js S-expression parser so
 * every .astb binary sets FLAG_COMPLETE_BINARY (0x0020) and carries 100%
 * lossless parity (bindings, computed, gestures, physics, emitters, skills,
 * controls, scopes, ledgers, checkpoints) — eliminating runtime .ast re-fetch
 * and text parsing on cartridge boot.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import {
  compileSceneToBytecode,
  decompileBytecodeToScene,
  isAstBytecode,
  type BytecodeCompiledScene,
} from '../src/utils/astBytecode';

const ROOT_DIR = process.cwd();

// Canonical single source of truth for authoring (.svg + .ast pairs)
const SOURCE_DIR = path.join(ROOT_DIR, 'static', 'cartridges');

// Canonical single target for compiled .astb bytecode binaries ONLY
const TARGET_DIR = path.join(ROOT_DIR, 'static', 'bytecode');

function loadAuthoritativeAstParser(): (astText: string) => any {
  const parserPath = path.join(ROOT_DIR, 'static', 'player', 'ast-parser.js');
  const parserCode = fs.readFileSync(parserPath, 'utf8');
  const ctx: any = { console, window: {}, globalThis: {} };
  vm.createContext(ctx);
  vm.runInContext(parserCode, ctx);
  const parseAst = ctx.parseAst || ctx.window.parseAst || ctx.ASTParser?.parseAst;
  if (typeof parseAst !== 'function') {
    throw new Error('Failed to load parseAst from static/player/ast-parser.js');
  }
  return parseAst;
}

function toCompiledScene(id: string, astText: string, parsed: any): BytecodeCompiledScene {
  const rawType = parsed.type || parsed.cartridgeType || 'Sim';
  const type: 'Sim' | 'Slide' | 'App' | 'Film' =
    rawType === 'Film' || parsed.video ? 'Film' :
    rawType === 'Slide' ? 'Slide' :
    rawType === 'App' ? 'App' : 'Sim';

  const interactiveDisabled =
    /:interactive\s+(false|nil|none)\b/i.test(astText) ||
    /:questions\s+(false|nil|none)\b/i.test(astText) ||
    /:type\s+"App"/i.test(astText) ||
    (/:enabled\s+(false|nil)\b/i.test(astText) && /:interactive/i.test(astText));

  const checkpoints = Array.isArray(parsed.checkpoints) && parsed.checkpoints.length > 0
    ? parsed.checkpoints
    : (parsed.interactive && Array.isArray(parsed.interactive.checkpoints) ? parsed.interactive.checkpoints : []);

  return {
    id: parsed.id || id,
    type,
    title: parsed.title || id,
    stage: parsed.stage || 'CURRICULUM',
    duration: typeof parsed.duration === 'number' && Number.isFinite(parsed.duration) ? parsed.duration : 10.0,
    video: parsed.video || null,
    videoFit: parsed.videoFit || 'contain',
    has3D: Boolean(parsed.has3D || parsed.camera),
    hasVideo: Boolean(parsed.video || type === 'Film'),
    camera: parsed.camera || null,
    keyframes: Array.isArray(parsed.keyframes) ? parsed.keyframes : [],
    subtitles: Array.isArray(parsed.subtitles) ? parsed.subtitles : [],
    bindings: Array.isArray(parsed.bindings) ? parsed.bindings : [],
    checkpoints,
    scopes: Array.isArray(parsed.scopes) ? parsed.scopes : [],
    ledgers: Array.isArray(parsed.ledgers) ? parsed.ledgers : [],
    gestures: Array.isArray(parsed.gestures) ? parsed.gestures : [],
    vars: parsed.vars && typeof parsed.vars === 'object' ? parsed.vars : {},
    computed: Array.isArray(parsed.computed) ? parsed.computed : [],
    inputs: Array.isArray(parsed.inputs) ? parsed.inputs : [],
    uiControls: Array.isArray(parsed.uiControls) ? parsed.uiControls : [],
    bindInputs: Array.isArray(parsed.bindInputs) ? parsed.bindInputs : [],
    physics: parsed.physics || null,
    emitters: Array.isArray(parsed.emitters) ? parsed.emitters : [],
    stateMachines: Array.isArray(parsed.stateMachines) ? parsed.stateMachines : [],
    controls: parsed.controls || null,
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    cameraStops: Array.isArray(parsed.cameraStops) ? parsed.cameraStops : null,
    quests: parsed.quests || null,
    bootSound: parsed.bootSound || null,
    interactiveDisabled,
    actors: Array.isArray(parsed.actors) ? parsed.actors : [],
    staticElements: Array.isArray(parsed.staticElements) ? parsed.staticElements : [],
    completeBinary: true,
  };
}

function run() {
  console.log('[AST Bytecode Compiler] Compiling canonical cartridges to binary-complete .astb payloads...');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`[AST Bytecode Compiler] Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const parseAst = loadAuthoritativeAstParser();

  const files = fs.readdirSync(SOURCE_DIR);
  const astFiles = files.filter(f => f.endsWith('.ast')).sort();
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
      const parsed = parseAst(astText);
      const compiledScene = toCompiledScene(id, astText, parsed);
      const bytecode = compileSceneToBytecode(compiledScene);
      const binBuffer = Buffer.from(bytecode.buffer, bytecode.byteOffset, bytecode.byteLength);

      // Verify round-trip binary completeness & parity
      if (!isAstBytecode(bytecode)) {
        throw new Error(`Magic header validation failed for ${id}`);
      }
      const decompiled = decompileBytecodeToScene(bytecode);
      if (!decompiled.id || !decompiled.title || !decompiled.completeBinary) {
        throw new Error(`Decompilation sanity check failed for ${id}`);
      }
      if (decompiled.bindings.length !== compiledScene.bindings.length) {
        throw new Error(`Binding parity mismatch for ${id}: expected ${compiledScene.bindings.length}, got ${decompiled.bindings.length}`);
      }
      if ((decompiled.computed?.length || 0) !== (compiledScene.computed?.length || 0)) {
        throw new Error(`Computed parity mismatch for ${id}`);
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
      process.exitCode = 1;
    }
  }

  const overallReduction = totalSrcBytes > 0
    ? ((1 - totalBytecodeBytes / totalSrcBytes) * 100).toFixed(1)
    : '0';

  console.log(`\n======================================================`);
  console.log(`[AST Bytecode Compiler] Successfully compiled ${count} binary-complete cartridges!`);
  console.log(`  Original AST Text:  ${(totalSrcBytes / 1024).toFixed(2)} KB`);
  console.log(`  Compiled Bytecode:  ${(totalBytecodeBytes / 1024).toFixed(2)} KB`);
  console.log(`  Total Savings:      -${overallReduction}% reduction`);
  console.log(`======================================================\n`);
}

run();
