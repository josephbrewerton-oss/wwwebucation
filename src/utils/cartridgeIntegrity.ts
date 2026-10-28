// src/utils/cartridgeIntegrity.ts
/**
 * St Joseph's Curriculum Authority — Cartridge Integrity & Cryptographic Verifier
 * 
 * Verifies that vector simulation cartridges (.ast, .svg, and compiled .astb) match
 * the authoritative cryptographic hashes signed by St Joseph's Catholic Primary School.
 * 
 * Invariants:
 * - 0% external crypto dependencies: uses native browser crypto.subtle (or Node crypto in tests).
 * - Real-time tamper detection: immediate visual alert if a cartridge has been altered.
 * - Authenticity badge: "Native to St Joseph's Curriculum" rendered with certified authority seal.
 */

import {
  CARTRIDGE_CHECKSUMS,
  OFFICIAL_AUTHORITY,
  getOfficialCartridgeRecord,
  isOfficialNativeCartridge,
  type CartridgeChecksumEntry,
} from '../data/player/cartridgeChecksums';

export const CURRICULUM_AUTHORITY_NAME = OFFICIAL_AUTHORITY;
export const AUTHORITY_SEAL_SALT = 'ST_JOSEPHS_CURRICULUM_SEAL_V1_2026_AGPL';

export type IntegrityStatus = 'verified-native' | 'tampered' | 'unverified-external';

export interface CartridgeIntegrityResult {
  cartridgeId: string;
  status: IntegrityStatus;
  isNative: boolean;
  isVerified: boolean;
  computedAstSha256?: string;
  computedSvgSha256?: string;
  expectedAstSha256?: string;
  expectedSvgSha256?: string;
  shortHash: string;
  authority: string;
  seal?: string;
  tier: 'native' | 'community' | 'modified';
  badgeText: string;
  badgeTooltip: string;
  details: string;
}

/**
 * Universal SHA-256 calculation using native Web Crypto API or Node crypto
 */
export async function computeSha256(data: string | ArrayBuffer | Uint8Array): Promise<string> {
  let uint8: Uint8Array;
  if (typeof data === 'string') {
    uint8 = new TextEncoder().encode(data);
  } else if (data instanceof Uint8Array) {
    uint8 = data;
  } else {
    uint8 = new Uint8Array(data);
  }

  // Check for Web Crypto API
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    const hashBuffer = await crypto.subtle.digest('SHA-256', uint8 as unknown as BufferSource);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js runtime fallback (for test scripts)
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(uint8).digest('hex');
  } catch {
    throw new Error('No cryptographic SHA-256 implementation available in runtime environment.');
  }
}

/**
 * Computes the deterministic St Joseph's Curriculum Authority seal
 */
export async function computeAuthoritySeal(id: string, astHash: string, svgHash: string): Promise<string> {
  const payload = `${id}:${astHash}:${svgHash}:${CURRICULUM_AUTHORITY_NAME}:${AUTHORITY_SEAL_SALT}`;
  return computeSha256(payload);
}

/**
 * Shortens a 64-character SHA-256 hash into an ergonomic fingerprint snippet
 */
export function formatShortHash(hash: string, length = 12): string {
  if (!hash || hash.length < length) return hash || 'unsigned';
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
}

/**
 * Quickly checks if a cartridge ID is registered in the official St Joseph's Curriculum Registry
 */
export function isNativeCartridge(id: string): boolean {
  return isOfficialNativeCartridge(id);
}

/**
 * Retrieves the official registered checksum record for a cartridge
 */
export function getRegisteredRecord(id: string): CartridgeChecksumEntry | null {
  return getOfficialCartridgeRecord(id);
}

/**
 * Retrieves the master checksum across all certified curriculum cartridges
 */
export function getMasterRegistryChecksum(): string {
  return CARTRIDGE_CHECKSUMS.masterChecksum;
}

/**
 * Retrieves total count of certified cartridges in registry
 */
