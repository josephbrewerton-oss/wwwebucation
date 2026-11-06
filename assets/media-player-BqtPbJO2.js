import{c as e,d as t,f as n,l as r,n as i,s as a,u as o}from"./index-D7O_Atud.js";import{t as s}from"./generatedScenes-BAIKsbPa.js";var c=`kinetic-gas`,l=new Set(s.map(e=>e.id));function u(e){return e&&l.has(e)?e:c}function d(e,t,n){return`${e}player.html?${new URLSearchParams({preset:t,bsl:n?`1`:`0`}).toString()}`}function f(){let c=i(),l=document.createElement(`div`);l.className=`ast-media-player-container`,l.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let f=new URLSearchParams(window.location.search),p=u(f.get(`preset`)),m=`All`,h=``,g=e()||f.get(`bsl`)===`1`,_=Array.isArray(s)&&s.length>0?s:[{id:`kinetic-gas`,label:`Kinetic Gas Theory & Thermodynamics`,type:`Sim`,stage:`KS3/KS4 PHYSICS`},{id:`pythagoras`,label:`Pythagoras' Theorem (a² + b² = c²)`,type:`Sim`,stage:`KS3/KS4 MATHEMATICS`},{id:`fractions`,label:`Fractions: Why Common Denominators Rule`,type:`Slide`,stage:`KEY STAGE 2`},{id:`electric-circuits`,label:`Electrical Circuits & Ohm’s Law`,type:`Sim`,stage:`KEY STAGE 3`},{id:`solar-system`,label:`Solar System: Heliocentric Planetary Motion`,type:`Sim`,stage:`KEY STAGE 2/3`},{id:`algebra-balance`,label:`Algebraic Balance Scale`,type:`Sim`,stage:`KEY STAGE 3`},{id:`church-tour`,label:`The Catholic Church Sanctuary & Altar`,type:`Slide`,stage:`WHOLE SCHOOL RE`},{id:`phonics-lab`,label:`EYFS Phonics Sound Mat & Digraphs`,type:`App`,stage:`EYFS / KS1`}];function v(e){return e.stage===`CATHOLIC LIFE`||e.subject===`Religious Education`||e.section&&e.section.includes(`Catholic`)||[`church-tour`,`altar-anatomy`,`holy-oils`,`holy-water-thurifer`,`latin-mass-prayers`,`catholic-rites`,`order-of-the-mass`,`stations-of-the-cross`,`first-communion`,`liturgical-calendar`,`liturgical-postures`,`liturgy-of-the-hours`,`triduum-easter`].includes(e.id)}function y(e){return!v(e)&&(e.subject===`Science`||e.stage&&e.stage.includes(`PHYSICS`)||[`kinetic-gas`,`electric-circuits`,`solar-system`,`photosynthesis`,`atom`,`velocity`,`dna-helix`].includes(e.id))}function b(e){return!v(e)&&(e.subject===`Mathematics`||[`pythagoras`,`fractions`,`algebra-balance`,`calculus-curves`,`bodmas`,`times-tables`].includes(e.id))}function x(e){return!v(e)&&!y(e)&&!b(e)}function S(e){return _.find(t=>t.id===e)||_[0]}let C=_.filter(v),w=_.filter(y),T=_.filter(b),E=_.filter(x),D=`
    <optgroup label="✝️ Catholic Sanctuary &amp; Liturgy" style="background:#0f172a; color:#fde047;">
      ${C.map(e=>`<option value="${e.id}" ${e.id===p?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    <optgroup label="🔬 STEM &amp; Natural Sciences" style="background:#0f172a; color:#38bdf8;">
      ${w.map(e=>`<option value="${e.id}" ${e.id===p?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    <optgroup label="📐 Mathematics &amp; Logic" style="background:#0f172a; color:#34d399;">
      ${T.map(e=>`<option value="${e.id}" ${e.id===p?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
    <optgroup label="🔤 EYFS, Languages &amp; Computing" style="background:#0f172a; color:#fbbf24;">
      ${E.map(e=>`<option value="${e.id}" ${e.id===p?`selected`:``}>${e.label} (${e.stage})</option>`).join(``)}
    </optgroup>
  `,O=S(p);l.innerHTML=`
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${c}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎬 AST Vector Player &amp; Simulator</span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${c}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${c}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
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
                ${O.stage}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace;">
                ${O.type||`Sim`}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem;">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.15rem; font-weight:800; color:#f8fafc; margin:2px 0 0;">
              ${O.label}
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
              ${D}
            </select>
          </div>

          <!-- Reset Button -->
          <button type="button" id="player-btn-reset" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f8fafc; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Reset Simulation">
            ↺ Reset
          </button>

          <!-- BSL Signing Toggle Button -->
          <button type="button" id="player-btn-bsl" style="padding:6px 14px; border-radius:8px; background:${g?`rgba(56, 189, 248, 0.16)`:`#1e293b`}; color:${g?`#38bdf8`:`#94a3b8`}; border:${g?`1.5px solid #38bdf8`:`1px solid #475569`}; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" title="British Sign Language (BSL) In-Vision Interpreter (Shift + B)">
            <span>🖐️</span> BSL Signing: ${g?`ON`:`OFF`}
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
          src="${c}player.html?preset=${p}&bsl=${g?`1`:`0`}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Catholic Sanctuary Linkage Banner -->
    <div id="catholic-sanctuary-banner" style="display:${v(O)?`flex`:`none`}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">✝️</span>
        <div>
          <span style="font-size:0.86rem; color:#fde047; font-weight:800;">St Joseph's Catholic Sanctuary:</span>
          <span style="font-size:0.82rem; color:#cbd5e1; margin-left:4px;">This simulation is part of our Catholic faith formation and sacred liturgical curriculum.</span>
        </div>
      </div>
      <a href="${c}catholic-life?tab=altar-anatomy" style="padding:5px 12px; border-radius:6px; background:#ca8a04; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem;">
        Open High Altar &amp; Latin Chapel &rarr;
      </a>
    </div>

    <!-- Category Filter Tabs & Search -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="category-filter-buttons">
          ${[{id:`All`,label:`🌟 All (`+_.length+`)`},{id:`Catholic`,label:`✝️ Catholic Faith (`+C.length+`)`},{id:`STEM`,label:`🔬 STEM Sciences (`+w.length+`)`},{id:`Maths`,label:`📐 Mathematics (`+T.length+`)`},{id:`EYFS`,label:`🔤 EYFS & Languages (`+E.length+`)`}].map(e=>`
            <button type="button" class="cat-pill-btn" data-cat="${e.id}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${e.id===m?`#0284c7`:`#cbd5e1`}; background:${e.id===m?`#0284c7`:`#f8fafc`}; color:${e.id===m?`#ffffff`:`#475569`};">
              ${e.label}
            </button>
          `).join(``)}
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search cartridges (e.g. Altar, Pythagoras, circuits)..."
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
        <a href="${c}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Architecture Notes &rarr;</a>
      </div>
    </div>
  `;let k=l.querySelector(`#ast-player-iframe`),A=l.querySelector(`#player-sim-selector`),j=l.querySelector(`#player-active-title`),M=l.querySelector(`#player-active-stage-badge`),N=l.querySelector(`#player-active-type-badge`),P=l.querySelector(`#player-btn-bsl`),F=l.querySelector(`#player-btn-reset`),I=l.querySelector(`#player-btn-fullscreen`),L=l.querySelector(`#cartridge-search-input`),R=l.querySelector(`#cartridges-grid`),z=l.querySelectorAll(`.cat-pill-btn`);function B(e){let t=u(e);p=t;let n=S(t);j&&(j.textContent=n.label),M&&(M.textContent=n.stage),N&&(N.textContent=n.type||`Sim`),A&&(A.value=t);let r=l.querySelector(`#catholic-sanctuary-banner`);r&&(r.style.display=v(n)?`flex`:`none`),k&&(k.src=d(c,t,g)),a({subtitle:`${n.label}. ${n.stage}`,isSpeaking:!0});let i=new URL(window.location.href);i.searchParams.set(`preset`,t),window.history.replaceState({},``,i.toString()),V()}function V(){if(!R)return;let e=h.toLowerCase().trim(),t=_.filter(t=>{let n=!0;m===`Catholic`?n=v(t):m===`STEM`?n=y(t):m===`Maths`?n=b(t):m===`EYFS`?n=x(t):m!==`All`&&(n=(t.type||`Sim`)===m);let r=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e);return n&&r});t.length===0?R.innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#94a3b8;">No matching cartridges found.</div>`:(R.innerHTML=t.map(e=>{let t=e.id===p;return`
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
      `}).join(``),R.querySelectorAll(`.cartridge-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&(B(t),k?.scrollIntoView({behavior:`smooth`,block:`center`}))})}))}A?.addEventListener(`change`,e=>{B(e.target.value)}),F?.addEventListener(`click`,()=>{k&&(k.src=d(c,p,g))});function H(e){g=e,P&&(P.textContent=`🖐️ BSL Signing: ${e?`ON`:`OFF`}`,P.style.background=e?`rgba(56, 189, 248, 0.16)`:`#1e293b`,P.style.borderColor=e?`#38bdf8`:`#475569`,P.style.color=e?`#38bdf8`:`#94a3b8`)}return o(e=>{g!==e&&(H(e),k&&(k.src=d(c,p,e)))}),P?.addEventListener(`click`,()=>{n()}),t(e=>{try{k?.contentWindow?.postMessage({type:`SET_VOICE`,enabled:e},`*`)}catch{}}),window.addEventListener(`message`,e=>{e.data&&typeof e.data==`object`&&(e.data.type===`VOICE_TOGGLE`||e.data.type===`SET_VOICE`)&&typeof e.data.enabled==`boolean`&&r(e.data.enabled)}),I?.addEventListener(`click`,()=>{let e=l.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()}),z.forEach(e=>{e.addEventListener(`click`,()=>{m=e.getAttribute(`data-cat`)||`All`,z.forEach(e=>{let t=e.getAttribute(`data-cat`)===m;e.style.background=t?`#0284c7`:`#f8fafc`,e.style.color=t?`#ffffff`:`#475569`,e.style.borderColor=t?`#0284c7`:`#cbd5e1`}),V()})}),L?.addEventListener(`input`,e=>{h=e.target.value,V()}),V(),l}export{f as default,f as renderPlayerPage};