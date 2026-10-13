// src/components/AltarAnatomyExplorer.tsx
/**
 * Sacred Anatomy of the Catholic Altar & Types of Altars Explorer
 * 
 * Interactive pedagogical liturgical module for St Joseph's Curriculum Portal.
 * Explores the theological significance, liturgical furnishings, sacred linens,
 * and historical forms of the Catholic Altar (Versus Populum, High Altar, Altar Stone, Side Altars).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ALTAR_TYPES,
  ALTAR_APPOINTMENTS,
  ALTAR_DRESSING_STEPS,
  LITURGICAL_SEASON_THEMES,
  ALTAR_CANDLE_RULES,
  TABERNACLE_CATECHESIS,
  RITE_ALTAR_TRADITIONS,
  AltarTypeInfo,
  AltarAppointment,
  AltarDressingStep,
  AltarCandleRule,
  TabernacleCatechesis,
  RiteAltarTradition,
} from '../data/catholic/altarData';

export type AltarTabMode = 'anatomy' | 'candles' | 'tabernacle' | 'eastern-rites' | 'types' | 'dress-altar' | 'relic-xray';
export type CandleMode = 'daily' | 'sunday' | 'bishop';

export const AltarAnatomyExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AltarTabMode>('anatomy');
  const [selectedSeason, setSelectedSeason] = useState<string>('green');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('mensa');
  const [selectedAltarTypeId, setSelectedAltarTypeId] = useState<string>('freestanding');
  const [selectedRiteId, setSelectedRiteId] = useState<string>('roman-ordinary');
  const [candleMode, setCandleMode] = useState<CandleMode>('sunday');
  const [dressingStep, setDressingStep] = useState<number>(0);
  const [xrayActive, setXrayActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [candleQuizAnswers, setCandleQuizAnswers] = useState<Record<number, number>>({});
  const [tabernacleDoorOpen, setTabernacleDoorOpen] = useState<boolean>(false);
  const [tabernacleVeilActive, setTabernacleVeilActive] = useState<boolean>(true);
  const [tabernacleQuizAnswers, setTabernacleQuizAnswers] = useState<Record<number, number>>({});

  // Active items
  const currentSeason = LITURGICAL_SEASON_THEMES[selectedSeason] || LITURGICAL_SEASON_THEMES.green;
  const activeAppointment = useMemo(() => {
    return ALTAR_APPOINTMENTS.find((a) => a.id === selectedAppointmentId) || ALTAR_APPOINTMENTS[0];
  }, [selectedAppointmentId]);

  const activeAltarType = useMemo(() => {
    return ALTAR_TYPES.find((t) => t.id === selectedAltarTypeId) || ALTAR_TYPES[0];
  }, [selectedAltarTypeId]);

  // Procedural Web Audio Synthesis for Sanctus Bells, Tabernacle latch, and UI feedback
  const playSacredSound = useCallback(
    (type: 'bell' | 'chime' | 'organ' | 'click' | 'latch') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'latch') {
          // Warm metallic latch sound of consecrated tabernacle key & solid door
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(340, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.16);
          gain.gain.setValueAtTime(0.14, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'bell') {
          // Triple silver sanctus chime: 1200Hz, 1500Hz, 1800Hz
          [1174.66, 1479.98, 1760.0].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
            gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.08);
            osc.stop(ctx.currentTime + idx * 0.08 + 1.25);
          });
        } else if (type === 'organ') {
          // Sacred organ triad: C4 (261.6Hz), E4 (329.6Hz), G4 (392.0Hz)
          [261.63, 329.63, 392.0].forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 1.85);
          });
        } else if (type === 'chime') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.42);
        } else {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        }
      } catch {
        // AudioContext fallback
      }
    },
    [soundEnabled]
  );

  const handleSelectAppointment = (id: string) => {
    setSelectedAppointmentId(id);
    if (id === 'sanctus-bells') {
      playSacredSound('bell');
    } else if (id === 'tabernacle') {
      playSacredSound('organ');
    } else if (id === 'sanctuary-lamp') {
      playSacredSound('chime');
    } else if (id === 'ciborium') {
      playSacredSound('chime');
    } else {
      playSacredSound('chime');
    }
  };

  const handleAdvanceDressingStep = () => {
    if (dressingStep < ALTAR_DRESSING_STEPS.length - 1) {
      const next = dressingStep + 1;
      setDressingStep(next);
      playSacredSound('chime');
      setSelectedAppointmentId(ALTAR_DRESSING_STEPS[next].itemKey);
    } else {
      setDressingStep(0);
      playSacredSound('bell');
      setSelectedAppointmentId(ALTAR_DRESSING_STEPS[0].itemKey);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Top Catholic Title Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          borderBottom: '3px solid #facc15',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'rgba(250, 204, 21, 0.2)',
                color: '#fef08a',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              ✝️ Altare Christi &bull; GIRM 295–310
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Sacred Liturgy &amp; Architecture
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            The Catholic Altar: Sacred Anatomy &amp; Liturgical Forms
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
            Explore the sacred furnishings of the Eucharistic Table, compare historical altar types, examine the martyr relics, and dress the altar step-by-step.
          </p>
        </div>

        {/* Liturgical Season Selector & Audio Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase' }}>
              Liturgical Season Color:
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(LITURGICAL_SEASON_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedSeason(key);
                    playSacredSound('chime');
                  }}
                  title={`${theme.season} (${theme.colorName})`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: theme.hex,
                    border: selectedSeason === key ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transform: selectedSeason === key ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    boxShadow: selectedSeason === key ? '0 0 10px rgba(255,255,255,0.6)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute liturgical bells' : 'Enable liturgical bells'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {soundEnabled ? '🔔 Sound On' : '🔕 Muted'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.5rem 1.5rem',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('anatomy');
            playSacredSound('click');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'anatomy' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'anatomy' ? '#ffffff' : '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🔍</span>
          <span>Interactive Anatomy &amp; Contents</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('candles');
            playSacredSound('chime');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'candles' ? '#b45309' : 'transparent',
            color: activeTab === 'candles' ? '#ffffff' : '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🕯️</span>
          <span>Altar Candles (2, 6, 7 Rule)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('tabernacle');
            playSacredSound('organ');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'tabernacle' ? '#701a75' : 'transparent',
            color: activeTab === 'tabernacle' ? '#ffffff' : '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🏛️</span>
          <span>The Tabernacle &amp; Altar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('eastern-rites');
            playSacredSound('chime');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'eastern-rites' ? '#047857' : 'transparent',
            color: activeTab === 'eastern-rites' ? '#ffffff' : '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🌍</span>
          <span>Across All Catholic Rites (24 Churches)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('types');
            playSacredSound('click');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'types' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'types' ? '#ffffff' : '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🏛️</span>
          <span>Types of Altars (4 Forms)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('dress-altar');
            playSacredSound('click');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'dress-altar' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'dress-altar' ? '#ffffff' : '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>✨</span>
          <span>"Dress the Altar" Sacristan Lab</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('relic-xray');
            playSacredSound('organ');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'relic-xray' ? '#b45309' : 'transparent',
            color: activeTab === 'relic-xray' ? '#ffffff' : '#475569',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🪨</span>
          <span>Altar Stone &amp; Martyrs' Relics (X-Ray)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '1.75rem 2rem' }}>
        {/* ========================================================================= */}
        {/* 1. INTERACTIVE ANATOMY & CONTENTS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'anatomy' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
              {/* Left Column: Visual Altar Stage with Interactive SVG Hotspots */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #090d16 0%, #0f172a 100%)',
                  borderRadius: '16px',
                  border: '2px solid #334155',
                  padding: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {/* Stage Header Info Banner */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '16px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(9, 13, 22, 0.85)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${currentSeason.borderHex}`,
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: currentSeason.textHex, fontWeight: 800 }}>
                    {currentSeason.season} &bull; {currentSeason.colorName}
                  </span>
                </div>

                {/* Liturgical Candle Configuration Bar (2 for normal, 6 for sunday, 7 if bishop is in the house!) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(9, 13, 22, 0.92)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 800, marginRight: '4px' }}>
                    🕯️ Candles:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCandleMode('daily');
                      setSelectedAppointmentId('altar-candles');
                      playSacredSound('chime');
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: candleMode === 'daily' ? '#2563eb' : '#334155',
                      color: '#ffffff',
                      transition: 'all 0.15s ease',
                    }}
                    title="GIRM 117: At least 2 candles for weekday Mass"
                  >
                    2 (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCandleMode('sunday');
                      setSelectedAppointmentId('altar-candles');
                      playSacredSound('chime');
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: candleMode === 'sunday' ? '#d97706' : '#334155',
                      color: '#ffffff',
                      transition: 'all 0.15s ease',
                    }}
                    title="GIRM 117: 4 or 6 candles for Sunday Mass and Solemnities"
                  >
                    6 (Sunday)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCandleMode('bishop');
                      setSelectedAppointmentId('altar-candles');
                      playSacredSound('bell');
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: candleMode === 'bishop' ? '#9333ea' : '#334155',
                      color: '#ffffff',
                      boxShadow: candleMode === 'bishop' ? '0 0 10px rgba(168, 85, 247, 0.6)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title="GIRM 117 & Ceremonial of Bishops §125: 7 candles when Diocesan Bishop celebrates"
                  >
                    👑 7 (Bishop in the House!)
                  </button>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '16px',
                    zIndex: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setXrayActive(!xrayActive);
                      playSacredSound('click');
                    }}
                    style={{
                      background: xrayActive ? '#f59e0b' : 'rgba(30, 41, 59, 0.85)',
                      color: xrayActive ? '#0f172a' : '#f8fafc',
                      border: '1px solid #64748b',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {xrayActive ? '🩻 Relic X-Ray: ACTIVE' : '🩻 View Altar Stone X-Ray'}
                  </button>
                </div>

                {/* SVG Visual Stage */}
                <svg
                  viewBox="0 0 800 480"
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '440px' }}
                >
                  <defs>
                    <radialGradient id="altar-ambient-glow" cx="50%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="rgba(250, 204, 21, 0.18)" />
                      <stop offset="70%" stopColor="rgba(15, 23, 42, 0.05)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <filter id="altar-flame-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Sacred Sanctuary Floor Backdrop */}
                  <rect x="0" y="0" width="800" height="480" fill="#090d16" />
                  <circle cx="400" cy="200" r="300" fill="url(#altar-ambient-glow)" />

                  {/* ========================================================================= */}
                  {/* SACRED TABERNACLE & PERPETUAL RED SANCTUARY LAMP (GIRM 314-317, CANON 940) */}
                  {/* ========================================================================= */}
                  {/* Apse Arch & Stone Retable Niche in Sanctuary Wall */}
                  <g>
                    {/* Architectural stone apse arch alcove */}
                    <path
                      d="M 334 100 L 334 46 Q 400 10 466 46 L 466 100 Z"
                      fill="#0d1527"
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                    <path
                      d="M 342 98 L 342 48 Q 400 16 458 48 L 458 98 Z"
                      fill="#0a0f1d"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    {/* Elevated marble plinth / sanctuary pedestal */}
                    <rect x="348" y="88" width="104" height="10" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <line x1="348" y1="88" x2="452" y2="88" stroke="#94a3b8" strokeWidth="1" />
                  </g>

                  {/* The Sacred Tabernacle Element */}
                  <g
                    onClick={() => handleSelectAppointment('tabernacle')}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Golden Shekinah Halo when Tabernacle is selected */}
                    {selectedAppointmentId === 'tabernacle' && (
                      <circle
                        cx="400"
                        cy="58"
                        r="38"
                        fill="rgba(250, 204, 21, 0.22)"
                        stroke="#facc15"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        filter="url(#altar-flame-glow)"
                      />
                    )}

                    {/* Tabernacle Base and Pediment */}
                    <polygon points="366,48 400,24 434,48" fill="#ca8a04" stroke="#facc15" strokeWidth="1.2" />
                    {/* Top Cross atop Tabernacle */}
                    <line x1="400" y1="16" x2="400" y2="24" stroke="#fef08a" strokeWidth="2" />
                    <line x1="396" y1="19" x2="404" y2="19" stroke="#fef08a" strokeWidth="1.5" />

                    {/* Outer Tabernacle Solid Golden Chest */}
                    <rect x="368" y="48" width="64" height="40" rx="3" fill="#ca8a04" stroke="#facc15" strokeWidth="1.5" />

                    {/* Interior Chamber & Golden Ciborium when Door is Open */}
                    {tabernacleDoorOpen ? (
                      <>
                        {/* Sacred interior chamber */}
                        <rect x="371" y="50" width="58" height="36" rx="2" fill="#451a03" stroke="#78350f" strokeWidth="1" />
                        {/* Consecrated white linen corporal inside */}
                        <rect x="375" y="82" width="50" height="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />

                        {/* The Golden Ciborium with consecrated Hosts */}
                        <g onClick={(e) => { e.stopPropagation(); handleSelectAppointment('ciborium'); }}>
                          {/* Ciborium Stem & Base */}
                          <polygon points="396,82 404,82 401,76 399,76" fill="#facc15" />
                          {/* Ciborium Cup */}
                          <ellipse cx="400" cy="71" rx="9" ry="5.5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
                          {/* Domed Lid with Cross */}
                          <path d="M 392 69 Q 400 62 408 69 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
                          <line x1="400" y1="58" x2="400" y2="62" stroke="#facc15" strokeWidth="1.2" />
                          <line x1="398" y1="60" x2="402" y2="60" stroke="#facc15" strokeWidth="1" />
                        </g>

                        {/* Open Doors Folded Outward */}
                        <polygon points="352,50 368,48 368,88 352,86" fill="#eab308" stroke="#facc15" strokeWidth="1" />
                        <polygon points="432,48 448,50 448,86 432,88" fill="#eab308" stroke="#facc15" strokeWidth="1" />
                      </>
                    ) : (
                      <>
                        {/* Closed Double Golden Doors */}
                        <rect x="370" y="50" width="30" height="36" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
                        <rect x="400" y="50" width="30" height="36" fill="#b45309" stroke="#92400e" strokeWidth="0.8" />
                        {/* Keyhole for consecrated Tabernacle Key */}
                        <circle cx="399" cy="68" r="1.6" fill="#1c1917" />
                        <line x1="399" y1="68" x2="399" y2="72" stroke="#1c1917" strokeWidth="0.8" />

                        {/* Engraved Sacred Reliefs: Cross on Left, Chi-Rho on Right */}
                        <line x1="385" y1="56" x2="385" y2="78" stroke="#fef08a" strokeWidth="1.2" />
                        <line x1="379" y1="63" x2="391" y2="63" stroke="#fef08a" strokeWidth="1.2" />
                        <line x1="415" y1="56" x2="415" y2="78" stroke="#fef08a" strokeWidth="1.2" />
                        <circle cx="415" cy="62" r="4" fill="none" stroke="#fef08a" strokeWidth="1.2" />

                        {/* Conopeum (Liturgical Silk Veil) draped when active and doors are closed */}
                        {tabernacleVeilActive && (
                          <g>
                            <path
                              d="M 366 46 Q 400 42 434 46 L 436 84 Q 428 87 420 83 Q 400 87 380 83 Q 372 87 364 84 Z"
                              fill={currentSeason.hex}
                              opacity="0.88"
                              stroke={currentSeason.borderHex}
                              strokeWidth="1.2"
                            />
                            {/* Gold cross on conopeum */}
                            <line x1="400" y1="54" x2="400" y2="72" stroke="#fef08a" strokeWidth="1.5" />
                            <line x1="394" y1="60" x2="406" y2="60" stroke="#fef08a" strokeWidth="1.5" />
                          </g>
                        )}
                      </>
                    )}

                    {/* Title label */}
                    <text
                      x="400"
                      y="94"
                      fill={selectedAppointmentId === 'tabernacle' ? '#fde047' : '#facc15'}
                      fontSize="6.8"
                      fontWeight="900"
                      textAnchor="middle"
                      letterSpacing="0.8"
                    >
                      TABERNACULUM &bull; REAL PRESENCE
                    </text>
                  </g>

                  {/* The Perpetual Red Sanctuary Lamp (Canon 940) */}
                  <g
                    onClick={() => handleSelectAppointment('sanctuary-lamp')}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hanging Brass Chain from Apse Ceiling */}
                    <line x1="478" y1="16" x2="478" y2="44" stroke="#eab308" strokeWidth="1" strokeDasharray="2 2" />
                    {/* Brass lamp fixture */}
                    <polygon points="472,44 484,44 481,48 475,48" fill="#ca8a04" stroke="#facc15" strokeWidth="0.8" />
                    {/* Glowing Red Glass Container */}
                    <ellipse cx="478" cy="58" rx="6.5" ry="9.5" fill="#dc2626" stroke="#ef4444" strokeWidth="1" />
                    {/* Continuous Vigil Flame */}
                    <circle cx="478" cy="56" r="4.5" fill="#fef08a" filter="url(#altar-flame-glow)" />
                    <circle cx="478" cy="55" r="2.2" fill="#ffffff" />
                    {/* Radiant red sanctuary presence aura */}
                    <circle cx="478" cy="56" r="16" fill="rgba(239, 68, 68, 0.35)" filter="url(#altar-flame-glow)" />

                    {selectedAppointmentId === 'sanctuary-lamp' && (
                      <circle cx="478" cy="56" r="20" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" />
                    )}

                    <text x="478" y="73" fill="#f87171" fontSize="5.5" fontWeight="900" textAnchor="middle">
                      CANON 940 LAMP
                    </text>
                  </g>

                  {/* Sanctuary Steps (Suppedaneum - 3 steps to the Altar) */}
                  <polygon points="120,440 680,440 650,400 150,400" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                  <polygon points="150,400 650,400 620,360 180,360" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                  <polygon points="180,360 620,360 590,320 210,320" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <text x="400" y="425" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold" letterSpacing="2">
                    SANCTUARY PLATFORM &bull; THREE LITURGICAL STEPS (FAITH, HOPE, CHARITY)
                  </text>

                  {/* The Altar Structure Base & Columns */}
                  <rect x="250" y="240" width="300" height="80" rx="4" fill="#0b1120" stroke="#334155" strokeWidth="2" />

                  {/* Dynamic Antependium (Altar Frontal Fabric) */}
                  <g
                    onClick={() => handleSelectAppointment('antependium')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x="256"
                      y="244"
                      width="288"
                      height="72"
                      rx="2"
                      fill={currentSeason.hex}
                      stroke={currentSeason.borderHex}
                      strokeWidth={selectedAppointmentId === 'antependium' ? 3 : 1.5}
                    />
                    {/* Gold fringing and embroidered IHS / Cross */}
                    <line x1="256" y1="312" x2="544" y2="312" stroke="#facc15" strokeWidth="3" strokeDasharray="4 2" />
                    <circle cx="400" cy="280" r="18" fill="rgba(0,0,0,0.25)" stroke="#facc15" strokeWidth="1.5" />
                    <text x="400" y="285" fill="#fef08a" fontSize="13" fontWeight="900" textAnchor="middle">
                      IHS
                    </text>
                    <text x="400" y="304" fill="#fef08a" fontSize="7" fontWeight="bold" textAnchor="middle">
                      ANTEPENDIUM
                    </text>
                  </g>

                  {/* Consecrated Mensa (Stone Tabletop) */}
                  <g
                    onClick={() => handleSelectAppointment('mensa')}
                    style={{ cursor: 'pointer' }}
                  >
                    <polygon
                      points="220,240 580,240 600,210 200,210"
                      fill="#e2e8f0"
                      stroke={selectedAppointmentId === 'mensa' ? '#facc15' : '#ffffff'}
                      strokeWidth={selectedAppointmentId === 'mensa' ? 3.5 : 2}
                    />
                    <text x="400" y="232" fill="#0f172a" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1">
                      MENSA ALTARIS &bull; CONSECRATED CORNERSTONE
                    </text>
                  </g>

                  {/* White Altar Linen (Falling over sides) */}
                  <g
                    onClick={() => handleSelectAppointment('altar-cloth')}
                    style={{ cursor: 'pointer' }}
                  >
                    <polygon
                      points="216,236 584,236 596,214 204,214"
                      fill="#f8fafc"
                      opacity="0.95"
                      stroke={selectedAppointmentId === 'altar-cloth' ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={selectedAppointmentId === 'altar-cloth' ? 2.5 : 1}
                    />
                    {/* Linen drape edges */}
                    <path d="M 216 236 L 216 270 Q 220 274, 224 270 L 224 236" fill="#f8fafc" stroke="#94a3b8" />
                    <path d="M 584 236 L 584 270 Q 580 274, 576 270 L 576 236" fill="#f8fafc" stroke="#94a3b8" />
                  </g>

                  {/* Altar Stone Inset (Normal or X-Ray View) */}
                  <g
                    onClick={() => handleSelectAppointment('altar-stone')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x="350"
                      y="218"
                      width="100"
                      height="16"
                      rx="2"
                      fill={xrayActive ? '#ca8a04' : '#94a3b8'}
                      stroke={selectedAppointmentId === 'altar-stone' || xrayActive ? '#facc15' : '#64748b'}
                      strokeWidth={2}
                      filter={xrayActive ? 'url(#altar-flame-glow)' : 'none'}
                    />
                    <text x="400" y="230" fill={xrayActive ? '#ffffff' : '#0f172a'} fontSize="8" fontWeight="bold" textAnchor="middle">
                      {xrayActive ? '✝ ARA &bull; RELICS OF MARTYRS ✝' : 'ALTAR STONE'}
                    </text>
                  </g>

                  {/* The Corporal (Unfolded 9-square white linen in the center) */}
                  <g
                    onClick={() => handleSelectAppointment('corporal')}
                    style={{ cursor: 'pointer' }}
                  >
                    <polygon
                      points="370,225 430,225 436,205 364,205"
                      fill="#ffffff"
                      stroke={selectedAppointmentId === 'corporal' ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={selectedAppointmentId === 'corporal' ? 2.5 : 1.5}
                    />
                    <line x1="390" y1="205" x2="390" y2="225" stroke="#e2e8f0" strokeDasharray="1 2" />
                    <line x1="410" y1="205" x2="410" y2="225" stroke="#e2e8f0" strokeDasharray="1 2" />
                  </g>

                  {/* Central Altar Crucifix */}
                  <g
                    onClick={() => handleSelectAppointment('altar-crucifix')}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Crucifix Base */}
                    <polygon points="388,190 412,190 408,180 392,180" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    {/* Vertical Beam */}
                    <rect x="397" y="100" width="6" height="80" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    {/* Horizontal Crossbar */}
                    <rect x="382" y="118" width="36" height="6" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    {/* Corpus (Body of Christ) */}
                    <line x1="400" y1="112" x2="400" y2="135" stroke="#f8fafc" strokeWidth="2.5" />
                    <line x1="388" y1="121" x2="412" y2="121" stroke="#f8fafc" strokeWidth="2" />
                    <circle cx="400" cy="110" r="3" fill="#f8fafc" />
                    {selectedAppointmentId === 'altar-crucifix' && (
                      <circle cx="400" cy="120" r="28" fill="rgba(250, 204, 21, 0.2)" stroke="#facc15" strokeWidth="1.5" />
                    )}
                  </g>

                  {/* Altar Candles (Dynamic: 2 for daily, 6 for Sunday, 7 if Bishop is in the house!) */}
                  <g
                    onClick={() => handleSelectAppointment('altar-candles')}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selected Highlight Aura */}
                    {selectedAppointmentId === 'altar-candles' && (
                      <rect
                        x="215"
                        y="125"
                        width="370"
                        height="85"
                        rx="8"
                        fill="rgba(250, 204, 21, 0.12)"
                        stroke="#facc15"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* 2 CANDLES (Daily / Normal Weekday Mass - GIRM 117) */}
                    {candleMode === 'daily' && (
                      <>
                        {/* Candlestick Left */}
                        <g>
                          <rect x="270" y="190" width="12" height="20" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                          <rect x="273" y="142" width="6" height="48" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="276" cy="136" r="5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="276" cy="135" r="2.2" fill="#fef08a" />
                        </g>
                        {/* Candlestick Right */}
                        <g>
                          <rect x="518" y="190" width="12" height="20" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                          <rect x="521" y="142" width="6" height="48" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="524" cy="136" r="5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="524" cy="135" r="2.2" fill="#fef08a" />
                        </g>
                      </>
                    )}

                    {/* 6 CANDLES (Sunday Mass & High Solemnities - GIRM 117) */}
                    {(candleMode === 'sunday' || candleMode === 'bishop') && (
                      <>
                        {/* Left Candle 1 (Outer Gospel) */}
                        <g>
                          <rect x="230" y="190" width="10" height="20" fill="#eab308" />
                          <rect x="232" y="145" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="235" cy="140" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="235" cy="139" r="2" fill="#fef08a" />
                        </g>
                        {/* Left Candle 2 (Middle Gospel) */}
                        <g>
                          <rect x="265" y="193" width="10" height="17" fill="#eab308" />
                          <rect x="267" y="148" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="270" cy="143" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="270" cy="142" r="2" fill="#fef08a" />
                        </g>
                        {/* Left Candle 3 (Inner Gospel) */}
                        <g>
                          <rect x="300" y="196" width="10" height="14" fill="#eab308" />
                          <rect x="302" y="152" width="6" height="44" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="305" cy="147" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="305" cy="146" r="2" fill="#fef08a" />
                        </g>

                        {/* Right Candle 1 (Inner Epistle) */}
                        <g>
                          <rect x="490" y="196" width="10" height="14" fill="#eab308" />
                          <rect x="492" y="152" width="6" height="44" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="495" cy="147" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="495" cy="146" r="2" fill="#fef08a" />
                        </g>
                        {/* Right Candle 2 (Middle Epistle) */}
                        <g>
                          <rect x="525" y="193" width="10" height="17" fill="#eab308" />
                          <rect x="527" y="148" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="530" cy="143" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="530" cy="142" r="2" fill="#fef08a" />
                        </g>
                        {/* Right Candle 3 (Outer Epistle) */}
                        <g>
                          <rect x="560" y="190" width="10" height="20" fill="#eab308" />
                          <rect x="562" y="145" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                          <circle cx="565" cy="140" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                          <circle cx="565" cy="139" r="2" fill="#fef08a" />
                        </g>
                      </>
                    )}

                    {/* 7th PONTIFICAL CANDLE (Diocesan Bishop in the House! - GIRM 117 & Ceremonial of Bishops §125) */}
                    {candleMode === 'bishop' && (
                      <g>
                        {/* Episcopal Aura behind central crucifix */}
                        <circle cx="418" cy="122" r="16" fill="rgba(250, 204, 21, 0.3)" filter="url(#altar-flame-glow)" />
                        <rect x="414" y="180" width="11" height="28" fill="#ca8a04" stroke="#facc15" strokeWidth="1" />
                        <rect x="416" y="128" width="7" height="52" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                        <circle cx="419.5" cy="122" r="6.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                        <circle cx="419.5" cy="121" r="3" fill="#ffffff" />
                        {/* Golden Mitre Emblem marking the 7th Pontifical candle */}
                        <polygon points="419.5,166 414,173 425,173" fill="#facc15" stroke="#92400e" strokeWidth="0.5" />
                        <text x="419.5" y="172" fill="#78350f" fontSize="5" fontWeight="900" textAnchor="middle">
                          7
                        </text>
                      </g>
                    )}
                  </g>

                  {/* Roman Missal & Cushion/Stand (Left side of altar) */}
                  <g
                    onClick={() => handleSelectAppointment('roman-missal')}
                    style={{ cursor: 'pointer' }}
                  >
                    <polygon points="310,218 340,218 346,204 316,204" fill="#991b1b" stroke="#facc15" strokeWidth="1.5" />
                    <polygon points="312,216 338,216 344,206 318,206" fill="#f8fafc" />
                    <line x1="328" y1="206" x2="328" y2="216" stroke="#b91c1c" strokeWidth="1" />
                    <text x="328" y="213" fill="#b91c1c" fontSize="7" fontWeight="bold" textAnchor="middle">
                      📖
                    </text>
                  </g>

                  {/* Chalice, Paten with Host, Purificator & Pall (On the Corporal) */}
                  <g
                    onClick={() => handleSelectAppointment('chalice')}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Chalice Stem & Cup */}
                    <polygon points="410,215 422,215 418,205 414,205" fill="#eab308" />
                    <path d="M 410 205 Q 416 198, 416 190 Q 422 198, 422 205 Z" fill="#facc15" />
                    {/* Pall on top */}
                    <rect x="408" y="186" width="16" height="4" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                    <circle cx="416" cy="188" r="1.5" fill="#eab308" />
                  </g>

                  {/* Paten with Host */}
                  <g
                    onClick={() => handleSelectAppointment('paten')}
                    style={{ cursor: 'pointer' }}
                  >
                    <ellipse cx="385" cy="216" rx="9" ry="3.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    <ellipse cx="385" cy="214" rx="7" ry="2.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
                    <text x="385" y="215" fill="#78350f" fontSize="4" fontWeight="bold" textAnchor="middle">
                      +
                    </text>
                  </g>

                  {/* Credence Table Appointments (Cruets & Lavabo set on side) */}
                  <g
                    onClick={() => handleSelectAppointment('cruets-lavabo')}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="630" y="250" width="70" height="45" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                    <rect x="626" y="246" width="78" height="6" rx="1" fill="#f8fafc" />
                    {/* Wine & Water Cruets */}
                    <ellipse cx="648" cy="242" rx="4" ry="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
                    <ellipse cx="664" cy="242" rx="4" ry="7" fill="#b91c1c" stroke="#991b1b" strokeWidth="0.8" />
                    <text x="665" y="275" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">
                      CREDENCE TABLE
                    </text>
                  </g>

                  {/* Sanctuary Bells (Altar Server Step) */}
                  <g
                    onClick={() => handleSelectAppointment('sanctus-bells')}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx="600" cy="385" r="12" fill="#ca8a04" stroke="#facc15" strokeWidth="1.5" />
                    <text x="600" y="389" fill="#ffffff" fontSize="10" textAnchor="middle">
                      🔔
                    </text>
                    <text x="600" y="407" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                      BELLS
                    </text>
                  </g>
                </svg>

                {/* Hotspot Legend Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '10px',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: '#94a3b8', fontWeight: 600, alignSelf: 'center' }}>Click to inspect:</span>
                  {ALTAR_APPOINTMENTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectAppointment(item.id)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: selectedAppointmentId === item.id ? '1px solid #facc15' : '1px solid #334155',
                        background: selectedAppointmentId === item.id ? 'rgba(250, 204, 21, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                        color: selectedAppointmentId === item.id ? '#fef08a' : '#cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {item.icon} {item.name.replace('The ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed Theological & Liturgical Dossier */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>{activeAppointment.icon}</span>
                  <div>
                    <span
                      style={{
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {activeAppointment.category} &bull; {activeAppointment.catechismRef}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '4px 0 0 0', color: '#0f172a' }}>
                      {activeAppointment.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic', color: '#64748b' }}>
                      Latin: {activeAppointment.latinName}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontSize: '0.82rem',
                    color: '#334155',
                  }}
                >
                  <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>
                    Sanctuary Placement:
                  </strong>
                  {activeAppointment.placement}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Liturgical Function:
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                    {activeAppointment.description}
                  </p>
                </div>

                <div
                  style={{
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '10px',
                    padding: '0.85rem',
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e', margin: '0 0 4px 0' }}>
                    Theological &amp; Spiritual Meaning:
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                    {activeAppointment.spiritualMeaning}
                  </p>
                </div>

                {activeAppointment.id === 'altar-candles' && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '1.1rem',
                      border: '1px solid #818cf8',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(49, 46, 129, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fef08a' }}>
                        {ALTAR_CANDLE_RULES[candleMode].badge}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255, 255, 255, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: '#c7d2fe',
                          fontWeight: 700,
                        }}
                      >
                        {ALTAR_CANDLE_RULES[candleMode].canonicalCitation}
                      </span>
                    </div>

                    {/* Mode Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCandleMode('daily');
                          playSacredSound('chime');
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: candleMode === 'daily' ? '2px solid #facc15' : '1px solid #4f46e5',
                          background: candleMode === 'daily' ? '#4338ca' : 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                        }}
                      >
                        2 (Normal)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCandleMode('sunday');
                          playSacredSound('chime');
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: candleMode === 'sunday' ? '2px solid #facc15' : '1px solid #4f46e5',
                          background: candleMode === 'sunday' ? '#b45309' : 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                        }}
                      >
                        6 (Sunday)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCandleMode('bishop');
                          playSacredSound('bell');
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: candleMode === 'bishop' ? '2px solid #facc15' : '1px solid #4f46e5',
                          background: candleMode === 'bishop' ? '#7e22ce' : 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                        }}
                      >
                        👑 7 (Bishop)
                      </button>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#e0e7ff', lineHeight: 1.4, marginTop: '2px' }}>
                      <strong style={{ color: '#facc15' }}>Occasion:</strong> {ALTAR_CANDLE_RULES[candleMode].occasion}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#fed7aa', lineHeight: 1.4 }}>
                      <strong style={{ color: '#facc15' }}>Theological Meaning:</strong> {ALTAR_CANDLE_RULES[candleMode].theologicalReason}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontStyle: 'italic' }}>
                      <strong style={{ color: '#facc15', fontStyle: 'normal' }}>Placement:</strong> {ALTAR_CANDLE_RULES[candleMode].placementPattern}
                    </div>
                  </div>
                )}

                {activeAppointment.id === 'tabernacle' && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #581c87 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      border: '1px solid #c084fc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 6px 20px rgba(76, 29, 149, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fef08a' }}>
                        🏛️ Tabernaculum Sanctissimi
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255, 255, 255, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: '#e9d5ff',
                          fontWeight: 700,
                        }}
                      >
                        GIRM §314–317 &bull; CIC Can. 938
                      </span>
                    </div>

                    {/* Interactive Tabernacle Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setTabernacleDoorOpen(!tabernacleDoorOpen);
                          playSacredSound('latch');
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: tabernacleDoorOpen ? '#d97706' : '#9333ea',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                        }}
                      >
                        <span>🗝️</span>
                        <span>{tabernacleDoorOpen ? 'Close Doors' : 'Open Doors (View Ciborium)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTabernacleVeilActive(!tabernacleVeilActive);
                          playSacredSound('chime');
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.25)',
                          background: tabernacleVeilActive ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.3)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>⛺</span>
                        <span>{tabernacleVeilActive ? 'Veil: ON (Conopeum)' : 'Veil: OFF'}</span>
                      </button>
                    </div>

                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '0.76rem',
                        lineHeight: 1.45,
                        color: '#f5d0fe',
                        borderLeft: '3px solid #facc15',
                      }}
                    >
                      <strong style={{ color: '#fef08a' }}>Why isn't it on the Altar Table? (GIRM §315):</strong><br />
                      The Altar is the table of the <em>Eucharistic Action &amp; Sacrifice</em>. The Tabernacle is the dwelling of <em>Eucharistic Reservation &amp; Repose</em>. Separating them keeps the active sacrifice clear to the congregation while providing a prominent throne for silent adoration.
                    </div>

                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.72rem', color: '#e9d5ff' }}>
                      <span style={{ fontWeight: 800, color: '#facc15' }}>Canonical Rule:</span>
                      <span>Genuflect on the right knee to the Tabernacle; bow deeply from the waist to the Altar during Mass!</span>
                    </div>
                  </div>
                )}

                {activeAppointment.id === 'sanctuary-lamp' && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      border: '1px solid #f87171',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(153, 27, 27, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fef08a' }}>
                        🔴 The Perpetual Presence Lamp
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255, 255, 255, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: '#fecaca',
                          fontWeight: 700,
                        }}
                      >
                        CIC Canon 940
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#fee2e2', lineHeight: 1.45 }}>
                      Under universal Catholic Canon Law, a special red lamp fueled by pure wax or olive oil must burn day and night without interruption wherever the Blessed Sacrament is reserved.
                    </p>
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.25)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.74rem',
                        color: '#fecaca',
                      }}
                    >
                      <strong style={{ color: '#fef08a' }}>The Good Friday Exception:</strong> The red lamp is extinguished and the tabernacle doors left wide open only on Good Friday afternoon, when Christ the Bridegroom has been taken from us.
                    </div>
                  </div>
                )}

                {activeAppointment.id === 'ciborium' && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(180, 83, 9, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fef08a' }}>
                        ✨ The Golden Ciborium (Cibus = Food)
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255, 255, 255, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: '#fef3c7',
                          fontWeight: 700,
                        }}
                      >
                        CCC §1379 &bull; GIRM §327
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#fef3c7', lineHeight: 1.45 }}>
                      The consecrated vessel reserved inside the Tabernacle holding the consecrated Hosts. Derived from the Latin <em>cibus</em> meaning food, it fulfills the Golden Urn of Manna (Hebrews 9:4) that fed Israel in the desert.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAppointmentId('tabernacle');
                        setTabernacleDoorOpen(true);
                        playSacredSound('latch');
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#facc15',
                        color: '#78350f',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                      }}
                    >
                      🏛️ View Tabernacle Chamber &amp; Ciborium
                    </button>
                  </div>
                )}

                {activeAppointment.id === 'sanctus-bells' && (
                  <button
                    type="button"
                    onClick={() => playSacredSound('bell')}
                    style={{
                      background: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    🔔 Ring the Sanctus Bells (Sound Chime)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CANDLES TAB: THE LITURGICAL CANDLE ARITHMETIC (2, 6, 7 RULES) */}
        {/* ========================================================================= */}
        {activeTab === 'candles' && (
          <div>
            {/* Header Hero Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                color: '#ffffff',
                marginBottom: '1.75rem',
                border: '1px solid #6366f1',
                boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                <span>📜 GIRM §117 &amp; §307</span>
                <span>&bull;</span>
                <span>Caeremoniale Episcoporum §125</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px 0', color: '#fef08a' }}>
                🕯️ The Sacred Geometry of Altar Candles: 2, 6, and 7
              </h2>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#e0e7ff', lineHeight: 1.6, maxWidth: '820px' }}>
                In Catholic liturgical law, the number of candles on the altar is not an aesthetic decoration—it is a theological proclamation.
                The number of lighted tapers proclaims the liturgical dignity of the celebration: <strong>2 for normal weekday Mass</strong>,
                <strong>6 for Sundays and Solemnities</strong>, and <strong>7 whenever the Diocesan Bishop celebrates Mass in his diocese</strong>!
              </p>
            </div>

            {/* Interactive Candle Count Selector & Live Altar Simulator */}
            <div
              style={{
                background: '#090d16',
                borderRadius: '16px',
                border: '2px solid #334155',
                padding: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Interactive Liturgical Simulator
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                    Switch the Liturgical Celebration Rank:
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCandleMode('daily');
                      playSacredSound('chime');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: candleMode === 'daily' ? '2px solid #facc15' : '1px solid #475569',
                      background: candleMode === 'daily' ? '#2563eb' : 'rgba(30, 41, 59, 0.7)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    🕯️ 2 Candles (Weekday Normal)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCandleMode('sunday');
                      playSacredSound('chime');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: candleMode === 'sunday' ? '2px solid #facc15' : '1px solid #475569',
                      background: candleMode === 'sunday' ? '#d97706' : 'rgba(30, 41, 59, 0.7)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ✨ 6 Candles (Sunday &amp; Solemnities)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCandleMode('bishop');
                      playSacredSound('bell');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: candleMode === 'bishop' ? '2px solid #facc15' : '1px solid #475569',
                      background: candleMode === 'bishop' ? '#9333ea' : 'rgba(30, 41, 59, 0.7)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: candleMode === 'bishop' ? '0 0 16px rgba(168, 85, 247, 0.6)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    👑 7 Candles (Bishop in the House!)
                  </button>
                </div>
              </div>

              {/* Live Mini Altar Visualizer */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #090d16 0%, #0f172a 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid #1e293b',
                }}
              >
                <svg viewBox="0 0 800 240" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '220px' }}>
                  <defs>
                    <filter id="sim-candle-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Backdrop Ambient Light */}
                  <rect x="0" y="0" width="800" height="240" fill="#090d16" />
                  <circle cx="400" cy="110" r="140" fill="rgba(250, 204, 21, 0.1)" />

                  {/* Mensa Table */}
                  <rect x="200" y="160" width="400" height="45" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <rect x="190" y="152" width="420" height="12" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                  <rect x="204" y="164" width="392" height="40" fill="#15803d" />

                  {/* Central Altar Crucifix */}
                  <g>
                    <polygon points="392,160 408,160 405,152 395,152" fill="#eab308" />
                    <rect x="398" y="70" width="4" height="82" fill="#eab308" />
                    <rect x="386" y="85" width="28" height="4" fill="#eab308" />
                    <circle cx="400" cy="78" r="2.5" fill="#f8fafc" />
                    <line x1="400" y1="80" x2="400" y2="100" stroke="#f8fafc" strokeWidth="2" />
                  </g>

                  {/* Mode 1: 2 Candles (Weekday / Normal) */}
                  {candleMode === 'daily' && (
                    <>
                      {/* Left */}
                      <g>
                        <rect x="265" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="267" y="105" width="6" height="47" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="270" cy="98" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="270" cy="97" r="2" fill="#fef08a" />
                        <text x="270" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
                      </g>
                      {/* Right */}
                      <g>
                        <rect x="525" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="527" y="105" width="6" height="47" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="530" cy="98" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="530" cy="97" r="2" fill="#fef08a" />
                        <text x="530" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
                      </g>
                    </>
                  )}

                  {/* Mode 2: 6 Candles (Sunday & Solemnities) */}
                  {(candleMode === 'sunday' || candleMode === 'bishop') && (
                    <>
                      {/* Left 1 */}
                      <g>
                        <rect x="225" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="227" y="105" width="6" height="47" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="230" cy="98" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="230" cy="97" r="2" fill="#fef08a" />
                        <text x="230" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
                      </g>
                      {/* Left 2 */}
                      <g>
                        <rect x="265" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="267" y="108" width="6" height="44" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="270" cy="101" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="270" cy="100" r="2" fill="#fef08a" />
                        <text x="270" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
                      </g>
                      {/* Left 3 */}
                      <g>
                        <rect x="305" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="307" y="112" width="6" height="40" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="310" cy="105" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="310" cy="104" r="2" fill="#fef08a" />
                        <text x="310" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
                      </g>

                      {/* Right 1 */}
                      <g>
                        <rect x="485" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="487" y="112" width="6" height="40" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="490" cy="105" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="490" cy="104" r="2" fill="#fef08a" />
                        <text x="490" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">4</text>
                      </g>
                      {/* Right 2 */}
                      <g>
                        <rect x="525" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="527" y="108" width="6" height="44" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="530" cy="101" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="530" cy="100" r="2" fill="#fef08a" />
                        <text x="530" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">5</text>
                      </g>
                      {/* Right 3 */}
                      <g>
                        <rect x="565" y="152" width="10" height="16" fill="#eab308" />
                        <rect x="567" y="105" width="6" height="47" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                        <circle cx="570" cy="98" r="5" fill="#f97316" filter="url(#sim-candle-glow)" />
                        <circle cx="570" cy="97" r="2" fill="#fef08a" />
                        <text x="570" y="180" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">6</text>
                      </g>
                    </>
                  )}

                  {/* Mode 3: 7th Candle for Pontifical Mass */}
                  {candleMode === 'bishop' && (
                    <g>
                      <circle cx="417" cy="88" r="14" fill="rgba(250, 204, 21, 0.3)" filter="url(#sim-candle-glow)" />
                      <rect x="413" y="146" width="9" height="22" fill="#ca8a04" stroke="#facc15" strokeWidth="0.8" />
                      <rect x="415" y="96" width="5" height="50" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                      <circle cx="417.5" cy="89" r="6" fill="#f97316" filter="url(#sim-candle-glow)" />
                      <circle cx="417.5" cy="88" r="2.8" fill="#ffffff" />
                      <polygon points="417.5,134 413,141 422,141" fill="#facc15" stroke="#92400e" strokeWidth="0.5" />
                      <text x="417.5" y="140" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">7</text>
                      <text x="417.5" y="180" fill="#facc15" fontSize="9" fontWeight="bold" textAnchor="middle">7th</text>
                    </g>
                  )}

                  {/* Mode Banner Label in Stage */}
                  <text x="400" y="32" fill="#fef08a" fontSize="13" fontWeight="900" textAnchor="middle" letterSpacing="1">
                    {ALTAR_CANDLE_RULES[candleMode].title.toUpperCase()}
                  </text>
                  <text x="400" y="48" fill="#94a3b8" fontSize="10" textAnchor="middle" fontStyle="italic">
                    {ALTAR_CANDLE_RULES[candleMode].latinTitle}
                  </text>
                </svg>

                {/* Status Bar */}
                <div style={{ marginTop: '10px', background: 'rgba(15, 23, 42, 0.8)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {candleMode === 'bishop' ? '👑' : candleMode === 'sunday' ? '✨' : '🕯️'}
                    </span>
                    <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.88rem' }}>
                      {ALTAR_CANDLE_RULES[candleMode].count} Lit Altar Candles Active
                    </span>
                    <span style={{ color: '#64748b' }}>&bull;</span>
                    <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                      {ALTAR_CANDLE_RULES[candleMode].occasion}
                    </span>
                  </div>
                  <span style={{ color: '#facc15', fontSize: '0.78rem', fontWeight: 700, background: 'rgba(250, 204, 21, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                    {ALTAR_CANDLE_RULES[candleMode].canonicalCitation}
                  </span>
                </div>
              </div>
            </div>

            {/* The 3 Canonical Modes Detailed Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {/* Card 1: 2 Candles */}
              <div
                style={{
                  background: candleMode === 'daily' ? '#eff6ff' : '#ffffff',
                  border: candleMode === 'daily' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: candleMode === 'daily' ? '0 4px 20px rgba(37, 99, 235, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.6rem' }}>🕯️</span>
                  <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                    GIRM 117
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  2 Candles: Daily / Normal Mass
                </h4>
                <span style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#64748b' }}>
                  Missa Quotidiana / Ferialis
                </span>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  <strong>The Rule:</strong> At least two lighted candles must be on or near the altar for any valid and licit celebration of the Holy Mass.
                </p>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Theological Meaning:</strong>
                  The two candles represent the <strong>two natures of Jesus Christ</strong>: True God and True Man, united in the divine Person of the Son (the Hypostatic Union). Christ offers Himself simultaneously as divine High Priest and perfect human Victim.
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  <strong>Placement:</strong> One on the Gospel side (left) and one on the Epistle side (right).
                </div>
              </div>

              {/* Card 2: 6 Candles */}
              <div
                style={{
                  background: candleMode === 'sunday' ? '#fffbeb' : '#ffffff',
                  border: candleMode === 'sunday' ? '2px solid #d97706' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: candleMode === 'sunday' ? '0 4px 20px rgba(217, 119, 6, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.6rem' }}>✨</span>
                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                    GIRM 117
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  6 Candles: Sunday &amp; Solemnities
                </h4>
                <span style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#64748b' }}>
                  Missa Solemnis / Dominicalis
                </span>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  <strong>The Rule:</strong> Four or six candles are lit, especially for Sunday Mass and Holy Days of Obligation, honoring the majesty of the Lord’s Day.
                </p>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Theological Meaning:</strong>
                  The six candles recall the <strong>six days of Creation</strong>, brought to perfection in the Sabbath rest and the Eighth Day of the Lord’s Resurrection. They symmetrically flank the Crucifix, framing the sacrifice of Calvary.
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  <strong>Placement:</strong> Three on the Gospel side (left) and three on the Epistle side (right).
                </div>
              </div>

              {/* Card 3: 7 Candles */}
              <div
                style={{
                  background: candleMode === 'bishop' ? '#faf5ff' : '#ffffff',
                  border: candleMode === 'bishop' ? '2px solid #9333ea' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: candleMode === 'bishop' ? '0 4px 20px rgba(147, 51, 234, 0.18)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.6rem' }}>👑</span>
                  <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                    Caeremoniale §125
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  7 Candles: Diocesan Bishop in the House!
                </h4>
                <span style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#64748b' }}>
                  Missa Pontificalis (Candela Septima)
                </span>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  <strong>The Rule:</strong> "If the Diocesan Bishop celebrates, then seven candlesticks with lighted candles" (GIRM 117 &amp; Ceremonial of Bishops §125).
                </p>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Theological Meaning:</strong>
                  The 7th candle proclaims the <strong>fullness of the Priesthood (plenitudo sacerdotii)</strong> residing in the Bishop as the Apostolic Shepherd of his flock. It evokes the <strong>seven golden lampstands of Revelation 1:12–20</strong> and the <strong>seven gifts of the Holy Spirit (Isaiah 11:2)</strong>.
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  <strong>Placement:</strong> Three left, three right, and the 7th Pontifical Candle placed directly in the center beside the Crucifix.
                </div>
              </div>
            </div>

            {/* Deep Theological Insights: Why Beeswax & Why Bishop Only */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🐝</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>
                    Why Pure Beeswax? (GIRM §307 &amp; The Easter Exsultet)
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                  The Roman Catholic Church forbids petroleum-based paraffin candles from constituting the primary substance of altar candles.
                  Liturgical law mandates candles made substantially of <strong>pure natural beeswax (cera apum)</strong>:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#78350f', lineHeight: 1.6 }}>
                  <li><strong>Virgin Beeswax:</strong> Produced by worker bees who do not reproduce sexually, symbolizing the virginal Flesh of Christ born of the Blessed Virgin Mary.</li>
                  <li><strong>The Wick:</strong> Symbolizes the human soul of Jesus Christ, uniting the body to the flame.</li>
                  <li><strong>The Flame &amp; Heat:</strong> Represents Christ's divine nature—Light of the World and fire of divine charity.</li>
                  <li><strong>Sacrificial Consumption:</strong> The candle is consumed entirely in giving light, mirroring Christ’s total self-emptying sacrifice on Calvary.</li>
                </ul>
              </div>

              <div
                style={{
                  background: '#ede9fe',
                  border: '1px solid #ddd6fe',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>👑</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#5b21b6' }}>
                    The "Bishop in the House" Exception: Who Gets 7 Candles?
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#4c1d95', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                  Not just any bishop receives seven candles! Liturgical jurisprudence is delightfully precise:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#4c1d95', lineHeight: 1.6 }}>
                  <li><strong>The Diocesan Bishop (The Ordinary):</strong> Seven candles are lit ONLY when the diocesan bishop—the head of that particular diocese—celebrates Mass within his own territory.</li>
                  <li><strong>Visiting Bishops &amp; Auxiliary Bishops:</strong> If an auxiliary bishop or a visiting bishop from another diocese celebrates Mass, only <strong>6 candles</strong> are lit, because they do not hold ordinary apostolic jurisdiction over that diocese.</li>
                  <li><strong>Ancient Stational Tradition:</strong> In ancient Rome, seven deacons and acolytes carrying seven torches led the Pope into the stational basilicas, placing their seven lights on the altar steps.</li>
                  <li><strong>The Apocalypse Connection:</strong> In Revelation 1:12–13, St. John turns and sees <em>"seven golden lampstands, and in the midst of the lampstands one like a son of man."</em> The Bishop stands in that apostolic line.</li>
                </ul>
              </div>
            </div>

            {/* Interactive Candle Mastery Quiz */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🎓</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Catechetical Knowledge Check: Test Your Altar Candle Arithmetic
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Verify your understanding of GIRM 117 and liturgical candle norms.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Question 1 */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', marginBottom: '8px' }}>
                    1. How many candles are strictly required by the General Instruction of the Roman Missal for an ordinary weekday Mass?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { idx: 0, text: 'At least 2 candles (representing the divine and human natures of Christ)', correct: true },
                      { idx: 1, text: 'Zero, candles are optional on weekdays', correct: false },
                      { idx: 2, text: 'Always 6 candles regardless of the day', correct: false },
                      { idx: 3, text: '3 candles representing the Holy Trinity', correct: false },
                    ].map((opt) => {
                      const isSelected = candleQuizAnswers[1] === opt.idx;
                      const hasAnswered = candleQuizAnswers[1] !== undefined;
                      return (
                        <button
                          key={opt.idx}
                          type="button"
                          onClick={() => {
                            setCandleQuizAnswers({ ...candleQuizAnswers, 1: opt.idx });
                            if (opt.correct) playSacredSound('chime');
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: isSelected
                              ? opt.correct ? '2px solid #16a34a' : '2px solid #dc2626'
                              : '1px solid #cbd5e1',
                            background: isSelected
                              ? opt.correct ? '#f0fdf4' : '#fef2f2'
                              : '#ffffff',
                            color: '#1e293b',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.text}
                          {hasAnswered && opt.correct && <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: 800 }}>✓ Correct! (GIRM 117)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 2 */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', marginBottom: '8px' }}>
                    2. When is a 7th candle lit on the altar during the celebration of Mass?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { idx: 0, text: 'Whenever any visiting priest asks for it', correct: false },
                      { idx: 1, text: 'Only when the Diocesan Bishop celebrates Mass in his own diocese ("Bishop in the house!")', correct: true },
                      { idx: 2, text: 'On Easter Sunday only', correct: false },
                      { idx: 3, text: 'Whenever there are 7 altar servers present', correct: false },
                    ].map((opt) => {
                      const isSelected = candleQuizAnswers[2] === opt.idx;
                      const hasAnswered = candleQuizAnswers[2] !== undefined;
                      return (
                        <button
                          key={opt.idx}
                          type="button"
                          onClick={() => {
                            setCandleQuizAnswers({ ...candleQuizAnswers, 2: opt.idx });
                            if (opt.correct) playSacredSound('bell');
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: isSelected
                              ? opt.correct ? '2px solid #16a34a' : '2px solid #dc2626'
                              : '1px solid #cbd5e1',
                            background: isSelected
                              ? opt.correct ? '#f0fdf4' : '#fef2f2'
                              : '#ffffff',
                            color: '#1e293b',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.text}
                          {hasAnswered && opt.correct && <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: 800 }}>✓ Correct! (Caeremoniale Episcoporum §125)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 3 */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', marginBottom: '8px' }}>
                    3. Why does the Church require liturgical altar candles to be made of pure beeswax rather than artificial paraffin?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { idx: 0, text: 'Because virgin beeswax symbolizes Christ\'s pure, sinless Flesh born of the Virgin Mary', correct: true },
                      { idx: 1, text: 'Beeswax is cheaper to manufacture than paraffin wax', correct: false },
                      { idx: 2, text: 'Paraffin candles produce too much smoke for stained glass windows only', correct: false },
                      { idx: 3, text: 'Ancient Romans did not have matches', correct: false },
                    ].map((opt) => {
                      const isSelected = candleQuizAnswers[3] === opt.idx;
                      const hasAnswered = candleQuizAnswers[3] !== undefined;
                      return (
                        <button
                          key={opt.idx}
                          type="button"
                          onClick={() => {
                            setCandleQuizAnswers({ ...candleQuizAnswers, 3: opt.idx });
                            if (opt.correct) playSacredSound('chime');
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: isSelected
                              ? opt.correct ? '2px solid #16a34a' : '2px solid #dc2626'
                              : '1px solid #cbd5e1',
                            background: isSelected
                              ? opt.correct ? '#f0fdf4' : '#fef2f2'
                              : '#ffffff',
                            color: '#1e293b',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.text}
                          {hasAnswered && opt.correct && <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: 800 }}>✓ Correct! (CCC &amp; Easter Exsultet)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TABERNACLE & ALTAR TAB: THE GREAT LITURGICAL HARMONY (GIRM 314-317) */}
        {/* ========================================================================= */}
        {activeTab === 'tabernacle' && (
          <div>
            {/* Header Hero Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #581c87 100%)',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                color: '#ffffff',
                marginBottom: '1.75rem',
                border: '1px solid #c084fc',
                boxShadow: '0 8px 24px rgba(76, 29, 149, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.12)',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '10px',
                }}
              >
                <span>📜 GIRM §314–317</span>
                <span>&bull;</span>
                <span>CIC Canon 938 &amp; 940</span>
                <span>&bull;</span>
                <span>CCC §1379</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px 0', color: '#fef08a' }}>
                🏛️ The Sacred Tabernacle &amp; The Altar: The Great Liturgical Harmony
              </h2>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#f5d0fe', lineHeight: 1.6, maxWidth: '840px' }}>
                {TABERNACLE_CATECHESIS.canonicalAnswer.whySeparated}{' '}
                {TABERNACLE_CATECHESIS.canonicalAnswer.actionVsReservation}
              </p>
            </div>

            {/* The Core Question Callout */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <span style={{ fontSize: '2rem' }}>🤔</span>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#92400e' }}>
                  The Catechetical Question: "{TABERNACLE_CATECHESIS.theCoreQuestion}"
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                  <strong>Authoritative Canonical Ruling (GIRM §315):</strong>{' '}
                  <em>"{TABERNACLE_CATECHESIS.canonicalAnswer.girm315}"</em>
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
                  The <strong>Altar</strong> is the living symbol of Christ in the <em>Action of the Eucharistic Sacrifice</em>.
                  The <strong>Tabernacle</strong> is the sacred throne of <em>Eucharistic Reservation and Perpetual Adoration</em>.
                  Keeping them distinct ensures that the active celebration of Holy Mass is unobstructed, while giving the reserved Blessed Sacrament an elevated, noble place of reverence.
                </p>
              </div>
            </div>

            {/* Liturgical Scope Notice: Roman Rite (GIRM) vs. 23 Eastern Catholic Churches */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e40af' }}>
                    Liturgical Scope Notice: The GIRM Applies Exclusively to the Roman (Latin) Rite
                  </h4>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    Universal Church Patrimony
                  </span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.84rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                  The <em>General Instruction of the Roman Missal</em> (GIRM §314–317) cited above is liturgical law specifically for the <strong>Latin (Roman) Rite</strong>.
                  The universal Catholic Church is a communion of <strong>24 Churches sui iuris</strong> across 6 liturgical families!
                  In our <strong>23 Eastern Catholic sister churches</strong> (such as the Ukrainian Greek Catholic, Melkite, Maronite, and Syro-Malabar Churches), liturgical life is governed by the <strong>Code of Canons of the Eastern Churches (CCEO)</strong> and their respective venerable <em>Liturgicons</em>:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.78rem', color: '#1e3a8a' }}>
                    <strong>👑 Byzantine Tradition:</strong> The Tabernacle (<em>Artophorion</em> / Ark) sits <strong>directly on the Holy Table (Hagia Trapeza)</strong> behind the Iconostasis. Separating reservation from the Holy Table is historically foreign to the Byzantine East!
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.78rem', color: '#1e3a8a' }}>
                    <strong>🏛️ Traditional Latin Mass (1962 Missal):</strong> In the Extraordinary Form of the Roman Rite, the Tabernacle is permanently affixed to the center of the High Altar gradine.
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.78rem', color: '#1e3a8a' }}>
                    <strong>🕯️ Altar Candles:</strong> Eastern altars use a 7-branched Menorah and Dikirion/Trikirion, not the Roman 2, 4, 6, 7 candle rules (GIRM 117).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('eastern-rites');
                    playSacredSound('chime');
                  }}
                  style={{
                    background: '#1d4ed8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🌍 Explore Altar Traditions Across All 24 Catholic Churches &rarr;
                </button>
              </div>
            </div>

            {/* Side-by-Side: Altar (The Action) vs. Tabernacle (The Presence) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              {/* Altar of Sacrifice */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '2px solid #3b82f6',
                  padding: '1.4rem',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🪵</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
                      The Altar of Sacrifice (The Action)
                    </h4>
                    <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: '#64748b' }}>
                      Mensa Sacrificii et Convivii Paschalis &bull; GIRM 296
                    </span>
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Theological Role:</strong> Christ the Living Rock; the table where the Sacrifice of Calvary is sacramentally renewed.</li>
                  <li><strong>Liturgical Orientation:</strong> Built free-standing so the priest can walk completely around it, incensing all four sides.</li>
                  <li><strong>During Mass:</strong> The entire assembly’s gaze is directed here during the Liturgy of the Eucharist.</li>
                  <li><strong>Reverence Posture:</strong> Ministers make a <em>profound bow of the body</em> to the Altar when passing it during Mass.</li>
                </ul>
              </div>

              {/* Tabernacle of Reservation */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '2px solid #a855f7',
                  padding: '1.4rem',
                  boxShadow: '0 4px 14px rgba(168, 85, 247, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🏛️</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#581c87' }}>
                      The Sacred Tabernacle (The Repose)
                    </h4>
                    <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: '#64748b' }}>
                      Tabernaculum Sanctissimi Sacramenti &bull; GIRM 314
                    </span>
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Theological Role:</strong> The Holy of Holies; houses the living Body and Blood of Christ 24 hours a day, 7 days a week.</li>
                  <li><strong>Sacred Function:</strong> Reservation of Holy Communion for the dying (Viaticum), the sick, and perpetual silent adoration.</li>
                  <li><strong>Sacred Signs:</strong> Guarded day and night by the burning red Sanctuary Lamp and draped in the Conopeum veil.</li>
                  <li><strong>Reverence Posture:</strong> Every Catholic <em>genuflects on the right knee</em> touching the floor toward the Tabernacle.</li>
                </ul>
              </div>
            </div>

            {/* Interactive Tabernacle Laboratory & Vessel Inspector */}
            <div
              style={{
                background: '#090d16',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #334155',
                color: '#ffffff',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: '#fef08a' }}>
                    🔍 Interactive Tabernacle &amp; Ciborium Simulator
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    Interact with the doors, conopeum veil, sanctuary lamp, and inner golden vessels.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTabernacleDoorOpen(!tabernacleDoorOpen);
                      playSacredSound('latch');
                    }}
                    style={{
                      background: tabernacleDoorOpen ? '#d97706' : '#9333ea',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                    }}
                  >
                    🗝️ {tabernacleDoorOpen ? 'Lock Golden Doors' : 'Unlock & Open Doors (Reveal Ciborium)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTabernacleVeilActive(!tabernacleVeilActive);
                      playSacredSound('chime');
                    }}
                    style={{
                      background: tabernacleVeilActive ? '#1e293b' : '#334155',
                      color: '#ffffff',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                    }}
                  >
                    ⛺ {tabernacleVeilActive ? 'Veil: Conopeum Draped' : 'Veil: Bare Gold'}
                  </button>
                </div>
              </div>

              {/* Graphical Tabernacle Cross-Section */}
              <div
                style={{
                  background: '#020617',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #1e293b',
                  minHeight: '260px',
                }}
              >
                <svg viewBox="0 0 600 240" style={{ width: '100%', maxWidth: '560px', height: 'auto' }}>
                  <defs>
                    <radialGradient id="tab-gold-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(250, 204, 21, 0.4)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* Sanctuary Apse Niche */}
                  <path d="M 180 220 L 180 80 Q 300 20 420 80 L 420 220 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  <rect x="200" y="200" width="200" height="20" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  <circle cx="300" cy="130" r="100" fill="url(#tab-gold-glow)" />

                  {/* Tabernacle Outer Body */}
                  <polygon points="230,90 300,50 370,90" fill="#ca8a04" stroke="#facc15" strokeWidth="2" />
                  <line x1="300" y1="35" x2="300" y2="50" stroke="#fef08a" strokeWidth="3" />
                  <line x1="292" y1="42" x2="308" y2="42" stroke="#fef08a" strokeWidth="2.5" />
                  <rect x="235" y="90" width="130" height="110" rx="4" fill="#ca8a04" stroke="#facc15" strokeWidth="2" />

                  {/* Inside Chamber vs Closed Doors */}
                  {tabernacleDoorOpen ? (
                    <>
                      {/* Interior Chamber */}
                      <rect x="242" y="96" width="116" height="98" fill="#451a03" stroke="#78350f" strokeWidth="1.5" />
                      {/* Consecrated white linen corporal */}
                      <rect x="250" y="184" width="100" height="8" rx="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Golden Ciborium */}
                      <g>
                        <polygon points="290,184 310,184 303,170 297,170" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                        <ellipse cx="300" cy="155" rx="22" ry="14" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                        <path d="M 280 152 Q 300 134 320 152 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
                        <line x1="300" y1="126" x2="300" y2="134" stroke="#facc15" strokeWidth="2" />
                        <line x1="296" y1="130" x2="304" y2="130" stroke="#facc15" strokeWidth="1.5" />
                        <text x="300" y="159" fill="#78350f" fontSize="8" fontWeight="bold" textAnchor="middle">
                          CIBORIUM
                        </text>
                      </g>

                      {/* Open Doors */}
                      <polygon points="200,94 235,90 235,200 200,194" fill="#eab308" stroke="#facc15" strokeWidth="1.5" />
                      <polygon points="365,90 400,94 400,194 365,200" fill="#eab308" stroke="#facc15" strokeWidth="1.5" />
                    </>
                  ) : (
                    <>
                      {/* Closed Doors */}
                      <rect x="240" y="95" width="60" height="100" fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
                      <rect x="300" y="95" width="60" height="100" fill="#b45309" stroke="#92400e" strokeWidth="1.2" />
                      {/* Keyhole */}
                      <circle cx="298" cy="145" r="3" fill="#1c1917" />
                      <line x1="298" y1="145" x2="298" y2="152" stroke="#1c1917" strokeWidth="1.5" />

                      {/* Sacred Carvings */}
                      <line x1="270" y1="115" x2="270" y2="175" stroke="#fef08a" strokeWidth="2" />
                      <line x1="258" y1="132" x2="282" y2="132" stroke="#fef08a" strokeWidth="2" />
                      <line x1="330" y1="115" x2="330" y2="175" stroke="#fef08a" strokeWidth="2" />
                      <circle cx="330" cy="128" r="8" fill="none" stroke="#fef08a" strokeWidth="2" />

                      {/* Conopeum Veil */}
                      {tabernacleVeilActive && (
                        <g>
                          <path
                            d="M 230 88 Q 300 80 370 88 L 374 196 Q 360 202 340 196 Q 300 204 260 196 Q 240 202 226 196 Z"
                            fill={currentSeason.hex}
                            opacity="0.88"
                            stroke={currentSeason.borderHex}
                            strokeWidth="2"
                          />
                          <line x1="300" y1="105" x2="300" y2="150" stroke="#fef08a" strokeWidth="2.5" />
                          <line x1="288" y1="120" x2="312" y2="120" stroke="#fef08a" strokeWidth="2.5" />
                          <text x="300" y="175" fill="#fef08a" fontSize="9" fontWeight="900" textAnchor="middle">
                            CONOPEUM VEIL
                          </text>
                        </g>
                      )}
                    </>
                  )}

                  {/* Red Sanctuary Lamp Beside */}
                  <g>
                    <line x1="470" y1="30" x2="470" y2="110" stroke="#eab308" strokeWidth="2" strokeDasharray="3 3" />
                    <polygon points="458,110 482,110 476,118 464,118" fill="#ca8a04" stroke="#facc15" strokeWidth="1" />
                    <ellipse cx="470" cy="138" rx="14" ry="20" fill="#dc2626" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="470" cy="134" r="8" fill="#fef08a" filter="url(#altar-flame-glow)" />
                    <circle cx="470" cy="132" r="4" fill="#ffffff" />
                    <circle cx="470" cy="134" r="28" fill="rgba(239, 68, 68, 0.35)" filter="url(#altar-flame-glow)" />
                    <text x="470" y="174" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">
                      CANON 940 LAMP
                    </text>
                    <text x="470" y="186" fill="#fecaca" fontSize="7" textAnchor="middle">
                      BURNING 24/7
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* The Two Approved Locations in GIRM 315 */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                📍 The Two Approved Canonical Locations for the Tabernacle (GIRM §315)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {TABERNACLE_CATECHESIS.twoApprovedLocations.map((loc) => (
                  <div
                    key={loc.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.6rem' }}>{loc.icon}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                          {loc.location}
                        </h4>
                        <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#64748b' }}>
                          {loc.latinName} &bull; {loc.canonicalBasis}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                      {loc.description}
                    </p>
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.74rem',
                        color: '#0369a1',
                      }}
                    >
                      <strong>Spiritual Advantage:</strong> {loc.advantages}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The 4 Sacred Tabernacle Appointments */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                ✨ The 4 Sacred Tabernacle Appointments &amp; Canonical Furnishings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {TABERNACLE_CATECHESIS.tabernacleAppointments.map((app, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '1.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{app.icon}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          {app.name}
                        </h4>
                        <span style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#64748b' }}>
                          {app.latinName}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                      <strong>Liturgical Rule:</strong> {app.rule}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#7c3aed', lineHeight: 1.4 }}>
                      <strong>Theology:</strong> {app.theologicalMeaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Evolution Timeline */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                ⏳ Historical Evolution: How the Tabernacle Moved Through Church History
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {TABERNACLE_CATECHESIS.historicalEvolution.map((evo, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', background: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>
                        {evo.timeframe}
                      </span>
                    </div>
                    <h4 style={{ margin: '4px 0 2px 0', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                      {evo.era}
                    </h4>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                      {evo.practice}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontStyle: 'italic' }}>
                      Significance: {evo.significance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* The Great Reverence Rule: Genuflection vs. Bowing */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                color: '#ffffff',
                marginBottom: '1.75rem',
                border: '1px solid #475569',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fef08a', margin: '0 0 10px 0' }}>
                🛐 The Catholic Body Language: Genuflection vs. Profound Bow
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#67e8f9', fontWeight: 800 }}>
                    1. Genuflection on the RIGHT Knee &bull; GIRM §274
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {TABERNACLE_CATECHESIS.reverenceRules.genuflection}
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#fde047', fontWeight: 800 }}>
                    2. Profound Bow of the Body &bull; GIRM §275
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {TABERNACLE_CATECHESIS.reverenceRules.profoundBow}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', borderLeft: '3px solid #f59e0b', fontSize: '0.76rem', color: '#fde68a' }}>
                <strong>The Distinction Solved:</strong> {TABERNACLE_CATECHESIS.reverenceRules.theologicalDistinction}
              </div>
            </div>

            {/* Interactive Formative Quiz */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #cbd5e1',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>📝</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Formative Check: The Tabernacle &amp; Altar Relationship
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Test your understanding of Catholic liturgical law and church architecture.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    id: 1,
                    question: 'Why does GIRM §315 advise that the Tabernacle should NOT sit directly on the altar table of celebration?',
                    options: [
                      'Because modern altars are not strong enough to hold heavy metal safes.',
                      'To distinguish the Eucharistic Action of the sacrifice from the perpetual reservation of the sacrament at rest.',
                      'Because the Tabernacle is only meant for outdoor processions.',
                    ],
                    correctIndex: 1,
                    explanation: 'The Altar is the table of the Eucharistic Action (the sacrifice being offered); separating the Tabernacle honors both the active celebration and the resting Real Presence without confusion.',
                  },
                  {
                    id: 2,
                    question: 'Under Canon Law (CIC Can. 940), what does the red Sanctuary Lamp signal to all who enter the church?',
                    options: [
                      'That Sunday collection envelopes are being counted.',
                      'That Christ is truly and bodily present in the reserved Eucharist inside the Tabernacle.',
                      'That the church building is locked for cleaning.',
                    ],
                    correctIndex: 1,
                    explanation: 'The undying red light signals the physical Real Presence of Jesus Christ in the Blessed Sacrament, crying out: "The Master is here and calling for you!"',
                  },
                  {
                    id: 3,
                    question: 'When entering a Catholic church, what posture is canonically made toward the Tabernacle holding the Blessed Sacrament?',
                    options: [
                      'A brief nod of the head.',
                      'A genuflection on the right knee touching the floor (act of adoration for God).',
                      'No gesture is required unless Mass has begun.',
                    ],
                    correctIndex: 1,
                    explanation: 'Catholics genuflect on the right knee specifically to adore Jesus Christ truly present in the Tabernacle (GIRM §274).',
                  },
                ].map((q) => {
                  const selected = tabernacleQuizAnswers[q.id];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = selected === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1rem',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                        {q.id}. {q.question}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {q.options.map((opt, optIdx) => {
                          let optBg = '#f8fafc';
                          let optBorder = '1px solid #e2e8f0';
                          let optColor = '#334155';

                          if (hasAnswered) {
                            if (optIdx === q.correctIndex) {
                              optBg = '#dcfce7';
                              optBorder = '1px solid #22c55e';
                              optColor = '#15803d';
                            } else if (selected === optIdx) {
                              optBg = '#fee2e2';
                              optBorder = '1px solid #ef4444';
                              optColor = '#b91c1c';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                setTabernacleQuizAnswers({ ...tabernacleQuizAnswers, [q.id]: optIdx });
                                if (optIdx === q.correctIndex) {
                                  playSacredSound('bell');
                                } else {
                                  playSacredSound('click');
                                }
                              }}
                              style={{
                                textAlign: 'left',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: optBorder,
                                background: optBg,
                                color: optColor,
                                fontSize: '0.78rem',
                                fontWeight: selected === optIdx ? 800 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span style={{ marginRight: '6px', fontWeight: 800 }}>
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isCorrect ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
                            fontSize: '0.74rem',
                            color: isCorrect ? '#166534' : '#991b1b',
                          }}
                        >
                          <strong>{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EASTERN RITES & 24 SUI IURIS CHURCHES ALTAR & TABERNACLE COMPARATIVE STUDIO */}
        {/* ========================================================================= */}
        {activeTab === 'eastern-rites' && (
          <div>
            {/* Header Hero Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                color: '#ffffff',
                marginBottom: '1.75rem',
                border: '1px solid #34d399',
                boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '10px',
                }}
              >
                <span>📜 CCEO &amp; Eastern Liturgicons</span>
                <span>&bull;</span>
                <span>24 Churches Sui Iuris</span>
                <span>&bull;</span>
                <span>6 Sacred Rites</span>
                <span>&bull;</span>
                <span>CCC §§ 1200–1209</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px 0', color: '#fef08a' }}>
                🌍 The Holy Altar &amp; Tabernacle Across All 24 Catholic Churches
              </h2>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#d1fae5', lineHeight: 1.6, maxWidth: '880px' }}>
                The Catholic Church breathes with two lungs (St. John Paul II, <em>Orientale Lumen</em>).
                While the <strong>General Instruction of the Roman Missal (GIRM)</strong> guides the Latin (Roman) Rite,
                the <strong>Code of Canons of the Eastern Churches (CCEO)</strong> and ancient apostolic <em>Liturgicons</em> govern the venerable
                Eastern Catholic Churches. Explore how the Holy Table, the Tabernacle (<em>Artophorion</em>), candles, and relics
                are reverenced across all authentic Catholic traditions.
              </p>
            </div>

            {/* Socratic Caution Callout */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <span style={{ fontSize: '2rem' }}>💡</span>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#92400e' }}>
                  The Essential Liturgical Distinction: Why Following ONLY the GIRM Erases Catholic Diversity
                </h3>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.55 }}>
                  A frequent misconception among Catholics is assuming that the <strong>GIRM</strong> (General Instruction of the Roman Missal)
                  is universal Catholic dogma that binds all Catholic altars. In reality, the GIRM is strictly the liturgical instruction for the
                  <strong>Roman Rite</strong> of the Latin Church!
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
                  The Second Vatican Council declared in <em>Orientalium Ecclesiarum</em> (§5) that the venerable traditions of the Eastern Catholic
                  Churches are to be preserved without alteration. In the Byzantine Catholic tradition (e.g. Ukrainian, Melkite), the Tabernacle
                  (<em>Artophorion</em>) <strong>MUST sit directly on the Holy Table (Hagia Trapeza)</strong>, and candles form a 7-branched Menorah,
                  completely exempt from GIRM §315 and GIRM §117!
                </p>
              </div>
            </div>

            {/* Interactive Rite Tradition Selector Pills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Select a Liturgical Tradition to Inspect Altar &amp; Tabernacle Structure:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {RITE_ALTAR_TRADITIONS.map((trad) => {
                  const isCur = selectedRiteId === trad.id;
                  return (
                    <button
                      key={trad.id}
                      type="button"
                      onClick={() => {
                        setSelectedRiteId(trad.id);
                        playSacredSound('click');
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: `2px solid ${isCur ? '#047857' : '#cbd5e1'}`,
                        background: isCur ? '#047857' : '#ffffff',
                        color: isCur ? '#ffffff' : '#1e293b',
                        fontWeight: isCur ? 800 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        boxShadow: isCur ? '0 4px 12px rgba(4, 120, 87, 0.25)' : 'none',
                      }}
                    >
                      <span>{trad.icon}</span>
                      <span>{trad.traditionName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Rite Tradition Deep Dive Dossier */}
            {(() => {
              const activeRite = RITE_ALTAR_TRADITIONS.find((t) => t.id === selectedRiteId) || RITE_ALTAR_TRADITIONS[0];
              return (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '1.75rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    marginBottom: '2rem',
                  }}
                >
                  {/* Rite Title Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '2rem' }}>{activeRite.icon}</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                            {activeRite.traditionName}
                          </h3>
                          <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>
                            Rite Family: {activeRite.riteFamily} Tradition
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', maxWidth: '420px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                        Churches in Full Catholic Communion:
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#14532d', lineHeight: 1.3 }}>
                        {activeRite.churchesUsingThis}
                      </span>
                    </div>
                  </div>

                  {/* 6 Key Architectural & Liturgical Pillars Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    {/* 1. Canonical Norms */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.1rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📜</span>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Governing Liturgical Law</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                        {activeRite.governingNorms}
                      </p>
                    </div>

                    {/* 2. Altar Title & Structure */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.1rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🪵</span>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Altar Title &amp; Orientation</strong>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                        {activeRite.altarTitle}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                        {activeRite.altarOrientation}
                      </p>
                    </div>

                    {/* 3. Tabernacle Placement */}
                    <div style={{ background: '#fefce8', borderRadius: '12px', padding: '1.1rem', border: '1px solid #fef08a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🏛️</span>
                        <strong style={{ fontSize: '0.88rem', color: '#854d0e' }}>Tabernacle Form &amp; Location</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#713f12', lineHeight: 1.5 }}>
                        {activeRite.tabernacleFormAndLocation}
                      </p>
                    </div>

                    {/* 4. Candles & Lighting */}
                    <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '1.1rem', border: '1px solid #fde68a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🕯️</span>
                        <strong style={{ fontSize: '0.88rem', color: '#92400e' }}>Altar Candles &amp; Candelabra</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5 }}>
                        {activeRite.candlesAndLighting}
                      </p>
                    </div>

                    {/* 5. Linens & Relics */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.1rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🕊️</span>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Sacred Linens &amp; Holy Relics</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                        {activeRite.sacredLinensAndRelics}
                      </p>
                    </div>

                    {/* 6. Theological Emphasis */}
                    <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1.1rem', border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>✨</span>
                        <strong style={{ fontSize: '0.88rem', color: '#166534' }}>Theological Emphasis</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#14532d', lineHeight: 1.5 }}>
                        {activeRite.theologicalEmphasis}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Comparative Matrix Table Across All 7 Traditions */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                📊 Cross-Rite Comparative Matrix: Altar, Tabernacle &amp; Candles at a Glance
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                      <th style={{ padding: '10px 12px', borderRadius: '8px 0 0 0' }}>Catholic Tradition</th>
                      <th style={{ padding: '10px 12px' }}>Altar Name</th>
                      <th style={{ padding: '10px 12px' }}>Tabernacle Location</th>
                      <th style={{ padding: '10px 12px' }}>Candle Standard</th>
                      <th style={{ padding: '10px 12px' }}>Relic Vehicle</th>
                      <th style={{ padding: '10px 12px', borderRadius: '0 8px 0 0' }}>Governing Law</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RITE_ALTAR_TRADITIONS.map((trad, idx) => (
                      <tr
                        key={trad.id}
                        style={{
                          background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {trad.icon} {trad.traditionName.split('—')[0]}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#047857', fontWeight: 600 }}>
                          {trad.altarTitle.split('(')[0]}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          {trad.id === 'byzantine-rite' ? (
                            <strong style={{ color: '#b45309' }}>On the Holy Table (Artophorion)</strong>
                          ) : trad.id === 'roman-extraordinary' ? (
                            <strong style={{ color: '#1e3a8a' }}>On the High Altar Gradine</strong>
                          ) : trad.id === 'roman-ordinary' ? (
                            <span>Separate Stele / Chapel (GIRM 315)</span>
                          ) : (
                            <span>Upon Altar / Sanctuary Ark</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          {trad.id === 'byzantine-rite' ? '7-branch Menorah + Dikirion/Trikirion' : trad.id === 'roman-extraordinary' ? '6 candles (High Mass) / 7 (Bishop)' : trad.id === 'roman-ordinary' ? '2, 4, 6 or 7 candles (GIRM 117)' : 'Multiple lamps & candles'}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          {trad.id === 'byzantine-rite' ? 'Antimension (signed silk)' : trad.id === 'antiochene-maronite' ? 'Tablitho (wooden slab)' : 'Altar Stone / Sepulchre'}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontStyle: 'italic' }}>
                          {trad.governingNorms.split('&')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TYPES OF ALTARS COMPARATIVE STUDIO TAB */}
        {/* ========================================================================= */}
        {activeTab === 'types' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {ALTAR_TYPES.map((type) => {
                const isSelected = selectedAltarTypeId === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => {
                      setSelectedAltarTypeId(type.id);
                      playSacredSound('chime');
                    }}
                    style={{
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{type.icon}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                          {type.name}
                        </h4>
                        <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#64748b' }}>
                          {type.latinName}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                      {type.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Selected Altar Deep-Dive Dossier */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '2rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.2rem' }}>{activeAltarType.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                      {activeAltarType.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
                      {activeAltarType.latinName} &bull; {activeAltarType.subtitle}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {activeAltarType.description}
                </p>

                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 800, color: '#1e3a8a' }}>
                    Theological Significance:
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.5 }}>
                    {activeAltarType.theologicalSignificance}
                  </p>
                </div>

                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.86rem', fontWeight: 800, color: '#166534' }}>
                    Church Law &amp; Canonical Norm:
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#14532d', lineHeight: 1.5 }}>
                    {activeAltarType.canonicalNorm}
                  </p>
                </div>
              </div>

              <div>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                    Architectural &amp; Liturgical Features:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeAltarType.architecturalFeatures.map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 800, color: '#92400e' }}>
                    Historical Context &amp; Roman Tradition:
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5 }}>
                    {activeAltarType.historicalContext}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DRESS THE ALTAR SACRISTAN LAB TAB */}
        {/* ========================================================================= */}
        {activeTab === 'dress-altar' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    background: '#ca8a04',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  Step {dressingStep + 1} of {ALTAR_DRESSING_STEPS.length}
                </span>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  Sacristan Training: Preparing the Altar of Sacrifice
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Walk through the precise liturgical order for dressing the sacred table for the Holy Sacrifice of the Mass.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAdvanceDressingStep}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                }}
              >
                <span>{dressingStep === ALTAR_DRESSING_STEPS.length - 1 ? '🔄 Restart Dressing' : 'Next Step &rarr;'}</span>
              </button>
            </div>

            {/* Stepper Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {ALTAR_DRESSING_STEPS.map((step, idx) => {
                const isCurrent = dressingStep === idx;
                const isCompleted = dressingStep > idx;
                return (
                  <div
                    key={step.step}
                    onClick={() => {
                      setDressingStep(idx);
                      playSacredSound('chime');
                      setSelectedAppointmentId(step.itemKey);
                    }}
                    style={{
                      background: isCurrent ? '#eff6ff' : isCompleted ? '#f0fdf4' : '#ffffff',
                      border: isCurrent ? '2px solid #2563eb' : isCompleted ? '1px solid #86efac' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span
                        style={{
                          background: isCurrent ? '#2563eb' : isCompleted ? '#16a34a' : '#e2e8f0',
                          color: isCurrent || isCompleted ? '#ffffff' : '#64748b',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                        }}
                      >
                        {isCompleted ? '✓' : step.step}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#64748b' }}>
                        {step.latinTitle}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {step.title}
                    </h4>

                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                      {step.action}
                    </p>

                    <div
                      style={{
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        color: '#64748b',
                      }}
                    >
                      <strong>Why:</strong> {step.catecheticalReason}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ALTAR STONE & MARTYRS' RELICS (X-RAY) TAB */}
        {/* ========================================================================= */}
        {activeTab === 'relic-xray' && (
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              border: '2px solid #ca8a04',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
              <div>
                <span
                  style={{
                    background: 'rgba(250, 204, 21, 0.2)',
                    color: '#fef08a',
                    border: '1px solid rgba(250, 204, 21, 0.4)',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  Ara / Petra Sacra &bull; Revelation 6:9
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0', color: '#f8fafc' }}>
                  The Consecrated Altar Stone &amp; The Relics of the Martyrs
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  Every fixed Catholic altar contains or consists of natural stone anointed with Sacred Chrism by the Bishop.
                  Cut into the top of the stone are <strong>five crosses</strong> representing the Five Sacred Wounds of Christ (His hands, His feet, and His pierced side).
                </p>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 800, color: '#facc15' }}>
                    The Sepulchrum (The Holy Tomb):
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    In the center of the stone lies a small sealed cavity called the <em>Sepulchrum</em>. The Bishop personally deposits inside it tiny first-class relics (bone or hair fragments) of holy martyrs or canonized saints, sealed with mortar and the episcopal wax seal.
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(202, 138, 4, 0.15)',
                    border: '1px solid rgba(202, 138, 4, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 800, color: '#fef08a' }}>
                    Why Over the Martyrs? (Revelation 6:9):
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#fef3c7', lineHeight: 1.5 }}>
                    <em>"I saw under the altar the souls of those who had been slain for the word of God..."</em>
                    <br />
                    When ancient Roman soldiers hunted the early Christians, the Popes and bishops celebrated Holy Mass in the subterranean Catacombs of Rome directly upon the tombs of the martyrs who died for Christ. To this very day, every Catholic Mass continues this 2,000-year communion.
                  </p>
                </div>
              </div>

              {/* Graphic SVG Diagram of the Consecrated Altar Stone */}
              <div style={{ textAlign: 'center' }}>
                <svg
                  viewBox="0 0 360 360"
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    height: 'auto',
                    margin: '0 auto',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                  }}
                >
                  {/* Marble Stone Slab */}
                  <rect x="30" y="30" width="300" height="300" rx="12" fill="#334155" stroke="#ca8a04" strokeWidth="4" />
                  <rect x="42" y="42" width="276" height="276" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />

                  {/* 5 Crosses Cut into the Stone representing the Five Wounds */}
                  {/* Top Left Cross (Left Hand) */}
                  <g>
                    <line x1="80" y1="70" x2="80" y2="94" stroke="#facc15" strokeWidth="3" />
                    <line x1="68" y1="82" x2="92" y2="82" stroke="#facc15" strokeWidth="3" />
                    <circle cx="80" cy="82" r="14" fill="rgba(250, 204, 21, 0.15)" stroke="#facc15" strokeWidth="0.8" />
                  </g>

                  {/* Top Right Cross (Right Hand) */}
                  <g>
                    <line x1="280" y1="70" x2="280" y2="94" stroke="#facc15" strokeWidth="3" />
                    <line x1="268" y1="82" x2="292" y2="82" stroke="#facc15" strokeWidth="3" />
                    <circle cx="280" cy="82" r="14" fill="rgba(250, 204, 21, 0.15)" stroke="#facc15" strokeWidth="0.8" />
                  </g>

                  {/* Bottom Left Cross (Left Foot) */}
                  <g>
                    <line x1="80" y1="266" x2="80" y2="290" stroke="#facc15" strokeWidth="3" />
                    <line x1="68" y1="278" x2="92" y2="278" stroke="#facc15" strokeWidth="3" />
                    <circle cx="80" cy="278" r="14" fill="rgba(250, 204, 21, 0.15)" stroke="#facc15" strokeWidth="0.8" />
                  </g>

                  {/* Bottom Right Cross (Right Foot) */}
                  <g>
                    <line x1="280" y1="266" x2="280" y2="290" stroke="#facc15" strokeWidth="3" />
                    <line x1="268" y1="278" x2="292" y2="278" stroke="#facc15" strokeWidth="3" />
                    <circle cx="280" cy="278" r="14" fill="rgba(250, 204, 21, 0.15)" stroke="#facc15" strokeWidth="0.8" />
                  </g>

                  {/* Central Cross & Sepulchrum Reliquary (Pierced Sacred Heart) */}
                  <rect x="135" y="135" width="90" height="90" rx="8" fill="#ca8a04" stroke="#facc15" strokeWidth="2.5" />
                  <rect x="145" y="145" width="70" height="70" rx="4" fill="#0f172a" stroke="#fde68a" strokeWidth="1.5" />

                  <line x1="180" y1="155" x2="180" y2="205" stroke="#facc15" strokeWidth="4" />
                  <line x1="155" y1="180" x2="205" y2="180" stroke="#facc15" strokeWidth="4" />
                  <circle cx="180" cy="180" r="10" fill="#dc2626" />
                  <text x="180" y="184" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    ✠
                  </text>

                  <text x="180" y="248" fill="#facc15" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1">
                    SEPULCHRUM
                  </text>
                  <text x="180" y="260" fill="#cbd5e1" fontSize="8" textAnchor="middle">
                    SEALED RELICS OF MARTYRS
                  </text>
                </svg>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#fde68a', fontWeight: 600 }}>
                  Natural Marble Altar Stone (Petra Sacra) with Five Anointed Crosses
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AltarAnatomyExplorer;
