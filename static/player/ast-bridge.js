/**
 * static/player/ast-bridge.js
 *
 * St Joseph's AST Vector Media Player — PostMessage Host-Iframe Gateway Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated maintenance:
 * - Origin-validated bi-directional postMessage protocol (setupPostMessageBridge)
 * - Playback, scene loading, variable mutation, spatial actuation, profiler capture,
 *   whiteboard ink, WebMCP, and offline ZIP export command routing
 */

(function (global) {
  'use strict';

  // Setup postMessage Gateway with Origin Validation
  function setupPostMessageBridge(engine, uiController) {
    if (typeof window === 'undefined') return;
    window.__astBridgeActive = true;

    window.addEventListener('message', (event) => {
      const expectedOrigin = engine.targetOrigin;
      if (expectedOrigin && expectedOrigin !== '*' && event.origin !== expectedOrigin) {
        if (window.location.origin && window.location.origin !== 'null' && event.origin !== window.location.origin) {
          console.warn('[AST-Player] Rejected unauthorized cross-origin message from:', event.origin);
          return;
        }
      }

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'SET_TARGET_FPS':
          if (typeof data.fps === 'number') {
            engine.targetFps = data.fps;
          } else if (data.fps === 'adaptive' || !data.fps) {
            engine.targetFps = 0;
          }
          break;
        case 'SEEK':
          if (typeof data.progress === 'number') engine.seek(data.progress);
          break;
        case 'PLAY':
          engine.play();
          if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
            uiController.updateHeaderPlayUI(true, true);
          }
          break;
        case 'PAUSE':
          engine.pause();
          if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
            uiController.updateHeaderPlayUI(false, true);
          }
          break;
        case 'TOGGLE_PLAY': {
          const playing = engine.togglePlay();
          if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
            uiController.updateHeaderPlayUI(playing, true);
          }
          break;
        }
        case 'SET_LOOP':
          if (typeof data.loop === 'boolean') engine.setLoop(data.loop);
          break;
        case 'TOGGLE_LOOP':
          engine.toggleLoop();
          break;
        case 'SET_VOLUME':
          if (typeof data.volume === 'number') {
            if (data.volume > 0 && engine.audioSynth && typeof engine.audioSynth.unlock === 'function') {
              engine.audioSynth.unlock();
            }
            engine.setVolume(data.volume);
          }
          break;
        case 'SET_MUTED':
          if (typeof data.muted === 'boolean') {
            if (!data.muted && engine.audioSynth && typeof engine.audioSynth.unlock === 'function') {
              engine.audioSynth.unlock();
            }
            engine.setMuted(data.muted);
          }
          break;
        case 'TOGGLE_MUTE': {
          const nowMuted = engine.toggleMute();
          if (!nowMuted && engine.audioSynth && typeof engine.audioSynth.unlock === 'function') {
            engine.audioSynth.unlock();
          }
          break;
        }
        case 'SET_GRAVITY':
          if (typeof data.gravity === 'number' && engine.physics) engine.physics.setGravity(data.gravity);
          break;
        case 'SET_RESTITUTION':
          if (engine.physics && (typeof data.restitution === 'number' || typeof data.bounce === 'number')) {
            engine.physics.setRestitution(data.restitution !== undefined ? data.restitution : data.bounce);
          }
          break;
        case 'SET_FRICTION':
          if (typeof data.friction === 'number' && engine.physics) engine.physics.setFriction(data.friction);
          break;
        case 'SET_SUBSTEPS':
          if (typeof data.substeps === 'number' && engine.physics) engine.physics.setSubsteps(data.substeps);
          break;
        case 'RESET_PHYSICS':
          if (engine.physics) engine.physics.reset();
          break;
        case 'PHYSICS_IMPULSE':
          if (engine.physics) engine.physics.applyImpulse(data.target || data.id, data.fx || 0, data.fy || -400);
          break;
        case 'PHYSICS_JUMP':
          if (engine.physics) engine.physics.jump(data.target || data.id, data.jumpVelocity || -480);
          break;
        case 'SET_SPEED':
          if (data.speed) engine.setSpeed(data.speed);
          break;
        case 'SET_LANGUAGE':
        case 'SET_LANG':
          if (data.lang) engine.setLanguage(data.lang);
          if (uiController && uiController.updateView) uiController.updateView();
          break;
        case 'SET_BILINGUAL_SUBTITLES':
          engine.setBilingualSubtitles(data.enabled);
          if (uiController && uiController.updateView) uiController.updateView();
          break;
        case 'SET_SPEECH_RATE':
          if (data.rate) engine.setSpeechRate(data.rate);
          break;
        case 'SET_PRESET':
          if (data.preset) {
            const canonicalPreset = (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.normalizeId === 'function')
              ? global.ASTSceneRegistry.normalizeId(data.preset)
              : data.preset;
            // Guard against a stale boot preset lookup overwriting a freshly mounted custom SWF / Local Vault cartridge
            if (
              canonicalPreset === 'welcome' &&
              engine._customMountedPresetId &&
              engine._mountedSceneId === engine._customMountedPresetId &&
              (Date.now() - (engine._customMountedAt || 0)) < 5000
            ) {
              break;
            }
            if (engine.activePresetId === canonicalPreset && engine._mountedSceneId === canonicalPreset && engine.scene) {
              if (data.play === true && !engine.isPlaying) {
                engine.play();
              } else if (data.play === false && !engine.isContinuousSim && engine.isPlaying) {
                engine.pause();
              }
            } else {
              engine.loadScene(canonicalPreset, data.play !== false);
            }
          }
          break;
        case 'STEP_NEXT_KEYFRAME':
        case 'NEXT_SLIDE':
          if (engine.isContinuousSim) break;
          if (uiController && typeof uiController.stepToNextKeyframe === 'function') {
            uiController.stepToNextKeyframe();
          } else {
            engine.step(0.05);
          }
          break;
        case 'STEP_PREV_KEYFRAME':
        case 'PREV_SLIDE':
          if (engine.isContinuousSim) break;
          if (uiController && typeof uiController.stepToPrevKeyframe === 'function') {
            uiController.stepToPrevKeyframe();
          } else {
            engine.step(-0.05);
          }
          break;
        case 'STEP_TO_KEYFRAME':
        case 'GOTO_SLIDE':
          if (engine.isContinuousSim) break;
          if (typeof data.progress === 'number') {
            engine.seek(data.progress);
            if (uiController && typeof uiController.onStopReached === 'function') {
              uiController.onStopReached(data.progress);
            }
          }
          break;
        case 'TOGGLE_BSL':
        case 'SET_BSL':
          if (uiController && typeof uiController.toggleBsl === 'function') {
            uiController.toggleBsl(typeof data.enabled === 'boolean' ? data.enabled : undefined, false);
          }
          break;
        case 'REQUEST_SUBTITLE': {
          const curSub = typeof engine.getCurrentSubtitle === 'function' ? engine.getCurrentSubtitle() : '';
          let subText = typeof curSub === 'string' ? curSub : (curSub && (curSub.en || curSub.localized) ? (curSub.en || curSub.localized) : '');
          if (!subText && engine.scene && Array.isArray(engine.scene.keyframes) && engine.scene.keyframes.length > 0) {
            const p = engine.progress || 0;
            let activeKf = engine.scene.keyframes[0];
            for (let i = 0; i < engine.scene.keyframes.length; i++) {
              if (p >= (engine.scene.keyframes[i].t || 0)) activeKf = engine.scene.keyframes[i];
            }
            if (activeKf) subText = [activeKf.title, activeKf.rule].filter(Boolean).join('. ');
          }
          if (subText && typeof engine.notifyParent === 'function') {
            engine.notifyParent({ type: 'SUBTITLE_UPDATE', text: subText });
          }
          break;
        }
        case 'TRIGGER_CHECKPOINT':
        case 'TAKE_QUIZ':
        case 'TOGGLE_CHECKPOINT':
          if (uiController && typeof uiController.toggleCheckpointView === 'function') {
            uiController.toggleCheckpointView();
          } else if (uiController && typeof uiController.triggerFirstCheckpoint === 'function') {
            uiController.triggerFirstCheckpoint();
          }
          break;
        case 'TOGGLE_INTERACTIVE_MODE':
          if (uiController && typeof uiController.toggleInteractiveMode === 'function') {
            uiController.toggleInteractiveMode();
          }
          break;
        case 'SET_QUESTIONS':
        case 'SET_INTERACTIVE_MODE':
          if (uiController && typeof uiController.setInteractiveMode === 'function') {
            const isEnabled = typeof data.enabled === 'boolean' ? data.enabled : (typeof data.value === 'boolean' ? data.value : true);
            uiController.setInteractiveMode(isEnabled);
          }
          break;
        case 'CLOSE_CHECKPOINT':
          if (uiController && typeof uiController.closeInteractiveCard === 'function') {
            uiController.closeInteractiveCard(false);
          }
          break;
        case 'SET_THEME':
          if (data.theme && uiController && uiController.setTheme) {
            uiController.setTheme(data.theme);
          }
          break;
        case 'SET_VOICE':
          if (typeof data.enabled === 'boolean') {
            engine.voiceEnabled = data.enabled;
            if (!engine.voiceEnabled) {
              engine.cancelSpeech();
            } else if (engine.audioSynth && typeof engine.audioSynth.unlock === 'function') {
              engine.audioSynth.unlock();
            }
            if (uiController && uiController.elements && uiController.elements.btnNarrate) {
              uiController.elements.btnNarrate.classList.toggle('active', engine.voiceEnabled);
              uiController.elements.btnNarrate.textContent = engine.voiceEnabled ? '🔊 Voice: ON' : '🔊 Voice';
            }
          }
          break;
        case 'FOCUS_STAGE': {
          const svgEl = engine.getStageSvg();
          if (svgEl && typeof svgEl.focus === 'function') {
            try { svgEl.focus({ preventScroll: true }); } catch (_) {
              try { svgEl.focus(); } catch (_) {}
            }
          }
          if (typeof window.focus === 'function') {
            try { window.focus(); } catch (_) {}
          }
          break;
        }
        case 'ROTATE_3D':
          if (typeof data.deltaYaw === 'number' || typeof data.deltaPitch === 'number') {
            engine.rotateCamera(data.deltaYaw || 0, data.deltaPitch || 0);
          }
          break;
        case 'ZOOM_3D':
          if (typeof data.deltaZoom === 'number') {
            engine.zoomCamera(data.deltaZoom);
          }
          break;
        case 'SET_CAMERA':
          if (typeof data.yaw === 'number') engine.cameraOrbit.yawOffset = data.yaw;
          if (typeof data.pitch === 'number') engine.cameraOrbit.pitchOffset = data.pitch;
          if (typeof data.distanceScale === 'number') engine.cameraOrbit.distanceScale = data.distanceScale;
          engine.applyBindings(engine.progress);
          engine.emit('camerachange', { ...engine.cameraOrbit });
          break;
        case 'AUDIO_PLAY_CLICK':
          if (engine.audioSynth) engine.audioSynth.playClick(data.freq || 900);
          break;
        case 'AUDIO_PLAY_SUCCESS':
          if (engine.audioSynth) engine.audioSynth.playSuccessChime();
          break;
        case 'AUDIO_PLAY_FAIL':
          if (engine.audioSynth) engine.audioSynth.playFailBuzz();
          break;
        case 'AUDIO_PLAY_SPRING':
          if (engine.audioSynth) engine.audioSynth.playSpring(data.freq || 440);
          break;
        case 'AUDIO_PLAY_BOING':
          if (engine.audioSynth) engine.audioSynth.playBoing(data.freq || 220);
          break;
        case 'AUDIO_PLAY_WHISTLE':
          if (engine.audioSynth) engine.audioSynth.playSlideWhistle(data.startFreq || 280, data.endFreq || 840, data.duration || 0.35);
          break;
        case 'AUDIO_PLAY_POP':
          if (engine.audioSynth) engine.audioSynth.playPop(data.freq || 620);
          break;
        case 'AUDIO_PLAY_WHOOSH':
          if (engine.audioSynth) engine.audioSynth.playWhoosh();
          break;
        case 'AUDIO_SET_HUM':
          if (engine.audioSynth) engine.audioSynth.setHum(data.freq || 60, data.volume || 0.05);
          break;
        case 'AUDIO_STOP_HUM':
          if (engine.audioSynth) engine.audioSynth.stopHum();
          break;
        case 'SIM_ACTION':
          if (data.action === 'FEED_FISH' && global.__astGestures && global.__astGestures.stageSvg) {
            const evt = new CustomEvent('feed_fish', { detail: { x: 300 + Math.random() * 200, y: 100 + Math.random() * 80 } });
            global.__astGestures.stageSvg.dispatchEvent(evt);
          } else if (data.action === 'TAP_GLASS' && global.__astGestures && global.__astGestures.stageSvg) {
            const evt = new CustomEvent('tap_glass', { detail: { x: 400, y: 240 } });
            global.__astGestures.stageSvg.dispatchEvent(evt);
          }
          break;
        case 'TOGGLE_PEN':
          if (global.__astGestures) {
            global.__astGestures.isPenActive = data.enabled !== undefined ? Boolean(data.enabled) : !global.__astGestures.isPenActive;
            if (global.__astGestures.stageSvg) {
              global.__astGestures.stageSvg.style.cursor = global.__astGestures.isPenActive ? 'crosshair' : 'default';
            }
          }
          break;
        case 'CLEAR_WHITEBOARD_INK':
          if (global.__astGestures && typeof global.__astGestures.clearWhiteboardInk === 'function') {
            global.__astGestures.clearWhiteboardInk();
          }
          break;
        case 'UNDO_WHITEBOARD_INK':
          if (global.__astGestures && typeof global.__astGestures.undoLastStroke === 'function') {
            global.__astGestures.undoLastStroke();
          }
          break;
        case 'EXPORT_WHITEBOARD_INK':
          if (global.__astGestures && typeof global.__astGestures.broadcastInkSession === 'function') {
            global.__astGestures.broadcastInkSession();
          }
          break;
        case 'TOGGLE_XRAY':
          if (typeof engine.togglePedagogicalXRay === 'function') {
            engine.togglePedagogicalXRay(typeof data.enabled === 'boolean' ? data.enabled : undefined);
          }
          break;
        case 'DISPATCH_ACTION':
          if (data.action && typeof engine.dispatchAction === 'function') {
            engine.dispatchAction(data.action, data.args);
          }
          break;
        case 'RESET_SIM':
        case 'SIM_RESET':
          if (typeof engine.reset === 'function') {
            engine.reset();
          } else if (uiController && typeof uiController.resetSimulation === 'function') {
            uiController.resetSimulation();
          }
          break;
        case 'SET_VAR':
          if (data.name && data.value !== undefined) {
            let nextVal = data.value;
            const cleanName = typeof engine.normalizeVarName === 'function' ? engine.normalizeVarName(data.name) : data.name;
            const metaEntry = engine.scene && engine.scene.vars && engine.scene.vars[cleanName];
            let clamped = false;
            if (typeof nextVal === 'number' && metaEntry && typeof metaEntry === 'object') {
              if (typeof metaEntry.min === 'number' && nextVal < metaEntry.min) {
                nextVal = metaEntry.min;
                clamped = true;
              }
              if (typeof metaEntry.max === 'number' && nextVal > metaEntry.max) {
                nextVal = metaEntry.max;
                clamped = true;
              }
            }
            if (typeof engine.setMemoryVar === 'function') {
              engine.setMemoryVar(data.name, nextVal);
            } else if (typeof engine.setVar === 'function') {
              engine.setVar(data.name, nextVal);
            } else if (engine.scene && engine.scene.vars) {
              engine.scene.vars[data.name] = nextVal;
              if (typeof engine.updateComputedVars === 'function') engine.updateComputedVars();
              if (typeof engine.applyBindings === 'function') engine.applyBindings(engine.progress || 0);
              if (typeof engine.render === 'function') engine.render(engine.progress || 0);
            }
            if (data.requestId) {
              engine.notifyParent({
                type: 'SET_VAR_ACK',
                requestId: data.requestId,
                name: cleanName,
                value: nextVal,
                clamped,
                state: typeof engine.getEngineStateSummary === 'function' ? engine.getEngineStateSummary(false) : null
              });
            }
          }
          break;
        case 'RESET_3D':
          if (typeof engine.resetCamera === 'function') {
            engine.resetCamera();
          }
          break;
        case 'ROTATE_CAMERA_ORBIT':
          if (typeof engine.rotateCamera === 'function') {
            engine.rotateCamera(data.theta || 0, data.phi || 0, data.relative);
          }
          break;
        case 'DOWNLOAD_OFFLINE_ZIP':
          if (typeof engine.downloadOfflineZipSuite === 'function') {
            engine.downloadOfflineZipSuite();
          }
          break;
        case 'REQUEST_JOTTER_CSV':
          if (typeof engine.exportLabCsv === 'function') {
            const csvRes = engine.exportLabCsv();
            engine.notifyParent({
              type: 'JOTTER_CSV_RESPONSE',
              sceneId: csvRes.sceneId,
              sceneTitle: csvRes.sceneTitle,
              rowCount: csvRes.rowCount,
              csv: csvRes.csv,
              nodePath: `lab/${csvRes.sceneId}`,
              download: Boolean(data.download)
            });
          }
          break;
        case 'INJECT_CHECKPOINT':
          if (data.checkpoint && engine.scene) {
            if (!engine.scene.interactive) engine.scene.interactive = { checkpoints: [] };
            if (!Array.isArray(engine.scene.interactive.checkpoints)) engine.scene.interactive.checkpoints = [];
            engine.scene.interactive.checkpoints.push(data.checkpoint);
            if (uiController && typeof uiController.updateView === 'function') uiController.updateView();
          }
          break;
        case 'LOAD_CARTRIDGE':
        case 'LOAD_CUSTOM_CARTRIDGE': {
          if (data && typeof data === 'object' && data.cartridge) {
            const handled = global.__astHandledCustomCartridgeEvents || (global.__astHandledCustomCartridgeEvents = new WeakSet());
            if (handled.has(data.cartridge)) break;
            handled.add(data.cartridge);
            const cartridge = data.cartridge;
            const shouldPlay = data.play !== false;
            setTimeout(() => {
              try {
                if (typeof engine.loadSceneData === 'function') {
                  engine.loadSceneData(cartridge, shouldPlay);
                }
              } catch (err) {
                console.error('[AST-Bridge] Failed to load cartridge:', err);
                if (typeof engine.notifyParent === 'function') {
                  engine.notifyParent({
                    type: 'CARTRIDGE_LOAD_ERROR',
                    message: err && err.message ? err.message : String(err)
                  });
                }
              }
            }, 0);
          }
          break;
        }
        case 'SET_DEV_MODE':
          if (typeof engine.setDevMode === 'function') {
            engine.setDevMode(Boolean(data.enabled));
          }
          break;        
      
        case 'GET_STAGE_SVG':
          if (typeof engine.getStageSvg === 'function') {
            const svgMarkup = engine.getStageSvg();
            engine.notifyParent({ type: 'STAGE_SVG_RESPONSE', svg: svgMarkup });
          }
          break;
        case 'EXPORT_STANDALONE_APPLET':
          if (typeof engine.exportStandaloneApplet === 'function') {
            const _llExp = global.ASTLazyLoader || (typeof window !== 'undefined' ? window.ASTLazyLoader : undefined);
            if (!global.ASTExporter && _llExp && typeof _llExp.ensureExporter === 'function') {
              _llExp.ensureExporter().then(() => engine.exportStandaloneApplet()).catch(() => {});
            } else {
              engine.exportStandaloneApplet();
            }
          }
          break;
        case 'ACTUATE_OPCODE':
          if (typeof engine.actuateOpcode === 'function') {
            engine.actuateOpcode(data.opcode);
          }
          break;
        case 'CAST_CAMERA_RAY':
          if (typeof engine.castCameraRay === 'function') {
            engine.castCameraRay();
          }
          break;
        case 'NUDGE_NODE':
          if (typeof engine.actuateNode === 'function') {
            const dxyz = Array.isArray(data.dxyz) ? data.dxyz : [0, 0, 0];
            engine.actuateNode(data.target, dxyz[0] || 0, dxyz[1] || 0, dxyz[2] || 0, true);
          }
          break;
        case 'VOICE_COMMAND':
          if (typeof engine.handleVoiceCommand === 'function') {
            engine.handleVoiceCommand(data.command);
          }
          break;
        case 'TOGGLE_VOICE_COMMANDS':
        case 'START_VOICE_COMMANDS':
        case 'STOP_VOICE_COMMANDS':
          if (typeof engine.toggleVoiceRecognition === 'function') {
            engine.toggleVoiceRecognition();
          }
          break;
        case 'AI_VISUAL_COMMAND':
          if (typeof engine.executeAiVisualCommand === 'function') {
            engine.executeAiVisualCommand(data.packet || data);
          }
          break;
        case 'PUPIL_INTERRUPT':
          if (typeof engine.preemptAiDemonstration === 'function') {
            engine.preemptAiDemonstration('PUPIL_INTERRUPT');
          } else if (typeof engine.cancelSpeech === 'function') {
            engine.cancelSpeech();
          }
          break;
        case 'TOGGLE_OBS_DRAWER':
          if (uiController && typeof uiController.toggleObsDrawer === 'function') {
            uiController.toggleObsDrawer();
          }
          break;
        case 'TOGGLE_WEBRTC_DRAWER':
          if (uiController && typeof uiController.toggleWebRtcDrawer === 'function') {
            uiController.toggleWebRtcDrawer();
          }
          break;
        case 'TOGGLE_SETTINGS_DRAWER':
          if (uiController && typeof uiController.toggleSettingsDrawer === 'function') {
            uiController.toggleSettingsDrawer();
          }
          break;
        case 'SET_PERF_HUD':
        case 'TOGGLE_PERF_HUD':
        case 'UPDATE_PERF_HUD': {
          const _hudStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
          const enabled = typeof data.enabled === 'boolean' ? data.enabled : (!engine.profiler || engine.profiler.silent);
          const finishHud = () => {
            if (_hudStore) {
              try {
                _hudStore.setItem('app_perf_hud_enabled', String(enabled));
                if (data.mode) _hudStore.setItem('app_hud_verbosity', data.mode);
                if (typeof data.strictAlarm === 'boolean') _hudStore.setItem('app_frame_budget_alert', String(data.strictAlarm));
              } catch (_) {}
            }
            engine.notifyParent({
              type: 'PERF_HUD_UPDATED',
              enabled: Boolean(engine.profiler && !engine.profiler.silent),
              mode: engine.profiler ? engine.profiler.mode : 'minimal'
            });
          };
          if (enabled) {
            const mode = data.mode || (_hudStore && _hudStore.getItem('app_hud_verbosity')) || 'minimal';
            const strictAlarm = typeof data.strictAlarm === 'boolean' ? data.strictAlarm : Boolean(_hudStore && _hudStore.getItem('app_frame_budget_alert') === 'true');
            const mountHud = (ProfCtor) => {
              if (!engine.profiler) {
                engine.profiler = ProfCtor ? new ProfCtor({ mode, strictAlarm, silent: false }) : null;
              } else {
                engine.profiler.silent = false;
                engine.profiler.mode = mode;
                engine.profiler.strictAlarm = strictAlarm;
              }
              const stage = engine.getStageSvg();
              if (stage && engine.profiler) engine.profiler.mount(stage);
              finishHud();
            };
            const _ASTProfiler = global.ASTProfiler || (typeof window !== 'undefined' ? window.ASTProfiler : undefined);
            const _llProf = global.ASTLazyLoader || (typeof window !== 'undefined' ? window.ASTLazyLoader : undefined);
            if (!_ASTProfiler && _llProf && typeof _llProf.ensureProfiler === 'function') {
              _llProf.ensureProfiler().then(mountHud).catch(() => finishHud());
            } else {
              mountHud(_ASTProfiler);
            }
          } else {
            if (engine.profiler) {
              engine.profiler.destroy();
              engine.profiler = null;
            }
            finishHud();
          }
          break;
        }
        case 'START_PROF_CAPTURE': {
          const beginCapture = (ProfCtor) => {
            if (!engine.profiler) {
              engine.profiler = ProfCtor ? new ProfCtor({ mode: 'minimal', strictAlarm: false, silent: true }) : null;
            }
            if (engine.profiler) engine.profiler.startCapture();
            if (data.ensurePlaying !== false && !engine.isPlaying && typeof engine.play === 'function') {
              engine.play();
            }
            engine.notifyParent({
              type: 'PROF_CAPTURE_STARTED',
              requestId: data.requestId || null
            });
          };
          const _ASTProfiler = global.ASTProfiler || (typeof window !== 'undefined' ? window.ASTProfiler : undefined);
          const _llProf = global.ASTLazyLoader || (typeof window !== 'undefined' ? window.ASTLazyLoader : undefined);
          if (!_ASTProfiler && _llProf && typeof _llProf.ensureProfiler === 'function') {
            _llProf.ensureProfiler().then(beginCapture).catch(() => beginCapture(null));
          } else {
            beginCapture(_ASTProfiler);
          }
          break;
        }
        case 'STOP_PROF_CAPTURE': {
          const vsyncBudgetMs = typeof data.vsyncBudgetMs === 'number' && Number.isFinite(data.vsyncBudgetMs) && data.vsyncBudgetMs > 0
            ? data.vsyncBudgetMs
            : 16.67;
          const stats = engine.profiler && typeof engine.profiler.stopCapture === 'function'
            ? engine.profiler.stopCapture(vsyncBudgetMs)
            : {
                sampleCount: 0,
                meanMs: vsyncBudgetMs,
                p95Ms: vsyncBudgetMs,
                p99Ms: vsyncBudgetMs,
                maxMs: vsyncBudgetMs,
                framesOver16_67ms: 0,
                overBudgetPct: 0,
                vsyncBudgetMs: Number(vsyncBudgetMs.toFixed(2)),
                rawVsyncOverruns: 0,
                rawVsyncOverrunPct: 0,
                severeFrameDrops: 0,
                severeFrameDropPct: 0,
                estimatedFps: Number((1000 / vsyncBudgetMs).toFixed(1)),
                meanComputeMs: 0,
                p95ComputeMs: 0
              };
          const memObj = (typeof performance !== 'undefined' && performance.memory) ? performance.memory : null;
          let emitterParticles = 0;
          if (engine.emitters && typeof engine.emitters.values === 'function') {
            for (const em of engine.emitters.values()) {
              emitterParticles += Number(em.activeCount || em.count || (Array.isArray(em.particles) ? em.particles.length : 0) || 0);
            }
          }
          engine.notifyParent({
            type: 'PROF_CAPTURE_RESULT',
            requestId: data.requestId || null,
            stats,
            memory: {
              wasmPoolBytes: 458752,
              wasmPages: 7,
              usedJsHeapBytes: memObj ? Number(memObj.usedJSHeapSize || 0) : 0,
              totalJsHeapBytes: memObj ? Number(memObj.totalJSHeapSize || 0) : 0
            },
            activeMetrics: {
              activeScopes: Array.isArray(engine.activeScopes) ? engine.activeScopes.length : 0,
              activeLedgers: Array.isArray(engine.activeLedgers) ? engine.activeLedgers.length : 0,
              physicsBodies: engine.physics && Array.isArray(engine.physics.bodies) ? engine.physics.bodies.length : 0,
              physicsSprings: engine.physics && Array.isArray(engine.physics.springs) ? engine.physics.springs.length : 0,
              substeps: engine.physics ? Number(engine.physics.substeps || 4) : 4,
              emitterParticles
            }
          });
          break;
        }
        case 'GET_CONTEXT_SNAPSHOT':
        case 'GET_ENGINE_STATE': {
          const state = typeof engine.getEngineStateSummary === 'function'
            ? engine.getEngineStateSummary(Boolean(data.includeSvgBytes))
            : null;
          if (data.type === 'GET_CONTEXT_SNAPSHOT') {
            engine.notifyParent({ type: 'CONTEXT_SNAPSHOT', requestId: data.requestId || null, snapshot: state });
          } else {
            engine.notifyParent({ type: 'ENGINE_STATE_RESPONSE', requestId: data.requestId || null, state });
          }
          break;
        }
        case 'EXEC_ACTION_TUPLE': {
          const executedActions = [];
          const tuple = String(data.tuple || '').trim();
          const seekM = tuple.match(/:seek\s+([0-9.]+)/i);
          if (seekM) {
            const p = Math.max(0, Math.min(1, parseFloat(seekM[1])));
            if (Number.isFinite(p) && typeof engine.seek === 'function') {
              engine.seek(p);
              executedActions.push('seek');
            }
          }
          const hiM = tuple.match(/:highlight\s+"([^"]+)"/i);
          if (hiM && /^#[a-zA-Z0-9_\-:]+$/.test(hiM[1])) {
            if (typeof engine.ensureAiSpotlightStyles === 'function') engine.ensureAiSpotlightStyles();
            if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.highlightTarget === 'function') {
              global.ASTSharedRenderBoundary.highlightTarget(hiM[1], 2000, 'player-stage');
            } else {
              const stage = engine.getStageSvg();
              const targetEl = stage && stage.querySelector ? stage.querySelector(hiM[1]) : null;
              if (targetEl) {
                targetEl.classList.add('ai-spotlight-pulse');
                setTimeout(() => targetEl.classList.remove('ai-spotlight-pulse'), 2000);
              }
            }
            executedActions.push('highlight');
          }
          const varM = tuple.match(/:var\s+"([a-zA-Z0-9_]+)"\s+([0-9.-]+|"[^"]*")/i);
          if (varM) {
            const vName = varM[1];
            const rawVal = varM[2].replace(/^"|"$/g, '');
            const nVal = Number(rawVal);
            let finalVal = Number.isNaN(nVal) ? rawVal : nVal;
            const metaEntry = engine.scene && engine.scene.vars && engine.scene.vars[vName];
            if (typeof finalVal === 'number' && metaEntry && typeof metaEntry === 'object') {
              if (typeof metaEntry.min === 'number') finalVal = Math.max(metaEntry.min, finalVal);
              if (typeof metaEntry.max === 'number') finalVal = Math.min(metaEntry.max, finalVal);
            }
            if (typeof engine.setMemoryVar === 'function') engine.setMemoryVar(vName, finalVal, true);
            executedActions.push('var');
          }
          const sayM = tuple.match(/:say\s+"([^"]*)"/i);
          if (sayM) {
            executedActions.push('say');
          }
          engine.notifyParent({
            type: 'EXEC_ACTION_RESULT',
            requestId: data.requestId || null,
            ok: executedActions.length > 0,
            executedActions,
            state: typeof engine.getEngineStateSummary === 'function' ? engine.getEngineStateSummary(false) : null
          });
          break;
        }
        default:
          break;
      }
    });
  }

  global.setupPostMessageBridge = setupPostMessageBridge;
  if (typeof window !== 'undefined') {
    window.setupPostMessageBridge = setupPostMessageBridge;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
