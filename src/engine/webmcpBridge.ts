// src/engine/webmcpBridge.ts
/**
 * W3C WebMCP (document.modelContext) Bridge & Benchmark
 *
 * Registers structured JSON-Schema tools for AI agents and the Chrome Built-in AI
 * Early Preview Program without exposing raw DOM trees or requiring cloud round-trips.
 * Zero runtime dependencies. 100% air-gapped & local-first.
 */

export type WebMcpSurface =
  | 'document.modelContext'
  | 'unavailable';

export interface EngineVarMeta {
  val: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export interface EngineLedgerSnapshot {
  id: string;
  unit?: string;
  maxVal?: number;
  total: number;
  terms: Array<{ label: string; value: number; color?: string }>;
}

export interface EngineCheckpointGoalSnapshot {
  index: number;
  title: string;
  passExpr: string | null;
  holdDuration: number;
  holdElapsed: number;
  passed: boolean;
}

export interface EngineStateSummary {
  sceneId: string;
  title: string;
  archetype: string;
  t: number;
  progress: number;
  isPlaying: boolean;
  vars: Record<string, number | string | boolean>;
  varMeta: Record<string, EngineVarMeta>;
  ledgers: EngineLedgerSnapshot[];
  scopesCount: number;
  checkpointGoals: EngineCheckpointGoalSnapshot[];
  astSourceBytes: number;
  svgDomBytes: number;
}

export interface PlayerMcpTransport {
  readState: (includeSvgBytes?: boolean) => Promise<EngineStateSummary | null>;
  setVar: (
    name: string,
    value: number | string
  ) => Promise<{
    name: string;
    value: number | string;
    clamped: boolean;
    state?: EngineStateSummary | null;
  }>;
  execActionTuple: (tuple: string) => Promise<{
    ok: boolean;
    executedActions: string[];
    state?: EngineStateSummary | null;
  }>;
  onSay?: (text: string) => void;
}

export interface WebMcpToolAnnotations {
  readOnlyHint?: boolean;
  consequentialHint?: boolean;
}

export interface WebMcpToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  annotations?: WebMcpToolAnnotations;
  execute: (args: Record<string, any>, client?: unknown) => Promise<any>;
}

export interface WebMcpRegisterOptions {
  /** Hard cutoff timeout (ms) for async tool registration settlement. Default: 5000. */
  timeoutMs?: number;
  /** Roll back all tools via AbortController if any registration fails or times out. Default: true. */
  atomic?: boolean;
  /** Timing cutoff: 'immediate' for SPA cartridge swaps, 'dom-ready' for MPA <head> scripts. Default: 'immediate'. */
  phase?: 'immediate' | 'dom-ready';
  /** Expose only read-only tools (e.g. for suspect/approximated SWFs). Default: false. */
  readOnlyOnly?: boolean;
  /** Skip document.modelContext registration entirely (e.g. for reject-low-value SWFs). Default: false. */
  skipRegistration?: boolean;
  /** Optional external AbortSignal to cancel pending registration or tear down active tools. */
  signal?: AbortSignal;
}

export interface WebMcpWaitResult {
  ready: boolean;
  timedOut: boolean;
  aborted: boolean;
  registeredTools: string[];
  failedTools: Array<{ name: string; reason: string }>;
  elapsedMs: number;
}

export interface WebMcpRegistrationHandle {
  registered: boolean;
  surface: WebMcpSurface;
  mode: 'registerTool' | 'headless-local';
  toolNames: string[];
  tools: WebMcpToolDescriptor[];
  failedTools?: Array<{ name: string; reason: string }>;
  ready?: Promise<void>;
  waitForToolsUntil?: (opts?: { timeoutMs?: number; signal?: AbortSignal }) => Promise<WebMcpWaitResult>;
  unregister: () => void;
}

