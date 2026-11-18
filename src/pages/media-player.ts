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
  type QuizCheckpointContext,
  type NanoAiTutorDrawerHandle,
} from '../components/player';
import type { PlayerTelemetryEvent } from '../engine/aicaller';
import {
  registerWebMcpTools,
  type PlayerMcpTransport,
  type WebMcpRegistrationHandle,
} from '../engine/webmcpBridge';
import { bindSitePlayerAdapter } from '../engine/nanoSiteManager';
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
    kind: 'doc',
    isPlayableScene: true,
    stage: 'FOUNDATIONAL SYSTEM ARCHITECTURE',
    subject: 'System Architecture',
    section: 'System Architecture & Docs',
  },
];
const ALL_BUILTIN_PRESETS: ScenePresetOption[] = [...PRESET_OPTIONS, ...EXTRA_DOC_PRESETS];
const VALID_PRESET_IDS = new Set(ALL_BUILTIN_PRESETS.map((p) => p.id));

type SubjectFilterId = 'All' | 'Science' | 'Maths' | 'Catholic' | 'English' | 'Computing' | 'Languages' | 'Geography';
type FormatFilterId = 'All' | 'Sim' | 'Slide' | 'App' | 'Film' | '3D';
type StageFilterId = 'All' | 'KS1' | 'KS2' | 'KS3' | 'KS4';

