// src/components/player/AstChalkboardOverlay.ts
/**
 * Vanilla TypeScript Canvas 2D Chalkboard & Annotation Layer
 * Zero-React, zero-JSX implementation for fast, sub-millisecond drawing overlays.
 */

export interface AstChalkboardOptions {
  width?: string | number;
  height?: string | number;
  onClose?: () => void;
  onSave?: (dataUrl: string) => void;
}

export interface AstChalkboardInstance {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  destroy: () => void;
  clear: () => void;
  undo: () => void;
  downloadSnapshot: () => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setIsHighlighter: (isHighlighter: boolean) => void;
}

/**
 * Mounts a vanilla HTML5 2D canvas chalkboard overlay into any container.
 */
export function mountChalkboard(
  container: HTMLElement,
  options: AstChalkboardOptions = {}
): AstChalkboardInstance {
  let isDrawing = false;
  let color = '#f59e0b'; // Amber gold default
  let brushSize = 4;
  let isHighlighter = false;
  let history: ImageData[] = [];

  // 1. Root Overlay Element
  const root = document.createElement('div');
  root.id = 'ast-vanilla-chalkboard-overlay';
  root.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 50;
    pointer-events: none;
  `;

  // 2. Canvas Element
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
    pointer-events: auto;
    touch-action: none;
  `;
  root.appendChild(canvas);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const updateCursor = () => {
    canvas.style.cursor = isHighlighter
      ? 'crosshair'
      : 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'><circle cx=\'8\' cy=\'8\' r=\'4\' fill=\'white\' stroke=\'black\'/></svg>") 8 8, crosshair';
  };
  updateCursor();

  // Canvas Resizing
  const resizeCanvas = () => {
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      let imgData: ImageData | null = null;
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        try {
          imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (_) {}
      }

      canvas.width = rect.width;
      canvas.height = rect.height;

      if (ctx && imgData) {
        try {
          ctx.putImageData(imgData, 0, 0);
        } catch (_) {}
      }
    }
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const saveState = () => {
    if (!ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.push(data);
      if (history.length > 10) history.shift();
      updateUndoButton();
    } catch (_) {}
  };

  const getCoordinates = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    if (!ctx) return;
    saveState();
    isDrawing = true;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = isHighlighter ? 18 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = isHighlighter ? 0.35 : 1.0;
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing || !ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    isDrawing = false;
    if (ctx) ctx.closePath();
  };

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  canvas.addEventListener('touchend', stopDrawing);

  const clearCanvas = () => {
    if (!ctx) return;
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const undo = () => {
    if (!ctx || history.length === 0) return;
    const prev = history.pop();
    if (prev) {
      ctx.putImageData(prev, 0, 0);
    }
    updateUndoButton();
  };

  const downloadSnapshot = () => {
    const link = document.createElement('a');
    link.download = `ast-slide-annotation-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (options.onSave) options.onSave(link.href);
  };

  // 3. Floating Chalkboard Toolbar
  const toolbar = document.createElement('div');
  toolbar.style.cssText = `
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    borderRadius: 30px;
    padding: 6px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
    z-index: 60;
    flex-wrap: wrap;
    max-width: 96%;
    user-select: none;
  `;

  const titleSpan = document.createElement('span');
  titleSpan.style.cssText = 'font-size: 0.8rem; font-weight: 800; color: #f8fafc; display: flex; align-items: center; gap: 4px;';
  titleSpan.innerHTML = '<span>✏️</span> Chalkboard';
  toolbar.appendChild(titleSpan);

  const addDivider = () => {
    const div = document.createElement('div');
    div.style.cssText = 'width: 1px; height: 18px; background: rgba(255,255,255,0.2);';
    toolbar.appendChild(div);
  };
  addDivider();

  // Color Palette Buttons
  const colors = [
    { label: 'Amber Gold', val: '#f59e0b' },
    { label: 'Crimson Red', val: '#ef4444' },
    { label: 'Emerald Green', val: '#22c55e' },
    { label: 'Cyan Blue', val: '#38bdf8' },
    { label: 'Pure White', val: '#ffffff' },
  ];
  const colorButtons: HTMLButtonElement[] = [];

  const updateColorButtons = () => {
    colorButtons.forEach((btn, idx) => {
      const c = colors[idx].val;
      const isSelected = color === c && !isHighlighter;
      btn.style.border = isSelected ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.3)';
      btn.style.boxShadow = isSelected ? `0 0 8px ${c}` : 'none';
      btn.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
    });
  };

  colors.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = c.label;
    btn.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${c.val};
      cursor: pointer;
      padding: 0;
      transition: transform 0.15s ease;
    `;
    btn.onclick = () => {
      color = c.val;
      isHighlighter = false;
      updateColorButtons();
      updateHighlighterButton();
      updateCursor();
    };
    colorButtons.push(btn);
    toolbar.appendChild(btn);
  });
  updateColorButtons();

  addDivider();

  // Highlighter Tool Button
  const highlighterBtn = document.createElement('button');
  highlighterBtn.type = 'button';
  highlighterBtn.title = 'Semi-transparent broad highlighter';
  highlighterBtn.innerHTML = '🖍️ Highlighter';
  const updateHighlighterButton = () => {
    highlighterBtn.style.cssText = `
      background: ${isHighlighter ? '#facc15' : 'rgba(255,255,255,0.1)'};
      color: ${isHighlighter ? '#1e1b4b' : '#f8fafc'};
      border: none;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
    `;
  };
  updateHighlighterButton();
  highlighterBtn.onclick = () => {
    isHighlighter = !isHighlighter;
    updateHighlighterButton();
    updateColorButtons();
    updateCursor();
  };
  toolbar.appendChild(highlighterBtn);

  // Stroke Size Buttons Container
  const sizeGroup = document.createElement('div');
  sizeGroup.style.cssText = 'display: flex; gap: 3px;';
  const sizes = [
    { size: 2, label: 'Fine' },
    { size: 4, label: 'Med' },
    { size: 8, label: 'Thick' },
  ];
  const sizeButtons: HTMLButtonElement[] = [];

  const updateSizeButtons = () => {
    sizeButtons.forEach((btn, idx) => {
      const s = sizes[idx].size;
      btn.style.background = brushSize === s ? 'rgba(255,255,255,0.25)' : 'none';
    });
  };

  sizes.forEach((s) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = s.label;
    btn.style.cssText = `
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 2px 5px;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
    `;
    btn.onclick = () => {
      brushSize = s.size;
      isHighlighter = false;
      updateSizeButtons();
      updateHighlighterButton();
    };
    sizeButtons.push(btn);
    sizeGroup.appendChild(btn);
  });
  updateSizeButtons();
  toolbar.appendChild(sizeGroup);

  addDivider();

  // Undo Button
  const undoBtn = document.createElement('button');
  undoBtn.type = 'button';
  undoBtn.title = 'Undo last stroke';
  undoBtn.textContent = '↩ Undo';
  const updateUndoButton = () => {
    const canUndo = history.length > 0;
    undoBtn.style.cssText = `
      background: none;
      color: ${canUndo ? '#cbd5e1' : '#64748b'};
      border: none;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: ${canUndo ? 'pointer' : 'default'};
    `;
  };
  updateUndoButton();
  undoBtn.onclick = undo;
  toolbar.appendChild(undoBtn);

  // Clear Button
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.title = 'Clear all annotations';
  clearBtn.textContent = '🧽 Clear';
  clearBtn.style.cssText = `
    background: none;
    color: #f87171;
    border: none;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
  `;
  clearBtn.onclick = clearCanvas;
  toolbar.appendChild(clearBtn);

  // Snapshot Button
  const snapBtn = document.createElement('button');
  snapBtn.type = 'button';
  snapBtn.title = 'Download snapshot of drawing';
  snapBtn.textContent = '📸 Snapshot';
  snapBtn.style.cssText = `
    background: rgba(59, 130, 246, 0.25);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.4);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
  `;
  snapBtn.onclick = downloadSnapshot;
  toolbar.appendChild(snapBtn);

  // Close Button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.title = 'Close Chalkboard';
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    background: #ef4444;
    color: #ffffff;
    border: none;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    cursor: pointer;
    margin-left: 4px;
  `;
  closeBtn.onclick = () => {
    if (options.onClose) options.onClose();
    destroy();
  };
  toolbar.appendChild(closeBtn);

  root.appendChild(toolbar);
  container.appendChild(root);

  const destroy = () => {
    window.removeEventListener('resize', resizeCanvas);
    if (root.parentNode) {
      root.parentNode.removeChild(root);
    }
  };

  return {
    element: root,
    canvas,
    destroy,
    clear: clearCanvas,
    undo,
    downloadSnapshot,
    setColor: (c: string) => {
      color = c;
      isHighlighter = false;
      updateColorButtons();
      updateHighlighterButton();
      updateCursor();
    },
    setBrushSize: (s: number) => {
      brushSize = s;
      updateSizeButtons();
    },
    setIsHighlighter: (val: boolean) => {
      isHighlighter = val;
      updateHighlighterButton();
      updateColorButtons();
      updateCursor();
    },
  };
}

export default mountChalkboard;
