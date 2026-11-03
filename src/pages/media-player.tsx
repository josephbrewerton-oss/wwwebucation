import { PRESET_OPTIONS, ScenePresetOption } from '../data/player/generatedScenes';
import { toggleBsl, getBslEnabled, subscribeBsl, broadcastBslSpeech } from '../services/bslGlobalStore';

export function renderPlayerPage(): HTMLElement {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const container = document.createElement('div');
  container.className = 'ast-media-player-container';
  container.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;';

  // Read initial preset from URL
  const params = new URLSearchParams(window.location.search);
  let activePreset = params.get('preset') || 'kinetic-gas';
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

  function getPresetMeta(id: string): ScenePresetOption {
    return presets.find((p) => p.id === id) || presets[0];
  }

  // Build options for select dropdown
  const simGroup = presets.filter(p => (p.type || 'Sim') === 'Sim');
  const slideGroup = presets.filter(p => p.type === 'Slide');
  const appGroup = presets.filter(p => p.type === 'App');
  const dataGroup = presets.filter(p => (p.type as string) === 'Data');

  const optionsHtml = `
    <optgroup label="🎮 Simulations (Sim)" style="background:#0f172a; color:#38bdf8;">
      ${simGroup.map(p => `<option value="${p.id}" ${p.id === activePreset ? 'selected' : ''}>${p.label} (${p.stage})</option>`).join('')}
    </optgroup>
    <optgroup label="📑 Interactive Slides (Slide)" style="background:#0f172a; color:#34d399;">
      ${slideGroup.map(p => `<option value="${p.id}" ${p.id === activePreset ? 'selected' : ''}>${p.label} (${p.stage})</option>`).join('')}
    </optgroup>
    <optgroup label="💻 Vector Applications (App)" style="background:#0f172a; color:#fbbf24;">
      ${appGroup.map(p => `<option value="${p.id}" ${p.id === activePreset ? 'selected' : ''}>${p.label} (${p.stage})</option>`).join('')}
    </optgroup>
    ${dataGroup.length > 0 ? `
    <optgroup label="📊 Datasets & Checkpoints (Data)" style="background:#0f172a; color:#a78bfa;">
      ${dataGroup.map(p => `<option value="${p.id}" ${p.id === activePreset ? 'selected' : ''}>${p.label} (${p.stage})</option>`).join('')}
    </optgroup>
    ` : ''}
  `;

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

          <!-- Reset Button -->
          <button type="button" id="player-btn-reset" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f8fafc; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Reset Simulation">
            ↺ Reset
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

    <!-- Category Filter Tabs & Search -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="category-filter-buttons">
          ${['All', 'Sim', 'Slide', 'App', 'Data'].map(cat => `
            <button type="button" class="cat-pill-btn" data-cat="${cat}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${cat === activeCategory ? '#0284c7' : '#cbd5e1'}; background:${cat === activeCategory ? '#0284c7' : '#f8fafc'}; color:${cat === activeCategory ? '#ffffff' : '#475569'};">
              ${cat === 'All' ? '🌟 All (' + presets.length + ')' : cat === 'Sim' ? '🎮 Sims' : cat === 'Slide' ? '📑 Slides' : cat === 'App' ? '💻 Apps' : '📊 Datasets'}
            </button>
          `).join('')}
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search cartridges (e.g. Pythagoras, circuits)..."
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
  const fullscreenBtn = container.querySelector<HTMLButtonElement>('#player-btn-fullscreen')!;
  const searchInput = container.querySelector<HTMLInputElement>('#cartridge-search-input')!;
  const gridContainer = container.querySelector<HTMLDivElement>('#cartridges-grid')!;
  const catButtons = container.querySelectorAll<HTMLButtonElement>('.cat-pill-btn');

  function updatePreset(presetId: string) {
    activePreset = presetId;
    const item = getPresetMeta(presetId);
    if (titleEl) titleEl.textContent = item.label;
    if (stageBadgeEl) stageBadgeEl.textContent = item.stage;
    if (typeBadgeEl) typeBadgeEl.textContent = item.type || 'Sim';
    if (select) select.value = presetId;

    if (iframe) {
      iframe.src = `${base}player.html?preset=${presetId}&bsl=${bslActive ? '1' : '0'}`;
    }

    // Broadcast lesson change to BSL interpreter
    broadcastBslSpeech({ subtitle: `${item.label}. ${item.stage}`, isSpeaking: true });

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('preset', presetId);
    window.history.replaceState({}, '', nextUrl.toString());

    renderGrid();
  }

  function renderGrid() {
    if (!gridContainer) return;
    const q = searchQuery.toLowerCase().trim();
    const filtered = presets.filter((p) => {
      const matchCat = activeCategory === 'All' || (p.type || 'Sim') === activeCategory;
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
          data-id="${p.id}"
          style="padding:12px; border-radius:10px; border:1.5px solid ${isSelected ? '#0284c7' : '#e2e8f0'}; background:${isSelected ? '#f0f9ff' : '#f8fafc'}; cursor:pointer; transition:all 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.68rem; font-weight:800; padding:1px 6px; border-radius:4px; background:${p.type === 'Slide' ? '#dcfce7' : p.type === 'App' ? '#fef3c7' : '#e0f2fe'}; color:${p.type === 'Slide' ? '#166534' : p.type === 'App' ? '#92400e' : '#0369a1'};">
              ${p.type || 'Sim'}
            </span>
            <span style="font-size:0.68rem; color:#64748b; font-weight:600;">${p.stage}</span>
          </div>
          <strong style="display:block; font-size:0.86rem; color:#0f172a; margin-bottom:6px; line-height:1.3;">${p.label}</strong>
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
    updatePreset((e.target as HTMLSelectElement).value);
  });

  // Reset button
  resetBtn?.addEventListener('click', () => {
    if (iframe) {
      iframe.src = `${base}player.html?preset=${activePreset}&bsl=${bslActive ? '1' : '0'}`;
    }
  });

  // BSL toggle
  bslBtn?.addEventListener('click', () => {
    bslActive = !bslActive;
    toggleBsl();
    bslBtn.textContent = `🖐️ BSL Signing: ${bslActive ? 'ON' : 'OFF'}`;
    bslBtn.style.background = bslActive ? 'rgba(56, 189, 248, 0.16)' : '#1e293b';
    bslBtn.style.borderColor = bslActive ? '#38bdf8' : '#475569';
    bslBtn.style.color = bslActive ? '#38bdf8' : '#94a3b8';
    if (iframe) {
      iframe.src = `${base}player.html?preset=${activePreset}&bsl=${bslActive ? '1' : '0'}`;
    }
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