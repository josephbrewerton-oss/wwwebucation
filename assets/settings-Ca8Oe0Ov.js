import{m as e}from"./index-Cl4e2W7A.js";var t={id:`system-settings-manifest`,version:1,sections:[{id:`content-deck`,icon:`🎯`,title:`Content Sector & Cartridge Deck`,description:`Configure which AST cartridges are mounted in the active workspace.`,items:[[`select`,`setting-cohort`,`Target Cohort / Focus`,`app_sector_cohort`,`all`,[[`all`,`🌟 Comprehensive (All Sectors Visible)`],[`k12_stem`,`🎒 Primary & Secondary STEM (Under-18s)`],[`vocational_foundation`,`🛠️ Vocational & Youth (e.g. King's Trust)`],[`adult_workplace`,`💼 Adult Workplace & Interview Prep`]],`Select the active curriculum or vocational stage.`],[`toggle`,`setting-faith`,`Faith & Liturgical Formation`,`app_faith_modules`,!1,{activeLabel:`✝️ Faith Deck: ACTIVE`,inactiveLabel:`✝️ Faith Deck: HIDDEN`},`Includes Catholic liturgical apparatuses, Scripture studies, and virtue trackers.`]]},{id:`visual-sensory`,icon:`👁️`,title:`Visual & Sensory Access`,items:[[`toggle`,`setting-theme`,`Display Theme`,`theme`,`light`,{activeVal:`dark`,inactiveVal:`light`,activeLabel:`🌙 Dark Mode`,inactiveLabel:`☀️ Light Mode`,attr:`data-theme`},null],[`segmented`,`setting-font-size`,`Font Size`,`app_font_size`,`normal`,[[`normal`,`Standard (A)`],[`large`,`Large (A+)`]],null],[`toggle`,`setting-contrast`,`High Contrast Mode`,`app_high_contrast`,!1,{activeLabel:`🌓 High Contrast: ON`,inactiveLabel:`🌓 High Contrast: OFF`,attr:`data-high-contrast`},null]]},{id:`language-access`,icon:`🌐`,title:`Language & Translation`,items:[[`select`,`setting-lang`,`Default Portal Language`,`app_language`,`en`,[[`en`,`🇬🇧 English`],[`es`,`🇪🇸 Español`],[`fr`,`🇫🇷 Français`],[`la`,`🇻🇦 Latina`],[`de`,`🇩🇪 Deutsch`],[`pl`,`🇵🇱 Polski`],[`uk`,`🇺🇦 Українська`],[`pt`,`🇵🇹 Português`],[`ar`,`🇸🇦 العربية`]],null],[`toggle`,`setting-bsl`,`BSL In-Vision Interpreter`,`app_bsl_enabled`,!1,{activeLabel:`🖐️ BSL Signing: ON`,inactiveLabel:`🖐️ BSL Signing: OFF`},`Our in-vision procedural vector interpreter signs synchronously with speech.`]]},{id:`data-saver-section`,icon:`📶`,title:`Low-Bandwidth Data Saver Mode`,description:`Suppresses external font requests and background downloads.`,items:[[`toggle`,`setting-data-saver`,`Data Saver Mode`,`app_data_saver`,!1,{activeLabel:`📶 Data Saver: ON`,inactiveLabel:`📶 Data Saver: OFF`},`Runs exclusively on local vector assets to conserve mobile data.`]]}]};function n(){let n=e(),r=document.createElement(`div`);r.className=`settings-page-stage`,r.style.cssText=`max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;function i(e,t){let n=localStorage.getItem(e);return n===null?t:n===`true`||n!==`false`&&n}function a(e,t,n){localStorage.setItem(e,String(t)),n&&document.documentElement.setAttribute(n,String(t)),window.dispatchEvent(new CustomEvent(`app-setting-changed`,{detail:{key:e,value:t}}))}function o(){let e=``;for(let n of t.sections){let t=``;for(let e of n.items){let[n,r,a,o,s,c,l]=e,u=i(o,s),d=``;if(n===`toggle`){let e=c.activeVal?u===c.activeVal:!!u,t=e?c.activeLabel:c.inactiveLabel;d=`
            <button type="button" id="${r}" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${e?`#0284c7`:`#cbd5e1`}; background:${e?`#f0f9ff`:`#f8fafc`}; color:${e?`#0284c7`:`#334155`}; font-weight:700; font-size:0.88rem; cursor:pointer;">
              ${t}
            </button>
          `}else n===`select`?d=`
            <select id="${r}" style="width:100%; max-width:360px; padding:8px 12px; border-radius:8px; border:1.5px solid #0284c7; background:#fff; font-size:0.9rem; font-weight:700; cursor:pointer;">
              ${c.map(([e,t])=>`<option value="${e}" ${u===e?`selected`:``}>${t}</option>`).join(``)}
            </select>
          `:n===`segmented`&&(d=`<div style="display:flex; gap:6px;">${c.map(([e,t])=>{let n=u===e;return`<button type="button" class="${r}-btn" data-val="${e}" style="padding:6px 14px; border-radius:6px; border:1px solid ${n?`#0284c7`:`#cbd5e1`}; background:${n?`#0284c7`:`#f8fafc`}; color:${n?`#fff`:`#334155`}; font-weight:700; cursor:pointer;">${t}</button>`}).join(` `)}</div>`);t+=`
          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">${a}</label>
            ${d}
            ${l?`<p style="font-size:0.75rem; color:#94a3b8; margin:6px 0 0 0;">${l}</p>`:``}
          </div>
        `}e+=`
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>${n.icon}</span> ${n.title}
          </h2>
          ${n.description?`<p style="font-size:0.85rem; color:#64748b; margin:0 0 1.25rem 0; line-height:1.5;">${n.description}</p>`:``}
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
            ${t}
          </div>
        </div>
      `}r.innerHTML=`
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${n}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">⚙️ System Settings</span>
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Preferences &amp; System Configuration</h1>
        <p style="font-size:0.95rem; color:#64748b; margin:0;">
          All preferences are stored directly on your device via declarative AST bindings.
        </p>
      </div>
      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${e}
      </div>
    `;for(let e of t.sections)for(let t of e.items){let[e,n,,s,c,l]=t;e===`toggle`?r.querySelector(`#${n}`)?.addEventListener(`click`,()=>{if(l.activeVal){let e=i(s,c);a(s,e===l.activeVal?l.inactiveVal:l.activeVal,l.attr)}else{let e=i(s,c);a(s,!e,l.attr)}o()}):e===`select`?r.querySelector(`#${n}`)?.addEventListener(`change`,e=>{a(s,e.target.value,l?.attr)}):e===`segmented`&&r.querySelectorAll(`.${n}-btn`).forEach(e=>{e.addEventListener(`click`,()=>{a(s,e.getAttribute(`data-val`),l?.attr),o()})})}}return o(),r}export{n as default,n as renderSettingsPage};