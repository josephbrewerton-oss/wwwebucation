// src/components/StationsOfTheCrossGuide.tsx
// St Joseph's Catholic Life & Faith Sanctuary
// Complete Catechetical & Liturgical Guide: The Stations of the Cross (Via Crucis)
// Elevated Sacred Typographic Lectern & Contemplative Chapel Presentation

import React, { useState, useEffect } from 'react';
import {
  STATIONS_OF_THE_CROSS,
  OPENING_DEVOTIONAL_VERSICLE,
  STATIONS_HISTORY_AND_THEOLOGY,
  StationOfTheCross,
} from '../data/catholic/stationsOfTheCrossData';
import AstVectorMediaPlayer from './AstVectorMediaPlayer';
import { speakInLanguage, cancelSpeech } from '../engine/translationService';
import { playSuccessChime, triggerHapticSuccess } from '../services/soundHaptics';

type TextScale = 'standard' | 'comfortable' | 'presentation';
type LanguageMode = 'english' | 'bilingual' | 'spanish';

export default function StationsOfTheCrossGuide(): React.JSX.Element {
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(0);
  const [showPlayer, setShowPlayer] = useState<boolean>(true);
  const [textScale, setTextScale] = useState<TextScale>('comfortable');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('bilingual');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [completedStations, setCompletedStations] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('stj_stations_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const station: StationOfTheCross = STATIONS_OF_THE_CROSS[selectedStationIndex];

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  // Keyboard navigation for Stations (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' && selectedStationIndex < STATIONS_OF_THE_CROSS.length - 1) {
        setSelectedStationIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && selectedStationIndex > 0) {
        setSelectedStationIndex((i) => i - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStationIndex]);

  const toggleStationCompleted = (num: number) => {
    setCompletedStations((prev) => {
      const next = prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num];
      try {
        localStorage.setItem('stj_stations_completed', JSON.stringify(next));
      } catch {}
      if (!prev.includes(num)) {
        playSuccessChime();
        triggerHapticSuccess();
      }
      return next;
    });
  };

  const handleSpeakMeditation = () => {
    if (isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = `${station.romanNumeral}. ${station.title}. Scripture: ${station.scripturePassage}. Meditation: ${station.meditation}. Prayer: ${station.prayer}`;
    setIsSpeaking(true);
    speakInLanguage(textToSpeak, 'en');
  };

  const isCompleted = completedStations.includes(station.number);

  // Dynamic text size classes based on reader preference / classroom smartboard
  const scaleClasses = {
    standard: {
      scripture: 'text-base sm:text-lg leading-relaxed',
      meditation: 'text-sm sm:text-base leading-relaxed',
      prayer: 'text-sm sm:text-base leading-relaxed',
      stabat: 'text-sm leading-relaxed',
      dropCap: 'text-3xl sm:text-4xl',
    },
    comfortable: {
      scripture: 'text-lg sm:text-xl leading-relaxed',
      meditation: 'text-base sm:text-lg leading-loose',
      prayer: 'text-base sm:text-lg leading-relaxed',
      stabat: 'text-base leading-relaxed',
      dropCap: 'text-4xl sm:text-5xl',
    },
    presentation: {
      scripture: 'text-xl sm:text-2xl leading-relaxed font-medium',
      meditation: 'text-lg sm:text-xl leading-loose font-medium',
      prayer: 'text-lg sm:text-xl leading-relaxed font-medium',
      stabat: 'text-lg leading-relaxed font-medium',
      dropCap: 'text-5xl sm:text-6xl',
    },
  }[textScale];

  // Extract first letter for illuminated manuscript drop-cap
  const firstLetter = station.meditation.charAt(0);
  const remainingMeditation = station.meditation.slice(1);

  return (
    <div className={`space-y-8 ${focusMode ? 'max-w-4xl mx-auto' : ''}`}>
      {/* Devotional Sanctuary Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-slate-950 to-amber-950/50 border border-amber-500/30 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-widest uppercase">
              <span>Sacred Passion</span>
              <span aria-hidden="true" className="text-amber-500/60">·</span>
              <span>Via Dolorosa</span>
              <span aria-hidden="true" className="text-amber-500/60">·</span>
              <span>14 Traditional Stations</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
              <span className="text-amber-400 font-serif">✝</span>
              <span>The Stations of the Cross</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 font-serif italic">
              Via Crucis · St. Alphonsus Liguori &amp; Franciscan Devotional Tradition
            </p>
          </div>

          {/* Reader & Liturgical Presentation Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Simulation Toggle */}
            <button
              type="button"
              onClick={() => setShowPlayer(!showPlayer)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <span>{showPlayer ? 'Hide Simulation' : 'Show Simulation'}</span>
              <span>{showPlayer ? '▲' : '▼'}</span>
            </button>

            {/* Language Mode Selector */}
            <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setLanguageMode('english')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  languageMode === 'english'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('bilingual')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  languageMode === 'bilingual'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Latin/Eng
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('spanish')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  languageMode === 'spanish'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Español
              </button>
            </div>

            {/* Smartboard / Text Size Selector */}
            <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-white/10 text-xs" title="Adjust text size for classroom reading or smartboard display">
              <button
                type="button"
                onClick={() => setTextScale('standard')}
                className={`px-2 py-1.5 rounded-lg transition-colors text-xs ${
                  textScale === 'standard' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setTextScale('comfortable')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors text-sm font-semibold ${
                  textScale === 'comfortable' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setTextScale('presentation')}
                className={`px-3 py-1.5 rounded-lg transition-colors text-base font-bold ${
                  textScale === 'presentation' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Classroom Smartboard / Presentation Mode"
              >
                A+
              </button>
            </div>

            {/* Contemplative Focus Mode */}
            <button
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                focusMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:text-slate-200'
              }`}
              title={focusMode ? 'Exit Contemplative Chapel Mode' : 'Enter Contemplative Chapel Mode'}
            >
              {focusMode ? '👁️ Standard View' : '🕯️ Chapel Focus'}
            </button>
          </div>
        </div>

        {/* Traditional Opening Versicle Plaque */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950/75 border border-amber-500/20 backdrop-blur-sm shadow-inner space-y-2">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <span className="text-[11px] font-serif uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-2">
              <span>☩</span>
              <span>Devotional Opening Versicle &amp; Response</span>
            </span>
            <span className="text-[11px] text-slate-400 italic">Genuflect in prayer</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm font-serif pt-1">
            <div className="space-y-1">
              <span className="text-amber-400 font-bold tracking-wide block">Leader:</span>
              <p className="text-white italic">
                {languageMode === 'spanish'
                  ? 'Te adoramos, oh Cristo, y te bendecimos.'
                  : languageMode === 'english'
                  ? OPENING_DEVOTIONAL_VERSICLE.leaderEnglish
                  : OPENING_DEVOTIONAL_VERSICLE.leaderLatin}
              </p>
              {languageMode === 'bilingual' && (
                <p className="text-slate-400 text-xs italic">
                  &ldquo;{OPENING_DEVOTIONAL_VERSICLE.leaderEnglish}&rdquo;
                </p>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-amber-400 font-bold tracking-wide block">All Response:</span>
              <p className="text-white italic">
                {languageMode === 'spanish'
                  ? 'Porque por tu santa cruz redimiste al mundo.'
                  : languageMode === 'english'
                  ? OPENING_DEVOTIONAL_VERSICLE.responseEnglish
                  : OPENING_DEVOTIONAL_VERSICLE.responseLatin}
              </p>
              {languageMode === 'bilingual' && (
                <p className="text-slate-400 text-xs italic">
                  &ldquo;{OPENING_DEVOTIONAL_VERSICLE.responseEnglish}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded AST Vector Media Player for Stations of the Cross */}
      {showPlayer && (
        <div className="rounded-3xl border border-amber-500/30 overflow-hidden bg-slate-950 shadow-2xl max-w-full">
          <div className="px-5 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-serif">AST Interactive Simulation: stations-of-the-cross</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
                <span>✝️ 14 Sacred Stations</span>
                <span className="text-slate-500 hidden sm:inline">&bull;</span>
                <span className="text-slate-300 hidden sm:inline">Interactive Checkpoints &amp; Drag</span>
              </span>
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%', pointerEvents: 'auto' }}>
            <AstVectorMediaPlayer
              preset="stations-of-the-cross"
              height="clamp(220px, 45vw + 40px, 390px)"
              allowPresetSwitch={false}
              embedded={true}
              bslEnabled={false}
            />
          </div>
        </div>
      )}

      {/* Pilgrimage Ribbon: Sacred Station Navigation Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="font-serif uppercase tracking-widest text-slate-400 font-semibold">
              Sacred Pilgrim Path (Via Dolorosa)
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">Use ← → arrow keys to navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-serif font-bold">
              {completedStations.length} of {STATIONS_OF_THE_CROSS.length} Stations Prayed
            </span>
            {completedStations.length === STATIONS_OF_THE_CROSS.length && (
              <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                Plenary Devotion Complete
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Pilgrim Step Ribbon */}
        <div className="relative p-2 rounded-2xl bg-stone-950/80 border border-amber-500/20 shadow-lg overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 min-w-max sm:min-w-0 sm:grid sm:grid-cols-7 md:grid-cols-14">
            {STATIONS_OF_THE_CROSS.map((st, idx) => {
              const active = idx === selectedStationIndex;
              const done = completedStations.includes(st.number);
              return (
                <button
                  key={st.number}
                  type="button"
                  onClick={() => setSelectedStationIndex(idx)}
                  className={`group relative flex flex-col items-center justify-center py-2 px-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg ring-2 ring-amber-300/80 scale-[1.03] z-10'
                      : done
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-white/5'
                  }`}
                  title={`Station ${st.romanNumeral}: ${st.title}`}
                >
                  <span className="text-[11px] font-serif font-bold tracking-wider leading-none">
                    {st.romanNumeral}
                  </span>
                  <span className="text-[13px] mt-1 leading-none">
                    {st.symbol}
                  </span>
                  {done && (
                    <span className="absolute top-1 right-1 text-[8px] text-emerald-300 font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Station Detailed Devotional Lectern Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-stone-950 to-slate-950 border border-amber-500/30 shadow-2xl overflow-hidden p-6 sm:p-10 space-y-8">
        {/* Subtle illuminated watermark cross in background */}
        <div className="absolute right-6 top-8 text-white/[0.02] text-9xl font-serif select-none pointer-events-none">
          ✝
        </div>

        {/* Station Dignified Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-amber-500/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-serif font-semibold text-amber-400 tracking-widest uppercase">
              <span>Station {station.romanNumeral}</span>
              <span aria-hidden="true" className="text-amber-500/50">·</span>
              <span className="italic">{station.latinTitle}</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {languageMode === 'spanish' ? station.spanishTitle : station.title}
            </h3>
            {languageMode !== 'spanish' && (
              <p className="text-xs sm:text-sm text-slate-400 italic font-serif">
                {station.spanishTitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-start shrink-0">
            <button
              type="button"
              onClick={handleSpeakMeditation}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                isSpeaking
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <span>{isSpeaking ? '⏹ Stop Audio' : '🔊 Listen (Spoken Prayer)'}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleStationCompleted(station.number)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 shadow-sm ${
                isCompleted
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400'
              }`}
            >
              <span>{isCompleted ? '✓ Prayed' : 'Mark Station Prayed'}</span>
            </button>
          </div>
        </div>

        {/* Sacred Scripture Lectern Display */}
        <div className="relative rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950/80 to-slate-950/80 border-l-4 border-amber-400 border-y border-r border-white/5 p-6 sm:p-8 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-serif font-semibold text-amber-400 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span>📖</span>
              <span>Holy Scripture</span>
            </span>
            <span className="text-amber-200/80 font-mono text-[11px]">
              {station.scriptureReference}
            </span>
          </div>
          <blockquote className={`font-serif italic text-amber-50 ${scaleClasses.scripture} border-none p-0 m-0`}>
            &ldquo;{station.scripturePassage}&rdquo;
          </blockquote>
        </div>

        {/* Devotional Meditation with Illuminated Initial Drop-Cap */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <span className="text-xs font-serif font-semibold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
              <span>🕯️</span>
              <span>Devotional Meditation (St. Alphonsus Liguori Tradition)</span>
            </span>
          </div>

          <div className={`font-serif text-slate-100 ${scaleClasses.meditation} leading-relaxed`}>
            {/* Illuminated initial drop-cap */}
            <span className={`float-left font-serif font-bold text-amber-400 mr-3 mt-1 leading-none select-none ${scaleClasses.dropCap} drop-shadow-[0_2px_8px_rgba(251,191,36,0.25)]`}>
              {firstLetter}
            </span>
            <p className="inline">
              {remainingMeditation}
            </p>
          </div>
        </div>

        {/* Sacred Prayer & Resolution Sanctuary */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-stone-900 to-slate-950 border border-amber-500/25 p-6 sm:p-7 space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs font-serif font-semibold text-amber-300 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span>🙏</span>
              <span>Prayer &amp; Personal Resolution</span>
            </span>
            <span className="text-[11px] text-slate-400 font-sans">Silent contemplation</span>
          </div>
          <p className={`font-serif italic text-slate-100 ${scaleClasses.prayer}`}>
            {station.prayer}
          </p>
          <div className="pt-2 text-right">
            <span className="text-xs font-serif text-amber-400/90 italic font-semibold">
              Amen.
            </span>
          </div>
        </div>

        {/* Stabat Mater Dolorosa Hymnal Couplet */}
        <div className="rounded-2xl bg-stone-950/70 border border-stone-800 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-xs font-serif font-semibold text-stone-300">
            <span className="flex items-center gap-2">
              <span>𝄞</span>
              <span>Stabat Mater Dolorosa</span>
            </span>
            <span className="text-[11px] text-amber-400/80 font-sans">
              13th-Century Franciscan Sequence (Stanza {station.number})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-serif">
            <div className="space-y-1 p-3 rounded-xl bg-stone-900/50 border border-white/5">
              <span className="text-[11px] text-amber-400 font-sans uppercase tracking-wider block">
                Latin Choral Stanza
              </span>
              <p className={`italic text-amber-200/95 ${scaleClasses.stabat}`}>
                {station.stabatMaterLatin}
              </p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-stone-900/50 border border-white/5">
              <span className="text-[11px] text-slate-400 font-sans uppercase tracking-wider block">
                Poetic English Translation
              </span>
              <p className={`text-slate-200 ${scaleClasses.stabat}`}>
                {station.stabatMaterEnglish}
              </p>
            </div>
          </div>
        </div>

        {/* Faith in Action: Liturgical Virtue & Catholic Social Teaching (CST) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Virtue for School &amp; Life
              </span>
            </div>
            <h5 className="text-base font-serif font-bold text-white">
              {station.virtue}
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Reflect on how Christ models this virtue during His Passion, and how pupils can practice this patience and strength in school, friendships, and family life.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-sky-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🌍</span>
              <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                Catholic Social Teaching (CST)
              </span>
            </div>
            <h5 className="text-base font-serif font-bold text-white">
              {station.cstConnection}
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              The Way of the Cross inspires us to protect the vulnerable, stand with those who are burdened or excluded, and uphold the God-given dignity of every human being.
            </p>
          </div>
        </div>

        {/* Dignified Station Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-amber-500/20">
          <button
            type="button"
            disabled={selectedStationIndex === 0}
            onClick={() => setSelectedStationIndex((i) => Math.max(0, i - 1))}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-serif font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>←</span>
            <span>Previous: Station {selectedStationIndex > 0 ? STATIONS_OF_THE_CROSS[selectedStationIndex - 1].romanNumeral : ''}</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-serif font-semibold text-amber-400">
              Station {station.romanNumeral} ({station.number} of {STATIONS_OF_THE_CROSS.length})
            </span>
          </div>

          <button
            type="button"
            disabled={selectedStationIndex === STATIONS_OF_THE_CROSS.length - 1}
            onClick={() =>
              setSelectedStationIndex((i) =>
                Math.min(STATIONS_OF_THE_CROSS.length - 1, i + 1)
              )
            }
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-serif font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-bold shadow-md"
          >
            <span>Next: Station {selectedStationIndex < STATIONS_OF_THE_CROSS.length - 1 ? STATIONS_OF_THE_CROSS[selectedStationIndex + 1].romanNumeral : ''}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Historical & Theological Catechesis Collapsible Accordion */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400 font-serif">📜</span>
            <span className="text-sm font-serif font-bold text-white">
              History &amp; Theology of the Way of the Cross (Via Crucis)
            </span>
          </div>
          <span className="text-xs text-amber-400 font-medium">
            {showHistory ? 'Hide Catechesis ▲' : 'Read Catechesis ▼'}
          </span>
        </button>

        {showHistory && (
          <div className="p-6 pt-0 border-t border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed mt-4">
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <h5 className="font-serif font-bold text-amber-300">Via Dolorosa Pilgrimage Origins</h5>
                <p>{STATIONS_HISTORY_AND_THEOLOGY.historicalOrigins}</p>
              </div>
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <h5 className="font-serif font-bold text-amber-300">The 14 Traditional Stations</h5>
                <p>{STATIONS_HISTORY_AND_THEOLOGY.traditionalNumber}</p>
              </div>
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <h5 className="font-serif font-bold text-amber-300">Scriptural &amp; Traditional Stations</h5>
                <p>{STATIONS_HISTORY_AND_THEOLOGY.scripturalAndTraditionalStations}</p>
              </div>
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <h5 className="font-serif font-bold text-amber-300">Plenary Indulgence &amp; Spiritual Fruit</h5>
                <p>{STATIONS_HISTORY_AND_THEOLOGY.plenaryIndulgence}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
