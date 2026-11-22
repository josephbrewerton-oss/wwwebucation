/**
 * static/player/player-ui-studio-remix.js
 *
 * St Joseph's AST Vector Media Player — Nano Remix Co-Pilot, Save-As Exporter,
 * Quiz Builder, Studio Tab Switcher & Starter Templates Peer Module (Lazy-Loaded)
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 */

(function (global) {
  'use strict';

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

  const ASTPlayerUIStudioRemix = {
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

  global.ASTPlayerUIStudioRemix = ASTPlayerUIStudioRemix;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIStudioRemix = ASTPlayerUIStudioRemix;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTPlayerUIStudioRemix };
  }
})(typeof window !== 'undefined' ? window : globalThis);
