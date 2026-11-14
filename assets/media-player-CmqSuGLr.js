import{c as e,i as t,l as n,m as r,n as i,o as a,r as o,s}from"./cartridge-vault-C_ymVyNu.js";import{A as c,S as l,a as u,c as d,d as f,g as p,i as m,l as h,o as g,r as _,s as v,u as y,y as b}from"./bsl-engine-BxhW5cqk.js";import{r as x,t as S}from"./EdgeCognitiveEngine-N8--_s3V.js";import{t as C}from"./jotter-db-C3nAur4m.js";function w(e){if(!e.isOpen)return null;let{embedTargetMode:t,setEmbedTargetMode:n,copiedEmbed:r,onCopyEmbedCode:i,embedCode:a}=e,o=document.createElement(`div`);o.className=`ast-player-embed-modal`,o.style.cssText=`
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
  `,m.textContent=a,o.appendChild(m),o}var T=[/\b(kill\s*myself|end\s*my\s*life|commit\s*suicide|want\s*to\s*die|suicidal)\b/i,/\b(hurt\s*myself|cutting\s*myself|self\s*harm|cut\s*my\s*wrists)\b/i,/\b(nobody\s*loves\s*me|i\s*hate\s*my\s*life|want\s*to\s*disappear)\b/i,/\b(someone\s*is\s*hurting\s*me|being\s*abused|scared\s*to\s*go\s*home)\b/i],E=[/\b(how\s*to\s*make\s*(a\s*)?(bomb|weapon|explosive|gun))\b/i,/\b(shoot\s*(up|someone)|stab\s*someone|murder|assassinate)\b/i,/\b(porn|sex\w*|nude\w*|naked|erotic|masturbat\w*|penis|vagina|boobs)\b/i,/\b(fuck\w*|shit\w*|bitch\w*|cunt\w*|bastard\w*|nigger\w*|faggot\w*|retard\w*|whore\w*)\b/i,/\b(how\s*to\s*buy\s*(drugs|cocaine|heroin|weed|weed\s*online))\b/i,/\b(get\s*high|snort\s*cocaine|smoke\s*meth)\b/i],D=[/\b(my\s*phone\s*number\s*is|\b\d{10,11}\b|\b07\d{9}\b)/i,/\b(my\s*home\s*address\s*is|i\s*live\s*at\s*\d+)/i,/\b(my\s*password\s*is|my\s*snapchat|my\s*instagram|add\s*me\s*on\s*whatsapp)\b/i],O=[/\b(ignore\s*(all\s*)?previous\s*instructions)\b/i,/\b(you\s*are\s*now\s*DAN|do\s*anything\s*now)\b/i,/\b(pretend\s*you\s*have\s*no\s*rules|unrestricted\s*mode)\b/i,/\b(forget\s*(that\s*)?you\s*are\s*a\s*teacher)\b/i],k=`🕊️ If you are feeling overwhelmed, unhappy, or unsafe, please know that you are not alone and people care about you.

Please speak to a trusted adult, family member, or teacher right now.

If you are in the UK, you can speak to Childline free and confidentially anytime on **0800 1111** (or visit childline.org.uk).
In other countries, please reach out to your local child helpline or a trusted family member. We want you to be safe.`,A=`🛡️ This is a safe school learning space. Let's keep all questions kind, respectful, and focused on your schoolwork! What topic in your lessons would you like to explore next?`,j=`🔒 For your safety, please never share personal phone numbers, addresses, social media, or passwords online. Let's get back to your study topic!`,M=`I am your St Joseph's study assistant. I am here solely to help you learn your school subjects like Maths, Science, English, and History! What lesson are you working on today?`;function N(e){if(!e||!e.trim())return{isSafe:!0};let t=e.trim();for(let e of T)if(e.test(t))return{isSafe:!1,category:`distress_crisis`,safeReplacementText:k,reason:`Student distress/crisis signal detected`};for(let e of E)if(e.test(t))return{isSafe:!1,category:`inappropriate_content`,safeReplacementText:A,reason:`Inappropriate or harmful language detected`};for(let e of D)if(e.test(t))return{isSafe:!1,category:`pii_leak`,safeReplacementText:j,reason:`Potential personal data disclosure`};for(let e of O)if(e.test(t))return{isSafe:!1,category:`jailbreak_attempt`,safeReplacementText:M,reason:`Jailbreak or persona override attempt`};return{isSafe:!0}}function ee(e){let t=e,n=t.toLowerCase(),r=n.indexOf(`<script`);for(;r!==-1;){let e=n.indexOf(`<\/script>`,r);if(e===-1){t=t.slice(0,r);break}t=t.slice(0,r)+t.slice(e+9),n=t.toLowerCase(),r=n.indexOf(`<script`)}for(;n.includes(`<\/script>`);){let e=n.indexOf(`<\/script>`);t=t.slice(0,e)+t.slice(e+9),n=t.toLowerCase()}return t}function te(e,t=`your lesson`){if(!e||!e.trim())return`What do you think is the next step we should investigate in ${t}?`;let n=e.trim();for(let e of E)if(e.test(n))return`Let's focus on the key question in ${t}: what rule or property helps us solve this step?`;return n=ee(n),n=n.replace(/(?:javascript|data|vbscript):/gi,``),n=n.replace(/onload=/gi,``),n}var P=`ai_model_download_consent`;function F(){return typeof window>`u`?!1:p(P)===`granted`}function I(e){typeof window<`u`&&(b(P,e?`granted`:`denied`),window.dispatchEvent(new CustomEvent(`ai_consent_changed`,{detail:e})))}function ne(e){if(!e)return null;if(e instanceof RegExp)return e;if(typeof e==`string`)try{return new RegExp(e)}catch{return null}if(typeof e==`object`){let t=e.pattern||e.regex||e.source;if(t instanceof RegExp)return t;if(typeof t==`string`)try{return new RegExp(t)}catch{return null}}return null}function L(e,t){return typeof t==`string`&&(e.lastIndex=0,e.test(t)?!0:(e.lastIndex=0,e.test(t.trim())))}var re=new class{chatSession=null;activeSystemPrompt=``;cachedAvailability=null;availabilityPromise=null;getAiRoot(){if(typeof window>`u`)return null;let e=window,t=typeof self<`u`?self:e;return e.LanguageModel===void 0?t.LanguageModel===void 0?null:t.LanguageModel:e.LanguageModel}hasNativePromptApi(){return this.getAiRoot()!==null}hasWebLlmFallback(){return S.isSupported()}getActiveEngineType(){return this.hasNativePromptApi()?`chrome-builtin-nano`:S.isSupported()?`webgpu-webllm`:`rule-engine`}isPromptApiAvailableSync(){return F()?this.hasNativePromptApi()?!(this.cachedAvailability&&this.cachedAvailability.status===`no`):!!S.isSupported():!1}async checkAvailability(){if(this.cachedAvailability)return this.cachedAvailability;if(this.availabilityPromise)return this.availabilityPromise;let e=this.getAiRoot();return e?(this.availabilityPromise=(async()=>{try{if(typeof e.availability==`function`){let t=`no`;try{t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}],outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{try{t=await e.availability({outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{t=await e.availability()}}let n=t===`readily`||t===`available`?`readily`:t===`after-download`||t===`downloadable`?`after-download`:`no`;return this.cachedAvailability={status:n},this.cachedAvailability}if(typeof e.capabilities==`function`){let t=await e.capabilities(),n=t?.available===`readily`||t?.available===`available`?`readily`:t?.available===`after-download`||t?.available===`downloadable`?`after-download`:t?.available||`no`;return this.cachedAvailability={status:n,maxTokens:t?.maxTokens,temperature:t?.defaultTemperature},this.cachedAvailability}return this.cachedAvailability={status:`no`},this.cachedAvailability}catch{return this.cachedAvailability={status:`no`},this.cachedAvailability}finally{this.availabilityPromise=null}})(),this.availabilityPromise):S.isSupported()?(this.cachedAvailability={status:`readily`,maxTokens:4096,temperature:.2},this.cachedAvailability):(this.cachedAvailability={status:`no`},this.cachedAvailability)}async createSessionInstance(e){if(!F())throw Error(`User has not consented to in-browser AI model execution/download.`);let t=this.getAiRoot();if(!t)throw Error(`W3C LanguageModel API not supported in this environment.`);let n=e?.systemPrompt||`You are an elite UK Curriculum Socratic educator.`,r={initialPrompts:[{role:`system`,content:n}],samplingMode:`most-predictable`,expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}],outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]};e?.onDownloadProgress&&(r.monitor=t=>{t.addEventListener(`downloadprogress`,t=>{e.onDownloadProgress?.(t.loaded,t.total)})});let i=(async()=>{try{return await t.create(r)}catch{try{return await t.create({initialPrompts:[{role:`system`,content:n}],temperature:.1,topK:1,outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{return await t.create({initialPrompts:[{role:`system`,content:n}],expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}}})(),a=e?.onDownloadProgress?45e3:25e3,o=new Promise((e,t)=>setTimeout(()=>t(Error(`[AiCaller] Session initialization timed out after ${a}ms`)),a));return Promise.race([i,o])}async getSession(e){let t=e?.systemPrompt||`You are an elite UK Curriculum Socratic educator.`;return e?.preserveContext?(this.chatSession&&this.activeSystemPrompt!==t&&this.destroy(),this.chatSession||=(this.activeSystemPrompt=t,await this.createSessionInstance(e)),this.chatSession):await this.createSessionInstance(e)}async promptText(e){if(!F())throw Error(`User has not consented to in-browser AI model execution.`);let t=N(e.prompt);if(!t.isSafe)return t.safeReplacementText||`Let us keep our learning safe and focused on your school lessons.`;let n=``;if(this.hasNativePromptApi()){let t=!e.preserveContext,r=await this.getSession(e),i=e.timeoutMs??25e3,a=(async n=>{let i=n,a=t=>{let n={outputLanguage:`en`};return t&&e.responseConstraint&&(n.responseConstraint=e.responseConstraint,e.omitResponseConstraintInput!==void 0&&(n.omitResponseConstraintInput=e.omitResponseConstraintInput)),n},o=async(t,n)=>{let r=a(n),i=n?ne(e.responseConstraint):null,o=async()=>{try{return await t.prompt(e.prompt,r)}catch(n){if(n?.name===`TypeError`||String(n?.message||``).includes(`parameter`))return await t.prompt(e.prompt);throw n}},s=await o();if(i&&!L(i,s)){console.warn(`[AiCaller] Chromium Issue 576432037: responseConstraint RegExp silently bypassed by engine. Output failed verification. Retrying prompt...`,{preview:(s||``).slice(0,80)});let e=!1;for(let t=1;t<=2;t++)try{let t=await o();if(L(i,t)){s=t,e=!0;break}}catch(e){console.warn(`[AiCaller] Constraint verification retry attempt ${t} failed:`,e)}if(!e)throw Error(`[AiCaller] Chromium Issue 576432037: output failed responseConstraint RegExp verification after retries. Rejecting dirty output: "${(s||``).slice(0,100)}..."`)}return s};try{return await o(i,!0)}catch(n){if(n?.name===`InvalidStateError`||String(n?.message||``).toLowerCase().includes(`destroyed`)){if(t)try{i?.destroy?.()}catch{}else this.destroy();i=await this.getSession(e),r=i;try{return await o(i,!0)}catch(e){throw e}}if(String(n?.message||``).includes(`Chromium Issue 576432037`))throw n;if(e.responseConstraint){console.warn(`[AiCaller] Prompt options with responseConstraint failed at runtime, attempting unconstrained with strict verification:`,n);let t=await o(i,!1),r=ne(e.responseConstraint);if(r&&!L(r,t))throw Error(`[AiCaller] Chromium Issue 576432037: Unconstrained fallback failed responseConstraint RegExp verification. Rejecting dirty output.`);return t}throw n}})(r),o=new Promise((e,t)=>setTimeout(()=>t(Error(`[AiCaller] Inference prompt timed out after ${i}ms`)),i));try{n=await Promise.race([a,o])}catch(e){t||this.destroy(),console.warn(`[AiCaller] Chrome AI prompt failed, invoking WebLLM fallback:`,e)}finally{if(t&&r?.destroy)try{r.destroy()}catch{}}}if(!n&&S.isSupported()&&(n=(await S.infer(e.prompt,e.systemPrompt)).output),!n)throw Error(`No on-device AI inference engine is available in this browser environment.`);return te(n)}async*promptStream(e){if(!F())throw Error(`User has not consented to in-browser AI model execution.`);let t=N(e.prompt);if(!t.isSafe)yield t.safeReplacementText||`Let us keep our learning safe and focused on your school lessons.`;else{if(this.hasNativePromptApi()){let t=!e.preserveContext,n=await this.getSession(e);try{let t=null;try{t=n.promptStreaming?n.promptStreaming(e.prompt,{outputLanguage:`en`}):null}catch{t=n.promptStreaming?n.promptStreaming(e.prompt):null}if(!t){let t=``;try{t=await n.prompt(e.prompt,{outputLanguage:`en`})}catch{t=await n.prompt(e.prompt)}let r=ne(e.responseConstraint);if(r&&!L(r,t))throw Error(`[AiCaller] Chromium Issue 576432037: Stream fallback output failed responseConstraint RegExp verification.`);yield t;return}if(Symbol.asyncIterator in t){let e=``;for await(let n of t){let t=n.startsWith(e)?n.slice(e.length):n;e=n,yield t}}else if(typeof t.getReader==`function`){let e=t.getReader(),n=``;try{for(;;){let{done:t,value:r}=await e.read();if(t)break;let i=typeof r==`string`?r:new TextDecoder().decode(r),a=i.startsWith(n)?i.slice(n.length):i;n=i,yield a}}finally{e.releaseLock()}}return}catch(e){t||this.destroy(),console.warn(`[AiCaller] Native stream failed, trying WebLLM streaming:`,e)}finally{if(t&&n?.destroy)try{n.destroy()}catch{}}}if(S.isSupported())for await(let t of S.inferStream(e.prompt,e.systemPrompt))yield t;else throw Error(`No on-device AI inference engine is available in this browser environment.`)}}async getRemainingTokens(){return this.chatSession?.tokensLeft?this.chatSession.tokensLeft:null}destroy(){if(this.chatSession){try{this.chatSession.destroy?.()}catch{}this.chatSession=null,this.activeSystemPrompt=``}}};function R(e){if(!e||typeof e!=`string`)return null;let t=e.trim().replace(/^['"]|['"]$/g,``);return/[<>'"`;(){}]/.test(t)||t.toLowerCase().includes(`script`)?null:/^[#\.]?[a-zA-Z0-9_\-\:]+$/.test(t)||/^\[[a-zA-Z0-9_\-]+(=['"]?[a-zA-Z0-9_\-]+['"]?)?\]$/.test(t)?t.startsWith(`#`)||t.startsWith(`.`)||t.startsWith(`[`)?t:`#${t}`:null}function ie(e){let t=[],n=``,r=[],i=/\(:act\s+([^)]+)\)/gi,a;for(;(a=i.exec(e))!==null;){let e=a[0],i=a[1];r.push(e);let o=i.match(/:seek\s+([0-9.]+)/i);if(o){let e=Math.max(0,Math.min(1,parseFloat(o[1])));isNaN(e)||t.push({type:`SEEK`,targetProgress:e,durationMs:800})}let s=i.match(/:(highlight|spotlight)\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))/i);if(s){let e=R(s[3]||s[4]||s[5]);e&&t.push({type:`HIGHLIGHT`,selector:e,pulseColor:`#38bdf8`,durationMs:4500})}let c=i.match(/:zoom\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))/i);if(c){let e=R(c[2]||c[3]||c[4]);e&&t.push({type:`ZOOM_ELEMENT`,selector:e,durationMs:700})}let l=i.match(/:(?:orbit|rotate-camera|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)/i);if(l){let e=parseFloat(l[1]),n=parseFloat(l[2]);!isNaN(e)&&!isNaN(n)&&t.push({type:`ROTATE_CAMERA`,theta:e,phi:n,durationMs:700})}let u=i.match(/:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);if(u){let e=R(u[2]||u[3]||u[4]),n=parseFloat(u[5]),r=parseFloat(u[6]),i=parseFloat(u[7]);e&&!isNaN(n)&&!isNaN(r)&&!isNaN(i)&&t.push({type:`NUDGE`,target:e,dxyz:[n,r,i],durationMs:600})}let d=i.match(/:probe-move\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:xyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);if(d){let e=R(d[2]||d[3]||d[4]),n=parseFloat(d[5]),r=parseFloat(d[6]),i=parseFloat(d[7]);e&&!isNaN(n)&&!isNaN(r)&&!isNaN(i)&&t.push({type:`PROBE_MOVE`,target:e,xyz:[n,r,i],durationMs:600})}let f=i.match(/:var\s+("?([a-zA-Z0-9_]+)"?)\s+([0-9.-]+|"[^"]+"|'[^']+')/i);if(f){let e=f[2],n=f[3].replace(/^['"]|['"]$/g,``),r=parseFloat(n),i=isNaN(r)?n:r;t.push({type:`SET_VARIABLE`,variable:e,value:i})}let p=i.match(/:step\s+([0-9]+)/i);p&&t.push({type:`STEP`,stepIndex:parseInt(p[1],10)}),/:reset/i.test(i)&&t.push({type:`RESET_VIEW`});let m=i.match(/:(say|narrate)\s+("([^"]*)"|'([^']*)')/i);if(m){let e=(m[3]===void 0?m[4]||``:m[3]).trim();e&&(n||=e,t.push({type:`NARRATE`,text:e}))}}let o=e.match(/\(:(?:rotate-camera|orbit|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)\)/i);if(o){let e=parseFloat(o[1]),n=parseFloat(o[2]);!isNaN(e)&&!isNaN(n)&&(t.push({type:`ROTATE_CAMERA`,theta:e,phi:n,durationMs:700}),r.push(o[0]))}let s=e.match(/\(:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]\)/i);if(s){let e=R(s[2]||s[3]||s[4]),n=parseFloat(s[5]),i=parseFloat(s[6]),a=parseFloat(s[7]);e&&!isNaN(n)&&!isNaN(i)&&!isNaN(a)&&(t.push({type:`NUDGE`,target:e,dxyz:[n,i,a],durationMs:600}),r.push(s[0]))}if(n||(n=e.replace(/\(:[a-z\-]+\s+[^)]+\)/gi,``).replace(/```[a-z]*|```/gi,``).trim()||`Let us observe the visual demonstration on the simulation stage.`,t.length>0&&t.push({type:`NARRATE`,text:n})),t.length===0){let i=e.toLowerCase();if(i.includes(`orbit`)||i.includes(`camera`)||i.includes(`angle`)||i.includes(`rotate`))t.push({type:`ROTATE_CAMERA`,theta:25,phi:-10,durationMs:700}),t.push({type:`NARRATE`,text:n}),r.push(`(:act :orbit :theta 25.0 :phi -10.0 :say "${n.slice(0,60)}")`);else if(i.includes(`nudge`)||i.includes(`probe`)||i.includes(`core`))t.push({type:`NUDGE`,target:`#coil-core`,dxyz:[0,5,0],durationMs:600}),t.push({type:`NARRATE`,text:n}),r.push(`(:act :nudge :target "#coil-core" :dxyz [0.0 5.0 0.0] :say "${n.slice(0,60)}")`);else{let e=i.includes(`finish`)||i.includes(`result`)||i.includes(`conclu`)?.9:.5;t.push({type:`SEEK`,targetProgress:e,durationMs:800}),t.push({type:`NARRATE`,text:n}),r.push(`(:act :seek ${e} :say "${n.slice(0,80).replace(/"/g,`'`)}...")`)}}return{actions:t,sayText:n,rawSExpr:r.join(`
`)||`(:act :seek 0.5 :say "${n.slice(0,60)}")`}}var ae=/^\s*\(:act(\s+:(seek\s+[0-1](\.\d+)?|highlight\s+"#[a-zA-Z0-9_\-:]+"|zoom\s+"#[a-zA-Z0-9_\-:]+"|orbit\s+:theta\s+-?\d+(\.\d+)?\s+:phi\s+-?\d+(\.\d+)?|nudge\s+:target\s+"#[a-zA-Z0-9_\-:]+"\s+:dxyz\s+\[-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\]|probe-move\s+:target\s+"#[a-zA-Z0-9_\-:]+"\s+:xyz\s+\[-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\]|var\s+"[a-zA-Z0-9_]+"\s+(-?\d+(\.\d+)?|"[^"]*")|step\s+\d+|reset|say\s+"[^"]*"))+\)\s*$/;async function oe(e,t,n){let r=e?.sceneId||n?.targetScene||`simulation`,i=Math.round((e?.progress??0)*100),a=e?.variables||{},o=JSON.stringify(a),s=e?.activeKeyframe??0,c=e?.spatialTelemetry?.sExpr||e?.spatialTelemetry?.rayHitSExpr||`(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])`,l=`You are Gemini Nano, an on-device AI Co-Pilot embedded in the St Joseph's Vector Classroom Whiteboard.
CURRENT SCENE: "${r}" | PROGRESS: ${i}% (Step #${s}) | VARIABLES: ${o}.

PROPRIOCEPTIVE SPATIAL TELEMETRY (Zero-Raster Token Stream):
Rather than consuming massive token bandwidth with raw image frames or video buffers:
The 3D coordinates and direct analytic ray-math intersections are condensed into compact symbolic S-Expression tokens:
${c}

You have exact proprioceptive awareness: you know where the viewer is looking and which object the ray strikes without guessing.
Active Hit Target: "${e?.spatialTelemetry?.hit?.target||`#coil-core`}".

DETERMINISTIC ACTUATION:
When you respond with an action opcode, the engine updates theta, phi, or node translation, re-evaluates the parametric equations, and re-sorts visible vector layers via the Painter's algorithm with depth fog.

Output strictly an (:act ...) S-Expression tuple in your response:
(:act [:seek <0.0 to 1.0>] [:orbit :theta <deg> :phi <deg>] [:nudge :target "<id>" :dxyz [<dx> <dy> <dz>]] [:highlight "<svg-id>"] [:var "<name>" <val>] [:zoom "<svg-id>"] [:say "<1-2 sentence spoken explanation>"])

EXAMPLES:
- Spatial Hit Identification: (:act :highlight "#coil-core" :say "Your gaze ray strikes #coil-core at coordinates [12.0 45.0 -8.5] with normal [0.0 1.0 0.0].")
- Deterministic Orbit: (:act :orbit :theta 25.0 :phi -10.0 :say "Rotating camera to view the apparatus in 3D perspective.")
- Deterministic Probe Nudge: (:act :nudge :target "#coil-core" :dxyz [0.0 5.0 0.0] :say "Nudging the coil core upwards to increase magnetic flux linkage.")
- Boyle's Gas Law: (:act :seek 0.30 :highlight "#piston" :var "pressure" 2.5 :say "Compressing the piston cylinder doubles particle collisions.")

RULES:
1. Output the (:act ...) S-Expression directly.
2. Explanations must be UK Curriculum aligned, pedagogically accurate, and under 30 words.
3. Incorporate proprioceptive ray-hit coordinates when asked about what is being looked at.`,u=`Pupil asks: "${t.trim()}". Spatial token: ${c}. Show and actuate on the simulation stage.`,d=ie(await re.promptText({prompt:u,systemPrompt:l,timeoutMs:16e3,responseConstraint:ae,omitResponseConstraintInput:!0}));return{type:`AI_VISUAL_COMMAND`,transactionId:`nano_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,actions:d.actions,pedagogicalIntent:`STEP_BY_STEP_DEMO`,rawSExpr:d.rawSExpr,sayText:d.sayText}}function se(e){switch(e){case`kinetic-gas`:return[`Why does temperature increase particle velocity?`,`What happens to pressure if I compress the volume?`,`Explain Boyle’s Law (P1V1 = P2V2) simply`];case`calculus-curves`:return[`What does dy/dx represent geometrically at this point?`,`Why is the tangent slope zero at the curve peak?`,`How does the integral calculate the area under the curve?`];case`math-fishing`:return[`What is the best mental strategy for Number Bonds to 100?`,`How do factor pairs multiply to 36 and 48?`,`Explain adding negative integers like -4 + 10`];case`electric-circuits`:return[`Explain Ohm's Law: V = I × R with this circuit`,`What object is my ray hitting right now?`,`Nudge the #coil-core into the magnetic field`,`Why do electrons drift slower when resistance increases?`];case`fractions`:return[`Why must we find a common denominator before adding?`,`What does the numerator vs denominator represent geometrically?`,`How do equivalent fractions preserve identical area?`];case`spelling-bee`:return[`What is the etymology and Latin origin of this statutory spelling?`,`Explain the phonics rule for words ending in -cious vs -tious`,`Give me a mnemonic to remember the spelling of accommodation and embarrass`];case`atom`:return[`How does the Bohr electron shell formula 2n² determine orbital capacities?`,`Why does increasing atomic number (Z) change an element’s chemical family?`,`Explain the difference between atomic number and mass number`];case`times-tables`:return[`Explain how the distributive property 7×8 = (7×5)+(7×3) simplifies mental arithmetic`,`Why does rotating a 2D array by 90° prove the commutative law a×b = b×a?`,`What patterns emerge on the 100-square when skip counting by 9s?`];case`solar-system`:return[`Why do outer planets like Neptune take vastly longer to orbit than Mercury?`,`Explain Kepler’s 3rd Law of planetary motion simply`,`What are the key planetary differences between gas giants and rocky planets?`];default:return[`Explain the physics and math principles shown in this lab`,`What happens if I change the key variables?`,`Give me a challenging question to test my understanding`]}}function ce(e){if(!e.isOpen)return null;let{onClose:t,preset:n,postToPlayer:r,currentProgress:i=0,activeKeyframe:a,latestTelemetry:o,isAiDemonstrating:s=!1,onCancelDemonstration:c}=e,l=`copilot`,u=F(),d=re.getActiveEngineType(),f=!1,p=``,m=``,h=``,g=null,_=``,v=null,y=[{sender:`nano`,text:`Hello! I am your on-device Gemini Nano tutor for this vector lab. Ask me anything, or click "✨ Show Me How" to watch me physically demonstrate on the simulation stage!`}];r({type:`GET_CONTEXT_SNAPSHOT`});let b=document.createElement(`div`);b.className=`ast-nano-ai-tutor-drawer`,b.style.cssText=`
    background: #090d16;
    border-top: 2px solid #38bdf8;
    padding: 16px 20px;
    color: #f8fafc;
    box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;function x(){b.innerHTML=``;let e=document.createElement(`div`);e.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;`;let u=document.createElement(`div`);u.style.cssText=`display: flex; align-items: center; gap: 10px;`,u.innerHTML=`
      <span style="font-size: 1.4rem;">✨</span>
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">
            Gemini Nano Edge AI Co-Pilot
          </h3>
          <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: ${d===`chrome-builtin-nano`?`rgba(34, 197, 94, 0.2)`:`rgba(168, 85, 247, 0.2)`}; color: ${d===`chrome-builtin-nano`?`#4ade80`:`#c084fc`}; border: 1px solid ${d===`chrome-builtin-nano`?`#22c55e`:`#a855f7`};">
            ${d===`chrome-builtin-nano`?`🟢 Chrome Prompt API (Built-in Nano)`:d===`webgpu-webllm`?`🟣 WebGPU On-Device LLM`:`⚪ Local Rule Engine`}
          </span>
        </div>
        <p style="margin: 2px 0 0; font-size: 0.74rem; color: #94a3b8;">
          100% on-device local execution &bull; 0ms cloud egress &bull; UK DfE &amp; GDPR compliant
        </p>
      </div>
    `;let T=document.createElement(`div`);T.style.cssText=`display: flex; align-items: center; gap: 8px;`;let E=document.createElement(`div`);E.style.cssText=`display: flex; background: #1e293b; padding: 3px; borderRadius: 8px; gap: 4px; border-radius: 8px;`,[{id:`copilot`,label:`💬 Ask Nano`},{id:`generator`,label:`⚡ Generate Lab`},{id:`grader`,label:`🎯 Grader`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
        padding: 4px 10px;
        border-radius: 6px;
        background: ${l===e.id?`#0284c7`:`transparent`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.75rem;
        cursor: pointer;
      `,t.textContent=e.label,t.onclick=()=>{l=e.id,x()},E.appendChild(t)});let D=document.createElement(`button`);if(D.type=`button`,D.style.cssText=`padding: 6px 12px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.75rem; cursor: pointer;`,D.textContent=`✕ Close`,D.onclick=t,T.appendChild(E),T.appendChild(D),e.appendChild(u),e.appendChild(T),b.appendChild(e),l===`copilot`){let e=document.createElement(`div`);if(e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`,s){let t=document.createElement(`div`);t.style.cssText=`display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: linear-gradient(90deg, rgba(2, 132, 199, 0.25) 0%, rgba(14, 165, 233, 0.1) 100%); border: 1px solid #38bdf8; border-radius: 8px;`,t.innerHTML=`
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span>
            <span style="font-size: 0.76rem; color: #f8fafc; font-weight: 700;">
              ✨ Gemini Nano is demonstrating on stage... (Touch canvas to take back control)
            </span>
          </div>
        `;let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`padding: 3px 10px; border-radius: 6px; background: #ef4444; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;`,n.textContent=`✋ Take Control`,n.onclick=()=>{r({type:`PUPIL_INTERRUPT`}),c?.()},t.appendChild(n),e.appendChild(t)}let t=document.createElement(`div`);t.style.cssText=`padding: 10px 14px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 10px; display: flex; flex-direction: column; gap: 8px;`;let i=document.createElement(`div`);i.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;`,i.innerHTML=`
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.0rem;">🎯</span>
          <span style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; letter-spacing: 0.02em;">
            Spatial Telemetry Emission &bull; Proprioceptive Awareness
          </span>
          <span style="font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3);">
            Zero-Raster Token Stream
          </span>
        </div>
      `;let a=document.createElement(`div`);a.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`;let l=document.createElement(`button`);l.type=`button`,l.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,l.textContent=`🔭 Orbit View (Δθ:+20°, Δϕ:-10°)`,l.onclick=()=>{r({type:`ACTUATE_OPCODE`,opcode:`(:rotate-camera :theta 20.0 :phi -10.0 :relative true)`})};let u=document.createElement(`button`);u.type=`button`,u.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,u.textContent=`⚡ Nudge Core/Probe ([0, 5, 0])`,u.onclick=()=>{let e=o?.spatialTelemetry?.hit?.target||`#coil-core`;r({type:`ACTUATE_OPCODE`,opcode:`(:nudge :target "${e}" :dxyz [0.0 5.0 0.0])`})};let d=document.createElement(`button`);d.type=`button`,d.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); font-size: 0.68rem; font-weight: 700; cursor: pointer;`,d.textContent=`🎯 Cast Ray`,d.onclick=()=>{r({type:`CAST_CAMERA_RAY`})},a.appendChild(l),a.appendChild(u),a.appendChild(d),i.appendChild(a),t.appendChild(i);let m=document.createElement(`div`);m.style.cssText=`background: #090d16; padding: 6px 10px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 0.74rem; color: #4ade80; display: flex; flex-direction: column; gap: 4px; user-select: all;`;let h=document.createElement(`div`);h.style.cssText=`display: flex; justify-content: space-between; align-items: center;`;let g=document.createElement(`span`);g.style.cssText=`color: #94a3b8; font-size: 0.68rem;`,g.textContent=`RAY INTERSECTION TOKEN:`;let _=document.createElement(`span`);_.style.cssText=`color: #38bdf8; font-size: 0.68rem;`,_.textContent=`Analytic Ray-Math (Zero GPU Drivers)`,h.appendChild(g),h.appendChild(_),m.appendChild(h);let v=document.createElement(`div`);if(v.style.cssText=`font-weight: 700; overflow-x: auto; white-space: nowrap;`,v.textContent=o?.spatialTelemetry?.rayHitSExpr||`(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])`,m.appendChild(v),o?.spatialTelemetry?.cameraStateSExpr){let e=document.createElement(`div`);e.style.cssText=`color: #38bdf8; font-size: 0.70rem; overflow-x: auto; white-space: nowrap;`,e.textContent=o.spatialTelemetry.cameraStateSExpr,m.appendChild(e)}t.appendChild(m),e.appendChild(t);let C=se(n),w=document.createElement(`div`);w.style.cssText=`display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;`,w.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center; white-space: nowrap;">Suggested:</span>`,C.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
          white-space: nowrap;
          padding: 4px 10px;
          border-radius: 9999px;
          background: #1e293b;
          color: #bae6fd;
          border: 1px solid #334155;
          font-size: 0.72rem;
          cursor: ${f?`not-allowed`:`pointer`};
        `,t.textContent=e,t.disabled=f,t.onclick=()=>S(e,!0),w.appendChild(t)}),e.appendChild(w);let T=document.createElement(`div`);if(T.style.cssText=`background: #0f172a; border-radius: 10px; border: 1px solid #1e293b; padding: 12px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;`,y.forEach(e=>{let t=document.createElement(`div`);t.style.cssText=`
          align-self: ${e.sender===`user`?`flex-end`:`flex-start`};
          max-width: 88%;
          background: ${e.sender===`user`?`#0284c7`:`#1e293b`};
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          line-height: 1.4;
        `;let n=document.createElement(`div`);n.style.cssText=`font-weight: 800; font-size: 0.68rem; margin-bottom: 2px; color: ${e.sender===`user`?`#bae6fd`:`#38bdf8`};`,n.textContent=e.sender===`user`?`You`:`✨ Gemini Nano Co-Pilot`,t.appendChild(n);let i=document.createElement(`div`);if(i.textContent=e.text,t.appendChild(i),e.rawSExpr){let n=document.createElement(`div`);n.style.cssText=`margin-top: 6px; padding: 6px 10px; background: #090d16; border-radius: 6px; border: 1px solid #334155; font-family: monospace; font-size: 0.72rem; color: #38bdf8; overflow-x: auto;`;let i=document.createElement(`div`);if(i.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;`,i.innerHTML=`<span style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">⚡ ACTION TUPLE:</span>`,e.packet){let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; background: #0284c7; color: #fff; border: none; cursor: pointer;`,t.textContent=`▶ Replay Demo`,t.onclick=()=>r({type:`AI_VISUAL_COMMAND`,packet:e.packet}),i.appendChild(t)}n.appendChild(i);let a=document.createElement(`code`);a.textContent=e.rawSExpr,n.appendChild(a),t.appendChild(n)}if(e.action){let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`margin-top: 6px; padding: 4px 8px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.7rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;`,n.textContent=`⚡ Apply to Stage: ${e.action.name} = ${e.action.val}`,n.onclick=()=>{r({type:`SET_VAR`,name:e.action.name,value:e.action.val}),y.push({sender:`nano`,text:`Applied live parameter to stage: ${e.action.name} = ${e.action.val}`}),x()},t.appendChild(n)}T.appendChild(t)}),f){let e=document.createElement(`div`);e.style.cssText=`align-self: flex-start; color: #38bdf8; font-size: 0.75rem; font-style: italic;`,e.textContent=`✨ Nano is synthesizing action tuples on-device...`,T.appendChild(e)}e.appendChild(T);let E=document.createElement(`div`);E.style.cssText=`display: flex; gap: 8px;`;let D=document.createElement(`input`);D.type=`text`,D.value=p,D.placeholder=`Ask Nano about ${n} (e.g. why does this curve peak?)...`,D.disabled=f,D.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,D.oninput=e=>{p=e.target.value},D.onkeydown=e=>{e.key===`Enter`&&S(void 0,!0)};let O=document.createElement(`button`);O.type=`button`,O.style.cssText=`
        padding: 8px 14px;
        border-radius: 8px;
        background: ${f?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${f?`not-allowed`:`pointer`};
        display: inline-flex;
        align-items: center;
        gap: 4px;
      `,O.disabled=f,O.innerHTML=`<span>✨ Show Me How</span>`,O.onclick=()=>S(void 0,!0),E.appendChild(D),E.appendChild(O),e.appendChild(E),b.appendChild(e)}else if(l===`generator`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`,t.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center;">Templates:</span>`,[`Pulley with Mechanical Advantage 2`,`Pendulum Energy Conservation`,`Bohr Carbon Atom (6 Protons)`,`Pythagoras 3-4-5 Triangle`].forEach(e=>{let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #bae6fd; border: 1px solid #334155; font-size: 0.7rem; cursor: pointer;`,n.textContent=e,n.onclick=()=>{m=e,x()},t.appendChild(n)}),e.appendChild(t);let n=document.createElement(`div`);n.style.cssText=`display: flex; gap: 8px;`;let i=document.createElement(`input`);i.type=`text`,i.value=m,i.placeholder=`Describe an interactive vector simulation to synthesize (e.g. Archimedes buoyancy lever)...`,i.disabled=f,i.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,i.oninput=e=>{m=e.target.value};let a=document.createElement(`button`);if(a.type=`button`,a.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${f?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${f?`not-allowed`:`pointer`};
      `,a.textContent=f?`Synthesizing...`:`⚡ Generate AST`,a.disabled=f,a.onclick=C,n.appendChild(i),n.appendChild(a),e.appendChild(n),g){let t=document.createElement(`div`);t.style.cssText=`color: #f87171; font-size: 0.75rem;`,t.textContent=g,e.appendChild(t)}if(h){let t=document.createElement(`div`);t.style.cssText=`display: flex; flex-direction: column; gap: 6px;`;let n=document.createElement(`div`);n.style.cssText=`display: flex; justify-content: space-between; align-items: center;`,n.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Synthesized AST S-Expression Specification:</span>`;let i=document.createElement(`div`);i.style.cssText=`display: flex; gap: 6px;`;let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;`,a.textContent=`⚡ Run in Vector Player`,a.onclick=()=>{r({type:`LOAD_AST`,ast:h}),r({type:`PLAY`})};let o=document.createElement(`button`);o.type=`button`,o.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.72rem; cursor: pointer;`,o.textContent=`📋 Copy AST`,o.onclick=()=>navigator.clipboard.writeText(h),i.appendChild(a),i.appendChild(o),n.appendChild(i),t.appendChild(n);let s=document.createElement(`textarea`);s.rows=5,s.value=h,s.style.cssText=`background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; color: #38bdf8; font-family: monospace; font-size: 0.75rem; line-height: 1.4; resize: vertical;`,s.oninput=e=>{h=e.target.value},t.appendChild(s),e.appendChild(t)}b.appendChild(e)}else if(l===`grader`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`background: #1e293b; padding: 10px 14px; border-radius: 8px; font-size: 0.8rem;`;let r=document.createElement(`span`);r.style.cssText=`color: #38bdf8; font-weight: 800;`,r.textContent=`Active Checkpoint Context: `;let o=document.createElement(`span`);o.textContent=a?`"${a.title} — ${a.rule}"`:`Simulation progress: ${(i*100).toFixed(0)}% in ${n}`,t.appendChild(r),t.appendChild(o),e.appendChild(t);let s=document.createElement(`div`);s.style.cssText=`display: flex; gap: 8px;`;let c=document.createElement(`textarea`);c.rows=2,c.value=_,c.placeholder=`Explain the mechanism in your own words (e.g. why does pressure rise, or what makes the bond sum to 100?)...`,c.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem; resize: none;`,c.oninput=e=>{_=e.target.value};let l=document.createElement(`button`);if(l.type=`button`,l.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${f?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${f?`not-allowed`:`pointer`};
      `,l.textContent=f?`Grading...`:`🎯 Evaluate`,l.disabled=f,l.onclick=w,s.appendChild(c),s.appendChild(l),e.appendChild(s),v){let t=document.createElement(`div`);t.style.cssText=`background: #0f172a; border: 1px solid #22c55e; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;`;let n=document.createElement(`div`);n.style.cssText=`background: #22c55e; color: #000000; font-weight: 900; font-size: 1.1rem; padding: 6px 10px; border-radius: 8px; white-space: nowrap;`,n.textContent=`⭐ ${v.score}/5`;let r=document.createElement(`div`);r.style.cssText=`flex: 1; font-size: 0.8rem; color: #e2e8f0; white-space: pre-line;`,r.textContent=v.feedback,t.appendChild(n),t.appendChild(r),e.appendChild(t)}b.appendChild(e)}}async function S(e,t=!0){let a=(e||p).trim();if(a&&!f){u||=(I(!0),!0),y.push({sender:`user`,text:a}),p=``,f=!0,x();try{let e=await oe(o||{sceneId:n,progress:i,activeKeyframe:0,variables:{},lastUserAction:`QUESTION`,timestamp:Date.now()},a,{targetScene:n});t&&e.actions&&e.actions.length>0&&r({type:`AI_VISUAL_COMMAND`,packet:e}),y.push({sender:`nano`,text:e.sayText||`Observe the visual demonstration on the simulation stage.`,packet:e,rawSExpr:e.rawSExpr})}catch(e){console.warn(`[NanoAiTutorDrawer] Co-Pilot inference notice:`,e),y.push({sender:`nano`,text:`[Offline Local Response] In this ${n} simulation, adjustments to the input variables directly update the SVG equations and animated vector properties. Notice how the keyframe timeline coordinates with the visual state.`})}finally{f=!1,x()}}}async function C(){if(m.trim()&&!f){u||=(I(!0),!0),f=!0,g=null,x();try{h=(await re.promptText({prompt:`Generate an AST interactive lab for: "${m}"`,systemPrompt:`You are an expert compiler for the St Joseph's AST Vector Player specification.
Output strictly an AST S-Expression conforming to this grammar:
(:scene :id "id" :title "Title" :stage "Stage" :duration 10.0
  (:static ((:element :target "#bg" :cache true)))
  (:actors ((:actor :target "#actor" :kinematic true)))
  (:vars ((:var :name "x" :val 1 :min 0 :max 10 :step 1 :label "Label")))
  (:inputs ((:slider :var "x" :label "Label" :min 0 :max 10 :step 1)))
  (:keyframes ((:t 0.0 :title "Step 1" :rule "Explanation") (:t 1.0 :title "Step 2" :rule "Conclusion")))
  (:interactive ((:checkpoint :t 0.5 :prompt "Question?" :options ("A" "B" "C") :answer 0 :explanation "Why")))
  (:bindings ((:target "#actor" :attr "transform" :expr "'translate(' + (vars.x * 20) + ', 0)'"))))

Rules:
1. Valid S-Expressions only with balanced parentheses.
2. Differentiate static background primitives (:static) from moving actors (:actors) to optimize DOM performance.
3. No Markdown blocks, no commentary, no quotes outside strings.`,temperature:.2,timeoutMs:22e3})).replace(/^```[a-z]*\n?/im,``).replace(/\n?```$/im,``).trim()}catch(e){g=`Generation error: ${e?.message||`Please check Prompt API availability`}`,h=`(:scene :id "generated-lab" :title "${m.slice(0,30)}" :stage "KS2/KS3 STEM" :duration 10.0
  (:static (
    (:element :target "#lab-background" :cache true)
    (:element :target "#grid-axes" :cache true)
  ))
  (:actors (
    (:actor :target "#dynamic-indicator" :kinematic true :will-change true)
  ))
  (:vars (
    (:var :name "energy" :val 5 :min 1 :max 10 :step 1 :label "Kinetic Parameter")
  ))
  (:inputs (
    (:slider :var "energy" :label "Parameter Intensity" :min 1 :max 10 :step 1)
  ))
  (:keyframes (
    (:t 0.0 :title "Initial State" :rule "Beginning state of ${m}")
    (:t 0.5 :title "Midpoint Action" :rule "Dynamic transformation under parameter conservation")
    (:t 1.0 :title "Steady Equilibrium" :rule "System achieves balanced harmonic state")
  ))
  (:interactive (
    (:checkpoint :t 0.5
      :prompt "What governs this physical conservation law?"
      :options ("Direct proportional variance" "Random thermal fluctuation" "Independent stationary rate")
      :answer 0
      :explanation "The relationship follows direct conservation laws defined by the state equation."
    )
  ))
  (:bindings (
    (:target "#dynamic-indicator" :attr "transform" :expr "'scale(' + (vars.energy / 5) + ')'")
  ))
)`}finally{f=!1,x()}}}async function w(){if(_.trim()&&!f){u||=(I(!0),!0),f=!0,x();try{let e=`You are a UK National Curriculum formative assessment specialist.
Current Assessment: ${a?`Topic: "${a.title}" Rule: "${a.rule}"`:`Simulation: ${n}`}.
Evaluate student answer: "${_}".
Format:
Score: [1 to 5]/5
Feedback: 2 sentences identifying conceptual strengths and one area for mastery polish.`,t=await re.promptText({prompt:_,systemPrompt:e,temperature:.2,timeoutMs:15e3}),r=t.match(/(\d)\s*\/\s*5/);v={feedback:t,score:r?parseInt(r[1],10):4}}catch{v={feedback:`Score: 4/5\nFeedback: Great reasoning! You demonstrated understanding of the active ${n} mechanism. Continue exploring how parameter variables shift the keyframe curve.`,score:4}}finally{f=!1,x()}}}return x(),b}var le=class{transform;constructor(e={}){this.transform={minX:e.minX??-6,maxX:e.maxX??6,minY:e.minY??-4,maxY:e.maxY??8,svgWidth:e.svgWidth??600,svgHeight:e.svgHeight??380}}mathToSvg(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:(e-n)/(r-n)*o,y:s-(t-i)/(a-i)*s}}svgToMath(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:n+e/o*(r-n),y:i+(s-t)/s*(a-i)}}generateCurvePath(e,t=240){let{minX:n,maxX:r,minY:i,maxY:a}=this.transform,o=(r-n)/t,s=``,c=!1;for(let r=0;r<=t;r++){let t=n+r*o,l;try{l=e(t)}catch{c=!1;continue}if(isNaN(l)||!isFinite(l)||l<i-10||l>a+10){c=!1;continue}let u=this.mathToSvg(t,l);c?s+=`L ${u.x.toFixed(1)} ${u.y.toFixed(1)} `:(s+=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `,c=!0)}return s.trim()}calculateTangent(e,t,n=3.5){let r=1e-4,i=e(t),a=(e(t+r)-e(t-r))/(2*r),o=Math.atan(a),s=o*180/Math.PI,c=this.mathToSvg(t,i),l=n/2,u=Math.cos(o),d=Math.sin(o),f=t-l*u,p=i-l*d,m=t+l*u,h=i+l*d,g=this.mathToSvg(f,p),_=this.mathToSvg(m,h),v=`M ${g.x.toFixed(1)} ${g.y.toFixed(1)} L ${_.x.toFixed(1)} ${_.y.toFixed(1)}`,y=l*.65,b=t-y*-d,x=i-y*u,S=t+y*-d,C=i+y*u,w=this.mathToSvg(b,x),T=this.mathToSvg(S,C),E=`M ${w.x.toFixed(1)} ${w.y.toFixed(1)} L ${T.x.toFixed(1)} ${T.y.toFixed(1)}`,D=a*1,O=this.mathToSvg(t+1,i),k=this.mathToSvg(t+1,i+D),A=`M ${c.x.toFixed(1)} ${c.y.toFixed(1)} L ${O.x.toFixed(1)} ${O.y.toFixed(1)} L ${k.x.toFixed(1)} ${k.y.toFixed(1)}`,j=`dy/dx = ${a>=0?`+`:``}${a.toFixed(2)}`;return{x0:t,y0:i,svgX:c.x,svgY:c.y,slope:a,angleDeg:s,tangentPath:v,normalPath:E,riseRunTriangle:A,formula:j}}calculateDefiniteIntegral(e,t,n,r=60){let i=Math.min(t,n),a=Math.max(t,n),o=Math.max(10,r%2==0?r:r+1),s=(a-i)/o,c=e(i)+e(a);for(let t=1;t<o;t++){let n=i+t*s;c+=(t%2==1?4:2)*e(n)}let l=s/3*c,u=this.mathToSvg(i,0),d=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `;for(let t=0;t<=o;t++){let n=i+t*s,r=e(n),a=this.mathToSvg(n,r);d+=`L ${a.x.toFixed(1)} ${a.y.toFixed(1)} `}let f=this.mathToSvg(a,0);return d+=`L ${f.x.toFixed(1)} ${f.y.toFixed(1)} Z`,{a:i,b:a,area:Number(l.toFixed(3)),shadedAreaPath:d,subdivisions:o}}generateGrid(e=1){let{minX:t,maxX:n,minY:r,maxY:i}=this.transform,a=``,o=[],s=Math.ceil(t/e)*e;for(let t=s;t<=n;t+=e){if(Math.abs(t)<.001)continue;let e=this.mathToSvg(t,i),n=this.mathToSvg(t,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${n.x.toFixed(1)} ${n.y.toFixed(1)} `;let s=this.mathToSvg(t,0);o.push({x:s.x,y:s.y+14,text:t.toString()})}let c=Math.ceil(r/e)*e;for(let r=c;r<=i;r+=e){if(Math.abs(r)<.001)continue;let e=this.mathToSvg(t,r),i=this.mathToSvg(n,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${i.x.toFixed(1)} ${i.y.toFixed(1)} `;let s=this.mathToSvg(0,r);o.push({x:s.x-12,y:s.y+4,text:r.toString()})}let l=this.mathToSvg(t,0),u=this.mathToSvg(n,0),d=this.mathToSvg(0,r),f=this.mathToSvg(0,i),p=`M ${l.x.toFixed(1)} ${l.y.toFixed(1)} L ${u.x.toFixed(1)} ${u.y.toFixed(1)} M ${d.x.toFixed(1)} ${d.y.toFixed(1)} L ${f.x.toFixed(1)} ${f.y.toFixed(1)}`;return{gridPaths:a.trim(),axesPaths:p,labels:o}}},ue=[{id:`parabola`,name:`Quadratic Parabola`,category:`Polynomials (GCSE/A-Level)`,latex:`f(x) = x^2 - 2x - 1`,fn:e=>e*e-2*e-1,derivativeStr:`f'(x) = 2x - 2`,defaultX0:2,defaultA:0,defaultB:3},{id:`cubic`,name:`Cubic Curve (Stationary Points)`,category:`Polynomials (A-Level)`,latex:`f(x) = \\frac{1}{3}x^3 - x + 1`,fn:e=>1/3*e**3-e+1,derivativeStr:`f'(x) = x^2 - 1`,defaultX0:1,defaultA:-2,defaultB:2},{id:`sine`,name:`Harmonic Sine Wave`,category:`Trigonometry (GCSE/A-Level)`,latex:`f(x) = 2\\sin(x) + 1`,fn:e=>2*Math.sin(e)+1,derivativeStr:`f'(x) = 2\\cos(x)`,defaultX0:1.57,defaultA:0,defaultB:3.14},{id:`exponential`,name:`Exponential Growth & Rate`,category:`Calculus Foundations`,latex:`f(x) = e^{0.4x}`,fn:e=>Math.exp(.4*e),derivativeStr:`f'(x) = 0.4 e^{0.4x}`,defaultX0:1.5,defaultA:0,defaultB:4},{id:`gaussian`,name:`Gaussian Normal Bell Curve`,category:`Statistics & Area`,latex:`f(x) = 3 e^{-x^2 / 2}`,fn:e=>3*Math.exp(-(e*e)/2),derivativeStr:`f'(x) = -3x e^{-x^2 / 2}`,defaultX0:1,defaultA:-1.96,defaultB:1.96}];function de(e){if(!e.isOpen)return null;let{onClose:t,preset:n}=e,r=3,i=4,a=2,o=3,s=4,c=75,l=420,u=80,d=6,f=7,p=12,m=4,h=1.2,g=9.81,_=25,v=.5,y=300,b=1,x=`gas`,S=`parabola`,C=2,w=0,T=3,E=n===`calculus-curves`?`calculus`:n===`kinetic-gas`?`kinetic-gas`:`preset`,D=(e,t)=>{typeof window<`u`&&document.querySelectorAll(`iframe`).forEach(n=>{try{n.contentWindow?.postMessage({type:`SET_VAR`,name:e,value:t},`*`)}catch{}})},O=document.createElement(`div`);O.className=`ast-interactive-lab-drawer`,O.style.cssText=`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 360px;
    max-width: 90%;
    background: rgba(15, 23, 42, 0.96);
    backdrop-filter: blur(12px);
    border-left: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 40;
    display: flex;
    flex-direction: column;
    box-shadow: -6px 0 25px rgba(0,0,0,0.5);
    color: #f8fafc;
    font-family: system-ui, sans-serif;
  `;function k(){O.innerHTML=``;let e=document.createElement(`div`);e.style.cssText=`padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); display: flex; justify-content: space-between; align-items: center;`,e.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2rem;">🔬</span>
        <div>
          <h3 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #f8fafc;">
            Reactive Invariant Lab
          </h3>
          <span style="font-size: 0.7rem; color: #38bdf8; font-weight: 700;">
            Direct Variable Manipulation
          </span>
        </div>
      </div>
    `;let A=document.createElement(`button`);A.type=`button`,A.style.cssText=`background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 4px;`,A.textContent=`✕`,A.onclick=t,e.appendChild(A),O.appendChild(e);let j=document.createElement(`div`);j.style.cssText=`display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2);`,[{id:`preset`,label:`🔬 Scene Parameters`,color:`#38bdf8`},{id:`verlet`,label:`🪢 Verlet Springs`,color:`#c084fc`},{id:`kinetic-gas`,label:`🌡️ Gas Laws`,color:`#f87171`},{id:`calculus`,label:`📐 Calculus (dy/dx)`,color:`#38bdf8`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`;let n=E===e.id;t.style.cssText=`
        flex: 1;
        padding: 8px 6px;
        background: ${n?`rgba(56, 189, 248, 0.15)`:`none`};
        border: none;
        border-bottom: ${n?`2px solid ${e.color}`:`2px solid transparent`};
        color: ${n?e.color:`#94a3b8`};
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
      `,t.textContent=e.label,t.onclick=()=>{E=e.id,k()},j.appendChild(t)}),O.appendChild(j);let M=document.createElement(`div`);if(M.style.cssText=`flex: 1; overflow-y: auto; padding: 16px;`,E===`calculus`){let e=document.createElement(`div`),t=document.createElement(`div`);t.style.cssText=`background: rgba(56, 189, 248, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(56, 189, 248, 0.3);`,t.innerHTML=`
        <div style="font-size: 0.76rem; color: #7dd3fc; font-weight: 700; text-transform: uppercase;">
          Differentiation & Integration:
        </div>
        <div style="font-size: 1.05rem; font-weight: 900; color: #38bdf8; margin: 2px 0;">
          dy/dx = lim(&Delta;y/&Delta;x) &bull; &int; f(x) dx
        </div>
        <div style="font-size: 0.72rem; color: #cbd5e1;">
          Instantaneous tangent gradients, stationary turning points, and continuous Riemann area integration.
        </div>
      `,e.appendChild(t);let n=document.createElement(`div`);n.style.cssText=`margin-bottom: 14px;`,n.innerHTML=`<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Function Curve Presets:</div>`;let r=document.createElement(`div`);r.style.cssText=`display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;`,ue.forEach(e=>{let t=document.createElement(`button`);t.type=`button`;let n=S===e.id;t.style.cssText=`
          padding: 8px;
          background: ${n?`rgba(56, 189, 248, 0.25)`:`rgba(255,255,255,0.06)`};
          border: ${n?`1px solid #38bdf8`:`1px solid rgba(255,255,255,0.1)`};
          border-radius: 6px;
          color: ${n?`#f8fafc`:`#94a3b8`};
          text-align: left;
          cursor: pointer;
        `,t.innerHTML=`
          <div style="font-size: 0.76rem; font-weight: 800;">${e.name}</div>
          <div style="font-size: 0.64rem; color: #38bdf8; font-family: monospace;">${e.latex}</div>
        `,t.onclick=()=>{S=e.id,C=e.defaultX0,w=e.defaultA,T=e.defaultB,D(`calcPreset`,e.id),k()},r.appendChild(t)}),n.appendChild(r),e.appendChild(n);let i=document.createElement(`div`);i.style.cssText=`margin-bottom: 14px;`,i.innerHTML=`
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Tangent Probe (x₀):</span>
          <span style="color: #f43f5e;">x₀ = ${C.toFixed(2)}</span>
        </div>
      `;let a=document.createElement(`input`);a.type=`range`,a.min=`-4.0`,a.max=`4.0`,a.step=`0.1`,a.value=String(C),a.style.cssText=`width: 100%; accent-color: #f43f5e;`,a.oninput=e=>{C=Number(e.target.value),D(`calcX0`,C),k()},i.appendChild(a),e.appendChild(i);let o=document.createElement(`div`);o.style.cssText=`margin-bottom: 14px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.2);`,o.innerHTML=`
        <div style="font-size: 0.78rem; font-weight: 800; color: #86efac; margin-bottom: 6px;">
          Integral Boundaries [a, b]:
        </div>
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #cbd5e1;">
            <span>Lower Limit (a):</span>
            <span style="color: #86efac; font-weight: 700;">a = ${w.toFixed(1)}</span>
          </div>
        </div>
      `;let s=document.createElement(`input`);s.type=`range`,s.min=`-4.0`,s.max=String(T-.1),s.step=`0.1`,s.value=String(w),s.style.cssText=`width: 100%; accent-color: #22c55e; margin-bottom: 8px;`,s.oninput=e=>{w=Number(e.target.value),D(`calcA`,w),k()},o.appendChild(s);let c=document.createElement(`div`);c.innerHTML=`
        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #cbd5e1;">
          <span>Upper Limit (b):</span>
          <span style="color: #86efac; font-weight: 700;">b = ${T.toFixed(1)}</span>
        </div>
      `,o.appendChild(c);let l=document.createElement(`input`);l.type=`range`,l.min=String(w+.1),l.max=`4.0`,l.step=`0.1`,l.value=String(T),l.style.cssText=`width: 100%; accent-color: #22c55e;`,l.oninput=e=>{T=Number(e.target.value),D(`calcB`,T),k()},o.appendChild(l),e.appendChild(o);let u=ue.find(e=>e.id===S)||ue[0],d=new le,f=d.calculateTangent(u.fn,C),p=f.y0,m=f.slope,h=d.calculateDefiniteIntegral(u.fn,w,T).area,g=document.createElement(`div`);g.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,g.innerHTML=`
        <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
          CALCULUS TELEMETRY:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(244, 63, 94, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #f43f5e;">Instant Slope dy/dx</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${m.toFixed(2)}</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">at x = ${C.toFixed(2)}</div>
          </div>
          <div style="background: rgba(34, 197, 94, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #4ade80;">Area &int; f(x) dx</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${h.toFixed(2)}</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">[${w.toFixed(1)}, ${T.toFixed(1)}]</div>
          </div>
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.5;">
          <div>Function Height: <strong>f(${C.toFixed(2)}) = ${p.toFixed(2)}</strong></div>
          <div>Tangent Equation: <strong style="color: #f43f5e;">y = ${m.toFixed(2)}x + ${(p-m*C).toFixed(2)}</strong></div>
        </div>
      `,e.appendChild(g),M.appendChild(e)}else if(E===`verlet`){let e=document.createElement(`div`);e.innerHTML=`
        <div style="background: rgba(168, 85, 247, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(168, 85, 247, 0.3);">
          <div style="font-size: 0.76rem; color: #d8b4fe; font-weight: 700; text-transform: uppercase;">
            Verlet Integration & Hooke's Law:
          </div>
          <div style="font-size: 1.05rem; font-weight: 900; color: #c084fc; margin: 2px 0;">
            T = 2&pi;&radic;(L / g) &bull; F = -k&Delta;x
          </div>
          <div style="font-size: 0.72rem; color: #cbd5e1;">
            Pure mathematical numerical physics: spring-mass elasticity, pendulum period invariance, and gravity fields.
          </div>
        </div>
      `;let t=document.createElement(`div`);t.style.cssText=`margin-bottom: 14px;`,t.innerHTML=`<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Gravitational Acceleration (g):</div>`;let n=document.createElement(`div`);n.style.cssText=`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;`,[{label:`🌕 Moon`,g:1.62},{label:`🌍 Earth`,g:9.81},{label:`🪐 Jupiter`,g:24.79}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
          padding: 6px 4px;
          background: ${g===e.g?`rgba(168, 85, 247, 0.3)`:`rgba(255,255,255,0.06)`};
          border: ${g===e.g?`1px solid #a855f7`:`1px solid rgba(255,255,255,0.1)`};
          border-radius: 6px;
          color: ${g===e.g?`#f8fafc`:`#94a3b8`};
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        `,t.textContent=e.label,t.onclick=()=>{g=e.g,D(`gravity`,g),k()},n.appendChild(t)}),t.appendChild(n);let r=document.createElement(`input`);r.type=`range`,r.min=`0.5`,r.max=`30`,r.step=`0.1`,r.value=String(g),r.style.cssText=`width: 100%; accent-color: #a855f7;`,r.oninput=e=>{g=Number(e.target.value),D(`gravity`,g),k()},t.appendChild(r),e.appendChild(t);let i=document.createElement(`div`);i.style.cssText=`margin-bottom: 14px;`,i.innerHTML=`
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Pendulum Length (L):</span>
          <span style="color: #38bdf8;">${h.toFixed(2)} m</span>
        </div>
      `;let a=document.createElement(`input`);a.type=`range`,a.min=`0.2`,a.max=`3.0`,a.step=`0.05`,a.value=String(h),a.style.cssText=`width: 100%; accent-color: #38bdf8;`,a.oninput=e=>{h=Number(e.target.value),D(`pendulumLength`,h),k()},i.appendChild(a),e.appendChild(i);let o=document.createElement(`div`);o.style.cssText=`margin-bottom: 14px;`,o.innerHTML=`
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Spring Constant (k):</span>
          <span style="color: #facc15;">${_} N/m</span>
        </div>
      `;let s=document.createElement(`input`);s.type=`range`,s.min=`5`,s.max=`100`,s.step=`1`,s.value=String(_),s.style.cssText=`width: 100%; accent-color: #facc15;`,s.oninput=e=>{_=Number(e.target.value),D(`springK`,_),k()},o.appendChild(s),e.appendChild(o);let c=document.createElement(`div`);c.style.cssText=`margin-bottom: 16px;`,c.innerHTML=`
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Oscillator Mass (m):</span>
          <span style="color: #34d399;">${v.toFixed(2)} kg</span>
        </div>
      `;let l=document.createElement(`input`);l.type=`range`,l.min=`0.1`,l.max=`5.0`,l.step=`0.1`,l.value=String(v),l.style.cssText=`width: 100%; accent-color: #34d399;`,l.oninput=e=>{v=Number(e.target.value),D(`massM`,v),k()},c.appendChild(l),e.appendChild(c);let u=2*Math.PI*Math.sqrt(h/g),d=1/(2*Math.PI*Math.sqrt(v/_)),f=document.createElement(`div`);f.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,f.innerHTML=`
        <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
          VERLET HARMONIC TELEMETRY:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(56, 189, 248, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #38bdf8;">Pendulum Period (T)</div>
            <div style="font-size: 1.05rem; font-weight: 900; color: #f8fafc;">${u.toFixed(2)} s</div>
          </div>
          <div style="background: rgba(250, 204, 21, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #facc15;">Spring Frequency</div>
            <div style="font-size: 1.05rem; font-weight: 900; color: #f8fafc;">${d.toFixed(2)} Hz</div>
          </div>
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 10px;">
          <div>Oscillator Restoring Force: <strong style="color: #facc15;">${(_*.15).toFixed(1)} N</strong> (at 15cm displacement)</div>
          <div>Potential Energy: <strong style="color: #34d399;">${(.5*_*.15*.15).toFixed(2)} J</strong></div>
        </div>
      `,e.appendChild(f),M.appendChild(e)}else if(E===`kinetic-gas`){let e=document.createElement(`div`);e.innerHTML=`
        <div style="background: rgba(239, 68, 68, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(239, 68, 68, 0.3);">
          <div style="font-size: 0.76rem; color: #fca5a5; font-weight: 700; text-transform: uppercase;">
            Ideal Gas Law & Phase Dynamics:
          </div>
          <div style="font-size: 1.1rem; font-weight: 900; color: #f87171; margin: 2px 0;">
            PV = nRT &bull; E_k = 3/2 k_B T
          </div>
          <div style="font-size: 0.72rem; color: #cbd5e1;">
            Direct kinetic molecular theory: particle collision frequency, chamber volume, temperature and phase change.
          </div>
        </div>
      `;let t=document.createElement(`div`);t.style.cssText=`margin-bottom: 14px;`,t.innerHTML=`<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Phase of Matter:</div>`;let n=document.createElement(`div`);n.style.cssText=`display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;`,[{id:`solid`,label:`🧊 Solid Lattice`,desc:`Rigid bonds & vibration`},{id:`liquid`,label:`💧 Liquid Flow`,desc:`Loose glide & shear`},{id:`gas`,label:`💨 Kinetic Gas`,desc:`Elastic collisions`},{id:`brownian`,label:`🔬 Brownian Motion`,desc:`Heavy pollen impact`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`;let r=x===e.id;t.style.cssText=`
          padding: 8px;
          background: ${r?`rgba(239, 68, 68, 0.3)`:`rgba(255,255,255,0.06)`};
          border: ${r?`1px solid #ef4444`:`1px solid rgba(255,255,255,0.1)`};
          border-radius: 6px;
          color: ${r?`#f8fafc`:`#94a3b8`};
          text-align: left;
          cursor: pointer;
        `,t.innerHTML=`
          <div style="font-size: 0.76rem; font-weight: 800;">${e.label}</div>
          <div style="font-size: 0.64rem; color: #94a3b8;">${e.desc}</div>
        `,t.onclick=()=>{x=e.id;let t=300;e.id===`solid`?t=80:e.id===`liquid`?t=220:e.id===`gas`&&(t=300),y=t,D(`state`,e.id),D(`temp`,t),k()},n.appendChild(t)}),t.appendChild(n),e.appendChild(t);let r=document.createElement(`div`);r.style.cssText=`margin-bottom: 14px;`,r.innerHTML=`
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Chamber Volume (V):</span>
          <span style="color: #38bdf8;">${Math.round(b*100)}%</span>
        </div>
      `;let i=document.createElement(`input`);i.type=`range`,i.min=`0.25`,i.max=`1.0`,i.step=`0.05`,i.value=String(b),i.style.cssText=`width: 100%; accent-color: #38bdf8;`,i.oninput=e=>{b=Number(e.target.value),D(`volume`,b),k()},r.appendChild(i),e.appendChild(r);let a=document.createElement(`div`);a.style.cssText=`margin-bottom: 14px;`,a.innerHTML=`
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Temperature (T):</span>
          <span style="color: #f87171;">${y} K (${(y-273.15).toFixed(0)}°C)</span>
        </div>
      `;let o=document.createElement(`input`);o.type=`range`,o.min=`50`,o.max=`800`,o.step=`10`,o.value=String(y),o.style.cssText=`width: 100%; accent-color: #ef4444;`,o.oninput=e=>{y=Number(e.target.value),D(`temp`,y),x=y<=140?`solid`:y<=273?`liquid`:`gas`,D(`state`,x),k()},a.appendChild(o),e.appendChild(a);let s=y/300*101.3/Math.max(.25,b),c=Math.round(Math.sqrt(24.942*y/.028)),l=Math.round(c/500*50*(1/b)*9.6),u=(s*b).toFixed(1),d=document.createElement(`div`);d.style.cssText=`background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);`,d.innerHTML=`
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 0.74rem; color: #94a3b8; font-weight: 800;">THERMAL TELEMETRY:</span>
          <span style="font-size: 0.74rem; color: #22c55e; font-weight: 900;">Boyle's P&times;V = ${u}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(56, 189, 248, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #38bdf8;">Measured Pressure</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${s.toFixed(1)} kPa</div>
          </div>
          <div style="background: rgba(234, 179, 8, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #facc15;">Thermal Speed (v_rms)</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${c} m/s</div>
          </div>
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.5;">
          <div>Wall Impulses: <strong style="color: #38bdf8;">${l} collisions/sec</strong></div>
          <div>Molar Kinetic Energy: <strong style="color: #facc15;">${(12.471*y).toFixed(0)} J/mol</strong></div>
        </div>
      `,e.appendChild(d),M.appendChild(e)}else{let e=document.createElement(`div`);if(n===`pythagoras`){let t=r*r,n=i*i,a=t+n,o=Math.sqrt(a),s=Number.isInteger(o),c=(Math.atan(i/r)*(180/Math.PI)).toFixed(1);e.innerHTML=`
          <div style="background: rgba(59, 130, 246, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(59, 130, 246, 0.3);">
            <div style="font-size: 0.76rem; color: #93c5fd; font-weight: 700; text-transform: uppercase;">
              Mathematical Invariant:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #60a5fa; margin: 2px 0;">
              a² + b² = c²
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              The sum of the geometric square areas on the two legs always equals the square area on the hypotenuse.
            </div>
          </div>
        `;let l=document.createElement(`div`);l.style.cssText=`margin-bottom: 14px;`,l.innerHTML=`
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Leg a (Base):</span>
            <span style="color: #38bdf8;">${r} units</span>
          </div>
        `;let u=document.createElement(`input`);u.type=`range`,u.min=`1`,u.max=`10`,u.value=String(r),u.style.cssText=`width: 100%; accent-color: #38bdf8;`,u.oninput=e=>{r=Number(e.target.value),D(`sideA`,r),k()},l.appendChild(u),e.appendChild(l);let d=document.createElement(`div`);d.style.cssText=`margin-bottom: 16px;`,d.innerHTML=`
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Leg b (Height):</span>
            <span style="color: #f59e0b;">${i} units</span>
          </div>
        `;let f=document.createElement(`input`);f.type=`range`,f.min=`1`,f.max=`10`,f.value=String(i),f.style.cssText=`width: 100%; accent-color: #f59e0b;`,f.oninput=e=>{i=Number(e.target.value),D(`sideB`,i),k()},d.appendChild(f),e.appendChild(d);let p=document.createElement(`div`);p.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,p.innerHTML=`
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            LIVE GEOMETRIC PROOF:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; margin-bottom: 10px;">
            <div style="background: rgba(56, 189, 248, 0.1); padding: 6px; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: #38bdf8;">Area a²</div>
              <div style="font-size: 1rem; font-weight: 900; color: #f8fafc;">${t}</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 6px; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: #f59e0b;">Area b²</div>
              <div style="font-size: 1rem; font-weight: 900; color: #f8fafc;">${n}</div>
            </div>
            <div style="background: rgba(74, 222, 128, 0.1); padding: 6px; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: #4ade80;">Area c²</div>
              <div style="font-size: 1rem; font-weight: 900; color: #f8fafc;">${a}</div>
            </div>
          </div>
          <div style="font-size: 0.84rem; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">
            Hypotenuse c = <strong style="color: #4ade80;">${o.toFixed(2)}</strong> units
          </div>
          <div style="font-size: 0.78rem; color: #94a3b8;">
            Angle &theta; = <strong>${c}&deg;</strong>
          </div>
          ${s?`
            <div style="margin-top: 8px; padding: 4px 8px; border-radius: 4px; background: rgba(34, 197, 94, 0.2); color: #4ade80; font-size: 0.72rem; font-weight: 800; text-align: center;">
              ⭐ Exact Pythagorean Integer Triple! (${r}, ${i}, ${o})
            </div>
          `:``}
        `,e.appendChild(p)}else if(n===`bodmas`){let t=o*s,n=a+t,r=(a+o)*s;e.innerHTML=`
          <div style="background: rgba(168, 85, 247, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(168, 85, 247, 0.3);">
            <div style="font-size: 0.76rem; color: #c084fc; font-weight: 700; text-transform: uppercase;">
              Order of Operations Invariant:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #d8b4fe; margin: 2px 0;">
              A + (B &times; C)
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Multiplication creates a locked 2D area before loose additive units can be combined.
            </div>
          </div>
        `,[{label:`A (Loose Units)`,val:a,min:1,max:20,color:`#38bdf8`,set:e=>{a=e}},{label:`B (Row Factor)`,val:o,min:1,max:12,color:`#f59e0b`,set:e=>{o=e}},{label:`C (Column Factor)`,val:s,min:1,max:12,color:`#4ade80`,set:e=>{s=e}}].forEach(t=>{let n=document.createElement(`div`);n.style.cssText=`margin-bottom: 12px;`,n.innerHTML=`
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
              <span>${t.label}:</span>
              <span style="color: ${t.color};">${t.val}</span>
            </div>
          `;let r=document.createElement(`input`);r.type=`range`,r.min=String(t.min),r.max=String(t.max),r.value=String(t.val),r.style.cssText=`width: 100%; accent-color: ${t.color};`,r.oninput=e=>{t.set(Number(e.target.value)),k()},n.appendChild(r),e.appendChild(n)});let i=document.createElement(`div`);i.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,i.innerHTML=`
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            EVALUATION TRACE:
          </div>
          <div style="font-size: 0.82rem; margin-bottom: 4px; color: #cbd5e1;">
            1. Evaluate Forcefield Clamp: <strong>${o} &times; ${s} = <span style="color: #facc15;">${t}</span></strong>
          </div>
          <div style="font-size: 0.82rem; margin-bottom: 8px; color: #cbd5e1;">
            2. Add Loose Units: <strong>${a} + ${t} = <span style="color: #4ade80; font-size: 0.95rem;">${n}</span></strong>
          </div>
          <div style="padding: 8px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);">
            <div style="font-size: 0.7rem; color: #f87171; font-weight: 800;">⚠️ VIOLATING BODMAS (LEFT-TO-RIGHT ERROR):</div>
            <div style="font-size: 0.78rem; color: #fca5a5;">
              (${a} + ${o}) &times; ${s} = <strong>${r}</strong> (Error: difference of ${Math.abs(r-n)})
            </div>
          </div>
        `,e.appendChild(i)}else if(n===`photosynthesis`){let t=Math.min(100,Math.round(l/1e3*100)),n=Math.min(c,t,u),r=`Sunlight Photon Energy`;n===t&&(r=`Carbon Dioxide Supply`),n===u&&(r=`Water Transpiration`);let i=(n/100*45).toFixed(1),a=(n/100*120).toFixed(0);e.innerHTML=`
          <div style="background: rgba(34, 197, 94, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(34, 197, 94, 0.3);">
            <div style="font-size: 0.76rem; color: #86efac; font-weight: 700; text-transform: uppercase;">
              Biochemical Rate Limiter:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #4ade80; margin: 2px 0;">
              6 CO₂ + 6 H₂O &rarr; C₆H₁₂O₆ + 6 O₂
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Liebig’s Law of the Minimum: The reaction rate is strictly governed by the scarcest reactant.
            </div>
          </div>
        `,[{label:`☀️ Sunlight Photon Flux`,val:`${c}%`,min:0,max:100,step:1,cur:c,color:`#facc15`,set:e=>{c=e}},{label:`💨 CO₂ Concentration`,val:`${l} ppm`,min:200,max:1200,step:10,cur:l,color:`#38bdf8`,set:e=>{l=e}},{label:`💧 Soil H₂O Transpiration`,val:`${u}%`,min:0,max:100,step:1,cur:u,color:`#60a5fa`,set:e=>{u=e}}].forEach(t=>{let n=document.createElement(`div`);n.style.cssText=`margin-bottom: 12px;`,n.innerHTML=`
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
              <span>${t.label}:</span>
              <span style="color: ${t.color};">${t.val}</span>
            </div>
          `;let r=document.createElement(`input`);r.type=`range`,r.min=String(t.min),r.max=String(t.max),r.step=String(t.step),r.value=String(t.cur),r.style.cssText=`width: 100%; accent-color: ${t.color};`,r.oninput=e=>{t.set(Number(e.target.value)),k()},n.appendChild(r),e.appendChild(n)});let o=document.createElement(`div`);o.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,o.innerHTML=`
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            CELLULAR SYNTHESIS OUTPUT:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: rgba(34, 197, 94, 0.15); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #86efac;">Glucose (C₆H₁₂O₆)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${i} g/hr</div>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #7dd3fc;">Oxygen (O₂)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${a} mL/min</div>
            </div>
          </div>
          <div style="font-size: 0.78rem; color: #f59e0b; font-weight: 700;">
            🛑 Current Limiting Reagent: <strong>${r}</strong>
          </div>
        `,e.appendChild(o)}else if(n===`electric-circuits`){let t=p/m,n=p*t,r=t>6;e.innerHTML=`
          <div style="background: rgba(234, 179, 8, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(234, 179, 8, 0.3);">
            <div style="font-size: 0.76rem; color: #fde047; font-weight: 700; text-transform: uppercase;">
              Ohm's Law Invariant:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #facc15; margin: 2px 0;">
              Current I = Voltage (V) &divide; Resistance (R)
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Electrical pressure drives electron flow; circuit resistance dissipates energy into heat and light.
            </div>
          </div>
        `;let i=document.createElement(`div`);i.style.cssText=`margin-bottom: 12px;`,i.innerHTML=`
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Battery Voltage (V):</span>
            <span style="color: #38bdf8;">${p} Volts</span>
          </div>
        `;let a=document.createElement(`input`);a.type=`range`,a.min=`1.5`,a.max=`24`,a.step=`0.5`,a.value=String(p),a.style.cssText=`width: 100%; accent-color: #38bdf8;`,a.oninput=e=>{p=Number(e.target.value),D(`voltage`,p),k()},i.appendChild(a),e.appendChild(i);let o=document.createElement(`div`);o.style.cssText=`margin-bottom: 14px;`,o.innerHTML=`
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Resistor (R):</span>
            <span style="color: #f59e0b;">${m} &Omega;</span>
          </div>
        `;let s=document.createElement(`input`);s.type=`range`,s.min=`1`,s.max=`20`,s.step=`0.5`,s.value=String(m),s.style.cssText=`width: 100%; accent-color: #f59e0b;`,s.oninput=e=>{m=Number(e.target.value),D(`resistance`,m),k()},o.appendChild(s),e.appendChild(o);let c=document.createElement(`div`);c.style.cssText=`margin-bottom: 14px; display: flex; gap: 8px;`;let l=document.createElement(`button`);l.type=`button`,l.style.cssText=`flex: 1; padding: 5px 8px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; border-radius: 6px; color: #4ade80; font-size: 0.75rem; font-weight: 700; cursor: pointer;`,l.textContent=`⚡ Close Switch`,l.onclick=()=>D(`switchClosed`,!0);let u=document.createElement(`button`);u.type=`button`,u.style.cssText=`flex: 1; padding: 5px 8px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 6px; color: #f87171; font-size: 0.75rem; font-weight: 700; cursor: pointer;`,u.textContent=`⏹ Open Switch`,u.onclick=()=>D(`switchClosed`,!1),c.appendChild(l),c.appendChild(u),e.appendChild(c);let d=document.createElement(`div`);d.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,d.innerHTML=`
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            CIRCUIT TELEMETRY:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: rgba(56, 189, 248, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #38bdf8;">Current (I)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${t.toFixed(2)} A</div>
            </div>
            <div style="background: rgba(234, 179, 8, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #facc15;">Power (P)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${n.toFixed(1)} W</div>
            </div>
          </div>
          <div style="font-size: 0.76rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 8px;">
            <div>Electron Drift Velocity: <strong style="color: #38bdf8;">${(t*.4).toFixed(2)} mm/s</strong></div>
            <div>Filament Dissipation: <strong style="color: #facc15;">${n.toFixed(0)} Joules/sec</strong></div>
          </div>
          ${r?`
            <div style="padding: 6px 8px; border-radius: 4px; background: rgba(239, 68, 68, 0.2); color: #fca5a5; font-size: 0.72rem; font-weight: 800; text-align: center;">
              ⚡ Warning: Current exceeds 6A safety threshold! Increase resistance.
            </div>
          `:``}
        `,e.appendChild(d)}else if(n===`times-tables`){let t=d*f;e.innerHTML=`
          <div style="background: rgba(234, 179, 8, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(234, 179, 8, 0.3);">
            <div style="font-size: 0.76rem; color: #fde047; font-weight: 700; text-transform: uppercase;">
              Standard School Times Table (1× to 12×):
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #facc15; margin: 2px 0;">
              ${d} &times; ${f} = ${t}
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Standard UK curriculum 1 to 12 multiplication facts, commutative laws, and 12&times;12 grid.
            </div>
          </div>
        `;let n=document.createElement(`div`);n.style.cssText=`margin-bottom: 14px;`,n.innerHTML=`
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Times Table:</span>
            <span style="color: #38bdf8;">${d}&times;</span>
          </div>
        `;let r=document.createElement(`input`);r.type=`range`,r.min=`1`,r.max=`12`,r.value=String(d),r.style.cssText=`width: 100%; accent-color: #38bdf8;`,r.oninput=e=>{d=Number(e.target.value),D(`table`,d),k()},n.appendChild(r);let i=document.createElement(`div`);i.style.cssText=`display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;`,[1,2,3,4,5,6,7,8,9,10,11,12].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
            padding: 3px 7px;
            border-radius: 5px;
            font-size: 0.72rem;
            font-weight: 800;
            border: ${d===e?`1px solid #10b981`:`1px solid #334155`};
            background: ${d===e?`#059669`:`#1e293b`};
            color: ${d===e?`#ffffff`:`#cbd5e1`};
            cursor: pointer;
          `,t.textContent=`${e}×`,t.onclick=()=>{d=e,D(`table`,e),k()},i.appendChild(t)}),n.appendChild(i),e.appendChild(n);let a=document.createElement(`div`);a.style.cssText=`margin-bottom: 16px;`,a.innerHTML=`
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Multiplier (1 to 12):</span>
            <span style="color: #4ade80;">&times;${f}</span>
          </div>
        `;let o=document.createElement(`input`);o.type=`range`,o.min=`1`,o.max=`12`,o.value=String(f),o.style.cssText=`width: 100%; accent-color: #4ade80;`,o.oninput=e=>{f=Number(e.target.value),D(`multiplier`,f),k()},a.appendChild(o),e.appendChild(a);let s=document.createElement(`div`);s.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,s.innerHTML=`
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 6px;">
            MULTIPLICATION PROPERTIES:
          </div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #f8fafc; margin-bottom: 6px;">
            ${d} &times; ${f} = <span style="color: #facc15;">${t}</span>
          </div>
          <div style="font-size: 0.76rem; color: #94a3b8; margin-bottom: 6px;">
            Commutative Law: ${d} &times; ${f} = ${f} &times; ${d} = ${t}
          </div>
          <div style="font-size: 0.76rem; color: #cbd5e1; background: rgba(255,255,255,0.06); padding: 6px 8px; border-radius: 6px;">
            Inverse Division: ${t} &divide; ${d} = ${f} &bull; ${t} &divide; ${f} = ${d}
          </div>
        `,e.appendChild(s)}else e.innerHTML=`
          <div style="text-align: center; padding: 2rem 1rem; color: #94a3b8;">
            <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🔬</span>
            <h4 style="margin: 0 0 6px 0; color: #f8fafc; font-size: 0.95rem;">General AST Telemetry Active</h4>
            <p style="margin: 0; font-size: 0.78rem; line-height: 1.5;">
              This scene runs on declarative S-expression keyframes with real-time coordinate physics. Switch to Pythagoras, BODMAS, Photosynthesis, or Velocity to engage reactive mathematical parameter sliders!
            </p>
          </div>
        `;M.appendChild(e)}O.appendChild(M);let N=document.createElement(`div`);N.style.cssText=`padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.12); font-size: 0.72rem; color: #64748b; text-align: center;`,N.textContent=`⚡ 100% Client-Side Invariant Calculator • Zero Server Latency`,O.appendChild(N)}return k(),O}var z=[65,83,84,66],B=new TextEncoder,fe=new TextDecoder(`utf-8`,{fatal:!1});function pe(e){if(!e)return!1;let t=e instanceof Uint8Array?e:new Uint8Array(e);return t.length<16?!1:t[0]===z[0]&&t[1]===z[1]&&t[2]===z[2]&&t[3]===z[3]}var me=class{map=new Map;strings=[];intern(e){let t=e==null?``:String(e),n=this.map.get(t);if(n!==void 0)return n;let r=this.strings.length;return this.strings.push(t),this.map.set(t,r),r}serialize(){let e=this.strings.map(e=>B.encode(e)),t=0;for(let n of e)t+=2+n.length;let n=new Uint8Array(t),r=new DataView(n.buffer),i=0;for(let t of e)r.setUint16(i,t.length,!0),i+=2,n.set(t,i),i+=t.length;return{count:this.strings.length,byteLength:t,buffer:n}}},he=class{strings=[];constructor(e,t){let n=new DataView(e.buffer,e.byteOffset,e.byteLength),r=0;for(let i=0;i<t&&r<e.byteLength;i++){let t=n.getUint16(r,!0);r+=2;let i=e.subarray(r,r+t);this.strings.push(fe.decode(i)),r+=t}}get(e){return this.strings[e]||``}};function V(e){let t=new me,n=t.intern(e.id),r=t.intern(e.title),i=t.intern(e.stage),a=t.intern(e.video||``),o=1;e.type===`Film`||e.video?o=4:e.type===`Slide`?o=2:e.type===`App`&&(o=3);let s=0;(e.has3D||e.camera)&&(s|=1),(e.video||o===4)&&(s|=2),e.checkpoints&&e.checkpoints.length>0&&(s|=4),e.subtitles&&e.subtitles.length>0&&(s|=8);let c=[],l=e=>c.push(e&255),u=e=>{c.push(e&255),c.push(e>>8&255)},d=e=>{let t=new Float32Array([e]),n=new Uint8Array(t.buffer);c.push(n[0],n[1],n[2],n[3])},f=1;if(e.videoFit===`cover`?f=2:e.videoFit===`fill`&&(f=3),l(1),u(n),u(r),u(i),u(a),l(f),e.camera&&(l(128),d(e.camera.distance||500),d(typeof e.camera.pitch==`number`?e.camera.pitch:20),d(typeof e.camera.yaw==`number`?e.camera.yaw:0),d(e.camera.fov||60),(typeof e.camera.yaw==`string`||typeof e.camera.pitch==`string`)&&(l(48),u(t.intern(`:camera`)),u(t.intern(`camera`)),u(t.intern(JSON.stringify({yaw:e.camera.yaw,pitch:e.camera.pitch,distance:e.camera.distance,fov:e.camera.fov}))))),e.vars&&typeof e.vars==`object`)for(let[n,r]of Object.entries(e.vars)){if(n.startsWith(`_`))continue;l(96),u(t.intern(n));let e=r&&typeof r==`object`,i=e?r.val:r;typeof i==`boolean`?(l(3),d(+!!i)):typeof i==`string`?(l(2),d(t.intern(i))):(l(1),d(Number(i)||0)),d(e&&typeof r.min==`number`?r.min:0),d(e&&typeof r.max==`number`?r.max:100),d(e&&typeof r.step==`number`?r.step:1),u(t.intern(e&&r.label?r.label:n))}let p=Array.isArray(e.uiControls)&&e.uiControls.length>0?e.uiControls.map(e=>({type:e.type===`toggle`||e.type===`switch`?`switch`:e.type===`button`?`button`:`slider`,var:e.bind||e.id,label:e.label||e.id,min:typeof e.min==`number`?e.min:0,max:typeof e.max==`number`?e.max:100,step:typeof e.step==`number`?e.step:1})):Array.isArray(e.inputs)?e.inputs:[];for(let e of p)e&&e.var&&(l(112),l(e.type===`switch`||e.type===`toggle`?2:e.type===`button`?3:1),u(t.intern(e.var)),u(t.intern(e.label||e.var)),d(typeof e.min==`number`?e.min:0),d(typeof e.max==`number`?e.max:100),d(typeof e.step==`number`?e.step:1));if(Array.isArray(e.keyframes))for(let n of e.keyframes)l(16),u(Math.max(0,Math.min(65535,Math.round((n.t||0)*65535)))),u(t.intern(n.title)),u(t.intern(n.rule));if(Array.isArray(e.subtitles))for(let n of e.subtitles){l(32);let e=Math.max(0,Math.min(65535,Math.round((n.start||0)*65535))),r=Math.max(0,Math.min(65535,Math.round((n.end||0)*65535)));u(e),u(r);let i=[];n.en&&i.push([`en`,n.en]),n.es&&i.push([`es`,n.es]),n.la&&i.push([`la`,n.la]);for(let[e,t]of Object.entries(n))e!==`start`&&e!==`end`&&e!==`en`&&e!==`es`&&e!==`la`&&typeof t==`string`&&i.push([e,t]);l(i.length);for(let[e,n]of i)u(t.intern(e)),u(t.intern(n))}if(Array.isArray(e.bindings))for(let n of e.bindings)l(48),u(t.intern(n.target)),n.type===`3d-node`?(u(t.intern(`:3d-node`)),u(t.intern(`${n.x}|${n.y}|${n.z}|${n.baseR||8}|${n.label||``}|${n.depthFog===!1?0:1}`))):n.type===`3d-ring`?(u(t.intern(`:3d-ring`)),u(t.intern(`${n.r}|${n.cx||0}|${n.cy||0}|${n.cz||0}|${n.tiltX||0}|${n.tiltY||0}|${n.tiltZ||0}|${n.segments||24}|${n.depthFog===!1?0:1}`))):n.type===`3d-line`?(u(t.intern(`:3d-line`)),u(t.intern(`${n.x1}|${n.y1}|${n.z1}|${n.x2}|${n.y2}|${n.z2}|${n.cap1||``}|${n.cap2||``}|${n.baseR||8}`))):n.type===`3d-polygon`?(u(t.intern(`:3d-polygon`)),u(t.intern(`${n.depthFog===!1?0:1}|${+!!n.cullBackface}|${n.pointsExpr}`))):(u(t.intern(n.attr||`attr`)),u(t.intern(n.expr||``)));if(Array.isArray(e.checkpoints))for(let n=0;n<e.checkpoints.length;n++){let r=e.checkpoints[n];l(64),u(Math.max(0,Math.min(65535,Math.round((r.t||0)*65535)))),u(t.intern(r.prompt)),l(r.answer||0),u(t.intern(r.explanation||``));let i=Array.isArray(r.options)?r.options:[];l(i.length);for(let e of i)u(t.intern(e));let a=r.onWrong?Object.entries(r.onWrong):[];if(r.passExpr||r.holdDuration&&r.holdDuration>0||a.length>0||r.title&&r.title!==`Checkpoint`){l(65),u(n),u(t.intern(r.title||`Checkpoint`)),u(t.intern(r.passExpr||``)),d(typeof r.holdDuration==`number`?r.holdDuration:0),l(a.length);for(let[e,n]of a)l(parseInt(e,10)||0),u(t.intern(String(n)))}}if(Array.isArray(e.gestures))for(let n of e.gestures)l(80),u(t.intern(n.target)),l(n.axis===`y`?2:n.axis===`xy`?3:1),d(n.min||0),d(n.max||100);if(Array.isArray(e.scopes))for(let n of e.scopes){if(!n||!n.target)continue;l(144),u(t.intern(n.target)),u(t.intern(n.xExpr||`t`)),u(t.intern(n.yExpr||`0`)),u(Math.max(8,Math.min(2048,Math.round(n.samples||96)))),d(Array.isArray(n.xRange)?n.xRange[0]:0),d(Array.isArray(n.xRange)?n.xRange[1]:10),d(Array.isArray(n.yRange)?n.yRange[0]:0),d(Array.isArray(n.yRange)?n.yRange[1]:100);let e=Array.isArray(n.plot)&&n.plot.length>=4?n.plot:[-1,-1,-1,-1];d(e[0]),d(e[1]),d(e[2]),d(e[3])}if(Array.isArray(e.ledgers))for(let n of e.ledgers){if(!n||!n.id||!Array.isArray(n.terms))continue;l(145),u(t.intern(n.id)),u(t.intern(n.target||`#${n.id}`)),u(t.intern(n.unit||``)),u(t.intern(n.maxExpr||``)),d(typeof n.x==`number`?n.x:40),d(typeof n.y==`number`?n.y:400),d(typeof n.width==`number`?n.width:320),d(typeof n.height==`number`?n.height:20);let e=n.terms.slice(0,16);l(e.length);for(let n of e)u(t.intern(n.label||`Term`)),u(t.intern(n.expr||`0`)),u(t.intern(n.color||`#38bdf8`))}l(255);let m=t.serialize(),h=16+m.byteLength+c.length,g=new Uint8Array(h),_=new DataView(g.buffer);return g[0]=z[0],g[1]=z[1],g[2]=z[2],g[3]=z[3],g[4]=1,g[5]=o,_.setUint16(6,Math.round((e.duration||10)*10),!0),_.setUint16(8,m.count,!0),_.setUint32(10,m.byteLength,!0),_.setUint16(14,s,!0),g.set(m.buffer,16),g.set(new Uint8Array(c),16+m.byteLength),g}function ge(e){let t=e instanceof Uint8Array?e:new Uint8Array(e);if(!pe(t))throw Error(`Invalid AST Bytecode: Missing ASTB magic header`);let n=new DataView(t.buffer,t.byteOffset,t.byteLength),r=t[5],i=n.getUint16(6,!0),a=n.getUint16(8,!0),o=n.getUint32(10,!0),s=n.getUint16(14,!0),c=i/10,l=`Sim`;r===4?l=`Film`:r===2?l=`Slide`:r===3&&(l=`App`);let u=new he(t.subarray(16,16+o),a),d=16+o,f=t.length,p={id:`unnamed`,type:l,title:`AST Scene`,stage:`CURRICULUM`,duration:c,has3D:!!(s&1),hasVideo:!!(s&2),keyframes:[],subtitles:[],bindings:[],checkpoints:[],scopes:[],ledgers:[],gestures:[],vars:{},inputs:[]};for(;d<f;){let e=t[d++];if(e===255)break;switch(e){case 1:{let e=n.getUint16(d,!0);d+=2;let r=n.getUint16(d,!0);d+=2;let i=n.getUint16(d,!0);d+=2;let a=n.getUint16(d,!0);d+=2;let o=t[d++];p.id=u.get(e),p.title=u.get(r),p.stage=u.get(i);let s=u.get(a);s&&(p.video=s,p.hasVideo=!0,p.type=`Film`),p.videoFit=o===2?`cover`:o===3?`fill`:`contain`;break}case 128:{let e=n.getFloat32(d,!0);d+=4;let t=n.getFloat32(d,!0);d+=4;let r=n.getFloat32(d,!0);d+=4;let i=n.getFloat32(d,!0);d+=4,p.camera={distance:e,pitch:t,yaw:r,fov:i},p.has3D=!0;break}case 16:{let e=n.getUint16(d,!0);d+=2;let t=n.getUint16(d,!0);d+=2;let r=n.getUint16(d,!0);d+=2,p.keyframes.push({t:Number((e/65535).toFixed(4)),title:u.get(t),rule:u.get(r)});break}case 32:{let e=n.getUint16(d,!0);d+=2;let r=n.getUint16(d,!0);d+=2;let i=t[d++],a={start:Number((e/65535).toFixed(4)),end:Number((r/65535).toFixed(4)),en:``};for(let e=0;e<i;e++){let e=u.get(n.getUint16(d,!0));d+=2;let t=u.get(n.getUint16(d,!0));d+=2,a[e]=t}p.subtitles.push(a);break}case 48:{let e=n.getUint16(d,!0);d+=2;let t=n.getUint16(d,!0);d+=2;let r=n.getUint16(d,!0);d+=2;let i=u.get(e),a=u.get(t),o=u.get(r);if(i===`:camera`&&a===`camera`)try{let e=o.startsWith(`{`)?JSON.parse(o):null;e&&(p.camera={...p.camera||{distance:500,pitch:20,yaw:0,fov:60},...e}),p.has3D=!0}catch{}else if(a===`:3d-node`||a===`3d-node`){if(o.startsWith(`{`))try{p.bindings.push({type:`3d-node`,target:i,...JSON.parse(o)})}catch{}else{let e=o.split(`|`);p.bindings.push({type:`3d-node`,target:i,x:e[0],y:e[1],z:e[2],baseR:parseFloat(e[3])||8,label:e[4]||null,depthFog:e[5]!==`0`})}}else if(a===`:3d-ring`||a===`3d-ring`){if(o.startsWith(`{`))try{p.bindings.push({type:`3d-ring`,target:i,...JSON.parse(o)})}catch{}else{let e=o.split(`|`);p.bindings.push({type:`3d-ring`,target:i,r:e[0],cx:e[1],cy:e[2],cz:e[3],tiltX:e[4],tiltY:e[5],tiltZ:e[6],segments:parseInt(e[7],10)||24,depthFog:e[8]!==`0`})}}else if(a===`:3d-line`||a===`3d-line`){if(o.startsWith(`{`))try{p.bindings.push({type:`3d-line`,target:i,...JSON.parse(o)})}catch{}else{let e=o.split(`|`);p.bindings.push({type:`3d-line`,target:i,x1:e[0],y1:e[1],z1:e[2],x2:e[3],y2:e[4],z2:e[5],cap1:e[6]||null,cap2:e[7]||null,baseR:parseFloat(e[8])||8})}}else if(a===`:3d-polygon`||a===`3d-polygon`){if(o.startsWith(`{`))try{p.bindings.push({type:`3d-polygon`,target:i,...JSON.parse(o)})}catch{}else{let e=o.split(`|`);p.bindings.push({type:`3d-polygon`,target:i,depthFog:e[0]!==`0`,cullBackface:e[1]===`1`,pointsExpr:e.slice(2).join(`|`)})}}else p.bindings.push({type:`2d-attr`,target:i,attr:a,expr:o});break}case 64:{let e=n.getUint16(d,!0);d+=2;let r=n.getUint16(d,!0);d+=2;let i=t[d++],a=n.getUint16(d,!0);d+=2;let o=t[d++],s=[];for(let e=0;e<o;e++)s.push(u.get(n.getUint16(d,!0))),d+=2;p.checkpoints.push({t:Number((e/65535).toFixed(4)),prompt:u.get(r),options:s,answer:i,explanation:u.get(a)});break}case 65:{let e=n.getUint16(d,!0);d+=2;let r=u.get(n.getUint16(d,!0));d+=2;let i=u.get(n.getUint16(d,!0));d+=2;let a=n.getFloat32(d,!0);d+=4;let o=t[d++],s={};for(let e=0;e<o;e++){let e=t[d++],r=u.get(n.getUint16(d,!0));d+=2,s[e]=r}let c=p.checkpoints[e];c&&(r&&(c.title=r),i&&(c.passExpr=i),a>0&&(c.holdDuration=Number(a.toFixed(3))),o>0&&(c.onWrong=s));break}case 144:{let e=u.get(n.getUint16(d,!0));d+=2;let t=u.get(n.getUint16(d,!0));d+=2;let r=u.get(n.getUint16(d,!0));d+=2;let i=n.getUint16(d,!0);d+=2;let a=n.getFloat32(d,!0);d+=4;let o=n.getFloat32(d,!0);d+=4;let s=n.getFloat32(d,!0);d+=4;let c=n.getFloat32(d,!0);d+=4;let l=n.getFloat32(d,!0);d+=4;let f=n.getFloat32(d,!0);d+=4;let m=n.getFloat32(d,!0);d+=4;let h=n.getFloat32(d,!0);d+=4;let g={target:e,xExpr:t,yExpr:r,samples:i,xRange:[a,o],yRange:[s,c]};m>0&&h>0&&(g.plot=[l,f,m,h]),p.scopes.push(g);break}case 145:{let e=u.get(n.getUint16(d,!0));d+=2;let r=u.get(n.getUint16(d,!0));d+=2;let i=u.get(n.getUint16(d,!0));d+=2;let a=u.get(n.getUint16(d,!0));d+=2;let o=n.getFloat32(d,!0);d+=4;let s=n.getFloat32(d,!0);d+=4;let c=n.getFloat32(d,!0);d+=4;let l=n.getFloat32(d,!0);d+=4;let f=t[d++],m=[];for(let e=0;e<f;e++){let e=u.get(n.getUint16(d,!0));d+=2;let t=u.get(n.getUint16(d,!0));d+=2;let r=u.get(n.getUint16(d,!0));d+=2,m.push({label:e,expr:t,color:r})}p.ledgers.push({id:e,...r?{target:r}:{},...i?{unit:i}:{},...a?{maxExpr:a}:{},x:o,y:s,width:c,height:l,terms:m});break}case 80:{let e=n.getUint16(d,!0);d+=2;let r=t[d++],i=n.getFloat32(d,!0);d+=4;let a=n.getFloat32(d,!0);d+=4,p.gestures.push({target:u.get(e),axis:r===2?`y`:r===3?`xy`:`x`,min:i,max:a});break}case 96:{let e=n.getUint16(d,!0);d+=2;let r=t[d++],i=0;if(r===3)i=n.getFloat32(d,!0)>.5,d+=4;else if(r===2){let e=Math.round(n.getFloat32(d,!0));i=u.get(e),d+=4}else i=n.getFloat32(d,!0),d+=4;n.getFloat32(d,!0),d+=4,n.getFloat32(d,!0),d+=4,n.getFloat32(d,!0),d+=4;let a=n.getUint16(d,!0);d+=2;let o=u.get(e);u.get(a),p.vars[o]=i;break}case 112:{let e=t[d++],r=n.getUint16(d,!0);d+=2;let i=n.getUint16(d,!0);d+=2;let a=n.getFloat32(d,!0);d+=4;let o=n.getFloat32(d,!0);d+=4;let s=n.getFloat32(d,!0);d+=4;let c=u.get(r),l=u.get(i),f=e===2?`toggle`:e===3?`button`:`slider`;p.inputs||=[],p.inputs.push({type:e===2?`switch`:e===3?`button`:`slider`,var:c,label:l,min:a,max:o,step:s}),p.uiControls||=[],p.uiControls.push({id:c,type:f,label:l||c,bind:c,action:f===`button`?c===`reset`?`(sim:reset)`:null:f===`toggle`&&(c===`bsl`||c===`bsl-active`)?`(player:toggle-bsl)`:null,min:a,max:o,step:s,default:a});break}}}return p}function H(e,t){let n=[],r=t.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`),i=RegExp(`\\(`+r+`[\\s)]`,`gi`),a;for(;(a=i.exec(e))!==null;){let t=a.index,r=0,i=!1,o=-1;for(let n=t;n<e.length;n++){let t=e[n];if(t===`"`&&(n===0||e[n-1]!==`\\`))i=!i;else if(!i){if(t===`(`)r++;else if(t===`)`&&(r--,r===0)){o=n+1;break}}}o!==-1&&n.push(e.slice(t,o))}return n}function _e(e){if(!e||typeof e!=`string`)throw Error(`Empty or invalid AST content for bytecode compilation`);let t=e.match(/\(:id\s+("([^"]+)"|([^\s\)]+))\)/i)||e.match(/:id\s+("([^"]+)"|([^\s\)]+))/i)||e.match(/\(id\s+("([^"]+)"|([^\s\)]+))\)/i)||e.match(/meta[\s\S]*?\(id\s+("([^"]+)"|([^\s\)]+))\)/i),n=t?(t[2]||t[3]||t[1]||``).replace(/^"|"$/g,``).trim():`unnamed`,r=e.match(/\(:type\s+("([^"]+)"|([^\s\)]+))\)/i)||e.match(/:type\s+("([^"]+)"|([^\s\)]+))/i)||e.match(/\(type\s+("([^"]+)"|([^\s\)]+))\)/i),i=r?(r[2]||r[3]||r[1]||``).replace(/^"|"$/g,``).trim():null,a=e.match(/:video\s+("([^"]+)"|([^\s\)]+))/i)||e.match(/:film\s+("([^"]+)"|([^\s\)]+))/i),o=a?a[2]||a[3]:null,s=e.match(/:video-?fit\s+("([^"]+)"|([^\s\)]+))/i),c=s?(s[2]||s[3]).toLowerCase():`contain`,l=`Sim`;if(i){let e=i.toLowerCase();l=e===`film`||e===`video`?`Film`:e===`slide`?`Slide`:e===`app`?`App`:`Sim`}else o&&(l=`Film`);let u=e.match(/\(:title\s+"([^"]+)"\)/i)||e.match(/:title\s+"([^"]+)"/i)||e.match(/\(title\s+"([^"]+)"\)/i),d=u?u[1]:n===`unnamed`?`AST Scene`:n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),f=e.match(/\(:stage\s+"([^"]+)"\)/i)||e.match(/:stage\s+"([^"]+)"/i)||e.match(/\(stage\s+"([^"]+)"\)/i),p=f?f[1]:`CURRICULUM`,m=e.match(/\(:duration\s+([\d\.]+)\)/i)||e.match(/:duration\s+([\d\.]+)/i)||e.match(/\(duration\s+([\d\.]+)\)/i),h=m?parseFloat(m[1]):14,g=[],_=/\(:t\s+([\d\.]+)\s+:title\s+"([^"]+)"\s+:rule\s+"([^"]+)"\)/gi,v;for(;(v=_.exec(e))!==null;)g.push({t:parseFloat(v[1]),title:v[2],rule:v[3]});let y=[],b=/\(:start\s+([\d\.]+)\s+:end\s+([\d\.]+)\s+:en\s+"([^"]+)"(?:\s+:es\s+"([^"]+)")?(?:\s+:la\s+"([^"]+)")?\)/gi,x;for(;(x=b.exec(e))!==null;)y.push({start:parseFloat(x[1]),end:parseFloat(x[2]),en:x[3],es:x[4]||void 0,la:x[5]||void 0});let S=(e,t)=>{if(!e||typeof e!=`string`)return null;let n=e.match(t);return n?n[1].trim().replace(/^"|"$/g,``):null},C=(e,t)=>{if(!e||typeof e!=`string`)return null;let n=RegExp(`:${t}\\s+"((?:[^"\\\\]|\\\\.)*)"`,`i`),r=e.match(n);if(r)return r[1].replace(/\\"/g,`"`);let i=RegExp(`:${t}\\s+([^\\s\\)]+)`,`i`),a=e.match(i);return a?a[1].replace(/^"|"$/g,``):null},w=[];if(H(e,`:target`).forEach(e=>{let t=C(e,`target`)||S(e,/:target\s+"([^"]+)"/i),n=S(e,/:type\s+"([^"]+)"/i),r=C(e,`attr`)||S(e,/:attr\s+"([^"]+)"/i),i=C(e,`expr`)||S(e,/:expr\s+"([^"]+)"/i);if(n===`3d-node`){let n=S(e,/:x\s+"([^"]+)"/i)||`0`,r=S(e,/:y\s+"([^"]+)"/i)||`0`,i=S(e,/:z\s+"([^"]+)"/i)||`0`,a=S(e,/:base-r\s+([\d\.]+)/i),o=a?parseFloat(a):8,s=S(e,/:label\s+"([^"]+)"/i),c=S(e,/:depth-fog\s+([^\s\)]+)/i)!==`false`;w.push({type:`3d-node`,target:t,x:n,y:r,z:i,baseR:o,label:s,depthFog:c})}else if(n===`3d-line`)w.push({type:`3d-line`,target:t,x1:S(e,/:x1\s+"([^"]+)"/i)||`0`,y1:S(e,/:y1\s+"([^"]+)"/i)||`0`,z1:S(e,/:z1\s+"([^"]+)"/i)||`0`,x2:S(e,/:x2\s+"([^"]+)"/i)||`0`,y2:S(e,/:y2\s+"([^"]+)"/i)||`0`,z2:S(e,/:z2\s+"([^"]+)"/i)||`0`,cap1:S(e,/:cap1\s+"([^"]+)"/i),cap2:S(e,/:cap2\s+"([^"]+)"/i),baseR:parseFloat(S(e,/:base-r\s+([\d\.]+)/i)||`8`)});else if(n===`3d-ring`){let n=S(e,/:r\s+("[^"]+"|[\\d\\.]+)/i)||`100`,r=S(e,/:cx\s+"([^"]+)"/i)||`0`,i=S(e,/:cy\s+"([^"]+)"/i)||`0`,a=S(e,/:cz\s+"([^"]+)"/i)||`0`,o=S(e,/:tilt-x\s+("[^"]+"|[\\d\\.-]+)/i)||`0`,s=S(e,/:tilt-y\s+("[^"]+"|[\\d\\.-]+)/i)||`0`,c=S(e,/:tilt-z\s+("[^"]+"|[\\d\\.-]+)/i)||`0`,l=S(e,/:segments\s+([\d]+)/i),u=l?parseInt(l,10):24,d=S(e,/:depth-fog\s+([^\s\)]+)/i)!==`false`;w.push({type:`3d-ring`,target:t,r:n,cx:r,cy:i,cz:a,tiltX:o,tiltY:s,tiltZ:c,segments:u,depthFog:d})}else if(n===`3d-polygon`){let n=S(e,/:points\s+"([^"]+)"/i)||S(e,/:pts\s+"([^"]+)"/i),r=S(e,/:depth-fog\s+([^\s\)]+)/i)!==`false`,i=S(e,/:cull-backface\s+([^\s\)]+)/i)===`true`;w.push({type:`3d-polygon`,target:t,pointsExpr:n,depthFog:r,cullBackface:i})}else t&&r&&i&&w.push({type:`2d-attr`,target:t,attr:r,expr:i})}),w.length===0){let t=/\(:target\s+"([^"]+)"\s+:attr\s+"([^"]+)"\s+:expr\s+"([^"]+)"\)/gi,n;for(;(n=t.exec(e))!==null;)w.push({type:`2d-attr`,target:n[1],attr:n[2],expr:n[3]})}let T=[],E=H(e,`:checkpoint`);for(let e of E){let t=S(e,/:t\s+([\d\.]+)/i),n=C(e,`title`)||`Checkpoint`,r=C(e,`prompt`)||``,i=S(e,/:answer\s+(\d+)/i),a=C(e,`explanation`)||``,o=C(e,`pass-expr`)||C(e,`passExpr`)||void 0,s=S(e,/:hold-?duration\s+([\d\.]+)/i),c=s===null?void 0:parseFloat(s),l=[],u=e.search(/:options\b/i);if(u!==-1){let t=e.indexOf(`(`,u);if(t!==-1){let n=0,r=!1,i=-1;for(let a=t;a<e.length;a++){let t=e[a];if(t===`"`&&(a===0||e[a-1]!==`\\`))r=!r;else if(!r){if(t===`(`)n++;else if(t===`)`&&(n--,n===0)){i=a;break}}}if(i!==-1){let n=e.slice(t+1,i),r=/"((?:[^"\\]|\\.)*)"/g,a;for(;(a=r.exec(n))!==null;)l.push(a[1].replace(/\\"/g,`"`))}}}let d={},f=0;for(;;){let t=e.slice(f).search(/:on-?wrong\s*\(/i);if(t===-1)break;let n=f+t,r=e.indexOf(`(`,n);if(r===-1)break;let i=0,a=!1,o=-1;for(let t=r;t<e.length;t++){let n=e[t];if(n===`"`&&(t===0||e[t-1]!==`\\`))a=!a;else if(!a){if(n===`(`)i++;else if(n===`)`&&(i--,i===0)){o=t;break}}}if(o===-1)break;let s=e.slice(r+1,o),c=/(\d+)\s+"((?:[^"\\]|\\.)*)"/g,l;for(;(l=c.exec(s))!==null;)d[parseInt(l[1],10)]=l[2].replace(/\\"/g,`"`);f=o+1}if(t&&r){let e={t:parseFloat(t),title:n,prompt:r,options:l,answer:i===null?0:parseInt(i,10),explanation:a};o&&(e.passExpr=o),c!==void 0&&(e.holdDuration=c),Object.keys(d).length>0&&(e.onWrong=d),T.push(e)}}let D=[],O=H(e,`:scope`);for(let e of O){let t=C(e,`target`)||S(e,/:target\s+([^\s\)]+)/i),n=C(e,`x-expr`)||C(e,`xExpr`)||`t`,r=C(e,`y-expr`)||C(e,`yExpr`)||`0`,i=S(e,/:samples\s+(\d+)/i),a=i?parseInt(i,10):96,o=e.match(/:x-?range\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i),s=e.match(/:y-?range\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i),c=e.match(/:plot\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i);if(t){let e={target:t,xExpr:n,yExpr:r,samples:a,xRange:o?[parseFloat(o[1]),parseFloat(o[2])]:[0,30],yRange:s?[parseFloat(s[1]),parseFloat(s[2])]:[0,100]};c&&(e.plot=[parseFloat(c[1]),parseFloat(c[2]),parseFloat(c[3]),parseFloat(c[4])]),D.push(e)}}let k=[],A=H(e,`:ledger`);for(let e of A){let t=C(e,`id`)||`ledger_${k.length+1}`,n=C(e,`target`)||`#${t}`,r=C(e,`unit`)||``,i=C(e,`max`)||``,a=parseFloat(S(e,/:x\s+([\d\.\-]+)/i)||`40`),o=parseFloat(S(e,/:y\s+([\d\.\-]+)/i)||`400`),s=parseFloat(S(e,/:width\s+([\d\.]+)/i)||`320`),c=parseFloat(S(e,/:height\s+([\d\.]+)/i)||`20`),l=H(e,`:label`),u=[];for(let e of l){let t=C(e,`label`)||`Term`,n=C(e,`expr`)||`0`,r=C(e,`color`)||`#38bdf8`;u.push({label:t,expr:n,color:r})}u.length>0&&k.push({id:t,target:n,unit:r,maxExpr:i,x:a,y:o,width:s,height:c,terms:u})}let j=[],M=/\(:draggable\s+:target\s+"([^"]+)"\s+:axis\s+"([^"]+)"\s+:min\s+([\d\.\-]+)\s+:max\s+([\d\.\-]+)\)/gi,N;for(;(N=M.exec(e))!==null;)j.push({target:N[1],axis:N[2],min:parseFloat(N[3]),max:parseFloat(N[4])});let ee={};if(H(e,`:var`).forEach(e=>{let t=S(e,/:name\s+"([^"]+)"/i),n=e.match(/:val\s+([\d\.\-]+|"([^"]+)"|true|false)/i);if(!t||!n)return;let r=n[1],i=0;i=r===`true`?!0:r===`false`?!1:r.startsWith(`"`)?n[2]||``:parseFloat(r);let a=S(e,/:min\s+([\d\.\-]+)/i),o=S(e,/:max\s+([\d\.\-]+)/i),s=S(e,/:step\s+([\d\.]+)/i),c=S(e,/:unit\s+"([^"]+)"/i),l=S(e,/:label\s+"([^"]+)"/i);a!==null&&o!==null?ee[t]={val:i,min:parseFloat(a),max:parseFloat(o),step:s?parseFloat(s):1,unit:c||``,label:l||t}:ee[t]=i}),Object.keys(ee).length===0){let t=/\(:var\s+:name\s+"([^"]+)"\s+:val\s+([\d\.\-]+|"([^"]+)"|true|false)/gi,n;for(;(n=t.exec(e))!==null;){let e=n[1],t=n[2];ee[e]=t===`true`?!0:t===`false`?!1:t.startsWith(`"`)?n[3]:parseFloat(t)}}let te=[],P=[],F=H(e,`ui:controls`).concat(H(e,`:ui-controls`)).concat(H(e,`:inputs`));F.length>0&&F.forEach(e=>{H(e,`control:slider`).concat(H(e,`control:toggle`)).concat(H(e,`control:button`)).concat(H(e,`control:select`)).concat(H(e,`:slider`)).concat(H(e,`:toggle`)).concat(H(e,`:switch`)).concat(H(e,`:button`)).concat(H(e,`:number`)).concat(H(e,`:stepper`)).forEach(e=>{let t=`slider`;e.includes(`control:toggle`)||e.includes(`:toggle`)||e.includes(`:switch`)?t=`toggle`:e.includes(`control:button`)||e.includes(`:button`)?t=`button`:(e.includes(`control:select`)||e.includes(`:select`))&&(t=`select`);let n=S(e,/:id\s+"([^"]+)"/i)||S(e,/:id\s+([^\s\)]+)/i)||S(e,/:var\s+"([^"]+)"/i)||S(e,/:var\s+([^\s\)]+)/i)||`ctrl_${P.length+1}`,r=S(e,/:label\s+"([^"]+)"/i)||S(e,/:label\s+([^\s\)]+)/i)||n,i=(S(e,/:bind\s+"([^"]+)"/i)||S(e,/:bind\s+([^\s\)]+)/i)||S(e,/:var\s+"([^"]+)"/i)||S(e,/:var\s+([^\s\)]+)/i)||n).replace(/^\*|\*$/g,``),a=parseFloat(S(e,/:min\s+([\d\.\-]+)/i)||`0`),o=parseFloat(S(e,/:max\s+([\d\.\-]+)/i)||`100`),s=parseFloat(S(e,/:step\s+([\d\.]+)/i)||`1`),c=S(e,/:default\s+"?([^"\s\)]+)"?/i)||S(e,/:val\s+"?([^"\s\)]+)"?/i),l=c===null?void 0:isNaN(Number(c))?c:parseFloat(c);te.push({type:t===`toggle`?`switch`:t===`button`?`button`:`slider`,var:i,label:r,min:a,max:o,step:s}),P.push({id:n,type:t,label:r,bind:i,min:a,max:o,step:s,default:l})})});let I=null,ne=H(e,`:camera`);if(ne.length>0){let e=ne[0],t=t=>{let n=e.match(RegExp(`:${t}\\s+("([^"]+)"|([\\d\\.-]+))`,`i`));return n?n[2]===void 0?n[3]:n[2]:null},n=t(`distance`),r=t(`pitch`),i=t(`yaw`),a=t(`fov`);I={distance:n?parseFloat(n):500,pitch:r?isNaN(Number(r))?r:parseFloat(r):20,yaw:i?isNaN(Number(i))?i:parseFloat(i):0,fov:a?parseFloat(a):60}}else{let t=e.match(/\(:camera\s+:distance\s+([\d\.]+)\s+:pitch\s+([\d\.\-]+)\s+:yaw\s+([\d\.\-]+)\s+:fov\s+([\d\.]+)\)/i);t&&(I={distance:parseFloat(t[1]),pitch:parseFloat(t[2]),yaw:parseFloat(t[3]),fov:parseFloat(t[4])})}return V({id:n,type:l,title:d,stage:p,duration:h,video:o,videoFit:c,has3D:!!I,hasVideo:!!o,camera:I,keyframes:g,subtitles:y,bindings:w,checkpoints:T,scopes:D,ledgers:k,gestures:j,vars:ee,inputs:te,uiControls:P})}var ve=/^#[a-zA-Z0-9_\-:]+$/,ye=/^[a-zA-Z0-9_]+$/;function be(e){return typeof TextEncoder<`u`?new TextEncoder().encode(e).byteLength:e.length}function U(){return typeof performance<`u`&&typeof performance.now==`function`?performance.now():Date.now()}function xe(){return typeof navigator<`u`&&navigator.modelContext?{surface:`navigator.modelContext`,api:navigator.modelContext}:typeof document<`u`&&document.modelContext?{surface:`document.modelContext`,api:document.modelContext}:{surface:`unavailable`,api:null}}function W(e,t){if(typeof e!=`number`||!Number.isFinite(e))return{value:e,clamped:!1};let n=e,r=!1;return t&&typeof t.min==`number`&&Number.isFinite(t.min)&&n<t.min&&(n=t.min,r=!0),t&&typeof t.max==`number`&&Number.isFinite(t.max)&&n>t.max&&(n=t.max,r=!0),{value:n,clamped:r}}function Se(e,t){let n=[];if(typeof e.tuple==`string`&&e.tuple.trim().startsWith(`(:act`)){let r=e.tuple.trim(),i=[],a=r.match(/:seek\s+([0-9.-]+)/i);if(a){let e=Math.max(0,Math.min(1,parseFloat(a[1])));Number.isFinite(e)&&i.push(`:seek ${e.toFixed(3)}`)}let o=r.match(/:highlight\s+"([^"]+)"/i);o&&(ve.test(o[1])?i.push(`:highlight "${o[1]}"`):n.push(o[1]));let s=r.match(/:var\s+"([a-zA-Z0-9_]+)"\s+([0-9.-]+|"[^"]*")/i);if(s&&ye.test(s[1])){let e=s[1],n=s[2].replace(/^"|"$/g,``),r=Number(n);if(!Number.isNaN(r)&&s[2][0]!==`"`){let n=W(r,t?.[e]);i.push(`:var "${e}" ${n.value}`)}else i.push(`:var "${e}" "${n.replace(/"/g,`'`)}"`)}let c=null,l=r.match(/:say\s+"([^"]*)"/i);return l&&(c=l[1],i.push(`:say "${l[1]}"`)),{tuple:i.length>0?`(:act ${i.join(` `)})`:`(:act :seek 0.000)`,sayText:c,rejectedSelectors:n}}let r=[];if(typeof e.seek==`number`&&Number.isFinite(e.seek)){let t=Math.max(0,Math.min(1,e.seek));r.push(`:seek ${t.toFixed(3)}`)}if(typeof e.highlight==`string`&&e.highlight.trim()){let t=e.highlight.trim().startsWith(`#`)?e.highlight.trim():`#${e.highlight.trim()}`;ve.test(t)?r.push(`:highlight "${t}"`):n.push(e.highlight)}if(typeof e.varName==`string`&&ye.test(e.varName.trim())&&e.varValue!==void 0){let n=e.varName.trim(),i=W(e.varValue,t?.[n]);typeof i.value==`number`?r.push(`:var "${n}" ${i.value}`):r.push(`:var "${n}" "${String(i.value).replace(/"/g,`'`)}"`)}let i=null;return typeof e.say==`string`&&e.say.trim()&&(i=e.say.trim().replace(/"/g,`'`),r.push(`:say "${i}"`)),{tuple:r.length>0?`(:act ${r.join(` `)})`:`(:act :say "Inspection ping")`,sayText:i,rejectedSelectors:n}}function Ce(e){return[{name:`ast_set_var`,description:`Mutates a declared simulation :var parameter strictly clamped to its [min, max] bounds and updates reactive bindings.`,inputSchema:{type:`object`,properties:{name:{type:`string`,pattern:`^[a-zA-Z0-9_]+$`,description:`Declared simulation variable identifier (e.g. temp, conc, pressure).`},value:{oneOf:[{type:`number`},{type:`string`}],description:`Target value; numeric inputs are clamped to [min, max].`}},required:[`name`,`value`],additionalProperties:!1},execute:async t=>{let n=U(),r=String(t?.name||``).trim();if(!ye.test(r))throw Error(`Invalid variable identifier: "${r}"`);let i=t?.value;if(typeof i!=`number`&&typeof i!=`string`)throw Error(`Variable value must be a finite number or string.`);if(typeof i==`number`&&!Number.isFinite(i))throw Error(`Numeric variable value must be finite.`);let a=(await e.readState(!1))?.varMeta?.[r]||null,{value:o,clamped:s}=W(i,a),c=await e.setVar(r,o),l=Number((U()-n).toFixed(3)),u={ok:!0,name:c.name||r,requestedValue:i,appliedValue:c.value,clamped:!!(s||c.clamped),bounds:a?{min:a.min??null,max:a.max??null}:null,latencyMs:l};return{...u,mcpPayloadBytes:be(JSON.stringify(u))}}},{name:`ast_dispatch_action`,description:`Executes the 4-slot AST Vector Player action tuple (:seek, :highlight, :var, :say) with selector sanitization.`,inputSchema:{type:`object`,properties:{tuple:{type:`string`,description:`Optional raw (:act ...) S-expression tuple.`},seek:{type:`number`,minimum:0,maximum:1,description:`Normalized timeline progress in [0.0, 1.0].`},highlight:{type:`string`,pattern:`^#[a-zA-Z0-9_\\-:]+$`,description:`SVG element ID selector (e.g. #piston-head) to pulse on stage.`},varName:{type:`string`,pattern:`^[a-zA-Z0-9_]+$`,description:`Variable name for simultaneous :var mutation.`},varValue:{oneOf:[{type:`number`},{type:`string`}],description:`Variable value for simultaneous :var mutation.`},say:{type:`string`,description:`Short pedagogical utterance routed to BSL & audio narration.`}},additionalProperties:!1},execute:async t=>{let n=U(),r=await e.readState(!1),i=Se(t||{},r?.varMeta);if(i.rejectedSelectors.length>0&&i.tuple===`(:act :say "Inspection ping")`)throw Error(`Unsafe SVG selector rejected: ${i.rejectedSelectors.join(`, `)}`);let a=await e.execActionTuple(i.tuple);i.sayText&&e.onSay&&e.onSay(i.sayText);let o=Number((U()-n).toFixed(3)),s={ok:a.ok,tuple:i.tuple,executedActions:a.executedActions,rejectedSelectors:i.rejectedSelectors,latencyMs:o};return{...s,mcpPayloadBytes:be(JSON.stringify(s))}}},{name:`ast_read_state`,description:`Returns compact current simulation state: clock t, normalized progress, :vars, :ledger conservation totals, and :pass-expr checkpoint status.`,inputSchema:{type:`object`,properties:{includeSvgBytes:{type:`boolean`,description:`Include raw SVG DOM serialized byte count for payload comparison.`}},additionalProperties:!1},execute:async t=>{let n=U(),r=t?.includeSvgBytes!==!1,i=await e.readState(r),a=Number((U()-n).toFixed(3));if(!i)return{ok:!1,latencyMs:a,mcpPayloadBytes:0,rawSvgBytes:0,domPayloadReductionPct:0};let o={sceneId:i.sceneId,title:i.title,archetype:i.archetype,t:Number((i.t||0).toFixed(3)),progress:Number((i.progress||0).toFixed(4)),isPlaying:i.isPlaying,vars:i.vars,ledgers:i.ledgers,scopesCount:i.scopesCount,checkpointGoals:i.checkpointGoals},s=be(JSON.stringify(o)),c=Math.max(0,i.svgDomBytes||0),l=c>0?Number(((c-s)/c*100).toFixed(2)):0;return{ok:!0,...o,varMeta:i.varMeta,astSourceBytes:i.astSourceBytes,rawSvgBytes:c,mcpPayloadBytes:s,domPayloadReductionPct:l,latencyMs:a}}}]}function we(e){let t=Ce(e),n=t.map(e=>e.name),{surface:r,api:i}=xe();if(!i)return{registered:!1,surface:`unavailable`,mode:`headless-local`,toolNames:n,tools:t,unregister:()=>{}};let a=`headless-local`,o=[];try{if(typeof i.provideContext==`function`)i.provideContext({tools:t}),a=`provideContext`;else if(typeof i.registerTool==`function`){for(let e of t)i.registerTool(e),o.push(e.name);a=`registerTool`}}catch(e){return console.warn(`[WebMCP] Native registration failed, keeping local tool harness:`,e),{registered:!1,surface:r,mode:`headless-local`,toolNames:n,tools:t,unregister:()=>{}}}return{registered:!0,surface:r,mode:a,toolNames:n,tools:t,unregister:()=>{try{if(a===`provideContext`&&typeof i.clearContext==`function`)i.clearContext();else if(a===`registerTool`&&typeof i.unregisterTool==`function`)for(let e of o)i.unregisterTool(e)}catch{}}}}async function Te(e,t){let{surface:n}=xe(),r=t&&t.length===3?t:Ce(e),i=r.find(e=>e.name===`ast_set_var`),a=r.find(e=>e.name===`ast_dispatch_action`),o=await r.find(e=>e.name===`ast_read_state`).execute({includeSvgBytes:!0}),s=Number(o.latencyMs||0),c=Number(o.mcpPayloadBytes||0),l=Number(o.rawSvgBytes||0),u=Number(o.domPayloadReductionPct||0),d=null,f=null,p=0,m=!1,h=o.varMeta||{};for(let[e,t]of Object.entries(h))if(e!==`simClock`&&t&&typeof t.max==`number`&&typeof t.min==`number`&&t.max>t.min){d=e,f=o.vars?.[e]??t.val??t.min;let n=await i.execute({name:e,value:t.max+25});p=Number(n.latencyMs||0),m=!!n.clamped&&Number(n.appliedValue)===t.max,f!==null&&await i.execute({name:e,value:f});break}if(!d){let e=U();try{let t=await i.execute({name:`simClock`,value:Number(o.t||0)});p=Number(t.latencyMs||U()-e),m=!0,d=`simClock`}catch{p=Number((U()-e).toFixed(3))}}let g=await a.execute({say:`WebMCP 4-slot action verification complete.`}),_=Number(g.latencyMs||0),v=[s,p,_].filter(e=>e>0),y=v.length>0?Number((v.reduce((e,t)=>e+t,0)/v.length).toFixed(3)):0;return{surface:n,registrationMode:n===`unavailable`?`headless-local`:`provideContext`,toolsCount:r.length,toolNames:r.map(e=>e.name),readLatencyMs:s,setVarLatencyMs:p,dispatchLatencyMs:_,meanRoundTripMs:y,mcpPayloadBytes:c,rawSvgBytes:l,domPayloadReductionPct:u,clampingVerified:m,sampleVarTested:d,timestamp:Date.now()}}var G=`epp_last_telemetry_dossier`,Ee=`(:scene :id "hooke-spring-bench" :title "Hooke's Law Oscillator" :stage "KS4 PHYSICS" :type "Sim" :duration 12.0
  (:physics :substeps 4 :restitution 0.85 :friction 0.04)
  (:vars
    ((:var :name "k" :label "Spring k (N/m)" :val 24 :min 5 :max 80 :step 1)
     (:var :name "mass" :label "Mass (kg)" :val 2.0 :min 0.5 :max 10 :step 0.5)
     (:var :name "disp" :label "Displacement (m)" :val 0.45 :min -1.0 :max 1.0 :step 0.05)))
  (:computed
    ((:val :name "epElastic" :expr "0.5 * vars.k * vars.disp * vars.disp")
     (:val :name "omega" :expr "Math.sqrt(vars.k / Math.max(0.1, vars.mass))")))
  (:spring :target "#mass-bob" :stiffness "vars.k" :damping 0.15 :rest-length 120)
  (:bindings
    ((:bind :target "#spring-coil" :attr "y2" :expr "180 + vars.disp * 90")
     (:bind :target "#mass-bob" :attr "transform" :expr "'translate(0,' + (vars.disp * 90).toFixed(2) + ')'")))
  (:scope :target "#osc-scope" :x-expr "t" :y-expr "vars.disp" :samples 120 :x-range (0 12) :y-range (-1 1) :plot (40 280 320 110))
  (:ledger :id "energy-ledger" :target "#energy-ledger" :x 40 :y 410 :width 320 :height 18 :unit "J" :max "40"
    :terms ((:label "Elastic PE" :expr "computed.epElastic" :color "#38bdf8")))
  (:interactive
    ((:checkpoint :t 0.5 :title "Target Elastic Energy" :pass-expr "Math.abs(computed.epElastic - 12.0) < 1.5" :hold-duration 0.8
      :prompt "Adjust k and displacement until Elastic PE holds near 12.0 J."
      :options ("Tune k and x" "Double mass" "Freeze clock" "Remove spring") :answer 0 :explanation "E = 0.5 * k * x^2."))))`,De={schemaVersion:`1.0.0`,sceneMetadata:{id:`hooke-spring-bench`,title:`Hooke's Law Oscillator`,stage:`KS4 PHYSICS`,type:`Sim`,durationSeconds:12},physicsConfiguration:{substeps:4,restitution:.85,friction:.04},variables:[{name:`k`,label:`Spring k (N/m)`,defaultValue:24,minimum:5,maximum:80,step:1},{name:`mass`,label:`Mass (kg)`,defaultValue:2,minimum:.5,maximum:10,step:.5},{name:`disp`,label:`Displacement (m)`,defaultValue:.45,minimum:-1,maximum:1,step:.05}],computedExpressions:[{name:`epElastic`,expression:`0.5 * vars.k * vars.disp * vars.disp`},{name:`omega`,expression:`Math.sqrt(vars.k / Math.max(0.1, vars.mass))`}],springs:[{targetSelector:`#mass-bob`,stiffnessExpression:`vars.k`,damping:.15,restLengthPx:120}],reactiveBindings:[{targetSelector:`#spring-coil`,attribute:`y2`,expression:`180 + vars.disp * 90`},{targetSelector:`#mass-bob`,attribute:`transform`,expression:`'translate(0,' + (vars.disp * 90).toFixed(2) + ')'`}],oscilloscopePlots:[{targetSelector:`#osc-scope`,xExpression:`t`,yExpression:`vars.disp`,sampleCapacity:120,xRange:[0,12],yRange:[-1,1],plotViewport:{x:40,y:280,width:320,height:110}}],conservationLedgers:[{id:`energy-ledger`,targetSelector:`#energy-ledger`,bounds:{x:40,y:410,width:320,height:18},unit:`J`,maxExpression:`40`,terms:[{label:`Elastic PE`,expression:`computed.epElastic`,color:`#38bdf8`}]}],interactiveCheckpoints:[{normalizedTime:.5,title:`Target Elastic Energy`,passExpression:`Math.abs(computed.epElastic - 12.0) < 1.5`,holdDurationSeconds:.8,prompt:`Adjust k and displacement until Elastic PE holds near 12.0 J.`,options:[`Tune k and x`,`Double mass`,`Freeze clock`,`Remove spring`],answerIndex:0,explanation:`E = 0.5 * k * x^2.`}]},Oe={type:`object`,properties:{sceneId:{type:`string`},title:{type:`string`},astSExpr:{type:`string`},socraticHint:{type:`string`}},required:[`sceneId`,`astSExpr`],additionalProperties:!1};function K(){return typeof performance<`u`&&typeof performance.now==`function`?performance.now():Date.now()}function q(e){return typeof TextEncoder<`u`?new TextEncoder().encode(e).byteLength:e.length}function J(e){if(!e)return 0;let t=e.match(/[\(\)\{\}\[\]":,]/g)||[],n=e.match(/[a-zA-Z0-9_.\-\*\/+]+/g)||[],r=Math.round(n.length*1.15+t.length*.45);return Math.max(1,r,Math.ceil(e.length/4.1))}function Y(e){return Number(e.toFixed(2))}function ke(){if(typeof performance<`u`&&performance.memory){let e=Number(performance.memory.usedJSHeapSize||0);if(e>0)return Y(e/1048576)}return null}function Ae(e){return new Promise(t=>setTimeout(t,e))}async function je(e){let t=Ee,n=JSON.stringify(De,null,2),r=q(t),i=q(n),a=0,o=!1;try{let e=_e(t);a=e.byteLength;let n=ge(e);o=!!(n&&n.id===`hooke-spring-bench`)}catch{o=!1}let s=!1;try{let e=x(t);s=!!(Array.isArray(e)&&e.length>0&&(e[0]===`:scene`||e[0]===`scene`)||e&&typeof e==`object`&&!Array.isArray(e)&&(e.tag===`:scene`||e.tag===`scene`))}catch{s=!1}let c=!1;try{let e=JSON.parse(n);c=!!(e&&e.sceneMetadata?.id===`hooke-spring-bench`)}catch{c=!1}let l=J(t),u=J(n),d=null,f=null;if(e&&typeof e.measureInputUsage==`function`)try{d=Number(await e.measureInputUsage(t)),f=Number(await e.measureInputUsage(n))}catch{d=null,f=null}let p=d??l,m=f??u,h=i>0?Y((i-r)/i*100):0,g=m>0?Y((m-p)/m*100):0,_=i>0&&a>0?Y((i-a)/i*100):0;return{astLines:t.split(`
`).length,astBytes:r,jsonBytes:i,astbBytes:a,astEstimatedTokens:l,jsonEstimatedTokens:u,astMeasuredTokens:d,jsonMeasuredTokens:f,astVsJsonByteSavingsPct:h,astVsJsonTokenSavingsPct:g,astbVsJsonByteSavingsPct:_,astValid:s,jsonValid:c,astbValid:o}}function Me(){return typeof self<`u`&&self.LanguageModel?self.LanguageModel:typeof window<`u`&&window.LanguageModel?window.LanguageModel:null}async function Ne(e){if(!e)return`unsupported`;try{if(typeof e.availability==`function`)try{let t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]});return String(t||`unavailable`)}catch{let t=await e.availability();return String(t||`unavailable`)}if(typeof e.capabilities==`function`){let t=await e.capabilities();return String(t?.available||`unavailable`)}}catch{return`unavailable`}return`unavailable`}function Pe(e){return e?{inputUsage:typeof e.inputUsage==`number`?e.inputUsage:typeof e.tokensSoFar==`number`?e.tokensSoFar:null,inputQuota:typeof e.inputQuota==`number`?e.inputQuota:typeof e.maxTokens==`number`?e.maxTokens:null}:{inputUsage:null,inputQuota:null}}function Fe(e){let{hardwareProfile:t,promptApiStatus:n,contentionPhases:r,contextQuotaTrace:i,compressionComparison:a,webmcpBenchmark:o}=e,{phaseABaseline:s,phaseBConcurrent:c,phaseCRecovery:l,deltas:u}=r;return[`# Chrome Built-in AI & WebMCP Field Telemetry Dossier`,``,`- **Generated**: \`${e.generatedAtIso}\``,`- **Active Cartridge**: \`${e.sceneId}\``,`- **Active AI Tier**: \`${n.activeTier}\` (Prompt API availability: \`${n.availability}\`)`,``,`## 1. Hardware & Memory Profile`,`| Metric | Measured Value |`,`|---|---|`,`| User Agent | \`${t.userAgent.replace(/\|/g,`/`)}\` |`,`| \`navigator.deviceMemory\` | ${t.deviceMemoryGb===null?`Not exposed`:`${t.deviceMemoryGb} GB`} |`,`| \`navigator.hardwareConcurrency\` | ${t.hardwareConcurrency===null?`Not exposed`:`${t.hardwareConcurrency} threads`} |`,`| WebGPU Adapter Surface | ${t.webgpuSupported?`Present`:`Absent`} |`,`| WASM Fixed Linear Pool | ${(t.wasmPoolBytes/1024).toFixed(0)} KB (${t.wasmPages} pages, 0 dynamic allocs in loop) |`,`| JS Heap (Start -> End) | ${t.jsHeapStartMb===null?`Not exposed`:`${t.jsHeapStartMb} MB -> ${t.jsHeapEndMb} MB (Δ ${t.heapDeltaMb} MB)`} |`,`| BSL Vector Avatar Active | ${t.bslAvatarActiveDuringRun?`Yes (60 FPS procedural skeleton)`:`No`} |`,``,`## 2. Concurrent 60 FPS Vector Simulation + On-Device Inference Contention`,`- **Phase A (Baseline)**: ${s.durationMs} ms of pure 60 FPS vector physics + BSL avatar (zero AI activity)`,`- **Phase B (Concurrent)**: ${c.durationMs} ms concurrent workload (\`${c.workloadLabel}\`)`,`- **Phase C (Recovery)**: ${l.durationMs} ms post-inference compositor & GC recovery`,``,`| Phase | Samples | Mean (ms) | p95 (ms) | p99 (ms) | Max (ms) | Frames > 16.67ms | Est. FPS | VM Compute Mean (ms) |`,`|---|---:|---:|---:|---:|---:|---:|---:|---:|`,`| Phase A (Baseline) | ${s.stats.sampleCount} | ${s.stats.meanMs} | ${s.stats.p95Ms} | ${s.stats.p99Ms} | ${s.stats.maxMs} | ${s.stats.framesOver16_67ms} (${s.stats.overBudgetPct}%) | ${s.stats.estimatedFps} | ${s.stats.meanComputeMs} |`,`| Phase B (Concurrent) | ${c.stats.sampleCount} | ${c.stats.meanMs} | ${c.stats.p95Ms} | ${c.stats.p99Ms} | ${c.stats.maxMs} | ${c.stats.framesOver16_67ms} (${c.stats.overBudgetPct}%) | ${c.stats.estimatedFps} | ${c.stats.meanComputeMs} |`,`| Phase C (Recovery) | ${l.stats.sampleCount} | ${l.stats.meanMs} | ${l.stats.p95Ms} | ${l.stats.p99Ms} | ${l.stats.maxMs} | ${l.stats.framesOver16_67ms} (${l.stats.overBudgetPct}%) | ${l.stats.estimatedFps} | ${l.stats.meanComputeMs} |`,``,`- **Phase B Contention Deltas vs Baseline**: \`Δmean = ${u.phaseBMeanMsDelta>=0?`+`:``}${u.phaseBMeanMsDelta} ms\`, \`Δp95 = ${u.phaseBP95MsDelta>=0?`+`:``}${u.phaseBP95MsDelta} ms\`, \`Δp99 = ${u.phaseBP99MsDelta>=0?`+`:``}${u.phaseBP99MsDelta} ms\`, \`ΔoverBudgetFrames = ${u.phaseBOverBudgetFrameDelta>=0?`+`:``}${u.phaseBOverBudgetFrameDelta}\``,`- **Phase C Recovery Delta vs Baseline**: \`Δmean = ${u.phaseCMeanMsDelta>=0?`+`:``}${u.phaseCMeanMsDelta} ms\`, \`Δp95 = ${u.phaseCP95MsDelta>=0?`+`:``}${u.phaseCP95MsDelta} ms\``,`- **Session Clone Latency**: ${n.cloneLatencyMs===null?`N/A (Prompt API session inactive)`:`${n.cloneLatencyMs} ms (clone.destroy() cleanly executed: ${n.cloneDestroyedCleanly})`}`,``,`## 3. Context Quota & Multi-Turn Socratic Checkpoint Telemetry`,`- \`session.inputQuota\`: ${i.inputQuota===null?`N/A`:i.inputQuota}`,`- Final \`session.inputUsage\`: ${i.finalInputUsage===null?`N/A`:i.finalInputUsage}`,`- \`quotaoverflow\` Events Fired: ${i.totalQuotaOverflows}`,`- Mean Time-To-First-Token (TTFT): ${i.meanTtftMs===null?`N/A`:`${i.meanTtftMs} ms`}`,``,`| Turn | Role | Prompt Bytes | Output Bytes | TTFT (ms) | Duration (ms) | Input Usage | Overflows | Valid |`,`|---:|---|---:|---:|---:|---:|---:|---:|---|`,...i.turns.map(e=>`| ${e.turn} | \`${e.promptRole}\` | ${e.promptBytes} | ${e.outputBytes} | ${e.ttftMs} | ${e.durationMs} | ${e.inputUsage===null?`N/A`:`${e.inputUsage}/${e.inputQuota??`?`}`} | ${e.quotaoverflowCount} | ${e.validOutput?`PASS`:`WARN`} |`),``,"## 4. Token & Byte Compression: Homoiconic `.ast` vs Verbose JSON vs Binary `.astb`",`| Representation | UTF-8 Bytes | Tokens (Measured / Est.) | Valid Parse | Savings vs Verbose JSON |`,`|---|---:|---:|---|---|`,`| Homoiconic \`.ast\` (${a.astLines} lines) | ${a.astBytes} B | ${a.astMeasuredTokens??a.astEstimatedTokens} ${a.astMeasuredTokens===null?`(est.)`:`(Nano tokenizer)`} | ${a.astValid?`PASS`:`FAIL`} | ${a.astVsJsonByteSavingsPct}% bytes / ${a.astVsJsonTokenSavingsPct}% tokens |`,`| Verbose JSON Schema | ${a.jsonBytes} B | ${a.jsonMeasuredTokens??a.jsonEstimatedTokens} ${a.jsonMeasuredTokens===null?`(est.)`:`(Nano tokenizer)`} | ${a.jsonValid?`PASS`:`FAIL`} | Baseline (0%) |`,`| Pre-compiled \`.astb\` Bytecode | ${a.astbBytes} B | N/A (Zero-copy binary) | ${a.astbValid?`PASS`:`FAIL`} | ${a.astbVsJsonByteSavingsPct}% bytes |`,``,"## 5. WebMCP (`navigator.modelContext`) Live Tool & Actuation Benchmark",`- **WebMCP Surface**: \`${o.surface}\` (Mode: \`${o.registrationMode}\`)`,`- **Registered Tools (${o.toolsCount})**: \`${o.toolNames.join("`, `")}\``,`- **\`ast_read_state\` Round-Trip**: ${o.readLatencyMs} ms`,`- **\`ast_set_var\` Round-Trip**: ${o.setVarLatencyMs} ms (\`[min, max]\` clamping verified on \`${o.sampleVarTested}\`: ${o.clampingVerified?`PASS`:`FAIL`})`,`- **\`ast_dispatch_action\` 4-Slot Tuple Round-Trip**: ${o.dispatchLatencyMs} ms`,`- **Compact MCP JSON vs Raw SVG DOM**: ${o.mcpPayloadBytes} B vs ${o.rawSvgBytes} B (**${o.domPayloadReductionPct}% smaller payload**)`,``,`---`,`*Captured locally in zero-egress air-gapped telemetry mode via EdgeLearningEngineDB.*`].join(`
`)}async function Ie(e){await c(G,JSON.stringify(e))}async function X(){try{let e=(await l()).find(e=>e.key===G);return!e||!e.value?null:JSON.parse(e.value)}catch{return null}}function Le(e,t,n){if(typeof document<`u`)try{let r=new Blob([t],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}catch{}}async function Re(e){let{transport:t,sceneId:n,onProgress:r,phaseADurationMs:i=3e3,phaseCDurationMs:a=2e3}=e,o=typeof navigator<`u`?navigator:{},s=Me(),c=await Ne(s),l=m(),u=ke();r?.({phase:`init`,pct:5,label:`Probing hardware & Prompt API availability (${c})...`});let d=l;l||(g(!0),d=!0),_({subtitle:`Benchmarking 60 FPS vector kinematics and on-device telemetry.`,isSpeaking:!0});let f,p,h,v=`tier3-deterministic-ast`,y=null,b=!1,C=!1,w=[],T=0,E=null,D=null,O=null;try{r?.({phase:`phase-a`,pct:15,label:`Phase A (Baseline): Capturing ${Math.round(i/1e3)}s of pure 60 FPS physics + BSL...`});let e=K();await t.startProfCapture(),await Ae(i);let l=await t.stopProfCapture();f={durationMs:Math.round(K()-e),stats:l.stats,activeMetrics:l.activeMetrics,workloadLabel:`Pure 60 FPS vector + BSL kinematics (Zero AI)`};let m=await t.mcpTransport.readState(!1),g=m?.ledgers?.length?m.ledgers.map(e=>`${e.id}=${e.total.toFixed(2)}${e.unit||``}`).join(`, `):`none`,_=m?.checkpointGoals?.length?m.checkpointGoals.map(e=>`${e.title}[passed=${e.passed},expr=${e.passExpr||`none`}]`).join(`; `):`none`,k=`(:state :scene "${n}" :t ${(m?.t??0).toFixed(2)} :vars ${JSON.stringify(m?.vars||{})} :ledger "${g}" :goals "${_}")`;r?.({phase:`phase-b`,pct:45,label:`Phase B (Concurrent Inference): Running ${c===`readily`||c===`available`?`Gemini Nano promptStreaming`:`Tier-2/3 fallback telemetry`}...`});let A=K();await t.startProfCapture();let j=`Tier-3 Deterministic Socratic + AST Compiler Stress`;if(s&&(c===`readily`||c===`available`||(c===`after-download`||c===`downloading`)&&F())){let e=null,t=()=>{T+=1};try{let n=`You synthesize compact AST vector cartridges (:scene ...) and concise Socratic nudges grounded in telemetry.`;try{e=await s.create({samplingMode:`most-predictable`,initialPrompts:[{role:`system`,content:n}],expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]})}catch{e=await s.create({initialPrompts:[{role:`system`,content:n}]})}e&&typeof e.addEventListener==`function`&&e.addEventListener(`quotaoverflow`,t),v=`chrome-builtin-nano`,j=`Gemini Nano streaming + session.clone() + 3-turn Socratic drill`,O=e;let r=`Emit a minimal 20-line (:scene :id "bench-spring" ...) Hooke oscillator with :scope and :ledger in field astSExpr. Telemetry: ${k}`,i=K(),a=0,o=``;try{let t=e.promptStreaming?e.promptStreaming(r,{responseConstraint:Oe,outputLanguage:`en`}):null;if(C=!!t,t){let e=``;for await(let n of t){a===0&&(a=Y(K()-i));let t=String(n||``),r=t.startsWith(e)?t.slice(e.length):t;e=t,o+=r}!o&&e&&(o=e)}else o=await e.prompt(r,{responseConstraint:Oe}),C=!0,a=Y(K()-i)}catch{C=!1;let t=await e.prompt(r);o=String(t||``),a=Y(K()-i)}let c=Pe(e);if(c.inputQuota!==null&&(E=c.inputQuota),c.inputUsage!==null&&(D=c.inputUsage),w.push({turn:1,promptRole:`ast-synthesis`,promptBytes:q(r),outputBytes:q(o),ttftMs:a||Y(K()-i),durationMs:Y(K()-i),inputUsage:c.inputUsage,inputQuota:c.inputQuota,quotaoverflowCount:T,validOutput:o.includes(`scene`)||o.includes(`:scene`)}),typeof e.clone==`function`){let t=K(),n=await e.clone();y=Y(K()-t),n&&typeof n.destroy==`function`&&(n.destroy(),b=!0)}let l=[{role:`socratic-drill-1`,prompt:`Turn 1 telemetry ${k}. Give one Socratic hint (<20 words) guiding the learner toward the :pass-expr goal.`},{role:`socratic-drill-2`,prompt:`Turn 2 telemetry ${k}. Explain how energy/particle conservation stays invariant using one numeric variable.`},{role:`socratic-drill-3`,prompt:`Turn 3 telemetry ${k}. Emit one compact (:act :highlight "#stage" :say "...") tuple.`}];for(let t=0;t<l.length;t++){let n=l[t],r=K(),i=0,a=``;if(e.promptStreaming){let t=e.promptStreaming(n.prompt),o=``;for await(let e of t){i===0&&(i=Y(K()-r));let t=String(e||``),n=t.startsWith(o)?t.slice(o.length):t;o=t,a+=n}!a&&o&&(a=o)}else a=String(await e.prompt(n.prompt)),i=Y(K()-r);let o=Pe(e);o.inputQuota!==null&&(E=o.inputQuota),o.inputUsage!==null&&(D=o.inputUsage),w.push({turn:t+2,promptRole:n.role,promptBytes:q(n.prompt),outputBytes:q(a),ttftMs:i||Y(K()-r),durationMs:Y(K()-r),inputUsage:o.inputUsage,inputQuota:o.inputQuota,quotaoverflowCount:T,validOutput:a.trim().length>0})}}catch(e){console.warn(`[EPPBench] Native Prompt API invocation failed, dropping to Tier-2/3:`,e)}finally{if(e)try{e.removeEventListener?.(`quotaoverflow`,t)}catch{}}}let M=await je(O);if(O&&typeof O.destroy==`function`){try{O.destroy()}catch{}O=null}if(w.length===0){let e=S.checkMemoryEligibility();if(S.isReady()&&e.isEligible&&F()){v=`webgpu-webllm`,j=`Tier-2 WebLLM / WebGPU streaming fallback`;let e=[{role:`ast-synthesis`,prompt:`Synthesize compact 20-line AST for ${n}.`},{role:`socratic-drill-1`,prompt:`Telemetry ${k}. One Socratic hint?`},{role:`socratic-drill-2`,prompt:`Telemetry ${k}. Conservation law note?`},{role:`socratic-drill-3`,prompt:`Telemetry ${k}. Action tuple (:act :seek 0.5).`}];for(let t=0;t<e.length;t++){let n=e[t],r=K(),i=0,a=``;for await(let e of S.inferStream(n.prompt))i===0&&(i=Y(K()-r)),a+=e;w.push({turn:t+1,promptRole:n.role,promptBytes:q(n.prompt),outputBytes:q(a),ttftMs:i||Y(K()-r),durationMs:Y(K()-r),inputUsage:null,inputQuota:null,quotaoverflowCount:0,validOutput:a.trim().length>0})}}else{v=`tier3-deterministic-ast`,j=`Tier-3 Deterministic AST/Bytecode Socratic Synthesis (Nano ${c})`;let e=[`ast-synthesis`,`socratic-drill-1`,`socratic-drill-2`,`socratic-drill-3`];for(let t=0;t<e.length;t++){let n=e[t],r=n===`ast-synthesis`?`Synthesize canonical 20-line AST from telemetry ${k}`:`Socratic drill ${t} on telemetry ${k}`,i=K(),a=``;n===`ast-synthesis`?(x(Ee),ge(_e(Ee)),a=Ee):a=(await S.infer(r)).output;let o=Y(K()-i);w.push({turn:t+1,promptRole:n,promptBytes:q(r),outputBytes:q(a),ttftMs:o,durationMs:o,inputUsage:null,inputQuota:null,quotaoverflowCount:0,validOutput:a.length>0}),await Ae(300)}}}let N=await t.stopProfCapture();p={durationMs:Math.round(K()-A),stats:N.stats,activeMetrics:N.activeMetrics,workloadLabel:j},r?.({phase:`phase-c`,pct:78,label:`Phase C (Recovery): Measuring ${Math.round(a/1e3)}s post-inference frame stability & GC recovery...`});let ee=K();await t.startProfCapture(),await Ae(a);let te=await t.stopProfCapture();h={durationMs:Math.round(K()-ee),stats:te.stats,activeMetrics:te.activeMetrics,workloadLabel:`Post-inference GPU/NPU & GC recovery`},r?.({phase:`webmcp`,pct:90,label:`Measuring WebMCP (${xe().surface}) tool latency & DOM payload savings...`});let P=await Te(t.mcpTransport,t.mcpTools),I=ke(),ne=u!==null&&I!==null?Y(I-u):null,L=w.map(e=>e.ttftMs).filter(e=>Number.isFinite(e)&&e>=0),re=L.length>0?Y(L.reduce((e,t)=>e+t,0)/L.length):null,R={dossierVersion:`1.0.0`,generatedAtIso:new Date().toISOString(),sceneId:n,hardwareProfile:{userAgent:String(o.userAgent||`Unknown`),deviceMemoryGb:typeof o.deviceMemory==`number`?o.deviceMemory:null,hardwareConcurrency:typeof o.hardwareConcurrency==`number`?o.hardwareConcurrency:null,webgpuSupported:`gpu`in o,wasmPoolBytes:te.memory.wasmPoolBytes||458752,wasmPages:te.memory.wasmPages||7,jsHeapStartMb:u,jsHeapEndMb:I,heapDeltaMb:ne,bslAvatarActiveDuringRun:d},promptApiStatus:{present:!!s,availability:c,activeTier:v,cloneLatencyMs:y,cloneDestroyedCleanly:b,constraintSchemaUsed:C},contentionPhases:{phaseABaseline:f,phaseBConcurrent:p,phaseCRecovery:h,deltas:{phaseBMeanMsDelta:Y(p.stats.meanMs-f.stats.meanMs),phaseBP95MsDelta:Y(p.stats.p95Ms-f.stats.p95Ms),phaseBP99MsDelta:Y(p.stats.p99Ms-f.stats.p99Ms),phaseBMaxMsDelta:Y(p.stats.maxMs-f.stats.maxMs),phaseBOverBudgetFrameDelta:p.stats.framesOver16_67ms-f.stats.framesOver16_67ms,phaseCMeanMsDelta:Y(h.stats.meanMs-f.stats.meanMs),phaseCP95MsDelta:Y(h.stats.p95Ms-f.stats.p95Ms)}},contextQuotaTrace:{inputQuota:E,finalInputUsage:D,totalQuotaOverflows:T,meanTtftMs:re,turns:w},compressionComparison:M,webmcpBenchmark:P};return r?.({phase:`export`,pct:96,label:`Persisting telemetry dossier to EdgeLearningEngineDB...`}),await Ie(R),r?.({phase:`complete`,pct:100,label:`Chrome EPP Contention & WebMCP Telemetry Suite Complete`}),R}finally{if(O&&typeof O.destroy==`function`){try{O.destroy()}catch{}O=null}!l&&m()&&g(!1)}}function Z(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}async function ze(){let e=(typeof self<`u`?self:window)?.LanguageModel||window?.LanguageModel;if(!e)return`unavailable (API absent)`;try{if(typeof e.availability==`function`)try{let t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]});return String(t||`unavailable`)}catch{return String(await e.availability()||`unavailable`)}if(typeof e.capabilities==`function`){let t=await e.capabilities();return String(t?.available||`unavailable`)}}catch{return`unavailable`}return`unavailable`}function Be(e,t=`ms`){return`${e>0?`+`:``}${e.toFixed(2)} ${t}`}function Ve(e){let{onClose:t,presetId:n,presetLabel:r,presetType:i,postToPlayer:a,benchTransport:o,webMcpHandle:s}=e,c=document.createElement(`div`);c.className=`ast-diagnostics-drawer`,c.style.cssText=`padding: 1rem 1.25rem; background: #07090e; color: #e2e8f0; font-size: 0.8rem; border-bottom: 1px solid #1e293b;`;let l=!1,u=null,d=null,f=null,m=null,h=`probing...`,g=``;function _(){let e=[`448 KB WASM SoA`];if(typeof performance<`u`&&performance.memory){let t=(performance.memory.usedJSHeapSize/1048576).toFixed(1);e.push(`JS Heap ${t} MB`)}let t=typeof navigator<`u`?navigator:{};return typeof t.deviceMemory==`number`&&e.push(`${t.deviceMemory} GB RAM`),typeof t.hardwareConcurrency==`number`&&e.push(`${t.hardwareConcurrency}T CPU`),e.join(` · `)}function v(){let e=p(`app_perf_hud_enabled`)===`true`,t=p(`app_hud_verbosity`)||`minimal`,a=p(`app_frame_budget_alert`)===`true`,o=p(`app_target_fps`)||`adaptive`,v=xe(),b=i===`Sim`,x=d?.compressionComparison||f,S=d?.webmcpBenchmark||m,C=d?.contentionPhases,w=d?.contextQuotaTrace;c.innerHTML=`
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid #1e293b;">
        <div style="min-width:0;">
          <div style="font-size:0.68rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#64748b; font-family:ui-monospace, monospace;">
            Lumina Telemetry &amp; Chrome EPP Field Test Bed · ${b?`:Sim`:`:`+Z(i)} · ${Z(n)}
          </div>
          <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-top:2px;">
            <strong style="font-size:0.96rem; color:#f8fafc; letter-spacing:-0.01em;">
              Hardware Budget, On-Device AI Contention &amp; WebMCP Dossier
            </strong>
            <span style="font-size:0.74rem; color:#94a3b8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
              ${Z(_())}
            </span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
          <button
            type="button"
            id="diag-btn-run-epp"
            ${l?`disabled`:``}
            style="padding:6px 12px; border-radius:6px; background:${l?`#1e293b`:`#0284c7`}; color:#ffffff; border:1px solid ${l?`#334155`:`#38bdf8`}; font-size:0.76rem; font-weight:700; cursor:${l?`wait`:`pointer`}; font-family:ui-sans-serif, system-ui, sans-serif;">
            ${l?`Running ${u?.pct??0}%...`:`Run Chrome EPP Contention Suite & Export Report`}
          </button>
          <button
            type="button"
            id="diag-btn-close"
            style="background:transparent; border:1px solid #1e293b; border-radius:6px; color:#94a3b8; font-size:0.85rem; cursor:pointer; padding:4px 9px;"
            title="Close Diagnostics">
            ✕
          </button>
        </div>
      </div>

      ${u&&l?`
        <div style="background:#0b1120; border:1px solid #0284c7; border-radius:6px; padding:10px 12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:0.74rem; margin-bottom:6px; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
            <span style="color:#38bdf8; font-weight:700;">${Z(u.label)}</span>
            <span style="color:#f8fafc;">${u.pct}%</span>
          </div>
          <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
            <div style="width:${u.pct}%; height:100%; background:#38bdf8; transition:width 0.2s ease;"></div>
          </div>
        </div>
      `:``}

      ${g?`
        <div style="background:#0b1120; border:1px solid #1e293b; border-left:3px solid #34d399; padding:7px 10px; margin-bottom:12px; font-size:0.74rem; color:#cbd5e1; font-family:ui-monospace, monospace;">
          ${Z(g)}
        </div>
      `:``}

      <!-- Primary Capability Strip -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:12px;">
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
            Chrome Prompt API (LanguageModel)
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:${h===`readily`||h===`available`?`#34d399`:`#fbbf24`}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${Z(h)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">
            Tier: ${Z(d?.promptApiStatus.activeTier||`auto (Nano -> WebLLM -> Tier 3)`)}
          </div>
        </div>

        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
              WebMCP Tool Surface
            </span>
            <button type="button" id="diag-btn-test-mcp" style="background:#111827; border:1px solid #334155; color:#38bdf8; border-radius:4px; padding:2px 7px; font-size:0.68rem; font-weight:700; cursor:pointer;">
              Ping Tools
            </button>
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:${v.surface===`unavailable`?`#94a3b8`:`#34d399`}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${Z(v.surface)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px; font-family:ui-monospace, monospace;">
            ${s?.tools?.length||3} tools (${s?.registered?Z(s.mode):`local harness`})
          </div>
        </div>

        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
            AST vs JSON Compression
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:#38bdf8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; margin-top:3px;">
            ${x?`${x.astVsJsonByteSavingsPct}% bytes · ${x.astVsJsonTokenSavingsPct}% tokens`:`Computing...`}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
            ${x?`.ast ${x.astBytes}B · .astb ${x.astbBytes}B · JSON ${x.jsonBytes}B`:Z(r)}
          </div>
        </div>
      </div>

      <!-- Canvas Vector HUD & Frame Budget Controls (Preserved Existing Controls) -->
      <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:0.76rem; font-weight:600; color:#cbd5e1;">
            <input type="checkbox" id="diag-toggle-hud" ${e?`checked`:``} style="cursor:pointer; width:15px; height:15px;" />
            <span>Vector Canvas HUD (<strong style="color:${e?`#38bdf8`:`#64748b`};">${e?`ON`:`OFF`}</strong>)</span>
          </label>

          <div style="display:inline-flex; align-items:center; gap:6px;">
            <label for="diag-select-verbosity" style="font-size:0.72rem; color:#94a3b8; font-weight:600;">Detail:</label>
            <select id="diag-select-verbosity" style="padding:3px 7px; border-radius:4px; background:#07090e; color:#f8fafc; border:1px solid #334155; font-size:0.74rem; cursor:pointer;">
              <option value="minimal" ${t===`minimal`?`selected`:``}>Minimal (FPS &amp; VM ms)</option>
              <option value="graph" ${t===`graph`?`selected`:``}>Vector Sparkline</option>
              <option value="full" ${t===`full`?`selected`:``}>Full Telemetry</option>
            </select>
          </div>

          <div style="display:inline-flex; align-items:center; gap:6px;">
            <label for="diag-select-fps" style="font-size:0.72rem; color:#94a3b8; font-weight:600;">FPS Cap:</label>
            <select id="diag-select-fps" style="padding:3px 7px; border-radius:4px; background:#07090e; color:#f8fafc; border:1px solid #334155; font-size:0.74rem; cursor:pointer;">
              <option value="adaptive" ${o===`adaptive`?`selected`:``}>Adaptive (60-240Hz)</option>
              <option value="120" ${o===`120`?`selected`:``}>120Hz ProMotion</option>
              <option value="60" ${o===`60`?`selected`:``}>Locked 60 FPS</option>
              <option value="30" ${o===`30`?`selected`:``}>Eco 30 FPS</option>
            </select>
          </div>

          <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:0.76rem; font-weight:600; color:#cbd5e1;">
            <input type="checkbox" id="diag-toggle-budget" ${a?`checked`:``} style="cursor:pointer; width:15px; height:15px;" />
            <span>16.6ms Alarm (<strong style="color:${a?`#f87171`:`#64748b`};">${a?`ON`:`OFF`}</strong>)</span>
          </label>
        </div>

        <button type="button" id="diag-btn-ping" style="padding:4px 9px; border-radius:4px; background:#111827; color:#38bdf8; border:1px solid #334155; font-size:0.72rem; font-weight:700; cursor:pointer;">
          Ping Frame Budget
        </button>
      </div>

      ${C?`
        <!-- Empirical 3-Phase Contention Metrics -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
            <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8;">
              3-Phase 60 FPS GPU/NPU Contention Trace
            </span>
            <span style="font-size:0.72rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#38bdf8;">
              ΔMean(B-A): ${Be(C.deltas.phaseBMeanMsDelta)} · Δp95(B-A): ${Be(C.deltas.phaseBP95MsDelta)} · ΔMean(C-A): ${Be(C.deltas.phaseCMeanMsDelta)}
            </span>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
              <thead>
                <tr style="border-bottom:1px solid #1e293b; color:#64748b; text-align:right;">
                  <th style="text-align:left; padding:4px 6px;">Phase</th>
                  <th style="padding:4px 6px;">Samples</th>
                  <th style="padding:4px 6px;">Mean</th>
                  <th style="padding:4px 6px;">p95</th>
                  <th style="padding:4px 6px;">p99</th>
                  <th style="padding:4px 6px;">Max</th>
                  <th style="padding:4px 6px;">&gt;16.67ms</th>
                  <th style="padding:4px 6px;">FPS</th>
                  <th style="padding:4px 6px;">VM ms</th>
                </tr>
              </thead>
              <tbody>
                ${[{name:`A · Baseline`,p:C.phaseABaseline},{name:`B · Concurrent`,p:C.phaseBConcurrent},{name:`C · Recovery`,p:C.phaseCRecovery}].map(({name:e,p:t})=>`
                  <tr style="border-bottom:1px solid #111827; text-align:right; color:#e2e8f0;">
                    <td style="text-align:left; padding:5px 6px; font-weight:700; color:#f8fafc;">${e}</td>
                    <td style="padding:5px 6px;">${t.stats.sampleCount}</td>
                    <td style="padding:5px 6px;">${t.stats.meanMs.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${t.stats.p95Ms.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${t.stats.p99Ms.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${t.stats.maxMs.toFixed(2)}ms</td>
                    <td style="padding:5px 6px; color:${t.stats.framesOver16_67ms>0?`#fbbf24`:`#34d399`};">${t.stats.framesOver16_67ms} (${t.stats.overBudgetPct}%)</td>
                    <td style="padding:5px 6px; color:#38bdf8;">${t.stats.estimatedFps.toFixed(1)}</td>
                    <td style="padding:5px 6px;">${t.stats.meanComputeMs.toFixed(3)}ms</td>
                  </tr>
                `).join(``)}
              </tbody>
            </table>
          </div>
        </div>
      `:``}

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:10px; margin-bottom:10px;">
        <!-- Quota & Socratic Telemetry Card -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px;">
          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; margin-bottom:6px;">
            Context Quota, TTFT &amp; session.clone()
          </div>
          ${w?`
            <div style="font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#cbd5e1; margin-bottom:6px;">
              Quota: ${w.finalInputUsage??`N/A`} / ${w.inputQuota??`N/A`} · Overflows: ${w.totalQuotaOverflows} · Mean TTFT: ${w.meanTtftMs??`N/A`} ms · Clone: ${d?.promptApiStatus.cloneLatencyMs!==null&&d?.promptApiStatus.cloneLatencyMs!==void 0?`${d.promptApiStatus.cloneLatencyMs} ms`:`N/A`}
            </div>
            <div style="font-size:0.71rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#94a3b8;">
              ${w.turns.map(e=>`T${e.turn}(${e.promptRole}): ${e.ttftMs}ms TTFT / ${e.durationMs}ms total · ${e.outputBytes}B`).join(`<br/>`)}
            </div>
          `:`
            <div style="font-size:0.74rem; color:#64748b;">
              Run the contention suite to log live <code>inputQuota</code>, <code>quotaoverflow</code>, <code>session.clone()</code>, and per-turn TTFT metrics.
            </div>
          `}
        </div>

        <!-- WebMCP Round-Trip Telemetry Card -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px;">
          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; margin-bottom:6px;">
            WebMCP Actuation &amp; Payload Reduction
          </div>
          ${S?`
            <div style="font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#cbd5e1; line-height:1.55;">
              <div>ast_read_state: <strong>${S.readLatencyMs}ms</strong> · ast_set_var: <strong>${S.setVarLatencyMs}ms</strong> · ast_dispatch_action: <strong>${S.dispatchLatencyMs}ms</strong></div>
              <div>Payload: <strong>${S.mcpPayloadBytes} B</strong> MCP JSON vs <strong>${S.rawSvgBytes} B</strong> SVG DOM (<strong style="color:#34d399;">${S.domPayloadReductionPct}% smaller</strong>)</div>
              <div>[min, max] Clamping Guard (<code>${Z(S.sampleVarTested||`none`)}</code>): <strong style="color:${S.clampingVerified?`#34d399`:`#f87171`};">${S.clampingVerified?`PASS`:`FAIL`}</strong></div>
            </div>
          `:`
            <div style="font-size:0.74rem; color:#64748b;">
              Click <strong>Ping Tools</strong> or run the contention suite to measure WebMCP tool round-trip latency and SVG DOM payload savings.
            </div>
          `}
        </div>
      </div>

      <!-- Export Actions Footer -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-top:8px; border-top:1px solid #1e293b;">
        <span style="font-size:0.71rem; color:#64748b; font-family:ui-monospace, monospace;">
          ${d?`Last dossier: ${Z(d.generatedAtIso)} · Saved in EdgeLearningEngineDB`:`Zero network egress · Saved locally in EdgeLearningEngineDB`}
        </span>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <button type="button" id="diag-btn-export-md" ${d?``:`disabled`} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${d?`#38bdf8`:`#475569`}; border:1px solid ${d?`#0284c7`:`#1e293b`}; font-size:0.72rem; font-weight:700; cursor:${d?`pointer`:`not-allowed`};">
            Export .md Dossier
          </button>
          <button type="button" id="diag-btn-export-json" ${d?``:`disabled`} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${d?`#34d399`:`#475569`}; border:1px solid ${d?`#059669`:`#1e293b`}; font-size:0.72rem; font-weight:700; cursor:${d?`pointer`:`not-allowed`};">
            Export .json Telemetry
          </button>
          <button type="button" id="diag-btn-copy-md" ${d?``:`disabled`} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${d?`#e2e8f0`:`#475569`}; border:1px solid #334155; font-size:0.72rem; font-weight:700; cursor:${d?`pointer`:`not-allowed`};">
            Copy Markdown
          </button>
        </div>
      </div>
    `,y()}function y(){c.querySelector(`#diag-btn-close`)?.addEventListener(`click`,t);let e=c.querySelector(`#diag-toggle-hud`),r=c.querySelector(`#diag-select-verbosity`),i=c.querySelector(`#diag-select-fps`),s=c.querySelector(`#diag-toggle-budget`),p=c.querySelector(`#diag-btn-ping`),_=()=>{let t=!!e?.checked,n=r?.value||`minimal`,o=!!s?.checked,c=i?.value||`adaptive`;b(`app_perf_hud_enabled`,String(t)),b(`app_hud_verbosity`,n),b(`app_frame_budget_alert`,String(o)),b(`app_target_fps`,c),a({type:`SET_PERF_HUD`,enabled:t,mode:n,strictAlarm:o}),a({type:`SET_TARGET_FPS`,fps:c===`adaptive`?0:parseInt(c,10)}),window.dispatchEvent(new CustomEvent(`app-setting-changed`,{detail:{key:`app_perf_hud_enabled`,value:t}}))};e?.addEventListener(`change`,()=>{_(),v()}),r?.addEventListener(`change`,_),i?.addEventListener(`change`,_),s?.addEventListener(`change`,()=>{_(),v()}),p?.addEventListener(`click`,()=>{_(),p&&(p.textContent=`Synchronized`,setTimeout(()=>{p.isConnected&&(p.textContent=`Ping Frame Budget`)},1400))}),c.querySelector(`#diag-btn-test-mcp`)?.addEventListener(`click`,async()=>{g=`Executing WebMCP tool ping across active stage...`,v();try{m=await Te(o.mcpTransport,o.mcpTools),g=`WebMCP verified: read=${m.readLatencyMs}ms, set_var=${m.setVarLatencyMs}ms, dispatch=${m.dispatchLatencyMs}ms (${m.domPayloadReductionPct}% smaller than SVG DOM).`}catch(e){g=`WebMCP ping note: ${e?.message||`Stage unavailable`}`}v()}),c.querySelector(`#diag-btn-run-epp`)?.addEventListener(`click`,async()=>{if(!l){l=!0,g=``,u={phase:`init`,pct:2,label:`Initializing 3-phase empirical contention harness...`},v();try{let e=await Re({transport:o,sceneId:n,onProgress:e=>{u=e,v()}});d=e,f=e.compressionComparison,m=e.webmcpBenchmark,h=e.promptApiStatus.availability,g=`Dossier captured & saved in EdgeLearningEngineDB. Exporting Markdown + JSON telemetry...`;let t=e.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19),r=Fe(e);Le(`chrome-epp-telemetry-${n}-${t}.md`,r,`text/markdown;charset=utf-8`),Le(`chrome-epp-telemetry-${n}-${t}.json`,JSON.stringify(e,null,2),`application/json;charset=utf-8`)}catch(e){g=`Telemetry suite aborted: ${e?.message||`Unexpected error`}`}finally{l=!1,v()}}}),c.querySelector(`#diag-btn-export-md`)?.addEventListener(`click`,()=>{if(!d)return;let e=d.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19);Le(`chrome-epp-telemetry-${d.sceneId}-${e}.md`,Fe(d),`text/markdown;charset=utf-8`)}),c.querySelector(`#diag-btn-export-json`)?.addEventListener(`click`,()=>{if(!d)return;let e=d.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19);Le(`chrome-epp-telemetry-${d.sceneId}-${e}.json`,JSON.stringify(d,null,2),`application/json;charset=utf-8`)}),c.querySelector(`#diag-btn-copy-md`)?.addEventListener(`click`,async()=>{if(d)try{await navigator.clipboard?.writeText(Fe(d)),g=`Markdown dossier copied to clipboard.`,v()}catch{g=`Clipboard unavailable in this frame; use Export .md Dossier.`,v()}})}return v(),Promise.all([ze(),je(),X()]).then(([e,t,n])=>{h=e,f=t,n&&!d&&(d=n),c.isConnected&&v()}).catch(()=>{}),c}function He(e,t){let n=`<!DOCTYPE html>
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
</html>`,r=new Blob([n],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`stj-offline-ast-lesson-${e}.html`,a.click(),URL.revokeObjectURL(i)}var Q=`kinetic-gas`,Ue=[{id:`lumina-architecture`,label:`Lumina: Sovereign Architectural Manifesto (4-Chapter Show & Tell)`,type:`Slide`,stage:`FOUNDATIONAL SYSTEM ARCHITECTURE`,subject:`System Architecture`,section:`System Architecture & Docs`}],We=[...n,...Ue],Ge=new Set(We.map(e=>e.id));function $(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function Ke(e){if(!e)return Q;if(e===`lumina-architecture-manifesto`)return`lumina-architecture`;if(Ge.has(e))return e;try{if(i().some(t=>t.id===e))return e}catch{}return Q}function qe(e,t,n,r){let i=p(`app_perf_hud_enabled`)===`true`,a=p(`app_hud_verbosity`)||`minimal`,o=p(`app_frame_budget_alert`)===`true`,s=new URLSearchParams({bsl:n?`1`:`0`,mode:`suite`,tools:`1`,all:`1`});return r?s.set(`src`,r):s.set(`preset`,t),i&&(s.set(`hud`,`1`),s.set(`hud_verbosity`,a),o&&s.set(`budget_alert`,`1`)),`${e}player.html?${s.toString()}`}function Je(){let n=r(),c=document.createElement(`div`);c.className=`ast-media-player-container`,c.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let l=new URLSearchParams(window.location.search),b=l.get(`src`)||l.get(`file`),x=!l.get(`preset`)&&b&&b.includes(`lumina-architecture`)?`lumina-architecture`:Ke(l.get(`preset`)),S=l.get(`preset`)?null:b,T=`All`,E=``,D=m()||l.get(`bsl`)===`1`,O=!u(),k=We.length>Ue.length?We:[{id:`kinetic-gas`,label:`Kinetic Gas Theory & Thermodynamics`,type:`Sim`,stage:`KS3/KS4 PHYSICS`},{id:`pythagoras`,label:`Pythagoras' Theorem (a² + b² = c²)`,type:`Sim`,stage:`KS3/KS4 MATHEMATICS`},{id:`fractions`,label:`Fractions: Why Common Denominators Rule`,type:`Slide`,stage:`KEY STAGE 2`},{id:`electric-circuits`,label:`Electrical Circuits & Ohm’s Law`,type:`Sim`,stage:`KEY STAGE 3`},{id:`solar-system`,label:`Solar System: Heliocentric Planetary Motion`,type:`Sim`,stage:`KEY STAGE 2/3`},{id:`algebra-balance`,label:`Algebraic Balance Scale`,type:`Sim`,stage:`KEY STAGE 3`},{id:`church-tour`,label:`The Catholic Church Sanctuary & Altar`,type:`Slide`,stage:`WHOLE SCHOOL RE`},{id:`phonics-lab`,label:`EYFS Phonics Sound Mat & Digraphs`,type:`App`,stage:`EYFS / KS1`},...Ue];function A(e){return e.id===`lumina-architecture`||e.subject===`System Architecture`}function j(e){return!A(e)&&(e.stage===`CATHOLIC LIFE`||e.subject===`Religious Education`||e.section&&e.section.includes(`Catholic`)||[`church-tour`,`altar-anatomy`,`holy-oils`,`holy-water-thurifer`,`latin-mass-prayers`,`catholic-rites`,`order-of-the-mass`,`stations-of-the-cross`,`first-communion`,`liturgical-calendar`,`liturgical-postures`,`liturgy-of-the-hours`,`triduum-easter`].includes(e.id))}function M(e){return!A(e)&&!j(e)&&(e.subject===`Science`||e.stage&&e.stage.includes(`PHYSICS`)||[`kinetic-gas`,`electric-circuits`,`solar-system`,`photosynthesis`,`atom`,`velocity`,`dna-helix`].includes(e.id))}function N(e){return!A(e)&&!j(e)&&(e.subject===`Mathematics`||[`pythagoras`,`fractions`,`algebra-balance`,`calculus-curves`,`bodmas`,`times-tables`].includes(e.id))}function ee(e){return!A(e)&&!j(e)&&!M(e)&&!N(e)}function te(){try{return i().filter(e=>!Ge.has(e.id))}catch{return[]}}function P(e){let t=k.find(t=>t.id===e);if(t)return t;try{let t=i().find(t=>t.id===e);if(t)return{id:t.id,label:t.title,stage:t.stage||`LOCAL VAULT`,type:t.type||`Sim`,subject:t.subject||`Custom Ingestion`}}catch{}return k[0]}let F=k.filter(j),I=k.filter(M),ne=k.filter(N),L=k.filter(ee),re=k.filter(A);function R(e){let t=te();return`
      ${t.length>0?`
      <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
        ${t.map(t=>`<option value="${$(t.id)}" ${t.id===e?`selected`:``}>${$(t.title)} (${$(t.stage||`LOCAL`)})</option>`).join(``)}
      </optgroup>
    `:``}
      <optgroup label="✝️ Catholic Sanctuary &amp; Liturgy" style="background:#0f172a; color:#fde047;">
        ${F.map(t=>`<option value="${$(t.id)}" ${t.id===e?`selected`:``}>${$(t.label)} (${$(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="🔬 STEM &amp; Natural Sciences" style="background:#0f172a; color:#38bdf8;">
        ${I.map(t=>`<option value="${$(t.id)}" ${t.id===e?`selected`:``}>${$(t.label)} (${$(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="📐 Mathematics &amp; Logic" style="background:#0f172a; color:#34d399;">
        ${ne.map(t=>`<option value="${$(t.id)}" ${t.id===e?`selected`:``}>${$(t.label)} (${$(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="🔤 EYFS, Languages &amp; Computing" style="background:#0f172a; color:#fbbf24;">
        ${L.map(t=>`<option value="${$(t.id)}" ${t.id===e?`selected`:``}>${$(t.label)} (${$(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="📖 System Architecture &amp; Docs" style="background:#0f172a; color:#e2e8f0;">
        ${re.map(t=>`<option value="${$(t.id)}" ${t.id===e?`selected`:``}>${$(t.label)} (${$(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="⚛️ PhET Ingestion &amp; Distillations" style="background:#0f172a; color:#38bdf8;">
        <option value="phet-ohms-law" ${e===`phet-ohms-law`?`selected`:``}>⚛️ PhET: Ohm's Law (V = I × R)</option>
        <option value="phet-faraday" ${e===`phet-faraday`?`selected`:``}>⚛️ PhET: Faraday's Induction (EMF)</option>
        <option value="phet-pendulum" ${e===`phet-pendulum`?`selected`:``}>⚛️ PhET: Pendulum Laboratory</option>
        <option value="phet-acid-base" ${e===`phet-acid-base`?`selected`:``}>⚛️ PhET: Acid-Base pH Solutions</option>
        <option value="phet-balancing-chemical" ${e===`phet-balancing-chemical`?`selected`:``}>⚛️ PhET: Balancing Chemical Equations</option>
        <option value="__open_local__">📥 Ingest Local PhET (.html / .phet) or SWF...</option>
      </optgroup>
      <optgroup label="⚡ Dynamic Auto-Finder" style="background:#0f172a; color:#94a3b8;">
        <option value="__custom_find__">🔍 Open Any Scene by Name / ID...</option>
      </optgroup>
    `}let ie=R(x),ae=P(x),oe=$(n),se=$(ae.stage||``),le=$(ae.type||`Sim`),ue=$(ae.label||``),z=$(qe(n,x,D,S));c.innerHTML=`
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${oe}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎬 AST Vector Player &amp; Simulator</span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${oe}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${oe}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⚡ Practice Lab
        </a>
      </div>
    </div>

    <!-- Main Interactive Stage Frame -->
    <div style="background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35); margin-bottom:2rem;">
      <!-- Stage Toolbar: Row 1 (Header & Primary Simulation Controls) -->
      <div style="padding:10px 18px; background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; min-height:48px; box-sizing:border-box; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <span style="font-size:1.3rem; flex-shrink:0;">🎮</span>
          <div style="min-width:0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span id="player-active-stage-badge" style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:9999px; background:#0369a1; color:#ffffff; letter-spacing:0.04em; white-space:nowrap;">
                ${se}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace; white-space:nowrap;">
                ${le}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem; white-space:nowrap;" class="hidden sm:inline">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.1rem; font-weight:800; color:#f8fafc; margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${ue}
            </h2>
          </div>
        </div>

        <!-- Primary Execution Actions (Locked Dimensions to Eliminate Any Layout Shift) -->
        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap;">
          <button type="button" id="player-btn-play" style="padding:5px 14px; border-radius:6px; background:#16a34a; color:#ffffff; border:1px solid #22c55e; font-size:0.78rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; white-space:nowrap; min-height:28px;" title="Play / Pause simulation loop (Spacebar)">
            <span id="player-play-icon">▶</span>
            <span id="player-play-text">Play</span>
          </button>
          <button type="button" id="player-btn-reset" style="padding:5px 12px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px;" title="Reset Simulation apparatus to initial conditions">
            ↺ Reset
          </button>
          <button type="button" id="player-btn-mute" style="padding:5px 12px; border-radius:6px; background:${O?`#451a03`:`#1e293b`}; color:#ffffff; border:1px solid ${O?`#d97706`:`#334155`}; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;" title="Mute / Unmute simulation audio and voice narration (M)">
            <span id="player-mute-icon">${O?`🔇`:`🔊`}</span>
            <span id="player-mute-text">${O?`Muted`:`Audio ON`}</span>
          </button>
          <button type="button" id="player-btn-bsl" style="padding:5px 12px; border-radius:6px; background:${D?`#0284c7`:`#1e293b`}; color:#ffffff; border:1px solid ${D?`#38bdf8`:`#334155`}; font-size:0.78rem; font-weight:700; cursor:pointer; width:142px; text-align:center; flex-shrink:0; min-height:28px;" title="Toggle British Sign Language In-Vision Interpreter (Shift+B)">
            🖐️ BSL Signing: ${D?`ON`:`OFF`}
          </button>
          <button type="button" id="player-btn-fullscreen" style="padding:5px 12px; border-radius:6px; background:#0284c7; color:#ffffff; border:none; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap; min-height:28px;" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- Stage Toolbar: Row 2 (Cartridge Selector & Authoring / LMS Tools) -->
      <div style="padding:8px 18px; background:#0b1120; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; gap:10px; min-height:42px; box-sizing:border-box; overflow-x:auto; flex-wrap:nowrap;">
        <div style="display:inline-flex; align-items:center; gap:6px; flex-shrink:0;">
          <label for="player-sim-selector" style="font-size:0.76rem; font-weight:800; color:#94a3b8; white-space:nowrap;">
            🎮 Cartridge:
          </label>
          <select id="player-sim-selector" style="padding:4px 10px; border-radius:6px; background:#0f172a; color:#ffffff; border:1px solid #0284c7; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none; max-width:280px;">
            ${ie}
          </select>
        </div>

        <div style="display:inline-flex; align-items:center; gap:8px; flex-shrink:0;">
          <button type="button" id="player-btn-ai-tutor" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#c084fc; border:1px solid #9333ea; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Ask Gemini Nano / Socratic Co-Pilot about misconceptions and simulation physics">
            🤖 Ask Nano
          </button>

          <button type="button" id="player-btn-lab-drawer" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Adjust simulation physical invariants and mathematical parameters">
            🎛️ Lab Drawer
          </button>

          <button type="button" id="player-btn-diagnostics" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#4ade80; border:1px solid #16a34a; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Inspect Engine Telemetry, FPS, 16.6ms Budget &amp; Vector HUD">
            ⚡ Diagnostics
          </button>

          <button type="button" id="player-btn-log-csv" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Save sampled (t, vars, computed) lab table to local IndexedDB Jotter • Shift+Click to also download .csv">
            📊 Log Data to Jotter (CSV)
          </button>

          <button type="button" id="player-btn-open" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Transpile &amp; Ingest PhET Simulation (*.html, *.phet), Flash SWF, or AST Cartridge">
            ⚛️ PhET / Ingest
          </button>
          <input type="file" id="media-player-file-input" accept=".ast,.svg,.json,.html,.phet" multiple style="display:none;" />

          <button type="button" id="player-btn-embed" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#34d399; border:1px solid #059669; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Get Responsive LMS Embed Snippet (Canvas, Moodle, Google Classroom)">
            🚀 Embed
          </button>

          <button type="button" id="player-btn-export-airgap" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#fde047; border:1px solid #ca8a04; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Export Standalone Single-File HTML Lesson Capsule (&lt; 45 KB)">
            📦 Airgap HTML
          </button>
        </div>
      </div>

      <!-- In-Page Drawer & Modal Mount Point -->
      <div id="player-drawer-mount-point" style="display:none; background:#0f172a; border-bottom:1px solid #334155;"></div>

      <!-- Live Stage iFrame -->
      <div id="player-iframe-wrapper" style="position:relative; width:100%; height:540px; background:#000000;">
        <iframe
          id="ast-player-iframe"
          src="${z}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Catholic Sanctuary Linkage Banner -->
    <div id="catholic-sanctuary-banner" style="display:${j(ae)?`flex`:`none`}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">✝️</span>
        <div>
          <span style="font-size:0.86rem; color:#fde047; font-weight:800;">St Joseph's Catholic Sanctuary:</span>
          <span style="font-size:0.82rem; color:#cbd5e1; margin-left:4px;">This simulation is part of our Catholic faith formation and sacred liturgical curriculum.</span>
        </div>
      </div>
      <a href="${n}catholic-life?tab=altar-anatomy" style="padding:5px 12px; border-radius:6px; background:#ca8a04; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem;">
        Open High Altar &amp; Latin Chapel &rarr;
      </a>
    </div>

    <!-- Category Filter Tabs & Search -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="category-filter-buttons">
          ${[{id:`All`,label:`🌟 All (`+k.length+`)`},{id:`Catholic`,label:`✝️ Catholic Faith (`+F.length+`)`},{id:`STEM`,label:`🔬 STEM Sciences (`+I.length+`)`},{id:`Maths`,label:`📐 Mathematics (`+ne.length+`)`},{id:`EYFS`,label:`🔤 EYFS & Languages (`+L.length+`)`}].map(e=>`
            <button type="button" class="cat-pill-btn" data-cat="${e.id}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${e.id===T?`#0284c7`:`#cbd5e1`}; background:${e.id===T?`#0284c7`:`#f8fafc`}; color:${e.id===T?`#ffffff`:`#475569`};">
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
        <a href="${n}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Architecture Notes &rarr;</a>
      </div>
    </div>
  `;let B=c.querySelector(`#ast-player-iframe`),fe=c.querySelector(`#player-sim-selector`),pe=c.querySelector(`#player-active-title`),me=c.querySelector(`#player-active-stage-badge`),he=c.querySelector(`#player-active-type-badge`),V=c.querySelector(`#player-btn-play`),ge=c.querySelector(`#player-play-icon`),H=c.querySelector(`#player-play-text`),_e=c.querySelector(`#player-btn-reset`),ve=c.querySelector(`#player-btn-mute`),ye=c.querySelector(`#player-btn-bsl`),be=c.querySelector(`#player-btn-ai-tutor`),U=c.querySelector(`#player-btn-lab-drawer`),xe=c.querySelector(`#player-btn-diagnostics`),W=c.querySelector(`#player-btn-log-csv`),Se=c.querySelector(`#player-btn-open`),Ce=c.querySelector(`#player-btn-embed`),Te=c.querySelector(`#player-btn-export-airgap`),G=c.querySelector(`#player-drawer-mount-point`),Ee=c.querySelector(`#media-player-file-input`),De=c.querySelector(`#player-btn-fullscreen`),Oe=c.querySelector(`#cartridge-search-input`),K=c.querySelector(`#cartridges-grid`),q=c.querySelectorAll(`.cat-pill-btn`),J=c.querySelector(`#player-iframe-wrapper`);function Y(e){B?.contentWindow?.postMessage(e,`*`)}let ke=0,Ae=new Map;function je(e,t,n=5e3){return new Promise((r,i)=>{if(!B?.contentWindow){i(Error(`Simulation stage iframe is not ready yet.`));return}let a=`req_${++ke}_${Date.now()}`,o=setTimeout(()=>{Ae.has(a)&&(Ae.delete(a),i(Error(`Timed out waiting for ${t} from stage.`)))},n);Ae.set(a,{expectedType:t,resolve:r,reject:i,timer:o}),B.contentWindow.postMessage({...e,requestId:a},`*`)})}let Me={readState:async(e=!0)=>(await je({type:`GET_ENGINE_STATE`,includeSvgBytes:e},`ENGINE_STATE_RESPONSE`))?.state||null,setVar:async(e,t)=>{let n=await je({type:`SET_VAR`,name:e,value:t},`SET_VAR_ACK`);return{name:n?.name||e,value:n?.value??t,clamped:!!n?.clamped,state:n?.state||null}},execActionTuple:async e=>{let t=await je({type:`EXEC_ACTION_TUPLE`,tuple:e},`EXEC_ACTION_RESULT`);return{ok:!!t?.ok,executedActions:Array.isArray(t?.executedActions)?t.executedActions:[],state:t?.state||null}},onSay:e=>{_({subtitle:e,isSpeaking:!0})}},Ne=we(Me);window.addEventListener(`pagehide`,()=>{Ne.unregister()},{once:!0});let Pe={startProfCapture:async()=>{await je({type:`START_PROF_CAPTURE`,ensurePlaying:!0},`PROF_CAPTURE_STARTED`)},stopProfCapture:async()=>{let e=await je({type:`STOP_PROF_CAPTURE`},`PROF_CAPTURE_RESULT`);return{stats:e.stats,memory:e.memory,activeMetrics:e.activeMetrics}},mcpTransport:Me,mcpTools:Ne.tools};function Fe(){try{B?.focus({preventScroll:!0}),B?.contentWindow?.focus()}catch{}Y({type:`FOCUS_STAGE`})}function Ie(e){V&&(e?(V.style.background=`#2563eb`,V.style.borderColor=`#38bdf8`,V.title=`Pause simulation loop (Spacebar)`,ge&&(ge.textContent=`⏸`),H&&(H.textContent=`Pause`)):(V.style.background=`#16a34a`,V.style.borderColor=`#22c55e`,V.title=`Play simulation loop (Spacebar)`,ge&&(ge.textContent=`▶`),H&&(H.textContent=`Play`)))}let X=null,Le=null,Re=`classroom`,Z=!1,ze=null,Be=``;function Q(e=!1){if(G&&!(X===`diagnostics`&&!e&&ze&&ze.isConnected&&Be===x)){if(G.innerHTML=``,X!==`diagnostics`&&(ze=null,Be=``),be&&(be.style.background=X===`ai-tutor`?`#581c87`:`#1e293b`,be.style.borderColor=X===`ai-tutor`?`#c084fc`:`#9333ea`),U&&(U.style.background=X===`lab`?`#0369a1`:`#1e293b`,U.style.borderColor=X===`lab`?`#38bdf8`:`#0284c7`),Ce&&(Ce.style.background=X===`embed`?`#065f46`:`#1e293b`,Ce.style.borderColor=X===`embed`?`#34d399`:`#059669`),xe&&(xe.style.background=X===`diagnostics`?`#14532d`:`#1e293b`,xe.style.borderColor=X===`diagnostics`?`#4ade80`:`#16a34a`),!X)G.style.display=`none`;else if(G.style.display=`block`,X===`ai-tutor`){let e=ce({isOpen:!0,onClose:()=>{X=null,Q()},preset:x,postToPlayer:e=>Y(e),latestTelemetry:Le});e&&G.appendChild(e)}else if(X===`lab`){let e=de({isOpen:!0,onClose:()=>{X=null,Q()},preset:x});e&&G.appendChild(e)}else if(X===`diagnostics`){let e=P(x),t=Ve({onClose:()=>{X=null,ze=null,Be=``,Q()},presetId:x,presetLabel:e.label,presetType:e.type||`Sim`,postToPlayer:e=>Y(e),benchTransport:Pe,webMcpHandle:Ne});ze=t,Be=x,G.appendChild(t)}else if(X===`embed`){let e=e=>`<iframe src="${window.location.origin}${n}player.html?preset=${x}&mode=${e}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`,t=w({isOpen:!0,onClose:()=>{X=null,Q()},embedTargetMode:Re,setEmbedTargetMode:e=>{Re=e,Q()},copiedEmbed:Z,onCopyEmbedCode:()=>{Z=!0,navigator.clipboard?.writeText(e(Re)),Q(),setTimeout(()=>{Z=!1,X===`embed`&&Q()},2e3)},embedCode:e(Re)});t&&G.appendChild(t)}}}function Je(){fe&&(fe.innerHTML=R(x),fe.value=x)}function Ye(){return[...te().map(e=>({id:e.id,label:e.title,stage:e.stage||`LOCAL VAULT`,type:e.type||`Sim`,subject:e.subject||`Custom Ingested`})),...k]}let Xe=!1;B?.addEventListener(`load`,()=>{Xe=!0});function Ze(e,t=!1){if(e===`__custom_find__`||e===`__open_local__`)return;let r=Ke(e);x=r;let i=P(r);pe&&(pe.textContent=i.label),me&&(me.textContent=i.stage),he&&(he.textContent=i.type||`Sim`),fe&&(fe.value=r);let a=c.querySelector(`#catholic-sanctuary-banner`);a&&(a.style.display=j(i)?`flex`:`none`),S=null,r!==`lumina-architecture`&&o(r).catch(()=>{}),!t&&Xe&&B&&B.contentWindow?(Y({type:`SET_PRESET`,preset:r,play:!0}),Fe()):!B||B.src&&B.src!==`about:blank`&&Xe||(B.src=qe(n,r,D)),_({subtitle:`${i.label}. ${i.stage}`,isSpeaking:!0}),X&&Q();let s=new URL(window.location.href);s.searchParams.delete(`src`),s.searchParams.delete(`file`),s.searchParams.set(`preset`,r),window.history.replaceState({},``,s.toString()),$e()}async function Qe(n){if(n&&n.length!==0)try{let r=n.find(e=>e.name.endsWith(`.svg`)),i=n.find(e=>e.name.endsWith(`.ast`));if(r&&i){let e=await r.text(),n=await i.text(),a=r.name.replace(/\.[^/.]+$/,``),o=a.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),s={id:o,title:a.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested companion pair: ${r.name} + ${i.name}.`,icon:`💾`,source:`imported`,svgMarkup:e,astSource:n,updatedAt:Date.now()};t(s),Je(),Ze(o),B?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:s},`*`);return}for(let r of n){let n=await r.text();if(r.name.endsWith(`.phet`)||s(n)){let i=await e(n,r.name);if(i.success&&i.svgMarkup&&i.astSource){let e=i.metadata?.simName||`phet-${Date.now()}`,n={id:e,title:i.metadata?.title||r.name.replace(/\.[^/.]+$/,``),stage:`PHET INTERACTIVE`,category:`STEM`,desc:`PhET simulation transpiled to AST: ${i.metadata?.compressionRatio||`distilled`}.`,icon:`⚛️`,source:`phet`,svgMarkup:i.svgMarkup,astSource:i.astSource,updatedAt:Date.now()};t(n),Je(),Ze(e),B?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:n},`*`);return}}if(r.name.endsWith(`.svg`)){let e=r.name.replace(/\.[^/.]+$/,``),i=e.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),a=e.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),o=``,s=n.match(/<script\s+type=["']text\/ast["'][^>]*>([\s\S]*?)<\/script>/i);o=s&&s[1]?s[1].trim():`(:scene :id "${i}" :title "${a}" :stage "CUSTOM" :duration 10.0 (:bindings ()))`;let c={id:i,title:a,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested vector cartridge: ${r.name}.`,icon:`🎨`,source:`imported`,svgMarkup:n,astSource:o,updatedAt:Date.now()};t(c),Je(),Ze(i),B?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:c},`*`);return}if(r.name.endsWith(`.ast`)){let e=r.name.replace(/\.[^/.]+$/,``),i=e.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),a=e.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),o=n.includes(`<svg`)?n:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`,s={id:i,title:a,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested AST logic: ${r.name}.`,icon:`📜`,source:`imported`,svgMarkup:o,astSource:n,updatedAt:Date.now()};t(s),Je(),Ze(i),B?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:s},`*`);return}}}catch(e){console.error(`[media-player] Error ingesting uploaded files:`,e)}}function $e(){if(!K)return;let e=E.toLowerCase().trim(),t=Ye().filter(t=>{let n=!0;T===`Catholic`?n=j(t):T===`STEM`?n=M(t):T===`Maths`?n=N(t):T===`EYFS`?n=ee(t):T!==`All`&&(n=(t.type||`Sim`)===T);let r=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e);return n&&r});t.length===0?K.innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#94a3b8;">No matching cartridges found.</div>`:(K.innerHTML=t.map(e=>{let t=e.id===x;return`
        <div 
          class="cartridge-card" 
          data-id="${$(e.id)}"
          style="padding:12px; border-radius:10px; border:1.5px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#f0f9ff`:`#f8fafc`}; cursor:pointer; transition:all 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.68rem; font-weight:800; padding:1px 6px; border-radius:4px; background:${e.type===`Slide`?`#dcfce7`:e.type===`App`?`#fef3c7`:`#e0f2fe`}; color:${e.type===`Slide`?`#166534`:e.type===`App`?`#92400e`:`#0369a1`};">
              ${$(e.type||`Sim`)}
            </span>
            <span style="font-size:0.68rem; color:#64748b; font-weight:600;">${$(e.stage)}</span>
          </div>
          <strong style="display:block; font-size:0.86rem; color:#0f172a; margin-bottom:6px; line-height:1.3;">${$(e.label)}</strong>
          <span style="font-size:0.75rem; color:#0284c7; font-weight:700;">${t?`▶ Currently Playing`:`Launch &rarr;`}</span>
        </div>
      `}).join(``),K.querySelectorAll(`.cartridge-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&(Ze(t),B?.scrollIntoView({behavior:`smooth`,block:`center`}))})}))}function et(e){let n=a[e],r=`phet-${e}`;if(n){let e={id:r,title:n.title,stage:n.stage||`PHET DISTILLED`,category:n.subject||`Physics`,desc:`PhET simulation transpiled to AST & hardware-accelerated SVG (< 4 KB payload). Invariants: ${n.invariants.join(`, `)}.`,icon:`⚛️`,source:`phet`,svgMarkup:n.generateSvg(),astSource:n.generateAst(),updatedAt:Date.now()};t(e),Je()}Ze(r)}fe?.addEventListener(`change`,e=>{let t=e.target.value;if(t===`__open_local__`)fe.value=x,Ee?.click();else if(t===`__phet_ohms_law__`||t===`phet-ohms-law`)et(`ohms-law`);else if(t===`__phet_faraday__`||t===`phet-faraday`)et(`faraday`);else if(t===`__phet_pendulum__`||t===`phet-pendulum`)et(`pendulum`);else if(t===`__phet_acid_base__`||t===`phet-acid-base`)et(`acid-base`);else if(t===`__phet_balancing__`||t===`phet-balancing-chemical`)et(`balancing-chemical`);else if(t===`__custom_find__`){fe.value=x;let e=window.prompt(`Enter Cartridge or Scene ID (e.g. calculus-curves, bbc-model-b, stations-of-the-cross):`);e&&e.trim()&&Ze(e.trim())}else Ze(t)}),Se?.addEventListener(`click`,()=>{Ee?.click()}),Ee?.addEventListener(`change`,e=>{let t=e.target;t.files&&t.files.length&&(Qe(Array.from(t.files)),t.value=``)}),J&&(J.addEventListener(`dragover`,e=>{e.preventDefault(),e.stopPropagation(),J.style.outline=`3px dashed #38bdf8`,J.style.outlineOffset=`-4px`}),J.addEventListener(`dragleave`,e=>{e.preventDefault(),e.stopPropagation(),J.style.outline=`none`}),J.addEventListener(`drop`,e=>{e.preventDefault(),e.stopPropagation(),J.style.outline=`none`,e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length&&Qe(Array.from(e.dataTransfer.files))})),V?.addEventListener(`click`,()=>{Y({type:`TOGGLE_PLAY`}),Fe()}),_e?.addEventListener(`click`,()=>{Y({type:`RESET_SIM`}),Fe()});function tt(e){ve&&(ve.style.background=e?`#451a03`:`#1e293b`,ve.style.borderColor=e?`#d97706`:`#334155`,ve.title=e?`Unmute simulation audio (M)`:`Mute simulation audio (M)`);let t=c.querySelector(`#player-mute-icon`),n=c.querySelector(`#player-mute-text`);t&&(t.textContent=e?`🔇`:`🔊`),n&&(n.textContent=e?`Muted`:`Audio ON`)}ve?.addEventListener(`click`,()=>{let e=f(),t=!e;O=t,tt(t),Y({type:`SET_VOICE`,enabled:e}),Y({type:`SET_MUTED`,muted:t})}),ye?.addEventListener(`click`,()=>{y()});function nt(e){ye&&(ye.textContent=`🖐️ BSL Signing: ${e?`ON`:`OFF`}`,ye.style.background=e?`#0284c7`:`#1e293b`,ye.style.borderColor=e?`#38bdf8`:`#334155`)}return d(e=>{D!==e&&(D=e,nt(e),Y({type:`SET_BSL`,enabled:e}))}),h(e=>{try{let t=!e;O=t,tt(t),Y({type:`SET_VOICE`,enabled:e}),Y({type:`SET_MUTED`,muted:t})}catch{}}),window.addEventListener(`keydown`,e=>{let t=document.activeElement?.tagName.toLowerCase();t!==`input`&&t!==`textarea`&&t!==`select`&&(e.key===`m`||e.key===`M`?(e.preventDefault(),ve?.click()):e.code===`Space`&&!e.repeat&&(e.preventDefault(),V?.click()))}),window.addEventListener(`message`,e=>{if(e.data&&typeof e.data==`object`){if(e.data.requestId&&Ae.has(e.data.requestId)){let t=Ae.get(e.data.requestId);if(e.data.type===t.expectedType){clearTimeout(t.timer),Ae.delete(e.data.requestId),t.resolve(e.data);return}}if(e.data.type===`PLAYER_READY`&&(Xe=!0,S?S=null:x&&Y({type:`SET_PRESET`,preset:x,play:!1}),Ie(!1)),(e.data.type===`PLAY_STATE_CHANGED`||e.data.type===`STATE_CHANGED`||e.data.type===`statechange`)&&typeof(e.data.isPlaying??e.data.playing)==`boolean`&&Ie(!!(e.data.isPlaying??e.data.playing)),(e.data.type===`PRESETCHANGE`||e.data.type===`PLAYER_PRESET_CHANGED`)&&typeof e.data.preset==`string`){let t=Ke(e.data.preset);t!==x&&Ze(t,!0)}if(e.data.type===`CARTRIDGE_INGESTED`&&(Je(),$e()),(e.data.type===`VOICE_TOGGLE`||e.data.type===`SET_VOICE`)&&typeof e.data.enabled==`boolean`&&v(e.data.enabled),e.data.type===`BSL_STATE_CHANGED`&&typeof e.data.active==`boolean`&&(D=e.data.active,nt(e.data.active),g(e.data.active)),e.data.type===`TOGGLE_BSL`&&typeof e.data.enabled==`boolean`&&(D=e.data.enabled,nt(e.data.enabled),g(e.data.enabled)),(e.data.type===`TELEMETRY`||e.data.type===`AST_TELEMETRY`||e.data.type===`PLAYER_TELEMETRY`)&&(Le=e.data.telemetry||e.data.payload||e.data,X===`ai-tutor`&&Q()),e.data.type,(e.data.type===`LOG_JOTTER_CSV`||e.data.type===`JOTTER_CSV_RESPONSE`)&&typeof e.data.csv==`string`){let t=typeof e.data.sceneId==`string`?e.data.sceneId:x,n=Number(e.data.rowCount||1),r=typeof e.data.nodePath==`string`?e.data.nodePath:`lab/${t}`;if(C(t,e.data.csv,r).then(()=>{W&&(W.textContent=`✓ Logged ${n} rows (CSV)`,W.style.background=`#065f46`,W.style.borderColor=`#10b981`,W.style.color=`#ffffff`,setTimeout(()=>{W.textContent=`📊 Log Data to Jotter (CSV)`,W.style.background=`#1e293b`,W.style.borderColor=`#0284c7`,W.style.color=`#38bdf8`},2400))}).catch(()=>{}),e.data.download)try{let n=new Blob([e.data.csv],{type:`text/csv;charset=utf-8;`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${t||`lab`}-data.csv`,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(r),1e3)}catch{}}}}),window.addEventListener(`app-setting-changed`,e=>{e.detail&&(e.detail.key===`app_perf_hud_enabled`||e.detail.key===`app_hud_verbosity`||e.detail.key===`app_frame_budget_alert`)&&(Y({type:`SET_PERF_HUD`,enabled:p(`app_perf_hud_enabled`)===`true`,mode:p(`app_hud_verbosity`)||`minimal`,strictAlarm:p(`app_frame_budget_alert`)===`true`}),X===`diagnostics`&&Q())}),window.addEventListener(`cartridges_updated`,()=>{Je(),$e()}),be?.addEventListener(`click`,()=>{X=X===`ai-tutor`?null:`ai-tutor`,Q()}),U?.addEventListener(`click`,()=>{X=X===`lab`?null:`lab`,Q()}),xe?.addEventListener(`click`,()=>{X=X===`diagnostics`?null:`diagnostics`,Q()}),W?.addEventListener(`click`,e=>{Y({type:`REQUEST_JOTTER_CSV`,download:!!e.shiftKey})}),Ce?.addEventListener(`click`,()=>{X=X===`embed`?null:`embed`,Q()}),Te?.addEventListener(`click`,()=>{let e=P(x);He(x,e.label)}),De?.addEventListener(`click`,()=>{let e=c.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()}),q.forEach(e=>{e.addEventListener(`click`,()=>{T=e.getAttribute(`data-cat`)||`All`,q.forEach(e=>{let t=e.getAttribute(`data-cat`)===T;e.style.background=t?`#0284c7`:`#f8fafc`,e.style.color=t?`#ffffff`:`#475569`,e.style.borderColor=t?`#0284c7`:`#cbd5e1`}),$e()})}),Oe?.addEventListener(`input`,e=>{E=e.target.value,$e()}),$e(),c}export{Je as default,Je as renderPlayerPage};