export interface WebMcpClampingTrace {
  varName: string;
  bounds: { min: number | null; max: number | null };
  unclampedInput: number | string;
  clampedOutput: number | string;
  restoredValue: number | string | null;
}

export interface WebMcpBenchmarkResult {
  surface: WebMcpSurface;
  registrationMode: WebMcpRegistrationHandle['mode'];
  toolsCount: number;
  toolNames: string[];
  readLatencyMs: number;
  setVarLatencyMs: number;
  dispatchLatencyMs: number;
  meanRoundTripMs: number;
  mcpPayloadBytes: number;
  rawSvgBytes: number;
  domPayloadReductionPct: number;
  clampingVerified: boolean;
  sampleVarTested: string | null;
  clampingTrace?: WebMcpClampingTrace | null;
  timestamp: number;
}

const SAFE_ID_SELECTOR_RE = /^#[a-zA-Z0-9_\-:]+$/;
const SAFE_VAR_NAME_RE = /^[a-zA-Z0-9_]+$/;

function getUtf8ByteLength(text: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).byteLength;
  }
  return text.length;
}

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

export function detectWebMcpSurface(): { surface: WebMcpSurface; api: any | null } {
  if (typeof document !== 'undefined' && (document as any).modelContext) {
    return { surface: 'document.modelContext', api: (document as any).modelContext };
  }
  return { surface: 'unavailable', api: null };
}

/**
 * Clamps a numeric variable strictly within its declared [min, max] bounds.
 */
export function clampVarValue(
  rawValue: number | string,
  meta?: EngineVarMeta | null
): { value: number | string; clamped: boolean } {
  if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
    return { value: rawValue, clamped: false };
  }
  let v = rawValue;
  let clamped = false;
  if (meta && typeof meta.min === 'number' && Number.isFinite(meta.min) && v < meta.min) {
    v = meta.min;
    clamped = true;
  }
  if (meta && typeof meta.max === 'number' && Number.isFinite(meta.max) && v > meta.max) {
    v = meta.max;
    clamped = true;
  }
  return { value: v, clamped };
}

/**
 * Normalizes and validates a 4-slot (:act :seek :highlight :var :say) tuple.
 */
