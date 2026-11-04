import{n as e,t}from"./curriculumSimMapping-BweknIjT.js";function n(){let n=[];for(let r of e){let e=t(r.topicId,r.topicTitle,r.subjectTitle),i=e?e.presetId:void 0;if(r.questions&&r.questions.length>0)for(let e of r.questions)n.push({id:e.id,stage:r.stageTitle,subject:r.subjectTitle,unit:r.topicTitle,question:e.prompt,options:e.options,correctIndex:e.answerKey,hint:e.hint,explanation:e.explanation,simPreset:i});else n.push({id:`q_axiom_${r.stageId}_${r.topicId}`,stage:r.stageTitle,subject:r.subjectTitle,unit:r.topicTitle,question:`Which fundamental principle governs ${r.topicTitle}?`,options:[r.axiom,`It operates in reverse without regard for foundational invariants.`,`It only applies under hypothetical lab conditions with arbitrary constants.`,`It contradicts the standard National Curriculum frameworks.`],correctIndex:0,hint:r.guidedStep||`Focus on the defining conceptual axiom.`,explanation:`Correct! ${r.axiom}`,simPreset:i})}return n}function r(){let e=`/wwwebucation/`.replace(/\/?$/,`/`),t=document.createElement(`div`);t.className=`practice-arena-stage`,t.style.cssText=`max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let r=n(),i=new URLSearchParams(window.location.search),a=i.get(`stage`)||`All`,o=i.get(`subject`)||`All`,s=i.get(`q`)||``,c=0,l=0,u=new Set,d=[`All`,`Key Stage 1`,`Key Stage 2`,`Key Stage 3`,`Key Stage 4`],f=new Set;r.forEach(e=>{e.subject&&f.add(e.subject)});let p=[`All`,...Array.from(f).sort()];function m(){let e=s.toLowerCase().trim();return r.filter(t=>{let n=a===`All`||t.stage===a,r=o===`All`||t.subject===o;if(!n||!r)return!1;if(e){let n=t.question.toLowerCase().includes(e),r=t.unit.toLowerCase().includes(e),i=t.explanation.toLowerCase().includes(e);if(!n&&!r&&!i)return!1}return!0})}function h(e){try{let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let n=new t,r=n.createOscillator(),i=n.createGain();r.connect(i),i.connect(n.destination),e===`success`?(r.frequency.setValueAtTime(523.25,n.currentTime),r.frequency.exponentialRampToValueAtTime(659.25,n.currentTime+.1),i.gain.setValueAtTime(.15,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.25),r.start(),r.stop(n.currentTime+.25)):(r.type=`sawtooth`,r.frequency.setValueAtTime(180,n.currentTime),r.frequency.linearRampToValueAtTime(120,n.currentTime+.2),i.gain.setValueAtTime(.12,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.2),r.start(),r.stop(n.currentTime+.2))}catch{}}function g(){let n=m();t.innerHTML=`
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:1.75rem;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <a href="${e}" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
            <span style="color:#cbd5e1;">/</span>
            <a href="${e}learning-zone" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">Learning Zone</a>
            <span style="color:#cbd5e1;">/</span>
            <span style="font-size:0.82rem; color:#0284c7; font-weight:700;">⚡ Practice Lab Arena</span>
          </div>
          <h1 style="font-size:2.2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0; letter-spacing:-0.02em;">
            Interactive Practice Arena
          </h1>
          <p style="font-size:0.96rem; color:#475569; margin:0; line-height:1.5;">
            Master National Curriculum topics with diagnostic checkpoints, immediate feedback, hints, and linked 60 FPS simulations.
          </p>
        </div>

        <!-- Score & Streak Status -->
        <div style="display:flex; gap:12px; align-items:center;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:8px 16px; border-radius:10px; font-size:0.88rem; font-weight:700; color:#166534; display:flex; align-items:center; gap:8px;">
            <span>⭐</span> Score: <span id="score-val" style="font-size:1.1rem; font-weight:800;">${c}</span>
          </div>
          <div style="background:#fffbeb; border:1px solid #fde68a; padding:8px 16px; border-radius:10px; font-size:0.88rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:8px;">
            <span>🔥</span> Streak: <span id="streak-val" style="font-size:1.1rem; font-weight:800;">${l}</span>
          </div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.25rem 1.5rem; margin-bottom:2rem; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
        <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:space-between;">
          <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label for="practice-stage-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Key Stage:</label>
              <select id="practice-stage-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${d.map(e=>`<option value="${e}" ${e===a?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <label for="practice-subject-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Subject:</label>
              <select id="practice-subject-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${p.map(e=>`<option value="${e}" ${e===o?`selected`:``}>${e}</option>`).join(``)}
              </select>
            </div>
          </div>

          <div style="flex:1; min-width:240px; max-width:360px; position:relative;">
            <input 
              type="text" 
              id="practice-search-input" 
              value="${s}" 
              placeholder="Search question prompts or topics..." 
              style="width:100%; box-sizing:border-box; padding:8px 36px 8px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;"
            />
            ${s?`
              <button type="button" id="clear-practice-search-btn" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:0.9rem; cursor:pointer;">✕</button>
            `:``}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:0.78rem; color:#64748b;">
          <span>Showing <strong>${n.length}</strong> active practice questions</span>
          ${a!==`All`||o!==`All`||s?`
            <button type="button" id="reset-practice-filters-btn" style="background:none; border:none; color:#0284c7; font-weight:700; cursor:pointer; text-decoration:underline;">
              Reset filters
            </button>
          `:``}
        </div>
      </section>

      <!-- Drills List -->
      <div id="drills-container" style="display:flex; flex-direction:column; gap:1.25rem;">
        ${n.length===0?`
          <div style="text-align:center; padding:3rem; color:#64748b; background:#ffffff; border-radius:14px; border:1px solid #e2e8f0;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
            <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a; margin:0 0 6px 0;">No questions match this selection</h3>
            <p style="font-size:0.86rem; color:#64748b; margin:0 0 1rem 0;">
              Try picking 'All' Key Stages or clearing the search query.
            </p>
          </div>
        `:n.map((t,n)=>`
          <article class="drill-card" id="drill-${t.id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:0.72rem; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.04em;">
                  ${t.stage}
                </span>
                <span style="color:#cbd5e1;">&bull;</span>
                <span style="font-size:0.74rem; font-weight:700; color:#475569;">
                  ${t.subject} &bull; ${t.unit}
                </span>
              </div>
              ${t.simPreset?`
                <a href="${e}player?preset=${t.simPreset}" style="font-size:0.78rem; font-weight:700; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  <span>🎮 Open Simulator</span> &rarr;
                </a>
              `:``}
            </div>

            <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; line-height:1.45;">
              ${n+1}. ${t.question}
            </h3>

            <!-- Options Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; margin-bottom:1rem;">
              ${t.options.map((e,n)=>`
                <button
                  type="button"
                  class="option-btn"
                  data-drill-id="${t.id}"
                  data-opt-idx="${n}"
                  style="text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:600; font-size:0.88rem; cursor:pointer; transition:all 0.15s ease; line-height:1.4;">
                  <span style="display:inline-block; width:22px; height:22px; border-radius:50%; background:#e2e8f0; text-align:center; line-height:22px; font-size:0.76rem; margin-right:8px; font-weight:800;">
                    ${String.fromCharCode(65+n)}
                  </span>
                  ${e}
                </button>
              `).join(``)}
            </div>

            <!-- Feedback & Hint Box -->
            <div class="feedback-box" id="feedback-${t.id}" style="display:none; padding:10px 14px; border-radius:8px; font-size:0.86rem; margin-top:8px; line-height:1.5;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="hint-toggle-btn" data-drill-id="${t.id}" style="background:transparent; border:none; color:#0284c7; font-size:0.8rem; font-weight:700; cursor:pointer;">
                💡 Need a clue?
              </button>
              <div class="hint-text" id="hint-${t.id}" style="display:none; font-size:0.82rem; color:#64748b; font-style:italic;">
                ${t.hint}
              </div>
            </div>
          </article>
        `).join(``)}
      </div>
    `;let r=t.querySelector(`#practice-stage-select`);r?.addEventListener(`change`,()=>{a=r.value,g()});let i=t.querySelector(`#practice-subject-select`);i?.addEventListener(`change`,()=>{o=i.value,g()});let f=t.querySelector(`#practice-search-input`);f?.addEventListener(`input`,()=>{s=f.value,g();let e=t.querySelector(`#practice-search-input`);e&&(e.focus(),e.setSelectionRange(s.length,s.length))}),t.querySelector(`#clear-practice-search-btn`)?.addEventListener(`click`,()=>{s=``,g()}),t.querySelector(`#reset-practice-filters-btn`)?.addEventListener(`click`,()=>{a=`All`,o=`All`,s=``,g()}),t.querySelectorAll(`.option-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let r=e.getAttribute(`data-drill-id`),i=parseInt(e.getAttribute(`data-opt-idx`)||`0`,10),a=n.find(e=>e.id===r);if(!a)return;let o=t.querySelector(`#feedback-${r}`);if(!o)return;let s=!u.has(a.id);if(u.add(a.id),i===a.correctIndex){if(h(`success`),e.setAttribute(`style`,`text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #16a34a; background:#dcfce7; color:#166534; font-weight:700; font-size:0.88rem; line-height:1.4;`),o.style.display=`block`,o.style.background=`#dcfce7`,o.style.color=`#166534`,o.style.border=`1px solid #86efac`,o.innerHTML=`<strong>🎉 Excellent!</strong> ${a.explanation}`,s){c+=10,l+=1;let e=t.querySelector(`#score-val`),n=t.querySelector(`#streak-val`);e&&(e.textContent=String(c)),n&&(n.textContent=String(l))}}else if(h(`error`),e.setAttribute(`style`,`text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #dc2626; background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.88rem; line-height:1.4;`),o.style.display=`block`,o.style.background=`#fee2e2`,o.style.color=`#991b1b`,o.style.border=`1px solid #fca5a5`,o.innerHTML=`<strong>Not quite:</strong> Try reviewing the clue below.`,s){l=0;let e=t.querySelector(`#streak-val`);e&&(e.textContent=`0`)}})}),t.querySelectorAll(`.hint-toggle-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.getAttribute(`data-drill-id`),r=t.querySelector(`#hint-${n}`);r&&(r.style.display=r.style.display===`none`?`block`:`none`)})})}return g(),t}export{r as default,r as renderPracticePage};