// src/components/player/SwfTranspilerDrawer.ts
/**
 * SWF / Adobe Flash Binary Importer & Run-to-Convert Native AST Distiller Drawer
 * Pure Vanilla TypeScript / DOM component (lazy-loaded on demand).
 * Supports three unified workflows:
 *   1. Run Live — play directly on the pure-SVG AVM1 micro-VM
 *   2. Run-to-Convert — play live + capture SVG states into a native AST cartridge
 *   3. Quick Transform — bounded auto-sweep into a bytecode-free native AST cartridge
 */

import { transpileSwfToAst, type SwfTranspileResult } from '../../utils/swfAstParser';
import {
  buildFlashArcadeSampleSwf,
  buildFlashAs3LabSampleSwf,
  buildFlashPacmanSampleSwf,
  buildFlashPendulumSampleSwf,
} from '../../utils/swfSampleBuilder';
import {
  distillSwfStatesToNativeCartridge,
  generateEcoCheckpoints,
  polishDistillationWithNano,
  sanitizeSlugId,
  type DistilledCheckpoint,
  type DistilledNativeCartridge,
  type DistillTargetFormat,
  type SwfCapturedState,
} from '../../utils/swfNativeDistiller';
import { hasUserGrantedAiConsent } from '../../engine/nanoAvailability';

export type SwfLaunchMode = 'run' | 'run-to-convert' | 'quick-transform';

export interface SwfDistillReviewState {
  reviewOpen: boolean;
  lessonTitle: string;
  stageTag: string;
  format: DistillTargetFormat;
  states: SwfCapturedState[];
  checkpoints: DistilledCheckpoint[];
  originalSwfBytes: number;
  isPolishing: boolean;
  polishNote: string | null;
}

export interface SwfTranspilerDrawerProps {
  swfResult: SwfTranspileResult | null;
  setSwfResult: (res: SwfTranspileResult | null) => void;
  isParsingSwf: boolean;
  setIsParsingSwf: (val: boolean) => void;
  swfError: string | null;
  setSwfError: (err: string | null) => void;
  swfDragActive: boolean;
  setSwfDragActive: (val: boolean) => void;
  setCustomSvgCode: (code: string) => void;
  setCustomAstCode: (code: string) => void;
  postToPlayer: (payload: Record<string, any>) => void;
  setHotReloadFlash: (val: boolean) => void;
  swfFileName?: string;
  setSwfFileName?: (name: string) => void;
  selectedMode?: SwfLaunchMode;
  setSelectedMode?: (mode: SwfLaunchMode) => void;
  onLaunchCartridge?: (res: SwfTranspileResult, cleanName: string, mode?: SwfLaunchMode) => void;
  distillReview?: SwfDistillReviewState | null;
  onUpdateDistillReview?: (patch: Partial<SwfDistillReviewState>) => void;
  onBackToLiveCapture?: () => void;
  onSavePromotedCartridge?: (cart: DistilledNativeCartridge) => void;
  onClose?: () => void;
}