const RECENT_PRESETS_STORAGE_KEY = 'stj_player_recent_presets_v1';

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
  let pendingAutoEppBench = params.get('epp-bench') === '1' || params.get('epp-bench') === 'true';
  let activeSubject: SubjectFilterId = 'All';
  let activeFormat: FormatFilterId = 'All';
  let activeStage: StageFilterId = 'All';
  let includeNonMediaExtras = false;
  let searchQuery = '';
  let bslActive = getBslEnabled() || params.get('bsl') === '1';
  let isMuted = !getVoiceEnabled();

  // Ensure presets are loaded from generatedScenes + architectural Show & Tell docs
  const presets: ScenePresetOption[] = ALL_BUILTIN_PRESETS.length > EXTRA_DOC_PRESETS.length
    ? ALL_BUILTIN_PRESETS
    : [
        { id: 'kinetic-gas', label: 'Kinetic Gas Theory & Thermodynamics', type: 'Sim', kind: 'lab', isPlayableScene: true, stage: 'KS3/KS4 PHYSICS', subject: 'Science' },
        { id: 'pythagoras', label: "Pythagoras' Theorem (a² + b² = c²)", type: 'Sim', kind: 'lab', isPlayableScene: true, stage: 'KS3/KS4 MATHEMATICS', subject: 'Mathematics' },
        { id: 'fractions', label: 'Fractions: Why Common Denominators Rule', type: 'Slide', kind: 'lab', isPlayableScene: true, stage: 'KEY STAGE 2', subject: 'Mathematics' },
        { id: 'electric-circuits', label: 'Electrical Circuits & Ohm’s Law', type: 'Sim', kind: 'lab', isPlayableScene: true, stage: 'KEY STAGE 3', subject: 'Science' },
        { id: 'solar-system', label: 'Solar System: Heliocentric Planetary Motion', type: 'Sim', kind: 'lab', isPlayableScene: true, stage: 'KEY STAGE 2/3', subject: 'Science' },
        { id: 'algebra-balance', label: 'Algebraic Balance Scale', type: 'Sim', kind: 'lab', isPlayableScene: true, stage: 'KS3', subject: 'Mathematics' },
        { id: 'church-tour', label: 'The Catholic Church Sanctuary & Altar', type: 'Slide', kind: 'lab', isPlayableScene: true, stage: 'CATHOLIC LIFE', subject: 'Religious Education' },
        { id: 'phonics-lab', label: 'EYFS Phonics Sound Mat & Digraphs', type: 'App', kind: 'lab', isPlayableScene: true, stage: 'EYFS / KS1', subject: 'English' },
        ...EXTRA_DOC_PRESETS,
      ];

  function isNonMediaOrUtility(p: ScenePresetOption): boolean {
    if (p.kind === 'data' || p.kind === 'benchmark' || p.kind === 'doc') return true;
    if (p.isPlayableScene === false) return true;
    if (p.id === 'lumina-architecture' || p.id === 'pipeline-sample' || p.id.startsWith('oak-data-')) return true;
    return p.subject === 'System Architecture';
  }

  function isCatholicPreset(p: ScenePresetOption): boolean {
    const subj = (p.subject || '').toLowerCase();
    return (
      subj.includes('religious') ||
      subj === 'catholic life' ||
      p.stage === 'CATHOLIC LIFE' ||
      Boolean(p.section && p.section.includes('Catholic'))
    );
  }

  function getNormalizedSubject(p: ScenePresetOption): SubjectFilterId {
    if (isCatholicPreset(p)) return 'Catholic';
    const subj = (p.subject || '').toLowerCase();
    if (subj.includes('science') || subj.includes('physics') || subj.includes('chem') || subj.includes('bio')) return 'Science';
    if (subj.includes('math')) return 'Maths';
    if (subj.includes('english') || subj.includes('phonics')) return 'English';
    if (subj.includes('comput') || subj.includes('design')) return 'Computing';
    if (subj.includes('language') || subj.includes('spanish') || subj.includes('french') || subj.includes('latin')) return 'Languages';
    if (subj.includes('geograph')) return 'Geography';
    return 'All';
  }

  function matchesKeyStage(p: ScenePresetOption, stageFilter: StageFilterId): boolean {
    if (stageFilter === 'All') return true;
    const raw = `${p.stage || ''} ${p.oakId || ''}`.toUpperCase();
    if (stageFilter === 'KS1') return raw.includes('EYFS') || raw.includes('KS1') || raw.includes('KEY STAGE 1') || raw.includes('EARLY YEARS');
    if (stageFilter === 'KS2') return raw.includes('KS2') || raw.includes('KEY STAGE 2') || raw.includes('WHOLE SCHOOL');
    if (stageFilter === 'KS3') return raw.includes('KS3') || raw.includes('KEY STAGE 3');
    if (stageFilter === 'KS4') return raw.includes('KS4') || raw.includes('GCSE') || raw.includes('A-LEVEL') || raw.includes('KEY STAGE 4');
    return true;
  }

  function getRecentPresetIds(): string[] {
    try {
      const raw = getLocalState(RECENT_PRESETS_STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((id) => typeof id === 'string') : [];
    } catch (_) {
      return [];
    }
  }

  function recordRecentPreset(id: string) {
    if (!id || id.startsWith('__')) return;
    try {
      const prev = getRecentPresetIds().filter((x) => x !== id);
      const next = [id, ...prev].slice(0, 5);
      setLocalState(RECENT_PRESETS_STORAGE_KEY, JSON.stringify(next));
    } catch (_) {}
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
          kind: 'lab',
          isPlayableScene: true,
          subject: custom.subject || 'Custom Ingestion',
        };
      }
    } catch (_) {}
    return presets[0];
  }

  // Playable visual curriculum labs (excludes non-media data packs & utility benchmarks by default)
  const corePlayableLabs = presets.filter((p) => !isNonMediaOrUtility(p));
  const hiddenExtrasCount = presets.length - corePlayableLabs.length;

  function buildOptionsHtml(selectedId: string): string {
    const customList = getCustomCartridgesList();
    const customGroupHtml = customList.length > 0 ? `
      <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
        ${customList.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? 'selected' : ''}>${escapeHtml(c.title)} (${escapeHtml(c.stage || 'LOCAL')})</option>`).join('')}
      </optgroup>
    ` : '';

    const dropdownLabs = corePlayableLabs.filter((p) => !p.id.startsWith('phet-'));
    const phetLabs = corePlayableLabs.filter((p) => p.id.startsWith('phet-'));

    const scienceOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Science');
    const mathOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Maths');
    const catholicOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Catholic');
    const englishOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'English');
    const computingOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Computing');
    const languageOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Languages');
    const geoOtherOpts = dropdownLabs.filter((p) => {
      const s = getNormalizedSubject(p);
      return s === 'Geography' || s === 'All';
    });

    const renderOpts = (arr: ScenePresetOption[]) =>
      arr.map((p) => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.label)} · ${escapeHtml(p.type)} (${escapeHtml(p.stage)})</option>`).join('');

    // Preserve deep-linked utility/data preset in dropdown if directly selected via URL
    const selectedPreset = presets.find((p) => p.id === selectedId);
    const activeExtraHtml = selectedPreset && isNonMediaOrUtility(selectedPreset)
      ? `<optgroup label="📎 Active Reference / Benchmark" style="background:#0f172a; color:#cbd5e1;">
          <option value="${escapeHtml(selectedPreset.id)}" selected>${escapeHtml(selectedPreset.label)} (${escapeHtml(selectedPreset.stage)})</option>
        </optgroup>`
      : '';

    return `
      ${customGroupHtml}
      ${activeExtraHtml}
      <optgroup label="🔬 Sciences (Physics, Chemistry &amp; Biology)" style="background:#0f172a; color:#38bdf8;">
        ${renderOpts(scienceOpts)}
      </optgroup>
      <optgroup label="📐 Mathematics &amp; Geometry" style="background:#0f172a; color:#34d399;">
        ${renderOpts(mathOpts)}
      </optgroup>
      <optgroup label="✝️ Catholic Faith &amp; Liturgy" style="background:#0f172a; color:#fde047;">
        ${renderOpts(catholicOpts)}
      </optgroup>
      <optgroup label="📖 English, Literature &amp; Phonics" style="background:#0f172a; color:#fbbf24;">
        ${renderOpts(englishOpts)}
      </optgroup>
      <optgroup label="💻 Computing &amp; Design Technology" style="background:#0f172a; color:#c084fc;">
        ${renderOpts(computingOpts)}
      </optgroup>
      <optgroup label="🗣️ Languages &amp; BSL" style="background:#0f172a; color:#f472b6;">
        ${renderOpts(languageOpts)}
      </optgroup>
      <optgroup label="🌍 Geography &amp; Portal Showcase" style="background:#0f172a; color:#60a5fa;">
        ${renderOpts(geoOtherOpts)}
      </optgroup>
      <optgroup label="⚛️ PhET Distillations" style="background:#0f172a; color:#38bdf8;">
        ${renderOpts(phetLabs)}
        <option value="__open_local__">📥 Import Local PhET (.html / .phet) or SWF...</option>
      </optgroup>
      <optgroup label="🔍 Discovery" style="background:#0f172a; color:#94a3b8;">
        <option value="__custom_find__">🔍 Search &amp; Filter All Labs Below...</option>
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
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🔬 Interactive Lab &amp; Lesson Player</span>
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
              <span style="color:#94a3b8; font-size:0.75rem; white-space:nowrap;" class="hidden sm:inline">&bull; Interactive Classroom Stage</span>
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

    <!-- Interactive Labs Library & Multi-Facet Filter -->
    <section id="labs-catalog-section" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
        <div>
          <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;">Browse Visual Labs &amp; Lessons</h3>
          <p id="catalog-results-summary" style="margin:2px 0 0; font-size:0.8rem; color:#64748b; font-variant-numeric:tabular-nums;">
            Showing interactive simulations, guided slides, and educational apps
          </p>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search by title, topic, stage, or ID (e.g. titration, altar, ks2)..."
            style="padding:7px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.84rem; min-width:270px; outline:none; color:#0f172a; background:#ffffff;"
          />
          <select id="stage-filter-select" aria-label="Filter by Key Stage" style="padding:7px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.82rem; font-weight:600; color:#334155; background:#f8fafc; cursor:pointer;">
            <option value="All">All Key Stages</option>
            <option value="KS1">EYFS &amp; KS1</option>
            <option value="KS2">Key Stage 2</option>
            <option value="KS3">Key Stage 3</option>
            <option value="KS4">KS4 / GCSE &amp; A-Level</option>
          </select>
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
            ? corePlayableLabs.length
            : corePlayableLabs.filter((p) => getNormalizedSubject(p) === cat.id).length;
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
          <span>Include recall data packs, benchmarks &amp; docs (${hiddenExtrasCount})</span>
        </label>
      </div>

      <!-- Recent Quick-Switch Strip -->
      <div id="recent-labs-strip" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; font-size:0.78rem;"></div>

      <!-- Presets Grid Container -->
      <div id="cartridges-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:520px; overflow-y:auto; padding-right:4px;">
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
  const remixCodeBtn = container.querySelector<HTMLButtonElement>('#player-btn-remix-code');
  const diagnosticsBtn = container.querySelector<HTMLButtonElement>('#player-btn-diagnostics');
  const teacherToolsBtn = container.querySelector<HTMLButtonElement>('#player-btn-teacher-tools');
  const teacherToolsGroup = container.querySelector<HTMLDivElement>('#player-teacher-tools-group');
  const logCsvBtn = container.querySelector<HTMLButtonElement>('#player-btn-log-csv');
  const openBtn = container.querySelector<HTMLButtonElement>('#player-btn-open')!;
  const embedBtn = container.querySelector<HTMLButtonElement>('#player-btn-embed');
  const exportAirgapBtn = container.querySelector<HTMLButtonElement>('#player-btn-export-airgap');
  const drawerMount = container.querySelector<HTMLDivElement>('#player-drawer-mount-point');
  const fileInputHidden = container.querySelector<HTMLInputElement>('#media-player-file-input')!;
  const fullscreenBtn = container.querySelector<HTMLButtonElement>('#player-btn-fullscreen')!;
  const searchInput = container.querySelector<HTMLInputElement>('#cartridge-search-input')!;
  const stageFilterSelect = container.querySelector<HTMLSelectElement>('#stage-filter-select');
  const includeNonMediaCheckbox = container.querySelector<HTMLInputElement>('#toggle-include-nonmedia');
  const clearFiltersBtn = container.querySelector<HTMLButtonElement>('#btn-clear-catalog-filters');
  const resultsSummaryEl = container.querySelector<HTMLElement>('#catalog-results-summary');
  const recentStripEl = container.querySelector<HTMLDivElement>('#recent-labs-strip');
  const gridContainer = container.querySelector<HTMLDivElement>('#cartridges-grid')!;
  const catButtons = container.querySelectorAll<HTMLButtonElement>('.cat-pill-btn');
  const formatButtons = container.querySelectorAll<HTMLButtonElement>('.format-filter-btn');
  const iframeWrapper = container.querySelector<HTMLDivElement>('#player-iframe-wrapper')!;

  // Strict Typed postMessage Protocol between Host Chassis & Unified Cartridge Player Kernel
  type HostToPlayerMessage =
    | { type: 'SET_PRESET'; preset: string; play?: boolean }
    | { type: 'LOAD_CUSTOM_CARTRIDGE'; cartridge: CartridgeDefinition }
    | { type: 'OPEN_STUDIO'; tab?: string; openSaveAs?: boolean }
    | { type: 'REMIX_SAVED_ACK'; message: string }
    | { type: 'NANO_REMIX_RESULT'; proposal: any }
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

  let webMcpHandle: WebMcpRegistrationHandle = registerWebMcpTools(mcpTransport);
  let mcpRegEpoch = 0;

  async function refreshPlayerWebMcpRegistration() {
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
      updatePreset(normalizePresetId(presetId), true);
      if (autoplay) postToPlayer({ type: 'PLAY' });
    },
    setVar: (name, value) => {
      postToPlayer({ type: 'SET_VAR', name, value });
    },
    highlight: (selector) => {
      postToPlayer({ type: 'EXEC_ACTION_TUPLE', tuple: `(:act :highlight "${selector}")` });
    },
    getActivePreset: () => activePreset,
  });

  let pageDisposed = false;
  let wasContainerConnected = false;
  let unmountObserver: MutationObserver | null = null;
  const cleanupPlayerLifecycle = () => {
    if (pageDisposed) return;
    pageDisposed = true;
    mcpRegEpoch++;
    webMcpHandle.unregister();
    bindSitePlayerAdapter(null);
    unmountObserver?.disconnect();
    unmountObserver = null;
    window.removeEventListener('pagehide', cleanupPlayerLifecycle);
    window.removeEventListener('keydown', onKeyDown);
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
  let activeQuizContext: QuizCheckpointContext | null = null;
  let isAiDemonstrating = false;
  let embedTargetMode: PlayerDisplayMode = 'classroom';
  let copiedEmbed = false;
  let mountedDiagnosticsEl: HTMLElement | null = null;
  let mountedDiagnosticsPreset = '';
  let autoRunEppBenchOnce = false;
  let mountedAiTutorEl: HTMLElement | null = null;
  let mountedAiTutorHandle: NanoAiTutorDrawerHandle | null = null;
  let mountedAiTutorPreset = '';

  function renderActiveDrawer(forceRebuild = false) {
    if (!drawerMount) return;

    // Preserve interactive diagnostics DOM and live benchmark state across telemetry ticks
    if (
      activeDrawer === 'diagnostics' &&
      !forceRebuild &&
      mountedDiagnosticsEl &&
      mountedDiagnosticsEl.isConnected &&
      mountedDiagnosticsPreset === activePreset
    ) {
      return;
    }

    // Preserve active Gemini Nano Co-Pilot chatLog & quiz state across telemetry ticks
    if (
      activeDrawer === 'ai-tutor' &&
      !forceRebuild &&
      mountedAiTutorEl &&
      mountedAiTutorEl.isConnected &&
      mountedAiTutorPreset === activePreset
    ) {
      mountedAiTutorHandle?.updateTelemetry(latestTelemetry);
      return;
    }

    drawerMount.innerHTML = '';
    if (activeDrawer !== 'diagnostics') {
      mountedDiagnosticsEl = null;
      mountedDiagnosticsPreset = '';
    }
    if (activeDrawer !== 'ai-tutor') {
      mountedAiTutorEl = null;
      mountedAiTutorHandle = null;
      mountedAiTutorPreset = '';
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
        activeQuiz: activeQuizContext,
        isAiDemonstrating,
        onCancelDemonstration: () => {
          isAiDemonstrating = false;
          mountedAiTutorHandle?.setDemonstrating(false);
        },
      });
      if (drawerEl) {
        mountedAiTutorEl = drawerEl;
        mountedAiTutorHandle = (drawerEl as any).__nanoDrawerHandle || null;
        mountedAiTutorPreset = activePreset;
        drawerMount.appendChild(drawerEl);
      }
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
      const shouldAutoRun = autoRunEppBenchOnce;
      autoRunEppBenchOnce = false;
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
        autoRunBenchmark: shouldAutoRun,
        onAutoRunConsumed: () => {
          autoRunEppBenchOnce = false;
        },
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
    const customList: ScenePresetOption[] = getCustomCartridgesList().map((c) => ({
      id: c.id,
      label: c.title,
      stage: c.stage || 'LOCAL VAULT',
      type: (c.type as any) || 'Sim',
      kind: 'lab',
      isPlayableScene: true,
      subject: c.subject || 'Custom Ingested',
    }));
    const baseList = includeNonMediaExtras ? presets : corePlayableLabs;
    return [...customList, ...baseList];
  }

  let isIframeReady = false;
  iframe?.addEventListener('load', () => {
    isIframeReady = true;
  });

  function updatePreset(presetId: string, skipPostMessage = false) {
    if (presetId === '__custom_find__' || presetId === '__open_local__') return;
    const safePresetId = normalizePresetId(presetId);
    activePreset = safePresetId;
    recordRecentPreset(safePresetId);
    const item = getPresetMeta(safePresetId);
    if (titleEl) titleEl.textContent = item.label;
    if (stageBadgeEl) stageBadgeEl.textContent = item.stage;
    if (typeBadgeEl) typeBadgeEl.textContent = item.type || 'Sim';
    if (select) {
      if (isNonMediaOrUtility(item)) refreshDropdown();
      else select.value = safePresetId;
    }

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

    // Cleanly cycle AbortSignal registration for document.modelContext when switching cartridges
    void refreshPlayerWebMcpRegistration();

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

  function renderRecentStrip() {
    if (!recentStripEl) return;
    const recentIds = getRecentPresetIds().filter((id) => id !== activePreset);
    const items = recentIds
      .map((id) => presets.find((p) => p.id === id))
      .filter((p): p is ScenePresetOption => Boolean(p))
      .slice(0, 4);

    if (items.length === 0) {
      recentStripEl.style.display = 'none';
      recentStripEl.replaceChildren();
      return;
    }

    recentStripEl.style.display = 'flex';
    recentStripEl.innerHTML = `
      <span style="color:#64748b; font-weight:700;">Recently opened:</span>
      ${items.map((p) => `
        <button type="button" class="recent-lab-btn" data-id="${escapeHtml(p.id)}" style="padding:3px 10px; border-radius:6px; border:1px solid #e2e8f0; background:#f8fafc; color:#0f172a; font-size:0.76rem; font-weight:600; cursor:pointer; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${escapeHtml(p.label)}
        </button>
      `).join('')}
    `;
    recentStripEl.querySelectorAll('.recent-lab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) updatePreset(id);
      });
    });
  }

  function renderGrid() {
    if (!gridContainer) return;
    renderRecentStrip();

    const q = searchQuery.toLowerCase().trim();
    const allAvailable = getAllAvailablePresets();
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

    const hasActiveFilters = Boolean(q || activeSubject !== 'All' || activeFormat !== 'All' || activeStage !== 'All' || includeNonMediaExtras);
    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
    }
    if (resultsSummaryEl) {
      const scopeLabel = includeNonMediaExtras ? 'activities (including recall data & docs)' : 'visual labs & lessons';
      resultsSummaryEl.textContent = `Showing ${filtered.length} of ${allAvailable.length} ${scopeLabel}`;
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#64748b;">No matching labs found for your active filters.</div>`;
      return;
    }

    gridContainer.innerHTML = filtered.map((p) => {
      const isSelected = p.id === activePreset;
      const subjLabel = p.subject || 'Curriculum';
      const kindSuffix = p.kind === 'data' ? ' · Recall Data Pack' : p.kind === 'benchmark' ? ' · Benchmark' : p.kind === 'doc' ? ' · Architecture Doc' : '';
      const formatLabel = p.has3D ? `${p.type || 'Sim'} (3D)` : (p.type || 'Sim');
      return `
        <div
          class="cartridge-card"
          data-id="${escapeHtml(p.id)}"
          style="padding:12px 14px; border-radius:10px; border:1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}; background:${isSelected ? '#f0f9ff' : '#ffffff'}; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
          <div>
            <div style="font-size:0.72rem; color:#64748b; font-weight:600; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(formatLabel)} &middot; ${escapeHtml(subjLabel)} &middot; ${escapeHtml(p.stage)}${escapeHtml(kindSuffix)}
            </div>
            <strong style="display:block; font-size:0.88rem; color:#0f172a; line-height:1.35;">${escapeHtml(p.label)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem;">
            <span style="color:${isSelected ? '#0369a1' : '#0284c7'}; font-weight:700;">${isSelected ? '▶ Currently Loaded' : 'Launch Lab &rarr;'}</span>
            ${p.hasCheckpoints && p.checkpointCount ? `<span style="color:#64748b; font-variant-numeric:tabular-nums;">${p.checkpointCount} checks</span>` : ''}
          </div>
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
      searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput?.focus();
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
      } else if (activePreset && (!e.data.preset || e.data.preset !== activePreset)) {
        postToPlayer({ type: 'SET_PRESET', preset: activePreset, play: false });
      }
      updatePlayButtonUI(false);

      if (pendingAutoEppBench && (!e.data.preset || e.data.preset === activePreset)) {
        pendingAutoEppBench = false;
        setTimeout(() => {
          if (!container.isConnected || pageDisposed) return;
          if (teacherToolsGroup) {
            teacherToolsGroup.style.display = 'inline-flex';
          }
          if (teacherToolsBtn) {
            teacherToolsBtn.setAttribute('aria-expanded', 'true');
            teacherToolsBtn.style.background = '#1e293b';
            teacherToolsBtn.style.color = '#f8fafc';
            teacherToolsBtn.textContent = '🧰 Teacher Tools ▴';
          }
          activeDrawer = 'diagnostics';
          autoRunEppBenchOnce = true;
          renderActiveDrawer(true);
        }, 150);
      }
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
        mountedAiTutorHandle?.updateTelemetry(latestTelemetry);
      }
    }
    if (e.data.type === 'AI_DEMO_START') {
      isAiDemonstrating = true;
      mountedAiTutorHandle?.setDemonstrating(true);
    }
    if (e.data.type === 'AI_DEMO_COMPLETE' || e.data.type === 'PUPIL_PREEMPTION') {
      isAiDemonstrating = false;
      mountedAiTutorHandle?.setDemonstrating(false);
    }
    if (e.data.type === 'CHECKPOINT_ANSWERED') {
      if (!e.data.isCorrect && e.data.prompt) {
        activeQuizContext = {
          sceneId: typeof e.data.sceneId === 'string' && e.data.sceneId ? e.data.sceneId : activePreset,
          sceneTitle: typeof e.data.sceneTitle === 'string' ? e.data.sceneTitle : undefined,
          index: Number(e.data.index || 0),
          mode: e.data.mode === 'pass-expr' ? 'pass-expr' : 'multiple-choice',
          prompt: String(e.data.prompt),
          options: Array.isArray(e.data.options) ? e.data.options : undefined,
          chosenIndex: typeof e.data.chosenIdx === 'number' ? e.data.chosenIdx : null,
          chosenText: typeof e.data.selectedText === 'string' ? e.data.selectedText : '',
          answerIndex: typeof e.data.answer === 'number' ? e.data.answer : undefined,
          explanation: typeof e.data.explanation === 'string' ? e.data.explanation : '',
          distractorNudge: typeof e.data.distractorNudge === 'string' ? e.data.distractorNudge : '',
          autoAsk: false,
        };
        if (activeDrawer === 'ai-tutor' && mountedAiTutorHandle) {
          mountedAiTutorHandle.askCheckpoint(activeQuizContext, false);
        }
      } else if (e.data.isCorrect) {
        activeQuizContext = null;
      }
    }
    if (e.data.type === 'ASK_NANO_CHECKPOINT' || e.data.type === 'OPEN_NANO_TUTOR') {
      activeQuizContext = {
        sceneId: typeof e.data.sceneId === 'string' && e.data.sceneId ? e.data.sceneId : activePreset,
        sceneTitle: typeof e.data.sceneTitle === 'string' ? e.data.sceneTitle : undefined,
        index: Number(e.data.index || 0),
        mode: e.data.mode === 'pass-expr' ? 'pass-expr' : 'multiple-choice',
        prompt: String(e.data.prompt || ''),
        options: Array.isArray(e.data.options) ? e.data.options : undefined,
        chosenIndex: typeof e.data.chosenIndex === 'number' ? e.data.chosenIndex : null,
        chosenText: typeof e.data.chosenText === 'string' ? e.data.chosenText : '',
        answerIndex: typeof e.data.answerIndex === 'number' ? e.data.answerIndex : undefined,
        correctText: typeof e.data.correctText === 'string' ? e.data.correctText : '',
        explanation: typeof e.data.explanation === 'string' ? e.data.explanation : '',
        distractorNudge: typeof e.data.distractorNudge === 'string' ? e.data.distractorNudge : '',
        passExpr: typeof e.data.passExpr === 'string' ? e.data.passExpr : '',
        targetSelector: typeof e.data.targetSelector === 'string' ? e.data.targetSelector : '',
        vars: e.data.vars && typeof e.data.vars === 'object' ? e.data.vars : undefined,
        computed: e.data.computed && typeof e.data.computed === 'object' ? e.data.computed : undefined,
        progress: typeof e.data.progress === 'number' ? e.data.progress : undefined,
        autoAsk: e.data.autoAsk !== false,
      };
      if (activeDrawer === 'ai-tutor' && mountedAiTutorHandle && mountedAiTutorPreset === activePreset) {
        mountedAiTutorHandle.askCheckpoint(activeQuizContext, activeQuizContext.autoAsk !== false);
      } else {
        activeDrawer = 'ai-tutor';
        renderActiveDrawer(true);
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
            const origText = '📊 Save Results to Jotter';
            logCsvBtn.textContent = `✓ Saved ${rows} rows to Jotter`;
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
    if (e.data.type === 'SAVE_REMIX_CARTRIDGE' && e.data.cartridge) {
      const incoming = e.data.cartridge as CartridgeDefinition;
      const exportMode = typeof e.data.exportMode === 'string' ? e.data.exportMode : 'vault';
      if (incoming.id && incoming.astSource && incoming.svgMarkup) {
        const cleanCart: CartridgeDefinition = {
          id: incoming.id,
          title: incoming.title || incoming.id,
          stage: incoming.stage || 'CUSTOM REMIX',
          type: (incoming.type as any) || 'Sim',
          category: incoming.category || 'Student Remixes',
          desc: incoming.desc || 'Custom student remix saved offline.',
          icon: incoming.icon || '🧪',
          source: 'user',
          svgMarkup: incoming.svgMarkup,
          astSource: incoming.astSource,
          createdAt: incoming.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        saveCustomCartridge(cleanCart);
        activePreset = cleanCart.id;
        if (titleEl) titleEl.textContent = cleanCart.title;
        if (stageBadgeEl) stageBadgeEl.textContent = cleanCart.stage;
        if (typeBadgeEl) typeBadgeEl.textContent = cleanCart.type || 'Sim';
        refreshDropdown();
        renderGrid();

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('preset', cleanCart.id);
        window.history.replaceState({}, '', nextUrl.toString());

        import('../services/localCartridgeBuilder')
          .then(async ({ saveRemixDuoToNominatedFolder, downloadAstbBinary }) => {
            const res = await saveRemixDuoToNominatedFolder({
              id: cleanCart.id,
              astText: cleanCart.astSource || '',
              svgText: cleanCart.svgMarkup || '',
            });
            if (exportMode === 'astb') {
              downloadAstbBinary(res.artifact.id, res.artifact.astbData);
            }
            const ackMsg = res.wroteToFolder && res.folderName
              ? `✓ Saved ${cleanCart.id}.ast + .svg + bytecode/.astb into "${res.folderName}" & Vault!`
              : exportMode === 'astb'
              ? `⚡ Compiled & downloaded ${res.artifact.id}.astb (${res.artifact.bytecodeBytes} B)`
              : `✓ Saved "${cleanCart.title}" to offline Vault!`;
            postToPlayer({ type: 'REMIX_SAVED_ACK', message: ackMsg });
            if (remixCodeBtn) {
              const prev = remixCodeBtn.textContent;
              remixCodeBtn.textContent = `✓ Saved ${cleanCart.id}`;
              remixCodeBtn.style.background = '#065f46';
              setTimeout(() => {
                remixCodeBtn.textContent = prev || '💻 Remix & Code';
                remixCodeBtn.style.background = '#1e293b';
              }, 2600);
            }
          })
          .catch(() => {});
      }
    }
    if (e.data.type === 'NANO_REMIX_REQUEST' && e.data.context) {
      const remixCtx = e.data.context;
      import('../engine/nanoRemixCopilot')
        .then(async ({ promptAiRemixAssistant }) => {
          const proposal = await promptAiRemixAssistant(remixCtx);
          postToPlayer({
            type: 'NANO_REMIX_RESULT',
            proposal,
          });
        })
        .catch((err) => {
          postToPlayer({
            type: 'NANO_REMIX_RESULT',
            proposal: {
              requestId: remixCtx.requestId,
              mode: 'advice_only',
              explanation: `Could not reach Nano Remix Co-Pilot: ${err?.message || 'offline error'}`,
              engineUsed: 'deterministic-remix',
            },
          });
        });
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

  remixCodeBtn?.addEventListener('click', () => {
    postToPlayer({ type: 'OPEN_STUDIO', tab: 'ast' });
    focusPlayerStage();
  });

  teacherToolsBtn?.addEventListener('click', () => {
    if (!teacherToolsGroup) return;
    const isOpen = teacherToolsGroup.style.display === 'inline-flex';
    teacherToolsGroup.style.display = isOpen ? 'none' : 'inline-flex';
    teacherToolsBtn.setAttribute('aria-expanded', String(!isOpen));
    teacherToolsBtn.style.background = isOpen ? '#0f172a' : '#1e293b';
    teacherToolsBtn.style.color = isOpen ? '#94a3b8' : '#f8fafc';
    teacherToolsBtn.textContent = isOpen ? '🧰 Teacher Tools ▾' : '🧰 Teacher Tools ▴';
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

  function syncSubjectTabStyles() {
    catButtons.forEach((b) => {
      const isCur = b.getAttribute('data-cat') === activeSubject;
      b.style.background = isCur ? '#ffffff' : 'transparent';
      b.style.color = isCur ? '#0f172a' : '#475569';
      b.style.boxShadow = isCur ? '0 1px 3px rgba(15,23,42,0.1)' : 'none';
    });
  }

  function syncFormatButtonStyles() {
    formatButtons.forEach((b) => {
      const isCur = b.getAttribute('data-format') === activeFormat;
      b.style.background = isCur ? '#e0f2fe' : '#f8fafc';
      b.style.color = isCur ? '#0369a1' : '#475569';
      b.style.borderColor = isCur ? '#0284c7' : '#e2e8f0';
    });
  }

  // Subject buttons
  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeSubject = (btn.getAttribute('data-cat') as SubjectFilterId) || 'All';
      syncSubjectTabStyles();
      renderGrid();
    });
  });

  // Format filter buttons
  formatButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFormat = (btn.getAttribute('data-format') as FormatFilterId) || 'All';
      syncFormatButtonStyles();
      renderGrid();
    });
  });

  // Key stage filter
  stageFilterSelect?.addEventListener('change', () => {
    activeStage = (stageFilterSelect.value as StageFilterId) || 'All';
    renderGrid();
  });

  // Include non-media recall data / docs / benchmarks toggle
  includeNonMediaCheckbox?.addEventListener('change', () => {
    includeNonMediaExtras = Boolean(includeNonMediaCheckbox.checked);
    renderGrid();
  });

  // Clear filters button
  clearFiltersBtn?.addEventListener('click', () => {
    activeSubject = 'All';
    activeFormat = 'All';
    activeStage = 'All';
    includeNonMediaExtras = false;
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (stageFilterSelect) stageFilterSelect.value = 'All';
    if (includeNonMediaCheckbox) includeNonMediaCheckbox.checked = false;
    syncSubjectTabStyles();
    syncFormatButtonStyles();
    renderGrid();
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