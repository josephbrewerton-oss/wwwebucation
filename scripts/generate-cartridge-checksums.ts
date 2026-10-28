// scripts/generate-cartridge-checksums.ts
/**
 * St Joseph's Curriculum Authority — Cartridge Checksum & Cryptographic Seal Generator
 * 
 * Computes canonical SHA-256 hashes and cryptographic authority seals for all official
 * curriculum cartridges in static/cartridges/ and static/player/bytecode/.
 * 
 * Guarantees that any cartridge running in the browser, embedded in a smartboard,
 * or exported as a standalone .ast.svg capsule can be deterministically verified as
 * "Native to St Joseph's Curriculum".
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT_DIR = process.cwd();
const CARTRIDGES_DIR = path.join(ROOT_DIR, 'static', 'cartridges');
const BYTECODE_DIR = path.join(ROOT_DIR, 'static', 'player', 'bytecode');
const STATIC_OUT_JSON = path.join(ROOT_DIR, 'static', 'cartridge-checksums.json');
const PLAYER_OUT_JSON = path.join(ROOT_DIR, 'static', 'player', 'cartridge-checksums.json');
const SRC_OUT_JSON = path.join(ROOT_DIR, 'src', 'data', 'player', 'cartridgeChecksums.json');
const SRC_OUT_TS = path.join(ROOT_DIR, 'src', 'data', 'player', 'cartridgeChecksums.ts');

export const CURRICULUM_AUTHORITY = "St Joseph's Catholic Primary School Curriculum Authority";
export const AUTHORITY_SEAL_SALT = "ST_JOSEPHS_CURRICULUM_SEAL_V1_2026_AGPL";

export interface CartridgeChecksumEntry {
  id: string;
  title: string;
  stage: string;
  type: string;
  astSha256: string;
  svgSha256: string;
  astbSha256?: string;
  astBytes: number;
  svgBytes: number;
  astbBytes?: number;
  tier: 'native';
  authority: string;
  seal: string; // Cryptographic authority signature
  certified: boolean;
}

export interface CartridgeRegistryManifest {
  version: string;
  issuer: string;
  generatedAt: string;
  totalCartridges: number;
  masterChecksum: string;
  cartridges: Record<string, CartridgeChecksumEntry>;
}

function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function computeSeal(id: string, astHash: string, svgHash: string): string {
  return crypto
    .createHash('sha256')
    .update(`${id}:${astHash}:${svgHash}:${CURRICULUM_AUTHORITY}:${AUTHORITY_SEAL_SALT}`)
    .digest('hex');
}

function extractAstSlot(content: string, regex: RegExp): string | null {
  const match = content.match(regex);
  if (!match) return null;
  return match[1].trim().replace(/^"|"$/g, '');
}

export function generateCartridgeChecksums(): CartridgeRegistryManifest {
  console.log('[Cartridge Checksum] Scanning static/cartridges/ for official curriculum cartridges...');

  if (!fs.existsSync(CARTRIDGES_DIR)) {
    throw new Error(`Cartridges directory not found: ${CARTRIDGES_DIR}`);
  }

  const files = fs.readdirSync(CARTRIDGES_DIR);
  const astFiles = files.filter(f => f.endsWith('.ast')).sort();

  const cartridges: Record<string, CartridgeChecksumEntry> = {};
  const masterCollector = crypto.createHash('sha256');

  for (const astFileName of astFiles) {
    const id = astFileName.replace(/\.ast$/, '');
    const astPath = path.join(CARTRIDGES_DIR, astFileName);
    const svgFileName = `${id}.svg`;
    const svgPath = path.join(CARTRIDGES_DIR, svgFileName);
    const astbPath = path.join(BYTECODE_DIR, `${id}.astb`);

    const astBuffer = fs.readFileSync(astPath);
    const astSha256 = computeSha256(astBuffer);
    const astContent = astBuffer.toString('utf8');

    let svgSha256 = '';
    let svgBytes = 0;
    if (fs.existsSync(svgPath)) {
      const svgBuffer = fs.readFileSync(svgPath);
      svgSha256 = computeSha256(svgBuffer);
      svgBytes = svgBuffer.length;
    }

    let astbSha256: string | undefined = undefined;
    let astbBytes: number | undefined = undefined;
    if (fs.existsSync(astbPath)) {
      const astbBuffer = fs.readFileSync(astbPath);
      astbSha256 = computeSha256(astbBuffer);
      astbBytes = astbBuffer.length;
    }

    const title = extractAstSlot(astContent, /:title\s+("([^"]+)"|([^\s\)]+))/i) || id;
    const stage = extractAstSlot(astContent, /:stage\s+("([^"]+)"|([^\s\)]+))/i) || 'CURRICULUM';
    const type = extractAstSlot(astContent, /:type\s+("([^"]+)"|([^\s\)]+))/i) || 'Sim';

    const seal = computeSeal(id, astSha256, svgSha256);

    const entry: CartridgeChecksumEntry = {
      id,
      title,
      stage,
      type,
      astSha256,
      svgSha256,
      ...(astbSha256 ? { astbSha256, astbBytes } : {}),
      astBytes: astBuffer.length,
      svgBytes,
      tier: 'native',
      authority: CURRICULUM_AUTHORITY,
      seal,
      certified: true
    };

    cartridges[id] = entry;
    masterCollector.update(`${id}:${seal}`);
  }

  const masterChecksum = masterCollector.digest('hex');
  const manifest: CartridgeRegistryManifest = {
    version: '1.0.0',
    issuer: CURRICULUM_AUTHORITY,
    generatedAt: new Date().toISOString(),
    totalCartridges: Object.keys(cartridges).length,
    masterChecksum,
    cartridges
  };

  const jsonContent = JSON.stringify(manifest, null, 2);

  // Write to static/
  fs.writeFileSync(STATIC_OUT_JSON, jsonContent, 'utf8');
  console.log(`[Cartridge Checksum] Wrote ${Object.keys(cartridges).length} checksums to ${STATIC_OUT_JSON}`);

  // Write to static/player/
  if (fs.existsSync(path.dirname(PLAYER_OUT_JSON))) {
    fs.writeFileSync(PLAYER_OUT_JSON, jsonContent, 'utf8');
  }

  // Write to src/data/player/
  const srcPlayerDir = path.dirname(SRC_OUT_JSON);
  if (!fs.existsSync(srcPlayerDir)) {
    fs.mkdirSync(srcPlayerDir, { recursive: true });
  }
  fs.writeFileSync(SRC_OUT_JSON, jsonContent, 'utf8');

  // Also emit strongly-typed TypeScript helper
  const tsContent = `// AUTO-GENERATED BY scripts/generate-cartridge-checksums.ts
// DO NOT EDIT MANUALLY - Canonical cryptographic registry of St Joseph's Curriculum Cartridges

export interface CartridgeChecksumEntry {
  id: string;
  title: string;
  stage: string;
  type: string;
  astSha256: string;
  svgSha256: string;
  astbSha256?: string;
  astBytes: number;
  svgBytes: number;
  astbBytes?: number;
  tier: 'native';
  authority: string;
  seal: string;
  certified: boolean;
}

export interface CartridgeRegistryManifest {
  version: string;
  issuer: string;
  generatedAt: string;
  totalCartridges: number;
  masterChecksum: string;
  cartridges: Record<string, CartridgeChecksumEntry>;
}

export const CARTRIDGE_CHECKSUMS: CartridgeRegistryManifest = ${jsonContent};

export const OFFICIAL_AUTHORITY = "${CURRICULUM_AUTHORITY}";

export function getOfficialCartridgeRecord(id: string): CartridgeChecksumEntry | null {
  return CARTRIDGE_CHECKSUMS.cartridges[id] || null;
}

export function isOfficialNativeCartridge(id: string): boolean {
  return Boolean(CARTRIDGE_CHECKSUMS.cartridges[id]);
}
`;

  fs.writeFileSync(SRC_OUT_TS, tsContent, 'utf8');
  console.log(`[Cartridge Checksum] Successfully generated ${SRC_OUT_TS} (Master Checksum: ${masterChecksum.substring(0, 16)}...)`);

  return manifest;
}

if (process.argv[1] && process.argv[1].endsWith('generate-cartridge-checksums.ts')) {
  generateCartridgeChecksums();
}
