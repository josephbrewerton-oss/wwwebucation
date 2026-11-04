import{t as e}from"./generatedScenes-YJ8cIO2Y.js";function t(){let t=`/wwwebucation/`.replace(/\/?$/,`/`),n=document.createElement(`div`);n.className=`home-landing-stage`,n.style.cssText=`padding: 3rem 1.5rem; max-width: 1140px; margin: 0 auto;`;let r=(Array.isArray(e)&&e.length>0?e:[{id:`kinetic-gas`,label:`Kinetic Gas Theory & Thermodynamics`},{id:`pythagoras`,label:`Pythagoras' Theorem (a² + b² = c²)`},{id:`fractions`,label:`Fractions: Why Common Denominators Rule`},{id:`electric-circuits`,label:`Electrical Circuits & Ohm’s Law`},{id:`solar-system`,label:`Solar System: Heliocentric Planetary Motion`},{id:`algebra-balance`,label:`Algebraic Balance Scale`}]).map(e=>`
    <option value="${e.id}">${e.label}</option>
  `).join(``),i=[{label:`💨 Kinetic Gas`,id:`kinetic-gas`},{label:`🏛️ Church Tour`,id:`church-tour`},{label:`🕯️ High Altar`,id:`altar-anatomy`},{label:`📐 Pythagoras`,id:`pythagoras`},{label:`🍰 Fractions`,id:`fractions`},{label:`💡 Circuits`,id:`electric-circuits`},{label:`🪐 Solar System`,id:`solar-system`},{label:`⚖️ Algebra Balance`,id:`algebra-balance`},{label:`💻 BBC Micro`,id:`bbc-model-b`},{label:`🤟 BSL Signs`,id:`bsl-fingerspelling`}].map((e,t)=>`
    <button 
      type="button" 
      class="sim-pill-btn" 
      data-preset="${e.id}" 
      style="background: ${t===0?`#0284c7`:`#1e293b`}; color: ${t===0?`#ffffff`:`#94a3b8`}; border: 1px solid ${t===0?`#38bdf8`:`#334155`}; border-radius: 9999px; padding: 3px 10px; font-size: 0.74rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease;">
      ${e.label}
    </button>
  `).join(``);n.innerHTML=`
    <!-- Welcome Hero -->
    <section style="text-align: center; margin-bottom: 3.5rem;">
      <div class="stj-meta-strip" style="margin-bottom: 1.25rem; justify-content: center; display: flex; gap: 8px; font-size: 0.85rem; align-items: center;">
        <span style="color: #16a34a; font-weight: 600;">Education should be free</span>
        <span class="stj-meta-separator" style="color: #cbd5e1;" aria-hidden="true">·</span>
        <span style="color: #64748b;">UK National Curriculum</span>
        <span class="stj-meta-separator" style="color: #cbd5e1;" aria-hidden="true">·</span>
        <span style="color: #64748b;">Works Offline</span>
        <span class="stj-meta-separator" style="color: #cbd5e1;" aria-hidden="true">·</span>
        <a href="${t}news" style="color: #0284c7; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;">
          <span>AST Vector Player Release</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <h1 class="stj-hero-title" style="font-size: 2.75rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem; letter-spacing: -0.025em;">
        Learn with Confidence at St Joseph's
      </h1>
      <p class="stj-hero-sub" style="font-size: 1.15rem; color: #475569; max-width: 720px; margin: 0 auto 2.25rem; line-height: 1.6;">
        Interactive practice with instant feedback, step-by-step clues, and diagnostic mistake checks. 
        Tailored for Key Stages 1 to 4 in Mathematics, Science, English, Computing, and more.
      </p>

      <div class="stj-hero-actions" style="display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap;">
        <a href="${t}player" class="stj-btn-hero-primary" style="padding: 10px 22px; background: #0284c7; color: #ffffff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
          <span>🎮 Launch Simulator Studio</span>
          <span aria-hidden="true">→</span>
        </a>
        <a href="#featured-simulations" class="stj-btn-hero-secondary" style="padding: 10px 20px; background: #0f172a; color: #ffffff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <span>Live Stage Demo</span>
          <span aria-hidden="true">↓</span>
        </a>
        <a href="#express-lesson-launchpad" class="stj-btn-hero-secondary" style="padding: 10px 20px; background: #334155; color: #ffffff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <span>Explore Lessons</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <div style="display: flex; gap: 0.85rem; justify-content: center; align-items: center; flex-wrap: wrap; margin-top: 1.5rem; font-size: 0.86rem; color: #64748b;">
        <a href="${t}practice-lab" style="color: #64748b; text-decoration: none; font-weight: 500;">Practice Question Bank</a>
        <span style="color: #cbd5e1;">·</span>
        <a href="#home-learner-guided-pathway" style="color: #64748b; text-decoration: none; font-weight: 500;">Guided Learning Pathway</a>
        <span style="color: #cbd5e1;">·</span>
        <a href="${t}catholic-life" style="color: #64748b; text-decoration: none; font-weight: 500;">Catholic Life &amp; Faith</a>
      </div>
    </section>

    <!-- 2-Click Express Lesson Launchpad Section -->
    <section id="express-lesson-launchpad" style="background: #ffffff; border: 1.5px solid #0284c7; border-radius: 16px; padding: 2rem; margin-bottom: 3.5rem; box-shadow: 0 4px 20px rgba(2, 132, 199, 0.08); text-align: center;">
      <div style="font-size: 0.78rem; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
        ⚡ 2-Click Fast Track · Jump Straight into Any Lesson
      </div>
      <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 1.25rem 0;">What Would You Like to Learn Today?</h2>
      
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: #64748b; align-self: center; margin-right: 4px;">1. Choose Stage:</span>
        ${[`All`,`Reception`,`Year 1`,`Year 2`,`Year 3`,`Year 4`,`Year 6`,`KS3`,`GCSE`].map((e,t)=>`
          <button type="button" class="stj-pill-btn" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 999px; border: 1px solid ${t===4?`#0284c7`:`#cbd5e1`}; background: ${t===4?`#0284c7`:`#f8fafc`}; color: ${t===4?`#fff`:`#334155`}; font-weight: 600; cursor: pointer;">
            ${e}
          </button>
        `).join(``)}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; text-align: left;">
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #0284c7; margin-bottom: 4px;">Year 3 · Mathematics</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Unit Fractions &amp; Finding Parts of a Set</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0 0 12px 0;">Cut pizzas and chocolate bars into equal shares: 1/2, 1/3, 1/4, and 1/8.</p>
          <div style="display: flex; gap: 8px;">
            <a href="${t}player.html?preset=fractions" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #059669; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Teach Me</a>
            <a href="${t}practice-lab" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Practice</a>
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #ca8a04; margin-bottom: 4px;">Year 3 · Catholic RE</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">The Liturgy of the Eucharist &amp; Real Presence</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0 0 12px 0;">Master the Mass parts, liturgical colours, and spiritual preparation.</p>
          <div style="display: flex; gap: 8px;">
            <a href="${t}catholic-life" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #059669; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Teach Me</a>
            <a href="${t}practice-lab" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Practice</a>
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #7c3aed; margin-bottom: 4px;">Year 3 · Science</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Forces, Friction and Magnetic Poles</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0 0 12px 0;">Investigate why magnets attract and repel, and explore grip friction on grass vs ice.</p>
          <div style="display: flex; gap: 8px;">
            <a href="${t}player.html?preset=kinetic-gas" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #059669; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Teach Me</a>
            <a href="${t}practice-lab" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Practice</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Home-Learner Guided Pathway Card -->
    <section id="home-learner-guided-pathway" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; margin-bottom: 3.5rem; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
      <div style="text-align: center; margin-bottom: 1.75rem;">
        <span style="display: inline-block; padding: 4px 12px; background: #eff6ff; color: #0284c7; border-radius: 999px; font-size: 0.76rem; font-weight: 700; margin-bottom: 0.5rem;">
          🌱 Guided Independent Learning · 100% Free · Works Offline
        </span>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0;">Start Here: A Guided Learning Pathway for Every Child</h2>
        <p style="font-size: 0.92rem; color: #64748b; max-width: 680px; margin: 0 auto; line-height: 1.5;">
          Whether educating at home or catching up on missed school: the portal breaks every concept down step by step, reads text aloud, and guides you through mistakes.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div style="border: 1.5px solid #0284c7; border-radius: 10px; padding: 1.15rem; background: #f0f9ff;">
          <strong style="color: #0369a1; display: block; font-size: 0.95rem; margin-bottom: 4px;">Primary Foundation</strong>
          <span style="font-size: 0.78rem; color: #64748b;">Ages 5–7 · Key Stage 1</span>
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 10px; padding: 1.15rem; background: #ffffff;">
          <strong style="color: #0f172a; display: block; font-size: 0.95rem; margin-bottom: 4px;">Junior Mastery</strong>
          <span style="font-size: 0.78rem; color: #64748b;">Ages 7–11 · Key Stage 2</span>
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 10px; padding: 1.15rem; background: #ffffff;">
          <strong style="color: #0f172a; display: block; font-size: 0.95rem; margin-bottom: 4px;">Secondary Foundations</strong>
          <span style="font-size: 0.78rem; color: #64748b;">Ages 11–14 · Key Stage 3</span>
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 10px; padding: 1.15rem; background: #ffffff;">
          <strong style="color: #0f172a; display: block; font-size: 0.95rem; margin-bottom: 4px;">GCSE &amp; Senior Revision</strong>
          <span style="font-size: 0.78rem; color: #64748b;">Ages 14–16 · Key Stage 4</span>
        </div>
      </div>
    </section>

    <!-- Featured Interactive Simulations Section -->
    <section id="featured-simulations-section" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.25rem 2rem; margin-bottom: 3.5rem; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.76rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #16a34a;">Release Notes</span>
          <span style="color: #cbd5e1;">·</span>
          <span style="font-size: 0.82rem; color: #64748b;">September 2026</span>
        </div>
        <a href="${t}news" style="font-size: 0.84rem; font-weight: 600; color: #0284c7; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
          <span>View All Dispatches</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem 0; line-height: 1.3;">
        AST Vector Player &amp; SlideScript: 15KB Interactive Simulations Replacing Heavy Video
      </h2>
      <p style="font-size: 1rem; color: #64748b; line-height: 1.6; max-width: 820px; margin: 0 0 1.75rem 0;">
        Traditional educational video streams consume 50–100MB per lesson and stall on slow broadband. Our procedural vector player loads 60 FPS animated SVG lessons in under 15KB.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.75rem;">
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="font-weight: 700; font-size: 0.92rem; color: #0f172a; margin-bottom: 0.35rem;">&lt;15 KB Micro-Vectors</div>
          <div style="font-size: 0.84rem; color: #64748b; line-height: 1.5;">Instant loading, zero buffering, and razor sharp at 4K on any school Chromebook.</div>
        </div>
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="font-weight: 700; font-size: 0.92rem; color: #0f172a; margin-bottom: 0.35rem;">SlideScript for Teachers</div>
          <div style="font-size: 0.84rem; color: #64748b; line-height: 1.5;">Write slides in plain Markdown. Our on-device compiler converts them to interactive ASTs.</div>
        </div>
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="font-weight: 700; font-size: 0.92rem; color: #0f172a; margin-bottom: 0.35rem;">Clicker Step Mode</div>
          <div style="font-size: 0.84rem; color: #64748b; line-height: 1.5;">Control slides with your physical classroom clicker, pausing for turn-and-talk questions.</div>
        </div>
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="font-weight: 700; font-size: 0.92rem; color: #0f172a; margin-bottom: 0.35rem;">OBS Studio Sync</div>
          <div style="font-size: 0.84rem; color: #64748b; line-height: 1.5;">Stream lessons with lower-third overlays and real-time chapter syncing for remote learners.</div>
        </div>
      </div>

      <!-- Live Stage Dropdown & Viewport Container -->
      <div id="featured-simulations" style="background: #090d16; border-radius: 16px; border: 1px solid #1e293b; padding: 1.25rem; margin-bottom: 1.75rem; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #1e293b;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.4rem;">🎮</span>
            <div>
              <span style="display: block; font-size: 0.74rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">Curriculum Simulation Selector</span>
              <strong style="font-size: 0.98rem; color: #f8fafc;">Choose a Simulation to Run Live on Stage:</strong>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <select id="landing-sim-selector" style="padding: 8px 14px; border-radius: 8px; background: #1e293b; color: #ffffff; border: 1.5px solid #0284c7; font-weight: 700; font-size: 0.86rem; cursor: pointer;">
              ${r}
            </select>
            <a href="${t}media-player" style="padding: 7px 12px; font-size: 0.78rem; background: #334155; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 700;">↗ Fullscreen Studio</a>
          </div>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
          ${i}
        </div>

        <div style="border-radius: 12px; overflow: hidden; min-height: 480px; background: #090d16;">
          <iframe 
            id="landing-stage-viewport"
            src="${t}player.html?preset=kinetic-gas" 
            style="width: 100%; height: 480px; border: none; display: block;" 
            title="Featured Interactive Simulation">
          </iframe>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="${t}media-player" class="stj-btn" style="padding: 10px 20px; background: #0284c7; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700;">Launch AST Vector Player →</a>
        <a href="${t}news" class="stj-btn" style="padding: 10px 20px; background: #0f172a; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700;">Technical Architecture Dispatch</a>
      </div>
    </section>

    <!-- Developing-Nation Safe Architecture Banner -->
    <section style="background: #0b0f19; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 2.25rem 2.5rem; margin-bottom: 3.5rem; color: #f8fafc; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
      <div style="max-width: 680px;">
        <div style="display: flex; gap: 8px; font-size: 0.78rem; font-weight: 700; align-items: center; margin-bottom: 8px;">
          <span>🌱</span>
          <span style="color: #38bdf8; text-transform: uppercase;">Works Offline</span>
          <span style="color: #475569;">·</span>
          <span style="color: #94a3b8;">Zero Data Waste</span>
          <span style="color: #475569;">·</span>
          <span style="color: #94a3b8;">Sub-20ms Launch</span>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">Tiny Lesson Seeds: Learn Anywhere, Even Without Internet!</h2>
        <p style="font-size: 0.94rem; color: #94a3b8; line-height: 1.6; margin: 0;">
          Instead of draining expensive phone data with giant video files, each lesson runs into interactive vector simulations with zero cloud bandwidth needed.
        </p>
      </div>
      <a href="${t}learning-zone" style="padding: 0.75rem 1.6rem; background: #0284c7; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none;">See How Tiny Lessons Work ➔</a>
    </section>

    <!-- Core 4 Capabilities Grid -->
    <section style="margin-bottom: 4rem;">
      <h2 style="font-size: 1.75rem; text-align: center; margin-bottom: 2.5rem; color: #0f172a; font-weight: 800;">Everything You Need to Succeed</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <div style="padding: 1.75rem; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff;">
          <div style="font-size: 2.2rem; margin-bottom: 0.85rem;">⚡</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #1d4ed8;">Instant Practice Arena</h3>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; margin: 0;">Bite-sized questions with instant feedback and friendly clues whenever you get stuck.</p>
        </div>
        <div style="padding: 1.75rem; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff;">
          <div style="font-size: 2.2rem; margin-bottom: 0.85rem;">📖</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #0369a1;">Step-by-Step Lessons</h3>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; margin: 0;">Clear explanations with real-world examples, diagrams, and common tricky bits explained.</p>
        </div>
        <div style="padding: 1.75rem; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff;">
          <div style="font-size: 2.2rem; margin-bottom: 0.85rem;">🎓</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #047857;">Friendly Voice Tutor</h3>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; margin: 0;">Listen to lessons read aloud with gentle spoken hints that guide you without spoiling answers.</p>
        </div>
        <div style="padding: 1.75rem; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff;">
          <div style="font-size: 2.2rem; margin-bottom: 0.85rem;">🎯</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #6d28d9;">Helpful Slip Explanations</h3>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; margin: 0;">We spot common slips (like adding fraction bottoms) and show you exactly how to fix them.</p>
        </div>
      </div>
    </section>

    <!-- Catholic Sanctuary Banner -->
    <section style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #172554 100%); border: 1px solid rgba(250, 204, 21, 0.25); border-radius: 16px; padding: 2.5rem; margin-bottom: 3.5rem; color: #ffffff; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
      <div style="max-width: 680px;">
        <div style="display: flex; gap: 8px; font-size: 0.78rem; font-weight: 700; align-items: center; margin-bottom: 8px;">
          <span>✝️</span>
          <span style="color: #fde047; text-transform: uppercase;">Catholic Faith &amp; Life</span>
          <span style="color: rgba(255,255,255,0.4);">·</span>
          <span style="color: #cbd5e1;">All Year Groups &amp; Families</span>
        </div>
        <h2 style="font-size: 1.65rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">Catholic Life, Liturgy &amp; Sacraments in One Place</h2>
        <p style="font-size: 0.96rem; color: #cbd5e1; line-height: 1.6; margin: 0;">
          Explore the Holy Mass step-by-step, the 7 Sacraments, the Holy Rosary, God's 10 Commandments, Church seasons, Latin Mass prayers, and CST care for creation.
        </p>
      </div>
      <a href="${t}catholic-life" style="padding: 0.75rem 1.65rem; border-radius: 8px; background: #facc15; color: #0f172a; font-weight: 700; text-decoration: none;">Enter Catholic Sanctuary ➔</a>
    </section>

    <!-- St Joseph's Global Mission Banner -->
    <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.5rem; margin-bottom: 3.5rem; text-align: center;">
      <div style="display: flex; gap: 8px; font-size: 0.8rem; font-weight: 700; justify-content: center; align-items: center; margin-bottom: 1rem;">
        <span>🕊️</span>
        <span style="color: #16a34a; text-transform: uppercase;">St Joseph's Promise</span>
        <span style="color: #cbd5e1;">·</span>
        <span style="color: #64748b;">100% Free Forever</span>
        <span style="color: #cbd5e1;">·</span>
        <span style="color: #64748b;">Zero Ads or Paywalls</span>
      </div>
      <h2 style="font-size: 1.85rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem 0;">Free for All Children, Catholic Parishes &amp; Families</h2>
      <p style="font-size: 1.05rem; color: #334155; max-width: 720px; line-height: 1.6; margin: 0 auto 1.75rem auto;">
        We believe high-quality learning is a gift for every child. St Joseph's portal is 100% free with no subscriptions, no adverts, no account sign-ups, and works offline to protect your family's privacy.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="${t}licensing" style="padding: 0.75rem 1.75rem; border-radius: 8px; background: #15803d; color: #ffffff; font-weight: 700; text-decoration: none;">🕊️ Read Our School Mission</a>
        <a href="${t}privacy" style="padding: 0.75rem 1.75rem; border-radius: 8px; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; font-weight: 600; text-decoration: none;">🛡️ Safe, Private &amp; On Your Device</a>
      </div>
    </section>

    <!-- Licensing Footer -->
    <div style="padding-top: 2rem; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.875rem; color: #64748b; line-height: 1.6;">
      St Joseph's Learning Portal &bull; Open-source, privacy-first educational technology.
      Curriculum materials licensed under <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noreferrer" style="color: #0284c7; font-weight: 600;">OGL v3.0 (Oak National Academy)</a>.
    </div>
  `;let a=n.querySelector(`#landing-stage-viewport`),o=n.querySelector(`#landing-sim-selector`),s=n.querySelectorAll(`.sim-pill-btn`);o&&!o.getAttribute(`aria-label`)&&o.setAttribute(`aria-label`,`Select Curriculum Simulation`);function c(e){a&&(a.src=`${t}player.html?preset=${e}`),o&&(o.value=e),s.forEach(t=>{let n=t.dataset.preset===e;t.style.background=n?`#0284c7`:`#1e293b`,t.style.color=n?`#ffffff`:`#94a3b8`,t.style.borderColor=n?`#38bdf8`:`#334155`})}return o?.addEventListener(`change`,e=>{c(e.target.value)}),s.forEach(e=>{e.addEventListener(`click`,()=>{e.dataset.preset&&c(e.dataset.preset)})}),n}export{t as default,t as renderHomePage};