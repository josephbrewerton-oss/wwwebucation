// src/pages/player/playerTypes.ts
import type { CartridgeDefinition } from '../../services/cartridgeStore';
import type { SwfRuntimeHealthReport } from '../../services/dbStore';
import type { PlayerTelemetryEvent } from '../../engine/aicaller';
import type {
  QuizCheckpointContext,
  NanoAiTutorDrawerHandle,
} from '../../components/player/NanoAiTutorDrawer';

export type ActiveDrawerId = 'embed' | 'ai-tutor' | 'lab' | 'diagnostics' | 'swf' | 'phet' | null;

export type LauncherImportPanelId = 'swf' | 'phet' | null;

export type HostToPlayerMessage =
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

export interface SwfDistillSessionState {
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
}

export interface PlayerDomRefs {
  container: HTMLElement;
  stageShell: HTMLDivElement;
  catalogSection: HTMLElement;
  backToGridBtn: HTMLButtonElement | null;
  breadcrumbLabsBtn: HTMLButtonElement | null;
  breadcrumbSepEl: HTMLElement | null;
  breadcrumbActiveEl: HTMLElement | null;
  launcherImportBtn: HTMLButtonElement | null;
  launcherPhetBtn: HTMLButtonElement | null;
  launcherSwfBtn: HTMLButtonElement | null;
  launcherSwfMount: HTMLDivElement | null;
  importStatusEl: HTMLDivElement | null;
  importStatusTextEl: HTMLSpanElement | null;
  importStatusCloseBtn: HTMLButtonElement | null;
  iframe: HTMLIFrameElement;
  select: HTMLSelectElement;
  titleEl: HTMLElement;
  stageBadgeEl: HTMLElement;
  typeBadgeEl: HTMLElement;
  integrityBadgeEl: HTMLButtonElement | null;
  integrityReadoutEl: HTMLDivElement | null;
  integrityReadoutBodyEl: HTMLDivElement | null;
  integrityReadoutCloseBtn: HTMLButtonElement | null;
  playBtn: HTMLButtonElement | null;
  playIcon: HTMLElement | null;
  playText: HTMLElement | null;
  resetBtn: HTMLButtonElement | null;
  muteBtn: HTMLButtonElement | null;
  bslBtn: HTMLButtonElement | null;
  aiTutorBtn: HTMLButtonElement | null;
  labDrawerBtn: HTMLButtonElement | null;
  remixCodeBtn: HTMLButtonElement | null;
  diagnosticsBtn: HTMLButtonElement | null;
  teacherToolsBtn: HTMLButtonElement | null;
  teacherToolsGroup: HTMLDivElement | null;
  logCsvBtn: HTMLButtonElement | null;
  openBtn: HTMLButtonElement;
  phetImportBtn: HTMLButtonElement | null;
  swfImportBtn: HTMLButtonElement | null;
  embedBtn: HTMLButtonElement | null;
  exportAirgapBtn: HTMLButtonElement | null;
  drawerMount: HTMLDivElement | null;
  swfDistillerStripMount: HTMLDivElement | null;
  fileInputHidden: HTMLInputElement;
  fullscreenBtn: HTMLButtonElement;
  searchInput: HTMLInputElement;
  stageFilterSelect: HTMLSelectElement | null;
  includeNonMediaCheckbox: HTMLInputElement | null;
  clearFiltersBtn: HTMLButtonElement | null;
  resultsSummaryEl: HTMLElement | null;
  recentStripEl: HTMLDivElement | null;
  gridContainer: HTMLDivElement;
  catButtons: NodeListOf<HTMLButtonElement>;
  formatButtons: NodeListOf<HTMLButtonElement>;
  iframeWrapper: HTMLDivElement;
}

export interface PlayerRuntimeState {
  activePreset: string;
  isStageOpen: boolean;
  isIframeReady: boolean;
  pageDisposed: boolean;
  stageMediaInputActive: boolean;
  pendingCustomCartridge: CartridgeDefinition | null;
  lastMountedCustomPresetId: string | null;
  lastMountedCustomAt: number;
  pendingExternalSwfUrl: string | null;
  initialExternalSrc: string | null;
  pendingAutoEppBench: boolean;
  pendingAutoOpenStudio: boolean;
  activeDrawer: ActiveDrawerId;
  launcherImportPanel: LauncherImportPanelId;
  bslActive: boolean;
  isMuted: boolean;
  latestTelemetry: PlayerTelemetryEvent | null;
  activeQuizContext: QuizCheckpointContext | null;
  isAiDemonstrating: boolean;
  autoRunEppBenchOnce: boolean;
  mountedAiTutorHandle: NanoAiTutorDrawerHandle | null;
  mountedAiTutorPreset: string;
  swfFileName: string;
  swfRuntimeHealth: SwfRuntimeHealthReport | null;
  swfDistillSession: SwfDistillSessionState;
}

export function createInitialSwfDistillSession(): SwfDistillSessionState {
  return {
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
}

export function cartridgeNeedsStageKeyForwarding(cart?: CartridgeDefinition | null): boolean {
  return Boolean(
    cart?.astSource &&
      (cart.astSource.includes('(:swf-vm') || cart.astSource.includes('(:key-bindings'))
  );
}
