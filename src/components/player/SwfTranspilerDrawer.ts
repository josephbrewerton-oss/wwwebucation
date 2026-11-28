// src/components/player/SwfTranspilerDrawer.ts
/**
 * SWF / Adobe Flash Binary Importer & Run-to-Convert Native AST Distiller Drawer
 * Pure Vanilla TypeScript / DOM component (lazy-loaded on demand).
 * Supports three unified workflows:
 *   1. Run Live — play directly on the pure-SVG AVM1 micro-VM
 *   2. Run-to-Convert — play live + capture SVG states into a native AST cartridge
 *   3. Quick Transform — bounded auto-sweep into a bytecode-free native AST cartridge
 */

import {
  indexSwfHeaderAndTranspile,
  SWF_PARSER_SCHEMA_VERSION,
  type SwfTranspileResult,
} from '../../utils/swfAstParser';
import {
  deleteSwfHeaderRecord,
  getAllSwfHeaderRecords,
  updateSwfHeaderUpgradeStatus,
  type SwfHeaderIndexRecord,
  type SwfRuntimeHealthReport,
} from '../../services/dbStore';
import { harvestSwfSymbols } from '../../utils/swfSymbolHarvester';
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
  swfRuntimeHealth?: SwfRuntimeHealthReport | null;
  onClose?: () => void;
}

