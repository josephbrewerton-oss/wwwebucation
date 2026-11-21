/**
 * static/player/player-ui.js
 * 
 * St Joseph's AST Vector Media Player — UI Controller
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 * 
 * AST Vector Media Player UI Controller
 * Binds DOM elements, timeline scrubbing, responsive touch events, keyboard shortcuts,
 * and SVG export / print rendering.
 */

(function (global) {
  'use strict';

  function _getPlayerUIStudio() {
    return global.ASTPlayerUIStudio || (typeof window !== 'undefined' ? window.ASTPlayerUIStudio : undefined);
  }

  function _getPlayerUICheckpoints() {
    return global.ASTPlayerUICheckpoints || (typeof window !== 'undefined' ? window.ASTPlayerUICheckpoints : undefined);
  }

  function _getPlayerUIVoice() {
    return global.ASTPlayerUIVoice || (typeof window !== 'undefined' ? window.ASTPlayerUIVoice : undefined);
  }

  function _getPlayerUIBroadcast() {
    return global.ASTPlayerUIBroadcast || (typeof window !== 'undefined' ? window.ASTPlayerUIBroadcast : undefined);
  }

  class ASTPlayerUI {
    constructor(engine, elements = {}) {
      this.engine = engine;
      this.elements = Object.assign({
        stageSvg: document.getElementById('stage-svg'),
        sceneRoot: document.getElementById('scene-root'),
        subtitleOverlay: document.getElementById('subtitle-overlay'),
        ambientTimeline: document.getElementById('ambient-timeline'),
        ambientTimelineFill: document.getElementById('ambient-timeline-fill'),
        ambientTimelineThumb: document.getElementById('ambient-timeline-thumb'),
        stagePlayIndicator: document.getElementById('stage-play-indicator'),
        timelineFill: document.getElementById('timeline-fill'),
        timelineThumb: document.getElementById('timeline-thumb'),
        timelineTrack: document.getElementById('timeline-track'),
        scrubberBox: document.getElementById('scrubber-box'),
        timeReadout: document.getElementById('time-readout'),
        btnOpenFile: document.getElementById('btn-open-file'),
        btnPlay: document.getElementById('btn-play'),
        btnHeaderPlay: document.getElementById('btn-header-play'),
        headerPlayIcon: document.getElementById('header-play-icon'),
        headerPlayLabel: document.getElementById('header-play-label'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
        btnReset: document.getElementById('btn-reset'),
        btnLoop: document.getElementById('btn-loop'),
        loopLabel: document.getElementById('loop-label'),
        btnVolumeMute: document.getElementById('btn-volume-mute'),
        volumeSlider: document.getElementById('volume-slider'),
        volumeBox: document.getElementById('volume-box'),
        btnShortcuts: document.getElementById('btn-shortcuts'),
        shortcutsModal: document.getElementById('shortcuts-modal'),
        shortcutsClose: document.getElementById('shortcuts-close'),
        btnStepMode: document.getElementById('btn-step-mode'),
        slideDeckBar: document.getElementById('slide-deck-bar'),
        slideDeckPills: document.getElementById('slide-deck-pills'),
        btnNarrate: document.getElementById('btn-narrate'),
        btnBsl: document.getElementById('btn-bsl'),
        btnVoiceCmd: document.getElementById('btn-voice-cmd'),
        voiceCmdOverlay: document.getElementById('voice-cmd-overlay'),
        voiceCmdText: document.getElementById('voice-cmd-text'),
        btnTheme: document.getElementById('btn-theme'),
        btnSuiteMode: document.getElementById('btn-suite-mode'),
        btnDownloadZip: document.getElementById('btn-download-zip'),
        playerFooter: document.querySelector('footer'),
        btnPip: document.getElementById('btn-pip'),
        btnFullscreen: document.getElementById('btn-fullscreen'),
        btnPrint: document.getElementById('btn-print'),
        btnCopySvg: document.getElementById('btn-copy-svg'),
        btnLogJotterCsv: document.getElementById('btn-log-jotter-csv'),
        btnPlayMode: document.getElementById('btn-play-mode'),
        btnPen: document.getElementById('btn-pen'),
        btnInteractive: document.getElementById('btn-interactive'),
        interactiveCard: document.getElementById('interactive-card'),
        interactiveBody: document.getElementById('interactive-body'),
        interactiveBadge: document.getElementById('interactive-badge'),
        interactiveClose: document.getElementById('interactive-close'),
        interactiveToggleMin: document.getElementById('interactive-toggle-min'),
        checkpointMinimizedPill: document.getElementById('checkpoint-minimized-pill'),
        btnRestoreCheckpoint: document.getElementById('btn-restore-checkpoint'),
        astToast: document.getElementById('ast-toast'),
        presetSelector: document.getElementById('preset-selector'),
        speedSelector: document.getElementById('speed-selector'),
        langSelector: document.getElementById('lang-selector'),
        badgeStage: document.getElementById('badge-stage'),
        badgeNativeSeal: document.getElementById('badge-native-seal'),
        btn3DOrbit: document.getElementById('btn-3d-orbit'),
        orbitHint: document.getElementById('orbit-hint'),
        playerStage: document.getElementById('player-stage'),
        cameraControlsBar: document.getElementById('camera-controls-bar'),
        churchCamButtons: document.getElementById('church-cam-buttons'),
        btnQuestMode: document.getElementById('btn-quest-mode'),
        questDrawer: document.getElementById('quest-drawer'),
        questScore: document.getElementById('quest-score'),
        questBody: document.getElementById('quest-body'),
        questClose: document.getElementById('quest-close'),
        btnDevMode: document.getElementById('btn-dev-mode'),
        btnDevStudio: document.getElementById('btn-dev-studio'),
        devOverlayRoot: document.getElementById('dev-overlay-root'),
        devHoverBox: document.getElementById('dev-hover-box'),
        devSelectBox: document.getElementById('dev-select-box'),
        devHoverTooltip: document.getElementById('dev-hover-tooltip'),
        devInspectorDrawer: document.getElementById('dev-inspector-drawer'),
        devInspectorClose: document.getElementById('dev-inspector-close'),
        devInspectedTag: document.getElementById('dev-inspected-tag'),
        devInspectedSel: document.getElementById('dev-inspected-sel'),
        devPropXy: document.getElementById('dev-prop-xy'),
        devPropWh: document.getElementById('dev-prop-wh'),
        devColorFill: document.getElementById('dev-color-fill'),
        devPropFill: document.getElementById('dev-prop-fill'),
        devColorStroke: document.getElementById('dev-color-stroke'),
        devPropStroke: document.getElementById('dev-prop-stroke'),
        devPropStrokew: document.getElementById('dev-prop-strokew'),
        devRangeOpacity: document.getElementById('dev-prop-opacity') || document.getElementById('dev-range-opacity'),
        devValOpacity: document.getElementById('dev-val-opacity'),
        devPropTransform: document.getElementById('dev-prop-transform'),
        btnCopySelector: document.getElementById('btn-copy-selector'),
        btnCopyAstRule: document.getElementById('dev-btn-export-ast') || document.getElementById('btn-copy-ast-rule'),
        btnBindToStudio: document.getElementById('btn-bind-to-studio'),
        btnDevDelete: document.getElementById('dev-btn-delete'),
        btnCopyNodeXml: document.getElementById('btn-copy-node-xml'),
        devActiveBindings: document.getElementById('dev-active-bindings'),
        devStudioDrawer: document.getElementById('dev-studio-drawer'),
        devStudioClose: document.getElementById('dev-studio-close'),
        btnStudioRun: document.getElementById('btn-studio-run'),
        btnStudioSaveAs: document.getElementById('btn-studio-save-as'),
        studioSaveAsBar: document.getElementById('studio-save-as-bar'),
        remixTitleInput: document.getElementById('remix-title-input'),
        remixIdInput: document.getElementById('remix-id-input'),
        remixFilePreview: document.getElementById('remix-file-preview'),
        btnRemixSaveVault: document.getElementById('btn-remix-save-vault'),
        btnRemixSaveDuo: document.getElementById('btn-remix-save-duo'),
        btnRemixSaveAstb: document.getElementById('btn-remix-save-astb'),
        btnRemixCancel: document.getElementById('btn-remix-cancel'),
        matcherSummaryBadge: document.getElementById('matcher-summary-badge'),
        matcherBody: document.getElementById('matcher-body'),
        btnMatcherNanoExplain: document.getElementById('btn-matcher-nano-explain'),
        btnMatcherAutofixAll: document.getElementById('btn-matcher-autofix-all'),
        studioNanoInput: document.getElementById('studio-nano-input'),
        btnStudioNanoAsk: document.getElementById('btn-studio-nano-ask'),
        btnStudioNanoUndo: document.getElementById('btn-studio-nano-undo'),
        studioNanoPreview: document.getElementById('studio-nano-preview'),
        studioNanoEnginePill: document.getElementById('studio-nano-engine-pill'),
        studioNanoExplanation: document.getElementById('studio-nano-explanation'),
        studioNanoCheckBadge: document.getElementById('studio-nano-check-badge'),
        btnStudioNanoApply: document.getElementById('btn-studio-nano-apply'),
        btnStudioNanoDismiss: document.getElementById('btn-studio-nano-dismiss'),
        btnStudioReset: document.getElementById('btn-studio-reset'),
        btnStudioExport: document.getElementById('btn-studio-export'),
        btnStudioExportSpa: document.getElementById('btn-studio-export-spa'),
        btnHeaderExportSpa: document.getElementById('btn-header-export-spa'),
        devEditorSvg: document.getElementById('dev-editor-svg'),
        devEditorAst: document.getElementById('dev-editor-ast'),
        devTemplateTab: document.getElementById('dev-template-tab'),
        devCompilerTab: document.getElementById('dev-compiler-tab'),
        devQuizbuilderTab: document.getElementById('dev-quizbuilder-tab'),
        devEditorSlideScript: document.getElementById('dev-editor-slidescript'),
        btnDecompileAst: document.getElementById('btn-decompile-ast'),
        qbTime: document.getElementById('qb-time'),
        qbBtnCaptureTime: document.getElementById('qb-btn-capture-time'),
        qbTimeSeconds: document.getElementById('qb-time-seconds'),
        qbTitle: document.getElementById('qb-title'),
        qbPrompt: document.getElementById('qb-prompt'),
        qbExplanation: document.getElementById('qb-explanation'),
        qbBtnInsert: document.getElementById('qb-btn-insert'),
        qbExistingList: document.getElementById('qb-existing-list'),
        btnWebRtcLink: document.getElementById('btn-webrtc-link'),
        webrtcStatusDot: document.getElementById('webrtc-status-dot'),
        webrtcDrawer: document.getElementById('webrtc-drawer'),
        webrtcDrawerBadge: document.getElementById('webrtc-drawer-badge'),
        webrtcDrawerClose: document.getElementById('webrtc-drawer-close'),
        btnWebRtcLoopback: document.getElementById('btn-webrtc-loopback'),
        btnWebRtcCreateOffer: document.getElementById('btn-webrtc-create-offer'),
        btnWebRtcJoinRoom: document.getElementById('btn-webrtc-join-room'),
        webrtcRoleReadout: document.getElementById('webrtc-role-readout'),
        webrtcLatencyReadout: document.getElementById('webrtc-latency-readout'),
        webrtcExchangeArea: document.getElementById('webrtc-exchange-area'),
        webrtcExchangeLabel: document.getElementById('webrtc-exchange-label'),
        webrtcTokenBox: document.getElementById('webrtc-token-box'),
        btnWebRtcCopyToken: document.getElementById('btn-webrtc-copy-token'),
        btnWebRtcConfirmToken: document.getElementById('btn-webrtc-confirm-token'),
        webrtcAiInput: document.getElementById('webrtc-ai-input'),
        btnWebRtcAiAsk: document.getElementById('btn-webrtc-ai-ask'),
        webrtcAiOutput: document.getElementById('webrtc-ai-output'),
        btnObsLink: document.getElementById('btn-obs-link'),
        obsStatusDot: document.getElementById('obs-status-dot'),
        obsDrawer: document.getElementById('obs-drawer'),
        obsDrawerBadge: document.getElementById('obs-drawer-badge'),
        obsDrawerClose: document.getElementById('obs-drawer-close'),
        obsInputUrl: document.getElementById('obs-input-url'),
        obsInputPassword: document.getElementById('obs-input-password'),
        btnObsConnect: document.getElementById('btn-obs-connect'),
        btnObsDisconnect: document.getElementById('btn-obs-disconnect'),
        obsToggleRecord: document.getElementById('obs-toggle-record'),
        obsToggleSubtitles: document.getElementById('obs-toggle-subtitles'),
        obsInputSource: document.getElementById('obs-input-source'),
        obsToggleTransparent: document.getElementById('obs-toggle-transparent'),
        obsLiveControls: document.getElementById('obs-live-controls'),
        obsSelectScene: document.getElementById('obs-select-scene'),
        btnObsRecordToggle: document.getElementById('btn-obs-record-toggle'),
        btnStudioPanelToggle: document.getElementById('btn-studio-panel-toggle'),
        studioControlPanel: document.getElementById('studio-control-panel'),
        studioPanelClose: document.getElementById('studio-panel-close'),
        btnSettings: document.getElementById('btn-settings'),
        settingsLabel: document.getElementById('settings-label'),
        settingsDrawer: document.getElementById('settings-drawer'),
        settingsDrawerClose: document.getElementById('settings-drawer-close'),
        settingsBadge: document.getElementById('settings-badge'),
        btnResetConfig: document.getElementById('btn-reset-config'),
        modeCardClassroom: document.getElementById('mode-card-classroom'),
        modeCardStudent: document.getElementById('mode-card-student'),
        modeCardBroadcast: document.getElementById('mode-card-broadcast'),
        modeCardDeveloper: document.getElementById('mode-card-developer'),
        cfgCheckpoints: document.getElementById('cfg-checkpoints'),
        cfg3D: document.getElementById('cfg-3d'),
        cfgInspect: document.getElementById('cfg-inspect'),
        cfgStudio: document.getElementById('cfg-studio'),
        cfgExportSpa: document.getElementById('cfg-export-spa'),
        cfgPip: document.getElementById('cfg-pip'),
        cfgPerfHud: document.getElementById('cfg-perf-hud'),
        cfgStrictBudget: document.getElementById('cfg-strict-budget'),
        cfgObs: document.getElementById('cfg-obs'),
        cfgPrint: document.getElementById('cfg-print'),
        cfgCopySvg: document.getElementById('cfg-copy-svg'),
        cfgVoice: document.getElementById('cfg-voice'),
        cfgSubtitles: document.getElementById('cfg-subtitles'),
        cfgScrubber: document.getElementById('cfg-scrubber'),
        cfgSpeed: document.getElementById('cfg-speed'),
        cfgLang: document.getElementById('cfg-lang'),
        cfgLoop: document.getElementById('cfg-loop'),
        cfgVolume: document.getElementById('cfg-volume'),
        cfgPhysics: document.getElementById('cfg-physics'),
        physicsConfigSection: document.getElementById('physics-config-section'),
        cfgPhysicsGravity: document.getElementById('cfg-physics-gravity'),
        cfgPhysicsBounce: document.getElementById('cfg-physics-bounce'),
        cfgPhysicsFriction: document.getElementById('cfg-physics-friction'),
        cfgValGravity: document.getElementById('cfg-val-gravity'),
        cfgValBounce: document.getElementById('cfg-val-bounce'),
        cfgValFriction: document.getElementById('cfg-val-friction'),
        btnPhysicsImpulse: document.getElementById('btn-physics-impulse'),
        btnPhysicsReset: document.getElementById('btn-physics-reset'),
      }, elements);

      this.isDragging = false;
      this.isOrbitDragging = false;
      this.theme = document.body.getAttribute('data-theme') || 'dark';
      this.displayConfig = this.initDisplayConfig();
      this.interactiveMode = this.displayConfig.showInteractiveCheckpoints !== false;
      this.completedCheckpoints = new Set();
      this.activeCheckpoint = null;
      this.minimizedCheckpoint = null;
      this.stepMode = false;
      this.targetStop = null;
      this.toastTimeout = null;
      this._orbitHintTimeout = null;
      this.bslEnabled = false;
      try {
        const _urlBsl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('bsl') : null;
        if (_urlBsl === '1' || _urlBsl === 'true') {
          this.bslEnabled = true;
        } else if (_urlBsl === '0' || _urlBsl === 'false') {
          this.bslEnabled = false;
        } else {
          const _store = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
          if (_store) {
            this.bslEnabled = _store.getItem('stj_bsl_enabled') === 'true';
          }
        }
      } catch (_) {}

      // Voice Command SpeechRecognition State
      this.isListeningVoice = false;
      this.recognition = null;
      this._voiceRestartTimeout = null;
      this._voiceFeedbackTimeout = null;

      // Developer Mode & SVG Inspector State
      this.devModeActive = false;
      this.selectedElement = null;
      this.selectedElementSelector = '';
      this.activeStudioTab = 'compiler';

      const _studioMod = _getPlayerUIStudio();
      this.starterTemplates = (_studioMod && Array.isArray(_studioMod.DEFAULT_STARTER_TEMPLATES))
        ? _studioMod.DEFAULT_STARTER_TEMPLATES.map(t => ({ ...t }))
        : [];

      this.questState = {
        active: false,
        missionIndex: 0,
        score: 0,
        completedMissions: new Set(),
        tourRunId: 1
      };

      this.questMissions = [];
      this._catalogScenes = [];

      this.init();
    }

    playChime(freq = 523.25, type = 'sine') {
      if (window.__astGestures && typeof window.__astGestures._isControlEnabled === 'function' && !window.__astGestures._isControlEnabled('audio')) {
        return;
      }
      if (this.engine && (this.engine.muted || this.engine.volume === 0)) return;
      const schedule = (ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      };
      try {
        if (this.engine && this.engine.audioSynth && typeof this.engine.audioSynth.withRunningContext === 'function') {
          this.engine.audioSynth.unlock();
          this.engine.audioSynth.withRunningContext(schedule);
          return;
        }
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        let ctx = window.__astSharedAudioCtx;
        if (!ctx || ctx.state === 'closed') {
          ctx = new AudioCtx();
          window.__astSharedAudioCtx = ctx;
        }
        if (ctx.state === 'running') {
          schedule(ctx);
        } else if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
          ctx.resume().then(() => {
            if (ctx.state === 'running') schedule(ctx);
          }).catch(() => {});
        }
      } catch (_) {}
    }

    showToast(message) {
      if (!this.elements.astToast) return;
      this.elements.astToast.textContent = message;
      this.elements.astToast.classList.add('show');
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        if (this.elements.astToast) this.elements.astToast.classList.remove('show');
      }, 2200);
    }

    // --- Interactive Checkpoints, Goals, Jotter CSV & Quest Helpers (delegated to player-ui-checkpoints.js) ---

    minimizeInteractiveCard() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.minimizeInteractiveCard === 'function') _c.minimizeInteractiveCard.call(this);
    }

    restoreInteractiveCard() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.restoreInteractiveCard === 'function') _c.restoreInteractiveCard.call(this);
    }

    closeInteractiveCard(resumePlayback = false) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.closeInteractiveCard === 'function') _c.closeInteractiveCard.call(this, resumePlayback);
    }

    toggleCheckpointView() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.toggleCheckpointView === 'function') _c.toggleCheckpointView.call(this);
    }

    toggleInteractiveMode() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.toggleInteractiveMode === 'function') _c.toggleInteractiveMode.call(this);
    }

    setInteractiveMode(enabled) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.setInteractiveMode === 'function') _c.setInteractiveMode.call(this, enabled);
    }

    _resolveQuizTargetSelector(checkpoint) {
      const _c = _getPlayerUICheckpoints();
      return _c && typeof _c._resolveQuizTargetSelector === 'function' ? _c._resolveQuizTargetSelector.call(this, checkpoint) : '';
    }

    async askNanoAboutCheckpoint(checkpoint, index, attemptState = {}) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.askNanoAboutCheckpoint === 'function') return _c.askNanoAboutCheckpoint.call(this, checkpoint, index, attemptState);
    }

    _h(tag, opts, ...children) {
      const node = document.createElement(tag);
      if (opts) {
        if (opts.id) node.id = opts.id;
        if (opts.className) node.className = opts.className;
        if (opts.type) node.type = opts.type;
        if (opts.title) node.title = opts.title;
        if (opts.text !== undefined) node.textContent = String(opts.text);
        if (opts.css) node.style.cssText = opts.css;
        if (opts.attrs) {
          for (const [k, v] of Object.entries(opts.attrs)) {
            if (v !== undefined && v !== null) node.setAttribute(k, String(v));
          }
        }
      }
      for (const ch of children) {
        if (ch !== null && ch !== undefined && ch !== false) {
          node.appendChild(typeof ch === 'string' || typeof ch === 'number' ? document.createTextNode(String(ch)) : ch);
        }
      }
      return node;
    }

    triggerCheckpoint(checkpoint, index) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.triggerCheckpoint === 'function') _c.triggerCheckpoint.call(this, checkpoint, index);
    }

    updateGoalCheckpointProgress() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.updateGoalCheckpointProgress === 'function') _c.updateGoalCheckpointProgress.call(this);
    }

    handleGoalCheckpointPassed(data) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.handleGoalCheckpointPassed === 'function') _c.handleGoalCheckpointPassed.call(this, data);
    }

    logDataToJotterCsv(forceDownload = false) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.logDataToJotterCsv === 'function') _c.logDataToJotterCsv.call(this, forceDownload);
    }

    triggerFirstCheckpoint() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.triggerFirstCheckpoint === 'function') _c.triggerFirstCheckpoint.call(this);
    }

    checkInteractiveCheckpoints() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.checkInteractiveCheckpoints === 'function') _c.checkInteractiveCheckpoints.call(this);
    }

    getSceneQuestsConfig() {
      const _c = _getPlayerUICheckpoints();
      return _c && typeof _c.getSceneQuestsConfig === 'function' ? _c.getSceneQuestsConfig.call(this) : null;
    }

    getSceneQuestMissions() {
      const _c = _getPlayerUICheckpoints();
      return _c && typeof _c.getSceneQuestMissions === 'function' ? _c.getSceneQuestMissions.call(this) : [];
    }

    getSceneCameraStops() {
      return (this.engine && this.engine.scene && Array.isArray(this.engine.scene.cameraStops))
        ? this.engine.scene.cameraStops
        : [];
    }

    applyCameraStop(stop) {
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

    update3DStatus() {
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

    init() {
      if (this.elements.sceneRoot) {
        this.engine.container = this.elements.sceneRoot;
      }
      this.populatePresets();
      this.bindDOMEvents();
      this.bindEngineEvents();
      this.setupKeyframeMarkers();
      this.projectControls(this.engine.scene);
      this.update3DStatus();
      this.initObsBroadcast();
      this.applyDisplayConfig(this.displayConfig);
      this.updateView();

      // Ensure immediate render of initial scene onto stage
      if (this.engine && this.engine.scene && this.engine.container) {
        this.engine.mountSceneAsset(this.engine.scene, this.engine.container);
        this.engine.applyBindings(this.engine.progress);
      }
    }

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    async populatePresets() {
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
    saveToLocalVault(sceneData) {
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
        if (window.ASTSceneRegistry) {
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

    setupKeyframeMarkers() {
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

    updateView() {
      const scene = this.engine?.scene;
      if (this.elements.badgeStage) {
        this.elements.badgeStage.textContent = (scene && scene.stage) ? scene.stage : 'CURRICULUM';
      }
      this.updateBslButton();

      // Highlight active slide pill
      if (this.elements.slideDeckPills && scene && Array.isArray(scene.keyframes)) {
        const curT = this.engine.progress;
        let activeIdx = 0;
        scene.keyframes.forEach((kf, idx) => {
          if (kf.t <= curT + 0.02) activeIdx = idx;
        });
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

      // Render vector SVG via direct element attribute patching (zero DOM thrashing, 60 FPS)
      if (this.elements.sceneRoot) {
        this.engine.renderCurrentVector(this.elements.sceneRoot);
      }

      // Subtitles
      if (this.elements.subtitleOverlay) {
        const sub = this.engine.getCurrentSubtitle();
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

      // Ambient Hairline and Legacy Scrubber
      const pct = (this.engine.progress * 100).toFixed(1);
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
        (scene && (
          scene.type === 'Sim' ||
          scene.cartridgeType === 'Sim' ||
          scene.type === 'App' ||
          scene.cartridgeType === 'App'
        ))
      );

      // On simulations, switch off the timeline scrubber and step buttons
      if (this.elements.scrubberBox) {
        this.elements.scrubberBox.style.display = isContinuousSim ? 'none' : (this.displayConfig?.showTimelineScrubber !== false ? '' : 'none');
      }
      if (this.elements.btnPrev) {
        this.elements.btnPrev.style.display = isContinuousSim ? 'none' : (this.displayConfig?.showPlaybackControls !== false ? '' : 'none');
      }
      if (this.elements.btnNext) {
        this.elements.btnNext.style.display = isContinuousSim ? 'none' : (this.displayConfig?.showPlaybackControls !== false ? '' : 'none');
      }

      if (this.elements.timeReadout) {
        if (isContinuousSim) {
          this.elements.timeReadout.textContent = '⚡ 60 FPS Interactive Lab';
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
            this.elements.timeReadout.textContent = `Slide ${activeIdx + 1} of ${kfs.length}: ${cleanTitle}`;
          } else {
            const curSec = Math.floor(this.engine.progress * (this.engine.durationSec || 10));
            const totalSec = Math.floor(this.engine.durationSec || 10);
            this.elements.timeReadout.textContent = `${this.formatTime(curSec)} / ${this.formatTime(totalSec)} (${pct}%)`;
          }
        }
      }
    }

    setTheme(theme) {
      this.theme = theme === 'dark' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', this.theme);
      if (this.elements.btnTheme) {
        this.elements.btnTheme.textContent = this.theme === 'dark' ? '☀️' : '🌙';
      }
    }

    /**
     * Fantasy Console / Lisp Machine AST Control Projection Subsystem
     * Reads (ui:controls ...) declared in active cartridge and dynamically
     * projects controls into in-stage glass overlay.
     */
    projectControls(scene) {
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

    syncProjectedControls(varName, value) {
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

    resetSimulation() {
      this.targetStop = null;
      if (this.engine && typeof this.engine.dispatchAction === 'function') {
        this.engine.dispatchAction('sim:reset');
      } else {
        this.engine.seek(0.0);
        this.engine.resetVars();
        if (this.engine.physics) this.engine.physics.reset();
        this.engine.resetCamera();
        if (typeof this.engine.applyBindings === 'function') {
          this.engine.applyBindings(0.0);
        }
      }
      this.updateHeaderPlayUI(Boolean(this.engine?.isPlaying));
      this.showToast('↺ Simulation Reset to Initial State');
    }

    updateHeaderPlayUI(playing, showRipple = false) {
      const isPlaying = Boolean(playing);
      const el = this.elements;
      if (el.btnHeaderPlay) {
        el.btnHeaderPlay.classList.toggle('active', isPlaying);
        el.btnHeaderPlay.classList.toggle('is-playing', isPlaying);
        if (el.headerPlayIcon) {
          el.headerPlayIcon.textContent = isPlaying ? '⏸' : '▶';
        }
        if (el.headerPlayLabel) {
          el.headerPlayLabel.textContent = isPlaying ? 'Pause' : 'Play';
        }
      }
      if (el.btnPlay) {
        el.btnPlay.textContent = isPlaying ? '⏸ Pause Sim' : '▶ Resume Sim';
        el.btnPlay.classList.toggle('active', isPlaying);
      }
      if (showRipple) {
        this.showPlayPauseRipple(isPlaying);
      }
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'PLAY_STATE_CHANGED', isPlaying }, '*');
        }
      } catch (_) {}
    }

    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    }

    toggleBsl(forceState, notify = true) {
      if (typeof forceState === 'boolean') {
        this.bslEnabled = forceState;
      } else {
        this.bslEnabled = !this.bslEnabled;
      }
      try {
        const _bslStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
        if (_bslStore) {
          _bslStore.setItem('stj_bsl_enabled', this.bslEnabled ? 'true' : 'false');
        }
      } catch (_) {}
      this.updateBslButton();
      if (notify) {
        this.engine.notifyParent({ type: 'TOGGLE_BSL', enabled: this.bslEnabled });
      }
      this.showToast(this.bslEnabled ? '🖐️ BSL Signing: ON' : '🖐️ BSL Signing: OFF');
    }

    updateBslButton() {
      if (this.elements.btnBsl) {
        this.elements.btnBsl.classList.toggle('active', Boolean(this.bslEnabled));
        const label = this.elements.btnBsl.querySelector('.btn-label');
        if (label) {
          label.textContent = this.bslEnabled ? 'BSL: ON' : 'BSL';
        }
      }
    }

    handleScrubberClick(e) {
      if (!this.elements.timelineTrack) return;
      const rect = this.elements.timelineTrack.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const targetT = clickX / rect.width;
      this.engine.seek(targetT);
      this.updateView();
    }

    showPlayPauseRipple(isPlaying) {
      if (!this.elements.stagePlayIndicator) return;
      const ind = this.elements.stagePlayIndicator;
      ind.textContent = isPlaying ? '▶' : '⏸';
      ind.classList.remove('hidden');
      ind.classList.remove('animate-ripple');
      void ind.offsetWidth; // re-flow
      ind.classList.add('animate-ripple');
      setTimeout(() => {
        ind.classList.add('hidden');
        ind.classList.remove('animate-ripple');
      }, 650);
    }

    bindDOMEvents() {
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

        stageWrap.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          stageWrap.classList.remove('drag-drop-active');
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
            const files = e.dataTransfer.files;
            const loader = (this.engine.loadFiles ? this.engine.loadFiles(files, true) : this.engine.loadFromFile(files[0], true));
            loader.then((scene) => {
              if (files.length > 1) {
                this.showToast(`✨ Merged Dual Cartridge: ${scene?.title || 'Pair Loaded'}`);
              }
            }).catch((err) => {
              this.showToast('❌ ' + err.message, 4500);
            });
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
            const loader = (this.engine.loadFiles ? this.engine.loadFiles(files, true) : this.engine.loadFromFile(files[0], true));
            loader.then((scene) => {
              if (files.length > 1) {
                this.showToast(`✨ Merged Dual Cartridge: ${scene?.title || 'Pair Loaded'}`);
              }
            }).catch((err) => {
              this.showToast('❌ ' + err.message, 4500);
            });
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
            const fileInput = el.fileInputHidden || document.getElementById('file-input-hidden');
            if (fileInput) fileInput.click();
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
      const stage = el.playerStage || el.stageSvg;
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
    if (this.engine) {
      this.engine.setPreset(safePreset, Boolean(data.play));
      this.updateHeaderPlayUI(Boolean(data.play));
    }
  } else if (data.type === 'PLAY') {
    if (this.engine) {
      this.engine.play();
      this.updateHeaderPlayUI(true, true);
    }
  } else if (data.type === 'PAUSE') {
    if (this.engine) {
      this.engine.pause();
      this.updateHeaderPlayUI(false, true);
    }
  } else if (data.type === 'TOGGLE_PLAY') {
    if (this.engine) {
      const playing = this.engine.togglePlay();
      this.updateHeaderPlayUI(playing, true);
    }
  } else if (data.type === 'TRIGGER_OPEN_LOCAL') {
    const fileInput = el.fileInputHidden || document.getElementById('file-input-hidden');
    if (fileInput) fileInput.click();
  } else if (data.type === 'REFRESH_PRESETS') {
    this.populatePresets();
  } else if (data.type === 'RESET_SIM') {
    this.resetSimulation();
  } else if (data.type === 'LOAD_CUSTOM_CARTRIDGE' && data.cartridge) {
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
    this.saveToLocalVault(c);
    this.populatePresets();
    if (this.engine && c.svgMarkup && c.astSource) {
      if (typeof this.engine.loadSceneData === 'function') {
        this.engine.loadSceneData(c, true);
      } else {
        this.engine.loadScene(c.id, true);
      }
      this.updateHeaderPlayUI(Boolean(this.engine?.isPlaying));
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

      // --- Developer Inspector & Live Studio Event Bindings (delegated to player-ui-studio.js) ---
      this.bindStudioDOMEvents(stage);

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

      // --- WebRTC P2P Mesh & OBS Broadcast Drawer Event Bindings (delegated to player-ui-broadcast.js) ---
      this.bindBroadcastDOMEvents();

      // Studio & Broadcast Control Panel Popover
      if (el.btnStudioPanelToggle) {
        el.btnStudioPanelToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleStudioPanel();
        });
      }

      if (el.studioPanelClose) {
        el.studioPanelClose.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeStudioPanel();
        });
      }

      // Close popover when clicking outside the panel
      document.addEventListener('click', (e) => {
        if (!el.studioControlPanel || el.studioControlPanel.classList.contains('hidden')) return;
        const container = e.target && e.target.closest && e.target.closest('.studio-panel-container');
        if (!container) {
          this.closeStudioPanel();
        }
      });

      // Auto-close popover when any action tool button is clicked
      if (el.studioControlPanel) {
        el.studioControlPanel.querySelectorAll('.studio-tool-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.closeStudioPanel();
          });
        });
      }

      // Display & Controls Settings Drawer
      if (el.btnSettings) {
        el.btnSettings.addEventListener('click', () => {
          this.toggleSettingsDrawer();
        });
      }

      if (el.settingsDrawerClose) {
        el.settingsDrawerClose.addEventListener('click', () => {
          this.closeSettingsDrawer();
        });
      }

      if (el.btnResetConfig) {
        el.btnResetConfig.addEventListener('click', () => {
          this.setDisplayMode('classroom');
          this.showToast('Reset to Classroom Mode (Clean Whiteboard)');
        });
      }

      const modeCards = [
        { el: el.modeCardClassroom, mode: 'classroom' },
        { el: el.modeCardStudent, mode: 'student' },
        { el: el.modeCardBroadcast, mode: 'broadcast' },
        { el: el.modeCardDeveloper, mode: 'developer' },
      ];

      modeCards.forEach(({ el: cardEl, mode }) => {
        if (cardEl) {
          cardEl.addEventListener('click', () => {
            this.setDisplayMode(mode);
          });
        }
      });

      const configInputs = [
        { el: el.cfgCheckpoints, key: 'showInteractiveCheckpoints' },
        { el: el.cfg3D, key: 'show3DControls' },
        { el: el.cfgInspect, key: 'showDevInspect' },
        { el: el.cfgStudio, key: 'showDevStudio' },
        { el: el.cfgExportSpa, key: 'showExportSpa' },
        { el: el.cfgPip, key: 'showPipButton' },
        { el: el.cfgObs, key: 'showObsLink' },
        { el: el.cfgPrint, key: 'showPrintWorksheet' },
        { el: el.cfgCopySvg, key: 'showCopySvg' },
        { el: el.cfgVoice, key: 'showVoiceNarration' },
        { el: el.cfgSubtitles, key: 'showSubtitles' },
        { el: el.cfgScrubber, key: 'showTimelineScrubber' },
        { el: el.cfgSpeed, key: 'showSpeedSelector' },
        { el: el.cfgLang, key: 'showLanguageSelector' },
        { el: el.cfgLoop, key: 'showLoopToggle' },
        { el: el.cfgVolume, key: 'showVolumeControl' },
        { el: el.cfgPhysics, key: 'showPhysicsControls' },
      ];

      configInputs.forEach(({ el: inputEl, key }) => {
        if (inputEl) {
          inputEl.addEventListener('change', () => {
            this.displayConfig.mode = 'custom';
            this.displayConfig[key] = inputEl.checked;
            if (key === 'showInteractiveCheckpoints') {
              this.interactiveMode = Boolean(inputEl.checked);
              if (el.btnInteractive) el.btnInteractive.classList.toggle('active', this.interactiveMode);
            }
            this.applyDisplayConfig(this.displayConfig);
            this.saveDisplayConfig(this.displayConfig);
          });
        }
      });

      if (el.cfgPerfHud) {
        el.cfgPerfHud.checked = this.engine && Boolean(this.engine.profiler);
        el.cfgPerfHud.addEventListener('change', () => {
          const enabled = el.cfgPerfHud.checked;
          window.postMessage({
            type: 'SET_PERF_HUD',
            enabled: enabled
          }, '*');
        });
      }

      if (el.cfgStrictBudget) {
        const _cfgStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
        el.cfgStrictBudget.checked = Boolean(_cfgStore && _cfgStore.getItem('app_frame_budget_alert') === 'true');
        el.cfgStrictBudget.addEventListener('change', () => {
          const strict = el.cfgStrictBudget.checked;
          window.postMessage({
            type: 'SET_PERF_HUD',
            enabled: this.engine && Boolean(this.engine.profiler),
            strictAlarm: strict
          }, '*');
        });
      }

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

    initDisplayConfig() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlMode = urlParams.get('mode');

      const applyUrlFlags = (prof) => {
        if (!prof) return prof;
        if (urlParams.get('questions') === '0' || urlParams.get('questions') === 'false' ||
            urlParams.get('checkpoints') === '0' || urlParams.get('checkpoints') === 'false' ||
            urlParams.get('interactive') === '0' || urlParams.get('interactive') === 'false') {
          prof.showInteractiveCheckpoints = false;
        } else if (urlParams.get('questions') === '1' || urlParams.get('questions') === 'true' ||
                   urlParams.get('checkpoints') === '1' || urlParams.get('checkpoints') === 'true' ||
                   urlParams.get('interactive') === '1' || urlParams.get('interactive') === 'true') {
          prof.showInteractiveCheckpoints = true;
        }
        return prof;
      };

      // 1. Explicit minimal embed mode
      if (urlMode === 'minimal' || urlParams.get('minimal') === '1') {
        if (typeof document !== 'undefined' && document.body) {
          document.body.classList.add('ast-embedded-mode');
        }
        return applyUrlFlags(this.getPresetProfile('minimal'));
      }

      // 2. Explicit or default full modes
      if (urlMode && ['suite', 'classroom', 'student', 'broadcast', 'developer', 'embedded'].includes(urlMode)) {
        return applyUrlFlags(this.getPresetProfile(urlMode));
      }
      if (urlParams.get('clean') === '1' || urlParams.get('suite') === '1' || urlParams.get('tools') === '1' || urlParams.get('all') === '1') {
        return applyUrlFlags(this.getPresetProfile('suite'));
      }

      // Check if current active scene is an interactive simulation apparatus
      const isInteractiveSimulation = Boolean(this.engine?.isContinuousSim || this.engine?.scene?.type === 'Sim' || this.engine?.scene?.cartridgeType === 'Sim');

      try {
        const _dispStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
        const raw = _dispStore ? _dispStore.getItem('stj_player_display_config') : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const base = parsed.mode ? this.getPresetProfile(parsed.mode) : this.getPresetProfile(isInteractiveSimulation ? 'suite' : 'classroom');
            return applyUrlFlags(Object.assign({}, base, parsed));
          }
        }
      } catch (err) {
        console.warn('[AST-PlayerUI] Error reading saved display config:', err);
      }

      return applyUrlFlags(this.getPresetProfile(isInteractiveSimulation ? 'suite' : 'classroom'));
    }

    getPresetProfile(mode) {
      const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
      const base = {
        mode: mode || 'classroom',
        showPresetSelector: !isInsideIframe,
        showStageBadge: !isInsideIframe,
        showInteractiveCheckpoints: true,
        show3DControls: true,
        showOpenFile: !isInsideIframe,
        showMarker: true,
        showStepMode: true,
        showStudioPanel: true,
        showDevInspect: true,
        showDevStudio: true,
        showExportSpa: true,
        showExportZip: true,
        showStandaloneLink: true,
        showObsLink: true,
        showWebRtcLink: true,
        showLmsEmbed: true,
        showPrintWorksheet: true,
        showCopySvg: true,
        showThemeToggle: true,
        showFullscreen: !isInsideIframe,
        showTimelineScrubber: true,
        showPlaybackControls: true,
        showSpeedSelector: true,
        showVoiceNarration: true,
        showVoiceCommands: true,
        showLanguageSelector: true,
        showSubtitles: true,
        showLoopToggle: true,
        showVolumeControl: true,
        showPhysicsControls: true,
      };

      if (mode === 'suite' || mode === 'interactive-suite') {
        base.mode = 'suite';
        base.showPresetSelector = false;
        base.showStageBadge = false;
        base.showOpenFile = false;
        base.showFullscreen = false;
        base.showTimelineScrubber = false;
        base.showPlaybackControls = false;
        base.showSpeedSelector = false;
        base.showSubtitles = false;
        base.showLoopToggle = false;
        base.showVolumeControl = true;
        base.showVoiceCommands = false;
        base.showPhysicsControls = false;
        base.showDevInspect = true;
        base.showDevStudio = true;
        base.showExportSpa = true;
        base.showObsLink = true;
        base.showWebRtcLink = true;
        base.showCopySvg = true;
        base.showPrintWorksheet = true;
      } else if (mode === 'minimal') {
        base.mode = 'minimal';
        base.showPresetSelector = false;
        base.showStageBadge = false;
        base.showPrintWorksheet = false;
        base.showStandaloneLink = false;
        base.showDevInspect = false;
        base.showDevStudio = false;
        base.showExportSpa = false;
        base.showObsLink = false;
        base.showWebRtcLink = false;
        base.showLmsEmbed = false;
        base.showCopySvg = false;
        base.showSpeedSelector = false;
        base.showVoiceCommands = false;
        base.showPhysicsControls = false;
      } else if (mode === 'embedded') {
        base.mode = 'embedded';
        base.showPresetSelector = false;
        base.showStageBadge = false;
        base.showDevInspect = true;
        base.showDevStudio = true;
        base.showExportSpa = true;
        base.showObsLink = true;
        base.showWebRtcLink = true;
        base.showCopySvg = true;
        base.showPrintWorksheet = true;
        base.showVolumeControl = true;
      } else if (mode === 'student') {
        base.showPrintWorksheet = false;
        base.showStandaloneLink = false;
      } else if (mode === 'broadcast') {
        base.showObsLink = true;
        base.showPrintWorksheet = false;
      } else if (mode === 'developer') {
        base.showDevInspect = true;
        base.showDevStudio = true;
        base.showExportSpa = true;
        base.showObsLink = true;
        base.showWebRtcLink = true;
        base.showLmsEmbed = true;
        base.showCopySvg = true;
      }

      return base;
    }

    setDisplayMode(mode) {
      this.displayConfig = this.getPresetProfile(mode);
      this.saveDisplayConfig(this.displayConfig);
      this.applyDisplayConfig(this.displayConfig);
      this.showToast(`Switched to ${mode.toUpperCase()} Mode`);
    }

    saveDisplayConfig(config) {
      try {
        const _dispStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
        if (_dispStore) {
          _dispStore.setItem('stj_player_display_config', JSON.stringify(config));
        }
      } catch (e) {}
    }

    applyDisplayConfig(config) {
      if (!config || typeof config !== 'object') return;
      this.displayConfig = Object.assign({}, this.displayConfig, config);
      const c = this.displayConfig;
      const el = this.elements;

      // Top action buttons
      const showLeft = (c.showPresetSelector !== false) || (c.showStageBadge !== false) || (c.showOpenFile !== false);
      const headerLeft = document.querySelector('.header-left');
      if (headerLeft) {
        headerLeft.style.display = showLeft ? 'flex' : 'none';
      }
      if (el.presetSelector) el.presetSelector.style.display = c.showPresetSelector !== false ? '' : 'none';
      if (el.badgeStage) el.badgeStage.style.display = c.showStageBadge !== false ? '' : 'none';
      if (el.btnStudioPanelToggle) el.btnStudioPanelToggle.style.display = c.showStudioPanel !== false ? '' : 'none';
      if (el.btnInteractive) {
        el.btnInteractive.style.display = c.showInteractiveCheckpoints !== false ? '' : 'none';
        if (c.showInteractiveCheckpoints !== undefined) {
          this.interactiveMode = Boolean(c.showInteractiveCheckpoints);
          el.btnInteractive.classList.toggle('active', this.interactiveMode);
        }
      }
      
      if (el.btn3DOrbit) {
        if (c.show3DControls === false) {
          el.btn3DOrbit.classList.add('hidden');
        } else if (this.engine && this.engine.has3D()) {
          el.btn3DOrbit.classList.remove('hidden');
        }
      }

      if (el.cameraControlsBar) {
        if (c.show3DControls === false) {
          el.cameraControlsBar.classList.add('hidden');
          el.cameraControlsBar.style.display = 'none';
        } else if (this.engine && this.engine.has3D()) {
          el.cameraControlsBar.classList.remove('hidden');
          el.cameraControlsBar.style.display = 'flex';
        }
      }

      if (el.btnOpenFile) el.btnOpenFile.style.display = c.showOpenFile !== false ? '' : 'none';
      if (el.btnPen) el.btnPen.style.display = c.showMarker !== false ? '' : 'none';
      if (el.btnStepMode) el.btnStepMode.style.display = c.showStepMode !== false ? '' : 'none';
      if (el.btnDevMode) el.btnDevMode.style.display = c.showDevInspect !== false ? '' : 'none';
      if (el.btnDevStudio) el.btnDevStudio.style.display = c.showDevStudio !== false ? '' : 'none';
      if (el.btnHeaderExportSpa) el.btnHeaderExportSpa.style.display = c.showExportSpa !== false ? '' : 'none';
      if (el.btnDownloadZip) el.btnDownloadZip.style.display = c.showExportZip !== false ? '' : 'none';
      if (el.btnObsLink) el.btnObsLink.style.display = c.showObsLink !== false ? '' : 'none';
      if (el.btnWebRtcLink) el.btnWebRtcLink.style.display = c.showWebRtcLink !== false ? '' : 'none';
      if (el.btnPrint) el.btnPrint.style.display = c.showPrintWorksheet !== false ? '' : 'none';
      if (el.btnCopySvg) el.btnCopySvg.style.display = c.showCopySvg !== false ? '' : 'none';
      if (el.btnTheme) el.btnTheme.style.display = c.showThemeToggle !== false ? '' : 'none';
      if (el.btnPip) el.btnPip.style.display = c.showPipButton !== false ? '' : 'none';
      if (el.btnFullscreen) el.btnFullscreen.style.display = c.showFullscreen !== false ? '' : 'none';

      // Bottom playback bar & overlays
      const isSuite = c.mode === 'suite' || (!c.showTimelineScrubber && !c.showPlaybackControls);
      if (isSuite) {
        document.body.classList.add('interactive-suite-mode');
        if (el.playerFooter) el.playerFooter.style.display = 'none';
        if (el.btnSuiteMode) el.btnSuiteMode.classList.add('active');
      } else {
        document.body.classList.remove('interactive-suite-mode');
        if (el.playerFooter) el.playerFooter.style.display = '';
        if (el.btnSuiteMode) el.btnSuiteMode.classList.remove('active');
      }

      if (el.scrubberBox) el.scrubberBox.style.display = c.showTimelineScrubber !== false ? '' : 'none';
      if (el.btnPlay) el.btnPlay.style.display = c.showPlaybackControls !== false ? '' : 'none';
      if (el.btnPrev) el.btnPrev.style.display = c.showPlaybackControls !== false ? '' : 'none';
      if (el.btnNext) el.btnNext.style.display = c.showPlaybackControls !== false ? '' : 'none';
      if (el.btnReset) el.btnReset.style.display = c.showPlaybackControls !== false ? '' : 'none';
      if (el.timeReadout) el.timeReadout.style.display = c.showPlaybackControls !== false ? '' : 'none';
      if (el.speedSelector) el.speedSelector.style.display = c.showSpeedSelector !== false ? '' : 'none';
      if (el.btnNarrate) el.btnNarrate.style.display = c.showVoiceNarration !== false ? '' : 'none';
      if (el.btnVoiceCmd) el.btnVoiceCmd.style.display = c.showVoiceCommands !== false ? '' : 'none';
      if (el.langSelector) el.langSelector.style.display = c.showLanguageSelector !== false ? '' : 'none';
      if (el.subtitleOverlay) el.subtitleOverlay.style.display = c.showSubtitles !== false ? '' : 'none';
      if (el.btnLoop) el.btnLoop.style.display = c.showLoopToggle !== false ? '' : 'none';
      if (el.volumeBox) el.volumeBox.style.display = c.showVolumeControl !== false ? 'flex' : 'none';
      if (el.physicsConfigSection) el.physicsConfigSection.style.display = c.showPhysicsControls !== false ? 'block' : 'none';

      this.syncSettingsDrawerUI();

      // Notify parent wrapper of active configuration
      if (this.engine && typeof this.engine.notifyParent === 'function') {
        this.engine.notifyParent({
          type: 'DISPLAY_CONFIG_CHANGED',
          config: this.displayConfig
        });
      }
    }

    toggleShortcutsModal() {
      if (!this.elements.shortcutsModal) return;
      this.elements.shortcutsModal.classList.toggle('hidden');
    }

    closeShortcutsModal() {
      if (!this.elements.shortcutsModal) return;
      this.elements.shortcutsModal.classList.add('hidden');
    }

    syncSettingsDrawerUI() {
      const c = this.displayConfig;
      const el = this.elements;
      if (!c) return;

      const mode = c.mode || 'classroom';
      if (el.settingsBadge) {
        el.settingsBadge.textContent = mode.toUpperCase();
      }

      if (el.settingsLabel) {
        const modeIcons = { classroom: '🎓 Classroom', student: '🎒 Student', broadcast: '📡 Broadcast', developer: '🛠️ Dev', custom: '🎛️ Custom' };
        el.settingsLabel.textContent = modeIcons[mode] || 'Settings';
      }

      const cards = [
        { el: el.modeCardClassroom, mode: 'classroom' },
        { el: el.modeCardStudent, mode: 'student' },
        { el: el.modeCardBroadcast, mode: 'broadcast' },
        { el: el.modeCardDeveloper, mode: 'developer' },
      ];

      cards.forEach(({ el: cardEl, mode: m }) => {
        if (cardEl) cardEl.classList.toggle('active', mode === m);
      });

      const inputs = [
        { el: el.cfgCheckpoints, val: c.showInteractiveCheckpoints },
        { el: el.cfg3D, val: c.show3DControls },
        { el: el.cfgInspect, val: c.showDevInspect },
        { el: el.cfgStudio, val: c.showDevStudio },
        { el: el.cfgExportSpa, val: c.showExportSpa },
        { el: el.cfgPip, val: c.showPipButton !== false },
        { el: el.cfgObs, val: c.showObsLink },
        { el: el.cfgPrint, val: c.showPrintWorksheet },
        { el: el.cfgCopySvg, val: c.showCopySvg },
        { el: el.cfgVoice, val: c.showVoiceNarration },
        { el: el.cfgSubtitles, val: c.showSubtitles },
        { el: el.cfgScrubber, val: c.showTimelineScrubber },
        { el: el.cfgSpeed, val: c.showSpeedSelector },
        { el: el.cfgLang, val: c.showLanguageSelector },
      ];

      inputs.forEach(({ el: inp, val }) => {
        if (inp) inp.checked = Boolean(val);
      });
    }

    toggleStudioPanel(force) {
      if (!this.elements.studioControlPanel) return;
      const willOpen = force !== undefined ? Boolean(force) : this.elements.studioControlPanel.classList.contains('hidden');
      if (willOpen) {
        this.openStudioPanel();
      } else {
        this.closeStudioPanel();
      }
    }

    openStudioPanel() {
      const panel = this.elements.studioControlPanel;
      const btn = this.elements.btnStudioPanelToggle;
      if (!panel) return;
      panel.classList.remove('hidden');
      if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    }

    closeStudioPanel() {
      const panel = this.elements.studioControlPanel;
      const btn = this.elements.btnStudioPanelToggle;
      if (!panel) return;
      panel.classList.add('hidden');
      if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    }

    toggleSettingsDrawer(force) {
      if (!this.elements.settingsDrawer) return;
      const willOpen = force !== undefined ? Boolean(force) : this.elements.settingsDrawer.classList.contains('hidden');
      if (willOpen) {
        this.closeDevStudio();
        this.closeInspectorDrawer();
        this.closeObsDrawer();
        this.elements.settingsDrawer.classList.remove('hidden');
        this.syncSettingsDrawerUI();
      } else {
        this.elements.settingsDrawer.classList.add('hidden');
      }
    }

    closeSettingsDrawer() {
      this.toggleSettingsDrawer(false);
    }

    async togglePictureInPicture() {
      // 1. Notify parent iframe container (host portal wrapper) if embedded
      if (window.parent && window.parent !== window) {
        if (this.engine && typeof this.engine.notifyParent === 'function') {
          this.engine.notifyParent({
            type: 'TOGGLE_PIP',
            preset: this.engine.activePresetId,
            progress: this.engine.progress,
            isPlaying: this.engine.isPlaying
          });
        }
      }

      // 2. Direct Document Picture-in-Picture API support (Chrome 116+, Edge, Opera)
      if ('documentPictureInPicture' in window && typeof window.documentPictureInPicture.requestWindow === 'function') {
        if (this.pipWindow) {
          try {
            this.pipWindow.close();
          } catch (_) {}
          this.pipWindow = null;
          this.showToast('📺 Picture-in-Picture Closed');
          return;
        }

        try {
          const pip = await window.documentPictureInPicture.requestWindow({
            width: 680,
            height: 480
          });
          this.pipWindow = pip;

          // Copy stylesheets into PiP window
          [...document.styleSheets].forEach((sheet) => {
            try {
              if (sheet.href) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = sheet.href;
                pip.document.head.appendChild(link);
              } else if (sheet.cssRules) {
                const style = document.createElement('style');
                [...sheet.cssRules].forEach((rule) => {
                  style.appendChild(document.createTextNode(rule.cssText));
                });
                pip.document.head.appendChild(style);
              }
            } catch (_) {
              if (sheet.href) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = sheet.href;
                pip.document.head.appendChild(link);
              }
            }
          });

          pip.document.title = `📺 ${document.title || 'AST Vector Player'} (PiP)`;
          pip.document.body.style.margin = '0';
          pip.document.body.style.padding = '0';
          pip.document.body.style.background = '#090d16';
          pip.document.body.style.overflow = 'hidden';

          const appContainer = document.getElementById('ast-player-container') || document.body.firstElementChild;
          if (appContainer && appContainer.parentNode) {
            const originalParent = appContainer.parentNode;
            const placeholder = document.createElement('div');
            placeholder.style.display = 'flex';
            placeholder.style.flexDirection = 'column';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.height = '100vh';
            placeholder.style.background = '#090d16';
            placeholder.style.color = '#fff';
            placeholder.style.textAlign = 'center';
            placeholder.style.padding = '20px';
            placeholder.replaceChildren(
              this._h('div', { css: 'font-size:3rem; margin-bottom:12px;', text: '📺' }),
              this._h('h3', { css: 'margin:0 0 8px 0; font-size:1.2rem;', text: 'Floating in Picture-in-Picture' }),
              this._h('p', { css: 'margin:0 0 16px 0; font-size:0.85rem; color:#94a3b8;', text: 'Stage is active in an always-on-top desktop window' }),
              this._h('button', {
                type: 'button',
                id: 'pip-return-btn',
                css: 'padding:8px 18px; border-radius:9999px; background:#6366f1; color:#fff; border:none; font-weight:700; cursor:pointer;',
                text: '↩ Return to Page'
              })
            );

            originalParent.insertBefore(placeholder, appContainer);
            pip.document.body.appendChild(appContainer);

            placeholder.querySelector('#pip-return-btn')?.addEventListener('click', () => {
              pip.close();
            });

            pip.addEventListener('pagehide', () => {
              originalParent.insertBefore(appContainer, placeholder);
              placeholder.remove();
              this.pipWindow = null;
              this.showToast('📺 Restored from Picture-in-Picture');
            });
          }

          this.showToast('📺 Always-on-Top PiP Window Opened');
          return;
        } catch (err) {
          console.warn('Document Picture-in-Picture request:', err);
        }
      }

      this.showToast('📺 Picture-in-Picture Toggled');
    }

    bindEngineEvents() {
      // Synchronize initial play button state immediately with the engine's real current state
      this.updateHeaderPlayUI(Boolean(this.engine?.isPlaying));

      this.engine.on('timeupdate', () => {
        this.updateView();
        this.checkInteractiveCheckpoints();
        this.updateGoalCheckpointProgress();

        // If stepping towards a target stop in Step Mode, stop when reached
        if (this.targetStop !== null && this.engine.progress >= this.targetStop - 0.008) {
          const reached = this.targetStop;
          this.targetStop = null;
          this.engine.seek(reached);
          this.engine.pause();
          this.updateHeaderPlayUI(false);
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

    updateIntegrityBadge(info) {
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

    // --- Step-by-Step Didactic Mode & Quest Mode Methods (delegated to player-ui-checkpoints.js) ---

    toggleStepMode(force) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.toggleStepMode === 'function') _c.toggleStepMode.call(this, force);
    }

    getLessonStops() {
      const _c = _getPlayerUICheckpoints();
      return _c && typeof _c.getLessonStops === 'function' ? _c.getLessonStops.call(this) : [0, 1];
    }

    stepToNextKeyframe() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.stepToNextKeyframe === 'function') _c.stepToNextKeyframe.call(this);
    }

    stepToPrevKeyframe() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.stepToPrevKeyframe === 'function') _c.stepToPrevKeyframe.call(this);
    }

    onStopReached(t) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.onStopReached === 'function') _c.onStopReached.call(this, t);
    }

    startQuestMode() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.startQuestMode === 'function') _c.startQuestMode.call(this);
    }

    renderCurrentMission() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.renderCurrentMission === 'function') _c.renderCurrentMission.call(this);
    }

    checkMissionAnswer(mission, activeQ, selectedIdx, optionBtns) {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.checkMissionAnswer === 'function') _c.checkMissionAnswer.call(this, mission, activeQ, selectedIdx, optionBtns);
    }

    closeQuestMode() {
      const _c = _getPlayerUICheckpoints();
      if (_c && typeof _c.closeQuestMode === 'function') _c.closeQuestMode.call(this);
    }

    // --- Developer Inspector & Live Studio Methods (delegated to player-ui-studio.js) ---

    bindStudioDOMEvents(stage) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.bindStudioDOMEvents === 'function') _s.bindStudioDOMEvents.call(this, stage);
    }

    setDevMode(enabled) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.setDevMode === 'function') _s.setDevMode.call(this, enabled);
    }

    toggleDevMode() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.toggleDevMode === 'function') _s.toggleDevMode.call(this);
    }

    updateDevHover(targetNode, e) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.updateDevHover === 'function') _s.updateDevHover.call(this, targetNode, e);
    }

    selectElement(node) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.selectElement === 'function') _s.selectElement.call(this, node);
    }

    refreshSelectBox() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.refreshSelectBox === 'function') _s.refreshSelectBox.call(this);
    }

    closeInspectorDrawer() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.closeInspectorDrawer === 'function') _s.closeInspectorDrawer.call(this);
    }

    getSelectorForElement(node) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.getSelectorForElement === 'function' ? _s.getSelectorForElement.call(this, node) : '';
    }

    openDevStudio(tab = 'ast') {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.openDevStudio === 'function') _s.openDevStudio.call(this, tab);
    }

    closeDevStudio() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.closeDevStudio === 'function') _s.closeDevStudio.call(this);
    }

    toggleDevStudio() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.toggleDevStudio === 'function') _s.toggleDevStudio.call(this);
    }

    slugifyCartridgeId(raw) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.slugifyCartridgeId === 'function' ? _s.slugifyCartridgeId.call(this, raw) : 'custom-remix';
    }

    extractSvgElementsInfo(svgText) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.extractSvgElementsInfo === 'function' ? _s.extractSvgElementsInfo.call(this, svgText) : [];
    }

    extractAstTargetsInfo(astText) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.extractAstTargetsInfo === 'function' ? _s.extractAstTargetsInfo.call(this, astText) : [];
    }

    findClosestSvgId(targetId, svgItems) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.findClosestSvgId === 'function' ? _s.findClosestSvgId.call(this, targetId, svgItems) : null;
    }

    refreshAstSvgMatcher() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.refreshAstSvgMatcher === 'function') _s.refreshAstSvgMatcher.call(this);
    }

    escapeMatcherHtml(raw) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.escapeMatcherHtml === 'function' ? _s.escapeMatcherHtml.call(this, raw) : String(raw || '');
    }

    highlightSvgIdOnStage(svgId) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.highlightSvgIdOnStage === 'function') _s.highlightSvgIdOnStage.call(this, svgId);
    }

    insertBindingForSvgId(svgId) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.insertBindingForSvgId === 'function') _s.insertBindingForSvgId.call(this, svgId);
    }

    rewriteAstTargetId(oldId, newId) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.rewriteAstTargetId === 'function') _s.rewriteAstTargetId.call(this, oldId, newId);
    }

    injectMissingSvgShape(missingId) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.injectMissingSvgShape === 'function') _s.injectMissingSvgShape.call(this, missingId);
    }

    autoFixAllAstSvgMatches() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.autoFixAllAstSvgMatches === 'function') _s.autoFixAllAstSvgMatches.call(this);
    }

    requestNanoRemix(promptOverride) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.requestNanoRemix === 'function') _s.requestNanoRemix.call(this, promptOverride);
    }

    runStandaloneNanoRemix(ctx) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.runStandaloneNanoRemix === 'function' ? _s.runStandaloneNanoRemix.call(this, ctx) : Promise.resolve(null);
    }

    runStandaloneDeterministicRemix(ctx) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.runStandaloneDeterministicRemix === 'function' ? _s.runStandaloneDeterministicRemix.call(this, ctx) : null;
    }

    handleNanoRemixResult(proposal) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.handleNanoRemixResult === 'function') _s.handleNanoRemixResult.call(this, proposal);
    }

    applyPendingNanoProposal() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.applyPendingNanoProposal === 'function') _s.applyPendingNanoProposal.call(this);
    }

    undoLastNanoEdit() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.undoLastNanoEdit === 'function') _s.undoLastNanoEdit.call(this);
    }

    syncSceneIdentityInAst(astText, newId, newTitle) {
      const _s = _getPlayerUIStudio();
      return _s && typeof _s.syncSceneIdentityInAst === 'function' ? _s.syncSceneIdentityInAst.call(this, astText, newId, newTitle) : String(astText || '');
    }

    openSaveAsBar() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.openSaveAsBar === 'function') _s.openSaveAsBar.call(this);
    }

    updateRemixPreviewLabel() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.updateRemixPreviewLabel === 'function') _s.updateRemixPreviewLabel.call(this);
    }

    downloadTextFile(filename, content, mimeType) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.downloadTextFile === 'function') _s.downloadTextFile.call(this, filename, content, mimeType);
    }

    executeSaveRemixAs(exportMode = 'vault') {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.executeSaveRemixAs === 'function') _s.executeSaveRemixAs.call(this, exportMode);
    }

    switchStudioTab(tabName) {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.switchStudioTab === 'function') _s.switchStudioTab.call(this, tabName);
    }

    renderQuizBuilderExistingList() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.renderQuizBuilderExistingList === 'function') _s.renderQuizBuilderExistingList.call(this);
    }

    downloadStandaloneSvgApplet() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.downloadStandaloneSvgApplet === 'function') _s.downloadStandaloneSvgApplet.call(this);
    }

    async downloadOfflineSuiteZip() {
      try {
        if (typeof this.showToast === 'function') {
          this.showToast('📦 Preparing Offline Simulator Suite...');
        }

        // Candidate URLs for reliable resolution across root, /player/ subdirectory, and subpaths
        const candidateUrls = [];
        try {
          candidateUrls.push(new URL('lumina-vector-player.zip', window.location.href).href);
          candidateUrls.push(new URL('../lumina-vector-player.zip', window.location.href).href);
        } catch (_) {}

        let basePath = (this.engine && this.engine.options && this.engine.options.basePath) || '';
        const urlParamBase = typeof window !== 'undefined' && window.location ? new URLSearchParams(window.location.search).get('base') : null;
        if (urlParamBase && /^(\/|\.\/)[a-zA-Z0-9_\-\/]*$/.test(urlParamBase)) {
          basePath = urlParamBase;
        } else if (!basePath && typeof window !== 'undefined' && window.location) {
          if (window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__) {
            basePath = String(window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__);
          } else {
            const p = window.location.pathname || '/';
            const h = window.location.hostname || '';
            const playerIdx = p.indexOf('/player/');
            if (playerIdx >= 0) {
              basePath = p.slice(0, playerIdx + 1);
            } else if (h === 'github.io' || h.endsWith('.github.io')) {
              const seg = p.split('/').filter(Boolean)[0];
              basePath = seg ? `/${seg}/` : '/';
            } else {
              basePath = '/';
            }
          }
        }
        const cleanBase = (basePath || '/').endsWith('/') ? (basePath || '/') : `${basePath}/`;
        const baseZipUrl = `${cleanBase}lumina-vector-player.zip`;
        const basePlayerZipUrl = `${cleanBase}player/lumina-vector-player.zip`;

        if (!candidateUrls.includes(baseZipUrl)) candidateUrls.push(baseZipUrl);
        if (!candidateUrls.includes(basePlayerZipUrl)) candidateUrls.push(basePlayerZipUrl);

        const primaryUrl = candidateUrls[0] || baseZipUrl;

        // 1. Notify host / parent application so top-level window can trigger browser download
        if (this.engine && typeof this.engine.notifyParent === 'function') {
          this.engine.notifyParent({
            type: 'DOWNLOAD_ZIP',
            filename: 'lumina-vector-player.zip',
            url: primaryUrl,
            candidateUrls: candidateUrls,
          });
        } else if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
          try {
            window.parent.postMessage({
              source: 'ast-vector-player',
              type: 'DOWNLOAD_ZIP',
              filename: 'lumina-vector-player.zip',
              url: primaryUrl,
              candidateUrls: candidateUrls,
            }, '*');
          } catch (_) {}
        }

        // 2. Also execute local Blob download in current frame (unrestricted in standalone windows & modern tabs)
        let downloadedLocally = false;
        for (const candidate of candidateUrls) {
          try {
            const resp = await fetch(candidate, { cache: 'no-cache' });
            if (resp.ok) {
              const blob = await resp.blob();
              if (blob && blob.size > 0) {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'lumina-vector-player.zip';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  URL.revokeObjectURL(blobUrl);
                  a.remove();
                }, 2000);
                downloadedLocally = true;
                if (typeof this.playChime === 'function') this.playChime(659, 'triangle');
                if (typeof this.showToast === 'function') this.showToast('📦 Offline Simulator Suite Downloaded!');
                break;
              }
            }
          } catch (_) {
            // Proceed to next candidate URL
          }
        }

        // 3. Fallback direct anchor navigation if fetch failed and not embedded
        if (!downloadedLocally && (!window.parent || window.parent === window)) {
          const fallbackLink = document.createElement('a');
          let safeDownloadUrl = '/lumina-vector-player.zip';
          try {
            const parsed = new URL(primaryUrl, window.location.href);
            if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === window.location.origin) {
              safeDownloadUrl = parsed.pathname;
            }
          } catch (_) {}
          fallbackLink.href = safeDownloadUrl;
          fallbackLink.setAttribute('download', 'lumina-vector-player.zip');
          fallbackLink.rel = 'noopener noreferrer';
          document.body.appendChild(fallbackLink);
          fallbackLink.click();
          fallbackLink.remove();
        }
      } catch (err) {
        console.error('Failed to download offline zip bundle:', err);
        if (typeof this.showToast === 'function') {
          this.showToast('⚠️ Could not download ZIP bundle');
        }
      }
    }

    renderStarterTemplates() {
      const _s = _getPlayerUIStudio();
      if (_s && typeof _s.renderStarterTemplates === 'function') _s.renderStarterTemplates.call(this);
    }

    // --- OBS Studio WebSocket & WebRTC Classroom Beacon Drawers (delegated to player-ui-broadcast.js) ---

    bindBroadcastDOMEvents() {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.bindBroadcastDOMEvents === 'function') _b.bindBroadcastDOMEvents.call(this);
    }

    initObsBroadcast() {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.initObsBroadcast === 'function') _b.initObsBroadcast.call(this);
    }

    updateObsStatusUI(isConnected, isRecording, version) {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.updateObsStatusUI === 'function') _b.updateObsStatusUI.call(this, isConnected, isRecording, version);
    }

    toggleWebRtcDrawer() {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.toggleWebRtcDrawer === 'function') _b.toggleWebRtcDrawer.call(this);
    }

    closeWebRtcDrawer() {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.closeWebRtcDrawer === 'function') _b.closeWebRtcDrawer.call(this);
    }

    updateWebRtcStatusUI(isConnected, role = 'peer') {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.updateWebRtcStatusUI === 'function') _b.updateWebRtcStatusUI.call(this, isConnected, role);
    }

    toggleObsDrawer() {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.toggleObsDrawer === 'function') _b.toggleObsDrawer.call(this);
    }

    closeObsDrawer() {
      const _b = _getPlayerUIBroadcast();
      if (_b && typeof _b.closeObsDrawer === 'function') _b.closeObsDrawer.call(this);
    }

    // --- Browser SpeechRecognition Voice Control Integration (delegated to player-ui-voice.js) ---

    initVoiceRecognition() {
      const _v = _getPlayerUIVoice();
      return _v && typeof _v.initVoiceRecognition === 'function' ? _v.initVoiceRecognition.call(this) : null;
    }

    startVoiceCommands() {
      const _v = _getPlayerUIVoice();
      return _v && typeof _v.startVoiceCommands === 'function' ? _v.startVoiceCommands.call(this) : false;
    }

    stopVoiceCommands() {
      const _v = _getPlayerUIVoice();
      if (_v && typeof _v.stopVoiceCommands === 'function') _v.stopVoiceCommands.call(this);
    }

    toggleVoiceCommands() {
      const _v = _getPlayerUIVoice();
      if (_v && typeof _v.toggleVoiceCommands === 'function') _v.toggleVoiceCommands.call(this);
    }

    updateVoiceStatusUI(active, text) {
      const _v = _getPlayerUIVoice();
      if (_v && typeof _v.updateVoiceStatusUI === 'function') _v.updateVoiceStatusUI.call(this, active, text);
    }

    updateVoiceOverlayText(text) {
      const _v = _getPlayerUIVoice();
      if (_v && typeof _v.updateVoiceOverlayText === 'function') _v.updateVoiceOverlayText.call(this, text);
    }

    findSceneByVoiceQuery(rawQuery) {
      const _v = _getPlayerUIVoice();
      return _v && typeof _v.findSceneByVoiceQuery === 'function' ? _v.findSceneByVoiceQuery.call(this, rawQuery) : null;
    }

    handleVoiceCommand(rawTranscript) {
      const _v = _getPlayerUIVoice();
      if (_v && typeof _v.handleVoiceCommand === 'function') _v.handleVoiceCommand.call(this, rawTranscript);
    }
  }

  global.ASTPlayerUI = ASTPlayerUI;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTPlayerUI };
  }
})(typeof window !== 'undefined' ? window : globalThis);
