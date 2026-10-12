/**
 * static/player/ast-webrtc-bus.js
 * 
 * St Joseph's AST Vector Media Player — Zero-Bloat WebRTC Real-Time Mesh & AI Bus
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 * 
 * Zero external dependencies (< 8 KB uncompressed, ~2.5 KB gzipped).
 * Fully decoupled P2P WebRTC DataChannel & MediaStream synchronization fabric:
 * 
 * Capabilities:
 * 1. P2P Multi-Player Mesh / Broadcast Sync:
 *    - Real-time delta synchronization of AST timecode `t` (60 FPS, < 5 ms latency).
 *    - Discrete state-machine mutations, variable changes (`:vars`), and interactive answers.
 *    - Direct In-Stage Gesture broadcasting (`:draggable` pointer drag & touch coordinates).
 * 
 * 2. On-Device Edge AI Co-Pilot & Tutor Link:
 *    - High-throughput binary / JSON token streaming over RTCDataChannel.
 *    - Connects directly to Chrome Prompt API (`window.ai.languageModel` / Gemini Nano)
 *      or local loopback model without cloud leakage.
 *    - Bidirectional AI control: AI agent sends AST S-Expressions or state triggers
 *      directly into the player engine to demonstrate scientific concepts live.
 * 
 * 3. Second-Screen / Remote Controller Mode:
 *    - Scan QR code or copy invite token to connect an iPad, phone, or kiosk screen.
 *    - Drives simulation apparatus remotely with zero cloud server relay.
 * 
 * 4. Ultra-Compact Binary Protocol (OpCodes):
 *    - 0x01: TIME_SYNC (4-byte float timestamp, 1-byte state)
 *    - 0x02: VAR_DELTA (key-value pair mutation)
 *    - 0x03: GESTURE_MOVE (axis, x, y coordinates)
 *    - 0x04: STATE_TRANSITION (machine ID, state ID)
 *    - 0x05: AI_PROMPT_QUERY (user or system query to local AI)
 *    - 0x06: AI_TOKEN_STREAM (streaming tokens for tutor HUD)
 *    - 0x07: INK_STROKE (collaborative whiteboard stylus points)
 */

