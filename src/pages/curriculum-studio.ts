// src/pages/curriculum-studio.ts
import { getBaseUrl } from '../utils/url';
import { PRESET_OPTIONS } from '../data/player/generatedScenes';
import {
  isFileSystemAccessSupported,
  nominateLocalFolder,
  restoreNominatedFolder,
  clearNominatedFolder,
  runLocalFolderBuild,
  compileDuoToArtifact,
  mountBuiltArtifactToVault,
  downloadAstbBinary,
  scanFileListForSources,
  type BuiltCartridgeArtifact,
  type LocalFolderBuildReport,
} from '../services/localCartridgeBuilder';
import { EverymanBios, TupleOp, type BiosKernelTelemetry } from '../engine/everymanBios';

function escapeHtml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCurriculumStudioPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'curriculum-studio-stage';
  container.style.cssText = 'max-width: 1160px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  let activeDirHandle: any = null;
  let activeFolderName = '';
  let activePermission: 'granted' | 'prompt' | 'denied' | 'none' = 'none';
  let writeBackEnabled = true;
  let lastReport: LocalFolderBuildReport | null = null;
  let selectedArtifact: BuiltCartridgeArtifact | null = null;
  let statusBanner = 'Ready for offline .ast + .svg Duo compilation & local folder builds.';

  const bios = new EverymanBios();
  let stopBiosLoop: (() => void) | null = null;

  container.innerHTML = `
    <!-- Header -->
    <div style="margin-bottom: 1.75rem;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🛠️ Curriculum &amp; Local Build Studio</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">
            Client-Side Duo Compiler &amp; Nominated Folder Builder
          </h1>
          <p style="font-size:0.95rem; color:#475569; margin:0;">
            Compile paired <code>.ast</code> + <code>.svg</code> Duo files into standalone <code>.astb</code> binaries, write builds to a nominated local folder, and execute on the 448 KiB Everyman WASM Kernel.
          </p>
        </div>
        <a href="${base}player" style="padding:10px 18px; border-radius:8px; background:#0284c7; color:#fff; font-weight:700; font-size:0.86rem; text-decoration:none;">
          Launch Player Studio &rarr;
        </a>
      </div>
    </div>

    <!-- Section 1: Nominated Local Folder Build Pipeline + Duo Dropzone -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin-bottom: 1.5rem;">
      <!-- Card A: Nominated Local Folder -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:10px;">
          <div>
            <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#0369a1; text-transform:uppercase;">
              File System Access API + IndexedDB Persistence
            </span>
            <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 0 0; color:#0f172a;">
              Nominated Local Build Folder
            </h2>
          </div>
          <span id="fs-api-badge" style="font-size:0.72rem; font-weight:700; padding:3px 8px; border-radius:6px; background:${isFileSystemAccessSupported() ? '#dcfce7; color:#166534;' : '#fef3c7; color:#92400e;'}">
            ${isFileSystemAccessSupported() ? 'FS Access Ready' : 'Fallback Mode'}
          </span>
        </div>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Nominate your local <code>cartridges/</code> folder once. The browser persists the directory handle in IndexedDB and builds <code>bytecode/*.astb</code>, <code>scenes.manifest.json</code>, and SHA-256 checksums straight to disk with zero cloud uploads.
        </p>

        <div id="nominated-folder-box" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:0.82rem;">
          <div style="color:#64748b;">No folder nominated yet.</div>
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#334155; font-weight:600; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="chk-write-disk" checked />
          Write compiled <code>bytecode/*.astb</code> + manifests back into nominated folder
        </label>

        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" id="btn-nominate-folder" style="padding:8px 14px; border-radius:8px; border:none; background:#0f172a; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            📁 Nominate Local Folder
          </button>
          <button type="button" id="btn-run-folder-build" disabled style="padding:8px 14px; border-radius:8px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer; opacity:0.55;">
            ⚡ Build All Duos in Folder
          </button>
          <button type="button" id="btn-fallback-dir" style="padding:8px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; color:#334155; font-weight:700; font-size:0.8rem; cursor:pointer;">
            📂 Scan Folder (Read-Only Fallback)
          </button>
          <button type="button" id="btn-forget-folder" style="display:none; padding:8px 10px; border-radius:8px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.78rem; cursor:pointer;">
            Forget
          </button>
          <input type="file" id="input-fallback-dir" webkitdirectory directory multiple style="display:none;" />
        </div>
      </section>

      <!-- Card B: Instant .ast + .svg Duo Compiler -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#7c3aed; text-transform:uppercase;">
          OP_SVG_COMPANION (0x81) Capsule Encoder
        </span>
        <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
          Single &amp; Multi-File Duo (.ast + .svg &rarr; .astb)
        </h2>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Select or drop paired <code>name.ast</code> + <code>name.svg</code> files (or <code>.ast.svg</code> capsules) to pack them into a single binary <code>.astb</code> cartridge verified by the 448 KiB WASM kernel.
        </p>

        <div id="duo-dropzone" style="border:2px dashed #94a3b8; border-radius:10px; padding:22px 16px; text-align:center; background:#f8fafc; cursor:pointer; transition:border-color 0.15s, background 0.15s;">
          <div style="font-size:1.5rem; margin-bottom:4px;">🧩</div>
          <div style="font-weight:700; font-size:0.88rem; color:#0f172a;">Drop paired .ast + .svg Duo files here</div>
          <div style="font-size:0.78rem; color:#64748b; margin-top:4px;">or click to pick local Duo files (multiple allowed)</div>
          <input type="file" id="input-duo-files" accept=".ast,.svg,.ast.svg" multiple style="display:none;" />
        </div>

        <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
          <span id="studio-status-line" style="font-size:0.8rem; font-weight:600; color:#0369a1;">
            ${escapeHtml(statusBanner)}
          </span>
          <button type="button" id="btn-test-built-sample" style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.76rem; cursor:pointer;">
            🧪 Test Built Sample Duo
          </button>
        </div>
      </section>
    </div>

    <!-- Section 2: Compiled Duo Build Results Table -->
    <section id="build-report-section" style="display:none; background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <div>
          <h2 style="font-size:1.15rem; font-weight:800; margin:0; color:#0f172a;">Compiled Build Output</h2>
          <p id="build-summary-stats" style="font-size:0.82rem; color:#475569; margin:4px 0 0 0;"></p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" id="btn-mount-all-vault" style="padding:7px 12px; border-radius:7px; border:none; background:#059669; color:#fff; font-weight:700; font-size:0.78rem; cursor:pointer;">
            💾 Mount All to Offline Vault
          </button>
          <button type="button" id="btn-download-manifest" style="padding:7px 12px; border-radius:7px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.78rem; cursor:pointer;">
            📄 Export scenes.manifest.json
          </button>
        </div>
      </div>

      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid #e2e8f0; color:#475569;">
              <th style="padding:8px 6px;">Cartridge</th>
              <th style="padding:8px 6px;">Mode</th>
              <th style="padding:8px 6px;">Size (Src &rarr; .astb)</th>
              <th style="padding:8px 6px;">448 KiB WASM Kernel</th>
              <th style="padding:8px 6px;">SHA-256</th>
              <th style="padding:8px 6px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="build-results-tbody"></tbody>
        </table>
      </div>
    </section>

    <!-- Section 3: Everyman Chassis 448 KiB WASM Kernel Live Inspector & Dumb Canvas Blitter -->
    <section id="everyman-bios-panel" style="display:none; background:#0f172a; color:#f8fafc; border:1px solid #334155; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
        <div>
          <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#38bdf8; text-transform:uppercase;">
            Zero-Domain JS BIOS + Pure WASM Kernel (448 KiB Fixed Pool)
          </span>
          <h2 id="bios-panel-title" style="font-size:1.15rem; font-weight:800; margin:2px 0 0 0; color:#fff;">
            Everyman Kernel Inspector
          </h2>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <button type="button" id="btn-bios-play-pause" style="padding:6px 12px; border-radius:6px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ⏯ Play / Pause (Op 6)
          </button>
          <button type="button" id="btn-bios-reset" style="padding:6px 12px; border-radius:6px; border:1px solid #475569; background:#1e293b; color:#e2e8f0; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ↺ Reset (Op 5)
          </button>
          <button type="button" id="btn-bios-close" style="padding:6px 10px; border-radius:6px; border:none; background:#334155; color:#cbd5e1; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ✕
          </button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: minmax(320px, 1.4fr) minmax(280px, 1fr); gap:14px;">
        <div>
          <canvas id="everyman-bios-canvas" width="800" height="480" style="width:100%; height:auto; background:#090d16; border:1px solid #334155; border-radius:8px; display:block; cursor:pointer;"></canvas>
          <div id="bios-telemetry-strip" style="margin-top:8px; font-family:ui-monospace, monospace; font-size:0.74rem; color:#94a3b8; display:flex; flex-wrap:wrap; gap:12px;"></div>
        </div>
        <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:10px; max-height:360px; overflow-y:auto;">
          <div style="font-size:0.74rem; font-weight:800; color:#38bdf8; margin-bottom:6px; text-transform:uppercase;">
            3-Column Gemini Nano / WebMCP Manifest (0x00C00)
          </div>
          <div id="bios-manifest-list" style="display:flex; flex-direction:column; gap:6px; font-family:ui-monospace, monospace; font-size:0.72rem;"></div>
        </div>
      </div>
    </section>

    <!-- Active Cartridges Inventory -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
      <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">
        Active Controlled Cartridges (${PRESET_OPTIONS.length} Registered)
      </h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:360px; overflow-y:auto;">
        ${PRESET_OPTIONS.map(p => `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:0.7rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px;">${p.type || 'Sim'}</span>
              <span style="font-size:0.7rem; color:#64748b; font-weight:600;">${p.stage}</span>
            </div>
            <strong style="font-size:0.85rem; color:#0f172a; display:block; margin-bottom:4px;">${p.label}</strong>
            <a href="${base}player?preset=${p.id}" style="font-size:0.75rem; color:#0284c7; font-weight:700; text-decoration:none;">Test in Player &rarr;</a>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Wire DOM elements
  const folderBox = container.querySelector('#nominated-folder-box') as HTMLElement;
  const chkWriteDisk = container.querySelector('#chk-write-disk') as HTMLInputElement;
  const btnNominate = container.querySelector('#btn-nominate-folder') as HTMLButtonElement;
  const btnRunBuild = container.querySelector('#btn-run-folder-build') as HTMLButtonElement;
  const btnFallbackDir = container.querySelector('#btn-fallback-dir') as HTMLButtonElement;
  const btnForgetFolder = container.querySelector('#btn-forget-folder') as HTMLButtonElement;
  const inputFallbackDir = container.querySelector('#input-fallback-dir') as HTMLInputElement;
  const dropzone = container.querySelector('#duo-dropzone') as HTMLElement;
  const inputDuoFiles = container.querySelector('#input-duo-files') as HTMLInputElement;
  const statusEl = container.querySelector('#studio-status-line') as HTMLElement;
  const btnTestSample = container.querySelector('#btn-test-built-sample') as HTMLButtonElement;

  const reportSection = container.querySelector('#build-report-section') as HTMLElement;
  const summaryStatsEl = container.querySelector('#build-summary-stats') as HTMLElement;
  const tbodyEl = container.querySelector('#build-results-tbody') as HTMLElement;
  const btnMountAll = container.querySelector('#btn-mount-all-vault') as HTMLButtonElement;
  const btnExportManifest = container.querySelector('#btn-download-manifest') as HTMLButtonElement;

  const biosPanel = container.querySelector('#everyman-bios-panel') as HTMLElement;
  const biosTitleEl = container.querySelector('#bios-panel-title') as HTMLElement;
  const biosCanvas = container.querySelector('#everyman-bios-canvas') as HTMLCanvasElement;
  const biosTelemetryEl = container.querySelector('#bios-telemetry-strip') as HTMLElement;
  const biosManifestEl = container.querySelector('#bios-manifest-list') as HTMLElement;
  const btnBiosPlay = container.querySelector('#btn-bios-play-pause') as HTMLButtonElement;
  const btnBiosReset = container.querySelector('#btn-bios-reset') as HTMLButtonElement;
  const btnBiosClose = container.querySelector('#btn-bios-close') as HTMLButtonElement;

  const setStatus = (msg: string, isErr = false) => {
    statusBanner = msg;
    statusEl.textContent = msg;
    statusEl.style.color = isErr ? '#dc2626' : '#0369a1';
  };

  const refreshFolderUI = () => {
    if (activeDirHandle && activeFolderName) {
      folderBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <strong style="color:#0f172a;">📂 ${escapeHtml(activeFolderName)}</strong>
            <div style="font-size:0.75rem; color:#475569; margin-top:2px;">
              Permission: <strong>${activePermission}</strong> &middot; Output: <code>${escapeHtml(activeFolderName)}/bytecode/</code>
            </div>
          </div>
          <span style="font-size:0.72rem; font-weight:700; color:${activePermission === 'granted' ? '#166534' : '#92400e'};">
            ${activePermission === 'granted' ? '✓ Read/Write' : '⚠ Re-grant on Build'}
          </span>
        </div>
      `;
      btnRunBuild.disabled = false;
      btnRunBuild.style.opacity = '1';
      btnForgetFolder.style.display = 'inline-block';
    } else {
      folderBox.innerHTML = `<div style="color:#64748b;">No folder nominated yet. Click <strong>Nominate Local Folder</strong> or use Read-Only Folder Scan.</div>`;
      btnRunBuild.disabled = true;
      btnRunBuild.style.opacity = '0.55';
      btnForgetFolder.style.display = 'none';
    }
  };

  const openBiosInspector = async (artifact: BuiltCartridgeArtifact) => {
    selectedArtifact = artifact;
    biosPanel.style.display = 'block';
    biosTitleEl.textContent = `Everyman 448 KiB Kernel — ${artifact.title} (${artifact.id}.astb)`;
    if (stopBiosLoop) {
      stopBiosLoop();
      stopBiosLoop = null;
    }

    try {
      await bios.init();
      const boot = bios.bootCartridge(artifact.astbData);

      const renderTelemetryAndManifest = (tel: BiosKernelTelemetry) => {
        biosTelemetryEl.innerHTML = `
          <span><strong>Mem:</strong> ${(tel.linearMemoryBytes / 1024).toFixed(0)} KiB (${tel.linearMemoryPages} pages)</span>
          <span><strong>t:</strong> ${tel.t.toFixed(3)}</span>
          <span><strong>Tick:</strong> ${tel.tickCount}</span>
          <span><strong>Tuples:</strong> ${tel.tupleCount}</span>
          <span><strong>Hitboxes:</strong> ${tel.hitboxCount}</span>
          <span><strong>DL Ops:</strong> ${tel.displayListCount}</span>
          <span><strong>StateHex:</strong> ${tel.stateHex}</span>
        `;
      };

      const renderManifestRows = () => {
        const rows = bios.readManifest();
        biosManifestEl.innerHTML = rows
          .map(
            (r) => `
            <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:6px 8px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
              <div style="min-width:0;">
                <div style="color:#38bdf8; font-weight:700;">#${r.slotId} [${r.stageState}] &middot; ${r.kind}</div>
                <div style="color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(r.semanticTag)} &rarr; ${escapeHtml(r.payload)}</div>
                <div style="color:#94a3b8;">val=${Number(r.value).toFixed(2)} (${r.min}..${r.max})</div>
              </div>
              <button type="button" data-focus-slot="${r.slotId}" style="padding:3px 7px; border-radius:4px; border:1px solid #475569; background:#1e293b; color:#e2e8f0; cursor:pointer; font-size:0.68rem;">
                Focus
              </button>
            </div>
          `
          )
          .join('');
        biosManifestEl.querySelectorAll<HTMLButtonElement>('[data-focus-slot]').forEach((b) => {
          b.onclick = () => {
            const slot = parseInt(b.dataset.focusSlot || '0', 10);
            bios.dispatchTuple(slot, TupleOp.FOCUS, 0, 0);
            renderManifestRows();
          };
        });
      };

      renderManifestRows();
      renderTelemetryAndManifest(boot.telemetry);
      stopBiosLoop = bios.startCanvasLoop(biosCanvas, (tel) => {
        renderTelemetryAndManifest(tel);
      });
    } catch (err: any) {
      biosTelemetryEl.textContent = `Kernel boot error: ${err?.message || err}`;
    }
  };

  const renderBuildReport = (report: LocalFolderBuildReport) => {
    lastReport = report;
    reportSection.style.display = 'block';
    const pct =
      report.totalSourceBytes > 0
        ? (((report.totalSourceBytes - report.totalBytecodeBytes) / report.totalSourceBytes) * 100).toFixed(1)
        : '0.0';
    summaryStatsEl.textContent =
      `Source: ${report.folderName} • ${report.totalArtifacts} built (${report.duoCount} Duos) • ` +
      `${report.totalSourceBytes.toLocaleString()} B → ${report.totalBytecodeBytes.toLocaleString()} B (-${pct}%) • ` +
      `${report.wroteToLocalFolder ? 'Written to bytecode/ on local disk' : 'Ready in memory / download'}` +
      (report.failedCount > 0 ? ` • ${report.failedCount} failed` : '');

    tbodyEl.innerHTML = report.artifacts
      .map(
        (a, idx) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:9px 6px;">
          <strong style="color:#0f172a;">${escapeHtml(a.title)}</strong>
          <div style="font-size:0.74rem; color:#64748b;"><code>${escapeHtml(a.id)}.astb</code> &middot; ${escapeHtml(a.type)}</div>
        </td>
        <td style="padding:9px 6px;">
          <span style="font-size:0.72rem; font-weight:700; padding:2px 7px; border-radius:5px; background:${a.mode === 'duo' ? '#dbeafe; color:#1d4ed8;' : '#f1f5f9; color:#475569;'}">
            ${a.mode === 'duo' ? 'AST+SVG Duo' : a.mode === 'hybrid-capsule' ? '.ast.svg' : 'AST Only'}
          </span>
          ${a.writtenToDisk ? '<div style="font-size:0.7rem; color:#15803d; margin-top:2px;">✓ saved to disk</div>' : ''}
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.76rem;">
          ${a.sourceBytes.toLocaleString()} B &rarr; <strong>${a.bytecodeBytes.toLocaleString()} B</strong>
          <div style="color:#0369a1;">(${a.savingsPercent >= 0 ? `-${a.savingsPercent}%` : `+${Math.abs(a.savingsPercent)}%`})</div>
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.74rem;">
          ${
            a.wasmBootOk
              ? `<span style="color:#15803d; font-weight:700;">✓ 448 KiB Boot OK</span><div style="color:#64748b;">${a.wasmManifestCount} rows &middot; ${a.wasmStateHex.slice(0, 12)}…</div>`
              : `<span style="color:#dc2626; font-weight:700;">✕ ${escapeHtml(a.wasmError || 'Boot error')}</span>`
          }
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.72rem; color:#475569;">
          ${a.sha256.slice(0, 12)}…
        </td>
        <td style="padding:9px 6px; text-align:right; white-space:nowrap;">
          <button type="button" data-dl-idx="${idx}" style="padding:4px 8px; border-radius:5px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.74rem; cursor:pointer;">⬇ .astb</button>
          <button type="button" data-wasm-idx="${idx}" style="padding:4px 8px; border-radius:5px; border:none; background:#0f172a; color:#38bdf8; font-weight:700; font-size:0.74rem; cursor:pointer;">⚡ WASM</button>
          <button type="button" data-mount-idx="${idx}" style="padding:4px 8px; border-radius:5px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.74rem; cursor:pointer;">▶ Player</button>
        </td>
      </tr>
    `
      )
      .join('');

    tbodyEl.querySelectorAll<HTMLButtonElement>('[data-dl-idx]').forEach((btn) => {
      btn.onclick = () => {
        const art = report.artifacts[Number(btn.dataset.dlIdx)];
        if (art) downloadAstbBinary(art.id, art.astbData);
      };
    });
    tbodyEl.querySelectorAll<HTMLButtonElement>('[data-wasm-idx]').forEach((btn) => {
      btn.onclick = () => {
        const art = report.artifacts[Number(btn.dataset.wasmIdx)];
        if (art) openBiosInspector(art);
      };
    });
    tbodyEl.querySelectorAll<HTMLButtonElement>('[data-mount-idx]').forEach((btn) => {
      btn.onclick = async () => {
        const art = report.artifacts[Number(btn.dataset.mountIdx)];
        if (!art) return;
        await mountBuiltArtifactToVault(art);
        window.location.href = `${base}player?preset=${encodeURIComponent(art.id)}`;
      };
    });

    if (report.artifacts.length > 0 && !selectedArtifact) {
      openBiosInspector(report.artifacts[0]);
    }
  };

  // Restore any previously nominated local directory handle from IndexedDB
  restoreNominatedFolder(false).then((res) => {
    if (res.handle && res.name) {
      activeDirHandle = res.handle;
      activeFolderName = res.name;
      activePermission = res.permission;
      refreshFolderUI();
    }
  });

  chkWriteDisk.onchange = () => {
    writeBackEnabled = chkWriteDisk.checked;
  };

  btnNominate.onclick = async () => {
    try {
      const picked = await nominateLocalFolder();
      activeDirHandle = picked.handle;
      activeFolderName = picked.name;
      activePermission = picked.permission;
      refreshFolderUI();
      setStatus(`Nominated folder "${picked.name}". Click "Build All Duos in Folder" to compile.`);
    } catch (err: any) {
      setStatus(err?.message || 'Folder selection cancelled.', true);
    }
  };

  btnForgetFolder.onclick = async () => {
    await clearNominatedFolder();
    activeDirHandle = null;
    activeFolderName = '';
    activePermission = 'none';
    refreshFolderUI();
    setStatus('Removed persisted folder handle from IndexedDB.');
  };

  btnRunBuild.onclick = async () => {
    if (!activeDirHandle) return;
    setStatus(`Scanning "${activeFolderName}" and compiling .ast + .svg Duos into .astb...`);
    try {
      const report = await runLocalFolderBuild({
        folderName: activeFolderName,
        dirHandle: activeDirHandle,
        writeToDisk: writeBackEnabled,
      });
      activePermission = report.wroteToLocalFolder ? 'granted' : activePermission;
      refreshFolderUI();
      renderBuildReport(report);
      setStatus(
        `Built ${report.totalArtifacts} cartridges (${report.duoCount} Duos)` +
          (report.wroteToLocalFolder ? ` directly into ${activeFolderName}/bytecode/` : ' in memory.')
      );
    } catch (err: any) {
      setStatus(`Build failed: ${err?.message || err}`, true);
    }
  };

  btnFallbackDir.onclick = () => inputFallbackDir.click();
  inputFallbackDir.onchange = async () => {
    if (!inputFallbackDir.files || inputFallbackDir.files.length === 0) return;
    const firstRel = (inputFallbackDir.files[0] as any).webkitRelativePath || '';
    const folderLabel = firstRel.includes('/') ? firstRel.split('/')[0] : 'Selected Folder';
    setStatus(`Compiling files from "${folderLabel}"...`);
    const report = await runLocalFolderBuild({
      folderName: folderLabel,
      fileList: inputFallbackDir.files,
      writeToDisk: false,
    });
    renderBuildReport(report);
    setStatus(`Compiled ${report.totalArtifacts} cartridges from "${folderLabel}".`);
    inputFallbackDir.value = '';
  };

  const handleDuoFileSelection = async (files: FileList | File[]) => {
    const entries = await scanFileListForSources(files);
    if (entries.length === 0) {
      setStatus('No .ast / .ast.svg source files found in selection.', true);
      return;
    }
    const report = await runLocalFolderBuild({
      folderName: 'Selected Duo Files',
      entries,
      writeToDisk: Boolean(activeDirHandle && writeBackEnabled),
      dirHandle: activeDirHandle || undefined,
    });
    renderBuildReport(report);
    setStatus(`Compiled ${report.totalArtifacts} Duo cartridge(s) to .astb (${report.totalBytecodeBytes} B total).`);
  };

  dropzone.onclick = () => inputDuoFiles.click();
  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#0284c7';
    dropzone.style.background = '#eff6ff';
  };
  dropzone.ondragleave = () => {
    dropzone.style.borderColor = '#94a3b8';
    dropzone.style.background = '#f8fafc';
  };
  dropzone.ondrop = async (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#94a3b8';
    dropzone.style.background = '#f8fafc';
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      await handleDuoFileSelection(e.dataTransfer.files);
    }
  };
  inputDuoFiles.onchange = async () => {
    if (inputDuoFiles.files && inputDuoFiles.files.length > 0) {
      await handleDuoFileSelection(inputDuoFiles.files);
      inputDuoFiles.value = '';
    }
  };

  btnTestSample.onclick = async () => {
    const sampleAst = `(:scene :id "ohm-duo-demo" :type "Sim" :title "Ohm's Law Duo Sample" :stage "KS3 PHYSICS" :duration 12.0
      (:vars ((:var :name "voltage" :val 9.0 :min 1 :max 24 :step 0.5 :label "Voltage (V)")
              (:var :name "resistance" :val 3.0 :min 1 :max 12 :step 0.5 :label "Resistance (Ω)")))
      (:keyframes ((:t 0.0 :title "Circuit Closed" :rule "I = V / R")
                   (:t 0.5 :title "Steady Current" :rule "Ammeter steady at 3.0 A")))
      (:bindings ((:target "#bulb-glow" :attr "opacity" :expr "Math.min(1, (vars.voltage / vars.resistance) / 8)")))
      (:gestures ((:draggable :target "#voltage-slider" :axis "x" :min 1 :max 24))))`;
    const sampleSvg = `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#0f172a"/><rect x="120" y="140" width="560" height="200" rx="24" fill="none" stroke="#38bdf8" stroke-width="4"/><circle id="bulb-glow" cx="680" cy="240" r="36" fill="#facc15"/><circle id="voltage-slider" cx="400" cy="140" r="14" fill="#38bdf8"/></svg>`;
    const art = await compileDuoToArtifact({ id: 'ohm-duo-demo', astText: sampleAst, svgText: sampleSvg });
    renderBuildReport({
      folderName: 'Built-in Sample Duo',
      wroteToLocalFolder: false,
      builtAt: Date.now(),
      totalArtifacts: 1,
      duoCount: 1,
      failedCount: 0,
      totalSourceBytes: art.sourceBytes,
      totalBytecodeBytes: art.bytecodeBytes,
      artifacts: [art],
      manifestJson: { schemaVersion: 'everyman-astb-duo/1.0', entries: [{ id: art.id, bytecodeBytes: art.bytecodeBytes, sha256: art.sha256 }] },
      checksumsJson: { [`${art.id}.astb`]: art.sha256 },
      errors: [],
    });
    setStatus(`Compiled & booted Sample Duo (${art.bytecodeBytes} B .astb, OP_SVG_COMPANION embedded).`);
  };

  btnMountAll.onclick = async () => {
    if (!lastReport) return;
    for (const art of lastReport.artifacts) {
      await mountBuiltArtifactToVault(art);
    }
    setStatus(`Mounted ${lastReport.artifacts.length} compiled Duo cartridge(s) into local IndexedDB Vault.`);
  };

  btnExportManifest.onclick = () => {
    if (!lastReport) return;
    const blob = new Blob([JSON.stringify(lastReport.manifestJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scenes.manifest.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
  };

  btnBiosPlay.onclick = () => {
    bios.dispatchTuple(0, TupleOp.TOGGLE_PLAY, 0, 0);
  };
  btnBiosReset.onclick = () => {
    bios.dispatchTuple(0, TupleOp.RESET, 0, 0);
  };
  btnBiosClose.onclick = () => {
    if (stopBiosLoop) {
      stopBiosLoop();
      stopBiosLoop = null;
    }
    biosPanel.style.display = 'none';
    selectedArtifact = null;
  };

  refreshFolderUI();
  return container;
}

export default renderCurriculumStudioPage;
