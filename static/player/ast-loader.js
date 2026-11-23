/**
 * static/player/ast-loader.js
 *
 * St Joseph's AST Vector Media Player — Cartridge Loader & Offline Vault Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated I/O & security maintenance:
 * - IndexedDB offline cartridge vault (getFromVaultIndexedDb, putIntoVaultIndexedDb)
 * - Scene/preset orchestration & cartridge mounting (loadScene, setPreset, loadSceneData, mountCartridge)
 * - Composes peer modules ASTFileIngest (ast-file-ingest.js) & ASTSvgIntegrity (ast-svg-integrity.js)
 *   onto ASTSceneLoader when loaded so ast-engine.js preserves its full loader contract.
 */

(function (global) {
  'use strict';

  class ASTSceneLoaderMethods {
    async getFromVaultIndexedDb(presetId) {
      if (typeof indexedDB === 'undefined' && (!global.ASTLocalStore || typeof global.ASTLocalStore.getVaultCartridges !== 'function')) {
        return null;
      }
      if (global.ASTLocalStore && typeof global.ASTLocalStore.getVaultCartridges === 'function') {
        try {
          const all = await global.ASTLocalStore.getVaultCartridges();
          const hit = Array.isArray(all) ? all.find(item => item && item.id === presetId) : null;
          if (hit) return hit;
        } catch (_) {}
      }
      if (typeof indexedDB === 'undefined') return null;
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open('EdgeLearningEngineDB', 6);
          req.onerror = () => resolve(null);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('cartridges_vault')) {
              db.createObjectStore('cartridges_vault', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('app_state')) {
              db.createObjectStore('app_state', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('curriculum_packs')) {
              db.createObjectStore('curriculum_packs', { keyPath: 'id' });
            }
          };
          req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('cartridges_vault')) {
              db.close();
              return resolve(null);
            }
            const tx = db.transaction('cartridges_vault', 'readonly');
            const store = tx.objectStore('cartridges_vault');
            const getReq = store.get(presetId);
            getReq.onsuccess = () => {
              const res = getReq.result;
              db.close();
              resolve(res || null);
            };
            getReq.onerror = () => {
              db.close();
              resolve(null);
            };
          };
        } catch {
          resolve(null);
        }
      });
    }

    async putIntoVaultIndexedDb(record) {
      if (!record || !record.id) return;
      const payload = { ...record, updatedAt: Date.now() };
      if (global.ASTLocalStore && typeof global.ASTLocalStore.putVaultCartridge === 'function') {
        try {
          await global.ASTLocalStore.putVaultCartridge(payload);
          return;
        } catch (_) {}
      }
      if (typeof indexedDB === 'undefined') return;
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open('EdgeLearningEngineDB', 6);
          req.onerror = () => resolve();
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('cartridges_vault')) {
              db.createObjectStore('cartridges_vault', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('app_state')) {
              db.createObjectStore('app_state', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('curriculum_packs')) {
              db.createObjectStore('curriculum_packs', { keyPath: 'id' });
            }
          };
          req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('cartridges_vault')) {
              db.close();
              return resolve();
            }
            const tx = db.transaction('cartridges_vault', 'readwrite');
            const store = tx.objectStore('cartridges_vault');
            store.put(payload);
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => {
              db.close();
              resolve();
            };
          };
        } catch {
          resolve();
        }
      });
    }

    getFromHostOrLocalIndex(presetId) {
      if (!presetId) return null;
      const target = String(presetId).trim();
      const targetLower = target.toLowerCase();
      // 1. Check same-origin host cartridgeStore RAM cache (zero latency, zero IDB race)
      try {
        const lookup =
          (typeof window !== 'undefined' && window.parent && window.parent !== window && typeof window.parent.__AST_CARTRIDGE_VAULT_LOOKUP__ === 'function'
            ? window.parent.__AST_CARTRIDGE_VAULT_LOOKUP__
            : null) ||
          (typeof window !== 'undefined' && typeof window.__AST_CARTRIDGE_VAULT_LOOKUP__ === 'function'
            ? window.__AST_CARTRIDGE_VAULT_LOOKUP__
            : null);
        if (lookup) {
          const hit = lookup(target);
          if (hit && (hit.svgMarkup || hit.svgText || hit.astSource || hit.astText)) {
            return hit;
          }
        }
      } catch (_) {}
      // 2. Check ASTLocalStore compact custom cartridge index (app_state)
      try {
        const store = global.ASTLocalStore || (typeof window !== 'undefined' ? window.ASTLocalStore : null);
        if (store && typeof store.getItem === 'function') {
          const raw = store.getItem('stj_custom_cartridges_v1');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const hit = list.find((c) => c && (c.id === target || String(c.id || '').toLowerCase() === targetLower));
              if (hit && (hit.svgMarkup || hit.svgText || hit.astSource || hit.astText)) {
                return hit;
              }
            }
          }
        }
      } catch (_) {}
      return null;
    }

    _isVaultUrlHint(presetId) {
      try {
        if (typeof window === 'undefined' || !window.location || !window.location.search) return false;
        const p = new URLSearchParams(window.location.search);
        const isVaultFlag = p.get('vault') === '1' || p.get('custom') === '1';
        if (!isVaultFlag) return false;
        const urlPreset = p.get('preset') || p.get('app');
        return !urlPreset || urlPreset === presetId;
      } catch (_) {
        return false;
      }
    }

    async loadScene(presetId, shouldPlay = false, forceReload = false) {
      this.cancelSpeech();
      const normalizedId = (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.normalizeId === 'function')
        ? global.ASTSceneRegistry.normalizeId(presetId)
        : presetId;
      presetId = normalizedId;

      // Custom Cartridge Protection Guard: do not allow a stale boot fallback ('welcome') or duplicate preset lookup
      // to overwrite a custom SWF / Local Vault cartridge just mounted directly via postMessage (LOAD_CUSTOM_CARTRIDGE)
      const hasRenderableContent = this.scene && (this.scene.svgText || this.scene.render || this.scene.mount || (this.scene.keyframes && this.scene.keyframes.length));
      if (!forceReload && this._customMountedPresetId && this._mountedSceneId === this._customMountedPresetId && hasRenderableContent) {
        if (presetId === this._customMountedPresetId) {
          if ((shouldPlay || this.isContinuousSim) && !this.isPlaying) {
            this.play();
          }
          return this.scene;
        }
        if (presetId === 'welcome' && (Date.now() - (this._customMountedAt || 0)) < 5000) {
          return this.scene;
        }
      }

      // Deduplication Guard: If this exact preset is already mounted and ready, avoid re-fetching or wiping container
      if (!forceReload && this.activePresetId === presetId && this._mountedSceneId === presetId && hasRenderableContent) {
        if ((shouldPlay || this.isContinuousSim) && !this.isPlaying) {
          this.play();
        } else if (shouldPlay === false && !this.isContinuousSim && this.isPlaying) {
          this.pause();
        }
        return this.scene;
      }

      // In-flight Load Guard: If this exact preset is already being fetched, await the existing promise
      if (!forceReload && this._inFlightLoadPresetId === presetId && this._inFlightLoadPromise) {
        const existingScene = await this._inFlightLoadPromise;
        if ((shouldPlay || this.isContinuousSim) && !this.isPlaying) {
          this.play();
        } else if (shouldPlay === false && !this.isContinuousSim && this.isPlaying) {
          this.pause();
        }
        return existingScene;
      }

      const loadSeq = (this._loadSequence = (this._loadSequence || 0) + 1);
      this._inFlightLoadPresetId = presetId;
      const loadPromise = (async () => {
        // Fast-path for built-in Welcome Simulator (Zero Network Overhead)
        if (presetId === 'welcome') {
          const welcomeScene = this.getBuiltinWelcomeScene();
          this.activePresetId = 'welcome';
          this.scene = welcomeScene;
          this.durationSec = welcomeScene.duration || 16.0;
          this.progress = 0.0;
          this.lastSpokenIndex = -1;
          this.resetCamera();
          if (this.container) {
            if (typeof this.container.replaceChildren === 'function') this.container.replaceChildren();
            else this.container.textContent = '';
            this.mountSceneAsset(welcomeScene, this.container);
          }
          this.resetVars();
          try {
            this.applyBindings(0);
            this.render(0);
          } catch (_) {}
          this.emit('presetchange', {
            preset: 'welcome',
            title: welcomeScene.title,
            stage: welcomeScene.stage,
            duration: this.durationSec,
            has3D: false,
            hasInteractive: true,
            interactive: welcomeScene.interactive,
            keyframes: welcomeScene.keyframes || []
          });
          this.notifyParent({
            type: 'PRESETCHANGE',
            preset: 'welcome',
            title: welcomeScene.title,
            stage: welcomeScene.stage,
            duration: this.durationSec,
            has3D: false,
            hasInteractive: true,
            keyframes: welcomeScene.keyframes || []
          });
          if (shouldPlay) this.play();
          return welcomeScene;
        }

        this.activePresetId = presetId;
        this.progress = 0.0;
        this.lastSpokenIndex = -1;
        this.resetCamera();

        // Clear active collections immediately to prevent race conditions during load
        this.active3DItems = [];
        this.active3DNodes = [];
        this.active3DLines = [];
        this.active3DRings = [];
        this.active3DPolygons = [];
        this.activeBindings = [];
        this._cachedElements = null;
        this._mountedSceneId = null;

        // Note: Do not clear container DOM here; preserve current apparatus until new scene is ready

        let scene = this.sceneCache[presetId];

        if (!scene) {
          let registryScene = (global.ASTSceneRegistry && global.ASTSceneRegistry.get(presetId)) || (global.ASTScenes && global.ASTScenes[presetId]) || {};
          let svgText = registryScene.svgMarkup || registryScene.svgText || '';
          let astText = registryScene.astSource || registryScene.astText || '';
          let parsedAst = null;

          // 1. Check host cartridgeStore RAM cache & IndexedDB Cartridge Vault FIRST (Zero Network Overhead & Zero 404s)
          let offlineVaultFallback = null;
          let officialRegistryRecord = null;
          let isLocalVaultCustom = false;
          let resolvedVaultSource = 'builtin';

          const hostVaultHit = this.getFromHostOrLocalIndex(presetId);
          if (hostVaultHit && (hostVaultHit.svgMarkup || hostVaultHit.svgText || hostVaultHit.astSource || hostVaultHit.astText)) {
            svgText = hostVaultHit.svgMarkup || hostVaultHit.svgText || svgText;
            astText = hostVaultHit.astSource || hostVaultHit.astText || astText;
            if (!astText && svgText && (svgText.includes('(:scene') || svgText.includes('(:cartridge'))) {
              astText = svgText;
            }
            if (hostVaultHit.source && hostVaultHit.source !== 'builtin') {
              isLocalVaultCustom = true;
              resolvedVaultSource = hostVaultHit.source;
            }
            if (!registryScene.title && hostVaultHit.title) {
              registryScene = { ...registryScene, ...hostVaultHit };
            }
          }

          if (!isLocalVaultCustom) {
            try {
              const reg = await this._loadChecksumRegistry();
              if (reg && reg.cartridges) {
                officialRegistryRecord = reg.cartridges[String(presetId).trim().toLowerCase()] || null;
              }
            } catch (_) {}
          }

          if (!svgText || !astText) {
            try {
              const vaultItem = await this.getFromVaultIndexedDb(presetId);
              if (vaultItem && (vaultItem.svgMarkup || vaultItem.svgText || vaultItem.astSource || vaultItem.astText)) {
                const isBuiltinCache = !vaultItem.source || vaultItem.source === 'builtin';
                const isStaleBuiltin = Boolean(
                  isBuiltinCache &&
                  officialRegistryRecord &&
                  officialRegistryRecord.seal &&
                  vaultItem.seal !== officialRegistryRecord.seal
                );
                if (isStaleBuiltin) {
                  // Keep as offline fallback only; allow fresh signed fetch below to refresh stale builtin copy
                  offlineVaultFallback = vaultItem;
                } else {
                  svgText = vaultItem.svgMarkup || vaultItem.svgText || svgText;
                  astText = vaultItem.astSource || vaultItem.astText || astText;
                  if (!astText && svgText && (svgText.includes('(:scene') || svgText.includes('(:cartridge'))) {
                    astText = svgText;
                  }
                  if (!isBuiltinCache) {
                    isLocalVaultCustom = true;
                    resolvedVaultSource = vaultItem.source;
                  }
                  if (!registryScene.title && vaultItem.title) {
                    registryScene = { ...registryScene, ...vaultItem };
                  }
                }
              }
            } catch (_) {}
          }

          if (this._loadSequence !== loadSeq) {
            return this.scene;
          }

          const isVaultOnlyPreset = Boolean(
            isLocalVaultCustom ||
            this._isVaultUrlHint(presetId) ||
            (!officialRegistryRecord && /^(?:swf|flash|custom|local)-/i.test(String(presetId)))
          );

          // 2. If not in registry or Local Vault (and NOT a Local Vault / custom SWF preset), fetch dynamically
          if (!isVaultOnlyPreset && (!svgText || !astText) && typeof fetch !== 'undefined') {
            const currentDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
              ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
              : './';

            // Resolve base repository prefix dynamically (zero hardcoded repo names)
            let repoBase = '/';
            if (typeof window !== 'undefined') {
              if (window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__) {
                repoBase = String(window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__).replace(/\/+$/, '') + '/';
              } else if (typeof document !== 'undefined' && document.querySelector('base')?.getAttribute('href')) {
                repoBase = document.querySelector('base').getAttribute('href').replace(/\/+$/, '') + '/';
              } else if (window.location) {
                const path = window.location.pathname || '/';
                const host = window.location.hostname || '';
                const playerIdx = path.indexOf('/player/');
                if (playerIdx >= 0) {
                  repoBase = path.slice(0, playerIdx + 1);
                } else if (host === 'github.io' || host.endsWith('.github.io')) {
                  const seg = path.split('/').filter(Boolean)[0];
                  repoBase = seg ? `/${seg}/` : '/';
                } else if (currentDir && currentDir !== '/' && (path.endsWith('/player.html') || path.endsWith('/worker.html'))) {
                  repoBase = currentDir;
                }
              }
            }

            const sceneId = presetId;
            const isInPlayerSubdir = currentDir.endsWith('/player/');
            const resolveManifestUrl = (relPath) => {
              const clean = relPath.replace(/^(?:\.\/|\.\.\/|static\/)/, '');
              if (clean.startsWith('player/')) {
                const sub = clean.slice('player/'.length);
                return [`${repoBase}${clean}`, isInPlayerSubdir ? `./${sub}` : `./${clean}`];
              }
              return [
                `${repoBase}${clean}`,
                `./${clean}`,
                isInPlayerSubdir ? `../${clean}` : null
              ].filter(Boolean);
            };

            const fetchAsset = async (ext) => {
              const isBinary = ext === 'astb';
              const candidateUrls = [];

              if (isBinary) {
                if (registryScene?.astbFile) {
                  candidateUrls.push(...resolveManifestUrl(registryScene.astbFile));
                } else if (!registryScene?.astFile || !registryScene.astFile.endsWith('.ast') || registryScene.astFile.includes('cartridges/')) {
                  candidateUrls.push(
                    `${repoBase}bytecode/${sceneId}.astb`,
                    `./bytecode/${sceneId}.astb`,
                    isInPlayerSubdir ? `../bytecode/${sceneId}.astb` : null
                  );
                }
              } else if (ext === 'svg') {
                if (registryScene?.svgFile) {
                  candidateUrls.push(...resolveManifestUrl(registryScene.svgFile));
                } else {
                  candidateUrls.push(
                    `${repoBase}cartridges/${sceneId}.svg`,
                    `./cartridges/${sceneId}.svg`,
                    isInPlayerSubdir ? `../cartridges/${sceneId}.svg` : null
                  );
                }
              } else if (ext === 'ast') {
                if (registryScene?.astFile) {
                  candidateUrls.push(...resolveManifestUrl(registryScene.astFile));
                } else {
                  candidateUrls.push(
                    `${repoBase}cartridges/${sceneId}.ast`,
                    `./cartridges/${sceneId}.ast`,
                    isInPlayerSubdir ? `../cartridges/${sceneId}.ast` : null,
                    `${repoBase}docs/${sceneId}.ast`
                  );
                }
              }

              for (const url of Array.from(new Set(candidateUrls.filter(Boolean)))) {
                try {
                  const res = await fetch(url);
                  if (!res.ok) continue;

                if (isBinary) {
                  const buf = await res.arrayBuffer();
                  if (buf && buf.byteLength >= 16) {
                    const u8 = new Uint8Array(buf, 0, 4);
                    if (u8[0] === 0x41 && u8[1] === 0x53 && u8[2] === 0x54 && u8[3] === 0x42) {
                      return buf;
                    }
                  }
                  continue;
                }

                const text = await res.text();
                const trimmed = text.trim();

                // Guard against fallback HTML 200 responses
                if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
                  continue;
                }

                // Validate payload matches requested file extension
                if (ext === 'svg' && !trimmed.includes('<svg')) {
                  continue;
                }
                if (
                  ext === 'ast' &&
                  !trimmed.startsWith('(') &&
                  !trimmed.startsWith(';') &&
                  !trimmed.includes('(:scene') &&
                  !trimmed.includes('(:cartridge') &&
                  !trimmed.includes('<svg')
                ) {
                  continue;
                }

                // Return exact untrimmed text so runtime SHA-256 verification matches signed disk digests byte-for-byte
                return text;
              } catch (_) {
                // Fall through to next candidate URL
              }
            }

            return null;
          };

          parsedAst = null;
          var loadedAstbBuffer = null;
          try {
            const [foundBytecode, foundSvg] = await Promise.all([
              fetchAsset('astb'),
              fetchAsset('svg')
            ]);
            if (foundSvg) svgText = foundSvg;
            if (foundBytecode) {
              loadedAstbBuffer = foundBytecode;
              try {
                parsedAst = this.decompileBytecode(foundBytecode);
                if (!svgText && parsedAst && parsedAst.svgMarkup) {
                  svgText = parsedAst.svgMarkup;
                }
              } catch (err) {
                console.warn('[AST Engine] Bytecode decompression failed, falling back to AST for', presetId, err);
              }
            }
            if (
              !parsedAst ||
              (!parsedAst.completeBinary && (
                (!parsedAst.uiControls && (!parsedAst.inputs || parsedAst.inputs.length === 0)) ||
                (parsedAst.inputs && parsedAst.inputs.some(i => i && ((i.type === 'select' && (!i.options || i.options.length === 0)) || (i.min === 0 && i.max === 0 && !i.options)))) ||
                (parsedAst.vars && Object.values(parsedAst.vars).some(v => typeof v === 'string')) ||
                !parsedAst.bindings || parsedAst.bindings.length === 0 ||
                !parsedAst.computed || parsedAst.computed.length === 0 ||
                !parsedAst.gestures || parsedAst.gestures.length === 0 ||
                parsedAst.gestures.some(g => g && g.fromBytecode)
              ))
            ) {
              const foundAst = await fetchAsset('ast');
              if (foundAst) {
                astText = foundAst;
                if (!svgText && foundAst.includes('<svg')) {
                  svgText = foundAst;
                }
              }
            }
          } catch (e) {
            console.warn('[AST Engine] Asset fetch notice for:', presetId, e);
          }
        }

        // Offline air-gap fallback to cached builtin vault entry if network fetch was unavailable
        if (!svgText && offlineVaultFallback) {
          svgText = offlineVaultFallback.svgMarkup || offlineVaultFallback.svgText || '';
          astText = offlineVaultFallback.astSource || offlineVaultFallback.astText || '';
          if (!registryScene.title && offlineVaultFallback.title) {
            registryScene = { ...registryScene, ...offlineVaultFallback };
          }
        }

        // Secondary fallback for core cartridges if network fetch failed on GitHub Pages
        if (!svgText && global.ASTSceneRegistry) {
          const fb = global.ASTSceneRegistry.get(presetId);
          if (fb && (fb.svgMarkup || fb.svgText)) {
            svgText = fb.svgMarkup || fb.svgText || '';
            astText = fb.astSource || fb.astText || '';
          }
        }

        if (this._loadSequence !== loadSeq) {
          return this.scene;
        }
        const isNotFound = !svgText && !astText && !parsedAst && !registryScene.mount && !registryScene.render && (!registryScene.keyframes || !registryScene.keyframes.length);
        if (isNotFound) {
          // If the host signaled this preset is arriving from Local Vault via LOAD_CUSTOM_CARTRIDGE,
          // wait cleanly without overwriting the stage with Welcome Simulator.
          if (isVaultOnlyPreset) {
            return this.scene;
          }
          console.warn(`[AST Engine] Scene "${presetId}" could not be located in registry or fetched from asset path. Gracefully falling back to built-in Welcome Simulator.`);
          return this.loadScene('welcome', shouldPlay);
        }

        if (astText) {
          try {
            const textParsed = this.parseAst(astText);
            if (textParsed) {
              if (!parsedAst) {
                parsedAst = textParsed;
              } else {
                // Seamlessly merge rich interactive elements that compact bytecode may lack
                const needsRichControls = !parsedAst.uiControls || parsedAst.uiControls.length === 0 ||
                  (Array.isArray(textParsed.uiControls) && textParsed.uiControls.length > parsedAst.uiControls.length) ||
                  (Array.isArray(textParsed.uiControls) && textParsed.uiControls.some(c => c && c.type === 'select' && c.options && c.options.length > 0) && !parsedAst.uiControls.some(c => c && c.type === 'select' && c.options && c.options.length > 0));
                if (needsRichControls && textParsed.uiControls) {
                  parsedAst.uiControls = textParsed.uiControls;
                }
                if (((!parsedAst.inputs || parsedAst.inputs.length === 0) || needsRichControls) && textParsed.inputs && textParsed.inputs.length > 0) {
                  parsedAst.inputs = textParsed.inputs;
                }
                if (textParsed.vars && typeof textParsed.vars === 'object') {
                  parsedAst.vars = Object.assign({}, parsedAst.vars || {}, textParsed.vars);
                }
                if ((!parsedAst.computed || parsedAst.computed.length === 0) && textParsed.computed) {
                  parsedAst.computed = textParsed.computed;
                }
                if ((!parsedAst.bindInputs || parsedAst.bindInputs.length === 0) && textParsed.bindInputs) {
                  parsedAst.bindInputs = textParsed.bindInputs;
                }
                if (textParsed.emitters && textParsed.emitters.length > 0) {
                  parsedAst.emitters = textParsed.emitters;
                }
                if ((!parsedAst.stateMachines || parsedAst.stateMachines.length === 0) && textParsed.stateMachines) {
                  parsedAst.stateMachines = textParsed.stateMachines;
                }
                if (!parsedAst.physics && textParsed.physics) {
                  parsedAst.physics = textParsed.physics;
                }
                if (
                  textParsed.gestures &&
                  textParsed.gestures.length > 0 &&
                  (
                    !parsedAst.gestures ||
                    parsedAst.gestures.some(g => g && g.fromBytecode) ||
                    textParsed.gestures.length >= parsedAst.gestures.length
                  )
                ) {
                  parsedAst.gestures = textParsed.gestures;
                }
                if (textParsed.bindings && textParsed.bindings.length > 0 && (!parsedAst.bindings || parsedAst.bindings.length === 0 || textParsed.bindings.length >= parsedAst.bindings.length || textParsed.bindings.some(b => b.type === 'var-update'))) {
                  parsedAst.bindings = textParsed.bindings;
                }
                if (textParsed.scopes && textParsed.scopes.length > 0 && (!parsedAst.scopes || parsedAst.scopes.length === 0)) {
                  parsedAst.scopes = textParsed.scopes;
                }
                if (textParsed.ledgers && textParsed.ledgers.length > 0 && (!parsedAst.ledgers || parsedAst.ledgers.length === 0)) {
                  parsedAst.ledgers = textParsed.ledgers;
                }
                if (textParsed.skills && textParsed.skills.length > 0) {
                  parsedAst.skills = textParsed.skills;
                }
                if (textParsed.definedSkills && !parsedAst.definedSkills) {
                  parsedAst.definedSkills = textParsed.definedSkills;
                }
                if (textParsed.controls && !parsedAst.controls) {
                  parsedAst.controls = textParsed.controls;
                }
                if (textParsed.bootSound && !parsedAst.bootSound) {
                  parsedAst.bootSound = textParsed.bootSound;
                }
                if (textParsed.cameraStops && (!parsedAst.cameraStops || parsedAst.cameraStops.length === 0)) {
                  parsedAst.cameraStops = textParsed.cameraStops;
                }
                if (textParsed.quests && !parsedAst.quests) {
                  parsedAst.quests = textParsed.quests;
                }
              }
            }
          } catch (err) {
            console.warn('[AST Engine] Error parsing AST for', presetId, err);
            this.emit('error', { type: 'AST_PARSE_ERROR', presetId, message: err.message });
          }
        }
        const has3D = Boolean(
          (parsedAst && parsedAst.has3D) ||
          (parsedAst && parsedAst.camera) ||
          (registryScene && registryScene.has3D)
        );
        const isInteractiveExplicitlyDisabled = Boolean(parsedAst && parsedAst.interactiveDisabled) || (astText ? (
          /:interactive\s+(false|nil|none)\b/i.test(astText) ||
          /:questions\s+(false|nil|none)\b/i.test(astText) ||
          /:type\s+"App"/i.test(astText) ||
          (/:enabled\s+(false|nil)\b/i.test(astText) && /:interactive/i.test(astText))
        ) : false);

       const resolvedType = (parsedAst && (parsedAst.type || parsedAst.cartridgeType)) || registryScene.type || 'Sim';
        const hasAstCheckpoints = Boolean(
          (parsedAst && parsedAst.checkpoints && parsedAst.checkpoints.length > 0) ||
          (parsedAst && parsedAst.interactive && parsedAst.interactive.checkpoints && parsedAst.interactive.checkpoints.length > 0)
        );
        const shouldHaveQuestions = !isInteractiveExplicitlyDisabled && resolvedType !== 'App' && hasAstCheckpoints;

        scene = {
          id: presetId,
          type: resolvedType,
          cartridgeType: resolvedType,
          title: (parsedAst && parsedAst.title) || registryScene.title || presetId,
          stage: (parsedAst && parsedAst.stage) || registryScene.stage || 'CURRICULUM',
          duration: (parsedAst && parsedAst.duration) || registryScene.duration || 10.0,
          bootSound: (parsedAst && parsedAst.bootSound) || registryScene.bootSound || null,
          video: (parsedAst && parsedAst.video) || registryScene.video || null,
          videoFit: (parsedAst && parsedAst.videoFit) || registryScene.videoFit || 'contain',
          hasVideo: Boolean((parsedAst && parsedAst.video) || registryScene.video),
          camera: has3D ? ((parsedAst && parsedAst.camera) || registryScene.camera || { distance: 500, pitch: 20, yaw: 0, fov: 60 }) : null,
          cameraStops: (parsedAst && parsedAst.cameraStops) || registryScene.cameraStops || null,
          quests: (parsedAst && parsedAst.quests) || registryScene.quests || null,
          has3D: has3D,
          interactive: shouldHaveQuestions ? ((parsedAst && parsedAst.interactive) || (parsedAst && parsedAst.checkpoints && parsedAst.checkpoints.length ? { checkpoints: parsedAst.checkpoints, hotspots: [] } : null)) : null,
          keyframes: (parsedAst && parsedAst.keyframes && parsedAst.keyframes.length) ? parsedAst.keyframes : (registryScene.keyframes || []),
          subtitles: (parsedAst && parsedAst.subtitles && parsedAst.subtitles.length) ? parsedAst.subtitles : (registryScene.subtitles || []),
          rawBindings: (parsedAst && parsedAst.bindings) || [],
          svgText: svgText,
          astSource: astText || '',
          _rawAstbBuffer: typeof loadedAstbBuffer !== 'undefined' ? loadedAstbBuffer : null,
          mount: registryScene.mount,
          update: registryScene.update,
          render: registryScene.render,
          vars: (parsedAst && parsedAst.vars) || registryScene.vars || {},
          inputs: (parsedAst && parsedAst.inputs) || registryScene.inputs || [],
          uiControls: (parsedAst && parsedAst.uiControls) || registryScene.uiControls || (parsedAst && parsedAst.inputs) || registryScene.inputs || [],
          computed: (parsedAst && parsedAst.computed) || registryScene.computed || [],
          gestures: (parsedAst && parsedAst.gestures) || registryScene.gestures || [],
          skills: (parsedAst && parsedAst.skills) || registryScene.skills || [],
          definedSkills: (parsedAst && parsedAst.definedSkills) || registryScene.definedSkills || null,
          controls: (parsedAst && parsedAst.controls) || registryScene.controls || null,
          physics: (parsedAst && parsedAst.physics) || registryScene.physics || null,
          scopes: (parsedAst && parsedAst.scopes) || registryScene.scopes || [],
          ledgers: (parsedAst && parsedAst.ledgers) || registryScene.ledgers || [],
          actors: (parsedAst && parsedAst.actors) || registryScene.actors || [],
          staticElements: (parsedAst && parsedAst.staticElements) || registryScene.staticElements || [],
          emitters: (parsedAst && parsedAst.emitters) || registryScene.emitters || [],
          bindInputs: (parsedAst && parsedAst.bindInputs) || registryScene.bindInputs || [],
          stateMachines: (parsedAst && parsedAst.stateMachines) || registryScene.stateMachines || []
        };

        this.sceneCache[presetId] = scene;

        // Auto-inflate scene into IndexedDB Cartridge Vault so subsequent loads require 0 network
        this.putIntoVaultIndexedDb({
          id: presetId,
          title: scene.title,
          stage: scene.stage,
          type: scene.type || 'Sim',
          svgMarkup: svgText,
          astSource: astText || '',
          source: isLocalVaultCustom ? resolvedVaultSource : 'builtin',
          seal: isLocalVaultCustom ? '' : ((officialRegistryRecord && officialRegistryRecord.seal) || ''),
          updatedAt: Date.now()
        });

        // Auto-register dynamically found built-in scene (skip fake remote paths for Local Vault / custom SWF presets)
        if (!isLocalVaultCustom && global.ASTSceneRegistry && typeof global.ASTSceneRegistry.register === 'function') {
          global.ASTSceneRegistry.register(presetId, {
            id: presetId,
            title: scene.title,
            stage: scene.stage,
            duration: scene.duration,
            has3D: scene.has3D,
            svgFile: `cartridges/${presetId}.svg`,
            astFile: `cartridges/${presetId}.ast`,
            astbFile: `bytecode/${presetId}.astb`
          });
        }
        this.emit('scene_registered', { id: presetId, scene });
      } // Closes outer cache-miss fetch block

      this.scene = scene;
      this.durationSec = this.scene.duration || 10.0;
      const isSlide = scene.type === 'Slide' || scene.cartridgeType === 'Slide';
      const isContinuousSim = !isSlide && Boolean(
        scene.type === 'Sim' ||
        scene.cartridgeType === 'Sim' ||
        (scene.vars && (Array.isArray(scene.vars) ? scene.vars.length > 0 : Object.keys(scene.vars).length > 0)) ||
        (scene.bindings && scene.bindings.some(b => b.type === '3d-node')) ||
        (scene.rawBindings && scene.rawBindings.some(b => b.type === '3d-node')) ||
        scene.continuous ||
        scene.isContinuous ||
        typeof scene.mount === 'function'
      );
      this.isContinuousSim = isContinuousSim;

      this._applyScenePhysics(scene);

      // Mount into container (or initialize headless buffers if container is null)
      if (this.container) {
        if (typeof this.container.replaceChildren === 'function') this.container.replaceChildren();
        else this.container.textContent = '';
      }
      this.mountSceneAsset(scene, this.container || null);
      this.resetVars();
      this.updateComputedVars(); // Pre-paint computed state evaluation before initial frame

      // Mount the declarative parameter dock directly inside the stage
      this.mountDeclarativeHud(scene);
      
        const activeSvg = this.container && this.container.querySelector('svg');
          if (activeSvg && this.gestureController) {
            this.gestureController.stageSvg = activeSvg;
            this.gestureController.setupEventListeners();
        }

        
      // 1. Hide the "Loading AST Vector Scene..." overlay immediately
      const loaderEl = typeof document !== 'undefined' ? (
                       document.getElementById('loading-indicator') || 
                       document.getElementById('loading') ||
                       document.querySelector('.loading-badge') ||
                       (this.container && this.container.parentElement && this.container.parentElement.querySelector('[id*="load"]'))
                       ) : null;
      if (loaderEl && loaderEl.style) {
        loaderEl.style.display = 'none';
      }
      // 2. Pulse Frame 0 so vector attributes, coordinates, and physics bind immediately
      try {
        if (typeof this.applyBindings === 'function') {
          this.applyBindings(0);
        }
        if (typeof this.render === 'function') {
          this.render(0);
        }
      } catch (bindErr) {
        console.warn('[AST Engine] Initial frame bind notice:', bindErr);
      }
      this._playSceneBootSound(scene);
        
      this.emit('presetchange', {
        preset: this.activePresetId,
        title: this.scene.title,
        stage: this.scene.stage,
        duration: this.durationSec,
        has3D: this.has3D(),
        hasInteractive: Boolean(this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints.length),
        interactive: this.scene.interactive,
        camera: this.scene.camera,
        keyframes: this.scene.keyframes || []
      });

      this._speechStartedOnDevice = false;
      this._pendingAutoSpeech = null;
      this.lastSpokenIndex = -1;

      this.seek(0, true, true);
      if (shouldPlay || isContinuousSim) {
        this.play();
      } else if ((isSlide || !shouldPlay) && this.isPlaying) {
        this.pause();
      }
      this._mountedSceneId = presetId;

      // 3. Notify parent host that cartridge DOM is mounted and ready (with true isPlaying state)
      this.notifyParent({
        type: 'PLAYER_READY',
        preset: this.activePresetId,
        title: this.scene.title,
        stage: this.scene.stage,
        duration: this.durationSec,
        has3D: this.has3D(),
        hasInteractive: Boolean(this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints.length),
        keyframes: this.scene.keyframes || [],
        isPlaying: Boolean(this.isPlaying)
      });

      // Broadcast initial scene subtitle & narration to parent and BSL engine
      const initialSub = this.getCurrentSubtitle() || (this.scene && (this.scene.title + (this.scene.stage ? ` - ${this.scene.stage}` : ''))) || '';
      if (initialSub) {
        this.notifyParent({ type: 'SUBTITLE_UPDATE', text: initialSub });
        if (this.voiceEnabled && !this.muted && this.lastSpokenIndex < 0) {
          this.speakText(initialSub, { isAutoLoad: true });
        }
      }

      // Asynchronously verify cryptographic SHA-256 cartridge authenticity without blocking 60 FPS paint
      this.verifyLoadedCartridge(this.scene).catch(() => {});

      return this.scene;
    })();

    this._inFlightLoadPromise = loadPromise;
    try {
      const res = await loadPromise;
      return res;
    } finally {
      if (this._loadSequence === loadSeq && this._inFlightLoadPresetId === presetId) {
        this._inFlightLoadPromise = null;
        this._inFlightLoadPresetId = null;
      }
    }
  }

  setPreset(presetId, shouldPlay = false) {
    return this.loadScene(presetId, shouldPlay);
  }
  /**
   * Ingests and mounts an in-memory scene object directly without requiring filesystem fetch.
   * Ideal for standalone npm packages and programmatic scene generation.
   * @param {Object} sceneData
   * @param {boolean} shouldPlay
   */
  loadSceneData(sceneData, shouldPlay = false) {
    if (!sceneData || typeof sceneData !== 'object') {
      const err = new Error('[AST Engine] loadSceneData requires a valid scene object');
      this.emit('error', { type: 'INVALID_SCENE_DATA', message: err.message });
      throw err;
    }
    let id = String(sceneData.id || `custom-${Date.now()}`);
    if (id === '__proto__' || id === 'constructor' || id === 'prototype') {
      id = `custom-${Date.now()}`;
    }
    const svgText = sceneData.svgText || sceneData.svgMarkup || sceneData.svg || '';
    let astText = sceneData.astSource || sceneData.astText || sceneData.ast || '';
    if (!astText && svgText && (svgText.includes('(:scene') || svgText.includes('(:cartridge'))) {
      astText = svgText;
    }

    // If raw AST text is provided, parse it to extract rich interactive properties
    let parsedAst = null;
    if (astText && typeof astText === 'string' && (astText.trim().startsWith('(') || astText.includes('(:scene') || astText.includes('(:cartridge'))) {
      try {
        parsedAst = this.parseAst(astText);
      } catch (_) {}
    }

    const resolvedTitle = sceneData.title || (parsedAst && parsedAst.title) || id;
    const resolvedStage = sceneData.stage || (parsedAst && parsedAst.stage) || 'CUSTOM';
    const resolvedType = sceneData.type || (parsedAst && parsedAst.type) || 'Sim';

    this.sceneCache[id] = {
      id,
      title: resolvedTitle,
      stage: resolvedStage,
      type: resolvedType,
      duration: parseFloat(sceneData.duration || (parsedAst && parsedAst.duration)) || 10.0,
      bootSound: sceneData.bootSound || (parsedAst && parsedAst.bootSound) || null,
      camera: sceneData.camera || (parsedAst && parsedAst.camera) || null,
      cameraStops: sceneData.cameraStops || (parsedAst && parsedAst.cameraStops) || null,
      quests: sceneData.quests || (parsedAst && parsedAst.quests) || null,
      has3D: Boolean(sceneData.has3D || sceneData.camera || (parsedAst && parsedAst.has3D)),
      interactive: sceneData.interactive || (parsedAst && parsedAst.interactive) || null,
      keyframes: (sceneData.keyframes && sceneData.keyframes.length) ? sceneData.keyframes : ((parsedAst && parsedAst.keyframes) || []),
      subtitles: (sceneData.subtitles && sceneData.subtitles.length) ? sceneData.subtitles : ((parsedAst && parsedAst.subtitles) || []),
      rawBindings: sceneData.bindings || sceneData.rawBindings || (parsedAst && (parsedAst.rawBindings || parsedAst.bindings)) || [],
      stateMachines: sceneData.stateMachines || (parsedAst && parsedAst.stateMachines) || null,
      emitters: sceneData.emitters || (parsedAst && parsedAst.emitters) || null,
      bindInputs: sceneData.bindInputs || (parsedAst && parsedAst.bindInputs) || null,
      vars: sceneData.vars || (parsedAst && parsedAst.vars) || null,
      inputs: sceneData.uiControls || sceneData.inputs || (parsedAst && (parsedAst.uiControls || parsedAst.inputs)) || null,
      uiControls: sceneData.uiControls || (parsedAst && parsedAst.uiControls) || sceneData.inputs || (parsedAst && parsedAst.inputs) || null,
      computed: sceneData.computed || (parsedAst && parsedAst.computed) || null,
      gestures: sceneData.gestures || (parsedAst && parsedAst.gestures) || null,
      skills: sceneData.skills || (parsedAst && parsedAst.skills) || [],
      definedSkills: sceneData.definedSkills || (parsedAst && parsedAst.definedSkills) || null,
      controls: sceneData.controls || (parsedAst && parsedAst.controls) || null,
      physics: sceneData.physics || (parsedAst && parsedAst.physics) || null,
      scopes: sceneData.scopes || (parsedAst && parsedAst.scopes) || [],
      ledgers: sceneData.ledgers || (parsedAst && parsedAst.ledgers) || [],
      svgText: svgText,
      astSource: astText || '',
      mount: sceneData.mount,
      update: sceneData.update,
      render: sceneData.render
    };

    // Mark this custom cartridge as directly mounted so stale boot/preset lookups cannot overwrite it with welcome
    this._customMountedPresetId = id;
    this._customMountedAt = Date.now();

    // Auto-inflate directly into user's IndexedDB vault
    this.putIntoVaultIndexedDb({
      id,
      title: resolvedTitle,
      stage: resolvedStage,
      type: resolvedType,
      svgMarkup: svgText,
      astSource: astText,
      source: sceneData.source || 'custom',
      updatedAt: Date.now()
    });

    return this.loadScene(id, shouldPlay, true);
  }

  /**
   * Mounts a cartridge with pre-paint computed evaluation
   */
  mountCartridge(cartridge) {
    return this.initScene(cartridge);
  }
  }

  const ASTSceneLoader = {};
  const _ingest = global.ASTFileIngest || (typeof window !== 'undefined' ? window.ASTFileIngest : null);
  if (_ingest && typeof _ingest === 'object') {
    Object.assign(ASTSceneLoader, _ingest);
  }
  const _integrity = global.ASTSvgIntegrity || (typeof window !== 'undefined' ? window.ASTSvgIntegrity : null);
  if (_integrity && typeof _integrity === 'object') {
    Object.assign(ASTSceneLoader, _integrity);
  }
  const _proto = ASTSceneLoaderMethods.prototype;
  const _names = Object.getOwnPropertyNames(_proto);
  for (let i = 0; i < _names.length; i++) {
    const _name = _names[i];
    if (_name !== 'constructor') {
      ASTSceneLoader[_name] = _proto[_name];
    }
  }

  global.ASTSceneLoader = ASTSceneLoader;
  if (typeof window !== 'undefined') {
    window.ASTSceneLoader = ASTSceneLoader;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
