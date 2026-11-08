import{_ as e,b as t,d as n,f as r,g as i,h as a,i as o,n as s,t as c,u as l,v as u,x as d,y as f}from"./index-BP-E0K2R.js";import{t as p}from"./EdgeCognitiveEngine-C4EDP8IX.js";function m(e){if(!e.isOpen)return null;let{embedTargetMode:t,setEmbedTargetMode:n,copiedEmbed:r,onCopyEmbedCode:i,embedCode:a}=e,o=document.createElement(`div`);o.className=`ast-player-embed-modal`,o.style.cssText=`
    background: var(--stj-surface-raised, #0f172a);
    border-bottom: 1px solid var(--stj-border, #334155);
    padding: 12px 16px;
    font-size: 0.82rem;
    color: var(--stj-text, #f8fafc);
  `;let s=document.createElement(`div`);s.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;`;let c=document.createElement(`div`);c.style.cssText=`display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`;let l=document.createElement(`span`);l.style.fontWeight=`600`,l.textContent=`Embed for Canvas, Moodle, or Google Classroom:`,c.appendChild(l);let u=document.createElement(`div`);u.style.cssText=`display: inline-flex; align-items: center; gap: 4px;`;let d=document.createElement(`span`);d.style.cssText=`font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8);`,d.textContent=`Target Audience:`,u.appendChild(d);let f=document.createElement(`select`);f.className=`stj-select`,f.style.cssText=`padding: 2px 6px; font-size: 0.74rem; min-height: 26px; background: #1e293b; color: #fff; border: 1px solid #334155; border-radius: 4px;`,f.innerHTML=`
    <option value="classroom" ${t===`classroom`?`selected`:``}>🎓 Classroom (Clean Whiteboard)</option>
    <option value="student" ${t===`student`?`selected`:``}>🎒 Student Focus (Distraction-Free)</option>
    <option value="developer" ${t===`developer`?`selected`:``}>🛠️ Developer (Full Suite)</option>
  `,f.onchange=e=>{n(e.target.value)},u.appendChild(f),c.appendChild(u),s.appendChild(c);let p=document.createElement(`button`);p.type=`button`,p.className=`stj-btn ${r?`stj-btn-success`:`stj-btn-primary`} stj-btn-sm`,p.style.cssText=`min-height: 28px; padding: 3px 9px; cursor: pointer;`,p.textContent=r?`✓ Copied!`:`Copy Code`,p.onclick=i,s.appendChild(p),o.appendChild(s);let m=document.createElement(`code`);return m.style.cssText=`
    display: block;
    background: var(--stj-canvas, #090d16);
    border: 1px solid var(--stj-border, #334155);
    padding: 8px;
    border-radius: var(--stj-radius-sm, 6px);
    font-size: 0.74rem;
    color: var(--stj-primary, #38bdf8);
    overflow-x: auto;
    word-break: break-all;
    font-family: monospace;
  `,m.textContent=a,o.appendChild(m),o}var h=[/\b(kill\s*myself|end\s*my\s*life|commit\s*suicide|want\s*to\s*die|suicidal)\b/i,/\b(hurt\s*myself|cutting\s*myself|self\s*harm|cut\s*my\s*wrists)\b/i,/\b(nobody\s*loves\s*me|i\s*hate\s*my\s*life|want\s*to\s*disappear)\b/i,/\b(someone\s*is\s*hurting\s*me|being\s*abused|scared\s*to\s*go\s*home)\b/i],g=[/\b(how\s*to\s*make\s*(a\s*)?(bomb|weapon|explosive|gun))\b/i,/\b(shoot\s*(up|someone)|stab\s*someone|murder|assassinate)\b/i,/\b(porn|sex\w*|nude\w*|naked|erotic|masturbat\w*|penis|vagina|boobs)\b/i,/\b(fuck\w*|shit\w*|bitch\w*|cunt\w*|bastard\w*|nigger\w*|faggot\w*|retard\w*|whore\w*)\b/i,/\b(how\s*to\s*buy\s*(drugs|cocaine|heroin|weed|weed\s*online))\b/i,/\b(get\s*high|snort\s*cocaine|smoke\s*meth)\b/i],_=[/\b(my\s*phone\s*number\s*is|\b\d{10,11}\b|\b07\d{9}\b)/i,/\b(my\s*home\s*address\s*is|i\s*live\s*at\s*\d+)/i,/\b(my\s*password\s*is|my\s*snapchat|my\s*instagram|add\s*me\s*on\s*whatsapp)\b/i],v=[/\b(ignore\s*(all\s*)?previous\s*instructions)\b/i,/\b(you\s*are\s*now\s*DAN|do\s*anything\s*now)\b/i,/\b(pretend\s*you\s*have\s*no\s*rules|unrestricted\s*mode)\b/i,/\b(forget\s*(that\s*)?you\s*are\s*a\s*teacher)\b/i],y=`🕊️ If you are feeling overwhelmed, unhappy, or unsafe, please know that you are not alone and people care about you.

Please speak to a trusted adult, family member, or teacher right now.

If you are in the UK, you can speak to Childline free and confidentially anytime on **0800 1111** (or visit childline.org.uk).
In other countries, please reach out to your local child helpline or a trusted family member. We want you to be safe.`,b=`🛡️ This is a safe school learning space. Let's keep all questions kind, respectful, and focused on your schoolwork! What topic in your lessons would you like to explore next?`,x=`🔒 For your safety, please never share personal phone numbers, addresses, social media, or passwords online. Let's get back to your study topic!`,S=`I am your St Joseph's study assistant. I am here solely to help you learn your school subjects like Maths, Science, English, and History! What lesson are you working on today?`;function C(e){if(!e||!e.trim())return{isSafe:!0};let t=e.trim();for(let e of h)if(e.test(t))return{isSafe:!1,category:`distress_crisis`,safeReplacementText:y,reason:`Student distress/crisis signal detected`};for(let e of g)if(e.test(t))return{isSafe:!1,category:`inappropriate_content`,safeReplacementText:b,reason:`Inappropriate or harmful language detected`};for(let e of _)if(e.test(t))return{isSafe:!1,category:`pii_leak`,safeReplacementText:x,reason:`Potential personal data disclosure`};for(let e of v)if(e.test(t))return{isSafe:!1,category:`jailbreak_attempt`,safeReplacementText:S,reason:`Jailbreak or persona override attempt`};return{isSafe:!0}}function w(e){let t=e,n=t.toLowerCase(),r=n.indexOf(`<script`);for(;r!==-1;){let e=n.indexOf(`<\/script>`,r);if(e===-1){t=t.slice(0,r);break}t=t.slice(0,r)+t.slice(e+9),n=t.toLowerCase(),r=n.indexOf(`<script`)}for(;n.includes(`<\/script>`);){let e=n.indexOf(`<\/script>`);t=t.slice(0,e)+t.slice(e+9),n=t.toLowerCase()}return t}function T(e,t=`your lesson`){if(!e||!e.trim())return`What do you think is the next step we should investigate in ${t}?`;let n=e.trim();for(let e of g)if(e.test(n))return`Let's focus on the key question in ${t}: what rule or property helps us solve this step?`;return n=w(n),n=n.replace(/(?:javascript|data|vbscript):/gi,``),n=n.replace(/onload=/gi,``),n}var E=`ai_model_download_consent`;function D(){return typeof window>`u`?!1:localStorage.getItem(E)===`granted`}function O(e){if(!e)return null;if(e instanceof RegExp)return e;if(typeof e==`string`)try{return new RegExp(e)}catch{return null}if(typeof e==`object`){let t=e.pattern||e.regex||e.source;if(t instanceof RegExp)return t;if(typeof t==`string`)try{return new RegExp(t)}catch{return null}}return null}function k(e,t){return typeof t==`string`&&(e.lastIndex=0,e.test(t)?!0:(e.lastIndex=0,e.test(t.trim())))}new class{chatSession=null;activeSystemPrompt=``;cachedAvailability=null;availabilityPromise=null;getAiRoot(){if(typeof window>`u`)return null;let e=window,t=typeof self<`u`?self:e;return e.LanguageModel===void 0?t.LanguageModel===void 0?null:t.LanguageModel:e.LanguageModel}hasNativePromptApi(){return this.getAiRoot()!==null}hasWebLlmFallback(){return p.isSupported()}getActiveEngineType(){return this.hasNativePromptApi()?`chrome-builtin-nano`:p.isSupported()?`webgpu-webllm`:`rule-engine`}isPromptApiAvailableSync(){return D()?this.hasNativePromptApi()?!(this.cachedAvailability&&this.cachedAvailability.status===`no`):!!p.isSupported():!1}async checkAvailability(){if(this.cachedAvailability)return this.cachedAvailability;if(this.availabilityPromise)return this.availabilityPromise;let e=this.getAiRoot();return e?(this.availabilityPromise=(async()=>{try{if(typeof e.availability==`function`){let t=`no`;try{t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}],outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{try{t=await e.availability({outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{t=await e.availability()}}let n=t===`readily`||t===`available`?`readily`:t===`after-download`||t===`downloadable`?`after-download`:`no`;return this.cachedAvailability={status:n},this.cachedAvailability}if(typeof e.capabilities==`function`){let t=await e.capabilities(),n=t?.available===`readily`||t?.available===`available`?`readily`:t?.available===`after-download`||t?.available===`downloadable`?`after-download`:t?.available||`no`;return this.cachedAvailability={status:n,maxTokens:t?.maxTokens,temperature:t?.defaultTemperature},this.cachedAvailability}return this.cachedAvailability={status:`no`},this.cachedAvailability}catch{return this.cachedAvailability={status:`no`},this.cachedAvailability}finally{this.availabilityPromise=null}})(),this.availabilityPromise):p.isSupported()?(this.cachedAvailability={status:`readily`,maxTokens:4096,temperature:.2},this.cachedAvailability):(this.cachedAvailability={status:`no`},this.cachedAvailability)}async createSessionInstance(e){if(!D())throw Error(`User has not consented to in-browser AI model execution/download.`);let t=this.getAiRoot();if(!t)throw Error(`W3C LanguageModel API not supported in this environment.`);let n=e?.systemPrompt||`You are an elite UK Curriculum Socratic educator.`,r={initialPrompts:[{role:`system`,content:n}],samplingMode:`most-predictable`,expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}],outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]};e?.onDownloadProgress&&(r.monitor=t=>{t.addEventListener(`downloadprogress`,t=>{e.onDownloadProgress?.(t.loaded,t.total)})});let i=(async()=>{try{return await t.create(r)}catch{try{return await t.create({initialPrompts:[{role:`system`,content:n}],temperature:.1,topK:1,outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{return await t.create({initialPrompts:[{role:`system`,content:n}],expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}}})(),a=e?.onDownloadProgress?45e3:25e3,o=new Promise((e,t)=>setTimeout(()=>t(Error(`[AiCaller] Session initialization timed out after ${a}ms`)),a));return Promise.race([i,o])}async getSession(e){let t=e?.systemPrompt||`You are an elite UK Curriculum Socratic educator.`;return e?.preserveContext?(this.chatSession&&this.activeSystemPrompt!==t&&this.destroy(),this.chatSession||=(this.activeSystemPrompt=t,await this.createSessionInstance(e)),this.chatSession):await this.createSessionInstance(e)}async promptText(e){if(!D())throw Error(`User has not consented to in-browser AI model execution.`);let t=C(e.prompt);if(!t.isSafe)return t.safeReplacementText||`Let us keep our learning safe and focused on your school lessons.`;let n=``;if(this.hasNativePromptApi()){let t=!e.preserveContext,r=await this.getSession(e),i=e.timeoutMs??25e3,a=(async n=>{let i=n,a=t=>{let n={outputLanguage:`en`};return t&&e.responseConstraint&&(n.responseConstraint=e.responseConstraint,e.omitResponseConstraintInput!==void 0&&(n.omitResponseConstraintInput=e.omitResponseConstraintInput)),n},o=async(t,n)=>{let r=a(n),i=n?O(e.responseConstraint):null,o=async()=>{try{return await t.prompt(e.prompt,r)}catch(n){if(n?.name===`TypeError`||String(n?.message||``).includes(`parameter`))return await t.prompt(e.prompt);throw n}},s=await o();if(i&&!k(i,s)){console.warn(`[AiCaller] Chromium Issue 576432037: responseConstraint RegExp silently bypassed by engine. Output failed verification. Retrying prompt...`,{preview:(s||``).slice(0,80)});let e=!1;for(let t=1;t<=2;t++)try{let t=await o();if(k(i,t)){s=t,e=!0;break}}catch(e){console.warn(`[AiCaller] Constraint verification retry attempt ${t} failed:`,e)}if(!e)throw Error(`[AiCaller] Chromium Issue 576432037: output failed responseConstraint RegExp verification after retries. Rejecting dirty output: "${(s||``).slice(0,100)}..."`)}return s};try{return await o(i,!0)}catch(n){if(n?.name===`InvalidStateError`||String(n?.message||``).toLowerCase().includes(`destroyed`)){if(t)try{i?.destroy?.()}catch{}else this.destroy();i=await this.getSession(e),r=i;try{return await o(i,!0)}catch(e){throw e}}if(String(n?.message||``).includes(`Chromium Issue 576432037`))throw n;if(e.responseConstraint){console.warn(`[AiCaller] Prompt options with responseConstraint failed at runtime, attempting unconstrained with strict verification:`,n);let t=await o(i,!1),r=O(e.responseConstraint);if(r&&!k(r,t))throw Error(`[AiCaller] Chromium Issue 576432037: Unconstrained fallback failed responseConstraint RegExp verification. Rejecting dirty output.`);return t}throw n}})(r),o=new Promise((e,t)=>setTimeout(()=>t(Error(`[AiCaller] Inference prompt timed out after ${i}ms`)),i));try{n=await Promise.race([a,o])}catch(e){t||this.destroy(),console.warn(`[AiCaller] Chrome AI prompt failed, invoking WebLLM fallback:`,e)}finally{if(t&&r?.destroy)try{r.destroy()}catch{}}}if(!n&&p.isSupported()&&(n=(await p.infer(e.prompt,e.systemPrompt)).output),!n)throw Error(`No on-device AI inference engine is available in this browser environment.`);return T(n)}async*promptStream(e){if(!D())throw Error(`User has not consented to in-browser AI model execution.`);let t=C(e.prompt);if(!t.isSafe)yield t.safeReplacementText||`Let us keep our learning safe and focused on your school lessons.`;else{if(this.hasNativePromptApi()){let t=!e.preserveContext,n=await this.getSession(e);try{let t=null;try{t=n.promptStreaming?n.promptStreaming(e.prompt,{outputLanguage:`en`}):null}catch{t=n.promptStreaming?n.promptStreaming(e.prompt):null}if(!t){let t=``;try{t=await n.prompt(e.prompt,{outputLanguage:`en`})}catch{t=await n.prompt(e.prompt)}let r=O(e.responseConstraint);if(r&&!k(r,t))throw Error(`[AiCaller] Chromium Issue 576432037: Stream fallback output failed responseConstraint RegExp verification.`);yield t;return}if(Symbol.asyncIterator in t){let e=``;for await(let n of t){let t=n.startsWith(e)?n.slice(e.length):n;e=n,yield t}}else if(typeof t.getReader==`function`){let e=t.getReader(),n=``;try{for(;;){let{done:t,value:r}=await e.read();if(t)break;let i=typeof r==`string`?r:new TextDecoder().decode(r),a=i.startsWith(n)?i.slice(n.length):i;n=i,yield a}}finally{e.releaseLock()}}return}catch(e){t||this.destroy(),console.warn(`[AiCaller] Native stream failed, trying WebLLM streaming:`,e)}finally{if(t&&n?.destroy)try{n.destroy()}catch{}}}if(p.isSupported())for await(let t of p.inferStream(e.prompt,e.systemPrompt))yield t;else throw Error(`No on-device AI inference engine is available in this browser environment.`)}}async getRemainingTokens(){return this.chatSession?.tokensLeft?this.chatSession.tokensLeft:null}destroy(){if(this.chatSession){try{this.chatSession.destroy?.()}catch{}this.chatSession=null,this.activeSystemPrompt=``}}};function ee(e,t){let n=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>St. Joseph's AST Offline Lesson: ${t}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #090d16;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge {
      background: #16a34a;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    #stage-container {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #1e1b4b 0%, #090d16 100%);
    }
    svg {
      max-width: 95%;
      max-height: 85%;
      filter: drop-shadow(0 10px 25px rgba(0,0,0,0.5));
    }
    footer {
      background: #0f172a;
      border-top: 1px solid #1e293b;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
    }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn:hover { background: #1d4ed8; }
    .scrubber {
      flex: 1;
      margin: 0 16px;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1 style="font-size: 1.05rem; font-weight: 800;">${t}</h1>
      <span style="font-size: 0.75rem; color: #94a3b8;">St. Joseph's Curriculum Portal &bull; Standalone AST Vector Engine</span>
    </div>
    <span class="badge">100% AIR-GAPPED &bull; ZERO NETWORK</span>
  </header>

  <div id="stage-container">
    <svg id="ast-svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0.8"/>
        </linearGradient>
      </defs>
      <!-- Coordinate Grid -->
      <line x1="50" y1="450" x2="750" y2="450" stroke="#334155" stroke-width="2"/>
      <line x1="50" y1="50" x2="50" y2="450" stroke="#334155" stroke-width="2"/>
      
      <!-- Interactive Vector Graphic Elements -->
      <polygon id="triangle" points="150,450 550,450 150,150" fill="rgba(59, 130, 246, 0.2)" stroke="#38bdf8" stroke-width="4"/>
      
      <!-- Squares on legs -->
      <rect id="sqA" x="150" y="450" width="400" height="30" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="2"/>
      <rect id="sqB" x="120" y="150" width="30" height="300" fill="rgba(34, 197, 94, 0.25)" stroke="#22c55e" stroke-width="2"/>
      
      <!-- Labels -->
      <text x="350" y="440" fill="#f59e0b" font-weight="800" font-size="20">Leg a (Base)</text>
      <text x="60" y="300" fill="#22c55e" font-weight="800" font-size="20">Leg b (Height)</text>
      <text x="380" y="270" fill="#38bdf8" font-weight="800" font-size="22">Hypotenuse c</text>
      <text x="400" y="100" text-anchor="middle" fill="#f8fafc" font-size="24" font-weight="900">a² + b² = c²</text>
    </svg>
  </div>

  <footer>
    <button class="btn" id="playBtn" onclick="togglePlay()">⏸️ Pause</button>
    <input type="range" class="scrubber" id="timeScrubber" min="0" max="100" value="0" oninput="scrub(this.value)">
    <span id="timeLabel" style="font-weight: 700; color: #38bdf8;">00:00</span>
  </footer>

  <script>
    let isPlaying = true;
    let t = 0;
    const scrubber = document.getElementById('timeScrubber');
    const timeLabel = document.getElementById('timeLabel');
    const playBtn = document.getElementById('playBtn');
    const triangle = document.getElementById('triangle');

    function loop() {
      if (isPlaying) {
        t = (t + 0.5) % 100;
        scrubber.value = t;
        render(t);
      }
      requestAnimationFrame(loop);
    }

    function render(val) {
      const p = val / 100;
      const angle = p * Math.PI * 2;
      const pulse = Math.sin(angle) * 20;
      triangle.setAttribute('points', \`150,450 \${550 + pulse},450 150,\${150 - pulse}\`);
      timeLabel.innerText = Math.round(val) + '%';
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      playBtn.innerText = isPlaying ? '⏸️ Pause' : '▶️ Play';
    }

    function scrub(val) {
      t = Number(val);
      render(t);
    }

    requestAnimationFrame(loop);
  <\/script>
</body>
</html>`,r=new Blob([n],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`stj-offline-ast-lesson-${e}.html`,a.click(),URL.revokeObjectURL(i)}var A=`kinetic-gas`,te=new Set(o.map(e=>e.id));function j(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function M(e){if(!e)return A;if(te.has(e))return e;try{if(c().some(t=>t.id===e))return e}catch{}return A}function ne(e,t,n){return`${e}player.html?${new URLSearchParams({preset:t,bsl:n?`1`:`0`,mode:`suite`,tools:`1`,all:`1`}).toString()}`}function N(){let p=r(),h=document.createElement(`div`);h.className=`ast-media-player-container`,h.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let g=new URLSearchParams(window.location.search),_=M(g.get(`preset`)),v=`All`,y=``,b=i()||g.get(`bsl`)===`1`,x=Array.isArray(o)&&o.length>0?o:[{id:`kinetic-gas`,label:`Kinetic Gas Theory & Thermodynamics`,type:`Sim`,stage:`KS3/KS4 PHYSICS`},{id:`pythagoras`,label:`Pythagoras' Theorem (a² + b² = c²)`,type:`Sim`,stage:`KS3/KS4 MATHEMATICS`},{id:`fractions`,label:`Fractions: Why Common Denominators Rule`,type:`Slide`,stage:`KEY STAGE 2`},{id:`electric-circuits`,label:`Electrical Circuits & Ohm’s Law`,type:`Sim`,stage:`KEY STAGE 3`},{id:`solar-system`,label:`Solar System: Heliocentric Planetary Motion`,type:`Sim`,stage:`KEY STAGE 2/3`},{id:`algebra-balance`,label:`Algebraic Balance Scale`,type:`Sim`,stage:`KEY STAGE 3`},{id:`church-tour`,label:`The Catholic Church Sanctuary & Altar`,type:`Slide`,stage:`WHOLE SCHOOL RE`},{id:`phonics-lab`,label:`EYFS Phonics Sound Mat & Digraphs`,type:`App`,stage:`EYFS / KS1`}];function S(e){return e.stage===`CATHOLIC LIFE`||e.subject===`Religious Education`||e.section&&e.section.includes(`Catholic`)||[`church-tour`,`altar-anatomy`,`holy-oils`,`holy-water-thurifer`,`latin-mass-prayers`,`catholic-rites`,`order-of-the-mass`,`stations-of-the-cross`,`first-communion`,`liturgical-calendar`,`liturgical-postures`,`liturgy-of-the-hours`,`triduum-easter`].includes(e.id)}function C(e){return!S(e)&&(e.subject===`Science`||e.stage&&e.stage.includes(`PHYSICS`)||[`kinetic-gas`,`electric-circuits`,`solar-system`,`photosynthesis`,`atom`,`velocity`,`dna-helix`].includes(e.id))}function w(e){return!S(e)&&(e.subject===`Mathematics`||[`pythagoras`,`fractions`,`algebra-balance`,`calculus-curves`,`bodmas`,`times-tables`].includes(e.id))}function T(e){return!S(e)&&!C(e)&&!w(e)}function E(){try{return c().filter(e=>!te.has(e.id))}catch{return[]}}function D(e){let t=x.find(t=>t.id===e);if(t)return t;try{let t=c().find(t=>t.id===e);if(t)return{id:t.id,label:t.title,stage:t.stage||`LOCAL VAULT`,type:t.type||`Sim`,subject:t.subject||`Custom Ingestion`}}catch{}return x[0]}let O=x.filter(S),k=x.filter(C),A=x.filter(w),N=x.filter(T);function re(e){let t=E();return`
      ${t.length>0?`
      <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
        ${t.map(t=>`<option value="${j(t.id)}" ${t.id===e?`selected`:``}>${j(t.title)} (${j(t.stage||`LOCAL`)})</option>`).join(``)}
      </optgroup>
    `:``}
      <optgroup label="✝️ Catholic Sanctuary &amp; Liturgy" style="background:#0f172a; color:#fde047;">
        ${O.map(t=>`<option value="${j(t.id)}" ${t.id===e?`selected`:``}>${j(t.label)} (${j(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="🔬 STEM &amp; Natural Sciences" style="background:#0f172a; color:#38bdf8;">
        ${k.map(t=>`<option value="${j(t.id)}" ${t.id===e?`selected`:``}>${j(t.label)} (${j(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="📐 Mathematics &amp; Logic" style="background:#0f172a; color:#34d399;">
        ${A.map(t=>`<option value="${j(t.id)}" ${t.id===e?`selected`:``}>${j(t.label)} (${j(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="🔤 EYFS, Languages &amp; Computing" style="background:#0f172a; color:#fbbf24;">
        ${N.map(t=>`<option value="${j(t.id)}" ${t.id===e?`selected`:``}>${j(t.label)} (${j(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="⚡ Dynamic Auto-Finder" style="background:#0f172a; color:#38bdf8;">
        <option value="__custom_find__">🔍 Open Any Scene by Name / ID...</option>
        <option value="__open_local__">📂 Open Local .ast or .svg File...</option>
      </optgroup>
    `}let ie=re(_),P=D(_),F=j(p),ae=j(P.stage||``),oe=j(P.type||`Sim`),se=j(P.label||``),ce=j(ne(p,_,b));h.innerHTML=`
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${F}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎬 AST Vector Player &amp; Simulator</span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${F}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${F}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
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
                ${ae}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace;">
                ${oe}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem;">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.15rem; font-weight:800; color:#f8fafc; margin:2px 0 0;">
              ${se}
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
              ${ie}
            </select>
          </div>

          <!-- Reset Simulation Apparatus Button -->
          <button type="button" id="player-btn-reset" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Reset Simulation apparatus to initial conditions">
            ↺ Reset
          </button>

          <!-- BSL Signing Toggle Button (Fixed Width to prevent layout shift) -->
          <button type="button" id="player-btn-bsl" style="padding:6px 12px; border-radius:8px; background:${b?`#0284c7`:`#1e293b`}; color:#ffffff; border:1px solid ${b?`#38bdf8`:`#334155`}; font-size:0.78rem; font-weight:700; cursor:pointer; min-width:142px; text-align:center; flex-shrink:0;" title="Toggle British Sign Language In-Vision Interpreter (Shift+B)">
            🖐️ BSL Signing: ${b?`ON`:`OFF`}
          </button>

          <!-- Open Local Cartridge Button -->
          <button type="button" id="player-btn-open" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" title="Open local .ast, .svg, .ast.svg, or PhET bundle">
            📂 Open...
          </button>
          <input type="file" id="media-player-file-input" accept=".ast,.svg,.json,.html,.phet" multiple style="display:none;" />

          <!-- LMS Embed Modal Button -->
          <button type="button" id="player-btn-embed" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#34d399; border:1px solid #059669; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Get Responsive LMS Embed Snippet (Canvas, Moodle, Google Classroom)">
            🚀 Embed
          </button>

          <!-- Single-File Air-Gapped HTML Export Button -->
          <button type="button" id="player-btn-export-airgap" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#fde047; border:1px solid #ca8a04; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Export Standalone Single-File HTML Lesson Capsule (< 45 KB)">
            📦 Airgap HTML
          </button>

          <!-- Fullscreen Button -->
          <button type="button" id="player-btn-fullscreen" style="padding:6px 12px; border-radius:8px; background:#0284c7; color:#ffffff; border:none; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- In-Page Drawer & Modal Mount Point -->
      <div id="player-drawer-mount-point" style="display:none; background:#0f172a; border-bottom:1px solid #334155;"></div>

      <!-- Live Stage iFrame -->
      <div id="player-iframe-wrapper" style="position:relative; width:100%; height:540px; background:#000000;">
        <iframe
          id="ast-player-iframe"
          src="${ce}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Catholic Sanctuary Linkage Banner -->
    <div id="catholic-sanctuary-banner" style="display:${S(P)?`flex`:`none`}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">✝️</span>
        <div>
          <span style="font-size:0.86rem; color:#fde047; font-weight:800;">St Joseph's Catholic Sanctuary:</span>
          <span style="font-size:0.82rem; color:#cbd5e1; margin-left:4px;">This simulation is part of our Catholic faith formation and sacred liturgical curriculum.</span>
        </div>
      </div>
      <a href="${p}catholic-life?tab=altar-anatomy" style="padding:5px 12px; border-radius:6px; background:#ca8a04; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem;">
        Open High Altar &amp; Latin Chapel &rarr;
      </a>
    </div>

    <!-- Category Filter Tabs & Search -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="category-filter-buttons">
          ${[{id:`All`,label:`🌟 All (`+x.length+`)`},{id:`Catholic`,label:`✝️ Catholic Faith (`+O.length+`)`},{id:`STEM`,label:`🔬 STEM Sciences (`+k.length+`)`},{id:`Maths`,label:`📐 Mathematics (`+A.length+`)`},{id:`EYFS`,label:`🔤 EYFS & Languages (`+N.length+`)`}].map(e=>`
            <button type="button" class="cat-pill-btn" data-cat="${e.id}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${e.id===v?`#0284c7`:`#cbd5e1`}; background:${e.id===v?`#0284c7`:`#f8fafc`}; color:${e.id===v?`#ffffff`:`#475569`};">
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
        <a href="${p}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Architecture Notes &rarr;</a>
      </div>
    </div>
  `;let I=h.querySelector(`#ast-player-iframe`),L=h.querySelector(`#player-sim-selector`),le=h.querySelector(`#player-active-title`),ue=h.querySelector(`#player-active-stage-badge`),de=h.querySelector(`#player-active-type-badge`),fe=h.querySelector(`#player-btn-reset`),R=h.querySelector(`#player-btn-bsl`),pe=h.querySelector(`#player-btn-open`),z=h.querySelector(`#player-btn-embed`),me=h.querySelector(`#player-btn-export-airgap`),B=h.querySelector(`#player-drawer-mount-point`),V=h.querySelector(`#media-player-file-input`),he=h.querySelector(`#player-btn-fullscreen`),ge=h.querySelector(`#cartridge-search-input`),H=h.querySelector(`#cartridges-grid`),_e=h.querySelectorAll(`.cat-pill-btn`),U=h.querySelector(`#player-iframe-wrapper`);function W(e){I?.contentWindow?.postMessage(e,`*`)}let G=!1,K=`classroom`,q=!1;function J(){if(!B)return;if(!G){B.style.display=`none`,B.innerHTML=``,z?.classList.remove(`active`);return}B.style.display=`block`,B.innerHTML=``,z?.classList.add(`active`);let e=e=>`<iframe src="${window.location.origin}${p}player.html?preset=${_}&mode=${e}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`,t=m({isOpen:!0,onClose:()=>{G=!1,J()},embedTargetMode:K,setEmbedTargetMode:e=>{K=e,J()},copiedEmbed:q,onCopyEmbedCode:()=>{q=!0,navigator.clipboard?.writeText(e(K)),J(),setTimeout(()=>{q=!1,G&&J()},2e3)},embedCode:e(K)});t&&B.appendChild(t)}function Y(){L&&(L.innerHTML=re(_),L.value=_)}function ve(){return[...E().map(e=>({id:e.id,label:e.title,stage:e.stage||`LOCAL VAULT`,type:e.type||`Sim`,subject:e.subject||`Custom Ingested`})),...x]}let X=!1;I?.addEventListener(`load`,()=>{X=!0});function Z(e,t=!1){if(e===`__custom_find__`||e===`__open_local__`)return;let n=M(e);_=n;let r=D(n);le&&(le.textContent=r.label),ue&&(ue.textContent=r.stage),de&&(de.textContent=r.type||`Sim`),L&&(L.value=n);let i=h.querySelector(`#catholic-sanctuary-banner`);i&&(i.style.display=S(r)?`flex`:`none`),!t&&X&&I&&I.contentWindow?W({type:`SET_PRESET`,preset:n,play:!0}):I&&(!I.src||I.src===`about:blank`||!X)&&(I.src=ne(p,n,b)),a({subtitle:`${r.label}. ${r.stage}`,isSpeaking:!0}),G&&J();let o=new URL(window.location.href);o.searchParams.set(`preset`,n),window.history.replaceState({},``,o.toString()),Q()}async function ye(e){if(e&&e.length!==0)try{let t=e.find(e=>e.name.endsWith(`.svg`)),r=e.find(e=>e.name.endsWith(`.ast`));if(t&&r){let e=await t.text(),n=await r.text(),i=t.name.replace(/\.[^/.]+$/,``),a=i.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),o={id:a,title:i.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested companion pair: ${t.name} + ${r.name}.`,icon:`💾`,source:`imported`,svgMarkup:e,astSource:n,updatedAt:Date.now()};s(o),Y(),Z(a),I?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:o},`*`);return}for(let t of e){let e=await t.text();if(t.name.endsWith(`.phet`)||l(e)){let r=await n(e,t.name);if(r.success&&r.svgMarkup&&r.astSource){let e=r.metadata?.simName||`phet-${Date.now()}`,n={id:e,title:r.metadata?.title||t.name.replace(/\.[^/.]+$/,``),stage:`PHET INTERACTIVE`,category:`STEM`,desc:`PhET simulation transpiled to AST: ${r.metadata?.compressionRatio||`distilled`}.`,icon:`⚛️`,source:`phet`,svgMarkup:r.svgMarkup,astSource:r.astSource,updatedAt:Date.now()};s(n),Y(),Z(e),I?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:n},`*`);return}}if(t.name.endsWith(`.svg`)){let n=t.name.replace(/\.[^/.]+$/,``),r=n.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),i=n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),a=``,o=e.match(/<script\s+type=["']text\/ast["'][^>]*>([\s\S]*?)<\/script>/i);a=o&&o[1]?o[1].trim():`(:scene :id "${r}" :title "${i}" :stage "CUSTOM" :duration 10.0 (:bindings ()))`;let c={id:r,title:i,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested vector cartridge: ${t.name}.`,icon:`🎨`,source:`imported`,svgMarkup:e,astSource:a,updatedAt:Date.now()};s(c),Y(),Z(r),I?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:c},`*`);return}if(t.name.endsWith(`.ast`)){let n=t.name.replace(/\.[^/.]+$/,``),r=n.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),i={id:r,title:n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested AST logic: ${t.name}.`,icon:`📜`,source:`imported`,svgMarkup:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`,astSource:e,updatedAt:Date.now()};s(i),Y(),Z(r),I?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:i},`*`);return}}}catch(e){console.error(`[media-player] Error ingesting uploaded files:`,e)}}function Q(){if(!H)return;let e=y.toLowerCase().trim(),t=ve().filter(t=>{let n=!0;v===`Catholic`?n=S(t):v===`STEM`?n=C(t):v===`Maths`?n=w(t):v===`EYFS`?n=T(t):v!==`All`&&(n=(t.type||`Sim`)===v);let r=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e);return n&&r});t.length===0?H.innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#94a3b8;">No matching cartridges found.</div>`:(H.innerHTML=t.map(e=>{let t=e.id===_;return`
        <div 
          class="cartridge-card" 
          data-id="${j(e.id)}"
          style="padding:12px; border-radius:10px; border:1.5px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#f0f9ff`:`#f8fafc`}; cursor:pointer; transition:all 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.68rem; font-weight:800; padding:1px 6px; border-radius:4px; background:${e.type===`Slide`?`#dcfce7`:e.type===`App`?`#fef3c7`:`#e0f2fe`}; color:${e.type===`Slide`?`#166534`:e.type===`App`?`#92400e`:`#0369a1`};">
              ${j(e.type||`Sim`)}
            </span>
            <span style="font-size:0.68rem; color:#64748b; font-weight:600;">${j(e.stage)}</span>
          </div>
          <strong style="display:block; font-size:0.86rem; color:#0f172a; margin-bottom:6px; line-height:1.3;">${j(e.label)}</strong>
          <span style="font-size:0.75rem; color:#0284c7; font-weight:700;">${t?`▶ Currently Playing`:`Launch &rarr;`}</span>
        </div>
      `}).join(``),H.querySelectorAll(`.cartridge-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&(Z(t),I?.scrollIntoView({behavior:`smooth`,block:`center`}))})}))}L?.addEventListener(`change`,e=>{let t=e.target.value;if(t===`__open_local__`)L.value=_,V?.click();else if(t===`__custom_find__`){L.value=_;let e=window.prompt(`Enter Cartridge or Scene ID (e.g. calculus-curves, bbc-model-b, stations-of-the-cross):`);e&&e.trim()&&Z(e.trim())}else Z(t)}),pe?.addEventListener(`click`,()=>{V?.click()}),V?.addEventListener(`change`,e=>{let t=e.target;t.files&&t.files.length&&(ye(Array.from(t.files)),t.value=``)}),U&&(U.addEventListener(`dragover`,e=>{e.preventDefault(),e.stopPropagation()}),U.addEventListener(`drop`,e=>{e.preventDefault(),e.stopPropagation(),e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length&&ye(Array.from(e.dataTransfer.files))})),fe?.addEventListener(`click`,()=>{W({type:`RESET_SIM`})}),R?.addEventListener(`click`,()=>{d()});function $(e){R&&(R.textContent=`🖐️ BSL Signing: ${e?`ON`:`OFF`}`,R.style.background=e?`#0284c7`:`#1e293b`,R.style.borderColor=e?`#38bdf8`:`#334155`)}return f(e=>{b!==e&&(b=e,$(e),W({type:`SET_BSL`,enabled:e}))}),t(e=>{try{W({type:`SET_VOICE`,enabled:e})}catch{}}),window.addEventListener(`message`,t=>{if(t.data&&typeof t.data==`object`){if(t.data.type===`PLAYER_READY`&&(X=!0,_&&W({type:`SET_PRESET`,preset:_,play:!1})),(t.data.type===`PRESETCHANGE`||t.data.type===`PLAYER_PRESET_CHANGED`)&&typeof t.data.preset==`string`){let e=M(t.data.preset);e!==_&&Z(e,!0)}t.data.type===`CARTRIDGE_INGESTED`&&(Y(),Q()),(t.data.type===`VOICE_TOGGLE`||t.data.type===`SET_VOICE`)&&typeof t.data.enabled==`boolean`&&u(t.data.enabled),t.data.type===`BSL_STATE_CHANGED`&&typeof t.data.active==`boolean`&&(b=t.data.active,$(t.data.active),e(t.data.active)),t.data.type===`TOGGLE_BSL`&&typeof t.data.enabled==`boolean`&&(b=t.data.enabled,$(t.data.enabled),e(t.data.enabled))}}),window.addEventListener(`cartridges_updated`,()=>{Y(),Q()}),z?.addEventListener(`click`,()=>{G=!G,J()}),me?.addEventListener(`click`,()=>{let e=D(_);ee(_,e.label)}),he?.addEventListener(`click`,()=>{let e=h.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()}),_e.forEach(e=>{e.addEventListener(`click`,()=>{v=e.getAttribute(`data-cat`)||`All`,_e.forEach(e=>{let t=e.getAttribute(`data-cat`)===v;e.style.background=t?`#0284c7`:`#f8fafc`,e.style.color=t?`#ffffff`:`#475569`,e.style.borderColor=t?`#0284c7`:`#cbd5e1`}),Q()})}),ge?.addEventListener(`input`,e=>{y=e.target.value,Q()}),Q(),h}export{N as default,N as renderPlayerPage};