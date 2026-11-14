import { getBaseUrl } from '../utils/url';
import { getLocalState, setLocalState } from '../services/localStateStore';
import { PRESET_OPTIONS, ScenePresetOption } from '../data/player/generatedScenes';
import {
  saveCustomCartridge,
  getCustomCartridges,
  inflateCartridgeToVault,
  type CartridgeDefinition,
} from '../services/cartridgeStore';
import { isPhetBundle, transpilePhetFile, PHET_BUILTIN_MODELS, type SupportedPhetPreset } from '../utils/phetBridge';
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
import {
  renderPlayerEmbedModal,
  renderNanoAiTutorDrawer,
  renderAstInteractiveLabDrawer,
  renderEppDiagnosticsDrawer,
} from '../components/player';
import type { PlayerTelemetryEvent } from '../engine/aicaller';
import {
  registerWebMcpTools,
  type PlayerMcpTransport,
  type WebMcpRegistrationHandle,
} from '../engine/webmcpBridge';
import {
  type EppBenchTransport,
  type ProfilerCaptureResult,
} from '../engine/eppContentionBench';
import { exportAirgapHtmlBundle } from '../utils/exportAirgapHtmlBundle';
import { appendLabCsvToJotter } from '../services/jotter-db';
import { type PlayerDisplayMode } from '../types/playerConfig';

const DEFAULT_PRESET_ID = 'kinetic-gas';
const EXTRA_DOC_PRESETS: ScenePresetOption[] = [
  {
    id: 'lumina-architecture',
    label: 'Lumina: Sovereign Architectural Manifesto (4-Chapter Show & Tell)',
    type: 'Slide',
    stage: 'FOUNDATIONAL SYSTEM ARCHITECTURE',
    subject: 'System Architecture',
    section: 'System Architecture & Docs',
  },
];
const ALL_BUILTIN_PRESETS: ScenePresetOption[] = [...PRESET_OPTIONS, ...EXTRA_DOC_PRESETS];
const VALID_PRESET_IDS = new Set(ALL_BUILTIN_PRESETS.map((p) => p.id));

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePresetId(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_PRESET_ID;
  if (raw === 'lumina-architecture-manifesto') return 'lumina-architecture';
  if (VALID_PRESET_IDS.has(raw)) return raw;
  try {
    const custom = getCustomCartridges();
    if (custom.some((c) => c.id === raw)) return raw;
  } catch (_) {}
  return DEFAULT_PRESET_ID;
}

function buildPlayerSrc(base: string, presetId: string, bslActive: boolean, externalSrc?: string | null): string {
  const perfHud = getLocalState('app_perf_hud_enabled') === 'true';
  const verbosity = getLocalState('app_hud_verbosity') || 'minimal';
  const budgetAlert = getLocalState('app_frame_budget_alert') === 'true';

  const params = new URLSearchParams({
    bsl: bslActive ? '1' : '0',
    mode: 'suite',
    tools: '1',
    all: '1',
  });
  if (externalSrc) {
    params.set('src', externalSrc);
  } else {
    params.set('preset', presetId);
  }

  if (perfHud) {
    params.set('hud', '1');
    params.set('hud_verbosity', verbosity);
    if (budgetAlert) params.set('budget_alert', '1');
  }

  return `${base}player.html?${params.toString()}`;
}

