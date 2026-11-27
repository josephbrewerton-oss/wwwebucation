const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rolldown-runtime-XKyaHtl9.js","assets/customSignStore-DiTFnY84.js","assets/bslMediaPipeMapper-DIWAJTBi.js"])))=>i.map(i=>d[i]);
import{g as e}from"./cartridge-vault-DWJHacKo.js";import{F as t,I as n,L as r,M as i,N as a,R as o,V as s,W as c,ct as l,ft as u,j as d}from"./bsl-engine-BOjn8tiW.js";import{c as f,d as p,f as m,l as h,s as g}from"./index-B-MMB-4Q.js";import{t as _}from"./complianceCaveats-BsWRUQKo.js";var v={id:`system-settings-manifest`,version:1,sections:[{id:`content-deck`,icon:`🎯`,title:`Content Sector & Cartridge Deck`,description:`Configure which AST cartridges are mounted in the active workspace.`,items:[[`select`,`setting-cohort`,`Target Cohort / Focus`,`app_sector_cohort`,`all`,[[`all`,`🌟 Comprehensive (All Sectors Visible)`],[`k12_stem`,`🎒 Primary & Secondary STEM (Under-18s)`],[`vocational_foundation`,`🛠️ Vocational & Youth (e.g. King's Trust)`],[`adult_workplace`,`💼 Adult Workplace & Interview Prep`]],`Select the active curriculum or vocational stage.`],[`toggle`,`setting-faith`,`Faith & Liturgical Formation`,`app_faith_modules`,!1,{activeLabel:`✝️ Faith Deck: ACTIVE`,inactiveLabel:`✝️ Faith Deck: HIDDEN`},`Includes Catholic liturgical apparatuses, Scripture studies, and virtue trackers.`]]},{id:`visual-sensory`,icon:`👁️`,title:`Visual & Sensory Access`,items:[[`toggle`,`setting-theme`,`Display Theme`,`theme`,`light`,{activeVal:`dark`,inactiveVal:`light`,activeLabel:`🌙 Dark Mode`,inactiveLabel:`☀️ Light Mode`,attr:`data-theme`},null],[`segmented`,`setting-font-size`,`Font Size`,`app_font_size`,`normal`,[[`normal`,`Standard (A)`],[`large`,`Large (A+)`]],null],[`toggle`,`setting-contrast`,`High Contrast Mode`,`app_high_contrast`,!1,{activeLabel:`🌓 High Contrast: ON`,inactiveLabel:`🌓 High Contrast: OFF`,attr:`data-high-contrast`},null]]},{id:`language-access`,icon:`🌐`,title:`Language & Translation`,items:[[`select`,`setting-lang`,`Default Portal Language`,`app_language`,`en`,[],`45 developing-world, global, and liturgical languages powered by instant offline lexicons, browser-native W3C Translator API, and optional on-device Gemini Nano (zero cloud egress).`],[`select`,`setting-bsl`,`In-Vision Sign Interpreter System`,`stj_sign_language`,`OFF`,[[`OFF`,`🚫 Sign Interpreter: OFF`],[`BSL`,`🇬🇧 British Sign Language — BSL Level 6 (OSV + Classifiers)`],[`MAKATON`,`🤝 Makaton — SEN Key Word Signing + Symbols (English SVO)`]],`Educational practice & training aid for BSL visual-spatial grammar and Makaton-style key word signing — designed to help learners practise, not to replace a qualified human BSL interpreter or accredited tutor.`]]},{id:`data-saver-section`,icon:`📶`,title:`Low-Bandwidth Data Saver Mode`,description:`Suppresses external font requests and background downloads.`,items:[[`toggle`,`setting-data-saver`,`Data Saver Mode`,`app_data_saver`,!1,{activeLabel:`📶 Data Saver: ON`,inactiveLabel:`📶 Data Saver: OFF`},`Runs exclusively on local vector assets to conserve mobile data.`]]},{id:`diagnostics-telemetry`,icon:`⚡`,title:`Hardware & Engine Diagnostics`,description:`Inspect local client performance, memory budgets, and offline runtime integrity.`,items:[[`toggle`,`setting-perf-hud`,`Live Performance HUD`,`app_perf_hud_enabled`,!1,{activeLabel:`📊 Engine HUD: VISIBLE`,inactiveLabel:`📊 Engine HUD: HIDDEN`},`Overlays a zero-allocation vector HUD showing real-time FPS, AST step duration, and heap usage.`],[`select`,`setting-hud-detail`,`HUD Detail Level`,`app_hud_verbosity`,`minimal`,[[`minimal`,`Minimal (FPS & VM ms Badge)`],[`graph`,`Vector Sparkline (Rolling Frame Buffer)`],[`full`,`Full Telemetry (FPS, Jitter, WASM Memory Pool, GC)`]],`Configure the diagnostic resolution drawn onto the SVG viewport.`],[`toggle`,`setting-strict-budget`,`Strict 16.6ms Budget Alarms`,`app_frame_budget_alert`,!1,{activeLabel:`⏱️ Budget Alarms: ON`,inactiveLabel:`⏱️ Budget Alarms: OFF`},`Highlights frames in amber or red whenever a simulation step consumes more than 16.6 ms.`]]}]};function y(){let y=e(),b=document.createElement(`div`);b.className=`settings-page-stage`,b.style.cssText=`max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let x=null;function S(e,t){if(e===`stj_sign_language`)return s();if(e===`app_language`)return h();let n=l(e);return n===null?t:n===`true`||n!==`false`&&n}function C(e,t,n){e===`stj_sign_language`?(c(t),window.dispatchEvent(new CustomEvent(`app-setting-changed`,{detail:{key:e,value:t}}))):e===`app_language`?(m(String(t)),u(e,String(t)),window.dispatchEvent(new CustomEvent(`app-setting-changed`,{detail:{key:e,value:t}}))):(u(e,String(t)),n&&document.documentElement.setAttribute(n,String(t)),window.dispatchEvent(new CustomEvent(`app-setting-changed`,{detail:{key:e,value:t}})))}function w(){let e=a(),t=_(h()),n=e.downloadProgress??0,r=`⚪ Not Detected`,i=`background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;`;e.nanoStatus===`available`?(r=`🟢 Installed & Ready`,i=`background:#ecfdf5; color:#065f46; border:1px solid #10b981;`):e.nanoStatus===`downloadable`?(r=`⬇️ Downloadable on Device`,i=`background:#f0f9ff; color:#0369a1; border:1px solid #38bdf8;`):e.nanoStatus===`downloading`?(r=`⏳ Downloading (${n}%)`,i=`background:#f0f9ff; color:#0369a1; border:1px solid #0284c7;`):e.nanoStatus===`checking`&&(r=`🔍 Checking...`,i=`background:#f8fafc; color:#334155; border:1px solid #cbd5e1;`);let o=`⚪ Not Detected`,s=`background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;`;e.webGpuEligible?(o=`🟢 Eligible (≥4 GB Guard Passed)`,s=`background:#faf5ff; color:#6b21a8; border:1px solid #c084fc;`):e.hasWebGpu&&(o=`🟡 Guarded (<4 GB / Mobile)`,s=`background:#fffbeb; color:#92400e; border:1px solid #fbbf24;`);let c=e.deviceMemoryGb===null?`Desktop RAM`:`${e.deviceMemoryGb} GB RAM`,l=e.hardwareConcurrency===null?`Multi-Core`:`${e.hardwareConcurrency} Cores`,u=e.ecoMode?`Tier 3 Active: Pre-compiled deterministic Socratic rules (0 MB download · 0 W GPU draw)`:e.nanoStatus===`available`?`Tier 1 Active: Chrome Built-in Gemini Nano (window.LanguageModel · 0 ms cloud egress)`:e.nanoStatus===`downloadable`?`Gemini Nano Supported: Click "Download & Activate Gemini Nano" below to fetch local weights`:e.nanoStatus===`downloading`?`Downloading Gemini Nano weights locally (${n}%)...`:e.webGpuEligible?`Tier 2 Fallback Ready: On-device WebGPU neural engine (Gemini Nano API absent)`:`Tier 3 Active: Curriculum Rules Engine (No compatible local neural API detected)`;return`
      <section id="ai-engine" style="background:#ffffff; border:1.5px solid #bae6fd; border-radius:14px; padding:1.5rem; box-shadow:0 2px 8px rgba(3,105,161,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:0.5rem;">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0; display:flex; align-items:center; gap:8px;">
            <span>🧠</span> On-Device AI, Gemini Nano &amp; Eco Mode
          </h2>
          <span style="font-size:0.76rem; font-weight:800; padding:4px 10px; border-radius:999px; ${e.ecoMode?`background:#ecfdf5; color:#065f46; border:1px solid #10b981;`:`background:#f0f9ff; color:#0369a1; border:1px solid #38bdf8;`}">
            ${e.ecoMode?`🌱 ${t.statusEco}`:`✨ ${t.statusOn}`}
          </span>
        </div>

        <p style="font-size:0.86rem; color:#475569; margin:0 0 1rem 0; line-height:1.55;">
          ${t.badgeSubtitle}
        </p>

        <!-- Operating Mode Selector -->
        <div style="margin-bottom:1.15rem;">
          <div style="font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">
            Operating Mode
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button type="button" id="settings-btn-eco-mode" aria-pressed="${e.ecoMode?`true`:`false`}" style="padding:8px 14px; border-radius:8px; border:1.5px solid ${e.ecoMode?`#047857`:`#cbd5e1`}; background:${e.ecoMode?`#047857`:`#f8fafc`}; color:${e.ecoMode?`#ffffff`:`#334155`}; font-weight:800; font-size:0.84rem; cursor:pointer;">
              🌱 Eco Mode (Deterministic Rules · Save Battery)
            </button>

            <button type="button" id="settings-btn-private-ai" aria-pressed="${e.ecoMode?`false`:`true`}" style="padding:8px 14px; border-radius:8px; border:1.5px solid ${e.ecoMode?`#cbd5e1`:`#0369a1`}; background:${e.ecoMode?`#f8fafc`:`#0369a1`}; color:${e.ecoMode?`#334155`:`#ffffff`}; font-weight:800; font-size:0.84rem; cursor:pointer;">
              ${e.nanoStatus===`downloadable`?`⬇️ Download & Activate Gemini Nano`:`✨ Private On-Device AI (Local Neural)`}
            </button>
          </div>
          <p style="font-size:0.78rem; color:#0f172a; font-weight:600; margin:8px 0 0 0;">
            ${u}
          </p>
        </div>

        ${e.nanoStatus===`downloading`?`<div style="margin-bottom:1.1rem; padding:10px 12px; border-radius:8px; background:#f0f9ff; border:1px solid #7dd3fc;">
                 <div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:800; color:#0369a1; margin-bottom:6px;">
                   <span>⏳ Downloading Chrome Gemini Nano Weights Locally...</span>
                   <span>${n}%</span>
                 </div>
                 <div style="width:100%; height:8px; background:#e0f2fe; border-radius:999px; overflow:hidden;">
                   <div style="width:${n}%; height:100%; background:#0284c7; transition:width 0.2s ease;"></div>
                 </div>
               </div>`:``}

        <!-- Live Hardware Capability Probe Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:0.85rem; margin-bottom:1rem;">
          <div style="padding:12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
            <div style="font-size:0.74rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:6px;">
              Tier 1 · Chrome Gemini Nano
            </div>
            <div style="display:inline-block; padding:3px 8px; border-radius:6px; font-size:0.78rem; font-weight:800; ${i}">
              ${r}
            </div>
            <div style="font-size:0.74rem; color:#475569; margin-top:6px;">
              API: <code>window.LanguageModel</code> (${e.rawAvailability})
            </div>
          </div>

          <div style="padding:12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
            <div style="font-size:0.74rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:6px;">
              Tier 2 · WebGPU Local Engine
            </div>
            <div style="display:inline-block; padding:3px 8px; border-radius:6px; font-size:0.78rem; font-weight:800; ${s}">
              ${o}
            </div>
            <div style="font-size:0.74rem; color:#475569; margin-top:6px;">
              API: <code>navigator.gpu</code> (${e.hasWebGpu?`present`:`absent`})
            </div>
          </div>

          <div style="padding:12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
            <div style="font-size:0.74rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:6px;">
              Device &amp; Privacy Guard
            </div>
            <div style="font-size:0.82rem; font-weight:800; color:#0f172a;">
              ${c} &bull; ${l}
            </div>
            <div style="font-size:0.74rem; color:#065f46; font-weight:700; margin-top:6px;">
              🔒 0 bps Cloud Egress Guaranteed
            </div>
          </div>
        </div>

        ${e.diagnosticNote?`<p style="font-size:0.78rem; color:#334155; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 10px; margin:0 0 1rem 0;">
                 <strong>Hardware Diagnostic:</strong> ${e.diagnosticNote}
               </p>`:``}

        <!-- Action Toolbar -->
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:0.85rem;">
          ${e.nanoStatus===`downloadable`?`<button type="button" id="settings-btn-download-nano" style="padding:7px 14px; border-radius:8px; background:#0369a1; color:#ffffff; border:1px solid #0284c7; font-size:0.8rem; font-weight:800; cursor:pointer;">
                   ⬇️ Download Gemini Nano Weights Now
                 </button>`:``}
          <button type="button" id="settings-btn-reprobe-nano" style="padding:7px 12px; border-radius:8px; background:#f8fafc; color:#0f172a; border:1px solid #cbd5e1; font-size:0.78rem; font-weight:700; cursor:pointer;">
            🔄 Re-Check Browser AI Hardware
          </button>
          <button type="button" id="settings-btn-release-vram" style="padding:7px 12px; border-radius:8px; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; font-size:0.78rem; font-weight:700; cursor:pointer;">
            🧹 Release Cached AI Session
          </button>
          ${x?`<span style="font-size:0.76rem; color:#065f46; font-weight:700;">${x}</span>`:``}
        </div>

        ${e.nanoStatus===`unavailable`?`<details style="margin-bottom:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; font-size:0.78rem; color:#334155;">
                 <summary style="cursor:pointer; font-weight:700; color:#0369a1;">
                   How to enable Chrome Built-in Gemini Nano on Desktop (Chrome 128+)
                 </summary>
                 <ol style="margin:8px 0 0 1.2rem; padding:0; line-height:1.6;">
                   <li>Open <code>chrome://flags/#optimization-guide-on-device-model</code> and set to <strong>Enabled BypassPerfRequirement</strong>.</li>
                   <li>Open <code>chrome://flags/#prompt-api-for-gemini-nano</code> and set to <strong>Enabled</strong>, then relaunch Chrome.</li>
                   <li>Return here and click <strong>Re-Check Browser AI Hardware</strong> (or inspect model status at <code>chrome://on-device-internals</code>). Note: If viewing inside an embedded preview iframe, open the site in a top-level tab so Permissions-Policy allows <code>LanguageModel</code>.</li>
                 </ol>
               </details>`:``}

        <div style="border-top:1px solid #e2e8f0; padding-top:0.75rem; font-size:0.74rem; color:#475569; line-height:1.5; display:flex; flex-direction:column; gap:3px;">
          <div>🛡️ <strong>UK GDPR Art. 25 &amp; KCSIE:</strong> Zero student prompts, telemetry, or audio leave this device.</div>
          <div>🛡️ ${t.californiaNotice}</div>
          <div>🛡️ ${t.indiaNotice}</div>
        </div>
      </section>
    `}function T(){let e=w();for(let t of v.sections){let n=``;for(let e of t.items){let[t,r,i,a,o,s,c]=e,l=S(a,o),u=``;if(t===`toggle`){let e=s.activeVal?l===s.activeVal:!!l,t=e?s.activeLabel:s.inactiveLabel;u=`
            <button type="button" id="${r}" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${e?`#0369a1`:`#cbd5e1`}; background:${e?`#f0f9ff`:`#f8fafc`}; color:${e?`#0369a1`:`#334155`}; font-weight:700; font-size:0.88rem; cursor:pointer;">
              ${t}
            </button>
          `}else if(t===`select`){let e=r===`setting-lang`,t=e?f(String(l)):s.map(([e,t])=>`<option value="${e}" ${l===e?`selected`:``}>${t}</option>`).join(``),n=e?`<div style="font-size:0.74rem; color:#065f46; font-weight:700; margin-top:5px;">✓ ${Object.keys(g).length} languages configured · Africa, South Asia, SE Asia, MENA, Americas &amp; Europe</div>`:``;u=`
            <select id="${r}" ${e?`class="notranslate" translate="no"`:``} aria-label="${i}" style="width:100%; max-width:360px; padding:8px 12px; border-radius:8px; border:1.5px solid #0369a1; background:#fff; color:#0f172a; font-size:0.9rem; font-weight:700; cursor:pointer;">
              ${t}
            </select>
            ${n}
          `}else t===`segmented`&&(u=`<div style="display:flex; gap:6px;">${s.map(([e,t])=>{let n=l===e;return`<button type="button" class="${r}-btn" data-val="${e}" style="padding:6px 14px; border-radius:6px; border:1px solid ${n?`#0369a1`:`#cbd5e1`}; background:${n?`#0369a1`:`#f8fafc`}; color:${n?`#fff`:`#334155`}; font-weight:700; cursor:pointer;">${t}</button>`}).join(` `)}</div>`);n+=`
          <div style="margin-bottom: 1rem;">
            <label ${t===`select`?`for="${r}"`:``} style="display:block; font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:6px;">${i}</label>
            ${u}
            ${c?`<p style="font-size:0.76rem; color:#475569; margin:6px 0 0 0;">${c}</p>`:``}
          </div>
        `}e+=`
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>${t.icon}</span> ${t.title}
          </h2>
          ${t.description?`<p style="font-size:0.85rem; color:#475569; margin:0 0 1.25rem 0; line-height:1.5;">${t.description}</p>`:``}
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
            ${n}
          </div>
        </div>
      `}e+=`
      <section aria-labelledby="sign-pack-heading" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <h2 id="sign-pack-heading" style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.4rem 0; display:flex; align-items:center; gap:8px;">
          <span>🤟</span> Offline Sign Pack Import &amp; Export
        </h2>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 1rem 0; line-height:1.5;">
          Import local community/regional signs from tiny <strong>.ast</strong> packs (~400 bytes/sign) or standard <strong>MediaPipe Holistic .json</strong> pose files. Incoming MediaPipe clips are compressed locally on-device into compact keyframes with zero cloud upload and zero extra mobile data.
        </p>
        <input type="file" id="settings-sign-file-input" accept=".ast,.json,application/json,text/plain" style="display:none;" />
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <button type="button" id="settings-btn-import-signs" style="padding:8px 14px; border-radius:8px; border:1.5px solid #0369a1; background:#f0f9ff; color:#0369a1; font-weight:700; font-size:0.84rem; cursor:pointer;">
            📥 Import Signs (.ast / MediaPipe .json)
          </button>
          <button type="button" id="settings-btn-export-ast-signs" style="padding:8px 14px; border-radius:8px; border:1.5px solid #0f766e; background:#f0fdfa; color:#0f766e; font-weight:700; font-size:0.84rem; cursor:pointer;">
            💾 Export Tiny .ast Pack
          </button>
          <button type="button" id="settings-btn-export-mp-signs" style="padding:8px 14px; border-radius:8px; border:1.5px solid #475569; background:#f8fafc; color:#334155; font-weight:700; font-size:0.84rem; cursor:pointer;">
            📐 Export MediaPipe JSON
          </button>
          <button type="button" id="settings-btn-clear-signs" style="padding:8px 12px; border-radius:8px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.82rem; cursor:pointer;">
            Clear Imported
          </button>
        </div>
        <p id="settings-sign-pack-status" role="status" aria-live="polite" style="font-size:0.78rem; color:#334155; margin:0.75rem 0 0 0; min-height:1.1em;"></p>
      </section>
    `,b.innerHTML=`
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${y}" style="font-size:0.84rem; color:#475569; text-decoration:underline; text-underline-offset:2px; font-weight:600;">&larr; Home</a>
          <span style="color:#64748b;">/</span>
          <span style="font-size:0.84rem; color:#0369a1; font-weight:700;">⚙️ System Settings</span>
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Preferences &amp; System Configuration</h1>
        <p style="font-size:0.95rem; color:#475569; margin:0;">
          All preferences and neural privacy controls are stored directly on your device via declarative AST bindings.
        </p>
      </div>
      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${e}
      </div>
    `,b.querySelector(`#settings-btn-eco-mode`)?.addEventListener(`click`,()=>{x=null,i()}),b.querySelector(`#settings-btn-private-ai`)?.addEventListener(`click`,()=>{x=null,a().hasPromptApi?d():(n(!0),t(!0))}),b.querySelector(`#settings-btn-download-nano`)?.addEventListener(`click`,()=>{x=null,d()}),b.querySelector(`#settings-btn-reprobe-nano`)?.addEventListener(`click`,()=>{x=null,t(!0)}),b.querySelector(`#settings-btn-release-vram`)?.addEventListener(`click`,async()=>{try{let[{aiCaller:e},{edgeCognitiveEngine:t}]=await Promise.all([o(()=>import(`./bsl-engine-BOjn8tiW.js`).then(e=>e.r),__vite__mapDeps([0])),o(()=>import(`./bsl-engine-BOjn8tiW.js`).then(e=>e.s),__vite__mapDeps([0]))]);e.destroy(),await t.unload(),x=`✓ Local session & VRAM cache released`}catch{x=`✓ Session cleared`}T()});let r=b.querySelector(`#settings-sign-file-input`),s=b.querySelector(`#settings-sign-pack-status`),c=(e,t=!1)=>{s&&(s.style.color=t?`#b91c1c`:`#065f46`,s.textContent=e)},l=(e,t,n)=>{let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),a.remove(),window.setTimeout(()=>URL.revokeObjectURL(i),1e3)};b.querySelector(`#settings-btn-import-signs`)?.addEventListener(`click`,()=>{r?.click()}),r?.addEventListener(`change`,async()=>{let e=r.files?.[0];if(r.value=``,e){if(e.size>5242880)c(`File too large (5 MB limit). Please split into smaller sign packs.`,!0);else try{c(`Compressing & importing signs locally...`);let t=await e.text(),n=await o(()=>import(`./customSignStore-DiTFnY84.js`),__vite__mapDeps([1,0])),r=t.trim();if(e.name.toLowerCase().endsWith(`.json`)||r.startsWith(`{`)||r.startsWith(`[`)){let{imported:e,words:r}=await n.importCustomSignsFromMediaPipeJson(t);if(e===0)c(`No valid MediaPipe Holistic sign frames found in file.`,!0);else{let t=r.slice(0,6).join(`, `)+(r.length>6?`…`:``);c(`✓ Imported & compressed ${e} sign(s) into local offline vault: ${t}`)}}else{let e=await n.importCustomSignsFromAst(t);e===0?c(`No valid BSL signs found in .ast file.`,!0):c(`✓ Imported ${e} sign(s) from compact .ast pack into local offline vault.`)}}catch(e){c(e?.message||`Could not import sign file.`,!0)}}}),b.querySelector(`#settings-btn-export-ast-signs`)?.addEventListener(`click`,async()=>{try{let e=await o(()=>import(`./customSignStore-DiTFnY84.js`),__vite__mapDeps([1,0])),t=await e.loadCustomBslSigns(),n=Object.keys(t).length;if(n===0){c(`No custom imported signs saved yet. Import a sign pack first to export it.`,!0);return}let r=await e.exportCustomSignsAst();l(r,`custom-bsl-signs.ast`,`text/plain;charset=utf-8`),c(`✓ Exported ${n} custom sign(s) as compact .ast (${(r.length/1024).toFixed(1)} KB).`)}catch{c(`Failed to export .ast sign pack.`,!0)}}),b.querySelector(`#settings-btn-export-mp-signs`)?.addEventListener(`click`,async()=>{try{c(`Generating standard 25 fps MediaPipe Holistic JSON...`);let[e,t,n]=await Promise.all([o(()=>import(`./customSignStore-DiTFnY84.js`),__vite__mapDeps([1,0])),o(()=>import(`./bsl-engine-BOjn8tiW.js`).then(e=>e.b),__vite__mapDeps([0])),o(()=>import(`./bslMediaPipeMapper-DIWAJTBi.js`),__vite__mapDeps([2,0]))]),r=Object.values(await e.loadCustomBslSigns()),i=(r.length>0?r:Object.values(t.BSL_CURRICULUM_LEXICON).slice(0,10)).map(e=>n.bslSignToMediaPipeSequence(e,{fps:25})),a=JSON.stringify({schema:`mediapipe-holistic-bundle/1.0`,fps:25,signCount:i.length,sequences:i},null,2),s=r.length>0?`custom`:`sample-10`;l(a,`bsl-mediapipe-${s}.json`,`application/json;charset=utf-8`),c(`✓ Exported ${i.length} ${r.length>0?`custom`:`sample core`} sign(s) in standard MediaPipe Holistic JSON.`)}catch{c(`Failed to export MediaPipe JSON.`,!0)}}),b.querySelector(`#settings-btn-clear-signs`)?.addEventListener(`click`,async()=>{try{let e=await(await o(()=>import(`./customSignStore-DiTFnY84.js`),__vite__mapDeps([1,0]))).clearAllCustomBslSigns();c(e>0?`✓ Cleared ${e} locally imported sign(s) from device storage.`:`No locally imported signs to clear.`)}catch{c(`Could not clear local sign storage.`,!0)}});for(let e of v.sections)for(let t of e.items){let[e,n,,r,i,a]=t;e===`toggle`?b.querySelector(`#${n}`)?.addEventListener(`click`,()=>{if(a.activeVal){let e=S(r,i);C(r,e===a.activeVal?a.inactiveVal:a.activeVal,a.attr)}else{let e=S(r,i);C(r,!e,a.attr)}T()}):e===`select`?b.querySelector(`#${n}`)?.addEventListener(`change`,e=>{C(r,e.target.value,a?.attr)}):e===`segmented`&&b.querySelectorAll(`.${n}-btn`).forEach(e=>{e.addEventListener(`click`,()=>{C(r,e.getAttribute(`data-val`),a?.attr),T()})})}}T();let E=r(()=>{b.isConnected?T():E()}),D=p(e=>{if(!b.isConnected){D();return}let t=b.querySelector(`#setting-lang`);t&&t.value!==e&&(t.value=e)});return t(!0),b}export{y as default,y as renderSettingsPage};