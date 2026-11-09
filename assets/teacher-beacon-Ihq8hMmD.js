import{S as e,f as t,i as n}from"./index-CaP14vr7.js";function r(){let r=t(),i=document.createElement(`div`);i.className=`teacher-beacon-stage`,i.style.cssText=`max-width: 1000px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`,i.innerHTML=`
    <!-- Header -->
    <div style="margin-bottom: 2rem;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <a href="${r}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">📡 Teacher Beacon Console</span>
      </div>
      <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Classroom Synchronizer &amp; Beacon</h1>
      <p style="font-size:0.95rem; color:#64748b; margin:0;">
        Broadcast simulation scenes, quiz checkpoints, and lesson directions to all student devices in real-time with 0 cloud lag.
      </p>
    </div>

    <!-- Broadcast Command Center -->
    <div style="background:#ffffff; border:1.5px solid #0284c7; border-radius:14px; padding:1.75rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(2,132,199,0.06);">
      <h2 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">📡 One-Click Classroom Scene Broadcast</h2>
      <p style="font-size:0.88rem; color:#64748b; margin:0 0 1.25rem 0;">
        Selecting a cartridge below sends an instant peer broadcast to all pupil Chromebooks and tablets on the local network.
      </p>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:1.5rem;">
        <select id="beacon-cartridge-select" style="padding:8px 14px; border-radius:8px; border:1.5px solid #0284c7; font-size:0.9rem; font-weight:700; flex:1; max-width:400px;">
          ${n.map(e=>`
            <option value="${e.id}">${e.label} (${e.stage})</option>
          `).join(``)}
        </select>
        <button type="button" id="btn-broadcast-scene" style="padding:8px 18px; border-radius:8px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.9rem; cursor:pointer;">
          📢 Broadcast to Class
        </button>
      </div>

      <div id="beacon-toast" style="display:none; padding:10px 14px; border-radius:8px; background:#dcfce7; color:#166534; font-size:0.88rem; font-weight:700;">
        Command broadcast sent successfully!
      </div>
    </div>
  `;let a=i.querySelector(`#btn-broadcast-scene`),o=i.querySelector(`#beacon-cartridge-select`),s=i.querySelector(`#beacon-toast`);return a?.addEventListener(`click`,()=>{let t=o?.value;t&&(e.broadcastAstScene(t),s&&(s.style.display=`block`,s.textContent=`📢 Successfully broadcast scene [${t}] to the classroom!`,setTimeout(()=>{s.style.display=`none`},4e3)))}),i}export{r as default,r as renderTeacherBeaconPage};