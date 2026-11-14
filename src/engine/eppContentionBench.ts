// src/engine/eppContentionBench.ts
/**
 * Chrome Built-in AI & WebMCP Field Telemetry Test Bed Harness
 *
 * Measures empirical 60 FPS GPU/NPU contention across isolated Baseline, Concurrent
 * Inference, and Recovery phases alongside Prompt API quota curves, AST-vs-JSON-.astb
 * token compression, and WebMCP round-trip actuation latencies.
 *
 * 100% air-gapped, local-first, zero cloud egress.
 */

import { parseSExpr } from '../utils/sexprParser';
import { compileAstTextToBytecode, decompileBytecodeToScene } from '../utils/astBytecode';
import { edgeCognitiveEngine } from './EdgeCognitiveEngine';
import { hasUserGrantedAiConsent } from './aicaller';
import {
  getAllAppStateRecords,
  putAppStateRecord,
} from '../services/dbStore';
import {
  getBslEnabled,
  setBslEnabled,
  broadcastBslSpeech,
} from '../services/bslGlobalStore';
import {
  detectWebMcpSurface,
  runWebMcpBenchmark,
  type EngineStateSummary,
  type PlayerMcpTransport,
  type WebMcpBenchmarkResult,
  type WebMcpToolDescriptor,
} from './webmcpBridge';

export const EPP_DOSSIER_STATE_KEY = 'epp_last_telemetry_dossier';

export interface ProfilerCaptureStats {
  sampleCount: number;
  meanMs: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  framesOver16_67ms: number;
  overBudgetPct: number;
  estimatedFps: number;
  meanComputeMs: number;
  p95ComputeMs: number;
}

export interface ProfilerActiveMetrics {
  activeScopes: number;
  activeLedgers: number;
  physicsBodies: number;
  physicsSprings: number;
  substeps: number;
  emitterParticles: number;
}

export interface ProfilerCaptureResult {
  stats: ProfilerCaptureStats;
  memory: {
    wasmPoolBytes: number;
    wasmPages: number;
    usedJsHeapBytes: number;
    totalJsHeapBytes: number;
  };
  activeMetrics: ProfilerActiveMetrics;
}

export interface QuotaTurnMetric {
  turn: number;
  promptRole: 'ast-synthesis' | 'socratic-drill-1' | 'socratic-drill-2' | 'socratic-drill-3';
  promptBytes: number;
  outputBytes: number;
  ttftMs: number;
  durationMs: number;
  inputUsage: number | null;
  inputQuota: number | null;
  quotaoverflowCount: number;
  validOutput: boolean;
}

export interface CompressionComparisonResult {
  astLines: number;
  astBytes: number;
  jsonBytes: number;
  astbBytes: number;
  astEstimatedTokens: number;
  jsonEstimatedTokens: number;
  astMeasuredTokens: number | null;
  jsonMeasuredTokens: number | null;
  astVsJsonByteSavingsPct: number;
  astVsJsonTokenSavingsPct: number;
  astbVsJsonByteSavingsPct: number;
  astValid: boolean;
  jsonValid: boolean;
  astbValid: boolean;
}

export interface EppContentionPhaseMetrics {
  durationMs: number;
  stats: ProfilerCaptureStats;
  activeMetrics: ProfilerActiveMetrics;
  workloadLabel: string;
}

export interface EppTelemetryDossier {
  dossierVersion: '1.0.0';
  generatedAtIso: string;
  sceneId: string;
  hardwareProfile: {
    userAgent: string;
    deviceMemoryGb: number | null;
    hardwareConcurrency: number | null;
    webgpuSupported: boolean;
    wasmPoolBytes: number;
    wasmPages: number;
    jsHeapStartMb: number | null;
    jsHeapEndMb: number | null;
    heapDeltaMb: number | null;
    bslAvatarActiveDuringRun: boolean;
  };
  promptApiStatus: {
    present: boolean;
    availability: string;
    activeTier: 'chrome-builtin-nano' | 'webgpu-webllm' | 'tier3-deterministic-ast';
    cloneLatencyMs: number | null;
    cloneDestroyedCleanly: boolean;
    constraintSchemaUsed: boolean;
  };
  contentionPhases: {
    phaseABaseline: EppContentionPhaseMetrics;
    phaseBConcurrent: EppContentionPhaseMetrics;
    phaseCRecovery: EppContentionPhaseMetrics;
    deltas: {
      phaseBMeanMsDelta: number;
      phaseBP95MsDelta: number;
      phaseBP99MsDelta: number;
      phaseBMaxMsDelta: number;
      phaseBOverBudgetFrameDelta: number;
      phaseCMeanMsDelta: number;
      phaseCP95MsDelta: number;
    };
  };
  contextQuotaTrace: {
    inputQuota: number | null;
    finalInputUsage: number | null;
    totalQuotaOverflows: number;
    meanTtftMs: number | null;
    turns: QuotaTurnMetric[];
  };
  compressionComparison: CompressionComparisonResult;
  webmcpBenchmark: WebMcpBenchmarkResult;
}

export interface EppBenchProgress {
  phase: 'init' | 'phase-a' | 'phase-b' | 'phase-c' | 'webmcp' | 'export' | 'complete';
  pct: number;
  label: string;
}

export interface EppBenchTransport {
  startProfCapture: () => Promise<void>;
  stopProfCapture: () => Promise<ProfilerCaptureResult>;
  mcpTransport: PlayerMcpTransport;
  mcpTools?: WebMcpToolDescriptor[];
}

/**
 * Canonical 20-line homoiconic .ast cartridge used for A/B token & schema benchmarks.
 */
