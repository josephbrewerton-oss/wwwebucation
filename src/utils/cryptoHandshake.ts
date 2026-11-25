/**
 * src/utils/cryptoHandshake.ts
 *
 * Zero-Trust Cryptographic Update & Offline Cartridge Handshake Engine
 * Uses W3C Web Crypto API (ECDSA P-256 / SHA-256) with:
 *  - Pinned root public-key trust (rejects attacker-supplied self-signed keys)
 *  - Strict non-zero monotonic anti-replay nonces stored in IndexedDB (`localStateStore`)
 *  - One-way version ratchet for transitional unencrypted releases (defaults to strict mode)
 *  - Canonical JSON payload serialization & SHA-256 payload checksum verification
 *  - Non-extractable IndexedDB CryptoKey storage for local maintainer signing keys
 *
 * 100% offline / air-gap ready; lazy-loaded so initial SPA boot shell remains < 20 KB gzipped.
 */

import { computeSha256 } from './cryptoVault';
import {
  getLocalState,
  setLocalState,
  removeLocalState,
} from '../services/localStateStore';

export interface MaintainerKeyInfo {
  publicKeyJwk: JsonWebKey;
  fingerprint: string;
  createdAt: number;
  label: string;
  extractable: false;
}

export interface SignedUpdateBundle {
  version: string;
  releaseDate: string;
  channel?: string;
  nonce: number;
  checksum?: string;
  payload?: string;
  signature?: string;
  signerPublicKey?: JsonWebKey | string;
}

export interface HandshakeVerificationResult {
  valid: boolean;
  status:
    | 'VERIFIED'
    | 'FAILED'
    | 'UNSIGNED_BLOCKED'
    | 'REPLAY_ATTACK'
    | 'UNTRUSTED_SIGNER'
    | 'CHECKSUM_MISMATCH'
    | 'TRANSITIONAL_UNENCRYPTED';
  reason: string;
  digestHex?: string;
  signerFingerprint?: string;
}

export interface VerifyHandshakeOptions {
  /** Currently installed app/kernel version used for one-way transition ratchet checks. */
  installedVersion?: string;
  /** Override the trusted root public key for isolated/test verification. */
  trustedRootPublicKeyJwk?: JsonWebKey;
  /** If true, does not advance stored anti-replay nonce (useful for dry-run inspection). */
  dryRun?: boolean;
  /** Override strict mode enforcement for this verification call. */
  strict?: boolean;
}

export const LAST_UNENCRYPTED_VERSION = '2.0.5';

// Valid NIST P-256 Root Verification Public Key (replaceable via setTrustedRootPublicKeyJwk)
export const DEFAULT_ROOT_OS_PUBKEY_JWK: JsonWebKey = {
  kty: 'EC',
  crv: 'P-256',
  x: 'y_JSyOtW-xR-MRc2pd4WfYX9sTKfgfd8mFKnUefoAYQ',
  y: 'leeFh0mkxfcWMYNwmtFCLjnS8iBLm7EP3eF8AmnZKo0',
  ext: true,
  key_ops: ['verify'],
};

const STATE_ROOT_PUBKEY = 'STJ_CRYPTO_ROOT_PUBKEY_V1';
const STATE_STRICT_HANDSHAKE = 'STJ_CRYPTO_STRICT_HANDSHAKE_V1';
const STATE_LAST_NONCE = 'STJ_CRYPTO_LAST_NONCE_V1';
const STATE_MAINTAINER_META = 'STJ_CRYPTO_MAINTAINER_META_V1';

const KEYSTORE_DB_NAME = 'StJosephCryptoKeyStore';
const KEYSTORE_DB_VERSION = 1;
const KEYSTORE_OBJECT_STORE = 'keys';
const MAINTAINER_KEY_RECORD_ID = 'local-maintainer-ecdsa-p256';

interface StoredKeyRecord {
  id: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
  fingerprint: string;
  createdAt: number;
  label: string;
}

