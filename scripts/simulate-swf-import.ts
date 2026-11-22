/**
 * scripts/simulate-swf-import.ts
 *
 * Automated simulation runner for legacy SWF to AST Vector Transpiler.
 * Tests multiple SWF binary structures (FWS, CWS zlib, DefineShape 1-4, quadratic Béziers,
 * ShowFrame sequences, FrameLabels, and adversarial corruptions).
 *
 * Verifies XML/SVG validity, AST S-Expression parseability, and performance metrics.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { transpileSwfToAst } from '../src/utils/swfAstParser';
import { parseSExpr } from '../src/utils/sexprParser';
import { compileSceneToBytecode, isAstBytecode } from '../src/utils/astBytecode';
import {
  BitWriter,
  assembleFwsSwf,
  assembleCwsSwf,
  writeTag,
  buildRectShapeTag,
  buildCurvedShapeTag,
  buildMorphShapeTag,
  buildDoActionTag,
  Avm1Builder,
  buildPlaceObject2Tag,
  buildRemoveObject2Tag,
  buildDefineSpriteTag,
  buildDefineButton2Tag,
  SwfTagCode,
} from '../test/utils/swfBinaryBuilder';

interface SimulationReport {
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
  errors?: string[];
}

const reports: SimulationReport[] = [];

async function runSimulations() {
  console.log('\n=============================================================');
  console.log('🧪 St Joseph\'s Educational SWF-to-AST Transpiler Simulation');
  console.log('=============================================================\n');

  // --------------------------------------------------------------------------
  // SIMULATION 1: Standard FWS Uncompressed SWF with Geometry & Frames
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    // Tag 9: SetBackgroundColor (#090d16)
    writeTag(tagWriter, 9, new Uint8Array([0x09, 0x0d, 0x16]));

    // Tag 22: DefineShape2 (id: 1)
    const rectShape = buildRectShapeTag(1, 50, 50, 200, 120, [16, 185, 129, 255]);
    writeTag(tagWriter, 22, rectShape);

    // Tag 43: FrameLabel ("Scene Start")
    const lbl1 = new BitWriter();
    lbl1.writeString('Scene Start');
    writeTag(tagWriter, 43, lbl1.toByteArray());

    // Tag 1: ShowFrame
    writeTag(tagWriter, 1, new Uint8Array(0));

    // Tag 43: FrameLabel ("Midpoint")
    const lbl2 = new BitWriter();
    lbl2.writeString('Midpoint');
    writeTag(tagWriter, 43, lbl2.toByteArray());

    // Tag 1: ShowFrame
    writeTag(tagWriter, 1, new Uint8Array(0));

    // Tag 0: End
    writeTag(tagWriter, 0, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(800, 480, 24, 24, tagWriter.toByteArray(), 8);
    const result = await transpileSwfToAst(swfBinary, 'sim-fws-basic');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`Transpilation failed: ${result.error}`);
    if (result.metadata?.signature !== 'FWS') errors.push(`Expected FWS signature, got ${result.metadata?.signature}`);
    if (result.metadata?.width !== 800) errors.push(`Expected width 800, got ${result.metadata?.width}`);
    if (result.metadata?.height !== 480) errors.push(`Expected height 480, got ${result.metadata?.height}`);
    if (!result.svgMarkup.includes('<svg') || !result.svgMarkup.includes('</svg>')) errors.push('Generated SVG markup missing <svg> tags');
    if (!result.svgMarkup.includes('d="M 50.0 50.0')) errors.push('SVG does not contain expected MoveTo 50.0 50.0');

    // Verify AST S-Expression parseability
    const ast = parseSExpr(result.astSource);
    if (!ast) errors.push('Failed to parse generated AST S-Expressions via sexprParser');

    reports.push({
      name: 'Sim 1: Standard FWS Uncompressed SWF (Geometry & Frames)',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Generated ${result.metadata?.shapeCount} shapes, ${result.metadata?.frameCount} frames in ${duration.toFixed(2)}ms.`,
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 2: Curved Quadratic Bézier Curves (DefineShape3 with Q commands)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    // Tag 32: DefineShape3 (id: 2) with Bézier curve
    const curveShape = buildCurvedShapeTag(2);
    writeTag(tagWriter, 32, curveShape);

    // Tag 0: End
    writeTag(tagWriter, 0, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(640, 480, 30, 30, tagWriter.toByteArray(), 9);
    const result = await transpileSwfToAst(swfBinary, 'sim-bezier-curve');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`Transpilation failed: ${result.error}`);
    if (!result.svgMarkup.includes('Q ')) errors.push('SVG does not contain Quadratic Bézier curve "Q " command');
    if (!result.svgMarkup.includes('fill="#6366f1"')) errors.push('Expected shape fill #6366f1 not found');

    const ast = parseSExpr(result.astSource);
    if (!ast) errors.push('AST S-Expression parse failed');

    reports.push({
      name: 'Sim 2: Curved Quadratic Bézier Vectors (SVG Q Commands)',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Extracted quadratic Béziers into clean SVG path markup with bounding box ${result.metadata?.width}x${result.metadata?.height}.`,
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 3: CWS Zlib-Compressed SWF Payload (Native Decompression)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    // Tag 9: SetBackgroundColor (#1e293b)
    writeTag(tagWriter, 9, new Uint8Array([0x1e, 0x29, 0x3b]));

    // Tag 22: DefineShape2
    const shape = buildRectShapeTag(3, 100, 100, 300, 200, [234, 88, 12, 255]);
    writeTag(tagWriter, 22, shape);

    // Multiple ShowFrames
    for (let i = 0; i < 48; i++) {
      if (i === 12) {
        const lbl = new BitWriter();
        lbl.writeString('Equilibrium');
        writeTag(tagWriter, 43, lbl.toByteArray());
      }
      writeTag(tagWriter, 1, new Uint8Array(0));
    }
    writeTag(tagWriter, 0, new Uint8Array(0));

    const cwsBinary = assembleCwsSwf(720, 480, 24, 48, tagWriter.toByteArray(), 9);
    const result = await transpileSwfToAst(cwsBinary, 'sim-cws-compressed');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`CWS Decompression/Transpilation failed: ${result.error}`);
    if (result.metadata?.signature !== 'CWS') errors.push(`Expected CWS signature, got ${result.metadata?.signature}`);
    if (result.metadata?.backgroundColor !== '#1e293b') errors.push(`Expected background #1e293b, got ${result.metadata?.backgroundColor}`);
    if (!result.astSource.includes('Equilibrium')) errors.push('Keyframe label "Equilibrium" was not preserved in AST');

    const ast = parseSExpr(result.astSource);
    if (!ast) errors.push('AST S-Expression parse failed');

    reports.push({
      name: 'Sim 3: Compressed CWS SWF (Zlib Decompression Stream)',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Decompressed ${cwsBinary.length} compressed bytes into ${result.metadata?.fileLength} uncompressed bytes in ${duration.toFixed(2)}ms.`,
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 4: Adversarial & Edge-Case Robustness Testing
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const errors: string[] = [];

    // Test 4a: File too short (< 8 bytes)
    const tooShort = new Uint8Array([0x46, 0x57, 0x53]);
    const resShort = await transpileSwfToAst(tooShort, 'short');
    if (resShort.success) errors.push('Expected short file to fail gracefully');

    // Test 4b: Invalid signature
    const badSig = new Uint8Array([0x58, 0x59, 0x5a, 0x08, 0x00, 0x00, 0x00, 0x10]);
    const resBadSig = await transpileSwfToAst(badSig, 'bad-sig');
    if (resBadSig.success) errors.push('Expected bad signature to fail gracefully');

    // Test 4c: Zero-dimension rect and truncated tag length
    const corruptWriter = new BitWriter();
    corruptWriter.writeRect(0, 0, 0, 0); // 0x0 canvas
    corruptWriter.writeUI16(0);
    corruptWriter.writeUI16(0);
    // Write corrupted long tag length that exceeds payload length
    corruptWriter.writeUI16((22 << 6) | 0x3F);
    corruptWriter.writeUI32(9999999); // Exceeds payload

    const corruptBytes = corruptWriter.toByteArray();
    const corruptFull = new Uint8Array(8 + corruptBytes.length);
    corruptFull.set([0x46, 0x57, 0x53, 0x08, corruptFull.length, 0, 0, 0]);
    corruptFull.set(corruptBytes, 8);

    const resCorrupt = await transpileSwfToAst(corruptFull, 'corrupted');
    // Must not crash or hang in infinite loop, must fallback safely
    if (!resCorrupt.success) errors.push(`Corrupted SWF crashed instead of graceful fallback: ${resCorrupt.error}`);
    if (!resCorrupt.svgMarkup.includes('<svg')) errors.push('Fallback SVG missing for corrupted stream');

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 4: Adversarial & Edge-Case Input Robustness',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Validated short inputs, invalid magic headers, and out-of-bounds tag offsets without crashing.',
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 5: Realistic Educational Flash Lab (Pendulum Harmonic Motion)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    // Set dark lab background
    writeTag(tagWriter, 9, new Uint8Array([0x0b, 0x11, 0x20]));

    // Stand top bar
    const standBar = buildRectShapeTag(1, 350, 40, 100, 12, [148, 163, 184, 255]);
    writeTag(tagWriter, 22, standBar);

    // String + Bob
    const bob = buildRectShapeTag(2, 395, 52, 10, 240, [56, 189, 248, 255]);
    writeTag(tagWriter, 22, bob);

    // Milestone labels
    const milestones = [
      { frame: 1, name: 'Initial Release (Max Potential Energy)' },
      { frame: 12, name: 'Equilibrium Crossing (Max Velocity)' },
      { frame: 24, name: 'Opposite Amplitude Peak' },
      { frame: 36, name: 'Return Swing' },
      { frame: 48, name: 'Full Harmonic Period (T = 2.0s)' },
    ];

    let currentFrame = 1;
    for (const m of milestones) {
      while (currentFrame < m.frame) {
        writeTag(tagWriter, 1, new Uint8Array(0));
        currentFrame++;
      }
      const lbl = new BitWriter();
      lbl.writeString(m.name);
      writeTag(tagWriter, 43, lbl.toByteArray());
      writeTag(tagWriter, 1, new Uint8Array(0));
      currentFrame++;
    }

    writeTag(tagWriter, 0, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(800, 500, 24, 48, tagWriter.toByteArray(), 8);
    const result = await transpileSwfToAst(swfBinary, 'physics-pendulum-lab');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`Transpilation failed: ${result.error}`);
    if (result.metadata?.labels.length !== 5) errors.push(`Expected 5 milestone labels, got ${result.metadata?.labels.length}`);
    if (!result.astSource.includes('Max Potential Energy')) errors.push('Milestone text missing from AST');
    if (!result.astSource.includes('chk-swf-1')) errors.push('Interactive quiz checkpoint missing from AST');

    const ast = parseSExpr(result.astSource);
    if (!ast) errors.push('Generated AST failed S-Expression validator');

    reports.push({
      name: 'Sim 5: Realistic Educational Flash Lab (Harmonic Motion Simulation)',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Transpiled physics lab with ${result.metadata?.shapeCount} shapes, ${result.metadata?.labels.length} chapters, and active recall checkpoints.`,
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 6: MorphShape Records (Tag 46 / Tag 84) Shape Tweens & SVG Path Morphing
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    // Tag 9: SetBackgroundColor
    writeTag(tagWriter, 9, new Uint8Array([0x0f, 0x17, 0x2a]));

    // Tag 46: DefineMorphShape (id: 1)
    // Start rect: (60, 60, 120, 80) in cyan (#38bdf8), End rect: (100, 40, 200, 140) in indigo (#818cf8)
    const morphTag = buildMorphShapeTag(1, 60, 60, 120, 80, 100, 40, 200, 140, [56, 189, 248, 255], [129, 140, 248, 255], 46);
    writeTag(tagWriter, 46, morphTag);

    // Frame 1
    writeTag(tagWriter, 1, new Uint8Array(0));
    // Frame 2
    writeTag(tagWriter, 1, new Uint8Array(0));
    // Tag 0: End
    writeTag(tagWriter, 0, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(800, 480, 24, 24, tagWriter.toByteArray(), 8);
    const result = await transpileSwfToAst(swfBinary, 'sim-morph-shape');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`MorphShape transpilation failed: ${result.error}`);
    if (result.metadata?.morphShapeCount !== 1) errors.push(`Expected 1 morph shape, got ${result.metadata?.morphShapeCount}`);
    if (!result.svgMarkup.includes('id="swf-morph-1"')) errors.push('SVG markup missing morph shape element #swf-morph-1');
    if (!result.svgMarkup.includes('data-morph-end="')) errors.push('SVG markup missing data-morph-end attribute');
    if (!result.astSource.includes('astMorphPath')) errors.push('AST source missing astMorphPath binding expression');
    if (!result.astSource.includes('astMorphColor')) errors.push('AST source missing astMorphColor binding expression');

    const ast = parseSExpr(result.astSource);
    if (!ast) errors.push('Generated MorphShape AST failed S-Expression validation');

    reports.push({
      name: 'Sim 6: MorphShape Tag 46 Shape Tween (Vector Path Morphing & Color Lerp)',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Transpiled Flash MorphShape into responsive SVG with declarative 60 FPS astMorphPath and astMorphColor bindings.`,
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 7: ActionScript Bytecode (AVM1 / DoAction Tag 12) to Declarative State Machine
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    // Set lab background
    writeTag(tagWriter, 9, new Uint8Array([0x0b, 0x11, 0x20]));

    // Frame 1: Start phase with variable initialization (score = 0, level = 1)
    const act1 = buildDoActionTag({ setVariable: { name: 'score', value: 0 } });
    writeTag(tagWriter, 12, act1);
    const lbl1 = new BitWriter();
    lbl1.writeString('Start');
    writeTag(tagWriter, 43, lbl1.toByteArray());
    writeTag(tagWriter, 1, new Uint8Array(0));

    // Frame 2: Simulation active phase
    const act2 = buildDoActionTag({ setVariable: { name: 'score', value: 10 } });
    writeTag(tagWriter, 12, act2);
    const lbl2 = new BitWriter();
    lbl2.writeString('Experiment');
    writeTag(tagWriter, 43, lbl2.toByteArray());
    writeTag(tagWriter, 1, new Uint8Array(0));

    // Frame 3: Completion phase with stop() and goto
    const act3 = buildDoActionTag({ stop: true, gotoLabel: 'Start' });
    writeTag(tagWriter, 12, act3);
    const lbl3 = new BitWriter();
    lbl3.writeString('Conclusion');
    writeTag(tagWriter, 43, lbl3.toByteArray());
    writeTag(tagWriter, 1, new Uint8Array(0));

    writeTag(tagWriter, 0, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(800, 480, 24, 3, tagWriter.toByteArray(), 8);
    const result = await transpileSwfToAst(swfBinary, 'sim-actionscript-statemachine');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`ActionScript transpilation failed: ${result.error}`);
    if ((result.metadata?.actionCount || 0) < 3) errors.push(`Expected 3 action blocks, got ${result.metadata?.actionCount}`);
    if (!result.metadata?.variables || result.metadata.variables.length === 0) errors.push('Expected variables in metadata');
    if (!result.astSource.includes(':vars (')) errors.push('AST source missing (:vars block');
    if (!result.astSource.includes(':var :name "score"')) errors.push('AST source missing score variable');
    if (!result.astSource.includes(':state-machines (')) errors.push('AST source missing (:state-machines block');
    if (!result.astSource.includes(':state-machine :id "swf-state-machine"')) errors.push('AST source missing swf-state-machine');
    if (!result.astSource.includes(':state :name "start"')) errors.push('AST missing state "start"');
    if (!result.astSource.includes(':state :name "experiment"')) errors.push('AST missing state "experiment"');
    if (!result.astSource.includes(':state :name "conclusion"')) errors.push('AST missing state "conclusion"');
    if (!result.astSource.includes(':transition :from "start" :to "experiment"')) errors.push('AST missing transition from start to experiment');

    const ast = parseSExpr(result.astSource);
    if (!ast) errors.push('Generated ActionScript State Machine AST failed S-Expression validation');

    reports.push({
      name: 'Sim 7: ActionScript Bytecode (AVM1 DoAction) to Declarative State Machine',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Transpiled Flash bytecode into declarative AST state machine with ${result.metadata?.variables?.length} reactive vars and ${result.metadata?.stateMachines?.[0]?.states.length} states.`,
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 8: Multi-Fill Half-Edge Chaining (FillStyle0, FillStyle1, LineStyle + Shared Curve)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();
    const wtr = new BitWriter();

    const shapeId = 8;
    wtr.writeUI16(shapeId);
    wtr.writeRect(0, 200 * 20, 0, 100 * 20);

    // 2 solid fills (DefineShape3 RGBA): #ef4444 (fill 1) and #3b82f6 (fill 2)
    wtr.writeUI8(2);
    wtr.writeUI8(0); wtr.writeUI8(0xef); wtr.writeUI8(0x44); wtr.writeUI8(0x44); wtr.writeUI8(0xff);
    wtr.writeUI8(0); wtr.writeUI8(0x3b); wtr.writeUI8(0x82); wtr.writeUI8(0xf6); wtr.writeUI8(0xff);

    // 1 line style: 3px #facc15
    wtr.writeUI8(1);
    wtr.writeUI16(3 * 20);
    wtr.writeUI8(0xfa); wtr.writeUI8(0xcc); wtr.writeUI8(0x15); wtr.writeUI8(0xff);

    // NumFillBits = 2, NumLineBits = 1
    wtr.writeUBits(2, 4);
    wtr.writeUBits(1, 4);

    const edgeBits = 14;
    const writeStraight = (dxPx: number, dyPx: number) => {
      wtr.writeUBits(1, 1); // edge
      wtr.writeUBits(1, 1); // straight
      wtr.writeUBits(edgeBits - 2, 4);
      wtr.writeUBits(1, 1); // general
      wtr.writeSBits(dxPx * 20, edgeBits);
      wtr.writeSBits(dyPx * 20, edgeBits);
    };

    // Left half outer boundary (0,100) -> (0,0) -> (100,0) with Fill1 = 1 (right side = inside left region), Line = 1
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x01 | 0x04 | 0x08, 5); // MoveTo, Fill1, Line
    wtr.writeUBits(14, 5);
    wtr.writeSBits(0, 14);
    wtr.writeSBits(100 * 20, 14);
    wtr.writeUBits(1, 2); // Fill1 = 1
    wtr.writeUBits(1, 1); // Line = 1
    writeStraight(0, -100);  // (0,100) -> (0,0)
    writeStraight(100, 0);   // (0,0) -> (100,0)

    // Shared curved divider (100,0) -> (100,100) via control (120,50):
    // Fill0 = 2 (left side = right half), Fill1 = 1 (right side = left half), Line = 1
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x02 | 0x04, 5); // Fill0 = 2, Fill1 = 1
    wtr.writeUBits(2, 2); // Fill0 = 2
    wtr.writeUBits(1, 2); // Fill1 = 1
    wtr.writeUBits(1, 1); // edge
    wtr.writeUBits(0, 1); // curved
    wtr.writeUBits(edgeBits - 2, 4);
    wtr.writeSBits(20 * 20, edgeBits);  // ctrl dx (+20 -> 120)
    wtr.writeSBits(50 * 20, edgeBits);  // ctrl dy (+50 -> 50)
    wtr.writeSBits(-20 * 20, edgeBits); // anchor dx (-20 -> 100)
    wtr.writeSBits(50 * 20, edgeBits);  // anchor dy (+50 -> 100)

    // Left half bottom edge (100,100) -> (0,100) with Fill0 = 0, Fill1 = 1
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x02, 5); // Fill0 = 0
    wtr.writeUBits(0, 2);
    writeStraight(-100, 0); // (100,100) -> (0,100)

    // Right half outer boundary (100,0) -> (200,0) -> (200,100) -> (100,100) with Fill1 = 2, Line = 1
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x01 | 0x04, 5); // MoveTo (100,0), Fill1 = 2
    wtr.writeUBits(14, 5);
    wtr.writeSBits(100 * 20, 14);
    wtr.writeSBits(0, 14);
    wtr.writeUBits(2, 2); // Fill1 = 2
    writeStraight(100, 0);   // (100,0) -> (200,0)
    writeStraight(0, 100);   // (200,0) -> (200,100)
    writeStraight(-100, 0);  // (200,100) -> (100,100)

    // End shape
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0, 5);

    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, wtr.toByteArray());
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(400, 300, 24, 1, tagWriter.toByteArray(), 9);
    const result = await transpileSwfToAst(swfBinary, 'sim-multifill-halfedge');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`Transpilation failed: ${result.error}`);
    if (!result.svgMarkup.includes('<g id="swf-shape-8">')) errors.push('Missing <g id="swf-shape-8"> wrapper');
    if (!result.svgMarkup.includes('fill="#ef4444" stroke="none"')) errors.push('Missing distinct fill #ef4444 path');
    if (!result.svgMarkup.includes('fill="#3b82f6" stroke="none"')) errors.push('Missing distinct fill #3b82f6 path');
    if (!result.svgMarkup.includes('Q 120.0 50.0 100.0 100.0')) errors.push('Missing forward curve Q 120.0 50.0 100.0 100.0 for fill1');
    if (!result.svgMarkup.includes('Q 120.0 50.0 100.0 0.0')) errors.push('Missing reversed curve Q 120.0 50.0 100.0 0.0 for fill0 (control point preserved)');
    if (!result.svgMarkup.includes('fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"')) {
      errors.push('Missing separate stroke path with round linecap/linejoin');
    }
    const fillPathCount = (result.svgMarkup.match(/stroke="none"/g) || []).length;
    if (fillPathCount !== 2) errors.push(`Expected 2 distinct fill paths, got ${fillPathCount}`);

    reports.push({
      name: 'Sim 8: Multi-Fill Half-Edge Chaining (Fill0/Fill1 Reversal + Shared Curve)',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Chained two adjacent fills sharing a quadratic Bézier edge into 2 closed per-fill paths + 1 separate stroke path.',
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 9: In-Place NewStyles (flags & 0x10) Continuation
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();
    const wtr = new BitWriter();

    const shapeId = 9;
    wtr.writeUI16(shapeId);
    wtr.writeRect(0, 300 * 20, 0, 120 * 20);

    // Layer 1 styles: 1 fill (#22c55e), 0 lines
    wtr.writeUI8(1);
    wtr.writeUI8(0); wtr.writeUI8(0x22); wtr.writeUI8(0xc5); wtr.writeUI8(0x5e); wtr.writeUI8(0xff);
    wtr.writeUI8(0);

    wtr.writeUBits(1, 4); // numFillBits = 1
    wtr.writeUBits(0, 4); // numLineBits = 0

    const edgeBits = 14;
    const writeRectEdges = (wPx: number, hPx: number) => {
      const segs = [[wPx, 0], [0, hPx], [-wPx, 0], [0, -hPx]];
      for (const [dx, dy] of segs) {
        wtr.writeUBits(1, 1);
        wtr.writeUBits(1, 1);
        wtr.writeUBits(edgeBits - 2, 4);
        wtr.writeUBits(1, 1);
        wtr.writeSBits(dx * 20, edgeBits);
        wtr.writeSBits(dy * 20, edgeBits);
      }
    };

    // Layer 1 rect at (10, 10) 80x80 with Fill1 = 1
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x01 | 0x04, 5); // MoveTo + Fill1
    wtr.writeUBits(14, 5);
    wtr.writeSBits(10 * 20, 14);
    wtr.writeSBits(10 * 20, 14);
    wtr.writeUBits(1, 1);
    writeRectEdges(80, 80);

    // In-place StateNewStyles (flags & 0x10)
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x10, 5); // StateNewStyles only
    wtr.syncBits();

    // Layer 2 styles: 2 fills (#f59e0b, #ec4899), 1 line (#ffffff)
    wtr.writeUI8(2);
    wtr.writeUI8(0); wtr.writeUI8(0xf5); wtr.writeUI8(0x9e); wtr.writeUI8(0x0b); wtr.writeUI8(0xff);
    wtr.writeUI8(0); wtr.writeUI8(0xec); wtr.writeUI8(0x48); wtr.writeUI8(0x99); wtr.writeUI8(0xff);
    wtr.writeUI8(1);
    wtr.writeUI16(2 * 20);
    wtr.writeUI8(0xff); wtr.writeUI8(0xff); wtr.writeUI8(0xff); wtr.writeUI8(0xff);

    wtr.writeUBits(2, 4); // new numFillBits = 2
    wtr.writeUBits(1, 4); // new numLineBits = 1

    // Layer 2 rect at (150, 20) 90x70 with Fill1 = 2 (#ec4899), Line = 1 (#ffffff)
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x01 | 0x04 | 0x08, 5); // MoveTo + Fill1 + Line
    wtr.writeUBits(14, 5);
    wtr.writeSBits(150 * 20, 14);
    wtr.writeSBits(20 * 20, 14);
    wtr.writeUBits(2, 2); // Fill1 = 2
    wtr.writeUBits(1, 1); // Line = 1
    writeRectEdges(90, 70);

    // End shape
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0, 5);

    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, wtr.toByteArray());
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(400, 300, 24, 1, tagWriter.toByteArray(), 9);
    const result = await transpileSwfToAst(swfBinary, 'sim-newstyles');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`Transpilation failed: ${result.error}`);
    if (!result.svgMarkup.includes('fill="#22c55e" stroke="none"')) errors.push('Layer 1 fill #22c55e missing');
    if (!result.svgMarkup.includes('fill="#ec4899" stroke="none"')) errors.push('Layer 2 fill #ec4899 missing (NewStyles 0x10 truncated)');
    if (!result.svgMarkup.includes('stroke="#ffffff" stroke-width="2"')) errors.push('Layer 2 stroke #ffffff missing');

    reports.push({
      name: 'Sim 9: In-Place NewStyles (flags & 0x10) Multi-Layer Parsing',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Flushed Layer 1 (#22c55e), synced bitstream, re-read updated Fill/Line tables, and parsed Layer 2 (#ec4899 + #ffffff).',
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 10: DefineShape4 (Tag 83) LineStyle2 Bit-Stream Alignment
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();
    const wtr = new BitWriter();

    const shapeId = 10;
    wtr.writeUI16(shapeId);
    wtr.writeRect(0, 200 * 20, 0, 150 * 20); // ShapeBounds
    wtr.writeRect(0, 200 * 20, 0, 150 * 20); // EdgeBounds
    wtr.writeUI8(0x01); // UsesScalingStrokes flag

    // FillStyles: 1 solid fill (#14b8a6)
    wtr.writeUI8(1);
    wtr.writeUI8(0); wtr.writeUI8(0x14); wtr.writeUI8(0xb8); wtr.writeUI8(0xa6); wtr.writeUI8(0xff);

    // LineStyles2: 2 entries
    wtr.writeUI8(2);
    // Entry 1: Width 4px, StartCap=0, JoinStyle=2 (Miter -> reads MiterLimitFactor UI16), HasFillFlag=0 (RGBA #f97316)
    wtr.writeUI16(4 * 20);
    wtr.writeUBits(0, 2); // StartCapStyle
    wtr.writeUBits(2, 2); // JoinStyle = 2 (Miter)
    wtr.writeUBits(0, 1); // HasFillFlag = 0
    wtr.writeUBits(0, 1); // NoHScaleFlag
    wtr.writeUBits(0, 1); // NoVScaleFlag
    wtr.writeUBits(1, 1); // PixelHintingFlag
    wtr.writeUBits(0, 5); // Reserved
    wtr.writeUBits(0, 1); // NoClose
    wtr.writeUBits(0, 2); // EndCapStyle
    wtr.writeUI16(3 * 256); // MiterLimitFactor = 3.0 (8.8 fixed)
    wtr.writeUI8(0xf9); wtr.writeUI8(0x73); wtr.writeUI8(0x16); wtr.writeUI8(0xff);

    // Entry 2: Width 2px, StartCap=1, JoinStyle=0 (Round), HasFillFlag=1 (FILLSTYLE solid #a855f7)
    wtr.writeUI16(2 * 20);
    wtr.writeUBits(1, 2); // StartCapStyle
    wtr.writeUBits(0, 2); // JoinStyle = 0
    wtr.writeUBits(1, 1); // HasFillFlag = 1
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0, 5);
    wtr.writeUBits(0, 1);
    wtr.writeUBits(1, 2);
    // Embedded FILLSTYLE (solid #a855f7)
    wtr.writeUI8(0);
    wtr.writeUI8(0xa8); wtr.writeUI8(0x55); wtr.writeUI8(0xf7); wtr.writeUI8(0xff);

    // NumFillBits = 1, NumLineBits = 2
    wtr.writeUBits(1, 4);
    wtr.writeUBits(2, 4);

    const edgeBits = 14;
    const writeLine = (dxPx: number, dyPx: number) => {
      wtr.writeUBits(1, 1);
      wtr.writeUBits(1, 1);
      wtr.writeUBits(edgeBits - 2, 4);
      wtr.writeUBits(1, 1);
      wtr.writeSBits(dxPx * 20, edgeBits);
      wtr.writeSBits(dyPx * 20, edgeBits);
    };

    // Draw triangle with Fill1 = 1 (#14b8a6), Line 1 (#f97316) on 2 edges and Line 2 (#a855f7) on 1 edge
    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x01 | 0x04 | 0x08, 5);
    wtr.writeUBits(14, 5);
    wtr.writeSBits(20 * 20, 14);
    wtr.writeSBits(20 * 20, 14);
    wtr.writeUBits(1, 1); // Fill1 = 1
    wtr.writeUBits(1, 2); // Line = 1
    writeLine(100, 0);
    writeLine(-50, 80);

    wtr.writeUBits(0, 1);
    wtr.writeUBits(0x08, 5); // Switch to Line = 2
    wtr.writeUBits(2, 2);
    writeLine(-50, -80);

    wtr.writeUBits(0, 1);
    wtr.writeUBits(0, 5); // End

    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE4, wtr.toByteArray());
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(400, 300, 24, 1, tagWriter.toByteArray(), 9);
    const result = await transpileSwfToAst(swfBinary, 'sim-defineshape4-linestyle2');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`Transpilation failed: ${result.error}`);
    if (!result.svgMarkup.includes('fill="#14b8a6" stroke="none"')) errors.push('DefineShape4 fill #14b8a6 missing (bitstream misaligned)');
    if (!result.svgMarkup.includes('stroke="#f97316" stroke-width="4"')) errors.push('LineStyle2 entry 1 (MiterLimit + RGBA #f97316) missing');
    if (!result.svgMarkup.includes('stroke="#a855f7" stroke-width="2"')) errors.push('LineStyle2 entry 2 (HasFillFlag=1 FILLSTYLE #a855f7) missing');

    reports.push({
      name: 'Sim 10: DefineShape4 LineStyle2 Alignment (MiterLimit + HasFillFlag)',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Aligned DefineShape4 LineStyle2 (MiterLimitFactor + embedded FILLSTYLE) with zero bitstream drift.',
      errors
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 11: Empty Shape (Zero Bounding-Box Artifact) & PlaceObject2/3 Matrices
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    // Shape 11: Empty DefineShape2 (bounds 0..200 x 0..100, zero edges)
    const emptyWtr = new BitWriter();
    emptyWtr.writeUI16(11);
    emptyWtr.writeRect(0, 200 * 20, 0, 100 * 20);
    emptyWtr.writeUI8(1); // 1 fill style defined, never drawn
    emptyWtr.writeUI8(0); emptyWtr.writeUI8(0xff); emptyWtr.writeUI8(0x00); emptyWtr.writeUI8(0x00);
    emptyWtr.writeUI8(0); // 0 line styles
    emptyWtr.writeUBits(1, 4);
    emptyWtr.writeUBits(0, 4);
    emptyWtr.writeUBits(0, 1);
    emptyWtr.writeUBits(0, 5); // EndShapeRecord immediately
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE2, emptyWtr.toByteArray());

    // Shape 12: Solid rect placed with PlaceObject2 scale + translate matrix
    const rect12 = buildRectShapeTag(12, 0, 0, 40, 20, [56, 189, 248, 255], 2);
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE2, rect12);

    // Helper to write a SWF MATRIX
    const writeSwfMatrix = (
      w: BitWriter,
      opts: { scaleX?: number; scaleY?: number; rot0?: number; rot1?: number; txPx?: number; tyPx?: number }
    ) => {
      w.syncBits();
      if (opts.scaleX !== undefined && opts.scaleY !== undefined) {
        w.writeUBits(1, 1); // HasScale
        w.writeUBits(20, 5);
        w.writeSBits(Math.round(opts.scaleX * 65536), 20);
        w.writeSBits(Math.round(opts.scaleY * 65536), 20);
      } else {
        w.writeUBits(0, 1);
      }
      if (opts.rot0 !== undefined && opts.rot1 !== undefined) {
        w.writeUBits(1, 1); // HasRotate
        w.writeUBits(20, 5);
        w.writeSBits(Math.round(opts.rot0 * 65536), 20);
        w.writeSBits(Math.round(opts.rot1 * 65536), 20);
      } else {
        w.writeUBits(0, 1);
      }
      const txTwips = Math.round((opts.txPx || 0) * 20);
      const tyTwips = Math.round((opts.tyPx || 0) * 20);
      w.writeUBits(16, 5);
      w.writeSBits(txTwips, 16);
      w.writeSBits(tyTwips, 16);
      w.syncBits();
    };

    // Tag 26: PlaceObject2 for Shape 12 at depth 1 (scale 2x, 1.5y, translate 120, 75)
    const place2 = new BitWriter();
    place2.writeUI8(0x02 | 0x04); // HasCharacter | HasMatrix
    place2.writeUI16(1); // depth 1
    place2.writeUI16(12); // charId 12
    writeSwfMatrix(place2, { scaleX: 2, scaleY: 1.5, txPx: 120, tyPx: 75 });
    writeTag(tagWriter, 26, place2.toByteArray());

    // Tag 70: PlaceObject3 for Shape 12 at depth 2 (rotate/skew + translate 260, 140)
    const place3 = new BitWriter();
    place3.writeUI8(0x02 | 0x04); // flags1: HasCharacter | HasMatrix
    place3.writeUI8(0x00);        // flags2
    place3.writeUI16(2);          // depth 2
    place3.writeUI16(12);         // charId 12
    writeSwfMatrix(place3, { scaleX: 1, scaleY: 1, rot0: 0.5, rot1: -0.5, txPx: 260, tyPx: 140 });
    writeTag(tagWriter, 70, place3.toByteArray());

    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(640, 480, 24, 1, tagWriter.toByteArray(), 9);
    const result = await transpileSwfToAst(swfBinary, 'sim-empty-and-matrices');
    const duration = performance.now() - start;

    const errors: string[] = [];
    if (!result.success) errors.push(`Transpilation failed: ${result.error}`);
    if (!result.svgMarkup.includes('<g id="swf-shape-11" />')) {
      errors.push('Empty shape 11 did not emit clean self-closing <g id="swf-shape-11" />');
    }
    if (result.svgMarkup.includes('#ff0000')) {
      errors.push('Empty shape 11 emitted a solid bounding-box artifact (#ff0000)');
    }
    if (!result.svgMarkup.includes('transform="matrix(2 0 0 1.5 120 75)"')) {
      errors.push('PlaceObject2 transform="matrix(2 0 0 1.5 120 75)" missing');
    }
    if (!result.svgMarkup.includes('transform="matrix(1 0.5 -0.5 1 260 140)"')) {
      errors.push('PlaceObject3 transform="matrix(1 0.5 -0.5 1 260 140)" missing');
    }

    reports.push({
      name: 'Sim 11: Empty Shape (No Bounding-Box Artifact) & PlaceObject2/3 Matrices',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified empty <g id="swf-shape-11" /> without fallback rects and exact SVG matrix() transforms on PlaceObject2 & PlaceObject3.',
      errors
    });
  }

  // --------------------------------------------------------------------------
  // Headless AST/.astb Runtime Harness for Live SWF Execution Verification
  // --------------------------------------------------------------------------
  function createHeadlessSwfRuntime(astSource: string, svgMarkup: string) {
    const playerDir = path.resolve(process.cwd(), 'static/player');
    const mockNodes = new Map<string, any>();
    let totalNodesCreated = 0;

    // Parse all id="..." elements from SVG into lightweight mock DOM nodes
    const idRe = /<([a-zA-Z0-9_-]+)((?:\s+[^>]*?)?\s+)id="([^"]+)"([^>]*)>/g;
    let m: RegExpExecArray | null;
    while ((m = idRe.exec(svgMarkup)) !== null) {
      const tag = m[1];
      const attrChunk = `${m[2]} id="${m[3]}" ${m[4]}`;
      const id = m[3];
      const attrs = new Map<string, string>();
      const aRe = /([a-zA-Z0-9_:-]+)="([^"]*)"/g;
      let am: RegExpExecArray | null;
      while ((am = aRe.exec(attrChunk)) !== null) {
        attrs.set(am[1], am[2]);
      }
      totalNodesCreated++;
      const node: any = {
        tagName: tag.toUpperCase(),
        id,
        attrs,
        style: {},
        textContent: '',
        setAttribute(k: string, v: any) { attrs.set(k, String(v)); },
        getAttribute(k: string) { return attrs.has(k) ? attrs.get(k)! : null; },
        removeAttribute(k: string) { attrs.delete(k); },
        hasAttribute(k: string) { return attrs.has(k); },
        matches(sel: string) { return sel === `#${id}`; },
        closest(sel: string) { return sel === `#${id}` ? node : null; },
        getBoundingClientRect() { return { left: 0, top: 0, width: 40, height: 40 }; },
      };
      mockNodes.set(id, node);
    }

    const container: any = {
      style: {},
      querySelector(sel: string) {
        if (!sel || !sel.startsWith('#')) return null;
        return mockNodes.get(sel.slice(1)) || null;
      },
      querySelectorAll(sel: string) {
        const el = this.querySelector(sel);
        return el ? [el] : [];
      },
      addEventListener() {},
      removeEventListener() {},
      appendChild(c: any) { return c; },
      insertBefore(c: any) { return c; },
      removeChild(c: any) { return c; },
      contains() { return true; },
    };

    let mounted = false;
    let postMountDomAllocs = 0;
    const makeStubEl = (tag: string) => {
      if (mounted) postMountDomAllocs++;
      return {
        tagName: String(tag || 'DIV').toUpperCase(),
        style: {},
        attrs: new Map<string, string>(),
        setAttribute(k: string, v: any) { this.attrs.set(k, String(v)); },
        getAttribute(k: string) { return this.attrs.get(k) ?? null; },
        removeAttribute(k: string) { this.attrs.delete(k); },
        hasAttribute(k: string) { return this.attrs.has(k); },
        appendChild(c: any) { return c; },
        remove() {},
        pause() {},
        play() { return Promise.resolve(); },
        load() {},
        addEventListener() {},
        removeEventListener() {},
      };
    };

    const listeners = new Map<string, Function[]>();
    const sandbox: any = {
      console,
      Math,
      Number,
      String,
      Boolean,
      Array,
      Object,
      Map,
      Set,
      RegExp,
      JSON,
      Date,
      Float32Array,
      Float64Array,
      Uint8Array,
      Int32Array,
      Uint16Array,
      DataView,
      ArrayBuffer,
      TextDecoder,
      TextEncoder,
      performance,
      setTimeout,
      clearTimeout,
      requestAnimationFrame: () => 0,
      cancelAnimationFrame: () => {},
      document: {
        activeElement: null,
        getElementById(id: string) { return mockNodes.get(id) || null; },
        querySelector(sel: string) { return container.querySelector(sel); },
        querySelectorAll(sel: string) { return container.querySelectorAll(sel); },
        createElement(tag: string) { return makeStubEl(tag); },
        createElementNS(_ns: string, tag: string) { return makeStubEl(tag); },
        addEventListener(ev: string, fn: Function) {
          if (!listeners.has(ev)) listeners.set(ev, []);
          listeners.get(ev)!.push(fn);
        },
        removeEventListener() {},
      },
    };
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    sandbox.globalThis = sandbox;
    sandbox.addEventListener = sandbox.document.addEventListener;
    sandbox.removeEventListener = () => {};

    const ctx = vm.createContext(sandbox);
    const loadScript = (name: string) => {
      const code = fs.readFileSync(path.join(playerDir, name), 'utf8');
      vm.runInContext(code, ctx, { filename: name });
    };

    loadScript('ast-expr.js');
    loadScript('ast-parser.js');
    loadScript('ast-bytecode-decoder.js');
    loadScript('ast-binding-runtime.js');
    loadScript('ast-scene-mount.js');
    loadScript('ast-engine.js');
    loadScript('site-gestures-actions.js');
    loadScript('site-gestures-input.js');
    loadScript('site-gestures.js');

    // 1. Parse .ast -> Compile to binary .astb -> Decode back from .astb!
    const parsedScene = sandbox.parseAst(astSource);
    const astbBytes = compileSceneToBytecode({
      ...parsedScene,
      completeBinary: true,
      svgMarkup,
    });
    const decodedScene = sandbox.decompileBytecode(astbBytes);

    // 2. Boot engine + gesture subsystem against the decoded .astb scene
    const engine = new sandbox.ASTVectorPlayerEngine({ container });
    // Clear svgText/svgMarkup on the runtime copy since our mock container already holds the pre-parsed SVG DOM
    const runtimeScene = { ...decodedScene, svgMarkup: undefined, svgText: undefined };
    engine.scene = runtimeScene;
    engine.activePresetId = runtimeScene.id;
    engine.isContinuousSim = true;
    engine.isPlaying = true;
    engine.mountSceneAsset(runtimeScene, container);
    engine._mountedSceneId = runtimeScene.id;
    engine._mountedContainer = container;
    engine.applyBindings(0, 1 / 60, false);
    mounted = true;

    const gestures = new sandbox.ASTDirectGestureSubsystem(engine, container);

    const tick = (frames = 1, dtSec = 1 / 60) => {
      for (let i = 0; i < frames; i++) {
        engine.applyBindings(0, dtSec, true);
      }
    };
    const keyDown = (code: string, key = code) => {
      gestures.handleKeyDown({
        code,
        key,
        repeat: false,
        preventDefault() {},
        stopImmediatePropagation() {},
      });
    };
    const keyUp = (code: string, key = code) => {
      gestures.handleKeyUp({
        code,
        key,
        preventDefault() {},
        stopImmediatePropagation() {},
      });
    };
    const clickButton = (domId: string) => {
      const el = mockNodes.get(domId);
      const list = gestures._getNormalizedSceneGestures(engine.scene);
      const matches = list.filter((g: any) => g.type === 'clickable' && g.target === `#${domId}`);
      for (const g of matches) {
        gestures._applyGesturePress(g, el || null, engine.scene);
      }
      engine.applyBindings(0, 0, false);
      return matches.length;
    };

    return {
      astbBytes,
      decodedScene,
      engine,
      gestures,
      mockNodes,
      getNodeCount: () => mockNodes.size,
      getPostMountDomAllocs: () => postMountDomAllocs,
      totalNodesCreated,
      tick,
      keyDown,
      keyUp,
      clickButton,
    };
  }

  // --------------------------------------------------------------------------
  // Simulation 12: ablast (Arcade Shooter — DefineSprite, Key.isDown, hitTest, DefineButton2, Zero-GC Pool)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    const bg = new BitWriter();
    bg.writeUI8(10); bg.writeUI8(15); bg.writeUI8(30);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    // Shapes: 1=Ship, 2=Enemy, 3=Bullet, 4=StartBtn
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, -15, -15, 30, 30, [56, 189, 248, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, -16, -16, 32, 32, [244, 63, 94, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, -4, -10, 8, 20, [250, 204, 21, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(4, 0, 0, 120, 40, [34, 197, 94, 255], 3));

    // DefineSprite 5: Animated Enemy (2 frames: moves + pulses alpha)
    const enemySpriteTags = new BitWriter();
    writeTag(enemySpriteTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 2, matrix: { txPx: 0, tyPx: 0 }, alpha: 1.0 }));
    writeTag(enemySpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(enemySpriteTags, 26, buildPlaceObject2Tag({ depth: 1, move: true, matrix: { txPx: 8, tyPx: -4 }, alpha: 0.75 }));
    writeTag(enemySpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(enemySpriteTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(5, 2, enemySpriteTags.toByteArray()));

    // DefineButton2 10: Start button -> on(release) { game_active = 1; gotoAndPlay("play"); }
    const startBtnAction = new Avm1Builder()
      .setVar('game_active', (b) => b.pushInt(1))
      .callFunction('gotoAndPlay', [(b) => b.pushStr('play')])
      .pop()
      .toByteArray();
    writeTag(tagWriter, 34, buildDefineButton2Tag(
      10,
      [{ states: 0x0F, characterId: 4, depth: 1, matrix: { txPx: 260, tyPx: 200 } }],
      [{ condFlags: 0x0008, actions: startBtnAction }]
    ));

    // Frame 1: "title" with stop() and Start button
    const lbl1 = new BitWriter(); lbl1.writeString('title');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, lbl1.toByteArray());
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().setVar('game_active', (b) => b.pushInt(0)).stop().toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 10 }));

    // Ship with onClipEvent(load) + onClipEvent(enterFrame): Key.isDown(37/39/32) + duplicateMovieClip
    const shipLoad = new Avm1Builder()
      .setVar('score', (b) => b.pushInt(0))
      .setVar('speed', (b) => b.pushInt(8))
      .toByteArray();
    const shipEnter = new Avm1Builder()
      .ifBlock(
        (b) => b.callMethod('Key', 'isDown', [(a) => a.pushInt(37)]),
        (b) => b.setMember('this', '_x', (v) => v.getMember('this', '_x').getVar('speed').sub())
      )
      .ifBlock(
        (b) => b.callMethod('Key', 'isDown', [(a) => a.pushInt(39)]),
        (b) => b.setMember('this', '_x', (v) => v.getMember('this', '_x').getVar('speed').add2())
      )
      .ifBlock(
        (b) => b.callMethod('Key', 'isDown', [(a) => a.pushInt(32)]),
        (b) => {
          b.setMember('bullet', '_x', (v) => v.getMember('this', '_x'));
          b.setMember('bullet', '_y', (v) => v.getMember('this', '_y'));
          b.setMember('bullet', '_visible', (v) => v.pushInt(1));
          b.callFunction('duplicateMovieClip', [(a) => a.pushStr('bullet'), (a) => a.pushStr('shot'), (a) => a.pushInt(100)]).pop();
        }
      )
      .toByteArray();

    writeTag(tagWriter, 26, buildPlaceObject2Tag({
      depth: 2,
      characterId: 1,
      matrix: { txPx: 200, tyPx: 200 },
      name: 'ship',
      clipActions: [
        { eventFlags: 0x0001, actions: shipLoad },
        { eventFlags: 0x0002, actions: shipEnter },
      ],
    }));

    // Enemy sprite placed at (200, 120)
    writeTag(tagWriter, 26, buildPlaceObject2Tag({
      depth: 3,
      characterId: 5,
      matrix: { txPx: 200, tyPx: 120 },
      name: 'enemy',
    }));

    // Bullet clip with enterFrame upward movement + hitTest(enemy) -> score += 10
    const bulletLoad = new Avm1Builder()
      .setMember('this', '_visible', (v) => v.pushInt(0))
      .toByteArray();
    const bulletEnter = new Avm1Builder()
      .ifBlock(
        (b) => b.pushInt(0).getMember('this', '_visible').less2(),
        (b) => b.setMember('this', '_y', (v) => v.getMember('this', '_y').pushInt(20).sub())
      )
      .ifBlock(
        (b) => b.callMethod('this', 'hitTest', [(a) => a.getVar('enemy')]),
        (b) => {
          b.setMember('_root', 'score', (v) => v.getMember('_root', 'score').pushInt(10).add2());
          b.setMember('this', '_visible', (v) => v.pushInt(0));
        }
      )
      .toByteArray();
    writeTag(tagWriter, 26, buildPlaceObject2Tag({
      depth: 4,
      characterId: 3,
      matrix: { txPx: 200, tyPx: 200 },
      name: 'bullet',
      clipActions: [
        { eventFlags: 0x0001, actions: bulletLoad },
        { eventFlags: 0x0002, actions: bulletEnter },
      ],
    }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 2: "play" (Remove Start button, gameplay active)
    const lbl2 = new BitWriter(); lbl2.writeString('play');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, lbl2.toByteArray());
    writeTag(tagWriter, 28, buildRemoveObject2Tag(1));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(640, 480, 30, 2, tagWriter.toByteArray(), 7);
    const result = await transpileSwfToAst(swfBinary, 'ablast');
    const errors: string[] = [];

    if (!result.success) {
      errors.push(`ablast transpilation failed: ${result.error}`);
    } else {
      try {
        parseSExpr(result.astSource);
      } catch (e: any) {
        errors.push(`ablast AST S-expression parse error: ${e.message}`);
      }
      const rt = createHeadlessSwfRuntime(result.astSource, result.svgMarkup);
      if (!isAstBytecode(rt.astbBytes)) errors.push('ablast .astb binary missing ASTB magic header');
      const initialNodes = rt.getNodeCount();

      // Verify initial state (stopped on frame 1 "title")
      if (rt.engine.vars.swf_frame !== 1) errors.push(`Expected initial swf_frame=1, got ${rt.engine.vars.swf_frame}`);
      if (rt.engine.vars.swf_playing !== 0) errors.push(`Expected initial swf_playing=0, got ${rt.engine.vars.swf_playing}`);
      if (rt.engine.vars.ship_x !== 200) errors.push(`Expected initial ship_x=200, got ${rt.engine.vars.ship_x}`);

      // Click DefineButton2 Start button -> jumps to frame 2 ("play") & sets game_active = 1
      const btnHits = rt.clickButton('swf-btn-10');
      if (btnHits < 1) errors.push('DefineButton2 #swf-btn-10 click handler not registered');
      if (rt.engine.vars.game_active !== 1) errors.push(`Expected game_active=1 after click, got ${rt.engine.vars.game_active}`);
      if (rt.engine.vars.swf_frame !== 2) errors.push(`Expected swf_frame=2 after gotoAndPlay("play"), got ${rt.engine.vars.swf_frame}`);

      // Hold ArrowRight for 5 ticks -> ship_x: 200 -> 240, then release -> stays 240
      rt.keyDown('ArrowRight', 'ArrowRight');
      rt.tick(5);
      rt.keyUp('ArrowRight', 'ArrowRight');
      if (rt.engine.vars.ship_x !== 240) errors.push(`Expected ship_x=240 after 5 ArrowRight ticks, got ${rt.engine.vars.ship_x}`);
      const shipTransformAfterRight = rt.mockNodes.get('swf-inst-ship')?.getAttribute('transform') || '';
      if (!shipTransformAfterRight.includes('translate(240, 200)')) {
        errors.push(`Expected #swf-inst-ship transform to contain translate(240, 200), got "${shipTransformAfterRight}"`);
      }
      rt.tick(3);
      if (rt.engine.vars.ship_x !== 240) errors.push(`ship_x drifted after ArrowRight keyup: ${rt.engine.vars.ship_x}`);

      // Hold ArrowLeft for 5 ticks -> ship_x returns to 200 (aligned under enemy)
      rt.keyDown('ArrowLeft', 'ArrowLeft');
      rt.tick(5);
      rt.keyUp('ArrowLeft', 'ArrowLeft');
      if (rt.engine.vars.ship_x !== 200) errors.push(`Expected ship_x=200 after ArrowLeft return, got ${rt.engine.vars.ship_x}`);

      // Fire with Space -> bullet activates, pool slot activates, travels up & hits enemy -> score = 10
      rt.keyDown('Space', ' ');
      rt.tick(1);
      rt.keyUp('Space', ' ');
      if (rt.engine.vars.shot_0_visible !== 1) errors.push(`Expected pre-allocated shot_0 pool slot visible=1, got ${rt.engine.vars.shot_0_visible}`);
      rt.tick(6);
      if (rt.engine.vars.score !== 10) errors.push(`Expected score=10 after bullet.hitTest(enemy), got ${rt.engine.vars.score}`);
      if (rt.engine.vars.bullet_visible !== 0) errors.push(`Expected bullet_visible=0 after hitTest, got ${rt.engine.vars.bullet_visible}`);

      // Verify animated enemy DefineSprite frame advancement & matrix/opacity mutation
      const enemyFramesSeen = new Set<number>();
      const enemyChild = rt.mockNodes.get('swf-inst-enemy-d1');
      const enemyOpacities = new Set<string>();
      for (let f = 0; f < 10; f++) {
        rt.tick(1);
        enemyFramesSeen.add(rt.engine.vars.enemy_frame);
        if (enemyChild) enemyOpacities.add(enemyChild.getAttribute('opacity') || '1');
      }
      if (!enemyFramesSeen.has(1) || !enemyFramesSeen.has(2)) {
        errors.push(`Expected enemy DefineSprite to cycle frames 1 & 2, saw: ${Array.from(enemyFramesSeen).join(',')}`);
      }
      if (enemyOpacities.size < 2) {
        errors.push(`Expected enemy DefineSprite CXForm alpha animation, saw opacities: ${Array.from(enemyOpacities).join(',')}`);
      }

      // Zero-GC / zero DOM allocation check over 120 frames
      rt.tick(120);
      if (rt.getNodeCount() !== initialNodes || rt.getPostMountDomAllocs() !== 0) {
        errors.push(`Zero-GC DOM invariant violated: nodes ${initialNodes}->${rt.getNodeCount()}, postMountDomAllocs=${rt.getPostMountDomAllocs()}`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 12: ablast Arcade Shooter (DefineSprite, Key.isDown, hitTest, DefineButton2, .astb & Zero-GC Pool)',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Executed ablast in .astb VM (${result.metadata?.spriteCount} sprites, ${result.metadata?.buttonCount} buttons, ${result.metadata?.ruleCount} rules, ${result.metadata?.poolSlotCount} pre-allocated pool slots) with live input, hitTest scoring & 0 DOM allocations across 120 ticks.`,
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Simulation 13: 2dknockout (2D Fighter — Sprite Timelines, RemoveObject2, WASD/KeyPress, ActionIf KO)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    const bg = new BitWriter();
    bg.writeUI8(15); bg.writeUI8(23); bg.writeUI8(42);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    // Shapes: 1=Fighter1, 2=Fighter2, 3=HitSpark, 4=PunchBtn, 5=Banner
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, -20, -40, 40, 80, [59, 130, 246, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, -20, -40, 40, 80, [239, 68, 68, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, -10, -10, 20, 20, [250, 204, 21, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(4, 0, 0, 100, 36, [249, 115, 22, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(5, 0, 0, 180, 24, [168, 85, 247, 255], 3));

    // DefineSprite 6: Fighter1 3-frame animation (frame 1 idle, frame 2 strike + HitSpark, frame 3 RemoveObject2 HitSpark)
    const f1Tags = new BitWriter();
    writeTag(f1Tags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 1, matrix: { txPx: 0, tyPx: 0 } }));
    writeTag(f1Tags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(f1Tags, 26, buildPlaceObject2Tag({ depth: 1, move: true, matrix: { txPx: 14, tyPx: 0 } }));
    writeTag(f1Tags, 26, buildPlaceObject2Tag({ depth: 2, characterId: 3, matrix: { txPx: 30, tyPx: -10 } }));
    writeTag(f1Tags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(f1Tags, 26, buildPlaceObject2Tag({ depth: 1, move: true, matrix: { txPx: 4, tyPx: 0 } }));
    writeTag(f1Tags, 28, buildRemoveObject2Tag(2));
    writeTag(f1Tags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(f1Tags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(6, 3, f1Tags.toByteArray()));

    // DefineButton2 20: Punch button with BOTH on(release) click AND on(keyPress 'j' = 106)
    const punchAct = new Avm1Builder()
      .setVar('p2_hp', (b) => b.getVar('p2_hp').pushInt(35).sub())
      .toByteArray();
    const condReleaseAndKeyJ = 0x0008 | ((106 & 0x7F) << 9);
    writeTag(tagWriter, 34, buildDefineButton2Tag(
      20,
      [{ states: 0x0F, characterId: 4, depth: 1, matrix: { txPx: 20, tyPx: 400 } }],
      [{ condFlags: condReleaseAndKeyJ, actions: punchAct }]
    ));

    // Frame 1: "fight"
    const fLbl1 = new BitWriter(); fLbl1.writeString('fight');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, fLbl1.toByteArray());
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder()
      .setVar('p2_hp', (b) => b.pushInt(100))
      .setVar('ko', (b) => b.pushInt(0))
      .toByteArray());

    // Place Fighter1 with WASD Key.isDown(68 'D') lunge & KO check (p2_hp < 1 -> ko = 1; _root.gotoAndStop("ko"))
    const f1Enter = new Avm1Builder()
      .ifBlock(
        (b) => b.callMethod('Key', 'isDown', [(a) => a.pushInt(68)]),
        (b) => b.setMember('this', '_x', (v) => v.getMember('this', '_x').pushInt(10).add2())
      )
      .ifBlock(
        (b) => b.getVar('p2_hp').pushInt(1).less2(),
        (b) => {
          b.setVar('ko', (v) => v.pushInt(1));
          b.callMethod('_root', 'gotoAndStop', [(a) => a.pushStr('ko')]).pop();
        }
      )
      .toByteArray();
    writeTag(tagWriter, 26, buildPlaceObject2Tag({
      depth: 1,
      characterId: 6,
      matrix: { txPx: 160, tyPx: 300 },
      name: 'fighter1',
      clipActions: [{ eventFlags: 0x0002, actions: f1Enter }],
    }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({
      depth: 2,
      characterId: 2,
      matrix: { txPx: 420, tyPx: 300 },
      name: 'fighter2',
    }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 3, characterId: 20 }));
    // Animated non-named display-list banner: present on frames 1 & 2 (moving + alpha), removed on frame 3 ("ko")
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 4, characterId: 5, matrix: { txPx: 100, tyPx: 30 }, alpha: 1.0 }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 2: "round2" (banner moves & fades)
    const fLbl2 = new BitWriter(); fLbl2.writeString('round2');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, fLbl2.toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 4, move: true, matrix: { txPx: 150, tyPx: 30 }, alpha: 0.5 }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 3: "ko" (RemoveObject2 removes depth 4 banner)
    const fLbl3 = new BitWriter(); fLbl3.writeString('ko');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, fLbl3.toByteArray());
    writeTag(tagWriter, 28, buildRemoveObject2Tag(4));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(640, 480, 30, 3, tagWriter.toByteArray(), 7);
    const result = await transpileSwfToAst(swfBinary, '2dknockout');
    const errors: string[] = [];

    if (!result.success) {
      errors.push(`2dknockout transpilation failed: ${result.error}`);
    } else {
      try {
        parseSExpr(result.astSource);
      } catch (e: any) {
        errors.push(`2dknockout AST S-expression parse error: ${e.message}`);
      }
      const rt = createHeadlessSwfRuntime(result.astSource, result.svgMarkup);
      if (!isAstBytecode(rt.astbBytes)) errors.push('2dknockout .astb binary missing ASTB magic header');
      const initialNodes = rt.getNodeCount();

      // Verify WASD KeyD lunge
      rt.keyDown('KeyD', 'd');
      rt.tick(3);
      rt.keyUp('KeyD', 'd');
      if (rt.engine.vars.fighter1_x !== 190) {
        errors.push(`Expected fighter1_x=190 after 3 KeyD ticks, got ${rt.engine.vars.fighter1_x}`);
      }

      // Verify Fighter1 DefineSprite 3-frame animation & HitSpark RemoveObject2 display toggle
      const hitSparkNode = rt.mockNodes.get('swf-inst-fighter1-d2');
      const sparkDisplays = new Set<string>();
      for (let f = 0; f < 6; f++) {
        rt.tick(1);
        if (hitSparkNode) sparkDisplays.add(hitSparkNode.getAttribute('display') || 'inline');
      }
      if (!sparkDisplays.has('inline') || !sparkDisplays.has('none')) {
        errors.push(`Expected Fighter1 HitSpark RemoveObject2 display toggling inline/none, saw: ${Array.from(sparkDisplays).join(',')}`);
      }

      // Verify DefineButton2 click + on(keyPress "j") deducts p2_hp and triggers KO branch!
      if (rt.engine.vars.p2_hp !== 100) errors.push(`Expected initial p2_hp=100, got ${rt.engine.vars.p2_hp}`);
      rt.clickButton('swf-btn-20');
      if (rt.engine.vars.p2_hp !== 65) errors.push(`Expected p2_hp=65 after button click, got ${rt.engine.vars.p2_hp}`);
      rt.keyDown('KeyJ', 'j');
      rt.keyUp('KeyJ', 'j');
      if (rt.engine.vars.p2_hp !== 30) errors.push(`Expected p2_hp=30 after KeyJ press, got ${rt.engine.vars.p2_hp}`);
      rt.keyDown('KeyJ', 'j');
      rt.keyUp('KeyJ', 'j');
      if (rt.engine.vars.p2_hp !== -5) errors.push(`Expected p2_hp=-5 after second KeyJ press, got ${rt.engine.vars.p2_hp}`);

      // Step 2 ticks so ActionIf (p2_hp < 1) triggers ko = 1, swf_frame = 3 ("ko"), swf_playing = 0, and banner hides
      rt.tick(2);
      if (rt.engine.vars.ko !== 1) errors.push(`Expected ko=1 after p2_hp < 1, got ${rt.engine.vars.ko}`);
      if (rt.engine.vars.swf_frame !== 3) errors.push(`Expected swf_frame=3 ("ko"), got ${rt.engine.vars.swf_frame}`);
      if (rt.engine.vars.swf_playing !== 0) errors.push(`Expected swf_playing=0 after gotoAndStop("ko"), got ${rt.engine.vars.swf_playing}`);
      const bannerDisp = rt.mockNodes.get('swf-place-4')?.getAttribute('display');
      if (bannerDisp !== 'none') errors.push(`Expected depth-4 banner display="none" on frame 3 after RemoveObject2, got "${bannerDisp}"`);

      // Zero-GC / zero DOM allocation check over 120 frames
      rt.tick(120);
      if (rt.getNodeCount() !== initialNodes || rt.getPostMountDomAllocs() !== 0) {
        errors.push(`Zero-GC DOM invariant violated: nodes ${initialNodes}->${rt.getNodeCount()}, postMountDomAllocs=${rt.getPostMountDomAllocs()}`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 13: 2dknockout Fighter (Sprite Timelines, RemoveObject2, WASD/KeyPress, ActionIf KO & Zero-GC)',
      passed: errors.length === 0,
      durationMs: duration,
      details: `Executed 2dknockout in .astb VM (${result.metadata?.spriteCount} sprites, ${result.metadata?.buttonCount} buttons, ${result.metadata?.ruleCount} rules) with live sprite frame display-list toggling, WASD + KeyJ + button combat, ActionIf KO transition & 0 DOM allocations.`,
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Simulation 14: Real-World Flash Preloader + Depth-1 Char Swap + ActionDefineFunction onRelease + HitTest Button
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    const bg = new BitWriter();
    bg.writeUI8(15); bg.writeUI8(23); bg.writeUI8(42);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    // Shapes: 1=LoadingScreen, 2=MenuScreen, 3=GameArena, 4=HitRect(HitTest-only), 5=PlayBtnFace
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, 0, 0, 640, 480, [30, 41, 59, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 640, 480, [30, 58, 138, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, 0, 0, 640, 480, [6, 95, 70, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(4, 0, 0, 180, 60, [255, 255, 255, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(5, 10, 10, 160, 40, [34, 197, 94, 255], 3));

    // DefineSprite 10: Preloader MovieClip checking:
    //   var loaded = _root.getBytesLoaded(); (via ActionStoreRegister 1)
    //   if (loaded >= _root.getBytesTotal() && _root._framesloaded >= _root._totalframes) { _root.gotoAndPlay("menu"); }
    const preloaderAct = new Avm1Builder()
      .callMethod('_root', 'getBytesLoaded', [])
      .storeRegister(1)
      .pop()
      .ifBlock(
        (b) =>
          b.pushRegister(1)
            .callMethod('_root', 'getBytesTotal', [])
            .less2()
            .not()
            .getMember('_root', '_framesloaded')
            .getMember('_root', '_totalframes')
            .less2()
            .not()
            .and(),
        (b) => b.callMethod('_root', 'gotoAndPlay', [(a) => a.pushStr('menu')]).pop()
      )
      .toByteArray();
    const preloaderTags = new BitWriter();
    writeTag(preloaderTags, SwfTagCode.DO_ACTION, preloaderAct);
    writeTag(preloaderTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(preloaderTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(10, 1, preloaderTags.toByteArray()));

    // DefineButton2 20: Play button with Up face (0x01) AND separate HitTest-only hitbox (0x08)
    writeTag(tagWriter, 34, buildDefineButton2Tag(
      20,
      [
        { states: 0x01, characterId: 5, depth: 1, matrix: { txPx: 0, tyPx: 0 } },
        { states: 0x08, characterId: 4, depth: 2, matrix: { txPx: 0, tyPx: 0 } },
      ],
      []
    ));

    // Frame 1: "loading" — Depth 1 = LoadingScreen(1), Depth 2 = PreloaderSprite(10), stop()
    const pLbl1 = new BitWriter(); pLbl1.writeString('loading');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, pLbl1.toByteArray());
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().stop().toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 1 }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 10, name: 'preloader' }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 2: "menu" — REPLACES Depth 1 with MenuScreen(2), removes Preloader(2), places named PlayBtn(20),
    // and attaches playBtn.onRelease = function() { _root.play(); } via ActionDefineFunction (0x9B) + stop()
    const pLbl2 = new BitWriter(); pLbl2.writeString('menu');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, pLbl2.toByteArray());
    writeTag(tagWriter, 28, buildRemoveObject2Tag(1));
    writeTag(tagWriter, 28, buildRemoveObject2Tag(2));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 2 }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 20, name: 'playBtn', matrix: { txPx: 230, tyPx: 210 } }));
    const menuDoAction = new Avm1Builder()
      .stop()
      .setMember('playBtn', 'onRelease', (b) => {
        b.defineFunction('', (fn) => {
          fn.callMethod('_root', 'play', []).pop();
        });
      })
      .toByteArray();
    writeTag(tagWriter, SwfTagCode.DO_ACTION, menuDoAction);
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 3: "game" — REPLACES Depth 1 with GameArena(3), removes playBtn(2), stop(); game_started = 1;
    const pLbl3 = new BitWriter(); pLbl3.writeString('game');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, pLbl3.toByteArray());
    writeTag(tagWriter, 28, buildRemoveObject2Tag(1));
    writeTag(tagWriter, 28, buildRemoveObject2Tag(2));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 3 }));
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder()
      .stop()
      .setVar('game_started', (b) => b.pushInt(1))
      .toByteArray());
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(640, 480, 30, 3, tagWriter.toByteArray(), 7);
    const result = await transpileSwfToAst(swfBinary, 'preloader-game');
    const errors: string[] = [];

    if (!result.success) {
      errors.push(`preloader-game transpilation failed: ${result.error}`);
    } else {
      try {
        parseSExpr(result.astSource);
      } catch (e: any) {
        errors.push(`preloader-game AST S-expression parse error: ${e.message}`);
      }
      if (result.metadata?.strippedPreloaderFrames !== 1) {
        errors.push(`Expected strippedPreloaderFrames=1, got ${result.metadata?.strippedPreloaderFrames}`);
      }
      if (result.metadata?.executionModel !== 'sim-modal') {
        errors.push(`Expected executionModel='sim-modal', got ${result.metadata?.executionModel}`);
      }
      if (result.svgMarkup.includes('id="swf-place-1-c1"') || result.svgMarkup.includes('id="swf-inst-preloader"')) {
        errors.push('Compile-time preloader stripping failed: preloader nodes (#swf-place-1-c1 / #swf-inst-preloader) still present in SVG');
      }
      if (result.astSource.includes('(:slider :var "swf_frame"')) {
        errors.push('Imported :Sim cartridge should not expose a raw frame-driven SWF Frame :slider');
      }
      if (result.astSource.includes('swf_cur_entry') || result.astSource.includes('swf_last_frame')) {
        errors.push('SWF transpiler should use native player :on-enter rules instead of swf_cur_entry/swf_last_frame boilerplate');
      }
      if (!result.astSource.includes(':on-enter')) {
        errors.push('Expected native player :on-enter rules in multi-mode SWF .ast output');
      }
      if (!result.svgMarkup.includes('opacity="0" pointer-events="all"')) {
        errors.push('HitTest-only button state record did not emit invisible clickable SVG layer');
      }
      const rt = createHeadlessSwfRuntime(result.astSource, result.svgMarkup);
      if (!isAstBytecode(rt.astbBytes)) errors.push('preloader-game .astb binary missing ASTB magic header');
      const initialNodes = rt.getNodeCount();

      // Before any tick (t = 0): :Sim boots straight onto Frame 2 ("menu") with preloader stripped
      if (rt.engine.vars.swf_frame !== 2 || rt.engine.vars.swf_playing !== 0) {
        errors.push(`Expected immediate mount on Frame 2 ("menu") paused, got frame=${rt.engine.vars.swf_frame}, playing=${rt.engine.vars.swf_playing}`);
      }
      if (rt.mockNodes.get('swf-place-1-c2')?.getAttribute('display') !== 'inline') {
        errors.push(`Expected Depth 1 Menu screen (#swf-place-1-c2) visible immediately on mount, got "${rt.mockNodes.get('swf-place-1-c2')?.getAttribute('display')}"`);
      }
      if (rt.engine.vars.playBtn_visible !== 1) {
        errors.push(`Expected named playBtn_visible=1 immediately on mount, got ${rt.engine.vars.playBtn_visible}`);
      }

      // Remain paused calmly on Frame 2 across idle ticks
      rt.tick(5);
      if (rt.engine.vars.swf_frame !== 2) {
        errors.push(`Expected SWF :Sim to remain on Frame 2 ("menu") until Play click, got frame=${rt.engine.vars.swf_frame}`);
      }

      // Click playBtn (ActionDefineFunction onRelease -> _root.play()) -> must advance immediately to Frame 3 ("game") with 0 latency
      const playHits = rt.clickButton('swf-inst-playBtn');
      if (playHits < 1) errors.push('ActionDefineFunction playBtn.onRelease click handler not registered on #swf-inst-playBtn');
      rt.tick(2);
      if (rt.engine.vars.swf_frame !== 3) {
        errors.push(`Expected playBtn.onRelease -> _root.play() to advance to Frame 3 ("game"), got frame=${rt.engine.vars.swf_frame}`);
      }
      if (rt.engine.vars.game_started !== 1) {
        errors.push(`Expected Frame 3 DoAction game_started=1, got ${rt.engine.vars.game_started}`);
      }
      if (rt.mockNodes.get('swf-place-1-c2')?.getAttribute('display') !== 'none') {
        errors.push(`Expected Depth 1 Menu (#swf-place-1-c2) hidden on Frame 3, got "${rt.mockNodes.get('swf-place-1-c2')?.getAttribute('display')}"`);
      }
      if (rt.mockNodes.get('swf-place-1-c3')?.getAttribute('display') !== 'inline') {
        errors.push(`Expected Depth 1 Game Arena (#swf-place-1-c3) visible on Frame 3, got "${rt.mockNodes.get('swf-place-1-c3')?.getAttribute('display')}"`);
      }
      if (rt.engine.vars.playBtn_visible !== 0) {
        errors.push(`Expected playBtn_visible=0 after leaving Frame 2, got ${rt.engine.vars.playBtn_visible}`);
      }

      // Zero-GC / zero DOM allocation check over 120 frames
      rt.tick(120);
      if (rt.getNodeCount() !== initialNodes || rt.getPostMountDomAllocs() !== 0) {
        errors.push(`Zero-GC DOM invariant violated: nodes ${initialNodes}->${rt.getNodeCount()}, postMountDomAllocs=${rt.getPostMountDomAllocs()}`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 14: :Sim-First Preloader Stripping (Zero Preloader Nodes, Instant Menu Mount, ActionDefineFunction & HitTest)',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified Frame-1 network preloader is stripped at compile time, :Sim boots straight into Frame 2 ("menu") on mount, and playBtn.onRelease transitions immediately to Frame 3 ("game") with 0 DOM allocations.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Simulation 15: Dead-End Preloader Stripping (Frame-1 stop() Stripped at Compile Time -> Boots on Frame 2 "menu")
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    const bg = new BitWriter();
    bg.writeUI8(15); bg.writeUI8(23); bg.writeUI8(42);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, 0, 0, 640, 480, [51, 65, 85, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 640, 480, [37, 99, 235, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, 0, 0, 640, 480, [16, 185, 129, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(4, 0, 0, 120, 40, [245, 158, 11, 255], 3));

    // DefineButton2 30 (placed on Frame 2 ONLY): goes to Frame 3 ("play")
    const goPlayAct = new Avm1Builder()
      .callFunction('gotoAndStop', [(b) => b.pushInt(3)])
      .pop()
      .toByteArray();
    writeTag(tagWriter, 34, buildDefineButton2Tag(
      30,
      [{ states: 0x0F, characterId: 4, depth: 1, matrix: { txPx: 260, tyPx: 220 } }],
      [{ condFlags: 0x0008, actions: goPlayAct }]
    ));

    // Frame 1: "preloader" — dead-end stop() with NO Frame-1 exit script or button
    const sLbl1 = new BitWriter(); sLbl1.writeString('preloader');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, sLbl1.toByteArray());
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().stop().toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 1 }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 2: "menu" — Menu screen + Start button + stop()
    const sLbl2 = new BitWriter(); sLbl2.writeString('menu');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, sLbl2.toByteArray());
    writeTag(tagWriter, 28, buildRemoveObject2Tag(1));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 2 }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 30 }));
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().stop().toByteArray());
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 3: "play" — Active game screen + stop()
    const sLbl3 = new BitWriter(); sLbl3.writeString('play');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, sLbl3.toByteArray());
    writeTag(tagWriter, 28, buildRemoveObject2Tag(1));
    writeTag(tagWriter, 28, buildRemoveObject2Tag(2));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 3 }));
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().stop().toByteArray());
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(640, 480, 30, 3, tagWriter.toByteArray(), 9);
    const result = await transpileSwfToAst(swfBinary, 'stuck-preloader-recovery');
    const errors: string[] = [];

    if (!result.success) {
      errors.push(`stuck-preloader-recovery transpilation failed: ${result.error}`);
    } else {
      try {
        parseSExpr(result.astSource);
      } catch (e: any) {
        errors.push(`stuck-preloader-recovery AST S-expression parse error: ${e.message}`);
      }
      if (result.metadata?.strippedPreloaderFrames !== 1) {
        errors.push(`Expected strippedPreloaderFrames=1 for dead-end preloader, got ${result.metadata?.strippedPreloaderFrames}`);
      }
      if (result.svgMarkup.includes('id="swf-place-1-c1"')) {
        errors.push('Dead-end Frame 1 loading screen (#swf-place-1-c1) should be stripped at compile time');
      }
      if (result.astSource.includes('(:slider :var "swf_frame"')) {
        errors.push('Imported :Sim cartridge should not expose a raw SWF Frame :slider');
      }
      const rt = createHeadlessSwfRuntime(result.astSource, result.svgMarkup);
      if (rt.engine.vars.swf_frame !== 2) {
        errors.push(`Expected stripped preloader to boot directly on Frame 2 ("menu"), got swf_frame=${rt.engine.vars.swf_frame}`);
      }
      if (rt.mockNodes.get('swf-place-1-c2')?.getAttribute('display') !== 'inline') {
        errors.push('Expected Frame 2 menu screen to be visible immediately on mount');
      }

      // Clicking Frame 2's button transitions cleanly to Frame 3 ("play")
      rt.clickButton('swf-btn-30');
      rt.tick(2);
      if (rt.engine.vars.swf_frame !== 3) {
        errors.push(`Expected click on #swf-btn-30 to jump to Frame 3 ("play"), got swf_frame=${rt.engine.vars.swf_frame}`);
      }
      if (rt.mockNodes.get('swf-place-1-c3')?.getAttribute('display') !== 'inline') {
        errors.push('Expected Frame 3 game screen to be visible after clicking Start button');
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 15: Dead-End Frame-1 Preloader Compile-Time Stripping & Clean :Sim Mode Transition',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified dead-end Frame-1 preloader is stripped out of SVG/AST at compile time, :Sim boots straight onto Frame 2 ("menu") with no raw frame slider, and button click transitions cleanly to Frame 3.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Simulation 16: Continuous sim_dt Native-FPS Refresh-Rate Independence (60 Hz vs 120 Hz Parity)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    const bg = new BitWriter();
    bg.writeUI8(15); bg.writeUI8(23); bg.writeUI8(42);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    // Shapes 1..3
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, 0, 0, 40, 40, [56, 189, 248, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 24, 24, [244, 63, 94, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, 0, 0, 24, 24, [16, 185, 129, 255], 3));

    // DefineSprite 10: 2-frame looping sprite
    const spTags = new BitWriter();
    writeTag(spTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 2 }));
    writeTag(spTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(spTags, 28, buildRemoveObject2Tag(1));
    writeTag(spTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 3 }));
    writeTag(spTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(spTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(10, 2, spTags.toByteArray()));

    // 4-frame continuous 12 FPS main timeline (no stop()) with moving shape + animated sprite
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 1, matrix: { txPx: 20, tyPx: 80 } }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 10, matrix: { txPx: 200, tyPx: 80 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, isMove: true, matrix: { txPx: 60, tyPx: 80 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, isMove: true, matrix: { txPx: 100, tyPx: 80 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, isMove: true, matrix: { txPx: 140, tyPx: 80 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(400, 240, 12, 4, tagWriter.toByteArray(), 8);
    const result = await transpileSwfToAst(swfBinary, 'continuous-sim-dt-12fps');
    const errors: string[] = [];

    if (!result.success) {
      errors.push(`continuous-sim-dt-12fps transpilation failed: ${result.error}`);
    } else {
      try {
        parseSExpr(result.astSource);
      } catch (e: any) {
        errors.push(`continuous-sim-dt-12fps AST parse error: ${e.message}`);
      }
      if (result.metadata?.executionModel !== 'sim-continuous') {
        errors.push(`Expected executionModel='sim-continuous', got ${result.metadata?.executionModel}`);
      }
      if (result.metadata?.strippedPreloaderFrames !== 0) {
        errors.push(`Expected strippedPreloaderFrames=0 on clean continuous SWF, got ${result.metadata?.strippedPreloaderFrames}`);
      }

      const measureOneSecond = (hz: number) => {
        const rt = createHeadlessSwfRuntime(result.astSource, result.svgMarkup);
        const initialNodes = rt.getNodeCount();
        let mainTransitions = 0;
        let spriteTransitions = 0;
        let prevMain = rt.engine.vars.swf_frame;
        let prevSprite = rt.engine.vars.sprite_10_frame;
        const dt = 1 / hz;
        for (let i = 0; i < hz; i++) {
          rt.tick(1, dt);
          if (rt.engine.vars.swf_frame !== prevMain) {
            mainTransitions++;
            prevMain = rt.engine.vars.swf_frame;
          }
          if (rt.engine.vars.sprite_10_frame !== prevSprite) {
            spriteTransitions++;
            prevSprite = rt.engine.vars.sprite_10_frame;
          }
        }
        return {
          mainTransitions,
          spriteTransitions,
          finalMain: rt.engine.vars.swf_frame,
          finalSprite: rt.engine.vars.sprite_10_frame,
          domAllocs: rt.getPostMountDomAllocs(),
          nodeDelta: rt.getNodeCount() - initialNodes,
        };
      };

      const run60 = measureOneSecond(60);
      const run120 = measureOneSecond(120);

      if (run60.mainTransitions !== 12 || run120.mainTransitions !== 12) {
        errors.push(`Expected 12 main timeline steps/sec at both 60Hz & 120Hz (12 FPS native), got 60Hz=${run60.mainTransitions}, 120Hz=${run120.mainTransitions}`);
      }
      if (run60.spriteTransitions !== 12 || run120.spriteTransitions !== 12) {
        errors.push(`Expected 12 DefineSprite steps/sec at both 60Hz & 120Hz (12 FPS native), got 60Hz=${run60.spriteTransitions}, 120Hz=${run120.spriteTransitions}`);
      }
      if (run60.finalMain !== run120.finalMain || run60.finalSprite !== run120.finalSprite) {
        errors.push(`60Hz vs 120Hz end-state mismatch: 60Hz=(${run60.finalMain},${run60.finalSprite}), 120Hz=(${run120.finalMain},${run120.finalSprite})`);
      }
      if (run60.domAllocs !== 0 || run120.domAllocs !== 0 || run60.nodeDelta !== 0 || run120.nodeDelta !== 0) {
        errors.push(`Zero-GC DOM invariant violated: 60Hz allocs=${run60.domAllocs}, 120Hz allocs=${run120.domAllocs}`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 16: Continuous sim_dt Native-FPS Pacing (12 FPS SWF Parity Across 60 Hz & 120 Hz Displays)',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified continuous :Sim main timeline and nested DefineSprite advance identically at 12 steps/sec on both 60 Hz and 120 Hz clocks via sim_dt with 0 DOM allocations.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Simulation 17: Flash DefineButton2 Up/Over/Down States Powered by Native :hoverable / :press-var
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    const bg = new BitWriter();
    bg.writeUI8(15); bg.writeUI8(23); bg.writeUI8(42);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    // Distinct Up (blue), Over (amber), Down (emerald), Hit (invisible) button shapes
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, 0, 0, 140, 48, [59, 130, 246, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 140, 48, [245, 158, 11, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, 0, 0, 140, 48, [16, 185, 129, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(4, 0, 0, 140, 48, [255, 255, 255, 255], 3));

    const clickAct = new Avm1Builder()
      .setVar('btn_clicks', (b) => b.getVar('btn_clicks').pushInt(1).add2())
      .toByteArray();

    writeTag(tagWriter, 34, buildDefineButton2Tag(
      40,
      [
        { states: 0x01, characterId: 1, depth: 1 }, // Up
        { states: 0x02, characterId: 2, depth: 2 }, // Over
        { states: 0x04, characterId: 3, depth: 3 }, // Down
        { states: 0x08, characterId: 4, depth: 4 }, // HitTest-only
      ],
      [{ condFlags: 0x0008, actions: clickAct }]
    ));

    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().setVar('btn_clicks', (b) => b.pushInt(0)).toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 40, matrix: { txPx: 250, tyPx: 200 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBinary = assembleFwsSwf(640, 480, 30, 1, tagWriter.toByteArray(), 8);
    const result = await transpileSwfToAst(swfBinary, 'swf-hover-button');
    const errors: string[] = [];

    if (!result.success) {
      errors.push(`swf-hover-button transpilation failed: ${result.error}`);
    } else {
      if (!result.astSource.includes(':hoverable')) {
        errors.push('Expected native :hoverable gesture emitted for Flash DefineButton2 with Over/Down states');
      }
      const rt = createHeadlessSwfRuntime(result.astSource, result.svgMarkup);
      if (rt.mockNodes.get('swf-btn-40-up')?.getAttribute('display') !== 'inline') {
        errors.push('Expected #swf-btn-40-up inline initially');
      }
      if (rt.mockNodes.get('swf-btn-40-over')?.getAttribute('display') !== 'none') {
        errors.push('Expected #swf-btn-40-over hidden initially');
      }

      rt.hover('swf-btn-40');
      if (rt.mockNodes.get('swf-btn-40-over')?.getAttribute('display') !== 'inline' || rt.mockNodes.get('swf-btn-40-up')?.getAttribute('display') !== 'none') {
        errors.push('Expected hover over #swf-btn-40 to reveal Over layer and hide Up layer');
      }

      rt.pointerDown('swf-btn-40');
      if (rt.mockNodes.get('swf-btn-40-down')?.getAttribute('display') !== 'inline' || rt.engine.vars.btn_clicks !== 1) {
        errors.push(`Expected pointerDown on #swf-btn-40 to show Down layer and increment btn_clicks=1 (got clicks=${rt.engine.vars.btn_clicks})`);
      }

      rt.pointerUp();
      if (rt.mockNodes.get('swf-btn-40-over')?.getAttribute('display') !== 'inline' || rt.mockNodes.get('swf-btn-40-down')?.getAttribute('display') !== 'none') {
        errors.push('Expected pointerUp to return button to Over state');
      }

      rt.pointerLeave();
      if (rt.mockNodes.get('swf-btn-40-up')?.getAttribute('display') !== 'inline' || rt.mockNodes.get('swf-btn-40-over')?.getAttribute('display') !== 'none') {
        errors.push('Expected pointerLeave to return button to Up state');
      }
      if (rt.getPostMountDomAllocs() !== 0) {
        errors.push(`Zero-GC DOM invariant violated during SWF hover/press: allocs=${rt.getPostMountDomAllocs()}`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 17: Flash DefineButton2 Up/Over/Down States Powered by Native :hoverable & :press-var',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified Flash DefineButton2 Up/Over/Down visual states compile onto the native player :hoverable/:press-var primitives with 0 post-mount DOM allocations.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Summary Presentation
  // --------------------------------------------------------------------------
  console.log('RESULTS BREAKDOWN:\n');
  let allPassed = true;
  for (const r of reports) {
    const mark = r.passed ? '✅ PASS' : '❌ FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${mark}] ${r.name} (${r.durationMs.toFixed(2)} ms)`);
    console.log(`       ${r.details}`);
    if (r.errors && r.errors.length > 0) {
      for (const err of r.errors) {
        console.log(`       ⚠️ ERROR: ${err}`);
      }
    }
  }

  console.log('\n=============================================================');
  if (allPassed) {
    console.log(`🎉 ALL ${reports.length} SIMULATIONS PASSED! No SWF import issues detected.`);
  } else {
    console.log('⚠️ SIMULATION ENCOUNTERED ISSUES. Please review logs above.');
    process.exit(1);
  }
  console.log('=============================================================\n');
}

runSimulations().catch(err => {
  console.error('Fatal simulation error:', err);
  process.exit(1);
});
