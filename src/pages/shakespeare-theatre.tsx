// src/pages/shakespeare-theatre.tsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import AstVectorMediaPlayer, { AstVectorMediaPlayerHandle } from '../components/AstVectorMediaPlayer';
import ShakespearePlayExplorer from '../components/ShakespearePlayExplorer';

export default function ShakespeareTheatrePage(): React.JSX.Element {
  const [selectedPlayId, setSelectedPlayId] = useState<string>('macbeth');
  const playerRef = useRef<AstVectorMediaPlayerHandle>(null);

  const handleFocusStage = (target: string) => {
    if (playerRef.current) {
      if (target === 'hell-trapdoor') {
        playerRef.current.seek(0.15);
      } else if (target === 'thrust-stage') {
        playerRef.current.seek(0.4);
      } else if (target === 'heavens-roof') {
        playerRef.current.seek(0.7);
      } else {
        playerRef.current.seek(0.5);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 1.25rem 3rem' }}>
      <PageMeta
        title="Shakespeare's Globe Theatre & 5-Act Play-Throughs | St Joseph's"
        description="Interactive 5-Act narrative play-throughs for Macbeth, Romeo & Juliet, Hamlet, Julius Caesar, The Tempest, and A Midsummer Night's Dream with 3D Globe Theatre simulation, spoken blank verse, and canon vs what-if choices."
      />

      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.15) 0%, rgba(15, 23, 42, 0.08) 100%)',
          border: '1px solid rgba(220, 38, 38, 0.35)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '2rem' }}>🎭</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                background: '#dc2626',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              KS3 &amp; GCSE English Literature Suite
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: 'var(--stj-text)',
              margin: '0 0 8px',
              lineHeight: 1.25,
            }}
          >
            The 1599 Globe Theatre: Shakespeare Play Parts &amp; Blank Verse
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '0.92rem',
              color: 'var(--stj-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Step inside Shakespeare’s 1599 "Wooden O" on London’s Bankside. Experience 6 complete 5-Act interactive play-throughs—<em>Macbeth</em>, <em>Romeo &amp; Juliet</em>, <em>Hamlet</em>, <em>The Tempest</em>, <em>A Midsummer Night&apos;s Dream</em>, and <em>Julius Caesar</em>—featuring spoken blank verse soliloquies, iambic meter metronomes, canon vs "what-if" dramatic branches, and historical Elizabethan staging techniques.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/learning-zone"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'var(--stj-canvas)',
              color: 'var(--stj-text)',
              border: '1px solid var(--stj-border)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            📖 Curriculum Lessons
          </Link>
          <Link
            to="/player?preset=shakespeare"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
            }}
          >
            🎮 Open in Vector Studio
          </Link>
        </div>
      </div>

      {/* 3D Globe Vector Simulation Container */}
      <div
        className="stj-card"
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
          background: 'var(--stj-surface)',
          border: '1px solid var(--stj-border)',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🏛️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--stj-text)' }}>
                3D Globe Amphitheatre &amp; Iambic Heartbeat Metronome
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--stj-text-muted)' }}>
                Drag the slider to adjust iambic rhythm tempo (40–140 BPM) or orbit the 360° wooden galleries.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleFocusStage('hell-trapdoor')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
              }}
            >
              🔥 Hell (Trapdoor)
            </button>
            <button
              type="button"
              onClick={() => handleFocusStage('thrust-stage')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#0284c7',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                cursor: 'pointer',
              }}
            >
              🌍 Earth (Stage)
            </button>
            <button
              type="button"
              onClick={() => handleFocusStage('heavens-roof')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: 'rgba(234, 179, 8, 0.1)',
                color: '#ca8a04',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                cursor: 'pointer',
              }}
            >
              ⭐ Heavens (Canopy)
            </button>
          </div>
        </div>

        <AstVectorMediaPlayer
          ref={playerRef}
          preset={selectedPlayId === 'macbeth' ? 'shakespeare-macbeth' : 'shakespeare'}
          autoPlay={true}
          showQuestions={true}
          allowPresetSwitch={false}
          embedded={true}
          height="min(500px, 55vh)"
        />
      </div>

      {/* The 5-Act Interactive Shakespeare Play-Through Suite */}
      <ShakespearePlayExplorer
        initialPlayId={selectedPlayId}
        onSelectPlay={(id) => setSelectedPlayId(id)}
        onFocusGlobeStage={handleFocusStage}
      />
    </div>
  );
}
