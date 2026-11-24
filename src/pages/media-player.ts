import { getSavedLanguage } from '../engine/operational-language';
import { getBaseUrl } from '../utils/url';
import { getLocalState } from '../services/localStateStore';
import type { ScenePresetOption } from '../data/player/generatedScenes';
import {
  saveCustomCartridge,
  getCustomCartridges,
  inflateCartridgeToVault,
  type CartridgeDefinition,
} from '../services/cartridgeStore';
import type { SupportedPhetPreset } from '../utils/phetBridge';
import {
  toggleBsl,
  setBslEnabled,
  getBslEnabled,
  subscribeBsl,
  broadcastBslSpeech,
  subscribeVoice,
  setVoiceEnabled,
  getVoiceEnabled,
  toggleVoice,
} from '../services/bslGlobalStore';
import { isSoundEnabled, setSoundEnabled } from '../services/soundHaptics';
import {
  renderPlayerEmbedModal,
  renderNanoAiTutorDrawer,
  renderAstInteractiveLabDrawer,
  renderEppDiagnosticsDrawer,
  type QuizCheckpointContext,
  type NanoAiTutorDrawerHandle,
} from '../components/player';
import type { PlayerTelemetryEvent } from '../engine/aicaller';
import {
  registerWebMcpTools,
  type PlayerMcpTransport,
  type WebMcpRegistrationHandle,
} from '../engine/webmcpBridge';
import { bindSitePlayerAdapter, dispatchCartridgeSiteDirective } from '../engine/nanoSiteManager';
import {
  type EppBenchTransport,
  type ProfilerCaptureResult,
} from '../engine/eppContentionBench';
import { exportAirgapHtmlBundle } from '../utils/exportAirgapHtmlBundle';
import { appendLabCsvToJotter } from '../services/jotter-db';
import { type PlayerDisplayMode } from '../types/playerConfig';
import {
  getRegisteredRecord,
  formatShortHash,
  getMasterRegistryChecksum,
  getTotalCertifiedCartridges,
} from '../utils/cartridgeIntegrity';
import {
  ALL_BUILTIN_PRESETS,
  buildCatalogGridHtml,
  buildIntegrityReadoutHtml,
  buildOptionsHtml,
  buildPlayerSrc,
  escapeHtml,
  getAllAvailablePresets,
  getNormalizedSubject,
  getPresetMeta,
  getRecentPresetIds,
  isCatholicPreset,
  isNonMediaOrUtility,
  matchesKeyStage,
  normalizePresetId,
  recordRecentPreset,
  type FormatFilterId,
  type StageFilterId,
  type SubjectFilterId,
} from './player/playerCatalog';
import { renderPlayerShellHtml } from './player/playerShellTemplate';
import {
  buildBuiltinPhetCartridge,
  ingestUploadedCartridgeFiles,
  invokeSameOriginPlayerAction,
  unlockMobilePwaAudioForIframe,
} from './player/playerFileIngestion';

