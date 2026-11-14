import{C as e,O as t,g as n,v as r,x as i,y as a}from"./bsl-engine-WyGKDEoT.js";import{n as o}from"./jotter-db-C3nAur4m.js";var s=`school_learner_profile`,c=[`Curious`,`Bright`,`Quick`,`Eager`,`Stargazing`,`Brave`,`Wise`,`Clever`,`Inventive`],l=[`Owl`,`Falcon`,`Dolphin`,`Otter`,`Fox`,`Robin`,`Cheetah`,`Wolf`,`Explorer`],u=[`🦉`,`🦅`,`🐬`,`🦦`,`🦊`,`🐦`,`🐆`,`🐺`,`🔬`,`🚀`,`🌟`,`📚`];function d(e){return e.replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e]||e)}function f(){let e=c[Math.floor(Math.random()*c.length)],t=l[Math.floor(Math.random()*l.length)],n=u[Math.floor(Math.random()*u.length)];return{alias:`${e} ${t}`,avatar:n}}function p(){if(typeof window>`u`)return{alias:`Curious Explorer`,avatarEmoji:`🦉`,keyStage:`Key Stage 2`,cohortCode:`Primary Group`,createdAt:Date.now(),starsEarned:0,streakPeak:0};try{let e=n(s);if(e){let t=JSON.parse(e);return{alias:t.alias??`Curious Explorer`,avatarEmoji:t.avatarEmoji??`🦉`,keyStage:t.keyStage??`Key Stage 2`,cohortCode:t.cohortCode??`Primary Group`,createdAt:t.createdAt??Date.now(),starsEarned:t.starsEarned??0,streakPeak:t.streakPeak??0,currentStreak:t.currentStreak??0}}}catch(e){console.warn(`[ProfileStore] Error parsing stored profile:`,e)}let e=f(),t={alias:e.alias,avatarEmoji:e.avatar,keyStage:`Key Stage 2`,cohortCode:`Primary Group`,createdAt:Date.now(),starsEarned:0,streakPeak:0};try{a(s,JSON.stringify(t))}catch(e){console.warn(`[ProfileStore] Error setting initial profile:`,e)}return t}function m(e){if(typeof window>`u`)return e;let t={...p(),...e};try{a(s,JSON.stringify(t)),window.dispatchEvent(new CustomEvent(`learner_profile_updated`,{detail:t}))}catch(e){console.warn(`[ProfileStore] Error saving learner profile:`,e)}return t}function h(e){return e?(e.includes(`:`)?e.split(`:`).pop()||e:e.replace(/^phet[-_]/i,``)).split(/[_-]/).filter(Boolean).map(e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(` `):`General Study`}function g(e){let t=(e||``).toLowerCase();if(!t)return`GENERAL`;if(t.includes(`:`)){let e=t.split(`:`),n=e.length>=2&&/^ks\d/.test(e[0])?e[1]:e[0];return n.startsWith(`sci`)||n.includes(`phys`)||n.includes(`chem`)||n.includes(`bio`)?`SCIENCE`:n.startsWith(`math`)?`MATHEMATICS`:n.startsWith(`eng`)||n.includes(`phonics`)||n.includes(`shakespeare`)?`ENGLISH`:n.startsWith(`comp`)?`COMPUTING`:n.startsWith(`re`)||n.includes(`catholic`)||n.includes(`relig`)?`RELIGIOUS EDUCATION`:n.startsWith(`mfl`)||n.includes(`lang`)||n.includes(`french`)||n.includes(`spanish`)||n.includes(`latin`)?`MODERN LANGUAGES`:n.includes(`hist`)?`HISTORY`:n.includes(`geog`)?`GEOGRAPHY`:n.replace(/_/g,` `).toUpperCase()}return/phet|atom|dna|circuit|gas|pendulum|faraday|ohm|acid|solar|water-cycle|photosynthesis|fish-tank|velocity|vector-racing/.test(t)?`SCIENCE`:/fraction|pythagoras|bodmas|algebra|calculus|times-tables|domino|math|elevation/.test(t)?`MATHEMATICS`:/bbc-model|lego/.test(t)?`COMPUTING & DT`:/phonics|spelling|shakespeare|macbeth/.test(t)?`ENGLISH`:/bsl|languages|latin/.test(t)?`LANGUAGES & BSL`:/mass|sacrament|church|altar|liturg|communion|holy|nicene|cst|rosary|station|commandment|triduum|catholic|eucharist/.test(t)?`RELIGIOUS EDUCATION`:t.split(/[-_]/)[0].toUpperCase()}function _(e){return e>=85?`Exceeding / Mastered`:e>=70?`Secure (Expected Standard)`:e>=50?`Developing`:`Emerging`}async function v(e){let n=p(),r=e.isCorrect?(n.currentStreak??0)+1:0,i=Math.max(n.streakPeak??0,r);m({starsEarned:(n.starsEarned??0)+(e.isCorrect?10:0),currentStreak:r,streakPeak:i}),await t({cohortCode:n.cohortCode||`Primary Group`,challengeId:e.challengeId,topicId:e.topicId||`general_practice`,answeredAt:Date.now(),isCorrect:e.isCorrect,userAnswer:e.userAnswer,errorTag:e.errorTag}),typeof window<`u`&&window.dispatchEvent(new CustomEvent(`learner_progress_recorded`,{detail:e}))}async function y(){let t=p(),n=await e(),r=n.length,i=n.filter(e=>e.isCorrect).length,a=r>0?Math.round(i/r*100):0,o=new Map;for(let e of n){let t=e.topicId||`general_practice`,n=o.get(t)||{attempts:0,correct:0};n.attempts+=1,e.isCorrect&&(n.correct+=1),o.set(t,n)}let s=[],c=0;o.forEach((e,t)=>{let n=e.attempts>0?Math.round(e.correct/e.attempts*100):0,r=`Exploring`;e.attempts>=3&&n>=80?(r=`Mastered`,c+=1):e.attempts>=2&&(r=`Practicing`),s.push({topicId:t,displayName:h(t),attempts:e.attempts,correctCount:e.correct,accuracyPercent:n,status:r})}),s.sort((e,t)=>t.attempts-e.attempts);let l=[...n].sort((e,t)=>(t.answeredAt||t.timestamp||0)-(e.answeredAt||e.timestamp||0)).slice(0,15);return{profile:t,totalAttempts:r,totalCorrect:i,overallAccuracy:a,topicsPracticedCount:o.size,topicsMasteredCount:c,topicBreakdown:s,recentHistory:l}}async function b(){typeof window<`u`&&(r(s),r(`curriculum_standard`),r(`oak_curriculum_standard`)),await i();try{await o()}catch(e){console.warn(`[ProfileStore] Failed to clear Jotter DB:`,e)}typeof window<`u`&&window.dispatchEvent(new CustomEvent(`learner_profile_purged`))}async function x(){if(typeof window>`u`)return;let e=await y(),t={standard:`St Joseph UK Curriculum Offline Learning Passport`,gdprCompliant:!0,dataSovereignty:`Client-Device Local Only (Zero Cloud Telemetry)`,exportedAt:new Date().toISOString(),profile:e.profile,summary:{totalQuestionsAnswered:e.totalAttempts,correctAnswers:e.totalCorrect,overallAccuracyPercent:e.overallAccuracy,topicsPracticed:e.topicsPracticedCount,topicsMastered:e.topicsMasteredCount},topicsMastery:e.topicBreakdown,recentLog:e.recentHistory},n=JSON.stringify(t,null,2),r=new Blob([n],{type:`application/json`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`learning_passport_${e.profile.alias.replace(/\s+/g,`_`)}.json`,a.click(),URL.revokeObjectURL(i)}async function S(){if(typeof window>`u`)return;let e=await y(),t=e.profile,n=new Date().toISOString().split(`T`)[0],r=[`Student_Identifier`,`Student_Alias`,`Key_Stage`,`Cohort_Code`,`Subject_Domain`,`Curriculum_Objective`,`Questions_Attempted`,`Questions_Correct`,`Score_Percentage`,`Attainment_Band`,`Mastery_Status`,`Assessment_Date`,`MIS_Target_System`],i=[];for(let r of e.topicBreakdown){let e=_(r.accuracyPercent);i.push([t.alias,t.alias,t.keyStage,t.cohortCode,g(r.topicId),r.displayName,String(r.attempts),String(r.correctCount),`${r.accuracyPercent}%`,e,r.status===`Mastered`?`MASTERED`:`IN_PROGRESS`,n,`Arbor / Bromcom / SIMS Compatible`])}i.length===0&&i.push([t.alias,t.alias,t.keyStage,t.cohortCode,`GENERAL`,`Overall Curriculum Progress`,String(e.totalAttempts),String(e.totalCorrect),`${e.overallAccuracy}%`,e.overallAccuracy>=80?`Secure`:`Developing`,e.totalAttempts>0?`ACTIVE`:`NO_DATA`,n,`Arbor / Bromcom / SIMS Compatible`]);let a=e=>e.includes(`,`)||e.includes(`"`)||e.includes(`
`)||e.includes(`\r`)?`"${e.replace(/"/g,`""`)}"`:e,o=[r.map(a).join(`,`),...i.map(e=>e.map(a).join(`,`))].join(`\r
`),s=new Blob([o],{type:`text/csv;charset=utf-8;`}),c=URL.createObjectURL(s),l=document.createElement(`a`);l.href=c,l.download=`arbor_mis_assessment_${t.alias.replace(/\s+/g,`_`)}_${n}.csv`,l.click(),URL.revokeObjectURL(c)}async function C(){if(typeof window>`u`)return;let e=await y(),t=e.profile,n=d(t.alias),r=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Learning Passport: ${n}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem; }
    .passport-card { max-width: 720px; margin: 0 auto; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 2.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .badge-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    .avatar { font-size: 3.5rem; background: #eff6ff; border-radius: 50%; width: 75px; height: 75px; display: flex; align-items: center; justify-content: center; border: 2px solid #bfdbfe; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; text-align: center; }
    .stat-val { font-size: 1.75rem; font-weight: 800; color: #2563eb; }
    .stat-lbl { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
    .topic-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; }
    .mastered-badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; }
    .practicing-badge { background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; }
    .footer-note { margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #cbd5e1; font-size: 0.8rem; color: #64748b; text-align: center; }
    @media print { body { background: #ffffff; padding: 0; } .passport-card { box-shadow: none; border: 1px solid #000; } }
  </style>
</head>
<body>
  <div class="passport-card">
    <div class="badge-bar">
      <div style="display: flex; align-items: center; gap: 1.25rem;">
        <div class="avatar">${d(t.avatarEmoji)}</div>
        <div>
          <h1 style="margin: 0; font-size: 1.75rem; color: #0f172a;">${n}</h1>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.95rem;">${d(t.keyStage)} • Cohort: ${d(t.cohortCode)}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 0.85rem; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 8px;">
          Offline-Verified Passport
        </span>
        <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px;">Date: ${new Date().toLocaleDateString(`en-GB`)}</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-val">${e.totalAttempts}</div>
        <div class="stat-lbl">Questions Done</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${e.overallAccuracy}%</div>
        <div class="stat-lbl">Accuracy</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${e.topicsMasteredCount}</div>
        <div class="stat-lbl">Units Mastered</div>
      </div>
    </div>

    <h2 style="font-size: 1.15rem; color: #0f172a; margin-bottom: 0.75rem;">Curriculum Mastery Index</h2>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
      ${e.topicBreakdown.length>0?e.topicBreakdown.map(e=>`
        <div class="topic-row">
          <div>
            <strong>${d(e.displayName)}</strong>
            <div style="font-size: 0.8rem; color: #64748b;">${e.correctCount}/${e.attempts} correct (${e.accuracyPercent}%)</div>
          </div>
          <span class="${e.status===`Mastered`?`mastered-badge`:`practicing-badge`}">${e.status}</span>
        </div>`).join(``):`<div style="padding: 1.5rem; text-align: center; color: #94a3b8;">No topics practiced yet on this device.</div>`}
    </div>

    <div class="footer-note">
      🔒 <strong>Privacy Assured:</strong> Generated 100% on-device by St Joseph's Offline Curriculum Portal. No student data was transmitted to external servers.
    </div>
  </div>
</body>
</html>`,i=new Blob([r],{type:`text/html`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=`learning_certificate_${n.replace(/\s+/g,`_`)}.html`,o.click(),URL.revokeObjectURL(a)}export{_ as computeAttainmentBand,C as downloadLearnerCertificateHtml,S as exportLearnerArborCsv,x as exportLearnerPassportJson,h as formatTopicTitle,f as generateRandomAlias,y as getLearnerAnalytics,p as getLearnerProfile,g as inferMisSubjectDomain,b as purgeAllLearnerData,v as recordAssessmentAttempt,m as saveLearnerProfile};