// src/components/player/PlayerSettingsModal.ts
/**
 * Player Settings & Display Configuration Drawer
 * Pure Vanilla TypeScript / DOM component.
 * Manages teaching profile presets (Classroom, Student, Broadcast, Developer)
 * and granular UI toggle options for the media player.
 */

import {
  PlayerDisplayMode,
  PlayerDisplayConfig,
  PlayerRenderQuality,
  getPresetConfig,
  savePlayerConfig,
  MODE_METADATA,
} from '../../types/playerConfig';

export interface PlayerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayConfig: PlayerDisplayConfig;
  setDisplayConfig: (cfg: PlayerDisplayConfig | ((prev: PlayerDisplayConfig) => PlayerDisplayConfig)) => void;
  postToPlayer: (payload: Record<string, any>) => void;
}

export function renderPlayerSettingsModal(props: PlayerSettingsModalProps): HTMLElement | null {
  if (!props.isOpen) return null;

  const { displayConfig, setDisplayConfig, postToPlayer, onClose } = props;

  const container = document.createElement('div');
  container.className = 'ast-player-settings-modal';
  container.style.cssText = `
    background: var(--stj-surface-raised, #0f172a);
    border-bottom: 1px solid var(--stj-border, #334155);
    padding: 16px 20px;
    color: var(--stj-text, #f8fafc);
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fadeIn 0.15s ease;
  `;

  // 1. Header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;';

  const leftHeader = document.createElement('div');
  leftHeader.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 1.2rem;">⚙️</span>
      <strong style="font-size: 0.95rem;">Player Display &amp; Controls Configuration</strong>
      <span class="stj-badge stj-badge-primary" style="font-size: 0.68rem; text-transform: uppercase;">
        ${displayConfig.mode} MODE
      </span>
    </div>
    <p style="margin: 3px 0 0; fontSize: 0.78rem; color: var(--stj-text-muted, #94a3b8);">
      Select a profile preset or customize individual links so only required controls are shown.
    </p>
  `;
  header.appendChild(leftHeader);

  const rightHeader = document.createElement('div');
  rightHeader.style.cssText = 'display: flex; gap: 8px; align-items: center;';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'stj-btn stj-btn-ghost stj-btn-sm';
  resetBtn.style.fontSize = '0.74rem';
  resetBtn.title = 'Reset all settings to Classroom Mode default';
  resetBtn.textContent = '↺ Reset to Classroom Mode';
  resetBtn.onclick = () => {
    const def = getPresetConfig('classroom');
    setDisplayConfig(def);
    savePlayerConfig(def);
    postToPlayer({ type: 'SET_DISPLAY_CONFIG', config: def });
  };
  rightHeader.appendChild(resetBtn);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'stj-btn stj-btn-secondary stj-btn-sm';
  closeBtn.style.cssText = 'font-size: 0.74rem; min-width: 32px;';
  closeBtn.textContent = '✕ Close';
  closeBtn.onclick = onClose;
  rightHeader.appendChild(closeBtn);

  header.appendChild(rightHeader);
  container.appendChild(header);

  // 2. Profile Preset Cards
  const cardsSection = document.createElement('div');
  const cardsTitle = document.createElement('span');
  cardsTitle.style.cssText = 'font-size: 0.72rem; font-weight: 800; color: var(--stj-text-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;';
  cardsTitle.textContent = 'Select Teaching & Viewing Profile';
  cardsSection.appendChild(cardsTitle);

  const cardsGrid = document.createElement('div');
  cardsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;';

  (['classroom', 'student', 'broadcast', 'developer'] as PlayerDisplayMode[]).forEach((m) => {
    const meta = MODE_METADATA[m];
    const isActive = displayConfig.mode === m;
    const card = document.createElement('div');
    card.style.cssText = `
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      border: ${isActive ? '2px solid var(--stj-primary, #38bdf8)' : '1px solid var(--stj-border, #334155)'};
      background: ${isActive ? 'var(--stj-primary-surface, rgba(56,189,248,0.1))' : 'var(--stj-surface, #1e293b)'};
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <strong style="font-size: 0.84rem; color: ${isActive ? 'var(--stj-primary, #38bdf8)' : 'var(--stj-text, #f8fafc)'}">
          ${meta.icon} ${meta.label}
        </strong>
        ${isActive ? '<span style="font-size: 0.72rem; color: var(--stj-primary, #38bdf8); font-weight: 800;">✓ ACTIVE</span>' : ''}
      </div>
      <span style="font-size: 0.66rem; font-weight: 700; color: var(--stj-text-muted, #94a3b8); letter-spacing: 0.04em;">
        ${meta.tag}
      </span>
      <p style="margin: 0; font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8); line-height: 1.35;">
        ${meta.description}
      </p>
    `;
    card.onclick = () => {
      const newCfg = getPresetConfig(m);
      setDisplayConfig(newCfg);
      savePlayerConfig(newCfg);
      postToPlayer({ type: 'SET_DISPLAY_CONFIG', config: newCfg });
    };
    cardsGrid.appendChild(card);
  });
  cardsSection.appendChild(cardsGrid);
  container.appendChild(cardsSection);

  // 2b. Universal Vector & Filter Render Quality (LOW / MED / HIGH)
  const qualitySection = document.createElement('div');
  qualitySection.style.cssText = 'border-top: 1px solid var(--stj-border, #334155); padding-top: 10px; display: flex; flex-direction: column; gap: 6px;';

  const activeQuality: PlayerRenderQuality = displayConfig.renderQuality === 'LOW'
    ? 'LOW'
    : (displayConfig.renderQuality === 'MEDIUM' ? 'MEDIUM' : 'HIGH');

  const qualityHeader = document.createElement('div');
  qualityHeader.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;';
  qualityHeader.innerHTML = `
    <span style="font-size: 0.72rem; font-weight: 800; color: var(--stj-text-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.05em;">
      🎨 Vector &amp; Filter Render Quality
    </span>
    <span style="font-size: 0.7rem; color: var(--stj-text-muted, #94a3b8);">
      ${activeQuality === 'LOW'
        ? 'Fastest FPS (bypasses SVG blur/glow filters for older Chromebooks/tablets)'
        : activeQuality === 'MEDIUM'
        ? 'Balanced vector antialiasing & full SVG filters'
        : 'Crisp geometricPrecision vectors & full SVG filters'}
    </span>
  `;
  qualitySection.appendChild(qualityHeader);

  const qualityRow = document.createElement('div');
  qualityRow.style.cssText = 'display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;';
  const qualityChoices: Array<{ id: PlayerRenderQuality; label: string; title: string }> = [
    { id: 'LOW', label: 'LOW · Max FPS', title: 'Fastest rendering on low-spec hardware — disables expensive SVG blur/glow filters' },
    { id: 'MEDIUM', label: 'MED · Balanced', title: 'Auto shape rendering with full SVG filters and blend layers' },
    { id: 'HIGH', label: 'HIGH · Crisp', title: 'Crisp geometricPrecision vector strokes and full SVG filters' },
  ];
  qualityChoices.forEach((choice) => {
    const isSel = activeQuality === choice.id;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = choice.label;
    btn.title = choice.title;
    btn.style.cssText = `
      padding: 6px 10px;
      border-radius: 7px;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      border: ${isSel ? '2px solid var(--stj-primary, #38bdf8)' : '1px solid var(--stj-border, #334155)'};
      background: ${isSel ? 'var(--stj-primary-surface, rgba(56,189,248,0.14))' : 'var(--stj-surface, #1e293b)'};
      color: ${isSel ? 'var(--stj-primary, #38bdf8)' : 'var(--stj-text, #f8fafc)'};
    `;
    btn.onclick = () => {
      const updated: PlayerDisplayConfig = {
        ...displayConfig,
        renderQuality: choice.id,
      };
      setDisplayConfig(updated);
      savePlayerConfig(updated);
      postToPlayer({ type: 'SET_RENDER_QUALITY', quality: choice.id });
    };
    qualityRow.appendChild(btn);
  });
  qualitySection.appendChild(qualityRow);
  container.appendChild(qualitySection);

  // 3. Granular Control Toggles
  const accordion = document.createElement('div');
  accordion.style.cssText = 'border-top: 1px solid var(--stj-border, #334155); padding-top: 10px;';

  const details = document.createElement('details');
  details.style.cursor = 'pointer';

  const summary = document.createElement('summary');
  summary.style.cssText = 'font-size: 0.8rem; font-weight: 700; color: var(--stj-primary, #38bdf8); margin-bottom: 8px;';
  summary.textContent = '🎛️ Granular Control Toggles (Customize individual links & buttons)';
  details.appendChild(summary);

  const togglesGrid = document.createElement('div');
  togglesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 10px;';

  const createToggleColumn = (title: string, items: Array<{ key: string; label: string }>) => {
    const col = document.createElement('div');
    const colTitle = document.createElement('strong');
    colTitle.style.cssText = 'font-size: 0.74rem; text-transform: uppercase; color: var(--stj-text-muted, #94a3b8); display: block; margin-bottom: 8px;';
    colTitle.textContent = title;
    col.appendChild(colTitle);

    const list = document.createElement('div');
    list.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

    items.forEach(({ key, label }) => {
      const row = document.createElement('label');
      row.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 0.78rem; cursor: pointer;';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = Boolean(displayConfig[key as keyof PlayerDisplayConfig]);
      input.onchange = () => {
        const updated: PlayerDisplayConfig = {
          ...displayConfig,
          mode: 'custom',
          [key]: input.checked,
        };
        setDisplayConfig(updated);
        savePlayerConfig(updated);
        postToPlayer({ type: 'SET_DISPLAY_CONFIG', config: updated });
      };

      const span = document.createElement('span');
      span.textContent = label;

      row.appendChild(input);
      row.appendChild(span);
      list.appendChild(row);
    });

    col.appendChild(list);
    return col;
  };

  const col1 = createToggleColumn('Header & Action Links', [
    { key: 'showPresetSelector', label: 'Curriculum Preset Selector' },
    { key: 'showDevInspect', label: '🛠️ SVG Element Inspector' },
    { key: 'showDevStudio', label: '💻 Live Code Studio' },
    { key: 'showExportSpa', label: '🚀 Standalone SVG SPA Export' },
    { key: 'showExportZip', label: '📦 Offline Simulator Suite ZIP Bundle' },
    { key: 'showStandaloneLink', label: '↗ Standalone Window Button' },
    { key: 'showPipButton', label: '📺 Document Picture-in-Picture & Floating Player' },
    { key: 'showObsLink', label: '📡 OBS Broadcast WebSocket Link' },
    { key: 'showLmsEmbed', label: '🔗 LMS Embed Code Generator' },
    { key: 'showPrintWorksheet', label: '🖨️ A4 Classroom Worksheet' },
    { key: 'showCopySvg', label: '📋 Copy Raw SVG Geometry' },
  ]);

  const col2 = createToggleColumn('Learning, 3D & Playback Features', [
    { key: 'showInteractiveCheckpoints', label: '🎯 Checkpoint Active Recall Quizzes' },
    { key: 'show3DControls', label: '🌐 3D Spatial Orbit & Camera Toolbar' },
    { key: 'showSubtitles', label: '💬 Synchronized Subtitles Overlay' },
    { key: 'showVoiceNarration', label: '🔊 Voice Narration (Web Speech)' },
    { key: 'showTimelineScrubber', label: '⏱️ Timeline Scrubber Track' },
    { key: 'showSpeedSelector', label: '⏩ Playback Speed Selector' },
    { key: 'showLanguageSelector', label: '🌍 Multi-Language Selector' },
    { key: 'showLoopToggle', label: '🔁 Auto-Repeat Loop Toggle' },
    { key: 'showVolumeControl', label: '🔊 Master Volume & Mute Controls' },
    { key: 'showPhysicsControls', label: '🪐 Micro-Physics & Gravity Subsystem' },
    { key: 'ai_copilot_beta', label: '✨ Gemini Nano On-Device Co-Pilot [RC1] (:act bidirectional RPC)' },
  ]);

  togglesGrid.appendChild(col1);
  togglesGrid.appendChild(col2);
  details.appendChild(togglesGrid);
  accordion.appendChild(details);
  container.appendChild(accordion);

  return container;
}

export const PlayerSettingsModal = renderPlayerSettingsModal;
export default renderPlayerSettingsModal;
