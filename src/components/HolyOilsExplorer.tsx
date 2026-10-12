// src/components/HolyOilsExplorer.tsx
/**
 * The Three Holy Oils (Olea Sancta) & Sacred Ambry Explorer
 * 
 * Interactive pedagogical module for St Joseph's Curriculum Portal.
 * Explores:
 *  - Sacred Chrism (Sanctum Chrisma • S.C.)
 *  - Oil of Catechumens (Oleum Catechumenorum • O.C.)
 *  - Oil of the Sick (Oleum Infirmorum • O.I.)
 *  - The Holy Ambry (Ambriarium Sacrum)
 *  - Priestly Pocket Oil Stocks (Chrismarium)
 *  - The Chrism Mass, Bishop's Insufflatio, and Annual Holy Week Rites
 */

import React, { useState } from 'react';
import {
  HOLY_OILS,
  HOLY_AMBRY_INFO,
  HOLY_OILS_QUIZ,
  HolyOil
} from '../data/catholic/holyOilsData';

export const HolyOilsExplorer: React.FC = () => {
  const [selectedOilId, setSelectedOilId] = useState<'SC' | 'OC' | 'OI'>('SC');
  const [activeTab, setActiveTab] = useState<'ambry' | 'sacraments' | 'stocks' | 'chrismMass' | 'quiz'>('ambry');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [scoreRevealed, setScoreRevealed] = useState(false);

  const selectedOil = HOLY_OILS.find((o) => o.id === selectedOilId) || HOLY_OILS[0];

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setShowExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  const calculateScore = () => {
    let correct = 0;
    HOLY_OILS_QUIZ.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio fallback
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-500/30">
            <span>🏺</span> Olea Sancta • Liturgical Sacred Treasures
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-100 tracking-wide">
            The Three Holy Oils & The Sacred Ambry
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            From the fragrant balsamic seal of <span className="text-amber-300 font-semibold">Sacred Chrism</span> to the comforting balm of the <span className="text-sky-300 font-semibold">Oil of the Sick</span> and the spiritual armor of the <span className="text-emerald-300 font-semibold">Oil of Catechumens</span>, discover how the Catholic Church consecrates every milestone of human life through holy anointing.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700/60 pb-3">
        {[
          { id: 'ambry', label: '🏺 The Holy Ambry & 3 Oils', icon: '🏛️' },
          { id: 'sacraments', label: '✝️ The Sacramental Journey', icon: '✨' },
          { id: 'stocks', label: '⚱️ Pocket Oil Stocks (Stocks)', icon: '💼' },
          { id: 'chrismMass', label: '🕊️ Holy Week Chrism Mass', icon: '🌿' },
          { id: 'quiz', label: '📝 Sacristan & Liturgy Quiz', icon: '🎓' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: THE HOLY AMBRY & INTERACTIVE THREE OILS */}
      {activeTab === 'ambry' && (
        <div className="space-y-8">
          {/* Interactive SVG Stage: The Sanctuary Ambry */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-2">
              <div>
                <h3 className="text-xl font-serif font-bold text-amber-200">
                  Ambriarium Sacrum • The Sanctuary Oil Ambry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any of the three sacred ampullae below to inspect its liturgical matter, fragrance, and sacramental power.
                </p>
              </div>
              <div className="text-xs text-amber-400/90 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/20 self-start sm:self-auto">
                Inscribed: <strong>OLEA SANCTA</strong>
              </div>
            </div>

            {/* SVG Visual Stage */}
            <div className="relative mx-auto max-w-3xl aspect-[16/9] bg-gradient-to-b from-stone-950 via-slate-900 to-stone-950 rounded-xl overflow-hidden border border-amber-900/40 shadow-inner flex items-center justify-center p-4">
              <svg viewBox="0 0 800 450" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Subtle stone texture pattern */}
                  <linearGradient id="marbleWall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#292524" />
                    <stop offset="50%" stopColor="#1c1917" />
                    <stop offset="100%" stopColor="#0c0a09" />
                  </linearGradient>

                  <linearGradient id="goldArch" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>

                  <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="25%" stopColor="rgba(255,255,255,0.02)" />
                    <stop offset="80%" stopColor="rgba(255,255,255,0.08)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                  </linearGradient>

                  <filter id="sacredGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Stone Niche Background */}
                <rect x="120" y="30" width="560" height="380" rx="16" fill="url(#marbleWall)" stroke="#78350f" strokeWidth="4" />
                <path d="M 120 130 C 120 50, 680 50, 680 130 L 680 410 L 120 410 Z" fill="#141210" stroke="#b45309" strokeWidth="2" opacity="0.9" />

                {/* Classical Arch Ornamentation */}
                <path d="M 140 140 C 140 70, 660 70, 660 140" fill="none" stroke="url(#goldArch)" strokeWidth="6" />
                <text x="400" y="90" fill="#fef3c7" fontSize="22" fontFamily="serif" textAnchor="middle" fontWeight="bold" letterSpacing="4">
                  OLEA SANCTA
                </text>
                <text x="400" y="112" fill="#d97706" fontSize="11" fontFamily="serif" textAnchor="middle" letterSpacing="2">
                  AMBRIARIUM ECCLESIAE
                </text>

                {/* Velvet Interior Backing */}
                <rect x="160" y="130" width="480" height="250" rx="8" fill="#310b14" opacity="0.85" stroke="#7f1d1d" strokeWidth="1" />

                {/* White Marble Shelf */}
                <rect x="145" y="365" width="510" height="20" rx="3" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="1" />
                <rect x="140" y="385" width="520" height="10" fill="#78716c" opacity="0.6" />

                {/* VESSEL 1: O.I. (Oleum Infirmorum - Oil of the Sick) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => { setSelectedOilId('OI'); playChime(); }}
                  transform="translate(230, 160)"
                >
                  {/* Glow if selected */}
                  {selectedOilId === 'OI' && (
                    <circle cx="45" cy="110" r="75" fill="#38bdf8" opacity="0.25" filter="url(#sacredGlow)" />
                  )}
                  {/* Silver / Crystal Ampulla Body */}
                  <ellipse cx="45" cy="140" rx="38" ry="46" fill="#0284c7" opacity="0.4" />
                  <ellipse cx="45" cy="140" rx="34" ry="42" fill="#38bdf8" opacity="0.6" />
                  {/* Crystal contours */}
                  <path d="M 20 130 C 20 90, 70 90, 70 130 C 70 175, 20 175, 20 130 Z" fill="none" stroke="#e0f2fe" strokeWidth="2.5" opacity="0.8" />
                  {/* Ampulla Neck & Stopper */}
                  <rect x="36" y="70" width="18" height="30" rx="3" fill="#94a3b8" stroke="#f8fafc" strokeWidth="1.5" />
                  <ellipse cx="45" cy="68" rx="14" ry="7" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1.5" />
                  <path d="M 45 42 L 45 68" stroke="#cbd5e1" strokeWidth="4" />
                  <circle cx="45" cy="40" r="9" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="1.5" />
                  {/* Silver Plaque Inscription */}
                  <rect x="22" y="125" width="46" height="26" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="45" y="143" fill="#38bdf8" fontSize="16" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                    O.I.
                  </text>
                  <text x="45" y="196" fill="#7dd3fc" fontSize="12" fontFamily="serif" textAnchor="middle" fontWeight="600">
                    Oleum Infirmorum
                  </text>
                  <text x="45" y="210" fill="#bae6fd" fontSize="9" textAnchor="middle" opacity="0.8">
                    [For the Sick]
                  </text>
                </g>

                {/* VESSEL 2: S.C. (Sanctum Chrisma - Sacred Chrism) [CENTER - PROMINENT] */}
                <g
                  className="cursor-pointer group"
                  onClick={() => { setSelectedOilId('SC'); playChime(); }}
                  transform="translate(355, 140)"
                >
                  {/* Glow if selected */}
                  {selectedOilId === 'SC' && (
                    <circle cx="45" cy="120" r="85" fill="#f59e0b" opacity="0.35" filter="url(#sacredGlow)" />
                  )}
                  {/* Balsamic Amber Liquid */}
                  <ellipse cx="45" cy="155" rx="44" ry="52" fill="#b45309" opacity="0.5" />
                  <ellipse cx="45" cy="155" rx="40" ry="48" fill="#fbbf24" opacity="0.65" />
                  {/* Crystal / Gold Ornate Fluting */}
                  <path d="M 16 145 C 16 100, 74 100, 74 145 C 74 195, 16 195, 16 145 Z" fill="none" stroke="#fef3c7" strokeWidth="3" opacity="0.9" />
                  {/* Rich Gilded Neck & Stopper with Cross */}
                  <rect x="34" y="80" width="22" height="34" rx="4" fill="#d97706" stroke="#fef08a" strokeWidth="2" />
                  <ellipse cx="45" cy="78" rx="16" ry="8" fill="#f59e0b" stroke="#fef08a" strokeWidth="2" />
                  {/* Golden Cross Stopper Finial */}
                  <path d="M 45 42 L 45 78 M 36 54 L 54 54" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
                  {/* Golden Inscription Plaque */}
                  <rect x="18" y="140" width="54" height="28" rx="5" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
                  <text x="45" y="160" fill="#fef08a" fontSize="18" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                    S.C.
                  </text>
                  <text x="45" y="216" fill="#fcd34d" fontSize="13" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                    Sanctum Chrisma
                  </text>
                  <text x="45" y="230" fill="#fde68a" fontSize="10" textAnchor="middle" opacity="0.9">
                    [Sacred Chrism • Balsam]
                  </text>
                </g>

                {/* VESSEL 3: O.C. (Oleum Catechumenorum - Oil of Catechumens) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => { setSelectedOilId('OC'); playChime(); }}
                  transform="translate(480, 160)"
                >
                  {/* Glow if selected */}
                  {selectedOilId === 'OC' && (
                    <circle cx="45" cy="110" r="75" fill="#10b981" opacity="0.25" filter="url(#sacredGlow)" />
                  )}
                  {/* Emerald / Golden Olive Oil */}
                  <ellipse cx="45" cy="140" rx="38" ry="46" fill="#047857" opacity="0.4" />
                  <ellipse cx="45" cy="140" rx="34" ry="42" fill="#34d399" opacity="0.6" />
                  {/* Crystal contours */}
                  <path d="M 20 130 C 20 90, 70 90, 70 130 C 70 175, 20 175, 20 130 Z" fill="none" stroke="#d1fae5" strokeWidth="2.5" opacity="0.8" />
                  {/* Ampulla Neck & Stopper */}
                  <rect x="36" y="70" width="18" height="30" rx="3" fill="#94a3b8" stroke="#f8fafc" strokeWidth="1.5" />
                  <ellipse cx="45" cy="68" rx="14" ry="7" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1.5" />
                  <path d="M 45 42 L 45 68" stroke="#cbd5e1" strokeWidth="4" />
                  <circle cx="45" cy="40" r="9" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="1.5" />
                  {/* Silver Plaque Inscription */}
                  <rect x="22" y="125" width="46" height="26" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
                  <text x="45" y="143" fill="#6ee7b7" fontSize="16" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                    O.C.
                  </text>
                  <text x="45" y="196" fill="#6ee7b7" fontSize="12" fontFamily="serif" textAnchor="middle" fontWeight="600">
                    Oleum Catechumenorum
                  </text>
                  <text x="45" y="210" fill="#a7f3d0" fontSize="9" textAnchor="middle" opacity="0.8">
                    [For Catechumens]
                  </text>
                </g>

                {/* Glazing / Glass Pane Refraction */}
                <rect x="135" y="45" width="530" height="355" fill="url(#glassReflection)" pointerEvents="none" />

                {/* Ambry Brass Latches & Hinges */}
                <circle cx="135" cy="80" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                <circle cx="135" cy="380" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                <rect x="655" y="215" width="8" height="24" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
              </svg>
            </div>

            {/* Quick Switcher Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              {HOLY_OILS.map((oil) => (
                <button
                  key={oil.id}
                  onClick={() => { setSelectedOilId(oil.id); playChime(); }}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    selectedOilId === oil.id
                      ? `${oil.borderClass} ${oil.bgLightClass} ring-2 ring-amber-400/40 shadow-lg`
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold font-serif">{oil.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${oil.badgeClass}`}>
                      {oil.traditionalInitials}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">{oil.name}</div>
                  <div className="text-xs text-slate-400 italic font-serif">{oil.latinName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Deep Catechetical Dossier of the Selected Holy Oil */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedOil.vesselSymbol}</span>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {selectedOil.name} ({selectedOil.traditionalInitials})
                    </h3>
                    <p className="text-sm text-amber-300 italic font-serif">
                      {selectedOil.latinName} • {selectedOil.consecrationType}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedOil.catechismRefs.map((ref) => (
                  <span key={ref} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
                    {ref}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Left Column: Physical Matter & Consecration */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    🌿 Matter & Fragrance (Substance)
                  </h4>
                  <p className="text-sm text-slate-200">{selectedOil.composition}</p>
                  <p className="text-xs text-slate-400 mt-2 italic">{selectedOil.fragrance}</p>
                  {selectedOil.hasBalsam && (
                    <div className="mt-2 text-xs bg-amber-950/40 text-amber-300 border border-amber-500/30 p-2 rounded-lg">
                      ✨ <strong>Sweet Balsam (*Balsamum*):</strong> Symbolizes the aroma of Christ and the incorruptibility of divine grace.
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    🕊️ Consecration Rite & Bishop’s Insufflatio
                  </h4>
                  <p className="text-sm text-slate-200">{selectedOil.consecrationRite}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    📜 Sacred Liturgical Words (Form)
                  </h4>
                  <p className="text-sm font-serif italic text-amber-200 bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                    {selectedOil.liturgicalForm}
                  </p>
                </div>
              </div>

              {/* Right Column: Sacraments, Anatomy & Meaning */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    ✝️ Sacraments in Which It Is Anointed
                  </h4>
                  <ul className="space-y-1.5 mt-2">
                    {selectedOil.primarySacraments.map((sac) => (
                      <li key={sac} className="text-sm text-slate-200 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{sac}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    👤 Where on the Body or Church It Is Applied
                  </h4>
                  <ul className="space-y-1.5 mt-2">
                    {selectedOil.anointingLocations.map((loc) => (
                      <li key={loc} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400">📍</span>
                        <span>{loc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    📖 Spiritual Meaning & Biblical Roots
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{selectedOil.spiritualMeaning}</p>
                  <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">{selectedOil.biblicalTypology}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedOil.scriptureReferences.map((scr) => (
                      <span key={scr} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {scr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE SACRAMENTAL JOURNEY (CHRONOLOGICAL LIFESPAN) */}
      {activeTab === 'sacraments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-amber-200">
              The Lifespan of a Catholic: Anointed From Cradle to Eternity
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Anointing with holy oil marks every watershed moment of the Christian soul. Follow the chronological path of grace from pre-baptismal exorcism to the final commendation of the dying.
            </p>
          </div>

          <div className="relative border-l-2 border-amber-500/40 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
            {[
              {
                step: '1. The Pre-Baptismal Armor',
                oil: 'Oil of Catechumens (O.C.)',
                location: 'Breast / Chest',
                icon: '🛡️',
                badge: 'Catechumenate / Baptism',
                meaning: 'Before the water of baptism is poured, the priest or deacon anoints the chest with the Oil of Catechumens after the Prayer of Exorcism. Just as Roman gladiators coated their muscles with oil so foes could not grip them, the catechumen is spiritually armored against Satan and worldly temptation.'
              },
              {
                step: '2. The Royal Post-Baptismal Consecration',
                oil: 'Sacred Chrism (S.C.)',
                location: 'Crown of the Head',
                icon: '👑',
                badge: 'Sacrament of Baptism',
                meaning: 'Immediately after being cleansed in the baptismal font, the infant or adult is anointed on the vertex of the head with sweet Sacred Chrism. This incorporates the soul into Christ the Anointed One as Priest, Prophet, and King, clothed in radiant white.'
              },
              {
                step: '3. The Seal of the Holy Spirit',
                oil: 'Sacred Chrism (S.C.)',
                location: 'Forehead with Sign of the Cross',
                icon: '🕊️',
                badge: 'Sacrament of Confirmation',
                meaning: 'The Diocesan Bishop (or priest) lays hands and traces the Sign of the Cross on the candidate’s forehead with fragrant Chrism: "Be sealed with the Gift of the Holy Spirit." This leaves an indelible spiritual mark (character indelibilis) equipping the mature Christian to be a soldier and public witness for Christ.'
              },
              {
                step: '4. The Consecration of Priestly Hands',
                oil: 'Sacred Chrism (S.C.)',
                location: 'Priest’s Palms & Bishop’s Head',
                icon: '🙌',
                badge: 'Sacrament of Holy Orders',
                meaning: 'During the ordination rite, the Bishop pours Chrism onto the palms of the newly ordained priest, tying them in a white linen cloth (maniturgium). The priest’s hands are consecrated to hold the Blessed Sacrament and absolve sins in persona Christi.'
              },
              {
                step: '5. Healing, Forgiveness & Comfort',
                oil: 'Oil of the Sick (O.I.)',
                location: 'Forehead and Palms',
                icon: '🌿',
                badge: 'Anointing of the Sick & Last Rites',
                meaning: 'When a Christian is dangerously ill, elderly, or facing major surgery, the priest anoints the forehead and hands with Oleum Infirmorum. It imparts the Holy Spirit’s peace, forgives any unconfessed sins, heals physical ailments if God wills, and prepares the soul for passage into heaven.'
              },
              {
                step: '6. The Consecration of Church & Altar',
                oil: 'Sacred Chrism (S.C.)',
                location: 'The Altar Mensa & 12 Wall Crosses',
                icon: '⛪',
                badge: 'Dedication of a Catholic Church',
                meaning: 'When a new church building is consecrated, the Bishop pours litres of fragrant Chrism over the entire stone Mensa, rubbing it with his hands over five engraved crosses representing Christ’s wounds. He then walks around the nave anointing 12 bronze or stone wall crosses symbolizing the Twelve Apostles.'
              }
            ].map((milestone, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-sm shadow">
                  {milestone.icon}
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 hover:bg-slate-800/70 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base sm:text-lg font-serif font-bold text-white">
                      {milestone.step}
                    </h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                      {milestone.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-amber-400 font-mono">
                    <span>🏺 {milestone.oil}</span>
                    <span>📍 Anointed: {milestone.location}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                    {milestone.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: THE POCKET OIL STOCKS (STOCKS / CHRISMARIUM) */}
      {activeTab === 'stocks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-serif font-bold text-amber-200">
              The Priest's Pocket Oil Stocks (Olearium / Chrismarium)
            </h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              How does a parish priest minister to someone dying in an intensive care unit at 3:00 AM? He carries a consecrated silver or pewter pocket cylinder known as the <strong>Oil Stocks</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-800/50 border border-sky-500/30 relative">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-serif font-bold text-sky-400">Tier 1: [ I ]</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700">Top Chamber</span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-2">Oleum Infirmorum (Sick)</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Contains cotton wool soaked in the <strong>Oil of the Sick</strong>. The priest touches the saturated cotton with his right thumb and makes the Sign of the Cross on the forehead and hands of the sick.
              </p>
              <div className="mt-3 text-[11px] text-sky-300/80 bg-sky-950/40 p-2 rounded border border-sky-800/40">
                Hospital visits, hospice wards, palliative care, and emergency home calls.
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/50 border border-emerald-500/30 relative">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-serif font-bold text-emerald-400">Tier 2: [ B / C ]</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">Middle Chamber</span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-2">Catechumenorum (Baptism)</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Marked with <strong>B</strong> (Baptism) or <strong>C</strong> (Catechumens). Contains cotton wool soaked in O.C. for emergency bedside baptisms of infants or dying converts.
              </p>
              <div className="mt-3 text-[11px] text-emerald-300/80 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                Emergency baptisms in maternity wards and hospital incubators.
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/50 border border-amber-500/30 relative">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-serif font-bold text-amber-400">Tier 3: [ CHR ]</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">Bottom Chamber</span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-2">Sanctum Chrisma (Chrism)</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Marked with <strong>CHR</strong>. Saturated in fragrant balsam and olive oil. Used immediately following emergency baptism to complete the post-baptismal anointing.
              </p>
              <div className="mt-3 text-[11px] text-amber-300/80 bg-amber-950/40 p-2 rounded border border-amber-800/40">
                Post-baptismal crown anointing and emergency Confirmation.
              </div>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-5 text-sm text-slate-300 space-y-2">
            <h4 className="font-serif font-bold text-amber-300 flex items-center gap-2">
              <span>🧵</span> Why is Cotton Wool (*Bombax*) Used Inside the Stocks?
            </h4>
            <p className="leading-relaxed text-xs sm:text-sm">
              Because holy oil is a liquid, carrying it in pocket stocks would lead to leaks and spills. Saturated raw cotton wool holds the oil securely. When the priest presses his thumb firmly against the cotton, just enough holy oil transfers to his finger to anoint the recipient reverently without a drop falling to the floor.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: THE CHRISM MASS & ANNUAL RENEWAL */}
      {activeTab === 'chrismMass' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-amber-200">
              The Chrism Mass (Missa Chrismatis) & Reverent Disposal
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Every year during Holy Week, all three holy oils in every Catholic parish throughout the world are renewed. Here is the sacred liturgical theology behind this majestic diocesan gathering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
              <h4 className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
                <span>🕊️</span> 1. The Diocesan Family & Insufflatio
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The Chrism Mass is celebrated at the Diocesan Cathedral. The Bishop concelebrates with his entire presbyterate (priests) and deacons. All priests publicly renew their promises of ordination made on the day they were ordained.
              </p>
              <div className="p-3 rounded-lg bg-slate-900 text-xs text-amber-200 font-serif italic border border-slate-800">
                <strong>The Insufflatio:</strong> During the consecration of the Chrism, the Bishop solemnly breathes over the mouth of the vessel in the shape of a cross. This breathing recalls the Genesis creation (God breathing life into Adam) and Christ breathing the Holy Spirit upon the Apostles (John 20:22).
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
              <h4 className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
                <span>🔥</span> 2. What Happens to the Old Holy Oils?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Blessed holy oils are sacred sacramentals and cannot be poured down a kitchen sink or discarded into municipal drains. The Church prescribes strict rules for their reverent disposal:
              </p>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">🔥</span>
                  <span><strong>The Easter Vigil Fire:</strong> The old oils and their cotton waddings are burned in the new fire at the Easter Vigil service outside the church doors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">🌱</span>
                  <span><strong>The Sacrarium:</strong> If not burned, they are poured down the church <em>Sacrarium</em>—a special sink in the sacristy whose drain pipe goes directly into clean undisturbed earth, returning sacred matter to the ground.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-4">
            <span className="text-4xl">🏛️</span>
            <div>
              <h4 className="text-sm font-semibold text-amber-300">
                The Reception of the Holy Oils in Parishes (Holy Thursday Evening)
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Before the Mass of the Lord’s Supper on Holy Thursday evening, representatives carry the newly consecrated oils into the parish church in a solemn entrance procession, and they are placed into the Ambry with hymnody and thanksgiving.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SACRISTAN & LITURGICAL QUIZ */}
      {activeTab === 'quiz' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-2xl font-serif font-bold text-amber-200">
                Sacristan & Catechetical Holy Oils Challenge
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Test your knowledge of the Three Sacred Oils, their matter, forms, and sacramental functions.
              </p>
            </div>
            {Object.keys(quizAnswers).length === HOLY_OILS_QUIZ.length && (
              <button
                onClick={() => setScoreRevealed(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition"
              >
                Reveal Final Score ({calculateScore()}/{HOLY_OILS_QUIZ.length})
              </button>
            )}
          </div>

          {scoreRevealed && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-center animate-fadeIn">
              <div className="text-3xl font-serif font-bold text-amber-300">
                {calculateScore()} / {HOLY_OILS_QUIZ.length}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {calculateScore() === HOLY_OILS_QUIZ.length
                  ? '🌟 Perfect Score! You demonstrate master sacristan and liturgical knowledge!'
                  : 'Well done! Review the feedback below to deepen your liturgical understanding.'}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {HOLY_OILS_QUIZ.map((q, idx) => {
              const selectedOpt = quizAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={q.id} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      {idx + 1}. {q.question}
                    </h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                      Oil: {q.oilId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 border-slate-700';
                      if (isAnswered) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-950 text-emerald-200 border-emerald-500 font-semibold';
                        } else if (optIdx === selectedOpt) {
                          btnStyle = 'bg-red-950 text-red-200 border-red-500';
                        } else {
                          btnStyle = 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-lg text-left text-xs transition border flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && optIdx === q.correctIndex && <span>✓</span>}
                          {isAnswered && optIdx === selectedOpt && !isCorrect && <span>✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanations[q.id] && (
                    <div className="mt-2 text-xs p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 leading-relaxed">
                      💡 <strong>Catechetical Note:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HolyOilsExplorer;