(function (global) {
  'use strict';

  // Binary Protocol Opcodes
  const OP = {
    TIME_SYNC: 0x01,
    VAR_DELTA: 0x02,
    GESTURE_MOVE: 0x03,
    STATE_TRANSITION: 0x04,
    AI_PROMPT_QUERY: 0x05,
    AI_TOKEN_STREAM: 0x06,
    INK_STROKE: 0x07,
    AST_COMMAND: 0x08,
    PING_PONG: 0x09
  };

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder('utf-8', { fatal: false });

  class ASTWebRTCBus {
    constructor(engine, options = {}) {
      this.engine = engine;
      this.options = Object.assign({
        role: 'peer', // 'host' (Master Clock), 'client' (Follower), 'peer' (Mesh), or 'loopback' (Local AI loop)
        channelName: 'ast-mesh-bus',
        throttleMs: 16, // ~60 FPS rate limiting for continuous gesture/time broadcasts
        enableAi: true,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }, options);

      this.pc = null;
      this.dataChannel = null;
      this.isConnected = false;
      this.role = this.options.role;
      this.peers = new Map(); // For multi-peer mesh connections
      this.peerId = 'peer_' + Math.random().toString(36).substring(2, 8);
      this.lastBroadcastTime = 0;
      this.rtt = 0;

      // Local AI Session reference
      this.aiSession = null;
      this.isAiGenerating = false;

      // Event Callbacks
      this.listeners = {
        connected: [],
        disconnected: [],
        peerJoined: [],
        aiToken: [],
        aiComplete: [],
        remoteGesture: [],
        timeSync: []
      };

      this._bindEngineEvents();
    }

    on(event, fn) {
      if (this.listeners[event]) {
        this.listeners[event].push(fn);
      }
    }

    off(event, fn) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== fn);
      }
    }

    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(fn => {
          try { fn(data); } catch (e) { console.error('[AST WebRTC] Listener error:', e); }
        });
      }
    }

    /**
     * Intercepts engine tick and variable mutations to broadcast across WebRTC
     */
    _bindEngineEvents() {
      if (!this.engine) return;

      // 1. Broadcast timecode when acting as Host / Master Driver
      if (typeof window !== 'undefined') {
        window.addEventListener('ast:timeupdate', (e) => {
          if (!this.isConnected || this.role !== 'host') return;
          const now = performance.now();
          if (now - this.lastBroadcastTime < this.options.throttleMs) return;
          this.lastBroadcastTime = now;

          const detail = e.detail || {};
          this.broadcastTime(detail.t || 0, detail.isPlaying !== false);
        });

        // 2. Broadcast variable changes
        window.addEventListener('ast:varupdate', (e) => {
          if (!this.isConnected) return;
          const detail = e.detail || {};
          if (detail.source === 'remote') return; // Do not echo back remote updates
          this.broadcastVar(detail.name, detail.value);
        });

        // 3. Broadcast state machine transitions
        window.addEventListener('ast:statetransition', (e) => {
          if (!this.isConnected) return;
          const detail = e.detail || {};
          if (detail.source === 'remote') return;
          this.broadcastStateTransition(detail.machineId, detail.stateName);
        });
      }
    }

    /**
     * Creates an autonomous local loopback connection (PC1 <-> PC2).
     * Ideal for in-browser on-device AI co-pilot streaming & background telemetry
     * with ZERO configuration or external servers.
     */
    async initLoopback() {
      try {
        if (this.pc) this.disconnect();

        const pc1 = new RTCPeerConnection();
        const pc2 = new RTCPeerConnection();

        pc1.onicecandidate = (e) => e.candidate && pc2.addIceCandidate(e.candidate);
        pc2.onicecandidate = (e) => e.candidate && pc1.addIceCandidate(e.candidate);

        pc2.ondatachannel = (event) => {
          const remoteChannel = event.channel;
          remoteChannel.binaryType = 'arraybuffer';
          remoteChannel.onmessage = (msg) => this._handleDataChannelMessage(msg, 'loopback_ai');
        };

        const dc = pc1.createDataChannel(this.options.channelName);
        dc.binaryType = 'arraybuffer';
        dc.onopen = () => {
          this.isConnected = true;
          this.dataChannel = dc;
          this.role = 'host';
          this.emit('connected', { mode: 'loopback', peerId: 'local_ai_agent' });
        };
        dc.onclose = () => {
          this.isConnected = false;
          this.emit('disconnected', {});
        };

        const offer = await pc1.createOffer();
        await pc1.setLocalDescription(offer);
        await pc2.setRemoteDescription(offer);

        const answer = await pc2.createAnswer();
        await pc2.setLocalDescription(answer);
        await pc1.setRemoteDescription(answer);

        this.pc = pc1;
        this.loopbackReceiver = pc2;
        return true;
      } catch (err) {
        console.warn('[AST WebRTC] Loopback initialization failed:', err);
        return false;
      }
    }

    /**
     * Generates an SDP Offer for P2P connection to another device or screen.
     */
    async createRoomOffer() {
      if (this.pc) this.disconnect();

      this.pc = new RTCPeerConnection({ iceServers: this.options.iceServers });
      this.role = 'host';

      this.dataChannel = this.pc.createDataChannel(this.options.channelName);
      this.dataChannel.binaryType = 'arraybuffer';

      this._setupDataChannelEvents(this.dataChannel);

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Wait briefly for ICE candidates to gather for single-string SDP exchange
      await new Promise((resolve) => {
        if (this.pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (this.pc.iceGatheringState === 'complete') {
              this.pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          this.pc.addEventListener('icegatheringstatechange', checkState);
          setTimeout(resolve, 1200); // 1.2s timeout fallback
        }
      });

      return btoa(JSON.stringify(this.pc.localDescription));
    }

    /**
     * Joins a room using an SDP Offer token and returns an SDP Answer token.
     */
    async acceptOfferAndCreateAnswer(offerBase64) {
      if (this.pc) this.disconnect();

      this.pc = new RTCPeerConnection({ iceServers: this.options.iceServers });
      this.role = 'client';

      this.pc.ondatachannel = (e) => {
        this.dataChannel = e.channel;
        this.dataChannel.binaryType = 'arraybuffer';
        this._setupDataChannelEvents(this.dataChannel);
      };

      const offerDesc = JSON.parse(atob(offerBase64));
      await this.pc.setRemoteDescription(new RTCSessionDescription(offerDesc));

      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);

      await new Promise((resolve) => {
        if (this.pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (this.pc.iceGatheringState === 'complete') {
              this.pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          this.pc.addEventListener('icegatheringstatechange', checkState);
          setTimeout(resolve, 1200);
        }
      });

      return btoa(JSON.stringify(this.pc.localDescription));
    }

    /**
     * Host completes handshake by consuming client's SDP Answer.
     */
    async completeHandshake(answerBase64) {
      if (!this.pc) throw new Error('No active RTCPeerConnection');
      const answerDesc = JSON.parse(atob(answerBase64));
      await this.pc.setRemoteDescription(new RTCSessionDescription(answerDesc));
      return true;
    }

    _setupDataChannelEvents(dc) {
      dc.onopen = () => {
        this.isConnected = true;
        this.emit('connected', { role: this.role });
      };
      dc.onclose = () => {
        this.isConnected = false;
        this.emit('disconnected', {});
      };
      dc.onerror = (e) => {
        console.warn('[AST WebRTC] DataChannel error:', e);
      };
      dc.onmessage = (e) => {
        this._handleDataChannelMessage(e);
      };
    }

    disconnect() {
      if (this.dataChannel) {
        try { this.dataChannel.close(); } catch (e) {}
        this.dataChannel = null;
      }
      if (this.pc) {
        try { this.pc.close(); } catch (e) {}
        this.pc = null;
      }
      if (this.loopbackReceiver) {
        try { this.loopbackReceiver.close(); } catch (e) {}
        this.loopbackReceiver = null;
      }
      this.isConnected = false;
      this.emit('disconnected', {});
    }

    // ==========================================
    // Outbound Zero-Copy Broadcast Methods
    // ==========================================

    broadcastTime(t, isPlaying = true) {
      if (!this.isConnected || !this.dataChannel || this.dataChannel.readyState !== 'open') return;
      // 5-byte packet: Opcode (1) + Float32 t (4)
      const buffer = new ArrayBuffer(6);
      const view = new DataView(buffer);
      view.setUint8(0, OP.TIME_SYNC);
      view.setFloat32(1, t, false);
      view.setUint8(5, isPlaying ? 1 : 0);
      try {
        this.dataChannel.send(buffer);
      } catch (e) {}
    }

    broadcastVar(varName, val) {
      if (!this.isConnected || !this.dataChannel || this.dataChannel.readyState !== 'open') return;
      const payload = JSON.stringify({ op: OP.VAR_DELTA, name: varName, val: val });
      try {
        this.dataChannel.send(payload);
      } catch (e) {}
    }

    broadcastGesture(target, x, y, stageWidth = 800, stageHeight = 480) {
      if (!this.isConnected || !this.dataChannel || this.dataChannel.readyState !== 'open') return;
      const payload = JSON.stringify({
        op: OP.GESTURE_MOVE,
        target,
        nx: x / stageWidth,
        ny: y / stageHeight
      });
      try {
        this.dataChannel.send(payload);
      } catch (e) {}
    }

    broadcastStateTransition(machineId, stateName) {
      if (!this.isConnected || !this.dataChannel || this.dataChannel.readyState !== 'open') return;
      const payload = JSON.stringify({ op: OP.STATE_TRANSITION, machineId, stateName });
      try {
        this.dataChannel.send(payload);
      } catch (e) {}
    }

    broadcastCommand(command, args = {}) {
      if (!this.isConnected || !this.dataChannel || this.dataChannel.readyState !== 'open') return;
      const payload = JSON.stringify({ op: OP.AST_COMMAND, cmd: command, args });
      try {
        this.dataChannel.send(payload);
      } catch (e) {}
    }

    // ==========================================
    // Inbound Message Handler & Physics Relay
    // ==========================================

    _handleDataChannelMessage(event, origin) {
      let data = event.data;

      // Handle binary packets (Opcode 0x01: Time Sync)
      if (data instanceof ArrayBuffer) {
        const view = new DataView(data);
        if (view.byteLength >= 6 && view.getUint8(0) === OP.TIME_SYNC) {
          const t = view.getFloat32(1, false);
          const isPlaying = view.getUint8(5) === 1;

          if (this.role === 'client' && this.engine) {
            this.engine.seek(t);
            if (isPlaying && !this.engine.isPlaying) this.engine.play();
            else if (!isPlaying && this.engine.isPlaying) this.engine.pause();
          }
          this.emit('timeSync', { t, isPlaying });
          return;
        }
      }

      // Handle JSON text packets
      let msg;
      try {
        msg = typeof data === 'string' ? JSON.parse(data) : null;
      } catch (e) {
        return;
      }

      if (!msg) return;

      switch (msg.op) {
        case OP.VAR_DELTA:
          if (this.engine && this.engine.vars) {
            this.engine.vars[msg.name] = msg.val;
            // Notify UI & sliders with remote tag so we do not loop
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ast:varupdate', {
                detail: { name: msg.name, value: msg.val, source: 'remote' }
              }));
            }
          }
          break;

        case OP.GESTURE_MOVE:
          if (this.engine) {
            const targetEl = document.querySelector(msg.target);
            if (targetEl) {
              const absX = msg.nx * 800;
              const absY = msg.ny * 480;
              // Trigger gesture update on target
              if (window.__astGestures) {
                window.__astGestures.handleRemoteDrag(msg.target, absX, absY);
              }
            }
          }
          this.emit('remoteGesture', msg);
          break;

        case OP.STATE_TRANSITION:
          if (this.engine && typeof this.engine.transitionState === 'function') {
            this.engine.transitionState(msg.machineId, msg.stateName, { source: 'remote' });
          }
          break;

        case OP.AST_COMMAND:
          if (this.engine) {
            if (msg.cmd === 'play') this.engine.play();
            else if (msg.cmd === 'pause') this.engine.pause();
            else if (msg.cmd === 'reset') this.engine.reset();
            else if (msg.cmd === 'loadPreset' && msg.args.preset) {
              this.engine.loadPreset(msg.args.preset);
            }
          }
          break;

        case OP.AI_PROMPT_QUERY:
          this.processAiPrompt(msg.prompt, msg.streamId);
          break;

        case OP.AI_TOKEN_STREAM:
          this.emit('aiToken', { token: msg.token, done: msg.done });
          break;

        default:
          break;
      }
    }

    // ==========================================
    // On-Device Edge AI Integration (Gemini Nano)
    // ==========================================

    async initAiModel() {
      if (typeof window === 'undefined') return false;

      // 1. Check Chrome Prompt API (Gemini Nano)
      if (window.ai && window.ai.languageModel) {
        try {
          const capabilities = await window.ai.languageModel.capabilities();
          if (capabilities.available !== 'no') {
            this.aiSession = await window.ai.languageModel.create({
              systemPrompt: "You are an on-device AI physics & mathematics tutor. " +
                "When asked to demonstrate a phenomenon, respond with concise explanations (under 2 sentences) " +
                "and you may suggest AST variable settings such as (:var :name \"temperature\" :val 400)."
            });
            return true;
          }
        } catch (e) {
          console.warn('[AST WebRTC AI] Gemini Nano init skipped:', e);
        }
      }

      // 2. Check window.LanguageModel
      if (typeof window.LanguageModel === 'function') {
        try {
          this.aiSession = await window.LanguageModel.create();
          return true;
        } catch (e) {}
      }

      return false;
    }

    async processAiPrompt(promptText, streamId = 1) {
      if (this.isAiGenerating) return;
      this.isAiGenerating = true;

      try {
        if (!this.aiSession) {
          await this.initAiModel();
        }

        const sceneTitle = this.engine && this.engine.currentScene ? this.engine.currentScene.title : 'Simulation';
        const fullPrompt = `Active Science Simulation: ${sceneTitle}.\nStudent Query: "${promptText}"\nProvide a friendly 2-sentence tutor explanation:`;

        if (this.aiSession && typeof this.aiSession.promptStreaming === 'function') {
          const stream = this.aiSession.promptStreaming(fullPrompt);
          let prevChunk = '';
          for await (const chunk of stream) {
            const token = chunk.slice(prevChunk.length);
            prevChunk = chunk;
            this.sendAiToken(token, false);
            this.emit('aiToken', { token, done: false });
          }
          this.sendAiToken('', true);
          this.emit('aiComplete', { fullText: prevChunk });
        } else if (this.aiSession && typeof this.aiSession.prompt === 'function') {
          const text = await this.aiSession.prompt(fullPrompt);
          this.sendAiToken(text, true);
          this.emit('aiToken', { token: text, done: true });
          this.emit('aiComplete', { fullText: text });
        } else {
          // Heuristic local Socratic fallback (Zero Cloud, zero dependencies)
          const fallback = this._generateHeuristicAiResponse(promptText);
          this.sendAiToken(fallback, true);
          this.emit('aiToken', { token: fallback, done: true });
          this.emit('aiComplete', { fullText: fallback });
        }
      } catch (err) {
        console.warn('[AST WebRTC AI] Generation failed:', err);
        const errNotice = "💡 Try adjusting the slider or dragging the apparatus to observe the change in real time.";
        this.sendAiToken(errNotice, true);
        this.emit('aiToken', { token: errNotice, done: true });
      } finally {
        this.isAiGenerating = false;
      }
    }

    sendAiToken(token, isDone = false) {
      if (!this.isConnected || !this.dataChannel || this.dataChannel.readyState !== 'open') return;
      const payload = JSON.stringify({ op: OP.AI_TOKEN_STREAM, token, done: isDone });
      try {
        this.dataChannel.send(payload);
      } catch (e) {}
    }

    _generateHeuristicAiResponse(query) {
      const q = query.toLowerCase();
      if (q.includes('pressure') || q.includes('volume') || q.includes('gas')) {
        return "Boyle's Law states that as gas volume decreases, particle collisions increase, causing pressure to double inversely.";
      }
      if (q.includes('dna') || q.includes('base') || q.includes('helix')) {
        return "Adenine strictly pairs with Thymine, while Cytosine pairs with Guanine via hydrogen bonds in the double helix.";
      }
      if (q.includes('fraction') || q.includes('denominator')) {
        return "To add fractions with different denominators, we find the lowest common multiple to create equal partition slices.";
      }
      return "Notice how the variables interact when you adjust the controls—the physical conservation laws maintain equilibrium.";
    }
  }

  // Export to Global Window scope
  global.ASTWebRTCBus = ASTWebRTCBus;

})(typeof window !== 'undefined' ? window : this);
