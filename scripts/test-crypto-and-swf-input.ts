// scripts/test-crypto-and-swf-input.ts
/**
 * Verification Harness for:
 *  1. Hardened ECDSA P-256 Cryptographic Handshake Engine (src/utils/cryptoHandshake.ts)
 *  2. Ruffle-Aligned Pure-SVG AVM1 Keyboard & Mouse Input Runtime (static/player/ast-avm1-vm.js)
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  DEFAULT_ROOT_OS_PUBKEY_JWK,
  generateMaintainerKeyPair,
  setTrustedRootPublicKeyJwk,
  resetTrustedRootPublicKeyJwk,
  resetLastVerifiedNonce,
  signUpdateBundleData,
  verifyUpdateHandshake,
} from '../src/utils/cryptoHandshake';

async function testCryptoHandshake() {
  // 1. Built-in default P-256 root key must be a valid NIST P-256 curve point
  const importedDefault = await crypto.subtle.importKey(
    'jwk',
    DEFAULT_ROOT_OS_PUBKEY_JWK,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['verify']
  );
  assert.ok(importedDefault, 'DEFAULT_ROOT_OS_PUBKEY_JWK failed Web Crypto import');

  // 2. Generate non-extractable maintainer keypair and pin its public key as root
  resetLastVerifiedNonce();
  const maintainer = await generateMaintainerKeyPair('Test Maintainer');
  assert.equal(maintainer.extractable, false, 'Maintainer key must be non-extractable');
  await setTrustedRootPublicKeyJwk(maintainer.publicKeyJwk);

  // 3. Sign & verify legitimate bundle
  const payload = JSON.stringify({ id: 'fractions', bytecodeBytes: 1842 });
  const signed = await signUpdateBundleData({
    version: '2.1.0',
    releaseDate: '2026-11-25',
    channel: 'stable',
    nonce: 1001,
    payload,
  });

  const okRes = await verifyUpdateHandshake(
    {
      version: '2.1.0',
      releaseDate: '2026-11-25',
      channel: 'stable',
      nonce: signed.nonce,
      checksum: signed.checksum,
      payload,
      signature: signed.signature,
      signerPublicKey: signed.signerPublicKey,
    },
    { installedVersion: '2.0.5' }
  );
  assert.equal(okRes.valid, true, `Expected VERIFIED, got ${okRes.status}: ${okRes.reason}`);
  assert.equal(okRes.status, 'VERIFIED');

  // 4. Replay attack must be blocked (same nonce)
  const replayRes = await verifyUpdateHandshake({
    version: '2.1.0',
    releaseDate: '2026-11-25',
    channel: 'stable',
    nonce: signed.nonce,
    checksum: signed.checksum,
    payload,
    signature: signed.signature,
    signerPublicKey: signed.signerPublicKey,
  });
  assert.equal(replayRes.valid, false);
  assert.equal(replayRes.status, 'REPLAY_ATTACK');

  // 5. Zero-nonce bypass must be blocked
  const zeroNonceRes = await verifyUpdateHandshake({
    version: '2.1.1',
    releaseDate: '2026-11-25',
    nonce: 0,
    payload,
    signature: signed.signature,
  });
  assert.equal(zeroNonceRes.valid, false);
  assert.equal(zeroNonceRes.status, 'REPLAY_ATTACK');

  // 6. Self-signed attacker keypair must be rejected as UNTRUSTED_SIGNER
  const attackerKp = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const attackerPrivJwk = await crypto.subtle.exportKey('jwk', attackerKp.privateKey);
  const attackerSigned = await signUpdateBundleData(
    { version: '2.1.2', releaseDate: '2026-11-25', nonce: 1002, payload },
    attackerPrivJwk
  );
  const untrustedRes = await verifyUpdateHandshake({
    version: '2.1.2',
    releaseDate: '2026-11-25',
    nonce: attackerSigned.nonce,
    checksum: attackerSigned.checksum,
    payload,
    signature: attackerSigned.signature,
    signerPublicKey: attackerSigned.signerPublicKey,
  });
  assert.equal(untrustedRes.valid, false);
  assert.equal(untrustedRes.status, 'UNTRUSTED_SIGNER');

  // 7. Payload tampering must be rejected as CHECKSUM_MISMATCH
  const tamperedRes = await verifyUpdateHandshake({
    version: '2.1.3',
    releaseDate: '2026-11-25',
    nonce: 1003,
    checksum: signed.checksum,
    payload: '{"tampered":true}',
    signature: signed.signature,
  });
  assert.equal(tamperedRes.valid, false);
  assert.equal(tamperedRes.status, 'CHECKSUM_MISMATCH');

  // 8. Unsigned v2.0.5 downgrade bypass must be blocked when already >= 2.0.5
  const downgradeBlocked = await verifyUpdateHandshake(
    { version: '2.0.5', releaseDate: '2026-11-25', nonce: 1004, payload },
    { installedVersion: '2.1.0' }
  );
  assert.equal(downgradeBlocked.valid, false);
  assert.equal(downgradeBlocked.status, 'UNSIGNED_BLOCKED');

  // 9. One-way ratchet allows v2.0.4 -> v2.0.5 transition only
  const transitionAllowed = await verifyUpdateHandshake(
    { version: '2.0.5', releaseDate: '2026-11-25', nonce: 1004, payload },
    { installedVersion: '2.0.4' }
  );
  assert.equal(transitionAllowed.valid, true);
  assert.equal(transitionAllowed.status, 'TRANSITIONAL_UNENCRYPTED');

  resetTrustedRootPublicKeyJwk();
  console.log('✓ ECDSA P-256 cryptographic handshake security invariants passed');
}

function testAvm1KeyboardAndMouse() {
  const vmCode = fs.readFileSync(path.resolve('static/player/ast-avm1-vm.js'), 'utf8');
  const sandbox: any = {
    console, Math, Date, Number, String, Boolean, Array, Object, Map, Set, RegExp, JSON,
    Uint8Array, DataView, ArrayBuffer, TextDecoder, parseInt, parseFloat, isNaN, isFinite,
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
    performance: { now: () => Date.now() },
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(vmCode, sandbox);
  const ASTAVM1Runtime = sandbox.ASTAVM1Runtime;

  const prog = Buffer.from(
    JSON.stringify({ v: 1, swfVer: 8, fps: 30, w: 600, h: 400, bg: '#0f172a', fc: 1, l: [], sh: {}, tx: {}, bt: {}, sp: {}, ex: {}, b64: [], fr: [[]], ac: [] })
  ).toString('base64');

  const mockContainer: any = {
    children: [],
    appendChild(c: any) { this.children.push(c); return c; },
    removeChild(c: any) { const i = this.children.indexOf(c); if (i !== -1) this.children.splice(i, 1); return c; },
    insertBefore(c: any) { this.children.push(c); return c; },
    replaceChildren(...n: any[]) { this.children = [...n]; },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    removeEventListener() {},
    style: {},
  };
  const runtime = new ASTAVM1Runtime(prog, { engine: { vars: {} } });
  runtime.mount(mockContainer, mockContainer);

  // 1. Forwarded keyboard input + physical code mapping + anti-stuck releaseAllInputs
  const keyEvents: string[] = [];
  runtime._global.Key.addListener({
    onKeyDown() { keyEvents.push(`down:${runtime._global.Key.getCode()}`); },
    onKeyUp() { keyEvents.push(`up:${runtime._global.Key.getCode()}`); },
  });

  runtime.handleForwardedKeyEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39 });
  assert.equal(runtime._global.Key.isDown(39), true, 'ArrowRight must register in Key.isDown');
  runtime.handleForwardedKeyEvent('keydown', { code: 'Numpad5', key: '5', keyCode: 101 });
  assert.equal(runtime._global.Key.isDown(101), true, 'Numpad5 must map to Flash code 101');
  runtime.releaseAllInputs();
  assert.equal(runtime._global.Key.isDown(39), false, 'releaseAllInputs must clear stuck ArrowRight');
  assert.equal(runtime._global.Key.isDown(101), false, 'releaseAllInputs must clear stuck Numpad5');
  assert.ok(keyEvents.includes('down:39') && keyEvents.includes('up:39'));

  // 2. Mouse wheel listener dispatch
  let wheelDelta = 0;
  runtime._global.Mouse.addListener({
    onMouseWheel(delta: number) { wheelDelta += delta; },
  });
  runtime.triggerMouseWheel(3);
  runtime.triggerMouseWheel(-3);
  runtime.triggerMouseWheel(3);
  assert.equal(wheelDelta, 3, 'Mouse.onMouseWheel must deliver signed Flash wheel deltas');

  // 3. MovieClip full pointer state machine: onPress -> onDragOut -> onDragOver -> onDragOut -> onReleaseOutside
  const clip = runtime.rootClip.createEmptyMovieClip('btnClip', 10);
  const pointerLog: string[] = [];
  runtime._setMember(clip, 'onPress', () => pointerLog.push('press'));
  runtime._setMember(clip, 'onDragOut', () => pointerLog.push('dragOut'));
  runtime._setMember(clip, 'onDragOver', () => pointerLog.push('dragOver'));
  runtime._setMember(clip, 'onReleaseOutside', () => pointerLog.push('releaseOutside'));

  clip._onPtrDown({ clientX: 50, clientY: 50 });
  runtime.triggerMouseDown();
  clip._onPtrLeave();
  clip._onPtrEnter();
  clip._onPtrLeave();
  runtime.triggerMouseUp();
  assert.deepEqual(pointerLog, ['press', 'dragOut', 'dragOver', 'dragOut', 'releaseOutside']);

  // 4. Selection API
  runtime._global.Selection.setFocus(clip);
  assert.equal(runtime._global.Selection.getFocus(), 'btnClip');

  runtime.destroy();
  console.log('✓ Ruffle-aligned pure-SVG AVM1 keyboard & mouse invariants passed');
}

(async () => {
  await testCryptoHandshake();
  testAvm1KeyboardAndMouse();
  console.log('ALL CRYPTO HANDSHAKE & FLASH INPUT TESTS PASSED!');
  process.exit(0);
})();
