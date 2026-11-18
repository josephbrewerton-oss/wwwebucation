import{h as e,s as t}from"./cartridge-vault-CAeCmZaX.js";import{c as n,d as r,f as i,i as a,l as o,n as ee,o as s,r as c,s as l,t as u,u as d}from"./localCartridgeBuilder-CJkjJk1i.js";import{executeSiteDirective as f,getSiteManifest as p,t as te}from"./nanoSiteManager-CFc_w-zc.js";function m(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function h(){let h=e(),g=document.createElement(`div`);g.className=`curriculum-studio-stage`,g.style.cssText=`max-width: 1160px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let _=null,v=``,y=`none`,b=!0,x=null,S=null,C=`Ready for offline .ast + .svg Duo compilation & local folder builds.`,w=new r,T=null;g.innerHTML=`
    <!-- Header -->
    <div style="margin-bottom: 1.75rem;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <a href="${h}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🛠️ Lesson Author Studio</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">
            Interactive Lesson Builder &amp; Offline Packager
          </h1>
          <p style="font-size:0.95rem; color:#475569; margin:0;">
            Package paired lesson scripts (<code>.ast</code>) and diagrams (<code>.svg</code>) into offline classroom activities (<code>.astb</code>), sync a local school folder, and preview them immediately.
          </p>
        </div>
        <a href="${h}player" style="padding:10px 18px; border-radius:8px; background:#0284c7; color:#fff; font-weight:700; font-size:0.86rem; text-decoration:none;">
          Open Interactive Player &rarr;
        </a>
      </div>
    </div>

    <!-- Section 1: Nominated Local Folder Build Pipeline + Duo Dropzone -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin-bottom: 1.5rem;">
      <!-- Card A: Nominated Local Folder -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:10px;">
          <div>
            <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#0369a1; text-transform:uppercase;">
              Local Classroom Sync (Offline Storage)
            </span>
            <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 0 0; color:#0f172a;">
              School Lesson Build Folder
            </h2>
          </div>
          <span id="fs-api-badge" style="font-size:0.72rem; font-weight:700; padding:3px 8px; border-radius:6px; background:${a()?`#dcfce7; color:#166534;`:`#fef3c7; color:#92400e;`}">
            ${a()?`Folder Sync Ready`:`Read-Only Mode`}
          </span>
        </div>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Pick your local <code>cartridges/</code> folder once to remember it offline and rebuild lesson packages (<code>bytecode/*.astb</code>) and manifests straight to disk with zero cloud uploads.
        </p>

        <div id="nominated-folder-box" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:0.82rem;">
          <div style="color:#64748b;">No folder chosen yet.</div>
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#334155; font-weight:600; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="chk-write-disk" checked />
          Save rebuilt lesson packages back into the chosen folder
        </label>

        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" id="btn-nominate-folder" style="padding:8px 14px; border-radius:8px; border:none; background:#0f172a; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            📁 Pick School Folder
          </button>
          <button type="button" id="btn-run-folder-build" disabled style="padding:8px 14px; border-radius:8px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer; opacity:0.55;">
            ⚡ Build All Lessons in Folder
          </button>
          <button type="button" id="btn-fallback-dir" style="padding:8px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; color:#334155; font-weight:700; font-size:0.8rem; cursor:pointer;">
            📂 Scan Folder (Read-Only)
          </button>
          <button type="button" id="btn-forget-folder" style="display:none; padding:8px 10px; border-radius:8px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.78rem; cursor:pointer;">
            Forget
          </button>
          <input type="file" id="input-fallback-dir" webkitdirectory directory multiple style="display:none;" />
        </div>
      </section>

      <!-- Card B: Instant .ast + .svg Duo Compiler -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#7c3aed; text-transform:uppercase;">
          Offline Activity Packager
        </span>
        <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
          Package Lesson + Diagram (.ast + .svg)
        </h2>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Select or drop matching lesson (<code>.ast</code>) and diagram (<code>.svg</code>) files to pack them into a portable offline <code>.astb</code> activity and preview it immediately.
        </p>

        <div id="duo-dropzone" style="border:2px dashed #94a3b8; border-radius:10px; padding:22px 16px; text-align:center; background:#f8fafc; cursor:pointer; transition:border-color 0.15s, background 0.15s;">
          <div style="font-size:1.5rem; margin-bottom:4px;">🧩</div>
          <div style="font-weight:700; font-size:0.88rem; color:#0f172a;">Drop lesson (.ast) + diagram (.svg) files here</div>
          <div style="font-size:0.78rem; color:#64748b; margin-top:4px;">or click to browse local files (multiple allowed)</div>
          <input type="file" id="input-duo-files" accept=".ast,.svg,.ast.svg" multiple style="display:none;" />
        </div>

        <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
          <span id="studio-status-line" style="font-size:0.8rem; font-weight:600; color:#0369a1;">
            ${m(C)}
          </span>
          <button type="button" id="btn-test-built-sample" style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.76rem; cursor:pointer;">
            🧪 Test Built Sample Duo
          </button>
        </div>
      </section>
    </div>

    <!-- Section 2: Compiled Duo Build Results Table -->
    <section id="build-report-section" style="display:none; background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <div>
          <h2 style="font-size:1.15rem; font-weight:800; margin:0; color:#0f172a;">Compiled Build Output</h2>
          <p id="build-summary-stats" style="font-size:0.82rem; color:#475569; margin:4px 0 0 0;"></p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" id="btn-mount-all-vault" style="padding:7px 12px; border-radius:7px; border:none; background:#059669; color:#fff; font-weight:700; font-size:0.78rem; cursor:pointer;">
            💾 Mount All to Offline Vault
          </button>
          <button type="button" id="btn-download-manifest" style="padding:7px 12px; border-radius:7px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.78rem; cursor:pointer;">
            📄 Export scenes.manifest.json
          </button>
        </div>
      </div>

      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid #e2e8f0; color:#475569;">
              <th style="padding:8px 6px;">Cartridge</th>
              <th style="padding:8px 6px;">Mode</th>
              <th style="padding:8px 6px;">Size (Src &rarr; .astb)</th>
              <th style="padding:8px 6px;">448 KiB WASM Kernel</th>
              <th style="padding:8px 6px;">SHA-256</th>
              <th style="padding:8px 6px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="build-results-tbody"></tbody>
        </table>
      </div>
    </section>

    <!-- Section 3: Everyman Chassis 448 KiB WASM Kernel Live Inspector & Dumb Canvas Blitter -->
    <section id="everyman-bios-panel" style="display:none; background:#0f172a; color:#f8fafc; border:1px solid #334155; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
        <div>
          <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#38bdf8; text-transform:uppercase;">
            Zero-Domain JS BIOS + Pure WASM Kernel (448 KiB Fixed Pool)
          </span>
          <h2 id="bios-panel-title" style="font-size:1.15rem; font-weight:800; margin:2px 0 0 0; color:#fff;">
            Everyman Kernel Inspector
          </h2>
        </div>
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <select id="sel-bios-render-mode" aria-label="Shared Render Boundary Mode" style="padding:5px 8px; border-radius:6px; border:1px solid #475569; background:#1e293b; color:#38bdf8; font-weight:700; font-size:0.76rem; cursor:pointer;">
            <option value="canvas">Mode: WASM Canvas</option>
            <option value="svg">Mode: Companion SVG</option>
            <option value="hybrid">Mode: Hybrid Shared</option>
          </select>
          <button type="button" id="btn-bios-nano-manifest" style="padding:6px 10px; border-radius:6px; border:1px solid #7c3aed; background:#1e1b4b; color:#ddd6fe; font-weight:700; font-size:0.76rem; cursor:pointer;">
            🤖 Nano Manifest
          </button>
          <button type="button" id="btn-bios-play-pause" style="padding:6px 12px; border-radius:6px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ⏯ Play / Pause (Op 6)
          </button>
          <button type="button" id="btn-bios-reset" style="padding:6px 12px; border-radius:6px; border:1px solid #475569; background:#1e293b; color:#e2e8f0; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ↺ Reset (Op 5)
          </button>
          <button type="button" id="btn-bios-close" style="padding:6px 10px; border-radius:6px; border:none; background:#334155; color:#cbd5e1; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ✕
          </button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: minmax(320px, 1.4fr) minmax(280px, 1fr); gap:14px;">
        <div>
          <div style="position:relative; width:100%; aspect-ratio:800/480; background:#090d16; border:1px solid #334155; border-radius:8px; overflow:hidden;">
            <svg id="everyman-bios-svg" viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" style="position:absolute; inset:0; width:100%; height:100%; display:none;">
              <g id="everyman-bios-svg-root"></g>
            </svg>
            <canvas id="everyman-bios-canvas" width="800" height="480" style="position:relative; width:100%; height:100%; display:block; cursor:pointer;"></canvas>
          </div>
          <div id="bios-telemetry-strip" style="margin-top:8px; font-family:ui-monospace, monospace; font-size:0.74rem; color:#94a3b8; display:flex; flex-wrap:wrap; gap:12px;"></div>
        </div>
        <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:10px; max-height:360px; overflow-y:auto;">
          <div style="font-size:0.74rem; font-weight:800; color:#38bdf8; margin-bottom:6px; text-transform:uppercase;">
            3-Column Gemini Nano / WebMCP Manifest (0x00C00)
          </div>
          <div id="bios-manifest-list" style="display:flex; flex-direction:column; gap:6px; font-family:ui-monospace, monospace; font-size:0.72rem;"></div>
          <pre id="bios-nano-manifest-pre" style="display:none; margin:8px 0 0 0; padding:8px; background:#090d16; border:1px solid #4c1d95; border-radius:6px; color:#e9d5ff; font-size:0.68rem; overflow-x:auto; white-space:pre-wrap;"></pre>
        </div>
      </div>
    </section>

    <!-- Active Cartridges Inventory -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
      <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">
        Active Controlled Cartridges (${t.length} Registered)
      </h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:360px; overflow-y:auto;">
        ${t.map(e=>`
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:0.7rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px;">${e.type||`Sim`}</span>
              <span style="font-size:0.7rem; color:#64748b; font-weight:600;">${e.stage}</span>
            </div>
            <strong style="font-size:0.85rem; color:#0f172a; display:block; margin-bottom:4px;">${e.label}</strong>
            <a href="${h}player?preset=${e.id}" style="font-size:0.75rem; color:#0284c7; font-weight:700; text-decoration:none;">Test in Player &rarr;</a>
          </div>
        `).join(``)}
      </div>
    </div>
  `;let E=g.querySelector(`#nominated-folder-box`),D=g.querySelector(`#chk-write-disk`),O=g.querySelector(`#btn-nominate-folder`),k=g.querySelector(`#btn-run-folder-build`),A=g.querySelector(`#btn-fallback-dir`),j=g.querySelector(`#btn-forget-folder`),M=g.querySelector(`#input-fallback-dir`),N=g.querySelector(`#duo-dropzone`),P=g.querySelector(`#input-duo-files`),F=g.querySelector(`#studio-status-line`),I=g.querySelector(`#btn-test-built-sample`),L=g.querySelector(`#build-report-section`),R=g.querySelector(`#build-summary-stats`),z=g.querySelector(`#build-results-tbody`),B=g.querySelector(`#btn-mount-all-vault`),V=g.querySelector(`#btn-download-manifest`),H=g.querySelector(`#everyman-bios-panel`),U=g.querySelector(`#bios-panel-title`),W=g.querySelector(`#everyman-bios-svg`),ne=g.querySelector(`#everyman-bios-svg-root`),re=g.querySelector(`#everyman-bios-canvas`),G=g.querySelector(`#bios-telemetry-strip`),K=g.querySelector(`#bios-manifest-list`),q=g.querySelector(`#bios-nano-manifest-pre`),J=g.querySelector(`#sel-bios-render-mode`),ie=g.querySelector(`#btn-bios-nano-manifest`),ae=g.querySelector(`#btn-bios-play-pause`),oe=g.querySelector(`#btn-bios-reset`),se=g.querySelector(`#btn-bios-close`),Y=(e,t=!1)=>{C=e,F.textContent=e,F.style.color=t?`#dc2626`:`#0369a1`},X=()=>{_&&v?(E.innerHTML=`
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <strong style="color:#0f172a;">📂 ${m(v)}</strong>
            <div style="font-size:0.75rem; color:#475569; margin-top:2px;">
              Permission: <strong>${y}</strong> &middot; Output: <code>${m(v)}/bytecode/</code>
            </div>
          </div>
          <span style="font-size:0.72rem; font-weight:700; color:${y===`granted`?`#166534`:`#92400e`};">
            ${y===`granted`?`✓ Read/Write`:`⚠ Re-grant on Build`}
          </span>
        </div>
      `,k.disabled=!1,k.style.opacity=`1`,j.style.display=`inline-block`):(E.innerHTML=`<div style="color:#64748b;">No folder chosen yet. Click <strong>Pick School Folder</strong> or use Read-Only Folder Scan.</div>`,k.disabled=!0,k.style.opacity=`0.55`,j.style.display=`none`)},Z=async e=>{S=e,H.style.display=`block`,U.textContent=`Everyman 448 KiB Kernel — ${e.title} (${e.id}.astb)`,T&&=(T(),null);try{await w.init();let t=w.bootCartridge(e.astbData),n=e=>{G.innerHTML=`
          <span><strong>Mem:</strong> ${(e.linearMemoryBytes/1024).toFixed(0)} KiB (${e.linearMemoryPages} pages)</span>
          <span><strong>t:</strong> ${e.t.toFixed(3)}</span>
          <span><strong>Tick:</strong> ${e.tickCount}</span>
          <span><strong>Tuples:</strong> ${e.tupleCount}</span>
          <span><strong>Hitboxes:</strong> ${e.hitboxCount}</span>
          <span><strong>DL Ops:</strong> ${e.displayListCount}</span>
          <span><strong>StateHex:</strong> ${e.stateHex}</span>
        `},r=()=>{let e=w.readManifest();K.innerHTML=e.map(e=>`
            <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:6px 8px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
              <div style="min-width:0;">
                <div style="color:#38bdf8; font-weight:700;">#${e.slotId} [${e.stageState}] &middot; ${e.kind}</div>
                <div style="color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m(e.semanticTag)} &rarr; ${m(e.payload)}</div>
                <div style="color:#94a3b8;">val=${Number(e.value).toFixed(2)} (${e.min}..${e.max})</div>
              </div>
              <button type="button" data-focus-slot="${e.slotId}" style="padding:3px 7px; border-radius:4px; border:1px solid #475569; background:#1e293b; color:#e2e8f0; cursor:pointer; font-size:0.68rem;">
                Focus
              </button>
            </div>
          `).join(``),K.querySelectorAll(`[data-focus-slot]`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.focusSlot||`0`,10);w.dispatchTuple(t,i.FOCUS,0,0),r()}})},a=J.value||(t.telemetry.hasEmbeddedSvg?`hybrid`:`canvas`);w.mountCompanionSvg(ne,W,a),r(),n(t.telemetry),T=w.startCanvasLoop(re,e=>{n(e)},a),J.value=te().getSurface(w.surfaceId)?.renderMode||a}catch(e){G.textContent=`Kernel boot error: ${e?.message||e}`}},Q=e=>{x=e,L.style.display=`block`;let t=e.totalSourceBytes>0?((e.totalSourceBytes-e.totalBytecodeBytes)/e.totalSourceBytes*100).toFixed(1):`0.0`;R.textContent=`Source: ${e.folderName} • ${e.totalArtifacts} built (${e.duoCount} Duos) • ${e.totalSourceBytes.toLocaleString()} B → ${e.totalBytecodeBytes.toLocaleString()} B (-${t}%) • ${e.wroteToLocalFolder?`Written to bytecode/ on local disk`:`Ready in memory / download`}`+(e.failedCount>0?` • ${e.failedCount} failed`:``),z.innerHTML=e.artifacts.map((e,t)=>`
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:9px 6px;">
          <strong style="color:#0f172a;">${m(e.title)}</strong>
          <div style="font-size:0.74rem; color:#64748b;"><code>${m(e.id)}.astb</code> &middot; ${m(e.type)}</div>
        </td>
        <td style="padding:9px 6px;">
          <span style="font-size:0.72rem; font-weight:700; padding:2px 7px; border-radius:5px; background:${e.mode===`duo`?`#dbeafe; color:#1d4ed8;`:`#f1f5f9; color:#475569;`}">
            ${e.mode===`duo`?`AST+SVG Duo`:e.mode===`hybrid-capsule`?`.ast.svg`:`AST Only`}
          </span>
          ${e.writtenToDisk?`<div style="font-size:0.7rem; color:#15803d; margin-top:2px;">✓ saved to disk</div>`:``}
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.76rem;">
          ${e.sourceBytes.toLocaleString()} B &rarr; <strong>${e.bytecodeBytes.toLocaleString()} B</strong>
          <div style="color:#0369a1;">(${e.savingsPercent>=0?`-${e.savingsPercent}%`:`+${Math.abs(e.savingsPercent)}%`})</div>
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.74rem;">
          ${e.wasmBootOk?`<span style="color:#15803d; font-weight:700;">✓ 448 KiB Boot OK</span><div style="color:#64748b;">${e.wasmManifestCount} rows &middot; ${e.wasmStateHex.slice(0,12)}…</div>`:`<span style="color:#dc2626; font-weight:700;">✕ ${m(e.wasmError||`Boot error`)}</span>`}
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.72rem; color:#475569;">
          ${e.sha256.slice(0,12)}…
        </td>
        <td style="padding:9px 6px; text-align:right; white-space:nowrap;">
          <button type="button" data-dl-idx="${t}" style="padding:4px 8px; border-radius:5px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.74rem; cursor:pointer;">⬇ .astb</button>
          <button type="button" data-wasm-idx="${t}" style="padding:4px 8px; border-radius:5px; border:none; background:#0f172a; color:#38bdf8; font-weight:700; font-size:0.74rem; cursor:pointer;">⚡ WASM</button>
          <button type="button" data-mount-idx="${t}" style="padding:4px 8px; border-radius:5px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.74rem; cursor:pointer;">▶ Player</button>
        </td>
      </tr>
    `).join(``),z.querySelectorAll(`[data-dl-idx]`).forEach(t=>{t.onclick=()=>{let n=e.artifacts[Number(t.dataset.dlIdx)];n&&c(n.id,n.astbData)}}),z.querySelectorAll(`[data-wasm-idx]`).forEach(t=>{t.onclick=()=>{let n=e.artifacts[Number(t.dataset.wasmIdx)];n&&Z(n)}}),z.querySelectorAll(`[data-mount-idx]`).forEach(t=>{t.onclick=async()=>{let n=e.artifacts[Number(t.dataset.mountIdx)];n&&(await s(n),window.location.href=`${h}player?preset=${encodeURIComponent(n.id)}`)}}),e.artifacts.length>0&&!S&&Z(e.artifacts[0])};n(!1).then(e=>{e.handle&&e.name&&(_=e.handle,v=e.name,y=e.permission,X())}),D.onchange=()=>{b=D.checked},O.onclick=async()=>{try{let e=await l();_=e.handle,v=e.name,y=e.permission,X(),Y(`Nominated folder "${e.name}". Click "Build All Duos in Folder" to compile.`)}catch(e){Y(e?.message||`Folder selection cancelled.`,!0)}},j.onclick=async()=>{await u(),_=null,v=``,y=`none`,X(),Y(`Removed persisted folder handle from IndexedDB.`)},k.onclick=async()=>{if(_){Y(`Scanning "${v}" and compiling .ast + .svg Duos into .astb...`);try{let e=await o({folderName:v,dirHandle:_,writeToDisk:b});y=e.wroteToLocalFolder?`granted`:y,X(),Q(e),Y(`Built ${e.totalArtifacts} cartridges (${e.duoCount} Duos)`+(e.wroteToLocalFolder?` directly into ${v}/bytecode/`:` in memory.`))}catch(e){Y(`Build failed: ${e?.message||e}`,!0)}}},A.onclick=()=>M.click(),M.onchange=async()=>{if(!M.files||M.files.length===0)return;let e=M.files[0].webkitRelativePath||``,t=e.includes(`/`)?e.split(`/`)[0]:`Selected Folder`;Y(`Compiling files from "${t}"...`);let n=await o({folderName:t,fileList:M.files,writeToDisk:!1});Q(n),Y(`Compiled ${n.totalArtifacts} cartridges from "${t}".`),M.value=``};let $=async e=>{let t=await d(e);if(t.length===0){Y(`No .ast / .ast.svg source files found in selection.`,!0);return}let n=await o({folderName:`Selected Duo Files`,entries:t,writeToDisk:!!(_&&b),dirHandle:_||void 0});Q(n),Y(`Compiled ${n.totalArtifacts} Duo cartridge(s) to .astb (${n.totalBytecodeBytes} B total).`)};return N.onclick=()=>P.click(),N.ondragover=e=>{e.preventDefault(),N.style.borderColor=`#0284c7`,N.style.background=`#eff6ff`},N.ondragleave=()=>{N.style.borderColor=`#94a3b8`,N.style.background=`#f8fafc`},N.ondrop=async e=>{e.preventDefault(),N.style.borderColor=`#94a3b8`,N.style.background=`#f8fafc`,e.dataTransfer?.files&&e.dataTransfer.files.length>0&&await $(e.dataTransfer.files)},P.onchange=async()=>{P.files&&P.files.length>0&&(await $(P.files),P.value=``)},I.onclick=async()=>{let e=await ee({id:`ohm-duo-demo`,astText:`(:scene :id "ohm-duo-demo" :type "Sim" :title "Ohm's Law Duo Sample" :stage "KS3 PHYSICS" :duration 12.0
      (:vars ((:var :name "voltage" :val 9.0 :min 1 :max 24 :step 0.5 :label "Voltage (V)")
              (:var :name "resistance" :val 3.0 :min 1 :max 12 :step 0.5 :label "Resistance (Ω)")))
      (:keyframes ((:t 0.0 :title "Circuit Closed" :rule "I = V / R")
                   (:t 0.5 :title "Steady Current" :rule "Ammeter steady at 3.0 A")))
      (:bindings ((:target "#bulb-glow" :attr "opacity" :expr "Math.min(1, (vars.voltage / vars.resistance) / 8)")))
      (:gestures ((:draggable :target "#voltage-slider" :axis "x" :min 1 :max 24))))`,svgText:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#0f172a"/><rect x="120" y="140" width="560" height="200" rx="24" fill="none" stroke="#38bdf8" stroke-width="4"/><circle id="bulb-glow" cx="680" cy="240" r="36" fill="#facc15"/><circle id="voltage-slider" cx="400" cy="140" r="14" fill="#38bdf8"/></svg>`});Q({folderName:`Built-in Sample Duo`,wroteToLocalFolder:!1,builtAt:Date.now(),totalArtifacts:1,duoCount:1,failedCount:0,totalSourceBytes:e.sourceBytes,totalBytecodeBytes:e.bytecodeBytes,artifacts:[e],manifestJson:{schemaVersion:`everyman-astb-duo/1.0`,entries:[{id:e.id,bytecodeBytes:e.bytecodeBytes,sha256:e.sha256}]},checksumsJson:{[`${e.id}.astb`]:e.sha256},errors:[]}),Y(`Compiled & booted Sample Duo (${e.bytecodeBytes} B .astb, OP_SVG_COMPANION embedded).`)},B.onclick=async()=>{if(x){for(let e of x.artifacts)await s(e);Y(`Mounted ${x.artifacts.length} compiled Duo cartridge(s) into local IndexedDB Vault.`)}},V.onclick=()=>{if(!x)return;let e=new Blob([JSON.stringify(x.manifestJson,null,2)],{type:`application/json`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`scenes.manifest.json`,n.style.display=`none`,document.body.appendChild(n),n.click(),setTimeout(()=>{URL.revokeObjectURL(t),n.remove()},500)},J.onchange=()=>{let e=J.value;f({action:`set_render_mode`,surfaceId:w.surfaceId,mode:e})},ie.onclick=()=>{if(q.style.display!==`none`){q.style.display=`none`;return}let e=JSON.stringify(p(w.surfaceId),null,2);q.textContent=e,q.style.display=`block`},ae.onclick=()=>{w.dispatchTuple(0,i.TOGGLE_PLAY,0,0)},oe.onclick=()=>{w.dispatchTuple(0,i.RESET,0,0)},se.onclick=()=>{T&&=(T(),null),H.style.display=`none`,S=null},X(),g}export{h as default,h as renderCurriculumStudioPage};