var e=[{id:`mat-frac-1`,stage:`Key Stage 2`,subject:`Mathematics`,unit:`Fractions and Decimals`,question:`What is 1/4 + 2/4 in simplest form?`,options:[`3/8`,`3/4`,`2/8`,`1/2`],correctIndex:1,hint:`When fractions share the same denominator (bottom number), simply add the numerators (top numbers)!`,explanation:`Correct! 1/4 + 2/4 = (1 + 2)/4 = 3/4. Denominators stay the same.`,simPreset:`fractions`},{id:`sci-gas-1`,stage:`Key Stage 3`,subject:`Science`,unit:`States of Matter & Gas Laws`,question:`If the volume of a sealed gas container is halved at constant temperature, what happens to the gas pressure?`,options:[`Halved`,`Remains identical`,`Doubled`,`Quadrupled`],correctIndex:2,hint:`Recall Boyle's Law: P × V = constant. Fewer spaces mean particles collide with walls twice as often.`,explanation:`Correct! By Boyle's Law, pressure is inversely proportional to volume. Halving the volume doubles the pressure.`,simPreset:`kinetic-gas`},{id:`mat-pyth-1`,stage:`Key Stage 3`,subject:`Mathematics`,unit:`Pythagoras Theorem`,question:`In a right-angled triangle with legs a = 3 and b = 4, what is the length of hypotenuse c?`,options:[`5`,`7`,`12`,`25`],correctIndex:0,hint:`Use Pythagoras' formula: a² + b² = c². 3² + 4² = 9 + 16 = 25.`,explanation:`Correct! √25 = 5. A classic 3-4-5 Pythagorean triple.`,simPreset:`pythagoras`},{id:`sci-circ-1`,stage:`Key Stage 3`,subject:`Science`,unit:`Electrical Circuits & Ohm’s Law`,question:`If voltage across a resistor is 12V and current is 3A, what is its electrical resistance?`,options:[`36 Ω`,`4 Ω`,`9 Ω`,`0.25 Ω`],correctIndex:1,hint:`Use Ohm's Law: V = I × R, which rearranges to R = V / I.`,explanation:`Correct! R = 12V / 3A = 4 Ω.`,simPreset:`electric-circuits`},{id:`re-mass-1`,stage:`Key Stage 2`,subject:`Religious Education (Catholic)`,unit:`The Holy Eucharist & Sacraments`,question:`Which part of the Mass follows the Liturgy of the Word?`,options:[`Introductory Rites`,`Liturgy of the Eucharist`,`Concluding Rites`,`Penitential Act`],correctIndex:1,hint:`After listening to God’s Word in Scripture, we approach the Altar for the sacrifice and Thanksgiving.`,explanation:`Correct! The two main tables of the Mass are the Table of the Word followed by the Table of the Eucharist.`,simPreset:`church-tour`},{id:`lang-es-1`,stage:`Key Stage 2`,subject:`Spanish`,unit:`Greetings and Introductions`,question:`How do you say "Good morning" in Spanish?`,options:[`Buenas noches`,`Buenos días`,`Hasta luego`,`Por favor`],correctIndex:1,hint:`"Día" means day. "Buenos días" literally means good days!`,explanation:`Correct! "Buenos días" is used in the morning until lunchtime.`,simPreset:`languages`}];function t(){let t=`/wwwebucation/`.replace(/\/?$/,`/`),n=document.createElement(`div`);n.className=`practice-arena-stage`,n.style.cssText=`max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let r=`All`,i=`All`,a=0,o=0,s=new Set;function c(){return e.filter(e=>{let t=r===`All`||e.stage===r,n=i===`All`||e.subject===i;return t&&n})}function l(){let u=c();n.innerHTML=`
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:1.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <a href="${t}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
            <span style="color:#cbd5e1;">/</span>
            <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">⚡ Practice Lab Question Bank</span>
          </div>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 4px 0;">Interactive Practice Arena</h1>
          <p style="font-size:0.95rem; color:#64748b; margin:0;">
            Immediate diagnostic feedback, step-by-step hints, and linked AST vector simulations.
          </p>
        </div>

        <!-- Score & Streak Pills -->
        <div style="display:flex; gap:10px; align-items:center;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:6px 14px; border-radius:999px; font-size:0.85rem; font-weight:700; color:#166534; display:flex; align-items:center; gap:6px;">
            <span>⭐</span> Score: <span id="score-val">${a}</span>
          </div>
          <div style="background:#fffbeb; border:1px solid #fde68a; padding:6px 14px; border-radius:999px; font-size:0.85rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:6px;">
            <span>🔥</span> Streak: <span id="streak-val">${o}</span>
          </div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <label style="font-size:0.8rem; font-weight:700; color:#475569;">Key Stage:</label>
            ${[`All`,`Key Stage 1`,`Key Stage 2`,`Key Stage 3`].map(e=>`
              <button type="button" class="stage-filter-btn" data-stage="${e}" style="padding:4px 10px; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid ${e===r?`#0284c7`:`#cbd5e1`}; background:${e===r?`#0284c7`:`#f8fafc`}; color:${e===r?`#fff`:`#475569`};">
                ${e}
              </button>
            `).join(``)}
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <label style="font-size:0.8rem; font-weight:700; color:#475569;">Subject:</label>
            ${[`All`,`Mathematics`,`Science`,`Spanish`,`Religious Education (Catholic)`].map(e=>`
              <button type="button" class="subject-filter-btn" data-subject="${e}" style="padding:4px 10px; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid ${e===i?`#0284c7`:`#cbd5e1`}; background:${e===i?`#0284c7`:`#f8fafc`}; color:${e===i?`#fff`:`#475569`};">
                ${e===`Religious Education (Catholic)`?`✝️ Catholic RE`:e}
              </button>
            `).join(``)}
          </div>
        </div>
      </div>

      <!-- Drills List -->
      <div id="drills-container" style="display:flex; flex-direction:column; gap:1.25rem;">
        ${u.length===0?`
          <div style="text-align:center; padding:3rem; color:#64748b; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
            No questions found for the selected filters.
          </div>
        `:u.map((e,n)=>`
          <div class="drill-card" id="drill-${e.id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:0.75rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:999px;">
                  ${e.stage}
                </span>
                <span style="font-size:0.75rem; font-weight:700; color:#ca8a04;">
                  ${e.subject} &bull; ${e.unit}
                </span>
              </div>
              ${e.simPreset?`
                <a href="${t}player?preset=${e.simPreset}" style="font-size:0.78rem; font-weight:700; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  <span>🎮 Open Simulator</span> &rarr;
                </a>
              `:``}
            </div>

            <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; line-height:1.4;">
              ${n+1}. ${e.question}
            </h3>

            <!-- Options Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:1rem;">
              ${e.options.map((t,n)=>`
                <button
                  type="button"
                  class="option-btn"
                  data-drill-id="${e.id}"
                  data-opt-idx="${n}"
                  style="text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:600; font-size:0.9rem; cursor:pointer; transition:all 0.15s ease;">
                  <span style="display:inline-block; width:22px; height:22px; border-radius:50%; background:#e2e8f0; text-align:center; line-height:22px; font-size:0.78rem; margin-right:8px; font-weight:800;">
                    ${String.fromCharCode(65+n)}
                  </span>
                  ${t}
                </button>
              `).join(``)}
            </div>

            <!-- Feedback & Hint Box -->
            <div class="feedback-box" id="feedback-${e.id}" style="display:none; padding:10px 14px; border-radius:8px; font-size:0.86rem; margin-top:8px;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="hint-toggle-btn" data-drill-id="${e.id}" style="background:transparent; border:none; color:#0284c7; font-size:0.8rem; font-weight:700; cursor:pointer;">
                💡 Need a clue?
              </button>
              <div class="hint-text" id="hint-${e.id}" style="display:none; font-size:0.82rem; color:#64748b; font-style:italic;">
                ${e.hint}
              </div>
            </div>
          </div>
        `).join(``)}
      </div>
    `,n.querySelectorAll(`.stage-filter-btn`).forEach(e=>{e.addEventListener(`click`,()=>{r=e.getAttribute(`data-stage`)||`All`,l()})}),n.querySelectorAll(`.subject-filter-btn`).forEach(e=>{e.addEventListener(`click`,()=>{i=e.getAttribute(`data-subject`)||`All`,l()})}),n.querySelectorAll(`.option-btn`).forEach(t=>{t.addEventListener(`click`,r=>{let i=t.getAttribute(`data-drill-id`),c=parseInt(t.getAttribute(`data-opt-idx`)||`0`,10),l=e.find(e=>e.id===i);if(!l)return;let u=n.querySelector(`#drill-${i}`),d=n.querySelector(`#feedback-${i}`);if(!u||!d)return;let f=!s.has(l.id);if(s.add(l.id),c===l.correctIndex){if(t.setAttribute(`style`,`text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #16a34a; background:#dcfce7; color:#166534; font-weight:700; font-size:0.9rem;`),d.style.display=`block`,d.style.background=`#dcfce7`,d.style.color=`#166534`,d.style.border=`1px solid #86efac`,d.innerHTML=`<strong>🎉 Brilliant!</strong> ${l.explanation}`,f){a+=10,o+=1;let e=n.querySelector(`#score-val`),t=n.querySelector(`#streak-val`);e&&(e.textContent=String(a)),t&&(t.textContent=String(o))}}else if(t.setAttribute(`style`,`text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #dc2626; background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.9rem;`),d.style.display=`block`,d.style.background=`#fee2e2`,d.style.color=`#991b1b`,d.style.border=`1px solid #fca5a5`,d.innerHTML=`<strong>Not quite:</strong> Try reviewing the clue below.`,f){o=0;let e=n.querySelector(`#streak-val`);e&&(e.textContent=`0`)}})}),n.querySelectorAll(`.hint-toggle-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-drill-id`),r=n.querySelector(`#hint-${t}`);r&&(r.style.display=r.style.display===`none`?`block`:`none`)})})}return l(),n}export{t as default,t as renderPracticePage};