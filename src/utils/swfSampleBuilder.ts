// src/utils/swfSampleBuilder.ts
/**
 * Zero-dependency binary SWF v8 sample synthesizer for the Flash (.swf) Importer drawer.
 * Lazily loaded ONLY when SwfTranspilerDrawer is opened (0 bytes on initial SPA boot).
 * Produces 100% spec-valid Adobe Flash SWF v8 binaries (DefineShape3, DefineEditText,
 * DefineButton2, DefineSprite, ExportAssets, PlaceObject2, DoAction AVM1 bytecode)
 * so users can live-test the pure-SVG AVM1 Micro-VM in one click without local .swf files.
 */

class SwfBitWriter {
  private bytes: number[] = [];
  private bitBuf = 0;
  private bitCount = 0;

  align(): void {
    if (this.bitCount > 0) {
      this.bytes.push((this.bitBuf << (8 - this.bitCount)) & 0xff);
      this.bitBuf = 0;
      this.bitCount = 0;
    }
  }

  writeUB(val: number, nBits: number): void {
    for (let i = nBits - 1; i >= 0; i--) {
      this.bitBuf = (this.bitBuf << 1) | ((val >>> i) & 1);
      this.bitCount++;
      if (this.bitCount === 8) {
        this.bytes.push(this.bitBuf & 0xff);
        this.bitBuf = 0;
        this.bitCount = 0;
      }
    }
  }

  writeSB(val: number, nBits: number): void {
    const mask = (1 << nBits) - 1;
    this.writeUB(val & mask, nBits);
  }

  writeUI8(v: number): void {
    this.align();
    this.bytes.push(v & 0xff);
  }

  writeUI16(v: number): void {
    this.align();
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff);
  }

  writeSI16(v: number): void {
    this.writeUI16(v < 0 ? v + 0x10000 : v);
  }

  writeUI32(v: number): void {
    this.align();
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }

  writeBytes(arr: Uint8Array | number[]): void {
    this.align();
    for (let i = 0; i < arr.length; i++) this.bytes.push(arr[i] & 0xff);
  }

  writeCString(s: string): void {
    this.align();
    for (let i = 0; i < s.length; i++) this.bytes.push(s.charCodeAt(i) & 0xff);
    this.bytes.push(0);
  }

  writeRect(xMin: number, xMax: number, yMin: number, yMax: number): void {
    const maxAbs = Math.max(Math.abs(xMin), Math.abs(xMax), Math.abs(yMin), Math.abs(yMax), 1);
    const nBits = Math.min(31, Math.ceil(Math.log2(maxAbs + 1)) + 2);
    this.writeUB(nBits, 5);
    this.writeSB(xMin, nBits);
    this.writeSB(xMax, nBits);
    this.writeSB(yMin, nBits);
    this.writeSB(yMax, nBits);
    this.align();
  }

  writeMatrix(txPx = 0, tyPx = 0): void {
    this.writeUB(0, 1); // hasScale = 0
    this.writeUB(0, 1); // hasRotate = 0
    const tx = Math.round(txPx * 20);
    const ty = Math.round(tyPx * 20);
    if (tx === 0 && ty === 0) {
      this.writeUB(0, 5);
    } else {
      const maxAbs = Math.max(Math.abs(tx), Math.abs(ty), 1);
      const nBits = Math.min(31, Math.ceil(Math.log2(maxAbs + 1)) + 2);
      this.writeUB(nBits, 5);
      this.writeSB(tx, nBits);
      this.writeSB(ty, nBits);
    }
    this.align();
  }

  toUint8Array(): Uint8Array {
    this.align();
    return new Uint8Array(this.bytes);
  }
}

function writeTag(w: SwfBitWriter, code: number, payload: Uint8Array): void {
  if (payload.length < 63) {
    w.writeUI16(((code & 0x3ff) << 6) | payload.length);
  } else {
    w.writeUI16(((code & 0x3ff) << 6) | 0x3f);
    w.writeUI32(payload.length);
  }
  w.writeBytes(payload);
}

function buildRectShape(
  shapeId: number,
  xPx: number,
  yPx: number,
  wPx: number,
  hPx: number,
  rgba: [number, number, number, number]
): Uint8Array {
  const w = new SwfBitWriter();
  const x0 = Math.round(xPx * 20);
  const y0 = Math.round(yPx * 20);
  const dx = Math.round(wPx * 20);
  const dy = Math.round(hPx * 20);

  w.writeUI16(shapeId);
  w.writeRect(x0, x0 + dx, y0, y0 + dy);

  // FillStyleArray (DefineShape3 = RGBA)
  w.writeUI8(1);
  w.writeUI8(0x00); // solid fill
  w.writeUI8(rgba[0]);
  w.writeUI8(rgba[1]);
  w.writeUI8(rgba[2]);
  w.writeUI8(rgba[3]);

  // LineStyleArray (0 lines)
  w.writeUI8(0);

  // NumFillBits = 1, NumLineBits = 0
  w.writeUB(1, 4);
  w.writeUB(0, 4);

  // StyleChangeRecord: MoveTo (x0, y0), FillStyle1 = 1
  w.writeUB(0, 1); // non-edge
  w.writeUB(0, 1); // newStyles
  w.writeUB(0, 1); // lineStyle
  w.writeUB(1, 1); // fillStyle1
  w.writeUB(0, 1); // fillStyle0
  w.writeUB(1, 1); // moveTo
  const moveMax = Math.max(Math.abs(x0), Math.abs(y0), 1);
  const moveBits = Math.min(31, Math.ceil(Math.log2(moveMax + 1)) + 2);
  w.writeUB(moveBits, 5);
  w.writeSB(x0, moveBits);
  w.writeSB(y0, moveBits);
  w.writeUB(1, 1); // fillStyle1 = 1

  const writeStraight = (ddx: number, ddy: number) => {
    const isH = ddy === 0;
    const isV = ddx === 0;
    const val = isH ? ddx : ddy;
    const bits = Math.max(2, Math.ceil(Math.log2(Math.abs(val) + 1)) + 2);
    w.writeUB(1, 1); // edge
    w.writeUB(1, 1); // straight
    w.writeUB(bits - 2, 4);
    w.writeUB(0, 1); // not general line
    w.writeUB(isV ? 1 : 0, 1); // vertical flag
    w.writeSB(val, bits);
  };

  writeStraight(dx, 0);
  writeStraight(0, dy);
  writeStraight(-dx, 0);
  writeStraight(0, -dy);

  // EndShapeRecord
  w.writeUB(0, 6);
  w.align();
  return w.toUint8Array();
}

