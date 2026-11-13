import{l as e,m as t}from"./cartridge-vault-Bk3CgVQM.js";import{r as n}from"./index-Y4aRCSfU.js";import{downloadLearnerCertificateHtml as r,exportLearnerArborCsv as i,exportLearnerPassportJson as a,getLearnerAnalytics as o}from"./studentProfileStore-8jYkgwjD.js";function s(e){return(e||``).replace(/[&<>'"]/g,e=>{switch(e){case`&`:return`&amp;`;case`<`:return`&lt;`;case`>`:return`&gt;`;case`'`:return`&#39;`;case`"`:return`&quot;`;default:return e}})}function c(){let c=t(),l=document.createElement(`div`);l.className=`stj-page-shell`;async function u(){let t=await o(),u=t.profile;l.innerHTML=`
      <header>
        <nav class="stj-breadcrumb" aria-label="Breadcrumb">
          <a href="${c}">Home</a>
          <span class="stj-meta-separator" aria-hidden="true">/</span>
          <span class="stj-breadcrumb-current">Teacher Beacon &amp; MIS Console</span>
        </nav>
        <h1 class="stj-page-heading">Classroom Synchronizer &amp; MIS Markbook Console</h1>
        <p class="stj-page-lead">
          Broadcast interactive 60 FPS cartridges to pupil devices over local peer channels and export RFC 4180 attainment sheets directly into Arbor, Bromcom, or ESS SIMS.
        </p>
      </header>

      <!-- 01. Broadcast Command Center -->
      <section class="stj-card" aria-labelledby="beacon-broadcast-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="beacon-broadcast-heading" class="stj-section-title">01. Classroom Cartridge Broadcast</h2>
            <p class="stj-section-subtitle">
              Push any verified simulation scene to connected classroom Chromebooks, smartboards, and tablets with zero cloud latency.
            </p>
          </div>
          <div class="stj-meta-strip tabular-nums">
            <span>${e.length} verified cartridges ready</span>
          </div>
        </div>

        <div class="stj-beacon-controls">
          <label for="beacon-cartridge-select" class="sr-only">Select curriculum cartridge to broadcast</label>
          <select id="beacon-cartridge-select" class="stj-select stj-beacon-select">
            ${e.map(e=>`<option value="${s(e.id)}">${s(e.label)} (${s(e.stage)})</option>`).join(``)}
          </select>
          <button type="button" id="btn-broadcast-scene" class="stj-btn stj-btn-primary">
            Broadcast to Class
          </button>
          <a href="${c}player?preset=${encodeURIComponent(e[0]?.id||`kinetic-gas`)}" id="link-preview-selected" class="stj-btn stj-btn-secondary">
            Open Selected Lab
          </a>
        </div>

        <div id="beacon-toast" role="status" aria-live="polite" class="stj-status-notice stj-status-notice-success stj-mt-4 stj-hidden"></div>
      </section>

      <!-- 02. UK MIS Markbook & Attainment Export -->
      <section class="stj-card" aria-labelledby="beacon-mis-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="beacon-mis-heading" class="stj-section-title">02. Arbor, Bromcom &amp; ESS SIMS Assessment Export</h2>
            <p class="stj-section-subtitle">
              Export local device checkpoint mastery into a direct-import MIS CSV sheet mapped to UK National Curriculum attainment bands.
            </p>
          </div>
          <div class="stj-meta-strip">
            <span>Identifier: ${s(u.alias)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <span>Cohort: ${s(u.cohortCode)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <a href="${c}profile">Edit Cohort / UPN</a>
          </div>
        </div>

        <div class="stj-stat-grid stj-mb-5">
          <div class="stj-stat-card">
            <span class="stj-stat-label">Recorded Attempts</span>
            <strong class="stj-stat-value tabular-nums">${t.totalAttempts}</strong>
            <span class="stj-stat-desc">Checkpoints &amp; drills</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Cohort Accuracy</span>
            <strong class="stj-stat-value tabular-nums">${t.overallAccuracy}%</strong>
            <span class="stj-stat-desc">${t.totalCorrect} correct responses</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Units Practiced</span>
            <strong class="stj-stat-value tabular-nums">${t.topicsPracticedCount}</strong>
            <span class="stj-stat-desc">${t.topicsMasteredCount} units mastered</span>
          </div>
        </div>

        <div class="stj-action-row">
          <button type="button" id="btn-teacher-arbor-csv" class="stj-btn stj-btn-primary">
            Export Arbor / Bromcom / SIMS CSV
          </button>
          <button type="button" id="btn-teacher-certificate" class="stj-btn stj-btn-secondary">
            Printable Progress Certificate
          </button>
          <button type="button" id="btn-teacher-passport" class="stj-btn stj-btn-secondary">
            Export JSON Learning Passport
          </button>
        </div>

        <div id="mis-export-toast" role="status" aria-live="polite" class="stj-status-notice stj-status-notice-success stj-mt-4 stj-hidden"></div>
      </section>
    `;let d=l.querySelector(`#beacon-cartridge-select`),f=l.querySelector(`#link-preview-selected`),p=l.querySelector(`#beacon-toast`),m=l.querySelector(`#mis-export-toast`);d?.addEventListener(`change`,()=>{f&&d.value&&(f.href=`${c}player?preset=${encodeURIComponent(d.value)}`)}),l.querySelector(`#btn-broadcast-scene`)?.addEventListener(`click`,()=>{let e=d?.value;e&&(n.broadcastAstScene(e),p&&(p.textContent=`Broadcasted cartridge "${e}" to active classroom devices.`,p.classList.remove(`stj-hidden`)))});let h=e=>{m&&(m.textContent=e,m.classList.remove(`stj-hidden`))};l.querySelector(`#btn-teacher-arbor-csv`)?.addEventListener(`click`,async()=>{await i(),h(`Exported RFC 4180 assessment CSV for Arbor, Bromcom, and ESS SIMS.`)}),l.querySelector(`#btn-teacher-certificate`)?.addEventListener(`click`,async()=>{await r(),h(`Downloaded printable HTML Progress Certificate.`)}),l.querySelector(`#btn-teacher-passport`)?.addEventListener(`click`,async()=>{await a(),h(`Exported portable JSON Learning Passport.`)})}return u(),l}export{c as default,c as renderTeacherBeaconPage};