import { getBaseUrl } from '../utils/url';
import { PRESET_OPTIONS } from '../data/player/generatedScenes';

interface CartridgeRoute {
  id: string;
  title: string;
  mount: string;
  tier?: string;
  subject?: string;
  badge?: string;
}

export function renderHomePage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'home-landing-stage';
  container.style.cssText = 'padding: 2.5rem 1rem 4rem; max-width: 1200px; margin: 0 auto; color: #0f172a;';

  // 1. Dynamic Cartridge Feed from Canonical Scenes Manifest
  let activePreset = 'welcome';
  let cartridges: CartridgeRoute[] = PRESET_OPTIONS.slice(0, 24).map((p) => ({
    id: p.id,
    title: p.label,
    mount: p.mount || `/curriculum/${p.id}`,
    subject: p.subject || 'STEM & Curriculum',
    badge: p.stage || 'Curriculum',
  }));

  // 2. Render Semantic Shell
  container.innerHTML = `
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
        Interactive UK National Curriculum portal and zero-cloud educational engine. Featuring 60 FPS vector simulators, Catholic sanctuary catechesis, diagnostic practice drills, and in-vision British Sign Language.
      </p>

      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
        <a href="${base}catholic-life" style="padding: 11px 22px; background: #b45309; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(180,83,9,0.25);">
          <span>✝️ Catholic Sanctuary</span>
        </a>
        <a href="${base}player" style="padding: 11px 22px; background: #0284c7; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(2,132,199,0.25);">
          <span>🎮 Launch Simulators</span>
        </a>
        <a href="${base}practice-lab" style="padding: 11px 20px; background: #0f172a; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <span>⚡ Practice Lab</span>
        </a>
        <a href="${base}learning-zone" style="padding: 11px 20px; background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
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
            <span style="display: block; font-size: 0.72rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">Curriculum Vector Apparatus</span>
            <strong style="font-size: 1.05rem; color: #f8fafc;">Interactive 60 FPS Simulation Stage</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <select id="sim-selector" aria-label="Select Curriculum Simulation" style="padding: 8px 14px; border-radius: 8px; background: #1e293b; color: #fff; border: 1.5px solid #0284c7; font-weight: 700; font-size: 0.86rem; cursor: pointer;">
          </select>
          <a href="${base}player" style="padding: 8px 14px; font-size: 0.82rem; background: #334155; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 700;">↗ Fullscreen Studio</a>
        </div>
      </div>

      <!-- Quick Selector Pills -->
      <nav id="sim-pill-nav" aria-label="Quick simulation selector" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;"></nav>

      <!-- Viewport Stage -->
      <div style="border-radius: 12px; overflow: hidden; min-height: 480px; background: #090d16;">
        <iframe 
          id="stage-viewport"
          src="${base}player.html?preset=welcome" 
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
        <a href="${base}catholic-life" style="padding: 10px 20px; background: #ca8a04; color: #0f172a; font-weight: 800; border-radius: 8px; text-decoration: none; font-size: 0.88rem;">
          Enter Sanctuary →
        </a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
        <a href="${base}catholic-life?tab=altar-anatomy" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🕯️</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">High Altar &amp; Sanctuary</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">Interactive 16-point anatomical guide to sacred altar vessels, tabernacle, and rubrics.</p>
        </a>

        <a href="${base}catholic-life?tab=latin-prayers" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🇻🇦</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">Latin Mass Prayers Chapel</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">10 traditional Latin prayers with phonetic pronunciation guides and procedural audio recitation.</p>
        </a>

        <a href="${base}catholic-life?tab=church-tour" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🏛️</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">Church Architecture 3D Tour</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">Interactive vector tour exploring the nave, narthex, sanctuary, ambry, and crucifix.</p>
        </a>

        <a href="${base}catholic-life?tab=cst" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(202,138,4,0.3); border-radius: 10px; padding: 1.1rem; text-decoration: none; color: inherit; display: block; transition: all 0.15s ease;">
          <span style="font-size: 1.6rem; display: block; margin-bottom: 6px;">🌱</span>
          <strong style="display: block; font-size: 1rem; color: #fde047; margin-bottom: 4px;">Catholic Social Teaching (CST)</strong>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.4;">Caritas principles of Human Dignity, Common Good, and Solidarity aligned to school virtues.</p>
        </a>
      </div>
    </section>

    <!-- Primary Curriculum Pathways Directory Grid -->
    <section style="margin-bottom: 3.5rem;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="font-size: 0.78rem; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
          All Subjects &bull; EYFS to Key Stage 4
        </span>
        <h2 style="font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0 0 8px;">
          Curriculum Learning Pathways
        </h2>
        <p style="font-size: 1.05rem; color: #64748b; max-width: 650px; margin: 0 auto;">
          Choose an interactive learning zone to start drills, review foundational rules, or practice.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 1.25rem;">
        
        <!-- Simulators Card -->
        <a href="${base}player" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🎮
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">AST Vector Simulators</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              60 procedural vector apparatuses: kinetic gas, circuits, photosynthesis, Pythagoras, pendulum dyno, atom, and solar system.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #0284c7;">Explore 60 Simulators →</span>
        </a>

        <!-- Practice Lab Card -->
        <a href="${base}practice-lab" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              ⚡
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Interactive Practice Lab</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Procedural drills with diagnostic mistake checks, step-by-step hints, and mathematical calculation variations.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #059669;">Start Practice Drills →</span>
        </a>

        <!-- Lessons & Units Card -->
        <a href="${base}learning-zone" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              📖
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Lessons &amp; Units</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Explore National Curriculum units across Key Stages 1 to 4 with core axioms, common cognitive traps, and concept maps.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #d97706;">Browse Curriculum Units →</span>
        </a>

        <!-- Phonics Sound Mat Card -->
        <a href="${base}phonics" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fce7f3; color: #db2777; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🔤
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">EYFS &amp; KS1 Phonics Lab</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Systematic synthetic phonics sound mat across Phases 2 through 5 with audio pronunciation and decodable word builders.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #db2777;">Open Phonics Lab →</span>
        </a>

        <!-- Languages & MFL Card -->
        <a href="${base}languages" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🌍
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Languages &amp; Verb Wheels</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Polyglot studio for Spanish, French, German, and Latin featuring interactive verb conjugation wheels and tense drills.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #7c3aed;">Open Language Studio →</span>
        </a>

        <!-- Shakespeare Theatre Card -->
        <a href="${base}shakespeare" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fff1f2; color: #e11d48; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              🎭
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Shakespeare Globe Theatre</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Explore Macbeth, Romeo and Juliet, and Hamlet with line-by-line stage directions, themes, and soliloquy annotations.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #e11d48;">Enter Globe Theatre →</span>
        </a>

        <!-- SlideScript Cartridge Studio Card -->
        <a href="${base}player" style="background: #ffffff; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(16,185,129,0.08); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              ✏️
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">SlideScript Cartridge Studio</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Children write plain-English markdown or prompt on-device Gemini Nano to create and remix 60 FPS science and math cartridges with zero code syntax barriers.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #059669;">Create a Cartridge →</span>
        </a>

        <!-- Teacher Beacon Card -->
        <a href="${base}teacher-beacon" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              📡
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Teacher Beacon Console</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Air-gapped classroom synchronization via local WebRTC mesh to broadcast live simulation presets to student screens.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #4338ca;">Launch Beacon →</span>
        </a>

        <!-- Student Progress & Badges Card -->
        <a href="${base}profile" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease, box-shadow 0.15s ease;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #fefce8; color: #a16207; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
              ⭐
            </div>
            <strong style="font-size: 1.15rem; color: #0f172a; display: block; margin-bottom: 6px;">Student Progress &amp; Badges</strong>
            <p style="font-size: 0.88rem; color: #64748b; margin: 0 0 1rem; line-height: 1.5;">
              Local mastery tracking, streak counters, and curriculum standard badges stored privately in your browser with zero telemetry.
            </p>
          </div>
          <span style="font-size: 0.84rem; font-weight: 700; color: #a16207;">View Your Badges →</span>
        </a>

      </div>
    </section>

    <!-- Core Educational Guarantees & Safeguards -->
    <section style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.25rem 2rem; margin-bottom: 2rem;">
      <h3 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0 0 1.25rem; text-align: center;">
        St Joseph's Educational &amp; Architectural Guarantees
      </h3>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">🕊️</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">Education Should Be Free</strong>
          <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">
            No subscriptions, no paywalls, no tracking. Perpetually free under the Open Government Licence (OGL v3.0).
          </p>
        </div>

        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">💾</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">100% Zero-Data Offline First</strong>
          <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">
            Engineered to run entirely from device storage without internet connectivity, ideal for developing nations and low-bandwidth environments.
          </p>
        </div>

        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">🛡️</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">Zero Cloud Leakage &amp; Edge AI</strong>
          <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">
            Pupil diagnostics, answers, and voice inputs never egress to cloud servers, strictly complying with UK GDPR Art. 25 and KCSIE standards.
          </p>
        </div>

        <div>
          <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">🖐️</span>
          <strong style="font-size: 0.98rem; color: #0f172a; display: block; margin-bottom: 4px;">In-Vision BSL &amp; Accessibility</strong>
          <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">
            Real-time procedural 3D vector sign language avatar with Level 6 spatial grammar and multilingual live translation across 9 languages.
          </p>
        </div>
      </div>
    </section>
  `;

  // 3. Elements
  const iframe = container.querySelector<HTMLIFrameElement>('#stage-viewport');
  const select = container.querySelector<HTMLSelectElement>('#sim-selector');
  const pillNav = container.querySelector<HTMLElement>('#sim-pill-nav');

  function updateActivePreset(id: string) {
    const cleanId = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    activePreset = cleanId;
    if (iframe) iframe.src = `${base}player.html?preset=${encodeURIComponent(cleanId)}`;
    if (select) select.value = cleanId;

    // Update pill buttons visual state
    pillNav?.querySelectorAll<HTMLButtonElement>('.sim-pill').forEach((btn) => {
      const isSelected = btn.dataset.id === cleanId;
      btn.style.background = isSelected ? '#0284c7' : '#1e293b';
      btn.style.color = isSelected ? '#ffffff' : '#94a3b8';
      btn.style.borderColor = isSelected ? '#38bdf8' : '#334155';
    });
  }

  function renderSelectors() {
    if (!select || !pillNav) return;

    // Dropdown options
    select.replaceChildren();
    for (const c of cartridges) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.title} (${c.subject || 'STEM'})`;
      if (c.id === activePreset) opt.selected = true;
      select.appendChild(opt);
    }

    // Quick selection pills
    pillNav.replaceChildren();
    for (const c of cartridges.slice(0, 12)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sim-pill';
      btn.dataset.id = c.id;
      const isSelected = c.id === activePreset;
      btn.style.cssText = `background: ${isSelected ? '#0284c7' : '#1e293b'}; color: ${isSelected ? '#ffffff' : '#94a3b8'}; border: 1px solid ${isSelected ? '#38bdf8' : '#334155'}; border-radius: 9999px; padding: 4px 12px; font-size: 0.74rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease;`;
      btn.textContent = c.title.split(':')[0];
      btn.onclick = () => updateActivePreset(c.id);
      pillNav.appendChild(btn);
    }
  }

  select?.addEventListener('change', (e) => {
    updateActivePreset((e.target as HTMLSelectElement).value);
  });

  // 4. Render selectors directly from canonical precompiled cartridge manifest
  renderSelectors();
  return container;
}

export default renderHomePage;