function buildEditText(
  charId: number,
  xPx: number,
  yPx: number,
  wPx: number,
  hPx: number,
  varName: string,
  initialText: string,
  rgba: [number, number, number, number],
  fontSizePx = 18,
  align = 0
): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI16(charId);
  w.writeRect(Math.round(xPx * 20), Math.round((xPx + wPx) * 20), Math.round(yPx * 20), Math.round((yPx + hPx) * 20));
  // Flags: HasText(1) WordWrap(0) Multiline(0) Password(0) ReadOnly(1) HasTextColor(1) HasMaxLength(0) HasFont(1)
  w.writeUB(1, 1); // HasText
  w.writeUB(0, 1); // WordWrap
  w.writeUB(0, 1); // Multiline
  w.writeUB(0, 1); // Password
  w.writeUB(1, 1); // ReadOnly
  w.writeUB(1, 1); // HasTextColor
  w.writeUB(0, 1); // HasMaxLength
  w.writeUB(1, 1); // HasFont
  // Byte 2: HasFontClass(0) AutoSize(0) HasLayout(1) NoSelect(1) Border(0) WasStatic(0) HTML(0) UseOutlines(0)
  w.writeUB(0, 1);
  w.writeUB(0, 1);
  w.writeUB(1, 1); // HasLayout
  w.writeUB(1, 1); // NoSelect
  w.writeUB(0, 1);
  w.writeUB(0, 1);
  w.writeUB(0, 1);
  w.writeUB(0, 1);

  w.writeUI16(0); // FontID
  w.writeUI16(Math.round(fontSizePx * 20)); // FontHeight
  w.writeUI8(rgba[0]);
  w.writeUI8(rgba[1]);
  w.writeUI8(rgba[2]);
  w.writeUI8(rgba[3]);
  // Layout
  w.writeUI8(align);
  w.writeUI16(0);
  w.writeUI16(0);
  w.writeUI16(0);
  w.writeSI16(0);
  w.writeCString(varName);
  w.writeCString(initialText);
  return w.toUint8Array();
}

function buildPlaceObject2(opts: {
  depth: number;
  characterId?: number;
  txPx?: number;
  tyPx?: number;
  name?: string;
}): Uint8Array {
  const w = new SwfBitWriter();
  const hasChar = opts.characterId !== undefined;
  const hasMat = opts.txPx !== undefined || opts.tyPx !== undefined;
  const hasName = Boolean(opts.name);
  let flags = 0;
  if (hasChar) flags |= 0x02;
  if (hasMat) flags |= 0x04;
  if (hasName) flags |= 0x20;
  w.writeUI8(flags);
  w.writeUI16(opts.depth);
  if (hasChar) w.writeUI16(opts.characterId!);
  if (hasMat) w.writeMatrix(opts.txPx || 0, opts.tyPx || 0);
  if (hasName) w.writeCString(opts.name!);
  return w.toUint8Array();
}

function buildRemoveObject2(depth: number): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI16(depth);
  return w.toUint8Array();
}

function buildSprite(spriteId: number, frameCount: number, innerTags: Uint8Array): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI16(spriteId);
  w.writeUI16(frameCount);
  w.writeBytes(innerTags);
  return w.toUint8Array();
}

function buildDefineButton2(
  buttonId: number,
  charId: number,
  txPx: number,
  tyPx: number,
  condFlags: number,
  actionBytes: Uint8Array
): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI16(buttonId);
  w.writeUI8(0); // TrackAsMenu = 0

  const chars = new SwfBitWriter();
  chars.writeUI8(0x0f); // Hit + Down + Over + Up
  chars.writeUI16(charId);
  chars.writeUI16(1);
  chars.writeMatrix(txPx, tyPx);
  // CXFORMWITHALPHA empty (6 zero bits -> 1 byte)
  chars.writeUI8(0);
  chars.writeUI8(0); // End of ButtonRecords
  const charBytes = chars.toUint8Array();

  // ActionOffset = 2 + charBytes.length
  w.writeUI16(2 + charBytes.length);
  w.writeBytes(charBytes);

  // ButtonCondAction
  w.writeUI16(0); // CondActionSize = 0 (last action)
  w.writeUI16(condFlags);
  w.writeBytes(actionBytes);
  return w.toUint8Array();
}

function buildExportAssets(entries: Array<{ id: number; name: string }>): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI16(entries.length);
  for (const e of entries) {
    w.writeUI16(e.id);
    w.writeCString(e.name);
  }
  return w.toUint8Array();
}

// Compact AVM1 bytecode assembler (SWF v8 spec-exact)
class Avm1Asm {
  private buf: number[] = [];

  private emitLen(code: number, payload: Uint8Array): this {
    this.buf.push(code & 0xff, payload.length & 0xff, (payload.length >>> 8) & 0xff);
    for (let i = 0; i < payload.length; i++) this.buf.push(payload[i]);
    return this;
  }

  op(code: number): this {
    this.buf.push(code & 0xff);
    return this;
  }

  stop(): this { return this.op(0x07); }
  pop(): this { return this.op(0x17); }
  add2(): this { return this.op(0x47); }
  sub(): this { return this.op(0x0b); }
  mul(): this { return this.op(0x0c); }
  div(): this { return this.op(0x0d); }
  less2(): this { return this.op(0x48); }
  greater(): this { return this.op(0x67); }
  equals2(): this { return this.op(0x49); }
  and(): this { return this.op(0x10); }
  or(): this { return this.op(0x11); }
  not(): this { return this.op(0x12); }
  getVar(): this { return this.op(0x1c); }
  setVar(): this { return this.op(0x1d); }
  getMember(): this { return this.op(0x4e); }
  setMember(): this { return this.op(0x4f); }
  newObject(): this { return this.op(0x40); }
  callFunction(): this { return this.op(0x3d); }
  callMethod(): this { return this.op(0x52); }
  trace(): this { return this.op(0x26); }

  pushBool(val: boolean): this {
    return this.emitLen(0x96, new Uint8Array([5, val ? 1 : 0]));
  }

  pushStr(s: string): this {
    const w = new SwfBitWriter();
    w.writeUI8(0);
    w.writeCString(s);
    return this.emitLen(0x96, w.toUint8Array());
  }

  pushInt(n: number): this {
    const w = new SwfBitWriter();
    w.writeUI8(7);
    w.writeUI32(n | 0);
    return this.emitLen(0x96, w.toUint8Array());
  }

  pushDouble(n: number): this {
    const ab = new ArrayBuffer(8);
    new DataView(ab).setFloat64(0, n, true);
    const u8 = new Uint8Array(ab);
    // SWF double word-swapped
    const payload = new Uint8Array([6, u8[4], u8[5], u8[6], u8[7], u8[0], u8[1], u8[2], u8[3]]);
    return this.emitLen(0x96, payload);
  }

  gotoLabel(label: string): this {
    const w = new SwfBitWriter();
    w.writeCString(label);
    return this.emitLen(0x8c, w.toUint8Array());
  }

  ifFalseSkip(bodyBuilder: (b: Avm1Asm) => void): this {
    const body = new Avm1Asm();
    bodyBuilder(body);
    const bodyBytes = body.rawBytes();
    // Negate condition -> ActionIf (0x9D) jumps over body when original condition was false
    this.not();
    const off = new SwfBitWriter();
    off.writeSI16(bodyBytes.length);
    this.emitLen(0x9d, off.toUint8Array());
    for (let i = 0; i < bodyBytes.length; i++) this.buf.push(bodyBytes[i]);
    return this;
  }

  defineFunction(name: string, params: string[], bodyBuilder: (b: Avm1Asm) => void): this {
    const body = new Avm1Asm();
    bodyBuilder(body);
    const bodyBytes = body.rawBytes();
    const hdr = new SwfBitWriter();
    hdr.writeCString(name);
    hdr.writeUI16(params.length);
    for (const p of params) hdr.writeCString(p);
    hdr.writeUI16(bodyBytes.length);
    this.emitLen(0x9b, hdr.toUint8Array());
    for (let i = 0; i < bodyBytes.length; i++) this.buf.push(bodyBytes[i]);
    return this;
  }

