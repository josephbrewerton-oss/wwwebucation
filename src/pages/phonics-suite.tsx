// src/pages/phonics-suite.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import {
  PHONICS_GRAPHEMES,
  DECODABLE_WORDS,
  OFFICIAL_SCREENING_POOL,
  TRICKY_WORDS,
  type PhonicGrapheme,
  type DecodableWord,
  type ScreeningWord,
  type TrickyWord,
} from '../data/phonicsCurriculumData';
import { triggerCorrectConfetti, triggerMasteryConfetti } from '../utils/confetti';

type PhonicsTab = 'soundboard' | 'blending' | 'screening' | 'tricky' | 'print';

export default function PhonicsSuitePage() {
  const [activeTab, setActiveTab] = useState<PhonicsTab>('soundboard');

  // Soundboard State
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [activeGrapheme, setActiveGrapheme] = useState<PhonicGrapheme | null>(() => PHONICS_GRAPHEMES[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Blending Mat State
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState<number | null>(null);
  const [isBlending, setIsBlending] = useState(false);
  const [blendingFeedback, setBlendingFeedback] = useState<string | null>(null);

  // Screening Check State
  const [screeningIdx, setScreeningIdx] = useState(0);
  const [screeningScores, setScreeningScores] = useState<Record<string, boolean>>({});
  const [isScreeningFinished, setIsScreeningFinished] = useState(false);

  // Tricky Words Filter
  const [trickyPhase, setTrickyPhase] = useState<number | 'all'>('all');

  // Procedural Web Speech + Web Audio Synthesis
  const playSound = useCallback((text: string, rate: number = 0.88, pitch: number = 1.05) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = rate;
        utter.pitch = pitch;
        const voices = window.speechSynthesis.getVoices();
        const gbVoice = voices.find((v) => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'));
        if (gbVoice) utter.voice = gbVoice;
        else utter.lang = 'en-GB';
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }
  }, []);

  const playTone = useCallback((freq: number, duration: number = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      setTimeout(() => ctx.close().catch(() => {}), duration * 1000 + 100);
    } catch (_) {}
  }, []);

  // Filtered Graphemes
  const filteredGraphemes = useMemo(() => {
    return PHONICS_GRAPHEMES.filter((g) => {
      const matchesPhase = selectedPhase === 'all' || g.phase === selectedPhase;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        g.grapheme.toLowerCase().includes(q) ||
        g.phonemeIPA.toLowerCase().includes(q) ||
        g.exampleWord.toLowerCase().includes(q);
      return matchesPhase && matchesSearch;
    });
  }, [selectedPhase, searchTerm]);

  // Current Decodable Word
  const currentWord: DecodableWord = DECODABLE_WORDS[selectedWordIdx] || DECODABLE_WORDS[0];

  // Blending sweep handler
  const handleSweepAndBlend = useCallback(() => {
    if (isBlending) return;
    setIsBlending(true);
    setBlendingFeedback('Segmenting sounds...');

    let step = 0;
    const interval = setInterval(() => {
      if (step < currentWord.segments.length) {
        setActiveSegmentIdx(step);
        const seg = currentWord.segments[step];
        playTone(420 + step * 60, 0.08);
        playSound(seg.soundHint, 0.82);
        step++;
      } else {
        clearInterval(interval);
        setActiveSegmentIdx(null);
        setBlendingFeedback(`🎉 Blended: "${currentWord.word}"!`);
        playSound(`${currentWord.word}!`, 0.95);
        triggerCorrectConfetti();
        playTone(523.25, 0.1);
        setTimeout(() => playTone(659.25, 0.12), 70);
        setTimeout(() => playTone(783.99, 0.16), 140);
        setIsBlending(false);
      }
    }, 450);
  }, [currentWord, isBlending, playSound, playTone]);

  // Screening Check Handlers
  const currentScreeningWord: ScreeningWord = OFFICIAL_SCREENING_POOL[screeningIdx] || OFFICIAL_SCREENING_POOL[0];
  const handleScoreScreening = (isCorrect: boolean) => {
    setScreeningScores((prev) => ({ ...prev, [currentScreeningWord.id]: isCorrect }));
    if (isCorrect) playTone(587.33, 0.1);
    else playTone(240, 0.15);

    if (screeningIdx < OFFICIAL_SCREENING_POOL.length - 1) {
      setScreeningIdx((prev) => prev + 1);
    } else {
      setIsScreeningFinished(true);
      triggerMasteryConfetti();
    }
  };

  const totalScore = Object.values(screeningScores).filter(Boolean).length;
  const isPassed = totalScore >= 32;

  // Filtered Tricky Words
  const filteredTrickyWords = useMemo(() => {
    return TRICKY_WORDS.filter((tw) => trickyPhase === 'all' || tw.phase === trickyPhase);
  }, [trickyPhase]);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <PageMeta
        title="Full Sheet Phonics & Early Reading Teaching Suite | St Joseph's"
        description="Comprehensive DfE Letters and Sounds teaching suite: Complete Phases 2-5 soundboard, interactive sound button blending mat, Year 1 Alien Words Screening Check, and Tricky Words wall."
      />

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔤</span>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Early Phonics &amp; Reading Teaching Suite
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8' }}>
            UK DfE Letters &amp; Sounds Framework • Phases 2 to 5 • Pure Sounds (Zero Schwa) • Sound Buttons &amp; Statutory Year 1 Screening Check
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            to="/player?preset=phonics-lab&mode=game"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
            title="Launch 60 FPS animated vector blending simulation"
          >
            <span>🎬 60 FPS Vector Sim</span>
            <span>➔</span>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span>🖨️ Print Sound Sheet</span>
          </button>
        </div>
      </div>

      {/* Primary Suite Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'soundboard', label: '1. Phases 2–5 Soundboard', icon: '🔊', count: `${PHONICS_GRAPHEMES.length} Sounds` },
          { id: 'blending', label: '2. Sound Buttons Blending Mat', icon: '🟢', count: `${DECODABLE_WORDS.length} Words` },
          { id: 'screening', label: '3. Year 1 Screening Check Lab', icon: '👾', count: '40 Alien & Real Words' },
          { id: 'tricky', label: '4. Tricky Words Wall', icon: '🌟', count: `${TRICKY_WORDS.length} Words` },
          { id: 'print', label: '5. Printable Desk Mat View', icon: '📄', count: 'Phases 2-5' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as PhonicsTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPLETE PHASES 2–5 SOUNDBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'soundboard' && (
        <div>
          {/* Controls Bar: Phase Filters & Search */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#0f172a',
              border: '1px solid #1e293b',
              marginBottom: '1.25rem',
            }}
          >
            {/* Phase Selector Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginRight: '4px' }}>
                Filter Phase:
              </span>
              {[
                { id: 'all', label: 'All Phases' },
                { id: 2, label: 'Phase 2 (Autumn)' },
                { id: 3, label: 'Phase 3 (Spring)' },
                { id: 4, label: 'Phase 4 (Blends)' },
                { id: 5, label: 'Phase 5 (Split/Alts)' },
              ].map((p) => {
                const isSel = selectedPhase === p.id;
                return (
                  <button
                    key={String(p.id)}
                    type="button"
                    onClick={() => setSelectedPhase(p.id as any)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: isSel ? '1px solid #059669' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSel ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSel ? '#34d399' : '#cbd5e1',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search grapheme, word, or sound..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.8rem',
                minWidth: '220px',
              }}
            />
          </div>

          {/* Main Soundboard Layout: Grid of Sound Cards + Inspector Sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Left: Sound Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '10px' }}>
              {filteredGraphemes.map((g) => {
                const isSelected = activeGrapheme?.id === g.id;
                const isDigraph = g.type === 'digraph' || g.type === 'trigraph' || g.type === 'split-digraph';

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveGrapheme(g);
                      playTone(460, 0.06);
                      playSound(g.soundAudioText, 0.85);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 6px',
                      borderRadius: '12px',
                      background: isSelected ? '#1e293b' : '#0f172a',
                      border: isSelected ? '2px solid #059669' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 12px rgba(5, 150, 105, 0.3)' : 'none',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    {/* Phase Badge */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '6px',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        color: g.phase === 2 ? '#38bdf8' : g.phase === 3 ? '#a855f7' : '#fb923c',
                      }}
                    >
                      P{g.phase}
                    </span>

                    {/* Big Grapheme */}
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', marginBottom: '2px' }}>
                      {g.grapheme}
                    </div>

                    {/* Sound Button Dot or Digraph Dash */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0 6px' }}>
                      {isDigraph ? (
                        <div
                          style={{
                            width: '24px',
                            height: '5px',
                            borderRadius: '3px',
                            background: '#a855f7',
                            boxShadow: '0 0 6px #a855f7',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#059669',
                            boxShadow: '0 0 6px #059669',
                          }}
                        />
                      )}
                    </div>

                    {/* Phoneme IPA & Example */}
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
                      {g.phonemeIPA}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                      {g.exampleIcon} {g.exampleWord}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Sound Inspector & Articulation Card */}
            {activeGrapheme && (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  height: 'fit-content',
                  position: 'sticky',
                  top: '80px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Phonics Articulation Inspector
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.2)', color: '#34d399', border: '1px solid #059669' }}>
                    Phase {activeGrapheme.phase} • {activeGrapheme.set}
                  </span>
                </div>

                {/* Big Showcase Grapheme */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '14px',
                      background: '#1e293b',
                      border: '2px solid #059669',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                      {activeGrapheme.grapheme}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                      Phoneme: <span style={{ color: '#38bdf8' }}>{activeGrapheme.phonemeIPA}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                      Sound type: <strong style={{ color: '#cbd5e1' }}>{activeGrapheme.type}</strong>
                    </div>
                  </div>
                </div>

                {/* Pronounce Button */}
                <button
                  type="button"
                  onClick={() => {
                    playTone(480, 0.08);
                    playSound(activeGrapheme.soundAudioText, 0.85);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '1.25rem',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>🔊</span>
                  <span>Listen to Pure Sound: /{activeGrapheme.soundAudioText}/</span>
                </button>

                {/* Mouth Articulation Instructions */}
                <div style={{ padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', marginBottom: '4px' }}>
                    👄 Mouth &amp; Tongue Articulation Tip:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                    {activeGrapheme.mouthTip}
                  </div>
                </div>

                {/* Pure Sound Invariant Notice */}
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid #0891b2', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#22d3ee', marginBottom: '2px' }}>
                    🛡️ Pure Sounds Rule (No Schwa):
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Never pronounce "uh" at the end of consonants. Keep it crisp (say /k/ not "kuh", and /t/ not "tuh") so blending remains effortless!
                  </div>
                </div>

                {/* Example Word */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Example Decodable Word:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    {activeGrapheme.exampleIcon} {activeGrapheme.exampleWord}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SOUND BUTTONS & BLENDING MAT */}
      {/* ========================================================================= */}
      {activeTab === 'blending' && (
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Decodable Word Selector Strip */}
          <div style={{ marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Decodable Word to Blend:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DECODABLE_WORDS.map((w, idx) => {
                const isSel = selectedWordIdx === idx;
                return (
                  <button
                    key={w.word}
                    type="button"
                    onClick={() => {
                      setSelectedWordIdx(idx);
                      setActiveSegmentIdx(null);
                      setBlendingFeedback(null);
                      playTone(440, 0.06);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: isSel ? '#059669' : '#0f172a',
                      color: isSel ? '#ffffff' : '#cbd5e1',
                      border: isSel ? '1px solid #10b981' : '1px solid #1e293b',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{w.icon || '📖'}</span>
                    <span>{w.word}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>P{w.phase}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Interactive Blending Mat Canvas */}
          <div
            style={{
              padding: '2.5rem 1.5rem',
              borderRadius: '20px',
              background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #334155',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Universal UK Primary Blending Mat • {currentWord.category} (Phase {currentWord.phase})
            </div>

            {/* Letter Cards & Sound Buttons Container */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '16px', margin: '2rem 0', flexWrap: 'wrap' }}>
              {currentWord.segments.map((seg, idx) => {
                const isActive = activeSegmentIdx === idx;
                const isDigraph = seg.type === 'digraph' || seg.type === 'trigraph';
                const isSplit = seg.type === 'split';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    {/* Letter Card */}
                    <div
                      style={{
                        minWidth: '80px',
                        padding: '16px 20px',
                        borderRadius: '14px',
                        background: isActive ? '#059669' : '#1e293b',
                        border: isActive ? '2px solid #34d399' : '1px solid #475569',
                        boxShadow: isActive ? '0 0 16px rgba(52, 211, 153, 0.6)' : 'none',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '3rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                        {seg.letters}
                      </span>
                    </div>

                    {/* Sound Button: Dot for single phoneme, Sound Bar for digraph */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSegmentIdx(idx);
                        playTone(460 + idx * 50, 0.08);
                        playSound(seg.soundHint, 0.82);
                      }}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                      }}
                      title="Tap sound button to hear pure phoneme"
                    >
                      {isSplit ? (
                        <div
                          style={{
                            width: '46px',
                            height: '14px',
                            border: '3px solid #fb923c',
                            borderBottom: 'none',
                            borderRadius: '10px 10px 0 0',
                            boxShadow: isActive ? '0 0 8px #fb923c' : 'none',
                          }}
                        />
                      ) : isDigraph ? (
                        <div
                          style={{
                            width: '42px',
                            height: '10px',
                            borderRadius: '5px',
                            background: isActive ? '#34d399' : '#a855f7',
                            boxShadow: isActive ? '0 0 10px #34d399' : '0 0 4px #a855f7',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: isActive ? '#34d399' : '#0284c7',
                            boxShadow: isActive ? '0 0 10px #34d399' : '0 0 4px #0284c7',
                          }}
                        />
                      )}
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8' }}>
                        /{seg.soundHint}/
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sweep & Blend Button */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleSweepAndBlend}
                disabled={isBlending}
                style={{
                  padding: '14px 32px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 900,
                  border: 'none',
                  cursor: isBlending ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                  opacity: isBlending ? 0.7 : 1,
                }}
              >
                <span>👉</span>
                <span>Sweep Finger &amp; Blend Word</span>
                <span>➔</span>
              </button>
            </div>

            {/* Live Feedback */}
            {blendingFeedback && (
              <div
                style={{
                  marginTop: '1.25rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#34d399',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                {blendingFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: YEAR 1 STATUTORY PHONICS SCREENING CHECK LAB */}
      {/* ========================================================================= */}
      {activeTab === 'screening' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {!isScreeningFinished ? (
            <div>
              {/* Screening Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>
                  Word {screeningIdx + 1} of {OFFICIAL_SCREENING_POOL.length} (Section {currentScreeningWord.section})
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399' }}>
                  Current Score: {totalScore} / {OFFICIAL_SCREENING_POOL.length}
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: '#1e293b', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((screeningIdx + 1) / OFFICIAL_SCREENING_POOL.length) * 100}%`,
                    background: 'linear-gradient(90deg, #059669 0%, #34d399 100%)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>

              {/* Word Presentation Card */}
              <div
                style={{
                  padding: '3rem 2rem',
                  borderRadius: '20px',
                  background: currentScreeningWord.isAlien ? '#1e1b4b' : '#0f172a',
                  border: currentScreeningWord.isAlien ? '2px dashed #818cf8' : '2px solid #334155',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  position: 'relative',
                }}
              >
                {/* Alien Word Indicator */}
                {currentScreeningWord.isAlien && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.2)', color: '#c7d2fe', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                    <span>{currentScreeningWord.alienAvatar}</span>
                    <span>Alien Pseudo-Word ({currentScreeningWord.alienName})</span>
                  </div>
                )}

                {/* Big Word Text */}
                <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                  {currentScreeningWord.word}
                </div>

                {/* Pronounce Pure Phonemes Button */}
                <button
                  type="button"
                  onClick={() => {
                    playTone(460, 0.08);
                    playSound(currentScreeningWord.word, 0.82);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🔊 Hear Model Pronunciation</span>
                </button>
              </div>

              {/* Teacher/Pupil Evaluation Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleScoreScreening(false)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#991b1b',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>❌ Misread / Incorrect</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScoreScreening(true)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  }}
                >
                  <span>✅ Read Correctly (+1)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Screening Results Summary Card */
            <div
              style={{
                padding: '2.5rem',
                borderRadius: '20px',
                background: '#0f172a',
                border: '2px solid #1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>
                {isPassed ? '🏆' : '📚'}
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                Phonics Screening Check Completed!
              </h2>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: isPassed ? '#34d399' : '#f87171', margin: '1rem 0' }}>
                {totalScore} / {OFFICIAL_SCREENING_POOL.length}
              </div>
              <div style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
                {isPassed
                  ? `🌟 Outstanding! Exceeded the statutory DfE benchmark threshold (32 / 40)!`
                  : `Solid effort! Focus on Phase 5 split digraphs and complex consonant clusters to cross the 32/40 benchmark.`}
              </div>

              <button
                type="button"
                onClick={() => {
                  setScreeningIdx(0);
                  setScreeningScores({});
                  setIsScreeningFinished(false);
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🔄 Restart Phonics Screening Check
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRICKY WORDS WALL */}
      {/* ========================================================================= */}
      {activeTab === 'tricky' && (
        <div>
          {/* Phase Filter for Tricky Words */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Filter by Phase:
            </span>
            {[
              { id: 'all', label: 'All Tricky Words' },
              { id: 2, label: 'Phase 2' },
              { id: 3, label: 'Phase 3' },
              { id: 4, label: 'Phase 4' },
              { id: 5, label: 'Phase 5' },
            ].map((p) => {
              const isSel = trickyPhase === p.id;
              return (
                <button
                  key={String(p.id)}
                  type="button"
                  onClick={() => setTrickyPhase(p.id as any)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: isSel ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSel ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSel ? '#fb7185' : '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Tricky Words Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {filteredTrickyWords.map((tw) => (
              <div
                key={tw.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase' }}>
                      Phase {tw.phase} Tricky Word
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playTone(520, 0.06);
                        playSound(tw.word, 0.88);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                      title="Pronounce word"
                    >
                      🔊
                    </button>
                  </div>

                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginBottom: '6px' }}>
                    {tw.word}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#fca5a5', marginBottom: '8px' }}>
                    <strong>Tricky part:</strong> "{tw.trickyPart}" — {tw.trickyExplanation}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
                  "{tw.exampleSentence}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PRINTABLE DESK MAT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'print' && (
        <div
          style={{
            background: '#ffffff',
            color: '#0f172a',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
                St Joseph's Primary School — Complete Phonics Desk Mat
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                Letters and Sounds Systematic Synthetic Phonics • Pure Phonemes &amp; Sound Buttons
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Print Mat 🖨️
            </button>
          </div>

          {/* Grouped by Phase */}
          {[2, 3, 5].map((ph) => {
            const phGraphemes = PHONICS_GRAPHEMES.filter((g) => g.phase === ph);
            return (
              <div key={ph} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#047857', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                  Phase {ph} {ph === 2 ? 'Single Letters & Early Digraphs' : ph === 3 ? 'Digraphs & Trigraphs' : 'Alternative Spellings & Split Digraphs'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                  {phGraphemes.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        padding: '8px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        textAlign: 'center',
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{g.grapheme}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7' }}>{g.phonemeIPA}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{g.exampleWord}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
