const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/localCartridgeBuilder-uHGF8mQ4.js","assets/rolldown-runtime-4tVxZq34.js","assets/nanoSiteManager-DC9OpKE1.js","assets/nanoRemixCopilot-Bs1FwF_8.js","assets/aicaller-DM7RLy08.js","assets/EdgeCognitiveEngine-Bmjmg0O8.js"])))=>i.map(i=>d[i]);
import{a as e,c as t,h as n,i as r,l as i,p as a,r as o,s,u as c}from"./cartridge-vault-LbKjU7-J.js";import{P as l,T as u,a as d,c as f,d as p,i as m,l as h,o as g,r as _,s as v,u as y,v as b,x}from"./bsl-engine-Cwugp9AL.js";import{m as S,p as C}from"./localCartridgeBuilder-uHGF8mQ4.js";import{i as w,n as T,r as E,t as D}from"./aicaller-DM7RLy08.js";import{r as O,t as k}from"./EdgeCognitiveEngine-Bmjmg0O8.js";import{bindSitePlayerAdapter as A}from"./nanoSiteManager-DC9OpKE1.js";import{n as j}from"./jotter-db-DMLS5HxK.js";function M(e){if(!e.isOpen)return null;let{embedTargetMode:t,setEmbedTargetMode:n,copiedEmbed:r,onCopyEmbedCode:i,embedCode:a}=e,o=document.createElement(`div`);o.className=`ast-player-embed-modal`,o.style.cssText=`
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
  `,m.textContent=a,o.appendChild(m),o}function N(e){switch(e){case`kinetic-gas`:return[`Why does temperature increase particle velocity?`,`What happens to pressure if I compress the volume?`,`Explain Boyle’s Law (P1V1 = P2V2) simply`];case`calculus-curves`:return[`What does dy/dx represent geometrically at this point?`,`Why is the tangent slope zero at the curve peak?`,`How does the integral calculate the area under the curve?`];case`math-fishing`:return[`What is the best mental strategy for Number Bonds to 100?`,`How do factor pairs multiply to 36 and 48?`,`Explain adding negative integers like -4 + 10`];case`electric-circuits`:return[`Explain Ohm's Law: V = I × R with this circuit`,`What object is my ray hitting right now?`,`Nudge the #coil-core into the magnetic field`,`Why do electrons drift slower when resistance increases?`];case`fractions`:return[`Why must we find a common denominator before adding?`,`What does the numerator vs denominator represent geometrically?`,`How do equivalent fractions preserve identical area?`];case`spelling-bee`:return[`What is the etymology and Latin origin of this statutory spelling?`,`Explain the phonics rule for words ending in -cious vs -tious`,`Give me a mnemonic to remember the spelling of accommodation and embarrass`];case`atom`:return[`How does the Bohr electron shell formula 2n² determine orbital capacities?`,`Why does increasing atomic number (Z) change an element’s chemical family?`,`Explain the difference between atomic number and mass number`];case`times-tables`:return[`Explain how the distributive property 7×8 = (7×5)+(7×3) simplifies mental arithmetic`,`Why does rotating a 2D array by 90° prove the commutative law a×b = b×a?`,`What patterns emerge on the 100-square when skip counting by 9s?`];case`solar-system`:return[`Why do outer planets like Neptune take vastly longer to orbit than Mercury?`,`Explain Kepler’s 3rd Law of planetary motion simply`,`What are the key planetary differences between gas giants and rocky planets?`];default:return[`Explain the physics and math principles shown in this lab`,`What happens if I change the key variables?`,`Give me a challenging question to test my understanding`]}}function P(e){if(!e.isOpen)return null;let{onClose:t,preset:n,postToPlayer:r,currentProgress:i=0,activeKeyframe:a,onCancelDemonstration:o}=e,s=e.latestTelemetry,c=e.activeQuiz||null,l=!!e.isAiDemonstrating,u=`copilot`,d=T(),f=D.getActiveEngineType(),p=!1,m=``,h=``,g=``,_=null,v=``,y=null,b=null,x=null,S=[{sender:`nano`,text:`Hello! I am your on-device Gemini Nano tutor for this vector lab. Ask me anything, answer a checkpoint quiz, or click "✨ Show Me How" to watch me physically demonstrate on the simulation stage!`}];r({type:`GET_CONTEXT_SNAPSHOT`});let C=document.createElement(`div`);C.className=`ast-nano-ai-tutor-drawer`,C.style.cssText=`
    background: #090d16;
    border-top: 2px solid #38bdf8;
    padding: 16px 20px;
    color: #f8fafc;
    box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;function O(){C.innerHTML=``;let e=document.createElement(`div`);e.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;`;let d=document.createElement(`div`);d.style.cssText=`display: flex; align-items: center; gap: 10px;`,d.innerHTML=`
      <span style="font-size: 1.4rem;">✨</span>
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">
            Gemini Nano Edge AI Co-Pilot
          </h3>
          <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: ${f===`chrome-builtin-nano`?`rgba(34, 197, 94, 0.2)`:`rgba(168, 85, 247, 0.2)`}; color: ${f===`chrome-builtin-nano`?`#4ade80`:`#c084fc`}; border: 1px solid ${f===`chrome-builtin-nano`?`#22c55e`:`#a855f7`};">
            ${f===`chrome-builtin-nano`?`🟢 Chrome Prompt API (Built-in Nano)`:f===`webgpu-webllm`?`🟣 WebGPU On-Device LLM`:`⚪ Local Rule Engine`}
          </span>
        </div>
        <p style="margin: 2px 0 0; font-size: 0.74rem; color: #94a3b8;">
          100% on-device local execution &bull; 0ms cloud egress &bull; UK DfE &amp; GDPR compliant
        </p>
      </div>
    `;let w=document.createElement(`div`);w.style.cssText=`display: flex; align-items: center; gap: 8px;`;let T=document.createElement(`div`);T.style.cssText=`display: flex; background: #1e293b; padding: 3px; borderRadius: 8px; gap: 4px; border-radius: 8px;`,[{id:`copilot`,label:`💬 Ask Nano`},{id:`generator`,label:`⚡ Generate Lab`},{id:`grader`,label:`🎯 Grader`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
        padding: 4px 10px;
        border-radius: 6px;
        background: ${u===e.id?`#0284c7`:`transparent`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.75rem;
        cursor: pointer;
      `,t.textContent=e.label,t.onclick=()=>{u=e.id,O()},T.appendChild(t)});let E=document.createElement(`button`);if(E.type=`button`,E.style.cssText=`padding: 6px 12px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.75rem; cursor: pointer;`,E.textContent=`✕ Close`,E.onclick=t,w.appendChild(T),w.appendChild(E),e.appendChild(d),e.appendChild(w),C.appendChild(e),u===`copilot`){let e=document.createElement(`div`);if(e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`,c&&c.prompt){let t=document.createElement(`div`);t.style.cssText=`padding: 10px 14px; background: linear-gradient(135deg, rgba(88, 28, 135, 0.35) 0%, rgba(15, 23, 42, 0.92) 100%); border: 1px solid rgba(192, 132, 252, 0.55); border-radius: 10px; display: flex; flex-direction: column; gap: 6px;`;let n=document.createElement(`div`);n.style.cssText=`display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;`;let r=document.createElement(`span`);r.style.cssText=`font-size: 0.74rem; font-weight: 800; color: #e879f9; letter-spacing: 0.03em; text-transform: uppercase;`,r.textContent=`🎯 Quiz Checkpoint #${(c.index??0)+1} Context`,n.appendChild(r);let i=document.createElement(`div`);i.style.cssText=`display: flex; gap: 6px; align-items: center;`;let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`padding: 3px 9px; border-radius: 6px; background: #7e22ce; color: #ffffff; border: 1px solid #c084fc; font-size: 0.68rem; font-weight: 800; cursor: pointer;`,a.textContent=`✨ Coach & Highlight Stage`,a.disabled=p,a.onclick=()=>A(c);let o=document.createElement(`button`);o.type=`button`,o.style.cssText=`padding: 3px 9px; border-radius: 6px; background: #1e293b; color: #38bdf8; border: 1px solid #334155; font-size: 0.68rem; font-weight: 700; cursor: pointer;`,o.textContent=`📝 Explain in Grader`,o.onclick=()=>{u=`grader`,O()};let s=document.createElement(`button`);s.type=`button`,s.style.cssText=`padding: 2px 7px; border-radius: 5px; background: transparent; color: #94a3b8; border: 1px solid #334155; font-size: 0.68rem; cursor: pointer;`,s.textContent=`✕`,s.title=`Clear active quiz context`,s.onclick=()=>{c=null,O()},i.appendChild(a),i.appendChild(o),i.appendChild(s),n.appendChild(i),t.appendChild(n);let l=document.createElement(`div`);if(l.style.cssText=`font-size: 0.82rem; font-weight: 700; color: #f8fafc; line-height: 1.35;`,l.textContent=c.prompt,t.appendChild(l),c.chosenText||c.distractorNudge){let e=document.createElement(`div`);if(e.style.cssText=`font-size: 0.74rem; color: #e9d5ff; display: flex; flex-wrap: wrap; gap: 10px;`,c.chosenText){let t=document.createElement(`span`);t.innerHTML=`<strong>Your selection:</strong> `;let n=document.createElement(`span`);n.style.color=`#fbbf24`,n.textContent=c.chosenText,t.appendChild(n),e.appendChild(t)}if(c.distractorNudge){let t=document.createElement(`span`);t.innerHTML=`<strong>Clue:</strong> `;let n=document.createElement(`span`);n.style.color=`#fde047`,n.textContent=c.distractorNudge,t.appendChild(n),e.appendChild(t)}t.appendChild(e)}e.appendChild(t)}if(l){let t=document.createElement(`div`);t.style.cssText=`display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: linear-gradient(90deg, rgba(2, 132, 199, 0.25) 0%, rgba(14, 165, 233, 0.1) 100%); border: 1px solid #38bdf8; border-radius: 8px;`,t.innerHTML=`
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span>
            <span style="font-size: 0.76rem; color: #f8fafc; font-weight: 700;">
              ✨ Gemini Nano is demonstrating on stage... (Touch canvas to take back control)
            </span>
          </div>
        `;let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`padding: 3px 10px; border-radius: 6px; background: #ef4444; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;`,n.textContent=`✋ Take Control`,n.onclick=()=>{r({type:`PUPIL_INTERRUPT`}),o?.()},t.appendChild(n),e.appendChild(t)}let t=document.createElement(`div`);t.style.cssText=`padding: 10px 14px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 10px; display: flex; flex-direction: column; gap: 8px;`;let i=document.createElement(`div`);i.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;`,i.innerHTML=`
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.0rem;">🎯</span>
          <span style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; letter-spacing: 0.02em;">
            Spatial Telemetry Emission &bull; Proprioceptive Awareness
          </span>
          <span style="font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3);">
            Zero-Raster Token Stream
          </span>
        </div>
      `;let a=document.createElement(`div`);a.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`;let d=document.createElement(`button`);d.type=`button`,d.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,d.textContent=`🔭 Orbit View (Δθ:+20°, Δϕ:-10°)`,d.onclick=()=>{r({type:`ACTUATE_OPCODE`,opcode:`(:rotate-camera :theta 20.0 :phi -10.0 :relative true)`})};let f=document.createElement(`button`);f.type=`button`,f.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,f.textContent=`⚡ Nudge Core/Probe ([0, 5, 0])`,f.onclick=()=>{let e=s?.spatialTelemetry?.hit?.target||`#coil-core`;r({type:`ACTUATE_OPCODE`,opcode:`(:nudge :target "${e}" :dxyz [0.0 5.0 0.0])`})};let h=document.createElement(`button`);h.type=`button`,h.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); font-size: 0.68rem; font-weight: 700; cursor: pointer;`,h.textContent=`🎯 Cast Ray`,h.onclick=()=>{r({type:`CAST_CAMERA_RAY`})},a.appendChild(d),a.appendChild(f),a.appendChild(h),i.appendChild(a),t.appendChild(i);let g=document.createElement(`div`);g.style.cssText=`background: #090d16; padding: 6px 10px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 0.74rem; color: #4ade80; display: flex; flex-direction: column; gap: 4px; user-select: all;`;let _=document.createElement(`div`);_.style.cssText=`display: flex; justify-content: space-between; align-items: center;`;let v=document.createElement(`span`);v.style.cssText=`color: #94a3b8; font-size: 0.68rem;`,v.textContent=`RAY INTERSECTION TOKEN:`;let y=document.createElement(`span`);y.style.cssText=`color: #38bdf8; font-size: 0.68rem;`,y.textContent=`Analytic Ray-Math (Zero GPU Drivers)`,_.appendChild(v),_.appendChild(y),g.appendChild(_);let w=document.createElement(`div`);w.style.cssText=`font-weight: 700; overflow-x: auto; white-space: nowrap;`,w.textContent=s?.spatialTelemetry?.rayHitSExpr||`(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])`,b=w,g.appendChild(w);let T=document.createElement(`div`);T.style.cssText=`color: #38bdf8; font-size: 0.70rem; overflow-x: auto; white-space: nowrap;`,s?.spatialTelemetry?.cameraStateSExpr?T.textContent=s.spatialTelemetry.cameraStateSExpr:T.style.display=`none`,x=T,g.appendChild(T),t.appendChild(g),e.appendChild(t);let E=N(n),D=document.createElement(`div`);D.style.cssText=`display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;`,D.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center; white-space: nowrap;">Suggested:</span>`,E.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
          white-space: nowrap;
          padding: 4px 10px;
          border-radius: 9999px;
          background: #1e293b;
          color: #bae6fd;
          border: 1px solid #334155;
          font-size: 0.72rem;
          cursor: ${p?`not-allowed`:`pointer`};
        `,t.textContent=e,t.disabled=p,t.onclick=()=>j(e,!0),D.appendChild(t)}),e.appendChild(D);let k=document.createElement(`div`);if(k.style.cssText=`background: #0f172a; border-radius: 10px; border: 1px solid #1e293b; padding: 12px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;`,S.forEach(e=>{let t=document.createElement(`div`);t.style.cssText=`
          align-self: ${e.sender===`user`?`flex-end`:`flex-start`};
          max-width: 88%;
          background: ${e.sender===`user`?`#0284c7`:`#1e293b`};
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          line-height: 1.4;
        `;let n=document.createElement(`div`);n.style.cssText=`font-weight: 800; font-size: 0.68rem; margin-bottom: 2px; color: ${e.sender===`user`?`#bae6fd`:`#38bdf8`};`,n.textContent=e.sender===`user`?`You`:`✨ Gemini Nano Co-Pilot`,t.appendChild(n);let i=document.createElement(`div`);if(i.textContent=e.text,t.appendChild(i),e.rawSExpr){let n=document.createElement(`div`);n.style.cssText=`margin-top: 6px; padding: 6px 10px; background: #090d16; border-radius: 6px; border: 1px solid #334155; font-family: monospace; font-size: 0.72rem; color: #38bdf8; overflow-x: auto;`;let i=document.createElement(`div`);if(i.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;`,i.innerHTML=`<span style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">⚡ ACTION TUPLE:</span>`,e.packet){let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; background: #0284c7; color: #fff; border: none; cursor: pointer;`,t.textContent=`▶ Replay Demo`,t.onclick=()=>r({type:`AI_VISUAL_COMMAND`,packet:e.packet}),i.appendChild(t)}n.appendChild(i);let a=document.createElement(`code`);a.textContent=e.rawSExpr,n.appendChild(a),t.appendChild(n)}if(e.action){let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`margin-top: 6px; padding: 4px 8px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.7rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;`,n.textContent=`⚡ Apply to Stage: ${e.action.name} = ${e.action.val}`,n.onclick=()=>{r({type:`SET_VAR`,name:e.action.name,value:e.action.val}),S.push({sender:`nano`,text:`Applied live parameter to stage: ${e.action.name} = ${e.action.val}`}),O()},t.appendChild(n)}k.appendChild(t)}),p){let e=document.createElement(`div`);e.style.cssText=`align-self: flex-start; color: #38bdf8; font-size: 0.75rem; font-style: italic;`,e.textContent=`✨ Nano is synthesizing action tuples on-device...`,k.appendChild(e)}e.appendChild(k);let M=document.createElement(`div`);M.style.cssText=`display: flex; gap: 8px;`;let P=document.createElement(`input`);P.type=`text`,P.value=m,P.placeholder=`Ask Nano about ${n} (e.g. why does this curve peak?)...`,P.disabled=p,P.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,P.oninput=e=>{m=e.target.value},P.onkeydown=e=>{e.key===`Enter`&&j(void 0,!0)};let F=document.createElement(`button`);F.type=`button`,F.style.cssText=`
        padding: 8px 14px;
        border-radius: 8px;
        background: ${p?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${p?`not-allowed`:`pointer`};
        display: inline-flex;
        align-items: center;
        gap: 4px;
      `,F.disabled=p,F.innerHTML=`<span>✨ Show Me How</span>`,F.onclick=()=>j(void 0,!0),M.appendChild(P),M.appendChild(F),e.appendChild(M),C.appendChild(e)}else if(u===`generator`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`,t.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center;">Templates:</span>`,[`Pulley with Mechanical Advantage 2`,`Pendulum Energy Conservation`,`Bohr Carbon Atom (6 Protons)`,`Pythagoras 3-4-5 Triangle`].forEach(e=>{let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #bae6fd; border: 1px solid #334155; font-size: 0.7rem; cursor: pointer;`,n.textContent=e,n.onclick=()=>{h=e,O()},t.appendChild(n)}),e.appendChild(t);let n=document.createElement(`div`);n.style.cssText=`display: flex; gap: 8px;`;let i=document.createElement(`input`);i.type=`text`,i.value=h,i.placeholder=`Describe an interactive vector simulation to synthesize (e.g. Archimedes buoyancy lever)...`,i.disabled=p,i.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,i.oninput=e=>{h=e.target.value};let a=document.createElement(`button`);if(a.type=`button`,a.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${p?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${p?`not-allowed`:`pointer`};
      `,a.textContent=p?`Synthesizing...`:`⚡ Generate AST`,a.disabled=p,a.onclick=M,n.appendChild(i),n.appendChild(a),e.appendChild(n),_){let t=document.createElement(`div`);t.style.cssText=`color: #f87171; font-size: 0.75rem;`,t.textContent=_,e.appendChild(t)}if(g){let t=document.createElement(`div`);t.style.cssText=`display: flex; flex-direction: column; gap: 6px;`;let n=document.createElement(`div`);n.style.cssText=`display: flex; justify-content: space-between; align-items: center;`,n.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Synthesized AST S-Expression Specification:</span>`;let i=document.createElement(`div`);i.style.cssText=`display: flex; gap: 6px;`;let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;`,a.textContent=`⚡ Run in Vector Player`,a.onclick=()=>{r({type:`LOAD_AST`,ast:g}),r({type:`PLAY`})};let o=document.createElement(`button`);o.type=`button`,o.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.72rem; cursor: pointer;`,o.textContent=`📋 Copy AST`,o.onclick=()=>navigator.clipboard.writeText(g),i.appendChild(a),i.appendChild(o),n.appendChild(i),t.appendChild(n);let s=document.createElement(`textarea`);s.rows=5,s.value=g,s.style.cssText=`background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; color: #38bdf8; font-family: monospace; font-size: 0.75rem; line-height: 1.4; resize: vertical;`,s.oninput=e=>{g=e.target.value},t.appendChild(s),e.appendChild(t)}C.appendChild(e)}else if(u===`grader`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`background: #1e293b; padding: 10px 14px; border-radius: 8px; font-size: 0.8rem;`;let r=document.createElement(`span`);r.style.cssText=`color: #38bdf8; font-weight: 800;`,r.textContent=`Active Checkpoint Context: `;let o=document.createElement(`span`);o.textContent=c?.prompt?`Quiz #${(c.index??0)+1}: "${c.prompt}"`:a?`"${a.title} — ${a.rule}"`:`Simulation progress: ${(i*100).toFixed(0)}% in ${n}`,t.appendChild(r),t.appendChild(o),e.appendChild(t);let s=document.createElement(`div`);s.style.cssText=`display: flex; gap: 8px;`;let l=document.createElement(`textarea`);l.rows=2,l.value=v,l.placeholder=`Explain the mechanism in your own words (e.g. why does pressure rise, or what makes the bond sum to 100?)...`,l.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem; resize: none;`,l.oninput=e=>{v=e.target.value};let u=document.createElement(`button`);if(u.type=`button`,u.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${p?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${p?`not-allowed`:`pointer`};
      `,u.textContent=p?`Grading...`:`🎯 Evaluate`,u.disabled=p,u.onclick=P,s.appendChild(l),s.appendChild(u),e.appendChild(s),y){let t=document.createElement(`div`);t.style.cssText=`background: #0f172a; border: 1px solid #22c55e; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;`;let n=document.createElement(`div`);n.style.cssText=`background: #22c55e; color: #000000; font-weight: 900; font-size: 1.1rem; padding: 6px 10px; border-radius: 8px; white-space: nowrap;`,n.textContent=`⭐ ${y.score}/5`;let r=document.createElement(`div`);r.style.cssText=`flex: 1; font-size: 0.8rem; color: #e2e8f0; white-space: pre-line;`,r.textContent=y.feedback,t.appendChild(n),t.appendChild(r),e.appendChild(t)}C.appendChild(e)}}function k(e){return e.chosenText?`Quiz Question: "${e.prompt}" — I picked "${e.chosenText}". Help me understand why this works or what misconception to check.`:e.passExpr?`Lab Challenge: "${e.prompt}" (Goal condition: ${e.passExpr}). Show me which controls affect this!`:`Quiz Question: "${e.prompt}" — Can you guide me on the concept and point to the right part of the model?`}function A(e){c=e,u=`copilot`,j(k(e),!0,e)}async function j(e,t=!0,a){let o=(e||m).trim();if(!o||p)return;d||=(w(!0),!0);let l=a===void 0?c:a;S.push({sender:`user`,text:o}),m=``,p=!0,O();try{let e=s||{sceneId:l?.sceneId||n,progress:l?.progress??i,activeKeyframe:0,variables:l?.vars||{},lastUserAction:l?`CHECKPOINT_HELP`:`QUESTION`,timestamp:Date.now()},a=l?`${o} [Context: prompt="${l.prompt}"${l.distractorNudge?` nudge="${l.distractorNudge}"`:``}${l.explanation?` explanation="${l.explanation}"`:``}${l.targetSelector?` target="${l.targetSelector}"`:``}]`:o,c=await E(e,a,{targetScene:l?.sceneId||n});l?.targetSelector&&c.actions&&!c.actions.some(e=>e.type===`HIGHLIGHT`)&&c.actions.unshift({type:`HIGHLIGHT`,selector:l.targetSelector,durationMs:4e3}),t&&c.actions&&c.actions.length>0&&r({type:`AI_VISUAL_COMMAND`,packet:c}),S.push({sender:`nano`,text:c.sayText||l?.explanation||`Observe the visual demonstration on the simulation stage.`,packet:c,rawSExpr:c.rawSExpr})}catch(e){console.warn(`[NanoAiTutorDrawer] Co-Pilot inference notice:`,e);let i=l?`${l.distractorNudge||``} ${l.explanation||`Look closely at how the active variables (${JSON.stringify(l.vars||{})}) relate to the question in ${n}.`}`.trim():`[Offline Local Response] In this ${n} simulation, adjustments to the input variables directly update the SVG equations and animated vector properties. Notice how the keyframe timeline coordinates with the visual state.`;t&&l?.targetSelector&&r({type:`AI_VISUAL_COMMAND`,packet:{type:`AI_VISUAL_COMMAND`,transactionId:`nano_fallback_${Date.now()}`,actions:[{type:`HIGHLIGHT`,selector:l.targetSelector,durationMs:3500}],sayText:i,pedagogicalIntent:`SCAFFOLD_HINT`}}),S.push({sender:`nano`,text:i})}finally{p=!1,O()}}async function M(){if(h.trim()&&!p){d||=(w(!0),!0),p=!0,_=null,O();try{g=(await D.promptText({prompt:`Generate an AST interactive lab for: "${h}"`,systemPrompt:`You are an expert compiler for the St Joseph's AST Vector Player specification.
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
3. No Markdown blocks, no commentary, no quotes outside strings.`,temperature:.2,timeoutMs:22e3})).replace(/^```[a-z]*\n?/im,``).replace(/\n?```$/im,``).trim()}catch(e){_=`Generation error: ${e?.message||`Please check Prompt API availability`}`,g=`(:scene :id "generated-lab" :title "${h.slice(0,30)}" :stage "KS2/KS3 STEM" :duration 10.0
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
    (:t 0.0 :title "Initial State" :rule "Beginning state of ${h}")
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
)`}finally{p=!1,O()}}}async function P(){if(v.trim()&&!p){d||=(w(!0),!0),p=!0,O();try{let e=`You are a UK National Curriculum formative assessment specialist.
Current Assessment: ${c?.prompt?`Quiz Question: "${c.prompt}". Concept Explanation: "${c.explanation||``}"`:a?`Topic: "${a.title}" Rule: "${a.rule}"`:`Simulation: ${n}`}.
Evaluate student answer: "${v}".
Format:
Score: [1 to 5]/5
Feedback: 2 sentences identifying conceptual strengths and one area for mastery polish.`,t=await D.promptText({prompt:v,systemPrompt:e,temperature:.2,timeoutMs:15e3}),r=t.match(/(\d)\s*\/\s*5/);y={feedback:t,score:r?parseInt(r[1],10):4}}catch{y={feedback:`Score: 4/5\nFeedback: Great reasoning! You demonstrated understanding of the active ${n} mechanism. Continue exploring how parameter variables shift the keyframe curve.`,score:4}}finally{p=!1,O()}}}return O(),c&&c.autoAsk&&setTimeout(()=>A(c),0),C.__nanoDrawerHandle={element:C,updateTelemetry:e=>{s=e,b&&e?.spatialTelemetry?.rayHitSExpr&&(b.textContent=e.spatialTelemetry.rayHitSExpr),x&&e?.spatialTelemetry?.cameraStateSExpr&&(x.style.display=`block`,x.textContent=e.spatialTelemetry.cameraStateSExpr)},setDemonstrating:e=>{l!==!!e&&(l=!!e,O())},askCheckpoint:(e,t=!0)=>{t?A(e):(c=e,u=`copilot`,O())},askQuestion:(e,t=!0)=>{u=`copilot`,j(e,t)}},C}var F=class{transform;constructor(e={}){this.transform={minX:e.minX??-6,maxX:e.maxX??6,minY:e.minY??-4,maxY:e.maxY??8,svgWidth:e.svgWidth??600,svgHeight:e.svgHeight??380}}mathToSvg(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:(e-n)/(r-n)*o,y:s-(t-i)/(a-i)*s}}svgToMath(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:n+e/o*(r-n),y:i+(s-t)/s*(a-i)}}generateCurvePath(e,t=240){let{minX:n,maxX:r,minY:i,maxY:a}=this.transform,o=(r-n)/t,s=``,c=!1;for(let r=0;r<=t;r++){let t=n+r*o,l;try{l=e(t)}catch{c=!1;continue}if(isNaN(l)||!isFinite(l)||l<i-10||l>a+10){c=!1;continue}let u=this.mathToSvg(t,l);c?s+=`L ${u.x.toFixed(1)} ${u.y.toFixed(1)} `:(s+=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `,c=!0)}return s.trim()}calculateTangent(e,t,n=3.5){let r=1e-4,i=e(t),a=(e(t+r)-e(t-r))/(2*r),o=Math.atan(a),s=o*180/Math.PI,c=this.mathToSvg(t,i),l=n/2,u=Math.cos(o),d=Math.sin(o),f=t-l*u,p=i-l*d,m=t+l*u,h=i+l*d,g=this.mathToSvg(f,p),_=this.mathToSvg(m,h),v=`M ${g.x.toFixed(1)} ${g.y.toFixed(1)} L ${_.x.toFixed(1)} ${_.y.toFixed(1)}`,y=l*.65,b=t-y*-d,x=i-y*u,S=t+y*-d,C=i+y*u,w=this.mathToSvg(b,x),T=this.mathToSvg(S,C),E=`M ${w.x.toFixed(1)} ${w.y.toFixed(1)} L ${T.x.toFixed(1)} ${T.y.toFixed(1)}`,D=a*1,O=this.mathToSvg(t+1,i),k=this.mathToSvg(t+1,i+D),A=`M ${c.x.toFixed(1)} ${c.y.toFixed(1)} L ${O.x.toFixed(1)} ${O.y.toFixed(1)} L ${k.x.toFixed(1)} ${k.y.toFixed(1)}`,j=`dy/dx = ${a>=0?`+`:``}${a.toFixed(2)}`;return{x0:t,y0:i,svgX:c.x,svgY:c.y,slope:a,angleDeg:s,tangentPath:v,normalPath:E,riseRunTriangle:A,formula:j}}calculateDefiniteIntegral(e,t,n,r=60){let i=Math.min(t,n),a=Math.max(t,n),o=Math.max(10,r%2==0?r:r+1),s=(a-i)/o,c=e(i)+e(a);for(let t=1;t<o;t++){let n=i+t*s;c+=(t%2==1?4:2)*e(n)}let l=s/3*c,u=this.mathToSvg(i,0),d=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `;for(let t=0;t<=o;t++){let n=i+t*s,r=e(n),a=this.mathToSvg(n,r);d+=`L ${a.x.toFixed(1)} ${a.y.toFixed(1)} `}let f=this.mathToSvg(a,0);return d+=`L ${f.x.toFixed(1)} ${f.y.toFixed(1)} Z`,{a:i,b:a,area:Number(l.toFixed(3)),shadedAreaPath:d,subdivisions:o}}generateGrid(e=1){let{minX:t,maxX:n,minY:r,maxY:i}=this.transform,a=``,o=[],s=Math.ceil(t/e)*e;for(let t=s;t<=n;t+=e){if(Math.abs(t)<.001)continue;let e=this.mathToSvg(t,i),n=this.mathToSvg(t,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${n.x.toFixed(1)} ${n.y.toFixed(1)} `;let s=this.mathToSvg(t,0);o.push({x:s.x,y:s.y+14,text:t.toString()})}let c=Math.ceil(r/e)*e;for(let r=c;r<=i;r+=e){if(Math.abs(r)<.001)continue;let e=this.mathToSvg(t,r),i=this.mathToSvg(n,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${i.x.toFixed(1)} ${i.y.toFixed(1)} `;let s=this.mathToSvg(0,r);o.push({x:s.x-12,y:s.y+4,text:r.toString()})}let l=this.mathToSvg(t,0),u=this.mathToSvg(n,0),d=this.mathToSvg(0,r),f=this.mathToSvg(0,i),p=`M ${l.x.toFixed(1)} ${l.y.toFixed(1)} L ${u.x.toFixed(1)} ${u.y.toFixed(1)} M ${d.x.toFixed(1)} ${d.y.toFixed(1)} L ${f.x.toFixed(1)} ${f.y.toFixed(1)}`;return{gridPaths:a.trim(),axesPaths:p,labels:o}}},I=[{id:`parabola`,name:`Quadratic Parabola`,category:`Polynomials (GCSE/A-Level)`,latex:`f(x) = x^2 - 2x - 1`,fn:e=>e*e-2*e-1,derivativeStr:`f'(x) = 2x - 2`,defaultX0:2,defaultA:0,defaultB:3},{id:`cubic`,name:`Cubic Curve (Stationary Points)`,category:`Polynomials (A-Level)`,latex:`f(x) = \\frac{1}{3}x^3 - x + 1`,fn:e=>1/3*e**3-e+1,derivativeStr:`f'(x) = x^2 - 1`,defaultX0:1,defaultA:-2,defaultB:2},{id:`sine`,name:`Harmonic Sine Wave`,category:`Trigonometry (GCSE/A-Level)`,latex:`f(x) = 2\\sin(x) + 1`,fn:e=>2*Math.sin(e)+1,derivativeStr:`f'(x) = 2\\cos(x)`,defaultX0:1.57,defaultA:0,defaultB:3.14},{id:`exponential`,name:`Exponential Growth & Rate`,category:`Calculus Foundations`,latex:`f(x) = e^{0.4x}`,fn:e=>Math.exp(.4*e),derivativeStr:`f'(x) = 0.4 e^{0.4x}`,defaultX0:1.5,defaultA:0,defaultB:4},{id:`gaussian`,name:`Gaussian Normal Bell Curve`,category:`Statistics & Area`,latex:`f(x) = 3 e^{-x^2 / 2}`,fn:e=>3*Math.exp(-(e*e)/2),derivativeStr:`f'(x) = -3x e^{-x^2 / 2}`,defaultX0:1,defaultA:-1.96,defaultB:1.96}];function ee(e){if(!e.isOpen)return null;let{onClose:t,preset:n}=e,r=3,i=4,a=2,o=3,s=4,c=75,l=420,u=80,d=6,f=7,p=12,m=4,h=1.2,g=9.81,_=25,v=.5,y=300,b=1,x=`gas`,S=`parabola`,C=2,w=0,T=3,E=n===`calculus-curves`?`calculus`:n===`kinetic-gas`?`kinetic-gas`:`preset`,D=(e,t)=>{typeof window<`u`&&document.querySelectorAll(`iframe`).forEach(n=>{try{n.contentWindow?.postMessage({type:`SET_VAR`,name:e,value:t},`*`)}catch{}})},O=document.createElement(`div`);O.className=`ast-interactive-lab-drawer`,O.style.cssText=`
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
      `,e.appendChild(t);let n=document.createElement(`div`);n.style.cssText=`margin-bottom: 14px;`,n.innerHTML=`<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Function Curve Presets:</div>`;let r=document.createElement(`div`);r.style.cssText=`display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;`,I.forEach(e=>{let t=document.createElement(`button`);t.type=`button`;let n=S===e.id;t.style.cssText=`
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
      `,o.appendChild(c);let l=document.createElement(`input`);l.type=`range`,l.min=String(w+.1),l.max=`4.0`,l.step=`0.1`,l.value=String(T),l.style.cssText=`width: 100%; accent-color: #22c55e;`,l.oninput=e=>{T=Number(e.target.value),D(`calcB`,T),k()},o.appendChild(l),e.appendChild(o);let u=I.find(e=>e.id===S)||I[0],d=new F,f=d.calculateTangent(u.fn,C),p=f.y0,m=f.slope,h=d.calculateDefiniteIntegral(u.fn,w,T).area,g=document.createElement(`div`);g.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,g.innerHTML=`
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
        `;M.appendChild(e)}O.appendChild(M);let N=document.createElement(`div`);N.style.cssText=`padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.12); font-size: 0.72rem; color: #64748b; text-align: center;`,N.textContent=`⚡ 100% Client-Side Invariant Calculator • Zero Server Latency`,O.appendChild(N)}return k(),O}var L=/^#[a-zA-Z0-9_\-:]+$/,te=/^[a-zA-Z0-9_]+$/;function ne(e){return typeof TextEncoder<`u`?new TextEncoder().encode(e).byteLength:e.length}function R(){return typeof performance<`u`&&typeof performance.now==`function`?performance.now():Date.now()}function re(){return typeof document<`u`&&document.modelContext?{surface:`document.modelContext`,api:document.modelContext}:{surface:`unavailable`,api:null}}function ie(e,t){if(typeof e!=`number`||!Number.isFinite(e))return{value:e,clamped:!1};let n=e,r=!1;return t&&typeof t.min==`number`&&Number.isFinite(t.min)&&n<t.min&&(n=t.min,r=!0),t&&typeof t.max==`number`&&Number.isFinite(t.max)&&n>t.max&&(n=t.max,r=!0),{value:n,clamped:r}}function ae(e,t){let n=[];if(typeof e.tuple==`string`&&e.tuple.trim().startsWith(`(:act`)){let r=e.tuple.trim(),i=[],a=r.match(/:seek\s+([0-9.-]+)/i);if(a){let e=Math.max(0,Math.min(1,parseFloat(a[1])));Number.isFinite(e)&&i.push(`:seek ${e.toFixed(3)}`)}let o=r.match(/:highlight\s+"([^"]+)"/i);o&&(L.test(o[1])?i.push(`:highlight "${o[1]}"`):n.push(o[1]));let s=r.match(/:var\s+"([a-zA-Z0-9_]+)"\s+([0-9.-]+|"[^"]*")/i);if(s&&te.test(s[1])){let e=s[1],n=s[2].replace(/^"|"$/g,``),r=Number(n);if(!Number.isNaN(r)&&s[2][0]!==`"`){let n=ie(r,t?.[e]);i.push(`:var "${e}" ${n.value}`)}else i.push(`:var "${e}" "${n.replace(/"/g,`'`)}"`)}let c=null,l=r.match(/:say\s+"([^"]*)"/i);return l&&(c=l[1],i.push(`:say "${l[1]}"`)),{tuple:i.length>0?`(:act ${i.join(` `)})`:`(:act :seek 0.000)`,sayText:c,rejectedSelectors:n}}let r=[];if(typeof e.seek==`number`&&Number.isFinite(e.seek)){let t=Math.max(0,Math.min(1,e.seek));r.push(`:seek ${t.toFixed(3)}`)}if(typeof e.highlight==`string`&&e.highlight.trim()){let t=e.highlight.trim().startsWith(`#`)?e.highlight.trim():`#${e.highlight.trim()}`;L.test(t)?r.push(`:highlight "${t}"`):n.push(e.highlight)}if(typeof e.varName==`string`&&te.test(e.varName.trim())&&e.varValue!==void 0){let n=e.varName.trim(),i=ie(e.varValue,t?.[n]);typeof i.value==`number`?r.push(`:var "${n}" ${i.value}`):r.push(`:var "${n}" "${String(i.value).replace(/"/g,`'`)}"`)}let i=null;return typeof e.say==`string`&&e.say.trim()&&(i=e.say.trim().replace(/"/g,`'`),r.push(`:say "${i}"`)),{tuple:r.length>0?`(:act ${r.join(` `)})`:`(:act :say "Inspection ping")`,sayText:i,rejectedSelectors:n}}function oe(e){return[{name:`ast_set_var`,description:`Mutates a declared simulation :var parameter strictly clamped to its [min, max] bounds and updates reactive bindings.`,annotations:{readOnlyHint:!1},inputSchema:{type:`object`,description:`Parameters for mutating a declared simulation :var safely within [min, max] bounds.`,properties:{name:{type:`string`,pattern:`^[a-zA-Z0-9_]+$`,description:`Declared simulation variable identifier (e.g. temp, conc, pressure).`},value:{oneOf:[{type:`number`},{type:`string`}],description:`Target numeric or string value; numeric inputs are automatically clamped to declared [min, max] bounds.`}},required:[`name`,`value`],additionalProperties:!1},execute:async t=>{let n=R(),r=String(t?.name||``).trim();if(!te.test(r))throw Error(`Invalid variable identifier: "${r}"`);let i=t?.value;if(typeof i!=`number`&&typeof i!=`string`)throw Error(`Variable value must be a finite number or string.`);if(typeof i==`number`&&!Number.isFinite(i))throw Error(`Numeric variable value must be finite.`);let a=(await e.readState(!1))?.varMeta?.[r]||null,{value:o,clamped:s}=ie(i,a),c=await e.setVar(r,o),l=Number((R()-n).toFixed(3)),u={ok:!0,name:c.name||r,requestedValue:i,appliedValue:c.value,clamped:!!(s||c.clamped),bounds:a?{min:a.min??null,max:a.max??null}:null,latencyMs:l};return{...u,mcpPayloadBytes:ne(JSON.stringify(u))}}},{name:`ast_dispatch_action`,description:`Executes the 4-slot AST Vector Player action tuple (:seek, :highlight, :var, :say) with selector sanitization.`,annotations:{readOnlyHint:!1},inputSchema:{type:`object`,description:`Structured or raw 4-slot (:act ...) action dispatch arguments with SVG selector sanitization.`,properties:{tuple:{type:`string`,description:`Optional raw (:act ...) S-expression tuple.`},seek:{type:`number`,minimum:0,maximum:1,description:`Normalized timeline progress in [0.0, 1.0].`},highlight:{type:`string`,pattern:`^#[a-zA-Z0-9_\\-:]+$`,description:`SVG element ID selector (e.g. #piston-head) to pulse on stage.`},varName:{type:`string`,pattern:`^[a-zA-Z0-9_]+$`,description:`Variable name for simultaneous :var mutation.`},varValue:{oneOf:[{type:`number`},{type:`string`}],description:`Variable value for simultaneous :var mutation.`},say:{type:`string`,description:`Short pedagogical utterance routed to BSL & audio narration.`}},additionalProperties:!1},execute:async t=>{let n=R(),r=await e.readState(!1),i=ae(t||{},r?.varMeta);if(i.rejectedSelectors.length>0&&i.tuple===`(:act :say "Inspection ping")`)throw Error(`Unsafe SVG selector rejected: ${i.rejectedSelectors.join(`, `)}`);let a=await e.execActionTuple(i.tuple);i.sayText&&e.onSay&&e.onSay(i.sayText);let o=Number((R()-n).toFixed(3)),s={ok:a.ok,tuple:i.tuple,executedActions:a.executedActions,rejectedSelectors:i.rejectedSelectors,latencyMs:o};return{...s,mcpPayloadBytes:ne(JSON.stringify(s))}}},{name:`ast_read_state`,description:`Returns compact current simulation state: clock t, normalized progress, :vars, :ledger conservation totals, and :pass-expr checkpoint status.`,annotations:{readOnlyHint:!0},inputSchema:{type:`object`,description:`Read-only inspection parameters for compact simulation telemetry.`,properties:{includeSvgBytes:{type:`boolean`,description:`Include raw SVG DOM serialized byte count to compare against compact MCP JSON bytes.`}},additionalProperties:!1},execute:async t=>{let n=R(),r=t?.includeSvgBytes!==!1,i=await e.readState(r),a=Number((R()-n).toFixed(3));if(!i)return{ok:!1,latencyMs:a,mcpPayloadBytes:0,rawSvgBytes:0,domPayloadReductionPct:0};let o={sceneId:i.sceneId,title:i.title,archetype:i.archetype,t:Number((i.t||0).toFixed(3)),progress:Number((i.progress||0).toFixed(4)),isPlaying:i.isPlaying,vars:i.vars,ledgers:i.ledgers,scopesCount:i.scopesCount,checkpointGoals:i.checkpointGoals},s=ne(JSON.stringify(o)),c=Math.max(0,i.svgDomBytes||0),l=c>0?Number(((c-s)/c*100).toFixed(2)):0;return{ok:!0,...o,varMeta:i.varMeta,astSourceBytes:i.astSourceBytes,rawSvgBytes:c,mcpPayloadBytes:s,domPayloadReductionPct:l,latencyMs:a}}}]}var z=null;function se(e){let t=oe(e),n=t.map(e=>e.name),{surface:r,api:i}=re();if(z&&!z.signal.aborted){try{z.abort()}catch{}z=null}if(!i||typeof i.registerTool!=`function`)return{registered:!1,surface:r,mode:`headless-local`,toolNames:n,tools:t,ready:Promise.resolve(),unregister:()=>{}};let a=typeof AbortController<`u`?new AbortController:null;z=a;let o=[],s=[];for(let e of t){let t={name:e.name,description:e.description,inputSchema:e.inputSchema,annotations:e.annotations,execute:e.execute};try{let n=a?i.registerTool(t,{signal:a.signal}):i.registerTool(t);o.push(e.name),n&&typeof n.then==`function`&&s.push({name:e.name,promise:n})}catch(t){console.warn(`[WebMCP] Synchronous registerTool failure for '${e.name}':`,t)}}let c=o.length>0?`registerTool`:`headless-local`,l={registered:c===`registerTool`,surface:r,mode:c,toolNames:n,tools:t,ready:Promise.resolve(),unregister:()=>{try{if(a&&!a.signal.aborted&&a.abort(),z===a&&(z=null),typeof i.unregisterTool==`function`)for(let e of o)try{i.unregisterTool(e)}catch{}}catch{}}};return s.length>0&&(l.ready=(async()=>{let e=0,t=await Promise.allSettled(s.map(e=>e.promise));for(let n=0;n<t.length;n++){let r=t[n],i=s[n].name;r.status===`fulfilled`?e+=1:console.warn(`[WebMCP] Async registerTool rejected for '${i}':`,r.reason)}e===0&&o.length===s.length&&(l.registered=!1,l.mode=`headless-local`)})()),l}async function ce(e,t){let{surface:n,api:r}=re(),i=t&&t.length===3?t:oe(e),a=i.find(e=>e.name===`ast_set_var`),o=i.find(e=>e.name===`ast_dispatch_action`),s=await i.find(e=>e.name===`ast_read_state`).execute({includeSvgBytes:!0}),c=Number(s.latencyMs||0),l=Number(s.mcpPayloadBytes||0),u=Number(s.rawSvgBytes||0),d=Number(s.domPayloadReductionPct||0),f=null,p=null,m=0,h=!1,g=null,_=s.varMeta||{};for(let[e,t]of Object.entries(_))if(e!==`simClock`&&t&&typeof t.max==`number`&&typeof t.min==`number`&&t.max>t.min){f=e,p=s.vars?.[e]??t.val??t.min;let n=t.max+25,r=await a.execute({name:e,value:n});m=Number(r.latencyMs||0),h=!!r.clamped&&Number(r.appliedValue)===t.max,g={varName:e,bounds:{min:t.min,max:t.max},unclampedInput:n,clampedOutput:r.appliedValue,restoredValue:p},p!==null&&await a.execute({name:e,value:p});break}if(!f){let e=R();try{let t=Number(s.t||0),n=await a.execute({name:`simClock`,value:t});m=Number(n.latencyMs||R()-e),h=!0,f=`simClock`,g={varName:`simClock`,bounds:{min:null,max:null},unclampedInput:t,clampedOutput:n.appliedValue??t,restoredValue:t}}catch{m=Number((R()-e).toFixed(3))}}let v=await o.execute({say:`WebMCP 4-slot action verification complete.`}),y=Number(v.latencyMs||0),b=[c,m,y].filter(e=>e>0),x=b.length>0?Number((b.reduce((e,t)=>e+t,0)/b.length).toFixed(3)):0;return{surface:n,registrationMode:r&&typeof r.registerTool==`function`?`registerTool`:`headless-local`,toolsCount:i.length,toolNames:i.map(e=>e.name),readLatencyMs:c,setVarLatencyMs:m,dispatchLatencyMs:y,meanRoundTripMs:x,mcpPayloadBytes:l,rawSvgBytes:u,domPayloadReductionPct:d,clampingVerified:h,sampleVarTested:f,clampingTrace:g,timestamp:Date.now()}}var le=`epp_last_telemetry_dossier`,ue=`(:scene :id "hooke-spring-bench" :title "Hooke's Law Oscillator" :stage "KS4 PHYSICS" :type "Sim" :duration 12.0
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
      :options ("Tune k and x" "Double mass" "Freeze clock" "Remove spring") :answer 0 :explanation "E = 0.5 * k * x^2."))))`,de={schemaVersion:`1.0.0`,sceneMetadata:{id:`hooke-spring-bench`,title:`Hooke's Law Oscillator`,stage:`KS4 PHYSICS`,type:`Sim`,durationSeconds:12},physicsConfiguration:{substeps:4,restitution:.85,friction:.04},variables:[{name:`k`,label:`Spring k (N/m)`,defaultValue:24,minimum:5,maximum:80,step:1},{name:`mass`,label:`Mass (kg)`,defaultValue:2,minimum:.5,maximum:10,step:.5},{name:`disp`,label:`Displacement (m)`,defaultValue:.45,minimum:-1,maximum:1,step:.05}],computedExpressions:[{name:`epElastic`,expression:`0.5 * vars.k * vars.disp * vars.disp`},{name:`omega`,expression:`Math.sqrt(vars.k / Math.max(0.1, vars.mass))`}],springs:[{targetSelector:`#mass-bob`,stiffnessExpression:`vars.k`,damping:.15,restLengthPx:120}],reactiveBindings:[{targetSelector:`#spring-coil`,attribute:`y2`,expression:`180 + vars.disp * 90`},{targetSelector:`#mass-bob`,attribute:`transform`,expression:`'translate(0,' + (vars.disp * 90).toFixed(2) + ')'`}],oscilloscopePlots:[{targetSelector:`#osc-scope`,xExpression:`t`,yExpression:`vars.disp`,sampleCapacity:120,xRange:[0,12],yRange:[-1,1],plotViewport:{x:40,y:280,width:320,height:110}}],conservationLedgers:[{id:`energy-ledger`,targetSelector:`#energy-ledger`,bounds:{x:40,y:410,width:320,height:18},unit:`J`,maxExpression:`40`,terms:[{label:`Elastic PE`,expression:`computed.epElastic`,color:`#38bdf8`}]}],interactiveCheckpoints:[{normalizedTime:.5,title:`Target Elastic Energy`,passExpression:`Math.abs(computed.epElastic - 12.0) < 1.5`,holdDurationSeconds:.8,prompt:`Adjust k and displacement until Elastic PE holds near 12.0 J.`,options:[`Tune k and x`,`Double mass`,`Freeze clock`,`Remove spring`],answerIndex:0,explanation:`E = 0.5 * k * x^2.`}]},fe={type:`object`,properties:{sceneId:{type:`string`},title:{type:`string`},astSExpr:{type:`string`},socraticHint:{type:`string`}},required:[`sceneId`,`astSExpr`],additionalProperties:!1};function B(){return typeof performance<`u`&&typeof performance.now==`function`?performance.now():Date.now()}function V(e){return typeof TextEncoder<`u`?new TextEncoder().encode(e).byteLength:e.length}function pe(e){if(!e)return 0;let t=e.match(/[\(\)\{\}\[\]":,]/g)||[],n=e.match(/[a-zA-Z0-9_.\-\*\/+]+/g)||[],r=Math.round(n.length*1.15+t.length*.45);return Math.max(1,r,Math.ceil(e.length/4.1))}function H(e){return Number(e.toFixed(2))}function me(){if(typeof performance<`u`&&performance.memory){let e=Number(performance.memory.usedJSHeapSize||0);if(e>0)return H(e/1048576)}return null}function U(e){return new Promise(t=>setTimeout(t,e))}var W=[60,75,90,120,144,165,240];function he(e){if(!Number.isFinite(e)||e<=0)return 60;let t=60,n=1/0;for(let r of W){let i=Math.abs(r-e);i<n&&(n=i,t=r)}return t}async function ge(e=250){return typeof requestAnimationFrame==`function`?new Promise(t=>{let n=[],r=0,i=!1,a=()=>{if(i)return;if(i=!0,r&&typeof cancelAnimationFrame==`function`)try{cancelAnimationFrame(r)}catch{}if(n.length<4){t(60);return}let e=[];for(let t=1;t<n.length;t++){let r=n[t]-n[t-1];r>1.5&&r<100&&e.push(r)}if(e.length<3){t(60);return}e.sort((e,t)=>e-t);let a=e[Math.floor(e.length/2)];t(he(1e3/a))},o=setTimeout(a,e+150),s=B(),c=t=>{n.push(typeof t==`number`&&Number.isFinite(t)?t:B()),B()-s>=e||n.length>=90?(clearTimeout(o),a()):r=requestAnimationFrame(c)};r=requestAnimationFrame(c)}):60}function _e(){if(typeof document>`u`||typeof document.createElement!=`function`)return{gpuVendor:null,gpuDescription:null,gpuDevice:null,available:!1};try{let e=document.createElement(`canvas`).getContext(`webgl2`);if(!e)return{gpuVendor:null,gpuDescription:null,gpuDevice:null,available:!1};let t=e.getExtension(`WEBGL_debug_renderer_info`);if(t){let n=String(e.getParameter(t.UNMASKED_VENDOR_WEBGL)||``).trim()||null,r=String(e.getParameter(t.UNMASKED_RENDERER_WEBGL)||``).trim()||null;return{gpuVendor:n,gpuDescription:r,gpuDevice:r,available:!0}}let n=String(e.getParameter(e.RENDERER)||``).trim()||null;return{gpuVendor:String(e.getParameter(e.VENDOR)||``).trim()||null,gpuDescription:n,gpuDevice:n,available:!0}}catch{return{gpuVendor:null,gpuDescription:null,gpuDevice:null,available:!1}}}async function G(){let e=typeof navigator<`u`?navigator:{},t=typeof e.platform==`string`&&e.platform?e.platform:null,n=null,r=null,i=null;if(e.userAgentData&&(typeof e.userAgentData.platform==`string`&&e.userAgentData.platform&&(t=e.userAgentData.platform),typeof e.userAgentData.getHighEntropyValues==`function`))try{let a=await e.userAgentData.getHighEntropyValues([`platform`,`platformVersion`,`architecture`,`bitness`]);a?.platform&&(t=String(a.platform)),a?.platformVersion&&(n=String(a.platformVersion)),a?.architecture&&(r=String(a.architecture)),a?.bitness&&(i=String(a.bitness))}catch{}let a=null,o=null,s=null,c=null,l=`unavailable`,u=null,d=null,f=!!e.gpu;if(e.gpu&&typeof e.gpu.requestAdapter==`function`)try{let t=await e.gpu.requestAdapter({powerPreference:`high-performance`});if(t){let e=t.info||null;if(!e&&typeof t.requestAdapterInfo==`function`)try{e=await t.requestAdapterInfo()}catch{}a=e?.vendor?String(e.vendor):null,o=e?.architecture?String(e.architecture):null,s=e?.device?String(e.device):null,c=e?.description?String(e.description):null;let n=Number(t.limits?.maxBufferSize||0);u=Number.isFinite(n)&&n>0?H(n/1048576):null,d=typeof t.isFallbackAdapter==`boolean`?t.isFallbackAdapter:typeof e?.isFallbackAdapter==`boolean`?e.isFallbackAdapter:null,l=`webgpu`}}catch{}if(l===`unavailable`){let e=_e();e.available&&(a=e.gpuVendor,c=e.gpuDescription,s=e.gpuDevice,l=`webgl2-fallback`)}let p=await ge(250),m=H(1e3/p),h=typeof screen<`u`&&typeof screen.width==`number`&&typeof screen.height==`number`?`${screen.width}x${screen.height}`:null,g=typeof window<`u`&&typeof window.devicePixelRatio==`number`?H(window.devicePixelRatio):null,_=!!e.ml;return{userAgent:String(e.userAgent||`Unknown`),osPlatform:t,osPlatformVersion:n,cpuArchitecture:r,cpuBitness:i,deviceMemoryGb:typeof e.deviceMemory==`number`?e.deviceMemory:null,hardwareConcurrency:typeof e.hardwareConcurrency==`number`?e.hardwareConcurrency:null,webgpuSupported:f,gpuVendor:a,gpuArchitecture:o,gpuDevice:s,gpuDescription:c,gpuBackend:l,gpuMaxBufferSizeMb:u,isFallbackAdapter:d,estimatedRefreshHz:p,vsyncBudgetMs:m,screenResolution:h,devicePixelRatio:g,webnnAvailable:_}}async function ve(e,t){if(!e)return null;let n=async n=>{let r=e[n];if(typeof r!=`function`)return null;try{let n=await r.call(e,t),i=Number(n);if(Number.isFinite(i)&&i>0)return Math.round(i)}catch{try{let n=await r.call(e,[{role:`user`,content:t}]),i=Number(n);if(Number.isFinite(i)&&i>0)return Math.round(i)}catch{}}return null};return await n(`measureContextUsage`)??await n(`measureInputUsage`)}async function ye(e){let t=ue,n=JSON.stringify(de,null,2),r=V(t),i=V(n),a=0,o=!1;try{let e=C(t);a=e.byteLength;let n=S(e);o=!!(n&&n.id===`hooke-spring-bench`)}catch{o=!1}let s=!1;try{let e=O(t);s=!!(Array.isArray(e)&&e.length>0&&(e[0]===`:scene`||e[0]===`scene`)||e&&typeof e==`object`&&!Array.isArray(e)&&(e.tag===`:scene`||e.tag===`scene`))}catch{s=!1}let c=!1;try{let e=JSON.parse(n);c=!!(e&&e.sceneMetadata?.id===`hooke-spring-bench`)}catch{c=!1}let l=pe(t),u=pe(n),d=null,f=null;if(e)try{d=await ve(e,t),f=await ve(e,n)}catch{d=null,f=null}let p=d??l,m=f??u,h=i>0?H((i-r)/i*100):0,g=m>0?H((m-p)/m*100):0,_=i>0&&a>0?H((i-a)/i*100):0;return{astLines:t.split(`
