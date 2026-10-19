// src/components/HolyWaterAndThuriferExplorer.tsx
/**
 * St Joseph's Catholic Life & Faith Sanctuary
 * Holy Water (Aqua Benedicta), The Asperges, The Thurifer (Thuriferarius), & The Thurible (Thuribulum)
 * 
 * Interactive pedagogical module exploring:
 * 1. Holy Water as a Sacramental, the entrance stoup, exorcised salt, and the Sunday Asperges rite
 * 2. The Thurifer and Boat Bearer altar server roles, the thurible anatomy, and the 7 Mass incensations
 * 3. Interactive Thurifer swing simulator with procedural chain clinks and smoke synthesis
 * 4. Interactive Holy Water blessing and Asperges sprinkling simulator
 * 5. Liturgical rubric quiz with CCC and GIRM citations
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  HOLY_WATER_CATECHESIS,
  THURIFER_AND_INCENSE_CATECHESIS,
  INCENSATION_MOMENTS,
  HOLY_WATER_THURIFER_QUIZ,
  HolyWaterFact,
  ThuriferRoleFact,
  IncensationMoment,
} from '../data/catholic/holyWaterThuriferData';
import { speakInLanguage, cancelSpeech } from '../engine/translationService';
import { Link } from 'react-router-dom';
import AstVectorMediaPlayer from './AstVectorMediaPlayer';
import { playSuccessChime, triggerHapticSuccess, triggerHapticError } from '../services/soundHaptics';

export type ExplorerTab = 'holy-water' | 'thurifer-incense' | 'simulator' | 'quiz';

export default function HolyWaterAndThuriferExplorer(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<ExplorerTab>('holy-water');
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const [selectedWaterFact, setSelectedWaterFact] = useState<HolyWaterFact>(HOLY_WATER_CATECHESIS[0]);
  const [selectedThuriferFact, setSelectedThuriferFact] = useState<ThuriferRoleFact>(THURIFER_AND_INCENSE_CATECHESIS[0]);
  const [selectedMoment, setSelectedMoment] = useState<IncensationMoment>(INCENSATION_MOMENTS[0]);

  // Holy Water blessing interactive state
  const [blessingStep, setBlessingStep] = useState<number>(0);
  const [aspergesMode, setAspergesMode] = useState<'ordinary' | 'easter'>('ordinary');
  const [sprinkleCount, setSprinkleCount] = useState<number>(0);

  // Thurifer simulator state
  const [incenseSpoonsAdded, setIncenseSpoonsAdded] = useState<number>(0);
  const [simTarget, setSimTarget] = useState<'sacrament' | 'gospel' | 'crucifix' | 'priest' | 'people'>('sacrament');
  const [swingsPerformed, setSwingsPerformed] = useState<number>(0);
  const [isSwinging, setIsSwinging] = useState<boolean>(false);

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // Procedural Web Audio Sound Generator for Chains, Water Sprinkling, and Charcoal
  const playLiturgicalSound = useCallback((type: 'water' | 'spray' | 'chain' | 'hiss' | 'chime') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'water') {
        // Soft water drop: sine glide 600Hz -> 300Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'spray') {
        // Asperges spray: filtered noise burst + high water ripple
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.Q.setValueAtTime(3.0, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'chain') {
        // Metallic thurible chains: metallic high clinks
        [1800, 2400, 3100].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.04 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.04);
          osc.stop(ctx.currentTime + idx * 0.04 + 0.2);
        });
      } else if (type === 'hiss') {
        // Incense spooned onto hot glowing coals: gentle sizzling noise
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2500, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'chime') {
        // Gentle bell chime: C5 & G5
        [523.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.85);
        });
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSpeech = (text: string) => {
    cancelSpeech();
    speakInLanguage(text, 'en');
  };

  const handleBlessingStep = () => {
    playLiturgicalSound('water');
    setBlessingStep((prev) => (prev + 1) % 5);
  };

  const handleSprinkleAsperges = () => {
    playLiturgicalSound('spray');
    setSprinkleCount((prev) => prev + 1);
  };

  const handleAddIncenseSpoon = () => {
    if (incenseSpoonsAdded < 3) {
      playLiturgicalSound('hiss');
      setIncenseSpoonsAdded((prev) => prev + 1);
    }
  };

  const handleThuribleSwing = () => {
    if (isSwinging) return;
    setIsSwinging(true);
    playLiturgicalSound('chain');

    setTimeout(() => {
      playLiturgicalSound('chain');
    }, 180);

    setTimeout(() => {
      setSwingsPerformed((prev) => prev + 1);
      setIsSwinging(false);
    }, 400);
  };

  const currentQuiz = HOLY_WATER_THURIFER_QUIZ[currentQuizIdx];

  const handleQuizSelect = (optIdx: number) => {
    if (quizAnswered) return;
    setSelectedOption(optIdx);
    setQuizAnswered(true);
    if (optIdx === currentQuiz.correctIndex) {
      setQuizScore((s) => s + 1);
      playSuccessChime();
      triggerHapticSuccess();
    } else {
      triggerHapticError();
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setQuizAnswered(false);
    setCurrentQuizIdx((prev) => (prev + 1) % HOLY_WATER_THURIFER_QUIZ.length);
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #075985 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.6rem' }}>💧</span>
            <span style={{ fontSize: '1.6rem' }}>💨</span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#e0f2fe',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Catholic Sacramental &amp; Altar Server Lab
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Holy Water (Aqua Benedicta) &amp; The Thurifer (Thuribulum)
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#bae6fd', maxWidth: '640px', lineHeight: 1.45 }}>
            Discover the two sublime sensory sacramentals of Catholic worship: sanctified water recalling our Holy Baptism, and fragrant incense rising like prayer before the throne of God (Psalm 141:2).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleSpeech('Holy Water recalls our Baptism and cleanses our hearts. The Thurifer carries the thurible, leading the procession with sweet incense that rises like our prayers before God.')}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🔊</span>
            <span>Listen Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPlayer(!showPlayer)}
            style={{
              background: showPlayer ? '#0284c7' : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{showPlayer ? '▲ Hide Vector Sim' : '🎮 Vector Simulation'}</span>
          </button>

          <Link
            to="/media-player?preset=holy-water-thurifer"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <span>📺 Full Player</span>
          </Link>
        </div>
      </div>

      {/* Embedded AST Vector Media Player for Holy Water & Thurifer */}
      {showPlayer && (
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid #0284c7', background: '#0b101b', marginBottom: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ background: '#0f172a', padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#38bdf8' }}>
              <span>💨</span>
              <span>AST Vector Interactive Engine: Holy Water &amp; The Thurible (Thuribulum)</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>Cartridge: holy-water-thurifer.ast</span>
          </div>
          <AstVectorMediaPlayer
            preset="holy-water-thurifer"
            height="clamp(240px, 45vw + 40px, 420px)"
            allowPresetSwitch={false}
            embedded={true}
            bslEnabled={false}
          />
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #f1f5f9',
        }}
      >
        {[
          { id: 'holy-water', label: '💧 Holy Water & Asperges', badge: 'Sacramental Grace' },
          { id: 'thurifer-incense', label: '💨 The Thurifer & Thurible', badge: '7 Mass Incensations' },
          { id: 'simulator', label: '🧪 Altar Server Lab', badge: 'Interactive Practice' },
          { id: 'quiz', label: '❓ Knowledge Check', badge: `${HOLY_WATER_THURIFER_QUIZ.length} Challenges` },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ExplorerTab)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                background: isSelected ? '#0284c7' : '#f8fafc',
                color: isSelected ? '#ffffff' : '#334155',
                fontWeight: isSelected ? 700 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
                  color: isSelected ? '#ffffff' : '#64748b',
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. HOLY WATER & ASPERGES */}
      {activeTab === 'holy-water' && (
        <div>
          {/* Interactive Stoup & Blessing Simulator */}
          <div
            style={{
              background: '#f0f9ff',
              border: '2px solid #bae6fd',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.5rem' }}>💧</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0369a1' }}>
                  Interactive Rite at the Church Threshold
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0c4a6e' }}>
                Blessing at the Holy Water Stoup (Pila Aquae Benedictae)
              </h3>
              <p style={{ margin: '6px 0 12px', fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.45 }}>
                Before entering the church Nave, touch the holy water with your right fingers and make the Sign of the Cross.
              </p>

              {/* Step indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {[
                  { step: 0, label: '1. Dip right hand fingers into the sanctified water', icon: '🖐️' },
                  { step: 1, label: '2. Touch forehead: "In the name of the Father..."', icon: '🧠' },
                  { step: 2, label: '3. Touch breast: "...and of the Son..."', icon: '❤️' },
                  { step: 3, label: '4. Touch left to right shoulder: "...and of the Holy Spirit. Amen."', icon: '✝️' },
                ].map((item) => {
                  const isActive = blessingStep === item.step;
                  const isDone = blessingStep > item.step;
                  return (
                    <div
                      key={item.step}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: isActive ? '#e0f2fe' : isDone ? '#dcfce7' : '#ffffff',
                        border: isActive ? '1px solid #38bdf8' : isDone ? '1px solid #86efac' : '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#0369a1' : isDone ? '#166534' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleBlessingStep}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                <span>💧</span>
                <span>{blessingStep === 0 ? 'Touch Holy Water Stoup' : blessingStep < 4 ? 'Continue Sign of the Cross' : 'Reset Blessing'}</span>
              </button>
            </div>

            {/* Asperges Mode Switcher */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7' }}>
                  Sunday Asperges Sprinkling Rite
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                  Sprinkled: {sprinkleCount} times
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAspergesMode('ordinary')}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: aspergesMode === 'ordinary' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    background: aspergesMode === 'ordinary' ? '#e0f2fe' : '#f8fafc',
                    color: aspergesMode === 'ordinary' ? '#0369a1' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🌿 Ordinary Time: Asperges Me (Ps 51)
                </button>
                <button
                  type="button"
                  onClick={() => setAspergesMode('easter')}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: aspergesMode === 'easter' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    background: aspergesMode === 'easter' ? '#e0f2fe' : '#f8fafc',
                    color: aspergesMode === 'easter' ? '#0369a1' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ☀️ Eastertide: Vidi Aquam (Ez 47)
                </button>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  color: '#1e293b',
                  lineHeight: 1.4,
                  marginBottom: '10px',
                }}
              >
                {aspergesMode === 'ordinary' ? (
                  <div>
                    <strong style={{ color: '#0369a1' }}>"Asperges me, Domine, hyssopo, et mundabor..."</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                      "Thou shalt sprinkle me with hyssop, O Lord, and I shall be cleansed; Thou shalt wash me, and I shall be made whiter than snow." (Psalm 51:7)
                    </p>
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: '#0369a1' }}>"Vidi aquam egredientem de templo, a latere dextro, alleluia..."</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                      "I saw water flowing forth from the temple, from the right side, alleluia; and all to whom that water came were saved." (Ezekiel 47:1)
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSprinkleAsperges}
                style={{
                  width: '100%',
                  background: '#0369a1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🌿</span>
                <span>Sprinkle Congregation with Aspergillum (Hyssop)</span>
              </button>
            </div>
          </div>

          {/* Cards for Holy Water Catechesis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {HOLY_WATER_CATECHESIS.map((fact) => {
              const isSelected = selectedWaterFact.id === fact.id;
              return (
                <div
                  key={fact.id}
                  onClick={() => setSelectedWaterFact(fact)}
                  style={{
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '1.8rem',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '4px 8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {fact.icon}
                    </span>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                        {fact.catechismRef}
                      </span>
                      <h4 style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        {fact.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                        {fact.latinTitle}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                    {fact.summary}
                  </p>

                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      color: '#475569',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <strong>Theology:</strong> {fact.theologicalDepth}
                  </div>

                  <div
                    style={{
                      background: '#fefce8',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.76rem',
                      color: '#854d0e',
                      border: '1px solid #fef08a',
                      marginTop: 'auto',
                    }}
                  >
                    💡 <strong>Parish &amp; Home Practice:</strong> {fact.practicalAction}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. THE THURIFER & THURIBLE */}
      {activeTab === 'thurifer-incense' && (
        <div>
          {/* Intro Box */}
          <div
            style={{
              background: '#fef3c7',
              border: '2px solid #fde68a',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '1.5rem' }}>🧑‍🤝‍🧑</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309' }}>
                  The Leading Altar Server &amp; Biblical Frankincense
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#78350f' }}>
                The Thurifer (Thuriferarius) &amp; Boat Bearer (Navicularius)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#92400e', maxWidth: '640px', lineHeight: 1.45 }}>
                Incense in the Catholic Mass is biblical prayer made visible: "Let my prayer rise before you like incense, the lifting up of my hands like an evening sacrifice" (Psalm 141:2, Revelation 8:3–4).
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSpeech('The Thurifer holds the burning thurible and leads the processions. The Boat Bearer holds the incense boat and spoon. GIRM specifies three double swings for the Blessed Sacrament, the crucifix, the Gospel, the priest, and the congregation.')}
              style={{
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              🔊 Listen Server Rules
            </button>
          </div>

          {/* Thurifer Role Facts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {THURIFER_AND_INCENSE_CATECHESIS.map((fact) => (
              <div
                key={fact.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '1.6rem',
                      background: '#fffbeb',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      border: '1px solid #fde68a',
                    }}
                  >
                    {fact.icon}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                      {fact.rubricRef}
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {fact.title}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                      {fact.latinTitle}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                  {fact.description}
                </p>

                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '0.76rem',
                    color: '#475569',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <strong>Rubric / Swings:</strong> {fact.swingPattern}
                </div>

                <div
                  style={{
                    background: '#fef3c7',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    fontSize: '0.76rem',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    marginTop: 'auto',
                  }}
                >
                  🕊️ <strong>Spiritual Meaning:</strong> {fact.spiritualSignificance}
                </div>
              </div>
            ))}
          </div>

          {/* The 7 Moments of Incensation in Mass */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📜</span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                The 7 Moments of Incensation in Solemn Mass (GIRM 276–277)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
              {INCENSATION_MOMENTS.map((moment) => (
                <div
                  key={moment.order}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      Step {moment.order}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                      {moment.girmRule}
                    </span>
                  </div>

                  <h4 style={{ margin: '2px 0 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    {moment.moment}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                    {moment.latinMoment}
                  </span>

                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                    <strong>Target:</strong> {moment.target}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>
                    <strong>Swings:</strong> {moment.swings}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.35 }}>
                    {moment.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE ALTAR SERVER SIMULATOR */}
      {activeTab === 'simulator' && (
        <div>
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.6rem' }}>🧪</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#a5b4fc' }}>
                Procedural Liturgical Altar Server Simulator
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Master the Thurible: Grains, Coals &amp; Ductus-Ictus Swings
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#c7d2fe', lineHeight: 1.45 }}>
              Step into the shoes of the parish Thurifer. Spoon grains of frankincense onto the hot coals, choose your sacred liturgical target, and perform the exact triple double swings mandated by the Roman Missal.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            {/* Step 1: Charge the Coals */}
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #e0e7ff',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>⛵</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e1b4b' }}>
                    1. Spoon Frankincense from the Boat
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
                    Navicula &amp; Cochlear
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, margin: '0 0 12px' }}>
                The priest blesses the incense: <em>"May this incense be blessed in honour of Him for Whom it is burned. Amen."</em> Spoon 3 measures onto the coals.
              </p>

              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                {/* Glowing Charcoal representation */}
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: incenseSpoonsAdded > 0
                      ? 'radial-gradient(circle, #f97316 0%, #ea580c 45%, #7c2d12 80%, #1e293b 100%)'
                      : 'radial-gradient(circle, #ef4444 0%, #991b1b 50%, #450a0a 100%)',
                    boxShadow: incenseSpoonsAdded > 0
                      ? '0 0 25px rgba(249, 115, 22, 0.8), 0 0 40px rgba(234, 88, 12, 0.4)'
                      : '0 0 10px rgba(239, 68, 68, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {incenseSpoonsAdded === 0 ? '🔥' : '💨'}
                </div>
                <span style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
                  {incenseSpoonsAdded === 0
                    ? 'Glowing Charcoal (Ready)'
                    : `Incense Fragrance Active (${incenseSpoonsAdded}/3 Spoons)`}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAddIncenseSpoon}
                  disabled={incenseSpoonsAdded >= 3}
                  style={{
                    flex: 1,
                    background: incenseSpoonsAdded >= 3 ? '#94a3b8' : '#4338ca',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: incenseSpoonsAdded >= 3 ? 'default' : 'pointer',
                  }}
                >
                  🥄 Add Spoon of Incense ({incenseSpoonsAdded}/3)
                </button>
                {incenseSpoonsAdded > 0 && (
                  <button
                    type="button"
                    onClick={() => setIncenseSpoonsAdded(0)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Choose Target & Perform Swings */}
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #e0e7ff',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🏺</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e1b4b' }}>
                    2. Select Target &amp; Swing (GIRM 277)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
                    Ductus &amp; Ictus Precision
                  </span>
                </div>
              </div>

              {/* Target Selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {[
                  { id: 'sacrament', label: '✨ Blessed Sacrament (3 Double Swings)' },
                  { id: 'gospel', label: '📖 Book of Gospels (3 Double Swings)' },
                  { id: 'crucifix', label: '✝️ Altar Crucifix (3 Double Swings)' },
                  { id: 'priest', label: '🧑‍🦳 Priest Celebrant (3 Double Swings)' },
                  { id: 'people', label: '👥 The Congregation (3 Double Swings)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSimTarget(t.id as any);
                      setSwingsPerformed(0);
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: simTarget === t.id ? '1px solid #4338ca' : '1px solid #e2e8f0',
                      background: simTarget === t.id ? '#e0e7ff' : '#f8fafc',
                      color: simTarget === t.id ? '#312e81' : '#475569',
                      fontSize: '0.76rem',
                      fontWeight: simTarget === t.id ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Swings counter & visual */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  textAlign: 'center',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    transform: isSwinging ? 'rotate(25deg) scale(1.15)' : 'rotate(0deg)',
                    transition: 'transform 0.18s ease-in-out',
                    marginBottom: '6px',
                  }}
                >
                  {isSwinging ? '💨' : '🏺'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Swings Completed: {swingsPerformed} / 3 Double Swings
                </div>
                <div style={{ fontSize: '0.78rem', color: swingsPerformed >= 3 ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                  {swingsPerformed >= 3
                    ? '✅ Rubric Fulfilled! Bow reverently to the sacred object.'
                    : 'Click Swing to raise the thurible and thrust forward twice.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleThuribleSwing}
                  disabled={isSwinging}
                  style={{
                    flex: 1,
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: isSwinging ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🔄</span>
                  <span>{isSwinging ? 'Swinging Censer...' : 'Perform Double Swing (Ductus + Ictus)'}</span>
                </button>
                {swingsPerformed > 0 && (
                  <button
                    type="button"
                    onClick={() => setSwingsPerformed(0)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. LITURGICAL QUIZ */}
      {activeTab === 'quiz' && (
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7' }}>
                Question {currentQuizIdx + 1} of {HOLY_WATER_THURIFER_QUIZ.length}
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {currentQuiz.question}
              </h3>
            </div>
            <div
              style={{
                background: '#f0f9ff',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              Score: {quizScore}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
            {currentQuiz.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuiz.correctIndex;

              let bg = '#f8fafc';
              let border = '1px solid #cbd5e1';
              let color = '#1e293b';

              if (quizAnswered) {
                if (isCorrect) {
                  bg = '#dcfce7';
                  border = '2px solid #16a34a';
                  color = '#15803d';
                } else if (isSelected) {
                  bg = '#fee2e2';
                  border = '2px solid #dc2626';
                  color = '#b91c1c';
                }
              } else if (isSelected) {
                bg = '#e0f2fe';
                border = '2px solid #0284c7';
                color = '#0369a1';
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleQuizSelect(idx)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: bg,
                    border,
                    color,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: quizAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div
              style={{
                background: selectedOption === currentQuiz.correctIndex ? '#f0fdf4' : '#fef2f2',
                border: selectedOption === currentQuiz.correctIndex ? '1px solid #86efac' : '1px solid #fca5a5',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedOption === currentQuiz.correctIndex ? '#166534' : '#991b1b', marginBottom: '4px' }}>
                {selectedOption === currentQuiz.correctIndex ? '✅ Correct!' : '❌ Catechetical Clarification:'}
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                {currentQuiz.explanation}
              </p>
              <div style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                Citation: {currentQuiz.citation}
              </div>
            </div>
          )}

          {quizAnswered && (
            <button
              type="button"
              onClick={handleNextQuiz}
              style={{
                width: '100%',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Next Question &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
