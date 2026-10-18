// src/components/StationsOfTheCrossGuide.tsx
// St Joseph's Catholic Life & Faith Sanctuary
// Complete Catechetical & Liturgical Guide: The Stations of the Cross (Via Crucis)

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

export default function StationsOfTheCrossGuide(): React.JSX.Element {
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(0);
  const [showPlayer, setShowPlayer] = useState<boolean>(true);
  const [showLatin, setShowLatin] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [stationsTouchLock, setStationsTouchLock] = useState<boolean>(true);
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
    const textToSpeak = `${station.romanNumeral}. ${station.title}. ${station.scripturePassage}. Meditation: ${station.meditation}. Prayer: ${station.prayer}`;
    setIsSpeaking(true);
    speakInLanguage(textToSpeak, 'en');
  };

  const isCompleted = completedStations.includes(station.number);

  return (
    <div className="space-y-8">
      {/* Devotional Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950/40 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-1">
              <span>Sacred Passion</span>
              <span aria-hidden="true">·</span>
              <span>Via Dolorosa</span>
              <span aria-hidden="true">·</span>
              <span>14 Traditional Stations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              The Stations of the Cross (Via Crucis)
            </h2>
            <p className="text-sm text-slate-300 mt-1 italic font-serif">
              &ldquo;Adoramus te, Christe, et benedicimus tibi: Quia per sanctam crucem tuam redemisti mundum.&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPlayer(!showPlayer)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-2"
            >
              <span>{showPlayer ? 'Hide Simulation' : 'Launch Simulation'}</span>
              <span>✝️</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLatin(!showLatin)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                showLatin
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {showLatin ? 'Latin / English' : 'Show Latin'}
            </button>
          </div>
        </div>

        {/* Traditional Opening Versicle Plaque */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
          <div className="text-xs text-amber-300/90 font-medium">
            <span className="font-bold">Leader:</span>{' '}
            {showLatin ? OPENING_DEVOTIONAL_VERSICLE.leaderLatin : OPENING_DEVOTIONAL_VERSICLE.leaderEnglish}
          </div>
          <div className="text-xs text-slate-200">
            <span className="font-bold">All:</span>{' '}
            {showLatin ? OPENING_DEVOTIONAL_VERSICLE.responseLatin : OPENING_DEVOTIONAL_VERSICLE.responseEnglish}
          </div>
        </div>
      </div>

      {/* Embedded AST Vector Media Player for Stations of the Cross */}
      {showPlayer && (
        <div className="rounded-2xl border border-amber-500/30 overflow-hidden bg-slate-950 shadow-2xl max-w-full">
          <div className="px-4 py-2 bg-slate-900 border-b border-white/10 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>AST Simulation: stations-of-the-cross</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStationsTouchLock((prev) => !prev)}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold hover:bg-slate-700 sm:hidden"
              >
                {stationsTouchLock ? '🔒 Page Scroll Safe' : '👆 Touch Active'}
              </button>
              <span className="text-slate-400 hidden sm:inline">Touch Draggable Cross · 60 FPS</span>
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%', pointerEvents: stationsTouchLock ? 'none' : 'auto' }}>
            <AstVectorMediaPlayer
              preset="stations-of-the-cross"
              height="clamp(210px, 45vw + 40px, 380px)"
              allowPresetSwitch={false}
              embedded={true}
              bslEnabled={false}
            />
            {stationsTouchLock && (
              <div
                onClick={() => setStationsTouchLock(false)}
                className="sm:hidden absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur border border-amber-400/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg cursor-pointer flex items-center gap-1.5 pointer-events-auto"
                title="Tap to enable interactive drag and click"
              >
                <span>👆 Tap to Interact / Drag</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Station Navigation Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Select Station of the Cross
          </span>
          <span className="text-xs text-amber-300/80 font-medium">
            Completed: {completedStations.length} of {STATIONS_OF_THE_CROSS.length}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5 p-2 rounded-xl bg-slate-900 border border-white/10">
          {STATIONS_OF_THE_CROSS.map((st, idx) => {
            const active = idx === selectedStationIndex;
            const done = completedStations.includes(st.number);
            return (
              <button
                key={st.number}
                type="button"
                onClick={() => setSelectedStationIndex(idx)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-serif font-bold transition-all ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : done
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/80'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={`${st.romanNumeral}: ${st.title}`}
              >
                <span>{st.romanNumeral}</span>
                {done && <span className="text-[9px] text-emerald-400 leading-none">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Station Detailed Devotional Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <span>Station {station.romanNumeral}</span>
              <span aria-hidden="true">·</span>
              <span>{station.latinTitle}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {station.title}
            </h3>
            <p className="text-xs text-slate-400 italic mt-0.5">
              {station.spanishTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={handleSpeakMeditation}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <span>{isSpeaking ? '⏹ Stop Audio' : '🔊 Listen'}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleStationCompleted(station.number)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <span>{isCompleted ? '✓ Completed' : 'Mark Prayed'}</span>
            </button>
          </div>
        </div>

        {/* Sacred Scripture Passage */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
          <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
            Holy Scripture · {station.scriptureReference}
          </div>
          <p className="text-sm sm:text-base font-serif italic text-slate-200 leading-relaxed">
            &ldquo;{station.scripturePassage}&rdquo;
          </p>
        </div>

        {/* Theological Meditation */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Devotional Meditation (St. Alphonsus Liguori Tradition)
          </h4>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
            {station.meditation}
          </p>
        </div>

        {/* Prayer / Resolution */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
          <div className="text-xs font-semibold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
            <span>🙏</span>
            <span>Prayer & Resolution</span>
          </div>
          <p className="text-sm text-slate-200 font-serif italic leading-relaxed">
            {station.prayer}
          </p>
        </div>

        {/* Stabat Mater Dolorosa Verse */}
        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-700/50 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-serif font-semibold text-stone-300">
            <span>Stabat Mater Dolorosa</span>
            <span className="text-[11px] text-stone-400 font-sans">Hymn to Mary at the Cross</span>
          </div>
          <p className="text-xs font-serif italic text-amber-200/90 leading-relaxed">
            {station.stabatMaterLatin}
          </p>
          <p className="text-xs text-slate-300 font-serif leading-relaxed">
            {station.stabatMaterEnglish}
          </p>
        </div>

        {/* Virtues and CST Connections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Liturgical Virtue
            </span>
            <span className="text-xs font-medium text-amber-300">
              {station.virtue}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Catholic Social Teaching (CST)
            </span>
            <span className="text-xs font-medium text-sky-300">
              {station.cstConnection}
            </span>
          </div>
        </div>

        {/* Bottom Station Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={selectedStationIndex === 0}
            onClick={() => setSelectedStationIndex((i) => Math.max(0, i - 1))}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous Station
          </button>
          <span className="text-xs text-slate-400">
            Station {station.number} of {STATIONS_OF_THE_CROSS.length}
          </span>
          <button
            type="button"
            disabled={selectedStationIndex === STATIONS_OF_THE_CROSS.length - 1}
            onClick={() =>
              setSelectedStationIndex((i) =>
                Math.min(STATIONS_OF_THE_CROSS.length - 1, i + 1)
              )
            }
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next Station →
          </button>
        </div>
      </div>

      {/* Historical & Theological Catechesis Accordion */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <span>📜</span>
          <span>History & Theology of the Way of the Cross</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/50 border border-white/5">
            <h5 className="font-semibold text-amber-300">Via Dolorosa Pilgrimage Origins</h5>
            <p>{STATIONS_HISTORY_AND_THEOLOGY.historicalOrigins}</p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/50 border border-white/5">
            <h5 className="font-semibold text-amber-300">The 14 Traditional Stations</h5>
            <p>{STATIONS_HISTORY_AND_THEOLOGY.traditionalNumber}</p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/50 border border-white/5">
            <h5 className="font-semibold text-amber-300">Scriptural & Traditional Stations</h5>
            <p>{STATIONS_HISTORY_AND_THEOLOGY.scripturalAndTraditionalStations}</p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/50 border border-white/5">
            <h5 className="font-semibold text-amber-300">Plenary Indulgence & Spiritual Fruit</h5>
            <p>{STATIONS_HISTORY_AND_THEOLOGY.plenaryIndulgence}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
