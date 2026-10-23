// src/components/TriduumEasterJourneyGuide.tsx
// St Joseph's Catholic Life & Faith Sanctuary
// The Sacred Paschal Triduum & The Glory of Easter (Sacrum Triduum Paschale)
// Interactive Liturgical Lectern, Lumen Christi Ceremoniary & 50-Day Paschal Journey

import React, { useState, useEffect } from 'react';
import {
  TRIDUUM_MOVEMENTS,
  LUMEN_CHRISTI_CEREMONY_STEPS,
  EXSULTET_SACRED_TEXT,
  VICTIMAE_PASCHALI_SEQUENCE,
  TriduumMovement,
  LumenChristiStep,
} from '../data/catholic/triduumEasterData';
import { speakInLanguage, cancelSpeech } from '../engine/translationService';
import { Link } from 'react-router-dom';
import AstVectorMediaPlayer from './AstVectorMediaPlayer';
import {
  playSuccessChime,
  triggerHapticSuccess,
  triggerHapticClick,
  playLumenChristiChant,
  playEasterBells,
  playCrotalusClapper,
} from '../services/soundHaptics';

type ReaderScale = 'standard' | 'comfortable' | 'presentation';
type LanguageMode = 'english' | 'bilingual' | 'latin';
type ActiveSubView = 'movements' | 'lumen-christi' | 'exsultet' | 'sequence';

