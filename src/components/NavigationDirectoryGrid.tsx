// src/components/NavigationDirectoryGrid.tsx
/**
 * Shared National Curriculum Navigation Directory Grid
 * Displays interactive quick-navigation cards for the portal's core learning and management zones.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface NavigationDirectoryGridProps {
  title?: string;
  className?: string;
}

export const NavigationDirectoryGrid: React.FC<NavigationDirectoryGridProps> = ({
  title = 'National Curriculum Navigation Directory',
  className = '',
}) => {
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
    </section>
  );
};

export default NavigationDirectoryGrid;