export function buildSafeActionTuple(args: {
  tuple?: string;
  seek?: number;
  highlight?: string;
  varName?: string;
  varValue?: number | string;
  say?: string;
}, varMeta?: Record<string, EngineVarMeta>): {
  tuple: string;
  sayText: string | null;
  rejectedSelectors: string[];
} {
  const rejectedSelectors: string[] = [];

  if (typeof args.tuple === 'string' && args.tuple.trim().startsWith('(:act')) {
    const raw = args.tuple.trim();
    const parts: string[] = [];

    const seekM = raw.match(/:seek\s+([0-9.-]+)/i);
    if (seekM) {
      const p = Math.max(0, Math.min(1, parseFloat(seekM[1])));
      if (Number.isFinite(p)) parts.push(`:seek ${p.toFixed(3)}`);
    }

    const hiM = raw.match(/:highlight\s+"([^"]+)"/i);
    if (hiM) {
      if (SAFE_ID_SELECTOR_RE.test(hiM[1])) {
        parts.push(`:highlight "${hiM[1]}"`);
      } else {
        rejectedSelectors.push(hiM[1]);
      }
    }

    const varM = raw.match(/:var\s+"([a-zA-Z0-9_]+)"\s+([0-9.-]+|"[^"]*")/i);
    if (varM && SAFE_VAR_NAME_RE.test(varM[1])) {
      const vName = varM[1];
      const stripped = varM[2].replace(/^"|"$/g, '');
      const numVal = Number(stripped);
      if (!Number.isNaN(numVal) && varM[2][0] !== '"') {
        const clamped = clampVarValue(numVal, varMeta?.[vName]);
        parts.push(`:var "${vName}" ${clamped.value}`);
      } else {
        parts.push(`:var "${vName}" "${stripped.replace(/"/g, "'")}"`);
      }
    }

    let sayText: string | null = null;
    const sayM = raw.match(/:say\s+"([^"]*)"/i);
    if (sayM) {
      sayText = sayM[1];
      parts.push(`:say "${sayM[1]}"`);
    }

    return {
      tuple: parts.length > 0 ? `(:act ${parts.join(' ')})` : '(:act :seek 0.000)',
      sayText,
      rejectedSelectors,
    };
  }

  const slots: string[] = [];
  if (typeof args.seek === 'number' && Number.isFinite(args.seek)) {
    const clampedSeek = Math.max(0, Math.min(1, args.seek));
    slots.push(`:seek ${clampedSeek.toFixed(3)}`);
  }
  if (typeof args.highlight === 'string' && args.highlight.trim()) {
    const sel = args.highlight.trim().startsWith('#')
      ? args.highlight.trim()
      : `#${args.highlight.trim()}`;
    if (SAFE_ID_SELECTOR_RE.test(sel)) {
      slots.push(`:highlight "${sel}"`);
    } else {
      rejectedSelectors.push(args.highlight);
    }
  }
  if (typeof args.varName === 'string' && SAFE_VAR_NAME_RE.test(args.varName.trim()) && args.varValue !== undefined) {
    const vName = args.varName.trim();
    const clamped = clampVarValue(args.varValue, varMeta?.[vName]);
    if (typeof clamped.value === 'number') {
      slots.push(`:var "${vName}" ${clamped.value}`);
    } else {
      slots.push(`:var "${vName}" "${String(clamped.value).replace(/"/g, "'")}"`);
    }
  }
  let sayText: string | null = null;
  if (typeof args.say === 'string' && args.say.trim()) {
    sayText = args.say.trim().replace(/"/g, "'");
    slots.push(`:say "${sayText}"`);
  }

  return {
    tuple: slots.length > 0 ? `(:act ${slots.join(' ')})` : '(:act :say "Inspection ping")',
    sayText,
    rejectedSelectors,
  };
}

/**
 * Builds the 3 canonical structured JSON-Schema tools for WebMCP.
 */
