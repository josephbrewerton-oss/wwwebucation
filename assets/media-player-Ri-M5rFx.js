import{d as e,l as t,u as n}from"./index-ucfy84ly.js";import{t as r}from"./generatedScenes-YJ8cIO2Y.js";function i(){let i=`/wwwebucation/`.replace(/\/?$/,`/`),a=document.createElement(`div`);a.className=`ast-media-player-container`,a.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let o=new URLSearchParams(window.location.search),s=o.get(`preset`)||`kinetic-gas`,c=`All`,l=``,u=n()||o.get(`bsl`)===`1`,d=Array.isArray(r)&&r.length>0?r:[{id:`kinetic-gas`,label:`Kinetic Gas Theory & Thermodynamics`,type:`Sim`,stage:`KS3/KS4 PHYSICS`},{id:`pythagoras`,label:`Pythagoras' Theorem (a² + b² = c²)`,type:`Sim`,stage:`KS3/KS4 MATHEMATICS`},{id:`fractions`,label:`Fractions: Why Common Denominators Rule`,type:`Slide`,stage:`KEY STAGE 2`},{id:`electric-circuits`,label:`Electrical Circuits & Ohm’s Law`,type:`Sim`,stage:`KEY STAGE 3`},{id:`solar-system`,label:`Solar System: Heliocentric Planetary Motion`,type:`Sim`,stage:`KEY STAGE 2/3`},{id:`algebra-balance`,label:`Algebraic Balance Scale`,type:`Sim`,stage:`KEY STAGE 3`},{id:`church-tour`,label:`The Catholic Church Sanctuary & Altar`,type:`Slide`,stage:`WHOLE SCHOOL RE`},{id:`phonics-lab`,label:`EYFS Phonics Sound Mat & Digraphs`,type:`App`,stage:`EYFS / KS1`}];function f(e){return d.find(t=>t.id===e)||d[0]}let p=d.filter(e=>(e.type||`Sim`)===`Sim`),m=d.filter(e=>e.type===`Slide`),h=d.filter(e=>e.type===`App`),g=d.filter(e=>e.type===`Data`),_=`
    <optgroup label="🎮 Simulations (Sim)" style="background:#0f172a; color:#38bdf8;">
      ${p.map(e=>`<option value="${e.id}" ${e.id===s?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    <optgroup label="📑 Interactive Slides (Slide)" style="background:#0f172a; color:#34d399;">
      ${m.map(e=>`<option value="${e.id}" ${e.id===s?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    <optgroup label="💻 Vector Applications (App)" style="background:#0f172a; color:#fbbf24;">
      ${h.map(e=>`<option value="${e.id}" ${e.id===s?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    ${g.length>0?`
    <optgroup label="📊 Datasets & Checkpoints (Data)" style="background:#0f172a; color:#a78bfa;">
      ${g.map(e=>`<option value="${e.id}" ${e.id===s?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    `:``}
  `,v=f(s);a.innerHTML=`
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
                ${v.stage}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace;">
                ${v.type||`Sim`}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem;">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.15rem; font-weight:800; color:#f8fafc; margin:2px 0 0;">
              ${v.label}
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
              ${_}
            </select>
          </div>

          <!-- Reset Button -->
          <button type="button" id="player-btn-reset" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f8fafc; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Reset Simulation">
            ↺ Reset
          </button>

          <!-- BSL Signing Toggle Button -->
          <button type="button" id="player-btn-bsl" style="padding:6px 14px; border-radius:8px; background:${u?`rgba(56, 189, 248, 0.16)`:`#1e293b`}; color:${u?`#38bdf8`:`#94a3b8`}; border:${u?`1.5px solid #38bdf8`:`1px solid #475569`}; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" title="British Sign Language (BSL) In-Vision Interpreter (Shift + B)">
            <span>🖐️</span> BSL Signing: ${u?`ON`:`OFF`}
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
          src="${i}player.html?preset=${s}&bsl=${u?`1`:`0`}"
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
            <button type="button" class="cat-pill-btn" data-cat="${e}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${e===c?`#0284c7`:`#cbd5e1`}; background:${e===c?`#0284c7`:`#f8fafc`}; color:${e===c?`#ffffff`:`#475569`};">
              ${e===`All`?`🌟 All (`+d.length+`)`:e===`Sim`?`🎮 Sims`:e===`Slide`?`📑 Slides`:e===`App`?`💻 Apps`:`📊 Datasets`}
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
  `;let y=a.querySelector(`#ast-player-iframe`),b=a.querySelector(`#player-sim-selector`),x=a.querySelector(`#player-active-title`),S=a.querySelector(`#player-active-stage-badge`),C=a.querySelector(`#player-active-type-badge`),w=a.querySelector(`#player-btn-bsl`),T=a.querySelector(`#player-btn-reset`),E=a.querySelector(`#player-btn-fullscreen`),D=a.querySelector(`#cartridge-search-input`),O=a.querySelector(`#cartridges-grid`),k=a.querySelectorAll(`.cat-pill-btn`);function A(e){s=e;let n=f(e);x&&(x.textContent=n.label),S&&(S.textContent=n.stage),C&&(C.textContent=n.type||`Sim`),b&&(b.value=e),y&&(y.src=`${i}player.html?preset=${e}&bsl=${u?`1`:`0`}`),t({subtitle:`${n.label}. ${n.stage}`,isSpeaking:!0});let r=new URL(window.location.href);r.searchParams.set(`preset`,e),window.history.replaceState({},``,r.toString()),j()}function j(){if(!O)return;let e=l.toLowerCase().trim(),t=d.filter(t=>{let n=c===`All`||(t.type||`Sim`)===c,r=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e);return n&&r});t.length===0?O.innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#94a3b8;">No matching cartridges found.</div>`:(O.innerHTML=t.map(e=>{let t=e.id===s;return`
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
      `}).join(``),O.querySelectorAll(`.cartridge-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&(A(t),y?.scrollIntoView({behavior:`smooth`,block:`center`}))})}))}return b?.addEventListener(`change`,e=>{A(e.target.value)}),T?.addEventListener(`click`,()=>{y&&(y.src=`${i}player.html?preset=${s}&bsl=${u?`1`:`0`}`)}),w?.addEventListener(`click`,()=>{u=!u,e(),w.textContent=`🖐️ BSL Signing: ${u?`ON`:`OFF`}`,w.style.background=u?`rgba(56, 189, 248, 0.16)`:`#1e293b`,w.style.borderColor=u?`#38bdf8`:`#475569`,w.style.color=u?`#38bdf8`:`#94a3b8`,y&&(y.src=`${i}player.html?preset=${s}&bsl=${u?`1`:`0`}`)}),E?.addEventListener(`click`,()=>{let e=a.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()}),k.forEach(e=>{e.addEventListener(`click`,()=>{c=e.getAttribute(`data-cat`)||`All`,k.forEach(e=>{let t=e.getAttribute(`data-cat`)===c;e.style.background=t?`#0284c7`:`#f8fafc`,e.style.color=t?`#ffffff`:`#475569`,e.style.borderColor=t?`#0284c7`:`#cbd5e1`}),j()})}),D?.addEventListener(`input`,e=>{l=e.target.value,j()}),j(),a}export{i as default,i as renderPlayerPage};