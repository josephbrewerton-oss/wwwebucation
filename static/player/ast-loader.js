/**
 * static/player/ast-loader.js
 *
 * St Joseph's AST Vector Media Player — Cartridge Loader, Vault, SVG Sanitizer & Integrity Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated I/O & security maintenance:
 * - IndexedDB offline cartridge vault (getFromVaultIndexedDb, putIntoVaultIndexedDb)
 * - Scene/preset/file/URL/payload ingestion (loadScene, setPreset, loadSceneData, mountCartridge,
 *   loadFromFile, readFileAsText, loadFiles, loadFromPayload, loadFromUrl, renderErrorPlaceholder)
 * - Safe DOM SVG sanitization & master defs injection (sanitizeSvg, sanitizeSvgElement, _buildSafeSvgTree, ensureMasterDefs)
 * - Cryptographic SHA-256 cartridge checksum verification (_computeSha256Hex, _resolveChecksumBaseUrl,
 *   _loadChecksumRegistry, verifyLoadedCartridge)
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

    async loadScene(presetId, shouldPlay = false) {
      this.cancelSpeech();
      const normalizedId = (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.normalizeId === 'function')
        ? global.ASTSceneRegistry.normalizeId(presetId)
        : presetId;
      presetId = normalizedId;

      // Deduplication Guard: If this exact preset is already mounted and ready, avoid re-fetching or wiping container
      const hasRenderableContent = this.scene && (this.scene.svgText || this.scene.render || this.scene.mount || (this.scene.keyframes && this.scene.keyframes.length));
      if (this.activePresetId === presetId && this._mountedSceneId === presetId && hasRenderableContent) {
        if (shouldPlay && !this.isPlaying) {
          this.play();
        } else if (shouldPlay === false && this.isPlaying) {
          this.pause();
        }
        return this.scene;
      }

      // In-flight Load Guard: If this exact preset is already being fetched, await the existing promise
      if (this._inFlightLoadPresetId === presetId && this._inFlightLoadPromise) {
        const existingScene = await this._inFlightLoadPromise;
        if (shouldPlay && !this.isPlaying) {
          this.play();
        } else if (shouldPlay === false && this.isPlaying) {
          this.pause();
        }
        return existingScene;
      }

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

          // 1. Check decentralized IndexedDB Cartridge Vault first (Zero Network Overhead & Zero 404s)
          let offlineVaultFallback = null;
          let officialRegistryRecord = null;
          try {
            const reg = await this._loadChecksumRegistry();
            if (reg && reg.cartridges) {
              officialRegistryRecord = reg.cartridges[String(presetId).trim().toLowerCase()] || null;
            }
          } catch (_) {}

          if (!svgText || !astText) {
            try {
              const vaultItem = await this.getFromVaultIndexedDb(presetId);
              if (vaultItem && (vaultItem.svgMarkup || vaultItem.svgText)) {
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
                  svgText = vaultItem.svgMarkup || vaultItem.svgText;
                  astText = vaultItem.astSource || vaultItem.astText || '';
                  if (!registryScene.title && vaultItem.title) {
                    registryScene = { ...registryScene, ...vaultItem };
                  }
                }
              }
            } catch (_) {}
          }

          // 2. If not already in registry or vault, fetch dynamically
          if ((!svgText || !astText) && typeof fetch !== 'undefined') {
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
              (!parsedAst.uiControls && (!parsedAst.inputs || parsedAst.inputs.length === 0)) ||
              (parsedAst.inputs && parsedAst.inputs.some(i => i && ((i.type === 'select' && (!i.options || i.options.length === 0)) || (i.min === 0 && i.max === 0 && !i.options)))) ||
              (parsedAst.vars && Object.values(parsedAst.vars).some(v => typeof v === 'string')) ||
              !parsedAst.bindings || parsedAst.bindings.length === 0 ||
              !parsedAst.computed || parsedAst.computed.length === 0 ||
              !parsedAst.gestures || parsedAst.gestures.length === 0 ||
              parsedAst.gestures.some(g => g && g.fromBytecode)
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

        const isNotFound = !svgText && !astText && !parsedAst && !registryScene.mount && !registryScene.render && (!registryScene.keyframes || !registryScene.keyframes.length);
        if (isNotFound) {
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
        const isInteractiveExplicitlyDisabled = astText ? (
          /:interactive\s+(false|nil|none)\b/i.test(astText) ||
          /:questions\s+(false|nil|none)\b/i.test(astText) ||
          /:type\s+"App"/i.test(astText) ||
          (/:enabled\s+(false|nil)\b/i.test(astText) && /:interactive/i.test(astText))
        ) : false;

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
          source: 'builtin',
          seal: (officialRegistryRecord && officialRegistryRecord.seal) || '',
          updatedAt: Date.now()
        });

        // Auto-register dynamically found scene so teacher does not have to reprocess index
        if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.register === 'function') {
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

// 3. Notify parent host that cartridge DOM is mounted and ready
      this.notifyParent({
        type: 'PLAYER_READY',
        preset: this.activePresetId,
        title: this.scene.title,
        stage: this.scene.stage,
        duration: this.durationSec,
        has3D: this.has3D(),
        hasInteractive: Boolean(this.scene && this.scene.interactive && this.scene.interactive.checkpoints && this.scene.interactive.checkpoints.length),
        keyframes: this.scene.keyframes || [],
        isPlaying: this.isPlaying
      });

      this.seek(0);
      if (shouldPlay || isContinuousSim) {
        this.play();
      } else if ((isSlide || !shouldPlay) && this.isPlaying) {
        this.pause();
      }
      this._mountedSceneId = presetId;

      // Broadcast initial scene subtitle & narration to parent and BSL engine
      const initialSub = this.getCurrentSubtitle() || (this.scene && (this.scene.title + (this.scene.stage ? ` - ${this.scene.stage}` : ''))) || '';
      if (initialSub) {
        this.notifyParent({ type: 'SUBTITLE_UPDATE', text: initialSub });
        if (this.voiceEnabled) {
          this.speakText(initialSub);
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
      if (this._inFlightLoadPresetId === presetId) {
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

    return this.loadScene(id, shouldPlay);
  }

  /**
   * Mounts a cartridge with pre-paint computed evaluation
   */
  mountCartridge(cartridge) {
    return this.initScene(cartridge);
  }

  /**
   * Ingests local files (.json, .ast, .svg) via File/Blob APIs (e.g. file picker or drag-and-drop).
   * @param {File|Blob} file
   * @param {boolean} shouldPlay
   * @returns {Promise<Object>} Loaded scene
   */
  async loadFromFile(file, shouldPlay = false) {
    if (!file) {
      const err = new Error('[AST Engine] loadFromFile requires a valid File or Blob');
      this.emit('error', { type: 'FILE_LOAD_ERROR', message: err.message });
      throw err;
    }
    const filename = file.name || 'custom-asset';
    const ext = filename.split('.').pop().toLowerCase();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        const err = new Error(`Failed to read file "${filename}": ${reader.error?.message}`);
        this.emit('error', { type: 'FILE_READ_ERROR', filename, message: err.message });
        if (this.container) {
          this.renderErrorPlaceholder(filename, err.message);
        }
        reject(err);
      };
      reader.onload = () => {
        try {
          const id = filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');

          if (ext === 'astb') {
            const bytes = new Uint8Array(reader.result);
            const parsed = this.decompileBytecode(bytes);
            if (!parsed) {
              throw new Error(`Invalid .astb binary cartridge: "${filename}"`);
            }
            const scene = Object.assign({}, parsed, {
              id: parsed.id || id,
              title: parsed.title || filename,
              stage: parsed.stage || 'COMPILED .ASTB CARTRIDGE',
              rawBindings: parsed.bindings || [],
              inputs: parsed.uiControls || parsed.inputs || [],
              svgText: parsed.svgMarkup || '',
            });
            const loaded = this.loadSceneData(scene, shouldPlay);
            this.emit('fileloaded', { filename, type: 'astb', id: scene.id });
            resolve(loaded);
            return;
          }

          const content = String(reader.result || '').trim();

          if (ext === 'json') {
            const json = JSON.parse(content);
            json.id = json.id || id;
            const loaded = this.loadSceneData(json, shouldPlay);
            this.emit('fileloaded', { filename, type: 'json', id: json.id });
            resolve(loaded);
          } else if (ext === 'svg' || (ext !== 'ast' && content.includes('<svg'))) {
            let embeddedAst = '';
            const metaMatch = content.match(/<metadata[^>]*type=["']application\/ast-sexpr["'][^>]*>([\s\S]*?)<\/metadata>/i)
              || content.match(/<script[^>]*type=["'](?:application\/ast-sexpr|text\/ast)["'][^>]*>([\s\S]*?)<\/script>/i)
              || content.match(/<ast-scene[^>]*>([\s\S]*?)<\/ast-scene>/i);

            if (metaMatch && metaMatch[1]) {
              embeddedAst = metaMatch[1].trim();
            } else if (content.includes('(:scene') || content.includes('(:cartridge')) {
              embeddedAst = content;
            }

            let parsed = null;
            if (embeddedAst) {
              try {
                parsed = this.parseAst(embeddedAst);
              } catch (e) {
                console.warn('[AST Engine] Notice: Could not parse embedded AST inside SVG:', e);
              }
            }

            const scene = {
              id: (parsed && parsed.id) || id,
              type: (parsed && parsed.type) || undefined,
              cartridgeType: (parsed && (parsed.cartridgeType || parsed.type)) || undefined,
              title: (parsed && parsed.title) || filename,
              stage: (parsed && parsed.stage) || (embeddedAst ? 'HYBRID AST.SVG CAPSULE' : 'CUSTOM SVG'),
              duration: (parsed && parsed.duration) || 10.0,
              camera: (parsed && parsed.camera) || null,
              has3D: Boolean(parsed && parsed.has3D),
              keyframes: (parsed && parsed.keyframes) || [],
              subtitles: (parsed && parsed.subtitles) || [],
              rawBindings: (parsed && parsed.bindings) || [],
              interactive: (parsed && parsed.interactive) || null,
              gestures: (parsed && parsed.gestures) || null,
              stateMachines: (parsed && parsed.stateMachines) || null,
              emitters: (parsed && parsed.emitters) || null,
              bindInputs: (parsed && parsed.bindInputs) || null,
              vars: (parsed && parsed.vars) || {},
              inputs: (parsed && (parsed.uiControls || parsed.inputs)) || [],
              uiControls: (parsed && parsed.uiControls) || null,
              computed: (parsed && parsed.computed) || [],
              physics: (parsed && parsed.physics) || null,
              actors: (parsed && parsed.actors) || [],
              staticElements: (parsed && parsed.staticElements) || [],
              astSource: embeddedAst || '',
              svgText: content
            };

            const loaded = this.loadSceneData(scene, shouldPlay);
            this.emit('fileloaded', { filename, type: embeddedAst ? 'ast.svg' : 'svg', id: scene.id });
            resolve(loaded);
          } else if (ext === 'ast') {
            const parsed = this.parseAst(content);
            const scene = {
              id: (parsed && parsed.id) || id,
              type: (parsed && parsed.type) || undefined,
              cartridgeType: (parsed && (parsed.cartridgeType || parsed.type)) || undefined,
              title: (parsed && parsed.title) || filename,
              stage: (parsed && parsed.stage) || 'CUSTOM AST',
              duration: (parsed && parsed.duration) || 10.0,
              camera: (parsed && parsed.camera) || null,
              has3D: Boolean(parsed && parsed.has3D),
              keyframes: (parsed && parsed.keyframes) || [],
              subtitles: (parsed && parsed.subtitles) || [],
              rawBindings: (parsed && parsed.bindings) || [],
              interactive: (parsed && parsed.interactive) || null,
              gestures: (parsed && parsed.gestures) || null,
              stateMachines: (parsed && parsed.stateMachines) || null,
              emitters: (parsed && parsed.emitters) || null,
              bindInputs: (parsed && parsed.bindInputs) || null,
              vars: (parsed && parsed.vars) || {},
              inputs: (parsed && (parsed.uiControls || parsed.inputs)) || [],
              uiControls: (parsed && parsed.uiControls) || null,
              computed: (parsed && parsed.computed) || [],
              physics: (parsed && parsed.physics) || null,
              actors: (parsed && parsed.actors) || [],
              staticElements: (parsed && parsed.staticElements) || [],
              astSource: content,
              svgText: content.includes('<svg') ? content : ''
            };
            const loaded = this.loadSceneData(scene, shouldPlay);
            this.emit('fileloaded', { filename, type: 'ast', id: scene.id });
            resolve(loaded);
          } else {
            if (content.startsWith('{')) {
              const json = JSON.parse(content);
              resolve(this.loadSceneData(json, shouldPlay));
            } else if (content.startsWith('(')) {
              const parsed = this.parseAst(content);
              resolve(this.loadSceneData({ id, ...parsed }, shouldPlay));
            } else if (content.includes('<svg')) {
              resolve(this.loadSceneData({ id, title: filename, svgText: content }, shouldPlay));
            } else if (content.startsWith('#') || content.includes('Stage:') || content.includes('Shape:')) {
              if (global.ASTSlideScriptCompiler) {
                const compiled = global.ASTSlideScriptCompiler.compile(content);
                resolve(this.loadSceneData(compiled.scene, shouldPlay));
              } else {
                throw new Error(`SlideScript detected but compiler is not loaded.`);
              }
            } else if (ext === 'html' || ext === 'htm' || ext === 'phet' || (global.ASTPhetBridge && global.ASTPhetBridge.isPhetBundle(content))) {
              if (global.ASTPhetBridge) {
                const result = global.ASTPhetBridge.transpilePhet(content, filename);
                const parsed = this.parseAst(result.astSource);
                const scene = {
                  id: result.id || id,
                  title: result.title || filename,
                  stage: result.stage || 'PhET TRANSLATED',
                  duration: result.duration || 12.0,
                  svgText: result.svgText,
                  keyframes: (parsed && parsed.keyframes) || [],
                  subtitles: (parsed && parsed.subtitles) || [],
                  rawBindings: (parsed && parsed.bindings) || []
                };
                const loaded = this.loadSceneData(scene, shouldPlay);
                this.emit('fileloaded', {
                  filename,
                  type: 'phet-transpiled',
                  id: scene.id,
                  title: scene.title,
                  stage: scene.stage,
                  metadata: result.metadata,
                  svgMarkup: result.svgText,
                  astSource: result.astSource
                });
                resolve(loaded);
              } else {
                throw new Error(`PhET bundle detected but ASTPhetBridge is not loaded.`);
              }
            } else {
              throw new Error(`Unsupported file extension: .${ext}. Expected .json, .ast, .svg, .html (PhET), or SlideScript.`);
            }
          }
        } catch (parseErr) {
          console.error('[AST Engine] Error parsing file:', filename, parseErr);
          this.emit('error', { type: 'FILE_PARSE_ERROR', filename, message: parseErr.message });
          if (this.container) {
            this.renderErrorPlaceholder(filename, `File parse failed: ${parseErr.message}`);
          }
          reject(parseErr);
        }
      };
      if (ext === 'astb') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  /**
   * Reads a File or Blob as UTF-8 text using a Promise.
   * @param {File|Blob} file
   * @returns {Promise<string>}
   */
  readFileAsText(file) {
    if (!file) return Promise.resolve('');
    if (typeof file.text === 'function') {
      return file.text();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || '').trim());
      reader.onerror = () => reject(new Error(`Failed to read file "${file.name}": ${reader.error?.message}`));
      reader.readAsText(file);
    });
  }

  /**
   * Loads one or multiple simulation files.
   * @param {FileList|File[]} fileList
   * @param {boolean} shouldPlay
   */
  async loadFiles(fileList, shouldPlay = false) {
    if (!fileList) {
      throw new Error('[AST Engine] loadFiles requires a valid file list');
    }
    const files = Array.from(fileList);
    if (files.length === 0) return null;
    if (files.length === 1) {
      return this.loadFromFile(files[0], shouldPlay);
    }

    const svgFile = files.find(f => {
      const name = (f.name || '').toLowerCase();
      return name.endsWith('.svg') && !name.endsWith('.ast.svg');
    }) || files.find(f => (f.name || '').toLowerCase().endsWith('.svg'));

    const astFile = files.find(f => {
      const name = (f.name || '').toLowerCase();
      return name.endsWith('.ast') || name.endsWith('.json') || name.endsWith('.slidescript');
    });

    if (svgFile && astFile) {
      const [svgContent, astContent] = await Promise.all([
        this.readFileAsText(svgFile),
        this.readFileAsText(astFile)
      ]);

      const astExt = (astFile.name || '').split('.').pop().toLowerCase();
      let parsed = null;
      let interactive = null;
      let gestures = null;
      let stateMachines = null;
      let emitters = null;
      let bindInputs = null;
      let keyframes = [];
      let subtitles = [];
      let rawBindings = [];
      let duration = 10.0;
      let title = astFile.name.replace(/\.[^/.]+$/, '');
      let id = title.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

      if (astExt === 'json') {
        const json = JSON.parse(astContent);
        id = json.id || id;
        title = json.title || title;
        duration = json.duration || duration;
        keyframes = json.keyframes || [];
        subtitles = json.subtitles || [];
        rawBindings = json.bindings || json.rawBindings || [];
        interactive = json.interactive || null;
        gestures = json.gestures || null;
        stateMachines = json.stateMachines || null;
        emitters = json.emitters || null;
        bindInputs = json.bindInputs || null;
      } else if (astExt === 'slidescript') {
        if (global.ASTSlideScriptCompiler) {
          const compiled = global.ASTSlideScriptCompiler.compile(astContent);
          parsed = compiled.scene;
          id = parsed.id || id;
          title = parsed.title || title;
          duration = parsed.duration || duration;
          keyframes = parsed.keyframes || [];
          subtitles = parsed.subtitles || [];
          rawBindings = parsed.rawBindings || [];
        }
      } else {
        parsed = this.parseAst(astContent);
        if (parsed) {
          id = parsed.id || id;
          title = parsed.title || title;
          duration = parsed.duration || duration;
          keyframes = parsed.keyframes || [];
          subtitles = parsed.subtitles || [];
          rawBindings = parsed.bindings || [];
          interactive = parsed.interactive || null;
          gestures = parsed.gestures || null;
          stateMachines = parsed.stateMachines || null;
          emitters = parsed.emitters || null;
          bindInputs = parsed.bindInputs || null;
        }
      }

      const scene = {
        id,
        title,
        stage: `DUAL PAIR (${astFile.name} + ${svgFile.name})`,
        duration,
        bootSound: (parsed && parsed.bootSound) || null,
        camera: (parsed && parsed.camera) || null,
        cameraStops: (parsed && parsed.cameraStops) || null,
        quests: (parsed && parsed.quests) || null,
        has3D: Boolean(parsed && parsed.has3D),
        keyframes,
        subtitles,
        rawBindings,
        interactive,
        gestures,
        stateMachines,
        emitters,
        bindInputs,
        astSource: astContent,
        svgText: svgContent
      };

      const loaded = this.loadSceneData(scene, shouldPlay);
      this.emit('fileloaded', {
        filename: `${astFile.name} + ${svgFile.name}`,
        type: 'companion-pair',
        id: scene.id,
        dualNature: true
      });
      return loaded;
    }

    const primaryFile = files.find(f => /\.(astb|ast|svg|json|html|slidescript)$/i.test(f.name)) || files[0];
    return this.loadFromFile(primaryFile, shouldPlay);
  }

  /**
   * Loads a simulation directly from a zero-server URL payload string or base64 payload.
   */
  loadFromPayload(payload, shouldPlay = false) {
    if (!payload || typeof payload !== 'string') {
      const err = new Error('[AST Engine] loadFromPayload requires a valid string');
      this.emit('error', { type: 'INVALID_PAYLOAD', message: err.message });
      throw err;
    }

    let content = payload.trim();
    if (content.startsWith('base64:')) {
      try {
        content = decodeURIComponent(escape(atob(content.slice(7))));
      } catch (e) {
        try { content = atob(content.slice(7)); } catch {}
      }
    } else if (!content.startsWith('(') && !content.startsWith('{') && !content.startsWith('<') && !content.startsWith('#') && /^[A-Za-z0-9+/=_-]+$/.test(content)) {
      try {
        const rawB64 = content.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = decodeURIComponent(escape(atob(rawB64)));
        if (decoded.startsWith('(') || decoded.startsWith('{') || decoded.startsWith('<') || decoded.startsWith('#')) {
          content = decoded;
        }
      } catch {}
    }

    const id = `payload-${Date.now()}`;

    if (content.startsWith('(')) {
      const parsed = this.parseAst(content);
      const scene = {
        id: (parsed && parsed.id) || id,
        type: (parsed && parsed.type) || undefined,
        cartridgeType: (parsed && (parsed.cartridgeType || parsed.type)) || undefined,
        title: (parsed && parsed.title) || 'Decentralized Vector Simulation',
        stage: (parsed && parsed.stage) || 'DECENTRALIZED WEB',
        duration: (parsed && parsed.duration) || 10.0,
        camera: (parsed && parsed.camera) || null,
        has3D: Boolean(parsed && parsed.has3D),
        keyframes: (parsed && parsed.keyframes) || [],
        subtitles: (parsed && parsed.subtitles) || [],
        rawBindings: (parsed && parsed.bindings) || [],
        interactive: (parsed && parsed.interactive) || null,
        gestures: (parsed && parsed.gestures) || null,
        stateMachines: (parsed && parsed.stateMachines) || null,
        emitters: (parsed && parsed.emitters) || null,
        bindInputs: (parsed && parsed.bindInputs) || null,
        vars: (parsed && parsed.vars) || {},
        inputs: (parsed && (parsed.uiControls || parsed.inputs)) || [],
        uiControls: (parsed && parsed.uiControls) || null,
        computed: (parsed && parsed.computed) || [],
        physics: (parsed && parsed.physics) || null,
        actors: (parsed && parsed.actors) || [],
        staticElements: (parsed && parsed.staticElements) || [],
        astSource: content,
        svgText: content.includes('<svg') ? content : ''
      };
      const loaded = this.loadSceneData(scene, shouldPlay);
      this.emit('fileloaded', { filename: `${scene.id}.ast`, type: 'ast-payload', id: scene.id });
      return loaded;
    }

    if (content.startsWith('#') || content.includes('Stage:') || content.includes('Shape:')) {
      if (global.ASTSlideScriptCompiler) {
        const compiled = global.ASTSlideScriptCompiler.compile(content);
        const loaded = this.loadSceneData(compiled.scene, shouldPlay);
        this.emit('fileloaded', { filename: `${compiled.scene.id || id}.slidescript`, type: 'slidescript-payload', id: compiled.scene.id || id });
        return loaded;
      }
    }

    if (content.startsWith('{')) {
      const json = JSON.parse(content);
      const loaded = this.loadSceneData(json, shouldPlay);
      this.emit('fileloaded', { filename: `${json.id || id}.json`, type: 'json-payload', id: json.id || id });
      return loaded;
    }

    if (content.includes('<svg')) {
      return this.loadFromFile(new Blob([content], { type: 'image/svg+xml' }), shouldPlay);
    }

    throw new Error('[AST Engine] Unrecognized payload format: expected AST S-expression, SlideScript, or JSON');
  }

  /**
   * Loads an external standalone scene manifest (.json), AST file (.ast), or SVG (.svg) from a remote URL.
   */
  async loadFromUrl(url, shouldPlay = false) {
    if (!url || typeof url !== 'string') {
      const err = new Error('[AST Engine] loadFromUrl requires a valid URL');
      this.emit('error', { type: 'INVALID_URL', message: err.message });
      throw err;
    }
    try {
      let resolvedUrl = url;
      if (url.startsWith('/') && !url.startsWith('//') && typeof window !== 'undefined' && window.location) {
        const path = window.location.pathname || '/';
        const host = window.location.hostname || '';
        let dynamicBase = (window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__ || '').replace(/\/+$/, '') + '/';
        if (dynamicBase === '/') {
          const playerIdx = path.indexOf('/player/');
          if (playerIdx >= 0) {
            dynamicBase = path.slice(0, playerIdx + 1);
          } else if (host === 'github.io' || host.endsWith('.github.io')) {
            const seg = path.split('/').filter(Boolean)[0];
            dynamicBase = seg ? `/${seg}/` : '/';
          }
        }
        if (dynamicBase && dynamicBase !== '/' && !url.startsWith(dynamicBase)) {
          resolvedUrl = dynamicBase.replace(/\/$/, '') + url;
        }
      }
      const res = await fetch(resolvedUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      const cleanUrl = url.split('?')[0];
      const filename = cleanUrl.split('/').pop() || 'remote-asset';
      const contentType = (res.headers && typeof res.headers.get === 'function' && res.headers.get('content-type')) || 'text/plain';
      const blob = new Blob([text], { type: contentType });
      try {
        Object.defineProperty(blob, 'name', { value: filename, writable: false });
      } catch {}
      return await this.loadFromFile(blob, shouldPlay);
    } catch (err) {
      console.error('[AST Engine] Failed to load from URL:', url, err);
      this.emit('error', { type: 'URL_LOAD_ERROR', url, message: err.message });
      if (this.container) {
        this.renderErrorPlaceholder(url, `Network error: ${err.message}`);
      }
      throw err;
    }
  }

  renderErrorPlaceholder(identifier, message) {
    if (!this.container || typeof document === 'undefined') return;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs = {}, text = null) => {
      const node = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
      if (text !== null) node.textContent = String(text);
      return node;
    };
    const svg = mk('svg', { viewBox: '0 0 800 480', width: '100%', height: '100%' });
    svg.style.background = '#090d16';
    svg.style.borderRadius = '12px';
    svg.appendChild(mk('rect', { x: 20, y: 20, width: 760, height: 440, rx: 16, fill: '#0f172a', stroke: '#ef4444', 'stroke-width': 2, 'stroke-dasharray': '6 6' }));
    svg.appendChild(mk('circle', { cx: 400, cy: 180, r: 42, fill: '#ef4444', 'fill-opacity': '0.12', stroke: '#ef4444', 'stroke-width': '2.5' }));
    svg.appendChild(mk('text', { x: 400, y: 192, fill: '#ef4444', 'font-size': 34, 'font-weight': 'bold', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, '⚠️'));
    svg.appendChild(mk('text', { x: 400, y: 260, fill: '#f8fafc', 'font-size': 20, 'font-weight': '700', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, 'Scene Load Error'));
    svg.appendChild(mk('text', { x: 400, y: 295, fill: '#94a3b8', 'font-size': 14, 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, message || 'Failed to load vector asset'));
    svg.appendChild(mk('text', { x: 400, y: 325, fill: '#64748b', 'font-size': 12, 'text-anchor': 'middle', 'font-family': 'monospace' }, `Target: ${identifier || 'Unknown'}`));
    const btnGroup = mk('g', { cursor: 'pointer', id: 'error-fallback-action', transform: 'translate(325, 360)' });
    btnGroup.appendChild(mk('rect', { width: 150, height: 38, rx: 19, fill: '#2563eb' }));
    btnGroup.appendChild(mk('text', { x: 75, y: 24, fill: '#ffffff', 'font-size': 13, 'font-weight': 'bold', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, 'Load Default Scene'));
    btnGroup.onclick = () => {
      this.loadScene('welcome', true);
    };
    svg.appendChild(btnGroup);
    if (typeof this.container.replaceChildren === 'function') this.container.replaceChildren(svg);
    else { this.container.textContent = ''; this.container.appendChild(svg); }
  }

  sanitizeSvg(rawSvg) {
    if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.sanitizeSvg === 'function') {
      return global.ASTSharedRenderBoundary.sanitizeSvg(rawSvg);
    }
    if (!rawSvg || typeof rawSvg !== 'string') return '';
    let clean = rawSvg.trim();
    if (/<!DOCTYPE|<!ENTITY/i.test(clean)) {
      clean = clean
        .replace(/<!DOCTYPE(?:\s+[^[>]*(?:\[[\s\S]*?\])?\s*)?>/gi, '<!-- DOCTYPE disabled -->')
        .replace(/<!ENTITY[\s\S]*?>/gi, '<!-- ENTITY disabled -->');
    }
    return clean;
  }

  sanitizeSvgElement(rootSvg) {
    if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.sanitizeSvgElement === 'function') {
      return global.ASTSharedRenderBoundary.sanitizeSvgElement(rootSvg);
    }
    if (!rootSvg) return null;
    const dangerousTags = ['script', 'foreignobject', 'iframe', 'embed', 'object', 'link', 'meta', 'style'];
    if (rootSvg.tagName && dangerousTags.includes(rootSvg.tagName.toLowerCase())) return null;

    for (const tag of dangerousTags) {
      rootSvg.querySelectorAll(tag).forEach(el => el.remove());
    }

    const allElements = [rootSvg, ...rootSvg.querySelectorAll('*')];
    for (const el of allElements) {
      if (!el.attributes) continue;
      const toRemove = [];
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        const name = attr.name.toLowerCase();
        const val = (attr.value || '').trim().toLowerCase();

        if (name.startsWith('on')) {
          toRemove.push(attr.name);
        } else if (
          (name === 'href' || name.endsWith(':href') || name === 'src') &&
          /^(javascript:|vbscript:|data:(?!image\/(png|jpe?g|gif|webp|svg\+xml)))/i.test(val)
        ) {
          toRemove.push(attr.name);
        }
      }
      for (const attrName of toRemove) {
        el.removeAttribute(attrName);
      }
    }

    return rootSvg;
  }

  _buildSafeSvgTree(svgMarkup) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const XLINK_NS = 'http://www.w3.org/1999/xlink';
    const VOID_TAGS = new Set([
      'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
      'stop', 'use', 'image', 'feblend', 'fecolormatrix', 'fecomposite',
      'feconvolvematrix', 'fedisplacementmap', 'fedistantlight', 'fedropshadow',
      'feflood', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr', 'fegaussianblur',
      'feimage', 'femergenode', 'femorphology', 'feoffset', 'fepointlight',
      'fespotlight', 'fetile', 'feturbulence', 'animate', 'animatemotion',
      'animatetransform', 'mpath', 'set'
    ]);
    const ALLOWED_TAGS = new Set([
      'svg', 'g', 'defs', 'symbol', 'use', 'path', 'rect', 'circle',
      'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'textpath',
      'image', 'lineargradient', 'radialgradient', 'stop', 'clippath',
      'mask', 'pattern', 'marker', 'filter', 'feblend', 'fecolormatrix',
      'fecomponenttransfer', 'fecomposite', 'feconvolvematrix',
      'fediffuselighting', 'fedisplacementmap', 'fedistantlight', 'fedropshadow',
      'feflood', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr', 'fegaussianblur',
      'feimage', 'femerge', 'femergenode', 'femorphology', 'feoffset',
      'fepointlight', 'fespecularlighting', 'fespotlight', 'fetile',
      'feturbulence', 'animate', 'animatemotion', 'animatetransform',
      'mpath', 'set', 'title', 'desc', 'switch'
    ]);
    const TAG_CANONICAL = {
      lineargradient: 'linearGradient',
      radialgradient: 'radialGradient',
      clippath: 'clipPath',
      textpath: 'textPath',
      feblend: 'feBlend',
      fecolormatrix: 'feColorMatrix',
      fecomponenttransfer: 'feComponentTransfer',
      fecomposite: 'feComposite',
      feconvolvematrix: 'feConvolveMatrix',
      fediffuselighting: 'feDiffuseLighting',
      fedisplacementmap: 'feDisplacementMap',
      fedistantlight: 'feDistantLight',
      fedropshadow: 'feDropShadow',
      feflood: 'feFlood',
      fefunca: 'feFuncA',
      fefuncb: 'feFuncB',
      fefuncg: 'feFuncG',
      fefuncr: 'feFuncR',
      fegaussianblur: 'feGaussianBlur',
      feimage: 'feImage',
      femerge: 'feMerge',
      femergenode: 'feMergeNode',
      femorphology: 'feMorphology',
      feoffset: 'feOffset',
      fepointlight: 'fePointLight',
      fespecularlighting: 'feSpecularLighting',
      fespotlight: 'feSpotLight',
      fetile: 'feTile',
      feturbulence: 'feTurbulence',
      animatemotion: 'animateMotion',
      animatetransform: 'animateTransform'
    };
    const ATTR_CANONICAL = {
      viewbox: 'viewBox',
      preserveaspectratio: 'preserveAspectRatio',
      pathlength: 'pathLength',
      stddeviation: 'stdDeviation',
      gradientunits: 'gradientUnits',
      gradienttransform: 'gradientTransform',
      spreadmethod: 'spreadMethod',
      patternunits: 'patternUnits',
      patterncontentunits: 'patternContentUnits',
      patterntransform: 'patternTransform',
      maskunits: 'maskUnits',
      maskcontentunits: 'maskContentUnits',
      clippathunits: 'clipPathUnits',
      filterunits: 'filterUnits',
      primitiveunits: 'primitiveUnits',
      basefrequency: 'baseFrequency',
      numoctaves: 'numOctaves',
      stitchtiles: 'stitchTiles',
      xchannelselector: 'xChannelSelector',
      ychannelselector: 'yChannelSelector',
      edgemode: 'edgeMode',
      kernelmatrix: 'kernelMatrix',
      targetx: 'targetX',
      targety: 'targetY',
      preservealpha: 'preserveAlpha',
      surfacescale: 'surfaceScale',
      diffuseconstant: 'diffuseConstant',
      specularconstant: 'specularConstant',
      specularexponent: 'specularExponent',
      pointsatx: 'pointsAtX',
      pointsaty: 'pointsAtY',
      pointsatz: 'pointsAtZ',
      limitingconeangle: 'limitingConeAngle',
      tablevalues: 'tableValues',
      markerwidth: 'markerWidth',
      markerheight: 'markerHeight',
      refx: 'refX',
      refy: 'refY',
      markerunits: 'markerUnits',
      attributename: 'attributeName',
      attributetype: 'attributeType',
      repeatcount: 'repeatCount',
      repeatdur: 'repeatDur',
      calcmode: 'calcMode',
      keysplines: 'keySplines',
      keytimes: 'keyTimes',
      textlength: 'textLength',
      lengthadjust: 'lengthAdjust',
      startoffset: 'startOffset',
      fillopacity: 'fill-opacity',
      fontfamily: 'font-family',
      fontsize: 'font-size',
      fontweight: 'font-weight',
      letterspacing: 'letter-spacing',
      pointerevents: 'pointer-events',
      stopcolor: 'stop-color',
      stopopacity: 'stop-opacity',
      strokelinecap: 'stroke-linecap',
      strokewidth: 'stroke-width',
      textanchor: 'text-anchor'
    };
    const ALLOWED_ATTRS = new Set([
      'id', 'class', 'style', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy',
      'fx', 'fy', 'fr', 'r', 'rx', 'ry', 'd', 'points', 'pathlength',
      'dx', 'dy', 'rotate', 'width', 'height', 'viewbox', 'preserveaspectratio',
      'transform', 'fill', 'fill-opacity', 'fillopacity', 'fill-rule',
      'stroke', 'stroke-width', 'strokewidth', 'stroke-opacity',
      'stroke-linecap', 'strokelinecap', 'stroke-linejoin',
      'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit',
      'opacity', 'font-family', 'fontfamily', 'font-size', 'fontsize',
      'font-weight', 'fontweight', 'font-style', 'text-anchor', 'textanchor',
      'dominant-baseline', 'letter-spacing', 'letterspacing', 'word-spacing',
      'text-transform', 'textlength', 'lengthadjust', 'startoffset', 'offset',
      'stop-color', 'stopcolor', 'stop-opacity', 'stopopacity',
      'gradientunits', 'gradienttransform', 'spreadmethod', 'patternunits',
      'patterncontentunits', 'patterntransform', 'maskunits',
      'maskcontentunits', 'clip-path', 'clip-rule', 'clippathunits',
      'mask', 'filter', 'filterunits', 'primitiveunits',
      'color-interpolation-filters', 'stddeviation', 'in', 'in2', 'result',
      'k1', 'k2', 'k3', 'k4', 'type', 'values', 'mode', 'operator',
      'flood-color', 'flood-opacity', 'basefrequency', 'numoctaves', 'seed',
      'stitchtiles', 'scale', 'xchannelselector', 'ychannelselector',
      'edgemode', 'kernelmatrix', 'order', 'divisor', 'bias', 'targetx',
      'targety', 'preservealpha', 'surfacescale', 'diffuseconstant',
      'specularconstant', 'specularexponent', 'azimuth', 'elevation',
      'pointsatx', 'pointsaty', 'pointsatz', 'limitingconeangle', 'radius',
      'tablevalues', 'slope', 'intercept', 'amplitude', 'exponent',
      'markerwidth', 'markerheight', 'refx', 'refy', 'orient',
      'markerunits', 'marker-start', 'marker-mid', 'marker-end',
      'attributename', 'attributetype', 'begin', 'dur', 'end', 'min',
      'max', 'restart', 'repeatcount', 'repeatdur', 'from', 'to', 'by',
      'calcmode', 'keysplines', 'keytimes', 'additive', 'accumulate',
      'xmlns', 'xmlns:xlink', 'href', 'xlink:href', 'visibility', 'display',
      'overflow', 'pointer-events', 'pointerevents', 'cursor', 'color',
      'vector-effect', 'shape-rendering', 'text-rendering', 'image-rendering'
    ]);
    const decodeEntities = (str) => String(str)
      .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');

    let rootSvg = null;
    const stack = [];
    const skipStack = [];
    const tokenRx = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9:-]+)\s*>|<([a-zA-Z0-9:-]+)((?:\s+[a-zA-Z0-9:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)/g;
    let match;

    while ((match = tokenRx.exec(svgMarkup)) !== null) {
      const [, closeTag, openTag, attrStr, selfClose, textNode] = match;
      if (closeTag) {
        const closeLower = closeTag.toLowerCase();
        if (skipStack.length > 0) {
          if (skipStack[skipStack.length - 1] === closeLower) {
            skipStack.pop();
          }
          continue;
        }
        if (stack.length > 0 && stack[stack.length - 1].tagName.toLowerCase() === closeLower) {
          stack.pop();
        }
      } else if (openTag) {
        const tagLower = openTag.toLowerCase();
        if (skipStack.length > 0 || !ALLOWED_TAGS.has(tagLower)) {
          if (!selfClose && !VOID_TAGS.has(tagLower)) {
            skipStack.push(tagLower);
          }
          continue;
        }
        const canonicalTag = TAG_CANONICAL[tagLower] || openTag;
        const el = document.createElementNS(SVG_NS, canonicalTag);
        if (attrStr) {
          const attrRx = /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
          let aMatch;
          while ((aMatch = attrRx.exec(attrStr)) !== null) {
            const rawName = aMatch[1];
            const nameLower = rawName.toLowerCase();
            if (nameLower.startsWith('on')) continue;
            if (!ALLOWED_ATTRS.has(nameLower) && !nameLower.startsWith('data-') && !nameLower.startsWith('aria-')) {
              continue;
            }
            const canonicalAttr = ATTR_CANONICAL[nameLower] || rawName;
            const val = decodeEntities(aMatch[2] ?? aMatch[3] ?? aMatch[4] ?? '');
            if (nameLower === 'href' || nameLower === 'xlink:href') {
              const trimmedVal = val.trim();
              const isSafeLocalRef = /^#[A-Za-z_][\w:.-]*$/.test(trimmedVal);
              if (!isSafeLocalRef) {
                continue;
              }
              if (nameLower === 'xlink:href') {
                el.setAttributeNS(XLINK_NS, 'xlink:href', trimmedVal);
              } else {
                el.setAttribute('href', trimmedVal);
              }
            } else {
              el.setAttribute(canonicalAttr, val);
            }
          }
        }
        if (stack.length > 0) {
          stack[stack.length - 1].appendChild(el);
        } else if (tagLower === 'svg') {
          rootSvg = el;
        }
        if (!selfClose && !VOID_TAGS.has(tagLower) && (stack.length > 0 || tagLower === 'svg')) {
          stack.push(el);
        }
      } else if (textNode && skipStack.length === 0 && stack.length > 0) {
        stack[stack.length - 1].appendChild(document.createTextNode(decodeEntities(textNode)));
      }
    }
    return rootSvg;
  }

  ensureMasterDefs(container) {
    if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.ensureMasterDefs === 'function') {
      global.ASTSharedRenderBoundary.ensureMasterDefs(container || this._container || this.container);
      return;
    }
    if (typeof document === 'undefined') return;
    const target = container || this._container || this.container;
    if (!target) return;
    const rootSvg = (target.tagName && target.tagName.toLowerCase() === 'svg')
      ? target
      : (target.ownerSVGElement || (typeof target.closest === 'function' ? target.closest('svg') : null) || document.getElementById('stage-svg') || (typeof target.querySelector === 'function' ? target.querySelector('svg') : null));
    if (!rootSvg) return;

    if (rootSvg.querySelector('#ast-master-defs') || document.getElementById('ast-master-defs')) return;

    const createSvg = (tag, attrs, children) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
          el.setAttribute(k, String(v));
        }
      }
      if (Array.isArray(children)) {
        for (const ch of children) {
          if (ch) el.appendChild(ch);
        }
      }
      return el;
    };

    const makeGlowFilter = (id) => createSvg('filter', { id, x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
      createSvg('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
      createSvg('feMerge', null, [
        createSvg('feMergeNode', { in: 'blur' }),
        createSvg('feMergeNode', { in: 'SourceGraphic' })
      ])
    ]);

    const makeArrowMarker = (id, fill, refX = 7, points = '0 0, 8 3, 0 6') =>
      createSvg('marker', { id, markerWidth: '8', markerHeight: '6', refX: String(refX), refY: '3', orient: 'auto' }, [
        createSvg('polygon', { points, fill })
      ]);

    const makeLinGrad = (id, c0, c1, y2 = '1', x2 = '1') =>
      createSvg('linearGradient', { id, x1: '0', y1: '0', x2, y2 }, [
        createSvg('stop', { offset: '0%', 'stop-color': c0 }),
        createSvg('stop', { offset: '100%', 'stop-color': c1 })
      ]);

    const defsEl = createSvg('defs', { id: 'ast-master-defs' }, [
      createSvg('filter', { id: 'pyth-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvg('feDropShadow', { dx: '0', dy: '4', stdDeviation: '6', 'flood-color': '#000000', 'flood-opacity': '0.65' })
      ]),
      createSvg('filter', { id: 'pyth-glow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvg('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
        createSvg('feMerge', null, [
          createSvg('feMergeNode', { in: 'blur' }),
          createSvg('feMergeNode', { in: 'SourceGraphic' })
        ])
      ]),
      makeGlowFilter('ast-glow-cyan'),
      createSvg('filter', { id: 'ast-glow-gold', x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
        createSvg('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
        createSvg('feComponentTransfer', { in: 'blur', result: 'cb' }, [
          createSvg('feFuncR', { type: 'linear', slope: '1.2' }),
          createSvg('feFuncG', { type: 'linear', slope: '0.9' }),
          createSvg('feFuncB', { type: 'linear', slope: '0.2' })
        ]),
        createSvg('feMerge', null, [
          createSvg('feMergeNode', { in: 'cb' }),
          createSvg('feMergeNode', { in: 'SourceGraphic' })
        ])
      ]),
      makeGlowFilter('ast-glow-red'),
      makeGlowFilter('ast-glow-emerald'),
      makeGlowFilter('ast-glow-purple'),
      createSvg('filter', { id: 'ast-drop-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvg('feDropShadow', { dx: '0', dy: '6', stdDeviation: '8', 'flood-color': '#000000', 'flood-opacity': '0.55' })
      ]),
      createSvg('filter', { id: 'ast-blur-soft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvg('feGaussianBlur', { stdDeviation: '5' })
      ]),
      makeArrowMarker('ast-arrowhead', '#38bdf8', 7, '0 0, 8 3, 0 6'),
      makeArrowMarker('ast-arrow-start', '#38bdf8', 1, '8 0, 0 3, 8 6'),
      makeArrowMarker('ast-arrow-cyan', '#38bdf8', 7, '0 0, 8 3, 0 6'),
      makeArrowMarker('ast-arrow-gold', '#f59e0b', 7, '0 0, 8 3, 0 6'),
      makeArrowMarker('ast-arrow-red', '#ef4444', 7, '0 0, 8 3, 0 6'),
      makeArrowMarker('ast-arrow-emerald', '#10b981', 7, '0 0, 8 3, 0 6'),
      createSvg('marker', { id: 'ast-vector-dot', markerWidth: '6', markerHeight: '6', refX: '3', refY: '3' }, [
        createSvg('circle', { cx: '3', cy: '3', r: '2.5', fill: '#38bdf8' })
      ]),
      createSvg('pattern', { id: 'ast-grid-fine', width: '20', height: '20', patternUnits: 'userSpaceOnUse' }, [
        createSvg('path', { d: 'M 20 0 L 0 0 0 20', fill: 'none', stroke: '#1e293b', 'stroke-width': '0.75', 'stroke-opacity': '0.5' })
      ]),
      createSvg('pattern', { id: 'ast-grid-dense', width: '40', height: '40', patternUnits: 'userSpaceOnUse' }, [
        createSvg('rect', { width: '40', height: '40', fill: 'none' }),
        createSvg('path', { d: 'M 40 0 L 0 0 0 40', fill: 'none', stroke: '#334155', 'stroke-width': '1.2', 'stroke-opacity': '0.6' }),
        createSvg('path', { d: 'M 20 0 L 20 40 M 0 20 L 40 20', fill: 'none', stroke: '#1e293b', 'stroke-width': '0.5', 'stroke-opacity': '0.4' })
      ]),
      createSvg('pattern', { id: 'ast-grid-dots', width: '20', height: '20', patternUnits: 'userSpaceOnUse' }, [
        createSvg('circle', { cx: '2', cy: '2', r: '1', fill: '#475569', 'fill-opacity': '0.6' })
      ]),
      makeLinGrad('ast-grad-cyan', '#38bdf8', '#0284c7'),
      makeLinGrad('ast-grad-gold', '#fef08a', '#f59e0b'),
      makeLinGrad('ast-grad-emerald', '#34d399', '#059669'),
      makeLinGrad('ast-grad-purple', '#c084fc', '#7c3aed'),
      makeLinGrad('ast-grad-crimson', '#f87171', '#dc2626'),
      makeLinGrad('ast-blueprint-backdrop', '#070e1b', '#020617', '1', '0')
    ]);
    rootSvg.insertBefore(defsEl, rootSvg.firstChild);
  }

  async _computeSha256Hex(data) {
    if (data === null || data === undefined) return '';
    const subtle = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle)
      || (typeof window !== 'undefined' && window.crypto && window.crypto.subtle);
    if (!subtle || typeof subtle.digest !== 'function') return '';
    let u8;
    if (typeof data === 'string') {
      u8 = new TextEncoder().encode(data);
    } else if (data instanceof Uint8Array) {
      u8 = data;
    } else if (data instanceof ArrayBuffer) {
      u8 = new Uint8Array(data);
    } else {
      return '';
    }
    const digest = await subtle.digest('SHA-256', u8);
    const bytes = new Uint8Array(digest);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  _resolveChecksumBaseUrl() {
    let repoBase = '/';
    if (typeof window !== 'undefined') {
      if (window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__) {
        repoBase = String(window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__).replace(/\/+$/, '') + '/';
      } else if (typeof document !== 'undefined' && document.querySelector('base')?.getAttribute('href')) {
        repoBase = document.querySelector('base').getAttribute('href').replace(/\/+$/, '') + '/';
      } else if (window.location) {
        const pathname = window.location.pathname || '/';
        const host = window.location.hostname || '';
        const playerIdx = pathname.indexOf('/player/');
        if (playerIdx >= 0) {
          repoBase = pathname.slice(0, playerIdx + 1);
        } else if (host === 'github.io' || host.endsWith('.github.io')) {
          const seg = pathname.split('/').filter(Boolean)[0];
          repoBase = seg ? `/${seg}/` : '/';
        }
      }
    }
    return repoBase;
  }

  async _loadChecksumRegistry() {
    if (this._checksumRegistryCache) return this._checksumRegistryCache;
    if (typeof fetch === 'undefined') return null;
    const repoBase = this._resolveChecksumBaseUrl();
    const candidates = Array.from(new Set([
      `${repoBase}cartridge-checksums.json`,
      '../cartridge-checksums.json',
      './cartridge-checksums.json',
      '/cartridge-checksums.json'
    ]));
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) continue;
        const json = JSON.parse(text);
        if (json && json.cartridges) {
          this._checksumRegistryCache = json;
          return json;
        }
      } catch (_) {}
    }
    return null;
  }

  async verifyLoadedCartridge(scene) {
    if (!scene || !scene.id) return null;
    const id = String(scene.id).trim().toLowerCase();
    const shortFmt = (h) => (h && h.length >= 12 ? `${h.slice(0, 6)}...${h.slice(-6)}` : (h || 'unsigned'));
    const registry = await this._loadChecksumRegistry();
    const record = registry && registry.cartridges ? registry.cartridges[id] : null;

    const [computedAstb, computedAst, computedSvg] = await Promise.all([
      scene._rawAstbBuffer ? this._computeSha256Hex(scene._rawAstbBuffer) : Promise.resolve(''),
      scene.astSource ? this._computeSha256Hex(scene.astSource) : Promise.resolve(''),
      scene.svgText ? this._computeSha256Hex(scene.svgText) : Promise.resolve('')
    ]);

    let result;
    if (!record) {
      const activeHash = computedAstb || computedAst || computedSvg;
      result = {
        cartridgeId: id,
        status: 'unverified-external',
        isNative: false,
        isVerified: false,
        tier: 'community',
        shortHash: activeHash ? shortFmt(activeHash) : 'external',
        computedAstbSha256: computedAstb || undefined,
        computedAstSha256: computedAst || undefined,
        computedSvgSha256: computedSvg || undefined,
        authority: 'Third-Party / Community Author',
        badgeText: 'Community Cartridge',
        badgeTooltip: `Unregistered external or custom cartridge (${scene.title || id}). SHA-256: ${activeHash ? shortFmt(activeHash) : 'n/a'}`
      };
    } else {
      const matchesTextDigest = async (rawText, computedHash, expectedHash) => {
        if (!expectedHash) return true;
        const target = expectedHash.toLowerCase();
        if (computedHash === target) return true;
        if (!rawText) return false;
        const normalizedLf = rawText.replace(/\r\n/g, '\n');
        const trimmed = normalizedLf.trim();
        const variants = [normalizedLf, trimmed, trimmed + '\n', trimmed + '\n\n'];
        for (const variant of variants) {
          const h = await this._computeSha256Hex(variant);
          if (h === target) return true;
        }
        return false;
      };

      const astbMatch = !computedAstb || !record.astbSha256 || computedAstb === record.astbSha256.toLowerCase();
      let astMatch = true;
      if (computedAst && record.astSha256 && (!computedAstb || scene._astEditedManually)) {
        astMatch = await matchesTextDigest(scene.astSource, computedAst, record.astSha256);
      }
      let svgMatch = true;
      if (computedSvg && record.svgSha256 && scene._svgEditedManually) {
        svgMatch = await matchesTextDigest(scene.svgText, computedSvg, record.svgSha256);
      }

      if (!astbMatch || !astMatch || !svgMatch) {
        const activeHash = computedAst || computedSvg || computedAstb || record.astSha256;
        result = {
          cartridgeId: id,
          status: 'tampered',
          isNative: true,
          isVerified: false,
          tier: 'modified',
          seal: record.seal,
          shortHash: shortFmt(activeHash),
          computedAstbSha256: computedAstb || undefined,
          computedAstSha256: computedAst || undefined,
          computedSvgSha256: computedSvg || undefined,
          expectedAstbSha256: record.astbSha256,
          expectedAstSha256: record.astSha256,
          expectedSvgSha256: record.svgSha256,
          authority: record.authority,
          badgeText: 'Cartridge Altered',
          badgeTooltip: `Altered / Remixed copy of ${record.title}. Live SHA-256 (${shortFmt(activeHash)}) differs from St Joseph's Curriculum seal (${shortFmt(record.seal)}).`
        };
      } else {
        result = {
          cartridgeId: id,
          status: 'verified-native',
          isNative: true,
          isVerified: true,
          tier: 'native',
          seal: record.seal,
          shortHash: shortFmt(record.seal || record.astSha256),
          computedAstbSha256: computedAstb || record.astbSha256,
          computedAstSha256: computedAst || record.astSha256,
          computedSvgSha256: computedSvg || record.svgSha256,
          expectedAstbSha256: record.astbSha256,
          expectedAstSha256: record.astSha256,
          expectedSvgSha256: record.svgSha256,
          authority: record.authority || "St Joseph's Catholic Primary School Curriculum Authority",
          badgeText: "St Joseph's Curriculum",
          badgeTooltip: `Verified St Joseph's Curriculum Cartridge (${record.title}). Signed by ${record.authority} • Seal: ${shortFmt(record.seal)}`
        };
      }
    }

    this.lastIntegrity = result;
    this.emit('integrityverified', result);
    this.notifyParent({
      type: 'CARTRIDGE_INTEGRITY',
      preset: id,
      integrity: result
    });
    return result;
  }
  }

  const ASTSceneLoader = {};
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
