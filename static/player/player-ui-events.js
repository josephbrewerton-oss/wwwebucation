/**
 * static/player/player-ui-events.js
 *
 * St Joseph's AST Vector Media Player — DOM Event Bindings, Keyboard Navigation,
 * Host PostMessage Listener, Engine Event Hooks & View Sync
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTPlayerUI.
 * Zero external dependencies; loaded before player-ui.js.
 * All methods execute with `this` bound to the ASTPlayerUI instance.
 */

(function (global) {
  'use strict';

  function updateView(skipVectorRender = false) {
    const scene = this.engine?.scene;
    const cache = this._viewCache || (this._viewCache = {});
    const sceneChanged = cache.scene !== scene;
    const pct = (this.engine.progress * 100).toFixed(1);
    const pctChanged = cache.pct !== pct;

    if (sceneChanged) {
      cache.scene = scene;
      if (this.elements.badgeStage) {
        this.elements.badgeStage.textContent = (scene && scene.stage) ? scene.stage : 'CURRICULUM';
      }
      this.updateBslButton();
    }

    // Explicit Sim / App scenes must never be misclassified as Slides simply because they include :keyframes metadata
    const explicitType = scene && (scene.type || scene.cartridgeType);
    const isExplicitSim = explicitType === 'Sim' || explicitType === 'App';
    const isSlide = !isExplicitSim && Boolean(
      scene && (
        explicitType === 'Slide' ||
        explicitType === 'Film' ||
        (Array.isArray(scene.keyframes) && scene.keyframes.length > 0)
      )
    );

    const isContinuousSim = !isSlide && Boolean(
      this.engine.isContinuousSim ||
      isExplicitSim
    );

    // Highlight active slide pill only when scene or active keyframe index actually changes
    if (this.elements.slideDeckPills && scene && Array.isArray(scene.keyframes) && !isContinuousSim) {
      const curT = this.engine.progress;
      let activeIdx = 0;
      scene.keyframes.forEach((kf, idx) => {
        if (kf.t <= curT + 0.02) activeIdx = idx;
      });
      if (sceneChanged || cache.activePillIdx !== activeIdx) {
        cache.activePillIdx = activeIdx;
        const pills = this.elements.slideDeckPills.querySelectorAll('.slide-pill-btn');
        pills.forEach((p, idx) => {
          if (idx === activeIdx) {
            p.style.background = '#0284c7';
            p.style.borderColor = '#38bdf8';
            p.style.color = '#ffffff';
            p.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.5)';
          } else {
            p.style.background = 'rgba(30, 41, 59, 0.85)';
            p.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            p.style.color = '#cbd5e1';
            p.style.boxShadow = 'none';
          }
        });
      }
    }

    // Render vector SVG via direct element attribute patching (skip during engine tick where applyBindings runs immediately after timeupdate)
    if (!skipVectorRender && this.elements.sceneRoot) {
      this.engine.renderCurrentVector(this.elements.sceneRoot);
    }

    // Subtitles (skip redundant DOM writes when unchanged)
    if (this.elements.subtitleOverlay && (sceneChanged || pctChanged || !isContinuousSim)) {
      const sub = this.engine.getCurrentSubtitle();
      const subKey = sub
        ? (typeof sub === 'object' ? `${sub.en || ''}\u0000${sub.localized || ''}` : String(sub))
        : `__title__:${(scene && scene.title) ? scene.title : 'AST Vector Media Player'}`;
      if (cache.subKey !== subKey) {
        cache.subKey = subKey;
        if (sub) {
          this.elements.subtitleOverlay.style.opacity = '1';
          if (typeof sub === 'object' && sub !== null && sub.localized && sub.en) {
            this.elements.subtitleOverlay.replaceChildren(
              this._h('div', { css: 'font-size: 0.95em; color: #f8fafc; font-weight: 700; line-height: 1.3;', text: sub.en }),
              this._h('div', { css: 'font-size: 0.84em; color: #38bdf8; font-weight: 600; line-height: 1.3; margin-top: 3px;', text: `🌐 ${sub.localized}` })
            );
          } else {
            this.elements.subtitleOverlay.textContent = typeof sub === 'string' ? sub : (sub.localized || sub.en || '');
          }
          if (this.obs && this.obs.isConnected && this.obs.settings.syncSubtitles) {
            const obsText = typeof sub === 'object' && sub !== null ? `${sub.en}\n(${sub.localized})` : String(sub);
            if (obsText !== this._lastSentObsSubtitle) {
              this._lastSentObsSubtitle = obsText;
              this.obs.updateTextSource(this.obs.settings.subtitleSource, obsText);
            }
          }
        } else {
          this.elements.subtitleOverlay.style.opacity = '0.7';
          this.elements.subtitleOverlay.textContent = (scene && scene.title) ? scene.title : 'AST Vector Media Player';
        }
      }
    }

    // Ambient Hairline and Legacy Scrubber (only touch DOM when percentage changes)
    if (sceneChanged || pctChanged) {
      cache.pct = pct;
      if (this.elements.ambientTimelineFill) {
        this.elements.ambientTimelineFill.style.width = `${pct}%`;
      }
      if (this.elements.ambientTimelineThumb) {
        this.elements.ambientTimelineThumb.style.left = `${pct}%`;
      }
      if (this.elements.timelineFill) {
        this.elements.timelineFill.style.width = `${pct}%`;
      }
      if (this.elements.timelineThumb) {
        this.elements.timelineThumb.style.left = `${pct}%`;
      }
    }

    // On simulations, switch off the timeline scrubber and step buttons (only update on mode/scene change)
    if (sceneChanged || cache.isContinuousSim !== isContinuousSim) {
      cache.isContinuousSim = isContinuousSim;
      if (this.elements.scrubberBox) {
        this.elements.scrubberBox.style.display = isContinuousSim ? 'none' : (this.displayConfig?.showTimelineScrubber !== false ? '' : 'none');
      }
      if (this.elements.btnPrev) {
        this.elements.btnPrev.style.display = isContinuousSim ? 'none' : (this.displayConfig?.showPlaybackControls !== false ? '' : 'none');
      }
      if (this.elements.btnNext) {
        this.elements.btnNext.style.display = isContinuousSim ? 'none' : (this.displayConfig?.showPlaybackControls !== false ? '' : 'none');
      }
    }

    if (this.elements.timeReadout && (sceneChanged || pctChanged)) {
      let nextReadout = '';
      if (isContinuousSim) {
        nextReadout = '⚡ 60 FPS Interactive Lab';
      } else {
        const kfs = (scene && scene.keyframes) || [];
        if (kfs.length > 0) {
          const curT = this.engine.progress;
          let activeIdx = 0;
          kfs.forEach((kf, idx) => {
            if (kf.t <= curT + 0.02) activeIdx = idx;
          });
          const curKf = kfs[activeIdx];
          const cleanTitle = (curKf && curKf.title) ? curKf.title.replace(/^\d+[\.\s]*/, '') : 'Interactive Slide';
          nextReadout = `Slide ${activeIdx + 1} of ${kfs.length}: ${cleanTitle}`;
        } else {
          const curSec = Math.floor(this.engine.progress * (this.engine.durationSec || 10));
          const totalSec = Math.floor(this.engine.durationSec || 10);
          nextReadout = `${this.formatTime(curSec)} / ${this.formatTime(totalSec)} (${pct}%)`;
        }
      }
      if (cache.timeReadout !== nextReadout) {
        cache.timeReadout = nextReadout;
        this.elements.timeReadout.textContent = nextReadout;
      }
    }
  }

  function bindDOMEvents() {
    const el = this.elements;

    // Scrubber drag / click
    if (el.scrubberBox) {
      el.scrubberBox.addEventListener('click', (e) => this.handleScrubberClick(e));

      el.scrubberBox.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.handleScrubberClick(e);
      });

      el.scrubberBox.addEventListener('touchstart', (e) => {
        this.isDragging = true;
        this.handleScrubberClick(e);
      }, { passive: true });
    }

    // Ambient Hairline Timeline Scrubbing
    if (el.ambientTimeline) {
      const handleAmbientScrub = (e) => {
        const rect = el.ambientTimeline.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const targetT = clickX / rect.width;
        this.engine.seek(targetT);
        this.updateView();
      };

      el.ambientTimeline.addEventListener('click', (e) => handleAmbientScrub(e));

      el.ambientTimeline.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        handleAmbientScrub(e);
      });

      el.ambientTimeline.addEventListener('touchstart', (e) => {
        this.isDragging = true;
        handleAmbientScrub(e);
      }, { passive: true });
    }

    // PhET-Grade Touch Substrate: Touching the stage never pauses or halts the dynamic simulation.
    // Spacebar or in-graphics controls handle explicit physics clock pausing.

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) this.handleScrubberClick(e);
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging) this.handleScrubberClick(e);
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) this.isDragging = false;
    });

    window.addEventListener('touchend', () => {
      if (this.isDragging) this.isDragging = false;
    });

    // Standalone Drag & Drop File Handling (.json, .ast, .svg)
    const stageWrap = el.stageWrap || document.getElementById('stage-wrap') || el.stage;
    if (stageWrap) {
      stageWrap.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stageWrap.classList.add('drag-drop-active');
      });

      stageWrap.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stageWrap.classList.remove('drag-drop-active');
      });

      const handleLocalFiles = (filesList) => {
        if (!filesList || !filesList.length) return;
        const arr = Array.from(filesList);
        const swfFile = arr.find((f) => f && typeof f.name === 'string' && /\.swf$/i.test(f.name));
        if (swfFile && window.parent && window.parent !== window) {
          this.showToast(`⚡ Transpiling Flash file "${swfFile.name}"...`, 3500);
          swfFile.arrayBuffer().then((buf) => {
            window.parent.postMessage({ type: 'INGEST_SWF_FILE', name: swfFile.name, buffer: buf }, '*', [buf]);
          }).catch((err) => {
            this.showToast('❌ Could not read Flash file: ' + (err?.message || 'read error'), 4500);
          });
          return;
        }
        const loader = (this.engine.loadFiles ? this.engine.loadFiles(filesList, true) : this.engine.loadFromFile(filesList[0], true));
        loader.then((scene) => {
          if (filesList.length > 1) {
            this.showToast(`✨ Merged Dual Cartridge: ${scene?.title || 'Pair Loaded'}`);
          }
        }).catch((err) => {
          this.showToast('❌ ' + err.message, 4500);
        });
      };

      stageWrap.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stageWrap.classList.remove('drag-drop-active');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          handleLocalFiles(e.dataTransfer.files);
        }
      });
    }

    // Native Open File Picker for Touch Screens & Smartboards
    const btnOpen = el.btnOpenFile || el.btnOpenCartridge || document.getElementById('btn-open-file') || document.getElementById('btn-open-cartridge');
    const fileInput = el.fileInputHidden || document.getElementById('file-input-hidden');
    if (btnOpen && fileInput) {
      btnOpen.addEventListener('click', () => {
        fileInput.click();
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
          const files = e.target.files;
          const swfFile = Array.from(files).find((f) => f && typeof f.name === 'string' && /\.swf$/i.test(f.name));
          if (swfFile && window.parent && window.parent !== window) {
            this.showToast(`⚡ Transpiling Flash file "${swfFile.name}"...`, 3500);
            swfFile.arrayBuffer().then((buf) => {
              window.parent.postMessage({ type: 'INGEST_SWF_FILE', name: swfFile.name, buffer: buf }, '*', [buf]);
            }).catch((err) => {
              this.showToast('❌ Could not read Flash file: ' + (err?.message || 'read error'), 4500);
            });
          } else {
            const loader = (this.engine.loadFiles ? this.engine.loadFiles(files, true) : this.engine.loadFromFile(files[0], true));
            loader.then((scene) => {
              if (files.length > 1) {
                this.showToast(`✨ Merged Dual Cartridge: ${scene?.title || 'Pair Loaded'}`);
              }
            }).catch((err) => {
              this.showToast('❌ ' + err.message, 4500);
            });
          }
          fileInput.value = '';
        }
      });
    }

    // Controls
    if (el.btnStepMode) {
      el.btnStepMode.addEventListener('click', () => {
        this.toggleStepMode();
      });
    }

    if (el.btnHeaderPlay) {
      el.btnHeaderPlay.addEventListener('click', () => {
        if (this.engine) {
          const playing = this.engine.togglePlay();
          this.updateHeaderPlayUI(playing, true);
        }
      });
    }

    if (el.btnPlay) {
      el.btnPlay.addEventListener('click', () => {
        if (this.engine) {
          const playing = this.engine.togglePlay();
          this.updateHeaderPlayUI(playing, true);
        }
      });
    }

    if (el.btnPrev) {
      el.btnPrev.addEventListener('click', () => {
        const scene = this.engine && this.engine.scene;
        if (this.stepMode || (scene && scene.keyframes && scene.keyframes.length > 0)) {
          this.stepToPrevKeyframe();
        } else {
          this.engine.step(-0.05);
        }
      });
    }

    if (el.btnNext) {
      el.btnNext.addEventListener('click', () => {
        const scene = this.engine && this.engine.scene;
        if (this.stepMode || (scene && scene.keyframes && scene.keyframes.length > 0)) {
          this.stepToNextKeyframe();
        } else {
          this.engine.step(0.05);
        }
      });
    }

    if (el.btnReset) {
      el.btnReset.addEventListener('click', () => {
        this.resetSimulation();
      });
    }

    // Loop toggle button
    if (el.btnLoop) {
      el.btnLoop.classList.toggle('active', this.engine.loop);
      el.btnLoop.addEventListener('click', () => {
        const loop = this.engine.toggleLoop();
        el.btnLoop.classList.toggle('active', loop);
        if (el.loopLabel) el.loopLabel.textContent = loop ? 'Loop: ON' : 'Loop: OFF';
        this.showToast(loop ? '🔁 Auto-Repeat Loop: ON' : '🔁 Auto-Repeat Loop: OFF');
      });
    }

    // Master Audio Volume & Mute Controls
    if (el.volumeSlider) {
      el.volumeSlider.value = this.engine.volume;
      el.volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        if (vol > 0 && this.engine.audioSynth && typeof this.engine.audioSynth.unlock === 'function') {
          this.engine.audioSynth.unlock();
        }
        this.engine.setVolume(vol);
        if (el.btnVolumeMute) {
          el.btnVolumeMute.textContent = vol === 0 ? '🔇' : (vol < 0.5 ? '🔉' : '🔊');
        }
      });
    }

    if (el.btnVolumeMute) {
      el.btnVolumeMute.addEventListener('click', () => {
        const muted = this.engine.toggleMute();
        if (!muted && this.engine.audioSynth && typeof this.engine.audioSynth.unlock === 'function') {
          this.engine.audioSynth.unlock();
        }
        el.btnVolumeMute.textContent = muted ? '🔇' : (this.engine.volume < 0.5 ? '🔉' : '🔊');
        if (el.volumeSlider) {
          el.volumeSlider.value = muted ? 0 : this.engine.volume;
        }
        this.showToast(muted ? '🔇 Audio Muted' : `🔊 Audio: ${Math.round(this.engine.volume * 100)}%`);
      });
    }

    // Shortcuts Modal Handlers
    if (el.btnShortcuts) {
      el.btnShortcuts.addEventListener('click', () => {
        this.toggleShortcutsModal();
      });
    }

    if (el.shortcutsClose) {
      el.shortcutsClose.addEventListener('click', () => {
        this.closeShortcutsModal();
      });
    }

    // Micro-Physics Live Sliders & Environment Presets are wired in bindControlsDOMEvents(stage)

    if (el.speedSelector) {
      el.speedSelector.addEventListener('change', (e) => {
        this.engine.setSpeed(e.target.value);
      });
    }

    if (el.presetSelector) {
      el.presetSelector.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === '__custom_find__') {
          const id = prompt('Enter scene filename or ID to auto-find (e.g. electric-circuits or your-new-file):');
          if (id && id.trim()) {
            this.engine.loadScene(id.trim(), true).then(loaded => {
              if (!loaded) {
                this.showToast('❌ Scene "' + id.trim() + '" not found in ./scenes/', 3500);
                el.presetSelector.value = this.engine.activePresetId || '';
              }
            });
          } else {
            el.presetSelector.value = this.engine.activePresetId || '';
          }
          return;
        }
        if (val === '__open_local__') {
          const fileInputEl = el.fileInputHidden || document.getElementById('file-input-hidden');
          if (fileInputEl) fileInputEl.click();
          el.presetSelector.value = this.engine.activePresetId || '';
          return;
        }
        if (val) {
          this.engine.setPreset(val, true);
          if (this.engine && typeof this.engine.notifyParent === 'function') {
            this.engine.notifyParent({
              type: 'PRESETCHANGE',
              preset: val,
              title: el.presetSelector.options[el.presetSelector.selectedIndex]?.textContent || val,
            });
          }
        }
      });
    }

    if (el.langSelector) {
      el.langSelector.addEventListener('change', (e) => {
        this.engine.setLanguage(e.target.value);
        this.updateView();
      });
    }

    if (el.btnNarrate) {
      const isVoiceOn = Boolean(this.engine.voiceEnabled);
      el.btnNarrate.classList.toggle('active', isVoiceOn);
      el.btnNarrate.textContent = isVoiceOn ? '🔊 Voice: ON' : '🔊 Voice';

      el.btnNarrate.addEventListener('click', () => {
        const enabled = this.engine.toggleVoice();
        el.btnNarrate.classList.toggle('active', enabled);
        el.btnNarrate.textContent = enabled ? '🔊 Voice: ON' : '🔊 Voice';
        if (enabled) {
          if (this.engine.audioSynth && typeof this.engine.audioSynth.unlock === 'function') {
            this.engine.audioSynth.unlock();
          }
          const currentSub = this.engine.getCurrentSubtitle() || (this.engine.scene && this.engine.scene.title) || '';
          if (currentSub) this.engine.speakText(currentSub, { immediate: true });
        }
      });
    }

    if (el.btnBsl) {
      el.btnBsl.addEventListener('click', () => {
        this.toggleBsl();
      });
    }

    if (el.btnVoiceCmd) {
      el.btnVoiceCmd.addEventListener('click', () => {
        this.toggleVoiceCommands();
      });
    }

    if (el.btnTheme) {
      el.btnTheme.addEventListener('click', () => this.toggleTheme());
    }

    if (el.btnFullscreen) {
      el.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    if (el.btnPip) {
      el.btnPip.addEventListener('click', () => {
        this.togglePictureInPicture();
      });
    }

    if (el.btnPrint) {
      el.btnPrint.addEventListener('click', () => window.print());
    }

    if (el.btnLogJotterCsv) {
      el.btnLogJotterCsv.addEventListener('click', (e) => {
        this.logDataToJotterCsv(Boolean(e && e.shiftKey));
      });
    }

    if (el.btnCopySvg && el.stageSvg) {
      el.btnCopySvg.addEventListener('click', () => {
        const rawSvg = el.stageSvg.outerHTML;
        navigator.clipboard.writeText(rawSvg).then(() => {
          const orig = el.btnCopySvg.textContent;
          el.btnCopySvg.textContent = '✓ Copied!';
          setTimeout(() => { el.btnCopySvg.textContent = orig; }, 2000);
        }).catch(() => {});
      });
    }

    if (el.badgeNativeSeal) {
      el.badgeNativeSeal.addEventListener('click', () => {
        const currentPreset = this.engine && (this.engine.activePresetId || this.engine.preset);
        const info = this.engine && this.engine.lastIntegrity;
        if (info && info.status === 'verified-native') {
          this.showToast(
            `🛡️ Verified • St Joseph's Curriculum [${info.cartridgeId}] • Seal ${info.shortHash} • ${info.authority}`,
            4800
          );
        } else if (info && info.status === 'tampered') {
          this.showToast(
            `✎ Altered / Remix [${info.cartridgeId}] • Live SHA-256 ${info.shortHash} (differs from St Joseph's Curriculum seal)`,
            4800
          );
        } else if (info) {
          this.showToast(
            `◈ Community / Custom Cartridge [${info.cartridgeId}] • SHA-256 ${info.shortHash}`,
            4500
          );
        } else {
          this.showToast(`🛡️ Verifying St Joseph's Curriculum SHA-256 seal for [${currentPreset || 'Simulation'}]...`, 3200);
        }
      });
    }

    // Interactive Toggle Button
    if (el.btnInteractive) {
      el.btnInteractive.classList.toggle('active', this.interactiveMode);
      el.btnInteractive.addEventListener('click', (e) => {
        if (e && e.shiftKey) {
          this.toggleInteractiveMode();
          return;
        }
        this.toggleCheckpointView();
      });
      el.btnInteractive.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.toggleInteractiveMode();
      });
    }

    // --- 3D Camera Orbit, Camera Stops & Micro-Physics Event Bindings (delegated to player-ui-controls.js) ---
    const stage = el.playerStage || el.stageSvg;
    this.bindControlsDOMEvents(stage);

    // Host Parent-Window PostMessage Control Listener
    window.addEventListener('message', (e) => {
      if (e.source !== window.parent && e.source !== window) return;
      if (typeof e.origin !== 'string') return;
      const localOrigin = window.location && typeof window.location.origin === 'string' ? window.location.origin : '';
      if (e.origin !== localOrigin && e.origin !== 'null') return;

      const data = e.data;
      if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;

      if (data.type === 'SET_PRESET' && typeof data.preset === 'string') {
        const safePreset = /^[a-z0-9][a-z0-9-_]{0,63}$/i.test(data.preset) ? data.preset : null;
        if (!safePreset) return;
        if (el.presetSelector && el.presetSelector.value !== safePreset) {
          el.presetSelector.value = safePreset;
        }
        // When ast-bridge.js is active it owns SET_PRESET/PLAY/PAUSE/TOGGLE_PLAY dispatch;
        // executing both caused double-toggle bugs that immediately cancelled host Play clicks.
        if (!window.__astBridgeActive && this.engine) {
          this.engine.setPreset(safePreset, Boolean(data.play));
          this.updateHeaderPlayUI(Boolean(data.play));
        }
      } else if (data.type === 'PLAY') {
        if (!window.__astBridgeActive && this.engine) {
          this.engine.play();
          this.updateHeaderPlayUI(true, true);
        }
      } else if (data.type === 'PAUSE') {
        if (!window.__astBridgeActive && this.engine) {
          this.engine.pause();
          this.updateHeaderPlayUI(false, true);
        }
      } else if (data.type === 'TOGGLE_PLAY') {
        if (!window.__astBridgeActive && this.engine) {
          const playing = this.engine.togglePlay();
          this.updateHeaderPlayUI(playing, true);
        }
      } else if (data.type === 'TRIGGER_OPEN_LOCAL') {
        const fileInputEl = el.fileInputHidden || document.getElementById('file-input-hidden');
        if (fileInputEl) fileInputEl.click();
      } else if (data.type === 'REFRESH_PRESETS') {
        this.populatePresets();
      } else if (data.type === 'RESET_SIM') {
        if (!window.__astBridgeActive) {
          this.resetSimulation();
        }
      } else if (data.type === 'LOAD_CUSTOM_CARTRIDGE' && data.cartridge) {
        if (window.__astBridgeActive) return;
        const c = data.cartridge;
        if (window.ASTSceneRegistry && typeof window.ASTSceneRegistry.register === 'function') {
          window.ASTSceneRegistry.register(c.id, {
            id: c.id,
            title: c.title,
            stage: c.stage || 'CUSTOM',
            svgMarkup: c.svgMarkup,
            astSource: c.astSource,
          });
        }
        try { this.saveToLocalVault(c); } catch (_) {}
        this.populatePresets();
        const handled = window.__astHandledCustomCartridgeEvents || (window.__astHandledCustomCartridgeEvents = new WeakSet());
        if (this.engine && c.svgMarkup && c.astSource && !handled.has(e) && !handled.has(c)) {
          handled.add(e);
          handled.add(c);
          Promise.resolve()
            .then(() => {
              if (typeof this.engine.loadSceneData === 'function') {
                return this.engine.loadSceneData(c, data.play !== false);
              }
              return this.engine.loadScene(c.id, data.play !== false);
            })
            .then(() => {
              this.updateHeaderPlayUI(Boolean(this.engine?.isPlaying));
            })
            .catch((err) => {
              console.error('[PlayerUI] Failed to load custom cartridge:', err);
              if (typeof this.engine.notifyParent === 'function') {
                this.engine.notifyParent({
                  type: 'CARTRIDGE_LOAD_ERROR',
                  message: err && err.message ? err.message : String(err)
                });
              }
            });
        }
      } else if (data.type === 'OPEN_STUDIO') {
        const requestedTab = typeof data.tab === 'string' ? data.tab : 'ast';
        this.openDevStudio(requestedTab);
        if (data.openSaveAs) {
          this.openSaveAsBar();
        }
      } else if (data.type === 'REMIX_SAVED_ACK' && data.message) {
        this.showToast(String(data.message));
      } else if (data.type === 'NANO_REMIX_RESULT' && data.proposal) {
        this.handleNanoRemixResult(data.proposal);
      }
    });

    // Interactive Card Close Button & Minimize Toggle
    if (el.interactiveClose) {
      el.interactiveClose.addEventListener('click', () => {
        this.closeInteractiveCard(false);
        this.showToast('🎯 Question dismissed. Press [Q] to re-open.');
      });
    }
    if (el.interactiveToggleMin) {
      el.interactiveToggleMin.addEventListener('click', () => {
        this.minimizeInteractiveCard();
      });
    }
    if (el.btnRestoreCheckpoint) {
      el.btnRestoreCheckpoint.addEventListener('click', () => {
        this.restoreInteractiveCard();
      });
    }

    // Interactive Suite Mode Button (Zero-Chrome Edge-to-Edge Instrument)
    if (el.btnSuiteMode) {
      el.btnSuiteMode.addEventListener('click', () => {
        const isSuite = this.displayConfig && this.displayConfig.mode === 'suite';
        this.setDisplayMode(isSuite ? 'classroom' : 'suite');
      });
    }

    // Interactive Play Mode Button
    if (el.btnPlayMode) {
      el.btnPlayMode.addEventListener('click', () => {
        this.engine.pause();
        this.showToast('🎮 Interactive Play Mode Active');
        el.btnPlayMode.classList.toggle('active');
        this.engine.notifyParent({
          type: 'TOGGLE_PLAY_MODE',
          preset: this.engine.activePresetId,
          source: 'player-ui'
        });
        if (this.getSceneQuestMissions().length > 0) {
          this.startQuestMode();
        }
      });
    }

    // Whiteboard Marker Pill Button
    if (el.btnPen) {
      el.btnPen.addEventListener('click', () => {
        if (window.__astGestures && typeof window.__astGestures.togglePen === 'function') {
          window.__astGestures.togglePen();
        } else {
          window.postMessage({ type: 'TOGGLE_PEN' }, '*');
        }
      });
    }

    // 3D Pilgrim Quest Mode Button
    if (el.btnQuestMode) {
      el.btnQuestMode.addEventListener('click', () => {
        this.startQuestMode();
      });
    }

    if (el.questClose) {
      el.questClose.addEventListener('click', () => {
        this.closeQuestMode();
      });
    }

    // SVG Hotspot Click Delegation
    if (el.sceneRoot) {
      el.sceneRoot.addEventListener('click', (e) => {
        const hotspot = e.target.closest('[data-target-t]');
        if (hotspot) {
          const targetT = parseFloat(hotspot.getAttribute('data-target-t'));
          const label = hotspot.getAttribute('data-label') || 'Sacred Space';
          if (!isNaN(targetT)) {
            this.engine.seek(targetT);
            this.playChime(660, 'triangle');
            this.showToast(`⛪ ${label}`);
            this.engine.notifyParent({
              type: 'HOTSPOT_SELECTED',
              targetT,
              label,
              preset: this.engine.activePresetId
            });
          }
        }
      });
    }

    // --- Developer Inspector & Live Studio Event Bindings (delegated to player-ui-studio.js; lazy-loaded on demand) ---
    if (global.ASTPlayerUIStudio || (typeof window !== 'undefined' && window.ASTPlayerUIStudio)) {
      this.bindStudioDOMEvents(stage);
    } else {
      if (el.btnDevMode && !this._studioLazyTriggersBound) {
        el.btnDevMode.addEventListener('click', () => this.toggleDevMode());
      }
      if (el.btnDevStudio && !this._studioLazyTriggersBound) {
        el.btnDevStudio.addEventListener('click', () => this.toggleDevStudio());
      }
      this._studioLazyTriggersBound = true;
    }

    if (el.btnHeaderExportSpa) {
      el.btnHeaderExportSpa.addEventListener('click', () => {
        this.downloadStandaloneSvgApplet();
      });
    }

    if (el.btnDownloadZip) {
      el.btnDownloadZip.addEventListener('click', (e) => {
        e.preventDefault();
        this.downloadOfflineSuiteZip();
      });
    }

    // --- WebRTC P2P Mesh & OBS Broadcast Drawer Event Bindings (delegated to player-ui-broadcast.js; lazy-loaded on demand) ---
    if (global.ASTPlayerUIBroadcast || (typeof window !== 'undefined' && window.ASTPlayerUIBroadcast)) {
      this.bindBroadcastDOMEvents();
    } else {
      if (el.btnWebRtcLink && !this._broadcastLazyTriggersBound) {
        el.btnWebRtcLink.addEventListener('click', () => this.toggleWebRtcDrawer());
      }
      if (el.btnObsLink && !this._broadcastLazyTriggersBound) {
        el.btnObsLink.addEventListener('click', () => this.toggleObsDrawer());
      }
      this._broadcastLazyTriggersBound = true;
    }

    // --- Display Presets, Studio Panel & Settings Drawer Event Bindings (delegated to player-ui-display.js) ---
    this.bindDisplayDOMEvents();

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // 1. Let text inputs, selects, textareas, and editable fields handle their own keys
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'SELECT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // 1b. Yield immediately if the loaded cartridge declares a :key gesture for this key
      const activeGestures = this.engine && this.engine.scene && Array.isArray(this.engine.scene.gestures)
        ? this.engine.scene.gestures
        : null;
      if (activeGestures && activeGestures.some(g => g && g.type === 'key' && (
        (g.code && e.code && g.code === e.code) ||
        (g.key && e.key && (g.key === e.key || (g.key.length === 1 && e.key.length === 1 && g.key.toLowerCase() === e.key.toLowerCase())))
      ))) {
        return;
      }

      // 2. Trap rogue 'Enter' presses so they don't trigger focused buttons or blow out the layout
      if (e.code === 'Enter' || e.key === 'Enter') {
        if (e.target.tagName === 'BUTTON') {
          return; // Allow a genuinely focused button to fire normally if explicitly clicked
        }
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const isControlOn = (flag) => !window.__astGestures || typeof window.__astGestures._isControlEnabled !== 'function' || window.__astGestures._isControlEnabled(flag);

      // 3. Main player shortcuts
      if (e.code === 'Space') {
        if (!isControlOn('space-play')) return;
        e.preventDefault();
        if (this.stepMode) {
          this.stepToNextKeyframe();
        } else {
          if (this.engine) {
            const playing = this.engine.togglePlay();
            this.updateHeaderPlayUI(playing, true);
          } else if (el.btnHeaderPlay) {
            el.btnHeaderPlay.click();
          } else if (el.btnPlay) {
            el.btnPlay.click();
          }
        }
      } else if (e.code === 'ArrowLeft' || e.code === 'PageUp') {
        if (!isControlOn('arrow-step')) return;
        e.preventDefault();
        const scene = this.engine && this.engine.scene;
        if (this.stepMode || (scene && scene.keyframes && scene.keyframes.length > 0)) {
          this.stepToPrevKeyframe();
        } else {
          this.engine.step(-0.05);
        }
      } else if (e.code === 'ArrowRight' || e.code === 'PageDown') {
        if (!isControlOn('arrow-step')) return;
        e.preventDefault();
        const scene = this.engine && this.engine.scene;
        if (this.stepMode || (scene && scene.keyframes && scene.keyframes.length > 0)) {
          this.stepToNextKeyframe();
        } else {
          this.engine.step(0.05);
        }
      } else if (e.code === 'KeyQ' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.toggleCheckpointView();
      } else if (e.code === 'KeyL' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (el.btnLoop) el.btnLoop.click();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        if (el.btnVolumeMute) {
          el.btnVolumeMute.click();
        } else if (el.btnNarrate) {
          el.btnNarrate.click();
        }
      } else if (e.code === 'KeyV' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.toggleVoiceCommands();
      } else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.toggleStepMode();
      } else if (e.code === 'KeyF' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (el.btnFullscreen) el.btnFullscreen.click();
      } else if (e.code === 'KeyO' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (el.btn3DOrbit) el.btn3DOrbit.click();
      } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.engine.resetCamera();
        this.showToast('🌐 3D Camera Reset');
      } else if (e.code === 'KeyP' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.togglePictureInPicture();
      } else if (e.code === 'KeyP' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (el.btnPlayMode) el.btnPlayMode.click();
      } else if ((e.code === 'KeyW' || e.key === 'w' || e.key === 'W') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!isControlOn('whiteboard')) return;
        e.preventDefault();
        if (window.__astGestures && typeof window.__astGestures.togglePen === 'function') {
          window.__astGestures.togglePen();
        } else {
          window.postMessage({ type: 'TOGGLE_PEN' }, '*');
        }
      } else if (e.code === 'Home' || e.code === 'Digit0' || e.code === 'Numpad0') {
        if (!isControlOn('arrow-step')) return;
        e.preventDefault();
        if (el.btnReset) el.btnReset.click();
      } else if (e.key === '?' || (e.code === 'Slash' && e.shiftKey)) {
        e.preventDefault();
        this.toggleShortcutsModal();
      } else if ((e.code === 'KeyB' || e.key === 'b' || e.key === 'B') && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.toggleBsl();
      } else if (e.code === 'KeyI' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.toggleDevMode();
      } else if (e.code === 'Escape') {
        if (this.elements.studioControlPanel && !this.elements.studioControlPanel.classList.contains('hidden')) {
          this.closeStudioPanel();
        } else if (this.elements.questDrawer && !this.elements.questDrawer.classList.contains('hidden')) {
          this.closeQuestMode();
        } else if (this.elements.interactiveCard && !this.elements.interactiveCard.classList.contains('hidden')) {
          this.minimizeInteractiveCard();
        } else if (this.elements.shortcutsModal && !this.elements.shortcutsModal.classList.contains('hidden')) {
          this.closeShortcutsModal();
        } else if (this.elements.settingsDrawer && !this.elements.settingsDrawer.classList.contains('hidden')) {
          this.closeSettingsDrawer();
        } else if (this.elements.devInspectorDrawer && !this.elements.devInspectorDrawer.classList.contains('hidden')) {
          this.closeInspectorDrawer();
        } else if (this.elements.devStudioDrawer && !this.elements.devStudioDrawer.classList.contains('hidden')) {
          this.closeDevStudio();
        } else if (this.elements.obsDrawer && !this.elements.obsDrawer.classList.contains('hidden')) {
          this.closeObsDrawer();
        }
      }
    });
  }

  function bindEngineEvents() {
    // Synchronize initial play button state immediately with the engine's real current state
    this.updateHeaderPlayUI(Boolean(this.engine?.isPlaying));

    this._lastHudSyncMs = 0;
    this.engine.on('timeupdate', () => {
      // Keep requestAnimationFrame unblocked while throttling external HUD/inspector/BSL sync to ~10 Hz (100ms)
      const now = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
      const shouldSyncHud = !this.engine.isPlaying || (now - this._lastHudSyncMs >= 100);
      if (shouldSyncHud) {
        this._lastHudSyncMs = now;
        // Skip duplicate renderCurrentVector() here because ASTVectorPlayerEngine.tick() executes applyBindings() right after timeupdate
        this.updateView(true);
        this.checkInteractiveCheckpoints();
        this.updateGoalCheckpointProgress();
      }

      // If stepping towards a target stop in Step Mode, stop when reached
      if (this.targetStop !== null && this.engine.progress >= this.targetStop - 0.008) {
        const reached = this.targetStop;
        this.targetStop = null;
        this.engine.seek(reached);
        this.engine.pause();
        this.updateHeaderPlayUI(false);
        this.updateView(true);
        this.onStopReached(reached);
      }

      // If looped back to start, allow checkpoints to be answered again (only for narrative slides, not continuous simulation loops)
      if (!this.engine.isContinuousSim && this.engine.scene?.type !== 'Sim' && this.engine.progress < 0.05 && this.completedCheckpoints.size > 0) {
        this.completedCheckpoints.clear();
      }
    });

    this.engine.on('checkpoint_goal_passed', (data) => {
      this.handleGoalCheckpointPassed(data);
    });

    this.engine.on('statechange', (data) => {
      if (typeof data.isPlaying === 'boolean') {
        this.updateHeaderPlayUI(data.isPlaying);
      }
      if (this.obs && this.obs.isConnected && this.obs.settings.syncRecording) {
        if (data.isPlaying) {
          this.obs.startRecord();
        } else {
          this.obs.stopRecord();
        }
      }
    });

    this.engine.on('keyframe', (kf) => {
      if (this.obs && this.obs.isConnected) {
        this.obs.bookmarkChapter(kf.title, this.engine.progress);
        if (this.obs.settings.syncScenes && kf.sceneName) {
          this.obs.switchScene(kf.sceneName);
        }
      }
    });

    this.engine.on('camerachange', () => {
      this.update3DStatus();
    });

    this.engine.on('error', (err) => {
      const msg = (err && (err.message || err.type)) || 'An asset error occurred';
      this.showToast('⚠️ ' + msg, 4000);
    });

    this.engine.on('fileloaded', (info) => {
      this.showToast(`📂 File Loaded: ${info.filename}`, 3000);
      // Persist ingested scene to IndexedDB and Local Vault
      try {
        this.saveToLocalVault({
          id: info.id,
          title: info.title || info.filename,
          stage: info.stage || 'LOCAL VAULT',
          svgMarkup: info.svgMarkup || (this.engine.scene && this.engine.scene.svgText) || '',
          astSource: info.astSource || (this.engine.scene && this.engine.scene.rawAst) || '',
          filename: info.filename
        });
      } catch (_) {}
      if (this.elements.presetSelector) {
        let exists = false;
        for (let i = 0; i < this.elements.presetSelector.options.length; i++) {
          if (this.elements.presetSelector.options[i].value === info.id) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          const opt = document.createElement('option');
          opt.value = info.id;
          opt.textContent = `📁 ${info.filename}`;
          this.elements.presetSelector.appendChild(opt);
        }
        this.elements.presetSelector.value = info.id;
      }
    });

    this.engine.on('presetchange', (data) => {
      if (this.elements.presetSelector) {
        let found = false;
        for (let i = 0; i < this.elements.presetSelector.options.length; i++) {
          if (this.elements.presetSelector.options[i].value === data.preset) {
            found = true;
            break;
          }
        }
        if (!found) {
          const opt = document.createElement('option');
          opt.value = data.preset;
          opt.textContent = `★ ${data.title || data.preset} (${data.stage || 'AUTO-FOUND'})`;
          this.elements.presetSelector.appendChild(opt);
        }
        this.elements.presetSelector.value = data.preset;
      }
      this.completedCheckpoints.clear();
      this.closeInteractiveCard(false);
      this.closeQuestMode();
      this.setupKeyframeMarkers();
      this.update3DStatus();

      const scene = this.engine && this.engine.scene;
      const hasCheckpoints = Boolean(scene && scene.interactive && Array.isArray(scene.interactive.checkpoints) && scene.interactive.checkpoints.length > 0 && !scene.interactive.disabled && scene.interactive !== false && scene.type !== 'App' && scene.cartridgeType !== 'App');
      if (!hasCheckpoints) {
        this.interactiveMode = false;
        if (this.elements.btnInteractive) this.elements.btnInteractive.style.display = 'none';
      } else if (this.elements.btnInteractive) {
        this.interactiveMode = this.displayConfig.showInteractiveCheckpoints !== false;
        this.elements.btnInteractive.style.display = this.displayConfig.showInteractiveCheckpoints !== false ? '' : 'none';
        this.elements.btnInteractive.classList.toggle('active', this.interactiveMode);
      }

      this.projectControls(scene);
      this.updateView();
    });

    this.engine.on('varchange', (data) => {
      if (data && data.name) {
        this.syncProjectedControls(data.name, data.value);
      }
      this.updateGoalCheckpointProgress();
    });

    this.engine.on('simreset', () => {
      this.projectControls(this.engine && this.engine.scene);
    });

    this.engine.on('asthotreloaded', () => {
      this.projectControls(this.engine && this.engine.scene);
    });

    this.engine.on('langchange', (data) => {
      if (this.elements.langSelector) {
        this.elements.langSelector.value = data.lang;
      }
      this.updateView();
    });

    this.engine.on('integrityverified', (info) => {
      this.updateIntegrityBadge(info);
    });

    if (this.engine.lastIntegrity) {
      this.updateIntegrityBadge(this.engine.lastIntegrity);
    }
  }

  function updateIntegrityBadge(info) {
    const badge = this.elements && this.elements.badgeNativeSeal;
    if (!badge || !info) return;
    badge.classList.remove('verified', 'modified', 'community');
    const shortCode = info.shortHash ? String(info.shortHash).slice(0, 6) : '';
    if (info.status === 'verified-native') {
      badge.classList.add('verified');
      badge.textContent = "🛡️ St Joseph's Curriculum";
      badge.title = info.badgeTooltip || `Verified St Joseph's Curriculum Cartridge • Seal: ${info.shortHash}`;
    } else if (info.status === 'tampered') {
      badge.classList.add('modified');
      badge.textContent = shortCode ? `✎ Altered • ${shortCode}` : '✎ Altered';
      badge.title = info.badgeTooltip || `Altered / Remixed Cartridge • Live SHA-256: ${info.shortHash}`;
    } else {
      badge.classList.add('community');
      badge.textContent = '◈ Community';
      badge.title = info.badgeTooltip || `Community / Unregistered Cartridge • SHA-256: ${info.shortHash}`;
    }
  }

  const ASTPlayerUIEvents = {
    updateView,
    bindDOMEvents,
    bindEngineEvents,
    updateIntegrityBadge,
  };

  global.ASTPlayerUIEvents = ASTPlayerUIEvents;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIEvents = ASTPlayerUIEvents;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
