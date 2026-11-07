import{C as e,S as t,b as n,d as r,f as i,i as a,l as o,m as s,n as c,p as l,t as u,w as d,x as f,y as p}from"./index-BYgedQln.js";import{t as m}from"./EdgeCognitiveEngine-DyRDzvX2.js";var h={suite:{label:`Interactive Suite Mode`,icon:`⚡`,tag:`PURE INSTRUMENT`,description:`100% edge-to-edge interactive apparatus. Hides external video scrubbers and frames so all temporal, physical, and spatial manipulation occurs directly inside the graphic.`},classroom:{label:`Classroom Mode`,icon:`🎓`,tag:`RECOMMENDED FOR TEACHERS`,description:`Optimized for smartboards & interactive whiteboards. Retains playback, checkpoints, narration, and print worksheets while hiding dev tools and stream controls.`},student:{label:`Student Focus Mode`,icon:`🎒`,tag:`DISTRACTION-FREE`,description:`Clean revision environment for pupils. Focuses exclusively on concepts, narration, and formative active-recall checkpoints with zero administrative clutter.`},broadcast:{label:`Broadcast / OBS Mode`,icon:`📡`,tag:`FLIPPED CLASSROOM`,description:`Configured for OBS Studio recording and live streaming. Prioritizes OBS WebSocket sync, live captioning, and transparent overlay workflows.`},developer:{label:`Developer & Author Mode`,icon:`🛠️`,tag:`FULL TOOLSUITE`,description:`Complete authoring environment: SVG element inspector, live AST code studio, standalone SPA compiler, and raw XML copy utilities.`},embedded:{label:`Dedicated Embedded Mode`,icon:`📦`,tag:`SEAMLESS EMBED`,description:`Embedded iframe view optimized for LMS, portal viewports, and host applications. Suppresses duplicate internal selector menus.`},custom:{label:`Custom Profile`,icon:`🎛️`,tag:`USER DEFINED`,description:`Granularly toggle individual links, toolbars, and controls to match your exact institutional or personal preferences.`}},g={mode:`suite`,showPresetSelector:!0,showStageBadge:!0,showInteractiveCheckpoints:!0,show3DControls:!0,showDevInspect:!1,showDevStudio:!1,showExportSpa:!1,showExportZip:!0,showStandaloneLink:!0,showObsLink:!1,showLmsEmbed:!1,showPrintWorksheet:!0,showCopySvg:!1,showThemeToggle:!0,showFullscreen:!0,showPipButton:!0,showTimelineScrubber:!1,showPlaybackControls:!1,showSpeedSelector:!1,showVoiceNarration:!0,showVoiceControl:!0,showLanguageSelector:!0,showSubtitles:!1,showLoopToggle:!1,showVolumeControl:!1,showPhysicsControls:!1},_={mode:`classroom`,showPresetSelector:!0,showStageBadge:!0,showInteractiveCheckpoints:!0,show3DControls:!0,showDevInspect:!1,showDevStudio:!1,showExportSpa:!1,showExportZip:!0,showStandaloneLink:!0,showObsLink:!1,showLmsEmbed:!1,showPrintWorksheet:!0,showCopySvg:!1,showThemeToggle:!0,showFullscreen:!0,showPipButton:!0,showTimelineScrubber:!0,showPlaybackControls:!0,showSpeedSelector:!0,showVoiceNarration:!0,showVoiceControl:!0,showLanguageSelector:!0,showSubtitles:!0,showLoopToggle:!0,showVolumeControl:!0,showPhysicsControls:!0},v={mode:`student`,showPresetSelector:!0,showStageBadge:!0,showInteractiveCheckpoints:!0,show3DControls:!0,showDevInspect:!1,showDevStudio:!1,showExportSpa:!1,showExportZip:!1,showStandaloneLink:!1,showObsLink:!1,showLmsEmbed:!1,showPrintWorksheet:!1,showCopySvg:!1,showThemeToggle:!0,showFullscreen:!0,showPipButton:!0,showTimelineScrubber:!0,showPlaybackControls:!0,showSpeedSelector:!0,showVoiceNarration:!0,showVoiceControl:!0,showLanguageSelector:!0,showSubtitles:!0,showLoopToggle:!0,showVolumeControl:!0,showPhysicsControls:!1},y={mode:`broadcast`,showPresetSelector:!0,showStageBadge:!0,showInteractiveCheckpoints:!0,show3DControls:!0,showDevInspect:!1,showDevStudio:!1,showExportSpa:!1,showExportZip:!1,showStandaloneLink:!0,showObsLink:!0,showLmsEmbed:!1,showPrintWorksheet:!1,showCopySvg:!1,showThemeToggle:!0,showFullscreen:!0,showPipButton:!0,showTimelineScrubber:!0,showPlaybackControls:!0,showSpeedSelector:!0,showVoiceNarration:!0,showVoiceControl:!0,showLanguageSelector:!0,showSubtitles:!0,showLoopToggle:!0,showVolumeControl:!0,showPhysicsControls:!0},b={mode:`developer`,showPresetSelector:!0,showStageBadge:!0,showInteractiveCheckpoints:!0,show3DControls:!0,showDevInspect:!0,showDevStudio:!0,showExportSpa:!0,showExportZip:!0,showStandaloneLink:!0,showObsLink:!0,showLmsEmbed:!0,showPrintWorksheet:!0,showCopySvg:!0,showThemeToggle:!0,showFullscreen:!0,showPipButton:!0,showTimelineScrubber:!0,showPlaybackControls:!0,showSpeedSelector:!0,showVoiceNarration:!0,showVoiceControl:!0,showLanguageSelector:!0,showSubtitles:!0,showLoopToggle:!0,showVolumeControl:!0,showPhysicsControls:!0},x={mode:`embedded`,showPresetSelector:!1,showStageBadge:!1,showInteractiveCheckpoints:!0,show3DControls:!0,showDevInspect:!1,showDevStudio:!1,showExportSpa:!1,showExportZip:!1,showStandaloneLink:!1,showObsLink:!1,showLmsEmbed:!1,showPrintWorksheet:!1,showCopySvg:!1,showThemeToggle:!0,showFullscreen:!0,showPipButton:!0,showTimelineScrubber:!0,showPlaybackControls:!0,showSpeedSelector:!1,showVoiceNarration:!0,showVoiceControl:!1,showLanguageSelector:!0,showSubtitles:!0,showLoopToggle:!0,showVolumeControl:!0,showPhysicsControls:!1},S=`stj_player_display_config`;function C(e){switch(e){case`suite`:return{...g};case`student`:return{...v};case`broadcast`:return{...y};case`developer`:return{...b};case`embedded`:return{...x};default:return{..._}}}function w(e){if(typeof window<`u`)try{localStorage.setItem(S,JSON.stringify(e))}catch(e){console.warn(`[PlayerConfig] Error saving display config:`,e)}}function T(e){if(!e.isOpen)return null;let{displayConfig:t,setDisplayConfig:n,postToPlayer:r,onClose:i}=e,a=document.createElement(`div`);a.className=`ast-player-settings-modal`,a.style.cssText=`
    background: var(--stj-surface-raised, #0f172a);
    border-bottom: 1px solid var(--stj-border, #334155);
    padding: 16px 20px;
    color: var(--stj-text, #f8fafc);
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fadeIn 0.15s ease;
  `;let o=document.createElement(`div`);o.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;`;let s=document.createElement(`div`);s.innerHTML=`
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 1.2rem;">⚙️</span>
      <strong style="font-size: 0.95rem;">Player Display &amp; Controls Configuration</strong>
      <span class="stj-badge stj-badge-primary" style="font-size: 0.68rem; text-transform: uppercase;">
        ${t.mode} MODE
      </span>
    </div>
    <p style="margin: 3px 0 0; fontSize: 0.78rem; color: var(--stj-text-muted, #94a3b8);">
      Select a profile preset or customize individual links so only required controls are shown.
    </p>
  `,o.appendChild(s);let c=document.createElement(`div`);c.style.cssText=`display: flex; gap: 8px; align-items: center;`;let l=document.createElement(`button`);l.type=`button`,l.className=`stj-btn stj-btn-ghost stj-btn-sm`,l.style.fontSize=`0.74rem`,l.title=`Reset all settings to Classroom Mode default`,l.textContent=`↺ Reset to Classroom Mode`,l.onclick=()=>{let e=C(`classroom`);n(e),w(e),r({type:`SET_DISPLAY_CONFIG`,config:e})},c.appendChild(l);let u=document.createElement(`button`);u.type=`button`,u.className=`stj-btn stj-btn-secondary stj-btn-sm`,u.style.cssText=`font-size: 0.74rem; min-width: 32px;`,u.textContent=`✕ Close`,u.onclick=i,c.appendChild(u),o.appendChild(c),a.appendChild(o);let d=document.createElement(`div`),f=document.createElement(`span`);f.style.cssText=`font-size: 0.72rem; font-weight: 800; color: var(--stj-text-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;`,f.textContent=`Select Teaching & Viewing Profile`,d.appendChild(f);let p=document.createElement(`div`);p.style.cssText=`display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;`,[`classroom`,`student`,`broadcast`,`developer`].forEach(e=>{let i=h[e],a=t.mode===e,o=document.createElement(`div`);o.style.cssText=`
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      border: ${a?`2px solid var(--stj-primary, #38bdf8)`:`1px solid var(--stj-border, #334155)`};
      background: ${a?`var(--stj-primary-surface, rgba(56,189,248,0.1))`:`var(--stj-surface, #1e293b)`};
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    `,o.innerHTML=`
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <strong style="font-size: 0.84rem; color: ${a?`var(--stj-primary, #38bdf8)`:`var(--stj-text, #f8fafc)`}">
          ${i.icon} ${i.label}
        </strong>
        ${a?`<span style="font-size: 0.72rem; color: var(--stj-primary, #38bdf8); font-weight: 800;">✓ ACTIVE</span>`:``}
      </div>
      <span style="font-size: 0.66rem; font-weight: 700; color: var(--stj-text-muted, #94a3b8); letter-spacing: 0.04em;">
        ${i.tag}
      </span>
      <p style="margin: 0; font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8); line-height: 1.35;">
        ${i.description}
      </p>
    `,o.onclick=()=>{let t=C(e);n(t),w(t),r({type:`SET_DISPLAY_CONFIG`,config:t})},p.appendChild(o)}),d.appendChild(p),a.appendChild(d);let m=document.createElement(`div`);m.style.cssText=`border-top: 1px solid var(--stj-border, #334155); padding-top: 10px;`;let g=document.createElement(`details`);g.style.cursor=`pointer`;let _=document.createElement(`summary`);_.style.cssText=`font-size: 0.8rem; font-weight: 700; color: var(--stj-primary, #38bdf8); margin-bottom: 8px;`,_.textContent=`🎛️ Granular Control Toggles (Customize individual links & buttons)`,g.appendChild(_);let v=document.createElement(`div`);v.style.cssText=`display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 10px;`;let y=(e,i)=>{let a=document.createElement(`div`),o=document.createElement(`strong`);o.style.cssText=`font-size: 0.74rem; text-transform: uppercase; color: var(--stj-text-muted, #94a3b8); display: block; margin-bottom: 8px;`,o.textContent=e,a.appendChild(o);let s=document.createElement(`div`);return s.style.cssText=`display: flex; flex-direction: column; gap: 8px;`,i.forEach(({key:e,label:i})=>{let a=document.createElement(`label`);a.style.cssText=`display: flex; align-items: center; gap: 8px; font-size: 0.78rem; cursor: pointer;`;let o=document.createElement(`input`);o.type=`checkbox`,o.checked=!!t[e],o.onchange=()=>{let i={...t,mode:`custom`,[e]:o.checked};n(i),w(i),r({type:`SET_DISPLAY_CONFIG`,config:i})};let c=document.createElement(`span`);c.textContent=i,a.appendChild(o),a.appendChild(c),s.appendChild(a)}),a.appendChild(s),a},b=y(`Header & Action Links`,[{key:`showPresetSelector`,label:`Curriculum Preset Selector`},{key:`showDevInspect`,label:`🛠️ SVG Element Inspector`},{key:`showDevStudio`,label:`💻 Live Code Studio`},{key:`showExportSpa`,label:`🚀 Standalone SVG SPA Export`},{key:`showExportZip`,label:`📦 Offline Simulator Suite ZIP Bundle`},{key:`showStandaloneLink`,label:`↗ Standalone Window Button`},{key:`showPipButton`,label:`📺 Document Picture-in-Picture & Floating Player`},{key:`showObsLink`,label:`📡 OBS Broadcast WebSocket Link`},{key:`showLmsEmbed`,label:`🔗 LMS Embed Code Generator`},{key:`showPrintWorksheet`,label:`🖨️ A4 Classroom Worksheet`},{key:`showCopySvg`,label:`📋 Copy Raw SVG Geometry`}]),x=y(`Learning, 3D & Playback Features`,[{key:`showInteractiveCheckpoints`,label:`🎯 Checkpoint Active Recall Quizzes`},{key:`show3DControls`,label:`🌐 3D Spatial Orbit & Camera Toolbar`},{key:`showSubtitles`,label:`💬 Synchronized Subtitles Overlay`},{key:`showVoiceNarration`,label:`🔊 Voice Narration (Web Speech)`},{key:`showTimelineScrubber`,label:`⏱️ Timeline Scrubber Track`},{key:`showSpeedSelector`,label:`⏩ Playback Speed Selector`},{key:`showLanguageSelector`,label:`🌍 Multi-Language Selector`},{key:`showLoopToggle`,label:`🔁 Auto-Repeat Loop Toggle`},{key:`showVolumeControl`,label:`🔊 Master Volume & Mute Controls`},{key:`showPhysicsControls`,label:`🪐 Micro-Physics & Gravity Subsystem`},{key:`ai_copilot_beta`,label:`✨ Gemini Nano On-Device Co-Pilot [Beta] (:act bidirectional RPC)`}]);return v.appendChild(b),v.appendChild(x),g.appendChild(v),m.appendChild(g),a.appendChild(m),a}function E(e){if(!e.isOpen)return null;let{embedTargetMode:t,setEmbedTargetMode:n,copiedEmbed:r,onCopyEmbedCode:i,embedCode:a}=e,o=document.createElement(`div`);o.className=`ast-player-embed-modal`,o.style.cssText=`
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
  `,m.textContent=a,o.appendChild(m),o}function D(e){let{inspectedElement:t,setInspectedElement:n,postToPlayer:r}=e,i=document.createElement(`div`);if(i.className=`ast-svg-inspector-drawer`,i.style.cssText=`
    background: var(--stj-canvas, #090d16);
    border: 1px solid var(--stj-border, #334155);
    border-radius: var(--stj-radius-sm, 6px);
    padding: 12px;
    color: var(--stj-text, #f8fafc);
  `,t){let e=document.createElement(`div`),a=document.createElement(`div`);a.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;`,a.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="stj-badge stj-badge-primary">&lt;${t.tag||`element`}&gt;</span>
        <code style="color: var(--stj-primary, #38bdf8); font-weight: 700;">${t.selector||`#element`}</code>
      </div>
      <span style="font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8);">
        Bounds: ${Math.round(t.bbox?.width||0)}×${Math.round(t.bbox?.height||0)} px
      </span>
    `,e.appendChild(a);let o=document.createElement(`div`);o.style.cssText=`display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;`;let s=(e,t,n,r,i=`text`,a)=>{let o=document.createElement(`div`),s=document.createElement(`label`);s.style.cssText=`font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8); display: block; margin-bottom: 3px;`,s.textContent=e,o.appendChild(s);let c=document.createElement(`input`);return c.type=i,a&&(c.step=a),c.value=t,c.placeholder=n,c.className=`stj-input`,c.style.cssText=`width: 100%; font-size: 0.76rem; padding: 4px 8px; background: #1e293b; color: #fff; border: 1px solid #334155; border-radius: 4px;`,c.oninput=e=>r(e.target.value),o.appendChild(c),o};o.appendChild(s(`Fill Color`,t.attributes?.fill||``,`#ff0000 or rgba(...)`,e=>{n({...t,attributes:{...t.attributes||{},fill:e}}),r({type:`UPDATE_ELEMENT_ATTR`,selector:t.selector,attr:`fill`,value:e})})),o.appendChild(s(`Stroke Color`,t.attributes?.stroke||``,`#38bdf8`,e=>{n({...t,attributes:{...t.attributes||{},stroke:e}}),r({type:`UPDATE_ELEMENT_ATTR`,selector:t.selector,attr:`stroke`,value:e})})),o.appendChild(s(`Stroke Width`,t.attributes?.strokeWidth||`1`,`1`,e=>{n({...t,attributes:{...t.attributes||{},strokeWidth:e}}),r({type:`UPDATE_ELEMENT_ATTR`,selector:t.selector,attr:`stroke-width`,value:e})},`number`,`0.5`)),o.appendChild(s(`Transform Expr`,t.attributes?.transform||``,`e.g. translate(20, 10)`,e=>{n({...t,attributes:{...t.attributes||{},transform:e}}),r({type:`UPDATE_ELEMENT_ATTR`,selector:t.selector,attr:`transform`,value:e})})),e.appendChild(o);let c=document.createElement(`div`);c.style.cssText=`display: flex; gap: 8px; flex-wrap: wrap;`;let l=document.createElement(`button`);l.type=`button`,l.className=`stj-btn stj-btn-secondary stj-btn-sm`,l.style.fontSize=`0.74rem`,l.textContent=`📋 Copy Selector`,l.onclick=()=>{t.selector&&navigator.clipboard.writeText(t.selector)},c.appendChild(l);let u=document.createElement(`button`);u.type=`button`,u.className=`stj-btn stj-btn-primary stj-btn-sm`,u.style.fontSize=`0.74rem`,u.textContent=`⚡ Copy AST Rule Snippet`,u.onclick=()=>{let e=`(:target "${t.selector||`#element`}" :attr "transform" :expr "'rotate(' + (t * 360) + ')'")`;navigator.clipboard.writeText(e)},c.appendChild(u),e.appendChild(c),i.appendChild(e)}else i.innerHTML=`
      <div style="text-align: center; padding: 16px; color: var(--stj-text-muted, #94a3b8);">
        <div style="font-size: 1.4rem; margin-bottom: 6px;">🎯</div>
        <strong style="color: var(--stj-text, #f8fafc);">No Stage Element Selected Yet</strong>
        <p style="margin: 4px 0 10px; font-size: 0.78rem;">
          Click any element on the vector stage to inspect its selector, bounding box, and live styling in real time.
        </p>
        <button id="ast-activate-selector-btn" type="button" class="stj-btn stj-btn-primary stj-btn-sm" style="font-size: 0.76rem; font-weight: 700; cursor: pointer;">
          🛠️ Activate Element Selector
        </button>
      </div>
    `,i.querySelector(`#ast-activate-selector-btn`)?.addEventListener(`click`,()=>{r({type:`SET_DEV_MODE`,enabled:!0})});return i}function O(e){let{swfResult:t,setSwfResult:n,isParsingSwf:r,setIsParsingSwf:i,swfError:a,setSwfError:s,swfDragActive:c,setSwfDragActive:l,setCustomSvgCode:u,setCustomAstCode:d,postToPlayer:f,setHotReloadFlash:p}=e,m=document.createElement(`div`);m.className=`ast-swf-transpiler-drawer`,m.style.cssText=`display: flex; flex-direction: column; gap: 14px;`;let h=document.createElement(`div`);h.style.cssText=`
    border: ${c?`2px dashed var(--stj-primary, #6366f1)`:`2px dashed var(--stj-border, #334155)`};
    background: ${c?`var(--stj-primary-surface, rgba(99, 102, 241, 0.1))`:`var(--stj-canvas, #090d16)`};
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
  `,h.innerHTML=`
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
  `;let g=async(e,t)=>{i(!0),s(null);try{let r=await o(e,t);r.success?(n(r),u(r.svgMarkup),d(r.astSource)):s(r.error||`Failed to transpile SWF binary.`)}catch(e){s(e?.message||`Error processing SWF file.`)}finally{i(!1)}};h.ondragover=e=>{e.preventDefault(),l(!0)},h.ondragleave=()=>l(!1),h.ondrop=async e=>{e.preventDefault(),l(!1);let t=e.dataTransfer?.files?.[0];if(!t)return;let n=await t.arrayBuffer(),r=t.name.replace(/\.[^/.]+$/,``).toLowerCase().replace(/[^a-z0-9-]/g,`-`);g(n,r)},h.querySelector(`#ast-swf-file-input`)?.addEventListener(`change`,async e=>{let t=e.target.files?.[0];if(!t)return;let n=await t.arrayBuffer(),r=t.name.replace(/\.[^/.]+$/,``).toLowerCase().replace(/[^a-z0-9-]/g,`-`);g(n,r)}),m.appendChild(h);let _=document.createElement(`div`);_.style.cssText=`display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`;let v=document.createElement(`span`);if(v.style.cssText=`font-size: 0.74rem; font-weight: 700; color: var(--stj-text-muted, #94a3b8);`,v.textContent=`Legacy Samples:`,_.appendChild(v),[{id:`flash-pendulum`,title:`⚖️ Physics Harmonic Pendulum`,desc:`Classic legacy science lab animation with angle sweep & potential energy.`,mockBytes:()=>new Uint8Array([70,87,83,8,64,0,0,0,120,0,7,208,0,0,4,176,24,0,60,0,67,2,15,23,42])},{id:`flash-circuit`,title:`💡 Ohm’s Law Circuit Switch`,desc:`Bistable switch and resistor wire animation from 2004 Flash science kits.`,mockBytes:()=>new Uint8Array([70,87,83,8,64,0,0,0,120,0,7,208,0,0,4,176,24,0,60,0,67,2,15,23,42])}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.className=`stj-btn stj-btn-secondary stj-btn-sm`,t.style.fontSize=`0.74rem`,t.title=e.desc,t.textContent=e.title,t.onclick=()=>{g(e.mockBytes().buffer,e.id)},_.appendChild(t)}),m.appendChild(_),a){let e=document.createElement(`div`);e.style.cssText=`padding: 8px 12px; border-radius: 6px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.78rem;`,e.textContent=`❌ ${a}`,m.appendChild(e)}if(r){let e=document.createElement(`div`);e.style.cssText=`padding: 12px; text-align: center; color: var(--stj-primary, #38bdf8); font-size: 0.8rem;`,e.textContent=`⏳ Decompiling SWF byte stream and generating vector paths...`,m.appendChild(e)}if(t&&t.metadata){let e=t.metadata,n=document.createElement(`div`);n.style.cssText=`background: var(--stj-canvas, #090d16); border: 1px solid var(--stj-border, #334155); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;`;let r=document.createElement(`div`);r.style.cssText=`display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;`,r.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="stj-badge stj-badge-success" style="font-weight: 700;">✓ Transpiled</span>
        <strong style="font-size: 0.86rem; color: var(--stj-text, #f8fafc);">
          Legacy Flash SWF v${e.version} (${e.signature})
        </strong>
      </div>
    `;let i=document.createElement(`div`);i.style.cssText=`display: flex; align-items: center; gap: 6px;`;let a=document.createElement(`button`);a.type=`button`,a.className=`stj-btn stj-btn-primary stj-btn-sm`,a.style.cssText=`font-size: 0.75rem; font-weight: 700;`,a.innerHTML=`⚡ Test &amp; Play in Stage`,a.onclick=()=>{f({type:`HOT_RELOAD_SVG`,svg:t.svgMarkup}),f({type:`HOT_RELOAD_AST`,ast:t.astSource}),f({type:`SEEK`,progress:0}),f({type:`PLAY`}),p(!0),setTimeout(()=>p(!1),2200)},i.appendChild(a);let o=document.createElement(`button`);o.type=`button`,o.className=`stj-btn stj-btn-secondary stj-btn-sm`,o.style.fontSize=`0.75rem`,o.textContent=`💾 Download SVG`,o.onclick=()=>{let n=new Blob([t.svgMarkup],{type:`image/svg+xml;charset=utf-8`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`transpiled-${e.signature.toLowerCase()||`swf`}.svg`,i.click(),URL.revokeObjectURL(r)},i.appendChild(o),r.appendChild(i),n.appendChild(r);let s=document.createElement(`div`);s.style.cssText=`display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;`,s.innerHTML=`
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
      <pre style="margin: 0; padding: 8px; background: var(--stj-surface, #1e293b); border: 1px solid var(--stj-border, #334155); border-radius: 6px; font-size: 0.72rem; color: var(--stj-text-muted, #94a3b8); max-height: 110px; overflow-y: auto; font-family: monospace;">${t.astSource}</pre>
    `,c.querySelector(`#ast-copy-code-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(t.astSource)}),n.appendChild(c),m.appendChild(n)}return m}function k(e){let{setCustomSvgCode:t,setCustomAstCode:n,postToPlayer:i,setHotReloadFlash:a}=e,s=null,c=!1,u=null,d=!1,f=document.createElement(`div`);f.className=`ast-phet-transpiler-drawer`,f.style.cssText=`display: flex; flex-direction: column; gap: 14px; color: #f8fafc;`;let p=()=>{f.innerHTML=``;let e=document.createElement(`div`);e.style.cssText=`
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 0.78rem;
      line-height: 1.5;
      color: #cbd5e1;
    `,e.innerHTML=`
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span style="font-size: 1.1rem;">⚡</span>
        <strong style="color: #38bdf8;">PhET Open-Source Model Transpiler</strong>
      </div>
      Distills 12 MB monolithic PhET bundles (Univ. of Colorado Boulder) down into <strong style="color: #4ade80;">3.5 KB AST S-Expressions</strong>. Ingests physical invariants, binds zero-asset audio synthesis, and injects SCORM gradebook auto-reporting.
    `,f.appendChild(e);let t=document.createElement(`div`),n=document.createElement(`div`);n.style.cssText=`font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase;`,n.textContent=`Distill Benchmark Simulation:`,t.appendChild(n);let r=document.createElement(`div`);r.style.cssText=`display: grid; grid-template-columns: 1fr 1fr; gap: 6px;`,[{id:`ohms-law`,label:`💡 Ohm's Law (V=IR)`,desc:`Circuit Current & Resistance`},{id:`faraday`,label:`🧲 Faraday's Induction`,desc:`Coil, Magnet & EMF`},{id:`acid-base`,label:`🧪 Acid-Base pH Scale`,desc:`Hydronium Equilibrium`},{id:`pendulum`,label:`⏱️ Pendulum Lab`,desc:`Harmonic Period Invariance`},{id:`balancing-chemical`,label:`⚗️ Balancing Equations`,desc:`Stoichiometric Balances`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
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
      `,t.onmouseenter=()=>t.style.borderColor=`#38bdf8`,t.onmouseleave=()=>t.style.borderColor=`rgba(255, 255, 255, 0.12)`,t.onclick=()=>h(e.id),r.appendChild(t)}),t.appendChild(r),f.appendChild(t);let i=document.createElement(`div`);if(i.style.cssText=`
      border: ${d?`2px dashed #38bdf8`:`2px dashed rgba(255, 255, 255, 0.18)`};
      border-radius: 10px;
      padding: 24px 16px;
      text-align: center;
      background: ${d?`rgba(56, 189, 248, 0.08)`:`rgba(0, 0, 0, 0.25)`};
      transition: all 0.2s;
      cursor: pointer;
    `,i.innerHTML=`
      <span style="font-size: 2rem; display: block; margin-bottom: 6px;">📥</span>
      <div style="font-size: 0.85rem; font-weight: 800; color: #f8fafc;">
        Drop ANY PhET Simulation (HTML5 or Legacy Flash)
      </div>
      <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px;">
        Supports modern PhET HTML5 (*.html, *.json) &amp; legacy Flash (*.swf) &bull; Click to browse
      </div>
    `,i.ondragover=e=>{e.preventDefault(),d=!0,i.style.border=`2px dashed #38bdf8`,i.style.background=`rgba(56, 189, 248, 0.08)`},i.ondragleave=()=>{d=!1,i.style.border=`2px dashed rgba(255, 255, 255, 0.18)`,i.style.background=`rgba(0, 0, 0, 0.25)`},i.ondrop=e=>{e.preventDefault(),d=!1;let t=e.dataTransfer?.files?.[0];t&&m(t)},i.onclick=()=>{let e=document.createElement(`input`);e.type=`file`,e.accept=`.html,.json,.htm,.swf,.phet`,e.onchange=e=>{let t=e.target.files?.[0];t&&m(t)},e.click()},f.appendChild(i),c){let e=document.createElement(`div`);e.style.cssText=`text-align: center; padding: 12px; color: #38bdf8; font-size: 0.8rem; font-weight: 700;`,e.textContent=`⏳ Analyzing PhET scene graph and extracting mathematical invariants...`,f.appendChild(e)}if(u){let e=document.createElement(`div`);e.style.cssText=`padding: 8px 12px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); color: #fca5a5; font-size: 0.75rem;`,e.textContent=`⚠️ ${u}`,f.appendChild(e)}if(s&&s.metadata){let e=s.metadata,t=document.createElement(`div`);t.style.cssText=`background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 12px;`,t.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.74rem; color: #38bdf8; font-weight: 800; text-transform: uppercase;">
            Transpilation Telemetry:
          </span>
          <span style="background: #16a34a; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 0.68rem; font-weight: 900;">
            ${e.compressionRatio}
          </span>
        </div>
        <div style="font-size: 0.88rem; font-weight: 900; color: #f8fafc; margin-bottom: 4px;">
          ${e.title}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0;">
          <div style="background: rgba(0,0,0,0.3)', padding: 6px; border-radius: 4px; text-align: center;">
            <div style="font-size: 0.65rem; color: #94a3b8;">Original PhET Bundle</div>
            <div style="font-size: 0.95rem; fontWeight: 900; color: #f87171;">
              ${(e.originalSizeBytes/1048576).toFixed(1)} MB
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.3)', padding: 6px; border-radius: 4px; text-align: center;">
            <div style="font-size: 0.65rem; color: #94a3b8;">Distilled AST Payload</div>
            <div style="font-size: 0.95rem; fontWeight: 900; color: #4ade80;">
              ${(e.distilledSizeBytes/1024).toFixed(1)} KB
            </div>
          </div>
        </div>
        <div style="font-size: 0.72rem; color: #cbd5e1; margin-bottom: 10px;">
          <div><strong>Invariants Solved:</strong> ${e.detectedInvariants.join(` • `)}</div>
          <div><strong>Languages Ingested:</strong> ${e.localesFound.join(`, `)}</div>
        </div>
        <button id="ast-mount-phet-btn" type="button" style="width: 100%; padding: 10px; background: #2563eb; border: none; border-radius: 6px; color: #ffffff; font-size: 0.8rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>🚀</span> Mount Distilled Simulation to Live Player
        </button>
      `,t.querySelector(`#ast-mount-phet-btn`)?.addEventListener(`click`,g),f.appendChild(t)}},m=async e=>{c=!0,u=null,p();try{if(e.name.toLowerCase().endsWith(`.swf`)){let r=await e.arrayBuffer(),i=e.name.replace(/\.swf$/i,``),a=await o(r,i);if(a.success){let r=e.size,o=new Blob([a.svgMarkup+a.astSource]).size,c=((r-o)/Math.max(1,r)*100).toFixed(1);s={success:!0,metadata:{simName:i,title:`PhET Legacy Flash: ${i}`,version:`Flash v${a.metadata?.version||9}`,originalSizeBytes:r,distilledSizeBytes:o,compressionRatio:`${c}% reduction`,detectedInvariants:[`Legacy Flash Vector Timeline`,`SWF Tag Stream Transpiled`],localesFound:[`en`]},svgMarkup:a.svgMarkup,astSource:a.astSource},t(s.svgMarkup),n(s.astSource)}else u=a.error||`Failed to transpile legacy PhET SWF.`;return}let r=await e.text(),i=await l(r,e.name);i.success?(s=i,t(i.svgMarkup),n(i.astSource)):u=i.error||`Failed to transpile PhET bundle.`}catch(e){u=e?.message||`Error processing PhET file.`}finally{c=!1,p()}},h=e=>{c=!0,u=null,p();try{let i=r[e],a=i.generateSvg().trim(),o=i.generateAst().trim(),c=125e5,l=new Blob([a+o]).size,u=((c-l)/c*100).toFixed(1);s={success:!0,metadata:{simName:e,title:i.title,version:`1.2.0`,originalSizeBytes:c,distilledSizeBytes:l,compressionRatio:`${u}% reduction`,detectedInvariants:i.invariants,localesFound:[`en`,`es`,`fr`,`de`,`pl`,`uk`]},svgMarkup:a,astSource:o},t(a),n(o)}catch(e){u=e?.message||`Error loading preset.`}finally{c=!1,p()}},g=()=>{s&&(i({type:`HOT_RELOAD_SVG`,svg:s.svgMarkup}),i({type:`HOT_RELOAD_AST`,ast:s.astSource}),a(!0),setTimeout(()=>a(!1),900))};return p(),f}function A(e){if(!e.isOpen)return null;let{onClose:t,studioTab:n,setStudioTab:r,inspectedElement:i,setInspectedElement:a,customSvgCode:o,setCustomSvgCode:s,customAstCode:c,setCustomAstCode:l,hotReloadFlash:u,setHotReloadFlash:d,postToPlayer:f,swfResult:p,setSwfResult:m,isParsingSwf:h,setIsParsingSwf:g,swfError:_,setSwfError:v,swfDragActive:y,setSwfDragActive:b}=e,x=document.createElement(`div`);x.className=`ast-dev-studio-drawer`,x.style.cssText=`
    background: var(--stj-surface-raised, #0f172a);
    border-top: 2px solid var(--stj-primary, #38bdf8);
    padding: 14px;
    color: var(--stj-text, #f8fafc);
    font-size: 0.82rem;
  `;let S=document.createElement(`div`);S.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--stj-border, #334155); flex-wrap: wrap; gap: 8px;`,S.innerHTML=`
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 1.2rem;">💻</span>
      <div>
        <strong style="font-size: 0.86rem; color: var(--stj-text, #f8fafc);">
          AST Vector Studio
        </strong>
        <span style="font-size: 0.74rem; color: var(--stj-text-muted, #94a3b8); margin-left: 8px;">
          Inspect stage nodes, live-edit SVG markup, and test continuous AST mathematics with zero cloud lag.
        </span>
      </div>
    </div>
  `;let C=document.createElement(`button`);C.type=`button`,C.className=`stj-btn stj-btn-ghost stj-btn-sm`,C.style.cssText=`font-size: 0.74rem; padding: 3px 8px; cursor: pointer;`,C.textContent=`✕ Close Studio`,C.onclick=t,S.appendChild(C),x.appendChild(S);let w=document.createElement(`div`);w.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;`;let T=document.createElement(`div`);T.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`,[{id:`svg`,label:`🎨 Raw SVG Source`},{id:`ast`,label:`⚡ AST Expressions`},{id:`inspector`,label:`🎯 Live Inspector`},{id:`templates`,label:`🚀 Scratchpad Templates`},{id:`swf`,label:`📦 SWF / Flash Importer`,title:`Transpile legacy Adobe Flash (.swf) into modern SVG + AST vectors`},{id:`phet`,label:`⚛️ PhET Importer`,title:`Transpile PhET simulations into lightweight 3.5 KB AST S-Expressions`}].forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.className=`stj-btn ${n===e.id?`stj-btn-primary`:`stj-btn-ghost`} stj-btn-sm`,t.style.fontSize=`0.76rem`,t.textContent=e.label,e.title&&(t.title=e.title),t.onclick=()=>r(e.id),T.appendChild(t)}),w.appendChild(T);let E=document.createElement(`div`);if(E.style.cssText=`display: flex; align-items: center; gap: 6px;`,u){let e=document.createElement(`span`);e.className=`stj-badge stj-badge-success`,e.style.fontSize=`0.72rem`,e.textContent=`✓ Hot-Reloaded!`,E.appendChild(e)}let A=document.createElement(`button`);A.type=`button`,A.className=`stj-btn stj-btn-primary stj-btn-sm`,A.style.cssText=`font-size: 0.76rem; font-weight: 700; cursor: pointer;`,A.textContent=`⚡ Run / Hot Reload`,A.onclick=()=>{n===`svg`?f({type:`HOT_RELOAD_SVG`,svg:o}):(n===`ast`||f({type:`HOT_RELOAD_SVG`,svg:o}),f({type:`HOT_RELOAD_AST`,ast:c}))},E.appendChild(A);let j=document.createElement(`button`);j.type=`button`,j.className=`stj-btn stj-btn-secondary stj-btn-sm`,j.style.fontSize=`0.76rem`,j.title=`Sync current stage SVG and AST source from player`,j.textContent=`↺ Pull from Stage`,j.onclick=()=>f({type:`GET_STAGE_SVG`}),E.appendChild(j),w.appendChild(E),x.appendChild(w);let M=document.createElement(`div`);if(n===`inspector`)M.appendChild(D({inspectedElement:i,setInspectedElement:a,postToPlayer:f}));else if(n===`svg`){let e=document.createElement(`div`),t=document.createElement(`textarea`);t.value=o,t.placeholder=`Click '↺ Pull from Stage' or paste SVG markup here...`,t.style.cssText=`
      width: 100%;
      height: 180px;
      background: var(--stj-canvas, #090d16);
      color: var(--stj-text, #f8fafc);
      border: 1px solid var(--stj-border, #334155);
      border-radius: var(--stj-radius-sm, 6px);
      padding: 10px;
      font-size: 0.76rem;
      font-family: monospace;
      line-height: 1.4;
      resize: vertical;
    `,t.oninput=e=>s(e.target.value),e.appendChild(t),M.appendChild(e)}else if(n===`ast`){let e=document.createElement(`div`),t=document.createElement(`textarea`);t.value=c,t.placeholder=`Enter AST S-Expressions: (:scene :id ... (:keyframes ...) (:bindings ...))`,t.style.cssText=`
      width: 100%;
      height: 180px;
      background: var(--stj-canvas, #090d16);
      color: var(--stj-text, #f8fafc);
      border: 1px solid var(--stj-border, #334155);
      border-radius: var(--stj-radius-sm, 6px);
      padding: 10px;
      font-size: 0.76rem;
      font-family: monospace;
      line-height: 1.4;
      resize: vertical;
    `,t.oninput=e=>l(e.target.value),e.appendChild(t),M.appendChild(e)}else if(n===`templates`){let e=document.createElement(`div`);e.style.cssText=`display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;`,[{title:`🪐 Orbital Gravity & Vector Physics`,desc:`Direct simulation of Keplerian planetary orbital motion and gravitational velocity vector tangent lines.`,svg:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><circle cx="400" cy="240" r="32" fill="#fbbf24" filter="url(#glow)" /><circle id="planet-body" cx="400" cy="80" r="14" fill="#38bdf8" /><line id="velocity-vector" x1="400" y1="80" x2="450" y2="80" stroke="#f43f5e" stroke-width="3" /><text id="velocity-label" x="400" y="50" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">v = 29.8 km/s</text></svg>`,ast:`(:scene :id "orbital-physics" :title "Orbital Mechanics" :stage "KS4 ASTRONOMY" :duration 6.0 (:keyframes ((:t 0.00 :title "Aphelion" :rule "Minimum orbital velocity") (:t 0.50 :title "Perihelion" :rule "Maximum gravitational acceleration"))) (:bindings ((:target "#planet-body" :attr "cx" :expr "400 + Math.cos(t * Math.PI * 2) * 220") (:target "#planet-body" :attr "cy" :expr "240 + Math.sin(t * Math.PI * 2) * 140") (:target "#velocity-vector" :attr "x1" :expr "400 + Math.cos(t * Math.PI * 2) * 220") (:target "#velocity-vector" :attr "y1" :expr "240 + Math.sin(t * Math.PI * 2) * 140") (:target "#velocity-vector" :attr "x2" :expr "400 + Math.cos(t * Math.PI * 2) * 220 - Math.sin(t * Math.PI * 2) * 60") (:target "#velocity-vector" :attr "y2" :expr "240 + Math.sin(t * Math.PI * 2) * 140 + Math.cos(t * Math.PI * 2) * 60") (:target "#velocity-label" :attr "textContent" :expr "'Orbital speed: ' + (29.8 + Math.cos(t * Math.PI * 2) * 5).toFixed(1) + ' km/s'"))))`},{title:`🌊 Harmonic Wave`,desc:`Continuous wave motion demonstrating frequency, amplitude, and crests.`,svg:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><line x1="100" y1="240" x2="700" y2="240" stroke="#334155" stroke-width="2" /><path id="harmonic-wave" d="M 100 240 Q 250 140 400 240 T 700 240" fill="none" stroke="#38bdf8" stroke-width="4" /><circle id="wave-tracer" cx="400" cy="240" r="10" fill="#f43f5e" filter="url(#glow)" /><text id="wave-label" x="400" y="80" fill="#38bdf8" font-size="20" font-weight="bold" text-anchor="middle">y = A · sin(ωt + φ)</text></svg>`,ast:`(:scene :id "sine-wave" :title "Harmonic Sine Wave" :stage "KS4 PHYSICS" :duration 4.0 (:keyframes ((:t 0.00 :title "Initial Phase" :rule "Zero displacement at origin") (:t 0.25 :title "Crest Amplitude" :rule "Maximum positive displacement +A"))) (:bindings ((:target "#wave-tracer" :attr "cy" :expr "240 - Math.sin(t * Math.PI * 2) * 90") (:target "#wave-tracer" :attr "cx" :expr "100 + (t * 600)") (:target "#wave-label" :attr "textContent" :expr "'Displacement y = ' + (Math.sin(t * Math.PI * 2) * 10).toFixed(1) + ' cm'"))))`},{title:`⏱️ Harmonic Pendulum`,desc:`Conservation of energy demonstrating kinetic vs potential oscillation.`,svg:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><circle cx="400" cy="80" r="6" fill="#64748b" /><line id="pendulum-rod" x1="400" y1="80" x2="400" y2="340" stroke="#94a3b8" stroke-width="3" /><circle id="pendulum-bob" cx="400" cy="340" r="28" fill="#10b981" stroke="#34d399" stroke-width="2" /><text id="energy-txt" x="400" y="420" fill="#34d399" font-size="16" font-weight="bold" text-anchor="middle">E = Ep + Ek</text></svg>`,ast:`(:scene :id "physics-pendulum" :title "Harmonic Pendulum" :stage "KS3 PHYSICS" :duration 3.0 (:keyframes ((:t 0.00 :title "Max Left Amplitude" :rule "Ep is maximal, Ek = 0") (:t 0.25 :title "Equilibrium Pass" :rule "Ek is maximal at center, Ep is minimum"))) (:bindings ((:target "#pendulum-rod" :attr "transform" :expr "'rotate(' + (Math.sin(t * Math.PI * 2) * 40) + ' 400 80)'") (:target "#pendulum-bob" :attr "transform" :expr "'rotate(' + (Math.sin(t * Math.PI * 2) * 40) + ' 400 80)'") (:target "#energy-txt" :attr "textContent" :expr "'Potential Energy: ' + (Math.abs(Math.sin(t * Math.PI * 2)) * 100).toFixed(0) + '% | Kinetic: ' + ((1 - Math.abs(Math.sin(t * Math.PI * 2))) * 100).toFixed(0) + '%'"))))`}].forEach(t=>{let n=document.createElement(`div`);n.style.cssText=`
        background: var(--stj-canvas, #090d16);
        border: 1px solid var(--stj-border, #334155);
        padding: 12px;
        border-radius: var(--stj-radius-sm, 6px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      `,n.innerHTML=`
        <div>
          <h5 style="margin: 0 0 4px; font-size: 0.85rem; color: var(--stj-text, #f8fafc);">${t.title}</h5>
          <p style="margin: 0; font-size: 0.75rem; color: var(--stj-text-muted, #94a3b8);">${t.desc}</p>
        </div>
      `;let r=document.createElement(`button`);r.type=`button`,r.className=`stj-btn stj-btn-primary stj-btn-sm`,r.style.cssText=`margin-top: 10px; font-size: 0.74rem; cursor: pointer;`,r.textContent=`Load Template ➜`,r.onclick=()=>{f({type:`HOT_RELOAD_SVG`,svg:t.svg}),f({type:`HOT_RELOAD_AST`,ast:t.ast}),d(!0),setTimeout(()=>d(!1),2e3)},n.appendChild(r),e.appendChild(n)}),M.appendChild(e)}else n===`swf`?M.appendChild(O({swfResult:p,setSwfResult:m,isParsingSwf:h,setIsParsingSwf:g,swfError:_,setSwfError:v,swfDragActive:y,setSwfDragActive:b,setCustomSvgCode:s,setCustomAstCode:l,postToPlayer:f,setHotReloadFlash:d})):n===`phet`&&M.appendChild(k({setCustomSvgCode:s,setCustomAstCode:l,postToPlayer:f,setHotReloadFlash:d}));return x.appendChild(M),x}var j=[/\b(kill\s*myself|end\s*my\s*life|commit\s*suicide|want\s*to\s*die|suicidal)\b/i,/\b(hurt\s*myself|cutting\s*myself|self\s*harm|cut\s*my\s*wrists)\b/i,/\b(nobody\s*loves\s*me|i\s*hate\s*my\s*life|want\s*to\s*disappear)\b/i,/\b(someone\s*is\s*hurting\s*me|being\s*abused|scared\s*to\s*go\s*home)\b/i],M=[/\b(how\s*to\s*make\s*(a\s*)?(bomb|weapon|explosive|gun))\b/i,/\b(shoot\s*(up|someone)|stab\s*someone|murder|assassinate)\b/i,/\b(porn|sex\w*|nude\w*|naked|erotic|masturbat\w*|penis|vagina|boobs)\b/i,/\b(fuck\w*|shit\w*|bitch\w*|cunt\w*|bastard\w*|nigger\w*|faggot\w*|retard\w*|whore\w*)\b/i,/\b(how\s*to\s*buy\s*(drugs|cocaine|heroin|weed|weed\s*online))\b/i,/\b(get\s*high|snort\s*cocaine|smoke\s*meth)\b/i],N=[/\b(my\s*phone\s*number\s*is|\b\d{10,11}\b|\b07\d{9}\b)/i,/\b(my\s*home\s*address\s*is|i\s*live\s*at\s*\d+)/i,/\b(my\s*password\s*is|my\s*snapchat|my\s*instagram|add\s*me\s*on\s*whatsapp)\b/i],P=[/\b(ignore\s*(all\s*)?previous\s*instructions)\b/i,/\b(you\s*are\s*now\s*DAN|do\s*anything\s*now)\b/i,/\b(pretend\s*you\s*have\s*no\s*rules|unrestricted\s*mode)\b/i,/\b(forget\s*(that\s*)?you\s*are\s*a\s*teacher)\b/i],F=`🕊️ If you are feeling overwhelmed, unhappy, or unsafe, please know that you are not alone and people care about you.

Please speak to a trusted adult, family member, or teacher right now.

If you are in the UK, you can speak to Childline free and confidentially anytime on **0800 1111** (or visit childline.org.uk).
In other countries, please reach out to your local child helpline or a trusted family member. We want you to be safe.`,I=`🛡️ This is a safe school learning space. Let's keep all questions kind, respectful, and focused on your schoolwork! What topic in your lessons would you like to explore next?`,L=`🔒 For your safety, please never share personal phone numbers, addresses, social media, or passwords online. Let's get back to your study topic!`,R=`I am your St Joseph's study assistant. I am here solely to help you learn your school subjects like Maths, Science, English, and History! What lesson are you working on today?`;function ee(e){if(!e||!e.trim())return{isSafe:!0};let t=e.trim();for(let e of j)if(e.test(t))return{isSafe:!1,category:`distress_crisis`,safeReplacementText:F,reason:`Student distress/crisis signal detected`};for(let e of M)if(e.test(t))return{isSafe:!1,category:`inappropriate_content`,safeReplacementText:I,reason:`Inappropriate or harmful language detected`};for(let e of N)if(e.test(t))return{isSafe:!1,category:`pii_leak`,safeReplacementText:L,reason:`Potential personal data disclosure`};for(let e of P)if(e.test(t))return{isSafe:!1,category:`jailbreak_attempt`,safeReplacementText:R,reason:`Jailbreak or persona override attempt`};return{isSafe:!0}}function te(e){let t=e,n=t.toLowerCase(),r=n.indexOf(`<script`);for(;r!==-1;){let e=n.indexOf(`<\/script>`,r);if(e===-1){t=t.slice(0,r);break}t=t.slice(0,r)+t.slice(e+9),n=t.toLowerCase(),r=n.indexOf(`<script`)}for(;n.includes(`<\/script>`);){let e=n.indexOf(`<\/script>`);t=t.slice(0,e)+t.slice(e+9),n=t.toLowerCase()}return t}function ne(e,t=`your lesson`){if(!e||!e.trim())return`What do you think is the next step we should investigate in ${t}?`;let n=e.trim();for(let e of M)if(e.test(n))return`Let's focus on the key question in ${t}: what rule or property helps us solve this step?`;return n=te(n),n=n.replace(/(?:javascript|data|vbscript):/gi,``),n=n.replace(/onload=/gi,``),n}var z=`ai_model_download_consent`;function B(){return typeof window>`u`?!1:localStorage.getItem(z)===`granted`}function re(e){typeof window<`u`&&(e?localStorage.setItem(z,`granted`):localStorage.setItem(z,`denied`),window.dispatchEvent(new Event(`storage`)),window.dispatchEvent(new CustomEvent(`ai_consent_changed`,{detail:e})))}function V(e){if(!e)return null;if(e instanceof RegExp)return e;if(typeof e==`string`)try{return new RegExp(e)}catch{return null}if(typeof e==`object`){let t=e.pattern||e.regex||e.source;if(t instanceof RegExp)return t;if(typeof t==`string`)try{return new RegExp(t)}catch{return null}}return null}function H(e,t){return typeof t==`string`&&(e.lastIndex=0,e.test(t)?!0:(e.lastIndex=0,e.test(t.trim())))}var U=new class{chatSession=null;activeSystemPrompt=``;cachedAvailability=null;availabilityPromise=null;getAiRoot(){if(typeof window>`u`)return null;let e=window,t=typeof self<`u`?self:e;return e.LanguageModel===void 0?t.LanguageModel===void 0?null:t.LanguageModel:e.LanguageModel}hasNativePromptApi(){return this.getAiRoot()!==null}hasWebLlmFallback(){return m.isSupported()}getActiveEngineType(){return this.hasNativePromptApi()?`chrome-builtin-nano`:m.isSupported()?`webgpu-webllm`:`rule-engine`}isPromptApiAvailableSync(){return B()?this.hasNativePromptApi()?!(this.cachedAvailability&&this.cachedAvailability.status===`no`):!!m.isSupported():!1}async checkAvailability(){if(this.cachedAvailability)return this.cachedAvailability;if(this.availabilityPromise)return this.availabilityPromise;let e=this.getAiRoot();return e?(this.availabilityPromise=(async()=>{try{if(typeof e.availability==`function`){let t=`no`;try{t=await e.availability({expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}],outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{try{t=await e.availability({outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{t=await e.availability()}}let n=t===`readily`||t===`available`?`readily`:t===`after-download`||t===`downloadable`?`after-download`:`no`;return this.cachedAvailability={status:n},this.cachedAvailability}if(typeof e.capabilities==`function`){let t=await e.capabilities(),n=t?.available===`readily`||t?.available===`available`?`readily`:t?.available===`after-download`||t?.available===`downloadable`?`after-download`:t?.available||`no`;return this.cachedAvailability={status:n,maxTokens:t?.maxTokens,temperature:t?.defaultTemperature},this.cachedAvailability}return this.cachedAvailability={status:`no`},this.cachedAvailability}catch{return this.cachedAvailability={status:`no`},this.cachedAvailability}finally{this.availabilityPromise=null}})(),this.availabilityPromise):m.isSupported()?(this.cachedAvailability={status:`readily`,maxTokens:4096,temperature:.2},this.cachedAvailability):(this.cachedAvailability={status:`no`},this.cachedAvailability)}async createSessionInstance(e){if(!B())throw Error(`User has not consented to in-browser AI model execution/download.`);let t=this.getAiRoot();if(!t)throw Error(`W3C LanguageModel API not supported in this environment.`);let n=e?.systemPrompt||`You are an elite UK Curriculum Socratic educator.`,r={initialPrompts:[{role:`system`,content:n}],samplingMode:`most-predictable`,expectedInputs:[{type:`text`,languages:[`en`]}],expectedOutputs:[{type:`text`,languages:[`en`]}],outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]};e?.onDownloadProgress&&(r.monitor=t=>{t.addEventListener(`downloadprogress`,t=>{e.onDownloadProgress?.(t.loaded,t.total)})});let i=(async()=>{try{return await t.create(r)}catch{try{return await t.create({initialPrompts:[{role:`system`,content:n}],temperature:.1,topK:1,outputLanguage:`en`,expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}catch{return await t.create({initialPrompts:[{role:`system`,content:n}],expectedInputLanguages:[`en`],expectedOutputLanguages:[`en`]})}}})(),a=e?.onDownloadProgress?45e3:25e3,o=new Promise((e,t)=>setTimeout(()=>t(Error(`[AiCaller] Session initialization timed out after ${a}ms`)),a));return Promise.race([i,o])}async getSession(e){let t=e?.systemPrompt||`You are an elite UK Curriculum Socratic educator.`;return e?.preserveContext?(this.chatSession&&this.activeSystemPrompt!==t&&this.destroy(),this.chatSession||=(this.activeSystemPrompt=t,await this.createSessionInstance(e)),this.chatSession):await this.createSessionInstance(e)}async promptText(e){if(!B())throw Error(`User has not consented to in-browser AI model execution.`);let t=ee(e.prompt);if(!t.isSafe)return t.safeReplacementText||`Let us keep our learning safe and focused on your school lessons.`;let n=``;if(this.hasNativePromptApi()){let t=!e.preserveContext,r=await this.getSession(e),i=e.timeoutMs??25e3,a=(async n=>{let i=n,a=t=>{let n={outputLanguage:`en`};return t&&e.responseConstraint&&(n.responseConstraint=e.responseConstraint,e.omitResponseConstraintInput!==void 0&&(n.omitResponseConstraintInput=e.omitResponseConstraintInput)),n},o=async(t,n)=>{let r=a(n),i=n?V(e.responseConstraint):null,o=async()=>{try{return await t.prompt(e.prompt,r)}catch(n){if(n?.name===`TypeError`||String(n?.message||``).includes(`parameter`))return await t.prompt(e.prompt);throw n}},s=await o();if(i&&!H(i,s)){console.warn(`[AiCaller] Chromium Issue 576432037: responseConstraint RegExp silently bypassed by engine. Output failed verification. Retrying prompt...`,{preview:(s||``).slice(0,80)});let e=!1;for(let t=1;t<=2;t++)try{let t=await o();if(H(i,t)){s=t,e=!0;break}}catch(e){console.warn(`[AiCaller] Constraint verification retry attempt ${t} failed:`,e)}if(!e)throw Error(`[AiCaller] Chromium Issue 576432037: output failed responseConstraint RegExp verification after retries. Rejecting dirty output: "${(s||``).slice(0,100)}..."`)}return s};try{return await o(i,!0)}catch(n){if(n?.name===`InvalidStateError`||String(n?.message||``).toLowerCase().includes(`destroyed`)){if(t)try{i?.destroy?.()}catch{}else this.destroy();i=await this.getSession(e),r=i;try{return await o(i,!0)}catch(e){throw e}}if(String(n?.message||``).includes(`Chromium Issue 576432037`))throw n;if(e.responseConstraint){console.warn(`[AiCaller] Prompt options with responseConstraint failed at runtime, attempting unconstrained with strict verification:`,n);let t=await o(i,!1),r=V(e.responseConstraint);if(r&&!H(r,t))throw Error(`[AiCaller] Chromium Issue 576432037: Unconstrained fallback failed responseConstraint RegExp verification. Rejecting dirty output.`);return t}throw n}})(r),o=new Promise((e,t)=>setTimeout(()=>t(Error(`[AiCaller] Inference prompt timed out after ${i}ms`)),i));try{n=await Promise.race([a,o])}catch(e){t||this.destroy(),console.warn(`[AiCaller] Chrome AI prompt failed, invoking WebLLM fallback:`,e)}finally{if(t&&r?.destroy)try{r.destroy()}catch{}}}if(!n&&m.isSupported()&&(n=(await m.infer(e.prompt,e.systemPrompt)).output),!n)throw Error(`No on-device AI inference engine is available in this browser environment.`);return ne(n)}async*promptStream(e){if(!B())throw Error(`User has not consented to in-browser AI model execution.`);let t=ee(e.prompt);if(!t.isSafe)yield t.safeReplacementText||`Let us keep our learning safe and focused on your school lessons.`;else{if(this.hasNativePromptApi()){let t=!e.preserveContext,n=await this.getSession(e);try{let t=null;try{t=n.promptStreaming?n.promptStreaming(e.prompt,{outputLanguage:`en`}):null}catch{t=n.promptStreaming?n.promptStreaming(e.prompt):null}if(!t){let t=``;try{t=await n.prompt(e.prompt,{outputLanguage:`en`})}catch{t=await n.prompt(e.prompt)}let r=V(e.responseConstraint);if(r&&!H(r,t))throw Error(`[AiCaller] Chromium Issue 576432037: Stream fallback output failed responseConstraint RegExp verification.`);yield t;return}if(Symbol.asyncIterator in t){let e=``;for await(let n of t){let t=n.startsWith(e)?n.slice(e.length):n;e=n,yield t}}else if(typeof t.getReader==`function`){let e=t.getReader(),n=``;try{for(;;){let{done:t,value:r}=await e.read();if(t)break;let i=typeof r==`string`?r:new TextDecoder().decode(r),a=i.startsWith(n)?i.slice(n.length):i;n=i,yield a}}finally{e.releaseLock()}}return}catch(e){t||this.destroy(),console.warn(`[AiCaller] Native stream failed, trying WebLLM streaming:`,e)}finally{if(t&&n?.destroy)try{n.destroy()}catch{}}}if(m.isSupported())for await(let t of m.inferStream(e.prompt,e.systemPrompt))yield t;else throw Error(`No on-device AI inference engine is available in this browser environment.`)}}async getRemainingTokens(){return this.chatSession?.tokensLeft?this.chatSession.tokensLeft:null}destroy(){if(this.chatSession){try{this.chatSession.destroy?.()}catch{}this.chatSession=null,this.activeSystemPrompt=``}}};function W(e){if(!e||typeof e!=`string`)return null;let t=e.trim().replace(/^['"]|['"]$/g,``);return/[<>'"`;(){}]/.test(t)||t.toLowerCase().includes(`script`)?null:/^[#\.]?[a-zA-Z0-9_\-\:]+$/.test(t)||/^\[[a-zA-Z0-9_\-]+(=['"]?[a-zA-Z0-9_\-]+['"]?)?\]$/.test(t)?t.startsWith(`#`)||t.startsWith(`.`)||t.startsWith(`[`)?t:`#${t}`:null}function ie(e){let t=[],n=``,r=[],i=/\(:act\s+([^)]+)\)/gi,a;for(;(a=i.exec(e))!==null;){let e=a[0],i=a[1];r.push(e);let o=i.match(/:seek\s+([0-9.]+)/i);if(o){let e=Math.max(0,Math.min(1,parseFloat(o[1])));isNaN(e)||t.push({type:`SEEK`,targetProgress:e,durationMs:800})}let s=i.match(/:(highlight|spotlight)\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))/i);if(s){let e=W(s[3]||s[4]||s[5]);e&&t.push({type:`HIGHLIGHT`,selector:e,pulseColor:`#38bdf8`,durationMs:4500})}let c=i.match(/:zoom\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))/i);if(c){let e=W(c[2]||c[3]||c[4]);e&&t.push({type:`ZOOM_ELEMENT`,selector:e,durationMs:700})}let l=i.match(/:(?:orbit|rotate-camera|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)/i);if(l){let e=parseFloat(l[1]),n=parseFloat(l[2]);!isNaN(e)&&!isNaN(n)&&t.push({type:`ROTATE_CAMERA`,theta:e,phi:n,durationMs:700})}let u=i.match(/:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);if(u){let e=W(u[2]||u[3]||u[4]),n=parseFloat(u[5]),r=parseFloat(u[6]),i=parseFloat(u[7]);e&&!isNaN(n)&&!isNaN(r)&&!isNaN(i)&&t.push({type:`NUDGE`,target:e,dxyz:[n,r,i],durationMs:600})}let d=i.match(/:probe-move\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:xyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);if(d){let e=W(d[2]||d[3]||d[4]),n=parseFloat(d[5]),r=parseFloat(d[6]),i=parseFloat(d[7]);e&&!isNaN(n)&&!isNaN(r)&&!isNaN(i)&&t.push({type:`PROBE_MOVE`,target:e,xyz:[n,r,i],durationMs:600})}let f=i.match(/:var\s+("?([a-zA-Z0-9_]+)"?)\s+([0-9.-]+|"[^"]+"|'[^']+')/i);if(f){let e=f[2],n=f[3].replace(/^['"]|['"]$/g,``),r=parseFloat(n),i=isNaN(r)?n:r;t.push({type:`SET_VARIABLE`,variable:e,value:i})}let p=i.match(/:step\s+([0-9]+)/i);p&&t.push({type:`STEP`,stepIndex:parseInt(p[1],10)}),/:reset/i.test(i)&&t.push({type:`RESET_VIEW`});let m=i.match(/:(say|narrate)\s+("([^"]*)"|'([^']*)')/i);if(m){let e=(m[3]===void 0?m[4]||``:m[3]).trim();e&&(n||=e,t.push({type:`NARRATE`,text:e}))}}let o=e.match(/\(:(?:rotate-camera|orbit|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)\)/i);if(o){let e=parseFloat(o[1]),n=parseFloat(o[2]);!isNaN(e)&&!isNaN(n)&&(t.push({type:`ROTATE_CAMERA`,theta:e,phi:n,durationMs:700}),r.push(o[0]))}let s=e.match(/\(:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]\)/i);if(s){let e=W(s[2]||s[3]||s[4]),n=parseFloat(s[5]),i=parseFloat(s[6]),a=parseFloat(s[7]);e&&!isNaN(n)&&!isNaN(i)&&!isNaN(a)&&(t.push({type:`NUDGE`,target:e,dxyz:[n,i,a],durationMs:600}),r.push(s[0]))}if(n||(n=e.replace(/\(:[a-z\-]+\s+[^)]+\)/gi,``).replace(/```[a-z]*|```/gi,``).trim()||`Let us observe the visual demonstration on the simulation stage.`,t.length>0&&t.push({type:`NARRATE`,text:n})),t.length===0){let i=e.toLowerCase();if(i.includes(`orbit`)||i.includes(`camera`)||i.includes(`angle`)||i.includes(`rotate`))t.push({type:`ROTATE_CAMERA`,theta:25,phi:-10,durationMs:700}),t.push({type:`NARRATE`,text:n}),r.push(`(:act :orbit :theta 25.0 :phi -10.0 :say "${n.slice(0,60)}")`);else if(i.includes(`nudge`)||i.includes(`probe`)||i.includes(`core`))t.push({type:`NUDGE`,target:`#coil-core`,dxyz:[0,5,0],durationMs:600}),t.push({type:`NARRATE`,text:n}),r.push(`(:act :nudge :target "#coil-core" :dxyz [0.0 5.0 0.0] :say "${n.slice(0,60)}")`);else{let e=i.includes(`finish`)||i.includes(`result`)||i.includes(`conclu`)?.9:.5;t.push({type:`SEEK`,targetProgress:e,durationMs:800}),t.push({type:`NARRATE`,text:n}),r.push(`(:act :seek ${e} :say "${n.slice(0,80).replace(/"/g,`'`)}...")`)}}return{actions:t,sayText:n,rawSExpr:r.join(`
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
3. Incorporate proprioceptive ray-hit coordinates when asked about what is being looked at.`,u=`Pupil asks: "${t.trim()}". Spatial token: ${c}. Show and actuate on the simulation stage.`,d=ie(await U.promptText({prompt:u,systemPrompt:l,timeoutMs:16e3,responseConstraint:ae,omitResponseConstraintInput:!0}));return{type:`AI_VISUAL_COMMAND`,transactionId:`nano_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,actions:d.actions,pedagogicalIntent:`STEP_BY_STEP_DEMO`,rawSExpr:d.rawSExpr,sayText:d.sayText}}function G(e){switch(e){case`kinetic-gas`:return[`Why does temperature increase particle velocity?`,`What happens to pressure if I compress the volume?`,`Explain Boyle’s Law (P1V1 = P2V2) simply`];case`calculus-curves`:return[`What does dy/dx represent geometrically at this point?`,`Why is the tangent slope zero at the curve peak?`,`How does the integral calculate the area under the curve?`];case`math-fishing`:return[`What is the best mental strategy for Number Bonds to 100?`,`How do factor pairs multiply to 36 and 48?`,`Explain adding negative integers like -4 + 10`];case`electric-circuits`:return[`Explain Ohm's Law: V = I × R with this circuit`,`What object is my ray hitting right now?`,`Nudge the #coil-core into the magnetic field`,`Why do electrons drift slower when resistance increases?`];case`fractions`:return[`Why must we find a common denominator before adding?`,`What does the numerator vs denominator represent geometrically?`,`How do equivalent fractions preserve identical area?`];case`spelling-bee`:return[`What is the etymology and Latin origin of this statutory spelling?`,`Explain the phonics rule for words ending in -cious vs -tious`,`Give me a mnemonic to remember the spelling of accommodation and embarrass`];case`atom`:return[`How does the Bohr electron shell formula 2n² determine orbital capacities?`,`Why does increasing atomic number (Z) change an element’s chemical family?`,`Explain the difference between atomic number and mass number`];case`times-tables`:return[`Explain how the distributive property 7×8 = (7×5)+(7×3) simplifies mental arithmetic`,`Why does rotating a 2D array by 90° prove the commutative law a×b = b×a?`,`What patterns emerge on the 100-square when skip counting by 9s?`];case`solar-system`:return[`Why do outer planets like Neptune take vastly longer to orbit than Mercury?`,`Explain Kepler’s 3rd Law of planetary motion simply`,`What are the key planetary differences between gas giants and rocky planets?`];default:return[`Explain the physics and math principles shown in this lab`,`What happens if I change the key variables?`,`Give me a challenging question to test my understanding`]}}function se(e){if(!e.isOpen)return null;let{onClose:t,preset:n,postToPlayer:r,currentProgress:i=0,activeKeyframe:a,latestTelemetry:o,isAiDemonstrating:s=!1,onCancelDemonstration:c}=e,l=`copilot`,u=B(),d=U.getActiveEngineType(),f=!1,p=``,m=``,h=``,g=null,_=``,v=null,y=[{sender:`nano`,text:`Hello! I am your on-device Gemini Nano tutor for this vector lab. Ask me anything, or click "✨ Show Me How" to watch me physically demonstrate on the simulation stage!`}];r({type:`GET_CONTEXT_SNAPSHOT`});let b=document.createElement(`div`);b.className=`ast-nano-ai-tutor-drawer`,b.style.cssText=`
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
      `;let a=document.createElement(`div`);a.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`;let l=document.createElement(`button`);l.type=`button`,l.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,l.textContent=`🔭 Orbit View (Δθ:+20°, Δϕ:-10°)`,l.onclick=()=>{r({type:`ACTUATE_OPCODE`,opcode:`(:rotate-camera :theta 20.0 :phi -10.0 :relative true)`})};let u=document.createElement(`button`);u.type=`button`,u.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;`,u.textContent=`⚡ Nudge Core/Probe ([0, 5, 0])`,u.onclick=()=>{let e=o?.spatialTelemetry?.hit?.target||`#coil-core`;r({type:`ACTUATE_OPCODE`,opcode:`(:nudge :target "${e}" :dxyz [0.0 5.0 0.0])`})};let d=document.createElement(`button`);d.type=`button`,d.style.cssText=`padding: 3px 8px; border-radius: 6px; background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); font-size: 0.68rem; font-weight: 700; cursor: pointer;`,d.textContent=`🎯 Cast Ray`,d.onclick=()=>{r({type:`CAST_CAMERA_RAY`})},a.appendChild(l),a.appendChild(u),a.appendChild(d),i.appendChild(a),t.appendChild(i);let m=document.createElement(`div`);m.style.cssText=`background: #090d16; padding: 6px 10px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 0.74rem; color: #4ade80; display: flex; flex-direction: column; gap: 4px; user-select: all;`,m.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #94a3b8; font-size: 0.68rem;">RAY INTERSECTION TOKEN:</span>
          <span style="color: #38bdf8; font-size: 0.68rem;">Analytic Ray-Math (Zero GPU Drivers)</span>
        </div>
        <div style="font-weight: 700; overflow-x: auto; white-space: nowrap;">
          ${o?.spatialTelemetry?.rayHitSExpr||`(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])`}
        </div>
        ${o?.spatialTelemetry?.cameraStateSExpr?`
          <div style="color: #38bdf8; font-size: 0.70rem; overflow-x: auto; white-space: nowrap;">
            ${o.spatialTelemetry.cameraStateSExpr}
          </div>
        `:``}
      `,t.appendChild(m),e.appendChild(t);let h=G(n),g=document.createElement(`div`);g.style.cssText=`display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;`,g.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center; white-space: nowrap;">Suggested:</span>`,h.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`
          white-space: nowrap;
          padding: 4px 10px;
          border-radius: 9999px;
          background: #1e293b;
          color: #bae6fd;
          border: 1px solid #334155;
          font-size: 0.72rem;
          cursor: ${f?`not-allowed`:`pointer`};
        `,t.textContent=e,t.disabled=f,t.onclick=()=>S(e,!0),g.appendChild(t)}),e.appendChild(g);let _=document.createElement(`div`);if(_.style.cssText=`background: #0f172a; border-radius: 10px; border: 1px solid #1e293b; padding: 12px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;`,y.forEach(e=>{let t=document.createElement(`div`);t.style.cssText=`
          align-self: ${e.sender===`user`?`flex-end`:`flex-start`};
          max-width: 88%;
          background: ${e.sender===`user`?`#0284c7`:`#1e293b`};
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          line-height: 1.4;
        `;let n=document.createElement(`div`);n.style.cssText=`font-weight: 800; font-size: 0.68rem; margin-bottom: 2px; color: ${e.sender===`user`?`#bae6fd`:`#38bdf8`};`,n.textContent=e.sender===`user`?`You`:`✨ Gemini Nano Co-Pilot`,t.appendChild(n);let i=document.createElement(`div`);if(i.textContent=e.text,t.appendChild(i),e.rawSExpr){let n=document.createElement(`div`);n.style.cssText=`margin-top: 6px; padding: 6px 10px; background: #090d16; border-radius: 6px; border: 1px solid #334155; font-family: monospace; font-size: 0.72rem; color: #38bdf8; overflow-x: auto;`;let i=document.createElement(`div`);if(i.style.cssText=`display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;`,i.innerHTML=`<span style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">⚡ ACTION TUPLE:</span>`,e.packet){let t=document.createElement(`button`);t.type=`button`,t.style.cssText=`padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; background: #0284c7; color: #fff; border: none; cursor: pointer;`,t.textContent=`▶ Replay Demo`,t.onclick=()=>r({type:`AI_VISUAL_COMMAND`,packet:e.packet}),i.appendChild(t)}n.appendChild(i);let a=document.createElement(`code`);a.textContent=e.rawSExpr,n.appendChild(a),t.appendChild(n)}if(e.action){let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`margin-top: 6px; padding: 4px 8px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.7rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;`,n.innerHTML=`<span>⚡ Apply to Stage: ${e.action.name} = ${e.action.val}</span>`,n.onclick=()=>{r({type:`SET_VAR`,name:e.action.name,value:e.action.val}),y.push({sender:`nano`,text:`Applied live parameter to stage: ${e.action.name} = ${e.action.val}`}),x()},t.appendChild(n)}_.appendChild(t)}),f){let e=document.createElement(`div`);e.style.cssText=`align-self: flex-start; color: #38bdf8; font-size: 0.75rem; font-style: italic;`,e.textContent=`✨ Nano is synthesizing action tuples on-device...`,_.appendChild(e)}e.appendChild(_);let v=document.createElement(`div`);v.style.cssText=`display: flex; gap: 8px;`;let C=document.createElement(`input`);C.type=`text`,C.value=p,C.placeholder=`Ask Nano about ${n} (e.g. why does this curve peak?)...`,C.disabled=f,C.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,C.oninput=e=>{p=e.target.value},C.onkeydown=e=>{e.key===`Enter`&&S(void 0,!0)};let w=document.createElement(`button`);w.type=`button`,w.style.cssText=`
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
      `,w.disabled=f,w.innerHTML=`<span>✨ Show Me How</span>`,w.onclick=()=>S(void 0,!0),v.appendChild(C),v.appendChild(w),e.appendChild(v),b.appendChild(e)}else if(l===`generator`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`display: flex; gap: 6px; flex-wrap: wrap;`,t.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; align-self: center;">Templates:</span>`,[`Pulley with Mechanical Advantage 2`,`Pendulum Energy Conservation`,`Bohr Carbon Atom (6 Protons)`,`Pythagoras 3-4-5 Triangle`].forEach(e=>{let n=document.createElement(`button`);n.type=`button`,n.style.cssText=`padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #bae6fd; border: 1px solid #334155; font-size: 0.7rem; cursor: pointer;`,n.textContent=e,n.onclick=()=>{m=e,x()},t.appendChild(n)}),e.appendChild(t);let n=document.createElement(`div`);n.style.cssText=`display: flex; gap: 8px;`;let i=document.createElement(`input`);i.type=`text`,i.value=m,i.placeholder=`Describe an interactive vector simulation to synthesize (e.g. Archimedes buoyancy lever)...`,i.disabled=f,i.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;`,i.oninput=e=>{m=e.target.value};let a=document.createElement(`button`);if(a.type=`button`,a.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${f?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${f?`not-allowed`:`pointer`};
      `,a.textContent=f?`Synthesizing...`:`⚡ Generate AST`,a.disabled=f,a.onclick=C,n.appendChild(i),n.appendChild(a),e.appendChild(n),g){let t=document.createElement(`div`);t.style.cssText=`color: #f87171; font-size: 0.75rem;`,t.textContent=g,e.appendChild(t)}if(h){let t=document.createElement(`div`);t.style.cssText=`display: flex; flex-direction: column; gap: 6px;`;let n=document.createElement(`div`);n.style.cssText=`display: flex; justify-content: space-between; align-items: center;`,n.innerHTML=`<span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Synthesized AST S-Expression Specification:</span>`;let i=document.createElement(`div`);i.style.cssText=`display: flex; gap: 6px;`;let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;`,a.textContent=`⚡ Run in Vector Player`,a.onclick=()=>{r({type:`LOAD_AST`,ast:h}),r({type:`PLAY`})};let o=document.createElement(`button`);o.type=`button`,o.style.cssText=`padding: 4px 10px; border-radius: 6px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.72rem; cursor: pointer;`,o.textContent=`📋 Copy AST`,o.onclick=()=>navigator.clipboard.writeText(h),i.appendChild(a),i.appendChild(o),n.appendChild(i),t.appendChild(n);let s=document.createElement(`textarea`);s.rows=5,s.value=h,s.style.cssText=`background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; color: #38bdf8; font-family: monospace; font-size: 0.75rem; line-height: 1.4; resize: vertical;`,s.oninput=e=>{h=e.target.value},t.appendChild(s),e.appendChild(t)}b.appendChild(e)}else if(l===`grader`){let e=document.createElement(`div`);e.style.cssText=`display: flex; flex-direction: column; gap: 10px;`;let t=document.createElement(`div`);t.style.cssText=`background: #1e293b; padding: 10px 14px; border-radius: 8px; font-size: 0.8rem;`,t.innerHTML=`
        <span style="color: #38bdf8; font-weight: 800;">Active Checkpoint Context: </span>
        <span>${a?`"${a.title} — ${a.rule}"`:`Simulation progress: ${(i*100).toFixed(0)}% in ${n}`}</span>
      `,e.appendChild(t);let r=document.createElement(`div`);r.style.cssText=`display: flex; gap: 8px;`;let o=document.createElement(`textarea`);o.rows=2,o.value=_,o.placeholder=`Explain the mechanism in your own words (e.g. why does pressure rise, or what makes the bond sum to 100?)...`,o.style.cssText=`flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem; resize: none;`,o.oninput=e=>{_=e.target.value};let s=document.createElement(`button`);if(s.type=`button`,s.style.cssText=`
        padding: 8px 16px;
        border-radius: 8px;
        background: ${f?`#334155`:`#0284c7`};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${f?`not-allowed`:`pointer`};
      `,s.textContent=f?`Grading...`:`🎯 Evaluate`,s.disabled=f,s.onclick=w,r.appendChild(o),r.appendChild(s),e.appendChild(r),v){let t=document.createElement(`div`);t.style.cssText=`background: #0f172a; border: 1px solid #22c55e; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;`,t.innerHTML=`
          <div style="background: #22c55e; color: #000000; font-weight: 900; font-size: 1.1rem; padding: 6px 10px; border-radius: 8px; white-space: nowrap;">
            ⭐ ${v.score}/5
          </div>
          <div style="flex: 1; font-size: 0.8rem; color: #e2e8f0; white-space: pre-line;">
            ${v.feedback}
          </div>
        `,e.appendChild(t)}b.appendChild(e)}}async function S(e,t=!0){let a=(e||p).trim();if(a&&!f){u||=(re(!0),!0),y.push({sender:`user`,text:a}),p=``,f=!0,x();try{let e=await oe(o||{sceneId:n,progress:i,activeKeyframe:0,variables:{},lastUserAction:`QUESTION`,timestamp:Date.now()},a,{targetScene:n});t&&e.actions&&e.actions.length>0&&r({type:`AI_VISUAL_COMMAND`,packet:e}),y.push({sender:`nano`,text:e.sayText||`Observe the visual demonstration on the simulation stage.`,packet:e,rawSExpr:e.rawSExpr})}catch(e){console.warn(`[NanoAiTutorDrawer] Co-Pilot inference notice:`,e),y.push({sender:`nano`,text:`[Offline Local Response] In this ${n} simulation, adjustments to the input variables directly update the SVG equations and animated vector properties. Notice how the keyframe timeline coordinates with the visual state.`})}finally{f=!1,x()}}}async function C(){if(m.trim()&&!f){u||=(re(!0),!0),f=!0,g=null,x();try{h=(await U.promptText({prompt:`Generate an AST interactive lab for: "${m}"`,systemPrompt:`You are an expert compiler for the St Joseph's AST Vector Player specification.
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
)`}finally{f=!1,x()}}}async function w(){if(_.trim()&&!f){u||=(re(!0),!0),f=!0,x();try{let e=`You are a UK National Curriculum formative assessment specialist.
Current Assessment: ${a?`Topic: "${a.title}" Rule: "${a.rule}"`:`Simulation: ${n}`}.
Evaluate student answer: "${_}".
Format:
Score: [1 to 5]/5
Feedback: 2 sentences identifying conceptual strengths and one area for mastery polish.`,t=await U.promptText({prompt:_,systemPrompt:e,temperature:.2,timeoutMs:15e3}),r=t.match(/(\d)\s*\/\s*5/);v={feedback:t,score:r?parseInt(r[1],10):4}}catch{v={feedback:`Score: 4/5\nFeedback: Great reasoning! You demonstrated understanding of the active ${n} mechanism. Continue exploring how parameter variables shift the keyframe curve.`,score:4}}finally{f=!1,x()}}}return x(),b}var ce=class{transform;constructor(e={}){this.transform={minX:e.minX??-6,maxX:e.maxX??6,minY:e.minY??-4,maxY:e.maxY??8,svgWidth:e.svgWidth??600,svgHeight:e.svgHeight??380}}mathToSvg(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:(e-n)/(r-n)*o,y:s-(t-i)/(a-i)*s}}svgToMath(e,t){let{minX:n,maxX:r,minY:i,maxY:a,svgWidth:o,svgHeight:s}=this.transform;return{x:n+e/o*(r-n),y:i+(s-t)/s*(a-i)}}generateCurvePath(e,t=240){let{minX:n,maxX:r,minY:i,maxY:a}=this.transform,o=(r-n)/t,s=``,c=!1;for(let r=0;r<=t;r++){let t=n+r*o,l;try{l=e(t)}catch{c=!1;continue}if(isNaN(l)||!isFinite(l)||l<i-10||l>a+10){c=!1;continue}let u=this.mathToSvg(t,l);c?s+=`L ${u.x.toFixed(1)} ${u.y.toFixed(1)} `:(s+=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `,c=!0)}return s.trim()}calculateTangent(e,t,n=3.5){let r=1e-4,i=e(t),a=(e(t+r)-e(t-r))/(2*r),o=Math.atan(a),s=o*180/Math.PI,c=this.mathToSvg(t,i),l=n/2,u=Math.cos(o),d=Math.sin(o),f=t-l*u,p=i-l*d,m=t+l*u,h=i+l*d,g=this.mathToSvg(f,p),_=this.mathToSvg(m,h),v=`M ${g.x.toFixed(1)} ${g.y.toFixed(1)} L ${_.x.toFixed(1)} ${_.y.toFixed(1)}`,y=l*.65,b=t-y*-d,x=i-y*u,S=t+y*-d,C=i+y*u,w=this.mathToSvg(b,x),T=this.mathToSvg(S,C),E=`M ${w.x.toFixed(1)} ${w.y.toFixed(1)} L ${T.x.toFixed(1)} ${T.y.toFixed(1)}`,D=a*1,O=this.mathToSvg(t+1,i),k=this.mathToSvg(t+1,i+D),A=`M ${c.x.toFixed(1)} ${c.y.toFixed(1)} L ${O.x.toFixed(1)} ${O.y.toFixed(1)} L ${k.x.toFixed(1)} ${k.y.toFixed(1)}`,j=`dy/dx = ${a>=0?`+`:``}${a.toFixed(2)}`;return{x0:t,y0:i,svgX:c.x,svgY:c.y,slope:a,angleDeg:s,tangentPath:v,normalPath:E,riseRunTriangle:A,formula:j}}calculateDefiniteIntegral(e,t,n,r=60){let i=Math.min(t,n),a=Math.max(t,n),o=Math.max(10,r%2==0?r:r+1),s=(a-i)/o,c=e(i)+e(a);for(let t=1;t<o;t++){let n=i+t*s;c+=(t%2==1?4:2)*e(n)}let l=s/3*c,u=this.mathToSvg(i,0),d=`M ${u.x.toFixed(1)} ${u.y.toFixed(1)} `;for(let t=0;t<=o;t++){let n=i+t*s,r=e(n),a=this.mathToSvg(n,r);d+=`L ${a.x.toFixed(1)} ${a.y.toFixed(1)} `}let f=this.mathToSvg(a,0);return d+=`L ${f.x.toFixed(1)} ${f.y.toFixed(1)} Z`,{a:i,b:a,area:Number(l.toFixed(3)),shadedAreaPath:d,subdivisions:o}}generateGrid(e=1){let{minX:t,maxX:n,minY:r,maxY:i}=this.transform,a=``,o=[],s=Math.ceil(t/e)*e;for(let t=s;t<=n;t+=e){if(Math.abs(t)<.001)continue;let e=this.mathToSvg(t,i),n=this.mathToSvg(t,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${n.x.toFixed(1)} ${n.y.toFixed(1)} `;let s=this.mathToSvg(t,0);o.push({x:s.x,y:s.y+14,text:t.toString()})}let c=Math.ceil(r/e)*e;for(let r=c;r<=i;r+=e){if(Math.abs(r)<.001)continue;let e=this.mathToSvg(t,r),i=this.mathToSvg(n,r);a+=`M ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${i.x.toFixed(1)} ${i.y.toFixed(1)} `;let s=this.mathToSvg(0,r);o.push({x:s.x-12,y:s.y+4,text:r.toString()})}let l=this.mathToSvg(t,0),u=this.mathToSvg(n,0),d=this.mathToSvg(0,r),f=this.mathToSvg(0,i),p=`M ${l.x.toFixed(1)} ${l.y.toFixed(1)} L ${u.x.toFixed(1)} ${u.y.toFixed(1)} M ${d.x.toFixed(1)} ${d.y.toFixed(1)} L ${f.x.toFixed(1)} ${f.y.toFixed(1)}`;return{gridPaths:a.trim(),axesPaths:p,labels:o}}},le=[{id:`parabola`,name:`Quadratic Parabola`,category:`Polynomials (GCSE/A-Level)`,latex:`f(x) = x^2 - 2x - 1`,fn:e=>e*e-2*e-1,derivativeStr:`f'(x) = 2x - 2`,defaultX0:2,defaultA:0,defaultB:3},{id:`cubic`,name:`Cubic Curve (Stationary Points)`,category:`Polynomials (A-Level)`,latex:`f(x) = \\frac{1}{3}x^3 - x + 1`,fn:e=>1/3*e**3-e+1,derivativeStr:`f'(x) = x^2 - 1`,defaultX0:1,defaultA:-2,defaultB:2},{id:`sine`,name:`Harmonic Sine Wave`,category:`Trigonometry (GCSE/A-Level)`,latex:`f(x) = 2\\sin(x) + 1`,fn:e=>2*Math.sin(e)+1,derivativeStr:`f'(x) = 2\\cos(x)`,defaultX0:1.57,defaultA:0,defaultB:3.14},{id:`exponential`,name:`Exponential Growth & Rate`,category:`Calculus Foundations`,latex:`f(x) = e^{0.4x}`,fn:e=>Math.exp(.4*e),derivativeStr:`f'(x) = 0.4 e^{0.4x}`,defaultX0:1.5,defaultA:0,defaultB:4},{id:`gaussian`,name:`Gaussian Normal Bell Curve`,category:`Statistics & Area`,latex:`f(x) = 3 e^{-x^2 / 2}`,fn:e=>3*Math.exp(-(e*e)/2),derivativeStr:`f'(x) = -3x e^{-x^2 / 2}`,defaultX0:1,defaultA:-1.96,defaultB:1.96}];function ue(e){if(!e.isOpen)return null;let{onClose:t,preset:n}=e,r=3,i=4,a=2,o=3,s=4,c=75,l=420,u=80,d=6,f=7,p=12,m=4,h=1.2,g=9.81,_=25,v=.5,y=300,b=1,x=`gas`,S=`parabola`,C=2,w=0,T=3,E=n===`calculus-curves`?`calculus`:n===`kinetic-gas`?`kinetic-gas`:`preset`,D=(e,t)=>{typeof window<`u`&&document.querySelectorAll(`iframe`).forEach(n=>{try{n.contentWindow?.postMessage({type:`SET_VAR`,name:e,value:t},`*`)}catch{}})},O=document.createElement(`div`);O.className=`ast-interactive-lab-drawer`,O.style.cssText=`
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
      `,e.appendChild(t);let n=document.createElement(`div`);n.style.cssText=`margin-bottom: 14px;`,n.innerHTML=`<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Function Curve Presets:</div>`;let r=document.createElement(`div`);r.style.cssText=`display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;`,le.forEach(e=>{let t=document.createElement(`button`);t.type=`button`;let n=S===e.id;t.style.cssText=`
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
      `,o.appendChild(c);let l=document.createElement(`input`);l.type=`range`,l.min=String(w+.1),l.max=`4.0`,l.step=`0.1`,l.value=String(T),l.style.cssText=`width: 100%; accent-color: #22c55e;`,l.oninput=e=>{T=Number(e.target.value),D(`calcB`,T),k()},o.appendChild(l),e.appendChild(o);let u=le.find(e=>e.id===S)||le[0],d=new ce,f=d.calculateTangent(u.fn,C),p=f.y0,m=f.slope,h=d.calculateDefiniteIntegral(u.fn,w,T).area,g=document.createElement(`div`);g.style.cssText=`background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;`,g.innerHTML=`
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
        `;M.appendChild(e)}O.appendChild(M);let N=document.createElement(`div`);N.style.cssText=`padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.12); font-size: 0.72rem; color: #64748b; text-align: center;`,N.textContent=`⚡ 100% Client-Side Invariant Calculator • Zero Server Latency`,O.appendChild(N)}return k(),O}function de(e,t={}){let n=!1,r=`#f59e0b`,i=4,a=!1,o=[],s=document.createElement(`div`);s.id=`ast-vanilla-chalkboard-overlay`,s.style.cssText=`
    position: absolute;
    inset: 0;
    z-index: 50;
    pointer-events: none;
  `;let c=document.createElement(`canvas`);c.style.cssText=`
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
    pointer-events: auto;
    touch-action: none;
  `,s.appendChild(c);let l=c.getContext(`2d`,{willReadFrequently:!0}),u=()=>{c.style.cursor=a?`crosshair`:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><circle cx='8' cy='8' r='4' fill='white' stroke='black'/></svg>") 8 8, crosshair`};u();let d=()=>{let t=e.getBoundingClientRect();if(t.width>0&&t.height>0){let e=null;if(l&&c.width>0&&c.height>0)try{e=l.getImageData(0,0,c.width,c.height)}catch{}if(c.width=t.width,c.height=t.height,l&&e)try{l.putImageData(e,0,0)}catch{}}};d(),window.addEventListener(`resize`,d);let f=()=>{if(l)try{let e=l.getImageData(0,0,c.width,c.height);o.push(e),o.length>10&&o.shift(),N()}catch{}},p=e=>{let t=c.getBoundingClientRect(),n=`touches`in e&&e.touches.length>0?e.touches[0].clientX:e.clientX,r=`touches`in e&&e.touches.length>0?e.touches[0].clientY:e.clientY;return{x:n-t.left,y:r-t.top}},m=e=>{if(!l)return;f(),n=!0;let{x:t,y:o}=p(e);l.beginPath(),l.moveTo(t,o),l.strokeStyle=r,l.lineWidth=a?18:i,l.lineCap=`round`,l.lineJoin=`round`,l.globalAlpha=a?.35:1},h=e=>{if(!n||!l)return;let{x:t,y:r}=p(e);l.lineTo(t,r),l.stroke()},g=()=>{n&&(n=!1,l&&l.closePath())};c.addEventListener(`mousedown`,m),c.addEventListener(`mousemove`,h),c.addEventListener(`mouseup`,g),c.addEventListener(`mouseleave`,g),c.addEventListener(`touchstart`,m,{passive:!0}),c.addEventListener(`touchmove`,h,{passive:!0}),c.addEventListener(`touchend`,g);let _=()=>{l&&(f(),l.clearRect(0,0,c.width,c.height))},v=()=>{if(!l||o.length===0)return;let e=o.pop();e&&l.putImageData(e,0,0),N()},y=()=>{let e=document.createElement(`a`);e.download=`ast-slide-annotation-${Date.now()}.png`,e.href=c.toDataURL(`image/png`),e.click(),t.onSave&&t.onSave(e.href)},b=document.createElement(`div`);b.style.cssText=`
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    borderRadius: 30px;
    padding: 6px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
    z-index: 60;
    flex-wrap: wrap;
    max-width: 96%;
    user-select: none;
  `;let x=document.createElement(`span`);x.style.cssText=`font-size: 0.8rem; font-weight: 800; color: #f8fafc; display: flex; align-items: center; gap: 4px;`,x.innerHTML=`<span>✏️</span> Chalkboard`,b.appendChild(x);let S=()=>{let e=document.createElement(`div`);e.style.cssText=`width: 1px; height: 18px; background: rgba(255,255,255,0.2);`,b.appendChild(e)};S();let C=[{label:`Amber Gold`,val:`#f59e0b`},{label:`Crimson Red`,val:`#ef4444`},{label:`Emerald Green`,val:`#22c55e`},{label:`Cyan Blue`,val:`#38bdf8`},{label:`Pure White`,val:`#ffffff`}],w=[],T=()=>{w.forEach((e,t)=>{let n=C[t].val,i=r===n&&!a;e.style.border=i?`2px solid #ffffff`:`1px solid rgba(0,0,0,0.3)`,e.style.boxShadow=i?`0 0 8px ${n}`:`none`,e.style.transform=i?`scale(1.15)`:`scale(1)`})};C.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.title=e.label,t.style.cssText=`
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${e.val};
      cursor: pointer;
      padding: 0;
      transition: transform 0.15s ease;
    `,t.onclick=()=>{r=e.val,a=!1,T(),D(),u()},w.push(t),b.appendChild(t)}),T(),S();let E=document.createElement(`button`);E.type=`button`,E.title=`Semi-transparent broad highlighter`,E.innerHTML=`🖍️ Highlighter`;let D=()=>{E.style.cssText=`
      background: ${a?`#facc15`:`rgba(255,255,255,0.1)`};
      color: ${a?`#1e1b4b`:`#f8fafc`};
      border: none;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
    `};D(),E.onclick=()=>{a=!a,D(),T(),u()},b.appendChild(E);let O=document.createElement(`div`);O.style.cssText=`display: flex; gap: 3px;`;let k=[{size:2,label:`Fine`},{size:4,label:`Med`},{size:8,label:`Thick`}],A=[],j=()=>{A.forEach((e,t)=>{let n=k[t].size;e.style.background=i===n?`rgba(255,255,255,0.25)`:`none`})};k.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.textContent=e.label,t.style.cssText=`
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 2px 5px;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
    `,t.onclick=()=>{i=e.size,a=!1,j(),D()},A.push(t),O.appendChild(t)}),j(),b.appendChild(O),S();let M=document.createElement(`button`);M.type=`button`,M.title=`Undo last stroke`,M.textContent=`↩ Undo`;let N=()=>{let e=o.length>0;M.style.cssText=`
      background: none;
      color: ${e?`#cbd5e1`:`#64748b`};
      border: none;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: ${e?`pointer`:`default`};
    `};N(),M.onclick=v,b.appendChild(M);let P=document.createElement(`button`);P.type=`button`,P.title=`Clear all annotations`,P.textContent=`🧽 Clear`,P.style.cssText=`
    background: none;
    color: #f87171;
    border: none;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
  `,P.onclick=_,b.appendChild(P);let F=document.createElement(`button`);F.type=`button`,F.title=`Download snapshot of drawing`,F.textContent=`📸 Snapshot`,F.style.cssText=`
    background: rgba(59, 130, 246, 0.25);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.4);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
  `,F.onclick=y,b.appendChild(F);let I=document.createElement(`button`);I.type=`button`,I.title=`Close Chalkboard`,I.textContent=`✕`,I.style.cssText=`
    background: #ef4444;
    color: #ffffff;
    border: none;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    cursor: pointer;
    margin-left: 4px;
  `,I.onclick=()=>{t.onClose&&t.onClose(),L()},b.appendChild(I),s.appendChild(b),e.appendChild(s);let L=()=>{window.removeEventListener(`resize`,d),s.parentNode&&s.parentNode.removeChild(s)};return{element:s,canvas:c,destroy:L,clear:_,undo:v,downloadSnapshot:y,setColor:e=>{r=e,a=!1,T(),D(),u()},setBrushSize:e=>{i=e,j()},setIsHighlighter:e=>{a=e,D(),T(),u()}}}function fe(e,t){let n=`<!DOCTYPE html>
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
</html>`,r=new Blob([n],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`stj-offline-ast-lesson-${e}.html`,a.click(),URL.revokeObjectURL(i)}var pe=`kinetic-gas`,me=new Set(a.map(e=>e.id));function K(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function he(e){if(!e)return pe;if(me.has(e))return e;try{if(u().some(t=>t.id===e))return e}catch{}return pe}function ge(e,t,n){return`${e}player.html?${new URLSearchParams({preset:t,bsl:n?`1`:`0`}).toString()}`}function q(){let r=s(),o=document.createElement(`div`);o.className=`ast-media-player-container`,o.style.cssText=`max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem;`;let m=new URLSearchParams(window.location.search),h=he(m.get(`preset`)),g=`All`,_=``,v=n()||m.get(`bsl`)===`1`,y=Array.isArray(a)&&a.length>0?a:[{id:`kinetic-gas`,label:`Kinetic Gas Theory & Thermodynamics`,type:`Sim`,stage:`KS3/KS4 PHYSICS`},{id:`pythagoras`,label:`Pythagoras' Theorem (a² + b² = c²)`,type:`Sim`,stage:`KS3/KS4 MATHEMATICS`},{id:`fractions`,label:`Fractions: Why Common Denominators Rule`,type:`Slide`,stage:`KEY STAGE 2`},{id:`electric-circuits`,label:`Electrical Circuits & Ohm’s Law`,type:`Sim`,stage:`KEY STAGE 3`},{id:`solar-system`,label:`Solar System: Heliocentric Planetary Motion`,type:`Sim`,stage:`KEY STAGE 2/3`},{id:`algebra-balance`,label:`Algebraic Balance Scale`,type:`Sim`,stage:`KEY STAGE 3`},{id:`church-tour`,label:`The Catholic Church Sanctuary & Altar`,type:`Slide`,stage:`WHOLE SCHOOL RE`},{id:`phonics-lab`,label:`EYFS Phonics Sound Mat & Digraphs`,type:`App`,stage:`EYFS / KS1`}];function b(e){return e.stage===`CATHOLIC LIFE`||e.subject===`Religious Education`||e.section&&e.section.includes(`Catholic`)||[`church-tour`,`altar-anatomy`,`holy-oils`,`holy-water-thurifer`,`latin-mass-prayers`,`catholic-rites`,`order-of-the-mass`,`stations-of-the-cross`,`first-communion`,`liturgical-calendar`,`liturgical-postures`,`liturgy-of-the-hours`,`triduum-easter`].includes(e.id)}function x(e){return!b(e)&&(e.subject===`Science`||e.stage&&e.stage.includes(`PHYSICS`)||[`kinetic-gas`,`electric-circuits`,`solar-system`,`photosynthesis`,`atom`,`velocity`,`dna-helix`].includes(e.id))}function S(e){return!b(e)&&(e.subject===`Mathematics`||[`pythagoras`,`fractions`,`algebra-balance`,`calculus-curves`,`bodmas`,`times-tables`].includes(e.id))}function w(e){return!b(e)&&!x(e)&&!S(e)}function D(){try{return u().filter(e=>!me.has(e.id))}catch{return[]}}function O(e){let t=y.find(t=>t.id===e);if(t)return t;try{let t=u().find(t=>t.id===e);if(t)return{id:t.id,label:t.title,stage:t.stage||`LOCAL VAULT`,type:t.type||`Sim`,subject:t.subject||`Custom Ingestion`}}catch{}return y[0]}let k=y.filter(b),j=y.filter(x),M=y.filter(S),N=y.filter(w);function P(e){let t=D();return`
      ${t.length>0?`
      <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
        ${t.map(t=>`<option value="${K(t.id)}" ${t.id===e?`selected`:``}>${K(t.title)} (${K(t.stage||`LOCAL`)})</option>`).join(``)}
      </optgroup>
    `:``}
      <optgroup label="✝️ Catholic Sanctuary &amp; Liturgy" style="background:#0f172a; color:#fde047;">
        ${k.map(t=>`<option value="${K(t.id)}" ${t.id===e?`selected`:``}>${K(t.label)} (${K(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="🔬 STEM &amp; Natural Sciences" style="background:#0f172a; color:#38bdf8;">
        ${j.map(t=>`<option value="${K(t.id)}" ${t.id===e?`selected`:``}>${K(t.label)} (${K(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="📐 Mathematics &amp; Logic" style="background:#0f172a; color:#34d399;">
        ${M.map(t=>`<option value="${K(t.id)}" ${t.id===e?`selected`:``}>${K(t.label)} (${K(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="🔤 EYFS, Languages &amp; Computing" style="background:#0f172a; color:#fbbf24;">
        ${N.map(t=>`<option value="${K(t.id)}" ${t.id===e?`selected`:``}>${K(t.label)} (${K(t.stage)})</option>`).join(``)}
      </optgroup>
      <optgroup label="⚡ Dynamic Auto-Finder" style="background:#0f172a; color:#38bdf8;">
        <option value="__custom_find__">🔍 Open Any Scene by Name / ID...</option>
        <option value="__open_local__">📂 Open Local .ast or .svg File...</option>
      </optgroup>
    `}let F=P(h),I=O(h);o.innerHTML=`
    <!-- Top Breadcrumbs -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:8px;">
        <a href="${r}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎬 AST Vector Player &amp; Simulator</span>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <a href="${r}catholic-life" style="padding:6px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; font-size:0.8rem; font-weight:600; text-decoration:none;">
          ⛪ Catholic Sanctuary
        </a>
        <a href="${r}practice-lab" style="padding:6px 12px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; font-size:0.8rem; font-weight:600; text-decoration:none;">
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
                ${I.stage}
              </span>
              <span id="player-active-type-badge" style="font-size:0.68rem; font-weight:800; padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-family:monospace;">
                ${I.type||`Sim`}
              </span>
              <span style="color:#94a3b8; font-size:0.75rem;">&bull; Lumina AST Vector Engine</span>
            </div>
            <h2 id="player-active-title" style="font-size:1.15rem; font-weight:800; color:#f8fafc; margin:2px 0 0;">
              ${I.label}
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
              ${F}
            </select>
          </div>

          <!-- Open Local Cartridge Button -->
          <button type="button" id="player-btn-open" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" title="Open local .ast, .svg, .ast.svg, or PhET bundle">
            📂 Open...
          </button>
          <input type="file" id="media-player-file-input" accept=".ast,.svg,.json,.html,.phet" multiple style="display:none;" />

          <!-- Reset Button -->
          <button type="button" id="player-btn-reset" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f8fafc; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Reset Simulation">
            ↺ Reset
          </button>

          <!-- Parameters Lab Drawer Button -->
          <button type="button" id="player-btn-lab" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Interactive Parameter Sliders &amp; Physical Manipulatives">
            🎛️ Parameters
          </button>

          <!-- On-Device Gemini Nano AI Tutor Button -->
          <button type="button" id="player-btn-ai" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#c084fc; border:1px solid #9333ea; font-size:0.78rem; font-weight:700; cursor:pointer;" title="On-Device Gemini Nano AI Socratic Co-Pilot">
            🤖 AI Tutor
          </button>

          <!-- Curriculum Dev Studio & PhET Transpiler Drawer Button -->
          <button type="button" id="player-btn-studio" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Curriculum Dev Studio, PhET Bridge, Flash Lathe &amp; S-Expression Editor">
            💻 Studio
          </button>

          <!-- Smartboard Whiteboard Marker Toggle -->
          <button type="button" id="player-btn-pen" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#f59e0b; border:1px solid #d97706; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Toggle Smartboard Whiteboard Pen &amp; Annotation Layer">
            🖊️ Marker
          </button>

          <!-- LMS Embed Modal Button -->
          <button type="button" id="player-btn-embed" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#34d399; border:1px solid #059669; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Get Responsive LMS Embed Snippet (Canvas, Moodle, Google Classroom)">
            🚀 Embed
          </button>

          <!-- Display Settings Modal Button -->
          <button type="button" id="player-btn-settings" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#94a3b8; border:1px solid #475569; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Teaching Profiles &amp; Player Controls Settings">
            ⚙️ Settings
          </button>

          <!-- Single-File Air-Gapped HTML Export Button -->
          <button type="button" id="player-btn-export-airgap" style="padding:6px 12px; border-radius:8px; background:#1e293b; color:#fde047; border:1px solid #ca8a04; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Export Standalone Single-File HTML Lesson Capsule (< 45 KB)">
            📦 Airgap HTML
          </button>

          <!-- BSL Signing Toggle Button -->
          <button type="button" id="player-btn-bsl" style="padding:6px 14px; border-radius:8px; background:${v?`rgba(56, 189, 248, 0.16)`:`#1e293b`}; color:${v?`#38bdf8`:`#94a3b8`}; border:${v?`1.5px solid #38bdf8`:`1px solid #475569`}; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;" title="British Sign Language (BSL) In-Vision Interpreter (Shift + B)">
            <span>🖐️</span> BSL Signing: ${v?`ON`:`OFF`}
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
          src="${r}player.html?preset=${h}&bsl=${v?`1`:`0`}"
          style="width:100%; height:100%; border:none; display:block;"
          allow="autoplay; fullscreen"
          title="AST Interactive Vector Stage">
        </iframe>
      </div>
    </div>

    <!-- Catholic Sanctuary Linkage Banner -->
    <div id="catholic-sanctuary-banner" style="display:${b(I)?`flex`:`none`}; background:linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%); border:1.5px solid #ca8a04; border-radius:10px; padding:10px 16px; margin-bottom:1.5rem; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; color:#ffffff; box-shadow:0 4px 14px rgba(202,138,4,0.15);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">✝️</span>
        <div>
          <span style="font-size:0.86rem; color:#fde047; font-weight:800;">St Joseph's Catholic Sanctuary:</span>
          <span style="font-size:0.82rem; color:#cbd5e1; margin-left:4px;">This simulation is part of our Catholic faith formation and sacred liturgical curriculum.</span>
        </div>
      </div>
      <a href="${r}catholic-life?tab=altar-anatomy" style="padding:5px 12px; border-radius:6px; background:#ca8a04; color:#ffffff; text-decoration:none; font-weight:700; font-size:0.78rem;">
        Open High Altar &amp; Latin Chapel &rarr;
      </a>
    </div>

    <!-- Category Filter Tabs & Search -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="category-filter-buttons">
          ${[{id:`All`,label:`🌟 All (`+y.length+`)`},{id:`Catholic`,label:`✝️ Catholic Faith (`+k.length+`)`},{id:`STEM`,label:`🔬 STEM Sciences (`+j.length+`)`},{id:`Maths`,label:`📐 Mathematics (`+M.length+`)`},{id:`EYFS`,label:`🔤 EYFS & Languages (`+N.length+`)`}].map(e=>`
            <button type="button" class="cat-pill-btn" data-cat="${e.id}" style="padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${e.id===g?`#0284c7`:`#cbd5e1`}; background:${e.id===g?`#0284c7`:`#f8fafc`}; color:${e.id===g?`#ffffff`:`#475569`};">
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
        <a href="${r}news" style="padding:6px 12px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.78rem; font-weight:700; text-decoration:none;">Architecture Notes &rarr;</a>
      </div>
    </div>
  `;let L=o.querySelector(`#ast-player-iframe`),R=o.querySelector(`#player-sim-selector`),ee=o.querySelector(`#player-active-title`),te=o.querySelector(`#player-active-stage-badge`),ne=o.querySelector(`#player-active-type-badge`),z=o.querySelector(`#player-btn-bsl`),B=o.querySelector(`#player-btn-reset`),re=o.querySelector(`#player-btn-open`),V=o.querySelector(`#player-btn-lab`),H=o.querySelector(`#player-btn-ai`),U=o.querySelector(`#player-btn-studio`),W=o.querySelector(`#player-btn-pen`),ie=o.querySelector(`#player-btn-embed`),ae=o.querySelector(`#player-btn-settings`),oe=o.querySelector(`#player-btn-export-airgap`),G=o.querySelector(`#player-drawer-mount-point`),ce=o.querySelector(`#media-player-file-input`),le=o.querySelector(`#player-btn-fullscreen`),pe=o.querySelector(`#cartridge-search-input`),q=o.querySelector(`#cartridges-grid`),_e=o.querySelectorAll(`.cat-pill-btn`),ve=o.querySelector(`#player-iframe-wrapper`),J=null,Y=null,ye=`classroom`,be=!1,xe=C(`classroom`),Se=`phet`,Ce=null,we=``,Te=``,Ee=!1,De=null,Oe=!1,ke=null,Ae=!1;function X(){if(!G)return;if(!J){G.style.display=`none`,G.innerHTML=``,[V,H,U,ie,ae].forEach(e=>e?.classList.remove(`active`));return}G.style.display=`block`,G.innerHTML=``,[V,H,U,ie,ae].forEach(e=>e?.classList.remove(`active`));let e=null;if(J===`lab`)V?.classList.add(`active`),e=ue({isOpen:!0,onClose:()=>Z(`lab`),preset:h});else if(J===`ai`)H?.classList.add(`active`),e=se({isOpen:!0,onClose:()=>Z(`ai`),preset:h,postToPlayer:e=>L?.contentWindow?.postMessage(e,`*`)});else if(J===`studio`)U?.classList.add(`active`),e=A({isOpen:!0,onClose:()=>Z(`studio`),studioTab:Se,setStudioTab:e=>{Se=e,X()},inspectedElement:Ce,setInspectedElement:e=>{Ce=typeof e==`function`?e(Ce):e,X()},customSvgCode:we,setCustomSvgCode:e=>{we=e},customAstCode:Te,setCustomAstCode:e=>{Te=e},hotReloadFlash:Ee,setHotReloadFlash:e=>{Ee=e},postToPlayer:e=>L?.contentWindow?.postMessage(e,`*`),swfResult:De,setSwfResult:e=>{De=e,X()},isParsingSwf:Oe,setIsParsingSwf:e=>{Oe=e,X()},swfError:ke,setSwfError:e=>{ke=e,X()},swfDragActive:Ae,setSwfDragActive:e=>{Ae=e,X()}});else if(J===`embed`){ie?.classList.add(`active`);let t=e=>`<iframe src="${window.location.origin}${r}player.html?preset=${h}&mode=${e}" width="800" height="480" frameborder="0" allowfullscreen></iframe>`;e=E({isOpen:!0,onClose:()=>Z(`embed`),embedTargetMode:ye,setEmbedTargetMode:e=>{ye=e,X()},copiedEmbed:be,onCopyEmbedCode:()=>{be=!0,navigator.clipboard?.writeText(t(ye)),X(),setTimeout(()=>{be=!1,J===`embed`&&X()},2e3)},embedCode:t(ye)})}else J===`settings`&&(ae?.classList.add(`active`),e=T({isOpen:!0,onClose:()=>Z(`settings`),displayConfig:xe,setDisplayConfig:e=>{xe=typeof e==`function`?e(xe):e,L?.contentWindow?.postMessage({type:`UPDATE_CONFIG`,config:xe},`*`)},postToPlayer:e=>L?.contentWindow?.postMessage(e,`*`)}));e&&G.appendChild(e)}function Z(e){J=J===e?null:e,X()}function Q(){R&&(R.innerHTML=P(h),R.value=h)}function je(){return[...D().map(e=>({id:e.id,label:e.title,stage:e.stage||`LOCAL VAULT`,type:e.type||`Sim`,subject:e.subject||`Custom Ingested`})),...y]}function $(e){if(e===`__custom_find__`||e===`__open_local__`)return;let t=he(e);h=t;let n=O(t);ee&&(ee.textContent=n.label),te&&(te.textContent=n.stage),ne&&(ne.textContent=n.type||`Sim`),R&&(R.value=t);let i=o.querySelector(`#catholic-sanctuary-banner`);i&&(i.style.display=b(n)?`flex`:`none`),L&&(L.src=ge(r,t,v)),p({subtitle:`${n.label}. ${n.stage}`,isSpeaking:!0}),Y&&(Y.destroy(),Y=null,W&&(W.style.background=`#1e293b`,W.style.borderColor=`#d97706`,W.style.color=`#f59e0b`)),(J===`lab`||J===`ai`)&&X();let a=new URL(window.location.href);a.searchParams.set(`preset`,t),window.history.replaceState({},``,a.toString()),Ne()}async function Me(e){if(e&&e.length!==0)try{let t=e.find(e=>e.name.endsWith(`.svg`)),n=e.find(e=>e.name.endsWith(`.ast`));if(t&&n){let e=await t.text(),r=await n.text(),i=t.name.replace(/\.[^/.]+$/,``),a=i.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),o={id:a,title:i.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested companion pair: ${t.name} + ${n.name}.`,icon:`💾`,source:`imported`,svgMarkup:e,astSource:r,updatedAt:Date.now()};c(o),Q(),$(a),L?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:o},`*`);return}for(let t of e){let e=await t.text();if(t.name.endsWith(`.phet`)||i(e)){let n=await l(e,t.name);if(n.success&&n.svgMarkup&&n.astSource){let e=n.metadata?.simName||`phet-${Date.now()}`,r={id:e,title:n.metadata?.title||t.name.replace(/\.[^/.]+$/,``),stage:`PHET INTERACTIVE`,category:`STEM`,desc:`PhET simulation transpiled to AST: ${n.metadata?.compressionRatio||`distilled`}.`,icon:`⚛️`,source:`phet`,svgMarkup:n.svgMarkup,astSource:n.astSource,updatedAt:Date.now()};c(r),Q(),$(e),L?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:r},`*`);return}}if(t.name.endsWith(`.svg`)){let n=t.name.replace(/\.[^/.]+$/,``),r=n.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),i=n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),a=``,o=e.match(/<script\s+type=["']text\/ast["'][^>]*>([\s\S]*?)<\/script>/i);a=o&&o[1]?o[1].trim():`(:scene :id "${r}" :title "${i}" :stage "CUSTOM" :duration 10.0 (:bindings ()))`;let s={id:r,title:i,stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested vector cartridge: ${t.name}.`,icon:`🎨`,source:`imported`,svgMarkup:e,astSource:a,updatedAt:Date.now()};c(s),Q(),$(r),L?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:s},`*`);return}if(t.name.endsWith(`.ast`)){let n=t.name.replace(/\.[^/.]+$/,``),r=n.toLowerCase().replace(/[^a-z0-9_-]/g,`-`),i={id:r,title:n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase()),stage:`LOCAL VAULT`,category:`Custom Files`,desc:`Locally ingested AST logic: ${t.name}.`,icon:`📜`,source:`imported`,svgMarkup:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`,astSource:e,updatedAt:Date.now()};c(i),Q(),$(r),L?.contentWindow?.postMessage({type:`LOAD_CUSTOM_CARTRIDGE`,cartridge:i},`*`);return}}}catch(e){console.error(`[media-player] Error ingesting uploaded files:`,e)}}function Ne(){if(!q)return;let e=_.toLowerCase().trim(),t=je().filter(t=>{let n=!0;g===`Catholic`?n=b(t):g===`STEM`?n=x(t):g===`Maths`?n=S(t):g===`EYFS`?n=w(t):g!==`All`&&(n=(t.type||`Sim`)===g);let r=!e||t.label.toLowerCase().includes(e)||t.stage.toLowerCase().includes(e)||t.id.toLowerCase().includes(e);return n&&r});t.length===0?q.innerHTML=`<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:#94a3b8;">No matching cartridges found.</div>`:(q.innerHTML=t.map(e=>{let t=e.id===h;return`
        <div 
          class="cartridge-card" 
          data-id="${K(e.id)}"
          style="padding:12px; border-radius:10px; border:1.5px solid ${t?`#0284c7`:`#e2e8f0`}; background:${t?`#f0f9ff`:`#f8fafc`}; cursor:pointer; transition:all 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.68rem; font-weight:800; padding:1px 6px; border-radius:4px; background:${e.type===`Slide`?`#dcfce7`:e.type===`App`?`#fef3c7`:`#e0f2fe`}; color:${e.type===`Slide`?`#166534`:e.type===`App`?`#92400e`:`#0369a1`};">
              ${K(e.type||`Sim`)}
            </span>
            <span style="font-size:0.68rem; color:#64748b; font-weight:600;">${K(e.stage)}</span>
          </div>
          <strong style="display:block; font-size:0.86rem; color:#0f172a; margin-bottom:6px; line-height:1.3;">${K(e.label)}</strong>
          <span style="font-size:0.75rem; color:#0284c7; font-weight:700;">${t?`▶ Currently Playing`:`Launch &rarr;`}</span>
        </div>
      `}).join(``),q.querySelectorAll(`.cartridge-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-id`);t&&($(t),L?.scrollIntoView({behavior:`smooth`,block:`center`}))})}))}R?.addEventListener(`change`,e=>{let t=e.target.value;if(t===`__open_local__`)R.value=h,ce?.click();else if(t===`__custom_find__`){R.value=h;let e=window.prompt(`Enter Cartridge or Scene ID (e.g. calculus-curves, bbc-model-b, stations-of-the-cross):`);e&&e.trim()&&$(e.trim())}else $(t)}),re?.addEventListener(`click`,()=>{ce?.click()}),ce?.addEventListener(`change`,e=>{let t=e.target;t.files&&t.files.length&&(Me(Array.from(t.files)),t.value=``)}),ve&&(ve.addEventListener(`dragover`,e=>{e.preventDefault(),e.stopPropagation()}),ve.addEventListener(`drop`,e=>{e.preventDefault(),e.stopPropagation(),e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length&&Me(Array.from(e.dataTransfer.files))})),B?.addEventListener(`click`,()=>{try{L?.contentWindow?.postMessage({type:`RESET_SIM`},`*`)}catch{}});function Pe(e){v=e,z&&(z.textContent=`🖐️ BSL Signing: ${e?`ON`:`OFF`}`,z.style.background=e?`rgba(56, 189, 248, 0.16)`:`#1e293b`,z.style.borderColor=e?`#38bdf8`:`#475569`,z.style.color=e?`#38bdf8`:`#94a3b8`)}return t(e=>{v!==e&&(Pe(e),L&&(L.src=ge(r,h,e)))}),z?.addEventListener(`click`,()=>{d()}),e(e=>{try{L?.contentWindow?.postMessage({type:`SET_VOICE`,enabled:e},`*`)}catch{}}),window.addEventListener(`message`,e=>{e.data&&typeof e.data==`object`&&(e.data.type===`CARTRIDGE_INGESTED`&&(Q(),Ne()),(e.data.type===`VOICE_TOGGLE`||e.data.type===`SET_VOICE`)&&typeof e.data.enabled==`boolean`&&f(e.data.enabled))}),window.addEventListener(`cartridges_updated`,()=>{Q(),Ne()}),V?.addEventListener(`click`,()=>Z(`lab`)),H?.addEventListener(`click`,()=>Z(`ai`)),U?.addEventListener(`click`,()=>Z(`studio`)),ie?.addEventListener(`click`,()=>Z(`embed`)),ae?.addEventListener(`click`,()=>Z(`settings`)),W?.addEventListener(`click`,()=>{Y?(Y.destroy(),Y=null,W.style.background=`#1e293b`,W.style.borderColor=`#d97706`,W.style.color=`#f59e0b`):ve&&(Y=de(ve,{onClose:()=>{Y=null,W.style.background=`#1e293b`,W.style.borderColor=`#d97706`,W.style.color=`#f59e0b`}}),W.style.background=`rgba(245, 158, 11, 0.2)`,W.style.borderColor=`#f59e0b`,W.style.color=`#fbbf24`)}),oe?.addEventListener(`click`,()=>{let e=O(h);fe(h,e.label)}),le?.addEventListener(`click`,()=>{let e=o.querySelector(`#player-iframe-wrapper`);document.fullscreenElement?document.exitFullscreen?.():e?.requestFullscreen?.()}),_e.forEach(e=>{e.addEventListener(`click`,()=>{g=e.getAttribute(`data-cat`)||`All`,_e.forEach(e=>{let t=e.getAttribute(`data-cat`)===g;e.style.background=t?`#0284c7`:`#f8fafc`,e.style.color=t?`#ffffff`:`#475569`,e.style.borderColor=t?`#0284c7`:`#cbd5e1`}),Ne()})}),pe?.addEventListener(`input`,e=>{_=e.target.value,Ne()}),Ne(),o}export{q as default,q as renderPlayerPage};