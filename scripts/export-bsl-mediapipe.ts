/**
 * scripts/export-bsl-mediapipe.ts
 *
 * Exports signs from `BSL_CURRICULUM_LEXICON` into standard MediaPipe Holistic JSON
 * (33 pose + 21 left hand + 21 right hand landmarks at 25 fps) for external benchmarking
 * against open BSL recognition models (e.g., `signon-project/slr-poseformer-bsl`, BOBSL).
 *
 * Usage:
 *   npx tsx scripts/export-bsl-mediapipe.ts --signs HELLO,THANK,WATER --fps 25 --out tmp/bsl-mediapipe.json
 *   npx tsx scripts/export-bsl-mediapipe.ts --all --out tmp/bsl-mediapipe-all.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { BSL_CURRICULUM_LEXICON, lookupBslSign } from '../src/utils/bslLexicon';
import { bslSignToMediaPipeSequence, type MediaPipeSignSequence } from '../src/utils/bslMediaPipeMapper';

function parseArgs(argv: string[]) {
  const args: { signs?: string[]; all: boolean; fps: number; out: string } = {
    all: false,
    fps: 25,
    out: path.join(process.cwd(), 'tmp', 'bsl-mediapipe-export.json'),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') args.all = true;
    else if (a === '--signs' && argv[i + 1]) {
      args.signs = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--fps' && argv[i + 1]) {
      const parsed = Number(argv[++i]);
      if (Number.isFinite(parsed) && parsed > 0) args.fps = parsed;
    } else if (a === '--out' && argv[i + 1]) {
      args.out = path.resolve(process.cwd(), argv[++i]);
    }
  }
  return args;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const targetSigns = opts.all
    ? Object.values(BSL_CURRICULUM_LEXICON)
    : (opts.signs && opts.signs.length > 0
        ? opts.signs.map((w) => lookupBslSign(w)).filter((s): s is NonNullable<typeof s> => Boolean(s))
        : Object.values(BSL_CURRICULUM_LEXICON).slice(0, 20));

  const sequences: MediaPipeSignSequence[] = targetSigns.map((sign) =>
    bslSignToMediaPipeSequence(sign, { fps: opts.fps })
  );

  const outDir = path.dirname(opts.out);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const payload = {
    schema: 'mediapipe-holistic-bundle/1.0',
    generatedAt: new Date().toISOString(),
    fps: opts.fps,
    signCount: sequences.length,
    totalFrames: sequences.reduce((acc, s) => acc + s.frameCount, 0),
    sequences,
  };

  fs.writeFileSync(opts.out, JSON.stringify(payload, null, 2), 'utf8');
  console.log(
    `✅ Exported ${payload.signCount} BSL signs (${payload.totalFrames} frames @ ${opts.fps} fps) to ${opts.out}`
  );
}

main();