  // Convenience helpers
  setRootVar(name: string, valBuilder: (b: Avm1Asm) => void): this {
    this.pushStr(name);
    valBuilder(this);
    return this.setVar();
  }

  getRootVar(name: string): this {
    return this.pushStr(name).getVar();
  }

  getProp(objName: string, propName: string): this {
    return this.getRootVar(objName).pushStr(propName).getMember();
  }

  setProp(objName: string, propName: string, valBuilder: (b: Avm1Asm) => void): this {
    this.getRootVar(objName).pushStr(propName);
    valBuilder(this);
    return this.setMember();
  }

  callObjMethod(objName: string, methodName: string, argBuilders: Array<(b: Avm1Asm) => void>): this {
    // AVM1 CallMethod expects args pushed in reverse order (argN..arg1), then numArgs, obj, methodName
    for (let i = argBuilders.length - 1; i >= 0; i--) {
      argBuilders[i](this);
    }
    this.pushInt(argBuilders.length);
    this.getRootVar(objName);
    this.pushStr(methodName);
    return this.callMethod();
  }

  rawBytes(): Uint8Array {
    return new Uint8Array(this.buf);
  }

  toByteArray(): Uint8Array {
    return new Uint8Array([...this.buf, 0x00]);
  }
}

function assembleFwsSwf(width: number, height: number, fps: number, frameCount: number, tags: Uint8Array): Uint8Array {
  const body = new SwfBitWriter();
  body.writeRect(0, width * 20, 0, height * 20);
  body.writeUI16(Math.round(fps * 256));
  body.writeUI16(frameCount);
  body.writeBytes(tags);
  const bodyBytes = body.toUint8Array();

  const totalLen = 8 + bodyBytes.length;
  const out = new Uint8Array(totalLen);
  out[0] = 0x46; // F
  out[1] = 0x57; // W
  out[2] = 0x53; // S
  out[3] = 8;    // SWF v8
  out[4] = totalLen & 0xff;
  out[5] = (totalLen >>> 8) & 0xff;
  out[6] = (totalLen >>> 16) & 0xff;
  out[7] = (totalLen >>> 24) & 0xff;
  out.set(bodyBytes, 8);
  return out;
}

/**
 * Builds a live playable binary SWF v8 Arcade Target game:
 * - Frame 1 ("menu"): Title banner + clickable DefineButton2 Start button
 * - Frame 2 ("play"): Mouse & Arrow-key player ship, bouncing gold target, hitTest scoring,
 *   attachMovie("spark", ...) burst via ExportAssets, live DefineEditText HUD, and Reset button.
 */
export function buildFlashArcadeSampleSwf(): Uint8Array {
  const tags = new SwfBitWriter();

  // SetBackgroundColor (#0b1220)
  writeTag(tags, 9, new Uint8Array([11, 18, 32]));

  // Shapes
  // 1: Start button rect (180x48 green)
  writeTag(tags, 32, buildRectShape(1, 0, 0, 180, 48, [16, 185, 129, 255]));
  // 2: Player ship (36x36 cyan centered)
  writeTag(tags, 32, buildRectShape(2, -18, -18, 36, 36, [56, 189, 248, 255]));
  // 3: Gold target (34x34 amber centered)
  writeTag(tags, 32, buildRectShape(3, -17, -17, 34, 34, [250, 204, 21, 255]));
  // 4: Spark burst (18x18 rose centered)
  writeTag(tags, 32, buildRectShape(4, -9, -9, 18, 18, [244, 63, 94, 255]));
  // 5: Menu title plate (420x64 slate)
  writeTag(tags, 32, buildRectShape(5, 0, 0, 420, 64, [30, 41, 59, 255]));
  // 6: Reset button rect (96x30 indigo)
  writeTag(tags, 32, buildRectShape(6, 0, 0, 96, 30, [99, 102, 241, 255]));

  // DefineEditText
  // 10: Menu title text
  writeTag(tags, 37, buildEditText(10, 90, 96, 420, 44, 'menuTitle', 'FLASH AVM1 ARCADE — CLICK START', [248, 250, 252, 255], 20, 2));
  // 11: Start button label
  writeTag(tags, 37, buildEditText(11, 210, 212, 180, 32, 'startLbl', 'START GAME', [15, 23, 42, 255], 18, 2));
  // 12: Live Score HUD
  writeTag(tags, 37, buildEditText(12, 20, 14, 420, 32, 'hudText', 'SCORE: 0  (Move Mouse or Arrow Keys)', [248, 250, 252, 255], 16, 0));
  // 13: Reset button label
  writeTag(tags, 37, buildEditText(13, 486, 18, 96, 24, 'resetLbl', 'RESET', [255, 255, 255, 255], 13, 2));

  // Sprites
  const makeStaticSprite = (id: number, shapeId: number) => {
    const inner = new SwfBitWriter();
    writeTag(inner, 26, buildPlaceObject2({ depth: 1, characterId: shapeId }));
    writeTag(inner, 1, new Uint8Array(0));
    writeTag(inner, 0, new Uint8Array(0));
    writeTag(tags, 39, buildSprite(id, 1, inner.toUint8Array()));
  };
  makeStaticSprite(20, 2); // player sprite
  makeStaticSprite(21, 3); // target sprite
  makeStaticSprite(22, 4); // spark sprite (exported as "spark")

  // ExportAssets: "spark" -> 22
  writeTag(tags, 56, buildExportAssets([{ id: 22, name: 'spark' }]));

  // DefineButton2 30 (Start -> gotoAndStop("play"))
  const startBtnAct = new Avm1Asm()
    .callObjMethod('_root', 'gotoAndStop', [(b) => b.pushStr('play')])
    .pop()
    .toByteArray();
  writeTag(tags, 34, buildDefineButton2(30, 1, 210, 200, 0x0008, startBtnAct));

  // DefineButton2 31 (Reset score -> score = 0)
  const resetBtnAct = new Avm1Asm()
    .setRootVar('score', (b) => b.pushInt(0))
    .setRootVar('hudText', (b) => b.pushStr('SCORE: 0  (Reset!)'))
    .toByteArray();
  writeTag(tags, 34, buildDefineButton2(31, 6, 486, 12, 0x0008, resetBtnAct));

  // Frame 1: "menu"
  const lbl1 = new SwfBitWriter(); lbl1.writeCString('menu');
  writeTag(tags, 43, lbl1.toUint8Array());
  writeTag(tags, 26, buildPlaceObject2({ depth: 1, characterId: 5, txPx: 90, tyPx: 84 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 2, characterId: 10 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 3, characterId: 30 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 4, characterId: 11 }));
  writeTag(tags, 12, new Avm1Asm().stop().toByteArray());
  writeTag(tags, 1, new Uint8Array(0));

  // Frame 2: "play"
  const lbl2 = new SwfBitWriter(); lbl2.writeCString('play');
  writeTag(tags, 43, lbl2.toUint8Array());
  writeTag(tags, 28, buildRemoveObject2(1));
  writeTag(tags, 28, buildRemoveObject2(2));
  writeTag(tags, 28, buildRemoveObject2(3));
  writeTag(tags, 28, buildRemoveObject2(4));
  writeTag(tags, 26, buildPlaceObject2({ depth: 5, characterId: 21, txPx: 440, tyPx: 200, name: 'target' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 6, characterId: 20, txPx: 140, tyPx: 200, name: 'player' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 7, characterId: 12, name: 'hud' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 8, characterId: 31 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 9, characterId: 13 }));

  const gameLoop = new Avm1Asm()
    .stop()
    .setRootVar('score', (b) => b.pushInt(0))
    .setRootVar('vx', (b) => b.pushInt(5))
    .setRootVar('vy', (b) => b.pushInt(4))
    .setRootVar('sparkIdx', (b) => b.pushInt(0))
    .setRootVar('onEnterFrame', (b) => {
      b.defineFunction('', [], (fn) => {
        // Move target & bounce off walls
        fn.setProp('target', '_x', (v) => v.getProp('target', '_x').getRootVar('vx').add2());
        fn.setProp('target', '_y', (v) => v.getProp('target', '_y').getRootVar('vy').add2());
        fn.setProp('target', '_rotation', (v) => v.getProp('target', '_rotation').pushInt(4).add2());

        fn.getProp('target', '_x').pushInt(560).greater().ifFalseSkip((s) => {
          s.setRootVar('vx', (v) => v.pushInt(-5));
        });
        fn.getProp('target', '_x').pushInt(40).less2().ifFalseSkip((s) => {
          s.setRootVar('vx', (v) => v.pushInt(5));
        });
        fn.getProp('target', '_y').pushInt(365).greater().ifFalseSkip((s) => {
          s.setRootVar('vy', (v) => v.pushInt(-4));
        });
        fn.getProp('target', '_y').pushInt(65).less2().ifFalseSkip((s) => {
          s.setRootVar('vy', (v) => v.pushInt(4));
        });

        // Smooth mouse follow if mouse is inside stage (> 5)
        fn.getProp('_root', '_xmouse').pushInt(5).greater().ifFalseSkip((s) => {
          s.setProp('player', '_x', (v) =>
            v.getProp('player', '_x')
              .getProp('_root', '_xmouse').getProp('player', '_x').sub().pushDouble(0.18).mul()
              .add2()
          );
          s.setProp('player', '_y', (v) =>
            v.getProp('player', '_y')
              .getProp('_root', '_ymouse').getProp('player', '_y').sub().pushDouble(0.18).mul()
              .add2()
          );
        });

        // Arrow key controls via Key.isDown
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(37)]).ifFalseSkip((s) => {
          s.setProp('player', '_x', (v) => v.getProp('player', '_x').pushInt(7).sub());
        });
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(39)]).ifFalseSkip((s) => {
          s.setProp('player', '_x', (v) => v.getProp('player', '_x').pushInt(7).add2());
        });
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(38)]).ifFalseSkip((s) => {
          s.setProp('player', '_y', (v) => v.getProp('player', '_y').pushInt(7).sub());
        });
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(40)]).ifFalseSkip((s) => {
          s.setProp('player', '_y', (v) => v.getProp('player', '_y').pushInt(7).add2());
        });

        // Collision check: player.hitTest(target)
        fn.callObjMethod('player', 'hitTest', [(a) => a.getRootVar('target')]).ifFalseSkip((s) => {
          s.setRootVar('score', (v) => v.getRootVar('score').pushInt(10).add2());
          s.setRootVar('sparkIdx', (v) => v.getRootVar('sparkIdx').pushInt(1).add2());
          // Spawn spark via attachMovie("spark", "sp", 50)
          s.callObjMethod('_root', 'attachMovie', [
            (a) => a.pushStr('spark'),
            (a) => a.pushStr('sp'),
            (a) => a.pushInt(50),
          ]).pop();
          s.setProp('sp', '_x', (v) => v.getProp('target', '_x'));
          s.setProp('sp', '_y', (v) => v.getProp('target', '_y'));
          // Respawn target at opposite quadrant
          s.setProp('target', '_x', (v) => v.pushInt(600).getProp('target', '_x').sub());
          s.setProp('target', '_y', (v) => v.pushInt(420).getProp('target', '_y').sub());
          s.setRootVar('hudText', (v) => v.pushStr('SCORE: ').getRootVar('score').add2());
        });
      });
    })
    .toByteArray();

  writeTag(tags, 12, gameLoop);
  writeTag(tags, 1, new Uint8Array(0));
  writeTag(tags, 0, new Uint8Array(0));

  return assembleFwsSwf(600, 400, 30, 2, tags.toUint8Array());
}

