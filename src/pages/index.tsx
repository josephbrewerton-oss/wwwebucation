if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import ExpressLessonLaunchpad from '../components/ExpressLessonLaunchpad';
import HomeLearnerGuidedCard from '../components/HomeLearnerGuidedCard';
import AstVectorMediaPlayer from '../components/AstVectorMediaPlayer';

export default function Home() {
  const [landingSimPreset, setLandingSimPreset] = useState<string>('kinetic-gas');
  return (
    <PageMeta
      title="Home"
      description="St Joseph's Primary & Secondary Interactive Learning Portal"
    >
      <div style={{ padding: '3rem 1.5rem', maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Welcome Hero */}
        <section style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="stj-meta-strip" style={{ marginBottom: '1.25rem', justifyContent: 'center' }}>
            <span style={{ color: 'var(--stj-success)', fontWeight: 600 }}>Education should be free</span>
            <span className="stj-meta-separator" aria-hidden="true">·</span>
            <span>UK National Curriculum</span>
            <span className="stj-meta-separator" aria-hidden="true">·</span>
            <span>Works Offline</span>
            <span className="stj-meta-separator" aria-hidden="true">·</span>
            <Link
              to="/news"
              style={{
                color: 'var(--stj-primary)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>AST Vector Player Release</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h1 className="stj-hero-title">
            Learn with Confidence at St Joseph's
          </h1>
          <p className="stj-hero-sub">
            Interactive practice with instant feedback, step-by-step clues, and diagnostic mistake checks. 
            Tailored for Key Stages 1 to 4 in Mathematics, Science, English, Computing, and more.
          </p>

          {/* Focused Action Pair */}
          <div className="stj-hero-actions">
            <a
              href="#featured-simulations"
              className="stj-btn-hero-primary"
            >
              <span>Launch Interactive Simulators</span>
              <span aria-hidden="true">↓</span>
            </a>

            <a
              href="#express-lesson-launchpad"
              className="stj-btn-hero-secondary"
            >
              <span>Explore Curriculum Lessons</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* Quick-Jump Text Links */}
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '1.5rem',
              fontSize: '0.86rem',
              color: 'var(--stj-text-muted)',
            }}
          >
            <Link
              to="/practice-lab"
              style={{ color: 'var(--stj-text-muted)', textDecoration: 'none', fontWeight: 500 }}
            >
              Practice Question Bank
            </Link>
            <span className="stj-meta-separator" aria-hidden="true">·</span>
            <a
              href="#home-learner-guided-pathway"
              style={{ color: 'var(--stj-text-muted)', textDecoration: 'none', fontWeight: 500 }}
            >
              Guided Learning Pathway
            </a>
            <span className="stj-meta-separator" aria-hidden="true">·</span>
            <Link
              to="/catholic-life"
              style={{ color: 'var(--stj-text-muted)', textDecoration: 'none', fontWeight: 500 }}
            >
              Catholic Life &amp; Faith
            </Link>
          </div>
        </section>

        {/* 2-Click Express Lesson Launchpad */}
        <ExpressLessonLaunchpad />

        {/* Home-Learner Guided Pathway (For Disadvantaged & Out-of-School Children) */}
        <HomeLearnerGuidedCard />

        {/* Latest News & Release Section (September 2026) */}
        <section
          style={{
            background: 'var(--stj-surface)',
            border: '1px solid var(--stj-border)',
            borderRadius: 'var(--stj-radius-xl)',
            padding: '2.25rem 2rem',
            marginBottom: '3.5rem',
            boxShadow: 'var(--stj-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--stj-success)',
                }}
              >
                Release Notes
              </span>
              <span className="stj-meta-separator" aria-hidden="true">·</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--stj-text-muted)' }}>
                September 2026
              </span>
            </div>

            <Link
              to="/news"
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--stj-primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View All Dispatches</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--stj-text)', margin: '0 0 0.75rem 0', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
            AST Vector Player &amp; SlideScript: 15KB Interactive Simulations Replacing Heavy Video
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--stj-text-muted)', lineHeight: 1.6, maxWidth: '820px', margin: '0 0 1.75rem 0' }}>
            Traditional educational video streams consume 50–100MB per lesson and stall on slow broadband. Our new procedural vector player loads 60 FPS animated SVG lessons in under 15KB, with non-tech SlideScript authoring, presenter clicker step-mode, and OBS live streaming.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}>
            <div style={{ background: 'var(--stj-canvas)', padding: '1.25rem', borderRadius: 'var(--stj-radius-lg)', border: '1px solid var(--stj-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--stj-text)', marginBottom: '0.35rem' }}>&lt;15 KB Micro-Vectors</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', lineHeight: 1.5 }}>Instant loading, zero buffering, and razor sharp at 4K on any school Chromebook.</div>
            </div>
            <div style={{ background: 'var(--stj-canvas)', padding: '1.25rem', borderRadius: 'var(--stj-radius-lg)', border: '1px solid var(--stj-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--stj-text)', marginBottom: '0.35rem' }}>SlideScript for Teachers</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', lineHeight: 1.5 }}>Write slides in plain Markdown. Our on-device compiler converts them to interactive ASTs.</div>
            </div>
            <div style={{ background: 'var(--stj-canvas)', padding: '1.25rem', borderRadius: 'var(--stj-radius-lg)', border: '1px solid var(--stj-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--stj-text)', marginBottom: '0.35rem' }}>Clicker Step Mode</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', lineHeight: 1.5 }}>Control slides with your physical classroom clicker, pausing for turn-and-talk questions.</div>
            </div>
            <div style={{ background: 'var(--stj-canvas)', padding: '1.25rem', borderRadius: 'var(--stj-radius-lg)', border: '1px solid var(--stj-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--stj-text)', marginBottom: '0.35rem' }}>OBS Studio Sync</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', lineHeight: 1.5 }}>Stream lessons with lower-third overlays and real-time chapter syncing for remote learners.</div>
            </div>
          </div>

          {/* Featured Interactive Simulation Suite with Drop-Down Holder */}
          <div
            id="featured-simulations"
            style={{
              background: '#090d16',
              borderRadius: '16px',
              border: '1px solid #1e293b',
              padding: '1.25rem',
              marginBottom: '1.75rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Dropdown Holder Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1e293b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.4rem' }}>🎮</span>
                <div>
                  <label
                    htmlFor="landing-sim-dropdown-holder"
                    style={{
                      display: 'block',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: '#38bdf8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Curriculum Simulation Selector
                  </label>
                  <strong style={{ fontSize: '0.98rem', color: '#f8fafc' }}>
                    Choose a Simulation to Run Live on Stage:
                  </strong>
                </div>
              </div>

              {/* The Dropdown Holder */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  id="landing-sim-dropdown-holder"
                  value={landingSimPreset}
                  onChange={(e) => setLandingSimPreset(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    color: '#ffffff',
                    border: '1.5px solid #0284c7',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '260px',
                    maxWidth: '100%',
                    boxShadow: '0 0 12px rgba(2, 132, 199, 0.25)',
                  }}
                  title="Select curriculum simulation from dropdown holder"
                >
                  <optgroup label="🔬 Science & Physics" style={{ background: '#0f172a', color: '#38bdf8' }}>
                    <option value="kinetic-gas" style={{ background: '#0f172a', color: '#f8fafc' }}>💨 Kinetic Gas &amp; Boyle's Law</option>
                    <option value="electric-circuits" style={{ background: '#0f172a', color: '#f8fafc' }}>💡 Electrical Circuits &amp; Ohm's Law</option>
                    <option value="atom" style={{ background: '#0f172a', color: '#f8fafc' }}>⚛️ Bohr Atomic Electron Shells</option>
                    <option value="solar-system" style={{ background: '#0f172a', color: '#f8fafc' }}>🪐 Solar System Heliocentric Motion</option>
                    <option value="photosynthesis" style={{ background: '#0f172a', color: '#f8fafc' }}>🌱 Photosynthesis Solar Engine</option>
                    <option value="dna-helix" style={{ background: '#0f172a', color: '#f8fafc' }}>🧬 DNA Helix Base Pairing</option>
                    <option value="velocity" style={{ background: '#0f172a', color: '#f8fafc' }}>🏎️ Velocity Vectors &amp; Acceleration</option>
                    <option value="water-cycle" style={{ background: '#0f172a', color: '#f8fafc' }}>💧 Water Cycle Earth Engine</option>
                  </optgroup>
                  <optgroup label="📐 Mathematics & Geometry" style={{ background: '#0f172a', color: '#34d399' }}>
                    <option value="pythagoras" style={{ background: '#0f172a', color: '#f8fafc' }}>📐 Pythagoras' Theorem (a² + b² = c²)</option>
                    <option value="fractions" style={{ background: '#0f172a', color: '#f8fafc' }}>🍰 Fractions: Common Denominators</option>
                    <option value="algebra-balance" style={{ background: '#0f172a', color: '#f8fafc' }}>⚖️ Algebraic Balance Scale</option>
                    <option value="times-tables" style={{ background: '#0f172a', color: '#f8fafc' }}>🔢 Times Tables 2D Grid Splitter</option>
                    <option value="calculus-curves" style={{ background: '#0f172a', color: '#f8fafc' }}>📈 Calculus: Tangent Slopes &amp; Derivatives</option>
                    <option value="bodmas" style={{ background: '#0f172a', color: '#f8fafc' }}>⚡ BODMAS / BIDMAS Forcefield</option>
                    <option value="math-fishing" style={{ background: '#0f172a', color: '#f8fafc' }}>🎣 Math Pond: Number Bonds to 20</option>
                  </optgroup>
                  <optgroup label="⛪ Catholic Faith & Life" style={{ background: '#0f172a', color: '#facc15' }}>
                    <option value="church-tour" style={{ background: '#0f172a', color: '#f8fafc' }}>⛪ Catholic Church Sanctuary Tour (3D)</option>
                    <option value="stations-of-the-cross" style={{ background: '#0f172a', color: '#f8fafc' }}>✝️ Stations of the Cross (Via Crucis)</option>
                  </optgroup>
                  <optgroup label="🔤 English & Languages" style={{ background: '#0f172a', color: '#fbbf24' }}>
                    <option value="phonics-lab" style={{ background: '#0f172a', color: '#f8fafc' }}>🔤 Early Phonics Sound Buttons</option>
                    <option value="spelling-bee" style={{ background: '#0f172a', color: '#f8fafc' }}>🐝 Spelling Bee Championship</option>
                    <option value="shakespeare" style={{ background: '#0f172a', color: '#f8fafc' }}>🎭 Globe Theatre Shakespeare</option>
                    <option value="languages" style={{ background: '#0f172a', color: '#f8fafc' }}>🌍 Modern Foreign Languages Studio</option>
                  </optgroup>
                </select>

                <Link
                  to={`/media-player?preset=${landingSimPreset}`}
                  className="stj-btn stj-btn-secondary stj-btn-sm"
                  style={{ fontSize: '0.78rem', padding: '7px 12px', whiteSpace: 'nowrap' }}
                  title="Open this simulation in full-featured studio"
                >
                  <span>↗ Fullscreen Studio</span>
                </Link>
              </div>
            </div>

            {/* Quick Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {[
                { label: '💨 Kinetic Gas', id: 'kinetic-gas' },
                { label: '📐 Pythagoras', id: 'pythagoras' },
                { label: '⛪ Church Tour', id: 'church-tour' },
                { label: '🍰 Fractions', id: 'fractions' },
                { label: '💡 Circuits', id: 'electric-circuits' },
                { label: '🪐 Solar System', id: 'solar-system' },
                { label: '⚖️ Algebra Balance', id: 'algebra-balance' },
                { label: '🔤 Phonics Lab', id: 'phonics-lab' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setLandingSimPreset(pill.id)}
                  style={{
                    background: landingSimPreset === pill.id ? '#0284c7' : '#1e293b',
                    color: landingSimPreset === pill.id ? '#ffffff' : '#94a3b8',
                    border: `1px solid ${landingSimPreset === pill.id ? '#38bdf8' : '#334155'}`,
                    borderRadius: '9999px',
                    padding: '3px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Live Media Player Stage */}
            <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <AstVectorMediaPlayer
                key={`landing-sim-${landingSimPreset}`}
                preset={landingSimPreset}
                autoPlay={true}
                height="460px"
                allowPresetSwitch={true}
                onPresetChange={(p) => setLandingSimPreset(p)}
                embedded={true}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/media-player"
              className="stj-btn stj-btn-primary"
            >
              <span>Launch AST Vector Player</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/news"
              className="stj-btn stj-btn-secondary"
            >
              <span>Technical Architecture Dispatch</span>
            </Link>
            <a
              href="/player.html"
              target="_blank"
              rel="noreferrer"
              className="stj-btn stj-btn-secondary"
            >
              <span>SlideScript Standalone Studio</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        {/* Developing-Nation Safe Architecture: Works Offline & Tiny Data Banner */}
        <section
          style={{
            background: '#0b0f19',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--stj-radius-xl)',
            padding: '2.25rem 2.5rem',
            marginBottom: '3.5rem',
            color: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: 'var(--stj-shadow-md)',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <div className="stj-meta-strip" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🌱</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Works Offline
              </span>
              <span className="stj-meta-separator" aria-hidden="true">·</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>
                Zero Data Waste
              </span>
              <span className="stj-meta-separator" aria-hidden="true">·</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>
                Sub-20ms Launch
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Tiny Lesson Seeds: Learn Anywhere, Even Without Internet!
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Instead of draining expensive phone data with giant video files, each lesson is squashed into a tiny seed smaller than a text message. Your browser runs them into interactive guides and simulations with zero ongoing cloud bandwidth needed.
            </p>
          </div>

          <Link
            to="/learning-zone?tab=inflation"
            className="stj-btn-hero-primary"
            style={{
              padding: '0.75rem 1.6rem',
              fontSize: '0.92rem',
              whiteSpace: 'nowrap',
            }}
          >
            <span>See How Tiny Lessons Work</span>
            <span aria-hidden="true">➔</span>
          </Link>
        </section>

        {/* Core Capabilities Grid */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '2.5rem', color: '#0f172a', fontWeight: 800 }}>
            Everything You Need to Succeed
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Service 1: Practice Arena */}
            <div style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
              transition: 'transform 0.15s ease',
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.85rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1d4ed8' }}>
                Instant Practice Arena
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                Bite-sized questions with instant thumbs-up feedback, stars to collect, and friendly clues whenever you get stuck.
              </p>
            </div>

            {/* Service 2: Learning Zone */}
            <div style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
              transition: 'transform 0.15s ease',
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.85rem' }}>📖</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0369a1' }}>
                Step-by-Step Lessons
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                Clear explanations with real-world examples, diagrams, and common tricky bits explained before you try a quiz.
              </p>
            </div>

            {/* Service 3: Prof. Turing */}
            <div style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
              transition: 'transform 0.15s ease',
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.85rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#047857' }}>
                Friendly Voice Tutor
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                Listen to any lesson read aloud in clear, gentle speech with spoken hints that guide you without spoiling the answer.
              </p>
            </div>

            {/* Service 4: 100% Accurate Verified Math */}
            <div style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
              transition: 'transform 0.15s ease',
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.85rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#6d28d9' }}>
                Helpful Slip Explanations
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                Made a mistake? Don't worry! We spot common slips (like adding fraction bottoms) and show you exactly how to fix them.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Whole-School Catholic Life & Faith Sanctuary Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #172554 100%)',
            border: '1px solid rgba(250, 204, 21, 0.25)',
            borderRadius: 'var(--stj-radius-xl)',
            padding: '2.5rem',
            marginBottom: '3.5rem',
            boxShadow: 'var(--stj-shadow-md)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <div className="stj-meta-strip" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>✝️</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Catholic Faith &amp; Life
              </span>
              <span className="stj-meta-separator" style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true">·</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1' }}>
                All Year Groups &amp; Families
              </span>
              <span className="stj-meta-separator" style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true">·</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1' }}>
                Liturgy &amp; Sacraments
              </span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0', letterSpacing: '-0.025em' }}>
              Catholic Life, Liturgy &amp; Sacraments in One Place
            </h2>
            <p style={{ fontSize: '0.96rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Our Catholic faith is not locked into key stage boxes — it belongs to every child, family, and parish member. Explore the Holy Mass step-by-step, the 7 Sacraments, the Holy Rosary, God's 10 Commandments, Church seasons, Latin Mass prayers, and CST care for creation.
            </p>
          </div>

          <Link
            to="/catholic-life"
            style={{
              padding: '0.75rem 1.65rem',
              borderRadius: 'var(--stj-radius-md)',
              background: '#facc15',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--stj-shadow-sm)',
              whiteSpace: 'nowrap',
              transition: 'all 0.18s ease',
            }}
          >
            <span>Enter Catholic Sanctuary</span>
            <span aria-hidden="true">➔</span>
          </Link>
        </section>

        {/* St Joseph's Global Mission Banner */}
        <section
          style={{
            background: 'var(--stj-surface)',
            border: '1px solid var(--stj-border)',
            borderRadius: 'var(--stj-radius-xl)',
            padding: '2.5rem',
            marginBottom: '3.5rem',
            boxShadow: 'var(--stj-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div className="stj-meta-strip" style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🕊️</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--stj-success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              St Joseph&apos;s Promise
            </span>
            <span className="stj-meta-separator" aria-hidden="true">·</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--stj-text-muted)' }}>
              100% Free Forever
            </span>
            <span className="stj-meta-separator" aria-hidden="true">·</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--stj-text-muted)' }}>
              Zero Ads or Paywalls
            </span>
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--stj-text)', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>
            Free for All Children, Catholic Parishes &amp; Families
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#334155', maxWidth: '720px', lineHeight: 1.6, margin: '0 auto 1.75rem auto' }}>
            We believe high-quality learning is a gift for every child. St Joseph's portal is 100% free with no subscriptions, no adverts, no account sign-ups, and works offline to protect your family's privacy.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to="/licensing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                background: '#15803d',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
                transition: 'background-color 0.2s',
              }}
            >
              🕊️ Read Our School Mission
            </Link>
            <Link
              to="/privacy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              🛡️ Safe, Private &amp; On Your Device
            </Link>
          </div>
        </section>

        {/* Licensing & Attribution */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#334155',
          lineHeight: 1.6,
        }}>
          St Joseph's Learning Portal &bull; Open-source, privacy-first educational technology.
          Curriculum materials licensed under{' '}
          <a
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}
          >
            OGL v3.0 (Oak National Academy)
          </a>.
        </div>
      </div>
    </PageMeta>
  );
}