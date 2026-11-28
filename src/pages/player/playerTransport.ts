// src/pages/player/playerTransport.ts
import { broadcastBslSpeech } from '../../services/bslGlobalStore';
import {
  registerWebMcpTools,
  type PlayerMcpTransport,
  type WebMcpRegistrationHandle,
} from '../../engine/webmcpBridge';
import { bindSitePlayerAdapter } from '../../engine/nanoSiteManager';
import type {
  EppBenchTransport,
  ProfilerCaptureResult,
} from '../../engine/eppContentionBench';
import { normalizePresetId } from './playerCatalog';
import type { HostToPlayerMessage, PlayerRuntimeState } from './playerTypes';

export interface PlayerTransport {
  postToPlayer(msg: HostToPlayerMessage): void;
  postToPlayerWithAck<T = any>(
    msg: Record<string, any>,
    expectedType: string,
    timeoutMs?: number
  ): Promise<T>;
  resolvePendingAck(data: Record<string, any>): boolean;
  focusPlayerStage(): void;
  mcpTransport: PlayerMcpTransport;
  benchTransport: EppBenchTransport;
  getWebMcpHandle(): WebMcpRegistrationHandle;
  refreshWebMcpRegistration(): Promise<void>;
  dispose(): void;
}

export interface CreatePlayerTransportDeps {
  container: HTMLElement;
  iframe: HTMLIFrameElement;
  state: PlayerRuntimeState;
  onLoadPreset: (presetId: string, skipPostMessage?: boolean) => void;
  onOpenTutorDrawer: (prompt?: string) => void;
}

export function createPlayerTransport(deps: CreatePlayerTransportDeps): PlayerTransport {
  const { container, iframe, state, onLoadPreset, onOpenTutorDrawer } = deps;

  function postToPlayer(msg: HostToPlayerMessage) {
    iframe?.contentWindow?.postMessage(msg, '*');
  }

  let reqSeq = 0;
  const pendingRequests = new Map<
    string,
    {
      expectedType: string;
      resolve: (val: any) => void;
      reject: (err: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
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

  function resolvePendingAck(data: Record<string, any>): boolean {
    if (data.requestId && pendingRequests.has(data.requestId)) {
      const pending = pendingRequests.get(data.requestId)!;
      if (data.type === pending.expectedType) {
        clearTimeout(pending.timer);
        pendingRequests.delete(data.requestId);
        pending.resolve(data);
        return true;
      }
    }
    return false;
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

  async function refreshWebMcpRegistration() {
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
      onLoadPreset(normalizePresetId(presetId), true);
      if (autoplay) postToPlayer({ type: 'PLAY' });
    },
    setVar: (name, value) => {
      postToPlayer({ type: 'SET_VAR', name, value });
    },
    highlight: (selector) => {
      postToPlayer({ type: 'EXEC_ACTION_TUPLE', tuple: `(:act :highlight "${selector}")` });
    },
    openTutor: (prompt?: string) => {
      onOpenTutorDrawer(prompt);
    },
    getActivePreset: () => state.activePreset,
  });

  const prevSwfDebugGetter = (window as any).__getSwfDebugReport;
  const hostSwfDebugGetter = () => {
    try {
      const cw = iframe?.contentWindow as any;
      if (cw && typeof cw.__getSwfDebugReport === 'function') {
        return cw.__getSwfDebugReport();
      }
      if (cw && cw.__SWF_DEBUG_STATE__?.activeRuntime?.getDebugReport) {
        return cw.__SWF_DEBUG_STATE__.activeRuntime.getDebugReport();
      }
      const eng = cw?.__astEngine || cw?.astEngine;
      const vm = eng?._swfVm || eng?._avm1Vm;
      if (vm && typeof vm.getDebugReport === 'function') {
        return vm.getDebugReport();
      }
    } catch (_) {}
    return typeof prevSwfDebugGetter === 'function'
      ? prevSwfDebugGetter()
      : { error: 'No active SWF VM in player iframe' };
  };
  (window as any).__getSwfDebugReport = hostSwfDebugGetter;

  function focusPlayerStage() {
    if (state.pageDisposed || !state.isStageOpen || !iframe?.isConnected) return;
    // Never steal focus without active user gesture (prevents Chrome focus-without-user-activation violations in iframes)
    const userActivation = (navigator as Navigator & { userActivation?: { isActive?: boolean } }).userActivation;
    if (userActivation && !userActivation.isActive) return;
    try {
      if (document.activeElement instanceof HTMLElement && document.activeElement !== iframe) {
        document.activeElement.blur();
      }
      iframe?.focus({ preventScroll: true });
      if (iframe?.contentWindow && !iframe.contentWindow.document?.hasFocus?.()) {
        iframe.contentWindow.focus();
      }
    } catch (_) {}
    postToPlayer({ type: 'FOCUS_STAGE' });
  }

  function dispose() {
    mcpRegEpoch++;
    for (const [reqId, pending] of pendingRequests.entries()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Player page disposed before response arrived.'));
      pendingRequests.delete(reqId);
    }
    if ((window as any).__getSwfDebugReport === hostSwfDebugGetter) {
      if (prevSwfDebugGetter !== undefined) (window as any).__getSwfDebugReport = prevSwfDebugGetter;
      else delete (window as any).__getSwfDebugReport;
    }
    webMcpHandle.unregister();
    bindSitePlayerAdapter(null);
  }

  return {
    postToPlayer,
    postToPlayerWithAck,
    resolvePendingAck,
    focusPlayerStage,
    mcpTransport,
    benchTransport,
    getWebMcpHandle: () => webMcpHandle,
    refreshWebMcpRegistration,
    dispose,
  };
}