/**
 * Builds a live binary SWF v8 Harmonic Pendulum physics simulation driven by authentic AVM1
 * Math.sin/cos + Flash Drawing API (lineStyle/moveTo/lineTo -> live SVG <path>) + DefineButton2 toggle.
 */
export function buildFlashPendulumSampleSwf(): Uint8Array {
  const tags = new SwfBitWriter();
  writeTag(tags, 9, new Uint8Array([15, 23, 42]));

  // Shapes: 1 = pivot, 2 = pendulum bob, 3 = pause/resume button
  writeTag(tags, 32, buildRectShape(1, -8, -8, 16, 16, [148, 163, 184, 255]));
  writeTag(tags, 32, buildRectShape(2, -20, -20, 40, 40, [56, 189, 248, 255]));
  writeTag(tags, 32, buildRectShape(3, 0, 0, 150, 36, [245, 158, 11, 255]));

  // Text HUD
  writeTag(tags, 37, buildEditText(10, 20, 16, 380, 30, 'hudText', 'HARMONIC PENDULUM — RUNNING', [248, 250, 252, 255], 16, 0));
  writeTag(tags, 37, buildEditText(11, 430, 20, 150, 28, 'btnLbl', 'PAUSE / RESUME', [15, 23, 42, 255], 13, 2));

  // Bob sprite
  const bobInner = new SwfBitWriter();
  writeTag(bobInner, 26, buildPlaceObject2({ depth: 1, characterId: 2 }));
  writeTag(bobInner, 1, new Uint8Array(0));
  writeTag(bobInner, 0, new Uint8Array(0));
  writeTag(tags, 39, buildSprite(20, 1, bobInner.toUint8Array()));

  // Toggle button
  const toggleAct = new Avm1Asm()
    .setRootVar('running', (v) => v.pushInt(1).getRootVar('running').sub())
    .toByteArray();
  writeTag(tags, 34, buildDefineButton2(30, 3, 430, 14, 0x0008, toggleAct));

  writeTag(tags, 26, buildPlaceObject2({ depth: 1, characterId: 1, txPx: 300, tyPx: 80 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 2, characterId: 20, txPx: 300, tyPx: 290, name: 'bob' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 3, characterId: 10 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 4, characterId: 30 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 5, characterId: 11 }));

  const pendLoop = new Avm1Asm()
    .stop()
    .setRootVar('phase', (v) => v.pushDouble(0))
    .setRootVar('running', (v) => v.pushInt(1))
    .setRootVar('onEnterFrame', (b) => {
      b.defineFunction('', [], (fn) => {
        fn.getRootVar('running').pushInt(0).greater().ifFalseSkip((s) => {
          s.setRootVar('phase', (v) => v.getRootVar('phase').pushDouble(0.08).add2());
          // theta = 0.85 * Math.sin(phase)
          s.setRootVar('theta', (v) =>
            v.callObjMethod('Math', 'sin', [(a) => a.getRootVar('phase')]).pushDouble(0.85).mul()
          );
          // bob._x = 300 + 210 * Math.sin(theta)
          s.setProp('bob', '_x', (v) =>
            v.pushInt(300)
              .callObjMethod('Math', 'sin', [(a) => a.getRootVar('theta')]).pushInt(210).mul()
              .add2()
          );
          // bob._y = 80 + 210 * Math.cos(theta)
          s.setProp('bob', '_y', (v) =>
            v.pushInt(80)
              .callObjMethod('Math', 'cos', [(a) => a.getRootVar('theta')]).pushInt(210).mul()
              .add2()
          );
          // Draw taut pendulum rod with Flash Drawing API
          s.callObjMethod('_root', 'clear', []).pop();
          s.callObjMethod('_root', 'lineStyle', [(a) => a.pushInt(3), (a) => a.pushInt(0x94a3b8), (a) => a.pushInt(100)]).pop();
          s.callObjMethod('_root', 'moveTo', [(a) => a.pushInt(300), (a) => a.pushInt(80)]).pop();
          s.callObjMethod('_root', 'lineTo', [(a) => a.getProp('bob', '_x'), (a) => a.getProp('bob', '_y')]).pop();
          // Update HUD
          s.setRootVar('deg', (v) =>
            v.callObjMethod('Math', 'round', [(a) => a.getRootVar('theta').pushDouble(57.2958).mul()])
          );
          s.setRootVar('hudText', (v) => v.pushStr('PENDULUM ANGLE: ').getRootVar('deg').add2().pushStr(' deg').add2());
        });
      });
    })
    .toByteArray();

  writeTag(tags, 12, pendLoop);
  writeTag(tags, 1, new Uint8Array(0));
  writeTag(tags, 0, new Uint8Array(0));

  return assembleFwsSwf(600, 400, 30, 1, tags.toUint8Array());
}