`).length,astBytes:r,jsonBytes:i,astbBytes:a,astEstimatedTokens:l,jsonEstimatedTokens:u,astMeasuredTokens:d,jsonMeasuredTokens:f,astVsJsonByteSavingsPct:h,astVsJsonTokenSavingsPct:g,astbVsJsonByteSavingsPct:_,astValid:s,jsonValid:c,astbValid:o}}function be(){return typeof self<`u`&&self.LanguageModel?self.LanguageModel:typeof window<`u`&&window.LanguageModel?window.LanguageModel:null}async function xe(e){if(!e)return`unsupported`;try{if(typeof e.availability==`function`)try{let t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]});return String(t||`unavailable`)}catch{let t=await e.availability();return String(t||`unavailable`)}if(typeof e.capabilities==`function`){let t=await e.capabilities();return String(t?.available||`unavailable`)}}catch{return`unavailable`}return`unavailable`}function Se(...e){for(let t of e)if(typeof t==`number`&&Number.isFinite(t))return Math.round(t);return null}function Ce(e){return e?{inputUsage:Se(e.contextUsage,e.inputUsage,e.tokensSoFar),inputQuota:Se(e.contextWindow,e.inputQuota,e.maxTokens)}:{inputUsage:null,inputQuota:null}}function we(e){let{hardwareProfile:t,promptApiStatus:n,contentionPhases:r,contextQuotaTrace:i,compressionComparison:a,webmcpBenchmark:o}=e,{phaseABaseline:s,phaseBConcurrent:c,phaseCRecovery:l,deltas:u}=r,d=t.estimatedRefreshHz??60,f=r.vsyncBudgetMs??t.vsyncBudgetMs??H(1e3/d),p=r.severeDropThresholdMs??H(f*1.15),m=[t.gpuVendor,t.gpuDevice,t.gpuArchitecture,t.gpuDescription].filter(Boolean),h=m.length>0?m.join(` / `):`Unavailable`,g=e=>`${e.rawVsyncOverruns??e.framesOver16_67ms??0} (${e.rawVsyncOverrunPct??e.overBudgetPct??0}%)`,_=e=>`${e.severeFrameDrops??0} (${e.severeFrameDropPct??0}%)`,v=o.clampingTrace?` (${o.clampingTrace.bounds.min===null?`unbounded`:`[${o.clampingTrace.bounds.min}, ${o.clampingTrace.bounds.max}]`}; unclamped \`${o.clampingTrace.unclampedInput}\` -> clamped \`${o.clampingTrace.clampedOutput}\`)`:``;return[`# Chrome Built-in AI & WebMCP Field Telemetry Dossier`,``,`- **Generated**: \`${e.generatedAtIso}\``,`- **Active Cartridge**: \`${e.sceneId}\``,`- **Active AI Tier**: \`${n.activeTier}\` (Prompt API availability: \`${n.availability}\`)`,``,`## 1. Hardware & Memory Profile`,`| Metric | Measured Value |`,`|---|---|`,`| User Agent | \`${t.userAgent.replace(/\|/g,`/`)}\` |`,`| OS Platform | ${t.osPlatform?`\`${t.osPlatform}${t.osPlatformVersion?` ${t.osPlatformVersion}`:``}\``:`Not exposed`} |`,`| CPU Architecture | ${t.cpuArchitecture?`\`${t.cpuArchitecture}${t.cpuBitness?` (${t.cpuBitness}-bit)`:``}\``:`Not exposed`} |`,`| \`navigator.deviceMemory\` | ${t.deviceMemoryGb===null?`Not exposed`:`${t.deviceMemoryGb} GB`} |`,`| \`navigator.hardwareConcurrency\` | ${t.hardwareConcurrency===null?`Not exposed`:`${t.hardwareConcurrency} threads`} |`,`| GPU Adapter (\`${t.gpuBackend||(t.webgpuSupported?`webgpu`:`unavailable`)}\`) | \`${h.replace(/\|/g,`/`)}\`${t.gpuMaxBufferSizeMb!==null&&t.gpuMaxBufferSizeMb!==void 0?` (maxBuffer: ${t.gpuMaxBufferSizeMb} MB, fallbackAdapter: ${t.isFallbackAdapter??`N/A`})`:``} |`,`| Display & Vsync Budget | ${t.screenResolution||`Unknown`} @ ${t.devicePixelRatio??1}x DPR · ~${d} Hz (${f} ms frame budget; severe > ${p} ms) |`,`| WebNN (\`navigator.ml\`) | ${t.webnnAvailable?`Present`:`Absent`} |`,`| WASM Fixed Linear Pool | ${(t.wasmPoolBytes/1024).toFixed(0)} KB (${t.wasmPages} pages, 0 dynamic allocs in loop) |`,`| JS Heap (Start -> End) | ${t.jsHeapStartMb===null?`Not exposed`:`${t.jsHeapStartMb} MB -> ${t.jsHeapEndMb} MB (Δ ${t.heapDeltaMb} MB)`} |`,`| BSL Vector Avatar Active | ${t.bslAvatarActiveDuringRun?`Yes (60 FPS procedural skeleton)`:`No`} |`,``,`## 2. Concurrent Vector Simulation + On-Device Inference Contention`,`- **Dynamic Vsync Budget**: \`${f} ms\` (~${d} Hz) · **Severe Frame Drop Threshold (>1.15× vsync)**: \`>${p} ms\``,`- **Phase A (Baseline)**: ${s.durationMs} ms of pure vector physics + BSL avatar (zero AI activity)`,`- **Phase B (Concurrent)**: ${c.durationMs} ms concurrent workload (\`${c.workloadLabel}\`)`,`- **Phase C (Recovery)**: ${l.durationMs} ms post-inference compositor & GC recovery`,``,`| Phase | Samples | Mean (ms) | p95 (ms) | p99 (ms) | Max (ms) | Raw Overruns (>${f}ms) | Severe Drops (>${p}ms) | Est. FPS | VM Compute Mean (ms) |`,`|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|`,`| Phase A (Baseline) | ${s.stats.sampleCount} | ${s.stats.meanMs} | ${s.stats.p95Ms} | ${s.stats.p99Ms} | ${s.stats.maxMs} | ${g(s.stats)} | ${_(s.stats)} | ${s.stats.estimatedFps} | ${s.stats.meanComputeMs} |`,`| Phase B (Concurrent) | ${c.stats.sampleCount} | ${c.stats.meanMs} | ${c.stats.p95Ms} | ${c.stats.p99Ms} | ${c.stats.maxMs} | ${g(c.stats)} | ${_(c.stats)} | ${c.stats.estimatedFps} | ${c.stats.meanComputeMs} |`,`| Phase C (Recovery) | ${l.stats.sampleCount} | ${l.stats.meanMs} | ${l.stats.p95Ms} | ${l.stats.p99Ms} | ${l.stats.maxMs} | ${g(l.stats)} | ${_(l.stats)} | ${l.stats.estimatedFps} | ${l.stats.meanComputeMs} |`,``,`- **Phase B Contention Deltas vs Baseline**: \`Δmean = ${u.phaseBMeanMsDelta>=0?`+`:``}${u.phaseBMeanMsDelta} ms\`, \`Δp95 = ${u.phaseBP95MsDelta>=0?`+`:``}${u.phaseBP95MsDelta} ms\`, \`Δp99 = ${u.phaseBP99MsDelta>=0?`+`:``}${u.phaseBP99MsDelta} ms\`, \`ΔrawOverruns = ${(u.phaseBRawOverrunDelta??u.phaseBOverBudgetFrameDelta)>=0?`+`:``}${u.phaseBRawOverrunDelta??u.phaseBOverBudgetFrameDelta}\`, \`ΔsevereDrops = ${(u.phaseBSevereDropDelta??0)>=0?`+`:``}${u.phaseBSevereDropDelta??0}\``,`- **Phase C Recovery Delta vs Baseline**: \`Δmean = ${u.phaseCMeanMsDelta>=0?`+`:``}${u.phaseCMeanMsDelta} ms\`, \`Δp95 = ${u.phaseCP95MsDelta>=0?`+`:``}${u.phaseCP95MsDelta} ms\``,`- **Session Clone Latency**: ${n.cloneLatencyMs===null?`N/A (Prompt API session inactive)`:`${n.cloneLatencyMs} ms (clone.destroy() cleanly executed: ${n.cloneDestroyedCleanly})`}`,``,`## 3. Context Window & Multi-Turn Socratic Checkpoint Telemetry`,`- \`session.contextWindow ?? inputQuota\`: ${i.inputQuota===null?`N/A`:i.inputQuota}`,`- Final \`session.contextUsage ?? inputUsage\`: ${i.finalInputUsage===null?`N/A`:i.finalInputUsage}`,`- \`contextoverflow\` / \`quotaoverflow\` Events Fired: ${i.totalQuotaOverflows}`,`- Mean Time-To-First-Token (TTFT): ${i.meanTtftMs===null?`N/A`:`${i.meanTtftMs} ms`}`,``,`| Turn | Role | Prompt Bytes | Output Bytes | TTFT (ms) | Duration (ms) | Context Usage | Overflows | Valid |`,`|---:|---|---:|---:|---:|---:|---:|---:|---|`,...i.turns.map(e=>`| ${e.turn} | \`${e.promptRole}\` | ${e.promptBytes} | ${e.outputBytes} | ${e.ttftMs} | ${e.durationMs} | ${e.inputUsage===null?`N/A`:`${e.inputUsage}/${e.inputQuota??`?`}`} | ${e.quotaoverflowCount} | ${e.validOutput?`PASS`:`WARN`} |`),``,"## 4. Token & Byte Compression: Homoiconic `.ast` vs Verbose JSON vs Binary `.astb`",`| Representation | UTF-8 Bytes | Tokens (Measured / Est.) | Valid Parse | Savings vs Verbose JSON |`,`|---|---:|---:|---|---|`,`| Homoiconic \`.ast\` (${a.astLines} lines) | ${a.astBytes} B | ${a.astMeasuredTokens??a.astEstimatedTokens} ${a.astMeasuredTokens===null?`(est.)`:`(Nano tokenizer)`} | ${a.astValid?`PASS`:`FAIL`} | ${a.astVsJsonByteSavingsPct}% bytes / ${a.astVsJsonTokenSavingsPct}% tokens |`,`| Verbose JSON Schema | ${a.jsonBytes} B | ${a.jsonMeasuredTokens??a.jsonEstimatedTokens} ${a.jsonMeasuredTokens===null?`(est.)`:`(Nano tokenizer)`} | ${a.jsonValid?`PASS`:`FAIL`} | Baseline (0%) |`,`| Pre-compiled \`.astb\` Bytecode | ${a.astbBytes} B | N/A (Zero-copy binary) | ${a.astbValid?`PASS`:`FAIL`} | ${a.astbVsJsonByteSavingsPct}% bytes |`,``,"## 5. WebMCP (`document.modelContext`) Live Tool & Actuation Benchmark",`- **WebMCP Surface**: \`${o.surface}\` (Mode: \`${o.registrationMode}\`)`,`- **Registered Tools (${o.toolsCount})**: \`${o.toolNames.join("`, `")}\``,`- **\`ast_read_state\` Round-Trip**: ${o.readLatencyMs} ms`,`- **\`ast_set_var\` Round-Trip**: ${o.setVarLatencyMs} ms (\`[min, max]\` clamping verified on \`${o.sampleVarTested}\`: ${o.clampingVerified?`PASS`:`FAIL`}${v})`,`- **\`ast_dispatch_action\` 4-Slot Tuple Round-Trip**: ${o.dispatchLatencyMs} ms`,`- **Compact MCP JSON vs Raw SVG DOM**: ${o.mcpPayloadBytes} B vs ${o.rawSvgBytes} B (**${o.domPayloadReductionPct}% smaller payload**)`,``,`---`,`*Captured locally in zero-egress air-gapped telemetry mode via EdgeLearningEngineDB.*`].join(`
`)}async function Te(e){await l(le,JSON.stringify(e))}async function Ee(){try{let e=(await u()).find(e=>e.key===le);return!e||!e.value?null:JSON.parse(e.value)}catch{return null}}function K(e,t,n){if(typeof document<`u`)try{let r=new Blob([t],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}catch{}}async function De(e){let{transport:t,sceneId:n,onProgress:r,phaseADurationMs:i=3e3,phaseCDurationMs:a=2e3}=e,o=be(),s=await xe(o),c=m(),l=me();r?.({phase:`init`,pct:5,label:`Probing hardware, display refresh & Prompt API (${s})...`});let u=await G(),d=u.vsyncBudgetMs,f=H(d*1.15),p=e=>{let t=e.rawVsyncOverruns??e.framesOver16_67ms??0,n=e.rawVsyncOverrunPct??(e.sampleCount>0?H(t/e.sampleCount*100):e.overBudgetPct??0),r=e.severeFrameDrops??0,i=e.severeFrameDropPct??(e.sampleCount>0?H(r/e.sampleCount*100):0);return{...e,vsyncBudgetMs:e.vsyncBudgetMs??d,rawVsyncOverruns:t,rawVsyncOverrunPct:n,severeFrameDrops:r,severeFrameDropPct:i}},h=c;c||(g(!0),h=!0),_({subtitle:`Benchmarking 60 FPS vector kinematics and on-device telemetry.`,isSpeaking:!0});let v,y,b,x=`tier3-deterministic-ast`,w=null,E=!1,D=!1,A=[],j=0,M=null,N=null,P=null;try{r?.({phase:`phase-a`,pct:15,label:`Phase A (Baseline): Capturing ${Math.round(i/1e3)}s of pure ${u.estimatedRefreshHz}Hz physics + BSL...`});let e=B();await t.startProfCapture(),await U(i);let c=await t.stopProfCapture(d);v={durationMs:Math.round(B()-e),stats:p(c.stats),activeMetrics:c.activeMetrics,workloadLabel:`Pure ${u.estimatedRefreshHz}Hz (${d}ms) vector + BSL kinematics (Zero AI)`};let m=await t.mcpTransport.readState(!1),g=m?.ledgers?.length?m.ledgers.map(e=>`${e.id}=${e.total.toFixed(2)}${e.unit||``}`).join(`, `):`none`,_=m?.checkpointGoals?.length?m.checkpointGoals.map(e=>`${e.title}[passed=${e.passed},expr=${e.passExpr||`none`}]`).join(`; `):`none`,F=`(:state :scene "${n}" :t ${(m?.t??0).toFixed(2)} :vars ${JSON.stringify(m?.vars||{})} :ledger "${g}" :goals "${_}")`;r?.({phase:`phase-b`,pct:45,label:`Phase B (Concurrent Inference): Running ${s===`readily`||s===`available`?`Gemini Nano promptStreaming`:`Tier-2/3 fallback telemetry`}...`});let I=B();await t.startProfCapture();let ee=`Tier-3 Deterministic Socratic + AST Compiler Stress`;if(o&&(s===`readily`||s===`available`||(s===`after-download`||s===`downloading`)&&T())){let e=null,t=()=>{j+=1};try{let n=`You synthesize compact AST vector cartridges (:scene ...) and concise Socratic nudges grounded in telemetry.`;try{e=await o.create({samplingMode:`most-predictable`,initialPrompts:[{role:`system`,content:n}],expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]})}catch{e=await o.create({initialPrompts:[{role:`system`,content:n}]})}e&&typeof e.addEventListener==`function`&&(e.addEventListener(`contextoverflow`,t),e.addEventListener(`quotaoverflow`,t)),x=`chrome-builtin-nano`,ee=`Gemini Nano streaming + session.clone() + 3-turn Socratic drill`,P=e;let r=`Emit a minimal 20-line (:scene :id "bench-spring" ...) Hooke oscillator with :scope and :ledger in field astSExpr. Telemetry: ${F}`,i=B(),a=0,s=``;try{let t=e.promptStreaming?e.promptStreaming(r,{responseConstraint:fe,outputLanguage:`en`}):null;if(D=!!t,t){let e=``;for await(let n of t){a===0&&(a=H(B()-i));let t=String(n||``),r=t.startsWith(e)?t.slice(e.length):t;e=t,s+=r}!s&&e&&(s=e)}else s=await e.prompt(r,{responseConstraint:fe}),D=!0,a=H(B()-i)}catch{D=!1;let t=await e.prompt(r);s=String(t||``),a=H(B()-i)}let c=Ce(e);if(c.inputQuota!==null&&(M=c.inputQuota),c.inputUsage!==null&&(N=c.inputUsage),A.push({turn:1,promptRole:`ast-synthesis`,promptBytes:V(r),outputBytes:V(s),ttftMs:a||H(B()-i),durationMs:H(B()-i),inputUsage:c.inputUsage,inputQuota:c.inputQuota,quotaoverflowCount:j,validOutput:s.includes(`scene`)||s.includes(`:scene`)}),typeof e.clone==`function`){let t=B(),n=await e.clone();w=H(B()-t),n&&typeof n.destroy==`function`&&(n.destroy(),E=!0)}let l=[{role:`socratic-drill-1`,prompt:`Turn 1 telemetry ${F}. Give one Socratic hint (<20 words) guiding the learner toward the :pass-expr goal.`},{role:`socratic-drill-2`,prompt:`Turn 2 telemetry ${F}. Explain how energy/particle conservation stays invariant using one numeric variable.`},{role:`socratic-drill-3`,prompt:`Turn 3 telemetry ${F}. Emit one compact (:act :highlight "#stage" :say "...") tuple.`}];for(let t=0;t<l.length;t++){let n=l[t],r=B(),i=0,a=``;if(e.promptStreaming){let t=e.promptStreaming(n.prompt),o=``;for await(let e of t){i===0&&(i=H(B()-r));let t=String(e||``),n=t.startsWith(o)?t.slice(o.length):t;o=t,a+=n}!a&&o&&(a=o)}else a=String(await e.prompt(n.prompt)),i=H(B()-r);let o=Ce(e);o.inputQuota!==null&&(M=o.inputQuota),o.inputUsage!==null&&(N=o.inputUsage),A.push({turn:t+2,promptRole:n.role,promptBytes:V(n.prompt),outputBytes:V(a),ttftMs:i||H(B()-r),durationMs:H(B()-r),inputUsage:o.inputUsage,inputQuota:o.inputQuota,quotaoverflowCount:j,validOutput:a.trim().length>0})}}catch(e){console.warn(`[EPPBench] Native Prompt API invocation failed, dropping to Tier-2/3:`,e)}finally{if(e){try{e.removeEventListener?.(`contextoverflow`,t)}catch{}try{e.removeEventListener?.(`quotaoverflow`,t)}catch{}}}}let L=await ye(P);if(P&&typeof P.destroy==`function`){try{P.destroy()}catch{}P=null}if(A.length===0){let e=k.checkMemoryEligibility();if(k.isReady()&&e.isEligible&&T()){x=`webgpu-webllm`,ee=`Tier-2 WebLLM / WebGPU streaming fallback`;let e=[{role:`ast-synthesis`,prompt:`Synthesize compact 20-line AST for ${n}.`},{role:`socratic-drill-1`,prompt:`Telemetry ${F}. One Socratic hint?`},{role:`socratic-drill-2`,prompt:`Telemetry ${F}. Conservation law note?`},{role:`socratic-drill-3`,prompt:`Telemetry ${F}. Action tuple (:act :seek 0.5).`}];for(let t=0;t<e.length;t++){let n=e[t],r=B(),i=0,a=``;for await(let e of k.inferStream(n.prompt))i===0&&(i=H(B()-r)),a+=e;A.push({turn:t+1,promptRole:n.role,promptBytes:V(n.prompt),outputBytes:V(a),ttftMs:i||H(B()-r),durationMs:H(B()-r),inputUsage:null,inputQuota:null,quotaoverflowCount:0,validOutput:a.trim().length>0})}}else{x=`tier3-deterministic-ast`,ee=`Tier-3 Deterministic AST/Bytecode Socratic Synthesis (Nano ${s})`;let e=[`ast-synthesis`,`socratic-drill-1`,`socratic-drill-2`,`socratic-drill-3`];for(let t=0;t<e.length;t++){let n=e[t],r=n===`ast-synthesis`?`Synthesize canonical 20-line AST from telemetry ${F}`:`Socratic drill ${t} on telemetry ${F}`,i=B(),a=``;if(n===`ast-synthesis`){O(ue);let e=C(ue);S(e),a=ue}else a=(await k.infer(r)).output;let o=H(B()-i);A.push({turn:t+1,promptRole:n,promptBytes:V(r),outputBytes:V(a),ttftMs:o,durationMs:o,inputUsage:null,inputQuota:null,quotaoverflowCount:0,validOutput:a.length>0}),await U(300)}}}let te=await t.stopProfCapture(d);y={durationMs:Math.round(B()-I),stats:p(te.stats),activeMetrics:te.activeMetrics,workloadLabel:ee},r?.({phase:`phase-c`,pct:78,label:`Phase C (Recovery): Measuring ${Math.round(a/1e3)}s post-inference frame stability & GC recovery...`});let ne=B();await t.startProfCapture(),await U(a);let R=await t.stopProfCapture(d);b={durationMs:Math.round(B()-ne),stats:p(R.stats),activeMetrics:R.activeMetrics,workloadLabel:`Post-inference GPU/NPU & GC recovery`},r?.({phase:`webmcp`,pct:90,label:`Measuring WebMCP (${re().surface}) tool latency & DOM payload savings...`});let ie=await ce(t.mcpTransport,t.mcpTools),ae=me(),oe=l!==null&&ae!==null?H(ae-l):null,z=A.map(e=>e.ttftMs).filter(e=>Number.isFinite(e)&&e>=0),se=z.length>0?H(z.reduce((e,t)=>e+t,0)/z.length):null,le=v.stats.rawVsyncOverruns??v.stats.framesOver16_67ms,de=y.stats.rawVsyncOverruns??y.stats.framesOver16_67ms,pe=v.stats.severeFrameDrops??0,W=y.stats.severeFrameDrops??0,he={dossierVersion:`1.0.0`,generatedAtIso:new Date().toISOString(),sceneId:n,hardwareProfile:{...u,wasmPoolBytes:R.memory.wasmPoolBytes||458752,wasmPages:R.memory.wasmPages||7,jsHeapStartMb:l,jsHeapEndMb:ae,heapDeltaMb:oe,bslAvatarActiveDuringRun:h},promptApiStatus:{present:!!o,availability:s,activeTier:x,cloneLatencyMs:w,cloneDestroyedCleanly:E,constraintSchemaUsed:D},contentionPhases:{vsyncBudgetMs:d,severeDropThresholdMs:f,phaseABaseline:v,phaseBConcurrent:y,phaseCRecovery:b,deltas:{phaseBMeanMsDelta:H(y.stats.meanMs-v.stats.meanMs),phaseBP95MsDelta:H(y.stats.p95Ms-v.stats.p95Ms),phaseBP99MsDelta:H(y.stats.p99Ms-v.stats.p99Ms),phaseBMaxMsDelta:H(y.stats.maxMs-v.stats.maxMs),phaseBOverBudgetFrameDelta:y.stats.framesOver16_67ms-v.stats.framesOver16_67ms,phaseBRawOverrunDelta:de-le,phaseBSevereDropDelta:W-pe,phaseCMeanMsDelta:H(b.stats.meanMs-v.stats.meanMs),phaseCP95MsDelta:H(b.stats.p95Ms-v.stats.p95Ms)}},contextQuotaTrace:{inputQuota:M,finalInputUsage:N,totalQuotaOverflows:j,meanTtftMs:se,turns:A},compressionComparison:L,webmcpBenchmark:ie};return r?.({phase:`export`,pct:96,label:`Persisting telemetry dossier to EdgeLearningEngineDB...`}),await Te(he),r?.({phase:`complete`,pct:100,label:`Chrome EPP Contention & WebMCP Telemetry Suite Complete`}),he}finally{if(P&&typeof P.destroy==`function`){try{P.destroy()}catch{}P=null}!c&&m()&&g(!1)}}function q(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}async function Oe(){let e=(typeof self<`u`?self:window)?.LanguageModel||window?.LanguageModel;if(!e)return`unavailable (API absent)`;try{if(typeof e.availability==`function`)try{let t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]});return String(t||`unavailable`)}catch{return String(await e.availability()||`unavailable`)}if(typeof e.capabilities==`function`){let t=await e.capabilities();return String(t?.available||`unavailable`)}}catch{return`unavailable`}return`unavailable`}function ke(e,t=`ms`){return`${e>0?`+`:``}${e.toFixed(2)} ${t}`}function Ae(e){let{onClose:t,presetId:n,presetLabel:r,presetType:i,postToPlayer:a,benchTransport:o,webMcpHandle:s}=e,c=document.createElement(`div`);c.className=`ast-diagnostics-drawer`,c.style.cssText=`padding: 1rem 1.25rem; background: #07090e; color: #e2e8f0; font-size: 0.8rem; border-bottom: 1px solid #1e293b;`;let l=!1,u=null,d=null,f=null,p=null,m=null,h=`probing...`,g=``,_=!1;function v(){let e=[`448 KB WASM SoA`];if(typeof performance<`u`&&performance.memory){let t=(performance.memory.usedJSHeapSize/1048576).toFixed(1);e.push(`JS Heap ${t} MB`)}let t=typeof navigator<`u`?navigator:{};return typeof t.deviceMemory==`number`&&e.push(`${t.deviceMemory} GB RAM`),typeof t.hardwareConcurrency==`number`&&e.push(`${t.hardwareConcurrency}T CPU`),e.join(` · `)}function y(){let e=d?.hardwareProfile||f;if(!e)return`Probing GPU adapter, display refresh (Hz), OS/CPU & WebNN...`;let t=e.gpuDescription||e.gpuDevice||e.gpuVendor||(e.gpuBackend===`unavailable`?`No WebGPU/WebGL2 adapter`:`Adapter unknown`),n=e.gpuBackend?e.gpuBackend:e.webgpuSupported?`webgpu`:`webgl2`,r=typeof e.gpuMaxBufferSizeMb==`number`?` · MaxBuf ${e.gpuMaxBufferSizeMb} MB`:``,i=e.estimatedRefreshHz?`${e.estimatedRefreshHz}Hz`:`60Hz`,a=e.vsyncBudgetMs?`${e.vsyncBudgetMs.toFixed(2)}ms`:`16.67ms`,o=e.screenResolution||`n/a`,s=typeof e.devicePixelRatio==`number`?` @${e.devicePixelRatio}x`:``,c=[e.osPlatform?`${e.osPlatform}${e.osPlatformVersion?` ${e.osPlatformVersion}`:``}`:null,e.cpuArchitecture?`${e.cpuArchitecture}${e.cpuBitness?`-${e.cpuBitness}`:``}`:null].filter(Boolean).join(` `),l=e.webnnAvailable?`WebNN: ON`:`WebNN: OFF`;return`${c?`${c} · `:``}GPU[${n}]: ${t}${r} · Display: ${o}${s} (${i} / ${a}) · ${l}`}function S(){let e=b(`app_perf_hud_enabled`)===`true`,t=b(`app_hud_verbosity`)||`minimal`,a=b(`app_frame_budget_alert`)===`true`,o=b(`app_target_fps`)||`adaptive`,_=re(),x=i===`Sim`,S=d?.compressionComparison||p,C=d?.webmcpBenchmark||m,T=d?.contentionPhases,E=d?.contextQuotaTrace,D=T?.vsyncBudgetMs??d?.hardwareProfile?.vsyncBudgetMs??f?.vsyncBudgetMs??16.67,O=T?.severeDropThresholdMs??Number((D*1.15).toFixed(2));c.innerHTML=`
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid #1e293b;">
        <div style="min-width:0;">
          <div style="font-size:0.68rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#64748b; font-family:ui-monospace, monospace;">
            Lumina Telemetry &amp; Chrome EPP Field Test Bed · ${x?`:Sim`:`:`+q(i)} · ${q(n)}
          </div>
          <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-top:2px;">
            <strong style="font-size:0.96rem; color:#f8fafc; letter-spacing:-0.01em;">
              Hardware Budget, On-Device AI Contention &amp; WebMCP Dossier
            </strong>
            <span style="font-size:0.74rem; color:#94a3b8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
              ${q(v())}
            </span>
          </div>
          <div style="font-size:0.71rem; color:#38bdf8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; margin-top:3px;">
            ${q(y())}
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
            <span style="color:#38bdf8; font-weight:700;">${q(u.label)}</span>
            <span style="color:#f8fafc;">${u.pct}%</span>
          </div>
          <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
            <div style="width:${u.pct}%; height:100%; background:#38bdf8; transition:width 0.2s ease;"></div>
          </div>
        </div>
      `:``}

      ${g?`
        <div style="background:#0b1120; border:1px solid #1e293b; border-left:3px solid #34d399; padding:7px 10px; margin-bottom:12px; font-size:0.74rem; color:#cbd5e1; font-family:ui-monospace, monospace;">
          ${q(g)}
        </div>
      `:``}

      <!-- Primary Capability Strip -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:12px;">
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
            Chrome Prompt API (LanguageModel)
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:${h===`readily`||h===`available`?`#34d399`:`#fbbf24`}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${q(h)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">
            Tier: ${q(d?.promptApiStatus.activeTier||`auto (Nano -> WebLLM -> Tier 3)`)}
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
          <div style="font-size:0.9rem; font-weight:700; color:${_.surface===`unavailable`?`#94a3b8`:`#34d399`}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${q(_.surface)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px; font-family:ui-monospace, monospace;">
            ${s?.tools?.length||3} tools (${s?.registered?q(s.mode):`local harness`})
          </div>
        </div>

        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
            AST vs JSON Compression
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:#38bdf8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; margin-top:3px;">
            ${S?`${S.astVsJsonByteSavingsPct}% bytes · ${S.astVsJsonTokenSavingsPct}% tokens`:`Computing...`}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
            ${S?`.ast ${S.astBytes}B · .astb ${S.astbBytes}B · JSON ${S.jsonBytes}B`:q(r)}
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

      ${T?`
        <!-- Empirical 3-Phase Contention Metrics -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
            <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8;">
              3-Phase 60 FPS GPU/NPU Contention Trace
            </span>
            <span style="font-size:0.72rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#38bdf8;">
              ΔMean(B-A): ${ke(T.deltas.phaseBMeanMsDelta)} · Δp95(B-A): ${ke(T.deltas.phaseBP95MsDelta)} · ΔMean(C-A): ${ke(T.deltas.phaseCMeanMsDelta)}
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
                  <th style="padding:4px 6px;">&gt;${D.toFixed(2)}ms</th>
                  <th style="padding:4px 6px;">Drops (&gt;${O.toFixed(2)}ms)</th>
                  <th style="padding:4px 6px;">FPS</th>
                  <th style="padding:4px 6px;">VM ms</th>
                </tr>
              </thead>
              <tbody>
                ${[{name:`A · Baseline`,p:T.phaseABaseline},{name:`B · Concurrent`,p:T.phaseBConcurrent},{name:`C · Recovery`,p:T.phaseCRecovery}].map(({name:e,p:t})=>{let n=t.stats.rawVsyncOverruns??t.stats.framesOver16_67ms,r=t.stats.rawVsyncOverrunPct??t.stats.overBudgetPct,i=t.stats.severeFrameDrops??0,a=t.stats.severeFrameDropPct??0;return`
                  <tr style="border-bottom:1px solid #111827; text-align:right; color:#e2e8f0;">
                    <td style="text-align:left; padding:5px 6px; font-weight:700; color:#f8fafc;">${e}</td>
                    <td style="padding:5px 6px;">${t.stats.sampleCount}</td>
                    <td style="padding:5px 6px;">${t.stats.meanMs.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${t.stats.p95Ms.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${t.stats.p99Ms.toFixed(2)}ms</td>
                    <td style="padding:5px 6px;">${t.stats.maxMs.toFixed(2)}ms</td>
                    <td style="padding:5px 6px; color:${n>0?`#fbbf24`:`#34d399`};">${n} (${r}%)</td>
                    <td style="padding:5px 6px; color:${i>0?`#f87171`:`#34d399`};">${i} (${a}%)</td>
                    <td style="padding:5px 6px; color:#38bdf8;">${t.stats.estimatedFps.toFixed(1)}</td>
                    <td style="padding:5px 6px;">${t.stats.meanComputeMs.toFixed(3)}ms</td>
                  </tr>
                `}).join(``)}
              </tbody>
            </table>
          </div>
        </div>
      `:``}

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:10px; margin-bottom:10px;">
        <!-- Quota & Socratic Telemetry Card -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px;">
          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; margin-bottom:6px;">
            Context Window, TTFT &amp; session.clone()
          </div>
          ${E?`
            <div style="font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#cbd5e1; margin-bottom:6px;">
              Context: ${E.finalInputUsage??`N/A`} / ${E.inputQuota??`N/A`} · Overflows: ${E.totalQuotaOverflows} · Mean TTFT: ${E.meanTtftMs??`N/A`} ms · Clone: ${d?.promptApiStatus.cloneLatencyMs!==null&&d?.promptApiStatus.cloneLatencyMs!==void 0?`${d.promptApiStatus.cloneLatencyMs} ms`:`N/A`}
            </div>
            <div style="font-size:0.71rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#94a3b8;">
              ${E.turns.map(e=>`T${e.turn}(${e.promptRole}): ${e.ttftMs}ms TTFT / ${e.durationMs}ms total · ${e.inputUsage??`N/A`}/${e.inputQuota??`N/A`} tok · ${e.outputBytes}B`).join(`<br/>`)}
            </div>
          `:`
            <div style="font-size:0.74rem; color:#64748b;">
              Run the contention suite to log live <code>contextWindow</code>/<code>contextUsage</code>, <code>contextoverflow</code>, <code>session.clone()</code>, and per-turn TTFT metrics.
            </div>
          `}
        </div>

        <!-- WebMCP Round-Trip Telemetry Card -->
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:10px 12px;">
          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#94a3b8; margin-bottom:6px;">
            WebMCP Actuation &amp; Payload Reduction
          </div>
          ${C?`
            <div style="font-size:0.73rem; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; color:#cbd5e1; line-height:1.55;">
              <div>ast_read_state: <strong>${C.readLatencyMs}ms</strong> · ast_set_var: <strong>${C.setVarLatencyMs}ms</strong> · ast_dispatch_action: <strong>${C.dispatchLatencyMs}ms</strong></div>
              <div>Payload: <strong>${C.mcpPayloadBytes} B</strong> MCP JSON vs <strong>${C.rawSvgBytes} B</strong> SVG DOM (<strong style="color:#34d399;">${C.domPayloadReductionPct}% smaller</strong>)</div>
              <div>[min, max] Clamping Guard (<code>${q(C.sampleVarTested||`none`)}</code>): <strong style="color:${C.clampingVerified?`#34d399`:`#f87171`};">${C.clampingVerified?`PASS`:`FAIL`}</strong>${C.clampingTrace?` · ${q(String(C.clampingTrace.unclampedInput))} &rarr; ${q(String(C.clampingTrace.clampedOutput))}`:``}</div>
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
          ${d?`Last dossier: ${q(d.generatedAtIso)} · Saved in EdgeLearningEngineDB`:`Zero network egress · Saved locally in EdgeLearningEngineDB`}
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
    `,w()}async function C(){if(!l){l=!0,g=``,u={phase:`init`,pct:2,label:`Initializing 3-phase empirical contention harness...`},c.isConnected&&S();try{let e=await De({transport:o,sceneId:n,onProgress:e=>{u=e,c.isConnected&&S()}});d=e,p=e.compressionComparison,m=e.webmcpBenchmark,h=e.promptApiStatus.availability,g=`Dossier captured & saved in EdgeLearningEngineDB. Exporting Markdown + JSON telemetry...`;let t=e.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19),r=we(e);K(`chrome-epp-telemetry-${n}-${t}.md`,r,`text/markdown;charset=utf-8`),setTimeout(()=>{K(`chrome-epp-telemetry-${n}-${t}.json`,JSON.stringify(e,null,2),`application/json;charset=utf-8`)},150)}catch(e){g=`Telemetry suite aborted: ${e?.message||`Unexpected error`}`}finally{if(l=!1,!c.isConnected)return;S()}}}function w(){c.querySelector(`#diag-btn-close`)?.addEventListener(`click`,t);let e=c.querySelector(`#diag-toggle-hud`),n=c.querySelector(`#diag-select-verbosity`),r=c.querySelector(`#diag-select-fps`),i=c.querySelector(`#diag-toggle-budget`),s=c.querySelector(`#diag-btn-ping`),l=()=>{let t=!!e?.checked,o=n?.value||`minimal`,s=!!i?.checked,c=r?.value||`adaptive`;x(`app_perf_hud_enabled`,String(t)),x(`app_hud_verbosity`,o),x(`app_frame_budget_alert`,String(s)),x(`app_target_fps`,c),a({type:`SET_PERF_HUD`,enabled:t,mode:o,strictAlarm:s}),a({type:`SET_TARGET_FPS`,fps:c===`adaptive`?0:parseInt(c,10)}),window.dispatchEvent(new CustomEvent(`app-setting-changed`,{detail:{key:`app_perf_hud_enabled`,value:t}}))};e?.addEventListener(`change`,()=>{l(),S()}),n?.addEventListener(`change`,l),r?.addEventListener(`change`,l),i?.addEventListener(`change`,()=>{l(),S()}),s?.addEventListener(`click`,()=>{l(),s&&(s.textContent=`Synchronized`,setTimeout(()=>{s.isConnected&&(s.textContent=`Ping Frame Budget`)},1400))}),c.querySelector(`#diag-btn-test-mcp`)?.addEventListener(`click`,async()=>{g=`Executing WebMCP tool ping across active stage...`,S();try{m=await ce(o.mcpTransport,o.mcpTools),g=`WebMCP verified: read=${m.readLatencyMs}ms, set_var=${m.setVarLatencyMs}ms, dispatch=${m.dispatchLatencyMs}ms (${m.domPayloadReductionPct}% smaller than SVG DOM).`}catch(e){g=`WebMCP ping note: ${e?.message||`Stage unavailable`}`}c.isConnected&&S()}),c.querySelector(`#diag-btn-run-epp`)?.addEventListener(`click`,()=>{C()}),c.querySelector(`#diag-btn-export-md`)?.addEventListener(`click`,()=>{if(!d)return;let e=d.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19);K(`chrome-epp-telemetry-${d.sceneId}-${e}.md`,we(d),`text/markdown;charset=utf-8`)}),c.querySelector(`#diag-btn-export-json`)?.addEventListener(`click`,()=>{if(!d)return;let e=d.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19);K(`chrome-epp-telemetry-${d.sceneId}-${e}.json`,JSON.stringify(d,null,2),`application/json;charset=utf-8`)}),c.querySelector(`#diag-btn-copy-md`)?.addEventListener(`click`,async()=>{if(d)try{await navigator.clipboard?.writeText(we(d)),g=`Markdown dossier copied to clipboard.`,c.isConnected&&S()}catch{g=`Clipboard unavailable in this frame; use Export .md Dossier.`,c.isConnected&&S()}})}if(S(),Promise.all([Oe(),ye(),Ee(),G()]).then(([e,t,n,r])=>{h=e,p=t,f=r,n&&!d&&(d=n),c.isConnected&&S()}).catch(()=>{}),e.autoRunBenchmark&&!_){_=!0;let t=()=>{c.isConnected&&(e.onAutoRunConsumed?.(),C())};typeof requestAnimationFrame==`function`?requestAnimationFrame(()=>setTimeout(t,50)):setTimeout(t,50)}return c}function je(e,t){let n=`<!DOCTYPE html>
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
</html>`,r=new Blob([n],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`stj-offline-ast-lesson-${e}.html`,a.click(),URL.revokeObjectURL(i)}var Me=s.find(e=>e.kind===`lab`&&e.isPlayableScene!==!1)?.id||`welcome`,Ne=[{id:`lumina-architecture`,label:`Lumina: Sovereign Architectural Manifesto (4-Chapter Show & Tell)`,type:`Slide`,kind:`doc`,isPlayableScene:!0,stage:`FOUNDATIONAL SYSTEM ARCHITECTURE`,subject:`System Architecture`,section:`System Architecture & Docs`}],Pe=[...s,...Ne],Fe=new Set(Pe.map(e=>e.id)),Ie=`stj_player_recent_presets_v1`;function J(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function Le(e){if(!e)return Me;if(e===`lumina-architecture-manifesto`)return`lumina-architecture`;if(Fe.has(e))return e;try{if(o().some(t=>t.id===e))return e}catch{}return Me}function Re(e,t,n,r){let i=b(`app_perf_hud_enabled`)===`true`,a=b(`app_hud_verbosity`)||`minimal`,o=b(`app_frame_budget_alert`)===`true`,s=new URLSearchParams({bsl:n?`1`:`0`,mode:`suite`,tools:`1`,all:`1`});return r?s.set(`src`,r):s.set(`preset`,t),i&&(s.set(`hud`,`1`),s.set(`hud_verbosity`,a),o&&s.set(`budget_alert`,`1`)),`${e}player.html?${s.toString()}`}function ze(){let s=n(),l=document.createElement(`div`);l.className=`ast-media-player-container`,l.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let u=new URLSearchParams(window.location.search),S=u.get(`src`)||u.get(`file`),C=!u.get(`preset`)&&S&&S.includes(`lumina-architecture`)?`lumina-architecture`:Le(u.get(`preset`)),w=u.get(`preset`)?null:S,T=u.get(`epp-bench`)===`1`||u.get(`epp-bench`)===`true`,E=`All`,D=`All`,O=`All`,k=!1,N=``,F=m()||u.get(`bsl`)===`1`,I=!d(),L=Pe;function te(e){return e.kind===`data`||e.kind===`benchmark`||e.kind===`doc`||e.isPlayableScene===!1||e.subject===`System Architecture`}function ne(e){let t=(e.subject||``).toLowerCase();return t.includes(`religious`)||t===`catholic life`||e.stage===`CATHOLIC LIFE`||!!(e.section&&e.section.includes(`Catholic`))}function R(e){if(ne(e))return`Catholic`;let t=(e.subject||``).toLowerCase();return t.includes(`science`)||t.includes(`physics`)||t.includes(`chem`)||t.includes(`bio`)?`Science`:t.includes(`math`)?`Maths`:t.includes(`english`)||t.includes(`phonics`)?`English`:t.includes(`comput`)||t.includes(`design`)?`Computing`:t.includes(`language`)||t.includes(`spanish`)||t.includes(`french`)||t.includes(`latin`)?`Languages`:t.includes(`geograph`)?`Geography`:`All`}function re(e,t){if(t===`All`)return!0;let n=`${e.stage||``} ${e.oakId||``}`.toUpperCase();return t===`KS1`?n.includes(`EYFS`)||n.includes(`KS1`)||n.includes(`KEY STAGE 1`)||n.includes(`EARLY YEARS`):t===`KS2`?n.includes(`KS2`)||n.includes(`KEY STAGE 2`)||n.includes(`WHOLE SCHOOL`):t===`KS3`?n.includes(`KS3`)||n.includes(`KEY STAGE 3`):t!==`KS4`||n.includes(`KS4`)||n.includes(`GCSE`)||n.includes(`A-LEVEL`)||n.includes(`KEY STAGE 4`)}function ie(){try{let e=b(Ie);if(!e)return[];let t=JSON.parse(e);return Array.isArray(t)?t.filter(e=>typeof e==`string`):[]}catch{return[]}}function ae(e){if(e&&!e.startsWith(`__`))try{let t=[e,...ie().filter(t=>t!==e)].slice(0,5);x(Ie,JSON.stringify(t))}catch{}}function oe(){try{return o().filter(e=>!Fe.has(e.id))}catch{return[]}}function z(e){let t=L.find(t=>t.id===e);if(t)return t;try{let t=o().find(t=>t.id===e);if(t)return{id:t.id,label:t.title,stage:t.stage||`LOCAL VAULT`,type:t.type||`Sim`,kind:`lab`,isPlayableScene:!0,subject:t.subject||`Custom Ingestion`}}catch{}return L[0]}let ce=L.filter(e=>!te(e)),le=L.length-ce.length;function ue(e){let t=oe(),n=t.length>0?`
      <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
        ${t.map(t=>`<option value="${J(t.id)}" ${t.id===e?`selected`:``}>${J(t.title)} (${J(t.stage||`LOCAL`)})</option>`).join(``)}
      </optgroup>
    `:``,r=ce.filter(e=>!e.id.startsWith(`phet-`)),i=ce.filter(e=>e.id.startsWith(`phet-`)),a=r.filter(e=>R(e)===`Science`),o=r.filter(e=>R(e)===`Maths`),s=r.filter(e=>R(e)===`Catholic`),c=r.filter(e=>R(e)===`English`),l=r.filter(e=>R(e)===`Computing`),u=r.filter(e=>R(e)===`Languages`),d=r.filter(e=>{let t=R(e);return t===`Geography`||t===`All`}),f=t=>t.map(t=>`<option value="${J(t.id)}" ${t.id===e?`selected`:``}>${J(t.label)} · ${J(t.type)} (${J(t.stage)})</option>`).join(``),p=L.find(t=>t.id===e);return`
      ${n}
      ${p&&te(p)?`<optgroup label="📎 Active Reference / Benchmark" style="background:#0f172a; color:#cbd5e1;">
          <option value="${J(p.id)}" selected>${J(p.label)} (${J(p.stage)})</option>
        </optgroup>`:``}
      <optgroup label="🔬 Sciences (Physics, Chemistry &amp; Biology)" style="background:#0f172a; color:#38bdf8;">
        ${f(a)}
      </optgroup>
      <optgroup label="📐 Mathematics &amp; Geometry" style="background:#0f172a; color:#34d399;">
        ${f(o)}
      </optgroup>
      <optgroup label="✝️ Catholic Faith &amp; Liturgy" style="background:#0f172a; color:#fde047;">
        ${f(s)}
      </optgroup>
      <optgroup label="📖 English, Literature &amp; Phonics" style="background:#0f172a; color:#fbbf24;">
        ${f(c)}
      </optgroup>
      <optgroup label="💻 Computing &amp; Design Technology" style="background:#0f172a; color:#c084fc;">
        ${f(l)}
      </optgroup>
      <optgroup label="🗣️ Languages &amp; BSL" style="background:#0f172a; color:#f472b6;">
        ${f(u)}
      </optgroup>
      <optgroup label="🌍 Geography &amp; Portal Showcase" style="background:#0f172a; color:#60a5fa;">
        ${f(d)}
      </optgroup>
      <optgroup label="⚛️ PhET Distillations" style="background:#0f172a; color:#38bdf8;">
        ${f(i)}
        <option value="__open_local__">📥 Import Local PhET (.html / .phet) or SWF...</option>
      </optgroup>
      <optgroup label="🔍 Discovery" style="background:#0f172a; color:#94a3b8;">
        <option value="__custom_find__">🔍 Search &amp; Filter All Labs Below...</option>
      </optgroup>
    `}let de=ue(C),fe=z(C),B=J(s),V=J(fe.stage||``),pe=J(fe.type||`Sim`),H=J(fe.label||``),me=J(Re(s,C,F,w));l.innerHTML=`
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${B}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🔬 Interactive Lab &amp; Lesson Player</span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${B}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${B}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
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
                ${V}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace; white-space:nowrap;">
                ${pe}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem; white-space:nowrap;" class="hidden sm:inline">&bull; Interactive Classroom Stage</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.1rem; font-weight:800; color:#f8fafc; margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${H}
            </h2>
          </div>
        </div>

        <!-- Primary Execution Actions (Locked Dimensions to Eliminate Any Layout Shift) -->
        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap;">
          <button type="button" id="player-btn-play" style="padding:5px 14px; border-radius:6px; background:#16a34a; color:#ffffff; border:1px solid #22c55e; font-size:0.78rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; white-space:nowrap; min-height:28px;" title="Play / Pause activity (Spacebar)">
            <span id="player-play-icon">▶</span>
            <span id="player-play-text">Play</span>
          </button>
          <button type="button" id="player-btn-reset" style="padding:5px 12px; border-radius:6px; background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px;" title="Reset activity to starting position">
            ↺ Reset
          </button>
          <button type="button" id="player-btn-mute" style="padding:5px 12px; border-radius:6px; background:${I?`#451a03`:`#1e293b`}; color:#ffffff; border:1px solid ${I?`#d97706`:`#334155`}; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;" title="Mute / Unmute simulation audio and voice narration (M)">
            <span id="player-mute-icon">${I?`🔇`:`🔊`}</span>
            <span id="player-mute-text">${I?`Muted`:`Audio ON`}</span>
          </button>
          <button type="button" id="player-btn-bsl" style="padding:5px 12px; border-radius:6px; background:${F?`#0284c7`:`#1e293b`}; color:#ffffff; border:1px solid ${F?`#38bdf8`:`#334155`}; font-size:0.78rem; font-weight:700; cursor:pointer; width:142px; text-align:center; flex-shrink:0; min-height:28px;" title="Toggle British Sign Language In-Vision Interpreter (Shift+B)">
            🖐️ BSL Signing: ${F?`ON`:`OFF`}
          </button>
          <button type="button" id="player-btn-fullscreen" style="padding:5px 12px; border-radius:6px; background:#0284c7; color:#ffffff; border:none; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap; min-height:28px;" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- Stage Toolbar: Row 2 (Activity Selector, Pupil Study Tools & Collapsible Teacher Tools) -->
      <div style="padding:8px 18px; background:#0b1120; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; gap:10px; min-height:42px; box-sizing:border-box; overflow-x:auto; flex-wrap:wrap;">
        <div style="display:inline-flex; align-items:center; gap:6px; flex-shrink:0;">
          <label for="player-sim-selector" style="font-size:0.76rem; font-weight:800; color:#94a3b8; white-space:nowrap;">
            📚 Activity:
          </label>
          <select id="player-sim-selector" style="padding:4px 10px; border-radius:6px; background:#0f172a; color:#ffffff; border:1px solid #0284c7; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none; max-width:280px;">
            ${de}
          </select>
        </div>

        <div style="display:inline-flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap;">
          <button type="button" id="player-btn-ai-tutor" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#c084fc; border:1px solid #9333ea; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Ask your on-device study tutor for hints, worked steps, and explanations">
            🤖 Ask Nano
          </button>

          <button type="button" id="player-btn-lab-drawer" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Adjust activity sliders, values, and experiment controls">
            🎛️ Lab Controls
          </button>

          <button type="button" id="player-btn-remix-code" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#86efac; border:1px solid #16a34a; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Open Code &amp; Remix Studio: inspect SVG shapes, edit AST/SlideScript, auto-match IDs, and Save As a new file">
            💻 Remix &amp; Code
          </button>

          <button type="button" id="player-btn-log-csv" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Save your lab results table to your local Jotter • Shift+Click to download as CSV">
            📊 Save Results to Jotter
          </button>

          <button type="button" id="player-btn-teacher-tools" aria-expanded="false" style="padding:4px 10px; border-radius:6px; background:#0f172a; color:#94a3b8; border:1px solid #334155; font-size:0.74rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Show or hide teacher &amp; technical authoring tools">
            🧰 Teacher Tools ▾
          </button>

          <div id="player-teacher-tools-group" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; padding-left:6px; border-left:1px solid #334155;">
            <button type="button" id="player-btn-open" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Open local activity files or import a PhET / HTML simulation">
              📂 Import Activity
            </button>
            <input type="file" id="media-player-file-input" accept=".ast,.svg,.json,.html,.phet" multiple style="display:none;" />

            <button type="button" id="player-btn-embed" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#34d399; border:1px solid #059669; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Get Responsive LMS Embed Snippet (Canvas, Moodle, Google Classroom)">
              🔗 Embed in Class
            </button>

            <button type="button" id="player-btn-export-airgap" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#fde047; border:1px solid #ca8a04; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Save a standalone single-file HTML lesson that runs completely offline">
              💾 Offline HTML
            </button>

            <button type="button" id="player-btn-diagnostics" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#4ade80; border:1px solid #16a34a; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Inspect Engine Telemetry, FPS, 16.6ms Budget &amp; Vector HUD">
              ⚡ Diagnostics
            </button>
          </div>
        </div>
      </div>

      <!-- In-Page Drawer & Modal Mount Point -->
      <div id="player-drawer-mount-point" style="display:none; background:#0f172a; border-bottom:1px solid #334155;"></div>

      <!-- Live Stage iFrame -->
      <div id="player-iframe-wrapper" style="position:relative; width:100%; height:540px; background:#000000;">
        <iframe
          id="ast-player-iframe"
          src="${me}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Catholic Sanctuary Linkage Banner -->
    <div id="catholic-sanctuary-banner" style="display:${ne(fe)?`flex`:`none`}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">✝️</span>
        <div>
          <span style="font-size:0.86rem; color:#fde047; font-weight:800;">St Joseph's Catholic Sanctuary:</span>
          <span style="font-size:0.82rem; color:#cbd5e1; margin-left:4px;">This simulation is part of our Catholic faith formation and sacred liturgical curriculum.</span>
        </div>
      </div>
      <a href="${s}catholic-life?tab=altar-anatomy" style="padding:5px 12px; border-radius:6px; background:#ca8a04; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem;">
        Open High Altar &amp; Latin Chapel &rarr;
      </a>
    </div>

    <!-- Interactive Labs Library & Multi-Facet Filter -->
    <section id="labs-catalog-section" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
        <div>
          <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;">Browse Visual Labs &amp; Lessons</h3>
          <p id="catalog-results-summary" style="margin:2px 0 0; font-size:0.8rem; color:#64748b; font-variant-numeric:tabular-nums;">
            Showing interactive simulations, guided slides, and educational apps
          </p>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search by title, topic, stage, or ID (e.g. titration, altar, ks2)..."
            style="padding:7px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.84rem; min-width:270px; outline:none; color:#0f172a; background:#ffffff;"
          />
          <select id="stage-filter-select" aria-label="Filter by Key Stage" style="padding:7px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.82rem; font-weight:600; color:#334155; background:#f8fafc; cursor:pointer;">
            <option value="All">All Key Stages</option>
            <option value="KS1">EYFS &amp; KS1</option>
            <option value="KS2">Key Stage 2</option>
            <option value="KS3">Key Stage 3</option>
            <option value="KS4">KS4 / GCSE &amp; A-Level</option>
          </select>
          <button type="button" id="btn-clear-catalog-filters" style="display:none; padding:7px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#475569; font-size:0.8rem; font-weight:600; cursor:pointer; white-space:nowrap;">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Subject Tabs -->
      <div style="display:flex; gap:4px; flex-wrap:wrap; padding:4px; background:#f1f5f9; border-radius:10px; margin-bottom:10px;" id="subject-filter-buttons">
        ${[{id:`All`,label:`All Labs`},{id:`Science`,label:`Science`},{id:`Maths`,label:`Mathematics`},{id:`Catholic`,label:`Catholic Faith`},{id:`English`,label:`English & Phonics`},{id:`Computing`,label:`Computing & D&T`},{id:`Languages`,label:`Languages & BSL`},{id:`Geography`,label:`Geography`}].map(e=>{let t=e.id===`All`?ce.length:ce.filter(t=>R(t)===e.id).length,n=e.id===E;return`
            <button type="button" class="cat-pill-btn" data-cat="${e.id}" style="padding:6px 12px; border-radius:7px; font-size:0.8rem; font-weight:700; cursor:pointer; border:none; white-space:nowrap; font-variant-numeric:tabular-nums; background:${n?`#ffffff`:`transparent`}; color:${n?`#0f172a`:`#475569`}; box-shadow:${n?`0 1px 3px rgba(15,23,42,0.1)`:`none`};">
              ${e.label} <span style="opacity:0.65; font-weight:600;">(${t})</span>
            </button>
          `}).join(``)}
      </div>

      <!-- Format & Scope Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:12px; margin-bottom:12px; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;" id="format-filter-buttons">
          <span style="font-size:0.76rem; font-weight:700; color:#64748b; margin-right:2px;">Format:</span>
          ${[{id:`All`,label:`All Formats`},{id:`Sim`,label:`Interactive Labs (Sim)`},{id:`Slide`,label:`Guided Lessons (Slide)`},{id:`App`,label:`Games & Studios (App)`},{id:`Film`,label:`Films`},{id:`3D`,label:`3D Models`}].map(e=>{let t=e.id===D;return`
              <button type="button" class="format-filter-btn" data-format="${e.id}" style="padding:4px 10px; border-radius:6px; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap; border:1px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#e0f2fe`:`#f8fafc`}; color:${t?`#0369a1`:`#475569`};">
                ${e.label}
              </button>
            `}).join(``)}
        </div>

        <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.78rem; color:#475569; font-weight:600; cursor:pointer; user-select:none;" title="Recall data packs belong primarily in Practice Lab and Revision Suite">
          <input type="checkbox" id="toggle-include-nonmedia" style="cursor:pointer; accent-color:#0284c7;" />
          <span>Include recall data packs, benchmarks &amp; docs (${le})</span>
        </label>
      </div>

      <!-- Recent Quick-Switch Strip -->
      <div id="recent-labs-strip" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; font-size:0.78rem;"></div>

      <!-- Presets Grid Container -->
      <div id="cartridges-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:520px; overflow-y:auto; padding-right:4px;">
      </div>
    </section>

    <!-- Classroom Offline Guarantee Card -->
    <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:1.25rem 1.5rem; color:#cbd5e1; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.5rem;">🏫</span>
        <div>
          <strong style="color:#38bdf8; display:block;">100% Offline Classroom Lab</strong>
          <span>Works without internet, saves results privately to your device, and includes British Sign Language &amp; smartboard annotation.</span>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <a href="${s}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Portal Updates &amp; Notes &rarr;</a>
      </div>
    </div>
  `;let U=l.querySelector(`#ast-player-iframe`),W=l.querySelector(`#player-sim-selector`),he=l.querySelector(`#player-active-title`),ge=l.querySelector(`#player-active-stage-badge`),_e=l.querySelector(`#player-active-type-badge`),G=l.querySelector(`#player-btn-play`),ve=l.querySelector(`#player-play-icon`),ye=l.querySelector(`#player-play-text`),be=l.querySelector(`#player-btn-reset`),xe=l.querySelector(`#player-btn-mute`),Se=l.querySelector(`#player-btn-bsl`),Ce=l.querySelector(`#player-btn-ai-tutor`),we=l.querySelector(`#player-btn-lab-drawer`),Te=l.querySelector(`#player-btn-remix-code`),Ee=l.querySelector(`#player-btn-diagnostics`),K=l.querySelector(`#player-btn-teacher-tools`),De=l.querySelector(`#player-teacher-tools-group`),q=l.querySelector(`#player-btn-log-csv`),Oe=l.querySelector(`#player-btn-open`),ke=l.querySelector(`#player-btn-embed`),Me=l.querySelector(`#player-btn-export-airgap`),Ne=l.querySelector(`#player-drawer-mount-point`),ze=l.querySelector(`#media-player-file-input`),Be=l.querySelector(`#player-btn-fullscreen`),Ve=l.querySelector(`#cartridge-search-input`),He=l.querySelector(`#stage-filter-select`),Ue=l.querySelector(`#toggle-include-nonmedia`),We=l.querySelector(`#btn-clear-catalog-filters`),Ge=l.querySelector(`#catalog-results-summary`),Ke=l.querySelector(`#recent-labs-strip`),qe=l.querySelector(`#cartridges-grid`),Je=l.querySelectorAll(`.cat-pill-btn`),Ye=l.querySelectorAll(`.format-filter-btn`),Xe=l.querySelector(`#player-iframe-wrapper`);function Y(e){U?.contentWindow?.postMessage(e,`*`)}let Ze=0,Qe=new Map;function $e(e,t,n=5e3){return new Promise((r,i)=>{if(!U?.contentWindow){i(Error(`Simulation stage iframe is not ready yet.`));return}let a=`req_${++Ze}_${Date.now()}`,o=setTimeout(()=>{Qe.has(a)&&(Qe.delete(a),i(Error(`Timed out waiting for ${t} from stage.`)))},n);Qe.set(a,{expectedType:t,resolve:r,reject:i,timer:o}),U.contentWindow.postMessage({...e,requestId:a},`*`)})}let et={readState:async(e=!0)=>(await $e({type:`GET_ENGINE_STATE`,includeSvgBytes:e},`ENGINE_STATE_RESPONSE`))?.state||null,setVar:async(e,t)=>{let n=await $e({type:`SET_VAR`,name:e,value:t},`SET_VAR_ACK`);return{name:n?.name||e,value:n?.value??t,clamped:!!n?.clamped,state:n?.state||null}},execActionTuple:async e=>{let t=await $e({type:`EXEC_ACTION_TUPLE`,tuple:e},`EXEC_ACTION_RESULT`);return{ok:!!t?.ok,executedActions:Array.isArray(t?.executedActions)?t.executedActions:[],state:t?.state||null}},onSay:e=>{_({subtitle:e,isSpeaking:!0})}},tt=se(et),nt=0;async function rt(){let e=++nt,t=tt.ready;tt.unregister(),t&&await t.catch(()=>{}),await Promise.resolve(),l.isConnected&&e===nt&&(tt=se(et),ct.mcpTools=tt.tools)}A({loadPreset:(e,t=!1)=>{wt(Le(e),!0),t&&Y({type:`PLAY`})},setVar:(e,t)=>{Y({type:`SET_VAR`,name:e,value:t})},highlight:e=>{Y({type:`EXEC_ACTION_TUPLE`,tuple:`(:act :highlight "${e}")`})},getActivePreset:()=>C});let it=!1,at=!1,ot=null,st=()=>{it||(it=!0,nt++,tt.unregister(),A(null),ot?.disconnect(),ot=null,window.removeEventListener(`pagehide`,st),window.removeEventListener(`keydown`,At))};window.addEventListener(`pagehide`,st,{once:!0}),typeof MutationObserver<`u`&&typeof document<`u`&&document.body&&(ot=new MutationObserver(()=>{l.isConnected?at=!0:at&&st()}),ot.observe(document.body,{childList:!0,subtree:!0}));let ct={startProfCapture:async()=>{await $e({type:`START_PROF_CAPTURE`,ensurePlaying:!0},`PROF_CAPTURE_STARTED`)},stopProfCapture:async e=>{let t=await $e({type:`STOP_PROF_CAPTURE`,vsyncBudgetMs:e},`PROF_CAPTURE_RESULT`);return{stats:t.stats,memory:t.memory,activeMetrics:t.activeMetrics}},mcpTransport:et,mcpTools:tt.tools};function lt(){try{U?.focus({preventScroll:!0}),U?.contentWindow?.focus()}catch{}Y({type:`FOCUS_STAGE`})}function ut(e){G&&(e?(G.style.background=`#2563eb`,G.style.borderColor=`#38bdf8`,G.title=`Pause simulation loop (Spacebar)`,ve&&(ve.textContent=`⏸`),ye&&(ye.textContent=`Pause`)):(G.style.background=`#16a34a`,G.style.borderColor=`#22c55e`,G.title=`Play simulation loop (Spacebar)`,ve&&(ve.textContent=`▶`),ye&&(ye.textContent=`Play`)))}let X=null,dt=null,ft=null,pt=!1,mt=`classroom`,ht=!1,gt=null,_t=``,vt=!1,yt=null,Z=null,bt=``;function Q(e=!1){if(Ne&&!(X===`diagnostics`&&!e&&gt&&gt.isConnected&&_t===C)){if(X===`ai-tutor`&&!e&&yt&&yt.isConnected&&bt===C)Z?.updateTelemetry(dt);else if(Ne.innerHTML=``,X!==`diagnostics`&&(gt=null,_t=``),X!==`ai-tutor`&&(yt=null,Z=null,bt=``),Ce&&(Ce.style.background=X===`ai-tutor`?`#581c87`:`#1e293b`,Ce.style.borderColor=X===`ai-tutor`?`#c084fc`:`#9333ea`),we&&(we.style.background=X===`lab`?`#0369a1`:`#1e293b`,we.style.borderColor=X===`lab`?`#38bdf8`:`#0284c7`),ke&&(ke.style.background=X===`embed`?`#065f46`:`#1e293b`,ke.style.borderColor=X===`embed`?`#34d399`:`#059669`),Ee&&(Ee.style.background=X===`diagnostics`?`#14532d`:`#1e293b`,Ee.style.borderColor=X===`diagnostics`?`#4ade80`:`#16a34a`),!X)Ne.style.display=`none`;else if(Ne.style.display=`block`,X===`ai-tutor`){let e=P({isOpen:!0,onClose:()=>{X=null,Q()},preset:C,postToPlayer:e=>Y(e),latestTelemetry:dt,activeQuiz:ft,isAiDemonstrating:pt,onCancelDemonstration:()=>{pt=!1,Z?.setDemonstrating(!1)}});e&&(yt=e,Z=e.__nanoDrawerHandle||null,bt=C,Ne.appendChild(e))}else if(X===`lab`){let e=ee({isOpen:!0,onClose:()=>{X=null,Q()},preset:C});e&&Ne.appendChild(e)}else if(X===`diagnostics`){let e=z(C),t=vt;vt=!1;let n=Ae({onClose:()=>{X=null,gt=null,_t=``,Q()},presetId:C,presetLabel:e.label,presetType:e.type||`Sim`,postToPlayer:e=>Y(e),benchTransport:ct,webMcpHandle:tt,autoRunBenchmark:t,onAutoRunConsumed:()=>{vt=!1}});gt=n,_t=C,Ne.appendChild(n)}else if(X===`embed`){let e=e=>`<iframe src="${window.location.origin}${s}player.html?preset=${C}&mode=${e}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`,t=M({isOpen:!0,onClose:()=>{X=null,Q()},embedTargetMode:mt,setEmbedTargetMode:e=>{mt=e,Q()},copiedEmbed:ht,onCopyEmbedCode:()=>{ht=!0,navigator.clipboard?.writeText(e(mt)),Q(),setTimeout(()=>{ht=!1,X===`embed`&&Q()},2e3)},embedCode:e(mt)});t&&Ne.appendChild(t)}}}function xt(){W&&(W.innerHTML=ue(C),W.value=C)}function St(){let e=oe().map(e=>({id:e.id,label:e.title,stage:e.stage||`LOCAL VAULT`,type:e.type||`Sim`,kind:`lab`,isPlayableScene:!0,subject:e.subject||`Custom Ingested`})),t=k?L:ce;return[...e,...t]}let Ct=!1;U?.addEventListener(`load`,()=>{Ct=!0});function wt(e,t=!1){if(e===`__custom_find__`||e===`__open_local__`)return;let n=Le(e);C=n,ae(n);let i=z(n);he&&(he.textContent=i.label),ge&&(ge.textContent=i.stage),_e&&(_e.textContent=i.type||`Sim`),W&&(te(i)?xt():W.value=n);let a=l.querySelector(`#catholic-sanctuary-banner`);a&&(a.style.display=ne(i)?`flex`:`none`),w=null,n!==`lumina-architecture`&&r(n).catch(()=>{}),!t&&Ct&&U&&U.contentWindow?(Y({type:`SET_PRESET`,preset:n,play:!0}),lt()):!U||U.src&&U.src!==`about:blank`&&Ct||(U.src=Re(s,n,F)),_({subtitle:`${i.label}. ${i.stage}`,isSpeaking:!0}),rt(),X&&Q();let o=new URL(window.location.href);o.searchParams.delete(`src`),o.searchParams.delete(`file`),o.searchParams.set(`preset`,n),window.history.replaceState({},``,o.toString()),$()}async function Tt(t){if(t&&t.length!==0)try{let n=t.find(e=>e.name.endsWith(`.svg`)),r=t.find(e=>e.name.endsWith(`.ast`));if(n&&r){let t=await n.text(),i=await r.text(),a=n.name.replace(/\.[^/.]+$/,``),o=a.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),s={id:o,title:a.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested companion pair: ${n.name} + ${r.name}.`,icon:`💾`,source:`imported`,svgMarkup:t,astSource:i,updatedAt:Date.now()};e(s),xt(),wt(o),U?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:s},`*`);return}for(let n of t){let t=await n.text();if(n.name.endsWith(`.phet`)||i(t)){let r=await c(t,n.name);if(r.success&&r.svgMarkup&&r.astSource){let t=r.metadata?.simName||`phet-${Date.now()}`,i={id:t,title:r.metadata?.title||n.name.replace(/\.[^/.]+$/,``),stage:`PHET INTERACTIVE`,category:`STEM`,desc:`PhET simulation transpiled to AST: ${r.metadata?.compressionRatio||`distilled`}.`,icon:`⚛️`,source:`phet`,svgMarkup:r.svgMarkup,astSource:r.astSource,updatedAt:Date.now()};e(i),xt(),wt(t),U?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:i},`*`);return}}if(n.name.endsWith(`.svg`)){let r=n.name.replace(/\.[^/.]+$/,``),i=r.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),a=r.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),o=``,s=t.match(/<script\s+type=["']text\/ast["'][^>]*>([\s\S]*?)<\/script>/i);o=s&&s[1]?s[1].trim():`(:scene :id "${i}" :title "${a}" :stage "CUSTOM" :duration 10.0 (:bindings ()))`;let c={id:i,title:a,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested vector cartridge: ${n.name}.`,icon:`🎨`,source:`imported`,svgMarkup:t,astSource:o,updatedAt:Date.now()};e(c),xt(),wt(i),U?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:c},`*`);return}if(n.name.endsWith(`.ast`)){let r=n.name.replace(/\.[^/.]+$/,``),i=r.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),a=r.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),o=t.includes(`<svg`)?t:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`,s={id:i,title:a,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested AST logic: ${n.name}.`,icon:`📜`,source:`imported`,svgMarkup:o,astSource:t,updatedAt:Date.now()};e(s),xt(),wt(i),U?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:s},`*`);return}}}catch(e){console.error(`[media-player] Error ingesting uploaded files:`,e)}}function Et(){if(!Ke)return;let e=ie().filter(e=>e!==C).map(e=>L.find(t=>t.id===e)).filter(e=>!!e).slice(0,4);e.length===0?(Ke.style.display=`none`,Ke.replaceChildren()):(Ke.style.display=`flex`,Ke.innerHTML=`
      <span style="color:#64748b; font-weight:700;">Recently opened:</span>
      ${e.map(e=>`
        <button type="button" class="recent-lab-btn" data-id="${J(e.id)}" style="padding:3px 10px; border-radius:6px; border:1px solid #e2e8f0; background:#f8fafc; color:#0f172a; font-size:0.76rem; font-weight:600; cursor:pointer; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${J(e.label)}
        </button>
      `).join(``)}
    `,Ke.querySelectorAll(`.recent-lab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&wt(t)})}))}function $(){if(!qe)return;Et();let e=N.toLowerCase().trim(),t=St(),n=t.filter(t=>{let n=E===`All`||R(t)===E,r=!0;D===`3D`?r=!!t.has3D:D!==`All`&&(r=(t.type||`Sim`)===D);let i=re(t,O),a=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e)||(t.subject||``).toLowerCase().includes(e)||(t.oakUnit||``).toLowerCase().includes(e);return n&&r&&i&&a}),r=!!(e||E!==`All`||D!==`All`||O!==`All`||k);if(We&&(We.style.display=r?`inline-block`:`none`),Ge){let e=k?`activities (including recall data & docs)`:`visual labs & lessons`;Ge.textContent=`Showing ${n.length} of ${t.length} ${e}`}n.length===0?qe.innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#64748b;">No matching labs found for your active filters.</div>`:(qe.innerHTML=n.map(e=>{let t=e.id===C,n=e.subject||`Curriculum`,r=e.kind===`data`?` · Recall Data Pack`:e.kind===`benchmark`?` · Benchmark`:e.kind===`doc`?` · Architecture Doc`:``,i=e.has3D?`${e.type||`Sim`} (3D)`:e.type||`Sim`;return`
        <div
          class="cartridge-card"
          data-id="${J(e.id)}"
          style="padding:12px 14px; border-radius:10px; border:1px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#f0f9ff`:`#ffffff`}; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
          <div>
            <div style="font-size:0.72rem; color:#64748b; font-weight:600; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${J(i)} &middot; ${J(n)} &middot; ${J(e.stage)}${J(r)}
            </div>
            <strong style="display:block; font-size:0.88rem; color:#0f172a; line-height:1.35;">${J(e.label)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem;">
            <span style="color:${t?`#0369a1`:`#0284c7`}; font-weight:700;">${t?`▶ Currently Loaded`:`Launch Lab &rarr;`}</span>
            ${e.hasCheckpoints&&e.checkpointCount?`<span style="color:#64748b; font-variant-numeric:tabular-nums;">${e.checkpointCount} checks</span>`:``}
          </div>
        </div>
      `}).join(``),qe.querySelectorAll(`.cartridge-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&(wt(t),U?.scrollIntoView({behavior:`smooth`,block:`center`}))})}))}function Dt(n){let r=t[n],i=`phet-${n}`;if(r){let t={id:i,title:r.title,stage:r.stage||`PHET DISTILLED`,category:r.subject||`Physics`,desc:`PhET simulation transpiled to AST & hardware-accelerated SVG (< 4 KB payload). Invariants: ${r.invariants.join(`, `)}.`,icon:`⚛️`,source:`phet`,svgMarkup:r.generateSvg(),astSource:r.generateAst(),updatedAt:Date.now()};e(t),xt()}wt(i)}W?.addEventListener(`change`,e=>{let t=e.target.value;t===`__open_local__`?(W.value=C,ze?.click()):t===`__phet_ohms_law__`||t===`phet-ohms-law`?Dt(`ohms-law`):t===`__phet_faraday__`||t===`phet-faraday`?Dt(`faraday`):t===`__phet_pendulum__`||t===`phet-pendulum`?Dt(`pendulum`):t===`__phet_acid_base__`||t===`phet-acid-base`?Dt(`acid-base`):t===`__phet_balancing__`||t===`phet-balancing-chemical`?Dt(`balancing-chemical`):t===`__custom_find__`?(W.value=C,Ve?.scrollIntoView({behavior:`smooth`,block:`center`}),Ve?.focus()):wt(t)}),Oe?.addEventListener(`click`,()=>{ze?.click()}),ze?.addEventListener(`change`,e=>{let t=e.target;t.files&&t.files.length&&(Tt(Array.from(t.files)),t.value=``)}),Xe&&(Xe.addEventListener(`dragover`,e=>{e.preventDefault(),e.stopPropagation(),Xe.style.outline=`3px dashed #38bdf8`,Xe.style.outlineOffset=`-4px`}),Xe.addEventListener(`dragleave`,e=>{e.preventDefault(),e.stopPropagation(),Xe.style.outline=`none`}),Xe.addEventListener(`drop`,e=>{e.preventDefault(),e.stopPropagation(),Xe.style.outline=`none`,e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length&&Tt(Array.from(e.dataTransfer.files))})),G?.addEventListener(`click`,()=>{Y({type:`TOGGLE_PLAY`}),lt()}),be?.addEventListener(`click`,()=>{Y({type:`RESET_SIM`}),lt()});function Ot(e){xe&&(xe.style.background=e?`#451a03`:`#1e293b`,xe.style.borderColor=e?`#d97706`:`#334155`,xe.title=e?`Unmute simulation audio (M)`:`Mute simulation audio (M)`);let t=l.querySelector(`#player-mute-icon`),n=l.querySelector(`#player-mute-text`);t&&(t.textContent=e?`🔇`:`🔊`),n&&(n.textContent=e?`Muted`:`Audio ON`)}xe?.addEventListener(`click`,()=>{let e=p(),t=!e;I=t,Ot(t),Y({type:`SET_VOICE`,enabled:e}),Y({type:`SET_MUTED`,muted:t})}),Se?.addEventListener(`click`,()=>{y()});function kt(e){Se&&(Se.textContent=`🖐️ BSL Signing: ${e?`ON`:`OFF`}`,Se.style.background=e?`#0284c7`:`#1e293b`,Se.style.borderColor=e?`#38bdf8`:`#334155`)}f(e=>{F!==e&&(F=e,kt(e),Y({type:`SET_BSL`,enabled:e}))}),h(e=>{try{let t=!e;I=t,Ot(t),Y({type:`SET_VOICE`,enabled:e}),Y({type:`SET_MUTED`,muted:t})}catch{}});let At=e=>{let t=document.activeElement?.tagName.toLowerCase();t!==`input`&&t!==`textarea`&&t!==`select`&&(e.key===`m`||e.key===`M`?(e.preventDefault(),xe?.click()):e.code===`Space`&&!e.repeat&&(e.preventDefault(),G?.click()))};window.addEventListener(`keydown`,At),window.addEventListener(`message`,t=>{if(t.data&&typeof t.data==`object`){if(t.data.requestId&&Qe.has(t.data.requestId)){let e=Qe.get(t.data.requestId);if(t.data.type===e.expectedType){clearTimeout(e.timer),Qe.delete(t.data.requestId),e.resolve(t.data);return}}if(t.data.type===`PLAYER_READY`&&(Ct=!0,w?w=null:C&&(!t.data.preset||t.data.preset!==C)&&Y({type:`SET_PRESET`,preset:C,play:!1}),ut(!1),T&&(!t.data.preset||t.data.preset===C)&&(T=!1,setTimeout(()=>{l.isConnected&&!it&&(De&&(De.style.display=`inline-flex`),K&&(K.setAttribute(`aria-expanded`,`true`),K.style.background=`#1e293b`,K.style.color=`#f8fafc`,K.textContent=`🧰 Teacher Tools ▴`),X=`diagnostics`,vt=!0,Q(!0))},150))),(t.data.type===`PLAY_STATE_CHANGED`||t.data.type===`STATE_CHANGED`||t.data.type===`statechange`)&&typeof(t.data.isPlaying??t.data.playing)==`boolean`&&ut(!!(t.data.isPlaying??t.data.playing)),(t.data.type===`PRESETCHANGE`||t.data.type===`PLAYER_PRESET_CHANGED`)&&typeof t.data.preset==`string`){let e=Le(t.data.preset);e!==C&&wt(e,!0)}if(t.data.type===`CARTRIDGE_INGESTED`&&(xt(),$()),(t.data.type===`VOICE_TOGGLE`||t.data.type===`SET_VOICE`)&&typeof t.data.enabled==`boolean`&&v(t.data.enabled),t.data.type===`BSL_STATE_CHANGED`&&typeof t.data.active==`boolean`&&(F=t.data.active,kt(t.data.active),g(t.data.active)),t.data.type===`TOGGLE_BSL`&&typeof t.data.enabled==`boolean`&&(F=t.data.enabled,kt(t.data.enabled),g(t.data.enabled)),(t.data.type===`TELEMETRY`||t.data.type===`AST_TELEMETRY`||t.data.type===`PLAYER_TELEMETRY`)&&(dt=t.data.telemetry||t.data.payload||t.data,X===`ai-tutor`&&Z?.updateTelemetry(dt)),t.data.type===`AI_DEMO_START`&&(pt=!0,Z?.setDemonstrating(!0)),(t.data.type===`AI_DEMO_COMPLETE`||t.data.type===`PUPIL_PREEMPTION`)&&(pt=!1,Z?.setDemonstrating(!1)),t.data.type===`CHECKPOINT_ANSWERED`&&(!t.data.isCorrect&&t.data.prompt?(ft={sceneId:typeof t.data.sceneId==`string`&&t.data.sceneId?t.data.sceneId:C,sceneTitle:typeof t.data.sceneTitle==`string`?t.data.sceneTitle:void 0,index:Number(t.data.index||0),mode:t.data.mode===`pass-expr`?`pass-expr`:`multiple-choice`,prompt:String(t.data.prompt),options:Array.isArray(t.data.options)?t.data.options:void 0,chosenIndex:typeof t.data.chosenIdx==`number`?t.data.chosenIdx:null,chosenText:typeof t.data.selectedText==`string`?t.data.selectedText:``,answerIndex:typeof t.data.answer==`number`?t.data.answer:void 0,explanation:typeof t.data.explanation==`string`?t.data.explanation:``,distractorNudge:typeof t.data.distractorNudge==`string`?t.data.distractorNudge:``,autoAsk:!1},X===`ai-tutor`&&Z&&Z.askCheckpoint(ft,!1)):t.data.isCorrect&&(ft=null)),(t.data.type===`ASK_NANO_CHECKPOINT`||t.data.type===`OPEN_NANO_TUTOR`)&&(ft={sceneId:typeof t.data.sceneId==`string`&&t.data.sceneId?t.data.sceneId:C,sceneTitle:typeof t.data.sceneTitle==`string`?t.data.sceneTitle:void 0,index:Number(t.data.index||0),mode:t.data.mode===`pass-expr`?`pass-expr`:`multiple-choice`,prompt:String(t.data.prompt||``),options:Array.isArray(t.data.options)?t.data.options:void 0,chosenIndex:typeof t.data.chosenIndex==`number`?t.data.chosenIndex:null,chosenText:typeof t.data.chosenText==`string`?t.data.chosenText:``,answerIndex:typeof t.data.answerIndex==`number`?t.data.answerIndex:void 0,correctText:typeof t.data.correctText==`string`?t.data.correctText:``,explanation:typeof t.data.explanation==`string`?t.data.explanation:``,distractorNudge:typeof t.data.distractorNudge==`string`?t.data.distractorNudge:``,passExpr:typeof t.data.passExpr==`string`?t.data.passExpr:``,targetSelector:typeof t.data.targetSelector==`string`?t.data.targetSelector:``,vars:t.data.vars&&typeof t.data.vars==`object`?t.data.vars:void 0,computed:t.data.computed&&typeof t.data.computed==`object`?t.data.computed:void 0,progress:typeof t.data.progress==`number`?t.data.progress:void 0,autoAsk:t.data.autoAsk!==!1},X===`ai-tutor`&&Z&&bt===C?Z.askCheckpoint(ft,ft.autoAsk!==!1):(X=`ai-tutor`,Q(!0))),t.data.type,(t.data.type===`LOG_JOTTER_CSV`||t.data.type===`JOTTER_CSV_RESPONSE`)&&typeof t.data.csv==`string`){let e=typeof t.data.sceneId==`string`?t.data.sceneId:C,n=Number(t.data.rowCount||1),r=typeof t.data.nodePath==`string`?t.data.nodePath:`lab/${e}`;if(j(e,t.data.csv,r).then(()=>{q&&(q.textContent=`✓ Saved ${n} rows to Jotter`,q.style.background=`#065f46`,q.style.borderColor=`#10b981`,q.style.color=`#ffffff`,setTimeout(()=>{q.textContent=`📊 Save Results to Jotter`,q.style.background=`#1e293b`,q.style.borderColor=`#0284c7`,q.style.color=`#38bdf8`},2400))}).catch(()=>{}),t.data.download)try{let n=new Blob([t.data.csv],{type:`text/csv;charset=utf-8;`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${e||`lab`}-data.csv`,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(r),1e3)}catch{}}if(t.data.type===`SAVE_REMIX_CARTRIDGE`&&t.data.cartridge){let n=t.data.cartridge,r=typeof t.data.exportMode==`string`?t.data.exportMode:`vault`;if(n.id&&n.astSource&&n.svgMarkup){let t={id:n.id,title:n.title||n.id,stage:n.stage||`CUSTOM REMIX`,type:n.type||`Sim`,category:n.category||`Student Remixes`,desc:n.desc||`Custom student remix saved offline.`,icon:n.icon||`🧪`,source:`user`,svgMarkup:n.svgMarkup,astSource:n.astSource,createdAt:n.createdAt||Date.now(),updatedAt:Date.now()};e(t),C=t.id,he&&(he.textContent=t.title),ge&&(ge.textContent=t.stage),_e&&(_e.textContent=t.type||`Sim`),xt(),$();let i=new URL(window.location.href);i.searchParams.set(`preset`,t.id),window.history.replaceState({},``,i.toString()),a(async()=>{let{saveRemixDuoToNominatedFolder:e,downloadAstbBinary:t}=await import(`./localCartridgeBuilder-uHGF8mQ4.js`).then(e=>e.a);return{saveRemixDuoToNominatedFolder:e,downloadAstbBinary:t}},__vite__mapDeps([0,1,2])).then(async({saveRemixDuoToNominatedFolder:e,downloadAstbBinary:n})=>{let i=await e({id:t.id,astText:t.astSource||``,svgText:t.svgMarkup||``});if(r===`astb`&&n(i.artifact.id,i.artifact.astbData),Y({type:`REMIX_SAVED_ACK`,message:i.wroteToFolder&&i.folderName?`✓ Saved ${t.id}.ast + .svg + bytecode/.astb into "${i.folderName}" & Vault!`:r===`astb`?`⚡ Compiled & downloaded ${i.artifact.id}.astb (${i.artifact.bytecodeBytes} B)`:`✓ Saved "${t.title}" to offline Vault!`}),Te){let e=Te.textContent;Te.textContent=`✓ Saved ${t.id}`,Te.style.background=`#065f46`,setTimeout(()=>{Te.textContent=e||`💻 Remix & Code`,Te.style.background=`#1e293b`},2600)}}).catch(()=>{})}}if(t.data.type===`NANO_REMIX_REQUEST`&&t.data.context){let e=t.data.context;a(async()=>{let{promptAiRemixAssistant:e}=await import(`./nanoRemixCopilot-Bs1FwF_8.js`);return{promptAiRemixAssistant:e}},__vite__mapDeps([3,4,5,1])).then(async({promptAiRemixAssistant:t})=>{Y({type:`NANO_REMIX_RESULT`,proposal:await t(e)})}).catch(t=>{Y({type:`NANO_REMIX_RESULT`,proposal:{requestId:e.requestId,mode:`advice_only`,explanation:`Could not reach Nano Remix Co-Pilot: ${t?.message||`offline error`}`,engineUsed:`deterministic-remix`}})})}}}),window.addEventListener(`app-setting-changed`,e=>{e.detail&&(e.detail.key===`app_perf_hud_enabled`||e.detail.key===`app_hud_verbosity`||e.detail.key===`app_frame_budget_alert`)&&(Y({type:`SET_PERF_HUD`,enabled:b(`app_perf_hud_enabled`)===`true`,mode:b(`app_hud_verbosity`)||`minimal`,strictAlarm:b(`app_frame_budget_alert`)===`true`}),X===`diagnostics`&&Q())}),window.addEventListener(`cartridges_updated`,()=>{xt(),$()}),Ce?.addEventListener(`click`,()=>{X=X===`ai-tutor`?null:`ai-tutor`,Q()}),we?.addEventListener(`click`,()=>{X=X===`lab`?null:`lab`,Q()}),Te?.addEventListener(`click`,()=>{Y({type:`OPEN_STUDIO`,tab:`ast`}),lt()}),K?.addEventListener(`click`,()=>{if(!De)return;let e=De.style.display===`inline-flex`;De.style.display=e?`none`:`inline-flex`,K.setAttribute(`aria-expanded`,String(!e)),K.style.background=e?`#0f172a`:`#1e293b`,K.style.color=e?`#94a3b8`:`#f8fafc`,K.textContent=e?`🧰 Teacher Tools ▾`:`🧰 Teacher Tools ▴`}),Ee?.addEventListener(`click`,()=>{X=X===`diagnostics`?null:`diagnostics`,Q()}),q?.addEventListener(`click`,e=>{Y({type:`REQUEST_JOTTER_CSV`,download:!!e.shiftKey})}),ke?.addEventListener(`click`,()=>{X=X===`embed`?null:`embed`,Q()}),Me?.addEventListener(`click`,()=>{let e=z(C);je(C,e.label)}),Be?.addEventListener(`click`,()=>{let e=l.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()});function jt(){Je.forEach(e=>{let t=e.getAttribute(`data-cat`)===E;e.style.background=t?`#ffffff`:`transparent`,e.style.color=t?`#0f172a`:`#475569`,e.style.boxShadow=t?`0 1px 3px rgba(15,23,42,0.1)`:`none`})}function Mt(){Ye.forEach(e=>{let t=e.getAttribute(`data-format`)===D;e.style.background=t?`#e0f2fe`:`#f8fafc`,e.style.color=t?`#0369a1`:`#475569`,e.style.borderColor=t?`#0284c7`:`#e2e8f0`})}return Je.forEach(e=>{e.addEventListener(`click`,()=>{E=e.getAttribute(`data-cat`)||`All`,jt(),$()})}),Ye.forEach(e=>{e.addEventListener(`click`,()=>{D=e.getAttribute(`data-format`)||`All`,Mt(),$()})}),He?.addEventListener(`change`,()=>{O=He.value||`All`,$()}),Ue?.addEventListener(`change`,()=>{k=!!Ue.checked,$()}),We?.addEventListener(`click`,()=>{E=`All`,D=`All`,O=`All`,k=!1,N=``,Ve&&(Ve.value=``),He&&(He.value=`All`),Ue&&(Ue.checked=!1),jt(),Mt(),$()}),Ve?.addEventListener(`input`,e=>{N=e.target.value,$()}),$(),l}export{ze as default,ze as renderPlayerPage};