// In-memory fallback for headless Node tests or environments where IndexedDB is unavailable
let memoryMaintainerRecord: StoredKeyRecord | null = null;

function normalizeVersionTuple(v: string): [number, number, number] {
  const clean = String(v || '')
    .trim()
    .replace(/^v/i, '')
    .split('-')[0];
  const parts = clean.split('.').map((p) => {
    const n = parseInt(p, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function compareSemver(a: string, b: string): number {
  const ta = normalizeVersionTuple(a);
  const tb = normalizeVersionTuple(b);
  for (let i = 0; i < 3; i++) {
    if (ta[i] !== tb[i]) return ta[i] - tb[i];
  }
  return 0;
}

/**
 * Checks if a version equals the designated final unencrypted transition release.
 */
export function isTransitionalUnencryptedVersion(v: string): boolean {
  return compareSemver(v, LAST_UNENCRYPTED_VERSION) === 0;
}

export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const clean = String(base64 || '').trim();
  if (typeof atob === 'function') {
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(clean, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  throw new Error('Base64 decoding is unavailable in this environment.');
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (typeof btoa === 'function') {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  throw new Error('Base64 encoding is unavailable in this environment.');
}

export async function computeSha256Digest(data: string): Promise<string> {
  return computeSha256(data);
}

/**
 * Computes a deterministic 64-bit hex fingerprint from a public ECDSA P-256 JWK.
 */
export async function computeKeyFingerprint(jwk: JsonWebKey): Promise<string> {
  if (!jwk || jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.x || !jwk.y) {
    throw new Error('Invalid ECDSA P-256 public JWK.');
  }
  const canonical = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y });
  const hash = await computeSha256Digest(canonical);
  return `0x${hash.substring(0, 16).toUpperCase()}`;
}

/**
 * Strict cryptographic handshake defaults to TRUE (fail-closed) unless explicitly disabled.
 */
export function isStrictHandshakeEnforced(): boolean {
  const stored = getLocalState(STATE_STRICT_HANDSHAKE);
  if (stored === null) return true;
  return stored !== 'false';
}

export function setStrictHandshakeEnforced(enforced: boolean): void {
  setLocalState(STATE_STRICT_HANDSHAKE, enforced ? 'true' : 'false');
}

export function getLastVerifiedNonce(): number {
  const raw = getLocalState(STATE_LAST_NONCE);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function resetLastVerifiedNonce(): void {
  removeLocalState(STATE_LAST_NONCE);
}

function sanitizePublicJwk(jwk: JsonWebKey): JsonWebKey {
  if (!jwk || jwk.kty !== 'EC' || jwk.crv !== 'P-256' || typeof jwk.x !== 'string' || typeof jwk.y !== 'string') {
    throw new Error('Expected a valid ECDSA P-256 public JWK (kty: "EC", crv: "P-256", x, y).');
  }
  // Explicitly strip any private key material (`d`) before storing or verifying
  return {
    kty: 'EC',
    crv: 'P-256',
    x: jwk.x,
    y: jwk.y,
    ext: true,
    key_ops: ['verify'],
  };
}

export function getTrustedRootPublicKeyJwk(): JsonWebKey {
  const raw = getLocalState(STATE_ROOT_PUBKEY);
  if (raw) {
    try {
      return sanitizePublicJwk(JSON.parse(raw));
    } catch {
      // Fall through to built-in root key
    }
  }
  return DEFAULT_ROOT_OS_PUBKEY_JWK;
}

export async function setTrustedRootPublicKeyJwk(jwk: JsonWebKey): Promise<string> {
  const clean = sanitizePublicJwk(jwk);
  // Validate that the coordinates actually lie on NIST P-256 via Web Crypto before pinning
  await crypto.subtle.importKey(
    'jwk',
    clean,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['verify']
  );
  setLocalState(STATE_ROOT_PUBKEY, JSON.stringify(clean));
  return computeKeyFingerprint(clean);
}

export function resetTrustedRootPublicKeyJwk(): void {
  removeLocalState(STATE_ROOT_PUBKEY);
}

// =========================================================================
// Non-Extractable IndexedDB Keystore (Private keys never touch localStorage)
// =========================================================================

function openKeyStoreDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(KEYSTORE_DB_NAME, KEYSTORE_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(KEYSTORE_OBJECT_STORE)) {
          db.createObjectStore(KEYSTORE_OBJECT_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveMaintainerKeyRecord(record: StoredKeyRecord): Promise<void> {
  memoryMaintainerRecord = record;
  setLocalState(
    STATE_MAINTAINER_META,
    JSON.stringify({
      publicKeyJwk: record.publicKeyJwk,
      fingerprint: record.fingerprint,
      createdAt: record.createdAt,
      label: record.label,
      extractable: false,
    })
  );
  const db = await openKeyStoreDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(KEYSTORE_OBJECT_STORE, 'readwrite');
      tx.objectStore(KEYSTORE_OBJECT_STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function loadMaintainerKeyRecord(): Promise<StoredKeyRecord | null> {
  if (memoryMaintainerRecord) return memoryMaintainerRecord;
  const db = await openKeyStoreDb();
  if (!db) return null;
  const record = await new Promise<StoredKeyRecord | null>((resolve) => {
    try {
      const tx = db.transaction(KEYSTORE_OBJECT_STORE, 'readonly');
      const req = tx.objectStore(KEYSTORE_OBJECT_STORE).get(MAINTAINER_KEY_RECORD_ID);
      req.onsuccess = () => resolve((req.result as StoredKeyRecord) || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  if (record) memoryMaintainerRecord = record;
  return record;
}

/**
 * Generates a fresh ECDSA P-256 maintainer keypair where the private key is NON-EXTRACTABLE
 * and stored directly as a Web Crypto handle in IndexedDB (never exported to plaintext JSON).
 */
export async function generateMaintainerKeyPair(
  label = 'Local Maintainer Signing Key'
): Promise<MaintainerKeyInfo> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, // Private key cannot be extracted by scripts
    ['sign', 'verify']
  );

  // Public keys are always safe to export for distribution/pinning
  const publicKeyJwk = sanitizePublicJwk(await crypto.subtle.exportKey('jwk', keyPair.publicKey));
  const fingerprint = await computeKeyFingerprint(publicKeyJwk);
  const createdAt = Date.now();

  await saveMaintainerKeyRecord({
    id: MAINTAINER_KEY_RECORD_ID,
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicKeyJwk,
    fingerprint,
    createdAt,
    label,
  });

  return {
    publicKeyJwk,
    fingerprint,
    createdAt,
    label,
    extractable: false,
  };
}

export async function getMaintainerKeyInfo(): Promise<MaintainerKeyInfo | null> {
  const rec = await loadMaintainerKeyRecord();
  if (rec) {
    return {
      publicKeyJwk: rec.publicKeyJwk,
      fingerprint: rec.fingerprint,
      createdAt: rec.createdAt,
      label: rec.label,
      extractable: false,
    };
  }
  return null;
}

/**
 * Canonical unambiguous JSON payload representation (prevents delimiter collision).
 */
export function buildCanonicalUpdatePayload(bundle: {
  version: string;
  releaseDate: string;
  channel?: string;
  nonce: number;
  checksum?: string;
  payload?: string;
}): string {
  return JSON.stringify([
    'STJ-ECDSA-P256-V1',
    String(bundle.version || ''),
    String(bundle.releaseDate || ''),
    String(bundle.channel || 'stable'),
    Number(bundle.nonce),
    String(bundle.checksum || ''),
    String(bundle.payload || ''),
  ]);
}

/**
 * Signs an update or offline cartridge manifest bundle using either:
 *  - a Web Crypto `CryptoKey` (including the non-extractable local maintainer key), OR
 *  - a private `JsonWebKey` (for offline build-time release scripts).
 */
export async function signUpdateBundleData(
  bundle: {
    version: string;
    releaseDate: string;
    channel?: string;
    nonce?: number;
    checksum?: string;
    payload?: string;
  },
  signingKey?: CryptoKey | JsonWebKey
): Promise<{
  signature: string;
  signerPublicKey: JsonWebKey;
  digestHex: string;
  checksum: string;
  nonce: number;
}> {
  const nonce =
    typeof bundle.nonce === 'number' && Number.isSafeInteger(bundle.nonce) && bundle.nonce > 0
      ? bundle.nonce
      : Math.max(Date.now(), getLastVerifiedNonce() + 1);

  const payloadStr = bundle.payload || '';
  const checksum = bundle.checksum || (await computeSha256Digest(payloadStr));

  const canonical = buildCanonicalUpdatePayload({
    ...bundle,
    nonce,
    checksum,
    payload: payloadStr,
  });
  const digestHex = await computeSha256Digest(canonical);

  let privateCryptoKey: CryptoKey;
  let signerPublicKey: JsonWebKey;

  if (!signingKey) {
    const rec = await loadMaintainerKeyRecord();
    if (!rec) {
      throw new Error('No local maintainer signing key found. Call generateMaintainerKeyPair() first.');
    }
    privateCryptoKey = rec.privateKey;
    signerPublicKey = rec.publicKeyJwk;
  } else if (typeof CryptoKey !== 'undefined' && signingKey instanceof CryptoKey) {
    privateCryptoKey = signingKey;
    const rec = await loadMaintainerKeyRecord();
    signerPublicKey = rec ? rec.publicKeyJwk : getTrustedRootPublicKeyJwk();
  } else {
    const jwk = signingKey as JsonWebKey;
    privateCryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
    signerPublicKey = sanitizePublicJwk(jwk);
  }

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateCryptoKey,
    encoder.encode(canonical)
  );

  return {
    signature: bufferToBase64(signatureBuffer),
    signerPublicKey,
    digestHex,
    checksum,
    nonce,
  };
}

/**
 * Verifies a signed update or offline cartridge bundle against the PINNED trusted root public key.
 * Rejects attacker-supplied self-signed public keys, replayed/zero nonces, checksum mismatches,
 * and version-downgrade bypasses.
 */
export async function verifyUpdateHandshake(
  bundle: SignedUpdateBundle,
  options: VerifyHandshakeOptions = {}
): Promise<HandshakeVerificationResult> {
  const strict = options.strict !== undefined ? options.strict : isStrictHandshakeEnforced();

  if (!bundle || typeof bundle !== 'object') {
    return {
      valid: false,
      status: 'FAILED',
      reason: 'Update bundle payload is missing or malformed.',
    };
  }

  // Handle unsigned bundles with a strict one-way version ratchet
  if (!bundle.signature) {
    if (
      options.installedVersion &&
      compareSemver(options.installedVersion, LAST_UNENCRYPTED_VERSION) < 0 &&
      isTransitionalUnencryptedVersion(bundle.version)
    ) {
      return {
        valid: true,
        status: 'TRANSITIONAL_UNENCRYPTED',
        reason: `One-way transition from v${options.installedVersion} to final unsigned release v${LAST_UNENCRYPTED_VERSION} permitted.`,
      };
    }

    if (strict) {
      return {
        valid: false,
        status: 'UNSIGNED_BLOCKED',
        reason: 'Unsigned update rejected: strict ECDSA P-256 signature verification is enabled.',
      };
    }

    return {
      valid: true,
      status: 'VERIFIED',
      reason: 'Unsigned development bundle allowed because strict verification is disabled.',
    };
  }

  // 1. Non-bypassable monotonic anti-replay nonce check
  const nonce = bundle.nonce;
  if (typeof nonce !== 'number' || !Number.isSafeInteger(nonce) || nonce <= 0) {
    return {
      valid: false,
      status: 'REPLAY_ATTACK',
      reason: 'Update rejected: signed bundles must include a positive integer nonce.',
    };
  }

  const lastNonce = getLastVerifiedNonce();
  if (nonce <= lastNonce) {
    return {
      valid: false,
      status: 'REPLAY_ATTACK',
      reason: `Replay rejected: bundle nonce (${nonce}) is not newer than last verified nonce (${lastNonce}).`,
    };
  }

  try {
    // 2. Always pin verification to the trusted root public key (never trust bundle.signerPublicKey)
    const trustedRootJwk = sanitizePublicJwk(
      options.trustedRootPublicKeyJwk || getTrustedRootPublicKeyJwk()
    );
    const trustedFingerprint = await computeKeyFingerprint(trustedRootJwk);

    if (bundle.signerPublicKey) {
      const candidateJwk = sanitizePublicJwk(
        typeof bundle.signerPublicKey === 'string'
          ? JSON.parse(bundle.signerPublicKey)
          : bundle.signerPublicKey
      );
      const candidateFingerprint = await computeKeyFingerprint(candidateJwk);
      if (candidateFingerprint !== trustedFingerprint) {
        return {
          valid: false,
          status: 'UNTRUSTED_SIGNER',
          signerFingerprint: candidateFingerprint,
          reason: `Untrusted signer key (${candidateFingerprint}) does not match pinned root key (${trustedFingerprint}).`,
        };
      }
    }

    // 3. Verify payload integrity checksum if declared
    const payloadStr = bundle.payload || '';
    if (bundle.checksum) {
      const computedPayloadHash = await computeSha256Digest(payloadStr);
      if (computedPayloadHash !== bundle.checksum.toLowerCase()) {
        return {
          valid: false,
          status: 'CHECKSUM_MISMATCH',
          signerFingerprint: trustedFingerprint,
          reason: 'Payload SHA-256 digest does not match the bundle checksum.',
        };
      }
    }

    // 4. Verify ECDSA P-256 signature over canonical JSON representation
    const canonical = buildCanonicalUpdatePayload({
      version: bundle.version,
      releaseDate: bundle.releaseDate,
      channel: bundle.channel,
      nonce,
      checksum: bundle.checksum,
      payload: payloadStr,
    });
    const digestHex = await computeSha256Digest(canonical);

    const publicKey = await crypto.subtle.importKey(
      'jwk',
      trustedRootJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    const sigBytes = base64ToUint8Array(bundle.signature);
    const sigCopy = new Uint8Array(sigBytes.byteLength);
    sigCopy.set(sigBytes);

    const isValid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      sigCopy.buffer,
      new TextEncoder().encode(canonical)
    );

    if (!isValid) {
      return {
        valid: false,
        status: 'FAILED',
        digestHex,
        signerFingerprint: trustedFingerprint,
        reason: 'Cryptographic ECDSA P-256 signature verification failed.',
      };
    }

    // Persist monotonic nonce ONLY after all cryptographic checks succeed
    if (!options.dryRun) {
      setLocalState(STATE_LAST_NONCE, String(nonce));
    }

    return {
      valid: true,
      status: 'VERIFIED',
      digestHex,
      signerFingerprint: trustedFingerprint,
      reason: `Verified ECDSA P-256 signature from pinned root key ${trustedFingerprint}.`,
    };
  } catch (err: any) {
    return {
      valid: false,
      status: 'FAILED',
      reason: `Cryptographic verification error: ${err?.message || String(err)}`,
    };
  }
}

/**
 * Convenience helper to verify a signed offline cartridge pack / manifest JSON.
 */
export async function verifySignedCartridgeBundle(
  bundle: SignedUpdateBundle,
  options?: VerifyHandshakeOptions
): Promise<HandshakeVerificationResult> {
  return verifyUpdateHandshake(bundle, { strict: true, ...options });
}