export function renderPlayerPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'ast-media-player-container';
  container.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;';

  // Read initial preset or external ?src= from URL
  const params = new URLSearchParams(window.location.search);
  const initialSrcParam = params.get('src') || params.get('file');
  const resolvedInitialPreset = !params.get('preset') && initialSrcParam && initialSrcParam.includes('lumina-architecture')
    ? 'lumina-architecture'
    : normalizePresetId(params.get('preset'));
  let activePreset = resolvedInitialPreset;
  let initialExternalSrc = params.get('preset') ? null : initialSrcParam;
  let activeCategory = 'All';
  let searchQuery = '';
  let bslActive = getBslEnabled() || params.get('bsl') === '1';
  let isMuted = !getVoiceEnabled();

  // Ensure presets are loaded from generatedScenes + architectural Show & Tell docs
  const presets: ScenePresetOption[] = ALL_BUILTIN_PRESETS.length > EXTRA_DOC_PRESETS.length
    ? ALL_BUILTIN_PRESETS
    : [
        { id: 'kinetic-gas', label: 'Kinetic Gas Theory & Thermodynamics', type: 'Sim', stage: 'KS3/KS4 PHYSICS' },
        { id: 'pythagoras', label: "Pythagoras' Theorem (a² + b² = c²)", type: 'Sim', stage: 'KS3/KS4 MATHEMATICS' },
        { id: 'fractions', label: 'Fractions: Why Common Denominators Rule', type: 'Slide', stage: 'KEY STAGE 2' },
        { id: 'electric-circuits', label: 'Electrical Circuits & Ohm’s Law', type: 'Sim', stage: 'KEY STAGE 3' },
        { id: 'solar-system', label: 'Solar System: Heliocentric Planetary Motion', type: 'Sim', stage: 'KEY STAGE 2/3' },
        { id: 'algebra-balance', label: 'Algebraic Balance Scale', type: 'Sim', stage: 'KEY STAGE 3' },
        { id: 'church-tour', label: 'The Catholic Church Sanctuary & Altar', type: 'Slide', stage: 'WHOLE SCHOOL RE' },
        { id: 'phonics-lab', label: 'EYFS Phonics Sound Mat & Digraphs', type: 'App', stage: 'EYFS / KS1' },
        ...EXTRA_DOC_PRESETS,
      ];

  function isDocPreset(p: ScenePresetOption): boolean {
    return p.id === 'lumina-architecture' || p.subject === 'System Architecture';
  }

  function isCatholicPreset(p: ScenePresetOption): boolean {
    return (
      !isDocPreset(p) && (
        p.stage === 'CATHOLIC LIFE' ||
        p.subject === 'Religious Education' ||
        (p.section && p.section.includes('Catholic')) ||
        ['church-tour', 'altar-anatomy', 'holy-oils', 'holy-water-thurifer', 'latin-mass-prayers', 'catholic-rites', 'order-of-the-mass', 'stations-of-the-cross', 'first-communion', 'liturgical-calendar', 'liturgical-postures', 'liturgy-of-the-hours', 'triduum-easter'].includes(p.id)
      )
    );
  }

  function isStemPreset(p: ScenePresetOption): boolean {
    return !isDocPreset(p) && !isCatholicPreset(p) && (p.subject === 'Science' || (p.stage && p.stage.includes('PHYSICS')) || ['kinetic-gas', 'electric-circuits', 'solar-system', 'photosynthesis', 'atom', 'velocity', 'dna-helix'].includes(p.id));
  }

  function isMathPreset(p: ScenePresetOption): boolean {
    return !isDocPreset(p) && !isCatholicPreset(p) && (p.subject === 'Mathematics' || ['pythagoras', 'fractions', 'algebra-balance', 'calculus-curves', 'bodmas', 'times-tables'].includes(p.id));
  }

  function isOtherPreset(p: ScenePresetOption): boolean {
    return !isDocPreset(p) && !isCatholicPreset(p) && !isStemPreset(p) && !isMathPreset(p);
  }

  function getCustomCartridgesList(): CartridgeDefinition[] {
    try {
      const custom = getCustomCartridges();
      return custom.filter((c) => !VALID_PRESET_IDS.has(c.id));
    } catch (_) {
      return [];
    }
  }

  function getPresetMeta(id: string): ScenePresetOption {
    const found = presets.find((p) => p.id === id);
    if (found) return found;
    try {
      const custom = getCustomCartridges().find((c) => c.id === id);
      if (custom) {
        return {
          id: custom.id,
          label: custom.title,
          stage: custom.stage || 'LOCAL VAULT',
          type: (custom.type as any) || 'Sim',
          subject: custom.subject || 'Custom Ingestion',
        };
      }
    } catch (_) {}
    return presets[0];
  }

  // Build options for select dropdown
  const catholicGroup = presets.filter(isCatholicPreset);
  const stemGroup = presets.filter(isStemPreset);
  const mathGroup = presets.filter(isMathPreset);
  const otherGroup = presets.filter(isOtherPreset);
  const docGroup = presets.filter(isDocPreset);

  function buildOptionsHtml(selectedId: string): string {
    const customList = getCustomCartridgesList();
    const customGroupHtml = customList.length > 0 ? `
      <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
        ${customList.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? 'selected' : ''}>${escapeHtml(c.title)} (${escapeHtml(c.stage || 'LOCAL')})</option>`).join('')}
      </optgroup>
    ` : '';

    return `
      ${customGroupHtml}
      <optgroup label="✝️ Catholic Sanctuary &amp; Liturgy" style="background:#0f172a; color:#fde047;">
        ${catholicGroup.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.label)} (${escapeHtml(p.stage)})</option>`).join('')}
      </optgroup>
      <optgroup label="🔬 STEM &amp; Natural Sciences" style="background:#0f172a; color:#38bdf8;">
        ${stemGroup.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.label)} (${escapeHtml(p.stage)})</option>`).join('')}
      </optgroup>
      <optgroup label="📐 Mathematics &amp; Logic" style="background:#0f172a; color:#34d399;">
        ${mathGroup.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.label)} (${escapeHtml(p.stage)})</option>`).join('')}
      </optgroup>
      <optgroup label="🔤 EYFS, Languages &amp; Computing" style="background:#0f172a; color:#fbbf24;">
        ${otherGroup.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.label)} (${escapeHtml(p.stage)})</option>`).join('')}
      </optgroup>
      <optgroup label="📖 System Architecture &amp; Docs" style="background:#0f172a; color:#e2e8f0;">
        ${docGroup.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.label)} (${escapeHtml(p.stage)})</option>`).join('')}
      </optgroup>
      <optgroup label="⚛️ PhET Ingestion &amp; Distillations" style="background:#0f172a; color:#38bdf8;">
        <option value="phet-ohms-law" ${selectedId === 'phet-ohms-law' ? 'selected' : ''}>⚛️ PhET: Ohm's Law (V = I × R)</option>
        <option value="phet-faraday" ${selectedId === 'phet-faraday' ? 'selected' : ''}>⚛️ PhET: Faraday's Induction (EMF)</option>
        <option value="phet-pendulum" ${selectedId === 'phet-pendulum' ? 'selected' : ''}>⚛️ PhET: Pendulum Laboratory</option>
        <option value="phet-acid-base" ${selectedId === 'phet-acid-base' ? 'selected' : ''}>⚛️ PhET: Acid-Base pH Solutions</option>
        <option value="phet-balancing-chemical" ${selectedId === 'phet-balancing-chemical' ? 'selected' : ''}>⚛️ PhET: Balancing Chemical Equations</option>
        <option value="__open_local__">📥 Ingest Local PhET (.html / .phet) or SWF...</option>
      </optgroup>
      <optgroup label="⚡ Dynamic Auto-Finder" style="background:#0f172a; color:#94a3b8;">
        <option value="__custom_find__">🔍 Open Any Scene by Name / ID...</option>
      </optgroup>
    `;
  }

  const optionsHtml = buildOptionsHtml(activePreset);

  const meta = getPresetMeta(activePreset);
  const safeBase = escapeHtml(base);
  const safeStage = escapeHtml(meta.stage || '');
  const safeType = escapeHtml(meta.type || 'Sim');
  const safeLabel = escapeHtml(meta.label || '');
  const safePlayerSrc = escapeHtml(buildPlayerSrc(base, activePreset, bslActive, initialExternalSrc));

  container.innerHTML = `
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${safeBase}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎬 AST Vector Player &amp; Simulator</span>
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

    <!-- Main Interactive Stage Frame -->
    <div style="background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35); margin-bottom:2rem;">
      <!-- Stage Toolbar: Row 1 (Header & Primary Simulation Controls) -->
      <div style="padding:10px 18px; background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; min-height:48px; box-sizing:border-box; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <span style="font-size:1.3rem; flex-shrink:0;">🎮</span>
          <div style="min-width:0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span id="player-active-stage-badge" style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:9999px; background:#0369a1; color:#ffffff; letter-spacing:0.04em; white-space:nowrap;">
                ${safeStage}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace; white-space:nowrap;">
                ${safeType}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem; white-space:nowrap;" class="hidden sm:inline">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.1rem; font-weight:800; color:#f8fafc; margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${safeLabel}
            </h2>
          </div>
        </div>

        <!-- Primary Execution Actions (Locked Dimensions to Eliminate Any Layout Shift) -->
        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap;">
          <button type="button" id="player-btn-play" style="padding:5px 14px; border-radius:6px; background:#16a34a; color:#ffffff; border:1px solid #22c55e; font-size:0.78rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; white-space:nowrap; min-height:28px;" title="Play / Pause simulation loop (Spacebar)">
            <span id="player-play-icon">▶</span>
            <span id="player-play-text">Play</span>
          </button>
          <button type="button" id="player-btn-reset" style="padding:5px 12px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px;" title="Reset Simulation apparatus to initial conditions">
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

      <!-- Stage Toolbar: Row 2 (Cartridge Selector & Authoring / LMS Tools) -->
      <div style="padding:8px 18px; background:#0b1120; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; gap:10px; min-height:42px; box-sizing:border-box; overflow-x:auto; flex-wrap:nowrap;">
        <div style="display:inline-flex; align-items:center; gap:6px; flex-shrink:0;">
          <label for="player-sim-selector" style="font-size:0.76rem; font-weight:800; color:#94a3b8; white-space:nowrap;">
            🎮 Cartridge:
          </label>
          <select id="player-sim-selector" style="padding:4px 10px; border-radius:6px; background:#0f172a; color:#ffffff; border:1px solid #0284c7; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none; max-width:280px;">
            ${optionsHtml}
          </select>
        </div>

        <div style="display:inline-flex; align-items:center; gap:8px; flex-shrink:0;">
          <button type="button" id="player-btn-ai-tutor" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#c084fc; border:1px solid #9333ea; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Ask Gemini Nano / Socratic Co-Pilot about misconceptions and simulation physics">
            🤖 Ask Nano
          </button>

          <button type="button" id="player-btn-lab-drawer" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Adjust simulation physical invariants and mathematical parameters">
            🎛️ Lab Drawer
          </button>

          <button type="button" id="player-btn-diagnostics" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#4ade80; border:1px solid #16a34a; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Inspect Engine Telemetry, FPS, 16.6ms Budget &amp; Vector HUD">
            ⚡ Diagnostics
          </button>

          <button type="button" id="player-btn-log-csv" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Save sampled (t, vars, computed) lab table to local IndexedDB Jotter • Shift+Click to also download .csv">
            📊 Log Data to Jotter (CSV)
          </button>

          <button type="button" id="player-btn-open" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Transpile &amp; Ingest PhET Simulation (*.html, *.phet), Flash SWF, or AST Cartridge">
            ⚛️ PhET / Ingest
          </button>
          <input type="file" id="media-player-file-input" accept=".ast,.svg,.json,.html,.phet" multiple style="display:none;" />

          <button type="button" id="player-btn-embed" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#34d399; border:1px solid #059669; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Get Responsive LMS Embed Snippet (Canvas, Moodle, Google Classroom)">
            🚀 Embed
          </button>

          <button type="button" id="player-btn-export-airgap" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#fde047; border:1px solid #ca8a04; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Export Standalone Single-File HTML Lesson Capsule (&lt; 45 KB)">
            📦 Airgap HTML
          </button>
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
    <div id="catholic-sanctuary-banner" style="display:${isCatholicPreset(meta) ? 'flex' : 'none'}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
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

    <!-- Category Filter Tabs & Search -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="category-filter-buttons">
          ${[
            { id: 'All', label: '🌟 All (' + presets.length + ')' },
            { id: 'Catholic', label: '✝️ Catholic Faith (' + catholicGroup.length + ')' },
            { id: 'STEM', label: '🔬 STEM Sciences (' + stemGroup.length + ')' },
            { id: 'Maths', label: '📐 Mathematics (' + mathGroup.length + ')' },
            { id: 'EYFS', label: '🔤 EYFS & Languages (' + otherGroup.length + ')' },
          ].map(cat => `
            <button type="button" class="cat-pill-btn" data-cat="${cat.id}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${cat.id === activeCategory ? '#0284c7' : '#cbd5e1'}; background:${cat.id === activeCategory ? '#0284c7' : '#f8fafc'}; color:${cat.id === activeCategory ? '#ffffff' : '#475569'};">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search cartridges (e.g. Altar, Pythagoras, circuits)..."
            style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.84rem; min-width:260px; outline:none;"
          />
        </div>
      </div>

      <!-- Presets Grid Container -->
      <div id="cartridges-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:480px; overflow-y:auto; padding-right:4px;">
      </div>
    </div>

    <!-- Offline Architecture Invariant Badge -->
    <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:1.25rem 1.5rem; color:#cbd5e1; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.5rem;">⚡</span>
        <div>
          <strong style="color:#38bdf8; display:block;">Zero-Bloat Vector Architecture</strong>
          <span>Sub-15ms cold start, &lt;35 KB gzipped engine, and 100% offline operational execution.</span>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <a href="${base}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Architecture Notes &rarr;</a>
      </div>
    </div>
  `;

  // Attach DOM Listeners
  const iframe = container.querySelector<HTMLIFrameElement>('#ast-player-iframe')!;
  const select = container.querySelector<HTMLSelectElement>('#player-sim-selector')!;
  const titleEl = container.querySelector<HTMLElement>('#player-active-title')!;
  const stageBadgeEl = container.querySelector<HTMLElement>('#player-active-stage-badge')!;
  const typeBadgeEl = container.querySelector<HTMLElement>('#player-active-type-badge')!;
  const playBtn = container.querySelector<HTMLButtonElement>('#player-btn-play');
  const playIcon = container.querySelector<HTMLElement>('#player-play-icon');
  const playText = container.querySelector<HTMLElement>('#player-play-text');
  const resetBtn = container.querySelector<HTMLButtonElement>('#player-btn-reset');
  const muteBtn = container.querySelector<HTMLButtonElement>('#player-btn-mute');
  const bslBtn = container.querySelector<HTMLButtonElement>('#player-btn-bsl');
  const aiTutorBtn = container.querySelector<HTMLButtonElement>('#player-btn-ai-tutor');
  const labDrawerBtn = container.querySelector<HTMLButtonElement>('#player-btn-lab-drawer');
  const diagnosticsBtn = container.querySelector<HTMLButtonElement>('#player-btn-diagnostics');
  const logCsvBtn = container.querySelector<HTMLButtonElement>('#player-btn-log-csv');
  const openBtn = container.querySelector<HTMLButtonElement>('#player-btn-open')!;
  const embedBtn = container.querySelector<HTMLButtonElement>('#player-btn-embed');
  const exportAirgapBtn = container.querySelector<HTMLButtonElement>('#player-btn-export-airgap');
  const drawerMount = container.querySelector<HTMLDivElement>('#player-drawer-mount-point');
  const fileInputHidden = container.querySelector<HTMLInputElement>('#media-player-file-input')!;
  const fullscreenBtn = container.querySelector<HTMLButtonElement>('#player-btn-fullscreen')!;
  const searchInput = container.querySelector<HTMLInputElement>('#cartridge-search-input')!;
  const gridContainer = container.querySelector<HTMLDivElement>('#cartridges-grid')!;
  const catButtons = container.querySelectorAll<HTMLButtonElement>('.cat-pill-btn');
  const iframeWrapper = container.querySelector<HTMLDivElement>('#player-iframe-wrapper')!;

  // Strict Typed postMessage Protocol between Host Chassis & Unified Cartridge Player Kernel
  type HostToPlayerMessage =
    | { type: 'SET_PRESET'; preset: string; play?: boolean }
    | { type: 'LOAD_CUSTOM_CARTRIDGE'; cartridge: CartridgeDefinition }
    | { type: 'DISPATCH_ACTION'; action: string; args?: any[] }
    | { type: 'SET_VAR'; name: string; value: any }
    | { type: 'SET_VOICE'; enabled: boolean }
    | { type: 'SET_MUTED'; muted: boolean }
    | { type: 'SET_BSL'; enabled: boolean }
    | { type: 'TOGGLE_BSL' }
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

  const webMcpHandle: WebMcpRegistrationHandle = registerWebMcpTools(mcpTransport);
  window.addEventListener(
    'pagehide',
    () => {
      webMcpHandle.unregister();
    },
    { once: true }
  );

  const benchTransport: EppBenchTransport = {
    startProfCapture: async () => {
      await postToPlayerWithAck<any>(
        { type: 'START_PROF_CAPTURE', ensurePlaying: true },
        'PROF_CAPTURE_STARTED'
      );
    },
    stopProfCapture: async (): Promise<ProfilerCaptureResult> => {
      const res = await postToPlayerWithAck<any>(
        { type: 'STOP_PROF_CAPTURE' },
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

  let activeDrawer: 'embed' | 'ai-tutor' | 'lab' | 'diagnostics' | null = null;
  let latestTelemetry: PlayerTelemetryEvent | null = null;
  let embedTargetMode: PlayerDisplayMode = 'classroom';
  let copiedEmbed = false;
  let mountedDiagnosticsEl: HTMLElement | null = null;
  let mountedDiagnosticsPreset = '';

  function renderActiveDrawer(forceRebuildDiagnostics = false) {
    if (!drawerMount) return;

    // Preserve interactive diagnostics DOM and live benchmark state across telemetry ticks
    if (
      activeDrawer === 'diagnostics' &&
      !forceRebuildDiagnostics &&
      mountedDiagnosticsEl &&
      mountedDiagnosticsEl.isConnected &&
      mountedDiagnosticsPreset === activePreset
    ) {
      return;
    }

    drawerMount.innerHTML = '';
    if (activeDrawer !== 'diagnostics') {
      mountedDiagnosticsEl = null;
      mountedDiagnosticsPreset = '';
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
      });
      if (drawerEl) drawerMount.appendChild(drawerEl);
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
    }
  }

  function refreshDropdown() {
    if (select) {
      select.innerHTML = buildOptionsHtml(activePreset);
      select.value = activePreset;
    }
  }

  function getAllAvailablePresets(): ScenePresetOption[] {
    const customList = getCustomCartridgesList().map((c) => ({
      id: c.id,
      label: c.title,
      stage: c.stage || 'LOCAL VAULT',
      type: (c.type as any) || 'Sim',
      subject: c.subject || 'Custom Ingested',
    }));
    return [...customList, ...presets];
  }

  let isIframeReady = false;
  iframe?.addEventListener('load', () => {
    isIframeReady = true;
  });

  function updatePreset(presetId: string, skipPostMessage = false) {
    if (presetId === '__custom_find__' || presetId === '__open_local__') return;
    const safePresetId = normalizePresetId(presetId);
    activePreset = safePresetId;
    const item = getPresetMeta(safePresetId);
    if (titleEl) titleEl.textContent = item.label;
    if (stageBadgeEl) stageBadgeEl.textContent = item.stage;
    if (typeBadgeEl) typeBadgeEl.textContent = item.type || 'Sim';
    if (select) select.value = safePresetId;

    const catholicBanner = container.querySelector<HTMLElement>('#catholic-sanctuary-banner');
    if (catholicBanner) {
      catholicBanner.style.display = isCatholicPreset(item) ? 'flex' : 'none';
    }

    initialExternalSrc = null;
    // Lazily inflate requested curriculum/data cartridge into native IndexedDB on-demand (zero background polling, zero 404s)
    if (safePresetId !== 'lumina-architecture') {
      inflateCartridgeToVault(safePresetId).catch(() => {});
    }
    if (!skipPostMessage && isIframeReady && iframe && iframe.contentWindow) {
      postToPlayer({ type: 'SET_PRESET', preset: safePresetId, play: true });
      focusPlayerStage();
    } else if (iframe && (!iframe.src || iframe.src === 'about:blank' || !isIframeReady)) {
      iframe.src = buildPlayerSrc(base, safePresetId, bslActive);
    }

    // Broadcast lesson change to BSL interpreter
    broadcastBslSpeech({ subtitle: `${item.label}. ${item.stage}`, isSpeaking: true });

    if (activeDrawer) {
      renderActiveDrawer();
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('src');
    nextUrl.searchParams.delete('file');
    nextUrl.searchParams.set('preset', safePresetId);
    window.history.replaceState({}, '', nextUrl.toString());

    renderGrid();
  }

  async function handleUploadedFiles(files: File[]) {
    if (!files || files.length === 0) return;

    try {
      // 1. Dual Companion Pair (.svg + .ast)
      const svgFile = files.find((f) => f.name.endsWith('.svg'));
      const astFile = files.find((f) => f.name.endsWith('.ast'));

      if (svgFile && astFile) {
        const svgText = await svgFile.text();
        const astText = await astFile.text();
        const baseName = svgFile.name.replace(/\.[^/.]+$/, '');
        const cleanId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        const cart: CartridgeDefinition = {
          id: cleanId,
          title: cleanTitle,
          stage: 'LOCAL VAULT',
          category: 'Custom Files',
          desc: `Locally ingested companion pair: ${svgFile.name} + ${astFile.name}.`,
          icon: '💾',
          source: 'imported',
          svgMarkup: svgText,
          astSource: astText,
          updatedAt: Date.now(),
        };

        saveCustomCartridge(cart);
        refreshDropdown();
        updatePreset(cleanId);

        iframe?.contentWindow?.postMessage(
          {
            type: 'LOAD_CUSTOM_CARTRIDGE',
            cartridge: cart,
          },
          '*'
        );
        return;
      }

      // 2. Single or individual files
      for (const file of files) {
        const content = await file.text();

        // PhET bundle
        if (file.name.endsWith('.phet') || isPhetBundle(content)) {
          const result = await transpilePhetFile(content, file.name);
          if (result.success && result.svgMarkup && result.astSource) {
            const simId = result.metadata?.simName || `phet-${Date.now()}`;
            const title = result.metadata?.title || file.name.replace(/\.[^/.]+$/, '');
            const cart: CartridgeDefinition = {
              id: simId,
              title,
              stage: 'PHET INTERACTIVE',
              category: 'STEM',
              desc: `PhET simulation transpiled to AST: ${result.metadata?.compressionRatio || 'distilled'}.`,
              icon: '⚛️',
              source: 'phet',
              svgMarkup: result.svgMarkup,
              astSource: result.astSource,
              updatedAt: Date.now(),
            };
            saveCustomCartridge(cart);
            refreshDropdown();
            updatePreset(simId);
            iframe?.contentWindow?.postMessage(
              {
                type: 'LOAD_CUSTOM_CARTRIDGE',
                cartridge: cart,
              },
              '*'
            );
            return;
          }
        }

        // Single .svg (with embedded <script type="text/ast">) or standard SVG
        if (file.name.endsWith('.svg')) {
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const cleanId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

          let astSource = '';
          const match = content.match(/<script\s+type=["']text\/ast["'][^>]*>([\s\S]*?)<\/script>/i);
          if (match && match[1]) {
            astSource = match[1].trim();
          } else {
            astSource = `(:scene :id "${cleanId}" :title "${cleanTitle}" :stage "CUSTOM" :duration 10.0 (:bindings ()))`;
          }

          const cart: CartridgeDefinition = {
            id: cleanId,
            title: cleanTitle,
            stage: 'LOCAL VAULT',
            category: 'Custom Files',
            desc: `Locally ingested vector cartridge: ${file.name}.`,
            icon: '🎨',
            source: 'imported',
            svgMarkup: content,
            astSource,
            updatedAt: Date.now(),
          };
          saveCustomCartridge(cart);
          refreshDropdown();
          updatePreset(cleanId);
          iframe?.contentWindow?.postMessage(
            {
              type: 'LOAD_CUSTOM_CARTRIDGE',
              cartridge: cart,
            },
            '*'
          );
          return;
        }

        // Single .ast file (supports both pure S-expression and hybrid SVG+AST docs)
        if (file.name.endsWith('.ast')) {
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const cleanId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const svgMarkup = content.includes('<svg')
            ? content
            : `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`;

          const cart: CartridgeDefinition = {
            id: cleanId,
            title: cleanTitle,
            stage: 'LOCAL VAULT',
            category: 'Custom Files',
            desc: `Locally ingested AST logic: ${file.name}.`,
            icon: '📜',
            source: 'imported',
            svgMarkup,
            astSource: content,
            updatedAt: Date.now(),
          };
          saveCustomCartridge(cart);
          refreshDropdown();
          updatePreset(cleanId);
          iframe?.contentWindow?.postMessage(
            {
              type: 'LOAD_CUSTOM_CARTRIDGE',
              cartridge: cart,
            },
            '*'
          );
          return;
        }
      }
    } catch (err) {
      console.error('[media-player] Error ingesting uploaded files:', err);
    }
  }

  function renderGrid() {
    if (!gridContainer) return;
    const q = searchQuery.toLowerCase().trim();
    const allAvailable = getAllAvailablePresets();
    const filtered = allAvailable.filter((p) => {
      let matchCat = true;
      if (activeCategory === 'Catholic') matchCat = isCatholicPreset(p);
      else if (activeCategory === 'STEM') matchCat = isStemPreset(p);
      else if (activeCategory === 'Maths') matchCat = isMathPreset(p);
      else if (activeCategory === 'EYFS') matchCat = isOtherPreset(p);
      else if (activeCategory !== 'All') matchCat = (p.type || 'Sim') === activeCategory;

      const matchQ = !q || p.label.toLowerCase().includes(q) || p.stage.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#94a3b8;">No matching cartridges found.</div>`;
      return;
    }

    gridContainer.innerHTML = filtered.map((p) => {
      const isSelected = p.id === activePreset;
      return `
        <div 
          class="cartridge-card" 
          data-id="${escapeHtml(p.id)}"
          style="padding:12px; border-radius:10px; border:1.5px solid ${isSelected ? '#0284c7' : '#e2e8f0'}; background:${isSelected ? '#f0f9ff' : '#f8fafc'}; cursor:pointer; transition:all 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.68rem; font-weight:800; padding:1px 6px; border-radius:4px; background:${p.type === 'Slide' ? '#dcfce7' : p.type === 'App' ? '#fef3c7' : '#e0f2fe'}; color:${p.type === 'Slide' ? '#166534' : p.type === 'App' ? '#92400e' : '#0369a1'};">
              ${escapeHtml(p.type || 'Sim')}
            </span>
            <span style="font-size:0.68rem; color:#64748b; font-weight:600;">${escapeHtml(p.stage)}</span>
          </div>
          <strong style="display:block; font-size:0.86rem; color:#0f172a; margin-bottom:6px; line-height:1.3;">${escapeHtml(p.label)}</strong>
          <span style="font-size:0.75rem; color:#0284c7; font-weight:700;">${isSelected ? '▶ Currently Playing' : 'Launch &rarr;'}</span>
        </div>
      `;
    }).join('');

    gridContainer.querySelectorAll('.cartridge-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id) {
          updatePreset(id);
          iframe?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function loadBuiltinPhetModel(key: SupportedPhetPreset) {
    const model = PHET_BUILTIN_MODELS[key];
    const simId = `phet-${key}`;
    if (model) {
      const cart: CartridgeDefinition = {
        id: simId,
        title: model.title,
        stage: model.stage || 'PHET DISTILLED',
        category: model.subject || 'Physics',
        desc: `PhET simulation transpiled to AST & hardware-accelerated SVG (< 4 KB payload). Invariants: ${model.invariants.join(', ')}.`,
        icon: '⚛️',
        source: 'phet',
        svgMarkup: model.generateSvg(),
        astSource: model.generateAst(),
        updatedAt: Date.now(),
      };
      saveCustomCartridge(cart);
      refreshDropdown();
    }
    updatePreset(simId);
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
      const targetId = window.prompt('Enter Cartridge or Scene ID (e.g. calculus-curves, bbc-model-b, stations-of-the-cross):');
      if (targetId && targetId.trim()) {
        updatePreset(targetId.trim());
      }
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

  // Drag & drop file loading on stage wrapper
  if (iframeWrapper) {
    iframeWrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      iframeWrapper.style.outline = '3px dashed #38bdf8';
      iframeWrapper.style.outlineOffset = '-4px';
    });
    iframeWrapper.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      iframeWrapper.style.outline = 'none';
    });
    iframeWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      iframeWrapper.style.outline = 'none';
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        handleUploadedFiles(Array.from(e.dataTransfer.files));
      }
    });
  }

  // Wire Play, Reset & BSL Toolbar buttons
  playBtn?.addEventListener('click', () => {
    postToPlayer({ type: 'TOGGLE_PLAY' });
    focusPlayerStage();
  });

  resetBtn?.addEventListener('click', () => {
    postToPlayer({ type: 'RESET_SIM' });
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
    const muted = !nextVoice;
    isMuted = muted;
    updateMuteUi(muted);
    postToPlayer({ type: 'SET_VOICE', enabled: nextVoice });
    postToPlayer({ type: 'SET_MUTED', muted });
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

  // Keyboard accessibility shortcuts: M to toggle mute, Space to toggle play/pause
  const onKeyDown = (e: KeyboardEvent) => {
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
      isIframeReady = true;
      if (initialExternalSrc) {
        initialExternalSrc = null;
      } else if (activePreset) {
        postToPlayer({ type: 'SET_PRESET', preset: activePreset, play: false });
      }
      updatePlayButtonUI(false);
    }
    if ((e.data.type === 'PLAY_STATE_CHANGED' || e.data.type === 'STATE_CHANGED' || e.data.type === 'statechange') && typeof (e.data.isPlaying ?? e.data.playing) === 'boolean') {
      const playing = Boolean(e.data.isPlaying ?? e.data.playing);
      updatePlayButtonUI(playing);
    }
    if ((e.data.type === 'PRESETCHANGE' || e.data.type === 'PLAYER_PRESET_CHANGED') && typeof e.data.preset === 'string') {
      const incomingId = normalizePresetId(e.data.preset);
      if (incomingId !== activePreset) {
        updatePreset(incomingId, true);
      }
    }
    if (e.data.type === 'CARTRIDGE_INGESTED') {
      refreshDropdown();
      renderGrid();
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
    if (e.data.type === 'TELEMETRY' || e.data.type === 'AST_TELEMETRY' || e.data.type === 'PLAYER_TELEMETRY') {
      latestTelemetry = e.data.telemetry || e.data.payload || e.data;
      if (activeDrawer === 'ai-tutor') {
        renderActiveDrawer();
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
            const origText = '📊 Log Data to Jotter (CSV)';
            logCsvBtn.textContent = `✓ Logged ${rows} rows (CSV)`;
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

  // Category buttons
  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.getAttribute('data-cat') || 'All';
      catButtons.forEach((b) => {
        const isCur = b.getAttribute('data-cat') === activeCategory;
        b.style.background = isCur ? '#0284c7' : '#f8fafc';
        b.style.color = isCur ? '#ffffff' : '#475569';
        b.style.borderColor = isCur ? '#0284c7' : '#cbd5e1';
      });
      renderGrid();
    });
  });

  // Search input
  searchInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderGrid();
  });

  // Initial grid render
  renderGrid();

  return container;
}

export default renderPlayerPage;