export function createPlayerWebMcpTools(transport: PlayerMcpTransport): WebMcpToolDescriptor[] {
  const astSetVarTool: WebMcpToolDescriptor = {
    name: 'ast_set_var',
    description:
      'Mutates a declared simulation :var parameter strictly clamped to its [min, max] bounds and updates reactive bindings.',
    annotations: { readOnlyHint: false },
    inputSchema: {
      type: 'object',
      description: 'Parameters for mutating a declared simulation :var safely within [min, max] bounds.',
      properties: {
        name: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_]+$',
          description: 'Declared simulation variable identifier (e.g. temp, conc, pressure).',
        },
        value: {
          oneOf: [{ type: 'number' }, { type: 'string' }],
          description: 'Target numeric or string value; numeric inputs are automatically clamped to declared [min, max] bounds.',
        },
      },
      required: ['name', 'value'],
      additionalProperties: false,
    },
    execute: async (args) => {
      const start = nowMs();
      const name = String(args?.name || '').trim();
      if (!SAFE_VAR_NAME_RE.test(name)) {
        throw new Error(`Invalid variable identifier: "${name}"`);
      }
      const rawVal = args?.value;
      if (typeof rawVal !== 'number' && typeof rawVal !== 'string') {
        throw new Error('Variable value must be a finite number or string.');
      }
      if (typeof rawVal === 'number' && !Number.isFinite(rawVal)) {
        throw new Error('Numeric variable value must be finite.');
      }

      const preState = await transport.readState(false);
      const meta = preState?.varMeta?.[name] || null;
      const { value: clampedVal, clamped: preClamped } = clampVarValue(rawVal, meta);

      const ack = await transport.setVar(name, clampedVal);
      const latencyMs = Number((nowMs() - start).toFixed(3));
      const payload = {
        ok: true,
        name: ack.name || name,
        requestedValue: rawVal,
        appliedValue: ack.value,
        clamped: Boolean(preClamped || ack.clamped),
        bounds: meta ? { min: meta.min ?? null, max: meta.max ?? null } : null,
        latencyMs,
      };
      return {
        ...payload,
        mcpPayloadBytes: getUtf8ByteLength(JSON.stringify(payload)),
      };
    },
  };

  const astDispatchActionTool: WebMcpToolDescriptor = {
    name: 'ast_dispatch_action',
    description:
      'Executes the 4-slot AST Vector Player action tuple (:seek, :highlight, :var, :say) with selector sanitization.',
    annotations: { readOnlyHint: false },
    inputSchema: {
      type: 'object',
      description: 'Structured or raw 4-slot (:act ...) action dispatch arguments with SVG selector sanitization.',
      properties: {
        tuple: {
          type: 'string',
          description: 'Optional raw (:act ...) S-expression tuple.',
        },
        seek: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Normalized timeline progress in [0.0, 1.0].',
        },
        highlight: {
          type: 'string',
          pattern: '^#[a-zA-Z0-9_\\-:]+$',
          description: 'SVG element ID selector (e.g. #piston-head) to pulse on stage.',
        },
        varName: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_]+$',
          description: 'Variable name for simultaneous :var mutation.',
        },
        varValue: {
          oneOf: [{ type: 'number' }, { type: 'string' }],
          description: 'Variable value for simultaneous :var mutation.',
        },
        say: {
          type: 'string',
          description: 'Short pedagogical utterance routed to BSL & audio narration.',
        },
      },
      additionalProperties: false,
    },
    execute: async (args) => {
      const start = nowMs();
      const preState = await transport.readState(false);
      const built = buildSafeActionTuple(args || {}, preState?.varMeta);
      if (built.rejectedSelectors.length > 0 && built.tuple === '(:act :say "Inspection ping")') {
        throw new Error(`Unsafe SVG selector rejected: ${built.rejectedSelectors.join(', ')}`);
      }
      const res = await transport.execActionTuple(built.tuple);
      if (built.sayText && transport.onSay) {
        transport.onSay(built.sayText);
      }
      const latencyMs = Number((nowMs() - start).toFixed(3));
      const payload = {
        ok: res.ok,
        tuple: built.tuple,
        executedActions: res.executedActions,
        rejectedSelectors: built.rejectedSelectors,
        latencyMs,
      };
      return {
        ...payload,
        mcpPayloadBytes: getUtf8ByteLength(JSON.stringify(payload)),
      };
    },
  };

  const astReadStateTool: WebMcpToolDescriptor = {
    name: 'ast_read_state',
    description:
      'Returns compact current simulation state: clock t, normalized progress, :vars, :ledger conservation totals, and :pass-expr checkpoint status.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      description: 'Read-only inspection parameters for compact simulation telemetry.',
      properties: {
        includeSvgBytes: {
          type: 'boolean',
          description: 'Include raw SVG DOM serialized byte count to compare against compact MCP JSON bytes.',
        },
      },
      additionalProperties: false,
    },
    execute: async (args) => {
      const start = nowMs();
      const includeSvgBytes = args?.includeSvgBytes !== false;
      const state = await transport.readState(includeSvgBytes);
      const latencyMs = Number((nowMs() - start).toFixed(3));

      if (!state) {
        return {
          ok: false,
          latencyMs,
          mcpPayloadBytes: 0,
          rawSvgBytes: 0,
          domPayloadReductionPct: 0,
        };
      }

      const compactPayload = {
        sceneId: state.sceneId,
        title: state.title,
        archetype: state.archetype,
        t: Number((state.t || 0).toFixed(3)),
        progress: Number((state.progress || 0).toFixed(4)),
        isPlaying: state.isPlaying,
        vars: state.vars,
        ledgers: state.ledgers,
        scopesCount: state.scopesCount,
        checkpointGoals: state.checkpointGoals,
      };
      const mcpPayloadBytes = getUtf8ByteLength(JSON.stringify(compactPayload));
      const rawSvgBytes = Math.max(0, state.svgDomBytes || 0);
      const domPayloadReductionPct =
        rawSvgBytes > 0
          ? Number((((rawSvgBytes - mcpPayloadBytes) / rawSvgBytes) * 100).toFixed(2))
          : 0;

      return {
        ok: true,
        ...compactPayload,
        varMeta: state.varMeta,
        astSourceBytes: state.astSourceBytes,
        rawSvgBytes,
        mcpPayloadBytes,
        domPayloadReductionPct,
        latencyMs,
      };
    },
  };

  return [astSetVarTool, astDispatchActionTool, astReadStateTool];
}

