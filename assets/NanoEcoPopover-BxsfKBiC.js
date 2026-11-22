import{d as e,l as t}from"./index-CSAOpb7h.js";import{t as n}from"./complianceCaveats-BsWRUQKo.js";import{a as r,c as i,n as a,r as o,u as s}from"./nanoAvailability-C1Ud91zD.js";function c(c,l,u,d){let f=e=>{let r=n(t()),s=e.downloadProgress??0;if(e.nanoStatus===`downloading`?(c.textContent=`⏳ Nano ${s}%`,c.style.background=`#0369a1`,c.style.borderColor=`#7dd3fc`):e.ecoMode?e.nanoStatus===`available`?(c.textContent=`🌱 Eco · Nano Ready`,c.style.background=`#065f46`,c.style.borderColor=`#34d399`):e.nanoStatus===`downloadable`?(c.textContent=`🌱 Eco · Nano Downloadable`,c.style.background=`#1e293b`,c.style.borderColor=`#38bdf8`):(c.textContent=`🌱 ${r.statusEco}`,c.style.background=`#1e293b`,c.style.borderColor=`#34d399`):e.nanoStatus===`available`?(c.textContent=`✨ ${r.statusOn}`,c.style.background=`#047857`,c.style.borderColor=`#6ee7b7`):e.nanoStatus===`downloadable`?(c.textContent=`⬇️ Download Nano`,c.style.background=`#0369a1`,c.style.borderColor=`#38bdf8`):e.webGpuEligible?(c.textContent=`🟣 Local AI: WebGPU`,c.style.background=`#581c87`,c.style.borderColor=`#c084fc`):(c.textContent=`🌱 Eco Rules (No Nano)`,c.style.background=`#1e293b`,c.style.borderColor=`#94a3b8`),c.style.color=`#ffffff`,l.style.display===`flex`){let t=`⚪ ${r.deviceUnsupportedText}`,n=`background:#1e293b; color:#e2e8f0; border:1px solid #475569;`;e.nanoStatus===`available`?(t=`🟢 ${r.deviceReadyText}`,n=`background:#064e3b; color:#a7f3d0; border:1px solid #10b981;`):e.nanoStatus===`downloadable`?(t=`⬇️ ${r.deviceDownloadText}`,n=`background:#0c4a6e; color:#bae6fd; border:1px solid #38bdf8;`):e.nanoStatus===`downloading`?(t=`⏳ Downloading Gemini Nano (${s}%)...`,n=`background:#0c4a6e; color:#bae6fd; border:1px solid #7dd3fc;`):e.nanoStatus===`checking`?(t=`🔍 Checking Chrome Built-in AI hardware...`,n=`background:#1e293b; color:#bae6fd; border:1px solid #38bdf8;`):e.webGpuEligible&&(t=`🟣 Nano API absent · WebGPU Local Fallback Ready`,n=`background:#3b0764; color:#e9d5ff; border:1px solid #a855f7;`);let d=e.nanoStatus===`downloadable`,f=e.nanoStatus===`available`||e.nanoStatus===`downloadable`||e.webGpuEligible;l.innerHTML=`
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <strong style="font-size:0.86rem; color:#f8fafc;">${r.badgeTitle}</strong>
          <span style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:999px; ${e.ecoMode?`background:#064e3b; color:#6ee7b7; border:1px solid #10b981;`:`background:#0c4a6e; color:#7dd3fc; border:1px solid #38bdf8;`}">
            ${e.ecoMode?`🌱 Eco Mode`:`✨ AI Active`}
          </span>
        </div>
        <div style="padding:6px 8px; border-radius:6px; font-size:0.74rem; font-weight:700; ${n}">
          ${t}
        </div>
        ${e.nanoStatus===`downloading`?`<div style="width:100%; height:7px; background:#1e293b; border-radius:999px; overflow:hidden; border:1px solid #334155;">
                 <div style="width:${s}%; height:100%; background:#38bdf8;"></div>
               </div>`:``}
        <p style="margin:0; font-size:0.74rem; color:#cbd5e1; line-height:1.45;">
          ${e.ecoMode?r.ecoSummary:r.activeSummary}
        </p>
        ${e.diagnosticNote?`<p style="margin:0; font-size:0.69rem; color:#cbd5e1; line-height:1.35;">${e.diagnosticNote}</p>`:``}
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:2px;">
          ${d?`<button type="button" id="popover-btn-download-nano" style="flex:1 1 100%; padding:7px 10px; border-radius:6px; background:#0369a1; color:#ffffff; border:1px solid #38bdf8; font-size:0.76rem; font-weight:800; cursor:pointer;">
                   ⬇️ Download &amp; Activate Gemini Nano
                 </button>`:f&&e.ecoMode?`<button type="button" id="popover-btn-activate-nano" style="flex:1; padding:7px 10px; border-radius:6px; background:#047857; color:#ffffff; border:1px solid #34d399; font-size:0.75rem; font-weight:800; cursor:pointer;">
                   ${r.activateBtn}
                 </button>`:``}
          ${e.ecoMode?``:`<button type="button" id="popover-btn-eco-mode" style="flex:1; padding:7px 10px; border-radius:6px; background:#1e293b; color:#6ee7b7; border:1px solid #10b981; font-size:0.75rem; font-weight:800; cursor:pointer;">
                   🌱 Switch to Eco Mode
                 </button>`}
          <button type="button" id="popover-btn-reprobe-nano" style="padding:6px 9px; border-radius:6px; background:#1e293b; color:#e2e8f0; border:1px solid #475569; font-size:0.72rem; font-weight:700; cursor:pointer;">
            🔄 Re-check
          </button>
          <a href="${u}settings#ai-engine" id="popover-link-ai-settings" style="padding:6px 9px; border-radius:6px; background:#1e293b; color:#7dd3fc; border:1px solid #334155; font-size:0.72rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center;">
            ⚙️ Settings
          </a>
        </div>
      `,l.querySelector(`#popover-btn-download-nano`)?.addEventListener(`click`,e=>{e.stopPropagation(),a()}),l.querySelector(`#popover-btn-activate-nano`)?.addEventListener(`click`,e=>{e.stopPropagation(),a()}),l.querySelector(`#popover-btn-eco-mode`)?.addEventListener(`click`,e=>{e.stopPropagation(),o()}),l.querySelector(`#popover-btn-reprobe-nano`)?.addEventListener(`click`,e=>{e.stopPropagation(),i(!0)}),l.querySelector(`#popover-link-ai-settings`)?.addEventListener(`click`,()=>{l.style.display=`none`,c.setAttribute(`aria-expanded`,`false`)})}},p=e=>e.stopPropagation();l.addEventListener(`click`,p);let m=s(e=>f(e)),h=e(()=>f(r()));return f(r()),i(!1),{openOrToggle:()=>{let e=l.style.display!==`flex`;d(),e&&(l.style.display=`flex`,c.setAttribute(`aria-expanded`,`true`),f(r()),i(!0))},close:()=>{l.style.display=`none`,c.setAttribute(`aria-expanded`,`false`)},destroy:()=>{m(),h(),l.removeEventListener(`click`,p)}}}export{c as mountNanoEcoPopoverController};