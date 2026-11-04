import{s as e}from"./index-yLajHfBw.js";function t(){let t=`/wwwebucation/`.replace(/\/?$/,`/`),n=document.createElement(`div`);n.className=`home-landing-stage`,n.style.cssText=`padding: 3rem 1.5rem; max-width: 1140px; margin: 0 auto;`;let r=`welcome`,i=[{id:`welcome`,title:`Welcome to AST Vector Player`,mount:`/curriculum/general/welcome`},{id:`church-tour`,title:`Tour of a Catholic Church`,mount:`/curriculum/religious/church-tour`},{id:`altar-anatomy`,title:`The Catholic Altar`,mount:`/curriculum/science/altar-anatomy`},{id:`kinetic-gas`,title:`Kinetic Gas Theory`,mount:`/curriculum/science/kinetic-gas`},{id:`pythagoras`,title:`Pythagoras' Theorem`,mount:`/curriculum/mathematics/pythagoras`},{id:`fractions`,title:`Fractions`,mount:`/curriculum/mathematics/fractions`},{id:`electric-circuits`,title:`Electrical Circuits`,mount:`/curriculum/science/electric-circuits`},{id:`solar-system`,title:`Solar System`,mount:`/curriculum/science/solar-system`},{id:`algebra-balance`,title:`Algebraic Balance Scale`,mount:`/curriculum/mathematics/algebra-balance`},{id:`bbc-model-b`,title:`BBC Micro Model B`,mount:`/curriculum/computing/bbc-model-b`},{id:`bsl-fingerspelling`,title:`BSL Fingerspelling`,mount:`/curriculum/english/bsl-fingerspelling`}];n.innerHTML=`
    <header style="text-align: center; margin-bottom: 3.5rem;">
      <div style="margin-bottom: 1.25rem; display: flex; gap: 8px; justify-content: center; font-size: 0.85rem; color: #64748b;">
        <span style="color: #16a34a; font-weight: 600;">Education should be free</span> · 
        <span>UK National Curriculum</span> · 
        <span>Works Offline</span> · 
        <a href="${t}news" style="color: #0284c7; font-weight: 600; text-decoration: none;">AST Vector Player Release →</a>
      </div>
      <h1 style="font-size: 2.75rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem; letter-spacing: -0.025em;">
        Learn with Confidence at St Joseph's
      </h1>
      <p style="font-size: 1.15rem; color: #475569; max-width: 720px; margin: 0 auto 2.25rem; line-height: 1.6;">
        Interactive practice with instant feedback, step-by-step clues, and diagnostic mistake checks.
      </p>
      <div style="display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap;">
        <a href="${t}player" style="padding: 10px 22px; background: #0284c7; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none;">
          🎮 Launch Simulator Studio →
        </a>
        <a href="#featured-simulations" style="padding: 10px 20px; background: #0f172a; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none;">
          Live Stage Demo ↓
        </a>
      </div>
    </header>

    <!-- Stage Simulation Viewport -->
    <section id="featured-simulations" style="background: #090d16; border-radius: 16px; border: 1px solid #1e293b; padding: 1.25rem; margin-bottom: 3rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem;">🎮</span>
          <div>
            <span style="display: block; font-size: 0.74rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Curriculum Simulation Selector</span>
            <strong style="font-size: 0.98rem; color: #f8fafc;">Live Apparatus Stage</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="sim-selector" aria-label="Select Curriculum Simulation" style="padding: 8px 14px; border-radius: 8px; background: #1e293b; color: #fff; border: 1.5px solid #0284c7; font-weight: 700; font-size: 0.86rem; cursor: pointer;">
          </select>
          <a href="${t}player" style="padding: 7px 12px; font-size: 0.78rem; background: #334155; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 700;">↗ Fullscreen</a>
        </div>
      </div>

      <nav id="sim-pill-nav" aria-label="Quick simulation selector" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;"></nav>

      <div style="border-radius: 12px; overflow: hidden; min-height: 480px; background: #090d16;">
        <iframe 
          id="stage-viewport"
          src="${t}player.html?preset=welcome" 
          style="width: 100%; height: 480px; border: none; display: block;" 
          title="Featured Interactive Simulation">
        </iframe>
      </div>
    </section>
  `;let a=n.querySelector(`#stage-viewport`),o=n.querySelector(`#sim-selector`),s=n.querySelector(`#sim-pill-nav`);function c(e){r=e,a&&(a.src=`${t}player.html?preset=${e}`),o&&(o.value=e),s?.querySelectorAll(`.sim-pill`).forEach(t=>{let n=t.dataset.id===e;t.style.background=n?`#0284c7`:`#1e293b`,t.style.color=n?`#ffffff`:`#94a3b8`,t.style.borderColor=n?`#38bdf8`:`#334155`})}function l(){o&&s&&(o.innerHTML=i.map(e=>`
      <option value="${e.id}" ${e.id===r?`selected`:``}>${e.title}</option>
    `).join(``),s.innerHTML=i.slice(0,10).map(e=>`
      <button type="button" class="sim-pill" data-id="${e.id}" style="background: ${e.id===r?`#0284c7`:`#1e293b`}; color: ${e.id===r?`#ffffff`:`#94a3b8`}; border: 1px solid ${e.id===r?`#38bdf8`:`#334155`}; border-radius: 9999px; padding: 4px 12px; font-size: 0.74rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease;">
        ${e.title.split(`:`)[0]}
      </button>
    `).join(``),s.querySelectorAll(`.sim-pill`).forEach(e=>{e.onclick=()=>e.dataset.id&&c(e.dataset.id)}))}return o?.addEventListener(`change`,e=>{c(e.target.value)}),fetch(`${t}sitemap.ast`).then(e=>e.ok?e.text():Promise.reject()).then(t=>{let n=e(t);if(Array.isArray(n)){let e=n.find(e=>Array.isArray(e)&&e[0]===`:sitemap`)?.find(e=>Array.isArray(e)&&e[0]===`:cartridges`);e&&Array.isArray(e[1])&&(i=e[1].map(e=>({id:Array.isArray(e)&&e.find(e=>Array.isArray(e)&&e[0]===`:id`)?.[1]||``,title:Array.isArray(e)&&e.find(e=>Array.isArray(e)&&e[0]===`:title`)?.[1]||``,mount:Array.isArray(e)&&e.find(e=>Array.isArray(e)&&e[0]===`:mount`)?.[1]||``,tier:Array.isArray(e)&&e.find(e=>Array.isArray(e)&&e[0]===`:tier`)?.[1]||`core`})).filter(e=>e.id),l())}}).catch(()=>{}),l(),n}export{t as default,t as renderHomePage};