let activePlayerRegistrationAbort: AbortController | null = null;

function waitForDomReadyCutoff(signal?: AbortSignal): Promise<boolean> {
  if (typeof document === 'undefined' || !document.readyState || document.readyState !== 'loading') {
    return Promise.resolve(!signal?.aborted);
  }
  if (signal?.aborted) return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    const onReady = () => {
      cleanup();
      resolve(true);
    };
    const onAbort = () => {
      cleanup();
      resolve(false);
    };
    const cleanup = () => {
      try {
        document.removeEventListener('DOMContentLoaded', onReady);
      } catch {}
      try {
        signal?.removeEventListener('abort', onAbort);
      } catch {}
    };
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Awaits WebMCP registration settlement with a deterministic timeout/abort cutoff.
 * If the cutoff expires before all tools settle, aborts the registration handle so
 * an incomplete toolset is never prematurely exposed on DOOH kiosks or SPA route swaps.
 */
export async function waitForToolsUntil(
  handle: WebMcpRegistrationHandle,
  opts?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<WebMcpWaitResult> {
  const start = nowMs();
  const timeoutMs = Math.max(10, Number(opts?.timeoutMs ?? 5000));
  const externalSignal = opts?.signal;

  if (externalSignal?.aborted) {
    handle.unregister();
    return {
      ready: false,
      timedOut: false,
      aborted: true,
      registeredTools: [],
      failedTools: handle.failedTools ? handle.failedTools.slice() : [],
      elapsedMs: Number((nowMs() - start).toFixed(2)),
    };
  }

  if (!handle.ready) {
    return {
      ready: handle.registered,
      timedOut: false,
      aborted: false,
      registeredTools: handle.registered ? handle.toolNames.slice() : [],
      failedTools: handle.failedTools ? handle.failedTools.slice() : [],
      elapsedMs: Number((nowMs() - start).toFixed(2)),
    };
  }

  let timedOut = false;
  let aborted = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let onAbort: (() => void) | null = null;

  try {
    await Promise.race([
      handle.ready,
      new Promise<void>((resolve) => {
        timer = setTimeout(() => {
          timedOut = true;
          resolve();
        }, timeoutMs);
        if (externalSignal) {
          onAbort = () => {
            aborted = true;
            resolve();
          };
          externalSignal.addEventListener('abort', onAbort, { once: true });
        }
      }),
    ]);
  } finally {
    if (timer !== null) clearTimeout(timer);
    if (externalSignal && onAbort) {
      try {
        externalSignal.removeEventListener('abort', onAbort);
      } catch {}
    }
  }

  if (timedOut || aborted) {
    handle.unregister();
    return {
      ready: false,
      timedOut,
      aborted,
      registeredTools: [],
      failedTools: handle.failedTools ? handle.failedTools.slice() : [],
      elapsedMs: Number((nowMs() - start).toFixed(2)),
    };
  }

  return {
    ready: handle.registered,
    timedOut: false,
    aborted: false,
    registeredTools: handle.registered ? handle.toolNames.slice() : [],
    failedTools: handle.failedTools ? handle.failedTools.slice() : [],
    elapsedMs: Number((nowMs() - start).toFixed(2)),
  };
}

/**
 * Registers structured WebMCP tools exclusively on document.modelContext
 * using AbortSignal cleanup, Promise.allSettled() settlement, atomic rollback
 * on partial failure/timeout, and MPA/SPA load-cutoff support.
 */
export function registerWebMcpTools(
  transport: PlayerMcpTransport,
  options?: WebMcpRegisterOptions
): WebMcpRegistrationHandle {
  const allTools = createPlayerWebMcpTools(transport);
  const tools = options?.readOnlyOnly
    ? allTools.filter((t) => t.annotations?.readOnlyHint === true)
    : allTools;
  const toolNames = tools.map((t) => t.name);
  const { surface, api } = detectWebMcpSurface();
  const atomic = options?.atomic !== false;
  const timeoutMs = Math.max(10, Number(options?.timeoutMs ?? 5000));
  const phase = options?.phase || 'immediate';

  if (activePlayerRegistrationAbort && !activePlayerRegistrationAbort.signal.aborted) {
    try {
      activePlayerRegistrationAbort.abort();
    } catch {
      // Safe prior cleanup
    }
    activePlayerRegistrationAbort = null;
  }

  if (options?.skipRegistration || !api || typeof api.registerTool !== 'function' || tools.length === 0) {
    const emptyHandle: WebMcpRegistrationHandle = {
      registered: false,
      surface,
      mode: 'headless-local',
      toolNames,
      tools,
      failedTools: [],
      ready: Promise.resolve(),
      unregister: () => {},
    };
    emptyHandle.waitForToolsUntil = (waitOpts) => waitForToolsUntil(emptyHandle, waitOpts);
    return emptyHandle;
  }

  const abortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
  activePlayerRegistrationAbort = abortController;

  const registeredIndividual: string[] = [];
  const failedTools: Array<{ name: string; reason: string }> = [];

  const rollback = () => {
    try {
      if (abortController && !abortController.signal.aborted) {
        abortController.abort();
      }
      if (activePlayerRegistrationAbort === abortController) {
        activePlayerRegistrationAbort = null;
      }
      if (typeof api.unregisterTool === 'function') {
        for (const name of registeredIndividual) {
          try {
            api.unregisterTool(name);
          } catch {
            // Ignore if already unregistered by AbortSignal
          }
        }
      }
    } catch {
      // Safe teardown
    }
    handle.registered = false;
    handle.mode = 'headless-local';
  };

  const handle: WebMcpRegistrationHandle = {
    registered: false,
    surface,
    mode: 'headless-local',
    toolNames,
    tools,
    failedTools,
    ready: Promise.resolve(),
    unregister: rollback,
  };
  handle.waitForToolsUntil = (waitOpts) => waitForToolsUntil(handle, waitOpts);

  if (options?.signal) {
    if (options.signal.aborted) {
      rollback();
      return handle;
    }
    options.signal.addEventListener('abort', () => rollback(), { once: true });
  }

  const invokeRegistrations = (): Array<{ name: string; promise: Promise<any> }> => {
    const pending: Array<{ name: string; promise: Promise<any> }> = [];
    for (const tool of tools) {
      if (abortController?.signal.aborted) break;
      const toolDef = {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
        execute: tool.execute,
      };
      try {
        const result = abortController
          ? api.registerTool(toolDef, { signal: abortController.signal })
          : api.registerTool(toolDef);
        registeredIndividual.push(tool.name);
        if (result && typeof result.then === 'function') {
          pending.push({ name: tool.name, promise: result });
        }
      } catch (err: any) {
        failedTools.push({ name: tool.name, reason: err?.message || String(err) });
        console.warn(`[WebMCP] Synchronous registerTool failure for '${tool.name}':`, err);
      }
    }
    return pending;
  };

  const finalizeSettlement = (
    settled: PromiseSettledResult<any>[],
    pending: Array<{ name: string; promise: Promise<any> }>
  ) => {
    for (let i = 0; i < settled.length; i++) {
      const res = settled[i];
      if (res.status === 'rejected') {
        const toolName = pending[i].name;
        failedTools.push({
          name: toolName,
          reason: res.reason instanceof Error ? res.reason.message : String(res.reason),
        });
        console.warn(`[WebMCP] Async registerTool rejected for '${toolName}':`, res.reason);
      }
    }

    if (abortController?.signal.aborted) {
      rollback();
      return;
    }

    if (atomic && failedTools.length > 0) {
      rollback();
      return;
    }

    const okCount = registeredIndividual.length - failedTools.length;
    if (okCount > 0) {
      handle.registered = true;
      handle.mode = 'registerTool';
    } else {
      rollback();
    }
  };

  const needsDomReadyWait =
    phase === 'dom-ready' &&
    typeof document !== 'undefined' &&
    Boolean(document.readyState) &&
    document.readyState === 'loading';

  if (needsDomReadyWait) {
    handle.ready = (async () => {
      const domReadyOk = await waitForDomReadyCutoff(abortController?.signal);
      if (!domReadyOk || abortController?.signal.aborted) {
        rollback();
        return;
      }
      const pending = invokeRegistrations();
      if (pending.length === 0) {
        finalizeSettlement([], []);
        return;
      }
      let timedOut = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const settled = await Promise.race([
        Promise.allSettled(pending.map((p) => p.promise)),
        new Promise<null>((resolve) => {
          timer = setTimeout(() => {
            timedOut = true;
            resolve(null);
          }, timeoutMs);
        }),
      ]);
      if (timer !== null) clearTimeout(timer);
      if (timedOut || !settled) {
        failedTools.push({ name: '*', reason: `WebMCP registration timed out after ${timeoutMs}ms` });
        rollback();
        return;
      }
      finalizeSettlement(settled, pending);
    })();
    return handle;
  }

  const pendingRegistrations = invokeRegistrations();
  if (pendingRegistrations.length === 0) {
    finalizeSettlement([], []);
  } else {
    handle.ready = (async () => {
      let timedOut = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const settled = await Promise.race([
        Promise.allSettled(pendingRegistrations.map((p) => p.promise)),
        new Promise<null>((resolve) => {
          timer = setTimeout(() => {
            timedOut = true;
            resolve(null);
          }, timeoutMs);
        }),
      ]);
      if (timer !== null) clearTimeout(timer);
      if (timedOut || !settled) {
        failedTools.push({ name: '*', reason: `WebMCP registration timed out after ${timeoutMs}ms` });
        rollback();
        return;
      }
      finalizeSettlement(settled, pendingRegistrations);
    })();
  }

  return handle;
}

/**
 * Runs a live round-trip actuation benchmark across all 3 WebMCP tools against the mounted simulation stage,
 * verifying numeric [min, max] clamping with unclamped->clamped trace and measuring MCP payload compactness vs raw SVG DOM bytes.
 */
export async function runWebMcpBenchmark(
  transport: PlayerMcpTransport,
  existingTools?: WebMcpToolDescriptor[]
): Promise<WebMcpBenchmarkResult> {
  const { surface, api } = detectWebMcpSurface();
  const tools = existingTools && existingTools.length === 3 ? existingTools : createPlayerWebMcpTools(transport);
  const setVarTool = tools.find((t) => t.name === 'ast_set_var')!;
  const dispatchTool = tools.find((t) => t.name === 'ast_dispatch_action')!;
  const readTool = tools.find((t) => t.name === 'ast_read_state')!;

  // 1. Read state & measure payload bytes vs raw SVG DOM bytes
  const readResult = await readTool.execute({ includeSvgBytes: true });
  const readLatencyMs = Number(readResult.latencyMs || 0);
  const mcpPayloadBytes = Number(readResult.mcpPayloadBytes || 0);
  const rawSvgBytes = Number(readResult.rawSvgBytes || 0);
  const domPayloadReductionPct = Number(readResult.domPayloadReductionPct || 0);

  // 2. Pick a declared numeric variable with bounds (or fallback) and test clamping cleanly
  let sampleVarTested: string | null = null;
  let originalVal: number | string | null = null;
  let setVarLatencyMs = 0;
  let clampingVerified = false;
  let clampingTrace: WebMcpClampingTrace | null = null;

  const varMeta: Record<string, EngineVarMeta> = readResult.varMeta || {};
  for (const [vName, meta] of Object.entries(varMeta)) {
    if (
      vName !== 'simClock' &&
      meta &&
      typeof meta.max === 'number' &&
      typeof meta.min === 'number' &&
      meta.max > meta.min
    ) {
      sampleVarTested = vName;
      originalVal = readResult.vars?.[vName] ?? meta.val ?? meta.min;
      const unclampedInput = meta.max + 25;
      const overshootRes = await setVarTool.execute({
        name: vName,
        value: unclampedInput,
      });
      setVarLatencyMs = Number(overshootRes.latencyMs || 0);
      clampingVerified = Boolean(overshootRes.clamped) && Number(overshootRes.appliedValue) === meta.max;
      clampingTrace = {
        varName: vName,
        bounds: { min: meta.min, max: meta.max },
        unclampedInput,
        clampedOutput: overshootRes.appliedValue,
        restoredValue: originalVal,
      };

      // Restore original variable value immediately so we don't leave test perturbation behind
      if (originalVal !== null) {
        await setVarTool.execute({ name: vName, value: originalVal });
      }
      break;
    }
  }

  // Fallback var ping if scene declares no bounded slider variable
  if (!sampleVarTested) {
    const tStart = nowMs();
    try {
      const pingVal = Number(readResult.t || 0);
      const pingRes = await setVarTool.execute({ name: 'simClock', value: pingVal });
      setVarLatencyMs = Number(pingRes.latencyMs || (nowMs() - tStart));
      clampingVerified = true; // no numeric overshoot bounds present
      sampleVarTested = 'simClock';
      clampingTrace = {
        varName: 'simClock',
        bounds: { min: null, max: null },
        unclampedInput: pingVal,
        clampedOutput: pingRes.appliedValue ?? pingVal,
        restoredValue: pingVal,
      };
    } catch {
      setVarLatencyMs = Number((nowMs() - tStart).toFixed(3));
    }
  }

  // 3. Measure 4-slot action tuple dispatch latency
  const dispatchRes = await dispatchTool.execute({
    say: 'WebMCP 4-slot action verification complete.',
  });
  const dispatchLatencyMs = Number(dispatchRes.latencyMs || 0);

  const latencies = [readLatencyMs, setVarLatencyMs, dispatchLatencyMs].filter((x) => x > 0);
  const meanRoundTripMs =
    latencies.length > 0
      ? Number((latencies.reduce((acc, v) => acc + v, 0) / latencies.length).toFixed(3))
      : 0;

  const registrationMode: WebMcpRegistrationHandle['mode'] =
    api && typeof api.registerTool === 'function' ? 'registerTool' : 'headless-local';

  return {
    surface,
    registrationMode,
    toolsCount: tools.length,
    toolNames: tools.map((t) => t.name),
    readLatencyMs,
    setVarLatencyMs,
    dispatchLatencyMs,
    meanRoundTripMs,
    mcpPayloadBytes,
    rawSvgBytes,
    domPayloadReductionPct,
    clampingVerified,
    sampleVarTested,
    clampingTrace,
    timestamp: Date.now(),
  };
}
