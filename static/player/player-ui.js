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
        const _store = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
        if (_store) {
          this.bslEnabled = _store.getItem('stj_bsl_enabled') === 'true';
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

      this.starterTemplates = [
        {
          id: 'simple-orbit',
          title: '🪐 Simple Planetary Orbit',
          desc: 'Center star with orbiting planet governed by trigonometry.',
          svg: `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="400" cy="240" r="140" fill="none" stroke="#334155" stroke-dasharray="4 4" />\n  <circle id="star-sun" cx="400" cy="240" r="32" fill="#f59e0b" filter="url(#glow)" />\n  <circle id="planet-earth" cx="540" cy="240" r="14" fill="#38bdf8" />\n  <text id="orbit-txt" x="400" y="440" fill="#94a3b8" font-size="16" text-anchor="middle">Planetary Orbit Period: 1.0 Cycle</text>\n</svg>`,
          ast: `(:scene :id "simple-orbit" :title "Simple Planetary Orbit" :stage "KS3 SCIENCE" :duration 6.0\n  (:keyframes (\n    (:t 0.00 :title "Perihelion" :rule "Planet starts at 0 rad")\n    (:t 0.50 :title "Aphelion" :rule "Planet reaches opposite orbital pole")\n  ))\n  (:bindings (\n    (:target "#planet-earth" :attr "cx" :expr "400 + Math.cos(t * Math.PI * 2) * 140")\n    (:target "#planet-earth" :attr "cy" :expr "240 + Math.sin(t * Math.PI * 2) * 140")\n    (:target "#orbit-txt" :attr "textContent" :expr "'Orbit Angle: ' + Math.round(t * 360) + '°'")\n  ))\n)`
        },
        {
          id: 'sine-wave',
          title: '🌊 Harmonic Sine Wave',
          desc: 'Continuous wave oscillation with frequency and amplitude.',
          svg: `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">\n  <line x1="100" y1="240" x2="700" y2="240" stroke="#334155" stroke-width="2" />\n  <path id="harmonic-wave" d="M 100 240 Q 250 140 400 240 T 700 240" fill="none" stroke="#38bdf8" stroke-width="4" />\n  <circle id="wave-tracer" cx="400" cy="240" r="10" fill="#f43f5e" filter="url(#glow)" />\n  <text id="wave-label" x="400" y="80" fill="#38bdf8" font-size="20" font-weight="bold" text-anchor="middle">y = A · sin(ωt + φ)</text>\n</svg>`,
          ast: `(:scene :id "sine-wave" :title "Harmonic Sine Wave" :stage "KS4 PHYSICS" :duration 4.0\n  (:keyframes (\n    (:t 0.00 :title "Initial Phase" :rule "Zero displacement at origin")\n    (:t 0.25 :title "Crest Amplitude" :rule "Maximum positive displacement +A")\n    (:t 0.75 :title "Trough Amplitude" :rule "Maximum negative displacement -A")\n  ))\n  (:bindings (\n    (:target "#wave-tracer" :attr "cy" :expr "240 - Math.sin(t * Math.PI * 2) * 90")\n    (:target "#wave-tracer" :attr "cx" :expr "100 + (t * 600)")\n    (:target "#wave-label" :attr "textContent" :expr "'Displacement y = ' + (Math.sin(t * Math.PI * 2) * 10).toFixed(1) + ' cm'")\n  ))\n)`
        },
        {
          id: 'physics-pendulum',
          title: '⏱️ Physics Harmonic Pendulum',
          desc: 'Conservation of mechanical energy: kinetic vs potential.',
          svg: `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="400" cy="80" r="6" fill="#64748b" />\n  <line id="pendulum-rod" x1="400" y1="80" x2="400" y2="340" stroke="#94a3b8" stroke-width="3" />\n  <circle id="pendulum-bob" cx="400" cy="340" r="28" fill="#10b981" stroke="#34d399" stroke-width="2" />\n  <text id="energy-txt" x="400" y="420" fill="#34d399" font-size="16" font-weight="bold" text-anchor="middle">E = Ep + Ek</text>\n</svg>`,
          ast: `(:scene :id "physics-pendulum" :title "Harmonic Pendulum" :stage "KS3 PHYSICS" :duration 3.0\n  (:keyframes (\n    (:t 0.00 :title "Max Left Amplitude" :rule "Ep is maximal, Ek = 0")\n    (:t 0.25 :title "Equilibrium Pass" :rule "Ek is maximal at center, Ep is minimum")\n    (:t 0.50 :title "Max Right Amplitude" :rule "Ep is maximal, Ek = 0")\n  ))\n  (:bindings (\n    (:target "#pendulum-rod" :attr "transform" :expr "'rotate(' + (Math.sin(t * Math.PI * 2) * 40) + ' 400 80)'")\n    (:target "#pendulum-bob" :attr "transform" :expr "'rotate(' + (Math.sin(t * Math.PI * 2) * 40) + ' 400 80)'")\n    (:target "#energy-txt" :attr "textContent" :expr "'Potential Energy: ' + (Math.abs(Math.sin(t * Math.PI * 2)) * 100).toFixed(0) + '% | Kinetic: ' + ((1 - Math.abs(Math.sin(t * Math.PI * 2))) * 100).toFixed(0) + '%'")\n  ))\n)`
        }
      ];

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
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
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

    minimizeInteractiveCard() {
      if (!this.elements.interactiveCard) return;
      this.elements.interactiveCard.classList.add('hidden');
      if (this.activeCheckpoint !== null) {
        this.minimizedCheckpoint = this.activeCheckpoint;
      }
      if (this.elements.checkpointMinimizedPill) {
        this.elements.checkpointMinimizedPill.classList.remove('hidden');
        this.elements.checkpointMinimizedPill.style.display = 'flex';
      }
      this.showToast('👁️ Question minimized. Press [Q] or badge to restore.');
    }

    restoreInteractiveCard() {
      if (!this.elements.interactiveCard) return;
      if (this.minimizedCheckpoint !== null && this.activeCheckpoint === null) {
        this.activeCheckpoint = this.minimizedCheckpoint;
      }
      this.elements.interactiveCard.classList.remove('hidden');
      if (this.elements.checkpointMinimizedPill) {
        this.elements.checkpointMinimizedPill.classList.add('hidden');
        this.elements.checkpointMinimizedPill.style.display = 'none';
      }
      this.showToast('🎯 Question restored');
    }

    closeInteractiveCard(resumePlayback = false) {
      if (this._interactiveCloseTimer) {
        clearTimeout(this._interactiveCloseTimer);
        this._interactiveCloseTimer = null;
      }
      if (this.elements.interactiveCard) {
        this.elements.interactiveCard.classList.add('hidden');
        this.elements.interactiveCard.classList.remove('goal-mode');
      }
      if (this.elements.checkpointMinimizedPill) {
        this.elements.checkpointMinimizedPill.classList.add('hidden');
        this.elements.checkpointMinimizedPill.style.display = 'none';
      }
      this.minimizedCheckpoint = null;
      this.activeCheckpoint = null;
      this._activeGoalCheckpointIndex = null;
      if (resumePlayback && this.engine) {
        this.engine.play();
      }
    }

    toggleCheckpointView() {
      if (!this.elements.interactiveCard) return;
      if (!this.elements.interactiveCard.classList.contains('hidden')) {
        this.minimizeInteractiveCard();
      } else if (this.minimizedCheckpoint !== null) {
        this.restoreInteractiveCard();
      } else if (this.activeCheckpoint !== null) {
        this.restoreInteractiveCard();
      } else {
        this.triggerFirstCheckpoint();
      }
    }

    toggleInteractiveMode() {
      this.interactiveMode = !this.interactiveMode;
      this.displayConfig.showInteractiveCheckpoints = this.interactiveMode;
      if (this.elements.btnInteractive) {
        this.elements.btnInteractive.classList.toggle('active', this.interactiveMode);
        this.elements.btnInteractive.title = this.interactiveMode
          ? '🎯 Checkpoint Questions: ON (Pauses for quizzes) • Shift-click to turn OFF'
          : '🎯 Checkpoint Questions: OFF (Uninterrupted lecture mode) • Shift-click to turn ON';
      }
      if (this.elements.cfgCheckpoints) {
        this.elements.cfgCheckpoints.checked = this.interactiveMode;
      }
      this.saveDisplayConfig(this.displayConfig);
      this.showToast(this.interactiveMode ? '🎯 Questions Auto-Pause: ON' : '🎯 Questions Auto-Pause: OFF (Lecture Mode)');
    }

    setInteractiveMode(enabled) {
      this.interactiveMode = Boolean(enabled);
      this.displayConfig.showInteractiveCheckpoints = this.interactiveMode;
      if (this.elements.btnInteractive) {
        this.elements.btnInteractive.classList.toggle('active', this.interactiveMode);
        this.elements.btnInteractive.title = this.interactiveMode
          ? '🎯 Checkpoint Questions: ON (Pauses for quizzes) • Shift-click to turn OFF'
          : '🎯 Checkpoint Questions: OFF (Uninterrupted lecture mode) • Shift-click to turn ON';
      }
      if (this.elements.cfgCheckpoints) {
        this.elements.cfgCheckpoints.checked = this.interactiveMode;
      }
      if (!this.interactiveMode) {
        this.closeInteractiveCard(false);
      }
      this.saveDisplayConfig(this.displayConfig);
      this.showToast(this.interactiveMode ? '🎯 Questions: ON' : '🎯 Questions: OFF (Uninterrupted Mode)');
    }

    _resolveQuizTargetSelector(checkpoint) {
      if (checkpoint && typeof checkpoint.target === 'string' && checkpoint.target.trim()) {
        return checkpoint.target.trim();
      }
      const scene = this.engine && this.engine.scene;
      if (scene && Array.isArray(scene.actors) && scene.actors[0] && scene.actors[0].target) {
        return scene.actors[0].target;
      }
      if (scene && Array.isArray(scene.bindings) && scene.bindings[0] && scene.bindings[0].target) {
        return scene.bindings[0].target;
      }
      return '';
    }

    async askNanoAboutCheckpoint(checkpoint, index, attemptState = {}) {
      if (this._interactiveCloseTimer) {
        clearTimeout(this._interactiveCloseTimer);
        this._interactiveCloseTimer = null;
      }
      const scene = this.engine && this.engine.scene;
      const options = Array.isArray(checkpoint && checkpoint.options) ? checkpoint.options : [];
      const answerIndex = typeof checkpoint?.answer === 'number' ? checkpoint.answer : 0;
      const payload = {
        type: 'ASK_NANO_CHECKPOINT',
        sceneId: (this.engine && this.engine.activePresetId) || (scene && scene.id) || '',
        sceneTitle: (scene && scene.title) || '',
        index,
        mode: checkpoint && checkpoint.passExpr ? 'pass-expr' : 'multiple-choice',
        prompt: (checkpoint && checkpoint.prompt) || '',
        options,
        chosenIndex: typeof attemptState.chosenOrigIdx === 'number' ? attemptState.chosenOrigIdx : null,
        chosenText: attemptState.chosenText || '',
        answerIndex,
        correctText: options[answerIndex] || '',
        explanation: (checkpoint && checkpoint.explanation) || '',
        distractorNudge: attemptState.distractorNudge || '',
        passExpr: (checkpoint && checkpoint.passExpr) || '',
        targetSelector: this._resolveQuizTargetSelector(checkpoint),
        vars: this.engine && this.engine.vars ? { ...this.engine.vars } : {},
        computed: this.engine && this.engine.computedVars ? { ...this.engine.computedVars } : {},
        progress: Number((this.engine && this.engine.progress) || 0),
        autoAsk: true,
      };

      const nanoBox = this.elements.interactiveBody && this.elements.interactiveBody.querySelector('#interactive-nano-response');
      const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;

      if (payload.targetSelector && global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.highlightTarget === 'function') {
        global.ASTSharedRenderBoundary.highlightTarget(payload.targetSelector, 3000, 'player-stage');
      }

      if (isEmbedded) {
        try {
          window.parent.postMessage(payload, '*');
        } catch (_) {}
      }

      if (nanoBox) {
        nanoBox.style.display = 'block';
        nanoBox.textContent = isEmbedded
          ? '✨ Opening Gemini Nano Co-Pilot for guided coaching...'
          : '✨ Thinking on-device with Gemini Nano...';
      }

      if (!isEmbedded) {
        let replyText = '';
        try {
          const lm = (typeof window !== 'undefined' && window.LanguageModel) || (typeof globalThis !== 'undefined' && globalThis.LanguageModel);
          if (lm && typeof lm.create === 'function') {
            const session = await lm.create({
              systemPrompt: 'You are a concise, encouraging UK curriculum science & maths Socratic tutor. Explain in 2 short sentences without giving away spoilers if avoidable.',
            });
            const q = `Scene: ${payload.sceneTitle || payload.sceneId}. Quiz Question: "${payload.prompt}". Student picked: "${payload.chosenText || 'not answered yet'}". Hint: "${payload.distractorNudge || payload.explanation || payload.passExpr}". Current vars: ${JSON.stringify(payload.vars)}. Coach the pupil clearly.`;
            replyText = await session.prompt(q);
            if (typeof session.destroy === 'function') session.destroy();
          }
        } catch (_) {}

        if (!replyText) {
          if (payload.distractorNudge) {
            replyText = `${payload.distractorNudge} ${payload.explanation ? 'Key concept: ' + payload.explanation : ''}`.trim();
          } else if (payload.passExpr) {
            replyText = `Focus on adjusting the lab controls toward the goal condition (${payload.passExpr}). ${payload.explanation || 'Watch how the active vector readout responds as you move sliders or drag elements.'}`;
          } else {
            replyText = payload.explanation || 'Observe the highlighted apparatus on the vector stage and compare how the active parameters change across the timeline.';
          }
        }
        if (nanoBox) {
          nanoBox.textContent = `🤖 Nano: ${replyText}`;
        }
      }
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
      if (!this.elements.interactiveCard || !this.elements.interactiveBody) return;
      if (!this.interactiveMode) return;
      const scene = this.engine && this.engine.scene;
      const hasCheckpoints = Boolean(scene && scene.interactive && Array.isArray(scene.interactive.checkpoints) && scene.interactive.checkpoints.length > 0 && !scene.interactive.disabled && scene.interactive !== false && scene.type !== 'App' && scene.cartridgeType !== 'App');
      if (!hasCheckpoints) return;

      if (this._interactiveCloseTimer) {
        clearTimeout(this._interactiveCloseTimer);
        this._interactiveCloseTimer = null;
      }

      this.activeCheckpoint = index;
      this.minimizedCheckpoint = null;
      this._activeGoalCheckpointIndex = null;
      this.elements.interactiveCard.classList.remove('goal-mode');
      if (this.elements.checkpointMinimizedPill) {
        this.elements.checkpointMinimizedPill.classList.add('hidden');
        this.elements.checkpointMinimizedPill.style.display = 'none';
      }

      if (checkpoint.passExpr) {
        this._activeGoalCheckpointIndex = index;
        this.elements.interactiveCard.classList.add('goal-mode');
        if (this.elements.interactiveBadge) {
          this.elements.interactiveBadge.textContent = checkpoint.title || 'LAB GOAL CHALLENGE';
        }
        const holdDur = Number(checkpoint.holdDuration || 0);
        const holdLabel = holdDur > 0 ? `0.0s / ${holdDur.toFixed(1)}s` : 'Adjust controls to satisfy goal';
        this.elements.interactiveBody.replaceChildren(
          this._h('div', { className: 'interactive-prompt', text: checkpoint.prompt }),
          this._h('div', { className: 'goal-progress-wrap' },
            this._h('div', { className: 'goal-progress-header' },
              this._h('span', { text: 'Live Condition Status' }),
              this._h('span', { id: 'goal-hold-readout', className: 'goal-hold-readout', text: holdLabel })
            ),
            this._h('div', { className: 'goal-progress-track' },
              this._h('div', { id: 'goal-progress-fill', className: 'goal-progress-fill' })
            )
          ),
          this._h('div', { id: 'interactive-result', className: 'interactive-feedback', css: 'display: none;' }),
          this._h('div', { className: 'interactive-nano-actions' },
            this._h('button', {
              type: 'button', id: 'interactive-ask-nano-btn', className: 'interactive-ask-nano-btn',
              title: 'Ask Gemini Nano Co-Pilot for a guided hint on this lab challenge', text: '🤖 Ask Nano'
            }),
            this._h('button', {
              type: 'button', id: 'interactive-mute-popups-btn', className: 'interactive-dismiss-popups-btn',
              title: 'Turn off popup questions (re-enable via Interactive button or Settings)', text: '🔕 Turn Off Popups'
            })
          ),
          this._h('div', { id: 'interactive-nano-response', className: 'interactive-nano-response' })
        );
        this.elements.interactiveCard.classList.remove('hidden');
        const askGoalBtn = this.elements.interactiveBody.querySelector('#interactive-ask-nano-btn');
        const muteGoalBtn = this.elements.interactiveBody.querySelector('#interactive-mute-popups-btn');
        if (askGoalBtn) {
          askGoalBtn.addEventListener('click', () => this.askNanoAboutCheckpoint(checkpoint, index, {}));
        }
        if (muteGoalBtn) {
          muteGoalBtn.addEventListener('click', () => {
            this.setInteractiveMode(false);
            if (this.engine) this.engine.play();
          });
        }
        this.updateGoalCheckpointProgress();
        return;
      }

      const isSlide = scene && (scene.type === 'Slide' || scene.cartridgeType === 'Slide');
      const isContinuousSim = !isSlide && Boolean(this.engine && (this.engine.isContinuousSim || (this.engine.scene && (this.engine.scene.continuous || this.engine.scene.isContinuous || this.engine.scene.type === 'Sim'))));
      if (!isContinuousSim) {
        this.engine.pause();
      }

      if (this.elements.interactiveBadge) {
        this.elements.interactiveBadge.textContent = checkpoint.title || 'CHECKPOINT CHALLENGE';
      }

      // Dynamic option shuffling:
      // Map options with their original indices and shuffle so correct answer is NOT always option A!
      const rawOptions = Array.isArray(checkpoint.options) && checkpoint.options.length > 0
        ? checkpoint.options
        : ['Correct', 'Incorrect'];
      const correctOriginalIndex = typeof checkpoint.answer === 'number' ? checkpoint.answer : 0;

      const indexedOptions = rawOptions.map((opt, i) => ({
        text: opt,
        originalIndex: i,
        isCorrect: i === correctOriginalIndex
      }));

      // Fisher-Yates shuffle to randomize placement of options
      for (let i = indexedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = indexedOptions[i];
        indexedOptions[i] = indexedOptions[j];
        indexedOptions[j] = temp;
      }

      const optionsBox = this._h('div', { className: 'interactive-options' },
        ...indexedOptions.map((item, i) =>
          this._h('button', {
            type: 'button',
            className: 'interactive-opt-btn',
            attrs: { 'data-opt-idx': item.originalIndex, 'data-is-correct': item.isCorrect }
          },
            this._h('span', { css: 'font-weight:700; color:#38bdf8; margin-right:6px;', text: `${String.fromCharCode(65 + i)}.` }),
            ` ${item.text}`
          )
        )
      );

      this.elements.interactiveBody.replaceChildren(
        this._h('div', { className: 'interactive-prompt', text: checkpoint.prompt }),
        optionsBox,
        this._h('div', { id: 'interactive-result', className: 'interactive-feedback', css: 'display: none;' }),
        this._h('div', { className: 'interactive-nano-actions' },
          this._h('button', {
            type: 'button', id: 'interactive-ask-nano-btn', className: 'interactive-ask-nano-btn',
            title: 'Ask Gemini Nano Co-Pilot about this question or why an option works', text: '🤖 Ask Nano'
          }),
          this._h('div', { css: 'display:flex; gap:6px; align-items:center;' },
            this._h('button', {
              type: 'button', id: 'interactive-continue-btn', className: 'interactive-dismiss-popups-btn',
              css: 'display:none; color:#38bdf8; border-color:#0284c7;', text: 'Continue ▶'
            }),
            this._h('button', {
              type: 'button', id: 'interactive-mute-popups-btn', className: 'interactive-dismiss-popups-btn',
              title: 'Turn off popup questions (re-enable via Interactive button or Settings)', text: '🔕 Turn Off Popups'
            })
          )
        ),
        this._h('div', { id: 'interactive-nano-response', className: 'interactive-nano-response' })
      );
      this.elements.interactiveCard.classList.remove('hidden');

      const optBtns = this.elements.interactiveBody.querySelectorAll('.interactive-opt-btn');
      const resultBox = this.elements.interactiveBody.querySelector('#interactive-result');
      const askNanoBtn = this.elements.interactiveBody.querySelector('#interactive-ask-nano-btn');
      const mutePopupsBtn = this.elements.interactiveBody.querySelector('#interactive-mute-popups-btn');
      const continueBtn = this.elements.interactiveBody.querySelector('#interactive-continue-btn');
      const lastAttempt = { chosenOrigIdx: null, chosenText: '', distractorNudge: '', isCorrect: null };

      if (askNanoBtn) {
        askNanoBtn.addEventListener('click', () => {
          askNanoBtn.classList.remove('nudge-highlight');
          this.askNanoAboutCheckpoint(checkpoint, index, lastAttempt);
        });
      }
      if (mutePopupsBtn) {
        mutePopupsBtn.addEventListener('click', () => {
          this.setInteractiveMode(false);
          if (this.engine) this.engine.play();
        });
      }
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          this.closeInteractiveCard(true);
        });
      }

      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const isCorrect = btn.getAttribute('data-is-correct') === 'true';
          const chosenOrigIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
          const selectedOpt = indexedOptions.find(o => o.originalIndex === chosenOrigIdx);
          const distractorNudge = !isCorrect && checkpoint.onWrong
            ? (checkpoint.onWrong[chosenOrigIdx] !== undefined ? checkpoint.onWrong[chosenOrigIdx] : checkpoint.onWrong[String(chosenOrigIdx)])
            : null;

          lastAttempt.chosenOrigIdx = chosenOrigIdx;
          lastAttempt.chosenText = selectedOpt ? selectedOpt.text : String(chosenOrigIdx);
          lastAttempt.distractorNudge = distractorNudge || '';
          lastAttempt.isCorrect = isCorrect;

          if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'CHECKPOINT_ANSWERED',
              sceneId: (scene && scene.id) || '',
              sceneTitle: (scene && scene.title) || '',
              index,
              chosenIdx: chosenOrigIdx,
              selectedText: lastAttempt.chosenText,
              isCorrect,
              prompt: checkpoint.prompt,
              options: rawOptions,
              answer: correctOriginalIndex,
              explanation: checkpoint.explanation || '',
              distractorNudge: distractorNudge || '',
            }, '*');
          }

          if (isCorrect) {
            optBtns.forEach(b => { b.disabled = true; });
            btn.classList.add('correct');
            this.playChime(784, 'triangle'); // G5 happy chime
            this.completedCheckpoints.add(index);
            if (resultBox) {
              resultBox.style.display = 'block';
              resultBox.style.color = '#34d399';
              resultBox.replaceChildren(
                this._h('strong', { text: '✓ Correct!' }),
                ` ${checkpoint.explanation || ''}`
              );
            }
            if (this.engine.voiceEnabled) {
              this.engine.speak(`Correct! ${checkpoint.explanation || ''}`);
            }
            if (continueBtn) continueBtn.style.display = 'inline-flex';
            // Resume after 2.2 seconds unless Ask Nano is invoked
            this._interactiveCloseTimer = setTimeout(() => {
              this.closeInteractiveCard(true);
            }, 2200);
          } else if (distractorNudge) {
            // Distractor-specific Socratic nudge: keep remaining choices active for self-correction
            btn.disabled = true;
            btn.classList.add('hinted');
            this.playChime(330, 'triangle');
            if (resultBox) {
              resultBox.style.display = 'block';
              resultBox.style.color = '#fbbf24';
              resultBox.replaceChildren(
                this._h('strong', { text: 'Guidance:' }),
                ` ${distractorNudge}`
              );
            }
            if (askNanoBtn) {
              askNanoBtn.textContent = '🤖 Ask Nano Why';
              askNanoBtn.classList.add('nudge-highlight');
            }
            if (this.engine.voiceEnabled) {
              this.engine.speak(distractorNudge);
            }
          } else {
            optBtns.forEach(b => { b.disabled = true; });
            btn.classList.add('incorrect');
            const correctBtn = this.elements.interactiveBody.querySelector('[data-is-correct="true"]');
            if (correctBtn) correctBtn.classList.add('correct');
            this.playChime(220, 'sawtooth'); // Error buzz
            if (resultBox) {
              resultBox.style.display = 'block';
              resultBox.style.color = '#f87171';
              resultBox.replaceChildren(
                this._h('strong', { text: 'Hint:' }),
                ` ${checkpoint.explanation || 'Try reviewing the simulation parameters!'}`
              );
            }
            if (askNanoBtn) {
              askNanoBtn.textContent = '🤖 Ask Nano Why';
              askNanoBtn.classList.add('nudge-highlight');
            }
            if (continueBtn) continueBtn.style.display = 'inline-flex';
            if (this.engine.voiceEnabled) {
              this.engine.speak(`Remember: ${checkpoint.explanation || ''}`);
            }
            // Keep open slightly longer so pupil can click Ask Nano Why or Continue
            this._interactiveCloseTimer = setTimeout(() => {
              this.closeInteractiveCard(true);
            }, 4800);
          }
        });
      });
    }

    updateGoalCheckpointProgress() {
      if (this._activeGoalCheckpointIndex === null || this._activeGoalCheckpointIndex === undefined) return;
      if (!this.engine || typeof this.engine.getCheckpointGoalStatus !== 'function') return;
      const fillEl = this.elements.interactiveBody && this.elements.interactiveBody.querySelector('#goal-progress-fill');
      const readoutEl = this.elements.interactiveBody && this.elements.interactiveBody.querySelector('#goal-hold-readout');
      if (!fillEl && !readoutEl) return;
      const st = this.engine.getCheckpointGoalStatus(this._activeGoalCheckpointIndex);
      if (fillEl) {
        fillEl.style.width = `${Math.round(Math.max(0, Math.min(1, st.holdProgress)) * 100)}%`;
      }
      if (readoutEl) {
        if (st.passed) {
          readoutEl.textContent = 'Target achieved';
          readoutEl.style.color = '#34d399';
        } else if (st.holdDuration > 0) {
          readoutEl.textContent = `${st.holdElapsed.toFixed(1)}s / ${st.holdDuration.toFixed(1)}s`;
          readoutEl.style.color = st.holdElapsed > 0 ? '#34d399' : '#38bdf8';
        } else {
          readoutEl.textContent = 'Adjust controls to satisfy goal';
        }
      }
    }

    handleGoalCheckpointPassed(data) {
      if (!data || typeof data.index !== 'number') return;
      const idx = data.index;
      const cp = data.checkpoint;
      this.completedCheckpoints.add(idx);
      this.playChime(784, 'triangle');
      const scene = this.engine && this.engine.scene;

      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'CHECKPOINT_ANSWERED',
          sceneId: (scene && scene.id) || '',
          sceneTitle: (scene && scene.title) || '',
          index: idx,
          chosenIdx: 0,
          selectedText: cp && cp.passExpr ? cp.passExpr : 'Goal passed',
          isCorrect: true,
          prompt: (cp && cp.prompt) || '',
          answer: 0,
          mode: 'pass-expr',
        }, '*');
      }

      if (this._activeGoalCheckpointIndex === idx && this.elements.interactiveBody) {
        const fillEl = this.elements.interactiveBody.querySelector('#goal-progress-fill');
        const readoutEl = this.elements.interactiveBody.querySelector('#goal-hold-readout');
        const resultBox = this.elements.interactiveBody.querySelector('#interactive-result');
        if (fillEl) fillEl.style.width = '100%';
        if (readoutEl) {
          readoutEl.textContent = 'Target achieved';
          readoutEl.style.color = '#34d399';
        }
        if (resultBox) {
          resultBox.style.display = 'block';
          resultBox.style.color = '#34d399';
          resultBox.replaceChildren(
            this._h('strong', { text: '✓ Goal Achieved!' }),
            ` ${(cp && cp.explanation) || ''}`
          );
        }
        if (this.engine.voiceEnabled) {
          this.engine.speak(`Goal achieved! ${(cp && cp.explanation) || ''}`);
        }
        setTimeout(() => {
          if (this._activeGoalCheckpointIndex === idx) {
            this.closeInteractiveCard(false);
          }
        }, 2600);
      } else {
        this.showToast(`✓ Goal Achieved: ${(cp && cp.title) || 'Lab Checkpoint'}`);
      }
    }

    logDataToJotterCsv(forceDownload = false) {
      if (!this.engine || typeof this.engine.exportLabCsv !== 'function') {
        this.showToast('⚠️ Lab CSV logger not ready');
        return;
      }
      const res = this.engine.exportLabCsv();
      if (!res || !res.csv) {
        this.showToast('⚠️ No simulation observations sampled yet');
        return;
      }

      if (forceDownload && typeof document !== 'undefined') {
        try {
          const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${res.sceneId || 'lab'}-data.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          this.showToast(`📥 Downloaded ${res.rowCount} CSV rows`);
          return;
        } catch (_) {}
      }

      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'LOG_JOTTER_CSV',
          sceneId: res.sceneId,
          sceneTitle: res.sceneTitle,
          rowCount: res.rowCount,
          csv: res.csv,
          nodePath: `lab/${res.sceneId}`,
        }, '*');
        this.showToast(`📊 Logged ${res.rowCount} rows to Jotter (CSV)`);
        return;
      }

      if (typeof indexedDB !== 'undefined') {
        try {
          const req = indexedDB.open('SchoolAiJotter', 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('session_events')) {
              const store = db.createObjectStore('session_events', { autoIncrement: true, keyPath: 'id' });
              store.createIndex('sessionId', 'sessionId', { unique: false });
            }
          };
          req.onsuccess = () => {
            try {
              const db = req.result;
              const tx = db.transaction('session_events', 'readwrite');
              tx.objectStore('session_events').add({
                sessionId: `lab-${res.sceneId}`,
                timestamp: Date.now(),
                nodePath: `lab/${res.sceneId}`,
                actor: 'student',
                payload: res.csv,
              });
              tx.oncomplete = () => {
                this.showToast(`📊 Logged ${res.rowCount} rows to SchoolAiJotter (CSV)`);
              };
            } catch (_) {
              this.showToast('⚠️ Failed to write CSV to SchoolAiJotter');
            }
          };
          req.onerror = () => this.showToast('⚠️ Unable to open SchoolAiJotter database');
        } catch (_) {
          this.showToast('⚠️ IndexedDB unavailable for CSV logging');
        }
      }
    }

    triggerFirstCheckpoint() {
      // If a question card is currently visible, toggle it minimized
      if (this.elements.interactiveCard && !this.elements.interactiveCard.classList.contains('hidden')) {
        this.minimizeInteractiveCard();
        return;
      }
      // If a question was minimized, restore it
      if (this.minimizedCheckpoint !== null) {
        this.restoreInteractiveCard();
        return;
      }
      const scene = this.engine && this.engine.scene;
      const hasCheckpoints = Boolean(scene && scene.interactive && Array.isArray(scene.interactive.checkpoints) && scene.interactive.checkpoints.length > 0 && !scene.interactive.disabled && scene.interactive !== false && scene.type !== 'App' && scene.cartridgeType !== 'App');

      if (!hasCheckpoints) {
        this.showToast('ℹ️ No checkpoint quizzes defined in this cartridge');
        return;
      }
      let targetIdx = 0;
      for (let i = 0; i < scene.interactive.checkpoints.length; i++) {
        if (!this.completedCheckpoints.has(i)) {
          targetIdx = i;
          break;
        }
      }
      const cp = scene.interactive.checkpoints[targetIdx];
      this.engine.seek(cp.t);
      this.triggerCheckpoint(cp, targetIdx);
    }

    checkInteractiveCheckpoints() {
      if (!this.interactiveMode || this.activeCheckpoint !== null) return;
      const scene = this.engine && this.engine.scene;
      const hasCheckpoints = Boolean(scene && scene.interactive && Array.isArray(scene.interactive.checkpoints) && scene.interactive.checkpoints.length > 0 && !scene.interactive.disabled && scene.interactive !== false && scene.type !== 'App' && scene.cartridgeType !== 'App');
      if (!hasCheckpoints) return;

      const curT = this.engine.progress;
      const prevT = this._lastCheckedT !== undefined ? this._lastCheckedT : curT;
      this._lastCheckedT = curT;

      // Rewind detection: allow re-taking checkpoints when seeking backwards
      if (curT < prevT - 0.05) {
        scene.interactive.checkpoints.forEach((cp, idx) => {
          if (cp.t > curT) this.completedCheckpoints.delete(idx);
        });
      }

      scene.interactive.checkpoints.forEach((cp, idx) => {
        if (!this.completedCheckpoints.has(idx)) {
          // If playback crossed checkpoint or is within 0.018 of trigger point
          const justCrossed = curT >= cp.t && prevT <= cp.t && (curT - prevT) < 0.15;
          const isNear = Math.abs(curT - cp.t) < 0.018;
          if (justCrossed || isNear) {
            this.triggerCheckpoint(cp, idx);
          }
        }
      });
    }

    getSceneQuestsConfig() {
      return (this.engine && this.engine.scene && this.engine.scene.quests) || null;
    }

    getSceneQuestMissions() {
      const qCfg = this.getSceneQuestsConfig();
      if (qCfg && Array.isArray(qCfg.missions)) return qCfg.missions;
      return Array.isArray(this.questMissions) ? this.questMissions : [];
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

      let overlay = document.getElementById('cartridge-controls-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cartridge-controls-overlay';
        overlay.className = 'cartridge-controls-overlay';
        stage.appendChild(overlay);
      }

      // Read controls from scene.uiControls or scene.inputs (data-as-code)
      const controls = (scene && (scene.uiControls || scene.inputs)) || [];

      if (!controls || controls.length === 0) {
        overlay.classList.add('hidden');
        if (typeof overlay.replaceChildren === 'function') overlay.replaceChildren();
        else overlay.textContent = '';
        return;
      }

      overlay.classList.remove('hidden');
      const title = (scene && (scene.title || scene.id)) || 'Simulation Controls';
      const body = this._h('div', { className: 'cartridge-controls-body' });
      const minBtn = this._h('button', {
        type: 'button',
        className: 'cartridge-controls-min-btn',
        title: 'Toggle Controls Overlay',
        text: '▾'
      });
      overlay.replaceChildren(
        this._h('div', { className: 'cartridge-controls-header' },
          this._h('div', { className: 'cartridge-controls-title' },
            this._h('span', { className: 'cartridge-controls-chip', text: '⚡ LISP UI' }),
            this._h('span', { className: 'cartridge-controls-name', text: title })
          ),
          minBtn
        ),
        body
      );

      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        body.classList.toggle('collapsed');
        minBtn.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
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
            readout.textContent = nextVal;
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

      const items = overlay.querySelectorAll('.cartridge-ctrl-item');
      items.forEach(item => {
        const id = item.getAttribute('data-ctrl-id');
        const rawBind = item.getAttribute('data-ctrl-bind') || id;
        const normBind = this.engine && typeof this.engine.normalizeVarName === 'function'
          ? this.engine.normalizeVarName(rawBind)
          : String(rawBind || '').replace(/^\*|\*$/g, '');
        const resolvedVal = isBatchReset
          ? (this.engine && typeof this.engine.getMemoryVar === 'function' ? this.engine.getMemoryVar(rawBind || id) : undefined)
          : value;
        const matches = isBatchReset || id === cleanVar || id === varName || normBind === cleanVar || rawBind === varName;

        const slider = item.querySelector('.cartridge-ui-slider');
        if (slider && matches && resolvedVal !== undefined) {
          slider.value = resolvedVal;
          const badge = item.querySelector(`#ctrl-val-${id}`);
          if (badge) badge.textContent = resolvedVal;
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
          this.engine.setVolume(vol);
          if (el.btnVolumeMute) {
            el.btnVolumeMute.textContent = vol === 0 ? '🔇' : (vol < 0.5 ? '🔉' : '🔊');
          }
        });
      }

      if (el.btnVolumeMute) {
        el.btnVolumeMute.addEventListener('click', () => {
          const muted = this.engine.toggleMute();
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
            const currentSub = this.engine.getCurrentSubtitle() || (this.engine.scene && this.engine.scene.title) || '';
            if (currentSub) this.engine.speakText(currentSub);
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
              `🛡️ Official Signed [${info.cartridgeId}] • Seal ${info.shortHash} • ${info.authority}`,
              4800
            );
          } else if (info && info.status === 'tampered') {
            this.showToast(
              `✎ Modified Remix [${info.cartridgeId}] • Live SHA-256 ${info.shortHash} (differs from official seal)`,
              4800
            );
          } else if (info) {
            this.showToast(
              `◈ Community / Custom Cartridge [${info.cartridgeId}] • SHA-256 ${info.shortHash}`,
              4500
            );
          } else {
            this.showToast(`🛡️ Verifying SHA-256 seal for [${currentPreset || 'Simulation'}]...`, 3200);
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

      // --- Developer Inspector & Live Studio Event Bindings ---
      if (el.btnDevMode) {
        el.btnDevMode.addEventListener('click', () => this.toggleDevMode());
      }

      if (el.btnDevStudio) {
        el.btnDevStudio.addEventListener('click', () => this.toggleDevStudio());
      }

      if (stage) {
        stage.addEventListener('mousemove', (e) => {
          if (!this.devModeActive || !el.sceneRoot || !el.stageSvg) return;
          if (e.target.closest('.dev-inspector-drawer') || e.target.closest('.dev-studio-drawer') || e.target.closest('header') || e.target.closest('footer')) {
            if (el.devHoverBox) el.devHoverBox.classList.add('hidden');
            if (el.devHoverTooltip) el.devHoverTooltip.classList.add('hidden');
            return;
          }

          let target = document.elementFromPoint(e.clientX, e.clientY);
          if (target && target.closest && target.closest('#scene-root') && target !== el.sceneRoot) {
            if (target.tagName && target.tagName.toLowerCase() === 'g' && target.children.length === 1) {
              target = target.children[0];
            }
            this.updateDevHover(target, e);
          } else {
            if (el.devHoverBox) el.devHoverBox.classList.add('hidden');
            if (el.devHoverTooltip) el.devHoverTooltip.classList.add('hidden');
          }
        });

        stage.addEventListener('mouseleave', () => {
          if (el.devHoverBox) el.devHoverBox.classList.add('hidden');
          if (el.devHoverTooltip) el.devHoverTooltip.classList.add('hidden');
        });

        stage.addEventListener('click', (e) => {
          if (!this.devModeActive) return;
          if (e.target.closest('.dev-inspector-drawer') || e.target.closest('.dev-studio-drawer') || e.target.closest('button') || e.target.closest('select')) return;

          let target = document.elementFromPoint(e.clientX, e.clientY);
          if (target && target.closest && target.closest('#scene-root') && target !== el.sceneRoot) {
            e.stopPropagation();
            if (target.tagName && target.tagName.toLowerCase() === 'g' && target.children.length === 1) {
              target = target.children[0];
            }
            this.selectElement(target);
          }
        });
      }

      if (el.devInspectorClose) {
        el.devInspectorClose.addEventListener('click', () => this.closeInspectorDrawer());
      }

      const syncAttr = (attr, val) => {
        if (!this.selectedElement) return;
        this.selectedElement.setAttribute(attr, val);
        if (this.engine) this.engine._svgDirtyFromInspector = true;
        this.refreshSelectBox();
        if (el.devEditorSvg && this.engine && typeof this.engine.getCleanCompanionSvg === 'function') {
          el.devEditorSvg.value = this.engine.getCleanCompanionSvg();
          this.refreshAstSvgMatcher();
        }
        this.engine.notifyParent({
          type: 'DEV_ELEMENT_UPDATED',
          selector: this.selectedElementSelector,
          attr,
          value: val
        });
      };

      if (el.devColorFill && el.devPropFill) {
        el.devColorFill.addEventListener('input', (e) => {
          el.devPropFill.value = e.target.value;
          syncAttr('fill', e.target.value);
        });
        el.devPropFill.addEventListener('change', (e) => {
          el.devColorFill.value = e.target.value.startsWith('#') && e.target.value.length === 7 ? e.target.value : '#000000';
          syncAttr('fill', e.target.value);
        });
      }

      if (el.devColorStroke && el.devPropStroke) {
        el.devColorStroke.addEventListener('input', (e) => {
          el.devPropStroke.value = e.target.value;
          syncAttr('stroke', e.target.value);
        });
        el.devPropStroke.addEventListener('change', (e) => {
          el.devColorStroke.value = e.target.value.startsWith('#') && e.target.value.length === 7 ? e.target.value : '#000000';
          syncAttr('stroke', e.target.value);
        });
      }

      if (el.devPropStrokew) {
        el.devPropStrokew.addEventListener('input', (e) => {
          syncAttr('stroke-width', e.target.value);
        });
      }

      if (el.devRangeOpacity && el.devValOpacity) {
        el.devRangeOpacity.addEventListener('input', (e) => {
          el.devValOpacity.textContent = parseFloat(e.target.value).toFixed(2);
          syncAttr('opacity', e.target.value);
        });
      }

      if (el.devPropTransform) {
        el.devPropTransform.addEventListener('input', (e) => {
          syncAttr('transform', e.target.value);
        });
      }

      if (el.btnCopySelector) {
        el.btnCopySelector.addEventListener('click', () => {
          if (!this.selectedElementSelector) return;
          navigator.clipboard?.writeText(this.selectedElementSelector).then(() => {
            this.showToast(`✓ Selector copied: ${this.selectedElementSelector}`);
          });
        });
      }

      if (el.btnCopyAstRule) {
        el.btnCopyAstRule.addEventListener('click', () => {
          if (!this.selectedElementSelector) return;
          const snippet = `(:target "${this.selectedElementSelector}" :attr "transform" :expr "'rotate(' + (t * 360) + ')'")`;
          navigator.clipboard?.writeText(snippet).then(() => {
            this.showToast('✓ AST rule copied');
          });
        });
      }

      if (el.btnBindToStudio) {
        el.btnBindToStudio.addEventListener('click', () => {
          if (!this.selectedElement) return;
          let targetId = this.selectedElement.id;
          if (!targetId) {
            targetId = `shape-${Math.random().toString(36).slice(2, 6)}`;
            this.selectedElement.id = targetId;
            if (this.engine) this.engine._svgDirtyFromInspector = true;
            this.selectedElementSelector = `#${targetId}`;
          }
          this.openDevStudio('ast');
          this.insertBindingForSvgId(targetId);
        });
      }

      if (el.btnDevDelete) {
        el.btnDevDelete.addEventListener('click', () => {
          if (!this.selectedElement) return;
          const deadSel = this.selectedElementSelector;
          this.selectedElement.remove();
          if (this.engine) this.engine._svgDirtyFromInspector = true;
          this.closeInspectorDrawer();
          if (el.devEditorSvg && this.engine && typeof this.engine.getCleanCompanionSvg === 'function') {
            el.devEditorSvg.value = this.engine.getCleanCompanionSvg();
            this.refreshAstSvgMatcher();
          }
          this.showToast(`🗑️ Deleted ${deadSel}`);
        });
      }

      if (el.btnCopyNodeXml) {
        el.btnCopyNodeXml.addEventListener('click', () => {
          if (!this.selectedElement) return;
          navigator.clipboard?.writeText(this.selectedElement.outerHTML).then(() => {
            this.showToast('✓ OuterXML copied');
          });
        });
      }

      if (el.devStudioClose) {
        el.devStudioClose.addEventListener('click', () => this.closeDevStudio());
      }

      const studioTabBtns = document.querySelectorAll('.dev-tab-btn');
      studioTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-tab');
          this.switchStudioTab(tab);
        });
      });

      if (el.btnStudioRun) {
        el.btnStudioRun.addEventListener('click', () => {
          if (this.activeStudioTab === 'compiler') {
            if (global.ASTSlideScriptCompiler && el.devEditorSlideScript) {
              const scriptText = el.devEditorSlideScript.value;
              const currentSvg = (typeof this.engine.getCleanCompanionSvg === 'function')
                ? this.engine.getCleanCompanionSvg()
                : this.engine.getStageSvgSnapshot();
              const result = global.ASTSlideScriptCompiler.compile(scriptText, currentSvg);
              if (result.errors && result.errors.length > 0) {
                this.playChime(220, 'sawtooth');
                this.showToast('⚠️ Compiler Notice: ' + result.errors[0]);
                return;
              }

              if (el.devEditorSvg) el.devEditorSvg.value = result.svg;
              if (el.devEditorAst) el.devEditorAst.value = result.ast;

              this.engine.hotReloadSvg(result.svg);
              this.engine.hotReloadAst(result.ast);
              this.engine.seek(0.0);
              this.refreshAstSvgMatcher();
              this.playChime(784, 'triangle');
              this.showToast('🚀 SlideScript Compiled & Playing Live!');
              return;
            }
          }

          let svgOk = true, astOk = true;
          if (el.devEditorSvg && el.devEditorSvg.value) {
            svgOk = this.engine.hotReloadSvg(el.devEditorSvg.value);
          }
          if (el.devEditorAst && el.devEditorAst.value) {
            astOk = this.engine.hotReloadAst(el.devEditorAst.value);
          }
          this.refreshAstSvgMatcher();
          if (svgOk && astOk) {
            this.playChime(784, 'triangle');
            this.showToast('⚡ Live Stage Hot-Reloaded!');
          } else {
            this.playChime(220, 'sawtooth');
            this.showToast('Notice: Syntax issue in SVG or AST');
          }
        });
      }

      // Live .ast <-> .svg Auto-Matcher updates while typing
      let matcherDebounce = null;
      const scheduleMatcherRefresh = () => {
        if (matcherDebounce) clearTimeout(matcherDebounce);
        matcherDebounce = setTimeout(() => {
          this.refreshAstSvgMatcher();
        }, 180);
      };
      if (el.devEditorSvg) el.devEditorSvg.addEventListener('input', scheduleMatcherRefresh);
      if (el.devEditorAst) el.devEditorAst.addEventListener('input', scheduleMatcherRefresh);

      if (el.btnMatcherAutofixAll) {
        el.btnMatcherAutofixAll.addEventListener('click', () => {
          this.autoFixAllAstSvgMatches();
        });
      }

      if (el.btnMatcherNanoExplain) {
        el.btnMatcherNanoExplain.addEventListener('click', () => {
          this.requestNanoRemix('Fix any missing SVG matches or explain why selectors are mismatched');
        });
      }

      // Gemini Nano Remix Co-Pilot Wiring
      if (el.btnStudioNanoAsk) {
        el.btnStudioNanoAsk.addEventListener('click', () => {
          this.requestNanoRemix();
        });
      }
      if (el.studioNanoInput) {
        el.studioNanoInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.requestNanoRemix();
          }
        });
      }
      document.querySelectorAll('.nano-chip-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const promptText = btn.getAttribute('data-nano-prompt') || '';
          if (el.studioNanoInput) el.studioNanoInput.value = promptText;
          this.requestNanoRemix(promptText);
        });
      });
      if (el.btnStudioNanoApply) {
        el.btnStudioNanoApply.addEventListener('click', () => {
          this.applyPendingNanoProposal();
        });
      }
      if (el.btnStudioNanoDismiss && el.studioNanoPreview) {
        el.btnStudioNanoDismiss.addEventListener('click', () => {
          el.studioNanoPreview.classList.add('hidden');
          this._pendingNanoProposal = null;
        });
      }
      if (el.btnStudioNanoUndo) {
        el.btnStudioNanoUndo.addEventListener('click', () => {
          this.undoLastNanoEdit();
        });
      }

      // Remix / Save As Bar Wiring
      if (el.btnStudioSaveAs) {
        el.btnStudioSaveAs.addEventListener('click', () => {
          if (el.studioSaveAsBar && !el.studioSaveAsBar.classList.contains('hidden')) {
            el.studioSaveAsBar.classList.add('hidden');
          } else {
            this.openSaveAsBar();
          }
        });
      }
      if (el.btnRemixCancel && el.studioSaveAsBar) {
        el.btnRemixCancel.addEventListener('click', () => {
          el.studioSaveAsBar.classList.add('hidden');
        });
      }
      if (el.remixTitleInput && el.remixIdInput) {
        el.remixTitleInput.addEventListener('input', () => {
          if (!el.remixIdInput.dataset.manualEdit) {
            el.remixIdInput.value = this.slugifyCartridgeId(el.remixTitleInput.value);
          }
          this.updateRemixPreviewLabel();
        });
        el.remixIdInput.addEventListener('input', () => {
          el.remixIdInput.dataset.manualEdit = '1';
          el.remixIdInput.value = this.slugifyCartridgeId(el.remixIdInput.value);
          this.updateRemixPreviewLabel();
        });
      }
      if (el.btnRemixSaveVault) {
        el.btnRemixSaveVault.addEventListener('click', () => this.executeSaveRemixAs('vault'));
      }
      if (el.btnRemixSaveDuo) {
        el.btnRemixSaveDuo.addEventListener('click', () => this.executeSaveRemixAs('duo'));
      }
      if (el.btnRemixSaveAstb) {
        el.btnRemixSaveAstb.addEventListener('click', () => this.executeSaveRemixAs('astb'));
      }

      if (el.btnDecompileAst) {
        el.btnDecompileAst.addEventListener('click', () => {
          if (global.ASTSlideScriptCompiler && this.engine.scene) {
            const script = global.ASTSlideScriptCompiler.toSlideScript(this.engine.scene);
            if (el.devEditorSlideScript) {
              el.devEditorSlideScript.value = script;
            }
            this.switchStudioTab('compiler');
            this.playChime(659.25, 'triangle');
            this.showToast('🔄 Scene Converted to Plain SlideScript');
          }
        });
      }

      // SlideScript Compiler Template Buttons
      const compilerTplBtns = document.querySelectorAll('.compiler-tpl-btn');
      compilerTplBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tplKey = btn.getAttribute('data-tpl');
          if (global.ASTSlideScriptCompiler && global.ASTSlideScriptCompiler.TEMPLATES && global.ASTSlideScriptCompiler.TEMPLATES[tplKey]) {
            const tpl = global.ASTSlideScriptCompiler.TEMPLATES[tplKey];
            if (el.devEditorSlideScript) {
              el.devEditorSlideScript.value = tpl.script;
            }
            const res = global.ASTSlideScriptCompiler.compile(tpl.script);
            if (el.devEditorSvg) el.devEditorSvg.value = res.svg;
            if (el.devEditorAst) el.devEditorAst.value = res.ast;
            this.engine.hotReloadSvg(res.svg);
            this.engine.hotReloadAst(res.ast);
            this.engine.seek(0.0);
            this.playChime(784, 'triangle');
            this.showToast(`✨ Loaded & Compiled ${tpl.title}`);
          }
        });
      });

      // Visual Checkpoint Builder Time Capture
      if (el.qbBtnCaptureTime) {
        el.qbBtnCaptureTime.addEventListener('click', () => {
          const curP = Number(this.engine.progress.toFixed(2));
          if (el.qbTime) el.qbTime.value = curP;
          const dur = this.engine.durationSec || 10;
          if (el.qbTimeSeconds) el.qbTimeSeconds.textContent = `(= ${(curP * dur).toFixed(1)}s)`;
          this.showToast(`📍 Captured t=${curP}`);
        });
      }

      if (el.qbTime) {
        el.qbTime.addEventListener('input', () => {
          const curP = parseFloat(el.qbTime.value) || 0;
          const dur = this.engine.durationSec || 10;
          if (el.qbTimeSeconds) el.qbTimeSeconds.textContent = `(= ${(curP * dur).toFixed(1)}s)`;
        });
      }

      // Visual Checkpoint Builder Ingestion
      if (el.qbBtnInsert) {
        el.qbBtnInsert.addEventListener('click', () => {
          const tVal = parseFloat(el.qbTime ? el.qbTime.value : '0.5') || 0.5;
          const title = (el.qbTitle && el.qbTitle.value.trim()) || 'Concept Check';
          const prompt = (el.qbPrompt && el.qbPrompt.value.trim()) || '';
          if (!prompt) {
            this.showToast('⚠️ Please enter a question prompt');
            return;
          }

          const optInputs = [
            document.getElementById('qb-opt-0'),
            document.getElementById('qb-opt-1'),
            document.getElementById('qb-opt-2'),
            document.getElementById('qb-opt-3'),
          ];
          const options = optInputs.map(inp => inp ? inp.value.trim() : '').filter(Boolean);
          if (options.length < 2) {
            this.showToast('⚠️ Please enter at least 2 answer options');
            return;
          }

          const correctRadio = document.querySelector('input[name="qb-opt-correct"]:checked');
          const answerIdx = correctRadio ? parseInt(correctRadio.value, 10) : 0;
          const explanation = (el.qbExplanation && el.qbExplanation.value.trim()) || '';

          const newCp = {
            t: Math.min(1.0, Math.max(0.0, tVal)),
            title: title,
            prompt: prompt,
            options: options,
            answer: Math.min(options.length - 1, answerIdx),
            explanation: explanation
          };

          if (!this.engine.scene) this.engine.scene = {};
          if (!this.engine.scene.interactive) {
            this.engine.scene.interactive = { checkpoints: [], hotspots: [] };
          }
          if (!Array.isArray(this.engine.scene.interactive.checkpoints)) {
            this.engine.scene.interactive.checkpoints = [];
          }

          this.engine.scene.interactive.checkpoints.push(newCp);
          this.engine.scene.interactive.checkpoints.sort((a, b) => a.t - b.t);

          this.completedCheckpoints.delete(this.engine.scene.interactive.checkpoints.length - 1);
          this.renderQuizBuilderExistingList();
          this.playChime(784, 'triangle');
          this.showToast(`🎯 Injected Checkpoint at ${(newCp.t * 100).toFixed(0)}%!`);

          if (global.ASTSlideScriptCompiler && el.devEditorSlideScript) {
            el.devEditorSlideScript.value = global.ASTSlideScriptCompiler.toSlideScript(this.engine.scene);
          }
        });
      }

      if (el.btnStudioReset) {
        el.btnStudioReset.addEventListener('click', () => {
          this.engine.loadScene(this.engine.activePresetId, this.engine.isPlaying);
          setTimeout(() => {
            if (el.devEditorSvg) el.devEditorSvg.value = this.engine.getStageSvgSnapshot();
            if (el.devEditorAst) el.devEditorAst.value = this.engine.getCurrentAstSource();
            this.showToast('↺ Preset Reset');
          }, 150);
        });
      }

      if (el.btnStudioExport) {
        el.btnStudioExport.addEventListener('click', () => {
          const cleanSvg = this.engine.getStageSvgSnapshot();
          const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.engine.activePresetId || 'scene'}-export.svg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          this.showToast('💾 Clean Vector SVG Exported');
        });
      }

      if (el.btnStudioExportSpa) {
        el.btnStudioExportSpa.addEventListener('click', () => {
          this.downloadStandaloneSvgApplet();
        });
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

      // WebRTC P2P Mesh & AI Link Controls
      if (el.btnWebRtcLink) {
        el.btnWebRtcLink.addEventListener('click', () => {
          this.toggleWebRtcDrawer();
        });
      }

      if (el.webrtcDrawerClose) {
        el.webrtcDrawerClose.addEventListener('click', () => {
          this.closeWebRtcDrawer();
        });
      }

      if (el.btnWebRtcLoopback) {
        el.btnWebRtcLoopback.addEventListener('click', async () => {
          if (!window.AST_WEBRTC) {
            window.AST_WEBRTC = new window.ASTWebRTCBus(this.engine);
          }
          const bus = window.AST_WEBRTC;
          this.showToast('⚡ Connecting Local On-Device AI Loopback...');
          const ok = await bus.initLoopback();
          if (ok) {
            this.updateWebRtcStatusUI(true, 'loopback_ai');
            this.showToast('✅ WebRTC Local Loopback Online');
            if (el.webrtcAiOutput) {
              el.webrtcAiOutput.replaceChildren(
                '✨ ',
                this._h('strong', { text: 'Loopback Bus Active' }),
                ' (0 ms UDP). Chrome Prompt API & Gemini Nano linked.'
              );
            }
          }
        });
      }

      if (el.btnWebRtcCreateOffer) {
        el.btnWebRtcCreateOffer.addEventListener('click', async () => {
          if (!window.AST_WEBRTC) {
            window.AST_WEBRTC = new window.ASTWebRTCBus(this.engine);
          }
          const bus = window.AST_WEBRTC;
          this.showToast('📡 Gathering ICE candidates for Host Room...');
          try {
            const token = await bus.createRoomOffer();
            if (el.webrtcExchangeArea && el.webrtcTokenBox) {
              el.webrtcExchangeArea.style.display = 'flex';
              if (el.webrtcExchangeLabel) el.webrtcExchangeLabel.textContent = 'Room Offer Token (Share with follower):';
              el.webrtcTokenBox.value = token;
              this.updateWebRtcStatusUI(true, 'host');
              this.showToast('📋 Room Offer Token Ready — copy to share');
            }
          } catch (err) {
            this.showToast('⚠️ Failed to generate room offer: ' + err.message);
          }
        });
      }

      if (el.btnWebRtcJoinRoom) {
        el.btnWebRtcJoinRoom.addEventListener('click', () => {
          if (el.webrtcExchangeArea && el.webrtcTokenBox) {
            el.webrtcExchangeArea.style.display = 'flex';
            if (el.webrtcExchangeLabel) el.webrtcExchangeLabel.textContent = 'Paste Host Room Token below:';
            el.webrtcTokenBox.value = '';
            el.webrtcTokenBox.focus();
            this.showToast('🔗 Paste host token and click Connect Peer');
          }
        });
      }

      if (el.btnWebRtcCopyToken) {
        el.btnWebRtcCopyToken.addEventListener('click', () => {
          if (el.webrtcTokenBox && el.webrtcTokenBox.value) {
            navigator.clipboard.writeText(el.webrtcTokenBox.value).then(() => {
              this.showToast('✓ Token Copied to Clipboard!');
            }).catch(() => {});
          }
        });
      }

      if (el.btnWebRtcConfirmToken) {
        el.btnWebRtcConfirmToken.addEventListener('click', async () => {
          if (!window.AST_WEBRTC) {
            window.AST_WEBRTC = new window.ASTWebRTCBus(this.engine);
          }
          const bus = window.AST_WEBRTC;
          const rawToken = el.webrtcTokenBox ? el.webrtcTokenBox.value.trim() : '';
          if (!rawToken) {
            this.showToast('⚠️ Please paste a connection token first');
            return;
          }
          try {
            if (bus.role === 'host') {
              // Consume client's answer
              await bus.completeHandshake(rawToken);
              this.updateWebRtcStatusUI(true, 'host');
              this.showToast('🎉 Peer Handshake Complete! Broadcasting master clock.');
            } else {
              // Join as client and generate answer
              const answer = await bus.acceptOfferAndCreateAnswer(rawToken);
              if (el.webrtcExchangeLabel) el.webrtcExchangeLabel.textContent = 'Send this Answer Token back to Host:';
              el.webrtcTokenBox.value = answer;
              this.updateWebRtcStatusUI(true, 'follower');
              this.showToast('📋 Answer token generated! Share back with host.');
            }
          } catch (err) {
            this.showToast('⚠️ Handshake error: ' + err.message);
          }
        });
      }

      // Edge AI Query input
      if (el.btnWebRtcAiAsk && el.webrtcAiInput) {
        if (!window.AST_WEBRTC) {
          window.AST_WEBRTC = new window.ASTWebRTCBus(this.engine);
          const bus = window.AST_WEBRTC;
          
          // Register listeners once on the bus lifecycle
          bus.on('aiToken', ({ token }) => {
            if (el.webrtcAiOutput) el.webrtcAiOutput.textContent += token;
          });
          bus.on('aiComplete', ({ fullText }) => {
            if (el.webrtcAiOutput) {
              el.webrtcAiOutput.replaceChildren(
                '🤖 ',
                this._h('strong', { text: 'Tutor:' }),
                ` ${fullText}`
              );
            }
          });
        }

        const askAiFn = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          const query = el.webrtcAiInput.value.trim();
          if (!query) return;

          if (el.webrtcAiOutput) {
            el.webrtcAiOutput.replaceChildren(
              this._h('span', { className: 'ai-dot-pulse' }),
              ' ',
              this._h('em', { text: 'Gemini Nano is evaluating...' })
            );
          }
          
          window.AST_WEBRTC.processAiPrompt(query);
          el.webrtcAiInput.value = '';
        };

        el.btnWebRtcAiAsk.addEventListener('click', askAiFn);
        el.webrtcAiInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            askAiFn(e);
          }
        });
      }

      if (el.btnObsLink) {
        el.btnObsLink.addEventListener('click', () => {
          this.toggleObsDrawer();
        });
      }

      if (el.obsDrawerClose) {
        el.obsDrawerClose.addEventListener('click', () => {
          this.closeObsDrawer();
        });
      }

      if (el.btnObsConnect) {
        el.btnObsConnect.addEventListener('click', () => {
          if (!this.obs) return;
          const url = el.obsInputUrl ? el.obsInputUrl.value.trim() : 'ws://127.0.0.1:4455';
          const pass = el.obsInputPassword ? el.obsInputPassword.value : '';
          this.obs.saveSettings({ url, password: pass });
          this.obs.connect(url, pass);
        });
      }

      if (el.btnObsDisconnect) {
        el.btnObsDisconnect.addEventListener('click', () => {
          if (this.obs) this.obs.disconnect();
          this.updateObsStatusUI(false, false);
          this.showToast('OBS Disconnected');
        });
      }

      if (el.obsToggleRecord) {
        el.obsToggleRecord.addEventListener('change', (e) => {
          if (this.obs) this.obs.saveSettings({ syncRecording: e.target.checked });
        });
      }

      if (el.obsToggleSubtitles) {
        el.obsToggleSubtitles.addEventListener('change', (e) => {
          if (this.obs) this.obs.saveSettings({ syncSubtitles: e.target.checked });
        });
      }

      if (el.obsInputSource) {
        el.obsInputSource.addEventListener('change', (e) => {
          if (this.obs) this.obs.saveSettings({ subtitleSource: e.target.value.trim() });
        });
      }

      if (el.obsToggleTransparent) {
        el.obsToggleTransparent.addEventListener('change', (e) => {
          const isTransparent = e.target.checked;
          document.body.classList.toggle('obs-transparent', isTransparent);
          if (this.obs) this.obs.saveSettings({ transparent: isTransparent });
          this.showToast(isTransparent ? 'Transparent Backdrop (OBS Mode) Active' : 'Standard Backdrop Restored');
        });
      }

      if (el.obsSelectScene) {
        el.obsSelectScene.addEventListener('change', (e) => {
          if (this.obs && e.target.value) {
            this.obs.switchScene(e.target.value);
          }
        });
      }

      if (el.btnObsRecordToggle) {
        el.btnObsRecordToggle.addEventListener('click', () => {
          if (!this.obs) return;
          if (this.obs.isRecording) {
            this.obs.stopRecord();
          } else {
            this.obs.startRecord();
          }
        });
      }

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
        badge.textContent = shortCode ? `🛡️ ${shortCode}` : '🛡️ Official';
        badge.title = info.badgeTooltip || `Official Signed Cartridge • Seal: ${info.shortHash}`;
      } else if (info.status === 'tampered') {
        badge.classList.add('modified');
        badge.textContent = shortCode ? `✎ ${shortCode}` : '✎ Modified';
        badge.title = info.badgeTooltip || `Modified / Remixed Cartridge • Live SHA-256: ${info.shortHash}`;
      } else {
        badge.classList.add('community');
        badge.textContent = '◈ Custom';
        badge.title = info.badgeTooltip || `Community / Unregistered Cartridge • SHA-256: ${info.shortHash}`;
      }
    }

    // --- Step-by-Step Didactic Mode & Clicker Navigation Methods ---

    toggleStepMode(force) {
      this.stepMode = force !== undefined ? Boolean(force) : !this.stepMode;
      if (this.elements.btnStepMode) {
        this.elements.btnStepMode.classList.toggle('active', this.stepMode);
      }
      if (this.stepMode) {
        this.targetStop = null;
        this.engine.pause();
        this.updateHeaderPlayUI(false);
        this.playChime(659.25, 'triangle');
        this.showToast('👣 Clicker / Step Mode ON (Space / Next / Clicker)');
      } else {
        this.targetStop = null;
        this.showToast('▶ Continuous Playback Mode');
      }
    }

    getLessonStops() {
      const scene = this.engine.scene;
      if (!scene) return [0, 1];
      const set = new Set([0]);
      if (Array.isArray(scene.keyframes)) {
        scene.keyframes.forEach(kf => set.add(Number(kf.t.toFixed(3))));
      }
      if (scene.interactive && Array.isArray(scene.interactive.checkpoints)) {
        scene.interactive.checkpoints.forEach(cp => set.add(Number(cp.t.toFixed(3))));
      }
      set.add(1.0);
      return Array.from(set).sort((a, b) => a - b);
    }

    stepToNextKeyframe() {
      const stops = this.getLessonStops();
      const curT = this.engine.progress;
      const nextStop = stops.find(s => s > curT + 0.015);
      if (nextStop !== undefined) {
        this.targetStop = null;
        this.engine.pause();
        this.engine.seek(nextStop);
        this.onStopReached(nextStop);
        this.updateHeaderPlayUI(false);
      } else {
        this.showToast('🏁 End of Lesson Slides');
      }
    }

    stepToPrevKeyframe() {
      const stops = this.getLessonStops();
      const curT = this.engine.progress;
      const prevStops = stops.filter(s => s < curT - 0.02);
      this.targetStop = null;
      this.engine.pause();
      this.updateHeaderPlayUI(false);
      if (prevStops.length > 0) {
        const prevStop = prevStops[prevStops.length - 1];
        this.engine.seek(prevStop);
        this.onStopReached(prevStop);
      } else {
        this.engine.seek(0);
        this.onStopReached(0);
      }
    }

    onStopReached(t) {
      const scene = this.engine.scene;
      if (!scene) return;
      const kf = (scene.keyframes || []).find(k => Math.abs(k.t - t) < 0.035);
      const cp = (scene.interactive && scene.interactive.checkpoints || []).find(c => Math.abs(c.t - t) < 0.035);

      this.playChime(784, 'triangle');
      if (cp) {
        this.showToast(`🎯 Challenge: ${cp.title}`);
      } else if (kf) {
        this.showToast(`📍 ${kf.title}`);
      } else {
        this.showToast(`Step at ${Math.round(t * 100)}%`);
      }
    }

    startQuestMode() {
      const missions = this.getSceneQuestMissions();
      if (!this.elements.questDrawer || missions.length === 0) return;
      const qCfg = this.getSceneQuestsConfig();
      this.questState.active = true;
      this.questState.tourRunId = (this.questState.tourRunId || 1) + 1;
      this.elements.questDrawer.classList.remove('hidden');
      this.engine.pause();
      this.showToast(`🎮 ${(qCfg && qCfg.title) || 'Interactive Explorer Quest Started!'}`);
      this.playChime(659.25, 'triangle');
      this.renderCurrentMission();
    }

    renderCurrentMission() {
      if (!this.elements.questBody || !this.elements.questScore) return;
      const qCfg = this.getSceneQuestsConfig();
      const missions = this.getSceneQuestMissions();
      const idx = this.questState.missionIndex;
      const total = missions.length;

      this.elements.questScore.textContent = `⭐ ${this.questState.completedMissions.size}/${total} Stars • ${this.questState.score} Pts`;

      if (idx >= total) {
        this.elements.questBody.replaceChildren(
          this._h('div', { css: 'text-align: center; padding: 12px 6px;' },
            this._h('div', { css: 'font-size: 28px; margin-bottom: 6px;', text: '🏆 ⭐' }),
            this._h('div', {
              className: 'quest-mission-title',
              css: 'color: #facc15; font-size: 15px;',
              text: (qCfg && qCfg.completionTitle) || 'QUEST COMPLETE!'
            }),
            this._h('div', {
              className: 'quest-mission-desc',
              css: 'margin: 8px 0 14px 0;',
              text: (qCfg && qCfg.completionDesc) || 'Congratulations! You have completed all guided missions in this scene.'
            }),
            this._h('div', { css: 'display: flex; justify-content: center; gap: 8px;' },
              this._h('button', { type: 'button', className: 'quest-action-btn', id: 'quest-replay-btn', text: '🔄 Play Again' }),
              this._h('button', { type: 'button', className: 'quest-action-btn', id: 'quest-finish-btn', css: 'background:#059669; border-color:#10b981;', text: '✓ Complete Quest' })
            )
          )
        );
        const replayBtn = document.getElementById('quest-replay-btn');
        if (replayBtn) {
          replayBtn.addEventListener('click', () => {
            this.questState.missionIndex = 0;
            this.questState.score = 0;
            this.questState.completedMissions.clear();
            this.questState.tourRunId = (this.questState.tourRunId || 1) + 1;
            this.renderCurrentMission();
          });
        }
        const finishBtn = document.getElementById('quest-finish-btn');
        if (finishBtn) finishBtn.addEventListener('click', () => this.closeQuestMode());
        return;
      }

      const m = missions[idx];

      if (m.cam) {
        this.engine.cameraOrbit.yawOffset = m.cam.yaw;
        this.engine.cameraOrbit.pitchOffset = m.cam.pitch;
        this.engine.cameraOrbit.distanceScale = m.cam.scale;
        this.engine.seek(m.targetT);
        this.engine.applyBindings(m.targetT);
        this.update3DStatus();
      }

      // Pick question from pool and shuffle options dynamically for current tour run
      if (!m.activeQuestion || m._lastTourRunId !== this.questState.tourRunId) {
        const pool = m.questionPool || [{
          question: m.question,
          options: m.options,
          correct: m.correct,
          explanation: m.explanation
        }];
        const selected = pool[Math.floor(Math.random() * pool.length)];

        // Shuffle options so correct answer is NOT always in the same position
        const correctText = selected.options[selected.correct];
        const shuffledOpts = [...selected.options];
        for (let i = shuffledOpts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOpts[i], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[i]];
        }
        const newCorrect = shuffledOpts.indexOf(correctText);

        m.activeQuestion = {
          id: m.id,
          question: selected.question,
          options: shuffledOpts,
          correct: newCorrect,
          explanation: selected.explanation
        };
        m._lastTourRunId = this.questState.tourRunId;
      }

      const q = m.activeQuestion;

      this.elements.questBody.replaceChildren(
        this._h('div', { className: 'quest-mission-title', text: m.title }),
        this._h('div', { className: 'quest-mission-desc', text: m.desc }),
        this._h('div', { css: 'font-weight: 700; font-size: 12px; color: #f8fafc; margin-bottom: 6px;', text: q.question }),
        this._h('div', { className: 'quest-options-grid' },
          ...q.options.map((opt, optIdx) =>
            this._h('button', { type: 'button', className: 'quest-option-btn', attrs: { 'data-opt': optIdx }, text: opt })
          )
        )
      );

      const optionBtns = this.elements.questBody.querySelectorAll('.quest-option-btn');
      optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const optIdx = parseInt(e.currentTarget.getAttribute('data-opt'), 10);
          this.checkMissionAnswer(m, q, optIdx, optionBtns);
        });
      });
    }

    checkMissionAnswer(mission, activeQ, selectedIdx, optionBtns) {
      const qCfg = this.getSceneQuestsConfig();
      const missions = this.getSceneQuestMissions();
      const isCorrect = selectedIdx === activeQ.correct;
      optionBtns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === activeQ.correct) {
          btn.classList.add('correct');
        } else if (i === selectedIdx) {
          btn.classList.add('incorrect');
        }
      });

      if (isCorrect) {
        this.playChime(784, 'triangle');
        if (!this.questState.completedMissions.has(mission.id)) {
          this.questState.score += 100;
          this.questState.completedMissions.add(mission.id);
        }
        this.showToast((qCfg && qCfg.correctToast) || '⭐ Correct! +100 Points');
      } else {
        this.playChime(220, 'sawtooth');
        this.showToast((qCfg && qCfg.wrongToast) || 'Notice: Review the key insight below');
      }

      this.elements.questScore.textContent = `⭐ ${this.questState.completedMissions.size}/${missions.length} Stars • ${this.questState.score} Pts`;

      const feedbackDiv = document.createElement('div');
      feedbackDiv.style.marginTop = '10px';
      feedbackDiv.style.padding = '8px 12px';
      feedbackDiv.style.borderRadius = '8px';
      feedbackDiv.style.background = isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      feedbackDiv.style.border = isCorrect ? '1px solid #10b981' : '1px solid #ef4444';
      feedbackDiv.style.fontSize = '11px';
      feedbackDiv.style.lineHeight = '1.4';
      feedbackDiv.replaceChildren(
        this._h('div', {
          css: `font-weight: 700; color: ${isCorrect ? '#34d399' : '#f87171'}; margin-bottom: 4px;`,
          text: isCorrect ? '✓ Well answered!' : ((qCfg && qCfg.feedbackWrong) || 'Key Insight:')
        }),
        this._h('div', { css: 'color: #e2e8f0; margin-bottom: 8px;', text: activeQ.explanation }),
        this._h('button', {
          type: 'button',
          className: 'quest-action-btn',
          id: 'btn-next-mission',
          text: this.questState.missionIndex + 1 < missions.length ? 'Next Mission ➜' : 'View Results 🏆'
        })
      );
      this.elements.questBody.appendChild(feedbackDiv);

      const nextBtn = document.getElementById('btn-next-mission');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.questState.missionIndex++;
          this.renderCurrentMission();
        });
      }
    }

    closeQuestMode() {
      if (this.elements.questDrawer) {
        this.elements.questDrawer.classList.add('hidden');
      }
      this.questState.active = false;
    }

    // --- Developer Inspector & Live Studio Methods ---

    setDevMode(enabled) {
      this.devModeActive = Boolean(enabled);
      const stage = this.elements.playerStage || this.elements.stageSvg;
      if (stage) {
        stage.classList.toggle('dev-mode-active', this.devModeActive);
      }
      if (this.elements.btnDevMode) {
        this.elements.btnDevMode.classList.toggle('active', this.devModeActive);
      }
      if (!this.devModeActive) {
        if (this.elements.devHoverBox) this.elements.devHoverBox.classList.add('hidden');
        if (this.elements.devHoverTooltip) this.elements.devHoverTooltip.classList.add('hidden');
        if (this.elements.devSelectBox) this.elements.devSelectBox.classList.add('hidden');
        this.closeInspectorDrawer();
      }
      this.showToast(this.devModeActive ? '🛠️ Inspector Mode: Click SVG node to inspect' : '🛠️ Inspector Mode: OFF');
      this.engine.notifyParent({
        type: 'DEV_MODE_CHANGED',
        enabled: this.devModeActive
      });
    }

    toggleDevMode() {
      this.setDevMode(!this.devModeActive);
    }

    updateDevHover(targetNode, e) {
      if (!this.elements.devHoverBox || !this.elements.devHoverTooltip || !this.elements.stageSvg) return;
      try {
        const svg = this.elements.stageSvg;
        const bbox = targetNode.getBBox ? targetNode.getBBox() : targetNode.getBoundingClientRect();
        
        this.elements.devHoverBox.setAttribute('x', bbox.x);
        this.elements.devHoverBox.setAttribute('y', bbox.y);
        this.elements.devHoverBox.setAttribute('width', Math.max(4, bbox.width));
        this.elements.devHoverBox.setAttribute('height', Math.max(4, bbox.height));
        this.elements.devHoverBox.classList.remove('hidden');

        const stageRect = svg.getBoundingClientRect();
        const tooltipX = Math.min(stageRect.width - 220, Math.max(10, e.clientX - stageRect.left + 14));
        const tooltipY = Math.min(stageRect.height - 40, Math.max(10, e.clientY - stageRect.top + 14));
        this.elements.devHoverTooltip.style.left = `${tooltipX}px`;
        this.elements.devHoverTooltip.style.top = `${tooltipY}px`;

        const tag = targetNode.tagName.toLowerCase();
        const idStr = targetNode.id ? `#${targetNode.id}` : '';
        const fill = targetNode.getAttribute('fill') || targetNode.style.fill || '';
        const stroke = targetNode.getAttribute('stroke') || targetNode.style.stroke || '';
        this.elements.devHoverTooltip.replaceChildren(
          this._h('strong', { text: `<${tag}${idStr}>` }),
          ` [${Math.round(bbox.width)}×${Math.round(bbox.height)}]${fill ? ' • fill:' + fill : ''}${stroke ? ' • strk:' + stroke : ''}`
        );
        this.elements.devHoverTooltip.classList.remove('hidden');
      } catch (_) {}
    }

    selectElement(node) {
      if (!node) return;
      this.selectedElement = node;
      this.selectedElementSelector = this.getSelectorForElement(node);

      this.playChime(660, 'triangle');
      this.refreshSelectBox();

      const el = this.elements;
      if (el.devInspectedTag) {
        el.devInspectedTag.textContent = `<${node.tagName.toLowerCase()}${node.id ? ' #' + node.id : ''}>`;
      }
      if (el.devInspectedSel) {
        el.devInspectedSel.textContent = this.selectedElementSelector;
      }

      let bbox = { x: 0, y: 0, width: 0, height: 0 };
      try {
        bbox = node.getBBox ? node.getBBox() : node.getBoundingClientRect();
      } catch (_) {}

      if (el.devPropXy) el.devPropXy.value = `x: ${Math.round(bbox.x)}, y: ${Math.round(bbox.y)}`;
      if (el.devPropWh) el.devPropWh.value = `w: ${Math.round(bbox.width)}, h: ${Math.round(bbox.height)}`;

      const curFill = node.getAttribute('fill') || node.style.fill || '#ffffff';
      const curStroke = node.getAttribute('stroke') || node.style.stroke || 'none';
      const curStrokeW = node.getAttribute('stroke-width') || node.style.strokeWidth || '1';
      const curOpacity = node.getAttribute('opacity') || node.style.opacity || '1';
      const curTransform = node.getAttribute('transform') || '';

      if (el.devPropFill) el.devPropFill.value = curFill;
      if (el.devColorFill) el.devColorFill.value = curFill.startsWith('#') && curFill.length === 7 ? curFill : '#38bdf8';

      if (el.devPropStroke) el.devPropStroke.value = curStroke;
      if (el.devColorStroke) el.devColorStroke.value = curStroke.startsWith('#') && curStroke.length === 7 ? curStroke : '#0284c7';

      if (el.devPropStrokew) el.devPropStrokew.value = curStrokeW;
      if (el.devRangeOpacity) el.devRangeOpacity.value = curOpacity;
      if (el.devValOpacity) el.devValOpacity.textContent = parseFloat(curOpacity).toFixed(2);
      if (el.devPropTransform) el.devPropTransform.value = curTransform;

      // Active AST bindings query
      if (el.devActiveBindings) {
        const rawBindings = (this.engine.scene && this.engine.scene.rawBindings) || [];
        const matched = rawBindings.filter(b => {
          if (!b.target) return false;
          if (node.id && b.target === `#${node.id}`) return true;
          return b.target === this.selectedElementSelector;
        });

        if (matched.length) {
          el.devActiveBindings.replaceChildren(
            ...matched.map(m =>
              this._h('div', { css: 'margin-bottom:4px; padding:3px 6px; background:#090d16; border-radius:4px; border:1px solid #1e293b;' },
                this._h('span', { css: 'color:#38bdf8; font-weight:700;', text: `:${m.attr || m.type}` }),
                ' ',
                this._h('span', { css: 'color:#94a3b8; font-size:10px;', text: m.expr || '(3D projection)' })
              )
            )
          );
        } else {
          el.devActiveBindings.replaceChildren(
            this._h('span', { css: 'color:#64748b;', text: 'No mathematical AST bindings attached.' })
          );
        }
      }

      if (el.devInspectorDrawer) {
        el.devInspectorDrawer.classList.remove('hidden');
      }

      this.engine.notifyParent({
        type: 'DEV_ELEMENT_SELECTED',
        selector: this.selectedElementSelector,
        tag: node.tagName.toLowerCase(),
        id: node.id || '',
        bbox: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
        attributes: {
          fill: curFill,
          stroke: curStroke,
          strokeWidth: curStrokeW,
          opacity: curOpacity,
          transform: curTransform
        }
      });
    }

    refreshSelectBox() {
      if (!this.selectedElement || !this.elements.devSelectBox) return;
      try {
        const bbox = this.selectedElement.getBBox ? this.selectedElement.getBBox() : this.selectedElement.getBoundingClientRect();
        this.elements.devSelectBox.setAttribute('x', bbox.x);
        this.elements.devSelectBox.setAttribute('y', bbox.y);
        this.elements.devSelectBox.setAttribute('width', Math.max(4, bbox.width));
        this.elements.devSelectBox.setAttribute('height', Math.max(4, bbox.height));
        this.elements.devSelectBox.classList.remove('hidden');
      } catch (_) {}
    }

    closeInspectorDrawer() {
      if (this.elements.devInspectorDrawer) {
        this.elements.devInspectorDrawer.classList.add('hidden');
      }
      if (this.elements.devSelectBox) {
        this.elements.devSelectBox.classList.add('hidden');
      }
      this.selectedElement = null;
      this.selectedElementSelector = '';
    }

    getSelectorForElement(node) {
      if (node.id) return `#${node.id}`;
      let path = [];
      let cur = node;
      while (cur && cur.id !== 'scene-root' && cur.tagName.toLowerCase() !== 'svg') {
        let tag = cur.tagName.toLowerCase();
        if (cur.id) {
          path.unshift(`#${cur.id}`);
          break;
        } else {
          let siblingIndex = 1;
          let sib = cur.previousElementSibling;
          while (sib) {
            if (sib.tagName === cur.tagName) siblingIndex++;
            sib = sib.previousElementSibling;
          }
          path.unshift(`${tag}:nth-of-type(${siblingIndex})`);
        }
        cur = cur.parentElement;
      }
      return path.length ? path.join(' > ') : node.tagName.toLowerCase();
    }

    openDevStudio(tab = 'ast') {
      const el = this.elements;
      if (!el.devStudioDrawer) return;

      el.devStudioDrawer.classList.remove('hidden');
      if (el.btnDevStudio) el.btnDevStudio.classList.add('active');

      if (el.devEditorSvg) {
        el.devEditorSvg.value = (typeof this.engine.getCleanCompanionSvg === 'function')
          ? this.engine.getCleanCompanionSvg()
          : this.engine.getStageSvgSnapshot();
      }
      if (el.devEditorAst) {
        el.devEditorAst.value = this.engine.getCurrentAstSource();
      }
      if (el.devEditorSlideScript && global.ASTSlideScriptCompiler && this.engine.scene) {
        el.devEditorSlideScript.value = global.ASTSlideScriptCompiler.toSlideScript(this.engine.scene);
      }

      this.renderStarterTemplates();
      this.switchStudioTab(tab);
      this.refreshAstSvgMatcher();
      this.showToast('💻 Live SVG & AST Code Studio Ready');
    }

    closeDevStudio() {
      if (this.elements.devStudioDrawer) {
        this.elements.devStudioDrawer.classList.add('hidden');
      }
      if (this.elements.btnDevStudio) {
        this.elements.btnDevStudio.classList.remove('active');
      }
    }

    toggleDevStudio() {
      if (this.elements.devStudioDrawer && !this.elements.devStudioDrawer.classList.contains('hidden')) {
        this.closeDevStudio();
      } else {
        this.openDevStudio('ast');
      }
    }

    slugifyCartridgeId(raw) {
      return String(raw || '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'custom-remix';
    }

    extractSvgElementsInfo(svgText) {
      const items = [];
      const seen = new Set();
      const skipIds = new Set(['stage-svg', 'scene-root', 'dev-overlay-root', 'dev-hover-box', 'dev-select-box', 'ast-master-defs', 'slidescript-shapes']);
      if (!svgText || typeof svgText !== 'string') return items;

      const addItem = (id, tag) => {
        if (!id || seen.has(id) || skipIds.has(id)) return;
        seen.add(id);
        items.push({ id, tag: (tag || 'g').toLowerCase() });
      };

      const rx = /<([a-z0-9:-]+)[^>]*\bid=["']([^"']+)["']/gi;
      let m;
      while ((m = rx.exec(svgText)) !== null) {
        addItem(m[2], m[1]);
      }
      return items;
    }

    extractAstTargetsInfo(astText) {
      const targets = [];
      const seen = new Set();
      if (!astText || typeof astText !== 'string') return targets;
      const rx = /:(?:target|selector|label)\s+["']#([a-z0-9_-]+)["']/gi;
      let m;
      while ((m = rx.exec(astText)) !== null) {
        const id = m[1];
        if (!id || seen.has(id)) continue;
        seen.add(id);
        targets.push(id);
      }
      return targets;
    }

    findClosestSvgId(targetId, svgItems) {
      if (!targetId || !svgItems || svgItems.length === 0) return null;
      const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetNorm = norm(targetId);
      let best = null;
      let bestScore = -1;

      for (const item of svgItems) {
        const candNorm = norm(item.id);
        if (!candNorm) continue;
        if (candNorm === targetNorm) return item.id;
        let score = 0;
        if (candNorm.includes(targetNorm) || targetNorm.includes(candNorm)) {
          score += 5;
        }
        const tTokens = String(targetId).toLowerCase().split(/[-_]+/).filter(Boolean);
        const cTokens = item.id.toLowerCase().split(/[-_]+/).filter(Boolean);
        for (const tok of tTokens) {
          if (cTokens.includes(tok)) score += 3;
        }
        if (score > bestScore) {
          bestScore = score;
          best = item.id;
        }
      }
      return bestScore >= 3 ? best : null;
    }

    refreshAstSvgMatcher() {
      const el = this.elements;
      if (!el.matcherBody || !el.matcherSummaryBadge) return;

      const svgText = (el.devEditorSvg && el.devEditorSvg.value) ||
        (this.engine && typeof this.engine.getCleanCompanionSvg === 'function' ? this.engine.getCleanCompanionSvg() : '');
      const astText = (el.devEditorAst && el.devEditorAst.value) ||
        (this.engine && typeof this.engine.getCurrentAstSource === 'function' ? this.engine.getCurrentAstSource() : '');

      const svgItems = this.extractSvgElementsInfo(svgText);
      const svgIdSet = new Set(svgItems.map((i) => i.id));
      const astTargets = this.extractAstTargetsInfo(astText);
      const astTargetSet = new Set(astTargets);

      const matchedCount = astTargets.filter((id) => svgIdSet.has(id)).length;
      const missingTargets = astTargets.filter((id) => !svgIdSet.has(id));

      if (astTargets.length === 0) {
        el.matcherSummaryBadge.replaceChildren(
          this._h('span', { css: 'color:#94a3b8;', text: `${svgItems.length} SVG IDs ready · click one to bind` })
        );
      } else if (missingTargets.length === 0) {
        el.matcherSummaryBadge.replaceChildren(
          this._h('span', { css: 'color:#4ade80; font-weight:700;', text: `✓ ${matchedCount}/${astTargets.length} targets matched` })
        );
      } else {
        el.matcherSummaryBadge.replaceChildren(
          this._h('span', { css: 'color:#fbbf24; font-weight:700;', text: `⚠ ${missingTargets.length} missing in SVG (${matchedCount}/${astTargets.length} OK)` })
        );
      }

      if (el.btnMatcherAutofixAll) {
        el.btnMatcherAutofixAll.style.display = missingTargets.length > 0 ? 'inline-flex' : 'none';
      }

      const targetsSection = this._h('div', null,
        this._h('div', { className: 'matcher-section-label', text: `AST Targets (${astTargets.length})` })
      );
      if (astTargets.length === 0) {
        targetsSection.appendChild(
          this._h('div', { css: 'color:#64748b; font-size:10px; line-height:1.35;' },
            'No ',
            this._h('code', { text: ':target "#id"' }),
            ' rules yet. Click any SVG shape below to animate it.'
          )
        );
      } else {
        astTargets.forEach((id) => {
          const isOk = svgIdSet.has(id);
          const suggestion = isOk ? null : this.findClosestSvgId(id, svgItems);
          const actionRow = this._h('div', { css: 'display:flex; gap:4px; flex-wrap:wrap;' });
          if (isOk) {
            actionRow.appendChild(this._h('button', {
              type: 'button', className: 'dev-btn matcher-hl-btn', attrs: { 'data-id': id },
              css: 'font-size:10px; padding:2px 6px;', text: '👁 Highlight'
            }));
          } else {
            if (suggestion) {
              actionRow.appendChild(this._h('button', {
                type: 'button', className: 'dev-btn primary matcher-remap-btn',
                attrs: { 'data-old': id, 'data-new': suggestion },
                css: 'font-size:10px; padding:2px 6px;', text: `🔗 Match #${suggestion}`
              }));
            }
            actionRow.appendChild(this._h('button', {
              type: 'button', className: 'dev-btn matcher-create-btn', attrs: { 'data-id': id },
              css: 'font-size:10px; padding:2px 6px;', text: '➕ Create Shape'
            }));
          }
          targetsSection.appendChild(
            this._h('div', { className: `matcher-row ${isOk ? 'matched' : 'missing'}` },
              this._h('div', { css: 'display:flex; justify-content:space-between; align-items:center; gap:6px;' },
                this._h('code', { css: `color:${isOk ? '#86efac' : '#fde68a'}; font-weight:700;`, text: `#${id}` }),
                this._h('span', { css: `font-size:10px; font-weight:700; color:${isOk ? '#4ade80' : '#fbbf24'};`, text: isOk ? '✓ SVG' : '⚠ Missing' })
              ),
              actionRow
            )
          );
        });
      }

      const chipGrid = this._h('div', { className: 'matcher-chip-grid' });
      if (svgItems.length === 0) {
        chipGrid.appendChild(
          this._h('div', { css: 'color:#64748b; font-size:10px;' },
            'No ',
            this._h('code', { text: 'id="..."' }),
            ' nodes detected in SVG yet.'
          )
        );
      } else {
        svgItems.slice(0, 48).forEach((item) => {
          const isBound = astTargetSet.has(item.id);
          chipGrid.appendChild(
            this._h('button', {
              type: 'button',
              className: `matcher-svg-chip ${isBound ? 'bound' : ''}`,
              attrs: { 'data-svg-id': item.id },
              title: `<${item.tag} id="${item.id}"> — Click to add AST binding`
            },
              this._h('span', { text: isBound ? '✓' : '＋' }),
              this._h('span', { text: `#${item.id}` })
            )
          );
        });
      }

      el.matcherBody.replaceChildren(
        targetsSection,
        this._h('div', null,
          this._h('div', { className: 'matcher-section-label', text: `SVG Shape IDs (${svgItems.length}) — Click to Bind` }),
          chipGrid
        )
      );

      el.matcherBody.querySelectorAll('.matcher-hl-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.highlightSvgIdOnStage(btn.getAttribute('data-id'));
        });
      });
      el.matcherBody.querySelectorAll('.matcher-remap-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.rewriteAstTargetId(btn.getAttribute('data-old'), btn.getAttribute('data-new'));
        });
      });
      el.matcherBody.querySelectorAll('.matcher-create-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.injectMissingSvgShape(btn.getAttribute('data-id'));
        });
      });
      el.matcherBody.querySelectorAll('.matcher-svg-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-svg-id');
          this.highlightSvgIdOnStage(id);
          this.insertBindingForSvgId(id);
        });
      });
    }

    escapeMatcherHtml(raw) {
      return String(raw || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    highlightSvgIdOnStage(svgId) {
      if (!svgId || typeof document === 'undefined') return;
      const target = document.getElementById(svgId);
      if (!target) return;
      if (typeof this.selectElement === 'function' && this.devModeActive) {
        this.selectElement(target);
        return;
      }
      if (this.elements.devHoverBox && target.getBBox) {
        try {
          const bb = target.getBBox();
          this.elements.devHoverBox.setAttribute('x', bb.x);
          this.elements.devHoverBox.setAttribute('y', bb.y);
          this.elements.devHoverBox.setAttribute('width', Math.max(6, bb.width));
          this.elements.devHoverBox.setAttribute('height', Math.max(6, bb.height));
          this.elements.devHoverBox.classList.remove('hidden');
          setTimeout(() => {
            if (!this.devModeActive && this.elements.devHoverBox) {
              this.elements.devHoverBox.classList.add('hidden');
            }
          }, 1400);
        } catch (_) {}
      }
    }

    insertBindingForSvgId(svgId) {
      const el = this.elements;
      if (!svgId || !el.devEditorAst) return;
      let astText = el.devEditorAst.value || (this.engine ? this.engine.getCurrentAstSource() : '');
      const rule = `(:target "#${svgId}" :attr "opacity" :expr "0.45 + 0.55 * Math.abs(Math.sin(t * Math.PI))")`;

      if (astText.includes(`:target "#${svgId}"`)) {
        this.switchStudioTab('ast');
        const idx = astText.indexOf(`#${svgId}`);
        el.devEditorAst.focus();
        if (idx >= 0 && typeof el.devEditorAst.setSelectionRange === 'function') {
          el.devEditorAst.setSelectionRange(idx, idx + svgId.length + 1);
        }
        this.showToast(`🔍 Found #${svgId} in AST`);
        return;
      }

      if (/\(:bindings\s*\(/i.test(astText)) {
        astText = astText.replace(/(\(:bindings\s*\()/i, `$1\n    ${rule}`);
      } else {
        const lastParen = astText.lastIndexOf(')');
        if (lastParen > 0) {
          astText = `${astText.slice(0, lastParen)}  (:bindings (\n    ${rule}\n  ))\n)`;
        } else {
          astText += `\n(:bindings (\n  ${rule}\n))`;
        }
      }

      el.devEditorAst.value = astText;
      this.engine.hotReloadAst(astText);
      this.switchStudioTab('ast');
      this.refreshAstSvgMatcher();
      this.playChime(740, 'triangle');
      this.showToast(`🔗 Bound #${svgId} in .ast!`);
    }

    rewriteAstTargetId(oldId, newId) {
      const el = this.elements;
      if (!oldId || !newId || !el.devEditorAst) return;
      const astText = el.devEditorAst.value || '';
      const escaped = oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nextAst = astText.replace(new RegExp(`#${escaped}(?=["'\\s)])`, 'g'), `#${newId}`);
      el.devEditorAst.value = nextAst;
      this.engine.hotReloadAst(nextAst);
      this.refreshAstSvgMatcher();
      this.playChime(784, 'triangle');
      this.showToast(`🔗 Remapped #${oldId} → #${newId}`);
    }

    injectMissingSvgShape(missingId) {
      const el = this.elements;
      if (!missingId || !el.devEditorSvg) return;
      let svgText = el.devEditorSvg.value || (typeof this.engine.getCleanCompanionSvg === 'function' ? this.engine.getCleanCompanionSvg() : '');
      if (!svgText.includes('</svg>')) {
        svgText = `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">\n</svg>`;
      }
      const shapeXml = `  <g id="${missingId}">\n    <circle cx="400" cy="240" r="34" fill="#38bdf8" fill-opacity="0.28" stroke="#38bdf8" stroke-width="3" />\n    <text x="400" y="245" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">${missingId}</text>\n  </g>\n`;
      svgText = svgText.replace(/<\/svg>/i, `${shapeXml}</svg>`);
      el.devEditorSvg.value = svgText;
      this.engine.hotReloadSvg(svgText);
      this.refreshAstSvgMatcher();
      this.playChime(659.25, 'triangle');
      this.showToast(`➕ Created <g id="${missingId}"> in SVG`);
    }

    autoFixAllAstSvgMatches() {
      const el = this.elements;
      const svgText = (el.devEditorSvg && el.devEditorSvg.value) || '';
      const astText = (el.devEditorAst && el.devEditorAst.value) || '';
      const svgItems = this.extractSvgElementsInfo(svgText);
      const svgIdSet = new Set(svgItems.map((i) => i.id));
      const missing = this.extractAstTargetsInfo(astText).filter((id) => !svgIdSet.has(id));
      let fixed = 0;

      for (const mId of missing) {
        const currentSvgItems = this.extractSvgElementsInfo(el.devEditorSvg ? el.devEditorSvg.value : '');
        const suggestion = this.findClosestSvgId(mId, currentSvgItems);
        if (suggestion) {
          this.rewriteAstTargetId(mId, suggestion);
        } else {
          this.injectMissingSvgShape(mId);
        }
        fixed++;
      }
      if (fixed > 0) {
        this.showToast(`✨ Auto-matched ${fixed} .ast ↔ .svg target(s)!`);
      }
    }

    requestNanoRemix(promptOverride) {
      const el = this.elements;
      const rawPrompt = (typeof promptOverride === 'string' && promptOverride.trim())
        ? promptOverride.trim()
        : ((el.studioNanoInput && el.studioNanoInput.value.trim()) || '');

      if (!rawPrompt) {
        this.showToast('💬 Type what you want Nano to remix (or click a quick chip)');
        el.studioNanoInput?.focus();
        return;
      }

      const svgText = (el.devEditorSvg && el.devEditorSvg.value) ||
        (typeof this.engine.getCleanCompanionSvg === 'function' ? this.engine.getCleanCompanionSvg() : '');
      const astText = (el.devEditorAst && el.devEditorAst.value) ||
        (typeof this.engine.getCurrentAstSource === 'function' ? this.engine.getCurrentAstSource() : '');

      const svgItems = this.extractSvgElementsInfo(svgText);
      const svgIdSet = new Set(svgItems.map((i) => i.id));
      const astTargets = this.extractAstTargetsInfo(astText);
      const missingTargets = astTargets.filter((id) => !svgIdSet.has(id));

      const requestId = `nano_remix_${Date.now()}`;
      this._activeNanoRemixRequestId = requestId;

      const ctx = {
        requestId,
        sceneId: (this.engine.scene && this.engine.scene.id) || this.engine.activePresetId || 'custom-remix',
        sceneTitle: (this.engine.scene && this.engine.scene.title) || 'Custom Remix',
        stage: (this.engine.scene && this.engine.scene.stage) || 'STEM',
        activeTab: this.activeStudioTab || 'ast',
        selectedSvgId: (this.selectedElement && this.selectedElement.id) || null,
        svgIds: svgItems.slice(0, 40),
        astTargets,
        missingTargets,
        currentAst: astText,
        currentSlideScript: (el.devEditorSlideScript && el.devEditorSlideScript.value) || '',
        currentVars: (this.engine && this.engine.vars) ? { ...this.engine.vars } : {},
        prompt: rawPrompt,
      };

      if (el.btnStudioNanoAsk) {
        el.btnStudioNanoAsk.disabled = true;
        el.btnStudioNanoAsk.textContent = '⏳ Thinking…';
      }
      if (el.studioNanoPreview) {
        el.studioNanoPreview.classList.remove('hidden');
      }
      if (el.studioNanoEnginePill) el.studioNanoEnginePill.textContent = 'NANO';
      if (el.studioNanoExplanation) el.studioNanoExplanation.textContent = 'Inspecting your SVG IDs and AST S-Expression locally…';
      if (el.studioNanoCheckBadge) el.studioNanoCheckBadge.textContent = '';
      if (el.btnStudioNanoApply) el.btnStudioNanoApply.style.display = 'none';

      const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;
      if (isEmbedded) {
        this.engine.notifyParent({ type: 'NANO_REMIX_REQUEST', context: ctx });
        clearTimeout(this._nanoRemixTimeout);
        this._nanoRemixTimeout = setTimeout(() => {
          if (this._activeNanoRemixRequestId === requestId) {
            this.handleNanoRemixResult(this.runStandaloneDeterministicRemix(ctx));
          }
        }, 19000);
      } else {
        this.runStandaloneNanoRemix(ctx).then((proposal) => {
          this.handleNanoRemixResult(proposal);
        });
      }
    }

    async runStandaloneNanoRemix(ctx) {
      try {
        const lm = (typeof window !== 'undefined' && window.LanguageModel) ||
          (typeof globalThis !== 'undefined' && globalThis.LanguageModel);
        if (lm && typeof lm.create === 'function') {
          const session = await lm.create({
            initialPrompts: [{
              role: 'system',
              content: `You are Gemini Nano remixing an AST + SVG school simulation. Valid SVG IDs: ${ctx.svgIds.map((s) => '#' + s.id).join(', ')}. Reply with JSON {"explanation":"...","mode":"patch_ast","nextAst":"(:scene ...)"}`,
            }],
          });
          const raw = await session.prompt(`Request: ${ctx.prompt}\nAST:\n${(ctx.currentAst || '').slice(0, 3200)}`);
          session.destroy?.();
          const m = String(raw || '').match(/\{[\s\S]*\}/);
          if (m) {
            const parsed = JSON.parse(m[0]);
            if (parsed.nextAst && parsed.nextAst.includes('(:scene')) {
              return {
                requestId: ctx.requestId,
                mode: 'patch_ast',
                nextAst: parsed.nextAst,
                explanation: parsed.explanation || 'Gemini Nano proposed an AST remix.',
                engineUsed: 'chrome-builtin-nano',
              };
            }
          }
        }
      } catch (_) {}
      return this.runStandaloneDeterministicRemix(ctx);
    }

    runStandaloneDeterministicRemix(ctx) {
      const targetId = ctx.selectedSvgId || (ctx.svgIds[0] && ctx.svgIds[0].id) || null;
      const baseAst = ctx.currentAst || `(:scene :id "${ctx.sceneId}" :title "${ctx.sceneTitle}" :stage "${ctx.stage}" :duration 10.0 (:bindings ()))`;
      if (/mismatch|fix|broken|missing/i.test(ctx.prompt) && ctx.missingTargets.length > 0) {
        const firstMissing = ctx.missingTargets[0];
        const shapeXml = `  <g id="${firstMissing}">\n    <circle cx="400" cy="240" r="32" fill="#38bdf8" fill-opacity="0.3" stroke="#38bdf8" stroke-width="3" />\n    <text x="400" y="245" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">${firstMissing}</text>\n  </g>\n`;
        return {
          requestId: ctx.requestId,
          mode: 'patch_svg',
          appendSvgXml: shapeXml,
          explanation: `Created missing SVG shape <g id="${firstMissing}"> to match your AST target.`,
          engineUsed: 'deterministic-remix',
        };
      }
      if (targetId) {
        const rule = `(:target "#${targetId}" :attr "transform" :expr "'rotate(' + (t * 360).toFixed(1) + ' 400 240)'")`;
        const nextAst = /\(:bindings\s*\(/i.test(baseAst)
          ? baseAst.replace(/(\(:bindings\s*\()/i, `$1\n    ${rule}`)
          : baseAst.replace(/\)\s*$/, `\n  (:bindings (\n    ${rule}\n  ))\n)`);
        return {
          requestId: ctx.requestId,
          mode: 'patch_ast',
          nextAst,
          explanation: `Added a smooth live animation binding to #${targetId}.`,
          engineUsed: 'deterministic-remix',
        };
      }
      return {
        requestId: ctx.requestId,
        mode: 'advice_only',
        explanation: 'Add an id="..." attribute to an SVG shape first, then ask Nano to animate or bind a slider to it.',
        engineUsed: 'deterministic-remix',
      };
    }

    handleNanoRemixResult(proposal) {
      const el = this.elements;
      if (proposal.requestId && this._activeNanoRemixRequestId && proposal.requestId !== this._activeNanoRemixRequestId) {
        return;
      }
      clearTimeout(this._nanoRemixTimeout);
      this._activeNanoRemixRequestId = null;

      if (el.btnStudioNanoAsk) {
        el.btnStudioNanoAsk.disabled = false;
        el.btnStudioNanoAsk.textContent = '🤖 Ask Nano';
      }
      if (!el.studioNanoPreview) return;

      el.studioNanoPreview.classList.remove('hidden');
      this._pendingNanoProposal = proposal;

      const engineLabel = proposal.engineUsed === 'chrome-builtin-nano'
        ? 'GEMINI NANO'
        : proposal.engineUsed === 'webgpu-webllm'
        ? 'WEBGPU LLM'
        : 'OFFLINE CO-PILOT';
      if (el.studioNanoEnginePill) el.studioNanoEnginePill.textContent = engineLabel;
      if (el.studioNanoExplanation) el.studioNanoExplanation.textContent = proposal.explanation || 'Remix ready.';

      const hasPatch = Boolean(proposal.nextAst || proposal.appendSvgXml);
      if (el.studioNanoCheckBadge) {
        if (hasPatch && typeof proposal.totalTargets === 'number') {
          const missingLen = (proposal.missingAfterPatch || []).length;
          el.studioNanoCheckBadge.style.color = missingLen === 0 ? '#4ade80' : '#fbbf24';
          el.studioNanoCheckBadge.textContent = missingLen === 0
            ? `✓ ${proposal.matchedCount}/${proposal.totalTargets} SVG targets verified`
            : `⚠ ${missingLen} ID(s) can be auto-matched after apply`;
        } else {
          el.studioNanoCheckBadge.textContent = '';
        }
      }

      if (el.btnStudioNanoApply) {
        el.btnStudioNanoApply.style.display = hasPatch ? 'inline-flex' : 'none';
      }
      this.playChime(hasPatch ? 740 : 587, 'triangle');
    }

    applyPendingNanoProposal() {
      const el = this.elements;
      const proposal = this._pendingNanoProposal;
      if (!proposal) return;

      const currentSvg = (el.devEditorSvg && el.devEditorSvg.value) ||
        (typeof this.engine.getCleanCompanionSvg === 'function' ? this.engine.getCleanCompanionSvg() : '');
      const currentAst = (el.devEditorAst && el.devEditorAst.value) ||
        (typeof this.engine.getCurrentAstSource === 'function' ? this.engine.getCurrentAstSource() : '');

      this._lastRemixBackupBeforeNano = {
        svg: currentSvg,
        ast: currentAst,
      };
      if (el.btnStudioNanoUndo) {
        el.btnStudioNanoUndo.classList.remove('hidden');
      }

      let nextSvg = currentSvg;
      if (proposal.appendSvgXml) {
        if (!nextSvg.includes('</svg>')) {
          nextSvg = `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">\n</svg>`;
        }
        nextSvg = nextSvg.replace(/<\/svg>/i, `${proposal.appendSvgXml}\n</svg>`);
        if (el.devEditorSvg) el.devEditorSvg.value = nextSvg;
        this.engine.hotReloadSvg(nextSvg);
      }

      if (proposal.nextAst) {
        if (el.devEditorAst) el.devEditorAst.value = proposal.nextAst;
        this.engine.hotReloadAst(proposal.nextAst);
        if (el.devEditorSlideScript && global.ASTSlideScriptCompiler && this.engine.scene) {
          el.devEditorSlideScript.value = global.ASTSlideScriptCompiler.toSlideScript(this.engine.scene);
        }
        this.switchStudioTab('ast');
      } else if (proposal.appendSvgXml) {
        this.switchStudioTab('svg');
      }

      this.refreshAstSvgMatcher();
      if (el.studioNanoPreview) el.studioNanoPreview.classList.add('hidden');
      this._pendingNanoProposal = null;
      this.playChime(880, 'sine');
      this.showToast('✨ Nano remix applied & running live!');
    }

    undoLastNanoEdit() {
      const el = this.elements;
      const backup = this._lastRemixBackupBeforeNano;
      if (!backup) return;

      if (el.devEditorSvg && backup.svg) {
        el.devEditorSvg.value = backup.svg;
        this.engine.hotReloadSvg(backup.svg);
      }
      if (el.devEditorAst && backup.ast) {
        el.devEditorAst.value = backup.ast;
        this.engine.hotReloadAst(backup.ast);
      }
      this._lastRemixBackupBeforeNano = null;
      if (el.btnStudioNanoUndo) {
        el.btnStudioNanoUndo.classList.add('hidden');
      }
      this.refreshAstSvgMatcher();
      this.playChime(523.25, 'triangle');
      this.showToast('↩ Reverted last Nano remix edit');
    }

    syncSceneIdentityInAst(astText, newId, newTitle) {
      let out = String(astText || '').trim();
      const safeTitle = String(newTitle || newId).replace(/"/g, "'");
      if (!out) {
        return `(:scene :id "${newId}" :title "${safeTitle}" :stage "CUSTOM REMIX" :duration 10.0 (:bindings ()))`;
      }
      if (/:id\s+"[^"]*"/i.test(out)) {
        out = out.replace(/:id\s+"[^"]*"/i, `:id "${newId}"`);
      } else {
        out = out.replace(/\(:scene/i, `(:scene :id "${newId}"`);
      }
      if (/:title\s+"[^"]*"/i.test(out)) {
        out = out.replace(/:title\s+"[^"]*"/i, `:title "${safeTitle}"`);
      } else {
        out = out.replace(/:id\s+"[^"]*"/i, `:id "${newId}" :title "${safeTitle}"`);
      }
      return out;
    }

    openSaveAsBar() {
      const el = this.elements;
      if (!el.studioSaveAsBar) return;
      const baseId = this.slugifyCartridgeId((this.engine.scene && this.engine.scene.id) || this.engine.activePresetId || 'lesson');
      const baseTitle = (this.engine.scene && this.engine.scene.title) || baseId;
      const suggestedTitle = /\(Remix\)$/i.test(baseTitle) ? baseTitle : `${baseTitle} (Remix)`;
      const suggestedId = /-remix$/i.test(baseId) ? `${baseId}-2` : `${baseId}-remix`;

      if (el.remixTitleInput) el.remixTitleInput.value = suggestedTitle;
      if (el.remixIdInput) {
        delete el.remixIdInput.dataset.manualEdit;
        el.remixIdInput.value = suggestedId;
      }
      el.studioSaveAsBar.classList.remove('hidden');
      this.updateRemixPreviewLabel();
      el.remixTitleInput?.focus();
    }

    updateRemixPreviewLabel() {
      const el = this.elements;
      if (!el.remixFilePreview || !el.remixIdInput) return;
      const cleanId = this.slugifyCartridgeId(el.remixIdInput.value || 'my-remix');
      el.remixFilePreview.textContent = `→ ${cleanId}.ast + ${cleanId}.svg`;
    }

    downloadTextFile(filename, content, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 450);
    }

    executeSaveRemixAs(exportMode = 'vault') {
      const el = this.elements;
      const rawTitle = (el.remixTitleInput && el.remixTitleInput.value.trim()) || 'My Custom Remix';
      const newId = this.slugifyCartridgeId((el.remixIdInput && el.remixIdInput.value.trim()) || rawTitle);

      let svgMarkup = (el.devEditorSvg && el.devEditorSvg.value.trim()) ||
        (typeof this.engine.getCleanCompanionSvg === 'function' ? this.engine.getCleanCompanionSvg() : this.engine.getStageSvgSnapshot());
      let astSource = (el.devEditorAst && el.devEditorAst.value.trim()) || this.engine.getCurrentAstSource();

      astSource = this.syncSceneIdentityInAst(astSource, newId, rawTitle);
      if (el.devEditorAst) el.devEditorAst.value = astSource;
      if (el.devEditorSvg) el.devEditorSvg.value = svgMarkup;

      const cartridge = {
        id: newId,
        title: rawTitle,
        stage: (this.engine.scene && this.engine.scene.stage) || 'CUSTOM REMIX',
        type: (this.engine.scene && this.engine.scene.type) || 'Sim',
        category: 'Student Remixes',
        desc: `Student remix forked from ${(this.engine.scene && this.engine.scene.id) || this.engine.activePresetId || 'lesson'}.`,
        icon: '🧪',
        source: 'user',
        svgMarkup,
        astSource,
        updatedAt: Date.now(),
      };

      if (window.ASTSceneRegistry && typeof window.ASTSceneRegistry.register === 'function') {
        window.ASTSceneRegistry.register(newId, {
          id: newId,
          title: rawTitle,
          stage: cartridge.stage,
          svgMarkup,
          astSource,
        });
      }

      this.saveToLocalVault(cartridge);
      if (typeof this.engine.hotReloadSvg === 'function') this.engine.hotReloadSvg(svgMarkup);
      if (typeof this.engine.hotReloadAst === 'function') this.engine.hotReloadAst(astSource);
      this.populatePresets();
      if (el.presetSelector) el.presetSelector.value = newId;

      const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;

      if (exportMode === 'duo') {
        this.downloadTextFile(`${newId}.ast`, astSource, 'text/plain;charset=utf-8');
        setTimeout(() => {
          this.downloadTextFile(`${newId}.svg`, svgMarkup, 'image/svg+xml;charset=utf-8');
        }, 200);
      } else if (exportMode === 'astb' && !isEmbedded) {
        this.downloadStandaloneSvgApplet();
      }

      this.engine.notifyParent({
        type: 'SAVE_REMIX_CARTRIDGE',
        cartridge,
        exportMode,
      });

      if (el.studioSaveAsBar) el.studioSaveAsBar.classList.add('hidden');
      this.playChime(880, 'sine');
      this.showToast(
        exportMode === 'duo'
          ? `📦 Saved Remix & Matched Pair: ${newId}.ast + ${newId}.svg`
          : exportMode === 'astb'
          ? `⚡ Compiling ${newId}.astb…`
          : `💾 Saved Remix to Vault: ${rawTitle}`
      );
    }

    switchStudioTab(tabName) {
      this.activeStudioTab = tabName;
      const el = this.elements;

      const tabBtns = document.querySelectorAll('.dev-tab-btn');
      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
      });

      if (el.devCompilerTab) el.devCompilerTab.style.display = tabName === 'compiler' ? 'flex' : 'none';
      if (el.devQuizbuilderTab) {
        el.devQuizbuilderTab.style.display = tabName === 'quizbuilder' ? 'block' : 'none';
        if (tabName === 'quizbuilder') this.renderQuizBuilderExistingList();
      }
      if (el.devEditorSvg) el.devEditorSvg.style.display = tabName === 'svg' ? 'block' : 'none';
      if (el.devEditorAst) el.devEditorAst.style.display = tabName === 'ast' ? 'block' : 'none';
      if (el.devTemplateTab) el.devTemplateTab.style.display = tabName === 'templates' ? 'grid' : 'none';
    }

    renderQuizBuilderExistingList() {
      const el = this.elements;
      if (!el.qbExistingList) return;
      const scene = this.engine.scene;
      const checkpoints = (scene && scene.interactive && scene.interactive.checkpoints) || [];
      if (checkpoints.length === 0) {
        el.qbExistingList.replaceChildren(
          this._h('div', {
            css: 'font-size:11px; color:#64748b; font-style:italic; padding:6px 0;',
            text: 'No active checkpoints in this slide yet. Build and inject one above!'
          })
        );
        return;
      }
      const dur = this.engine.durationSec || 10;
      el.qbExistingList.replaceChildren(
        ...checkpoints.map((cp, idx) =>
          this._h('div', { className: 'qb-existing-card' },
            this._h('div', { css: 'display:flex; flex-direction:column; gap:2px; flex:1; margin-right:12px;' },
              this._h('div', { css: 'display:flex; align-items:center; gap:6px;' },
                this._h('span', { css: 'font-weight:700; color:#38bdf8;', text: `t=${(cp.t).toFixed(2)} (${(cp.t * dur).toFixed(1)}s)` }),
                this._h('span', { css: 'color:#f8fafc; font-weight:600;', text: cp.title })
              ),
              this._h('div', { css: 'font-size:11px; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;', text: cp.prompt })
            ),
            this._h('div', { css: 'display:flex; gap:6px; align-items:center;' },
              this._h('button', { type: 'button', className: 'dev-btn qb-test-btn', attrs: { 'data-idx': idx }, css: 'font-size:10px; padding:3px 8px;', text: '▶ Test' }),
              this._h('button', { type: 'button', className: 'dev-btn qb-del-btn', attrs: { 'data-idx': idx }, css: 'font-size:10px; padding:3px 8px; color:#f43f5e;', text: '✕ Remove' })
            )
          )
        )
      );

      el.qbExistingList.querySelectorAll('.qb-test-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const cp = checkpoints[idx];
          if (cp) {
            this.engine.seek(cp.t);
            this.triggerCheckpoint(cp, idx);
          }
        });
      });

      el.qbExistingList.querySelectorAll('.qb-del-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          checkpoints.splice(idx, 1);
          this.renderQuizBuilderExistingList();
          this.showToast('🗑️ Checkpoint removed');
        });
      });
    }

    downloadStandaloneSvgApplet() {
      try {
        const appletSvg = this.engine.compileAutonomousSvgApplet();
        if (!appletSvg) {
          this.showToast('⚠️ Could not compile standalone SVG');
          return;
        }
        const blob = new Blob([appletSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.engine.activePresetId || 'scene'}-standalone-applet.svg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.playChime(880, 'sine');
        this.showToast('🚀 Autonomous SVG SPA Exported!');
      } catch (err) {
        console.error('Failed to export standalone SVG applet:', err);
        this.showToast('⚠️ Export failed');
      }
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
      const el = this.elements;
      if (!el.devTemplateTab) return;
      el.devTemplateTab.replaceChildren(
        ...this.starterTemplates.map(tpl =>
          this._h('div', { className: 'dev-template-card', attrs: { 'data-template-id': tpl.id } },
            this._h('div', { className: 'dev-template-title', text: tpl.title }),
            this._h('div', { className: 'dev-template-desc', text: tpl.desc }),
            this._h('button', { type: 'button', className: 'dev-btn primary', css: 'margin-top:8px; width:100%; justify-content:center;', text: 'Load Starter ➜' })
          )
        )
      );

      el.devTemplateTab.querySelectorAll('.dev-template-card').forEach(card => {
        card.addEventListener('click', () => {
          const tplId = card.getAttribute('data-template-id');
          const tpl = this.starterTemplates.find(t => t.id === tplId);
          if (tpl) {
            if (el.devEditorSvg) el.devEditorSvg.value = tpl.svg;
            if (el.devEditorAst) el.devEditorAst.value = tpl.ast;
            this.engine.hotReloadSvg(tpl.svg);
            this.engine.hotReloadAst(tpl.ast);
            this.switchStudioTab('svg');
            this.playChime(784, 'triangle');
            this.showToast(`🚀 Loaded ${tpl.title}`);
          }
        });
      });
    }

    initObsBroadcast() {
      if (typeof window === 'undefined' || !window.OBSBroadcastController) return;
      this.obs = new window.OBSBroadcastController();
      const el = this.elements;
      if (!el.obsDrawer) return;

      // Populate form with saved settings
      if (el.obsInputUrl) el.obsInputUrl.value = this.obs.settings.url || 'ws://127.0.0.1:4455';
      if (el.obsInputPassword) el.obsInputPassword.value = this.obs.settings.password || '';
      if (el.obsToggleRecord) el.obsToggleRecord.checked = Boolean(this.obs.settings.syncRecording);
      if (el.obsToggleSubtitles) el.obsToggleSubtitles.checked = Boolean(this.obs.settings.syncSubtitles);
      if (el.obsInputSource) el.obsInputSource.value = this.obs.settings.subtitleSource || 'LessonSubtitles';
      if (el.obsToggleTransparent) el.obsToggleTransparent.checked = Boolean(this.obs.settings.transparent);

      // Check transparent URL param or setting
      const params = new URLSearchParams(window.location.search);
      if (params.get('transparent') === '1' || params.get('transparent') === 'true' || params.get('obs') === '1' || this.obs.settings.transparent) {
        document.body.classList.add('obs-transparent');
        if (el.obsToggleTransparent) el.obsToggleTransparent.checked = true;
      }

      // OBS Event Listeners
      this.obs.on('connected', (info) => {
        this.updateObsStatusUI(true, false, info.version);
        this.showToast(`📡 OBS Studio Connected (${info.version || 'v5'})`);
        this.playChime(659, 'sine');
      });

      this.obs.on('disconnected', () => {
        this.updateObsStatusUI(false, false);
      });

      this.obs.on('recordingChanged', (data) => {
        this.updateObsStatusUI(this.obs.isConnected, data.isRecording);
      });

      this.obs.on('scenesListReceived', (data) => {
        if (!el.obsSelectScene) return;
        if (typeof el.obsSelectScene.replaceChildren === 'function') el.obsSelectScene.replaceChildren();
        else el.obsSelectScene.textContent = '';
        (data.scenes || []).forEach(sc => {
          const opt = document.createElement('option');
          opt.value = sc;
          opt.textContent = sc;
          if (sc === data.currentScene) opt.selected = true;
          el.obsSelectScene.appendChild(opt);
        });
      });

      this.obs.on('sceneChanged', (sceneName) => {
        if (el.obsSelectScene) el.obsSelectScene.value = sceneName;
      });

      this.obs.on('remoteCommand', (cmd, payload) => {
        switch (cmd) {
          case 'play':
            this.engine.play();
            break;
          case 'pause':
            this.engine.pause();
            break;
          case 'togglePlay':
            this.engine.isPlaying ? this.engine.pause() : this.engine.play();
            break;
          case 'seek':
            if (typeof payload?.progress === 'number') this.engine.seek(payload.progress);
            break;
          case 'next':
            this.engine.step(0.05);
            break;
          case 'prev':
            this.engine.step(-0.05);
            break;
          case 'reset':
            this.engine.seek(0);
            break;
          case 'quiz':
            if (el.btnInteractive) el.btnInteractive.click();
            break;
        }
      });
    }

    updateObsStatusUI(isConnected, isRecording, version) {
      const el = this.elements;
      if (el.obsStatusDot) {
        el.obsStatusDot.className = 'obs-status-dot ' + (isRecording ? 'recording' : (isConnected ? 'connected' : 'disconnected'));
      }
      if (el.obsDrawerBadge) {
        el.obsDrawerBadge.className = 'obs-drawer-badge ' + (isConnected ? 'connected' : 'disconnected');
        el.obsDrawerBadge.textContent = isConnected ? `CONNECTED ${version || ''}` : 'DISCONNECTED';
      }
      if (el.obsLiveControls) {
        el.obsLiveControls.style.display = isConnected ? 'block' : 'none';
      }
      if (el.btnObsRecordToggle) {
        el.btnObsRecordToggle.textContent = isRecording ? '⏹ Stop OBS Recording' : '⏺ Start OBS Recording';
        el.btnObsRecordToggle.className = 'obs-btn ' + (isRecording ? 'danger' : 'primary');
      }
    }

    toggleWebRtcDrawer() {
      const el = this.elements;
      if (!el.webrtcDrawer) return;
      const isHidden = el.webrtcDrawer.classList.contains('hidden');
      if (isHidden) {
        this.closeObsDrawer();
        this.closeSettingsDrawer();
        el.webrtcDrawer.classList.remove('hidden');
        if (el.btnWebRtcLink) el.btnWebRtcLink.classList.add('active');
      } else {
        this.closeWebRtcDrawer();
      }
    }

    closeWebRtcDrawer() {
      const el = this.elements;
      if (el.webrtcDrawer) el.webrtcDrawer.classList.add('hidden');
      if (el.btnWebRtcLink) el.btnWebRtcLink.classList.remove('active');
    }

    updateWebRtcStatusUI(isConnected, role = 'peer') {
      const el = this.elements;
      if (el.webrtcStatusDot) {
        el.webrtcStatusDot.className = 'obs-status-dot ' + (isConnected ? 'connected' : 'disconnected');
        el.webrtcStatusDot.style.background = isConnected ? '#10b981' : '#64748b';
      }
      if (el.webrtcDrawerBadge) {
        el.webrtcDrawerBadge.className = 'obs-drawer-badge ' + (isConnected ? 'connected' : 'disconnected');
        el.webrtcDrawerBadge.textContent = isConnected ? `CONNECTED (${role.toUpperCase()})` : 'DISCONNECTED';
      }
      if (el.webrtcRoleReadout) {
        el.webrtcRoleReadout.textContent = isConnected ? role.toUpperCase() : 'Standalone';
      }
    }

    toggleObsDrawer() {
      const el = this.elements;
      if (!el.obsDrawer) return;
      const isHidden = el.obsDrawer.classList.contains('hidden');
      if (isHidden) {
        el.obsDrawer.classList.remove('hidden');
        if (el.btnObsLink) el.btnObsLink.classList.add('active');
        if (this.obs && this.obs.isConnected) this.obs.refreshScenes();
      } else {
        this.closeObsDrawer();
      }
    }

    closeObsDrawer() {
      const el = this.elements;
      if (el.obsDrawer) el.obsDrawer.classList.add('hidden');
      if (el.btnObsLink) el.btnObsLink.classList.remove('active');
    }

    /**
     * Browser SpeechRecognition Voice Control Integration
     */
    initVoiceRecognition() {
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

    startVoiceCommands() {
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

    stopVoiceCommands() {
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

    toggleVoiceCommands() {
      if (this.isListeningVoice) {
        this.stopVoiceCommands();
      } else {
        this.startVoiceCommands();
      }
    }

    updateVoiceStatusUI(active, text) {
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

    updateVoiceOverlayText(text) {
      const el = this.elements;
      if (el.voiceCmdText) {
        el.voiceCmdText.textContent = text;
      }
    }

    findSceneByVoiceQuery(rawQuery) {
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

    handleVoiceCommand(rawTranscript) {
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
      // 4. Playback Speed
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
      // 5. Sound & Voice Narration
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
      // 6. Declarative 3D Camera Controls & Stops
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
      // 7. Loop & Mode & Fullscreen
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
        // 8. Dynamic Catalog Fallback for bare spoken cartridge titles/topics
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
  }

  global.ASTPlayerUI = ASTPlayerUI;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTPlayerUI };
  }
})(typeof window !== 'undefined' ? window : globalThis);
