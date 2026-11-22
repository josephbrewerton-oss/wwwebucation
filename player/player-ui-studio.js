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
    if (this._studioEventsBound) return;
    this._studioEventsBound = true;
    const el = this.elements;

    // --- Developer Inspector & Live Studio Event Bindings ---
    if (el.btnDevMode && !this._studioLazyTriggersBound) {
      el.btnDevMode.addEventListener('click', () => this.toggleDevMode());
    }

    if (el.btnDevStudio && !this._studioLazyTriggersBound) {
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

  // Peer module resolvers (player-ui-studio-matcher.js & player-ui-studio-remix.js)
  function _getStudioMatcher() {
    return global.ASTPlayerUIStudioMatcher || (typeof window !== 'undefined' && window.ASTPlayerUIStudioMatcher) || null;
  }

  function _getStudioRemix() {
    return global.ASTPlayerUIStudioRemix || (typeof window !== 'undefined' && window.ASTPlayerUIStudioRemix) || null;
  }

  // --- Delegators to ASTPlayerUIStudioMatcher (player-ui-studio-matcher.js) ---
  function slugifyCartridgeId() { const m = _getStudioMatcher(); return m && m.slugifyCartridgeId ? m.slugifyCartridgeId.apply(this, arguments) : 'custom-remix'; }
  function extractSvgElementsInfo() { const m = _getStudioMatcher(); return m && m.extractSvgElementsInfo ? m.extractSvgElementsInfo.apply(this, arguments) : []; }
  function extractAstTargetsInfo() { const m = _getStudioMatcher(); return m && m.extractAstTargetsInfo ? m.extractAstTargetsInfo.apply(this, arguments) : []; }
  function findClosestSvgId() { const m = _getStudioMatcher(); return m && m.findClosestSvgId ? m.findClosestSvgId.apply(this, arguments) : null; }
  function refreshAstSvgMatcher() { const m = _getStudioMatcher(); return m && m.refreshAstSvgMatcher ? m.refreshAstSvgMatcher.apply(this, arguments) : undefined; }
  function escapeMatcherHtml() { const m = _getStudioMatcher(); return m && m.escapeMatcherHtml ? m.escapeMatcherHtml.apply(this, arguments) : ''; }
  function highlightSvgIdOnStage() { const m = _getStudioMatcher(); return m && m.highlightSvgIdOnStage ? m.highlightSvgIdOnStage.apply(this, arguments) : undefined; }
  function insertBindingForSvgId() { const m = _getStudioMatcher(); return m && m.insertBindingForSvgId ? m.insertBindingForSvgId.apply(this, arguments) : undefined; }
  function rewriteAstTargetId() { const m = _getStudioMatcher(); return m && m.rewriteAstTargetId ? m.rewriteAstTargetId.apply(this, arguments) : undefined; }
  function injectMissingSvgShape() { const m = _getStudioMatcher(); return m && m.injectMissingSvgShape ? m.injectMissingSvgShape.apply(this, arguments) : undefined; }
  function autoFixAllAstSvgMatches() { const m = _getStudioMatcher(); return m && m.autoFixAllAstSvgMatches ? m.autoFixAllAstSvgMatches.apply(this, arguments) : undefined; }

  // --- Delegators to ASTPlayerUIStudioRemix (player-ui-studio-remix.js) ---
  function requestNanoRemix() { const m = _getStudioRemix(); return m && m.requestNanoRemix ? m.requestNanoRemix.apply(this, arguments) : undefined; }
  function runStandaloneNanoRemix() { const m = _getStudioRemix(); return m && m.runStandaloneNanoRemix ? m.runStandaloneNanoRemix.apply(this, arguments) : Promise.resolve(null); }
  function runStandaloneDeterministicRemix() { const m = _getStudioRemix(); return m && m.runStandaloneDeterministicRemix ? m.runStandaloneDeterministicRemix.apply(this, arguments) : null; }
  function handleNanoRemixResult() { const m = _getStudioRemix(); return m && m.handleNanoRemixResult ? m.handleNanoRemixResult.apply(this, arguments) : undefined; }
  function applyPendingNanoProposal() { const m = _getStudioRemix(); return m && m.applyPendingNanoProposal ? m.applyPendingNanoProposal.apply(this, arguments) : undefined; }
  function undoLastNanoEdit() { const m = _getStudioRemix(); return m && m.undoLastNanoEdit ? m.undoLastNanoEdit.apply(this, arguments) : undefined; }
  function syncSceneIdentityInAst() { const m = _getStudioRemix(); return m && m.syncSceneIdentityInAst ? m.syncSceneIdentityInAst.apply(this, arguments) : ''; }
  function openSaveAsBar() { const m = _getStudioRemix(); return m && m.openSaveAsBar ? m.openSaveAsBar.apply(this, arguments) : undefined; }
  function updateRemixPreviewLabel() { const m = _getStudioRemix(); return m && m.updateRemixPreviewLabel ? m.updateRemixPreviewLabel.apply(this, arguments) : undefined; }
  function downloadTextFile() { const m = _getStudioRemix(); return m && m.downloadTextFile ? m.downloadTextFile.apply(this, arguments) : undefined; }
  function executeSaveRemixAs() { const m = _getStudioRemix(); return m && m.executeSaveRemixAs ? m.executeSaveRemixAs.apply(this, arguments) : undefined; }
  function switchStudioTab() { const m = _getStudioRemix(); return m && m.switchStudioTab ? m.switchStudioTab.apply(this, arguments) : undefined; }
  function renderQuizBuilderExistingList() { const m = _getStudioRemix(); return m && m.renderQuizBuilderExistingList ? m.renderQuizBuilderExistingList.apply(this, arguments) : undefined; }
  function downloadStandaloneSvgApplet() { const m = _getStudioRemix(); return m && m.downloadStandaloneSvgApplet ? m.downloadStandaloneSvgApplet.apply(this, arguments) : undefined; }
  function renderStarterTemplates() { const m = _getStudioRemix(); return m && m.renderStarterTemplates ? m.renderStarterTemplates.apply(this, arguments) : undefined; }

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
