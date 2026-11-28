// src/pages/media-player.ts
import { getSavedLanguage } from '../engine/operational-language';
import { getBaseUrl } from '../utils/url';
import type { ScenePresetOption } from '../data/player/generatedScenes';
import {
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
  getVoiceEnabled,
  toggleVoice,
} from '../services/bslGlobalStore';
import { isSoundEnabled, setSoundEnabled } from '../services/soundHaptics';
import { exportAirgapHtmlBundle } from '../utils/exportAirgapHtmlBundle';
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
import {
  cartridgeNeedsStageKeyForwarding,
  createInitialSwfDistillSession,
  type PlayerDomRefs,
  type PlayerRuntimeState,
} from './player/playerTypes';
import { createPlayerTransport } from './player/playerTransport';
import { createPlayerDrawerController } from './player/playerDrawerOrchestrator';
import { bindPlayerMessageBridge } from './player/playerMessageBridge';

export function renderPlayerPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'ast-media-player-container';
  container.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;';

  // Read initial preset (?preset= or ?app=) or external ?src= from URL
  const params = new URLSearchParams(window.location.search);
  const requestedPresetParam = params.get('preset') || params.get('app');
  const sanitizeSameOriginSrc = (raw: string | null): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      const parsed = new URL(trimmed, window.location.href);
      if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || parsed.origin !== window.location.origin) {
        return null;
      }
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  };
  const rawSrcParam = params.get('src') || params.get('file');
  const initialSrcParam = sanitizeSameOriginSrc(rawSrcParam);
  const blockedExternalSrcOnBoot = Boolean(rawSrcParam && !initialSrcParam);
  const resolvedInitialPreset = !requestedPresetParam && initialSrcParam && initialSrcParam.includes('lumina-architecture')
    ? 'lumina-architecture'
    : normalizePresetId(requestedPresetParam);
  const isSwfExternalUrl = (u: string | null): boolean => Boolean(u && /^[^?#]+\.swf(?:[?#].*)?$/i.test(u.trim()));
  const initialPendingSwfUrl = !requestedPresetParam && isSwfExternalUrl(initialSrcParam) ? initialSrcParam : null;
  const initialExternalSrc = requestedPresetParam || initialPendingSwfUrl ? null : initialSrcParam;
  const pendingAutoEppBench = params.get('epp-bench') === '1' || params.get('epp-bench') === 'true';
  const toolParam = (params.get('tool') || params.get('drawer') || '').toLowerCase();
  const pendingAutoOpenStudio = toolParam === 'create' || toolParam === 'creator' || toolParam === 'studio';
  const autoOpenLabDrawer = toolParam === 'lab';
  const importParam = (params.get('import') || '').toLowerCase();

  // Launcher-First Grid: keep player iframe unloaded (0 KB engine download, 0% CPU) until a lab is selected or deep-linked
  const initialStageOpen = Boolean(
    requestedPresetParam || initialSrcParam || pendingAutoEppBench || pendingAutoOpenStudio || autoOpenLabDrawer
  );

  if (params.get('bsl') === '1' && !getBslEnabled()) {
    setBslEnabled(true);
  }

  const state: PlayerRuntimeState = {
    activePreset: resolvedInitialPreset,
    isStageOpen: initialStageOpen,
    isIframeReady: false,
    pageDisposed: false,
    stageMediaInputActive: false,
    pendingCustomCartridge: null,
    lastMountedCustomPresetId: null,
    lastMountedCustomAt: 0,
    pendingExternalSwfUrl: initialPendingSwfUrl,
    initialExternalSrc,
    pendingAutoEppBench,
    pendingAutoOpenStudio,
    activeDrawer: autoOpenLabDrawer ? 'lab' : null,
    launcherImportPanel:
      !initialStageOpen && (importParam === 'swf' || toolParam === 'swf')
        ? 'swf'
        : !initialStageOpen && (importParam === 'phet' || toolParam === 'phet')
          ? 'phet'
          : null,
    bslActive: getBslEnabled(),
    isMuted: !(getVoiceEnabled() && isSoundEnabled()),
    latestTelemetry: null,
    activeQuizContext: null,
    isAiDemonstrating: false,
    autoRunEppBenchOnce: false,
    mountedAiTutorHandle: null,
    mountedAiTutorPreset: '',
    swfFileName: 'imported-swf',
    swfRuntimeHealth: null,
    swfDistillSession: createInitialSwfDistillSession(),
  };

  let activeSubject: SubjectFilterId = 'All';
  let activeFormat: FormatFilterId = 'All';
  let activeStage: StageFilterId = 'All';
  let includeNonMediaExtras = false;
  let searchQuery = '';
  let lastLiveIntegrity: Record<string, any> | null = null;

  const meta = getPresetMeta(state.activePreset);
  container.innerHTML = renderPlayerShellHtml({
    base,
    activePreset: state.activePreset,
    meta,
    isStageOpen: state.isStageOpen && !state.pendingExternalSwfUrl,
    bslActive: state.bslActive,
    isMuted: state.isMuted,
    initialExternalSrc: state.initialExternalSrc,
    activeSubject,
    activeFormat,
  });

  const dom: PlayerDomRefs = {
    container,
    stageShell: container.querySelector<HTMLDivElement>('#player-stage-shell')!,
    catalogSection: container.querySelector<HTMLElement>('#labs-catalog-section')!,
    backToGridBtn: container.querySelector<HTMLButtonElement>('#player-btn-back-to-grid'),
    breadcrumbLabsBtn: container.querySelector<HTMLButtonElement>('#player-breadcrumb-labs'),
    breadcrumbSepEl: container.querySelector<HTMLElement>('#player-breadcrumb-sep'),
    breadcrumbActiveEl: container.querySelector<HTMLElement>('#player-breadcrumb-active'),
    launcherImportBtn: container.querySelector<HTMLButtonElement>('#launcher-btn-import'),
    launcherPhetBtn: container.querySelector<HTMLButtonElement>('#launcher-btn-phet-import'),
    launcherSwfBtn: container.querySelector<HTMLButtonElement>('#launcher-btn-swf-import'),
    launcherSwfMount: container.querySelector<HTMLDivElement>('#launcher-swf-mount-point'),
    importStatusEl: container.querySelector<HTMLDivElement>('#player-import-status'),
    importStatusTextEl: container.querySelector<HTMLSpanElement>('#player-import-status-text'),
    importStatusCloseBtn: container.querySelector<HTMLButtonElement>('#player-import-status-close'),
    iframe: container.querySelector<HTMLIFrameElement>('#ast-player-iframe')!,
    select: container.querySelector<HTMLSelectElement>('#player-sim-selector')!,
    titleEl: container.querySelector<HTMLElement>('#player-active-title')!,
    stageBadgeEl: container.querySelector<HTMLElement>('#player-active-stage-badge')!,
    typeBadgeEl: container.querySelector<HTMLElement>('#player-active-type-badge')!,
    integrityBadgeEl: container.querySelector<HTMLButtonElement>('#player-integrity-badge'),
    integrityReadoutEl: container.querySelector<HTMLDivElement>('#player-integrity-readout'),
    integrityReadoutBodyEl: container.querySelector<HTMLDivElement>('#player-integrity-readout-body'),
    integrityReadoutCloseBtn: container.querySelector<HTMLButtonElement>('#player-integrity-readout-close'),
    playBtn: container.querySelector<HTMLButtonElement>('#player-btn-play'),
    playIcon: container.querySelector<HTMLElement>('#player-play-icon'),
    playText: container.querySelector<HTMLElement>('#player-play-text'),
    resetBtn: container.querySelector<HTMLButtonElement>('#player-btn-reset'),
    muteBtn: container.querySelector<HTMLButtonElement>('#player-btn-mute'),
    bslBtn: container.querySelector<HTMLButtonElement>('#player-btn-bsl'),
    aiTutorBtn: container.querySelector<HTMLButtonElement>('#player-btn-ai-tutor'),
    labDrawerBtn: container.querySelector<HTMLButtonElement>('#player-btn-lab-drawer'),
    remixCodeBtn: container.querySelector<HTMLButtonElement>('#player-btn-remix-code'),
    diagnosticsBtn: container.querySelector<HTMLButtonElement>('#player-btn-diagnostics'),
    teacherToolsBtn: container.querySelector<HTMLButtonElement>('#player-btn-teacher-tools'),
    teacherToolsGroup: container.querySelector<HTMLDivElement>('#player-teacher-tools-group'),
    logCsvBtn: container.querySelector<HTMLButtonElement>('#player-btn-log-csv'),
    openBtn: container.querySelector<HTMLButtonElement>('#player-btn-open')!,
    phetImportBtn: container.querySelector<HTMLButtonElement>('#player-btn-phet-import'),
    swfImportBtn: container.querySelector<HTMLButtonElement>('#player-btn-swf-import'),
    embedBtn: container.querySelector<HTMLButtonElement>('#player-btn-embed'),
    exportAirgapBtn: container.querySelector<HTMLButtonElement>('#player-btn-export-airgap'),
    drawerMount: container.querySelector<HTMLDivElement>('#player-drawer-mount-point'),
    swfDistillerStripMount: container.querySelector<HTMLDivElement>('#player-swf-distiller-strip'),
    fileInputHidden: container.querySelector<HTMLInputElement>('#media-player-file-input')!,
    fullscreenBtn: container.querySelector<HTMLButtonElement>('#player-btn-fullscreen')!,
    searchInput: container.querySelector<HTMLInputElement>('#cartridge-search-input')!,
    stageFilterSelect: container.querySelector<HTMLSelectElement>('#stage-filter-select'),
    includeNonMediaCheckbox: container.querySelector<HTMLInputElement>('#toggle-include-nonmedia'),
    clearFiltersBtn: container.querySelector<HTMLButtonElement>('#btn-clear-catalog-filters'),
    resultsSummaryEl: container.querySelector<HTMLElement>('#catalog-results-summary'),
    recentStripEl: container.querySelector<HTMLDivElement>('#recent-labs-strip'),
    gridContainer: container.querySelector<HTMLDivElement>('#cartridges-grid')!,
    catButtons: container.querySelectorAll<HTMLButtonElement>('.cat-pill-btn'),
    formatButtons: container.querySelectorAll<HTMLButtonElement>('.format-filter-btn'),
    iframeWrapper: container.querySelector<HTMLDivElement>('#player-iframe-wrapper')!,
  };

  const transport = createPlayerTransport({
    container,
    iframe: dom.iframe,
    state,
    onLoadPreset: (presetId, skipPostMessage) => updatePreset(presetId, skipPostMessage),
    onOpenTutorDrawer: (prompt) => {
      state.activeDrawer = 'ai-tutor';
      drawers.renderActiveDrawer(true);
      if (prompt && state.mountedAiTutorHandle) {
        state.mountedAiTutorHandle.askQuestion(prompt, false);
      }
    },
  });

  const drawers = createPlayerDrawerController({
    dom,
    state,
    transport,
    base,
    launchCustomCartridge,
    refreshDropdown,
    renderGrid,
  });

  const bridge = bindPlayerMessageBridge({
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
  });

  function updatePlayButtonUI(playing: boolean) {
    if (!dom.playBtn) return;
    if (playing) {
      dom.playBtn.style.background = '#2563eb';
      dom.playBtn.style.borderColor = '#38bdf8';
      dom.playBtn.title = 'Pause simulation loop (Spacebar)';
      if (dom.playIcon) dom.playIcon.textContent = '⏸';
      if (dom.playText) dom.playText.textContent = 'Pause';
    } else {
      dom.playBtn.style.background = '#16a34a';
      dom.playBtn.style.borderColor = '#22c55e';
      dom.playBtn.title = 'Play simulation loop (Spacebar)';
      if (dom.playIcon) dom.playIcon.textContent = '▶';
      if (dom.playText) dom.playText.textContent = 'Play';
    }
  }

  function updateMuteUi(muted: boolean) {
    if (dom.muteBtn) {
      dom.muteBtn.style.background = muted ? '#451a03' : '#1e293b';
      dom.muteBtn.style.borderColor = muted ? '#d97706' : '#334155';
      dom.muteBtn.title = muted ? 'Unmute simulation audio (M)' : 'Mute simulation audio (M)';
    }
    const icon = container.querySelector('#player-mute-icon');
    const text = container.querySelector('#player-mute-text');
    if (icon) icon.textContent = muted ? '🔇' : '🔊';
    if (text) text.textContent = muted ? 'Muted' : 'Audio ON';
  }

  function updateBslUi(enabled: boolean) {
    if (dom.bslBtn) {
      dom.bslBtn.textContent = `🖐️ BSL Signing: ${enabled ? 'ON' : 'OFF'}`;
      dom.bslBtn.style.background = enabled ? '#0284c7' : '#1e293b';
      dom.bslBtn.style.borderColor = enabled ? '#38bdf8' : '#334155';
    }
  }

  function refreshDropdown() {
    if (dom.select) {
      dom.select.innerHTML = buildOptionsHtml(state.activePreset);
      dom.select.value = state.activePreset;
    }
  }

  function renderIntegrityReadoutContent(presetId: string, liveInfo?: Record<string, any> | null) {
    if (!dom.integrityReadoutBodyEl) return;
    dom.integrityReadoutBodyEl.innerHTML = buildIntegrityReadoutHtml(presetId, liveInfo);
  }

  function updateHostIntegrityBadge(presetId: string, liveInfo?: Record<string, any> | null) {
    if (!dom.integrityBadgeEl) return;
    const cleanId = normalizePresetId(presetId);
    const customOverride = getCustomCartridges().some((c) => c.id === cleanId && c.source !== 'builtin');
    const rec = getRegisteredRecord(cleanId);
    lastLiveIntegrity = liveInfo || null;

    const effectiveStatus = liveInfo?.status
      || (rec && customOverride ? 'tampered' : rec ? 'verified-native' : 'unverified-external');

    if (effectiveStatus === 'verified-native') {
      const code = (liveInfo?.shortHash || rec?.seal || '').slice(0, 6);
      dom.integrityBadgeEl.textContent = code ? `🛡️ St Joseph's Curriculum • ${code}` : "🛡️ St Joseph's Curriculum";
      dom.integrityBadgeEl.style.background = 'rgba(16,185,129,0.16)';
      dom.integrityBadgeEl.style.color = '#34d399';
      dom.integrityBadgeEl.style.borderColor = 'rgba(16,185,129,0.45)';
      dom.integrityBadgeEl.title = liveInfo?.badgeTooltip
        || `Verified St Joseph's Curriculum Cartridge (${rec?.title || cleanId}) • Authority Seal: ${formatShortHash(rec?.seal || '')} — Click to inspect SHA-256 digests`;
    } else if (effectiveStatus === 'tampered') {
      const code = (liveInfo?.shortHash || rec?.seal || '').slice(0, 6);
      dom.integrityBadgeEl.textContent = code ? `✎ Altered • ${code}` : '✎ Altered';
      dom.integrityBadgeEl.style.background = 'rgba(245,158,11,0.18)';
      dom.integrityBadgeEl.style.color = '#fbbf24';
      dom.integrityBadgeEl.style.borderColor = 'rgba(245,158,11,0.5)';
      dom.integrityBadgeEl.title = liveInfo?.badgeTooltip
        || `Altered / Remixed Cartridge (${cleanId}) — Live SHA-256 differs from St Joseph's Curriculum seal. Click to inspect.`;
    } else {
      dom.integrityBadgeEl.textContent = '◈ Custom / Vault';
      dom.integrityBadgeEl.style.background = 'rgba(148,163,184,0.16)';
      dom.integrityBadgeEl.style.color = '#cbd5e1';
      dom.integrityBadgeEl.style.borderColor = 'rgba(148,163,184,0.4)';
      dom.integrityBadgeEl.title = liveInfo?.badgeTooltip
        || `Custom or external cartridge (${cleanId}) — Click to inspect SHA-256 provenance`;
    }

    renderIntegrityReadoutContent(cleanId, liveInfo || (customOverride && rec ? { status: 'tampered', seal: rec.seal } : null));
  }

  function syncLauncherStageVisibility(itemMeta?: ScenePresetOption) {
    if (dom.stageShell) dom.stageShell.style.display = state.isStageOpen ? 'block' : 'none';
    if (dom.catalogSection) dom.catalogSection.style.display = state.isStageOpen ? 'none' : 'block';
    const catholicBanner = container.querySelector<HTMLElement>('#catholic-sanctuary-banner');
    if (catholicBanner) {
      const m = itemMeta || getPresetMeta(state.activePreset);
      catholicBanner.style.display = state.isStageOpen && isCatholicPreset(m) ? 'flex' : 'none';
    }
    if (dom.breadcrumbLabsBtn) {
      dom.breadcrumbLabsBtn.style.cursor = state.isStageOpen ? 'pointer' : 'default';
      dom.breadcrumbLabsBtn.style.textDecoration = state.isStageOpen ? 'underline' : 'none';
    }
    if (dom.breadcrumbSepEl) dom.breadcrumbSepEl.style.display = state.isStageOpen ? 'inline' : 'none';
    if (dom.breadcrumbActiveEl) {
      dom.breadcrumbActiveEl.style.display = state.isStageOpen ? 'inline' : 'none';
      if (itemMeta) dom.breadcrumbActiveEl.textContent = itemMeta.label;
    }
  }

  function closeStageToLauncher(updateHistory = true) {
    if (!state.isStageOpen) return;
    state.isStageOpen = false;
    state.isIframeReady = false;
    state.pendingCustomCartridge = null;
    state.stageMediaInputActive = false;
    state.initialExternalSrc = null;
    state.activeDrawer = null;
    drawers.renderActiveDrawer();
    drawers.resetSwfDistillSession();
    if (dom.integrityReadoutEl) dom.integrityReadoutEl.style.display = 'none';
    // Unload the stage iframe completely to stop audio/physics loops and free RAM on low-spec hardware
    if (dom.iframe) {
      dom.iframe.src = 'about:blank';
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

  function updatePreset(presetId: string, skipPostMessage = false, pushHistoryIfOpening = true) {
    if (presetId === '__custom_find__' || presetId === '__open_local__') return;
    const safePresetId = normalizePresetId(presetId);
    const prevPresetId = state.activePreset;
    const wasStageOpen = state.isStageOpen;
    state.isStageOpen = true;
    state.activePreset = safePresetId;
    recordRecentPreset(safePresetId);
    const item = getPresetMeta(safePresetId);
    if (dom.titleEl) dom.titleEl.textContent = item.label;
    if (dom.stageBadgeEl) dom.stageBadgeEl.textContent = item.stage;
    if (dom.typeBadgeEl) dom.typeBadgeEl.textContent = item.type || 'Sim';
    updateHostIntegrityBadge(safePresetId, null);
    if (dom.select) {
      if (isNonMediaOrUtility(item)) refreshDropdown();
      else dom.select.value = safePresetId;
    }

    syncLauncherStageVisibility(item);

    state.initialExternalSrc = null;
    const localCustomCart = getCustomCartridges().find(
      (c) => c.id === safePresetId && c.source !== 'builtin' && Boolean(c.svgMarkup || c.astSource)
    ) || null;
    const preserveMediaInput = skipPostMessage && safePresetId === prevPresetId && state.stageMediaInputActive;
    state.stageMediaInputActive = preserveMediaInput || Boolean(
      cartridgeNeedsStageKeyForwarding(localCustomCart) ||
      cartridgeNeedsStageKeyForwarding(state.pendingCustomCartridge) ||
      safePresetId.startsWith('flash-')
    );
    // Lazily inflate requested built-in curriculum/data cartridge into native IndexedDB (skip for Local Vault custom cartridges)
    if (!localCustomCart && safePresetId !== 'lumina-architecture') {
      inflateCartridgeToVault(safePresetId, getRegisteredRecord(safePresetId)?.seal).catch(() => {});
    }
    const iframeIsUnloaded =
      !dom.iframe || !dom.iframe.src || dom.iframe.src === 'about:blank' || dom.iframe.getAttribute('src') === 'about:blank';
    if (!skipPostMessage && state.isIframeReady && !iframeIsUnloaded && dom.iframe && dom.iframe.contentWindow) {
      if (localCustomCart) {
        state.lastMountedCustomPresetId = localCustomCart.id;
        state.lastMountedCustomAt = Date.now();
        transport.postToPlayer({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: localCustomCart, play: true });
      } else {
        transport.postToPlayer({ type: 'SET_PRESET', preset: safePresetId, play: true });
      }
      transport.focusPlayerStage();
    } else if (dom.iframe && (iframeIsUnloaded || !state.isIframeReady)) {
      state.isIframeReady = false;
      if (localCustomCart && !state.pendingCustomCartridge) {
        state.pendingCustomCartridge = localCustomCart;
      }
      dom.iframe.src = buildPlayerSrc(
        base,
        safePresetId,
        state.bslActive,
        null,
        Boolean(localCustomCart || state.pendingCustomCartridge)
      );
    }

    // Broadcast lesson change to BSL interpreter
    broadcastBslSpeech({ subtitle: `${item.label}. ${item.stage}`, isSpeaking: true });

    // Cleanly cycle AbortSignal registration for document.modelContext when switching cartridges
    void transport.refreshWebMcpRegistration();

    if (state.activeDrawer) {
      drawers.renderActiveDrawer();
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

  function launchCustomCartridge(cart: CartridgeDefinition) {
    const alreadyLive = Boolean(
      state.isIframeReady && dom.iframe?.contentWindow && dom.iframe.getAttribute('src') !== 'about:blank'
    );
    state.lastMountedCustomPresetId = cart.id;
    state.lastMountedCustomAt = Date.now();
    state.stageMediaInputActive = cartridgeNeedsStageKeyForwarding(cart);
    if (!alreadyLive) {
      state.pendingCustomCartridge = cart;
    }
    updatePreset(cart.id, true);
    if (alreadyLive && dom.iframe?.contentWindow) {
      dom.iframe.contentWindow.postMessage({ type: 'LOAD_CUSTOM_CARTRIDGE', cartridge: cart, play: true }, '*');
      transport.focusPlayerStage();
    }
  }

  async function handleUploadedFiles(files: File[]) {
    drawers.clearImportStatus();
    try {
      const cart = await ingestUploadedCartridgeFiles(files);
      if (cart) {
        refreshDropdown();
        launchCustomCartridge(cart);
        const isAs3Swf = Array.isArray(cart.invariants) && cart.invariants.some((inv) => inv.includes('ActionScript 3.0'));
        if (isAs3Swf) {
          drawers.showImportStatus(
            `⚡ Imported "${cart.title}" (ActionScript 3.0 / AVM2 Beta) — core vector timelines & events run in pure SVG; complex AS3 frameworks, BitmapData shaders, Stage3D, and streaming video are not supported.`,
            'success'
          );
        } else {
          drawers.showImportStatus(`✓ Imported "${cart.title}" into Local Vault & launched on stage.`, 'success');
        }
      } else {
        drawers.showImportStatus(
          'Unsupported file format. Drop or choose a Flash (.swf), PhET (.html / .phet), Cartridge (.json), .ast, or .svg file.',
          'error'
        );
      }
    } catch (err: any) {
      console.error('[media-player] Error ingesting uploaded files:', err);
      drawers.showImportStatus(`Import failed: ${err?.message || 'Could not parse the selected file.'}`, 'error');
    }
  }

  async function loadExternalSwfUrl(swfUrl: string) {
    try {
      const safeUrl = sanitizeSameOriginSrc(swfUrl);
      if (!safeUrl) {
        drawers.showImportStatus(
          'External remote URLs are blocked to keep the portal offline-safe. Download the .swf file and drop it into the local Flash Upgrade panel instead.',
          'error'
        );
        return;
      }
      drawers.showImportStatus(`⚡ Fetching & transpiling local Flash SWF (${safeUrl})...`, 'success');
      const res = await fetch(safeUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${safeUrl}`);
      const buf = await res.arrayBuffer();
      const rawFile = safeUrl.split(/[?#]/)[0].split('/').pop() || 'imported.swf';
      const file = new File([buf], rawFile.endsWith('.swf') ? rawFile : `${rawFile}.swf`, {
        type: 'application/x-shockwave-flash',
      });
      await handleUploadedFiles([file]);
    } catch (err: any) {
      console.error('[media-player] Failed loading local SWF URL:', swfUrl, err);
      drawers.showImportStatus(`Could not load Flash SWF: ${err?.message || 'fetch error'}`, 'error');
    }
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

  function renderRecentStrip() {
    if (!dom.recentStripEl) return;
    const recentIds = getRecentPresetIds().filter((id) => !state.isStageOpen || id !== state.activePreset);
    const items = recentIds
      .map((id) => ALL_BUILTIN_PRESETS.find((p) => p.id === id))
      .filter((p): p is ScenePresetOption => Boolean(p))
      .slice(0, 4);

    if (items.length === 0) {
      dom.recentStripEl.style.display = 'none';
      dom.recentStripEl.replaceChildren();
      return;
    }

    dom.recentStripEl.style.display = 'flex';
    dom.recentStripEl.innerHTML = `
      <span style="color:#64748b; font-weight:700;">Recently opened:</span>
      ${items.map((p) => `
        <button type="button" class="recent-lab-btn" data-id="${escapeHtml(p.id)}" style="padding:3px 10px; border-radius:6px; border:1px solid #e2e8f0; background:#f8fafc; color:#0f172a; font-size:0.76rem; font-weight:600; cursor:pointer; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${escapeHtml(p.label)}
        </button>
      `).join('')}
    `;
    dom.recentStripEl.querySelectorAll('.recent-lab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) updatePreset(id);
      });
    });
  }

  function syncSubjectTabStyles() {
    dom.catButtons.forEach((b) => {
      const isCur = b.getAttribute('data-cat') === activeSubject;
      b.style.background = isCur ? '#ffffff' : 'transparent';
      b.style.color = isCur ? '#0f172a' : '#475569';
      b.style.boxShadow = isCur ? '0 1px 3px rgba(15,23,42,0.1)' : 'none';
    });
  }

  function syncFormatButtonStyles() {
    dom.formatButtons.forEach((b) => {
      const isCur = b.getAttribute('data-format') === activeFormat;
      b.style.background = isCur ? '#e0f2fe' : '#f8fafc';
      b.style.color = isCur ? '#0369a1' : '#475569';
      b.style.borderColor = isCur ? '#0284c7' : '#e2e8f0';
    });
  }

  function renderGrid() {
    if (!dom.gridContainer) return;
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

    const hasActiveFilters = Boolean(
      q || activeSubject !== 'All' || activeFormat !== 'All' || activeStage !== 'All' || includeNonMediaExtras
    );
    if (dom.clearFiltersBtn) {
      dom.clearFiltersBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
    }
    if (dom.resultsSummaryEl) {
      const scopeLabel = includeNonMediaExtras ? 'activities (including recall data & docs)' : 'visual labs & lessons';
      const masterShort = getMasterRegistryChecksum().slice(0, 8);
      dom.resultsSummaryEl.textContent = `Showing ${filtered.length} of ${allAvailable.length} ${scopeLabel} · 🛡️ ${getTotalCertifiedCartridges()} Verified to St Joseph's Curriculum (Master SHA-256: ${masterShort}…)`;
    }

    dom.gridContainer.innerHTML = buildCatalogGridHtml({
      filtered,
      isStageOpen: state.isStageOpen,
      activePreset: state.activePreset,
      activeSubject,
    });

    if (filtered.length === 0) return;

    dom.gridContainer.querySelectorAll<HTMLButtonElement>('.subject-focus-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const nextSubj = (btn.getAttribute('data-focus-subject') as SubjectFilterId) || 'All';
        activeSubject = nextSubj;
        syncSubjectTabStyles();
        renderGrid();
      });
    });

    dom.gridContainer.querySelectorAll<HTMLElement>('.cartridge-card').forEach((card) => {
      const launchCard = () => {
        unlockMobilePwaAudioForIframe(dom.iframe);
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

  // Lifecycle & browser navigation listeners
  dom.iframe?.addEventListener('load', () => {
    state.isIframeReady = true;
    const activeLang = getSavedLanguage();
    if (activeLang && activeLang !== 'en') {
      try {
        dom.iframe.contentWindow?.postMessage({ type: 'SET_LANGUAGE', lang: activeLang }, '*');
      } catch {}
    }
  });

  const onPopState = () => {
    const p = new URLSearchParams(window.location.search);
    const nextPreset = p.get('preset') || p.get('app');
    const nextSrc = sanitizeSameOriginSrc(p.get('src') || p.get('file'));
    if (nextPreset) {
      updatePreset(nextPreset, false, false);
    } else if (nextSrc) {
      state.isStageOpen = true;
      state.initialExternalSrc = nextSrc;
      state.isIframeReady = false;
      syncLauncherStageVisibility();
      if (dom.iframe) dom.iframe.src = buildPlayerSrc(base, state.activePreset, state.bslActive, nextSrc);
    } else if (state.isStageOpen) {
      closeStageToLauncher(false);
    }
  };
  window.addEventListener('popstate', onPopState);

  const unsubBsl = subscribeBsl((enabled) => {
    if (state.pageDisposed) return;
    if (state.bslActive !== enabled) {
      state.bslActive = enabled;
      updateBslUi(enabled);
      transport.postToPlayer({ type: 'SET_BSL', enabled });
      if (enabled && state.isStageOpen) {
        transport.postToPlayer({ type: 'REQUEST_SUBTITLE' });
      }
    }
  });

  const unsubVoice = subscribeVoice((enabled) => {
    if (state.pageDisposed) return;
    try {
      const muted = !enabled;
      state.isMuted = muted;
      updateMuteUi(muted);
      transport.postToPlayer({ type: 'SET_VOICE', enabled });
      transport.postToPlayer({ type: 'SET_MUTED', muted });
    } catch (_) {}
  });

  let wasContainerConnected = false;
  let unmountObserver: MutationObserver | null = null;
  const cleanupPlayerLifecycle = () => {
    if (state.pageDisposed) return;
    state.pageDisposed = true;
    bridge.dispose();
    drawers.dispose();
    transport.dispose();
    if (typeof unsubBsl === 'function') unsubBsl();
    if (typeof unsubVoice === 'function') unsubVoice();
    unmountObserver?.disconnect();
    unmountObserver = null;
    window.removeEventListener('pagehide', cleanupPlayerLifecycle);
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

  // Stage & launcher DOM controls
  dom.integrityBadgeEl?.addEventListener('click', () => {
    if (!dom.integrityReadoutEl) return;
    const isHidden = dom.integrityReadoutEl.style.display === 'none';
    renderIntegrityReadoutContent(state.activePreset, lastLiveIntegrity);
    dom.integrityReadoutEl.style.display = isHidden ? 'flex' : 'none';
  });

  dom.integrityReadoutCloseBtn?.addEventListener('click', () => {
    if (dom.integrityReadoutEl) dom.integrityReadoutEl.style.display = 'none';
  });

  dom.backToGridBtn?.addEventListener('click', () => closeStageToLauncher(true));
  dom.breadcrumbLabsBtn?.addEventListener('click', () => {
    if (state.isStageOpen) closeStageToLauncher(true);
  });
  dom.launcherImportBtn?.addEventListener('click', () => {
    dom.fileInputHidden?.click();
  });
  dom.launcherPhetBtn?.addEventListener('click', () => {
    state.launcherImportPanel = state.launcherImportPanel === 'phet' ? null : 'phet';
    drawers.renderLauncherImportPanel();
  });
  dom.launcherSwfBtn?.addEventListener('click', () => {
    state.launcherImportPanel = state.launcherImportPanel === 'swf' ? null : 'swf';
    drawers.renderLauncherImportPanel();
  });

  dom.select?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === '__open_local__') {
      dom.select.value = state.activePreset;
      dom.fileInputHidden?.click();
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
      dom.select.value = state.activePreset;
      closeStageToLauncher(true);
      dom.searchInput?.focus();
    } else {
      updatePreset(val);
    }
    dom.select.blur();
  });

  dom.openBtn?.addEventListener('click', () => {
    dom.fileInputHidden?.click();
  });

  dom.fileInputHidden?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length) {
      handleUploadedFiles(Array.from(target.files));
      target.value = '';
    }
  });

  [dom.iframeWrapper, dom.catalogSection].forEach((dropTarget) => {
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

  dom.playBtn?.addEventListener('click', () => {
    unlockMobilePwaAudioForIframe(dom.iframe);
    if (!invokeSameOriginPlayerAction(dom.iframe, 'togglePlay')) {
      transport.postToPlayer({ type: 'TOGGLE_PLAY' });
    }
    transport.focusPlayerStage();
  });

  dom.resetBtn?.addEventListener('click', () => {
    unlockMobilePwaAudioForIframe(dom.iframe);
    if (!invokeSameOriginPlayerAction(dom.iframe, 'reset')) {
      transport.postToPlayer({ type: 'RESET_SIM' });
    }
    transport.focusPlayerStage();
  });

  dom.muteBtn?.addEventListener('click', () => {
    const nextVoice = toggleVoice();
    setSoundEnabled(nextVoice);
    const muted = !nextVoice;
    if (nextVoice) {
      unlockMobilePwaAudioForIframe(dom.iframe);
    }
    state.isMuted = muted;
    updateMuteUi(muted);
    if (!invokeSameOriginPlayerAction(dom.iframe, 'setAudioState', { voiceEnabled: nextVoice, muted })) {
      transport.postToPlayer({ type: 'SET_VOICE', enabled: nextVoice });
      transport.postToPlayer({ type: 'SET_MUTED', muted });
    }
    if (bridge.isSwfStageInputActive()) transport.focusPlayerStage();
  });

  dom.bslBtn?.addEventListener('click', () => {
    toggleBsl();
    if (bridge.isSwfStageInputActive()) transport.focusPlayerStage();
  });

  dom.aiTutorBtn?.addEventListener('click', () => {
    state.activeDrawer = state.activeDrawer === 'ai-tutor' ? null : 'ai-tutor';
    drawers.renderActiveDrawer();
  });

  dom.labDrawerBtn?.addEventListener('click', () => {
    state.activeDrawer = state.activeDrawer === 'lab' ? null : 'lab';
    drawers.renderActiveDrawer();
  });

  dom.remixCodeBtn?.addEventListener('click', () => {
    transport.postToPlayer({ type: 'OPEN_STUDIO', tab: 'ast' });
    transport.focusPlayerStage();
  });

  dom.teacherToolsBtn?.addEventListener('click', () => {
    if (!dom.teacherToolsGroup || !dom.teacherToolsBtn) return;
    const isOpen = dom.teacherToolsGroup.style.display === 'inline-flex';
    dom.teacherToolsGroup.style.display = isOpen ? 'none' : 'inline-flex';
    dom.teacherToolsBtn.setAttribute('aria-expanded', String(!isOpen));
    dom.teacherToolsBtn.style.background = isOpen ? '#0f172a' : '#1e293b';
    dom.teacherToolsBtn.style.color = isOpen ? '#94a3b8' : '#f8fafc';
    dom.teacherToolsBtn.textContent = isOpen ? '🧰 Teacher Tools ▾' : '🧰 Teacher Tools ▴';
  });

  dom.diagnosticsBtn?.addEventListener('click', () => {
    state.activeDrawer = state.activeDrawer === 'diagnostics' ? null : 'diagnostics';
    drawers.renderActiveDrawer();
  });

  dom.logCsvBtn?.addEventListener('click', (e) => {
    transport.postToPlayer({ type: 'REQUEST_JOTTER_CSV', download: Boolean(e.shiftKey) });
  });

  dom.embedBtn?.addEventListener('click', () => {
    state.activeDrawer = state.activeDrawer === 'embed' ? null : 'embed';
    drawers.renderActiveDrawer();
  });

  dom.phetImportBtn?.addEventListener('click', () => {
    state.activeDrawer = state.activeDrawer === 'phet' ? null : 'phet';
    drawers.renderActiveDrawer();
  });

  dom.swfImportBtn?.addEventListener('click', () => {
    state.activeDrawer = state.activeDrawer === 'swf' ? null : 'swf';
    drawers.renderActiveDrawer();
  });

  dom.exportAirgapBtn?.addEventListener('click', () => {
    const activeMeta = getPresetMeta(state.activePreset);
    exportAirgapHtmlBundle(state.activePreset, activeMeta.label);
  });

  dom.fullscreenBtn?.addEventListener('click', () => {
    const wrapper = container.querySelector('#player-iframe-wrapper');
    if (!document.fullscreenElement) {
      wrapper?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  dom.catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeSubject = (btn.getAttribute('data-cat') as SubjectFilterId) || 'All';
      syncSubjectTabStyles();
      renderGrid();
    });
  });

  dom.formatButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFormat = (btn.getAttribute('data-format') as FormatFilterId) || 'All';
      syncFormatButtonStyles();
      renderGrid();
    });
  });

  dom.stageFilterSelect?.addEventListener('change', () => {
    activeStage = (dom.stageFilterSelect?.value as StageFilterId) || 'All';
    renderGrid();
  });

  dom.includeNonMediaCheckbox?.addEventListener('change', () => {
    includeNonMediaExtras = Boolean(dom.includeNonMediaCheckbox?.checked);
    renderGrid();
  });

  dom.clearFiltersBtn?.addEventListener('click', () => {
    activeSubject = 'All';
    activeFormat = 'All';
    activeStage = 'All';
    includeNonMediaExtras = false;
    searchQuery = '';
    if (dom.searchInput) dom.searchInput.value = '';
    if (dom.stageFilterSelect) dom.stageFilterSelect.value = 'All';
    if (dom.includeNonMediaCheckbox) dom.includeNonMediaCheckbox.checked = false;
    syncSubjectTabStyles();
    syncFormatButtonStyles();
    renderGrid();
  });

  dom.searchInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderGrid();
  });

  // Boot initial panels, status banner, catalog grid, and deep-linked SWF URL
  if (state.launcherImportPanel) {
    drawers.renderLauncherImportPanel();
  }
  if (state.activeDrawer) {
    drawers.renderActiveDrawer();
  }
  if (blockedExternalSrcOnBoot) {
    drawers.showImportStatus(
      'External remote ?src= links are blocked to keep the portal offline-safe. Please import files locally using Open File or Upgrade Flash (.swf).',
      'error'
    );
  }

  renderGrid();

  if (state.pendingExternalSwfUrl) {
    const swfUrl = state.pendingExternalSwfUrl;
    state.pendingExternalSwfUrl = null;
    void loadExternalSwfUrl(swfUrl);
  }

  return container;
}

export default renderPlayerPage;