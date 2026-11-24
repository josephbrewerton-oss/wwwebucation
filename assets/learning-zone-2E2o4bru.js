import{v as e}from"./cartridge-vault-BGgggfTr.js";import{n as t,t as n}from"./curriculumMesh-BPy5pcfY.js";import{n as r,t as i}from"./curriculumSimMapping-D36MBWmC.js";import{r as a}from"./bsl-engine-BoQu-JDy.js";import{n as o,r as s}from"./index-B-ekfKXN.js";function c(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`):``}function l(){let l=e(),u=document.createElement(`div`);u.className=`learning-zone-stage`,u.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let d=new URLSearchParams(window.location.search),f=(d.get(`stage`)||`All`).replace(/[<>"']/g,``),p=(d.get(`subject`)||`All`).replace(/[<>"']/g,``),m=f||`All`,h=p||`All`,g=(d.get(`q`)||``).slice(0,100),_=d.get(`simOnly`)===`1`,v=d.get(`tab`)===`constellation`?`constellation`:d.get(`tab`)===`simulators`?`simulators`:`curriculum`,y=new Set;function b(){let e=[`Key Stage 1`,`Key Stage 2`,`Key Stage 3`,`Key Stage 4`],t=new Set,r=new Set;n.forEach(n=>{n.stageTitle&&!e.includes(n.stageTitle)&&t.add(n.stageTitle),n.subjectTitle&&r.add(n.subjectTitle)});let i=[`All`,...e,...Array.from(t)],a=[`All`,...Array.from(r).sort()];return m!==`All`&&!i.includes(m)&&t.size>0&&(m=`All`),{stages:i,subjects:a}}function x(){let e=g.toLowerCase().trim();return n.filter(t=>{if(m!==`All`&&t.stageTitle!==m||h!==`All`&&t.subjectTitle!==h||_&&!r(t.topicId,t.topicTitle,t.subjectTitle))return!1;if(e){let n=t.topicTitle.toLowerCase().includes(e),r=t.subjectTitle.toLowerCase().includes(e),i=t.axiom.toLowerCase().includes(e),a=t.cognitiveTrap.toLowerCase().includes(e),o=t.csn.toLowerCase().includes(e),s=(t.countryOrRegion||``).toLowerCase().includes(e)||(t.packTitle||``).toLowerCase().includes(e),c=t.lessons.some(t=>t.title.toLowerCase().includes(e));if(!n&&!r&&!i&&!a&&!o&&!s&&!c)return!1}return!0})}function S(){return n.filter(e=>r(e.topicId,e.topicTitle,e.subjectTitle)!==null).length}function C(){return n.reduce((e,t)=>e+(t.lessons?.length||0),0)}function w(e){if(!(`speechSynthesis`in window))return;window.speechSynthesis.cancel(),a({subtitle:e,isSpeaking:!0});let t=new SpeechSynthesisUtterance(e);t.rate=.9,t.pitch=1,t.lang=`en-GB`,t.onend=()=>a({isSpeaking:!1}),t.onerror=()=>a({isSpeaking:!1}),window.speechSynthesis.speak(t)}function T(){let e=n.length,t=S(),r=C();return`
      <section style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.75rem;">
          <a href="${l}" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.82rem; color:#0284c7; font-weight:700;">📖 Learning Zone</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div style="max-width:760px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
              <span style="font-size:1.6rem;">📚</span>
              <span style="font-size:0.75rem; font-weight:800; color:#0284c7; text-transform:uppercase; letter-spacing:0.06em;">
                St Joseph's Curriculum Library &bull; Oak National Curriculum
              </span>
            </div>
            <h1 style="font-size:2.25rem; font-weight:800; color:#0f172a; margin:0 0 8px 0; letter-spacing:-0.02em;">
              National Curriculum Learning Zone
            </h1>
            <p style="font-size:1rem; color:#475569; margin:0; line-height:1.6;">
              Structured unit pathways across Key Stages 1 to 4. Every topic includes the core big idea, a step-by-step worked method, common mistakes to avoid, and matching interactive labs.
            </p>
          </div>

          <!-- Stats Counter Card -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; display:flex; gap:20px; align-items:center;">
            <div>
              <div style="font-size:1.35rem; font-weight:800; color:#0284c7; line-height:1;">${e}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Curriculum Topics</div>
            </div>
            <div style="width:1px; height:28px; background:#e2e8f0;"></div>
            <div>
              <div style="font-size:1.35rem; font-weight:800; color:#10b981; line-height:1;">${r}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Oak Lessons</div>
            </div>
            <div style="width:1px; height:28px; background:#e2e8f0;"></div>
            <div>
              <div style="font-size:1.35rem; font-weight:800; color:#f59e0b; line-height:1;">${t}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Interactive Labs</div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:12px; flex-wrap:wrap;">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" id="tab-btn-curriculum" style="padding:8px 18px; border-radius:8px; font-weight:700; font-size:0.86rem; cursor:pointer; border:1px solid ${v===`curriculum`?`#0284c7`:`#cbd5e1`}; background:${v===`curriculum`?`#0284c7`:`#ffffff`}; color:${v===`curriculum`?`#ffffff`:`#334155`};">
              📖 Units &amp; Lessons (${e})
            </button>
            <button type="button" id="tab-btn-simulators" style="padding:8px 18px; border-radius:8px; font-weight:700; font-size:0.86rem; cursor:pointer; border:1px solid ${v===`simulators`?`#0284c7`:`#cbd5e1`}; background:${v===`simulators`?`#0284c7`:`#ffffff`}; color:${v===`simulators`?`#ffffff`:`#334155`};">
              🎮 Interactive Labs (${t})
            </button>
            <button type="button" id="tab-btn-constellation" style="padding:8px 18px; border-radius:8px; font-weight:700; font-size:0.86rem; cursor:pointer; border:1px solid ${v===`constellation`?`#0284c7`:`#cbd5e1`}; background:${v===`constellation`?`#0284c7`:`#ffffff`}; color:${v===`constellation`?`#ffffff`:`#334155`};">
              ✨ Topic Map
            </button>
          </div>
          <a href="${l}curriculum-studio?tab=overseas" style="padding:8px 14px; border-radius:8px; font-weight:700; font-size:0.82rem; text-decoration:none; border:1px solid #a7f3d0; background:#ecfdf5; color:#065f46; display:inline-flex; align-items:center; gap:6px;">
            <span>🌍 Overseas &amp; Custom Curriculums${o().length>0?` (${o().length} Installed)`:``}</span> &rarr;
          </a>
        </div>
      </section>
    `}function E(e){let{stages:t,subjects:n}=b();return`
      <!-- Filters and Search Toolbar -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.25rem 1.5rem; margin-bottom:1.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
        <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:space-between;">
          <!-- Left Controls: Stage & Subject dropdowns -->
          <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label for="filter-stage-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Stage / Grade:</label>
              <select id="filter-stage-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${t.map(e=>`<option value="${c(e)}" ${e===m?`selected`:``}>${c(e)}</option>`).join(``)}
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <label for="filter-subject-select" style="font-size:0.82rem; font-weight:700; color:#475569;">Subject:</label>
              <select id="filter-subject-select" style="padding:6px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:600; cursor:pointer;">
                ${n.map(e=>`<option value="${c(e)}" ${e===h?`selected`:``}>${c(e)}</option>`).join(``)}
              </select>
            </div>

            <!-- Sim only checkbox -->
            <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.82rem; font-weight:700; color:#0369a1; cursor:pointer; margin-left:6px;">
              <input type="checkbox" id="filter-sim-only" ${_?`checked`:``} style="cursor:pointer;" />
              <span>🎮 Has Interactive Lab</span>
            </label>
          </div>

          <!-- Right Controls: Live Search -->
          <div style="flex:1; min-width:240px; max-width:380px; position:relative;">
            <input 
              type="text" 
              id="filter-search-input" 
              value="${c(g)}" 
              placeholder="Search topics, key ideas, or misconceptions..." 
              style="width:100%; box-sizing:border-box; padding:8px 36px 8px 12px; font-size:0.84rem; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;"
            />
            ${g?`
              <button type="button" id="clear-search-btn" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:0.9rem; cursor:pointer;">✕</button>
            `:``}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:0.78rem; color:#64748b;">
          <span>Showing <strong>${e}</strong> curriculum units matching current filter</span>
          ${m!==`All`||h!==`All`||g||_?`
            <button type="button" id="reset-filters-btn" style="background:none; border:none; color:#0284c7; font-weight:700; cursor:pointer; text-decoration:underline;">
              Reset all filters
            </button>
          `:``}
        </div>
      </section>
    `}function D(e){let t=r(e.topicId,e.topicTitle,e.subjectTitle),n=i(e.topicId),a=y.has(e.urn),o=e.lessons&&e.lessons.length>0;e.questions&&e.questions.length;let s=e.stageId===`ks4`||e.stageTitle.includes(`Key Stage 4`);return`
      <article class="curriculum-unit-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03); margin-bottom:1.25rem;">
        <!-- Header row -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:0.75rem;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
              <span style="font-size:0.72rem; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.04em;">
                ${e.stageTitle}
              </span>
              <span style="color:#cbd5e1;">&bull;</span>
              <span style="font-size:0.72rem; font-weight:700; color:#475569;">
                ${e.subjectTitle}
              </span>
              ${s?`
                <span style="font-size:0.68rem; font-weight:800; color:#6d28d9; background:#f3e8ff; border:1px solid #ddd6fe; padding:1px 7px; border-radius:999px;">
                  AQA &bull; Edexcel &bull; OCR
                </span>
              `:``}
              ${e.countryOrRegion?`
                <span style="font-size:0.68rem; font-weight:800; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:1px 8px; border-radius:999px;">
                  🌍 ${c(e.countryOrRegion)}${e.authorOrMinistry?` &bull; ${c(e.authorOrMinistry.split(`/`)[0].trim())}`:``}
                </span>
              `:``}
              <span style="color:#cbd5e1;">&bull;</span>
              <span style="font-size:0.68rem; font-family:monospace; color:#475569; font-weight:600;">
                ${c(e.csn)}
              </span>
            </div>
            <h2 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin:0;">
              ${e.topicTitle}
            </h2>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button type="button" class="speak-axiom-btn" data-axiom="${encodeURIComponent(e.axiom)}" title="Read key idea aloud" style="padding:6px 10px; border-radius:6px; background:#f1f5f9; border:1px solid #e2e8f0; font-size:0.8rem; cursor:pointer; color:#475569;">
              🔊 Listen
            </button>
            <a href="${l}revision?tab=flashcards&amp;deck=curriculum-mesh&amp;stage=${encodeURIComponent(e.stageTitle)}" title="Practise key ideas with active-recall flashcards" style="padding:6px 11px; border-radius:6px; background:#f5f3ff; border:1px solid #ddd6fe; color:#5b21b6; text-decoration:none; font-weight:700; font-size:0.78rem; display:inline-flex; align-items:center; gap:5px;">
              <span>🃏 Flashcards</span>
            </a>
            ${s?`
              <a href="${l}revision?tab=exam&amp;subject=${encodeURIComponent(e.subjectTitle.replace(/\s*\(.*\)/,``))}" title="Practise GCSE 6-mark exam questions &amp; mark schemes" style="padding:6px 11px; border-radius:6px; background:#7c3aed; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem; display:inline-flex; align-items:center; gap:5px;">
                <span>📝 Exam Prep</span>
              </a>
            `:``}
            <a href="${l}practice-lab?stage=${encodeURIComponent(e.stageTitle)}&subject=${encodeURIComponent(e.subjectTitle)}&q=${encodeURIComponent(e.topicTitle)}" title="${n?`Open Interactive Lab Activity`:`Open Practice Lab`}" style="padding:6px 12px; border-radius:6px; background:${n?`#f0fdf4`:`#f8fafc`}; border:1px solid ${n?`#bbf7d0`:`#cbd5e1`}; color:${n?`#166534`:`#0f172a`}; text-decoration:none; font-weight:700; font-size:0.78rem; display:inline-flex; align-items:center; gap:5px;">
              <span>${n?`📊 Interactive Drill`:`🎯 Practice Lab`}</span>
            </a>
            ${t?`
              <a href="${l}player?preset=${t.presetId}" title="${c(t.label)}" style="padding:6px 14px; border-radius:6px; background:#0284c7; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem; display:inline-flex; align-items:center; gap:6px;">
                <span>${t.icon} ${c(t.label)}</span> &rarr;
              </a>
            `:``}
          </div>
        </div>

        <!-- 1. The Core Big Idea -->
        <div style="margin-bottom:12px;">
          <div style="font-size:0.78rem; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">
            💡 1. The Core Big Idea
          </div>
          <p style="font-size:0.92rem; color:#1e293b; line-height:1.55; margin:0; font-weight:500;">
            ${e.axiom}
          </p>
        </div>

        <!-- 2. Step-by-Step Method / Reasoning Scaffold -->
        <div style="margin-bottom:12px; background:#f8fafc; border-left:3px solid #0284c7; padding:10px 14px; border-radius:0 8px 8px 0;">
          <div style="font-size:0.76rem; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">
            📋 2. Step-by-Step Method &amp; Reasoning
          </div>
          <p style="font-size:0.88rem; color:#334155; line-height:1.5; margin:0;">
            ${e.guidedStep}
          </p>
        </div>

        <!-- 3. Cognitive Trap & Misconception Guard -->
        <div style="margin-bottom:12px; background:#fffbeb; border-left:3px solid #f59e0b; padding:10px 14px; border-radius:0 8px 8px 0;">
          <div style="font-size:0.76rem; font-weight:800; color:#92400e; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">
            ⚠️ 3. Watch Out For This Common Misconception
          </div>
          <p style="font-size:0.88rem; color:#78350f; line-height:1.5; margin:0;">
            ${e.cognitiveTrap}
          </p>
        </div>

        <!-- 4. Everyday Hook / Real World Context -->
        ${e.hook?`
          <div style="font-size:0.82rem; color:#64748b; margin-bottom:12px; display:flex; align-items:flex-start; gap:6px;">
            <span style="font-size:0.9rem;">🌍</span>
            <span><strong>Real-World Application:</strong> ${e.hook}</span>
          </div>
        `:``}

        <!-- Lessons Accordion -->
        ${o?`
          <div style="border-top:1px solid #f1f5f9; padding-top:10px; margin-top:8px;">
            <button type="button" class="toggle-lessons-btn" data-urn="${e.urn}" style="background:none; border:none; font-size:0.8rem; font-weight:700; color:#0284c7; cursor:pointer; padding:0; display:inline-flex; align-items:center; gap:4px;">
              <span>${a?`▼`:`▶`} View ${e.lessons.length} Constituent Oak Lessons</span>
            </button>

            ${a?`
              <div style="margin-top:10px; padding:10px 14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
                <div style="font-size:0.74rem; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">
                  Oak National Curriculum Lesson Sequence:
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${e.lessons.map(e=>`
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; color:#1e293b; padding:4px 0; border-bottom:1px dashed #e2e8f0;">
                      <span style="font-weight:600;">${e.title}</span>
                      <span style="font-size:0.72rem; color:#64748b;">Lesson ${e.lessonNumber||`-`}</span>
                    </div>
                  `).join(``)}
                </div>
              </div>
            `:``}
          </div>
        `:``}
      </article>
    `}function O(){let e=n.map(e=>({route:e,sim:r(e.topicId,e.topicTitle,e.subjectTitle)})).filter(e=>e.sim!==null),t=new Set;return`
      <section style="margin-bottom:3rem;">
        <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius:16px; padding:2rem; color:#ffffff; margin-bottom:2rem; border:1px solid #334155;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span style="font-size:1.6rem;">🎮</span>
            <span style="font-size:0.76rem; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.05em;">
              Hands-On Classroom Models &bull; Works 100% Offline
            </span>
          </div>
          <h2 style="font-size:1.85rem; font-weight:800; color:#ffffff; margin:0 0 8px 0;">
            Interactive Curriculum Labs &amp; Simulators
          </h2>
          <p style="font-size:0.96rem; color:#cbd5e1; max-width:800px; margin:0 0 1.5rem 0; line-height:1.6;">
            Explore science experiments, maths manipulatives, computing models, and faith walkthroughs—tested to run smoothly offline on school Chromebooks, tablets, and interactive whiteboards.
          </p>

          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1.25rem;">
            ${e.filter(e=>!t.has(e.sim.presetId)&&(t.add(e.sim.presetId),!0)).map(({route:e,sim:t})=>`
              <div style="background:#090d16; border:1px solid #1e293b; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:1.4rem;">${t.icon}</span>
                    <span style="font-size:0.68rem; background:#1e293b; color:#38bdf8; padding:2px 8px; border-radius:4px; font-weight:700;">
                      ${t.type} &bull; Interactive
                    </span>
                  </div>
                  <h3 style="font-size:1.05rem; font-weight:800; color:#f8fafc; margin:0 0 6px 0;">
                    ${t.label}
                  </h3>
                  <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">
                    ${e.stageTitle} &bull; ${e.subjectTitle}
                  </div>
                  <p style="font-size:0.8rem; color:#64748b; line-height:1.4; margin:0 0 12px 0;">
                    ${e.axiom.slice(0,110)}...
                  </p>
                </div>
                <a href="${l}player?preset=${t.presetId}" style="display:block; text-align:center; padding:8px 12px; border-radius:6px; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.82rem; text-decoration:none;">
                  Open Interactive Lab &rarr;
                </a>
              </div>
            `).join(``)}
          </div>
        </div>
      </section>
    `}function k(){return`
      <!-- Topic Prerequisite Map View -->
      <section style="background:#090d16; border:1px solid #1e293b; border-radius:16px; padding:2rem; color:#ffffff; margin-bottom:2rem; box-shadow:0 8px 30px rgba(0,0,0,0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="font-size:0.75rem; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.05em;">How Subjects Connect Across Key Stages</span>
            <h2 style="font-size:1.6rem; font-weight:800; margin:2px 0 0;">Curriculum Topic Map</h2>
          </div>
          <span style="font-size:0.75rem; background:#1e293b; color:#34d399; padding:4px 10px; border-radius:999px; font-weight:700;">
            Available 100% Offline
          </span>
        </div>
        <p style="font-size:0.92rem; color:#94a3b8; line-height:1.6; margin:0 0 1.75rem 0; max-width:820px;">
          School topics build on one another across years. See how primary foundations in fractions, forces, and faith lead into GCSE physics, chemistry, and theology.
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
          <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:1.25rem;">
            <div style="font-size:0.72rem; color:#38bdf8; font-weight:800; margin-bottom:4px;">MATHEMATICS FOUNDATION</div>
            <h3 style="font-size:1.1rem; color:#f8fafc; margin:0 0 8px 0;">Fractions &amp; Proportions</h3>
            <p style="font-size:0.82rem; color:#94a3b8; margin:0 0 12px 0; line-height:1.4;">
              Primary unit fractions $\rightarrow$ Decimal equivalents $\rightarrow$ Ratios &amp; Rates $\rightarrow$ Linear equations &amp; Probability.
            </p>
            <a href="${l}player?preset=fractions" style="font-size:0.8rem; color:#38bdf8; font-weight:700; text-decoration:none;">
              Open Fraction Sim &rarr;
            </a>
          </div>

          <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:1.25rem;">
            <div style="font-size:0.72rem; color:#34d399; font-weight:800; margin-bottom:4px;">PHYSICAL SCIENCES</div>
            <h3 style="font-size:1.1rem; color:#f8fafc; margin:0 0 8px 0;">Kinetic Gas &amp; Thermodynamics</h3>
            <p style="font-size:0.82rem; color:#94a3b8; margin:0 0 12px 0; line-height:1.4;">
              States of matter (solid/liquid/gas) $\rightarrow$ Particle collision pressure $\rightarrow$ Boyle's &amp; Charles' Laws $\rightarrow$ Thermal equilibrium.
            </p>
            <a href="${l}player?preset=kinetic-gas" style="font-size:0.8rem; color:#34d399; font-weight:700; text-decoration:none;">
              Open Gas Sim &rarr;
            </a>
          </div>

          <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:1.25rem;">
            <div style="font-size:0.72rem; color:#fbbf24; font-weight:800; margin-bottom:4px;">GEOMETRIC REASONING</div>
            <h3 style="font-size:1.1rem; color:#f8fafc; margin:0 0 8px 0;">Pythagoras' Theorem</h3>
            <p style="font-size:0.82rem; color:#94a3b8; margin:0 0 12px 0; line-height:1.4;">
              Right-angle triangles $\rightarrow$ Square area equivalence ($a^2+b^2=c^2$) $\rightarrow$ Trigonometry $\rightarrow$ 3D Vector displacement.
            </p>
            <a href="${l}player?preset=pythagoras" style="font-size:0.8rem; color:#fbbf24; font-weight:700; text-decoration:none;">
              Open Pythagoras Sim &rarr;
            </a>
          </div>

          <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:1.25rem;">
            <div style="font-size:0.72rem; color:#f472b6; font-weight:800; margin-bottom:4px;">ELECTRICAL PHYSICS</div>
            <h3 style="font-size:1.1rem; color:#f8fafc; margin:0 0 8px 0;">Circuits &amp; Ohm's Law</h3>
            <p style="font-size:0.82rem; color:#94a3b8; margin:0 0 12px 0; line-height:1.4;">
              Electron drift charge $\rightarrow$ Series/Parallel current $\rightarrow$ Voltage potential $\rightarrow$ Ohm's resistance ($V = I \times R$).
            </p>
            <a href="${l}player?preset=electric-circuits" style="font-size:0.8rem; color:#f472b6; font-weight:700; text-decoration:none;">
              Open Circuit Sim &rarr;
            </a>
          </div>

          <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:1.25rem;">
            <div style="font-size:0.72rem; color:#a78bfa; font-weight:800; margin-bottom:4px;">SACRED THEOLOGY &amp; WORSHIP</div>
            <h3 style="font-size:1.1rem; color:#f8fafc; margin:0 0 8px 0;">The Liturgy &amp; Eucharist</h3>
            <p style="font-size:0.82rem; color:#94a3b8; margin:0 0 12px 0; line-height:1.4;">
              Sacred Architecture $\rightarrow$ Table of the Word &amp; Table of Eucharist $\rightarrow$ 7 Sacraments $\rightarrow$ Catholic Social Teaching.
            </p>
            <a href="${l}player?preset=church-tour" style="font-size:0.8rem; color:#a78bfa; font-weight:700; text-decoration:none;">
              Open Church Tour &rarr;
            </a>
          </div>
        </div>
      </section>
    `}function A(){let e=x();u.innerHTML=`
      ${T()}
      ${v===`constellation`?k():v===`simulators`?O():`
          ${E(e.length)}
          <div id="learning-zone-units-list">
            ${e.length>0?e.map(D).join(``):`
              <div style="text-align:center; padding:3rem 1rem; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px;">
                <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
                <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a; margin:0 0 6px 0;">No curriculum units found</h3>
                <p style="font-size:0.86rem; color:#64748b; margin:0 0 1rem 0;">
                  No topics match your current filter selection. Try clearing your search or picking 'All' Key Stages.
                </p>
                <button type="button" id="empty-reset-btn" style="padding:6px 14px; border-radius:6px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.82rem; cursor:pointer;">
                  Clear All Filters
                </button>
              </div>
            `}
          </div>
        `}
    `,u.querySelector(`#tab-btn-curriculum`)?.addEventListener(`click`,()=>{v=`curriculum`,A()}),u.querySelector(`#tab-btn-simulators`)?.addEventListener(`click`,()=>{v=`simulators`,A()}),u.querySelector(`#tab-btn-constellation`)?.addEventListener(`click`,()=>{v=`constellation`,A()});let t=u.querySelector(`#filter-stage-select`);t?.addEventListener(`change`,()=>{m=t.value,A()});let n=u.querySelector(`#filter-subject-select`);n?.addEventListener(`change`,()=>{h=n.value,A()});let r=u.querySelector(`#filter-sim-only`);r?.addEventListener(`change`,()=>{_=r.checked,A()});let i=u.querySelector(`#filter-search-input`);i?.addEventListener(`input`,()=>{g=i.value,A();let e=u.querySelector(`#filter-search-input`);e&&(e.focus(),e.setSelectionRange(g.length,g.length))}),u.querySelector(`#clear-search-btn`)?.addEventListener(`click`,()=>{g=``,A()});let a=()=>{m=`All`,h=`All`,g=``,_=!1,A()};u.querySelector(`#reset-filters-btn`)?.addEventListener(`click`,a),u.querySelector(`#empty-reset-btn`)?.addEventListener(`click`,a),u.querySelectorAll(`.speak-axiom-btn`).forEach(e=>{e.addEventListener(`click`,()=>{w(decodeURIComponent(e.getAttribute(`data-axiom`)||``))})}),u.querySelectorAll(`.toggle-lessons-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-urn`);t&&(y.has(t)?y.delete(t):y.add(t),A())})})}let j=()=>{u.isConnected?(f&&f!==`All`&&n.some(e=>e.stageTitle===f)&&(m=f),A()):window.removeEventListener(`curriculum_mesh_updated`,j)};return window.addEventListener(`curriculum_mesh_updated`,j),s().then(()=>{t()}),A(),u}export{l as default,l as renderLearningZonePage};