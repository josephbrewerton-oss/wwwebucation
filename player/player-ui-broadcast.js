/**
 * static/player/player-ui-broadcast.js
 *
 * St Joseph's AST Vector Media Player — OBS Studio WebSocket & WebRTC Classroom Beacon Drawers
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTPlayerUI.
 * Zero external dependencies; loaded before player-ui.js.
 * All methods execute with `this` bound to the ASTPlayerUI instance.
 */

(function (global) {
  'use strict';

  function bindBroadcastDOMEvents() {
    if (this._broadcastEventsBound) return;
    this._broadcastEventsBound = true;
    const el = this.elements;

    // WebRTC P2P Mesh & AI Link Controls
    if (el.btnWebRtcLink && !this._broadcastLazyTriggersBound) {
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

    // OBS Studio WebSocket Drawer Controls
    if (el.btnObsLink && !this._broadcastLazyTriggersBound) {
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
  }

  function initObsBroadcast() {
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

  function updateObsStatusUI(isConnected, isRecording, version) {
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

  function toggleWebRtcDrawer() {
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

  function closeWebRtcDrawer() {
    const el = this.elements;
    if (el.webrtcDrawer) el.webrtcDrawer.classList.add('hidden');
    if (el.btnWebRtcLink) el.btnWebRtcLink.classList.remove('active');
  }

  function updateWebRtcStatusUI(isConnected, role = 'peer') {
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

  function toggleObsDrawer() {
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

  function closeObsDrawer() {
    const el = this.elements;
    if (el.obsDrawer) el.obsDrawer.classList.add('hidden');
    if (el.btnObsLink) el.btnObsLink.classList.remove('active');
  }

  const ASTPlayerUIBroadcast = {
    bindBroadcastDOMEvents,
    initObsBroadcast,
    updateObsStatusUI,
    toggleWebRtcDrawer,
    closeWebRtcDrawer,
    updateWebRtcStatusUI,
    toggleObsDrawer,
    closeObsDrawer,
  };

  global.ASTPlayerUIBroadcast = ASTPlayerUIBroadcast;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIBroadcast = ASTPlayerUIBroadcast;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTPlayerUIBroadcast;
  }
})(typeof window !== 'undefined' ? window : globalThis);