// =========================================================================
// Additional SWF v8 Builders for Rich Arcade Emulation (pacman.swf)
// =========================================================================

function buildPolygonShape(
  shapeId: number,
  pointsPx: Array<[number, number]>,
  rgba: [number, number, number, number]
): Uint8Array {
  const w = new SwfBitWriter();
  const pts = pointsPx.map(([x, y]) => [Math.round(x * 20), Math.round(y * 20)] as [number, number]);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  w.writeUI16(shapeId);
  w.writeRect(minX, maxX, minY, maxY);

  // FillStyleArray (DefineShape3 = RGBA)
  w.writeUI8(1);
  w.writeUI8(0x00); // solid fill
  w.writeUI8(rgba[0]);
  w.writeUI8(rgba[1]);
  w.writeUI8(rgba[2]);
  w.writeUI8(rgba[3]);

  // LineStyleArray (0 lines)
  w.writeUI8(0);

  // NumFillBits = 1, NumLineBits = 0
  w.writeUB(1, 4);
  w.writeUB(0, 4);

  // StyleChangeRecord: MoveTo pts[0], FillStyle1 = 1
  const [x0, y0] = pts[0];
  w.writeUB(0, 1); // non-edge
  w.writeUB(0, 1); // newStyles
  w.writeUB(0, 1); // lineStyle
  w.writeUB(1, 1); // fillStyle1
  w.writeUB(0, 1); // fillStyle0
  w.writeUB(1, 1); // moveTo
  const moveMax = Math.max(Math.abs(x0), Math.abs(y0), 1);
  const moveBits = Math.min(31, Math.ceil(Math.log2(moveMax + 1)) + 2);
  w.writeUB(moveBits, 5);
  w.writeSB(x0, moveBits);
  w.writeSB(y0, moveBits);
  w.writeUB(1, 1); // fillStyle1 = 1

  for (let i = 0; i < pts.length; i++) {
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[(i + 1) % pts.length];
    const dx = nx - cx;
    const dy = ny - cy;
    if (dx === 0 && dy === 0) continue;
    const maxAbs = Math.max(Math.abs(dx), Math.abs(dy), 1);
    const bits = Math.max(2, Math.min(17, Math.ceil(Math.log2(maxAbs + 1)) + 2));
    w.writeUB(1, 1); // edge
    w.writeUB(1, 1); // straight
    w.writeUB(bits - 2, 4);
    w.writeUB(1, 1); // general line (both dx & dy)
    w.writeSB(dx, bits);
    w.writeSB(dy, bits);
  }

  w.writeUB(0, 6); // EndShapeRecord
  w.align();
  return w.toUint8Array();
}

function buildEditableTextField(
  charId: number,
  xPx: number,
  yPx: number,
  wPx: number,
  hPx: number,
  varName: string,
  initialText: string,
  rgba: [number, number, number, number],
  fontSizePx = 14,
  maxLength = 12
): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI16(charId);
  w.writeRect(Math.round(xPx * 20), Math.round((xPx + wPx) * 20), Math.round(yPx * 20), Math.round((yPx + hPx) * 20));
  // Flags1: HasText(1) WordWrap(0) Multiline(0) Password(0) ReadOnly(0=editable!) HasTextColor(1) HasMaxLength(1) HasFont(1)
  w.writeUB(1, 1);
  w.writeUB(0, 1);
  w.writeUB(0, 1);
  w.writeUB(0, 1);
  w.writeUB(0, 1); // editable!
  w.writeUB(1, 1); // HasTextColor
  w.writeUB(1, 1); // HasMaxLength
  w.writeUB(1, 1); // HasFont
  // Flags2: HasFontClass(0) AutoSize(0) HasLayout(1) NoSelect(0) Border(1) WasStatic(0) HTML(0) UseOutlines(0)
  w.writeUB(0, 1);
  w.writeUB(0, 1);
  w.writeUB(1, 1); // HasLayout
  w.writeUB(0, 1);
  w.writeUB(1, 1); // Border
  w.writeUB(0, 1);
  w.writeUB(0, 1);
  w.writeUB(0, 1);

  w.writeUI16(0); // FontID
  w.writeUI16(Math.round(fontSizePx * 20));
  w.writeUI8(rgba[0]);
  w.writeUI8(rgba[1]);
  w.writeUI8(rgba[2]);
  w.writeUI8(rgba[3]);
  w.writeUI16(maxLength);
  // Layout
  w.writeUI8(0); // left align
  w.writeUI16(0);
  w.writeUI16(0);
  w.writeUI16(0);
  w.writeSI16(0);
  w.writeCString(varName);
  w.writeCString(initialText);
  return w.toUint8Array();
}

function buildPlaceObject3WithGlow(opts: {
  depth: number;
  characterId: number;
  txPx: number;
  tyPx: number;
  name?: string;
  glowRgba: [number, number, number, number];
  blurPx?: number;
}): Uint8Array {
  const w = new SwfBitWriter();
  let flags1 = 0x02 | 0x04; // hasCharacter | hasMatrix
  if (opts.name) flags1 |= 0x20;
  w.writeUI8(flags1);
  w.writeUI8(0x01); // flags2: hasFilterList
  w.writeUI16(opts.depth);
  w.writeUI16(opts.characterId);
  w.writeMatrix(opts.txPx, opts.tyPx);
  if (opts.name) w.writeCString(opts.name);
  // FilterList: 1 GlowFilter (id = 2)
  w.writeUI8(1);
  w.writeUI8(2); // GlowFilter
  w.writeUI8(opts.glowRgba[0]);
  w.writeUI8(opts.glowRgba[1]);
  w.writeUI8(opts.glowRgba[2]);
  w.writeUI8(opts.glowRgba[3]);
  const blurFixed = Math.round((opts.blurPx || 8) * 65536);
  w.writeUI32(blurFixed); // blurX
  w.writeUI32(blurFixed); // blurY
  w.writeUI16(Math.round(1.5 * 256)); // strength 8.8 fixed
  w.writeUI8(0x01); // passes=1
  return w.toUint8Array();
}

