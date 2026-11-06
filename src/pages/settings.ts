import { getBaseUrl } from '../utils/url';
import settingsAST from './settings.ast.json';

type TupleSetting = [
  type: 'select' | 'toggle' | 'segmented',
  id: string,
  label: string,
  storageKey: string,
  defaultValue: any,
  meta: any,
  description: string | null
];

export function renderSettingsPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'settings-page-stage';
  container.style.cssText = 'max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  function getValue(key: string, fallback: any): any {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return raw;
  }

  function setValue(key: string, val: any, attr?: string) {
    localStorage.setItem(key, String(val));
    if (attr) document.documentElement.setAttribute(attr, String(val));
    window.dispatchEvent(new CustomEvent('app-setting-changed', { detail: { key, value: val } }));
  }

  function render() {
    let sectionsHtml = '';

    for (const section of settingsAST.sections) {
      let itemsHtml = '';

      for (const item of (section.items as TupleSetting[])) {
        const [type, id, label, key, fallback, meta, desc] = item;
        const currentVal = getValue(key, fallback);

        let controlHtml = '';

        if (type === 'toggle') {
          const isActive = meta.activeVal ? currentVal === meta.activeVal : Boolean(currentVal);
          const buttonText = isActive ? meta.activeLabel : meta.inactiveLabel;
          controlHtml = `
            <button type="button" id="${id}" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${isActive ? '#0284c7' : '#cbd5e1'}; background:${isActive ? '#f0f9ff' : '#f8fafc'}; color:${isActive ? '#0284c7' : '#334155'}; font-weight:700; font-size:0.88rem; cursor:pointer;">
              ${buttonText}
            </button>
          `;
        } else if (type === 'select') {
          const options = (meta as [string, string][])
            .map(([val, optLabel]) => `<option value="${val}" ${currentVal === val ? 'selected' : ''}>${optLabel}</option>`)
            .join('');
          controlHtml = `
            <select id="${id}" style="width:100%; max-width:360px; padding:8px 12px; border-radius:8px; border:1.5px solid #0284c7; background:#fff; font-size:0.9rem; font-weight:700; cursor:pointer;">
              ${options}
            </select>
          `;
        } else if (type === 'segmented') {
          const buttons = (meta as [string, string][])
            .map(([val, optLabel]) => {
              const sel = currentVal === val;
              return `<button type="button" class="${id}-btn" data-val="${val}" style="padding:6px 14px; border-radius:6px; border:1px solid ${sel ? '#0284c7' : '#cbd5e1'}; background:${sel ? '#0284c7' : '#f8fafc'}; color:${sel ? '#fff' : '#334155'}; font-weight:700; cursor:pointer;">${optLabel}</button>`;
            })
            .join(' ');
          controlHtml = `<div style="display:flex; gap:6px;">${buttons}</div>`;
        }

        itemsHtml += `
          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">${label}</label>
            ${controlHtml}
            ${desc ? `<p style="font-size:0.75rem; color:#94a3b8; margin:6px 0 0 0;">${desc}</p>` : ''}
          </div>
        `;
      }

      sectionsHtml += `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>${section.icon}</span> ${section.title}
          </h2>
          ${section.description ? `<p style="font-size:0.85rem; color:#64748b; margin:0 0 1.25rem 0; line-height:1.5;">${section.description}</p>` : ''}
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">⚙️ System Settings</span>
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Preferences &amp; System Configuration</h1>
        <p style="font-size:0.95rem; color:#64748b; margin:0;">
          All preferences are stored directly on your device via declarative AST bindings.
        </p>
      </div>
      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${sectionsHtml}
      </div>
    `;

    // Bind Event Listeners dynamically from AST definitions
    for (const section of settingsAST.sections) {
      for (const item of (section.items as TupleSetting[])) {
        const [type, id, , key, fallback, meta] = item;

        if (type === 'toggle') {
          container.querySelector(`#${id}`)?.addEventListener('click', () => {
            if (meta.activeVal) {
              const cur = getValue(key, fallback);
              setValue(key, cur === meta.activeVal ? meta.inactiveVal : meta.activeVal, meta.attr);
            } else {
              const cur = getValue(key, fallback);
              setValue(key, !cur, meta.attr);
            }
            render();
          });
        } else if (type === 'select') {
          container.querySelector(`#${id}`)?.addEventListener('change', (e) => {
            setValue(key, (e.target as HTMLSelectElement).value, meta?.attr);
          });
        } else if (type === 'segmented') {
          container.querySelectorAll(`.${id}-btn`).forEach(btn => {
            btn.addEventListener('click', () => {
              setValue(key, btn.getAttribute('data-val'), meta?.attr);
              render();
            });
          });
        }
      }
    }
  }

  render();
  return container;
}

export default renderSettingsPage;
