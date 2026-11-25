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

function assembleFwsSwf(width: number, height: number, fps: number, frameCount: number, tags: Uint8Array, version = 8): Uint8Array {
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
  out[3] = version & 0xff;
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

// ============================================================================
// Spec-Valid AVM2 / ABC (v46.16) Binary Assembler & SWF v10 AS3 Sample Builder
// ============================================================================

function writeAbcU30(out: number[], value: number): void {
  let v = value >>> 0;
  do {
    let b = v & 0x7f;
    v >>>= 7;
    if (v !== 0) b |= 0x80;
    out.push(b);
  } while (v !== 0);
}

function writeAbcS32(out: number[], value: number): void {
  let v = value | 0;
  for (let i = 0; i < 5; i++) {
    let b = v & 0x7f;
    const more = !((v >= -64 && v < 64) && ((b & 0x40) === 0 ? v >= 0 : v < 0));
    if (more) b |= 0x80;
    out.push(b);
    if (!more) break;
    v >>= 7;
  }
}

export class AbcCodeBuilder {
  public bytes: number[] = [];
  private labels = new Map<string, number>();
  private fixups: Array<{ pos: number; target: string; baseOffset: number }> = [];

  op(code: number): this {
    this.bytes.push(code & 0xff);
    return this;
  }
  u8(v: number): this {
    this.bytes.push(v & 0xff);
    return this;
  }
  u30(v: number): this {
    writeAbcU30(this.bytes, v);
    return this;
  }
  label(name: string): this {
    this.labels.set(name, this.bytes.length);
    return this;
  }
  branch(opCode: number, labelName: string): this {
    this.op(opCode);
    const pos = this.bytes.length;
    this.bytes.push(0, 0, 0);
    this.fixups.push({ pos, target: labelName, baseOffset: this.bytes.length });
    return this;
  }
  finish(): Uint8Array {
    for (const f of this.fixups) {
      const targetPos = this.labels.get(f.target);
      if (targetPos === undefined) throw new Error(`Unknown ABC label: ${f.target}`);
      const delta = targetPos - f.baseOffset;
      this.bytes[f.pos] = delta & 0xff;
      this.bytes[f.pos + 1] = (delta >> 8) & 0xff;
      this.bytes[f.pos + 2] = (delta >> 16) & 0xff;
    }
    return new Uint8Array(this.bytes);
  }
}

interface AbcTraitDef {
  nameIdx: number;
  kind: number; // 0=Slot, 1=Method, 4=Class
  slotId?: number;
  typeIdx?: number;
  methodIdx?: number;
  classIdx?: number;
}

export class AbcBuilder {
  private ints: number[] = [0];
  private uints: number[] = [0];
  private doubles: number[] = [NaN];
  private strings: string[] = [''];
  private stringMap = new Map<string, number>();
  private namespaces: Array<{ kind: number; nameIdx: number }> = [{ kind: 0, nameIdx: 0 }];
  private nsMap = new Map<string, number>();
  private multinames: Array<{ kind: number; nsIdx: number; nameIdx: number }> = [{ kind: 0, nsIdx: 0, nameIdx: 0 }];
  private qnameMap = new Map<string, number>();

  private methods: Array<{ paramCount: number; returnType: number; paramTypes: number[]; nameIdx: number; flags: number }> = [];
  private bodies: Array<{ methodIdx: number; maxStack: number; localCount: number; initScope: number; maxScope: number; code: Uint8Array }> = [];
  private instances: Array<{ nameIdx: number; superIdx: number; iinit: number; traits: AbcTraitDef[] }> = [];
  private classes: Array<{ cinit: number; traits: AbcTraitDef[] }> = [];
  private scripts: Array<{ init: number; traits: AbcTraitDef[] }> = [];

  addInt(v: number): number {
    const idx = this.ints.indexOf(v | 0, 1);
    if (idx > 0) return idx;
    this.ints.push(v | 0);
    return this.ints.length - 1;
  }

  addDouble(v: number): number {
    this.doubles.push(v);
    return this.doubles.length - 1;
  }

  addString(s: string): number {
    const hit = this.stringMap.get(s);
    if (hit !== undefined) return hit;
    const idx = this.strings.length;
    this.strings.push(s);
    this.stringMap.set(s, idx);
    return idx;
  }

  addNamespace(ns: string, kind = 0x16): number {
    const key = `${kind}:${ns}`;
    const hit = this.nsMap.get(key);
    if (hit !== undefined) return hit;
    const nameIdx = this.addString(ns);
    const idx = this.namespaces.length;
    this.namespaces.push({ kind, nameIdx });
    this.nsMap.set(key, idx);
    return idx;
  }

  addQName(ns: string, name: string): number {
    const key = `${ns}::${name}`;
    const hit = this.qnameMap.get(key);
    if (hit !== undefined) return hit;
    const nsIdx = this.addNamespace(ns, 0x16);
    const nameIdx = this.addString(name);
    const idx = this.multinames.length;
    this.multinames.push({ kind: 0x07, nsIdx, nameIdx });
    this.qnameMap.set(key, idx);
    return idx;
  }

  addMethod(opts: {
    name?: string;
    paramCount?: number;
    returnType?: number;
    maxStack?: number;
    localCount?: number;
    build: (c: AbcCodeBuilder) => void;
  }): number {
    const paramCount = opts.paramCount || 0;
    const idx = this.methods.length;
    this.methods.push({
      paramCount,
      returnType: opts.returnType || 0,
      paramTypes: new Array(paramCount).fill(0),
      nameIdx: opts.name ? this.addString(opts.name) : 0,
      flags: 0,
    });
    const cb = new AbcCodeBuilder();
    opts.build(cb);
    this.bodies.push({
      methodIdx: idx,
      maxStack: opts.maxStack || 8,
      localCount: Math.max(paramCount + 1, opts.localCount || paramCount + 4),
      initScope: 0,
      maxScope: 4,
      code: cb.finish(),
    });
    return idx;
  }

  addClass(opts: {
    ns: string;
    name: string;
    superNs: string;
    superName: string;
    iinit: number;
    cinit?: number;
    slots?: Array<{ name: string; typeNs?: string; typeName?: string }>;
    methods?: Array<{ name: string; methodIdx: number }>;
  }): number {
    const nameIdx = this.addQName(opts.ns, opts.name);
    const superIdx = this.addQName(opts.superNs, opts.superName);
    const traits: AbcTraitDef[] = [];
    let slotId = 1;
    for (const s of opts.slots || []) {
      traits.push({
        nameIdx: this.addQName('', s.name),
        kind: 0,
        slotId: slotId++,
        typeIdx: s.typeName ? this.addQName(s.typeNs || '', s.typeName) : 0,
      });
    }
    for (const m of opts.methods || []) {
      traits.push({
        nameIdx: this.addQName('', m.name),
        kind: 1,
        methodIdx: m.methodIdx,
      });
    }
    const cinit =
      opts.cinit !== undefined
        ? opts.cinit
        : this.addMethod({
            name: `${opts.name}_cinit`,
            build: (c) => {
              c.op(0xd0).op(0x30).op(0x47); // getlocal_0; pushscope; returnvoid
            },
          });
    const classIdx = this.instances.length;
    this.instances.push({ nameIdx, superIdx, iinit: opts.iinit, traits });
    this.classes.push({ cinit, traits: [] });
    return classIdx;
  }

  addScript(initMethodIdx: number, classIndices: number[]): void {
    const traits: AbcTraitDef[] = classIndices.map((ci, idx) => ({
      nameIdx: this.instances[ci].nameIdx,
      kind: 4,
      slotId: idx + 1,
      classIdx: ci,
    }));
    this.scripts.push({ init: initMethodIdx, traits });
  }

  private writeTraits(out: number[], traits: AbcTraitDef[]): void {
    writeAbcU30(out, traits.length);
    for (const t of traits) {
      writeAbcU30(out, t.nameIdx);
      out.push(t.kind & 0x0f);
      if (t.kind === 0 || t.kind === 6) {
        writeAbcU30(out, t.slotId || 0);
        writeAbcU30(out, t.typeIdx || 0);
        writeAbcU30(out, 0); // vindex=0
      } else if (t.kind === 1 || t.kind === 2 || t.kind === 3) {
        writeAbcU30(out, 0); // disp_id
        writeAbcU30(out, t.methodIdx || 0);
      } else if (t.kind === 4) {
        writeAbcU30(out, t.slotId || 0);
        writeAbcU30(out, t.classIdx || 0);
      }
    }
  }

  toUint8Array(): Uint8Array {
    const out: number[] = [];
    // ABC v46.16 header (minor=16, major=46)
    out.push(16, 0, 46, 0);

    // ints
    writeAbcU30(out, this.ints.length > 1 ? this.ints.length : 0);
    for (let i = 1; i < this.ints.length; i++) writeAbcS32(out, this.ints[i]);
    // uints
    writeAbcU30(out, this.uints.length > 1 ? this.uints.length : 0);
    for (let i = 1; i < this.uints.length; i++) writeAbcU30(out, this.uints[i]);
    // doubles
    writeAbcU30(out, this.doubles.length > 1 ? this.doubles.length : 0);
    if (this.doubles.length > 1) {
      const f64 = new ArrayBuffer(8);
      const dv = new DataView(f64);
      const u8 = new Uint8Array(f64);
      for (let i = 1; i < this.doubles.length; i++) {
        dv.setFloat64(0, this.doubles[i], true);
        for (let b = 0; b < 8; b++) out.push(u8[b]);
      }
    }
    // strings
    writeAbcU30(out, this.strings.length);
    const enc = new TextEncoder();
    for (let i = 1; i < this.strings.length; i++) {
      const sb = enc.encode(this.strings[i]);
      writeAbcU30(out, sb.length);
      for (let b = 0; b < sb.length; b++) out.push(sb[b]);
    }
    // namespaces
    writeAbcU30(out, this.namespaces.length);
    for (let i = 1; i < this.namespaces.length; i++) {
      out.push(this.namespaces[i].kind & 0xff);
      writeAbcU30(out, this.namespaces[i].nameIdx);
    }
    // ns_sets (empty)
    writeAbcU30(out, 0);
    // multinames
    writeAbcU30(out, this.multinames.length);
    for (let i = 1; i < this.multinames.length; i++) {
      const mn = this.multinames[i];
      out.push(mn.kind & 0xff);
      writeAbcU30(out, mn.nsIdx);
      writeAbcU30(out, mn.nameIdx);
    }

    // method_info
    writeAbcU30(out, this.methods.length);
    for (const m of this.methods) {
      writeAbcU30(out, m.paramCount);
      writeAbcU30(out, m.returnType);
      for (const pt of m.paramTypes) writeAbcU30(out, pt);
      writeAbcU30(out, m.nameIdx);
      out.push(m.flags & 0xff);
    }

    // metadata_info (0)
    writeAbcU30(out, 0);

    // instance_info
    writeAbcU30(out, this.instances.length);
    for (const inst of this.instances) {
      writeAbcU30(out, inst.nameIdx);
      writeAbcU30(out, inst.superIdx);
      out.push(0x01); // flags: Sealed
      writeAbcU30(out, 0); // interface_count
      writeAbcU30(out, inst.iinit);
      this.writeTraits(out, inst.traits);
    }

    // class_info
    for (const cls of this.classes) {
      writeAbcU30(out, cls.cinit);
      this.writeTraits(out, cls.traits);
    }

    // script_info
    writeAbcU30(out, this.scripts.length);
    for (const sc of this.scripts) {
      writeAbcU30(out, sc.init);
      this.writeTraits(out, sc.traits);
    }

    // method_body_info
    writeAbcU30(out, this.bodies.length);
    for (const b of this.bodies) {
      writeAbcU30(out, b.methodIdx);
      writeAbcU30(out, b.maxStack);
      writeAbcU30(out, b.localCount);
      writeAbcU30(out, b.initScope);
      writeAbcU30(out, b.maxScope);
      writeAbcU30(out, b.code.length);
      for (let i = 0; i < b.code.length; i++) out.push(b.code[i]);
      writeAbcU30(out, 0); // exception_count
      writeAbcU30(out, 0); // trait_count
    }

    return new Uint8Array(out);
  }
}

export function buildDoAbc2Tag(name: string, abcBytes: Uint8Array, flags = 1): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI32(flags);
  w.writeCString(name);
  w.writeBytes(abcBytes);
  return w.toUint8Array();
}

