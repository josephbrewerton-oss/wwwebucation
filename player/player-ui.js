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

  function _getPlayerUIDisplay() {
    return global.ASTPlayerUIDisplay || (typeof window !== 'undefined' ? window.ASTPlayerUIDisplay : undefined);
  }

  function _getPlayerUIControls() {
    return global.ASTPlayerUIControls || (typeof window !== 'undefined' ? window.ASTPlayerUIControls : undefined);
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

    // --- 3D Camera Stops, Catalog/Vault, Keyframes & Projected Controls (delegated to player-ui-controls.js) ---

    getSceneCameraStops() {
      const _ctrl = _getPlayerUIControls();
      return _ctrl && typeof _ctrl.getSceneCameraStops === 'function' ? _ctrl.getSceneCameraStops.call(this) : [];
    }

    applyCameraStop(stop) {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.applyCameraStop === 'function') _ctrl.applyCameraStop.call(this, stop);
    }

    update3DStatus() {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.update3DStatus === 'function') _ctrl.update3DStatus.call(this);
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
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.populatePresets === 'function') return _ctrl.populatePresets.call(this);
    }

    saveToLocalVault(sceneData) {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.saveToLocalVault === 'function') _ctrl.saveToLocalVault.call(this, sceneData);
    }

    setupKeyframeMarkers() {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.setupKeyframeMarkers === 'function') _ctrl.setupKeyframeMarkers.call(this);
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
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.setTheme === 'function') _d.setTheme.call(this, theme);
    }

    projectControls(scene) {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.projectControls === 'function') _ctrl.projectControls.call(this, scene);
    }

    syncProjectedControls(varName, value) {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.syncProjectedControls === 'function') _ctrl.syncProjectedControls.call(this, varName, value);
    }

    resetSimulation() {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.resetSimulation === 'function') _ctrl.resetSimulation.call(this);
    }

    bindControlsDOMEvents(stage) {
      const _ctrl = _getPlayerUIControls();
      if (_ctrl && typeof _ctrl.bindControlsDOMEvents === 'function') _ctrl.bindControlsDOMEvents.call(this, stage);
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
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.toggleTheme === 'function') _d.toggleTheme.call(this);
    }

    toggleBsl(forceState, notify = true) {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.toggleBsl === 'function') _d.toggleBsl.call(this, forceState, notify);
    }

    updateBslButton() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.updateBslButton === 'function') _d.updateBslButton.call(this);
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

    // --- Display Presets, Settings Drawer, Shortcuts Modal, Studio Panel & PiP (delegated to player-ui-display.js) ---

    bindDisplayDOMEvents() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.bindDisplayDOMEvents === 'function') _d.bindDisplayDOMEvents.call(this);
    }

    initDisplayConfig() {
      const _d = _getPlayerUIDisplay();
      return _d && typeof _d.initDisplayConfig === 'function' ? _d.initDisplayConfig.call(this) : { mode: 'classroom', showInteractiveCheckpoints: true };
    }

    getPresetProfile(mode) {
      const _d = _getPlayerUIDisplay();
      return _d && typeof _d.getPresetProfile === 'function' ? _d.getPresetProfile.call(this, mode) : { mode: mode || 'classroom' };
    }

    setDisplayMode(mode) {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.setDisplayMode === 'function') _d.setDisplayMode.call(this, mode);
    }

    saveDisplayConfig(config) {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.saveDisplayConfig === 'function') _d.saveDisplayConfig.call(this, config);
    }

    applyDisplayConfig(config) {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.applyDisplayConfig === 'function') _d.applyDisplayConfig.call(this, config);
    }

    toggleShortcutsModal() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.toggleShortcutsModal === 'function') _d.toggleShortcutsModal.call(this);
    }

    closeShortcutsModal() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.closeShortcutsModal === 'function') _d.closeShortcutsModal.call(this);
    }

    syncSettingsDrawerUI() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.syncSettingsDrawerUI === 'function') _d.syncSettingsDrawerUI.call(this);
    }

    toggleStudioPanel(force) {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.toggleStudioPanel === 'function') _d.toggleStudioPanel.call(this, force);
    }

    openStudioPanel() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.openStudioPanel === 'function') _d.openStudioPanel.call(this);
    }

    closeStudioPanel() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.closeStudioPanel === 'function') _d.closeStudioPanel.call(this);
    }

    toggleSettingsDrawer(force) {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.toggleSettingsDrawer === 'function') _d.toggleSettingsDrawer.call(this, force);
    }

    closeSettingsDrawer() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.closeSettingsDrawer === 'function') _d.closeSettingsDrawer.call(this);
    }

    async togglePictureInPicture() {
      const _d = _getPlayerUIDisplay();
      if (_d && typeof _d.togglePictureInPicture === 'function') return _d.togglePictureInPicture.call(this);
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