function buildDefinePcmSound(
  soundId: number,
  freqStartHz: number,
  freqEndHz: number,
  durationMs: number
): Uint8Array {
  const rate = 11025; // rateCode = 1
  const samples = Math.max(64, Math.floor((rate * durationMs) / 1000));
  const w = new SwfBitWriter();
  w.writeUI16(soundId);
  // fmt=3 (LE PCM), rateCode=1 (11025Hz), 16-bit=1, stereo=0 -> (3<<4)|(1<<2)|(1<<1)|0 = 0x36
  w.writeUI8(0x36);
  w.writeUI32(samples);
  let phase = 0;
  for (let i = 0; i < samples; i++) {
    const u = i / samples;
    const freq = freqStartHz + (freqEndHz - freqStartHz) * u;
    phase += (2 * Math.PI * freq) / rate;
    const env = Math.sin(u * Math.PI);
    const val = Math.round(Math.sin(phase) * env * 14000);
    w.writeSI16(val);
  }
  return w.toUint8Array();
}

/**
 * Builds a complete, playable binary SWF v8 Pac-Man Arcade cartridge (`pacman.swf`):
 * - Real vector maze corridors with Flash 8 GlowFilter walls
 * - 2-frame animated chomping Pac-Man MovieClip with Arrow/WASD steering, rotation & warp tunnel
 * - 2 chasing ghosts (Blinky & Pinky) with Flash 8 GlowFilter & live `new Color(ghost).setRGB()` frightened-blue tinting
 * - Collectible dots & power pellets + Web Audio 16-bit PCM `DefineSound` ("waka" & "power")
 * - Live `DefineEditText` HUD (Score, Lives, plus editable Player Name input box) & Restart button
 */
