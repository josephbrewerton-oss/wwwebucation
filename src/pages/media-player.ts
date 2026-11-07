import { getBaseUrl } from '../utils/url';
import { PRESET_OPTIONS, ScenePresetOption } from '../data/player/generatedScenes';
import {
  saveCustomCartridge,
  getCustomCartridges,
  type CartridgeDefinition,
} from '../services/cartridgeStore';
import { isPhetBundle, transpilePhetFile } from '../utils/phetBridge';
import {
  toggleBsl,
  getBslEnabled,
  subscribeBsl,
  broadcastBslSpeech,
  subscribeVoice,
  getVoiceEnabled,
  setVoiceEnabled,
} from '../services/bslGlobalStore';
import {
  renderAstInteractiveLabDrawer,
  renderPlayerEmbedModal,
  renderPlayerSettingsModal,
  renderNanoAiTutorDrawer,
  renderDevStudioDrawer,
  type StudioTabType,
  type InspectedElementData,
  mountChalkboard,
  type AstChalkboardInstance,
} from '../components/player';
import { type SwfTranspileResult } from '../utils/swfAstParser';
import { exportAirgapHtmlBundle } from '../utils/exportAirgapHtmlBundle';
import { getPresetConfig, type PlayerDisplayConfig, type PlayerDisplayMode } from '../types/playerConfig';

const DEFAULT_PRESET_ID = 'kinetic-gas';
const VALID_PRESET_IDS = new Set(PRESET_OPTIONS.map((p) => p.id));

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
  if (VALID_PRESET_IDS.has(raw)) return raw;
  try {
    const custom = getCustomCartridges();
    if (custom.some((c) => c.id === raw)) return raw;
  } catch (_) {}
  return DEFAULT_PRESET_ID;
}

function buildPlayerSrc(base: string, presetId: string, bslActive: boolean): string {
  const params = new URLSearchParams({
    preset: presetId,
    bsl: bslActive ? '1' : '0',
  });
  return `${base}player.html?${params.toString()}`;
}