export default function TriduumEasterJourneyGuide(): React.JSX.Element {
  const [activeMovementIndex, setActiveMovementIndex] = useState<number>(0);
  const [activeSubView, setActiveSubView] = useState<ActiveSubView>('movements');
  const [lumenStepIndex, setLumenStepIndex] = useState<number>(0);
  const [lumenIllumination, setLumenIllumination] = useState<number>(1); // 1 = Door (30%), 2 = Nave (65%), 3 = Sanctuary (100%)
  const [readerScale, setReaderScale] = useState<ReaderScale>('comfortable');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('bilingual');
  const [showPlayer, setShowPlayer] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [completedMovements, setCompletedMovements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stj_triduum_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const movement: TriduumMovement = TRIDUUM_MOVEMENTS[activeMovementIndex];
  const lumenStep: LumenChristiStep = LUMEN_CHRISTI_CEREMONY_STEPS[lumenStepIndex];

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  // Keyboard navigation across movements (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (activeSubView === 'movements') {
        if (e.key === 'ArrowRight' && activeMovementIndex < TRIDUUM_MOVEMENTS.length - 1) {
          setActiveMovementIndex((i) => i + 1);
        } else if (e.key === 'ArrowLeft' && activeMovementIndex > 0) {
          setActiveMovementIndex((i) => i - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMovementIndex, activeSubView]);

  const toggleMovementCompleted = (id: string) => {
    setCompletedMovements((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      try {
        localStorage.setItem('stj_triduum_completed', JSON.stringify(next));
      } catch {}
      if (!prev.includes(id)) {
        playSuccessChime();
        triggerHapticSuccess();
      }
      return next;
    });
  };

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakInLanguage(text, 'en');
  };

  const handleTriggerLumenElevation = (elevation: 1 | 2 | 3) => {
    setLumenIllumination(elevation);
    triggerHapticClick();
    playLumenChristiChant(elevation);
  };

  const scaleClasses = {
    standard: {
      scripture: 'text-base sm:text-lg leading-relaxed',
      body: 'text-sm sm:text-base leading-relaxed',
      versicle: 'text-base sm:text-lg',
      dropCap: 'text-3xl sm:text-4xl',
    },
    comfortable: {
      scripture: 'text-lg sm:text-xl leading-relaxed',
      body: 'text-base sm:text-lg leading-loose',
      versicle: 'text-lg sm:text-xl',
      dropCap: 'text-4xl sm:text-5xl',
    },
    presentation: {
      scripture: 'text-xl sm:text-2xl leading-relaxed font-medium',
      body: 'text-lg sm:text-xl leading-loose font-medium',
      versicle: 'text-xl sm:text-2xl font-medium',
      dropCap: 'text-5xl sm:text-6xl',
    },
  }[readerScale];

  const firstLetter = movement.theologicalSummary.charAt(0);
  const remainingSummary = movement.theologicalSummary.slice(1);

  return (
    <div className="space-y-8">
      {/* Devotional Sanctuary Header */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${movement.bgGradient} border border-amber-500/30 shadow-2xl p-6 sm:p-8 transition-all duration-700`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <span>Sacrum Triduum Paschale</span>
              <span>&bull;</span>
              <span>The Unbroken Liturgy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              The Sacred Paschal Triduum & Easter
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-serif">
              One continuous liturgy from Holy Thursday’s Upper Room to the blaze of <strong className="text-amber-300">Lumen Christi</strong> at the Easter Vigil and the 50 days of resurrection glory.
            </p>
          </div>

          {/* Quick Sound Actions & Settings Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                triggerHapticClick();
                playLumenChristiChant(3);
              }}
              title="Hear the triumphant Lumen Christi chant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow"
            >
              <span>🕯️</span>
              <span>Lumen Christi</span>
            </button>

            <button
              onClick={() => {
                triggerHapticClick();
                playEasterBells();
              }}
              title="Hear the joyful Easter church bells ringing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold bg-yellow-500/20 text-yellow-200 border border-yellow-500/40 hover:bg-yellow-500/30 transition-all shadow"
            >
              <span>🔔</span>
              <span>Easter Bells</span>
            </button>

            <button
              onClick={() => {
                triggerHapticClick();
                playCrotalusClapper();
              }}
              title="Hear the wooden clapper (crotalus) used when bells are silenced"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold bg-stone-700/50 text-stone-300 border border-stone-600 hover:bg-stone-700 transition-all shadow"
            >
              <span>🪵</span>
              <span>Crotalus</span>
            </button>

            <button
              onClick={() => {
                triggerHapticClick();
                setShowPlayer(!showPlayer);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 transition-all shadow"
            >
              <span>{showPlayer ? '▲ Hide Simulation' : '🎮 Vector Simulation'}</span>
            </button>

            <Link
              to="/media-player?preset=triduum-easter"
              title="Open full theatre vector media player"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold bg-stone-800 text-stone-300 border border-stone-600 hover:text-white hover:bg-stone-700 transition-all shadow"
            >
              <span>📺 Full Player</span>
            </Link>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
          {[
            { id: 'movements' as ActiveSubView, label: '📜 The 5 Liturgical Movements', icon: '⛪' },
            { id: 'lumen-christi' as ActiveSubView, label: '🕯️ Lumen Christi & New Fire', icon: '🔥' },
            { id: 'exsultet' as ActiveSubView, label: '📜 The Exsultet (Easter Proclamation)', icon: '✨' },
            { id: 'sequence' as ActiveSubView, label: '🎶 Victimae Paschali (Easter Sequence)', icon: '🕊️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                triggerHapticClick();
                setActiveSubView(item.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-serif font-medium transition-all ${
                activeSubView === item.id
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-300'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded AST Vector Media Player for Triduum & Easter */}
      {showPlayer && (
        <div className="rounded-2xl overflow-hidden border border-amber-500/30 bg-stone-950 shadow-2xl relative mb-6">
          <div className="bg-stone-900/90 px-4 py-2.5 border-b border-stone-800 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-serif font-semibold text-amber-300">
              <span>🔥</span>
              <span>AST Vector Interactive Engine: The Sacred Triduum &amp; Easter Glory</span>
            </span>
            <span className="text-[11px] text-amber-400/80 font-mono">Cartridge: triduum-easter.ast</span>
          </div>
          <AstVectorMediaPlayer
            preset="triduum-easter"
            height="clamp(240px, 45vw + 40px, 420px)"
            allowPresetSwitch={false}
            embedded={true}
          />
        </div>
      )}

      {/* Sub-View 1: The 5 Liturgical Movements */}
      {activeSubView === 'movements' && (
        <div className="space-y-6">
          {/* The Unbroken Liturgical Ribbon (Interactive 5-Movement Stepper) */}
          <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs text-stone-400 font-serif">
              <span className="font-semibold text-amber-400 uppercase tracking-wider">
                The Unbroken Paschal Sequence:
              </span>
              <span>{completedMovements.length} of 5 Explored</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {TRIDUUM_MOVEMENTS.map((mov, idx) => {
                const isActive = idx === activeMovementIndex;
                const isDone = completedMovements.includes(mov.id);
                return (
                  <button
                    key={mov.id}
                    onClick={() => {
                      triggerHapticClick();
                      setActiveMovementIndex(idx);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-400">Step {idx + 1}</span>
                      {isDone && <span className="text-emerald-400 font-bold text-xs">✓ Done</span>}
                    </div>
                    <div className="text-xs sm:text-sm font-serif font-semibold text-white line-clamp-1">
                      {mov.dayTitle.split(':')[0]}
                    </div>
                    <div className="text-[11px] text-stone-400 line-clamp-1 font-serif">
                      {mov.badgeText.split(':')[1] || mov.badgeText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Movement Hero Card */}
          <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {movement.badgeText}
                  </span>
                  <span className="text-xs text-stone-400 font-serif">{movement.timeContext}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {movement.dayTitle}
                </h3>
                <div className="text-sm sm:text-base font-serif italic text-amber-300/80">
                  {movement.latinTitle}
                </div>
              </div>

              {/* Progress completion checkbox */}
              <button
                onClick={() => toggleMovementCompleted(movement.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold transition-all border ${
                  completedMovements.includes(movement.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-400'
                }`}
              >
                <span>{completedMovements.includes(movement.id) ? '✓ Mark as Reflected' : 'Mark as Reflected'}</span>
              </button>
            </div>

            {/* Liturgical Colors & Unbroken Rule Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-900/60 rounded-2xl border border-stone-800 p-4">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                  🎨 Liturgical Vesture & Atmosphere
                </div>
                <div className="text-sm font-serif text-stone-200">
                  {movement.liturgicalColor}
                </div>
              </div>

              <div className="bg-stone-900/60 rounded-2xl border border-stone-800 p-4">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                  🕊️ Liturgical Continuity Rule
                </div>
                <div className="text-sm font-serif text-stone-300 italic">
                  {movement.liturgicalActionGuidance}
                </div>
              </div>
            </div>

            {/* Antiphonal Sacred Versicle & Chanted Dialog */}
            <div className="bg-stone-900/80 rounded-2xl border border-amber-500/30 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-400 font-serif font-semibold uppercase tracking-wider">
                <span>Antiphonal Liturgical Dialogue</span>
                <span className="text-stone-400">Priest &bull; Assembly</span>
              </div>

              <div className="space-y-2 font-serif text-stone-100">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-amber-400 text-xs sm:text-sm uppercase tracking-wider w-16 shrink-0 pt-0.5">
                    Priest:
                  </span>
                  <div className="space-y-0.5">
                    <p className={`font-medium ${scaleClasses.versicle}`}>
                      {movement.sacredVersicle.prompt}
                    </p>
                    <p className="text-xs sm:text-sm italic text-stone-400">
                      {movement.sacredVersicle.latinPrompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pl-4 sm:pl-8 border-l-2 border-amber-500/40">
                  <span className="font-bold text-amber-300 text-xs sm:text-sm uppercase tracking-wider w-16 shrink-0 pt-0.5">
                    People:
                  </span>
                  <div className="space-y-0.5">
                    <p className={`font-semibold text-amber-200 ${scaleClasses.versicle}`}>
                      {movement.sacredVersicle.response}
                    </p>
                    <p className="text-xs sm:text-sm italic text-stone-400">
                      {movement.sacredVersicle.latinResponse}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Theological Lectern & Reflection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <span>📖</span>
                  <span>Catechetical Lectern & Scriptural Foundation</span>
                </h4>
                
                {/* Voice Narration Button */}
                <button
                  onClick={() =>
                    handleSpeakText(
                      `${movement.dayTitle}. ${movement.theologicalSummary}. Scripture: ${movement.scriptureText}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition"
                >
                  <span>{isSpeaking ? '⏹️ Stop Voice' : '🔊 Listen'}</span>
                </button>
              </div>

              {/* Illuminated Drop-Cap Reflection */}
              <div className={`font-serif text-stone-200 ${scaleClasses.body}`}>
                <span className={`float-left mr-3 mt-1 font-serif font-black text-amber-400 leading-none ${scaleClasses.dropCap}`}>
                  {firstLetter}
                </span>
                {remainingSummary}
              </div>

              {/* Scripture Quotation */}
              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-400 font-serif font-semibold">
                  <span>Sacred Scripture</span>
                  <span>{movement.scriptureReference}</span>
                </div>
                <blockquote className={`font-serif italic text-stone-300 ${scaleClasses.scripture}`}>
                  &ldquo;{movement.scriptureText}&rdquo;
                </blockquote>
                {languageMode !== 'english' && (
                  <p className="font-serif italic text-xs sm:text-sm text-stone-500 pt-1 border-t border-stone-800/80">
                    &ldquo;{movement.scriptureLatin}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Ceremonial Actions Grid */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <span>⛪</span>
                <span>The Sacred Rites & Symbolic Actions</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movement.ceremonies.map((ceremony, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-stone-950 border border-stone-800 shrink-0">
                        {ceremony.symbolIcon}
                      </span>
                      <div>
                        <h5 className="font-serif font-bold text-white text-base">
                          {ceremony.title}
                        </h5>
                        {ceremony.latinTitle && (
                          <div className="text-xs font-serif italic text-amber-400/80">
                            {ceremony.latinTitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-300 font-serif leading-relaxed">
                      {ceremony.description}
                    </p>
                    <div className="pt-2 text-xs text-amber-300/90 font-serif italic border-t border-stone-800/60">
                      <strong>Theological Sign:</strong> {ceremony.theologicalMeaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Standard Alignment */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs font-serif text-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong className="text-amber-300">Curriculum & RECD Alignment:</strong> {movement.curriculumKeyStageAlignment}
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
                {movement.recdConcept}
              </span>
            </div>

            {/* Stepper Buttons (Prev / Next) */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-800">
              <button
                onClick={() => {
                  triggerHapticClick();
                  setActiveMovementIndex((i) => Math.max(0, i - 1));
                }}
                disabled={activeMovementIndex === 0}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold bg-stone-800 text-stone-200 border border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-700 transition"
              >
                &larr; Previous Movement
              </button>

              <span className="text-xs text-stone-400 font-serif">
                Movement {activeMovementIndex + 1} of {TRIDUUM_MOVEMENTS.length}
              </span>

              <button
                onClick={() => {
                  triggerHapticClick();
                  setActiveMovementIndex((i) => Math.min(TRIDUUM_MOVEMENTS.length - 1, i + 1));
                }}
                disabled={activeMovementIndex === TRIDUUM_MOVEMENTS.length - 1}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold bg-amber-500 text-stone-950 font-bold border border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition shadow"
              >
                Next Movement &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 2: Interactive Lumen Christi Ceremony */}
      {activeSubView === 'lumen-christi' && (
        <div className="space-y-6">
          {/* Elevation Stage Preview with Dynamic Lighting */}
          <div
            className={`relative rounded-3xl border border-amber-500/40 p-6 sm:p-10 transition-all duration-1000 shadow-2xl overflow-hidden ${
              lumenIllumination === 1
                ? 'bg-gradient-to-b from-stone-950 via-slate-950 to-amber-950/20'
                : lumenIllumination === 2
                ? 'bg-gradient-to-b from-amber-950/50 via-stone-900 to-amber-950/40 ring-1 ring-amber-500/40'
                : 'bg-gradient-to-b from-amber-900/60 via-stone-900 to-amber-800/40 ring-2 ring-amber-400 shadow-amber-500/20'
            }`}
          >
            {/* Ambient Candle Glow Diffusion Layer */}
            <div
              className={`absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent pointer-events-none transition-opacity duration-1000 ${
                lumenIllumination === 1 ? 'opacity-30' : lumenIllumination === 2 ? 'opacity-70' : 'opacity-100'
              }`}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Interactive SVG Paschal Candle Cartridge (< 2 KB) */}
              <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-stone-950/80 border border-amber-500/30 shadow-2xl">
                <svg
                  width="180"
                  height="260"
                  viewBox="0 0 180 260"
                  className="drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]"
                >
                  {/* Candle Base / Stand */}
                  <path d="M 50 250 L 130 250 L 115 235 L 65 235 Z" fill="#78350f" stroke="#d97706" strokeWidth="2" />
                  <rect x="85" y="210" width="10" height="25" fill="#b45309" />
                  <ellipse cx="90" cy="210" rx="30" ry="6" fill="#f59e0b" opacity="0.9" />

                  {/* Wax Candle Body (Virgin Beeswax) */}
                  <rect x="70" y="65" width="40" height="145" rx="3" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" />

                  {/* Cross Marked on Wax */}
                  <line x1="90" y1="95" x2="90" y2="175" stroke="#b91c1c" strokeWidth="4" strokeLinecap="round" />
                  <line x1="75" y1="120" x2="105" y2="120" stroke="#b91c1c" strokeWidth="4" strokeLinecap="round" />

                  {/* Alpha (Top) & Omega (Bottom) */}
                  <text x="90" y="88" textAnchor="middle" fill="#b91c1c" fontSize="11" fontFamily="Georgia, serif" fontWeight="bold">
                    Α
                  </text>
                  <text x="90" y="193" textAnchor="middle" fill="#b91c1c" fontSize="11" fontFamily="Georgia, serif" fontWeight="bold">
                    Ω
                  </text>

                  {/* Year 2026 Inscribed */}
                  <text x="80" y="112" textAnchor="middle" fill="#b91c1c" fontSize="9" fontFamily="Georgia, serif" fontWeight="bold">2</text>
                  <text x="100" y="112" textAnchor="middle" fill="#b91c1c" fontSize="9" fontFamily="Georgia, serif" fontWeight="bold">0</text>
                  <text x="80" y="138" textAnchor="middle" fill="#b91c1c" fontSize="9" fontFamily="Georgia, serif" fontWeight="bold">2</text>
                  <text x="100" y="138" textAnchor="middle" fill="#b91c1c" fontSize="9" fontFamily="Georgia, serif" fontWeight="bold">6</text>

                  {/* 5 Grains of Incense (The 5 Holy Wounds) */}
                  <circle cx="90" cy="98" r="3" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
                  <circle cx="90" cy="170" r="3" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
                  <circle cx="77" cy="120" r="3" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
                  <circle cx="103" cy="120" r="3" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
                  <circle cx="90" cy="120" r="3.5" fill="#991b1b" stroke="#fbbf24" strokeWidth="1" />

                  {/* Candle Wick */}
                  <line x1="90" y1="65" x2="90" y2="52" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />

                  {/* The Living Flame of the Resurrection */}
                  <path
                    d="M 90 20 C 75 42, 80 54, 90 54 C 100 54, 105 42, 90 20 Z"
                    fill="url(#easterFlameGrad)"
                  >
                    <animate attributeName="d" dur="1.8s" repeatCount="indefinite"
                      values="
                        M 90 20 C 75 42, 80 54, 90 54 C 100 54, 105 42, 90 20 Z;
                        M 90 17 C 73 40, 83 54, 90 54 C 97 54, 107 40, 90 17 Z;
                        M 90 20 C 75 42, 80 54, 90 54 C 100 54, 105 42, 90 20 Z
                      "
                    />
                  </path>
                  <circle cx="90" cy="46" r="4" fill="#ffffff" opacity="0.9" />

                  <defs>
                    <linearGradient id="easterFlameGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#fef08a" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="text-center mt-3">
                  <div className="text-xs font-serif font-bold text-amber-300">
                    Cereus Paschalis (2026)
                  </div>
                  <div className="text-[11px] text-stone-400 font-serif">
                    Alpha &bull; Omega &bull; 5 Sacred Wounds
                  </div>
                </div>
              </div>

              {/* Ceremony Step Details */}
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-stone-950">
                    Step {lumenStep.stepNumber} of {LUMEN_CHRISTI_CEREMONY_STEPS.length}
                  </span>
                  <span className="text-xs text-amber-300 font-serif">{lumenStep.location}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {lumenStep.title}
                </h3>
                <div className="text-sm font-serif italic text-amber-300/80">
                  {lumenStep.latinTitle}
                </div>

                <p className="text-sm sm:text-base text-stone-200 font-serif leading-relaxed">
                  {lumenStep.ritualAction}
                </p>

                {/* Chanted Proclamation Box */}
                <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-serif font-semibold">
                    <span>The Sacred Proclamation</span>
                    {lumenStep.elevationPitchNote && (
                      <span className="text-stone-300 font-mono text-[11px]">
                        Pitch: {lumenStep.elevationPitchNote}
                      </span>
                    )}
                  </div>

                  <div className="font-serif text-lg text-white font-bold">
                    &ldquo;{lumenStep.wordsSpoken}&rdquo;
                  </div>
                  <div className="font-serif italic text-sm text-amber-300/80">
                    &ldquo;{lumenStep.wordsLatin}&rdquo;
                  </div>

                  <div className="pt-2 border-t border-stone-800 text-sm font-serif text-amber-200 font-semibold">
                    Response: &ldquo;{lumenStep.wordsResponse}&rdquo; <span className="italic text-stone-400">({lumenStep.wordsResponseLatin})</span>
                  </div>
                </div>

                {/* The 3 Elevation Sound Action Triggers */}
                <div className="pt-2">
                  <div className="text-xs font-serif font-semibold text-amber-300 uppercase tracking-wider mb-2">
                    🎵 Test the Three Liturgical Elevations (Audio &amp; Light Shift):
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleTriggerLumenElevation(1)}
                      className={`p-2.5 rounded-xl text-xs font-serif font-semibold border transition-all text-center ${
                        lumenIllumination === 1
                          ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-lg'
                          : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <div className="text-xs">🚪 1. At Door</div>
                      <div className="text-[10px] opacity-75">Low Chant (30% Light)</div>
                    </button>

                    <button
                      onClick={() => handleTriggerLumenElevation(2)}
                      className={`p-2.5 rounded-xl text-xs font-serif font-semibold border transition-all text-center ${
                        lumenIllumination === 2
                          ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-lg'
                          : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <div className="text-xs">⛪ 2. In Nave</div>
                      <div className="text-[10px] opacity-75">Mid Chant (65% Light)</div>
                    </button>

                    <button
                      onClick={() => handleTriggerLumenElevation(3)}
                      className={`p-2.5 rounded-xl text-xs font-serif font-semibold border transition-all text-center ${
                        lumenIllumination === 3
                          ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-lg'
                          : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <div className="text-xs">✨ 3. At Altar</div>
                      <div className="text-[10px] opacity-75">High Chant (100% Light)</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Buttons for Lumen Christi Steps */}
          <div className="flex items-center justify-between p-4 bg-stone-950 rounded-2xl border border-stone-800">
            <button
              onClick={() => {
                triggerHapticClick();
                setLumenStepIndex((i) => Math.max(0, i - 1));
              }}
              disabled={lumenStepIndex === 0}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold bg-stone-800 text-stone-200 border border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-700 transition"
            >
              &larr; Previous Step
            </button>

            <span className="text-xs text-stone-400 font-serif">
              Step {lumenStepIndex + 1} of {LUMEN_CHRISTI_CEREMONY_STEPS.length}
            </span>

            <button
              onClick={() => {
                triggerHapticClick();
                setLumenStepIndex((i) => Math.min(LUMEN_CHRISTI_CEREMONY_STEPS.length - 1, i + 1));
              }}
              disabled={lumenStepIndex === LUMEN_CHRISTI_CEREMONY_STEPS.length - 1}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold bg-amber-500 text-stone-950 font-bold border border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition shadow"
            >
              Next Step &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Sub-View 3: The Exsultet (Easter Proclamation) */}
      {activeSubView === 'exsultet' && (
        <div className="bg-stone-950 rounded-3xl border border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                Praeconium Paschale
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {EXSULTET_SACRED_TEXT.englishTitle}
              </h3>
              <p className="text-sm font-serif text-stone-400">
                The ancient hymn sung by the deacon beside the burning Paschal Candle in the darkened church.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeakText(EXSULTET_SACRED_TEXT.openingInvocation.english)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-serif font-semibold bg-stone-800 text-stone-200 border border-stone-700 hover:text-white transition"
              >
                {isSpeaking ? '⏹️ Stop Narration' : '🔊 Listen to Exsultet'}
              </button>
            </div>
          </div>

          {/* Key Theological Stanzas */}
          <div className="space-y-6 font-serif">
            {/* Opening Trumpet Stanza */}
            <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                I. The Cosmic Summons of Angels & Earth
              </div>
              <p className="text-stone-100 text-base sm:text-lg leading-relaxed">
                &ldquo;{EXSULTET_SACRED_TEXT.openingInvocation.english}&rdquo;
              </p>
              <p className="text-stone-400 italic text-sm pt-2 border-t border-stone-800">
                &ldquo;{EXSULTET_SACRED_TEXT.openingInvocation.latin}&rdquo;
              </p>
            </div>

            {/* O Felix Culpa Stanza */}
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300 uppercase tracking-wider">
                <span>II. The "O Felix Culpa" (The Happy Fault)</span>
                <span className="text-amber-400 font-bold text-xs">Supreme Theological Climax</span>
              </div>
              <p className="text-amber-100 text-base sm:text-lg font-medium leading-relaxed">
                &ldquo;{EXSULTET_SACRED_TEXT.felixCulpaStanza.english}&rdquo;
              </p>
              <p className="text-amber-300/80 italic text-sm pt-2 border-t border-amber-500/20">
                &ldquo;{EXSULTET_SACRED_TEXT.felixCulpaStanza.latin}&rdquo;
              </p>
              <div className="text-xs font-serif text-stone-300 bg-stone-950/60 p-3 rounded-xl border border-amber-500/20">
                <strong>Pedagogical Insight:</strong> St. Thomas Aquinas observed that God allows evil only to bring about a greater good. The fall of Adam brought forth the incarnation of God Himself.
              </div>
            </div>

            {/* Pillar of Fire Stanza */}
            <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                III. The Night that Shines as Bright as Day
              </div>
              <p className="text-stone-100 text-base sm:text-lg leading-relaxed">
                &ldquo;{EXSULTET_SACRED_TEXT.pillarOfFireStanza.english}&rdquo;
              </p>
              <p className="text-stone-400 italic text-sm pt-2 border-t border-stone-800">
                &ldquo;{EXSULTET_SACRED_TEXT.pillarOfFireStanza.latin}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 4: The Easter Sequence (Victimae Paschali Laudes) */}
      {activeSubView === 'sequence' && (
        <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
                Sequentia Paschalis
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {VICTIMAE_PASCHALI_SEQUENCE.englishTitle}
              </h3>
              <p className="text-sm font-serif text-stone-400">
                Chanted immediately before the Holy Gospel on Easter Sunday and throughout the Octave.
              </p>
            </div>

            <button
              onClick={() => {
                triggerHapticClick();
                playEasterBells();
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-serif font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30 transition"
            >
              🔔 Ring Easter Bells
            </button>
          </div>

          {/* Stanzas in Poetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VICTIMAE_PASCHALI_SEQUENCE.stanzas.map((stanza, sIdx) => (
              <div
                key={sIdx}
                className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-400/40 transition-all space-y-3 font-serif"
              >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Stanza {sIdx + 1}
                </div>
                <div className="text-white text-base leading-relaxed">
                  {stanza.english}
                </div>
                <div className="text-stone-400 text-xs sm:text-sm italic pt-2 border-t border-stone-800">
                  {stanza.latin}
                </div>
              </div>
            ))}
          </div>

          {/* Mary Magdalene Commentary */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-serif text-stone-300">
            <strong className="text-emerald-300">Apostolorum Apostola:</strong> When the Sequence asks, <em>&ldquo;Dic nobis Maria, quid vidisti in via?&rdquo;</em> (Tell us Mary, what did you see on the way?), Mary Magdalene becomes the first witness of the resurrection, testifying directly to the empty tomb, the angels, and the living Christ.
          </div>
        </div>
      )}
    </div>
  );
}
