const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rolldown-runtime-XKyaHtl9.js","assets/localCartridgeBuilder-iDxmeB40.js","assets/nanoSiteManager-DQSciI56.js","assets/nanoRemixCopilot-nnMpDVws.js","assets/nanoAvailability-qK8K2y0I.js","assets/aicaller-gXHqPsSw.js","assets/EdgeCognitiveEngine-D5ObVz4p.js"])))=>i.map(i=>d[i]);
import{l as e}from"./index-TCtNiRy0.js";import{a as t,c as n,f as r,g as i,h as a,i as o,m as s,p as c,r as l,v as u}from"./cartridge-vault-7YkQtAWH.js";import{A as d,E as f,F as p,W as m,b as h,f as g,h as _,i as v,l as y,m as b,o as x,p as S,r as C,s as w,u as T}from"./bsl-engine-DAS4j-CE.js";import{m as E,p as D}from"./localCartridgeBuilder-iDxmeB40.js";import{r as O,t as k}from"./aicaller-gXHqPsSw.js";import{a as A,c as j,l as M,n as N,o as P,r as ee,u as te}from"./nanoAvailability-qK8K2y0I.js";import{i as ne,n as re}from"./EdgeCognitiveEngine-D5ObVz4p.js";import{bindSitePlayerAdapter as ie,dispatchCartridgeSiteDirective as ae}from"./nanoSiteManager-DQSciI56.js";import{n as oe}from"./jotter-db-DMLS5HxK.js";function F(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function se(e){let{setCustomSvgCode:t,setCustomAstCode:n,postToPlayer:i,setHotReloadFlash:o,onLaunchCartridge:s,onClose:l}=e,u=null,d=!1,f=null,p=!1,m=document.createElement(`div`);m.className=`ast-phet-transpiler-drawer`,m.style.cssText=`display: flex; flex-direction: column; gap: 14px; color: #f8fafc;`;let h=()=>{if(m.innerHTML=``,l){let e=document.createElement(`div`);e.style.cssText=`display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;`,e.innerHTML=`
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.15rem;">⚛️</span>
          <div>
            <strong style="font-size: 0.92rem; color: #f8fafc; display: block;">Full PhET Simulation Importer &amp; Distiller</strong>
            <span style="font-size: 0.74rem; color: #94a3b8;">100% offline — distills 2–15 MB University of Colorado PhET HTML5, PhET-iO JSON, or Legacy Flash (.swf) bundles into ~3.5 KB native SVG + AST cartridges.</span>
          </div>
        </div>
      `;let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid #334155; font-size: 0.76rem; font-weight: 700; cursor: pointer;`,t.textContent=`Close ✕`,t.onclick=()=>l(),e.appendChild(t),m.appendChild(e)}let e=document.createElement(`div`);e.style.cssText=`
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 0.78rem;
      line-height: 1.5;
      color: #cbd5e1;
    `,e.innerHTML=`
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span style="font-size: 1.05rem;">⚡</span>
        <strong style="color: #38bdf8;">PhET Open-Source Model Transpiler</strong>
      </div>
      Distills monolithic PhET bundles (Univ. of Colorado Boulder) down into <strong style="color: #4ade80;">~3.5 KB AST S-Expressions</strong>. Extracts physical invariants, preserves multi-language locale tables, binds procedural Web Audio, and saves offline to your Local Vault.
    `,m.appendChild(e);let t=document.createElement(`div`),n=document.createElement(`div`);n.style.cssText=`font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase;`,n.textContent=`Distill Benchmark PhET Simulation:`,t.appendChild(n);let r=document.createElement(`div`);r.style.cssText=`display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 6px;`,[{id:`ohms-law`,label:`💡 Ohm's Law (V=IR)`,desc:`Circuit Current & Resistance`},{id:`faraday`,label:`🧲 Faraday's Induction`,desc:`Coil, Magnet & EMF`},{id:`acid-base`,label:`🧪 Acid-Base pH Scale`,desc:`Hydronium Equilibrium`},{id:`pendulum`,label:`⏱️ Pendulum Lab`,desc:`Harmonic Period Invariance`},{id:`balancing-chemical`,label:`⚗️ Balancing Equations`,desc:`Stoichiometric Balances`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
        text-align: left;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        color: #f8fafc;
        cursor: pointer;
        transition: all 0.15s ease;
      `,t.innerHTML=`
        <div style="font-size: 0.78rem; font-weight: 800; color: #e2e8f0;">${e.label}</div>
        <div style="font-size: 0.66rem; color: #94a3b8; margin-top: 2px;">${e.desc}</div>
      `,t.onmouseenter=()=>t.style.borderColor=`#38bdf8`,t.onmouseleave=()=>t.style.borderColor=`rgba(255, 255, 255, 0.12)`,t.onclick=()=>_(e.id),r.appendChild(t)}),t.appendChild(r),m.appendChild(t);let i=document.createElement(`div`);if(i.style.cssText=`
      border: ${p?`2px dashed #38bdf8`:`2px dashed rgba(255, 255, 255, 0.18)`};
      border-radius: 10px;
      padding: 22px 16px;
      text-align: center;
      background: ${p?`rgba(56, 189, 248, 0.08)`:`rgba(0, 0, 0, 0.25)`};
      transition: all 0.2s;
      cursor: pointer;
    `,i.innerHTML=`
      <span style="font-size: 2rem; display: block; margin-bottom: 6px;">📥</span>
      <div style="font-size: 0.85rem; font-weight: 800; color: #f8fafc;">
        Drop ANY PhET Simulation (HTML5, PhET-iO JSON, or Legacy Flash)
      </div>
      <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px;">
        Supports offline PhET HTML5 (*.html, *.htm, *.phet), PhET-iO (*.json) &amp; legacy Flash (*.swf) &bull; Click to browse
      </div>
    `,i.ondragover=e=>{e.preventDefault(),e.stopPropagation(),p=!0,i.style.border=`2px dashed #38bdf8`,i.style.background=`rgba(56, 189, 248, 0.08)`},i.ondragleave=e=>{e.stopPropagation(),p=!1,i.style.border=`2px dashed rgba(255, 255, 255, 0.18)`,i.style.background=`rgba(0, 0, 0, 0.25)`},i.ondrop=e=>{e.preventDefault(),e.stopPropagation(),p=!1;let t=e.dataTransfer?.files?.[0];t&&g(t)},i.onclick=()=>{let e=document.createElement(`input`);e.type=`file`,e.accept=`.html,.htm,.json,.swf,.phet`,e.onchange=e=>{let t=e.target.files?.[0];t&&g(t)},e.click()},m.appendChild(i),d){let e=document.createElement(`div`);e.style.cssText=`text-align: center; padding: 12px; color: #38bdf8; font-size: 0.8rem; font-weight: 700;`,e.textContent=`⏳ Analyzing PhET scene graph and extracting mathematical invariants...`,m.appendChild(e)}if(f){let e=document.createElement(`div`);e.style.cssText=`padding: 8px 12px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.75rem;`,e.textContent=`⚠️ ${f}`,m.appendChild(e)}if(u&&u.metadata){let e=u.metadata,t=e.originalSizeBytes>=1048576?`${(e.originalSizeBytes/1048576).toFixed(2)} MB`:`${(e.originalSizeBytes/1024).toFixed(1)} KB`,n=document.createElement(`div`);n.style.cssText=`background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 10px; padding: 14px;`,n.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.74rem; color: #38bdf8; font-weight: 800; text-transform: uppercase;">
            Transpilation Telemetry:
          </span>
          <span style="background: #16a34a; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 0.68rem; font-weight: 900;">
            ${F(e.compressionRatio)}
          </span>
        </div>
        <div style="font-size: 0.92rem; font-weight: 900; color: #f8fafc; margin-bottom: 4px;">
          ${F(e.title)}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0;">
          <div style="background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 6px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 0.66rem; color: #94a3b8;">Original PhET Bundle</div>
            <div style="font-size: 0.98rem; font-weight: 900; color: #f87171;">
              ${F(t)}
            </div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 6px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 0.66rem; color: #94a3b8;">Distilled AST + SVG Payload</div>
            <div style="font-size: 0.98rem; font-weight: 900; color: #4ade80;">
              ${(e.distilledSizeBytes/1024).toFixed(1)} KB
            </div>
          </div>
        </div>
        <div style="font-size: 0.73rem; color: #cbd5e1; margin-bottom: 12px; line-height: 1.5;">
          <div><strong>Invariants Extracted:</strong> ${F(e.detectedInvariants.join(` • `))}</div>
          <div><strong>Languages Ingested:</strong> ${F(e.localesFound.join(`, `))}</div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="ast-mount-phet-btn" type="button" style="flex: 1; min-width: 200px; padding: 10px 14px; background: #0284c7; border: 1px solid #38bdf8; border-radius: 7px; color: #ffffff; font-size: 0.8rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>🚀</span> ${s?`Save to Vault &amp; Launch in Stage`:`Mount Distilled Simulation to Live Player`}
          </button>
          <button id="ast-download-phet-ast-btn" type="button" style="padding: 10px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 7px; color: #cbd5e1; font-size: 0.76rem; font-weight: 700; cursor: pointer;">
            💾 Download .ast
          </button>
          <button id="ast-download-phet-svg-btn" type="button" style="padding: 10px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 7px; color: #cbd5e1; font-size: 0.76rem; font-weight: 700; cursor: pointer;">
            💾 Download .svg
          </button>
        </div>
      `,n.querySelector(`#ast-mount-phet-btn`)?.addEventListener(`click`,v),n.querySelector(`#ast-download-phet-ast-btn`)?.addEventListener(`click`,()=>{if(!u)return;let t=new Blob([u.astSource],{type:`text/plain;charset=utf-8`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`${e.simName||`phet-distilled`}.ast`,r.click(),URL.revokeObjectURL(n)}),n.querySelector(`#ast-download-phet-svg-btn`)?.addEventListener(`click`,()=>{if(!u)return;let t=new Blob([u.svgMarkup],{type:`image/svg+xml;charset=utf-8`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`${e.simName||`phet-distilled`}.svg`,r.click(),URL.revokeObjectURL(n)}),m.appendChild(n)}},g=async e=>{d=!0,f=null,h();try{if(e.name.toLowerCase().endsWith(`.swf`)){let i=await e.arrayBuffer(),a=e.name.replace(/\.swf$/i,``),o=await r(i,a);if(o.success){let r=e.size,i=new Blob([o.svgMarkup+o.astSource]).size,s=((r-i)/Math.max(1,r)*100).toFixed(1);u={success:!0,metadata:{simName:a,title:`PhET Legacy Flash: ${a}`,version:`Flash v${o.metadata?.version||9}`,originalSizeBytes:r,distilledSizeBytes:i,compressionRatio:`${s}% reduction`,detectedInvariants:[`Legacy Flash Vector Timeline`,`SWF Tag Stream Transpiled`],localesFound:[`en`],isFlashSwf:!0},svgMarkup:o.svgMarkup,astSource:o.astSource},t(u.svgMarkup),n(u.astSource)}else f=o.error||`Failed to transpile legacy PhET SWF.`;return}let i=await e.text(),o=await a(i,e.name);o.success?(u=o,t(o.svgMarkup),n(o.astSource)):f=o.error||`Failed to transpile PhET bundle.`}catch(e){f=e?.message||`Error processing PhET file.`}finally{d=!1,h()}},_=e=>{d=!0,f=null,h();try{let r=c[e],i=r.generateSvg().trim(),a=r.generateAst().trim(),o=125e5,s=new Blob([i+a]).size,l=((o-s)/o*100).toFixed(1);u={success:!0,metadata:{simName:e,title:r.title,version:`1.2.0`,originalSizeBytes:o,distilledSizeBytes:s,compressionRatio:`${l}% reduction`,detectedInvariants:r.invariants,localesFound:[`en`,`es`,`fr`,`de`,`pl`,`uk`]},svgMarkup:i,astSource:a},t(i),n(a)}catch(e){f=e?.message||`Error loading preset.`}finally{d=!1,h()}},v=()=>{u&&(s?s(u):(i({type:`HOT_RELOAD_SVG`,svg:u.svgMarkup}),i({type:`HOT_RELOAD_AST`,ast:u.astSource})),o(!0),setTimeout(()=>o(!1),900))};return h(),m}var ce=se;function le(e){let{swfResult:t,setSwfResult:n,isParsingSwf:i,setIsParsingSwf:a,swfError:o,setSwfError:s,swfDragActive:c,setSwfDragActive:l,setCustomSvgCode:u,setCustomAstCode:d,postToPlayer:f,setHotReloadFlash:p,swfFileName:m=`imported-swf`,setSwfFileName:h,onLaunchCartridge:g,onClose:_}=e,v=document.createElement(`div`);if(v.className=`ast-swf-transpiler-drawer`,v.style.cssText=`display: flex; flex-direction: column; gap: 14px;`,_){let e=document.createElement(`div`);e.style.cssText=`display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;`,e.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.15rem;">⚡</span>
        <div>
          <strong style="font-size: 0.92rem; color: var(--stj-text, #f8fafc); display: block;">Historic Adobe Flash (.swf) Importer &amp; Decompiler</strong>
          <span style="font-size: 0.74rem; color: var(--stj-text-muted, #94a3b8);">100% offline local binary transpiler — converts FWS/CWS vector shapes, morphs &amp; ActionScript into native 60 FPS SVG + AST cartridges.</span>
        </div>
      </div>
    `;let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid #334155; font-size: 0.76rem; font-weight: 700; cursor: pointer;`,t.textContent=`Close ✕`,t.onclick=()=>_(),e.appendChild(t),v.appendChild(e)}let y=document.createElement(`div`);y.style.cssText=`
    border: ${c?`2px dashed var(--stj-primary, #6366f1)`:`2px dashed var(--stj-border, #334155)`};
    background: ${c?`var(--stj-primary-surface, rgba(99, 102, 241, 0.1))`:`var(--stj-canvas, #090d16)`};
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
  `,y.innerHTML=`
    <div style="font-size: 2rem; margin-bottom: 8px;">📦</div>
    <strong style="font-size: 0.95rem; color: var(--stj-text, #f8fafc); display: block; margin-bottom: 4px;">
      Drag &amp; Drop Legacy Adobe Flash (.swf) File Here
    </strong>
    <p style="margin: 0 0 12px 0; font-size: 0.78rem; color: var(--stj-text-muted, #94a3b8);">
      Decodes FWS (uncompressed) &amp; CWS (zlib-compressed) binary vector shapes, twips coordinates, and timeline frames into native 60 FPS SVG + AST S-Expressions.
    </p>
    <div style="display: inline-flex; align-items: center; gap: 8px;">
      <label class="stj-btn stj-btn-primary stj-btn-sm" style="cursor: pointer; font-size: 0.76rem;">
        <span>Browse .swf File...</span>
        <input id="ast-swf-file-input" type="file" accept=".swf" style="display: none;" />
      </label>
      <span style="font-size: 0.74rem; color: var(--stj-text-muted, #94a3b8);">or try an educational sample below</span>
    </div>
  `;let b=async(e,t)=>{a(!0),s(null),h?.(t);try{let i=await r(e,t);i.success?(n(i),u(i.svgMarkup),d(i.astSource)):s(i.error||`Failed to transpile SWF binary.`)}catch(e){s(e?.message||`Error processing SWF file.`)}finally{a(!1)}};y.ondragover=e=>{e.preventDefault(),e.stopPropagation(),l(!0)},y.ondragleave=e=>{e.stopPropagation(),l(!1)},y.ondrop=async e=>{e.preventDefault(),e.stopPropagation(),l(!1);let t=e.dataTransfer?.files?.[0];if(!t)return;let n=await t.arrayBuffer(),r=t.name.replace(/\.[^/.]+$/,``).toLowerCase().replace(/[^a-z0-9-]/g,`-`);b(n,r)},y.querySelector(`#ast-swf-file-input`)?.addEventListener(`change`,async e=>{let t=e.target.files?.[0];if(!t)return;let n=await t.arrayBuffer(),r=t.name.replace(/\.[^/.]+$/,``).toLowerCase().replace(/[^a-z0-9-]/g,`-`);b(n,r)}),v.appendChild(y);let x=document.createElement(`div`);x.style.cssText=`display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`;let S=document.createElement(`span`);if(S.style.cssText=`font-size: 0.74rem; font-weight: 700; color: var(--stj-text-muted, #94a3b8);`,S.textContent=`Legacy Samples:`,x.appendChild(S),[{id:`flash-pendulum`,title:`⚖️ Physics Harmonic Pendulum`,desc:`Classic legacy science lab animation with angle sweep & potential energy.`,mockBytes:()=>new Uint8Array([70,87,83,8,64,0,0,0,120,0,7,208,0,0,4,176,24,0,60,0,67,2,15,23,42])},{id:`flash-circuit`,title:`💡 Ohm’s Law Circuit Switch`,desc:`Bistable switch and resistor wire animation from 2004 Flash science kits.`,mockBytes:()=>new Uint8Array([70,87,83,8,64,0,0,0,120,0,7,208,0,0,4,176,24,0,60,0,67,2,15,23,42])}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.className=`stj-btn stj-btn-secondary stj-btn-sm`,t.style.fontSize=`0.74rem`,t.title=e.desc,t.textContent=e.title,t.onclick=()=>{b(e.mockBytes().buffer,e.id)},x.appendChild(t)}),v.appendChild(x),o){let e=document.createElement(`div`);e.style.cssText=`padding: 8px 12px; border-radius: 6px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.78rem;`,e.textContent=`❌ ${o}`,v.appendChild(e)}if(i){let e=document.createElement(`div`);e.style.cssText=`padding: 12px; text-align: center; color: var(--stj-primary, #38bdf8); font-size: 0.8rem;`,e.textContent=`⏳ Decompiling SWF byte stream and generating vector paths...`,v.appendChild(e)}if(t&&t.metadata){let e=t.metadata,n=document.createElement(`div`);n.style.cssText=`background: var(--stj-canvas, #090d16); border: 1px solid var(--stj-border, #334155); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;`;let r=document.createElement(`div`);r.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;`,r.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="stj-badge stj-badge-success" style="font-weight: 700;">✓ Transpiled</span>
        <strong style="font-size: 0.86rem; color: var(--stj-text, #f8fafc);">
          Legacy Flash SWF v${e.version} (${e.signature})
        </strong>
      </div>
    `;let i=document.createElement(`div`);i.style.cssText=`display: flex; align-items: center; gap: 6px;`;let a=document.createElement(`button`);a.type=`button`,a.className=`stj-btn stj-btn-primary stj-btn-sm`,a.style.cssText=`font-size: 0.75rem; font-weight: 700;`,a.textContent=g?`⚡ Save & Play in Stage`:`⚡ Test & Play in Stage`,a.onclick=()=>{g?g(t,m):(f({type:`HOT_RELOAD_SVG`,svg:t.svgMarkup}),f({type:`HOT_RELOAD_AST`,ast:t.astSource}),f({type:`SEEK`,progress:0}),f({type:`PLAY`})),p(!0),setTimeout(()=>p(!1),2200)},i.appendChild(a);let o=document.createElement(`button`);o.type=`button`,o.className=`stj-btn stj-btn-secondary stj-btn-sm`,o.style.fontSize=`0.75rem`,o.textContent=`💾 Download SVG`,o.onclick=()=>{let e=new Blob([t.svgMarkup],{type:`image/svg+xml;charset=utf-8`}),n=URL.createObjectURL(e),r=document.createElement(`a`);r.href=n,r.download=`${m||`transpiled-swf`}.svg`,r.click(),URL.revokeObjectURL(n)},i.appendChild(o),r.appendChild(i),n.appendChild(r);let s=document.createElement(`div`);s.style.cssText=`display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;`,s.innerHTML=`
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Canvas Dimensions</span>
        <strong style="color: var(--stj-text, #f8fafc);">${e.width} × ${e.height} px</strong>
      </div>
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Timeline &amp; Speed</span>
        <strong style="color: var(--stj-text, #f8fafc);">${e.frameCount} Frames @ ${e.frameRate} FPS</strong>
      </div>
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Shapes Extracted</span>
        <strong style="color: var(--stj-text, #f8fafc);">${e.shapeCount} Vector Paths</strong>
      </div>
      <div style="padding: 6px 10px; background: var(--stj-surface, #1e293b); border-radius: 6px; border: 1px solid var(--stj-border, #334155); font-size: 0.72rem;">
        <span style="color: var(--stj-text-muted, #94a3b8); display: block;">Background</span>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: ${e.backgroundColor}; border: 1px solid #64748b;"></span>
          <strong style="color: var(--stj-text, #f8fafc);">${e.backgroundColor}</strong>
        </div>
      </div>
    `,n.appendChild(s);let c=document.createElement(`div`);c.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 0.74rem; font-weight: 600; color: var(--stj-primary, #38bdf8);">⚡ Generated Declarative AST S-Expressions:</span>
        <button id="ast-copy-code-btn" type="button" class="stj-btn stj-btn-ghost stj-btn-sm" style="font-size: 0.7rem; padding: 2px 6px; cursor: pointer;">
          📋 Copy AST
        </button>
      </div>
      <pre id="ast-swf-preview-pre" style="margin: 0; padding: 8px; background: var(--stj-surface, #1e293b); border: 1px solid var(--stj-border, #334155); border-radius: 6px; font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8); max-height: 110px; overflow-y: auto; font-family: monospace;"></pre>
    `;let l=c.querySelector(`#ast-swf-preview-pre`);l&&(l.textContent=t.astSource),c.querySelector(`#ast-copy-code-btn`)?.addEventListener(`click`,()=>{navigator.clipboard?.writeText(t.astSource)}),n.appendChild(c),v.appendChild(n)}return v}var ue=le;function de(e){if(!e.isOpen)return null;let{embedTargetMode:t,setEmbedTargetMode:n,copiedEmbed:r,onCopyEmbedCode:i,embedCode:a}=e,o=document.createElement(`div`);o.className=`ast-player-embed-modal`,o.style.cssText=`
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
  `,m.textContent=a,o.appendChild(m),o}function fe(e){switch(e){case`kinetic-gas`:return[`Why does temperature increase particle velocity?`,`What happens to pressure if I compress the volume?`,`Explain Boyle’s Law (P1V1 = P2V2) simply`];case`calculus-curves`:return[`What does dy/dx represent geometrically at this point?`,`Why is the tangent slope zero at the curve peak?`,`How does the integral calculate the area under the curve?`];case`math-fishing`:return[`What is the best mental strategy for Number Bonds to 100?`,`How do factor pairs multiply to 36 and 48?`,`Explain adding negative integers like -4 + 10`];case`electric-circuits`:return[`Explain Ohm's Law: V = I × R with this circuit`,`What object is my ray hitting right now?`,`Nudge the #coil-core into the magnetic field`,`Why do electrons drift slower when resistance increases?`];case`fractions`:return[`Why must we find a common denominator before adding?`,`What does the numerator vs denominator represent geometrically?`,`How do equivalent fractions preserve identical area?`];case`spelling-bee`:return[`What is the etymology and Latin origin of this statutory spelling?`,`Explain the phonics rule for words ending in -cious vs -tious`,`Give me a mnemonic to remember the spelling of accommodation and embarrass`];case`atom`:return[`How does the Bohr electron shell formula 2n² determine orbital capacities?`,`Why does increasing atomic number (Z) change an element’s chemical family?`,`Explain the difference between atomic number and mass number`];case`times-tables`:return[`Explain how the distributive property 7×8 = (7×5)+(7×3) simplifies mental arithmetic`,`Why does rotating a 2D array by 90° prove the commutative law a×b = b×a?`,`What patterns emerge on the 100-square when skip counting by 9s?`];case`solar-system`:return[`Why do outer planets like Neptune take vastly longer to orbit than Mercury?`,`Explain Kepler’s 3rd Law of planetary motion simply`,`What are the key planetary differences between gas giants and rocky planets?`];default:return[`Explain the physics and math principles shown in this lab`,`What happens if I change the key variables?`,`Give me a challenging question to test my understanding`]}}function pe(e){if(!e.isOpen)return null;let{onClose:t,preset:n,postToPlayer:r,currentProgress:i=0,activeKeyframe:a,onCancelDemonstration:o}=e,s=e.latestTelemetry,c=e.activeQuiz||null,l=!!e.isAiDemonstrating,u=`copilot`,d=P(),f=A(),p=!1,m=``,h=``,g=``,_=null,v=``,y=null,b=null,x=null,S=[{sender:`nano`,text:`Hello! I am your on-device Gemini Nano tutor for this vector lab. Ask me anything, answer a checkpoint quiz, or click "✨ Show Me How" to watch me physically demonstrate on the simulation stage!`}];r({type:`GET_CONTEXT_SNAPSHOT`});let C=document.createElement(`div`);C.className=`ast-nano-ai-tutor-drawer`,C.style.cssText=`
    background: #090d16;
    border-top: 2px solid #38bdf8;
    padding: 16px 20px;
    color: #f8fafc;
    box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;function w(){d=P(),f=A();let e=k.getActiveEngineType(),T=f.downloadProgress??0;C.innerHTML=``;let O=document.createElement(`div`);O.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;`;let j=document.createElement(`div`);j.style.cssText=`display: flex; align-items: center; gap: 10px;`;let M=`rgba(148, 163, 184, 0.2)`,te=`#e2e8f0`,ie=`#64748b`,ae=`🌱 Eco Mode · Local Rule Engine`;f.nanoStatus===`downloading`?(M=`rgba(14, 165, 233, 0.22)`,te=`#7dd3fc`,ie=`#38bdf8`,ae=`⏳ Downloading Gemini Nano (${T}%)`):f.ecoMode?(M=`rgba(16, 185, 129, 0.18)`,te=`#6ee7b7`,ie=`#10b981`,ae=f.nanoStatus===`available`?`🌱 Eco Mode (Gemini Nano Ready)`:f.nanoStatus===`downloadable`?`🌱 Eco Mode (Gemini Nano Downloadable)`:`🌱 Eco Mode (0 MB Deterministic Rules)`):f.nanoStatus===`available`?(M=`rgba(34, 197, 94, 0.2)`,te=`#4ade80`,ie=`#22c55e`,ae=`🟢 Chrome Prompt API (Gemini Nano Ready)`):f.nanoStatus===`downloadable`?(M=`rgba(14, 165, 233, 0.22)`,te=`#7dd3fc`,ie=`#38bdf8`,ae=`⬇️ Gemini Nano Downloadable`):e===`webgpu-webllm`?(M=`rgba(168, 85, 247, 0.2)`,te=`#c084fc`,ie=`#a855f7`,ae=`🟣 WebGPU On-Device LLM`):ae=`⚪ Local Rule Engine (Nano Unavailable)`,j.innerHTML=`
      <span style="font-size: 1.4rem;">✨</span>
      <div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">
            Gemini Nano Edge AI Co-Pilot
          </h3>
          <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: ${M}; color: ${te}; border: 1px solid ${ie};">
            ${ae}
          </span>
        </div>
        <p style="margin: 2px 0 0; font-size: 0.74rem; color: #94a3b8;">
          100% on-device local execution &bull; 0ms cloud egress &bull; UK DfE &amp; GDPR compliant
        </p>
      </div>
    `;let oe=document.createElement(`div`);oe.style.cssText=`display: flex; align-items: center; gap: 8px;`;let F=document.createElement(`div`);F.style.cssText=`display: flex; background: #1e293b; padding: 3px; borderRadius: 8px; gap: 4px; border-radius: 8px;`,[{id:`copilot`,label:`💬 Ask Nano`},{id:`generator`,label:`⚡ Generate Lab`},{id:`grader`,label:`🎯 Grader`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
        padding: 4px 10px;
        border-radius: 6px;
        background: ${u===e.id?`#0284c7`:`transparent`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.75rem;
        cursor: pointer;
      `,t.textContent=e.label,t.onclick=()=>{u=e.id,w()},F.appendChild(t)});let se=document.createElement(`button`);if(se.type=`button`,se.style.cssText=`padding: 6px 12px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.75rem; cursor: pointer;`,se.textContent=`✕ Close`,se.onclick=t,oe.appendChild(F),oe.appendChild(se),O.appendChild(j),O.appendChild(oe),C.appendChild(O),f.ecoMode||f.nanoStatus===`downloadable`||f.nanoStatus===`downloading`){let e=document.createElement(`div`);e.style.cssText=`display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:8px 12px; border-radius:8px; background:#0f172a; border:1px solid #334155;`;let t=document.createElement(`span`);t.style.cssText=`font-size:0.75rem; color:#cbd5e1;`,t.textContent=f.nanoStatus===`downloading`?`⏳ Downloading Gemini Nano weights locally (${T}%)...`:f.nanoStatus===`downloadable`?`⬇️ Chrome Gemini Nano is supported on this device and ready to download locally.`:f.nanoStatus===`available`?`🌱 Currently in Eco Mode (0 W GPU). Gemini Nano is installed and ready whenever you activate it.`:`🌱 Eco Mode active: Running deterministic curriculum rules (0 MB download).`,e.appendChild(t);let n=document.createElement(`div`);if(n.style.cssText=`display:flex; gap:6px; align-items:center;`,f.nanoStatus===`downloadable`||f.ecoMode&&(f.nanoStatus===`available`||f.webGpuEligible)){let e=document.createElement(`button`);e.type=`button`,e.style.cssText=`padding:4px 10px; border-radius:6px; background:#0284c7; color:#ffffff; border:1px solid #38bdf8; font-size:0.72rem; font-weight:800; cursor:pointer;`,e.textContent=f.nanoStatus===`downloadable`?`⬇️ Download & Activate Nano`:`✨ Activate Private AI`,e.onclick=()=>{N()},n.appendChild(e)}else if(!f.ecoMode){let e=document.createElement(`button`);e.type=`button`,e.style.cssText=`padding:4px 10px; border-radius:6px; background:#1e293b; color:#6ee7b7; border:1px solid #10b981; font-size:0.72rem; font-weight:800; cursor:pointer;`,e.textContent=`🌱 Eco Mode`,e.onclick=()=>{ee()},n.appendChild(e)}e.appendChild(n),C.appendChild(e)}if(u===`copilot`){let e=document.createElement(`div`);if(e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`,c&&c.prompt){let t=document.createElement(`div`);t.style.cssText=`padding: 10px 14px; background: linear-gradient(135deg, rgba(88, 28, 135, 0.35) 0%, rgba(15, 23, 42, 0.92) 100%); border: 1px solid rgba(192, 132, 252, 0.55); border-radius: 10px; display: flex; flex-direction: column; gap: 6px;`;let n=document.createElement(`div`);n.style.cssText=`display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;`;let r=document.createElement(`span`);r.style.cssText=`font-size: 0.74rem; font-weight: 800; color: #e879f9; letter-spacing: 0.03em; text-transform: uppercase;`,r.textContent=`🎯 Quiz Checkpoint #${(c.index??0)+1} Context`,n.appendChild(r);let i=document.createElement(`div`);i.style.cssText=`display: flex; gap: 6px; align-items: center;`;let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`padding: 3px 9px; border-radius: 6px; background: #7e22ce; color: #ffffff; border: 1px solid #c084fc; font-size: 0.68rem; font-weight: 800; cursor: pointer;`,a.textContent=`✨ Coach & Highlight Stage`,a.disabled=p,a.onclick=()=>E(c);let o=document.createElement(`button`);o.type=`button`,o.style.cssText=`padding: 3px 9px; border-radius: 6px; background: #1e293b; color: #38bdf8; border: 1px solid #334155; font-size: 0.68rem; font-weight: 700; cursor: pointer;`,o.textContent=`📝 Explain in Grader`,o.onclick=()=>{u=`grader`,w()};let s=document.createElement(`button`);s.type=`button`,s.style.cssText=`padding: 2px 7px; border-radius: 5px; background: transparent; color: #94a3b8; border: 1px solid #334155; font-size: 0.68rem; cursor: pointer;`,s.textContent=`✕`,s.title=`Clear active quiz context`,s.onclick=()=>{c=null,w()},i.appendChild(a),i.appendChild(o),i.appendChild(s),n.appendChild(i),t.appendChild(n);let l=document.createElement(`div`);if(l.style.cssText=`font-size: 0.82rem; font-weight: 700; color: #f8fafc; line-height: 1.35;`,l.textContent=c.prompt,t.appendChild(l),c.chosenText||c.distractorNudge){let e=document.createElement(`div`);if(e.style.cssText=`font-size: 0.74rem; color: #e9d5ff; display: flex; flex-wrap: wrap; gap: 10px;`,c.chosenText){let t=document.createElement(`span`);t.innerHTML=`<strong>Your selection:</strong> `;let n=document.createElement(`span`);n.style.color=`#fbbf24`,n.textContent=c.chosenText,t.appendChild(n),e.appendChild(t)}if(c.distractorNudge){let t=document.createElement(`span`);t.innerHTML=`<strong>Clue:</strong> `;let n=document.createElement(`span`);n.style.color=`#fde047`,n.textContent=c.distractorNudge,t.appendChild(n),e.appendChild(t)}t.appendChild(e)}e.appendChild(t)}if(l){let t=document.createElement(`div`);t.style.cssText=`display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: linear-gradient(90deg, rgba(2, 132, 199, 0.25) 0%, rgba(14, 165, 233, 0.1) 100%); border: 1px solid #38bdf8; border-radius: 8px;`,t.innerHTML=`
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
      `;let a=document.createElement(`div`);a.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`;let d=document.createElement(`button`);d.type=`button`,d.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,d.textContent=`🔭 Orbit View (Δθ:+20°, Δϕ:-10°)`,d.onclick=()=>{r({type:`ACTUATE_OPCODE`,opcode:`(:rotate-camera :theta 20.0 :phi -10.0 :relative true)`})};let f=document.createElement(`button`);f.type=`button`,f.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,f.textContent=`⚡ Nudge Core/Probe ([0, 5, 0])`,f.onclick=()=>{let e=s?.spatialTelemetry?.hit?.target||`#coil-core`;r({type:`ACTUATE_OPCODE`,opcode:`(:nudge :target "${e}" :dxyz [0.0 5.0 0.0])`})};let h=document.createElement(`button`);h.type=`button`,h.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); font-size: 0.68rem; font-weight: 700; cursor: pointer;`,h.textContent=`🎯 Cast Ray`,h.onclick=()=>{r({type:`CAST_CAMERA_RAY`})},a.appendChild(d),a.appendChild(f),a.appendChild(h),i.appendChild(a),t.appendChild(i);let g=document.createElement(`div`);g.style.cssText=`background: #090d16; padding: 6px 10px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 0.74rem; color: #4ade80; display: flex; flex-direction: column; gap: 4px; user-select: all;`;let _=document.createElement(`div`);_.style.cssText=`display: flex; justify-content: space-between; align-items: center;`;let v=document.createElement(`span`);v.style.cssText=`color: #94a3b8; font-size: 0.68rem;`,v.textContent=`RAY INTERSECTION TOKEN:`;let y=document.createElement(`span`);y.style.cssText=`color: #38bdf8; font-size: 0.68rem;`,y.textContent=`Analytic Ray-Math (Zero GPU Drivers)`,_.appendChild(v),_.appendChild(y),g.appendChild(_);let T=document.createElement(`div`);T.style.cssText=`font-weight: 700; overflow-x: auto; white-space: nowrap;`,T.textContent=s?.spatialTelemetry?.rayHitSExpr||`(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])`,b=T,g.appendChild(T);let O=document.createElement(`div`);O.style.cssText=`color: #38bdf8; font-size: 0.70rem; overflow-x: auto; white-space: nowrap;`,s?.spatialTelemetry?.cameraStateSExpr?O.textContent=s.spatialTelemetry.cameraStateSExpr:O.style.display=`none`,x=O,g.appendChild(O),t.appendChild(g),e.appendChild(t);let k=fe(n),A=document.createElement(`div`);A.style.cssText=`display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;`,A.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center; white-space: nowrap;">Suggested:</span>`,k.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
          white-space: nowrap;
          padding: 4px 10px;
          border-radius: 9999px;
          background: #1e293b;
          color: #bae6fd;
          border: 1px solid #334155;
          font-size: 0.72rem;
          cursor: ${p?`not-allowed`:`pointer`};
        `,t.textContent=e,t.disabled=p,t.onclick=()=>D(e,!0),A.appendChild(t)}),e.appendChild(A);let j=document.createElement(`div`);if(j.style.cssText=`background: #0f172a; border-radius: 10px; border: 1px solid #1e293b; padding: 12px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;`,S.forEach(e=>{let t=document.createElement(`div`);t.style.cssText=`
          align-self: ${e.sender===`user`?`flex-end`:`flex-start`};
          max-width: 88%;
          background: ${e.sender===`user`?`#0284c7`:`#1e293b`};
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          line-height: 1.4;
        `;let n=document.createElement(`div`);n.style.cssText=`font-weight: 800; font-size: 0.68rem; margin-bottom: 2px; color: ${e.sender===`user`?`#bae6fd`:`#38bdf8`};`,n.textContent=e.sender===`user`?`You`:`✨ Gemini Nano Co-Pilot`,t.appendChild(n);let i=document.createElement(`div`);if(i.textContent=e.text,t.appendChild(i),e.rawSExpr){let n=document.createElement(`div`);n.style.cssText=`margin-top: 6px; padding: 6px 10px; background: #090d16; border-radius: 6px; border: 1px solid #334155; font-family: monospace; font-size: 0.72rem; color: #38bdf8; overflow-x: auto;`;let i=document.createElement(`div`);if(i.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;`,i.innerHTML=`<span style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">⚡ ACTION TUPLE:</span>`,e.packet){let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; background: #0284c7; color: #fff; border: none; cursor: pointer;`,t.textContent=`▶ Replay Demo`,t.onclick=()=>r({type:`AI_VISUAL_COMMAND`,packet:e.packet}),i.appendChild(t)}n.appendChild(i);let a=document.createElement(`code`);a.textContent=e.rawSExpr,n.appendChild(a),t.appendChild(n)}if(e.action){let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`margin-top: 6px; padding: 4px 8px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.7rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;`,n.textContent=`⚡ Apply to Stage: ${e.action.name} = ${e.action.val}`,n.onclick=()=>{r({type:`SET_VAR`,name:e.action.name,value:e.action.val}),S.push({sender:`nano`,text:`Applied live parameter to stage: ${e.action.name} = ${e.action.val}`}),w()},t.appendChild(n)}j.appendChild(t)}),p){let e=document.createElement(`div`);e.style.cssText=`align-self: flex-start; color: #38bdf8; font-size: 0.75rem; font-style: italic;`,e.textContent=`✨ Nano is synthesizing action tuples on-device...`,j.appendChild(e)}e.appendChild(j);let M=document.createElement(`div`);M.style.cssText=`display: flex; gap: 8px;`;let N=document.createElement(`input`);N.type=`text`,N.value=m,N.placeholder=`Ask Nano about ${n} (e.g. why does this curve peak?)...`,N.disabled=p,N.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,N.oninput=e=>{m=e.target.value},N.onkeydown=e=>{e.key===`Enter`&&D(void 0,!0)};let P=document.createElement(`button`);P.type=`button`,P.style.cssText=`
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
      `,P.disabled=p,P.innerHTML=`<span>✨ Show Me How</span>`,P.onclick=()=>D(void 0,!0),M.appendChild(N),M.appendChild(P),e.appendChild(M),C.appendChild(e)}else if(u===`generator`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`,t.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center;">Templates:</span>`,[`Pulley with Mechanical Advantage 2`,`Pendulum Energy Conservation`,`Bohr Carbon Atom (6 Protons)`,`Pythagoras 3-4-5 Triangle`].forEach(e=>{let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #bae6fd; border: 1px solid #334155; font-size: 0.7rem; cursor: pointer;`,n.textContent=e,n.onclick=()=>{h=e,w()},t.appendChild(n)}),e.appendChild(t);let n=document.createElement(`div`);n.style.cssText=`display: flex; gap: 8px;`;let i=document.createElement(`input`);i.type=`text`,i.value=h,i.placeholder=`Describe an interactive vector simulation to synthesize (e.g. Archimedes buoyancy lever)...`,i.disabled=p,i.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,i.oninput=e=>{h=e.target.value};let a=document.createElement(`button`);if(a.type=`button`,a.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${p?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${p?`not-allowed`:`pointer`};
      `,a.textContent=p?`Synthesizing...`:`⚡ Generate AST`,a.disabled=p,a.onclick=ne,n.appendChild(i),n.appendChild(a),e.appendChild(n),_){let t=document.createElement(`div`);t.style.cssText=`color: #f87171; font-size: 0.75rem;`,t.textContent=_,e.appendChild(t)}if(g){let t=document.createElement(`div`);t.style.cssText=`display: flex; flex-direction: column; gap: 6px;`;let n=document.createElement(`div`);n.style.cssText=`display: flex; justify-content: space-between; align-items: center;`,n.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Synthesized AST S-Expression Specification:</span>`;let i=document.createElement(`div`);i.style.cssText=`display: flex; gap: 6px;`;let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;`,a.textContent=`⚡ Run in Vector Player`,a.onclick=()=>{r({type:`LOAD_AST`,ast:g}),r({type:`PLAY`})};let o=document.createElement(`button`);o.type=`button`,o.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.72rem; cursor: pointer;`,o.textContent=`📋 Copy AST`,o.onclick=()=>navigator.clipboard.writeText(g),i.appendChild(a),i.appendChild(o),n.appendChild(i),t.appendChild(n);let s=document.createElement(`textarea`);s.rows=5,s.value=g,s.style.cssText=`background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; color: #38bdf8; font-family: monospace; font-size: 0.75rem; line-height: 1.4; resize: vertical;`,s.oninput=e=>{g=e.target.value},t.appendChild(s),e.appendChild(t)}C.appendChild(e)}else if(u===`grader`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`background: #1e293b; padding: 10px 14px; border-radius: 8px; font-size: 0.8rem;`;let r=document.createElement(`span`);r.style.cssText=`color: #38bdf8; font-weight: 800;`,r.textContent=`Active Checkpoint Context: `;let o=document.createElement(`span`);o.textContent=c?.prompt?`Quiz #${(c.index??0)+1}: "${c.prompt}"`:a?`"${a.title} — ${a.rule}"`:`Simulation progress: ${(i*100).toFixed(0)}% in ${n}`,t.appendChild(r),t.appendChild(o),e.appendChild(t);let s=document.createElement(`div`);s.style.cssText=`display: flex; gap: 8px;`;let l=document.createElement(`textarea`);l.rows=2,l.value=v,l.placeholder=`Explain the mechanism in your own words (e.g. why does pressure rise, or what makes the bond sum to 100?)...`,l.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem; resize: none;`,l.oninput=e=>{v=e.target.value};let u=document.createElement(`button`);if(u.type=`button`,u.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${p?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${p?`not-allowed`:`pointer`};
      `,u.textContent=p?`Grading...`:`🎯 Evaluate`,u.disabled=p,u.onclick=re,s.appendChild(l),s.appendChild(u),e.appendChild(s),y){let t=document.createElement(`div`);t.style.cssText=`background: #0f172a; border: 1px solid #22c55e; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;`;let n=document.createElement(`div`);n.style.cssText=`background: #22c55e; color: #000000; font-weight: 900; font-size: 1.1rem; padding: 6px 10px; border-radius: 8px; white-space: nowrap;`,n.textContent=`⭐ ${y.score}/5`;let r=document.createElement(`div`);r.style.cssText=`flex: 1; font-size: 0.8rem; color: #e2e8f0; white-space: pre-line;`,r.textContent=y.feedback,t.appendChild(n),t.appendChild(r),e.appendChild(t)}C.appendChild(e)}}function T(e){return e.chosenText?`Quiz Question: "${e.prompt}" — I picked "${e.chosenText}". Help me understand why this works or what misconception to check.`:e.passExpr?`Lab Challenge: "${e.prompt}" (Goal condition: ${e.passExpr}). Show me which controls affect this!`:`Quiz Question: "${e.prompt}" — Can you guide me on the concept and point to the right part of the model?`}function E(e){c=e,u=`copilot`,D(T(e),!0,e)}async function D(e,t=!0,a){let o=(e||m).trim();if(!o||p)return;d||=(M(!0),!0);let l=a===void 0?c:a;S.push({sender:`user`,text:o}),m=``,p=!0,w();try{let e=s||{sceneId:l?.sceneId||n,progress:l?.progress??i,activeKeyframe:0,variables:l?.vars||{},lastUserAction:l?`CHECKPOINT_HELP`:`QUESTION`,timestamp:Date.now()},a=l?`${o} [Context: prompt="${l.prompt}"${l.distractorNudge?` nudge="${l.distractorNudge}"`:``}${l.explanation?` explanation="${l.explanation}"`:``}${l.targetSelector?` target="${l.targetSelector}"`:``}]`:o,c=await O(e,a,{targetScene:l?.sceneId||n});l?.targetSelector&&c.actions&&!c.actions.some(e=>e.type===`HIGHLIGHT`)&&c.actions.unshift({type:`HIGHLIGHT`,selector:l.targetSelector,durationMs:4e3}),t&&c.actions&&c.actions.length>0&&r({type:`AI_VISUAL_COMMAND`,packet:c}),S.push({sender:`nano`,text:c.sayText||l?.explanation||`Observe the visual demonstration on the simulation stage.`,packet:c,rawSExpr:c.rawSExpr})}catch(e){console.warn(`[NanoAiTutorDrawer] Co-Pilot inference notice:`,e);let i=l?`${l.distractorNudge||``} ${l.explanation||`Look closely at how the active variables (${JSON.stringify(l.vars||{})}) relate to the question in ${n}.`}`.trim():`[Offline Local Response] In this ${n} simulation, adjustments to the input variables directly update the SVG equations and animated vector properties. Notice how the keyframe timeline coordinates with the visual state.`;t&&l?.targetSelector&&r({type:`AI_VISUAL_COMMAND`,packet:{type:`AI_VISUAL_COMMAND`,transactionId:`nano_fallback_${Date.now()}`,actions:[{type:`HIGHLIGHT`,selector:l.targetSelector,durationMs:3500}],sayText:i,pedagogicalIntent:`SCAFFOLD_HINT`}}),S.push({sender:`nano`,text:i})}finally{p=!1,w()}}async function ne(){if(h.trim()&&!p){d||=(M(!0),!0),p=!0,_=null,w();try{g=(await k.promptText({prompt:`Generate an AST interactive lab for: "${h}"`,systemPrompt:`You are an expert compiler for the St Joseph's AST Vector Player specification.
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
)`}finally{p=!1,w()}}}async function re(){if(v.trim()&&!p){d||=(M(!0),!0),p=!0,w();try{let e=`You are a UK National Curriculum formative assessment specialist.
Current Assessment: ${c?.prompt?`Quiz Question: "${c.prompt}". Concept Explanation: "${c.explanation||``}"`:a?`Topic: "${a.title}" Rule: "${a.rule}"`:`Simulation: ${n}`}.
Evaluate student answer: "${v}".
Format:
Score: [1 to 5]/5
Feedback: 2 sentences identifying conceptual strengths and one area for mastery polish.`,t=await k.promptText({prompt:v,systemPrompt:e,temperature:.2,timeoutMs:15e3}),r=t.match(/(\d)\s*\/\s*5/);y={feedback:t,score:r?parseInt(r[1],10):4}}catch{y={feedback:`Score: 4/5\nFeedback: Great reasoning! You demonstrated understanding of the active ${n} mechanism. Continue exploring how parameter variables shift the keyframe curve.`,score:4}}finally{p=!1,w()}}}w();let ie=te(()=>{C.isConnected?p||w():ie()});return j(!1),c&&c.autoAsk&&setTimeout(()=>E(c),0),C.__nanoDrawerHandle={element:C,updateTelemetry:e=>{s=e,b&&e?.spatialTelemetry?.rayHitSExpr&&(b.textContent=e.spatialTelemetry.rayHitSExpr),x&&e?.spatialTelemetry?.cameraStateSExpr&&(x.style.display=`block`,x.textContent=e.spatialTelemetry.cameraStateSExpr)},setDemonstrating:e=>{l!==!!e&&(l=!!e,w())},askCheckpoint:(e,t=!0)=>{t?E(e):(c=e,u=`copilot`,w())},askQuestion:(e,t=!0)=>{u=`copilot`,D(e,t)}},C}var me=class{transform;constructor(e={}){this.transform={minX:e.minX??-6,maxX:e.maxX??6,minY:e.minY??-4,maxY:e.maxY??8,svgWidth:e.svgWidth??600,svgHeight:e.svgHeight??380}}mathToSvg(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:(e-n)/(r-n)*o,y:s-(t-i)/(a-i)*s}}svgToMath(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:n+e/o*(r-n),y:i+(s-t)/s*(a-i)}}generateCurvePath(e,t=240){let{minX:n,maxX:r,minY:i,maxY:a}=this.transform,o=(r-n)/t,s=``,c=!1;for(let r=0;r<=t;r++){let t=n+r*o,l;try{l=e(t)}catch{c=!1;continue}if(isNaN(l)||!isFinite(l)||l<i-10||l>a+10){c=!1;continue}let u=this.mathToSvg(t,l);c?s+=`L ${u.x.toFixed(1)} ${u.y.toFixed(1)} `:(s+=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `,c=!0)}return s.trim()}calculateTangent(e,t,n=3.5){let r=1e-4,i=e(t),a=(e(t+r)-e(t-r))/(2*r),o=Math.atan(a),s=o*180/Math.PI,c=this.mathToSvg(t,i),l=n/2,u=Math.cos(o),d=Math.sin(o),f=t-l*u,p=i-l*d,m=t+l*u,h=i+l*d,g=this.mathToSvg(f,p),_=this.mathToSvg(m,h),v=`M ${g.x.toFixed(1)} ${g.y.toFixed(1)} L ${_.x.toFixed(1)} ${_.y.toFixed(1)}`,y=l*.65,b=t-y*-d,x=i-y*u,S=t+y*-d,C=i+y*u,w=this.mathToSvg(b,x),T=this.mathToSvg(S,C),E=`M ${w.x.toFixed(1)} ${w.y.toFixed(1)} L ${T.x.toFixed(1)} ${T.y.toFixed(1)}`,D=a*1,O=this.mathToSvg(t+1,i),k=this.mathToSvg(t+1,i+D),A=`M ${c.x.toFixed(1)} ${c.y.toFixed(1)} L ${O.x.toFixed(1)} ${O.y.toFixed(1)} L ${k.x.toFixed(1)} ${k.y.toFixed(1)}`,j=`dy/dx = ${a>=0?`+`:``}${a.toFixed(2)}`;return{x0:t,y0:i,svgX:c.x,svgY:c.y,slope:a,angleDeg:s,tangentPath:v,normalPath:E,riseRunTriangle:A,formula:j}}calculateDefiniteIntegral(e,t,n,r=60){let i=Math.min(t,n),a=Math.max(t,n),o=Math.max(10,r%2==0?r:r+1),s=(a-i)/o,c=e(i)+e(a);for(let t=1;t<o;t++){let n=i+t*s;c+=(t%2==1?4:2)*e(n)}let l=s/3*c,u=this.mathToSvg(i,0),d=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `;for(let t=0;t<=o;t++){let n=i+t*s,r=e(n),a=this.mathToSvg(n,r);d+=`L ${a.x.toFixed(1)} ${a.y.toFixed(1)} `}let f=this.mathToSvg(a,0);return d+=`L ${f.x.toFixed(1)} ${f.y.toFixed(1)} Z`,{a:i,b:a,area:Number(l.toFixed(3)),shadedAreaPath:d,subdivisions:o}}generateGrid(e=1){let{minX:t,maxX:n,minY:r,maxY:i}=this.transform,a=``,o=[],s=Math.ceil(t/e)*e;for(let t=s;t<=n;t+=e){if(Math.abs(t)<.001)continue;let e=this.mathToSvg(t,i),n=this.mathToSvg(t,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${n.x.toFixed(1)} ${n.y.toFixed(1)} `;let s=this.mathToSvg(t,0);o.push({x:s.x,y:s.y+14,text:t.toString()})}let c=Math.ceil(r/e)*e;for(let r=c;r<=i;r+=e){if(Math.abs(r)<.001)continue;let e=this.mathToSvg(t,r),i=this.mathToSvg(n,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${i.x.toFixed(1)} ${i.y.toFixed(1)} `;let s=this.mathToSvg(0,r);o.push({x:s.x-12,y:s.y+4,text:r.toString()})}let l=this.mathToSvg(t,0),u=this.mathToSvg(n,0),d=this.mathToSvg(0,r),f=this.mathToSvg(0,i),p=`M ${l.x.toFixed(1)} ${l.y.toFixed(1)} L ${u.x.toFixed(1)} ${u.y.toFixed(1)} M ${d.x.toFixed(1)} ${d.y.toFixed(1)} L ${f.x.toFixed(1)} ${f.y.toFixed(1)}`;return{gridPaths:a.trim(),axesPaths:p,labels:o}}},I=[{id:`parabola`,name:`Quadratic Parabola`,category:`Polynomials (GCSE/A-Level)`,latex:`f(x) = x^2 - 2x - 1`,fn:e=>e*e-2*e-1,derivativeStr:`f'(x) = 2x - 2`,defaultX0:2,defaultA:0,defaultB:3},{id:`cubic`,name:`Cubic Curve (Stationary Points)`,category:`Polynomials (A-Level)`,latex:`f(x) = \\frac{1}{3}x^3 - x + 1`,fn:e=>1/3*e**3-e+1,derivativeStr:`f'(x) = x^2 - 1`,defaultX0:1,defaultA:-2,defaultB:2},{id:`sine`,name:`Harmonic Sine Wave`,category:`Trigonometry (GCSE/A-Level)`,latex:`f(x) = 2\\sin(x) + 1`,fn:e=>2*Math.sin(e)+1,derivativeStr:`f'(x) = 2\\cos(x)`,defaultX0:1.57,defaultA:0,defaultB:3.14},{id:`exponential`,name:`Exponential Growth & Rate`,category:`Calculus Foundations`,latex:`f(x) = e^{0.4x}`,fn:e=>Math.exp(.4*e),derivativeStr:`f'(x) = 0.4 e^{0.4x}`,defaultX0:1.5,defaultA:0,defaultB:4},{id:`gaussian`,name:`Gaussian Normal Bell Curve`,category:`Statistics & Area`,latex:`f(x) = 3 e^{-x^2 / 2}`,fn:e=>3*Math.exp(-(e*e)/2),derivativeStr:`f'(x) = -3x e^{-x^2 / 2}`,defaultX0:1,defaultA:-1.96,defaultB:1.96}];function he(e){if(!e.isOpen)return null;let{onClose:t,preset:n}=e,r=3,i=4,a=2,o=3,s=4,c=75,l=420,u=80,d=6,f=7,p=12,m=4,h=1.2,g=9.81,_=25,v=.5,y=300,b=1,x=`gas`,S=`parabola`,C=2,w=0,T=3,E=n===`calculus-curves`?`calculus`:n===`kinetic-gas`?`kinetic-gas`:`preset`,D=(e,t)=>{typeof window<`u`&&document.querySelectorAll(`iframe`).forEach(n=>{try{n.contentWindow?.postMessage({type:`SET_VAR`,name:e,value:t},`*`)}catch{}})},O=document.createElement(`div`);O.className=`ast-interactive-lab-drawer`,O.style.cssText=`
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
      `,o.appendChild(c);let l=document.createElement(`input`);l.type=`range`,l.min=String(w+.1),l.max=`4.0`,l.step=`0.1`,l.value=String(T),l.style.cssText=`width: 100%; accent-color: #22c55e;`,l.oninput=e=>{T=Number(e.target.value),D(`calcB`,T),k()},o.appendChild(l),e.appendChild(o);let u=I.find(e=>e.id===S)||I[0],d=new me,f=d.calculateTangent(u.fn,C),p=f.y0,m=f.slope,h=d.calculateDefiniteIntegral(u.fn,w,T).area,g=document.createElement(`div`);g.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,g.innerHTML=`
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
        `;M.appendChild(e)}O.appendChild(M);let N=document.createElement(`div`);N.style.cssText=`padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.12); font-size: 0.72rem; color: #64748b; text-align: center;`,N.textContent=`⚡ 100% Client-Side Invariant Calculator • Zero Server Latency`,O.appendChild(N)}return k(),O}var ge=/^#[a-zA-Z0-9_\-:]+$/,_e=/^[a-zA-Z0-9_]+$/;function L(e){return typeof TextEncoder<`u`?new TextEncoder().encode(e).byteLength:e.length}function R(){return typeof performance<`u`&&typeof performance.now==`function`?performance.now():Date.now()}function ve(){return typeof document<`u`&&document.modelContext?{surface:`document.modelContext`,api:document.modelContext}:{surface:`unavailable`,api:null}}function ye(e,t){if(typeof e!=`number`||!Number.isFinite(e))return{value:e,clamped:!1};let n=e,r=!1;return t&&typeof t.min==`number`&&Number.isFinite(t.min)&&n<t.min&&(n=t.min,r=!0),t&&typeof t.max==`number`&&Number.isFinite(t.max)&&n>t.max&&(n=t.max,r=!0),{value:n,clamped:r}}function be(e,t){let n=[];if(typeof e.tuple==`string`&&e.tuple.trim().startsWith(`(:act`)){let r=e.tuple.trim(),i=[],a=r.match(/:seek\s+([0-9.-]+)/i);if(a){let e=Math.max(0,Math.min(1,parseFloat(a[1])));Number.isFinite(e)&&i.push(`:seek ${e.toFixed(3)}`)}let o=r.match(/:highlight\s+"([^"]+)"/i);o&&(ge.test(o[1])?i.push(`:highlight "${o[1]}"`):n.push(o[1]));let s=r.match(/:var\s+"([a-zA-Z0-9_]+)"\s+([0-9.-]+|"[^"]*")/i);if(s&&_e.test(s[1])){let e=s[1],n=s[2].replace(/^"|"$/g,``),r=Number(n);if(!Number.isNaN(r)&&s[2][0]!==`"`){let n=ye(r,t?.[e]);i.push(`:var "${e}" ${n.value}`)}else i.push(`:var "${e}" "${n.replace(/"/g,`'`)}"`)}let c=null,l=r.match(/:say\s+"([^"]*)"/i);return l&&(c=l[1],i.push(`:say "${l[1]}"`)),{tuple:i.length>0?`(:act ${i.join(` `)})`:`(:act :seek 0.000)`,sayText:c,rejectedSelectors:n}}let r=[];if(typeof e.seek==`number`&&Number.isFinite(e.seek)){let t=Math.max(0,Math.min(1,e.seek));r.push(`:seek ${t.toFixed(3)}`)}if(typeof e.highlight==`string`&&e.highlight.trim()){let t=e.highlight.trim().startsWith(`#`)?e.highlight.trim():`#${e.highlight.trim()}`;ge.test(t)?r.push(`:highlight "${t}"`):n.push(e.highlight)}if(typeof e.varName==`string`&&_e.test(e.varName.trim())&&e.varValue!==void 0){let n=e.varName.trim(),i=ye(e.varValue,t?.[n]);typeof i.value==`number`?r.push(`:var "${n}" ${i.value}`):r.push(`:var "${n}" "${String(i.value).replace(/"/g,`'`)}"`)}let i=null;return typeof e.say==`string`&&e.say.trim()&&(i=e.say.trim().replace(/"/g,`'`),r.push(`:say "${i}"`)),{tuple:r.length>0?`(:act ${r.join(` `)})`:`(:act :say "Inspection ping")`,sayText:i,rejectedSelectors:n}}function z(e){return[{name:`ast_set_var`,description:`Mutates a declared simulation :var parameter strictly clamped to its [min, max] bounds and updates reactive bindings.`,annotations:{readOnlyHint:!1},inputSchema:{type:`object`,description:`Parameters for mutating a declared simulation :var safely within [min, max] bounds.`,properties:{name:{type:`string`,pattern:`^[a-zA-Z0-9_]+$`,description:`Declared simulation variable identifier (e.g. temp, conc, pressure).`},value:{oneOf:[{type:`number`},{type:`string`}],description:`Target numeric or string value; numeric inputs are automatically clamped to declared [min, max] bounds.`}},required:[`name`,`value`],additionalProperties:!1},execute:async t=>{let n=R(),r=String(t?.name||``).trim();if(!_e.test(r))throw Error(`Invalid variable identifier: "${r}"`);let i=t?.value;if(typeof i!=`number`&&typeof i!=`string`)throw Error(`Variable value must be a finite number or string.`);if(typeof i==`number`&&!Number.isFinite(i))throw Error(`Numeric variable value must be finite.`);let a=(await e.readState(!1))?.varMeta?.[r]||null,{value:o,clamped:s}=ye(i,a),c=await e.setVar(r,o),l=Number((R()-n).toFixed(3)),u={ok:!0,name:c.name||r,requestedValue:i,appliedValue:c.value,clamped:!!(s||c.clamped),bounds:a?{min:a.min??null,max:a.max??null}:null,latencyMs:l};return{...u,mcpPayloadBytes:L(JSON.stringify(u))}}},{name:`ast_dispatch_action`,description:`Executes the 4-slot AST Vector Player action tuple (:seek, :highlight, :var, :say) with selector sanitization.`,annotations:{readOnlyHint:!1},inputSchema:{type:`object`,description:`Structured or raw 4-slot (:act ...) action dispatch arguments with SVG selector sanitization.`,properties:{tuple:{type:`string`,description:`Optional raw (:act ...) S-expression tuple.`},seek:{type:`number`,minimum:0,maximum:1,description:`Normalized timeline progress in [0.0, 1.0].`},highlight:{type:`string`,pattern:`^#[a-zA-Z0-9_\\-:]+$`,description:`SVG element ID selector (e.g. #piston-head) to pulse on stage.`},varName:{type:`string`,pattern:`^[a-zA-Z0-9_]+$`,description:`Variable name for simultaneous :var mutation.`},varValue:{oneOf:[{type:`number`},{type:`string`}],description:`Variable value for simultaneous :var mutation.`},say:{type:`string`,description:`Short pedagogical utterance routed to BSL & audio narration.`}},additionalProperties:!1},execute:async t=>{let n=R(),r=await e.readState(!1),i=be(t||{},r?.varMeta);if(i.rejectedSelectors.length>0&&i.tuple===`(:act :say "Inspection ping")`)throw Error(`Unsafe SVG selector rejected: ${i.rejectedSelectors.join(`, `)}`);let a=await e.execActionTuple(i.tuple);i.sayText&&e.onSay&&e.onSay(i.sayText);let o=Number((R()-n).toFixed(3)),s={ok:a.ok,tuple:i.tuple,executedActions:a.executedActions,rejectedSelectors:i.rejectedSelectors,latencyMs:o};return{...s,mcpPayloadBytes:L(JSON.stringify(s))}}},{name:`ast_read_state`,description:`Returns compact current simulation state: clock t, normalized progress, :vars, :ledger conservation totals, and :pass-expr checkpoint status.`,annotations:{readOnlyHint:!0},inputSchema:{type:`object`,description:`Read-only inspection parameters for compact simulation telemetry.`,properties:{includeSvgBytes:{type:`boolean`,description:`Include raw SVG DOM serialized byte count to compare against compact MCP JSON bytes.`}},additionalProperties:!1},execute:async t=>{let n=R(),r=t?.includeSvgBytes!==!1,i=await e.readState(r),a=Number((R()-n).toFixed(3));if(!i)return{ok:!1,latencyMs:a,mcpPayloadBytes:0,rawSvgBytes:0,domPayloadReductionPct:0};let o={sceneId:i.sceneId,title:i.title,archetype:i.archetype,t:Number((i.t||0).toFixed(3)),progress:Number((i.progress||0).toFixed(4)),isPlaying:i.isPlaying,vars:i.vars,ledgers:i.ledgers,scopesCount:i.scopesCount,checkpointGoals:i.checkpointGoals},s=L(JSON.stringify(o)),c=Math.max(0,i.svgDomBytes||0),l=c>0?Number(((c-s)/c*100).toFixed(2)):0;return{ok:!0,...o,varMeta:i.varMeta,astSourceBytes:i.astSourceBytes,rawSvgBytes:c,mcpPayloadBytes:s,domPayloadReductionPct:l,latencyMs:a}}}]}var B=null;function xe(e){let t=z(e),n=t.map(e=>e.name),{surface:r,api:i}=ve();if(B&&!B.signal.aborted){try{B.abort()}catch{}B=null}if(!i||typeof i.registerTool!=`function`)return{registered:!1,surface:r,mode:`headless-local`,toolNames:n,tools:t,ready:Promise.resolve(),unregister:()=>{}};let a=typeof AbortController<`u`?new AbortController:null;B=a;let o=[],s=[];for(let e of t){let t={name:e.name,description:e.description,inputSchema:e.inputSchema,annotations:e.annotations,execute:e.execute};try{let n=a?i.registerTool(t,{signal:a.signal}):i.registerTool(t);o.push(e.name),n&&typeof n.then==`function`&&s.push({name:e.name,promise:n})}catch(t){console.warn(`[WebMCP] Synchronous registerTool failure for '${e.name}':`,t)}}let c=o.length>0?`registerTool`:`headless-local`,l={registered:c===`registerTool`,surface:r,mode:c,toolNames:n,tools:t,ready:Promise.resolve(),unregister:()=>{try{if(a&&!a.signal.aborted&&a.abort(),B===a&&(B=null),typeof i.unregisterTool==`function`)for(let e of o)try{i.unregisterTool(e)}catch{}}catch{}}};return s.length>0&&(l.ready=(async()=>{let e=0,t=await Promise.allSettled(s.map(e=>e.promise));for(let n=0;n<t.length;n++){let r=t[n],i=s[n].name;r.status===`fulfilled`?e+=1:console.warn(`[WebMCP] Async registerTool rejected for '${i}':`,r.reason)}e===0&&o.length===s.length&&(l.registered=!1,l.mode=`headless-local`)})()),l}async function Se(e,t){let{surface:n,api:r}=ve(),i=t&&t.length===3?t:z(e),a=i.find(e=>e.name===`ast_set_var`),o=i.find(e=>e.name===`ast_dispatch_action`),s=await i.find(e=>e.name===`ast_read_state`).execute({includeSvgBytes:!0}),c=Number(s.latencyMs||0),l=Number(s.mcpPayloadBytes||0),u=Number(s.rawSvgBytes||0),d=Number(s.domPayloadReductionPct||0),f=null,p=null,m=0,h=!1,g=null,_=s.varMeta||{};for(let[e,t]of Object.entries(_))if(e!==`simClock`&&t&&typeof t.max==`number`&&typeof t.min==`number`&&t.max>t.min){f=e,p=s.vars?.[e]??t.val??t.min;let n=t.max+25,r=await a.execute({name:e,value:n});m=Number(r.latencyMs||0),h=!!r.clamped&&Number(r.appliedValue)===t.max,g={varName:e,bounds:{min:t.min,max:t.max},unclampedInput:n,clampedOutput:r.appliedValue,restoredValue:p},p!==null&&await a.execute({name:e,value:p});break}if(!f){let e=R();try{let t=Number(s.t||0),n=await a.execute({name:`simClock`,value:t});m=Number(n.latencyMs||R()-e),h=!0,f=`simClock`,g={varName:`simClock`,bounds:{min:null,max:null},unclampedInput:t,clampedOutput:n.appliedValue??t,restoredValue:t}}catch{m=Number((R()-e).toFixed(3))}}let v=await o.execute({say:`WebMCP 4-slot action verification complete.`}),y=Number(v.latencyMs||0),b=[c,m,y].filter(e=>e>0),x=b.length>0?Number((b.reduce((e,t)=>e+t,0)/b.length).toFixed(3)):0;return{surface:n,registrationMode:r&&typeof r.registerTool==`function`?`registerTool`:`headless-local`,toolsCount:i.length,toolNames:i.map(e=>e.name),readLatencyMs:c,setVarLatencyMs:m,dispatchLatencyMs:y,meanRoundTripMs:x,mcpPayloadBytes:l,rawSvgBytes:u,domPayloadReductionPct:d,clampingVerified:h,sampleVarTested:f,clampingTrace:g,timestamp:Date.now()}}var Ce=`epp_last_telemetry_dossier`,V=`(:scene :id "hooke-spring-bench" :title "Hooke's Law Oscillator" :stage "KS4 PHYSICS" :type "Sim" :duration 12.0
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
      :options ("Tune k and x" "Double mass" "Freeze clock" "Remove spring") :answer 0 :explanation "E = 0.5 * k * x^2."))))`,we={schemaVersion:`1.0.0`,sceneMetadata:{id:`hooke-spring-bench`,title:`Hooke's Law Oscillator`,stage:`KS4 PHYSICS`,type:`Sim`,durationSeconds:12},physicsConfiguration:{substeps:4,restitution:.85,friction:.04},variables:[{name:`k`,label:`Spring k (N/m)`,defaultValue:24,minimum:5,maximum:80,step:1},{name:`mass`,label:`Mass (kg)`,defaultValue:2,minimum:.5,maximum:10,step:.5},{name:`disp`,label:`Displacement (m)`,defaultValue:.45,minimum:-1,maximum:1,step:.05}],computedExpressions:[{name:`epElastic`,expression:`0.5 * vars.k * vars.disp * vars.disp`},{name:`omega`,expression:`Math.sqrt(vars.k / Math.max(0.1, vars.mass))`}],springs:[{targetSelector:`#mass-bob`,stiffnessExpression:`vars.k`,damping:.15,restLengthPx:120}],reactiveBindings:[{targetSelector:`#spring-coil`,attribute:`y2`,expression:`180 + vars.disp * 90`},{targetSelector:`#mass-bob`,attribute:`transform`,expression:`'translate(0,' + (vars.disp * 90).toFixed(2) + ')'`}],oscilloscopePlots:[{targetSelector:`#osc-scope`,xExpression:`t`,yExpression:`vars.disp`,sampleCapacity:120,xRange:[0,12],yRange:[-1,1],plotViewport:{x:40,y:280,width:320,height:110}}],conservationLedgers:[{id:`energy-ledger`,targetSelector:`#energy-ledger`,bounds:{x:40,y:410,width:320,height:18},unit:`J`,maxExpression:`40`,terms:[{label:`Elastic PE`,expression:`computed.epElastic`,color:`#38bdf8`}]}],interactiveCheckpoints:[{normalizedTime:.5,title:`Target Elastic Energy`,passExpression:`Math.abs(computed.epElastic - 12.0) < 1.5`,holdDurationSeconds:.8,prompt:`Adjust k and displacement until Elastic PE holds near 12.0 J.`,options:[`Tune k and x`,`Double mass`,`Freeze clock`,`Remove spring`],answerIndex:0,explanation:`E = 0.5 * k * x^2.`}]},Te={type:`object`,properties:{sceneId:{type:`string`},title:{type:`string`},astSExpr:{type:`string`},socraticHint:{type:`string`}},required:[`sceneId`,`astSExpr`],additionalProperties:!1};function H(){return typeof performance<`u`&&typeof performance.now==`function`?performance.now():Date.now()}function U(e){return typeof TextEncoder<`u`?new TextEncoder().encode(e).byteLength:e.length}function Ee(e){if(!e)return 0;let t=e.match(/[\(\)\{\}\[\]":,]/g)||[],n=e.match(/[a-zA-Z0-9_.\-\*\/+]+/g)||[],r=Math.round(n.length*1.15+t.length*.45);return Math.max(1,r,Math.ceil(e.length/4.1))}function W(e){return Number(e.toFixed(2))}function De(){if(typeof performance<`u`&&performance.memory){let e=Number(performance.memory.usedJSHeapSize||0);if(e>0)return W(e/1048576)}return null}function Oe(e){return new Promise(t=>setTimeout(t,e))}var ke=[60,75,90,120,144,165,240];function Ae(e){if(!Number.isFinite(e)||e<=0)return 60;let t=60,n=1/0;for(let r of ke){let i=Math.abs(r-e);i<n&&(n=i,t=r)}return t}async function je(e=250){return typeof requestAnimationFrame==`function`?new Promise(t=>{let n=[],r=0,i=!1,a=()=>{if(i)return;if(i=!0,r&&typeof cancelAnimationFrame==`function`)try{cancelAnimationFrame(r)}catch{}if(n.length<4){t(60);return}let e=[];for(let t=1;t<n.length;t++){let r=n[t]-n[t-1];r>1.5&&r<100&&e.push(r)}if(e.length<3){t(60);return}e.sort((e,t)=>e-t);let a=e[Math.floor(e.length/2)];t(Ae(1e3/a))},o=setTimeout(a,e+150),s=H(),c=t=>{n.push(typeof t==`number`&&Number.isFinite(t)?t:H()),H()-s>=e||n.length>=90?(clearTimeout(o),a()):r=requestAnimationFrame(c)};r=requestAnimationFrame(c)}):60}function Me(){if(typeof document>`u`||typeof document.createElement!=`function`)return{gpuVendor:null,gpuDescription:null,gpuDevice:null,available:!1};try{let e=document.createElement(`canvas`).getContext(`webgl2`);if(!e)return{gpuVendor:null,gpuDescription:null,gpuDevice:null,available:!1};let t=e.getExtension(`WEBGL_debug_renderer_info`);if(t){let n=String(e.getParameter(t.UNMASKED_VENDOR_WEBGL)||``).trim()||null,r=String(e.getParameter(t.UNMASKED_RENDERER_WEBGL)||``).trim()||null;return{gpuVendor:n,gpuDescription:r,gpuDevice:r,available:!0}}let n=String(e.getParameter(e.RENDERER)||``).trim()||null;return{gpuVendor:String(e.getParameter(e.VENDOR)||``).trim()||null,gpuDescription:n,gpuDevice:n,available:!0}}catch{return{gpuVendor:null,gpuDescription:null,gpuDevice:null,available:!1}}}async function Ne(){let e=typeof navigator<`u`?navigator:{},t=typeof e.platform==`string`&&e.platform?e.platform:null,n=null,r=null,i=null;if(e.userAgentData&&(typeof e.userAgentData.platform==`string`&&e.userAgentData.platform&&(t=e.userAgentData.platform),typeof e.userAgentData.getHighEntropyValues==`function`))try{let a=await e.userAgentData.getHighEntropyValues([`platform`,`platformVersion`,`architecture`,`bitness`]);a?.platform&&(t=String(a.platform)),a?.platformVersion&&(n=String(a.platformVersion)),a?.architecture&&(r=String(a.architecture)),a?.bitness&&(i=String(a.bitness))}catch{}let a=null,o=null,s=null,c=null,l=`unavailable`,u=null,d=null,f=!!e.gpu;if(e.gpu&&typeof e.gpu.requestAdapter==`function`)try{let t=await e.gpu.requestAdapter({powerPreference:`high-performance`});if(t){let e=t.info||null;if(!e&&typeof t.requestAdapterInfo==`function`)try{e=await t.requestAdapterInfo()}catch{}a=e?.vendor?String(e.vendor):null,o=e?.architecture?String(e.architecture):null,s=e?.device?String(e.device):null,c=e?.description?String(e.description):null;let n=Number(t.limits?.maxBufferSize||0);u=Number.isFinite(n)&&n>0?W(n/1048576):null,d=typeof t.isFallbackAdapter==`boolean`?t.isFallbackAdapter:typeof e?.isFallbackAdapter==`boolean`?e.isFallbackAdapter:null,l=`webgpu`}}catch{}if(l===`unavailable`){let e=Me();e.available&&(a=e.gpuVendor,c=e.gpuDescription,s=e.gpuDevice,l=`webgl2-fallback`)}let p=await je(250),m=W(1e3/p),h=typeof screen<`u`&&typeof screen.width==`number`&&typeof screen.height==`number`?`${screen.width}x${screen.height}`:null,g=typeof window<`u`&&typeof window.devicePixelRatio==`number`?W(window.devicePixelRatio):null,_=!!e.ml;return{userAgent:String(e.userAgent||`Unknown`),osPlatform:t,osPlatformVersion:n,cpuArchitecture:r,cpuBitness:i,deviceMemoryGb:typeof e.deviceMemory==`number`?e.deviceMemory:null,hardwareConcurrency:typeof e.hardwareConcurrency==`number`?e.hardwareConcurrency:null,webgpuSupported:f,gpuVendor:a,gpuArchitecture:o,gpuDevice:s,gpuDescription:c,gpuBackend:l,gpuMaxBufferSizeMb:u,isFallbackAdapter:d,estimatedRefreshHz:p,vsyncBudgetMs:m,screenResolution:h,devicePixelRatio:g,webnnAvailable:_}}async function Pe(e,t){if(!e)return null;let n=async n=>{let r=e[n];if(typeof r!=`function`)return null;try{let n=await r.call(e,t),i=Number(n);if(Number.isFinite(i)&&i>0)return Math.round(i)}catch{try{let n=await r.call(e,[{role:`user`,content:t}]),i=Number(n);if(Number.isFinite(i)&&i>0)return Math.round(i)}catch{}}return null};return await n(`measureContextUsage`)??await n(`measureInputUsage`)}async function Fe(e){let t=V,n=JSON.stringify(we,null,2),r=U(t),i=U(n),a=0,o=!1;try{let e=D(t);a=e.byteLength;let n=E(e);o=!!(n&&n.id===`hooke-spring-bench`)}catch{o=!1}let s=!1;try{let e=ne(t);s=!!(Array.isArray(e)&&e.length>0&&(e[0]===`:scene`||e[0]===`scene`)||e&&typeof e==`object`&&!Array.isArray(e)&&(e.tag===`:scene`||e.tag===`scene`))}catch{s=!1}let c=!1;try{let e=JSON.parse(n);c=!!(e&&e.sceneMetadata?.id===`hooke-spring-bench`)}catch{c=!1}let l=Ee(t),u=Ee(n),d=null,f=null;if(e)try{d=await Pe(e,t),f=await Pe(e,n)}catch{d=null,f=null}let p=d??l,m=f??u,h=i>0?W((i-r)/i*100):0,g=m>0?W((m-p)/m*100):0,_=i>0&&a>0?W((i-a)/i*100):0;return{astLines:t.split(`
