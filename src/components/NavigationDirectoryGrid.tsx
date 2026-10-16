// src/components/NavigationDirectoryGrid.tsx
/**
 * Shared National Curriculum Navigation Directory Grid
 * Displays interactive quick-navigation cards for the portal's core learning and management zones.
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCartridgeNavigationSections } from '../services/cartridgeStore';

export interface NavigationDirectoryGridProps {
  title?: string;
  className?: string;
}

export const NavigationDirectoryGrid: React.FC<NavigationDirectoryGridProps> = ({
  title = 'National Curriculum Navigation Directory',
  className = '',
}) => {
  const cartridgeSections = useMemo(() => getCartridgeNavigationSections(), []);

  return (
    <section className={className}>
      {title && (
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--stj-text)', marginBottom: '1rem' }}>
          {title}
        </h2>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <Link
          to="/phonics"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>🔤</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>EYFS &amp; KS1 Phonics Sounds Suite</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            DfE Phases 2–5 interactive soundboard, sound buttons blending mat, Alien Words screening check &amp; printable flashcard mats.
          </p>
        </Link>

        <Link
          to="/languages"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>🌍</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>MFL &amp; Polyglot Studio</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Spanish, French &amp; Latin comparative phonics, regular/irregular verb conjugation wheels, etymology bridges &amp; speed vocab sprints.
          </p>
        </Link>

        <Link
          to="/player?preset=bsl-fingerspelling"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>🖐️</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>3D BSL Fingerspelling Studio</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            360° rotatable 3D two-handed manual alphabet rig, A-E-I-O-U fingertip vowel tap positions &amp; Signer POV orbit.
          </p>
        </Link>

        <Link
          to="/catholic-life"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>⛪</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>Catholic Life &amp; Sacraments</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            18 interactive sanctuaries: 3D Church Tour, Altar Anatomy, Holy Oils, Seven Sacraments, First Communion Lab &amp; Rosary Walk.
          </p>
        </Link>

        <Link
          to="/player"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>🎮</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>AST Vector Simulator &amp; Vault</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Zero-bloat Flash-caliber vector simulations, PhET HTML5/JSON/iO ingestion bridge, Smartboard stylus ink &amp; IndexedDB vault.
          </p>
        </Link>

        <Link
          to="/shakespeare"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>🎭</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>Shakespeare Globe Theatre</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            6 GCSE plays (Macbeth, Romeo &amp; Juliet, Hamlet...), 5-Act play-throughs, spoken soliloquy audio &amp; 1599 staging secrets.
          </p>
        </Link>

        <Link
          to="/practice-lab"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>Interactive Practice Arena</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Key Stage 1–4 diagnostic challenges with local Socratic Super Teacher Nano assistance.
          </p>
        </Link>

        <Link
          to="/learning-zone"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>📖</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>Curriculum Lessons</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Step-by-step S-Expression units spanning Academic, Faith Formation, and CPD streams.
          </p>
        </Link>

        <Link
          to="/teacher-beacon"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>📡</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>Teacher Beacon P2P Sync</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Zero-cloud classroom synchronization over local WebRTC data channels for live student progress and lesson broadcast.
          </p>
        </Link>

        <Link
          to="/curriculum-studio"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>🛠️</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>Curriculum Studio</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Import custom CSV spreadsheets or activate national syllabi (Kenya, India, Ghana, Philippines).
          </p>
        </Link>

        <Link
          to="/profile"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>⭐</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>My Progress &amp; Passport</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Local mastery breakdown, offline certificate generation, and GDPR-safe data control.
          </p>
        </Link>

        <Link
          to="/settings"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>⚙️</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>Portal Settings</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Configure local Ollama WebRTC models, OpenDyslexic fonts, and high-contrast themes.
          </p>
        </Link>

        <Link
          to="/news"
          className="stj-card stj-card-interactive"
          style={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>📰</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--stj-text)' }}>School News</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            Technical dispatches and updates from St Joseph&apos;s Fishponds AI engineering team.
          </p>
        </Link>
      </div>

      {/* Dynamic Self-Mounted Cartridge Curriculum Hub */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>🎮</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: '#0284c7', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Self-Mounting Architecture
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--stj-text)', margin: '4px 0 0' }}>
              Cartridge-Driven Curriculum Directory
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--stj-text-muted)', margin: '2px 0 0' }}>
              These interactive modules autonomously mount into the portal by broadcasting their own declared address coordinates.
            </p>
          </div>
          <Link
            to="/cartridges"
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#0284c7',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
            }}
          >
            Open Cartridge Vault &rarr;
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cartridgeSections.map((sec) => (
            <div
              key={sec.section}
              style={{
                background: 'var(--stj-surface)',
                border: '1px solid var(--stj-border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>{sec.icon}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--stj-text)', margin: 0 }}>
                  {sec.section}
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--stj-text-muted)', fontWeight: 600 }}>
                  ({sec.cartridges.length} cartridges)
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '10px',
                }}
              >
                {sec.cartridges.map((c) => {
                  const targetMount = c.mount || `/curriculum/${c.id}`;
                  return (
                    <Link
                      key={c.id}
                      to={targetMount}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--stj-canvas)',
                        border: '1px solid var(--stj-border)',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: c.isCore ? '#ecfdf5' : '#f1f5f9',
                            color: c.isCore ? '#047857' : '#475569',
                            border: `1px solid ${c.isCore ? '#a7f3d0' : '#e2e8f0'}`,
                          }}
                        >
                          {c.isCore ? '⭐ Core' : (c.type || 'Sim')}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--stj-text)', lineHeight: 1.3 }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600, marginTop: '2px', wordBreak: 'break-all' }}>
                          📍 {targetMount}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NavigationDirectoryGrid;