function formatKb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0.0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function renderPromotionReviewPanel(
  review: SwfDistillReviewState,
  onUpdate: (patch: Partial<SwfDistillReviewState>) => void,
  onSavePromoted: (cart: DistilledNativeCartridge) => void,
  onBackToLiveCapture?: () => void,
  onClose?: () => void
): HTMLElement {
  const panel = document.createElement('div');
  panel.style.cssText = 'display:flex; flex-direction:column; gap:14px;';

  const checkpoints =
    review.checkpoints.length > 0
      ? review.checkpoints
      : generateEcoCheckpoints(review.states, review.lessonTitle);

  const previewCartridge = distillSwfStatesToNativeCartridge({
    id: sanitizeSlugId(review.lessonTitle),
    title: review.lessonTitle,
    stage: review.stageTag,
    format: review.format,
    states: review.states,
    checkpoints,
    originalSwfBytes: review.originalSwfBytes,
  });
  const m = previewCartridge.metrics;

  // Header
  const header = document.createElement('div');
  header.style.cssText =
    'display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;';

  const titleWrap = document.createElement('div');
  const h = document.createElement('strong');
  h.style.cssText = 'font-size:0.96rem; color:#f8fafc; display:block;';
  h.textContent = 'Promote to Native AST Cartridge';

  const sub = document.createElement('div');
  sub.style.cssText =
    'font-size:0.75rem; color:#94a3b8; margin-top:2px; font-variant-numeric:tabular-nums;';
  const savingsStr =
    m.originalBytes > 0 && m.savedPercent > 0
      ? `${formatKb(m.originalBytes)} SWF → ${formatKb(m.nativeTotalBytes)} Native (${m.savedPercent}% smaller)`
      : `Native size ${formatKb(m.nativeTotalBytes)} (${formatKb(m.nativeSvgBytes)} SVG · ${formatKb(m.nativeAstBytes)} AST)`;
  sub.textContent = `${m.stateCount} views · ${savingsStr} · 0 B Flash bytecode · ${m.dedupedPathCount} shared paths hoisted`;

  titleWrap.appendChild(h);
  titleWrap.appendChild(sub);
  header.appendChild(titleWrap);

  const headerBtns = document.createElement('div');
  headerBtns.style.cssText = 'display:flex; align-items:center; gap:8px; flex-wrap:wrap;';

  if (onBackToLiveCapture) {
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.style.cssText =
      'padding:5px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.75rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    backBtn.textContent = '← Capture More Views';
    backBtn.onclick = () => onBackToLiveCapture();
    headerBtns.appendChild(backBtn);
  }
  if (onClose) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.cssText =
      'padding:5px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.75rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => onClose();
    headerBtns.appendChild(closeBtn);
  }
  header.appendChild(headerBtns);
  panel.appendChild(header);

  // Format selector + Metadata inputs
  const metaGrid = document.createElement('div');
  metaGrid.style.cssText =
    'display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px; padding:12px; background:#090d16; border:1px solid #334155; border-radius:10px;';

  // Title input
  const titleField = document.createElement('label');
  titleField.style.cssText = 'display:flex; flex-direction:column; gap:4px; font-size:0.73rem; color:#94a3b8;';
  titleField.textContent = 'Native Lesson Title';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.value = review.lessonTitle;
  titleInput.style.cssText =
    'padding:6px 10px; border-radius:6px; background:#1e293b; border:1px solid #475569; color:#f8fafc; font-size:0.8rem;';
  titleInput.onchange = () => onUpdate({ lessonTitle: titleInput.value.trim() || 'Native Lesson' });
  titleField.appendChild(titleInput);
  metaGrid.appendChild(titleField);

  // Key Stage / Subject Tag
  const stageField = document.createElement('label');
  stageField.style.cssText = 'display:flex; flex-direction:column; gap:4px; font-size:0.73rem; color:#94a3b8;';
  stageField.textContent = 'Curriculum Stage';
  const stageSelect = document.createElement('select');
  stageSelect.style.cssText =
    'padding:6px 10px; border-radius:6px; background:#1e293b; border:1px solid #475569; color:#f8fafc; font-size:0.8rem;';
  ['KS1 / KS2 PRIMARY', 'KS3 CURRICULUM', 'KS4 GCSE', 'CATHOLIC LIFE', 'STEM LAB', 'NATIVE DISTILLED'].forEach(
    (opt) => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      if (opt === review.stageTag) o.selected = true;
      stageSelect.appendChild(o);
    }
  );
  stageSelect.onchange = () => onUpdate({ stageTag: stageSelect.value });
  stageField.appendChild(stageSelect);
  metaGrid.appendChild(stageField);

  // Native Format segmented control
  const fmtWrap = document.createElement('div');
  fmtWrap.style.cssText = 'display:flex; flex-direction:column; gap:4px; font-size:0.73rem; color:#94a3b8;';
  const fmtLabel = document.createElement('span');
  fmtLabel.textContent = 'Output Cartridge Type';
  const fmtSeg = document.createElement('div');
  fmtSeg.style.cssText =
    'display:inline-flex; gap:4px; padding:3px; background:#1e293b; border:1px solid #334155; border-radius:8px; width:fit-content;';
  (
    [
      { id: 'Slide' as const, label: 'Interactive Slide Deck' },
      { id: 'Sim' as const, label: 'Reactive Simulation' },
    ]
  ).forEach((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    const active = review.format === item.id;
    b.style.cssText = active
      ? 'padding:5px 10px; border-radius:6px; background:#0284c7; color:#ffffff; border:none; font-size:0.74rem; font-weight:700; cursor:pointer; white-space:nowrap;'
      : 'padding:5px 10px; border-radius:6px; background:transparent; color:#cbd5e1; border:none; font-size:0.74rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    b.textContent = item.label;
    b.onclick = () => onUpdate({ format: item.id });
    fmtSeg.appendChild(b);
  });
  fmtWrap.appendChild(fmtLabel);
  fmtWrap.appendChild(fmtSeg);
  metaGrid.appendChild(fmtWrap);

  panel.appendChild(metaGrid);

  // Per-view narration captions (feeds :subtitles, Universal Translator & BSL/Makaton Avatar)
  const captionsSection = document.createElement('div');
  captionsSection.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

  const capHeader = document.createElement('div');
  capHeader.style.cssText = 'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;';

  const capTitle = document.createElement('div');
  capTitle.style.cssText = 'font-size:0.78rem; font-weight:700; color:#e2e8f0;';
  capTitle.textContent = 'BSL & Subtitle Narration per Captured View';

  const nanoAllowed = hasUserGrantedAiConsent();
  const polishBtn = document.createElement('button');
  polishBtn.type = 'button';
  polishBtn.disabled = review.isPolishing;
  polishBtn.style.cssText =
    'padding:5px 10px; border-radius:6px; background:#1e293b; color:#7dd3fc; border:1px solid #0284c7; font-size:0.73rem; font-weight:600; cursor:pointer; white-space:nowrap;';
  polishBtn.textContent = review.isPolishing
    ? 'Polishing on-device...'
    : nanoAllowed
    ? 'Polish with Gemini Nano'
    : 'Refresh Offline Eco Captions';
  polishBtn.onclick = async () => {
    if (!nanoAllowed) {
      const freshCps = generateEcoCheckpoints(review.states, review.lessonTitle);
      onUpdate({
        checkpoints: freshCps,
        polishNote: 'Offline Eco Mode captions & formative checkpoint verified (0 MB download).',
      });
      return;
    }
    onUpdate({ isPolishing: true, polishNote: 'Running on-device Gemini Nano polish...' });
    const res = await polishDistillationWithNano(review.lessonTitle, review.states, checkpoints);
    const updatedStates = review.states.map((st, idx) => ({
      ...st,
      caption: res.captions[idx] || st.caption,
    }));
    onUpdate({
      lessonTitle: res.title,
      states: updatedStates,
      checkpoints: res.checkpoints,
      isPolishing: false,
      polishNote: res.note,
    });
  };

  capHeader.appendChild(capTitle);
  capHeader.appendChild(polishBtn);
  captionsSection.appendChild(capHeader);

  if (review.polishNote) {
    const note = document.createElement('div');
    note.style.cssText = 'font-size:0.73rem; color:#7dd3fc;';
    note.textContent = review.polishNote;
    captionsSection.appendChild(note);
  }

  const capList = document.createElement('div');
  capList.style.cssText = 'display:flex; flex-direction:column; gap:6px; max-height:175px; overflow-y:auto;';
  review.states.forEach((st, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:grid; grid-template-columns:84px 1fr; gap:8px; align-items:center;';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:0.73rem; color:#94a3b8; font-variant-numeric:tabular-nums;';
    lbl.textContent = `View ${idx + 1} · F${st.frameNumber}`;

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = st.caption;
    inp.setAttribute('aria-label', `Caption for View ${idx + 1}`);
    inp.style.cssText =
      'padding:5px 9px; border-radius:6px; background:#090d16; border:1px solid #334155; color:#f8fafc; font-size:0.76rem;';
    inp.onchange = () => {
      const nextStates = review.states.map((item, i) =>
        i === idx ? { ...item, caption: inp.value.trim() || item.caption } : item
      );
      onUpdate({ states: nextStates });
    };

    row.appendChild(lbl);
    row.appendChild(inp);
    capList.appendChild(row);
  });
  captionsSection.appendChild(capList);
  panel.appendChild(captionsSection);

  // Primary Formative Checkpoint Editor
  const cp0 = checkpoints[0];
  if (cp0) {
    const cpBox = document.createElement('div');
    cpBox.style.cssText =
      'display:flex; flex-direction:column; gap:6px; padding:10px 12px; background:#090d16; border:1px solid #334155; border-radius:8px;';
    const cpTitle = document.createElement('div');
    cpTitle.style.cssText = 'font-size:0.75rem; font-weight:700; color:#e2e8f0;';
    cpTitle.textContent = 'Formative Checkpoint Question (Auto-Generated Offline)';

    const cpPromptInput = document.createElement('input');
    cpPromptInput.type = 'text';
    cpPromptInput.value = cp0.prompt;
    cpPromptInput.setAttribute('aria-label', 'Checkpoint prompt');
    cpPromptInput.style.cssText =
      'padding:5px 9px; border-radius:6px; background:#1e293b; border:1px solid #475569; color:#f8fafc; font-size:0.76rem;';
    cpPromptInput.onchange = () => {
      const next = checkpoints.map((c, i) => (i === 0 ? { ...c, prompt: cpPromptInput.value.trim() || c.prompt } : c));
      onUpdate({ checkpoints: next });
    };

    const cpMeta = document.createElement('div');
    cpMeta.style.cssText = 'font-size:0.71rem; color:#94a3b8;';
    cpMeta.textContent = `Options: ${cp0.options.join(' · ')} (Correct: ${cp0.options[cp0.answer] || cp0.options[0]})`;

    cpBox.appendChild(cpTitle);
    cpBox.appendChild(cpPromptInput);
    cpBox.appendChild(cpMeta);
    panel.appendChild(cpBox);
  }

  // Footer Actions (1 clear primary CTA + secondary exports)
  const footer = document.createElement('div');
  footer.style.cssText =
    'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-top:4px; border-top:1px solid #1e293b;';

  const statusTag = document.createElement('span');
  statusTag.style.cssText = 'font-size:0.74rem; font-weight:600; color:#34d399;';
  statusTag.textContent = `Native Ready · Pure W3C SVG + AST (${review.format})`;

  const ctaGroup = document.createElement('div');
  ctaGroup.style.cssText = 'display:flex; align-items:center; gap:8px; flex-wrap:wrap;';

  const copyAstBtn = document.createElement('button');
  copyAstBtn.type = 'button';
  copyAstBtn.style.cssText =
    'padding:6px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.75rem; font-weight:600; cursor:pointer; white-space:nowrap;';
  copyAstBtn.textContent = 'Copy Pure AST';
  copyAstBtn.onclick = () => {
    navigator.clipboard?.writeText(previewCartridge.astSource);
    copyAstBtn.textContent = 'Copied AST';
    setTimeout(() => {
      copyAstBtn.textContent = 'Copy Pure AST';
    }, 1600);
  };

  const dlSvgBtn = document.createElement('button');
  dlSvgBtn.type = 'button';
  dlSvgBtn.style.cssText =
    'padding:6px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.75rem; font-weight:600; cursor:pointer; white-space:nowrap;';
  dlSvgBtn.textContent = 'Download Native SVG';
  dlSvgBtn.onclick = () => {
    const blob = new Blob([previewCartridge.svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewCartridge.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveLaunchBtn = document.createElement('button');
  saveLaunchBtn.type = 'button';
  saveLaunchBtn.style.cssText =
    'padding:7px 14px; border-radius:6px; background:#059669; color:#ffffff; border:1px solid #34d399; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap;';
  saveLaunchBtn.textContent = 'Save & Launch Native Cartridge';
  saveLaunchBtn.onclick = () => onSavePromoted(previewCartridge);

  ctaGroup.appendChild(copyAstBtn);
  ctaGroup.appendChild(dlSvgBtn);
  ctaGroup.appendChild(saveLaunchBtn);

  footer.appendChild(statusTag);
  footer.appendChild(ctaGroup);
  panel.appendChild(footer);

  return panel;
}

export function renderSwfTranspilerDrawer(props: SwfTranspilerDrawerProps): HTMLElement {
  const {
    swfResult,
    setSwfResult,
    isParsingSwf,
    setIsParsingSwf,
    swfError,
    setSwfError,
    swfDragActive,
    setSwfDragActive,
    setCustomSvgCode,
    setCustomAstCode,
    postToPlayer,
    setHotReloadFlash,
    swfFileName = 'imported-swf',
    setSwfFileName,
    selectedMode = 'run-to-convert',
    setSelectedMode,
    onLaunchCartridge,
    distillReview,
    onUpdateDistillReview,
    onBackToLiveCapture,
    onSavePromotedCartridge,
    onClose,
  } = props;

  const root = document.createElement('div');
  root.className = 'ast-swf-transpiler-drawer';
  root.style.cssText = 'display:flex; flex-direction:column; gap:14px;';

  // If the Promotion Review Panel is active with captured states, show it directly as the focal view
  if (
    distillReview &&
    distillReview.reviewOpen &&
    distillReview.states.length > 0 &&
    onUpdateDistillReview &&
    onSavePromotedCartridge
  ) {
    root.appendChild(
      renderPromotionReviewPanel(
        distillReview,
        onUpdateDistillReview,
        onSavePromotedCartridge,
        onBackToLiveCapture,
        onClose
      )
    );
    return root;
  }

  if (onClose) {
    const topBar = document.createElement('div');
    topBar.style.cssText =
      'display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;';
    topBar.innerHTML = `
      <div>
        <strong style="font-size:0.94rem; color:var(--stj-text, #f8fafc); display:block;">Adobe Flash (.swf) Player &amp; Native AST Distiller</strong>
        <span style="font-size:0.75rem; color:var(--stj-text-muted, #94a3b8);">Run legacy Flash in pure SVG or distill live states into ultra-light, bytecode-free native curriculum cartridges.</span>
      </div>
    `;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.cssText =
      'padding:5px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.75rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => onClose();
    topBar.appendChild(closeBtn);
    root.appendChild(topBar);
  }

  // 1. Drag & Drop Upload Zone
  const dropZone = document.createElement('div');
  dropZone.style.cssText = `
    border: ${swfDragActive ? '2px dashed #38bdf8' : '1.5px dashed #334155'};
    background: ${swfDragActive ? 'rgba(2, 132, 199, 0.1)' : '#090d16'};
    border-radius: 10px;
    padding: 20px 16px;
    text-align: center;
    transition: border-color 150ms ease, background 150ms ease;
    cursor: pointer;
  `;

  dropZone.innerHTML = `
    <strong style="font-size:0.92rem; color:#f8fafc; display:block; margin-bottom:4px;">
      Drop a Legacy Adobe Flash (.swf) File Here
    </strong>
    <p style="margin:0 0 12px 0; font-size:0.77rem; color:#94a3b8;">
      100% offline local parser for FWS, CWS &amp; ZWS (LZMA) Flash binaries — runs on pure W3C SVG DOM with zero external requests.
    </p>
    <div style="display:inline-flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center;">
      <label class="stj-btn stj-btn-primary stj-btn-sm" style="cursor:pointer; font-size:0.76rem; white-space:nowrap;">
        <span>Choose .swf File</span>
        <input id="ast-swf-file-input" type="file" accept=".swf" style="display:none;" />
      </label>
      <span style="font-size:0.74rem; color:#94a3b8;">or load a built-in Flash sample below</span>
    </div>
  `;

  const processBuffer = async (buf: ArrayBuffer, cleanName: string) => {
    setIsParsingSwf(true);
    setSwfError(null);
    setSwfFileName?.(cleanName);
    try {
      const res = await transpileSwfToAst(buf, cleanName);
      if (res.success) {
        setSwfResult(res);
        setCustomSvgCode(res.svgMarkup);
        setCustomAstCode(res.astSource);
      } else {
        setSwfError(res.error || 'Failed to parse SWF binary.');
      }
    } catch (err: any) {
      setSwfError(err?.message || 'Error processing SWF file.');
    } finally {
      setIsParsingSwf(false);
    }
  };

  dropZone.ondragover = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSwfDragActive(true);
  };
  dropZone.ondragleave = (e) => {
    e.stopPropagation();
    setSwfDragActive(false);
  };
  dropZone.ondrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSwfDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const cleanName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    processBuffer(buf, cleanName);
  };

  const fileInput = dropZone.querySelector<HTMLInputElement>('#ast-swf-file-input');
  fileInput?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const cleanName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    processBuffer(buf, cleanName);
  });

  root.appendChild(dropZone);

  // 2. Built-in Educational Samples
  const samplesWrap = document.createElement('div');
  samplesWrap.style.cssText = 'display:flex; align-items:center; gap:8px; flex-wrap:wrap;';
  const sampleLabel = document.createElement('span');
  sampleLabel.style.cssText = 'font-size:0.74rem; font-weight:600; color:#94a3b8;';
  sampleLabel.textContent = 'Built-in Flash Samples:';
  samplesWrap.appendChild(sampleLabel);

  const samples = [
    {
      id: 'as3-lab',
      title: 'AS3 Vector Lab (as3-lab.swf · AVM2)',
      desc: 'Live binary SWF v10 ActionScript 3 (DoABC2 + SymbolClass) with Event.ENTER_FRAME orbital kinematics, Graphics Drawing API vector trails, Arrow/Space steering, bubbling MouseEvent pulse button, Timer, ColorTransform, and PCM Web Audio.',
      mockBytes: () => buildFlashAs3LabSampleSwf(),
    },
    {
      id: 'pacman',
      title: 'Pac-Man Arcade (pacman.swf)',
      desc: 'Live binary SWF v8 Pac-Man with chomping sprite, Arrow/WASD steering, GlowFilter walls/ghosts, PCM waka/power Web Audio, Color.setRGB frightened ghosts, and editable player input.',
      mockBytes: () => buildFlashPacmanSampleSwf(),
    },
    {
      id: 'flash-arcade-target',
      title: 'Flash AVM1 Arcade Target',
      desc: 'Live binary SWF v8 demo with Start button, mouse/arrow controls, hitTest scoring, and attachMovie sparks.',
      mockBytes: () => buildFlashArcadeSampleSwf(),
    },
    {
      id: 'flash-pendulum',
      title: 'Flash Harmonic Pendulum',
      desc: 'Live binary SWF v8 physics demo using AVM1 Math.sin/cos, Flash Drawing API rod, and Pause/Resume button.',
      mockBytes: () => buildFlashPendulumSampleSwf(),
    },
  ];

  samples.forEach((sample) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText =
      'padding:5px 10px; border-radius:6px; background:#1e293b; color:#e2e8f0; border:1px solid #334155; font-size:0.74rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    btn.title = sample.desc;
    btn.textContent = sample.title;
    btn.onclick = () => {
      const bytes = sample.mockBytes();
      processBuffer(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        sample.id
      );
    };
    samplesWrap.appendChild(btn);
  });
  root.appendChild(samplesWrap);

  // 3. Error state
  if (swfError) {
    const errBox = document.createElement('div');
    errBox.style.cssText =
      'padding:8px 12px; border-radius:6px; background:rgba(239, 68, 68, 0.12); border:1px solid #ef4444; color:#fca5a5; font-size:0.78rem;';
    errBox.textContent = `Import error: ${swfError}`;
    root.appendChild(errBox);
  }

  // 4. Loading state
  if (isParsingSwf) {
    const loadBox = document.createElement('div');
    loadBox.style.cssText = 'padding:10px; text-align:center; color:#38bdf8; font-size:0.8rem;';
    loadBox.textContent = 'Parsing SWF binary stream and building vector shapes...';
    root.appendChild(loadBox);
  }

  // 5. Parsed Result & Three-Path Mode Selector
  if (swfResult && swfResult.metadata) {
    const meta = swfResult.metadata;
    const resBox = document.createElement('div');
    resBox.style.cssText =
      'background:#090d16; border:1px solid #334155; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:12px;';

    // Unboxed clean metadata header (Zero-Pill Discipline)
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

    const titleEl = document.createElement('strong');
    titleEl.style.cssText = 'font-size:0.9rem; color:#f8fafc;';
    titleEl.textContent = `Ready: ${swfFileName || 'imported-swf'}.swf`;

    const hasLiveAbc = Boolean(meta.isActionScript3 && (meta.abcCount || 0) > 0);
    const modeLabel = hasLiveAbc
      ? 'AS3 / AVM2 Live Micro-VM'
      : meta.isActionScript3
      ? 'AS3 Static Vector Timeline'
      : meta.executionModel === 'sim-modal'
      ? 'AVM1 Interactive Sim'
      : meta.executionModel === 'sim-continuous'
      ? 'AVM1 Continuous Sim'
      : 'Vector Stage';

    const payloadKb = formatKb((swfResult.svgMarkup?.length || 0) + (swfResult.astSource?.length || 0));
    const metaSummary = document.createElement('div');
    metaSummary.style.cssText =
      'font-size:0.74rem; color:#94a3b8; font-variant-numeric:tabular-nums; line-height:1.45;';
    const summaryParts = [
      `SWF v${meta.version} (${meta.signature})`,
      `${meta.width} × ${meta.height} px`,
      `${meta.shapeCount} shapes`,
      `${meta.frameCount} frame${meta.frameCount === 1 ? '' : 's'} at ${Math.round(meta.frameRate)} FPS`,
      modeLabel,
      `Current payload ${payloadKb}`,
    ];
    if (hasLiveAbc) {
      const clsCount = meta.as3Classes ? meta.as3Classes.length : 0;
      summaryParts.push(`${meta.abcCount} ABC block${meta.abcCount === 1 ? '' : 's'} · ${clsCount} class${clsCount === 1 ? '' : 'es'} · ${meta.traitCount || 0} traits`);
    }
    if (meta.strippedPreloaderFrames && meta.strippedPreloaderFrames > 0) {
      summaryParts.push(`Skipped ${meta.strippedPreloaderFrames} preloader frame(s) → F${meta.entryFrame || meta.strippedPreloaderFrames + 1}`);
    }
    metaSummary.textContent = summaryParts.join(' · ');

    headerRow.appendChild(titleEl);
    headerRow.appendChild(metaSummary);
    resBox.appendChild(headerRow);

    if (hasLiveAbc) {
      const as3Note = document.createElement('div');
      as3Note.style.cssText =
        'padding:8px 10px; border-radius:6px; background:rgba(14, 165, 233, 0.12); border:1px solid rgba(56, 189, 248, 0.45); color:#7dd3fc; font-size:0.74rem; line-height:1.4;';
      const docPart = meta.documentClass ? `Document Class "${meta.documentClass}"` : 'AVM2 DoABC bytecode';
      as3Note.textContent =
        `ActionScript 3 (AVM2) Ready: ${docPart} executes live on the lazy-loaded pure-SVG AVM2 Micro-VM (EventDispatcher bubbling, Graphics Drawing API, Timer, Web Audio, and Universal Gesture Bus) and supports Hybrid Run-to-Convert.`;
      resBox.appendChild(as3Note);
    } else if (meta.isActionScript3) {
      const as3Note = document.createElement('div');
      as3Note.style.cssText =
        'padding:8px 10px; border-radius:6px; background:rgba(217, 119, 6, 0.14); border:1px solid rgba(217, 119, 6, 0.45); color:#fcd34d; font-size:0.74rem; line-height:1.4;';
      as3Note.textContent =
        'AS3 Vector Timeline: No DoABC script blocks were found in this file, so vector frames render cleanly and can be promoted into native Slide cartridges.';
      resBox.appendChild(as3Note);
    }

    // Three-Path Workflow Selector (Run Live | Run-to-Convert | Quick Transform)
    let activeMode: SwfLaunchMode = selectedMode;
    const modeDescriptions: Record<SwfLaunchMode, { cta: string; desc: string }> = {
      run: {
        cta: 'Run Live on Stage',
        desc: hasLiveAbc
          ? 'Play immediately on the lazy-loaded pure-SVG AVM2 (ActionScript 3) micro-VM with original Flash interaction.'
          : 'Play immediately on the pure-SVG AVM1 micro-VM with original Flash interaction.',
      },
      'run-to-convert': {
        cta: 'Launch Run-to-Convert Studio',
        desc: 'Play live on stage while capturing screens, buttons, and variables to promote into a tiny bytecode-free native AST cartridge.',
      },
      'quick-transform': {
        cta: 'Quick Transform to Native AST',
        desc: 'Auto-sweep labeled frames and keyframes within a safe time budget, then open the Native AST promotion review directly.',
      },
    };

    const modeSection = document.createElement('div');
    modeSection.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

    const segBar = document.createElement('div');
    segBar.setAttribute('role', 'tablist');
    segBar.setAttribute('aria-label', 'Flash execution or distillation mode');
    segBar.style.cssText =
      'display:inline-flex; gap:4px; padding:4px; background:#1e293b; border:1px solid #334155; border-radius:8px; flex-wrap:wrap; width:fit-content;';

    const modeDescEl = document.createElement('div');
    modeDescEl.style.cssText = 'font-size:0.75rem; color:#cbd5e1; line-height:1.4;';

    const primaryCtaBtn = document.createElement('button');
    primaryCtaBtn.type = 'button';
    primaryCtaBtn.style.cssText =
      'padding:7px 14px; border-radius:6px; background:#0284c7; color:#ffffff; border:1px solid #38bdf8; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap;';

    const modeItems: Array<{ id: SwfLaunchMode; label: string }> = [
      { id: 'run', label: 'Run Live' },
      { id: 'run-to-convert', label: 'Run-to-Convert' },
      { id: 'quick-transform', label: 'Quick Transform' },
    ];
    const modeButtons: HTMLButtonElement[] = [];

    const syncModeUi = () => {
      modeButtons.forEach((b, i) => {
        const isSel = modeItems[i].id === activeMode;
        b.setAttribute('aria-selected', String(isSel));
        b.style.background = isSel ? '#0284c7' : 'transparent';
        b.style.color = isSel ? '#ffffff' : '#cbd5e1';
        b.style.fontWeight = isSel ? '700' : '600';
      });
      modeDescEl.textContent = modeDescriptions[activeMode].desc;
      primaryCtaBtn.textContent = modeDescriptions[activeMode].cta;
    };

    modeItems.forEach((item) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.style.cssText =
        'padding:5px 11px; border-radius:6px; border:none; font-size:0.75rem; cursor:pointer; white-space:nowrap; transition:background 150ms ease;';
      b.textContent = item.label;
      b.onclick = () => {
        activeMode = item.id;
        setSelectedMode?.(item.id);
        syncModeUi();
      };
      modeButtons.push(b);
      segBar.appendChild(b);
    });
    syncModeUi();

    modeSection.appendChild(segBar);
    modeSection.appendChild(modeDescEl);
    resBox.appendChild(modeSection);

    // Primary CTA + Secondary Actions Row
    const actionsRow = document.createElement('div');
    actionsRow.style.cssText = 'display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;';

    primaryCtaBtn.onclick = () => {
      if (onLaunchCartridge) {
        onLaunchCartridge(swfResult, swfFileName, activeMode);
      } else {
        postToPlayer({ type: 'HOT_RELOAD_SVG', svg: swfResult.svgMarkup });
        postToPlayer({ type: 'HOT_RELOAD_AST', ast: swfResult.astSource });
        postToPlayer({ type: 'SEEK', progress: 0 });
        postToPlayer({ type: 'PLAY' });
      }
      setHotReloadFlash(true);
      setTimeout(() => setHotReloadFlash(false), 2200);
    };

    const secGroup = document.createElement('div');
    secGroup.style.cssText = 'display:flex; align-items:center; gap:8px; flex-wrap:wrap;';

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.style.cssText =
      'padding:6px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.74rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    downloadBtn.textContent = 'Download SVG';
    downloadBtn.onclick = () => {
      const blob = new Blob([swfResult.svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${swfFileName || 'transpiled-swf'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.style.cssText =
      'padding:6px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.74rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    copyBtn.textContent = 'Copy AST';
    copyBtn.onclick = () => {
      navigator.clipboard?.writeText(swfResult.astSource);
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.textContent = 'Copy AST';
      }, 1500);
    };

    secGroup.appendChild(downloadBtn);
    secGroup.appendChild(copyBtn);

    actionsRow.appendChild(primaryCtaBtn);
    actionsRow.appendChild(secGroup);
    resBox.appendChild(actionsRow);

    root.appendChild(resBox);
  }

  return root;
}

export const SwfTranspilerDrawer = renderSwfTranspilerDrawer;
export default renderSwfTranspilerDrawer;