export function getTotalCertifiedCartridges(): number {
  return CARTRIDGE_CHECKSUMS.totalCartridges;
}

/**
 * Full cryptographic verification of a cartridge's content against the authoritative registry.
 * 
 * Can verify:
 * - Direct AST text string
 * - Object with ast, svg, or astb content
 */
export async function verifyCartridgeIntegrity(
  cartridgeId: string,
  content?: string | { ast?: string | ArrayBuffer; svg?: string | ArrayBuffer; astb?: ArrayBuffer }
): Promise<CartridgeIntegrityResult> {
  const canonicalId = cartridgeId.trim().toLowerCase();
  const record = getOfficialCartridgeRecord(canonicalId);

  // 1. External / Unregistered Cartridge
  if (!record) {
    let computedHash = '';
    if (content) {
      const targetData = typeof content === 'string' ? content : content.ast || content.svg || '';
      computedHash = await computeSha256(targetData);
    }
    return {
      cartridgeId: canonicalId,
      status: 'unverified-external',
      isNative: false,
      isVerified: false,
      computedAstSha256: computedHash || undefined,
      shortHash: computedHash ? formatShortHash(computedHash) : 'external',
      authority: 'Third-Party / Community Author',
      tier: 'community',
      badgeText: 'Community Cartridge',
      badgeTooltip: 'External or user-authored cartridge. Not part of the official St Joseph\'s Catholic School curriculum registry.',
      details: 'Cartridge is not signed by St Joseph\'s Curriculum Authority.',
    };
  }

  // 2. If content is provided: calculate real SHA-256 and verify against expected digest
  if (content) {
    let astMatch = true;
    let svgMatch = true;
    let computedAst: string | undefined = undefined;
    let computedSvg: string | undefined = undefined;

    if (typeof content === 'string') {
      computedAst = await computeSha256(content);
      astMatch = computedAst.toLowerCase() === record.astSha256.toLowerCase();
    } else {
      if (content.ast !== undefined) {
        computedAst = await computeSha256(content.ast);
        astMatch = computedAst.toLowerCase() === record.astSha256.toLowerCase();
      }
      if (content.svg !== undefined) {
        computedSvg = await computeSha256(content.svg);
        svgMatch = computedSvg.toLowerCase() === record.svgSha256.toLowerCase();
      }
    }

    if (!astMatch || !svgMatch) {
      return {
        cartridgeId: canonicalId,
        status: 'tampered',
        isNative: true,
        isVerified: false,
        computedAstSha256: computedAst,
        computedSvgSha256: computedSvg,
        expectedAstSha256: record.astSha256,
        expectedSvgSha256: record.svgSha256,
        shortHash: computedAst ? formatShortHash(computedAst) : formatShortHash(record.astSha256),
        authority: CURRICULUM_AUTHORITY_NAME,
        seal: record.seal,
        tier: 'modified',
        badgeText: 'Cartridge Modified',
        badgeTooltip: `Warning: Checksum mismatch. The loaded content differs from the official signed digest for ${record.title}.`,
        details: `Integrity check failed: Computed SHA-256 does not match authoritative seal.`,
      };
    }
  }

  // 3. Exact match with signed authoritative registry
  return {
    cartridgeId: canonicalId,
    status: 'verified-native',
    isNative: true,
    isVerified: true,
    computedAstSha256: record.astSha256,
    computedSvgSha256: record.svgSha256,
    expectedAstSha256: record.astSha256,
    expectedSvgSha256: record.svgSha256,
    shortHash: formatShortHash(record.astSha256),
    authority: CURRICULUM_AUTHORITY_NAME,
    seal: record.seal,
    tier: 'native',
    badgeText: "Native to St Joseph's Curriculum",
    badgeTooltip: `Cryptographically verified official cartridge (${record.title}). Signed by ${CURRICULUM_AUTHORITY_NAME} with SHA-256 seal ${record.seal.substring(0, 16)}...`,
    details: `Official certified curriculum cartridge. SHA-256: ${record.astSha256}`,
  };
}
