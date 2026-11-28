// src/pages/player/playerDrawerOrchestrator.ts
import {
  saveCustomCartridge,
  type CartridgeDefinition,
} from '../../services/cartridgeStore';
import { renderPlayerEmbedModal } from '../../components/player/PlayerEmbedModal';
import { renderNanoAiTutorDrawer } from '../../components/player/NanoAiTutorDrawer';
import { renderAstInteractiveLabDrawer } from '../../components/player/AstInteractiveLabDrawer';
import { renderEppDiagnosticsDrawer } from '../../components/player/EppDiagnosticsDrawer';
import type { PlayerDisplayMode } from '../../types/playerConfig';
import { getPresetMeta } from './playerCatalog';
import type { PlayerTransport } from './playerTransport';
import type { PlayerDomRefs, PlayerRuntimeState } from './playerTypes';

export interface PlayerDrawerController {
  renderActiveDrawer(forceRebuild?: boolean): void;
  renderLauncherImportPanel(): void;
  renderSwfDistillerStripPanel(): void;
  showImportStatus(message: string, kind?: 'success' | 'error'): void;
  clearImportStatus(): void;
  captureCurrentSwfState(silentIfDuplicate?: boolean): Promise<void>;
  sweepSwfStates(openReviewAfter?: boolean): Promise<void>;
  resetSwfDistillSession(): void;
  dispose(): void;
}

export interface CreatePlayerDrawerControllerDeps {
  dom: PlayerDomRefs;
  state: PlayerRuntimeState;
  transport: PlayerTransport;
  base: string;
  launchCustomCartridge: (cart: CartridgeDefinition) => void;
  refreshDropdown: () => void;
  renderGrid: () => void;
}