export function buildSymbolClassTag(entries: Array<{ id: number; name: string }>): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI16(entries.length);
  for (const e of entries) {
    w.writeUI16(e.id);
    w.writeCString(e.name);
  }
  return w.toUint8Array();
}

export function buildFileAttributesTag(isAs3: boolean): Uint8Array {
  const w = new SwfBitWriter();
  w.writeUI32(isAs3 ? 0x08 : 0x00);
  return w.toUint8Array();
}

/**
 * Builds a live playable binary SWF v10 ActionScript 3 (AVM2 / DoABC2) Interactive Lab:
 * - FileAttributes (AS3 bit), DefineShape3 vector arena + glowing orb + pulse button,
 *   DefineEditText live HUD + editable student label, DefineSound PCM chime,
 *   SymbolClass (Document Class "As3PhysicsLab" + Sound subclass "ChimeSound"),
 *   and real DoABC2 bytecode driving:
 *     * Event.ENTER_FRAME orbital kinematics & Graphics API dynamic vector trail
 *     * KeyboardEvent.KEY_DOWN arrow/space steering via Universal Gesture Bus
 *     * MouseEvent.CLICK pulse button -> ColorTransform tint + ChimeSound.play() + HUD update
 *     * flash.utils.Timer periodic pulse counter
 */
