var e=[{id:`unit-mat-fractions`,stage:`Key Stage 2`,subject:`Mathematics`,unit:`Unit Fractions & Parts of a Whole`,axiom:`A fraction represents equal parts of a whole object or quantity. The denominator tells us the total equal slices, and the numerator tells us how many slices we have.`,trap:`Never add the denominators together! 1/4 + 2/4 is NOT 3/8. Denominators stay the same when adding like fractions.`,step:`1. Check the denominators match. 2. Add the numerators (1 + 2 = 3). 3. Keep the denominator: 3/4. 4. Simplify if possible.`,preset:`fractions`},{id:`unit-sci-gas`,stage:`Key Stage 3`,subject:`Science`,unit:`States of Matter & Kinetic Gas Theory`,axiom:`Gas pressure is caused by gas particles colliding with the walls of their container. Heating particles increases their speed and collision frequency.`,trap:`Remember that gas particles themselves do not expand when heated — rather, they move faster and push further apart.`,step:`1. Heat adds kinetic energy. 2. Faster particles hit the container walls harder and more frequently. 3. Pressure rises proportionally.`,preset:`kinetic-gas`},{id:`unit-mat-pyth`,stage:`Key Stage 3`,subject:`Mathematics`,unit:`Pythagoras' Theorem (a² + b² = c²)`,axiom:`In any right-angled triangle, the area of the square on the hypotenuse (longest side) is equal to the sum of the areas of the squares on the other two sides.`,trap:`Do not forget the square root at the end! a² + b² gives c², so you must take the square root to find length c.`,step:`1. Square side a (e.g. 3² = 9). 2. Square side b (4² = 16). 3. Add them together (9 + 16 = 25). 4. Take the square root: √25 = 5.`,preset:`pythagoras`},{id:`unit-sci-circuits`,stage:`Key Stage 3`,subject:`Science`,unit:`Electric Circuits & Ohm's Law (V = I × R)`,axiom:`Electric current is the flow of electric charge. Voltage is the electrical push, and resistance is the opposition to current flow.`,trap:`Do not connect an ammeter in parallel; ammeters must be in series! Voltmeters must be connected in parallel.`,step:`1. Identify known quantities (e.g. V = 12V, R = 4Ω). 2. Rearrange Ohm's formula: I = V / R. 3. Calculate current: 12 / 4 = 3 Amperes.`,preset:`electric-circuits`},{id:`unit-re-mass`,stage:`Key Stage 2`,subject:`Catholic RE`,unit:`The Order of the Mass & The Eucharist`,axiom:`The Holy Mass is the memorial sacrifice of Christ. We gather to listen to God’s Word (Table of the Word) and receive Christ in the Blessed Sacrament (Table of the Eucharist).`,trap:`The Eucharist is not merely a symbol; through transubstantiation, the bread and wine truly become the Body and Blood of Christ.`,step:`1. Introductory Rites (gathering & penitence). 2. Liturgy of the Word (Readings & Gospel). 3. Liturgy of the Eucharist (Offertory, Consecration, Communion). 4. Concluding Rites (blessing & mission).`,preset:`church-tour`}];function t(){let t=`/wwwebucation/`.replace(/\/?$/,`/`),n=document.createElement(`div`);n.className=`learning-zone-stage`,n.style.cssText=`max-width: 1140px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let r=`All`,i=`curriculum`;new URLSearchParams(window.location.search).get(`tab`)===`constellation`&&(i=`constellation`);function a(){return e.filter(e=>r===`All`||e.stage===r)}function o(){let e=a();n.innerHTML=`
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${t}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">📖 Learning Zone</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">National Curriculum Learning Zone</h1>
            <p style="font-size:0.95rem; color:#64748b; margin:0;">
              Structured unit trajectories, clear explanations, common misconception guards, and interactive simulations.
            </p>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" id="tab-btn-curriculum" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.84rem; cursor:pointer; border:1px solid ${i===`curriculum`?`#0284c7`:`#cbd5e1`}; background:${i===`curriculum`?`#0284c7`:`#ffffff`}; color:${i===`curriculum`?`#ffffff`:`#475569`};">
              📖 Units &amp; Lessons
            </button>
            <button type="button" id="tab-btn-constellation" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.84rem; cursor:pointer; border:1px solid ${i===`constellation`?`#0284c7`:`#cbd5e1`}; background:${i===`constellation`?`#0284c7`:`#ffffff`}; color:${i===`constellation`?`#ffffff`:`#475569`};">
              ✨ Concept Constellation
            </button>
          </div>
        </div>
      </div>

      ${i===`constellation`?`
        <!-- Concept Constellation Graph View -->
        <div style="background:#090d16; border:1px solid #1e293b; border-radius:16px; padding:2rem; color:#ffffff; margin-bottom:2rem; box-shadow:0 8px 30px rgba(0,0,0,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:8px;">
            <div>
              <span style="font-size:0.75rem; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.05em;">Logseq-Style Prerequisite Graph</span>
              <h2 style="font-size:1.4rem; font-weight:800; margin:2px 0 0;">Curriculum Concept Constellation</h2>
            </div>
            <span style="font-size:0.75rem; background:#1e293b; color:#34d399; padding:4px 10px; border-radius:999px; font-weight:700;">
              0 bps Local Execution
            </span>
          </div>
          <p style="font-size:0.88rem; color:#94a3b8; line-height:1.5; margin:0 0 1.5rem 0;">
            Every lesson connects to earlier foundations. Explore prerequisite paths and see how primary mathematics flows directly into secondary physics and computing.
          </p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
            <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:1.25rem;">
              <span style="font-size:0.72rem; color:#38bdf8; font-weight:800;">ROOT FOUNDATION</span>
              <h3 style="font-size:1rem; color:#f8fafc; margin:4px 0 8px;">Fractions &amp; Proportions</h3>
              <p style="font-size:0.8rem; color:#94a3b8; margin:0 0 10px;">Leads to: Decimals, Percentages, Ratios, Probability, and Algebraic Equations.</p>
              <a href="${t}player?preset=fractions" style="font-size:0.78rem; color:#38bdf8; font-weight:700; text-decoration:none;">Open Fraction Sim &rarr;</a>
            </div>

            <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:1.25rem;">
              <span style="font-size:0.72rem; color:#34d399; font-weight:800;">PHYSICAL SCIENCES</span>
              <h3 style="font-size:1rem; color:#f8fafc; margin:4px 0 8px;">Kinetic Gas &amp; Thermodynamics</h3>
              <p style="font-size:0.8rem; color:#94a3b8; margin:0 0 10px;">Leads to: Particle Theory, Pressure Laws, Heat Capacity, and Chemical Equilibrium.</p>
              <a href="${t}player?preset=kinetic-gas" style="font-size:0.78rem; color:#34d399; font-weight:700; text-decoration:none;">Open Gas Sim &rarr;</a>
            </div>

            <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:1.25rem;">
              <span style="font-size:0.72rem; color:#fbbf24; font-weight:800;">GEOMETRIC REASONING</span>
              <h3 style="font-size:1rem; color:#f8fafc; margin:4px 0 8px;">Pythagoras' Theorem</h3>
              <p style="font-size:0.8rem; color:#94a3b8; margin:0 0 10px;">Leads to: Trigonometry, Coordinate Geometry, 3D Vectors, and Physics Mechanics.</p>
              <a href="${t}player?preset=pythagoras" style="font-size:0.78rem; color:#fbbf24; font-weight:700; text-decoration:none;">Open Pythagoras Sim &rarr;</a>
            </div>
          </div>
        </div>
      `:`
        <!-- Stage Filters -->
        <div style="display:flex; gap:8px; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
          <span style="font-size:0.84rem; font-weight:700; color:#64748b; margin-right:4px;">Filter by Stage:</span>
          ${[`All`,`Key Stage 2`,`Key Stage 3`].map(e=>`
            <button type="button" class="stage-pill-btn" data-stage="${e}" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${e===r?`#0284c7`:`#cbd5e1`}; background:${e===r?`#0284c7`:`#ffffff`}; color:${e===r?`#ffffff`:`#475569`};">
              ${e}
            </button>
          `).join(``)}
        </div>

        <!-- Units Walkthrough List -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          ${e.map(e=>`
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.75rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:0.74rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:999px;">
                    ${e.stage}
                  </span>
                  <span style="font-size:0.78rem; font-weight:700; color:#64748b;">
                    ${e.subject}
                  </span>
                </div>
                ${e.preset?`
                  <a href="${t}player?preset=${e.preset}" style="padding:5px 12px; background:#0284c7; color:#fff; border-radius:6px; font-size:0.78rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                    <span>🎮 Launch Simulator</span> &rarr;
                  </a>
                `:``}
              </div>

              <h2 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin:0 0 12px 0;">${e.unit}</h2>

              <!-- The Big Idea -->
              <div style="margin-bottom:12px;">
                <strong style="color:#0369a1; font-size:0.88rem; display:block; margin-bottom:3px;">💡 1. The Core Big Idea:</strong>
                <p style="font-size:0.9rem; color:#334155; line-height:1.5; margin:0;">${e.axiom}</p>
              </div>

              <!-- Step by Step -->
              <div style="margin-bottom:12px; background:#f8fafc; border-left:3px solid #0284c7; padding:10px 14px; border-radius:0 8px 8px 0;">
                <strong style="color:#0f172a; font-size:0.85rem; display:block; margin-bottom:3px;">📋 2. Step-by-Step Method:</strong>
                <p style="font-size:0.86rem; color:#475569; line-height:1.5; margin:0;">${e.step}</p>
              </div>

              <!-- Tricky Pitfall to Avoid -->
              <div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:10px 14px; border-radius:0 8px 8px 0;">
                <strong style="color:#92400e; font-size:0.85rem; display:block; margin-bottom:3px;">⚠️ 3. Watch Out For This Common Mistake:</strong>
                <p style="font-size:0.86rem; color:#78350f; line-height:1.5; margin:0;">${e.trap}</p>
              </div>
            </div>
          `).join(``)}
        </div>
      `}
    `,n.querySelector(`#tab-btn-curriculum`)?.addEventListener(`click`,()=>{i=`curriculum`,o()}),n.querySelector(`#tab-btn-constellation`)?.addEventListener(`click`,()=>{i=`constellation`,o()}),n.querySelectorAll(`.stage-pill-btn`).forEach(e=>{e.addEventListener(`click`,()=>{r=e.getAttribute(`data-stage`)||`All`,o()})})}return o(),n}export{t as default,t as renderLearningZonePage};