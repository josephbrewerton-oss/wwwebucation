/**
 * static/player/player-ui-controls.js
 *
 * St Joseph's AST Vector Media Player — Parameter Controls, Keyframe Markers, 3D Camera & Catalog/Vault
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTPlayerUI.
 * Zero external dependencies; loaded before player-ui.js.
 * All methods execute with `this` bound to the ASTPlayerUI instance.
 */

(function (global) {
  'use strict';

  function getSceneCameraStops() {
    return (this.engine && this.engine.scene && Array.isArray(this.engine.scene.cameraStops))
      ? this.engine.scene.cameraStops
      : [];
  }

  function applyCameraStop(stop) {
    if (!stop || !this.engine || !this.engine.cameraOrbit) return;
    this.engine.cameraOrbit.yawOffset = Number(stop.yaw) || 0;
    this.engine.cameraOrbit.pitchOffset = Number(stop.pitch) || 0;
    this.engine.cameraOrbit.distanceScale = Number(stop.scale) || 1.0;
    if (typeof stop.t === 'number' && Number.isFinite(stop.t)) {
      this.engine.seek(stop.t);
    }
    this.engine.applyBindings(this.engine.progress);
    this.engine.emit('camerachange', { ...this.engine.cameraOrbit });
    this.update3DStatus();
  }

  function update3DStatus() {
    const is3D = Boolean(this.engine && this.engine.has3D());
    const hasCameraStops = this.getSceneCameraStops().length > 0;
    const hasQuests = this.getSceneQuestMissions().length > 0;

    if (this.elements.btn3DOrbit) {
      if (is3D) {
        this.elements.btn3DOrbit.classList.remove('hidden');
        this.elements.btn3DOrbit.style.display = '';
        const isModified = Boolean(
          this.engine.cameraOrbit &&
          (this.engine.cameraOrbit.yawOffset !== 0 ||
           this.engine.cameraOrbit.pitchOffset !== 0 ||
           this.engine.cameraOrbit.distanceScale !== 1.0)
        );
        this.elements.btn3DOrbit.classList.toggle('active', isModified);
        this.elements.btn3DOrbit.title = isModified
          ? 'Reset 3D Camera to Scene Default'
          : '3D Scene: Drag stage to orbit / Scroll to zoom / Click to reset';
      } else {
        this.elements.btn3DOrbit.classList.add('hidden');
        this.elements.btn3DOrbit.style.display = 'none';
      }
    }

    const stage = this.elements.playerStage || this.elements.stageSvg;
    if (stage) {
      stage.classList.toggle('has-3d-scene', is3D);
    }

    // Camera controls toolbar is only displayed for true 3D spatial scenes
    if (this.elements.cameraControlsBar) {
      this.elements.cameraControlsBar.classList.toggle('hidden', !is3D);
      this.elements.cameraControlsBar.style.display = is3D ? 'flex' : 'none';
    }

    // Scene-specific camera stop & quest controls driven declaratively by :camera-stops and :quests
    if (this.elements.churchCamButtons) {
      this.elements.churchCamButtons.classList.toggle('hidden', !hasCameraStops);
      this.elements.churchCamButtons.style.display = hasCameraStops ? 'inline-flex' : 'none';
    }

    if (this.elements.btnQuestMode) {
      this.elements.btnQuestMode.classList.toggle('hidden', !hasQuests);
      this.elements.btnQuestMode.style.display = hasQuests ? '' : 'none';
    }

    if (is3D && this.elements.orbitHint) {
      this.elements.orbitHint.classList.remove('hidden');
      this.elements.orbitHint.classList.remove('fade-out');
      this.elements.orbitHint.style.display = '';
      if (this._orbitHintTimeout) clearTimeout(this._orbitHintTimeout);
      this._orbitHintTimeout = setTimeout(() => {
        if (this.elements.orbitHint) {
          this.elements.orbitHint.classList.add('fade-out');
          setTimeout(() => {
            if (this.elements.orbitHint && this.elements.orbitHint.classList.contains('fade-out')) {
              this.elements.orbitHint.classList.add('hidden');
              this.elements.orbitHint.style.display = 'none';
            }
          }, 350);
        }
      }, 3200);
    } else if (this.elements.orbitHint) {
      this.elements.orbitHint.classList.add('hidden');
      this.elements.orbitHint.style.display = 'none';
    }
  }

  async function populatePresets() {
    if (!this.elements.presetSelector || this._isPopulating) return;
    this._isPopulating = true;
    try {
      let list = [];

      // 1. Check for Federated Manifest URLs (?manifest=... or ?catalog=...)
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const federatedUrls = urlParams ? (urlParams.get('manifest') || urlParams.get('catalog')) : null;

      if (federatedUrls) {
        const urls = federatedUrls.split(',').map(u => u.trim()).filter(Boolean);
        for (const fedUrl of urls) {
          try {
            const fedRes = await fetch(fedUrl).catch(() => null);
            if (fedRes && fedRes.ok) {
              const fedData = await fedRes.json();
              if (fedData && Array.isArray(fedData.scenes)) {
                fedData.scenes.forEach(sc => {
                  sc._source = 'federated';
                  sc._originUrl = fedUrl;
                  list.push(sc);
                });
              }
            }
          } catch (e) {
            console.warn('[Player UI] Federated manifest load notice for:', fedUrl, e);
          }
        }
      }

      // 2. Dynamic Auto-Find & Manifest Ingestion (Zero-Reindexing)
      try {
        if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.autoDiscover === 'function') {
          const autoResult = await global.ASTSceneRegistry.autoDiscover(this.engine.options.basePath || './');
          if (autoResult && Array.isArray(autoResult.scenes)) {
            autoResult.scenes.forEach(sc => {
              if (sc && sc.id && !list.some(item => item.id === sc.id)) {
                sc._source = 'builtin';
                list.push(sc);
              }
            });
          }
        }
      } catch (err) {
        console.warn('[Player UI] Auto-discover fallback notice:', err);
      }

      // 3. Fallback to in-memory scene registry
      if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.list === 'function') {
        const regList = global.ASTSceneRegistry.list();
        regList.forEach(sc => {
          if (!list.some(item => item.id === sc.id)) {
            list.push({ ...sc, _source: 'builtin' });
          }
        });
      }

      // If active preset is not yet in the list, auto-mount it
      if (this.engine.activePresetId && !list.some(item => item.id === this.engine.activePresetId)) {
        list.push({
          id: this.engine.activePresetId,
          title: (this.engine.scene && this.engine.scene.title) || this.engine.activePresetId,
          stage: (this.engine.scene && this.engine.scene.stage) || 'CURRICULUM',
          _source: 'builtin'
        });
      }

      // 4. Ingest In-Browser Local Vault (IndexedDB offline user simulations & custom cartridges)
      let vaultList = [];
      const _uiStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
      if (_uiStore) {
        try {
          const rawVault = _uiStore.getItem('ast_local_vault');
          if (rawVault) {
            const parsed = JSON.parse(rawVault);
            if (Array.isArray(parsed)) {
              vaultList = parsed.map(item => ({ ...item, _source: 'vault' }));
            }
          }
        } catch (e) {}

        try {
          const rawCustom = _uiStore.getItem('stj_custom_cartridges_v1');
          if (rawCustom) {
            const parsed = JSON.parse(rawCustom);
            if (Array.isArray(parsed)) {
              parsed.forEach(c => {
                if (c && c.id && !vaultList.some(v => v.id === c.id)) {
                  vaultList.push({
                    id: c.id,
                    title: c.title || c.id,
                    stage: c.stage || 'LOCAL VAULT',
                    _source: 'vault'
                  });
                }
              });
            }
          }
        } catch (e) {}
      }

      if (!list.length && !vaultList.length) {
        list = [
          { id: this.engine.activePresetId || 'standalone-stage', title: 'Standalone Vector Stage', stage: 'SYSTEM', _source: 'builtin' }
        ];
      }

      this._catalogScenes = list.concat(vaultList);
      const activeId = this.engine.activePresetId || (list[0] && list[0].id) || 'welcome';
      if (typeof this.elements.presetSelector.replaceChildren === 'function') this.elements.presetSelector.replaceChildren();
      else this.elements.presetSelector.textContent = '';

      // Create Local Vault OptGroup if items exist
      if (vaultList.length > 0) {
        const vaultGroup = document.createElement('optgroup');
        vaultGroup.label = '📦 In-Browser Vault (Offline)';
        vaultList.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          opt.textContent = `★ ${item.title || item.id} (${item.stage || 'VAULT'})`;
          if (item.id === activeId) opt.selected = true;
          vaultGroup.appendChild(opt);
        });
        this.elements.presetSelector.appendChild(vaultGroup);
      }

      // Create Federated OptGroup if items exist
      const fedItems = list.filter(item => item._source === 'federated');
      if (fedItems.length > 0) {
        const fedGroup = document.createElement('optgroup');
        fedGroup.label = '🌐 Federated Simulation Catalog';
        fedItems.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          opt.textContent = `${item.title} (${item.stage || 'FEDERATED'})`;
          if (item.id === activeId) opt.selected = true;
          fedGroup.appendChild(opt);
        });
        this.elements.presetSelector.appendChild(fedGroup);
      }

      // Built-in / Auto-Found Curriculum Groups categorized by 3 types: Sim, Slide, App
      // Exclude non-media :cartridge data packs (oak-data-*, pipeline-sample) unless actively loaded
      const builtInItems = list.filter(
        item => item._source === 'builtin' && (
          item.id === activeId || (item.isPlayableScene !== false && item.kind !== 'data')
        )
      );

      const simItems = builtInItems.filter(item => {
        const t = (item.type || 'Sim').toLowerCase();
        return t === 'sim' || t === 'simulation';
      });

      // Ensure welcome cartridge is placed at the top of simulations
      const welcomeIdx = simItems.findIndex(i => i.id === 'welcome');
      if (welcomeIdx > 0) {
        const [w] = simItems.splice(welcomeIdx, 1);
        simItems.unshift(w);
      } else if (welcomeIdx === -1) {
        simItems.unshift({
          id: 'welcome',
          title: 'Welcome to AST Vector Player & Educational Simulator',
          stage: 'PORTAL SHOWCASE',
          type: 'Sim',
          _source: 'builtin'
        });
      }

      const slideItems = builtInItems.filter(item => {
        const t = (item.type || '').toLowerCase();
        return t === 'slide' || t === 'slides' || t === 'presentation';
      });

      const appItems = builtInItems.filter(item => {
        const t = (item.type || '').toLowerCase();
        return t === 'app' || t === 'application' || t === 'game' || t === 'tool';
      });

      const filmItems = builtInItems.filter(item => {
        const t = (item.type || '').toLowerCase();
        return t === 'film' || t === 'video';
      });

      const otherItems = builtInItems.filter(item =>
        !simItems.includes(item) &&
        !slideItems.includes(item) &&
        !appItems.includes(item) &&
        !filmItems.includes(item)
      );

      const appendCategoryGroup = (label, color, items) => {
        if (!items || items.length === 0) return;
        const grp = document.createElement('optgroup');
        grp.label = label;
        grp.style.background = '#0f172a';
        grp.style.color = color;
        items.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          const oakPrefix = item.oakId ? `[${item.oakId}] ` : '';
          opt.textContent = `${oakPrefix}${item.title} (${item.stage})`;
          opt.style.background = '#0f172a';
          opt.style.color = '#f8fafc';
          if (item.id === activeId) opt.selected = true;
          grp.appendChild(opt);
        });
        this.elements.presetSelector.appendChild(grp);
      };

      appendCategoryGroup('🎮 Simulations (Sim)', '#38bdf8', simItems);
      appendCategoryGroup('📑 Interactive Slides (Slide)', '#34d399', slideItems);
      appendCategoryGroup('💻 Vector Applications (App)', '#fbbf24', appItems);
      appendCategoryGroup('🎬 Video / Film (Film)', '#f43f5e', filmItems);
      appendCategoryGroup('🔬 Curriculum Cartridges', '#a78bfa', otherItems);

      // Teacher Auto-Find Actions
      const actionGroup = document.createElement('optgroup');
      actionGroup.label = '⚡ Dynamic Auto-Finder';
      actionGroup.style.background = '#0f172a';
      actionGroup.style.color = '#fbbf24';
      const optFind = document.createElement('option');
      optFind.value = '__custom_find__';
      optFind.textContent = '🔍 Open Any Scene by Name / ID...';
      optFind.style.background = '#0f172a';
      optFind.style.color = '#f8fafc';
      actionGroup.appendChild(optFind);

      const optOpen = document.createElement('option');
      optOpen.value = '__open_local__';
      optOpen.textContent = '📂 Open Local .ast or .svg File...';
      optOpen.style.background = '#0f172a';
      optOpen.style.color = '#f8fafc';
      actionGroup.appendChild(optOpen);
      this.elements.presetSelector.appendChild(actionGroup);

      // Explicitly sync the select value to the engine's active preset
      if (activeId) {
        this.elements.presetSelector.value = activeId;
      }
    } finally {
      this._isPopulating = false;
    }
  }

  /**
   * Saves a simulation to the user's permanent browser local vault & IndexedDB
   */
  function saveToLocalVault(sceneData) {
    if (!sceneData || !sceneData.id) return;
    try {
      const id = sceneData.id || `custom_${Date.now()}`;
      const title = sceneData.title || sceneData.filename || id;
      const stage = sceneData.stage || 'LOCAL VAULT';
      const svgMarkup = sceneData.svgMarkup || sceneData.svgText || '';
      const astSource = sceneData.astSource || sceneData.astText || '';

      const item = {
        id,
        title,
        stage,
        category: sceneData.category || 'User Cartridges',
        svgMarkup,
        astSource,
        source: 'imported',
        tier: 'user',
        updatedAt: Date.now(),
        savedAt: new Date().toISOString()
      };

      // 1. Commit full payload to IndexedDB 'cartridges_vault'
      if (typeof indexedDB !== 'undefined') {
        const openReq = indexedDB.open('EdgeLearningEngineDB', 5);
        openReq.onupgradeneeded = () => {
          const db = openReq.result;
          if (!db.objectStoreNames.contains('cartridges_vault')) {
            db.createObjectStore('cartridges_vault', { keyPath: 'id' });
          }
        };
        openReq.onsuccess = () => {
          try {
            const db = openReq.result;
            if (db.objectStoreNames.contains('cartridges_vault')) {
              const tx = db.transaction('cartridges_vault', 'readwrite');
              tx.objectStore('cartridges_vault').put(item);
            }
          } catch (idbErr) {
            console.warn('[Player UI] IndexedDB write warning:', idbErr);
          }
        };
      }

      // 2. Synchronize index to IndexedDB-backed ASTLocalStore
      const _saveStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
      if (_saveStore) {
        try {
          let customList = [];
          const rawCustom = _saveStore.getItem('stj_custom_cartridges_v1');
          if (rawCustom) customList = JSON.parse(rawCustom) || [];
          const filteredCustom = customList.filter(c => c.id !== id);
          filteredCustom.unshift(item);
          _saveStore.setItem('stj_custom_cartridges_v1', JSON.stringify(filteredCustom.slice(0, 50)));

          let vaultStubs = [];
          const rawVault = _saveStore.getItem('ast_local_vault');
          if (rawVault) vaultStubs = JSON.parse(rawVault) || [];
          const filteredStubs = vaultStubs.filter(v => v.id !== id);
          filteredStubs.unshift({ id, title, stage, savedAt: item.savedAt });
          _saveStore.setItem('ast_local_vault', JSON.stringify(filteredStubs.slice(0, 50)));
        } catch (_) {}
      }

      // 3. Register in runtime ASTSceneRegistry if available
      if (typeof window !== 'undefined' && window.ASTSceneRegistry) {
        window.ASTSceneRegistry.register(id, {
          id,
          title,
          stage,
          svgMarkup,
          astSource,
        });
      }

      this.showToast(`💾 Saved to Local Vault: ${title}`);
      this.populatePresets();

      // 4. Notify parent window if running inside an iframe
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            source: 'ast-vector-player',
            type: 'CARTRIDGE_INGESTED',
            cartridge: { id, title, stage, svgMarkup, astSource }
          }, '*');
        } catch (_) {}
      }
    } catch (e) {
      console.warn('[Player UI] Could not save to local vault:', e);
    }
  }

  function setupKeyframeMarkers() {
    if (!this.elements.timelineTrack) return;
    // Remove old markers
    const oldMarkers = this.elements.timelineTrack.querySelectorAll('.keyframe-marker');
    oldMarkers.forEach(m => m.remove());

    const scene = this.engine.scene;
    if (!scene) return;

    const isSlide = Boolean(
      scene && (
        scene.type === 'Slide' ||
        scene.cartridgeType === 'Slide' ||
        scene.type === 'Film' ||
        scene.cartridgeType === 'Film' ||
        (Array.isArray(scene.keyframes) && scene.keyframes.length > 0)
      )
    );

    const isContinuousSim = !isSlide && Boolean(
      this.engine.isContinuousSim ||
      scene.type === 'Sim' ||
      scene.cartridgeType === 'Sim'
    );

    if (isContinuousSim) {
      if (this.elements.slideDeckBar) {
        this.elements.slideDeckBar.style.display = 'none';
      }
      if (this.elements.btnStepMode) {
        this.elements.btnStepMode.style.display = '';
      }
      if (this.elements.btnPrev) {
        this.elements.btnPrev.style.display = 'none';
      }
      if (this.elements.btnNext) {
        this.elements.btnNext.style.display = 'none';
      }
      return;
    } else {
      if (this.elements.slideDeckBar) {
        this.elements.slideDeckBar.style.display = '';
      }
      if (this.elements.btnStepMode) {
        this.elements.btnStepMode.style.display = '';
      }
      if (this.elements.btnPrev) {
        this.elements.btnPrev.style.display = '';
      }
      if (this.elements.btnNext) {
        this.elements.btnNext.style.display = '';
      }
    }

    if (!scene.keyframes) return;

    scene.keyframes.forEach(kf => {
      const marker = document.createElement('div');
      marker.className = 'keyframe-marker';
      marker.style.left = `${kf.t * 100}%`;
      marker.title = `${kf.title}: ${kf.rule}`;
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.seek(kf.t);
      });
      this.elements.timelineTrack.appendChild(marker);
    });

    if (scene.interactive && Array.isArray(scene.interactive.checkpoints)) {
      scene.interactive.checkpoints.forEach((cp, idx) => {
        const marker = document.createElement('div');
        marker.className = 'keyframe-marker';
        marker.style.left = `${cp.t * 100}%`;
        marker.style.background = '#f59e0b';
        marker.style.width = '6px';
        marker.style.height = '12px';
        marker.title = `🎯 Checkpoint: ${cp.title}`;
        marker.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engine.seek(cp.t);
          this.triggerCheckpoint(cp, idx);
        });
        this.elements.timelineTrack.appendChild(marker);
      });
    }

    // Populate interactive slide deck pills
    if (this.elements.slideDeckPills) {
      if (typeof this.elements.slideDeckPills.replaceChildren === 'function') this.elements.slideDeckPills.replaceChildren();
      else this.elements.slideDeckPills.textContent = '';
      const kfs = (scene && scene.keyframes) || [];
      kfs.forEach((kf, idx) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'slide-pill-btn';
        pill.setAttribute('data-slide-idx', String(idx));
        pill.setAttribute('data-slide-t', String(kf.t));
        pill.style.cssText = 'padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; white-space: nowrap; cursor: pointer; transition: all 0.15s ease;';
        pill.textContent = `Slide ${idx + 1}: ${kf.title}`;
        pill.title = `${kf.title}: ${kf.rule} (Click to jump to this slide)`;
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engine.seek(kf.t);
          this.onStopReached(kf.t);
        });
        this.elements.slideDeckPills.appendChild(pill);
      });
    }
  }

  /**
   * Fantasy Console / Lisp Machine AST Control Projection Subsystem
   * Reads (ui:controls ...) declared in active cartridge and dynamically
   * projects controls into in-stage glass overlay.
   */
  function projectControls(scene) {
    const stage = this.elements.playerStage || document.getElementById('player-stage') || document.body;
    if (!stage) return;

    const staleDeclarativeHud = document.getElementById('ast-declarative-hud');
    if (staleDeclarativeHud) staleDeclarativeHud.remove();
    const staleSimHud = document.getElementById('stage-sim-parameters');
    if (staleSimHud) staleSimHud.style.display = 'none';

    let overlay = document.getElementById('cartridge-controls-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cartridge-controls-overlay';
      overlay.className = 'cartridge-controls-overlay';
      stage.appendChild(overlay);
    }

    const paramHudOff = scene && scene.controls && (
      scene.controls['param-hud'] === false ||
      scene.controls[':param-hud'] === false ||
      scene.controls['param-hud'] === ':off' ||
      scene.controls['param-hud'] === 'off' ||
      scene.controls.paramHud === false
    );

    // Resolve deduplicated Parameters controls from engine (explicit :inputs win over :vars fallback)
    let controls = [];
    if (!paramHudOff && scene) {
      if (this.engine && typeof this.engine.resolveParameterControls === 'function') {
        controls = this.engine.resolveParameterControls(scene);
      } else {
        controls = scene.uiControls || scene.inputs || [];
      }
    }

    if (!controls || controls.length === 0) {
      overlay.classList.add('hidden');
      if (typeof overlay.replaceChildren === 'function') overlay.replaceChildren();
      else overlay.textContent = '';
      return;
    }

    overlay.classList.remove('hidden');
    const title = (scene && (scene.title || scene.id)) || 'Parameters';
    const body = this._h('div', { className: 'cartridge-controls-body' });
    const minBtn = this._h('button', {
      type: 'button',
      className: 'cartridge-controls-min-btn',
      title: 'Toggle Parameters',
      attrs: { 'aria-label': 'Toggle Parameters', 'aria-expanded': 'true' },
      text: '▾'
    });
    const headerEl = this._h('div', { className: 'cartridge-controls-header' },
      this._h('div', { className: 'cartridge-controls-title' },
        this._h('span', { className: 'cartridge-controls-chip', text: '⚡ Parameters' }),
        this._h('span', { className: 'cartridge-controls-name', text: title })
      ),
      minBtn
    );
    overlay.replaceChildren(headerEl, body);

    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCollapsed = body.classList.toggle('collapsed');
      minBtn.textContent = isCollapsed ? '▸' : '▾';
      minBtn.setAttribute('aria-expanded', String(!isCollapsed));
    });

    controls.forEach(ctrl => {
      const type = ctrl.type || 'slider';
      const id = ctrl.id || ctrl.var;
      const bindVar = ctrl.bind || ctrl.var;
      const label = ctrl.label || id;
      const action = ctrl.action;
      const curVal = bindVar && this.engine.getMemoryVar ? this.engine.getMemoryVar(bindVar) : (ctrl.default !== undefined ? ctrl.default : (ctrl.val ?? 0));

      const itemEl = document.createElement('div');
      itemEl.className = `cartridge-ctrl-item cartridge-ctrl-${type}`;
      itemEl.setAttribute('data-ctrl-id', id);
      if (bindVar) {
        itemEl.setAttribute('data-ctrl-bind', String(bindVar));
      }

      if (type === 'button') {
        const btn = this._h('button', {
          type: 'button',
          className: 'cartridge-ui-btn',
          id: `ctrl-btn-${id}`,
          text: label
        });
        itemEl.replaceChildren(btn);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (action && typeof this.engine.dispatchAction === 'function') {
            this.engine.dispatchAction(action);
          } else if (id === 'reset') {
            this.resetSimulation();
          }
        });
      } else if (type === 'toggle') {
        const isChecked = Boolean(curVal);
        const toggleText = this._h('span', { className: 'cartridge-ui-toggle-text', text: isChecked ? 'ON' : 'OFF' });
        const toggleBtn = this._h('button', {
          type: 'button',
          className: `cartridge-ui-toggle ${isChecked ? 'active' : ''}`,
          id: `ctrl-toggle-${id}`,
          attrs: { role: 'switch', 'aria-checked': String(isChecked) }
        },
          this._h('span', { className: 'cartridge-ui-toggle-thumb' }),
          toggleText
        );
        itemEl.replaceChildren(
          this._h('div', { className: 'cartridge-ui-toggle-row' },
            this._h('span', { className: 'cartridge-ui-label', text: label }),
            toggleBtn
          )
        );
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const nowChecked = toggleBtn.getAttribute('aria-checked') === 'true';
          const nextChecked = !nowChecked;
          toggleBtn.setAttribute('aria-checked', String(nextChecked));
          toggleBtn.classList.toggle('active', nextChecked);
          toggleText.textContent = nextChecked ? 'ON' : 'OFF';

          if (action && typeof this.engine.dispatchAction === 'function') {
            this.engine.dispatchAction(action, [nextChecked]);
          }
          if (bindVar && typeof this.engine.setMemoryVar === 'function') {
            this.engine.setMemoryVar(bindVar, nextChecked);
          }
        });
      } else if (type === 'slider') {
        const val = curVal !== undefined ? curVal : (ctrl.min || 0);
        const readout = this._h('span', { className: 'cartridge-ui-badge', id: `ctrl-val-${id}`, text: String(val) });
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'cartridge-ui-slider';
        slider.id = `ctrl-slider-${id}`;
        slider.min = String(ctrl.min !== undefined ? ctrl.min : 0);
        slider.max = String(ctrl.max !== undefined ? ctrl.max : 100);
        slider.step = String(ctrl.step !== undefined ? ctrl.step : 1);
        slider.value = String(val);

        itemEl.replaceChildren(
          this._h('div', { className: 'cartridge-ui-slider-box' },
            this._h('div', { className: 'cartridge-ui-slider-header' },
              this._h('span', { className: 'cartridge-ui-label', text: label }),
              readout
            ),
            slider
          )
        );
        slider.addEventListener('input', (e) => {
          const nextVal = parseFloat(e.target.value);
          readout.textContent = String(nextVal);
          if (bindVar && typeof this.engine.setMemoryVar === 'function') {
            this.engine.setMemoryVar(bindVar, nextVal);
          }
          if (action && typeof this.engine.dispatchAction === 'function') {
            this.engine.dispatchAction(action, [nextVal]);
          }
        });
      } else if (type === 'select') {
        const optionsList = Array.isArray(ctrl.options) ? ctrl.options : [];
        const sel = this._h('select', { className: 'cartridge-ui-select', id: `ctrl-select-${id}` },
          ...optionsList.map(opt => {
            const oEl = document.createElement('option');
            oEl.value = String(opt);
            oEl.textContent = String(opt);
            if (opt === curVal) oEl.selected = true;
            return oEl;
          })
        );
        if (curVal !== undefined) sel.value = String(curVal);
        itemEl.replaceChildren(
          this._h('div', { className: 'cartridge-ui-select-box' },
            this._h('span', { className: 'cartridge-ui-label', text: label }),
            sel
          )
        );
        sel.addEventListener('change', (e) => {
          const nextVal = e.target.value;
          if (bindVar && typeof this.engine.setMemoryVar === 'function') {
            this.engine.setMemoryVar(bindVar, nextVal);
          }
          if (action && typeof this.engine.dispatchAction === 'function') {
            this.engine.dispatchAction(action, [nextVal]);
          }
        });
      }

      body.appendChild(itemEl);
    });
  }

  function syncProjectedControls(varName, value) {
    const overlay = document.getElementById('cartridge-controls-overlay');
    if (!overlay) return;
    const isBatchReset = varName === '*';
    const cleanVar = !isBatchReset && this.engine && typeof this.engine.normalizeVarName === 'function'
      ? this.engine.normalizeVarName(varName)
      : String(varName || '').replace(/^\*|\*$/g, '');
    const cleanLower = cleanVar.toLowerCase();

    const items = overlay.querySelectorAll('.cartridge-ctrl-item');
    items.forEach(item => {
      const id = item.getAttribute('data-ctrl-id') || '';
      const rawBind = item.getAttribute('data-ctrl-bind') || id;
      const normBind = this.engine && typeof this.engine.normalizeVarName === 'function'
        ? this.engine.normalizeVarName(rawBind)
        : String(rawBind || '').replace(/^\*|\*$/g, '');
      const resolvedVal = isBatchReset
        ? (this.engine && typeof this.engine.getMemoryVar === 'function' ? this.engine.getMemoryVar(rawBind || id) : undefined)
        : value;
      const matches = isBatchReset ||
        id === cleanVar ||
        id === varName ||
        normBind === cleanVar ||
        normBind.toLowerCase() === cleanLower ||
        rawBind === varName;

      const slider = item.querySelector('.cartridge-ui-slider');
      if (slider && matches && resolvedVal !== undefined) {
        slider.value = String(resolvedVal);
        const badge = item.querySelector('.cartridge-ui-badge');
        if (badge) badge.textContent = String(resolvedVal);
      }
      const sel = item.querySelector('.cartridge-ui-select');
      if (sel && matches && resolvedVal !== undefined && sel.value !== String(resolvedVal)) {
        sel.value = String(resolvedVal);
      }
      const toggle = item.querySelector('.cartridge-ui-toggle');
      if (toggle && matches && resolvedVal !== undefined) {
        const boolVal = Boolean(resolvedVal);
        toggle.setAttribute('aria-checked', String(boolVal));
        toggle.classList.toggle('active', boolVal);
        const txt = item.querySelector('.cartridge-ui-toggle-text');
        if (txt) txt.textContent = boolVal ? 'ON' : 'OFF';
      }
    });
  }

  function resetSimulation() {
    this.targetStop = null;
    if (this.engine && typeof this.engine.dispatchAction === 'function') {
      this.engine.dispatchAction('sim:reset');
    } else if (this.engine) {
      if (typeof this.engine.seek === 'function') this.engine.seek(0.0);
      if (typeof this.engine.resetVars === 'function') this.engine.resetVars();
      if (this.engine.physics && typeof this.engine.physics.reset === 'function') this.engine.physics.reset();
      if (typeof this.engine.resetCamera === 'function') this.engine.resetCamera();
      if (typeof this.engine.applyBindings === 'function') {
        this.engine.applyBindings(0.0);
      }
    }
    if (typeof this.updateHeaderPlayUI === 'function') {
      this.updateHeaderPlayUI(Boolean(this.engine && this.engine.isPlaying));
    }
    if (typeof this.showToast === 'function') {
      this.showToast('↺ Simulation Reset to Initial State');
    }
  }

  function bindControlsDOMEvents(stage) {
    const el = this.elements;

    // Micro-Physics Live Sliders
    if (el.cfgPhysicsGravity) {
      el.cfgPhysicsGravity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.engine.physics) this.engine.physics.setGravity(val);
        if (el.cfgValGravity) el.cfgValGravity.textContent = `${(val / 100).toFixed(1)}g`;
      });
    }

    if (el.cfgPhysicsBounce) {
      el.cfgPhysicsBounce.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.engine.physics) this.engine.physics.setRestitution(val);
        if (el.cfgValBounce) el.cfgValBounce.textContent = `${Math.round(val * 100)}%`;
      });
    }

    if (el.cfgPhysicsFriction) {
      el.cfgPhysicsFriction.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.engine.physics) this.engine.physics.setFriction(val);
        if (el.cfgValFriction) el.cfgValFriction.textContent = `${(val * 100).toFixed(1)}%`;
      });
    }

    // Physics Environment Preset Buttons
    const physButtons = document.querySelectorAll('.phys-btn');
    physButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        physButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const grav = parseFloat(btn.getAttribute('data-gravity'));
        const bounce = parseFloat(btn.getAttribute('data-bounce'));
        const friction = parseFloat(btn.getAttribute('data-friction'));

        if (this.engine.physics) {
          this.engine.physics.setGravity(grav);
          this.engine.physics.setRestitution(bounce);
          this.engine.physics.setFriction(friction);
        }

        if (el.cfgPhysicsGravity) el.cfgPhysicsGravity.value = grav;
        if (el.cfgValGravity) el.cfgValGravity.textContent = `${(grav / 100).toFixed(1)}g`;
        if (el.cfgPhysicsBounce) el.cfgPhysicsBounce.value = bounce;
        if (el.cfgValBounce) el.cfgValBounce.textContent = `${Math.round(bounce * 100)}%`;
        if (el.cfgPhysicsFriction) el.cfgPhysicsFriction.value = friction;
        if (el.cfgValFriction) el.cfgValFriction.textContent = `${(friction * 100).toFixed(1)}%`;

        this.playChime(659.25, 'triangle');
        this.showToast(`🪐 Physics: ${btn.textContent.trim()} Active`);
      });
    });

    if (el.btnPhysicsImpulse) {
      el.btnPhysicsImpulse.addEventListener('click', () => {
        if (this.engine.physics) {
          for (const b of this.engine.physics.bodies) {
            this.engine.physics.applyImpulse(b.id, (Math.random() - 0.5) * 200, -500);
          }
          this.playChime(784, 'triangle');
          this.showToast('⚡ Jump Impulse Applied!');
        }
      });
    }

    if (el.btnPhysicsReset) {
      el.btnPhysicsReset.addEventListener('click', () => {
        if (this.engine.physics) {
          this.engine.physics.reset();
          this.playChime(523.25, 'sine');
          this.showToast('↺ Physics Coordinates Reset');
        }
      });
    }

    // 3D Reset / Orbit Toggle Button
    if (el.btn3DOrbit) {
      el.btn3DOrbit.addEventListener('click', () => {
        const isModified = Boolean(
          this.engine.cameraOrbit &&
          (this.engine.cameraOrbit.yawOffset !== 0 ||
           this.engine.cameraOrbit.pitchOffset !== 0 ||
           this.engine.cameraOrbit.distanceScale !== 1.0)
        );
        if (isModified) {
          this.engine.resetCamera();
          this.playChime(659.25, 'triangle');
          this.showToast('🌐 3D Camera Reset');
        } else {
          this.engine.rotateCamera(45, 18);
          this.playChime(587.33, 'triangle');
          this.showToast('🌐 3D Perspective Orbit (+45°)');
        }
        this.update3DStatus();
      });
    }

    // Interactive 3D Orbit Gestures on Viewport Stage (Mouse, Touch, Wheel, Double Click)
    let startOrbitX = 0;
    let startOrbitY = 0;
    let initialPinchDist = 0;

    if (stage) {
      stage.addEventListener('mousedown', (e) => {
        if (this.devModeActive || e.target.closest('button') || e.target.closest('select') || e.target.closest('.interactive-card') || e.target.closest('.dev-inspector-drawer') || e.target.closest('.dev-studio-drawer')) return;
        if (e.target.closest('[data-draggable], [data-bind-input], [data-declarative-clickable], [data-declarative-holdable], [data-declarative-trackball]')) return;
        if (window.__astGestures && typeof window.__astGestures._isControlEnabled === 'function' && !window.__astGestures._isControlEnabled('scrub')) return;
        if (this.engine.has3D()) {
          this.isOrbitDragging = true;
          startOrbitX = e.clientX;
          startOrbitY = e.clientY;
          stage.classList.add('is-orbiting');
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isOrbitDragging && this.engine.has3D()) {
          const dx = e.clientX - startOrbitX;
          const dy = e.clientY - startOrbitY;
          startOrbitX = e.clientX;
          startOrbitY = e.clientY;
          this.engine.rotateCamera(dx * 0.45, -dy * 0.45);
        }
      });

      window.addEventListener('mouseup', () => {
        if (this.isOrbitDragging) {
          this.isOrbitDragging = false;
          if (stage) stage.classList.remove('is-orbiting');
        }
      });

      // Touch gestures for iPad and mobile devices
      stage.addEventListener('touchstart', (e) => {
        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('.interactive-card')) return;
        if (this.engine.has3D()) {
          if (e.touches.length === 1) {
            this.isOrbitDragging = true;
            startOrbitX = e.touches[0].clientX;
            startOrbitY = e.touches[0].clientY;
          } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDist = Math.hypot(dx, dy);
          }
        }
      }, { passive: true });

      stage.addEventListener('touchmove', (e) => {
        if (this.isOrbitDragging && e.touches.length === 1 && this.engine.has3D()) {
          const dx = e.touches[0].clientX - startOrbitX;
          const dy = e.touches[0].clientY - startOrbitY;
          startOrbitX = e.touches[0].clientX;
          startOrbitY = e.touches[0].clientY;
          this.engine.rotateCamera(dx * 0.55, -dy * 0.55);
        } else if (e.touches.length === 2 && this.engine.has3D()) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          if (initialPinchDist > 0) {
            const pinchDelta = (dist - initialPinchDist) / initialPinchDist;
            this.engine.zoomCamera(pinchDelta * 0.1);
            initialPinchDist = dist;
          }
        }
      }, { passive: true });

      stage.addEventListener('touchend', () => {
        this.isOrbitDragging = false;
        initialPinchDist = 0;
      });

      // Scroll wheel to zoom
      stage.addEventListener('wheel', (e) => {
        if (this.engine.has3D()) {
          e.preventDefault();
          this.engine.zoomCamera(-e.deltaY * 0.0015);
        }
      }, { passive: false });

      // Double click to reset orientation
      stage.addEventListener('dblclick', (e) => {
        if (e.target.closest('button') || e.target.closest('select')) return;
        if (this.engine.has3D()) {
          this.engine.resetCamera();
          this.playChime(659.25, 'triangle');
          this.showToast('🌐 3D Camera Reset');
        }
      });
    }

    // 3D Camera Viewpoints Presets Toolbar
    if (el.cameraControlsBar) {
      el.cameraControlsBar.querySelectorAll('.cam-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const camType = (btn.getAttribute('data-cam') || '').toLowerCase();
          const stops = this.getSceneCameraStops();
          const matchedStop = stops.find(s => s.id === camType || (Array.isArray(s.aliases) && s.aliases.includes(camType)));
          if (matchedStop) {
            this.applyCameraStop(matchedStop);
            if (matchedStop.toast) this.showToast(matchedStop.toast);
            this.playChime(587.33, 'triangle');
            return;
          }
          if (camType === 'orbit') {
            this.engine.rotateCamera(45, 0);
            this.showToast('🔄 Orbiting +45° in 3D');
          } else if (camType === 'reset') {
            this.engine.resetCamera();
            this.showToast('🌐 3D Camera Reset');
          }
          this.engine.applyBindings(this.engine.progress);
          this.playChime(587.33, 'triangle');
          this.update3DStatus();
        });
      });
    }
  }

  const ASTPlayerUIControls = {
    getSceneCameraStops,
    applyCameraStop,
    update3DStatus,
    populatePresets,
    saveToLocalVault,
    setupKeyframeMarkers,
    projectControls,
    syncProjectedControls,
    resetSimulation,
    bindControlsDOMEvents
  };

  global.ASTPlayerUIControls = ASTPlayerUIControls;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIControls = ASTPlayerUIControls;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTPlayerUIControls;
  }
})(typeof window !== 'undefined' ? window : globalThis);
