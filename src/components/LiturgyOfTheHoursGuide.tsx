// src/components/LiturgyOfTheHoursGuide.tsx
// St Joseph's Catholic Life & Faith Sanctuary
// Complete Catechetical & Interactive Guide: The Liturgy of the Hours (Liturgia Horarum / Divine Office)

import React, { useState, useEffect } from 'react';
import {
  CANONICAL_HOURS,
  MARIAN_ANTIPHONS,
  FOUR_WEEK_PSALTER_EXPLANATION,
  BREVIARY_FAQS,
  getCurrentCanonicalHour,
  CanonicalHour,
  MarianAntiphon,
} from '../data/catholic/liturgyOfTheHoursData';
import { speakInLanguage, cancelSpeech } from '../engine/translationService';
import { Link } from 'react-router-dom';
import AstVectorMediaPlayer from './AstVectorMediaPlayer';
import { playSuccessChime, triggerHapticSuccess } from '../services/soundHaptics';

export default function LiturgyOfTheHoursGuide(): React.JSX.Element {
  const [selectedHourId, setSelectedHourId] = useState<string>(() => {
    return getCurrentCanonicalHour().id;
  });
  const [showLatin, setShowLatin] = useState<boolean>(false);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const [selectedAntiphonId, setSelectedAntiphonId] = useState<string>('salve-regina');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const activeHour: CanonicalHour =
    CANONICAL_HOURS.find((h) => h.id === selectedHourId) || CANONICAL_HOURS[1];

  const liveCurrentHour = getCurrentCanonicalHour(currentTime);

  const selectedAntiphon: MarianAntiphon =
    MARIAN_ANTIPHONS.find((a) => a.id === selectedAntiphonId) || MARIAN_ANTIPHONS[0];

  const handleSpeakHour = () => {
    if (isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = `${activeHour.name}. ${activeHour.latinName}. Traditional time: ${activeHour.traditionalTime}. Theme: ${activeHour.theologicalTheme}. Sample Psalm: ${activeHour.samplePsalm.title}. Antiphon: ${activeHour.samplePsalm.englishAntiphon}. ${activeHour.samplePsalm.englishExcerpt}. Closing prayer: ${activeHour.closingCollect.english}`;
    setIsSpeaking(true);
    speakInLanguage(textToSpeak, 'en');
  };

  const handleQuizOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const checkQuiz = () => {
    setQuizSubmitted(true);
    playSuccessChime();
    triggerHapticSuccess();
  };

  return (
    <div className="space-y-8">
      {/* Devotional Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-1">
              <span>Liturgia Horarum</span>
              <span aria-hidden="true">·</span>
              <span>The Divine Office</span>
              <span aria-hidden="true">·</span>
              <span>Sanctification of Time</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              The Liturgy of the Hours
            </h2>
            <p className="text-sm text-slate-300 mt-1 italic font-serif">
              &ldquo;Seven times a day I praise You for Your righteous laws.&rdquo; — Psalm 119:164
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedHourId(liveCurrentHour.id)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Current Hour: {liveCurrentHour.name}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLatin(!showLatin)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                showLatin
                  ? 'bg-indigo-500 text-slate-950 border-indigo-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {showLatin ? 'Latin / English' : 'Show Latin'}
            </button>
            <button
              type="button"
              onClick={() => setShowPlayer(!showPlayer)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-colors flex items-center gap-1.5"
            >
              <span>{showPlayer ? '▲ Hide Simulation' : '🎮 Vector Simulation'}</span>
            </button>
            <Link
              to="/media-player?preset=liturgy-of-the-hours"
              className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>📺 Full Player</span>
            </Link>
          </div>
        </div>

        {/* Embedded AST Vector Media Player for Divine Office */}
        {showPlayer && (
          <div className="mt-5 rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-950 shadow-2xl relative">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-serif font-semibold text-indigo-300">
                <span>🕰️</span>
                <span>AST Vector Interactive Engine: Liturgia Horarum &amp; Celestial Clock</span>
              </span>
              <span className="text-[11px] text-indigo-400/80 font-mono">Cartridge: liturgy-of-the-hours.ast</span>
            </div>
            <AstVectorMediaPlayer
              preset="liturgy-of-the-hours"
              height="clamp(240px, 45vw + 40px, 420px)"
              allowPresetSwitch={false}
              embedded={true}
            />
          </div>
        )}

        {/* Live Clock & Liturgical Sanctuary Banner */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="text-xl">{liveCurrentHour.icon}</span>
            <div>
              <div className="font-semibold text-white">
                Live Clock: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-slate-400">
                The Church throughout the world is currently offering{' '}
                <span className="text-indigo-300 font-medium">{liveCurrentHour.name}</span> ({liveCurrentHour.latinName}).
              </div>
            </div>
          </div>
          <div className="text-slate-400 text-[11px] font-sans">
            Consecrating day & night · Sacrosanctum Concilium #83
          </div>
        </div>
      </div>

      {/* 7 Canonical Hours Filter Bar */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase block">
          Select Canonical Hour of the Divine Office
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 p-1.5 rounded-xl bg-slate-900 border border-white/10">
          {CANONICAL_HOURS.map((hour) => {
            const isSelected = hour.id === selectedHourId;
            const isNow = hour.id === liveCurrentHour.id;
            return (
              <button
                key={hour.id}
                type="button"
                onClick={() => setSelectedHourId(hour.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-medium transition-all relative ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 font-semibold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isNow && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                <span className="text-base mb-1">{hour.icon}</span>
                <span className="truncate w-full text-center">{hour.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 truncate">{hour.traditionalTime.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Canonical Hour Detail Plaque */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
              <span>{activeHour.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeHour.latinName}</span>
              <span aria-hidden="true">·</span>
              <span>{activeHour.traditionalTime}</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
              <span>{activeHour.icon}</span>
              <span>{activeHour.name}</span>
            </h3>
            <p className="text-xs text-slate-400 italic mt-1 font-serif">
              {activeHour.scripturalBiblicalEcho}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSpeakHour}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 self-start ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <span>{isSpeaking ? '⏹ Stop Audio' : '🔊 Listen to Hour'}</span>
          </button>
        </div>

        {/* Theological Purpose */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
          <h4 className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
            Spiritual & Theological Purpose
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {activeHour.theologicalTheme}
          </p>
        </div>

        {/* Liturgical Structure Steps */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Order of Prayer (Liturgical Structure)
          </h4>
          <div className="space-y-1.5">
            {activeHour.structure.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 text-xs text-slate-300 font-sans flex items-start gap-2"
              >
                <span className="text-indigo-400 font-bold font-mono text-[11px] shrink-0">
                  {idx + 1}.
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gospel Canticle (Benedictus, Magnificat, or Nunc Dimittis if present) */}
        {activeHour.gospelCanticle && (
          <div className="p-5 rounded-xl bg-gradient-to-br from-amber-950/30 to-slate-950 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase block">
                  Evangelical Gospel Canticle (Canticum Evangelicum)
                </span>
                <h5 className="text-base font-serif font-bold text-white">
                  {activeHour.gospelCanticle.title}
                </h5>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {activeHour.gospelCanticle.scriptureCitation} · {activeHour.gospelCanticle.canticleAuthor}
              </div>
            </div>

            <div className="text-xs text-amber-300/80 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <span>✝️</span>
              <span>
                <strong>Liturgical Rule:</strong> All stand and make the solemn Sign of the Cross at the first words of the Gospel Canticle to honor Christ speaking directly in His Gospel.
              </span>
            </div>

            {showLatin ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif leading-relaxed">
                <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
                  <span className="text-[10px] text-amber-400 font-sans font-bold uppercase tracking-wider block mb-1">
                    Latin Text (Vulgata)
                  </span>
                  <p className="text-amber-100/90 italic">{activeHour.gospelCanticle.latinText}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block mb-1">
                    English Translation
                  </span>
                  <p className="text-slate-200">{activeHour.gospelCanticle.englishText}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-serif italic text-slate-200 leading-relaxed p-3 rounded-lg bg-slate-900/40 border border-white/5">
                &ldquo;{activeHour.gospelCanticle.englishText}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Sample Psalm & Antiphon */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Sample Psalmody · {activeHour.samplePsalm.number}</span>
            <span className="text-slate-400 font-normal">{activeHour.samplePsalm.title}</span>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
              Antiphon
            </span>
            <p className="font-serif italic text-indigo-200">
              {showLatin ? activeHour.samplePsalm.latinAntiphon : activeHour.samplePsalm.englishAntiphon}
            </p>
          </div>

          <p className="text-xs sm:text-sm font-serif italic text-slate-200 leading-relaxed pl-3 border-l-2 border-indigo-500/50">
            {showLatin ? activeHour.samplePsalm.latinExcerpt : activeHour.samplePsalm.englishExcerpt}
          </p>
        </div>

        {/* Closing Collect */}
        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1.5">
          <span className="text-[11px] font-semibold text-amber-300 tracking-wider uppercase block">
            Concluding Collect (Oratio Conclusiva)
          </span>
          <p className="text-xs sm:text-sm font-serif italic text-slate-300 leading-relaxed">
            {showLatin ? activeHour.closingCollect.latin : activeHour.closingCollect.english}
          </p>
        </div>
      </div>

      {/* The 4 Seasonal Marian Antiphons for Compline */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <div className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-1">
            Night Prayer Marian Hymns
          </div>
          <h3 className="text-xl font-serif font-bold text-white">
            The 4 Seasonal Marian Antiphons of Compline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Sung at the end of Compline (Night Prayer) before sleep, following the liturgical calendar.
          </p>
        </div>

        {/* Antiphon Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {MARIAN_ANTIPHONS.map((ant) => (
            <button
              key={ant.id}
              type="button"
              onClick={() => setSelectedAntiphonId(ant.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedAntiphonId === ant.id
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {ant.name.split(' ')[0]} {ant.name.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Active Antiphon Box */}
        <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="font-serif font-bold text-white text-sm">{selectedAntiphon.name}</span>
            <span className="text-purple-300 font-sans">{selectedAntiphon.season}</span>
          </div>
          <p className="text-xs text-slate-400 italic font-sans">{selectedAntiphon.spiritualMeaning}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-serif leading-relaxed">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 text-purple-200 italic">
              <span className="text-[10px] text-purple-400 font-sans font-bold uppercase tracking-wider block mb-1">
                Latin Text
              </span>
              {selectedAntiphon.latinText}
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 text-slate-200">
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block mb-1">
                English Translation
              </span>
              {selectedAntiphon.englishText}
            </div>
          </div>
        </div>
      </div>

      {/* The 4-Week Psalter & Structure of the Breviary */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase mb-1">
            Psalter Architecture
          </div>
          <h3 className="text-xl font-serif font-bold text-white">
            {FOUR_WEEK_PSALTER_EXPLANATION.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
            {FOUR_WEEK_PSALTER_EXPLANATION.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {FOUR_WEEK_PSALTER_EXPLANATION.structureRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-slate-300 font-sans flex items-start gap-2"
            >
              <span className="text-amber-400 font-bold shrink-0">✦</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vatican II & Practical FAQs */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
          <span>📖</span>
          <span>Frequently Asked Questions & Church Guidance</span>
        </h3>
        <div className="space-y-3">
          {BREVIARY_FAQS.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-1.5 text-xs">
              <h5 className="font-semibold text-indigo-300 text-sm">{faq.question}</h5>
              <p className="text-slate-300 leading-relaxed font-sans">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formative Interactive Mini-Quiz */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase block">
              Test Your Understanding
            </span>
            <h3 className="text-lg font-serif font-bold text-white">
              Liturgy of the Hours Quick Quiz
            </h3>
          </div>
          {quizSubmitted && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
              Quiz Evaluated!
            </span>
          )}
        </div>

        <div className="space-y-4 text-xs">
          {/* Question 1 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <p className="font-semibold text-slate-200">
              1. What Gospel Canticle is prayed every morning at Lauds (Morning Prayer)?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['The Benedictus (Canticle of Zechariah)', 'The Magnificat (Canticle of Mary)', 'The Nunc Dimittis (Canticle of Simeon)'].map(
                (opt, oIdx) => {
                  const selected = quizAnswers[0] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleQuizOption(0, oIdx)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-400 font-semibold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                }
              )}
            </div>
            {quizSubmitted && (
              <p className="text-[11px] text-emerald-400 pt-1">
                ✓ Correct: The Benedictus is sung every morning to greet Christ, the Orient from on high!
              </p>
            )}
          </div>

          {/* Question 2 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <p className="font-semibold text-slate-200">
              2. Can pupils and Catholic lay people pray the Liturgy of the Hours?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Yes, Vatican II strongly encourages the laity to pray the Hours individually or together as the voice of the Church',
                'No, it is strictly forbidden for anyone except consecrated monks under perpetual vows',
              ].map((opt, oIdx) => {
                const selected = quizAnswers[1] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleQuizOption(1, oIdx)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-400 font-semibold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <p className="text-[11px] text-emerald-400 pt-1">
                ✓ Correct: Sacrosanctum Concilium #100 invites all the faithful to pray the Divine Office!
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={checkQuiz}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            >
              Submit & Check Answers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
