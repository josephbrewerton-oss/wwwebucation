/**
 * static/player/player-ui-display.js
 *
 * St Joseph's AST Vector Media Player — Display Presets, Settings Drawer, Accessibility, Theme & PiP
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTPlayerUI.
 * Zero external dependencies; loaded before player-ui.js.
 * All methods execute with `this` bound to the ASTPlayerUI instance.
 */

(function (global) {
  'use strict';

  function bindDisplayDOMEvents() {
    const el = this.elements;

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

    const qualityBtns = [
      { el: el.qualityBtnLow, quality: 'LOW' },
      { el: el.qualityBtnMed, quality: 'MEDIUM' },
      { el: el.qualityBtnHigh, quality: 'HIGH' },
    ];
    qualityBtns.forEach(({ el: qBtn, quality }) => {
      if (qBtn) {
        qBtn.addEventListener('click', () => {
          this.displayConfig.renderQuality = quality;
          if (this.engine && typeof this.engine.setRenderQuality === 'function') {
            this.engine.setRenderQuality(quality);
          }
          this.saveDisplayConfig(this.displayConfig);
          this.syncSettingsDrawerUI();
          this.showToast(`Render Quality: ${quality === 'MEDIUM' ? 'MED' : quality}`);
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
  }

  function setTheme(theme) {
    this.theme = theme === 'dark' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', this.theme);
    if (this.elements.btnTheme) {
      this.elements.btnTheme.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  function toggleBsl(forceState, notify = true) {
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

  function updateBslButton() {
    if (this.elements.btnBsl) {
      this.elements.btnBsl.classList.toggle('active', Boolean(this.bslEnabled));
      const label = this.elements.btnBsl.querySelector('.btn-label');
      if (label) {
        label.textContent = this.bslEnabled ? 'BSL: ON' : 'BSL';
      }
    }
  }

  function initDisplayConfig() {
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

  function getPresetProfile(mode) {
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
      renderQuality: (this.engine && typeof this.engine.getRenderQuality === 'function')
        ? this.engine.getRenderQuality()
        : 'HIGH',
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

  function setDisplayMode(mode) {
    this.displayConfig = this.getPresetProfile(mode);
    this.saveDisplayConfig(this.displayConfig);
    this.applyDisplayConfig(this.displayConfig);
    this.showToast(`Switched to ${mode.toUpperCase()} Mode`);
  }

  function saveDisplayConfig(config) {
    try {
      const _dispStore = typeof globalThis !== 'undefined' ? globalThis.ASTLocalStore : null;
      if (_dispStore) {
        _dispStore.setItem('stj_player_display_config', JSON.stringify(config));
      }
    } catch (e) {}
  }

  function applyDisplayConfig(config) {
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

    if (c.renderQuality && this.engine && typeof this.engine.setRenderQuality === 'function') {
      this.engine.setRenderQuality(c.renderQuality);
    }

    this.syncSettingsDrawerUI();

    // Notify parent wrapper of active configuration
    if (this.engine && typeof this.engine.notifyParent === 'function') {
      this.engine.notifyParent({
        type: 'DISPLAY_CONFIG_CHANGED',
        config: this.displayConfig
      });
    }
  }

  function toggleShortcutsModal() {
    if (!this.elements.shortcutsModal) return;
    this.elements.shortcutsModal.classList.toggle('hidden');
  }

  function closeShortcutsModal() {
    if (!this.elements.shortcutsModal) return;
    this.elements.shortcutsModal.classList.add('hidden');
  }

  function syncSettingsDrawerUI() {
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

    const activeQuality = String(
      c.renderQuality ||
      (this.engine && typeof this.engine.getRenderQuality === 'function' ? this.engine.getRenderQuality() : 'HIGH')
    ).toUpperCase();
    const normQuality = activeQuality === 'LOW' ? 'LOW' : (activeQuality === 'MEDIUM' || activeQuality === 'MED' ? 'MEDIUM' : 'HIGH');
    if (el.qualityBtnLow) el.qualityBtnLow.classList.toggle('active', normQuality === 'LOW');
    if (el.qualityBtnMed) el.qualityBtnMed.classList.toggle('active', normQuality === 'MEDIUM');
    if (el.qualityBtnHigh) el.qualityBtnHigh.classList.toggle('active', normQuality === 'HIGH');
    if (el.qualityModeBadge) el.qualityModeBadge.textContent = normQuality === 'MEDIUM' ? 'MED' : normQuality;
    if (el.qualityHint) {
      el.qualityHint.textContent = normQuality === 'LOW'
        ? 'Max FPS for older Chromebooks/tablets — fast vector strokes, SVG blur/glow filters bypassed.'
        : normQuality === 'MEDIUM'
        ? 'Balanced vector smoothing with full SVG filters & blend layers.'
        : 'Crisp geometric vectors & full SVG glow/shadow filters.';
    }

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

  function toggleStudioPanel(force) {
    if (!this.elements.studioControlPanel) return;
    const willOpen = force !== undefined ? Boolean(force) : this.elements.studioControlPanel.classList.contains('hidden');
    if (willOpen) {
      this.openStudioPanel();
    } else {
      this.closeStudioPanel();
    }
  }

  function openStudioPanel() {
    const panel = this.elements.studioControlPanel;
    const btn = this.elements.btnStudioPanelToggle;
    if (!panel) return;
    panel.classList.remove('hidden');
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeStudioPanel() {
    const panel = this.elements.studioControlPanel;
    const btn = this.elements.btnStudioPanelToggle;
    if (!panel) return;
    panel.classList.add('hidden');
    if (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleSettingsDrawer(force) {
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

  function closeSettingsDrawer() {
    this.toggleSettingsDrawer(false);
  }

  async function togglePictureInPicture() {
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

  const ASTPlayerUIDisplay = {
    bindDisplayDOMEvents,
    setTheme,
    toggleTheme,
    toggleBsl,
    updateBslButton,
    initDisplayConfig,
    getPresetProfile,
    setDisplayMode,
    saveDisplayConfig,
    applyDisplayConfig,
    toggleShortcutsModal,
    closeShortcutsModal,
    syncSettingsDrawerUI,
    toggleStudioPanel,
    openStudioPanel,
    closeStudioPanel,
    toggleSettingsDrawer,
    closeSettingsDrawer,
    togglePictureInPicture,
  };

  global.ASTPlayerUIDisplay = ASTPlayerUIDisplay;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIDisplay = ASTPlayerUIDisplay;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTPlayerUIDisplay;
  }
})(typeof window !== 'undefined' ? window : globalThis);