export function buildFlashPacmanSampleSwf(): Uint8Array {
  const tags = new SwfBitWriter();

  // SetBackgroundColor (#050816 classic arcade dark)
  writeTag(tags, 9, new Uint8Array([5, 8, 22]));

  // Retro Web Audio PCM Sounds (Tag 14 DefineSound)
  writeTag(tags, 14, buildDefinePcmSound(90, 320, 620, 65));  // "waka" chomp
  writeTag(tags, 14, buildDefinePcmSound(91, 440, 1100, 140)); // "power" chime

  // Helper to build circle / pac-man wedge polygons
  const makePacPoints = (mouthDeg: number, r = 13): Array<[number, number]> => {
    const pts: Array<[number, number]> = [[0, 0]];
    const startRad = (mouthDeg * Math.PI) / 180;
    const endRad = ((360 - mouthDeg) * Math.PI) / 180;
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const a = startRad + ((endRad - startRad) * i) / steps;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  };

  const makeGhostPoints = (): Array<[number, number]> => [
    [-12, 12], [-12, -2], [-10, -9], [-5, -13], [0, -14], [5, -13], [10, -9], [12, -2],
    [12, 12], [8, 8], [4, 12], [0, 8], [-4, 12], [-8, 8],
  ];

  const makeOctagon = (r: number): Array<[number, number]> => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  };

  // Shapes:
  // 1: Pac-Man Mouth Open (golden yellow)
  writeTag(tags, 32, buildPolygonShape(1, makePacPoints(36, 13), [250, 204, 21, 255]));
  // 2: Pac-Man Mouth Nearly Closed
  writeTag(tags, 32, buildPolygonShape(2, makePacPoints(8, 13), [250, 204, 21, 255]));
  // 3: Blinky (Red Ghost)
  writeTag(tags, 32, buildPolygonShape(3, makeGhostPoints(), [239, 68, 68, 255]));
  // 4: Pinky (Magenta-Pink Ghost)
  writeTag(tags, 32, buildPolygonShape(4, makeGhostPoints(), [244, 114, 182, 255]));
  // 5: Ghost Eyes (white pupils offset inside sprite)
  writeTag(tags, 32, buildRectShape(5, -7, -6, 5, 5, [255, 255, 255, 255]));
  writeTag(tags, 32, buildRectShape(6, 2, -6, 5, 5, [255, 255, 255, 255]));
  // 7: Golden Dot
  writeTag(tags, 32, buildPolygonShape(7, makeOctagon(4), [253, 224, 71, 255]));
  // 8: Glowing Cyan Power Pellet
  writeTag(tags, 32, buildPolygonShape(8, makeOctagon(8), [56, 189, 248, 255]));
  // 9: Maze Horizontal Wall (560x10)
  writeTag(tags, 32, buildRectShape(9, 0, 0, 560, 10, [37, 99, 235, 255]));
  // 10: Maze Vertical Outer Wall Segment (10x130)
  writeTag(tags, 32, buildRectShape(10, 0, 0, 10, 130, [37, 99, 235, 255]));
  // 11: Inner Maze Block (110x44)
  writeTag(tags, 32, buildRectShape(11, 0, 0, 110, 44, [29, 78, 216, 255]));
  // 12: Central Ghost House Wall (140x12)
  writeTag(tags, 32, buildRectShape(12, 0, 0, 140, 12, [96, 165, 250, 255]));
  // 13: Reset Button Plate (86x26)
  writeTag(tags, 32, buildRectShape(13, 0, 0, 86, 26, [30, 64, 175, 255]));

  // Animated 2-Frame Chomping Pac-Man Sprite (ID 20, 6 frames = 3 open / 3 closed)
  const pacInner = new SwfBitWriter();
  writeTag(pacInner, 26, buildPlaceObject2({ depth: 1, characterId: 1 }));
  writeTag(pacInner, 1, new Uint8Array(0));
  writeTag(pacInner, 1, new Uint8Array(0));
  writeTag(pacInner, 1, new Uint8Array(0));
  writeTag(pacInner, 28, buildRemoveObject2(1));
  writeTag(pacInner, 26, buildPlaceObject2({ depth: 1, characterId: 2 }));
  writeTag(pacInner, 1, new Uint8Array(0));
  writeTag(pacInner, 1, new Uint8Array(0));
  writeTag(pacInner, 1, new Uint8Array(0));
  writeTag(pacInner, 0, new Uint8Array(0));
  writeTag(tags, 39, buildSprite(20, 6, pacInner.toUint8Array()));

  // Ghost Sprites (ID 21 Blinky, ID 22 Pinky) with body + eyes
  const makeGhostSprite = (spriteId: number, bodyShapeId: number) => {
    const inner = new SwfBitWriter();
    writeTag(inner, 26, buildPlaceObject2({ depth: 1, characterId: bodyShapeId }));
    writeTag(inner, 26, buildPlaceObject2({ depth: 2, characterId: 5 }));
    writeTag(inner, 26, buildPlaceObject2({ depth: 3, characterId: 6 }));
    writeTag(inner, 1, new Uint8Array(0));
    writeTag(inner, 0, new Uint8Array(0));
    writeTag(tags, 39, buildSprite(spriteId, 1, inner.toUint8Array()));
  };
  makeGhostSprite(21, 3);
  makeGhostSprite(22, 4);

  // Dot Sprite (ID 23) & Power Pellet Sprite (ID 24)
  const makeSimpleSprite = (spriteId: number, shapeId: number) => {
    const inner = new SwfBitWriter();
    writeTag(inner, 26, buildPlaceObject2({ depth: 1, characterId: shapeId }));
    writeTag(inner, 1, new Uint8Array(0));
    writeTag(inner, 0, new Uint8Array(0));
    writeTag(tags, 39, buildSprite(spriteId, 1, inner.toUint8Array()));
  };
  makeSimpleSprite(23, 7);
  makeSimpleSprite(24, 8);

  // ExportAssets: "waka" -> 90, "power" -> 91
  writeTag(tags, 56, buildExportAssets([
    { id: 90, name: 'waka' },
    { id: 91, name: 'power' },
  ]));

  // DefineEditText HUD fields
  // 30: Score & Lives live HUD
  writeTag(tags, 37, buildEditText(30, 18, 10, 310, 28, 'hudText', 'SCORE: 0   LIVES: 3   ARROWS / WASD', [253, 224, 71, 255], 14, 0));
  // 31: Editable Player Tag (interactive DefineEditText!)
  writeTag(tags, 37, buildEditableTextField(31, 345, 10, 130, 24, 'playerName', 'PAC-1', [226, 232, 240, 255], 13, 10));
  // 32: Reset button label
  writeTag(tags, 37, buildEditText(32, 496, 14, 86, 22, 'rstLbl', 'RESTART', [255, 255, 255, 255], 12, 2));

  // DefineButton2 (ID 40): Restart game state
  const resetAct = new Avm1Asm()
    .setRootVar('score', (v) => v.pushInt(0))
    .setRootVar('lives', (v) => v.pushInt(3))
    .setRootVar('fright', (v) => v.pushInt(0))
    .setProp('pac', '_x', (v) => v.pushInt(300))
    .setProp('pac', '_y', (v) => v.pushInt(310))
    .setProp('blinky', '_x', (v) => v.pushInt(260))
    .setProp('blinky', '_y', (v) => v.pushInt(155))
    .setProp('pinky', '_x', (v) => v.pushInt(340))
    .setProp('pinky', '_y', (v) => v.pushInt(155))
    .toByteArray();
  writeTag(tags, 34, buildDefineButton2(40, 13, 496, 10, 0x0008, resetAct));

  // Place Maze Walls (Depths 1..11)
  writeTag(tags, 70, buildPlaceObject3WithGlow({ depth: 1, characterId: 9, txPx: 20, tyPx: 46, glowRgba: [59, 130, 246, 220], blurPx: 6 })); // top border
  writeTag(tags, 70, buildPlaceObject3WithGlow({ depth: 2, characterId: 9, txPx: 20, tyPx: 374, glowRgba: [59, 130, 246, 220], blurPx: 6 })); // bottom border
  writeTag(tags, 26, buildPlaceObject2({ depth: 3, characterId: 10, txPx: 20, tyPx: 56 }));   // left upper
  writeTag(tags, 26, buildPlaceObject2({ depth: 4, characterId: 10, txPx: 20, tyPx: 244 }));  // left lower (tunnel gap at y=186..244)
  writeTag(tags, 26, buildPlaceObject2({ depth: 5, characterId: 10, txPx: 570, tyPx: 56 }));  // right upper
  writeTag(tags, 26, buildPlaceObject2({ depth: 6, characterId: 10, txPx: 570, tyPx: 244 })); // right lower
  // Symmetric inner maze blocks
  writeTag(tags, 26, buildPlaceObject2({ depth: 7, characterId: 11, txPx: 76, tyPx: 92 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 8, characterId: 11, txPx: 414, tyPx: 92 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 9, characterId: 11, txPx: 76, tyPx: 256 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 10, characterId: 11, txPx: 414, tyPx: 256 }));
  // Central Ghost House bar
  writeTag(tags, 26, buildPlaceObject2({ depth: 11, characterId: 12, txPx: 230, tyPx: 210 }));

  // Place Collectible Dots (Depths 20..29) along top/mid/bottom corridors
  const dotCoords: Array<[number, number]> = [
    [120, 72], [220, 72], [300, 72], [380, 72], [480, 72],
    [340, 310], [380, 310], [420, 310], [220, 310], [160, 310],
  ];
  dotCoords.forEach(([x, y], idx) => {
    writeTag(tags, 26, buildPlaceObject2({ depth: 20 + idx, characterId: 23, txPx: x, tyPx: y, name: `dot${idx}` }));
  });

  // Place 2 Glowing Power Pellets (Depths 30..31)
  writeTag(tags, 70, buildPlaceObject3WithGlow({ depth: 30, characterId: 24, txPx: 460, tyPx: 310, name: 'pwr0', glowRgba: [56, 189, 248, 255], blurPx: 10 }));
  writeTag(tags, 70, buildPlaceObject3WithGlow({ depth: 31, characterId: 24, txPx: 60, tyPx: 72, name: 'pwr1', glowRgba: [56, 189, 248, 255], blurPx: 10 }));

  // Place Animated Pac-Man (Depth 40) + Glowing Ghosts (Depths 41, 42)
  writeTag(tags, 70, buildPlaceObject3WithGlow({ depth: 40, characterId: 20, txPx: 300, tyPx: 310, name: 'pac', glowRgba: [250, 204, 21, 200], blurPx: 6 }));
  writeTag(tags, 70, buildPlaceObject3WithGlow({ depth: 41, characterId: 21, txPx: 260, tyPx: 155, name: 'blinky', glowRgba: [239, 68, 68, 210], blurPx: 8 }));
  writeTag(tags, 70, buildPlaceObject3WithGlow({ depth: 42, characterId: 22, txPx: 340, tyPx: 155, name: 'pinky', glowRgba: [244, 114, 182, 210], blurPx: 8 }));

  // Place HUD & Buttons (Depths 50..52)
  writeTag(tags, 26, buildPlaceObject2({ depth: 50, characterId: 30 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 51, characterId: 31, name: 'playerInput' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 52, characterId: 40 }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 53, characterId: 32 }));

  // Frame 1 AVM1 Game Loop Bytecode
  const gameAsm = new Avm1Asm()
    .stop()
    .setRootVar('score', (v) => v.pushInt(0))
    .setRootVar('lives', (v) => v.pushInt(3))
    .setRootVar('fright', (v) => v.pushInt(0))
    .setRootVar('dirX', (v) => v.pushInt(0))
    .setRootVar('dirY', (v) => v.pushInt(0))
    .setRootVar('bvx', (v) => v.pushInt(2))
    .setRootVar('pvx', (v) => v.pushInt(-2))
    // Sound objects attached to exported DefineSound clips
    .setRootVar('sfxWaka', (v) => v.pushInt(0).pushStr('Sound').newObject())
    .callObjMethod('sfxWaka', 'attachSound', [(a) => a.pushStr('waka')]).pop()
    .setRootVar('sfxPower', (v) => v.pushInt(0).pushStr('Sound').newObject())
    .callObjMethod('sfxPower', 'attachSound', [(a) => a.pushStr('power')]).pop()
    // Color objects for live Ghost RGB frightened tinting
    .setRootVar('colBlinky', (v) => v.getRootVar('blinky').pushInt(1).pushStr('Color').newObject())
    .setRootVar('colPinky', (v) => v.getRootVar('pinky').pushInt(1).pushStr('Color').newObject())
    .pushStr('pacman_ready').trace()
    .setRootVar('onEnterFrame', (b) => {
      b.defineFunction('', [], (fn) => {
        // 1. Arrow / WASD Keyboard Steering (Key.isDown)
        // Right (39) or D (68)
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(39)])
          .callObjMethod('Key', 'isDown', [(a) => a.pushInt(68)])
          .or()
          .ifFalseSkip((s) => {
            s.setRootVar('dirX', (v) => v.pushInt(4));
            s.setRootVar('dirY', (v) => v.pushInt(0));
            s.setProp('pac', '_rotation', (v) => v.pushInt(0));
          });
        // Left (37) or A (65)
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(37)])
          .callObjMethod('Key', 'isDown', [(a) => a.pushInt(65)])
          .or()
          .ifFalseSkip((s) => {
            s.setRootVar('dirX', (v) => v.pushInt(-4));
            s.setRootVar('dirY', (v) => v.pushInt(0));
            s.setProp('pac', '_rotation', (v) => v.pushInt(180));
          });
        // Up (38) or W (87)
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(38)])
          .callObjMethod('Key', 'isDown', [(a) => a.pushInt(87)])
          .or()
          .ifFalseSkip((s) => {
            s.setRootVar('dirX', (v) => v.pushInt(0));
            s.setRootVar('dirY', (v) => v.pushInt(-4));
            s.setProp('pac', '_rotation', (v) => v.pushInt(-90));
          });
        // Down (40) or S (83)
        fn.callObjMethod('Key', 'isDown', [(a) => a.pushInt(40)])
          .callObjMethod('Key', 'isDown', [(a) => a.pushInt(83)])
          .or()
          .ifFalseSkip((s) => {
            s.setRootVar('dirX', (v) => v.pushInt(0));
            s.setRootVar('dirY', (v) => v.pushInt(4));
            s.setProp('pac', '_rotation', (v) => v.pushInt(90));
          });

        // 2. Move Pac-Man & clamp/warp within arcade arena
        fn.setProp('pac', '_x', (v) => v.getProp('pac', '_x').getRootVar('dirX').add2());
        fn.setProp('pac', '_y', (v) => v.getProp('pac', '_y').getRootVar('dirY').add2());
        fn.getProp('pac', '_x').pushInt(36).less2().ifFalseSkip((s) => {
          s.setProp('pac', '_x', (v) => v.pushInt(562));
        });
        fn.getProp('pac', '_x').pushInt(564).greater().ifFalseSkip((s) => {
          s.setProp('pac', '_x', (v) => v.pushInt(38));
        });
        fn.getProp('pac', '_y').pushInt(70).less2().ifFalseSkip((s) => {
          s.setProp('pac', '_y', (v) => v.pushInt(70));
        });
        fn.getProp('pac', '_y').pushInt(356).greater().ifFalseSkip((s) => {
          s.setProp('pac', '_y', (v) => v.pushInt(356));
        });

        // 3. Dot Eating Checks (dot0..dot9)
        for (let i = 0; i < dotCoords.length; i++) {
          const dName = `dot${i}`;
          fn.getProp(dName, '_visible').ifFalseSkip((s) => {
            s.callObjMethod('Math', 'abs', [(a) => a.getProp('pac', '_x').getProp(dName, '_x').sub()])
              .pushInt(18).less2()
              .callObjMethod('Math', 'abs', [(a) => a.getProp('pac', '_y').getProp(dName, '_y').sub()])
              .pushInt(18).less2()
              .and()
              .ifFalseSkip((hit) => {
                hit.setProp(dName, '_visible', (v) => v.pushBool(false));
                hit.setRootVar('score', (v) => v.getRootVar('score').pushInt(10).add2());
                hit.callObjMethod('sfxWaka', 'start', []).pop();
                hit.pushStr(`ate_${dName}`).trace();
              });
          });
        }

        // 4. Power Pellet Eating Checks (pwr0, pwr1 -> triggers frightened-blue Color.setRGB!)
        for (const pName of ['pwr0', 'pwr1']) {
          fn.getProp(pName, '_visible').ifFalseSkip((s) => {
            s.callObjMethod('Math', 'abs', [(a) => a.getProp('pac', '_x').getProp(pName, '_x').sub()])
              .pushInt(20).less2()
              .callObjMethod('Math', 'abs', [(a) => a.getProp('pac', '_y').getProp(pName, '_y').sub()])
              .pushInt(20).less2()
              .and()
              .ifFalseSkip((hit) => {
                hit.setProp(pName, '_visible', (v) => v.pushBool(false));
                hit.setRootVar('score', (v) => v.getRootVar('score').pushInt(50).add2());
                hit.setRootVar('fright', (v) => v.pushInt(150));
                hit.callObjMethod('sfxPower', 'start', []).pop();
                hit.callObjMethod('colBlinky', 'setRGB', [(a) => a.pushInt(0x2563eb)]).pop();
                hit.callObjMethod('colPinky', 'setRGB', [(a) => a.pushInt(0x2563eb)]).pop();
                hit.pushStr(`power_${pName}`).trace();
              });
          });
        }

        // 5. Frightened Countdown
        fn.getRootVar('fright').pushInt(0).greater().ifFalseSkip((s) => {
          s.setRootVar('fright', (v) => v.getRootVar('fright').pushInt(1).sub());
        });

        // 6. Ghost Patrol AI (Blinky & Pinky bounce horizontally across corridor)
        fn.setProp('blinky', '_x', (v) => v.getProp('blinky', '_x').getRootVar('bvx').add2());
        fn.getProp('blinky', '_x').pushInt(530).greater().ifFalseSkip((s) => {
          s.setRootVar('bvx', (v) => v.pushInt(-2));
        });
        fn.getProp('blinky', '_x').pushInt(70).less2().ifFalseSkip((s) => {
          s.setRootVar('bvx', (v) => v.pushInt(2));
        });

        fn.setProp('pinky', '_x', (v) => v.getProp('pinky', '_x').getRootVar('pvx').add2());
        fn.getProp('pinky', '_x').pushInt(530).greater().ifFalseSkip((s) => {
          s.setRootVar('pvx', (v) => v.pushInt(-2));
        });
        fn.getProp('pinky', '_x').pushInt(70).less2().ifFalseSkip((s) => {
          s.setRootVar('pvx', (v) => v.pushInt(2));
        });

        // 7. Update Live Score & Lives HUD
        fn.setRootVar('hudText', (v) =>
          v.pushStr('SCORE: ')
            .getRootVar('score').add2()
            .pushStr('   LIVES: ').add2()
            .getRootVar('lives').add2()
        );
      });
    })
    .toByteArray();

  writeTag(tags, 12, gameAsm);
  writeTag(tags, 1, new Uint8Array(0));
  writeTag(tags, 0, new Uint8Array(0));

  return assembleFwsSwf(600, 400, 30, 1, tags.toUint8Array());
}

