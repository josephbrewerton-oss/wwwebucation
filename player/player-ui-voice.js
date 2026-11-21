/**
 * static/player/player-ui-voice.js
 *
 * St Joseph's AST Vector Media Player — Web Speech Voice Control, Catalog Matcher & Command Router
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTPlayerUI.
 * Zero external dependencies; loaded before player-ui.js.
 * All methods execute with `this` bound to the ASTPlayerUI instance.
 */

(function (global) {
  'use strict';

  /**
   * Browser SpeechRecognition Voice Control Integration
   */
  function initVoiceRecognition() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const langMap = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pl: 'pl-PL',
        pt: 'pt-BR',
        uk: 'uk-UA',
        ar: 'ar-SA',
        la: 'la'
      };
      recognition.lang = langMap[this.engine?.lang] || 'en-US';

      recognition.onstart = () => {
        this.isListeningVoice = true;
        this.updateVoiceStatusUI(true, '🎙️ Listening for commands... ("play", "pause", "rewind", "open <scene>")');
        this.showToast('🎙️ Voice Control Active (Speak now)');
        if (this.engine && typeof this.engine.notifyParent === 'function') {
          this.engine.notifyParent({ type: 'VOICE_STATUS', isListening: true });
        }
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        if (interimTranscript) {
          this.updateVoiceOverlayText(`Hearing: "${interimTranscript.trim()}"...`);
        }

        if (finalTranscript) {
          const clean = finalTranscript.trim();
          this.updateVoiceOverlayText(`Recognized: "${clean}"`);
          this.handleVoiceCommand(clean);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[AST-PlayerUI] Voice recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListeningVoice = false;
          this.updateVoiceStatusUI(false);
          this.showToast('⚠️ Microphone permission required for Voice Control');
          if (this.engine && typeof this.engine.notifyParent === 'function') {
            this.engine.notifyParent({ type: 'VOICE_STATUS', isListening: false, error: event.error });
          }
        } else if (event.error === 'no-speech') {
          if (this.isListeningVoice) {
            this.updateVoiceOverlayText('🎙️ Listening for commands... ("play", "pause", "open <scene>")');
          }
        } else if (event.error !== 'aborted') {
          this.showToast(`Voice input notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (this.isListeningVoice) {
          clearTimeout(this._voiceRestartTimeout);
          this._voiceRestartTimeout = setTimeout(() => {
            if (this.isListeningVoice && this.recognition) {
              try {
                this.recognition.start();
              } catch (e) {}
            }
          }, 300);
        } else {
          this.updateVoiceStatusUI(false);
          if (this.engine && typeof this.engine.notifyParent === 'function') {
            this.engine.notifyParent({ type: 'VOICE_STATUS', isListening: false });
          }
        }
      };

      return recognition;
    } catch (err) {
      console.warn('[AST-PlayerUI] Error instantiating SpeechRecognition:', err);
      return null;
    }
  }

  function startVoiceCommands() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      this.showToast('⚠️ SpeechRecognition is not supported in this browser (Use Chrome, Edge, or Safari)');
      return false;
    }

    if (!this.recognition) {
      this.recognition = this.initVoiceRecognition();
    }

    if (!this.recognition) {
      this.showToast('⚠️ Unable to initialize voice recognition engine');
      return false;
    }

    this.isListeningVoice = true;
    try {
      this.recognition.start();
      return true;
    } catch (err) {
      // Recognition already active
      this.updateVoiceStatusUI(true);
      return true;
    }
  }

  function stopVoiceCommands() {
    this.isListeningVoice = false;
    clearTimeout(this._voiceRestartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.updateVoiceStatusUI(false);
    this.showToast('🎙️ Voice Control Stopped');
    if (this.engine && typeof this.engine.notifyParent === 'function') {
      this.engine.notifyParent({ type: 'VOICE_STATUS', isListening: false });
    }
  }

  function toggleVoiceCommands() {
    if (this.isListeningVoice) {
      this.stopVoiceCommands();
    } else {
      this.startVoiceCommands();
    }
  }

  function updateVoiceStatusUI(active, text) {
    const el = this.elements;
    if (el.btnVoiceCmd) {
      el.btnVoiceCmd.classList.toggle('active', active);
      el.btnVoiceCmd.textContent = active ? '🔴 Listening...' : '🎤 Mic';
    }
    if (el.voiceCmdOverlay) {
      if (active) {
        el.voiceCmdOverlay.classList.remove('hidden');
        el.voiceCmdOverlay.style.display = 'flex';
        if (text) {
          this.updateVoiceOverlayText(text);
        }
      } else {
        el.voiceCmdOverlay.classList.add('hidden');
        el.voiceCmdOverlay.style.display = 'none';
      }
    }
  }

  function updateVoiceOverlayText(text) {
    const el = this.elements;
    if (el.voiceCmdText) {
      el.voiceCmdText.textContent = text;
    }
  }

  function findSceneByVoiceQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== 'string') return null;
    const stopWords = new Set(['show', 'me', 'load', 'open', 'go', 'to', 'switch', 'launch', 'the', 'a', 'an', 'scene', 'simulation', 'sim', 'cartridge', 'model', 'lab', 'please']);
    const slug = rawQuery.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!slug) return null;
    const tokens = slug.split(/[\s-]+/).filter(w => w.length > 1 && !stopWords.has(w));
    if (tokens.length === 0) return null;
    const joinedHyphen = tokens.join('-');

    const candidatesMap = new Map();
    const addCand = (item) => {
      if (!item || !item.id || String(item.id).startsWith('__')) return;
      if (item.isPlayableScene === false || item.kind === 'data') return;
      if (!candidatesMap.has(item.id)) {
        candidatesMap.set(item.id, {
          id: String(item.id),
          title: String(item.title || item.id),
          haystack: `${item.id} ${item.title || ''} ${item.oakUnit || ''} ${item.subject || ''}`.toLowerCase()
        });
      }
    };

    if (Array.isArray(this._catalogScenes)) {
      this._catalogScenes.forEach(addCand);
    }
    if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.list === 'function') {
      global.ASTSceneRegistry.list().forEach(addCand);
    }
    if (this.elements && this.elements.presetSelector && typeof this.elements.presetSelector.querySelectorAll === 'function') {
      this.elements.presetSelector.querySelectorAll('option').forEach(opt => {
        if (opt.value && !opt.value.startsWith('__')) {
          addCand({ id: opt.value, title: opt.textContent || opt.value });
        }
      });
    }

    if (global.ASTSceneRegistry && typeof global.ASTSceneRegistry.normalizeId === 'function') {
      const normId = global.ASTSceneRegistry.normalizeId(joinedHyphen);
      if (candidatesMap.has(normId)) {
        return candidatesMap.get(normId);
      }
    }
    if (candidatesMap.has(joinedHyphen)) {
      return candidatesMap.get(joinedHyphen);
    }

    let best = null;
    let bestScore = 0;
    candidatesMap.forEach((cand) => {
      const idWords = cand.id.toLowerCase().split(/[-_]+/);
      let score = 0;
      for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        if (idWords.includes(tk)) score += 6;
        else if (idWords.some(w => w.startsWith(tk) || tk.startsWith(w))) score += 4;
        else if (cand.haystack.includes(tk)) score += 2;
      }
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    });

    return bestScore >= 2 ? best : null;
  }

  function handleVoiceCommand(rawTranscript) {
    if (!rawTranscript || typeof rawTranscript !== 'string') return;
    const text = rawTranscript.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    const el = this.elements;

    let executedAction = null;
    let actionLabel = '';
    const cameraStops = this.getSceneCameraStops();
    const matchedCamStop = cameraStops.find(
      st => text.includes(st.id) || (Array.isArray(st.aliases) && st.aliases.some(a => text.includes(a)))
    );
    const explicitSceneMatch = text.match(/^(?:show me|load|open|go to|switch to|launch)\s+(.+)$/);
    const explicitQuery = explicitSceneMatch ? explicitSceneMatch[1].trim() : '';
    const exactCamStopQuery = explicitQuery && cameraStops.find(
      st => explicitQuery === st.id || (Array.isArray(st.aliases) && st.aliases.includes(explicitQuery))
    );

    // 1. Playback Controls
    if (/^(play|resume|start|unpause|continue|go)$/.test(text) || text.includes('play video') || text.includes('play model') || text.includes('start playback')) {
      this.engine.play();
      executedAction = 'PLAY';
      actionLabel = '▶ Play';
    } else if (/^(pause|stop|freeze|halt|wait|hold)$/.test(text) || text.includes('pause video') || text.includes('stop playback')) {
      this.engine.pause();
      executedAction = 'PAUSE';
      actionLabel = '⏸ Pause';
    } else if (text === 'toggle' || text === 'toggle play' || text === 'toggle playback') {
      this.engine.togglePlay();
      executedAction = 'TOGGLE_PLAY';
      actionLabel = this.engine.isPlaying ? '▶ Play' : '⏸ Pause';
    }
    // 2. Rewind / Seek
    else if (/^(rewind|restart|start over|replay|beginning|back to start|reset)$/.test(text) || text.includes('rewind to start') || text.includes('from the beginning') || text.includes('back to the start')) {
      this.engine.seek(0);
      executedAction = 'REWIND';
      actionLabel = '⏮ Rewound to Beginning';
    } else if (/^(forward|fast forward|skip forward|step forward|ahead|next)$/.test(text) || text.includes('skip ahead') || text.includes('forward five')) {
      this.engine.step(0.1);
      executedAction = 'STEP_FORWARD';
      actionLabel = '⏩ Stepped Forward';
    } else if (/^(back|step back|backward|skip back|previous)$/.test(text) || text.includes('go back') || text.includes('step backwards')) {
      this.engine.step(-0.1);
      executedAction = 'STEP_BACK';
      actionLabel = '⏪ Stepped Backward';
    } else if (text.includes('middle') || text.includes('halfway') || text.includes('fifty percent') || text.includes('50%')) {
      this.engine.seek(0.5);
      executedAction = 'SEEK_50';
      actionLabel = '⏱ Jumped to 50%';
    }
    // 3. Exact Active-Scene Camera Stop ("go to high altar", "go to tabernacle")
    else if (exactCamStopQuery) {
      this.applyCameraStop(exactCamStopQuery);
      actionLabel = exactCamStopQuery.toast || `🎯 Camera: ${exactCamStopQuery.id}`;
      executedAction = `CAMERA_STOP_${exactCamStopQuery.id}`;
    }
    // 4. Explicit Curriculum Scene Query ("show me X", "load X", "open X", "go to X", "switch to X")
    else if (explicitSceneMatch) {
      const query = explicitQuery;
      const found = this.findSceneByVoiceQuery(query);
      const targetId = found ? found.id : (global.ASTSceneRegistry?.normalizeId?.(query) || query.replace(/\s+/g, '-'));
      if (found || global.ASTSceneRegistry?.getScene?.(targetId)) {
        this.engine.loadScene(targetId, true);
        executedAction = `LOAD_SCENE_${targetId}`;
        actionLabel = `✨ Loaded ${found ? found.title : targetId}`;
      }
    }
    // 5. Playback Speed
    else if (text.includes('faster') || text.includes('speed up') || text.includes('double speed') || text.includes('2x') || text.includes('two x')) {
      this.engine.setSpeed(2.0);
      if (el.speedSelector) el.speedSelector.value = '2';
      executedAction = 'SET_SPEED_2';
      actionLabel = '⚡ Speed: 2.0×';
    } else if (text.includes('slower') || text.includes('slow down') || text.includes('half speed') || text.includes('0.5x') || text.includes('point five')) {
      this.engine.setSpeed(0.5);
      if (el.speedSelector) el.speedSelector.value = '0.5';
      executedAction = 'SET_SPEED_0.5';
      actionLabel = '🐢 Speed: 0.5×';
    } else if (text.includes('normal speed') || text.includes('regular speed') || text.includes('1x') || text.includes('one x')) {
      this.engine.setSpeed(1.0);
      if (el.speedSelector) el.speedSelector.value = '1';
      executedAction = 'SET_SPEED_1';
      actionLabel = '▶ Speed: 1.0×';
    } else if (text.includes('1.5x') || text.includes('one point five')) {
      this.engine.setSpeed(1.5);
      if (el.speedSelector) el.speedSelector.value = '1.5';
      executedAction = 'SET_SPEED_1.5';
      actionLabel = '⚡ Speed: 1.5×';
    }
    // 6. Sound & Voice Narration
    else if (text.includes('unmute') || text.includes('sound on') || text.includes('audio on')) {
      this.engine.setMuted(false);
      executedAction = 'UNMUTE';
      actionLabel = '🔊 Audio Unmuted';
    } else if (text.includes('mute') || text.includes('sound off') || text.includes('quiet') || text.includes('silence')) {
      this.engine.setMuted(true);
      executedAction = 'MUTE';
      actionLabel = '🔇 Audio Muted';
    } else if (text.includes('voice on') || text.includes('narrat') || text.includes('read to me') || text.includes('enable voice')) {
      if (!this.engine.voiceEnabled) {
        const enabled = this.engine.toggleVoice();
        if (el.btnNarrate) {
          el.btnNarrate.classList.toggle('active', enabled);
          el.btnNarrate.textContent = enabled ? '🔊 Voice: ON' : '🔊 Voice';
        }
      }
      executedAction = 'VOICE_NARRATION_ON';
      actionLabel = '🔊 Voice Narration Enabled';
    } else if (text.includes('voice off') || text.includes('stop voice') || text.includes('disable voice') || text.includes('stop reading')) {
      if (this.engine.voiceEnabled) {
        const enabled = this.engine.toggleVoice();
        if (el.btnNarrate) {
          el.btnNarrate.classList.toggle('active', enabled);
          el.btnNarrate.textContent = enabled ? '🔊 Voice: ON' : '🔊 Voice';
        }
      }
      executedAction = 'VOICE_NARRATION_OFF';
      actionLabel = '🔇 Voice Narration Disabled';
    }
    // 7. Declarative 3D Camera Controls & Stops
    else if (matchedCamStop) {
      this.applyCameraStop(matchedCamStop);
      actionLabel = matchedCamStop.toast || `🎯 Camera: ${matchedCamStop.id}`;
      executedAction = `CAMERA_STOP_${matchedCamStop.id}`;
    } else if (text.includes('reset camera') || text.includes('reset 3d') || text.includes('reset view')) {
      this.engine.resetCamera();
      executedAction = 'RESET_3D';
      actionLabel = '🌐 3D Camera Reset';
    } else if (text.includes('orbit') || text.includes('rotate') || text.includes('spin') || text.includes('turn')) {
      this.engine.rotateCamera(45, 10);
      executedAction = 'ORBIT_3D';
      actionLabel = '🌐 3D Orbit (+45°)';
    }
    // 8. Loop & Mode & Fullscreen
    else if (text.includes('loop') || text.includes('repeat')) {
      this.engine.toggleLoop();
      executedAction = 'TOGGLE_LOOP';
      actionLabel = this.engine.isLooping ? '🔁 Loop ON' : '➡️ Loop OFF';
    } else if (text.includes('game mode') || text.includes('interactive mode') || text.includes('play game')) {
      if (el.btnPlayMode) el.btnPlayMode.click();
      executedAction = 'TOGGLE_PLAY_MODE';
      actionLabel = '🎮 Toggled Play Mode';
    } else if (text.includes('fullscreen') || text.includes('full screen')) {
      if (el.btnFullscreen) el.btnFullscreen.click();
      executedAction = 'TOGGLE_FULLSCREEN';
      actionLabel = '⛶ Toggled Fullscreen';
    } else if (text.includes('pip') || text.includes('picture in picture') || text.includes('float window') || text.includes('floating player') || text.includes('mini player')) {
      this.togglePictureInPicture();
      executedAction = 'TOGGLE_PIP';
      actionLabel = '📺 Toggled Picture-in-Picture';
    } else if (text.includes('quiz') || text.includes('checkpoint') || text.includes('challenge')) {
      if (el.btnInteractive) el.btnInteractive.click();
      executedAction = 'OPEN_QUIZ';
      actionLabel = '🎯 Opened Interactive Challenge';
    } else {
      // 9. Dynamic Catalog Fallback for bare spoken cartridge titles/topics
      const foundScene = this.findSceneByVoiceQuery(text);
      if (foundScene) {
        this.engine.loadScene(foundScene.id, true);
        executedAction = `LOAD_SCENE_${foundScene.id}`;
        actionLabel = `✨ Loaded ${foundScene.title}`;
      }
    }

    if (executedAction) {
      this.updateVoiceOverlayText(`✅ Executed: ${actionLabel}`);
      this.showToast(`🎙️ Voice: ${actionLabel}`);

      if (this.engine && typeof this.engine.notifyParent === 'function') {
        this.engine.notifyParent({
          type: 'VOICE_COMMAND_EXECUTED',
          command: text,
          action: executedAction,
          label: actionLabel,
        });
      }

      clearTimeout(this._voiceFeedbackTimeout);
      this._voiceFeedbackTimeout = setTimeout(() => {
        if (this.isListeningVoice) {
          this.updateVoiceOverlayText('🎙️ Listening for commands... ("play", "pause", "open <scene>")');
        }
      }, 3200);
    } else {
      this.updateVoiceOverlayText(`❓ Heard: "${rawTranscript}" (Try "play", "pause", "open <scene>")`);
      clearTimeout(this._voiceFeedbackTimeout);
      this._voiceFeedbackTimeout = setTimeout(() => {
        if (this.isListeningVoice) {
          this.updateVoiceOverlayText('🎙️ Listening for commands... ("play", "pause", "open <scene>")');
        }
      }, 3500);
    }
  }

  const ASTPlayerUIVoice = {
    initVoiceRecognition,
    startVoiceCommands,
    stopVoiceCommands,
    toggleVoiceCommands,
    updateVoiceStatusUI,
    updateVoiceOverlayText,
    findSceneByVoiceQuery,
    handleVoiceCommand,
  };

  global.ASTPlayerUIVoice = ASTPlayerUIVoice;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIVoice = ASTPlayerUIVoice;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTPlayerUIVoice;
  }
})(typeof window !== 'undefined' ? window : globalThis);
