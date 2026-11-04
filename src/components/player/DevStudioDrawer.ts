// src/components/player/DevStudioDrawer.ts
/**
 * Developer Code Studio Drawer
 * Pure Vanilla TypeScript / DOM component.
 * Houses the live DOM Inspector, Raw SVG Editor, AST S-Expression Editor,
 * Curriculum Starter Templates, and the SWF Transcompiler Lathe.
 */

import { renderSvgInspectorDrawer, type InspectedElementData } from './SvgInspectorDrawer';
import { renderSwfTranspilerDrawer } from './SwfTranspilerDrawer';
import { renderPhetTranspilerDrawer } from './PhetTranspilerDrawer';
import { type SwfTranspileResult } from '../../utils/swfAstParser';

export type StudioTabType = 'inspector' | 'svg' | 'ast' | 'templates' | 'swf' | 'phet';

export interface DevStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studioTab: StudioTabType;
  setStudioTab: (tab: StudioTabType) => void;
  inspectedElement: InspectedElementData | null;
  setInspectedElement: (elem: InspectedElementData | null | ((prev: InspectedElementData | null) => InspectedElementData | null)) => void;
  customSvgCode: string;
  setCustomSvgCode: (code: string) => void;
  customAstCode: string;
  setCustomAstCode: (code: string) => void;
  hotReloadFlash: boolean;
  setHotReloadFlash: (val: boolean) => void;
  postToPlayer: (payload: Record<string, any>) => void;
  // SWF state
  swfResult: SwfTranspileResult | null;
  setSwfResult: (res: SwfTranspileResult | null) => void;
  isParsingSwf: boolean;
  setIsParsingSwf: (val: boolean) => void;
  swfError: string | null;
  setSwfError: (err: string | null) => void;
  swfDragActive: boolean;
  setSwfDragActive: (val: boolean) => void;
}