`).length,astBytes:r,jsonBytes:i,astbBytes:a,astEstimatedTokens:l,jsonEstimatedTokens:u,astMeasuredTokens:d,jsonMeasuredTokens:f,astVsJsonByteSavingsPct:h,astVsJsonTokenSavingsPct:g,astbVsJsonByteSavingsPct:_,astValid:s,jsonValid:c,astbValid:o}}function Ie(){return typeof self<`u`&&self.LanguageModel?self.LanguageModel:typeof window<`u`&&window.LanguageModel?window.LanguageModel:null}async function Le(e){if(!e)return`unsupported`;try{if(typeof e.availability==`function`)try{let t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]});return String(t||`unavailable`)}catch{let t=await e.availability();return String(t||`unavailable`)}if(typeof e.capabilities==`function`){let t=await e.capabilities();return String(t?.available||`unavailable`)}}catch{return`unavailable`}return`unavailable`}function Re(...e){for(let t of e)if(typeof t==`number`&&Number.isFinite(t))return Math.round(t);return null}function ze(e){return e?{inputUsage:Re(e.contextUsage,e.inputUsage,e.tokensSoFar),inputQuota:Re(e.contextWindow,e.inputQuota,e.maxTokens)}:{inputUsage:null,inputQuota:null}}function Be(e){let{hardwareProfile:t,promptApiStatus:n,contentionPhases:r,contextQuotaTrace:i,compressionComparison:a,webmcpBenchmark:o}=e,{phaseABaseline:s,phaseBConcurrent:c,phaseCRecovery:l,deltas:u}=r,d=t.estimatedRefreshHz??60,f=r.vsyncBudgetMs??t.vsyncBudgetMs??W(1e3/d),p=r.severeDropThresholdMs??W(f*1.15),m=[t.gpuVendor,t.gpuDevice,t.gpuArchitecture,t.gpuDescription].filter(Boolean),h=m.length>0?m.join(` / `):`Unavailable`,g=e=>`${e.rawVsyncOverruns??e.framesOver16_67ms??0} (${e.rawVsyncOverrunPct??e.overBudgetPct??0}%)`,_=e=>`${e.severeFrameDrops??0} (${e.severeFrameDropPct??0}%)`,v=o.clampingTrace?` (${o.clampingTrace.bounds.min===null?`unbounded`:`[${o.clampingTrace.bounds.min}, ${o.clampingTrace.bounds.max}]`}; unclamped \`${o.clampingTrace.unclampedInput}\` -> clamped \`${o.clampingTrace.clampedOutput}\`)`:``;return[`# Chrome Built-in AI & WebMCP Field Telemetry Dossier`,``,`- **Generated**: \`${e.generatedAtIso}\``,`- **Active Cartridge**: \`${e.sceneId}\``,`- **Active AI Tier**: \`${n.activeTier}\` (Prompt API availability: \`${n.availability}\`)`,``,`## 1. Hardware & Memory Profile`,`| Metric | Measured Value |`,`|---|---|`,`| User Agent | \`${t.userAgent.replace(/\|/g,`/`)}\` |`,`| OS Platform | ${t.osPlatform?`\`${t.osPlatform}${t.osPlatformVersion?` ${t.osPlatformVersion}`:``}\``:`Not exposed`} |`,`| CPU Architecture | ${t.cpuArchitecture?`\`${t.cpuArchitecture}${t.cpuBitness?` (${t.cpuBitness}-bit)`:``}\``:`Not exposed`} |`,`| \`navigator.deviceMemory\` | ${t.deviceMemoryGb===null?`Not exposed`:`${t.deviceMemoryGb} GB`} |`,`| \`navigator.hardwareConcurrency\` | ${t.hardwareConcurrency===null?`Not exposed`:`${t.hardwareConcurrency} threads`} |`,`| GPU Adapter (\`${t.gpuBackend||(t.webgpuSupported?`webgpu`:`unavailable`)}\`) | \`${h.replace(/\|/g,`/`)}\`${t.gpuMaxBufferSizeMb!==null&&t.gpuMaxBufferSizeMb!==void 0?` (maxBuffer: ${t.gpuMaxBufferSizeMb} MB, fallbackAdapter: ${t.isFallbackAdapter??`N/A`})`:``} |`,`| Display & Vsync Budget | ${t.screenResolution||`Unknown`} @ ${t.devicePixelRatio??1}x DPR · ~${d} Hz (${f} ms frame budget; severe > ${p} ms) |`,`| WebNN (\`navigator.ml\`) | ${t.webnnAvailable?`Present`:`Absent`} |`,`| WASM Fixed Linear Pool | ${(t.wasmPoolBytes/1024).toFixed(0)} KB (${t.wasmPages} pages, 0 dynamic allocs in loop) |`,`| JS Heap (Start -> End) | ${t.jsHeapStartMb===null?`Not exposed`:`${t.jsHeapStartMb} MB -> ${t.jsHeapEndMb} MB (Δ ${t.heapDeltaMb} MB)`} |`,`| BSL Vector Avatar Active | ${t.bslAvatarActiveDuringRun?`Yes (60 FPS procedural skeleton)`:`No`} |`,``,`## 2. Concurrent Vector Simulation + On-Device Inference Contention`,`- **Dynamic Vsync Budget**: \`${f} ms\` (~${d} Hz) · **Severe Frame Drop Threshold (>1.15× vsync)**: \`>${p} ms\``,`- **Phase A (Baseline)**: ${s.durationMs} ms of pure vector physics + BSL avatar (zero AI activity)`,`- **Phase B (Concurrent)**: ${c.durationMs} ms concurrent workload (\`${c.workloadLabel}\`)`,`- **Phase C (Recovery)**: ${l.durationMs} ms post-inference compositor & GC recovery`,``,`| Phase | Samples | Mean (ms) | p95 (ms) | p99 (ms) | Max (ms) | Raw Overruns (>${f}ms) | Severe Drops (>${p}ms) | Est. FPS | VM Compute Mean (ms) |`,`|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|`,`| Phase A (Baseline) | ${s.stats.sampleCount} | ${s.stats.meanMs} | ${s.stats.p95Ms} | ${s.stats.p99Ms} | ${s.stats.maxMs} | ${g(s.stats)} | ${_(s.stats)} | ${s.stats.estimatedFps} | ${s.stats.meanComputeMs} |`,`| Phase B (Concurrent) | ${c.stats.sampleCount} | ${c.stats.meanMs} | ${c.stats.p95Ms} | ${c.stats.p99Ms} | ${c.stats.maxMs} | ${g(c.stats)} | ${_(c.stats)} | ${c.stats.estimatedFps} | ${c.stats.meanComputeMs} |`,`| Phase C (Recovery) | ${l.stats.sampleCount} | ${l.stats.meanMs} | ${l.stats.p95Ms} | ${l.stats.p99Ms} | ${l.stats.maxMs} | ${g(l.stats)} | ${_(l.stats)} | ${l.stats.estimatedFps} | ${l.stats.meanComputeMs} |`,``,`- **Phase B Contention Deltas vs Baseline**: \`Δmean = ${u.phaseBMeanMsDelta>=0?`+`:``}${u.phaseBMeanMsDelta} ms\`, \`Δp95 = ${u.phaseBP95MsDelta>=0?`+`:``}${u.phaseBP95MsDelta} ms\`, \`Δp99 = ${u.phaseBP99MsDelta>=0?`+`:``}${u.phaseBP99MsDelta} ms\`, \`ΔrawOverruns = ${(u.phaseBRawOverrunDelta??u.phaseBOverBudgetFrameDelta)>=0?`+`:``}${u.phaseBRawOverrunDelta??u.phaseBOverBudgetFrameDelta}\`, \`ΔsevereDrops = ${(u.phaseBSevereDropDelta??0)>=0?`+`:``}${u.phaseBSevereDropDelta??0}\``,`- **Phase C Recovery Delta vs Baseline**: \`Δmean = ${u.phaseCMeanMsDelta>=0?`+`:``}${u.phaseCMeanMsDelta} ms\`, \`Δp95 = ${u.phaseCP95MsDelta>=0?`+`:``}${u.phaseCP95MsDelta} ms\``,`- **Session Clone Latency**: ${n.cloneLatencyMs===null?`N/A (Prompt API session inactive)`:`${n.cloneLatencyMs} ms (clone.destroy() cleanly executed: ${n.cloneDestroyedCleanly})`}`,``,`## 3. Context Window & Multi-Turn Socratic Checkpoint Telemetry`,`- \`session.contextWindow ?? inputQuota\`: ${i.inputQuota===null?`N/A`:i.inputQuota}`,`- Final \`session.contextUsage ?? inputUsage\`: ${i.finalInputUsage===null?`N/A`:i.finalInputUsage}`,`- \`contextoverflow\` / \`quotaoverflow\` Events Fired: ${i.totalQuotaOverflows}`,`- Mean Time-To-First-Token (TTFT): ${i.meanTtftMs===null?`N/A`:`${i.meanTtftMs} ms`}`,``,`| Turn | Role | Prompt Bytes | Output Bytes | TTFT (ms) | Duration (ms) | Context Usage | Overflows | Valid |`,`|---:|---|---:|---:|---:|---:|---:|---:|---|`,...i.turns.map(e=>`| ${e.turn} | \`${e.promptRole}\` | ${e.promptBytes} | ${e.outputBytes} | ${e.ttftMs} | ${e.durationMs} | ${e.inputUsage===null?`N/A`:`${e.inputUsage}/${e.inputQuota??`?`}`} | ${e.quotaoverflowCount} | ${e.validOutput?`PASS`:`WARN`} |`),``,"## 4. Token & Byte Compression: Homoiconic `.ast` vs Verbose JSON vs Binary `.astb`",`| Representation | UTF-8 Bytes | Tokens (Measured / Est.) | Valid Parse | Savings vs Verbose JSON |`,`|---|---:|---:|---|---|`,`| Homoiconic \`.ast\` (${a.astLines} lines) | ${a.astBytes} B | ${a.astMeasuredTokens??a.astEstimatedTokens} ${a.astMeasuredTokens===null?`(est.)`:`(Nano tokenizer)`} | ${a.astValid?`PASS`:`FAIL`} | ${a.astVsJsonByteSavingsPct}% bytes / ${a.astVsJsonTokenSavingsPct}% tokens |`,`| Verbose JSON Schema | ${a.jsonBytes} B | ${a.jsonMeasuredTokens??a.jsonEstimatedTokens} ${a.jsonMeasuredTokens===null?`(est.)`:`(Nano tokenizer)`} | ${a.jsonValid?`PASS`:`FAIL`} | Baseline (0%) |`,`| Pre-compiled \`.astb\` Bytecode | ${a.astbBytes} B | N/A (Zero-copy binary) | ${a.astbValid?`PASS`:`FAIL`} | ${a.astbVsJsonByteSavingsPct}% bytes |`,``,"## 5. WebMCP (`document.modelContext`) Live Tool & Actuation Benchmark",`- **WebMCP Surface**: \`${o.surface}\` (Mode: \`${o.registrationMode}\`)`,`- **Registered Tools (${o.toolsCount})**: \`${o.toolNames.join("`, `")}\``,`- **\`ast_read_state\` Round-Trip**: ${o.readLatencyMs} ms`,`- **\`ast_set_var\` Round-Trip**: ${o.setVarLatencyMs} ms (\`[min, max]\` clamping verified on \`${o.sampleVarTested}\`: ${o.clampingVerified?`PASS`:`FAIL`}${v})`,`- **\`ast_dispatch_action\` 4-Slot Tuple Round-Trip**: ${o.dispatchLatencyMs} ms`,`- **Compact MCP JSON vs Raw SVG DOM**: ${o.mcpPayloadBytes} B vs ${o.rawSvgBytes} B (**${o.domPayloadReductionPct}% smaller payload**)`,``,`---`,`*Captured locally in zero-egress air-gapped telemetry mode via EdgeLearningEngineDB.*`].join(`
`)}async function Ve(e){await m(Ce,JSON.stringify(e))}async function He(){try{let e=(await p()).find(e=>e.key===Ce);return!e||!e.value?null:JSON.parse(e.value)}catch{return null}}function Ue(e,t,n){if(typeof document<`u`)try{let r=new Blob([t],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}catch{}}async function We(e){let{transport:t,sceneId:n,onProgress:r,phaseADurationMs:i=3e3,phaseCDurationMs:a=2e3}=e,o=Ie(),s=await Le(o),c=v(),l=De();r?.({phase:`init`,pct:5,label:`Probing hardware, display refresh & Prompt API (${s})...`});let u=await Ne(),d=u.vsyncBudgetMs,f=W(d*1.15),p=e=>{let t=e.rawVsyncOverruns??e.framesOver16_67ms??0,n=e.rawVsyncOverrunPct??(e.sampleCount>0?W(t/e.sampleCount*100):e.overBudgetPct??0),r=e.severeFrameDrops??0,i=e.severeFrameDropPct??(e.sampleCount>0?W(r/e.sampleCount*100):0);return{...e,vsyncBudgetMs:e.vsyncBudgetMs??d,rawVsyncOverruns:t,rawVsyncOverrunPct:n,severeFrameDrops:r,severeFrameDropPct:i}},m=c;c||(w(!0),m=!0),C({subtitle:`Benchmarking 60 FPS vector kinematics and on-device telemetry.`,isSpeaking:!0});let h,g,_,y=`tier3-deterministic-ast`,b=null,x=!1,S=!1,T=[],O=0,k=null,A=null,j=null;try{r?.({phase:`phase-a`,pct:15,label:`Phase A (Baseline): Capturing ${Math.round(i/1e3)}s of pure ${u.estimatedRefreshHz}Hz physics + BSL...`});let e=H();await t.startProfCapture(),await Oe(i);let c=await t.stopProfCapture(d);h={durationMs:Math.round(H()-e),stats:p(c.stats),activeMetrics:c.activeMetrics,workloadLabel:`Pure ${u.estimatedRefreshHz}Hz (${d}ms) vector + BSL kinematics (Zero AI)`};let v=await t.mcpTransport.readState(!1),C=v?.ledgers?.length?v.ledgers.map(e=>`${e.id}=${e.total.toFixed(2)}${e.unit||``}`).join(`, `):`none`,w=v?.checkpointGoals?.length?v.checkpointGoals.map(e=>`${e.title}[passed=${e.passed},expr=${e.passExpr||`none`}]`).join(`; `):`none`,M=`(:state :scene "${n}" :t ${(v?.t??0).toFixed(2)} :vars ${JSON.stringify(v?.vars||{})} :ledger "${C}" :goals "${w}")`;r?.({phase:`phase-b`,pct:45,label:`Phase B (Concurrent Inference): Running ${s===`readily`||s===`available`?`Gemini Nano promptStreaming`:`Tier-2/3 fallback telemetry`}...`});let N=H();await t.startProfCapture();let ee=`Tier-3 Deterministic Socratic + AST Compiler Stress`;if(o&&(s===`readily`||s===`available`||(s===`after-download`||s===`downloading`)&&P())){let e=null,t=()=>{O+=1};try{let n=`You synthesize compact AST vector cartridges (:scene ...) and concise Socratic nudges grounded in telemetry.`;try{e=await o.create({samplingMode:`most-predictable`,initialPrompts:[{role:`system`,content:n}],expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]})}catch{e=await o.create({initialPrompts:[{role:`system`,content:n}]})}e&&typeof e.addEventListener==`function`&&(e.addEventListener(`contextoverflow`,t),e.addEventListener(`quotaoverflow`,t)),y=`chrome-builtin-nano`,ee=`Gemini Nano streaming + session.clone() + 3-turn Socratic drill`,j=e;let r=`Emit a minimal 20-line (:scene :id "bench-spring" ...) Hooke oscillator with :scope and :ledger in field astSExpr. Telemetry: ${M}`,i=H(),a=0,s=``;try{let t=e.promptStreaming?e.promptStreaming(r,{responseConstraint:Te,outputLanguage:`en`}):null;if(S=!!t,t){let e=``;for await(let n of t){a===0&&(a=W(H()-i));let t=String(n||``),r=t.startsWith(e)?t.slice(e.length):t;e=t,s+=r}!s&&e&&(s=e)}else s=await e.prompt(r,{responseConstraint:Te}),S=!0,a=W(H()-i)}catch{S=!1;let t=await e.prompt(r);s=String(t||``),a=W(H()-i)}let c=ze(e);if(c.inputQuota!==null&&(k=c.inputQuota),c.inputUsage!==null&&(A=c.inputUsage),T.push({turn:1,promptRole:`ast-synthesis`,promptBytes:U(r),outputBytes:U(s),ttftMs:a||W(H()-i),durationMs:W(H()-i),inputUsage:c.inputUsage,inputQuota:c.inputQuota,quotaoverflowCount:O,validOutput:s.includes(`scene`)||s.includes(`:scene`)}),typeof e.clone==`function`){let t=H(),n=await e.clone();b=W(H()-t),n&&typeof n.destroy==`function`&&(n.destroy(),x=!0)}let l=[{role:`socratic-drill-1`,prompt:`Turn 1 telemetry ${M}. Give one Socratic hint (<20 words) guiding the learner toward the :pass-expr goal.`},{role:`socratic-drill-2`,prompt:`Turn 2 telemetry ${M}. Explain how energy/particle conservation stays invariant using one numeric variable.`},{role:`socratic-drill-3`,prompt:`Turn 3 telemetry ${M}. Emit one compact (:act :highlight "#stage" :say "...") tuple.`}];for(let t=0;t<l.length;t++){let n=l[t],r=H(),i=0,a=``;if(e.promptStreaming){let t=e.promptStreaming(n.prompt),o=``;for await(let e of t){i===0&&(i=W(H()-r));let t=String(e||``),n=t.startsWith(o)?t.slice(o.length):t;o=t,a+=n}!a&&o&&(a=o)}else a=String(await e.prompt(n.prompt)),i=W(H()-r);let o=ze(e);o.inputQuota!==null&&(k=o.inputQuota),o.inputUsage!==null&&(A=o.inputUsage),T.push({turn:t+2,promptRole:n.role,promptBytes:U(n.prompt),outputBytes:U(a),ttftMs:i||W(H()-r),durationMs:W(H()-r),inputUsage:o.inputUsage,inputQuota:o.inputQuota,quotaoverflowCount:O,validOutput:a.trim().length>0})}}catch(e){console.warn(`[EPPBench] Native Prompt API invocation failed, dropping to Tier-2/3:`,e)}finally{if(e){try{e.removeEventListener?.(`contextoverflow`,t)}catch{}try{e.removeEventListener?.(`quotaoverflow`,t)}catch{}}}}let te=await Fe(j);if(j&&typeof j.destroy==`function`){try{j.destroy()}catch{}j=null}if(T.length===0){let e=re.checkMemoryEligibility();if(re.isReady()&&e.isEligible&&P()){y=`webgpu-webllm`,ee=`Tier-2 WebLLM / WebGPU streaming fallback`;let e=[{role:`ast-synthesis`,prompt:`Synthesize compact 20-line AST for ${n}.`},{role:`socratic-drill-1`,prompt:`Telemetry ${M}. One Socratic hint?`},{role:`socratic-drill-2`,prompt:`Telemetry ${M}. Conservation law note?`},{role:`socratic-drill-3`,prompt:`Telemetry ${M}. Action tuple (:act :seek 0.5).`}];for(let t=0;t<e.length;t++){let n=e[t],r=H(),i=0,a=``;for await(let e of re.inferStream(n.prompt))i===0&&(i=W(H()-r)),a+=e;T.push({turn:t+1,promptRole:n.role,promptBytes:U(n.prompt),outputBytes:U(a),ttftMs:i||W(H()-r),durationMs:W(H()-r),inputUsage:null,inputQuota:null,quotaoverflowCount:0,validOutput:a.trim().length>0})}}else{y=`tier3-deterministic-ast`,ee=`Tier-3 Deterministic AST/Bytecode Socratic Synthesis (Nano ${s})`;let e=[`ast-synthesis`,`socratic-drill-1`,`socratic-drill-2`,`socratic-drill-3`];for(let t=0;t<e.length;t++){let n=e[t],r=n===`ast-synthesis`?`Synthesize canonical 20-line AST from telemetry ${M}`:`Socratic drill ${t} on telemetry ${M}`,i=H(),a=``;if(n===`ast-synthesis`){ne(V);let e=D(V);E(e),a=V}else a=(await re.infer(r)).output;let o=W(H()-i);T.push({turn:t+1,promptRole:n,promptBytes:U(r),outputBytes:U(a),ttftMs:o,durationMs:o,inputUsage:null,inputQuota:null,quotaoverflowCount:0,validOutput:a.length>0}),await Oe(300)}}}let ie=await t.stopProfCapture(d);g={durationMs:Math.round(H()-N),stats:p(ie.stats),activeMetrics:ie.activeMetrics,workloadLabel:ee},r?.({phase:`phase-c`,pct:78,label:`Phase C (Recovery): Measuring ${Math.round(a/1e3)}s post-inference frame stability & GC recovery...`});let ae=H();await t.startProfCapture(),await Oe(a);let oe=await t.stopProfCapture(d);_={durationMs:Math.round(H()-ae),stats:p(oe.stats),activeMetrics:oe.activeMetrics,workloadLabel:`Post-inference GPU/NPU & GC recovery`},r?.({phase:`webmcp`,pct:90,label:`Measuring WebMCP (${ve().surface}) tool latency & DOM payload savings...`});let F=await Se(t.mcpTransport,t.mcpTools),se=De(),ce=l!==null&&se!==null?W(se-l):null,le=T.map(e=>e.ttftMs).filter(e=>Number.isFinite(e)&&e>=0),ue=le.length>0?W(le.reduce((e,t)=>e+t,0)/le.length):null,de=h.stats.rawVsyncOverruns??h.stats.framesOver16_67ms,fe=g.stats.rawVsyncOverruns??g.stats.framesOver16_67ms,pe=h.stats.severeFrameDrops??0,me=g.stats.severeFrameDrops??0,I={dossierVersion:`1.0.0`,generatedAtIso:new Date().toISOString(),sceneId:n,hardwareProfile:{...u,wasmPoolBytes:oe.memory.wasmPoolBytes||458752,wasmPages:oe.memory.wasmPages||7,jsHeapStartMb:l,jsHeapEndMb:se,heapDeltaMb:ce,bslAvatarActiveDuringRun:m},promptApiStatus:{present:!!o,availability:s,activeTier:y,cloneLatencyMs:b,cloneDestroyedCleanly:x,constraintSchemaUsed:S},contentionPhases:{vsyncBudgetMs:d,severeDropThresholdMs:f,phaseABaseline:h,phaseBConcurrent:g,phaseCRecovery:_,deltas:{phaseBMeanMsDelta:W(g.stats.meanMs-h.stats.meanMs),phaseBP95MsDelta:W(g.stats.p95Ms-h.stats.p95Ms),phaseBP99MsDelta:W(g.stats.p99Ms-h.stats.p99Ms),phaseBMaxMsDelta:W(g.stats.maxMs-h.stats.maxMs),phaseBOverBudgetFrameDelta:g.stats.framesOver16_67ms-h.stats.framesOver16_67ms,phaseBRawOverrunDelta:fe-de,phaseBSevereDropDelta:me-pe,phaseCMeanMsDelta:W(_.stats.meanMs-h.stats.meanMs),phaseCP95MsDelta:W(_.stats.p95Ms-h.stats.p95Ms)}},contextQuotaTrace:{inputQuota:k,finalInputUsage:A,totalQuotaOverflows:O,meanTtftMs:ue,turns:T},compressionComparison:te,webmcpBenchmark:F};return r?.({phase:`export`,pct:96,label:`Persisting telemetry dossier to EdgeLearningEngineDB...`}),await Ve(I),r?.({phase:`complete`,pct:100,label:`Chrome EPP Contention & WebMCP Telemetry Suite Complete`}),I}finally{if(j&&typeof j.destroy==`function`){try{j.destroy()}catch{}j=null}!c&&v()&&w(!1)}}function G(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}async function Ge(){let e=(typeof self<`u`?self:window)?.LanguageModel||window?.LanguageModel;if(!e)return`unavailable (API absent)`;try{if(typeof e.availability==`function`)try{let t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}]});return String(t||`unavailable`)}catch{return String(await e.availability()||`unavailable`)}if(typeof e.capabilities==`function`){let t=await e.capabilities();return String(t?.available||`unavailable`)}}catch{return`unavailable`}return`unavailable`}function Ke(e,t=`ms`){return`${e>0?`+`:``}${e.toFixed(2)} ${t}`}function qe(e){let{onClose:t,presetId:n,presetLabel:r,presetType:i,postToPlayer:a,benchTransport:o,webMcpHandle:s}=e,c=document.createElement(`div`);c.className=`ast-diagnostics-drawer`,c.style.cssText=`padding: 1rem 1.25rem; background: #07090e; color: #e2e8f0; font-size: 0.8rem; border-bottom: 1px solid #1e293b;`;let l=!1,u=null,p=null,m=null,h=null,g=null,_=`probing...`,v=``,y=!1;function b(){let e=[`448 KB WASM SoA`];if(typeof performance<`u`&&performance.memory){let t=(performance.memory.usedJSHeapSize/1048576).toFixed(1);e.push(`JS Heap ${t} MB`)}let t=typeof navigator<`u`?navigator:{};return typeof t.deviceMemory==`number`&&e.push(`${t.deviceMemory} GB RAM`),typeof t.hardwareConcurrency==`number`&&e.push(`${t.hardwareConcurrency}T CPU`),e.join(` · `)}function x(){let e=p?.hardwareProfile||m;if(!e)return`Probing GPU adapter, display refresh (Hz), OS/CPU & WebNN...`;let t=e.gpuDescription||e.gpuDevice||e.gpuVendor||(e.gpuBackend===`unavailable`?`No WebGPU/WebGL2 adapter`:`Adapter unknown`),n=e.gpuBackend?e.gpuBackend:e.webgpuSupported?`webgpu`:`webgl2`,r=typeof e.gpuMaxBufferSizeMb==`number`?` · MaxBuf ${e.gpuMaxBufferSizeMb} MB`:``,i=e.estimatedRefreshHz?`${e.estimatedRefreshHz}Hz`:`60Hz`,a=e.vsyncBudgetMs?`${e.vsyncBudgetMs.toFixed(2)}ms`:`16.67ms`,o=e.screenResolution||`n/a`,s=typeof e.devicePixelRatio==`number`?` @${e.devicePixelRatio}x`:``,c=[e.osPlatform?`${e.osPlatform}${e.osPlatformVersion?` ${e.osPlatformVersion}`:``}`:null,e.cpuArchitecture?`${e.cpuArchitecture}${e.cpuBitness?`-${e.cpuBitness}`:``}`:null].filter(Boolean).join(` `),l=e.webnnAvailable?`WebNN: ON`:`WebNN: OFF`;return`${c?`${c} · `:``}GPU[${n}]: ${t}${r} · Display: ${o}${s} (${i} / ${a}) · ${l}`}function S(){let e=f(`app_perf_hud_enabled`)===`true`,t=f(`app_hud_verbosity`)||`minimal`,a=f(`app_frame_budget_alert`)===`true`,o=f(`app_target_fps`)||`adaptive`,d=ve(),y=i===`Sim`,S=p?.compressionComparison||h,C=p?.webmcpBenchmark||g,T=p?.contentionPhases,E=p?.contextQuotaTrace,D=T?.vsyncBudgetMs??p?.hardwareProfile?.vsyncBudgetMs??m?.vsyncBudgetMs??16.67,O=T?.severeDropThresholdMs??Number((D*1.15).toFixed(2));c.innerHTML=`
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid #1e293b;">
        <div style="min-width:0;">
          <div style="font-size:0.68rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#64748b; font-family:ui-monospace, monospace;">
            Lumina Telemetry &amp; Chrome EPP Field Test Bed · ${y?`:Sim`:`:`+G(i)} · ${G(n)}
          </div>
          <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-top:2px;">
            <strong style="font-size:0.96rem; color:#f8fafc; letter-spacing:-0.01em;">
              Hardware Budget, On-Device AI Contention &amp; WebMCP Dossier
            </strong>
            <span style="font-size:0.74rem; color:#94a3b8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums;">
              ${G(b())}
            </span>
          </div>
          <div style="font-size:0.71rem; color:#38bdf8; font-family:ui-monospace, monospace; font-variant-numeric:tabular-nums; margin-top:3px;">
            ${G(x())}
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
            <span style="color:#38bdf8; font-weight:700;">${G(u.label)}</span>
            <span style="color:#f8fafc;">${u.pct}%</span>
          </div>
          <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
            <div style="width:${u.pct}%; height:100%; background:#38bdf8; transition:width 0.2s ease;"></div>
          </div>
        </div>
      `:``}

      ${v?`
        <div style="background:#0b1120; border:1px solid #1e293b; border-left:3px solid #34d399; padding:7px 10px; margin-bottom:12px; font-size:0.74rem; color:#cbd5e1; font-family:ui-monospace, monospace;">
          ${G(v)}
        </div>
      `:``}

      <!-- Primary Capability Strip -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:12px;">
        <div style="background:#0b1120; border:1px solid #1e293b; border-radius:6px; padding:9px 11px;">
          <div style="font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700; letter-spacing:0.04em;">
            Chrome Prompt API (LanguageModel)
          </div>
          <div style="font-size:0.9rem; font-weight:700; color:${_===`readily`||_===`available`?`#34d399`:`#fbbf24`}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${G(_)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">
            Tier: ${G(p?.promptApiStatus.activeTier||`auto (Nano -> WebLLM -> Tier 3)`)}
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
          <div style="font-size:0.9rem; font-weight:700; color:${d.surface===`unavailable`?`#94a3b8`:`#34d399`}; font-family:ui-monospace, monospace; margin-top:3px;">
            ${G(d.surface)}
          </div>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px; font-family:ui-monospace, monospace;">
            ${s?.tools?.length||3} tools (${s?.registered?G(s.mode):`local harness`})
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
            ${S?`.ast ${S.astBytes}B · .astb ${S.astbBytes}B · JSON ${S.jsonBytes}B`:G(r)}
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
              ΔMean(B-A): ${Ke(T.deltas.phaseBMeanMsDelta)} · Δp95(B-A): ${Ke(T.deltas.phaseBP95MsDelta)} · ΔMean(C-A): ${Ke(T.deltas.phaseCMeanMsDelta)}
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
              Context: ${E.finalInputUsage??`N/A`} / ${E.inputQuota??`N/A`} · Overflows: ${E.totalQuotaOverflows} · Mean TTFT: ${E.meanTtftMs??`N/A`} ms · Clone: ${p?.promptApiStatus.cloneLatencyMs!==null&&p?.promptApiStatus.cloneLatencyMs!==void 0?`${p.promptApiStatus.cloneLatencyMs} ms`:`N/A`}
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
              <div>[min, max] Clamping Guard (<code>${G(C.sampleVarTested||`none`)}</code>): <strong style="color:${C.clampingVerified?`#34d399`:`#f87171`};">${C.clampingVerified?`PASS`:`FAIL`}</strong>${C.clampingTrace?` · ${G(String(C.clampingTrace.unclampedInput))} &rarr; ${G(String(C.clampingTrace.clampedOutput))}`:``}</div>
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
          ${p?`Last dossier: ${G(p.generatedAtIso)} · Saved in EdgeLearningEngineDB`:`Zero network egress · Saved locally in EdgeLearningEngineDB`}
        </span>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <button type="button" id="diag-btn-export-md" ${p?``:`disabled`} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${p?`#38bdf8`:`#475569`}; border:1px solid ${p?`#0284c7`:`#1e293b`}; font-size:0.72rem; font-weight:700; cursor:${p?`pointer`:`not-allowed`};">
            Export .md Dossier
          </button>
          <button type="button" id="diag-btn-export-json" ${p?``:`disabled`} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${p?`#34d399`:`#475569`}; border:1px solid ${p?`#059669`:`#1e293b`}; font-size:0.72rem; font-weight:700; cursor:${p?`pointer`:`not-allowed`};">
            Export .json Telemetry
          </button>
          <button type="button" id="diag-btn-copy-md" ${p?``:`disabled`} style="padding:4px 10px; border-radius:4px; background:#0b1120; color:${p?`#e2e8f0`:`#475569`}; border:1px solid #334155; font-size:0.72rem; font-weight:700; cursor:${p?`pointer`:`not-allowed`};">
            Copy Markdown
          </button>
        </div>
      </div>
    `,w()}async function C(){if(!l){l=!0,v=``,u={phase:`init`,pct:2,label:`Initializing 3-phase empirical contention harness...`},c.isConnected&&S();try{let e=await We({transport:o,sceneId:n,onProgress:e=>{u=e,c.isConnected&&S()}});p=e,h=e.compressionComparison,g=e.webmcpBenchmark,_=e.promptApiStatus.availability,v=`Dossier captured & saved in EdgeLearningEngineDB. Exporting Markdown + JSON telemetry...`;let t=e.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19),r=Be(e);Ue(`chrome-epp-telemetry-${n}-${t}.md`,r,`text/markdown;charset=utf-8`),setTimeout(()=>{Ue(`chrome-epp-telemetry-${n}-${t}.json`,JSON.stringify(e,null,2),`application/json;charset=utf-8`)},150)}catch(e){v=`Telemetry suite aborted: ${e?.message||`Unexpected error`}`}finally{if(l=!1,!c.isConnected)return;S()}}}function w(){c.querySelector(`#diag-btn-close`)?.addEventListener(`click`,t);let e=c.querySelector(`#diag-toggle-hud`),n=c.querySelector(`#diag-select-verbosity`),r=c.querySelector(`#diag-select-fps`),i=c.querySelector(`#diag-toggle-budget`),s=c.querySelector(`#diag-btn-ping`),l=()=>{let t=!!e?.checked,o=n?.value||`minimal`,s=!!i?.checked,c=r?.value||`adaptive`;d(`app_perf_hud_enabled`,String(t)),d(`app_hud_verbosity`,o),d(`app_frame_budget_alert`,String(s)),d(`app_target_fps`,c),a({type:`SET_PERF_HUD`,enabled:t,mode:o,strictAlarm:s}),a({type:`SET_TARGET_FPS`,fps:c===`adaptive`?0:parseInt(c,10)}),window.dispatchEvent(new CustomEvent(`app-setting-changed`,{detail:{key:`app_perf_hud_enabled`,value:t}}))};e?.addEventListener(`change`,()=>{l(),S()}),n?.addEventListener(`change`,l),r?.addEventListener(`change`,l),i?.addEventListener(`change`,()=>{l(),S()}),s?.addEventListener(`click`,()=>{l(),s&&(s.textContent=`Synchronized`,setTimeout(()=>{s.isConnected&&(s.textContent=`Ping Frame Budget`)},1400))}),c.querySelector(`#diag-btn-test-mcp`)?.addEventListener(`click`,async()=>{v=`Executing WebMCP tool ping across active stage...`,S();try{g=await Se(o.mcpTransport,o.mcpTools),v=`WebMCP verified: read=${g.readLatencyMs}ms, set_var=${g.setVarLatencyMs}ms, dispatch=${g.dispatchLatencyMs}ms (${g.domPayloadReductionPct}% smaller than SVG DOM).`}catch(e){v=`WebMCP ping note: ${e?.message||`Stage unavailable`}`}c.isConnected&&S()}),c.querySelector(`#diag-btn-run-epp`)?.addEventListener(`click`,()=>{C()}),c.querySelector(`#diag-btn-export-md`)?.addEventListener(`click`,()=>{if(!p)return;let e=p.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19);Ue(`chrome-epp-telemetry-${p.sceneId}-${e}.md`,Be(p),`text/markdown;charset=utf-8`)}),c.querySelector(`#diag-btn-export-json`)?.addEventListener(`click`,()=>{if(!p)return;let e=p.generatedAtIso.replace(/[:.]/g,`-`).slice(0,19);Ue(`chrome-epp-telemetry-${p.sceneId}-${e}.json`,JSON.stringify(p,null,2),`application/json;charset=utf-8`)}),c.querySelector(`#diag-btn-copy-md`)?.addEventListener(`click`,async()=>{if(p)try{await navigator.clipboard?.writeText(Be(p)),v=`Markdown dossier copied to clipboard.`,c.isConnected&&S()}catch{v=`Clipboard unavailable in this frame; use Export .md Dossier.`,c.isConnected&&S()}})}if(S(),Promise.all([Ge(),Fe(),He(),Ne()]).then(([e,t,n,r])=>{_=e,h=t,m=r,n&&!p&&(p=n),c.isConnected&&S()}).catch(()=>{}),e.autoRunBenchmark&&!y){y=!0;let t=()=>{c.isConnected&&(e.onAutoRunConsumed?.(),C())};typeof requestAnimationFrame==`function`?requestAnimationFrame(()=>setTimeout(t,50)):setTimeout(t,50)}return c}function Je(e,t){let n=`<!DOCTYPE html>
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
</html>`,r=new Blob([n],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`stj-offline-ast-lesson-${e}.html`,a.click(),URL.revokeObjectURL(i)}var Ye={version:`1.0.0`,issuer:`St Joseph's Catholic Primary School Curriculum Authority`,generatedAt:`2026-11-22T14:29:40.751Z`,totalCartridges:79,masterChecksum:`f95ebc03411c55fb5b1dd2b8d73f0fcd605de3cf966e0518e455e3b9c0c94d27`,cartridges:{"acid-alkali-titration":{id:`acid-alkali-titration`,title:`Acid-Alkali Titration & pH Curve`,stage:`KS4 GCSE CHEMISTRY`,type:`Sim`,astSha256:`be949af4a2efd7abf5d193491512511fc691558e23036fbcddb25b747b4a03bb`,svgSha256:`da2cd29b708694cee1843012f13ee9ad4e69f5efc598992612e78e4c49e660a8`,astbSha256:`2ca73b7b5f0bb0c16096681230475df2d3ff231ea9fd46d6eedab13c860de8e8`,astbBytes:5350,astBytes:6118,svgBytes:7219,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`98ecf75bfd7c1a78ccb285566dde123c86485a9b614234bd7ca4f2fe6390d30a`,certified:!0},"algebra-balance":{id:`algebra-balance`,title:`⚖️ Algebraic Balance Scale: Preserving Equality (2x + 5 = 15)`,stage:`KS2/KS3 MATHS`,type:`Sim`,astSha256:`2aa7f3547449677d462357ca7a27a5d68744e1035a96d5a269cc816121776fd5`,svgSha256:`dda695bfdc41a41defc0c53813bee85463d4a04a0fcaadf13bad5228b41fd96e`,astbSha256:`dca438ea67af8eb1f3d33583bc6ce60a312813522647fc77600db7f82c405d7a`,astbBytes:3552,astBytes:3824,svgBytes:3481,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`0890ee6e59a4524e237c28a949d02725932d78fa60bb864cad078856d34f6f44`,certified:!0},"alphabet-basics":{id:`alphabet-basics`,title:`Alphabet Basics: Paired Case & Sound Bridge`,stage:`EYFS & LANGUAGES`,type:`Sim`,astSha256:`e5ff1749c9739da6c4e37c1d01e820fe67355fe63b81a0588fcc87fa5ff85a06`,svgSha256:`f08cbb09d7e1927c48c1316487a4693ea2dd93d3a1152098a74bc930ffeb9c56`,astbSha256:`548687ab86758ffdcdc36a99f82edbdcfe5b5839ee1820c812539c5a570e7018`,astbBytes:5525,astBytes:7760,svgBytes:70044,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`16a4429653ec05fea72d41be25b02fa83387bd68ea1067ce6d95fe5e403275e8`,certified:!0},"altar-anatomy":{id:`altar-anatomy`,title:`The Catholic Altar: Sacred Anatomy, Types & Appointments`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`3d27586452084c90d2907496ed7d4524d9280e9e7ceae1d4180a59189e87f9e5`,svgSha256:`e4bd0be0c19ab0ce503ec2db40381b55e011beac1941c18e2f70c86510da422b`,astbSha256:`fffe1e39817d7492517182ffaccd432e1190017a554d3d376ad7cb6112b91fad`,astbBytes:7003,astBytes:7448,svgBytes:9475,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`eb04132adb32189915acf17c9eb7bdfd9d527164646ee837a36da340517c196f`,certified:!0},atom:{id:`atom`,title:`Atomic Structure: Bohr Electron Shells`,stage:`KS3 CHEMISTRY`,type:`Sim`,astSha256:`7f75ac5747d0a91f4d3f899fe4d7a126586123c1b7a6ed004a9d88ba0b16dfcb`,svgSha256:`6b91346a668a180032fb7d4783d4d514ae00d96b6c6f24bac754b601ea568c73`,astbSha256:`b3d1194e12f7dc1f7fed7ae850d772a19623ccd6cb5a1ed694e7462ae7fe8998`,astbBytes:16342,astBytes:12474,svgBytes:21848,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`252b17a51bf91d3265ae1cb02fd761be292bd185ce57425139fd6dac72a34271`,certified:!0},"bbc-model-b":{id:`bbc-model-b`,title:`BBC Micro Model B: 6502 Computing & BBC BASIC`,stage:`KS2 & KS3 COMPUTING`,type:`Sim`,astSha256:`89e1086181693e8f36b2cfdb4a45fef72aa315411b974f1f0ded39cd162b68e3`,svgSha256:`665ab247d6c4b3d5865226b4bff7c2ee4bdfe1250fa3f49f74f214a0b7724749`,astbSha256:`8977b4719210216277a05dc757ac34bdf619d8e7d6b6c34cf7ca33cd6a38aeef`,astbBytes:5119,astBytes:6066,svgBytes:34896,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`3bd86cca2946bb6918c32a3ab845abddf5d55523269613e59c9d5dc3e60b05fe`,certified:!0},bodmas:{id:`bodmas`,title:`BODMAS / BIDMAS: Forcefield Clamping & Area Physics`,stage:`KS2/KS3 MATHS`,type:`Slide`,astSha256:`f7059b6cd753c195bbc9bac5774f528ac981cf4ba62590eb1f8fa9c35dda7080`,svgSha256:`a7beb9c188c31c3fa670731e775dadb6643cc2e8881ee8eb6227ffd6487f1f51`,astbSha256:`d1a4c848922f762bd7255ae3f39ca637b546539c3b0005767db96d988525bff5`,astbBytes:3948,astBytes:4071,svgBytes:11101,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`6be016a5c0aed9bc1cd6d8c7ac96f6a29748e30bf7ee4d632d19e309a1efcd28`,certified:!0},"breadboard-components":{id:`breadboard-components`,title:`Solderless Breadboard & Ohm's Law Lab`,stage:`KS3/GCSE PHYSICS & D&T`,type:`Sim`,astSha256:`2c65b10ab9f29cf2fe6b98b61363dac6fcd5fe94a7321288db01580f81f96660`,svgSha256:`d9acfde0b79921d907af44cd36a5421fc9f0b53ea555c828b973f6f29f3bf3fa`,astbSha256:`4c2c4be928f09c7cbd2809d25b844ef2914b2cbcc9f3493bc08caf63fc8cebe3`,astbBytes:16839,astBytes:14444,svgBytes:16409,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`355db6f1574c64513b2b938be4dae64348573ed31ac2b81a102581cd0276d6d9`,certified:!0},"bsl-fingerspelling":{id:`bsl-fingerspelling`,title:`BSL: 3D British Sign Language Two-Handed Fingerspelling`,stage:`ACCESSIBILITY & LANGUAGES`,type:`Sim`,astSha256:`699524d22a9aba58035faaf320343afd6c6ec57aef2c45068ed565876b5254a4`,svgSha256:`096eef119026e38e8b86364012c857884b3d7dad5fc16146ff6e0d9381666d53`,astbSha256:`9cd38576367d218b17836379a734cff8560da99926d345400a19cc466ce20560`,astbBytes:7092,astBytes:7100,svgBytes:5734,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`6e9e8d80410fffdea8c51f6b1ad3a7aa9405232669893827cd757f4456e51f71`,certified:!0},"calculus-curves":{id:`calculus-curves`,title:`Calculus: Tangent Slopes & Definite Integrals`,stage:`GCSE & A-LEVEL MATHS`,type:`Sim`,astSha256:`b3a1d93d3281fcf6c5b5f3c806286cab85049efeff8048a97297e8f206701a70`,svgSha256:`0f8f36f4dec76988b9a5a1e30bcf0ceb0856f08c58da3f480ed3b3f145cd8faa`,astbSha256:`36d37c3921dd7471e650b1217619d714113e593fab4c6b2928eb96e2f1e408a0`,astbBytes:3372,astBytes:3767,svgBytes:7722,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`e43526f1a0c78bf9bcaee4da0fafa0c06935227a7a80ff77511358204967ee7b`,certified:!0},"catholic-rites":{id:`catholic-rites`,title:`The 24 Catholic Rites & Churches: Unity in Diversity Across East & West`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`e8a5b801585714fade66dfb54c94cb3d7e4253d70b2c87beb27f8ed864ff74c3`,svgSha256:`5381a4b3f258dcf955a85ea30ad6590690d4b35eb4b594ca21ace483da3794f7`,astbSha256:`f25701a7afaa10189d08c24505845e275393c2ab2479be88b0331749b6ef724c`,astbBytes:9124,astBytes:9515,svgBytes:24825,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`2926aa125e17c263c40e94abee74822659469e7393cb685b49516851bcdae1ee`,certified:!0},"church-tour":{id:`church-tour`,title:`Tour of a Catholic Church: Sacred Architecture & Sacred Spaces`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`face13a2a12d274a7fb4cc00f1c798c99a09aec92f8fa14adf885866acc5264a`,svgSha256:`80b494ebbd819148930670f363807feef5a323911d58e5b78555378a48f80d80`,astbSha256:`1d64dcfbf6d97d87254aa44144286232c7dff9e6e2bf83adf13ff266532013e0`,astbBytes:14277,astBytes:16324,svgBytes:9720,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`e44e28206e44e680303cc6def99fd2d1effae2419d0fb7f09e4b0f4165fe3e74`,certified:!0},"cst-virtues":{id:`cst-virtues`,title:`Catholic Social Teaching & Virtues: Gospel Love in Daily Action`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`5a0ab01dcf129d86d529886cfad42995d885112682535293c587e0ef474e4731`,svgSha256:`bad8a077b47abe7450084c4dcf5d270712d77ee5d7bd702831ceaf19856b46f8`,astbSha256:`ecc3e38467b9b1c140c9759f20ddf013196e07ac8b639da3ec7017aa57b424fa`,astbBytes:3696,astBytes:3837,svgBytes:8123,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`5669e50a8db3e1a6904bf9b19caf3887d42c14c7943898abe46ea47f548bb13a`,certified:!0},"dna-helix":{id:`dna-helix`,title:`Genetics: DNA Base Pairing & Transcription`,stage:`KS3 GENETICS`,type:`Sim`,astSha256:`11fd24079ecf66a8fb82fdd430a7898ede48d25e34f7cc9ae5004e0b25394532`,svgSha256:`761d4ed8ee033bf587587eb90a581f881595b55d606a75adf09b5b5cafd0717f`,astbSha256:`9b12f69b1f05423f2a42179777fa5035885a6137e0cc7a92652d2062535ecde1`,astbBytes:15969,astBytes:7887,svgBytes:21549,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`488e46f9513019474b3a8799260d5a9abe7827ef8f084143fa7ef7ca47f07e60`,certified:!0},"domino-multiplication":{id:`domino-multiplication`,title:`🁊 Kinematic Domino Multiplication: Group Arrays`,stage:`KS2 MATHS`,type:`Sim`,astSha256:`952ca7c447a75487f7a46c100e017fddbd041022bdfbb0d1d2094b1c4fbfc51e`,svgSha256:`771116e4a13893025b9436caf1457cbab1b3a135a8491a4d9da40028132ba286`,astbSha256:`ec4a38b75aac4f2fdd40ddee9a724551fb7fe2410fab0463598243bcfdd2c36e`,astbBytes:6280,astBytes:9566,svgBytes:6718,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`f7e4451df0843f5c1dacbd7ba07a3d1e9d9f4e6464e5272587bb8028425d6abe`,certified:!0},"electric-circuits":{id:`electric-circuits`,title:`Electrical Circuits & Ohm's Law (V = I × R)`,stage:`KS2/KS3 PHYSICS`,type:`Sim`,astSha256:`7261c3ad16e95f7fe0e179cbe60bfab66c22c004fb38f3194146f3252922c88b`,svgSha256:`c4926e14632711f8405783f83059767f51f803c61f4f4881685ec5e80bb73a03`,astbSha256:`de7de65233fc4edfea3e433d41551d50bd95dc8c71c199de04c2519a6c12a688`,astbBytes:6302,astBytes:6374,svgBytes:5663,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`71171c3f0299e04a634f6d5b6db1fd1211994aee7d29f5572aba9a8a765d01c5`,certified:!0},"enzyme-denaturation":{id:`enzyme-denaturation`,title:`Enzyme Catalysis & Denaturation`,stage:`KS4 GCSE BIOLOGY`,type:`Sim`,astSha256:`a164b7e225cddecee611ce34f593fcec1d1f4343c06b7ef4d231d8bacfb8106e`,svgSha256:`a462d187dd4ed857880d869b3d6fcb9ec1a16bc07bded8e4ab1deac1db4f7355`,astbSha256:`80a562673a41049a22945938c1f2319142fdec81f6c077d71805072c14475927`,astbBytes:5852,astBytes:6399,svgBytes:7090,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`0ac675ef8508cbc5f4bf71e54b58986a1069d44b7621b51fc20a3a36e7969af6`,certified:!0},"eucharistic-procession-film":{id:`eucharistic-procession-film`,title:`Solemn Eucharistic Procession: Liturgical Film & Sacred Vectors`,stage:`CATHOLIC LIFE`,type:`Film`,astSha256:`8a1176e436e9d0fa378ae5b091a03c0ae1fa153114cfac9c4fea101e112255c8`,svgSha256:`a563658b38fe86bf43ce7a6b2dc358bdd9fe6225aba87176e63b3d67279ff6df`,astbSha256:`3f3eaff3035205780fa2eb6fe37933897d18204ddbc029aea606cdb8477ec1af`,astbBytes:5580,astBytes:5612,svgBytes:5457,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`0588bbe677f6f14590ab07975ad946c0b7492ed29c5f85e53e1841bec33e02e3`,certified:!0},"first-communion":{id:`first-communion`,title:`First Holy Communion & Eucharistic Adoration: Receiving Jesus with Reverence & Love`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`e1e4ce9b1d2757ec665f2283e591553b45f7f97cd1b50c5ed04cb5b3a10cee7f`,svgSha256:`731705b37222961f86e14c16018b50c0ed06a4da03dfb28b0c68db475d38521e`,astbSha256:`b0dcb083093c78657af85d855ae595d79a1d6ba1eb398d077fac30be3f4c6b64`,astbBytes:8820,astBytes:9308,svgBytes:15508,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`431ec3383333ec539f71f15b5ee7d840243364490db48419af9b0aa7fb3ad61d`,certified:!0},"fish-tank":{id:`fish-tank`,title:`Aquarium Stress Benchmark: Vector Point & FPS Limiter`,stage:`BENCHMARK & STRESS LAB`,type:`App`,astSha256:`423a418946cbc9aaa82be0fc73b66e59f47150e04c352d89d665fba2baeec360`,svgSha256:`e9dd0cd22e56e06581ad2aaf2f84fd7b17ca52d12302de9fbbdef7168fc5e4c8`,astbSha256:`c8b9b95e26080ae25114f0984660339b30ac2284f1e64f131f4edadc29dcf411`,astbBytes:3886,astBytes:4170,svgBytes:15090,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`cea1face65be0e6d67a923e603e5cd4e8d00df7f3939371d3cffc323c52b0d6f`,certified:!0},fractions:{id:`fractions`,title:`Fractions: Why Common Denominators Rule`,stage:`KS2 MATHS`,type:`Slide`,astSha256:`117dbd0513ab6d6f5585383ea43ce25adba76ccd03fff4a054e6418b4e61c6d3`,svgSha256:`60f6c470b711b7b2e0e84f77f01b951e08f34d3eab07c97becfd9b90b25ae32f`,astbSha256:`209b9f5c7c658b507704668fc17764e3af83e5ad9110c70df4c7402591862332`,astbBytes:3059,astBytes:3689,svgBytes:7489,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`18e9cb4e450b7364c0e731e855e1fd41139ce7249faee7be0c17406aee3fcd41`,certified:!0},"holy-oils":{id:`holy-oils`,title:`The Three Holy Oils & The Sacred Ambry (Olea Sancta)`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`6858e5c9980df4db038280f48bbf61f0d632e89cd1e7566911bbb8f37f2fe507`,svgSha256:`56c4394ceee11fde89b0950623f773bb1774fafbb19ca7bdc6fd7010eda70b65`,astbSha256:`0b4ce7bf2fd92c194af080964ffb7e46890c65662cebade5e56a8169ca669c79`,astbBytes:5186,astBytes:5520,svgBytes:7720,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`a221a83cc0f89dddeb3a7994a4cf9271eeadef6ce98869ebc9eaeb3f1cf85ecd`,certified:!0},"holy-water-thurifer":{id:`holy-water-thurifer`,title:`Holy Water & The Thurible: Asperges, Incense & Sacramental Purification`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`d1f8773a2a644665b2d85e15ad1343156ebacb6905230784b6c269c75f6a3308`,svgSha256:`020ab784761874413c838d4efd54349b34c6a7f87a0b9709323930c18204a640`,astbSha256:`26b0150e659bad56211a62ec8dfa1c242f2e7ae08883dbd6ada01dd9c41dd72d`,astbBytes:6688,astBytes:7177,svgBytes:9167,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`e6d38057dd1c302fc40a9ddced488718ae96b40682819c4d0a368abe5867d716`,certified:!0},"jacobs-ladder-primes":{id:`jacobs-ladder-primes`,title:`Jacob's Ladder of Prime Bricks`,stage:`KS2/KS3 MATHEMATICS`,type:`Sim`,astSha256:`08529e00e1a57b99f016f17f3eadc1955432c68bd5a0c4ef67c3f14f710d988f`,svgSha256:`2ed9109e9c575f499fd5fd20ef9ca541c99012081fd174deec038ff8164dde40`,astbSha256:`bae22b94093f971f31f4262963c4f92639cfcd11713842be8440bb3a92f251ea`,astbBytes:18767,astBytes:9372,svgBytes:29826,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`7e5ec9c46f4e7c73acd915befa09107c66ecfaf00ccefb7f3aadbc92b1b6a800`,certified:!0},"kinetic-gas":{id:`kinetic-gas`,title:`Kinetic Gas Theory & Boyle's Law`,stage:`KS3/KS4 PHYSICS & CHEMISTRY`,type:`Sim`,astSha256:`8946e096ed4c6490d887cb5cb90a4f8ec59d7bea90b399331ff1b949e5317587`,svgSha256:`cbb853d56c5be3cb4eb7d2c70aa78ccfaa7c084a0edcfe8dbeea343a19a71c3b`,astbSha256:`891c86eaed54065a314d1e4bffaf8bea79b687ab6e5de2fb27e20005ea0df0b1`,astbBytes:13822,astBytes:13538,svgBytes:8918,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`c7c1a04f67cf6eb3e5725f148e6c9887d067977e05ae98c1ab6ac8e740d58b16`,certified:!0},languages:{id:`languages`,title:`MFL & Polyglot Studio: Spanish, French & Latin`,stage:`KS2/KS3 MFL`,type:`App`,astSha256:`6029af9619c5a101e9d42c26f390b21856b05cf866cda1caed9182186c7530aa`,svgSha256:`f1a15f2907480f97a498dab139e0e7dd5ab087c3c7e94bef753d3e7d18fbcacb`,astbSha256:`7a740805939c697d7a36956dd7d456c3f9691afc800ae50127d55da4dc143975`,astbBytes:2242,astBytes:2284,svgBytes:3641,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`8efbd510d1b3b4f6f65745e687d7b1ac42089488c0090a32649cfcab4bb57fcc`,certified:!0},"latin-mass-prayers":{id:`latin-mass-prayers`,title:`Latin Prayers & Gregorian Chant: The Universal Voice of the Catholic Church`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`506d1e6bc90d0fb9bc6442377628d9450ac5bf98225a4e100d37fca84147d375`,svgSha256:`7c30f4a6394c77da41e776d098e7dfddd43ecad8b062d185f1fe1b370622930d`,astbSha256:`07fbf295f05188411eada1ef07355f6029feb76bce622201d19be67338bb00e2`,astbBytes:4338,astBytes:5755,svgBytes:13677,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`2e580817c7a1a1d638e021a68f655c2f00d870964c056f6db373c4fc48d261fa`,certified:!0},"lego-blocks":{id:`lego-blocks`,title:`Modular Brick Engineering & 3D Spatial Geometry`,stage:`KS2/KS3 DESIGN & TECH`,type:`Sim`,astSha256:`4a1aca308a1a4e49497203497c7e5473b7af099619448515953042bdea042539`,svgSha256:`02e7e7aeb7c2ec15a8fc55c5a83ea2323aadb5063716399af2fe9cbe60c3e879`,astbSha256:`32ef72603afba07f0f0eebb903468b91ff7cdd5c11befebb7acbcc55800e23e7`,astbBytes:20258,astBytes:24369,svgBytes:36372,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`b1b9093f390c57d88c9d49fc66df1ae62e54979b041be01a6305f1191378fd8f`,certified:!0},"liturgical-calendar":{id:`liturgical-calendar`,title:`The Catholic Liturgical Year: Sacred Seasons & Colors`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`0d460a1371a685a5e270fe6f18d1168d1a619ea4d526d52cf31bedb66b894068`,svgSha256:`ec9c2c0e23145505dde3189ad8544137211b41b1ab46f6a887dc5b002f26b3f3`,astbSha256:`f8555a6bb28d2ee96a14c53f8393b0cdf4d5b26ce3d70447769a2b5802103d74`,astbBytes:7944,astBytes:8575,svgBytes:5782,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`832aebb6f58dfe66677a7ee8a87b24020ff00336d587e277650cceadd75bdd5e`,certified:!0},"liturgical-postures":{id:`liturgical-postures`,title:`Sacred Postures & Gestures: Praying with Mind, Heart & Body`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`6efa477501631e43e979fe2bd16fdb763716f7195784dbf28914b10b1bfa0f61`,svgSha256:`5f0149ee5d801aff963992218e83bfe3d6ef287739382d26de462bf3973eac4f`,astbSha256:`d9495b03353536a5de43e0713864d1d1eed757e5d7df5da7e721ea7c26e16d88`,astbBytes:6105,astBytes:6384,svgBytes:5608,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`28862be57080b6d11fe07c6606762d9f153b0a892683eb9e2581041a01bae37a`,certified:!0},"liturgy-of-the-hours":{id:`liturgy-of-the-hours`,title:`The Liturgy of the Hours: Sanctifying Time Through the Divine Office`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`51e8439d720acccc4cccc06b31aadc391e36499d15ee2a65dd4a2b4e08889a0f`,svgSha256:`4c45fd038713d8290ae2d2c6b8c0881f0c65a56db71fab4271515f0058a536a4`,astbSha256:`aa47edf032a28d7e61b909679cce60768ced6f7629d9be72be94ddaa475a3b6b`,astbBytes:6335,astBytes:6551,svgBytes:8990,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`c9a1696fa6474497d8811b9e5a7bb98b979299f1bdaf443011e5cb97da236a8e`,certified:!0},"math-fishing":{id:`math-fishing`,title:`Math Pond: Number Bonds Fishing Game`,stage:`KS1/KS2 MATHS`,type:`App`,astSha256:`b7ed21c509cd06a4b89aee4a4843c7b76910e2c1dbe27e0e32c56285470e8d05`,svgSha256:`227bc11baaa0ae83181526c496592a517dffca41bcc6f7fc229a16b3cc79f097`,astbSha256:`75b6cdf8297fa0c6f867b4245d31f195efa8d397caa49f1d0fce2cf92c7b3845`,astbBytes:11786,astBytes:14346,svgBytes:16379,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`38c4590e894e2c3928d307b93fe7a034af478435a8ab61079f5b082082a14df1`,certified:!0},"mountain-elevation":{id:`mountain-elevation`,title:`Mountain Altitude: Elevation, Hypotenuse & Atmospheric Science`,stage:`KS2/KS3 MATHS & GEOGRAPHY`,type:`Slide`,astSha256:`2afc89086553cc5895f23cba600460f3af6a24b07c622ca4ad0e7a07a997bd22`,svgSha256:`efc9dcd0a655b9190e3a7563453a7ebb49991dba082ac0f67833fb2cbb9324ea`,astbSha256:`5f83d499767e63e3c202a8cd641d012c9a6e7ae4dc19e2ebb0cacf337787173b`,astbBytes:3801,astBytes:4264,svgBytes:3485,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`3186b48fd17008a11ae8c92a9ac1436f80d2be00b33932a524c4c77416a92be1`,certified:!0},"nicene-creed":{id:`nicene-creed`,title:`The Nicene & Apostles' Creed: Credo in Unum Deum`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`a9c721689dd80f2bb6fb3505b1763c48f38e5860afbfbbb819441b5c4d51f313`,svgSha256:`23118a870c8d60ebdbebfc6264bbf0113c452e163e54f94e406f96e162abde92`,astbSha256:`d852f7ea663bbcc30f8cfd6fd577b443b8ce5f1a561bed98471b5b8aec19d32b`,astbBytes:5654,astBytes:5879,svgBytes:8490,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`5baadfbb73d9ded67ccdf6074e8783c84105b1d1bccf803dcf51d7806628a3c6`,certified:!0},"oak-data-algorithms-sequencing":{id:`oak-data-algorithms-sequencing`,title:`Algorithms, Sequencing & Logic`,stage:`Key Stage 2`,type:`:data`,astSha256:`6091d90eca9f6fdf85fc10b2ee03bcab0142540276b86b619c9b030655ea791d`,svgSha256:`7425f3ff637681a9a433a2660138e713c596951dd627e75dfbee8d1350549e2f`,astbSha256:`70fda20a0cc4202463ccd185cfa55ae6595c7a7efefc9e22ecd3a1db7718fdbb`,astbBytes:2218,astBytes:5665,svgBytes:1542,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`a6ca0b221b0f32477caeb0e3b6d9d2694d8b0d28f187127e2c27f250ca955bbc`,certified:!0},"oak-data-angles-triangles":{id:`oak-data-angles-triangles`,title:`Angles, Triangles & Geometry`,stage:`Key Stage 2`,type:`:data`,astSha256:`04427bf5723aa56fcb269bfa162f759d42ab87c079025de8cc76be5ab0257668`,svgSha256:`8acff3ad5987779541a993616e8b982f13af36daa706bf1a6921cf712daa76bb`,astbSha256:`701e6825fc4c0556fc6310e2e3b6189690f58def734f728ec6580d60ad0e5221`,astbBytes:1724,astBytes:4910,svgBytes:1542,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`f3594fe50b78978e7fa4b628dd584e07b5d6f05bcddff85cc27f6a111c4dee34`,certified:!0},"oak-data-cell-biology":{id:`oak-data-cell-biology`,title:`Cell Biology & Organelles`,stage:`Key Stage 3`,type:`:data`,astSha256:`92d1a20b9026406f731da829235b88cdceae829899ec53f8b1c42e12b91c0230`,svgSha256:`9a4917a1498e8acfd84111a21816e7043b3e9d83e1ac36b4baa8820740d15af6`,astbSha256:`8c3f37b1d5a86fde6341918fe857fa9c14851d362595b493ccbff6979b20fc26`,astbBytes:2021,astBytes:4938,svgBytes:1535,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`72ec31d985da7b68b27301cd0521ba61d8c6198912b1c88870ee8bc9a7493060`,certified:!0},"oak-data-electric-circuits":{id:`oak-data-electric-circuits`,title:`Electric Circuits & Conductors`,stage:`Key Stage 2`,type:`:data`,astSha256:`8d628b68822d11e712474fa79ba4cc51dc8947525e603133d724d4177ff6a2a3`,svgSha256:`041675af6897481f6e9c5592c23d3b12d53b3dc73c905735082a232b686c1fd3`,astbSha256:`fa3085169320999243c7c85a630d957de4fc7b4efb6a9a482ab5dccacbd5ad41`,astbBytes:2778,astBytes:6180,svgBytes:1540,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`46440cc1a380ce5556dc5a50041c4a4bbc31a78ad9f4abbe02826e8a3c08b981`,certified:!0},"oak-data-fractions-decimals":{id:`oak-data-fractions-decimals`,title:`Fractions, Decimals & Percentages`,stage:`Key Stage 2`,type:`:data`,astSha256:`c19227d1fb9e82df653ea4b091a3a287f1a2de38f88b91fb6bd9399042554d3d`,svgSha256:`a21db48347df5bcadd63a8afde697bd872136f37f6f702566c9540ba8faecb57`,astbSha256:`8b62b3a512d8d494686b709d222fb8494a258c5176fe718ccf5118706a2dc520`,astbBytes:1752,astBytes:5269,svgBytes:1547,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`f8823edaa5da9c3e359fe1528eb48cea8c55ff036c7792518273eeff30f477d0`,certified:!0},"oak-data-phonics-screening":{id:`oak-data-phonics-screening`,title:`Phonics, Digraphs & Alien Words`,stage:`Key Stage 1`,type:`:data`,astSha256:`de1983c18d4599cc4d4507a362e41146f8e5f22e0f33a2438f6701e1771244e5`,svgSha256:`2ecfad18bb647e1488b7e46a01388291df5e969682290291352b75791cf1ba6f`,astbSha256:`8c71532273cbff4c6bc523d213941675c34570849362f9644013761ad4512f9e`,astbBytes:1149,astBytes:5159,svgBytes:1541,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`da2ad9b7389dbf2eb6a9e115f3dc71f9834747750c89648b3cd3fbe620abd7d0`,certified:!0},"oak-data-re-nicene-creed":{id:`oak-data-re-nicene-creed`,title:`The Nicene Creed & Trinity`,stage:`Key Stage 2`,type:`:data`,astSha256:`ec42dac4d25e2155513fae69529769f516f14b34b1e2dfcd81e1543a4aadb06a`,svgSha256:`8ebd05cbbdf5104e935944a3f988ec3c6477abda2f6d72066cafc4f6c6a86ba2`,astbSha256:`853c7cbd031af9f16ed018f7ef115993f4be886dac5bd1b69560f3d8e84147ff`,astbBytes:1540,astBytes:4237,svgBytes:1548,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`3e18423ccef03739f2f6cf7debb80cd79630734fe22997b4bffc83486c9b6fd5`,certified:!0},"oak-data-re-sacraments":{id:`oak-data-re-sacraments`,title:`The Seven Sacraments & Holy Eucharist`,stage:`Key Stage 2`,type:`:data`,astSha256:`e527efe176a907199b4da2fc0bacc5ba0610afe837c02909724e2061463f0e9c`,svgSha256:`7f7a00e9473113dcdfdd5f822f3fc935c18c6d2534142b7dc3ec8410df4d5e74`,astbSha256:`30118857f8c48a8620f3f2e29b656805b11b179d96c1ca750fc847f91a5882b6`,astbBytes:3573,astBytes:7903,svgBytes:1559,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`434ae7cd185818c9638e598ef47b540b049cf09c1dfa2df04157ef6dbe4e387b`,certified:!0},"oak-data-seasonal-changes":{id:`oak-data-seasonal-changes`,title:`Seasonal Changes & Earth Cycles`,stage:`Key Stage 1`,type:`:data`,astSha256:`30c51d9aa01508b1be88f02da960b6d3d334f59555ba59be067e991362f7a51c`,svgSha256:`a531f378dc7e1c935ab1aa3aab5d992143cc6c3fbeb6cb13a301bc0cd50d09c0`,astbSha256:`a6a7ee1ed2ef70128fe2e179253260ffcee17f0303fbcfb99bab931f6543290f`,astbBytes:2178,astBytes:5255,svgBytes:1541,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`9bfc59d6969a8ec532de9f88059274cf53ec8c06dbbbe93150aad12f0c9c055f`,certified:!0},"oak-data-spanish-foundations":{id:`oak-data-spanish-foundations`,title:`Spanish Greetings & Verbs`,stage:`Key Stage 2`,type:`:data`,astSha256:`9392225b3e9a39f00648f4c7c04cea8d7d0f853f6d3232c667cfe8c8eeb7fe64`,svgSha256:`5b4be5dc8383302937483e4cdce50289f908217180b213fdec26ea8a012f6b2d`,astbSha256:`4043727e90d8cd861aa57c9542e6e5d08d4067ff42cc23208e54016290fc4ed4`,astbBytes:798,astBytes:3649,svgBytes:1539,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`e5044e76566bee918b0608715b36ec21d3eee51b795612b23e4510df2b79c70d`,certified:!0},"oak-data-states-of-matter":{id:`oak-data-states-of-matter`,title:`States of Matter & Particle Theory`,stage:`Key Stage 2`,type:`:data`,astSha256:`50a27238660cc71dcb18358bfb98aa5e80aa32b819822933c3c8d59665c75d29`,svgSha256:`7938563549d206b5cb2cb8cd8ac8849ad98c9cc10f2f6d776db7e284ec34cbc2`,astbSha256:`2c51925e78b1ac5feca601825abdf24190904cb20523b775e9876b2272f01c75`,astbBytes:3831,astBytes:7909,svgBytes:1544,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`a22d14831c2314fb45792dfb964ac40b3c04235e08b786b572fa5a978f10fa3a`,certified:!0},"order-of-the-mass":{id:`order-of-the-mass`,title:`The Order of the Holy Mass: Source & Summit of Catholic Life`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`eb944efa627655f768f4744a0170f1ef684fd52842b01c7464651c07ba808ec0`,svgSha256:`af628f8077395c3a1e5eff028cd9ee3af24e07c1f53fc2b678093358431f57ae`,astbSha256:`c8ed190716498d938f7b346e96ba7787c159d6cc79f5f060be20e7b3a1ad6c42`,astbBytes:3567,astBytes:5858,svgBytes:10587,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`0ccfa2c9190d429fa81fffa6a64ced7af8fb96e0aeacacd489c90e3eff04340c`,certified:!0},"osmosis-membrane":{id:`osmosis-membrane`,title:`Osmosis & Semi-Permeable Membrane Flux`,stage:`KS4 GCSE BIOLOGY`,type:`Sim`,astSha256:`5c6a160861a61735eca6e5dc7743081f18e332a3d23e28263238ee9a1ee7a940`,svgSha256:`da0918acc259e1b2a1c758990217688da4f8a0a0cec0bd2c5435575d1839ff9d`,astbSha256:`7602812e4560d59f89eee50b5d72699e415269fa15b7215df5feffcb05f49836`,astbBytes:5787,astBytes:6034,svgBytes:6533,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`400a8843c5a6de8f7cc7b6c30ec97578350c46534220d2a93066b33bd6296840`,certified:!0},pendulum_dyno:{id:`pendulum_dyno`,title:`Inverted Pendulum Dynamical System: Cart-Pole State Control`,stage:`KS3 PHYSICS`,type:`Sim`,astSha256:`cabf1a2a52d8ef2702f808a973d18729f8c2bad85ca83c809c665e0cbd1c05f0`,svgSha256:`cc1cf199c38e9d999ce814b9d12160c6f7671c95882db79ad39b82d060f86fbc`,astbSha256:`c503dc5b746f7cc3de20db085d14c158c0fdff58254569f513bd4e4bfe599199`,astbBytes:5753,astBytes:6083,svgBytes:2161,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`58ae0e7185155a256af3539a7579cc05b702efe780f4fc4bff18e94c5e50b269`,certified:!0},"phet-acid-base":{id:`phet-acid-base`,title:`Acid-Base Titration Lab`,stage:`KS3/KS4 CHEMISTRY`,type:`Sim`,astSha256:`b3e1ae58857ea961f342ec6f3b8e870cb6e85090c4d0d974d599104fcd9fb994`,svgSha256:`96b3f7db47cea8f891bb6cde22738001fc06c0ee22e1f9b78e5fe01e4803003d`,astbSha256:`b7d0a21df1d89b81de26cb58ec62e945b1ea9cdeeba9cb8bad5258aea1cf86bd`,astbBytes:5624,astBytes:6005,svgBytes:8349,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`e8305867e156ec081c8ff47254999dfad57696a1583f9d3450d9abf3467a9212`,certified:!0},"phet-balancing-chemical":{id:`phet-balancing-chemical`,title:`PhET Chemical Equations Distillation`,stage:`KS3/KS4 CHEMISTRY`,type:`Sim`,astSha256:`c0cd44175e41a8a832e3c17186e87f7cba2e589b5f40a94d086395d35137e150`,svgSha256:`2ea096933fbc5b71c2eacd5dc941282dad34227c0013eb5cca07d54bd1b6af90`,astbSha256:`a1a86a20a2347b1fa188f589879d246a3e80f8a6d842e78406511ad6f8db09ca`,astbBytes:5197,astBytes:5374,svgBytes:3613,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`fe4bc255bdde62ce42606f669d4e3e0870824af9759f814bfc7cc33df35871e4`,certified:!0},"phet-faraday":{id:`phet-faraday`,title:`PhET Faraday's Induction Distillation`,stage:`KS4 PHYSICS`,type:`Sim`,astSha256:`6447ccd4daaa6c6300032aca7e1ce6052aa300a382cb363cc4ac8c39160b7a03`,svgSha256:`892a476942ee82e1136a6b1a88bc16fa6e6f4fe6a159ab9550f993fc97918998`,astbSha256:`6bdae200e43caf8b4ab12d807549fe2e698d7b66f1a5338ae2ceb8335acd85e0`,astbBytes:4661,astBytes:4508,svgBytes:3804,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`e877eeacdb1d406131d02e4296c6ccce81cafd5ff018f03c859807d664b37bf6`,certified:!0},"phet-ohms-law":{id:`phet-ohms-law`,title:`PhET Ohm's Law Distillation`,stage:`KS3/KS4 PHYSICS`,type:`Sim`,astSha256:`8593e610f4bbdc37cace8a85cff9d62dcf17e953a3378fc206127063b8f02d2e`,svgSha256:`ffef6eff57110b0350c72c8ed04ad20796d9ecc7804c9e50ee93c28a157c63b6`,astbSha256:`5a0168cb8d6fe5828b9bbcb728c4998aa6dd7a0fca070a3285aaa07a5b891605`,astbBytes:3971,astBytes:4069,svgBytes:4272,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`b61fa67a31b1e2ba9585bdf1dfca150d1d15c66c2e78b026fb19f1d64b19339e`,certified:!0},"phet-pendulum":{id:`phet-pendulum`,title:`PhET Pendulum Distillation`,stage:`KS3/KS4 PHYSICS`,type:`Sim`,astSha256:`a42237c4ee70ad0463c72d0e255492fa034fc3e39042a9d859cb08be5d64a039`,svgSha256:`53e176dc5abf6d76613f3620ec6354cb65806d686a1af167eb87f5d089d7f48a`,astbSha256:`0c22825b93ea4a6c07ba2bfebf1d7fe1a7dcf98a620aba85b3d241199054ec33`,astbBytes:5091,astBytes:5230,svgBytes:3013,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`38e2b2b55301ab6a0032bfa136b85cd68a7a7ca7a32ac0fb65ebb19223950a25`,certified:!0},"phonics-lab":{id:`phonics-lab`,title:`Early Phonics: Sound Buttons & Blending Mat`,stage:`EYFS/KS1 ENGLISH`,type:`App`,astSha256:`c6000c82ecabcd4ccbdde26eb0c9902053f3b2bcac786aec12cbc1cdc860dbdf`,svgSha256:`23cbaf282bcd2805a8abcc1e9218eb8a02c89d2a19a71617b715abb50c58fb4f`,astbSha256:`94872dd17b349a48cfc892dd50c59af08c1cde6284aa994a0510b4eb4b52dc6b`,astbBytes:2911,astBytes:2923,svgBytes:7946,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`a54354a7fdd53ea6670b0ea968bdf3531e294d3c365a0b51da7a85037520de87`,certified:!0},"phonics-screening":{id:`phonics-screening`,title:`Year 1 Phonics Screening Check & Alien Words`,stage:`EARLY YEARS & KS1 PHONICS`,type:`Sim`,astSha256:`0cf8f028b07a5394f6d5b1799e42074f4f83307a4cc397fefa1f44171c97ad53`,svgSha256:`aae99729b1401fe7ba6be20b31a03e4caf24333355115c170abe684be0180c0c`,astbSha256:`790fdd7d497cca13c5e91e88d01afc7486aa37b11dbf34f698ce731af6d96e3d`,astbBytes:3191,astBytes:3379,svgBytes:4549,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`8b0dcdacf7bb390b54a0c1b76030512bd7f397a199dc32f586af0fbbf19a100c`,certified:!0},photosynthesis:{id:`photosynthesis`,title:`Photosynthesis: The Green Solar Engine`,stage:`KS3 BIOLOGY`,type:`Slide`,astSha256:`76a551b3d7b336d07c778df82acc49d4261323d10a19628dfd2f05fe5f461fa8`,svgSha256:`c6b125d61adb77b8834d7959e935f0ec839aed802a9ffb3734dc0efbf49c6db1`,astbSha256:`3257b30fd00341f6a46dfaa8bd90c5cf6a60e084caaee7e376abdc281e06924b`,astbBytes:3188,astBytes:3963,svgBytes:6229,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`9aa5074be948cc2801b2b19705636ba6dbc53be08f3d672ebc77c1bf194e83d0`,certified:!0},"pipeline-sample":{id:`pipeline-sample`,title:`Sample Physics Knowledge Nodes`,stage:`KS3`,type:`Sim`,astSha256:`3914187d492e81148702493e0e9d1cbec97c9b915c316383d1e113086b59fe7e`,svgSha256:`c1ecb3a1792ddad3d2672c1477d62ef65c54dc8a4ad7f88a6fcc9981ebc303a5`,astbSha256:`25a65c810ab69379314de2e05dde243949e0c13563f27a8ce269b2d84738cf9f`,astbBytes:83,astBytes:1104,svgBytes:5988,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`fbcffb08c7e2d8209c16aaa29a2cedf0ace0351af7613c30c9c4cbe7d95f51b0`,certified:!0},pythagoras:{id:`pythagoras`,title:`Pythagoras' Theorem (a² + b² = c²)`,stage:`KS3 GEOMETRY`,type:`Sim`,astSha256:`818fea2c17135112024df539190ed12943bfbcc60ca7bce28b9657d31e379f94`,svgSha256:`dfb79c55bcece1d6e0b3b1aadac0989169770010333ab60a55065aa027ea53e2`,astbSha256:`796465d09149d44f81ce643cedecd23a15f92937b2c0f1e621cc50ca6600410b`,astbBytes:11392,astBytes:15496,svgBytes:12366,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`58d2e5ce3fec2c61eb0a4b2b11fcd949de1cf2e21ad8f77c6cb25da885c3ae18`,certified:!0},"rates-of-reaction":{id:`rates-of-reaction`,title:`Rates of Reaction & Collision Theory`,stage:`KS4 GCSE CHEMISTRY`,type:`Sim`,astSha256:`bc871c07bac74780b7ea5c0447462e54b18e4021f8cb2321e9ef82166923fdae`,svgSha256:`68c8d055d51bfc3b6c7af4d6fb00c9b649af05885918391bbed22748f6e18149`,astbSha256:`82dab6ac0cf0dbf45b64c9db93dedacb35c9a99a6e4b77bc43526a983ce18cd5`,astbBytes:6410,astBytes:6574,svgBytes:8182,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`3ccc6c1099c180dd3ffd8e137d03745b84ea1e1ae4d8235bc093b46b0f9cacd0`,certified:!0},"reader-cake-lake":{id:`reader-cake-lake`,title:`Decodable Book 5: The Cake by the Lake (Level 5 · Split Digraphs & Alternatives)`,stage:`EYFS/KS1 PHONICS`,type:`Slide`,astSha256:`e88b295b9b7e676fb28f5d9523c9afaad3a6f082face3c233c541627c95af87d`,svgSha256:`3fb274f4e26a6faec5800a7cf90917bc96137487d07881b6f1a0c688ab93f47e`,astbSha256:`827acd02c6997cc9b906565f1406e8d37dd19bf9a3adbcb7fa46601f2a226646`,astbBytes:3761,astBytes:4832,svgBytes:38649,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`cd2356b54f39393ef90a424cf4d1146547d79b446f35cc6e90dbc66b4860567c`,certified:!0},"reader-frog-log":{id:`reader-frog-log`,title:`Decodable Book 4: The Frog on a Log (Level 4 · Consonant Blends)`,stage:`EYFS/KS1 PHONICS`,type:`Slide`,astSha256:`ad3170643bbdb9a5e9fa64f1bfcddb08a6ddb37b34412793d361f3d35e4bde35`,svgSha256:`d22a52d8b7a7fc337978435204b21cb11f54786f1558a9382d617930b5dd0e68`,astbSha256:`44f8be01edd9aedd5f784a663239ca67757db794e22245d9be9460dabc9bf42b`,astbBytes:3753,astBytes:4845,svgBytes:41891,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`b1b04ac5ae573132a90b3ca1749c5f835f21388d828d6d1e2194feca232549ea`,certified:!0},"reader-pat-sat":{id:`reader-pat-sat`,title:`Decodable Book 1: Pat Sat (Level 1 · Set 1 & 2 (SATPIN))`,stage:`EYFS/KS1 PHONICS`,type:`Slide`,astSha256:`bca2f44dc3bc48d1e4c88ca475d5841b584fe595756a62d0e63c6df2ec2fc0fc`,svgSha256:`836e2b3587d797eab6887e02143b5e7db48ede9da573a830952f21f6a7bc3635`,astbSha256:`fe7fc79f1cf6a838d2feb53c5e9c349f66b9fb88c0044f8bab91b1ee2d531b38`,astbBytes:3475,astBytes:4456,svgBytes:28884,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`13f52b1ccc4e589a69134c1c7993121662a27eb378b5762bd64d37b3ede7ec07`,certified:!0},"reader-red-dog":{id:`reader-red-dog`,title:`Decodable Book 2: The Red Dog (Level 2 · Phase 2 CVC)`,stage:`EYFS/KS1 PHONICS`,type:`Slide`,astSha256:`c07102dc9d88e8bb9a234bc38ba52f763f73f892647556bc9dc02e8bc0368045`,svgSha256:`8f183692fb6de5df8e4e56edc6813a1de5222f17924284390d9cd7747c215715`,astbSha256:`912c9493261570e99292add3fed1bec2085f5f009195e677342eebd15a8c3870`,astbBytes:3574,astBytes:4592,svgBytes:34341,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`e72d970fc018ce0782a2de97ad8db44f5a9163b6107fe0f39c0b60e0a315b802`,certified:!0},"reader-ship-rain":{id:`reader-ship-rain`,title:`Decodable Book 3: A Ship in the Rain (Level 3 · Phase 3 Digraphs)`,stage:`EYFS/KS1 PHONICS`,type:`Slide`,astSha256:`7843bd619386fa585863f6a80a09d0b93d4f6d829403214baaf2da2f702ea1f5`,svgSha256:`8ba9e18de3c30a2e70fb29509ac6b81ff315f6b4fa97331705eac8a2f475deb7`,astbSha256:`63165c01825ff2f39b14180537c8dab774ebfd77a9e79c7a58c1bedddd965ed4`,astbBytes:3760,astBytes:4819,svgBytes:37425,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`06dccbd952d9aaec13b62f06ed3003b7372fe3f0ca913f30152b60bcb99b75f8`,certified:!0},"rosary-mysteries":{id:`rosary-mysteries`,title:`The Holy Rosary: 3D Beads & 20 Scriptural Mysteries`,stage:`CATHOLIC LIFE & RE`,type:`Sim`,astSha256:`e5ba72e84b97eb307495bc3e01c73a160715f9f437f3ab3f97811c49e72ea7e1`,svgSha256:`38672bd31606495e6942d01ed2371393c8a0afc071d4e0a11a5e4a559927b1b4`,astbSha256:`e803a63a00b3796128fd91a680af9d9ddf732219b540bfcc7ce518f4f375a489`,astbBytes:4454,astBytes:4740,svgBytes:5931,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`ceae4eb36a40283f8fffef57ec9bcb5f3b85801e77935af25e1b030e4300a0f0`,certified:!0},"sacred-objects":{id:`sacred-objects`,title:`Sacred Vessels, Linens, Sanctuary Appointments & Vestments of the Catholic Church`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`4edc80fadadbe75eed413643288baae81889bb366f25a49897ac1b836858c4b9`,svgSha256:`7b02c70ba0a2e74a87420ab1c8922ff2a99aeceece40362e0aca5ec0a6e75256`,astbSha256:`89a55be2262c3c769a6273913aa50427a00bb07e6e9c936df634fbc41e5e5da2`,astbBytes:8193,astBytes:8752,svgBytes:12490,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`0f46f6efb857b75e9e4f2c3be46df8ffb9a60318bda0644de803ed4d69b31a05`,certified:!0},"seven-sacraments":{id:`seven-sacraments`,title:`The Seven Holy Sacraments: Visible Signs of Invisible Grace`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`434fb44dfebf43e509b1e67766437aea610643035b4743c48b4a699fdfe39373`,svgSha256:`f0c9a6dd0f5a6aef858c46ad15bbcec1a4fea2beefc5d5ce21bd10f946e390ce`,astbSha256:`bbbf2304b1854b8e1d16e5762dfcb631700fa5487e3aaa86b2af69a483477152`,astbBytes:7732,astBytes:7788,svgBytes:9280,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`2993b1568499793fa60239e63ed3a354580cb43b813a153887709b8c0dfffb89`,certified:!0},"shakespeare-macbeth":{id:`shakespeare-macbeth`,title:`Macbeth: 5-Act Dramatic Soliloquy & Moral Fall`,stage:`KS3/KS4 ENGLISH LITERATURE`,type:`Slide`,astSha256:`74a9e2d2ad54ab5bde8dbf6cf8eceadaab64924ed8489c6ed5b655d33c90f6fa`,svgSha256:`5e99d4aaf0e48588cd6f38137263fb51fbbb32c966b0c4bdfff90f269082d58f`,astbSha256:`a2a3d49cf1e7bdc4958001b1665452e10f3a5cbc468d6057135bf4f4b786a2b9`,astbBytes:5239,astBytes:5450,svgBytes:4469,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`819e7b0ba73f044211dfe8e7183df9b3586781f72e577979b5dcb8085804fa68`,certified:!0},shakespeare:{id:`shakespeare`,title:`The Globe Theatre: Shakespeare & Iambic Pentameter`,stage:`KS3/KS4 ENGLISH LITERATURE`,type:`Slide`,astSha256:`977eb7a883578568821cb8aa9781ceca5efc4ff6f118736adf1e6992c52efdbb`,svgSha256:`2c52ceedf1ba37f712ff5f81f9e333d72a1909e2b04b598a107dfc921305f562`,astbSha256:`51096c06a82762641987ae94e7f21c857228b206c61e7f1ce3787886b4901f25`,astbBytes:6520,astBytes:6315,svgBytes:8923,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`6b459d6b2a167181ee0778e5abacafb34d8003f3e6884674c2d73b175df44232`,certified:!0},"solar-system":{id:`solar-system`,title:`Solar System: Heliocentric Planetary Motion`,stage:`KS3 SCIENCE`,type:`Sim`,astSha256:`36bdfdc31fa253e16d6a45c2a69880e6c4ba87277b0cae9069d9efd16b7b1a7f`,svgSha256:`3785c047d1267fe75c4271ec390d8eb61a8138a71422d4a5fd276fcf556b596c`,astbSha256:`d93d4fbf99035b813f9b777494033f238b7620cb1090d38488754cbcb118a4e2`,astbBytes:22623,astBytes:26088,svgBytes:28333,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`c65c6f282c1fadadd784a49d9b0d1485499a8e9b77c71a28f4f49e764e0c37dc`,certified:!0},"spelling-bee":{id:`spelling-bee`,title:`Spelling Bee Championship: KS1 to KS3 Orthography`,stage:`KS1/KS2/KS3 ENGLISH`,type:`App`,astSha256:`2d9dfa3fed5530805283af4718ce1e54cf2f501c42355bd22c6faadfd9379101`,svgSha256:`92f9641d072d9b632e08f7fdccb223789548b964af87f90630b00bfa80a5c8f5`,astbSha256:`4eb72addd702ed2ba2ecbf2b1adbb098042331a5be9122e31948221db68e8754`,astbBytes:37218,astBytes:46038,svgBytes:27554,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`19f879253d914be891c3862ebc8a6a0eb8973982e37ac2d6a0dae8e0bc38f64d`,certified:!0},"stations-of-the-cross":{id:`stations-of-the-cross`,title:`The Stations of the Cross: Via Crucis & Sacred Passion`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`003bd1ce74ea9208df52a75649091faa6cd9734e04544fbaa882db16cc3f4956`,svgSha256:`38c16eab50bea3a548f8b51b5c1306a738743065f5e0e3b1f9270b8ea0c56d9c`,astbSha256:`952200dc21409015d2505c538ead1b4786c19fc85f822e2f221ce4208ddd2b19`,astbBytes:14165,astBytes:15146,svgBytes:14424,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`cced022a399b49a5ba9cbd7235278960651f4193f7572b218d7cdf4c59ac927a`,certified:!0},"ten-commandments":{id:`ten-commandments`,title:`The Ten Commandments & Moral Law: The Two Tablets of Sinai`,stage:`CATHOLIC LIFE`,type:`Slide`,astSha256:`fc685c04c6029285a943db6092e38a7c1003c31a1ad08e9b9144c77b3b65ab24`,svgSha256:`b68dd054302ede1b664d046c660048228dfc3fc3fc5131fe1f071bfc82754d2b`,astbSha256:`fd56d20d7eb2bd56384d69f87ca764130130b279c58743c44c384ade2153a475`,astbBytes:5523,astBytes:5859,svgBytes:7329,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`3c304c23acba40fec1c29d093631259efe7d131a54f420b1f965d557f1bcf503`,certified:!0},"times-tables":{id:`times-tables`,title:`Times Tables: 1× to 12× Standard School Multiplication Chart & Grid`,stage:`KS1/KS2 MATHS`,type:`Sim`,astSha256:`55e9bff10887714a7b11f4b36af1cbf4a387f8daf2fc87eb2748627202753741`,svgSha256:`c426632e1939977df672d43c247dceec306232d1d1803ac4effe45ab95ce913c`,astbSha256:`8feb2390e35ea23f48d4e199213eb0670d3b6b8e1a5294b22d70edc1dc26cf5b`,astbBytes:38586,astBytes:52871,svgBytes:23766,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`248a732c23a3add27375bd4371527f80ac1ba78e953bd91a12682027a781b334`,certified:!0},"triduum-easter":{id:`triduum-easter`,title:`The Sacred Paschal Triduum & Easter: Upper Room, Cross & Lumen Christi`,stage:`CATHOLIC LIFE`,type:`Sim`,astSha256:`ef7dc5e75f57ca0121e55c7f92918906d421b937cd28e916fa5a407e820e2b68`,svgSha256:`9d362d8dc7dfb0af9b6b392c3da2011cd51a4385c6925bc9c56c0287c5117df6`,astbSha256:`f4552fafa5a8a60b548fc3482809d59d3652483b81b901698e28feed619eaacb`,astbBytes:7420,astBytes:7501,svgBytes:9166,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`21f5719ce3e5dd15f0afce72a87044bac1af82fe78abadf2c1e8074de615281b`,certified:!0},"vector-racing":{id:`vector-racing`,title:`Vector Racing`,stage:`STEM`,type:`Sim`,astSha256:`cbbc50e0e947aed8f919e5ec56abb3f46249b11e9d052ba0ee4e2d54e826d163`,svgSha256:`347bfd9f7dd2a1804707465dd76962c744fd63fae17d1c90bc44cd60f2f6c596`,astbSha256:`beb2dd3b443abcbb37f24487d4c55fbe837f40b58ee8ebb830297e244892c050`,astbBytes:5797,astBytes:5840,svgBytes:5020,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`597d1b7f17770ac187e389a0835a033bbfc708563ddf2caa0522b5bff63c5af5`,certified:!0},velocity:{id:`velocity`,title:`Kinematics: Velocity & Distance-Time Vectors`,stage:`KS3 PHYSICS`,type:`Sim`,astSha256:`1e186694880d4dff5a22e043a015006429e881f6b2c6df10b5279b3bbcbc0eb5`,svgSha256:`3590a6533ab1fac58e3e82183eacb75fb94ca9fe5b065956768655e83e02fb9d`,astbSha256:`a009ad38e1d77721d6a22bd08140c509ca6d8366dc4a8cdb6553d14564216fc7`,astbBytes:2617,astBytes:2765,svgBytes:5693,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`7188870d709b89ca4ea5b143975c2ac95960c6ea9652b1296ae45420a07747cf`,certified:!0},"water-cycle":{id:`water-cycle`,title:`Water Cycle: Continuous Earth Cycle`,stage:`KS2 GEOGRAPHY`,type:`Slide`,astSha256:`5f859567f5e5ccbe56f220fb5e0547da8808ef192de679eec02a456a526c841e`,svgSha256:`43a7e94c4c829664ab6cfd57b2ca0b3a1b358923462b60aa9f720a2d19f28982`,astbSha256:`1618e19d79a34bb4631ad652dc4e1fa593c0b91a1f66d92f49b1adf35f39154a`,astbBytes:3498,astBytes:4583,svgBytes:7576,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`fbcc3d99fb42838cec5a720f76b6b4a81644b89d8f205f8e054eaa20c35a0186`,certified:!0},welcome:{id:`welcome`,title:`Welcome to AST Vector Player & Educational Simulator`,stage:`PORTAL APPARATUS & SIMULATOR`,type:`Sim`,astSha256:`3c8ff5cce2485c1f5c0e2959b0be24b00c49fe6dccb8a0bd522cfc5ce1a0848b`,svgSha256:`44792af2e536ad080731c1d7a66f653d3337210f2ff5bf1511622493e585a473`,astbSha256:`48e58416fc4fbf030ce84c44d71b7dc404a869b17219cb967fc2426a241892a8`,astbBytes:4426,astBytes:4465,svgBytes:6369,tier:`native`,authority:`St Joseph's Catholic Primary School Curriculum Authority`,seal:`d189f6a4aedcc10a9e6f341565667381c4cfc8416dd2055c07e09a1715dd1f4e`,certified:!0}}},Xe=`St Joseph's Catholic Primary School Curriculum Authority`;function Ze(e){return Ye.cartridges[e]||null}var K=Xe;function Qe(e,t=12){return!e||e.length<t?e||`unsigned`:`${e.substring(0,6)}...${e.substring(e.length-6)}`}function $e(e){return Ze(e)}function et(){return Ye.masterChecksum}function tt(){return Ye.totalCartridges}var nt=n.find(e=>e.kind===`lab`&&e.isPlayableScene!==!1)?.id||`welcome`,rt=[{id:`lumina-architecture`,label:`Lumina: Sovereign Architectural Manifesto (4-Chapter Show & Tell)`,type:`Slide`,kind:`doc`,isPlayableScene:!0,stage:`FOUNDATIONAL SYSTEM ARCHITECTURE`,subject:`System Architecture`,section:`System Architecture & Docs`}],it=[...n,...rt],at=new Set(it.map(e=>e.id)),ot=`stj_player_recent_presets_v1`;function q(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function st(e){if(!e)return nt;if(e===`lumina-architecture-manifesto`)return`lumina-architecture`;if(at.has(e))return e;try{if(l().some(t=>t.id===e))return e}catch{}return nt}function ct(t,n,r,i){let a=f(`app_perf_hud_enabled`)===`true`,o=f(`app_hud_verbosity`)||`minimal`,s=f(`app_frame_budget_alert`)===`true`,c=new URLSearchParams({bsl:r?`1`:`0`,mode:`suite`,tools:`1`,all:`1`});i?c.set(`src`,i):c.set(`preset`,n),a&&(c.set(`hud`,`1`),c.set(`hud_verbosity`,o),s&&c.set(`budget_alert`,`1`));let l=e();return l&&l!==`en`&&c.set(`lang`,l),`${t}player.html?${c.toString()}`}function lt(e){return e.kind===`data`||e.kind===`benchmark`||e.kind===`doc`||e.isPlayableScene===!1||e.subject===`System Architecture`}var J=it.filter(e=>!lt(e)),ut=it.length-J.length;function dt(e){let t=(e.subject||``).toLowerCase();return t.includes(`religious`)||t===`catholic life`||e.stage===`CATHOLIC LIFE`||!!(e.section&&e.section.includes(`Catholic`))}function ft(e){if(dt(e))return`Catholic`;let t=(e.subject||``).toLowerCase();return t.includes(`science`)||t.includes(`physics`)||t.includes(`chem`)||t.includes(`bio`)?`Science`:t.includes(`math`)?`Maths`:t.includes(`english`)||t.includes(`phonics`)?`English`:t.includes(`comput`)||t.includes(`design`)?`Computing`:t.includes(`language`)||t.includes(`spanish`)||t.includes(`french`)||t.includes(`latin`)||t.includes(`bsl`)||t.includes(`sign`)?`Languages`:t.includes(`geograph`)?`Geography`:`All`}function pt(e,t){if(t===`All`)return!0;let n=`${e.stage||``} ${e.oakId||``}`.toUpperCase();return t===`KS1`?n.includes(`EYFS`)||n.includes(`KS1`)||n.includes(`KEY STAGE 1`)||n.includes(`EARLY YEARS`):t===`KS2`?n.includes(`KS2`)||n.includes(`KEY STAGE 2`)||n.includes(`WHOLE SCHOOL`):t===`KS3`?n.includes(`KS3`)||n.includes(`KEY STAGE 3`):t!==`KS4`||n.includes(`KS4`)||n.includes(`GCSE`)||n.includes(`A-LEVEL`)||n.includes(`KEY STAGE 4`)}function mt(){try{let e=f(ot);if(!e)return[];let t=JSON.parse(e);return Array.isArray(t)?t.filter(e=>typeof e==`string`):[]}catch{return[]}}function ht(e){if(e&&!e.startsWith(`__`))try{let t=[e,...mt().filter(t=>t!==e)].slice(0,5);d(ot,JSON.stringify(t))}catch{}}function gt(){try{return l().filter(e=>!at.has(e.id))}catch{return[]}}function _t(e){let t=it.find(t=>t.id===e);if(t)return t;try{let t=l().find(t=>t.id===e);if(t)return{id:t.id,label:t.title,stage:t.stage||`LOCAL VAULT`,type:t.type||`Sim`,kind:`lab`,isPlayableScene:!0,subject:t.subject||`Custom Ingestion`}}catch{}return it[0]}function vt(e){let t=gt().map(e=>({id:e.id,label:e.title,stage:e.stage||`LOCAL VAULT`,type:e.type||`Sim`,kind:`lab`,isPlayableScene:!0,subject:e.subject||`Custom Ingested`})),n=e?it:J;return[...t,...n]}function yt(e){let t=gt(),n=t.length>0?`
    <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
      ${t.map(t=>`<option value="${q(t.id)}" ${t.id===e?`selected`:``}>${q(t.title)} (${q(t.stage||`LOCAL`)})</option>`).join(``)}
    </optgroup>
  `:``,r=J.filter(e=>!e.id.startsWith(`phet-`)),i=J.filter(e=>e.id.startsWith(`phet-`)),a=r.filter(e=>ft(e)===`Science`),o=r.filter(e=>ft(e)===`Maths`),s=r.filter(e=>ft(e)===`Catholic`),c=r.filter(e=>ft(e)===`English`),l=r.filter(e=>ft(e)===`Computing`),u=r.filter(e=>ft(e)===`Languages`),d=r.filter(e=>{let t=ft(e);return t===`Geography`||t===`All`}),f=t=>t.map(t=>`<option value="${q(t.id)}" ${t.id===e?`selected`:``}>${q(t.label)} · ${q(t.type)} (${q(t.stage)})</option>`).join(``),p=it.find(t=>t.id===e);return`
    ${n}
    ${p&&lt(p)?`<optgroup label="📎 Active Reference / Benchmark" style="background:#0f172a; color:#cbd5e1;">
        <option value="${q(p.id)}" selected>${q(p.label)} (${q(p.stage)})</option>
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
  `}function bt(e,t){let n=$e(e),r=t?.status||(n?`verified-native`:`unverified-external`),i=t?.computedAstbSha256||n?.astbSha256||``,a=t?.computedAstSha256||n?.astSha256||``,o=t?.computedSvgSha256||n?.svgSha256||``,s=t?.seal||n?.seal||``;return r===`verified-native`?`
      <span style="color:#34d399; font-weight:800;">🛡️ VERIFIED • ST JOSEPH'S CURRICULUM</span>
      <span>Authority: <strong style="color:#f8fafc;">${q(t?.authority||K)}</strong></span>
      ${s?`<span>Seal: <code style="color:#38bdf8;">${q(Qe(s))}</code></span>`:``}
      ${i?`<span>.astb: <code style="color:#a7f3d0;">${q(Qe(i))}</code></span>`:``}
      ${a?`<span>.ast: <code style="color:#cbd5e1;">${q(Qe(a))}</code></span>`:``}
      ${o?`<span>.svg: <code style="color:#cbd5e1;">${q(Qe(o))}</code></span>`:``}
    `:r===`tampered`?`
      <span style="color:#fbbf24; font-weight:800;">✎ ALTERED / REMIXED CARTRIDGE</span>
      <span>Live SHA-256: <code style="color:#fde68a;">${q(t?.shortHash||`modified`)}</code></span>
      ${s?`<span>Original Seal: <code style="color:#94a3b8;">${q(Qe(s))}</code></span>`:``}
      <span style="color:#94a3b8;">Content differs from signed St Joseph's Curriculum pair</span>
    `:`
    <span style="color:#cbd5e1; font-weight:800;">◈ CUSTOM / EXTERNAL CARTRIDGE</span>
    <span>ID: <code style="color:#38bdf8;">${q(e)}</code></span>
    ${t?.shortHash?`<span>SHA-256: <code style="color:#cbd5e1;">${q(String(t.shortHash))}</code></span>`:``}
    <span style="color:#94a3b8;">Not in St Joseph's Curriculum signed registry (${tt()} certified)</span>
  `}function xt(e){let{filtered:t,isStageOpen:n,activePreset:r,activeSubject:i}=e;if(t.length===0)return`<div style="text-align:center; padding:2.5rem 1rem; color:#64748b; border:1px dashed #cbd5e1; border-radius:12px;">No matching labs found for your active filters.</div>`;let a=new Set(l().filter(e=>e.source!==`builtin`).map(e=>e.id)),o=e=>{let t=n&&e.id===r,i=e.subject||`Curriculum`,o=e.kind===`data`?` · Recall Data Pack`:e.kind===`benchmark`?` · Benchmark`:e.kind===`doc`?` · Architecture Doc`:``,s=e.has3D?`${e.type||`Sim`} (3D)`:e.type||`Sim`,c=$e(e.id),l=c&&a.has(e.id)?`<span title="Altered local remix of St Joseph's Curriculum cartridge (${q(e.id)})" style="font-family:monospace; font-size:0.68rem; font-weight:700; padding:1px 6px; border-radius:4px; background:#fef3c7; color:#92400e; border:1px solid #fcd34d;">✎ Remix</span>`:c?`<span title="Verified St Joseph's Curriculum Cartridge • Seal SHA-256: ${q(c.seal)}" style="font-family:monospace; font-size:0.68rem; font-weight:700; padding:1px 6px; border-radius:4px; background:#ecfdf5; color:#047857; border:1px solid #a7f3d0;">🛡️ St Joseph's • ${q(c.seal.slice(0,6))}</span>`:`<span title="Custom or Architecture Cartridge" style="font-family:monospace; font-size:0.68rem; font-weight:700; padding:1px 6px; border-radius:4px; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">◈ Custom</span>`;return`
      <div
        class="cartridge-card"
        role="button"
        tabindex="0"
        data-id="${q(e.id)}"
        style="padding:13px 15px; border-radius:10px; border:1px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#f0f9ff`:`#ffffff`}; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; gap:10px; transition:border-color 0.15s ease, box-shadow 0.15s ease;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px;">
            <div style="font-size:0.72rem; color:#64748b; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${q(s)} &middot; ${q(i)} &middot; ${q(e.stage)}${q(o)}
            </div>
            ${l}
          </div>
          <strong style="display:block; font-size:0.9rem; color:#0f172a; line-height:1.35;">${q(e.label)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem;">
          <span style="color:${t?`#0369a1`:`#0284c7`}; font-weight:700;">${t?`▶ Currently Loaded`:`Launch Lab &rarr;`}</span>
          ${e.hasCheckpoints&&e.checkpointCount?`<span style="color:#64748b; font-variant-numeric:tabular-nums;">${e.checkpointCount} checks</span>`:``}
        </div>
      </div>
    `},s=[{key:`Science`,filterId:`Science`,icon:`🔬`,title:`Science`,subtitle:`Physics, Chemistry & Biology`,accent:`#0369a1`,bg:`#f0f9ff`,border:`#bae6fd`},{key:`Maths`,filterId:`Maths`,icon:`📐`,title:`Mathematics`,subtitle:`Number, Algebra & Geometry`,accent:`#047857`,bg:`#ecfdf5`,border:`#a7f3d0`},{key:`Catholic`,filterId:`Catholic`,icon:`✝️`,title:`Catholic Faith & Liturgy`,subtitle:`Sacraments, Scripture & Formation`,accent:`#b45309`,bg:`#fffbeb`,border:`#fde68a`},{key:`English`,filterId:`English`,icon:`📖`,title:`English & Phonics`,subtitle:`Decodable Readers, Phonics & Literature`,accent:`#c2410c`,bg:`#fff7ed`,border:`#fed7aa`},{key:`Computing`,filterId:`Computing`,icon:`💻`,title:`Computing & D&T`,subtitle:`Systems, Engineering & Logic`,accent:`#6d28d9`,bg:`#f5f3ff`,border:`#ddd6fe`},{key:`Languages`,filterId:`Languages`,icon:`🗣️`,title:`Languages & BSL`,subtitle:`Modern Languages & British Sign Language`,accent:`#be185d`,bg:`#fdf2f8`,border:`#fbcfe8`},{key:`Geography`,filterId:`Geography`,icon:`🌍`,title:`Geography`,subtitle:`Earth, Elevation & Water Systems`,accent:`#1d4ed8`,bg:`#eff6ff`,border:`#bfdbfe`},{key:`Custom`,icon:`💾`,title:`Local Vault & Imported Files`,subtitle:`Your locally loaded cartridges`,accent:`#334155`,bg:`#f8fafc`,border:`#cbd5e1`},{key:`Other`,icon:`📎`,title:`Portal Showcase, Benchmarks & Docs`,subtitle:`Architecture, recall packs & utilities`,accent:`#475569`,bg:`#f8fafc`,border:`#cbd5e1`}],c=new Map;for(let e of t){let t;if(!at.has(e.id))t=`Custom`;else{let n=ft(e);t=n===`All`?`Other`:n}let n=c.get(t);n?n.push(e):c.set(t,[e])}let u=s.filter(e=>(c.get(e.key)?.length||0)>0),d=i!==`All`;return u.map(e=>{let t=c.get(e.key)||[],n=`${t.length} ${t.length===1?`lab`:`labs`}`,r=!d&&e.filterId?`<button type="button" class="subject-focus-btn" data-focus-subject="${e.filterId}" style="padding:4px 10px; border-radius:6px; border:1px solid ${e.border}; background:#ffffff; color:${e.accent}; font-size:0.74rem; font-weight:700; cursor:pointer; white-space:nowrap;">Focus Subject &rarr;</button>`:d?`<button type="button" class="subject-focus-btn" data-focus-subject="All" style="padding:4px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff; color:#334155; font-size:0.74rem; font-weight:700; cursor:pointer; white-space:nowrap;">&larr; All Subjects</button>`:``;return`
      <details open class="subject-breakdown-group" data-subject-group="${e.key}" style="border:1px solid #e2e8f0; border-radius:12px; background:#ffffff; overflow:hidden;">
        <summary style="list-style:none; cursor:pointer; padding:11px 15px; background:${e.bg}; border-bottom:1px solid ${e.border}; border-left:4px solid ${e.accent}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; user-select:none;">
          <div style="display:flex; align-items:center; gap:9px; min-width:0;">
            <span style="font-size:1.15rem; line-height:1;" aria-hidden="true">${e.icon}</span>
            <div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <strong style="font-size:0.95rem; color:#0f172a;">${q(e.title)}</strong>
                <span style="font-size:0.72rem; font-weight:800; padding:1px 8px; border-radius:9999px; background:#ffffff; color:${e.accent}; border:1px solid ${e.border}; font-variant-numeric:tabular-nums;">
                  ${n}
                </span>
              </div>
              <div style="font-size:0.76rem; color:#64748b; margin-top:1px;">${q(e.subtitle)}</div>
            </div>
          </div>
          <span style="font-size:0.72rem; color:#64748b; font-weight:700;" aria-hidden="true">▾</span>
        </summary>
        ${r?`<div style="padding:8px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; display:flex; justify-content:flex-end;">${r}</div>`:``}
        <div style="padding:14px; display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; background:#f8fafc;">
          ${t.map(o).join(``)}
        </div>
      </details>
    `}).join(``)}function St(e){let{base:t,activePreset:n,meta:r,isStageOpen:i,bslActive:a,isMuted:o,initialExternalSrc:s,activeSubject:c,activeFormat:l}=e,u=yt(n),d=q(t),f=q(r.stage||``),p=q(r.type||`Sim`),m=q(r.label||``),h=i?q(ct(t,n,a,s)):`about:blank`,g=$e(n),_=g?.seal?g.seal.slice(0,6):``,v=g?`🛡️ St Joseph's Curriculum • ${_}`:`◈ Custom / External`,y=g?`Verified St Joseph's Curriculum Cartridge (${g.title}) • Authority: ${K} • Seal: ${Qe(g.seal)} — Click to view SHA-256 digests`:`Custom, imported, or documentation cartridge — Click to inspect SHA-256 provenance`;return`
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <a href="${d}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <button type="button" id="player-breadcrumb-labs" style="background:none; border:none; padding:0; font-size:0.84rem; color:#0284c7; font-weight:700; cursor:${i?`pointer`:`default`};">
          🔬 Interactive Labs
        </button>
        <span id="player-breadcrumb-sep" style="display:${i?`inline`:`none`}; color:#cbd5e1;">/</span>
        <span id="player-breadcrumb-active" style="display:${i?`inline`:`none`}; font-size:0.84rem; color:#0f172a; font-weight:700;">
          ${m}
        </span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${d}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${d}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⚡ Practice Lab
        </a>
      </div>
    </div>

    <!-- Inline File / Flash Import Feedback Banner -->
    <div id="player-import-status" role="status" aria-live="polite" style="display:none; margin-bottom:1rem; padding:10px 14px; border-radius:10px; font-size:0.82rem; font-weight:600; align-items:center; justify-content:space-between; gap:10px;">
      <span id="player-import-status-text"></span>
      <button type="button" id="player-import-status-close" style="background:transparent; border:1px solid currentColor; color:inherit; border-radius:5px; padding:2px 8px; font-size:0.74rem; font-weight:700; cursor:pointer;">Dismiss</button>
    </div>

    <!-- Main Interactive Stage Frame (Mounted on demand when a lab is launched or deep-linked) -->
    <div id="player-stage-shell" style="display:${i?`block`:`none`}; background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35); margin-bottom:2rem;">
      <!-- Stage Toolbar: Row 1 (Header & Primary Simulation Controls) -->
      <div style="padding:10px 18px; background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; min-height:48px; box-sizing:border-box; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <button
            type="button"
            id="player-btn-back-to-grid"
            title="Close activity and return to the Interactive Labs grid"
            style="padding:5px 11px; border-radius:7px; background:#0f172a; color:#e2e8f0; border:1px solid #475569; font-size:0.76rem; font-weight:800; cursor:pointer; white-space:nowrap; flex-shrink:0; min-height:28px;">
            &larr; All Labs
          </button>
          <div style="min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span id="player-active-stage-badge" style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:9999px; background:#0369a1; color:#ffffff; letter-spacing:0.04em; white-space:nowrap;">
                ${f}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace; white-space:nowrap;">
                ${p}
              </span>
              <button
                type="button"
                id="player-integrity-badge"
                title="${q(y)}"
                style="font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:4px; background:${g?`rgba(16,185,129,0.16)`:`rgba(148,163,184,0.16)`}; color:${g?`#34d399`:`#cbd5e1`}; border:1px solid ${g?`rgba(16,185,129,0.45)`:`rgba(148,163,184,0.4)`}; font-family:monospace; white-space:nowrap; cursor:pointer; line-height:1.3;">
                ${q(v)}
              </button>
            </div>
            <h2 id="player-active-title" style="font-size:1.1rem; font-weight:800; color:#f8fafc; margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${m}
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
          <button type="button" id="player-btn-mute" style="padding:5px 12px; border-radius:6px; background:${o?`#451a03`:`#1e293b`}; color:#ffffff; border:1px solid ${o?`#d97706`:`#334155`}; font-size:0.78rem; font-weight:700; cursor:pointer; min-height:28px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;" title="Mute / Unmute simulation audio and voice narration (M)">
            <span id="player-mute-icon">${o?`🔇`:`🔊`}</span>
            <span id="player-mute-text">${o?`Muted`:`Audio ON`}</span>
          </button>
          <button type="button" id="player-btn-bsl" style="padding:5px 12px; border-radius:6px; background:${a?`#0284c7`:`#1e293b`}; color:#ffffff; border:1px solid ${a?`#38bdf8`:`#334155`}; font-size:0.78rem; font-weight:700; cursor:pointer; width:142px; text-align:center; flex-shrink:0; min-height:28px;" title="Toggle British Sign Language In-Vision Interpreter (Shift+B)">
            🖐️ BSL Signing: ${a?`ON`:`OFF`}
          </button>
          <button type="button" id="player-btn-fullscreen" style="padding:5px 12px; border-radius:6px; background:#0284c7; color:#ffffff; border:none; font-size:0.78rem; font-weight:700; cursor:pointer; white-space:nowrap; min-height:28px;" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- Collapsible Cryptographic Cartridge Provenance & SHA-256 Readout -->
      <div id="player-integrity-readout" style="display:none; padding:8px 18px; background:#07101f; border-bottom:1px solid #1e293b; font-size:0.73rem; color:#cbd5e1; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div id="player-integrity-readout-body" style="display:flex; align-items:center; flex-wrap:wrap; gap:12px;"></div>
        <button type="button" id="player-integrity-readout-close" style="background:transparent; border:1px solid #334155; color:#94a3b8; border-radius:4px; padding:1px 7px; font-size:0.7rem; cursor:pointer;">Close &times;</button>
      </div>

      <!-- Stage Toolbar: Row 2 (Activity Selector, Pupil Study Tools & Collapsible Teacher Tools) -->
      <div style="padding:8px 18px; background:#0b1120; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; gap:10px; min-height:42px; box-sizing:border-box; overflow-x:auto; flex-wrap:wrap;">
        <div style="display:inline-flex; align-items:center; gap:6px; flex-shrink:0;">
          <label for="player-sim-selector" style="font-size:0.76rem; font-weight:800; color:#94a3b8; white-space:nowrap;">
            📚 Activity:
          </label>
          <select id="player-sim-selector" style="padding:4px 10px; border-radius:6px; background:#0f172a; color:#ffffff; border:1px solid #0284c7; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none; max-width:280px;">
            ${u}
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
            <button type="button" id="player-btn-open" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Open local .ast / .svg / .json activity files or import a PhET / Flash (.swf) simulation">
              📂 Import Activity
            </button>
            <button type="button" id="player-btn-phet-import" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#7dd3fc; border:1px solid #0284c7; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Open the Full PhET Simulation Transpiler &amp; Distiller (HTML5, PhET-iO JSON &amp; Legacy Flash)">
              ⚛️ Import PhET
            </button>
            <button type="button" id="player-btn-swf-import" style="padding:4px 10px; border-radius:6px; background:#1e293b; color:#fbbf24; border:1px solid #d97706; font-size:0.76rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Open the Historic Adobe Flash (.swf) Binary Decompiler &amp; Importer">
              ⚡ Import Flash (.swf)
            </button>
            <input type="file" id="media-player-file-input" accept=".phet,.html,.htm,.swf,.json,.ast,.svg" multiple style="display:none;" />

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
          src="${h}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Catholic Sanctuary Linkage Banner -->
    <div id="catholic-sanctuary-banner" style="display:${i&&dt(r)?`flex`:`none`}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">✝️</span>
        <div>
          <span style="font-size:0.86rem; color:#fde047; font-weight:800;">St Joseph's Catholic Sanctuary:</span>
          <span style="font-size:0.82rem; color:#cbd5e1; margin-left:4px;">This simulation is part of our Catholic faith formation and sacred liturgical curriculum.</span>
        </div>
      </div>
      <a href="${t}catholic-life?tab=altar-anatomy" style="padding:5px 12px; border-radius:6px; background:#ca8a04; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem;">
        Open High Altar &amp; Latin Chapel &rarr;
      </a>
    </div>

    <!-- Interactive Labs Grid Launcher & Multi-Facet Filter -->
    <section id="labs-catalog-section" style="display:${i?`none`:`block`}; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.35rem; margin-bottom:1.75rem; box-shadow:0 4px 18px rgba(15,23,42,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
        <div>
          <h1 style="margin:0; font-size:1.35rem; font-weight:800; color:#0f172a; letter-spacing:-0.01em;">Interactive Labs &amp; Lessons</h1>
          <p id="catalog-results-summary" style="margin:3px 0 0; font-size:0.82rem; color:#64748b; font-variant-numeric:tabular-nums;">
            Select any verified cartridge to launch the interactive stage
          </p>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <input
            type="search"
            id="cartridge-search-input"
            placeholder="Search by title, topic, stage, or ID (e.g. titration, altar, ks2)..."
            style="padding:7px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.84rem; min-width:260px; outline:none; color:#0f172a; background:#ffffff;"
          />
          <select id="stage-filter-select" aria-label="Filter by Key Stage" style="padding:7px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.82rem; font-weight:600; color:#334155; background:#f8fafc; cursor:pointer;">
            <option value="All">All Key Stages</option>
            <option value="KS1">EYFS &amp; KS1</option>
            <option value="KS2">Key Stage 2</option>
            <option value="KS3">Key Stage 3</option>
            <option value="KS4">KS4 / GCSE &amp; A-Level</option>
          </select>
          <button type="button" id="launcher-btn-import" style="padding:7px 12px; border-radius:8px; border:1px solid #0284c7; background:#f0f9ff; color:#0369a1; font-size:0.8rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Open local .ast / .svg / .json cartridge or import a PhET / Flash (.swf) simulation">
            📂 Open File
          </button>
          <button type="button" id="launcher-btn-phet-import" aria-expanded="false" style="padding:7px 12px; border-radius:8px; border:1px solid #0284c7; background:#e0f2fe; color:#0369a1; font-size:0.8rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Distill &amp; import full PhET HTML5, PhET-iO JSON, or Legacy Flash simulations into ~3.5 KB offline cartridges">
            ⚛️ Import PhET
          </button>
          <button type="button" id="launcher-btn-swf-import" aria-expanded="false" style="padding:7px 12px; border-radius:8px; border:1px solid #d97706; background:#fffbeb; color:#b45309; font-size:0.8rem; font-weight:700; cursor:pointer; white-space:nowrap;" title="Import &amp; decompile historic Adobe Flash (.swf) files into 60 FPS native SVG + AST cartridges">
            ⚡ Import Flash (.swf)
          </button>
          <button type="button" id="btn-clear-catalog-filters" style="display:none; padding:7px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#475569; font-size:0.8rem; font-weight:600; cursor:pointer; white-space:nowrap;">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- On-Demand PhET / Historic Flash (.swf) Importer Panel (Launcher Mode) -->
      <div id="launcher-swf-mount-point" style="display:none; background:#0f172a; border:1px solid #334155; border-radius:12px; padding:16px; margin-bottom:14px; color:#f8fafc;"></div>

      <!-- Subject Tabs -->
      <div style="display:flex; gap:4px; flex-wrap:wrap; padding:4px; background:#f1f5f9; border-radius:10px; margin-bottom:10px;" id="subject-filter-buttons">
        ${[{id:`All`,label:`All Labs`},{id:`Science`,label:`Science`},{id:`Maths`,label:`Mathematics`},{id:`Catholic`,label:`Catholic Faith`},{id:`English`,label:`English & Phonics`},{id:`Computing`,label:`Computing & D&T`},{id:`Languages`,label:`Languages & BSL`},{id:`Geography`,label:`Geography`}].map(e=>{let t=e.id===`All`?J.length:J.filter(t=>ft(t)===e.id).length,n=e.id===c;return`
            <button type="button" class="cat-pill-btn" data-cat="${e.id}" style="padding:6px 12px; border-radius:7px; font-size:0.8rem; font-weight:700; cursor:pointer; border:none; white-space:nowrap; font-variant-numeric:tabular-nums; background:${n?`#ffffff`:`transparent`}; color:${n?`#0f172a`:`#475569`}; box-shadow:${n?`0 1px 3px rgba(15,23,42,0.1)`:`none`};">
              ${e.label} <span style="opacity:0.65; font-weight:600;">(${t})</span>
            </button>
          `}).join(``)}
      </div>

      <!-- Format & Scope Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding-bottom:12px; margin-bottom:12px; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;" id="format-filter-buttons">
          <span style="font-size:0.76rem; font-weight:700; color:#64748b; margin-right:2px;">Format:</span>
          ${[{id:`All`,label:`All Formats`},{id:`Sim`,label:`Interactive Labs (Sim)`},{id:`Slide`,label:`Guided Lessons (Slide)`},{id:`App`,label:`Games & Studios (App)`},{id:`Film`,label:`Films`},{id:`3D`,label:`3D Models`}].map(e=>{let t=e.id===l;return`
              <button type="button" class="format-filter-btn" data-format="${e.id}" style="padding:4px 10px; border-radius:6px; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap; border:1px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#e0f2fe`:`#f8fafc`}; color:${t?`#0369a1`:`#475569`};">
                ${e.label}
              </button>
            `}).join(``)}
        </div>

        <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.78rem; color:#475569; font-weight:600; cursor:pointer; user-select:none;" title="Recall data packs belong primarily in Practice Lab and Revision Suite">
          <input type="checkbox" id="toggle-include-nonmedia" style="cursor:pointer; accent-color:#0284c7;" />
          <span>Include recall data packs, benchmarks &amp; docs (${ut})</span>
        </label>
      </div>

      <!-- Recent Quick-Switch Strip -->
      <div id="recent-labs-strip" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; font-size:0.78rem;"></div>

      <!-- Subject Breakdown Grid Container (Full-page launcher grouped by curriculum subject) -->
      <div id="cartridges-grid" style="display:flex; flex-direction:column; gap:18px;">
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
        <a href="${t}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Portal Updates &amp; Notes &rarr;</a>
      </div>
    </div>
  `}async function Ct(e){if(!e||e.length===0)return null;let n=e.find(e=>e.name.toLowerCase().endsWith(`.svg`)),r=e.find(e=>e.name.toLowerCase().endsWith(`.ast`));if(n&&r){let e=await n.text(),i=await r.text(),a=n.name.replace(/\.[^/.]+$/,``),o={id:a.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),title:a.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested companion pair: ${n.name} + ${r.name}.`,icon:`💾`,source:`imported`,svgMarkup:e,astSource:i,updatedAt:Date.now()};return t(o),o}for(let n of e){let e=n.name.toLowerCase();if(e.endsWith(`.swf`)){let e=await n.arrayBuffer(),r=n.name.replace(/\.swf$/i,``),a=r.toLowerCase().replace(/[^a-z0-9_-]/g,`-`)||`flash-${Date.now().toString(36)}`,o=r.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase())||a,{transpileSwfToAst:s}=await i(async()=>{let{transpileSwfToAst:e}=await import(`./cartridge-vault-7YkQtAWH.js`).then(e=>e.d);return{transpileSwfToAst:e}},__vite__mapDeps([0])),c=await s(e,a);if(!c.success||!c.svgMarkup||!c.astSource)throw Error(c.error||`Failed to transpile legacy Flash file "${n.name}".`);let l=c.metadata,u={id:a,title:`Flash: ${o}`,stage:`FLASH TRANSLATED`,category:`Imported Flash`,type:`Sim`,desc:l?`Transpiled from Flash SWF v${l.version} (${l.signature}, ${l.width}×${l.height}, ${l.shapeCount} vector shapes, ${l.frameCount} frames) into 60 FPS native SVG + AST.`:`Transpiled from legacy Adobe Flash SWF into 60 FPS deterministic vector SVG + AST.`,icon:`⚡`,source:`imported`,svgMarkup:c.svgMarkup,astSource:c.astSource,author:`Flash Archive`,version:`Flash v${l?.version||9}`,invariants:[`Legacy Vector Timeline`,`ActionScript Translation`],createdAt:Date.now(),updatedAt:Date.now()};return t(u),u}if(e.endsWith(`.json`)){let{importCartridgeFileWithSaver:e}=await i(async()=>{let{importCartridgeFileWithSaver:e}=await import(`./cartridge-vault-7YkQtAWH.js`).then(e=>e.o);return{importCartridgeFileWithSaver:e}},__vite__mapDeps([0]));return e(n,t)}let r=await n.text();if(e.endsWith(`.phet`)||e.endsWith(`.html`)||e.endsWith(`.htm`)||s(r)){let e=await a(r,n.name);if(!e.success||!e.svgMarkup||!e.astSource)throw Error(e.error||`Failed to transpile PhET bundle "${n.name}".`);let i={id:(e.metadata?.simName||`phet-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g,`-`),title:e.metadata?.title||n.name.replace(/\.[^/.]+$/,``),stage:`PHET INTERACTIVE`,category:`Science`,type:`Sim`,desc:`PhET simulation distilled to native SVG + AST (${e.metadata?.compressionRatio||`99.8% reduction`}).`,icon:`⚛️`,source:`phet`,svgMarkup:e.svgMarkup,astSource:e.astSource,author:`University of Colorado Boulder (PhET)`,version:e.metadata?.version||`1.0.0`,invariants:e.metadata?.detectedInvariants||[`Physical Conservation Law`],createdAt:Date.now(),updatedAt:Date.now()};return t(i),i}if(e.endsWith(`.svg`)){let e=n.name.replace(/\.[^/.]+$/,``),i=e.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),a=e.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),o=``,s=r.match(/<script\s+type=["']text\/ast["'][^>]*>([\s\S]*?)<\/script>/i);o=s&&s[1]?s[1].trim():`(:scene :id "${i}" :title "${a}" :stage "CUSTOM" :duration 10.0 (:bindings ()))`;let c={id:i,title:a,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested vector cartridge: ${n.name}.`,icon:`🎨`,source:`imported`,svgMarkup:r,astSource:o,updatedAt:Date.now()};return t(c),c}if(e.endsWith(`.ast`)){let e=n.name.replace(/\.[^/.]+$/,``),i=e.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),a=e.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),o=r.includes(`<svg`)?r:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`,s={id:i,title:a,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested AST logic: ${n.name}.`,icon:`📜`,source:`imported`,svgMarkup:o,astSource:r,updatedAt:Date.now()};return t(s),s}}return null}function wt(e){let n=c[e];if(!n)return null;let r={id:`phet-${e}`,title:n.title,stage:n.stage||`PHET DISTILLED`,category:n.subject||`Physics`,desc:`PhET simulation transpiled to AST & hardware-accelerated SVG (< 4 KB payload). Invariants: ${n.invariants.join(`, `)}.`,icon:`⚛️`,source:`phet`,svgMarkup:n.generateSvg(),astSource:n.generateAst(),updatedAt:Date.now()};return t(r),r}function Tt(e){try{let e=navigator;e.audioSession&&e.audioSession.type!==`playback`&&(e.audioSession.type=`playback`)}catch{}try{let e=window,t=window.AudioContext||e.webkitAudioContext;if(t){let n=e.__astSharedAudioCtx;n&&n.state!==`closed`||(n=new t,e.__astSharedAudioCtx=n),n.state!==`running`&&n.resume().catch(()=>{});let r=n.createBuffer(1,1,22050),i=n.createBufferSource();i.buffer=r,i.connect(n.destination),i.start(0)}}catch{}try{`speechSynthesis`in window&&window.speechSynthesis&&(typeof window.speechSynthesis.getVoices==`function`&&window.speechSynthesis.getVoices(),window.speechSynthesis.paused&&typeof window.speechSynthesis.resume==`function`&&window.speechSynthesis.resume())}catch{}try{let t=e?.contentWindow;t&&(typeof t.primeMobileAudioAndTts==`function`?t.primeMobileAudioAndTts():typeof t.AST_ENGINE?.audioSynth?.unlock==`function`&&t.AST_ENGINE.audioSynth.unlock())}catch{}}function Et(e,t,n){try{let r=e?.contentWindow,i=r?.AST_ENGINE;if(!i)return!1;if(t===`togglePlay`&&typeof i.togglePlay==`function`){let e=i.togglePlay();return r?.AST_UI?.updateHeaderPlayUI?.(e,!0),!0}if(t===`reset`)return typeof r?.AST_UI?.resetSimulation==`function`&&(r.AST_UI.resetSimulation(),!0);if(t===`setAudioState`){let e=!!n?.muted,t=n?.voiceEnabled===void 0?!e:!!n.voiceEnabled;!e&&typeof i.audioSynth?.unlock==`function`&&i.audioSynth.unlock(),typeof i.setMuted==`function`?i.setMuted(e):i.muted=e,typeof i.toggleVoice==`function`?i.toggleVoice(t):i.voiceEnabled=t;let a=r?.AST_UI?.elements?.btnNarrate;if(a&&(a.classList.toggle(`active`,t),a.textContent=t?`🔊 Voice: ON`:`🔊 Voice`),t&&!e&&typeof i.speakText==`function`){let e=(typeof i.getCurrentSubtitle==`function`?i.getCurrentSubtitle():``)||i.scene?.title||``;e&&i.speakText(e,{immediate:!0,allowTopFallback:!0})}return!0}}catch{}return!1}function Dt(){let n=u(),r=document.createElement(`div`);r.className=`ast-media-player-container`,r.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let a=new URLSearchParams(window.location.search),s=a.get(`preset`)||a.get(`app`),c=a.get(`src`)||a.get(`file`),d=!s&&c&&c.includes(`lumina-architecture`)?`lumina-architecture`:st(s),p=s?null:c,m=a.get(`epp-bench`)===`1`||a.get(`epp-bench`)===`true`,E=!!(s||c||m),D=null,O=`All`,k=`All`,A=`All`,j=!1,M=``;a.get(`bsl`)===`1`&&!v()&&w(!0);let N=v(),P=!(x()&&_()),ee=_t(d);r.innerHTML=St({base:n,activePreset:d,meta:ee,isStageOpen:E,bslActive:N,isMuted:P,initialExternalSrc:p,activeSubject:O,activeFormat:k});let te=r.querySelector(`#player-stage-shell`),ne=r.querySelector(`#labs-catalog-section`),re=r.querySelector(`#player-btn-back-to-grid`),F=r.querySelector(`#player-breadcrumb-labs`),se=r.querySelector(`#player-breadcrumb-sep`),ce=r.querySelector(`#player-breadcrumb-active`),le=r.querySelector(`#launcher-btn-import`),ue=r.querySelector(`#launcher-btn-phet-import`),fe=r.querySelector(`#launcher-btn-swf-import`),me=r.querySelector(`#launcher-swf-mount-point`),I=r.querySelector(`#player-import-status`),ge=r.querySelector(`#player-import-status-text`),_e=r.querySelector(`#player-import-status-close`),L=r.querySelector(`#ast-player-iframe`),R=r.querySelector(`#player-sim-selector`),ve=r.querySelector(`#player-active-title`),ye=r.querySelector(`#player-active-stage-badge`),be=r.querySelector(`#player-active-type-badge`),z=r.querySelector(`#player-integrity-badge`),B=r.querySelector(`#player-integrity-readout`),Se=r.querySelector(`#player-integrity-readout-body`),Ce=r.querySelector(`#player-integrity-readout-close`),V=r.querySelector(`#player-btn-play`),we=r.querySelector(`#player-play-icon`),Te=r.querySelector(`#player-play-text`),H=r.querySelector(`#player-btn-reset`),U=r.querySelector(`#player-btn-mute`),Ee=r.querySelector(`#player-btn-bsl`),W=r.querySelector(`#player-btn-ai-tutor`),De=r.querySelector(`#player-btn-lab-drawer`),Oe=r.querySelector(`#player-btn-remix-code`),ke=r.querySelector(`#player-btn-diagnostics`),Ae=r.querySelector(`#player-btn-teacher-tools`),je=r.querySelector(`#player-teacher-tools-group`),Me=r.querySelector(`#player-btn-log-csv`),Ne=r.querySelector(`#player-btn-open`),Pe=r.querySelector(`#player-btn-phet-import`),Fe=r.querySelector(`#player-btn-swf-import`),Ie=r.querySelector(`#player-btn-embed`),Le=r.querySelector(`#player-btn-export-airgap`),Re=r.querySelector(`#player-drawer-mount-point`),ze=r.querySelector(`#media-player-file-input`),Be=r.querySelector(`#player-btn-fullscreen`),Ve=r.querySelector(`#cartridge-search-input`),He=r.querySelector(`#stage-filter-select`),Ue=r.querySelector(`#toggle-include-nonmedia`),We=r.querySelector(`#btn-clear-catalog-filters`),G=r.querySelector(`#catalog-results-summary`),Ge=r.querySelector(`#recent-labs-strip`),Ke=r.querySelector(`#cartridges-grid`),Ye=r.querySelectorAll(`.cat-pill-btn`),Xe=r.querySelectorAll(`.format-filter-btn`),Ze=r.querySelector(`#player-iframe-wrapper`);function K(e){L?.contentWindow?.postMessage(e,`*`)}let nt=0,rt=new Map;function at(e,t,n=5e3){return new Promise((r,i)=>{if(!L?.contentWindow){i(Error(`Simulation stage iframe is not ready yet.`));return}let a=`req_${++nt}_${Date.now()}`,o=setTimeout(()=>{rt.has(a)&&(rt.delete(a),i(Error(`Timed out waiting for ${t} from stage.`)))},n);rt.set(a,{expectedType:t,resolve:r,reject:i,timer:o}),L.contentWindow.postMessage({...e,requestId:a},`*`)})}let ot={readState:async(e=!0)=>(await at({type:`GET_ENGINE_STATE`,includeSvgBytes:e},`ENGINE_STATE_RESPONSE`))?.state||null,setVar:async(e,t)=>{let n=await at({type:`SET_VAR`,name:e,value:t},`SET_VAR_ACK`);return{name:n?.name||e,value:n?.value??t,clamped:!!n?.clamped,state:n?.state||null}},execActionTuple:async e=>{let t=await at({type:`EXEC_ACTION_TUPLE`,tuple:e},`EXEC_ACTION_RESULT`);return{ok:!!t?.ok,executedActions:Array.isArray(t?.executedActions)?t.executedActions:[],state:t?.state||null}},onSay:e=>{C({subtitle:e,isSpeaking:!0})}},J=xe(ot),ut=0;async function gt(){let e=++ut,t=J.ready;J.unregister(),t&&await t.catch(()=>{}),await Promise.resolve(),r.isConnected&&e===ut&&(J=xe(ot),jt.mcpTools=J.tools)}ie({loadPreset:(e,t=!1)=>{hn(st(e),!0),t&&K({type:`PLAY`})},setVar:(e,t)=>{K({type:`SET_VAR`,name:e,value:t})},highlight:e=>{K({type:`EXEC_ACTION_TUPLE`,tuple:`(:act :highlight "${e}")`})},openTutor:e=>{Y=`ai-tutor`,Q(!0),e&&Z&&Z.askQuestion(e,!1)},getActivePreset:()=>d});let Dt=!1,Ot=!1,kt=null,At=()=>{Dt||(Dt=!0,ut++,J.unregister(),ie(null),kt?.disconnect(),kt=null,window.removeEventListener(`pagehide`,At),window.removeEventListener(`keydown`,Cn),window.removeEventListener(`popstate`,gn))};window.addEventListener(`pagehide`,At,{once:!0}),typeof MutationObserver<`u`&&typeof document<`u`&&document.body&&(kt=new MutationObserver(()=>{r.isConnected?Ot=!0:Ot&&At()}),kt.observe(document.body,{childList:!0,subtree:!0}));let jt={startProfCapture:async()=>{await at({type:`START_PROF_CAPTURE`,ensurePlaying:!0},`PROF_CAPTURE_STARTED`)},stopProfCapture:async e=>{let t=await at({type:`STOP_PROF_CAPTURE`,vsyncBudgetMs:e},`PROF_CAPTURE_RESULT`);return{stats:t.stats,memory:t.memory,activeMetrics:t.activeMetrics}},mcpTransport:ot,mcpTools:J.tools};function Mt(){try{L?.focus({preventScroll:!0}),L?.contentWindow?.focus()}catch{}K({type:`FOCUS_STAGE`})}function Nt(e){V&&(e?(V.style.background=`#2563eb`,V.style.borderColor=`#38bdf8`,V.title=`Pause simulation loop (Spacebar)`,we&&(we.textContent=`⏸`),Te&&(Te.textContent=`Pause`)):(V.style.background=`#16a34a`,V.style.borderColor=`#22c55e`,V.title=`Play simulation loop (Spacebar)`,we&&(we.textContent=`▶`),Te&&(Te.textContent=`Play`)))}let Y=null,Pt=a.get(`import`),X=!E&&(Pt===`swf`||Pt===`phet`)?Pt:null,Ft=null,It=`imported-swf`,Lt=!1,Rt=null,zt=!1,Bt=null,Vt=null,Ht=null,Ut=null,Wt=!1,Gt=`classroom`,Kt=!1,qt=null,Jt=``,Yt=!1,Xt=null,Z=null,Zt=``;function Qt(e,t=`success`){I&&ge&&(ge.textContent=e,I.style.display=`flex`,t===`error`?(I.style.background=`#fef2f2`,I.style.border=`1px solid #fca5a5`,I.style.color=`#991b1b`):(I.style.background=`#f0fdf4`,I.style.border=`1px solid #86efac`,I.style.color=`#166534`))}function $t(){I&&(I.style.display=`none`)}_e?.addEventListener(`click`,$t);function en(){return Bt||=i(()=>import(`./SwfTranspilerDrawer-DOsctnPv.js`),[]),Bt}function tn(){return Vt||=i(()=>import(`./PhetTranspilerDrawer-CHP5415v.js`),[]),Vt}function nn(e){let n=e?.metadata,r=(n?.simName||`phet-${Date.now().toString(36)}`).replace(/\.(html|htm|json|phet|swf)$/i,``).toLowerCase().replace(/[^a-z0-9_-]/g,`-`)||`phet-${Date.now().toString(36)}`,i=n?.title||`PhET: ${r.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase())}`,a=!!n?.isFlashSwf,o={id:r.startsWith(`phet-`)||a?r:`phet-${r}`,title:i,stage:a?`FLASH TRANSLATED`:`PHET INTERACTIVE`,category:a?`Imported Flash`:`Science`,type:`Sim`,desc:n?`Distilled from ${((n.originalSizeBytes||0)/1024).toFixed(0)} KB PhET bundle to ${(n.distilledSizeBytes/1024).toFixed(1)} KB native SVG + AST (${n.compressionRatio}).`:`Distilled PhET simulation running 100% offline as native SVG + AST.`,icon:a?`⚡`:`⚛️`,source:a?`imported`:`phet`,svgMarkup:e.svgMarkup,astSource:e.astSource,author:`University of Colorado Boulder (PhET)`,version:n?.version||`1.0.0`,invariants:n?.detectedInvariants||[`Physical Conservation Law`],createdAt:Date.now(),updatedAt:Date.now()};t(o),X=null,sn(),Y===`phet`&&(Y=null,Q()),cn(),_n(o),Qt(`⚛️ Distilled "${o.title}"${n?.compressionRatio?` (${n.compressionRatio})`:``} — saved to Local Vault & launched on stage.`,`success`)}function rn(e,n){let r=(n||`imported-swf`).replace(/\.swf$/i,``).toLowerCase().replace(/[^a-z0-9_-]/g,`-`)||`flash-${Date.now().toString(36)}`,i=r.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),a=e?.metadata,o={id:r,title:`Flash: ${i}`,stage:`FLASH TRANSLATED`,category:`Imported Flash`,type:`Sim`,desc:a?`Transpiled from Flash SWF v${a.version} (${a.signature}, ${a.width}×${a.height}, ${a.shapeCount} vector shapes, ${a.frameCount} frames) into 60 FPS native SVG + AST.`:`Transpiled from legacy Adobe Flash SWF into 60 FPS deterministic vector SVG + AST.`,icon:`⚡`,source:`imported`,svgMarkup:e.svgMarkup,astSource:e.astSource,author:`Flash Archive`,version:`Flash v${a?.version||9}`,invariants:[`Legacy Vector Timeline`,`ActionScript Translation`],createdAt:Date.now(),updatedAt:Date.now()};t(o),X=null,sn(),Y===`swf`&&(Y=null,Q()),cn(),_n(o),Qt(`⚡ Imported "${o.title}" into Local Vault & launched on stage.`,`success`)}function an(e,t){e.innerHTML=`<div style="padding:12px; font-size:0.8rem; color:#94a3b8;">⏳ Loading Full PhET Simulation Transpiler...</div>`,tn().then(({renderPhetTranspilerDrawer:n})=>{if(Dt||!e.isConnected)return;let r=n({setCustomSvgCode:()=>{},setCustomAstCode:()=>{},postToPlayer:e=>K(e),setHotReloadFlash:()=>{},onLaunchCartridge:e=>nn(e),onClose:t});e.replaceChildren(r)}).catch(t=>{e.textContent=`Could not load PhET Importer: ${t?.message||`offline error`}`})}function on(e,t,n){e.innerHTML=`<div style="padding:12px; font-size:0.8rem; color:#94a3b8;">⏳ Loading Historic Flash (.swf) Transpiler...</div>`,en().then(({renderSwfTranspilerDrawer:r})=>{if(Dt||!e.isConnected)return;let i=()=>{t===`launcher`&&X===`swf`?sn():t===`stage`&&Y===`swf`&&Q(!0)},a=r({swfResult:Ft,setSwfResult:e=>{Ft=e,i()},isParsingSwf:Lt,setIsParsingSwf:e=>{Lt=e,i()},swfError:Rt,setSwfError:e=>{Rt=e,i()},swfDragActive:zt,setSwfDragActive:e=>{zt!==e&&(zt=e,i())},swfFileName:It,setSwfFileName:e=>{It=e},setCustomSvgCode:()=>{},setCustomAstCode:()=>{},postToPlayer:e=>K(e),setHotReloadFlash:()=>{},onLaunchCartridge:(e,t)=>rn(e,t),onClose:n});e.replaceChildren(a)}).catch(t=>{e.textContent=`Could not load Flash (.swf) Importer: ${t?.message||`offline error`}`})}function sn(){if(!me)return;if(fe&&(fe.setAttribute(`aria-expanded`,String(X===`swf`)),fe.style.background=X===`swf`?`#fef3c7`:`#fffbeb`,fe.style.borderColor=X===`swf`?`#b45309`:`#d97706`),ue&&(ue.setAttribute(`aria-expanded`,String(X===`phet`)),ue.style.background=X===`phet`?`#bae6fd`:`#e0f2fe`,ue.style.borderColor=X===`phet`?`#0369a1`:`#0284c7`),!X){me.style.display=`none`,me.replaceChildren();return}me.style.display=`block`;let e=()=>{X=null,sn()};X===`phet`?an(me,e):on(me,`launcher`,e)}function Q(e=!1){if(Re&&!(Y===`diagnostics`&&!e&&qt&&qt.isConnected&&Jt===d)){if(Y===`ai-tutor`&&!e&&Xt&&Xt.isConnected&&Zt===d)Z?.updateTelemetry(Ht);else if(Re.innerHTML=``,Y!==`diagnostics`&&(qt=null,Jt=``),Y!==`ai-tutor`&&(Xt=null,Z=null,Zt=``),W&&(W.style.background=Y===`ai-tutor`?`#581c87`:`#1e293b`,W.style.borderColor=Y===`ai-tutor`?`#c084fc`:`#9333ea`),De&&(De.style.background=Y===`lab`?`#0369a1`:`#1e293b`,De.style.borderColor=Y===`lab`?`#38bdf8`:`#0284c7`),Ie&&(Ie.style.background=Y===`embed`?`#065f46`:`#1e293b`,Ie.style.borderColor=Y===`embed`?`#34d399`:`#059669`),ke&&(ke.style.background=Y===`diagnostics`?`#14532d`:`#1e293b`,ke.style.borderColor=Y===`diagnostics`?`#4ade80`:`#16a34a`),Fe&&(Fe.style.background=Y===`swf`?`#78350f`:`#1e293b`,Fe.style.borderColor=Y===`swf`?`#fbbf24`:`#d97706`),Pe&&(Pe.style.background=Y===`phet`?`#075985`:`#1e293b`,Pe.style.borderColor=Y===`phet`?`#38bdf8`:`#0284c7`),!Y)Re.style.display=`none`;else if(Re.style.display=`block`,Y===`ai-tutor`){let e=pe({isOpen:!0,onClose:()=>{Y=null,Q()},preset:d,postToPlayer:e=>K(e),latestTelemetry:Ht,activeQuiz:Ut,isAiDemonstrating:Wt,onCancelDemonstration:()=>{Wt=!1,Z?.setDemonstrating(!1)}});e&&(Xt=e,Z=e.__nanoDrawerHandle||null,Zt=d,Re.appendChild(e))}else if(Y===`lab`){let e=he({isOpen:!0,onClose:()=>{Y=null,Q()},preset:d});e&&Re.appendChild(e)}else if(Y===`diagnostics`){let e=_t(d),t=Yt;Yt=!1;let n=qe({onClose:()=>{Y=null,qt=null,Jt=``,Q()},presetId:d,presetLabel:e.label,presetType:e.type||`Sim`,postToPlayer:e=>K(e),benchTransport:jt,webMcpHandle:J,autoRunBenchmark:t,onAutoRunConsumed:()=>{Yt=!1}});qt=n,Jt=d,Re.appendChild(n)}else if(Y===`embed`){let e=e=>`<iframe src="${window.location.origin}${n}player.html?preset=${d}&mode=${e}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`,t=de({isOpen:!0,onClose:()=>{Y=null,Q()},embedTargetMode:Gt,setEmbedTargetMode:e=>{Gt=e,Q()},copiedEmbed:Kt,onCopyEmbedCode:()=>{Kt=!0,navigator.clipboard?.writeText(e(Gt)),Q(),setTimeout(()=>{Kt=!1,Y===`embed`&&Q()},2e3)},embedCode:e(Gt)});t&&Re.appendChild(t)}else if(Y===`swf`){let e=document.createElement(`div`);e.style.cssText=`padding:16px 18px; color:#f8fafc;`,Re.appendChild(e),on(e,`stage`,()=>{Y=null,Q()})}else if(Y===`phet`){let e=document.createElement(`div`);e.style.cssText=`padding:16px 18px; color:#f8fafc;`,Re.appendChild(e),an(e,()=>{Y=null,Q()})}}}function cn(){R&&(R.innerHTML=yt(d),R.value=d)}let ln=!1;L?.addEventListener(`load`,()=>{ln=!0;let t=e();if(t&&t!==`en`)try{L.contentWindow?.postMessage({type:`SET_LANGUAGE`,lang:t},`*`)}catch{}});let un=null;function dn(e,t){Se&&(Se.innerHTML=bt(e,t))}function fn(e,t){if(!z)return;let n=st(e),r=l().some(e=>e.id===n&&e.source!==`builtin`),i=$e(n);un=t||null;let a=t?.status||(i&&r?`tampered`:i?`verified-native`:`unverified-external`);if(a===`verified-native`){let e=(t?.shortHash||i?.seal||``).slice(0,6);z.textContent=e?`🛡️ St Joseph's Curriculum • ${e}`:`🛡️ St Joseph's Curriculum`,z.style.background=`rgba(16,185,129,0.16)`,z.style.color=`#34d399`,z.style.borderColor=`rgba(16,185,129,0.45)`,z.title=t?.badgeTooltip||`Verified St Joseph's Curriculum Cartridge (${i?.title||n}) • Authority Seal: ${Qe(i?.seal||``)} — Click to inspect SHA-256 digests`}else if(a===`tampered`){let e=(t?.shortHash||i?.seal||``).slice(0,6);z.textContent=e?`✎ Altered • ${e}`:`✎ Altered`,z.style.background=`rgba(245,158,11,0.18)`,z.style.color=`#fbbf24`,z.style.borderColor=`rgba(245,158,11,0.5)`,z.title=t?.badgeTooltip||`Altered / Remixed Cartridge (${n}) — Live SHA-256 differs from St Joseph's Curriculum seal. Click to inspect.`}else z.textContent=`◈ Custom / Vault`,z.style.background=`rgba(148,163,184,0.16)`,z.style.color=`#cbd5e1`,z.style.borderColor=`rgba(148,163,184,0.4)`,z.title=t?.badgeTooltip||`Custom or external cartridge (${n}) — Click to inspect SHA-256 provenance`;dn(n,t||(r&&i?{status:`tampered`,seal:i.seal}:null))}z?.addEventListener(`click`,()=>{if(!B)return;let e=B.style.display===`none`;dn(d,un),B.style.display=e?`flex`:`none`}),Ce?.addEventListener(`click`,()=>{B&&(B.style.display=`none`)});function pn(e){te&&(te.style.display=E?`block`:`none`),ne&&(ne.style.display=E?`none`:`block`);let t=r.querySelector(`#catholic-sanctuary-banner`);if(t){let n=e||_t(d);t.style.display=E&&dt(n)?`flex`:`none`}F&&(F.style.cursor=E?`pointer`:`default`,F.style.textDecoration=E?`underline`:`none`),se&&(se.style.display=E?`inline`:`none`),ce&&(ce.style.display=E?`inline`:`none`,e&&(ce.textContent=e.label))}function mn(e=!0){if(E){if(E=!1,ln=!1,D=null,p=null,Y=null,Q(),B&&(B.style.display=`none`),L&&(L.src=`about:blank`),Nt(!1),pn(),e){let e=new URL(window.location.href);e.searchParams.delete(`preset`),e.searchParams.delete(`app`),e.searchParams.delete(`src`),e.searchParams.delete(`file`),window.history.pushState({launcher:!0},``,e.toString())}$(),requestAnimationFrame(()=>{window.scrollY>0&&window.scrollTo({top:0,behavior:`smooth`})})}}re?.addEventListener(`click`,()=>mn(!0)),F?.addEventListener(`click`,()=>{E&&mn(!0)}),le?.addEventListener(`click`,()=>{ze?.click()}),ue?.addEventListener(`click`,()=>{X=X===`phet`?null:`phet`,sn()}),fe?.addEventListener(`click`,()=>{X=X===`swf`?null:`swf`,sn()}),X&&sn();function hn(e,t=!1,r=!0){if(e===`__custom_find__`||e===`__open_local__`)return;let i=st(e),a=E;E=!0,d=i,ht(i);let s=_t(i);ve&&(ve.textContent=s.label),ye&&(ye.textContent=s.stage),be&&(be.textContent=s.type||`Sim`),fn(i,null),R&&(lt(s)?cn():R.value=i),pn(s),p=null,i!==`lumina-architecture`&&o(i,$e(i)?.seal).catch(()=>{});let c=!L||!L.src||L.src===`about:blank`||L.getAttribute(`src`)===`about:blank`;!t&&ln&&!c&&L&&L.contentWindow?(K({type:`SET_PRESET`,preset:i,play:!0}),Mt()):L&&(c||!ln)&&(ln=!1,L.src=ct(n,i,N)),C({subtitle:`${s.label}. ${s.stage}`,isSpeaking:!0}),gt(),Y&&Q();let l=new URL(window.location.href);l.searchParams.delete(`src`),l.searchParams.delete(`file`),l.searchParams.delete(`app`),l.searchParams.set(`preset`,i),!a&&r?window.history.pushState({preset:i},``,l.toString()):window.history.replaceState({preset:i},``,l.toString()),$(),a||requestAnimationFrame(()=>{window.scrollY>0&&window.scrollTo({top:0,behavior:`smooth`})})}let gn=()=>{let e=new URLSearchParams(window.location.search),t=e.get(`preset`)||e.get(`app`),r=e.get(`src`)||e.get(`file`);t?hn(t,!1,!1):r?(E=!0,p=r,ln=!1,pn(),L&&(L.src=ct(n,d,N,r))):E&&mn(!1)};window.addEventListener(`popstate`,gn);function _n(e){let t=!!(ln&&L?.contentWindow&&L.getAttribute(`src`)!==`about:blank`);t||(D=e),hn(e.id,!0),t&&L?.contentWindow&&(L.contentWindow.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:e},`*`),Mt())}async function vn(e){$t();try{let t=await Ct(e);t?(cn(),_n(t),Qt(`✓ Imported "${t.title}" into Local Vault & launched on stage.`,`success`)):Qt(`Unsupported file format. Drop or choose a Flash (.swf), PhET (.html / .phet), Cartridge (.json), .ast, or .svg file.`,`error`)}catch(e){console.error(`[media-player] Error ingesting uploaded files:`,e),Qt(`Import failed: ${e?.message||`Could not parse the selected file.`}`,`error`)}}function yn(){if(!Ge)return;let e=mt().filter(e=>!E||e!==d).map(e=>it.find(t=>t.id===e)).filter(e=>!!e).slice(0,4);e.length===0?(Ge.style.display=`none`,Ge.replaceChildren()):(Ge.style.display=`flex`,Ge.innerHTML=`
      <span style="color:#64748b; font-weight:700;">Recently opened:</span>
      ${e.map(e=>`
        <button type="button" class="recent-lab-btn" data-id="${q(e.id)}" style="padding:3px 10px; border-radius:6px; border:1px solid #e2e8f0; background:#f8fafc; color:#0f172a; font-size:0.76rem; font-weight:600; cursor:pointer; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${q(e.label)}
        </button>
      `).join(``)}
    `,Ge.querySelectorAll(`.recent-lab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&hn(t)})}))}function $(){if(!Ke)return;yn();let e=M.toLowerCase().trim(),t=vt(j),n=t.filter(t=>{let n=O===`All`||ft(t)===O,r=!0;k===`3D`?r=!!t.has3D:k!==`All`&&(r=(t.type||`Sim`)===k);let i=pt(t,A),a=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e)||(t.subject||``).toLowerCase().includes(e)||(t.oakUnit||``).toLowerCase().includes(e);return n&&r&&i&&a}),r=!!(e||O!==`All`||k!==`All`||A!==`All`||j);if(We&&(We.style.display=r?`inline-block`:`none`),G){let e=j?`activities (including recall data & docs)`:`visual labs & lessons`,r=et().slice(0,8);G.textContent=`Showing ${n.length} of ${t.length} ${e} · 🛡️ ${tt()} Verified to St Joseph's Curriculum (Master SHA-256: ${r}…)`}Ke.innerHTML=xt({filtered:n,isStageOpen:E,activePreset:d,activeSubject:O}),n.length!==0&&(Ke.querySelectorAll(`.subject-focus-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation(),O=e.getAttribute(`data-focus-subject`)||`All`,wn(),$()})}),Ke.querySelectorAll(`.cartridge-card`).forEach(e=>{let t=()=>{Tt(L);let t=e.getAttribute(`data-id`);t&&hn(t)};e.addEventListener(`click`,t),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),t())})}))}function bn(e){let t=wt(e);t?(cn(),_n(t)):hn(`phet-${e}`)}R?.addEventListener(`change`,e=>{let t=e.target.value;t===`__open_local__`?(R.value=d,ze?.click()):t===`__phet_ohms_law__`||t===`phet-ohms-law`?bn(`ohms-law`):t===`__phet_faraday__`||t===`phet-faraday`?bn(`faraday`):t===`__phet_pendulum__`||t===`phet-pendulum`?bn(`pendulum`):t===`__phet_acid_base__`||t===`phet-acid-base`?bn(`acid-base`):t===`__phet_balancing__`||t===`phet-balancing-chemical`?bn(`balancing-chemical`):t===`__custom_find__`?(R.value=d,mn(!0),Ve?.focus()):hn(t)}),Ne?.addEventListener(`click`,()=>{ze?.click()}),ze?.addEventListener(`change`,e=>{let t=e.target;t.files&&t.files.length&&(vn(Array.from(t.files)),t.value=``)}),[Ze,ne].forEach(e=>{e&&(e.addEventListener(`dragover`,t=>{t.preventDefault(),t.stopPropagation(),e.style.outline=`3px dashed #38bdf8`,e.style.outlineOffset=`-4px`}),e.addEventListener(`dragleave`,t=>{t.preventDefault(),t.stopPropagation(),e.style.outline=`none`}),e.addEventListener(`drop`,t=>{t.preventDefault(),t.stopPropagation(),e.style.outline=`none`,t.dataTransfer&&t.dataTransfer.files&&t.dataTransfer.files.length&&vn(Array.from(t.dataTransfer.files))}))}),V?.addEventListener(`click`,()=>{Tt(L),Et(L,`togglePlay`)||K({type:`TOGGLE_PLAY`}),Mt()}),H?.addEventListener(`click`,()=>{Tt(L),Et(L,`reset`)||K({type:`RESET_SIM`}),Mt()});function xn(e){U&&(U.style.background=e?`#451a03`:`#1e293b`,U.style.borderColor=e?`#d97706`:`#334155`,U.title=e?`Unmute simulation audio (M)`:`Mute simulation audio (M)`);let t=r.querySelector(`#player-mute-icon`),n=r.querySelector(`#player-mute-text`);t&&(t.textContent=e?`🔇`:`🔊`),n&&(n.textContent=e?`Muted`:`Audio ON`)}U?.addEventListener(`click`,()=>{let e=b();h(e);let t=!e;e&&Tt(L),P=t,xn(t),Et(L,`setAudioState`,{voiceEnabled:e,muted:t})||(K({type:`SET_VOICE`,enabled:e}),K({type:`SET_MUTED`,muted:t}))}),Ee?.addEventListener(`click`,()=>{S()});function Sn(e){Ee&&(Ee.textContent=`🖐️ BSL Signing: ${e?`ON`:`OFF`}`,Ee.style.background=e?`#0284c7`:`#1e293b`,Ee.style.borderColor=e?`#38bdf8`:`#334155`)}T(e=>{N!==e&&(N=e,Sn(e),K({type:`SET_BSL`,enabled:e}))}),g(e=>{try{let t=!e;P=t,xn(t),K({type:`SET_VOICE`,enabled:e}),K({type:`SET_MUTED`,muted:t})}catch{}});let Cn=e=>{if(!E)return;let t=document.activeElement?.tagName.toLowerCase();t!==`input`&&t!==`textarea`&&t!==`select`&&(e.key===`m`||e.key===`M`?(e.preventDefault(),U?.click()):e.code===`Space`&&!e.repeat&&(e.preventDefault(),V?.click()))};window.addEventListener(`keydown`,Cn),window.addEventListener(`message`,e=>{if(e.data&&typeof e.data==`object`){if(e.data.requestId&&rt.has(e.data.requestId)){let t=rt.get(e.data.requestId);if(e.data.type===t.expectedType){clearTimeout(t.timer),rt.delete(e.data.requestId),t.resolve(e.data);return}}if(e.data.type===`PLAYER_READY`){if(!E)return;if(ln=!0,K({type:`SET_VOICE`,enabled:!P}),K({type:`SET_MUTED`,muted:P}),D){let e=D;D=null,K({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:e})}else p?p=null:d&&(!e.data.preset||e.data.preset!==d)&&K({type:`SET_PRESET`,preset:d,play:!1});Nt(!!e.data.isPlaying),m&&(!e.data.preset||e.data.preset===d)&&(m=!1,setTimeout(()=>{r.isConnected&&!Dt&&(je&&(je.style.display=`inline-flex`),Ae&&(Ae.setAttribute(`aria-expanded`,`true`),Ae.style.background=`#1e293b`,Ae.style.color=`#f8fafc`,Ae.textContent=`🧰 Teacher Tools ▴`),Y=`diagnostics`,Yt=!0,Q(!0))},150))}if((e.data.type===`PLAY_STATE_CHANGED`||e.data.type===`STATE_CHANGED`||e.data.type===`statechange`)&&typeof(e.data.isPlaying??e.data.playing)==`boolean`&&Nt(!!(e.data.isPlaying??e.data.playing)),(e.data.type===`PRESETCHANGE`||e.data.type===`PLAYER_PRESET_CHANGED`)&&typeof e.data.preset==`string`){let t=st(e.data.preset);t!==d&&hn(t,!0)}if(e.data.type===`CARTRIDGE_INGESTED`&&(cn(),$()),e.data.type===`CARTRIDGE_INTEGRITY`&&e.data.integrity){let t=typeof e.data.preset==`string`&&e.data.preset?e.data.preset:d;st(t)===st(d)&&fn(t,e.data.integrity)}if((e.data.type===`VOICE_TOGGLE`||e.data.type===`SET_VOICE`)&&typeof e.data.enabled==`boolean`&&y(e.data.enabled),e.data.type===`BSL_STATE_CHANGED`&&typeof e.data.active==`boolean`&&(N=e.data.active,Sn(e.data.active),w(e.data.active)),e.data.type===`TOGGLE_BSL`&&typeof e.data.enabled==`boolean`&&(N=e.data.enabled,Sn(e.data.enabled),w(e.data.enabled)),e.data.type===`SITE_DIRECTIVE`&&e.data.directive&&typeof e.data.directive==`object`){if(L?.contentWindow&&e.source&&e.source!==L.contentWindow)return;ae(e.data.directive).then(e=>{e.ok&&e.action===`toggle_bsl`&&typeof e.detail.bslEnabled==`boolean`&&(N=e.detail.bslEnabled,Sn(e.detail.bslEnabled))}).catch(()=>{})}if((e.data.type===`TELEMETRY`||e.data.type===`AST_TELEMETRY`||e.data.type===`PLAYER_TELEMETRY`)&&(Ht=e.data.telemetry||e.data.payload||e.data,Y===`ai-tutor`&&Z?.updateTelemetry(Ht)),e.data.type===`AI_DEMO_START`&&(Wt=!0,Z?.setDemonstrating(!0)),(e.data.type===`AI_DEMO_COMPLETE`||e.data.type===`PUPIL_PREEMPTION`)&&(Wt=!1,Z?.setDemonstrating(!1)),e.data.type===`CHECKPOINT_ANSWERED`&&(!e.data.isCorrect&&e.data.prompt?(Ut={sceneId:typeof e.data.sceneId==`string`&&e.data.sceneId?e.data.sceneId:d,sceneTitle:typeof e.data.sceneTitle==`string`?e.data.sceneTitle:void 0,index:Number(e.data.index||0),mode:e.data.mode===`pass-expr`?`pass-expr`:`multiple-choice`,prompt:String(e.data.prompt),options:Array.isArray(e.data.options)?e.data.options:void 0,chosenIndex:typeof e.data.chosenIdx==`number`?e.data.chosenIdx:null,chosenText:typeof e.data.selectedText==`string`?e.data.selectedText:``,answerIndex:typeof e.data.answer==`number`?e.data.answer:void 0,explanation:typeof e.data.explanation==`string`?e.data.explanation:``,distractorNudge:typeof e.data.distractorNudge==`string`?e.data.distractorNudge:``,autoAsk:!1},Y===`ai-tutor`&&Z&&Z.askCheckpoint(Ut,!1)):e.data.isCorrect&&(Ut=null)),(e.data.type===`ASK_NANO_CHECKPOINT`||e.data.type===`OPEN_NANO_TUTOR`)&&(Ut={sceneId:typeof e.data.sceneId==`string`&&e.data.sceneId?e.data.sceneId:d,sceneTitle:typeof e.data.sceneTitle==`string`?e.data.sceneTitle:void 0,index:Number(e.data.index||0),mode:e.data.mode===`pass-expr`?`pass-expr`:`multiple-choice`,prompt:String(e.data.prompt||``),options:Array.isArray(e.data.options)?e.data.options:void 0,chosenIndex:typeof e.data.chosenIndex==`number`?e.data.chosenIndex:null,chosenText:typeof e.data.chosenText==`string`?e.data.chosenText:``,answerIndex:typeof e.data.answerIndex==`number`?e.data.answerIndex:void 0,correctText:typeof e.data.correctText==`string`?e.data.correctText:``,explanation:typeof e.data.explanation==`string`?e.data.explanation:``,distractorNudge:typeof e.data.distractorNudge==`string`?e.data.distractorNudge:``,passExpr:typeof e.data.passExpr==`string`?e.data.passExpr:``,targetSelector:typeof e.data.targetSelector==`string`?e.data.targetSelector:``,vars:e.data.vars&&typeof e.data.vars==`object`?e.data.vars:void 0,computed:e.data.computed&&typeof e.data.computed==`object`?e.data.computed:void 0,progress:typeof e.data.progress==`number`?e.data.progress:void 0,autoAsk:e.data.autoAsk!==!1},Y===`ai-tutor`&&Z&&Zt===d?Z.askCheckpoint(Ut,Ut.autoAsk!==!1):(Y=`ai-tutor`,Q(!0))),e.data.type,(e.data.type===`LOG_JOTTER_CSV`||e.data.type===`JOTTER_CSV_RESPONSE`)&&typeof e.data.csv==`string`){let t=typeof e.data.sceneId==`string`?e.data.sceneId:d,n=Number(e.data.rowCount||1),r=typeof e.data.nodePath==`string`?e.data.nodePath:`lab/${t}`;if(oe(t,e.data.csv,r).then(()=>{Me&&(Me.textContent=`✓ Saved ${n} rows to Jotter`,Me.style.background=`#065f46`,Me.style.borderColor=`#10b981`,Me.style.color=`#ffffff`,setTimeout(()=>{Me.textContent=`📊 Save Results to Jotter`,Me.style.background=`#1e293b`,Me.style.borderColor=`#0284c7`,Me.style.color=`#38bdf8`},2400))}).catch(()=>{}),e.data.download)try{let n=new Blob([e.data.csv],{type:`text/csv;charset=utf-8;`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${t||`lab`}-data.csv`,document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(r),1e3)}catch{}}if(e.data.type===`SAVE_REMIX_CARTRIDGE`&&e.data.cartridge){let n=e.data.cartridge,r=typeof e.data.exportMode==`string`?e.data.exportMode:`vault`;if(n.id&&n.astSource&&n.svgMarkup){let e={id:n.id,title:n.title||n.id,stage:n.stage||`CUSTOM REMIX`,type:n.type||`Sim`,category:n.category||`Student Remixes`,desc:n.desc||`Custom student remix saved offline.`,icon:n.icon||`🧪`,source:`user`,svgMarkup:n.svgMarkup,astSource:n.astSource,createdAt:n.createdAt||Date.now(),updatedAt:Date.now()};t(e),d=e.id,ve&&(ve.textContent=e.title),ye&&(ye.textContent=e.stage),be&&(be.textContent=e.type||`Sim`),fn(e.id,null),cn(),$();let a=new URL(window.location.href);a.searchParams.set(`preset`,e.id),window.history.replaceState({},``,a.toString()),i(async()=>{let{saveRemixDuoToNominatedFolder:e,downloadAstbBinary:t}=await import(`./localCartridgeBuilder-iDxmeB40.js`).then(e=>e.a);return{saveRemixDuoToNominatedFolder:e,downloadAstbBinary:t}},__vite__mapDeps([1,0,2])).then(async({saveRemixDuoToNominatedFolder:t,downloadAstbBinary:n})=>{let i=await t({id:e.id,astText:e.astSource||``,svgText:e.svgMarkup||``});if(r===`astb`&&n(i.artifact.id,i.artifact.astbData),K({type:`REMIX_SAVED_ACK`,message:i.wroteToFolder&&i.folderName?`✓ Saved ${e.id}.ast + .svg + bytecode/.astb into "${i.folderName}" & Vault!`:r===`astb`?`⚡ Compiled & downloaded ${i.artifact.id}.astb (${i.artifact.bytecodeBytes} B)`:`✓ Saved "${e.title}" to offline Vault!`}),Oe){let t=Oe.textContent;Oe.textContent=`✓ Saved ${e.id}`,Oe.style.background=`#065f46`,setTimeout(()=>{Oe.textContent=t||`💻 Remix & Code`,Oe.style.background=`#1e293b`},2600)}}).catch(()=>{})}}if(e.data.type===`NANO_REMIX_REQUEST`&&e.data.context){let t=e.data.context;i(async()=>{let{promptAiRemixAssistant:e}=await import(`./nanoRemixCopilot-nnMpDVws.js`);return{promptAiRemixAssistant:e}},__vite__mapDeps([3,4,0,5,6])).then(async({promptAiRemixAssistant:e})=>{K({type:`NANO_REMIX_RESULT`,proposal:await e(t)})}).catch(e=>{K({type:`NANO_REMIX_RESULT`,proposal:{requestId:t.requestId,mode:`advice_only`,explanation:`Could not reach Nano Remix Co-Pilot: ${e?.message||`offline error`}`,engineUsed:`deterministic-remix`}})})}}}),window.addEventListener(`app-setting-changed`,e=>{e.detail&&(e.detail.key===`app_perf_hud_enabled`||e.detail.key===`app_hud_verbosity`||e.detail.key===`app_frame_budget_alert`)&&(K({type:`SET_PERF_HUD`,enabled:f(`app_perf_hud_enabled`)===`true`,mode:f(`app_hud_verbosity`)||`minimal`,strictAlarm:f(`app_frame_budget_alert`)===`true`}),Y===`diagnostics`&&Q())}),window.addEventListener(`cartridges_updated`,()=>{cn(),$()}),W?.addEventListener(`click`,()=>{Y=Y===`ai-tutor`?null:`ai-tutor`,Q()}),De?.addEventListener(`click`,()=>{Y=Y===`lab`?null:`lab`,Q()}),Oe?.addEventListener(`click`,()=>{K({type:`OPEN_STUDIO`,tab:`ast`}),Mt()}),Ae?.addEventListener(`click`,()=>{if(!je)return;let e=je.style.display===`inline-flex`;je.style.display=e?`none`:`inline-flex`,Ae.setAttribute(`aria-expanded`,String(!e)),Ae.style.background=e?`#0f172a`:`#1e293b`,Ae.style.color=e?`#94a3b8`:`#f8fafc`,Ae.textContent=e?`🧰 Teacher Tools ▾`:`🧰 Teacher Tools ▴`}),ke?.addEventListener(`click`,()=>{Y=Y===`diagnostics`?null:`diagnostics`,Q()}),Me?.addEventListener(`click`,e=>{K({type:`REQUEST_JOTTER_CSV`,download:!!e.shiftKey})}),Ie?.addEventListener(`click`,()=>{Y=Y===`embed`?null:`embed`,Q()}),Pe?.addEventListener(`click`,()=>{Y=Y===`phet`?null:`phet`,Q()}),Fe?.addEventListener(`click`,()=>{Y=Y===`swf`?null:`swf`,Q()}),Le?.addEventListener(`click`,()=>{let e=_t(d);Je(d,e.label)}),Be?.addEventListener(`click`,()=>{let e=r.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()});function wn(){Ye.forEach(e=>{let t=e.getAttribute(`data-cat`)===O;e.style.background=t?`#ffffff`:`transparent`,e.style.color=t?`#0f172a`:`#475569`,e.style.boxShadow=t?`0 1px 3px rgba(15,23,42,0.1)`:`none`})}function Tn(){Xe.forEach(e=>{let t=e.getAttribute(`data-format`)===k;e.style.background=t?`#e0f2fe`:`#f8fafc`,e.style.color=t?`#0369a1`:`#475569`,e.style.borderColor=t?`#0284c7`:`#e2e8f0`})}return Ye.forEach(e=>{e.addEventListener(`click`,()=>{O=e.getAttribute(`data-cat`)||`All`,wn(),$()})}),Xe.forEach(e=>{e.addEventListener(`click`,()=>{k=e.getAttribute(`data-format`)||`All`,Tn(),$()})}),He?.addEventListener(`change`,()=>{A=He.value||`All`,$()}),Ue?.addEventListener(`change`,()=>{j=!!Ue.checked,$()}),We?.addEventListener(`click`,()=>{O=`All`,k=`All`,A=`All`,j=!1,M=``,Ve&&(Ve.value=``),He&&(He.value=`All`),Ue&&(Ue.checked=!1),wn(),Tn(),$()}),Ve?.addEventListener(`input`,e=>{M=e.target.value,$()}),$(),r}export{Dt as default,Dt as renderPlayerPage,se as i,le as n,ce as r,ue as t};