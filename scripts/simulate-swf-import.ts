/**
 * scripts/simulate-swf-import.ts
 *
 * Automated simulation runner for legacy SWF to AST Vector Transpiler.
 * Tests multiple SWF binary structures (FWS, CWS zlib, DefineShape 1-4, quadratic Béziers,
 * ShowFrame sequences, FrameLabels, and adversarial corruptions).
 *
 * Verifies XML/SVG validity, AST S-Expression parseability, and performance metrics.
 */

import { transpileSwfToAst } from '../src/utils/swfAstParser';
import { parseSExpr } from '../src/utils/sexprParser';
import {
  BitWriter,
  assembleFwsSwf,
  assembleCwsSwf,
  writeTag,
  buildRectShapeTag,
  buildCurvedShapeTag,
  buildMorphShapeTag,
  buildDoActionTag,
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
