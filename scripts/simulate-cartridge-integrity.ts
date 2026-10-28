// scripts/simulate-cartridge-integrity.ts
/**
 * St Joseph's Curriculum Authority — Cartridge Checksum & Integrity Invariant Test Suite
 * 
 * Verifies:
 * 1. Authoritative registry validity (version, issuer, masterChecksum)
 * 2. 100% test coverage across all official curriculum cartridges in static/cartridges/
 * 3. Exact SHA-256 integrity match for every official cartridge
 * 4. Tamper detection: modifying 1 single byte triggers 'tampered' status
 * 5. Unknown/third-party cartridge detection triggers 'unverified-external'
 * 6. Deterministic authority seal validation
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  verifyCartridgeIntegrity,
  computeSha256,
  computeAuthoritySeal,
  isNativeCartridge,
  getRegisteredRecord,
  getMasterRegistryChecksum,
  getTotalCertifiedCartridges,
  formatShortHash,
  CURRICULUM_AUTHORITY_NAME,
} from '../src/utils/cartridgeIntegrity';
import { CARTRIDGE_CHECKSUMS } from '../src/data/player/cartridgeChecksums';

const ROOT_DIR = process.cwd();
const CARTRIDGES_DIR = path.join(ROOT_DIR, 'static', 'cartridges');

async function runIntegrityTests() {
  console.log('🧪 Running St Joseph\'s Cartridge Checksum & Integrity Invariant Tests...\n');

  let testCount = 0;

  // 1. Authoritative Registry Invariants
  console.log('1. Checking Authoritative Registry Invariants...');
  assert.strictEqual(CARTRIDGE_CHECKSUMS.version, '1.0.0', 'Registry version must be 1.0.0');
  assert.strictEqual(CARTRIDGE_CHECKSUMS.issuer, CURRICULUM_AUTHORITY_NAME, 'Issuer must match official Curriculum Authority');
  assert.strictEqual(typeof CARTRIDGE_CHECKSUMS.masterChecksum, 'string', 'masterChecksum must be string');
  assert.strictEqual(CARTRIDGE_CHECKSUMS.masterChecksum.length, 64, 'masterChecksum must be 64-char SHA-256');
  assert.ok(getTotalCertifiedCartridges() >= 50, `Expected at least 50 official cartridges, found ${getTotalCertifiedCartridges()}`);
  testCount += 5;
  console.log(`   ✅ Master registry verified: ${getTotalCertifiedCartridges()} cartridges registered under authority seal.\n`);

  // 2. Physical File Integrity Invariants
  console.log('2. Verifying Physical Cartridges on Disk against Signed Hashes...');
  const files = fs.readdirSync(CARTRIDGES_DIR);
  const astFiles = files.filter(f => f.endsWith('.ast'));

  for (const astFile of astFiles) {
    const id = astFile.replace(/\.ast$/, '');
    const astPath = path.join(CARTRIDGES_DIR, astFile);
    const astContent = fs.readFileSync(astPath, 'utf8');

    // Quick lookup check
    assert.strictEqual(isNativeCartridge(id), true, `Cartridge "${id}" must be registered as native`);
    const record = getRegisteredRecord(id);
    assert.ok(record, `Record for "${id}" must exist`);

    // Verify integrity using client verifier
    const result = await verifyCartridgeIntegrity(id, astContent);
    assert.strictEqual(result.status, 'verified-native', `Cartridge "${id}" must have verified-native status`);
    assert.strictEqual(result.isNative, true, `Cartridge "${id}" must be flagged as native`);
    assert.strictEqual(result.isVerified, true, `Cartridge "${id}" must be cryptographically verified`);
    assert.strictEqual(result.authority, CURRICULUM_AUTHORITY_NAME, `Authority must match for "${id}"`);
    assert.strictEqual(result.computedAstSha256, record!.astSha256, `Computed hash must equal record hash for "${id}"`);

    // Verify seal
    const expectedSeal = await computeAuthoritySeal(id, record!.astSha256, record!.svgSha256);
    assert.strictEqual(result.seal, expectedSeal, `Cryptographic authority seal mismatch for "${id}"`);

    testCount += 7;
  }
  console.log(`   ✅ All ${astFiles.length} disk cartridges cryptographically validated with 0 errors.\n`);

  // 3. Tamper Detection Invariants
  console.log('3. Testing Tamper Detection Engine...');
  const testCartridgeId = 'calculus-curves';
  const realAstPath = path.join(CARTRIDGES_DIR, `${testCartridgeId}.ast`);
  const originalAst = fs.readFileSync(realAstPath, 'utf8');

  // Tamper by 1 byte (add a whitespace)
  const tamperedAst = originalAst + ' ';
  const tamperedResult = await verifyCartridgeIntegrity(testCartridgeId, tamperedAst);

  assert.strictEqual(tamperedResult.status, 'tampered', 'Tampered AST must return status "tampered"');
  assert.strictEqual(tamperedResult.isVerified, false, 'Tampered AST must not be verified');
  assert.strictEqual(tamperedResult.isNative, true, 'Tampered AST is still recognized as an official cartridge ID');
  assert.strictEqual(tamperedResult.badgeText, 'Cartridge Modified', 'Tampered badge text must warn "Cartridge Modified"');
  assert.notStrictEqual(tamperedResult.computedAstSha256, tamperedResult.expectedAstSha256, 'Hashes must differ');
  testCount += 5;
  console.log('   ✅ 1-byte tamper successfully intercepted and flagged with warning.\n');

  // 4. External / Community Cartridge Invariants
  console.log('4. Testing Third-Party / Community Cartridge Handling...');
  const externalResult = await verifyCartridgeIntegrity('unregistered-user-sim-123', '(:scene :id "unregistered")');
  assert.strictEqual(externalResult.status, 'unverified-external', 'Unknown ID must return unverified-external');
  assert.strictEqual(externalResult.isNative, false, 'Unknown ID is not native');
  assert.strictEqual(externalResult.isVerified, false, 'Unknown ID cannot be verified');
  assert.strictEqual(externalResult.badgeText, 'Community Cartridge', 'Badge text must say Community Cartridge');
  testCount += 4;
  console.log('   ✅ Third-party and external cartridges correctly classified as Community (Unsigned).\n');

  // 5. Short Hash Formatting Invariant
  console.log('5. Testing Hash Fingerprint Formatting...');
  const sampleHash = '2aa7f3547449677d462357ca7a27a5d68744e1035a96d5a269cc816121776fd5';
  const shortSnippet = formatShortHash(sampleHash);
  assert.strictEqual(shortSnippet, '2aa7f3...776fd5', 'Format short hash must produce 6 prefix + ... + 6 suffix');
  testCount += 1;
  console.log(`   ✅ Fingerprint snippet verified: ${shortSnippet}\n`);

  console.log(`🎉 SUCCESS: All ${testCount} cartridge integrity & checksum invariant tests passed cleanly!`);
}

runIntegrityTests().catch((err) => {
  console.error('❌ Cartridge integrity test failure:', err);
  process.exit(1);
});
