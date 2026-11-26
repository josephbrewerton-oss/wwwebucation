import{c as e,h as t}from"./cartridge-vault-C7eDfUWc.js";function n(){let n=t(),r=document.createElement(`div`);r.className=`home-landing-stage`,r.style.cssText=`padding: 2.5rem 1rem 4rem; max-width: 1200px; margin: 0 auto; color: #0f172a;`;let i=e.filter(e=>e.isPlayableScene&&e.isCore),a=i.filter(e=>e.featured),o=a.length>0?a:[...i.filter(e=>e.id===`welcome`).slice(0,1),...i.filter(e=>e.id===`jacobs-ladder-primes`).slice(0,1),...i.filter(e=>e.id===`breadboard-components`).slice(0,1),...i.filter(e=>e.section===`Catholic Life & Faith Formation`).slice(0,4),...i.filter(e=>e.section===`Mathematics & Geometry`&&e.id!==`jacobs-ladder-primes`).slice(0,3),...i.filter(e=>e.section===`Natural Sciences & Physics`&&e.id!==`breadboard-components`).slice(0,3)],s=o.length>0?o:i.slice(0,12),c=s[0]?.id||`welcome`,l=s.map(e=>({id:e.id,title:e.label,mount:e.mount||`/curriculum/${e.id}`,subject:e.subject||`STEM & Curriculum`,badge:e.stage||`Curriculum`}));r.innerHTML=`
    <!-- Hero Header -->
    <header style="text-align: center; margin-bottom: 3.5rem;">
      <div style="margin-bottom: 1.25rem; display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; font-size: 0.85rem; color: #64748b;">
        <span style="color: #14532d; font-weight: 700; background: #dcfce7; border: 1px solid #86efac; padding: 2px 10px; border-radius: 9999px;">🕊️ Education should be free</span>
        <span style="color: #0c4a6e; font-weight: 700; background: #e0f2fe; border: 1px solid #7dd3fc; padding: 2px 10px; border-radius: 9999px;">🇬🇧 UK National Curriculum</span>
        <span style="color: #78350f; font-weight: 700; background: #fef3c7; border: 1px solid #fde68a; padding: 2px 10px; border-radius: 9999px;">⛪ Catholic Sanctuary</span>
        <span style="color: #064e3b; font-weight: 700; background: #d1fae5; border: 1px solid #6ee7b7; padding: 2px 10px; border-radius: 9999px;">💾 100% Offline (0 Data)</span>
      </div>

      <h1 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: #0f172a; margin: 0 0 1rem; letter-spacing: -0.025em; line-height: 1.15;">
        Learn with Confidence at St Joseph's
      </h1>
      <p style="font-size: 1.15rem; color: #475569; max-width: 780px; margin: 0 auto 2rem; line-height: 1.6;">
        Free UK National Curriculum lessons, interactive science and maths labs, Catholic sanctuary catechesis, diagnostic practice quizzes, and on-screen British Sign Language—working 100% offline.
      </p>

      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
        <a href="${n}catholic-life" style="padding: 11px 22px; background: #b45309; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(180,83,9,0.25);">
          <span>✝️ Catholic Sanctuary</span>
        </a>
        <a href="${n}player" style="padding: 11px 22px; background: #0369a1; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(3,105,161,0.25);">
          <span>🎮 Open Interactive Labs</span>
        </a>
        <a href="${n}practice-lab" style="padding: 11px 20px; background: #0f172a; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <span>⚡ Practice Lab</span>
        </a>
        <a href="${n}learning-zone" style="padding: 11px 20px; background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <span>📖 Curriculum Lessons</span>
        </a>
      </div>
    </header>

    <!-- Stage Simulation Viewport -->
    <section id="featured-simulations" style="background: #090d16; border-radius: 16px; border: 1.5px solid #1e293b; padding: 1.25rem; margin-bottom: 3.5rem; box-shadow: 0 12px 32px rgba(0,0,0,0.25);">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">🎮</span>
          <div>
            <span style="display: block; font-size: 0.72rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">Featured Classroom Activity</span>
            <strong style="font-size: 1.05rem; color: #f8fafc;">Explore &amp; Experiment Live</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <select id="sim-selector" aria-label="Select Curriculum Simulation" style="padding: 8px 14px; border-radius: 8px; background: #1e293b; color: #fff; border: 1.5px solid #0284c7; font-weight: 700; font-size: 0.86rem; cursor: pointer;">
          </select>
          <a id="open-full-activity" href="${n}player?preset=${encodeURIComponent(c)}" style="padding: 8px 14px; font-size: 0.82rem; background: #334155; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 700;">↗ Open Full Activity</a>
        </div>
      </div>

      <!-- Quick Selector Pills -->
      <nav id="sim-pill-nav" aria-label="Quick simulation selector" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;"></nav>

      <!-- Viewport Stage -->
      <div style="border-radius: 12px; overflow: hidden; min-height: 480px; background: #090d16;">
        <iframe 
          id="stage-viewport"
          src="about:blank"
          data-initial-src="${n}player.html?preset=${encodeURIComponent(c)}"
          loading="lazy"
          style="width: 100%; height: 500px; border: none; display: block;" 
          title="Featured Interactive Simulation">
        </iframe>
      </div>
    </section>

    <!-- Catholic Sanctuary Highlight Section -->
    <section style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border: 1.5px solid #ca8a04; border-radius: 16px; padding: 2.25rem 2rem; color: #ffffff; margin-bottom: 3.5rem; box-shadow: 0 8px 24px rgba(202,138,4,0.15);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(202, 138, 4, 0.2); border: 1px solid #ca8a04; padding: 3px 12px; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; color: #fde047; text-transform: uppercase; margin-bottom: 8px;">
            <span>✝️</span> Catholic Ethos &amp; Catechesis
          </div>
          <h2 style="font-size: 1.85rem; font-weight: 800; margin: 0 0 6px; color: #ffffff;">
            St Joseph's Catholic Life &amp; Faith Sanctuary
          </h2>
          <p style="color: #cbd5e1; font-size: 0.96rem; max-width: 720px; margin: 0; line-height: 1.5;">
            Explore the sacred traditions, High Altar rubrics, Latin prayers, liturgical calendar, and Catholic Social Teaching (CST) foundational to our school community.
          </p>
        </div>
        <a href="${n}catholic-life" style="padding: 10px 20px; background: #ca8a04; color: #0f172a; font-weight: 800; border-radius: 8px; text-decoration: none; font-size: 0.88rem;">
          Enter Sanctuary →
        </a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
        <a href="${n}catholic-life?tab=altar-anatomy" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🕯️</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">High Altar &amp; Sanctuary</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">Interactive 16-point anatomical guide to sacred altar vessels, tabernacle, and rubrics.</p>
        </a>

        <a href="${n}catholic-life?tab=latin-prayers" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🇻🇦</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">Latin Mass Prayers Chapel</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">10 traditional Latin prayers with phonetic pronunciation guides and procedural audio recitation.</p>
        </a>

        <a href="${n}catholic-life?tab=church-tour" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🏛️</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">Church Architecture 3D Tour</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">Interactive vector tour exploring the nave, narthex, sanctuary, ambry, and crucifix.</p>
        </a>

        <a href="${n}catholic-life?tab=cst" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🌱</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">Catholic Social Teaching (CST)</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">Caritas principles of Human Dignity, Common Good, and Solidarity aligned to school virtues.</p>
        </a>
      </div>
    </section>

    <!-- Primary Curriculum Pathways Directory Grid -->
    <section style="margin-bottom: 3.5rem;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="font-size: 0.78rem; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
          All Subjects &bull; EYFS to Key Stage 4
        </span>
        <h2 style="font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0 0 8px;">
          Curriculum Learning Pathways
        </h2>
        <p style="font-size: 1.05rem; color: #475569; max-width: 650px; margin: 0 auto;">
          Choose an interactive learning zone to start drills, review foundational rules, or practice.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 1.25rem;">
        
        <!-- Simulators Card -->
        <a href="${n}player" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🎮
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Interactive Science &amp; Maths Labs</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Explore 60 hands-on models: kinetic gases, electric circuits, photosynthesis, Pythagoras, pendulums, atoms, and the solar system.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #0369a1;">Explore 60 Interactive Labs →</span>
        </a>

        <!-- Practice Lab Card -->
        <a href="${n}practice-lab" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #ecfdf5; color: #047857; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              ⚡
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Interactive Practice Lab</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Guided practice quizzes with instant hints, step-by-step worked examples, and common-mistake checks.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #047857;">Start Practice Drills →</span>
        </a>

        <!-- GCSE Exam Prep & Flashcards Card -->
        <a href="${n}revision" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #f3e8ff; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              📝
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">GCSE Exam Prep &amp; Flashcards</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              AQA, Edexcel &amp; OCR 6-mark walkthroughs with mark schemes, active-recall flashcards, and audio spelling dictation.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #7c3aed;">Open Exam &amp; Flashcard Studio →</span>
        </a>

        <!-- Lessons & Units Card -->
        <a href="${n}learning-zone" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              📖
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Lessons &amp; Units</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Browse National Curriculum units across Key Stages 1 to 4 with key concepts, worked methods, and common-mistake alerts.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #b45309;">Browse Curriculum Units →</span>
        </a>

        <!-- Phonics Sound Mat Card -->
        <a href="${n}phonics" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fce7f3; color: #be185d; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🔤
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">EYFS &amp; KS1 Phonics Lab</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Systematic synthetic phonics sound mat across Phases 2 through 5 with audio pronunciation and decodable word builders.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #be185d;">Open Phonics Lab →</span>
        </a>

        <!-- Languages & MFL Card -->
        <a href="${n}languages" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🌍
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Languages &amp; Verb Wheels</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Polyglot studio for Spanish, French, German, and Latin featuring interactive verb conjugation wheels and tense drills.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #7c3aed;">Open Language Studio →</span>
        </a>

        <!-- Shakespeare Theatre Card -->
        <a href="${n}shakespeare" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fff1f2; color: #be123c; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🎭
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Shakespeare Globe Theatre</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Explore Macbeth, Romeo and Juliet, and Hamlet with line-by-line stage directions, themes, and soliloquy annotations.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #be123c;">Enter Globe Theatre →</span>
        </a>

        <!-- SlideScript Lesson Studio Card -->
        <a href="${n}player?tool=create" style="background: #ffffff; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(16,185,129,0.08); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #ecfdf5; color: #047857; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              ✏️
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Create Your Own Lesson</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Author new native pure-SVG (.ast) interactive lessons from plain-English notes or remix existing labs offline—no Flash or coding required.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #047857;">Open Lesson Creator →</span>
        </a>

        <!-- Upgrade Legacy Flash (.swf) Card -->
        <a href="${n}player?import=swf" style="background: #ffffff; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(217,119,6,0.08); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fffbeb; color: #b45309; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              ⚡
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Got an Old Flash (.swf) File?</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Have a retired .swf classroom resource you can no longer run? Drop it in locally to play it in pure SVG (Beta) or upgrade it into an open, bytecode-free .ast offline cartridge.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #b45309;">Upgrade a Legacy .swf →</span>
        </a>

        <!-- Curriculum & Cartridge Studio Card -->
        <a href="${n}curriculum-studio" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #f1f5f9; color: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🛠️
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Curriculum &amp; Cartridge Studio</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Package custom native .astb offline cartridges and import overseas or school syllabi (CSV/JSON) for zero-data classroom distribution.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #0f172a;">Open Author Studio →</span>
        </a>

        <!-- Teacher Beacon Card -->
        <a href="${n}teacher-beacon" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              📡
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Whole-Class Sync (Teacher Beacon)</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Share the current lesson or interactive activity straight to pupil screens on the classroom network without needing the internet.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #4338ca;">Launch Classroom Beacon →</span>
        </a>

        <!-- Student Progress & Badges Card -->
        <a href="${n}profile" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fefce8; color: #854d0e; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              ⭐
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Student Progress &amp; Badges</strong>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 1rem; line-height: 1.5;">
              Personal mastery tracking, streak counters, and curriculum topic badges saved privately on your device with zero tracking.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #854d0e;">View Your Badges →</span>
        </a>

      </div>
    </section>

    <!-- Core Educational Guarantees & Safeguards -->
    <section style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.25rem 2rem; margin-bottom: 2rem;">
      <h3 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0 0 1.25rem; text-align: center;">
        Our School &amp; Safeguarding Promises
      </h3>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">🕊️</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">Education Should Be Free</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.5;">
            No subscriptions, no paywalls, no tracking. Perpetually free under the Open Government Licence (OGL v3.0).
          </p>
        </div>

        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">💾</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">100% Zero-Data Offline First</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.5;">
            Works directly from your device storage with no mobile data or Wi-Fi needed—ideal for school classrooms and remote communities.
          </p>
        </div>

        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">🛡️</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">Private &amp; KCSIE Safe</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.5;">
            Pupil work, quiz answers, and voice inputs never leave your device, complying with UK GDPR Art. 25 and KCSIE safeguarding standards.
          </p>
        </div>

        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">🖐️</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">British Sign Language &amp; Accessibility</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.5;">
            On-screen British Sign Language (BSL) interpreter and live offline translation across 45 languages for inclusive classrooms.
          </p>
        </div>
      </div>
    </section>
  `;let u=r.querySelector(`#stage-viewport`),d=r.querySelector(`#sim-selector`),f=r.querySelector(`#sim-pill-nav`),p=r.querySelector(`#open-full-activity`);function m(e){let t=String(e||``).replace(/[^a-zA-Z0-9_-]/g,``);c=t,u&&(u.src=`${n}player.html?preset=${encodeURIComponent(t)}`),d&&(d.value=t),p&&(p.href=`${n}player?preset=${encodeURIComponent(t)}`),f?.querySelectorAll(`.sim-pill`).forEach(e=>{let n=e.dataset.id===t;e.style.background=n?`#0369a1`:`#1e293b`,e.style.color=n?`#ffffff`:`#cbd5e1`,e.style.borderColor=n?`#38bdf8`:`#334155`})}function h(){if(d&&f){d.replaceChildren();for(let e of l){let t=document.createElement(`option`);t.value=e.id,t.textContent=`${e.title} (${e.subject||`STEM`})`,e.id===c&&(t.selected=!0),d.appendChild(t)}f.replaceChildren();for(let e of l.slice(0,12)){let t=document.createElement(`button`);t.type=`button`,t.className=`sim-pill`,t.dataset.id=e.id;let n=e.id===c;t.style.cssText=`background: ${n?`#0369a1`:`#1e293b`}; color: ${n?`#ffffff`:`#cbd5e1`}; border: 1px solid ${n?`#38bdf8`:`#334155`}; border-radius: 9999px; padding: 4px 12px; font-size: 0.74rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease;`,t.textContent=e.title.split(`:`)[0],t.onclick=()=>m(e.id),f.appendChild(t)}}}d?.addEventListener(`change`,e=>{m(e.target.value)}),h();let g=()=>{u&&u.isConnected&&u.getAttribute(`src`)===`about:blank`&&(u.src=`${n}player.html?preset=${encodeURIComponent(c)}`)};return typeof window<`u`&&`requestIdleCallback`in window?window.requestIdleCallback(g,{timeout:1800}):setTimeout(g,600),r}export{n as default,n as renderHomePage};