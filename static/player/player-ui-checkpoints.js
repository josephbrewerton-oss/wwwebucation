/**
 * static/player/player-ui-checkpoints.js
 *
 * St Joseph's AST Vector Media Player — Checkpoints, Goals, Jotter CSV, Quest Mode & Didactic Step Clicker
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTPlayerUI.
 * Zero external dependencies; loaded before player-ui.js.
 * All methods execute with `this` bound to the ASTPlayerUI instance.
 */

(function (global) {
  'use strict';

  function minimizeInteractiveCard() {
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

  function restoreInteractiveCard() {
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

  function closeInteractiveCard(resumePlayback = false) {
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

  function toggleCheckpointView() {
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

  function toggleInteractiveMode() {
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

  function setInteractiveMode(enabled) {
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

  function _resolveQuizTargetSelector(checkpoint) {
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

  async function askNanoAboutCheckpoint(checkpoint, index, attemptState = {}) {
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

  function triggerCheckpoint(checkpoint, index) {
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

  function updateGoalCheckpointProgress() {
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

  function handleGoalCheckpointPassed(data) {
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

  function logDataToJotterCsv(forceDownload = false) {
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

  function triggerFirstCheckpoint() {
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

  function checkInteractiveCheckpoints() {
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

  function getSceneQuestsConfig() {
    return (this.engine && this.engine.scene && this.engine.scene.quests) || null;
  }

  function getSceneQuestMissions() {
    const qCfg = this.getSceneQuestsConfig();
    if (qCfg && Array.isArray(qCfg.missions)) return qCfg.missions;
    return Array.isArray(this.questMissions) ? this.questMissions : [];
  }

  // --- Step-by-Step Didactic Mode & Clicker Navigation Methods ---

  function toggleStepMode(force) {
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

  function getLessonStops() {
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

  function stepToNextKeyframe() {
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

  function stepToPrevKeyframe() {
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

  function onStopReached(t) {
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

  // --- Interactive Quest Mode ---

  function startQuestMode() {
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

  function renderCurrentMission() {
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

  function checkMissionAnswer(mission, activeQ, selectedIdx, optionBtns) {
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

  function closeQuestMode() {
    if (this.elements.questDrawer) {
      this.elements.questDrawer.classList.add('hidden');
    }
    this.questState.active = false;
  }

  const ASTPlayerUICheckpoints = {
    minimizeInteractiveCard,
    restoreInteractiveCard,
    closeInteractiveCard,
    toggleCheckpointView,
    toggleInteractiveMode,
    setInteractiveMode,
    _resolveQuizTargetSelector,
    askNanoAboutCheckpoint,
    triggerCheckpoint,
    updateGoalCheckpointProgress,
    handleGoalCheckpointPassed,
    logDataToJotterCsv,
    triggerFirstCheckpoint,
    checkInteractiveCheckpoints,
    getSceneQuestsConfig,
    getSceneQuestMissions,
    toggleStepMode,
    getLessonStops,
    stepToNextKeyframe,
    stepToPrevKeyframe,
    onStopReached,
    startQuestMode,
    renderCurrentMission,
    checkMissionAnswer,
    closeQuestMode,
  };

  global.ASTPlayerUICheckpoints = ASTPlayerUICheckpoints;
  if (typeof window !== 'undefined') {
    window.ASTPlayerUICheckpoints = ASTPlayerUICheckpoints;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTPlayerUICheckpoints;
  }
})(typeof window !== 'undefined' ? window : globalThis);
