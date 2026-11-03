import{a as e,d as t,i as n,n as r,r as i,u as a}from"./index-ucfy84ly.js";function o(){let o=`/wwwebucation/`.replace(/\/?$/,`/`),s=document.createElement(`div`);s.className=`settings-page-stage`,s.style.cssText=`max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let c=r(),l=localStorage.getItem(`theme`)||`light`,u=localStorage.getItem(`app_font_size`)||`normal`,d=localStorage.getItem(`app_high_contrast`)===`true`,f=n(),p=a();function m(){s.innerHTML=`
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${o}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">⚙️ System Settings</span>
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">System, Accessibility &amp; Offline Preferences</h1>
        <p style="font-size:0.95rem; color:#64748b; margin:0;">
          All settings are stored directly on your device. We do not use tracking cookies or cloud profiling.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        <!-- 1. Accessibility & Visual Sensory -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; display:flex; align-items:center; gap:8px;">
            <span>👁️</span> Visual &amp; Sensory Access
          </h2>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1.25rem;">
            <!-- Theme Toggle -->
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">Display Theme:</label>
              <button type="button" id="settings-theme-toggle" style="padding:8px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; font-weight:700; font-size:0.88rem; cursor:pointer;">
                ${l===`dark`?`🌙 Dark Mode (Active)`:`☀️ Light Mode (Active)`}
              </button>
            </div>

            <!-- Font Size -->
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">Font Size:</label>
              <div style="display:flex; gap:6px;">
                <button type="button" class="settings-font-btn" data-size="normal" style="padding:6px 14px; border-radius:6px; border:1px solid ${u===`normal`?`#0284c7`:`#cbd5e1`}; background:${u===`normal`?`#0284c7`:`#f8fafc`}; color:${u===`normal`?`#fff`:`#334155`}; font-weight:700; cursor:pointer;">
                  Standard (A)
                </button>
                <button type="button" class="settings-font-btn" data-size="large" style="padding:6px 14px; border-radius:6px; border:1px solid ${u===`large`?`#0284c7`:`#cbd5e1`}; background:${u===`large`?`#0284c7`:`#f8fafc`}; color:${u===`large`?`#fff`:`#334155`}; font-weight:700; cursor:pointer;">
                  Large (A+)
                </button>
              </div>
            </div>

            <!-- Contrast -->
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:6px;">High Contrast Mode:</label>
              <button type="button" id="settings-contrast-toggle" style="padding:8px 16px; border-radius:8px; border:1px solid ${d?`#0284c7`:`#cbd5e1`}; background:${d?`#eff6ff`:`#f8fafc`}; color:${d?`#0284c7`:`#334155`}; font-weight:700; font-size:0.88rem; cursor:pointer;">
                ${d?`🌓 High Contrast: ON`:`🌓 High Contrast: OFF`}
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Language & Polyglot Settings -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; display:flex; align-items:center; gap:8px;">
            <span>🌐</span> Language &amp; Translation
          </h2>

          <div style="display:flex; flex-direction:column; gap:10px; max-width:400px;">
            <label for="settings-lang-select" style="font-size:0.85rem; font-weight:700; color:#475569;">Default Portal Language:</label>
            <select id="settings-lang-select" style="padding:8px 12px; border-radius:8px; border:1.5px solid #0284c7; background:#ffffff; font-size:0.9rem; font-weight:700; cursor:pointer;">
              <option value="en" ${c===`en`?`selected`:``}>🇬🇧 English</option>
              <option value="es" ${c===`es`?`selected`:``}>🇪🇸 Español (Spanish)</option>
              <option value="fr" ${c===`fr`?`selected`:``}>🇫🇷 Français (French)</option>
              <option value="la" ${c===`la`?`selected`:``}>🇻🇦 Latina (Ecclesiastical Latin)</option>
              <option value="de" ${c===`de`?`selected`:``}>🇩🇪 Deutsch (German)</option>
              <option value="pl" ${c===`pl`?`selected`:``}>🇵🇱 Polski (Polish)</option>
              <option value="uk" ${c===`uk`?`selected`:``}>🇺🇦 Українська (Ukrainian)</option>
              <option value="pt" ${c===`pt`?`selected`:``}>🇵🇹 Português (Portuguese)</option>
              <option value="ar" ${c===`ar`?`selected`:``}>🇸🇦 العربية (Arabic)</option>
            </select>
          </div>
        </div>

        <!-- 3. British Sign Language (BSL) -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>🖐️</span> British Sign Language (BSL) In-Vision Interpreter
          </h2>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 1rem 0; line-height:1.5;">
            Our in-vision procedural vector interpreter signs synchronously with speech without loading heavy video streams. Keyboard shortcut: <kbd style="background:#f1f5f9; border:1px solid #cbd5e1; padding:1px 5px; border-radius:4px;">Shift + B</kbd>.
          </p>

          <button type="button" id="settings-bsl-toggle" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${p?`#0284c7`:`#cbd5e1`}; background:${p?`#0284c7`:`#f8fafc`}; color:${p?`#ffffff`:`#334155`}; font-weight:700; font-size:0.88rem; cursor:pointer;">
            ${p?`🖐️ BSL Signing: ON (Active)`:`🖐️ BSL Signing: OFF`}
          </button>
        </div>

        <!-- 4. Low-Bandwidth Data Saver Mode -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:8px;">
            <span>📶</span> Data Saver Mode (Zero Data / Developing Nations)
          </h2>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 1rem 0; line-height:1.5;">
            Suppresses external font requests, disables background prefetching, and runs exclusively on local vector assets to conserve expensive mobile data.
          </p>

          <button type="button" id="settings-data-saver-toggle" style="padding:8px 16px; border-radius:8px; border:1.5px solid ${f?`#10b981`:`#cbd5e1`}; background:${f?`#ecfdf5`:`#f8fafc`}; color:${f?`#065f46`:`#334155`}; font-weight:700; font-size:0.88rem; cursor:pointer;">
            ${f?`📶 Data Saver: ON (Low Bandwidth)`:`📶 Data Saver: OFF`}
          </button>
        </div>
      </div>
    `,s.querySelector(`#settings-theme-toggle`)?.addEventListener(`click`,()=>{l=l===`dark`?`light`:`dark`,localStorage.setItem(`theme`,l),document.documentElement.setAttribute(`data-theme`,l),m()}),s.querySelectorAll(`.settings-font-btn`).forEach(e=>{e.addEventListener(`click`,()=>{u=e.getAttribute(`data-size`)||`normal`,localStorage.setItem(`app_font_size`,u),document.documentElement.setAttribute(`data-font-size`,u),m()})}),s.querySelector(`#settings-contrast-toggle`)?.addEventListener(`click`,()=>{d=!d,localStorage.setItem(`app_high_contrast`,String(d)),document.documentElement.setAttribute(`data-high-contrast`,String(d)),m()}),s.querySelector(`#settings-lang-select`)?.addEventListener(`change`,e=>{let t=e.target.value;c=t,i(t)}),s.querySelector(`#settings-bsl-toggle`)?.addEventListener(`click`,()=>{p=!p,t(),m()}),s.querySelector(`#settings-data-saver-toggle`)?.addEventListener(`click`,()=>{f=!f,e(f),m()})}return m(),s}export{o as default,o as renderSettingsPage};