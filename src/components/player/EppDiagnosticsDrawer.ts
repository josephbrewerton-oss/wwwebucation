// src/components/player/EppDiagnosticsDrawer.ts
/**
 * Hardware, Frame Budget & Chrome Built-in AI / WebMCP Field Telemetry Drawer
 *
 * Air-gapped, local-first instrumentation console for empirical multi-phase
 * 60 FPS GPU/NPU contention, Prompt API quota tracing, AST-vs-JSON compression,
 * and WebMCP live tool actuation benchmarking.
 */

import { getLocalState, setLocalState } from '../../services/localStateStore';
import {
  computeAstVsJsonCompression,
  formatEppReportMarkdown,
  loadLastEppTelemetryDossier,
  runEppContentionSuite,
  triggerFileDownload,
  type CompressionComparisonResult,
  type EppBenchProgress,
  type EppBenchTransport,
  type EppTelemetryDossier,
} from '../../engine/eppContentionBench';
import {
  detectWebMcpSurface,
  runWebMcpBenchmark,
  type WebMcpBenchmarkResult,
  type WebMcpRegistrationHandle,
} from '../../engine/webmcpBridge';

export interface EppDiagnosticsDrawerProps {
  onClose: () => void;
  presetId: string;
  presetLabel: string;
  presetType: string;
  postToPlayer: (msg: Record<string, any>) => void;
  benchTransport: EppBenchTransport;
  webMcpHandle: WebMcpRegistrationHandle | null;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function probeAvailabilityLabel(): Promise<string> {
  const scope: any = typeof self !== 'undefined' ? self : window;
  const lm = scope?.LanguageModel || (window as any)?.LanguageModel;
  if (!lm) return 'unavailable (API absent)';
  try {
    if (typeof lm.availability === 'function') {
      try {
        const res = await lm.availability({
          expectedInputs: [{ type: 'text', languages: ['en'] }],
          expectedOutputs: [{ type: 'text', languages: ['en'] }],
        });
        return String(res || 'unavailable');
      } catch {
        return String((await lm.availability()) || 'unavailable');
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

function formatSignedDelta(val: number, unit = 'ms'): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)} ${unit}`;
}

export function renderEppDiagnosticsDrawer(props: EppDiagnosticsDrawerProps): HTMLElement {
  const {
    onClose,
    presetId,
    presetLabel,
    presetType,
    postToPlayer,
    benchTransport,
    webMcpHandle,
  } = props;

  const drawer = document.createElement('div');
  drawer.className = 'ast-diagnostics-drawer';
  drawer.style.cssText =
    'padding: 1rem 1.25rem; background: #07090e; color: #e2e8f0; font-size: 0.8rem; border-bottom: 1px solid #1e293b;';

  let isRunning = false;
  let progressState: EppBenchProgress | null = null;
  let activeDossier: EppTelemetryDossier | null = null;
  let quickCompression: CompressionComparisonResult | null = null;
  let quickWebMcp: WebMcpBenchmarkResult | null = null;
  let lmAvailability = 'probing...';
  let statusNotice = '';

  function getMemorySummary(): string {
    const parts = ['448 KB WASM SoA'];
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const usedMb = ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(1);
      parts.push(`JS Heap ${usedMb} MB`);
    }
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : {};
    if (typeof nav.deviceMemory === 'number') parts.push(`${nav.deviceMemory} GB RAM`);
    if (typeof nav.hardwareConcurrency === 'number') parts.push(`${nav.hardwareConcurrency}T CPU`);
    return parts.join(' · ');
  }

  function renderBody() {
    const perfHud = getLocalState('app_perf_hud_enabled') === 'true';
    const verbosity = getLocalState('app_hud_verbosity') || 'minimal';
    const budgetAlert = getLocalState('app_frame_budget_alert') === 'true';
    const targetFps = getLocalState('app_target_fps') || 'adaptive';
    const mcpSurface = detectWebMcpSurface();
    const isSim = presetType === 'Sim';

    const comp = activeDossier?.compressionComparison || quickCompression;
    const mcpRes = activeDossier?.webmcpBenchmark || quickWebMcp;

    const phases = activeDossier?.contentionPhases;
    const quota = activeDossier?.contextQuotaTrace;

    drawer.innerHTML = `
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid #1e293b;">
        <div style="min-width:0;">
          <div style="font-size:0.68rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#64748b; font-family:ui-monospace, monospace;">
            Lumina Telemetry &amp; Chrome EPP Field Test Bed · ${isSim ? ':Sim' : ':' + escapeHtml(presetType)} · ${escapeHtml(presetId)}
          </div>
          <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-top:2px;">
            <strong style="font-size:0.96rem; color:#f8fafc; letter-spacing:-0.01em;">
              Hardware Budget, On-Device AI Contention &amp; WebMCP Dossier
            </strong>
            <span style="font-size:0.74rem; color:#94a3b8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
              ${escapeHtml(getMemorySummary())}
            </span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
          <button
            type="button"
            id="diag-btn-run-epp"
            ${isRunning ? 'disabled' : ''}
            style="padding:6px 12px; border-radius:6px; background:${isRunning ? '#1e293b' : '#0284c7'}; color:#ffffff; border:1px solid ${isRunning ? '#334155' : '#38bdf8'}; font-size:0.76rem; font-weight:700; cursor:${isRunning ? 'wait' : 'pointer'}; font-family:ui-sans-serif, system-ui, sans-serif;">
            ${isRunning ? `Running ${progressState?.pct ?? 0}%...` : 'Run Chrome EPP Contention Suite & Export Report'}
          </button>
          <button
            type="button"
            id="diag-btn-close"
            style="background:transparent; border:1px solid #1e293b; border-radius:6px; color:#94a3b8; font-size:0.85rem; cursor:pointer; padding:4px 9px;"
            title="Close Diagnostics">
            ✕
          </button>
        </div>
      </div>

      ${progressState && isRunning ? `
        <div style="background:#0b1120; border:1px solid #0284c7; border-radius:6px; padding:10px 12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:0.74rem; margin-bottom:6px; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
            <span style="color:#38bdf8; font-weight:700;">${escapeHtml(progressState.label)}</span>
            <span style="color:#f8fafc;">${progressState.pct}%</span>
          </div>
          <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
            <div style="width:${progressState.pct}%; height:100%; background:#38bdf8; transition:width 0.2s ease;"></div>
          </div>
        </div>
      ` : ''}

      ${statusNotice ? `
        <div style="background:#0b1120; border:1px solid #1e293b; border-left:3px solid #34d399; padding:7px 10px; margin-bottom:12px; font-size:0.74rem; color:#cbd5e1; font-family:ui-monospace, monospace;">
          ${escapeHtml(statusNotice)}
        </div>
      ` : ''}

      <!-- Primary Capability Strip -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:12px;">
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
            Chrome Prompt API (LanguageModel)
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:${lmAvailability === 'readily' || lmAvailability === 'available' ? '#34d399' : '#fbbf24'}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${escapeHtml(lmAvailability)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">
            Tier: ${escapeHtml(activeDossier?.promptApiStatus.activeTier || 'auto (Nano -> WebLLM -> Tier 3)')}
          </div>
        </div>

        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
              WebMCP Tool Surface
            </span>
            <button type="button" id="diag-btn-test-mcp" style="background:#111827; border:1px solid #334155; color:#38bdf8; border-radius:4px; padding:2px 7px; font-size:0.68rem; font-weight:700; cursor:pointer;">
              Ping Tools
            </button>
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:${mcpSurface.surface !== 'unavailable' ? '#34d399' : '#94a3b8'}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${escapeHtml(mcpSurface.surface)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px; font-family:ui-monospace, monospace;">
            ${webMcpHandle?.tools?.length || 3} tools (${webMcpHandle?.registered ? escapeHtml(webMcpHandle.mode) : 'local harness'})
          </div>
        </div>

        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
            AST vs JSON Compression
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:#38bdf8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; margin-top:3px;">
            ${comp ? `${comp.astVsJsonByteSavingsPct}% bytes · ${comp.astVsJsonTokenSavingsPct}% tokens` : 'Computing...'}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
            ${comp ? `.ast ${comp.astBytes}B · .astb ${comp.astbBytes}B · JSON ${comp.jsonBytes}B` : escapeHtml(presetLabel)}
          </div>
        </div>
      </div>

      <!-- Canvas Vector HUD & Frame Budget Controls (Preserved Existing Controls) -->
      <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:0.76rem; font-weight:600; color:#cbd5e1;">
            <input type="checkbox" id="diag-toggle-hud" ${perfHud ? 'checked' : ''} style="cursor:pointer; width:15px; height:15px;" />
            <span>Vector Canvas HUD (<strong style="color:${perfHud ? '#38bdf8' : '#64748b'};">${perfHud ? 'ON' : 'OFF'}</strong>)</span>
          </label>

          <div style="display:inline-flex; align-items:center; gap:6px;">
            <label for="diag-select-verbosity" style="font-size:0.72rem; color:#94a3b8; font-weight:600;">Detail:</label>
            <select id="diag-select-verbosity" style="padding:3px 7px; border-radius:4px; background:#07090e; color:#f8fafc; border:1px solid #334155; font-size:0.74rem; cursor:pointer;">
              <option value="minimal" ${verbosity === 'minimal' ? 'selected' : ''}>Minimal (FPS &amp; VM ms)</option>
              <option value="graph" ${verbosity === 'graph' ? 'selected' : ''}>Vector Sparkline</option>
              <option value="full" ${verbosity === 'full' ? 'selected' : ''}>Full Telemetry</option>
            </select>
          </div>

          <div style="display:inline-flex; align-items:center; gap:6px;">
            <label for="diag-select-fps" style="font-size:0.72rem; color:#94a3b8; font-weight:600;">FPS Cap:</label>
            <select id="diag-select-fps" style="padding:3px 7px; border-radius:4px; background:#07090e; color:#f8fafc; border:1px solid #334155; font-size:0.74rem; cursor:pointer;">
              <option value="adaptive" ${targetFps === 'adaptive' ? 'selected' : ''}>Adaptive (60-240Hz)</option>
              <option value="120" ${targetFps === '120' ? 'selected' : ''}>120Hz ProMotion</option>
              <option value="60" ${targetFps === '60' ? 'selected' : ''}>Locked 60 FPS</option>
              <option value="30" ${targetFps === '30' ? 'selected' : ''}>Eco 30 FPS</option>
            </select>
          </div>

          <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:0.76rem; font-weight:600; color:#cbd5e1;">
            <input type="checkbox" id="diag-toggle-budget" ${budgetAlert ? 'checked' : ''} style="cursor:pointer; width:15px; height:15px;" />
            <span>16.6ms Alarm (<strong style="color:${budgetAlert ? '#f87171' : '#64748b'};">${budgetAlert ? 'ON' : 'OFF'}</strong>)</span>
          </label>
        </div>

        <button type="button" id="diag-btn-ping" style="padding:4px 9px; border-radius:4px; background:#111827; color:#38bdf8; border:1px solid #334155; font-size:0.72rem; font-weight:700; cursor:pointer;">
          Ping Frame Budget
        </button>
      </div>

      ${phases ? `
        <!-- Empirical 3-Phase Contention Metrics -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
            <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8;">
              3-Phase 60 FPS GPU/NPU Contention Trace
            </span>
            <span style="font-size:0.72rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#38bdf8;">
              ΔMean(B-A): ${formatSignedDelta(phases.deltas.phaseBMeanMsDelta)} · Δp95(B-A): ${formatSignedDelta(phases.deltas.phaseBP95MsDelta)} · ΔMean(C-A): ${formatSignedDelta(phases.deltas.phaseCMeanMsDelta)}
            </span>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
              <thead>
                <tr style="border-bottom:1px solid #1e293b; color:#64748b; text-align:right;">
                  <th style="text-align:left; padding:4px 6px;">Phase</th>
                  <th style="padding:4px 6px;">Samples</th>
                  <th style="padding:4px 6px;">Mean</th>
                  <th style="padding:4px 6px;">p95</th>
                  <th style="padding:4px 6px;">p99</th>
                  <th style="padding:4px 6px;">Max</th>
                  <th style="padding:4px 6px;">&gt;16.67ms</th>
                  <th style="padding:4px 6px;">FPS</th>
                  <th style="padding:4px 6px;">VM ms</th>
                </tr>
              </thead>
              <tbody>
                ${[
                  { name: 'A · Baseline', p: phases.phaseABaseline },
                  { name: 'B · Concurrent', p: phases.phaseBConcurrent },
                  { name: 'C · Recovery', p: phases.phaseCRecovery },
                ].map(({ name, p }) => `
                  <tr style="border-bottom:1px solid #111827; text-align:right; color:#e2e8f0;">
                    <td style="text-align:left; padding:5px 6px; font-weight:700; color:#f8fafc;">${name}</td>
                    <td style="padding:5px 6px;">${p.stats.sampleCount}</td>
                    <td style="padding:5px 6px;">${p.stats.meanMs.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${p.stats.p95Ms.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${p.stats.p99Ms.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${p.stats.maxMs.toFixed(2)}ms</td>
                    <td style="padding:5px 6px; color:${p.stats.framesOver16_67ms > 0 ? '#fbbf24' : '#34d399'};">${p.stats.framesOver16_67ms} (${p.stats.overBudgetPct}%)</td>
                    <td style="padding:5px 6px; color:#38bdf8;">${p.stats.estimatedFps.toFixed(1)}</td>
                    <td style="padding:5px 6px;">${p.stats.meanComputeMs.toFixed(3)}ms</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:10px; margin-bottom:10px;">
        <!-- Quota & Socratic Telemetry Card -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px;">
          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; margin-bottom:6px;">
            Context Quota, TTFT &amp; session.clone()
          </div>
          ${quota ? `
            <div style="font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#cbd5e1; margin-bottom:6px;">
              Quota: ${quota.finalInputUsage ?? 'N/A'} / ${quota.inputQuota ?? 'N/A'} · Overflows: ${quota.totalQuotaOverflows} · Mean TTFT: ${quota.meanTtftMs ?? 'N/A'} ms · Clone: ${activeDossier?.promptApiStatus.cloneLatencyMs !== null && activeDossier?.promptApiStatus.cloneLatencyMs !== undefined ? `${activeDossier.promptApiStatus.cloneLatencyMs} ms` : 'N/A'}
            </div>
            <div style="font-size:0.71rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#94a3b8;">
              ${quota.turns.map((t) => `T${t.turn}(${t.promptRole}): ${t.ttftMs}ms TTFT / ${t.durationMs}ms total · ${t.outputBytes}B`).join('<br/>')}
            </div>
          ` : `
            <div style="font-size:0.74rem; color:#64748b;">
              Run the contention suite to log live <code>inputQuota</code>, <code>quotaoverflow</code>, <code>session.clone()</code>, and per-turn TTFT metrics.
            </div>
          `}
        </div>

        <!-- WebMCP Round-Trip Telemetry Card -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px;">
          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; margin-bottom:6px;">
            WebMCP Actuation &amp; Payload Reduction
          </div>
          ${mcpRes ? `
            <div style="font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#cbd5e1; line-height:1.55;">
              <div>ast_read_state: <strong>${mcpRes.readLatencyMs}ms</strong> · ast_set_var: <strong>${mcpRes.setVarLatencyMs}ms</strong> · ast_dispatch_action: <strong>${mcpRes.dispatchLatencyMs}ms</strong></div>
              <div>Payload: <strong>${mcpRes.mcpPayloadBytes} B</strong> MCP JSON vs <strong>${mcpRes.rawSvgBytes} B</strong> SVG DOM (<strong style="color:#34d399;">${mcpRes.domPayloadReductionPct}% smaller</strong>)</div>
              <div>[min, max] Clamping Guard (<code>${escapeHtml(mcpRes.sampleVarTested || 'none')}</code>): <strong style="color:${mcpRes.clampingVerified ? '#34d399' : '#f87171'};">${mcpRes.clampingVerified ? 'PASS' : 'FAIL'}</strong></div>
            </div>
          ` : `
            <div style="font-size:0.74rem; color:#64748b;">
              Click <strong>Ping Tools</strong> or run the contention suite to measure WebMCP tool round-trip latency and SVG DOM payload savings.
            </div>
          `}
        </div>
      </div>

      <!-- Export Actions Footer -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-top:8px; border-top:1px solid #1e293b;">
        <span style="font-size:0.71rem; color:#64748b; font-family:ui-monospace, monospace;">
          ${activeDossier ? `Last dossier: ${escapeHtml(activeDossier.generatedAtIso)} · Saved in EdgeLearningEngineDB` : 'Zero network egress · Saved locally in EdgeLearningEngineDB'}
        </span>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <button type="button" id="diag-btn-export-md" ${activeDossier ? '' : 'disabled'} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${activeDossier ? '#38bdf8' : '#475569'}; border:1px solid ${activeDossier ? '#0284c7' : '#1e293b'}; font-size:0.72rem; font-weight:700; cursor:${activeDossier ? 'pointer' : 'not-allowed'};">
            Export .md Dossier
          </button>
          <button type="button" id="diag-btn-export-json" ${activeDossier ? '' : 'disabled'} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${activeDossier ? '#34d399' : '#475569'}; border:1px solid ${activeDossier ? '#059669' : '#1e293b'}; font-size:0.72rem; font-weight:700; cursor:${activeDossier ? 'pointer' : 'not-allowed'};">
            Export .json Telemetry
          </button>
          <button type="button" id="diag-btn-copy-md" ${activeDossier ? '' : 'disabled'} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${activeDossier ? '#e2e8f0' : '#475569'}; border:1px solid #334155; font-size:0.72rem; font-weight:700; cursor:${activeDossier ? 'pointer' : 'not-allowed'};">
            Copy Markdown
          </button>
        </div>
      </div>
    `;

    wireEvents();
  }

  function wireEvents() {
    drawer.querySelector('#diag-btn-close')?.addEventListener('click', onClose);

    const toggleHud = drawer.querySelector<HTMLInputElement>('#diag-toggle-hud');
    const selectVerbosity = drawer.querySelector<HTMLSelectElement>('#diag-select-verbosity');
    const selectFps = drawer.querySelector<HTMLSelectElement>('#diag-select-fps');
    const toggleBudget = drawer.querySelector<HTMLInputElement>('#diag-toggle-budget');
    const btnPing = drawer.querySelector<HTMLButtonElement>('#diag-btn-ping');

    const syncHudSettings = () => {
      const hudEnabled = Boolean(toggleHud?.checked);
      const mode = selectVerbosity?.value || 'minimal';
      const budgetEnabled = Boolean(toggleBudget?.checked);
      const fpsChoice = selectFps?.value || 'adaptive';

      setLocalState('app_perf_hud_enabled', String(hudEnabled));
      setLocalState('app_hud_verbosity', mode);
      setLocalState('app_frame_budget_alert', String(budgetEnabled));
      setLocalState('app_target_fps', fpsChoice);

      postToPlayer({
        type: 'SET_PERF_HUD',
        enabled: hudEnabled,
        mode,
        strictAlarm: budgetEnabled,
      });
      postToPlayer({
        type: 'SET_TARGET_FPS',
        fps: fpsChoice === 'adaptive' ? 0 : parseInt(fpsChoice, 10),
      });
      window.dispatchEvent(
        new CustomEvent('app-setting-changed', {
          detail: { key: 'app_perf_hud_enabled', value: hudEnabled },
        })
      );
    };

    toggleHud?.addEventListener('change', () => {
      syncHudSettings();
      renderBody();
    });
    selectVerbosity?.addEventListener('change', syncHudSettings);
    selectFps?.addEventListener('change', syncHudSettings);
    toggleBudget?.addEventListener('change', () => {
      syncHudSettings();
      renderBody();
    });

    btnPing?.addEventListener('click', () => {
      syncHudSettings();
      if (btnPing) {
        btnPing.textContent = 'Synchronized';
        setTimeout(() => {
          if (btnPing.isConnected) btnPing.textContent = 'Ping Frame Budget';
        }, 1400);
      }
    });

    drawer.querySelector('#diag-btn-test-mcp')?.addEventListener('click', async () => {
      statusNotice = 'Executing WebMCP tool ping across active stage...';
      renderBody();
      try {
        quickWebMcp = await runWebMcpBenchmark(
          benchTransport.mcpTransport,
          benchTransport.mcpTools
        );
        statusNotice = `WebMCP verified: read=${quickWebMcp.readLatencyMs}ms, set_var=${quickWebMcp.setVarLatencyMs}ms, dispatch=${quickWebMcp.dispatchLatencyMs}ms (${quickWebMcp.domPayloadReductionPct}% smaller than SVG DOM).`;
      } catch (err: any) {
        statusNotice = `WebMCP ping note: ${err?.message || 'Stage unavailable'}`;
      }
      renderBody();
    });

    drawer.querySelector('#diag-btn-run-epp')?.addEventListener('click', async () => {
      if (isRunning) return;
      isRunning = true;
      statusNotice = '';
      progressState = { phase: 'init', pct: 2, label: 'Initializing 3-phase empirical contention harness...' };
      renderBody();

      try {
        const dossier = await runEppContentionSuite({
          transport: benchTransport,
          sceneId: presetId,
          onProgress: (prog) => {
            progressState = prog;
            renderBody();
          },
        });
        activeDossier = dossier;
        quickCompression = dossier.compressionComparison;
        quickWebMcp = dossier.webmcpBenchmark;
        lmAvailability = dossier.promptApiStatus.availability;
        statusNotice = `Dossier captured & saved in EdgeLearningEngineDB. Exporting Markdown + JSON telemetry...`;
        const stamp = dossier.generatedAtIso.replace(/[:.]/g, '-').slice(0, 19);
        const md = formatEppReportMarkdown(dossier);
        triggerFileDownload(`chrome-epp-telemetry-${presetId}-${stamp}.md`, md, 'text/markdown;charset=utf-8');
        triggerFileDownload(
          `chrome-epp-telemetry-${presetId}-${stamp}.json`,
          JSON.stringify(dossier, null, 2),
          'application/json;charset=utf-8'
        );
      } catch (err: any) {
        statusNotice = `Telemetry suite aborted: ${err?.message || 'Unexpected error'}`;
      } finally {
        isRunning = false;
        renderBody();
      }
    });

    drawer.querySelector('#diag-btn-export-md')?.addEventListener('click', () => {
      if (!activeDossier) return;
      const stamp = activeDossier.generatedAtIso.replace(/[:.]/g, '-').slice(0, 19);
      triggerFileDownload(
        `chrome-epp-telemetry-${activeDossier.sceneId}-${stamp}.md`,
        formatEppReportMarkdown(activeDossier),
        'text/markdown;charset=utf-8'
      );
    });

    drawer.querySelector('#diag-btn-export-json')?.addEventListener('click', () => {
      if (!activeDossier) return;
      const stamp = activeDossier.generatedAtIso.replace(/[:.]/g, '-').slice(0, 19);
      triggerFileDownload(
        `chrome-epp-telemetry-${activeDossier.sceneId}-${stamp}.json`,
        JSON.stringify(activeDossier, null, 2),
        'application/json;charset=utf-8'
      );
    });

    drawer.querySelector('#diag-btn-copy-md')?.addEventListener('click', async () => {
      if (!activeDossier) return;
      try {
        await navigator.clipboard?.writeText(formatEppReportMarkdown(activeDossier));
        statusNotice = 'Markdown dossier copied to clipboard.';
        renderBody();
      } catch {
        statusNotice = 'Clipboard unavailable in this frame; use Export .md Dossier.';
        renderBody();
      }
    });
  }

  renderBody();

  // Hydrate asynchronous probes without blocking render
  Promise.all([
    probeAvailabilityLabel(),
    computeAstVsJsonCompression(),
    loadLastEppTelemetryDossier(),
  ])
    .then(([avail, comp, last]) => {
      lmAvailability = avail;
      quickCompression = comp;
      if (last && !activeDossier) {
        activeDossier = last;
      }
      if (drawer.isConnected) renderBody();
    })
    .catch(() => {});

  return drawer;
}

export default renderEppDiagnosticsDrawer;