export function renderDevStudioDrawer(props: DevStudioDrawerProps): HTMLElement | null {
  if (!props.isOpen) return null;

  const {
    onClose,
    studioTab,
    setStudioTab,
    inspectedElement,
    setInspectedElement,
    customSvgCode,
    setCustomSvgCode,
    customAstCode,
    setCustomAstCode,
    hotReloadFlash,
    setHotReloadFlash,
    postToPlayer,
    swfResult,
    setSwfResult,
    isParsingSwf,
    setIsParsingSwf,
    swfError,
    setSwfError,
    swfDragActive,
    setSwfDragActive,
  } = props;

  const container = document.createElement('div');
  container.className = 'ast-dev-studio-drawer';
  container.style.cssText = `
    background: var(--stj-surface-raised, #0f172a);
    border-top: 2px solid var(--stj-primary, #38bdf8);
    padding: 14px;
    color: var(--stj-text, #f8fafc);
    font-size: 0.82rem;
  `;

  // 1. Mission Banner
  const banner = document.createElement('div');
  banner.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--stj-border, #334155); flex-wrap: wrap; gap: 8px;';
  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 1.2rem;">💻</span>
      <div>
        <strong style="font-size: 0.86rem; color: var(--stj-text, #f8fafc);">
          AST Vector Studio
        </strong>
        <span style="font-size: 0.74rem; color: var(--stj-text-muted, #94a3b8); margin-left: 8px;">
          Inspect stage nodes, live-edit SVG markup, and test continuous AST mathematics with zero cloud lag.
        </span>
      </div>
    </div>
  `;
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'stj-btn stj-btn-ghost stj-btn-sm';
  closeBtn.style.cssText = 'font-size: 0.74rem; padding: 3px 8px; cursor: pointer;';
  closeBtn.textContent = '✕ Close Studio';
  closeBtn.onclick = onClose;
  banner.appendChild(closeBtn);
  container.appendChild(banner);

  // 2. Header & Tab Bar
  const tabRow = document.createElement('div');
  tabRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;';

  const tabBtns = document.createElement('div');
  tabBtns.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap;';

  const tabs: Array<{ id: StudioTabType; label: string; title?: string }> = [
    { id: 'svg', label: '🎨 Raw SVG Source' },
    { id: 'ast', label: '⚡ AST Expressions' },
    { id: 'inspector', label: '🎯 Live Inspector' },
    { id: 'templates', label: '🚀 Scratchpad Templates' },
    { id: 'swf', label: '📦 SWF / Flash Importer', title: 'Transpile legacy Adobe Flash (.swf) into modern SVG + AST vectors' },
    { id: 'phet', label: '⚛️ PhET Importer', title: 'Transpile PhET simulations into lightweight 3.5 KB AST S-Expressions' },
  ];

  tabs.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `stj-btn ${studioTab === t.id ? 'stj-btn-primary' : 'stj-btn-ghost'} stj-btn-sm`;
    btn.style.fontSize = '0.76rem';
    btn.textContent = t.label;
    if (t.title) btn.title = t.title;
    btn.onclick = () => setStudioTab(t.id);
    tabBtns.appendChild(btn);
  });
  tabRow.appendChild(tabBtns);

  const actions = document.createElement('div');
  actions.style.cssText = 'display: flex; align-items: center; gap: 6px;';

  if (hotReloadFlash) {
    const badge = document.createElement('span');
    badge.className = 'stj-badge stj-badge-success';
    badge.style.fontSize = '0.72rem';
    badge.textContent = '✓ Hot-Reloaded!';
    actions.appendChild(badge);
  }

  const runBtn = document.createElement('button');
  runBtn.type = 'button';
  runBtn.className = 'stj-btn stj-btn-primary stj-btn-sm';
  runBtn.style.cssText = 'font-size: 0.76rem; font-weight: 700; cursor: pointer;';
  runBtn.textContent = '⚡ Run / Hot Reload';
  runBtn.onclick = () => {
    if (studioTab === 'svg') {
      postToPlayer({ type: 'HOT_RELOAD_SVG', svg: customSvgCode });
    } else if (studioTab === 'ast') {
      postToPlayer({ type: 'HOT_RELOAD_AST', ast: customAstCode });
    } else {
      postToPlayer({ type: 'HOT_RELOAD_SVG', svg: customSvgCode });
      postToPlayer({ type: 'HOT_RELOAD_AST', ast: customAstCode });
    }
  };
  actions.appendChild(runBtn);

  const pullBtn = document.createElement('button');
  pullBtn.type = 'button';
  pullBtn.className = 'stj-btn stj-btn-secondary stj-btn-sm';
  pullBtn.style.fontSize = '0.76rem';
  pullBtn.title = 'Sync current stage SVG and AST source from player';
  pullBtn.textContent = '↺ Pull from Stage';
  pullBtn.onclick = () => postToPlayer({ type: 'GET_STAGE_SVG' });
  actions.appendChild(pullBtn);

  tabRow.appendChild(actions);
  container.appendChild(tabRow);

  // 3. Active Tab Contents
  const contentArea = document.createElement('div');

  if (studioTab === 'inspector') {
    contentArea.appendChild(
      renderSvgInspectorDrawer({
        inspectedElement,
        setInspectedElement,
        postToPlayer,
      })
    );
  } else if (studioTab === 'svg') {
    const svgWrap = document.createElement('div');
    const textarea = document.createElement('textarea');
    textarea.value = customSvgCode;
    textarea.placeholder = "Click '↺ Pull from Stage' or paste SVG markup here...";
    textarea.style.cssText = `
      width: 100%;
      height: 180px;
      background: var(--stj-canvas, #090d16);
      color: var(--stj-text, #f8fafc);
      border: 1px solid var(--stj-border, #334155);
      border-radius: var(--stj-radius-sm, 6px);
      padding: 10px;
      font-size: 0.76rem;
      font-family: monospace;
      line-height: 1.4;
      resize: vertical;
    `;
    textarea.oninput = (e) => setCustomSvgCode((e.target as HTMLTextAreaElement).value);
    svgWrap.appendChild(textarea);
    contentArea.appendChild(svgWrap);
  } else if (studioTab === 'ast') {
    const astWrap = document.createElement('div');
    const textarea = document.createElement('textarea');
    textarea.value = customAstCode;
    textarea.placeholder = "Enter AST S-Expressions: (:scene :id ... (:keyframes ...) (:bindings ...))";
    textarea.style.cssText = `
      width: 100%;
      height: 180px;
      background: var(--stj-canvas, #090d16);
      color: var(--stj-text, #f8fafc);
      border: 1px solid var(--stj-border, #334155);
      border-radius: var(--stj-radius-sm, 6px);
      padding: 10px;
      font-size: 0.76rem;
      font-family: monospace;
      line-height: 1.4;
      resize: vertical;
    `;
    textarea.oninput = (e) => setCustomAstCode((e.target as HTMLTextAreaElement).value);
    astWrap.appendChild(textarea);
    contentArea.appendChild(astWrap);
  } else if (studioTab === 'templates') {
    const tmplGrid = document.createElement('div');
    tmplGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;';

    const tmpls = [
      {
        title: '🪐 Orbital Gravity & Vector Physics',
        desc: 'Direct simulation of Keplerian planetary orbital motion and gravitational velocity vector tangent lines.',
        svg: `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><circle cx="400" cy="240" r="32" fill="#fbbf24" filter="url(#glow)" /><circle id="planet-body" cx="400" cy="80" r="14" fill="#38bdf8" /><line id="velocity-vector" x1="400" y1="80" x2="450" y2="80" stroke="#f43f5e" stroke-width="3" /><text id="velocity-label" x="400" y="50" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">v = 29.8 km/s</text></svg>`,
        ast: `(:scene :id "orbital-physics" :title "Orbital Mechanics" :stage "KS4 ASTRONOMY" :duration 6.0 (:keyframes ((:t 0.00 :title "Aphelion" :rule "Minimum orbital velocity") (:t 0.50 :title "Perihelion" :rule "Maximum gravitational acceleration"))) (:bindings ((:target "#planet-body" :attr "cx" :expr "400 + Math.cos(t * Math.PI * 2) * 220") (:target "#planet-body" :attr "cy" :expr "240 + Math.sin(t * Math.PI * 2) * 140") (:target "#velocity-vector" :attr "x1" :expr "400 + Math.cos(t * Math.PI * 2) * 220") (:target "#velocity-vector" :attr "y1" :expr "240 + Math.sin(t * Math.PI * 2) * 140") (:target "#velocity-vector" :attr "x2" :expr "400 + Math.cos(t * Math.PI * 2) * 220 - Math.sin(t * Math.PI * 2) * 60") (:target "#velocity-vector" :attr "y2" :expr "240 + Math.sin(t * Math.PI * 2) * 140 + Math.cos(t * Math.PI * 2) * 60") (:target "#velocity-label" :attr "textContent" :expr "'Orbital speed: ' + (29.8 + Math.cos(t * Math.PI * 2) * 5).toFixed(1) + ' km/s'"))))`,
      },
      {
        title: '🌊 Harmonic Wave',
        desc: 'Continuous wave motion demonstrating frequency, amplitude, and crests.',
        svg: `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><line x1="100" y1="240" x2="700" y2="240" stroke="#334155" stroke-width="2" /><path id="harmonic-wave" d="M 100 240 Q 250 140 400 240 T 700 240" fill="none" stroke="#38bdf8" stroke-width="4" /><circle id="wave-tracer" cx="400" cy="240" r="10" fill="#f43f5e" filter="url(#glow)" /><text id="wave-label" x="400" y="80" fill="#38bdf8" font-size="20" font-weight="bold" text-anchor="middle">y = A · sin(ωt + φ)</text></svg>`,
        ast: `(:scene :id "sine-wave" :title "Harmonic Sine Wave" :stage "KS4 PHYSICS" :duration 4.0 (:keyframes ((:t 0.00 :title "Initial Phase" :rule "Zero displacement at origin") (:t 0.25 :title "Crest Amplitude" :rule "Maximum positive displacement +A"))) (:bindings ((:target "#wave-tracer" :attr "cy" :expr "240 - Math.sin(t * Math.PI * 2) * 90") (:target "#wave-tracer" :attr "cx" :expr "100 + (t * 600)") (:target "#wave-label" :attr "textContent" :expr "'Displacement y = ' + (Math.sin(t * Math.PI * 2) * 10).toFixed(1) + ' cm'"))))`,
      },
      {
        title: '⏱️ Harmonic Pendulum',
        desc: 'Conservation of energy demonstrating kinetic vs potential oscillation.',
        svg: `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><circle cx="400" cy="80" r="6" fill="#64748b" /><line id="pendulum-rod" x1="400" y1="80" x2="400" y2="340" stroke="#94a3b8" stroke-width="3" /><circle id="pendulum-bob" cx="400" cy="340" r="28" fill="#10b981" stroke="#34d399" stroke-width="2" /><text id="energy-txt" x="400" y="420" fill="#34d399" font-size="16" font-weight="bold" text-anchor="middle">E = Ep + Ek</text></svg>`,
        ast: `(:scene :id "physics-pendulum" :title "Harmonic Pendulum" :stage "KS3 PHYSICS" :duration 3.0 (:keyframes ((:t 0.00 :title "Max Left Amplitude" :rule "Ep is maximal, Ek = 0") (:t 0.25 :title "Equilibrium Pass" :rule "Ek is maximal at center, Ep is minimum"))) (:bindings ((:target "#pendulum-rod" :attr "transform" :expr "'rotate(' + (Math.sin(t * Math.PI * 2) * 40) + ' 400 80)'") (:target "#pendulum-bob" :attr "transform" :expr "'rotate(' + (Math.sin(t * Math.PI * 2) * 40) + ' 400 80)'") (:target "#energy-txt" :attr "textContent" :expr "'Potential Energy: ' + (Math.abs(Math.sin(t * Math.PI * 2)) * 100).toFixed(0) + '% | Kinetic: ' + ((1 - Math.abs(Math.sin(t * Math.PI * 2))) * 100).toFixed(0) + '%'"))))`,
      },
    ];

    tmpls.forEach((tmpl) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: var(--stj-canvas, #090d16);
        border: 1px solid var(--stj-border, #334155);
        padding: 12px;
        border-radius: var(--stj-radius-sm, 6px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      `;
      card.innerHTML = `
        <div>
          <h5 style="margin: 0 0 4px; font-size: 0.85rem; color: var(--stj-text, #f8fafc);">${tmpl.title}</h5>
          <p style="margin: 0; font-size: 0.75rem; color: var(--stj-text-muted, #94a3b8);">${tmpl.desc}</p>
        </div>
      `;
      const loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.className = 'stj-btn stj-btn-primary stj-btn-sm';
      loadBtn.style.cssText = 'margin-top: 10px; font-size: 0.74rem; cursor: pointer;';
      loadBtn.textContent = 'Load Template ➜';
      loadBtn.onclick = () => {
        postToPlayer({ type: 'HOT_RELOAD_SVG', svg: tmpl.svg });
        postToPlayer({ type: 'HOT_RELOAD_AST', ast: tmpl.ast });
        setHotReloadFlash(true);
        setTimeout(() => setHotReloadFlash(false), 2000);
      };
      card.appendChild(loadBtn);
      tmplGrid.appendChild(card);
    });

    contentArea.appendChild(tmplGrid);
  } else if (studioTab === 'swf') {
    contentArea.appendChild(
      renderSwfTranspilerDrawer({
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
      })
    );
  } else if (studioTab === 'phet') {
    contentArea.appendChild(
      renderPhetTranspilerDrawer({
        setCustomSvgCode,
        setCustomAstCode,
        postToPlayer,
        setHotReloadFlash,
      })
    );
  }

  container.appendChild(contentArea);
  return container;
}

export const DevStudioDrawer = renderDevStudioDrawer;
export default renderDevStudioDrawer;
