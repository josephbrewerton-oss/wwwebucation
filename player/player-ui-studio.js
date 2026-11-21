/**
 * static/player/player-ui-studio.js
 *
 * St Joseph's AST Vector Media Player — Developer Inspector, AST↔SVG Matcher,
 * Live Studio, Nano Remix Co-Pilot, Quiz Builder & Starter Templates Peer Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 */

(function (global) {
  'use strict';

  const DEFAULT_STARTER_TEMPLATES = [
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

  function bindStudioDOMEvents(stage) {
    const el = this.elements;

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
  }

  function setDevMode(enabled) {
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

  function toggleDevMode() {
    this.setDevMode(!this.devModeActive);
  }

  function updateDevHover(targetNode, e) {
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

  function selectElement(node) {
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

  function refreshSelectBox() {
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

  function closeInspectorDrawer() {
    if (this.elements.devInspectorDrawer) {
      this.elements.devInspectorDrawer.classList.add('hidden');
    }
    if (this.elements.devSelectBox) {
      this.elements.devSelectBox.classList.add('hidden');
    }
    this.selectedElement = null;
    this.selectedElementSelector = '';
  }

  function getSelectorForElement(node) {
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

  function openDevStudio(tab = 'ast') {
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

  function closeDevStudio() {
    if (this.elements.devStudioDrawer) {
      this.elements.devStudioDrawer.classList.add('hidden');
    }
    if (this.elements.btnDevStudio) {
      this.elements.btnDevStudio.classList.remove('active');
    }
  }

  function toggleDevStudio() {
    if (this.elements.devStudioDrawer && !this.elements.devStudioDrawer.classList.contains('hidden')) {
      this.closeDevStudio();
    } else {
      this.openDevStudio('ast');
    }
  }

  function slugifyCartridgeId(raw) {
    return String(raw || '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'custom-remix';
  }

  function extractSvgElementsInfo(svgText) {
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

  function extractAstTargetsInfo(astText) {
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

  function findClosestSvgId(targetId, svgItems) {
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

  function refreshAstSvgMatcher() {
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

  function escapeMatcherHtml(raw) {
    return String(raw || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlightSvgIdOnStage(svgId) {
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

  function insertBindingForSvgId(svgId) {
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

  function rewriteAstTargetId(oldId, newId) {
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

  function injectMissingSvgShape(missingId) {
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

  function autoFixAllAstSvgMatches() {
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

  function requestNanoRemix(promptOverride) {
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

  async function runStandaloneNanoRemix(ctx) {
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

  function runStandaloneDeterministicRemix(ctx) {
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

  function handleNanoRemixResult(proposal) {
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

  function applyPendingNanoProposal() {
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

  function undoLastNanoEdit() {
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

  function syncSceneIdentityInAst(astText, newId, newTitle) {
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

  function openSaveAsBar() {
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

  function updateRemixPreviewLabel() {
    const el = this.elements;
    if (!el.remixFilePreview || !el.remixIdInput) return;
    const cleanId = this.slugifyCartridgeId(el.remixIdInput.value || 'my-remix');
    el.remixFilePreview.textContent = `→ ${cleanId}.ast + ${cleanId}.svg`;
  }

  function downloadTextFile(filename, content, mimeType) {
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

  function executeSaveRemixAs(exportMode = 'vault') {
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

  function switchStudioTab(tabName) {
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

  function renderQuizBuilderExistingList() {
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

  function downloadStandaloneSvgApplet() {
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

  function renderStarterTemplates() {
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

  const ASTPlayerUIStudio = {
    DEFAULT_STARTER_TEMPLATES,
    bindStudioDOMEvents,
    setDevMode,
    toggleDevMode,
    updateDevHover,
    selectElement,
    refreshSelectBox,
    closeInspectorDrawer,
    getSelectorForElement,
    openDevStudio,
    closeDevStudio,
    toggleDevStudio,
    slugifyCartridgeId,
    extractSvgElementsInfo,
    extractAstTargetsInfo,
    findClosestSvgId,
    refreshAstSvgMatcher,
    escapeMatcherHtml,
    highlightSvgIdOnStage,
    insertBindingForSvgId,
    rewriteAstTargetId,
    injectMissingSvgShape,
    autoFixAllAstSvgMatches,
    requestNanoRemix,
    runStandaloneNanoRemix,
    runStandaloneDeterministicRemix,
    handleNanoRemixResult,
    applyPendingNanoProposal,
    undoLastNanoEdit,
    syncSceneIdentityInAst,
    openSaveAsBar,
    updateRemixPreviewLabel,
    downloadTextFile,
    executeSaveRemixAs,
    switchStudioTab,
    renderQuizBuilderExistingList,
    downloadStandaloneSvgApplet,
    renderStarterTemplates,
  };

  global.ASTPlayerUIStudio = ASTPlayerUIStudio;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIStudio = ASTPlayerUIStudio;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTPlayerUIStudio };
  }
})(typeof window !== 'undefined' ? window : globalThis);
