import{d as e,l as t,u as n}from"./index--2lsGKnF.js";import{t as r}from"./generatedScenes-YJ8cIO2Y.js";var i=`kinetic-gas`,a=new Set(r.map(e=>e.id));function o(e){return e&&a.has(e)?e:i}function s(e,t,n){return`${e}player.html?${new URLSearchParams({preset:t,bsl:n?`1`:`0`}).toString()}`}function c(){let i=`/wwwebucation/`.replace(/\/?$/,`/`),a=document.createElement(`div`);a.className=`ast-media-player-container`,a.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let c=new URLSearchParams(window.location.search),l=o(c.get(`preset`)),u=`All`,d=``,f=n()||c.get(`bsl`)===`1`,p=Array.isArray(r)&&r.length>0?r:[{id:`kinetic-gas`,label:`Kinetic Gas Theory & Thermodynamics`,type:`Sim`,stage:`KS3/KS4 PHYSICS`},{id:`pythagoras`,label:`Pythagoras' Theorem (a² + b² = c²)`,type:`Sim`,stage:`KS3/KS4 MATHEMATICS`},{id:`fractions`,label:`Fractions: Why Common Denominators Rule`,type:`Slide`,stage:`KEY STAGE 2`},{id:`electric-circuits`,label:`Electrical Circuits & Ohm’s Law`,type:`Sim`,stage:`KEY STAGE 3`},{id:`solar-system`,label:`Solar System: Heliocentric Planetary Motion`,type:`Sim`,stage:`KEY STAGE 2/3`},{id:`algebra-balance`,label:`Algebraic Balance Scale`,type:`Sim`,stage:`KEY STAGE 3`},{id:`church-tour`,label:`The Catholic Church Sanctuary & Altar`,type:`Slide`,stage:`WHOLE SCHOOL RE`},{id:`phonics-lab`,label:`EYFS Phonics Sound Mat & Digraphs`,type:`App`,stage:`EYFS / KS1`}];function m(e){return p.find(t=>t.id===e)||p[0]}let h=p.filter(e=>(e.type||`Sim`)===`Sim`),g=p.filter(e=>e.type===`Slide`),_=p.filter(e=>e.type===`App`),v=p.filter(e=>e.type===`Data`),y=`
    <optgroup label="🎮 Simulations (Sim)" style="background:#0f172a; color:#38bdf8;">
      ${h.map(e=>`<option value="${e.id}" ${e.id===l?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    <optgroup label="📑 Interactive Slides (Slide)" style="background:#0f172a; color:#34d399;">
      ${g.map(e=>`<option value="${e.id}" ${e.id===l?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    <optgroup label="💻 Vector Applications (App)" style="background:#0f172a; color:#fbbf24;">
      ${_.map(e=>`<option value="${e.id}" ${e.id===l?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    ${v.length>0?`
    <optgroup label="📊 Datasets & Checkpoints (Data)" style="background:#0f172a; color:#a78bfa;">
      ${v.map(e=>`<option value="${e.id}" ${e.id===l?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    `:``}
  `,b=m(l);a.innerHTML=`
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${i}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎬 AST Vector Player &amp; Simulator</span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${i}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${i}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⚡ Practice Lab
        </a>
      </div>
    </div>

    <!-- Main Interactive Stage Frame -->
    <div style="background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35); margin-bottom:2rem;">
      <!-- Stage Toolbar -->
      <div style="padding:12px 18px; background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.4rem;">🎮</span>
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span id="player-active-stage-badge" style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:9999px; background:#0369a1; color:#ffffff; letter-spacing:0.04em;">
                ${b.stage}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace;">
                ${b.type||`Sim`}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem;">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.15rem; font-weight:800; color:#f8fafc; margin:2px 0 0;">
              ${b.label}
            </h2>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <!-- Dropdown Selector -->
          <div style="display:inline-flex; align-items:center; gap:6px;">
            <label for="player-sim-selector" style="font-size:0.76rem; font-weight:800; color:#94a3b8; white-space:nowrap;">
              🎮 Cartridge:
            </label>
            <select id="player-sim-selector" style="padding:6px 12px; border-radius:8px; background:#0f172a; color:#ffffff; border:1.5px solid #0284c7; font-size:0.82rem; font-weight:700; cursor:pointer; outline:none; max-width:280px;">
              ${y}
            </select>
          </div>

          <!-- Reset Button -->
          <button type="button" id="player-btn-reset" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f8fafc; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Reset Simulation">
            ↺ Reset
          </button>

          <!-- BSL Signing Toggle Button -->
          <button type="button" id="player-btn-bsl" style="padding:6px 14px; border-radius:8px; background:${f?`rgba(56, 189, 248, 0.16)`:`#1e293b`}; color:${f?`#38bdf8`:`#94a3b8`}; border:${f?`1.5px solid #38bdf8`:`1px solid #475569`}; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" title="British Sign Language (BSL) In-Vision Interpreter (Shift + B)">
            <span>🖐️</span> BSL Signing: ${f?`ON`:`OFF`}
          </button>

          <!-- Fullscreen Button -->
          <button type="button" id="player-btn-fullscreen" style="padding:6px 12px; border-radius:8px; background:#0284c7; color:#ffffff; border:none; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- Live Stage iFrame -->
      <div id="player-iframe-wrapper" style="position:relative; width:100%; height:540px; background:#000000;">
        <iframe
          id="ast-player-iframe"
          src="${i}player.html?preset=${l}&bsl=${f?`1`:`0`}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Category Filter Tabs & Search -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="category-filter-buttons">
          ${[`All`,`Sim`,`Slide`,`App`,`Data`].map(e=>`
            <button type="button" class="cat-pill-btn" data-cat="${e}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${e===u?`#0284c7`:`#cbd5e1`}; background:${e===u?`#0284c7`:`#f8fafc`}; color:${e===u?`#ffffff`:`#475569`};">
              ${e===`All`?`🌟 All (`+p.length+`)`:e===`Sim`?`🎮 Sims`:e===`Slide`?`📑 Slides`:e===`App`?`💻 Apps`:`📊 Datasets`}
            </button>
          `).join(``)}
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search cartridges (e.g. Pythagoras, circuits)..."
            style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.84rem; min-width:260px; outline:none;"
          />
        </div>
      </div>

      <!-- Presets Grid Container -->
      <div id="cartridges-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:480px; overflow-y:auto; padding-right:4px;">
      </div>
    </div>

    <!-- Offline Architecture Invariant Badge -->
    <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:1.25rem 1.5rem; color:#cbd5e1; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.5rem;">⚡</span>
        <div>
          <strong style="color:#38bdf8; display:block;">Zero-Bloat Vector Architecture</strong>
          <span>Sub-15ms cold start, &lt;35 KB gzipped engine, and 100% offline operational execution.</span>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <a href="${i}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Architecture Notes &rarr;</a>
      </div>
    </div>
  `;let x=a.querySelector(`#ast-player-iframe`),S=a.querySelector(`#player-sim-selector`),C=a.querySelector(`#player-active-title`),w=a.querySelector(`#player-active-stage-badge`),T=a.querySelector(`#player-active-type-badge`),E=a.querySelector(`#player-btn-bsl`),D=a.querySelector(`#player-btn-reset`),O=a.querySelector(`#player-btn-fullscreen`),k=a.querySelector(`#cartridge-search-input`),A=a.querySelector(`#cartridges-grid`),j=a.querySelectorAll(`.cat-pill-btn`);function M(e){let n=o(e);l=n;let r=m(n);C&&(C.textContent=r.label),w&&(w.textContent=r.stage),T&&(T.textContent=r.type||`Sim`),S&&(S.value=n),x&&(x.src=s(i,n,f)),t({subtitle:`${r.label}. ${r.stage}`,isSpeaking:!0});let a=new URL(window.location.href);a.searchParams.set(`preset`,n),window.history.replaceState({},``,a.toString()),N()}function N(){if(!A)return;let e=d.toLowerCase().trim(),t=p.filter(t=>{let n=u===`All`||(t.type||`Sim`)===u,r=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e);return n&&r});t.length===0?A.innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#94a3b8;">No matching cartridges found.</div>`:(A.innerHTML=t.map(e=>{let t=e.id===l;return`
        <div 
          class="cartridge-card" 
          data-id="${e.id}"
          style="padding:12px; border-radius:10px; border:1.5px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#f0f9ff`:`#f8fafc`}; cursor:pointer; transition:all 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.68rem; font-weight:800; padding:1px 6px; border-radius:4px; background:${e.type===`Slide`?`#dcfce7`:e.type===`App`?`#fef3c7`:`#e0f2fe`}; color:${e.type===`Slide`?`#166534`:e.type===`App`?`#92400e`:`#0369a1`};">
              ${e.type||`Sim`}
            </span>
            <span style="font-size:0.68rem; color:#64748b; font-weight:600;">${e.stage}</span>
          </div>
          <strong style="display:block; font-size:0.86rem; color:#0f172a; margin-bottom:6px; line-height:1.3;">${e.label}</strong>
          <span style="font-size:0.75rem; color:#0284c7; font-weight:700;">${t?`▶ Currently Playing`:`Launch &rarr;`}</span>
        </div>
      `}).join(``),A.querySelectorAll(`.cartridge-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&(M(t),x?.scrollIntoView({behavior:`smooth`,block:`center`}))})}))}return S?.addEventListener(`change`,e=>{M(e.target.value)}),D?.addEventListener(`click`,()=>{x&&(x.src=s(i,l,f))}),E?.addEventListener(`click`,()=>{f=!f,e(),E.textContent=`🖐️ BSL Signing: ${f?`ON`:`OFF`}`,E.style.background=f?`rgba(56, 189, 248, 0.16)`:`#1e293b`,E.style.borderColor=f?`#38bdf8`:`#475569`,E.style.color=f?`#38bdf8`:`#94a3b8`,x&&(x.src=s(i,l,f))}),O?.addEventListener(`click`,()=>{let e=a.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()}),j.forEach(e=>{e.addEventListener(`click`,()=>{u=e.getAttribute(`data-cat`)||`All`,j.forEach(e=>{let t=e.getAttribute(`data-cat`)===u;e.style.background=t?`#0284c7`:`#f8fafc`,e.style.color=t?`#ffffff`:`#475569`,e.style.borderColor=t?`#0284c7`:`#cbd5e1`}),N()})}),k?.addEventListener(`input`,e=>{d=e.target.value,N()}),N(),a}export{c as default,c as renderPlayerPage};