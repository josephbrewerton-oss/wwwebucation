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
import { getSharedRenderBoundary, type RenderMode } from '../engine/sharedRenderBoundary';
import { getSiteManifest, executeSiteDirective } from '../engine/nanoSiteManager';
import {
  initCurriculumPackStore,
  getInstalledCurriculumPacks,
  saveCurriculumPack,
  removeCurriculumPack,
  type CustomCurriculumPack,
} from '../services/curriculumPackStore';
import {
  saveAxiomAnchorTopic,
  deleteAxiomAnchorTopic,
  generateSampleCsvTemplate,
  generateSampleJsonTemplate,
  parseCsvToCurriculumPack,
  PRESET_OVERSEAS_PACKS,
} from '../services/overseasCurriculumPresets';
import { refreshCustomPacksInMesh } from '../curriculum/curriculumMesh';

const COUNTRY_FLAG_MAP: Record<string, string> = {
  Kenya: '🇰🇪',
  India: '🇮🇳',
  Ghana: '🇬🇭',
  Philippines: '🇵🇭',
};

function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 500);
}

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

  const urlParams = new URLSearchParams(window.location.search);
  const rawTab = (urlParams.get('tab') || '').toLowerCase();
  const pathLower = window.location.pathname.toLowerCase();
  let activeStudioTab: 'overseas' | 'packager' =
    rawTab === 'packager' || rawTab === 'astb' || rawTab === 'duo'
      ? 'packager'
      : rawTab === 'overseas' ||
          rawTab === 'import' ||
          pathLower.includes('overseas') ||
          pathLower.includes('import') ||
          pathLower.includes('international')
        ? 'overseas'
        : 'overseas';

  let overseasStatusMsg =
    'Install 1-click overseas Ministry packs (Kenya, India, Ghana, Philippines) or import your own school CSV / JSON syllabus — 100% offline in IndexedDB.';
  let overseasStatusErr = false;

  const bios = new EverymanBios();
  let stopBiosLoop: (() => void) | null = null;

  container.innerHTML = `
    <!-- Header -->
    <div style="margin-bottom: 1.5rem;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <a href="${base}" style="font-size:0.84rem; color:#475569; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0369a1; font-weight:700;">🌍 Curriculum &amp; Lesson Author Studio</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">
            Overseas Curriculums &amp; Offline Lesson Studio
          </h1>
          <p style="font-size:0.95rem; color:#475569; margin:0; max-width:780px; line-height:1.5;">
            Import international Ministry syllabi (Kenya KICD, India CBSE/NCERT, Ghana GES/NaCCA, Philippines DepEd MATATAG), upload custom school CSV/JSON packs, or compile paired <code>.ast + .svg</code> labs into offline <code>.astb</code> cartridges.
          </p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="${base}learning-zone" style="padding:10px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.84rem; text-decoration:none;">
            📖 Learning Zone
          </a>
          <a href="${base}player" style="padding:10px 16px; border-radius:8px; background:#0284c7; color:#fff; font-weight:700; font-size:0.84rem; text-decoration:none;">
            🎮 Interactive Player &rarr;
          </a>
        </div>
      </div>

      <!-- Studio Mode Tabs -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:1.25rem; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
        <button type="button" id="studio-tab-overseas" style="padding:9px 18px; border-radius:8px; font-weight:800; font-size:0.86rem; cursor:pointer; border:1px solid #0284c7; background:#0284c7; color:#ffffff;">
          🌍 Overseas &amp; Custom Curriculums (CSV / JSON / Ministry Packs)
        </button>
        <button type="button" id="studio-tab-packager" style="padding:9px 18px; border-radius:8px; font-weight:800; font-size:0.86rem; cursor:pointer; border:1px solid #cbd5e1; background:#ffffff; color:#334155;">
          🧩 Interactive Lab Packager (.ast + .svg &rarr; .astb)
        </button>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- TAB 1: OVERSEAS & CUSTOM CURRICULUM IMPORTER                          -->
    <!-- ===================================================================== -->
    <div id="studio-pane-overseas">
      <div id="overseas-status-banner" role="status" style="background:#f0f9ff; border:1px solid #bae6fd; color:#075985; border-radius:10px; padding:10px 14px; font-size:0.84rem; font-weight:600; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
        <span id="overseas-status-text">${escapeHtml(overseasStatusMsg)}</span>
        <span style="font-size:0.74rem; font-weight:800; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 8px; border-radius:999px;">
          Zero Cloud &bull; IndexedDB Persistent
        </span>
      </div>

      <!-- 1. One-Click Overseas Ministry Preset Packs -->
      <section style="margin-bottom:1.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <div>
            <span style="font-size:0.72rem; font-weight:800; letter-spacing:0.06em; color:#0369a1; text-transform:uppercase;">
              One-Click International Syllabi
            </span>
            <h2 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:2px 0 0 0;">
              🌍 Overseas Ministry Curriculum Packs
            </h2>
          </div>
          <button type="button" id="btn-install-all-overseas" style="padding:7px 14px; border-radius:8px; border:1px solid #0284c7; background:#f0f9ff; color:#0369a1; font-weight:700; font-size:0.8rem; cursor:pointer;">
            ⬇️ Install All 4 Ministry Packs
          </button>
        </div>

        <div id="overseas-presets-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(265px, 1fr)); gap:14px;"></div>
      </section>

      <!-- 2. CSV / JSON Pack Importer + Teacher Axiom Anchor Author -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:16px; margin-bottom:1.75rem;">
        <!-- Left Card: CSV & JSON Importer -->
        <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
          <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#065f46; text-transform:uppercase;">
            Spreadsheet &amp; Schema Importer
          </span>
          <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
            📄 Import School / Ministry CSV or JSON Pack
          </h2>
          <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
            Upload a spreadsheet (<code>.csv</code>) or structured curriculum pack (<code>.json</code>) to add local grades, regional subjects, lessons, and misconception drills into the Learning Zone and Practice Lab.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
            <div>
              <label for="inp-pack-title" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:3px;">Pack Title (for CSV)</label>
              <input id="inp-pack-title" type="text" placeholder="e.g. Diocese Grade 7 Science" style="width:100%; box-sizing:border-box; padding:7px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; background:#ffffff;" />
            </div>
            <div>
              <label for="inp-pack-country" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:3px;">Country / Region</label>
              <input id="inp-pack-country" type="text" placeholder="e.g. Uganda / Nigeria / Parish" style="width:100%; box-sizing:border-box; padding:7px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; background:#ffffff;" />
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <label for="inp-pack-ministry" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:3px;">Ministry / Curriculum Board / Author</label>
            <input id="inp-pack-ministry" type="text" placeholder="e.g. NCDC / WAEC / Science Department" style="width:100%; box-sizing:border-box; padding:7px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; background:#ffffff;" />
          </div>

          <div id="overseas-file-dropzone" style="border:2px dashed #64748b; border-radius:10px; padding:18px 14px; text-align:center; background:#f8fafc; cursor:pointer;">
            <div style="font-size:1.35rem; margin-bottom:3px;">📥</div>
            <div style="font-weight:700; font-size:0.86rem; color:#0f172a;">Drop a .csv or .json curriculum file here</div>
            <div style="font-size:0.76rem; color:#475569; margin-top:3px;">or click to browse local device files</div>
            <input type="file" id="input-overseas-pack-file" accept=".csv,.json,text/csv,application/json" style="display:none;" />
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">
            <button type="button" id="btn-dl-sample-csv" style="padding:6px 11px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.76rem; cursor:pointer;">
              ⬇ Sample CSV Template
            </button>
            <button type="button" id="btn-dl-sample-json" style="padding:6px 11px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.76rem; cursor:pointer;">
              ⬇ Sample JSON Template
            </button>
          </div>
        </section>

        <!-- Right Card: Quick Teacher Axiom + Misconception Trap Author -->
        <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
          <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#7c3aed; text-transform:uppercase;">
            Backward-Design Topic Builder
          </span>
          <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
            ✍️ Quick Teacher Topic Anchor
          </h2>
          <p style="font-size:0.84rem; color:#475569; margin:0 0 10px 0; line-height:1.45;">
            Enter a Grade/Stage, Subject, Core Rule, and Common Misconception to auto-generate offline diagnostic practice questions immediately.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
            <div>
              <label for="inp-anchor-stage" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Stage / Grade *</label>
              <input id="inp-anchor-stage" type="text" value="Grade 7 (JSS)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
            </div>
            <div>
              <label for="inp-anchor-subject" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Subject *</label>
              <input id="inp-anchor-subject" type="text" placeholder="e.g. Integrated Science" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
            </div>
          </div>
          <div style="margin-bottom:8px;">
            <label for="inp-anchor-topic" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Topic / Lesson Title *</label>
            <input id="inp-anchor-topic" type="text" placeholder="e.g. Rainwater Harvesting & Filtration" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
          </div>
          <div style="margin-bottom:8px;">
            <label for="inp-anchor-axiom" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Core Curriculum Rule (Axiom) *</label>
            <textarea id="inp-anchor-axiom" rows="2" placeholder="e.g. First-flush diverters discard contaminated initial roof runoff before storing clean rainwater." style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; font-family:inherit;"></textarea>
          </div>
          <div style="margin-bottom:10px;">
            <label for="inp-anchor-trap" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Common Pupil Misconception (Trap) *</label>
            <input id="inp-anchor-trap" type="text" placeholder="e.g. Assuming clear roof runoff is automatically free of dissolved bird or dust pathogens." style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
          </div>
          <button type="button" id="btn-save-anchor-topic" style="width:100%; padding:9px 14px; border-radius:8px; border:none; background:#0f172a; color:#ffffff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            ➕ Save Topic &amp; Generate Diagnostic Questions
          </button>
        </section>
      </div>

      <!-- 3. Installed Overseas & Custom Packs Manager -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; margin-bottom:2rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
          <div>
            <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0;">
              📦 Installed Overseas &amp; Custom Curriculum Packs
            </h2>
            <p style="font-size:0.82rem; color:#475569; margin:3px 0 0 0;">
              Installed packs appear automatically in the <strong>Learning Zone</strong>, <strong>Practice Lab</strong>, and <strong>Revision Flashcards</strong>.
            </p>
          </div>
        </div>
        <div id="installed-packs-container"></div>
      </section>
    </div>

    <!-- ===================================================================== -->
    <!-- TAB 2: .AST + .SVG DUO PACKAGER & 448 KiB WASM INSPECTOR              -->
    <!-- ===================================================================== -->
    <div id="studio-pane-packager" style="display:none;">
    <!-- Section 1: Nominated Local Folder Build Pipeline + Duo Dropzone -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin-bottom: 1.5rem;">
      <!-- Card A: Nominated Local Folder -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:10px;">
          <div>
            <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#0369a1; text-transform:uppercase;">
              Local Classroom Sync (Offline Storage)
            </span>
            <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 0 0; color:#0f172a;">
              School Lesson Build Folder
            </h2>
          </div>
          <span id="fs-api-badge" style="font-size:0.72rem; font-weight:700; padding:3px 8px; border-radius:6px; background:${isFileSystemAccessSupported() ? '#dcfce7; color:#166534;' : '#fef3c7; color:#92400e;'}">
            ${isFileSystemAccessSupported() ? 'Folder Sync Ready' : 'Read-Only Mode'}
          </span>
        </div>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Pick your local <code>cartridges/</code> folder once to remember it offline and rebuild lesson packages (<code>bytecode/*.astb</code>) and manifests straight to disk with zero cloud uploads.
        </p>

        <div id="nominated-folder-box" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:0.82rem;">
          <div style="color:#64748b;">No folder chosen yet.</div>
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#334155; font-weight:600; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="chk-write-disk" checked />
          Save rebuilt lesson packages back into the chosen folder
        </label>

        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" id="btn-nominate-folder" style="padding:8px 14px; border-radius:8px; border:none; background:#0f172a; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            📁 Pick School Folder
          </button>
          <button type="button" id="btn-run-folder-build" disabled style="padding:8px 14px; border-radius:8px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer; opacity:0.55;">
            ⚡ Build All Lessons in Folder
          </button>
          <button type="button" id="btn-fallback-dir" style="padding:8px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; color:#334155; font-weight:700; font-size:0.8rem; cursor:pointer;">
            📂 Scan Folder (Read-Only)
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
          Offline Activity Packager
        </span>
        <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
          Package Lesson + Diagram (.ast + .svg)
        </h2>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Select or drop matching lesson (<code>.ast</code>) and diagram (<code>.svg</code>) files to pack them into a portable offline <code>.astb</code> activity and preview it immediately.
        </p>

        <div id="duo-dropzone" style="border:2px dashed #94a3b8; border-radius:10px; padding:22px 16px; text-align:center; background:#f8fafc; cursor:pointer; transition:border-color 0.15s, background 0.15s;">
          <div style="font-size:1.5rem; margin-bottom:4px;">🧩</div>
          <div style="font-weight:700; font-size:0.88rem; color:#0f172a;">Drop lesson (.ast) + diagram (.svg) files here</div>
          <div style="font-size:0.78rem; color:#64748b; margin-top:4px;">or click to browse local files (multiple allowed)</div>
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
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <select id="sel-bios-render-mode" aria-label="Shared Render Boundary Mode" style="padding:5px 8px; border-radius:6px; border:1px solid #475569; background:#1e293b; color:#38bdf8; font-weight:700; font-size:0.76rem; cursor:pointer;">
            <option value="canvas">Mode: WASM Canvas</option>
            <option value="svg">Mode: Companion SVG</option>
            <option value="hybrid">Mode: Hybrid Shared</option>
          </select>
          <button type="button" id="btn-bios-nano-manifest" style="padding:6px 10px; border-radius:6px; border:1px solid #7c3aed; background:#1e1b4b; color:#ddd6fe; font-weight:700; font-size:0.76rem; cursor:pointer;">
            🤖 Nano Manifest
          </button>
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
          <div style="position:relative; width:100%; aspect-ratio:800/480; background:#090d16; border:1px solid #334155; border-radius:8px; overflow:hidden;">
            <svg id="everyman-bios-svg" viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" style="position:absolute; inset:0; width:100%; height:100%; display:none;">
              <g id="everyman-bios-svg-root"></g>
            </svg>
            <canvas id="everyman-bios-canvas" width="800" height="480" style="position:relative; width:100%; height:100%; display:block; cursor:pointer;"></canvas>
          </div>
          <div id="bios-telemetry-strip" style="margin-top:8px; font-family:ui-monospace, monospace; font-size:0.74rem; color:#94a3b8; display:flex; flex-wrap:wrap; gap:12px;"></div>
        </div>
        <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:10px; max-height:360px; overflow-y:auto;">
          <div style="font-size:0.74rem; font-weight:800; color:#38bdf8; margin-bottom:6px; text-transform:uppercase;">
            3-Column Gemini Nano / WebMCP Manifest (0x00C00)
          </div>
          <div id="bios-manifest-list" style="display:flex; flex-direction:column; gap:6px; font-family:ui-monospace, monospace; font-size:0.72rem;"></div>
          <pre id="bios-nano-manifest-pre" style="display:none; margin:8px 0 0 0; padding:8px; background:#090d16; border:1px solid #4c1d95; border-radius:6px; color:#e9d5ff; font-size:0.68rem; overflow-x:auto; white-space:pre-wrap;"></pre>
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
    </div>
  `;

  // Wire Studio Tabs & Overseas Importer Controls
  const tabBtnOverseas = container.querySelector('#studio-tab-overseas') as HTMLButtonElement;
  const tabBtnPackager = container.querySelector('#studio-tab-packager') as HTMLButtonElement;
  const paneOverseas = container.querySelector('#studio-pane-overseas') as HTMLElement;
  const panePackager = container.querySelector('#studio-pane-packager') as HTMLElement;

  const overseasBanner = container.querySelector('#overseas-status-banner') as HTMLElement;
  const overseasStatusText = container.querySelector('#overseas-status-text') as HTMLElement;
  const presetsGrid = container.querySelector('#overseas-presets-grid') as HTMLElement;
  const installedPacksEl = container.querySelector('#installed-packs-container') as HTMLElement;
  const btnInstallAllOverseas = container.querySelector('#btn-install-all-overseas') as HTMLButtonElement;

  const inpPackTitle = container.querySelector('#inp-pack-title') as HTMLInputElement;
  const inpPackCountry = container.querySelector('#inp-pack-country') as HTMLInputElement;
  const inpPackMinistry = container.querySelector('#inp-pack-ministry') as HTMLInputElement;
  const overseasDropzone = container.querySelector('#overseas-file-dropzone') as HTMLElement;
  const inputOverseasFile = container.querySelector('#input-overseas-pack-file') as HTMLInputElement;
  const btnDlSampleCsv = container.querySelector('#btn-dl-sample-csv') as HTMLButtonElement;
  const btnDlSampleJson = container.querySelector('#btn-dl-sample-json') as HTMLButtonElement;

  const inpAnchorStage = container.querySelector('#inp-anchor-stage') as HTMLInputElement;
  const inpAnchorSubject = container.querySelector('#inp-anchor-subject') as HTMLInputElement;
  const inpAnchorTopic = container.querySelector('#inp-anchor-topic') as HTMLInputElement;
  const inpAnchorAxiom = container.querySelector('#inp-anchor-axiom') as HTMLTextAreaElement;
  const inpAnchorTrap = container.querySelector('#inp-anchor-trap') as HTMLInputElement;
  const btnSaveAnchor = container.querySelector('#btn-save-anchor-topic') as HTMLButtonElement;

  const applyStudioTab = (tab: 'overseas' | 'packager', pushQuery = false) => {
    activeStudioTab = tab;
    paneOverseas.style.display = tab === 'overseas' ? 'block' : 'none';
    panePackager.style.display = tab === 'packager' ? 'block' : 'none';
    tabBtnOverseas.style.background = tab === 'overseas' ? '#0284c7' : '#ffffff';
    tabBtnOverseas.style.color = tab === 'overseas' ? '#ffffff' : '#334155';
    tabBtnOverseas.style.borderColor = tab === 'overseas' ? '#0284c7' : '#cbd5e1';
    tabBtnPackager.style.background = tab === 'packager' ? '#0284c7' : '#ffffff';
    tabBtnPackager.style.color = tab === 'packager' ? '#ffffff' : '#334155';
    tabBtnPackager.style.borderColor = tab === 'packager' ? '#0284c7' : '#cbd5e1';
    if (pushQuery) {
      const nextUrl = `${window.location.pathname}?tab=${tab}`;
      window.history.replaceState({}, '', nextUrl);
    }
  };

  const setOverseasStatus = (msg: string, isErr = false) => {
    overseasStatusMsg = msg;
    overseasStatusErr = isErr;
    overseasStatusText.textContent = msg;
    if (isErr) {
      overseasBanner.style.background = '#fef2f2';
      overseasBanner.style.borderColor = '#fecaca';
      overseasBanner.style.color = '#991b1b';
    } else {
      overseasBanner.style.background = '#f0f9ff';
      overseasBanner.style.borderColor = '#bae6fd';
      overseasBanner.style.color = '#075985';
    }
  };

  const getFirstStageTitle = (pack: CustomCurriculumPack): string => {
    const firstStage = Object.values(pack.stages || {})[0];
    if (firstStage?.title) return firstStage.title;
    if (pack.lessons?.[0]?.stageTitle) return pack.lessons[0].stageTitle;
    return 'All';
  };

  const renderOverseasUI = () => {
    const installed = getInstalledCurriculumPacks();
    const installedIds = new Set(installed.map((p) => p.id));

    presetsGrid.innerHTML = PRESET_OVERSEAS_PACKS.map((preset) => {
      const isInstalled = installedIds.has(preset.id);
      const flag = COUNTRY_FLAG_MAP[preset.countryOrRegion] || '🌍';
      const stageList = Object.values(preset.stages || {}).map((s) => s.title);
      const topicCount = Object.values(preset.stages || {}).reduce(
        (acc, st) => acc + (st.subjects || []).reduce((sAcc, sub) => sAcc + (sub.topics?.length || 0), 0),
        0
      );
      const firstStage = getFirstStageTitle(preset);

      return `
        <article style="background:#ffffff; border:1px solid ${isInstalled ? '#86efac' : '#cbd5e1'}; border-radius:12px; padding:1.15rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 6px rgba(15,23,42,0.03);">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:8px;">
              <span style="font-size:0.74rem; font-weight:800; color:#0369a1; background:#e0f2fe; padding:2px 8px; border-radius:999px;">
                ${flag} ${escapeHtml(preset.countryOrRegion)} &bull; v${escapeHtml(preset.version)}
              </span>
              ${
                isInstalled
                  ? `<span style="font-size:0.7rem; font-weight:800; color:#166534; background:#dcfce7; padding:2px 8px; border-radius:999px;">✓ Installed</span>`
                  : `<span style="font-size:0.7rem; font-weight:700; color:#475569;">${topicCount} Units</span>`
              }
            </div>
            <h3 style="font-size:1rem; font-weight:800; color:#0f172a; margin:0 0 4px 0; line-height:1.35;">
              ${escapeHtml(preset.title)}
            </h3>
            <div style="font-size:0.74rem; font-weight:700; color:#475569; margin-bottom:6px;">
              ${escapeHtml(preset.authorOrMinistry)}
            </div>
            <p style="font-size:0.8rem; color:#475569; line-height:1.45; margin:0 0 10px 0;">
              ${escapeHtml(preset.description)}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:12px;">
              ${stageList
                .map(
                  (st) =>
                    `<span style="font-size:0.68rem; font-weight:700; background:#f1f5f9; color:#334155; padding:2px 7px; border-radius:5px;">${escapeHtml(st)}</span>`
                )
                .join('')}
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; padding-top:8px; border-top:1px solid #f1f5f9;">
            ${
              isInstalled
                ? `
                  <a href="${base}learning-zone?stage=${encodeURIComponent(firstStage)}" style="flex:1; text-align:center; padding:7px 10px; border-radius:7px; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.76rem; text-decoration:none;">
                    📖 Lessons
                  </a>
                  <a href="${base}practice-lab?stage=${encodeURIComponent(firstStage)}" style="flex:1; text-align:center; padding:7px 10px; border-radius:7px; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-weight:700; font-size:0.76rem; text-decoration:none;">
                    🎯 Drills
                  </a>
                  <button type="button" data-remove-pack="${escapeHtml(preset.id)}" style="padding:7px 10px; border-radius:7px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.75rem; cursor:pointer;">
                    Remove
                  </button>
                `
                : `
                  <button type="button" data-install-preset="${escapeHtml(preset.id)}" style="width:100%; padding:8px 12px; border-radius:7px; border:none; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.8rem; cursor:pointer;">
                    ⬇️ Install Offline Ministry Pack
                  </button>
                `
            }
          </div>
        </article>
      `;
    }).join('');

    if (installed.length === 0) {
      installedPacksEl.innerHTML = `
        <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:10px; padding:1.5rem; text-align:center; color:#475569; font-size:0.85rem;">
          No overseas or custom packs installed yet. Click <strong>Install Offline Ministry Pack</strong> above or upload a <code>.csv</code> / <code>.json</code> syllabus file.
        </div>
      `;
    } else {
      installedPacksEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${installed
            .map((pack) => {
              const flag = COUNTRY_FLAG_MAP[pack.countryOrRegion] || '🌍';
              const firstStage = getFirstStageTitle(pack);
              const qCount = (pack.lessons || []).reduce((acc, l) => acc + (l.questions?.length || 0), 0);
              const isTeacherBank = pack.id === 'teacher-custom-anchors';
              return `
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px 14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <strong style="font-size:0.95rem; color:#0f172a;">${flag} ${escapeHtml(pack.title)}</strong>
                        <span style="font-size:0.7rem; font-weight:800; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:1px 7px; border-radius:999px;">
                          ${escapeHtml(pack.countryOrRegion)}
                        </span>
                      </div>
                      <div style="font-size:0.78rem; color:#475569; margin-top:2px;">
                        ${escapeHtml(pack.authorOrMinistry)} &bull; <strong>${(pack.lessons || []).length}</strong> lesson(s) &bull; <strong>${qCount}</strong> diagnostic question(s)
                      </div>
                    </div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                      <a href="${base}learning-zone?stage=${encodeURIComponent(firstStage)}" style="padding:6px 11px; border-radius:7px; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.76rem; text-decoration:none;">
                        📖 Learning Zone
                      </a>
                      <a href="${base}practice-lab?stage=${encodeURIComponent(firstStage)}" style="padding:6px 11px; border-radius:7px; border:1px solid #a7f3d0; background:#ecfdf5; color:#065f46; font-weight:700; font-size:0.76rem; text-decoration:none;">
                        🎯 Practice Lab
                      </a>
                      <button type="button" data-export-pack="${escapeHtml(pack.id)}" style="padding:6px 10px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.75rem; cursor:pointer;">
                        ⬇ Export .json
                      </button>
                      <button type="button" data-remove-pack="${escapeHtml(pack.id)}" style="padding:6px 10px; border-radius:7px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.75rem; cursor:pointer;">
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                  ${
                    isTeacherBank && pack.lessons.length > 0
                      ? `
                        <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #cbd5e1; display:flex; flex-wrap:wrap; gap:6px;">
                          ${pack.lessons
                            .map(
                              (l) => `
                                <span style="display:inline-flex; align-items:center; gap:6px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:3px 8px; font-size:0.74rem; color:#0f172a; font-weight:600;">
                                  ${escapeHtml(l.stageTitle)}: ${escapeHtml(l.topicTitle)}
                                  <button type="button" data-del-anchor="${escapeHtml(l.id)}" title="Delete topic" style="border:none; background:none; color:#991b1b; font-weight:800; cursor:pointer; padding:0 2px;">✕</button>
                                </span>
                              `
                            )
                            .join('')}
                        </div>
                      `
                      : ''
                  }
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    }

    container.querySelectorAll<HTMLButtonElement>('[data-install-preset]').forEach((btn) => {
      btn.onclick = () => {
        const presetId = btn.dataset.installPreset;
        const preset = PRESET_OVERSEAS_PACKS.find((p) => p.id === presetId);
        if (!preset) return;
        saveCurriculumPack({ ...preset, installedAt: Date.now() });
        refreshCustomPacksInMesh();
        renderOverseasUI();
        setOverseasStatus(`Installed "${preset.title}" (${preset.countryOrRegion}). Ready in Learning Zone & Practice Lab.`);
      };
    });

    container.querySelectorAll<HTMLButtonElement>('[data-remove-pack]').forEach((btn) => {
      btn.onclick = () => {
        const packId = btn.dataset.removePack;
        if (!packId) return;
        removeCurriculumPack(packId);
        refreshCustomPacksInMesh();
        renderOverseasUI();
        setOverseasStatus(`Removed curriculum pack "${packId}" from local IndexedDB.`);
      };
    });

    container.querySelectorAll<HTMLButtonElement>('[data-export-pack]').forEach((btn) => {
      btn.onclick = () => {
        const packId = btn.dataset.exportPack;
        const pack = getInstalledCurriculumPacks().find((p) => p.id === packId);
        if (!pack) return;
        downloadTextFile(`${pack.id}.json`, JSON.stringify(pack, null, 2), 'application/json');
        setOverseasStatus(`Exported "${pack.title}" as ${pack.id}.json.`);
      };
    });

    container.querySelectorAll<HTMLButtonElement>('[data-del-anchor]').forEach((btn) => {
      btn.onclick = () => {
        const lessonId = btn.dataset.delAnchor;
        if (!lessonId) return;
        deleteAxiomAnchorTopic(lessonId);
        refreshCustomPacksInMesh();
        renderOverseasUI();
        setOverseasStatus(`Removed custom topic "${lessonId}" from Teacher Custom Anchor Bank.`);
      };
    });
  };

  tabBtnOverseas.onclick = () => applyStudioTab('overseas', true);
  tabBtnPackager.onclick = () => applyStudioTab('packager', true);

  btnInstallAllOverseas.onclick = () => {
    for (const preset of PRESET_OVERSEAS_PACKS) {
      saveCurriculumPack({ ...preset, installedAt: Date.now() });
    }
    refreshCustomPacksInMesh();
    renderOverseasUI();
    setOverseasStatus('Installed all 4 Overseas Ministry Packs (Kenya, India, Ghana, Philippines) into offline storage.');
  };

  btnDlSampleCsv.onclick = () => {
    downloadTextFile('sample-overseas-curriculum.csv', generateSampleCsvTemplate(), 'text/csv;charset=utf-8');
    setOverseasStatus('Downloaded starter CSV template (sample-overseas-curriculum.csv).');
  };

  btnDlSampleJson.onclick = () => {
    downloadTextFile('sample-overseas-curriculum.json', generateSampleJsonTemplate(), 'application/json');
    setOverseasStatus('Downloaded starter JSON template (sample-overseas-curriculum.json).');
  };

  const handleOverseasPackFile = async (file: File) => {
    try {
      const text = await file.text();
      const lower = file.name.toLowerCase();
      let importedPack: CustomCurriculumPack;

      if (lower.endsWith('.json')) {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || (!parsed.stages && !Array.isArray(parsed.lessons))) {
          throw new Error('JSON file must contain "stages" and/or "lessons" fields matching CustomCurriculumPack.');
        }
        const fallbackTitle = inpPackTitle.value.trim() || parsed.title || file.name.replace(/\.json$/i, '');
        importedPack = {
          id: parsed.id || `json-pack-${Date.now()}`,
          title: fallbackTitle,
          countryOrRegion: inpPackCountry.value.trim() || parsed.countryOrRegion || 'International / Custom',
          authorOrMinistry: inpPackMinistry.value.trim() || parsed.authorOrMinistry || 'Imported JSON Pack',
          description: parsed.description || 'Imported custom curriculum JSON pack.',
          version: parsed.version || '1.0.0',
          installedAt: Date.now(),
          stages: parsed.stages || {},
          lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
        };
      } else {
        const cleanName = file.name.replace(/\.csv$/i, '');
        importedPack = parseCsvToCurriculumPack(text, {
          packId: `csv-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          packTitle: inpPackTitle.value.trim() || `${cleanName} Curriculum Pack`,
          countryOrRegion: inpPackCountry.value.trim() || 'International / Regional',
          authorOrMinistry: inpPackMinistry.value.trim() || 'Ministry / School CSV Import',
        });
      }

      saveCurriculumPack(importedPack);
      refreshCustomPacksInMesh();
      renderOverseasUI();
      setOverseasStatus(
        `Imported "${importedPack.title}" (${importedPack.lessons.length} lesson(s)) — now live in Learning Zone & Practice Lab.`
      );
    } catch (err: any) {
      setOverseasStatus(`Import error: ${err?.message || err}`, true);
    }
  };

  overseasDropzone.onclick = () => inputOverseasFile.click();
  overseasDropzone.ondragover = (e) => {
    e.preventDefault();
    overseasDropzone.style.borderColor = '#0284c7';
    overseasDropzone.style.background = '#eff6ff';
  };
  overseasDropzone.ondragleave = () => {
    overseasDropzone.style.borderColor = '#64748b';
    overseasDropzone.style.background = '#f8fafc';
  };
  overseasDropzone.ondrop = async (e) => {
    e.preventDefault();
    overseasDropzone.style.borderColor = '#64748b';
    overseasDropzone.style.background = '#f8fafc';
    const file = e.dataTransfer?.files?.[0];
    if (file) await handleOverseasPackFile(file);
  };
  inputOverseasFile.onchange = async () => {
    const file = inputOverseasFile.files?.[0];
    if (file) {
      await handleOverseasPackFile(file);
      inputOverseasFile.value = '';
    }
  };

  btnSaveAnchor.onclick = () => {
    const keyStage = inpAnchorStage.value.trim();
    const subject = inpAnchorSubject.value.trim();
    const topic = inpAnchorTopic.value.trim();
    const axiom = inpAnchorAxiom.value.trim();
    const trap = inpAnchorTrap.value.trim();

    if (!keyStage || !subject || !topic || !axiom || !trap) {
      setOverseasStatus('Please complete Stage/Grade, Subject, Topic Title, Core Rule, and Common Misconception.', true);
      return;
    }

    saveAxiomAnchorTopic({ keyStage, subject, topic, axiom, trap });
    refreshCustomPacksInMesh();
    renderOverseasUI();
    inpAnchorTopic.value = '';
    inpAnchorAxiom.value = '';
    inpAnchorTrap.value = '';
    setOverseasStatus(`Saved custom topic "${topic}" (${keyStage} • ${subject}) with auto-generated diagnostic questions.`);
  };

  applyStudioTab(activeStudioTab, false);
  renderOverseasUI();
  void initCurriculumPackStore().then(() => {
    if (container.isConnected) {
      refreshCustomPacksInMesh();
      renderOverseasUI();
    }
  });

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
  const biosSvg = container.querySelector('#everyman-bios-svg') as unknown as SVGSVGElement;
  const biosSvgRoot = container.querySelector('#everyman-bios-svg-root') as unknown as SVGGElement;
  const biosCanvas = container.querySelector('#everyman-bios-canvas') as HTMLCanvasElement;
  const biosTelemetryEl = container.querySelector('#bios-telemetry-strip') as HTMLElement;
  const biosManifestEl = container.querySelector('#bios-manifest-list') as HTMLElement;
  const biosNanoPre = container.querySelector('#bios-nano-manifest-pre') as HTMLPreElement;
  const selRenderMode = container.querySelector('#sel-bios-render-mode') as HTMLSelectElement;
  const btnNanoManifest = container.querySelector('#btn-bios-nano-manifest') as HTMLButtonElement;
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
      folderBox.innerHTML = `<div style="color:#64748b;">No folder chosen yet. Click <strong>Pick School Folder</strong> or use Read-Only Folder Scan.</div>`;
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

      const preferredMode: RenderMode = (selRenderMode.value as RenderMode) || (boot.telemetry.hasEmbeddedSvg ? 'hybrid' : 'canvas');
      bios.mountCompanionSvg(biosSvgRoot, biosSvg, preferredMode);
      renderManifestRows();
      renderTelemetryAndManifest(boot.telemetry);
      stopBiosLoop = bios.startCanvasLoop(
        biosCanvas,
        (tel) => {
          renderTelemetryAndManifest(tel);
        },
        preferredMode
      );
      selRenderMode.value = getSharedRenderBoundary().getSurface(bios.surfaceId)?.renderMode || preferredMode;
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

  selRenderMode.onchange = () => {
    const mode = selRenderMode.value as RenderMode;
    executeSiteDirective({ action: 'set_render_mode', surfaceId: bios.surfaceId, mode });
  };
  btnNanoManifest.onclick = () => {
    const visible = biosNanoPre.style.display !== 'none';
    if (visible) {
      biosNanoPre.style.display = 'none';
      return;
    }
    const manifestJson = JSON.stringify(getSiteManifest(bios.surfaceId), null, 2);
    biosNanoPre.textContent = manifestJson;
    biosNanoPre.style.display = 'block';
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
