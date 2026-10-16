// src/components/ShakespearePlayExplorer.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  SHAKESPEARE_PLAY_STORIES,
  type ShakespearePlayStory,
  type PlayAct,
  type DramaticChoice,
} from '../data/shakespearePlays';
import { triggerCorrectConfetti } from '../utils/confetti';

export interface ShakespearePlayExplorerProps {
  initialPlayId?: string;
  initialAct?: number;
  onSelectPlay?: (playId: string) => void;
  onFocusGlobeStage?: (stageElement: string) => void;
}

export default function ShakespearePlayExplorer({
  initialPlayId = 'macbeth',
  initialAct = 1,
  onSelectPlay,
  onFocusGlobeStage,
}: ShakespearePlayExplorerProps): React.JSX.Element {
  const [selectedPlayId, setSelectedPlayId] = useState<string>(initialPlayId);
  const [selectedActIndex, setSelectedActIndex] = useState<number>(initialAct - 1);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [filterGenre, setFilterGenre] = useState<string>('All');

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    };
  }, []);

  // Filtered plays by genre
  const filteredPlays = useMemo(() => {
    if (filterGenre === 'All') return SHAKESPEARE_PLAY_STORIES;
    return SHAKESPEARE_PLAY_STORIES.filter((p) => p.genre === filterGenre);
  }, [filterGenre]);

  // Current active play
  const activePlay: ShakespearePlayStory = useMemo(() => {
    return (
      SHAKESPEARE_PLAY_STORIES.find((p) => p.id === selectedPlayId) ||
      SHAKESPEARE_PLAY_STORIES[0]
    );
  }, [selectedPlayId]);

  // Current active act
  const activeAct: PlayAct = useMemo(() => {
    return activePlay.acts[selectedActIndex] || activePlay.acts[0];
  }, [activePlay, selectedActIndex]);

  // Recite soliloquy / verse via Web Speech API
  const speakVerse = useCallback((verse: string, speaker: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(`${speaker}: ${verse}`);
      utterance.rate = 0.88;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const ukVoice = voices.find(
        (v) => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB')
      );
      if (ukVoice) utterance.voice = ukVoice;
      else utterance.lang = 'en-GB';

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (_) {
      setIsSpeaking(false);
    }
  }, []);

  const stopVerse = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setIsSpeaking(false);
  }, []);

  const handleSelectPlay = (id: string) => {
    setSelectedPlayId(id);
    setSelectedActIndex(0);
    setSelectedChoiceIdx(null);
    stopVerse();
    onSelectPlay?.(id);
  };

  const handleSelectAct = (index: number) => {
    setSelectedActIndex(index);
    setSelectedChoiceIdx(null);
    stopVerse();
  };

  const handleSelectChoice = (idx: number, choice: DramaticChoice) => {
    setSelectedChoiceIdx(idx);
    if (choice.isCanon) {
      try {
        triggerCorrectConfetti();
      } catch (_) {}
    }
  };

  return (
    <div
      className="stj-card"
      style={{
        background: 'var(--stj-surface)',
        border: '1px solid var(--stj-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        marginBottom: '2rem',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--stj-border)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '2rem' }}>🎭</span>
          <div>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                margin: 0,
                color: 'var(--stj-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>The 1599 Globe Theatre: Shakespeare Play Parts</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(217, 119, 6, 0.15)',
                  color: '#d97706',
                  fontWeight: 800,
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                }}
              >
                6 GCSE Plays &bull; 30 Acts
              </span>
            </h2>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.85rem',
                color: 'var(--stj-text-muted)',
              }}
            >
              Select any of Shakespeare’s 6 most studied plays. Step through all 5 Acts with iconic spoken verse, canon vs "what-if" dramatic decisions, and authentic Globe staging secrets.
            </p>
          </div>
        </div>

        {/* Genre Filter */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--stj-text-muted)', fontWeight: 600 }}>
            Genre:
          </span>
          {['All', 'Tragedy', 'Comedy', 'Romance'].map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setFilterGenre(genre)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: filterGenre === genre ? '1px solid #d97706' : '1px solid var(--stj-border)',
                background: filterGenre === genre ? '#d97706' : 'var(--stj-canvas)',
                color: filterGenre === genre ? '#ffffff' : 'var(--stj-text)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Play Selector Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px',
          marginBottom: '1.5rem',
        }}
      >
        {filteredPlays.map((play) => {
          const isSelected = play.id === selectedPlayId;
          return (
            <button
              key={play.id}
              type="button"
              onClick={() => handleSelectPlay(play.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px 14px',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                border: isSelected
                  ? `2px solid ${play.genreBadgeColor}`
                  : '1px solid var(--stj-border)',
                background: isSelected
                  ? `linear-gradient(135deg, ${play.themeColor}15 0%, var(--stj-surface) 100%)`
                  : 'var(--stj-canvas)',
                boxShadow: isSelected
                  ? `0 4px 12px ${play.genreBadgeColor}25`
                  : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{play.icon}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: play.genreBadgeColor,
                    color: '#ffffff',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {play.genre}
                </span>
              </div>
              <strong
                style={{
                  fontSize: '0.95rem',
                  color: isSelected ? play.genreBadgeColor : 'var(--stj-text)',
                  marginBottom: '2px',
                }}
              >
                {play.title}
              </strong>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--stj-text-muted)',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {play.tagline}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Play Detail Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${activePlay.themeColor}20 0%, rgba(15, 23, 42, 0.05) 100%)`,
          border: `1px solid ${activePlay.genreBadgeColor}40`,
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>{activePlay.icon}</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--stj-text)' }}>
                {activePlay.title}
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: activePlay.genreBadgeColor,
                  color: '#ffffff',
                  fontWeight: 800,
                }}
              >
                {activePlay.genre}
              </span>
            </div>
            <p style={{ margin: '0 0 6px', fontSize: '0.86rem', color: 'var(--stj-text-muted)', lineHeight: 1.4 }}>
              {activePlay.overview}
            </p>
            <div style={{ fontSize: '0.8rem', color: activePlay.genreBadgeColor, fontWeight: 700 }}>
              ⚖️ Central Moral Dilemma: <em>"{activePlay.coreQuestion}"</em>
            </div>
          </div>

          {onFocusGlobeStage && (
            <button
              type="button"
              onClick={() => onFocusGlobeStage('thrust-stage')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'var(--stj-primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🏛️ Focus 3D Globe Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Act Stepper Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--stj-text)' }}>
            Select Dramatic Act:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--stj-text-muted)' }}>
            Act {selectedActIndex + 1} of 5
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
          }}
        >
          {activePlay.acts.map((act, idx) => {
            const isActActive = idx === selectedActIndex;
            return (
              <button
                key={act.act}
                type="button"
                onClick={() => handleSelectAct(idx)}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isActActive
                    ? `2px solid ${activePlay.genreBadgeColor}`
                    : '1px solid var(--stj-border)',
                  background: isActActive
                    ? activePlay.genreBadgeColor
                    : 'var(--stj-canvas)',
                  color: isActActive ? '#ffffff' : 'var(--stj-text)',
                  boxShadow: isActActive
                    ? `0 3px 10px ${activePlay.genreBadgeColor}40`
                    : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{act.actRoman}</div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    opacity: isActActive ? 0.95 : 0.7,
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {act.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Act Content Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Column: Scene Setup & Iconic Verse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Setting & Summary */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'var(--stj-canvas)',
              border: '1px solid var(--stj-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1rem' }}>📍</span>
              <strong style={{ fontSize: '0.84rem', color: 'var(--stj-text)' }}>
                Setting &amp; Scene: {activeAct.setting}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--stj-text-muted)', lineHeight: 1.5 }}>
              {activeAct.summary}
            </p>
          </div>

          {/* Iconic Verse & Web Speech Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(15, 23, 42, 0.04) 100%)',
              border: '1px solid rgba(217, 119, 6, 0.35)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem' }}>📜</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#b45309' }}>
                  Iconic Blank Verse ({activeAct.iconicQuote.speaker})
                </span>
              </div>

              {isSpeaking ? (
                <button
                  type="button"
                  onClick={stopVerse}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>⏹️</span> Stop Recitation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => speakVerse(activeAct.iconicQuote.verse, activeAct.iconicQuote.speaker)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
                  }}
                  title="Recite this verse using on-device Web Speech British English enunciation"
                >
                  <span>🔊</span> Recite Verse (Audio)
                </button>
              )}
            </div>

            {/* Verse */}
            <blockquote
              style={{
                margin: '0 0 10px',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'var(--stj-text)',
                lineHeight: 1.5,
                borderLeft: '3px solid #d97706',
                paddingLeft: '12px',
              }}
            >
              "{activeAct.iconicQuote.verse}"
            </blockquote>

            {/* Plain English Translation */}
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--stj-text)',
                background: 'var(--stj-surface)',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid var(--stj-border)',
              }}
            >
              <strong style={{ color: 'var(--stj-primary)', display: 'block', marginBottom: '2px', fontSize: '0.74rem' }}>
                📖 Plain English Meaning:
              </strong>
              {activeAct.iconicQuote.modernTranslation}
            </div>

            {/* Dramatic Significance */}
            <div style={{ fontSize: '0.76rem', color: 'var(--stj-text-muted)' }}>
              <strong style={{ color: 'var(--stj-text)' }}>Dramatic Analysis: </strong>
              {activeAct.iconicQuote.dramaticSignificance}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Dilemma & Globe Staging Secrets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Interactive Dilemma: Canon vs What-If */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--stj-canvas)',
              border: '1px solid var(--stj-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--stj-text)' }}>
                Dramatic Turning Point: What Would You Do?
              </strong>
            </div>

            <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: 'var(--stj-text)', lineHeight: 1.45 }}>
              {activeAct.decisionPrompt}
            </p>

            {/* Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeAct.choices.map((choice, cIdx) => {
                const isSelected = selectedChoiceIdx === cIdx;
                return (
                  <div key={cIdx}>
                    <button
                      type="button"
                      onClick={() => handleSelectChoice(cIdx, choice)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: isSelected
                          ? choice.isCanon
                            ? '2px solid #10b981'
                            : '2px solid #f59e0b'
                          : '1px solid var(--stj-border)',
                        background: isSelected
                          ? choice.isCanon
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)'
                          : 'var(--stj-surface)',
                        color: 'var(--stj-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{choice.text}</span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: choice.isCanon ? '#10b981' : '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {choice.isCanon ? 'Shakespeare’s Canon' : 'What If? Branch'}
                      </span>
                    </button>

                    {/* Result Card when selected */}
                    {isSelected && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: choice.isCanon
                            ? 'rgba(16, 185, 129, 0.08)'
                            : 'rgba(245, 158, 11, 0.08)',
                          border: `1px solid ${choice.isCanon ? '#10b981' : '#f59e0b'}`,
                          fontSize: '0.78rem',
                          lineHeight: 1.45,
                        }}
                      >
                        <div style={{ marginBottom: '4px', color: 'var(--stj-text)' }}>
                          <strong>Consequence: </strong>
                          {choice.consequence}
                        </div>
                        <div style={{ color: choice.isCanon ? '#047857' : '#b45309', fontWeight: 700 }}>
                          💡 Modern Takeaway: {choice.modernTakeaway}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1599 Globe Theatre Staging Secret */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(15, 23, 42, 0.03) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.1rem' }}>🎪</span>
              <strong style={{ fontSize: '0.84rem', color: '#0284c7' }}>
                1599 Globe Theatre Staging Technique
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--stj-text)', lineHeight: 1.45 }}>
              {activeAct.globeStagingSecret}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