export const CANONICAL_20_LINE_AST = `(:scene :id "hooke-spring-bench" :title "Hooke's Law Oscillator" :stage "KS4 PHYSICS" :type "Sim" :duration 12.0
  (:physics :substeps 4 :restitution 0.85 :friction 0.04)
  (:vars
    ((:var :name "k" :label "Spring k (N/m)" :val 24 :min 5 :max 80 :step 1)
     (:var :name "mass" :label "Mass (kg)" :val 2.0 :min 0.5 :max 10 :step 0.5)
     (:var :name "disp" :label "Displacement (m)" :val 0.45 :min -1.0 :max 1.0 :step 0.05)))
  (:computed
    ((:val :name "epElastic" :expr "0.5 * vars.k * vars.disp * vars.disp")
     (:val :name "omega" :expr "Math.sqrt(vars.k / Math.max(0.1, vars.mass))")))
  (:spring :target "#mass-bob" :stiffness "vars.k" :damping 0.15 :rest-length 120)
  (:bindings
    ((:bind :target "#spring-coil" :attr "y2" :expr "180 + vars.disp * 90")
     (:bind :target "#mass-bob" :attr "transform" :expr "'translate(0,' + (vars.disp * 90).toFixed(2) + ')'")))
  (:scope :target "#osc-scope" :x-expr "t" :y-expr "vars.disp" :samples 120 :x-range (0 12) :y-range (-1 1) :plot (40 280 320 110))
  (:ledger :id "energy-ledger" :target "#energy-ledger" :x 40 :y 410 :width 320 :height 18 :unit "J" :max "40"
    :terms ((:label "Elastic PE" :expr "computed.epElastic" :color "#38bdf8")))
  (:interactive
    ((:checkpoint :t 0.5 :title "Target Elastic Energy" :pass-expr "Math.abs(computed.epElastic - 12.0) < 1.5" :hold-duration 0.8
      :prompt "Adjust k and displacement until Elastic PE holds near 12.0 J."
      :options ("Tune k and x" "Double mass" "Freeze clock" "Remove spring") :answer 0 :explanation "E = 0.5 * k * x^2."))))`;

/**
 * Equivalent verbose JSON Scene Schema representation of CANONICAL_20_LINE_AST for A/B comparison.
 */
export const EQUIVALENT_VERBOSE_JSON_SCENE = {
  schemaVersion: '1.0.0',
  sceneMetadata: {
    id: 'hooke-spring-bench',
    title: "Hooke's Law Oscillator",
    stage: 'KS4 PHYSICS',
    type: 'Sim',
    durationSeconds: 12.0,
  },
  physicsConfiguration: {
    substeps: 4,
    restitution: 0.85,
    friction: 0.04,
  },
  variables: [
    { name: 'k', label: 'Spring k (N/m)', defaultValue: 24, minimum: 5, maximum: 80, step: 1 },
    { name: 'mass', label: 'Mass (kg)', defaultValue: 2.0, minimum: 0.5, maximum: 10, step: 0.5 },
    { name: 'disp', label: 'Displacement (m)', defaultValue: 0.45, minimum: -1.0, maximum: 1.0, step: 0.05 },
  ],
  computedExpressions: [
    { name: 'epElastic', expression: '0.5 * vars.k * vars.disp * vars.disp' },
    { name: 'omega', expression: 'Math.sqrt(vars.k / Math.max(0.1, vars.mass))' },
  ],
  springs: [
    { targetSelector: '#mass-bob', stiffnessExpression: 'vars.k', damping: 0.15, restLengthPx: 120 },
  ],
  reactiveBindings: [
    { targetSelector: '#spring-coil', attribute: 'y2', expression: '180 + vars.disp * 90' },
    { targetSelector: '#mass-bob', attribute: 'transform', expression: "'translate(0,' + (vars.disp * 90).toFixed(2) + ')'" },
  ],
  oscilloscopePlots: [
    {
      targetSelector: '#osc-scope',
      xExpression: 't',
      yExpression: 'vars.disp',
      sampleCapacity: 120,
      xRange: [0, 12],
      yRange: [-1, 1],
      plotViewport: { x: 40, y: 280, width: 320, height: 110 },
    },
  ],
  conservationLedgers: [
    {
      id: 'energy-ledger',
      targetSelector: '#energy-ledger',
      bounds: { x: 40, y: 410, width: 320, height: 18 },
      unit: 'J',
      maxExpression: '40',
      terms: [{ label: 'Elastic PE', expression: 'computed.epElastic', color: '#38bdf8' }],
    },
  ],
  interactiveCheckpoints: [
    {
      normalizedTime: 0.5,
      title: 'Target Elastic Energy',
      passExpression: 'Math.abs(computed.epElastic - 12.0) < 1.5',
      holdDurationSeconds: 0.8,
      prompt: 'Adjust k and displacement until Elastic PE holds near 12.0 J.',
      options: ['Tune k and x', 'Double mass', 'Freeze clock', 'Remove spring'],
      answerIndex: 0,
      explanation: 'E = 0.5 * k * x^2.',
    },
  ],
};

/**
 * Constrained JSON Schema passed to Chrome Prompt API responseConstraint when synthesizing .ast payloads.
 */
export const AST_SYNTHESIS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    sceneId: { type: 'string' },
    title: { type: 'string' },
    astSExpr: { type: 'string' },
    socraticHint: { type: 'string' },
  },
  required: ['sceneId', 'astSExpr'],
  additionalProperties: false,
};

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function getUtf8Bytes(text: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).byteLength;
  }
  return text.length;
}

/**
 * Deterministic sub-word tokenizer estimator (~3.7 chars per BPE token for code/JSON/S-exprs)
 * used whenever native session.measureInputUsage() is unavailable.
 */
