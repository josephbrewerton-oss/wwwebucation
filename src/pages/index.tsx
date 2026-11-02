if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}
import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import ExpressLessonLaunchpad from '../components/ExpressLessonLaunchpad';
import HomeLearnerGuidedCard from '../components/HomeLearnerGuidedCard';
import { PRESET_OPTIONS } from '../data/player/generatedScenes';

const AstVectorMediaPlayer = lazy(() => import('../components/AstVectorMediaPlayer'));


export default function Home() {
  const [landingSimPreset, setLandingSimPreset] = useState<string>('kinetic-gas');
  return (
    <PageMeta
      title="St Joseph's Curriculum Portal — Education Should Be Free"
      description="Interactive UK National Curriculum portal, zero-bloat AST vector science simulations, BSL in-vision sign interpretation, and on-device offline learning."
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
                  <optgroup label="🎮 Simulations (Sim)" style={{ background: '#0f172a', color: '#38bdf8' }}>
                    {PRESET_OPTIONS.filter((o) => o.type === 'Sim').map((opt) => (
                      <option key={opt.id} value={opt.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                        {opt.oakId ? `[${opt.oakId}] ` : ''}{opt.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📑 Interactive Slides (Slide)" style={{ background: '#0f172a', color: '#34d399' }}>
                    {PRESET_OPTIONS.filter((o) => o.type === 'Slide').map((opt) => (
                      <option key={opt.id} value={opt.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                        {opt.oakId ? `[${opt.oakId}] ` : ''}{opt.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="💻 Vector Applications (App)" style={{ background: '#0f172a', color: '#fbbf24' }}>
                    {PRESET_OPTIONS.filter((o) => o.type === 'App').map((opt) => (
                      <option key={opt.id} value={opt.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                        {opt.oakId ? `[${opt.oakId}] ` : ''}{opt.label}
                      </option>
                    ))}
                  </optgroup>
                  {PRESET_OPTIONS.some((o) => o.type === 'Film') && (
                    <optgroup label="🎬 Video / Film (Film)" style={{ background: '#0f172a', color: '#f43f5e' }}>
                      {PRESET_OPTIONS.filter((o) => o.type === 'Film').map((opt) => (
                        <option key={opt.id} value={opt.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                          {opt.oakId ? `[${opt.oakId}] ` : ''}{opt.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {PRESET_OPTIONS.some((o) => !['Sim', 'Slide', 'App', 'Film'].includes(o.type)) && (
                    <optgroup label="🔬 Curriculum Cartridges" style={{ background: '#0f172a', color: '#a78bfa' }}>
                      {PRESET_OPTIONS.filter((o) => !['Sim', 'Slide', 'App', 'Film'].includes(o.type)).map((opt) => (
                        <option key={opt.id} value={opt.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                          {opt.oakId ? `[${opt.oakId}] ` : ''}{opt.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
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
            <div style={{ borderRadius: '12px', overflow: 'hidden', minHeight: '460px', background: '#090d16' }}>
              <Suspense
                fallback={
                  <div
                    style={{
                      height: '460px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#090d16',
                      color: '#94a3b8',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '2.4rem' }}>⚡</div>
                    <strong style={{ color: '#f8fafc', fontSize: '1.05rem' }}>AST Vector Engine Ready</strong>
                    <span style={{ fontSize: '0.85rem' }}>Loading zero-bloat simulation stage...</span>
                  </div>
                }
              >
                <AstVectorMediaPlayer
                  key={`landing-sim-${landingSimPreset}`}
                  preset={landingSimPreset}
                  autoPlay={false}
                  height="460px"
                  allowPresetSwitch={true}
                  onPresetChange={(p) => setLandingSimPreset(p)}
                  embedded={true}
                />
              </Suspense>
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
export function renderHomePage(): HTMLElement {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const container = document.createElement('div');
  container.className = 'home-landing-stage';
  container.style.cssText = 'padding: 3rem 1.5rem; max-width: 1140px; margin: 0 auto;';

  container.innerHTML = `
    <!-- Welcome Hero -->
    <section style="text-align: center; margin-bottom: 3.5rem;">
      <div class="stj-meta-strip" style="margin-bottom: 1.25rem; justify-content: center; display: flex; gap: 8px; font-size: 0.85rem; align-items: center;">
        <span style="color: var(--stj-success, #16a34a); font-weight: 600;">Education should be free</span>
        <span class="stj-meta-separator" style="color: #cbd5e1;" aria-hidden="true">·</span>
        <span style="color: #64748b;">UK National Curriculum</span>
        <span class="stj-meta-separator" style="color: #cbd5e1;" aria-hidden="true">·</span>
        <span style="color: #64748b;">Works Offline</span>
        <span class="stj-meta-separator" style="color: #cbd5e1;" aria-hidden="true">·</span>
        <a href="${base}news" style="color: var(--stj-primary, #0284c7); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;">
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

      <div class="stj-hero-actions" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="#featured-simulations" class="stj-btn-hero-primary" style="padding: 10px 22px; background: #0284c7; color: #ffffff; border-radius: 8px; font-weight: 700; text-decoration: none;">
          <span>Launch Interactive Simulators</span>
          <span aria-hidden="true">↓</span>
        </a>
        <a href="#express-lesson-launchpad" class="stj-btn-hero-secondary" style="padding: 10px 22px; background: #0f172a; color: #ffffff; border-radius: 8px; font-weight: 700; text-decoration: none;">
          <span>Explore Curriculum Lessons</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <div style="display: flex; gap: 0.85rem; justify-content: center; align-items: center; flex-wrap: wrap; margin-top: 1.5rem; font-size: 0.86rem; color: #64748b;">
        <a href="${base}practice-lab" style="color: #64748b; text-decoration: none; font-weight: 500;">Practice Question Bank</a>
        <span style="color: #cbd5e1;">·</span>
        <a href="#home-learner-guided-pathway" style="color: #64748b; text-decoration: none; font-weight: 500;">Guided Learning Pathway</a>
        <span style="color: #cbd5e1;">·</span>
        <a href="${base}catholic-life" style="color: #64748b; text-decoration: none; font-weight: 500;">Catholic Life &amp; Faith</a>
      </div>
    </section>

    <!-- 2-Click Express Lesson Launchpad Section -->
    <section id="express-lesson-launchpad" style="background: #ffffff; border: 1.5px solid #0284c7; border-radius: 16px; padding: 2rem; margin-bottom: 3.5rem; box-shadow: 0 4px 20px rgba(2, 132, 199, 0.08); text-align: center;">
      <div style="font-size: 0.78rem; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
        ⚡ 2-Click Fast Track · Jump Straight into Any Lesson
      </div>
      <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 1.25rem 0;">What Would You Like to Learn Today?</h2>
      
      <!-- Key Stage Pills -->
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: #64748b; align-self: center; margin-right: 4px;">1. Choose Stage:</span>
        ${['All', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 6', 'KS3', 'GCSE'].map((lvl, i) => `
          <button type="button" class="stj-pill-btn" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 999px; border: 1px solid ${i === 4 ? '#0284c7' : '#cbd5e1'}; background: ${i === 4 ? '#0284c7' : '#f8fafc'}; color: ${i === 4 ? '#fff' : '#334155'}; font-weight: 600; cursor: pointer;">
            ${lvl}
          </button>
        `).join('')}
      </div>

      <!-- Quick Lesson Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; text-align: left;">
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #0284c7; margin-bottom: 4px;">Year 3 · Mathematics</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Unit Fractions &amp; Finding Parts of a Set</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0 0 12px 0;">Cut pizzas and chocolate bars into equal shares: 1/2, 1/3, 1/4, and 1/8.</p>
          <div style="display: flex; gap: 8px;">
            <a href="${base}player?preset=fractions" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #059669; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Teach Me</a>
            <a href="${base}practice-lab" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Practice</a>
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #ca8a04; margin-bottom: 4px;">Year 3 · Catholic RE</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">The Liturgy of the Eucharist &amp; Real Presence</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0 0 12px 0;">Master the Mass parts, liturgical colours, and spiritual preparation.</p>
          <div style="display: flex; gap: 8px;">
            <a href="${base}catholic-life" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #059669; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Teach Me</a>
            <a href="${base}practice-lab" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Practice</a>
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #7c3aed; margin-bottom: 4px;">Year 3 · Science</div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Forces, Friction and Magnetic Poles</h3>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0 0 12px 0;">Investigate why magnets attract and repel, and explore grip friction on grass vs ice.</p>
          <div style="display: flex; gap: 8px;">
            <a href="${base}player?preset=kinetic-gas" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #059669; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Teach Me</a>
            <a href="${base}practice-lab" class="stj-btn" style="padding: 6px 12px; font-size: 0.78rem; background: #0284c7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700;">Practice</a>
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

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
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

    <!-- Latest News & Release: AST Vector Player -->
    <section id="featured-simulations-section" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.25rem 2rem; margin-bottom: 3.5rem; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.76rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #16a34a;">Release Notes</span>
          <span style="color: #cbd5e1;">·</span>
          <span style="font-size: 0.82rem; color: #64748b;">September 2026</span>
        </div>
        <a href="${base}news" style="font-size: 0.84rem; font-weight: 600; color: #0284c7; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
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

      <!-- 4 Tech Feature Tiles -->
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

      <!-- Featured Interactive Simulation Container with Dropdown & Pills -->
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
              <option value="kinetic-gas">💨 Kinetic Gas Theory &amp; Thermodynamics</option>
              <option value="pythagoras">📐 Pythagoras Theorem &amp; Triangles</option>
              <option value="fractions">🍰 Fractions Mastery Lab</option>
              <option value="electric-circuits">💡 Electric Circuits &amp; Ohm's Law</option>
              <option value="solar-system">🪐 Solar System Planetary Orbits</option>
              <option value="algebra-balance">⚖️ Algebra Balance Equation Scale</option>
            </select>
            <a href="${base}player" style="padding: 7px 12px; font-size: 0.78rem; background: #334155; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 700;">↗ Fullscreen Studio</a>
          </div>
        </div>

        <!-- Simulation Quick Category Pills -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
          ${[
            { label: '💨 Kinetic Gas', id: 'kinetic-gas' },
            { label: '📐 Pythagoras', id: 'pythagoras' },
            { label: '🍰 Fractions', id: 'fractions' },
            { label: '💡 Circuits', id: 'electric-circuits' },
            { label: '🪐 Solar System', id: 'solar-system' },
            { label: '⚖️ Algebra Balance', id: 'algebra-balance' },
          ].map((pill, i) => `
            <button type="button" class="sim-pill-btn" data-preset="${pill.id}" style="background: ${i === 0 ? '#0284c7' : '#1e293b'}; color: ${i === 0 ? '#ffffff' : '#94a3b8'}; border: 1px solid ${i === 0 ? '#38bdf8' : '#334155'}; border-radius: 9999px; padding: 3px 10px; font-size: 0.74rem; font-weight: 700; cursor: pointer;">
              ${pill.label}
            </button>
          `).join('')}
        </div>

        <!-- The Live Viewport Iframe -->
        <div style="border-radius: 12px; overflow: hidden; min-height: 480px; background: #090d16;">
          <iframe 
            id="landing-stage-viewport"
            src="${base}player.html?preset=kinetic-gas" 
            style="width: 100%; height: 480px; border: none; display: block;" 
            title="Featured Interactive Simulation">
          </iframe>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="${base}player" class="stj-btn" style="padding: 10px 20px; background: #0284c7; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700;">Launch AST Vector Player →</a>
        <a href="${base}news" class="stj-btn" style="padding: 10px 20px; background: #0f172a; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700;">Technical Architecture Dispatch</a>
      </div>
    </section>

    <!-- Developing-Nation Safe Architecture Banner -->
    <section style="background: #0b0f19; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 2.25rem 2.5rem; margin-bottom: 3.5rem; color: #f8fafc; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
      <div style="maxWidth: 680px;">
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
      <a href="${base}learning-zone" style="padding: 0.75rem 1.6rem; background: #0284c7; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none;">See How Tiny Lessons Work ➔</a>
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
      <a href="${base}catholic-life" style="padding: 0.75rem 1.65rem; border-radius: 8px; background: #facc15; color: #0f172a; font-weight: 700; text-decoration: none;">Enter Catholic Sanctuary ➔</a>
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
        <a href="${base}licensing" style="padding: 0.75rem 1.75rem; border-radius: 8px; background: #15803d; color: #ffffff; font-weight: 700; text-decoration: none;">🕊️ Read Our School Mission</a>
        <a href="${base}privacy" style="padding: 0.75rem 1.75rem; border-radius: 8px; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; font-weight: 60