export function createPlayerDrawerController(
  deps: CreatePlayerDrawerControllerDeps
): PlayerDrawerController {
  const { dom, state, transport, base, launchCustomCartridge, refreshDropdown, renderGrid } = deps;

  let swfResult: any = null;
  let swfSelectedMode: 'run' | 'run-to-convert' | 'quick-transform' = 'run-to-convert';
  let isParsingSwf = false;
  let swfError: string | null = null;
  let swfDragActive = false;

  // Preserve direct dynamic imports so Vite keeps heavy transpiler/distiller drawers in lazy chunks
  let swfDrawerModulePromise: Promise<typeof import('../../components/player/SwfTranspilerDrawer')> | null = null;
  let swfDistillerStripModulePromise: Promise<typeof import('../../components/player/SwfDistillerStrip')> | null = null;
  let swfNativeDistillerModulePromise: Promise<typeof import('../../utils/swfNativeDistiller')> | null = null;
  let phetDrawerModulePromise: Promise<typeof import('../../components/player/PhetTranspilerDrawer')> | null = null;

  let embedTargetMode: PlayerDisplayMode = 'classroom';
  let copiedEmbed = false;
  let mountedDiagnosticsEl: HTMLElement | null = null;
  let mountedDiagnosticsPreset = '';
  let mountedAiTutorEl: HTMLElement | null = null;

  function showImportStatus(message: string, kind: 'success' | 'error' = 'success') {
    if (!dom.importStatusEl || !dom.importStatusTextEl) return;
    dom.importStatusTextEl.textContent = message;
    dom.importStatusEl.style.display = 'flex';
    if (kind === 'error') {
      dom.importStatusEl.style.background = '#fef2f2';
      dom.importStatusEl.style.border = '1px solid #fca5a5';
      dom.importStatusEl.style.color = '#991b1b';
    } else {
      dom.importStatusEl.style.background = '#f0fdf4';
      dom.importStatusEl.style.border = '1px solid #86efac';
      dom.importStatusEl.style.color = '#166534';
    }
  }

  function clearImportStatus() {
    if (dom.importStatusEl) dom.importStatusEl.style.display = 'none';
  }

  dom.importStatusCloseBtn?.addEventListener('click', clearImportStatus);

  function loadSwfDrawerModule() {
    if (!swfDrawerModulePromise) {
      swfDrawerModulePromise = import('../../components/player/SwfTranspilerDrawer');
    }
    return swfDrawerModulePromise;
  }

  function loadSwfDistillerStripModule() {
    if (!swfDistillerStripModulePromise) {
      swfDistillerStripModulePromise = import('../../components/player/SwfDistillerStrip');
    }
    return swfDistillerStripModulePromise;
  }

  function loadSwfNativeDistillerModule() {
    if (!swfNativeDistillerModulePromise) {
      swfNativeDistillerModulePromise = import('../../utils/swfNativeDistiller');
    }
    return swfNativeDistillerModulePromise;
  }

  function loadPhetDrawerModule() {
    if (!phetDrawerModulePromise) {
      phetDrawerModulePromise = import('../../components/player/PhetTranspilerDrawer');
    }
    return phetDrawerModulePromise;
  }

  function resetSwfDistillSession() {
    state.swfDistillSession.active = false;
    state.swfDistillSession.reviewOpen = false;
    state.swfDistillSession.states = [];
    state.swfDistillSession.checkpoints = [];
    state.swfDistillSession.isCapturing = false;
    state.swfDistillSession.isSweeping = false;
    state.swfDistillSession.isPolishing = false;
    state.swfDistillSession.statusNote = null;
    state.swfDistillSession.polishNote = null;
    state.swfDistillSession.pendingAutoAction = null;
    renderSwfDistillerStripPanel();
  }

  function renderSwfDistillerStripPanel() {
    const mount = dom.swfDistillerStripMount;
    if (!mount) return;
    if (!state.swfDistillSession.active || !state.isStageOpen) {
      mount.style.display = 'none';
      mount.replaceChildren();
      return;
    }
    mount.style.display = 'block';
    loadSwfDistillerStripModule()
      .then(({ renderSwfDistillerStrip }) => {
        if (state.pageDisposed || !mount.isConnected || !state.swfDistillSession.active) return;
        const stripEl = renderSwfDistillerStrip({
          lessonTitle: state.swfDistillSession.lessonTitle,
          originalSwfBytes: state.swfDistillSession.originalSwfBytes,
          capturedStates: state.swfDistillSession.states,
          isCapturing: state.swfDistillSession.isCapturing,
          isSweeping: state.swfDistillSession.isSweeping,
          statusNote: state.swfDistillSession.statusNote,
          onCaptureState: () => {
            void captureCurrentSwfState(false);
          },
          onAutoSweep: () => {
            void sweepSwfStates(false);
          },
          onMoveState: (idx, delta) => {
            const target = idx + delta;
            if (target < 0 || target >= state.swfDistillSession.states.length) return;
            const next = state.swfDistillSession.states.slice();
            const [item] = next.splice(idx, 1);
            next.splice(target, 0, item);
            state.swfDistillSession.states = next;
            renderSwfDistillerStripPanel();
          },
          onRemoveState: (idx) => {
            state.swfDistillSession.states = state.swfDistillSession.states.filter((_, i) => i !== idx);
            state.swfDistillSession.statusNote = `Removed View ${idx + 1}.`;
            renderSwfDistillerStripPanel();
          },
          onOpenPromoteReview: () => {
            if (state.swfDistillSession.states.length === 0) return;
            state.swfDistillSession.reviewOpen = true;
            state.activeDrawer = 'swf';
            renderActiveDrawer(true);
          },
          onExitConvertMode: () => {
            resetSwfDistillSession();
            if (state.activeDrawer === 'swf') {
              state.activeDrawer = null;
              renderActiveDrawer();
            }
          },
        });
        mount.replaceChildren(stripEl);
      })
      .catch(() => {});
  }

  async function captureCurrentSwfState(silentIfDuplicate = false) {
    if (state.swfDistillSession.isCapturing || !state.isStageOpen) return;
    state.swfDistillSession.isCapturing = true;
    state.swfDistillSession.statusNote = null;
    renderSwfDistillerStripPanel();
    try {
      const [res, distiller] = await Promise.all([
        transport.postToPlayerWithAck<any>({ type: 'CAPTURE_SWF_STATE' }, 'SWF_STATE_CAPTURED', 6000),
        loadSwfNativeDistillerModule(),
      ]);
      if (!res?.ok || !res.snapshot) {
        state.swfDistillSession.statusNote = res?.error || 'No visible vector shapes detected on the current frame.';
      } else {
        const snap = distiller.normalizeCapturedSnapshot(
          res.snapshot,
          state.swfDistillSession.states.length,
          state.swfDistillSession.lessonTitle
        );
        const isDup = state.swfDistillSession.states.some((s) => s.fingerprint === snap.fingerprint);
        if (isDup) {
          if (!silentIfDuplicate) {
            state.swfDistillSession.statusNote = `View already captured (Frame ${snap.frameNumber}) — interact with the SWF to reach a new screen first.`;
          }
        } else if (state.swfDistillSession.states.length >= 24) {
          state.swfDistillSession.statusNote = 'Reached the 24-view cap so your native cartridge stays ultra-light.';
        } else {
          state.swfDistillSession.states = [...state.swfDistillSession.states, snap];
          if (state.swfDistillSession.states.length === 1) {
            state.swfDistillSession.format = distiller.inferRecommendedFormat(state.swfDistillSession.states);
          }
          state.swfDistillSession.checkpoints = distiller.generateEcoCheckpoints(
            state.swfDistillSession.states,
            state.swfDistillSession.lessonTitle
          );
          state.swfDistillSession.statusNote = `Captured View ${state.swfDistillSession.states.length} (Frame ${snap.frameNumber}, ${snap.nodeCount} vector nodes).`;
        }
      }
    } catch (err: any) {
      state.swfDistillSession.statusNote =
        err?.message || 'Could not capture current stage state yet — try again once the Flash stage renders.';
    } finally {
      state.swfDistillSession.isCapturing = false;
      renderSwfDistillerStripPanel();
    }
  }

  async function sweepSwfStates(openReviewAfter = false) {
    if (state.swfDistillSession.isSweeping || !state.isStageOpen) return;
    state.swfDistillSession.isSweeping = true;
    state.swfDistillSession.statusNote = 'Auto-sweeping labeled frames and keyframes within a safe time budget...';
    renderSwfDistillerStripPanel();
    try {
      const [res, distiller] = await Promise.all([
        transport.postToPlayerWithAck<any>(
          { type: 'SWEEP_SWF_STATES', maxStates: 10, budgetMs: 900 },
          'SWF_STATES_SWEPT',
          8000
        ),
        loadSwfNativeDistillerModule(),
      ]);
      const rawList = Array.isArray(res?.snapshots) ? res.snapshots : [];
      if (!res?.ok || rawList.length === 0) {
        state.swfDistillSession.statusNote =
          res?.error || 'Could not auto-detect additional frames; interact with the stage and click Capture State.';
      } else {
        const existingFps = new Set(state.swfDistillSession.states.map((s) => s.fingerprint));
        const added: any[] = [];
        for (const raw of rawList) {
          if (state.swfDistillSession.states.length + added.length >= 24) break;
          const norm = distiller.normalizeCapturedSnapshot(
            raw,
            state.swfDistillSession.states.length + added.length,
            state.swfDistillSession.lessonTitle
          );
          if (!existingFps.has(norm.fingerprint)) {
            existingFps.add(norm.fingerprint);
            added.push(norm);
          }
        }
        state.swfDistillSession.states = [...state.swfDistillSession.states, ...added];
        state.swfDistillSession.format = distiller.inferRecommendedFormat(state.swfDistillSession.states);
        state.swfDistillSession.checkpoints = distiller.generateEcoCheckpoints(
          state.swfDistillSession.states,
          state.swfDistillSession.lessonTitle
        );
        state.swfDistillSession.statusNote =
          added.length > 0
            ? `Auto-sweep captured ${added.length} distinct view${added.length === 1 ? '' : 's'} (${state.swfDistillSession.states.length} total).`
            : 'All swept frames were already captured. Interact with buttons on stage to reach new screens.';

        if (openReviewAfter && state.swfDistillSession.states.length > 0) {
          state.swfDistillSession.reviewOpen = true;
          state.activeDrawer = 'swf';
          renderActiveDrawer(true);
        }
      }
    } catch (err: any) {
      state.swfDistillSession.statusNote =
        err?.message || 'Auto-sweep timed out — use Capture State while interacting live.';
    } finally {
      state.swfDistillSession.isSweeping = false;
      renderSwfDistillerStripPanel();
    }
  }

  function saveAndLaunchPromotedNativeCartridge(distilled: any) {
    const m = distilled?.metrics;
    const kbText = m ? `${(m.nativeTotalBytes / 1024).toFixed(1)} KB` : 'compact';
    const savedHint = m && m.savedPercent > 0 ? ` (${m.savedPercent}% smaller than source SWF)` : '';
    const cart: CartridgeDefinition = {
      id: distilled.id,
      title: distilled.title,
      stage: distilled.stage || 'NATIVE DISTILLED',
      category: 'Distilled Native Lessons',
      type: distilled.type === 'Sim' ? 'Sim' : 'Slide',
      desc: `Promoted from legacy Flash into pure W3C SVG + bytecode-free AST (${kbText}, ${m?.stateCount || 1} views, 0 B Flash bytecode).`,
      icon: distilled.type === 'Sim' ? '🎮' : '📑',
      source: 'user',
      svgMarkup: distilled.svgMarkup,
      astSource: distilled.astSource,
      author: 'Run-to-Convert Distiller',
      version: 'Native AST 1.0',
      invariants: ['Pure W3C SVG', 'Zero Flash Bytecode', 'BSL & Subtitles Ready'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    resetSwfDistillSession();
    state.launcherImportPanel = null;
    renderLauncherImportPanel();
    if (state.activeDrawer === 'swf') {
      state.activeDrawer = null;
      renderActiveDrawer();
    }
    refreshDropdown();
    renderGrid();
    launchCustomCartridge(cart);
    showImportStatus(
      `✓ Promoted "${cart.title}" to Native AST (${kbText}${savedHint}, 0 B Flash bytecode) — saved to Local Vault with BSL, subtitles & checkpoints active.`,
      'success'
    );
  }

  function saveAndLaunchTranspiledPhet(res: any) {
    const phetMeta = res?.metadata;
    const rawId = phetMeta?.simName || `phet-${Date.now().toString(36)}`;
    const cleanId = rawId
      .replace(/\.(html|htm|json|phet|swf)$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-') || `phet-${Date.now().toString(36)}`;
    const cleanTitle =
      phetMeta?.title || `PhET: ${cleanId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}`;
    const isLegacySwf = Boolean(phetMeta?.isFlashSwf);
    const cart: CartridgeDefinition = {
      id: cleanId.startsWith('phet-') || isLegacySwf ? cleanId : `phet-${cleanId}`,
      title: cleanTitle,
      stage: isLegacySwf ? 'FLASH TRANSLATED' : 'PHET INTERACTIVE',
      category: isLegacySwf ? 'Imported Flash' : 'Science',
      type: 'Sim',
      desc: phetMeta
        ? `Distilled from ${((phetMeta.originalSizeBytes || 0) / 1024).toFixed(0)} KB PhET bundle to ${(phetMeta.distilledSizeBytes / 1024).toFixed(1)} KB native SVG + AST (${phetMeta.compressionRatio}).`
        : 'Distilled PhET simulation running 100% offline as native SVG + AST.',
      icon: isLegacySwf ? '⚡' : '⚛️',
      source: isLegacySwf ? 'imported' : 'phet',
      svgMarkup: res.svgMarkup,
      astSource: res.astSource,
      author: 'University of Colorado Boulder (PhET)',
      version: phetMeta?.version || '1.0.0',
      invariants: phetMeta?.detectedInvariants || ['Physical Conservation Law'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    state.launcherImportPanel = null;
    renderLauncherImportPanel();
    if (state.activeDrawer === 'phet') {
      state.activeDrawer = null;
      renderActiveDrawer();
    }
    refreshDropdown();
    launchCustomCartridge(cart);
    showImportStatus(
      `⚛️ Distilled "${cart.title}"${phetMeta?.compressionRatio ? ` (${phetMeta.compressionRatio})` : ''} — saved to Local Vault & launched on stage.`,
      'success'
    );
  }

  function saveAndLaunchTranspiledSwf(
    res: any,
    rawName: string,
    mode: 'run' | 'run-to-convert' | 'quick-transform' = 'run'
  ) {
    state.swfRuntimeHealth = null;
    const cleanId = (rawName || 'imported-swf')
      .replace(/\.swf$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-') || `flash-${Date.now().toString(36)}`;
    const cleanTitle = cleanId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const swfMeta = res?.metadata;
    const originalBytes = (res?.svgMarkup?.length || 0) + (res?.astSource?.length || 0);
    const cart: CartridgeDefinition = {
      id: cleanId,
      title: `Flash: ${cleanTitle}`,
      stage: 'FLASH TRANSLATED',
      category: 'Imported Flash',
      type: 'Sim',
      desc: swfMeta
        ? `Transpiled from Flash SWF v${swfMeta.version} (${swfMeta.signature}, ${swfMeta.width}×${swfMeta.height}, ${swfMeta.shapeCount} vector shapes, ${swfMeta.frameCount} frames) into 60 FPS native SVG + AST.`
        : 'Transpiled from legacy Adobe Flash SWF into 60 FPS deterministic vector SVG + AST.',
      icon: '⚡',
      source: 'imported',
      svgMarkup: res.svgMarkup,
      astSource: res.astSource,
      author: 'Flash Archive',
      version: `Flash v${swfMeta?.version || 9}`,
      invariants: ['Legacy Vector Timeline', 'ActionScript Translation'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    state.launcherImportPanel = null;
    renderLauncherImportPanel();
    if (state.activeDrawer === 'swf') {
      state.activeDrawer = null;
      renderActiveDrawer();
    }
    refreshDropdown();
    launchCustomCartridge(cart);

    if (mode === 'run-to-convert' || mode === 'quick-transform') {
      state.swfDistillSession = {
        active: true,
        reviewOpen: false,
        lessonTitle: cleanTitle,
        stageTag: 'KS3 CURRICULUM',
        format: swfMeta?.isActionScript3 ? 'Slide' : 'Sim',
        originalSwfBytes: originalBytes,
        states: [],
        checkpoints: [],
        isCapturing: false,
        isSweeping: false,
        isPolishing: false,
        statusNote:
          mode === 'quick-transform'
            ? 'Mounting SWF stage and running bounded Quick Transform frame sweep...'
            : 'Live Flash stage mounted — capturing initial view. Interact with the SWF and capture each screen you want to promote.',
        polishNote: null,
        pendingAutoAction: mode === 'quick-transform' ? 'sweep' : 'capture',
      };
      renderSwfDistillerStripPanel();
      if (state.isIframeReady) {
        setTimeout(() => {
          if (state.pageDisposed || !state.swfDistillSession.active || !state.isStageOpen) return;
          const action = state.swfDistillSession.pendingAutoAction;
          state.swfDistillSession.pendingAutoAction = null;
          if (action === 'sweep') {
            void sweepSwfStates(true);
          } else if (action === 'capture') {
            void captureCurrentSwfState(true);
          }
        }, 550);
      }
    } else {
      resetSwfDistillSession();
    }

    if (swfMeta?.isActionScript3) {
      showImportStatus(
        `⚡ Imported "${cart.title}" (ActionScript 3.0 / AVM2 Beta) — core vector timelines & events run in pure SVG; complex AS3 frameworks, BitmapData shaders, Stage3D, and streaming video are not supported.`,
        'success'
      );
    } else if (mode === 'run-to-convert') {
      showImportStatus(
        `Run-to-Convert active for "${cleanTitle}" — play the live stage below and click Capture State on each screen to promote to Native AST.`,
        'success'
      );
    } else if (mode === 'quick-transform') {
      showImportStatus(
        `Quick Transform started for "${cleanTitle}" — sweeping visible vector frames into a Native AST draft.`,
        'success'
      );
    } else {
      const skipHint = swfMeta?.strippedPreloaderFrames
        ? ` (skipped ${swfMeta.strippedPreloaderFrames} preloader frame(s) → Frame ${swfMeta.entryFrame || (swfMeta.strippedPreloaderFrames + 1)})`
        : '';
      showImportStatus(`⚡ Imported "${cart.title}" into Local Vault & launched on stage${skipHint}.`, 'success');
    }
  }

  function renderPhetPanelInto(targetEl: HTMLElement, onClosePanel: () => void) {
    targetEl.innerHTML =
      '<div style="padding:12px; font-size:0.8rem; color:#94a3b8;">⏳ Loading Full PhET Simulation Transpiler...</div>';
    loadPhetDrawerModule()
      .then(({ renderPhetTranspilerDrawer }) => {
        if (state.pageDisposed || !targetEl.isConnected) return;
        const drawerEl = renderPhetTranspilerDrawer({
          setCustomSvgCode: () => {},
          setCustomAstCode: () => {},
          postToPlayer: (payload) => transport.postToPlayer(payload),
          setHotReloadFlash: () => {},
          onLaunchCartridge: (res) => saveAndLaunchTranspiledPhet(res),
          onClose: onClosePanel,
        });
        targetEl.replaceChildren(drawerEl);
      })
      .catch((err) => {
        targetEl.textContent = `Could not load PhET Importer: ${err?.message || 'offline error'}`;
      });
  }

  function renderSwfPanelInto(targetEl: HTMLElement, mode: 'launcher' | 'stage', onClosePanel: () => void) {
    targetEl.innerHTML =
      '<div style="padding:12px; font-size:0.8rem; color:#94a3b8;">⏳ Loading Historic Flash (.swf) Transpiler...</div>';
    loadSwfDrawerModule()
      .then(({ renderSwfTranspilerDrawer }) => {
        if (state.pageDisposed || !targetEl.isConnected) return;
        const rerender = () => {
          if (mode === 'launcher' && state.launcherImportPanel === 'swf') {
            renderLauncherImportPanel();
          } else if (mode === 'stage' && state.activeDrawer === 'swf') {
            renderActiveDrawer(true);
          }
        };
        const drawerEl = renderSwfTranspilerDrawer({
          swfResult,
          swfRuntimeHealth: state.swfRuntimeHealth,
          setSwfResult: (val) => {
            swfResult = val;
            state.swfRuntimeHealth = null;
            rerender();
          },
          isParsingSwf,
          setIsParsingSwf: (val) => {
            isParsingSwf = val;
            rerender();
          },
          swfError,
          setSwfError: (err) => {
            swfError = err;
            rerender();
          },
          swfDragActive,
          setSwfDragActive: (val) => {
            if (swfDragActive !== val) {
              swfDragActive = val;
              rerender();
            }
          },
          swfFileName: state.swfFileName,
          setSwfFileName: (name) => {
            state.swfFileName = name;
          },
          selectedMode: swfSelectedMode,
          setSelectedMode: (m) => {
            swfSelectedMode = m;
          },
          setCustomSvgCode: () => {},
          setCustomAstCode: () => {},
          postToPlayer: (payload) => transport.postToPlayer(payload),
          setHotReloadFlash: () => {},
          onLaunchCartridge: (res, name, launchMode) =>
            saveAndLaunchTranspiledSwf(res, name, launchMode || swfSelectedMode),
          distillReview: state.swfDistillSession.reviewOpen
            ? {
                reviewOpen: true,
                lessonTitle: state.swfDistillSession.lessonTitle,
                stageTag: state.swfDistillSession.stageTag,
                format: state.swfDistillSession.format,
                states: state.swfDistillSession.states,
                checkpoints: state.swfDistillSession.checkpoints,
                originalSwfBytes: state.swfDistillSession.originalSwfBytes,
                isPolishing: state.swfDistillSession.isPolishing,
                polishNote: state.swfDistillSession.polishNote,
              }
            : null,
          onUpdateDistillReview: (patch) => {
            Object.assign(state.swfDistillSession, patch);
            rerender();
            renderSwfDistillerStripPanel();
          },
          onBackToLiveCapture: () => {
            state.swfDistillSession.reviewOpen = false;
            if (state.activeDrawer === 'swf') {
              state.activeDrawer = null;
              renderActiveDrawer();
            }
            renderSwfDistillerStripPanel();
          },
          onSavePromotedCartridge: (distilled) => saveAndLaunchPromotedNativeCartridge(distilled),
          onClose: onClosePanel,
        });
        targetEl.replaceChildren(drawerEl);
      })
      .catch((err) => {
        targetEl.textContent = `Could not load Flash (.swf) Importer: ${err?.message || 'offline error'}`;
      });
  }

  function renderLauncherImportPanel() {
    if (!dom.launcherSwfMount) return;
    if (dom.launcherSwfBtn) {
      dom.launcherSwfBtn.setAttribute('aria-expanded', String(state.launcherImportPanel === 'swf'));
      dom.launcherSwfBtn.style.background = state.launcherImportPanel === 'swf' ? '#fef3c7' : '#fffbeb';
      dom.launcherSwfBtn.style.borderColor = state.launcherImportPanel === 'swf' ? '#b45309' : '#d97706';
    }
    if (dom.launcherPhetBtn) {
      dom.launcherPhetBtn.setAttribute('aria-expanded', String(state.launcherImportPanel === 'phet'));
      dom.launcherPhetBtn.style.background = state.launcherImportPanel === 'phet' ? '#bae6fd' : '#e0f2fe';
      dom.launcherPhetBtn.style.borderColor = state.launcherImportPanel === 'phet' ? '#0369a1' : '#0284c7';
    }
    if (!state.launcherImportPanel) {
      dom.launcherSwfMount.style.display = 'none';
      dom.launcherSwfMount.replaceChildren();
      return;
    }
    dom.launcherSwfMount.style.display = 'block';
    const closePanel = () => {
      state.launcherImportPanel = null;
      renderLauncherImportPanel();
    };
    if (state.launcherImportPanel === 'phet') {
      renderPhetPanelInto(dom.launcherSwfMount, closePanel);
    } else {
      renderSwfPanelInto(dom.launcherSwfMount, 'launcher', closePanel);
    }
  }

  function renderActiveDrawer(forceRebuild = false) {
    if (!dom.drawerMount) return;

    // Preserve interactive diagnostics DOM and live benchmark state across telemetry ticks
    if (
      state.activeDrawer === 'diagnostics' &&
      !forceRebuild &&
      mountedDiagnosticsEl &&
      mountedDiagnosticsEl.isConnected &&
      mountedDiagnosticsPreset === state.activePreset
    ) {
      return;
    }

    // Preserve active Gemini Nano Co-Pilot chatLog & quiz state across telemetry ticks
    if (
      state.activeDrawer === 'ai-tutor' &&
      !forceRebuild &&
      mountedAiTutorEl &&
      mountedAiTutorEl.isConnected &&
      state.mountedAiTutorPreset === state.activePreset
    ) {
      state.mountedAiTutorHandle?.updateTelemetry(state.latestTelemetry);
      return;
    }

    dom.drawerMount.innerHTML = '';
    if (state.activeDrawer !== 'diagnostics') {
      mountedDiagnosticsEl = null;
      mountedDiagnosticsPreset = '';
    }
    if (state.activeDrawer !== 'ai-tutor') {
      mountedAiTutorEl = null;
      state.mountedAiTutorHandle = null;
      state.mountedAiTutorPreset = '';
    }

    if (dom.aiTutorBtn) {
      dom.aiTutorBtn.style.background = state.activeDrawer === 'ai-tutor' ? '#581c87' : '#1e293b';
      dom.aiTutorBtn.style.borderColor = state.activeDrawer === 'ai-tutor' ? '#c084fc' : '#9333ea';
    }
    if (dom.labDrawerBtn) {
      dom.labDrawerBtn.style.background = state.activeDrawer === 'lab' ? '#0369a1' : '#1e293b';
      dom.labDrawerBtn.style.borderColor = state.activeDrawer === 'lab' ? '#38bdf8' : '#0284c7';
    }
    if (dom.embedBtn) {
      dom.embedBtn.style.background = state.activeDrawer === 'embed' ? '#065f46' : '#1e293b';
      dom.embedBtn.style.borderColor = state.activeDrawer === 'embed' ? '#34d399' : '#059669';
    }
    if (dom.diagnosticsBtn) {
      dom.diagnosticsBtn.style.background = state.activeDrawer === 'diagnostics' ? '#14532d' : '#1e293b';
      dom.diagnosticsBtn.style.borderColor = state.activeDrawer === 'diagnostics' ? '#4ade80' : '#16a34a';
    }
    if (dom.swfImportBtn) {
      dom.swfImportBtn.style.background = state.activeDrawer === 'swf' ? '#78350f' : '#1e293b';
      dom.swfImportBtn.style.borderColor = state.activeDrawer === 'swf' ? '#fbbf24' : '#d97706';
    }
    if (dom.phetImportBtn) {
      dom.phetImportBtn.style.background = state.activeDrawer === 'phet' ? '#075985' : '#1e293b';
      dom.phetImportBtn.style.borderColor = state.activeDrawer === 'phet' ? '#38bdf8' : '#0284c7';
    }

    if (!state.activeDrawer) {
      dom.drawerMount.style.display = 'none';
      return;
    }

    dom.drawerMount.style.display = 'block';

    if (state.activeDrawer === 'ai-tutor') {
      const drawerEl = renderNanoAiTutorDrawer({
        isOpen: true,
        onClose: () => {
          state.activeDrawer = null;
          renderActiveDrawer();
        },
        preset: state.activePreset,
        postToPlayer: (payload) => transport.postToPlayer(payload),
        latestTelemetry: state.latestTelemetry,
        activeQuiz: state.activeQuizContext,
        isAiDemonstrating: state.isAiDemonstrating,
        onCancelDemonstration: () => {
          state.isAiDemonstrating = false;
          state.mountedAiTutorHandle?.setDemonstrating(false);
        },
      });
      if (drawerEl) {
        mountedAiTutorEl = drawerEl;
        state.mountedAiTutorHandle = (drawerEl as any).__nanoDrawerHandle || null;
        state.mountedAiTutorPreset = state.activePreset;
        dom.drawerMount.appendChild(drawerEl);
      }
    } else if (state.activeDrawer === 'lab') {
      const drawerEl = renderAstInteractiveLabDrawer({
        isOpen: true,
        onClose: () => {
          state.activeDrawer = null;
          renderActiveDrawer();
        },
        preset: state.activePreset,
      });
      if (drawerEl) dom.drawerMount.appendChild(drawerEl);
    } else if (state.activeDrawer === 'diagnostics') {
      const activeMeta = getPresetMeta(state.activePreset);
      const shouldAutoRun = state.autoRunEppBenchOnce;
      state.autoRunEppBenchOnce = false;
      const drawerEl = renderEppDiagnosticsDrawer({
        onClose: () => {
          state.activeDrawer = null;
          mountedDiagnosticsEl = null;
          mountedDiagnosticsPreset = '';
          renderActiveDrawer();
        },
        presetId: state.activePreset,
        presetLabel: activeMeta.label,
        presetType: activeMeta.type || 'Sim',
        postToPlayer: (payload) => transport.postToPlayer(payload),
        benchTransport: transport.benchTransport,
        webMcpHandle: transport.getWebMcpHandle(),
        autoRunBenchmark: shouldAutoRun,
        onAutoRunConsumed: () => {
          state.autoRunEppBenchOnce = false;
        },
      });
      mountedDiagnosticsEl = drawerEl;
      mountedDiagnosticsPreset = state.activePreset;
      dom.drawerMount.appendChild(drawerEl);
    } else if (state.activeDrawer === 'embed') {
      const getEmbedSnippet = (mode: PlayerDisplayMode) =>
        `<iframe src="${window.location.origin}${base}player.html?preset=${state.activePreset}&mode=${mode}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`;

      const drawerEl = renderPlayerEmbedModal({
        isOpen: true,
        onClose: () => {
          state.activeDrawer = null;
          renderActiveDrawer();
        },
        embedTargetMode,
        setEmbedTargetMode: (mode) => {
          embedTargetMode = mode;
          renderActiveDrawer();
        },
        copiedEmbed,
        onCopyEmbedCode: () => {
          copiedEmbed = true;
          navigator.clipboard?.writeText(getEmbedSnippet(embedTargetMode));
          renderActiveDrawer();
          setTimeout(() => {
            copiedEmbed = false;
            if (state.activeDrawer === 'embed') renderActiveDrawer();
          }, 2000);
        },
        embedCode: getEmbedSnippet(embedTargetMode),
      });

      if (drawerEl) {
        dom.drawerMount.appendChild(drawerEl);
      }
    } else if (state.activeDrawer === 'swf') {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'padding:16px 18px; color:#f8fafc;';
      dom.drawerMount.appendChild(wrap);
      renderSwfPanelInto(wrap, 'stage', () => {
        state.activeDrawer = null;
        renderActiveDrawer();
      });
    } else if (state.activeDrawer === 'phet') {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'padding:16px 18px; color:#f8fafc;';
      dom.drawerMount.appendChild(wrap);
      renderPhetPanelInto(wrap, () => {
        state.activeDrawer = null;
        renderActiveDrawer();
      });
    }
  }

  function dispose() {
    mountedDiagnosticsEl = null;
    mountedAiTutorEl = null;
    state.mountedAiTutorHandle = null;
  }

  return {
    renderActiveDrawer,
    renderLauncherImportPanel,
    renderSwfDistillerStripPanel,
    showImportStatus,
    clearImportStatus,
    captureCurrentSwfState,
    sweepSwfStates,
    resetSwfDistillSession,
    dispose,
  };
}
