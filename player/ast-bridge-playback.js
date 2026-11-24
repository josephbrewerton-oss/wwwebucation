/**
 * static/player/ast-bridge-playback.js
 *
 * St Joseph's AST Vector Media Player — Bridge Playback, Audio, Physics, Camera & UI Handlers
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Peer module loaded strictly before static/player/ast-bridge.js.
 * Zero external dependencies; every handler receives (ctx) = { engine, uiController, data, event, global }.
 */

(function (global) {
  'use strict';

  const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);

  function unlockAudio(engine) {
    if (engine && engine.audioSynth && typeof engine.audioSynth.unlock === 'function') {
      engine.audioSynth.unlock();
    }
  }

  function syncPlayUi(uiController, isPlaying) {
    if (uiController && typeof uiController.updateHeaderPlayUI === 'function') {
      uiController.updateHeaderPlayUI(Boolean(isPlaying), true);
    }
  }

  const handlers = Object.create(null);

  // --- Playback & Timing ---
  handlers.SET_TARGET_FPS = ({ engine, data }) => {
    if (isFiniteNum(data.fps) && data.fps >= 0) {
      engine.targetFps = data.fps;
    } else if (data.fps === 'adaptive' || !data.fps) {
      engine.targetFps = 0;
    }
  };

  handlers.SEEK = ({ engine, data }) => {
    if (isFiniteNum(data.progress) && typeof engine.seek === 'function') {
      engine.seek(data.progress);
    }
  };

  handlers.PLAY = ({ engine, uiController }) => {
    if (typeof engine.play === 'function') engine.play();
    syncPlayUi(uiController, true);
  };

  handlers.PAUSE = ({ engine, uiController }) => {
    if (typeof engine.pause === 'function') engine.pause();
    syncPlayUi(uiController, false);
  };

  handlers.TOGGLE_PLAY = ({ engine, uiController }) => {
    const playing = typeof engine.togglePlay === 'function' ? engine.togglePlay() : Boolean(engine.isPlaying);
    syncPlayUi(uiController, playing);
  };

  handlers.SET_LOOP = ({ engine, data }) => {
    if (typeof data.loop === 'boolean' && typeof engine.setLoop === 'function') {
      engine.setLoop(data.loop);
    }
  };

  handlers.TOGGLE_LOOP = ({ engine }) => {
    if (typeof engine.toggleLoop === 'function') engine.toggleLoop();
  };

  handlers.SET_SPEED = ({ engine, data }) => {
    const speed = Number(data.speed);
    if (Number.isFinite(speed) && speed > 0 && typeof engine.setSpeed === 'function') {
      engine.setSpeed(speed);
    }
  };

  // --- Audio & Voice ---
  handlers.SET_VOLUME = ({ engine, data }) => {
    if (isFiniteNum(data.volume)) {
      if (data.volume > 0) unlockAudio(engine);
      if (typeof engine.setVolume === 'function') engine.setVolume(data.volume);
    }
  };

  handlers.SET_MUTED = ({ engine, data }) => {
    if (typeof data.muted === 'boolean') {
      if (!data.muted) unlockAudio(engine);
      if (typeof engine.setMuted === 'function') engine.setMuted(data.muted);
    }
  };

  handlers.TOGGLE_MUTE = ({ engine }) => {
    const nowMuted = typeof engine.toggleMute === 'function' ? engine.toggleMute() : Boolean(engine.muted);
    if (!nowMuted) unlockAudio(engine);
  };

  handlers.SET_VOICE = ({ engine, uiController, data }) => {
    if (typeof data.enabled !== 'boolean') return;
    engine.voiceEnabled = data.enabled;
    if (!engine.voiceEnabled) {
      if (typeof engine.cancelSpeech === 'function') engine.cancelSpeech();
    } else {
      unlockAudio(engine);
    }
    if (uiController && uiController.elements && uiController.elements.btnNarrate) {
      uiController.elements.btnNarrate.classList.toggle('active', engine.voiceEnabled);
      uiController.elements.btnNarrate.textContent = engine.voiceEnabled ? '🔊 Voice: ON' : '🔊 Voice';
    }
  };

  handlers.SET_SPEECH_RATE = ({ engine, data }) => {
    const rate = Number(data.rate);
    if (Number.isFinite(rate) && rate > 0 && typeof engine.setSpeechRate === 'function') {
      engine.setSpeechRate(rate);
    }
  };

  handlers.AUDIO_PLAY_CLICK = ({ engine, data }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playClick === 'function') {
      engine.audioSynth.playClick(isFiniteNum(data.freq) ? data.freq : 900);
    }
  };
  handlers.AUDIO_PLAY_SUCCESS = ({ engine }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playSuccessChime === 'function') engine.audioSynth.playSuccessChime();
  };
  handlers.AUDIO_PLAY_FAIL = ({ engine }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playFailBuzz === 'function') engine.audioSynth.playFailBuzz();
  };
  handlers.AUDIO_PLAY_SPRING = ({ engine, data }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playSpring === 'function') {
      engine.audioSynth.playSpring(isFiniteNum(data.freq) ? data.freq : 440);
    }
  };
  handlers.AUDIO_PLAY_BOING = ({ engine, data }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playBoing === 'function') {
      engine.audioSynth.playBoing(isFiniteNum(data.freq) ? data.freq : 220);
    }
  };
  handlers.AUDIO_PLAY_WHISTLE = ({ engine, data }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playSlideWhistle === 'function') {
      engine.audioSynth.playSlideWhistle(
        isFiniteNum(data.startFreq) ? data.startFreq : 280,
        isFiniteNum(data.endFreq) ? data.endFreq : 840,
        isFiniteNum(data.duration) ? data.duration : 0.35
      );
    }
  };
  handlers.AUDIO_PLAY_POP = ({ engine, data }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playPop === 'function') {
      engine.audioSynth.playPop(isFiniteNum(data.freq) ? data.freq : 620);
    }
  };
  handlers.AUDIO_PLAY_WHOOSH = ({ engine }) => {
    if (engine.audioSynth && typeof engine.audioSynth.playWhoosh === 'function') engine.audioSynth.playWhoosh();
  };
  handlers.AUDIO_SET_HUM = ({ engine, data }) => {
    if (engine.audioSynth && typeof engine.audioSynth.setHum === 'function') {
      engine.audioSynth.setHum(
        isFiniteNum(data.freq) ? data.freq : 60,
        isFiniteNum(data.volume) ? data.volume : 0.05
      );
    }
  };
  handlers.AUDIO_STOP_HUM = ({ engine }) => {
    if (engine.audioSynth && typeof engine.audioSynth.stopHum === 'function') engine.audioSynth.stopHum();
  };

  // --- Physics ---
  handlers.SET_GRAVITY = ({ engine, data }) => {
    if (isFiniteNum(data.gravity) && engine.physics && typeof engine.physics.setGravity === 'function') {
      engine.physics.setGravity(data.gravity);
    }
  };
  handlers.SET_RESTITUTION = ({ engine, data }) => {
    if (!engine.physics || typeof engine.physics.setRestitution !== 'function') return;
    const val = isFiniteNum(data.restitution) ? data.restitution : (isFiniteNum(data.bounce) ? data.bounce : null);
    if (val !== null) engine.physics.setRestitution(val);
  };
  handlers.SET_FRICTION = ({ engine, data }) => {
    if (isFiniteNum(data.friction) && engine.physics && typeof engine.physics.setFriction === 'function') {
      engine.physics.setFriction(data.friction);
    }
  };
  handlers.SET_SUBSTEPS = ({ engine, data }) => {
    if (isFiniteNum(data.substeps) && engine.physics && typeof engine.physics.setSubsteps === 'function') {
      engine.physics.setSubsteps(data.substeps);
    }
  };
  handlers.RESET_PHYSICS = ({ engine }) => {
    if (engine.physics && typeof engine.physics.reset === 'function') engine.physics.reset();
  };
  handlers.PHYSICS_IMPULSE = ({ engine, data }) => {
    if (engine.physics && typeof engine.physics.applyImpulse === 'function') {
      engine.physics.applyImpulse(
        data.target || data.id,
        isFiniteNum(data.fx) ? data.fx : 0,
        isFiniteNum(data.fy) ? data.fy : -400
      );
    }
  };
  handlers.PHYSICS_JUMP = ({ engine, data }) => {
    if (engine.physics && typeof engine.physics.jump === 'function') {
      engine.physics.jump(
        data.target || data.id,
        isFiniteNum(data.jumpVelocity) ? data.jumpVelocity : -480
      );
    }
  };

  // --- Language, Subtitles & Slides ---
  const handleSetLang = ({ engine, uiController, data }) => {
    if (data.lang && typeof engine.setLanguage === 'function') engine.setLanguage(data.lang);
    if (uiController && typeof uiController.updateView === 'function') uiController.updateView();
  };
  handlers.SET_LANGUAGE = handleSetLang;
  handlers.SET_LANG = handleSetLang;

  handlers.SET_BILINGUAL_SUBTITLES = ({ engine, uiController, data }) => {
    if (typeof engine.setBilingualSubtitles === 'function') engine.setBilingualSubtitles(Boolean(data.enabled));
    if (uiController && typeof uiController.updateView === 'function') uiController.updateView();
  };

  const handleNextSlide = ({ engine, uiController }) => {
    if (engine.isContinuousSim) return;
    if (uiController && typeof uiController.stepToNextKeyframe === 'function') {
      uiController.stepToNextKeyframe();
    } else if (typeof engine.step === 'function') {
      engine.step(0.05);
    }
  };
  handlers.STEP_NEXT_KEYFRAME = handleNextSlide;
  handlers.NEXT_SLIDE = handleNextSlide;

  const handlePrevSlide = ({ engine, uiController }) => {
    if (engine.isContinuousSim) return;
    if (uiController && typeof uiController.stepToPrevKeyframe === 'function') {
      uiController.stepToPrevKeyframe();
    } else if (typeof engine.step === 'function') {
      engine.step(-0.05);
    }
  };
  handlers.STEP_PREV_KEYFRAME = handlePrevSlide;
  handlers.PREV_SLIDE = handlePrevSlide;

  const handleGotoSlide = ({ engine, uiController, data }) => {
    if (engine.isContinuousSim) return;
    if (isFiniteNum(data.progress)) {
      if (typeof engine.seek === 'function') engine.seek(data.progress);
      if (uiController && typeof uiController.onStopReached === 'function') {
        uiController.onStopReached(data.progress);
      }
    }
  };
  handlers.STEP_TO_KEYFRAME = handleGotoSlide;
  handlers.GOTO_SLIDE = handleGotoSlide;

  const handleToggleBsl = ({ uiController, data }) => {
    if (uiController && typeof uiController.toggleBsl === 'function') {
      uiController.toggleBsl(typeof data.enabled === 'boolean' ? data.enabled : undefined, false);
    }
  };
  handlers.TOGGLE_BSL = handleToggleBsl;
  handlers.SET_BSL = handleToggleBsl;

  handlers.REQUEST_SUBTITLE = ({ engine }) => {
    const curSub = typeof engine.getCurrentSubtitle === 'function' ? engine.getCurrentSubtitle() : '';
    let subText = typeof curSub === 'string'
      ? curSub
      : (curSub && (curSub.en || curSub.localized) ? (curSub.en || curSub.localized) : '');
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
  };

  // --- Checkpoints, Theme & UI Drawers ---
  const handleToggleCheckpoint = ({ uiController }) => {
    if (uiController && typeof uiController.toggleCheckpointView === 'function') {
      uiController.toggleCheckpointView();
    } else if (uiController && typeof uiController.triggerFirstCheckpoint === 'function') {
      uiController.triggerFirstCheckpoint();
    }
  };
  handlers.TRIGGER_CHECKPOINT = handleToggleCheckpoint;
  handlers.TAKE_QUIZ = handleToggleCheckpoint;
  handlers.TOGGLE_CHECKPOINT = handleToggleCheckpoint;

  handlers.TOGGLE_INTERACTIVE_MODE = ({ uiController }) => {
    if (uiController && typeof uiController.toggleInteractiveMode === 'function') {
      uiController.toggleInteractiveMode();
    }
  };

  const handleSetInteractiveMode = ({ uiController, data }) => {
    if (uiController && typeof uiController.setInteractiveMode === 'function') {
      const isEnabled = typeof data.enabled === 'boolean'
        ? data.enabled
        : (typeof data.value === 'boolean' ? data.value : true);
      uiController.setInteractiveMode(isEnabled);
    }
  };
  handlers.SET_QUESTIONS = handleSetInteractiveMode;
  handlers.SET_INTERACTIVE_MODE = handleSetInteractiveMode;

  handlers.CLOSE_CHECKPOINT = ({ uiController }) => {
    if (uiController && typeof uiController.closeInteractiveCard === 'function') {
      uiController.closeInteractiveCard(false);
    }
  };

  handlers.SET_THEME = ({ uiController, data }) => {
    if (data.theme && uiController && typeof uiController.setTheme === 'function') {
      uiController.setTheme(data.theme);
    }
  };

  handlers.FOCUS_STAGE = ({ engine }) => {
    const svgEl = typeof engine.getStageSvg === 'function' ? engine.getStageSvg() : null;
    if (svgEl && typeof svgEl.focus === 'function') {
      try { svgEl.focus({ preventScroll: true }); } catch (_) {
        try { svgEl.focus(); } catch (_) {}
      }
    }
    if (typeof window !== 'undefined' && typeof window.focus === 'function') {
      try { window.focus(); } catch (_) {}
    }
  };

  handlers.TOGGLE_OBS_DRAWER = ({ uiController }) => {
    if (uiController && typeof uiController.toggleObsDrawer === 'function') uiController.toggleObsDrawer();
  };
  handlers.TOGGLE_WEBRTC_DRAWER = ({ uiController }) => {
    if (uiController && typeof uiController.toggleWebRtcDrawer === 'function') uiController.toggleWebRtcDrawer();
  };
  handlers.TOGGLE_SETTINGS_DRAWER = ({ uiController }) => {
    if (uiController && typeof uiController.toggleSettingsDrawer === 'function') uiController.toggleSettingsDrawer();
  };

  // --- 3D Camera ---
  handlers.ROTATE_3D = ({ engine, data }) => {
    if ((isFiniteNum(data.deltaYaw) || isFiniteNum(data.deltaPitch)) && typeof engine.rotateCamera === 'function') {
      engine.rotateCamera(isFiniteNum(data.deltaYaw) ? data.deltaYaw : 0, isFiniteNum(data.deltaPitch) ? data.deltaPitch : 0);
    }
  };
  handlers.ZOOM_3D = ({ engine, data }) => {
    if (isFiniteNum(data.deltaZoom) && typeof engine.zoomCamera === 'function') {
      engine.zoomCamera(data.deltaZoom);
    }
  };
  handlers.SET_CAMERA = ({ engine, data }) => {
    if (!engine.cameraOrbit || typeof engine.cameraOrbit !== 'object') {
      engine.cameraOrbit = { yawOffset: 0, pitchOffset: 0, distanceScale: 1 };
    }
    if (isFiniteNum(data.yaw)) engine.cameraOrbit.yawOffset = data.yaw;
    if (isFiniteNum(data.pitch)) engine.cameraOrbit.pitchOffset = data.pitch;
    if (isFiniteNum(data.distanceScale)) engine.cameraOrbit.distanceScale = data.distanceScale;
    if (typeof engine.applyBindings === 'function') engine.applyBindings(engine.progress);
    if (typeof engine.emit === 'function') engine.emit('camerachange', { ...engine.cameraOrbit });
  };
  handlers.RESET_3D = ({ engine }) => {
    if (typeof engine.resetCamera === 'function') engine.resetCamera();
  };
  handlers.ROTATE_CAMERA_ORBIT = ({ engine, data }) => {
    if (typeof engine.rotateCamera === 'function') {
      engine.rotateCamera(isFiniteNum(data.theta) ? data.theta : 0, isFiniteNum(data.phi) ? data.phi : 0, data.relative);
    }
  };

  global.ASTBridgePlaybackHandlers = handlers;
  if (typeof window !== 'undefined') {
    window.ASTBridgePlaybackHandlers = handlers;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