export function renderPlayerPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'ast-media-player-container';
  container.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;';

  // Read initial preset (?preset= or ?app=) or external ?src= from URL
  const params = new URLSearchParams(window.location.search);
  const requestedPresetParam = params.get('preset') || params.get('app');
  const initialSrcParam = params.get('src') || params.get('file');
  const resolvedInitialPreset = !requestedPresetParam && initialSrcParam && initialSrcParam.includes('lumina-architecture')
    ? 'lumina-architecture'
    : normalizePresetId(requestedPresetParam);
  let activePreset = resolvedInitialPreset;
  const isSwfExternalUrl = (u: string | null): boolean => Boolean(u && /^[^?#]+\.swf(?:[?#].*)?$/i.test(u.trim()));
  let pendingExternalSwfUrl: string | null = !requestedPresetParam && isSwfExternalUrl(initialSrcParam) ? initialSrcParam : null;
  let initialExternalSrc = requestedPresetParam || pendingExternalSwfUrl ? null : initialSrcParam;
  let pendingAutoEppBench = params.get('epp-bench') === '1' || params.get('epp-bench') === 'true';
  // Launcher-First Grid: keep player iframe unloaded (0 KB engine download, 0% CPU) until a lab is selected or deep-linked
  let isStageOpen = Boolean(requestedPresetParam || initialSrcParam || pendingAutoEppBench);
  let pendingCustomCartridge: CartridgeDefinition | null = null;
  let lastMountedCustomPresetId: string | null = null;
  let lastMountedCustomAt = 0;
  let activeSubject: SubjectFilterId = 'All';
  let activeFormat: FormatFilterId = 'All';
  let activeStage: StageFilterId = 'All';
  let includeNonMediaExtras = false;
  let searchQuery = '';
  if (params.get('bsl') === '1' && !getBslEnabled()) {
    setBslEnabled(true);
  }
  let bslActive = getBslEnabled();
  let isMuted = !(getVoiceEnabled() && isSoundEnabled());

  const meta = getPresetMeta(activePreset);
  container.innerHTML = renderPlayerShellHtml({
    base,
    activePreset,
    meta,
    isStageOpen: isStageOpen && !pendingExternalSwfUrl,
    bslActive,
    isMuted,
    initialExternalSrc,
    activeSubject,
    activeFormat,
  });

  // Attach DOM Listeners
  const stageShell = container.querySelector<HTMLDivElement>('#player-stage-shell')!;
  const catalogSection = container.querySelector<HTMLElement>('#labs-catalog-section')!;
  const backToGridBtn = container.querySelector<HTMLButtonElement>('#player-btn-back-to-grid');
  const breadcrumbLabsBtn = container.querySelector<HTMLButtonElement>('#player-breadcrumb-labs');
  const breadcrumbSepEl = container.querySelector<HTMLElement>('#player-breadcrumb-sep');
  const breadcrumbActiveEl = container.querySelector<HTMLElement>('#player-breadcrumb-active');
  const launcherImportBtn = container.querySelector<HTMLButtonElement>('#launcher-btn-import');
  const launcherPhetBtn = container.querySelector<HTMLButtonElement>('#launcher-btn-phet-import');
  const launcherSwfBtn = container.querySelector<HTMLButtonElement>('#launcher-btn-swf-import');
  const launcherSwfMount = container.querySelector<HTMLDivElement>('#launcher-swf-mount-point');
  const importStatusEl = container.querySelector<HTMLDivElement>('#player-import-status');
  const importStatusTextEl = container.querySelector<HTMLSpanElement>('#player-import-status-text');
  const importStatusCloseBtn = container.querySelector<HTMLButtonElement>('#player-import-status-close');
  const iframe = container.querySelector<HTMLIFrameElement>('#ast-player-iframe')!;
  const select = container.querySelector<HTMLSelectElement>('#player-sim-selector')!;
  const titleEl = container.querySelector<HTMLElement>('#player-active-title')!;
  const stageBadgeEl = container.querySelector<HTMLElement>('#player-active-stage-badge')!;
  const typeBadgeEl = container.querySelector<HTMLElement>('#player-active-type-badge')!;
  const integrityBadgeEl = container.querySelector<HTMLButtonElement>('#player-integrity-badge');
  const integrityReadoutEl = container.querySelector<HTMLDivElement>('#player-integrity-readout');
  const integrityReadoutBodyEl = container.querySelector<HTMLDivElement>('#player-integrity-readout-body');
  const integrityReadoutCloseBtn = container.querySelector<HTMLButtonElement>('#player-integrity-readout-close');
  const playBtn = container.querySelector<HTMLButtonElement>('#player-btn-play');
  const playIcon = container.querySelector<HTMLElement>('#player-play-icon');
  const playText = container.querySelector<HTMLElement>('#player-play-text');
  const resetBtn = container.querySelector<HTMLButtonElement>('#player-btn-reset');
  const muteBtn = container.querySelector<HTMLButtonElement>('#player-btn-mute');
  const bslBtn = container.querySelector<HTMLButtonElement>('#player-btn-bsl');
  const aiTutorBtn = container.querySelector<HTMLButtonElement>('#player-btn-ai-tutor');
  const labDrawerBtn = container.querySelector<HTMLButtonElement>('#player-btn-lab-drawer');
  const remixCodeBtn = container.querySelector<HTMLButtonElement>('#player-btn-remix-code');
  const diagnosticsBtn = container.querySelector<HTMLButtonElement>('#player-btn-diagnostics');
  const teacherToolsBtn = container.querySelector<HTMLButtonElement>('#player-btn-teacher-tools');
  const teacherToolsGroup = container.querySelector<HTMLDivElement>('#player-teacher-tools-group');
  const logCsvBtn = container.querySelector<HTMLButtonElement>('#player-btn-log-csv');
  const openBtn = container.querySelector<HTMLButtonElement>('#player-btn-open')!;
  const phetImportBtn = container.querySelector<HTMLButtonElement>('#player-btn-phet-import');
  const swfImportBtn = container.querySelector<HTMLButtonElement>('#player-btn-swf-import');
  const embedBtn = container.querySelector<HTMLButtonElement>('#player-btn-embed');
  const exportAirgapBtn = container.querySelector<HTMLButtonElement>('#player-btn-export-airgap');
  const drawerMount = container.querySelector<HTMLDivElement>('#player-drawer-mount-point');
  const swfDistillerStripMount = container.querySelector<HTMLDivElement>('#player-swf-distiller-strip');
  const fileInputHidden = container.querySelector<HTMLInputElement>('#media-player-file-input')!;
  const fullscreenBtn = container.querySelector<HTMLButtonElement>('#player-btn-fullscreen')!;
  const searchInput = container.querySelector<HTMLInputElement>('#cartridge-search-input')!;
  const stageFilterSelect = container.querySelector<HTMLSelectElement>('#stage-filter-select');
  const includeNonMediaCheckbox = container.querySelector<HTMLInputElement>('#toggle-include-nonmedia');
  const clearFiltersBtn = container.querySelector<HTMLButtonElement>('#btn-clear-catalog-filters');
  const resultsSummaryEl = container.querySelector<HTMLElement>('#catalog-results-summary');
  const recentStripEl = container.querySelector<HTMLDivElement>('#recent-labs-strip');
  const gridContainer = container.querySelector<HTMLDivElement>('#cartridges-grid')!;
  const catButtons = container.querySelectorAll<HTMLButtonElement>('.cat-pill-btn');
  const formatButtons = container.querySelectorAll<HTMLButtonElement>('.format-filter-btn');
  const iframeWrapper = container.querySelector<HTMLDivElement>('#player-iframe-wrapper')!;

  // Strict Typed postMessage Protocol between Host Chassis & Unified Cartridge Player Kernel
  type HostToPlayerMessage =
    | { type: 'SET_PRESET'; preset: string; play?: boolean }
    | { type: 'LOAD_CUSTOM_CARTRIDGE'; cartridge: CartridgeDefinition; play?: boolean }
    | { type: 'OPEN_STUDIO'; tab?: string; openSaveAs?: boolean }
    | { type: 'REMIX_SAVED_ACK'; message: string }
    | { type: 'NANO_REMIX_RESULT'; proposal: any }
    | { type: 'DISPATCH_ACTION'; action: string; args?: any[] }
    | { type: 'SET_VAR'; name: string; value: any }
    | { type: 'SET_VOICE'; enabled: boolean }
    | { type: 'SET_MUTED'; muted: boolean }
    | { type: 'SET_BSL'; enabled: boolean }
    | { type: 'TOGGLE_BSL' }
    | { type: 'REQUEST_SUBTITLE' }
    | { type: 'RESET_SIM' }
    | { type: 'PLAY' }
    | { type: 'PAUSE' }
    | { type: 'TOGGLE_PLAY' }
    | { type: 'REQUEST_JOTTER_CSV'; download?: boolean }
    | Record<string, any>;

  function postToPlayer(msg: HostToPlayerMessage) {
    iframe?.contentWindow?.postMessage(msg, '*');
  }

  let reqSeq = 0;
  const pendingRequests = new Map<
    string,
    { expectedType: string; resolve: (val: any) => void; reject: (err: Error) => void; timer: ReturnType<typeof setTimeout> }
  >();

  function postToPlayerWithAck<T = any>(
    msg: Record<string, any>,
    expectedType: string,
    timeoutMs = 5000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!iframe?.contentWindow) {
        reject(new Error('Simulation stage iframe is not ready yet.'));
        return;
      }
      const requestId = `req_${++reqSeq}_${Date.now()}`;
      const timer = setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          reject(new Error(`Timed out waiting for ${expectedType} from stage.`));
        }
      }, timeoutMs);

      pendingRequests.set(requestId, { expectedType, resolve, reject, timer });
      iframe.contentWindow.postMessage({ ...msg, requestId }, '*');
    });
  }

  const mcpTransport: PlayerMcpTransport = {
    readState: async (includeSvgBytes = true) => {
      const res = await postToPlayerWithAck<any>(
        { type: 'GET_ENGINE_STATE', includeSvgBytes },
        'ENGINE_STATE_RESPONSE'
      );
      return res?.state || null;
    },
    setVar: async (name: string, value: number | string) => {
      const res = await postToPlayerWithAck<any>(
        { type: 'SET_VAR', name, value },
        'SET_VAR_ACK'
      );
      return {
        name: res?.name || name,
        value: res?.value ?? value,
        clamped: Boolean(res?.clamped),
        state: res?.state || null,
      };
    },
    execActionTuple: async (tuple: string) => {
      const res = await postToPlayerWithAck<any>(
        { type: 'EXEC_ACTION_TUPLE', tuple },
        'EXEC_ACTION_RESULT'
      );
      return {
        ok: Boolean(res?.ok),
        executedActions: Array.isArray(res?.executedActions) ? res.executedActions : [],
        state: res?.state || null,
      };
    },
    onSay: (text: string) => {
      broadcastBslSpeech({ subtitle: text, isSpeaking: true });
    },
  };

  let webMcpHandle: WebMcpRegistrationHandle = registerWebMcpTools(mcpTransport);
  let mcpRegEpoch = 0;

  async function refreshPlayerWebMcpRegistration() {
    const epoch = ++mcpRegEpoch;
    const prevReady = webMcpHandle.ready;
    webMcpHandle.unregister();
    if (prevReady) {
      await prevReady.catch(() => {});
    }
    await Promise.resolve();
    if (!container.isConnected || epoch !== mcpRegEpoch) return;
    webMcpHandle = registerWebMcpTools(mcpTransport);
    benchTransport.mcpTools = webMcpHandle.tools;
  }

  bindSitePlayerAdapter({
    loadPreset: (presetId, autoplay = false) => {
      updatePreset(normalizePresetId(presetId), true);
      if (autoplay) postToPlayer({ type: 'PLAY' });
    },
    setVar: (name, value) => {
      postToPlayer({ type: 'SET_VAR', name, value });
    },
    highlight: (selector) => {
      postToPlayer({ type: 'EXEC_ACTION_TUPLE', tuple: `(:act :highlight "${selector}")` });
    },
    openTutor: (prompt?: string) => {
      activeDrawer = 'ai-tutor';
      renderActiveDrawer(true);
      if (prompt && mountedAiTutorHandle) {
        mountedAiTutorHandle.askQuestion(prompt, false);
      }
    },
    getActivePreset: () => activePreset,
  });

  let pageDisposed = false;
  let wasContainerConnected = false;
  let unmountObserver: MutationObserver | null = null;
  const cleanupPlayerLifecycle = () => {
    if (pageDisposed) return;
    pageDisposed = true;
    mcpRegEpoch++;
    webMcpHandle.unregister();
    bindSitePlayerAdapter(null);
    unmountObserver?.disconnect();
    unmountObserver = null;
    window.removeEventListener('pagehide', cleanupPlayerLifecycle);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('popstate', onPopState);
  };

  window.addEventListener('pagehide', cleanupPlayerLifecycle, { once: true });
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && document.body) {
    unmountObserver = new MutationObserver(() => {
      if (container.isConnected) {
        wasContainerConnected = true;
      } else if (wasContainerConnected) {
        cleanupPlayerLifecycle();
      }
    });
    unmountObserver.observe(document.body, { childList: true, subtree: true });
  }

  const benchTransport: EppBenchTransport = {
    startProfCapture: async () => {
      await postToPlayerWithAck<any>(
        { type: 'START_PROF_CAPTURE', ensurePlaying: true },
        'PROF_CAPTURE_STARTED'
      );
    },
    stopProfCapture: async (vsyncBudgetMs?: number): Promise<ProfilerCaptureResult> => {
      const res = await postToPlayerWithAck<any>(
        { type: 'STOP_PROF_CAPTURE', vsyncBudgetMs },
        'PROF_CAPTURE_RESULT'
      );
      return {
        stats: res.stats,
        memory: res.memory,
        activeMetrics: res.activeMetrics,
      };
    },
    mcpTransport,
    mcpTools: webMcpHandle.tools,
  };

  function focusPlayerStage() {
    try {
      iframe?.focus({ preventScroll: true });
      iframe?.contentWindow?.focus();
    } catch (_) {}
    postToPlayer({ type: 'FOCUS_STAGE' });
  }

  function updatePlayButtonUI(playing: boolean) {
    if (!playBtn) return;
    if (playing) {
      playBtn.style.background = '#2563eb';
      playBtn.style.borderColor = '#38bdf8';
      playBtn.title = 'Pause simulation loop (Spacebar)';
      if (playIcon) playIcon.textContent = '⏸';
      if (playText) playText.textContent = 'Pause';
    } else {
      playBtn.style.background = '#16a34a';
      playBtn.style.borderColor = '#22c55e';
      playBtn.title = 'Play simulation loop (Spacebar)';
      if (playIcon) playIcon.textContent = '▶';
      if (playText) playText.textContent = 'Play';
    }
  }

  let activeDrawer: 'embed' | 'ai-tutor' | 'lab' | 'diagnostics' | 'swf' | 'phet' | null = null;
  const importParam = params.get('import');
  let launcherImportPanel: 'swf' | 'phet' | null =
    !isStageOpen && (importParam === 'swf' || importParam === 'phet') ? importParam : null;
  let swfResult: any = null;
  let swfFileName = 'imported-swf';
  let swfSelectedMode: 'run' | 'run-to-convert' | 'quick-transform' = 'run-to-convert';
  let isParsingSwf = false;
  let swfError: string | null = null;
  let swfDragActive = false;
  let swfDrawerModulePromise: Promise<typeof import('../components/player/SwfTranspilerDrawer')> | null = null;
  let swfDistillerStripModulePromise: Promise<typeof import('../components/player/SwfDistillerStrip')> | null = null;
  let swfNativeDistillerModulePromise: Promise<typeof import('../utils/swfNativeDistiller')> | null = null;
  let phetDrawerModulePromise: Promise<typeof import('../components/player/PhetTranspilerDrawer')> | null = null;
  let swfDistillSession: {
    active: boolean;
    reviewOpen: boolean;
    lessonTitle: string;
    stageTag: string;
    format: 'Slide' | 'Sim';
    originalSwfBytes: number;
    states: any[];
    checkpoints: any[];
    isCapturing: boolean;
    isSweeping: boolean;
    isPolishing: boolean;
    statusNote: string | null;
    polishNote: string | null;
    pendingAutoAction: null | 'capture' | 'sweep';
  } = {
    active: false,
    reviewOpen: false,
    lessonTitle: 'Native Lesson',
    stageTag: 'KS3 CURRICULUM',
    format: 'Slide',
    originalSwfBytes: 0,
    states: [],
    checkpoints: [],
    isCapturing: false,
    isSweeping: false,
    isPolishing: false,
    statusNote: null,
    polishNote: null,
    pendingAutoAction: null,
  };
  let latestTelemetry: PlayerTelemetryEvent | null = null;
  let activeQuizContext: QuizCheckpointContext | null = null;
  let isAiDemonstrating = false;
  let embedTargetMode: PlayerDisplayMode = 'classroom';
  let copiedEmbed = false;
  let mountedDiagnosticsEl: HTMLElement | null = null;
  let mountedDiagnosticsPreset = '';
  let autoRunEppBenchOnce = false;
  let mountedAiTutorEl: HTMLElement | null = null;
  let mountedAiTutorHandle: NanoAiTutorDrawerHandle | null = null;
  let mountedAiTutorPreset = '';

  function showImportStatus(message: string, kind: 'success' | 'error' = 'success') {
    if (!importStatusEl || !importStatusTextEl) return;
    importStatusTextEl.textContent = message;
    importStatusEl.style.display = 'flex';
    if (kind === 'error') {
      importStatusEl.style.background = '#fef2f2';
      importStatusEl.style.border = '1px solid #fca5a5';
      importStatusEl.style.color = '#991b1b';
    } else {
      importStatusEl.style.background = '#f0fdf4';
      importStatusEl.style.border = '1px solid #86efac';
      importStatusEl.style.color = '#166534';
    }
  }

  function clearImportStatus() {
    if (importStatusEl) importStatusEl.style.display = 'none';
  }

  importStatusCloseBtn?.addEventListener('click', clearImportStatus);

  function loadSwfDrawerModule() {
    if (!swfDrawerModulePromise) {
      swfDrawerModulePromise = import('../components/player/SwfTranspilerDrawer');
    }
    return swfDrawerModulePromise;
  }

  function loadSwfDistillerStripModule() {
    if (!swfDistillerStripModulePromise) {
      swfDistillerStripModulePromise = import('../components/player/SwfDistillerStrip');
    }
    return swfDistillerStripModulePromise;
  }

  function loadSwfNativeDistillerModule() {
    if (!swfNativeDistillerModulePromise) {
      swfNativeDistillerModulePromise = import('../utils/swfNativeDistiller');
    }
    return swfNativeDistillerModulePromise;
  }

  function loadPhetDrawerModule() {
    if (!phetDrawerModulePromise) {
      phetDrawerModulePromise = import('../components/player/PhetTranspilerDrawer');
    }
    return phetDrawerModulePromise;
  }

  function resetSwfDistillSession() {
    swfDistillSession.active = false;
    swfDistillSession.reviewOpen = false;
    swfDistillSession.states = [];
    swfDistillSession.checkpoints = [];
    swfDistillSession.isCapturing = false;
    swfDistillSession.isSweeping = false;
    swfDistillSession.isPolishing = false;
    swfDistillSession.statusNote = null;
    swfDistillSession.polishNote = null;
    swfDistillSession.pendingAutoAction = null;
    renderSwfDistillerStripPanel();
  }

  function renderSwfDistillerStripPanel() {
    if (!swfDistillerStripMount) return;
    if (!swfDistillSession.active || !isStageOpen) {
      swfDistillerStripMount.style.display = 'none';
      swfDistillerStripMount.replaceChildren();
      return;
    }
    swfDistillerStripMount.style.display = 'block';
    loadSwfDistillerStripModule()
      .then(({ renderSwfDistillerStrip }) => {
        if (pageDisposed || !swfDistillerStripMount.isConnected || !swfDistillSession.active) return;
        const stripEl = renderSwfDistillerStrip({
          lessonTitle: swfDistillSession.lessonTitle,
          originalSwfBytes: swfDistillSession.originalSwfBytes,
          capturedStates: swfDistillSession.states,
          isCapturing: swfDistillSession.isCapturing,
          isSweeping: swfDistillSession.isSweeping,
          statusNote: swfDistillSession.statusNote,
          onCaptureState: () => {
            void captureCurrentSwfState(false);
          },
          onAutoSweep: () => {
            void sweepSwfStates(false);
          },
          onMoveState: (idx, delta) => {
            const target = idx + delta;
            if (target < 0 || target >= swfDistillSession.states.length) return;
            const next = swfDistillSession.states.slice();
            const [item] = next.splice(idx, 1);
            next.splice(target, 0, item);
            swfDistillSession.states = next;
            renderSwfDistillerStripPanel();
          },
          onRemoveState: (idx) => {
            swfDistillSession.states = swfDistillSession.states.filter((_, i) => i !== idx);
            swfDistillSession.statusNote = `Removed View ${idx + 1}.`;
            renderSwfDistillerStripPanel();
          },
          onOpenPromoteReview: () => {
            if (swfDistillSession.states.length === 0) return;
            swfDistillSession.reviewOpen = true;
            activeDrawer = 'swf';
            renderActiveDrawer(true);
          },
          onExitConvertMode: () => {
            resetSwfDistillSession();
            if (activeDrawer === 'swf') {
              activeDrawer = null;
              renderActiveDrawer();
            }
          },
        });
        swfDistillerStripMount.replaceChildren(stripEl);
      })
      .catch(() => {});
  }

  async function captureCurrentSwfState(silentIfDuplicate = false) {
    if (swfDistillSession.isCapturing || !isStageOpen) return;
    swfDistillSession.isCapturing = true;
    swfDistillSession.statusNote = null;
    renderSwfDistillerStripPanel();
    try {
      const [res, distiller] = await Promise.all([
        postToPlayerWithAck<any>({ type: 'CAPTURE_SWF_STATE' }, 'SWF_STATE_CAPTURED', 6000),
        loadSwfNativeDistillerModule(),
      ]);
      if (!res?.ok || !res.snapshot) {
        swfDistillSession.statusNote = res?.error || 'No visible vector shapes detected on the current frame.';
      } else {
        const snap = distiller.normalizeCapturedSnapshot(
          res.snapshot,
          swfDistillSession.states.length,
          swfDistillSession.lessonTitle
        );
        const isDup = swfDistillSession.states.some((s) => s.fingerprint === snap.fingerprint);
        if (isDup) {
          if (!silentIfDuplicate) {
            swfDistillSession.statusNote = `View already captured (Frame ${snap.frameNumber}) — interact with the SWF to reach a new screen first.`;
          }
        } else if (swfDistillSession.states.length >= 24) {
          swfDistillSession.statusNote = 'Reached the 24-view cap so your native cartridge stays ultra-light.';
        } else {
          swfDistillSession.states = [...swfDistillSession.states, snap];
          if (swfDistillSession.states.length === 1) {
            swfDistillSession.format = distiller.inferRecommendedFormat(swfDistillSession.states);
          }
          swfDistillSession.checkpoints = distiller.generateEcoCheckpoints(
            swfDistillSession.states,
            swfDistillSession.lessonTitle
          );
          swfDistillSession.statusNote = `Captured View ${swfDistillSession.states.length} (Frame ${snap.frameNumber}, ${snap.nodeCount} vector nodes).`;
        }
      }
    } catch (err: any) {
      swfDistillSession.statusNote = err?.message || 'Could not capture current stage state yet — try again once the Flash stage renders.';
    } finally {
      swfDistillSession.isCapturing = false;
      renderSwfDistillerStripPanel();
    }
  }

  async function sweepSwfStates(openReviewAfter = false) {
    if (swfDistillSession.isSweeping || !isStageOpen) return;
    swfDistillSession.isSweeping = true;
    swfDistillSession.statusNote = 'Auto-sweeping labeled frames and keyframes within a safe time budget...';
    renderSwfDistillerStripPanel();
    try {
      const [res, distiller] = await Promise.all([
        postToPlayerWithAck<any>(
          { type: 'SWEEP_SWF_STATES', maxStates: 10, budgetMs: 900 },
          'SWF_STATES_SWEPT',
          8000
        ),
        loadSwfNativeDistillerModule(),
      ]);
      const rawList = Array.isArray(res?.snapshots) ? res.snapshots : [];
      if (!res?.ok || rawList.length === 0) {
        swfDistillSession.statusNote = res?.error || 'Could not auto-detect additional frames; interact with the stage and click Capture State.';
      } else {
        const existingFps = new Set(swfDistillSession.states.map((s) => s.fingerprint));
        const added: any[] = [];
        for (const raw of rawList) {
          if (swfDistillSession.states.length + added.length >= 24) break;
          const norm = distiller.normalizeCapturedSnapshot(
            raw,
            swfDistillSession.states.length + added.length,
            swfDistillSession.lessonTitle
          );
          if (!existingFps.has(norm.fingerprint)) {
            existingFps.add(norm.fingerprint);
            added.push(norm);
          }
        }
        swfDistillSession.states = [...swfDistillSession.states, ...added];
        swfDistillSession.format = distiller.inferRecommendedFormat(swfDistillSession.states);
        swfDistillSession.checkpoints = distiller.generateEcoCheckpoints(
          swfDistillSession.states,
          swfDistillSession.lessonTitle
        );
        swfDistillSession.statusNote =
          added.length > 0
            ? `Auto-sweep captured ${added.length} distinct view${added.length === 1 ? '' : 's'} (${swfDistillSession.states.length} total).`
            : 'All swept frames were already captured. Interact with buttons on stage to reach new screens.';

        if (openReviewAfter && swfDistillSession.states.length > 0) {
          swfDistillSession.reviewOpen = true;
          activeDrawer = 'swf';
          renderActiveDrawer(true);
        }
      }
    } catch (err: any) {
      swfDistillSession.statusNote = err?.message || 'Auto-sweep timed out — use Capture State while interacting live.';
    } finally {
      swfDistillSession.isSweeping = false;
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
    launcherImportPanel = null;
    renderLauncherImportPanel();
    if (activeDrawer === 'swf') {
      activeDrawer = null;
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
    const cleanTitle = phetMeta?.title || `PhET: ${cleanId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}`;
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
    launcherImportPanel = null;
    renderLauncherImportPanel();
    if (activeDrawer === 'phet') {
      activeDrawer = null;
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
    launcherImportPanel = null;
    renderLauncherImportPanel();
    if (activeDrawer === 'swf') {
      activeDrawer = null;
      renderActiveDrawer();
    }
    refreshDropdown();
    launchCustomCartridge(cart);

    if (mode === 'run-to-convert' || mode === 'quick-transform') {
      swfDistillSession = {
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
      if (isIframeReady) {
        setTimeout(() => {
          if (pageDisposed || !swfDistillSession.active || !isStageOpen) return;
          const action = swfDistillSession.pendingAutoAction;
          swfDistillSession.pendingAutoAction = null;
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
        `⚡ Imported "${cart.title}" — Note: this SWF uses ActionScript 3.0 (AVM2/DoABC); vector graphics & timelines render in pure SVG, while interactive scripts require ActionScript 1.0/2.0 (AVM1).`,
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
    targetEl.innerHTML = '<div style="padding:12px; font-size:0.8rem; color:#94a3b8;">⏳ Loading Full PhET Simulation Transpiler...</div>';
    loadPhetDrawerModule()
      .then(({ renderPhetTranspilerDrawer }) => {
        if (pageDisposed || !targetEl.isConnected) return;
        const drawerEl = renderPhetTranspilerDrawer({
          setCustomSvgCode: () => {},
          setCustomAstCode: () => {},
          postToPlayer: (payload) => postToPlayer(payload),
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
    targetEl.innerHTML = '<div style="padding:12px; font-size:0.8rem; color:#94a3b8;">⏳ Loading Historic Flash (.swf) Transpiler...</div>';
    loadSwfDrawerModule()
      .then(({ renderSwfTranspilerDrawer }) => {
        if (pageDisposed || !targetEl.isConnected) return;
        const rerender = () => {
          if (mode === 'launcher' && launcherImportPanel === 'swf') {
            renderLauncherImportPanel();
          } else if (mode === 'stage' && activeDrawer === 'swf') {
            renderActiveDrawer(true);
          }
        };
        const drawerEl = renderSwfTranspilerDrawer({
          swfResult,
          setSwfResult: (val) => {
            swfResult = val;
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
          swfFileName,
          setSwfFileName: (name) => {
            swfFileName = name;
          },
          selectedMode: swfSelectedMode,
          setSelectedMode: (m) => {
            swfSelectedMode = m;
          },
          setCustomSvgCode: () => {},
          setCustomAstCode: () => {},
          postToPlayer: (payload) => postToPlayer(payload),
          setHotReloadFlash: () => {},
          onLaunchCartridge: (res, name, launchMode) => saveAndLaunchTranspiledSwf(res, name, launchMode || swfSelectedMode),
          distillReview: swfDistillSession.reviewOpen
            ? {
                reviewOpen: true,
                lessonTitle: swfDistillSession.lessonTitle,
                stageTag: swfDistillSession.stageTag,
                format: swfDistillSession.format,
                states: swfDistillSession.states,
                checkpoints: swfDistillSession.checkpoints,
                originalSwfBytes: swfDistillSession.originalSwfBytes,
                isPolishing: swfDistillSession.isPolishing,
                polishNote: swfDistillSession.polishNote,
              }
            : null,
          onUpdateDistillReview: (patch) => {
            Object.assign(swfDistillSession, patch);
            rerender();
            renderSwfDistillerStripPanel();
          },
          onBackToLiveCapture: () => {
            swfDistillSession.reviewOpen = false;
            if (activeDrawer === 'swf') {
              activeDrawer = null;
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
    if (!launcherSwfMount) return;
    if (launcherSwfBtn) {
      launcherSwfBtn.setAttribute('aria-expanded', String(launcherImportPanel === 'swf'));
      launcherSwfBtn.style.background = launcherImportPanel === 'swf' ? '#fef3c7' : '#fffbeb';
      launcherSwfBtn.style.borderColor = launcherImportPanel === 'swf' ? '#b45309' : '#d97706';
    }
    if (launcherPhetBtn) {
      launcherPhetBtn.setAttribute('aria-expanded', String(launcherImportPanel === 'phet'));
      launcherPhetBtn.style.background = launcherImportPanel === 'phet' ? '#bae6fd' : '#e0f2fe';
      launcherPhetBtn.style.borderColor = launcherImportPanel === 'phet' ? '#0369a1' : '#0284c7';
    }
    if (!launcherImportPanel) {
      launcherSwfMount.style.display = 'none';
      launcherSwfMount.replaceChildren();
      return;
    }
    launcherSwfMount.style.display = 'block';
    const closePanel = () => {
      launcherImportPanel = null;
      renderLauncherImportPanel();
    };
    if (launcherImportPanel === 'phet') {
      renderPhetPanelInto(launcherSwfMount, closePanel);
    } else {
      renderSwfPanelInto(launcherSwfMount, 'launcher', closePanel);
    }
  }

  function renderActiveDrawer(forceRebuild = false) {
    if (!drawerMount) return;

    // Preserve interactive diagnostics DOM and live benchmark state across telemetry ticks
    if (
      activeDrawer === 'diagnostics' &&
      !forceRebuild &&
      mountedDiagnosticsEl &&
      mountedDiagnosticsEl.isConnected &&
      mountedDiagnosticsPreset === activePreset
    ) {
      return;
    }

    // Preserve active Gemini Nano Co-Pilot chatLog & quiz state across telemetry ticks
    if (
      activeDrawer === 'ai-tutor' &&
      !forceRebuild &&
      mountedAiTutorEl &&
      mountedAiTutorEl.isConnected &&
      mountedAiTutorPreset === activePreset
    ) {
      mountedAiTutorHandle?.updateTelemetry(latestTelemetry);
      return;
    }

    drawerMount.innerHTML = '';
    if (activeDrawer !== 'diagnostics') {
      mountedDiagnosticsEl = null;
      mountedDiagnosticsPreset = '';
    }
    if (activeDrawer !== 'ai-tutor') {
      mountedAiTutorEl = null;
      mountedAiTutorHandle = null;
      mountedAiTutorPreset = '';
    }

    if (aiTutorBtn) {
      aiTutorBtn.style.background = activeDrawer === 'ai-tutor' ? '#581c87' : '#1e293b';
      aiTutorBtn.style.borderColor = activeDrawer === 'ai-tutor' ? '#c084fc' : '#9333ea';
    }
    if (labDrawerBtn) {
      labDrawerBtn.style.background = activeDrawer === 'lab' ? '#0369a1' : '#1e293b';
      labDrawerBtn.style.borderColor = activeDrawer === 'lab' ? '#38bdf8' : '#0284c7';
    }
    if (embedBtn) {
      embedBtn.style.background = activeDrawer === 'embed' ? '#065f46' : '#1e293b';
      embedBtn.style.borderColor = activeDrawer === 'embed' ? '#34d399' : '#059669';
    }
    if (diagnosticsBtn) {
      diagnosticsBtn.style.background = activeDrawer === 'diagnostics' ? '#14532d' : '#1e293b';
      diagnosticsBtn.style.borderColor = activeDrawer === 'diagnostics' ? '#4ade80' : '#16a34a';
    }
    if (swfImportBtn) {
      swfImportBtn.style.background = activeDrawer === 'swf' ? '#78350f' : '#1e293b';
      swfImportBtn.style.borderColor = activeDrawer === 'swf' ? '#fbbf24' : '#d97706';
    }
    if (phetImportBtn) {
      phetImportBtn.style.background = activeDrawer === 'phet' ? '#075985' : '#1e293b';
      phetImportBtn.style.borderColor = activeDrawer === 'phet' ? '#38bdf8' : '#0284c7';
    }

    if (!activeDrawer) {
      drawerMount.style.display = 'none';
      return;
    }

    drawerMount.style.display = 'block';

    if (activeDrawer === 'ai-tutor') {
      const drawerEl = renderNanoAiTutorDrawer({
        isOpen: true,
        onClose: () => {
          activeDrawer = null;
          renderActiveDrawer();
        },
        preset: activePreset,
        postToPlayer: (payload) => postToPlayer(payload),
        latestTelemetry,
        activeQuiz: activeQuizContext,
        isAiDemonstrating,
        onCancelDemonstration: () => {
          isAiDemonstrating = false;
          mountedAiTutorHandle?.setDemonstrating(false);
        },
      });
      if (drawerEl) {
        mountedAiTutorEl = drawerEl;
        mountedAiTutorHandle = (drawerEl as any).__nanoDrawerHandle || null;
        mountedAiTutorPreset = activePreset;
        drawerMount.appendChild(drawerEl);
      }
    } else if (activeDrawer === 'lab') {
      const drawerEl = renderAstInteractiveLabDrawer({
        isOpen: true,
        onClose: () => {
          activeDrawer = null;
          renderActiveDrawer();
        },
        preset: activePreset,
      });
      if (drawerEl) drawerMount.appendChild(drawerEl);
    } else if (activeDrawer === 'diagnostics') {
      const activeMeta = getPresetMeta(activePreset);
      const shouldAutoRun = autoRunEppBenchOnce;
      autoRunEppBenchOnce = false;
      const drawerEl = renderEppDiagnosticsDrawer({
        onClose: () => {
          activeDrawer = null;
          mountedDiagnosticsEl = null;
          mountedDiagnosticsPreset = '';
          renderActiveDrawer();
        },
        presetId: activePreset,
        presetLabel: activeMeta.label,
        presetType: activeMeta.type || 'Sim',
        postToPlayer: (payload) => postToPlayer(payload),
        benchTransport,
        webMcpHandle,
        autoRunBenchmark: shouldAutoRun,
        onAutoRunConsumed: () => {
          autoRunEppBenchOnce = false;
        },
      });
      mountedDiagnosticsEl = drawerEl;
      mountedDiagnosticsPreset = activePreset;
      drawerMount.appendChild(drawerEl);
    } else if (activeDrawer === 'embed') {
      const getEmbedSnippet = (mode: PlayerDisplayMode) =>
        `<iframe src="${window.location.origin}${base}player.html?preset=${activePreset}&mode=${mode}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`;

      const drawerEl = renderPlayerEmbedModal({
        isOpen: true,
        onClose: () => {
          activeDrawer = null;
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
            if (activeDrawer === 'embed') renderActiveDrawer();
          }, 2000);
        },
        embedCode: getEmbedSnippet(embedTargetMode),
      });

      if (drawerEl) {
        drawerMount.appendChild(drawerEl);
      }
    } else if (activeDrawer === 'swf') {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'padding:16px 18px; color:#f8fafc;';
      drawerMount.appendChild(wrap);
      renderSwfPanelInto(wrap, 'stage', () => {
        activeDrawer = null;
        renderActiveDrawer();
      });
    } else if (activeDrawer === 'phet') {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'padding:16px 18px; color:#f8fafc;';
      drawerMount.appendChild(wrap);
      renderPhetPanelInto(wrap, () => {
        activeDrawer = null;
        renderActiveDrawer();
      });
    }
  }

  function refreshDropdown() {
    if (select) {
      select.innerHTML = buildOptionsHtml(activePreset);
      select.value = activePreset;
    }
  }

  let isIframeReady = false;
  iframe?.addEventListener('load', () => {
    isIframeReady = true;
    const activeLang = getSavedLanguage();
    if (activeLang && activeLang !== 'en') {
      try {
        iframe.contentWindow?.postMessage({ type: 'SET_LANGUAGE', lang: activeLang }, '*');
      } catch {}
    }
  });

  let lastLiveIntegrity: Record<string, any> | null = null;

  function renderIntegrityReadoutContent(presetId: string, liveInfo?: Record<string, any> | null) {
    if (!integrityReadoutBodyEl) return;
    integrityReadoutBodyEl.innerHTML = buildIntegrityReadoutHtml(presetId, liveInfo);
  }

  function updateHostIntegrityBadge(presetId: string, liveInfo?: Record<string, any> | null) {
    if (!integrityBadgeEl) return;
    const cleanId = normalizePresetId(presetId);
    const customOverride = getCustomCartridges().some((c) => c.id === cleanId && c.source !== 'builtin');
    const rec = getRegisteredRecord(cleanId);
    lastLiveIntegrity = liveInfo || null;

    const effectiveStatus = liveInfo?.status
      || (rec && customOverride ? 'tampered' : rec ? 'verified-native' : 'unverified-external');

    if (effectiveStatus === 'verified-native') {
      const code = (liveInfo?.shortHash || rec?.seal || '').slice(0, 6);
      integrityBadgeEl.textContent = code ? `🛡️ St Joseph's Curriculum • ${code}` : "🛡️ St Joseph's Curriculum";
      integrityBadgeEl.style.background = 'rgba(16,185,129,0.16)';
      integrityBadgeEl.style.color = '#34d399';
      integrityBadgeEl.style.borderColor = 'rgba(16,185,129,0.45)';
      integrityBadgeEl.title = liveInfo?.badgeTooltip
        || `Verified St Joseph's Curriculum Cartridge (${rec?.title || cleanId}) • Authority Seal: ${formatShortHash(rec?.seal || '')} — Click to inspect SHA-256 digests`;
    } else if (effectiveStatus === 'tampered') {
      const code = (liveInfo?.shortHash || rec?.seal || '').slice(0, 6);
      integrityBadgeEl.textContent = code ? `✎ Altered • ${code}` : '✎ Altered';
      integrityBadgeEl.style.background = 'rgba(245,158,11,0.18)';
      integrityBadgeEl.style.color = '#fbbf24';
      integrityBadgeEl.style.borderColor = 'rgba(245,158,11,0.5)';
      integrityBadgeEl.title = liveInfo?.badgeTooltip
        || `Altered / Remixed Cartridge (${cleanId}) — Live SHA-256 differs from St Joseph's Curriculum seal. Click to inspect.`;
    } else {
      integrityBadgeEl.textContent = '◈ Custom / Vault';
      integrityBadgeEl.style.background = 'rgba(148,163,184,0.16)';
      integrityBadgeEl.style.color = '#cbd5e1';
      integrityBadgeEl.style.borderColor = 'rgba(148,163,184,0.4)';
      integrityBadgeEl.title = liveInfo?.badgeTooltip
        || `Custom or external cartridge (${cleanId}) — Click to inspect SHA-256 provenance`;
    }

    renderIntegrityReadoutContent(cleanId, liveInfo || (customOverride && rec ? { status: 'tampered', seal: rec.seal } : null));
  }

  integrityBadgeEl?.addEventListener('click', () => {
    if (!integrityReadoutEl) return;
    const isHidden = integrityReadoutEl.style.display === 'none';
    renderIntegrityReadoutContent(activePreset, lastLiveIntegrity);
    integrityReadoutEl.style.display = isHidden ? 'flex' : 'none';
  });

  integrityReadoutCloseBtn?.addEventListener('click', () => {
    if (integrityReadoutEl) integrityReadoutEl.style.display = 'none';
  });

  function syncLauncherStageVisibility(itemMeta?: ScenePresetOption) {
    if (stageShell) stageShell.style.display = isStageOpen ? 'block' : 'none';
    if (catalogSection) catalogSection.style.display = isStageOpen ? 'none' : 'block';
    const catholicBanner = container.querySelector<HTMLElement>('#catholic-sanctuary-banner');
    if (catholicBanner) {
      const m = itemMeta || getPresetMeta(activePreset);
      catholicBanner.style.display = isStageOpen && isCatholicPreset(m) ? 'flex' : 'none';
    }
    if (breadcrumbLabsBtn) {
      breadcrumbLabsBtn.style.cursor = isStageOpen ? 'pointer' : 'default';
      breadcrumbLabsBtn.style.textDecoration = isStageOpen ? 'underline' : 'none';
    }
    if (breadcrumbSepEl) breadcrumbSepEl.style.display = isStageOpen ? 'inline' : 'none';
    if (breadcrumbActiveEl) {
      breadcrumbActiveEl.style.display = isStageOpen ? 'inline' : 'none';
      if (itemMeta) breadcrumbActiveEl.textContent = itemMeta.label;
    }
  }

  function closeStageToLauncher(updateHistory = true) {
    if (!isStageOpen) return;
    isStageOpen = false;
    isIframeReady = false;
    pendingCustomCartridge = null;
    initialExternalSrc = null;
    activeDrawer = null;
    renderActiveDrawer();
    resetSwfDistillSession();
    if (integrityReadoutEl) integrityReadoutEl.style.display = 'none';
    // Unload the stage iframe completely to stop audio/physics loops and free RAM on low-spec hardware
    if (iframe) {
      iframe.src = 'about:blank';
    }
    updatePlayButtonUI(false);
    syncLauncherStageVisibility();
    if (updateHistory) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('preset');
      cleanUrl.searchParams.delete('app');
      cleanUrl.searchParams.delete('src');
      cleanUrl.searchParams.delete('file');
      window.history.pushState({ launcher: true }, '', cleanUrl.toString());
    }
    renderGrid();
    requestAnimationFrame(() => {
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  backToGridBtn?.addEventListener('click', () => closeStageToLauncher(true));
  breadcrumbLabsBtn?.addEventListener('click', () => {
    if (isStageOpen) closeStageToLauncher(true);
  });
  launcherImportBtn?.addEventListener('click', () => {
    fileInputHidden?.click();
  });
  launcherPhetBtn?.addEventListener('click', () => {
    launcherImportPanel = launcherImportPanel === 'phet' ? null : 'phet';
    renderLauncherImportPanel();
  });
  launcherSwfBtn?.addEventListener('click', () => {
    launcherImportPanel = launcherImportPanel === 'swf' ? null : 'swf';
    renderLauncherImportPanel();
  });
  if (launcherImportPanel) {
    renderLauncherImportPanel();
  }

  function updatePreset(presetId: string, skipPostMessage = false, pushHistoryIfOpening = true) {
    if (presetId === '__custom_find__' || presetId === '__open_local__') return;
    const safePresetId = normalizePresetId(presetId);
    const wasStageOpen = isStageOpen;
    isStageOpen = true;
    activePreset = safePresetId;
    recordRecentPreset(safePresetId);
    const item = getPresetMeta(safePresetId);
    if (titleEl) titleEl.textContent = item.label;
    if (stageBadgeEl) stageBadgeEl.textContent = item.stage;
    if (typeBadgeEl) typeBadgeEl.textContent = item.type || 'Sim';
    updateHostIntegrityBadge(safePresetId, null);
    if (select) {
      if (isNonMediaOrUtility(item)) refreshDropdown();
      else select.value = safePresetId;
    }

    syncLauncherStageVisibility(item);

    initialExternalSrc = null;
    const localCustomCart = getCustomCartridges().find(
      (c) => c.id === safePresetId && c.source !== 'builtin' && Boolean(c.svgMarkup || c.astSource)
    ) || null;
    // Lazily inflate requested built-in curriculum/data cartridge into native IndexedDB (skip for Local Vault custom cartridges)
    if (!localCustomCart && safePresetId !== 'lumina-architecture') {
      inflateCartridgeToVault(safePresetId, getRegisteredRecord(safePresetId)?.seal).catch(() => {});
    }
    const iframeIsUnloaded = !iframe || !iframe.src || iframe.src === 'about:blank' || iframe.getAttribute('src') === 'about:blank';
    if (!skipPostMessage && isIframeReady && !iframeIsUnloaded && iframe && iframe.contentWindow) {
      if (localCustomCart) {
        lastMountedCustomPresetId = localCustomCart.id;
        lastMountedCustomAt = Date.now();
        postToPlayer({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: localCustomCart, play: true });
      } else {
        postToPlayer({ type: 'SET_PRESET', preset: safePresetId, play: true });
      }
      focusPlayerStage();
    } else if (iframe && (iframeIsUnloaded || !isIframeReady)) {
      isIframeReady = false;
      if (localCustomCart && !pendingCustomCartridge) {
        pendingCustomCartridge = localCustomCart;
      }
      iframe.src = buildPlayerSrc(base, safePresetId, bslActive, null, Boolean(localCustomCart || pendingCustomCartridge));
    }

    // Broadcast lesson change to BSL interpreter
    broadcastBslSpeech({ subtitle: `${item.label}. ${item.stage}`, isSpeaking: true });

    // Cleanly cycle AbortSignal registration for document.modelContext when switching cartridges
    void refreshPlayerWebMcpRegistration();

    if (activeDrawer) {
      renderActiveDrawer();
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('src');
    nextUrl.searchParams.delete('file');
    nextUrl.searchParams.delete('app');
    nextUrl.searchParams.set('preset', safePresetId);
    if (!wasStageOpen && pushHistoryIfOpening) {
      window.history.pushState({ preset: safePresetId }, '', nextUrl.toString());
    } else {
      window.history.replaceState({ preset: safePresetId }, '', nextUrl.toString());
    }

    renderGrid();
    if (!wasStageOpen) {
      requestAnimationFrame(() => {
        if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  const onPopState = () => {
    const p = new URLSearchParams(window.location.search);
    const nextPreset = p.get('preset') || p.get('app');
    const nextSrc = p.get('src') || p.get('file');
    if (nextPreset) {
      updatePreset(nextPreset, false, false);
    } else if (nextSrc) {
      isStageOpen = true;
      initialExternalSrc = nextSrc;
      isIframeReady = false;
      syncLauncherStageVisibility();
      if (iframe) iframe.src = buildPlayerSrc(base, activePreset, bslActive, nextSrc);
    } else if (isStageOpen) {
      closeStageToLauncher(false);
    }
  };
  window.addEventListener('popstate', onPopState);

  function launchCustomCartridge(cart: CartridgeDefinition) {
    const alreadyLive = Boolean(isIframeReady && iframe?.contentWindow && iframe.getAttribute('src') !== 'about:blank');
    lastMountedCustomPresetId = cart.id;
    lastMountedCustomAt = Date.now();
    if (!alreadyLive) {
      pendingCustomCartridge = cart;
    }
    updatePreset(cart.id, true);
    if (alreadyLive && iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: cart, play: true }, '*');
      focusPlayerStage();
    }
  }

  async function handleUploadedFiles(files: File[]) {
    clearImportStatus();
    try {
      const cart = await ingestUploadedCartridgeFiles(files);
      if (cart) {
        refreshDropdown();
        launchCustomCartridge(cart);
        const isAs3Swf = Array.isArray(cart.invariants) && cart.invariants.some((inv) => inv.includes('ActionScript 3.0'));
        if (isAs3Swf) {
          showImportStatus(
            `⚡ Imported "${cart.title}" — Note: this SWF uses ActionScript 3.0 (AVM2/DoABC); vector graphics & timelines render in pure SVG, while interactive scripts require ActionScript 1.0/2.0 (AVM1).`,
            'success'
          );
        } else {
          showImportStatus(`✓ Imported "${cart.title}" into Local Vault & launched on stage.`, 'success');
        }
      } else {
        showImportStatus(
          'Unsupported file format. Drop or choose a Flash (.swf), PhET (.html / .phet), Cartridge (.json), .ast, or .svg file.',
          'error'
        );
      }
    } catch (err: any) {
      console.error('[media-player] Error ingesting uploaded files:', err);
      showImportStatus(`Import failed: ${err?.message || 'Could not parse the selected file.'}`, 'error');
    }
  }

  async function loadExternalSwfUrl(swfUrl: string) {
    try {
      const safeUrl = swfUrl.trim();
      if (!safeUrl || /^javascript:/i.test(safeUrl)) return;
      showImportStatus(`⚡ Fetching & transpiling Flash SWF (${safeUrl})...`, 'success');
      const res = await fetch(safeUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${safeUrl}`);
      const buf = await res.arrayBuffer();
      const rawFile = safeUrl.split(/[?#]/)[0].split('/').pop() || 'imported.swf';
      const file = new File([buf], rawFile.endsWith('.swf') ? rawFile : `${rawFile}.swf`, {
        type: 'application/x-shockwave-flash',
      });
      await handleUploadedFiles([file]);
    } catch (err: any) {
      console.error('[media-player] Failed loading external SWF URL:', swfUrl, err);
      showImportStatus(`Could not load Flash SWF from URL: ${err?.message || 'fetch error'}`, 'error');
    }
  }

  function renderRecentStrip() {
    if (!recentStripEl) return;
    const recentIds = getRecentPresetIds().filter((id) => !isStageOpen || id !== activePreset);
    const items = recentIds
      .map((id) => ALL_BUILTIN_PRESETS.find((p) => p.id === id))
      .filter((p): p is ScenePresetOption => Boolean(p))
      .slice(0, 4);

    if (items.length === 0) {
      recentStripEl.style.display = 'none';
      recentStripEl.replaceChildren();
      return;
    }

    recentStripEl.style.display = 'flex';
    recentStripEl.innerHTML = `
      <span style="color:#64748b; font-weight:700;">Recently opened:</span>
      ${items.map((p) => `
        <button type="button" class="recent-lab-btn" data-id="${escapeHtml(p.id)}" style="padding:3px 10px; border-radius:6px; border:1px solid #e2e8f0; background:#f8fafc; color:#0f172a; font-size:0.76rem; font-weight:600; cursor:pointer; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${escapeHtml(p.label)}
        </button>
      `).join('')}
    `;
    recentStripEl.querySelectorAll('.recent-lab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) updatePreset(id);
      });
    });
  }

  function renderGrid() {
    if (!gridContainer) return;
    renderRecentStrip();

    const q = searchQuery.toLowerCase().trim();
    const allAvailable = getAllAvailablePresets(includeNonMediaExtras);
    const filtered = allAvailable.filter((p) => {
      const matchSubject = activeSubject === 'All' || getNormalizedSubject(p) === activeSubject;
      let matchFormat = true;
      if (activeFormat === '3D') matchFormat = Boolean(p.has3D);
      else if (activeFormat !== 'All') matchFormat = (p.type || 'Sim') === activeFormat;

      const matchStage = matchesKeyStage(p, activeStage);
      const matchQ = !q ||
        p.label.toLowerCase().includes(q) ||
        p.stage.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.subject || '').toLowerCase().includes(q) ||
        (p.oakUnit || '').toLowerCase().includes(q);
      return matchSubject && matchFormat && matchStage && matchQ;
    });

    const hasActiveFilters = Boolean(q || activeSubject !== 'All' || activeFormat !== 'All' || activeStage !== 'All' || includeNonMediaExtras);
    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
    }
    if (resultsSummaryEl) {
      const scopeLabel = includeNonMediaExtras ? 'activities (including recall data & docs)' : 'visual labs & lessons';
      const masterShort = getMasterRegistryChecksum().slice(0, 8);
      resultsSummaryEl.textContent = `Showing ${filtered.length} of ${allAvailable.length} ${scopeLabel} · 🛡️ ${getTotalCertifiedCartridges()} Verified to St Joseph's Curriculum (Master SHA-256: ${masterShort}…)`;
    }

    gridContainer.innerHTML = buildCatalogGridHtml({
      filtered,
      isStageOpen,
      activePreset,
      activeSubject,
    });

    if (filtered.length === 0) return;

    gridContainer.querySelectorAll<HTMLButtonElement>('.subject-focus-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const nextSubj = (btn.getAttribute('data-focus-subject') as SubjectFilterId) || 'All';
        activeSubject = nextSubj;
        syncSubjectTabStyles();
        renderGrid();
      });
    });

    gridContainer.querySelectorAll<HTMLElement>('.cartridge-card').forEach((card) => {
      const launchCard = () => {
        unlockMobilePwaAudioForIframe(iframe);
        const id = card.getAttribute('data-id');
        if (id) updatePreset(id);
      };
      card.addEventListener('click', launchCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          launchCard();
        }
      });
    });
  }

  function loadBuiltinPhetModel(key: SupportedPhetPreset) {
    const cart = buildBuiltinPhetCartridge(key);
    if (cart) {
      refreshDropdown();
      launchCustomCartridge(cart);
      return;
    }
    updatePreset(`phet-${key}`);
  }

  // Preset selector change
  select?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === '__open_local__') {
      select.value = activePreset;
      fileInputHidden?.click();
    } else if (val === '__phet_ohms_law__' || val === 'phet-ohms-law') {
      loadBuiltinPhetModel('ohms-law');
    } else if (val === '__phet_faraday__' || val === 'phet-faraday') {
      loadBuiltinPhetModel('faraday');
    } else if (val === '__phet_pendulum__' || val === 'phet-pendulum') {
      loadBuiltinPhetModel('pendulum');
    } else if (val === '__phet_acid_base__' || val === 'phet-acid-base') {
      loadBuiltinPhetModel('acid-base');
    } else if (val === '__phet_balancing__' || val === 'phet-balancing-chemical') {
      loadBuiltinPhetModel('balancing-chemical');
    } else if (val === '__custom_find__') {
      select.value = activePreset;
      closeStageToLauncher(true);
      searchInput?.focus();
    } else {
      updatePreset(val);
    }
  });

  // Open button wiring
  openBtn?.addEventListener('click', () => {
    fileInputHidden?.click();
  });

  fileInputHidden?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length) {
      handleUploadedFiles(Array.from(target.files));
      target.value = '';
    }
  });

  // Drag & drop file loading on stage wrapper and Grid Launcher
  [iframeWrapper, catalogSection].forEach((dropTarget) => {
    if (!dropTarget) return;
    dropTarget.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropTarget.style.outline = '3px dashed #38bdf8';
      dropTarget.style.outlineOffset = '-4px';
    });
    dropTarget.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropTarget.style.outline = 'none';
    });
    dropTarget.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropTarget.style.outline = 'none';
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        handleUploadedFiles(Array.from(e.dataTransfer.files));
      }
    });
  });

  // Wire Play, Reset & BSL Toolbar buttons (invoke same-origin iframe synchronously to preserve user activation)
  playBtn?.addEventListener('click', () => {
    unlockMobilePwaAudioForIframe(iframe);
    if (!invokeSameOriginPlayerAction(iframe, 'togglePlay')) {
      postToPlayer({ type: 'TOGGLE_PLAY' });
    }
    focusPlayerStage();
  });

  resetBtn?.addEventListener('click', () => {
    unlockMobilePwaAudioForIframe(iframe);
    if (!invokeSameOriginPlayerAction(iframe, 'reset')) {
      postToPlayer({ type: 'RESET_SIM' });
    }
    focusPlayerStage();
  });

  function updateMuteUi(muted: boolean) {
    if (muteBtn) {
      muteBtn.style.background = muted ? '#451a03' : '#1e293b';
      muteBtn.style.borderColor = muted ? '#d97706' : '#334155';
      muteBtn.title = muted ? 'Unmute simulation audio (M)' : 'Mute simulation audio (M)';
    }
    const icon = container.querySelector('#player-mute-icon');
    const text = container.querySelector('#player-mute-text');
    if (icon) icon.textContent = muted ? '🔇' : '🔊';
    if (text) text.textContent = muted ? 'Muted' : 'Audio ON';
  }

  muteBtn?.addEventListener('click', () => {
    const nextVoice = toggleVoice();
    setSoundEnabled(nextVoice);
    const muted = !nextVoice;
    if (nextVoice) {
      unlockMobilePwaAudioForIframe(iframe);
    }
    isMuted = muted;
    updateMuteUi(muted);
    if (!invokeSameOriginPlayerAction(iframe, 'setAudioState', { voiceEnabled: nextVoice, muted })) {
      postToPlayer({ type: 'SET_VOICE', enabled: nextVoice });
      postToPlayer({ type: 'SET_MUTED', muted });
    }
  });

  bslBtn?.addEventListener('click', () => {
    toggleBsl();
  });

  function updateBslUi(enabled: boolean) {
    if (bslBtn) {
      bslBtn.textContent = `🖐️ BSL Signing: ${enabled ? 'ON' : 'OFF'}`;
      bslBtn.style.background = enabled ? '#0284c7' : '#1e293b';
      bslBtn.style.borderColor = enabled ? '#38bdf8' : '#334155';
    }
  }

  // Subscribe to universal BSL state across top nav or keyboard shortcuts
  subscribeBsl((enabled) => {
    if (bslActive !== enabled) {
      bslActive = enabled;
      updateBslUi(enabled);
      postToPlayer({ type: 'SET_BSL', enabled });
      if (enabled && isStageOpen) {
        postToPlayer({ type: 'REQUEST_SUBTITLE' });
      }
    }
  });

  // Synchronize voice narration and master mute between host and simulator iframe
  subscribeVoice((enabled) => {
    try {
      const muted = !enabled;
      isMuted = muted;
      updateMuteUi(muted);
      postToPlayer({ type: 'SET_VOICE', enabled });
      postToPlayer({ type: 'SET_MUTED', muted });
    } catch (_) {}
  });

  // Keyboard accessibility shortcuts: M to toggle mute, Space to toggle play/pause (active only when stage is open)
  const onKeyDown = (e: KeyboardEvent) => {
    if (!isStageOpen) return;
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      muteBtn?.click();
    } else if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      playBtn?.click();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  window.addEventListener('message', (e) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.requestId && pendingRequests.has(e.data.requestId)) {
      const pending = pendingRequests.get(e.data.requestId)!;
      if (e.data.type === pending.expectedType) {
        clearTimeout(pending.timer);
        pendingRequests.delete(e.data.requestId);
        pending.resolve(e.data);
        return;
      }
    }
    if (e.data.type === 'PLAYER_READY') {
      if (!isStageOpen) return;
      isIframeReady = true;
      postToPlayer({ type: 'SET_VOICE', enabled: !isMuted });
      postToPlayer({ type: 'SET_MUTED', muted: isMuted });
      if (bslActive) {
        postToPlayer({ type: 'SET_BSL', enabled: true });
        postToPlayer({ type: 'REQUEST_SUBTITLE' });
      }
      if (pendingCustomCartridge) {
        const queued = pendingCustomCartridge;
        pendingCustomCartridge = null;
        lastMountedCustomPresetId = queued.id;
        lastMountedCustomAt = Date.now();
        postToPlayer({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: queued, play: true });
      } else if (initialExternalSrc) {
        initialExternalSrc = null;
      } else if (activePreset && (!e.data.preset || e.data.preset !== activePreset)) {
        const activeCustomCart = getCustomCartridges().find(
          (c) => c.id === activePreset && c.source !== 'builtin' && Boolean(c.svgMarkup || c.astSource)
        );
        if (activeCustomCart) {
          lastMountedCustomPresetId = activeCustomCart.id;
          lastMountedCustomAt = Date.now();
          postToPlayer({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: activeCustomCart, play: true });
        } else {
          postToPlayer({ type: 'SET_PRESET', preset: activePreset, play: false });
        }
      }
      updatePlayButtonUI(Boolean(e.data.isPlaying));

      if (swfDistillSession.active && swfDistillSession.pendingAutoAction) {
        setTimeout(() => {
          if (pageDisposed || !swfDistillSession.active || !isStageOpen) return;
          const action = swfDistillSession.pendingAutoAction;
          swfDistillSession.pendingAutoAction = null;
          if (action === 'sweep') {
            void sweepSwfStates(true);
          } else if (action === 'capture') {
            void captureCurrentSwfState(true);
          }
        }, 550);
      }

      if (pendingAutoEppBench && (!e.data.preset || e.data.preset === activePreset)) {
        pendingAutoEppBench = false;
        setTimeout(() => {
          if (!container.isConnected || pageDisposed) return;
          if (teacherToolsGroup) {
            teacherToolsGroup.style.display = 'inline-flex';
          }
          if (teacherToolsBtn) {
            teacherToolsBtn.setAttribute('aria-expanded', 'true');
            teacherToolsBtn.style.background = '#1e293b';
            teacherToolsBtn.style.color = '#f8fafc';
            teacherToolsBtn.textContent = '🧰 Teacher Tools ▴';
          }
          activeDrawer = 'diagnostics';
          autoRunEppBenchOnce = true;
          renderActiveDrawer(true);
        }, 150);
      }
    }
    if ((e.data.type === 'PLAY_STATE_CHANGED' || e.data.type === 'STATE_CHANGED' || e.data.type === 'statechange') && typeof (e.data.isPlaying ?? e.data.playing) === 'boolean') {
      const playing = Boolean(e.data.isPlaying ?? e.data.playing);
      updatePlayButtonUI(playing);
    }
    if ((e.data.type === 'PRESETCHANGE' || e.data.type === 'PLAYER_PRESET_CHANGED') && typeof e.data.preset === 'string') {
      const incomingId = normalizePresetId(e.data.preset);
      const isStaleWelcomeOverwrite =
        incomingId === 'welcome' &&
        (Boolean(pendingCustomCartridge) ||
          (lastMountedCustomPresetId === activePreset && Date.now() - lastMountedCustomAt < 5000));
      if (!isStaleWelcomeOverwrite && incomingId !== activePreset) {
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
      showImportStatus(`⚠️ Stage failed to load cartridge: ${String(e.data.message)}`, 'error');
    }
    if (e.data.type === 'BRIDGE_COMMAND_ERROR' && e.data.message) {
      console.warn('[media-player] Player bridge command error:', e.data.command, e.data.message);
    }
    if (e.data.type === 'CARTRIDGE_INTEGRITY' && e.data.integrity) {
      const targetId = typeof e.data.preset === 'string' && e.data.preset ? e.data.preset : activePreset;
      if (normalizePresetId(targetId) === normalizePresetId(activePreset)) {
        updateHostIntegrityBadge(targetId, e.data.integrity);
      }
    }
    if ((e.data.type === 'VOICE_TOGGLE' || e.data.type === 'SET_VOICE') && typeof e.data.enabled === 'boolean') {
      setVoiceEnabled(e.data.enabled);
    }
    if (e.data.type === 'BSL_STATE_CHANGED' && typeof e.data.active === 'boolean') {
      bslActive = e.data.active;
      updateBslUi(e.data.active);
      setBslEnabled(e.data.active);
    }
    if (e.data.type === 'TOGGLE_BSL' && typeof e.data.enabled === 'boolean') {
      bslActive = e.data.enabled;
      updateBslUi(e.data.enabled);
      setBslEnabled(e.data.enabled);
    }
    if (e.data.type === 'SITE_DIRECTIVE' && e.data.directive && typeof e.data.directive === 'object') {
      if (iframe?.contentWindow && e.source && e.source !== iframe.contentWindow) {
        return;
      }
      dispatchCartridgeSiteDirective(e.data.directive)
        .then((res) => {
          if (res.ok && res.action === 'toggle_bsl' && typeof res.detail.bslEnabled === 'boolean') {
            bslActive = res.detail.bslEnabled;
            updateBslUi(res.detail.bslEnabled);
          }
        })
        .catch(() => {});
    }
    if (e.data.type === 'TELEMETRY' || e.data.type === 'AST_TELEMETRY' || e.data.type === 'PLAYER_TELEMETRY') {
      latestTelemetry = e.data.telemetry || e.data.payload || e.data;
      if (activeDrawer === 'ai-tutor') {
        mountedAiTutorHandle?.updateTelemetry(latestTelemetry);
      }
    }
    if (e.data.type === 'AI_DEMO_START') {
      isAiDemonstrating = true;
      mountedAiTutorHandle?.setDemonstrating(true);
    }
    if (e.data.type === 'AI_DEMO_COMPLETE' || e.data.type === 'PUPIL_PREEMPTION') {
      isAiDemonstrating = false;
      mountedAiTutorHandle?.setDemonstrating(false);
    }
    if (e.data.type === 'CHECKPOINT_ANSWERED') {
      if (!e.data.isCorrect && e.data.prompt) {
        activeQuizContext = {
          sceneId: typeof e.data.sceneId === 'string' && e.data.sceneId ? e.data.sceneId : activePreset,
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
        if (activeDrawer === 'ai-tutor' && mountedAiTutorHandle) {
          mountedAiTutorHandle.askCheckpoint(activeQuizContext, false);
        }
      } else if (e.data.isCorrect) {
        activeQuizContext = null;
      }
    }
    if (e.data.type === 'ASK_NANO_CHECKPOINT' || e.data.type === 'OPEN_NANO_TUTOR') {
      activeQuizContext = {
        sceneId: typeof e.data.sceneId === 'string' && e.data.sceneId ? e.data.sceneId : activePreset,
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
      if (activeDrawer === 'ai-tutor' && mountedAiTutorHandle && mountedAiTutorPreset === activePreset) {
        mountedAiTutorHandle.askCheckpoint(activeQuizContext, activeQuizContext.autoAsk !== false);
      } else {
        activeDrawer = 'ai-tutor';
        renderActiveDrawer(true);
      }
    }
    if (e.data.type === 'PERF_HUD_UPDATED') {
      // Handled cleanly inside mounted drawer without tearing down live benchmark state
    }
    if ((e.data.type === 'LOG_JOTTER_CSV' || e.data.type === 'JOTTER_CSV_RESPONSE') && typeof e.data.csv === 'string') {
      const targetId = typeof e.data.sceneId === 'string' ? e.data.sceneId : activePreset;
      const rows = Number(e.data.rowCount || 1);
      const nodePath = typeof e.data.nodePath === 'string' ? e.data.nodePath : `lab/${targetId}`;
      appendLabCsvToJotter(targetId, e.data.csv, nodePath)
        .then(() => {
          if (logCsvBtn) {
            const origText = '📊 Save Results to Jotter';
            logCsvBtn.textContent = `✓ Saved ${rows} rows to Jotter`;
            logCsvBtn.style.background = '#065f46';
            logCsvBtn.style.borderColor = '#10b981';
            logCsvBtn.style.color = '#ffffff';
            setTimeout(() => {
              logCsvBtn.textContent = origText;
              logCsvBtn.style.background = '#1e293b';
              logCsvBtn.style.borderColor = '#0284c7';
              logCsvBtn.style.color = '#38bdf8';
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
        activePreset = cleanCart.id;
        if (titleEl) titleEl.textContent = cleanCart.title;
        if (stageBadgeEl) stageBadgeEl.textContent = cleanCart.stage;
        if (typeBadgeEl) typeBadgeEl.textContent = cleanCart.type || 'Sim';
        updateHostIntegrityBadge(cleanCart.id, null);
        refreshDropdown();
        renderGrid();

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('preset', cleanCart.id);
        window.history.replaceState({}, '', nextUrl.toString());

        import('../services/localCartridgeBuilder')
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
            postToPlayer({ type: 'REMIX_SAVED_ACK', message: ackMsg });
            if (remixCodeBtn) {
              const prev = remixCodeBtn.textContent;
              remixCodeBtn.textContent = `✓ Saved ${cleanCart.id}`;
              remixCodeBtn.style.background = '#065f46';
              setTimeout(() => {
                remixCodeBtn.textContent = prev || '💻 Remix & Code';
                remixCodeBtn.style.background = '#1e293b';
              }, 2600);
            }
          })
          .catch(() => {});
      }
    }
    if (e.data.type === 'NANO_REMIX_REQUEST' && e.data.context) {
      const remixCtx = e.data.context;
      import('../engine/nanoRemixCopilot')
        .then(async ({ promptAiRemixAssistant }) => {
          const proposal = await promptAiRemixAssistant(remixCtx);
          postToPlayer({
            type: 'NANO_REMIX_RESULT',
            proposal,
          });
        })
        .catch((err) => {
          postToPlayer({
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
  });

  window.addEventListener('app-setting-changed', (e: any) => {
    if (e.detail && (e.detail.key === 'app_perf_hud_enabled' || e.detail.key === 'app_hud_verbosity' || e.detail.key === 'app_frame_budget_alert')) {
      postToPlayer({
        type: 'SET_PERF_HUD',
        enabled: getLocalState('app_perf_hud_enabled') === 'true',
        mode: getLocalState('app_hud_verbosity') || 'minimal',
        strictAlarm: getLocalState('app_frame_budget_alert') === 'true',
      });
      if (activeDrawer === 'diagnostics') {
        renderActiveDrawer();
      }
    }
  });

  window.addEventListener('cartridges_updated', () => {
    refreshDropdown();
    renderGrid();
  });

  // Drawer toggles
  aiTutorBtn?.addEventListener('click', () => {
    activeDrawer = activeDrawer === 'ai-tutor' ? null : 'ai-tutor';
    renderActiveDrawer();
  });

  labDrawerBtn?.addEventListener('click', () => {
    activeDrawer = activeDrawer === 'lab' ? null : 'lab';
    renderActiveDrawer();
  });

  remixCodeBtn?.addEventListener('click', () => {
    postToPlayer({ type: 'OPEN_STUDIO', tab: 'ast' });
    focusPlayerStage();
  });

  teacherToolsBtn?.addEventListener('click', () => {
    if (!teacherToolsGroup) return;
    const isOpen = teacherToolsGroup.style.display === 'inline-flex';
    teacherToolsGroup.style.display = isOpen ? 'none' : 'inline-flex';
    teacherToolsBtn.setAttribute('aria-expanded', String(!isOpen));
    teacherToolsBtn.style.background = isOpen ? '#0f172a' : '#1e293b';
    teacherToolsBtn.style.color = isOpen ? '#94a3b8' : '#f8fafc';
    teacherToolsBtn.textContent = isOpen ? '🧰 Teacher Tools ▾' : '🧰 Teacher Tools ▴';
  });

  diagnosticsBtn?.addEventListener('click', () => {
    activeDrawer = activeDrawer === 'diagnostics' ? null : 'diagnostics';
    renderActiveDrawer();
  });

  logCsvBtn?.addEventListener('click', (e) => {
    postToPlayer({ type: 'REQUEST_JOTTER_CSV', download: Boolean(e.shiftKey) });
  });

  embedBtn?.addEventListener('click', () => {
    activeDrawer = activeDrawer === 'embed' ? null : 'embed';
    renderActiveDrawer();
  });

  phetImportBtn?.addEventListener('click', () => {
    activeDrawer = activeDrawer === 'phet' ? null : 'phet';
    renderActiveDrawer();
  });

  swfImportBtn?.addEventListener('click', () => {
    activeDrawer = activeDrawer === 'swf' ? null : 'swf';
    renderActiveDrawer();
  });

  exportAirgapBtn?.addEventListener('click', () => {
    const activeMeta = getPresetMeta(activePreset);
    exportAirgapHtmlBundle(activePreset, activeMeta.label);
  });

  // Fullscreen
  fullscreenBtn?.addEventListener('click', () => {
    const wrapper = container.querySelector('#player-iframe-wrapper');
    if (!document.fullscreenElement) {
      wrapper?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  function syncSubjectTabStyles() {
    catButtons.forEach((b) => {
      const isCur = b.getAttribute('data-cat') === activeSubject;
      b.style.background = isCur ? '#ffffff' : 'transparent';
      b.style.color = isCur ? '#0f172a' : '#475569';
      b.style.boxShadow = isCur ? '0 1px 3px rgba(15,23,42,0.1)' : 'none';
    });
  }

  function syncFormatButtonStyles() {
    formatButtons.forEach((b) => {
      const isCur = b.getAttribute('data-format') === activeFormat;
      b.style.background = isCur ? '#e0f2fe' : '#f8fafc';
      b.style.color = isCur ? '#0369a1' : '#475569';
      b.style.borderColor = isCur ? '#0284c7' : '#e2e8f0';
    });
  }

  // Subject buttons
  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeSubject = (btn.getAttribute('data-cat') as SubjectFilterId) || 'All';
      syncSubjectTabStyles();
      renderGrid();
    });
  });

  // Format filter buttons
  formatButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFormat = (btn.getAttribute('data-format') as FormatFilterId) || 'All';
      syncFormatButtonStyles();
      renderGrid();
    });
  });

  // Key stage filter
  stageFilterSelect?.addEventListener('change', () => {
    activeStage = (stageFilterSelect.value as StageFilterId) || 'All';
    renderGrid();
  });

  // Include non-media recall data / docs / benchmarks toggle
  includeNonMediaCheckbox?.addEventListener('change', () => {
    includeNonMediaExtras = Boolean(includeNonMediaCheckbox.checked);
    renderGrid();
  });

  // Clear filters button
  clearFiltersBtn?.addEventListener('click', () => {
    activeSubject = 'All';
    activeFormat = 'All';
    activeStage = 'All';
    includeNonMediaExtras = false;
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (stageFilterSelect) stageFilterSelect.value = 'All';
    if (includeNonMediaCheckbox) includeNonMediaCheckbox.checked = false;
    syncSubjectTabStyles();
    syncFormatButtonStyles();
    renderGrid();
  });

  // Search input
  searchInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderGrid();
  });

  // Initial grid render
  renderGrid();

  // If deep-linked with ?src=path/to/game.swf, fetch, transpile via AVM1 importer, and launch directly
  if (pendingExternalSwfUrl) {
    const swfUrl = pendingExternalSwfUrl;
    pendingExternalSwfUrl = null;
    void loadExternalSwfUrl(swfUrl);
  }

  return container;
}

export default renderPlayerPage;