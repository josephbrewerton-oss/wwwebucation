// src/components/player/SvgInspectorDrawer.ts
/**
 * SVG Element Inspector Drawer
 * Pure Vanilla TypeScript / DOM component.
 * Provides real-time inspection, bounding box diagnostics, and live styling attribute manipulation
 * for selected SVG nodes on the vector stage.
 */

export interface InspectedElementData {
  selector: string;
  tag: string;
  id: string;
  bbox: { x: number; y: number; width: number; height: number };
  attributes: { fill?: string; stroke?: string; strokeWidth?: string; opacity?: string; transform?: string };
}

export interface SvgInspectorDrawerProps {
  inspectedElement: InspectedElementData | null;
  setInspectedElement: (elem: InspectedElementData | null | ((prev: InspectedElementData | null) => InspectedElementData | null)) => void;
  postToPlayer: (payload: Record<string, any>) => void;
}

export function renderSvgInspectorDrawer(props: SvgInspectorDrawerProps): HTMLElement {
  const { inspectedElement, setInspectedElement, postToPlayer } = props;

  const container = document.createElement('div');
  container.className = 'ast-svg-inspector-drawer';
  container.style.cssText = `
    background: var(--stj-canvas, #090d16);
    border: 1px solid var(--stj-border, #334155);
    border-radius: var(--stj-radius-sm, 6px);
    padding: 12px;
    color: var(--stj-text, #f8fafc);
  `;

  if (inspectedElement) {
    const wrap = document.createElement('div');

    // Header Info
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;';
    topRow.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="stj-badge stj-badge-primary">&lt;${inspectedElement.tag || 'element'}&gt;</span>
        <code style="color: var(--stj-primary, #38bdf8); font-weight: 700;">${inspectedElement.selector || '#element'}</code>
      </div>
      <span style="font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8);">
        Bounds: ${Math.round(inspectedElement.bbox?.width || 0)}×${Math.round(inspectedElement.bbox?.height || 0)} px
      </span>
    `;
    wrap.appendChild(topRow);

    // Inputs Grid
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;';

    const createField = (label: string, value: string, placeholder: string, onChange: (val: string) => void, type = 'text', step?: string) => {
      const field = document.createElement('div');
      const lab = document.createElement('label');
      lab.style.cssText = 'font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8); display: block; margin-bottom: 3px;';
      lab.textContent = label;
      field.appendChild(lab);

      const input = document.createElement('input');
      input.type = type;
      if (step) input.step = step;
      input.value = value;
      input.placeholder = placeholder;
      input.className = 'stj-input';
      input.style.cssText = 'width: 100%; font-size: 0.76rem; padding: 4px 8px; background: #1e293b; color: #fff; border: 1px solid #334155; border-radius: 4px;';
      input.oninput = (e) => onChange((e.target as HTMLInputElement).value);
      field.appendChild(input);

      return field;
    };

    // Fill
    grid.appendChild(createField('Fill Color', inspectedElement.attributes?.fill || '', '#ff0000 or rgba(...)', (val) => {
      setInspectedElement({
        ...inspectedElement,
        attributes: { ...(inspectedElement.attributes || {}), fill: val },
      });
      postToPlayer({ type: 'UPDATE_ELEMENT_ATTR', selector: inspectedElement.selector, attr: 'fill', value: val });
    }));

    // Stroke
    grid.appendChild(createField('Stroke Color', inspectedElement.attributes?.stroke || '', '#38bdf8', (val) => {
      setInspectedElement({
        ...inspectedElement,
        attributes: { ...(inspectedElement.attributes || {}), stroke: val },
      });
      postToPlayer({ type: 'UPDATE_ELEMENT_ATTR', selector: inspectedElement.selector, attr: 'stroke', value: val });
    }));

    // Stroke Width
    grid.appendChild(createField('Stroke Width', inspectedElement.attributes?.strokeWidth || '1', '1', (val) => {
      setInspectedElement({
        ...inspectedElement,
        attributes: { ...(inspectedElement.attributes || {}), strokeWidth: val },
      });
      postToPlayer({ type: 'UPDATE_ELEMENT_ATTR', selector: inspectedElement.selector, attr: 'stroke-width', value: val });
    }, 'number', '0.5'));

    // Transform
    grid.appendChild(createField('Transform Expr', inspectedElement.attributes?.transform || '', 'e.g. translate(20, 10)', (val) => {
      setInspectedElement({
        ...inspectedElement,
        attributes: { ...(inspectedElement.attributes || {}), transform: val },
      });
      postToPlayer({ type: 'UPDATE_ELEMENT_ATTR', selector: inspectedElement.selector, attr: 'transform', value: val });
    }));

    wrap.appendChild(grid);

    // Actions
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;';

    const copySelBtn = document.createElement('button');
    copySelBtn.type = 'button';
    copySelBtn.className = 'stj-btn stj-btn-secondary stj-btn-sm';
    copySelBtn.style.fontSize = '0.74rem';
    copySelBtn.textContent = '📋 Copy Selector';
    copySelBtn.onclick = () => {
      if (inspectedElement.selector) {
        navigator.clipboard.writeText(inspectedElement.selector);
      }
    };
    actionRow.appendChild(copySelBtn);

    const copyRuleBtn = document.createElement('button');
    copyRuleBtn.type = 'button';
    copyRuleBtn.className = 'stj-btn stj-btn-primary stj-btn-sm';
    copyRuleBtn.style.fontSize = '0.74rem';
    copyRuleBtn.textContent = '⚡ Copy AST Rule Snippet';
    copyRuleBtn.onclick = () => {
      const rule = `(:target "${inspectedElement.selector || '#element'}" :attr "transform" :expr "'rotate(' + (t * 360) + ')'")`;
      navigator.clipboard.writeText(rule);
    };
    actionRow.appendChild(copyRuleBtn);

    wrap.appendChild(actionRow);
    container.appendChild(wrap);
  } else {
    container.innerHTML = `
      <div style="text-align: center; padding: 16px; color: var(--stj-text-muted, #94a3b8);">
        <div style="font-size: 1.4rem; margin-bottom: 6px;">🎯</div>
        <strong style="color: var(--stj-text, #f8fafc);">No Stage Element Selected Yet</strong>
        <p style="margin: 4px 0 10px; font-size: 0.78rem;">
          Click any element on the vector stage to inspect its selector, bounding box, and live styling in real time.
        </p>
        <button id="ast-activate-selector-btn" type="button" class="stj-btn stj-btn-primary stj-btn-sm" style="font-size: 0.76rem; font-weight: 700; cursor: pointer;">
          🛠️ Activate Element Selector
        </button>
      </div>
    `;
    container.querySelector('#ast-activate-selector-btn')?.addEventListener('click', () => {
      postToPlayer({ type: 'SET_DEV_MODE', enabled: true });
    });
  }

  return container;
}

export const SvgInspectorDrawer = renderSvgInspectorDrawer;
export default renderSvgInspectorDrawer;
