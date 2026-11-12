import{t as e}from"./index-RzJXiEH3.js";import{c as t}from"./cartridge-vault-BhkKMAAS.js";function n(){let n=e(),r=document.createElement(`div`);return r.className=`curriculum-studio-stage`,r.style.cssText=`max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`,r.innerHTML=`
    <!-- Header -->
    <div style="margin-bottom: 2rem;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <a href="${n}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🛠️ Curriculum Studio</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">AST Node &amp; Cartridge Studio</h1>
          <p style="font-size:0.95rem; color:#64748b; margin:0;">
            Author, inspect, and bundle interactive S-expression cartridges for air-gapped schools.
          </p>
        </div>
        <a href="${n}player" style="padding:8px 16px; border-radius:8px; background:#0284c7; color:#fff; font-weight:700; font-size:0.84rem; text-decoration:none;">
          Launch Player Studio &rarr;
        </a>
      </div>
    </div>

    <!-- Active Cartridges Inventory -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
      <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">
        Active Controlled Cartridges (${t.length} Registered)
      </h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:400px; overflow-y:auto;">
        ${t.map(e=>`
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:0.7rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px;">${e.type||`Sim`}</span>
              <span style="font-size:0.7rem; color:#64748b; font-weight:600;">${e.stage}</span>
            </div>
            <strong style="font-size:0.85rem; color:#0f172a; display:block; margin-bottom:4px;">${e.label}</strong>
            <a href="${n}player?preset=${e.id}" style="font-size:0.75rem; color:#0284c7; font-weight:700; text-decoration:none;">Test in Player &rarr;</a>
          </div>
        `).join(``)}
      </div>
    </div>
  `,r}export{n as default,n as renderCurriculumStudioPage};