/**
 * static/player/player-ui-studio-matcher.js
 *
 * St Joseph's AST Vector Media Player — AST↔SVG Target Matcher,
 * ID Normalizer, Auto-Fixer & Stage Highlighter Peer Module (Lazy-Loaded)
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 */

(function (global) {
  'use strict';

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

  const ASTPlayerUIStudioMatcher = {
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
  };

  global.ASTPlayerUIStudioMatcher = ASTPlayerUIStudioMatcher;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUIStudioMatcher = ASTPlayerUIStudioMatcher;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTPlayerUIStudioMatcher };
  }
})(typeof window !== 'undefined' ? window : globalThis);
