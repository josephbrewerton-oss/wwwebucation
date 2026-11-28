// src/pages/player/playerMessageBridge.ts
import { getLocalState } from '../../services/localStateStore';
import {
  saveCustomCartridge,
  getCustomCartridges,
  type CartridgeDefinition,
} from '../../services/cartridgeStore';
import type { SwfRuntimeHealthReport } from '../../services/dbStore';
import { setBslEnabled, setVoiceEnabled } from '../../services/bslGlobalStore';
import { dispatchCartridgeSiteDirective } from '../../engine/nanoSiteManager';
import { appendLabCsvToJotter } from '../../services/jotter-db';
import { normalizePresetId } from './playerCatalog';
import type { PlayerTransport } from './playerTransport';
import type { PlayerDrawerController } from './playerDrawerOrchestrator';
import {
  cartridgeNeedsStageKeyForwarding,
  type PlayerDomRefs,
  type PlayerRuntimeState,
} from './playerTypes';

export interface PlayerMessageBridgeHandle {
  isSwfStageInputActive(): boolean;
  dispose(): void;
}

export interface BindPlayerMessageBridgeDeps {
  dom: PlayerDomRefs;
  state: PlayerRuntimeState;
  transport: PlayerTransport;
  drawers: PlayerDrawerController;
  updatePlayButtonUI: (playing: boolean) => void;
  updateBslUi: (enabled: boolean) => void;
  updateHostIntegrityBadge: (presetId: string, liveInfo?: Record<string, any> | null) => void;
  updatePreset: (presetId: string, skipPostMessage?: boolean, pushHistoryIfOpening?: boolean) => void;
  handleUploadedFiles: (files: File[]) => Promise<void>;
  refreshDropdown: () => void;
  renderGrid: () => void;
}

