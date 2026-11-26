import{s as e,v as t}from"./cartridge-vault-B8xr7N8Y.js";import{n,t as r}from"./curriculumMesh-Bs4ca5rR.js";import{n as i}from"./curriculumSimMapping-D36MBWmC.js";import{getLearnerProfile as a,recordAssessmentAttempt as o}from"./studentProfileStore-BBxmFz--.js";import{n as s,r as c}from"./index-CxKDYmQ8.js";function l(){let t=[],n=new Set;for(let r of e)if(r.dataPayload&&r.dataPayload.questions)for(let e of r.dataPayload.questions)n.has(e.id)||(n.add(e.id),t.push({id:e.id,stage:r.stage,subject:r.subject,unit:r.oakUnit||r.title,question:e.prompt,options:e.options,correctIndex:e.answer,hint:e.hint||`Carefully review the fundamental axioms.`,explanation:e.explanation||`Verified diagnostic response.`,sourceDeck:r.title}));for(let e of r){let r=i(e.topicId,e.topicTitle,e.subjectTitle),a=r?r.presetId:void 0,o=e.countryOrRegion?`${e.countryOrRegion}${e.packTitle?` • ${e.packTitle}`:``}`:void 0;if(e.questions&&e.questions.length>0)for(let r of e.questions)n.has(r.id)||(n.add(r.id),t.push({id:r.id,stage:e.stageTitle,subject:e.subjectTitle,unit:e.topicTitle,question:r.prompt,options:r.options,correctIndex:r.answerKey,hint:r.hint,explanation:r.explanation,simPreset:a,sourceDeck:o}));else{let r=`q_axiom_${e.packId||`oak`}_${e.stageId}_${e.topicId}`;n.has(r)||(n.add(r),t.push({id:r,stage:e.stageTitle,subject:e.subjectTitle,unit:e.topicTitle,question:`Which fundamental principle governs ${e.topicTitle}?`,options:[e.axiom,e.cognitiveTrap||`It operates in reverse without regard for foundational invariants.`,`It only applies under hypothetical lab conditions with arbitrary constants.`,`It has no observable relationship with ${e.subjectTitle}.`],correctIndex:0,hint:e.guidedStep||`Focus on the defining conceptual axiom.`,explanation:`Correct! ${e.axiom}`,simPreset:a,sourceDeck:o}))}}return t}function u(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`):``}function d(){let e=t(),r=document.createElement(`div`);r.className=`practice-arena-stage`,r.style.cssText=`max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let i=l(),d=new URLSearchParams(window.location.search),f=(d.get(`stage`)||d.get(`ks`)||`All`).replace(/[<>"']/g,``),p=(d.get(`subject`)||d.get(`sub`)||`All`).replace(/[<>"']/g,``),m=f||`All`,h=p||`All`,g=(d.get(`q`)||d.get(`unit`)||``).slice(0,100),_=a(),v=_.starsEarned||0,y=_.currentStreak||0,b=new Set;function x(){let e=[`Key Stage 1`,`Key Stage 2`,`Key Stage 3`,`Key Stage 4`],t=new Set,n=new Set;i.forEach(r=>{r.stage&&!e.includes(r.stage)&&t.add(r.stage),r.subject&&n.add(r.subject)});let r=[`All`,...e,...Array.from(t)],a=[`All`,...Array.from(n).sort()];return m!==`All`&&!r.includes(m)&&t.size>0&&(m=`All`),{stages:r,subjects:a}}function S(){let e=g.toLowerCase().trim();return i.filter(t=>{let n=m===`All`||t.stage===m,r=h===`All`||t.subject===h;if(!n||!r)return!1;if(e){let n=t.question.toLowerCase().includes(e),r=t.unit.toLowerCase().includes(e),i=t.explanation.toLowerCase().includes(e);if(!n&&!r&&!i)return!1}return!0})}function C(e){try{let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let n=new t,r=n.createOscillator(),i=n.createGain();r.connect(i),i.connect(n.destination),e===`success`?(r.frequency.setValueAtTime(523.25,n.currentTime),r.frequency.exponentialRampToValueAtTime(659.25,n.currentTime+.1),i.gain.setValueAtTime(.15,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.25),r.start(),r.stop(n.currentTime+.25)):(r.type=`sawtooth`,r.frequency.setValueAtTime(180,n.currentTime),r.frequency.linearRampToValueAtTime(120,n.currentTime+.2),i.gain.setValueAtTime(.12,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.2),r.start(),r.stop(n.currentTime+.2))}catch{}}function w(){let{stages:t,subjects:n}=x(),i=S();r.innerHTML=`
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
            <span>⭐</span> Score: <span id="score-val" style="font-size:1.1rem; font-weight:800;">${u(String(v))}</span>
          </div>
          <div style="background:#fffbeb; border:1px solid #fde68a; padding:8px 16px; border-radius:10px; font-size:0.88rem; font-weight:700; color:#92400e; display:flex; align-items:center; gap:8px;">
            <span>🔥</span> Streak: <span id="streak-val" style="font-size:1.1rem; font-weight:800;">${u(String(y))}</span>
          </div>
        </div>
      </div>

      <!-- Mode Switch Banner -->
      <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:12px; padding:10px 16px; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <span style="font-size:0.86rem; color:#4c1d95; font-weight:600;">
          Preparing for GCSE or memorising key terms? Practise <strong>AQA / Edexcel / OCR</strong> 6-mark answers, flip flashcards, or try audio spelling.
        </span>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="${e}revision?tab=exam" style="padding:5px 12px; border-radius:8px; background:#7c3aed; color:#ffffff; text-decoration:none; font-size:0.78rem; font-weight:700;">📝 6-Mark Exam Prep</a>
          <a href="${e}revision?tab=flashcards" style="padding:5px 12px; border-radius:8px; background:#ffffff; border:1px solid #c4b5fd; color:#5b21b6; text-decoration:none; font-size:0.78rem; font-weight:700;">🃏 Flashcards</a>
          <a href="${e}revision?tab=dictation" style="padding:5px 12px; border-radius:8px; background:#ffffff; border:1px solid #c4b5fd; color:#5b21b6; text-decoration:none; font-size:0.78rem; font-weight:700;">🎧 Listen &amp; Spell</a>
          <a href="${e}curriculum-studio?tab=overseas" style="padding:5px 12px; border-radius:8px; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; text-decoration:none; font-size:0.78rem; font-weight:700;">🌍 Overseas Curriculums${s().length>0?` (${s().length})`:``}</a>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.25rem 1.5rem; margin-bottom:2rem; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
        <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:space-between;">
          <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label for="practice-stage-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Stage / Grade:</label>
              <select id="practice-stage-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${t.map(e=>`<option value="${u(e)}" ${e===m?`selected`:``}>${u(e)}</option>`).join(``)}
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <label for="practice-subject-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Subject:</label>
              <select id="practice-subject-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${n.map(e=>`<option value="${u(e)}" ${e===h?`selected`:``}>${u(e)}</option>`).join(``)}
              </select>
            </div>
          </div>

          <div style="flex:1; min-width:240px; max-width:360px; position:relative;">
            <input 
              type="text" 
              id="practice-search-input" 
              value="${u(g)}" 
              placeholder="Search question prompts or topics..." 
              style="width:100%; box-sizing:border-box; padding:8px 36px 8px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;"
            />
            ${g?`
              <button type="button" id="clear-practice-search-btn" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:0.9rem; cursor:pointer;">✕</button>
            `:``}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:0.78rem; color:#64748b;">
          <span>Showing <strong>${i.length}</strong> active practice questions</span>
          ${m!==`All`||h!==`All`||g?`
            <button type="button" id="reset-practice-filters-btn" style="background:none; border:none; color:#0284c7; font-weight:700; cursor:pointer; text-decoration:underline;">
              Reset filters
            </button>
          `:``}
        </div>
      </section>

      <!-- Drills List -->
      <div id="drills-container" style="display:flex; flex-direction:column; gap:1.25rem;">
        ${i.length===0?`
          <div style="text-align:center; padding:3rem; color:#64748b; background:#ffffff; border-radius:14px; border:1px solid #e2e8f0;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
            <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a; margin:0 0 6px 0;">No questions match this selection</h3>
            <p style="font-size:0.86rem; color:#64748b; margin:0 0 1rem 0;">
              Try picking 'All' Key Stages or clearing the search query.
            </p>
          </div>
        `:i.map((t,n)=>`
          <article class="drill-card" id="drill-${u(t.id)}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:0.72rem; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.04em;">
                  ${u(t.stage)}
                </span>
                <span style="color:#cbd5e1;">&bull;</span>
                <span style="font-size:0.74rem; font-weight:700; color:#475569;">
                  ${u(t.subject)} &bull; ${u(t.unit)}
                </span>
                ${t.sourceDeck?`
                  <span style="font-size:0.7rem; font-weight:700; color:#059669; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 8px; border-radius:6px;">
                    📦 ${u(t.sourceDeck)}
                  </span>
                `:``}
              </div>
              ${t.simPreset?`
                <a href="${e}player?preset=${encodeURIComponent(t.simPreset)}" style="font-size:0.78rem; font-weight:700; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  <span>🎮 Open Simulator</span> &rarr;
                </a>
              `:``}
            </div>

            <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; line-height:1.45;">
              ${n+1}. ${u(t.question)}
            </h3>

            <!-- Options Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; margin-bottom:1rem;">
              ${t.options.map((e,n)=>`
                <button
                  type="button"
                  class="option-btn"
                  data-drill-id="${u(t.id)}"
                  data-opt-idx="${n}"
                  style="text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:600; font-size:0.88rem; cursor:pointer; transition:all 0.15s ease; line-height:1.4;">
                  <span style="display:inline-block; width:22px; height:22px; border-radius:50%; background:#e2e8f0; text-align:center; line-height:22px; font-size:0.76rem; margin-right:8px; font-weight:800;">
                    ${String.fromCharCode(65+n)}
                  </span>
                  ${u(e)}
                </button>
              `).join(``)}
            </div>

            <!-- Feedback & Hint Box -->
            <div class="feedback-box" id="feedback-${t.id}" style="display:none; padding:10px 14px; border-radius:8px; font-size:0.86rem; margin-top:8px; line-height:1.5;"></div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
              <button type="button" class="hint-toggle-btn" data-drill-id="${t.id}" style="background:transparent; border:none; color:#0284c7; font-size:0.8rem; font-weight:700; cursor:pointer;">
                💡 Need a clue?
              </button>
              <div class="hint-text" id="hint-${u(t.id)}" style="display:none; font-size:0.82rem; color:#64748b; font-style:italic;">
                ${u(t.hint)}
              </div>
            </div>
          </article>
        `).join(``)}
      </div>
    `;let a=r.querySelector(`#practice-stage-select`);a?.addEventListener(`change`,()=>{m=a.value,w()});let c=r.querySelector(`#practice-subject-select`);c?.addEventListener(`change`,()=>{h=c.value,w()});let l=r.querySelector(`#practice-search-input`);l?.addEventListener(`input`,()=>{g=l.value,w();let e=r.querySelector(`#practice-search-input`);e&&(e.focus(),e.setSelectionRange(g.length,g.length))}),r.querySelector(`#clear-practice-search-btn`)?.addEventListener(`click`,()=>{g=``,w()}),r.querySelector(`#reset-practice-filters-btn`)?.addEventListener(`click`,()=>{m=`All`,h=`All`,g=``,w()}),r.querySelectorAll(`.option-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-drill-id`),n=parseInt(e.getAttribute(`data-opt-idx`)||`0`,10),a=i.find(e=>e.id===t);if(!a)return;let s=r.querySelector(`#feedback-${t}`);if(!s)return;let c=!b.has(a.id);b.add(a.id);let l=n===a.correctIndex;if(c){let e=(a.stage||`ks2`).toLowerCase().replace(/key stage\s+/i,`ks`).replace(/[^a-z0-9]+/g,``),t=(a.subject||`general`).toLowerCase().replace(/[^a-z0-9]+/g,`_`),r=(a.unit||a.id).toLowerCase().replace(/[^a-z0-9]+/g,`_`);o({challengeId:a.id,topicId:`${e}:${t}:${r}`,isCorrect:l,userAnswer:a.options[n]||String(n)})}if(l){if(C(`success`),e.setAttribute(`style`,`text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #16a34a; background:#dcfce7; color:#166534; font-weight:700; font-size:0.88rem; line-height:1.4;`),s.style.display=`block`,s.style.background=`#dcfce7`,s.style.color=`#166534`,s.style.border=`1px solid #86efac`,s.innerHTML=`<strong>🎉 Excellent!</strong> ${a.explanation}`,c){v+=10,y+=1;let e=r.querySelector(`#score-val`),t=r.querySelector(`#streak-val`);e&&(e.textContent=String(v)),t&&(t.textContent=String(y))}}else if(C(`error`),e.setAttribute(`style`,`text-align:left; padding:10px 14px; border-radius:8px; border:1.5px solid #dc2626; background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.88rem; line-height:1.4;`),s.style.display=`block`,s.style.background=`#fee2e2`,s.style.color=`#991b1b`,s.style.border=`1px solid #fca5a5`,s.innerHTML=`<strong>Not quite:</strong> Try reviewing the clue below.`,c){y=0;let e=r.querySelector(`#streak-val`);e&&(e.textContent=`0`)}})}),r.querySelectorAll(`.hint-toggle-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-drill-id`),n=r.querySelector(`#hint-${t}`);n&&(n.style.display=n.style.display===`none`?`block`:`none`)})})}let T=()=>{r.isConnected?(i=l(),f&&f!==`All`&&i.some(e=>e.stage===f)&&(m=f),w()):window.removeEventListener(`curriculum_mesh_updated`,T)};return window.addEventListener(`curriculum_mesh_updated`,T),c().then(()=>{n()}),w(),r}export{d as default,d as renderPracticePage};