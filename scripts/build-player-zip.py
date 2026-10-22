#!/usr/bin/env python3
"""
scripts/build-player-zip.py

Packages the static/player engine, scenes, bytecode, and documentation into
static/lumina-vector-player.zip and static/player/lumina-vector-player.zip.
Ensures zero-dependency offline distribution is always current and functional.
"""

import os
import zipfile
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAYER_DIR = os.path.join(ROOT_DIR, 'static', 'player')
STATIC_ZIP = os.path.join(ROOT_DIR, 'static', 'lumina-vector-player.zip')
PLAYER_ZIP = os.path.join(PLAYER_DIR, 'lumina-vector-player.zip')
DIST_ZIP = os.path.join(ROOT_DIR, 'dist', 'lumina-vector-player.zip')
DIST_PLAYER_ZIP = os.path.join(ROOT_DIR, 'dist', 'player', 'lumina-vector-player.zip')

def build_zip():
    print('📦 Packaging Lumina Vector Player Offline Suite...')
    temp_zip = STATIC_ZIP + '.tmp'
    if os.path.exists(temp_zip):
        os.remove(temp_zip)

    count = 0
    with zipfile.ZipFile(temp_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(PLAYER_DIR):
            for file in files:
                # Do not re-pack existing zip bundles
                if file.endswith('.zip') or file.endswith('.tmp'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, PLAYER_DIR)
                zf.write(full_path, arcname=rel_path)
                count += 1

    os.replace(temp_zip, STATIC_ZIP)
    shutil.copy2(STATIC_ZIP, PLAYER_ZIP)
    print(f'✅ Successfully packaged {count} files into {STATIC_ZIP} ({os.path.getsize(STATIC_ZIP):,} bytes)')

    # Also copy to dist if dist exists
    if os.path.isdir(os.path.join(ROOT_DIR, 'dist')):
        shutil.copy2(STATIC_ZIP, DIST_ZIP)
        if os.path.isdir(os.path.join(ROOT_DIR, 'dist', 'player')):
            shutil.copy2(STATIC_ZIP, DIST_PLAYER_ZIP)
        print('✅ Synced ZIP bundle to dist/ output directory')

if __name__ == '__main__':
    build_zip()