export function renderPlayerPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'ast-media-player-container';
  container.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;';

  // Read initial preset from URL
  const params = new URLSearchParams(window.location.search);
  let activePreset = normalizePresetId(params.get('preset'));
  let activeCategory = 'All';
  let searchQuery = '';
  let bslActive = getBslEnabled() || params.get('bsl') === '1';

  // Ensure presets are loaded from generatedScenes
  const presets: ScenePresetOption[] = Array.isArray(PRESET_OPTIONS) && PRESET_OPTIONS.length > 0
    ? PRESET_OPTIONS
    : [
        { id: 'kinetic-gas', label: 'Kinetic Gas Theory & Thermodynamics', type: 'Sim', stage: 'KS3/KS4 PHYSICS' },
        { id: 'pythagoras', label: "Pythagoras' Theorem (a² + b² = c²)", type: 'Sim', stage: 'KS3/KS4 MATHEMATICS' },
        { id: 'fractions', label: 'Fractions: Why Common Denominators Rule', type: 'Slide', stage: 'KEY STAGE 2' },
        { id: 'electric-circuits', label: 'Electrical Circuits & Ohm’s Law', type: 'Sim', stage: 'KEY STAGE 3' },
        { id: 'solar-system', label: 'Solar System: Heliocentric Planetary Motion', type: 'Sim', stage: 'KEY STAGE 2/3' },
        { id: 'algebra-balance', label: 'Algebraic Balance Scale', type: 'Sim', stage: 'KEY STAGE 3' },
        { id: 'church-tour', label: 'The Catholic Church Sanctuary & Altar', type: 'Slide', stage: 'WHOLE SCHOOL RE' },
        { id: 'phonics-lab', label: 'EYFS Phonics Sound Mat & Digraphs', type: 'App', stage: 'EYFS / KS1' },
      ];

  function isCatholicPreset(p: ScenePresetOption): boolean {
    return (
      p.stage === 'CATHOLIC LIFE' ||
      p.subject === 'Religious Education' ||
      (p.section && p.section.includes('Catholic')) ||
      ['church-tour', 'altar-anatomy', 'holy-oils', 'holy-water-thurifer', 'latin-mass-prayers', 'catholic-rites', 'order-of-the-mass', 'stations-of-the-cross', 'first-communion', 'liturgical-calendar', 'liturgical-postures', 'liturgy-of-the-hours', 'triduum-easter'].includes(p.id)
    );
  }

  function isStemPreset(p: ScenePresetOption): boolean {
    return !isCatholicPreset(p) && (p.subject === 'Science' || (p.stage && p.stage.includes('PHYSICS')) || ['kinetic-gas', 'electric-circuits', 'solar-system', 'photosynthesis', 'atom', 'velocity', 'dna-helix'].includes(p.id));
  }

  function isMathPreset(p: ScenePresetOption): boolean {
    return !isCatholicPreset(p) && (p.subject === 'Mathematics' || ['pythagoras', 'fractions', 'algebra-balance', 'calculus-curves', 'bodmas', 'times-tables'].includes(p.id));
  }

  function isOtherPreset(p: ScenePresetOption): boolean {
    return !isCatholicPreset(p) && !isStemPreset(p) && !isMathPreset(p);
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
      <optgroup label="⚡ Dynamic Auto-Finder" style="background:#0f172a; color:#38bdf8;">
        <option value="__custom_find__">🔍 Open Any Scene by Name / ID...</option>
        <option value="__open_local__">📂 Open Local .ast or .svg File...</option>
      </optgroup>
    `;
  }

  const optionsHtml = buildOptionsHtml(activePreset);

  const meta = getPresetMeta(activePreset);

  container.innerHTML = `
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎬 AST Vector Player &amp; Simulator</span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${base}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${base}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⚡ Practice Lab
        </a>
      </div>
    </div>

    <!-- Main Interactive Stage Frame -->
    <div style="background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35); margin-bottom:2rem;">
      <!-- Stage Toolbar -->
      <div style="padding:12px 18px; background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.4rem;">🎮</span>
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span id="player-active-stage-badge" style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:9999px; background:#0369a1; color:#ffffff; letter-spacing:0.04em;">
                ${meta.stage}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace;">
                ${meta.type || 'Sim'}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem;">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.15rem; font-weight:800; color:#f8fafc; margin:2px 0 0;">
              ${meta.label}
            </h2>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <!-- Dropdown Selector -->
          <div style="display:inline-flex; align-items:center; gap:6px;">
            <label for="player-sim-selector" style="font-size:0.76rem; font-weight:800; color:#94a3b8; white-space:nowrap;">
              🎮 Cartridge:
            </label>
            <select id="player-sim-selector" style="padding:6px 12px; border-radius:8px; background:#0f172a; color:#ffffff; border:1.5px solid #0284c7; font-size:0.82rem; font-weight:700; cursor:pointer; outline:none; max-width:280px;">
              ${optionsHtml}
            </select>
          </div>

          <!-- Open Local Cartridge Button -->
          <button type="button" id="player-btn-open" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" title="Open local .ast, .svg, .ast.svg, or PhET bundle">
            📂 Open...
          </button>
          <input type="file" id="media-player-file-input" accept=".ast,.svg,.json,.html,.phet" multiple style="display:none;" />

          <!-- Reset Button -->
          <button type="button" id="player-btn-reset" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f8fafc; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Reset Simulation">
            ↺ Reset
          </button>

          <!-- Parameters Lab Drawer Button -->
          <button type="button" id="player-btn-lab" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Interactive Parameter Sliders &amp; Physical Manipulatives">
            🎛️ Parameters
          </button>

          <!-- On-Device Gemini Nano AI Tutor Button -->
          <button type="button" id="player-btn-ai" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#c084fc; border:1px solid #9333ea; font-size:0.78rem; font-weight:700; cursor:pointer;" title="On-Device Gemini Nano AI Socratic Co-Pilot">
            🤖 AI Tutor
          </button>

          <!-- Curriculum Dev Studio & PhET Transpiler Drawer Button -->
          <button type="button" id="player-btn-studio" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Curriculum Dev Studio, PhET Bridge, Flash Lathe &amp; S-Expression Editor">
            💻 Studio
          </button>

          <!-- Smartboard Whiteboard Marker Toggle -->
          <button type="button" id="player-btn-pen" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f59e0b; border:1px solid #d97706; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Toggle Smartboard Whiteboard Pen &amp; Annotation Layer">
            🖊️ Marker
          </button>

          <!-- LMS Embed Modal Button -->
          <button type="button" id="player-btn-embed" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#34d399; border:1px solid #059669; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Get Responsive LMS Embed Snippet (Canvas, Moodle, Google Classroom)">
            🚀 Embed
          </button>

          <!-- Display Settings Modal Button -->
          <button type="button" id="player-btn-settings" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#94a3b8; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Teaching Profiles &amp; Player Controls Settings">
            ⚙️ Settings
          </button>

          <!-- Single-File Air-Gapped HTML Export Button -->
          <button type="button" id="player-btn-export-airgap" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#fde047; border:1px solid #ca8a04; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Export Standalone Single-File HTML Lesson Capsule (< 45 KB)">
            📦 Airgap HTML
          </button>

          <!-- BSL Signing Toggle Button -->
          <button type="button" id="player-btn-bsl" style="padding:6px 14px; border-radius:8px; background:${bslActive ? 'rgba(56, 189, 248, 0.16)' : '#1e293b'}; color:${bslActive ? '#38bdf8' : '#94a3b8'}; border:${bslActive ? '1.5px solid #38bdf8' : '1px solid #475569'}; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" title="British Sign Language (BSL) In-Vision Interpreter (Shift + B)">
            <span>🖐️</span> BSL Signing: ${bslActive ? 'ON' : 'OFF'}
          </button>

          <!-- Fullscreen Button -->
          <button type="button" id="player-btn-fullscreen" style="padding:6px 12px; border-radius:8px; background:#0284c7; color:#ffffff; border:none; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- In-Page Drawer & Modal Mount Point -->
      <div id="player-drawer-mount-point" style="display:none; background:#0f172a; border-bottom:1px solid #334155;"></div>

      <!-- Live Stage iFrame -->
      <div id="player-iframe-wrapper" style="position:relative; width:100%; height:540px; background:#000000;">
        <iframe
          id="ast-player-iframe"
          src="${base}player.html?preset=${activePreset}&bsl=${bslActive ? '1' : '0'}"
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
  const bslBtn = container.querySelector<HTMLButtonElement>('#player-btn-bsl')!;
  const resetBtn = container.querySelector<HTMLButtonElement>('#player-btn-reset')!;
  const openBtn = container.querySelector<HTMLButtonElement>('#player-btn-open')!;
  const labBtn = container.querySelector<HTMLButtonElement>('#player-btn-lab');
  const aiBtn = container.querySelector<HTMLButtonElement>('#player-btn-ai');
  const studioBtn = container.querySelector<HTMLButtonElement>('#player-btn-studio');
  const penBtn = container.querySelector<HTMLButtonElement>('#player-btn-pen');
  const embedBtn = container.querySelector<HTMLButtonElement>('#player-btn-embed');
  const settingsBtn = container.querySelector<HTMLButtonElement>('#player-btn-settings');
  const exportAirgapBtn = container.querySelector<HTMLButtonElement>('#player-btn-export-airgap');
  const drawerMount = container.querySelector<HTMLDivElement>('#player-drawer-mount-point');
  const fileInputHidden = container.querySelector<HTMLInputElement>('#media-player-file-input')!;
  const fullscreenBtn = container.querySelector<HTMLButtonElement>('#player-btn-fullscreen')!;
  const searchInput = container.querySelector<HTMLInputElement>('#cartridge-search-input')!;
  const gridContainer = container.querySelector<HTMLDivElement>('#cartridges-grid')!;
  const catButtons = container.querySelectorAll<HTMLButtonElement>('.cat-pill-btn');
  const iframeWrapper = container.querySelector<HTMLDivElement>('#player-iframe-wrapper')!;

  let activeDrawer: 'lab' | 'ai' | 'studio' | 'embed' | 'settings' | null = null;
  let chalkboard: AstChalkboardInstance | null = null;
  let embedTargetMode: PlayerDisplayMode = 'classroom';
  let copiedEmbed = false;
  let displayConfig: PlayerDisplayConfig = getPresetConfig('classroom');

  // Dev Studio state (PhET, SWF, Inspector, SVG, AST)
  let studioTab: StudioTabType = 'phet';
  let inspectedElement: InspectedElementData | null = null;
  let customSvgCode = '';
  let customAstCode = '';
  let hotReloadFlash = false;
  let swfResult: SwfTranspileResult | null = null;
  let isParsingSwf = false;
  let swfError: string | null = null;
  let swfDragActive = false;

  function renderCurrentDrawer() {
    if (!drawerMount) return;
    if (!activeDrawer) {
      drawerMount.style.display = 'none';
      drawerMount.innerHTML = '';
      [labBtn, aiBtn, studioBtn, embedBtn, settingsBtn].forEach((b) => b?.classList.remove('active'));
      return;
    }

    drawerMount.style.display = 'block';
    drawerMount.innerHTML = '';
    [labBtn, aiBtn, studioBtn, embedBtn, settingsBtn].forEach((b) => b?.classList.remove('active'));

    let drawerEl: HTMLElement | null = null;
    if (activeDrawer === 'lab') {
      labBtn?.classList.add('active');
      drawerEl = renderAstInteractiveLabDrawer({
        isOpen: true,
        onClose: () => toggleDrawer('lab'),
        preset: activePreset,
      });
    } else if (activeDrawer === 'ai') {
      aiBtn?.classList.add('active');
      drawerEl = renderNanoAiTutorDrawer({
        isOpen: true,
        onClose: () => toggleDrawer('ai'),
        preset: activePreset,
        postToPlayer: (payload) => iframe?.contentWindow?.postMessage(payload, '*'),
      });
    } else if (activeDrawer === 'studio') {
      studioBtn?.classList.add('active');
      drawerEl = renderDevStudioDrawer({
        isOpen: true,
        onClose: () => toggleDrawer('studio'),
        studioTab,
        setStudioTab: (tab) => {
          studioTab = tab;
          renderCurrentDrawer();
        },
        inspectedElement,
        setInspectedElement: (elem) => {
          inspectedElement = typeof elem === 'function' ? elem(inspectedElement) : elem;
          renderCurrentDrawer();
        },
        customSvgCode,
        setCustomSvgCode: (code) => {
          customSvgCode = code;
        },
        customAstCode,
        setCustomAstCode: (code) => {
          customAstCode = code;
        },
        hotReloadFlash,
        setHotReloadFlash: (val) => {
          hotReloadFlash = val;
        },
        postToPlayer: (payload) => iframe?.contentWindow?.postMessage(payload, '*'),
        swfResult,
        setSwfResult: (res) => {
          swfResult = res;
          renderCurrentDrawer();
        },
        isParsingSwf,
        setIsParsingSwf: (val) => {
          isParsingSwf = val;
          renderCurrentDrawer();
        },
        swfError,
        setSwfError: (err) => {
          swfError = err;
          renderCurrentDrawer();
        },
        swfDragActive,
        setSwfDragActive: (val) => {
          swfDragActive = val;
          renderCurrentDrawer();
        },
      });
    } else if (activeDrawer === 'embed') {
      embedBtn?.classList.add('active');
      const getEmbedSnippet = (mode: PlayerDisplayMode) =>
        `<iframe src="${window.location.origin}${base}player.html?preset=${activePreset}&mode=${mode}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`;
      drawerEl = renderPlayerEmbedModal({
        isOpen: true,
        onClose: () => toggleDrawer('embed'),
        embedTargetMode,
        setEmbedTargetMode: (mode) => {
          embedTargetMode = mode;
          renderCurrentDrawer();
        },
        copiedEmbed,
        onCopyEmbedCode: () => {
          copiedEmbed = true;
          navigator.clipboard?.writeText(getEmbedSnippet(embedTargetMode));
          renderCurrentDrawer();
          setTimeout(() => {
            copiedEmbed = false;
            if (activeDrawer === 'embed') renderCurrentDrawer();
          }, 2000);
        },
        embedCode: getEmbedSnippet(embedTargetMode),
      });
    } else if (activeDrawer === 'settings') {
      settingsBtn?.classList.add('active');
      drawerEl = renderPlayerSettingsModal({
        isOpen: true,
        onClose: () => toggleDrawer('settings'),
        displayConfig,
        setDisplayConfig: (cfg) => {
          displayConfig = typeof cfg === 'function' ? cfg(displayConfig) : cfg;
          iframe?.contentWindow?.postMessage({ type: 'UPDATE_CONFIG', config: displayConfig }, '*');
        },
        postToPlayer: (payload) => iframe?.contentWindow?.postMessage(payload, '*'),
      });
    }

    if (drawerEl) {
      drawerMount.appendChild(drawerEl);
    }
  }

  function toggleDrawer(name: 'lab' | 'ai' | 'studio' | 'embed' | 'settings') {
    if (activeDrawer === name) {
      activeDrawer = null;
    } else {
      activeDrawer = name;
    }
    renderCurrentDrawer();
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

  function updatePreset(presetId: string) {
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

    if (iframe) {
      iframe.src = buildPlayerSrc(base, safePresetId, bslActive);
    }

    // Broadcast lesson change to BSL interpreter
    broadcastBslSpeech({ subtitle: `${item.label}. ${item.stage}`, isSpeaking: true });

    if (chalkboard) {
      chalkboard.destroy();
      chalkboard = null;
      if (penBtn) {
        penBtn.style.background = '#1e293b';
        penBtn.style.borderColor = '#d97706';
        penBtn.style.color = '#f59e0b';
      }
    }
    if (activeDrawer === 'lab' || activeDrawer === 'ai') {
      renderCurrentDrawer();
    }

    const nextUrl = new URL(window.location.href);
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

        // Single .ast file
        if (file.name.endsWith('.ast')) {
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const cleanId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const svgMarkup = `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`;

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

  // Preset selector change
  select?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === '__open_local__') {
      select.value = activePreset;
      fileInputHidden?.click();
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
    });
    iframeWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        handleUploadedFiles(Array.from(e.dataTransfer.files));
      }
    });
  }

  // Reset button
  resetBtn?.addEventListener('click', () => {
    try {
      iframe?.contentWindow?.postMessage({ type: 'RESET_SIM' }, '*');
    } catch (_) {}
  });

  // Synchronize BSL button UI
  function updateBslBtnUi(active: boolean) {
    bslActive = active;
    if (bslBtn) {
      bslBtn.textContent = `🖐️ BSL Signing: ${active ? 'ON' : 'OFF'}`;
      bslBtn.style.background = active ? 'rgba(56, 189, 248, 0.16)' : '#1e293b';
      bslBtn.style.borderColor = active ? '#38bdf8' : '#475569';
      bslBtn.style.color = active ? '#38bdf8' : '#94a3b8';
    }
  }

  // Subscribe to universal BSL state across top nav, Shift+B shortcut, and floating close button
  subscribeBsl((enabled) => {
    if (bslActive !== enabled) {
      updateBslBtnUi(enabled);
      if (iframe) {
        iframe.src = buildPlayerSrc(base, activePreset, enabled);
      }
    }
  });

  // BSL toggle button click
  bslBtn?.addEventListener('click', () => {
    toggleBsl();
  });

  // Synchronize voice narration between host and simulator iframe
  subscribeVoice((enabled) => {
    try {
      iframe?.contentWindow?.postMessage({ type: 'SET_VOICE', enabled }, '*');
    } catch (_) {}
  });

  window.addEventListener('message', (e) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'CARTRIDGE_INGESTED') {
      refreshDropdown();
      renderGrid();
    }
    if ((e.data.type === 'VOICE_TOGGLE' || e.data.type === 'SET_VOICE') && typeof e.data.enabled === 'boolean') {
      setVoiceEnabled(e.data.enabled);
    }
  });

  window.addEventListener('cartridges_updated', () => {
    refreshDropdown();
    renderGrid();
  });

  // Drawer & Tool Buttons Wiring
  labBtn?.addEventListener('click', () => toggleDrawer('lab'));
  aiBtn?.addEventListener('click', () => toggleDrawer('ai'));
  studioBtn?.addEventListener('click', () => toggleDrawer('studio'));
  embedBtn?.addEventListener('click', () => toggleDrawer('embed'));
  settingsBtn?.addEventListener('click', () => toggleDrawer('settings'));

  penBtn?.addEventListener('click', () => {
    if (chalkboard) {
      chalkboard.destroy();
      chalkboard = null;
      penBtn.style.background = '#1e293b';
      penBtn.style.borderColor = '#d97706';
      penBtn.style.color = '#f59e0b';
    } else if (iframeWrapper) {
      chalkboard = mountChalkboard(iframeWrapper, {
        onClose: () => {
          chalkboard = null;
          penBtn.style.background = '#1e293b';
          penBtn.style.borderColor = '#d97706';
          penBtn.style.color = '#f59e0b';
        },
      });
      penBtn.style.background = 'rgba(245, 158, 11, 0.2)';
      penBtn.style.borderColor = '#f59e0b';
      penBtn.style.color = '#fbbf24';
    }
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