function formatKb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0.0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function buildSwfRecodeBrief(
  fileName: string,
  swfResult: SwfTranspileResult,
  runtimeHealth: SwfRuntimeHealthReport | null | undefined,
  harvestedIds: string[]
): string {
  const m = swfResult.metadata;
  const lines: string[] = [
    `# SWF → Native .astb Recode Brief: ${fileName}.swf`,
  ];
  if (m) {
    lines.push(
      `- **Header**: SWF v${m.version} (${m.signature}), ${m.width}×${m.height}px, ${m.frameCount} frame(s) @ ${Math.round(m.frameRate)} FPS`,
      `- **Execution Model**: ${m.isActionScript3 ? 'AS3 / AVM2' : 'AS1/2 / AVM1'} (${m.executionModel || 'vector'})${m.documentClass ? `, DocClass: ${m.documentClass}` : ''}`,
      `- **Assets**: ${m.shapeCount} shapes, ${m.spriteCount || 0} sprites, ${m.buttonCount || 0} buttons, ${m.staticTextCount || 0} text blocks`,
    );
    if (m.centrifuge) {
      lines.push(`- **Static Centrifuge**: ${m.centrifuge.verdict.toUpperCase()}`);
      if (m.centrifuge.sludgeReasons.length > 0) lines.push(`  - Blockers/Sludge: ${m.centrifuge.sludgeReasons.join('; ')}`);
      if (m.centrifuge.suspectReasons.length > 0) lines.push(`  - Watch items: ${m.centrifuge.suspectReasons.join('; ')}`);
      if (m.centrifuge.externalDependencyHits.length > 0) lines.push(`  - External URLs/Deps: ${m.centrifuge.externalDependencyHits.join(', ')}`);
    }
  }
  if (runtimeHealth) {
    const perfParts: string[] = [];
    if (typeof runtimeHealth.avgFrameMs === 'number') {
      perfParts.push(`avg=${runtimeHealth.avgFrameMs.toFixed(2)}ms`);
    }
    if (typeof runtimeHealth.p95FrameMs === 'number') {
      perfParts.push(`p95=${runtimeHealth.p95FrameMs.toFixed(2)}ms`);
    }
    if (typeof runtimeHealth.peakSvgNodes === 'number') {
      perfParts.push(`peakSvgNodes=${runtimeHealth.peakSvgNodes}`);
    }
    const perfSuffix = perfParts.length > 0 ? `, ${perfParts.join(', ')}` : '';
    lines.push(`- **Live Runtime Watchdog (${runtimeHealth.vm.toUpperCase()})**: ${runtimeHealth.verdict.toUpperCase()} (frames=${runtimeHealth.framesElapsed}, visibleNodes=${runtimeHealth.visibleNodes}${perfSuffix})`);
    if (runtimeHealth.reasons.length > 0) lines.push(`  - Reasons: ${runtimeHealth.reasons.join('; ')}`);
    if (runtimeHealth.unhandledOpcodes.length > 0) lines.push(`  - Unhandled opcodes: ${runtimeHealth.unhandledOpcodes.join(', ')}`);
    if (runtimeHealth.missingApis.length > 0) lines.push(`  - Unsupported Flash APIs: ${runtimeHealth.missingApis.join(', ')}`);
    if (runtimeHealth.externalCalls.length > 0) lines.push(`  - Blocked external calls: ${runtimeHealth.externalCalls.join(', ')}`);
    if (runtimeHealth.runtimeErrors.length > 0) lines.push(`  - Runtime errors: ${runtimeHealth.runtimeErrors.slice(0, 4).join(' | ')}`);
  }
  if (harvestedIds.length > 0) {
    lines.push(`- **Salvaged SVG Symbols (${harvestedIds.length})**: ${harvestedIds.map((id) => `#${id}`).join(', ')}`);
  }
  return lines.join('\n');
}

function triggerTextDownload(filename: string, content: string, mimeType: string): void {
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

async function compileAndDownloadAstb(opts: {
  id: string;
  title?: string;
  astSource: string;
  svgMarkup: string;
  btn: HTMLButtonElement;
}): Promise<void> {
  const origLabel = opts.btn.textContent || 'Download .astb';
  opts.btn.disabled = true;
  opts.btn.textContent = 'Compiling .astb...';
  try {
    const [{ compileAstTextToBytecode, isAstBytecode }, { downloadAstbBinary }] = await Promise.all([
      import('../../utils/astBytecode'),
      import('../../services/localCartridgeBuilder'),
    ]);
    const astbBytes = compileAstTextToBytecode(opts.astSource, {
      svgMarkup: opts.svgMarkup,
      idOverride: opts.id,
      titleOverride: opts.title,
    });
    if (!isAstBytecode(astbBytes)) {
      throw new Error('Compiled output failed ASTB header verification.');
    }
    downloadAstbBinary(opts.id, astbBytes);
    opts.btn.textContent = `Downloaded .astb (${formatKb(astbBytes.byteLength)})`;
  } catch (err: any) {
    console.error('[SwfTranspilerDrawer] Failed compiling .astb:', err);
    opts.btn.textContent = '.astb compile failed';
  } finally {
    opts.btn.disabled = false;
    setTimeout(() => {
      if (opts.btn.isConnected) opts.btn.textContent = origLabel;
    }, 2200);
  }
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
  dlSvgBtn.textContent = 'Download .svg';
  dlSvgBtn.title = `Download ${previewCartridge.id}.svg (pure W3C vector stage)`;
  dlSvgBtn.onclick = () => {
    triggerTextDownload(`${previewCartridge.id}.svg`, previewCartridge.svgMarkup, 'image/svg+xml;charset=utf-8');
  };

  const dlAstBtn = document.createElement('button');
  dlAstBtn.type = 'button';
  dlAstBtn.style.cssText =
    'padding:6px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.75rem; font-weight:600; cursor:pointer; white-space:nowrap;';
  dlAstBtn.textContent = 'Download .ast';
  dlAstBtn.title = `Download ${previewCartridge.id}.ast (pure declarative S-expression source)`;
  dlAstBtn.onclick = () => {
    triggerTextDownload(`${previewCartridge.id}.ast`, previewCartridge.astSource, 'text/plain;charset=utf-8');
  };

  const dlAstbBtn = document.createElement('button');
  dlAstbBtn.type = 'button';
  dlAstbBtn.style.cssText =
    'padding:6px 10px; border-radius:6px; background:#0f172a; color:#38bdf8; border:1px solid #0284c7; font-size:0.75rem; font-weight:700; cursor:pointer; white-space:nowrap;';
  dlAstbBtn.textContent = 'Download .astb';
  dlAstbBtn.title = `Compile and download standalone binary ${previewCartridge.id}.astb (embedded SVG + bytecode)`;
  dlAstbBtn.onclick = () => {
    void compileAndDownloadAstb({
      id: previewCartridge.id,
      title: previewCartridge.title,
      astSource: previewCartridge.astSource,
      svgMarkup: previewCartridge.svgMarkup,
      btn: dlAstbBtn,
    });
  };

  const saveLaunchBtn = document.createElement('button');
  saveLaunchBtn.type = 'button';
  saveLaunchBtn.style.cssText =
    'padding:7px 14px; border-radius:6px; background:#059669; color:#ffffff; border:1px solid #34d399; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap;';
  saveLaunchBtn.textContent = 'Save & Launch Native Cartridge';
  saveLaunchBtn.onclick = () => onSavePromoted(previewCartridge);

  ctaGroup.appendChild(dlSvgBtn);
  ctaGroup.appendChild(dlAstBtn);
  ctaGroup.appendChild(dlAstbBtn);
  ctaGroup.appendChild(copyAstBtn);
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
    swfRuntimeHealth,
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
    const handleSavePromoted = (cart: DistilledNativeCartridge) => {
      if (swfFileName) {
        void updateSwfHeaderUpgradeStatus(swfFileName, {
          upgradeStatus: 'distilled-native',
          nativeCartridgeId: cart.id,
          ...(cart.centrifuge ? { verdict: cart.centrifuge.verdict } : {}),
        });
      }
      onSavePromotedCartridge(cart);
    };
    root.appendChild(
      renderPromotionReviewPanel(
        distillReview,
        onUpdateDistillReview,
        handleSavePromoted,
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
        <strong style="font-size:0.94rem; color:var(--stj-text, #f8fafc); display:block;">Legacy Flash (.swf) Upgrade &amp; Rescue Route</strong>
        <span style="font-size:0.75rem; color:var(--stj-text-muted, #94a3b8);">Got an old .swf lesson you can no longer run? Play it locally in pure SVG (Beta) or distill its views into an open, bytecode-free .ast offline cartridge.</span>
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

  const processBuffer = async (buf: ArrayBuffer, cleanName: string, rawFileName?: string) => {
    setIsParsingSwf(true);
    setSwfError(null);
    setSwfFileName?.(cleanName);
    try {
      // Stage 1: Scan SWF header + Bucket A–D tag census into IndexedDB; Stage 2: AST transpilation
      const indexed = await indexSwfHeaderAndTranspile(buf, cleanName, rawFileName || `${cleanName}.swf`);
      const res = indexed.transpileResult;
      if (res && res.success) {
        setSwfResult(res);
        setCustomSvgCode(res.svgMarkup);
        setCustomAstCode(res.astSource);
      } else {
        setSwfError(res?.error || indexed.headerScan.error || 'Failed to parse SWF binary.');
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
    processBuffer(buf, cleanName, file.name);
  };

  const fileInput = dropZone.querySelector<HTMLInputElement>('#ast-swf-file-input');
  fileInput?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const cleanName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    processBuffer(buf, cleanName, file.name);
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
      id: 'maze-arcade',
      title: 'Maze Chomper Arcade (maze-arcade.swf)',
      desc: 'Original procedural binary SWF v8 maze demo with chomping vector sprite, Arrow/WASD steering, GlowFilter walls/chasers, PCM Web Audio, Color.setRGB frightened mode, and editable player input.',
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

  // 2b. Honest Compatibility, Rights & Trademark Notice
  const limitsBox = document.createElement('div');
  limitsBox.style.cssText =
    'padding:10px 12px; border-radius:8px; background:rgba(15, 23, 42, 0.75); border:1px solid #1e293b; font-size:0.74rem; line-height:1.5; color:#cbd5e1; display:flex; flex-direction:column; gap:4px;';
  limitsBox.innerHTML = `
    <strong style="color:#f8fafc; font-size:0.76rem;">Compatibility &amp; Known Limits (Pure-SVG Offline Beta)</strong>
    <span><strong style="color:#86efac;">Works best:</strong> Vector-first Flash 5&ndash;8 (ActionScript 1/2) applets, quizzes, simulations, and classic games with timeline animation, buttons, keyboard/mouse controls, editable text, and embedded PCM/ADPCM sound.</span>
    <span><strong style="color:#fde68a;">Partial / experimental:</strong> ActionScript 3 (AVM2) runs core vector timelines and basic events, while complex AS3/Flex frameworks and heavy real-world SWFs may have edge cases &mdash; please test each file before a lesson.</span>
    <span><strong style="color:#fca5a5;">Not supported (by design):</strong> Stage3D/WebGL, pixel-buffer <code style="color:#e2e8f0;">BitmapData</code> shaders, streaming FLV video (<code style="color:#e2e8f0;">NetStream</code>), camera/mic/sockets, and live external web/high-score APIs (runs 100% offline in pure SVG).</span>
    <span style="margin-top:4px; padding-top:6px; border-top:1px solid #1e293b; color:#94a3b8; font-size:0.71rem;"><strong style="color:#cbd5e1;">Local Processing &amp; Rights:</strong> Files are parsed and converted 100% locally in your browser and are never uploaded or hosted by this site. Please only import, convert, or adapt <code style="color:#cbd5e1;">.swf</code> files that you own, authored, or hold permission/open licences to reuse. Independent clean-room compatibility tool; Adobe and Flash are trademarks of Adobe Inc. (no affiliation or endorsement).</span>
  `;
  root.appendChild(limitsBox);

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

    // Centrifuge & Header Triage Readout (indexed in IndexedDB before AST upgrade)
    if (meta.centrifuge) {
      const c = meta.centrifuge;
      const verdictStyle =
        c.verdict === 'reject-low-value'
          ? { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.45)', fg: '#fca5a5', label: 'REJECT / LOW-VALUE (SLUDGE)' }
          : c.verdict === 'suspect'
          ? { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.45)', fg: '#fcd34d', label: 'SUSPECT / APPROXIMABLE' }
          : { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.45)', fg: '#6ee7b7', label: 'CLEAN SIGNAL' };

      const diagBox = document.createElement('div');
      diagBox.style.cssText = `padding:8px 10px; border-radius:6px; background:${verdictStyle.bg}; border:1px solid ${verdictStyle.border}; color:${verdictStyle.fg}; font-size:0.73rem; line-height:1.45; display:flex; flex-direction:column; gap:3px;`;

      const heading = document.createElement('strong');
      heading.style.cssText = 'font-size:0.74rem; letter-spacing:0.02em;';
      const extras: string[] = ['Header indexed in IndexedDB'];
      if (c.scriptLimits) extras.push(`ScriptLimits ${c.scriptLimits.maxRecursionDepth}/${c.scriptLimits.scriptTimeoutSeconds}s`);
      if (c.binaryDataTagCount > 0) extras.push(`Tag 87 BinaryData: ${c.binaryDataTagCount} (${formatKb(c.binaryDataBytes)})`);
      if (meta.importDebugSummary?.skippedTagIds?.length) {
        extras.push(`Skipped tags: [${meta.importDebugSummary.skippedTagIds.join(', ')}]`);
      }
      heading.textContent = `SWF Centrifuge: ${verdictStyle.label} · ${extras.join(' · ')}`;
      diagBox.appendChild(heading);

      const reasons = [
        ...c.sludgeReasons.map((r) => `Sludge: ${r}`),
        ...c.suspectReasons.map((r) => `Watch: ${r}`),
        ...(c.sludgeReasons.length === 0 && c.suspectReasons.length === 0 ? c.signalReasons.slice(0, 2) : []),
      ];
      if (reasons.length > 0) {
        const line = document.createElement('span');
        line.style.cssText = 'color:#e2e8f0; opacity:0.92;';
        line.textContent = reasons.join(' · ');
        diagBox.appendChild(line);
      }
      resBox.appendChild(diagBox);
    }

    const isPreFlightBlocked = meta.centrifuge?.verdict === 'reject-low-value';

    // 5a. Honest Pre-Flight "Cannot Play" Gate & Live Runtime Watchdog Banner
    if (isPreFlightBlocked) {
      const blockBox = document.createElement('div');
      blockBox.style.cssText =
        'padding:10px 12px; border-radius:8px; background:rgba(127, 29, 29, 0.35); border:1.5px solid #ef4444; color:#fecaca; font-size:0.76rem; line-height:1.45; display:flex; flex-direction:column; gap:5px;';
      const bTitle = document.createElement('strong');
      bTitle.style.cssText = 'font-size:0.82rem; color:#ffffff;';
      bTitle.textContent = 'No — We Cannot Reliably Play This SWF (Blocked at Pre-Flight)';
      const bReasons = document.createElement('div');
      const allReasons = [
        ...(meta.centrifuge?.sludgeReasons || []),
        ...(meta.centrifuge?.suspectReasons || []),
      ];
      bReasons.textContent =
        allReasons.length > 0
          ? `Why: ${allReasons.join(' · ')}`
          : 'Why: No playable vector stage or supported offline ActionScript loop was detected.';
      const bHint = document.createElement('div');
      bHint.style.cssText = 'color:#fde68a; font-size:0.72rem;';
      bHint.textContent =
        'Next step: Rescue any usable vector symbols below or click "Copy Recode Brief" to rebuild this lesson natively in .astb.';
      blockBox.appendChild(bTitle);
      blockBox.appendChild(bReasons);
      blockBox.appendChild(bHint);
      resBox.appendChild(blockBox);
    }

    if (swfRuntimeHealth) {
      const rt = swfRuntimeHealth;
      const rtStyle =
        rt.verdict === 'cannot-play'
          ? { bg: 'rgba(127, 29, 29, 0.38)', border: '#ef4444', fg: '#fecaca', heading: 'Cannot Play — Runtime Failure Detected' }
          : rt.verdict === 'degraded'
          ? { bg: 'rgba(146, 64, 14, 0.3)', border: '#f59e0b', fg: '#fde68a', heading: 'Partial Playback — Degraded SWF Runtime' }
          : { bg: 'rgba(6, 78, 59, 0.3)', border: '#10b981', fg: '#a7f3d0', heading: 'Verified Playable on Pure-SVG Runtime' };

      const rtBox = document.createElement('div');
      rtBox.style.cssText = `padding:10px 12px; border-radius:8px; background:${rtStyle.bg}; border:1.5px solid ${rtStyle.border}; color:${rtStyle.fg}; font-size:0.74rem; line-height:1.45; display:flex; flex-direction:column; gap:4px;`;
      const rtTitle = document.createElement('strong');
      rtTitle.style.cssText = 'font-size:0.79rem; color:#ffffff;';
      const perfSummary: string[] = [];
      if (typeof rt.avgFrameMs === 'number') {
        const p95Part = typeof rt.p95FrameMs === 'number' ? ` / p95 ${rt.p95FrameMs.toFixed(1)}ms` : '';
        perfSummary.push(`${rt.avgFrameMs.toFixed(1)}ms${p95Part}`);
      }
      const nodeLabel = typeof rt.peakSvgNodes === 'number' && rt.peakSvgNodes > 0
        ? `${rt.svgNodeCount ?? rt.visibleNodes} SVG nodes (peak ${rt.peakSvgNodes})`
        : `${rt.visibleNodes} visible SVG nodes`;
      const headerStats = [rt.vm.toUpperCase(), `${rt.framesElapsed} frames`, nodeLabel, ...perfSummary];
      rtTitle.textContent = `${rtStyle.heading} (${headerStats.join(' · ')})`;
      rtBox.appendChild(rtTitle);

      if (rt.reasons.length > 0) {
        const rLine = document.createElement('div');
        rLine.textContent = rt.reasons.join(' · ');
        rtBox.appendChild(rLine);
      }

      const techBits: string[] = [];
      if (rt.unhandledOpcodes.length > 0) techBits.push(`Opcodes: ${rt.unhandledOpcodes.slice(0, 8).join(', ')}`);
      if (rt.missingApis.length > 0) techBits.push(`Missing APIs: ${rt.missingApis.slice(0, 4).join(', ')}`);
      if (rt.externalCalls.length > 0) techBits.push(`Blocked external: ${rt.externalCalls.slice(0, 3).join(', ')}`);
      if (techBits.length > 0) {
        const tLine = document.createElement('div');
        tLine.style.cssText = 'font-family:monospace; font-size:0.7rem; color:#e2e8f0; opacity:0.95;';
        tLine.textContent = techBits.join(' | ');
        rtBox.appendChild(tLine);
      }
      resBox.appendChild(rtBox);
    }

    // Three-Path Workflow Selector (Run Live | Run-to-Convert | Quick Transform)
    let activeMode: SwfLaunchMode = selectedMode;
    const modeDescriptions: Record<SwfLaunchMode, { cta: string; desc: string }> = {
      run: {
        cta: isPreFlightBlocked ? 'Force Try Anyway (Likely Broken)' : 'Run Live on Stage',
        desc: hasLiveAbc
          ? 'Play immediately on the lazy-loaded pure-SVG AVM2 (ActionScript 3) micro-VM with original Flash interaction.'
          : 'Play immediately on the pure-SVG AVM1 micro-VM with original Flash interaction.',
      },
      'run-to-convert': {
        cta: isPreFlightBlocked ? 'Force Launch Run-to-Convert' : 'Launch Run-to-Convert Studio',
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
    primaryCtaBtn.style.cssText = isPreFlightBlocked
      ? 'padding:7px 14px; border-radius:6px; background:#334155; color:#fde68a; border:1px solid #f59e0b; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap;'
      : 'padding:7px 14px; border-radius:6px; background:#0284c7; color:#ffffff; border:1px solid #38bdf8; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap;';

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

    // Pre-harvest clean vector props so we can include their IDs in the Recode Brief
    const harvestedSymbols = harvestSwfSymbols(swfResult.svgMarkup, {
      idPrefix: swfFileName || 'swf',
      quantizeStep: 0.5,
      maxSymbols: 16,
    });

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

    const recodeBriefBtn = document.createElement('button');
    recodeBriefBtn.type = 'button';
    recodeBriefBtn.style.cssText =
      'padding:6px 10px; border-radius:6px; background:#0f172a; color:#38bdf8; border:1px solid #0284c7; font-size:0.74rem; font-weight:700; cursor:pointer; white-space:nowrap;';
    recodeBriefBtn.textContent = 'Copy Recode Brief';
    recodeBriefBtn.title = 'Copy header, runtime failure diagnostics, and salvaged SVG symbol IDs for rebuilding natively in .astb';
    recodeBriefBtn.onclick = () => {
      const brief = buildSwfRecodeBrief(
        swfFileName || 'imported-swf',
        swfResult,
        swfRuntimeHealth,
        harvestedSymbols.map((s) => s.id)
      );
      navigator.clipboard?.writeText(brief);
      recodeBriefBtn.textContent = 'Brief Copied';
      setTimeout(() => {
        recodeBriefBtn.textContent = 'Copy Recode Brief';
      }, 1500);
    };

    const exportBaseName = sanitizeSlugId((swfFileName || 'transpiled-swf').replace(/\.swf$/i, ''));

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.style.cssText =
      'padding:6px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.74rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    downloadBtn.textContent = 'Download .svg';
    downloadBtn.onclick = () => {
      triggerTextDownload(`${exportBaseName}.svg`, swfResult.svgMarkup, 'image/svg+xml;charset=utf-8');
    };

    const downloadAstBtn = document.createElement('button');
    downloadAstBtn.type = 'button';
    downloadAstBtn.style.cssText =
      'padding:6px 10px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.74rem; font-weight:600; cursor:pointer; white-space:nowrap;';
    downloadAstBtn.textContent = 'Download .ast';
    downloadAstBtn.onclick = () => {
      triggerTextDownload(`${exportBaseName}.ast`, swfResult.astSource, 'text/plain;charset=utf-8');
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

    secGroup.appendChild(recodeBriefBtn);
    secGroup.appendChild(downloadBtn);
    secGroup.appendChild(downloadAstBtn);
    secGroup.appendChild(copyBtn);

    actionsRow.appendChild(primaryCtaBtn);
    actionsRow.appendChild(secGroup);
    resBox.appendChild(actionsRow);

    // 5b. Harvest Clean Zero-Bytecode SVG Symbols for Native .astb Cartridges
    if (harvestedSymbols.length > 0) {
      const harvestDetails = document.createElement('details');
      if (isPreFlightBlocked || swfRuntimeHealth?.verdict === 'cannot-play') {
        harvestDetails.open = true;
      }
      harvestDetails.style.cssText =
        'background:#0f172a; border:1px solid #1e293b; border-radius:8px; padding:8px 10px; font-size:0.74rem; color:#cbd5e1;';
      const harvestSum = document.createElement('summary');
      harvestSum.style.cssText = 'cursor:pointer; font-weight:600; color:#e2e8f0; list-style:revert;';
      harvestSum.textContent = `Harvest Clean SVG Symbols for Native .astb (${harvestedSymbols.length} vector props · 0 B Flash bytecode)`;
      harvestDetails.appendChild(harvestSum);

      const grid = document.createElement('div');
      grid.style.cssText =
        'display:grid; grid-template-columns:repeat(auto-fill, minmax(175px, 1fr)); gap:8px; margin-top:8px;';

      harvestedSymbols.forEach((sym) => {
        const card = document.createElement('div');
        card.style.cssText =
          'background:#090d16; border:1px solid #1e293b; border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;';

        const previewWrap = document.createElement('div');
        previewWrap.style.cssText =
          'height:64px; border-radius:4px; background:#0f172a; border:1px solid #1e293b; display:flex; align-items:center; justify-content:center; overflow:hidden; padding:4px;';
        const img = document.createElement('img');
        img.alt = sym.label;
        img.style.cssText = 'max-width:100%; max-height:100%; object-fit:contain;';
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sym.standaloneSvg)}`;
        previewWrap.appendChild(img);

        const metaLine = document.createElement('div');
        metaLine.style.cssText =
          'font-size:0.7rem; color:#94a3b8; font-variant-numeric:tabular-nums; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
        metaLine.textContent = `#${sym.id} · ${sym.optimizedBytes} B (${sym.pathCount}p${sym.savedPercent > 0 ? `, -${sym.savedPercent}%` : ''})`;
        metaLine.title = metaLine.textContent;

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; gap:4px; flex-wrap:wrap;';

        const copySvgBtn = document.createElement('button');
        copySvgBtn.type = 'button';
        copySvgBtn.style.cssText =
          'padding:3px 6px; border-radius:4px; background:#1e293b; color:#e2e8f0; border:1px solid #334155; font-size:0.68rem; cursor:pointer;';
        copySvgBtn.textContent = 'Copy <defs>';
        copySvgBtn.onclick = () => {
          navigator.clipboard?.writeText(sym.symbolMarkup);
          copySvgBtn.textContent = 'Copied';
          setTimeout(() => { copySvgBtn.textContent = 'Copy <defs>'; }, 1200);
        };

        const copyAstBtn = document.createElement('button');
        copyAstBtn.type = 'button';
        copyAstBtn.style.cssText =
          'padding:3px 6px; border-radius:4px; background:#1e293b; color:#7dd3fc; border:1px solid #334155; font-size:0.68rem; cursor:pointer;';
        copyAstBtn.textContent = 'Copy AST';
        copyAstBtn.onclick = () => {
          navigator.clipboard?.writeText(sym.astBindingSnippet);
          copyAstBtn.textContent = 'Copied';
          setTimeout(() => { copyAstBtn.textContent = 'Copy AST'; }, 1200);
        };

        const dlBtn = document.createElement('button');
        dlBtn.type = 'button';
        dlBtn.style.cssText =
          'padding:3px 6px; border-radius:4px; background:transparent; color:#94a3b8; border:1px solid #334155; font-size:0.68rem; cursor:pointer;';
        dlBtn.textContent = '.svg';
        dlBtn.onclick = () => {
          const blob = new Blob([sym.standaloneSvg], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${sym.id}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        };

        btnRow.appendChild(copySvgBtn);
        btnRow.appendChild(copyAstBtn);
        btnRow.appendChild(dlBtn);

        card.appendChild(previewWrap);
        card.appendChild(metaLine);
        card.appendChild(btnRow);
        grid.appendChild(card);
      });

      harvestDetails.appendChild(grid);
      resBox.appendChild(harvestDetails);
    }

    root.appendChild(resBox);
  }

  // 6. IndexedDB SWF Header & Upgrade Ledger (async-hydrated, zero boot penalty)
  const ledgerDetails = document.createElement('details');
  ledgerDetails.style.cssText =
    'background:#090d16; border:1px solid #1e293b; border-radius:8px; padding:8px 12px; font-size:0.74rem; color:#cbd5e1;';
  const ledgerSummary = document.createElement('summary');
  ledgerSummary.style.cssText = 'cursor:pointer; font-weight:600; color:#e2e8f0; list-style:revert;';
  ledgerSummary.textContent = 'Indexed SWF Headers (Local IndexedDB Ledger)';
  ledgerDetails.appendChild(ledgerSummary);

  const ledgerBody = document.createElement('div');
  ledgerBody.style.cssText = 'margin-top:8px; display:flex; flex-direction:column; gap:6px;';
  ledgerDetails.appendChild(ledgerBody);

  const renderLedgerRows = (records: SwfHeaderIndexRecord[]) => {
    ledgerSummary.textContent = `Indexed SWF Headers (${records.length} in Local IndexedDB Ledger)`;
    ledgerBody.innerHTML = '';
    if (records.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#94a3b8; font-size:0.72rem;';
      empty.textContent = 'No SWF headers catalogued yet. Drop any .swf file or load a sample above to index its header & tag census before upgrading to AST.';
      ledgerBody.appendChild(empty);
      return;
    }

    records.slice(0, 12).forEach((rec) => {
      const row = document.createElement('div');
      row.style.cssText =
        'display:flex; justify-content:space-between; align-items:flex-start; gap:8px; padding:6px 8px; border-radius:6px; background:#0f172a; border:1px solid #1e293b;';

      const left = document.createElement('div');
      left.style.cssText = 'display:flex; flex-direction:column; gap:2px; min-width:0;';

      const top = document.createElement('div');
      top.style.cssText = 'font-weight:600; color:#f8fafc; font-variant-numeric:tabular-nums;';
      const verdictColor =
        rec.verdict === 'reject-low-value' ? '#fca5a5' : rec.verdict === 'suspect' ? '#fcd34d' : '#6ee7b7';
      const outdatedNote =
        rec.parserSchemaVersion < SWF_PARSER_SCHEMA_VERSION ? ' · Re-upgrade available' : '';
      const fileNameSpan = document.createElement('span');
      fileNameSpan.textContent = rec.fileName;
      const verdictSpan = document.createElement('span');
      verdictSpan.style.cssText = `color:${verdictColor}; font-weight:700; margin-left:6px;`;
      verdictSpan.textContent = rec.verdict.toUpperCase();
      const statusSpan = document.createElement('span');
      statusSpan.style.cssText = 'color:#94a3b8; font-weight:500; margin-left:4px;';
      statusSpan.textContent = `(${rec.upgradeStatus}${outdatedNote})`;
      top.appendChild(fileNameSpan);
      top.appendChild(verdictSpan);
      if (rec.runtimeHealth) {
        const rtSpan = document.createElement('span');
        const rtColor =
          rec.runtimeHealth.verdict === 'cannot-play'
            ? '#f87171'
            : rec.runtimeHealth.verdict === 'degraded'
            ? '#fbbf24'
            : '#34d399';
        rtSpan.style.cssText = `color:${rtColor}; font-weight:700; margin-left:6px;`;
        rtSpan.textContent = `· LIVE: ${rec.runtimeHealth.verdict.toUpperCase()}`;
        if (rec.runtimeHealth.reasons.length > 0) {
          rtSpan.title = rec.runtimeHealth.reasons.join(' | ');
        }
        top.appendChild(rtSpan);
      }
      top.appendChild(statusSpan);

      const details = document.createElement('div');
      details.style.cssText = 'font-size:0.71rem; color:#94a3b8; font-variant-numeric:tabular-nums;';
      const parts = [
        `SWF v${rec.swfVersion} ${rec.signature}`,
        `${rec.width}×${rec.height}`,
        `${rec.frameCount}f`,
        rec.executionModel,
        `Tags A:${rec.tagCensus.configTags}/B:${rec.tagCensus.assetTags}/C:${rec.tagCensus.codeTags}/D:${rec.tagCensus.displayTags}`,
      ];
      if (rec.documentClass) parts.push(`Doc: ${rec.documentClass}`);
      if (rec.fileAttributes?.useGpu || rec.fileAttributes?.useDirectBlit) parts.push('GPU/DirectBlit');
      if (rec.tagCensus.unsupportedTagIds.length > 0) {
        parts.push(`Watch tags: [${rec.tagCensus.unsupportedTagIds.join(',')}]`);
      }
      details.textContent = parts.join(' · ');

      left.appendChild(top);
      left.appendChild(details);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.style.cssText =
        'padding:3px 7px; border-radius:4px; background:transparent; color:#94a3b8; border:1px solid #334155; font-size:0.69rem; cursor:pointer; flex-shrink:0;';
      delBtn.textContent = 'Remove';
      delBtn.onclick = async () => {
        await deleteSwfHeaderRecord(rec.id);
        renderLedgerRows(await getAllSwfHeaderRecords());
      };

      row.appendChild(left);
      row.appendChild(delBtn);
      ledgerBody.appendChild(row);
    });
  };

  void getAllSwfHeaderRecords().then(renderLedgerRows).catch(() => {});
  root.appendChild(ledgerDetails);

  return root;
}

export const SwfTranspilerDrawer = renderSwfTranspilerDrawer;
export default renderSwfTranspilerDrawer;