export function buildFlashAs3LabSampleSwf(): Uint8Array {
  const tags = new SwfBitWriter();

  // Tag 69: FileAttributes (ActionScript3 = 1)
  writeTag(tags, 69, buildFileAttributesTag(true));
  // Tag 9: SetBackgroundColor (#071022)
  writeTag(tags, 9, new Uint8Array([7, 16, 34]));

  // Shapes
  // 1: Arena border frame (580x260 dark slate)
  writeTag(tags, 32, buildRectShape(1, 0, 0, 580, 260, [15, 23, 42, 255]));
  // 2: Kinetic Orb (28x28 cyan diamond polygon)
  writeTag(tags, 32, buildPolygonShape(2, [
    [0, -18], [18, 0], [0, 18], [-18, 0],
  ], [56, 189, 248, 255]));
  // 3: Pulse Button plate (140x38 amber)
  writeTag(tags, 32, buildRectShape(3, 0, 0, 140, 38, [245, 158, 11, 255]));

  // EditText fields
  // 10: Live HUD
  writeTag(tags, 37, buildEditText(10, 24, 14, 580, 30, '', 'AS3 AVM2 LAB · PULSES: 0 · TICKS: 0', [248, 250, 252, 255], 16, 0));
  // 11: Editable student tag
  writeTag(tags, 37, buildEditableTextField(11, 24, 344, 180, 32, '', 'LAB-01', [125, 211, 252, 255], 15, 14));
  // 12: Button label
  writeTag(tags, 37, buildEditText(12, 468, 350, 140, 26, '', 'PULSE +1', [15, 23, 42, 255], 15, 2));

  // DefineSound 20: PCM chime (520 -> 880 Hz, 85ms)
  writeTag(tags, 14, buildDefinePcmSound(20, 520, 880, 85));

  // Assemble genuine ABC v46.16 bytecode
  const abc = new AbcBuilder();
  const qTrace = abc.addQName('', 'trace');
  const qSprite = abc.addQName('flash.display', 'Sprite');
  const qEvent = abc.addQName('flash.events', 'Event');
  const qMouseEvent = abc.addQName('flash.events', 'MouseEvent');
  const qKeyboardEvent = abc.addQName('flash.events', 'KeyboardEvent');
  const qTimerEvent = abc.addQName('flash.events', 'TimerEvent');
  const qTimer = abc.addQName('flash.utils', 'Timer');
  const qColorTransform = abc.addQName('flash.geom', 'ColorTransform');
  const qChime = abc.addQName('', 'ChimeSound');

  const qAddEventListener = abc.addQName('', 'addEventListener');
  const qAddChild = abc.addQName('', 'addChild');
  const qStart = abc.addQName('', 'start');
  const qPlay = abc.addQName('', 'play');
  const qStage = abc.addQName('', 'stage');
  const qGraphics = abc.addQName('', 'graphics');
  const qClear = abc.addQName('', 'clear');
  const qLineStyle = abc.addQName('', 'lineStyle');
  const qMoveTo = abc.addQName('', 'moveTo');
  const qLineTo = abc.addQName('', 'lineTo');
  const qDrawCircle = abc.addQName('', 'drawCircle');
  const qTransform = abc.addQName('', 'transform');
  const qColorTransformProp = abc.addQName('', 'colorTransform');

  const qEnterFrame = abc.addQName('', 'ENTER_FRAME');
  const qAddedToStage = abc.addQName('', 'ADDED_TO_STAGE');
  const qClick = abc.addQName('', 'CLICK');
  const qKeyDown = abc.addQName('', 'KEY_DOWN');
  const qTimerEv = abc.addQName('', 'TIMER');

  const qVx = abc.addQName('', 'vx');
  const qVy = abc.addQName('', 'vy');
  const qPulses = abc.addQName('', 'pulses');
  const qTicks = abc.addQName('', 'ticks');
  const qTimerCount = abc.addQName('', 'timerCount');
  const qChimeProp = abc.addQName('', 'chime');
  const qTrailProp = abc.addQName('', 'trail');
  const qTmrProp = abc.addQName('', 'tmr');
  const qOrb = abc.addQName('', 'orb');
  const qPulseBtn = abc.addQName('', 'pulseBtn');
  const qPulseLbl = abc.addQName('', 'pulseLbl');
  const qMouseEnabled = abc.addQName('', 'mouseEnabled');
  const qHud = abc.addQName('', 'hud');
  const qX = abc.addQName('', 'x');
  const qY = abc.addQName('', 'y');
  const qText = abc.addQName('', 'text');
  const qKeyCode = abc.addQName('', 'keyCode');

  const qOnFrame = abc.addQName('', 'onFrame');
  const qOnAdded = abc.addQName('', 'onAdded');
  const qOnKey = abc.addQName('', 'onKey');
  const qOnPulseClick = abc.addQName('', 'onPulseClick');
  const qOnTimer = abc.addQName('', 'onTimer');

  const sReady = abc.addString('as3_lab_ready');
  const sPulse = abc.addString('as3_pulse');
  const sTimer = abc.addString('as3_timer');
  const sHudPrefix = abc.addString('AS3 AVM2 LAB · PULSES: ');
  const sHudMid = abc.addString(' · TICKS: ');
  const iColorCyan = abc.addInt(0x38bdf8);
  const iTimerMs = abc.addInt(250);
  const i320 = abc.addInt(320);
  const i200 = abc.addInt(200);
  const i590 = abc.addInt(590);
  const i300 = abc.addInt(300);
  const d09 = abc.addDouble(0.9);
  const d12 = abc.addDouble(1.2);
  const d07 = abc.addDouble(0.7);

  // ChimeSound constructor
  const chimeInit = abc.addMethod({
    name: 'ChimeSound',
    build: (c) => {
      c.op(0xd0).op(0x30); // getlocal_0; pushscope
      c.op(0xd0).op(0x49).u30(0); // constructsuper 0
      c.op(0x47);
    },
  });
  const chimeClsIdx = abc.addClass({
    ns: '',
    name: 'ChimeSound',
    superNs: 'flash.media',
    superName: 'Sound',
    iinit: chimeInit,
  });

  // onFrame(e): step orb + bounce + Graphics trail + HUD text
  const mOnFrame = abc.addMethod({
    name: 'onFrame',
    paramCount: 1,
    maxStack: 12,
    build: (c) => {
      c.op(0xd0).op(0x30); // getlocal_0; pushscope
      // ticks = ticks + 1
      c.op(0xd0).op(0xd0).op(0x66).u30(qTicks).op(0x24).u8(1).op(0xa0).op(0x61).u30(qTicks);
      // orb.x += vx
      c.op(0xd0).op(0x66).u30(qOrb).op(0x2a).op(0x66).u30(qX).op(0xd0).op(0x66).u30(qVx).op(0xa0).op(0x61).u30(qX);
      // orb.y += vy
      c.op(0xd0).op(0x66).u30(qOrb).op(0x2a).op(0x66).u30(qY).op(0xd0).op(0x66).u30(qVy).op(0xa0).op(0x61).u30(qY);

      // if (orb.x > 590) vx = -vx
      c.op(0xd0).op(0x66).u30(qOrb).op(0x66).u30(qX).op(0x2d).u30(i590).branch(0x16, 'skipRight');
      c.op(0xd0).op(0xd0).op(0x66).u30(qVx).op(0x90).op(0x61).u30(qVx);
      c.label('skipRight');

      // if (orb.x < 50) vx = -vx
      c.op(0xd0).op(0x66).u30(qOrb).op(0x66).u30(qX).op(0x24).u8(50).branch(0x18, 'skipLeft');
      c.op(0xd0).op(0xd0).op(0x66).u30(qVx).op(0x90).op(0x61).u30(qVx);
      c.label('skipLeft');

      // if (orb.y > 300) vy = -vy
      c.op(0xd0).op(0x66).u30(qOrb).op(0x66).u30(qY).op(0x2d).u30(i300).branch(0x16, 'skipBot');
      c.op(0xd0).op(0xd0).op(0x66).u30(qVy).op(0x90).op(0x61).u30(qVy);
      c.label('skipBot');

      // if (orb.y < 72) vy = -vy
      c.op(0xd0).op(0x66).u30(qOrb).op(0x66).u30(qY).op(0x24).u8(72).branch(0x18, 'skipTop');
      c.op(0xd0).op(0xd0).op(0x66).u30(qVy).op(0x90).op(0x61).u30(qVy);
      c.label('skipTop');

      // trail.graphics.clear(); lineStyle(2, 0x38bdf8, 0.9); drawCircle(320, 200, 65); moveTo(320, 200); lineTo(orb.x, orb.y)
      c.op(0xd0).op(0x66).u30(qTrailProp).op(0x66).u30(qGraphics).op(0x4f).u30(qClear).u30(0);
      c.op(0xd0).op(0x66).u30(qTrailProp).op(0x66).u30(qGraphics).op(0x24).u8(2).op(0x2d).u30(iColorCyan).op(0x2f).u30(d09).op(0x4f).u30(qLineStyle).u30(3);
      c.op(0xd0).op(0x66).u30(qTrailProp).op(0x66).u30(qGraphics).op(0x2d).u30(i320).op(0x2d).u30(i200).op(0x24).u8(65).op(0x4f).u30(qDrawCircle).u30(3);
      c.op(0xd0).op(0x66).u30(qTrailProp).op(0x66).u30(qGraphics).op(0x2d).u30(i320).op(0x2d).u30(i200).op(0x4f).u30(qMoveTo).u30(2);
      c.op(0xd0).op(0x66).u30(qTrailProp).op(0x66).u30(qGraphics).op(0xd0).op(0x66).u30(qOrb).op(0x66).u30(qX).op(0xd0).op(0x66).u30(qOrb).op(0x66).u30(qY).op(0x4f).u30(qLineTo).u30(2);

      // hud.text = "AS3 AVM2 LAB · PULSES: " + pulses + " · TICKS: " + ticks
      c.op(0xd0).op(0x66).u30(qHud);
      c.op(0x2c).u30(sHudPrefix).op(0xd0).op(0x66).u30(qPulses).op(0xa0);
      c.op(0x2c).u30(sHudMid).op(0xa0).op(0xd0).op(0x66).u30(qTicks).op(0xa0);
      c.op(0x61).u30(qText);
      c.op(0x47);
    },
  });

  // onPulseClick(e): pulses += 1; orb.transform.colorTransform = new ColorTransform(1.2, 0.7, 1.2, 1, 30, 0, 20, 0); chime.play(); trace("as3_pulse")
  const mOnPulseClick = abc.addMethod({
    name: 'onPulseClick',
    paramCount: 1,
    maxStack: 12,
    build: (c) => {
      c.op(0xd0).op(0x30);
      c.op(0xd0).op(0xd0).op(0x66).u30(qPulses).op(0x24).u8(1).op(0xa0).op(0x61).u30(qPulses);
      c.op(0xd0).op(0x66).u30(qOrb).op(0x66).u30(qTransform);
      c.op(0x5d).u30(qColorTransform).op(0x2f).u30(d12).op(0x2f).u30(d07).op(0x2f).u30(d12).op(0x24).u8(1).op(0x24).u8(30).op(0x24).u8(0).op(0x24).u8(20).op(0x24).u8(0).op(0x4a).u30(qColorTransform).u30(8);
      c.op(0x61).u30(qColorTransformProp);
      c.op(0xd0).op(0x66).u30(qChimeProp).op(0x4f).u30(qPlay).u30(0);
      c.op(0x5d).u30(qTrace).op(0x2c).u30(sPulse).op(0x4f).u30(qTrace).u30(1);
      c.op(0x47);
    },
  });

  // onKey(e): steer vx / vy with Arrow keys, Space triggers pulse
  const mOnKey = abc.addMethod({
    name: 'onKey',
    paramCount: 1,
    maxStack: 8,
    build: (c) => {
      c.op(0xd0).op(0x30);
      // Left (37)
      c.op(0xd1).op(0x66).u30(qKeyCode).op(0x24).u8(37).branch(0x14, 'kRight');
      c.op(0xd0).op(0x24).u8(-5 & 0xff).op(0x61).u30(qVx);
      c.label('kRight');
      // Right (39)
      c.op(0xd1).op(0x66).u30(qKeyCode).op(0x24).u8(39).branch(0x14, 'kUp');
      c.op(0xd0).op(0x24).u8(5).op(0x61).u30(qVx);
      c.label('kUp');
      // Up (38)
      c.op(0xd1).op(0x66).u30(qKeyCode).op(0x24).u8(38).branch(0x14, 'kDown');
      c.op(0xd0).op(0x24).u8(-5 & 0xff).op(0x61).u30(qVy);
      c.label('kDown');
      // Down (40)
      c.op(0xd1).op(0x66).u30(qKeyCode).op(0x24).u8(40).branch(0x14, 'kSpace');
      c.op(0xd0).op(0x24).u8(5).op(0x61).u30(qVy);
      c.label('kSpace');
      // Space (32)
      c.op(0xd1).op(0x66).u30(qKeyCode).op(0x24).u8(32).branch(0x14, 'kDone');
      c.op(0xd0).op(0x20).op(0x4f).u30(qOnPulseClick).u30(1);
      c.label('kDone');
      c.op(0x47);
    },
  });

  // onAdded(e): stage.addEventListener(KeyboardEvent.KEY_DOWN, onKey)
  const mOnAdded = abc.addMethod({
    name: 'onAdded',
    paramCount: 1,
    build: (c) => {
      c.op(0xd0).op(0x30);
      c.op(0xd0).op(0x66).u30(qStage).op(0x60).u30(qKeyboardEvent).op(0x66).u30(qKeyDown).op(0xd0).op(0x66).u30(qOnKey).op(0x4f).u30(qAddEventListener).u30(2);
      c.op(0x47);
    },
  });

  // onTimer(e): timerCount += 1; trace("as3_timer")
  const mOnTimer = abc.addMethod({
    name: 'onTimer',
    paramCount: 1,
    build: (c) => {
      c.op(0xd0).op(0x30);
      c.op(0xd0).op(0xd0).op(0x66).u30(qTimerCount).op(0x24).u8(1).op(0xa0).op(0x61).u30(qTimerCount);
      c.op(0x5d).u30(qTrace).op(0x2c).u30(sTimer).op(0x4f).u30(qTrace).u30(1);
      c.op(0x47);
    },
  });

  // As3PhysicsLab constructor
  const labInit = abc.addMethod({
    name: 'As3PhysicsLab',
    maxStack: 10,
    build: (c) => {
      c.op(0xd0).op(0x30);
      c.op(0xd0).op(0x49).u30(0); // constructsuper 0
      // vx = 3; vy = 2; pulses = 0; ticks = 0; timerCount = 0
      c.op(0xd0).op(0x24).u8(3).op(0x61).u30(qVx);
      c.op(0xd0).op(0x24).u8(2).op(0x61).u30(qVy);
      c.op(0xd0).op(0x24).u8(0).op(0x61).u30(qPulses);
      c.op(0xd0).op(0x24).u8(0).op(0x61).u30(qTicks);
      c.op(0xd0).op(0x24).u8(0).op(0x61).u30(qTimerCount);
      // trail = new Sprite(); addChild(trail)
      c.op(0xd0).op(0x5d).u30(qSprite).op(0x4a).u30(qSprite).u30(0).op(0x61).u30(qTrailProp);
      c.op(0xd0).op(0xd0).op(0x66).u30(qTrailProp).op(0x4f).u30(qAddChild).u30(1);
      // chime = new ChimeSound()
      c.op(0xd0).op(0x5d).u30(qChime).op(0x4a).u30(qChime).u30(0).op(0x61).u30(qChimeProp);
      // tmr = new Timer(250, 0); tmr.addEventListener(TimerEvent.TIMER, onTimer); tmr.start()
      c.op(0xd0).op(0x5d).u30(qTimer).op(0x2d).u30(iTimerMs).op(0x24).u8(0).op(0x4a).u30(qTimer).u30(2).op(0x61).u30(qTmrProp);
      c.op(0xd0).op(0x66).u30(qTmrProp).op(0x60).u30(qTimerEvent).op(0x66).u30(qTimerEv).op(0xd0).op(0x66).u30(qOnTimer).op(0x4f).u30(qAddEventListener).u30(2);
      c.op(0xd0).op(0x66).u30(qTmrProp).op(0x4f).u30(qStart).u30(0);
      // addEventListener(Event.ENTER_FRAME, onFrame)
      c.op(0xd0).op(0x60).u30(qEvent).op(0x66).u30(qEnterFrame).op(0xd0).op(0x66).u30(qOnFrame).op(0x4f).u30(qAddEventListener).u30(2);
      // addEventListener(Event.ADDED_TO_STAGE, onAdded)
      c.op(0xd0).op(0x60).u30(qEvent).op(0x66).u30(qAddedToStage).op(0xd0).op(0x66).u30(qOnAdded).op(0x4f).u30(qAddEventListener).u30(2);
      // pulseLbl.mouseEnabled = false; pulseBtn.addEventListener(MouseEvent.CLICK, onPulseClick)
      c.op(0xd0).op(0x66).u30(qPulseLbl).op(0x27).op(0x61).u30(qMouseEnabled);
      c.op(0xd0).op(0x66).u30(qPulseBtn).op(0x60).u30(qMouseEvent).op(0x66).u30(qClick).op(0xd0).op(0x66).u30(qOnPulseClick).op(0x4f).u30(qAddEventListener).u30(2);
      // trace("as3_lab_ready")
      c.op(0x5d).u30(qTrace).op(0x2c).u30(sReady).op(0x4f).u30(qTrace).u30(1);
      c.op(0x47);
    },
  });

  const labClsIdx = abc.addClass({
    ns: '',
    name: 'As3PhysicsLab',
    superNs: 'flash.display',
    superName: 'Sprite',
    iinit: labInit,
    slots: [
      { name: 'vx', typeName: 'Number' },
      { name: 'vy', typeName: 'Number' },
      { name: 'pulses', typeName: 'int' },
      { name: 'ticks', typeName: 'int' },
      { name: 'timerCount', typeName: 'int' },
      { name: 'chime', typeName: 'ChimeSound' },
      { name: 'trail', typeNs: 'flash.display', typeName: 'Sprite' },
      { name: 'tmr', typeNs: 'flash.utils', typeName: 'Timer' },
    ],
    methods: [
      { name: 'onFrame', methodIdx: mOnFrame },
      { name: 'onAdded', methodIdx: mOnAdded },
      { name: 'onKey', methodIdx: mOnKey },
      { name: 'onPulseClick', methodIdx: mOnPulseClick },
      { name: 'onTimer', methodIdx: mOnTimer },
    ],
  });

  const scriptInit = abc.addMethod({
    name: 'script_init',
    build: (c) => {
      c.op(0xd0).op(0x30);
      c.op(0x47);
    },
  });
  abc.addScript(scriptInit, [chimeClsIdx, labClsIdx]);

  // Tag 82: DoABC2
  writeTag(tags, 82, buildDoAbc2Tag('As3PhysicsLab', abc.toUint8Array(), 1));

  // Tag 76: SymbolClass (charId 0 -> Document Class, charId 20 -> ChimeSound)
  writeTag(tags, 76, buildSymbolClassTag([
    { id: 0, name: 'As3PhysicsLab' },
    { id: 20, name: 'ChimeSound' },
  ]));

  // Place visual actors on Frame 1
  writeTag(tags, 26, buildPlaceObject2({ depth: 1, characterId: 1, txPx: 30, tyPx: 54, name: 'arena' }));
  writeTag(tags, 70, buildPlaceObject3WithGlow({
    depth: 4, characterId: 2, txPx: 320, tyPx: 184, name: 'orb',
    glowRgba: [56, 189, 248, 255], blurPx: 10,
  }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 6, characterId: 3, txPx: 468, tyPx: 342, name: 'pulseBtn' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 7, characterId: 10, txPx: 0, tyPx: 0, name: 'hud' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 8, characterId: 11, txPx: 0, tyPx: 0, name: 'studentTag' }));
  writeTag(tags, 26, buildPlaceObject2({ depth: 9, characterId: 12, txPx: 0, tyPx: 0, name: 'pulseLbl' }));

  // ShowFrame & End
  writeTag(tags, 1, new Uint8Array(0));
  writeTag(tags, 0, new Uint8Array(0));

  return assembleFwsSwf(640, 400, 30, 1, tags.toUint8Array(), 10);
}