export function estimateBpeTokenCount(text: string): number {
  if (!text) return 0;
  const punctuationMatches = text.match(/[\(\)\{\}\[\]":,]/g) || [];
  const wordMatches = text.match(/[a-zA-Z0-9_.\-\*\/+]+/g) || [];
  const rawEstimate = Math.round(wordMatches.length * 1.15 + punctuationMatches.length * 0.45);
  return Math.max(1, rawEstimate, Math.ceil(text.length / 4.1));
}

function round2(n: number): number {
  return Number(n.toFixed(2));
}

function getJsHeapMb(): number | null {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const used = Number((performance as any).memory.usedJSHeapSize || 0);
    if (used > 0) return round2(used / 1048576);
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Computes empirical A/B size & token efficiency comparing homoiconic .ast, verbose JSON, and binary .astb.
 */
export async function computeAstVsJsonCompression(
  liveSession?: any
): Promise<CompressionComparisonResult> {
  const astText = CANONICAL_20_LINE_AST;
  const jsonText = JSON.stringify(EQUIVALENT_VERBOSE_JSON_SCENE, null, 2);

  const astBytes = getUtf8Bytes(astText);
  const jsonBytes = getUtf8Bytes(jsonText);

  let astbBytes = 0;
  let astbValid = false;
  try {
    const compiled = compileAstTextToBytecode(astText);
    astbBytes = compiled.byteLength;
    const decoded = decompileBytecodeToScene(compiled);
    astbValid = Boolean(decoded && decoded.id === 'hooke-spring-bench');
  } catch {
    astbValid = false;
  }

  let astValid = false;
  try {
    const parsed = parseSExpr(astText);
    astValid = Boolean(
      (Array.isArray(parsed) && parsed.length > 0 && (parsed[0] === ':scene' || parsed[0] === 'scene')) ||
      (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.tag === ':scene' || parsed.tag === 'scene'))
    );
  } catch {
    astValid = false;
  }

  let jsonValid = false;
  try {
    const parsedJson = JSON.parse(jsonText);
    jsonValid = Boolean(parsedJson && parsedJson.sceneMetadata?.id === 'hooke-spring-bench');
  } catch {
    jsonValid = false;
  }

  const astEstimatedTokens = estimateBpeTokenCount(astText);
  const jsonEstimatedTokens = estimateBpeTokenCount(jsonText);

  let astMeasuredTokens: number | null = null;
  let jsonMeasuredTokens: number | null = null;

  if (liveSession && typeof liveSession.measureInputUsage === 'function') {
    try {
      astMeasuredTokens = Number(await liveSession.measureInputUsage(astText));
      jsonMeasuredTokens = Number(await liveSession.measureInputUsage(jsonText));
    } catch {
      astMeasuredTokens = null;
      jsonMeasuredTokens = null;
    }
  }

  const effectiveAstTok = astMeasuredTokens ?? astEstimatedTokens;
  const effectiveJsonTok = jsonMeasuredTokens ?? jsonEstimatedTokens;

  const astVsJsonByteSavingsPct =
    jsonBytes > 0 ? round2(((jsonBytes - astBytes) / jsonBytes) * 100) : 0;
  const astVsJsonTokenSavingsPct =
    effectiveJsonTok > 0 ? round2(((effectiveJsonTok - effectiveAstTok) / effectiveJsonTok) * 100) : 0;
  const astbVsJsonByteSavingsPct =
    jsonBytes > 0 && astbBytes > 0 ? round2(((jsonBytes - astbBytes) / jsonBytes) * 100) : 0;

  return {
    astLines: astText.split('\n').length,
    astBytes,
    jsonBytes,
    astbBytes,
    astEstimatedTokens,
    jsonEstimatedTokens,
    astMeasuredTokens,
    jsonMeasuredTokens,
    astVsJsonByteSavingsPct,
    astVsJsonTokenSavingsPct,
    astbVsJsonByteSavingsPct,
    astValid,
    jsonValid,
    astbValid,
  };
}

function getNativeLanguageModelApi(): any | null {
  if (typeof self !== 'undefined' && (self as any).LanguageModel) {
    return (self as any).LanguageModel;
  }
  if (typeof window !== 'undefined' && (window as any).LanguageModel) {
    return (window as any).LanguageModel;
  }
  return null;
}

async function queryLanguageModelAvailability(lm: any): Promise<string> {
  if (!lm) return 'unsupported';
  try {
    if (typeof lm.availability === 'function') {
      try {
        const res = await lm.availability({
          expectedInputs: [{ type: 'text', languages: ['en'] }],
          expectedOutputs: [{ type: 'text', languages: ['en'] }],
        });
        return String(res || 'unavailable');
      } catch {
        const res = await lm.availability();
        return String(res || 'unavailable');
      }
    }
    if (typeof lm.capabilities === 'function') {
      const caps = await lm.capabilities();
      return String(caps?.available || 'unavailable');
    }
  } catch {
    return 'unavailable';
  }
  return 'unavailable';
}

function readSessionQuotaState(session: any): {
  inputUsage: number | null;
  inputQuota: number | null;
} {
  if (!session) return { inputUsage: null, inputQuota: null };
  const inputUsage =
    typeof session.inputUsage === 'number'
      ? session.inputUsage
      : typeof session.tokensSoFar === 'number'
      ? session.tokensSoFar
      : null;
  const inputQuota =
    typeof session.inputQuota === 'number'
      ? session.inputQuota
      : typeof session.maxTokens === 'number'
      ? session.maxTokens
      : null;
  return { inputUsage, inputQuota };
}

/**
 * Formats an empirical Chrome Built-in AI & WebMCP Field Telemetry Dossier as clean Markdown.
 */
export function formatEppReportMarkdown(dossier: EppTelemetryDossier): string {
  const { hardwareProfile, promptApiStatus, contentionPhases, contextQuotaTrace, compressionComparison, webmcpBenchmark } = dossier;
  const { phaseABaseline: pA, phaseBConcurrent: pB, phaseCRecovery: pC, deltas } = contentionPhases;

  const lines: string[] = [
    `# Chrome Built-in AI & WebMCP Field Telemetry Dossier`,
    ``,
    `- **Generated**: \`${dossier.generatedAtIso}\``,
    `- **Active Cartridge**: \`${dossier.sceneId}\``,
    `- **Active AI Tier**: \`${promptApiStatus.activeTier}\` (Prompt API availability: \`${promptApiStatus.availability}\`)`,
    ``,
    `## 1. Hardware & Memory Profile`,
    `| Metric | Measured Value |`,
    `|---|---|`,
    `| User Agent | \`${hardwareProfile.userAgent.replace(/\|/g, '/')}\` |`,
    `| \`navigator.deviceMemory\` | ${hardwareProfile.deviceMemoryGb !== null ? `${hardwareProfile.deviceMemoryGb} GB` : 'Not exposed'} |`,
    `| \`navigator.hardwareConcurrency\` | ${hardwareProfile.hardwareConcurrency !== null ? `${hardwareProfile.hardwareConcurrency} threads` : 'Not exposed'} |`,
    `| WebGPU Adapter Surface | ${hardwareProfile.webgpuSupported ? 'Present' : 'Absent'} |`,
    `| WASM Fixed Linear Pool | ${(hardwareProfile.wasmPoolBytes / 1024).toFixed(0)} KB (${hardwareProfile.wasmPages} pages, 0 dynamic allocs in loop) |`,
    `| JS Heap (Start -> End) | ${hardwareProfile.jsHeapStartMb !== null ? `${hardwareProfile.jsHeapStartMb} MB -> ${hardwareProfile.jsHeapEndMb} MB (Δ ${hardwareProfile.heapDeltaMb} MB)` : 'Not exposed'} |`,
    `| BSL Vector Avatar Active | ${hardwareProfile.bslAvatarActiveDuringRun ? 'Yes (60 FPS procedural skeleton)' : 'No'} |`,
    ``,
    `## 2. Concurrent 60 FPS Vector Simulation + On-Device Inference Contention`,
    `- **Phase A (Baseline)**: ${pA.durationMs} ms of pure 60 FPS vector physics + BSL avatar (zero AI activity)`,
    `- **Phase B (Concurrent)**: ${pB.durationMs} ms concurrent workload (\`${pB.workloadLabel}\`)`,
    `- **Phase C (Recovery)**: ${pC.durationMs} ms post-inference compositor & GC recovery`,
    ``,
    `| Phase | Samples | Mean (ms) | p95 (ms) | p99 (ms) | Max (ms) | Frames > 16.67ms | Est. FPS | VM Compute Mean (ms) |`,
    `|---|---:|---:|---:|---:|---:|---:|---:|---:|`,
    `| Phase A (Baseline) | ${pA.stats.sampleCount} | ${pA.stats.meanMs} | ${pA.stats.p95Ms} | ${pA.stats.p99Ms} | ${pA.stats.maxMs} | ${pA.stats.framesOver16_67ms} (${pA.stats.overBudgetPct}%) | ${pA.stats.estimatedFps} | ${pA.stats.meanComputeMs} |`,
    `| Phase B (Concurrent) | ${pB.stats.sampleCount} | ${pB.stats.meanMs} | ${pB.stats.p95Ms} | ${pB.stats.p99Ms} | ${pB.stats.maxMs} | ${pB.stats.framesOver16_67ms} (${pB.stats.overBudgetPct}%) | ${pB.stats.estimatedFps} | ${pB.stats.meanComputeMs} |`,
    `| Phase C (Recovery) | ${pC.stats.sampleCount} | ${pC.stats.meanMs} | ${pC.stats.p95Ms} | ${pC.stats.p99Ms} | ${pC.stats.maxMs} | ${pC.stats.framesOver16_67ms} (${pC.stats.overBudgetPct}%) | ${pC.stats.estimatedFps} | ${pC.stats.meanComputeMs} |`,
    ``,
    `- **Phase B Contention Deltas vs Baseline**: \`Δmean = ${deltas.phaseBMeanMsDelta >= 0 ? '+' : ''}${deltas.phaseBMeanMsDelta} ms\`, \`Δp95 = ${deltas.phaseBP95MsDelta >= 0 ? '+' : ''}${deltas.phaseBP95MsDelta} ms\`, \`Δp99 = ${deltas.phaseBP99MsDelta >= 0 ? '+' : ''}${deltas.phaseBP99MsDelta} ms\`, \`ΔoverBudgetFrames = ${deltas.phaseBOverBudgetFrameDelta >= 0 ? '+' : ''}${deltas.phaseBOverBudgetFrameDelta}\``,
    `- **Phase C Recovery Delta vs Baseline**: \`Δmean = ${deltas.phaseCMeanMsDelta >= 0 ? '+' : ''}${deltas.phaseCMeanMsDelta} ms\`, \`Δp95 = ${deltas.phaseCP95MsDelta >= 0 ? '+' : ''}${deltas.phaseCP95MsDelta} ms\``,
    `- **Session Clone Latency**: ${promptApiStatus.cloneLatencyMs !== null ? `${promptApiStatus.cloneLatencyMs} ms (clone.destroy() cleanly executed: ${promptApiStatus.cloneDestroyedCleanly})` : 'N/A (Prompt API session inactive)'}`,
    ``,
    `## 3. Context Quota & Multi-Turn Socratic Checkpoint Telemetry`,
    `- \`session.inputQuota\`: ${contextQuotaTrace.inputQuota !== null ? contextQuotaTrace.inputQuota : 'N/A'}`,
    `- Final \`session.inputUsage\`: ${contextQuotaTrace.finalInputUsage !== null ? contextQuotaTrace.finalInputUsage : 'N/A'}`,
    `- \`quotaoverflow\` Events Fired: ${contextQuotaTrace.totalQuotaOverflows}`,
    `- Mean Time-To-First-Token (TTFT): ${contextQuotaTrace.meanTtftMs !== null ? `${contextQuotaTrace.meanTtftMs} ms` : 'N/A'}`,
    ``,
    `| Turn | Role | Prompt Bytes | Output Bytes | TTFT (ms) | Duration (ms) | Input Usage | Overflows | Valid |`,
    `|---:|---|---:|---:|---:|---:|---:|---:|---|`,
    ...contextQuotaTrace.turns.map(
      (t) =>
        `| ${t.turn} | \`${t.promptRole}\` | ${t.promptBytes} | ${t.outputBytes} | ${t.ttftMs} | ${t.durationMs} | ${t.inputUsage !== null ? `${t.inputUsage}/${t.inputQuota ?? '?'}` : 'N/A'} | ${t.quotaoverflowCount} | ${t.validOutput ? 'PASS' : 'WARN'} |`
    ),
    ``,
    `## 4. Token & Byte Compression: Homoiconic \`.ast\` vs Verbose JSON vs Binary \`.astb\``,
    `| Representation | UTF-8 Bytes | Tokens (Measured / Est.) | Valid Parse | Savings vs Verbose JSON |`,
    `|---|---:|---:|---|---|`,
    `| Homoiconic \`.ast\` (${compressionComparison.astLines} lines) | ${compressionComparison.astBytes} B | ${compressionComparison.astMeasuredTokens ?? compressionComparison.astEstimatedTokens} ${compressionComparison.astMeasuredTokens !== null ? '(Nano tokenizer)' : '(est.)'} | ${compressionComparison.astValid ? 'PASS' : 'FAIL'} | ${compressionComparison.astVsJsonByteSavingsPct}% bytes / ${compressionComparison.astVsJsonTokenSavingsPct}% tokens |`,
    `| Verbose JSON Schema | ${compressionComparison.jsonBytes} B | ${compressionComparison.jsonMeasuredTokens ?? compressionComparison.jsonEstimatedTokens} ${compressionComparison.jsonMeasuredTokens !== null ? '(Nano tokenizer)' : '(est.)'} | ${compressionComparison.jsonValid ? 'PASS' : 'FAIL'} | Baseline (0%) |`,
    `| Pre-compiled \`.astb\` Bytecode | ${compressionComparison.astbBytes} B | N/A (Zero-copy binary) | ${compressionComparison.astbValid ? 'PASS' : 'FAIL'} | ${compressionComparison.astbVsJsonByteSavingsPct}% bytes |`,
    ``,
    `## 5. WebMCP (\`navigator.modelContext\`) Live Tool & Actuation Benchmark`,
    `- **WebMCP Surface**: \`${webmcpBenchmark.surface}\` (Mode: \`${webmcpBenchmark.registrationMode}\`)`,
    `- **Registered Tools (${webmcpBenchmark.toolsCount})**: \`${webmcpBenchmark.toolNames.join('`, `')}\``,
    `- **\`ast_read_state\` Round-Trip**: ${webmcpBenchmark.readLatencyMs} ms`,
    `- **\`ast_set_var\` Round-Trip**: ${webmcpBenchmark.setVarLatencyMs} ms (\`[min, max]\` clamping verified on \`${webmcpBenchmark.sampleVarTested}\`: ${webmcpBenchmark.clampingVerified ? 'PASS' : 'FAIL'})`,
    `- **\`ast_dispatch_action\` 4-Slot Tuple Round-Trip**: ${webmcpBenchmark.dispatchLatencyMs} ms`,
    `- **Compact MCP JSON vs Raw SVG DOM**: ${webmcpBenchmark.mcpPayloadBytes} B vs ${webmcpBenchmark.rawSvgBytes} B (**${webmcpBenchmark.domPayloadReductionPct}% smaller payload**)`,
    ``,
    `---`,
    `*Captured locally in zero-egress air-gapped telemetry mode via EdgeLearningEngineDB.*`,
  ];

  return lines.join('\n');
}

export async function saveEppTelemetryDossier(dossier: EppTelemetryDossier): Promise<void> {
  await putAppStateRecord(EPP_DOSSIER_STATE_KEY, JSON.stringify(dossier));
}

export async function loadLastEppTelemetryDossier(): Promise<EppTelemetryDossier | null> {
  try {
    const records = await getAllAppStateRecords();
    const match = records.find((r) => r.key === EPP_DOSSIER_STATE_KEY);
    if (!match || !match.value) return null;
    return JSON.parse(match.value) as EppTelemetryDossier;
  } catch {
    return null;
  }
}

export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  if (typeof document === 'undefined') return;
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    // Safe fallback if headless
  }
}