export function bindPlayerMessageBridge(deps: BindPlayerMessageBridgeDeps): PlayerMessageBridgeHandle {
  const {
    dom,
    state,
    transport,
    drawers,
    updatePlayButtonUI,
    updateBslUi,
    updateHostIntegrityBadge,
    updatePreset,
    handleUploadedFiles,
    refreshDropdown,
    renderGrid,
  } = deps;

  const isSwfStageInputActive = (): boolean => {
    if (!state.isStageOpen) return false;
    if (state.stageMediaInputActive || state.swfDistillSession.active || state.activePreset.startsWith('flash-')) {
      return true;
    }
    if (cartridgeNeedsStageKeyForwarding(state.pendingCustomCartridge)) return true;
    const activeCustom = getCustomCartridges().find((c) => c.id === state.activePreset);
    return cartridgeNeedsStageKeyForwarding(activeCustom);
  };

  // Keyboard accessibility shortcuts & direct SWF / key-bound cartridge keyboard forwarding (when stage is open)
  const onKeyDown = (e: KeyboardEvent) => {
    if (!state.isStageOpen) return;
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
    if (isSwfStageInputActive() && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (
        e.code === 'Space' ||
        e.code.startsWith('Arrow') ||
        e.code === 'Tab' ||
        e.code === 'Backspace' ||
        e.code === 'Enter' ||
        e.code === 'PageUp' ||
        e.code === 'PageDown' ||
        e.code === 'Home' ||
        e.code === 'End'
      ) {
        e.preventDefault();
      }
      e.stopImmediatePropagation();
      transport.postToPlayer({
        type: 'SWF_KEY_EVENT',
        kind: 'keydown',
        code: e.code,
        key: e.key,
        keyCode: e.keyCode,
        shiftKey: Boolean(e.shiftKey),
        repeat: Boolean(e.repeat),
      });
      return;
    }
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      dom.muteBtn?.click();
    } else if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      dom.playBtn?.click();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (!isSwfStageInputActive()) return;
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
    transport.postToPlayer({
      type: 'SWF_KEY_EVENT',
      kind: 'keyup',
      code: e.code,
      key: e.key,
      keyCode: e.keyCode,
      shiftKey: Boolean(e.shiftKey),
    });
  };

  const onWindowBlur = () => {
    if (isSwfStageInputActive()) {
      transport.postToPlayer({ type: 'SWF_RELEASE_INPUTS' });
    }
  };

  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('blur', onWindowBlur);

  const onWindowMessage = (e: MessageEvent) => {
    if (state.pageDisposed || !dom.container.isConnected) return;
    if (!e.data || typeof e.data !== 'object') return;
    if (e.source && dom.iframe?.contentWindow && e.source !== dom.iframe.contentWindow) return;
    if (transport.resolvePendingAck(e.data)) return;

    if (e.data.type === 'PLAYER_READY') {
      if (!state.isStageOpen) return;
      state.isIframeReady = true;
      transport.postToPlayer({ type: 'SET_VOICE', enabled: !state.isMuted });
      transport.postToPlayer({ type: 'SET_MUTED', muted: state.isMuted });
      if (state.bslActive) {
        transport.postToPlayer({ type: 'SET_BSL', enabled: true });
        transport.postToPlayer({ type: 'REQUEST_SUBTITLE' });
      }
      if (state.pendingCustomCartridge) {
        const queued = state.pendingCustomCartridge;
        state.pendingCustomCartridge = null;
        state.stageMediaInputActive = cartridgeNeedsStageKeyForwarding(queued);
        state.lastMountedCustomPresetId = queued.id;
        state.lastMountedCustomAt = Date.now();
        transport.postToPlayer({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: queued, play: true });
        transport.focusPlayerStage();
      } else if (state.initialExternalSrc) {
        state.initialExternalSrc = null;
      } else if (state.activePreset && (!e.data.preset || e.data.preset !== state.activePreset)) {
        const activeCustomCart = getCustomCartridges().find(
          (c) => c.id === state.activePreset && c.source !== 'builtin' && Boolean(c.svgMarkup || c.astSource)
        );
        if (activeCustomCart) {
          const recentlyMountedSame =
            state.lastMountedCustomPresetId === activeCustomCart.id && Date.now() - state.lastMountedCustomAt < 4000;
          if (!recentlyMountedSame) {
            state.stageMediaInputActive = cartridgeNeedsStageKeyForwarding(activeCustomCart);
            state.lastMountedCustomPresetId = activeCustomCart.id;
            state.lastMountedCustomAt = Date.now();
            transport.postToPlayer({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: activeCustomCart, play: true });
            transport.focusPlayerStage();
          }
        } else {
          transport.postToPlayer({ type: 'SET_PRESET', preset: state.activePreset, play: false });
        }
      } else if (typeof e.data.hasMediaInput === 'boolean' || typeof e.data.hasKeyBindings === 'boolean') {
        state.stageMediaInputActive = Boolean(e.data.hasMediaInput || e.data.hasKeyBindings);
        if (state.stageMediaInputActive) transport.focusPlayerStage();
      }
      updatePlayButtonUI(Boolean(e.data.isPlaying));

      if (state.swfDistillSession.active && state.swfDistillSession.pendingAutoAction) {
        setTimeout(() => {
          if (state.pageDisposed || !state.swfDistillSession.active || !state.isStageOpen) return;
          const action = state.swfDistillSession.pendingAutoAction;
          state.swfDistillSession.pendingAutoAction = null;
          if (action === 'sweep') {
            void drawers.sweepSwfStates(true);
          } else if (action === 'capture') {
            void drawers.captureCurrentSwfState(true);
          }
        }, 550);
      }

      if (state.pendingAutoOpenStudio && (!e.data.preset || e.data.preset === state.activePreset)) {
        state.pendingAutoOpenStudio = false;
        setTimeout(() => {
          if (!dom.container.isConnected || state.pageDisposed) return;
          transport.postToPlayer({ type: 'OPEN_STUDIO', tab: 'ast' });
          transport.focusPlayerStage();
        }, 120);
      }

      if (state.pendingAutoEppBench && (!e.data.preset || e.data.preset === state.activePreset)) {
        state.pendingAutoEppBench = false;
        setTimeout(() => {
          if (!dom.container.isConnected || state.pageDisposed) return;
          if (dom.teacherToolsGroup) {
            dom.teacherToolsGroup.style.display = 'inline-flex';
          }
          if (dom.teacherToolsBtn) {
            dom.teacherToolsBtn.setAttribute('aria-expanded', 'true');
            dom.teacherToolsBtn.style.background = '#1e293b';
            dom.teacherToolsBtn.style.color = '#f8fafc';
            dom.teacherToolsBtn.textContent = '🧰 Teacher Tools ▴';
          }
          state.activeDrawer = 'diagnostics';
          state.autoRunEppBenchOnce = true;
          drawers.renderActiveDrawer(true);
        }, 150);
      }
    }

    if (e.data.type === 'MEDIA_INPUT_STATE' && typeof e.data.active === 'boolean') {
      state.stageMediaInputActive = e.data.active;
      if (e.data.active && state.isStageOpen) {
        transport.focusPlayerStage();
      }
    }

    if (
      (e.data.type === 'PLAY_STATE_CHANGED' || e.data.type === 'STATE_CHANGED' || e.data.type === 'statechange') &&
      typeof (e.data.isPlaying ?? e.data.playing) === 'boolean'
    ) {
      const playing = Boolean(e.data.isPlaying ?? e.data.playing);
      updatePlayButtonUI(playing);
    }

    if ((e.data.type === 'PRESETCHANGE' || e.data.type === 'PLAYER_PRESET_CHANGED') && typeof e.data.preset === 'string') {
      const incomingId = normalizePresetId(e.data.preset);
      const isStaleWelcomeOverwrite =
        incomingId === 'welcome' &&
        (Boolean(state.pendingCustomCartridge) ||
          (state.lastMountedCustomPresetId === state.activePreset && Date.now() - state.lastMountedCustomAt < 5000));
      if (!isStaleWelcomeOverwrite && incomingId !== state.activePreset) {
        updatePreset(incomingId, true);
      }
    }

    if (e.data.type === 'INGEST_SWF_FILE' && e.data.buffer) {
      const rawName = typeof e.data.name === 'string' && e.data.name ? e.data.name : 'imported.swf';
      const file = new File([e.data.buffer], rawName, { type: 'application/x-shockwave-flash' });
      void handleUploadedFiles([file]);
      return;
    }

    if (e.data.type === 'CARTRIDGE_INGESTED') {
      refreshDropdown();
      renderGrid();
    }

    if (e.data.type === 'CARTRIDGE_LOAD_ERROR' && e.data.message) {
      drawers.showImportStatus(`⚠️ Stage failed to load cartridge: ${String(e.data.message)}`, 'error');
    }

    if (e.data.type === 'SWF_RUNTIME_VERDICT' && e.data.report && typeof e.data.report === 'object') {
      if (dom.iframe?.contentWindow && e.source && e.source !== dom.iframe.contentWindow) {
        return;
      }
      const report = e.data.report as SwfRuntimeHealthReport;
      state.swfRuntimeHealth = report;
      const targetId = (state.swfFileName || state.activePreset || '').replace(/\.swf$/i, '').toLowerCase();
      if (targetId) {
        void import('../../services/dbStore')
          .then(({ updateSwfHeaderUpgradeStatus }) =>
            updateSwfHeaderUpgradeStatus(targetId, {
              runtimeHealth: report,
              ...(report.verdict === 'cannot-play' ? { upgradeStatus: 'rejected' as const } : {}),
            })
          )
          .catch(() => {});
      }
      if (report.verdict === 'cannot-play') {
        const primaryReason = report.reasons?.[0] || 'Stage rendered no playable Flash visuals.';
        drawers.showImportStatus(
          `Cannot play this SWF (${report.vm.toUpperCase()}): ${primaryReason} Open the SWF Drawer to rescue SVG symbols or copy the Recode Brief.`,
          'error'
        );
      } else if (report.verdict === 'degraded' && report.reasons?.length) {
        drawers.showImportStatus(
          `Partial SWF playback (${report.vm.toUpperCase()}): ${report.reasons[0]}`,
          'error'
        );
      }
      if (state.activeDrawer === 'swf') {
        drawers.renderActiveDrawer(true);
      } else if (state.launcherImportPanel === 'swf') {
        drawers.renderLauncherImportPanel();
      }
    }

    if (e.data.type === 'BRIDGE_COMMAND_ERROR' && e.data.message) {
      console.warn('[media-player] Player bridge command error:', e.data.command, e.data.message);
    }

    if (e.data.type === 'CARTRIDGE_INTEGRITY' && e.data.integrity) {
      const targetId = typeof e.data.preset === 'string' && e.data.preset ? e.data.preset : state.activePreset;
      if (normalizePresetId(targetId) === normalizePresetId(state.activePreset)) {
        updateHostIntegrityBadge(targetId, e.data.integrity);
      }
    }

    if ((e.data.type === 'VOICE_TOGGLE' || e.data.type === 'SET_VOICE') && typeof e.data.enabled === 'boolean') {
      setVoiceEnabled(e.data.enabled);
    }

    if (e.data.type === 'BSL_STATE_CHANGED' && typeof e.data.active === 'boolean') {
      state.bslActive = e.data.active;
      updateBslUi(e.data.active);
      setBslEnabled(e.data.active);
    }

    if (e.data.type === 'TOGGLE_BSL' && typeof e.data.enabled === 'boolean') {
      state.bslActive = e.data.enabled;
      updateBslUi(e.data.enabled);
      setBslEnabled(e.data.enabled);
    }

    if (e.data.type === 'SITE_DIRECTIVE' && e.data.directive && typeof e.data.directive === 'object') {
      if (dom.iframe?.contentWindow && e.source && e.source !== dom.iframe.contentWindow) {
        return;
      }
      dispatchCartridgeSiteDirective(e.data.directive)
        .then((res) => {
          if (res.ok && res.action === 'toggle_bsl' && typeof res.detail.bslEnabled === 'boolean') {
            state.bslActive = res.detail.bslEnabled;
            updateBslUi(res.detail.bslEnabled);
          }
        })
        .catch(() => {});
    }

    if (e.data.type === 'TELEMETRY' || e.data.type === 'AST_TELEMETRY' || e.data.type === 'PLAYER_TELEMETRY') {
      state.latestTelemetry = e.data.telemetry || e.data.payload || e.data;
      if (state.activeDrawer === 'ai-tutor') {
        const mountedAiTutorHandle = state.mountedAiTutorHandle;
        mountedAiTutorHandle?.updateTelemetry(state.latestTelemetry);
      }
    }

    if (e.data.type === 'AI_DEMO_START') {
      state.isAiDemonstrating = true;
      state.mountedAiTutorHandle?.setDemonstrating(true);
    }

    if (e.data.type === 'AI_DEMO_COMPLETE' || e.data.type === 'PUPIL_PREEMPTION') {
      state.isAiDemonstrating = false;
      state.mountedAiTutorHandle?.setDemonstrating(false);
    }

    if (e.data.type === 'CHECKPOINT_ANSWERED') {
      if (!e.data.isCorrect && e.data.prompt) {
        state.activeQuizContext = {
          sceneId: typeof e.data.sceneId === 'string' && e.data.sceneId ? e.data.sceneId : state.activePreset,
          sceneTitle: typeof e.data.sceneTitle === 'string' ? e.data.sceneTitle : undefined,
          index: Number(e.data.index || 0),
          mode: e.data.mode === 'pass-expr' ? 'pass-expr' : 'multiple-choice',
          prompt: String(e.data.prompt),
          options: Array.isArray(e.data.options) ? e.data.options : undefined,
          chosenIndex: typeof e.data.chosenIdx === 'number' ? e.data.chosenIdx : null,
          chosenText: typeof e.data.selectedText === 'string' ? e.data.selectedText : '',
          answerIndex: typeof e.data.answer === 'number' ? e.data.answer : undefined,
          explanation: typeof e.data.explanation === 'string' ? e.data.explanation : '',
          distractorNudge: typeof e.data.distractorNudge === 'string' ? e.data.distractorNudge : '',
          autoAsk: false,
        };
        if (state.activeDrawer === 'ai-tutor' && state.mountedAiTutorHandle) {
          state.mountedAiTutorHandle.askCheckpoint(state.activeQuizContext, false);
        }
      } else if (e.data.isCorrect) {
        state.activeQuizContext = null;
      }
    }

    if (e.data.type === 'ASK_NANO_CHECKPOINT' || e.data.type === 'OPEN_NANO_TUTOR') {
      state.activeQuizContext = {
        sceneId: typeof e.data.sceneId === 'string' && e.data.sceneId ? e.data.sceneId : state.activePreset,
        sceneTitle: typeof e.data.sceneTitle === 'string' ? e.data.sceneTitle : undefined,
        index: Number(e.data.index || 0),
        mode: e.data.mode === 'pass-expr' ? 'pass-expr' : 'multiple-choice',
        prompt: String(e.data.prompt || ''),
        options: Array.isArray(e.data.options) ? e.data.options : undefined,
        chosenIndex: typeof e.data.chosenIndex === 'number' ? e.data.chosenIndex : null,
        chosenText: typeof e.data.chosenText === 'string' ? e.data.chosenText : '',
        answerIndex: typeof e.data.answerIndex === 'number' ? e.data.answerIndex : undefined,
        correctText: typeof e.data.correctText === 'string' ? e.data.correctText : '',
        explanation: typeof e.data.explanation === 'string' ? e.data.explanation : '',
        distractorNudge: typeof e.data.distractorNudge === 'string' ? e.data.distractorNudge : '',
        passExpr: typeof e.data.passExpr === 'string' ? e.data.passExpr : '',
        targetSelector: typeof e.data.targetSelector === 'string' ? e.data.targetSelector : '',
        vars: e.data.vars && typeof e.data.vars === 'object' ? e.data.vars : undefined,
        computed: e.data.computed && typeof e.data.computed === 'object' ? e.data.computed : undefined,
        progress: typeof e.data.progress === 'number' ? e.data.progress : undefined,
        autoAsk: e.data.autoAsk !== false,
      };
      if (state.activeDrawer === 'ai-tutor' && state.mountedAiTutorHandle && state.mountedAiTutorPreset === state.activePreset) {
        state.mountedAiTutorHandle.askCheckpoint(state.activeQuizContext, state.activeQuizContext.autoAsk !== false);
      } else {
        state.activeDrawer = 'ai-tutor';
        drawers.renderActiveDrawer(true);
      }
    }

    if (e.data.type === 'PERF_HUD_UPDATED') {
      // Handled cleanly inside mounted drawer without tearing down live benchmark state
    }

    if ((e.data.type === 'LOG_JOTTER_CSV' || e.data.type === 'JOTTER_CSV_RESPONSE') && typeof e.data.csv === 'string') {
      const targetId = typeof e.data.sceneId === 'string' ? e.data.sceneId : state.activePreset;
      const rows = Number(e.data.rowCount || 1);
      const nodePath = typeof e.data.nodePath === 'string' ? e.data.nodePath : `lab/${targetId}`;
      appendLabCsvToJotter(targetId, e.data.csv, nodePath)
        .then(() => {
          if (dom.logCsvBtn) {
            const origText = '📊 Save Results to Jotter';
            dom.logCsvBtn.textContent = `✓ Saved ${rows} rows to Jotter`;
            dom.logCsvBtn.style.background = '#065f46';
            dom.logCsvBtn.style.borderColor = '#10b981';
            dom.logCsvBtn.style.color = '#ffffff';
            setTimeout(() => {
              if (!dom.logCsvBtn) return;
              dom.logCsvBtn.textContent = origText;
              dom.logCsvBtn.style.background = '#1e293b';
              dom.logCsvBtn.style.borderColor = '#0284c7';
              dom.logCsvBtn.style.color = '#38bdf8';
            }, 2400);
          }
        })
        .catch(() => {});

      if (e.data.download) {
        try {
          const blob = new Blob([e.data.csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${targetId || 'lab'}-data.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (_) {}
      }
    }

    if (e.data.type === 'SAVE_REMIX_CARTRIDGE' && e.data.cartridge) {
      const incoming = e.data.cartridge as CartridgeDefinition;
      const exportMode = typeof e.data.exportMode === 'string' ? e.data.exportMode : 'vault';
      if (incoming.id && incoming.astSource && incoming.svgMarkup) {
        const cleanCart: CartridgeDefinition = {
          id: incoming.id,
          title: incoming.title || incoming.id,
          stage: incoming.stage || 'CUSTOM REMIX',
          type: (incoming.type as any) || 'Sim',
          category: incoming.category || 'Student Remixes',
          desc: incoming.desc || 'Custom student remix saved offline.',
          icon: incoming.icon || '🧪',
          source: 'user',
          svgMarkup: incoming.svgMarkup,
          astSource: incoming.astSource,
          createdAt: incoming.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        saveCustomCartridge(cleanCart);
        state.activePreset = cleanCart.id;
        if (dom.titleEl) dom.titleEl.textContent = cleanCart.title;
        if (dom.stageBadgeEl) dom.stageBadgeEl.textContent = cleanCart.stage;
        if (dom.typeBadgeEl) dom.typeBadgeEl.textContent = cleanCart.type || 'Sim';
        updateHostIntegrityBadge(cleanCart.id, null);
        refreshDropdown();
        renderGrid();

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('preset', cleanCart.id);
        window.history.replaceState({}, '', nextUrl.toString());

        import('../../services/localCartridgeBuilder')
          .then(async ({ saveRemixDuoToNominatedFolder, downloadAstbBinary }) => {
            const res = await saveRemixDuoToNominatedFolder({
              id: cleanCart.id,
              astText: cleanCart.astSource || '',
              svgText: cleanCart.svgMarkup || '',
            });
            if (exportMode === 'astb') {
              downloadAstbBinary(res.artifact.id, res.artifact.astbData);
            }
            const ackMsg = res.wroteToFolder && res.folderName
              ? `✓ Saved ${cleanCart.id}.ast + .svg + bytecode/.astb into "${res.folderName}" & Vault!`
              : exportMode === 'astb'
              ? `⚡ Compiled & downloaded ${res.artifact.id}.astb (${res.artifact.bytecodeBytes} B)`
              : `✓ Saved "${cleanCart.title}" to offline Vault!`;
            transport.postToPlayer({ type: 'REMIX_SAVED_ACK', message: ackMsg });
            if (dom.remixCodeBtn) {
              const prev = dom.remixCodeBtn.textContent;
              dom.remixCodeBtn.textContent = `✓ Saved ${cleanCart.id}`;
              dom.remixCodeBtn.style.background = '#065f46';
              setTimeout(() => {
                if (!dom.remixCodeBtn) return;
                dom.remixCodeBtn.textContent = prev || '💻 Remix & Code';
                dom.remixCodeBtn.style.background = '#1e293b';
              }, 2600);
            }
          })
          .catch(() => {});
      }
    }

    if (e.data.type === 'NANO_REMIX_REQUEST' && e.data.context) {
      const remixCtx = e.data.context;
      import('../../engine/nanoRemixCopilot')
        .then(async ({ promptAiRemixAssistant }) => {
          const proposal = await promptAiRemixAssistant(remixCtx);
          transport.postToPlayer({
            type: 'NANO_REMIX_RESULT',
            proposal,
          });
        })
        .catch((err) => {
          transport.postToPlayer({
            type: 'NANO_REMIX_RESULT',
            proposal: {
              requestId: remixCtx.requestId,
              mode: 'advice_only',
              explanation: `Could not reach Nano Remix Co-Pilot: ${err?.message || 'offline error'}`,
              engineUsed: 'deterministic-remix',
            },
          });
        });
    }
  };
  window.addEventListener('message', onWindowMessage);

  const onAppSettingChanged = (e: any) => {
    if (state.pageDisposed || !dom.container.isConnected) return;
    if (
      e.detail &&
      (e.detail.key === 'app_perf_hud_enabled' ||
        e.detail.key === 'app_hud_verbosity' ||
        e.detail.key === 'app_frame_budget_alert')
    ) {
      transport.postToPlayer({
        type: 'SET_PERF_HUD',
        enabled: getLocalState('app_perf_hud_enabled') === 'true',
        mode: getLocalState('app_hud_verbosity') || 'minimal',
        strictAlarm: getLocalState('app_frame_budget_alert') === 'true',
      });
      if (state.activeDrawer === 'diagnostics') {
        drawers.renderActiveDrawer();
      }
    }
  };
  window.addEventListener('app-setting-changed', onAppSettingChanged);

  const onCartridgesUpdated = () => {
    if (state.pageDisposed || !dom.container.isConnected) return;
    refreshDropdown();
    renderGrid();
  };
  window.addEventListener('cartridges_updated', onCartridgesUpdated);

  return {
    isSwfStageInputActive,
    dispose() {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('message', onWindowMessage);
      window.removeEventListener('app-setting-changed', onAppSettingChanged);
      window.removeEventListener('cartridges_updated', onCartridgesUpdated);
    },
  };
}
