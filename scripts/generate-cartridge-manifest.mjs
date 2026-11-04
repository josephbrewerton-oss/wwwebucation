import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const BYTECODE_DIR = './static/player/bytecode';
const OUT_FILE = './static/player/cartridge-manifest.json';

const cartridges = readdirSync(BYTECODE_DIR)
  .filter(file => extname(file) === '.astb' || extname(file) === '.json')
  .map(file => {
    const fullPath = join(BYTECODE_DIR, file);
    const stats = statSync(fullPath);
    const slug = basename(file, extname(file));
    
    return {
      id: slug,
      filename: file,
      sizeBytes: stats.size,
      title: slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    };
  });

writeFileSync(OUT_FILE, JSON.stringify(cartridges, null, 2));
console.log(`Manifest built: ${cartridges.length} cartridges indexed.`);
