// src/pages/player/playerShellTemplate.ts
/**
 * Pure HTML Shell Template for the Interactive Media Player & Labs Launcher.
 *
 * Extracted from src/pages/media-player.ts so static layout markup stays
 * separate from postMessage routing, WebMCP transport, and DOM lifecycle logic.
 */

import type { ScenePresetOption } from '../../data/player/generatedScenes';
import {
  getRegisteredRecord,
  formatShortHash,
  CURRICULUM_AUTHORITY_NAME,
} from '../../utils/cartridgeIntegrity';
import {
  CORE_PLAYABLE_LABS,
  HIDDEN_EXTRAS_COUNT,
  buildOptionsHtml,
  buildPlayerSrc,
  escapeHtml,
  getNormalizedSubject,
  isCatholicPreset,
  type FormatFilterId,
  type SubjectFilterId,
} from './playerCatalog';

export interface PlayerShellTemplateParams {
  base: string;
  activePreset: string;
  meta: ScenePresetOption;
  isStageOpen: boolean;
  bslActive: boolean;
  isMuted: boolean;
  initialExternalSrc: string | null;
  activeSubject: SubjectFilterId;
  activeFormat: FormatFilterId;
}

export function renderPlayerShellHtml(params: PlayerShellTemplateParams): string {
  const {
    base,
    activePreset,
    meta,
    isStageOpen,
    bslActive,
    isMuted,
    initialExternalSrc,
    activeSubject,
    activeFormat,
  } = params;

  const optionsHtml = buildOptionsHtml(activePreset);
  const safeBase = escapeHtml(base);
  const safeStage = escapeHtml(meta.stage || '');
  const safeType = escapeHtml(meta.type || 'Sim');
  const safeLabel = escapeHtml(meta.label || '');
  const safePlayerSrc = isStageOpen
    ? escapeHtml(buildPlayerSrc(base, activePreset, bslActive, initialExternalSrc))
    : 'about:blank';
  const initialRecord = getRegisteredRecord(activePreset);
  const initialSealCode = initialRecord?.seal ? initialRecord.seal.slice(0, 6) : '';
  const initialSealLabel = initialRecord
    ? `🛡️ St Joseph's Curriculum • ${initialSealCode}`
    : '◈ Custom / External';
  const initialSealTitle = initialRecord
    ? `Verified St Joseph's Curriculum Cartridge (${initialRecord.title}) • Authority: ${CURRICULUM_AUTHORITY_NAME} • Seal: ${formatShortHash(initialRecord.seal)} — Click to view SHA-256 digests`
    : 'Custom, imported, or documentation cartridge — Click to inspect SHA-256 provenance';

  return `
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <a href="${safeBase}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <button type="button" id="player-breadcrumb-labs" style="background:none; border:none; padding:0; font-size:0.84rem; color:#0284c7; font-weight:700; cursor:${isStageOpen ? 'pointer' : 'default'};">
          🔬 Interactive Labs
        </button>
        <span id="player-breadcrumb-sep" style="display:${isStageOpen ? 'inline' : 'none'}; color:#cbd5e1;">/</span>
        <span id="player-breadcrumb-active" style="display:${isStageOpen ? 'inline' : 'none'}; font-size:0.84rem; color:#0f172a; font-weight:700;">
          ${safeLabel}
        </span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${safeBase}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${safeBase}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⚡ Practice Lab
        </a>
      </div>
    </div>

    <!-- Main Interactive Stage Frame (Mounted on demand when a lab is launched or deep-linked) -->
    <div id="player-stage-shell" style="display:${isStageOpen ? 'block' : 'none'}; background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35); margin-bottom:2rem;">
      <!-- Stage Toolbar: Row 1 (Header & Primary Simulation Controls) -->
      <div style="padding:10px 18px; background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; min-height:48px; box-sizing:border-box; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <button
            type="button"
            id="player-btn-back-to-grid"
            title="Close activity and return to the Interactive Labs grid"
            style="padding:5px 11px; border-radius:7px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; font-size:0.76rem; font-weight:800; cursor:pointer; white-space:nowrap; flex-shrink:0; min-height:28px;">
            &larr; All Labs
          </button>
          <div style="min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span id="player-active-stage-badge" style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:9999px; background:#0369a1; color:#ffffff; letter-spacing:0.04em; white-space:nowrap;">
                ${safeStage}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace; white-space:nowrap;">
                ${safeType}
              </span>
              <button
                type="button"
                id="player-integrity-badge"
                title="${escapeHtml(initialSealTitle)}"
                style="font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:4px; background:${initialRecord ? 'rgba(16,185,129,0.16)' : 'rgba(148,163,184,0.16)'}; color:${initialRecord ? '#34d399' : '#cbd5e1'}; border:1px solid ${initialRecord ? 'rgba(16,185,129,0.45)' : 'rgba(148,163,184,0.4)'}; font-family:monospace; white-space:nowrap; cursor:pointer; line-height:1.3;">
                ${escapeHtml(initialSealLabel)}
              </button>
            </div>
            <h2 id="player-active-title" style="font-size:1.1rem; font-weight:800; color:#f8fafc; margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${safeLabel}
            </h2>
          </div>
        </div>

        <!-- Primary Execution Actions (Locked Dimensions to Eliminate Any Layout Shift) -->
        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap;">
          <button type="button" id="player-btn-play" style="padding:5px 14px; border-radius:6px; background:#16a34a; color:#ffffff; border:1px solid #22c55e; font-size:0.78rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; white-space:nowrap; min-height:28px;" title="Play / Pause activity (Spacebar)">
            <span id="player-play-icon">▶</span>
            <span id="player-play-text">Play</span>
          </button>
          <button type="button" id="player-btn-reset" style="padding:5px 12px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px;" title="Reset activity to starting position">
            ↺ Reset
          </button>
          <button type="button" id="player-btn-mute" style="padding:5px 12px; border-radius:6px; background:${isMuted ? '#451a03' : '#1e293b'}; color:#ffffff; border:1px solid ${isMuted ? '#d97706' : '#334155'}; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;" title="Mute / Unmute simulation audio and voice narration (M)">
            <span id="player-mute-icon">${isMuted ? '🔇' : '🔊'}</span>
            <span id="player-mute-text">${isMuted ? 'Muted' : 'Audio ON'}</span>
          </button>
          <button type="button" id="player-btn-bsl" style="padding:5px 12px; border-radius:6px; background:${bslActive ? '#0284c7' : '#1e293b'}; color:#ffffff; border:1px solid ${bslActive ? '#38bdf8' : '#334155'}; font-size:0.78rem; font-weight:700; cursor:pointer; width:142px; text-align:center; flex-shrink:0; min-height:28px;" title="Toggle British Sign Language In-Vision Interpreter (Shift+B)">
            🖐️ BSL Signing: ${bslActive ? 'ON' : 'OFF'}
          </button>
          <button type="button" id="player-btn-fullscreen" style="padding:5px 12px; border-radius:6px; background:#0284c7; color:#ffffff; border:none; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap; min-height:28px;" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- Collapsible Cryptographic Cartridge Provenance & SHA-256 Readout -->
      <div id="player-integrity-readout" style="display:none; padding:8px 18px; background:#07101f; border-bottom:1px solid #1e293b; font-size:0.73rem; color:#cbd5e1; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div id="player-integrity-readout-body" style="display:flex; align-items:center; flex-wrap:wrap; gap:12px;"></div>
        <button type="button" id="player-integrity-readout-close" style="background:transparent; border:1px solid #334155; color:#94a3b8; border-radius:4px; padding:1px 7px; font-size:0.7rem; cursor:pointer;">Close &times;</button>
      </div>

      <!-- Stage Toolbar: Row 2 (Activity Selector, Pupil Study Tools & Collapsible Teacher Tools) -->
      <div style="padding:8px 18px; background:#0b1120; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; gap:10px; min-height:42px; box-sizing:border-box; overflow-x:auto; flex-wrap:wrap;">
        <div style="display:inline-flex; align-items:center; gap:6px; flex-shrink:0;">
          <label for="player-sim-selector" style="font-size:0.76rem; font-weight:800; color:#94a3b8; white-space:nowrap;">
            📚 Activity:
          </label>
          <select id="player-sim-selector" style="padding:4px 10px; border-radius:6px; background:#0f172a; color:#ffffff; border:1px solid #0284c7; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none; max-width:280px;">
            ${optionsHtml}
          </select>
        </div>

        <div style="display:inline-flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap;">
          <button type="button" id="player-btn-ai-tutor" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#c084fc; border:1px solid #9333ea; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Ask your on-device study tutor for hints, worked steps, and explanations">
            🤖 Ask Nano
          </button>

          <button type="button" id="player-btn-lab-drawer" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Adjust activity sliders, values, and experiment controls">
            🎛️ Lab Controls
          </button>

          <button type="button" id="player-btn-remix-code" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#86efac; border:1px solid #16a34a; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Open Code &amp; Remix Studio: inspect SVG shapes, edit AST/SlideScript, auto-match IDs, and Save As a new file">
            💻 Remix &amp; Code
          </button>

          <button type="button" id="player-btn-log-csv" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Save your lab results table to your local Jotter • Shift+Click to download as CSV">
            📊 Save Results to Jotter
          </button>

          <button type="button" id="player-btn-teacher-tools" aria-expanded="false" style="padding:4px 10px; border-radius:6px; background:#0f172a; color:#94a3b8; border:1px solid #334155; font-size:0.74rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Show or hide teacher &amp; technical authoring tools">
            🧰 Teacher Tools ▾
          </button>

          <div id="player-teacher-tools-group" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; padding-left:6px; border-left:1px solid #334155;">
            <button type="button" id="player-btn-open" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Open local activity files or import a PhET / HTML simulation">
              📂 Import Activity
            </button>
            <input type="file" id="media-player-file-input" accept=".ast,.svg,.json,.html,.phet" multiple style="display:none;" />

            <button type="button" id="player-btn-embed" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#34d399; border:1px solid #059669; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Get Responsive LMS Embed Snippet (Canvas, Moodle, Google Classroom)">
              🔗 Embed in Class
            </button>

            <button type="button" id="player-btn-export-airgap" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#fde047; border:1px solid #ca8a04; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Save a standalone single-file HTML lesson that runs completely offline">
              💾 Offline HTML
            </button>

            <button type="button" id="player-btn-diagnostics" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#4ade80; border:1px solid #16a34a; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Inspect Engine Telemetry, FPS, 16.6ms Budget &amp; Vector HUD">
              ⚡ Diagnostics
            </button>
          </div>
        </div>
      </div>

      <!-- In-Page Drawer & Modal Mount Point -->
      <div id="player-drawer-mount-point" style="display:none; background:#0f172a; border-bottom:1px solid #334155;"></div>

      <!-- Live Stage iFrame -->
      <div id="player-iframe-wrapper" style="position:relative; width:100%; height:540px; background:#000000;">
        <iframe
          id="ast-player-iframe"
          src="${safePlayerSrc}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Catholic Sanctuary Linkage Banner -->
    <div id="catholic-sanctuary-banner" style="display:${isStageOpen && isCatholicPreset(meta) ? 'flex' : 'none'}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">✝️</span>
        <div>
          <span style="font-size:0.86rem; color:#fde047; font-weight:800;">St Joseph's Catholic Sanctuary:</span>
          <span style="font-size:0.82rem; color:#cbd5e1; margin-left:4px;">This simulation is part of our Catholic faith formation and sacred liturgical curriculum.</span>
        </div>
      </div>
      <a href="${base}catholic-life?tab=altar-anatomy" style="padding:5px 12px; border-radius:6px; background:#ca8a04; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem;">
        Open High Altar &amp; Latin Chapel &rarr;
      </a>
    </div>

    <!-- Interactive Labs Grid Launcher & Multi-Facet Filter -->
    <section id="labs-catalog-section" style="display:${isStageOpen ? 'none' : 'block'}; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.35rem; margin-bottom:1.75rem; box-shadow:0 4px 18px rgba(15,23,42,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
        <div>
          <h1 style="margin:0; font-size:1.35rem; font-weight:800; color:#0f172a; letter-spacing:-0.01em;">Interactive Labs &amp; Lessons</h1>
          <p id="catalog-results-summary" style="margin:3px 0 0; font-size:0.82rem; color:#64748b; font-variant-numeric:tabular-nums;">
            Select any verified cartridge to launch the interactive stage
          </p>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search by title, topic, stage, or ID (e.g. titration, altar, ks2)..."
            style="padding:7px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.84rem; min-width:260px; outline:none; color:#0f172a; background:#ffffff;"
          />
          <select id="stage-filter-select" aria-label="Filter by Key Stage" style="padding:7px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.82rem; font-weight:600; color:#334155; background:#f8fafc; cursor:pointer;">
            <option value="All">All Key Stages</option>
            <option value="KS1">EYFS &amp; KS1</option>
            <option value="KS2">Key Stage 2</option>
            <option value="KS3">Key Stage 3</option>
            <option value="KS4">KS4 / GCSE &amp; A-Level</option>
          </select>
          <button type="button" id="launcher-btn-import" style="padding:7px 12px; border-radius:8px; border:1px solid #0284c7; background:#f0f9ff; color:#0369a1; font-size:0.8rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Open local .ast / .svg cartridge or import a PhET / HTML simulation">
            📂 Open File
          </button>
          <button type="button" id="btn-clear-catalog-filters" style="display:none; padding:7px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#475569; font-size:0.8rem; font-weight:600; cursor:pointer; white-space:nowrap;">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Subject Tabs -->
      <div style="display:flex; gap:4px; flex-wrap:wrap; padding:4px; background:#f1f5f9; border-radius:10px; margin-bottom:10px;" id="subject-filter-buttons">
        ${([
          { id: 'All', label: 'All Labs' },
          { id: 'Science', label: 'Science' },
          { id: 'Maths', label: 'Mathematics' },
          { id: 'Catholic', label: 'Catholic Faith' },
          { id: 'English', label: 'English & Phonics' },
          { id: 'Computing', label: 'Computing & D&T' },
          { id: 'Languages', label: 'Languages & BSL' },
          { id: 'Geography', label: 'Geography' },
        ] as { id: SubjectFilterId; label: string }[]).map((cat) => {
          const count = cat.id === 'All'
            ? CORE_PLAYABLE_LABS.length
            : CORE_PLAYABLE_LABS.filter((p) => getNormalizedSubject(p) === cat.id).length;
          const isAct = cat.id === activeSubject;
          return `
            <button type="button" class="cat-pill-btn" data-cat="${cat.id}" style="padding:6px 12px; border-radius:7px; font-size:0.8rem; font-weight:700; cursor:pointer; border:none; white-space:nowrap; font-variant-numeric:tabular-nums; background:${isAct ? '#ffffff' : 'transparent'}; color:${isAct ? '#0f172a' : '#475569'}; box-shadow:${isAct ? '0 1px 3px rgba(15,23,42,0.1)' : 'none'};">
              ${cat.label} <span style="opacity:0.65; font-weight:600;">(${count})</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Format & Scope Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:12px; margin-bottom:12px; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;" id="format-filter-buttons">
          <span style="font-size:0.76rem; font-weight:700; color:#64748b; margin-right:2px;">Format:</span>
          ${([
            { id: 'All', label: 'All Formats' },
            { id: 'Sim', label: 'Interactive Labs (Sim)' },
            { id: 'Slide', label: 'Guided Lessons (Slide)' },
            { id: 'App', label: 'Games & Studios (App)' },
            { id: 'Film', label: 'Films' },
            { id: '3D', label: '3D Models' },
          ] as { id: FormatFilterId; label: string }[]).map((fmt) => {
            const isAct = fmt.id === activeFormat;
            return `
              <button type="button" class="format-filter-btn" data-format="${fmt.id}" style="padding:4px 10px; border-radius:6px; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap; border:1px solid ${isAct ? '#0284c7' : '#e2e8f0'}; background:${isAct ? '#e0f2fe' : '#f8fafc'}; color:${isAct ? '#0369a1' : '#475569'};">
                ${fmt.label}
              </button>
            `;
          }).join('')}
        </div>

        <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.78rem; color:#475569; font-weight:600; cursor:pointer; user-select:none;" title="Recall data packs belong primarily in Practice Lab and Revision Suite">
          <input type="checkbox" id="toggle-include-nonmedia" style="cursor:pointer; accent-color:#0284c7;" />
          <span>Include recall data packs, benchmarks &amp; docs (${HIDDEN_EXTRAS_COUNT})</span>
        </label>
      </div>

      <!-- Recent Quick-Switch Strip -->
      <div id="recent-labs-strip" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; font-size:0.78rem;"></div>

      <!-- Subject Breakdown Grid Container (Full-page launcher grouped by curriculum subject) -->
      <div id="cartridges-grid" style="display:flex; flex-direction:column; gap:18px;">
      </div>
    </section>

    <!-- Classroom Offline Guarantee Card -->
    <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:1.25rem 1.5rem; color:#cbd5e1; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.5rem;">🏫</span>
        <div>
          <strong style="color:#38bdf8; display:block;">100% Offline Classroom Lab</strong>
          <span>Works without internet, saves results privately to your device, and includes British Sign Language &amp; smartboard annotation.</span>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <a href="${base}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Portal Updates &amp; Notes &rarr;</a>
      </div>
    </div>
  `;
}
