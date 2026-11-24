// src/components/player/SwfDistillerStrip.ts
/**
 * Docked Run-to-Convert Live Capture Strip
 * Pure Vanilla TypeScript / DOM component (lazy-loaded with SWF workflow).
 * Allows teachers to interact with a running Flash SWF on stage, capture meaningful
 * SVG screens/states, auto-sweep keyframes, and promote directly to a bytecode-free
 * native AST cartridge.
 */

import type { SwfCapturedState } from '../../utils/swfNativeDistiller';

export interface SwfDistillerStripProps {
  lessonTitle: string;
  originalSwfBytes: number;
  capturedStates: SwfCapturedState[];
  isCapturing: boolean;
  isSweeping: boolean;
  statusNote: string | null;
  onCaptureState: () => void;
  onAutoSweep: () => void;
  onMoveState: (index: number, delta: -1 | 1) => void;
  onRemoveState: (index: number) => void;
  onOpenPromoteReview: () => void;
  onExitConvertMode: () => void;
}

function formatKb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0.0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function renderSwfDistillerStrip(props: SwfDistillerStripProps): HTMLElement {
  const {
    lessonTitle,
    originalSwfBytes,
    capturedStates,
    isCapturing,
    isSweeping,
    statusNote,
    onCaptureState,
    onAutoSweep,
    onMoveState,
    onRemoveState,
    onOpenPromoteReview,
    onExitConvertMode,
  } = props;

  const root = document.createElement('div');
  root.className = 'ast-swf-distiller-strip';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'Run-to-Convert Live Flash Distiller');
  root.style.cssText =
    'background:#0f172a; border-top:1px solid #334155; padding:12px 16px; display:flex; flex-direction:column; gap:10px; color:#f8fafc;';

  // Estimate native draft size from captured SVG layers + lightweight AST overhead (~1.6 KB)
  const rawSvgBytes = capturedStates.reduce((acc, s) => acc + (s.svgMarkup ? s.svgMarkup.length : 0), 0);
  const estNativeBytes = capturedStates.length > 0 ? Math.round(rawSvgBytes * 0.72 + 1600) : 0;

  // Row 1: Studio Header + Primary Actions (single-line controls, unboxed metadata)
  const topRow = document.createElement('div');
  topRow.style.cssText =
    'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;';

  const infoCol = document.createElement('div');
  infoCol.style.cssText = 'display:flex; flex-direction:column; gap:2px; min-width:220px;';

  const heading = document.createElement('div');
  heading.style.cssText = 'font-size:0.86rem; font-weight:700; color:#f8fafc;';
  heading.textContent = `Run-to-Convert Studio: ${lessonTitle}`;

  const metaLine = document.createElement('div');
  metaLine.style.cssText =
    'font-size:0.74rem; color:#94a3b8; font-variant-numeric:tabular-nums; display:flex; align-items:center; gap:6px; flex-wrap:wrap;';
  const parts: string[] = [
    `${capturedStates.length} state${capturedStates.length === 1 ? '' : 's'} captured`,
  ];
  if (originalSwfBytes > 0) {
    parts.push(`Source SWF ${formatKb(originalSwfBytes)}`);
  }
  if (estNativeBytes > 0) {
    parts.push(`Native draft ~${formatKb(estNativeBytes)} (0 B Flash bytecode)`);
  }
  metaLine.textContent = parts.join(' · ');

  infoCol.appendChild(heading);
  infoCol.appendChild(metaLine);
  topRow.appendChild(infoCol);

  const actionsCol = document.createElement('div');
  actionsCol.style.cssText = 'display:flex; align-items:center; gap:8px; flex-wrap:wrap;';

  const captureBtn = document.createElement('button');
  captureBtn.type = 'button';
  captureBtn.disabled = isCapturing || isSweeping;
  captureBtn.style.cssText =
    'padding:6px 12px; border-radius:6px; background:#0284c7; color:#ffffff; border:1px solid #38bdf8; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:opacity 150ms ease;';
  captureBtn.textContent = isCapturing ? 'Capturing...' : 'Capture State';
  captureBtn.onclick = () => onCaptureState();
  actionsCol.appendChild(captureBtn);

  const sweepBtn = document.createElement('button');
  sweepBtn.type = 'button';
  sweepBtn.disabled = isCapturing || isSweeping;
  sweepBtn.style.cssText =
    'padding:6px 12px; border-radius:6px; background:#1e293b; color:#e2e8f0; border:1px solid #475569; font-size:0.76rem; font-weight:600; cursor:pointer; white-space:nowrap;';
  sweepBtn.textContent = isSweeping ? 'Sweeping...' : 'Auto-Sweep Frames';
  sweepBtn.title = 'Automatically step across labeled frames and keyframes within a safe time budget';
  sweepBtn.onclick = () => onAutoSweep();
  actionsCol.appendChild(sweepBtn);

  const promoteBtn = document.createElement('button');
  promoteBtn.type = 'button';
  promoteBtn.disabled = capturedStates.length === 0 || isCapturing || isSweeping;
  promoteBtn.style.cssText =
    capturedStates.length > 0
      ? 'padding:6px 14px; border-radius:6px; background:#059669; color:#ffffff; border:1px solid #34d399; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;'
      : 'padding:6px 14px; border-radius:6px; background:#1e293b; color:#64748b; border:1px solid #334155; font-size:0.76rem; font-weight:600; cursor:not-allowed; white-space:nowrap;';
  promoteBtn.textContent = 'Promote to Native AST';
  promoteBtn.onclick = () => onOpenPromoteReview();
  actionsCol.appendChild(promoteBtn);

  const exitBtn = document.createElement('button');
  exitBtn.type = 'button';
  exitBtn.style.cssText =
    'padding:6px 10px; border-radius:6px; background:transparent; color:#94a3b8; border:1px solid #334155; font-size:0.74rem; font-weight:600; cursor:pointer; white-space:nowrap;';
  exitBtn.textContent = 'Close';
  exitBtn.onclick = () => onExitConvertMode();
  actionsCol.appendChild(exitBtn);

  topRow.appendChild(actionsCol);
  root.appendChild(topRow);

  // Optional subtle status line (plain text, zero pill badges)
  if (statusNote) {
    const noteEl = document.createElement('div');
    noteEl.style.cssText = 'font-size:0.74rem; color:#7dd3fc; line-height:1.4;';
    noteEl.textContent = statusNote;
    root.appendChild(noteEl);
  }

  // Row 2: Captured States Filmstrip (or clean empty-state guidance)
  if (capturedStates.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.style.cssText =
      'padding:10px 12px; border:1px solid #1e293b; border-radius:8px; background:#090d16; font-size:0.76rem; color:#94a3b8; line-height:1.45;';
    emptyEl.textContent =
      'Interact with the live Flash stage above (click Start, advance steps, or adjust controls), then click Capture State on each screen you want in your native cartridge — or use Auto-Sweep Frames.';
    root.appendChild(emptyEl);
  } else {
    const strip = document.createElement('div');
    strip.style.cssText =
      'display:flex; align-items:stretch; gap:8px; overflow-x:auto; padding-bottom:2px;';

    capturedStates.forEach((st, idx) => {
      const card = document.createElement('div');
      card.style.cssText =
        'flex:0 0 186px; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between; gap:6px;';

      const cardTop = document.createElement('div');
      cardTop.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:6px;';

      const indexLabel = document.createElement('span');
      indexLabel.style.cssText =
        'font-size:0.7rem; font-weight:700; color:#38bdf8; font-variant-numeric:tabular-nums;';
      indexLabel.textContent = `View ${idx + 1} · F${st.frameNumber}`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Remove View ${idx + 1}`);
      removeBtn.style.cssText =
        'background:transparent; border:none; color:#94a3b8; font-size:0.72rem; cursor:pointer; padding:0 4px;';
      removeBtn.textContent = 'Remove';
      removeBtn.onclick = () => onRemoveState(idx);

      cardTop.appendChild(indexLabel);
      cardTop.appendChild(removeBtn);

      const titleEl = document.createElement('div');
      titleEl.style.cssText =
        'font-size:0.76rem; font-weight:600; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
      titleEl.title = st.title;
      titleEl.textContent = st.title;

      const cardFoot = document.createElement('div');
      cardFoot.style.cssText =
        'display:flex; justify-content:space-between; align-items:center; gap:6px; font-size:0.68rem; color:#94a3b8; font-variant-numeric:tabular-nums;';

      const statsEl = document.createElement('span');
      const btnCount = st.observedButtons ? st.observedButtons.length : 0;
      statsEl.textContent = `${st.nodeCount} nodes${btnCount > 0 ? ` · ${btnCount} btn` : ''}`;

      const orderBtns = document.createElement('div');
      orderBtns.style.cssText = 'display:inline-flex; gap:4px;';

      if (idx > 0) {
        const leftBtn = document.createElement('button');
        leftBtn.type = 'button';
        leftBtn.setAttribute('aria-label', `Move View ${idx + 1} earlier`);
        leftBtn.style.cssText =
          'background:#0f172a; border:1px solid #334155; border-radius:4px; color:#cbd5e1; font-size:0.68rem; padding:1px 5px; cursor:pointer;';
        leftBtn.textContent = '←';
        leftBtn.onclick = () => onMoveState(idx, -1);
        orderBtns.appendChild(leftBtn);
      }
      if (idx < capturedStates.length - 1) {
        const rightBtn = document.createElement('button');
        rightBtn.type = 'button';
        rightBtn.setAttribute('aria-label', `Move View ${idx + 1} later`);
        rightBtn.style.cssText =
          'background:#0f172a; border:1px solid #334155; border-radius:4px; color:#cbd5e1; font-size:0.68rem; padding:1px 5px; cursor:pointer;';
        rightBtn.textContent = '→';
        rightBtn.onclick = () => onMoveState(idx, 1);
        orderBtns.appendChild(rightBtn);
      }

      cardFoot.appendChild(statsEl);
      cardFoot.appendChild(orderBtns);

      card.appendChild(cardTop);
      card.appendChild(titleEl);
      card.appendChild(cardFoot);
      strip.appendChild(card);
    });

    root.appendChild(strip);
  }

  return root;
}
