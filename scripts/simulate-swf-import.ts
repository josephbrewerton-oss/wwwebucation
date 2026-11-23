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
import { buildFlashArcadeSampleSwf, buildFlashPendulumSampleSwf } from '../src/utils/swfSampleBuilder';
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
        if (!sel) return null;
        if (sel.startsWith('#')) return mockNodes.get(sel.slice(1)) || null;
        const attrM = /^\[data-swf-name="([^"]+)"\]$/.exec(sel);
        if (attrM) {
          for (const n of mockNodes.values()) {
            if (n.getAttribute('data-swf-name') === attrM[1]) return n;
          }
        }
        return null;
      },
      querySelectorAll(sel: string) {
        const el = this.querySelector(sel);
        return el ? [el] : [];
      },
      addEventListener() {},
      removeEventListener() {},
      replaceChildren() {},
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
        childNodes: [] as any[],
        get firstChild() { return this.childNodes[0] || null; },
        setAttribute(k: string, v: any) { this.attrs.set(k, String(v)); },
        getAttribute(k: string) { return this.attrs.get(k) ?? null; },
        removeAttribute(k: string) { this.attrs.delete(k); },
        hasAttribute(k: string) { return this.attrs.has(k); },
        appendChild(c: any) { this.childNodes.push(c); return c; },
        removeChild(c: any) {
          const idx = this.childNodes.indexOf(c);
          if (idx >= 0) this.childNodes.splice(idx, 1);
          return c;
        },
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
        createTextNode(text: string) { return { nodeType: 3, textContent: String(text || '') }; },
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

    loadScript('ast-render-boundary.js');
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
    gestures.stageSvg = container;
    gestures.sceneRoot = container;
    gestures.screenToSvg = () => ({ x: 0, y: 0 });
    gestures.createTouchRipple = () => {};

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
    const hover = (domId: string) => {
      const el = mockNodes.get(domId);
      gestures.handlePointerMove({
        target: el || container,
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        buttons: 0,
        preventDefault() {},
      });
      engine.applyBindings(0, 0, false);
    };
    const pointerDown = (domId: string) => {
      const el = mockNodes.get(domId);
      gestures.handlePointerDown({
        target: el || container,
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
        preventDefault() {},
      });
      engine.applyBindings(0, 0, false);
    };
    const pointerUp = () => {
      gestures.handlePointerUp({
        target: container,
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        preventDefault() {},
      });
      engine.applyBindings(0, 0, false);
    };
    const pointerLeave = () => {
      gestures.handlePointerLeave({
        target: container,
        pointerId: 1,
      });
      engine.applyBindings(0, 0, false);
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
      hover,
      pointerDown,
      pointerUp,
      pointerLeave,
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
  // Simulation 18: Stage ClipPath Bounds, MovieClip _visible SVG Toggling, & Stopped-Frame onEnterFrame Ticking
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const tagWriter = new BitWriter();

    const bg = new BitWriter();
    bg.writeUI8(15); bg.writeUI8(23); bg.writeUI8(42);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    // Shapes: 1=Playfield bg (intentionally overhangs stage bounds), 2=Overlay ("KNOCK-OUT" / playagain), 3=Nested animated sprite shape, 4=Start/Show button
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, -80, -40, 720, 480, [22, 163, 74, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 260, 120, [220, 38, 38, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, 0, 0, 40, 40, [56, 189, 248, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(4, 0, 0, 120, 40, [234, 179, 8, 255], 3));

    // DefineSprite 10: 3-frame animated fighter/radar sprite that must keep ticking even when main timeline calls stop()
    const nestedSpriteTags = new BitWriter();
    writeTag(nestedSpriteTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 3, matrix: { txPx: 0, tyPx: 0 } }));
    writeTag(nestedSpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(nestedSpriteTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 3, matrix: { txPx: 12, tyPx: 0 }, move: true }));
    writeTag(nestedSpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(nestedSpriteTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 3, matrix: { txPx: 24, tyPx: 0 }, move: true }));
    writeTag(nestedSpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(nestedSpriteTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(10, 3, nestedSpriteTags.toByteArray()));

    // DefineSprite 11: Named overlay MovieClip "playagain" (starts hidden via Frame 1 DoAction playagain._visible = 0)
    const overlaySpriteTags = new BitWriter();
    writeTag(overlaySpriteTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 2, matrix: { txPx: 0, tyPx: 0 } }));
    writeTag(overlaySpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(overlaySpriteTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(11, 1, overlaySpriteTags.toByteArray()));

    // DefineButton2 20: Click reveals playagain overlay (playagain._visible = 1)
    const showOverlayAct = new Avm1Builder()
      .setMember('playagain', '_visible', (b) => b.pushInt(1))
      .toByteArray();
    writeTag(tagWriter, 34, buildDefineButton2Tag(
      20,
      [{ states: 0x0F, characterId: 4, depth: 1 }],
      [{ condFlags: 0x0008, actions: showOverlayAct }]
    ));

    // Frame 1: stop() on main timeline, playagain._visible = false (0), ef_ticks = 0, onEnterFrame increments ef_ticks
    const frame1Actions = new Avm1Builder()
      .stop()
      .setVar('ef_ticks', (b) => b.pushInt(0))
      .setMember('playagain', '_visible', (b) => b.pushBool(false))
      .defineFunction('onEnterFrame', (fn) => {
        fn.setVar('ef_ticks', (b) => b.getVar('ef_ticks').pushInt(1).add2());
      })
      .toByteArray();

    writeTag(tagWriter, SwfTagCode.DO_ACTION, frame1Actions);
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 1, matrix: { txPx: 0, tyPx: 0 } }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 10, matrix: { txPx: 60, tyPx: 180 }, name: 'animSprite' }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 3, characterId: 20, matrix: { txPx: 200, tyPx: 300 } }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 4, characterId: 11, matrix: { txPx: 140, tyPx: 120 }, name: 'playagain' }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 2: Secondary frame so main timeline has >1 frames and stop() on Frame 1 is genuinely tested
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().stop().toByteArray());
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const stageW = 550;
    const stageH = 400;
    const swfBinary = assembleFwsSwf(stageW, stageH, 60, 2, tagWriter.toByteArray(), 8);
    const result = await transpileSwfToAst(swfBinary, 'swf-stage-clip-visible-ef');
    const errors: string[] = [];

    if (!result.success) {
      errors.push(`swf-stage-clip-visible-ef transpilation failed: ${result.error}`);
    } else {
      // Assertion 1: Root stage <clipPath> matching SWF header bounds (0, 0, 550, 400)
      const clipRe = new RegExp(`<clipPath\\s+id="swf-stage-clip">\\s*<rect\\s+x="0"\\s+y="0"\\s+width="${stageW}"\\s+height="${stageH}"\\s*/>\\s*</clipPath>`);
      if (!clipRe.test(result.svgMarkup)) {
        errors.push(`Expected root stage clipPath with bounds (0, 0, ${stageW}, ${stageH}) in SVG markup`);
      }
      if (!result.svgMarkup.includes('<g id="scene-root" clip-path="url(#swf-stage-clip)">')) {
        errors.push('Expected <g id="scene-root" clip-path="url(#swf-stage-clip)"> wrapper in SVG markup');
      }

      const rt = createHeadlessSwfRuntime(result.astSource, result.svgMarkup);
      const overlayNode = rt.mockNodes.get('swf-inst-playagain');

      // Assertion 2: MovieClip _visible == 0 / false binds to visibility="hidden" & pointer-events="none"
      if (!overlayNode) {
        errors.push('Missing #swf-inst-playagain SVG node');
      } else {
        if (rt.engine.vars.playagain_visible !== 0) {
          errors.push(`Expected playagain_visible === 0 initially (got ${rt.engine.vars.playagain_visible})`);
        }
        if (overlayNode.getAttribute('visibility') !== 'hidden' || overlayNode.getAttribute('pointer-events') !== 'none') {
          errors.push(`Expected #swf-inst-playagain hidden & non-interactive initially (got visibility=${overlayNode.getAttribute('visibility')}, pointer-events=${overlayNode.getAttribute('pointer-events')})`);
        }
        if (overlayNode.style.visibility !== 'hidden' || overlayNode.style.pointerEvents !== 'none') {
          errors.push(`Expected #swf-inst-playagain style mirrored to hidden/none (got style.visibility=${overlayNode.style.visibility}, style.pointerEvents=${overlayNode.style.pointerEvents})`);
        }

        // Click button to reveal playagain overlay (_visible = 1)
        rt.pointerDown('swf-btn-20');
        rt.pointerUp();
        if (rt.engine.vars.playagain_visible !== 1) {
          errors.push(`Expected button click to set playagain_visible = 1 (got ${rt.engine.vars.playagain_visible})`);
        }
        if (overlayNode.getAttribute('visibility') !== 'visible' || overlayNode.getAttribute('pointer-events') !== 'auto') {
          errors.push(`Expected #swf-inst-playagain visible & pointer-events="auto" when playagain_visible=1 (got visibility=${overlayNode.getAttribute('visibility')}, pointer-events=${overlayNode.getAttribute('pointer-events')})`);
        }
        if (overlayNode.style.visibility !== 'visible' || overlayNode.style.pointerEvents !== 'auto') {
          errors.push(`Expected #swf-inst-playagain style mirrored to visible/auto (got style.visibility=${overlayNode.style.visibility}, style.pointerEvents=${overlayNode.style.pointerEvents})`);
        }

        // Hide again via _visible = false (boolean) and verify hidden/none restored
        rt.engine.vars.playagain_visible = false;
        rt.engine.applyBindings(0, 0, false);
        if (overlayNode.getAttribute('visibility') !== 'hidden' || overlayNode.getAttribute('pointer-events') !== 'none') {
          errors.push(`Expected playagain_visible=false to restore visibility="hidden" & pointer-events="none" (got visibility=${overlayNode.getAttribute('visibility')}, pointer-events=${overlayNode.getAttribute('pointer-events')})`);
        }
      }

      // Assertion 3: Main timeline stop() keeps swf_tick, onEnterFrame, and nested DefineSprite ticking at 60 FPS
      if (rt.engine.vars.swf_playing !== 0) {
        errors.push(`Expected main timeline stopped (swf_playing === 0) on Frame 1 (got ${rt.engine.vars.swf_playing})`);
      }
      const startTick = Number(rt.engine.vars.swf_tick || 0);
      const startEf = Number(rt.engine.vars.ef_ticks || 0);
      const spriteFrameKey = 'animSprite_frame' in rt.engine.vars
        ? 'animSprite_frame'
        : Object.keys(rt.engine.vars).find((k) => k !== 'swf_frame' && /_frame$/.test(k));
      const seenSpriteFrames = new Set<number>();
      if (spriteFrameKey) seenSpriteFrames.add(Number(rt.engine.vars[spriteFrameKey]));

      for (let i = 0; i < 15; i++) {
        rt.tick(1, 1 / 60);
        if (spriteFrameKey) seenSpriteFrames.add(Number(rt.engine.vars[spriteFrameKey]));
      }

      const endTick = Number(rt.engine.vars.swf_tick || 0);
      const endEf = Number(rt.engine.vars.ef_ticks || 0);
      if (rt.engine.vars.swf_frame !== 1 || rt.engine.vars.swf_playing !== 0) {
        errors.push(`Expected main timeline to remain stopped on Frame 1 (got swf_frame=${rt.engine.vars.swf_frame}, swf_playing=${rt.engine.vars.swf_playing})`);
      }
      if (endTick - startTick < 15) {
        errors.push(`Expected swf_tick to advance independently while main timeline stopped (delta=${endTick - startTick})`);
      }
      if (endEf - startEf < 15) {
        errors.push(`Expected onEnterFrame ef_ticks to advance every frame while main timeline stopped (delta=${endEf - startEf})`);
      }
      if (!spriteFrameKey || seenSpriteFrames.size < 2) {
        errors.push(`Expected nested DefineSprite (${spriteFrameKey || 'missing'}) to advance while main timeline stopped (seen frames: ${Array.from(seenSpriteFrames).join(',')})`);
      }
      if (rt.getPostMountDomAllocs() !== 0) {
        errors.push(`Zero-GC DOM invariant violated during stopped-frame ticking & _visible toggling: allocs=${rt.getPostMountDomAllocs()}`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 18: Stage ClipPath Bounds, MovieClip _visible SVG Toggling, & Stopped-Frame onEnterFrame Ticking',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified root <clipPath id="swf-stage-clip"> bounds, _visible=0/false -> visibility="hidden" & pointer-events="none", and 60 FPS swf_tick + onEnterFrame + nested DefineSprite ticking during main timeline stop() with 0 DOM allocations.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Simulation 19: ast-loader Local Vault Zero-404 Fetch Skip & Welcome Overwrite Protection
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const errors: string[] = [];
    const playerDir = path.resolve(process.cwd(), 'static/player');
    const fetchedUrls: string[] = [];

    const customSwfCartridge = {
      id: 'custom-swf-ablast',
      title: 'Ablast SWF',
      source: 'custom',
      astSource: '(scene :id "custom-swf-ablast" :title "Ablast SWF" :type "Sim" :duration 60 (vars (swf_playing 0)))',
      svgMarkup: '<svg viewBox="0 0 550 400"><defs><clipPath id="swf-stage-clip"><rect x="0" y="0" width="550" height="400" /></clipPath></defs><g id="scene-root" clip-path="url(#swf-stage-clip)"></g></svg>',
    };

    const vaultMap = new Map<string, any>([[customSwfCartridge.id, customSwfCartridge]]);
    const loaderSandbox: any = {
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
      Promise,
      URLSearchParams,
      Float32Array,
      Float64Array,
      Int8Array,
      Uint8Array,
      Int32Array,
      performance,
      setTimeout,
      clearTimeout,
      requestAnimationFrame: () => 0,
      cancelAnimationFrame: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      location: { search: '?preset=custom-swf-ablast&vault=1' },
      fetch: async (url: string) => {
        fetchedUrls.push(String(url));
        return { ok: false, status: 404, text: async () => '', arrayBuffer: async () => new ArrayBuffer(0) };
      },
      ASTSceneRegistry: {
        get: () => null,
        getSceneMeta: () => null,
      },
      ASTLocalStore: {
        getItem: () => null,
        setItem: () => {},
      },
      document: {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        createElement: () => ({ style: {}, setAttribute() {}, getAttribute: () => null, removeAttribute() {}, appendChild() {}, remove() {}, pause() {}, load() {} }),
        createElementNS: () => ({ style: {}, setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {} }),
        createTextNode: (t: string) => ({ nodeType: 3, textContent: t }),
      },
    };
    loaderSandbox.window = loaderSandbox;
    loaderSandbox.self = loaderSandbox;
    loaderSandbox.globalThis = loaderSandbox;
    loaderSandbox.parent = {
      postMessage() {},
      __AST_CARTRIDGE_VAULT_LOOKUP__: (id: string) => vaultMap.get(id) || null,
    };

    const ctx = vm.createContext(loaderSandbox);
    vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-expr.js'), 'utf8'), ctx, { filename: 'ast-expr.js' });
    vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-parser.js'), 'utf8'), ctx, { filename: 'ast-parser.js' });
    vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-scene-mount.js'), 'utf8'), ctx, { filename: 'ast-scene-mount.js' });
    vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-binding-runtime.js'), 'utf8'), ctx, { filename: 'ast-binding-runtime.js' });
    vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-loader.js'), 'utf8'), ctx, { filename: 'ast-loader.js' });
    vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-engine.js'), 'utf8'), ctx, { filename: 'ast-engine.js' });

    if (typeof loaderSandbox.ASTVectorPlayerEngine.prototype.getFromHostOrLocalIndex !== 'function') {
      errors.push('ASTVectorPlayerEngine.prototype.getFromHostOrLocalIndex delegator is missing');
    }
    if (typeof loaderSandbox.ASTVectorPlayerEngine.prototype._isVaultUrlHint !== 'function') {
      errors.push('ASTVectorPlayerEngine.prototype._isVaultUrlHint delegator is missing');
    }

    const fakeEngine = new loaderSandbox.ASTVectorPlayerEngine({ container: null });
    fakeEngine.container = { replaceChildren() {}, querySelector: () => null, querySelectorAll: () => [], appendChild() {}, insertBefore() {} };
    fakeEngine.verifyLoadedCartridge = async () => ({ ok: true });
    fakeEngine.putIntoVaultIndexedDb = async () => true;
    fakeEngine.getFromVaultIndexedDb = async () => null;

    // 1. Load custom SWF preset from Local Vault lookup — must make 0 remote HTTP fetches
    const loaded = await fakeEngine.loadScene('custom-swf-ablast');
    if (!loaded || loaded.id !== 'custom-swf-ablast') {
      errors.push(`Expected custom-swf-ablast to resolve from host Local Vault cache (got ${loaded && loaded.id})`);
    }
    if (fetchedUrls.length !== 0) {
      errors.push(`Expected 0 remote HTTP fetches for Local Vault custom SWF, got ${fetchedUrls.length}: ${fetchedUrls.join(', ')}`);
    }

    // 2. Direct postMessage mount via loadSceneData followed immediately by stale loadScene('welcome') must NOT overwrite
    const directSceneObj = {
      ...loaderSandbox.parseAst(customSwfCartridge.astSource),
      id: 'custom-swf-ablast',
      svgText: customSwfCartridge.svgMarkup,
    };
    fakeEngine.loadSceneData(directSceneObj, true);
    const afterWelcomeAttempt = await fakeEngine.loadScene('welcome');
    if (!afterWelcomeAttempt || afterWelcomeAttempt.id !== 'custom-swf-ablast' || fakeEngine.activePresetId !== 'custom-swf-ablast') {
      errors.push(`Stale loadScene('welcome') overwrote freshly mounted custom SWF (activePresetId=${fakeEngine.activePresetId})`);
    }
    if (fetchedUrls.length !== 0) {
      errors.push(`Expected 0 remote HTTP fetches after guarded welcome call, got ${fetchedUrls.length}: ${fetchedUrls.join(', ')}`);
    }

    // 3. Uncached vault=1 custom SWF preset must skip remote HTTP fetches (0 404s) and NOT overwrite with welcome
    const pendingRes = await fakeEngine.loadScene('custom-swf-pending');
    if (fetchedUrls.length !== 0) {
      errors.push(`Expected 0 remote HTTP fetches for uncached custom-swf-pending with vault=1, got ${fetchedUrls.length}: ${fetchedUrls.join(', ')}`);
    }
    if (pendingRes && pendingRes.id === 'welcome') {
      errors.push('Uncached custom SWF fell back to Welcome Simulator instead of waiting for LOAD_CUSTOM_CARTRIDGE');
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 19: ast-loader Local Vault Zero-404 Fetch Skip & Welcome Overwrite Protection',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified Local Vault custom SWF loads with 0 remote HTTP fetches (no 404s) and resists stale Welcome Simulator overwrites.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 20: Zero-Slider Direct Play (:controls :param-hud :off),
  //                Retroactive Cached SWF Slider Suppression, & clipDepth Masks
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const errors: string[] = [];

    // Build a 3-frame SWF with a PlaceObject2 clipDepth=2 mask at depth 1 clipping depth 2 (not depth 3)
    const tagWriter = new BitWriter();
    const bg = new BitWriter();
    bg.writeUI8(0); bg.writeUI8(0); bg.writeUI8(16);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(10, 0, 0, 200, 120, [59, 130, 246, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(11, 0, 0, 400, 300, [34, 197, 94, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(12, 0, 0, 100, 30, [250, 204, 21, 255], 3));

    // PlaceObject2 with HasClipDepth (0x40) | HasCharacter (0x02)
    const maskPlace = new BitWriter();
    maskPlace.writeUI8(0x40 | 0x02);
    maskPlace.writeUI16(1); // depth 1
    maskPlace.writeUI16(10); // characterId 10
    maskPlace.writeUI16(2); // clipDepth = 2
    writeTag(tagWriter, 26, maskPlace.toByteArray());

    // Depth 2: masked viewport graphic (moves across frames 1..3 so SWF exercises dynamic :Sim path)
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 11, matrix: { txPx: 0, tyPx: 0 } }));
    // Depth 3: unmasked HUD graphic (outside clipDepth 2)
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 3, characterId: 12, matrix: { txPx: 10, tyPx: 10 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, move: true, matrix: { txPx: 25, tyPx: 0 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, move: true, matrix: { txPx: 50, tyPx: 0 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBytes = assembleFwsSwf(600, 400, 24, 3, tagWriter.toByteArray(), 8);
    const res = await transpileSwfToAst(swfBytes, 'flashtrek-mask-test');
    if (!res.success) {
      errors.push(`SWF parse failed: ${res.error}`);
    } else {
      // 1. Verify :controls disables param-hud and conflicting portal keyboard shortcuts
      if (!res.astSource.includes('(:controls (:param-hud :off) (:arrow-step :off) (:num-jump :off) (:space-play :off) (:scrub :off))')) {
        errors.push('Transpiled SWF AST missing (:controls (:param-hud :off) (:arrow-step :off) (:num-jump :off) (:space-play :off) (:scrub :off))');
      }

      // 2. Verify clipDepth mask compiles to <clipPath id="swf-mask-..."> instead of an opaque solid <g>
      if (!res.svgMarkup.includes('<clipPath id="swf-mask-swf_place_1">')) {
        errors.push('Expected clipDepth mask at depth 1 to emit <clipPath id="swf-mask-swf_place_1"> inside <defs>');
      }
      if (res.svgMarkup.includes('id="swf-place-1"')) {
        errors.push('Mask layer at depth 1 was rendered as a visible <g id="swf-place-1"> instead of an invisible <clipPath>');
      }
      if (!res.svgMarkup.includes('<g clip-path="url(#swf-mask-swf_place_1)">')) {
        errors.push('Expected depth 2 graphic (#swf-place-2) to be wrapped in an un-transformed <g clip-path="url(#swf-mask-swf_place_1)">');
      }
      const place2Tag = res.svgMarkup.match(/<g id="swf-place-2"[^>]*>/);
      if (!place2Tag || place2Tag[0].includes('clip-path=')) {
        errors.push('Expected clip-path NOT to be placed directly on the transformed <g id="swf-place-2"> (must be on outer un-transformed wrapper)');
      }
      const hudGroupMatch = res.svgMarkup.match(/<g id="swf-place-3"[^>]*>/);
      if (!hudGroupMatch || hudGroupMatch[0].includes('clip-path=')) {
        errors.push('Expected depth 3 graphic (#swf-place-3, outside clipDepth 2) NOT to inherit the depth 1..2 clipPath');
      }

      // 3. Verify ASTHudControls.resolveParameterControls returns [] for both new SWFs and legacy cached SWFs without :controls
      const playerDir = path.resolve(process.cwd(), 'static/player');
      const hudSandbox: any = { console, Math, Number, String, Boolean, Object, Array, Set, Map, JSON };
      hudSandbox.window = hudSandbox;
      hudSandbox.globalThis = hudSandbox;
      const hudCtx = vm.createContext(hudSandbox);
      vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-parser.js'), 'utf8'), hudCtx, { filename: 'ast-parser.js' });
      vm.runInContext(fs.readFileSync(path.join(playerDir, 'ast-hud-controls.js'), 'utf8'), hudCtx, { filename: 'ast-hud-controls.js' });

      const parsedScene = hudSandbox.parseAst(res.astSource);
      const fakeHudEngine = {
        scene: parsedScene,
        normalizeVarName: (s: string) => String(s || '').trim().replace(/^\*|\*$/g, ''),
      };
      const controlsNew = hudSandbox.ASTHudControls.resolveParameterControls.call(fakeHudEngine, parsedScene);
      if (!Array.isArray(controlsNew) || controlsNew.length !== 0) {
        errors.push(`Expected 0 auto-generated parameter sliders on transpiled SWF, got ${controlsNew && controlsNew.length}`);
      }

      // Simulate legacy cached Local Vault SWF without (:controls ...)
      const legacyCachedSwf = { ...parsedScene, controls: null };
      const controlsLegacy = hudSandbox.ASTHudControls.resolveParameterControls.call(fakeHudEngine, legacyCachedSwf);
      if (!Array.isArray(controlsLegacy) || controlsLegacy.length !== 0) {
        errors.push(`Expected 0 auto-generated parameter sliders on legacy cached SWF without :controls, got ${controlsLegacy && controlsLegacy.length}`);
      }

      // 4. Verify autonomous ticking advances swf_tick & swf_frame without touching any manual sliders
      const rt = createHeadlessSwfRuntime(res.astSource, res.svgMarkup);
      const initFrame = rt.engine.vars.swf_frame;
      const t0 = performance.now();
      for (let i = 0; i < 6; i++) rt.tick(1 / 60);
      const elapsedMs = performance.now() - t0;
      if (!(rt.engine.vars.swf_tick >= 6)) {
        errors.push(`Expected autonomous swf_tick >= 6 after 6 ticks, got ${rt.engine.vars.swf_tick}`);
      }
      if (rt.engine.vars.swf_frame === initFrame) {
        errors.push(`Expected autonomous swf_frame to advance from ${initFrame} without manual slider input (stayed at ${rt.engine.vars.swf_frame})`);
      }
      if (elapsedMs > 25) {
        errors.push(`Expected 6 SWF frames to compute in < 25ms, took ${elapsedMs.toFixed(2)}ms`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 20: Zero-Slider Direct Play, Retroactive SWF HUD Suppression & clipDepth SVG Masks',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified SWFs disable manual Parameters sliders (both new & cached), convert Flash clipDepth mask layers into parent-space <clipPath> wrappers, and tick autonomously.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 21: AVM1 ActionGotoFrame+ActionPlay Fusion & playVar-First Rule Order
  //                (2DARCADE-style Intro Splash Sprite -> _root.gotoAndPlay -> Menu Stop)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const errors: string[] = [];

    const tagWriter = new BitWriter();
    const bg = new BitWriter();
    bg.writeUI8(0); bg.writeUI8(0); bg.writeUI8(0);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, 0, 0, 80, 80, [239, 68, 68, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 120, 40, [34, 197, 94, 255], 3));

    // Intro splash DefineSprite (char 10): 2 frames; on Frame 2 executes tellTarget("/") + ActionGotoFrame(1 -> Frame 2) + ActionPlay()
    const introSpriteTags = new BitWriter();
    writeTag(introSpriteTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 1, matrix: { txPx: 100, tyPx: 100 } }));
    writeTag(introSpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    // Raw AVM1: ActionSetTarget("/") [0x8B, len=2, '/', 0], ActionGotoFrame(1) [0x81, len=2, 1, 0], ActionPlay [0x06], End [0x00]
    const gotoAndPlayRoot = new Uint8Array([0x8B, 0x02, 0x00, 0x2F, 0x00, 0x81, 0x02, 0x00, 0x01, 0x00, 0x06, 0x00]);
    writeTag(introSpriteTags, SwfTagCode.DO_ACTION, gotoAndPlayRoot);
    writeTag(introSpriteTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(introSpriteTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(10, 2, introSpriteTags.toByteArray()));

    // Frame 1: stop() while intro splash sprite plays
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Avm1Builder().stop().toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 10, name: 'introSplash' }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 2: plays automatically into Frame 3 (verifies ActionGotoFrame+ActionPlay kept swf_playing = 1!)
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 2, matrix: { txPx: 200, tyPx: 150 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 3: gotoAndStop(4) via ActionGotoFrame(3) with NO ActionPlay (verifies playVar=0 fires BEFORE swf_frame=4!)
    const gotoAndStop4 = new Uint8Array([0x81, 0x02, 0x00, 0x03, 0x00, 0x00]);
    writeTag(tagWriter, SwfTagCode.DO_ACTION, gotoAndStop4);
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 4: menu target frame (has NO stop() of its own — relies solely on Frame 3's gotoAndStop(4)!)
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBytes = assembleFwsSwf(550, 400, 30, 4, tagWriter.toByteArray(), 8);
    const res = await transpileSwfToAst(swfBytes, 'intro-gotoandplay-test');
    if (!res.success) {
      errors.push(`Transpilation failed: ${res.error}`);
    } else {
      const rt = createHeadlessSwfRuntime(res.astSource, res.svgMarkup);
      // Starts stopped on Frame 1 while introSplash runs
      if (rt.engine.vars.swf_frame !== 1 || rt.engine.vars.swf_playing !== 0) {
        errors.push(`Expected Frame 1 stopped initially, got frame=${rt.engine.vars.swf_frame}, playing=${rt.engine.vars.swf_playing}`);
      }
      // Step 25 ticks (~0.42s @ 30fps -> introSplash hits Frame 2 -> _root.gotoAndPlay(2) -> advances to 3 -> gotoAndStop(4))
      for (let i = 0; i < 25; i++) rt.tick(1 / 60);
      if (rt.engine.vars.swf_frame !== 4) {
        errors.push(`Expected introSplash -> gotoAndPlay(2) -> Frame 3 -> gotoAndStop(4) to reach Frame 4, got swf_frame=${rt.engine.vars.swf_frame}, swf_playing=${rt.engine.vars.swf_playing}`);
      }
      if (rt.engine.vars.swf_playing !== 0) {
        errors.push(`Expected Frame 3 gotoAndStop(4) to leave swf_playing=0 on Frame 4, got swf_playing=${rt.engine.vars.swf_playing}`);
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 21: AVM1 ActionGotoFrame+ActionPlay Fusion & Intro Sprite -> Menu Transition',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified intro sprite _root.gotoAndPlay(2) keeps swf_playing=1 across transition and Frame 3 gotoAndStop(4) stops cleanly on Frame 4.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 22: Lazy-Loaded Pure-SVG AVM1 Micro-VM Core
  //                (Loops, Arrays, DefineFunction2, ExportAssets + attachMovie,
  //                 DefineEditText live HUD, _xmouse/_ymouse, Key.isDown, hitTest)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const errors: string[] = [];

    // Raw SWF v8 bytecode assembler helpers (spec-exact: 0x99 = ActionJump, 0x9D = ActionIf)
    const writePushStr = (out: number[], s: string) => {
      const payload = [0x00, ...Array.from(s).map((c) => c.charCodeAt(0)), 0x00];
      out.push(0x96, payload.length & 0xff, (payload.length >> 8) & 0xff, ...payload);
    };
    const writePushInt = (out: number[], n: number) => {
      const v = n | 0;
      out.push(0x96, 5, 0, 0x07, v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff);
    };
    const writePushReg = (out: number[], r: number) => {
      out.push(0x96, 2, 0, 0x04, r & 0xff);
    };

    // Build DefineEditText (Tag 37) helper
    const buildDefineEditTextTag = (charId: number, x: number, y: number, w: number, h: number, varName: string, initText: string): Uint8Array => {
      const bw = new BitWriter();
      bw.writeUI16(charId);
      bw.writeRect(x, x + w, y, y + h);
      bw.syncBits();
      // flags1: HasText(0x80) | HasTextColor(0x04) | HasFont(0x01)
      bw.writeUI8(0x85);
      // flags2: HasLayout(0x20)
      bw.writeUI8(0x20);
      bw.writeUI16(1); // fontId
      bw.writeUI16(16 * 20); // fontHeight 16px
      bw.writeUI8(255); bw.writeUI8(255); bw.writeUI8(255); bw.writeUI8(255); // white RGBA
      bw.writeUI8(0); // align left
      bw.writeUI16(0); bw.writeUI16(0); bw.writeUI16(0); bw.writeUI16(0); // layout margins/leading
      bw.writeString(varName);
      bw.writeString(initText);
      return bw.toByteArray();
    };

    // Build ExportAssets (Tag 56) helper
    const buildExportAssetsTag = (entries: { charId: number; name: string }[]): Uint8Array => {
      const bw = new BitWriter();
      bw.writeUI16(entries.length);
      for (const e of entries) {
        bw.writeUI16(e.charId);
        bw.writeString(e.name);
      }
      return bw.toByteArray();
    };

    const tagWriter = new BitWriter();
    const bg = new BitWriter();
    bg.writeUI8(10); bg.writeUI8(15); bg.writeUI8(30);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    // Shapes: 1 = ship (30x30), 2 = bullet (10x10), 3 = enemy (30x30)
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, 0, 0, 30, 30, [56, 189, 248, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 10, 10, [250, 204, 21, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(3, 0, 0, 30, 30, [239, 68, 68, 255], 3));

    // Sprites: 10 = bullet_mc, 11 = ship_mc, 12 = enemy_mc
    const makeSimpleSprite = (charId: number, shapeId: number) => {
      const st = new BitWriter();
      writeTag(st, 26, buildPlaceObject2Tag({ depth: 1, characterId: shapeId }));
      writeTag(st, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
      writeTag(st, SwfTagCode.END, new Uint8Array(0));
      writeTag(tagWriter, 39, buildDefineSpriteTag(charId, 1, st.toByteArray()));
    };
    makeSimpleSprite(10, 2);
    makeSimpleSprite(11, 1);
    makeSimpleSprite(12, 3);

    // ExportAssets (Tag 56): "bulletLink" -> Sprite 10
    writeTag(tagWriter, 56, buildExportAssetsTag([{ charId: 10, name: 'bulletLink' }]));

    // DefineEditText (Tag 37): charId 20 bound to variable "score"
    writeTag(tagWriter, 37, buildDefineEditTextTag(20, 10, 10, 120, 24, 'score', '0'));

    // Place ship (50,100), enemy (180,100), score HUD
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 11, name: 'ship', matrix: { txPx: 50, tyPx: 100 } }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 12, name: 'enemy', matrix: { txPx: 180, tyPx: 100 } }));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 3, characterId: 20, name: 'scoreField' }));

    // Frame 1 DoAction:
    // 1) stop(); score = 0;
    // 2) DefineFunction2 addBonus(r1=a, r2=b) { return r1 * 2 + r2; }
    // 3) for (i = 0; i < 3; i++) { _root.attachMovie("bulletLink", "b" + i, 100 + i, {_x: 100 + i * 40, _y: 100}); }
    // 4) onEnterFrame = function() {
    //      if (Key.isDown(39)) { ship._x = ship._x + 20; }
    //      if (b2.hitTest(enemy)) { score = score + addBonus(10, 5); b2.removeMovieClip(); }
    //      aimX = _root._xmouse;
    //    }
    const act: number[] = [];
    act.push(0x07); // stop()
    writePushStr(act, 'score');
    writePushInt(act, 0);
    act.push(0x1D); // SetVariable score = 0

    // DefineFunction2 addBonus(a->reg1, b->reg2) { return reg1 * 2 + reg2; }
    const fnBody: number[] = [];
    writePushReg(fnBody, 1);
    writePushInt(fnBody, 2);
    fnBody.push(0x0C); // Multiply
    writePushReg(fnBody, 2);
    fnBody.push(0x47); // Add2
    fnBody.push(0x3E); // Return
    const fnHdr: number[] = [];
    for (const ch of 'addBonus') fnHdr.push(ch.charCodeAt(0));
    fnHdr.push(0x00);
    fnHdr.push(2, 0); // numParams = 2
    fnHdr.push(4);    // registerCount = 4
    fnHdr.push(0x00, 0x00); // flags1, flags2
    fnHdr.push(1, 'a'.charCodeAt(0), 0x00); // param1 -> reg1
    fnHdr.push(2, 'b'.charCodeAt(0), 0x00); // param2 -> reg2
    fnHdr.push(fnBody.length & 0xff, (fnBody.length >> 8) & 0xff); // codeSize
    act.push(0x8E, fnHdr.length & 0xff, (fnHdr.length >> 8) & 0xff, ...fnHdr, ...fnBody);

    // Loop: i = 0; while (i < 3) { attachMovie("bulletLink", "b" + i, 100 + i, {_x: 100 + i*40, _y: 100}); i++; }
    writePushStr(act, 'i');
    writePushInt(act, 0);
    act.push(0x1D); // i = 0

    const loopHeadOff = act.length;
    writePushStr(act, 'i');
    act.push(0x1C); // GetVariable i
    writePushInt(act, 3);
    act.push(0x48); // Less2 (i < 3)
    act.push(0x12); // Not (!(i < 3))
    const ifPatchPos = act.length;
    act.push(0x9D, 2, 0, 0, 0); // ActionIf -> jump past loop end if !(i < 3)

    // Build initObj = {_x: 100 + i * 40, _y: 100}
    writePushStr(act, '_x');
    writePushInt(act, 100);
    writePushStr(act, 'i');
    act.push(0x1C);
    writePushInt(act, 40);
    act.push(0x0C);
    act.push(0x47); // 100 + i * 40
    writePushStr(act, '_y');
    writePushInt(act, 100);
    writePushInt(act, 2);
    act.push(0x43); // InitObject -> arg3 (initObj)
    // arg2: depth = 100 + i
    writePushInt(act, 100);
    writePushStr(act, 'i');
    act.push(0x1C);
    act.push(0x47);
    // arg1: name = "b" + i
    writePushStr(act, 'b');
    writePushStr(act, 'i');
    act.push(0x1C);
    act.push(0x47);
    // arg0: linkage = "bulletLink"
    writePushStr(act, 'bulletLink');
    writePushInt(act, 4); // numArgs = 4
    writePushStr(act, '_root');
    act.push(0x1C);
    writePushStr(act, 'attachMovie');
    act.push(0x52); // CallMethod
    act.push(0x17); // Pop return value

    // i = i + 1
    writePushStr(act, 'i');
    writePushStr(act, 'i');
    act.push(0x1C);
    act.push(0x50); // Increment
    act.push(0x1D); // SetVariable

    // ActionJump back to loopHeadOff
    const backRel = loopHeadOff - (act.length + 5);
    act.push(0x99, 2, 0, backRel & 0xff, (backRel >> 8) & 0xff);
    // Patch ActionIf forward jump offset
    const fwdRel = act.length - (ifPatchPos + 5);
    act[ifPatchPos + 3] = fwdRel & 0xff;
    act[ifPatchPos + 4] = (fwdRel >> 8) & 0xff;

    // onEnterFrame anonymous function (DefineFunction 0x9B)
    const efBody: number[] = [];
    // if (Key.isDown(39)) { ship._x = ship._x + 20; }
    writePushInt(efBody, 39);
    writePushInt(efBody, 1);
    writePushStr(efBody, 'Key');
    efBody.push(0x1C);
    writePushStr(efBody, 'isDown');
    efBody.push(0x52);
    efBody.push(0x12); // Not
    const kSkipPos = efBody.length;
    efBody.push(0x9D, 2, 0, 0, 0);
    writePushStr(efBody, 'ship');
    efBody.push(0x1C);
    writePushStr(efBody, '_x');
    writePushStr(efBody, 'ship');
    efBody.push(0x1C);
    writePushStr(efBody, '_x');
    efBody.push(0x4E);
    writePushInt(efBody, 20);
    efBody.push(0x47);
    efBody.push(0x4F); // ship._x = ship._x + 20
    const kRel = efBody.length - (kSkipPos + 5);
    efBody[kSkipPos + 3] = kRel & 0xff;
    efBody[kSkipPos + 4] = (kRel >> 8) & 0xff;

    // if (b2.hitTest(enemy)) { score = score + addBonus(10, 5); b2.removeMovieClip(); }
    writePushStr(efBody, 'enemy');
    efBody.push(0x1C);
    writePushInt(efBody, 1);
    writePushStr(efBody, 'b2');
    efBody.push(0x1C);
    writePushStr(efBody, 'hitTest');
    efBody.push(0x52);
    efBody.push(0x12); // Not
    const hSkipPos = efBody.length;
    efBody.push(0x9D, 2, 0, 0, 0);
    writePushStr(efBody, 'score');
    writePushStr(efBody, 'score');
    efBody.push(0x1C);
    // CallFunction addBonus(10, 5): push args in reverse (5, 10, numArgs=2, "addBonus")
    writePushInt(efBody, 5);
    writePushInt(efBody, 10);
    writePushInt(efBody, 2);
    writePushStr(efBody, 'addBonus');
    efBody.push(0x3D);
    efBody.push(0x47); // score + addBonus(10, 5)
    efBody.push(0x1D);
    // b2.removeMovieClip()
    writePushInt(efBody, 0);
    writePushStr(efBody, 'b2');
    efBody.push(0x1C);
    writePushStr(efBody, 'removeMovieClip');
    efBody.push(0x52);
    efBody.push(0x17);
    const hRel = efBody.length - (hSkipPos + 5);
    efBody[hSkipPos + 3] = hRel & 0xff;
    efBody[hSkipPos + 4] = (hRel >> 8) & 0xff;

    // aimX = _root._xmouse
    writePushStr(efBody, 'aimX');
    writePushStr(efBody, '_root');
    efBody.push(0x1C);
    writePushStr(efBody, '_xmouse');
    efBody.push(0x4E);
    efBody.push(0x1D);

    // Push "onEnterFrame", anonymous DefineFunction(efBody), SetVariable
    writePushStr(act, 'onEnterFrame');
    const efHdr = [0x00, 0, 0, efBody.length & 0xff, (efBody.length >> 8) & 0xff];
    act.push(0x9B, efHdr.length & 0xff, (efHdr.length >> 8) & 0xff, ...efHdr, ...efBody);
    act.push(0x1D); // SetVariable onEnterFrame = fn
    act.push(0x00); // ActionEnd

    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Uint8Array(act));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBytes = assembleFwsSwf(550, 400, 30, 1, tagWriter.toByteArray(), 8);
    const res = await transpileSwfToAst(swfBytes, 'avm1-microvm-core');
    if (!res.success) {
      errors.push(`Transpilation failed: ${res.error}`);
    } else {
      // Load parseAst + ASTAVM1Runtime directly in isolated sandbox
      const playerDir = path.resolve(process.cwd(), 'static/player');
      const avmSandbox: any = { console, Math, Date, performance, Uint8Array, ArrayBuffer, DataView, Map, Set, Number, String, Boolean, Array, Object, JSON, Buffer, TextDecoder, atob };
      avmSandbox.globalThis = avmSandbox;
      vm.runInNewContext(fs.readFileSync(path.join(playerDir, 'ast-parser.js'), 'utf8'), avmSandbox);
      vm.runInNewContext(fs.readFileSync(path.join(playerDir, 'ast-avm1-vm.js'), 'utf8'), avmSandbox);
      const parsed = avmSandbox.parseAst(res.astSource);
      if (!parsed || !parsed.swfVmPayload) {
        errors.push('parseAst did not extract (:swf-vm "...") payload');
      } else {
        const vmInst = new avmSandbox.ASTAVM1Runtime(parsed.swfVmPayload, {});
        // Create lightweight mock SVG container
        const mockContainer = {
          childNodes: [] as any[],
          firstChild: null as any,
          appendChild(c: any) { this.childNodes.push(c); this.firstChild = this.childNodes[0]; return c; },
          removeChild(c: any) { const idx = this.childNodes.indexOf(c); if (idx !== -1) this.childNodes.splice(idx, 1); this.firstChild = this.childNodes[0] || null; return c; },
          replaceChildren(...nodes: any[]) { this.childNodes = nodes.slice(); this.firstChild = this.childNodes[0] || null; },
          setAttribute() {},
          addEventListener() {},
          removeEventListener() {},
        };
        vmInst.mount(mockContainer, mockContainer);

        // Verify attachMovie created b0 (x=100), b1 (x=140), b2 (x=180)
        const b0 = vmInst.rootClip.getChildByName('b0');
        const b1 = vmInst.rootClip.getChildByName('b1');
        const b2 = vmInst.rootClip.getChildByName('b2');
        const enemy = vmInst.rootClip.getChildByName('enemy');
        const ship = vmInst.rootClip.getChildByName('ship');
        const scoreField = vmInst.rootClip.getChildByName('scoreField');
        if (!b0 || !b1 || !b2) {
          errors.push(`attachMovie loop failed: b0=${Boolean(b0)}, b1=${Boolean(b1)}, b2=${Boolean(b2)}`);
        } else {
          if (b0._x !== 100 || b1._x !== 140 || b2._x !== 180) {
            errors.push(`Unexpected attachMovie positions: b0=${b0._x}, b1=${b1._x}, b2=${b2._x}`);
          }
          if (!b2.hitTest(enemy)) errors.push('Expected b2.hitTest(enemy) === true');
          if (b0.hitTest(enemy)) errors.push('Expected b0.hitTest(enemy) === false');
          if (!b2.hitTest(185, 105, true)) errors.push('Expected b2.hitTest(185, 105, true) === true');
        }

        // Hold Right Arrow (39), move mouse to (320, 210), and step 1 SWF frame
        vmInst.triggerKeyDown(39);
        vmInst.setMousePosition(320, 210);
        vmInst.stepOneSwfFrame();

        if (!ship || ship._x !== 70) {
          errors.push(`Expected ship._x === 70 after Key.isDown(39), got ${ship && ship._x}`);
        }
        if (vmInst.rootClip._vars.score !== 25) {
          errors.push(`Expected score === 25 from DefineFunction2 addBonus(10,5), got ${vmInst.rootClip._vars.score}`);
        }
        if (vmInst.rootClip.getChildByName('b2') !== undefined) {
          errors.push('Expected b2 to be removed by removeMovieClip() after hitTest');
        }
        if (!scoreField || scoreField.textEl.textContent !== '25') {
          errors.push(`Expected DefineEditText live <text> textContent === "25", got "${scoreField && scoreField.textEl.textContent}"`);
        }
        if (vmInst.rootClip._vars.aimX !== 320) {
          errors.push(`Expected aimX === 320 from _root._xmouse, got ${vmInst.rootClip._vars.aimX}`);
        }
        vmInst.destroy();
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 22: Pure-SVG AVM1 Micro-VM (Loops, DefineFunction2, ExportAssets/attachMovie, DefineEditText, hitTest)',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified authentic AVM1 bytecode execution: for-loop attachMovie via ExportAssets, DefineFunction2 register args, hitTest, Key.isDown, _xmouse, and live DefineEditText SVG <text> sync.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // SIMULATION 23: Pure-SVG AVM1 Micro-VM — Multi-Frame Intro -> Menu Button -> Play,
  //                Drawing API, startDrag/stopDrag, Reset & 60 FPS Budget
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const errors: string[] = [];

    const writePushStr = (out: number[], s: string) => {
      const payload = [0x00, ...Array.from(s).map((c) => c.charCodeAt(0)), 0x00];
      out.push(0x96, payload.length & 0xff, (payload.length >> 8) & 0xff, ...payload);
    };
    const writePushInt = (out: number[], n: number) => {
      const v = n | 0;
      out.push(0x96, 5, 0, 0x07, v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff);
    };

    const tagWriter = new BitWriter();
    const bg = new BitWriter();
    bg.writeUI8(15); bg.writeUI8(23); bg.writeUI8(42);
    writeTag(tagWriter, SwfTagCode.SET_BACKGROUND_COLOR, bg.toByteArray());

    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(1, 0, 0, 100, 40, [34, 197, 94, 255], 3));
    writeTag(tagWriter, SwfTagCode.DEFINE_SHAPE3, buildRectShapeTag(2, 0, 0, 40, 40, [56, 189, 248, 255], 3));

    // Intro Sprite (char 10): 2 frames; Frame 2 calls _root.gotoAndStop("menu")
    const introTags = new BitWriter();
    writeTag(introTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 2 }));
    writeTag(introTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    const introAct: number[] = [];
    writePushStr(introAct, 'menu');
    writePushInt(introAct, 1);
    writePushStr(introAct, '_root');
    introAct.push(0x1C);
    writePushStr(introAct, 'gotoAndStop');
    introAct.push(0x52, 0x17, 0x00);
    writeTag(introTags, SwfTagCode.DO_ACTION, new Uint8Array(introAct));
    writeTag(introTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(introTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(10, 2, introTags.toByteArray()));

    // Hero Sprite (char 11)
    const heroTags = new BitWriter();
    writeTag(heroTags, 26, buildPlaceObject2Tag({ depth: 1, characterId: 2 }));
    writeTag(heroTags, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(heroTags, SwfTagCode.END, new Uint8Array(0));
    writeTag(tagWriter, 39, buildDefineSpriteTag(11, 1, heroTags.toByteArray()));

    // DefineButton2 (char 20): Release (0x0008) sets started=1 and _root.gotoAndStop("play")
    const btnAct: number[] = [];
    writePushStr(btnAct, 'started');
    writePushInt(btnAct, 1);
    btnAct.push(0x1D);
    writePushStr(btnAct, 'play');
    writePushInt(btnAct, 1);
    writePushStr(btnAct, '_root');
    btnAct.push(0x1C);
    writePushStr(btnAct, 'gotoAndStop');
    btnAct.push(0x52, 0x17, 0x00);
    writeTag(
      tagWriter,
      34,
      buildDefineButton2Tag(
        20,
        [{ states: 0x0F, characterId: 1, depth: 1, matrix: { txPx: 0, tyPx: 0 } }],
        [{ condFlags: 0x0008, actions: new Uint8Array(btnAct) }]
      )
    );

    // Frame 1 ("intro"): stop() + introSprite
    const lbl1 = new BitWriter(); lbl1.writeString('intro');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, lbl1.toByteArray());
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Uint8Array([0x07, 0x00]));
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 1, characterId: 10, name: 'introMc' }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 2 ("menu"): remove intro, place Start Button
    const lbl2 = new BitWriter(); lbl2.writeString('menu');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, lbl2.toByteArray());
    const rm1 = new BitWriter(); rm1.writeUI16(1);
    writeTag(tagWriter, 28, rm1.toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 2, characterId: 20, name: 'startBtn', matrix: { txPx: 200, tyPx: 160 } }));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));

    // Frame 3 ("play"): remove button, place hero, draw laser with Drawing API, tick framesRun++
    const lbl3 = new BitWriter(); lbl3.writeString('play');
    writeTag(tagWriter, SwfTagCode.FRAME_LABEL, lbl3.toByteArray());
    const rm2 = new BitWriter(); rm2.writeUI16(2);
    writeTag(tagWriter, 28, rm2.toByteArray());
    writeTag(tagWriter, 26, buildPlaceObject2Tag({ depth: 3, characterId: 11, name: 'hero', matrix: { txPx: 100, tyPx: 100 } }));
    const playAct: number[] = [];
    // hero.lineStyle(2, 0x38bdf8, 100); hero.moveTo(0, 0); hero.lineTo(60, 40);
    writePushInt(playAct, 100); writePushInt(playAct, 0x38bdf8); writePushInt(playAct, 2); writePushInt(playAct, 3);
    writePushStr(playAct, 'hero'); playAct.push(0x1C); writePushStr(playAct, 'lineStyle'); playAct.push(0x52, 0x17);
    writePushInt(playAct, 0); writePushInt(playAct, 0); writePushInt(playAct, 2);
    writePushStr(playAct, 'hero'); playAct.push(0x1C); writePushStr(playAct, 'moveTo'); playAct.push(0x52, 0x17);
    writePushInt(playAct, 40); writePushInt(playAct, 60); writePushInt(playAct, 2);
    writePushStr(playAct, 'hero'); playAct.push(0x1C); writePushStr(playAct, 'lineTo'); playAct.push(0x52, 0x17);
    // framesRun = 0; onEnterFrame = function() { framesRun = framesRun + 1; }
    writePushStr(playAct, 'framesRun'); writePushInt(playAct, 0); playAct.push(0x1D);
    const tickBody: number[] = [];
    writePushStr(tickBody, 'framesRun');
    writePushStr(tickBody, 'framesRun'); tickBody.push(0x1C, 0x50, 0x1D);
    writePushStr(playAct, 'onEnterFrame');
    const tickHdr = [0x00, 0, 0, tickBody.length & 0xff, (tickBody.length >> 8) & 0xff];
    playAct.push(0x9B, tickHdr.length & 0xff, (tickHdr.length >> 8) & 0xff, ...tickHdr, ...tickBody, 0x1D, 0x00);
    writeTag(tagWriter, SwfTagCode.DO_ACTION, new Uint8Array(playAct));
    writeTag(tagWriter, SwfTagCode.SHOW_FRAME, new Uint8Array(0));
    writeTag(tagWriter, SwfTagCode.END, new Uint8Array(0));

    const swfBytes = assembleFwsSwf(550, 400, 30, 3, tagWriter.toByteArray(), 7);
    const res = await transpileSwfToAst(swfBytes, 'avm1-lifecycle-test');
    if (!res.success) {
      errors.push(`Transpilation failed: ${res.error}`);
    } else {
      const playerDir = path.resolve(process.cwd(), 'static/player');
      const avmSandbox: any = { console, Math, Date, performance, Uint8Array, ArrayBuffer, DataView, Map, Set, Number, String, Boolean, Array, Object, JSON, Buffer, TextDecoder, atob };
      avmSandbox.globalThis = avmSandbox;
      vm.runInNewContext(fs.readFileSync(path.join(playerDir, 'ast-parser.js'), 'utf8'), avmSandbox);
      vm.runInNewContext(fs.readFileSync(path.join(playerDir, 'ast-avm1-vm.js'), 'utf8'), avmSandbox);
      const parsed = avmSandbox.parseAst(res.astSource);
      const vmInst = new avmSandbox.ASTAVM1Runtime(parsed.swfVmPayload, {});
      const mockContainer = {
        childNodes: [] as any[],
        firstChild: null as any,
        appendChild(c: any) { this.childNodes.push(c); this.firstChild = this.childNodes[0]; return c; },
        removeChild(c: any) { const idx = this.childNodes.indexOf(c); if (idx !== -1) this.childNodes.splice(idx, 1); this.firstChild = this.childNodes[0] || null; return c; },
        replaceChildren(...nodes: any[]) { this.childNodes = nodes.slice(); this.firstChild = this.childNodes[0] || null; },
        setAttribute() {},
        addEventListener() {},
        removeEventListener() {},
      };
      vmInst.mount(mockContainer, mockContainer);

      if (vmInst.rootClip._currentframe !== 1) errors.push(`Expected initial frame 1, got ${vmInst.rootClip._currentframe}`);

      // Step 2 SWF frames -> introMc hits Frame 2 -> _root.gotoAndStop("menu") (Frame 2)
      vmInst.stepOneSwfFrame();
      vmInst.stepOneSwfFrame();
      if (vmInst.rootClip._currentframe !== 2) {
        errors.push(`Expected introMc to jump _root to Frame 2 ("menu"), got ${vmInst.rootClip._currentframe}`);
      }

      // Click DefineButton2 startBtn -> transitions to Frame 3 ("play") & sets started=1
      const startBtn = vmInst.rootClip.getChildByName('startBtn');
      if (!startBtn) {
        errors.push('startBtn not mounted on Frame 2');
      } else {
        startBtn.triggerClick();
        if (vmInst.rootClip._currentframe !== 3 || vmInst.rootClip._vars.started !== 1) {
          errors.push(`Expected startBtn click to jump to Frame 3 with started=1, got frame=${vmInst.rootClip._currentframe}, started=${vmInst.rootClip._vars.started}`);
        }
      }

      // Verify Flash Drawing API generated a pure SVG <path> on hero
      const hero = vmInst.rootClip.getChildByName('hero');
      if (!hero || !hero._drawGroup || hero._drawGroup.children.length === 0) {
        errors.push('Expected Flash Drawing API (lineStyle/moveTo/lineTo) to render a pure SVG <path>');
      } else {
        // Test startDrag / stopDrag
        vmInst.startDragClip(hero, true, 0, 0, 500, 350);
        vmInst.setMousePosition(240, 180);
        if (hero._x !== 240 || hero._y !== 180) {
          errors.push(`Expected startDragClip to move hero to (240,180), got (${hero._x},${hero._y})`);
        }
        vmInst.stopDragClip();
        vmInst.setMousePosition(400, 300);
        if (hero._x !== 240 || hero._y !== 180) {
          errors.push('Expected stopDragClip to release hero');
        }
      }

      // Benchmark 120 render ticks (2 seconds @ 60Hz -> 60 SWF frames @ 30fps)
      const tBench0 = performance.now();
      for (let i = 0; i < 120; i++) vmInst.step(1 / 60);
      const benchMs = performance.now() - tBench0;
      if ((vmInst.rootClip._vars.framesRun || 0) < 55) {
        errors.push(`Expected ~60 SWF framesRun over 2s @ 30fps, got ${vmInst.rootClip._vars.framesRun}`);
      }
      if (benchMs > 100) {
        errors.push(`120-tick AVM1 benchmark exceeded 100ms budget (${benchMs.toFixed(2)}ms)`);
      }

      // Verify reset() cleanly returns to Frame 1
      vmInst.reset();
      if (vmInst.rootClip._currentframe !== 1) {
        errors.push(`Expected reset() to return to Frame 1, got ${vmInst.rootClip._currentframe}`);
      }
      vmInst.destroy();
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 23: Pure-SVG AVM1 Micro-VM (Intro->Menu->Play, DefineButton2, Drawing API, Drag, Reset & 60 FPS)',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified full SWF lifecycle: intro sprite label jump, DefineButton2 release transition, SVG Drawing API paths, startDrag/stopDrag, reset(), and 120-tick 60 FPS frame budget.',
      errors,
    });
  }

  // --------------------------------------------------------------------------
  // Simulation 24: Built-in Live Binary SWF v8 Samples (Arcade Target & Harmonic Pendulum)
  // --------------------------------------------------------------------------
  {
    const start = performance.now();
    const errors: string[] = [];
    const { parseAst } = loadPlayerModule('ast-parser.js');
    const { ASTAVM1Runtime } = loadPlayerModule('ast-avm1-vm.js');

    // 1. Arcade Target SWF v8 sample
    const arcadeBytes = buildFlashArcadeSampleSwf();
    const arcadeRes = await transpileSwfToAst(arcadeBytes, 'flash-arcade-target');
    if (!arcadeRes.success) {
      errors.push(`flash-arcade-target transpile failed: ${arcadeRes.error}`);
    } else {
      const parsed = parseAst(arcadeRes.astSource);
      if (!parsed || !parsed.swfVmPayload) {
        errors.push('flash-arcade-target missing swfVmPayload');
      } else {
        const container = createAvm1MockContainer();
        const vmInst = new ASTAVM1Runtime(parsed.swfVmPayload, {});
        vmInst.mount(container, container);
        if (vmInst.rootClip._currentframe !== 1) {
          errors.push(`Arcade sample expected boot on Frame 1 ("menu"), got ${vmInst.rootClip._currentframe}`);
        }
        // Click Start button on Frame 1 -> Frame 2 ("play")
        const startBtn = Array.from(vmInst._liveButtons)[0] as any;
        if (!startBtn) {
          errors.push('Arcade sample Start DefineButton2 not mounted on Frame 1');
        } else {
          startBtn._onPointerDown();
          startBtn._onPointerUp(true);
        }
        if (vmInst.rootClip._currentframe !== 2) {
          errors.push(`Arcade Start button click failed to enter Frame 2 ("play"), got ${vmInst.rootClip._currentframe}`);
        }
        const targetClip = vmInst.rootClip.getChildByName('target');
        const playerClip = vmInst.rootClip.getChildByName('player');
        if (!targetClip || !playerClip) {
          errors.push('Arcade sample missing target or player MovieClip on Frame 2');
        } else {
          const x0 = targetClip._x;
          vmInst.step(1 / 30);
          if (targetClip._x === x0) errors.push('Arcade target did not move onEnterFrame');
          // Move player directly onto target and step -> hitTest must score +10 and attachMovie("spark")
          playerClip._x = targetClip._x;
          playerClip._y = targetClip._y;
          vmInst.setMousePosition(0, 0);
          vmInst.step(1 / 30);
          if (vmInst.rootClip._vars.score !== 10) {
            errors.push(`Arcade hitTest expected score=10, got ${vmInst.rootClip._vars.score}`);
          }
          if (!vmInst.rootClip.getChildByName('sp')) {
            errors.push('Arcade hitTest did not spawn "sp" via attachMovie("spark", ...)');
          }
          const hudText = vmInst.rootClip._vars.hudText;
          if (hudText !== 'SCORE: 10') {
            errors.push(`Arcade HUD text expected "SCORE: 10", got "${hudText}"`);
          }
        }
        vmInst.destroy();
      }
    }

    // 2. Harmonic Pendulum SWF v8 sample
    const pendBytes = buildFlashPendulumSampleSwf();
    const pendRes = await transpileSwfToAst(pendBytes, 'flash-pendulum');
    if (!pendRes.success) {
      errors.push(`flash-pendulum transpile failed: ${pendRes.error}`);
    } else {
      const parsed = parseAst(pendRes.astSource);
      if (!parsed || !parsed.swfVmPayload) {
        errors.push('flash-pendulum missing swfVmPayload');
      } else {
        const container = createAvm1MockContainer();
        const vmInst = new ASTAVM1Runtime(parsed.swfVmPayload, {});
        vmInst.mount(container, container);
        const bob = vmInst.rootClip.getChildByName('bob');
        if (!bob) {
          errors.push('Pendulum sample missing "bob" MovieClip');
        } else {
          for (let i = 0; i < 6; i++) vmInst.step(1 / 30);
          if (Math.abs(bob._x - 300) < 5) {
            errors.push(`Pendulum bob did not swing via AVM1 Math.sin, _x=${bob._x}`);
          }
          if (!vmInst.rootClip._graphicsPaths || vmInst.rootClip._graphicsPaths.length < 1) {
            errors.push('Pendulum sample did not draw SVG rod path via Flash Drawing API');
          }
          // Click Pause/Resume button -> freezes bob
          const toggleBtn = Array.from(vmInst._liveButtons)[0] as any;
          if (toggleBtn) {
            toggleBtn._onPointerDown();
            toggleBtn._onPointerUp(true);
            const frozenX = bob._x;
            vmInst.step(1 / 30);
            if (bob._x !== frozenX) {
              errors.push(`Pendulum Pause button failed to freeze bob (${frozenX} -> ${bob._x})`);
            }
          }
        }
        vmInst.destroy();
      }
    }

    const duration = performance.now() - start;
    reports.push({
      name: 'Sim 24: Built-in Live Binary SWF v8 Samples (Arcade Target & Harmonic Pendulum on AVM1 VM)',
      passed: errors.length === 0,
      durationMs: duration,
      details: 'Verified both built-in SWF v8 drawer samples transpile, boot in pure-SVG AVM1 Micro-VM, respond to DefineButton2 clicks, execute hitTest/attachMovie/Math.sin/Drawing API, and update live HUD text.',
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
