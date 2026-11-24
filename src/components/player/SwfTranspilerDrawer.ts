// src/components/player/SwfTranspilerDrawer.ts
/**
 * SWF / Adobe Flash Binary Transcompiler Drawer
 * Pure Vanilla TypeScript / DOM component.
 * Decompiles legacy .swf files (FWS/CWS) into native modern SVG + AST S-Expressions.
 */

import { transpileSwfToAst, type SwfTranspileResult } from '../../utils/swfAstParser';
import { buildFlashArcadeSampleSwf, buildFlashPendulumSampleSwf } from '../../utils/swfSampleBuilder';

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
  onLaunchCartridge?: (res: SwfTranspileResult, cleanName: string) => void;
  onClose?: () => void;
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
    onLaunchCartridge,
    onClose,
  } = props;

  const root = document.createElement('div');
  root.className = 'ast-swf-transpiler-drawer';
  root.style.cssText = 'display: flex; flex-direction: column; gap: 14px;';

  if (onClose) {
    const topBar = document.createElement('div');
    topBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;';
    topBar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.15rem;">⚡</span>
        <div>
          <strong style="font-size: 0.92rem; color: var(--stj-text, #f8fafc); display: block;">Historic Adobe Flash (.swf) Importer &amp; Decompiler</strong>
          <span style="font-size: 0.74rem; color: var(--stj-text-muted, #94a3b8);">100% offline local binary transpiler — converts FWS/CWS vector shapes, morphs &amp; ActionScript into native 60 FPS SVG + AST cartridges.</span>
        </div>
      </div>
    `;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.cssText = 'padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid #334155; font-size: 0.76rem; font-weight: 700; cursor: pointer;';
    closeBtn.textContent = 'Close ✕';
    closeBtn.onclick = () => onClose();
    topBar.appendChild(closeBtn);
    root.appendChild(topBar);
  }

  // 1. Drag & Drop Upload Zone
  const dropZone = document.createElement('div');
  dropZone.style.cssText = `
    border: ${swfDragActive ? '2px dashed var(--stj-primary, #6366f1)' : '2px dashed var(--stj-border, #334155)'};
    background: ${swfDragActive ? 'var(--stj-primary-surface, rgba(99, 102, 241, 0.1))' : 'var(--stj-canvas, #090d16)'};
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
  `;

  dropZone.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 8px;">📦</div>
    <strong style="font-size: 0.95rem; color: var(--stj-text, #f8fafc); display: block; margin-bottom: 4px;">
      Drag &amp; Drop Legacy Adobe Flash (.swf) File Here
    </strong>
    <p style="margin: 0 0 12px 0; font-size: 0.78rem; color: var(--stj-text-muted, #94a3b8);">
      Decodes FWS (uncompressed) &amp; CWS (zlib-compressed) binary vector shapes, twips coordinates, and timeline frames into native 60 FPS SVG + AST S-Expressions.
    </p>
    <div style="display: inline-flex; align-items: center; gap: 8px;">
      <label class="stj-btn stj-btn-primary stj-btn-sm" style="cursor: pointer; font-size: 0.76rem;">
        <span>Browse .swf File...</span>
        <input id="ast-swf-file-input" type="file" accept=".swf" style="display: none;" />
      </label>
      <span style="font-size: 0.74rem; color: var(--stj-text-muted, #94a3b8);">or try an educational sample below</span>
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
        setSwfError(res.error || 'Failed to transpile SWF binary.');
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

  // 2. Legacy Samples
  const samplesWrap = document.createElement('div');
  samplesWrap.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';
  const sampleLabel = document.createElement('span');
  sampleLabel.style.cssText = 'font-size: 0.74rem; font-weight: 700; color: var(--stj-text-muted, #94a3b8);';
  sampleLabel.textContent = 'Legacy Samples:';
  samplesWrap.appendChild(sampleLabel);

  const samples = [
    {
      id: 'flash-arcade-target',
      title: '🎯 Flash AVM1 Arcade Target',
      desc: 'Live binary SWF v8 demo with Start button, mouse/arrow controls, hitTest scoring, and attachMovie sparks.',
      mockBytes: () => buildFlashArcadeSampleSwf(),
    },
    {
      id: 'flash-pendulum',
      title: '⚖️ Flash Harmonic Pendulum',
      desc: 'Live binary SWF v8 physics demo using AVM1 Math.sin/cos, Flash Drawing API rod, and Pause/Resume button.',
      mockBytes: () => buildFlashPendulumSampleSwf(),
    },
  ];

  samples.forEach((sample) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'stj-btn stj-btn-secondary stj-btn-sm';
    btn.style.fontSize = '0.74rem';
    btn.title = sample.desc;
    btn.textContent = sample.title;
    btn.onclick = () => {
      const bytes = sample.mockBytes();
      processBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, sample.id);
    };
    samplesWrap.appendChild(btn);
  });
  root.appendChild(samplesWrap);

  // 3. Error state
  if (swfError) {
    const errBox = document.createElement('div');
    errBox.style.cssText = 'padding: 8px 12px; border-radius: 6px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.78rem;';
    errBox.textContent = `❌ ${swfError}`;
    root.appendChild(errBox);
  }

  // 4. Loading state
  if (isParsingSwf) {
    const loadBox = document.createElement('div');
    loadBox.style.cssText = 'padding: 12px; text-align: center; color: var(--stj-primary, #38bdf8); font-size: 0.8rem;';
    loadBox.textContent = '⏳ Decompiling SWF byte stream and generating vector paths...';
    root.appendChild(loadBox);
  }

  // 5. Result box
  if (swfResult && swfResult.metadata) {
    const meta = swfResult.metadata;
    const resBox = document.createElement('div');
    resBox.style.cssText = 'background: var(--stj-canvas, #090d16); border: 1px solid var(--stj-border, #334155); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;';

    const resHeader = document.createElement('div');
    resHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;';
    resHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="stj-badge stj-badge-success" style="font-weight: 700;">✓ Transpiled</span>
        <strong style="font-size: 0.86rem; color: var(--stj-text, #f8fafc);">
          Legacy Flash SWF v${meta.version} (${meta.signature})
        </strong>
      </div>
    `;

    const btnsGroup = document.createElement('div');
    btnsGroup.style.cssText = 'display: flex; align-items: center; gap: 6px;';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'stj-btn stj-btn-primary stj-btn-sm';
    playBtn.style.cssText = 'font-size: 0.75rem; font-weight: 700;';
    playBtn.textContent = onLaunchCartridge ? '⚡ Save & Play in Stage' : '⚡ Test & Play in Stage';
    playBtn.onclick = () => {
      if (onLaunchCartridge) {
        onLaunchCartridge(swfResult, swfFileName);
      } else {
        postToPlayer({ type: 'HOT_RELOAD_SVG', svg: swfResult.svgMarkup });
        postToPlayer({ type: 'HOT_RELOAD_AST', ast: swfResult.astSource });
        postToPlayer({ type: 'SEEK', progress: 0 });
        postToPlayer({ type: 'PLAY' });
      }
      setHotReloadFlash(true);
      setTimeout(() => setHotReloadFlash(false), 2200);
    };
    btnsGroup.appendChild(playBtn);

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'stj-btn stj-btn-secondary stj-btn-sm';
    downloadBtn.style.fontSize = '0.75rem';
    downloadBtn.textContent = '💾 Download SVG';
    downloadBtn.onclick = () => {
      const blob = new Blob([swfResult.svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${swfFileName || 'transpiled-swf'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    };
    btnsGroup.appendChild(downloadBtn);

    resHeader.appendChild(btnsGroup);
    resBox.appendChild(resHeader);

    // Meta chips grid
    const modeLabel = meta.isActionScript3
      ? 'AS3 / AVM2 (Vector Timeline)'
      : (meta.executionModel === 'sim-modal'
          ? 'AVM1 Interactive :Sim'
          : (meta.executionModel === 'sim-continuous' ? 'AVM1 Continuous :Sim' : 'Vector Stage'));
    const preloaderNote = (meta.strippedPreloaderFrames && meta.strippedPreloaderFrames > 0)
      ? ` · skipped ${meta.strippedPreloaderFrames} preloader frame(s) → F${meta.entryFrame || (meta.strippedPreloaderFrames + 1)}`
      : '';
    const chipsGrid = document.createElement('div');
    chipsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;';
    chipsGrid.innerHTML = `
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Canvas Dimensions</span>
        <strong style="color: var(--stj-text, #f8fafc);">${meta.width} × ${meta.height} px</strong>
      </div>
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Execution Model</span>
        <strong style="color: var(--stj-text, #f8fafc);">${modeLabel}${preloaderNote}</strong>
      </div>
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Shapes Extracted</span>
        <strong style="color: var(--stj-text, #f8fafc);">${meta.shapeCount} Vector Paths (${Math.round(meta.frameRate)} FPS)</strong>
      </div>
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Background</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: ${meta.backgroundColor}; border: 1px solid #64748b;"></span>
          <strong style="color: var(--stj-text, #f8fafc);">${meta.backgroundColor}</strong>
        </div>
      </div>
    `;
    resBox.appendChild(chipsGrid);

    if (meta.isActionScript3) {
      const as3Note = document.createElement('div');
      as3Note.style.cssText = 'padding: 8px 10px; border-radius: 6px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.45); color: #fcd34d; font-size: 0.74rem; line-height: 1.4;';
      as3Note.textContent = 'Note: This SWF uses ActionScript 3.0 (AVM2 / DoABC bytecode). Vector shapes and timelines render in pure SVG, while interactive script execution currently supports ActionScript 1.0 / 2.0 (AVM1) SWF files.';
      resBox.appendChild(as3Note);
    }

    // AST Preview (use textContent to prevent HTML injection from transpiled strings)
    const previewWrap = document.createElement('div');
    previewWrap.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 0.74rem; font-weight: 600; color: var(--stj-primary, #38bdf8);">⚡ Generated Declarative AST S-Expressions:</span>
        <button id="ast-copy-code-btn" type="button" class="stj-btn stj-btn-ghost stj-btn-sm" style="font-size: 0.7rem; padding: 2px 6px; cursor: pointer;">
          📋 Copy AST
        </button>
      </div>
      <pre id="ast-swf-preview-pre" style="margin: 0; padding: 8px; background: var(--stj-surface, #1e293b); border: 1px solid var(--stj-border, #334155); border-radius: 6px; font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8); max-height: 110px; overflow-y: auto; font-family: monospace;"></pre>
    `;
    const preEl = previewWrap.querySelector<HTMLPreElement>('#ast-swf-preview-pre');
    if (preEl) {
      let previewText = swfResult.astSource || '';
      const vmMarker = '(:swf-vm "';
      const vmIdx = previewText.indexOf(vmMarker);
      if (vmIdx !== -1) {
        const valStart = vmIdx + vmMarker.length;
        const valEnd = previewText.indexOf('"', valStart);
        if (valEnd > valStart && (valEnd - valStart) > 256) {
          const kb = ((valEnd - valStart) / 1024).toFixed(1);
          previewText =
            previewText.slice(0, valStart) +
            `[AVM1 micro-VM bytecode: ${kb} KB omitted from preview — full payload included on Launch/Copy]` +
            previewText.slice(valEnd);
        }
      }
      if (previewText.length > 16384) {
        previewText = previewText.slice(0, 16384) + `\n; ... (${((previewText.length - 16384) / 1024).toFixed(1)} KB more omitted from preview)`;
      }
      preEl.textContent = previewText;
    }
    previewWrap.querySelector('#ast-copy-code-btn')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(swfResult.astSource);
    });
    resBox.appendChild(previewWrap);

    root.appendChild(resBox);
  }

  return root;
}

export const SwfTranspilerDrawer = renderSwfTranspilerDrawer;
export default renderSwfTranspilerDrawer;
