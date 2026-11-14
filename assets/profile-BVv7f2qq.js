import{m as e}from"./cartridge-vault-C_ymVyNu.js";import{computeAttainmentBand as t,downloadLearnerCertificateHtml as n,exportLearnerArborCsv as r,exportLearnerPassportJson as i,formatTopicTitle as a,generateRandomAlias as o,getLearnerAnalytics as s,inferMisSubjectDomain as c,purgeAllLearnerData as l,saveLearnerProfile as u}from"./studentProfileStore-Cx3CQ1Mg.js";var d=[`Key Stage 1`,`Key Stage 2`,`Key Stage 3`,`Key Stage 4`];function f(e){return(e||``).replace(/[&<>'"]/g,e=>{switch(e){case`&`:return`&amp;`;case`<`:return`&lt;`;case`>`:return`&gt;`;case`'`:return`&#39;`;case`"`:return`&quot;`;default:return e}})}function p(e){return e===`Mastered`?{text:`✓ Mastered`,cls:`stj-status-mastered`}:e===`Practicing`?{text:`↗ Practicing`,cls:`stj-status-practicing`}:{text:`· Exploring`,cls:`stj-status-exploring`}}function m(){let m=e(),h=document.createElement(`div`);h.className=`stj-page-shell`;let g=!1,_=``,v=`neutral`;function y(e,t=`success`){_=e,v=t;let n=h.querySelector(`#profile-status-banner`);n&&(n.className=`stj-status-notice ${t===`success`?`stj-status-notice-success`:t===`danger`?`stj-status-notice-danger`:``}`,n.textContent=e)}async function b(){let e=await s(),x=e.profile;h.innerHTML=`
      <header>
        <nav class="stj-breadcrumb" aria-label="Breadcrumb">
          <a href="${m}">Home</a>
          <span class="stj-meta-separator" aria-hidden="true">/</span>
          <span class="stj-breadcrumb-current">Student Progress &amp; MIS Passport</span>
        </nav>
        <h1 class="stj-page-heading">Learner Progress &amp; School MIS Assessment Passport</h1>
        <p class="stj-page-lead">
          All checkpoint answers, simulator mastery records, and attainment bands are stored strictly on this device in IndexedDB with zero cloud telemetry.
        </p>
      </header>

      <div id="profile-status-banner" role="status" aria-live="polite" class="${_?`stj-status-notice ${v===`success`?`stj-status-notice-success`:v===`danger`?`stj-status-notice-danger`:``}`:`stj-status-notice stj-hidden`}">${f(_)}</div>

      <!-- KPI Overview -->
      <section aria-label="Mastery Summary">
        <div class="stj-stat-grid">
          <div class="stj-stat-card">
            <span class="stj-stat-label">Questions Answered</span>
            <strong class="stj-stat-value tabular-nums">${e.totalAttempts}</strong>
            <span class="stj-stat-desc">${e.totalCorrect} correct responses</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Overall Accuracy</span>
            <strong class="stj-stat-value tabular-nums">${e.overallAccuracy}%</strong>
            <span class="stj-stat-desc">${f(t(e.overallAccuracy))}</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Units Mastered</span>
            <strong class="stj-stat-value tabular-nums">${e.topicsMasteredCount}</strong>
            <span class="stj-stat-desc">${e.topicsPracticedCount} curriculum units practiced</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Mastery Points &amp; Streak</span>
            <strong class="stj-stat-value tabular-nums">${x.starsEarned} pts</strong>
            <span class="stj-stat-desc">Peak streak: ${x.streakPeak} in a row</span>
          </div>
        </div>
      </section>

      <!-- Learner Identity & Cohort Tagging for Arbor / Bromcom / SIMS -->
      <section class="stj-card" aria-labelledby="identity-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="identity-heading" class="stj-section-title">01. Learner Identifier &amp; Cohort Configuration</h2>
            <p class="stj-section-subtitle">
              Set an anonymised pupil alias or school MIS identifier and cohort code before exporting marks to Arbor, Bromcom, or ESS SIMS.
            </p>
          </div>
          <div class="stj-meta-strip">
            <span>${f(x.avatarEmoji)} ${f(x.alias)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <span>${f(x.keyStage)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <span>${f(x.cohortCode)}</span>
          </div>
        </div>

        <form id="learner-identity-form" class="stj-identity-grid">
          <div class="stj-field-group">
            <label for="input-learner-alias" class="stj-field-label">Student Alias or MIS Identifier</label>
            <input
              id="input-learner-alias"
              class="stj-input"
              type="text"
              maxlength="48"
              value="${f(x.alias)}"
              placeholder="e.g. Curious Owl or UPN-8042"
              required
            />
          </div>

          <div class="stj-field-group">
            <label for="select-learner-stage" class="stj-field-label">Key Stage</label>
            <select id="select-learner-stage" class="stj-select">
              ${d.map(e=>`<option value="${f(e)}" ${x.keyStage===e?`selected`:``}>${f(e)}</option>`).join(``)}
            </select>
          </div>

          <div class="stj-field-group">
            <label for="input-cohort-code" class="stj-field-label">Cohort / Class Code</label>
            <input
              id="input-cohort-code"
              class="stj-input"
              type="text"
              maxlength="36"
              value="${f(x.cohortCode)}"
              placeholder="e.g. 8B-SCI or Primary Group"
              required
            />
          </div>

          <div class="stj-action-row">
            <button type="submit" class="stj-btn stj-btn-primary">Save Learner Details</button>
            <button type="button" id="btn-randomize-alias" class="stj-btn stj-btn-secondary">Randomize Alias</button>
          </div>
        </form>
      </section>

      <!-- UK MIS Assessment Export & GDPR Data Sovereignty -->
      <section class="stj-card" aria-labelledby="exports-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="exports-heading" class="stj-section-title">02. School MIS Export &amp; Offline Certificates</h2>
            <p class="stj-section-subtitle">
              Download RFC 4180 markbook sheets formatted for Arbor, Bromcom, and ESS SIMS, print an offline mastery certificate, or exercise UK GDPR Articles 17 &amp; 20 rights.
            </p>
          </div>
        </div>

        <div class="stj-action-row-between">
          <div class="stj-action-row">
            <button type="button" id="btn-export-arbor-csv" class="stj-btn stj-btn-primary">
              Export Arbor / SIMS CSV
            </button>
            <button type="button" id="btn-download-certificate" class="stj-btn stj-btn-secondary">
              Download Printable Certificate
            </button>
            <button type="button" id="btn-export-passport-json" class="stj-btn stj-btn-secondary">
              Export JSON Passport
            </button>
          </div>

          <div class="stj-action-row">
            ${g?`
                  <span class="stj-meta-strip">Confirm permanent local wipe?</span>
                  <button type="button" id="btn-confirm-erase" class="stj-btn stj-btn-danger">Yes, Erase Everything</button>
                  <button type="button" id="btn-cancel-erase" class="stj-btn stj-btn-secondary">Cancel</button>
                `:`
                  <button type="button" id="btn-open-erase" class="stj-btn stj-btn-ghost">
                    Erase Local Data (GDPR Art. 17)
                  </button>
                `}
          </div>
        </div>
      </section>

      <!-- Curriculum Mastery Breakdown -->
      <section class="stj-card" aria-labelledby="mastery-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="mastery-heading" class="stj-section-title">03. Curriculum Mastery Breakdown</h2>
            <p class="stj-section-subtitle">
              Unit-by-unit attainment across simulator checkpoints and Practice Lab diagnostics (Mastered requires at least 3 attempts at 80%+ accuracy).
            </p>
          </div>
        </div>

        ${e.topicBreakdown.length===0?`
              <div class="stj-empty-panel">
                <h3 class="stj-empty-title">No checkpoint attempts recorded on this device yet</h3>
                <p class="stj-empty-desc">
                  Answer formative checkpoints inside any interactive 60 FPS simulator or complete curriculum drills in the Practice Arena to populate your Arbor / SIMS assessment table.
                </p>
                <div class="stj-action-row-center">
                  <a href="${m}practice-lab" class="stj-btn stj-btn-primary">Open Practice Arena</a>
                  <a href="${m}player?preset=phet-acid-base" class="stj-btn stj-btn-secondary">Launch Interactive Lab</a>
                </div>
              </div>
            `:`
              <div class="stj-table-wrap">
                <table class="stj-table">
                  <thead>
                    <tr>
                      <th scope="col">Curriculum Objective</th>
                      <th scope="col">MIS Domain</th>
                      <th scope="col" class="stj-table-num">Attempts</th>
                      <th scope="col" class="stj-table-num">Correct</th>
                      <th scope="col" class="stj-table-num">Score</th>
                      <th scope="col">UK Attainment Band</th>
                      <th scope="col">Mastery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${e.topicBreakdown.map(e=>{let n=p(e.status);return`
                          <tr>
                            <td><strong>${f(e.displayName)}</strong></td>
                            <td>${f(c(e.topicId))}</td>
                            <td class="stj-table-num">${e.attempts}</td>
                            <td class="stj-table-num">${e.correctCount}</td>
                            <td class="stj-table-num">${e.accuracyPercent}%</td>
                            <td>${f(t(e.accuracyPercent))}</td>
                            <td><span class="${n.cls}">${n.text}</span></td>
                          </tr>
                        `}).join(``)}
                  </tbody>
                </table>
              </div>
            `}
      </section>

      <!-- Recent Assessment Log -->
      ${e.recentHistory.length>0?`
            <section class="stj-card" aria-labelledby="history-heading">
              <div class="stj-section-header">
                <div>
                  <h2 id="history-heading" class="stj-section-title">04. Recent Checkpoint Log</h2>
                  <p class="stj-section-subtitle">Latest 15 milestone-gated responses recorded locally on this device.</p>
                </div>
              </div>
              <div class="stj-log-list">
                ${e.recentHistory.map(e=>{let t=e.answeredAt?new Date(e.answeredAt).toLocaleString(`en-GB`,{dateStyle:`short`,timeStyle:`short`}):`Recorded`;return`
                      <div class="stj-log-row">
                        <div class="stj-meta-strip">
                          <span class="${e.isCorrect?`stj-status-mastered`:`stj-status-exploring`}">${e.isCorrect?`✓ Correct`:`✕ Review`}</span>
                          <span class="stj-meta-separator" aria-hidden="true">·</span>
                          <strong>${f(a(e.topicId))}</strong>
                          <span class="stj-meta-separator" aria-hidden="true">·</span>
                          <span>${f(c(e.topicId))}</span>
                        </div>
                        <div class="stj-meta-strip tabular-nums">
                          <span>Cohort: ${f(e.cohortCode||x.cohortCode)}</span>
                          <span class="stj-meta-separator" aria-hidden="true">·</span>
                          <span>${f(t)}</span>
                        </div>
                      </div>
                    `}).join(``)}
              </div>
            </section>
          `:``}
    `,h.querySelector(`#learner-identity-form`)?.addEventListener(`submit`,e=>{e.preventDefault();let t=h.querySelector(`#input-learner-alias`),n=h.querySelector(`#select-learner-stage`),r=h.querySelector(`#input-cohort-code`),i=(t?.value||``).trim()||x.alias,a=n?.value||x.keyStage,o=(r?.value||``).trim()||`Primary Group`;u({alias:i,keyStage:a,cohortCode:o}),y(`Saved learner identifier "${i}" (${a} · ${o}).`,`success`),b()}),h.querySelector(`#btn-randomize-alias`)?.addEventListener(`click`,()=>{let e=o();u({alias:e.alias,avatarEmoji:e.avatar}),y(`Assigned new anonymised alias: ${e.avatar} ${e.alias}.`,`success`),b()}),h.querySelector(`#btn-export-arbor-csv`)?.addEventListener(`click`,async()=>{await r(),y(`Downloaded Arbor / Bromcom / ESS SIMS assessment CSV file.`,`success`)}),h.querySelector(`#btn-download-certificate`)?.addEventListener(`click`,async()=>{await n(),y(`Downloaded printable offline Learning Certificate (.html).`,`success`)}),h.querySelector(`#btn-export-passport-json`)?.addEventListener(`click`,async()=>{await i(),y(`Exported UK GDPR Art. 20 Learning Passport (.json).`,`success`)}),h.querySelector(`#btn-open-erase`)?.addEventListener(`click`,()=>{g=!0,b()}),h.querySelector(`#btn-cancel-erase`)?.addEventListener(`click`,()=>{g=!1,b()}),h.querySelector(`#btn-confirm-erase`)?.addEventListener(`click`,async()=>{g=!1,await l(),y(`All local progress records, jotter notes, and learner identifiers have been permanently erased.`,`danger`),b()})}let x=()=>{h.isConnected?b():(window.removeEventListener(`learner_progress_recorded`,x),window.removeEventListener(`learner_profile_purged`,x))};return window.addEventListener(`learner_progress_recorded`,x),window.addEventListener(`learner_profile_purged`,x),b(),h}export{m as default,m as renderProfilePage};