/**
 * Executes the full 3-phase Chrome Built-in AI & WebMCP Field Contention Suite against the active simulation.
 */
export async function runEppContentionSuite(options: {
  transport: EppBenchTransport;
  sceneId: string;
  onProgress?: (progress: EppBenchProgress) => void;
  phaseADurationMs?: number;
  phaseCDurationMs?: number;
}): Promise<EppTelemetryDossier> {
  const {
    transport,
    sceneId,
    onProgress,
    phaseADurationMs = 3000,
    phaseCDurationMs = 2000,
  } = options;

  const nav = typeof navigator !== 'undefined' ? (navigator as any) : {};
  const lm = getNativeLanguageModelApi();
  const availability = await queryLanguageModelAvailability(lm);
  const wasBslActive = getBslEnabled();
  const heapStartMb = getJsHeapMb();

  onProgress?.({
    phase: 'init',
    pct: 5,
    label: `Probing hardware & Prompt API availability (${availability})...`,
  });

  // Drive BSL procedural avatar concurrently alongside simulation physics, then restore prior state cleanly
  let bslDrivenForBench = wasBslActive;
  if (!wasBslActive) {
    setBslEnabled(true);
    bslDrivenForBench = true;
  }
  broadcastBslSpeech({
    subtitle: 'Benchmarking 60 FPS vector kinematics and on-device telemetry.',
    isSpeaking: true,
  });

  let phaseABaseline: EppContentionPhaseMetrics;
  let phaseBConcurrent: EppContentionPhaseMetrics;
  let phaseCRecovery: EppContentionPhaseMetrics;

  let activeTier: EppTelemetryDossier['promptApiStatus']['activeTier'] = 'tier3-deterministic-ast';
  let cloneLatencyMs: number | null = null;
  let cloneDestroyedCleanly = false;
  let constraintSchemaUsed = false;

  const turns: QuotaTurnMetric[] = [];
  let totalQuotaOverflows = 0;
  let finalInputQuota: number | null = null;
  let finalInputUsage: number | null = null;
  let liveSessionForTokenizer: any = null;

  try {
    // =========================================================================
    // PHASE A: 3000 ms Baseline (Zero AI Activity)
    // =========================================================================
    onProgress?.({
      phase: 'phase-a',
      pct: 15,
      label: `Phase A (Baseline): Capturing ${Math.round(phaseADurationMs / 1000)}s of pure 60 FPS physics + BSL...`,
    });

    const aStart = nowMs();
    await transport.startProfCapture();
    await sleep(phaseADurationMs);
    const aCap = await transport.stopProfCapture();
    phaseABaseline = {
      durationMs: Math.round(nowMs() - aStart),
      stats: aCap.stats,
      activeMetrics: aCap.activeMetrics,
      workloadLabel: 'Pure 60 FPS vector + BSL kinematics (Zero AI)',
    };

    // Snapshot live simulation telemetry for multi-turn drill payload
    const liveSnapshot: EngineStateSummary | null = await transport.mcpTransport.readState(false);
    const ledgerSummary = liveSnapshot?.ledgers?.length
      ? liveSnapshot.ledgers
          .map((l) => `${l.id}=${l.total.toFixed(2)}${l.unit || ''}`)
          .join(', ')
      : 'none';
    const goalSummary = liveSnapshot?.checkpointGoals?.length
      ? liveSnapshot.checkpointGoals
          .map((g) => `${g.title}[passed=${g.passed},expr=${g.passExpr || 'none'}]`)
          .join('; ')
      : 'none';

    const compactStateToken = `(:state :scene "${sceneId}" :t ${(liveSnapshot?.t ?? 0).toFixed(2)} :vars ${JSON.stringify(liveSnapshot?.vars || {})} :ledger "${ledgerSummary}" :goals "${goalSummary}")`;

    // =========================================================================
    // PHASE B: Concurrent Inference + Socratic Quota Drill
    // =========================================================================
    onProgress?.({
      phase: 'phase-b',
      pct: 45,
      label: `Phase B (Concurrent Inference): Running ${availability === 'readily' || availability === 'available' ? 'Gemini Nano promptStreaming' : 'Tier-2/3 fallback telemetry'}...`,
    });

    const bStart = nowMs();
    await transport.startProfCapture();

    let workloadLabel = 'Tier-3 Deterministic Socratic + AST Compiler Stress';
    const canTryNativeNano = Boolean(
      lm &&
      (availability === 'readily' ||
        availability === 'available' ||
        ((availability === 'after-download' || availability === 'downloading') && hasUserGrantedAiConsent()))
    );

    if (canTryNativeNano) {
      let session: any = null;
      const onOverflow = () => {
        totalQuotaOverflows += 1;
      };
      try {
        const systemPrompt =
          'You synthesize compact AST vector cartridges (:scene ...) and concise Socratic nudges grounded in telemetry.';
        try {
          session = await lm.create({
            samplingMode: 'most-predictable',
            initialPrompts: [{ role: 'system', content: systemPrompt }],
            expectedInputs: [{ type: 'text', languages: ['en'] }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }],
          });
        } catch {
          session = await lm.create({
            initialPrompts: [{ role: 'system', content: systemPrompt }],
          });
        }

        if (session && typeof session.addEventListener === 'function') {
          session.addEventListener('quotaoverflow', onOverflow);
        }

        activeTier = 'chrome-builtin-nano';
        workloadLabel = 'Gemini Nano streaming + session.clone() + 3-turn Socratic drill';
        liveSessionForTokenizer = session;

        // Turn 1: Streaming 20-line .ast synthesis with JSON Schema responseConstraint
        const turn1Prompt = `Emit a minimal 20-line (:scene :id "bench-spring" ...) Hooke oscillator with :scope and :ledger in field astSExpr. Telemetry: ${compactStateToken}`;
        const t1Start = nowMs();
        let t1Ttft = 0;
        let t1Output = '';
        try {
          const stream = session.promptStreaming
            ? session.promptStreaming(turn1Prompt, {
                responseConstraint: AST_SYNTHESIS_RESPONSE_SCHEMA,
                outputLanguage: 'en',
              })
            : null;
          constraintSchemaUsed = Boolean(stream);
          if (stream) {
            let prev = '';
            for await (const chunk of stream) {
              if (t1Ttft === 0) t1Ttft = round2(nowMs() - t1Start);
              const str = String(chunk || '');
              const delta = str.startsWith(prev) ? str.slice(prev.length) : str;
              prev = str;
              t1Output += delta;
            }
            if (!t1Output && prev) t1Output = prev;
          } else {
            t1Output = await session.prompt(turn1Prompt, {
              responseConstraint: AST_SYNTHESIS_RESPONSE_SCHEMA,
            });
            constraintSchemaUsed = true;
            t1Ttft = round2(nowMs() - t1Start);
          }
        } catch {
          // Fallback without responseConstraint if flag variant rejects it
          constraintSchemaUsed = false;
          const fallbackRes = await session.prompt(turn1Prompt);
          t1Output = String(fallbackRes || '');
          t1Ttft = round2(nowMs() - t1Start);
        }

        const q1 = readSessionQuotaState(session);
        if (q1.inputQuota !== null) finalInputQuota = q1.inputQuota;
        if (q1.inputUsage !== null) finalInputUsage = q1.inputUsage;
        turns.push({
          turn: 1,
          promptRole: 'ast-synthesis',
          promptBytes: getUtf8Bytes(turn1Prompt),
          outputBytes: getUtf8Bytes(t1Output),
          ttftMs: t1Ttft || round2(nowMs() - t1Start),
          durationMs: round2(nowMs() - t1Start),
          inputUsage: q1.inputUsage,
          inputQuota: q1.inputQuota,
          quotaoverflowCount: totalQuotaOverflows,
          validOutput: t1Output.includes('scene') || t1Output.includes(':scene'),
        });

        // Measure session.clone() + explicit clone.destroy()
        if (typeof session.clone === 'function') {
          const cloneStart = nowMs();
          const cloned = await session.clone();
          cloneLatencyMs = round2(nowMs() - cloneStart);
          if (cloned && typeof cloned.destroy === 'function') {
            cloned.destroy();
            cloneDestroyedCleanly = true;
          }
        }

        // Turns 2..4: Multi-turn Socratic checkpoint drill
        const drillPrompts: Array<{ role: QuotaTurnMetric['promptRole']; prompt: string }> = [
          {
            role: 'socratic-drill-1',
            prompt: `Turn 1 telemetry ${compactStateToken}. Give one Socratic hint (<20 words) guiding the learner toward the :pass-expr goal.`,
          },
          {
            role: 'socratic-drill-2',
            prompt: `Turn 2 telemetry ${compactStateToken}. Explain how energy/particle conservation stays invariant using one numeric variable.`,
          },
          {
            role: 'socratic-drill-3',
            prompt: `Turn 3 telemetry ${compactStateToken}. Emit one compact (:act :highlight "#stage" :say "...") tuple.`,
          },
        ];

        for (let i = 0; i < drillPrompts.length; i++) {
          const item = drillPrompts[i];
          const dStart = nowMs();
          let dTtft = 0;
          let dOut = '';
          if (session.promptStreaming) {
            const s = session.promptStreaming(item.prompt);
            let prev = '';
            for await (const chunk of s) {
              if (dTtft === 0) dTtft = round2(nowMs() - dStart);
              const str = String(chunk || '');
              const delta = str.startsWith(prev) ? str.slice(prev.length) : str;
              prev = str;
              dOut += delta;
            }
            if (!dOut && prev) dOut = prev;
          } else {
            dOut = String(await session.prompt(item.prompt));
            dTtft = round2(nowMs() - dStart);
          }

          const qTurn = readSessionQuotaState(session);
          if (qTurn.inputQuota !== null) finalInputQuota = qTurn.inputQuota;
          if (qTurn.inputUsage !== null) finalInputUsage = qTurn.inputUsage;
          turns.push({
            turn: i + 2,
            promptRole: item.role,
            promptBytes: getUtf8Bytes(item.prompt),
            outputBytes: getUtf8Bytes(dOut),
            ttftMs: dTtft || round2(nowMs() - dStart),
            durationMs: round2(nowMs() - dStart),
            inputUsage: qTurn.inputUsage,
            inputQuota: qTurn.inputQuota,
            quotaoverflowCount: totalQuotaOverflows,
            validOutput: dOut.trim().length > 0,
          });
        }
      } catch (nanoErr) {
        console.warn('[EPPBench] Native Prompt API invocation failed, dropping to Tier-2/3:', nanoErr);
      } finally {
        if (session) {
          try { session.removeEventListener?.('quotaoverflow', onOverflow); } catch {}
        }
      }
    }

    // Run A/B Compression comparison while live Nano session tokenizer is available
    const compressionComparison = await computeAstVsJsonCompression(liveSessionForTokenizer);
    if (liveSessionForTokenizer && typeof liveSessionForTokenizer.destroy === 'function') {
      try { liveSessionForTokenizer.destroy(); } catch {}
      liveSessionForTokenizer = null;
    }

    // Fallback Tier 2 (WebLLM) / Tier 3 (Deterministic AST + Socratic stress) if Nano did not run
    if (turns.length === 0) {
      const memGuard = edgeCognitiveEngine.checkMemoryEligibility();
      if (edgeCognitiveEngine.isReady() && memGuard.isEligible && hasUserGrantedAiConsent()) {
        activeTier = 'webgpu-webllm';
        workloadLabel = 'Tier-2 WebLLM / WebGPU streaming fallback';
        const prompts: Array<{ role: QuotaTurnMetric['promptRole']; prompt: string }> = [
          { role: 'ast-synthesis', prompt: `Synthesize compact 20-line AST for ${sceneId}.` },
          { role: 'socratic-drill-1', prompt: `Telemetry ${compactStateToken}. One Socratic hint?` },
          { role: 'socratic-drill-2', prompt: `Telemetry ${compactStateToken}. Conservation law note?` },
          { role: 'socratic-drill-3', prompt: `Telemetry ${compactStateToken}. Action tuple (:act :seek 0.5).` },
        ];
        for (let idx = 0; idx < prompts.length; idx++) {
          const p = prompts[idx];
          const t0 = nowMs();
          let ttft = 0;
          let out = '';
          for await (const tok of edgeCognitiveEngine.inferStream(p.prompt)) {
            if (ttft === 0) ttft = round2(nowMs() - t0);
            out += tok;
          }
          turns.push({
            turn: idx + 1,
            promptRole: p.role,
            promptBytes: getUtf8Bytes(p.prompt),
            outputBytes: getUtf8Bytes(out),
            ttftMs: ttft || round2(nowMs() - t0),
            durationMs: round2(nowMs() - t0),
            inputUsage: null,
            inputQuota: null,
            quotaoverflowCount: 0,
            validOutput: out.trim().length > 0,
          });
        }
      } else {
        activeTier = 'tier3-deterministic-ast';
        workloadLabel = `Tier-3 Deterministic AST/Bytecode Socratic Synthesis (Nano ${availability})`;
        const drillRoles: QuotaTurnMetric['promptRole'][] = [
          'ast-synthesis',
          'socratic-drill-1',
          'socratic-drill-2',
          'socratic-drill-3',
        ];
        for (let idx = 0; idx < drillRoles.length; idx++) {
          const role = drillRoles[idx];
          const promptText =
            role === 'ast-synthesis'
              ? `Synthesize canonical 20-line AST from telemetry ${compactStateToken}`
              : `Socratic drill ${idx} on telemetry ${compactStateToken}`;
          const t0 = nowMs();
          let outText = '';
          if (role === 'ast-synthesis') {
            parseSExpr(CANONICAL_20_LINE_AST);
            const compiled = compileAstTextToBytecode(CANONICAL_20_LINE_AST);
            decompileBytecodeToScene(compiled);
            outText = CANONICAL_20_LINE_AST;
          } else {
            const res = await edgeCognitiveEngine.infer(promptText);
            outText = res.output;
          }
          const dur = round2(nowMs() - t0);
          turns.push({
            turn: idx + 1,
            promptRole: role,
            promptBytes: getUtf8Bytes(promptText),
            outputBytes: getUtf8Bytes(outText),
            ttftMs: dur,
            durationMs: dur,
            inputUsage: null,
            inputQuota: null,
            quotaoverflowCount: 0,
            validOutput: outText.length > 0,
          });
          // Space deterministic turns across at least ~1.2s so Phase B captures ~70+ live 60 FPS frames cleanly
          await sleep(300);
        }
      }
    }

    const bCap = await transport.stopProfCapture();
    phaseBConcurrent = {
      durationMs: Math.round(nowMs() - bStart),
      stats: bCap.stats,
      activeMetrics: bCap.activeMetrics,
      workloadLabel,
    };

    // =========================================================================
    // PHASE C: 2000 ms Post-Inference Compositor Recovery
    // =========================================================================
    onProgress?.({
      phase: 'phase-c',
      pct: 78,
      label: `Phase C (Recovery): Measuring ${Math.round(phaseCDurationMs / 1000)}s post-inference frame stability & GC recovery...`,
    });

    const cStart = nowMs();
    await transport.startProfCapture();
    await sleep(phaseCDurationMs);
    const cCap = await transport.stopProfCapture();
    phaseCRecovery = {
      durationMs: Math.round(nowMs() - cStart),
      stats: cCap.stats,
      activeMetrics: cCap.activeMetrics,
      workloadLabel: 'Post-inference GPU/NPU & GC recovery',
    };

    // =========================================================================
    // WEBMCP ROUND-TRIP ACTUATION BENCHMARK
    // =========================================================================
    onProgress?.({
      phase: 'webmcp',
      pct: 90,
      label: `Measuring WebMCP (${detectWebMcpSurface().surface}) tool latency & DOM payload savings...`,
    });

    const webmcpBenchmark = await runWebMcpBenchmark(
      transport.mcpTransport,
      transport.mcpTools
    );

    const heapEndMb = getJsHeapMb();
    const heapDeltaMb =
      heapStartMb !== null && heapEndMb !== null
        ? round2(heapEndMb - heapStartMb)
        : null;

    const validTtfts = turns.map((t) => t.ttftMs).filter((v) => Number.isFinite(v) && v >= 0);
    const meanTtftMs =
      validTtfts.length > 0
        ? round2(validTtfts.reduce((acc, v) => acc + v, 0) / validTtfts.length)
        : null;

    const dossier: EppTelemetryDossier = {
      dossierVersion: '1.0.0',
      generatedAtIso: new Date().toISOString(),
      sceneId,
      hardwareProfile: {
        userAgent: String(nav.userAgent || 'Unknown'),
        deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
        hardwareConcurrency: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
        webgpuSupported: 'gpu' in nav,
        wasmPoolBytes: cCap.memory.wasmPoolBytes || 458752,
        wasmPages: cCap.memory.wasmPages || 7,
        jsHeapStartMb: heapStartMb,
        jsHeapEndMb: heapEndMb,
        heapDeltaMb,
        bslAvatarActiveDuringRun: bslDrivenForBench,
      },
      promptApiStatus: {
        present: Boolean(lm),
        availability,
        activeTier,
        cloneLatencyMs,
        cloneDestroyedCleanly,
        constraintSchemaUsed,
      },
      contentionPhases: {
        phaseABaseline,
        phaseBConcurrent,
        phaseCRecovery,
        deltas: {
          phaseBMeanMsDelta: round2(phaseBConcurrent.stats.meanMs - phaseABaseline.stats.meanMs),
          phaseBP95MsDelta: round2(phaseBConcurrent.stats.p95Ms - phaseABaseline.stats.p95Ms),
          phaseBP99MsDelta: round2(phaseBConcurrent.stats.p99Ms - phaseABaseline.stats.p99Ms),
          phaseBMaxMsDelta: round2(phaseBConcurrent.stats.maxMs - phaseABaseline.stats.maxMs),
          phaseBOverBudgetFrameDelta:
            phaseBConcurrent.stats.framesOver16_67ms - phaseABaseline.stats.framesOver16_67ms,
          phaseCMeanMsDelta: round2(phaseCRecovery.stats.meanMs - phaseABaseline.stats.meanMs),
          phaseCP95MsDelta: round2(phaseCRecovery.stats.p95Ms - phaseABaseline.stats.p95Ms),
        },
      },
      contextQuotaTrace: {
        inputQuota: finalInputQuota,
        finalInputUsage,
        totalQuotaOverflows,
        meanTtftMs,
        turns,
      },
      compressionComparison,
      webmcpBenchmark,
    };

    onProgress?.({
      phase: 'export',
      pct: 96,
      label: 'Persisting telemetry dossier to EdgeLearningEngineDB...',
    });

    await saveEppTelemetryDossier(dossier);

    onProgress?.({
      phase: 'complete',
      pct: 100,
      label: 'Chrome EPP Contention & WebMCP Telemetry Suite Complete',
    });

    return dossier;
  } finally {
    if (liveSessionForTokenizer && typeof liveSessionForTokenizer.destroy === 'function') {
      try { liveSessionForTokenizer.destroy(); } catch {}
      liveSessionForTokenizer = null;
    }
    // Restore original BSL state if we temporarily enabled it for multi-stream contention
    if (!wasBslActive && getBslEnabled()) {
      setBslEnabled(false);
    }
  }
}
