/**
 * static/player/ast-exporter.js
 *
 * St Joseph's AST Vector Media Player — SVG Snapshot, Companion Source & Autonomous Applet Exporter
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted verbatim from static/player/ast-engine.js for isolated maintenance:
 * - getStageSvgSnapshot(): Clean DOM snapshot of #stage-svg without dev overlays
 * - getCleanCompanionSvg(): Authoring-grade standalone SVG companion export
 * - getCurrentAstSource(): Serializes active scene metadata, subtitles, keyframes & bindings to .ast
 * - compileAutonomousSvgApplet(): Emits self-contained offline .ast.svg living vector capsule
 */

(function (global) {
  'use strict';

  class ASTExporterMethods {
    getStageSvgSnapshot() {
      if (typeof document === 'undefined') return '';
      const svg = document.getElementById('stage-svg');
      if (!svg) return '';
      const clone = svg.cloneNode(true);
      const devOverlay = clone.querySelector('#dev-overlay-root');
      if (devOverlay) devOverlay.remove();
      return clone.outerHTML;
    }

    getCleanCompanionSvg() {
      if (!this._svgDirtyFromInspector && this.scene && typeof this.scene.svgText === 'string' && this.scene.svgText.trim().startsWith('<svg')) {
        return this.scene.svgText.trim();
      }
      if (typeof document === 'undefined') return '';
      const stage = document.getElementById('stage-svg');
      const sceneRoot = document.getElementById('scene-root');
      const vb = (stage && stage.getAttribute('viewBox')) || this._defaultViewBox || '0 0 800 480';
      if (!sceneRoot) return this.getStageSvgSnapshot();
      const clone = sceneRoot.cloneNode(true);
      clone.querySelectorAll('[data-ast-spotlight]').forEach((node) => {
        node.removeAttribute('data-ast-spotlight');
      });
      const serializer = typeof XMLSerializer !== 'undefined' ? new XMLSerializer() : null;
      const inner = serializer
        ? Array.from(clone.childNodes).map(n => serializer.serializeToString(n)).join('').trim()
        : '';
      return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">\n${inner}\n</svg>`;
    }

    getCurrentAstSource() {
      if (this.scene && this.scene.astSource) return this.scene.astSource;
      if (!this.scene) return '';

      const s = this.scene;
      let ast = `(:scene :id "${s.id || 'custom'}" :title "${s.title || 'Parametric Scene'}" :stage "${s.stage || 'CURRICULUM'}" :duration ${(s.duration || 10.0).toFixed(1)}\n`;

      if (s.subtitles && s.subtitles.length) {
        ast += `  (:subtitles (\n`;
        s.subtitles.forEach(sub => {
          ast += `    (:start ${sub.start.toFixed(2)} :end ${sub.end.toFixed(2)} :en "${sub.en || ''}"${sub.es ? ` :es "${sub.es}"` : ''})\n`;
        });
        ast += `  ))\n`;
      }

      if (s.keyframes && s.keyframes.length) {
        ast += `  (:keyframes (\n`;
        s.keyframes.forEach(kf => {
          ast += `    (:t ${kf.t.toFixed(2)} :title "${kf.title}" :rule "${kf.rule}")\n`;
        });
        ast += `  ))\n`;
      }

      if (s.rawBindings && s.rawBindings.length) {
        ast += `  (:bindings (\n`;
        s.rawBindings.forEach(b => {
          if (b.type === '3d-node') {
            ast += `    (:3d-node :target "${b.target}" :x "${b.x}" :y "${b.y}" :z "${b.z}" :baseR ${b.baseR || 6})\n`;
          } else {
            ast += `    (:target "${b.target}" :attr "${b.attr}" :expr "${b.expr}")\n`;
          }
        });
        ast += `  ))\n`;
      }

      ast += `)\n`;
      return ast;
    }

    compileAutonomousSvgApplet() {
      if (typeof document === 'undefined') return '';
      const stage = document.getElementById('stage-svg');
      if (!stage) return '';

      const clone = stage.cloneNode(true);
      const devOverlay = clone.querySelector('#dev-overlay-root');
      if (devOverlay) devOverlay.remove();

      const serializer = typeof XMLSerializer !== 'undefined' ? new XMLSerializer() : null;
      const innerSvg = serializer
        ? Array.from(clone.childNodes).map(n => serializer.serializeToString(n)).join('')
        : '';
      const sceneId = this.scene?.id || this.activePresetId || 'scene';
      const escXml = (s) => String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      const sceneTitle = escXml(this.scene?.title || 'Interactive Vector Lesson');
      const sceneStage = escXml(this.scene?.stage || 'UK CURRICULUM');
      const duration = this.durationSec || 10.0;
      const subtitles = this.scene?.subtitles || [];
      const keyframes = this.scene?.keyframes || [];
      const rawBindings = this.scene?.rawBindings || [];
      const has3D = this.has3D();
      const camera = this.scene?.camera || { yaw: 0, pitch: 0, distance: 1.0 };
      const checkpoints = (this.scene && this.scene.interactive && Array.isArray(this.scene.interactive.checkpoints))
        ? this.scene.interactive.checkpoints
        : ((this.scene && Array.isArray(this.scene.checkpoints)) ? this.scene.checkpoints : []);

      const manifestData = {
        id: sceneId,
        title: sceneTitle,
        stage: sceneStage,
        duration: duration,
        subtitles: subtitles,
        keyframes: keyframes,
        bindings: rawBindings,
        has3D: has3D,
        camera: camera,
        checkpoints: checkpoints
      };

      const manifestJson = JSON.stringify(manifestData)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/\]\]>/g, ']]\\u003e');

      return `<?xml version="1.0" encoding="UTF-8"?>
  <svg viewBox="0 0 800 560" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs id="ast-master-defs">
      <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="hud-card-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.65" />
      </filter>
      <linearGradient id="hud-bg-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="hud-bar-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>

      <filter id="ast-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="ast-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComponentTransfer in="blur" result="cb">
          <feFuncR type="linear" slope="1.2" />
          <feFuncG type="linear" slope="0.9" />
          <feFuncB type="linear" slope="0.2" />
        </feComponentTransfer>
        <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="ast-glow-red" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="ast-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="ast-glow-purple" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="ast-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.55" />
      </filter>
      <filter id="ast-blur-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" />
      </filter>

      <marker id="ast-arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
      </marker>
      <marker id="ast-arrow-start" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
        <polygon points="8 0, 0 3, 8 6" fill="#38bdf8" />
      </marker>
      <marker id="ast-arrow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
      </marker>
      <marker id="ast-arrow-gold" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
      </marker>
      <marker id="ast-arrow-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
      </marker>
      <marker id="ast-arrow-emerald" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
      </marker>
      <marker id="ast-vector-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#38bdf8" />
      </marker>

      <pattern id="ast-grid-fine" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.5" />
      </pattern>
      <pattern id="ast-grid-dense" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none" />
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1.2" stroke-opacity="0.6" />
        <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#1e293b" stroke-width="0.5" stroke-opacity="0.4" />
      </pattern>
      <pattern id="ast-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#475569" fill-opacity="0.6" />
      </pattern>

      <linearGradient id="ast-grad-cyan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
      <linearGradient id="ast-grad-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
      <linearGradient id="ast-grad-emerald" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#34d399" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>
      <linearGradient id="ast-grad-purple" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c084fc" />
        <stop offset="100%" stop-color="#7c3aed" />
      </linearGradient>
      <linearGradient id="ast-grad-crimson" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f87171" />
        <stop offset="100%" stop-color="#dc2626" />
      </linearGradient>
      <linearGradient id="ast-blueprint-backdrop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#070e1b" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
    </defs>

    <style>
      <![CDATA[
      * { box-sizing: border-box; }
      text { user-select: none; -webkit-user-select: none; }
      .hud-btn { cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease; }
      .hud-btn:hover { filter: brightness(1.25); transform: translateY(-1px); }
      .hud-btn:active { transform: translateY(1px); }
      .quiz-btn { cursor: pointer; transition: filter 0.15s ease; }
      .quiz-btn:hover { filter: brightness(1.2); }
      ]]>
    </style>

    <rect width="800" height="560" fill="url(#hud-bg-grad)" />

    <g id="hud-top-bar">
      <rect x="0" y="0" width="800" height="34" fill="#0b1120e6" stroke="#1e293b" stroke-width="1" />
      <text x="18" y="22" fill="#38bdf8" font-size="12" font-weight="800" font-family="system-ui, -apple-system, sans-serif">${sceneStage} • ${sceneTitle}</text>
      <text x="782" y="22" fill="#64748b" font-size="10" font-weight="700" text-anchor="end" font-family="system-ui, -apple-system, sans-serif">⚡ AUTONOMOUS SVG SPA • ST JOSEPH'S</text>
    </g>

    <g id="scene-stage" transform="translate(0, 30)">
      ${innerSvg}
    </g>

    <g id="hud-subtitle-group" transform="translate(400, 470)">
      <rect id="sub-bg" x="-360" y="-18" width="720" height="36" rx="8" fill="#0f172af0" stroke="#38bdf850" stroke-width="1" />
      <text id="sub-text" x="0" y="5" fill="#f8fafc" font-size="13" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Loading lesson...</text>
    </g>

    <g id="hud-control-bar">
      <rect x="0" y="490" width="800" height="70" fill="url(#hud-bar-grad)" stroke="#1e293b" stroke-width="1.5" />
      
      <rect id="track-bg" x="20" y="500" width="760" height="6" rx="3" fill="#334155" cursor="pointer" />
      <rect id="track-fill" x="20" y="500" width="0" height="6" rx="3" fill="#38bdf8" pointer-events="none" />
      <circle id="track-thumb" cx="20" cy="503" r="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" cursor="pointer" />

      <g id="btn-play" class="hud-btn" transform="translate(20, 516)">
        <rect width="76" height="30" rx="6" fill="#2563eb" />
        <text id="txt-play" x="38" y="20" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">▶ Play</text>
      </g>

      <g id="btn-reset" class="hud-btn" transform="translate(104, 516)">
        <rect width="64" height="30" rx="6" fill="#334155" />
        <text x="32" y="20" fill="#e2e8f0" font-size="12" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">↺ Reset</text>
      </g>

      <g id="btn-prev" class="hud-btn" transform="translate(176, 516)">
        <rect width="32" height="30" rx="6" fill="#1e293b" stroke="#475569" />
        <text x="16" y="20" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">◀</text>
      </g>
      <g id="btn-next" class="hud-btn" transform="translate(214, 516)">
        <rect width="32" height="30" rx="6" fill="#1e293b" stroke="#475569" />
        <text x="16" y="20" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">▶</text>
      </g>

      <text id="txt-time" x="260" y="536" fill="#94a3b8" font-size="12" font-family="ui-monospace, monospace" font-weight="600">00:00 / 00:10</text>

      <g id="btn-speed" class="hud-btn" transform="translate(370, 516)">
        <rect width="48" height="30" rx="6" fill="#1e293b" stroke="#475569" />
        <text id="txt-speed" x="24" y="20" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">1.0x</text>
      </g>

      <g id="btn-voice" class="hud-btn" transform="translate(426, 516)">
        <rect id="bg-voice" width="86" height="30" rx="6" fill="#1e293b" stroke="#475569" />
        <text id="txt-voice" x="43" y="20" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">🎙️ Voice</text>
      </g>

      <g id="btn-quiz" class="hud-btn" transform="translate(520, 516)">
        <rect width="78" height="30" rx="6" fill="#047857" />
        <text x="39" y="20" fill="#ecfdf5" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">🎯 Quiz</text>
      </g>

      <circle cx="700" cy="531" r="4" fill="#22c55e" />
      <text x="710" y="535" fill="#22c55e" font-size="10" font-weight="700" font-family="system-ui, -apple-system, sans-serif">OFFLINE SPA</text>
    </g>

    <g id="quiz-modal" style="display:none;" transform="translate(100, 70)">
      <rect width="600" height="360" rx="16" fill="#0f172af5" stroke="#38bdf8" stroke-width="2" filter="url(#hud-card-shadow)" />
      
      <rect x="0" y="0" width="600" height="50" rx="16" fill="#1e293b" />
      <text x="24" y="32" fill="#38bdf8" font-size="16" font-weight="800" font-family="system-ui, -apple-system, sans-serif">🎯 Socratic Checkpoint</text>
      <text x="576" y="32" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="end" font-family="system-ui, -apple-system, sans-serif">Formative Check</text>

      <text id="quiz-question-txt" x="24" y="85" fill="#f8fafc" font-size="13" font-weight="700" font-family="system-ui, -apple-system, sans-serif">Loading challenge...</text>

      <g id="quiz-opt-0" class="quiz-btn" transform="translate(24, 110)">
        <rect width="552" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <text id="quiz-opt-txt-0" x="16" y="26" fill="#e2e8f0" font-size="12" font-family="system-ui, -apple-system, sans-serif">Option A</text>
      </g>
      <g id="quiz-opt-1" class="quiz-btn" transform="translate(24, 160)">
        <rect width="552" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <text id="quiz-opt-txt-1" x="16" y="26" fill="#e2e8f0" font-size="12" font-family="system-ui, -apple-system, sans-serif">Option B</text>
      </g>
      <g id="quiz-opt-2" class="quiz-btn" transform="translate(24, 210)">
        <rect width="552" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <text id="quiz-opt-txt-2" x="16" y="26" fill="#e2e8f0" font-size="12" font-family="system-ui, -apple-system, sans-serif">Option C</text>
      </g>

      <text id="quiz-feedback-txt" x="24" y="282" fill="#94a3b8" font-size="12" font-weight="600" font-family="system-ui, -apple-system, sans-serif">Select an option to evaluate your understanding.</text>

      <g id="btn-quiz-resume" class="quiz-btn" style="display:none;" transform="translate(456, 305)">
        <rect width="120" height="34" rx="6" fill="#2563eb" />
        <text x="60" y="22" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Resume ▶</text>
      </g>
      <g id="btn-quiz-dismiss" class="quiz-btn" transform="translate(24, 305)">
        <rect width="80" height="34" rx="6" fill="#334155" />
        <text x="40" y="22" fill="#cbd5e1" font-size="12" font-weight="600" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Close ✕</text>
      </g>
    </g>

    <script type="text/javascript">
      <![CDATA[
      (function () {
        'use strict';
        const data = ${manifestJson};
        let isPlaying = false;
        let progress = 0.0;
        let speed = 1.0;
        let voiceEnabled = false;
        let lastTimestamp = null;
        let animId = null;
        let lastSpokenIndex = -1;
        const duration = data.duration || 10.0;

        const elTrackBg = document.getElementById('track-bg');
        const elTrackFill = document.getElementById('track-fill');
        const elTrackThumb = document.getElementById('track-thumb');
        const elBtnPlay = document.getElementById('btn-play');
        const elTxtPlay = document.getElementById('txt-play');
        const elBtnReset = document.getElementById('btn-reset');
        const elBtnPrev = document.getElementById('btn-prev');
        const elBtnNext = document.getElementById('btn-next');
        const elTxtTime = document.getElementById('txt-time');
        const elBtnSpeed = document.getElementById('btn-speed');
        const elTxtSpeed = document.getElementById('txt-speed');
        const elBtnVoice = document.getElementById('btn-voice');
        const elTxtVoice = document.getElementById('txt-voice');
        const elBtnQuiz = document.getElementById('btn-quiz');
        const elSubText = document.getElementById('sub-text');

        const elQuizModal = document.getElementById('quiz-modal');
        const elQuizPrompt = document.getElementById('quiz-question-txt');
        const elQuizFeedback = document.getElementById('quiz-feedback-txt');
        const elBtnQuizResume = document.getElementById('btn-quiz-resume');
        const elBtnQuizDismiss = document.getElementById('btn-quiz-dismiss');

        let activeCheckpoint = null;
        const triggeredCheckpoints = {};

        const AstMath = {
          clamp: (v, min = 0, max = 1) => Math.max(min, Math.min(max, Number(v) || 0)),
          lerp: (a, b, t) => (Number(a) || 0) + ((Number(b) || 0) - (Number(a) || 0)) * (Number(t) || 0),
          map: (val, inMin, inMax, outMin, outMax) => {
            const d = inMax - inMin;
            return Math.abs(d) < 1e-9 ? outMin : outMin + ((val - inMin) / d) * (outMax - outMin);
          },
          rad: (deg) => (Number(deg) || 0) * (Math.PI / 180),
          deg: (rad) => (Number(rad) || 0) * (180 / Math.PI),
          dist: (x1, y1, x2, y2) => Math.hypot((x2 || 0) - (x1 || 0), (y2 || 0) - (y1 || 0)),
          sineWave: (t, freq = 1, amp = 1, phase = 0) => amp * Math.sin(2 * Math.PI * freq * (Number(t) || 0) + phase),
          spring: (t, damp = 6, freq = 15) => Math.exp(-damp * Math.max(0, t)) * Math.cos(freq * Math.max(0, t)),
          step: (edge, x) => (x < edge ? 0 : 1),
          smoothstep: (edge0, edge1, x) => {
            const val = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
            return val * val * (3 - 2 * val);
          },
          translate: (x, y = 0) => 'translate(' + (Number(x) || 0).toFixed(2) + ', ' + (Number(y) || 0).toFixed(2) + ')',
          rotate: (deg, cx, cy) => {
            const d = (Number(deg) || 0).toFixed(2);
            return cx != null && cy != null ? 'rotate(' + d + ' ' + (Number(cx) || 0).toFixed(2) + ' ' + (Number(cy) || 0).toFixed(2) + ')' : 'rotate(' + d + ')';
          },
          scale: (sx, sy) => {
            const x = (Number(sx) || 1).toFixed(3);
            return sy != null ? 'scale(' + x + ', ' + (Number(sy) || 1).toFixed(3) + ')' : 'scale(' + x + ')';
          },
          fixed: (num, decimals = 2) => (Number(num) || 0).toFixed(decimals)
        };
        Object.assign(Math, AstMath);

        function compileSafeStandaloneExpr(raw) {
          const expr = String(raw || '0').trim();
          if (!expr) return () => 0;
          const toks = [];
          let idx = 0;
          while (idx < expr.length) {
            const c = expr[idx];
            if (/\s/.test(c)) { idx++; continue; }
            if (c === '"' || c === "'") {
              const q = c; let s = ''; idx++;
              while (idx < expr.length && expr[idx] !== q) {
                if (expr[idx] === '\\' && idx + 1 < expr.length) { s += expr[idx + 1]; idx += 2; }
                else s += expr[idx++];
              }
              idx++;
              toks.push({ type: 'str', val: s });
              continue;
            }
            if (/\d/.test(c) || (c === '.' && /\d/.test(expr[idx + 1] || ''))) {
              const m = expr.slice(idx).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
              toks.push({ type: 'num', val: Number(m[0]) });
              idx += m[0].length;
              continue;
            }
            const multiOp = expr.slice(idx).match(/^(?:===|!==|==|!=|<=|>=|&&|\|\||\*\*)/);
            if (multiOp) { toks.push({ type: 'op', val: multiOp[0] }); idx += multiOp[0].length; continue; }
            if ('+-*/%()[]?:,.<>!'.includes(c)) { toks.push({ type: 'op', val: c }); idx++; continue; }
            if (/[a-zA-Z_$]/.test(c)) {
              const m = expr.slice(idx).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
              toks.push({ type: 'id', val: m[0] });
              idx += m[0].length;
              continue;
            }
            idx++;
          }
          let p = 0;
          const peek = () => toks[p];
          const eat = (v) => { if (peek() && (!v || peek().val === v)) return toks[p++]; return null; };
          const BAD_PROPS = new Set(['__proto__', 'constructor', 'prototype', 'Function', 'eval']);
          const HELPERS = Object.assign({}, AstMath, { String, Number, Boolean });
          const parseTern = () => {
            const c = parseOr();
            if (eat('?')) { const tb = parseTern(); eat(':'); const fb = parseTern(); return (t) => c(t) ? tb(t) : fb(t); }
            return c;
          };
          const parseOr = () => { let l = parseAnd(); while (eat('||')) { const r = parseAnd(), a = l; l = (t) => a(t) || r(t); } return l; };
          const parseAnd = () => { let l = parseEq(); while (eat('&&')) { const r = parseEq(), a = l; l = (t) => a(t) && r(t); } return l; };
          const parseEq = () => {
            let l = parseRel();
            while (peek() && ['==', '===', '!=', '!=='].includes(peek().val)) {
              const op = eat().val, r = parseRel(), a = l;
              l = (t) => (op[0] === '=' ? a(t) === r(t) : a(t) !== r(t));
            }
            return l;
          };
          const parseRel = () => {
            let l = parseAdd();
            while (peek() && ['<', '<=', '>', '>='].includes(peek().val)) {
              const op = eat().val, r = parseAdd(), a = l;
              l = (t) => { const x = a(t), y = r(t); return op === '<' ? x < y : op === '<=' ? x <= y : op === '>' ? x > y : x >= y; };
            }
            return l;
          };
          const parseAdd = () => {
            let l = parseMul();
            while (peek() && (peek().val === '+' || peek().val === '-')) {
              const op = eat().val, r = parseMul(), a = l;
              l = (t) => (op === '+' ? a(t) + r(t) : a(t) - r(t));
            }
            return l;
          };
          const parseMul = () => {
            let l = parseUnary();
            while (peek() && ['*', '/', '%', '**'].includes(peek().val)) {
              const op = eat().val, r = parseUnary(), a = l;
              l = (t) => (op === '*' ? a(t) * r(t) : op === '/' ? a(t) / r(t) : op === '%' ? a(t) % r(t) : a(t) ** r(t));
            }
            return l;
          };
          const parseUnary = () => {
            if (eat('!')) { const u = parseUnary(); return (t) => !u(t); }
            if (eat('-')) { const u = parseUnary(); return (t) => -u(t); }
            if (eat('+')) { const u = parseUnary(); return (t) => +u(t); }
            return parsePost();
          };
          const parsePost = () => {
            let fn = parsePrim();
            while (peek() && (peek().val === '.' || peek().val === '[')) {
              if (eat('.')) {
                const prop = peek()?.type === 'id' ? eat().val : '';
                if (!prop || BAD_PROPS.has(prop)) {
                  if (eat('(')) { if (!eat(')')) { do { parseTern(); } while (eat(',')); eat(')'); } }
                  fn = () => 0; continue;
                }
                if (eat('(')) {
                  const args = [];
                  if (!eat(')')) { do { args.push(parseTern()); } while (eat(',')); eat(')'); }
                  const recv = fn;
                  fn = (t) => { const o = recv(t); return o && typeof o[prop] === 'function' ? o[prop].apply(o, args.map(a => a(t))) : 0; };
                } else {
                  const recv = fn;
                  fn = (t) => { const o = recv(t); return o == null ? undefined : o[prop]; };
                }
              } else if (eat('[')) {
                const idxFn = parseTern(); eat(']'); const recv = fn;
                fn = (t) => { const o = recv(t), iv = idxFn(t); return (o == null || (typeof iv === 'string' && BAD_PROPS.has(iv))) ? undefined : o[iv]; };
              }
            }
            return fn;
          };
          const parsePrim = () => {
            const tk = peek();
            if (!tk) return () => 0;
            if (eat('(')) { const i = parseTern(); eat(')'); return i; }
            if (eat('[')) {
              const arr = []; if (!eat(']')) { do { arr.push(parseTern()); } while (eat(',')); eat(']'); }
              return (t) => arr.map(f => f(t));
            }
            if (tk.type === 'num' || tk.type === 'str') { eat(); const v = tk.val; return () => v; }
            if (tk.type === 'id') {
              const nm = eat().val;
              if (eat('(')) {
                const args = []; if (!eat(')')) { do { args.push(parseTern()); } while (eat(',')); eat(')'); }
                return (t) => { const f = HELPERS[nm] || Math[nm]; return typeof f === 'function' ? f(...args.map(a => a(t))) : 0; };
              }
              if (nm === 't') return (t) => t;
              if (nm === 'true') return () => true;
              if (nm === 'false') return () => false;
              if (nm === 'null') return () => null;
              if (nm === 'Math') return () => Math;
              return () => 0;
            }
            eat(); return () => 0;
          };
          try { return parseTern(); } catch (_) { return () => 0; }
        }

        const compiledBindings = (data.bindings || []).map(b => {
          if (!b.expr) return null;
          try {
            return {
              target: b.target,
              attr: b.attr,
              fn: compileSafeStandaloneExpr(b.expr)
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);

        function applyBindings(t) {
          for (let i = 0; i < compiledBindings.length; i++) {
            const b = compiledBindings[i];
            const nodes = document.querySelectorAll(b.target);
            if (!nodes || !nodes.length) continue;
            try {
              const val = b.fn(t);
              for (let j = 0; j < nodes.length; j++) {
                const n = nodes[j];
                if (b.attr === 'textContent' || b.attr === 'text') {
                  n.textContent = String(val);
                } else if (b.attr === 'style' || b.attr.startsWith('style.')) {
                  const prop = b.attr.replace(/^style\./, '');
                  n.style[prop] = val;
                } else {
                  n.setAttribute(b.attr, String(val));
                }
              }
            } catch (err) {}
          }

          const curSec = t * duration;
          let foundSub = null;
          let subIdx = -1;
          if (data.subtitles) {
            for (let s = 0; s < data.subtitles.length; s++) {
              const sub = data.subtitles[s];
              if (t >= sub.start && t < sub.end) {
                foundSub = sub.en || sub.text;
                subIdx = s;
                break;
              }
            }
          }
          if (elSubText) elSubText.textContent = foundSub || (data.title + ' • Step ' + Math.ceil(t * 4));

          if (voiceEnabled && 'speechSynthesis' in window && subIdx >= 0 && subIdx !== lastSpokenIndex && foundSub) {
            lastSpokenIndex = subIdx;
            try {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(foundSub);
              u.rate = 1.0;
              window.speechSynthesis.speak(u);
            } catch (e) {}
          }

          if (isPlaying && data.checkpoints && data.checkpoints.length) {
            for (let c = 0; c < data.checkpoints.length; c++) {
              const cp = data.checkpoints[c];
              if (Math.abs(t - cp.t) < 0.025 && !triggeredCheckpoints[c]) {
                triggeredCheckpoints[c] = true;
                showQuizCheckpoint(cp);
                pause();
                break;
              }
            }
          }

          const trackWidth = 760;
          const fillW = Math.max(0, Math.min(trackWidth, t * trackWidth));
          if (elTrackFill) elTrackFill.setAttribute('width', fillW);
          if (elTrackThumb) elTrackThumb.setAttribute('cx', 20 + fillW);

          const sSec = Math.floor(curSec % 60).toString().padStart(2, '0');
          const sMin = Math.floor(curSec / 60).toString().padStart(2, '0');
          const tSec = Math.floor(duration % 60).toString().padStart(2, '0');
          const tMin = Math.floor(duration / 60).toString().padStart(2, '0');
          if (elTxtTime) elTxtTime.textContent = sMin + ':' + sSec + ' / ' + tMin + ':' + tSec;
        }

        function tick(ts) {
        // Resolve profiler across closure/engine scope safely
        const activeProfiler = (typeof profiler !== 'undefined' ? profiler : null) || 
                               (typeof self !== 'undefined' && self.profiler) || 
                               (typeof this !== 'undefined' && this.profiler);

        // 1. Hardware frame delta & compositor jitter tracking
        if (activeProfiler) activeProfiler.onFrame(ts);

        if (!lastTimestamp) lastTimestamp = ts;
        const dt = Math.min(0.1, (ts - lastTimestamp) / 1000);
        lastTimestamp = ts;

        if (isPlaying) {
          // 2. Start AST VM calculation timer
          const t0 = performance.now();

          progress += (dt * speed) / duration;
          if (progress >= 1.0) {
            progress = 1.0;
            pause();
          }
          applyBindings(progress);

          // 3. Record raw compute duration
          if (activeProfiler) activeProfiler.onCompute(performance.now() - t0);
        }

        if (isPlaying) {
          animId = requestAnimationFrame(tick);
        }
      }

        function play() {
          if (progress >= 1.0) progress = 0.0;
          isPlaying = true;
          lastTimestamp = null;
          if (elTxtPlay) elTxtPlay.textContent = '⏸ Pause';
          if (animId) cancelAnimationFrame(animId);
          animId = requestAnimationFrame(tick);
        }

        function pause() {
          isPlaying = false;
          lastTimestamp = null;
          if (elTxtPlay) elTxtPlay.textContent = '▶ Play';
          if (animId) cancelAnimationFrame(animId);
        }

        function seek(p) {
          progress = Math.max(0.0, Math.min(1.0, p));
          applyBindings(progress);
        }

        function showQuizCheckpoint(cp) {
          activeCheckpoint = cp;
          if (!elQuizModal) return;
          elQuizModal.style.display = 'block';
          if (elQuizPrompt) elQuizPrompt.textContent = cp.question;
          if (elQuizFeedback) {
            elQuizFeedback.textContent = '💡 ' + (cp.hint || 'Select an option to evaluate your understanding.');
            elQuizFeedback.setAttribute('fill', '#94a3b8');
          }
          if (elBtnQuizResume) elBtnQuizResume.style.display = 'none';

          const origOpts = cp.options || [];
          const origAns = cp.answerKey !== undefined ? cp.answerKey : (cp.answer !== undefined ? cp.answer : 0);
          const mapped = origOpts.map((text, idx) => ({ text, isCorrect: idx === origAns }));
          for (let i = mapped.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = mapped[i]; mapped[i] = mapped[j]; mapped[j] = t;
          }

          mapped.forEach((item, idx) => {
            const g = document.getElementById('quiz-opt-' + idx);
            const txt = document.getElementById('quiz-opt-txt-' + idx);
            if (g && txt) {
              g.style.display = 'block';
              txt.textContent = String.fromCharCode(65 + idx) + ') ' + item.text;
              const rect = g.querySelector('rect');
              if (rect) {
                rect.setAttribute('fill', '#1e293b');
                rect.setAttribute('stroke', '#334155');
              }
              g.onclick = function () {
                const isCorrect = item.isCorrect;
                if (rect) {
                  rect.setAttribute('fill', isCorrect ? '#064e3b' : '#7f1d1d');
                  rect.setAttribute('stroke', isCorrect ? '#10b981' : '#ef4444');
                }
                if (elQuizFeedback) {
                  elQuizFeedback.textContent = isCorrect
                    ? '✔ Correct! ' + (cp.explanation || 'Mastery confirmed.')
                    : '✘ Misconception: ' + (cp.explanation || 'Review core rule.');
                  elQuizFeedback.setAttribute('fill', isCorrect ? '#34d399' : '#f87171');
                }
                if (elBtnQuizResume) elBtnQuizResume.style.display = 'block';
              };
            }
          });
        }

        if (elBtnPlay) elBtnPlay.onclick = function () { isPlaying ? pause() : play(); };
        if (elBtnReset) elBtnReset.onclick = function () {
          pause();
          for (let k in triggeredCheckpoints) delete triggeredCheckpoints[k];
          seek(0.0);
        };
        if (elBtnPrev) elBtnPrev.onclick = function () { seek(progress - 0.1); };
        if (elBtnNext) elBtnNext.onclick = function () { seek(progress + 0.1); };
        if (elBtnSpeed) elBtnSpeed.onclick = function () {
          const speeds = [0.5, 1.0, 1.5, 2.0];
          const curIdx = speeds.indexOf(speed);
          speed = speeds[(curIdx + 1) % speeds.length];
          if (elTxtSpeed) elTxtSpeed.textContent = speed.toFixed(1) + 'x';
        };
        if (elBtnVoice) elBtnVoice.onclick = function () {
          voiceEnabled = !voiceEnabled;
          const bg = document.getElementById('bg-voice');
          if (bg) bg.setAttribute('fill', voiceEnabled ? '#0284c7' : '#1e293b');
          if (elTxtVoice) elTxtVoice.textContent = voiceEnabled ? '🔊 Voice ON' : '🎙️ Voice';
        };
        if (elBtnQuiz) elBtnQuiz.onclick = function () {
          if (!data.checkpoints || !data.checkpoints.length) return;
          if (elQuizModal && elQuizModal.style.display === 'block') {
            elQuizModal.style.display = 'none';
            return;
          }
          const cp = data.checkpoints[0];
          pause();
          showQuizCheckpoint(cp);
        };
        if (elBtnQuizResume) elBtnQuizResume.onclick = function () {
          if (elQuizModal) elQuizModal.style.display = 'none';
          play();
        };
        if (elBtnQuizDismiss) elBtnQuizDismiss.onclick = function () {
          if (elQuizModal) elQuizModal.style.display = 'none';
        };

        if (elTrackBg) {
          elTrackBg.onclick = function (e) {
            const rect = elTrackBg.getBoundingClientRect();
            const p = (e.clientX - rect.left) / rect.width;
            seek(p);
          };
        }

        window.addEventListener('keydown', function (e) {
          if (e.code === 'Space') { e.preventDefault(); isPlaying ? pause() : play(); }
          else if (e.code === 'ArrowLeft') { e.preventDefault(); seek(progress - 0.05); }
          else if (e.code === 'ArrowRight') { e.preventDefault(); seek(progress + 0.05); }
        });

        applyBindings(0.0);
      })();
      ]]>
    </script>
  </svg>`;
    }
  }

  const ASTExporter = {};
  const _proto = ASTExporterMethods.prototype;
  const _names = Object.getOwnPropertyNames(_proto);
  for (let i = 0; i < _names.length; i++) {
    const _name = _names[i];
    if (_name !== 'constructor') {
      ASTExporter[_name] = _proto[_name];
    }
  }

  global.ASTExporter = ASTExporter;
  if (typeof window !== 'undefined') {
    window.ASTExporter = ASTExporter;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
