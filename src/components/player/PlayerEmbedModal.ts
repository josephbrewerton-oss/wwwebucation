// src/components/player/PlayerEmbedModal.ts
/**
 * Player LMS Embed Code Drawer
 * Pure Vanilla TypeScript / DOM component.
 * Generates copy-pasteable responsive iframe snippets for Canvas, Moodle, Google Classroom
 */

import { PlayerDisplayMode } from '../../types/playerConfig';

export interface PlayerEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedTargetMode: PlayerDisplayMode;
  setEmbedTargetMode: (mode: PlayerDisplayMode) => void;
  copiedEmbed: boolean;
  onCopyEmbedCode: () => void;
  embedCode: string;
}

export function renderPlayerEmbedModal(props: PlayerEmbedModalProps): HTMLElement | null {
  if (!props.isOpen) return null;

  const { embedTargetMode, setEmbedTargetMode, copiedEmbed, onCopyEmbedCode, embedCode } = props;

  const container = document.createElement('div');
  container.className = 'ast-player-embed-modal';
  container.style.cssText = `
    background: var(--stj-surface-raised, #0f172a);
    border-bottom: 1px solid var(--stj-border, #334155);
    padding: 12px 16px;
    font-size: 0.82rem;
    color: var(--stj-text, #f8fafc);
  `;

  const topRow = document.createElement('div');
  topRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;';

  const leftGroup = document.createElement('div');
  leftGroup.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';

  const labelSpan = document.createElement('span');
  labelSpan.style.fontWeight = '600';
  labelSpan.textContent = 'Embed for Canvas, Moodle, or Google Classroom:';
  leftGroup.appendChild(labelSpan);

  const selectWrap = document.createElement('div');
  selectWrap.style.cssText = 'display: inline-flex; align-items: center; gap: 4px;';

  const audienceLabel = document.createElement('span');
  audienceLabel.style.cssText = 'font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8);';
  audienceLabel.textContent = 'Target Audience:';
  selectWrap.appendChild(audienceLabel);

  const select = document.createElement('select');
  select.className = 'stj-select';
  select.style.cssText = 'padding: 2px 6px; font-size: 0.74rem; min-height: 26px; background: #1e293b; color: #fff; border: 1px solid #334155; border-radius: 4px;';
  select.innerHTML = `
    <option value="classroom" ${embedTargetMode === 'classroom' ? 'selected' : ''}>🎓 Classroom (Clean Whiteboard)</option>
    <option value="student" ${embedTargetMode === 'student' ? 'selected' : ''}>🎒 Student Focus (Distraction-Free)</option>
    <option value="developer" ${embedTargetMode === 'developer' ? 'selected' : ''}>🛠️ Developer (Full Suite)</option>
  `;
  select.onchange = (e) => {
    setEmbedTargetMode((e.target as HTMLSelectElement).value as PlayerDisplayMode);
  };
  selectWrap.appendChild(select);
  leftGroup.appendChild(selectWrap);
  topRow.appendChild(leftGroup);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = `stj-btn ${copiedEmbed ? 'stj-btn-success' : 'stj-btn-primary'} stj-btn-sm`;
  copyBtn.style.cssText = 'min-height: 28px; padding: 3px 9px; cursor: pointer;';
  copyBtn.textContent = copiedEmbed ? '✓ Copied!' : 'Copy Code';
  copyBtn.onclick = onCopyEmbedCode;
  topRow.appendChild(copyBtn);

  container.appendChild(topRow);

  const codeBlock = document.createElement('code');
  codeBlock.style.cssText = `
    display: block;
    background: var(--stj-canvas, #090d16);
    border: 1px solid var(--stj-border, #334155);
    padding: 8px;
    border-radius: var(--stj-radius-sm, 6px);
    font-size: 0.74rem;
    color: var(--stj-primary, #38bdf8);
    overflow-x: auto;
    word-break: break-all;
    font-family: monospace;
  `;
  codeBlock.textContent = embedCode;
  container.appendChild(codeBlock);

  return container;
}

export const PlayerEmbedModal = renderPlayerEmbedModal;
export default renderPlayerEmbedModal;
