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
  AltarTypeInfo,
  AltarAppointment,
  AltarDressingStep,
} from '../data/catholic/altarData';

export type AltarTabMode = 'anatomy' | 'types' | 'dress-altar' | 'relic-xray';

export const AltarAnatomyExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AltarTabMode>('anatomy');
  const [selectedSeason, setSelectedSeason] = useState<string>('green');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('mensa');
  const [selectedAltarTypeId, setSelectedAltarTypeId] = useState<string>('freestanding');
  const [dressingStep, setDressingStep] = useState<number>(0);
  const [xrayActive, setXrayActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active items
  const currentSeason = LITURGICAL_SEASON_THEMES[selectedSeason] || LITURGICAL_SEASON_THEMES.green;
  const activeAppointment = useMemo(() => {
    return ALTAR_APPOINTMENTS.find((a) => a.id === selectedAppointmentId) || ALTAR_APPOINTMENTS[0];
  }, [selectedAppointmentId]);

  const activeAltarType = useMemo(() => {
    return ALTAR_TYPES.find((t) => t.id === selectedAltarTypeId) || ALTAR_TYPES[0];
  }, [selectedAltarTypeId]);

  // Procedural Web Audio Synthesis for Sanctus Bells and UI feedback
  const playSacredSound = useCallback(
    (type: 'bell' | 'chime' | 'organ' | 'click') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'bell') {
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

                  {/* Altar Candles (Left 2, Right 2 for Sunday Mass) */}
                  <g
                    onClick={() => handleSelectAppointment('altar-candles')}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Candlestick 1 (Far Left) */}
                    <rect x="235" y="190" width="10" height="20" fill="#eab308" />
                    <rect x="237" y="145" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    <circle cx="240" cy="140" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                    <circle cx="240" cy="139" r="2" fill="#fef08a" />

                    {/* Candlestick 2 (Inner Left) */}
                    <rect x="275" y="195" width="10" height="20" fill="#eab308" />
                    <rect x="277" y="150" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    <circle cx="280" cy="145" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                    <circle cx="280" cy="144" r="2" fill="#fef08a" />

                    {/* Candlestick 3 (Inner Right) */}
                    <rect x="515" y="195" width="10" height="20" fill="#eab308" />
                    <rect x="517" y="150" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    <circle cx="520" cy="145" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                    <circle cx="520" cy="144" r="2" fill="#fef08a" />

                    {/* Candlestick 4 (Far Right) */}
                    <rect x="555" y="190" width="10" height="20" fill="#eab308" />
                    <rect x="557" y="145" width="6" height="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    <circle cx="560" cy="140" r="4.5" fill="#f97316" filter="url(#altar-flame-glow)" />
                    <circle cx="560" cy="139" r="2" fill="#fef08a" />
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
