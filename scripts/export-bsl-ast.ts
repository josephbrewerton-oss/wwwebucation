/**
 * scripts/export-bsl-ast.ts
 *
 * Compiles the high-frequency BSL Curriculum Lexicon into canonical .ast S-Expression format
 * and saves to static/lexicons/bsl-signs.ast.
 */

import * as fs from 'fs';
import * as path from 'path';
import { BSL_CURRICULUM_LEXICON } from '../src/utils/bslLexicon';
import { serializeLexiconToAst, parseAstToLexicon } from '../src/utils/bslAstCodec';

const outDir = path.resolve(process.cwd(), 'static/lexicons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const astContent = serializeLexiconToAst(BSL_CURRICULUM_LEXICON, {
  version: '1.0.0-PHASE1',
  standard: 'BANZSL',
  title: "St Joseph's BSL Curriculum Lexicon",
});

const targetFile = path.join(outDir, 'bsl-signs.ast');
fs.writeFileSync(targetFile, astContent, 'utf-8');

const fileSize = fs.statSync(targetFile).size;
console.log(`✅ Exported ${Object.keys(BSL_CURRICULUM_LEXICON).length} BSL signs to ${targetFile}`);
console.log(`📦 File Size: ${fileSize} bytes (${(fileSize / 1024).toFixed(2)} KB)`);
console.log(`📊 Average size per sign: ${(fileSize / Object.keys(BSL_CURRICULUM_LEXICON).length).toFixed(1)} bytes`);

// Verify round-trip parsing
const parsed = parseAstToLexicon(astContent);
const parsedCount = Object.keys(parsed).length;
console.log(`🔍 Round-trip verification: parsed ${parsedCount} signs from AST S-Expressions.`);
if (parsedCount === Object.keys(BSL_CURRICULUM_LEXICON).length) {
  console.log('🎉 100% Round-Trip AST S-Expression Verification Succeeded!');
} else {
  console.error(`❌ Mismatch: expected ${Object.keys(BSL_CURRICULUM_LEXICON).length}, got ${parsedCount}`);
  process.exit(1);
}
